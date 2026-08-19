# angkul07/mm_SO101_teleop

## Resumen

`angkul07/mm_SO101_teleop` es un conjunto de dos fine-tunes del modelo de visión-lenguaje-acción (VLA) SmolVLA, desarrollado por el usuario de Hugging Face angkul07, sobre el robot de bajo coste SO-101. El objetivo es comparar dos estrategias de entrenamiento para una tarea de pick-and-place (coger un cubo azul y colocarlo en una caja naranja): una entrenada exclusivamente con teleoperación real (`teleop100`) y otra con una mezcla 50/50 de teleoperación y datos egocéntricos retargeteados (`mix5050`). Ambos modelos parten de `lerobot/smolvla_base` con hiperparámetros idénticos, lo que permite aislar el efecto del tipo de datos en el rendimiento final.

El modelo es relevante porque aborda una pregunta clave en el aprendizaje por imitación robótica: si los datos egocéntricos (grabados desde la perspectiva del robot) pueden complementar o sustituir parcialmente a la teleoperación manual, que es costosa y lenta. El repositorio incluye no solo los checkpoints, sino también la suite de evaluación offline completa, los configs de entrenamiento y las métricas detalladas, lo que lo convierte en un recurso útil para investigadores que trabajan con SmolVLA, LeRobot o VLA en general. La licencia Apache 2.0 facilita su reutilización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (Vision-Language-Action transformer con flow matching) |
| Parametros totales | 450 M (100 M entrenables) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada multimodal: imagen + instruccion textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (probablemente ingles para instrucciones, no confirmado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un VLA compacto de 450 millones de parametros que combina un encoder de vision congelado con un transformer de lenguaje y un cabezal de accion basado en flow matching. En este proyecto, el encoder de vision permanece congelado y solo se entrenan los 100 millones de parametros del cabezal de accion y las capas de atencion cruzada. El flujo de entrenamiento sigue el esquema de LeRobot v3.0: prediccion de acciones por chunks de 50 pasos, tasa de aprendizaje 1e-4 con decaimiento coseno durante 20.000 pasos y 1.000 pasos de warmup, en precision bf16.

Los datos de entrenamiento provienen de dos fuentes: teleoperacion real del SO-101 (193 episodios, 54.275 frames) y datos egocéntricos retargeteados desde el dataset EgoDex (324 episodios, 72.986 frames en la mezcla). El modelo `teleop100` se entrena solo con teleoperacion, mientras que `mix5050` combina ambos tipos por frames en proporcion 50/50. El batch efectivo es de 64 (16 por GPU en 4 RTX 4090). La perdida final de entrenamiento es 0.047 para `teleop100` y 0.044 para `mix5050`. No se midio la validacion en el modelo mixto durante el entrenamiento debido a la estructura del dataset (91 tareas), por lo que la comparacion se realiza a posteriori con la misma suite offline.

## Capacidades

- Control de robot manipulador SO-101 para tareas de pick-and-place (coger cubo azul, colocarlo en caja naranja).
- Generacion de acciones por flow matching a partir de observaciones visuales e instrucciones textuales.
- Soporte de co-training con datos heterogeneos (teleoperacion y egocentricos).
- Evaluacion offline con metricas especializadas: action MSE/MAE, CI-MSE (critical interval MSE) por fases (grasp, release, full episode) y penalizacion por perturbaciones.
- Inferencia determinista si se fija la semilla (el flow matching parte de ruido aleatorio).
- Compatible con LeRobot v3.0 y el ecosistema de evaluacion de `fd-studio/eval`.

## Casos de uso

- Investigacion en aprendizaje por imitacion: comparar el efecto de mezclar datos egocentricos con teleoperacion en VLA. El modelo proporciona dos checkpoints con la unica diferencia en la mezcla de datos, ideal para estudios controlados.
- Desarrollo de politicas visuomotoras para robots de bajo coste: SO-101 es una plataforma accesible y el modelo demuestra que es posible entrenar una politica funcional con menos de 200 episodios de teleoperacion.
- Evaluacion de robustez: la suite incluye pruebas de perturbacion (penalizacion MSE/MAE ante perturbaciones) que permiten medir la tolerancia a errores de percepcion o ejecucion.
- Benchmarking de VLA en tareas de manipulacion: los resultados con CI-MSE por fases (grasp, release) ofrecen una descomposicion util para diagnosticar en que parte de la tarea falla cada modelo.
- Transferencia de datos egocentricos a teleoperacion: el co-entrenamiento con datos retargeteados de EgoDex muestra mejoras en la media del error (especialmente en grasp), lo que sugiere que los datos egocentricos pueden complementar a la teleoperacion.
- Reproducibilidad de experimentos: el repositorio incluye configs, logs y scripts de evaluacion completos, facilitando la replicacion exacta de los resultados.

## Benchmarks y rendimiento

Los resultados corresponden a 6 episodios de validacion mantenidos (1.622 frames) que nunca se usaron en entrenamiento. Los errores estan en grados nativos (los postprocesadores desnormalizan), por lo que son directamente comparables entre modelos.

| Metrica | `teleop100` | `mix5050` | Mejor |
|---|---|---|---|
| Action MSE (limpio) | 146.83 | **142.82** | mix (−2.7 %) |
| Action MAE (limpio) | **5.840°** | 6.194° | teleop (−5.7 %) |
| CI-MSE media (intervalos criticos) | 50.28 | **46.70** | mix (−7.1 %) |
| CI-MSE mediana | **23.75** | 30.53 | teleop (−22.2 %) |
| CI-MSE intervalo grasp | 60.43 | **52.19** | mix (−13.6 %) |
| CI-MSE intervalo release | **38.09** | 43.12 | teleop (−11.7 %) |
| CI-MSE episodio completo, media | 59.96 | **48.82** | mix (−18.6 %) |
| CI-MSE episodio completo, mediana | **21.43** | 24.26 | teleop (−11.7 %) |
| Penalizacion MAE por perturbacion | **+32.4 %** | +35.4 % | teleop |
| Penalizacion MSE por perturbacion | **+30.2 %** | +42.6 % | teleop |

El patron principal es que el co-entrenamiento con datos egocentricos reduce los errores medios (cola de la distribucion) pero empeora la precision tipica (mediana). El efecto mas claro es en la fase de grasp (−13.6 %), mientras que release empeora (+11.7 %). La variabilidad por semilla es del orden del 1.5 % (146.83 / 147.28 / 148.98 en tres repeticiones sin semilla fija), por lo que las diferencias entre modelos deben interpretarse con cautela.

## Requisitos de hardware

- Entrenamiento: 4× RTX 4090 (batch efectivo 64, 16 por GPU). No se especifica el tiempo total.
- Inferencia: no se proporcionan requisitos explicitos. Dado que el modelo tiene 450 M de parametros en bf16 (~900 MB), cabe en GPUs consumer de 8 GB o mas. Se puede ejecutar en una RTX 3060/4060 o superior.
- Despliegue: compatible con LeRobot (libreria principal), que soporta inferencia en GPU. No se mencionan vLLM, Ollama ni TGI, ya que no es un modelo de lenguaje puro sino un VLA.
- Latencia y throughput: no disponibles. La inferencia de un VLA tipicamente requiere procesar una imagen y generar una secuencia de acciones (chunk de 50 pasos), con latencia del orden de decenas de milisegundos en GPU moderna, pero no hay mediciones en este repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `angkul07/mm_SO101_teleop` (este) | 450 M | no disponible | Fine-tune de SmolVLA con teleop y ego | Apache 2.0 | Hugging Face |
| `lerobot/smolvla_base` | 450 M | no disponible | Pre-entrenamiento general | Apache 2.0 | Hugging Face |
| `makermods/smolvla_200ep_blue_cube_orange_box` | 450 M | no disponible | Fine-tune de SmolVLA solo con teleop (200 eps) | Apache 2.0 | Hugging Face |

No se dispone de comparativas con otros VLA (OpenVLA, RT-2, etc.) porque los benchmarks no son comparables entre plataformas roboticas distintas. La comparacion mas relevante es entre los dos checkpoints de este repositorio y el modelo base, que ya se cubre en la seccion de benchmarks.

## Limitaciones y advertencias

- Evaluacion limitada: solo 6 episodios de validacion (1.622 frames). Las conclusiones sobre diferencias entre modelos son estadisticamente fragiles.
- Sesgo de la muestra: los datos de teleoperacion provienen de un unico operador y una unica tarea. No hay evidencia de generalizacion a otras tareas o entornos.
- Variabilidad por semilla: el flow matching parte de ruido aleatorio, y la diferencia entre modelos (~1.5 % en MSE) es del mismo orden que la variabilidad entre semillas. Los resultados deben interpretarse con cautela.
- El modelo mixto no tuvo validacion durante el entrenamiento, por lo que no se sabe si hubo overfitting o si la curva de validacion fue estable.
- No se proporcionan pruebas en el mundo real (solo evaluacion offline con metricas proxy). El rendimiento en el robot fisico puede diferir.
- Idiomas: no se especifica, pero probablemente solo soporta instrucciones en ingles (no confirmado).
- Sin cuantizacion disponible: los pesos estan en safetensors en bf16, sin versiones GGUF o AWQ publicadas.
- Licencia Apache 2.0 permite uso comercial, pero el dataset egocentrico (EgoDex) puede tener restricciones adicionales que no se detallan en este repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/angkul07/mm_SO101_teleop
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de teleoperacion: https://huggingface.co/datasets/makermods/200ep_blue_cube_orange_box
- Dataset egocentrico (EgoDex retargeteado): https://huggingface.co/angkul07/ego-data (inferido, no confirmado en la busqueda)
- Framework de generacion de datos sinteticos para SO-101: https://github.com/mariobo8/so101-datasets
- Workflow de sim-to-real con SO-101: https://github.com/BioModel-AI/Sim-to-Real-B601_BM-Workshop
