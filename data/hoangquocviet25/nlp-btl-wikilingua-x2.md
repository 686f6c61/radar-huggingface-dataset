# HoangQuocViet25/nlp-btl-wikilingua-x2

## Resumen

El modelo `HoangQuocViet25/nlp-btl-wikilingua-x2` es un sistema de resumen abstractivo en vietnamita, desarrollado por HoangQuocViet25 como parte de un proyecto académico (BTL_NLP). Se trata de un ajuste fino (fine-tuning) del modelo base `VietAI/vit5-base`, que a su vez es una variante de T5 preentrenada específicamente para el vietnamita. El ajuste se realiza sobre el subconjunto vietnamita del dataset WikiLingua, un corpus multilingüe de pares artículo-resumen extraídos de WikiHow.

El modelo resuelve el problema de la generación de resúmenes abstractivos en vietnamita, un idioma con escasos recursos en este ámbito. Su relevancia radica en que ofrece una alternativa de código abierto (licencia MIT) y con un tamaño contenido (225 millones de parámetros) que puede desplegarse en hardware modesto. La arquitectura es encoder-decoder tipo T5, con una longitud de contexto de entrada de 1024 tokens según el ejemplo de uso proporcionado por el autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | T5 (encoder-decoder) basada en ViT5-base |
| Parámetros totales | 225.950.976 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el ejemplo de uso emplea max_length=1024) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Vietnamita (vi) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura T5 original, con un encoder y un decoder basados en transformers. Al estar basado en ViT5-base, hereda el vocabulario y la configuración de preentrenamiento de ViT5, que fue entrenado con un corpus masivo en vietnamita. El ajuste fino se realiza sobre el dataset WikiLingua (versión vietnamita, identificada como `huy-nh-2000/wikilingua`), que contiene pares de artículos de WikiHow y sus resúmenes. Los tags del modelo indican el uso de *unlikelihood training* para mitigar la repetición de tokens en las salidas generadas, una técnica que penaliza la probabilidad de tokens ya generados. No se dispone de información detallada sobre el número de pasos de entrenamiento, la composición exacta del dataset ni el uso de técnicas adicionales como RLHF o DPO.

## Capacidades

- Generación de resúmenes abstractivos en vietnamita a partir de textos de entrada.
- Manejo de secuencias de hasta 1024 tokens de entrada (según el ejemplo de uso).
- Preprocesamiento específico de ViT5: no requiere prefijo de tarea y añade el token `</s>` al final de la cadena de entrada.
- Generación con beam search (num_beams=4) y control de longitud mediante `max_new_tokens`.
- No se han documentado capacidades de tool calling, agentes, razonamiento multi-paso, visión o audio.

## Casos de uso

- Resumen de artículos de noticias en vietnamita: el modelo puede condensar noticias largas en párrafos breves, facilitando la lectura rápida en portales de información.
- Resumen de documentos legales o administrativos: aunque el entrenamiento se basa en WikiHow, la arquitectura T5 permite adaptarse a otros dominios con un ajuste adicional; en su estado actual puede servir para extraer las ideas principales de textos formales.
- Resumen de conversaciones de atención al cliente: al ser un modelo de secuencia a secuencia, puede procesar transcripciones de chats y generar un resumen de los puntos clave, útil para sistemas de ticketing.
- Generación de descripciones cortas para artículos de blogs o páginas web: el modelo puede transformar contenido extenso en metadescripciones o resúmenes para SEO.
- Resumen de artículos de WikiHow en vietnamita: dado que el dataset de entrenamiento proviene de WikiHow, el modelo es especialmente adecuado para resumir guías paso a paso en este idioma.
- Preprocesamiento de corpus para entrenamiento de otros modelos: se puede usar para reducir la longitud de textos antes de pasarlos a modelos con ventanas de contexto limitadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como ROUGE, MMLU o HumanEval para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: con 225 millones de parámetros, en FP32 se requieren aproximadamente 900 MB de memoria; en FP16 unos 450 MB; en int8 unos 225 MB. Estas cifras son orientativas y no han sido confirmadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1050 Ti, RTX 2060, etc.) puede ejecutar el modelo en FP16. Para FP32 se recomienda al menos 4 GB.
- El modelo cabe en GPUs de consumo (gama media y baja) sin problemas.
- Opciones de despliegue: al ser un modelo de Hugging Face Transformers, puede servirse con bibliotecas estándar como `transformers`, `pipeline`, o mediante servidores de inferencia como vLLM, TGI o Hugging Face Inference Endpoints. También es posible convertirlo a formato GGUF para su uso con llama.cpp u Ollama, aunque no se ha proporcionado dicha conversión.
- Latencia y throughput: no se dispone de datos medidos. En una GPU moderna, se espera una latencia de decenas de milisegundos por secuencia, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| HoangQuocViet25/nlp-btl-wikilingua-x2 | 225M | 1024 (ejemplo) | vi | MIT | Fine-tuning de ViT5-base sobre WikiLingua |
| VietAI/vit5-base | 225M | 512 (original) | vi | MIT | Modelo base preentrenado, no ajustado para resumen |
| mT5-small | 300M | 512 | Multilingüe (incluye vi) | Apache 2.0 | Modelo multilingüe, puede resumir en vi pero con menor especialización |

No se dispone de comparativas de rendimiento (ROUGE, etc.) entre estos modelos. La principal diferencia es que el modelo evaluado está específicamente ajustado para resumen en vietnamita, mientras que ViT5-base es un modelo generalista y mT5-small es multilingüe.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente con datos de WikiLingua (artículos de WikiHow), por lo que su rendimiento en otros dominios (noticias, literatura, textos técnicos) puede ser inferior y requerir un ajuste adicional.
- No se han documentado evaluaciones de sesgos ni de robustez ante entradas adversariales.
- Como todo modelo generativo, existe riesgo de alucinación: puede producir resúmenes que contengan información no presente en el texto original.
- La longitud de contexto no está oficialmente especificada; el ejemplo de uso emplea 1024 tokens, pero no se garantiza que el modelo maneje correctamente secuencias más largas.
- No se ha verificado el comportamiento con textos que contengan errores ortográficos o dialectos regionales del vietnamita.
- La licencia MIT permite uso comercial, pero el modelo base ViT5 también es MIT, por lo que no hay restricciones adicionales conocidas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HoangQuocViet25/nlp-btl-wikilingua-x2
- Dataset WikiLingua (versión vietnamita): https://huggingface.co/datasets/huy-nh-2000/wikilingua
- Dataset WikiLingua original: https://huggingface.co/datasets/esdurmus/wiki_lingua
- Paper de WikiLingua: https://aclanthology.org/2020.findings-emnlp.360/
- Repositorio del proyecto BTL_NLP: https://github.com/AIVIETNAM-AIO-tlee/BTL_NLP
