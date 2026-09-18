# open-athena/MarinSkyRL-Open-MOPD-SmolLM3-3B-step-32

## Resumen

MarinSkyRL-Open-MOPD-SmolLM3-3B-step-32 es un checkpoint intermedio de un estudiante de destilación on-policy (Open-MOPD) construido sobre SmolLM3-3B, publicado por el usuario open-athena. El modelo parte del checkpoint SFT multidominio de los autores (BytedTsinghua-SIA/Open-MOPD-SmolLM3-3B-MixSFT) y aplica 32 pasos de optimizador de un objetivo de destilación en política, en el que las respuestas del estudiante son puntuadas por profesores de RL de matemáticas, código y seguimiento de instrucciones, enrutados por dominio.

El interés de esta ficha es doble. Por un lado, ilustra el pipeline MarinSkyRL (FSDP2, exportación a safetensors en seis ficheros) y el método Open-MOPD, que emplea los top-16 token IDs seleccionados por el estudiante junto con un surrogate de política recortado. Por otro, es un artefacto de investigación: se trata del paso 32 de una campaña que llegó hasta el paso 34 y se detuvo, no del modelo final de los autores (paso 200). No debe confundirse con él.

Con 3.337.766.912 parámetros, licencia Apache-2.0 y un export sin cuantizar de 6,7 GB, el modelo es manejable en hardware de consumo, pero su estado de entrenamiento incompleto lo sitúa como objeto de estudio de métodos de destilación y no como candidato de producción. La model card no documenta longitud de contexto, idiomas soportados ni composición detallada del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only derivada de SmolLM3 (etiqueta `smollm3`; los detalles de arquitectura no se documentan en la model card) |
| Parametros totales | 3.337.766.912 (3,34 B, dato real de safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | El checkpoint se publica sin cuantizar (BF16/FP16 en safetensors). No hay versiones GGUF, GPTQ ni AWQ publicadas; la cuantizacion a 8 bits o 4 bits puede realizarse a posteriori con herramientas estándar |
| Idiomas soportados | No disponible (la model card no declara idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (export de seis ficheros: `config.json`, `generation_config.json`, `tokenizer.json`, `tokenizer_config.json`, `chat_template.jinja` y pesos) |
| Modelo base | BytedTsinghua-SIA/Open-MOPD-SmolLM3-3B-MixSFT (fine-tuning sobre él) |
| Tamano del repositorio | 6,7 GB |
| Libreria | transformers |
| Pipeline | text-generation |
| Fecha de publicacion | 2026-09-18 |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 3,34 B de parámetros heredado de SmolLM3, con plantilla de chat propia (`chat_template.jinja`) y tokenizador compatible con `AutoTokenizer`. El export es un volcado directo de un checkpoint FSDP2 durable de MarinSkyRL (`global_step_32`), convertido a seis ficheros de Hugging Face y no cuantizado. La model card publica las huellas SHA-256 del export (`model.safetensors`: `bb7326640142069bc2e1fba5f54f15e0cccb1ff861f34f318b372eaab7abaf4b`) y del estado del entrenador (`a3f50a849ed43f06deef731bc676a1bf8d31fcf5d34ed2f63c8b6aa1c985da34`), lo que permite verificar la reproducibilidad del artefacto.

El entrenamiento sigue el método Open-MOPD: destilación on-policy en la que las respuestas del propio estudiante son evaluadas por profesores de RL especializados en matemáticas, código y seguimiento de instrucciones, con enrutamiento por dominio. El objetivo combina los top-16 token IDs seleccionados por el estudiante con un surrogate de política recortado (clipped policy surrogate), un esquema cercano a la destilación de distribución restringida a un subconjunto del vocabulario. La ejecución utilizó el código de MarinSkyRL en el commit `12e6da9e`. Se desconoce el número de tokens de entrenamiento, la composición exacta del dataset y si hubo fases adicionales de RLHF o DPO más allá del SFT heredado del modelo base.

## Capacidades

- Generación de texto conversacional con plantilla de chat incluida en el repositorio.
- Razonamiento matemático de competición: el modelo está entrenado con profesores de RL de matemáticas y se evalúa en AIME 2024 y AIME 2025.
- Generación de código: hay un profesor de RL de código en el pipeline y se generaron resultados de LiveCodeBench v5/v6, aunque la model card no reclama puntuaciones comparables con el paper.
- Seguimiento de instrucciones: evaluado con IFEval (mean@1 de 74,49 %) y con IFBench (resultados generados, sin puntuación comparable publicada).
- Razonamiento multi-paso orientado a problemas con respuesta verificable.
- Capacidades multilingües: no disponibles; la model card no documenta idiomas.
- Tool calling y function calling: no disponible; no se documenta soporte explícito.
- Soporte de agentes: no disponible; no se documenta.
- Capacidades de visión o audio: no disponibles; es un modelo exclusivamente de texto.

## Casos de uso

- Investigación en destilación on-policy: el checkpoint permite comparar el estado del estudiante en el paso 32 frente al paso 200 final de los autores, aislando el efecto del número de pasos de optimizador sobre AIME e IFEval. Es su uso principal y el motivo por el que se publicó.
- Reproducción de experimentos de RL: junto con las trazas retenidas (respuestas del estudiante y metadatos de enrutamiento por profesor) y el commit de MarinSkyRL, sirve para auditar el pipeline de entrenamiento y el enrutado por dominio.
- Tutoría de matemáticas asistida: con 3,34 B de parámetros y un 22-23 % de acierto en AIME con mean@64, puede emplearse como generador de soluciones candidatas en un sistema de voto mayoritario para problemas de nivel de instituto y competición.
- Generación de código en entornos con recursos limitados: al caber en GPUs de consumo, es viable como asistente local de autocompletado o generación de funciones, siempre que se valide la salida con tests automáticos.
- Extracción de información con formato controlado: la puntuación de 74,49 % en IFEval sugiere un seguimiento razonable de instrucciones para tareas de resumen estructurado o clasificación con salida JSON, útil en pipelines de procesamiento documental.
- Generación de datos sintéticos: un modelo de 3,34 B puede actuar como generador masivo de problemas y soluciones para alimentar el entrenamiento de modelos mayores, con filtrado posterior por verificador.
- Prototipado de agentes en el borde: desplegado en un portátil con GPU integrada o Apple Silicon para probar flujos conversacionales multi-turno antes de escalar a un modelo mayor.
- Destilación en cascada: uso como estudiante pequeño al que transferir el comportamiento de un modelo profesor mayor mediante el mismo esquema de top-k token IDs.

## Benchmarks y rendimiento

Evaluaciones independientes publicadas en la model card (conjuntos de 30 preguntas, 64 muestras por pregunta para AIME):

| Benchmark | Metrica | Correctas / salidas | Resultado |
|---|---|---:|---:|
| AIME 2024 | mean@64 | 423 / 1.920 | 22,03 % |
| AIME 2025 | mean@64 | 448 / 1.920 | 23,33 % |
| IFEval | mean@1 | 403 / 541 | 74,49 % |
| LiveCodeBench v5/v6 | No comparable | No disponible | Generado, sin puntuación reclamada |
| IFBench | No comparable | No disponible | Generado, sin puntuación reclamada |

La model card advierte explícitamente de que una respuesta greedy única no es comparable a un mean@64: para reproducir estas cifras hay que usar los conjuntos liberados de 30 preguntas, 64 muestras por pregunta, los prompts de evaluación registrados, los límites de generación y el grader original. No se publican resultados de MMLU, GSM8K, HumanEval ni comparaciones directas con el paso 200 en la información disponible.

## Requisitos de hardware

Estimaciones derivadas del recuento real de parámetros (3,34 B); no proceden de mediciones publicadas por el autor.

- VRAM para inferencia en BF16/FP16: aproximadamente 6,7 GB solo de pesos, más caché KV y overhead del runtime; en la práctica entre 8 y 10 GB para contextos cortos.
- VRAM en 8 bits: aproximadamente 3,5-4 GB de pesos.
- VRAM en 4 bits (NF4, GPTQ o AWQ, previa cuantización propia): aproximadamente 2-2,5 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S y RTX 4090 (24 GB) para BF16 sin restricciones; RTX 4080, 4070 Ti Super y 3090 (16-24 GB) también suficientes.
- GPU de consumo: sí cabe. Una RTX 3060 de 12 GB, una RTX 4060 Ti de 16 GB o una RTX 4070 de 12 GB ejecutan el modelo en BF16 con contexto moderado; con cuantización de 4 bits cabe en 8 GB. En Apple Silicon, 16 GB de memoria unificada son suficientes en 4-8 bits.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` es la vía soportada oficialmente. vLLM, SGLang y TGI deberían funcionar al ser una arquitectura SmolLM3 estándar. llama.cpp y Ollama requieren convertir los pesos a GGUF, ya que el repositorio no publica GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado | Rendimiento publicado |
|---|---:|---|---|---|---|
| MarinSkyRL-Open-MOPD-SmolLM3-3B-step-32 (este) | 3,34 B | No disponible | Apache-2.0 | Checkpoint intermedio, paso 32 | AIME 2024 22,03 % (mean@64); AIME 2025 23,33 %; IFEval 74,49 % |
| BytedTsinghua-SIA/Open-MOPD-SmolLM3-3B-MixSFT | No disponible (familia 3 B) | No disponible | No disponible en la información | SFT multidominio, punto de partida | No disponible |
| BytedTsinghua-SIA/Open-MOPD-SmolLM3-3B-Final | No disponible (familia 3 B) | No disponible | No disponible en la información | Modelo final, paso 200 | No disponible en esta ficha; consultar el paper Open-MOPD |
| SmolLM3-3B (familia base) | 3 B | No disponible en la información | Apache-2.0 | Modelo base público | No disponible en la información |

No se dispone de datos verificados en la información proporcionada para comparar con alternativas de otros fabricantes (Qwen, Llama, Gemma) en la misma franja de 3 B, por lo que la comparación cuantitativa con ellas queda como no disponible.

## Limitaciones y advertencias

- Es un checkpoint intermedio del paso 32 de una campaña detenida en el paso 34, no el modelo final de los autores (paso 200). No debe presentarse ni desplegarse como equivalente al resultado del paper.
- No está pensado para producción: la propia model card lo describe como un checkpoint temprano evaluado de forma independiente.
- Riesgo de alucinación propio de un modelo de 3,34 B entrenado para matemáticas y código: puede producir cadenas de razonamiento plausibles con resultados incorrectos.
- El 22-23 % de acierto en AIME se obtiene con 64 muestras por pregunta; el rendimiento en una única respuesta greedy es sustancialmente inferior y no es comparable.
- La evaluación publicada cubre solo tres de los seis benchmarks objetivo; LiveCodeBench v5/v6 e IFBench se generaron pero no se reclaman puntuaciones comparables con el paper.
- No se documentan sesgos, idiomas soportados ni composición del dataset, lo que impide evaluar cobertura lingüística o riesgo de sesgo por dominio.
- No hay evidencia publicada de soporte de tool calling, function calling, uso agéntico ni multimodalidad; asumir estas capacidades es un riesgo.
- No se publican versiones cuantizadas ni ficheros GGUF; cualquier despliegue en llama.cpp u Ollama exige una conversión propia, con la validación de calidad correspondiente.
- Aunque la licencia Apache-2.0 permite uso comercial, la ausencia de documentación sobre el dataset de destilación y sobre los profesores de RL utilizados dificulta una auditoría de procedencia para entornos regulados.
- La fecha de creación del repositorio y la referencia al paper (`arxiv:2608.19098`) deben verificarse en la fuente original antes de citarlas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/open-athena/MarinSkyRL-Open-MOPD-SmolLM3-3B-step-32
- Modelo base (SFT multidominio): https://huggingface.co/BytedTsinghua-SIA/Open-MOPD-SmolLM3-3B-MixSFT
- Modelo final de los autores (paso 200): https://huggingface.co/BytedTsinghua-SIA/Open-MOPD-SmolLM3-3B-Final
- Dataset de entrenamiento Open-MOPD-Data: https://huggingface.co/datasets/BytedTsinghua-SIA/Open-MOPD-Data
- Trazas de entrenamiento y evaluación: https://huggingface.co/datasets/open-athena/marinskyrl-open-mopd-native-traces
- Paper Open-MOPD: https://arxiv.org/abs/2608.19098
- Codigo de entrenamiento MarinSkyRL (commit 12e6da9e): https://github.com/marin-community/MarinSkyRL/tree/12e6da9eacddf02d844b7f9e90ba5370ff45761b

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los enlaces anteriores proceden exclusivamente de la model card y de los metadatos del repositorio.
