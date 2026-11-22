# KedarSabuk/lumenu-android-venue-models

## Resumen

Lumenu Android venue photo models es un conjunto de cuatro grafos ONNX publicados por el desarrollador KedarSabuk para el análisis local de fotografías de restaurantes en la aplicación Android Lumenu. No se trata de un modelo de lenguaje, sino de un paquete de modelos de visión y recuperación multimodal empaquetados para inferencia en dispositivo (on-device), sin conexión a servidores externos. El repositorio ocupa 0,2 GB y contiene únicamente pesos en formato ONNX.

El paquete combina tres componentes de origen distinto: TinyCLIP (extracción de embeddings de imagen para clasificar escenas y comida), YuNet (detección de caras) y dos torres del Perception Encoder PE-Core-S16-384 de Meta (una de imagen y otra de texto) para el ranking local de fotografías frente a nombres de platos de una carta. Los cuatro ficheros se distribuyen con nombres basados en su hash SHA-256 y con licencias MIT y Apache-2.0 según el componente.

Su relevancia es práctica: ejemplifica el patrón de despliegue de modelos pequeños cuantizados en Android mediante ONNX Runtime, con huellas verificables y avisos de licencia incrustados en los propios grafos. No hay información publicada sobre benchmarks, idiomas soportados ni datos de entrenamiento propios, ya que el autor no entrena modelos nuevos, sino que exporta y adapta checkpoints existentes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cuatro grafos ONNX: TinyCLIP ViT (imagen), YuNet (detección de caras), PE-Core-S16-384 torre de imagen y torre de texto |
| Parametros totales | No disponible (TinyCLIP ViT-40M/32 con texto de 19M según el checkpoint base; PE-Core-S16-384 sin cifra publicada en la información) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelos de visión; la torre de texto de PE-Core procesa nombres de platos, sin contexto declarado) |
| Tipos de cuantizacion | Pesos cuantizados para Android en los dos grafos de PE-Core; TinyCLIP parte de una conversión ONNX INT8 con la convolución de parches reconstruida en FP32; YuNet sin cambios respecto al original |
| Idiomas soportados | No disponible |
| Licencia | MIT (image.onnx, yunet.onnx) y Apache-2.0 (rank-image.onnx, rank-text.onnx); licencia agregada del repo: mit-and-apache-2.0 |
| Formato de pesos | ONNX |

Tamaño exacto de cada fichero:

| Modelo | Grupo | Licencia | Bytes |
|---|---|---:|---:|
| image.onnx | profile | MIT | 45.272.626 |
| yunet.onnx | profile | MIT | 229.738 |
| rank-image.onnx | rank | Apache-2.0 | 36.341.198 |
| rank-text.onnx | rank | Apache-2.0 | 68.538.971 |

## Arquitectura y entrenamiento

El paquete no entrena ningún modelo desde cero. `image.onnx` deriva de TinyCLIP-ViT-40M-32-Text-19M-LAION400M, un CLIP destilado de tipo ViT con parche de 32 y torre de texto de 19M de parámetros, entrenado originalmente sobre LAION-400M. Lumenu extrajo el grafo de imagen de la conversión ONNX INT8 de la comunidad y reconstruyó la convolución de parches en FP32 para su ejecución en ARM bajo Android. `yunet.onnx` es el grafo original de detección de caras de OpenCV Zoo, distribuido sin modificaciones.

Los dos grafos de ranking provienen de PE-Core-S16-384 de Meta: un Perception Encoder con ViT de parche 16 y resolución 384, del que Lumenu exportó las torres de imagen y texto a ONNX y cuantizó sus pesos para Android. Cada grafo incorpora en sus metadatos el aviso de copyright, la revisión de código fuente, la nota de modificación y la referencia a la licencia Apache-2.0. No se documentan datos de entrenamiento adicionales, procesos de RLHF/DPO ni innovaciones de decodificación; la aportación técnica del autor es el empaquetado, la cuantización y la reconstrucción de capas para inferencia móvil.

## Capacidades

- Extracción de embeddings de imagen con TinyCLIP para clasificar escenas de restaurante y tipos de comida.
- Detección de caras en fotografías con YuNet, con las salidas habituales del detector de OpenCV Zoo (cajas, landmarks y puntuaciones).
- Embedding de imagen con la torre visual de PE-Core-S16-384 a resolución 384.
- Embedding de texto con la torre textual de PE-Core-S16-384, aplicado a nombres de platos de una carta.
- Ranking local por similitud entre la fotografía y los nombres de platos del menú, sin llamadas a red.
- Inferencia en dispositivo mediante ONNX Runtime en Android ARM.
- Verificación de integridad por hash SHA-256 en el nombre de cada fichero.
- No soporta generación de texto, tool calling, razonamiento multi-paso, agentes, audio ni modo thinking.

## Casos de uso

- Clasificación automática de fotos de local: la app ejecuta `image.onnx` sobre cada imagen capturada para obtener un embedding y asignar una categoría de escena (interior, terraza, plato, carta), útil para organizar la galería del usuario sin subir datos a la nube.
- Detección y anonimización de caras: `yunet.onnx` localiza rostros antes de publicar o compartir una foto del restaurante, permitiendo difuminarlos en el propio dispositivo y cumpliendo requisitos de privacidad.
- Vinculación foto-plato en la carta: las torres de PE-Core generan embeddings de la imagen y de los nombres de platos, y el ranking por similitud sugiere qué plato corresponde a cada fotografía tomada por el usuario.
- Búsqueda visual dentro del historial: con los embeddings de TinyCLIP se puede indexar localmente la galería y permitir búsquedas por similitud visual entre visitas a distintos locales.
- Moderación previa en la app: detección de caras y clasificación de escena para filtrar contenido no deseado (por ejemplo, fotos de personas en primer plano) antes de adjuntarlo a una reseña.
- Funcionamiento sin conectividad: al ser grafos ONNX de 0,2 GB en total, el paquete permite todas las funciones anteriores en modo avión o con conexión intermitente, escenario habitual en interiores de restaurantes.
- Distribución verificable en tiendas de aplicaciones: los nombres con SHA-256 y los avisos de licencia embebidos facilitan auditorías de cadena de suministro y el cumplimiento de licencias en la publicación en Google Play.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Tampoco se documentan métricas de latencia ni de throughput en Android para ninguno de los cuatro grafos.

## Requisitos de hardware

- Inferencia en dispositivo Android sobre CPU ARM mediante ONNX Runtime; no se especifican versiones mínimas de la API de Android ni de ONNX Runtime.
- Huella en disco de 0,2 GB para el conjunto completo; los grafos pueden cargarse por separado según la función (perfil o ranking).
- `image.onnx` (45,3 MB) y `yunet.onnx` (0,2 MB) son los más ligeros y aptos para ejecutarse en cualquier teléfono moderno; los dos grafos de PE-Core (36,3 MB y 68,5 MB) son los más costosos en cómputo por su resolución de 384 y su torre de texto.
- No se indica VRAM ni GPU recomendada porque el destino es CPU móvil; no hay datos sobre aceleración por GPU móvil, NNAPI o DSP.
- Opciones de despliegue: ONNX Runtime para Android; también podría ejecutarse en escritorio con ONNX Runtime o con herramientas compatibles con ONNX, aunque no está documentado por el autor.
- No hay cifras de latencia ni de throughput publicadas.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Lumenu Android venue photo models | Paquete ONNX (CLIP + detector de caras + PE-Core) | No disponible (TinyCLIP ViT-40M/32 + PE-Core-S16-384) | No aplica | MIT + Apache-2.0 | ONNX | Hugging Face, 0 descargas |
| TinyCLIP-ViT-40M-32-Text-19M-LAION400M (wkcn) | CLIP destilado imagen-texto | 40M visión + 19M texto | No aplica | No disponible en la información | Safetensors / ONNX en la comunidad | Hugging Face |
| PE-Core-S16-384 (facebook) | Perception Encoder imagen-texto | No disponible en la información | No aplica | Apache-2.0 | Safetensors | Hugging Face |
| YuNet (OpenCV Zoo) | Detector de caras | No disponible en la información | No aplica | MIT | ONNX | GitHub / OpenCV Zoo |

La comparativa directa con alternativas de la misma categoría (paquetes ONNX para Android) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, no razona y no soporta instrucciones; cualquier expectativa de uso como LLM es incorrecta.
- No hay información sobre sesgos demográficos o culturales en la clasificación de escenas ni en la detección de caras; YuNet y los CLIP pueden heredar sesgos de sus datos originales.
- Riesgo de falsos positivos y negativos en la detección de caras en condiciones de poca luz, oclusión o ángulos extremos, no cuantificado en la información.
- El ranking foto-plato depende de la calidad de los embeddings de PE-Core cuantizados; la cuantización para Android puede degradar la precisión respecto al checkpoint original de Meta, sin métricas publicadas que lo confirmen.
- Idiomas soportados no declarados: la torre de texto de PE-Core se ha usado con nombres de platos, pero no se especifica qué lenguas cubre ni su rendimiento fuera del inglés.
- La licencia agregada es mixta (MIT y Apache-2.0) y el campo `license` del repo figura como `other` con `license_name: mit-and-apache-2.0`; es obligatorio conservar los avisos de copyright y las notas de modificación embebidas en los grafos de PE-Core para cumplir con Apache-2.0.
- El repositorio tiene 0 descargas y 0 likes, sin validación externa ni tests publicados; conviene auditar los grafos antes de integrarlos en producción.
- No se documentan versiones mínimas de ONNX Runtime ni de Android, ni el consumo de memoria en tiempo de ejecución.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/KedarSabuk/lumenu-android-venue-models
- Licencias y avisos: https://huggingface.co/KedarSabuk/lumenu-android-venue-models/blob/main/LICENSE.txt
- Checkpoint TinyCLIP: https://huggingface.co/wkcn/TinyCLIP-ViT-40M-32-Text-19M-LAION400M
- Conversión ONNX de TinyCLIP (revisión de la comunidad): https://huggingface.co/onnx-community/TinyCLIP-ViT-40M-32-Text-19M-LAION400M-ONNX/tree/737108a175dc6c043d9e64cf738baa91a272f7cb
- YuNet en OpenCV Zoo: https://github.com/opencv/opencv_zoo/tree/47534e27c9851bb1128ccc0102f1145e27f23f98/models/face_detection_yunet
- Checkpoint PE-Core-S16-384 de Meta: https://huggingface.co/facebook/PE-Core-S16-384/tree/aabf3b990573d8114ae6e501b4697106beac8f19
- Código fuente de Perception Models: https://github.com/facebookresearch/perception_models/tree/3e352cca660658d4b5c90f42a7808b11469e4c66
