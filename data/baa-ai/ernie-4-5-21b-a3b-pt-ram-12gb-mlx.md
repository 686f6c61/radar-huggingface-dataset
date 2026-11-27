# baa-ai/ERNIE-4.5-21B-A3B-PT-RAM-12GB-MLX

## Resumen

ERNIE-4.5-21B-A3B-PT-RAM-12GB-MLX es una compilación cuantizada en precisión mixta del modelo multimodal y de lenguaje baidu/ERNIE-4.5-21B-A3B-PT, optimizada por baa.ai mediante su método propietario Black Sheep AI y empaquetada en formato MLX para su ejecución en hardware Apple Silicon. El modelo base es un transformer de tipo Mixture-of-Experts (MoE) con 21.825.436.160 parámetros totales, de los cuales aproximadamente 3.000 millones están activos por token (de ahí el sufijo A3B), lo que permite un equilibrio entre capacidad y coste computacional en inferencia.

La compilación ocupa 12,3 GB, prácticamente idéntica a una cuantización uniforme de 4 bits (12,30 GB), lo que permite una comparación byte a byte entre ambas estrategias de compresión. Según las métricas publicadas por el autor, esta versión prioriza el razonamiento multi-paso y las matemáticas (99 % en GSM8K, 64,3 % en cadenas de 4 a 6 saltos con respuesta libre) frente a la cuantización uniforme, que obtiene mejores resultados en conocimiento general (MMLU). Es relevante para desarrolladores que quieran ejecutar un modelo MoE de 21B en un Mac con memoria unificada limitada, manteniendo capacidades de razonamiento certificadas.

La licencia es Apache 2.0, lo que facilita su uso comercial y su integración en productos derivados, siempre que se respeten las condiciones de atribución. El modelo está pensado para generación de texto y conversación, con soporte de plantilla de chat y recomendación explícita de usar system prompt para evitar respuestas desviadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (ernie4_5_moe) |
| Parametros totales | 21.825.436.160 |
| Parametros activos | Aproximadamente 3.000 millones (sufijo A3B del nombre) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Precisión mixta (mixed-precision) con cuantización de 4 bits; el autor indica que el tamaño es equivalente a una cuantización uniforme de 4 bits |
| Idiomas soportados | No disponible (la model card no los enumera; se observan respuestas en chino en pruebas del autor) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors, librería MLX |
| Tamano del repo | 12,3 GB |
| Modelo base | baidu/ERNIE-4.5-21B-A3B-PT |
| Libreria | mlx |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo base ERNIE-4.5-21B-A3B-PT es un transformer de tipo Mixture-of-Experts desarrollado por Baidu, con 21.825 millones de parámetros totales y aproximadamente 3.000 millones activos por token. La arquitectura MoE permite que cada token active solo una fracción de los expertos, reduciendo el coste computacional en inferencia frente a un modelo denso del mismo tamaño. El sufijo PT indica que se trata de la variante pre-entrenada y ajustada para conversación (post-trained), según la convención de nombres de ERNIE 4.5.

La compilación RAM-12GB no modifica la arquitectura: aplica una cuantización de precisión mixta sobre los pesos originales en BF16 (43,9 GB), reduciéndolos a 12,3 GB. El autor no detalla la composición del dataset de entrenamiento original ni si hubo RLHF o DPO, ya que esa información pertenece al modelo base y no se reproduce en esta model card. La innovación técnica destacable es el método propietario Black Sheep AI de baa.ai, que asigna distintos niveles de precisión a distintos tensores para preservar el razonamiento multi-paso, y la verificación bit a bit de cada tensor contra el manifiesto de la compilación. También se reporta una puerta de seguridad de agente sin datos (coherencia × tasa de error) superada con un exceso de coherencia de 1,11× el suelo de ruido frente a un umbral de 1,54×.

## Capacidades

- Generación de texto y conversación multi-turno mediante plantilla de chat.
- Razonamiento multi-paso: cadenas de 4 a 6 saltos con respuesta libre, con un 64,3 % de acierto según el autor.
- Matemáticas: 99 % en GSM8K (100 preguntas) y 85 % en MMLU-Pro math.
- Conocimiento general: 75,25 % en MMLU (400 preguntas), equivalente al 96,8 % del rendimiento en BF16.
- Respuestas concisas cuando se desactiva el modo de razonamiento (thinking off), aunque en ese modo no completa cadenas de 4 a 6 saltos.
- Soporte de tool calling / function calling: no confirmado explícitamente en la model card; se menciona que sin system prompt el modelo puede inventar llamadas a funciones, lo que sugiere cierta familiaridad con el formato pero no una garantía de soporte.
- Capacidades multilingües: no disponibles como lista oficial; se observan respuestas en chino en pruebas del autor.
- No se documenta soporte de visión ni audio en esta compilación, aunque el modelo base ERNIE 4.5 es multimodal; la model card no lo confirma para esta versión MLX.

## Casos de uso

- Razonamiento multi-paso en local: ejecutar cadenas de 4 a 6 saltos en un Mac con memoria unificada de 16 GB o más, aprovechando que esta compilación responde 47 preguntas que la cuantización uniforme de 4 bits falla, según el autor.
- Resolución de problemas matemáticos: usar el modelo para resolver ejercicios de GSM8K y problemas aritméticos de varios pasos, con un 99 % de acierto reportado en esa prueba.
- Asistente conversacional privado: desplegar un chatbot con plantilla de chat y system prompt en infraestructura propia (Mac Studio o portátil Apple Silicon), sin que los datos salgan del entorno.
- Generación de texto en aplicaciones de escritorio para macOS: integrar la librería mlx_lm en una app nativa y cargar el modelo de 12,3 GB en memoria unificada.
- Evaluación y comparación de estrategias de cuantización: usar esta compilación junto a la uniforme de 4 bits y la de 11 GB del mismo autor para medir el impacto de la precisión mixta en tareas de razonamiento y conocimiento.
- Prototipado de agentes con razonamiento: emplear el modelo en pipelines de agentes que requieran respuestas libres de hasta 3.072 tokens, con la advertencia de usar siempre system prompt para evitar respuestas desviadas.
- Investigación sobre eficiencia de modelos MoE: analizar el comportamiento de un MoE de 21B con 3B activos bajo cuantización mixta en hardware consumer Apple.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card, con el mismo arnés y las mismas preguntas:

| Modelo | Tamano | MMLU-400 | GSM8K | MMLU-Pro math | Cadenas, respuesta libre | Sumas, respuesta libre | Cadenas, conciso, thinking off | Sumas, conciso, thinking off |
|---|---|---|---|---|---|---|---|---|
| BF16 | 43,9 GB | 77,75 % | — | — | — | — | — | — |
| Uniforme 4-bit | 12,3 GB | 80,25 % | 94 % | 85 % | 36,5 % | 100 % | 0,0 % | 87,8 % |
| RAM 11GB | 11,1 GB | 75,00 % | 94 % | 85 % | 31,7 % | 98,9 % | 1,6 % | 86,7 % |
| RAM 12GB (esta compilación) | 12,3 GB | 75,25 % | 99 % | 85 % | 64,3 % | 98,9 % | 2,4 % | 84,4 % |

Notas del autor: en cadenas multi-paso (126 preguntas, 4 a 6 saltos, respuesta libre de hasta 3.072 tokens), esta compilación acierta 47 preguntas que la uniforme de 4 bits falla, frente a 12 en sentido contrario (McNemar exacto p = 5e-6); la ganancia se concentra en 5 y 6 saltos. En GSM8K, 99 % frente a 94 % (5–0 en las preguntas donde difieren). En MMLU, la uniforme de 4 bits acierta 33 preguntas que esta falla, frente a 13 en sentido contrario (p = 0,0045). Una repetición de la compilación de 11 GB reprodujo su puntuación de cadenas exactamente (31,7 %) y GSM8K con una pregunta de diferencia, por lo que el autor considera que las diferencias no son ruido entre ejecuciones.

## Requisitos de hardware

- VRAM estimada: 12,3 GB de pesos; con overhead de ejecución se recomienda al menos 16 GB de memoria unificada en Apple Silicon.
- Hardware objetivo: Apple Silicon (M1, M2, M3, M4 y variantes Pro, Max y Ultra) mediante la librería MLX; no está pensado para GPU NVIDIA.
- Cabe en consumer GPU Apple: sí, en Mac con 16 GB o más de memoria unificada; en modelos de 8 GB no cabe.
- Opciones de despliegue: mlx_lm (carga y generación), ecosistema MLX de Apple; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI en esta compilación.
- Latencia y throughput: no disponibles en la información proporcionada.
- Verificación: el autor reporta verificación bit a bit de cada tensor contra el manifiesto de la compilación y una puerta de seguridad de agente superada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | MMLU-400 | GSM8K | Licencia | Formato | Tamano |
|---|---|---|---|---|---|---|---|
| ERNIE-4.5-21B-A3B-PT-RAM-12GB-MLX (esta compilación) | 21,8 B (3 B activos) | No disponible | 75,25 % | 99 % | Apache 2.0 | Safetensors MLX | 12,3 GB |
| ERNIE-4.5-21B-A3B-PT uniforme 4-bit | 21,8 B (3 B activos) | No disponible | 80,25 % | 94 % | Apache 2.0 (modelo base) | No disponible | 12,3 GB |
| ERNIE-4.5-21B-A3B-PT-RAM-11GB-MLX | 21,8 B (3 B activos) | No disponible | 75,00 % | 94 % | Apache 2.0 | Safetensors MLX | 11,1 GB |
| ERNIE-4.5-21B-A3B-PT BF16 | 21,8 B (3 B activos) | No disponible | 77,75 % | — | Apache 2.0 | Safetensors | 43,9 GB |

No se dispone de datos de benchmarks de otros modelos de la misma categoría (MoE de ~20B con ~3B activos) en la información proporcionada, por lo que la comparativa se limita a las variantes del mismo modelo base publicadas por el autor.

## Limitaciones y advertencias

- Sin system prompt, el modelo puede dar respuestas desviadas ante peticiones concisas: respuestas en chino, emojis o llamadas a funciones inventadas, según el autor.
- Las respuestas abiertas cortas pueden empezar a mitad de frase, incluso en la cuantización uniforme de 4 bits.
- En modo conciso con thinking off, ningún build de ERNIE sigue cadenas de 4 a 6 saltos; esta compilación obtiene 2,4 % en esa prueba.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan medidas específicas de mitigación más allá de la puerta de seguridad de agente.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Limitaciones de contexto e idioma: la longitud de contexto no se especifica y la lista de idiomas soportados no está publicada; se observan respuestas en chino, lo que sugiere capacidades multilingües no documentadas formalmente.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe conservar la atribución y el aviso de licencia; conviene verificar la licencia del modelo base baidu/ERNIE-4.5-21B-A3B-PT.
- Dependencia de hardware Apple Silicon: no es ejecutable en GPU NVIDIA con las herramientas documentadas.
- El método de cuantización es propietario (Black Sheep AI) y no se detalla la asignación de precisión por tensor, lo que dificulta la reproducibilidad independiente.
- Las métricas provienen del propio autor y no de una evaluación independiente; los tamaños de muestra son reducidos (400 preguntas en MMLU, 100 en GSM8K, 126 en cadenas).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/baa-ai/ERNIE-4.5-21B-A3B-PT-RAM-12GB-MLX
- Modelo base: https://huggingface.co/baidu/ERNIE-4.5-21B-A3B-PT
- Compilación RAM 11GB: https://huggingface.co/baa-ai/ERNIE-4.5-21B-A3B-PT-RAM-11GB-MLX
- Sitio del autor (baa.ai): https://baa.ai
- Producto Ram (capa de razonamiento): https://baa.ai/compression.html
- Producto Paddock (plano de conocimiento): https://baa.ai/paddock.html
- Producto Watchman (capa GRC): https://baa.ai/watchman.html
- Producto Shepherd (despliegue): https://baa.ai/shepherd.html
