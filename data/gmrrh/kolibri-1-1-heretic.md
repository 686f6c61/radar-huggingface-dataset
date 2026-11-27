# gmrrh/Kolibri-1.1-heretic

## Resumen

Kolibri-1.1-heretic es una variante "abliterated" (sin comportamiento de rechazo) del modelo Kolibri-1.1 de Aleph Alpha Research GmbH, publicada por el usuario gmrrh en Hugging Face. Se trata de un modelo de lenguaje de arquitectura Mixture-of-Experts (MoE) con 75.112.665.344 parametros totales y 3.439.874.304 parametros activos por token, disenado para generacion de texto, razonamiento y conversacion en aleman e ingles.

La modificacion se ha realizado mediante la herramienta Heretic con la tecnica Arbitrary-Rank Ablation (ARA), un proceso de ablacion de representaciones que elimina la conducta de rechazo del modelo original preservando al maximo su distribucion original. Segun la model card, solo se han modificado las proyecciones de salida de atencion (`self_attn.o_proj` en bfloat16) y las proyecciones down de los expertos compartidos (`mlp.shared_experts.down_proj` en formato FP8 por bloques) en las capas 22 a 28; el resto de tensores (384 expertos enrutados, routers, embeddings, layer norms y LM head) son identicos bit a bit al checkpoint original.

El modelo conserva el formato nativo FP8 (`float8_e4m3fn`) en bloques de 128x128 con escalas float32, lo que reduce el peso del repositorio a 77,5 GB. Es relevante para quienes necesitan un modelo MoE de gran tamano con contexto muy largo (262.144 tokens nativos, ampliable hasta 1.048.576) y sin restricciones de rechazo, manteniendo una divergencia KL baja (0,0922) respecto al original en prompts inofensivos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE), transformer |
| Parametros totales | 75.112.665.344 |
| Parametros activos | 3.439.874.304 por token |
| Longitud de contexto | 262.144 tokens nativos; hasta 1.048.576 tokens |
| Tipos de cuantizacion | FP8 nativo (`float8_e4m3fn`, bloques 128x128 con escalas float32); bfloat16 en `self_attn.o_proj` |
| Idiomas soportados | Aleman, ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato nativo FP8 del checkpoint original) |

## Arquitectura y entrenamiento

El modelo base Kolibri-1.1 emplea una arquitectura Mixture-of-Experts con 75.000 millones de parametros totales y aproximadamente 3.440 millones de parametros activos por token, lo que permite un coste de inferencia muy inferior al de un modelo denso del mismo tamano. La model card no detalla la composicion del dataset de entrenamiento ni si se aplicaron tecnicas de RLHF o DPO en el modelo base; esa informacion no esta disponible en la documentacion proporcionada.

La innovacion principal de esta variante es el proceso de ablacion ARA aplicado con Heretic: se optimizaron 40 trials (15 aleatorios y el resto con TPE) sobre un modificador Arbitrary-Rank Ablation con rango LoRA 32, alpha 32, preservacion de magnitud de filas y 5 pasos de L-BFGS. Los objetivos eran minimizar la tasa de rechazos (KeywordRate) y la divergencia KL. El trial ganador modifico las capas 22 a 28 con `start_layer_index=22`, `end_layer_index=29`, `preserve_good_behavior_weight=0.1479`, `steer_bad_behavior_weight=0.1340`, `overcorrect_relative_weight=1.2795` y `neighbor_count=2`. El entrenamiento se ejecuto en una NVIDIA H200 NVL (140,4 GB de VRAM) en aproximadamente 51 minutos. Los prompts "buenos" procedian de `mlabonne/harmless_alpaca` (train[:250]) y `mayflowergmbh/alpaca-gpt4_de` (train[:100]); los "malos", de `mlabonne/harmful_behaviors` (train[:250]).

## Capacidades

- Generacion de texto y conversacion multi-turno en aleman e ingles.
- Razonamiento con modo de "reasoning effort" configurable mediante el system prompt (se puede desactivar para respuestas directas).
- Soporte de tool calling / function calling mediante el parser `kolibri1` en vLLM.
- Soporte de agentes y razonamiento multi-paso (multi-step reasoning) a traves de la integracion con vLLM.
- Contexto largo: 262.144 tokens nativos, ampliable hasta 1.048.576 tokens.
- Capacidad de respuesta sin rechazos (abliterated): responde a consultas que el modelo original rechazaria.
- No se documentan capacidades de vision ni audio en la informacion disponible.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con historiales extensos gracias a sus 262.144 tokens de contexto nativo, manteniendo coherencia en aleman e ingles.
- Generacion de codigo en produccion: soporta tool calling y se integra en pipelines mediante vLLM con `--enable-auto-tool-choice`, lo que permite invocar herramientas externas y ejecutar tareas de generacion asistida.
- Analisis de documentos largos: con contexto de hasta 1.048.576 tokens, es adecuado para resumir o extraer informacion de contratos, informes tecnicos o expedientes completos sin truncamiento.
- Investigacion sobre seguridad y alineamiento: al ser una variante abliterated con divergencia KL baja (0,0922), sirve para estudiar el efecto de la ablacion de rechazo sobre el comportamiento del modelo.
- Asistentes de razonamiento multi-paso: el modo de reasoning configurable permite alternar entre respuestas directas y cadenas de razonamiento segun la tarea.
- Despliegue en entornos con restricciones de VRAM: al usar FP8 nativo, el modelo ocupa 77,5 GB, lo que permite servirlo en una sola GPU de 80 GB o en configuraciones multi-GPU.
- Prototipado de agentes autonomos: la combinacion de tool calling, contexto largo y ausencia de rechazos facilita flujos de agente que requieren ejecutar acciones sobre APIs externas.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son las metricas del estudio de optimizacion de Heretic:

| Metrica | Este modelo | Modelo original (Aleph-Alpha/Kolibri-1.1) |
|---|---|---|
| Rechazos | 0/80 | 79/80 |
| Divergencia KL | 0,0922 | 0 (por definicion) |

Los rechazos se evaluaron sobre 80 prompts daninos de `mlabonne/harmful_behaviors` (`test[:80]`) con generacion greedy y deteccion de patrones de rechazo. La divergencia KL se midio sobre 80 prompts inofensivos de `mlabonne/harmless_alpaca` (`test[:80]`); un valor inferior a 0,10 indica que el modelo conserva su distribucion original en instrucciones cotidianas.

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint nativo FP8 ocupa 77,5 GB, por lo que requiere al menos una GPU de 80 GB (A100 80GB, H100 80GB, H200) o configuracion multi-GPU. Con cuantizaciones adicionales no documentadas por el autor, el requisito podria reducirse, pero no hay datos publicados.
- GPU recomendadas: NVIDIA H200 NVL (usada por el autor para la optimizacion, 140,4 GB), H100 80GB, A100 80GB.
- No cabe en GPUs consumer (RTX 4090 de 24 GB, RTX 3090 de 24 GB) en su formato nativo FP8.
- Opciones de despliegue: vLLM (recomendado por el autor, con `--kv-cache-dtype fp8`, `--reasoning-parser kolibri1`, `--tool-call-parser kolibri1` y `--enable-auto-tool-choice`) y Hugging Face Transformers con `device_map="auto"`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Rechazos |
|---|---|---|---|---|---|
| gmrrh/Kolibri-1.1-heretic | 75,1B | 3,44B | 262.144 (hasta 1.048.576) | Apache 2.0 | 0/80 |
| Aleph-Alpha/Kolibri-1.1 | 75,1B | 3,44B | 262.144 (hasta 1.048.576) | Apache 2.0 | 79/80 |
| Alternativas MoE de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion documentada es con el modelo base Kolibri-1.1, del que esta variante difiere exclusivamente en la eliminacion del comportamiento de rechazo y una divergencia KL de 0,0922. No se dispone de datos de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo ha eliminado su comportamiento de rechazo mediante ablacion de representaciones: respondera a consultas que el modelo original rechaza. El usuario es responsable de garantizar que su uso cumple la legislacion aplicable, los estandares eticos y la licencia Apache 2.0.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se han publicado evaluaciones especificas de fidelidad factual.
- La ablacion puede degradar capacidades en dominios sensibles; la divergencia KL de 0,0922 sugiere que la distribucion se conserva en prompts inofensivos, pero no hay garantia fuera de esa muestra.
- Idiomas limitados a aleman e ingles; no se documenta soporte de castellano ni de otros idiomas.
- El contexto nativo es de 262.144 tokens; la extension hasta 1.048.576 tokens puede requerir configuracion adicional y no esta detallada en la model card.
- El formato nativo FP8 limita el despliegue a hardware con soporte de FP8 y a GPUs de 80 GB o superiores; no hay versiones GGUF publicadas por el autor.
- Solo se han modificado las capas 22 a 28; el resto del modelo es identico al original, por lo que hereda cualquier sesgo presente en Kolibri-1.1 (no documentado en la informacion disponible).
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gmrrh/Kolibri-1.1-heretic
- Adaptador PEFT LoRA independiente: https://huggingface.co/gmrrh/Kolibri-1.1-heretic-peft
- Modelo base: https://huggingface.co/Aleph-Alpha/Kolibri-1.1
- Licencia del modelo base: https://huggingface.co/Aleph-Alpha/Kolibri-1.1/blob/main/LICENSE
- Proyecto Heretic: https://heretic-project.org
- Dataset de prompts daninos: `mlabonne/harmful_behaviors`
- Dataset de prompts inofensivos: `mlabonne/harmless_alpaca`
- Dataset aleman de instrucciones: `mayflowergmbh/alpaca-gpt4_de`
