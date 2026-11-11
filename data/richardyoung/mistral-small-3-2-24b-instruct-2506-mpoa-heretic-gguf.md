# richardyoung/Mistral-Small-3.2-24B-Instruct-2506-MPOA-heretic-GGUF

## Resumen

Mistral-Small-3.2-24B-Instruct-2506-MPOA-heretic-GGUF es la distribucion en formato GGUF de una variante "abliterated" (con las respuestas de rechazo eliminadas) del modelo Mistral-Small-3.2-24B-Instruct-2506 de Mistral AI. La ablacion se realizo con Heretic 2.0 aplicando MPOA (projected, magnitude-preserving abliteration), el metodo por defecto de Heretic, y el autor es Richard J. Young, que utiliza el modelo como caso de estudio en un articulo sobre la dificultad creciente de la ablacion en modelos de pesos abiertos.

El modelo base es un transformer denso de 23.572.403.200 parametros (unos 23,6 mil millones) con capacidad multimodal texto-imagen en su version original. Esta publicacion GGUF, sin embargo, es exclusivamente de texto: no incluye el proyector de vision. El interes practico esta en el contraste medido de comportamiento: sobre 972 prompts daninos reservados, el modelo original rechazaba el 73,6 % y esta variante solo el 4,0 % (39 de 972), con una divergencia KL de primer token de 0,094 respecto al original.

La relevancia es doble. Por un lado, ofrece a investigadores en seguridad de IA un artefacto reproducible para estudiar la eliminacion de rechazos, su medicion y las defensas frente a ella. Por otro, la publicacion incluye cuantizaciones con matriz de importancia (imatrix) generadas con llama.cpp, lo que permite ejecutar un modelo de ~24B en hardware de consumo. No es, segun el propio autor, un asistente de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (arquitectura de Mistral Small 3.2; sin detalles adicionales en la informacion disponible) |
| Parametros totales | 23.572.403.200 (23,6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q4_K_M (14,3 GB), Q8_0 (25,1 GB); anunciadas IQ3_M, IQ4_XS, Q5_K_M y Q6_K; matriz de importancia `imatrix.gguf` (20 MB) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base del que deriva se publica en safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base mas alla de su naturaleza transformer densa con 23,6B de parametros y soporte multimodal texto-imagen en el original. Lo que si esta documentado es el proceso de ablacion: se aplico Heretic 2.0 con MPOA sobre los pesos safetensors de `richardyoung/Mistral-Small-3.2-24B-Instruct-2506-MPOA-heretic` (revision `358b66cae858`, verificada por SHA-256). La seleccion del trial se hizo con una regla explicita: minimizar los rechazos por palabra clave en el conjunto de desarrollo (100 prompts de ajuste) sujeto a una divergencia KL de primer token respecto al original menor o igual a 0,1, sobre una busqueda de 100 trials. El trial elegido produjo 13 rechazos por palabra clave en los 100 prompts de ajuste y una KL de 0,094.

La conversion a GGUF se realizo con llama.cpp (commit `468fde9`): `convert_hf_to_gguf.py --outtype bf16` seguido de `llama-quantize`, ejecutado en CPU. Las cuantizaciones IQ3_M, IQ4_XS, Q4_K_M y Q5_K_M emplean la matriz de importancia calculada sobre el build Q8_0 con `calibration_datav3` (128 fragmentos de 512 tokens); Q6_K y Q8_0 son estaticas. No se documenta en la informacion disponible el volumen de tokens de preentrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generacion de texto conversacional en ingles, heredada de Mistral-Small-3.2-24B-Instruct-2506.
- Razonamiento e instrucciones generales del modelo base, con el comportamiento de rechazo sustancialmente reducido (4,0 % de rechazos frente a 73,6 % del original en el conjunto de evaluacion).
- Capacidad multimodal texto-imagen del modelo base no disponible en esta publicacion: el proyector de vision no esta incluido.
- Soporte de tool calling y function calling: no documentado en la informacion proporcionada para esta variante.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion proporcionada.
- Capacidades multilingues: la model card declara unicamente `en`; no se documentan otros idiomas.
- Modo thinking, vision o audio: no disponible en esta publicacion (solo texto).

## Casos de uso

- Investigacion sobre ablacion y eliminacion de rechazos: el modelo sirve como artefacto de referencia para replicar el experimento del articulo de Young, comparando tasas de rechazo y divergencia KL entre el original y la variante ablacionada con las mismas metricas (WildGuard como juez, 972 prompts reservados).
- Evaluacion de defensas frente a ataques de eliminacion de alineamiento: permite a equipos de seguridad medir si sus filtros, clasificadores o guardrails detectan respuestas que el modelo original habria rechazado, usando la diferencia de comportamiento como senal de prueba.
- Estudio de sensibilidad a la cuantizacion: al publicarse Q4_K_M y Q8_0 junto a la matriz de importancia, se puede analizar si la cuantizacion altera la tasa de rechazos, una advertencia explicita del autor que no fue evaluada en el articulo.
- Despliegue local en hardware de consumo para experimentacion: el archivo Q4_K_M de 14,3 GB cabe en GPUs consumer de 16 GB o mas y se ejecuta con Ollama o llama.cpp mediante los comandos documentados en la model card.
- Analisis de calibracion de cuantizaciones con imatrix: los investigadores pueden comparar los builds con imatrix (IQ3_M, IQ4_XS, Q4_K_M, Q5_K_M) frente a los estaticos (Q6_K, Q8_0) para estudiar el impacto de la calibracion en modelos ablacionados.
- Docencia y divulgacion sobre alineamiento: el contraste cuantificado (73,6 % frente a 4,0 % de rechazos con solo 0,094 de KL) es un ejemplo concreto y reproducible para explicar que la eliminacion de rechazos puede lograrse con una perturbacion minima de la distribucion de salida.

## Benchmarks y rendimiento

Los unicos datos publicados corresponden al modelo en precision completa (bf16) y describen comportamiento de rechazo, no rendimiento en tareas estandar:

| Metrica | Original | Este modelo (bf16) |
|---|---|---|
| Rechazos en 972 prompts daninos reservados (juez WildGuard) | 73,6 % | 4,0 % (39/972) |
| Rechazos por palabra clave en los 100 prompts de ajuste (trial seleccionado) | no disponible | 13 |
| Divergencia KL de primer token respecto al original (trial seleccionado) | no disponible | 0,094 |

No se han publicado resultados de benchmarks en la informacion disponible para MMLU, HumanEval, GSM8K ni otras tareas estandar. Los archivos cuantizados de este repositorio no fueron evaluados en el articulo y, segun el autor, la cuantizacion puede alterar el comportamiento de rechazo.

## Requisitos de hardware

- VRAM estimada para Q4_K_M (14,3 GB de pesos): en torno a 16 GB o mas para inferencia comoda con contexto amplio; margen adicional para la cache KV.
- VRAM estimada para Q8_0 (25,1 GB de pesos): 28-32 GB o mas, lo que exige GPU de datacenter o configuraciones multi-GPU.
- GPU recomendadas: no especificadas en la informacion proporcionada. Por tamano, Q4_K_M es apto para RTX 4090 (24 GB), RTX 4080 (16 GB) con contexto limitado, y GPUs profesionales tipo A100 o H100 para Q8_0.
- Cabe en GPU consumer: si, Q4_K_M en tarjetas de 16 GB o mas; Q8_0 no en consumer de una sola tarjeta.
- Opciones de despliegue: llama.cpp (`llama-cli -hf ...:Q4_K_M`) y Ollama (`ollama run richardyoung/mistral-small-3.2-24b-instruct-2506-mpoa-heretic`, con tags por tamano como `:Q8_0`); el repositorio esta marcado como compatible con endpoints.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazos (972 prompts) | Licencia | Formato |
|---|---|---|---|---|---|
| Este modelo (MPOA-heretic, bf16) | 23,6B | no disponible | 4,0 % | apache-2.0 | GGUF, safetensors (base) |
| mistralai/Mistral-Small-3.2-24B-Instruct-2506 (original) | 23,6B | no disponible | 73,6 % | apache-2.0 | safetensors, GGUF de terceros |
| richardyoung/Mistral-Small-3.2-24B-Instruct-2506-MPOA-heretic (sin cuantizar) | 23,6B | no disponible | 4,0 % | apache-2.0 | safetensors |
| Otras variantes ablacionadas del articulo (Qwen3.8, Gemma 4, Olmo 3.1) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al linaje directo del modelo, ya que la informacion proporcionada no incluye datos de rendimiento que permitan contrastarlo con alternativas de la misma categoria en tareas estandar.

## Limitaciones y advertencias

- Modelo ablacionado: elimina deliberadamente el comportamiento de rechazo. Cumple muchas peticiones que el original rechaza, lo que lo hace inadecuado como asistente de proposito general y exige controles adicionales en cualquier despliegue.
- Uso previsto restringido: el autor lo publica para investigacion sobre eliminacion de rechazos, su medicion y las defensas frente a ella; los usuarios son responsables del uso licito.
- Las metricas de rechazo (4,0 %) corresponden al modelo en bf16; los archivos GGUF de este repositorio no fueron evaluados y la cuantizacion puede cambiar el comportamiento. No debe asumirse que las cifras se mantienen en Q4_K_M o Q8_0.
- Solo texto: el proyector de vision del modelo base no esta incluido, por lo que no procesa imagenes.
- Idioma: la model card declara unicamente ingles; el rendimiento en castellano u otros idiomas no esta documentado.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; se hereda el del modelo base, sin datos publicados al respecto.
- Sesgos: no documentados en la informacion proporcionada; la eliminacion de rechazos puede exponer y amplificar sesgos del modelo original.
- Licencia apache-2.0, pero sujeta a las mismas restricciones de uso que el modelo fuente; conviene revisar la model card del modelo base antes de un uso comercial.
- Longitud de contexto no disponible en la informacion proporcionada, lo que impide planificar despliegues con ventanas largas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion externa de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/richardyoung/Mistral-Small-3.2-24B-Instruct-2506-MPOA-heretic-GGUF
- Modelo base sin cuantizar (ablacionado): https://huggingface.co/richardyoung/Mistral-Small-3.2-24B-Instruct-2506-MPOA-heretic
- Modelo original de Mistral AI: https://huggingface.co/mistralai/Mistral-Small-3.2-24B-Instruct-2506
- Articulo de referencia: Richard J. Young, "Is Abliteration Getting Harder? Refusal Removal from Open-Weight LLMs with Heretic on Qwen3.8, Gemma 4, Olmo 3.1 and Mistral Small 3.2 Versus Their Predecessors" (enlace arXiv pendiente de publicacion)
- Heretic: no se proporciona enlace en la informacion disponible
- llama.cpp: no se proporciona enlace en la informacion disponible
