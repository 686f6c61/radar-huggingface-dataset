# Lottolabs/Inkling-2-Mini-TT-Mixed-BFP4-BFP8-P150

## Resumen

Inkling-2-Mini-TT-Mixed-BFP4-BFP8-P150 es un paquete de checkpoint y runtime personalizado publicado por Lottolabs para ejecutar el modelo thinkingmachines/Inkling-2-Mini sobre una única tarjeta Tenstorrent Blackhole P150 de 32 GB. No es una cuantización genérica al uso: los pesos se almacenan directamente en los formatos que el hardware P150 computa de forma nativa (block floating point BFP4 y BFP8), con las proyecciones de atención y los expertos enrutados cuantizados mediante GPTQ en la geometría de bloque BFP4. El paquete es específico de hardware y solo texto, y se sirve a través de la API compatible con OpenAI de vLLM dentro de una imagen Docker.

El modelo base, Inkling-2-Mini, es un transformer MoE de 26.400 millones de parámetros totales con 3.400 millones activos, 24 capas (las capas 6 a 17 se ejecutan tres veces, dando 48 aplicaciones de capa por token), 128 expertos con top-8 en cada capa, atención completa en las capas 5, 11, 17 y 23, ventanas deslizantes de 1.024 tokens en el resto, sin RoPE y un contexto nativo de 1.048.576 tokens. Esta release incorpora además el drafter de 3 capas del repositorio upstream para decodificación especulativa.

La relevancia de esta ficha es doble: por un lado documenta un modelo MoE de contexto extremo; por otro, muestra un patrón poco habitual de despliegue, en el que la cuantización se diseña contra el silicio de destino en lugar de emularse sobre él. Todas las métricas de calidad y velocidad reportadas se midieron sobre la P150 real, no mediante emulación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con capas recurrentes (capas 6-17 aplicadas 3 veces, 48 aplicaciones por token), atención completa en capas 5/11/17/23 y ventanas deslizantes de 1.024 tokens en el resto, sin RoPE |
| Parametros totales | 26.400 millones (26,4B) |
| Parametros activos | 3.400 millones (3,4B), MoE top-8 sobre 128 expertos por capa |
| Longitud de contexto | 1.048.576 tokens nativo; el runtime limita según perfil de KV (hasta 283.008 con `--precision quality`, hasta 108.800 con decodificación especulativa) |
| Tipos de cuantizacion | BFP4 (expertos enrutados, atención q y gate), BFP8 (atención k/v/o, unembedding, expertos en perfil `quality`), BF16/FP32 (embedding, router, normas, convoluciones cortas, gates de mensaje); GPTQ aplicado en geometría de bloque BFP4 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Paquete nativo `inkling2-mini-tt-v2` (16,0 GB en `native/gptq/`), más checkpoint upstream en `checkpoint/`; no es GGUF, AWQ, AutoGPTQ/GPTQModel int4 ni NVFP4 para CUDA |
| Tamano del repositorio | 19,5 GB |
| Hardware de destino | Una Tenstorrent Blackhole P150 (32 GB) |
| Runtime | tt-metal/ttnn con decode trazado (kernels fusionados de atención y MoE), servido con vLLM en imagen Docker `lottolabs/inkling2-mini-tt-p150:gptq-qg4-1m` |
| Release | `gptq-qg4-1m-20261122` |
| Modalidad | Solo texto (rechaza imagen, audio y vídeo con HTTP 400) |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer MoE con una peculiaridad estructural relevante: las capas 6 a 17 se aplican tres veces por token, de modo que el modelo ejecuta 48 aplicaciones de capa con solo 24 capas físicas. Cada capa contiene un MoE de 128 expertos con enrutamiento top-8, lo que explica la relación entre 26,4B parámetros totales y 3,4B activos. La atención alterna capas de atención completa (5, 11, 17 y 23) con capas de ventana deslizante de 1.024 tokens, y el modelo prescinde de RoPE. El contexto nativo alcanza 1.048.576 tokens.

Sobre el entrenamiento del modelo base (número de tokens, composición del dataset, si hubo RLHF o DPO) no se proporciona información en los materiales disponibles. Lo que sí documenta esta release es el proceso de cuantización y despliegue: los expertos enrutados de las 24 capas y las proyecciones q y gate de atención se cuantizan con GPTQ en la geometría de bloque BFP4 del dispositivo, de forma que la conversión nativa del hardware reproduce los pesos bit a bit (prueba de recarga incluida en el paquete). El resto de tensores se leen del checkpoint upstream byte a byte y se convierten en tiempo de carga. Se incluye el drafter de 3 capas del repositorio upstream (`checkpoint/mtp.safetensors`) para decodificación especulativa, con rechazo especulativo exacto para peticiones muestreadas. El decode traza kernels fusionados de atención y MoE y transmite 3,72 GB de pesos por token con atención BFP8; el uso de BFP4 en q y gate elimina 340 MB por token.

## Capacidades

- Generación de texto conversacional e instructivo, con soporte de chat multi-turno.
- Razonamiento y matemáticas (el modelo base está orientado a tareas de razonamiento, según la evaluación por dominios chat/instruct/code).
- Generación de código: el conjunto de evaluación incluye un dominio específico de código con resultados medidos.
- Contexto largo extremo: ventana nativa de 1.048.576 tokens, con gestión de KV cache por perfiles (BF16 hasta 65.536 tokens, BFP8 hasta 131.072, K BFP8 / V BFP4 hasta 1.048.576).
- Decodificación especulativa con drafter de 3 capas, tanto para generación greedy como muestreada.
- Servicio mediante API compatible con OpenAI a través de vLLM.
- Capacidades multilingües: no disponible (los idiomas no se detallan en la información).
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Visión, audio y vídeo: el modelo upstream acepta imágenes, pero este port sirve solo texto y rechaza esas entradas con HTTP 400.

## Casos de uso

- Procesamiento de documentos largos en una sola pasada: con 1.048.576 tokens de contexto nativo, el modelo puede ingerir libros completos, expedientes o bases de código extensas sin trocear, manteniendo coherencia entre secciones distantes. El perfil de KV nativo (K BFP8 / V BFP4) permite exprimir el contexto completo dentro de los 32 GB de la P150.
- Análisis de repositorios de código: el dominio de código está evaluado explícitamente en la release (KL 0,0121 y top-1 0,966 en el perfil por defecto), lo que lo hace adecuado para revisión, explicación y generación de parches sobre ficheros largos.
- Asistente conversacional de contexto extenso: conversaciones multi-turno con historial muy largo, donde la ventana deslizante de 1.024 tokens en la mayoría de capas reduce el coste de atención y la atención completa en capas clave preserva el recuerdo global.
- Despliegue en entornos con hardware Tenstorrent: organizaciones que ya operan Blackhole P150 pueden servir el modelo con la imagen Docker incluida y la API de vLLM, sin depender de GPUs NVIDIA.
- Evaluación de cuantización hardware-native: el paquete incluye mapas de precisión, scripts de planificación de KV (`runtime/inkling2/tt/kvplan.py`) y evidencias de calidad, lo que lo convierte en una base para estudiar el impacto de BFP4/BFP8 en modelos MoE.
- Generación de texto por lotes con decodificación especulativa: el drafter de 3 capas acelera peticiones greedy y muestreadas, útil en pipelines de generación masiva donde el throughput importa más que la latencia individual.
- Investigación sobre arquitecturas con capas recurrentes: la aplicación triple de las capas 6-17 es un patrón poco común que este checkpoint permite estudiar en hardware real.

## Benchmarks y rendimiento

Los datos disponibles son métricas de fidelidad de cuantización frente a una referencia BF16 del modelo upstream ejecutada en CPU (no benchmarks de tareas como MMLU o HumanEval). Se midieron sobre 18 registros y 10.656 posiciones puntuadas, con prefill en trozos de 512 tokens. KL es la KL media (referencia ‖ ejecución), top-1 la coincidencia de argmax y ΔPPL el cambio de perplejidad.

| Dominio | Suelo de ruido BF16 (KL / top-1) | Por defecto: GPTQ-BFP4 expertos + q\|gate, KV BF16 (KL / top-1 / ΔPPL) | `--precision quality`: BFP8 expertos + atención BFP8 | BFP8 expertos + q\|gate GPTQ-BFP4 | Perfil KV nativo (K BFP8 / V BFP4) |
|---|---:|---:|---:|---:|---:|
| Chat | 0,00108 / 0,989 | 0,0074 / 0,972 / −0,60% | 0,0013 / 0,988 / −0,31% | 0,0024 / 0,983 / −0,95% | 0,0098 / 0,960 / −0,33% |
| Instruct | 0,00023 / 0,997 | 0,0076 / 0,977 / +0,12% | 0,0020 / 0,988 / −0,11% | 0,0032 / 0,986 / −0,43% | 0,0084 / 0,974 / +0,57% |
| Código | 0,00195 / 0,987 | 0,0121 / 0,966 / +0,45% | 0,0046 / 0,977 / +0,06% | 0,0063 / 0,974 / −0,23% | 0,0160 / 0,962 / −0,18% |
| Libro | 0,00319 / 0,977 | 0,0203 / 0,945 / +1,22% | 0,0048 / 0,966 / −0,01% | 0,0071 / 0,960 / +0,17% | 0,0250 / 0,932 / +1,34% |
| **Todos** | 0,00162 / 0,987 | **0,0112 / 0,966 / +0,15%** | **0,0030 / 0,981 / −0,12%** | 0,0046 / 0,976 / −0,46% | 0,0143 / 0,957 / +0,16% |
| Registro largo (posiciones 8.703–9.726) | 0,00437 / 0,968 | 0,0128 / 0,947 / +1,30% | 0,0048 / 0,973 / −0,23% | 0,0069 / 0,959 / +0,22% | 0,0197 / 0,941 / +1,61% |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las cifras de throughput y latencia tampoco se detallan numéricamente, más allá del dato de que el decode transmite 3,72 GB de pesos por token.

## Requisitos de hardware

- VRAM necesaria: una única Tenstorrent Blackhole P150 con 32 GB de memoria. El paquete nativo ocupa 16,0 GB en disco; en dispositivo, los expertos enrutados en GPTQ BFP4 ocupan 12,81 GiB, frente a 24,20 GiB en BFP8 con `--precision quality`.
- GPU recomendadas: no aplica en el sentido convencional; el destino es la tarjeta Tenstorrent Blackhole P150. No se soportan GPUs NVIDIA ni CUDA con este paquete (no es NVFP4 ni un checkpoint Transformers estándar).
- Compatibilidad con GPU de consumo: no disponible; el diseño es específico para el acelerador P150.
- Opciones de despliegue: imagen Docker `lottolabs/inkling2-mini-tt-p150:gptq-qg4-1m` con servidor vLLM y API compatible con OpenAI. No se soportan `transformers.from_pretrained()`, Inference Providers alojados, llama.cpp, Ollama ni TGI.
- Planificación de memoria: script `runtime/inkling2/tt/kvplan.py --max-model-len N` para calcular el plan de KV por contexto.
- Latencia y throughput: no se publican cifras concretas; la release menciona decodificación especulativa con drafter de 3 capas y kernels fusionados de atención y MoE como mecanismos de aceleración.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / hardware | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-TT-Mixed-BFP4-BFP8-P150 (esta ficha) | 26,4B totales / 3,4B activos | 1.048.576 tokens nativo | BFP4/BFP8 nativo, Tenstorrent Blackhole P150 | Apache 2.0 | Comunidad, experimental, 0 descargas |
| thinkingmachines/Inkling-2-Mini (upstream) | 26,4B totales / 3,4B activos | 1.048.576 tokens nativo | Checkpoint original (NVFP4/MXFP8 en expertos), acepta imágenes | no disponible en la información | Repositorio oficial del modelo base |
| Cuantizaciones GGUF / AWQ / GPTQ-int4 de propósito general | Depende del modelo | Depende del modelo | CPU/GPU con kernels convencionales | Depende del modelo | Amplia, pero no ejecutan en P150 |

La comparación con alternativas de la misma categoría (MoE de ~25B con contexto de un millón de tokens) no está disponible en la información proporcionada. La diferencia clave frente al upstream es que este paquete elimina la modalidad de imagen, fija el hardware de destino y sustituye el checkpoint original por tensores nativos BFP4/BFP8 con GPTQ.

## Limitaciones y advertencias

- Es una release experimental de comunidad de Lottolabs, no una publicación oficial de Thinking Machines Lab ni de Tenstorrent.
- Solo texto: rechaza entradas de imagen, audio y vídeo con HTTP 400, aunque el modelo upstream acepta imágenes.
- No es un checkpoint Transformers estándar: `transformers.from_pretrained()` no funciona y los Inference Providers alojados no son una vía de despliegue soportada.
- Dependencia total del hardware Tenstorrent Blackhole P150; no hay ruta de ejecución en GPU NVIDIA, CPU ni otros aceleradores con este paquete.
- La calidad se degrada de forma medible frente a la referencia BF16: en el perfil por defecto, KL de 0,0112 y top-1 de 0,966 en el agregado, con el peor caso en el dominio de libro (KL 0,0203, top-1 0,945, ΔPPL +1,22%). En el perfil KV nativo el agregado empeora a KL 0,0143 y top-1 0,957.
- El contexto máximo efectivo depende del perfil de KV: 65.536 tokens con KV BF16, 131.072 con BFP8, 1.048.576 con K BFP8 / V BFP4; con `--precision quality` baja a 283.008, y a 108.800 si se usa decodificación especulativa.
- Riesgo de alucinación: no cuantificado en la información disponible; aplican las advertencias habituales de modelos generativos.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Idiomas soportados: no disponibles; no se puede confirmar cobertura multilingüe.
- Licencia Apache 2.0, que permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento en producción de este port específico.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lottolabs/Inkling-2-Mini-TT-Mixed-BFP4-BFP8-P150
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Evidencias de calidad incluidas en el repo: `evidence/quality/prec_maps.md`, `evidence/quality/attn_maps.md`, `evidence/quality/bf16-noise-floor-chunk512.json`
- Script de planificación de KV: `runtime/inkling2/tt/kvplan.py`
- Imagen de runtime: `lottolabs/inkling2-mini-tt-p150:gptq-qg4-1m`
- Papers, blogs, repositorios y demos adicionales: no disponibles en la información proporcionada.
