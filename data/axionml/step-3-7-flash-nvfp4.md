# AxionML/Step-3.7-Flash-NVFP4

## Resumen

AxionML/Step-3.7-Flash-NVFP4 es un espejo (mirror) del checkpoint cuantizado en NVFP4 de Step-3.7-Flash, el modelo de lenguaje y visión de tipo Mixture-of-Experts (MoE) desarrollado por StepFun. El modelo original combina un backbone de lenguaje de 196B parámetros con un encoder de visión de 1.8B parámetros, alcanza 198B parámetros totales y activa aproximadamente 11B parámetros por token, con una ventana de contexto de 256K tokens y niveles de razonamiento seleccionables (low, medium, high).

La aportación de este repositorio no es el entrenamiento ni la cuantización, sino la distribución: AxionML publica una copia sin modificar del checkpoint `stepfun-ai/Step-3.7-Flash-NVFP4` (revisión `4275532ffd9a9496ff36b7a2dc4a9db1048da438`) bajo licencia Apache 2.0. La cuantización la realizó StepFun con NVIDIA Model Optimizer v0.45.0, aplicando NVFP4 (W4A4, grupo de 16 elementos) a las capas lineales del MoE y manteniendo atención, router y encoder de visión en mayor precisión, con caché KV en FP8.

Es relevante ahora porque permite servir un modelo multimodal de 198B en formato de 4 bits con kernels nativos de FP4 en hardware Blackwell (B200/GB200), reduciendo el peso del checkpoint a unos 129 GB y habilitando despliegues con paralelismo de tensores y de expertos (TP4/EP4) en SGLang y vLLM. Está pensado para flujos agénticos, tool calling estable y comprensión de imagen y vídeo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE disperso (sparse Mixture-of-Experts) vision-language; backbone de lenguaje de 196B + encoder de visión de 1.8B |
| Parametros totales | 198B según la model card del modelo base; los metadatos safetensors del checkpoint cuantizado declaran 103.810.330.432 parámetros (representación empaquetada NVFP4) |
| Parametros activos | ~11B por token |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | NVFP4 (W4A4, group size 16) en capas lineales del MoE; caché KV en FP8 (e4m3); atención, router y encoder de visión en mayor precisión |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con código personalizado (custom_code; requiere `trust-remote-code`), librería transformers |
| Expertos | 288 expertos enrutados |
| Niveles de razonamiento | low / medium / high (seleccionables) |
| Tamano del checkpoint | ~129 GB (repositorio: 129,2 GB) |
| Herramienta de cuantizacion | NVIDIA Model Optimizer v0.45.0 |
| Pipeline | image-text-to-text |
| Modelo base | stepfun-ai/Step-3.7-Flash (relación: quantized) |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE disperso con capacidad multimodal nativa. El backbone de lenguaje aporta 196B parámetros organizados en 288 expertos enrutados, de los que se activan aproximadamente 11B por token, lo que sitúa al modelo en la categoría 198B-A11B. El encoder de visión añade 1.8B parámetros y permite comprensión nativa de imágenes y vídeo, sin adaptadores externos. El modelo deriva de la arquitectura de lenguaje de Step-3.5-Flash, ampliada con visión nativa y orientada a flujos de trabajo agénticos de desarrollador y a tool calling estable, según la documentación de NVIDIA NeMo AutoModel.

Sobre el entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO u otras etapas de alineamiento) no hay información en los materiales disponibles; se indica como no disponible. La innovación técnica de este repositorio es exclusivamente la cuantización NVFP4: el códec E2M1 de FP4 se combina con escalas por bloques de 16 elementos en FP8 (E4M3) en lugar de escalas de solo potencias de dos (E8M0), lo que permite escalas fraccionarias y selección de escala que minimiza el error. En las Tensor Cores de Blackwell, los multiplicadores FP4 nativos se acompañan de acumulación en FP32 para proteger la precisión del producto escalar. La cuantización se aplica solo a las capas lineales del MoE; atención, router y encoder de visión se mantienen en precisión superior, y la caché KV se almacena en FP8.

## Capacidades

- Generación de texto y razonamiento multi-paso con niveles de esfuerzo configurables (low, medium, high).
- Comprensión de imagen y vídeo de forma nativa (pipeline image-text-to-text), gracias al encoder de visión de 1.8B parámetros.
- Tool calling y function calling: el despliegue documentado incluye `--tool-call-parser step3p5` y `--enable-auto-tool-choice`, lo que indica soporte explícito de llamadas a herramientas.
- Flujos agénticos: la documentación de NVIDIA lo describe orientado a workflows agénticos que combinan percepción, búsqueda y razonamiento multi-paso.
- Búsqueda y uso de herramientas externas: el benchmark SimpleVQA (Search) evalúa este escenario.
- Ejecución de tareas de código y terminal: se reportan resultados en SWE-Bench Pro y Terminal-Bench 2.1, lo que sugiere capacidad para tareas de ingeniería de software y uso de shell.
- Contexto largo de hasta 256K tokens, adecuado para repositorios, documentos extensos y sesiones largas.
- Capacidades multilingües: no disponible (no se especifica el listado de idiomas soportados).

## Casos de uso

- Agentes de ingeniería de software: con 256K tokens de contexto el modelo puede cargar varios ficheros de un repositorio, razonar sobre ellos y generar parches; los resultados reportados en SWE-Bench Pro (56,3) y Terminal-Bench 2.1 (59,5) apuntan a este escenario como objetivo principal.
- Automatización de terminal y operaciones: el soporte de tool calling y los 59,5 puntos en Terminal-Bench 2.1 permiten integrarlo en agentes que ejecutan comandos, interpretan salidas y corrigen errores en bucle.
- Asistentes multimodales de atención al cliente: al aceptar entrada de imagen y texto, puede procesar capturas de pantalla, facturas o fotos de producto junto con la consulta del usuario en una conversación multi-turno.
- Búsqueda aumentada con herramientas (RAG agéntico): el modelo puede decidir cuándo invocar un buscador o una API y sintetizar la respuesta; el benchmark SimpleVQA (Search) evalúa exactamente esta capacidad.
- Análisis de documentación técnica y vídeo: al combinar contexto de 256K con visión nativa, sirve para resumir manuales extensos con diagramas o para extraer información de grabaciones y tutoriales.
- Copiloto de análisis de datos y ofimática: con razonamiento por niveles puede alternar respuestas rápidas (low) para consultas simples y cadenas de razonamiento largas (high) para tareas como las evaluadas en GDPVal-AA.
- Despliegue de alto rendimiento en infraestructura propia: el formato NVFP4 con kernels Blackwell permite servir el modelo con TP4/EP4 en SGLang o vLLM, con throughput de hasta 400 tokens por segundo según el repositorio oficial del modelo base (condiciones de hardware no especificadas).

## Benchmarks y rendimiento

Los resultados publicados corresponden al modelo base en precisión completa, no al checkpoint NVFP4. La propia model card advierte que las puntuaciones provienen de la model card de Step-3.7-Flash (baseline de precisión completa). No se han publicado resultados de benchmarks específicos de la versión cuantizada en la información disponible.

| Benchmark | Step 3.7 Flash |
|---|---|
| SimpleVQA (Search) | 79,2 |
| V* (Python) | 95,3 |
| ClawEval-1.1 | 67,1 |
| Toolathlon | 49,5 |
| HLE (con herramienta) | 48,1 |
| SWE-Bench Pro | 56,3 |
| Terminal-Bench 2.1 | 59,5 |
| GDPVal-AA | 45,8 |

## Requisitos de hardware

- El checkpoint ocupa ~129 GB en disco. Con TP4 (4 GPUs) el reparto teórico de pesos es de unos 32 GB por GPU, a lo que hay que sumar caché KV en FP8 y estados de activación; con contexto de 256K la caché KV crece de forma apreciable y conviene reservar margen.
- Los multiplicadores FP4 nativos y las rutas NVFP4 de ModelOpt están asociados a las Tensor Cores de Blackwell. Las GPU recomendadas para este formato son B200 y GB200; se recomienda 4 GPU para TP4/EP4.
- En GPUs Hopper (H100/H200) no hay confirmación en la información disponible de que los kernels NVFP4 nativos estén soportados; cualquier uso en esa generación debe validarse previamente.
- No cabe en GPU de consumo (RTX 4090 con 24 GB, ni siquiera en configuraciones multi-GPU de 2-4 tarjetas) por el tamaño del checkpoint y por la ausencia de soporte NVFP4 nativo en esas arquitecturas.
- Opciones de despliegue documentadas: SGLang (`--tp 4 --ep 4 --moe-runner-backend flashinfer_trtllm --kv-cache-dtype fp8_e4m3 --quantization modelopt_fp4 --attention-backend trtllm_mha`) y vLLM (`--tensor-parallel-size 4 --enable-expert-parallel --quantization modelopt --kv-cache-dtype fp8`).
- Imágenes preconstruidas publicadas: `lmsysorg/sglang:dev-step-3.7-flash` y `vllm/vllm-openai:stepfun37`. El build NVFP4 exige cuantización ModelOpt y caché KV en FP8.
- Latencia y throughput: hasta 400 tokens por segundo según el repositorio oficial del modelo base; no se especifican en la información disponible el hardware, el tamaño de lote ni la longitud de contexto con los que se midió esa cifra.

## Comparativa con modelos similares

La información disponible solo permite comparar el checkpoint cuantizado con su modelo base y con el checkpoint NVFP4 upstream, ya que no se aportan datos de otros MoE multimodales de la competencia.

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AxionML/Step-3.7-Flash-NVFP4 | 198B totales / ~11B activos | 256K | MoE vision-language, NVFP4 (W4A4) | Apache 2.0 | Espejo en HuggingFace; 0 descargas y 0 likes en el momento de la consulta |
| stepfun-ai/Step-3.7-Flash-NVFP4 | 198B totales / ~11B activos | 256K | MoE vision-language, NVFP4 (W4A4) | Apache 2.0 | Repositorio upstream de la cuantización, mantenido por StepFun |
| stepfun-ai/Step-3.7-Flash | 198B totales / ~11B activos | 256K | MoE vision-language, precisión completa | Apache 2.0 | Repositorio oficial del modelo base; benchmarks reportados aquí |
| Otros MoE multimodales comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos y contenido nocivo: la model card advierte de que el modelo base se entrenó con datos que pueden contener lenguaje tóxico y sesgos sociales, y que la versión cuantizada hereda esas limitaciones; puede generar contenido inexacto, sesgado u ofensivo.
- Riesgo de alucinación: es un riesgo general de los modelos de este tipo y no se cuantifica en la información disponible; los benchmarks reportados incluyen tareas con uso de herramientas, lo que no elimina el riesgo en respuestas libres.
- Rendimiento de la versión cuantizada: no hay benchmarks publicados del checkpoint NVFP4. Las cifras de la tabla corresponden al baseline en precisión completa, por lo que no deben presentarse como rendimiento del modelo cuantizado.
- Discrepancia en el recuento de parámetros: la model card indica 198B parámetros, mientras que los metadatos safetensors declaran 103.810.330.432 parámetros para este checkpoint. Es previsible que la diferencia se deba a la representación empaquetada de los pesos NVFP4, pero conviene verificarlo antes de dimensionar infraestructura.
- Idiomas soportados: no disponibles. No se puede garantizar calidad fuera de los idiomas mayoritarios del corpus de entrenamiento.
- Dependencia de hardware: el formato NVFP4 está pensado para Tensor Cores de Blackwell; su uso en otras generaciones no está confirmado en la información disponible.
- Dependencia de software: requiere `trust-remote-code`, kernels y parsers específicos (`reasoning-parser step3p5`, `tool-call-parser step3p5`) y versiones concretas de SGLang o vLLM. No funcionará con instalaciones antiguas ni con stacks genéricos sin adaptación.
- Licencia: Apache 2.0 permite uso comercial y no comercial, incluida la redistribución, siempre que se conserven los avisos de copyright y licencia correspondientes.
- Procedencia: este repositorio es un espejo con 0 descargas y 0 likes; no es el repositorio oficial. Para trazabilidad de la cuantización conviene referenciar el repositorio upstream de StepFun y la revisión concreta citada.

## Enlaces

- Repositorio de este espejo: https://huggingface.co/AxionML/Step-3.7-Flash-NVFP4
- Checkpoint NVFP4 upstream (cuantizado por StepFun): https://huggingface.co/stepfun-ai/Step-3.7-Flash-NVFP4
- Modelo base en precisión completa: https://huggingface.co/stepfun-ai/Step-3.7-Flash
- Repositorio GitHub de Step-3.7-Flash: https://github.com/stepfun-ai/Step-3.7-Flash
- Ficha en NVIDIA NeMo AutoModel: https://docs.nvidia.com/nemo/automodel/nightly/model-coverage/vision-language-models/stepfun-ai/Step-3.7-Flash
- Blog de NVIDIA sobre ejecución en GPUs: https://developer.nvidia.com/blog/run-step-3-7-flash-on-nvidia-gpus-with-enterprise-ready-multimodal-ai/
- NVIDIA Model Optimizer (herramienta de cuantización): https://github.com/NVIDIA/Model-Optimizer
