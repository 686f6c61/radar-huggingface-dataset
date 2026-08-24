# puwaer/DeepSeek-V4-Flash-0731-ream-200b

## Resumen

DeepSeek-V4-Flash-0731-ream-200b es una versión comprimida del modelo DeepSeek-V4-Flash-0731 de DeepSeek, desarrollada por el usuario puwaer mediante una técnica de fusión de expertos denominada REAM (router-weighted expert activation merging). El modelo reduce los expertos enrutados de 256 a 178 por capa en los 43 bloques MoE, pasando el checkpoint de 156 GiB a 104 GiB, sin ningún paso de fine-tuning, destilación ni gradiente. El resultado es un modelo de aproximadamente 200B parámetros totales que conserva la arquitectura original del base, incluido el modo de razonamiento visible (thinking) y la ventana de contexto de un millón de tokens.

La relevancia de este modelo radica en que demuestra que la compresión de expertos basada en estadísticas de calibración puede reducir el peso del checkpoint en un 33 % manteniendo un rendimiento razonable en tareas de código y matemáticas, con una degradación media de solo 3,58 puntos frente al modelo original. Es una alternativa práctica para equipos que necesitan desplegar un modelo de razonamiento de gran tamaño en infraestructura con memoria limitada, sin renunciar a las capacidades del base.

El modelo se distribuye bajo licencia MIT, con pesos en formato safetensors y es compatible con SGLang y llama.cpp. Incluye un chat_template propio (el base no lo trae) y conserva el encoder Python `encoding_dsv4.py` copiado del repositorio original para funcionalidades avanzadas como tool calling. Una diferencia importante es que los módulos MTP (multi-token prediction) del base se han eliminado, por lo que la decodificación especulativa basada en MTP no está disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) sparse, 43 capas, 178 expertos enrutados por capa (reducido de 256), 6 expertos por token |
| Parametros totales | 199.914.652.711 (~200B) |
| Parametros activos | no disponible (se activan 6 expertos por token, pero el numero exacto de parametros activos no se publica) |
| Longitud de contexto | 1.000.000 tokens (heredado del modelo base DeepSeek-V4-Flash-0731) |
| Tipos de cuantizacion | FP8, MXFP4, 8-bit (mencionados en tags y en el servicio con SGLang) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo mantiene la arquitectura del DeepSeek-V4-Flash-0731 original: un transformer sparse MoE con 43 capas, donde cada bloque contiene 178 expertos enrutados (frente a los 256 del base) y se activan 6 expertos por token. La compresión se realiza con el método REAM, que fusiona los expertos de baja saliencia en los centroides supervivientes a partir de estadísticas de calibración en un único paso, sin ningún paso de gradiente. La calibración se hizo con una mezcla de datasets ponderada al 30 % matemáticas y 70 % código, con 8192 muestras de activación y una longitud de secuencia de 512 tokens. El proceso usa streaming de capas, lo que permite comprimir el checkpoint de 156 GiB en una única GPU de 96 GB de VRAM.

Se eliminaron los módulos MTP (`mtp.0`, `mtp.1`, `mtp.2`) presentes en el base, por lo que la decodificación especulativa basada en MTP no está disponible. El resto del prompt y de los parámetros de generación se conservan del modelo base, incluido el modo de pensamiento activado por defecto y los niveles de esfuerzo de razonamiento (`low`, `high`, `max`). El `chat_template.jinja` es una transcripción del encoder `encoding_dsv4.py` para los casos de uso estándar, verificada cadena por cadena en cientos de conversaciones.

## Capacidades

- Generación de texto y razonamiento multi-paso con modo de pensamiento activado por defecto, controlable mediante `enable_thinking` y `reasoning_effort`.
- Generación de código y resolución de problemas matemáticos, con resultados verificados en GSM8K, MATH-500, HumanEval+ y MBPP+.
- Soporte de tool calling y mensajes de sistema avanzados mediante el encoder `encoding_dsv4.py` copiado del base (no implementado en el `chat_template.jinja`).
- Ventana de contexto de 1 millón de tokens, heredada del base, útil para agentes y razonamiento de largo alcance.
- Capacidades multilingües no documentadas en la información disponible.
- Sin capacidades de visión ni audio.
- Sin decodificación especulativa por MTP; los motores que busquen esos pesos caerán en decodificación ordinaria.

## Casos de uso

- Despliegue de un modelo de razonamiento en infraestructura con memoria limitada: el checkpoint de 104 GiB (un 33 % menor que el base) permite servirlo en configuraciones con menos VRAM agregada, por ejemplo con SGLang y tensor parallelism en dos nodos.
- Razonamiento matemático en producción: con GSM8K al 0,8620 y MATH-500 al 0,6080, puede integrarse en sistemas de tutoría o resolución de problemas con un presupuesto de tokens ajustable mediante `reasoning_effort`.
- Generación de código asistida: HumanEval+ al 0,8841 y MBPP+ al 0,7698, ligeramente superiores al base, lo que lo hace adecuado para autocompletado y revisión de código en entornos donde el tamaño del checkpoint es una restricción.
- Agentes multi-paso con contexto largo: la ventana de 1M tokens permite mantener conversaciones extensas, historial de ejecución y documentos largos en tareas de agente, aunque sin MTP la latencia será mayor que con el base.
- Investigación en compresión de MoE: el modelo es un ejemplo reproducible de REAM y sirve como referencia para comparar técnicas de expert merging sin entrenamiento.
- Evaluación de trade-offs de compresión: los benchmarks publicados permiten decidir si la pérdida en GSM8K (-8,64 puntos) es aceptable frente a la reducción de memoria para un caso de uso concreto.

## Benchmarks y rendimiento

Los datos de la model card, medidos con greedy decoding (n=1), contexto de 4096 tokens y `enable_thinking=false`, servidos con SGLang:

| Modelo | Expertos | Tamano | GSM8K | MATH-500 | HumanEval+ | MBPP+ | Media |
|---|---|---|---|---|---|---|---|
| Base 284b | 256 | 156 GiB | 0,9484 | 0,7060 | 0,8720 | 0,7407 | 0,8168 |
| REAP 200b | 178 | 104 GiB | 0,9401 | 0,6880 | 0,8720 | 0,7407 | 0,8102 |
| **REAM 200b (este modelo)** | 178 | 104 GiB | **0,8620** | **0,6080** | **0,8841** | **0,7698** | **0,7810** |
| REAP 150b | 132 | 79 GiB | 0,9295 | 0,7140 | 0,8963 | 0,7593 | 0,8248 |
| REAM 150b | 132 | 79 GiB | 0,6922 | 0,5020 | 0,8537 | 0,7328 | 0,6952 |

Diferencias frente al base: GSM8K -8,64 puntos, MATH-500 -9,80, HumanEval+ +1,22, MBPP+ +2,91, media -3,58. La calidad de reconstrucción medida durante la compresión sobre una sonda de 4096 tokens fue de coseno medio 0,9651, coseno mínimo 0,8454 y L2 relativo medio 0,2057, aunque se indica que es un diagnóstico de compresión y no una métrica de calidad.

## Requisitos de hardware

- Tamaño del checkpoint: 104 GiB en safetensors, lo que requiere aproximadamente 104 GB de VRAM para cargar en FP16 sin cuantización adicional.
- Con cuantización FP8 o MXFP4, el uso de VRAM puede reducirse a unos 52-60 GB, lo que permite servirlo en configuraciones de 2x A100 40GB, 2x H100 80GB o equivalentes.
- No cabe en una GPU de consumo como la RTX 4090 (24 GB) sin cuantizaciones agresivas de 4 bits, que no están documentadas para este modelo.
- La compresión del checkpoint original se realizó en una sola GPU de 96 GB (por ejemplo, A100 80GB o H100) gracias al modo streaming del proceso.
- Despliegue verificado con SGLang; en GPUs Hopper es necesario usar `--moe-runner-backend flashinfer_mxfp4` para el layout MXFP4, ya que el backend `auto` falla en los pesos empaquetados.
- Compatible con llama.cpp (usando `--reasoning-format deepseek` para aislar el razonamiento) y con la API de SGLang mediante `chat_template_kwargs`.
- La latencia y el throughput no se publican; dependerán del backend, la cuantización y el número de GPUs.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | GSM8K | HumanEval+ | Tamano checkpoint |
|---|---|---|---|---|---|---|
| DeepSeek-V4-Flash-0731 (base) | 304B | 1M tokens | MIT | 0,9484 | 0,8720 | 156 GiB |
| REAM 200b (este modelo) | 200B | 1M tokens (heredado) | MIT | 0,8620 | 0,8841 | 104 GiB |
| REAP 200b | 200B | 1M tokens (heredado) | MIT | 0,9401 | 0,8720 | 104 GiB |
| REAM 150b | 150B | 1M tokens (heredado) | MIT | 0,6922 | 0,8537 | 79 GiB |

El modelo se sitúa en la misma familia que el base y las variantes comprimidas REAP y REAM. Frente a REAP 200b, que usa un método de compresión alternativo, REAM 200b pierde notablemente en GSM8K (0,8620 frente a 0,9401) y MATH-500 (0,6080 frente a 0,6880), pero gana en HumanEval+ (0,8841 frente a 0,8720) y MBPP+ (0,7698 frente a 0,7407). La variante REAM 150b muestra una degradación mucho más severa, por lo que el punto de 178 expertos parece el equilibrio más razonable dentro de la familia REAM.

## Limitaciones y advertencias

- Los módulos MTP del base se han eliminado: la decodificación especulativa por MTP no está disponible y los motores que la busquen caerán en decodificación ordinaria, con el consiguiente impacto en latencia.
- Pérdida de rendimiento en tareas matemáticas: GSM8K cae 8,64 puntos y MATH-500 9,80 puntos frente al base; la media total baja 3,58 puntos. No es adecuado para aplicaciones donde la exactitud matemática sea crítica.
- El modo de pensamiento consume tokens antes de la respuesta final; si `max_tokens` es bajo, el razonamiento puede truncarse a mitad.
- La generación por defecto usa muestreo (`do_sample`, `temperature`, `top_p`), no decodificación greedy, lo que puede introducir variabilidad en los resultados.
- La calidad de reconstrucción medida (cosine 0,9651, L2 relativo 0,2057) es un diagnóstico de compresión, no una garantía de calidad de salida.
- No se han documentado sesgos ni limitaciones de idioma; la información de idiomas no está disponible.
- El `chat_template.jinja` no implementa tool calling, tareas internas, mensajes `developer` ni `latest_reminder`; para esas funciones hay que usar el encoder `encoding_dsv4.py` incluido en el repo.
- Licencia MIT permite uso comercial, pero la atribución del código base de DeepSeek (MIT, Copyright 2023) debe respetarse en el repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/puwaer/DeepSeek-V4-Flash-0731-ream-200b
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Repositorio de compresion: https://github.com/puwaer/moe-expert-compress
- Model card de NVIDIA NIM para el base: https://build.nvidia.com/deepseek-ai/deepseek-v4-flash-0731/modelcard
- Documentacion de API NVIDIA NIM: https://docs.api.nvidia.com/nim/reference/deepseek-ai-deepseek-v4-flash-0731
- DeepWiki del proyecto: https://deepwiki.com/deepseek-v4-flash-0731/deepseek-v4-flash-0731
- Paper REAM (arxiv:2510.13999): https://arxiv.org/abs/2510.13999
- Paper adicional (arxiv:2604.04356): https://arxiv.org/abs/2604.04356
