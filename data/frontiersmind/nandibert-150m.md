# FrontiersMind/NandiBERT-150M

## Resumen

NandiBERT-150M es un codificador bidireccional (encoder) de tipo BERT desarrollado por FrontiersMind, diseñado para cubrir simultáneamente inglés y un amplio conjunto de lenguas índicas, algo que los encoders previos no lograban con la misma calidad en ambos frentes. El modelo forma parte de una familia junto a NandiBERT-450M y se distribuye bajo licencia Apache-2.0, lo que facilita su adopción tanto en investigación como en producto comercial.

El checkpoint almacena 223,7 millones de parámetros en total, aunque el encoder que se ajusta finamente (fine-tuning) es de 146M; la diferencia corresponde a la capa de salida MLM no atada (77M). Emplea 28 capas con tamaño oculto de 768, atención con grouped-query attention, QK-norm y SwiGLU, y ofrece una ventana de contexto de 16.384 tokens con un vocabulario multilingüe compartido de 100K tokens.

Su relevancia actual radica en que un único modelo sustituye a los encoders separados de inglés e índico, con un rendimiento que iguala o supera a IndicBERT-v2 en tareas índicas pese a tener casi la mitad de parámetros, y que se acerca a encoders ingleses especializados como ModernBERT o Ettin en benchmarks en inglés. Está pensado como base para clasificación, NER, reranking y recuperación de información.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional (estilo BERT), 28 capas, hidden 768, GQA, QK-norm, SwiGLU |
| Parametros totales | 223.742.464 (encoder ajustable: 146M; capa MLM no atada: 77M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 16.384 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, hi, mr, pa, ta, te, kn, ml, bn, gu, as, or, ur, ne, ar, id, ms (17 lenguas; 11 índicas también en forma romanizada) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers, custom_code) |

## Arquitectura y entrenamiento

NandiBERT-150M es un encoder transformer bidireccional entrenado con objetivo de modelado de lenguaje enmascarado (MLM). La arquitectura incorpora varias decisiones de eficiencia: grouped-query attention, normalización QK y activación SwiGLU en las capas, con 28 capas a 768 de dimensión oculta. Una innovación destacable es el uso de embeddings factorizados: el vocabulario de 100K tokens se almacena como un embedding factorizado de rango 192, lo que reduce la tabla de embeddings de 77M a 19M parámetros y redirige esa capacidad a las capas del encoder.

El vocabulario es multilingüe y compartido por toda la familia NandiBERT, cubriendo inglés, 13 lenguas índicas en escritura nativa (asamés, bengalí, guyaratí, hindi, canarés, malabar, maratí, nepalí, odia, panyabí, tamil, telugu y urdu), indonesio, malayo y árabe. La model card no detalla el número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO; esos datos no están disponibles en la información proporcionada.

## Capacidades

- Modelado de lenguaje enmascarado (fill-mask) sobre texto multilingüe.
- Generación de representaciones contextuales útiles como base para fine-tuning en clasificación de texto.
- Reconocimiento de entidades nombradas (NER) y predicción de estructura (slot-filling).
- Respuesta a preguntas extractiva (QA) y paráfrasis.
- Recuperación de información y reranking (evaluado en BEIR, MLDR, LongEmbed, RAR-b).
- Cobertura multilingüe de 17 lenguas, incluyendo 11 lenguas índicas en forma romanizada.
- Soporte de contexto largo de 16K tokens para documentos extensos.
- No dispone de tool calling, capacidades de agente ni generación autoregresiva: es un encoder, no un modelo generativo.

## Casos de uso

- Clasificación de sentimiento multilingüe: ajuste fino sobre IndicSentiment o datos propios para moderación y análisis de opinión en inglés e índico con un único modelo.
- Reconocimiento de entidades en textos índicos: fine-tuning sobre Naamapadam para extracción de entidades en asistentes de atención al cliente o pipelines de datos.
- Recuperación y reranking en buscadores multilingües: uso de las representaciones del encoder para indexar y ordenar documentos en BEIR/MLDR, aprovechando el contexto de 16K tokens para pasajes largos.
- Respuesta a preguntas extractiva: fine-tuning sobre SQuAD 2.0 o IndicQA para asistentes documentales que localizan respuestas en pasajes largos.
- Slot-filling en asistentes de voz: ajuste fino sobre MASSIVE para detección de intenciones y entidades en comandos de usuario en varias lenguas.
- Clasificación de documentos largos: gracias a la ventana de 16K tokens, procesar contratos o informes completos sin truncado agresivo en tareas de categorización.
- Detección de paráfrasis y similitud semántica: fine-tuning sobre IndicXParaphrase para deduplicación o búsqueda semántica en corpus multilingües.
- Base para embeddings: punto de partida para modelos de embedding derivados (la familia incluye EmbeddingNandi-150M).

## Benchmarks y rendimiento

Resultados índicos (media de clasificación, estructura, QA):

| Modelo | Parametros | IndicSentiment | IndicXNLI | IndicCOPA | IndicXParaphrase | Naamapadam NER (f1) | MASSIVE Slot-fill (f1) | IndicQA (f1) | Media |
|---|---|---|---|---|---|---|---|---|---|
| IndicBERT-v2 | 272M | 91,2 | 73,7 | 64,6 | 56,9 | 73,2 | 58,1 | 48,3 | 66,57 |
| NandiBERT-150M | 146M | 91,3 | 75,9 | 66,4 | 60,6 | 77,4 | 54,0 | 46,0 | 67,37 |

Resultados en inglés (parciales según la información disponible):

| Modelo | Idiomas | Parametros | GLUE | SQuAD 2.0 | MUltiCoNERv2 | few-nerd | Reward Bench | BEIR | RAR-b Code | RAR-b Math | MLDR | LongEmbed | Media |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| BERT-base | English | 110M | 84,7 | 76,3 | 53,8 | 66,6 | 59,4 | 36,7 | 6,6 | 27,5 | 29,0 | 29,3 | 51,45 |
| RoBERTa-base | English | 125M | 86,4 | 83,7 | 56,5 | 67,1 | 63,2 | 39,6 | 11,7 | 33,4 | 28,7 | 33,8 | 55,20 |
| MosaicBERT-base | English | 137M | 85,4 | 79,4 | 57,8 | 65,7 | 62,5 | 41,4 | 12,7 | 30,9 | 29,6 | 40,5 | 54,48 |
| NomicBERT-2048 | English | 137M | 84,0 | 82,7 | 60,1 | 66,9 | 64,1 | 42,0 | 13,8 | 30,2 | 29,9 | 45,0 | 55,48 |
| GTE-en-MLM-base | English | 137M | 85,6 | 82,7 | 59,2 | 66,4 | 63,4 | 42,4 | 12,0 | 33,6 | 37,1 | 58,5 | 55,66 |
| ModernBERT-base | English | 149M | 88,4 | 86,7 | 57,4 | 66,7 | 68,0 | 42,6 | 29,6 | 46,1 | 37,7 | 63,2 | 60,69 |
| Ettin-Encoder-150M | English | 149M | 88,9 | 87,4 | 57,4 | 66,5 | 70,3 | 42,4 | 31,8 | 47,1 | 35,9 | 60,1 | 61,48 |
| UltraBERT-150M | English | 152M | 89,5 | 89,2 | 57,9 | 67,4 | 73,0 | 45,2 | 39,1 | 55,4 | 43,5 | 72,0 | 64,59 |
| NandiBERT-150M | Multi-Lingual | 146M | 87,1 | 87,6 | 56,9 | 68,0 | (truncado) | — | — | — | — | — | — |

Nota: la fila de NandiBERT-150M en inglés aparece truncada en la información proporcionada; no se dispone de los valores completos de Reward Bench, BEIR, RAR-b, MLDR y LongEmbed ni de la media final.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 0,5 GB en FP32 (224M parámetros), ~0,3 GB en FP16/BF16 y ~0,15-0,2 GB en cuantización de 8 bits; el repo ocupa 0,4 GB.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM; RTX 3060, RTX 4090, A100 y H100 son sobradas para inferencia.
- Cabe holgadamente en GPUs de consumo (GTX 1650, RTX 3050 y superiores) e incluso en CPU para lotes pequeños.
- Opciones de despliegue: transformers (carga nativa con custom_code), ONNX Runtime y TensorRT para producción; no se documentan pesos GGUF ni soporte explícito de llama.cpp/Ollama en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada; por tamaño, se espera inferencia de milisegundos por lote en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Rendimiento índico (media) |
|---|---|---|---|---|---|
| NandiBERT-150M | 146M (224M en checkpoint) | 16K | 17 | Apache-2.0 | 67,37 |
| IndicBERT-v2 | 272M | no disponible | Índico | no disponible en la información | 66,57 |
| ModernBERT-base | 149M | no disponible en la información | Inglés | no disponible en la información | no aplica (solo inglés) |
| UltraBERT-150M | 152M | no disponible en la información | Inglés | no disponible en la información | no aplica (solo inglés) |

NandiBERT-150M ofrece cobertura multilingüe amplia con un rendimiento índico superior a IndicBERT-v2 con la mitad de parámetros, y un rendimiento inglés cercano a encoders especializados como ModernBERT o UltraBERT, aunque por debajo de estos en tareas de recuperación de código y matemáticas.

## Limitaciones y advertencias

- Es un encoder MLM: no genera texto libre ni soporta tool calling, agentes o razonamiento multi-paso.
- Riesgo de alucinación bajo en tareas discriminativas, pero las representaciones pueden reflejar sesgos presentes en los datos de entrenamiento (no documentados en la información disponible).
- Cobertura desigual entre lenguas: las lenguas índicas con menos recursos pueden rendir peor que hindi o bengalí.
- El rendimiento en inglés es inferior al de encoders especializados en tareas de recuperación (BEIR, RAR-b) según los datos parciales.
- La licencia Apache-2.0 permite uso comercial, pero conviene revisar las condiciones de los datasets de fine-tuning empleados.
- Requiere `trust_remote_code` o la carga de código personalizado (`custom_code`) en transformers; verificar compatibilidad de versión.
- No se documentan datos de entrenamiento, sesgos ni evaluaciones de seguridad; para producción conviene realizar evaluaciones propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FrontiersMind/NandiBERT-150M
- Organización en Hugging Face: https://huggingface.co/FrontiersMind
- GitHub: https://github.com/FrontiersMindAI/
- Blog de lanzamiento: https://www.frontiersmind.ai/blog/nandibert/
- Web oficial: https://www.frontiersmind.ai/
- Modelo relacionado (embeddings): https://huggingface.co/FrontiersMind/EmbeddingNandi-150M
- Modelo relacionado (450M): https://huggingface.co/FrontiersMind/NandiBERT-450M
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
