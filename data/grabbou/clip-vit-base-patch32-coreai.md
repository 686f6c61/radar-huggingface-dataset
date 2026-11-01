# grabbou/clip-vit-base-patch32-CoreAI

## Resumen

`grabbou/clip-vit-base-patch32-CoreAI` es una exportación del modelo CLIP ViT-B/32 de OpenAI al formato Core AI de Apple, publicada por el desarrollador grabbou. No se trata de un modelo nuevo ni de un fine-tuning con datos adicionales: es una conversión de pesos del checkpoint original `openai/clip-vit-base-patch32` a un único fichero `.aimodel` que empaqueta dos funciones separadas, `encode_text` y `encode_image`, de modo que texto e imagen se proyectan de forma independiente al mismo espacio latente de 512 dimensiones.

El problema que resuelve es práctico: el recetario oficial de Apple (`apple/coreai-models`) traza una función que exige una imagen y un lote fijo de tres prompts en cada llamada, lo que limita su uso en aplicaciones reales. Esta exportación, generada con un `export.py` propio sobre coreai-torch 0.4.3 y torch 2.13, permite invocar los codificadores por separado con lotes de 1 a 64, algo necesario para búsqueda semántica multimodal, clasificación zero-shot o filtrado de imágenes en dispositivo.

Su relevancia es acotada pero clara: habilita inferencia local de embeddings CLIP en iOS y macOS dentro del ecosistema Core AI, sin depender de servidores, con un paquete de 290 MB en float16. El repo tiene 0 descargas y 0 likes en el momento de la consulta, y no se ha publicado información sobre idiomas soportados más allá de los del tokenizer CLIP original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ViT-B/32 (codificador de imagen) + transformer de texto CLIP; exportado como dos funciones en un `.aimodel` |
| Parametros totales | no disponible (el checkpoint original CLIP ViT-B/32 ronda los 151 M, pero no se detalla en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 77 tokens para el codificador de texto (`input_ids` de forma `[batch, 77]` int32) |
| Tipos de cuantizacion | float16 (único dtype documentado en la exportación); no se documentan GGUF, int8 ni int4 |
| Idiomas soportados | no disponible (depende del tokenizer CLIP incluido en `tokenizer/`) |
| Licencia | MIT |
| Formato de pesos | `.aimodel` (Core AI de Apple) con tokenizer CLIP adjunto; no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es CLIP ViT-B/32 de OpenAI: un Vision Transformer con parches de 32x32 que procesa imágenes de 224x224x3 (normalizadas con media y desviación estándar de CLIP) y un transformer de texto que procesa secuencias de hasta 77 tokens. Ambos codificadores producen embeddings de 512 dimensiones que se normalizan L2 para permitir similitud coseno. En esta exportación, cada codificador se expone como una función independiente dentro del mismo `.aimodel`: `encode_text(input_ids, attention_mask) -> text_embeds` y `encode_image(pixel_values) -> image_embeds`, con soporte de batch de 1 a 64.

No se ha realizado entrenamiento ni ajuste adicional por parte del autor: la model card indica explícitamente que el repositorio «solo convierte» CLIP a formato Core AI. Por tanto, los datos de entrenamiento, el número de tokens vistos y el proceso de alineación (contrastive learning sobre pares imagen-texto en el modelo original) son los de `openai/clip-vit-base-patch32` y no se detallan en la información proporcionada. La innovación técnica de esta ficha es la herramienta de exportación (`export.py`, basada en la receta de Apple) que separa los codificadores y flexibiliza el batching respecto al trazado oficial.

## Capacidades

- Extracción de embeddings de imagen: genera vectores de 512 dimensiones L2-normalizados a partir de imágenes RGB de 224x224.
- Extracción de embeddings de texto: genera vectores de 512 dimensiones en el mismo espacio que las imágenes, con secuencias de hasta 77 tokens.
- Similitud multimodal: permite calcular similitud coseno entre texto e imagen para búsqueda, recuperación y clasificación zero-shot.
- Procesamiento por lotes: batch de 1 a 64 tanto en texto como en imagen.
- Ejecución en dispositivo: inferencia local en iOS y macOS mediante Core AI.
- Integración con ecosistema React Native: uso a través de `@react-native-ai/core-ai` y el AI SDK (`embedMany`, `cosineSimilarity`).
- No soporta generación de texto, tool calling, razonamiento multi-paso, agentes, visión generativa, audio ni modo thinking.

## Casos de uso

- Búsqueda semántica de imágenes en una app iOS: indexar la fototeca local calculando `image_embeds` en dispositivo y recuperar imágenes por consultas de texto embebidas con `encode_text`, sin enviar datos a un servidor.
- Clasificación zero-shot de contenido: comparar el embedding de una imagen contra embeddings de etiquetas textuales predefinidas (por ejemplo, «un documento», «una factura», «una foto de paisaje») para enrutar o etiquetar automáticamente.
- Moderación y filtrado en el cliente: detectar coincidencias entre texto e imagen antes de subir contenido a un backend, aprovechando que el modelo corre localmente en iOS o macOS.
- Organización automática de álbumes: agrupar imágenes por similitud coseno entre sus embeddings para crear colecciones temáticas sin intervención del usuario.
- Accesibilidad: generar descripciones o etiquetas candidatas para imágenes comparando contra un vocabulario de frases, útil en apps de lectura de pantalla.
- Deduplicación y near-duplicate detection: calcular similitud entre embeddings de imágenes para eliminar fotos repetidas en un pipeline de ingesta.
- Prototipado de recomendación visual: en un backend macOS, precalcular embeddings de catálogo y servir recomendaciones por similitud con el embedding de texto de la consulta del usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de recuperación (Recall@K), zero-shot accuracy ni latencia medida para esta exportación concreta.

## Requisitos de hardware

- VRAM/RAM: el paquete pesa 290 MB en float16; en inferencia en dispositivo el consumo de memoria es del orden de cientos de MB, aunque no se documenta una cifra exacta.
- GPU recomendadas: no aplica GPU de servidor; el destino es Apple Silicon (iPhone, iPad, Mac) mediante Core AI. No se documenta soporte para CUDA ni ROCm en esta exportación.
- Cabe en hardware consumer: sí, está diseñado para ejecutarse en dispositivos Apple con Core AI (iOS y macOS).
- Opciones de despliegue: Core AI de Apple con el fichero `.aimodel`; integración vía `@react-native-ai/core-ai`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo y el formato de pesos es propietario de Core AI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto texto | Dimensión embedding | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| `grabbou/clip-vit-base-patch32-CoreAI` | no disponible (base CLIP ViT-B/32) | 77 tokens | 512 | MIT | `.aimodel` (Core AI, iOS/macOS) |
| `openai/clip-vit-base-patch32` | no disponible en la informacion proporcionada | 77 tokens | 512 | MIT | safetensors/PyTorch (HuggingFace Transformers) |
| `openai/clip-vit-large-patch14` | no disponible en la informacion proporcionada | 77 tokens | 768 | MIT | safetensors/PyTorch (HuggingFace Transformers) |
| SigLIP (variantes base) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | safetensors/PyTorch |

La comparación relevante es con el checkpoint original de OpenAI, del que esta exportación hereda pesos y comportamiento; la diferencia está en el formato y en la separación de codificadores, no en la calidad del embedding. Frente a variantes de mayor tamaño como ViT-L/14 o SigLIP, esta exportación prioriza tamaño reducido y ejecución en dispositivo, a costa de capacidad representacional.

## Limitaciones y advertencias

- No es un modelo generativo: solo produce embeddings; no responde preguntas ni genera texto o imágenes.
- Contexto de texto muy corto (77 tokens), insuficiente para descripciones largas o documentos.
- Idiomas soportados no documentados; el tokenizer CLIP original tiene cobertura multilingüe limitada y el rendimiento en castellano no está verificado.
- Sesgos heredados del dataset de entrenamiento de CLIP (pares imagen-texto de internet), con posibles sesgos de género, raza y cultura; no se documenta ninguna mitigación.
- Riesgo de falsos positivos en similitud coseno con umbrales mal calibrados; requiere ajuste por aplicación.
- Licencia MIT permite uso comercial, pero el autor no ofrece garantías sobre la conversión ni sobre el comportamiento numérico frente al modelo original.
- Sin métricas publicadas de fidelidad numérica de la exportación (diferencias respecto a PyTorch no cuantificadas).
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni mantenimiento demostrado.
- Dependencia de versiones concretas de toolchain (coreai-torch 0.4.3, torch 2.13) que pueden afectar a la reproducibilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/grabbou/clip-vit-base-patch32-CoreAI
- Modelo base: https://huggingface.co/openai/clip-vit-base-patch32
- Recetario oficial de CLIP en Core AI Models (Apple): https://github.com/apple/coreai-models/tree/main/models/clip
- Paquete de integración React Native: https://github.com/callstackincubator/ai/tree/main/packages/core-ai
