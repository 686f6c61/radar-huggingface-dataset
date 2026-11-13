# BashirEmran/ScoreVision

## Resumen

ScoreVision es un detector de objetos de tipo YOLO de una sola escala (stride 8) publicado por el usuario BashirEmran en Hugging Face. El modelo se distribuye exclusivamente en formato ONNX (`weights.onnx`) y está especializado en la detección de tres clases de recipientes de bebida: vaso (cup), lata (can) y botella (bottle). Toma imágenes RGB de 864x864 píxeles como entrada y produce una salida con formato `[1, 7, N]`, donde las cuatro primeras componentes son las coordenadas del cuadro delimitador (cx, cy, w, h en píxeles de entrada) y las tres restantes son puntuaciones sigmoideas por clase.

El repositorio incluye además un script de inferencia (`miner.py`) que ejecuta el modelo con onnxruntime sobre CPU, aplica letterbox al tamaño de entrada, realiza NMS por clase y envía únicamente el conjunto de cajas con mayor puntuación esperada, con una compuerta (`gate`) que descarta imágenes sin recipientes. También se incluye un fichero de configuración de runtime para Chutes (`chute_config.yml`) con las versiones de paquetes probadas.

El modelo es relevante como ejemplo de detector ligero y determinista orientado a despliegue en CPU con latencias bajas (61 ms por imagen de 1024x1024 en dos núcleos fijados de un AMD EPYC 7542), aunque la información pública disponible es muy escasa: no se documentan parámetros, contexto, licencia ni idiomas. El tamaño del repositorio es de 0.0 GB según los metadatos, lo que sugiere que los pesos pueden no estar efectivamente alojados o son de muy pequeño tamaño.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Detector YOLO-style de una sola escala (stride 8), entrada 864x864 RGB, salida [1, 7, N] |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantización | no disponible (pesos distribuidos en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`weights.onnx`) |

## Arquitectura y entrenamiento

La arquitectura es un detector de objetos tipo YOLO con una única escala de predicción (stride 8), lo que implica que la rejilla de salida tiene una resolución relativamente alta respecto a la entrada y está orientada a objetos de tamaño pequeño o medio. La entrada es una imagen RGB de 864x864 píxeles y la salida es un tensor `[1, 7, N]`: cuatro canales para las coordenadas del cuadro delimitador en píxeles de entrada (cx, cy, w, h) y tres canales para las puntuaciones sigmoideas de las clases cup, can y bottle. El pipeline de inferencia aplica letterbox para adaptar la imagen al tamaño de entrada del modelo y NMS por clase.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens o imágenes utilizadas, la composición de las clases, ni sobre si se aplicaron técnicas de aumento de datos, destilación o ajuste fino. Tampoco se documentan innovaciones técnicas adicionales más allá del diseño de una sola escala y la compuerta de descarte (`gate`) que evita enviar predicciones cuando la mejor candidata queda por debajo de un umbral, pensada para imágenes sin recipientes. El script `miner.py` es determinista y usa únicamente numpy y onnxruntime, lo que facilita la reproducibilidad.

## Capacidades

- Detección de objetos en imágenes RGB de 864x864 píxeles para tres clases: vaso (cup), lata (can) y botella (bottle).
- Salida de cuadros delimitadores en píxeles de entrada junto con puntuaciones sigmoideas por clase.
- NMS por clase implementado en el script de inferencia (`miner.py`).
- Compuerta de descarte (`gate`) que evita enviar resultados cuando la mejor candidata no supera el umbral configurado.
- Inferencia determinista en CPU con onnxruntime (2 hilos intra-op), sin dependencias de GPU.
- Procesamiento por lotes (`predict_batch`) con latencia media de 61 ms por imagen de 1024x1024 en dos núcleos fijados de AMD EPYC 7542 (72 ms con decodificación PNG, p95 75 ms).
- No soporta tool calling, agentes, razonamiento multi-paso, capacidades multilingües, visión general, audio ni modo thinking.

## Casos de uso

- Control de inventario en máquinas expendedoras: el detector puede identificar vasos, latas y botellas en imágenes capturadas por cámaras internas, usando la compuerta `gate` para descartar imágenes sin recipientes y el NMS por clase para evitar duplicados en escenas con varios objetos.
- Verificación de reciclaje en puntos de recogida: clasificar los residuos en las tres categorías (cup, can, bottle) antes de aceptar el depósito, con inferencia en CPU que permite desplegar en dispositivos de borde sin GPU.
- Monitorización de líneas de envasado: detectar la presencia y posición de latas y botellas en cintas transportadoras, aprovechando la salida en píxeles de entrada para calcular coordenadas reales tras la calibración de la cámara.
- Análisis de bandejas en restauración o catering: contar vasos y botellas en imágenes de bandejas para auditoría de consumos, con la ventaja de que el modelo es determinista y reproducible en entornos sin acelerador.
- Filtrado previo en pipelines de visión: usar el detector como etapa de criba que descarta imágenes sin recipientes (gracias a la compuerta `gate`) antes de enviarlas a modelos más costosos, reduciendo el cómputo aguas abajo.
- Despliegue en Chutes: el repositorio incluye `chute_config.yml` con las versiones de paquetes probadas, lo que permite ejecutar el modelo como servicio en la plataforma Chutes con el runtime documentado.
- Automatización de auditorías de stock en almacenes: procesar lotes de imágenes con `predict_batch` para estimar la presencia de latas y botellas en estanterías, con latencias de decenas de milisegundos por imagen en CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

Los únicos datos de rendimiento documentados son de latencia de inferencia: 61 ms por imagen de 1024x1024 en promedio (72 ms con decodificación PNG, p95 75 ms) sobre dos núcleos fijados de un AMD EPYC 7542 con onnxruntime en CPU y 2 hilos intra-op.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en la configuración documentada; el modelo se ejecuta en CPU con onnxruntime.
- GPU recomendadas: no disponible; no se documenta soporte GPU ni requisitos de VRAM.
- Compatibilidad con GPU de consumo: no disponible; el diseño documentado es CPU-only con 2 hilos intra-op.
- Opciones de despliegue: onnxruntime en CPU (documentado en `miner.py`), runtime de Chutes con `chute_config.yml`. No se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un detector ONNX de este tipo).
- Latencia y throughput: 61 ms por imagen de 1024x1024 en promedio, 72 ms con decodificación PNG, p95 de 75 ms, sobre 2 núcleos fijados de AMD EPYC 7542.
- Tamaño del repositorio: 0.0 GB según los metadatos de Hugging Face, lo que sugiere pesos de pequeño tamaño o ausencia de los mismos en el repo.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros detectores (por ejemplo, variantes de YOLO de una escala, modelos de detección de recipientes o detectores ligeros para CPU), ni datos de parámetros, contexto o rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Información pública muy escasa: no se documentan parámetros, dataset de entrenamiento, licencia ni idiomas, lo que dificulta evaluar su idoneidad para producción.
- Licencia no disponible: no puede confirmarse el uso comercial; es imprescindible contactar con el autor antes de integrarlo en productos.
- Modelo especializado en tres clases (cup, can, bottle): no detecta otros objetos y su rendimiento fuera de ese dominio es desconocido.
- Entrada fija de 864x864 píxeles: requiere letterbox, lo que puede degradar la precisión en objetos muy alargados o en resoluciones muy distintas.
- Una sola escala (stride 8): puede tener dificultades con objetos muy grandes o muy pequeños en la imagen.
- Riesgo de falsos positivos y negativos no cuantificado: no se publican métricas de precisión, recall, mAP ni matrices de confusión.
- La compuerta `gate` mitiga pero no elimina los envíos erróneos cuando la mejor candidata supera el umbral.
- El tamaño del repositorio (0.0 GB) y la ausencia de pipeline declarado generan dudas sobre la disponibilidad efectiva de los pesos.
- Sin soporte documentado de GPU ni de cuantizaciones alternativas; el rendimiento está medido únicamente en la configuración CPU indicada.
- Sin capacidades de lenguaje, tool calling ni agentes; no debe confundirse con un modelo multimodal o de propósito general.

## Enlaces

- Hugging Face: https://huggingface.co/BashirEmran/ScoreVision
- Repositorio referenciado en la model card: manak0/Detect-beverage-detect (no se proporciona URL directa en la información disponible)
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
