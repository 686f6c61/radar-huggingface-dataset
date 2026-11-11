# inboxpraveen/getix-cp-qwen2.5-0.5b-3.1.0

## Resumen

getix-cp-qwen2.5-0.5b-3.1.0 es un ajuste fino mediante LoRA sobre Qwen2.5-0.5B, publicado por el usuario inboxpraveen en Hugging Face. Se trata de la version 3.1.0 de una serie de iteraciones (la model card menciona que continua desde la 3.0.0) entrenada sobre un dataset interno denominado `ds5`, dentro de una ejecucion de entrenamiento identificada como `m3_lora_v3`. El modelo esta orientado a un caso de uso muy concreto: la generacion de respuestas conversacionales en un servicio de atencion (probablemente call center o asistencia por chat), con un formato de prompt especifico (`student_prompt_v2`) y una restriccion explicita de no incluir etiquetas como `Agent:` o `Customer:` en la entrada.

Con 494.032.768 parametros reales (segun los pesos en safetensors) y un repositorio de 4,2 GB, el modelo se distribuye en varios formatos: pesos fusionados en bf16 y fp16 para vLLM, cuantizaciones GGUF (Q8_0, Q6_K y BF16) para llama.cpp, y el adaptador LoRA original para continuar el entrenamiento. La model card indica que la version 3.1.0 es un candidato en entorno UAT (User Acceptance Testing), no en produccion: supera a la 3.0.0 en pruebas a nivel de pregunta, pero en la prueba de servicio de 45 llamadas obtuvo 888 de 933 filas correctas frente a 909 de la 3.0.0, por lo que produccion sigue en la version anterior hasta que 3.1.0 pase UAT.

La relevancia de este modelo es limitada fuera de su nicho: no es un modelo generalista, sino un artefacto de ajuste fino para un pipeline concreto. No se dispone de informacion sobre licencia, idiomas soportados ni pipeline en la ficha de Hugging Face, y no se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base: Qwen2.5-0.5B), ajuste fino con LoRA |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, fp16, GGUF Q8_0, GGUF Q6_K, GGUF BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (merged-bf16, merged-fp16, adapter), GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B, un transformer decoder-only de aproximadamente 0,5 mil millones de parametros, y se ajusta mediante LoRA (Low-Rank Adaptation). La model card indica que la version 3.1.0 corresponde a la ejecucion `m3_lora_v3`, continuacion de la version 3.0.0 sobre el dataset `ds5`. No se especifica el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. La model card aclara que se distribuyen solo pesos ("weights only: no transcripts or answers from calls"), es decir, no se incluyen transcripciones ni respuestas de llamadas reales.

El repositorio incluye artefactos de trazabilidad: `training-record/` con la configuracion de entrenamiento, hashes de codigo y numeros por paso; `SHA256SUMS.txt` para verificar la integridad de los ficheros; y `student_prompt.py`, que define el formato de prompt y respuesta (`student_prompt_v2`) con el que fue entrenado. La model card insiste en que la copia del prompt en el servicio debe ser exactamente ese mismo fichero. Tambien se indica que todas las metricas de precision se midieron sobre los pesos en `merged-bf16/`, y que vLLM 0.8.5.post1 coincidio con transformers en 1.871 de 1.877 decisiones. Para llama.cpp, la cuantizacion Q8_0 coincidio con bf16 en las 286 decisiones sobre 300 filas, y Q6_K en 284 de 286. No se describe ninguna innovacion arquitectonica adicional (atencion lineal, decodificacion especulativa, etc.).

## Capacidades

- Generacion de texto conversacional en el dominio de atencion al cliente, con formato de prompt especifico (`student_prompt_v2`).
- Clasificacion o etiquetado de llamadas por tipo ("call type"), segun se desprende de la prueba de servicio de 45 llamadas.
- Respuestas a nivel de pregunta dentro de una conversacion (la model card menciona "question-level test").
- Inferencia determinista recomendada: la model card exige enviar `temperature: 0`.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y con vLLM y llama.cpp.
- Ajuste fino adicional a partir del adaptador LoRA incluido en `adapter/`.
- No se documentan capacidades de tool calling, agentes, vision, audio, modo thinking ni multilingues.

## Casos de uso

- Atencion al cliente automatizada en un servicio de llamadas o chat: el modelo esta entrenado especificamente para el formato de prompt del servicio y para responder preguntas dentro de una conversacion, con temperatura 0 para maximizar la consistencia.
- Clasificacion de llamadas por tipo: la prueba de servicio de 45 llamadas evalua filas por tipo de llamada, lo que sugiere su uso para etiquetar o enrutar interacciones.
- Entorno de validacion UAT: la version 3.1.0 esta pensada para pruebas de aceptacion antes de sustituir a la 3.0.0 en produccion, comparando resultados fila a fila.
- Desarrollo local y prototipado: la cuantizacion GGUF Q8_0 permite ejecutar el modelo en llama.cpp en maquinas sin GPU dedicada, con una coincidencia de 286 de 286 decisiones frente a bf16.
- Base para ajuste fino adicional: el adaptador LoRA en `adapter/` permite continuar el entrenamiento sobre el modelo base indicado en la model card.
- Verificacion de integridad en pipelines: el fichero `SHA256SUMS.txt` permite validar los pesos antes de desplegarlos en produccion.
- Evaluacion comparativa de versiones: los artefactos `training-record/` y `cp_model_card.json` permiten reproducir y auditar las diferencias entre 3.0.0 y 3.1.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card unicamente reporta metricas internas de su prueba de servicio:

| Prueba | 3.1.0 | 3.0.0 |
|---|---|---|
| Prueba de servicio (45 llamadas, filas correctas) | 888 de 933 | 909 de 933 |
| Prueba a nivel de pregunta | Supera a 3.0.0 en todas las preguntas | Referencia |
| Coincidencia vLLM 0.8.5.post1 vs transformers | 1.871 de 1.877 decisiones | no disponible |
| Coincidencia GGUF Q8_0 vs bf16 (llama.cpp) | 286 de 286 decisiones (300 filas) | no disponible |
| Coincidencia GGUF Q6_K vs bf16 (llama.cpp) | 284 de 286 decisiones | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 494 millones de parametros, en bf16 los pesos ocupan aproximadamente 1 GB, y en Q8_0 alrededor de 0,5 GB, mas overhead de KV cache y activaciones.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, cabe en GPUs consumer con suficiente VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 4090), aunque no se confirma en la model card.
- Despliegue con vLLM: recomendado sobre `merged-bf16/` (pesos sobre los que se midieron las metricas); `merged-fp16/` solo si se requiere fp16, no probado en GPU para esta version.
- Despliegue con llama.cpp: recomendado `gguf/...-Q8_0.gguf` para desarrollo local; `Q6_K` si importa el ahorro de tamano; `BF16.gguf` como fuente para otras cuantizaciones con `llama-quantize`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| getix-cp-qwen2.5-0.5b-3.1.0 | 494.032.768 | no disponible | no disponible | Hugging Face (repo propio) | Ajuste LoRA para atencion al cliente; estado candidato UAT |
| Qwen2.5-0.5B (base) | ~0,5 mil millones | no disponible en esta ficha | no disponible en esta ficha | Hugging Face (Qwen) | Modelo base generalista sobre el que se ajusta |
| getix-cp-qwen2.5-0.5b-3.0.0 | mismo tamano base | no disponible | no disponible | Referenciado en la model card | Version anterior en produccion; 909 de 933 filas en prueba de servicio |

No se dispone de informacion suficiente para comparar con otras alternativas de la misma categoria (por ejemplo, otros ajustes finos de Qwen2.5-0.5B para atencion al cliente).

## Limitaciones y advertencias

- Estado candidato: la model card indica explicitamente que 3.1.0 esta en UAT y que produccion sigue en 3.0.0 hasta que pase las pruebas de aceptacion.
- Regresion en la prueba de servicio: 888 de 933 filas frente a 909 de la 3.0.0, casi todas atribuidas al tipo de llamada de una sola llamada.
- Restriccion de prompt: debe usarse exactamente `student_prompt_v2` (fichero `student_prompt.py`); el servicio debe tener la misma copia.
- Temperatura obligatoria: la model card exige `temperature: 0`; no se documenta comportamiento con otras temperaturas.
- Prohibicion de etiquetas: no deben incluirse `Agent:` ni `Customer:` en el prompt.
- Licencia no disponible: no se puede confirmar el uso comercial ni las restricciones de redistribucion.
- Idiomas no disponibles: no se especifica que idiomas cubre el ajuste fino.
- Contexto no disponible: no se indica la longitud maxima de contexto soportada.
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada.
- Dominio estrecho: es un ajuste para un servicio concreto, no un modelo generalista; su uso fuera de ese dominio no esta validado.
- Sin benchmarks publicos: no hay resultados en MMLU, HumanEval, GSM8K ni similares.

## Enlaces

- Hugging Face: https://huggingface.co/inboxpraveen/getix-cp-qwen2.5-0.5b-3.1.0
- Model card del autor (referenciada en la informacion): `cp_model_card.json` y `docs/09-training-runs.md` dentro del repositorio.
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion proporcionada.
