# alphaedge-ai/siglip2-giant-opt-patch16-384-bak-16384

## Resumen

SigLIP 2 Giant Opt Patch16 384 (versión trimmeada para bashkir) es un modelo de visión-lenguaje derivado de `google/siglip2-giant-opt-patch16-384`, publicado por el usuario `alphaedge-ai`. Se trata de un encoder multimodal SigLIP 2 al que se le ha aplicado la técnica de *trimming* de vocabulario: se ha reducido el vocabulario del tokenizador de texto de 256.000 a 16.384 tokens, conservando únicamente los tokens relevantes para el idioma bashkir. El resultado es una reducción del 93,60% en el tamaño del vocabulario y del 14,75% en el número total de parámetros (de 1.871.885.426 a 1.595.847.794).

El modelo mantiene la arquitectura original de SigLIP 2 (encoder de visión con parches de 16x16 a resolución 384 y encoder de texto tipo transformer), pero con una cabeza de embedding de texto mucho más pequeña. Está pensado para tareas de clasificación de imágenes zero-shot y similitud texto-imagen en bashkir, y se distribuye a través de `sentence-transformers` y del pipeline `zero-shot-image-classification` de Transformers.

Su relevancia es doble: por un lado, demuestra el impacto real del *trimming* de vocabulario en modelos multimodales grandes (ahorro de ~276 millones de parámetros y de espacio en disco); por otro, ejemplifica la adaptación de un modelo multilingüe de gran tamaño a una lengua de bajos recursos como el bashkir, con licencia Apache 2.0 y solo 14 descargas en el momento de la consulta. Es un modelo de nicho, no un modelo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SigLIP 2 (encoder de visión ViT con parches 16x16 a 384 px + encoder de texto transformer), variante "giant opt" |
| Parámetros totales | 1.595.847.794 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de embeddings, no generativo) |
| Tipos de cuantización | no disponible (repo en safetensors; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | bashkir (ba); el resto de idiomas puede degradarse por la reducción de vocabulario |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 6,4 GB |
| Vocabulario (original / trimmeado) | 256.000 / 16.384 tokens |
| Resolución de entrada de imagen | 384 x 384 (parches 16x16) |
| Modelo base | google/siglip2-giant-opt-patch16-384 |
| Librería | sentence-transformers |
| Pipeline | zero-shot-image-classification |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura SigLIP 2 descrita en el paper arXiv:2502.14786 (Tschannen et al., 2025): un encoder de visión tipo ViT con parches de 16x16 sobre imágenes de 384x384 y un encoder de texto transformer, entrenados con una función de pérdida sigmoidea en lugar de softmax contrastivo. La variante "giant opt" del modelo base incorpora las mejoras de SigLIP 2 en comprensión semántica, localización y características densas, así como entrenamiento multilingüe.

La modificación introducida por `alphaedge-ai` no afecta a los pesos del encoder de visión ni a la mayor parte del encoder de texto: se ha aplicado *trimming* de vocabulario, una técnica documentada en el blog de Hugging Face (lbourdois et al., 2026) que consiste en identificar los tokens realmente utilizados en un corpus del idioma objetivo y recortar la matriz de embeddings y la cabeza de salida a ese subconjunto. En este caso se usaron 179.964 textos del dataset `lbourdois/fineweb-2-trimming` en bashkir para determinar qué tokens conservar. No se documenta un reentrenamiento posterior ni ajuste fino adicional: el modelo trimmeado "debería comportarse de forma similar al original" según el autor, aunque no se aportan métricas que lo verifiquen. No hay información sobre RLHF, DPO ni datos de entrenamiento adicionales más allá del corpus de minería de tokens.

## Capacidades

- Clasificación de imágenes zero-shot: asignar etiquetas textuales (en bashkir) a una imagen y obtener puntuaciones de probabilidad.
- Similitud texto-imagen: generar embeddings conjuntos para imágenes y textos, útiles para búsqueda y recuperación multimodal.
- Embeddings de imagen y de texto independientes, utilizables con `SentenceTransformer.encode`.
- Soporte de etiquetas candidatas arbitrarias en bashkir (no requiere clases predefinidas en el entrenamiento).
- Capacidad multilingüe reducida: el vocabulario recortado elimina tokens poco frecuentes en bashkir, lo que puede degradar el rendimiento en otros idiomas.
- No es un modelo generativo: no produce texto libre, no soporta tool calling, ni razonamiento multi-paso, ni agentes.
- No dispone de modo *thinking*, audio ni vídeo documentados.

## Casos de uso

- Moderación de contenido visual en plataformas en bashkir: clasificar imágenes entrantes contra un conjunto de etiquetas de política (por ejemplo, "contenido violento", "desnudo", "spam") usando el pipeline `zero-shot-image-classification` con etiquetas redactadas en bashkir, sin necesidad de entrenar un clasificador específico.
- Búsqueda multimodal en catálogos locales: indexar imágenes de productos con `encode` y comparar con consultas textuales en bashkir mediante similitud coseno, aprovechando que el modelo genera embeddings alineados en un espacio común.
- Etiquetado automático de archivos fotográficos para medios en lengua bashkir: generar etiquetas descriptivas a partir de un vocabulario controlado en bashkir y asignar la más probable a cada imagen, reduciendo el trabajo manual de catalogación.
- Filtrado de imágenes en datasets de investigación lingüística: usar el modelo para seleccionar o descartar imágenes según criterios textuales en bashkir antes de incorporarlas a corpus de entrenamiento o evaluación.
- Accesibilidad: descripción de imágenes mediante clasificación contra un conjunto cerrado de conceptos en bashkir, útil en aplicaciones de asistencia para personas con discapacidad visual en entornos bashkirófonos.
- Verificación de alineación texto-imagen en pipelines de generación: puntuar la coherencia entre una imagen generada y un *prompt* en bashkir para descartar salidas que no se correspondan con la petición, como paso de control de calidad.
- Investigación sobre *trimming* de vocabulario: servir como caso de estudio reproducible para medir el impacto del recorte de vocabulario en modelos multimodales, comparando con el modelo base de Google.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de precisión, recall, mAP ni comparaciones cuantitativas con el modelo base; únicamente aporta estadísticas de tamaño (vocabulario y parámetros).

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 6,4 GB solo para pesos (1.595.847.794 parámetros x 4 bytes), más activaciones y memoria del tokenizador.
- VRAM estimada en fp16/bf16: en torno a 3,2 GB para pesos, más overhead de activaciones; cabe en GPUs consumer de 8 GB o más.
- GPU recomendadas: RTX 3090, RTX 4090, A10, L4, A100 o H100 para lotes grandes; una RTX 3060 de 12 GB o una RTX 4060 Ti de 16 GB son suficientes para inferencia en fp16 con lotes moderados.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 8 GB de VRAM en fp16.
- Opciones de despliegue: `sentence-transformers`, pipeline de Transformers (`zero-shot-image-classification`), y servidores de embeddings compatibles con sentence-transformers. No se documentan pesos GGUF ni soporte explícito para llama.cpp u Ollama (son herramientas orientadas a modelos generativos, no a encoders de visión).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Vocabulario | Contexto / resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| alphaedge-ai/siglip2-giant-opt-patch16-384-bak-16384 | 1.595.847.794 | 16.384 | 384x384 (imagen) | Apache 2.0 | Hugging Face, 14 descargas |
| google/siglip2-giant-opt-patch16-384 (base) | 1.871.885.426 | 256.000 | 384x384 (imagen) | Apache 2.0 | Hugging Face, modelo oficial de Google |
| google/siglip2-so400m-patch14-384 | no disponible en la información | no disponible | 384x384 (imagen) | Apache 2.0 | Hugging Face, variante más pequeña de la familia SigLIP 2 |
| openai/clip-vit-large-patch14 | no disponible en la información | no disponible | 224x224 (imagen) | MIT (según modelo original) | Hugging Face, referencia histórica de CLIP |

La comparación directa con alternativas solo es posible a nivel de familia (SigLIP 2) y de arquitectura (CLIP). No hay datos de rendimiento publicados para este modelo trimmeado que permitan una comparación cuantitativa con el modelo base ni con otras variantes.

## Limitaciones y advertencias

- El vocabulario recortado a 16.384 tokens está optimizado para bashkir; el rendimiento en otros idiomas puede degradarse notablemente respecto al modelo base, ya que se han eliminado tokens poco frecuentes en el corpus de minería.
- No se han publicado evaluaciones que confirmen que el modelo trimmeado mantiene la calidad del original; la afirmación del autor ("should perform similarly") no está respaldada por métricas.
- Riesgo de alucinación en sentido amplio: al ser un modelo de clasificación y embeddings, no genera texto, pero puede asignar etiquetas con alta confianza a imágenes que no corresponden, especialmente si las etiquetas candidatas están fuera del dominio del corpus de minería.
- Sesgos potenciales heredados del modelo base SigLIP 2 y del corpus FineWeb-2 en bashkir: posibles sesgos de representación cultural, de género o geográficos en las etiquetas y en los embeddings.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base de Google y del dataset de minería (`lbourdois/fineweb-2-trimming`) por si imponen restricciones adicionales.
- El modelo tiene muy poca adopción (14 descargas, 0 likes) y fue creado en 2026; no hay evidencia de uso en producción ni de mantenimiento activo.
- No es adecuado para tareas generativas, razonamiento, código, matemáticas ni agentes: es exclusivamente un encoder multimodal para clasificación y similitud.
- El pipeline `zero-shot-image-classification` requiere etiquetas candidatas en bashkir; usar etiquetas en otros idiomas puede producir resultados pobres por el recorte de vocabulario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphaedge-ai/siglip2-giant-opt-patch16-384-bak-16384
- Modelo base: https://huggingface.co/google/siglip2-giant-opt-patch16-384
- Paper SigLIP 2: https://arxiv.org/abs/2502.14786
- Blog sobre trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Dataset de minería: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
- Repositorio de assets del blog de trimming: https://github.com/lbourdois/blog
