# pipecat-ai/phonellm-mini-alpha-2-fp8

## Resumen

PhoneLLM Mini Alpha 2 (FP8) es la versión cuantizada a 8 bits del modelo PhoneLLM Mini Alpha 2, desarrollado por pipecat-ai (Daily) para integrarse en pipelines de agentes de voz. Se trata de un ajuste fino supervisado de parámetros completos sobre NVIDIA Nemotron 3 Nano 30B-A3B, un modelo de arquitectura híbrida Mamba-Transformer con mezcla de expertos (MoE) de 31.577.940.288 parámetros totales (~31,6 B) y aproximadamente 3 B activos por token. El resultado es un modelo de texto orientado a conversación telefónica con soporte de tool calling, pensado para ser el componente de lenguaje de un agente de voz.

El problema que resuelve es concreto: en un agente de voz, la latencia del componente LLM domina la experiencia, y los modelos generalistas de gran tamaño no caben en los presupuestos de latencia ni de coste de una llamada telefónica. PhoneLLM reduce la huella mediante una MoE con pocos parámetros activos y añade una cuantización FP8 (NVIDIA Model Optimizer, configuración `MAMBA_MOE_FP8_AGGRESSIVE_CFG`) que deja el checkpoint en unos 33 GB manteniendo en bf16 solo el `lm_head`, las seis capas de atención y las proyecciones de seis capas Mamba. Incluye además escalas FP8 de KV-cache.

Es relevante ahora por dos motivos: primero, porque demuestra que un MoE híbrido de ~31 B puede servir como backend de voz con tool calling en una sola GPU Hopper o Blackwell; segundo, porque su licencia BSD 2-Clause (con la licencia NVIDIA subyacente para el trabajo derivado) permite uso comercial sin las restricciones habituales de los modelos abiertos de gran escala. El pensamiento (thinking) viene desactivado por defecto y el modelo se entrenó sin razonamiento explícito, de modo que responde y emite tool calls de forma directa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba-Transformer con mezcla de expertos (MoE); tag de arquitectura `nemotron_h` |
| Parametros totales | 31.577.940.288 (~31,6 B) |
| Parametros activos | ~3 B (según la nomenclatura A3B del modelo base; no confirmado de forma explícita en la información disponible) |
| Longitud de contexto | 32.768 tokens (según la receta de despliegue en vLLM, `--max-model-len 32768`) |
| Tipos de cuantizacion | FP8 (ModelOpt, `MAMBA_MOE_FP8_AGGRESSIVE_CFG`); `lm_head`, 6 capas de atención y proyecciones de 6 capas Mamba en bf16; escalas FP8 de KV-cache incluidas |
| Idiomas soportados | Inglés (`en`) |
| Licencia | BSD 2-Clause para el modelo y sus modificaciones; el trabajo base Nemotron 3 Nano 30B-A3B queda bajo NVIDIA Nemotron Open Model License |
| Formato de pesos | safetensors (librería `transformers`, requiere `trust_remote_code`), tamaño de repositorio ~32,7 GB |
| Modelo base | pipecat-ai/phonellm-mini-alpha-2 (a su vez ajuste de nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16) |
| Relación con el base | Quantized (cuantización posterior al entrenamiento) |
| Nombre de pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura subyacente es Nemotron 3 Nano 30B-A3B, un diseño híbrido que combina capas de atención con capas de espacio de estados (Mamba) dentro de un esquema de mezcla de expertos. La cuantización FP8 aplicada con NVIDIA Model Optimizer convierte a FP8 todas las capas lineales excepto el `lm_head`, seis capas de atención y las proyecciones de seis capas Mamba, que permanecen en bf16; se incluyen además escalas FP8 para la KV-cache. El proceso de calibración usó 1.000 turnos de asistente extraídos de 288 conversaciones del conjunto de entrenamiento de PhoneLLM.

PhoneLLM Mini Alpha 2 se construyó mediante un ajuste fino supervisado de parámetros completos (full-parameter SFT) sobre el modelo Nemotron, especializándolo en conversación telefónica con uso de herramientas. No se documenta en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO. Un detalle de diseño relevante es que el modelo se entrenó sin razonamiento explícito: la plantilla `chat_template.jinja` incluida define `enable_thinking` a `false` por defecto, y la recomendación del autor es servir el modelo sin parser de razonamiento para que las respuestas y las llamadas a herramientas se analicen directamente. El autor indica que la cuantización FP8 se ejecuta en GPUs Hopper (H100, H200) y Blackwell.

## Capacidades

- Generación de texto conversacional orientada a diálogo telefónico multi-turno, con la plantilla de chat incluida.
- Tool calling y function calling nativos: la receta de vLLM usa `--enable-auto-tool-choice` con el parser `qwen3_coder`.
- Respuestas y tool calls directas, sin bloque de razonamiento intermedio, lo que simplifica el parseo en producción.
- Integración con pipelines de agentes de voz (etiquetas `voice-agent`, `phone`, `pipecat`), presumiblemente como el componente de lenguaje tras un ASR y delante de un TTS.
- Funcionamiento determinista recomendado con `temperature=0`, adecuado para flujos de agente reproducibles.
- Multilingüismo: solo inglés (`en`) según la ficha.
- Capacidades de visión, audio o modo thinking: no disponibles (el thinking está desactivado por diseño).

## Casos de uso

- Atención telefónica automatizada: el modelo gestiona diálogos multi-turno en inglés con hasta 32.768 tokens de contexto, suficiente para mantener el historial de una llamada larga junto con metadatos de CRM o resultados de herramientas.
- Reserva y gestión de citas por voz: con tool calling nativo, el agente invoca funciones de calendario, verifica disponibilidad y confirma la cita dentro de la misma conversación.
- Soporte de primer nivel con escalado a humano: el modelo puede ejecutar herramientas de consulta de estado de pedido o incidencia y decidir cuándo transferir la llamada según la lógica de la aplicación.
- Encuestas y verificaciones salientes (outbound): al ser un modelo pequeño en parámetros activos y servible en una sola GPU, permite mantener 128-256 peticiones en vuelo por GPU para campañas de llamadas concurrentes.
- Verificación de identidad y recogida estructurada de datos: el tool calling permite validar campos y registrar la información en un backend mientras se mantiene la conversación.
- Enrutamiento y triaje de llamadas: clasificación de la intención del usuario y derivación a un flujo o departamento concreto, con salidas cortas y latencia baja.
- Asistentes internos de soporte técnico por teléfono: consulta de bases de conocimiento mediante herramientas y respuesta hablada breve, con el historial completo de la sesión en contexto.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card menciona PhoneBench como métrica interna (indica que en PhoneLLM Alpha 1 el uso de KV-cache NVFP4 costó 0,5 puntos de PhoneBench, mientras que la KV en bf16 quedaba a 0,04 del modelo bf16), pero no incluye puntuaciones absolutas para esta versión. El autor señala explícitamente que el throughput no se ha medido todavía más allá de una prueba de humo en vLLM 0.30 sobre una única B200.

## Requisitos de hardware

- El repositorio pesa aproximadamente 32,7 GB en FP8, por lo que los pesos por sí solos superan la VRAM de cualquier GPU de consumo actual (RTX 4090 con 24 GB, RTX 5090 con 32 GB).
- La cuantización FP8 requiere GPUs Hopper (H100, H200) o Blackwell (B200 y posteriores) para aprovechar el cálculo en FP8.
- Configuración mínima razonable: una GPU de 80 GB (H100 80 GB, H200, B200) con `--gpu-memory-utilization 0.90`; con una GPU de 48 GB habría que valorar reducir contexto o número de secuencias, dato no confirmado por el autor.
- Opciones de despliegue documentadas: vLLM 0.30 con `--trust-remote-code`, `--max-num-seqs 256`, `--enable-prefix-caching`, `--async-scheduling` y `--mamba-ssm-cache-dtype float32`; también es cargable con `transformers`.
- No se mencionan formatos GGUF ni soporte para llama.cpp, Ollama o TGI en la información disponible.
- Recomendaciones de rendimiento del autor: no usar `--enforce-eager` (los CUDA graphs son entre 5 y 7 veces más rápidos en decodificación en este modelo) y mantener 128-256 peticiones en vuelo por GPU para cargas por lotes.
- Sobre la KV-cache: hay que fijar `--kv-cache-dtype bfloat16` explícitamente, porque el checkpoint incluye escalas FP8 y, sin ese flag, vLLM usaría FP8 de forma silenciosa. La KV en FP8 alberga aproximadamente un 40 % más de tokens, a cambio de una pérdida estimada de 0,5 puntos de PhoneBench según la experiencia con Alpha 1.
- Latencia y throughput: no disponibles; el autor indica que no se han medido.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PhoneLLM Mini Alpha 2 (FP8) | 31,6 B totales / ~3 B activos | 32.768 tokens | FP8 (parcial bf16) | BSD 2-Clause (+ licencia NVIDIA para el trabajo base) | HuggingFace, vLLM, transformers |
| PhoneLLM Mini Alpha 2 (bf16) | 31,6 B totales / ~3 B activos | No disponible | bf16 | BSD 2-Clause (+ licencia NVIDIA) | HuggingFace |
| NVIDIA Nemotron 3 Nano 30B-A3B | 30 B totales / ~3 B activos | No disponible | BF16 | NVIDIA Nemotron Open Model License | HuggingFace |
| PhoneLLM Max Alpha 2 | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks comparativos entre estas variantes en la información proporcionada. La diferencia principal entre Mini y Max es, según el autor, velocidad frente a precisión.

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte de inglés; no hay evidencia de capacidades multilingües.
- Razonamiento: el modelo se entrenó sin modo thinking y la plantilla lo desactiva por defecto; añadir un parser de razonamiento puede hacer que las tool calls se clasifiquen erróneamente bajo `reasoning`.
- Temperatura: el autor recomienda `temperature=0`; no se documenta el comportamiento con temperaturas altas.
- Alucinación: no se han publicado evaluaciones de fidelidad factual ni tasas de alucinación; como modelo conversacional, es previsible que genere información plausible pero incorrecta si no se ancla con herramientas.
- Sesgos: no se documenta ningún análisis de sesgos ni de composición del dataset de entrenamiento.
- Licencia: el modelo se distribuye bajo BSD 2-Clause, pero al ser obra derivada de Nemotron 3 Nano 30B-A3B, cualquier redistribución debe (a) incluir una copia de la NVIDIA Nemotron Open Model License y (b) conservar los avisos de copyright y atribución de NVIDIA. Conviene revisar esas obligaciones antes de un despliegue comercial.
- Cuantización: es una cuantización posterior al entrenamiento (PTQ), por lo que puede haber una degradación de precisión no cuantificada respecto al modelo bf16; el propio autor reconoce que no ha publicado comparativas numéricas para esta versión.
- Hardware: al requerir FP8 sobre Hopper o Blackwell, no es desplegable en GPUs de consumo ni en arquitecturas más antiguas sin reconvertir los pesos.
- Madurez: el modelo está etiquetado como "alpha 2" y tiene 0 descargas y 0 likes en el momento de la consulta; el propio autor describe la receta de vLLM como "smoke-tested" y sin benchmarks de throughput.
- Longitud de contexto: aunque la receta usa 32.768 tokens, no se documenta cómo se comporta el modelo cerca de ese límite en tareas de tool calling.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pipecat-ai/phonellm-mini-alpha-2-fp8
- Modelo base (PhoneLLM Mini Alpha 2): https://huggingface.co/pipecat-ai/phonellm-mini-alpha-2
- Modelo base original (NVIDIA Nemotron 3 Nano 30B-A3B): https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16
- Blog de PhoneLLM Alpha 2: https://www.daily.co/blog/phonellm-alpha-2/
- Licencia del modelo (BSD 2-Clause): https://huggingface.co/pipecat-ai/phonellm-mini-alpha-2-fp8/blob/main/LICENSE
- Licencia del modelo base NVIDIA: https://huggingface.co/pipecat-ai/phonellm-mini-alpha-2-fp8/blob/main/LICENSE_NVIDIA.txt

Nota: los resultados de búsqueda web devueltos para esta consulta corresponden a servicios de traducción y diccionarios, sin relación con el modelo, por lo que no aportan enlaces adicionales utilizables.
