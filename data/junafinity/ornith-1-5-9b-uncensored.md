# junafinity/Ornith-1.5-9B-uncensored

## Resumen

Ornith-1.5-9B-uncensored es una versión "abliterated" (dirección de rechazo eliminada mediante edición de pesos) del modelo multimodal ornith-ai/Ornith-1.5-9B, publicada por junafinity bajo la marca VeriSafe.Live. Se distribuye en safetensors con pesos completos en bf16, conserva la torre de visión del modelo original y está pensada explícitamente como instrumento de investigación para red teaming y evaluación defensiva de seguridad. No es un modelo nuevo entrenado desde cero: es una edición de pesos sobre un checkpoint existente.

El modelo base pertenece a la familia Ornith, construida sobre la arquitectura etiquetada como qwen3_5 (transformer denso de 9B parámetros), con pipeline image-text-to-text, es decir, acepta imágenes y texto como entrada y genera texto. El checkpoint tiene 9.409.813.744 parámetros reales según los safetensors y el repositorio ocupa 18,8 GB. La licencia declarada es Apache 2.0.

Su relevancia actual es metodológica: la abliteración se presenta como una edición rank-1 sobre un tramo de capas conocido, lo que convierte al par (base original, versión abliterada) en un control experimental limpio para medir el techo real de capacidad de los pesos, evaluar pilas de moderación y clasificadores de salida, y estudiar la interpretabilidad del rechazo residual. No está pensado para exposición pública sin una capa de moderación independiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (etiqueta qwen3_5), con torre de visión |
| Parámetros totales | 9.409.813.744 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | bf16 en este repo; existen variantes MLX 8-bit y GGUF Q8_0 publicadas por el mismo autor; 4-bit y 6-bit no publicadas |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de aproximadamente 9,4 mil millones de parámetros con capacidad multimodal de entrada (image-text-to-text): incluye una torre de visión que procesa imágenes y las proyecta al espacio del modelo de lenguaje. La model card menciona además cabezas MTP (multi-token prediction) en la familia, aunque el checkpoint 9B base no contiene tensores `mtp.*` según el autor, y no se ha injertado nada. La etiqueta de arquitectura es qwen3_5, lo que sugiere una base derivada de la familia Qwen 3.5, si bien no se detallan en la información disponible la composición del dataset, el número de tokens de entrenamiento ni las etapas de alineación (RLHF/DPO) del modelo original.

El proceso de esta variante es una edición directa de pesos: abliteración de la dirección de rechazo sobre un tramo de capas especificado, sin sobreentrenamiento ni capa de adaptación en tiempo de ejecución. Se conservan tanto la torre de visión como cualquier bloque MTP presente, y la model card incluye una auditoría de preservación antes/después. El resultado es un checkpoint en bf16 con el mismo grafo computacional que el base, por lo que no añade latencia ni memoria extra en inferencia respecto al original.

## Capacidades

- Generación de texto conversacional multi-turno.
- Comprensión de imágenes (image-text-to-text): descripción, razonamiento sobre contenido visual y respuesta a preguntas sobre imágenes.
- Razonamiento y respuesta a instrucciones heredados del modelo base.
- Capacidad de rechazo reducida mediante abliteración, orientada a medición de techo de capacidad.
- Preservación de la ruta de visión tras la edición de pesos, incluidos posibles rechazos por vía visual que la abliteración no elimina.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking explícito, audio u otras modalidades: no disponible.

## Casos de uso

- Medición del techo de capacidad: emparejar este checkpoint con ornith-ai/Ornith-1.5-9B y lanzar el mismo conjunto de prompts a ambos para estimar qué produce el modelo cuando no intervienen los rechazos entrenados, reportando siempre el delta contra el base.
- Evaluación de pilas defensivas: usar el modelo como generador que no contribuye rechazos propios y medir si los filtros de entrada, clasificadores de salida y APIs de moderación capturan el contenido prohibido; los huecos encontrados son los del plano de control defensivo, no los del modelo.
- Bucles de red teaming automatizado: los agentes de ataque se bloquean ante rechazos no relacionados con el objetivo; un objetivo que no rechaza aísla el control bajo prueba (inyección de prompt, abuso de herramientas, rutas de exfiltración de datos, bypass de política).
- Generación de datos etiquetados para detección y clasificación: producir completaciones para entrenar o evaluar modelos de moderación de salida y detección de abuso, con la ventaja de que el generador no filtra previamente el espacio de respuestas.
- Investigación de interpretabilidad del rechazo residual: al ser una edición rank-1 sobre un tramo de capas conocido, el par base/abliterado permite estudiar qué rechazos sobreviven (reafirmación multi-turno, direccionamiento por system prompt, rechazos por ruta visual) y por qué.
- Evaluación de robustez multimodal: probar si las defensas de moderación cubren la entrada visual además de la textual, usando la torre de visión preservada para construir ataques que combinan imagen y texto.
- Análisis comparativo de cuantizaciones: desplegar las variantes MLX 8-bit y GGUF Q8_0 frente al bf16 para medir la degradación de capacidad y de tasa de rechazo según precisión en Apple Silicon y llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 18,8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda un GPU con 24 GB o más para contexto moderado.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16 con contexto limitado; para contextos largos, GPU de 40 GB o más.
- Consumer GPU: cabe en RTX 4090 y en GPUs de 24 GB en bf16 con margen ajustado; las variantes MLX 8-bit y GGUF Q8_0 reducen el requisito a aproximadamente 10-11 GB, lo que permite GPUs de 12-16 GB.
- Apple Silicon: usar las variantes MLX 8-bit con `mlx-vlm` según indica el autor.
- Opciones de despliegue: transformers (formato nativo del repo), llama.cpp con el GGUF Q8_0, `mlx-vlm` en Apple Silicon; compatibilidad con endpoints declarada en los tags. No se confirma soporte de vLLM o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ornith-1.5-9B-uncensored | 9,41 B | No disponible | Imagen + texto | Apache 2.0 | Safetensors bf16, MLX 8-bit, GGUF Q8_0 |
| ornith-ai/Ornith-1.5-9B (base) | 9,41 B | No disponible | Imagen + texto | No disponible en la información | Safetensors |
| Ornith-1.5-35B-A3B-uncensored | 35 B (A3B, MoE) | No disponible | Imagen + texto | No disponible en la información | MLX 8-bit, GGUF Q8_0 |

La comparación con alternativas de otros desarrolladores del mismo tamaño y modalidad no está disponible en la información proporcionada.

## Limitaciones y advertencias

- La abliteración elimina una dirección de rechazo, no una política: sobreviven rechazos por reafirmación multi-turno, por direccionamiento desde el system prompt y por la ruta visual.
- No debe exponerse como endpoint público sin una capa de moderación independiente; quien despliega el modelo asume la responsabilidad de los guardrails que el original incorporaba.
- Riesgo elevado de generar contenido dañino, ilegal o inseguro por diseño; su uso previsto es investigación de seguridad, no producción orientada a usuarios finales.
- Cualquier resultado debe reportarse como delta frente al modelo base y re-medirse con los prompts propios del evaluador; los números de un tercero no son transferibles.
- Sesgos del modelo base: no documentados en la información disponible.
- Riesgo de alucinación: no cuantificado en la información disponible; se asume el del modelo base, no caracterizado.
- Idiomas soportados y longitud de contexto no documentados, lo que dificulta planificar despliegues multilingües o de contexto largo.
- Las variantes 4-bit y 6-bit anunciadas anteriormente no están publicadas; solo existen bf16, MLX 8-bit y GGUF Q8_0.
- La licencia Apache 2.0 permite uso comercial, pero la naturaleza del modelo hace desaconsejable su uso comercial sin evaluación de seguridad propia y sin revisión legal del caso de uso.
- El checkpoint 9B base no contiene tensores `mtp.*`; no debe esperarse decodificación multi-token especulativa en este tamaño.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/junafinity/Ornith-1.5-9B-uncensored
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Variante MLX 8-bit: https://huggingface.co/junafinity/Ornith-1.5-9B-uncensored-MLX-8bit
- Variante GGUF 8-bit: https://huggingface.co/junafinity/Ornith-1.5-9B-uncensored-GGUF-8bit
- Variante 35B-A3B MLX 8-bit: https://huggingface.co/junafinity/Ornith-1.5-35B-A3B-uncensored-MLX-8bit
- Variante 35B-A3B GGUF 8-bit: https://huggingface.co/junafinity/Ornith-1.5-35B-A3B-uncensored-GGUF-8bit
- Colección de la familia: https://huggingface.co/collections/junafinity/ornith-15-uncensored-6a896c737cf40ad660af2ebd
- Sitio del autor: https://verisafe.live
- Contacto: info@verisafe.live
