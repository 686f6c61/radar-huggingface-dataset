# eins78/Kolibri-1-mlx-mixed-4-8-bit

## Resumen

Kolibri-1-mlx-mixed-4-8-bit es una cuantizacion en formato MLX del modelo Kolibri-1 de Aleph Alpha, desarrollada por el usuario eins78 mediante la herramienta kolibri-mlx. El modelo original es un transformer de mezcla de expertos (MoE) de 78.103.074.560 parametros totales, disenado para generacion de texto y conversacion en aleman e ingles. Esta version cuantizada reduce el peso en disco a 42 GiB y permite ejecutar el modelo en Macs con 64 GB de memoria unificada, algo inviable con los pesos originales en FP8.

La relevancia de esta ficha radica en que el modelo no es cargable con mlx-lm estandar: requiere registrar la arquitectura `kolibri1` mediante el paquete externo kolibri-mlx. Ademas, la cuantizacion mixta aplicada (4 bits para expertos enrutados, 8 bits para atencion, experto compartido, embeddings y `lm_head`, y bfloat16 para las compuertas del router) introduce una perdida de precision medible que el autor documenta con detalle en su proceso de verificacion. Es, por tanto, una opcion practica para inferencia local en Apple Silicon, no un sustituto exacto del modelo original.

El contexto de este lanzamiento es la creciente demanda de ejecutar modelos MoE de gran tamano en hardware de consumo. Kolibri-1 emplea atencion de ventana deslizante de 513 tokens con un patron 4:1 entre capas deslizantes y completas, lo que reduce el coste de atencion en contextos largos. Esta version cuantizada hace accesible esa arquitectura a desarrolladores con estaciones de trabajo Mac, a cambio de asumir cierta degradacion en la fidelidad de la distribucion de tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (50 capas, 384 expertos, 6 enrutados + 1 compartido por token, atencion de ventana deslizante 513 tokens en patron 4:1) |
| Parametros totales | 78.103.074.560 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (ventana deslizante de 513 tokens por capa; contexto total no especificado) |
| Tipos de cuantizacion | Mixta: 4 bits (expertos enrutados `switch_mlp.*`), 8 bits (proyecciones de atencion, experto compartido, embeddings, `lm_head`), bfloat16 (compuertas `mlp.gate`); grupo de 64, afin afin |
| Idiomas soportados | aleman (de), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX, mlx-lm 0.32.0) |

## Arquitectura y entrenamiento

El modelo base Kolibri-1 es un transformer de mezcla de expertos con 50 capas y 384 expertos, de los cuales se activan 6 enrutados mas 1 compartido por token. La atencion combina ventanas deslizantes de 513 tokens con capas de atencion completa en una proporcion 4:1, lo que limita el coste computacional en secuencias largas. Los pesos originales se distribuyen en FP8 con escalas de bloque 128x128, y esta version los convierte a cuantizacion afin mixta en MLX.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en la informacion proporcionada. El autor de la cuantizacion valido la dequantizacion FP8 contra la release BF16 de Aleph Alpha (1362 tensores FP8 del shard 1, error maximo del 3,6 % del maximo del tensor, consistente con redondeo e4m3; tensores bf16 identicos bit a bit). La innovacion tecnica destacable de esta ficha es el esquema de cuantizacion mixta por modulo, que preserva en 8 bits las partes sensibles (atencion, embeddings, `lm_head`) y mantiene el router en bfloat16 para no degradar la seleccion de expertos.

## Capacidades

- Generacion de texto y conversacion multi-turno en aleman e ingles.
- Razonamiento explicito con modo `thinking`: el modelo emite `<think>...</think>` antes de la respuesta, controlable mediante `reasoning_effort` (`"none"`, `"low"`, `"medium"`, `"high"`) o `enable_thinking=false`.
- Tool calling / function calling con formato Hermes: `<tool_call>{"name": ..., "arguments": ...}</tool_call>`, devuelto como `tool_calls` por el parser `json_tools` de mlx-lm.
- Soporte de agentes y razonamiento multi-paso a traves de la combinacion de thinking mode y tool calls.
- Capacidades multilingues limitadas a aleman e ingles.
- Servidor compatible con OpenAI (`serve.py`) para integracion en pipelines existentes.
- No se documentan capacidades de vision, audio ni otras modalidades en la informacion disponible.

## Casos de uso

- Asistencia conversacional en aleman e ingles: el modelo gestiona dialogos multi-turno con plantilla de chat y modo de razonamiento configurable, adecuado para chatbots de soporte en mercados DACH y anglosajones.
- Generacion de codigo con tool calling: puede integrarse en pipelines de CI/CD o asistentes de IDE que invoquen funciones externas mediante el formato Hermes, devolviendo llamadas estructuradas que el orquestador ejecuta.
- Agentes multi-paso en local: la combinacion de thinking mode y tool calls permite construir agentes que razonan, invocan herramientas y refinan respuestas sin salir de una Mac con 64 GB, evitando costes de API.
- Procesamiento de documentos largos por ventanas: el patron de atencion deslizante 4:1 permite manejar entradas extensas con coste de atencion acotado, util para resumen y extraccion sobre textos de varios miles de tokens.
- Prototipado e investigacion en Apple Silicon: investigadores sin acceso a GPU CUDA pueden reproducir experimentos con un MoE de 78 000 millones de parametros a 50 tokens/s en un M4 Pro de 64 GB.
- Despliegue de servidor OpenAI-compatible en infraestructura Mac: `serve.py` expone una API compatible con el cliente de OpenAI, lo que permite sustituir backends remotos por inferencia local en entornos con requisitos de privacidad.
- Evaluacion de cuantizacion: el modelo sirve como caso de estudio reproducible para medir el impacto de la cuantizacion mixta 4/8 bits frente a bf16, con scripts de verificacion publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor documenta verificaciones de fidelidad y rendimiento de inferencia:

| Metrica | Resultado |
|---|---|
| Acuerdo top-1 vs referencia (5 prompts) | 0.385 (13 tok), 0.867 (15), 0.958 (24), 0.966 (618), 0.892 (612) |
| Acuerdo top-1 bf16 sin cuantizar (mismos prompts) | 0.769, 0.933, 1.000, 0.968, 0.931 |
| Solapamiento top-5 | 0.754, 0.880, 0.925, 0.935, 0.875 |
| KL(referencia, este modelo) media por prompt | 0.526, 0.0146, 0.00996, 0.0174, 0.0690 |
| KL suelo bf16 | 0.490, 0.0057, 0.00067, 0.0082, 0.036 |
| MLX fp32 vs referencia (extremo a extremo) | top-1 1.000, KL ~1e-11, diferencia maxima de logits 2.3e-4 |
| Velocidad en Apple M4 Pro, 64 GB | 50 tokens/s generacion, ~240 tokens/s prompt, 45.4 GB pico |

## Requisitos de hardware

- Memoria unificada: aproximadamente 45,4 GB en pico; se requiere un Mac con 64 GB (el autor lo indica explicitamente).
- Tamano en disco: 42 GiB (repositorio de 45,3 GB).
- GPU compatibles: Apple Silicon con memoria unificada de 64 GB o superior; el autor probo en M4 Pro de 64 GB. No aplica a GPU CUDA en esta version MLX.
- No cabe en GPUs de consumo con VRAM dedicada (RTX 4090 de 24 GB, etc.) en este formato.
- Despliegue: mlx-lm 0.32.0 con el paquete externo kolibri-mlx (registro de arquitectura `kolibri1`); `generate.py` para CLI y `serve.py` para servidor OpenAI-compatible.
- Latencia y throughput medidos: 50 tokens/s de generacion y ~240 tokens/s de procesamiento de prompt en M4 Pro de 64 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kolibri-1-mlx-mixed-4-8-bit (esta ficha) | 78,1 B totales (MoE) | ventana 513 tok por capa, total no disponible | MLX safetensors | Apache 2.0 | Hugging Face, requiere kolibri-mlx |
| Aleph-Alpha/Kolibri-1 (original) | 78,1 B totales (MoE) | no disponible | FP8 y BF16 | Apache 2.0 | Hugging Face, requiere plugin vLLM con CUDA |
| Alternativas MoE de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otros modelos en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- Perdida de precision por cuantizacion: el acuerdo top-1 frente a la referencia cae respecto a bf16 (por ejemplo, 0.867 frente a 0.933 en el prompt de 15 tokens, y 0.385 frente a 0.769 en el de 13 tokens); la KL media es superior al suelo bf16 en todos los prompts.
- El prompt corto de 13 tokens es ruidoso incluso en bf16, segun el autor, por lo que las metricas en entradas muy breves no son fiables.
- No cargable con mlx-lm estandar: es obligatorio instalar kolibri-mlx y ejecutar `import kolibri_mlx.register` antes de cargar; `mlx_lm.load`, `mlx_lm.generate` y `mlx_lm.server` fallan sin ese registro.
- La verificacion se hizo contra una reconstruccion en PyTorch del plugin vLLM, no contra el plugin real, que requiere CUDA y no estaba disponible en la maquina del autor.
- Idiomas limitados a aleman e ingles; no se documenta soporte de castellano.
- Riesgo de alucinacion inherente a los modelos generativos; no se documentan evaluaciones de sesgo en la informacion disponible.
- Licencia Apache 2.0 permite uso comercial, pero la cuantizacion hereda las condiciones del modelo base; conviene revisar la model card original de Aleph Alpha.
- Requiere hardware Apple Silicon con 64 GB de memoria unificada; no es desplegable en GPU CUDA ni en GPUs de consumo con VRAM dedicada en este formato.
- Los resultados de evaluacion del autor (suites propias, temperatura 0, razonamiento desactivado) no equivalen a benchmarks estandar y no permiten comparacion directa con otros modelos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eins78/Kolibri-1-mlx-mixed-4-8-bit
- Modelo base: https://huggingface.co/Aleph-Alpha/Kolibri-1
- Repositorio kolibri-mlx: https://github.com/eins78/kolibri-mlx
- Script de verificacion por capas: https://github.com/eins78/kolibri-mlx/blob/main/scripts/verify_layerwise.py
- Script de verificacion extremo a extremo: https://github.com/eins78/kolibri-mlx/blob/main/scripts/verify_e2e.py
- Script de smoke test del servidor: https://github.com/eins78/kolibri-mlx/blob/main/scripts/smoke_server.py
- Documentacion de verificacion: https://github.com/eins78/kolibri-mlx#4-verification
