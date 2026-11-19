# FrontiersMind/NandiBERT-150M

## Resumen

NandiBERT-150M es un codificador bidireccional (encoder) de tipo BERT entrenado con el objetivo de modelado de lenguaje enmascarado (masked language modeling), desarrollado por FrontiersMind. Forma parte de una familia de encoders abiertos que, según su model card, alcanza estado del arte en inglés y en lenguas índicas para su tamano, cubriendo un hueco que los encoders anteriores cubrian solo parcialmente: los modelos previos solian ser fuertes en inglés o en índico, pero no en ambos.

El modelo cuenta con aproximadamente 148M de parámetros según la tabla de benchmarks de su model card, aunque el repositorio de safetensors declara 223.742.464 parámetros totales, una discrepancia que conviene tener en cuenta al planificar el despliegue. Emplea una arquitectura de 28 capas con tamano oculto de 768, atención con grouped-query attention, QK-norm y SwiGLU, y una ventana de contexto de 16.384 tokens. Su vocabulario multilingüe de 100K tokens se almacena como embedding factorizado de rango 192, lo que reduce la tabla de embeddings de 77M a 19M de parámetros.

Su relevancia actual reside en la combinación de eficiencia (pensado para inferencia rápida y fine-tuning de bajo coste), cobertura multilingüe amplia (inglés, 11 lenguas índicas en escritura nativa y romanizada, lenguas del sudeste asiático y de Oriente Medio) y licencia Apache-2.0, lo que lo hace apto para uso comercial. Está orientado a tareas de clasificación, reconocimiento de entidades nombradas, reranking y retrieval, y se carga mediante Hugging Face `transformers` con `trust_remote_code=True`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder bidireccional tipo BERT (28 capas, hidden 768, grouped-query attention, QK-norm, SwiGLU, embeddings factorizados de rango 192) |
| Parametros totales | 223.742.464 según safetensors; 148M según la tabla de benchmarks de la model card (dato discrepante) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, hi, mr, pa, ta, te, kn, ml, bn, gu, as, or, ur, ne, ar, id, ms (índico, sudeste asiático y Oriente Medio) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Vocabulario | 100K tokens multilingüe compartido con la familia NandiBERT |
| Libreria | transformers (requiere `trust_remote_code=True` y transformers 5.x) |
| Pipeline | fill-mask |
| Tamano del repo | 0,4 GB |

## Arquitectura y entrenamiento

NandiBERT-150M es un transformer encoder bidireccional con 28 capas y dimensión oculta de 768. Incorpora varias innovaciones propias de encoders modernos: grouped-query attention, normalización QK (QK-norm) y activación SwiGLU. Una decisión arquitectónica destacable es el uso de embeddings factorizados: el vocabulario de 100K tokens se proyecta a través de una factorización de rango 192, lo que reduce la tabla de embeddings de 77M a 19M de parámetros y libera capacidad para las capas del encoder. El modelo se entrena con el objetivo de masked language modeling (MLM).

La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables de forma habitual a encoders MLM). Tampoco se especifica si hubo entrenamiento con decodificación especulativa u otras optimizaciones de inferencia. La familia NandiBERT incluye además un modelo de 450M de parámetros con contexto de 32K, orientado a contexto largo. El modelo comparte vocabulario multilingüe con el resto de la familia y cubre inglés, 11 lenguas índicas en escritura nativa y romanizada, lenguas del sudeste asiático y de Oriente Medio.

## Capacidades

- Modelado de lenguaje enmascarado (fill-mask) en 18 idiomas, incluyendo inglés, hindi, marathi, punyabí, tamil, telugu, kannada, malayalam, bengalí, guyaratí, asamés, oriya, urdu, nepalí, árabe, indonesio y malasio.
- Clasificación de texto (sentimiento, inferencia de lenguaje natural, paráfrasis, intención).
- Reconocimiento de entidades nombradas (NER) y predicción de estructura (slot filling).
- Respuesta a preguntas extractiva (QA).
- Reranking y recuperación de información (retrieval), incluyendo dominios especializados como código y matemáticas.
- Representaciones de contexto largo gracias a su ventana de 16.384 tokens.
- Soporte de tool calling / function calling: no disponible (es un encoder, no un modelo generativo).
- Soporte de agentes y razonamiento multi-paso: no disponible de forma nativa; puede usarse como componente de recuperación o clasificación dentro de pipelines de agentes.
- Capacidades especiales: no dispone de modo thinking, visión ni audio.

## Casos de uso

- Clasificación de sentimiento multilingüe: el modelo puede fine-tunearse para clasificar opiniones en inglés y en las 11 lenguas índicas cubiertas, con resultados en IndicSentiment de 91,3, lo que lo hace adecuado para monitorización de reputación en mercados del sur de Asia.
- Reconocimiento de entidades nombradas en producción: con un F1 de 77,4 en Naamapadam NER, puede integrarse en pipelines de extracción de entidades para documentos en lenguas índicas, como contratos, noticias o registros administrativos.
- Recuperación aumentada (RAG) multilingüe: sus resultados en BEIR (44,5) y MLDR (41,2) permiten usarlo como encoder de retrieval en sistemas RAG que deban consultar corpus en varios idiomas con una sola torre de embeddings.
- Reranking de resultados de búsqueda: con 71,2 en Reward Bench, puede emplearse como reranker en motores de búsqueda internos o en sistemas de recomendación de documentos, priorizando resultados relevantes sobre un primer recall amplio.
- Respuesta a preguntas extractiva sobre documentación: con un F1 de 46 en IndicQA, es adecuado para asistentes de consulta sobre bases documentales en lenguas índicas, extrayendo la respuesta directamente del texto.
- Clasificación de intenciones en asistentes conversacionales: su rendimiento en MASSIVE Intent (73,2) permite enrutar consultas de usuarios hacia el servicio adecuado en sistemas de atención al cliente multilingües.
- Detección de similitud y paráfrasis: con 60,6 en IndicXParaphrase, sirve para deduplicación de contenido, detección de plagio o agrupación de consultas equivalentes en varios idiomas.
- Análisis de código y matemáticas en retrieval: sus resultados en RAR-b Code (32,8) y RAR-b Math (49,4) lo hacen útil para búsqueda semántica sobre repositorios de código y documentación técnica.

## Benchmarks y rendimiento

Resultados en benchmarks en inglés (model card del autor):

| Modelo | Parametros | GLUE | SQuAD 2.0 | MUltiCoNERv2 | few-nerd | Reward Bench | BEIR | RAR-b Code | RAR-b Math | MLDR | LongEmbed | Media |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| BERT | 110M | 84,7 | 76,3 | 53,8 | 66,6 | 59,4 | 36,7 | 6,6 | 27,5 | 29,0 | 29,3 | 51,45 |
| RoBERTa | 125M | 86,4 | 83,7 | 56,5 | 67,1 | 63,2 | 39,6 | 11,7 | 33,4 | 28,7 | 33,8 | 55,20 |
| MosaicBERT | 137M | 85,4 | 79,4 | 57,8 | 65,7 | 62,5 | 41,4 | 12,7 | 30,9 | 29,6 | 40,5 | 54,48 |
| NomicBERT | 137M | 84,0 | 82,7 | 60,1 | 66,9 | 64,1 | 42,0 | 13,8 | 30,2 | 29,9 | 45,0 | 55,48 |
| GTE-en-MLM | 137M | 85,6 | 82,7 | 59,2 | 66,4 | 63,4 | 42,4 | 12,0 | 33,6 | 37,1 | 58,5 | 55,66 |
| ModernBERT | 149M | 88,4 | 86,7 | 57,4 | 66,7 | 68,0 | 42,6 | 29,6 | 46,1 | 37,7 | 63,2 | 60,69 |
| Ettin Encoder | 149M | 88,9 | 87,4 | 57,4 | 66,5 | 70,3 | 42,4 | 31,8 | 47,1 | 35,9 | 60,1 | 61,48 |
| UltraBERT | 152M | 89,5 | 89,2 | 57,9 | 67,4 | 73,0 | 45,2 | 39,1 | 55,4 | 43,5 | 72,0 | 64,59 |
| NandiBERT-150M | 148M | 87,1 | 87,6 | 56,9 | 68,1 | 71,2 | 44,5 | 32,8 | 49,4 | 41,2 | 71,1 | 62,20 |

Resultados en benchmarks índicos (model card del autor):

| Modelo | Parametros | IndicSentiment | IndicXNLI | IndicCOPA | IndicXParaphrase | MASSIVE Intent | Naamapadam NER (F1) | MASSIVE Slot-fill (F1) | IndicQA (F1) |
|---|---|---|---|---|---|---|---|---|---|
| IndicBERT-V2 | 272M | 91,2 | 73,7 | 64,6 | 56,9 | 79,1 | 73,2 | 58,1 | 48,3 |
| NandiBERT-150M | 151M | 91,3 | 75,9 | 66,4 | 60,6 | 73,2 | 77,4 | 54,0 | 46,0 |

## Requisitos de hardware

- VRAM estimada para inferencia: con 0,4 GB de pesos en safetensors, el modelo cabe con holgura en cualquier GPU de consumo; en bfloat16 requiere aproximadamente 0,5 GB solo para pesos, más memoria para activaciones y batch.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para inferencia en batch pequeno; para fine-tuning se recomienda al menos 16 GB (RTX 4090, A100, H100) según el tamano de batch y la longitud de secuencia.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares.
- Opciones de despliegue: Hugging Face `transformers` (requiere `trust_remote_code=True` y transformers 5.x). No se especifican integraciones con vLLM, llama.cpp, Ollama o TGI; dado que es un encoder con código personalizado, la compatibilidad con estos motores no está garantizada y no está disponible en la información proporcionada.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Media benchmark inglés | Benchmark índico destacado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| NandiBERT-150M | 148M (223,7M en safetensors) | 16K | 62,20 | IndicSentiment 91,3; NER 77,4 | Apache-2.0 | Hugging Face |
| ModernBERT | 149M | no disponible en la información | 60,69 | no disponible | no disponible en la información | Hugging Face |
| UltraBERT | 152M | no disponible en la información | 64,59 | no disponible | no disponible en la información | Hugging Face |
| IndicBERT-V2 | 272M | no disponible en la información | no disponible | IndicSentiment 91,2; NER 73,2 | no disponible en la información | Hugging Face |

NandiBERT-150M ofrece un equilibrio entre rendimiento en inglés (media de 62,20, por encima de ModernBERT y por debajo de UltraBERT) y cobertura multilingüe índica, donde supera a IndicBERT-V2 en la mayoría de tareas pese a tener aproximadamente la mitad de parámetros declarados.

## Limitaciones y advertencias

- Discrepancia en el número de parámetros: la model card indica 148M/151M en las tablas de benchmarks, mientras que los safetensors declaran 223.742.464 parámetros. Conviene verificar el tamano real antes de dimensionar infraestructura.
- Es un encoder MLM, no un modelo generativo: no puede usarse para generación de texto libre, chat ni agentes sin un cabezal adicional fine-tuneado.
- Riesgo de alucinación: limitado en tareas extractivas, pero presente en cabezales de QA generativos si se combinan con decodificadores.
- Cobertura lingüística: aunque cubre 18 idiomas, no se detalla el volumen de datos por idioma; el rendimiento en lenguas con menos recursos puede ser inferior al reportado en los benchmarks.
- Requiere `trust_remote_code=True` y transformers 5.x, lo que implica ejecutar código personalizado del autor; conviene auditar el código antes de desplegarlo en producción.
- No se han publicado datos sobre sesgos, robustez adversarial ni evaluaciones de seguridad en la información disponible.
- Licencia Apache-2.0: permite uso comercial, pero se recomienda revisar las condiciones de los datasets de entrenamiento, no detalladas en la model card.
- No se especifican opciones de cuantización ni compatibilidad con motores de inferencia optimizados, lo que puede limitar el throughput en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FrontiersMind/NandiBERT-150M
- Modelo hermano NandiBERT-450M: https://huggingface.co/FrontiersMind/NandiBERT-450M
- Organización en Hugging Face: https://huggingface.co/FrontiersMind
- GitHub: https://github.com/FrontiersMindAI/
- Blog de lanzamiento: https://www.frontiersmind.ai/
- Sitio web: https://www.frontiersmind.ai/
- Informe técnico: no disponible (la model card enlaza a "TODO")
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
