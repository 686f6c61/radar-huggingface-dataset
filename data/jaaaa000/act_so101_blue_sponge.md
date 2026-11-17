# jaaaa000/act_so101_blue_sponge

## Resumen

`act_so101_blue_sponge` es una política de control robótico basada en ACT (Action Chunking with Transformers), entrenada desde cero con LeRobot 0.6.0 por el usuario jaaaa000. No es un modelo de lenguaje: es un modelo de imitación que traduce observaciones visuales y proprioceptivas en acciones motoras de 6 grados de libertad para un brazo robótico SO-101. Resuelve una única tarea de pick-and-place: coger una esponja azul y depositarla en una bandeja blanca.

El modelo tiene 51.668.614 parámetros y se distribuye en formato safetensors dentro de un repositorio de 0,2 GB. Se entrenó con 53 demostraciones teleoperadas (todas las del dataset salvo 5) durante 30.000 pasos con batch size 8 en una única RTX 3060 de 12 GB, sin aumento de datos de imagen. La entrada son dos cámaras (superior y lateral, 640×480 a 30 fps) y las seis posiciones articulares del brazo.

Su relevancia es práctica y acotada: demuestra que una política ACT de tamaño medio puede ejecutarse y entrenarse en hardware de consumo, y sirve como referencia reproducible para quien quiera montar un pipeline de imitación con LeRobot sobre el brazo SO-101. El autor reporta 16 aciertos en 18 ensayos sobre el brazo real con temporal ensembling, aunque el modelo está fuertemente especializado en la apariencia de la esponja y la iluminación concretas del entorno de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de imitación) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo robótico, sin entrada/salida de texto) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un transformer encoder-decoder que predice un *chunk* de acciones futuras a partir de las observaciones actuales, en lugar de una sola acción por paso. El encoder procesa las imágenes de las dos cámaras y el estado articular; el decoder genera la secuencia de acciones de forma no autorregresiva, lo que reduce el error de acumulación y mejora la estabilidad del control. El modelo se entrenó desde cero con LeRobot 0.6.0, sin inicialización desde un checkpoint previo.

Los datos de entrenamiento son 53 demostraciones teleoperadas del dataset `so101_blue_sponge_v2_20261109_212801`, con dos cámaras a 640×480 y 30 fps y las seis posiciones articulares del brazo. El entrenamiento fue de 30.000 pasos con batch size 8 en una RTX 3060 de 12 GB, sin aumento de datos de imagen. No se reporta uso de RLHF, DPO ni técnicas de refinamiento posteriores; es imitación supervisada pura. El autor indica que este es el último checkpoint del entrenamiento.

## Capacidades

- Control motor de 6 grados de libertad para un brazo SO-101 en una tarea concreta de pick-and-place.
- Percepción visual a partir de dos cámaras (superior y lateral) a 640×480 y 30 fps.
- Fusión de observación visual con propriocepción (posiciones articulares) para generar acciones.
- Predicción de chunks de acciones, compatible con temporal ensembling en inferencia.
- Ejecución en tiempo real sobre hardware de consumo (entrenado en RTX 3060 de 12 GB).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, texto, visión general, audio ni modo thinking.

## Casos de uso

- Automatización de pick-and-place en laboratorio: el modelo coge la esponja azul y la deposita en la bandeja blanca, replicando la tarea de las 53 demostraciones. Adecuado para validar un pipeline completo de imitación con LeRobot antes de escalar a más objetos.
- Banco de pruebas de ACT sobre SO-101: sirve como referencia reproducible para comparar hiperparámetros, número de demostraciones o estrategias de aumento de datos, ya que el autor documenta pasos, batch size, hardware y resultado en el brazo real.
- Comparación de arquitecturas de imitación: el autor publica también `smolvla_so101_blue_sponge` entrenado con las mismas demos, lo que permite contrastar ACT frente a SmolVLA en igualdad de condiciones de datos.
- Docencia y formación en robótica de imitación: modelo pequeño (51,7 M de parámetros, 0,2 GB) que cabe en un portátil con GPU de consumo y permite recorrer el ciclo completo teleoperación, entrenamiento y despliegue.
- Evaluación de robustez ante variaciones de objeto e iluminación: el fallo documentado con esponja amarilla (0 de 4 ensayos) lo convierte en un caso útil para estudiar sensibilidad al dominio visual y diseñar estrategias de aumento de datos.
- Integración en flujos de control con temporal ensembling: el autor lo ejecutó con `n_action_steps=1` y `temporal_ensemble_coeff=0.01`, configuración que puede reutilizarse como línea base en despliegues reales con SO-101.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K u otros) en la información disponible. El único dato de rendimiento es la evaluación en el brazo real reportada por el autor:

| Metrica | Resultado |
|---|---|
| Tasa de exito en brazo real (esponja azul) | 16 de 18 ensayos |
| Protocolo | 9 posiciones iniciales de la esponja, cada una recta y girada 45°; 1 intento de 30 s por ensayo |
| Tasa de exito con esponja amarilla | 0 de 4 ensayos |
| Configuracion de inferencia | `--policy.n_action_steps=1 --policy.temporal_ensemble_coeff=0.01` |

## Requisitos de hardware

- Entrenamiento validado en una única RTX 3060 de 12 GB con batch size 8 durante 30.000 pasos.
- VRAM de inferencia estimada: no disponible de forma explícita; con 51,7 M de parámetros y dos flujos de vídeo a 640×480, es esperable que quepa holgadamente en GPUs de consumo de 8 GB o menos, aunque el autor no publica la cifra.
- GPU recomendadas: RTX 3060 12 GB (hardware de entrenamiento reportado); cualquier GPU consumer con al menos 8 GB debería ser suficiente para inferencia, si bien no está verificado en la información disponible.
- Cabe en GPU consumer: sí, según el hardware de entrenamiento reportado.
- Opciones de despliegue: LeRobot 0.6.0 (librería declarada en la model card); no se documentan otras integraciones como vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Tarea | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `act_so101_blue_sponge` | ACT | 51.668.614 | Pick-and-place esponja azul en SO-101 | 53 demos, 30.000 pasos, RTX 3060 | apache-2.0 | Hugging Face |
| `smolvla_so101_blue_sponge` | SmolVLA | no disponible | Misma tarea, mismas demos | mismas demos (segun model card) | no disponible | Hugging Face |
| Otros modelos ACT para SO-101 | ACT | no disponible | Tareas diversas | no disponible | no disponible | no disponible |

La comparación cuantitativa con alternativas no está disponible: la model card solo menciona el modelo SmolVLA entrenado con las mismas demostraciones, sin publicar métricas comparativas entre ambos.

## Limitaciones y advertencias

- Especialización extrema: el modelo solo funciona con la esponja azul, la posición de bandeja y la iluminación del entorno de entrenamiento. Con esponja amarilla falló los 4 ensayos realizados.
- Sin aumento de datos de imagen durante el entrenamiento, lo que probablemente agrava la sensibilidad a cambios de apariencia, color y condiciones de luz.
- Riesgo de sobreajuste a las 53 demostraciones y a las 9 posiciones iniciales evaluadas; no hay evidencia de generalización a otras posiciones u orientaciones del objeto.
- No es un modelo de lenguaje: no procesa texto, no tiene capacidades de razonamiento simbólico ni de tool calling, y no debe evaluarse con benchmarks de NLP.
- Sin datos publicados sobre sesgos, alucinación (en el sentido de acciones erróneas no verificadas) ni comportamiento fuera de distribución más allá del caso de la esponja amarilla.
- La licencia apache-2.0 permite uso comercial, pero la utilidad práctica del modelo está limitada a la tarea y el hardware concretos; cualquier despliegue en producción requeriría reentrenamiento con datos propios.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación externa de los resultados reportados.
- No se documentan requisitos de seguridad física para la operación del brazo; en un despliegue real deben añadirse límites de par, paradas de emergencia y supervisión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jaaaa000/act_so101_blue_sponge
- Dataset de entrenamiento: https://huggingface.co/datasets/jaaaa000/so101_blue_sponge_v2_20261109_212801
- Modelo SmolVLA con las mismas demos: https://huggingface.co/jaaaa000/smolvla_so101_blue_sponge
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
