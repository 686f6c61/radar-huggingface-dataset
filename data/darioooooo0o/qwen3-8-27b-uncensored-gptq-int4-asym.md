# darioooooo0o/Qwen3.8-27B-Uncensored-GPTQ-Int4-asym

## Resumen

Qwen3.8-27B-Uncensored-GPTQ-Int4-asym es una cuantizacion GPTQ de 4 bits asimetrica del modelo orcarouter/Qwen3.8-27B-Uncensored, un finetune "abliterated" (con el comportamiento de rechazo eliminado) del Qwen/Qwen3.8-27B del equipo Qwen. Lo publica el usuario darioooooo0o (conocido como @imdariotoo en X), que lo construyo para ejecutarlo en una unica tarjeta Intel Arc Pro B70. El modelo tiene 27.781.427.952 parametros totales y un repositorio de 19,6 GB en formato safetensors/GPTQ.

La relevancia de esta ficha es doble: por un lado, es una cuantizacion de 4 bits con calidad medida (KL de 0,038 frente al base BF16 en los top-20 logits, frente a 0,069 de la receta simetrica habitual); por otro, demuestra el despliegue de un modelo de 27B multimodal con contexto de 262.144 tokens en hardware Intel XPU mediante vLLM, algo poco habitual en el ecosistema.

El pipeline declarado es image-text-to-text, lo que indica que conserva la torre de vision del modelo base en BF16. La licencia es Apache-2.0, heredada del modelo original. La model card advierte explicitamente de que el modelo hereda la ausencia de guardarrailes del base abliterated.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con capas de atencion lineal (GDN, Gated DeltaNet) y atencion completa; incluye torre de vision y cabeza MTP; familia qwen3_5 |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | 262.144 tokens (segun la configuracion de despliegue del autor, con pool KV de ~320K tokens) |
| Tipos de cuantizacion | GPTQ int4 asimetrico (uint4, grupo 128, escala + zero por grupo, clip search MSE); lm_head, capas MTP, torre de vision y GDN `in_proj_a`/`in_proj_b` en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en GPTQ v1 estandar (`sym: false`), cargable con transformers, GPTQModel y vLLM |

## Arquitectura y entrenamiento

El modelo base es un transformer hibrido de la familia Qwen3.8 que combina capas de atencion lineal GDN (Gated DeltaNet) con capas de atencion completa, e incorpora una torre de vision para entrada image-text-to-text y una cabeza MTP (multi-token prediction) usada para decodificacion especulativa. El estado de las capas GDN se almacena por defecto en fp32, lo que el autor senala como un coste relevante en escenarios de alta concurrencia.

La cuantizacion se realizo con `b70quant.py` del cookbook riceharvest/b70-qwen38-cookbook: GPTQ con damp 0.01, act-order desactivado, uint4 asimetrico con escala y zero por grupo, y una busqueda de clip sobre 11 ratios minimizando |err|^2.4. Se calibro con 128 ventanas de 2048 tokens mezclando chat privado (no publicado), texto de razonamiento/agentico, codigo y prosa tecnica, disjuntas de las ventanas de evaluacion. El proceso tardo aproximadamente una hora, capa a capa, en una B70. No se cuantizaron lm_head, capas MTP, torre de vision ni `in_proj_a`/`in_proj_b`. El finetune abliterated original es de OrcaRouter; no se dispone de detalles sobre sus datos de entrenamiento ni sobre si hubo RLHF/DPO.

## Capacidades

- Generacion de texto conversacional multi-turno con contexto largo (hasta 262.144 tokens en la configuracion probada).
- Comprension de imagenes y texto combinados (pipeline image-text-to-text, torre de vision en BF16).
- Razonamiento y texto agentico, segun la composicion del dataset de calibracion.
- Generacion de codigo y prosa tecnica.
- Decodificacion especulativa mediante la cabeza MTP (k=4 en la configuracion del autor).
- Ausencia de comportamiento de rechazo (abliterated): no aplica filtros de seguridad integrados.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente conversacional local sin filtros: el modelo permite conversaciones multi-turno sobre temas que los modelos alineados rechazan, con 262K tokens de contexto para historiales largos, en una unica GPU de consumo profesional.
- Analisis de documentos tecnicos extensos: con 262K tokens de ventana se pueden procesar manuales, papers o bases de codigo completas en una sola pasada; el autor reporta prefill de ~2050 tok/s a 6K y ~1450 tok/s a 74K en una B70.
- Procesamiento de imagenes con texto (OCR, descripcion, VQA): la torre de vision se mantiene en BF16, por lo que la calidad visual no se degrada por la cuantizacion.
- Generacion de codigo en pipelines locales: la cuantizacion int4 reduce el peso a 19,6 GB, lo que permite servir el modelo en una sola tarjeta y usarlo para autocompletado o generacion en entornos de desarrollo aislados.
- Investigacion sobre cuantizacion: el modelo sirve como caso de estudio reproducible de GPTQ asimetrico con metricas KL publicadas frente a la receta simetrica.
- Despliegue en hardware Intel Arc: es uno de los pocos ejemplos documentados de un modelo de 27B multimodal servido con vLLM XPU, util para equipos con GPUs Intel.
- Experimentacion con contenido sin restricciones en entornos controlados de investigacion (red teaming, estudios de alineacion), asumiendo la responsabilidad legal del uso.

## Benchmarks y rendimiento

Divergencia KL sobre los top-20 logits en ventanas retenidas de 2048 tokens (menor es mejor):

| Metrica | GPTQ int4 simetrico g128 | Esta cuantizacion |
|---|---|---|
| KL en chat privado | 0,038 | 0,018 |
| KL en codigo | 0,078 | 0,040 |
| KL en prosa tecnica | 0,096 | 0,060 |
| KL global | 0,069 | 0,038 |
| Acuerdo top-1 | 91,9% | 94,1% |

La version servida (lm_head en fp8) mide KL 0,039 de extremo a extremo. En el canary aritmetico del cookbook de la B70 obtiene 5/6 frente a 4/6 del GPTQ simetrico; el propio autor advierte de que son solo 6 preguntas y debe tratarse como ruido. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

Rendimiento medido en una Intel Arc Pro B70 a 275 W, una peticion a la vez:

| Metrica | Valor |
|---|---|
| Decodificacion, prompts cortos (greedy) | 64-128 tok/s (35 ms por paso de verificacion MTP) |
| Decodificacion a 65K de contexto | ~79 tok/s greedy, ~64 tok/s con sampling (43 ms por paso) |
| Decodificacion a 100K de contexto | 65-70 tok/s greedy (46 ms por paso) |
| Prefill a 6K | ~2050 tok/s |
| Prefill a 74K | ~1450 tok/s |

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 19,6 GB, por lo que la inferencia requiere aproximadamente 20 GB de VRAM para los pesos, mas el pool KV (hasta ~320K tokens) y el estado GDN en fp32 por defecto.
- GPU probada: Intel Arc Pro B70 (unica tarjeta, 275 W), con vLLM XPU v0.31.0 y v0.32.0 y los parches del cookbook riceharvest/b70-qwen38-cookbook.
- Otras GPU: el autor no ha probado CUDA, pero el formato GPTQ v1 asimetrico estandar deberia cargar en GPTQModel, transformers y vLLM sobre CUDA. vLLM XPU estandar (v0.31/v0.32) no carga GPTQ asimetrico correctamente sin el parche del cookbook (PR upstream vllm#61731).
- GPU de consumo: no hay datos publicados sobre RTX 4090 u otras tarjetas consumer; los 19,6 GB de pesos dejarian poco margen en GPUs de 24 GB para contexto largo.
- Despliegue: imagen preconstruida `ghcr.io/riceharvest/b70-vllm:v0.32.0-b70.7`; tambien `serve.sh` del cookbook. Para alta concurrencia se recomienda `--mamba-ssm-cache-dtype float16` (o `B70_GDN_STATE=fp16`).
- Concurrencia: en Qwen3.6-35B-A3B (mismas capas GDN) pasar el estado a fp16 redujo de 49 a 42-45 ms por token con 64 usuarios concurrentes; no medido en este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (Qwen3.8-27B-Uncensored GPTQ int4 asym) | 27,78B | 262.144 | GPTQ int4 asimetrico | Apache-2.0 | Probado en Intel Arc Pro B70; sin guardarrailes |
| orcarouter/Qwen3.8-27B-Uncensored (base BF16) | 27,78B | no disponible | BF16 | Apache-2.0 | Referencia de calidad; requiere mucho mas VRAM |
| Qwen/Qwen3.8-27B (original) | 27,78B | no disponible | BF16 | Apache-2.0 | Modelo alineado con rechazos; misma arquitectura |
| GPTQ int4 simetrico del mismo base | 27,78B | no disponible | GPTQ int4 simetrico g128 | Apache-2.0 | KL global 0,069 frente a 0,038 de esta version |

No se dispone de datos de benchmarks estandar para establecer comparaciones de rendimiento con alternativas de otros fabricantes.

## Limitaciones y advertencias

- Ausencia de guardarrailes: el modelo hereda el comportamiento abliterated del base y no tiene filtros de rechazo; puede generar contenido danino, ilegal o sensible sin aviso.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; la cuantizacion int4 introduce divergencia adicional (KL 0,038-0,039) que puede afectar a tareas de precision.
- Idiomas soportados no declarados: no hay garantia de calidad fuera del ingles y el chino, idiomas habituales de la familia Qwen.
- Contexto: los 262.144 tokens dependen de la configuracion concreta del cookbook y del pool KV; en otras configuraciones puede ser menor.
- Compatibilidad: el GPTQ asimetrico requiere parches especificos en vLLM XPU; en otros backends el soporte no esta verificado por el autor.
- Alta concurrencia: el estado GDN en fp32 por defecto penaliza el rendimiento con muchos usuarios; se recomienda fp16, aunque no se ha medido en este modelo.
- Licencia Apache-2.0: permite uso comercial, pero el usuario asume la responsabilidad legal del contenido generado por un modelo sin alineacion.
- El canary aritmetico de 6 preguntas no es una evaluacion fiable; no debe usarse para decisiones de produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/darioooooo0o/Qwen3.8-27B-Uncensored-GPTQ-Int4-asym
- Modelo base (finetune): https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- Cookbook de despliegue en B70: https://github.com/riceharvest/b70-qwen38-cookbook
- Resultados de vLLM con 64 usuarios: https://riceharvest.github.io/awesome-b70/results/vllm-64-users.html
- PR de vLLM para GPTQ asimetrico: https://github.com/vllm-project/vllm/pull/61731
- Cookbook de inferencia en Intel Arc Pro B70 de SergiioB: https://github.com/SergiioB/intel-arc-pro-b70-inference-cookbook
- Perfil del autor en X: https://x.com/imdariotoo
