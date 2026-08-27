# nuottroisaoduoc/GLM-5.3-Flash-UNCENSORED-FP8

## Resumen

GLM-5.3-Flash-UNCENSORED-FP8 es una modificacion del modelo GLM-5.3-Flash de Z.ai (zai-org) en la que se han eliminado los comportamientos de rechazo directamente en los pesos del modelo, mediante una tecnica de ablacion (abliteration). El resultado es un modelo que no se niega a responder ante solicitudes que el modelo base consideraria problematicas, incluyendo copyright y otros contenidos marcados como benignos pero que disparaban sobre-rechazo. Esta version en FP8 mantiene la velocidad nativa en GPUs Hopper (H100/H200) y conserva las capacidades de vision, tool calling y MTP (multi-token prediction) del modelo original.

El modelo base es un MoE hibrido de 320.000 millones de parametros totales con 18.000 millones activos por token, con una ventana de contexto de 1 millon de tokens y arquitectura GLM-5.3-Flash (glm5_next). La modificacion no implica fine-tuning, SFT, DPO, LoRA ni parches en tiempo de ejecucion: es una edicion permanente de los tensores, por lo que se puede cargar con vLLM estandar sin adaptaciones. La licencia es MIT, lo que permite uso comercial sin restricciones de atribucion.

La relevancia de este modelo reside en que ofrece una alternativa sin guardrails para casos de uso donde el sobre-rechazo del modelo base supone un problema (por ejemplo, generacion de contenido creativo con referencias a obras protegidas, o investigacion en seguridad de IA). Sin embargo, su naturaleza "uncensored" implica riesgos importantes de uso indebido, por lo que debe manejarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLM-5.3-Flash (glm5_next) - MoE hibrido con atencion KDA lineal y sparse MLA |
| Parametros totales | 321.323.031.390 (320B) |
| Parametros activos | 18B por token |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | FP8 (block-wise e4m3) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash es el primer modelo de la serie GLM-5 en combinar atencion lineal (KDA) con atencion sparse estilo DeepSeek, formando un MoE hibrido de 320B parametros totales y 18B activos. Incluye un tower de vision basado en GLM-4.1V, lo que lo hace nativamente multimodal, y un cabezal MTP (multi-token prediction) para decodificacion especulativa. El contexto es de 1 millon de tokens.

La version UNCENSORED se obtiene mediante una tecnica de ablacion de pesos (abliteration) que elimina los vectores de direccion responsables del comportamiento de rechazo. No hubo entrenamiento adicional: ni SFT, ni DPO, ni LoRA, ni adaptadores. La edicion se aplica directamente sobre los tensores del modelo FP8, de modo que el checkpoint resultante es un modelo estatico sin hooks ni parches. Segun el autor, la divergencia KL respecto al modelo base es intencionada en los tokens relacionados con el rechazo, pero la capacidad general se preserva (MMLU cae solo 0,48 puntos porcentuales).

## Capacidades

- Generacion de texto y razonamiento de proposito general, con puntuacion MMLU de 86,26% (frente al 86,74% del base).
- Razonamiento multi-paso y modo "thinking" compatible con el parser de razonamiento glm45.
- Tool calling y function calling, con parser glm47 y soporte de auto-tool-choice en vLLM.
- Capacidades de agente: puede encadenar llamadas a herramientas y mantener contexto largo gracias a la ventana de 1M tokens.
- Vision multimodal: acepta entradas de imagen via `image_url` en el chat template multimodal.
- MTP (multi-token prediction): cabezal de decodificacion especulativa con tasa de aceptacion del 75,9%, que acelera la generacion hasta 211 tok/s en H200 con TP4.
- Multilingue: aunque la model card indica solo ingles, el modelo base de Z.ai soporta multiples idiomas; esta version no especifica restricciones adicionales.
- Sin guardrails: no rechaza solicitudes sobre copyright, contenido violento, ilegal o eticamente problematico (100% de cumplimiento en HarmBench-320).

## Casos de uso

- Investigacion en seguridad de IA: analizar como se comporta un modelo sin mecanismos de rechazo, para estudiar sesgos, alucinaciones o vulnerabilidades de los sistemas de moderacion. Se usaria con cargas de trabajo de evaluacion como HarmBench o MMLU, y el modelo responde sin filtros, lo que permite medir su comportamiento real.
- Generacion creativa con referencias a obras protegidas: escritores o guionistas que necesitan generar texto que cite, parafrasee o se inspire en material con copyright sin que el modelo se niegue. El modelo base rechazaba estas solicitudes; esta version las procesa sin problema.
- Desarrollo de agentes de automatizacion con contexto largo: dado su soporte de tool calling y 1M tokens de contexto, se puede integrar en pipelines de automatizacion que requieran mantener conversaciones o estados extensos, como asistentes de soporte tecnico o sistemas de orquestacion de tareas.
- Generacion de codigo en entornos sin restricciones: equipos que trabajan con codigo ofensivo o de seguridad ofensiva (pentesting, analisis de malware) necesitan un modelo que no se niegue a generar exploits o scripts maliciosos en contextos controlados de laboratorio.
- Procesamiento de documentos largos con vision: combinar la entrada de imagenes con el contexto de 1M tokens permite analizar manuales extensos, contratos o documentacion tecnica con figuras y tablas, sin necesidad de dividir el input.
- Simulacion de usuarios problematicos para entrenar moderadores: en plataformas de contenido, se puede usar este modelo para generar ejemplos de interacciones toxicas o ilegales y asi entrenar sistemas de deteccion y moderacion.

## Benchmarks y rendimiento

| Benchmark | Base FP8 | CRACK Uncensored FP8 | Diferencia |
|---|---|---|---|
| MMLU (overall, 1.026 preguntas) | 86,74% | 86,26% | -0,48 pp |
| HarmBench-320 (greedy) - cumplimiento | 0% | 100% | +100 pp |
| HarmBench-320 (muestreo, temp 1.0, top_p 0.95) | no disponible | 30/30 cumplimiento | - |

Velocidades medidas en H200 con tensor-parallel 4:

| Metrica | Valor |
|---|---|
| Decode (single-stream) | 163 tok/s |
| Decode con MTP especulativo | 211 tok/s |
| Prefill | ~19.400 tok/s |
| Tasa de aceptacion MTP | 75,9% |

No se han publicado resultados de otros benchmarks (HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el modelo en FP8 ocupa aproximadamente 321 GB solo de pesos. Con overhead de activaciones y KV cache, se recomienda un minimo de 4x H200 (141 GB cada una) o 4x H100 (80 GB cada una) para servir con tensor-parallel 4.
- GPU recomendadas: H100, H200 (Hopper) para velocidad FP8 nativa. En GPUs Ampere o Ada, el rendimiento FP8 puede ser menor o requerir conversion a BF16.
- No cabe en una GPU consumer (RTX 4090 tiene 24 GB, RTX 5090 32 GB). Se necesitaria cuantizacion adicional (por ejemplo, GGUF en 4 bits) que no esta disponible en este checkpoint.
- Opciones de despliegue: vLLM (recomendado, con soporte nativo de FP8 y MTP), TGI, o cualquier servidor compatible con safetensors y arquitectura glm5_next.
- Latencia y throughput: con TP4 en H200, decode de 163 tok/s (211 con MTP) y prefill de ~19.400 tok/s. Para cargas de produccion con muchos usuarios concurrentes, se puede escalar horizontalmente con multiples replicas.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Cuantizacion | MMLU |
|---|---|---|---|---|---|---|
| GLM-5.3-Flash (base) | 320B | 18B | 1M | MIT | FP8 nativo | 86,74% |
| GLM-5.3-Flash-UNCENSORED-FP8 (este) | 320B | 18B | 1M | MIT | FP8 | 86,26% |
| GLM-5.3-Flash-NVFP4 (LibertAIDAI) | 320B | 18B | 1M | MIT | NVFP4 | no disponible |
| Llama-3.1-405B-Instruct (abliterated) | 405B | 405B | 128K | Llama 3.1 | BF16/FP8 | ~87% (estimado) |

No se dispone de comparativas directas con otros modelos "uncensored" de tamano similar en la informacion proporcionada. La diferencia principal con el base es la eliminacion de guardrails, con una perdida minima de capacidad (0,48 pp en MMLU). Frente a alternativas como Llama-3.1-405B abliterated, este modelo ofrece un coste computacional mucho menor (18B activos frente a 405B densos) y un contexto 8 veces mayor.

## Limitaciones y advertencias

- Ausencia total de guardrails: el modelo no rechaza ninguna solicitud, incluyendo contenido ilegal, violento, discriminatorio o de explotacion. Su uso en produccion sin supervision humana es altamente arriesgado.
- Riesgo de alucinacion: al no tener mecanismos de rechazo, puede generar afirmaciones falsas con mayor confianza, especialmente en temas donde el modelo base habria dudado o se habria negado.
- Sesgos: el proceso de ablacion puede amplificar sesgos existentes en el modelo base, ya que no hay ningun filtro posterior que los mitigue.
- Idioma: la model card indica solo ingles. Aunque el base probablemente soporta otros idiomas, no hay garantia de calidad en lenguas distintas al ingles.
- Requisitos de hardware elevados: 321 GB de pesos en FP8 exigen infraestructura de multiples GPUs de alta gama; no es viable en hardware consumer sin cuantizaciones adicionales no proporcionadas.
- Licencia MIT: permite uso comercial sin restricciones, pero el usuario asume toda la responsabilidad legal y etica del contenido generado.
- Sin soporte oficial: es un modelo creado por un tercero (dealignai) no afiliado a Z.ai. No hay garantias de mantenimiento, correccion de errores o actualizaciones.
- La eliminacion de guardrails es permanente e irreversible: no se puede restaurar el comportamiento de rechazo sin volver al checkpoint base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nuottroisaoduoc/GLM-5.3-Flash-UNCENSORED-FP8
- Espejo del autor: https://huggingface.co/dealignai/GLM-5.3-Flash-ABLITERATED-FP8
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Documentacion de Unsloth sobre GLM-5.3-Flash: https://unsloth.ai/docs/models/glm-5.3
- Receta de vLLM para GLM-5.3-Flash: https://recipes.vllm.ai/zai-org/GLM-5.3-Flash
- Cuantizacion NVFP4 alternativa: https://huggingface.co/LibertAIDAI/GLM-5.3-Flash-NVFP4
- Guia de ejecucion local: https://atomic.chat/models/glm-5-3-flash
