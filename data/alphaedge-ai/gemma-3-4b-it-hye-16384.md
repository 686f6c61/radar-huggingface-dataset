# alphaedge-ai/gemma-3-4b-it-hye-16384

## Resumen
gemma-3-4b-it-hye-16384 es una variante podada del modelo google/gemma-3-4b-it, publicada por el usuario alphaedge-ai, especializada en armenio (codigo ISO 639-1: hy). La intervencion consiste en una reduccion del vocabulario del tokenizador de 262.144 a 16.384 tokens mediante la tecnica de trimming descrita por Loick Bourdois y colaboradores en Hugging Face, lo que elimina los tokens poco frecuentes en armenio y reduce el numero de parametros del modelo en un 14,63%.

El modelo conserva la arquitectura original de Gemma 3 (transformer decoder-only con atencion multimodal image-text-to-text) y el mismo contexto nativo del modelo base, pero con una huella de memoria menor: 3.670.770.032 parametros frente a los 4.300.079.472 del original, y un repositorio de 7,3 GB en safetensors. La reduccion de vocabulario afecta tanto a la matriz de embeddings de entrada como a la cabeza de salida, que son las que concentran la mayor parte del ahorro.

Es relevante para desarrolladores que necesiten desplegar un modelo conversacional de ~3,7B en entornos con VRAM limitada y con carga de trabajo exclusivamente en armenio, donde el vocabulario reducido mantiene una cobertura razonable. El precio a pagar es una perdida de competencia multilingue: los tokens de otros idiomas fueron eliminados del vocabulario, por lo que el modelo no debe usarse fuera del armenio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3), multimodal image-text-to-text en el modelo base |
| Parametros totales | 3.670.770.032 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el modelo base soporta cuantizaciones estandar, pero el autor no las documenta) |
| Idiomas soportados | armenio (hy) |
| Licencia | Gemma Terms of Use |
| Formato de pesos | safetensors |
| Vocabulario | 16.384 tokens (frente a 262.144 del original, -93,75%) |
| Tamano del repositorio | 7,3 GB |
| Modelo base | google/gemma-3-4b-it |
| Relacion con el base | quantized (podado por trimming de vocabulario) |
| Dataset de minado | lbourdois/fineweb-2-trimming (200.000 textos) |
| Libreria | transformers |
| Region declarada | eu |

## Arquitectura y entrenamiento
La arquitectura subyacente es la de Gemma 3 4B instruct, un transformer decoder-only con atencion por ventanas deslizantes y atencion global alternadas, y con capacidad multimodal image-text-to-text heredada del modelo base. El proceso de trimming no reentrena el modelo: parte de los pesos de google/gemma-3-4b-it, calcula la frecuencia de uso de cada token sobre 200.000 textos en armenio del dataset lbourdois/fineweb-2-trimming, conserva los 16.384 tokens mas relevantes y recorta las filas y columnas correspondientes de las matrices de embeddings y de la cabeza de proyeccion. El resto de pesos (capas de atencion, MLP, normalizaciones) se mantienen intactos.

La innovacion tecnica es exclusivamente la reduccion de vocabulario: no hay RLHF, DPO ni ajuste fino adicional documentado por el autor. El ahorro de parametros (629.309.440 menos) proviene casi integramente de las matrices de embedding y de la capa de salida, lo que reduce tanto el peso en disco como la memoria de activacion asociada al vocabulario. No se documentan cambios en el mecanismo de atencion, en la ventana de contexto ni en el modo thinking del modelo base.

## Capacidades
- Generacion de texto conversacional en armenio, con plantilla de chat aplicada mediante `apply_chat_template`.
- Razonamiento y respuesta a instrucciones heredados del ajuste instruct de Gemma 3 4B.
- Capacidad multimodal image-text-to-text heredada del modelo base (procesamiento de imagenes y texto combinados), aunque el pipeline declarado en el repositorio es text-generation.
- Soporte de tool calling y function calling heredado de Gemma 3, no verificado de forma independiente en esta variante podada.
- Uso en pipelines de transformers y compatibilidad con text-generation-inference y endpoints compatibles, segun los tags del repositorio.
- Capacidad multilingue limitada al armenio: el vocabulario reducido elimina los tokens de otros idiomas.
- No se documenta modo thinking explicito, soporte de audio ni otras capacidades especiales en la informacion proporcionada.

## Casos de uso
- Atencion al cliente en armenio: el modelo puede gestionar conversaciones multi-turno en armenio con una huella de memoria un 14,63% menor que el modelo base, lo que abarata el despliegue en instancias pequenas dedicadas a un unico idioma.
- Generacion de contenido editorial en armenio: redaccion de resumenes, articulos y descripciones de producto, aprovechando que el vocabulario podado esta optimizado con textos de FineWeb-2 en armenio.
- Clasificacion y extraccion de informacion de documentos en armenio: el modelo puede usarse como extractor de entidades o clasificador zero-shot en pipelines de procesamiento documental, con menor coste de inferencia que el original.
- Asistentes conversacionales embebidos en aplicaciones armenias: al reducir el repositorio a 7,3 GB y los parametros a 3,67B, es viable desplegarlo en GPUs de gama media o en entornos con VRAM ajustada.
- Traduccion asistida armenio a otros idiomas: util como generador del lado armenio en un pipeline de traduccion, aunque la salida hacia otros idiomas dependera de un segundo modelo, ya que el vocabulario de destino fue eliminado.
- Prototipado e investigacion sobre poda de vocabulario: sirve como caso de estudio reproducible para evaluar el impacto del trimming en tareas downstream en un idioma de bajos recursos.
- Procesamiento de imagenes con texto en armenio: al heredar la naturaleza image-text-to-text del modelo base, puede emplearse en tareas de descripcion de imagenes o VQA en armenio, siempre que se valide el comportamiento tras el podado.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El autor solo aporta la comparativa de tamano (vocabulario y parametros) frente a google/gemma-3-4b-it, sin metricas de calidad como MMLU, HumanEval o GSM8K para la variante podada.

## Requisitos de hardware
- VRAM estimada para inferencia en fp16: aproximadamente 7,3 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda un minimo de 10-12 GB de VRAM.
- VRAM estimada en cuantizacion de 8 bits: en torno a 4 GB para pesos; en 4 bits, en torno a 2 GB, aunque el autor no publica versiones cuantizadas y habria que generarlas.
- GPU recomendadas para fp16: NVIDIA A100, H100, L40S o RTX 4090 (24 GB). Cabe en RTX 3090 y RTX 4080 con margen.
- GPU de consumo: si cabe en RTX 4090, RTX 3090, RTX 4080 y, con cuantizacion, en GPUs de 8-12 GB como RTX 3060 Ti o RTX 4070.
- Opciones de despliegue: transformers (soporte nativo documentado), text-generation-inference y endpoints compatibles segun los tags; llama.cpp, Ollama y vLLM no estan documentados por el autor para esta variante.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Vocabulario | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| alphaedge-ai/gemma-3-4b-it-hye-16384 | 3.670.770.032 | 16.384 | no disponible | armenio | Gemma Terms of Use | Hugging Face (6 descargas) |
| google/gemma-3-4b-it | 4.300.079.472 | 262.144 | no disponible en la informacion | multilingue | Gemma Terms of Use | Hugging Face (oficial) |
| Otras variantes trimmed de Gemma 3 4B | no disponible | no disponible | no disponible | segun idioma | Gemma Terms of Use | Hugging Face |

La comparativa directa con alternativas de la misma categoria (modelos de ~4B especializados en un idioma de bajos recursos) no esta disponible en la informacion proporcionada. Frente al modelo base, la diferencia medible es un 14,63% menos de parametros y un 93,75% menos de vocabulario, a cambio de renunciar al multilingue.

## Limitaciones y advertencias
- El vocabulario reducido a 16.384 tokens elimina los tokens de otros idiomas; el modelo no debe usarse fuera del armenio y puede degradarse incluso en armenio con prestamos, nombres propios o alfabetos mixtos.
- No hay benchmarks publicados: el rendimiento real tras el podado no esta verificado de forma independiente y el autor solo afirma que "deberia" comportarse de forma similar al original.
- Riesgo de alucinacion inherente a los modelos de ~4B, no mitigado por el proceso de trimming.
- Sesgos heredados de los datos de entrenamiento de Gemma 3, no evaluados en esta variante.
- La licencia Gemma Terms of Use impone restricciones de uso comercial y obligaciones de atribucion; el modelo no esta afiliado ni respaldado por Google.
- El repositorio tiene un numero muy bajo de descargas (6) y cero likes, lo que sugiere escasa validacion por parte de la comunidad.
- La fecha de creacion declarada (2026-05-05) y la de actualizacion (2026-11-18) son posteriores a la informacion disponible sobre Gemma 3; conviene verificar la procedencia y la integridad de los pesos antes de usarlos en produccion.
- No se documentan versiones cuantizadas oficiales ni soporte verificado en llama.cpp, Ollama o vLLM.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/alphaedge-ai/gemma-3-4b-it-hye-16384
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Dataset de minado: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
- Blog sobre trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Paper de Gemma 3: https://arxiv.org/abs/2503.19786
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
