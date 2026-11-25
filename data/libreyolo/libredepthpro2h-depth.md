# LibreYOLO/LibreDepthPro2h-depth

## Resumen

LibreDepthPro2h-depth es un empaquetado del modelo Apple Depth Pro 2 (variante H, basada en un backbone DINOv3 ViT-H+/16) junto con el estimador de distancia focal complementario de Apple (`DepthPro2-focal`), redistribuido en el formato de checkpoint de LibreYOLO. El modelo original lo desarrolla Apple Machine Learning Research y resuelve estimacion de profundidad metrica a partir de una sola imagen, sin necesidad de datos de calibracion de camara, ademas de soportar profundidad en flujo de video.

La relevancia de este repositorio es practica: agrupa en un unico checkpoint los pesos de profundidad y los del estimador de campo de vision, de modo que la inferencia devuelve directamente un mapa de profundidad en metros junto con la matriz de intrinsecos (formato OpenCV). Los tensores aprendidos se preservan sin cambios respecto a los originales de Apple, con paridad de inferencia verificada bit a bit.

Es importante senalar que este empaquetado no hereda la licencia MIT de LibreYOLO: los pesos estan sujetos a la Apple Machine Learning Research Model License Agreement (`apple-amlr`), que restringe el uso a fines de investigacion no comerciales. El repositorio ocupa 3,6 GB y registra un uso muy bajo (31 descargas, 0 likes) en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ViT (DINOv3 ViT-H+/16) para profundidad, con estimador de distancia focal complementario |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen/video, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (tarea de vision, sin procesamiento de lenguaje) |
| Licencia | Apple Machine Learning Research Model License Agreement (`apple-amlr`), solo investigacion no comercial |
| Formato de pesos | checkpoint LibreYOLO v1.0 (`.pt`); los originales upstream en `safetensors` |

## Arquitectura y entrenamiento

El modelo se apoya en un backbone DINOv3 ViT-H+/16 (patch de 16x16) para la prediccion de profundidad metrica. A este se le anade el estimador `DepthPro2-focal`, que infiere la distancia focal y permite obtener profundidad absoluta en metros a partir de una unica imagen sin calibracion previa. En este repositorio ambos state dicts se empaquetan conjuntamente, con el estimador focal bajo el prefijo de claves `fov.*` y el state dict de profundidad en el mismo checkpoint, junto con metadatos LibreYOLO v1.0 (`task="depth"`).

No se dispone de informacion sobre el numero de tokens o imagenes de entrenamiento, la composicion del dataset ni el uso de tecnicas de alineamiento (RLHF/DPO) en la informacion proporcionada; esos detalles corresponden a la model card original de Apple, no incluida aqui. La unica modificacion respecto a los pesos originales es el reempaquetado y la anadidura de metadatos: todos los tensores de `apple/DepthPro2-H` (revision fijada `68426c789f75a7c760273e857222625b4fe69576`) y `apple/DepthPro2-focal` (revision `622659d44a2002cf9ae4333f2569afa938290d9a`) se conservan sin cambios.

## Capacidades

- Estimacion de profundidad metrica (en metros) a partir de una sola imagen, sin calibracion de camara.
- Estimacion de distancia focal integrada mediante el modelo complementario `DepthPro2-focal`.
- Profundidad en flujo de video (streaming video depth), segun los tags del repositorio.
- Salida de intrinsecos de camara en formato OpenCV (matriz 3x3) junto al mapa de profundidad.
- Marca de pixeles de cielo como infinito (`inf`) en el mapa de profundidad.
- No es un modelo de lenguaje: no soporta generacion de texto, tool calling, agentes ni capacidades multilingues.

## Casos de uso

- Reconstruction 3D y fotogrametria: el mapa de profundidad metrica y los intrinsecos permiten generar nubes de puntos a partir de una sola imagen sin calibracion manual.
- Realidad aumentada: la profundidad absoluta en metros facilita la oclusion correcta de objetos virtuales sobre la escena real.
- Robotica y navegacion: estimacion de distancias a obstaculos desde una camara monocular, util en plataformas con restricciones de peso o coste.
- Procesado de video: la capacidad de profundidad en streaming permite generar mapas de profundidad por fotograma en secuencias.
- Edicion y postproduccion: generacion de mapas de profundidad para desenfoque de fondo, rotoscopia o efectos de profundidad de campo.
- Analisis de escenas y datasets de vision: etiquetado automatico de profundidad para entrenar o validar otros modelos.
- Investigacion academica en vision por computador: reproduccion de resultados con paridad de inferencia respecto a los pesos originales de Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El repositorio pesa 3,6 GB, lo que da una cota inferior orientativa del espacio necesario para los pesos; el backbone ViT-H+/16 implica un coste de activaciones adicional no cuantificado en la informacion.
- GPU recomendadas: no disponible. Por el tamano del backbone (ViT-H) se espera que requiera GPU con memoria generosa, pero no se aportan datos concretos.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Opciones de despliegue: la libreria `libreyolo` (API `LibreYOLO(...).predict(...)`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo de vision de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo de salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LibreDepthPro2h-depth | no disponible (ViT-H+/16) | no aplica | Profundidad metrica + intrinsecos | `apple-amlr` (solo investigacion) | Hugging Face (LibreYOLO) |
| apple/DepthPro2-H | no disponible | no aplica | Profundidad metrica | `apple-amlr` | Hugging Face (Apple) |
| apple/DepthPro2-focal | no disponible | no aplica | Distancia focal | `apple-amlr` | Hugging Face (Apple) |

No se dispone de datos de rendimiento ni de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia restrictiva: los pesos estan bajo `apple-amlr`, que limita uso, modificacion y redistribucion exclusivamente a fines de investigacion no comerciales. No se permite explotacion comercial, desarrollo de producto ni uso en productos o servicios comerciales.
- No hereda la licencia MIT de LibreYOLO; los usuarios posteriores son responsables del cumplimiento de la licencia de Apple.
- Modelo de vision: no procesa texto ni lenguaje, por lo que no aplican capacidades de generacion, agentes o multilingues.
- Riesgo de error en profundidad metrica en escenas fuera de distribucion, aunque no se documentan sesgos concretos en la informacion disponible.
- Los pixeles de cielo se marcan como `inf`; el codigo consumidor debe gestionar ese valor.
- Uso muy bajo y sin validacion comunitaria (31 descargas, 0 likes): no hay evidencia publica de robustez en produccion.
- No se documentan requisitos de hardware, latencias ni limites de resolucion de entrada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/LibreYOLO/LibreDepthPro2h-depth
- Modelo base de profundidad: https://huggingface.co/apple/DepthPro2-H
- Modelo base focal: https://huggingface.co/apple/DepthPro2-focal
- Codigo de referencia upstream: https://github.com/apple-aiml-research/ml-depth-pro-2/tree/aa389cbb0b74341664ed663a0966c859905cd6c0
- Licencia del modelo (Apple): https://github.com/apple-aiml-research/ml-depth-pro-2/blob/aa389cbb0b74341664ed663a0966c859905cd6c0/LICENSE_MODEL
- Repositorio LibreYOLO: https://github.com/LibreYOLO/libreyolo
