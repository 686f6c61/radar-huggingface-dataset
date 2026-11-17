# jaaaa000/act_so101_part2_s1

## Resumen

`jaaaa000/act_so101_part2_s1` es una política robótica basada en ACT (Action Chunking with Transformers) entrenada desde cero con LeRobot 0.6.0 sobre un brazo SO-101. No es un modelo de lenguaje: es un modelo de imitación que mapea observaciones multimodales (dos cámaras y las seis posiciones articulares del brazo) a secuencias de acciones motoras. Su tarea es única y muy concreta: colocar la esponja azul en la bandeja izquierda, en un entorno de mesa con dos esponjas (azul y roja) y dos bandejas.

El modelo forma parte de una familia de cuatro políticas independientes (s1, s2, s3 y s4), una por cada frase de instrucción del mismo montaje experimental. Como ACT no procesa lenguaje, el autor selecciona manualmente el modelo correspondiente a la instrucción deseada antes de ejecutar. Con 51,7 millones de parámetros y un repositorio de 0,2 GB, es un modelo compacto pensado para control en tiempo real en hardware de consumo.

Su relevancia es práctica: demuestra que una política de imitación entrenada con solo 24 demostraciones teleoperadas y 46.000 pasos en una RTX 3060 puede alcanzar 9 de 9 ensayos exitosos en el brazo real, y 36 de 36 sumando los cuatro modelos de la familia. Es un caso reproducible de extremo a extremo para quien quiera montar un pipeline de robótica con LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política de imitación transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada compuesta por imágenes y estado articular) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

ACT es una arquitectura de imitación diseñada para predecir *chunks* de acciones (secuencias de varios pasos de control) en lugar de una única acción por inferencia, lo que reduce el error acumulado y mejora la estabilidad del control. El modelo consume dos flujos de cámara (vista superior y lateral, 640×480 a 30 fps) y las seis posiciones articulares del brazo SO-101, y produce comandos motores. El checkpoint publicado corresponde al paso final de un entrenamiento de 46.000 pasos con batch size 8.

Los datos provienen del dataset `jaaaa000/so101_part2`, concretamente los 24 episodios teleoperados asociados a esta frase (episodios 0-11 y 48-59). No se aplicó aumento de imágenes. En inferencia, el autor emplea *temporal ensembling* con `n_action_steps=1` y `temporal_ensemble_coeff=0.01`, técnica que promedia predicciones solapadas de chunks para suavizar la trayectoria. No se documenta uso de RLHF, DPO ni ajuste por refuerzo; es imitación supervisada pura.

## Capacidades

- Control robótico de imitación para una tarea fija: colocar la esponja azul en la bandeja izquierda.
- Fusión multimodal de dos cámaras (superior y lateral) con el estado propioceptivo del brazo (seis articulaciones).
- Predicción de chunks de acción con ensamblado temporal para ejecución suave.
- Operación en tiempo real a 30 fps de entrada de cámara.
- Ejecución autónoma de una política entrenada desde cero, sin componentes preentrenados.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje.
- No tiene capacidades multilingües ni modo de razonamiento explícito.

## Casos de uso

- Manipulación pick-and-place en laboratorio: el modelo recoge la esponja azul y la deposita en la bandeja izquierda, sirviendo como bloque base para experimentos de imitación reproducibles con SO-101.
- Banco de pruebas de LeRobot: al estar entrenado con LeRobot 0.6.0 y publicar el dataset, permite validar el pipeline completo (teleoperación, entrenamiento, despliegue) en una sola GPU de consumo.
- Comparación ACT frente a VLA: el autor entrena un SmolVLA sobre los mismos datos, lo que permite medir empíricamente la diferencia entre una política sin lenguaje y una que lee la instrucción.
- Enseñanza y formación en robótica: el modelo ilustra de forma tangible el flujo de imitación con 24 demostraciones y su evaluación en hardware real.
- Estudio de ensamblado temporal: los parámetros `temporal_ensemble_coeff` y `n_action_steps` documentados permiten reproducir y analizar el efecto del promediado de chunks en la estabilidad.
- Investigación en escalado de datos: al existir cuatro políticas hermanas con el mismo montaje, se puede estudiar cómo varía el rendimiento por tarea y la especialización por instrucción.
- Base para despliegues de bajo coste: con 51,7 M de parámetros y 0,2 GB, es viable en estaciones con GPU modesta para prototipos educativos o de laboratorio.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Tasa de exito en brazo real (frase 1) | 9 de 9 ensayos |
| Tasa de exito agregada (cuatro modelos) | 36 de 36 ensayos |
| Duracion por ensayo | 30 segundos |
| Pasos de entrenamiento | 46.000 |
| Batch size | 8 |
| Hardware de entrenamiento | 1× RTX 3060 (12 GB) |

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K u otros) en la informacion disponible; no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,7 M de parámetros y pesos safetensors, la huella es reducida y compatible con GPU de 12 GB como la RTX 3060 usada en entrenamiento.
- GPU recomendadas: RTX 3060 (12 GB) validada por el autor; cualquier GPU consumer con al menos 12 GB debería ser suficiente.
- Cabe en GPU de consumo: sí, confirmado en RTX 3060.
- Opciones de despliegue: LeRobot 0.6.0 (librería nativa); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a políticas robóticas.
- Latencia y throughput: entrada de cámara a 30 fps; no se publican cifras de latencia de inferencia ni throughput medidos.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Entrada de lenguaje | Licencia | Rendimiento reportado |
|---|---|---|---|---|---|
| act_so101_part2_s1 | ACT | 51,7 M | No | Apache 2.0 | 9/9 en su tarea |
| smolvla_so101_part2 | SmolVLA (VLA) | no disponible | Sí, lee la frase | no disponible | no disponible |
| act_so101_part2_s2/s3/s4 | ACT | 51,7 M (cada uno) | No | Apache 2.0 | 9/9 agregados en familia |

La comparación principal disponible es con SmolVLA, entrenado sobre los mismos 24 episodios y capaz de leer la instrucción, lo que elimina la necesidad de seleccionar manualmente entre cuatro políticas. No se dispone de cifras de rendimiento de SmolVLA en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: el modelo solo ejecuta una frase; no generaliza a otras instrucciones ni a otros objetos o posiciones.
- Sin comprensión de lenguaje: requiere seleccionar manualmente el checkpoint correcto entre los cuatro de la familia.
- Dependencia del entorno: entrenado con una disposición concreta de esponjas y bandejas; cambios de iluminación, fondo o colocación pueden degradar el rendimiento.
- Dataset pequeño: 24 demostraciones teleoperadas, sin aumento de imágenes, lo que limita la robustez ante variaciones.
- Riesgo de sobreajuste a la configuración de cámaras (superior y lateral, 640×480 a 30 fps) y al brazo SO-101 concreto.
- No se documentan sesgos sociales (no procesa texto ni datos personales), pero sí un posible sesgo de distribución hacia las trayectorias demostradas.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías de seguridad física en entornos reales.
- Caveat de producción: requiere supervisión y paradas de seguridad; el éxito reportado (9/9) proviene de un único montaje y no garantiza repetibilidad en otras instalaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jaaaa000/act_so101_part2_s1
- Dataset: https://huggingface.co/datasets/jaaaa000/so101_part2
- Modelos hermanos: https://huggingface.co/jaaaa000/act_so101_part2_s2, https://huggingface.co/jaaaa000/act_so101_part2_s3, https://huggingface.co/jaaaa000/act_so101_part2_s4
- Alternativa VLA: https://huggingface.co/jaaaa000/smolvla_so101_part2
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
