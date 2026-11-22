# LibreYOLO/LibreDepthPro2s-depth

## Resumen

LibreDepthPro2s-depth es un empaquetado en formato de checkpoint LibreYOLO de los pesos de Apple Depth Pro 2, concretamente la variante DepthPro2-S, un modelo de estimación de profundidad métrica a partir de una sola imagen y de vídeo en streaming. Lo desarrolla el proyecto LibreYOLO, que no entrena pesos nuevos sino que reempaqueta los checkpoints originales de Apple junto con el estimador de distancia focal complementario DepthPro2-focal, preservando todos los tensores de forma bit a bit para garantizar paridad de inferencia con el código de referencia de Apple.

El modelo resuelve un problema clásico en visión por computador: obtener un mapa de profundidad en metros reales (no profundidad relativa) desde una única imagen RGB, sin necesidad de calibración de cámara. Para ello combina un backbone DINOv3 ViT-S/16 con el estimador de focal que permite recuperar los intrínsecos de la cámara, de modo que la salida incluye tanto el mapa de profundidad como la matriz de intrínsecos en formato OpenCV.

La relevancia de esta ficha es doble: por un lado, ofrece una integración sencilla vía la librería LibreYOLO (una sola llamada a `predict` devuelve el mapa de profundidad y los intrínsecos); por otro, arrastra una restricción crítica de licencia, ya que los pesos están sujetos a la Apple Machine Learning Research Model License Agreement, que limita su uso exclusivamente a fines de investigación no comercial. El repositorio ocupa 0,2 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ViT (DINOv3 ViT-S/16) para profundidad + estimador de distancia focal complementario |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | apple-amlr (Apple Machine Learning Research Model License Agreement), solo investigación no comercial |
| Formato de pesos | checkpoint LibreYOLO v1.0 (`.pt`); pesos originales en safetensors |

## Arquitectura y entrenamiento

El modelo se basa en Depth Pro 2 de Apple, cuya columna vertebral es un Vision Transformer DINOv3 en configuración ViT-S/16. La tarea principal es la estimación de profundidad métrica a partir de una imagen, y se complementa con un segundo checkpoint, DepthPro2-focal, que estima la distancia focal y permite derivar los intrínsecos de la cámara. La combinación de ambos permite producir mapas de profundidad en metros y una matriz de intrínsecos de 3x3 en convención OpenCV, lo que habilita su uso en flujos de reconstrucción y vídeo.

El reempaquetado de LibreYOLO no modifica ningún parámetro aprendido: todos los tensores de `apple/DepthPro2-S` y `apple/DepthPro2-focal` se conservan sin cambios y se ha verificado paridad de inferencia bit a bit frente al código de referencia. Las únicas modificaciones son el agrupamiento del state dict del estimador de focal bajo el prefijo `fov.*` junto al state dict de profundidad, y la adición de metadatos de checkpoint LibreYOLO v1.0 con `task="depth"`. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO, ya que la model card no los detalla.

## Capacidades

- Estimación de profundidad métrica (en metros) a partir de una sola imagen RGB.
- Estimación de profundidad en vídeo en streaming, según los tags del repositorio (`video-depth`).
- Recuperación de los intrínsecos de la cámara en formato OpenCV (matriz 3x3) gracias al estimador de focal integrado.
- Salida con valores infinitos en píxeles de cielo, lo que permite filtrar regiones no válidas.
- Integración con la librería LibreYOLO mediante una API de una sola llamada (`LibreYOLO(...).predict(...)`).
- No dispone de capacidades de generación de texto, tool calling, agentes ni multilingüismo, al ser un modelo puramente de visión.

## Casos de uso

- Reconstrucción 3D y fotogrametría: el mapa de profundidad métrica junto con los intrínsecos de cámara permite generar nubes de puntos y mallas a escala real a partir de imágenes individuales, sin calibración manual.
- Realidad aumentada y mixta: la profundidad métrica por fotograma facilita la oclusión correcta de objetos virtuales y la colocación de elementos a distancias reales en el entorno capturado.
- Robótica y navegación: un robot con una sola cámara RGB puede obtener distancias en metros para evitar obstáculos y planificar trayectorias, reduciendo la dependencia de sensores LiDAR o estéreo.
- Edición de vídeo y postproducción: la profundidad por fotograma en streaming permite aplicar desenfoques selectivos, sustitución de fondos y efectos de profundidad de campo simulada de forma coherente entre frames.
- Automoción y análisis de escenas: estimación de distancias a peatones, vehículos y obstáculos desde una cámara monocular, útil en sistemas de asistencia a la conducción o en análisis forense de vídeo.
- Investigación en visión por computador: evaluación de métodos de profundidad monocular y de estimación de focal, con la ventaja de contar con paridad bit a bit frente al código de referencia de Apple.
- Digitalización de interiores y modelado de espacios: generación de mapas de profundidad métricos para reconstruir habitaciones y planos a partir de fotografías, siempre en contexto de investigación no comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 0,2 GB, lo que sugiere un modelo ligero (ViT-S/16) que probablemente quepa en GPU de consumo, pero no se confirma en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; por el tamaño del checkpoint (0,2 GB) es plausible que quepa en tarjetas de gama media, pero no hay datos oficiales.
- Opciones de despliegue: librería LibreYOLO (API `LibreYOLO`), con pesos en formato `.pt`; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de visión de este tipo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LibreDepthPro2s-depth | no disponible | no aplica | Profundidad métrica + focal | apple-amlr (solo investigación) | Hugging Face (LibreYOLO) |
| apple/DepthPro2-S | no disponible | no aplica | Profundidad métrica | apple-amlr | Hugging Face (Apple) |
| apple/DepthPro2-focal | no disponible | no aplica | Estimación de focal | apple-amlr | Hugging Face (Apple) |

No se dispone de datos de rendimiento ni de especificaciones detalladas de alternativas comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Licencia restrictiva: los pesos están bajo la Apple Machine Learning Research Model License Agreement, que limita uso, modificación y redistribución exclusivamente a fines de investigación no comercial (investigación científica y desarrollo académico). No se permite explotación comercial, desarrollo de productos ni uso en productos o servicios comerciales.
- La licencia MIT de LibreYOLO no cubre estos pesos; los usuarios posteriores son los únicos responsables del cumplimiento de los términos.
- Riesgo de alucinación en regiones ambiguas: como todo modelo de profundidad monocular, puede producir estimaciones plausibles pero incorrectas en superficies sin textura, reflexivos o con iluminación extrema.
- Los píxeles de cielo se marcan como infinito, lo que requiere un tratamiento explícito en el postprocesado.
- No hay información sobre sesgos del dataset de entrenamiento ni sobre su composición, lo que impide evaluar sesgos geográficos o de escena.
- No se dispone de datos sobre rendimiento en escenas nocturnas, condiciones meteorológicas adversas o dominios muy distintos al de entrenamiento.
- Al ser un modelo de visión, no soporta texto, tool calling ni agentes; su uso en producción queda además vetado por la licencia.
- No se han publicado benchmarks en la información disponible, por lo que no es posible validar su precisión frente a alternativas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/LibreYOLO/LibreDepthPro2s-depth
- Modelo base DepthPro2-S: https://huggingface.co/apple/DepthPro2-S
- Modelo base DepthPro2-focal: https://huggingface.co/apple/DepthPro2-focal
- Código de referencia de Apple: https://github.com/apple-aiml-research/ml-depth-pro-2/tree/aa389cbb0b74341664ed663a0966c859905cd6c0
- Licencia Apple ML Research Model: https://github.com/apple-aiml-research/ml-depth-pro-2/blob/aa389cbb0b74341664ed663a0966c859905cd6c0/LICENSE_MODEL
- Repositorio LibreYOLO: https://github.com/LibreYOLO/libreyolo
