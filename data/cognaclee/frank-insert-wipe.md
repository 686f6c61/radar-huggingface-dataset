# cognaclee/Frank-Insert-Wipe

## Resumen

Frank-Insert-Wipe es un conjunto de checkpoints de investigación para robótica de manipulación, desarrollado por el usuario cognaclee y publicado en Hugging Face bajo la librería OpenPI. No se trata de un modelo de lenguaje, sino de una variante de pi0.5 (el modelo visión-lenguaje-acción de Physical Intelligence implementado en JAX dentro de OpenPI) denominada AdaSpeVLA, que predice trozos de acción mediante B-splines cúbicos con nudos adaptativos y añade una cabeza de temporización que decide cuándo volver a consultar la política.

El repositorio contiene dos familias de variantes para dos tareas concretas de un robot Franka: `insert_tube` (insertar un tubo) y `wipe_whiteboard` (limpiar una pizarra). La diferencia entre ambas familias es únicamente el generador de los 11 puntos de control: un `flow_head` de 20,4 M de parámetros entrenado desde cero, o el experto de acción Gemma-300M preentrenado de pi0.5 (427,9 M con adaRMS), reutilizado sobre los tokens de puntos de control.

El interés del artefacto es fundamentalmente metodológico: documenta de forma explícita la receta de entrenamiento (horizonte H=16, K=11 puntos de control, 40k pasos de acción más 10k de temporización), las pérdidas por etapa y las diferencias entre variantes. No incluye evaluación en robot real ni en conjunto de validación, por lo que debe tratarse como material reproducible de investigación y no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | AdaSpeVLA, variante de pi0.5 (OpenPI, JAX); predicción de chunks de acción con B-splines cúbicos de nudos adaptativos y cabeza de temporización |
| Parametros totales | no disponible (el generador `flow_head` tiene 20,4 M; el experto de acción `pi05_expert` tiene 427,9 M con adaRMS; no se especifica el total del sistema completo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (horizonte de acción H=16, equivalente a 1,5 s a 10 Hz; intervalo de consulta de 0,2 a 1,5 s) |
| Tipos de cuantizacion | no disponible (checkpoints Orbax en el layout de OpenPI, sin cuantización publicada) |
| Idiomas soportados | no disponible (modelo de robótica; no se documenta soporte lingüístico) |
| Licencia | no disponible |
| Formato de pesos | Orbax (layout OpenPI: `params/` + `assets/`); solo parámetros, sin `train_state` del optimizador |

## Arquitectura y entrenamiento

AdaSpeVLA parte de `pi05_base` y sustituye la generación de acciones por una representación de spline: en lugar de predecir directamente H=16 acciones, el modelo produce K=11 puntos de control de un B-spline cúbico, de los que se derivan las acciones del horizonte. Una cabeza de nudos adaptativos ajusta la densidad de nudos mediante `tanh(motion_variation / e_crit)`, con `e_crit` calibrado por tarea (11,98 para `insert_tube`, 8,96 para `wipe_whiteboard`). Una segunda cabeza, la de temporización (`freq_head`), estima el intervalo tras el cual conviene volver a consultar la política, dentro del rango 0,2-1,5 s. Las etiquetas de eventos de pinza se derivan del comando de pinza, ya que la anchura medida presenta un retardo de aproximadamente 1,9 s.

El entrenamiento se realiza en dos etapas sobre los datasets `dddddsds31341/insert-tube-lerobot` (102 episodios, 16.403 fotogramas) y `dddddsds31341/wipe-whiteboard-lerobot` (112 episodios, 29.795 fotogramas), con dos cámaras de 128×128, estado de 19 dimensiones, acción de 7 dimensiones y captura a 10 Hz. Se usa batch 32, 40k pasos de acción (decaimiento de LR sobre 30k) y después 10k pasos de temporización con el resto congelado. Las dos variantes difieren en la convención de flow matching: `flow_head` usa t ~ U(0,1), mientras que `pi05_expert` usa la Beta(1,5,1) de pi0.5, de modo que las pérdidas no son estrictamente comparables. El 2026-11-14 se republicaron cabezas de temporización con picos de LR de 3e-4 y 1e-3.

## Capacidades

- Generación de trayectorias de acción para manipulación robótica en dos tareas específicas: inserción de tubo y limpieza de pizarra.
- Predicción de chunks de acción con horizonte de 1,5 s (H=16) a partir de representación B-spline de 11 puntos de control.
- Temporización adaptativa: decisión autónoma del instante de la siguiente consulta a la política (0,2-1,5 s).
- Procesamiento multimodal de dos cámaras RGB de 128×128 junto con estado propioceptivo de 19 dimensiones.
- Control de pinza de 7 dimensiones (6-DoF más apertura).
- Dos variantes de generador de acciones intercambiables con el mismo pipeline de datos y estadísticas de normalización.
- No se documenta soporte de tool calling, agentes multi-paso, capacidades multilingües ni modos de razonamiento explícito.

## Casos de uso

- Investigación en representaciones de acción compactas: el modelo permite comparar directamente un generador entrenado desde cero (20,4 M) frente a un experto preentrenado (427,9 M) sobre los mismos datos, estadísticas y receta, aislando el efecto de la inicialización.
- Benchmark de temporización adaptativa: la cabeza `freq_head` y sus variantes con distinto LR permiten estudiar cómo afecta la tasa de consulta a la suavidad y reactividad del control en tareas de contacto.
- Reproducción de experimentos de pi0.5 en Franka: el repositorio incluye `code/adaspe_train`, el plugin OpenPI y el commit exacto (`code/OPENPI_COMMIT`), lo que facilita replicar el entrenamiento en un laboratorio con hardware similar.
- Prototipado de inserción de precisión: la tarea `insert_tube` con 102 episodios sirve como banco de pruebas de bajo coste para políticas visomotoras con estado de 19-D antes de escalar a datasets mayores.
- Estudio de tareas de contacto superficial: `wipe_whiteboard` (112 episodios, 29.795 fotogramas) es un caso de control de fuerza y trayectoria continua adecuado para analizar la densidad de nudos del spline.
- Base para fine-tuning en tareas de manipulación afines: al estar inicializado desde `pi05_base` y conservar el layout estándar de OpenPI, los checkpoints pueden reutilizarse como punto de partida con el plugin incluido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta pérdidas de entrenamiento (no de validación ni de robot real):

| Tarea | Variante | Pérdida de acción (pasos 38k-40k) | Pérdida de temporización (pasos 9k-10k) |
|---|---|---|---|
| insert_tube | flow_head | 0,086 | 0,206 |
| insert_tube | pi05_expert | 0,030 | 0,255 |
| wipe_whiteboard | flow_head | 0,118 | 0,196 |
| wipe_whiteboard | pi05_expert | 0,040 | 0,271 |

Evolución de la pérdida de acción (media por ventana de 2k pasos):

| Pasos | insert_tube flow_head | insert_tube expert | wipe flow_head | wipe expert |
|---|---|---|---|---|
| 0-2k | 0,624 | 0,334 | 0,597 | 0,295 |
| 8-10k | 0,238 | 0,121 | 0,238 | 0,121 |
| 18-20k | 0,156 | 0,067 | 0,169 | 0,083 |
| 28-30k | 0,105 | 0,038 | 0,130 | 0,049 |
| 38-40k | 0,086 | 0,030 | 0,118 | 0,040 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El repositorio ocupa 96,0 GB e incluye múltiples checkpoints (dos tareas × dos variantes × varias cabezas de temporización), no un único modelo.
- GPU recomendadas: no disponibles. Al ejecutarse sobre OpenPI en JAX, requiere acelerador compatible con JAX; el autor no documenta GPU concretas.
- Viabilidad en GPU de consumo: no disponible. El experto de acción (427,9 M) es de tamaño moderado, pero el sistema completo incluye el backbone pi0.5 y el pipeline de visión, sin cifras publicadas de memoria.
- Opciones de despliegue: OpenPI en JAX con el plugin `code/adaspe_train` y el commit `code/OPENPI_COMMIT`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. El intervalo de consulta de la política está acotado entre 0,2 y 1,5 s por diseño, pero no se reportan latencias medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|
| Frank-Insert-Wipe (AdaSpeVLA) | 20,4 M (flow_head) o 427,9 M (experto) para el generador | H=16 (1,5 s), consulta 0,2-1,5 s | no disponible | Hugging Face, checkpoints Orbax |
| `dddddsds31341/Franka-Insert-Tube-pi05-step-20000` | pi0.5 base (no detallado) | no disponible | no disponible | Hugging Face |
| `dddddsds31341/Franka-Wipe-Whiteboard-pi05-step-20000` | pi0.5 base (no detallado) | no disponible | no disponible | Hugging Face |
| pi0.5 (`pi05_base`) | no disponible en la información | no disponible | no disponible | OpenPI |

Los dos checkpoints de `dddddsds31341` son las líneas base de pi0.5 declaradas por el autor con las mismas estadísticas de normalización; no se han publicado comparaciones de rendimiento entre ellos y AdaSpeVLA.

## Limitaciones y advertencias

- No hay evaluación en robot real ni en conjunto de validación: solo pérdidas de entrenamiento, insuficientes para inferir rendimiento de despliegue.
- Las pérdidas de acción de `flow_head` y `pi05_expert` no son directamente comparables por usar convenciones distintas de flow matching (U(0,1) frente a Beta(1,5,1)).
- La cabeza de temporización del experto tiene mayor pérdida que la de `flow_head` (0,255 frente a 0,206 en insert_tube), atribuido a que su feature agrupada solo se entrena con la pérdida de nudos.
- Los checkpoints contienen únicamente parámetros: no incluyen el `train_state` del optimizador, lo que impide reanudar el entrenamiento exactamente.
- El modelo está especializado en dos tareas concretas de un Franka con configuración de sensores fija (dos cámaras de 128×128, estado de 19-D, acción de 7-D, 10 Hz); no es generalizable sin fine-tuning.
- Licencia no disponible: no puede asumirse uso comercial.
- Idiomas y sesgos no documentados; al no ser un modelo de lenguaje, las advertencias típicas de sesgo textual no aplican, pero tampoco hay análisis de sesgo de política robótica.
- El tamaño del repositorio (96,0 GB) y la multiplicidad de checkpoints exigen descargas selectivas con `allow_patterns`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cognaclee/Frank-Insert-Wipe
- Dataset insert_tube: https://huggingface.co/datasets/ddddsds31341/insert-tube-lerobot
- Dataset wipe_whiteboard: https://huggingface.co/datasets/ddddsds31341/wipe-whiteboard-lerobot
- Línea base pi0.5 insert_tube: https://huggingface.co/ddddsds31341/Franka-Insert-Tube-pi05-step-20000
- Línea base pi0.5 wipe_whiteboard: https://huggingface.co/ddddsds31341/Franka-Wipe-Whiteboard-pi05-step-20000
- OpenPI (repositorio del framework): no disponible en la información proporcionada
- Paper o blog del autor: no disponible
