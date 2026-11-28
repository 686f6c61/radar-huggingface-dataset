# RMDWLLC/Jah-8.0-MLX-8bit

## Resumen

Jah 8.0 MLX 8-Bit es la cuantizacion nativa para Apple Silicon del modelo Jah 8.0 de RMDW LLC, una empresa con sede en Georgia (EE. UU.). Se trata de un modelo multimodal de tipo image-text-to-text con arquitectura Mixture of Experts (MoE), orientado a ciberseguridad, generacion de codigo agentico y despliegue soberano en hardware local. Con 26.388.641.280 parametros totales y un peso de 28,4 GB en el repositorio, la version 8-bit ocupa aproximadamente 26 GB en memoria unificada con 8,604 bits por peso y tamano de grupo 64.

El modelo resuelve el problema de ejecutar investigaciones de ciberseguridad y tareas de codigo agentico de forma continua (24/7) sin que ningun dato salga de la infraestructura del usuario. Esta cuantizacion esta pensada para Mac Studio y MacBook Pro con 48 GB o mas de memoria unificada, y se complementa con un drafter especulativo opcional de 397 MB (Jah-8.0-MLX-MTP) que acelera la decodificacion. La ventana de contexto nativa alcanza 1.048.576 tokens.

La relevancia actual del modelo radica en su enfoque "soberano": licencia Apache 2.0, pesos abiertos en formato MLX safetensors, soporte nativo de tool calling con endpoints compatibles con Anthropic `/v1/messages` y OpenAI `/v1/chat/completions`, y capacidad de vision. Todo ello lo posiciona como una alternativa local a APIs comerciales para equipos que manejan datos sensibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), transformer multimodal (image-text-to-text) |
| Parametros totales | 26.388.641.280 |
| Parametros activos | no disponible |
| Longitud de contexto | Hasta 1.048.576 tokens (nativo) |
| Tipos de cuantizacion | 8-bit MLX (8,604 bits por peso, group size 64); existe variante 4-bit MLX (14 GB) y NVFP4 (19,53 GB); maestro BF16 (~50 GB) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), 6 shards |

## Arquitectura y entrenamiento

La informacion disponible confirma que Jah 8.0 emplea una arquitectura Mixture of Experts con capacidades multimodales (entrada de imagen y texto, salida de texto). El modelo se distribuye en varios formatos: un maestro BF16 de aproximadamente 50 GB, una version NVFP4 de 19,53 GB, esta cuantizacion MLX 8-bit de 26 GB y una variante MLX 4-bit de 14 GB. La cuantizacion se realizo directamente desde el maestro BF16 congelado, con 8,604 bits por peso y tamano de grupo 64, lo que el autor describe como calidad practicamente identica a BF16.

La model card menciona un "inkling2_loop" entre las etiquetas, aunque no se detalla en que consiste. El autor publica un recibo de evaluacion (`JAH8_EVAL_RECEIPT.json`) con resultados deterministas a temperatura 0,0 sobre conjuntos de validacion bloqueados y verificados en ejecucion. Se incluye un drafter especulativo extraido del modelo principal (Jah-8.0-MLX-MTP) para decodificacion especulativa. No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento general en ingles.
- Generacion y edicion de codigo, con evaluacion sobre repositorios Python reales (por ejemplo, `Textualize/rich`) y pull requests multi-archivo en Go.
- Razonamiento agentico multi-paso con soporte de hasta 30 turnos en las evaluaciones publicadas.
- Tool calling / function calling nativo, con endpoints compatibles con Anthropic `/v1/messages` y OpenAI `/v1/chat/completions`.
- Vision: pipeline image-text-to-text, con procesador multimodal y tokenizer asociado.
- Contexto largo: hasta 1.048.576 tokens nativos, con prefix caching (APC) para conversaciones multi-turno.
- Capacidades especializadas en ciberseguridad: forense de BEC/ATO en M365, IAM en la nube y Kubernetes.
- Decodificacion especulativa mediante drafter MTP opcional.
- Capacidades multilingues: limitadas al ingles segun la model card.

## Casos de uso

- Investigacion de ciberseguridad soberana: el modelo puede ejecutar analisis forenses de correo comprometido (BEC) y toma de cuentas (ATO) en M365 sin que los datos salgan de la maquina, gracias a su contexto de hasta 1M tokens y a su entrenamiento especifico en dominios de seguridad.
- Auditoria de configuraciones cloud e IAM: con resultados del 100% en el subconjunto "Cloud IAM & Kubernetes Hard", es adecuado para revisar politicas de permisos y manifiestos de Kubernetes en pipelines internos.
- Codigo agentico en produccion: soporta tool calling nativo y puede integrarse en flujos tipo Claude Code apuntando a un servidor local `mlx_vlm.server`, resolviendo tareas de reparacion de tests (`pytest`, `go test`) en multiples turnos.
- Asistente de desarrollo en Apple Silicon: con 56,9 tok/s en generacion de codigo y 69-134,5 tok/s en turnos concisos, es viable como copiloto local en un MacBook Pro o Mac Studio sin conexion a la nube.
- Analisis de documentos largos con vision: al aceptar imagen y texto con contexto de 1M tokens, puede procesar capturas, diagramas y documentacion extensa en una sola sesion.
- Despliegue on-premise para equipos regulados: licencia Apache 2.0 y pesos abiertos permiten instalarlo en infraestructura propia (Mac Studio, DGX Spark) para organizaciones con requisitos de residencia de datos.
- Servicio de atencion interno con tool calling: los endpoints compatibles con OpenAI y Anthropic permiten sustituir APIs comerciales en herramientas existentes sin reescribir integraciones.

## Benchmarks y rendimiento

Resultados deterministas (temp=0,0) del maestro BF16 publicados por el autor sobre conjuntos bloqueados:

| Benchmark | Muestra | Base sin entrenar | Jah 8.0 FINAL (BF16) | Delta |
|---|---:|---:|---:|---:|
| Ciberseguridad no vista (seed=999999) | 40 | 19/40 (47,5%) | 36/40 (90,0%) | +42,5 pts |
| Forense M365 BEC / ATO (subconjunto) | 10 | 2/10 (20,0%) | 9/10 (90,0%) | +70,0 pts |
| Cloud IAM y Kubernetes Hard (subconjunto) | 10 | 6/10 (60,0%) | 10/10 (100,0%) | +40,0 pts |
| Vault publico de terceros HARD | 66 | 35/66 (53,0%) | 44/66 (66,7%) | +13,7 pts |
| SWE Python en GitHub no visto (30 turnos, `pytest`) | 24 | N/A | 11/24 (45,8%) | `Textualize/rich` 5/8 (62,5%) |
| PRs Go multi-archivo de 200K lineas (30 turnos, `go test`) | 20 | 1/20 (5,0%) | 5/20 (25,0%) | 5,0x |

Metricas de rendimiento en Apple M5 Ultra de 512 GB publicadas por el autor:

| Metrica | Resultado |
|---|---|
| Carga en frio | 1,98 s |
| Generacion de codigo single-stream | 56,9 tok/s (54,1 tok/s end-to-end) |
| Tool calling / turnos concisos | 69-134,5 tok/s (tool call Anthropic en 0,60 s) |
| Throughput en batch concurrente 4x | 75,1 tok/s agregados |
| Prefix caching multi-turno (APC) | 26.106 tok/s en prefill cacheado (turno 2 de 10.653 tokens en 2,08 s frente a 7,59 s en frio) |

No se han publicado resultados de MMLU, HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: unos 26 GB para esta cuantizacion 8-bit, mas 397 MB opcionales del drafter MTP.
- Hardware recomendado: Mac Studio o MacBook Pro con 48 GB o mas de memoria unificada.
- Para Macs de 24 a 36 GB, el autor recomienda la variante MLX 4-bit (14 GB).
- No esta pensado para GPU NVIDIA: el formato es MLX nativo para Apple Silicon. Existen variantes NVFP4 (19,53 GB) y BF16 (~50 GB) para otros entornos.
- Despliegue: `mlx-vlm` 0.8.1 o superior, con servidor local (`mlx_vlm.server`) que soporta prefix caching (APC) y decodificacion especulativa (`--draft-kind dflash`).
- Integracion directa con Claude Code mediante variables de entorno (`ANTHROPIC_BASE_URL`, `ANTHROPIC_MODEL`).
- Latencia y throughput: ver tabla de benchmarks; 56,9 tok/s en codigo y 69-134,5 tok/s en turnos concisos sobre M5 Ultra.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato/plataforma | Notas |
|---|---|---|---|---|---|
| Jah 8.0 MLX 8-bit | 26,39B (MoE) | 1.048.576 | Apache 2.0 | MLX safetensors, Apple Silicon | Especializado en ciberseguridad y codigo agentico; vision |
| Jah 8.0 MLX 4-bit | 26,39B (MoE) | 1.048.576 | Apache 2.0 | MLX, Apple Silicon | Misma familia, 14 GB, para Macs de 24-36 GB |
| Jah 8.0 NVFP4 | 26,39B (MoE) | 1.048.576 | Apache 2.0 | NVFP4 | 19,53 GB, orientado a GPU NVIDIA |
| Jah 8.0 BF16 (maestro) | 26,39B (MoE) | 1.048.576 | Apache 2.0 | safetensors BF16 | ~50 GB, referencia de calidad |

No se dispone en la informacion proporcionada de comparaciones con modelos de otros fabricantes (por ejemplo, Llama, Qwen o Mistral) en parametros, contexto o rendimiento.

## Limitaciones y advertencias

- Solo soporta ingles; no hay evidencia de capacidades multilingues.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: ecosistema y validacion externa practicamente inexistentes.
- Los benchmarks publicados son internos y autoinformados por el autor; no se han verificado de forma independiente.
- El contexto nativo de 1M tokens puede degradar la calidad en usos que superen ampliamente el rango evaluado (las pruebas publicadas usan ventanas de hasta ~10.653 tokens en multi-turno).
- Riesgo de alucinacion inherente a los modelos generativos, especialmente en dominios de ciberseguridad donde una conclusion erronea puede tener consecuencias operativas.
- La cuantizacion 8-bit, aunque el autor la describe como practicamente identica a BF16, puede introducir degradaciones menores frente al maestro.
- Requiere hardware Apple Silicon con 48 GB o mas de memoria unificada para esta variante; no es desplegable en GPU NVIDIA sin usar otra variante.
- Licencia Apache 2.0 permite uso comercial, pero el usuario debe evaluar por su cuenta el cumplimiento y la idoneidad para entornos regulados.
- La model card incluye afirmaciones de marketing ("lossless-grade", "sovereign") que no deben tomarse como garantias tecnicas verificadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RMDWLLC/Jah-8.0-MLX-8bit
- Maestro BF16: https://huggingface.co/RMDWLLC/Jah-8.0
- Variante NVFP4: https://huggingface.co/RMDWLLC/Jah-8.0-NVFP4
- Variante MLX 4-bit: https://huggingface.co/RMDWLLC/Jah-8.0-MLX-4bit
- Drafter especulativo MTP: https://huggingface.co/RMDWLLC/Jah-8.0-MLX-MTP
- API privada Jah: https://rmdw.ai/jah-api
- Sitio del autor: https://rmdw.ai
- Sitio secundario: https://kiyomibot.ai
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
