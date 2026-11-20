# nchapman/granite-4.0-1b-litert-lm

## Resumen

`nchapman/granite-4.0-1b-litert-lm` es una exportación cuantizada a 4 bits del modelo IBM Granite 4.0 1B, empaquetada en formato LiteRT-LM (`.litertlm`) para inferencia en dispositivo (Android, iOS, macOS, Linux y Windows) sobre GPU y CPU. No se trata de un modelo nuevo, sino de un artefacto de despliegue: el autor, nchapman, parte de los pesos originales de `ibm-granite/granite-4.0-1b` y aplica un pipeline de cuantización calibrada (GPTQ con acumulación de Hessiano en FP64, descenso coordenado Gauss-Seidel y QAT de RMSNorm) para producir un bundle de 992,5 MiB que conserva la calidad del modelo base con un tamaño apto para hardware de consumo.

La relevancia de esta ficha radica en que resuelve un problema concreto de ingeniería: Granite 4.0 1B emplea escalado muP (`embedding_multiplier=12`, `logits_scaling=8`) y presenta un pico de activación SwiGLU de aproximadamente 184k en la capa 4 que desborda FP16, lo que rompe la inferencia en Metal y WebGPU. El bundle fuerza `prefer_activation_type=fp32` para garantizar estabilidad numérica, algo que el propio autor documenta como corrección específica. Además, unifica `embed_tokens` y `lm_head` en INT8 para almacenar una única tabla de embeddings de 100k vocabulario, en lugar de duplicarla.

El resultado es un artefacto orientado a despliegue local y edge computing, con contexto dinámico configurable hasta 4.096 tokens y compatibilidad con el runtime `litert-lm >= 0.19.0`. La licencia Apache 2.0 se hereda del modelo base, lo que facilita su uso comercial. Es, por tanto, una pieza útil para quien necesite ejecutar Granite 4.0 1B en portátiles, móviles o dispositivos sin GPU dedicada, con métricas de rendimiento publicadas frente a llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Granite 4.0 1B, escalado muP) |
| Parametros totales | 1B (modelo base); pesos cuantizados a INT4/INT8 en el bundle |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Hasta 4.096 tokens, configurable en runtime (`--max-num-tokens 512..4096`) |
| Tipos de cuantizacion | INT4 simétrico calibrado block-32 en lineales del decoder; INT8 channelwise en embeddings y `lm_head`; activaciones FP32 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 (heredada de `ibm-granite/granite-4.0-1b`) |
| Formato de pesos | `.litertlm` (LiteRT-LM bundle) |

## Arquitectura y entrenamiento

El modelo base es IBM Granite 4.0 1B, un transformer decoder-only de aproximadamente 1.000 millones de parámetros con escalado muP (`embedding_multiplier=12`, `logits_scaling=8`). Esta exportación no reentrena el modelo, sino que cuantiza los 240 lineales del decoder directamente sobre la rejilla simétrica INT4 block-32 de LiteRT, con escalas en `bf16 -> fp16`. El proceso de calibración consta de cuatro etapas documentadas por el autor: (1) GPTQ con Cholesky y `actorder="static"`, acumulando el Hessiano en FP64 sobre 128 secuencias de 1.024 tokens del split `train` de `cnn_dailymail` sin solapamiento con el split de test; (2) descenso coordenado de Hessiano Gauss-Seidel monótono (H-CD) sobre la rejilla exacta de escalas por bloque, con una reducción del 90,0 % de la pérdida de reconstrucción del Hessiano frente a RTN y 0/240 capas con regresión; (3) QAT de `RMSNorm` con maestro en FP32 y divergencia KL contra el profesor BF16, teniendo en cuenta `logits_scaling=8.0`; y (4) unificación de `embed_tokens` y `lm_head` en INT8 para almacenar una sola tabla de 100k vocabulario.

La innovación técnica más destacable es la corrección de estabilidad numérica: el modelo base presenta un pico de activación SwiGLU de aproximadamente 184k en la capa 4 que desborda FP16 y provoca inestabilidad en Metal y WebGPU. El bundle fija `prefer_activation_type=fp32`, lo que permite inferencia estable en esos backends. Adicionalmente, el bundle usa operaciones compuestas de GPU de LiteRT y caché KV dinámica, de modo que un único archivo `.litertlm` sirve para distintos tamaños de contexto en runtime.

## Capacidades

- Generación de texto en inglés con calidad de modelo base de 1B.
- Razonamiento básico y respuesta a preguntas de conocimiento general.
- Generación de código y tareas de transformación de texto (resumen, reescritura).
- Soporte de conversaciones multi-turno con mensaje de sistema y configuración de sampler (temperatura, top-k, semilla).
- Contexto dinámico configurable en runtime hasta 4.096 tokens.
- Inferencia en dispositivo sobre GPU y CPU en Android, iOS, macOS, Linux y Windows.
- Compatibilidad con backends Metal y WebGPU gracias a la corrección de activaciones en FP32.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Resumen de documentos en local: el modelo se ha evaluado precisamente sobre CNN/DailyMail con `max_output_tokens=1024`, por lo que es adecuado para resumir artículos y correos en dispositivos sin conexión, con ROUGE-1 de 0,319 en la configuración publicada.
- Asistentes embebidos en aplicaciones móviles: el bundle de 992,5 MiB y el contexto dinámico de hasta 4.096 tokens permiten integrar un chat multi-turno en apps Android o iOS sin depender de la nube.
- Procesamiento de texto en el borde (edge computing): útil en escenarios con requisitos de privacidad o latencia donde no se puede enviar el texto a un servidor, ejecutando el modelo en CPU o GPU integrada.
- Generación de texto en portátiles de consumo: con 992,5 MiB de pesos, cabe en equipos con 8-16 GiB de RAM y permite decodificación a 151 tok/s en Apple M4 Max, suficiente para escritura asistida y borradores.
- Prototipado rápido de pipelines de NLP: la API Python de `litert-lm` y la CLI facilitan experimentar con prompts, samplers y longitudes de contexto sin infraestructura de servidor.
- Evaluación comparativa de runtimes: el repositorio `nchapman/litert-vs-llamacpp` y los benchmarks incluidos permiten comparar LiteRT-LM frente a llama.cpp en el mismo hardware para decidir el motor de despliegue.
- Filtrado y clasificación de texto en local: tareas de etiquetado, extracción o normalización en lotes pequeños donde la latencia de red es un cuello de botella.

## Benchmarks y rendimiento

Resultados publicados por el autor en Apple M4 Max (128 GiB), sobre 50 artículos congelados de test de CNN/DailyMail, `temperature=0`, `top_k=1`, `max_output_tokens=1024`, `max_num_tokens=4096`, comparando con llama.cpp (`7fce543`, Metal + FlashAttention):

| Motor | Backend | Cuantización | Tamaño (MiB) | Prefill med (tok/s) | Decode med (tok/s) | TTFT med (ms) | E2E med (s) | ROUGE-1 / 2 / L | Paradas por capacidad |
|---|---|---:|---:|---:|---:|---:|---:|---|---:|
| LiteRT-LM | gpu | `int4_block32_cal` (este modelo) | 992,5 | 2.457,9 | 151,0 | 363 | 1,828 | 0,319 / 0,134 / 0,203 | 0/50 |
| llama.cpp | gpu | `Q4_K_M` | 995,1 | 2.666,3 | 102,6 | 348 | 2,574 | 0,298 / 0,124 / 0,192 | 1/50 |
| llama.cpp | gpu | `Q8_0` | 1.672,3 | 2.726,6 | 75,7 | 351 | 3,068 | 0,332 / 0,141 / 0,216 | 0/50 |

Microbenchmark sintético en frío (`litert-lm benchmark --backend gpu --max-num-tokens 4096 --runs 3`):

| Configuración | Prefill (tok/s) | Decode (tok/s) | TTFT (ms) |
|---|---:|---:|---:|
| `p=512, d=128` | 3.313 | 162,1 | 161 |
| `p=1024, d=256` | 3.437 | 157,9 | 304 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible para este bundle.

## Requisitos de hardware

- VRAM/RAM estimada: aproximadamente 1 GiB para los pesos (992,5 MiB) más la caché KV dinámica; con contexto de 4.096 tokens y activaciones FP32, se recomienda al menos 2-3 GiB libres.
- GPU recomendadas: Apple Silicon (M1/M2/M3/M4) con Metal; GPUs integradas compatibles con WebGPU; el autor valida en Apple M4 Max con 128 GiB.
- Cabe en GPU de consumo: sí, en cualquier GPU con 4 GiB o más de memoria, y en portátiles con 8 GiB de RAM.
- Opciones de despliegue: `litert-lm >= 0.19.0` (CLI y API Python); no se documenta soporte de vLLM, TGI, Ollama o llama.cpp para este artefacto concreto (llama.cpp se usa solo como referencia comparativa con pesos GGUF del modelo base).
- Latencia y throughput: 151 tok/s de decodificación y 363 ms de TTFT en Apple M4 Max con contexto de 4.096 tokens; 162,1 tok/s de decodificación y 161 ms de TTFT en el microbenchmark `p=512, d=128`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `nchapman/granite-4.0-1b-litert-lm` (este) | 1B | 4.096 dinámico | INT4 block-32 + INT8 embeddings | Apache 2.0 | Hugging Face, formato `.litertlm` |
| `ibm-granite/granite-4.0-1b` (base) | 1B | no disponible en la información | BF16 original | Apache 2.0 | Hugging Face, safetensors |
| Granite 4.0 1B en llama.cpp `Q4_K_M` | 1B | 4.096 | GGUF Q4_K_M | Apache 2.0 | Conversión comunitaria, GGUF |
| Granite 4.0 1B en llama.cpp `Q8_0` | 1B | 4.096 | GGUF Q8_0 | Apache 2.0 | Conversión comunitaria, GGUF |

En la comparativa de rendimiento publicada, este bundle obtiene mayor velocidad de decodificación (151,0 tok/s) que llama.cpp `Q4_K_M` (102,6 tok/s) y `Q8_0` (75,7 tok/s) en el mismo hardware, con ROUGE-1 de 0,319 frente a 0,298 y 0,332 respectivamente, y sin paradas por límite de capacidad (0/50 frente a 1/50 en `Q4_K_M`).

## Limitaciones y advertencias

- Solo soporta inglés (`language: en`); no se documentan capacidades multilingües.
- Modelo de 1B parámetros: propenso a alucinaciones y a errores en razonamiento complejo, matemáticas avanzadas y código de producción.
- La cuantización INT4 introduce pérdida de calidad respecto al BF16 original, aunque el autor reporta 0/240 capas con regresión en la reconstrucción del Hessiano.
- El contexto máximo es de 4.096 tokens, insuficiente para documentos largos o conversaciones extensas.
- Requiere `litert-lm >= 0.19.0`; versiones anteriores no soportan las operaciones compuestas de GPU ni la caché KV dinámica.
- La corrección de estabilidad en Metal/WebGPU depende de forzar activaciones FP32, lo que incrementa el uso de memoria frente a FP16.
- No se documenta soporte de tool calling, agentes, visión ni audio; no debe asumirse.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar los términos del modelo base IBM Granite 4.0 1B y citar adecuadamente.

## Enlaces

- Hugging Face del bundle: https://huggingface.co/nchapman/granite-4.0-1b-litert-lm
- Modelo base: https://huggingface.co/ibm-granite/granite-4.0-1b
- Repositorio de conversión, calibración y benchmarks: https://github.com/nchapman/litert-vs-llamacpp
- Runtime LiteRT-LM: https://pypi.org/project/litert-lm/
