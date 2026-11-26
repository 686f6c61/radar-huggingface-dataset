# beamster/Hy4-Flash-Sushi-STQ-2.25bpw

## Resumen

Hy4-Flash-Sushi-STQ-2.25bpw es un empaquetado cuantizado del modelo multimodal tencent/Hy4-flash, una arquitectura MoE (mixture of experts) de 87.515.023.270 parametros totales con capacidad image-text-to-text. Lo publica el usuario beamster como derivado del checkpoint original de Tencent, adaptado especificamente para el motor de inferencia nativo sushi (fork de mlx-serve de ddalcu) sobre Apple Silicon. No es un modelo nuevo: es una distribucion de pesos optimizada para ejecucion local en Mac con macOS 26.2 o superior.

La relevancia del pack esta en su estrategia de compresion: los expertos enrutados de las 41 capas (512 expertos por capa) se almacenan con STQ (Sushi Trellis Quant) a 2.25 bits medios, combinando grupos de 2.5, 2.25 y 2 bits, mientras que el tronco, el lm_head y el embedding usan STQ con codebook SPEC1 a 5 bits. Las tablas Engram se mantienen en bf16 y se leen desde SSD por filas, sin cargarse en memoria de GPU, lo que reduce el peso en VRAM a costa de 118 GiB de almacenamiento en disco.

El resultado es un pack de aproximadamente 163 GiB en disco (45 GiB de pesos y 118 GiB de tablas Engram) con una ventana de contexto de hasta 1.048.576 tokens. Frente a su hermano Sushi-STQ-4bpw (194 GiB, KLD 0.0194), este pack sacrifica fidelidad (KLD 0.1022, top-1 91.72%) a cambio de 31 GiB menos en disco. Requiere sushi 1.8.0 o posterior, version aun no publicada en el momento de la ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts), transformer con torre de vision; 41 capas x 512 expertos enrutados |
| Parametros totales | 87.515.023.270 |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 1.048.576 tokens |
| Tipos de cuantizacion | STQ 2.25 bits medios en expertos (grupos de 2.5, 2.25 y 2 bits); STQ SPEC1 5 bits en tronco, lm_head y embedding; STQ SPEC1 4 bits en el drafter DFly2; bf16 en tablas Engram y torre de vision |
| Idiomas soportados | no disponible |
| Licencia | tencent-hy-license (other) |
| Formato de pesos | safetensors (pack propietario para el motor sushi) |

## Arquitectura y entrenamiento

El modelo base tencent/Hy4-flash es un MoE multimodal con torre de vision para entrada image-text-to-text. El pack conserva la topologia completa: 41 capas con 512 expertos enrutados cada una, ademas del tronco denso, lm_head, embedding, tablas Engram y torre de vision. Incorpora DFly2, un drafter de decodificacion especulativa empaquetado a 4 bits con STQ SPEC1, que acelera la generacion al proponer tokens que el modelo principal verifica.

La cuantizacion no es uniforme: los expertos se dividen por capa en 154 expertos a 2.5 bits, 204 a 2.25 bits y 154 a 2 bits, con orden de tiles pair-major y codewords bidimensionales PAIR1. El tronco, embedding y lm_head usan un codebook escalar de 5 bits (SPEC1), mas conservador para preservar la calidad de las partes densas. Las tablas Engram permanecen en bf16 y se leen desde SSD por filas, una decision de diseno que traslada 118 GiB fuera de la memoria unificada. No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens ni si hubo RLHF o DPO; esos datos corresponden al modelo base y no se detallan en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional multi-turno con contexto de hasta 1.048.576 tokens.
- Entrada multimodal image-text-to-text mediante la torre de vision incluida en bf16.
- Razonamiento y matemáticas: el autor reporta KLD por categoria en math (0.0399) y reasoning (0.0875) frente al checkpoint original.
- Generacion de codigo: categoria code con KLD 0.0290, la de menor degradacion del pack.
- Capacidades multilingues: evaluadas en la categoria multilingual (KLD 0.1099), aunque la lista de idiomas no esta disponible.
- Decodificacion especulativa integrada mediante el drafter DFly2 a 4 bits.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Procesamiento de documentos largos en local: con 1.048.576 tokens de contexto, el modelo puede ingerir libros tecnicos, expedientes o bases de codigo completas en una sola pasada sobre un Mac con memoria unificada suficiente, sin depender de la nube.
- Analisis de imagenes y texto combinados: la torre de vision en bf16 permite tareas de image-text-to-text como descripcion de capturas, extraccion de datos de graficos o respuesta a preguntas sobre diagramas, integrado en flujos de escritorio.
- Asistencia de codigo en un Mac de desarrollo: la categoria code es la menos degradada por la cuantizacion (KLD 0.0290), por lo que el pack es adecuado para autocompletado, refactorizacion y explicacion de codigo en un entorno local sin enviar el repositorio a terceros.
- Prototipado de agentes conversacionales con contexto largo: conversaciones multi-turno que acumulan historial extenso se benefician de la ventana de un millon de tokens y de la decodificacion especulativa DFly2 para reducir latencia.
- Investigacion sobre cuantizacion extrema: el pack sirve como referencia reproducible para estudiar el impacto de STQ a 2.25 bits en un MoE de 87.500 millones de parametros, comparando KLD por categoria con el pack de 4 bits.
- Despliegue de privacidad estricta en Apple Silicon: al ejecutarse con sushi sobre macOS 26.2 o superior, los datos permanecen en el equipo, lo que encaja en escenarios con requisitos de confidencialidad donde no se permite inferencia remota.
- Evaluacion comparativa de motores de inferencia: util para medir throughput y latencia de sushi frente a otras soluciones MLX en el mismo hardware, dado que el pack esta optimizado para ese motor concreto.

## Benchmarks y rendimiento

El autor publica unicamente metricas de fidelidad KLD frente al checkpoint original en BF16 (productos en f32, KV cache de 8 bits, DFly2 desactivado, ocho categorias, 2 prompts x 512 tokens, 7.859 posiciones). No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

| Pack | KLD | top-1 | Disco |
|---|---|---|---|
| Sushi-STQ-4bpw | 0.0194 | 96,30% | 194 GiB |
| Sushi-STQ-2.25bpw | 0.1022 | 91,72% | 163 GiB |

KLD por categoria:

| Pack | code | math | reasoning | design | wikitext | multilingual | story | science |
|---|---|---|---|---|---|---|---|---|
| Sushi-STQ-4bpw | 0.0060 | 0.0058 | 0.0137 | 0.0166 | 0.0369 | 0.0168 | 0.0500 | 0.0079 |
| Sushi-STQ-2.25bpw | 0.0290 | 0.0399 | 0.0875 | 0.1079 | 0.0802 | 0.1099 | 0.3256 | 0.0368 |

La degradacion mas acusada se da en story (0.3256) y design (0.1079), mientras que code y math resisten mejor la compresion. No se dispone de datos de latencia ni throughput.

## Requisitos de hardware

- VRAM/memoria unificada: no disponible de forma explicita; el pack ocupa 45 GiB de pesos en memoria y las tablas Engram (118 GiB) se leen desde SSD sin cargarse en GPU.
- Almacenamiento: aproximadamente 163 GiB en disco, imprescindible para las tablas Engram.
- GPU compatibles: exclusivamente Apple Silicon (M-series) con macOS 26.2 o superior; no soportado en NVIDIA ni AMD.
- Consumer GPU: no aplica en el sentido tradicional; requiere un Mac con memoria unificada suficiente para los 45 GiB de pesos mas el overhead del motor y la KV cache.
- Motor de despliegue: sushi 1.8.0 o posterior (no publicado en el momento de la ficha), fork de mlx-serve. No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | KLD | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Hy4-Flash-Sushi-STQ-2.25bpw | 87.515.023.270 | 1.048.576 | STQ 2.25 bits | 0.1022 | tencent-hy-license | Apple Silicon, sushi >= 1.8.0 |
| Hy4-Flash-Sushi-STQ-4bpw | 87.515.023.270 | 1.048.576 | STQ 4 bits | 0.0194 | tencent-hy-license | Apple Silicon, sushi >= 1.8.0 |
| tencent/Hy4-flash (base) | 87.515.023.270 | no disponible | BF16 | referencia | tencent-hy-license | multiplataforma |

La comparativa se limita a los packs derivados del mismo modelo base, ya que no se dispone de informacion sobre alternativas de otros fabricantes con caracteristicas equivalentes.

## Limitaciones y advertencias

- Requiere sushi 1.8.0 o posterior, version aun no publicada segun la model card; el pack no es utilizable hasta su lanzamiento.
- Exclusivo de Apple Silicon con macOS 26.2 o superior; no hay soporte para CUDA, ROCm ni otros backends.
- La cuantizacion a 2.25 bits degrada notablemente la fidelidad: KLD 0.1022 frente a 0.0194 del pack de 4 bits, con especial perdida en story (0.3256) y design (0.1079).
- Las tablas Engram requieren 118 GiB de SSD y lectura por filas, lo que introduce dependencia del rendimiento del almacenamiento y puede aumentar la latencia.
- Licencia tencent-hy-license: es necesario revisar sus terminos para uso comercial, ya que no es una licencia permisiva estandar.
- Sesgos conocidos y riesgo de alucinacion: no disponibles en la informacion proporcionada; se heredan del modelo base.
- Idiomas soportados: no disponibles; la categoria multilingual muestra la segunda mayor degradacion (0.1099), lo que sugiere mayor perdida en idiomas distintos del ingles.
- El repositorio registra 0 descargas y 0 likes, por lo que no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/beamster/Hy4-Flash-Sushi-STQ-2.25bpw
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Licencia del modelo base: https://huggingface.co/tencent/Hy4-flash/blob/main/LICENSE
- Pack de 4 bits: https://huggingface.co/beamster/Hy4-Flash-Sushi-STQ-4bpw
- Motor sushi: https://github.com/beamivalice/sushi
- Guia de uso de sushi: https://github.com/beamivalice/sushi/blob/main/docs/usage.md
- mlx-serve (proyecto original): https://github.com/ddalcu/mlx-serve
