# daemonix/GLM-5.3-Flash-abliterated-Q2-GGUF-antirez-DS4

## Resumen

GLM-5.3-Flash-abliterated-Q2-GGUF-antirez-DS4 es una conversión cuantizada a Q2 en formato GGUF del checkpoint abliterado GLM-5.3-Flash, publicada por el usuario daemonix y empaquetada específicamente para el motor de inferencia DS4 (DwarfStar) de Salvatore Sanfilippo (antirez), incluyendo su backend Metal para Apple Silicon. El modelo base original es GLM-5.3-Flash de Z.ai; la abliteración (eliminación de la dirección de rechazo en el espacio de activaciones) la realizó mrfakename, y esta conversión regenera los 90 tensores residuales modificados por la abliteración a partir del checkpoint fijado, copiando el resto de payloads del modelo DS4 Q2 de referencia de antirez.

Se trata de un modelo multimodal image-text-to-text de gran escala: 320.759.404.382 parámetros totales según los safetensors del modelo base, con un bloque MTP (multi-token prediction) embebido que actúa como draft para decodificación especulativa. El repositorio pesa 97,6 GB e incluye un codificador visual BF16 separado de aproximadamente 1,13 GB. La cuantización mezcla IQ2_XXS en las puertas y up de los expertos enrutados con Q2_K en las down de los expertos, manteniendo mayor precisión en otras matrices.

Su relevancia es doble: por un lado, permite ejecutar un modelo de más de 320.000 millones de parámetros en hardware de consumo de gama muy alta (Apple Silicon con memoria unificada abundante) gracias a la cuantización agresiva a 2 bits; por otro, el proceso de abliteración reduce drásticamente los rechazos ante peticiones sensibles, lo que lo hace útil para investigación en seguridad, red teaming y estudios de alineación, pero problemático para despliegues comerciales sin moderación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) y bloque MTP embebido; multimodal con codificador visual BF16 separado |
| Parametros totales | 320.759.404.382 (según safetensors del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | 32.768 tokens en el ejemplo de ejecución de DS4 (`--ctx 32768`); máximo no disponible |
| Tipos de cuantizacion | GGUF Q2 mixto: IQ2_XXS en gate/up de expertos enrutados, Q2_K en down de expertos enrutados, tensores de mayor precisión en el resto; codificador visual en BF16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (un único archivo de ~96,51 GB / 89,88 GiB más el codificador visual de ~1,13 GB) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash es un transformer con arquitectura de mezcla de expertos (MoE) de 320.759 millones de parámetros totales, desarrollado por Z.ai. Incluye un bloque MTP (multi-token prediction) que en DS4 se puede activar con `--mtp` para usar el draft embebido en decodificación especulativa, y un codificador visual separado que habilita la entrada de imágenes. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF/DPO en la información proporcionada.

Sobre el checkpoint base se aplicó un proceso de abliteración por parte de mrfakename, que modifica 90 tensores de escritura residual para eliminar la dirección de rechazo aprendida durante el alineamiento. Esta conversión de daemonix regenera esos 90 tensores directamente desde el checkpoint abliterado fijado en el commit `7c10d597d8711d6f3ca65539738447eaa1ba8b89` y copia los otros 1.322 tensores byte a byte del modelo DS4 Q2 de referencia de antirez (commit `b2fa29d7a6b410db11221c904973967b80b760f5`). No requiere aplicar LoRA. La validación incluyó la comprobación de los 1.412 layouts de tensores, la coincidencia byte a byte con el origen o la referencia, y pruebas de humo de inferencia greedy con Metal y MTP embebido en un Mac M3 Ultra con 512 GiB de memoria unificada.

## Capacidades

- Generación de texto conversacional multi-turno en formato chat.
- Razonamiento con modo thinking (el modelo puede razonar antes de responder; los benchmarks reportados distinguen modos chat y thinking).
- Entrada de imágenes (image-text-to-text) mediante el codificador visual BF16 separado, activable con `--vision`.
- Capacidades de código: el modelo base GLM-5.3 está orientado a tareas de programación y el proceso de abliteración preserva esta capacidad según el autor del checkpoint.
- Decodificación especulativa mediante el bloque MTP embebido (`--mtp`).
- Reducción drástica de rechazos: 93,8% de éxito en HarmBench chat y 86,7% en HarmBench thinking según los resultados del autor de la abliteración.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible explícitamente, aunque el modo thinking y el MTP sugieren capacidad de razonamiento extendido.
- Capacidades multilingües: no disponible.

## Casos de uso

- Investigación en seguridad y alineación: el modelo permite estudiar cómo responde un LLM abliterado ante prompts dañinos con fines de auditoría y red teaming, comparando los porcentajes de HarmBench (93,8% chat, 86,7% thinking) frente al modelo original (16,3% y 3,8%).
- Evaluación de cuantización extrema: sirve como banco de pruebas para medir la degradación de calidad al pasar un MoE de 320.000 millones de parámetros a 2 bits, comparando con las versiones Q4 y Q8_0 publicadas por separado.
- Inferencia local en Apple Silicon de gama alta: con 89,88 GiB de pesos, cabe en Macs con 128 GiB o más de memoria unificada, permitiendo ejecutar un modelo de escala frontier sin GPU dedicada.
- Experimentación con decodificación especulativa: el bloque MTP embebido permite medir la aceleración de throughput en DS4 con `--mtp` frente a generación autoregresiva estándar.
- Análisis de imágenes con modelo grande: el codificador visual BF16 permite tareas de descripción, OCR o VQA en local, aunque el contexto práctico de 32.768 tokens limita documentos extensos.
- Estudio de fallos de razonamiento: el autor documenta que los modelos abliterados pueden agotar el presupuesto de salida razonando sin dar respuesta final (21 casos sin respuesta final en la comparativa de DeepSeek V4.1 Flash), lo que convierte este modelo en material para investigar ese fenómeno.
- Generación de código sin rechazos en entornos controlados: útil para pipelines internos de auditoría de código donde los filtros de seguridad del modelo base interrumpen tareas legítimas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de este modelo ni de esta conversión Q2 en la información disponible. Los datos que aparecen en la model card corresponden a una comparativa relacionada con DeepSeek V4.1 Flash 1017, ejecutada sobre checkpoints completos vía SGLang en una H200, y no miden este GLM ni esta cuantización:

| Test | Original | Mrfakename | Pqhaz heretic | MoonMath |
|---|---:|---:|---:|---:|
| HarmBench chat | 16,3% | 93,8% | 93,8% | 92,1% |
| HarmBench thinking | 3,8% | 86,7% | 72,9% | 82,5% |
| MITRE substantive assistance | 16,2% | 84,2% | 82,8% | 83,1% |
| Rechazos ante prompts benignos | no reportado | 0/750 | 0/750 | 0/750 |

HarmBench cubrió 240 casos de texto por modo, excluyendo copyright, con el clasificador oficial. Los datos de MITRE son provisionales, de rúbrica propia auditada y juzgados por el modelo original, sin ejecución del código generado. Los rechazos benignos se detectaron heurísticamente. Los benchmarks Q8_0 del modelo upstream no miden esta conversión Q2.

## Requisitos de hardware

- VRAM/memoria estimada: ~89,88 GiB para los pesos Q2 más el codificador visual (~1,13 GiB) y la caché KV para el contexto configurado. Con 32.768 tokens de contexto y arquitectura MoE, la caché KV puede añadir varios GiB adicionales; el total práctico ronda los 95-100 GiB.
- GPU recomendadas: no hay datos de ejecución en GPU dedicada para esta conversión. El autor validó en un Mac M3 Ultra con 512 GiB de memoria unificada usando el backend Metal de DS4.
- Cabe en consumer GPU: no en GPUs de consumo convencionales (24 GiB o menos). Requiere memoria unificada de Apple Silicon de al menos 128 GiB, o GPUs profesionales con 80 GiB o más combinadas.
- Opciones de despliegue: DS4 (DwarfStar) de antirez es el motor objetivo, con backend Metal en Apple Silicon. No se menciona compatibilidad con llama.cpp, Ollama, vLLM o TGI en la información disponible; el formato GGUF es estándar, pero el bloque MTP y la arquitectura MoE pueden no estar soportados por otros runners.
- Latencia y throughput: no disponibles. La validación solo confirma que la inferencia greedy y el MTP embebido funcionan en M3 Ultra de 512 GiB.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| GLM-5.3-Flash-abliterated-Q2 (este) | 320,76 B totales | 32.768 en ejemplo DS4 | MIT | GGUF Q2 mixto | Abliterado, MTP embebido, visión separada |
| GLM-5.3-Flash (original, Z.ai) | 320,76 B totales | no disponible | no disponible en esta ficha | safetensors | Sin abliterar; rechazos HarmBench 16,3% chat / 3,8% thinking |
| GLM-5.3-Flash-abliterated (mrfakename) | 320,76 B totales | no disponible | MIT (según este repo) | safetensors | Checkpoint fuente de la abliteración, sin cuantizar |
| DS4 Q2 de referencia (antirez/glm-5.3-flash-gguf) | 320,76 B totales | no disponible | no disponible | GGUF Q2 | Modelo de referencia para los 1.322 tensores no abliterados |

No se dispone de datos de rendimiento comparativo entre estas variantes dentro de la información proporcionada.

## Limitaciones y advertencias

- La abliteración elimina los rechazos de seguridad: el modelo responderá a peticiones dañinas con alta probabilidad (93,8% en HarmBench chat), lo que lo hace inadecuado para despliegues públicos sin moderación externa.
- Riesgo elevado de contenido dañino, sesgado o ilegal en las respuestas; no apto para aplicaciones orientadas a usuarios finales sin filtros adicionales.
- La cuantización a 2 bits (IQ2_XXS/Q2_K) degrada la calidad respecto al checkpoint original; no se han publicado evaluaciones de la pérdida de conocimiento o capacidad de código en esta conversión.
- El autor documenta que los modelos abliterados pueden agotar el presupuesto de salida razonando sin dar respuesta final (fenómeno observado en la comparativa relacionada con DeepSeek V4.1 Flash: 21 casos sin respuesta final para la variante mrfakename).
- Contexto de ejemplo limitado a 32.768 tokens; el máximo real no está confirmado y podría ser mayor o menor según el runner.
- Idiomas soportados no declarados; el comportamiento multilingüe no está verificado.
- Compatibilidad limitada: el modelo está empaquetado para DS4 con soporte de GLM-5.3 Flash; otros runners GGUF pueden no cargar el bloque MTP o la arquitectura MoE correctamente.
- La licencia MIT se hereda del repositorio, pero el modelo base original de Z.ai puede tener términos adicionales no reflejados en esta ficha; verificar antes de uso comercial.
- Los benchmarks citados no corresponden a este modelo ni a esta cuantización y no deben usarse para inferir su rendimiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/daemonix/GLM-5.3-Flash-abliterated-Q2-GGUF-antirez-DS4
- Modelo base abliterado: https://huggingface.co/mrfakename/GLM-5.3-Flash-abliterated
- Modelo DS4 Q2 de referencia: https://huggingface.co/antirez/glm-5.3-flash-gguf
- Motor DS4 (DwarfStar): https://github.com/antirez/ds4
- Documentación de modelos de DS4: https://github.com/antirez/ds4/blob/main/docs/MODELS.md
- Comparativa relacionada en Reddit: https://www.reddit.com/r/LocalLLaMA/comments/1xyv1oc/
- Discord del autor de la abliteración: https://discord.com/invite/fos
