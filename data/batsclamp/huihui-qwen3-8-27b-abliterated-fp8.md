# batsclamp/Huihui-Qwen3.8-27B-abliterated-FP8

## Resumen

Huihui-Qwen3.8-27B-abliterated-FP8 es una cuantización en FP8 del modelo Huihui-Qwen3.8-27B-abliterated, publicado por el usuario batsclamp. Se trata de una versión "abliterated" del Qwen3.8-27B, es decir, con el comportamiento de rechazo eliminado mediante una modificación de los pesos del modelo base, y posteriormente cuantizada a FP8 para su despliegue eficiente en vLLM. El modelo es multimodal (image-text-to-text) y está pensado para servir en producción con un consumo de memoria reducido respecto a los pesos BF16 originales (55,6 GB frente a 29,09 GiB).

La arquitectura es un transformer híbrido de la familia Qwen3.5, con 64 capas que combinan 16 capas de atención completa y 48 capas de atención lineal basada en gated-delta-net. El modelo tiene 27.781.427.952 parámetros totales y una longitud de contexto de hasta 262.144 tokens. Incorpora además una torre de visión y una cabeza MTP (multi-token prediction) que permite decodificación especulativa nativa.

La relevancia de esta ficha radica en que ofrece una ruta de despliegue práctica para un modelo de 27B con contexto largo en hardware relativamente asequible, manteniendo intactas las capacidades de visión, tool calling y decodificación especulativa. La cuantización fue verificada tensor a tensor contra los pesos fuente y probada en vLLM con distintos niveles de esfuerzo de razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención completa + gated-delta-net), familia Qwen3.5 |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | FP8 e4m3 estático con bloques 128×128 en pesos; FP8 e4m3 dinámico por token en activaciones; sin calibración (data-free) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, formato compressed-tensors (float-quantized), 8 shards, 29,09 GiB |

## Arquitectura y entrenamiento

El modelo base es un transformer híbrido de la familia Qwen3.5 con 64 capas: 16 capas de atención completa y 48 capas de atención lineal basadas en gated-delta-net. La cuantización FP8 afecta a 400 módulos `Linear`: las proyecciones `q_proj`/`k_proj`/`v_proj`/`o_proj` de las 16 capas de atención completa, las proyecciones `in_proj_qkv`/`in_proj_z`/`out_proj` de las 48 capas de atención lineal, y `gate_proj`/`up_proj`/`down_proj` de las 64 MLPs. Se mantienen en BF16 `in_proj_a`/`in_proj_b`, `conv1d`, todas las normas, `embed_tokens`, `lm_head`, la torre de visión completa y la cabeza MTP.

La cuantización se realizó con llm-compressor (esquema `FP8_BLOCK`), sin calibración, y replica el mismo esquema y cobertura de módulos que la release oficial Qwen/Qwen3.8-27B-FP8. La revisión v2 (2026-11-02) corrige dos defectos de la build anterior: pesos de normalización corruptos por redondeo en BF16 y cobertura incorrecta de los módulos de atención lineal. En esta build, todos los tensores no cuantizados son idénticos byte a byte a los pesos fuente (799 tensores verificados), incluidos tokenizer, configuraciones de preprocesado, configuración de generación y plantilla de chat.

El modelo incorpora una cabeza MTP que permite decodificación especulativa con vLLM (método `mtp`), con una longitud media de aceptación medida de 2,5 a 3,9 tokens. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" configurable mediante `reasoning_effort` (valores aceptados: `xhigh`, `medium`, `low`) y `enable_thinking` on/off.
- Procesamiento de imagen y texto (pipeline image-text-to-text) gracias a la torre de visión intacta en BF16.
- Tool calling y function calling con formato XML de Qwen; requiere el parser `qwen3_coder` en vLLM.
- Soporte de tool calls en paralelo, multi-turno con resultado de herramienta y código Python dentro de argumentos de herramienta en streaming (15/15 pruebas superadas según la model card).
- Salida estructurada con JSON-schema.
- Decodificación especulativa nativa mediante la cabeza MTP.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo agente y razonamiento multi-paso a través del modo thinking y tool calling.
- Comportamiento de rechazo eliminado (abliterated): el modelo no presenta las negativas típicas del modelo original.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a sus 262.144 tokens de ventana, manteniendo el hilo de la conversación y el historial de herramientas invocadas sin truncamientos frecuentes.
- Generación de código en producción: soporta tool calling con parser `qwen3_coder` y puede integrarse en pipelines de CI/CD para generar parches, explicar errores o invocar herramientas de build y test a través de function calling.
- Asistentes con acceso a herramientas externas: la combinación de tool calling paralelo, salida estructurada JSON-schema y razonamiento multi-paso permite construir agentes que consultan APIs, bases de datos o servicios internos y sintetizan la respuesta.
- Análisis de documentos e imágenes: al conservar la torre de visión, puede procesar capturas, diagramas o documentos escaneados junto con instrucciones textuales para extracción de información o resumen.
- Despliegue en hardware de gama alta con memoria limitada: la cuantización FP8 reduce los pesos a 29,09 GiB, lo que permite servir el modelo en una única GPU con suficiente VRAM (por ejemplo, GB10 en DGX Spark) dejando espacio para una caché KV de 28,4 GiB (unos 412k tokens).
- Generación de documentación técnica y resúmenes de contexto largo: con 262k tokens de contexto puede ingerir repositorios completos o documentación extensa y producir resúmenes o respuestas contextualizadas.
- Investigación sobre alineación y comportamiento de modelos: la variante abliterated permite estudiar el efecto de la eliminación del rechazo en las respuestas, comparándola con el modelo original.
- Servicio de inferencia de baja latencia con decodificación especulativa: la cabeza MTP con k=3 ofrece una longitud media de aceptación de 2,5 a 3,9 tokens, lo que mejora el throughput de decodificación en vLLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card indica explícitamente que no se reclaman números de perplejidad ni de suites de benchmarks; la verificación fue estructural (tensor a tensor) y mediante pruebas de generación y tool calling en vLLM.

Mediciones de serving en una DGX Spark (GB10) con vLLM 0.32.0rc1, `--max-model-len 262144`, MTP k=3 y `--gpu-memory-utilization 0.55`:

| Metrica | Valor |
|---|---|
| Pesos residentes | 29,5 GiB |
| Cache KV | 28,4 GiB (~412k tokens, 1,57× concurrencia a 262k) |
| Decodificacion, un solo stream, sin thinking | 14,3 tok/s |
| TTFT, prompt corto | 189 ms |
| Longitud media de aceptacion MTP | 2,5-3,9 |
| Kernel | CutlassFp8BlockScaledMMKernel |

Comparativa medida en el mismo equipo e imagen: la build anterior decodificaba a 13,4 tok/s y el Qwen/Qwen3.8-27B-FP8 oficial a 15,0 tok/s.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 29,5 GiB de pesos residentes en FP8, más la caché KV. Con 28,4 GiB de caché KV se alcanzan unos 412k tokens de capacidad a 262k de contexto.
- GPU recomendadas: DGX Spark (GB10) verificada en la model card; por tamaño de pesos, cualquier GPU con al menos 32 GB de VRAM efectiva para pesos y margen para caché KV (por ejemplo, A100 40/80 GB, H100, L40S). No se han publicado pruebas en RTX 4090 ni en GPUs consumer de 24 GB.
- Cabe en consumer GPU: no confirmado. Con 29,09 GiB de pesos en FP8, una RTX 4090 de 24 GB no puede alojar los pesos completos sin offloading; no se dispone de datos de despliegue en consumer.
- Opciones de despliegue: vLLM es el backend soportado y probado (kernel CutlassFp8BlockScaledMMKernel, MTP especulativo, parser `qwen3_coder`, `--reasoning-parser qwen3`). El formato compressed-tensors FP8 está orientado a vLLM; no se mencionan builds GGUF ni soporte de llama.cpp u Ollama para esta cuantización.
- Latencia y throughput: TTFT de 189 ms con prompt corto y 14,3 tok/s en decodificación de un solo stream sin thinking en DGX Spark (GB10).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| batsclamp/Huihui-Qwen3.8-27B-abliterated-FP8 | 27,78B | 262.144 | FP8 bloques 128×128 | Apache 2.0 | Abliterated, vision, MTP; 14,3 tok/s en GB10 |
| Qwen/Qwen3.8-27B-FP8 | 27,78B (misma base) | 262.144 | FP8 bloques 128×128 | Apache 2.0 | Modelo oficial sin abliterar; 15,0 tok/s en GB10 |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated | 27,78B | 262.144 | BF16 (55,6 GB) y GGUF | Apache 2.0 | Modelo fuente sin cuantizar; mayor consumo de memoria |

## Limitaciones y advertencias

- Modelo abliterated: el comportamiento de rechazo ha sido eliminado en el modelo base, por lo que las propiedades de seguridad no son las del Qwen original. No es adecuado para aplicaciones que requieran filtrado de contenido integrado.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual ni de benchmarks; el riesgo es el propio de un modelo de 27B sin datos de evaluación disponibles.
- Con `reasoning_effort: xhigh` el modelo puede consumir un presupuesto de salida muy grande dentro del bloque de razonamiento. Si se limita `max_tokens` por debajo de lo necesario, se obtiene `finish_reason: length` y un campo `content` vacío.
- La plantilla de chat solo acepta los valores `xhigh`, `medium` y `low` en `reasoning_effort`; cualquier otro valor (`high`, `max`, `minimal`) provoca un error que en un servidor compatible con OpenAI se traduce en HTTP 400. Es necesario mapear los valores en un preludio Jinja si el cliente envía otros.
- El parser de tool calling debe ser `qwen3_coder` (no `hermes`) para que el formato XML de Qwen se procese correctamente.
- La verificación de la cuantización es estructural y funcional, pero no se aportan métricas de perplejidad ni de benchmarks que confirmen la degradación respecto al modelo BF16.
- Idiomas soportados no especificados: no hay información sobre cobertura multilingüe.
- La build anterior a 2026-11-02 tenía pesos de normalización corruptos y cobertura incorrecta de módulos de atención lineal; si se descargó antes de esa fecha, debe descargarse de nuevo. El historial del repositorio fue aplastado, por lo que los commits antiguos ya no están en ninguna rama.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de rechazo en el modelo abliterated puede tener implicaciones legales o de cumplimiento según el contexto de despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/batsclamp/Huihui-Qwen3.8-27B-abliterated-FP8
- Modelo base abliterated: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Release oficial FP8 de Qwen: https://huggingface.co/Qwen/Qwen3.8-27B-FP8
- llm-compressor (herramienta de cuantización): https://github.com/vllm-project/llm-compressor
- vLLM (backend de serving): no disponible en la información proporcionada como enlace explícito
- Paper o blog del modelo base Qwen3.8-27B: no disponible en la información proporcionada
- Demo o espacio de Hugging Face: no disponible en la información proporcionada
