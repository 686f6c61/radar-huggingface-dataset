# MrDuarte/smolvla-WarehousePick-v0-Sim-DigitalTwin

## Resumen

MrDuarte/smolvla-WarehousePick-v0-Sim-DigitalTwin es un modelo de visión-lenguaje-acción (VLA) de la familia SmolVLA, fine-tuneado por MrDuarte sobre el checkpoint preentrenado `lerobot/smolvla_base`. Se trata de una política de aprendizaje por imitación para un brazo robótico `so101_follower`, entrenada con el dataset `MrDuarte/WarehousePick-v0-Sim-DigitalTwin`, que consta de 82 episodios y 57.235 fotogramas a 30 FPS. La tarea consiste en levantar todos los paquetes y colocarlos en la caja verde dentro de un gemelo digital de un almacén.

El modelo tiene 450.046.176 parámetros y un tamaño de checkpoint de 1.2 GB en formato safetensors. Al ser un VLA compacto, está diseñado para ejecutarse en hardware de consumo, lo que lo hace útil para prototipado y despliegue de robots en entornos de investigación o logística. La arquitectura es la de SmolVLA, un modelo de visión-lenguaje-acción eficiente que reduce costes computacionales manteniendo un rendimiento competitivo, tal como se describe en el paper 2506.01844.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Visión-Lenguaje-Acción (VLA) - SmolVLA |
| Parámetros totales | 450.046.176 (450 M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |
| Tamaño del checkpoint | 1.2 GB |
| Modelo base | lerobot/smolvla_base |
| Librería | LeRobot |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura SmolVLA, un modelo de visión-lenguaje-acción compacto cuyo objetivo es lograr un rendimiento competitivo a un coste computacional reducido. Este checkpoint concreto es un fine-tuning del modelo base `lerobot/smolvla_base`, realizado con la librería LeRobot. La política codifica tres entradas visuales (`innomaker`, `intel_rgb` y `front`) junto con el estado del robot (6 dimensiones) y genera una acción de 6 dimensiones.

El entrenamiento se realizó sobre el dataset `MrDuarte/WarehousePick-v0-Sim-DigitalTwin`, que contiene 82 episodios y 57.235 fotogramas a 30 FPS. La configuración de entrenamiento incluye 20.000 pasos, un tamaño de lote de 28, optimizador AdamW, tasa de aprendizaje 0.0001 y semilla 1000. No se mencionan técnicas como RLHF o DPO; el entrenamiento es de aprendizaje por imitación supervisado.

## Capacidades

- Control robótico de 6 grados de libertad: genera comandos de acción de 6 dimensiones a partir del estado y de las imágenes de tres cámaras.
- Entrada multimodal: procesa simultáneamente tres flujos de imagen con resoluciones de 720x1280 (`innomaker`), 424x240 (`intel_rgb`) y 720x1280 (`front`).
- Integración con LeRobot: compatible con los comandos `lerobot-rollout` y `lerobot-train`, por lo que puede desplegarse y reentrenarse dentro del ecosistema LeRobot.
- Tarea especializada: política de picking y colocación en un almacén simulado, con la instrucción "Lift all parcels and put them in the Green Box".
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso ni capacidades de texto o visión más allá de la tarea robótica.
- El modelo no es un modelo de lenguaje genérico: no produce texto ni mantiene conversaciones.

## Casos de uso

- **Automatización de picking en almacenes simulados**: el modelo puede gobernar un brazo `so101_follower` para levantar paquetes y depositarlos en la caja verde. Es adecuado para prototipos de logística en gemelos digitales, donde la política se prueba con `lerobot-rollout` antes de tocar hardware real.
- **Investigación en aprendizaje por imitación**: al estar documentado el dataset (82 episodios, 57.235 fotogramas), la configuración (20.000 pasos, batch 28, AdamW) y el modelo base, este checkpoint es un caso reproducible para estudiar cómo un VLA compacto se adapta a una tarea de manipulación.
- **Prototipado de robots de bajo coste**: con 450 millones de parámetros, la inferencia puede ejecutarse en GPUs de consumo, lo que permite a laboratorios con presupuesto limitado validar políticas de manipulación sin depender de servidores con múltiples A100 o H100.
- **Formación en robótica**: el flujo completo de LeRobot (instalación, calibración, recopilación de datos, entrenamiento e inferencia) puede ejemplificarse con este modelo, ya que está integrado en la documentación oficial de SmolVLA.
- **Evaluación de brecha sim-to-real**: el dataset procede de un gemelo digital (DigitalTwin); el modelo permite comparar el comportamiento en simulación con el del robot real, aunque no haya resultados de evaluación publicados.
- **Base para fine-tuning en tareas similares**: partiendo de este checkpoint se puede reentrenar para otros objetos, cajas o configuraciones de cámaras, modificando el dataset y ajustando el número de pasos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica expresamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada: no disponible en la información oficial. El checkpoint safetensors ocupa 1.2 GB en disco; para inferencia en FP16/INT8 se necesitaría, como estimación, menos de 4 GB de VRAM, pero no hay confirmación.
- GPU recomendadas: no disponible. El entrenamiento se realizó con CUDA (`--policy.device=cuda`), por lo que se requiere una GPU NVIDIA para ejecutar la política con LeRobot.
- Compatibilidad con GPUs de consumo: probable, dado el tamaño del checkpoint (450 M de parámetros); sin embargo, no hay datos oficiales que lo confirmen.
- Opciones de despliegue: LeRobot (comandos `lerobot-rollout` para inferencia y `lerobot-train` para reentrenamiento). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de texto.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Entrenamiento | Licencia |
|---|---|---|---|---|
| MrDuarte/smolvla-WarehousePick-v0-Sim-DigitalTwin | 450.046.176 | Picking en almacén simulado | Fine-tuning, 20.000 pasos | Apache 2.0 |
| lerobot/smolvla_base | No disponible | Preentrenamiento VLA | No disponible | Apache 2.0 |

No se dispone de información suficiente en la búsqueda para comparar este checkpoint con otros modelos VLA como OpenVLA o RT-2. La comparación más directa es con el modelo base del que se deriva, pero sus especificaciones completas no están disponibles en la fuente.

## Limitaciones y advertencias

- No hay resultados de evaluación: se desconoce la tasa de éxito de la tarea en el robot físico o en el gemelo digital.
- Sobreajuste al entorno de entrenamiento: el dataset tiene solo 82 episodios, por lo que la política puede estar muy especializada en las condiciones del DigitalTwin y fallar ante variaciones inesperadas.
- Brecha sim-to-real: al entrenarse únicamente con datos simulados, el rendimiento en un robot real puede degradarse si la iluminación, las cámaras o la dinámica de la manipulación difieren.
- Dependencia de la configuración de hardware: el modelo espera exactamente las cámaras `innomaker`, `intel_rgb` y `front`, con los estados del robot `so101_follower`; cambiar la configuración requiere reentrenar.
- Sin soporte de lenguaje o visión general: no es un modelo de lenguaje; no se pueden pedir respuestas de texto ni razonamiento abstracto.
- Licencia Apache 2.0: permite uso comercial y modificaciones, pero exige mantener el aviso de licencia y documentar los cambios realizados. No ofrece garantías.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/MrDuarte/smolvla-WarehousePick-v0-Sim-DigitalTwin
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/MrDuarte/WarehousePick-v0-Sim-DigitalTwin
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación general de LeRobot: https://huggingface.co/docs/lerobot/index
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=MrDuarte/WarehousePick-v0-Sim-DigitalTwin
