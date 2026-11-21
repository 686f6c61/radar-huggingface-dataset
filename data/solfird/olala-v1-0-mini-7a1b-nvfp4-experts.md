# solfird/Olala-v1.0-mini-7A1B-NVFP4-experts

## Resumen

Olala-v1.0-mini-7A1B-NVFP4-experts es una cuantización de 4 bits del modelo Olala-v1.0-mini-7A1B de OVHcloud, publicada por el usuario solfird. Se trata de un transformer híbrido con mezcla de expertos (MoE) y capas Mamba-3, en el que únicamente los expertos enrutados se almacenan en formato NVFP4 (coma flotante de 4 bits), mientras que el resto de tensores permanece en bf16. El resultado es un archivo de 5,77 GB frente a los 13,58 GB del modelo original, con un promedio de 6,8 bits por peso.

La relevancia de esta publicación radica en que OVHcloud no distribuye ninguna versión de 4 bits del modelo; solo ofrece bf16 y archivos GGUF en Q5_K_M, Q6_K y Q8_0. El autor construye esta variante para explorar si una compilación más pequeña puede evitar la pérdida de calidad que OVH documenta a 4 bits. Según la model card, la compilación pierde 1,6 puntos de precisión media frente a bf16 en cinco tareas y sirve entre 1,2 y 1,4 veces más tokens por segundo bajo carga en vLLM.

El modelo cuenta con 6.773.124.144 parámetros totales según los safetensors del repositorio, y requiere el fork de vLLM de OVHcloud junto con un parche de carga incluido en el propio repositorio. Se probó únicamente en una tarjeta RTX PRO 4500 Blackwell de 32 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con mezcla de expertos (MoE) y capas Mamba-3 |
| Parametros totales | 6.773.124.144 |
| Parametros activos | no disponible |
| Longitud de contexto | 32.688 tokens (probado con `--max-model-len 32688`) |
| Tipos de cuantizacion | NVFP4 en expertos enrutados (36 capas); bf16 en expertos compartidos, proyecciones latentes, router, proyecciones Mamba-3 y atención, embeddings y cabeza de salida; promedio de 6,8 bits por peso |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato `compressed-tensors` `nvfp4-pack-quantized`), en dos shards de 4.996.992.288 y 768.789.160 bytes |

## Arquitectura y entrenamiento

El modelo base es un transformer híbrido que combina capas de atención con capas Mamba-3 y una mezcla de expertos (MoE) con expertos enrutados y compartidos. La cuantización afecta exclusivamente a los expertos enrutados de las 36 capas, que concentran la mayor parte de los pesos; el resto de componentes se mantiene en bf16. La cuantización es weight-only: las activaciones permanecen en bf16. Este enfoque elimina el 58 por ciento del tamaño del archivo original.

No se dispone de información sobre el proceso de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO) en la documentación proporcionada. El autor de la cuantización indica que publicará un informe técnico con el análisis completo próximamente. La compilación se generó con el formato `compressed-tensors` `nvfp4-pack-quantized` y requiere un parche del cargador de modelos (`olala-quant-loader.patch`) que no añade kernels nuevos, solo permite al fork de vLLM de OVHcloud leer los tensores NVFP4.

## Capacidades

- Generación de texto y conversación: el pipeline declarado es `text-generation` y el modelo se sirve mediante la API de chat compatible con OpenAI.
- Razonamiento: el servidor admite el parser de razonamiento de OVH (`--reasoning-parser olala`), lo que sugiere soporte de modo de razonamiento o thinking.
- Tool calling: soporta function calling mediante `--tool-call-parser olala` y `--enable-auto-tool-choice`, con elección automática de herramientas.
- Capacidades multilingües: no disponible; la model card no especifica idiomas.
- Capacidades de agente: no se detallan explícitamente en la información disponible, aunque el soporte de tool calling y razonamiento permite su uso en flujos multi-paso.
- Visión y audio: no disponible; no se mencionan en la documentación.

## Casos de uso

- Despliegue en GPU de gama profesional con memoria limitada: con 5,77 GB de pesos, el modelo cabe en una RTX PRO 4500 Blackwell de 32 GB junto con la caché KV y el contexto de hasta 32.688 tokens, lo que permite servir conversaciones largas en hardware de una sola tarjeta.
- Servicio de chat con tool calling: la integración con el parser de herramientas de OVH y la API de chat de vLLM permite construir asistentes que invoquen funciones externas (APIs, bases de datos) en producción.
- Razonamiento multi-paso con modo thinking: el parser de razonamiento permite separar la cadena de pensamiento de la respuesta final, útil en pipelines de agentes que necesitan trazabilidad.
- Inferencia de alto rendimiento bajo carga: según la model card, sirve entre 1,2 y 1,4 veces más tokens por segundo que bf16 en vLLM bajo carga, lo que lo hace adecuado para entornos con concurrencia moderada y restricciones de memoria.
- Evaluación comparativa de cuantizaciones: sirve como referencia para estudiar el impacto de cuantizar solo los expertos enrutados frente a cuantizaciones GGUF completas (Q5_K_M, Q4_K_M).
- Prototipado e investigación en arquitecturas híbridas MoE-Mamba: al ser una compilación pequeña y ejecutable en una sola GPU, facilita experimentos con modelos híbridos sin infraestructura de varios nodos.
- Sustitución de bf16 en entornos con presupuesto de memoria ajustado: cuando la precisión de bf16 no es imprescindible, esta compilación reduce el espacio en disco y memoria un 58 por ciento con una pérdida media de 1,6 puntos.

## Benchmarks y rendimiento

Datos de la model card (media de cinco tareas, evaluadas una vez por compilación):

| Compilacion | Tamano (GB) | Bits por peso | Precision media (%) | Diferencia vs esta compilacion (puntos, IC 95%) | Throughput bajo carga vs bf16 (vLLM) |
|---|---|---|---|---|---|
| bf16 (referencia) | 13,58 | 16,0 | 73,5 | -1,6 (-3,3 a -0,0) | 1,00 |
| Esta compilacion | 5,77 | 6,8 | 71,8 | referencia | 1,21 a 1,42 |
| OVH Q5_K_M (llama.cpp) | 5,99 | 7,1 | 72,2 | -0,4 (-2,5 a +1,7) | otro motor |
| Q4_K_M de referencia (llama.cpp) | 5,69 | 6,7 | 69,3 | +2,5 (+0,2 a +4,8) | otro motor |

Resultados específicos citados: esta compilación supera al Q4_K_M de referencia en 10,0 puntos en AIME 2025 (+1,3 a +19,3) y a OVH Q5_K_M en 2,8 puntos en IFEval (+0,2 a +5,4), aunque el autor advierte que este último es una de diez comparaciones por tarea sin corrección por tests múltiples. Con una sola petición a la vez, la velocidad es 0,94 veces la de bf16. No se han publicado resultados de MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,77 GB solo para pesos; hay que añadir caché KV y caché de estado Mamba (`--mamba-ssm-cache-dtype float32`) para el contexto configurado.
- GPU recomendadas: RTX PRO 4500 Blackwell de 32 GB (única probada por el autor). No se han validado otras GPU.
- Compatibilidad con GPU de consumo: no confirmada; el requisito de NVFP4 y del fork de vLLM de OVHcloud limita la compatibilidad a hardware Blackwell según la información disponible.
- Opciones de despliegue: exclusivamente el fork de vLLM de OVHcloud (imagen `ovhaillm/olala-vllm:ebbadef53`) con el parche `olala-quant-loader.patch`. No se menciona soporte en llama.cpp, Ollama o TGI.
- Latencia y throughput: 1,21 a 1,42 veces los tokens por segundo de bf16 bajo carga en vLLM; 0,94 veces con una sola petición concurrente.
- Configuración de servicio probada: `--trust-remote-code --served-model-name olala --mamba-ssm-cache-dtype float32 --reasoning-parser olala --tool-call-parser olala --enable-auto-tool-choice --max-model-len 32688 --max-num-seqs 256`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision media (5 tareas) | Licencia | Formato / motor |
|---|---|---|---|---|---|
| Olala-v1.0-mini-7A1B-NVFP4-experts (esta compilacion) | 6.773.124.144 | 32.688 | 71,8 % | Apache 2.0 | safetensors NVFP4, fork vLLM de OVH |
| Olala-v1.0-mini-7A1B bf16 | 6.773.124.144 (base) | no disponible | 73,5 % | Apache 2.0 | safetensors bf16, vLLM |
| Olala-v1.0-mini-7A1B Q5_K_M (OVH) | no disponible | no disponible | 72,2 % | Apache 2.0 | GGUF, llama.cpp |
| Q4_K_M de referencia (reconstruccion del autor) | no disponible | no disponible | 69,3 % | Apache 2.0 | GGUF, llama.cpp |

No se dispone de comparación con modelos de otros desarrolladores en la información proporcionada.

## Limitaciones y advertencias

- Pérdida de precisión: 1,6 puntos por debajo de bf16 en la media de cinco tareas; el intervalo de confianza no permite afirmar equivalencia con Q5_K_M de OVH.
- No es un archivo de 4 bits en conjunto: los expertos son de 4 bits pero el resto es bf16, con un promedio de 6,8 bits por peso; es 0,07 GB más grande que el Q4_K_M de referencia.
- Inferencia secuencial más lenta: 0,94 veces la velocidad de bf16 con una sola petición concurrente.
- Dependencia de un fork específico: requiere el fork de vLLM de OVHcloud y un parche del cargador; no funciona con vLLM estándar ni con llama.cpp.
- Hardware validado limitado: solo se probó en una RTX PRO 4500 Blackwell de 32 GB; el soporte en otras GPU no está confirmado.
- Evaluación estadística limitada: cada compilación se puntuó una sola vez y no se corrigió por comparaciones múltiples; el autor reconoce que el test no puede separar esta compilación de Q5_K_M.
- El Q4_K_M de referencia es una reconstrucción propia, no el archivo oficial de OVH, que no es público.
- Sesgos, riesgo de alucinación e idiomas: no disponible en la documentación proporcionada.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base y el fork de vLLM pueden tener condiciones adicionales no detalladas.
- Estado del proyecto: la model card anuncia un informe técnico pendiente; los datos actuales son preliminares.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/solfird/Olala-v1.0-mini-7A1B-NVFP4-experts
- Modelo base: https://huggingface.co/OVHaiLLM/Olala-v1.0-mini-7A1B
- Imagen de vLLM de OVHcloud: `ovhaillm/olala-vllm:ebbadef53` (tag utilizado en las pruebas)
- Parche del cargador: `olala-quant-loader.patch` (incluido en el repositorio del modelo)
- Informe técnico: anunciado como próximamente, no disponible
