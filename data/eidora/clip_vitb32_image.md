# EIDORA/CLIP_ViTB32_Image

## Resumen
EIDORA/CLIP_ViTB32_Image es un paquete ONNX del encoder de imagen de CLIP ViT-B/32, publicado por EIDORA dentro de su model zoo. Convierte una imagen de entrada en un vector normalizado de 512 dimensiones, pensado para similitud semántica mediante coseno y para tareas de agrupación y recuperación de imágenes. El repositorio ocupa 0,4 GB y declara ejecución con `CPUExecutionProvider` de ONNX Runtime.

El modelo deriva de `openai/clip-vit-base-patch32`, la arquitectura CLIP de OpenAI que alinea imagen y texto en un espacio vectorial común. Esta variante concreta acepta solo imágenes y no incluye la torre de texto, por lo que su uso directo es la extracción de embeddings visuales y la comparación imagen-imagen. Para búsqueda texto-imagen haría falta combinarla con la variante de texto o multimodal de EIDORA.

Es relevante porque ofrece una vía ligera y reproducible para incorporar embeddings CLIP en pipelines ONNX, especialmente en colecciones culturales, fototecas y sistemas de recuperación visual. No es un modelo generativo: no produce descripciones, respuestas ni código, y no se han publicado benchmarks específicos en la información disponible.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | CLIP ViT-B/32; torre de imagen Vision Transformer con parches de 32x32 y proyección a 512 dimensiones |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no aplica (encoder de imagen; entrada fija de 224x224 px) |
| Tipos de cuantización | no disponible; empaquetado ONNX, precisión no declarada |
| Idiomas soportados | no aplica (esta variante solo procesa imágenes; no incluye encoder de texto) |
| Licencia | no disponible; revisar los términos de `openai/clip-vit-base-patch32` antes de redistribuir o usar en producción |
| Formato de pesos | ONNX; repositorio de 0,4 GB |
| Modelo base | `openai/clip-vit-base-patch32` |
| Dimensiones de embedding | 512 |
| Normalización | sí; vectores normalizados |
| Métrica de similitud | coseno |
| Modalidad | imagen |
| Proveedor declarado | `CPUExecutionProvider` (ONNX Runtime) |
| Preprocesado | redimensionado `short_edge_crop` a 224x224, interpolación bicúbica, `rescale` 0.00392156862745098, media y desviación típica CLIP |
| Layout de entrada | NCHW |

## Arquitectura y entrenamiento
La arquitectura subyacente es CLIP ViT-B/32: una torre de imagen basada en Vision Transformer con parches de 32x32 y una proyección a un espacio compartido de 512 dimensiones. La descripción pública de CLIP indica una torre de imagen de 12 bloques y una torre de texto Transformer de 12 bloques; esta variante de EIDORA expone únicamente la parte de imagen y devuelve embeddings normalizados para similitud coseno.

El modelo base se entrenó con datos públicos de imagen y texto recogidos de internet, aunque el conjunto exacto no fue liberado. No se documenta RLHF, DPO ni un ajuste fino adicional en este paquete. La innovación principal de CLIP es el aprendizaje contrastivo imagen-texto, que produce representaciones visuales alineadas con lenguaje; EIDORA añade un pipeline de preprocesado reproducible y un empaquetado ONNX con proveedor de CPU declarado.

## Capacidades
- Extracción de embeddings de imagen de 512 dimensiones, normalizados y listos para similitud coseno.
- Comparación imagen-imagen para recuperación visual y agrupación semántica.
- Clustering de colecciones de imágenes a partir de distancia coseno.
- Base para búsqueda texto-imagen si se combina con la variante de texto o multimodal de EIDORA.
- Comparación de similitud alineada con lenguaje frente a embeddings puramente visuales como DINO o CNN.
- Preprocesado de imagen documentado y parametrizable: `stretch`, `fill_crop`, `fit_pad` o `short_edge_crop`, con interpolación nearest, bilinear, bicubic o lanczos.
- No soporta generación de texto, tool calling, agentes, razonamiento multi-paso ni capacidades multilingües en esta variante.
- No incluye encoder de texto ni salida de descripciones o etiquetas.

## Casos de uso
- Organización semántica de fototecas: generar embeddings de todas las imágenes y agruparlas por similitud coseno para separar colecciones, eventos o temáticas sin etiquetas manuales.
- Búsqueda visual por imagen de consulta: indexar los vectores de 512 dimensiones y recuperar las imágenes más próximas a una imagen dada, útil en archivos digitales y catálogos.
- Deduplicación y detección de casi duplicados: comparar embeddings normalizados para localizar copias, recortes o variantes de una misma imagen dentro de un repositorio.
- Curaduría de colecciones culturales: usar la similitud alineada con lenguaje como una vista complementaria a embeddings visuales puros, tal como recomienda la model card.
- Pre-filtrado en pipelines multimodales: generar embeddings de imagen para un sistema de recuperación y combinarlos con la variante de texto de EIDORA cuando se necesite búsqueda texto-imagen.
- Análisis y limpieza de datasets: detectar imágenes atípicas, agrupar clases latentes y revisar la distribución visual antes de entrenar o publicar un conjunto de datos.
- Recomendación de imágenes similares: calcular vecinos más cercanos en el espacio CLIP para sugerir contenido visual relacionado en catálogos, museos o plataformas de contenido.
- Control de calidad del preprocesado: comparar embeddings generados con distintas opciones de recorte e interpolación para verificar que el pipeline de producción es consistente.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible. El artefacto ONNX ocupa 0,4 GB, pero no se declara la memoria necesaria en ejecución.
- GPU recomendadas: no disponibles en la información proporcionada. Al ser un modelo ONNX, puede ejecutarse con ONNX Runtime en CPU o con proveedores de ejecución compatibles, pero no se especifican GPU concretas.
- GPU de consumo: por el tamaño del repositorio es plausible que quepa en GPUs de consumo, pero no hay cifras oficiales de VRAM ni validación publicada; conviene medirlo en el entorno objetivo.
- Despliegue: ONNX Runtime con `CPUExecutionProvider` es el proveedor declarado. No se indica soporte para vLLM, llama.cpp, Ollama o TGI, que no son el formato natural de este paquete de embeddings.
- Latencia y throughput: no disponibles. Dependerán del hardware, del tamaño de lote, del proveedor ONNX y de la resolución de entrada.

## Comparativa con modelos similares
| Modelo | Modalidad | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| EIDORA/CLIP_ViTB32_Image | Imagen; embeddings de 512 dimensiones | no disponible | no aplica | no disponible | no disponible | Hugging Face |
| openai/clip-vit-base-patch32 | Imagen y texto en CLIP original; espacio compartido de 512 dimensiones | no disponible | no aplica | no disponible | no disponible en la información | Hugging Face |
| EIDORA/CLIP_ViTB32_Text | Texto, según la variante relacionada | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| EIDORA/CLIP_VITB32 | Imagen; modelo ligero de embeddings visuales | no disponible | no aplica | no disponible | no disponible | Hugging Face |

La comparación directa con CLIP original no es equivalente: `openai/clip-vit-base-patch32` incluye torre de texto y permite alineamiento imagen-texto, mientras que esta variante de EIDORA solo expone imagen. Frente a la variante de texto o multimodal de EIDORA, la elección depende de si el pipeline necesita consultas textuales o únicamente similitud visual.

## Limitaciones y advertencias
- No hay resultados de benchmarks publicados para este paquete, por lo que no se puede afirmar una calidad competitiva sin evaluarlo en el dominio objetivo.
- La licencia no está declarada en la información disponible; la model card remite a revisar los términos del modelo upstream antes de una publicación o uso comercial.
- CLIP se entrenó con datos de internet y su propia model card advierte que es necesario probarlo en la tarea concreta; las colecciones culturales pueden diferir de su distribución de entrenamiento.
- Los embeddings de imagen están influidos por la supervisión lingüística de CLIP; no son una medida puramente visual. Conviene compararlos con modelos visuales como DINO o CNN.
- Esta variante no incluye texto: no sirve por sí sola para búsqueda texto-imagen, clasificación zero-shot con prompts ni tareas que requieran encoder textual.
- No es un modelo generativo; no produce descripciones, respuestas, código ni razonamiento. Tampoco soporta tool calling ni agentes.
- El preprocesado es sensible: cambios en recorte, interpolación, media o desviación típica alteran los embeddings. En producción hay que replicar exactamente la configuración documentada.
- Solo se declara `CPUExecutionProvider`; el uso de otros proveedores ONNX o GPU requeriría validación adicional.
- No se documentan sesgos específicos ni auditorías del espacio de embeddings; los falsos positivos de similitud son posibles y deben revisarse con umbrales y validación humana.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/EIDORA/CLIP_ViTB32_Image
- Modelo base: https://huggingface.co/openai/clip-vit-base-patch32
- Paper de CLIP: https://arxiv.org/abs/2103.00020
- Variante de texto de EIDORA: https://huggingface.co/EIDORA/CLIP_ViTB32_Text
- Variante multimodal de EIDORA: https://huggingface.co/EIDORA/CLIP_ViTB32_Multimodal
- Variante ligera de EIDORA: https://huggingface.co/EIDORA/CLIP_VITB32
- Repositorio de EIDORA/CLIP_ViT-B32: https://huggingface.co/EIDORA/CLIP_ViT-B32/tree/main
- Ficha de OpenAI CLIP ViT-B/32 en exploreai.tools: https://exploreai.tools/ai-models/openai-clip-vit-b-32
- Ficha de clip-ViT-B-32 en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/clip-vit-b-32-sentence-transformers
- Referencia de arquitectura CLIP ViT-B/32 en GitHub: https://github.com/neurarch-ai/awesome-llm-model-zoo/tree/main/architectures/clip-vit-b32
