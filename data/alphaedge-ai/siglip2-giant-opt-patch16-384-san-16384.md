# alphaedge-ai/siglip2-giant-opt-patch16-384-san-16384

## Resumen

SigLIP2-giant-opt-patch16-384-san-16384 es una variante "trimmed" (podada) del codificador vision-lenguaje google/siglip2-giant-opt-patch16-384, publicada por alphaedge-ai. El modelo original forma parte de la familia SigLIP 2 de Google, que combina un codificador de imágenes tipo ViT con un codificador de texto para producir embeddings alineados en un espacio compartido, orientados a tareas de clasificación zero-shot, retrieval imagen-texto y similitud multimodal.

La modificación consiste en una reducción drástica del vocabulario del tokenizador, de 256.000 a 16.384 tokens, seleccionando únicamente los tokens relevantes para el sánscrito (código de idioma `sa`). Esto reduce el tamaño del modelo en un 14,75% (de 1.871.885.426 a 1.595.847.794 parámetros) y disminuye la huella de memoria, especialmente en la matriz de embeddings del codificador de texto.

Es relevante para equipos que despliegan clasificación o búsqueda de imágenes con etiquetas en sánscrito y necesitan un modelo más ligero que el original, a costa de perder capacidad multilingüe fuera de ese idioma. El modelo conserva la licencia Apache 2.0 del original y se distribuye en formato safetensors, integrable con `sentence-transformers` y `transformers`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SigLIP 2 (ViT + codificador de texto, alineamiento por sigmoide); patch size 16, resolución 384 |
| Parametros totales | 1.595.847.794 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo publica safetensors sin cuantizaciones adicionales) |
| Idiomas soportados | sánscrito (`sa`); el resto de idiomas degradados por la poda de vocabulario |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura SigLIP 2: un transformer de visión (ViT) con parches de 16x16 a 384x384 píxeles y un codificador de texto transformer, entrenados con una pérdida sigmoide sobre pares imagen-texto en lugar del softmax contrastivo de CLIP. SigLIP 2 añade mejoras sobre la versión original en comprensión semántica, localización y características densas, según el paper arXiv:2502.14786.

Esta variante concreta no se ha reentrenado: es una poda del vocabulario del modelo base. Se usaron 14.725 textos del dataset `lbourdois/fineweb-2-trimming` para determinar qué tokens del vocabulario original son relevantes en sánscrito; el resto se elimina y se recorta en consecuencia la matriz de embeddings de texto. No hay información disponible sobre RLHF, DPO ni ajuste fino adicional en esta variante.

## Capacidades

- Clasificación de imágenes zero-shot con etiquetas en sánscrito.
- Similitud imagen-texto y generación de embeddings multimodales alineados.
- Búsqueda y retrieval imagen-texto en sánscrito.
- Extracción de características visuales densas (heredadas de SigLIP 2).
- Integración con `sentence-transformers` para `encode` y `similarity`.
- No soporta tool calling, agentes, generación de texto libre ni razonamiento multi-paso (es un codificador, no un modelo generativo).
- Capacidad multilingüe muy reducida: fuera del sánscrito, el vocabulario podado limita el rendimiento.

## Casos de uso

- Clasificación zero-shot de imágenes con etiquetas en sánscrito: usar el pipeline `zero-shot-image-classification` con listas de candidatos en sánscrito para etiquetar catálogos de imágenes sin entrenamiento específico.
- Búsqueda semántica imagen-texto en colecciones de manuscritos o material cultural en sánscrito: generar embeddings de imágenes y consultas con `SentenceTransformer.encode` y ordenar por similitud.
- Moderación o filtrado de contenido visual con taxonomías en sánscrito: clasificar imágenes entrantes contra un conjunto cerrado de categorías definidas en ese idioma.
- Indexación de archivos digitales: construir un índice vectorial de imágenes descritas en sánscrito para recuperación por texto.
- Sistemas de recomendación visual: calcular similitud entre imágenes y descripciones textuales en sánscrito para sugerir contenido relacionado.
- Prototipado de investigación en visión-lenguaje para lenguas clásicas indias: usar el modelo podado como baseline ligero frente al original de 1.87B parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 6,4 GB solo para pesos (1.595.847.794 parámetros x 4 bytes), más activaciones.
- VRAM estimada en fp16/bf16: aproximadamente 3,2 GB para pesos.
- GPU recomendadas: A100, H100 o L40S para producción con lotes grandes; RTX 4090 o RTX 3090 para desarrollo.
- Cabe en GPU de consumo: sí, en fp16 en tarjetas con 8 GB o más (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 en adelante).
- Opciones de despliegue: `transformers` (pipeline), `sentence-transformers`, servidores de embeddings tipo TGI o vLLM (este último orientado a generativos; para embeddings conviene TEI o sentence-transformers con batching).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Vocabulario | Idiomas | Licencia | Contexto |
|---|---|---|---|---|---|
| alphaedge-ai/siglip2-giant-opt-patch16-384-san-16384 | 1.595.847.794 | 16.384 | sánscrito | apache-2.0 | no disponible |
| google/siglip2-giant-opt-patch16-384 (base) | 1.871.885.426 | 256.000 | multilingüe | apache-2.0 | no disponible |
| google/siglip2-so400m-patch14-384 | no disponible | no disponible | multilingüe | apache-2.0 | no disponible |

La ventaja principal frente al base es el menor tamaño y la reducción de memoria del vocabulario; la desventaja es la pérdida de cobertura multilingüe. Frente a variantes más pequeñas de SigLIP 2 (so400m), este modelo conserva la capacidad del "giant" pero solo en sánscrito.

## Limitaciones y advertencias

- El vocabulario podado elimina tokens de otros idiomas: el rendimiento fuera del sánscrito puede degradarse gravemente.
- Es un codificador multimodal, no un modelo generativo: no produce texto libre ni razona.
- Riesgo de alucinación en el sentido de asignar etiquetas incorrectas con alta confianza en clasificación zero-shot, especialmente con etiquetas ambiguas.
- Sesgos heredados del dataset de entrenamiento original de SigLIP 2 (pares imagen-texto web), no documentados específicamente para esta variante.
- La poda se basó en solo 14.725 textos; la cobertura del vocabulario sánscrito puede ser incompleta.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base de Google.
- No hay cuantizaciones publicadas (GGUF, etc.) en el repo; habría que generarlas.
- Modelo con muy pocas descargas (14) y sin likes: poca validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphaedge-ai/siglip2-giant-opt-patch16-384-san-16384
- Modelo base: https://huggingface.co/google/siglip2-giant-opt-patch16-384
- Paper SigLIP 2: https://arxiv.org/abs/2502.14786
- Blog sobre trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Dataset de minería: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
