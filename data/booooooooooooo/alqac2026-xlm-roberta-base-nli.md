# Booooooooooooo/alqac2026-xlm-roberta-base-nli

## Resumen

El modelo `Booooooooooooo/alqac2026-xlm-roberta-base-nli` es un clasificador cross-encoder de inferencia de lenguaje natural (NLI) especializado en verificación de evidencia para recuperación de información jurídica (legal IR). Lo desarrolla un autor individual bajo el identificador `Booooooooooooo` en el marco de un trabajo de fin de grado sobre sistemas de recuperación de información legal, y se distribuye con licencia MIT. Parte del checkpoint `FacebookAI/xlm-roberta-base` y se afina sobre el conjunto de datos ALQAC2026 para una tarea binaria: decidir si un fragmento de evidencia jurídica respalda (entailment) o no respalda/contradice (contradiction) una consulta legal dada.

La arquitectura es la de un transformer encoder XLM-RoBERTa base con 278.045.186 parámetros totales, una longitud máxima de entrada de 512 tokens y agregación por máximo (bag aggregation = max) sobre los pasajes candidatos. La salida se interpreta mediante la diferencia de logits entre las dos clases, aplicando sigmoid para obtener una probabilidad de relevancia. El modelo está etiquetado exclusivamente para vietnamita (`vi`), lo que refleja el dominio lingüístico del corpus ALQAC, de carácter jurídico vietnamita.

Su relevancia actual es acotada pero específica: cubre una etapa de reranking/verificación dentro de pipelines de recuperación legal, un nicho donde los modelos generalistas suelen fallar por falta de vocabulario jurídico y por la necesidad de contrastar evidencia concreta contra una pregunta normativa. No obstante, el modelo tiene cero descargas y cero likes en el momento de la ficha, está recién publicado (27 de noviembre de 2026) y no incluye métricas de evaluación en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa base) como cross-encoder de clasificación de secuencias |
| Parametros totales | 278.045.186 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (max_length de entrada) |
| Tipos de cuantizacion | No disponible (el repo solo publica safetensors en fp32; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Vietnamita (`vi`) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 1,1 GB) |

## Arquitectura y entrenamiento

El modelo es un cross-encoder basado en `FacebookAI/xlm-roberta-base`, un transformer encoder multilingüe con 278 millones de parámetros. La cabeza de clasificación es la estándar de `AutoModelForSequenceClassification` con dos etiquetas: `0` para contradicción o evidencia no relevante y `1` para entailment o evidencia de soporte. La entrada se construye como par (pregunta, evidencia) tokenizado conjuntamente con truncación a 512 tokens, de modo que el encoder atiende de forma cruzada pregunta y pasaje, lo que permite capturar solapamiento léxico y semántico fino entre la consulta y el fragmento normativo.

El entrenamiento se realizó sobre el conjunto de datos ALQAC2026, en el marco de un trabajo de fin de grado sobre recuperación de información jurídica. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste por pares negativos. La agregación de puntuaciones a nivel de documento se hace por máximo (`bag aggregation: max`), es decir, se toma la evidencia con mayor probabilidad de entailment como representante del documento. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Clasificación binaria de pares (pregunta, evidencia) en lenguaje jurídico vietnamita: entailment frente a contradicción o no relevancia.
- Verificación de evidencia para pipelines de recuperación de información legal (reranking de pasajes candidatos).
- Puntuación calibrable mediante `sigmoid(logit_1 - logit_0)`, apta para umbrales ajustables en producción.
- Agregación a nivel de documento mediante máximo sobre pasajes, útil para seleccionar el fragmento más respaldante.
- Manejo de entradas de hasta 512 tokens, suficiente para párrafos normativos y preguntas legales típicas.
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito (thinking mode).
- Capacidad multilingüe limitada en la práctica al vietnamita, pese a que la base XLM-RoBERTa es multilingüe; no hay evidencia de rendimiento en otros idiomas.

## Casos de uso

- Reranking en recuperación legal: dado un conjunto de pasajes recuperados por un retriever (BM25 o denso), el modelo reordena los candidatos según la probabilidad de entailment respecto a la consulta, mejorando la precisión del top-k en asistentes jurídicos.
- Verificación de citas normativas: en un sistema que genera respuestas legales, el modelo comprueba que cada cita propuesta esté respaldada por el texto normativo recuperado, reduciendo alucinaciones en la fase de post-procesado.
- Asistencia a la búsqueda de precedentes y disposiciones: integrado en un buscador jurídico vietnamita, filtra documentos que, aunque compartan términos, no responden realmente a la pregunta del usuario.
- Control de calidad de bases de conocimiento legal: para validar pares (pregunta frecuente, artículo normativo) en la construcción de un corpus de preguntas y respuestas jurídicas, descartando asociaciones no sustentadas.
- Filtrado en pipelines RAG jurídicos: como etapa de verificación entre el retriever y el generador, el modelo decide si el contexto recuperado es suficiente para responder, activando una abstención o una nueva consulta cuando la puntuación de entailment es baja.
- Evaluación automática de respuestas legales: puntuar si una respuesta generada está respaldada por la evidencia normativa, útil en entornos de anotación o de control de calidad de datasets ALQAC.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión, recall, F1, MRR ni nDCG sobre ALQAC2026 ni sobre ningún otro conjunto.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,1 GB solo para pesos, más activaciones; en la práctica, entre 2 y 3 GB con batch pequeño a 512 tokens.
- VRAM estimada en fp16: alrededor de 0,6 GB para pesos; viable en GPUs consumer de gama baja.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16 (GTX 1650, RTX 3050, RTX 4060); para throughput alto, A100, H100 o L4 con batching.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPUs consumer modernas, e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: `transformers` con PyTorch (referencia de la model card), `vLLM` no aplica de forma nativa a encoders de clasificación, `TGI` con soporte de clasificación, `ONNX Runtime` y `Optimum` para exportación, y `llama.cpp`/`Ollama` solo si se convierte a GGUF (no publicado).
- Latencia y throughput estimados: no disponibles; al ser un encoder de 278 M de parámetros con entradas de 512 tokens, se espera un throughput del orden de cientos a miles de pares por segundo en una GPU moderna con batching, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Booooooooooooo/alqac2026-xlm-roberta-base-nli` | 278 M | 512 | NLI binario legal (vi) | MIT | Hugging Face, 0 descargas |
| `FacebookAI/xlm-roberta-base` | 278 M | 512 | Modelo base multilingüe | MIT | Hugging Face, ampliamente usado |
| `cross-encoder/nli-deberta-v3-base` | ~184 M | 512 | NLI generalista (en) | Apache 2.0 | Hugging Face |
| `MoritzLaurer/mDeBERTa-v3-base-mnli-xnli` | ~278 M | 512 | NLI multilingüe zero-shot | MIT | Hugging Face |

La comparación directa es limitada: no hay benchmarks publicados para el modelo ALQAC2026, por lo que no puede contrastarse su rendimiento frente a los cross-encoders NLI generalistas. La ventaja diferencial es su especialización en dominio jurídico vietnamita; la desventaja, la ausencia de evaluación pública y su nula tracción (0 descargas).

## Limitaciones y advertencias

- Ausencia total de métricas de evaluación publicadas: no es posible verificar su calidad frente a alternativas sin una evaluación propia sobre ALQAC2026 o un conjunto jurídico vietnamita.
- Sesgos potenciales derivados del corpus ALQAC2026: la cobertura normativa, la época de las normas y el estilo de redacción del dataset condicionan lo que el modelo considera evidencia válida.
- Riesgo de alucinación no aplica en sentido generativo (es un clasificador), pero sí de falsos positivos de entailment cuando la evidencia comparte vocabulario jurídico sin respaldar realmente la pregunta.
- Limitación idiomática: aunque la base XLM-RoBERTa es multilingüe, el ajuste se declara solo para vietnamita; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea deficiente.
- Límite de 512 tokens: pasajes normativos largos deben truncarse o dividirse, lo que puede perder la parte relevante de la evidencia.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene auditar el modelo antes de integrarlo en producción.
- Modelo recién publicado y sin tracción: sin descargas ni likes, sin issues ni discusión comunitaria, lo que implica ausencia de validación externa.
- No apto para generación de texto ni para tareas de razonamiento multi-paso: es exclusivamente un clasificador de pares.

## Enlaces

- Hugging Face: https://huggingface.co/Booooooooooooo/alqac2026-xlm-roberta-base-nli
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-base
- Paper de XLM-RoBERTa: https://arxiv.org/abs/1911.02116
- No se han encontrado papers, blogs, repositorios ni demos adicionales del autor en la información disponible.
