# ohevance/act_svla_so101_pickplace_2k

## Resumen

`ohevance/act_svla_so101_pickplace_2k` es un checkpoint de la política ACT (Action Chunking with Transformers) entrenado con LeRobot 0.7.0 sobre el dataset público `lerobot/svla_so101_pickplace`, orientado a control robótico de tipo pick-and-place con el brazo SO-101. No es un modelo de lenguaje ni un modelo fundacional: es un policy network que mapea observaciones visuales y estados de articulaciones a secuencias de acciones motoras. Su relevancia es exclusivamente instrumental: el autor lo publica como prueba de humo de un pipeline de entrenamiento (alquiler de servidor GPU, instalación, entrenamiento, descarga y subida), no como un modelo funcional.

El modelo tiene 51.668.614 parámetros según los pesos en safetensors (la model card indica 51.597.190, una discrepancia menor atribuible al conteo con o sin buffers). Se entrenó durante solo 2.000 pasos con batch de 8, lo que equivale a aproximadamente 1,34 épocas sobre las 11.939 muestras del dataset. El autor advierte explícitamente de que no se ha evaluado en un robot real y de que no se espera que complete la tarea.

Por tanto, esta ficha debe leerse como documentación de un artefacto de verificación de infraestructura, no como una evaluación de capacidades robóticas. Es útil para quien quiera reproducir el flujo de entrenamiento de ACT con LeRobot o inspeccionar el formato de checkpoints de la librería.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política de imitación con backbone visual ResNet-18 |
| Parametros totales | 51.668.614 (safetensors); 51.597.190 según model card |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (política robótica; chunk_size de 100 pasos de acción) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

ACT es una política de imitación basada en transformer que predice trozos (chunks) de acciones futuras en lugar de una única acción por paso, lo que reduce el error de acumulación y suaviza el control. En esta configuración se usan los valores por defecto de LeRobot 0.7.0: `chunk_size` de 100, backbone visual ResNet-18 y dos cámaras de entrada a 480×640. El modelo consume observaciones (imágenes y estado de articulaciones) y produce secuencias de comandos motores para el brazo SO-101.

El entrenamiento se realizó sobre `lerobot/svla_so101_pickplace` (11.939 fotogramas, dos cámaras) durante 2.000 pasos con batch de 8, es decir, unas 1,34 épocas. Se ejecutó en una única NVIDIA T4 de 16 GB con PyTorch 2.15.0 (CUDA 13.2), con un consumo máximo de 4.649 MiB de VRAM, una duración total de 1.116 segundos (incluyendo preparación) y un throughput de 1,81 pasos por segundo. La loss bajó de 6,399 en el paso 200 a 1,174 en el paso 2.000. No se aplicó RLHF, DPO ni ningún refinamiento posterior; es imitación supervisada pura y truncada.

## Capacidades

- Predicción de chunks de acción de hasta 100 pasos para control de un brazo robótico SO-101 en tareas de pick-and-place.
- Procesamiento de dos flujos de cámara a 480×640 mediante backbone ResNet-18.
- Fusión de observaciones visuales y estado de articulaciones para generar comandos motores.
- Integración nativa con el ecosistema LeRobot 0.7.0 (entrenamiento, evaluación e inferencia).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Verificación de pipelines de entrenamiento: sirve para comprobar de extremo a extremo el flujo `lerobot-train` → guardado → subida a Hugging Face, tal como hizo el autor.
- Prueba de inferencia y conversión de checkpoints: permite validar la carga de pesos safetensors en LeRobot y la ruta de conversión a otros formatos antes de entrenar en serio.
- Referencia de configuración de ACT: útil como plantilla de hiperparámetros (chunk_size 100, ResNet-18, batch 8) para experimentos propios con SO-101.
- Benchmark de requisitos de hardware: los datos de VRAM (4.649 MiB en T4) y throughput (1,81 pasos/s) permiten dimensionar servidores para entrenamientos más largos.
- Docencia y ejemplos de imitación robótica: ilustra el formato de un checkpoint ACT y su relación con el dataset de origen.
- Depuración de errores de shape y preprocesado: al ser un checkpoint mínimo, ayuda a aislar fallos de carga o de pipeline sin la variabilidad de un modelo entrenado largo.
- No es adecuado para despliegue en producción ni para ejecutar la tarea real de pick-and-place.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta métricas de entrenamiento: loss de 6,399 (paso 200) a 1,174 (paso 2.000), 1,81 pasos/s, 4.649 MiB de VRAM máxima y 1.116 s de tiempo total en una T4. No hay evaluación en robot ni tasa de éxito de la tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el entrenamiento consumió 4.649 MiB en una T4 de 16 GB, por lo que la inferencia debería caber holgadamente en GPUs de 8 GB o menos.
- GPU recomendadas: NVIDIA T4 (validada por el autor), y por tamaño cualquier GPU consumer moderna (RTX 3060, 4060, 4090) debería ser suficiente.
- Cabe en GPU consumer: sí, con alta probabilidad, dado el tamaño del modelo (51,7 M de parámetros) y el consumo medido en entrenamiento.
- Opciones de despliegue: LeRobot 0.7.0 (librería nativa); no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: 1,81 pasos/s en entrenamiento con T4 y batch 8; no se reporta latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / chunk | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ohevance/act_svla_so101_pickplace_2k | 51,7 M | chunk 100 | Pick-and-place SO-101 (smoke test) | Apache 2.0 | Hugging Face |
| Políticas ACT de LeRobot (checkpoints de referencia) | no disponible | chunk configurable | Imitación robótica genérica | Apache 2.0 | Hugging Face / LeRobot |
| Diffusion Policy (referencia LeRobot) | no disponible | horizonte configurable | Imitación robótica | Apache 2.0 | Hugging Face / LeRobot |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada; la comparación es únicamente estructural.

## Limitaciones y advertencias

- Checkpoint de prueba de humo: solo 2.000 pasos (≈1,34 épocas); el autor indica explícitamente que no se espera que realice la tarea.
- No evaluado en robot real: no hay métricas de éxito ni validación física.
- Sesgos conocidos: no documentados; al entrenarse con un único dataset y un único entorno, cualquier generalización fuera de él es improbable.
- Riesgo de alucinación: no aplica en el sentido de lenguaje, pero sí de acciones incorrectas o inseguras si se desplegara sin validación.
- Limitaciones de contexto o idioma: no aplica; no es un modelo de lenguaje.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el estado del checkpoint lo hace inadecuado para producción independientemente de la licencia.
- Caveat importante: la discrepancia entre el conteo de parámetros de la model card (51.597.190) y los safetensors (51.668.614) sugiere posibles diferencias de configuración; conviene verificar al cargar.
- No usar como base para afirmaciones sobre el rendimiento de ACT en general: es un artefacto de infraestructura, no un resultado científico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ohevance/act_svla_so101_pickplace_2k
- Dataset de entrenamiento: https://huggingface.co/datasets/lerobot/svla_so101_pickplace
- Repositorio del autor con el proceso y las decisiones: https://github.com/ohevance/so101-robot-systems
- LeRobot (librería): https://github.com/huggingface/lerobot
