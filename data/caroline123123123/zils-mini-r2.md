# Caroline123123123/zils-mini-r2

## Resumen

zils-mini-r2 es un modelo derivado (fine-tune) del modelo base vllm-sr/d3-mini, cuyo padre original es Qwen/Qwen3.5-4B. Lo publica el usuario Caroline123123123 en Hugging Face bajo licencia Apache 2.0. Se trata de un "soup body" del proyecto Zils: conserva intactos los pesos de visión del chasis original y solo entrena las capas de lenguaje mediante LoRA (r=16, alpha 32), fusionadas en FP32 y almacenadas en BF16. El resultado es un modelo de aproximadamente 4.540 millones de parámetros con arquitectura transformer multimodal heredada de Qwen3.5-4B.

El modelo está etiquetado para la tarea de feature-extraction dentro de la librería transformers, aunque su naturaleza de fine-tune sobre un modelo conversacional sugiere que conserva capacidades generativas. El entrenamiento se realizó exclusivamente sobre las particiones de train de un conjunto de datasets públicos etiquetados (AG News, MNLI, BoolQ, ARC, CommonsenseQA, Banking77, SST-5, poem_sentiment) y ejemplos de decisión generados programáticamente, sin usar validación ni test.

La relevancia de este modelo es limitada y experimental: no tiene descargas ni likes, la model card es incompleta (faltan hiperparámetros como learning rate, épocas, semilla o número de ejemplos) y no se publican benchmarks. Debe considerarse un artefacto de investigación más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (heredada de Qwen3.5-4B), fine-tune LoRA en capas de lenguaje |
| Parametros totales | 4.539.265.536 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en BF16) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen/Qwen3.5-4B (commit 851bf6e8), un transformer multimodal que incluye una torre de visión y capas de lenguaje. En este fine-tune solo se entrenaron las capas de lenguaje mediante LoRA con r=16 y alpha=32; los adaptadores se fusionaron en FP32 y se almacenaron en BF16. La torre de visión permanece sin cambios respecto al chasis original.

El entrenamiento utilizó ejemplos de decisión extraídos de las particiones de train de AG News, MNLI, BoolQ, ARC, CommonsenseQA, Banking77, SST-5 y poem_sentiment, además de decisiones generadas programáticamente. No se emplearon particiones de validación ni de test. La model card no especifica el número de ejemplos, el learning rate, las épocas, el peso de Brier ni la semilla, por lo que la reproducibilidad del entrenamiento es nula con la información publicada. No se documenta uso de RLHF ni DPO.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Qwen3.5-4B (no verificados tras el fine-tune).
- Procesamiento multimodal de imagen y texto, ya que conserva la torre de visión del chasis.
- Clasificación y toma de decisiones sobre tareas de tipo NLU (inferencia, QA, análisis de sentimiento, intención bancaria) por el sesgo del dataset de entrenamiento.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; la model card no declara idiomas.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Clasificación de noticias por categoría: el modelo se entrenó con AG News y puede usarse para etiquetar titulares o textos breves en cuatro categorías, aprovechando el sesgo del fine-tune hacia tareas de decisión.
- Inferencia de lenguaje natural (NLI): entrenado con MNLI, es adecuado para determinar relaciones de implicación, contradicción o neutralidad entre pares de frases en pipelines de verificación.
- Preguntas de sí/no sobre contexto: el entrenamiento con BoolQ lo orienta a responder consultas booleanas sobre pasajes, útil en sistemas de búsqueda documental.
- Análisis de sentimiento granular: con SST-5 y poem_sentiment, puede emplearse para clasificar sentimiento en cinco niveles o en textos poéticos, aunque sin garantías de generalización.
- Detección de intención en banca: el dataset Banking77 lo hace candidato para clasificar consultas de clientes en intenciones bancarias dentro de un chatbot de atención al cliente.
- Razonamiento sobre conocimiento común: con ARC y CommonsenseQA, puede aplicarse a preguntas de opción múltiple que requieran sentido común, como en entornos educativos o de evaluación automática.
- Extracción de características: al estar etiquetado como feature-extraction, puede usarse para generar embeddings de texto o imagen en sistemas de recuperación, aunque no se documenta la calidad de dichos embeddings.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9,1 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomiendan 16 GB o más.
- VRAM estimada en cuantización de 8 bits: alrededor de 5 GB de pesos; en 4 bits, alrededor de 2,5-3 GB (no se publican versiones cuantizadas oficiales).
- GPU recomendadas: A100, H100 o L40S para despliegue en BF16 con contexto largo; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para inferencia en BF16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 (16 GB) con cuantización, y potencialmente en GPUs de 12 GB si se cuantiza a 4 bits.
- Opciones de despliegue: transformers (librería declarada), vLLM, TGI y llama.cpp si se generan pesos GGUF; Ollama requeriría conversión previa. El tag endpoints_compatible sugiere compatibilidad con Inference Endpoints.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-mini-r2 | 4.539 M | No disponible | Apache 2.0 | Hugging Face, 0 descargas | Fine-tune experimental sin benchmarks |
| Qwen/Qwen3.5-4B | ~4 B | No disponible | No disponible en la información | Hugging Face | Modelo base original, sin fine-tune de decisión |
| vllm-sr/d3-mini | No disponible | No disponible | No disponible en la información | Hugging Face | Padre directo del fine-tune |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; el entrenamiento con datasets como Banking77 o AG News puede introducir sesgos de dominio y de distribución.
- Riesgo de alucinación: alto en tareas generativas, ya que el fine-tune se orientó a decisiones y no se validó la degradación de capacidades generativas del modelo base.
- Limitaciones de contexto e idioma: la longitud de contexto no se especifica y los idiomas soportados no se declaran; el uso en castellano no está garantizado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-4B puede tener condiciones adicionales que deben verificarse antes de producción.
- Ausencia de validación: no se usaron splits de validación ni test, por lo que no hay evidencia de generalización.
- Hiperparámetros incompletos: learning rate, épocas, semilla y número de ejemplos no están documentados, lo que impide reproducir el entrenamiento.
- Madurez: 0 descargas y 0 likes; es un artefacto reciente y sin comunidad que lo respalde.
- Uso en producción: desaconsejado sin una evaluación propia exhaustiva sobre el dominio objetivo.

## Enlaces

- Hugging Face: https://huggingface.co/Caroline123123123/zils-mini-r2
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo padre d3-mini: https://huggingface.co/vllm-sr/d3-mini
