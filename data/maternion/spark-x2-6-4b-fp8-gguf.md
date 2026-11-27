# maternion/Spark-X2.6-4B-FP8-GGUF

## Resumen

Spark-X2.6-4B-FP8-GGUF es una conversión no oficial, realizada por el usuario maternion, del checkpoint FP8 XHToken/Spark-X2.6-4B-FP8 al formato GGUF para su uso con llama.cpp. La particularidad del paquete es que no dequantiza los pesos: mantiene las proyecciones en `F8_E4M3` con sus escalas originales por canal de salida (`F32`, una por fila), de modo que el resultado es una copia fiel del modelo FP8 publicado, no una cuantización de 8 bits del modelo BF16. El repositorio ocupa 4,5 GB y contiene 470 tensores.

El modelo subyacente, Spark-X2.6-4B, es un transformer de 4.113.222.144 parámetros (aproximadamente 4,1 mil millones) desarrollado por XHToken y orientado a agentes que se ejecutan en dispositivo (*on-device agents*). Está pensado para tareas del mundo real en entornos con recursos limitados, con soporte declarado de inglés y chino y licencia Apache 2.0.

La relevancia de esta ficha radica en dos factores: por un lado, permite ejecutar en local un modelo de 4B en precisión FP8 casi sin pérdida respecto al checkpoint original; por otro, ilustra una ruta de conversión todavía poco común (preservación de FP8 en GGUF) que exige versiones recientes de llama.cpp y presenta limitaciones concretas de backend que conviene conocer antes de desplegarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Spark-X2.6-4B de XHToken); detalles internos no disponibles en la información proporcionada |
| Parametros totales | 4.113.222.144 |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible de forma oficial; el ejemplo de ejecución del autor usa `-c 8192` |
| Tipos de cuantizacion | FP8 (`F8_E4M3`) con escalas `F32` por canal de salida; no re-cuantizable con `llama-quantize` |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero `Spark-X2.6-4B-FP8.gguf`, 4,15 GiB) |

## Arquitectura y entrenamiento

El paquete GGUF reproduce el checkpoint FP8 original sin dequantizar. El fichero contiene 470 tensores: 180 en `F8_E4M3` (todas las proyecciones matmul), 180 escalas `F32` asociadas (una por canal de salida), 253 tensores `F32` (normalizaciones y escalas) y 37 en `BF16` (embedding de tokens y la puerta de atención de anchura 16). El resultado es de aproximadamente 8,05 bits por peso (bpw). La conversión se realizó con `convert_hf_to_gguf.py` en modo `--outtype auto`, que preserva FP8 cuando el formato de escalas es compatible; el autor documenta dos métodos añadidos al conversor `Spark2_5Model` (`_map_fp8_weight_names` y `_transform_fp8_scale`) para mapear la proyección de atención fusionada `self_attn.q_k_v_proj.weight` y conservar las escalas por fila.

En cuanto al modelo base, la información disponible no detalla la composición del dataset de entrenamiento, el número de tokens, ni si hubo etapas de RLHF o DPO. La model card original se presenta bajo el lema de "avanzar la frontera de los agentes on-device para tareas del mundo real", lo que sitúa el entrenamiento en el ámbito de modelos pequeños orientados a uso agéntico, pero sin cifras públicas en el material consultado. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` y el pipeline `text-generation` confirman su uso para diálogo multi-turno.
- Orientación a agentes: el modelo base se presenta explícitamente como un modelo para agentes on-device en tareas del mundo real.
- Soporte bilingüe inglés-chino.
- Ejecución local en CPU, CUDA, ROCm (HIP) y Metal mediante llama.cpp.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- No se documentan en la información disponible capacidades de visión, audio, tool calling explícito ni modo de razonamiento extendido (*thinking mode*).

## Casos de uso

- Asistente conversacional local: el modelo puede mantener diálogos multi-turno en inglés o chino ejecutándose íntegramente en el dispositivo, sin depender de APIs externas, gracias a su tamaño de 4B y a la ventana de contexto configurable en llama.cpp (el autor verifica 8192 tokens).
- Agente de automatización en escritorio: al estar orientado a agentes on-device, encaja en flujos que necesitan un modelo pequeño que quepa en la memoria de un equipo de gama media y responda con latencia baja.
- Procesamiento de texto en equipos con GPU de consumo: con 4,15 GiB de pesos FP8, cabe en GPUs de 8 GB o más, lo que permite desplegarlo en estaciones de trabajo modestas.
- Referencia de calidad FP8 para evaluación: al ser una copia sin pérdida del checkpoint FP8, sirve para medir el impacto real de la cuantización comparando sus salidas con las de cuantizaciones GGUF de menor precisión derivadas del modelo BF16.
- Traducción y generación bilingüe inglés-chino: el soporte declarado de ambos idiomas lo hace utilizable en tareas de redacción y adaptación de contenido entre esas dos lenguas.
- Prototipado de pipelines agénticos con llama.cpp: su integración directa con `llama-cli` y `llama-perplexity` permite validar flujos de razonamiento multi-paso antes de migrar a un modelo mayor.
- Inferencia en hardware AMD: el autor verifica el funcionamiento en ROCm con una Radeon RX 9060 XT, lo que lo convierte en una opción para entornos con GPU AMD donde otras herramientas tienen menos soporte.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 4,15 GiB solo para los pesos; con contexto de 8192 tokens y caché KV en FP16 hay que sumar varios cientos de MiB adicionales según el número de capas y la longitud efectiva de secuencia (no se publican cifras exactas).
- GPU recomendadas: el autor verifica ROCm en AMD Radeon RX 9060 XT. Por tamaño, debería caber en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090, A100 y H100; no se han publicado pruebas en estas GPU.
- GPU de consumo: sí, en cualquier tarjeta con 8 GB o más de VRAM, siempre que el backend soporte las escalas FP8.
- Opciones de despliegue: llama.cpp (compilación a partir del commit `a38695013` o posterior, que incluye el soporte de escalas para FP8 y NVFP4, PR #28898). No se documenta compatibilidad con vLLM, TGI u Ollama.
- Backends: CPU, CUDA, HIP (ROCm) y Metal aplican las escalas; Vulkan todavía no (issue ggml-org/llama.cpp#29791) y recurre a CPU para estos tensores, por lo que se recomienda compilación ROCm, CUDA o Metal en GPU.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Spark-X2.6-4B-FP8-GGUF (este) | 4,11B | No disponible (ejemplo con 8192) | GGUF FP8 preservado | Apache 2.0 | Conversión no oficial; requiere llama.cpp reciente |
| XHToken/Spark-X2.6-4B-FP8 | 4,11B | No disponible | Safetensors FP8 (compressed-tensors) | Apache 2.0 | Checkpoint original; requiere Transformers |
| Cuantizaciones GGUF derivadas del BF16 | 4,11B | No disponible | GGUF Q4/Q5/Q8 | Apache 2.0 | No disponibles en la información proporcionada |

No se dispone de datos de benchmarks ni de otros modelos comparables de la misma categoría en la información consultada.

## Limitaciones y advertencias

- Conversión no oficial: el paquete no está afiliado ni respaldado por XHToken; la responsabilidad de validación recae en quien lo despliega.
- Requiere llama.cpp en el commit `a38695013` o posterior. Versiones anteriores fallan con el error `check_tensor_dims: tensor 'blk.0.attn_output.scale' has wrong shape; expected 1, got 2560, 1, 1, 1`.
- El backend Vulkan no aplica las escalas FP8 y recurre a CPU, con la consiguiente penalización de rendimiento.
- No se puede re-cuantizar con `llama-quantize`: `F8_E4M3` es un tipo de almacenamiento con escalas externas, por lo que este fichero sirve como referencia de ~8 bpw y no como entrada de una escalera de cuantización.
- Idiomas limitados a inglés y chino; no se declara soporte de castellano.
- No se publican datos de sesgos, tasa de alucinación ni evaluaciones de seguridad del modelo base.
- La información sobre la longitud de contexto oficial, la composición del dataset y el proceso de alineación no está disponible, lo que dificulta estimar su comportamiento en dominios especializados.
- Licencia Apache 2.0 permite uso comercial, pero al tratarse de una conversión de terceros conviene revisar los términos del modelo original antes de integrarlo en producción.

## Enlaces

- Repositorio GGUF: https://huggingface.co/maternion/Spark-X2.6-4B-FP8-GGUF
- Modelo base FP8: https://huggingface.co/XHToken/Spark-X2.6-4B-FP8
- llama.cpp: https://github.com/ggml-org/llama.cpp
- PR de soporte de escalas FP8/NVFP4: https://github.com/ggml-org/llama.cpp/pull/28898
- Issue de Vulkan sin soporte de escalas FP8: https://github.com/ggml-org/llama.cpp/issues/29791
- Slack de XHToken: https://join.slack.com/t/tokenspark/shared_invite/zt-432qf8l2f-5~dLyXv8uETr0P0UuC07nw
- Discord de XHToken: https://discord.gg/kTDE2Hg8aw
- YouTube de SparkLLM: https://www.youtube.com/@SparkLLM
- dev.to de SparkLLM: https://dev.to/sparkllm
- Bluesky de SparkLLM: https://bsky.app/profile/sparkllm.bsky.social
- X de SparkLLM: https://x.com/sparkllm
- Zhihu de SparkLLM: https://www.zhihu.com/people/zhiikz7qh7m
