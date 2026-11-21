# batsclamp/Huihui-Qwen3.8-27B-abliterated-FP8-v2

## Resumen

Huihui-Qwen3.8-27B-abliterated-FP8-v2 es una cuantización en FP8 del modelo huihui-ai/Huihui-Qwen3.8-27B-abliterated, publicada por el usuario batsclamp. Se trata de una variante "abliterated" del Qwen3.8-27B, es decir, con el comportamiento de rechazo eliminado mediante una intervención sobre los pesos, y posteriormente cuantizada a FP8 para su despliegue eficiente con vLLM. El modelo conserva la torre de visión y el cabezal MTP (multi-token prediction) del modelo original, lo que permite decodificación especulativa.

La relevancia de esta ficha radica en que huihui-ai solo publica pesos BF16 (55,6 GB) y una build GGUF, sin versión FP8 oficial. Esta cuantización reduce el peso a 29,09 GiB (31,24 GB) manteniendo intactas las capacidades multimodales y de tool calling, con un esquema de cuantización idéntico al de la release oficial Qwen/Qwen3.8-27B-FP8 (bloques 128×128, e4m3 estático en pesos y dinámico por token en activaciones).

La build fue requantizada el 2 de noviembre de 2026 para corregir dos defectos de la versión anterior: la corrupción de los pesos de normalización (redondeados a una rejilla de 2^-9) y una cobertura incorrecta de módulos de atención lineal que dejaba todos los `linear_attn.*` en BF16. La versión actual toma todos los tensores no cuantizados byte a byte del origen y cuantiza 400 módulos `Linear`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención completa y gated-delta-net (atención lineal), más torre de visión y cabezal MTP |
| Parametros totales | 27.781.427.952 (27,78 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens (configurado en el ejemplo de servicio) |
| Tipos de cuantizacion | FP8 e4m3 estático con bloques 128×128 en pesos; FP8 e4m3 dinámico por grupos de 128 tokens en activaciones; formato compressed-tensors (`float-quantized`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (8 shards, 29,09 GiB / 31,24 GB) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer híbrido de 27,78 mil millones de parámetros que combina 16 capas de atención completa con 48 capas de gated-delta-net (atención lineal), sumando 64 capas en total, más 64 bloques MLP. Incluye una torre de visión que habilita la modalidad image-text-to-text y un cabezal MTP (multi-token prediction) que actúa como drafter para decodificación especulativa. La revisión base es `739e3c5b89849f6c238ce1e5b70008612ae42cdd` (re-release upstream del 24 de agosto de 2026, con la ablación restringida a las capas 18-51).

La cuantización se realizó con llm-compressor (`FP8_BLOCK`), sin calibración (data-free). Se cuantizaron 400 módulos `Linear`: `q_proj`/`k_proj`/`v_proj`/`o_proj` de las 16 capas de atención completa, `in_proj_qkv`/`in_proj_z`/`out_proj` de las 48 capas de atención lineal, y `gate_proj`/`up_proj`/`down_proj` de los 64 MLP. Permanecen en BF16 `in_proj_a`/`in_proj_b`, `conv1d`, todas las normalizaciones, `embed_tokens`, `lm_head`, la torre de visión completa y el cabezal MTP. Los 799 tensores no cuantizados son byte-idénticos al origen, al igual que el tokenizer, los preprocesadores, la configuración de generación y la plantilla de chat. No se dispone de información sobre el dataset de entrenamiento original ni sobre el proceso de RLHF/DPO del modelo base.

## Capacidades

- Generación de texto y razonamiento con modo thinking configurable mediante `reasoning_effort` (valores aceptados: `xhigh`, `medium`, `low`) y `enable_thinking` on/off.
- Procesamiento de imagen y texto (pipeline image-text-to-text) gracias a la torre de visión conservada en BF16.
- Tool calling / function calling con formato XML de Qwen; requiere el parser `qwen3_coder` en vLLM. Probado con llamadas simples, paralelas, multi-turno con resultado de herramienta y código Python dentro de un argumento de herramienta en streaming (15/15 correctas).
- Salida estructurada con JSON-schema.
- Decodificación especulativa mediante MTP (k=3), con longitud media de aceptación de 2,5 a 3,9.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Comportamiento de rechazo eliminado (abliterated), lo que afecta a las propiedades de seguridad.

## Casos de uso

- Asistencia conversacional multi-turno con contexto largo: con 262.144 tokens de ventana y una caché KV de 28,4 GiB en GB10 que permite ~412k tokens (1,57× concurrencia a 262k), puede mantener sesiones extensas con historial completo sin truncamiento.
- Agentes con tool calling en producción: la integración verificada con el parser `qwen3_coder` y `--enable-auto-tool-choice` permite construir agentes que invocan funciones, encadenan llamadas y procesan resultados de herramientas en flujos multi-paso.
- Procesamiento de documentos con imagen: al conservar la torre de visión, puede extraer información de capturas, diagramas o formularios combinados con instrucciones textuales.
- Generación de código asistida: el soporte de tool calling con código Python dentro de argumentos en streaming lo hace apto para pipelines de CI/CD que invocan herramientas de ejecución o linting.
- Razonamiento con presupuesto controlado: los niveles `low`/`medium`/`xhigh` permiten ajustar el coste computacional por consulta según la dificultad, útil en sistemas con SLA estrictos.
- Salida estructurada para integración de sistemas: la generación con JSON-schema facilita la extracción de datos y la alimentación de APIs descendentes sin post-procesado frágil.
- Despliegue en hardware con memoria limitada: con 29,09 GiB de pesos, cabe en aceleradores de 32 GB o superiores, a diferencia de los 55,6 GB del BF16 original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor indica explícitamente que no reclama cifras de perplejidad ni de suites de benchmark; la verificación fue estructural (tensor por tensor) y funcional (generación y tool calling en vLLM).

Mediciones de serving en una DGX Spark (GB10) con vLLM 0.32.0rc1, `--max-model-len 262144`, MTP k=3, `--gpu-memory-utilization 0.55`:

| Metrica | Valor |
|---|---|
| Pesos residentes | 29,5 GiB |
| Cache KV | 28,4 GiB (~412k tokens, 1,57× concurrencia a 262k) |
| Decode, un solo stream, sin thinking | 14,3 tok/s |
| TTFT, prompt corto | 189 ms |
| Longitud media de aceptación MTP | 2,5-3,9 |
| Kernel | `CutlassFp8BlockScaledMMKernel` |

Comparación en la misma máquina e imagen: la build anterior decodificaba a 13,4 tok/s y el `Qwen/Qwen3.8-27B-FP8` oficial a 15,0 tok/s.

## Requisitos de hardware

- VRAM estimada para inferencia: 29,09 GiB de pesos en FP8; con caché KV y overhead, se midieron 29,5 GiB residentes de pesos y 28,4 GiB de caché KV con `--gpu-memory-utilization 0.55` en GB10.
- GPU recomendadas: DGX Spark (GB10) verificada; por tamaño, cualquier acelerador con 32 GB o más (A100 40/80 GB, H100, L40S, RTX 6000 Ada). No se ha verificado en GPUs consumer de 24 GB.
- Cabe en consumer GPU: no confirmado; los 29,09 GiB de pesos exceden los 24 GB de una RTX 4090 en FP8 sin offloading.
- Opciones de despliegue: vLLM (verificado, con `--speculative-config '{"method": "mtp", "num_speculative_tokens": 3}'`, `--reasoning-parser qwen3`, `--tool-call-parser qwen3_coder`); llama.cpp/Ollama no aplicables directamente a este formato FP8 compressed-tensors (existe build GGUF del modelo base en huihui-ai).
- Latencia y throughput: 14,3 tok/s en decode de un solo stream y 189 ms de TTFT en GB10; no se dispone de datos de throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| batsclamp/Huihui-Qwen3.8-27B-abliterated-FP8-v2 | 27,78 B | 262.144 | FP8 compressed-tensors, 29,09 GiB | Apache 2.0 | Abliterated, visión y MTP intactos; 14,3 tok/s en GB10 |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated | 27,78 B | no disponible | BF16 (55,6 GB) y GGUF | Apache 2.0 | Modelo base; sin FP8 oficial |
| Qwen/Qwen3.8-27B-FP8 | 27,78 B | no disponible | FP8, bloques 128×128 | Apache 2.0 | Release oficial sin abliteración; 15,0 tok/s en GB10 |

## Limitaciones y advertencias

- Modelo abliterated: el comportamiento de rechazo se ha eliminado upstream; las propiedades de seguridad no son las del release original de Qwen. No apto para aplicaciones donde se requieran filtros de contenido robustos sin capas adicionales.
- No se han publicado métricas de perplejidad ni benchmarks; la validación es estructural y funcional, no de calidad.
- Con `reasoning_effort: xhigh` el modelo puede consumir un presupuesto de salida muy grande dentro del bloque de razonamiento; si `max_tokens` es insuficiente se obtiene `finish_reason: length` y un `content` vacío. Comportamiento heredado del modelo stock, no específico de esta cuantización.
- La plantilla de chat solo acepta `reasoning_effort` con valores `xhigh`, `medium` y `low`; cualquier otro (`high`, `max`, `minimal`) provoca HTTP 400 en servidores compatibles con OpenAI. Es necesario mapear valores en un preludio Jinja.
- El parser de tool calls debe ser `qwen3_coder`, no `hermes`, por el formato XML de Qwen.
- La build anterior (previa al 2 de noviembre de 2026) tenía pesos de normalización corruptos y cobertura de módulos incorrecta; el historial del repo fue aplastado, por lo que commits antiguos fijados ya no están disponibles.
- Idiomas soportados no documentados; riesgo de rendimiento desigual fuera de los idiomas principales del modelo base.
- Riesgo de alucinación inherente a modelos de esta escala; no cuantificado en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de abliteración en el modelo original de Qwen implica que las salvaguardas eliminadas deben suplirse a nivel de aplicación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/batsclamp/Huihui-Qwen3.8-27B-abliterated-FP8-v2
- Modelo base: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Release oficial FP8 de referencia: https://huggingface.co/Qwen/Qwen3.8-27B-FP8
- Herramienta de cuantización llm-compressor: https://github.com/vllm-project/llm-compressor
