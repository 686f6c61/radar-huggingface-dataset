# mydubber-org/yamnet-onnx

## Resumen

YAMNet es un clasificador de eventos sonoros desarrollado originalmente por Google, basado en la arquitectura MobileNetV1 y entrenado sobre el corpus AudioSet con 521 clases. Este repositorio concreto, publicado por la organización mydubber-org, no es un modelo nuevo: es una conversión del SavedModel original de TensorFlow 2 a formato ONNX mediante tf2onnx, sin reentrenamiento, cuantización ni poda de pesos. El objetivo declarado por el autor es integrar el clasificador en un pipeline de doblaje (myDubber) que distingue voz hablada de otros contenidos presentes en una pista de audio, como música o canto, para decidir qué segmentos deben doblarse.

El modelo es relevante por su tamaño reducido (3,7 millones de parámetros) y su formato ONNX, que permite ejecución portable con ONNX Runtime en CPU sin dependencias de TensorFlow. La ventana de análisis es de 0,96 segundos con un salto de 0,48 segundos, lo que proporciona una resolución temporal razonable para tareas de segmentación de audio.

Se trata de un artefacto de infraestructura más que de un modelo de propósito general: no genera texto, no razona y no soporta instrucciones. Su utilidad se limita a la clasificación de audio en 521 categorías predefinidas por la ontología AudioSet.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV1 (CNN, clasificador de audio) |
| Parametros totales | 3,7 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; ventana de audio de 0,96 s con salto de 0,48 s |
| Tipos de cuantizacion | no disponible (pesos sin cuantizar, en FP32) |
| Idiomas soportados | no disponible (clasificador de audio, no lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 15) |

## Arquitectura y entrenamiento

YAMNet emplea una red convolucional MobileNetV1 con separables en profundidad, alimentada con espectrogramas log-mel calculados internamente a partir de forma de onda mono a 16 kHz. La salida es una matriz de puntuaciones por fotograma sobre las 521 clases de AudioSet, con una clasificación agregada disponible mediante la media de las puntuaciones por fotograma. Los pesos provienen del SavedModel `google/yamnet` versión 1 (sha256 del archivo `b80da2a1a56926fb0767205051a200dd7b3beaf3ea1ea126c42a53943996e5e0`).

La conversión se realizó con `tf2onnx.convert` sobre TensorFlow 2.15.1 y tf2onnx 1.16.1, generando un grafo de opset 15. El autor declara explícitamente que no se entrenó, cuantizó ni podó nada: las puntuaciones coinciden con las del SavedModel original con una tolerancia de 0,001 en la comprobación de build. El mapa de clases `yamnet_class_map.csv` es el original del SavedModel. No se dispone de información sobre el proceso de entrenamiento original de Google (composición exacta del dataset, número de tokens o muestras, técnicas de regularización) en la información proporcionada.

## Capacidades

- Clasificación de audio en 521 clases de la ontología AudioSet, con puntuaciones por fotograma y agregadas.
- Detección de voz hablada frente a otros eventos sonoros (música, canto, ruido ambiental) mediante la clase 0 (`Speech`).
- Procesamiento de forma de onda mono a 16 kHz de longitud arbitraria, con remuestreo interno a ventanas de 0,96 s y salto de 0,48 s.
- Ejecución portable con ONNX Runtime en CPU, sin dependencia de TensorFlow.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No dispone de capacidades multilingües ni de comprensión semántica del contenido lingüístico.

## Casos de uso

- Segmentación de voz para doblaje: el pipeline calcula la media de la puntuación de la clase `Speech` por fotograma y deja intactos los segmentos que no superan el umbral, evitando doblar canciones o música de fondo en una pista de vídeo.
- Detección de contenido musical en emisiones en directo: permite marcar tramos con música o canto para tratamientos diferenciados (ecualización, subtitulado o exclusión de doblaje).
- Preprocesado de datasets de audio: clasificación automática de grabaciones en categorías AudioSet para filtrar, etiquetar o balancear corpus antes de entrenar otros modelos.
- Monitorización de entornos: detección de eventos acústicos concretos (cristales, alarmas, tráfico) en sistemas de vigilancia o domótica con recursos de cómputo limitados.
- Moderación de contenido en plataformas de audio: identificación de segmentos con música protegida o contenido no deseado para revisión posterior.
- Análisis de calidad de llamadas: separación de tramos de voz y no voz para calcular métricas de actividad o detectar silencios y ruido en grabaciones de atención al cliente.
- Integración en pipelines de CI/CD de procesamiento de audio: al ser un artefacto ONNX de 15,3 MB, puede empaquetarse en contenedores ligeros y ejecutarse en CPU dentro de flujos automatizados de validación de audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta una comprobación de equivalencia numérica frente al SavedModel original (diferencia máxima de 0,001 en las puntuaciones), no métricas de precisión, recall o mAP sobre AudioSet.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en CPU; en GPU, el modelo de 15,3 MB en FP32 ocupa del orden de decenas de MB incluyendo buffers de activación, por lo que cabe en cualquier GPU con más de 1 GB de memoria.
- GPU recomendadas: no requiere GPU; funciona en CPU con ONNX Runtime. Cualquier GPU moderna (RTX 3060 o superior, A100, H100) acelera la inferencia pero no es necesaria.
- Cabe en cualquier GPU de consumo e incluso en dispositivos embebidos con CPU ARM.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), con posibilidad de exportación adicional a otros runtimes compatibles con ONNX.
- Latencia y throughput estimados: no disponibles en la información proporcionada; el tamaño del modelo sugiere latencias de milisegundos por ventana en CPU, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / ventana | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YAMNet (este repo) | 3,7 M | 0,96 s, salto 0,48 s | ONNX | Apache-2.0 | Hugging Face, Kaggle (original TF) |
| YAMNet original (Google) | 3,7 M | 0,96 s, salto 0,48 s | SavedModel TF2 | Apache-2.0 | Kaggle Models |
| Otros clasificadores AudioSet | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al propio modelo original, ya que la información proporcionada no incluye datos de alternativas como PANNs, AST o BEATs. No se dispone de métricas comparativas de rendimiento.

## Limitaciones y advertencias

- No es un modelo nuevo ni afinado: replica los pesos de YAMNet original, por lo que hereda sus sesgos y limitaciones de la ontología AudioSet.
- La ontología AudioSet está sesgada hacia eventos y contextos presentes en YouTube, lo que puede reducir la precisión en dominios acústicos distintos (audio telefónico, entornos industriales, lenguas no representadas).
- Riesgo de falsos negativos en la detección de voz: voces susurradas, con fuerte acento, con ruido de fondo o en idiomas poco representados pueden clasificarse por debajo del umbral de `Speech`.
- Riesgo de falsos positivos: música con vocalizaciones o canto pueden activar la clase `Speech`, lo que en el pipeline de doblaje provocaría doblar contenido que no debería doblarse.
- La resolución temporal está limitada a ventanas de 0,96 s con salto de 0,48 s; eventos más cortos pueden no detectarse de forma fiable.
- No proporciona transcripción, identificación de hablante ni comprensión semántica del contenido.
- Licencia Apache-2.0 permite uso comercial, pero la propiedad intelectual del modelo es de Google LLC y la ontología AudioSet está bajo CC BY 4.0, lo que exige atribución.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamaño reportado es de 0,0 GB pese a que el archivo pesa 15,3 MB; conviene verificar la integridad mediante el sha256 indicado (`844ee869ca5426d12c6aa1876280c40099487bda74827da1ccbeeaffbe7143dd`).
- No se han publicado evaluaciones independientes de esta conversión concreta; la única validación es la equivalencia numérica declarada por el autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mydubber-org/yamnet-onnx
- Modelo original en Kaggle: https://www.kaggle.com/models/google/yamnet/tensorFlow2/yamnet/1
- Script de conversión (repositorio dubber): https://github.com/vladbehash/dubber/blob/main/tools/model-builds/src/model_builds/yamnet.py
- Ontología AudioSet (Google, CC BY 4.0): https://research.google.com/audioset/
