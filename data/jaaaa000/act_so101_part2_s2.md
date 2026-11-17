# jaaaa000/act_so101_part2_s2

## Resumen

`act_so101_part2_s2` es una política robótica basada en ACT (Action Chunking with Transformers) entrenada desde cero con LeRobot 0.6.0 por el usuario jaaaa000. No es un modelo de lenguaje: es un controlador visomotor que ejecuta una única tarea de manipulación sobre un brazo robótico SO-101, concretamente "poner la esponja azul en la bandeja derecha". El modelo consume dos flujos de cámara (vista superior y lateral, 640×480 a 30 fps) junto con las seis posiciones articulares del brazo, y emite secuencias de acciones motoras.

La relevancia de esta ficha es acotada y conviene ser explícito: se trata de un artefacto de investigación reproducible, no de un modelo de propósito general. Su interés radica en que documenta un flujo completo de imitación robótica de bajo coste (24 demostraciones teleoperadas, 46.000 pasos de entrenamiento en una única RTX 3060 de 12 GB) con un resultado declarado de 9 de 9 ensayos exitosos en el brazo real. Forma parte de una familia de cuatro modelos independientes, uno por frase de instrucción, porque ACT no procesa lenguaje.

El modelo tiene 51.668.614 parámetros (aproximadamente 51,7 M), un tamaño de repositorio de 0,2 GB y se distribuye en formato safetensors bajo licencia Apache 2.0. La arquitectura sigue el paper ACT (arXiv:2304.13705), que combina un transformer con un cuello de botella VAE y decodificación de trozos de acción (action chunking) para mitigar el error de composición en imitación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con cuello de botella VAE y decodificador de chunks de acción |
| Parametros totales | 51.668.614 (aproximadamente 51,7 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política visomotora; ventana de observación definida por el chunk de acción, no disponible en la información) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (el modelo no procesa lenguaje; no lee instrucciones en ningún idioma) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para imitación visomotora que predice un chunk de acciones futuras en lugar de una sola acción por paso. La arquitectura incorpora un codificador de observaciones (imágenes de las dos cámaras más el estado articular de seis dimensiones), un cuello de botella estilo VAE con una variable latente que captura la variabilidad de las demostraciones humanas, y un decodificador transformer que genera la secuencia de acciones. El chunking reduce el error de composición acumulado típico de las políticas paso a paso. La información proporcionada no detalla la configuración exacta de capas, dimensiones ocultas ni número de pasos del chunk.

El entrenamiento se realizó desde cero con LeRobot 0.6.0 sobre el dataset `jaaaa000/so101_part2`, restringido a las 24 demostraciones teleoperadas de esta frase (episodios 13-14, 16-23, 60-71 y 96-97). Se ejecutaron 46.000 pasos con batch size 8 en una única RTX 3060 de 12 GB, sin aumento de datos de imagen, y el checkpoint publicado es el último. En inferencia el autor emplea ensamblado temporal con `n_action_steps=1` y `temporal_ensemble_coeff=0.01`. No se documentan fases de RLHF, DPO ni ajuste por refuerzo.

## Capacidades

- Ejecución de una única tarea de manipulación: colocar la esponja azul en la bandeja derecha sobre un brazo SO-101.
- Control visomotor a partir de dos cámaras (superior y lateral) a 640×480 y 30 fps.
- Fusión de percepción visual con propiocepción: consume las seis posiciones articulares del brazo.
- Predicción de chunks de acción con ensamblado temporal para suavizar la ejecución.
- Generalización limitada a la distribución de las 24 demostraciones de entrenamiento.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni instrucciones en lenguaje natural.
- No dispone de capacidades multilingües, de visión general, audio ni modo de razonamiento.
- No es reutilizable como política para otras frases: la familia requiere un modelo separado por instrucción (s1, s3, s4).

## Casos de uso

- Reproducción de experimentos de imitación robótica: sirve como referencia de un pipeline ACT completo con LeRobot, desde la teleoperación hasta el despliegue, para validar recetas de entrenamiento en hardware de gama media.
- Manipulación pick-and-place de laboratorio: el modelo ejecuta de forma fiable el traslado de un objeto concreto entre dos contenedores, adecuado para tareas repetitivas de clasificación en un banco de pruebas controlado.
- Evaluación de ensamblado temporal: permite medir el efecto de `temporal_ensemble_coeff` y `n_action_steps` sobre la suavidad y la tasa de éxito en un brazo real.
- Docencia y formación en robótica de bajo coste: el entrenamiento cabe en una RTX 3060 de 12 GB, lo que lo hace viable en aulas y laboratorios con presupuesto limitado.
- Base para comparativas de arquitecturas: el autor publica un SmolVLA entrenado con los mismos datos, lo que permite contrastar una política sin lenguaje frente a una condicionada por instrucción.
- Punto de partida para ajuste fino: al estar en Apache 2.0 y formato safetensors, puede servir como inicialización para tareas similares con nuevos datasets teleoperados.
- Validación de infraestructura de despliegue robótico: útil para probar integraciones de LeRobot con ROS u otros middlewares antes de escalar a políticas mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados en la información disponible. El único dato de rendimiento es la evaluación en el brazo real declarada por el autor:

| Metrica | Resultado |
|---|---|
| Tasa de exito en el brazo real (esta frase) | 9 de 9 ensayos |
| Duracion por ensayo | 30 segundos, un intento por ensayo |
| Tasa de exito agregada de la familia (s1-s4) | 36 de 36 ensayos |

No hay datos de MMLU, HumanEval, GSM8K ni métricas equivalentes, que no aplican a una política visomotora.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB para los 51,7 M de parámetros en precisión completa; el repositorio completo ocupa 0,2 GB.
- GPU de entrenamiento utilizada: una RTX 3060 de 12 GB, con batch size 8 y 46.000 pasos.
- GPU recomendadas para entrenamiento: cualquier GPU consumer con 8 GB o más; para inferencia basta una GPU de gama baja o incluso CPU, aunque la latencia de control a 30 fps exige GPU.
- Cabe holgadamente en GPU consumer: RTX 3060, RTX 4060, RTX 4090 y equivalentes.
- Opciones de despliegue: LeRobot 0.6.0 como librería de referencia; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de política.
- Latencia y throughput: no disponibles; el control opera a 30 fps de entrada de cámara y el autor usa ensamblado temporal con coeficiente 0,01, pero no se publican tiempos de inferencia medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_so101_part2_s2 | 51,7 M | 2 camaras + 6 posiciones articulares | chunk de acción (no disponible) | Apache 2.0 | Hugging Face, lerobot |
| act_so101_part2_s1 | no disponible | 2 camaras + 6 posiciones articulares | chunk de acción (no disponible) | Apache 2.0 | Hugging Face, lerobot |
| act_so101_part2_s3 | no disponible | 2 camaras + 6 posiciones articulares | chunk de acción (no disponible) | Apache 2.0 | Hugging Face, lerobot |
| act_so101_part2_s4 | no disponible | 2 camaras + 6 posiciones articulares | chunk de acción (no disponible) | Apache 2.0 | Hugging Face, lerobot |
| smolvla_so101_part2 | no disponible | camaras + instruccion en lenguaje | no disponible | no disponible en la informacion | Hugging Face |

La comparativa relevante es interna a la familia: los cuatro modelos ACT cubren una frase cada uno y el SmolVLA cubre las cuatro mediante condicionamiento por lenguaje, entrenado con los mismos datos. No se dispone de cifras de parámetros ni de tasas de éxito del SmolVLA en la información proporcionada.

## Limitaciones y advertencias

- Sesgos: el modelo hereda los sesgos de las 24 demostraciones teleoperadas de un único operador, entorno e iluminación; no generaliza a otras colocaciones de objetos ni a otras cámaras.
- Alucinación: en el sentido robótico, puede ejecutar trayectorias plausibles pero incorrectas ante observaciones fuera de distribución, sin mecanismo de detección de fallo.
- Idioma: no procesa lenguaje natural; la instrucción se selecciona eligiendo el modelo adecuado, no mediante prompt.
- Contexto: no aplica ventana de texto; la política depende de la ventana de observación del chunk de acción, cuyo valor no se documenta.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo solo es funcional para una tarea y un robot concretos, por lo que su valor comercial directo es muy limitado.
- Producción: el resultado de 9 de 9 ensayos corresponde a una evaluación del propio autor, sin protocolo independiente ni repeticiones entre sesiones; debe tratarse como indicativo, no como garantía.
- Mantenimiento: repositorio con 0 descargas y 0 likes en el momento de la consulta, sin garantía de soporte ni actualizaciones.
- Dependencia de versión: entrenado con LeRobot 0.6.0; cambios de API en versiones posteriores pueden romper la carga del checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jaaaa000/act_so101_part2_s2
- Dataset de entrenamiento: https://huggingface.co/datasets/jaaaa000/so101_part2
- Modelo hermano s1: https://huggingface.co/jaaaa000/act_so101_part2_s1
- Modelo hermano s3: https://huggingface.co/jaaaa000/act_so101_part2_s3
- Modelo hermano s4: https://huggingface.co/jaaaa000/act_so101_part2_s4
- Alternativa SmolVLA con los mismos datos: https://huggingface.co/jaaaa000/smolvla_so101_part2
- Paper ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
