# myx160/pi05-pap-merged-rtc

## Resumen

Pi0.5 PAP merged-data RTC policy es un checkpoint de política robótica (vision-language-action, VLA) desarrollado por el usuario myx160 sobre la base de OpenPI de Physical Intelligence. Se trata de un ajuste fino de un modelo Pi0.5 previo (myx160/pi05-pap-rtc) entrenado con un dataset fusionado de 403 episodios de manipulación robótica (105.742 frames). El modelo resuelve el problema de generar comandos de acción absolutos a partir de tres cámaras RGB, el estado medido del robot y una instrucción de tarea en texto.

El checkpoint publicado corresponde al paso global 27.500, es decir, 12.500 actualizaciones adicionales sobre el modelo original de paso 15.000. El entrenamiento continúa hacia el paso 35.000, por lo que esta es una release intermedia. La arquitectura es un transformer VLA de 3.353.433.872 parámetros entrenado en JAX, con una dimensión de acción interna de 32 y dimensión robótica de 16. Incorpora adaptaciones locales de RTC (real-time chunking) y PAP en tiempo de entrenamiento.

Su relevancia radica en que publica no solo los pesos, sino un runtime completo con dependencias fijadas, tokenizer local, ejemplos de servidor y cliente, y un ejemplo offline reproducible. Esto facilita la evaluación de la política sin necesidad de descargar el dataset de entrenamiento ni tokens de red. Es un modelo de nicho, orientado a investigación en robótica, no a uso general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer VLA (Pi0.5) con adaptaciones RTC y PAP en entrenamiento |
| Parametros totales | 3.353.433.872 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el runtime incluye runtime/OPENPI_LICENSE) |
| Formato de pesos | Orbax (directorio `params/`); ejemplo offline en NPZ |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de parámetro completo en JAX sobre la arquitectura Pi0.5 de OpenPI (commit 215abfb217dbac7d5f1273282331b9b1866c0479), con adaptaciones locales de RTC y PAP en tiempo de entrenamiento. La dimensión de acción interna es 32 y la dimensión robótica es 16; los primeros 14 joints se codifican como deltas internamente, mientras que los grippers permanecen absolutos. El horizonte de acción es 24 a 30 Hz, compuesto por un prefijo limpio de 12 comandos y un postfijo predicho de 12.

El entrenamiento se realizó con dos GPUs A100 de 80 GB, paralelismo de datos puro, batch de 96 (48 por GPU), recomputación de activaciones y EMA desactivada. Se usaron los 403 episodios completos (105.742 frames) del dataset myx160/pap_1112_1116_merged. Se restauró el modelo original de paso 15.000 junto con el estado de Adam, se aplicó un warmup de 1.000 pasos hasta 2.5e-5 y después un decaimiento coseno hasta 2.5e-6 en el paso global 35.000, con guardado cada 2.500 actualizaciones. Las tres cámaras de entrada son cam_left_high, cam_left_wrist y cam_right_wrist. El estado de Adam se excluye de la release.

## Capacidades

- Generación de comandos de acción robótica absolutos a partir de tres imágenes RGB, estado medido [16] y texto de tarea.
- Predicción de horizonte de acción de 24 comandos (prefijo comprometido de 12 + postfijo predicho de 12) a 30 Hz.
- Codificación interna de deltas para los primeros 14 joints y valores absolutos para los grippers.
- Soporte de inferencia en CPU y GPU mediante runtime propio (JAX), con verificación de preprocesado y smoke test.
- Servidor HTTP y cliente de ejemplo incluidos para despliegue local.
- No se documentan capacidades de tool calling, agentes, multilingüismo, visión general, audio ni thinking mode.

## Casos de uso

- Manipulación robótica de laboratorio: la política genera comandos de acción a 30 Hz a partir de tres cámaras y el estado del robot, adecuada para tareas de pick-and-place en entornos controlados con el robot para el que se entrenó.
- Replay y validación offline: el ejemplo `synthetic_request.npz` y las referencias de preprocesado y salida permiten comparar el comportamiento del checkpoint en CPU antes de desplegarlo en hardware real.
- Investigación en VLA: sirve como checkpoint intermedio para estudiar el efecto del ajuste fino con datos fusionados y las adaptaciones RTC/PAP sobre un modelo Pi0.5 base.
- Integración en pipelines de evaluación: el servidor HTTP y el cliente de ejemplo permiten conectar la política a un bucle de control externo o a un simulador que consuma comandos absolutos.
- Desarrollo de sistemas de control con cola de comandos: el modelo entrega un prefijo limpio y un postfijo predicho, lo que encaja en arquitecturas que mantienen una cola de comandos y solo añaden el postfijo.
- Reproducción de experimentos: las dependencias fijadas (`uv.lock`, `requirements.lock`), el tokenizer local y `provenance.json` permiten reproducir la inferencia sin descargar el dataset ni tokens de red.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que el éxito en tareas robóticas y la generalización a datos no vistos no han sido evaluados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el entrenamiento usó dos A100 de 80 GB con batch 96 y recomputación de activaciones, lo que da una idea del orden de magnitud.
- GPUs recomendadas: A100 80 GB para entrenamiento; para inferencia se documenta una GPU NVIDIA con driver compatible con los wheels CUDA12 fijados.
- Cabe en GPU consumer: no confirmado en la información disponible.
- Despliegue: runtime propio basado en JAX con `uv sync`, `runtime/serve.py` (servidor HTTP) y `runtime/client_example.py`; también inferencia en CPU con `JAX_PLATFORMS=cpu`.
- Latencia y throughput: no disponibles. La política opera a 30 Hz según la interfaz, pero no se documentan métricas de latencia medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| myx160/pi05-pap-merged-rtc | 3.353.433.872 | no disponible | no disponible | Hugging Face, checkpoint paso 27.500 |
| myx160/pi05-pap-rtc (base) | no disponible | no disponible | no disponible | Hugging Face, paso 15.000 |
| OpenPI (Physical Intelligence) | no disponible | no disponible | ver runtime/OPENPI_LICENSE | GitHub, open source |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint intermedio: el entrenamiento continúa hacia el paso 35.000; esta release no es el modelo final.
- Éxito en tareas robóticas y generalización a datos no vistos no evaluados.
- Todas las 403 episodios se usaron para entrenamiento, sin conjunto de validación independiente documentado.
- Las estadísticas de normalización deben ser las de `pap_merged_gripper_v3` incluidas en el snapshot; no se deben sustituir por las del modelo antiguo.
- El dataset almacena los grippers en unidades 0–1, mientras que el runtime acepta unidades originales del robot; para replay del dataset hay que usar los campos auxiliares en bruto.
- El resultado de inferencia en CPU no es criterio de aceptación bit a bit para GPU; los valores del postfijo pueden diferir entre versiones de GPU y compilador.
- El paquete no implementa planificación de cola del robot ni control de arranque en frío.
- Licencia no disponible en la información proporcionada; el runtime incluye `runtime/OPENPI_LICENSE`, que debe revisarse antes de uso comercial.
- Sesgos y riesgo de alucinación: no documentados; al ser un modelo de acción, el riesgo relevante es de comandos incorrectos en hardware real.
- Requiere Linux x86_64, Python 3.11, uv y driver NVIDIA compatible con los wheels CUDA12 fijados.

## Enlaces

- Hugging Face: https://huggingface.co/myx160/pi05-pap-merged-rtc
- Modelo base: https://huggingface.co/myx160/pi05-pap-rtc
- Dataset: https://huggingface.co/datasets/myx160/pap_1112_1116_merged
- OpenPI (GitHub): https://github.com/Physical-Intelligence/openpi
- Interfaz: INTERFACE.md (incluido en el repositorio)
- Ejemplo offline: runtime/examples/synthetic_request.npz (incluido en el repositorio)
