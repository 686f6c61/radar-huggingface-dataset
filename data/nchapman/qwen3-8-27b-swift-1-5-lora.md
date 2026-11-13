# nchapman/Qwen3.8-27B-Swift-1.5-LoRA

## Resumen

Qwen3.8-27B-Swift-1.5-LoRA es un adaptador PEFT LoRA de rango 64, en BF16, publicado por el usuario nchapman. No se trata de un modelo completo, sino de un delta de pesos que reproduce, sobre el modelo base oficial Qwen/Qwen3.8-27B, las mejoras de post-entrenamiento del modelo ukisai/Swift-1.5-Qwen3.8-27b. El objetivo es permitir que cualquiera aplique esas mejoras de razonamiento y eficiencia de tokens sobre el checkpoint base original, o sobre cualquier version cuantizada compatible con vLLM o transformers, sin necesidad de redistribuir los pesos completos.

El adaptador se construye mediante una descomposicion SVD de rango 64 de la diferencia de pesos entre Swift-1.5 y Qwen3.8-27B en las 400 proyecciones lineales del modelo de lenguaje. Segun el autor, esta reconstruccion recupera la actualizacion completa hasta el limite de redondeo BF16 (entre el 93,3 % y el 95,7 % de los pesos dentro de una ULP de BF16). El repositorio ocupa 0,9 GB y contiene unicamente el fichero adapter_model.safetensors junto con la plantilla de chat.

La relevancia actual del adaptador radica en su naturaleza apilable: puede combinarse con otros LoRA en vLLM, aplicarse sobre checkpoints cuantizados y servir como mecanismo ligero de distribucion de mejoras de post-entrenamiento. El pipeline declarado es image-text-to-text, lo que sugiere que el modelo base incorpora torre visual, aunque el adaptador no modifica esa parte del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer multimodal Qwen3.8-27B |
| Parametros totales | No disponible (el adaptador ocupa 0,9 GB; el modelo base Qwen3.8-27B tiene 27 000 millones nominales) |
| Parametros activos | No disponible (no consta que el modelo base sea MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | El adaptador se distribuye en BF16; se indica compatibilidad con checkpoints cuantizados en vLLM y transformers, sin detallar formatos |
| Idiomas soportados | No disponible |
| Licencia | Swift Open License 1.0 (licencia del modelo fuente Swift-1.5); el modelo base Qwen3.8-27B es Apache-2.0 |
| Formato de pesos | safetensors (adapter_model.safetensors), libreria peft |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 64 generado por descomposicion SVD de la diferencia de pesos entre ukisai/Swift-1.5-Qwen3.8-27b y Qwen/Qwen3.8-27B. Segun la model card, el post-entrenamiento original de Swift-1.5 utilizo actualizaciones de bajo rango (r aproximado entre 32 y 40) concentradas en las proyecciones de atencion y MLP, dejando intactos la torre visual (model.visual.*), el modulo MTP (mtp.*) y las capas de normalizacion. La descomposicion se aplico a las 400 proyecciones lineales del modelo de lenguaje: 64 de self_attn (q_proj, k_proj, v_proj, o_proj), 192 de MLP (gate_proj, up_proj, down_proj) y 144 de linear_attn (in_proj_qkv, in_proj_z, out_proj).

La energia espectral capturada por la SVD de rango 64 fue del 85,96 % en self_attn, 87,97 % en MLP y 14,12 % en linear_attn, con errores relativos medios de Frobenius de 0,000960, 0,001107 y 0,000376 respectivamente. El autor no documenta el volumen de tokens, la composicion del dataset ni si hubo RLHF o DPO en el post-entrenamiento original; solo menciona que Swift-1.5 aporta mejoras de razonamiento y eficiencia de tokens. La innovacion tecnica destacable es precisamente el enfoque de destilacion por SVD que permite distribuir el delta como adaptador apilable en lugar de pesos completos.

## Capacidades

- Generacion de texto conversacional sobre el modelo base Qwen3.8-27B, con la plantilla de chat propia de Swift-1.5 incluida en el repositorio (chat_template.jinja).
- Razonamiento con modo de pensamiento (thinking): la model card evalua tokens generados antes del cierre `</think>`, lo que confirma soporte de cadenas de razonamiento explicitas.
- Eficiencia de tokens: el adaptador esta orientado a reducir el consumo de tokens de pensamiento, segun las etiquetas efficient-thinking y token-efficient.
- Procesamiento image-text-to-text: heredado del modelo base multimodal, aunque el adaptador no modifica la torre visual.
- Codigo y matematicas: la evaluacion del autor incluye tareas de coding, math y reasoning entre los prompts de verificacion.
- Apilamiento con otros LoRA en vLLM (stackable LoRA), lo que permite combinar capacidades en un mismo servidor.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no documentado explicitamente, aunque el modo thinking es compatible con razonamiento en varios pasos.

## Casos de uso

- Servicio de inferencia con vLLM apilando varios LoRA: el adaptador puede cargarse junto a otros adaptadores en un mismo servidor mediante `--enable-lora --max-lora-rank 64`, lo que permite servir variantes especializadas sobre un unico modelo base y ahorrar VRAM frente a desplegar checkpoints completos.
- Razonamiento con presupuesto de tokens ajustado: al estar orientado a eficiencia de tokens, encaja en pipelines donde el coste por token de pensamiento es critico, como agentes que encadenan muchas llamadas o sistemas con latencia estricta.
- Aplicacion sobre checkpoints cuantizados: el adaptador puede montarse sobre versiones cuantizadas de Qwen3.8-27B en transformers o vLLM, lo que facilita desplegar las mejoras de Swift-1.5 en hardware con VRAM limitada.
- Evaluacion y comparacion de post-entrenamientos: investigadores pueden aplicar el adaptador sobre el base y medir la divergencia KL y la coincidencia top-1 frente a Swift-1.5, usando las metricas publicadas como referencia para validar sus propios pipelines.
- Tareas multimodales image-text-to-text: heredando la torre visual del base, el adaptador sirve para flujos de descripcion de imagenes y dialogos sobre contenido visual con el estilo de razonamiento de Swift-1.5.
- Fine-tuning adicional sobre el adaptador: al ser un LoRA PEFT estandar, puede combinarse o continuarse con otros adaptadores en flujos de personalizacion sin tocar los pesos base.
- Despliegue ligero en transformers: con `PeftModel.from_pretrained` sobre el base en BF16, sirve para prototipado e integracion en notebooks o scripts de investigacion con `device_map="auto"`.

## Benchmarks y rendimiento

La model card no publica benchmarks clasicos (MMLU, HumanEval, GSM8K), sino metricas de fidelidad del adaptador frente al modelo fuente Swift-1.5, medidas en bfloat16 sobre una NVIDIA H100 NVL con 64 prompts (56 de mlabonne/harmless_alpaca test[:56] mas 8 tareas de coding, math y reasoning) y 2560 tokens de trayectoria forzados por profesor.

| Metrica | Base Qwen3.8-27B | Base + Swift-1.5-LoRA (r=64) | Objetivo Swift-1.5 |
|---|---:|---:|---:|
| Divergencia KL de trayectoria (2560 tokens) | 0,02092 nats | 0,00294 nats (7,1x menor) | 0,00000 nats |
| Coincidencia top-1 de trayectoria | 95,70 % | 98,28 % | 100,00 % |
| Divergencia KL de prefill (64 prompts) | 0,05325 nats | 0,00571 nats (9,3x menor) | 0,00000 nats |
| Coincidencia top-1 de prefill | 98,44 % | 100,00 % | 100,00 % |
| Similitud coseno de logits | 0,994361 | 0,998850 | 1,000000 |
| Tokens de pensamiento medios antes de `</think>` (max_new_tokens=320) | 317,0 | 320,0 | 320,0 |

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador por si solo; depende del checkpoint base Qwen3.8-27B. En BF16, un modelo de 27 000 millones de parametros requiere aproximadamente 54 GB solo para pesos, mas overhead de activaciones y cache KV.
- GPU recomendadas: la model card cita una NVIDIA H100 NVL para las mediciones. Para servir el base en BF16 se recomienda H100, A100 80 GB o equivalentes con 80 GB de VRAM.
- Cabe en consumer GPU: no en BF16. En cuantizaciones de 4 bits (no detalladas en la informacion proporcionada) podria encajar en GPUs de 24 GB como la RTX 4090, aunque el autor no confirma formatos ni resultados.
- Opciones de despliegue: vLLM con `--enable-lora --max-lora-rank 64` y `--lora-modules swift-1.5=nchapman/Qwen3.8-27B-Swift-1.5-LoRA`; transformers con `peft` mediante `PeftModel.from_pretrained` y `AutoModelForImageTextToText`.
- Latencia y throughput estimados: no disponibles. El adaptador anade un coste marginal de computo LoRA sobre el base, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nchapman/Qwen3.8-27B-Swift-1.5-LoRA | Adaptador LoRA r=64 (base 27B) | No disponible | KL de trayectoria 0,00294 nats frente a Swift-1.5 | Swift Open License 1.0 | Hugging Face, 0 descargas |
| ukisai/Swift-1.5-Qwen3.8-27b | 27B (modelo completo) | No disponible | Referencia objetivo (KL 0 nats) | Swift Open License 1.0 | Hugging Face |
| Qwen/Qwen3.8-27B | 27B | No disponible | Base sin post-entrenamiento (KL 0,02092 nats) | Apache-2.0 | Hugging Face |
| Otros adaptadores LoRA sobre Qwen3.8-27B | Variable | No disponible | No disponible | Variable | No disponible |

La comparativa se limita a las tres variantes documentadas en la model card; no se dispone de datos sobre alternativas de terceros de la misma categoria.

## Limitaciones y advertencias

- El adaptador reproduce el post-entrenamiento de Swift-1.5 con un error residual: la reconstruccion BF16 deja entre el 4,3 % y el 6,7 % de los pesos fuera del margen de una ULP, lo que puede producir divergencias menores en generaciones largas.
- La energia espectral capturada en linear_attn es solo del 14,12 %, lo que indica que esa familia de modulos se aproxima con menor fidelidad que self_attn y MLP.
- No modifica la torre visual ni el modulo MTP del base, por lo que las capacidades multimodales y de prediccion multi-token quedan exactamente como en Qwen3.8-27B original.
- Riesgo de alucinacion: no documentado en la informacion proporcionada; es inherente al modelo base y no se han publicado evaluaciones de factualidad.
- Sesgos conocidos: no documentados. El dataset de evaluacion (harmless_alpaca) sugiere un enfoque de seguridad, pero no se aportan analisis de sesgo.
- Idiomas soportados: no disponibles; no se confirma cobertura multilingue mas alla de la del base.
- Licencia: Swift Open License 1.0 es una licencia "other" con terminos propios; es imprescindible revisar el texto completo antes de uso comercial, y ademas se heredan las obligaciones de la licencia Apache-2.0 del base Qwen3.8-27B.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente por parte de terceros.
- La model card no documenta la longitud de contexto, los formatos de cuantizacion compatibles ni cifras de latencia, lo que limita la planificacion de produccion.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/nchapman/Qwen3.8-27B-Swift-1.5-LoRA
- Modelo fuente Swift-1.5: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Licencia Swift Open License 1.0: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b/blob/main/LICENSE
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset de evaluacion harmless_alpaca: https://huggingface.co/datasets/mlabonne/harmless_alpaca
