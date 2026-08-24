# rdtand/Qwen3.8-27B-PrismaScout-AQUA-20GB

## Resumen

Qwen3.8-27B-PrismaScout-AQUA-20GB es una cuantización de precisión mixta del modelo denso Qwen/Qwen3.8-27B, desarrollada por rdtand bajo el proyecto PrismaQuant. El objetivo es ajustar el modelo completo dentro de un límite estricto de 20.000.000.000 bytes (20 GB decimales) en el repositorio, manteniendo la mayor fidelidad posible respecto al original en BF16. El resultado final ocupa 19.974.334.328 bytes, dejando un margen de 25,6 MB bajo el límite.

La cuantización utiliza el método AQUA, que asigna de forma independiente la precisión de cada capa Linear del cuerpo del modelo, teniendo en cuenta el error de activación relevante para NVFP4 W4A4. El `lm_head` sin atar y los ocho Linears del módulo MTP (multi-token prediction) se mantienen en FP8 E4M3. La torre de visión está físicamente ausente, por lo que el modelo es exclusivamente de texto. Se distribuye como un checkpoint estándar de `compressed-tensors` y puede servirse con vLLM vanilla, sin necesidad de plugins adicionales.

La relevancia de este modelo radica en que demuestra que es posible cuantizar un modelo de 27B a un tamaño de 20 GB con una pérdida de calidad contenida (la perplejidad en WikiText-2 sube un 3,90 % respecto al BF16) y con mejoras de rendimiento en decodificación especulativa gracias al soporte MTP. Está pensado para entornos con GPUs Blackwell como la DGX Spark, aunque existen variantes para GPUs consumer como la RTX 5080.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención híbrida (16 capas con atención completa, 48 con atención lineal) |
| Parametros totales | 17.434.756.096 (dato real de safetensors) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | NVFP4 (W4A4) en el cuerpo, FP8 E4M3 en `lm_head` y MTP, precisión mixta |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es el miembro denso de 27.000 millones de parámetros de la familia Qwen3.8, con una arquitectura de atención híbrida: solo 16 de las 64 capas utilizan atención completa (con un intervalo de atención completa de 4), mientras que las otras 48 emplean atención lineal con un estado recurrente constante. Esta combinación reduce el coste computacional en contextos largos manteniendo la capacidad de razonamiento.

La cuantización PrismaScout-AQUA no modifica la arquitectura, sino que comprime los pesos del modelo original. El método AQUA asigna de forma independiente la precisión de cada capa Linear del cuerpo, considerando el error de activación que afecta a NVFP4 W4A4. El `lm_head` sin atar y los ocho Linears del módulo MTP se mantienen en FP8 E4M3 para preservar la calidad de la predicción de tokens y la decodificación especulativa. Las ventanas de calibración se tomaron del conjunto de entrenamiento de WikiText, y la perplejidad reportada se midió sobre WikiText-2 test, evitando la reutilización de la misma partición.

El modelo incluye soporte para MTP (multi-token prediction), que permite decodificación especulativa con vLLM, y se sirve como checkpoint estándar de `compressed-tensors` sin necesidad de plugins adicionales.

## Capacidades

- Generación de texto exclusivamente (sin visión, la torre de visión está ausente).
- Razonamiento y comprensión del lenguaje gracias al modelo base Qwen3.8-27B.
- Decodificación especulativa mediante MTP (multi-token prediction) con hasta 3 tokens de predicción adicional, lo que acelera la generación.
- Soporte nativo en vLLM vanilla, incluyendo CUDA graphs, caché KV en FP8 y prefijo de caché.
- Cuantización de precisión mixta que mantiene una pérdida de calidad contenida respecto al BF16 original.
- Compatible con entornos Blackwell (DGX Spark) y, en variantes específicas, con GPUs consumer como la RTX 5080.

## Casos de uso

- Inferencia de alto rendimiento en DGX Spark: el modelo está optimizado para GPUs Blackwell y puede servirse con vLLM, aprovechando CUDA graphs y caché KV en FP8 para reducir la latencia de prefill y decode.
- Despliegue en entornos con restricciones de almacenamiento: al ocupar menos de 20 GB, cabe en repositorios y sistemas con límites estrictos de tamaño, manteniendo un modelo de 27B con calidad razonable.
- Generación de texto con baja latencia: el soporte MTP permite decodificación especulativa, alcanzando hasta 30,94 tokens/s en C1 y 95,91 tokens/s en C4 con MTP-3, según las mediciones del autor.
- Evaluación de calidad de cuantización: el modelo incluye métricas detalladas de divergencia KL y perplejidad, útil para investigadores que estudian el impacto de la cuantización NVFP4 en modelos densos.
- Sustitución de modelos BF16 en producción cuando el presupuesto de VRAM o almacenamiento es limitado: la pérdida de perplejidad es solo del 3,90 % en WikiText-2, aceptable para muchas aplicaciones.
- Experimentación con atención híbrida: al estar basado en Qwen3.8-27B, permite probar el comportamiento de la atención lineal con estado recurrente en tareas de generación larga.

## Benchmarks y rendimiento

El autor proporciona mediciones detalladas de calidad y rendimiento en la model card. Las métricas de calidad se obtuvieron con los bytes exportados, sin decodificación especulativa y con la misma pila vLLM fijada. Las comparaciones BF16 usan la revisión exacta de Qwen3.8 documentada en Provenance.

| Medición | Artefacto exportado | Fuente BF16 | Coste de cuantización |
|---|---:|---:|---:|
| KL, todas las posiciones de siguiente token (8 × 512 → 4.088) | 0,04022 | — | — |
| KL, posiciones de alta confianza (top-1 del profesor > 0,5; 2.063 posiciones) | 0,02395 | — | — |
| KL p99 / máximo | 0,34029 / 1,86000 | — | — |
| Perplejidad WikiText-2 test (8.176 tokens puntuados @ 512) | 9,7312 | 9,3662 | +3,90 % |
| NLL media WikiText-2 | 2,27534 | 2,23711 | +0,03823 nats/token |
| Perplejidad suite de prompts fijos / NLL p99 | 4,0743 / 1,9380 | 3,9813 / 1,9149 | +2,34 % PPL |
| Suite de coherencia de generación | PASS, 4 de 4 | — | — |

En cuanto a rendimiento, el autor compara este modelo con su predecesor Qwen3.6-27B-PrismaSCOUT en la misma DGX Spark, mismo contenedor, con CUDA graphs, caché KV FP8, prefijo de caché y semillas fijas:

| Carga de trabajo | Qwen3.6 PrismaScout | PrismaScout-AQUA | Ratio AQUA / Qwen3.6 |
|---|---:|---:|---:|
| Prefill C1 (tok/s entrada; TTFT) | 3.047,77 ± 0,47; 671,8 ms | 3.035,94 ± 3,11; 674,4 ms | 0,9961× |
| Prefill C4 (tok/s entrada; TTFT) | 11.529,79 ± 28,31; 675,4 ms | 11.297,28 ± 168,75; 686,0 ms | 0,9798× |
| Decode sin especulación C1 (tok/s salida; TPOT) | 12,58136 ± 0,00009; 79,40 ms | 12,97836 ± 0,00390; 76,95 ms | 1,0316× |
| Decode sin especulación C4 (tok/s salida; TPOT) | 48,90230 ± 0,01747; 81,28 ms | 48,99464 ± 0,03962; 81,09 ms | 1,0019× |
| Decode MTP-3 C1 (tok/s salida; TPOT) | 24,6393 ± 1,7580; 40,05 ms | 30,9371 ± 2,1886; 31,85 ms | 1,2556× |
| Decode MTP-3 C4 (tok/s salida; TPOT) | 83,0368 ± 7,0968; 39,93 ms | 95,9148 ± 12,4466; 35,24 ms | 1,1551× |

Además, en una auditoría de error de cuantización con el mismo protocolo (8×512 ventanas, semilla 42, 4.088 posiciones, top-1.024 probabilidades más masa residual), PrismaScout-AQUA obtiene una KL media de 0,04022 frente a 0,07793 del predecesor, un 48,4 % menor.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 19,97 GB, pero en memoria con vLLM y caché KV FP8 puede requerir entre 20 y 24 GB según el contexto y el número de peticiones concurrentes.
- GPU recomendadas: DGX Spark (Blackwell) para el rendimiento óptimo; también existe una variante específica para RTX 5080 (Qwen3.8-27B-PrismaAQUA-gridbook-13GB-5080-vllm) que reduce el tamaño a 13 GB.
- En GPUs consumer con 24 GB de VRAM (RTX 4090, RTX 5090) puede caber con cuantización adicional o contextos reducidos, aunque no está oficialmente validado.
- Opciones de despliegue: vLLM (soporte nativo, incluyendo CUDA graphs, caché KV FP8 y prefijo de caché), y cualquier framework compatible con `compressed-tensors`.
- Latencia y rendimiento: en DGX Spark, prefill C1 a 3.035 tok/s (TTFT 674 ms), decode sin especulación a 12,98 tok/s (TPOT 77 ms) y decode con MTP-3 a 30,94 tok/s (TPOT 32 ms) para una sola petición. Con cuatro peticiones concurrentes, el throughput agregado alcanza 11.297 tok/s en prefill y 95,91 tok/s en decode con MTP-3.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Tamaño repo | KL media | WikiText-2 PPL | Licencia |
|---|---|---|---:|---:|---:|---:|
| Qwen3.8-27B-PrismaScout-AQUA-20GB | 17,43B (cuantizado) | NVFP4 + FP8 mixto | 19,97 GB | 0,04022 | 9,7312 | Apache-2.0 |
| Qwen3.6-27B-PrismaSCOUT-Blackwell-NVFP4-BF16-vllm | ~27B (cuantizado) | NVFP4 + BF16 | No disponible | 0,07793 (remedido) | No disponible | Apache-2.0 |
| Qwen/Qwen3.8-27B (BF16 original) | 27B | Sin cuantizar | ~54 GB | — | 9,3662 | Apache-2.0 |

La comparación directa con el predecesor Qwen3.6 muestra que AQUA reduce la KL media un 48,4 % bajo el mismo protocolo de medición, y mejora el rendimiento en decodificación especulativa hasta un 25,6 % en C1. Frente al modelo BF16 original, la pérdida de perplejidad es del 3,90 %, un coste asumible para una reducción de tamaño de más del 60 %.

## Limitaciones y advertencias

- Modelo exclusivamente de texto: la torre de visión está físicamente ausente, por lo que no puede procesar imágenes ni vídeo.
- La cuantización NVFP4 W4A4 introduce una pérdida de calidad medible: la perplejidad en WikiText-2 sube un 3,90 % y la KL media es de 0,04022, con una cola pesada (p99 de 0,34 y máximo de 1,86), lo que indica que algunas posiciones pueden degradarse notablemente.
- La KL reportada es una cota inferior de la KL exacta sobre el vocabulario completo, ya que solo se conservan las top-1.024 probabilidades del profesor más un cubo para la masa residual.
- El rendimiento con MTP es variable: el coeficiente de variación del throughput de salida es del 7,1–13,0 %, dependiendo de la semilla y de la tasa de aceptación especulativa.
- No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para esta cuantización concreta; las métricas disponibles se limitan a perplejidad, KL y rendimiento de inferencia.
- La longitud de contexto no está documentada en la información disponible; se recomienda consultar la ficha del modelo base Qwen3.8-27B.
- El modelo está optimizado para GPUs Blackwell; en otras arquitecturas puede requerir adaptaciones o presentar un rendimiento inferior.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rdtand/Qwen3.8-27B-PrismaScout-AQUA-20GB
- Proyecto PrismaQuant: https://prismaquant.org
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Predecesor Qwen3.6-27B-PrismaSCOUT: https://huggingface.co/rdtand/Qwen3.6-27B-PrismaSCOUT-Blackwell-NVFP4-BF16-vllm
- Variante para RTX 5080 (13 GB): https://huggingface.co/rdtand/Qwen3.8-27B-PrismaAQUA-gridbook-13GB-5080-vllm
- Recetas vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Benchmarks y contexto de Qwen3.8-27B: https://benchlm.ai/models/qwen3-8-27b
