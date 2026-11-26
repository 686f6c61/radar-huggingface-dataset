# mimiminsoo/cashier-nostage

## Resumen

`cashier-nostage` es una política de difusión (diffusion policy) para robótica desarrollada por el usuario mimiminsoo en el contexto del capstone MoAI 2026. El modelo controla un sistema robótico dual compuesto por dos brazos PiPER, una pinza por brazo y un cuello de 2 grados de libertad, a partir de tres cámaras (una principal izquierda y dos de muñeca). Resuelve una tarea completa de cajero automatizado: lectura de códigos de barras y empaquetado de productos.

La relevancia técnica del modelo radica en que elimina por completo la entrada de "stage" (fase de la tarea) del estado de observación. Mientras que su predecesor `mimiminsoo/cashier-onehot6` recibía seis columnas one-hot que indicaban la fase actual, esta variante aprende la tarea de extremo a extremo usando únicamente las 16 articulaciones del robot como estado. Es, por tanto, un experimento de ablación que demuestra si la política puede inferir implícitamente la fase a partir de la observación visual y propioceptiva.

El modelo se distribuye como checkpoint de entrenamiento (4,4 GB) en formato `.pt` con pesos EMA, bajo licencia Apache 2.0, y se carga mediante la librería LeRobot con el pipeline del proyecto `Cashier_policy` (rama `release`). No es un modelo de lenguaje ni un modelo multimodal de propósito general: es un controlador de política robótica específico para un entorno físico concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion policy (LeRobot), condicionada por observación visual y estado propioceptivo |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; horizonte de observación de 2 pasos |
| Tipos de cuantizacion | no disponible (checkpoint en punto flotante `.pt`) |
| Idiomas soportados | no disponible (modelo de control robótico, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | `training_state.pt` (checkpoint de entrenamiento con pesos EMA) |
| Estado de entrada | 16 dimensiones (solo articulaciones del robot, sin stage) |
| Acción de salida | 16 dimensiones (brazo izq. 6 + pinza, brazo der. 6 + pinza, pitch/yaw del cuello) |
| Cámaras | 3: `observation.images.left_main`, `left_wrist`, `right_wrist` a resolución [240, 320] |
| Horizontes | obs 2, pred 16, action 8 |
| Frecuencia de control | 10 Hz |
| Pasos de entrenamiento | 200 000 (cosine LR hasta 0 en el paso 200 000) |
| Batch | 64 global (32 por GPU × 2 GPU, DDP, RTX 4090) |
| Datos de entrenamiento | 808 episodios, 298 045 frames (`onehot6_1123_nostage`) |
| Tamaño del repo | 4,4 GB |

## Arquitectura y entrenamiento

El modelo es una diffusion policy, un enfoque que modela la distribución de acciones futuras mediante un proceso de difusión condicionado por la observación. La entrada de observación combina tres flujos de imagen (cámara principal izquierda y dos cámaras de muñeca) a resolución 240×320 con un vector de estado de 16 dimensiones que codifica exclusivamente las articulaciones del robot. La salida es una secuencia de 8 acciones a 10 Hz, con un horizonte de predicción de 16 pasos y un horizonte de observación de 2.

El entrenamiento se realizó durante 200 000 pasos con un scheduler de learning rate coseno que decae a cero, batch global de 64 (32 por GPU en dos RTX 4090 con DDP) y `normalize_range_eps` de 0,0001. El conjunto de datos `onehot6_1123_nostage` es idéntico al de `mimiminsoo/cashier-onehot6` (808 episodios, 298 045 frames) salvo por la eliminación de las seis columnas one-hot que codificaban la fase de la tarea. Esto convierte al modelo en una ablación controlada: mismas imágenes, mismas acciones, mismos episodios, misma configuración de entrenamiento, pero sin información explícita de stage. La innovación técnica destacable es precisamente esa: forzar a la política a inferir la fase de la tarea de forma implícita a partir de la observación visual y propioceptiva.

## Capacidades

- Control robótico de extremo a extremo de una tarea de cajero: lectura de códigos de barras y empaquetado de productos con dos brazos PiPER.
- Coordinación bimanual: 6 articulaciones más pinza por brazo, con control simultáneo de ambos brazos.
- Control de cuello de 2 grados de libertad (pitch y yaw) para orientar la percepción.
- Percepción visual multimodal mediante tres cámaras (principal izquierda y dos de muñeca).
- Inferencia implícita de la fase de la tarea sin entrada explícita de stage.
- Ejecución de políticas de difusión a 10 Hz con horizonte de acción de 8 pasos.
- No dispone de generación de texto, razonamiento lingüístico, código, matemáticas, tool calling, capacidades de agente ni soporte multilingüe.

## Casos de uso

- Automatización de caja en comercio minorista: el modelo ejecuta la secuencia completa de escanear el código de barras y empaquetar el producto en un entorno controlado con dos brazos, sustituyendo la coordinación manual por una política única que no requiere señalización de fase.
- Investigación en ablación de representación de estado: sirve como referencia experimental para estudiar cuánto aporta la información explícita de stage frente a la inferencia implícita, comparándolo directamente con `cashier-onehot6` bajo idénticos datos y configuración.
- Prototipado de manipulación bimanual: el control coordinado de dos brazos PiPER con pinzas y cuello lo hace adecuado para laboratorios que investigan tareas de pick-and-pack con robots de bajo coste.
- Evaluación de políticas de difusión en hardware real: su frecuencia de 10 Hz y su horizonte de acción de 8 pasos permiten desplegarlo en lazos de control en tiempo real sobre GPUs de consumo (RTX 4090) mediante LeRobot.
- Docencia y reproducción de experimentos: al publicarse el checkpoint completo con pesos EMA y la configuración del dataset, permite reproducir el entrenamiento y analizar el efecto de eliminar columnas de estado.
- Base para políticas multi-tarea: al eliminar la dependencia de un stage fijo, el enfoque es un punto de partida para entrenar políticas que generalicen entre fases sin ingeniería de estado específica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de éxito de tarea, tasas de acierto ni comparaciones cuantitativas con `cashier-onehot6` u otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el checkpoint de entrenamiento ocupa 4,4 GB, por lo que la inferencia requiere al menos esa cantidad más el overhead de las tres cámaras y del modelo de difusión.
- GPU de entrenamiento documentadas: 2 × NVIDIA GeForce RTX 4090 con DDP (batch 32 por GPU).
- Cabe en GPU de consumo: sí, el entrenamiento se realizó en RTX 4090; la inferencia debería caber en GPUs consumer con suficiente VRAM, aunque el requisito exacto no está publicado.
- Opciones de despliegue: LeRobot con el pipeline `Cashier_policy` (rama `release`), mediante `pipeline/download_model.py`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a políticas robóticas).
- Latencia y throughput: frecuencia de control de 10 Hz; no se publican cifras de latencia por inferencia ni throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Estado de entrada | Stage explícito | Datos | Pasos | Licencia |
|---|---|---|---|---|---|---|
| `mimiminsoo/cashier-nostage` | Diffusion policy | 16 (solo articulaciones) | No | 808 episodios / 298 045 frames | 200 000 | Apache 2.0 |
| `mimiminsoo/cashier-onehot6` | Diffusion policy | 16 + 6 one-hot de stage | Sí | mismos episodios y frames | 200 000 | no disponible |
| `mimiminsoo/cashier-barcode-onehot3` | Diffusion policy (subtarea) | estado con stage (3 one-hot) | Sí | datos de barcode | no disponible | no disponible |

La comparación directa relevante es con `cashier-onehot6`, del que este modelo es una ablación controlada: mismos datos, mismos ajustes de entrenamiento y mismo número de pasos, diferenciándose únicamente en la eliminación de las seis columnas one-hot de stage. No se dispone de resultados de rendimiento comparados entre ambos.

## Limitaciones y advertencias

- Modelo específico de una tarea y un hardware concretos (dos brazos PiPER, cuello de 2 GDL, tres cámaras); no es transferible a otras configuraciones sin reentrenamiento.
- No incluye ni admite entrada de stage; si la tarea requiere desambiguar fases de forma fiable, la inferencia implícita puede ser menos robusta que la versión con one-hot, extremo que no se cuantifica en la información disponible.
- El pipeline de evaluación `eval/run_chain.sh` está pensado para modelos de stage divididos y no es aplicable a este modelo; la cadena de una sola política sin stage no está en la rama `release`.
- No se publican métricas de éxito, tasas de fallo ni análisis de sesgos; el riesgo de comportamiento errático en estados fuera de distribución no está caracterizado.
- Licencia Apache 2.0 permite uso comercial, pero el modelo depende de datos y hardware del proyecto original; verificar compatibilidad con el stack LeRobot y la rama `release` de `Cashier_policy`.
- El checkpoint es un `training_state.pt` con pesos EMA, no un formato de inferencia optimizado; puede requerir conversión para despliegue en producción.
- Sin capacidades lingüísticas ni multimodales generales: no debe evaluarse como modelo de lenguaje.

## Enlaces

- Hugging Face: https://huggingface.co/mimiminsoo/cashier-nostage
- Modelo predecesor con stage: https://huggingface.co/mimiminsoo/cashier-onehot6
- Modelo de subtarea de barcode: https://huggingface.co/mimiminsoo/cashier-barcode-onehot3
- LeRobot (librería): https://github.com/huggingface/lerobot
