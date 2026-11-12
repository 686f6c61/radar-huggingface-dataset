# Gospe1/Franka-Bread-AdaSpeVLA-HeadScale

## Resumen

Franka Bread — AdaSpeVLA (variante HeadScale) es un modelo de visión-lenguaje-acción (VLA) para control robótico de un brazo Franka, desarrollado por el usuario Gospe1 y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un checkpoint de inferencia de OpenPI/Orbax construido sobre el backbone π0.5 PaliGemma, con una cabeza de acción basada en flow-matching con B-splines cúbicos, nudos aprendidos y una cabeza adaptativa de intervalo de consulta. La tarea concreta es «Pick up both slices of bread from the toaster and place them on the plate», entrenada sobre 90 de los 100 episodios del dataset `dddddsds31341/bread-lerobot`.

El interés del modelo es fundamentalmente metodológico: no es un modelo generalista, sino un estudio de escalado de la cabeza de acción (de 384/6/6 a 768/12/12, con `cond_dim` 512 y 159M de parámetros en la cabeza) manteniendo fijo el backbone. El repositorio ocupa 4,8 GB y contiene únicamente pesos en bfloat16 (float32 para la cabeza de timing), sin estado del optimizador, además de las estadísticas de normalización.

No hay resultados en robot real publicados: la evaluación es en bucle abierto sobre 10 episodios retenidos (1.024 fotogramas), con métricas de R² por dimensión de acción y precisión de signo del gripper. El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y su uso requiere el código de la rama `adaspe_train` de AdaSpeVLA y OpenPI en el commit `215abfb`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA sobre backbone π0.5 PaliGemma con cabeza de acción flow-matching B-spline (AdaSpeVLA) |
| Parámetros totales | no disponible (cabeza de acción: 159M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en bfloat16; cabeza de timing en float32) |
| Idiomas soportados | no disponible (modelo orientado a instrucciones de tarea en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | Orbax/OpenPI (`params/`), sin safetensors ni GGUF |
| Tamaño del repositorio | 4,8 GB |
| Chunk de acción | 16 pasos (1,5 s a 10 Hz) |
| Puntos de control B-spline | 11 (cúbicos) |
| Intervalo de consulta | 0,2–1,5 s |
| Cabeza de flujo (carpeta M) | 768 / 12 capas / 12 cabezas, `cond_dim` 512 |
| Dataset | `dddddsds31341/bread-lerobot` @ `a45b8ba`, 90 de 100 episodios |

## Arquitectura y entrenamiento

El modelo parte del backbone `pi05_base` (π0.5 con PaliGemma) con fine-tuning completo. Sobre él se acoplan cabezas plugin inicializadas aleatoriamente (semilla 0): una cabeza de flujo que genera acciones mediante flow-matching con B-splines cúbicos de 11 puntos de control, y una cabeza adaptativa de intervalo de consulta que predice cada cuánto tiempo reobservar y cuántos pasos del chunk ejecutar. La innovación central es el modelado del timing: los nudos de la B-spline y las etiquetas de intervalo se derivan del movimiento medido y del estado comandado del gripper, con densidad de nudos normalizada por `e_crit` (calibración de pan: 10,01).

El entrenamiento se divide en dos etapas: 20.000 pasos de la etapa de acción con AdamW, warmup coseno de 1.000 pasos, LR pico 2,5e-5, decaimiento hasta 30k, EMA 0,99 y batch 32; y 10.000 pasos adicionales de la etapa de timing, en la que solo se entrena la cabeza de timing. La receta corresponde a la rama de robot real de AdaSpeVLA (`adaspe_train`, commit `6adec69`, revisión del 10 de noviembre de 2026). La única diferencia respecto a la receta por defecto es el tamaño de la cabeza de flujo (768/12/12 frente a 384/6/6).

## Capacidades

- Generación de comandos de acción densos en el marco del cuerpo: `model.sample_spline(rng, observation)` devuelve 16 comandos normalizados de 0,1 s cada uno.
- Predicción adaptativa del intervalo de consulta y del número de pasos a ejecutar (`execute_steps`), lo que permite reducir la frecuencia de reobservación.
- Control de brazo robótico Franka de 7 grados de libertad más gripper (dimensiones x, y, z, rx, ry, rz, grip).
- Ejecución de una tarea de manipulación concreta condicionada por prompt de lenguaje: recoger dos rebanadas de pan de la tostadora y colocarlas en el plato.
- No se documentan capacidades de tool calling, razonamiento multi-paso, visión general, audio ni modo thinking.
- Capacidades multilingües: no disponibles; el prompt de tarea está en inglés.

## Casos de uso

- Estudio de escalado de cabezas de acción en VLA: sirve para comparar el efecto de aumentar la anchura y profundidad de la cabeza de flujo (768/12/12 frente a 384/6/6) manteniendo el backbone, usando las métricas R² en bucle abierto como referencia.
- Investigación en flow-matching con B-splines para robótica: el checkpoint permite reproducir la generación de trayectorias suaves con 11 puntos de control y evaluar la calidad de la interpolación frente a acciones discretas por paso.
- Evaluación de políticas con intervalo de consulta adaptativo: útil para medir el compromiso entre frecuencia de reobservación (0,2–1,5 s) y precisión de la acción en tareas de manipulación.
- Benchmark de manipulación de objetos deformables o frágiles: la tarea del pan sobre tostadora exige agarre y colocación precisa; el modelo puede emplearse como política de referencia en experimentos con objetos similares.
- Reproducción de experimentos en robot real: con el código `adaspe_train/adaspe` y OpenPI `215abfb`, se puede desplegar en un Franka y validar la transferencia de las métricas de bucle abierto a ejecución física.
- Docencia y formación en VLA: el repositorio incluye instrucciones de carga con Flax NNX y mapeo de claves de Orbax, lo que facilita su uso como ejemplo práctico de integración de cabezas plugin en un backbone preentrenado.

## Benchmarks y rendimiento

Evaluación en bucle abierto sobre 10 episodios retenidos (1.024 fotogramas; acciones normalizadas sobre el chunk de 16 pasos):

| Tamaño (20k) | R² x | R² y | R² z | R² rx | R² ry | R² rz | R² grip | Precisión de signo del gripper | MAE / corr. de intervalo |
|---|---|---|---|---|---|---|---|---|---|
| S (referencia, no subido) | 0,20 | 0,92 | 0,80 | 0,14 | 0,27 | 0,20 | 0,72 | 94,7% | 0,280 s / 0,60 |
| M | 0,18 | 0,92 | 0,81 | 0,19 | 0,26 | 0,18 | 0,73 | 95,0% | 0,289 s / 0,58 |

El R² se calcula respecto a predecir la media por dimensión de las acciones retenidas. No se incluyen resultados en robot real. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio de 4,8 GB en bfloat16 sugiere un consumo en torno a 5–6 GB para los pesos, más memoria para activaciones y el backbone PaliGemma.
- GPU recomendadas: no disponibles en la documentación; por el tamaño y el uso de JAX/Flax, se requieren GPUs con soporte CUDA y suficiente memoria para el backbone completo.
- ¿Cabe en GPU de consumo? No confirmado; el tamaño de pesos es compatible con GPUs de 8–12 GB, pero el backbone PaliGemma y las activaciones pueden elevarlo.
- Opciones de despliegue: OpenPI con JAX/Flax NNX y Orbax; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Franka Bread AdaSpeVLA HeadScale (M) | Cabeza 159M; total no disponible | no disponible | R² z 0,81; grip 95,0% (bucle abierto) | Apache 2.0 | Hugging Face (0 descargas) |
| Franka Bread π0.5 baseline (`dddddsds31341/Franka-Bread-pi05-step-20000`) | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| AdaSpeVLA tamaño S (referencia) | Cabeza 384/6/6 | no disponible | R² z 0,80; grip 94,7% (bucle abierto) | Apache 2.0 | No subido |

No se dispone de datos de otros modelos VLA comparables en la información proporcionada.

## Limitaciones y advertencias

- Modelo específico de una única tarea y un único robot (Franka con la tarea del pan); no generaliza a otras instrucciones ni entornos sin reentrenamiento.
- No hay validación en robot real: todas las métricas son en bucle abierto sobre 10 episodios retenidos, por lo que el rendimiento físico es desconocido.
- El R² en rotaciones es bajo (0,14–0,27 en la referencia S; 0,18–0,26 en M), lo que indica poca capacidad predictiva en orientación.
- Requiere código externo muy concreto (`adaspe_train/adaspe` en el commit `6adec69` y OpenPI `215abfb`) y un procedimiento de carga manual con mapeo de claves, ya que `cfg.load(restore_params(...))` falla por estructura de pytree.
- Riesgo de alucinación y sesgos: no evaluado en la documentación; el modelo no es de lenguaje general.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el backbone π0.5/PaliGemma puede tener condiciones adicionales no detalladas.
- Antes de ejecutar en hardware, el autor recomienda validar el orden de observaciones, unidades, normalización y límites del espacio de trabajo en un entorno controlado.
- Sin descargas ni likes: no hay evidencia de uso comunitario ni de reproducibilidad independiente.

## Enlaces

- Hugging Face: https://huggingface.co/Gospe1/Franka-Bread-AdaSpeVLA-HeadScale
- Dataset: https://huggingface.co/datasets/dddddsds31341/bread-lerobot
- Baseline π0.5: https://huggingface.co/dddddsds31341/Franka-Bread-pi05-step-20000
- OpenPI: no disponible en la información proporcionada
- Paper de AdaSpeVLA: no disponible en la información proporcionada
- Repositorio `adaspe_train`: no disponible en la información proporcionada
