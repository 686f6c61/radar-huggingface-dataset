# decentfuture/DeepSeek-V4.1-Flash-1017-dsx-t16

## Resumen

DeepSeek-V4.1-Flash-1017-dsx-t16 es una cuantización de un modelo MoE de gran escala (552B parámetros totales con una tabla Engram de 196B) publicada por el usuario decentfuture sobre los pesos originales de deepseek-ai/DeepSeek-V4.1-Flash-1017. El objetivo es hacer viable la inferencia de un modelo de este tamaño en hardware de consumo: dos GPUs de 24 GB (RTX 3090, 4090 o 5090) más 128 GB de RAM y aproximadamente 255 GB de almacenamiento NVMe. El paquete completo ocupa 252 GB en un único archivo GGUF, con los expertos enrutados cuantizados en formato T16, un esquema trellis propio de la herramienta dsx.

La innovación central es el formato T16, derivado de la maquinaria de exllamav3 (trellis de desplazamiento de bits tipo QTIP, rotaciones Hadamard de 128 anchos y realimentación de error LDLQ), pero con un codebook diseñado para CPUs de sobremesa con AVX-VNNI. Esto permite decodificar el mismo archivo de forma rápida tanto en CPU como en GPU. La calidad declarada frente al modelo FP8 original es de KL 0.196, top-1 del 80.9% y perplejidad 9.54, con un rendimiento de 34.9 tok/s en decodificación y hasta 1.008 tok/s en prefill cálido sobre dos RTX 3090.

El modelo es relevante porque demuestra que un MoE de más de 500B parámetros puede ejecutarse en un equipo de escritorio con dos GPUs consumer, algo que hasta ahora requería clústeres multigpu de centro de datos. La licencia MIT facilita su uso comercial, aunque las condiciones del modelo base deben verificarse por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) con tabla Engram; cuantización trellis T16 sobre expertos enrutados |
| Parametros totales | 552B (MoE) + 196B (Engram) |
| Parametros activos | no disponible |
| Longitud de contexto | 256K (asignación de contexto usada en el benchmark de prefill) |
| Tipos de cuantizacion | T16 trellis: 1.5/1.5/2 bits (gate/up/down) en capas 0-19; 2/2/2.5 bits en capas 20-39; ~1.9 bpw. Tabla Engram en IQ4_NL (por defecto) o Q6_K (rama `q6k-engram`) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (un único archivo de 252 GB; 302 GB con Engram Q6_K) |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura MoE de 552B parámetros, complementado por una tabla Engram de 196B parámetros que actúa como memoria asociativa externa. La cuantización T16 se aplica exclusivamente a los expertos enrutados, mientras que las proyecciones Engram se mantienen en F16 en el runtime. El esquema T16 emplea un trellis de desplazamiento de bits encontrado mediante búsqueda de Viterbi, rotaciones Hadamard de 128 anchos y realimentación de error LDLQ con la matriz Hessiana de entrada de cada experto.

El codebook T16 obtiene el valor de un peso a partir de su ventana de 16 bits: multiplicación por 0x3A2F y suma de los dos bytes del producto, lo que se traduce en una instrucción `vpmullw` y una `vpdpbusd` por par de pesos en CPU con AVX-VNNI, frente a una multiplicación de 32 bits por peso en el codebook de exllamav3. Se introducen cinco modificaciones respecto a la maquinaria original: el codebook T16, posiciones column-major dentro de cada tile de 16x16, Hessiano amortiguado (sigma_reg 2) para evitar sobreajuste al texto de calibración, corrección de ganancia de salida (x1.13 para gate/up a 1.5 bits, x1.04 a 2 bits) y un layout de bits dimensionado para igualar a Unsloth UD-IQ1_M. La calibración usó 635K tokens (sesiones de agente de código, prompts de agente y código, trazas de razonamiento del propio modelo, Wikipedia en cinco idiomas, código y chat).

## Capacidades

- Generación de texto y razonamiento de propósito general, heredadas del modelo base DeepSeek-V4.1-Flash-1017.
- Razonamiento multi-paso y trazas de pensamiento (el conjunto de calibración incluye trazas de razonamiento del propio modelo).
- Generación y comprensión de código, con sesiones de agente de código empleadas en la calibración.
- Capacidades multilingües: la calibración incluye Wikipedia en cinco idiomas, aunque la lista exacta de idiomas soportados no está disponible.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponible.
- Modo thinking explícito: no disponible.

## Casos de uso

- Despliegue local de un MoE de gran escala en estación de trabajo: con dos RTX 3090, 128 GB de RAM y ~255 GB de NVMe se puede servir el modelo completo sin depender de la nube, útil para equipos que necesitan soberanía de datos o evitar costes recurrentes de API.
- Generación de código asistida en local: el modelo base está orientado a tareas de agente de código y las sesiones de agente forman parte de la calibración, por lo que encaja en asistentes de programación que requieren contexto largo (hasta 256K tokens) para repositorios completos.
- Análisis de documentos extensos: la ventana de 256K permite procesar contratos, informes o bases de código de gran tamaño en una sola pasada, con el prefill cálido a ~1.008 tok/s que reduce la latencia de la primera respuesta.
- Investigación en cuantización: el paquete sirve como referencia reproducible para estudiar el impacto de esquemas trellis de bajos bits (1.5-2.5 bpw) sobre la calidad (KL, top-1, perplejidad) frente a FP8 y a otras cuantizaciones como UD-IQ1_M.
- Prototipado de agentes autónomos: el contexto largo y el rendimiento de decodificación (~35 tok/s) permiten iteraciones de razonamiento multi-paso en local, aunque el throughput limita despliegues de alta concurrencia.
- Evaluación comparativa de runtimes: al estar empaquetado para dsx, permite medir el rendimiento de este motor Rust + CUDA frente a llama.cpp sobre los mismos pesos, como muestran las tablas de calidad y velocidad de la model card.

## Benchmarks y rendimiento

Calidad medida sobre el conjunto de evaluación 1017 de Lucebox (8 x 1024 tokens frente a los top-256 log-probs del modelo FP8):

| Modelo / build | Tamano sin Engram | KL ↓ | Top-1 ↑ | Perplejidad ↓ |
|---|---:|---:|---:|---:|
| Este build (T16 v1, Engram IQ4_NL), dsx | 141 GB | 0.196 | 80.9% | 9.54 |
| Este build con Engram Q6_K (rama `q6k-engram`) | 141 GB | 0.194 | 81.4% | 9.60 |
| dsx-ud (expertos de Unsloth UD-IQ1_M), dsx | 142 GB | 0.272 | 79.0% | 10.17 |
| Project Maya Maya-S, llama.cpp | 178 GB | 0.195 | 82.0% | 9.49 |
| Unsloth UD-IQ1_M original, llama.cpp | ~140 GB | 0.275 | 78.8% | 10.11 |

Mediciones históricas por la ruta de decodificación (2 x 1.023 tokens del mismo conjunto, sin deferimiento):

| Modelo / build | KL ↓ | Top-1 ↑ | Perplejidad ↓ |
|---|---:|---:|---:|
| Este build | 0.205 | 82.0% | 8.65 |
| dsx-ud | 0.303 | 80.4% | 9.03 |

Rendimiento en 2x RTX 3090, i7-12700K y 128 GB DDR4:

| Metrica | Valor |
|---|---|
| Prefill cálido (prompt de 8K, perfil opt-in) | ~1.008 tok/s (pases: 1.008,50 y 1.007,18 tok/s; primer pase 928,49 tok/s) |
| Decodificación (release registrado) | 34,9 tok/s (36,8 tok/s con `--defer-rank 3`) |
| Prefill (release registrado, 3K) | ~530 tok/s |

## Requisitos de hardware

- VRAM: dos GPUs de 24 GB (RTX 3090, 4090 o 5090); el modelo se reparte entre ambas y la RAM del sistema.
- RAM: 128 GB.
- CPU: AVX2 obligatorio; AVX-VNNI para el kernel rápido de CPU.
- Almacenamiento: ~255 GB en NVMe.
- GPU recomendadas: RTX 3090, RTX 4090 y RTX 5090 (según los tags y la model card); no se documentan GPUs de centro de datos como A100 o H100.
- Cabe en GPU consumer: sí, en dos GPUs de 24 GB, no en una sola.
- Opciones de despliegue: motor dsx (Rust + CUDA), versión del 2026-10-22 o posterior para soporte T16. No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: ~1.008 tok/s de prefill cálido con prompt de 8K y ~35 tok/s de decodificación en 2x RTX 3090.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad (KL / top-1 / ppl) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este build (T16, dsx) | 552B + 196B Engram | 256K | 0.196 / 80.9% / 9.54 | MIT | Hugging Face (252 GB) |
| dsx-ud | 552B + Engram | no disponible | 0.272 / 79.0% / 10.17 | no disponible | Hugging Face |
| Project Maya Maya-S | no disponible | no disponible | 0.195 / 82.0% / 9.49 | no disponible | Hugging Face |
| Unsloth UD-IQ1_M | 552B + Engram | no disponible | 0.275 / 78.8% / 10.11 | no disponible | Hugging Face |

## Limitaciones y advertencias

- La calidad se degrada respecto al modelo FP8 original: perplejidad 9.54 frente a 8.56, con KL 0.196 y top-1 del 80.9%.
- Las mediciones de calidad y velocidad corresponden al release y al runtime registrado; revisiones posteriores de kernels presentan una desviación de KL sin resolver según la documentación de estado de dsx.
- La afinación de las ganancias de salida se seleccionó sobre el mismo conjunto de evaluación; no se ha medido una afinación independiente.
- El requant calib5 (KL ~0.202, top-1 81.3%) no superó a v1 (0.196 / 80.9%) y no se adoptó; las mejoras en calidad agéntica no quedaron establecidas.
- El modelo solo se ejecuta con el motor dsx; no hay soporte documentado para otros runtimes.
- Requiere hardware específico (dos GPUs de 24 GB, 128 GB de RAM, CPU con AVX2/AVX-VNNI, ~255 GB de NVMe), lo que excluye equipos de gama media.
- Idiomas soportados no documentados; la calibración cubre Wikipedia en cinco idiomas pero no se detalla cuáles.
- Riesgo de sesgos y alucinaciones inherente al modelo base; no se documentan evaluaciones de seguridad en la información disponible.
- La licencia MIT del paquete de cuantización no sustituye las condiciones del modelo base deepseek-ai/DeepSeek-V4.1-Flash-1017, que deben verificarse para uso comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/decentfuture/DeepSeek-V4.1-Flash-1017-dsx-t16
- Rama con Engram Q6_K: https://huggingface.co/lxe/DeepSeek-V4.1-Flash-1017-dsx-t16/tree/q6k-engram
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Motor dsx: https://github.com/lxe/dsx
- Estado del runtime y comprobaciones de corrección: https://github.com/lxe/dsx/blob/main/docs/current-state.md
- Historial de releases del modelo: https://github.com/lxe/dsx/blob/main/docs/model-history.md
- Conjunto de evaluación de Lucebox: https://huggingface.co/Lucebox/DeepSeek-V4.1-Flash-1017-ROCMFP-GGUF
- Paper referenciado (arXiv:2406.11235): https://arxiv.org/abs/2406.11235
