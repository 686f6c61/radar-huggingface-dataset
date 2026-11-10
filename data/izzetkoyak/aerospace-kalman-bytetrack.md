# izzetkoyak/aerospace-kalman-bytetrack

## Resumen

`aerospace-kalman-bytetrack` es un pipeline de estimación de estado cinemático y asociación de datos en dos etapas para el seguimiento de objetivos aéreos de alta velocidad (aeronaves de ala fija, enjambres de UAV rotativos, objetivos de crucero y cohetes balísticos) sobre flujos de sensores electro-ópticos (EO) e infrarrojos térmicos (IR). Lo desarrolla el usuario de Hugging Face izzetkoyak y se publica bajo licencia MIT.

No se trata de un modelo de aprendizaje profundo con pesos neuronales, sino de una implementación de referencia de un filtro de Kalman de aceleración constante de 8 estados combinado con el algoritmo de tracking ByteTrack y un mecanismo de gating basado en la distancia de Mahalanobis. El repositorio expone código Python (`kalman.py`, `bytetrack.py`) en lugar de pesos en safetensors o GGUF, por lo que su integración se realiza importando las clases directamente en una aplicación de visión por computador.

Su relevancia radica en cubrir un caso de uso específico del dominio aeroespacial y de defensa: mantener la identidad de los tracks (cero cambios de Track ID según la model card) cuando las detecciones se degradan por oclusión, nubes o apagones temporales del sensor, y extrapolar trayectorias de intercepción con un horizonte de predicción de 25 pasos. El modelo se publicó el 9 de noviembre de 2026 y, en el momento de redactar esta ficha, no registra descargas ni likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Filtro de Kalman de aceleración constante de 8 estados + ByteTrack de dos etapas con gating de Mahalanobis (código Python, sin red neuronal) |
| Parametros totales | no disponible (no es un modelo con pesos neuronales) |
| Parametros activos | no aplica |
| Longitud de contexto | no aplica (ventana de predicción de 25 pasos configurable vía `prediction_horizon`) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no disponible (la salida son estructuras de telemetría, no texto) |
| Licencia | MIT |
| Formato de pesos | no disponible (se distribuye como código fuente Python: `kalman.py`, `bytetrack.py`) |

## Arquitectura y entrenamiento

El componente de estimación de estado es un filtro de Kalman de aceleración constante con vector de estado `x_k = [c_x, c_y, v_x, v_y, a_x, a_y, w, h]^T`, es decir, centro del bounding box, velocidad, aceleración y dimensiones ancho/alto. Emplea actualizaciones de covarianza estabilizadas mediante la forma de Joseph y un amortiguamiento de la aceleración en coasting con factor `gamma = 0.92`. La función `predict_trajectory` extrapola la trayectoria de intercepción con un horizonte de N pasos, lo que permite mantener una estimación durante apagones temporales del sensor.

El componente de asociación es una variante de ByteTrack en dos etapas. La etapa 1 asocia detecciones de alta confianza (`tau_high = 0.55`) mediante una combinación híbrida de IoU e innovación de Mahalanobis. La etapa 2 recupera objetivos ocluidos o degradados por nubes con detecciones de baja confianza (`tau_low = 0.15`), preservando la identidad del track sin cambios de Track ID según la model card. No se documenta entrenamiento con datos ni ajuste fino de redes neuronales: el pipeline consume las detecciones de un detector externo y el dataset asociado (`izzetkoyak/aerospace-eoir-trajectories`) se emplea como benchmark de trayectorias, no como corpus de entrenamiento supervisado de los componentes.

## Capacidades

- Seguimiento multiobjeto de objetivos aéreos de alta velocidad sobre secuencias EO e IR.
- Estimación de estado cinemático: posición, velocidad y aceleración por objetivo, más dimensiones del bounding box.
- Predicción de trayectoria a N pasos (`prediction_horizon=25` por defecto) para soporte de intercepción y anticipación.
- Recuperación de objetivos ocluidos o degradados por nubes gracias a la segunda etapa de asociación con umbral bajo.
- Etiquetado de objetivos por clase en la detección (por ejemplo, `BALLISTIC_ROCKET` en el ejemplo de la model card).
- Salida de telemetría estructurada por track: `track_id`, `label`, `state_status`, `speed_px_s` y `predicted_path`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Seguimiento de aeronaves de ala fija en vídeo EO/IR: el pipeline mantiene la identidad del track a través de oclusiones parciales y variaciones de confianza del detector, usando la etapa 2 de ByteTrack para recuperar detecciones por debajo de 0.55.
- Monitorización de enjambres de UAV rotativos: la asociación por IoU más Mahalanobis permite distinguir objetivos próximos entre sí y evitar intercambios de identidad en maniobras de alta densidad.
- Seguimiento de cohetes balísticos y objetivos de crucero: el filtro de aceleración constante con amortiguamiento (gamma = 0.92) modela trayectorias con aceleración sostenida y permite extrapolar la posición durante apagones del sensor.
- Predicción de intercepción: `predict_trajectory` genera la trayectoria futura a 25 pasos, utilizable como entrada para sistemas de apuntado o planificación de interceptación.
- Procesamiento de flujos térmicos nocturnos: al operar sobre detecciones de un detector externo, el pipeline es agnóstico al sensor y se aplica igual a secuencias IR que a EO.
- Evaluación y benchmarking de detectores: el dataset `aerospace-eoir-trajectories` y el Space interactivo permiten comparar el comportamiento del tracker con distintas fuentes de detección.
- Integración en pipelines de vigilancia aérea: la salida de telemetría estructurada (`track_id`, `state_status`, `speed_px_s`, `predicted_path`) se puede volcar directamente a un sistema de monitorización o a un HUD táctico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas cuantitativas (MOTA, IDF1, HOTA, RMSE de posición) ni comparaciones numéricas con otros trackers.

## Requisitos de hardware

- VRAM estimada: no aplica; el pipeline es código Python de filtrado y asociación sin inferencia de red neuronal, por lo que se ejecuta en CPU.
- GPU recomendadas: no aplica para el tracker; el detector externo que alimente las detecciones sí puede requerir GPU (no especificada en la información disponible).
- Cabe en cualquier equipo capaz de ejecutar Python; no requiere GPU de consumo.
- Opciones de despliegue: importación directa de los módulos `kalman.py` y `bytetrack.py`, o ejecución a través del Space interactivo `izzetkoyak/aerospace-target-tracker`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Estado | Asociación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| aerospace-kalman-bytetrack | Kalman 8 estados + ByteTrack | Posición, velocidad, aceleración, tamaño | IoU + Mahalanobis en dos etapas | MIT | Hugging Face, GitHub, Space |
| SORT | Kalman + Hungarian | Posición y velocidad | IoU | no disponible en la información | Referencia académica |
| DeepSORT | Kalman + apariencia | Posición y velocidad | IoU + embedding | no disponible en la información | Referencia académica |
| ByteTrack original | Kalman + ByteTrack | Posición y velocidad | IoU en dos etapas | no disponible en la información | Referencia académica |

La comparación se limita a la categoría algorítmica, ya que no se dispone de datos de rendimiento publicados para este pipeline que permitan una comparación numérica con las alternativas.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni una red neuronal: no genera texto, no razona y no soporta tool calling ni agentes.
- Requiere un detector externo que produzca bounding boxes con confianza; el rendimiento final depende de la calidad de ese detector.
- Los umbrales `tau_high = 0.55` y `tau_low = 0.15`, el factor de amortiguamiento `gamma = 0.92` y el horizonte de predicción de 25 pasos son valores por defecto que pueden no ajustarse a todos los dominios; no se documenta una validación sistemática de su sensibilidad.
- El filtro asume un modelo de aceleración constante; maniobras bruscas o no modeladas pueden degradar la predicción.
- No se documentan sesgos, tasas de alucinación ni evaluación en condiciones adversas más allá de la mención cualitativa a oclusiones y nubes.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso en producción por terceros.
- Licencia MIT: permite uso comercial y modificación con atribución, pero no se ofrece garantía alguna sobre el comportamiento del código.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/izzetkoyak/aerospace-kalman-bytetrack
- Space interactivo: https://huggingface.co/spaces/izzetkoyak/aerospace-target-tracker
- Dataset de benchmark: https://huggingface.co/datasets/izzetkoyak/aerospace-eoir-trajectories
- Repositorio GitHub: https://github.com/lfameS/aerospace-target-tracker
