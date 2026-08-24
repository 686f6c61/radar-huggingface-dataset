# eemin/Qwen3.8-27B-NVFP4-lmhead4-recipe

## Resumen

`eemin/Qwen3.8-27B-NVFP4-lmhead4-recipe` no es un modelo con pesos, sino una **receta de despliegue medida** para ejecutar el modelo Qwen3.8-27B de Alibaba en una única RTX 5090 de 32 GB usando SGLang con cuantización NVFP4 y decodificación especulativa EAGLE/MTP. El autor publica scripts ejecutables y todas las cifras obtenidas en su hardware, incluyendo barras de error, con el objetivo de que otros puedan reproducir el mismo rendimiento sin adivinar parámetros.

El modelo base, Qwen3.8-27B, es un transformer denso de 27 mil millones de parámetros con arquitectura híbrida: solo 16 de sus 64 capas usan atención completa y las otras 48 usan atención lineal con estado recurrente constante. La receta consigue pasar de 68 a 162.6 tokens por segundo en contexto corto y de 81.0 tok/s con contexto de 63K, con un contexto útil de 134,016 tokens, todo en una GPU de gama consumer. La relevancia actual radica en que demuestra que un modelo de 27B con cuantización FP4 y decodificación especulativa cabe y rinde bien en hardware doméstico de última generación, algo que antes requería múltiples GPUs o servidores.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido (16 capas full attention + 48 capas linear attention con estado recurrente GDN) |
| Parametros totales | 27 mil millones (27B) |
| Parametros activos | No disponible (modelo denso, no MoE) |
| Longitud de contexto | 134,016 tokens (medido con MTP activo); 272,800 tokens sin MTP (medido) |
| Tipos de cuantizacion | NVFP4 (W4A4) para pesos y lm_head; KV-cache FP8 e4m3 |
| Idiomas soportados | en (declarado en la receta; el modelo base Qwen3.8-27B es multilingüe) |
| Licencia | Apache-2.0 |
| Formato de pesos | NVFP4 (safetensors), sin GGUF |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B pertenece a la familia Qwen3.8 de Alibaba y comparte el backbone híbrido del flagship MoE de 2.4T, pero como variante densa de 27B. La capa mix es la clave: solo 16 de las 64 capas ejecutan atención completa (intervalo de 4), mientras las otras 48 usan atención lineal con un estado recurrente constante, lo que reduce el coste computacional en contextos largos. El modelo es nativamente multimodal según el repositorio oficial de Alibaba, aunque esta receta se centra exclusivamente en generación de texto.

La receta de `eemin` no entrena ni ajusta los pesos: cuantiza el checkpoint base a NVFP4 (incluyendo el `lm_head`, que pasa de BF16 a FP4) y configura SGLang con decodificación especulativa EAGLE (multi-token prediction, MTP) con 5 pasos de especulación y 6 tokens de borrador, atención FlashInfer y KV-cache en FP8. El autor documenta que el MTP añade 5.53 GB de buffers y cuesta aproximadamente 160K tokens de contexto, pero duplica el throughput en contextos por debajo de 130K.

## Capacidades

- Generación de texto con alta velocidad en una sola GPU: 162.6 tok/s en contexto corto y 81.0 tok/s a 63K tokens.
- Soporte de decodificación especulativa EAGLE con MTP (multi-token prediction) para acelerar la inferencia.
- Manejo de contexto largo de hasta 134K tokens con MTP activado, y 272K sin MTP.
- Soporte de tool calling y parsing de razonamiento integrado en SGLang (`--tool-call-parser qwen3_coder`, `--reasoning-parser qwen3`).
- Capacidad de ejecutarse en una sola GPU consumer de 32 GB (RTX 5090, SM120).
- Cuantización NVFP4 W4A4 con soporte para backend cutlass en SM120 (el backend cudnn pierde rendimiento y cutedsl no está soportado en esa arquitectura).

## Casos de uso

- **Inferencia local de alta velocidad en una sola GPU**: la receta permite servir un modelo de 27B a más de 160 tok/s en una RTX 5090, lo que habilita aplicaciones de chat y agentes en hardware de escritorio sin depender de la nube.
- **Agentes con contexto largo**: con 134K tokens de contexto y soporte de tool calling, el modelo puede mantener conversaciones multi-turno con historial extenso y ejecutar llamadas a funciones externas de forma fiable.
- **Razonamiento multi-paso**: el parser de razonamiento `qwen3` y la capacidad de generar cadenas de pensamiento lo hacen adecuado para tareas de matemáticas, lógica y planificación que requieren varios pasos intermedios.
- **Despliegue en entornos con presupuesto de VRAM ajustado**: la cuantización NVFP4 reduce el peso a 18.59 GB, dejando margen para KV cache y buffers MTP en una tarjeta de 32 GB, lo que permite ejecutar el modelo en servidores de gama media.
- **Benchmarking de técnicas de optimización**: la receta incluye scripts de verificación (`agentic_bench.py`, `correctness.py`) que permiten medir rendimiento y calidad de forma reproducible, útil para equipos que evalúan configuraciones de SGLang.
- **Experimentos de decodificación especulativa**: el análisis detallado de MTP (configuraciones de 5/1/6 frente a otras combinaciones) sirve como guía práctica para quien quiera ajustar EAGLE en otros modelos híbridos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor proporciona mediciones de throughput y contexto obtenidas en su hardware (RTX 5090, SM120, PCIe 3.0), que se resumen a continuación:

| Configuración | Contexto corto (tok/s) | 63K contexto (tok/s) | Contexto utilizable (tokens) |
|---|---|---|---|
| Con MTP (EAGLE 5/1/6) | 162.6 | 81.0 | 134,016 |
| Sin MTP (mem-fraction 0.90) | 74.2 | 57.1 | 272,800 |
| Con MTP a 63K (mem-fraction 0.90) | 165.0 | 83.0 | 62,880 |
| Sin MTP a 128K | no aplica | no aplica | 45.7 tok/s |
| Sin MTP a 200K | no aplica | no aplica | 36.5 tok/s |

El autor también documenta el presupuesto de memoria medido al arrancar: pesos 18.59 GB, MTP 5.53 GB, pool GDN 1.94 GB, KV cache 3.88 GB, y 0.68 GB libres. El coste por token de contexto es de 34 KB.

## Requisitos de hardware

- **VRAM estimada**: 32 GB para la configuración completa con MTP y contexto de 134K tokens. Sin MTP, se puede operar con el mismo presupuesto pero con contexto de 272K tokens.
- **GPU recomendada**: RTX 5090 (32 GB, SM120). La receta está validada solo en esta tarjeta; no se indica compatibilidad con otras GPUs. El backend `cutedsl` no está soportado en SM120 (solo SM100), y el backend `flashinfer_cudnn` reduce el rendimiento.
- **CPU y sistema**: se requiere una plataforma con PCIe 3.0 como mínimo (el autor usa PCIe 3.0 sin cuello de botella aparente).
- **Opciones de despliegue**: SGLang (imagen `lmsysorg/sglang:qwen38-27b`) con la configuración exacta proporcionada. No se documenta despliegue con vLLM, llama.cpp u Ollama.
- **Latencia y throughput**: 162.6 tok/s en contexto corto, 81.0 tok/s a 63K, con un solo request concurrente. La concurrencia (2 o 4 requests) reduce el contexto disponible en un 75% y no mejora el throughput en modo de una sola secuencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|
| **Qwen3.8-27B (base, BF16)** | 27B | 272K (según receta sin MTP) | Apache-2.0 | BF16 | ~68 tok/s en RTX 5090 (punto de partida de la receta) |
| **eemin/Qwen3.8-27B-NVFP4-lmhead4-recipe** | 27B | 134K (con MTP) | Apache-2.0 | NVFP4 | 162.6 tok/s (corto), 81.0 tok/s (63K) |
| **FenomAI/Qwen3.8-27B-NVFP4** | 27B | no disponible | Apache-2.0 | NVFP4 | no disponible |
| **RadixArk/Qwen3.8-27B-NVFP4** | 27B | no disponible | Apache-2.0 | NVFP4 (W4A4) | no disponible |

La comparativa es cualitativa porque no se dispone de benchmarks estándar del modelo base ni de las otras variantes NVFP4 en la información disponible. La diferencia clave de la receta es la optimización del `lm_head` y la configuración de MTP, que duplica el throughput a costa de reducir el contexto a la mitad.

## Limitaciones y advertencias

- **No es un modelo con pesos**: el repositorio solo contiene scripts y mediciones; hay que descargar el checkpoint NVFP4 de Qwen3.8-27B por separado.
- **Concurrencia limitada**: el autor recomienda `--max-running-requests 1`; con 2 requests el contexto cae a 100,480 tokens y con 4 no cabe en la GPU. No está pensado para servir a varios usuarios simultáneos.
- **Trampa del contexto**: `--context-length` solo declara un valor, no reserva memoria. El valor real es `max_total_num_tokens` (134,016 en esta config); un cliente que use el valor declarado (159,776) puede recibir fallos en runtime.
- **El valor oficial de `--mamba-full-memory-ratio` (8.26) es incorrecto para contexto largo**: reduce el contexto un 58%. El autor recomienda 0.9 para la mayoría de casos y 0.3 si se quiere maximizar el KV pool.
- **MTP cuesta contexto**: activar la decodificación especulativa duplica el throughput pero reduce el contexto de 272K a ~62K (con mem-fraction 0.90) o 134K (con 0.97). Por debajo de ~130K de contexto, MTP siempre gana.
- **Sin MTP hay que bajar `mem-fraction-static` a 0.90**: a 0.97 el pool crece tanto que el primer request falla con OOM en el arranque.
- **Idioma**: la model card declara solo inglés; aunque el modelo base es multilingüe, la receta no está validada para otros idiomas.
- **Hardware específico**: las mediciones son válidas solo para RTX 5090 (SM120). En otras arquitecturas los backends de FP4 y atención pueden comportarse de forma distinta.
- **Riesgo de alucinación**: no se documenta específicamente, pero es inherente a los LLM de 27B; la receta no incluye mitigaciones adicionales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/eemin/Qwen3.8-27B-NVFP4-lmhead4-recipe
- Modelo base Qwen3.8-27B (Alibaba): https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Variante NVFP4 de FenomAI: https://huggingface.co/FenomAI/Qwen3.8-27B-NVFP4
- Variante NVFP4 de RadixArk: https://huggingface.co/RadixArk/Qwen3.8-27B-NVFP4
- Ficha de Qwen3.8-27B en vLLM Recipes: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Receta para DGX Spark: https://github.com/hiceron/spark-qwen38-27b
