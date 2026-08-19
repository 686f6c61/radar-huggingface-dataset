# NoxNotreve/Bonsai-27B-gguf

## Resumen

Bonsai 27B es un modelo de lenguaje de 27 mil millones de parametros desarrollado por Prism ML, derivado de Qwen3.6-27B y cuantizado de forma extrema a pesos binarios de 1 bit en formato GGUF. Su principal innovacion es reducir el peso desplegado de aproximadamente 54 GB (FP16) a unos 3,9 GB, lo que permite ejecutar un modelo de clase 27B en portatiles convencionales y GPUs de consumo, manteniendo alrededor del 89,5 % del rendimiento medio del modelo original en 15 benchmarks de razonamiento con modo de pensamiento activado.

El modelo utiliza una arquitectura de atencion hibrida (aproximadamente 75 % atencion lineal y 25 % atencion completa) heredada de Qwen3.6-27B, lo que permite una ventana de contexto de 262K tokens en dispositivos locales con una cache KV cuantizada a 4 bits. Incluye una torre de vision en 4-bit HQQ para entrada multimodal, un drafter de decodificacion especulativa DSpark que acelera la decodificacion 1,37x en CUDA, y versiones companion en MLX para Apple Silicon y en ternario (7,2 GB) para quienes prioricen calidad. Su licencia Apache 2.0 permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hybrid attention (~75 % lineal / ~25 % completa), SwiGLU MLP, RoPE, RMSNorm |
| Parametros totales | 26.895.998.464 (aprox. 27,3B binarios de lenguaje + ~0,46B torre de vision) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens (262K) |
| Tipos de cuantizacion | GGUF Q1_0_g128 (1 bit, 1,125 bits/peso); torre de vision en HQQ 4-bit; KV cache 4-bit |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q1_0_g128), safetensors para el modelo base |

## Arquitectura y entrenamiento

El modelo deriva directamente de Qwen3.6-27B, un transformer causal de atencion hibrida con aproximadamente el 75 % de las capas usando atencion lineal y el 25 % restante atencion completa. Esta distribucion reduce el coste de la cache KV y permite operar con 262K tokens de contexto en hardware de consumo. La cuantizacion binaria Q1_0_g128 representa cada peso con un unico bit de signo (0 mapea a -escala, 1 a +escala), con un factor de escala FP16 compartido por cada grupo de 128 pesos, resultando en 1,125 bits por peso efectivo. La cobertura binaria incluye embeddings, proyecciones de atencion, proyecciones MLP y la cabeza de lenguaje, sin puntos de fuga de alta precision. La torre de vision se cuantiza aparte con HQQ a 4 bits.

El entrenamiento posterior a la cuantizacion no se detalla en la informacion disponible, pero el modelo se publica con un drafter de decodificacion especulativa DSpark entrenado contra el propio Bonsai 27B, que proporciona una aceleracion de 1,37 veces en la decodificacion en el path de servidor CUDA. No se especifica el volumen de tokens de entrenamiento ni el uso de RLHF o DPO.

## Capacidades

- Generacion de texto con razonamiento en modo pensamiento (thinking mode) sobre 15 benchmarks, con una media de 76,11 puntos (89,5 % del FP16).
- Razonamiento matematico: 91,66 puntos en los benchmarks de matematicas del conjunto de evaluacion.
- Generacion de codigo: 81,88 puntos en los benchmarks de codificacion.
- Entrada multimodal de vision: la torre de vision en HQQ 4-bit permite procesar imagenes junto al texto (pack mmproj opcional de ~0,63 GB).
- Comportamiento agentico y de razonamiento multi-paso, conservado en el regimen de menos de 4 bits.
- Ventana de contexto de 262K tokens en dispositivo, habilitada por la atencion hibrida y la cache KV cuantizada a 4 bits.
- Compatibilidad con decodificacion especulativa mediante drafter DSpark (solo CUDA).
- Backends multiples: llama.cpp con kernels CUDA y Metal, MLX para Apple Silicon (incluido iPhone via MLX Swift).

## Casos de uso

- Asistente personal en portatil: con un footprint de ~3,9 GB, el modelo puede ejecutarse en equipos con 8 GB de RAM o menos, ofreciendo respuestas con razonamiento y memoria de contexto de 262K tokens sin conexion a internet. Es adecuado para portatiles Apple Silicon (M5 Pro: ~44 tok/s) y equipos Windows con GPU de gama media.
- Analisis de documentos largos: la ventana de contexto de 262K tokens permite ingerir libros completos, informes tecnicos o codebases extensos y realizar preguntas de comprension y resumen sin fragmentacion. La atencion lineal reduce el coste de memoria de la cache KV en el regimen de contexto largo.
- Generacion de codigo asistida en el IDE: el modelo alcanza 81,88 en benchmarks de codificacion y puede integrarse en editores o pipelines de CI/CD para revision de codigo, generacion de tests o autocompletado, ejecutandose localmente sin enviar datos a servidores externos.
- Aplicaciones moviles de IA conversacional: la version MLX Swift permite ejecutar el modelo en iPhone (11 tok/s en iPhone 17 Pro Max), habilitando asistentes conversacionales offline con capacidades de vision y razonamiento.
- Procesamiento de imagenes y texto en edge: la torre de vision de 4 bits permite analizar fotografias, capturas de pantalla o documentos escaneados y responder preguntas sobre su contenido, todo en un dispositivo de borde con limitaciones de memoria.
- Prototipado rapido de agentes autonomos: el modelo conserva comportamiento agentico y tool calling (heredado de Qwen3.6-27B) y puede desplegarse con vLLM o llama.cpp para experimentar con pipelines de razonamiento multi-paso en entornos de desarrollo con una sola GPU de consumo.
- Servicio de inferencia en la nube de bajo coste: al ocupar solo 3,9 GB de VRAM, el modelo puede servir en instancias de GPU de gama baja (p. ej., T4 de 16 GB) con multiples peticiones concurrentes, reduciendo el coste por token frente a modelos FP16 de 27B.

## Benchmarks y rendimiento

Los datos de benchmarks publicados en la informacion disponible se presentan como porcentajes relativos al modelo base en precision completa (FP16). No se han publicado resultados absolutos para benchmarks estandar como MMLU, HumanEval o GSM8K en la informacion disponible.

| Benchmark | Bonsai 27B (1-bit) | FP16 (baseline) | Retencion |
|---|---|---|---|
| Media en 15 benchmarks de razonamiento | 76.11 | ~85.0 (estimado) | 89.5 % |
| Matematicas (razonamiento) | 91.66 | no disponible | no disponible |
| Codificacion | 81.88 | no disponible | no disponible |

El modelo tambien reporta una aceleracion de 1,37x en decodificacion con el drafter DSpark en CUDA, y un rendimiento de ~44 tok/s en Apple M5 Pro (GPU Metal) y ~11 tok/s en iPhone 17 Pro Max (via MLX Swift). El modelo ternario (Ternary-Bonsai-27B, ~7,2 GB) alcanza el 94,6 % de la calidad FP16, segun la documentacion de Prism ML.

## Requisitos de hardware

- VRAM estimada: ~3,9 GB para el modelo de lenguaje en formato GGUF Q1_0_g128; ~0,63 GB adicionales para la torre de vision (mmproj).
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM (p. ej., RTX 3050, GTX 1660, RTX 4060); soporte CUDA y Metal.
- Compatibilidad con GPU de consumo: si, incluyendo portatiles con GPU integrada (Apple Silicon, Intel Iris) y GPU de escritorio de gama baja.
- Opciones de despliegue: llama.cpp (con kernels CUDA y Metal del fork de Prism ML), MLX (Apple Silicon), MLX Swift (iOS/macOS), vLLM para servicio en produccion.
- Rendimiento medido: ~44 tok/s en Apple M5 Pro (Metal), ~11 tok/s en iPhone 17 Pro Max (MLX Swift), 1,37x de aceleracion de decodificacion con drafter DSpark en CUDA.
- Requisito minimo: 4 GB de RAM/VRAM para el modelo base; la cache KV para la ventana completa de 262K tokens ocupa ~4,3 GB adicionales (en 16 de 64 capas).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Footprint | Rendimiento (media 15 benchmarks) | Licencia |
|---|---|---|---|---|---|
| Bonsai 27B (1-bit) | ~26,9 B | 262K | ~3,9 GB | 76.11 (89,5 % FP16) | Apache 2.0 |
| Ternary-Bonsai-27B | ~26,9 B | 262K | ~7,2 GB | ~95 % FP16 | Apache 2.0 |
| Qwen3.6-27B (FP16, base) | ~26,9 B | 262K | ~54 GB | baseline (100 %) | Apache 2.0 |
| Qwen3.6-27B (GGUF Q4_K_M) | ~26,9 B | 262K | ~16 GB | no disponible | Apache 2.0 |

La comparativa se basa en la familia Bonsai del mismo autor; no se dispone de datos comparativos con otros modelos de 1 bit como BitNet o ternary LLM en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion binaria a 1 bit introduce una perdida de calidad media del 10,5 % respecto al FP16; la diferencia se concentra en las categorias mas exigentes de razonamiento, aunque matematicas y codificacion se mantienen dentro de unos pocos puntos del baseline.
- El modelo requiere kernels especificos de llama.cpp (fork de Prism ML) para consumir directamente los pesos Q1_0_g128 sin expandirlos a FP16; usar el llama.cpp estandar puede no ser compatible.
- La torre de vision es opcional y se carga solo cuando se proporciona una imagen; sin ella, el modelo no procesa entrada multimodal.
- La cache KV completa de 262K tokens ocupa ~4,3 GB adicionales, lo que puede superar la memoria disponible en dispositivos con menos de 8 GB de RAM/VRAM.
- No se han publicado datos sobre sesgos, alucinaciones o limitaciones de idioma especificos del modelo.
- La informacion sobre el proceso de entrenamiento (tokens, dataset, tecnicas de alineacion) no esta disponible en la documentacion publicada.
- El modelo es una derivacion de Qwen3.6-27B; verificar la compatibilidad con el ecosistema de herramientas de Qwen (por ejemplo, herramientas de evaluacion especificas) antes de integrarlo en produccion.

## Enlaces

- Repositorio HuggingFace (NoxNotreve): https://huggingface.co/NoxNotreve/Bonsai-27B-gguf
- Repositorio HuggingFace (prism-ml): https://huggingface.co/prism-ml/Bonsai-27B-gguf
- Coleccion Bonsai 27B: https://huggingface.co/collections/prism-ml/bonsai-27b
- Whitepaper (PDF): https://github.com/PrismML-Eng/Bonsai-demo/blob/main/bonsai-27b-whitepaper.pdf
- Demo y ejemplos: https://github.com/PrismML-Eng/Bonsai-demo
- Fork de llama.cpp (CUDA + Metal): https://github.com/PrismML-Eng/llama.cpp
- Fork de MLX (Apple Silicon): https://github.com/PrismML-Eng/mlx
- Fork de mlx-swift (iOS/macOS): https://github.com/PrismML-Eng/mlx-swift
- Version MLX 1-bit: https://huggingface.co/prism-ml/Bonsai-27B-mlx-1bit
- Version ternaria GGUF: https://huggingface.co/prism-ml/Ternary-Bonsai-27B-gguf
- Documentacion oficial: https://docs.prismml.com/models/bonsai-27b
- Web del proyecto: https://prismml.com
- Discord: https://discord.gg/prismml
