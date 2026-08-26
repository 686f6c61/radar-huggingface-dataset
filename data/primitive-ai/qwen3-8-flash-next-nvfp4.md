# primitive-ai/Qwen3.8-Flash-Next-NVFP4

## Resumen

Qwen3.8-Flash-Next-NVFP4 es una cuantización del modelo Qwen3.8-Flash-Next, desarrollada por primitive-ai, que permite ejecutar este modelo multimodal de 125B parámetros en una única GPU Blackwell de 96 GB. El modelo base, lanzado por Alibaba el 26 de agosto de 2026, es un MoE experimental que anticipa la arquitectura Qwen4, con 6B parámetros activos por token y una ventana de contexto de 262K tokens. La cuantización NVFP4 aplicada a los expertos, junto con el tail en BF16, reduce el peso en disco a 186 GB y el uso de VRAM a 88,8 GiB, mientras que la tabla n-gram de 51B se descarga a la RAM del host (~100 GB) con prefetch asíncrono.

Esta build es relevante porque es la única pública que permite servir este modelo en una sola GPU, sin parches de runtime, usando la imagen oficial de vLLM. El autor reporta un rendimiento de 74,4 tokens/s en flujo único y 483,8 tokens/s a concurrencia 32, con una precisión media del 92,2% en una suite de conocimiento de 1.170 ítems y un 84,6% de acierto en llamadas a herramientas. La licencia es Qwen Community 1.0, lo que permite uso comercial con restricciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) sobre arquitectura Qwen4 preview, con tabla n-gram adicional de 51B |
| Parametros totales | 119.602.003.859 (según safetensors); el modelo base declara 125B |
| Parametros activos | 6B por token |
| Longitud de contexto | 262.144 tokens (262K) |
| Tipos de cuantizacion | NVFP4 para expertos, BF16 para el tail (no se ofrecen otras cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community 1.0 (licencia personalizada, no OSI) |
| Formato de pesos | safetensors, compatible con vLLM (imagen oficial `vllm/vllm-openai:qwen38-flash-next`) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un MoE de 125B parámetros totales con 6B activos por token, construido sobre la arquitectura Qwen4 que Alibaba planea usar en su próxima generación. Incluye una tabla n-gram de 51B parámetros adicionales que se utiliza para mejorar la predicción de tokens y que, en esta cuantización, se descarga a la RAM del host. El modelo es multimodal (image-text-to-text), por lo que acepta tanto texto como imágenes como entrada.

La cuantización NVFP4 aplicada por primitive-ai mantiene los 31 tensores MTP (Multi-Token Prediction) byte-idénticos al original, preservando la decodificación especulativa con 3 tokens especulativos. El runtime es la imagen stock de vLLM sin parches, aunque se requieren dos variables de entorno específicas (`VLLM_PLE_CPU_OFFLOAD=1` y `VLLM_PLE_OFFLOAD_READY_TIMEOUT=1800`) para que el offload de la tabla n-gram funcione correctamente en una sola GPU. No se dispone de información sobre el dataset de entrenamiento ni sobre el proceso de alineación (RLHF/DPO) del modelo base.

## Capacidades

- Generación de texto y razonamiento avanzado, con modo de pensamiento (thinking) forzado que separa el razonamiento en el campo `reasoning` y la respuesta final en `content`.
- Comprensión multimodal: acepta imágenes como entrada además de texto (pipeline `image-text-to-text`).
- Tool calling y function calling: validado con el parser `qwen3_coder`, produce llamadas estructuradas con argumentos JSON y `finish_reason: tool_calls`.
- Soporte para agentes y razonamiento multi-paso, gracias a la ventana de contexto de 262K tokens.
- Decodificación especulativa MTP (Multi-Token Prediction) con 3 tokens especulativos, preservada en la cuantización.
- Capacidades multilingües: no especificadas por el autor, aunque el modelo base de Qwen suele soportar múltiples idiomas.
- Razonamiento matemático y de código: el autor reporta GSM8K 98.0 y MMLU-Pro 90.0 en la suite de evaluación.

## Casos de uso

- Despliegue de un modelo de 125B en una sola GPU: permite ejecutar un modelo de gran tamaño en hardware de una sola tarjeta Blackwell (96 GB), reduciendo costes de infraestructura frente a configuraciones multi-GPU. Adecuado para entornos de producción con presupuesto limitado.
- Inferencia multimodal en tiempo real: al aceptar imágenes y texto, puede usarse en aplicaciones de análisis de documentos, captchas, o asistentes visuales, con una latencia de 12,2 ms/token en flujo único.
- Agentes autónomos con tool calling: el modelo puede decidir cuándo llamar a herramientas externas (APIs, bases de datos) y cuándo abstenerse, gracias a su validación en BFCL v4, xLAM/APIGen y otras suites. Es adecuado para pipelines de automatización que requieren razonamiento multi-paso.
- Razonamiento matemático y científico: con GSM8K 98.0 y MMLU-Pro 90.0, puede emplearse en tutoría inteligente, resolución de problemas matemáticos o análisis de datos complejos.
- Generación de código en producción: soporta tool calling y puede integrarse en entornos de desarrollo asistido, generando código con contexto largo (hasta 262K tokens) para repositorios extensos.
- Atención al cliente con contexto largo: la ventana de 262K tokens permite mantener conversaciones multi-turno con historial extenso, ideal para chatbots que necesitan recordar interacciones previas sin truncar.
- Investigación en arquitecturas MoE: al ser una preview de Qwen4, sirve como banco de pruebas para estudiar el comportamiento de MoE con tabla n-gram y decodificación especulativa en hardware de una sola GPU.

## Benchmarks y rendimiento

El autor proporciona resultados medidos en una suite de 1.370 ítems (1.170 de conocimiento y 200 de tool calling) con protocolo fijo: temperatura 0.6, top_p 0.95, top_k 20, thinking forzado, presupuesto de 16.384 tokens, sin parser de razonamiento y puntuando la última respuesta `ANSWER:`. Se usó una RTX PRO 6000 Blackwell con concurrencia 32.

| Métrica | Valor |
|---|---|
| Overall (pooled 1.370 ítems) | 90.2 |
| Knowledge (1.170 ítems, media de 2 runs) | 92.2 |
| Tool calling - call (160 ítems) | 84.6 |
| Tool calling - abstain (40 ítems) | 56.7 |
| GSM8K | 98.0 |
| MMLU-Pro | 90.0 |
| Tasa de finalización | 99.4% |
| Tokens de salida por respuesta | 664 |
| Throughput a concurrencia 32 | 483.8 tok/s |
| Throughput en flujo único | 74.4 tok/s (12.2 ms/token) |

No se incluye columna de comparación porque no existe otro checkpoint de este modelo que pueda servirse en una sola GPU de 96 GB. El autor indica que la dispersión de repetición en sus otras evaluaciones es de ±0.5 en conocimiento y ±1.5 en tool calling, por lo que diferencias dentro de ese rango deben considerarse empates.

## Requisitos de hardware

- GPU: una sola GPU Blackwell con 96 GB de VRAM (por ejemplo, RTX PRO 6000 Blackwell). Se requieren 88.828 MiB de VRAM para servir el modelo.
- RAM del host: aproximadamente 100 GB libres para la tabla n-gram de 51B, que se carga con prefetch asíncrono.
- Almacenamiento: 186.4 GB en disco para los pesos.
- Runtime: imagen oficial `vllm/vllm-openai:qwen38-flash-next` sin parches, con dos variables de entorno obligatorias: `VLLM_PLE_CPU_OFFLOAD=1` y `VLLM_PLE_OFFLOAD_READY_TIMEOUT=1800`. También se requiere `--distributed-executor-backend mp` para que el worker de offload se inicie.
- Latencia: 12.2 ms/token en flujo único; throughput de 483.8 tok/s a concurrencia 32 (medido sin caché de prefijo).
- No cabe en GPUs de consumo (RTX 4090, 3090, etc.) por VRAM insuficiente; solo en tarjetas de 96 GB o superiores.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Cuantización | Hardware necesario | Licencia |
|---|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (BF16) | 125B | 6B | 262K | BF16 | 2 GPUs data-center (360 GB) | Qwen Community 1.0 |
| Qwen3.8-Flash-Next (FP8) | 125B | 6B | 262K | FP8 | 2 GPUs data-center | Qwen Community 1.0 |
| **Este repo (NVFP4)** | 119.6B (cuantizado) | 6B | 262K | NVFP4 + BF16 | 1 GPU 96 GB + 100 GB RAM | Qwen Community 1.0 |

No se dispone de comparación con otros modelos MoE de tamaño similar (p. ej., DeepSeek-V3, Mixtral 8x22B) porque los datos de rendimiento proporcionados son específicos de esta cuantización y no se han contrastado con esos modelos bajo el mismo protocolo. La ventaja principal de esta build es la reducción de requisitos de hardware sin parches de runtime.

## Limitaciones y advertencias

- La cuantización NVFP4 puede introducir una ligera degradación de precisión frente al BF16 original, aunque el autor reporta resultados sólidos en su suite. No se han publicado comparaciones directas con el modelo sin cuantizar.
- La tabla n-gram de 51B se almacena en RAM del host, lo que requiere ~100 GB de memoria libre. En sistemas con menos RAM, el servidor puede no arrancar o fallar durante la carga.
- El offload de la tabla n-gram depende de variables de entorno específicas; sin ellas, el servidor se cuelga silenciosamente o agota el tiempo de espera. Esto añade complejidad operativa.
- El modelo abstiene correctamente en llamadas a herramientas solo cuando se usa la API nativa `tools=`; en el formato de system prompt, la tasa de abstinencia es del 0%, lo que puede provocar llamadas innecesarias en aplicaciones que usen ese formato.
- No se han publicado datos sobre sesgos, alucinaciones o comportamiento en idiomas distintos del inglés. La ficha del autor no menciona evaluación de sesgos.
- La licencia Qwen Community 1.0 es una licencia personalizada que puede imponer restricciones de uso comercial; es necesario revisar el texto completo antes de desplegar en producción.
- El modelo requiere una GPU Blackwell de 96 GB, lo que limita su uso a hardware de gama alta; no es compatible con GPUs de consumo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/primitive-ai/Qwen3.8-Flash-Next-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- GitHub oficial de Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Documentación de vLLM para Qwen3.8-Flash-Next: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
- Guía de ejecución local (unsloth): https://unsloth.ai/docs/models/qwen3.8-next
- Artículo sobre el lanzamiento (unite.ai): https://www.unite.ai/qwen3-8-flash-next-previews-qwen4-architecture-with-6b-active-parameters/
- Blog de explainx.ai sobre el modelo: https://www.explainx.ai/blog/qwen3-8-flash-next-125b-moe-release-august-2026
