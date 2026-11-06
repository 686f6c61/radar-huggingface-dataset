# KaraKaraWitch/haruka-tagger-alpha

## Resumen

Haruka-Tagger Alpha es un etiquetador automático de imágenes de anime (image tagger) desarrollado por KaraKaraWitch. Su función es predecir, a partir de una ilustración, el conjunto de etiquetas de Danbooru que le corresponden: personajes, franquicias (copyright), artistas, etiquetas generales (rasgos visuales), franja temporal y clasificación por rating. Resuelve el problema clásico del etiquetado y la indexación de grandes volúmenes de imágenes de anime para búsqueda, filtrado y curación de datasets.

El modelo se construye sobre el backbone EVA02-Base a resolución 448×448, al que se añade una cabeza de pooling por atención multi-cabeza (`MHAttnPool`) y una capa lineal de clasificación sobre un vocabulario de 98.726 etiquetas. Se ha entrenado sobre aproximadamente 9,25 millones de publicaciones de Danbooru deduplicadas por wHash, con datos hasta 2026. El total de parámetros es de 164 millones y el repositorio ocupa 1,3 GB, con pesos en safetensors y ONNX.

La relevancia actual del modelo radica en su cobertura de vocabulario (casi 100.000 etiquetas, incluyendo personajes y franquicias de 2025-2026) y en su distribución en un único fichero ONNX autocontenido, lo que simplifica el despliegue. No obstante, se trata de una versión Alpha (etapa 2, v3): el propio autor advierte de limitaciones de calibración en etiquetas de artista, imágenes grupales y etiquetas generales muy específicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision transformer EVA02-Base (patch 14, 448×448) + MHAttnPool + cabeza lineal |
| Parametros totales | 164 M (86,3 M backbone + 1,8 M pooling + 75,9 M cabeza) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión, entrada de imagen 448×448) |
| Tipos de cuantizacion | No disponible (pesos en FP32; sin variantes cuantizadas publicadas) |
| Idiomas soportados | No disponible (las etiquetas son en inglés, formato Danbooru) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y ONNX (Opset 18, fichero único autocontenido) |

## Arquitectura y entrenamiento

El modelo parte del backbone `eva02_base_patch14_448.mim_in22k_ft_in22k_in1k`, un vision transformer de 86,3 M de parámetros preentrenado con MIM (masked image modeling) y ajustado en ImageNet-1k. Sobre las características del backbone se aplica `MHAttnPool`, un mecanismo de pooling por atención multi-cabeza con una única consulta global (`1 × 768`) que agrega la información espacial en un vector de 768 dimensiones. Ese vector alimenta una capa lineal de 768 a 98.726 salidas, una por etiqueta, con activación sigmoide independiente por etiqueta (clasificación multietiqueta).

El entrenamiento usa aproximadamente 9,25 millones de imágenes de Danbooru deduplicadas por wHash, con corte en 2026. La etapa 1 empleó Inverse Repeat Factor Sampling (IRFS) con un suelo de sesgo limitado a `-4.5` para compensar el desbalance extremo entre etiquetas frecuentes y raras. El preprocesado es un redimensionado BICUBIC que preserva la relación de aspecto con relleno blanco (255) hasta 448×448 y normalización ImageNet. El autor documenta que los experimentos de calibración de logits de bajo rango fracasaron y que la cabeza multi-query está en desarrollo; esta versión es la línea base de consulta única tras un post-entrenamiento.

## Capacidades

- Clasificación multietiqueta de imágenes de anime en seis categorías: artista, personaje, general, copyright, año/era y rating.
- Predicción de personajes y franquicias con cobertura hasta 2026 (31.454 personajes, 7.084 copyrights).
- Etiquetado de rasgos visuales generales (21.743 etiquetas: ropa, peinado, expresión, composición, etc.).
- Clasificación de rating en cuatro clases (`g`, `s`, `q`, `e`).
- Señal temporal aproximada mediante 21 etiquetas de era con ventanas deslizantes de tres años.
- Inferencia por lotes mediante ONNX Runtime con proveedores CUDA y CPU.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es un clasificador puro.
- No dispone de capacidades multilingües ni de procesamiento de audio o vídeo.

## Casos de uso

- Indexación y búsqueda de bibliotecas de imágenes: ejecutar el tagger sobre cada archivo de una colección y almacenar las etiquetas con probabilidad superior al umbral recomendado, habilitando búsquedas por personaje, franquicia o rasgo visual.
- Curación de datasets de entrenamiento: filtrar imágenes por personaje, copyright o rating para construir datasets equilibrados o excluir contenido según la clasificación `g/s/q/e`.
- Moderación y clasificación de contenido: usar la salida de rating (81,08 % de acierto top-1) como primera pasada para separar contenido seguro de contenido explícito antes de una revisión humana.
- Etiquetado asistido en plataformas de publicación: sugerir etiquetas al usuario al subir una ilustración, aplicando umbrales por categoría (0,20-0,25 para artista, 0,30-0,40 para personaje, 0,35 para general y copyright).
- Análisis de tendencias estilísticas: agregar las etiquetas de era y de artista sobre un corpus para estudiar la evolución temporal de estilos y autores.
- Preanotación para anotadores humanos: generar una propuesta inicial de etiquetas que el anotador corrige, reduciendo el coste de anotación manual en pipelines de datos.
- Integración en servicios de inferencia ligeros: al ser un único fichero ONNX de unos 656 MB en FP32, puede desplegarse en contenedores sin dependencias de frameworks de deep learning completos.

## Benchmarks y rendimiento

Resultados de validación publicados en la model card (Micro-F1 a umbral 0,50 y Macro AUROC):

| Categoria | Etiquetas | Umbral recomendado | Val Micro-F1 (@0,50) | Val Macro AUROC |
|---|---:|---:|---:|---:|
| Artista | 38.420 | 0,20 – 0,25 | 45,0 % (a 0,35) | 99,34 % |
| Personaje | 31.454 | 0,30 – 0,40 | 70,19 % (84,0 % precisión) | 99,85 % |
| General | 21.743 | 0,35 | 59,15 % | 97,71 % |
| Copyright | 7.084 | 0,35 | 66,48 % (77,1 % precisión) | 99,28 % |
| Año / Era | 21 | Top-1 | 60,05 % | 89,84 % |
| Rating | 4 | Top-1 | 81,08 % | 95,43 % |
| Total | 98.726 | 0,35 (global) | 60,67 % | 99,06 % |

No se han publicado comparaciones directas con otros taggers en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 2 GB en FP32 (164 M de parámetros, unos 656 MB de pesos, más activaciones de una imagen 448×448).
- GPU recomendadas: cualquier GPU con soporte CUDA para ONNX Runtime; una RTX 3060 o superior es más que suficiente. Para lotes grandes, A100 o H100 permiten mayor throughput.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 2 GB de VRAM; también funciona en CPU con ONNX Runtime (CPUExecutionProvider).
- Opciones de despliegue: ONNX Runtime (CUDA o CPU), con el fichero `haruka-tagger.onnx` y el JSON de metadatos `haruka-tagger_metadata.json`. Los pesos safetensors permiten cargar el modelo en PyTorch, aunque la model card solo documenta el flujo ONNX.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Vocabulario | Entrada | Licencia | Formato |
|---|---:|---:|---|---|---|
| Haruka-Tagger Alpha | 164 M | 98.726 etiquetas | 448×448 | Apache 2.0 | safetensors, ONNX |
| WD14 Tagger (variantes) | No disponible | No disponible | No disponible | No disponible | No disponible |
| DeepDanbooru | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos verificados de parámetros, contexto ni benchmarks de los modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Versión Alpha: el autor reconoce problemas de calibración pendientes y no la presenta como una v1.0 estable.
- Etiquetas de era aproximadas por diseño: son ventanas deslizantes solapadas de tres años, no marcas temporales exactas de subida.
- Artistas poco fiables: el oversampling IRFS con suelo de sesgo `-4.5` sobreestimula artistas raros (50-300 publicaciones) y rasgos de personaje o franquicia pueden contaminar la predicción de artista. Se recomienda umbral bajo (0,20-0,25) y tratar la salida como candidato estilístico.
- Imágenes grupales y banners: el pooling de consulta única promedia rasgos de varios personajes y puede generar personajes "quimera" o silenciar personajes pequeños del fondo.
- Etiquetas generales muy específicas: ruidosas por anotación incompleta en Danbooru.
- Riesgo de falsos positivos y negativos en todas las categorías; los umbrales recomendados son un punto de partida que conviene calibrar por caso de uso.
- Sesgos heredados del corpus Danbooru: distribución desigual de franquicias, artistas y estilos, con posible infrarrepresentación de contenido reciente o minoritario.
- Licencia Apache 2.0: permite uso comercial, pero el modelo se distribuye sin garantías y el autor no ofrece soporte.
- Solo procesa imágenes; no admite texto, audio ni otras modalidades.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KaraKaraWitch/haruka-tagger-alpha
- Modelo base: https://huggingface.co/KaraKaraWitch/haruka-eva02-base-448
- Ficha en Free2AITools: https://free2aitools.com/model/karakarawitch/haruka-tagger-alpha
- Backbone EVA02 (timm): https://github.com/huggingface/pytorch-image-models
- ONNX Runtime: https://onnxruntime.ai/
