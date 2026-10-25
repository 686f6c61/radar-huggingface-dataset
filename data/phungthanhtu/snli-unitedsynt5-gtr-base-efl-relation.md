# phungthanhtu/snli-UnitedSynT5-gtr-base-efl-relation

## Resumen

`snli-UnitedSynT5-gtr-base-efl-relation` es un clasificador de inferencia en lenguaje natural (NLI) publicado por el usuario phungthanhtu como reproducción del pipeline *UnitedSynT5* descrito en el artículo arXiv:2412.09263. No es un modelo generativo: se trata de un encoder T5 (concretamente `sentence-transformers/gtr-t5-base`) al que se le ha añadido una cabeza propia de mean-pooling seguida de tres capas fully-connected con activación GeLU y dropout 0,1, y que se entrena para una tarea binaria de tipo EFL (entailment/contradiction) sobre el corpus SNLI.

El modelo resuelve un problema acotado y bien definido: dado un par de frases (premisa, hipótesis), decidir si la segunda se deduce de la primera. Para ello emplea la formulación EFL, en la que se construyen tres hipótesis con la plantilla `"... This is <label>."` y se selecciona la etiqueta con mayor `P(true)`. El checkpoint declarado tiene 110.515.202 parámetros (aproximadamente la mitad de un T5-base completo, lo que encaja con un stack solo-encoder) y un tamaño de repositorio de 0,4 GB en safetensors.

Su relevancia es fundamentalmente reproducible/investigadora: sirve como pieza de evaluación dentro de pipelines de verificación factual, atribución o filtrado de pares de frases, y como referencia para replicar los resultados del artículo. El autor reporta un macro-F1 de 0,8220 en el test de SNLI, entrenando sobre un subconjunto de 200.000 ejemplos. El modelo tiene 0 descargas y 0 likes, no declara licencia ni idiomas, y requiere cargar código propio del repositorio (`t5_nli.py`), lo que condiciona su uso en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder T5 (`sentence-transformers/gtr-t5-base`) + mean-pooling + 3 capas FC (GeLU, dropout 0,1); clase custom `T5NLI` en `t5_nli.py` |
| Parametros totales | 110.515.202 (≈110,5 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (la model card no especifica el máximo; el encoder base T5 usa embeddings posicionales relativos) |
| Tipos de cuantizacion | No disponible; solo se publican pesos en safetensors, sin versiones GGUF/AWQ/GPTQ |
| Idiomas soportados | No declarados; el entrenamiento se realizó sobre SNLI, corpus en inglés |
| Licencia | No disponible (no declarada en la model card ni en los metadatos) |
| Formato de pesos | safetensors (librería transformers, requiere código propio del repo) |

## Arquitectura y entrenamiento

La arquitectura es un encoder T5-base preentrenado (`gtr-t5-base`, el modelo de embeddings de Sentence-Transformers) reutilizado como extractor de representaciones. Sobre la salida del encoder se aplica mean-pooling para obtener un vector de frase, y a continuación tres capas fully-connected con activación GeLU y dropout de 0,1 que producen la clasificación final. La implementación no usa la clase estándar de transformers, sino una definición propia (`t5_nli.py`) incluida en el repositorio, por lo que es necesario cargar el módulo antes de instanciar el modelo.

El entrenamiento se realizó sobre un subconjunto de 200.000 ejemplos de SNLI (Standford Natural Language Inference), con la formulación EFL binaria y la plantilla de tipo `relation` indicada en el nombre del checkpoint. La model card no detalla el número total de tokens vistos, la composición exacta del dataset, la configuración de hiperparámetros ni si hubo etapas de ajuste fino adicionales (RLHF/DPO no aplican a un clasificador de este tipo). Tampoco se documentan innovaciones técnicas más allá de la propia formulación EFL con tres hipótesis y selección por `P(true)`, que implica tres pasadas hacia delante del encoder por cada par evaluado.

## Capacidades

- Clasificación de inferencia en lenguaje natural (NLI) binaria mediante la formulación EFL: dado un par (premisa, hipótesis), decide si la hipótesis se sigue de la premisa.
- Puntuación de tres hipótesis generadas con la plantilla `"... This is <label>."`, seleccionando la etiqueta con mayor `P(true)`.
- Extracción de representaciones de frase mediante mean-pooling del encoder (implícita en la arquitectura, aunque no se documenta su uso como modelo de embeddings independiente).
- No genera texto: es un clasificador, no un modelo causal ni seq2seq.
- No soporta tool calling ni function calling.
- No soporta flujos de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no declaradas; el entrenamiento se limita a SNLI en inglés.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Verificación de fidelidad en resúmenes automáticos: usar el modelo como componente tipo SummaC para comprobar si cada frase del resumen está implicada por el documento fuente; la formulación EFL con tres hipótesis permite umbralizar contradicciones de forma explícita.
- Guardrail de groundedness en pipelines RAG: dado el contexto recuperado y la respuesta generada por un LLM, comprobar la relación de implicación frase a frase y marcar como no soportadas aquellas afirmaciones que el clasificador etiquete como contradicción.
- Deduplicación y consistencia de bases de conocimiento: emparejar afirmaciones procedentes de distintas fuentes y detectar pares contradictorios antes de consolidarlas en un almacén único.
- Pre-etiquetado para anotación humana: clasificar automáticamente pares de frases de un corpus propio y enviar solo los casos de baja confianza a revisión manual, reduciendo el coste de anotación.
- Evaluación de sistemas de extracción de información: medir si las tuplas o frases extraídas están respaldadas por el texto original, usando la etiqueta de implicación como señal de soporte.
- Filtrado de datos de entrenamiento: descartar pares de frases inconsistentes en un corpus sintético antes de usarlo para ajuste fino de otro modelo.
- Control de calidad en sistemas de atención al cliente con base de FAQ: comprobar que la respuesta propuesta es consistente con la documentación de referencia antes de mostrarla al usuario.
- Análisis de contradicciones en revisiones o comentarios: agrupar opiniones y señalar pares mutuamente excluyentes sobre el mismo producto o entidad.

## Benchmarks y rendimiento

| Benchmark | Métrica | Resultado | Notas |
|---|---|---|---|
| SNLI (test) | Macro-F1 | 0,8220 | Entrenado sobre un subconjunto de 200k ejemplos de SNLI |

No se han publicado otros resultados de benchmarks en la información disponible (ni MMLU, ni HumanEval, ni GSM8K, ni evaluaciones fuera de dominio). Tampoco se aportan métricas comparativas frente al pipeline original del artículo arXiv:2412.09263 ni frente a otros clasificadores NLI.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,44 GB solo para pesos (110.515.202 × 4 bytes); en fp16/bf16, unos 0,22 GB. El repositorio ocupa 0,4 GB, coherente con estas cifras.
- El pico de memoria real depende del tamaño de lote y de la longitud de secuencia; con lotes grandes o secuencias largas conviene reservar varios GB adicionales para activaciones (estimación, no medida publicada).
- GPU recomendadas: cualquier GPU con 4 GB o más es suficiente (GTX 1650, RTX 3050, RTX 3060, RTX 4090); también cabe sobradamente en A100/H100 si se agrupa en lotes grandes para maximizar throughput.
- Cabe en GPU de consumo y también en CPU: con 110 M de parámetros, la inferencia en CPU es viable para volúmenes moderados, aunque el coste se triplica por la necesidad de evaluar tres hipótesis por par.
- Opciones de despliegue: `transformers` cargando la clase `T5NLI` desde `t5_nli.py` (requiere `sys.path.append` o `trust_remote_code`). No se documentan exportaciones a ONNX, TensorRT, GGUF ni compatibilidad directa con vLLM, TGI, llama.cpp u Ollama, al tratarse de una arquitectura custom de clasificación.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Macro-F1 SNLI | Licencia |
|---|---|---|---|---|---|
| `phungthanhtu/snli-UnitedSynT5-gtr-base-efl-relation` | 110.515.202 | No disponible | NLI binaria EFL (3 hipótesis) | 0,8220 | No disponible |
| `sentence-transformers/gtr-t5-base` (encoder base) | No disponible en la información proporcionada | No disponible | Embeddings de frase (no NLI) | No aplica | No disponible en la información proporcionada |
| Pipeline UnitedSynT5 del artículo arXiv:2412.09263 | No disponible en la información proporcionada | No disponible | NLI (referencia original) | No disponible en la información proporcionada | No disponible en la información proporcionada |
| Clasificadores NLI encoder-only tipo DeBERTa/RoBERTa | No disponible en la información proporcionada | No disponible | NLI multi-clase | No disponible en la información proporcionada | No disponible en la información proporcionada |

No se dispone de datos verificables de parámetros, contexto, licencia ni resultados de benchmarks de las alternativas en la información proporcionada, por lo que la comparación cuantitativa no puede completarse sin consultar sus respectivas model cards.

## Limitaciones y advertencias

- Es un clasificador, no un modelo generativo: no produce texto libre y no puede emplearse como sustituto de un LLM.
- La formulación EFL exige tres pasadas hacia delante por cada par, lo que triplica el coste computacional frente a un clasificador NLI estándar de una sola pasada.
- Entrenado sobre un subconjunto de 200.000 ejemplos de SNLI, un corpus construido a partir de descripciones de imágenes y con un vocabulario y una distribución de dominios muy acotados; el rendimiento fuera de ese dominio no está documentado.
- Solo se reporta macro-F1 en el test de SNLI (0,8220); no hay evaluación en MNLI, ANLI, dominios biomédicos, jurídicos ni en datos propios.
- Riesgo de alucinación en sentido estricto no aplica, pero sí de falsos positivos y falsos negativos en la clasificación; el resultado es sensible a la plantilla `"... This is <label>."` y a la formulación exacta de las hipótesis.
- Idiomas: no declarados; el entrenamiento se limita a inglés, por lo que el uso en castellano no está validado.
- Licencia no disponible: no puede confirmarse que el uso comercial esté permitido. Además, conviene verificar la licencia del encoder base `gtr-t5-base`, ya que el modelo deriva de él.
- Requiere ejecutar código Python incluido en el repositorio (`t5_nli.py`) para instanciar el modelo; revisar ese código antes de cargarlo en entornos de producción.
- El modelo no ha sido validado por la comunidad (0 descargas, 0 likes) y su metadato de creación (2026-10-25) es posterior a la fecha habitual de publicación, lo que conviene tener en cuenta al evaluar su trazabilidad.
- No se documenta calibración de probabilidades: los `logits` devueltos por la cabeza no deberían interpretarse como probabilidades calibradas sin un estudio adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/phungthanhtu/snli-UnitedSynT5-gtr-base-efl-relation
- Artículo de referencia (UnitedSynT5): https://arxiv.org/abs/2412.09263
- Encoder base: https://huggingface.co/sentence-transformers/gtr-t5-base
