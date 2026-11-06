# cmriat/lion-ER-9B

## Resumen

Lion-ER-9B (LionRock Embodied Reasoner) es un modelo multimodal de razonamiento visual desarrollado por Lionrock Artificial Intelligence Laboratory, obtenido mediante ajuste fino supervisado del modelo base Qwen3.5-9B. Está especializado en comprensión de escenas, relaciones espaciales, interacciones entre objetos y preguntas visuales orientadas a la acción, un dominio conocido como razonamiento encarnado (embodied reasoning). Emplea una arquitectura densa con 9.653.104.368 parámetros totales, lo que lo sitúa en la franja de los 9B.

El modelo se distribuye con licencia Apache 2.0, pesos en formato safetensors y es compatible con la librería transformers y con endpoints compatibles. Su pipeline declarado es image-text-to-text, y su relevancia actual radica en que cubre una tarea poco frecuente en modelos abiertos de este tamaño: el razonamiento espacial y de trayectorias sobre imágenes, útil para robótica, planificación de manipulación y agentes visuales.

La información publicada por el autor no detalla la longitud de contexto, los idiomas soportados ni resultados de benchmarks específicos para la variante de 9B (las cifras principales corresponden a Lion-ER-35B-A3B, con resultados de las variantes pequeñas en una tabla aparte). El repositorio ocupa 19,3 GB y el modelo se publicó el 29 de octubre de 2026.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (base Qwen3.5-9B) |
| Parámetros totales | 9.653.104.368 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Lion-ER-9B parte del backbone Qwen3.5-9B, un transformer denso, y se obtiene mediante ajuste fino supervisado (SFT) con una mezcla de datos orientada al razonamiento visual y encarnado. La model card indica que la mezcla de entrenamiento comprende 312.380 ejemplos supervisados, contabilizados por ejemplo de entrenamiento y no por pregunta única, token ni habilidad medida; si una pregunta tiene varias trayectorias de razonamiento retenidas, cada ejemplo resultante se cuenta por separado. Cada ejemplo se asigna a una capacidad primaria según su anotación de tarea existente, y las anotaciones amplias o poco específicas quedan en la categoría «Mixed / unspecified».

La receta de entrenamiento se aplica de forma idéntica a los backbones Qwen3.5-4B y Qwen3.5-9B, y el autor publica una comparativa por tamaños frente a los modelos base oficiales correspondientes, con la diferencia absoluta en puntos porcentuales. No se detalla en la información disponible la composición exacta del dataset, el número de tokens de entrenamiento ni si hubo fases de RLHF o DPO. Tampoco se documentan innovaciones de inferencia como decodificación especulativa o atención lineal.

## Capacidades

- Razonamiento visual sobre escenas: interpretación de qué muestra una imagen antes de responder.
- Razonamiento espacial: relaciones entre objetos, posiciones y disposición en el espacio.
- Razonamiento encarnado: preguntas orientadas a la acción y a trayectorias (por ejemplo, selección de trayectorias en tareas de ERQA).
- Preguntas y respuestas visuales (VQA), incluidas preguntas de opción múltiple con formato de respuesta `\boxed{X}`.
- Razonamiento multi-paso sobre imágenes, con trayectorias de razonamiento antes de la respuesta final.
- Interacción conversacional multimodal en formato image-text-to-text.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y multi-step reasoning general: no disponible; solo se documenta el razonamiento visual por trayectorias.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, audio): no disponible.

## Casos de uso

- Robótica de manipulación: el modelo puede evaluar una imagen del entorno y razonar sobre la posición relativa de objetos y superficies para seleccionar una trayectoria de agarre, aprovechando su especialización en razonamiento espacial y encarnado.
- Selección de trayectorias de movimiento: dado un conjunto de trayectorias dibujadas sobre una imagen, el modelo puede razonar cuál es la más adecuada para alcanzar un objetivo, como ilustra el ejemplo ERQA_155 de la model card.
- Asistencia a personas con discapacidad visual: descripción de escenas con énfasis en relaciones espaciales y objetos relevantes para la navegación, en lugar de descripciones genéricas.
- Inspección visual en entornos industriales: análisis de imágenes de una línea de montaje para identificar la disposición de piezas y posibles conflictos espaciales antes de una operación automatizada.
- Evaluación de preguntas visuales de opción múltiple: uso como componente de un pipeline de evaluación o de un sistema de tutoría que requiere respuestas razonadas con formato controlado (`\boxed{X}`).
- Prototipado de agentes visuales: integración en un bucle de razonamiento donde el modelo observa una imagen, razona por pasos y emite una acción o respuesta, gracias a su formato conversacional multimodal.
- Análisis de escenas para planificación de tareas: descomposición de una instrucción en pasos que dependen de la configuración espacial observada en la imagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para Lion-ER-9B en la información disponible. La model card indica que las cifras principales de benchmark y de ERQA corresponden a Lion-ER-35B-A3B (con un promedio de 65,29 sobre diez benchmarks, calculado como avg@4), y que los resultados de Lion-ER-4B y Lion-ER-9B se reportan únicamente en la tabla «Lion-ER across model sizes», cuyos valores numéricos no se incluyen en el texto proporcionado. Los benchmarks citados en la evaluación son diez, entre ellos RealWorldQA, RoboBench, BLINK y Where2Place, pero no se dispone de sus valores para esta variante.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño (9,65B parámetros), en FP16 se requieren aproximadamente 19,3 GB solo para los pesos, a los que hay que sumar el overhead del runtime y la memoria para el procesamiento de imágenes; en cuantización de 8 bits rondaría los 10 GB y en 4 bits unos 5-6 GB, aunque el autor no publica cuantizaciones ni cifras oficiales.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, cabría esperar GPUs de 24 GB o más (RTX 4090, L40S, A100 40/80 GB, H100) para FP16, pero no es un dato confirmado por el autor.
- ¿Cabe en GPU de consumo? No confirmado. En FP16 probablemente no en GPUs de 16 GB; en cuantizaciones de 4-8 bits podría caber en tarjetas de 12-24 GB, pero el autor no ofrece pesos GGUF ni cuantizados.
- Opciones de despliegue: transformers con torch, torchvision, accelerate y pillow, según las instrucciones de la model card. Compatible con endpoints compatibles según los tags. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Lion-ER-9B | 9,65B | no disponible | Razonamiento visual y encarnado (fine-tune de Qwen3.5-9B) | Apache 2.0 | Hugging Face |
| Qwen3.5-9B | no disponible en la información | no disponible | Modelo base multimodal | no disponible en la información | Hugging Face |
| Lion-ER-4B | no disponible en la información | no disponible | Razonamiento visual y encarnado (fine-tune de Qwen3.5-4B) | Apache 2.0 | Hugging Face |
| Lion-ER-35B-A3B | no disponible en la información (MoE) | no disponible | Razonamiento visual y encarnado (variante grande) | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo numérico entre estas variantes en la información proporcionada, salvo la afirmación de que Lion-ER-35B-A3B obtiene un promedio de 65,29 en diez benchmarks con avg@4.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor. Al derivar de Qwen3.5-9B, puede heredar sesgos del modelo base, pero no se especifican.
- Riesgo de alucinación: presente como en cualquier modelo generativo multimodal; la model card insiste en razonar sobre lo que la imagen muestra realmente antes de responder, lo que sugiere que el modelo puede responder sin fundamento visual si no se le guía con el system prompt adecuado.
- Limitaciones de contexto e idioma: no se especifican la longitud de contexto ni los idiomas soportados.
- Licencia: Apache 2.0, lo que permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-9B, cuya licencia no se detalla en la información disponible.
- Caveats para producción: el modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria. Las cifras de benchmark publicadas corresponden a la variante de 35B-A3B, no a la de 9B. No se ofrecen pesos cuantizados ni guías de despliegue en servidores de inferencia de alto rendimiento. Las diferencias pequeñas de puntuación no deben interpretarse como estadísticamente significativas, según el propio autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cmriat/lion-ER-9B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio ERQA (Google DeepMind): https://github.com/embodiedreasoning/ERQA
- Licencia de ERQA (CC BY 4.0): https://github.com/embodiedreasoning/ERQA/blob/main/LICENSE
- Conversión del dataset ERQA en FlagEval: https://huggingface.co/datasets/FlagEval/ERQA
