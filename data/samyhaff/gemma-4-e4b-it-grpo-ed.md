# samyhaff/gemma-4-e4b-it-grpo-ed

## Resumen

gemma-4-e4b-it-grpo-ed es un ajuste fino de google/gemma-4-E4B-it orientado especificamente a la desambiguacion de entidades (entity disambiguation, ED). Lo desarrolla Samy Haffoudhi (usuario samyhaff) en el marco del articulo "When Does Reasoning Help Entity Disambiguation? Small LLMs In-Domain and Under Shift", aceptado en Findings de EACL 2027. El modelo recibe un texto con una mencion marcada entre corchetes y una lista numerada de candidatos, razona sobre el contexto y responde con el indice del candidato elegido.

El modelo parte de la base instructiva de Gemma 4 de 4B parametros efectivos (identificador E4B) y se entrena mediante LoRA fusionado con aprendizaje por refuerzo verificable (RLVR) usando GRPO, con una recompensa que premia la seleccion del candidato correcto sobre el conjunto de datos ZELDA. El resultado es un modelo de aproximadamente 8.000 millones de parametros totales en safetensors, con licencia Apache 2.0 y formato compatible con transformers y vLLM.

Su relevancia radica en que demuestra que modelos pequenos, cuando se entrenan con RL sobre una tarea concreta, pueden alcanzar un rendimiento competitivo en desambiguacion de entidades tanto en dominio (ZELDA, 80,4 % de exactitud) como fuera de dominio en regimen zero-shot real (ZESHEL, 76,3 % de exactitud normalizada). Es una pieza util para pipelines de entity linking donde se necesita un reranker/desambiguador ligero y desplegable en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 4, variante E4B); no se detalla si emplea atencion lineal o hibrida |
| Parametros totales | 7.996.156.490 (~8B) |
| Parametros activos | no disponible (el identificador E4B sugiere parametros efectivos de 4B, pero no se confirma en la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se listan GGUF ni otras variantes) |
| Idiomas soportados | no disponible (hereda los del modelo base, sin confirmar en la ficha) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint google/gemma-4-E4B-it, un transformer decoder-only de la familia Gemma 4 con aproximadamente 8.000 millones de parametros totales en el checkpoint publicado. El ajuste se realizo con LoRA y posteriormente se fusionaron los adaptadores en los pesos base, de modo que el repositorio contiene un unico conjunto de pesos safetensors de 16 GB.

El entrenamiento combina instruccion supervisada (heredada del modelo base) con RLVR mediante GRPO sobre el conjunto ZELDA. La funcion de recompensa premia la seleccion del candidato correcto, lo que empuja al modelo a producir razonamientos intermedios utiles antes de emitir el indice final. El prompt de inferencia exige marcar la mencion con corchetes, numerar los candidatos y terminar la respuesta con `"answer": <indice>`. La evaluacion recomendada por el autor consiste en muestrear 10 completions y aplicar voto por mayoria, lo que actua como decodificacion auto-consistente. El articulo asociado analiza cuando el razonamiento ayuda a la desambiguacion en modelos pequenos, tanto en dominio como bajo cambio de distribucion.

## Capacidades

- Desambiguacion de entidades en contexto: dado un texto con una mencion marcada y una lista de candidatos con descripciones, selecciona el candidato correcto por indice.
- Razonamiento explicito antes de responder: el modelo genera una cadena de razonamiento y termina con el campo `"answer": <indice>`.
- Entity linking en pipeline: encaja como etapa de desambiguacion/reranking despues de un recuperador de candidatos (en el articulo, tras qwen3-4b-reranker-ed).
- Generacion de texto conversacional: hereda la capacidad de chat del modelo base instructivo.
- Modo thinking: la plantilla de chat admite `enable_thinking: True` para activar el razonamiento.
- Capacidad multimodal image-text-to-text: el tag del modelo indica soporte de entrada imagen-texto, aunque el ajuste se centra en texto.
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes multi-paso: no disponible en la informacion.
- Capacidades multilingues: no disponibles en la informacion (dependen del modelo base).

## Casos de uso

- Desambiguacion en pipelines de entity linking: el modelo se situa tras un recuperador que devuelve los 10 mejores candidatos y elige el correcto por voto mayoritario, tal como se describe en el articulo y el repositorio ed-study.
- Enriquecimiento de bases de conocimiento: procesar noticias o documentos para resolver menciones ambiguas (por ejemplo, "Jordan" como pais, persona o rio) antes de insertar entidades en un grafo de conocimiento.
- Busqueda semantica con resolucion de entidades: normalizar menciones en consultas y documentos para mejorar la recuperacion cuando los terminos son polisemicos.
- Analisis de prensa y monitorizacion de medios: identificar de forma fiable a que persona u organizacion se refiere cada mencion en articulos con contexto largo.
- Construccion de datasets de entrenamiento: usar el modelo como anotador automatico de alta precision en tareas de entity disambiguation, filtrando por consenso de 10 muestras.
- Evaluacion comparativa de razonamiento: servir como referencia de modelo pequeno entrenado con GRPO para estudiar cuando el razonamiento mejora o perjudica la tarea, replicando los experimentos del paper.
- Despliegue en hardware modesto: al ser un modelo de ~8B con licencia Apache 2.0, puede ejecutarse en una unica GPU consumer de gama alta para tareas de desambiguacion por lotes.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| ZELDA (exactitud) | 80,4 |
| ZESHEL, zero-shot real (exactitud normalizada) | 76,3 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otras tareas generales para este ajuste.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamano del checkpoint (~8B parametros, 16 GB en safetensors en fp16/bf16) se estima en torno a 16-20 GB en bf16, aunque este dato no lo confirma el autor.
- GPU recomendadas: no disponibles en la informacion. Por tamano, una A100 40/80 GB, H100 o L40S son opciones seguras para bf16; una RTX 4090 (24 GB) deberia poder alojar el modelo en bf16, aunque no se confirma.
- Cabe en GPU consumer: probablemente en RTX 4090 y modelos con 24 GB o mas en bf16; en GPUs con menos VRAM requeriria cuantizacion, para la que no se publican pesos.
- Opciones de despliegue: vLLM (usado en el ejemplo oficial con `LLM.chat` y `SamplingParams`), transformers (libreria declarada) y cualquier runtime compatible con safetensors. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El ejemplo oficial muestrea 10 completions con `max_tokens: 2048`, lo que implica un coste de inferencia multiplicado por 10 por consulta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| samyhaff/gemma-4-e4b-it-grpo-ed | ~8B | no disponible | Entity disambiguation (GRPO) | Apache 2.0 | Hugging Face |
| google/gemma-4-E4B-it | ~8B (checkpoint base) | no disponible | Modelo instructivo general | Gemma (terminos de Google) | Hugging Face |
| samyhaff/qwen3-4b-reranker-ed | ~4B | no disponible | Recuperacion/reranking de candidatos para ED | no disponible | Hugging Face |

No se dispone de datos de rendimiento de los modelos comparables en la informacion proporcionada, por lo que la comparacion cuantitativa no esta disponible.

## Limitaciones y advertencias

- El modelo esta especializado en desambiguacion de entidades; su rendimiento en tareas generales de generacion o codigo no se ha evaluado y puede degradarse respecto al modelo base.
- Requiere un formato de prompt estricto (mencion entre corchetes, candidatos numerados, respuesta con `"answer": <indice>`); fuera de ese formato la calidad no esta garantizada.
- La evaluacion recomendada depende de muestrear 10 completions y votar, lo que multiplica el coste computacional y la latencia.
- Riesgo de alucinacion: el modelo puede razonar de forma plausible pero elegir un indice incorrecto, especialmente con candidatos muy similares o contextos ambiguos.
- Sesgos conocidos: no se documentan en la informacion disponible; hereda los sesgos del modelo base Gemma 4.
- Limitaciones de idioma: no se especifican los idiomas soportados; el ajuste se realizo sobre ZELDA, por lo que el rendimiento fuera de su distribucion (ZESHEL) ya muestra una caida (80,4 frente a 76,3).
- Restricciones de licencia: la ficha declara Apache 2.0, pero al derivar de google/gemma-4-E4B-it conviene verificar los terminos de uso del modelo base de Google para uso comercial.
- Para produccion: conviene validar el modelo en el dominio concreto y monitorizar el consenso entre muestras como senal de confianza.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/samyhaff/gemma-4-e4b-it-grpo-ed
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Recuperador de candidatos: https://huggingface.co/samyhaff/qwen3-4b-reranker-ed
- Paper (arXiv): https://arxiv.org/abs/2611.30334
- Repositorio con pipeline y evaluacion: https://github.com/samyhaff/ed-study
