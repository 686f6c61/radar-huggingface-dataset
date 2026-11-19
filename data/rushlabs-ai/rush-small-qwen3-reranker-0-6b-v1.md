# rushlabs-ai/rush-small-qwen3-reranker-0.6b-v1

## Resumen

Rush Small v1 es un modelo de reranking (cross-encoder) de 0,6 mil millones de parametros desarrollado por Rush Labs, un laboratorio de IA aplicada. Se trata de un ajuste fino por destilacion de Qwen3-Reranker-0.6B cuyo objetivo es aproximar la calidad de Qwen3-Reranker-4B en la tarea de reordenar pasajes recuperados por un motor de busqueda, manteniendo el mismo tamano, prompt y esquema de puntuacion yes/no que el modelo base. Es, por tanto, un reemplazo directo (drop-in) del reranker original de 0,6B.

La relevancia del modelo reside en dos factores. Primero, su receta de entrenamiento esta construida exclusivamente con datos que permiten uso comercial (GooAQ, PubMedQA, Natural Questions, HotpotQA y SQuAD), sin MS MARCO ni datos generados por modelos cerrados, lo que elimina una de las principales fricciones legales del reranking open source. Segundo, todo el pipeline (revisiones fijadas, ficheros de resultados y comando de reproduccion) esta publicado en el repositorio `rushlabs-ai/rush-small`, lo que permite auditar y replicar el entrenamiento.

Arquitectonicamente es un transformer decoder-only de Qwen3 reutilizado como cross-encoder: puntua pares consulta-documento con un unico forward pass y una cabeza de clasificacion binaria sobre los logits de los tokens `yes` y `no`. El contexto de entrada efectivo en el ejemplo de uso esta limitado a 1024 tokens por par. Se distribuye en safetensors (bfloat16) y en GGUF q8_0 para llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) usado como cross-encoder de reranking |
| Parametros totales | 595.776.512 (0,6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens por par consulta-documento en el ejemplo de uso (limite de truncamiento configurado); contexto nativo del base no especificado |
| Tipos de cuantizacion | GGUF q8_0 publicado; safetensors en bfloat16 |
| Idiomas soportados | en (ingles; el entrenamiento es mayoritariamente en ingles y el multilingue no esta medido) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, GGUF (q8_0, 639 MB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-Reranker-0.6B, un transformer decoder-only de la familia Qwen3, y lo utiliza como cross-encoder: la consulta, una instruccion y el documento se concatenan en una plantilla con tokens especiales de chat (`<|im_start|>`, `<Instruct>`, `<Query>`, `<Document>`, bloque `<think>` vacio) y la relevancia se calcula como `sigmoid(logit_yes - logit_no)` sobre la ultima posicion. No hay pooling de embeddings ni similitud coseno: es una clasificacion generativa restringida a dos tokens.

El entrenamiento es una destilacion del profesor Qwen3-Reranker-4B sobre el alumno de 0,6B. Se reunieron 48.000 preguntas de cinco fuentes (GooAQ 16.000, Natural Questions 10.000, PubMedQA 8.000, HotpotQA 8.000, SQuAD 6.000), cada una con su pasaje verdadero y 15 negativos duros minados con BM25 del mismo corpus, excluyendo pasajes conocidos como relevantes. El profesor puntuo los 763.200 pares (logit yes menos no) y el alumno se entreno con ajuste fino completo combinando una KL listwise hacia el profesor y 0,5 x BCE pointwise, con learning rate 5e-6, 2.300 pasos de 8 preguntas y una sola GPU NVIDIA L40S durante 4 horas. Sobre 300 preguntas reservadas, la primera eleccion del alumno coincidio con la del profesor en el 85,7% de los casos, frente al 81,7% del modelo base. Es un unico seed, un unico learning rate y aproximadamente el 39% de una epoca sobre los datos.

## Capacidades

- Reranking de pasajes: puntua la relevancia de un documento respecto a una consulta con un valor continuo entre 0 y 1.
- Cross-encoding con instruccion: acepta un campo `<Instruct>` para adaptar el criterio de relevancia (por ejemplo, busqueda web, respuesta a preguntas).
- Puntuacion yes/no calibrada mediante sigmoide sobre la diferencia de logits.
- Compatibilidad drop-in con Qwen3-Reranker-0.6B: mismo prompt, mismo tamano y mismo esquema de scoring.
- Soporte de lotes con padding izquierdo y truncamiento a 1024 tokens en el ejemplo publicado.
- Despliegue en llama.cpp con modo `--rerank` y en Ollama mediante la herramienta rerankd, que anade endpoints `/api/rerank`, `/v1/rerank` y `/rerank`.
- No se documentan capacidades de generacion libre, tool calling, agentes, vision ni audio; el uso previsto es exclusivamente el ranking de texto.

## Casos de uso

- Segunda etapa de un pipeline RAG: tras una recuperacion densa o BM25 de, por ejemplo, 100 candidatos, el modelo reordena y se queda con los 5-10 mejores antes de pasarlos al generador, reduciendo contexto irrelevante y coste de tokens.
- Busqueda empresarial sobre documentacion interna: indexado con BM25 y reranking con Rush Small v1 para consultas en ingles sobre manuales, wikis o tickets, donde el coste por consulta de un modelo de 0,6B es bajo.
- Respuesta a preguntas sobre literatura biomedica: el entrenamiento incluye PubMedQA y los resultados en SciFact y NFCorpus son competitivos, lo que lo hace adecuado para reordenar abstracts y articulos cientificos.
- Verificacion de hechos y atribucion de evidencia: los resultados en FEVER y Climate-FEVER (0,820 y 0,276 de nDCG@10) permiten seleccionar el pasaje que respalda o refuta una afirmacion antes de una etapa de verificacion.
- Busqueda semantica en foros y QA comunitario: el buen comportamiento en Quora (0,858) lo hace util para reordenar preguntas y respuestas duplicadas o relacionadas.
- Despliegue en local o en el borde: el GGUF q8_0 de 639 MB cabe en CPU y en GPUs de consumo, lo que permite reranking en entornos sin GPU dedicada o con requisitos de privacidad estrictos.
- Servicio de reranking como microservicio: integrable en llama-server con `--rerank` o en Ollama via rerankd, exponiendo un endpoint HTTP compatible con pipelines existentes.

## Benchmarks y rendimiento

Resultados publicados por el autor: nDCG@10 reordenando el top 100 de BM25 sobre conjuntos de test de BEIR, con hasta 1.000 consultas por conjunto (muestra aleatoria fija, identica para todos los modelos).

| Conjunto | Consultas | BM25 | Qwen3-Reranker-0.6B | Rush Small v1 | Cambio |
|---|---|---|---|---|---|
| TREC-COVID | 50 | 0,593 | 0,832 | 0,836 | +0,4 |
| NFCorpus | 323 | 0,306 | 0,354 | 0,355 | +0,0 |
| FiQA | 648 | 0,233 | 0,367 | 0,400 | +3,3 |
| ArguAna | 1.000 | 0,481 | 0,666 | 0,658 | -0,8 |
| Touche-2020 | 49 | 0,356 | 0,272 | 0,339 | +6,6 |
| Quora | 1.000 | 0,755 | 0,849 | 0,858 | +0,9 |
| DBPedia | 400 | 0,270 | 0,398 | 0,407 | +0,9 |
| SCIDOCS | 1.000 | 0,154 | 0,205 | 0,209 | +0,4 |
| FEVER | 1.000 | 0,484 | 0,813 | 0,820 | +0,7 |
| Climate-FEVER | 1.000 | 0,130 | 0,278 | 0,276 | -0,2 |
| SciFact | 300 | 0,662 | 0,746 | 0,757 | +1,2 |
| Media, 11 conjuntos zero-shot | | 0,402 | 0,525 | 0,538 | +1,2 |
| NQ (en entrenamiento) | 1.000 | 0,273 | 0,539 | 0,572 | +3,3 |
| HotpotQA (en entrenamiento) | 1.000 | 0,551 | 0,736 | 0,752 | +1,7 |

Mejora en 9 de los 11 conjuntos zero-shot y retrocede ligeramente en ArguAna y Climate-FEVER. El autor advierte que TREC-COVID y Touche-2020 tienen unas 50 consultas cada uno y deben tratarse como ruidosos, y que los numeros dependen de la primera etapa BM25 y de la muestra de consultas, por lo que solo son comparables dentro de esta tabla.

## Requisitos de hardware

- VRAM en bfloat16: aproximadamente 1,2 GB de pesos mas activaciones y cache; con lotes pequenos cabe holgadamente en cualquier GPU con 4 GB o mas.
- VRAM en GGUF q8_0: el fichero pesa 639 MB, por lo que la inferencia en CPU es viable y en GPU requiere menos de 1 GB adicional.
- GPU recomendadas: NVIDIA L40S (usada en el entrenamiento), A100, H100 para alto throughput; RTX 4090, RTX 3090 y GPUs de 8 GB en adelante para servicio de baja latencia.
- GPU de consumo: si, cabe en cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060 8 GB, etc.) e incluso en CPU con llama.cpp.
- Opciones de despliegue: Transformers con `AutoModelForCausalLM` y `AutoTokenizer`, llama.cpp (`llama-server --rerank`), Ollama mediante rerankd y endpoints compatibles con `/v1/rerank`.
- Latencia y throughput: no disponibles en la informacion proporcionada; solo se documenta el coste de entrenamiento (4 horas en una L40S para 2.300 pasos).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | nDCG@10 medio BEIR (11 zero-shot) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rush Small v1 | 0,6B | 1024 tokens por par (ejemplo) | 0,538 | Apache-2.0 | Hugging Face (safetensors + GGUF) |
| Qwen3-Reranker-0.6B | 0,6B | no disponible | 0,525 | Apache-2.0 | Hugging Face |
| Qwen3-Reranker-4B | 4B | no disponible | no disponible en la informacion | Apache-2.0 | Hugging Face (profesor de la destilacion) |
| BM25 (primera etapa) | no aplica | no aplica | 0,402 | no aplica | Referencia de baseline |

La comparacion con Qwen3-Reranker-4B no puede hacerse con datos de esta ficha: el autor lo usa como profesor pero no publica su nDCG@10 en la tabla. No se dispone de datos de otros rerankers de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Un solo seed y un solo learning rate; el modelo se entreno sobre aproximadamente el 39% de una epoca, por lo que la varianza entre ejecuciones no esta caracterizada.
- Los datos de entrenamiento son mayoritariamente en ingles; la calidad multilingue no se ha medido y el tag de idioma del repositorio es solo `en`.
- Los resultados de BEIR dependen de la primera etapa BM25 y de la muestra de consultas; no son directamente comparables con los de otros papers.
- TREC-COVID y Touche-2020 tienen alrededor de 50 consultas y sus cifras deben considerarse ruidosas.
- Retroceso medido en ArguAna (-0,8) y Climate-FEVER (-0,2) respecto al modelo base.
- Riesgo de alucinacion: aunque el modelo no genera texto libre, la puntuacion de relevancia puede ser incorrecta en dominios alejados de los datos de entrenamiento (por ejemplo, dominios muy tecnicos o no ingleses).
- Licencia Apache-2.0 para los pesos, pero tres de las cinco fuentes de datos son share-alike (Natural Questions CC BY-SA 3.0; HotpotQA y SQuAD CC BY-SA 4.0); el autor advierte que no esta resuelto si esos terminos alcanzan a los pesos entrenados y recomienda consultar asesoria legal si es relevante.
- El contexto de entrada del ejemplo esta truncado a 1024 tokens; documentos mas largos se recortan y pueden perder la evidencia relevante.
- No se documentan sesgos especificos; al entrenarse con datos en ingles de QA y ciencia, puede infravalorar pasajes en otras lenguas o de registros no representados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rushlabs-ai/rush-small-qwen3-reranker-0.6b-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3-Reranker-0.6B
- Profesor de la destilacion: https://huggingface.co/Qwen/Qwen3-Reranker-4B
- Repositorio de la receta: https://github.com/rushlabs-ai/rush-small
- Herramienta rerankd: https://github.com/rushlabs-ai/rerankd
- Sitio del autor: https://rushlabs.ai
