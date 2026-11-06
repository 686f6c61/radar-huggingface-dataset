# hiimivantang/medgen-ja-qwen3-8b-question-understanding-lora

## Resumen

medgen-ja-qwen3-8b-question-understanding-lora es un adaptador LoRA (PEFT) sobre el modelo base Qwen/Qwen3-8B, desarrollado por el usuario hiimivantang. Su funcion es convertir una pregunta clinica formulada en japones por un profesional sanitario en un objeto JSON estructurado que contiene una etiqueta de intencion (7 clases), los campos PICO (poblacion, intervencion, comparacion y desenlace, con valor nulo cuando la pregunta no los explicita), entidades medicas tipadas y terminos de busqueda en japones, ingles, sinonimos y abreviaturas para recuperacion de literatura cientifica.

El modelo resuelve el problema de la formulacion de consultas bibliograficas: transforma lenguaje natural clinico en una representacion estructurada y reutilizable por sistemas de recuperacion de evidencia. Es relevante porque demuestra que un adaptador de rango 16 entrenado con 2.642 ejemplos sinteticos puede igualar a una referencia comercial propietaria en su tarea especifica, con una tasa de campos alucinados del 3,3 % frente al 32,5 % del modelo base sin adaptar.

Se trata exclusivamente de un adaptador: no contiene los pesos del modelo base. El repositorio ocupa 0,1 GB y esta etiquetado como prueba de concepto de investigacion, no validada clinicamente. La arquitectura subyacente es la del transformer decoder-only Qwen3-8B, con 8.000 millones de parametros y una ventana de contexto que el adaptador no modifica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen3-8B |
| Parametros totales | 8.000 millones (modelo base; el adaptador anade un conjunto reducido de pesos de bajo rango) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen3-8B) |
| Tipos de cuantizacion | no disponible; el adaptador se distribuye en safetensors y se entrena en bf16 |
| Idiomas soportados | japones (ja) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

Parametros adicionales del adaptador:

| Parametro | Valor |
|---|---|
| Rango / alpha / dropout | 16 / 32 / 0,05 |
| Modulos objetivo | q_proj, k_proj, v_proj, o_proj |
| Revision del modelo base | b968826d9c46dd6066d109eabc6255188de91218 |
| Plantilla de chat | qwen3, con thinking desactivado (enable_thinking=False) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-8B, un transformer decoder-only de 8.000 millones de parametros. El ajuste se realizo con LoRA mediante LLaMA-Factory, con rango 16, alpha 32, dropout 0,05 y modulos objetivo q_proj, k_proj, v_proj y o_proj. Se entrenaron 2.642 ejemplos en 332 pasos, con tasa de aprendizaje 1e-4 y schedule cosine, 2 epocas, precision bf16 y semilla 42, sobre hardware NVIDIA DGX Spark (GB10).

Los datos de entrenamiento son sinteticos: las preguntas, las etiquetas estructuradas y las respuestas de referencia fueron generadas por un modelo maestro local con licencia Apache-2.0 (Qwen3.5-122B) a partir de resumenes de literatura de acceso abierto en Europe PMC, restringidos a licencias CC BY y CC0. No se utilizo salida de OpenAI como dato de entrenamiento. La innovacion principal no es arquitectonica sino de formato: el adaptador impone una salida JSON estricta con campos PICO y terminos de busqueda multilingues, y se entrena con thinking desactivado para forzar respuestas directas y deterministas (decodificacion greedy, temperatura 0).

## Capacidades

- Generacion de texto en japones orientada a la estructuración de preguntas clinicas.
- Clasificacion de intencion en 7 clases: treatment, diagnosis, safety, prognosis, evidence_comparison, clinical_research y other.
- Extraccion de campos PICO (population, intervention, comparison, outcome) respetando la formulacion literal de la pregunta y devolviendo null cuando el dato no aparece.
- Extraccion de entidades medicas tipadas: disease, symptom, drug, procedure, outcome y abbreviation.
- Generacion de terminos de busqueda bibliografica en japones, ingles, sinonimos en ingles y abreviaturas relacionadas.
- Salida en JSON unico, sin explicaciones ni bloques de codigo.
- No soporta tool calling ni function calling segun la informacion disponible.
- No soporta agentes ni razonamiento multi-paso: el modo thinking esta explicitamente desactivado.
- No dispone de capacidades de vision ni audio.
- Multilingue limitado: entrada en japones y salida con terminos en japones e ingles.

## Casos de uso

- Busqueda bibliografica clinica asistida: el adaptador convierte la pregunta de un medico en campos PICO y terminos de busqueda listos para lanzar contra PubMed, Europe PMC o bases internas, reduciendo la ambiguedad de la consulta en lenguaje natural.
- Construccion de un front-end de preguntas clinicas estructuradas: un formulario o caja de texto libre en japones puede alimentar este adaptador para poblar automaticamente los campos PICO de un sistema de gestion de revisiones.
- Enrutado de consultas por intencion: la etiqueta de intencion permite dirigir la pregunta a un modulo de tratamiento, diagnostico, seguridad, pronostico o sintesis de evidencia dentro de un pipeline mayor.
- Normalizacion terminologica: la extraccion de entidades y abreviaturas facilita mapear el vocabulario del clinico a vocabularios controlados (MeSH, ICD, terminologias propias) antes de la recuperacion.
- Expansion de consultas multilingue: los terminos en ingles, sinonimos y abreviaturas permiten generar variantes de busqueda para motores que indexan literatura en ingles a partir de una pregunta en japones.
- Prototipado de asistentes de evidencia en investigacion: al ser un adaptador pequeno (0,1 GB) sobre un base de 8B, se puede servir junto con otros adaptadores del mismo proyecto en un unico vLLM mediante --enable-lora, lo que abarata la experimentacion.
- Evaluacion de pipelines de recuperacion: los terminos generados pueden compararse con la expansion propia del modelo base para medir el impacto en metricas como nDCG@10.

## Benchmarks y rendimiento

Evaluacion sobre un conjunto de test retenido de 366 preguntas sinteticas (test_qu), con componentes gold rechazados por una auditoria independiente enmascarados, decodificacion greedy y thinking desactivado. Intervalos de confianza del 95 % obtenidos por bootstrap pareado agrupado.

| Modelo | QU composite | Intent macro-F1 | PICO field accuracy | Entity F1 | Hallucinated-field rate |
|---|---|---|---|---|---|
| Qwen3-8B (base, mismo prompt) | 0,709 | 0,637 | 0,813 | 0,677 | 0,325 |
| Qwen3-Swallow-8B-RL-v0.2 | 0,730 | 0,667 | 0,868 | 0,655 | 0,095 |
| gpt-6.1-sol (referencia OpenAI) | 0,845 | 0,880 | 0,937 | 0,718 | 0,038 |
| Este adaptador | 0,853 | 0,851 | 0,939 | 0,768 | 0,033 |

Frente al modelo base, el compuesto mejora +0,144 (IC 95 % +0,118 a +0,173), y la ganancia se mantiene en preguntas redactadas por un generador distinto (+0,147). Frente a gpt-6.1-sol, la diferencia es +0,008 (IC −0,018 a +0,033), sin diferencia detectable, aunque el autor advierte que no es una prueba formal de equivalencia. En un analisis exploratorio, los terminos de expansion del adaptador usados para recuperacion resultaron ligeramente peores que la expansion propia del modelo base (nDCG@10 −0,008), aunque mejores que la pregunta sin expandir (+0,021).

## Requisitos de hardware

- VRAM estimada para inferencia: depende del modelo base. En bf16, Qwen3-8B requiere aproximadamente 16 GB de VRAM para los pesos, mas overhead de activaciones y KV cache; el adaptador anade una cantidad marginal.
- En cuantizacion de 8 bits, el base se situa en torno a 8-9 GB; en 4 bits, en torno a 5-6 GB (estimaciones para el base, no verificadas en la informacion proporcionada).
- GPU recomendadas: A100, H100 o L40S para servicio concurrente en bf16; NVIDIA DGX Spark (GB10) fue el hardware de entrenamiento. Una RTX 4090 (24 GB) es suficiente para inferencia en bf16 de un unico usuario.
- Cabe en GPU consumer: si, en RTX 4090 y en tarjetas de 16 GB o mas en bf16; en 4 bits cabe en GPUs de 8 GB.
- Opciones de despliegue: Transformers + PEFT (AutoPeftModelForCausalLM o PeftModel), y vLLM con servidor compatible con OpenAI usando --enable-lora --max-lora-rank 16 y --lora-modules. Tambien es viable llama.cpp u Ollama si se fusiona el adaptador con el base y se convierte a GGUF, aunque ese flujo no se documenta en la informacion disponible.
- Latencia y throughput: no disponible. La generacion usa max_new_tokens=1536 y decodificacion greedy, lo que implica respuestas de longitud moderada y coste proporcional.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | QU composite | PICO accuracy | Entity F1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Este adaptador (sobre Qwen3-8B) | 8B + LoRA r16 | no disponible | 0,853 | 0,939 | 0,768 | apache-2.0 | Hugging Face (adaptador) |
| Qwen3-8B (base) | 8B | no disponible | 0,709 | 0,813 | 0,677 | apache-2.0 | Hugging Face |
| Qwen3-Swallow-8B-RL-v0.2 | 8B | no disponible | 0,730 | 0,868 | 0,655 | no disponible | Hugging Face |
| gpt-6.1-sol (OpenAI) | no disponible | no disponible | 0,845 | 0,937 | 0,718 | propietaria | API comercial |

La comparativa se limita a la tarea de comprension de preguntas (QU) definida por el autor; no hay datos de benchmarks generales (MMLU, HumanEval, GSM8K) para el adaptador en la informacion disponible.

## Limitaciones y advertencias

- Prueba de concepto de investigacion: no validada clinicamente, sin revision por parte de un facultativo y no apta para decisiones sobre pacientes individuales.
- Entrenado y evaluado exclusivamente con preguntas sinteticas; el rendimiento en preguntas reales de clinicos no esta medido.
- Riesgo de alucinacion: el adaptador reduce la tasa de campos inventados al 3,3 % en el test, pero no la elimina; los campos PICO y las entidades pueden contener terminos no presentes en la pregunta.
- Dependencia estricta del prompt: solo reproduce los resultados con el system prompt y la plantilla de usuario exactos en japones; otros prompts degradan la salida.
- Dependencia de la revision del base: entrenado contra el commit b968826d9c46dd6066d109eabc6255188de91218 de Qwen/Qwen3-8B; usar otra revision puede alterar el comportamiento.
- Cobertura linguistica limitada al japones de entrada; no se ha evaluado en otros idiomas.
- La expansion de terminos para recuperacion no supera a la del modelo base en nDCG@10 (−0,008), por lo que su uso como generador de queries en produccion debe validarse con metricas propias.
- Licencia apache-2.0 en el adaptador, sujeta ademas a los terminos del modelo base Qwen3-8B; conviene revisar ambas antes de un uso comercial.
- No soporta tool calling, agentes ni modo thinking; cualquier pipeline que dependa de razonamiento multi-paso debe construirse externamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hiimivantang/medgen-ja-qwen3-8b-question-understanding-lora
- Modelo base Qwen/Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Revision del base usada en entrenamiento: https://huggingface.co/Qwen/Qwen3-8B/tree/b968826d9c46dd6066d109eabc6255188de91218
- PEFT: https://github.com/huggingface/peft
- LLaMA-Factory: https://github.com/hiyouga/LLaMA-Factory
- vLLM (servicio LoRA): https://docs.vllm.ai/en/latest/features/lora.html
- Europe PMC (fuente de los resumenes de entrenamiento): https://europepmc.org/
- No se han encontrado en la informacion proporcionada papers, blogs ni demos adicionales del autor.
