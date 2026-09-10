# Kanha-AI/kanha-minicpm5-1b-grounded-matched-2ep-20260910

## Resumen

Kanha-AI/kanha-minicpm5-1b-grounded-matched-2ep-20260910 es un ajuste fino supervisado del modelo openbmb/MiniCPM5-1B (revision 87179e5c1f455ef22e6223592d2d61351b525bfc) de 1.080.632.832 parametros, entrenado mediante QLoRA sobre un dataset derivado del sitio web kanha.ai. El objetivo del checkpoint no es un asistente generalista, sino un modelo especializado en respuesta anclada a contexto (grounded question answering): el prompt de inferencia obliga a inyectar contexto recuperado y el modelo debe responder unicamente con la informacion presente en ese contexto o emitir la cadena exacta de rechazo "I can't answer that from the provided context.".

El entrenamiento se realizo con 210 registros de entrenamiento y 45 de validacion (conjunto de holdout vacio), dos epocas, longitud maxima de secuencia de 4096 tokens, LoRA de rango 16 sobre las proyecciones q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj y down_proj, y fusion final en bfloat16. La model card lo declara explicitamente como un artefacto de investigacion para comparar metodos de entrenamiento sobre un mismo dataset, no como un modelo listo para produccion.

Su relevancia actual es acotada pero clara: es un ejemplo reproducible de fine-tuning parametro-eficiente sobre un modelo de ~1B orientado a RAG con contrato de inferencia estricto, y publica un conjunto de metricas de comportamiento anclado (recall de fechas, numeros y URLs, tasa de rechazo, tasa de no soportado) junto con la configuracion exacta del run. Los resultados publicados, sin embargo, muestran un comportamiento anclado debil: la puerta de comportamiento anclado no se supera (grounded_behavior_gate_passed: false, tasa de exito 0,0385).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la informacion proporcionada; hereda la del modelo base openbmb/MiniCPM5-1B (el tag `llama` del repo sugiere una arquitectura de decoder transformer causal, sin confirmar) |
| Parametros totales | 1.080.632.832 (dato de safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 4096 tokens (longitud maxima de secuencia usada en el entrenamiento; no se especifica la ventana nativa del modelo base) |
| Tipos de cuantizacion | Pesos publicados en bfloat16 (merged dtype). No se publican artefactos GGUF, AWQ, GPTQ ni cuantizaciones de 8/4 bits |
| Idiomas soportados | en (ingles) unicamente |
| Licencia | No disponible |
| Formato de pesos | safetensors (libreria transformers; tamano de repo 2,2 GB) |

## Arquitectura y entrenamiento

El checkpoint es un fine-tuning QLoRA de un modelo base denso de ~1,08B parametros. La model card no documenta la arquitectura interna del modelo base ni su composicion de datos de preentrenamiento, por lo que no es posible confirmar si se trata de un transformer decoder-only clasico, de una variante con atencion lineal o de un diseno hibrido. Los hiperparametros de ajuste si estan documentados con detalle: LoRA de rango 16 y alpha 16 con dropout 0,05 aplicado a las siete proyecciones habituales (q, k, v, o, gate, up, down), learning rate 1e-4, batch por dispositivo 8, acumulacion de gradiente 2, warmup ratio 0,05, semilla 42, dos epocas completas y perdida calculada unicamente sobre los turnos del asistente (assistant-only loss). El resultado se fusiono y publico en bfloat16.

La innovacion tecnica del run no esta en la arquitectura sino en el contrato de inferencia y en la metodologia de evaluacion. El prompt de sistema es literal: "Answer only from the supplied context. Be concise. If the answer is absent from the context, respond exactly: I can't answer that from the provided context.", y la plantilla de usuario separa explicitamente bloques "Context:" y "Question:". El chat template nativo se usa con thinking desactivado (`enable_thinking=False`). La evaluacion se hizo con contexto de origen oraculo (oracle source context), es decir, sin medir la calidad de recuperacion, y se acompanan hashes del dataset, de los splits y del contrato de prompt para permitir reproducibilidad. No se documento ninguna fase de RLHF ni de DPO.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation) con soporte del chat template nativo del modelo base.
- Respuesta a preguntas ancladas a un contexto recuperado, con rechazo explicito cuando la respuesta no figura en el contexto (tasa de rechazo medida: 0,1538).
- Extraccion fiel de valores concretos del contexto: recall de fechas 1,0, recall de numeros 0,9795 (49/50 aproximadamente) y recall de URLs 1,0.
- Generacion de listas a partir del contexto, con rendimiento notablemente inferior (list_recall 0,5391).
- Modo de no razonamiento forzado: la plantilla se invoca con `enable_thinking=False`, de modo que el modelo no emite trazas de pensamiento.
- No hay evidencia de soporte de tool calling ni function calling en la informacion disponible.
- No hay evidencia de capacidades de agente, razonamiento multi-paso autonomo, vision, audio ni otras modalidades.
- Capacidad multilingue: limitada a ingles (language: en). No se documenta entrenamiento ni evaluacion en otros idiomas.
- Capacidades especiales: contrato de grounding con cadena de rechazo fija, util para construir pipelines RAG con comportamiento de abstención controlado.

## Casos de uso

- Investigacion comparativa de metodos de entrenamiento: el run publica hashes de dataset, configuracion de entrenamiento y metricas, por lo que permite replicar el mismo ajuste QLoRA sobre el mismo split y compararlo con otras tecnicas (LoRA a distinto rango, SFT completo, DPO) sobre una base identica.
- Evaluacion controlada de QA sobre sitio web: el caso de uso declarado por el autor es la evaluacion de respuesta a preguntas sobre contenido derivado de un sitio web con contexto oraculo, util como banco de pruebas de pipelines de grounding antes de invertir en un modelo mayor.
- Prototipado de asistentes RAG en ingles: con 1,08B parametros y 2,2 GB de pesos, se puede desplegar en una GPU de consumo para validar el contrato de prompt (contexto + pregunta + rechazo) antes de migrar a un modelo mayor.
- Filtrado de respuestas no soportadas: gracias a la cadena de rechazo deterministica y a una tasa de valores no soportados del 3,85%, puede usarse como componente de bajo coste para descartar preguntas cuya respuesta no aparece en el contexto recuperado.
- Extraccion de campos concretos (fechas, cifras, URLs) de documentacion: con recall de numeros de 0,9795 y de fechas y URLs de 1,0 en el conjunto evaluado, encaja en tareas de extraccion puntual sobre texto de referencia, siempre con revision humana.
- Educacion e investigacion en tecnicas PEFT: el checkpoint sirve como ejemplo didactico completo de QLoRA con assistant-only loss, incluyendo configuracion YAML, manifiesto de run y metricas de evaluacion.
- Pruebas de cuantizacion y despliegue en el borde: al tratarse de un modelo de ~1B, es un candidato razonable para experimentar con conversion a GGUF o cuantizacion INT8/INT4 en hardware limitado, aunque el autor advierte que no hay artefacto MLC validado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Lo que si se publica es un conjunto de metricas de evaluacion propias del pipeline de grounding, con contexto de origen oraculo (no se evaluo la calidad de recuperacion):

| Metrica | Valor |
|---|---|
| dates_recall | 1,0 |
| urls_recall | 1,0 |
| numbers_recall | 0,9795 |
| list_recall | 0,5391 |
| refusal_rate | 0,1538 |
| unsupported_value_rate | 0,0385 |
| requires_review_rate | 0,0 |
| deterministic_pass_rate | 0,3846 |
| grounded_behavior_pass_rate | 0,0385 |
| grounded_behavior_gate_passed | false |
| grounded_semantic_review_gate_passed | false |
| grounded_source_supported_count | 0 |
| grounded_reviewed_case_count | 0 |
| grounded_answerable_case_count | 24 |
| grounded_behavior_case_count | 26 |
| total | 26 |

No se dispone de comparacion con otros checkpoints bajo el mismo protocolo de evaluacion en la informacion proporcionada.

## Requisitos de hardware

- VRAM para los pesos: aproximadamente 2,16 GB en bfloat16 (1.080.632.832 parametros x 2 bytes). La model card no publica versiones cuantizadas, por lo que no hay cifras oficiales para INT8 o INT4.
- VRAM adicional: hay que sumar la cache KV para una ventana de hasta 4096 tokens y el overhead del runtime. No se publican cifras de consumo medido ni de memoria pico.
- GPU recomendadas: cualquier GPU con 6 GB o mas puede alojar los pesos en bf16, incluidas RTX 3060, RTX 4060, RTX 4090 y GPUs de centro de datos como A100 o H100 (sobradamente dimensionadas para este tamano). Cabe en GPU de consumo.
- Despliegue: transformers (libreria declarada), text-generation-inference (el repo incluye los tags `text-generation-inference` y `endpoints_compatible`), y vLLM como alternativa habitual para este formato safetensors. Para llama.cpp u Ollama seria necesaria una conversion a GGUF que no se publica.
- Latencia y throughput: no disponible. No se publican medidas de tokens por segundo ni de latencia; tampoco hay artefacto MLC validado para despliegue en navegador, y el autor advierte que la evaluacion deterministica en servidor no equivale a una cualificacion en navegador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| kanha-minicpm5-1b-grounded-matched-2ep-20260910 | 1.080.632.832 | 4096 (entrenamiento) | No disponible | HuggingFace, safetensors bf16 | Fine-tuning QLoRA para QA anclado en ingles; sin benchmarks estandar |
| openbmb/MiniCPM5-1B (modelo base) | No disponible | No disponible | No disponible | HuggingFace | Base del ajuste; specs no incluidas en la informacion proporcionada |
| Llama 3.2 1B | ~1,24B | 128k | Llama 3.2 Community License | HuggingFace, multitud de cuantizaciones | Datos externos a la informacion proporcionada; verificar en la model card oficial |
| Qwen2.5 1.5B | ~1,54B | 32k | Apache-2.0 | HuggingFace, GGUF oficiales | Datos externos a la informacion proporcionada; verificar en la model card oficial |

Las filas de Llama 3.2 1B y Qwen2.5 1.5B se incluyen como referencia de categoria (modelos densos de ~1-1,5B para texto), pero sus cifras no proceden de la informacion proporcionada en esta busqueda y deben contrastarse en sus fichas oficiales. No hay datos que permitan comparar rendimiento entre estos modelos y el checkpoint de Kanha-AI bajo un mismo protocolo.

## Limitaciones y advertencias

- Comportamiento anclado debil: la puerta de comportamiento anclado no se supera (`grounded_behavior_gate_passed: false`) con una tasa de exito de 0,0385, y `grounded_source_supported_count` es 0 sobre 26 casos. La evaluacion semantica revisada tampoco se supero y `grounded_reviewed_case_count` es 0.
- Tasa de exito deterministica de solo 0,3846, lo que indica que una parte mayoritaria de los casos no produce la salida esperada de forma deterministica.
- Riesgo de alucinacion y de memorizacion: la propia model card advierte de que el checkpoint puede producir respuestas incorrectas, incompletas u obsoletas y que puede memorizar contenido de entrenamiento.
- Dependencia estricta del contexto recuperado: una pregunta sin contexto es "fuera del contrato" entrenado y evaluado. El modelo no esta disenado para responder de conocimiento propio.
- Volumen de datos muy reducido: 210 registros de entrenamiento, 45 de validacion y 0 de holdout, con dos epocas. El riesgo de sobreajuste y de generalizacion pobre es alto.
- Rendimiento desigual por tipo de dato: el recall de listas es 0,5391 frente a 1,0 en fechas y URLs; la extraccion de listas es un punto fragil claro.
- Idioma: solo ingles. No hay soporte documentado de castellano ni de otros idiomas.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido. Hay que contactar con el autor o consultar la licencia del modelo base antes de cualquier uso en produccion.
- Contrato de prompt fragil: el sistema depende de una cadena de rechazo literal y de una plantilla exacta; cualquier cambio de formato puede degradar el comportamiento.
- Sin artefacto MLC validado y sin cuantizaciones publicadas, lo que limita el despliegue en navegador o en entornos muy restringidos.
- Riesgo de obsolescencia: el dataset deriva de un sitio web, por lo que el conocimiento reflejado puede quedar desactualizado.
- Advertencia explicita del autor: revisar salidas, probar casos de fallo representativos y cualificar el runtime exacto antes de cualquier uso orientado al usuario.

## Enlaces

- Ficha en HuggingFace: https://huggingface.co/Kanha-AI/kanha-minicpm5-1b-grounded-matched-2ep-20260910
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-1B
- Sitio del autor: https://kanha.ai
- Artefactos de procedencia citados en la model card (dentro del repositorio): `research/run-manifest.json`, `research/training-config.yaml`, `research/publication-inventory.json`, `research/evaluation/metrics.json`, `research/evaluation/evaluation-manifest.json`
- Resultados de la busqueda web: no se ha encontrado ningun enlace relevante sobre este modelo. Las unicas URL devueltas corresponden a hilos de un foro italiano sobre incidencias del servicio de correo Libero Mail, sin relacion alguna con el modelo.
