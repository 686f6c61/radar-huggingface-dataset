# FrontiersMind/NandiBERT-150M

## Resumen

NandiBERT-150M es un codificador bidireccional (encoder tipo BERT) desarrollado por FrontiersMind, disenado para cubrir simultaneamente ingles, lenguas indicas y otras lenguas asiaticas y de Oriente Medio en un unico modelo. Resuelve el problema clasico de tener que mantener un encoder fuerte en ingles y otro distinto para indico: aqui un solo checkpoint ofrece rendimiento competitivo en ambos frentes. Es relevante porque, con solo 146M parametros ajustables (224M almacenados en el checkpoint), alcanza una media de 67,37 en el conjunto de benchmarks indicos, superando a IndicBERT-v2 (272M), y una media de 62,20 en benchmarks ingleses, quedando cerca de encoders especializados en ingles de tamano similar como Ettin-Encoder-150M o UltraBERT-150M.

La arquitectura es un transformer encoder de 28 capas con 768 dimensiones ocultas, atencion con query agrupada (GQA), QK-norm y SwiGLU, con una ventana de contexto de 16.384 tokens y un vocabulario multilingue de 100K tokens compartido con el resto de la familia NandiBERT. Incorpora embeddings factorizados de rango 192, lo que reduce la tabla de embeddings de 77M a 19M parametros y libera capacidad para las capas del encoder. Se distribuye bajo licencia Apache-2.0 y esta pensado explicitamente como base para fine-tuning en clasificacion, NER, reranking y recuperacion.

El modelo se publica con pipeline de `fill-mask` y es cargable con `transformers`, lo que lo hace inmediatamente utilizable como punto de partida para tareas de comprension del lenguaje en entornos multilingues de bajo coste computacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional (estilo BERT) con GQA, QK-norm y SwiGLU |
| Parametros totales | 146M en el encoder ajustable; 224M almacenados en el checkpoint (incluye capa MLM no atada de 77M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 16.384 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | en, hi, mr, pa, ta, te, kn, ml, bn, gu, as, or, ur, ne, ar, id, ms (13 lenguas indicas en escritura nativa, 11 de ellas tambien en forma romanizada; mas ingles, arabe, indonesio y malayo) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria `transformers`, con `custom_code`) |

## Arquitectura y entrenamiento

NandiBERT-150M es un encoder transformer de 28 capas y 768 dimensiones ocultas. Frente al BERT clasico, incorpora varias decisiones de diseno modernas: atencion con query agrupada (GQA) para reducir coste de inferencia, QK-norm para estabilidad del entrenamiento y activacion SwiGLU en las capas feed-forward. La innovacion estructural mas destacada es el uso de embeddings factorizados de rango 192 sobre un vocabulario de 100K tokens: en lugar de almacenar una matriz de embeddings completa de 77M parametros, se factoriza en dos matrices de menor rango que suman 19M, redirigiendo esa capacidad a las capas del encoder. El vocabulario de 100K tokens es compartido con el resto de la familia NandiBERT (incluido NandiBERT-450M), lo que facilita reutilizar tokenizador y pipelines entre ambos tamanos.

El modelo se entrena con objetivo de modelado de lenguaje enmascarado (MLM) sobre un corpus multilingue que cubre ingles, 13 lenguas indicas en escritura nativa (asames, bengali, gujarati, hindi, kannada, malayo, marathi, nepalí, odia, punyabi, tamil, telugu y urdu), lenguas del sudeste asiatico (indonesio, malayo) y arabe. No se especifica en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO (poco habituales en encoders MLM). La model card menciona un informe tecnico "coming soon" que presumiblemente detallara estos datos.

## Capacidades

- Modelado de lenguaje enmascarado (`fill-mask`) en 17 idiomas, incluyendo ingles, 13 lenguas indicas, arabe, indonesio y malayo.
- Extraccion de representaciones contextuales para clasificacion de texto (sentimiento, inferencia, parafrasis, etc.).
- Reconocimiento de entidades nombradas (NER) y etiquetado de estructura (slot-filling), con resultados reportados en Naamapadam y MASSIVE.
- Pregunta-respuesta extractiva (QA), con resultados en IndicQA y SQuAD 2.0.
- Recuperacion y ranking (retrieval, reranking) evaluado en BEIR, MLDR, LongEmbed, RAR-b Code y RAR-b Math.
- Soporte de contexto largo de hasta 16K tokens, adecuado para documentos extensos y recuperacion sobre pasajes largos.
- Capacidad multilingue real en un unico modelo, incluyendo formas romanizadas de lenguas indicas.
- No se menciona soporte de tool calling, agentes, vision ni audio; es un encoder puro de comprension del lenguaje.

## Casos de uso

- Clasificacion de sentimiento multilingue en redes sociales o resenas: fine-tuning sobre la cabeza de clasificacion para predecir polaridad en hindi, tamil, bengali o ingles con un solo modelo, evitando mantener encoders separados por idioma.
- Reconocimiento de entidades nombradas en textos indicos: el modelo obtiene 77,4 de F1 en Naamapadam, por encima de IndicBERT-v2, lo que lo hace adecuado para extraccion de entidades en dominios como noticias o documentos administrativos en lenguas indicas.
- Reranking en sistemas de busqueda y RAG: con 16K de contexto y resultados competitivos en BEIR y LongEmbed, puede usarse como cross-encoder para reordenar pasajes recuperados en pipelines de recuperacion multilingue.
- Recuperacion densa de documentos largos: la ventana de 16.384 tokens permite codificar pasajes extensos sin truncar, util en busquedas sobre informes o expedientes en ingles y lenguas indicas.
- Etiquetado de slots para asistentes conversacionales: los resultados en MASSIVE Slot-fill lo habilitan como componente de comprension en asistentes de voz o chat en varios idiomas.
- Moderacion de contenido y clasificacion de toxicidad: fine-tuning rapido sobre el encoder con bajo coste (146M parametros ajustables) para desplegar clasificadores en produccion en CPU o GPU modestas.
- Analisis de codigo y matematicas en recuperacion: los resultados en RAR-b Code y RAR-b Math sugieren utilidad como encoder en busquedas sobre repositorios de codigo o problemas matematicos, aunque con margen de mejora frente a encoders especializados en ingles.
- Base para investigacion en NLP indico: punto de partida ligero y con licencia permisiva para experimentos academicos en lenguas con pocos recursos.

## Benchmarks y rendimiento

Resultados indicos (media de 3 semillas):

| Modelo | Parametros | IndicSentiment | IndicXNLI | IndicCOPA | IndicXParaphrase | Naamapadam NER (F1) | MASSIVE Slot-fill (F1) | IndicQA (F1) | Media |
|---|---|---|---|---|---|---|---|---|---|
| IndicBERT-v2 | 272M | 91,2 | 73,7 | 64,6 | 56,9 | 73,2 | 58,1 | 48,3 | 66,57 |
| NandiBERT-150M | 146M | 91,3 | 75,9 | 66,4 | 60,6 | 77,4 | 54,0 | 46,0 | 67,37 |

Resultados ingleses (media de 3 semillas):

| Modelo | Idiomas | Parametros | GLUE | SQuAD 2.0 | MUltiCoNERv2 | few-nerd | Reward Bench | BEIR | RAR-b Code | RAR-b Math | MLDR | LongEmbed | Media |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| BERT-base | Ingles | 110M | 84,7 | 76,3 | 53,8 | 66,6 | 59,4 | 36,7 | 6,6 | 27,5 | 29,0 | 29,3 | 51,45 |
| RoBERTa-base | Ingles | 125M | 86,4 | 83,7 | 56,5 | 67,1 | 63,2 | 39,6 | 11,7 | 33,4 | 28,7 | 33,8 | 55,20 |
| MosaicBERT-base | Ingles | 137M | 85,4 | 79,4 | 57,8 | 65,7 | 62,5 | 41,4 | 12,7 | 30,9 | 29,6 | 40,5 | 54,48 |
| NomicBERT-2048 | Ingles | 137M | 84,0 | 82,7 | 60,1 | 66,9 | 64,1 | 42,0 | 13,8 | 30,2 | 29,9 | 45,0 | 55,48 |
| GTE-en-MLM-base | Ingles | 137M | 85,6 | 82,7 | 59,2 | 66,4 | 63,4 | 42,4 | 12,0 | 33,6 | 37,1 | 58,5 | 55,66 |
| ModernBERT-base | Ingles | 149M | 88,4 | 86,7 | 57,4 | 66,7 | 68,0 | 42,6 | 29,6 | 46,1 | 37,7 | 63,2 | 60,69 |
| Ettin-Encoder-150M | Ingles | 149M | 88,9 | 87,4 | 57,4 | 66,5 | 70,3 | 42,4 | 31,8 | 47,1 | 35,9 | 60,1 | 61,48 |
| UltraBERT-150M | Ingles | 152M | 89,5 | 89,2 | 57,9 | 67,4 | 73,0 | 45,2 | 39,1 | 55,4 | 43,5 | 72,0 | 64,59 |
| NandiBERT-150M | Multilingue | 146M | 87,1 | 87,6 | 56,9 | 68,1 | 71,2 | 44,5 | 32,8 | 49,4 | 41,2 | 71,1 | 62,20 |

## Requisitos de hardware

- Inferencia en FP32: aproximadamente 0,9 GB de VRAM para los pesos (224M parametros).
- Inferencia en FP16/BF16: aproximadamente 0,45 GB de VRAM para los pesos.
- Fine-tuning completo en FP16 con Adam: estimacion de 4-6 GB de VRAM para lotes pequenos, dado el tamano del encoder y la ventana de 16K (la memoria de activaciones crece con la longitud de secuencia).
- Fine-tuning con LoRA o adaptadores: cabe en GPUs consumer de 8-12 GB (RTX 3060, RTX 4070) con secuencias moderadas.
- GPU recomendadas: A100 o H100 para entrenamiento a gran escala; RTX 4090, RTX 3090 o incluso RTX 4060 Ti para fine-tuning e inferencia.
- Cabe sin problema en GPUs consumer: si, incluso en tarjetas con 4-8 GB para inferencia.
- Opciones de despliegue: `transformers` (requiere `trust_remote_code` por el `custom_code`), exportacion a ONNX, y potencialmente llama.cpp/Ollama si se convierte a GGUF (no confirmado en la informacion disponible). Para servir en produccion, se puede usar TGI o un servidor FastAPI con ONNX Runtime.
- Latencia y throughput: no se han publicado datos especificos en la informacion disponible. Por tamano, se espera inferencia en pocos milisegundos por secuencia corta en GPU moderna y decenas de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Media indico | Media ingles | Licencia |
|---|---|---|---|---|---|---|
| NandiBERT-150M | 146M (224M en checkpoint) | 16K | 17 (incluye indico) | 67,37 | 62,20 | Apache-2.0 |
| IndicBERT-v2 | 272M | No disponible | Indico | 66,57 | No evaluado | No disponible en la informacion |
| ModernBERT-base | 149M | No disponible en la informacion | Ingles | No aplica | 60,69 | No disponible en la informacion |
| Ettin-Encoder-150M | 149M | No disponible en la informacion | Ingles | No aplica | 61,48 | No disponible en la informacion |
| UltraBERT-150M | 152M | No disponible en la informacion | Ingles | No aplica | 64,59 | No disponible en la informacion |

NandiBERT-150M es el unico de la comparativa que cubre simultaneamente ingles e indico con rendimiento competitivo en ambos: supera a IndicBERT-v2 en la media indico con la mitad de parametros, y queda por debajo de encoders especializados en ingles como UltraBERT-150M (64,59) o Ettin-Encoder-150M (61,48), pero por encima de ModernBERT-base (60,69) en la media inglesa reportada.

## Limitaciones y advertencias

- Es un encoder de comprension (MLM), no un modelo generativo: no produce texto libre ni mantiene conversaciones.
- Riesgo de alucinacion bajo en tareas de clasificacion y extraccion, pero presente en tareas generativas derivadas (por ejemplo, QA extractiva puede devolver respuestas incorrectas si el contexto no contiene la respuesta).
- Sesgos potenciales derivados del corpus de entrenamiento, no documentados en la informacion disponible; se recomienda auditar antes de desplegar en dominios sensibles.
- Cobertura desigual entre idiomas: los benchmarks reportados se centran en indico e ingles; el rendimiento en arabe, indonesio o malayo no esta cuantificado en la model card.
- El contexto de 16K es amplio, pero el coste de atencion crece de forma cuadratica; secuencias muy largas encarecen el fine-tuning.
- Requiere `trust_remote_code=True` por el `custom_code` del repositorio, lo que implica revisar el codigo antes de ejecutarlo en entornos de produccion.
- Licencia Apache-2.0 permisiva para uso comercial, pero conviene verificar la procedencia de los datos de entrenamiento (no detallada) para cumplir con posibles restricciones de terceros.
- El checkpoint incluye la capa MLM no atada (77M), por lo que el consumo de disco y memoria es mayor que el del encoder ajustable; para despliegue conviene podar esa cabeza si no se usa `fill-mask`.
- No hay informe tecnico publicado aun ("coming soon"), lo que limita la reproducibilidad y la evaluacion independiente.

## Enlaces

- Hugging Face: https://huggingface.co/FrontiersMind/NandiBERT-150M
- Modelo hermano NandiBERT-450M: https://huggingface.co/FrontiersMind/NandiBERT-450M
- GitHub de FrontiersMind: https://github.com/FrontiersMindAI/
- Blog de lanzamiento: https://www.frontiersmind.ai/blog/nandibert/
- Sitio web: https://www.frontiersmind.ai/
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
