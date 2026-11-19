# Kaleto/SenseNova-Loop-9B-NVFP4

## Resumen

SenseNova-Loop-9B-NVFP4 es una compilación cuantizada a 4 bits en formato NVFP4 del modelo SenseNova-Loop-9B, desarrollado originalmente por SenseNova. Esta versión la publica el usuario Kaleto y está orientada específicamente a la inferencia rápida con vLLM sobre GPUs NVIDIA Blackwell, con especial atención a la DGX Spark y su chip GB10. El modelo base emplea una arquitectura de transformer con bucles ("looped transformer"), en la que las capas 4 a 27 se ejecutan dos veces, dando lugar a 56 ejecuciones efectivas sobre 32 capas almacenadas.

El modelo resuelve el problema del coste de memoria y de la velocidad de decodificación del modelo original en BF16, que ocupa unos 17 GiB en memoria. Esta versión NVFP4 reduce el peso en memoria a 7,7 GiB y multiplica por aproximadamente 2,8 la velocidad de decodificación en una única GB10, alcanzando 21,2 tok/s en un solo flujo y 81,1 tok/s con cuatro flujos concurrentes. Es relevante ahora porque permite desplegar un modelo de casi 10.000 millones de parámetros en hardware de borde con memoria unificada, dejando espacio para caché KV y otros modelos.

La cuantización W4A16 (pesos a 4 bits, activaciones en BF16) se generó con nvidia-modelopt 0.43 y conserva en precisión original componentes sensibles como el `lm_head`, los embeddings, las normas, los routers mHC, las compuertas de bucle, el tower de visión y la cabeza MTP. El modelo se distribuye bajo licencia Apache 2.0 y su repo ocupa 9,4 GB en disco.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SenseNovaLoopForConditionalGeneration: 32 capas almacenadas, capas 4–27 ejecutadas dos veces (56 ejecuciones), mHC de dos flujos (Sinkhorn), 24 capas Gated DeltaNet + 8 capas de atención completa, YaRN ×2 hasta 512K |
| Parámetros totales | 9.656.254.576 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 512K tokens (YaRN ×2) |
| Tipos de cuantización | NVFP4 (E2M1, una escala E4M3 por cada 16 pesos y una escala FP32 por tensor), W4A16_NVFP4: pesos 4 bits, activaciones BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint nvidia-modelopt 0.43), librería vLLM, código personalizado (`custom_code`) |
| Modelo base | sensenova/SenseNova-Loop-9B, revisión `3e1ba6e8` |
| Tamaño en disco | 9,4 GB (BF16: 19 GB) |
| Peso en memoria | 7,7 GiB |
| Capas cuantizadas | 200 lineales: `mlp.{gate,up,down}_proj` (32 capas), `self_attn.{q,k,v,o}_proj` (8 capas), `linear_attn.{in_proj_qkv,in_proj_z,out_proj}` (24 capas) |
| Componentes sin cuantizar | `lm_head`, `embed_tokens`, normas, routers mHC (FP32), `loop_gate`, DeltaNet `in_proj_a/b`, `conv1d`, `A_log`/`dt_bias` (FP32), tower de visión, cabeza MTP |
| Calibración | 64 × 1.024 tokens de texto mixto (noticias, wiki EN/DE, código, chat, role-play), ejecutados por el forward con bucles real |

## Arquitectura y entrenamiento

El modelo base es un transformer con bucles: almacena 32 capas, pero las capas 4 a 27 se ejecutan dos veces, lo que resulta en 56 ejecuciones efectivas. La arquitectura combina 24 capas Gated DeltaNet (atención lineal) con 8 capas de atención completa, e incorpora un mecanismo mHC de dos flujos basado en Sinkhorn alrededor de las capas con bucle. El vocabulario es de 248.320 tokens y el contexto se extiende hasta 512K mediante YaRN ×2. Incluye además un tower de visión y una cabeza MTP (multi-token prediction).

La calibración de la cuantización se realizó con 64 secuencias de 1.024 tokens de texto mixto (noticias, Wikipedia en inglés y alemán, código, chat y role-play), pasadas por el forward con bucles real, de modo que los rangos de activación se recogieron sobre las dos pasadas de cada capa con bucle. No se dispone de información sobre el número total de tokens de entrenamiento del modelo base, la composición del dataset original ni si se aplicaron técnicas de RLHF o DPO.

La innovación técnica principal de esta compilación es el uso de NVFP4 con escalas E4M3 por bloque de 16 pesos y una escala FP32 por tensor, junto con la preservación en precisión original de los componentes sensibles a la cuantización. Se ha publicado también una variante hermana, SenseNova-Loop-9B-NVFP4-MLP, que cuantiza únicamente las MLPs y queda más cerca del BF16 a cambio de menor velocidad (12 tok/s).

## Capacidades

- Generación de texto y conversación multi-turno.
- Razonamiento y matemáticas (capacidades heredadas del modelo base; sin datos de benchmarks específicos en la información disponible).
- Generación de código (el dataset de calibración incluye código, lo que sugiere soporte, aunque no se detallan métricas).
- Procesamiento multimodal: incluye tower de visión, por lo que el modelo base es de tipo conditional generation con entrada de imagen.
- Predicción multi-token mediante la cabeza MTP.
- Contexto largo de hasta 512K tokens gracias a YaRN ×2.
- Capacidades multilingües: la calibración incluye textos en inglés y alemán, pero no se especifica la lista oficial de idiomas soportados.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en DGX Spark o GB10: el modelo está optimizado para vLLM sobre Blackwell y cabe en 7,7 GiB de memoria unificada, lo que permite servir un modelo de 9,6B parámetros en hardware de borde con espacio para caché KV y otros modelos.
- Servicio de chat con múltiples usuarios concurrentes: con 81,1 tok/s agregados en cuatro flujos concurrentes en una GB10, es adecuado para asistentes conversacionales con carga moderada.
- Procesamiento de documentos largos: el contexto de hasta 512K tokens permite analizar contratos, informes o bases de código extensas en una sola pasada.
- Generación de código en entornos con recursos limitados: al ocupar solo 7,7 GiB, puede convivir con otras herramientas en la misma GPU y acelerar tareas de autocompletado o revisión de código.
- Prototipado de aplicaciones multimodales: la presencia del tower de visión permite experimentar con tareas imagen-texto en hardware Blackwell de gama de borde.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir el impacto de NVFP4 frente a GGUF Q4_K_M o MLX en términos de KLD y coincidencia de token principal.
- Investigación sobre arquitecturas con bucles: al conservar routers mHC, compuertas de bucle y DeltaNet en precisión original, es útil para estudiar el comportamiento de transformers con bucle en producción.

## Benchmarks y rendimiento

Rendimiento en DGX Spark (GB10), vLLM 0.31.0 con el plugin `vllm-sensenova-loop`, caché KV en BF16, decodificación greedy, prompt de prefill de ~4,8K tokens, decodificación de 256 tokens, sin decodificación especulativa:

| Compilación | Peso en memoria | Prefill tok/s | Decode 1 flujo | Decode 4 flujos (total) |
|---|---:|---:|---:|---:|
| BF16 (fuente) | 16,9 GiB | 1.785 | 7,5 tok/s | 31,1 tok/s |
| Esta compilación | 7,7 GiB | 1.492 | 21,2 tok/s | 81,1 tok/s |
| NVFP4-MLP | 10,5 GiB | 1.563 | 12,4 tok/s | 54,6 tok/s |

Calidad frente a otras compilaciones de 4 bits, medida con KLD medio sobre 72.633 posiciones (chunks de 2.048 tokens, solo se puntúa la segunda mitad, distribución completa de 248K tokens comparada contra el GGUF BF16 de SenseNova):

| Compilación | Tamaño | KLD medio ↓ | Mismo token principal ↑ |
|---|---:|---:|---:|
| AtomicChat AD-Q4_K_M (GGUF, imatrix) | 5,96 GB | 0,054 | 92,6 % |
| NVFP4-MLP | 12,4 GB | 0,087 | 90,0 % |
| SenseNova Q4_K_M (GGUF oficial) | 5,82 GB | 0,111 | 89,2 % |
| balllvin NVFP4 (QAD) | 8,9 GB | 0,139 | 87,3 % |
| Esta compilación | 9,4 GB | 0,151 | 86,8 % |

Como referencia, en la misma máquina el fork de llama.cpp de SenseNova (`blueswhen/llama.cpp@24ea7bb7`, CUDA, `-fa on`) ejecutó los GGUF Q4_K_M a ~600 tok/s de prefill y 4 tok/s de decodificación. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 7,7 GiB de pesos en memoria; añadir la caché KV en BF16, cuyo tamaño depende de la longitud de contexto y del número de flujos concurrentes.
- GPUs recomendadas: NVIDIA Blackwell, en particular DGX Spark / GB10 y GB10. En GPUs NVIDIA anteriores a Blackwell no está probado, aunque vLLM puede ejecutar pesos NVFP4 mediante Marlin.
- Cabe en GPU de consumo: no confirmado para GPUs de consumo; el hardware medido es una DGX Spark con GB10.
- Opciones de despliegue: vLLM 0.31.0 con el plugin `vllm-sensenova-loop` (única opción medida). Para llama.cpp se recomiendan los GGUF de AtomicChat o SenseNova, que requieren el fork de llama.cpp de SenseNova. Para Apple Silicon existen builds MLX, por ejemplo de NetProjects.
- Latencia y throughput: prefill de 1.492 tok/s, decodificación de 21,2 tok/s con un flujo y 81,1 tok/s con cuatro flujos en una GB10, sin decodificación especulativa.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SenseNova-Loop-9B-NVFP4 (este) | 9,66B | 512K | NVFP4 safetensors | Apache 2.0 | Hugging Face (Kaleto) |
| SenseNova-Loop-9B-NVFP4-MLP | 9,66B | 512K | NVFP4 safetensors | Apache 2.0 | Hugging Face (Kaleto) |
| SenseNova-Loop-9B Q4_K_M (GGUF oficial) | 9,66B | 512K | GGUF | Apache 2.0 | Hugging Face (SenseNova) |
| AtomicChat SenseNova-Loop-9B AD-Q4_K_M | 9,66B | 512K | GGUF | Apache 2.0 | Hugging Face (AtomicChat) |
| SenseNova-Loop-9B BF16 (fuente) | 9,66B | 512K | safetensors BF16 | Apache 2.0 | Hugging Face (SenseNova) |

Todas las alternativas comparten la misma arquitectura y tamaño; las diferencias están en el formato de cuantización, el equilibrio calidad/velocidad y el motor de inferencia recomendado. No se dispone de comparación con modelos de otras familias en la información proporcionada.

## Limitaciones y advertencias

- La calidad de esta compilación es la más baja del conjunto comparado en KLD (0,151) y en coincidencia de token principal (86,8 %), por debajo de las alternativas GGUF Q4_K_M y NVFP4-MLP.
- El modelo está pensado para velocidad en Blackwell; si prima la precisión por byte, la variante NVFP4-MLP o los GGUF son mejores opciones.
- Solo se ha medido en DGX Spark / GB10; el rendimiento en otras GPUs Blackwell o anteriores no está verificado.
- Requiere vLLM con el plugin `vllm-sensenova-loop` y código personalizado (`custom_code`), lo que añade complejidad de despliegue.
- No es compatible directamente con llama.cpp ni con Apple Silicon; para esos entornos hay que usar otros builds.
- La lista de idiomas soportados no está publicada; la calibración solo cubre inglés y alemán, además de código y chat.
- No hay datos publicados sobre sesgos, tasa de alucinación ni evaluaciones de seguridad en la información disponible.
- El modelo base incluye visión, pero no se detallan limitaciones específicas del tower de visión en esta compilación.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de los componentes de terceros.

## Enlaces

- Hugging Face (esta compilación): https://huggingface.co/Kaleto/SenseNova-Loop-9B-NVFP4
- Modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B
- Variante NVFP4-MLP: https://huggingface.co/Kaleto/SenseNova-Loop-9B-NVFP4-MLP
- GGUF de AtomicChat: https://huggingface.co/AtomicChat/SenseNova-Loop-9B-GGUF
- GGUF oficial de SenseNova: https://huggingface.co/sensenova/SenseNova-Loop-9B-GGUF
- Build MLX de NetProjects: https://huggingface.co/netprojects/SenseNova-Loop-9B-MLX-6bit
- NVFP4 de balllvin: https://huggingface.co/balllvin/SenseNova-Loop-9B-NVFP4
- nvidia-modelopt: https://github.com/NVIDIA/TensorRT-Model-Optimizer
- Fork de llama.cpp de SenseNova: `blueswhen/llama.cpp@24ea7bb7` (referenciado en la model card, sin URL directa disponible)
