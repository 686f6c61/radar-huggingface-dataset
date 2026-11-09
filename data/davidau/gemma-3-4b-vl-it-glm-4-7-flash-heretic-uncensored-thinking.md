# DavidAU/Gemma-3-4B-VL-it-GLM-4.7-Flash-Heretic-Uncensored-Thinking

## Resumen

Gemma-3-4B-VL-it-GLM-4.7-Flash-Heretic-Uncensored-Thinking es un ajuste fino (fine-tune) del modelo multimodal Gemma 3 de 4B de Google, publicado por el usuario DavidAU en Hugging Face. El modelo parte de una variante ya "abliterated" (con los mecanismos de rechazo suprimidos) y se ha entrenado adicionalmente con el dataset de razonamiento TeichAI/glm-4.7-2000x, empleando la herramienta Heretic para la eliminación de rechazos y Unsloth para el entrenamiento. El resultado es un modelo de 4.300 millones de parámetros con capacidad de procesamiento de imagen y texto, contexto de 128k tokens y un modo de razonamiento ("thinking") integrado.

El objetivo declarado del autor es ofrecer un modelo sin censura, orientado a escritura creativa, ficción, roleplay y generación de contenido explícito o sensible, que no rechace peticiones del usuario. La combinación de la base Gemma 3 (arquitectura transformer multimodal con visión) con un corpus de razonamiento destilado de GLM 4.7 Flash busca mejorar la calidad del razonamiento y, según el autor, también el procesamiento de imágenes.

Es relevante en el ecosistema open source porque demuestra el flujo actual de "de-censoring" (Heretic + abliteration) aplicado a modelos pequeños multimodales, y porque permite ejecutar un modelo con visión y contexto largo en hardware de consumo. No obstante, se trata de un modelo de nicho, con solo 49 descargas y 8 likes en el momento de la consulta, y con benchmarks limitados y no directamente comparables con los de los modelos originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 3), texto + imagen |
| Parametros totales | 4.300.079.472 (~4,3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128k tokens (según model card) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; el autor menciona cuantización vía Unsloth y plantillas jinja para "quanting", sin detallar tipos) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo se basa en Gemma 3 4B instruct, una arquitectura transformer multimodal que procesa entradas de imagen y texto (pipeline image-text-to-text). Sobre esa base, el autor aplicó primero un proceso de "abliteration" (variante Extreme) para eliminar los rechazos, y después un fine-tune supervisado con el dataset TeichAI/glm-4.7-2000x, un corpus de razonamiento generado a partir de GLM 4.7 Flash. El entrenamiento se realizó con Unsloth sobre hardware local con Linux. Adicionalmente se empleó la herramienta Heretic del equipo P-E-W para la eliminación de comportamientos de rechazo, con una divergencia KL reportada de 0,38 frente al modelo original (el autor considera excelente un valor inferior a 1).

La innovación principal es la integración de un modo de razonamiento ("thinking") que, según la model card, afecta al funcionamiento general del modelo, a la generación de salida, al procesamiento de imágenes y a los benchmarks. El razonamiento se puede activar con la instrucción "think deeply:" o mediante la plantilla `chat-template-thinking.jinja`, que incluye un system prompt de pensamiento editable. El autor indica que el razonamiento es "compacto pero detallado" y estable frente a la temperatura (rango recomendado de 0,1 a 2,5). No se especifican el número de tokens de entrenamiento ni la composición detallada del dataset más allá de su origen.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" integrado (pensamientos entre etiquetas `<think>` y `</think>`).
- Procesamiento de imagen y texto (image-text-to-text), con razonamiento que el autor afirma mejora el procesamiento de imágenes.
- Escritura creativa y de ficción: relatos, tramas, subtramas, continuación de escenas, ciencia ficción, romance y todos los géneros.
- Generación de contenido sin censura: el modelo no rechaza peticiones de contenido explícito, aunque el autor advierte que en algunos casos requiere direccionamiento explícito (por ejemplo, indicar el vocabulario o el tono deseado) para alcanzar el nivel gráfico esperado.
- Conversación multi-turno y roleplay (con ajustes de suavizado recomendados en KoboldCpp, text-generation-webui y Silly Tavern).
- Soporte de system prompts que modulan el razonamiento y la generación; el razonamiento no requiere plantilla ni system prompt en la mayoría de casos.
- Capacidades multilingües: limitadas al inglés según la model card.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente; el modo thinking podría habilitarlo, pero no se especifica.

## Casos de uso

- Escritura de ficción y relatos: el modelo está ajustado específicamente para generación de tramas, subtramas y continuación de escenas, con un modo de razonamiento que ayuda a mantener coherencia narrativa en textos largos gracias a su contexto de 128k tokens.
- Roleplay conversacional: su entrenamiento sin rechazos y los ajustes de suavizado recomendados lo hacen adecuado para personajes y diálogos multi-turno en herramientas como Silly Tavern.
- Generación de contenido para adultos o sensible: el modelo no rechaza peticiones explícitas, lo que lo hace útil para proyectos de ficción para adultos, aunque requiere direccionamiento explícito del tono y vocabulario.
- Análisis y descripción de imágenes con razonamiento: al ser multimodal, puede procesar imágenes y generar descripciones o narrativas a partir de ellas, con el modo thinking como refuerzo del análisis.
- Prototipado de asistentes creativos en local: con 4,3B parámetros y pesos bfloat16, es viable en GPUs de consumo, lo que permite experimentar con un modelo multimodal y de contexto largo sin infraestructura cloud.
- Investigación sobre de-censoring y alineación: sirve como caso de estudio del pipeline Heretic + abliteration + fine-tune, con métricas de divergencia KL y tasa de rechazos publicadas por el autor.
- Generación de guiones y material narrativo para videojuegos o campañas de rol de mesa: su capacidad de continuar escenas y generar subtramas encaja con la producción de contenido narrativo ramificado.

## Benchmarks y rendimiento

El autor publica resultados en la model card para siete tareas de evaluación:

| Benchmark | Resultado |
|---|---|
| ARC Challenge | 0,455 |
| ARC Easy | 0,619 |
| BoolQ | 0,813 |
| HellaSwag | 0,668 |
| OpenBookQA | 0,412 |
| PIQA | 0,774 |
| Winogrande | 0,659 |

Además, se reporta una comparación de de-censoring frente al modelo original:

| Métrica | Este modelo | google/gemma-3-27b-it |
|---|---|---|
| Divergencia KL | 0,38 | 0 (por definición) |
| Rechazos | 2/100 | 98/100 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni comparativas directas con otros modelos de la misma categoría en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bfloat16, aproximadamente 8,6 GB (tamaño del repo); en cuantización de 8 bits, en torno a 4,5-5 GB; en 4 bits, alrededor de 2,5-3 GB (estimaciones a partir del número de parámetros, no publicadas por el autor).
- GPU recomendadas: para bfloat16 completo, una GPU con 12-16 GB o más (RTX 4080/4090, A100, H100). Para cuantizaciones de 4-8 bits, GPUs de consumo con 6-8 GB (RTX 3060, RTX 4060, etc.).
- Cabe en GPU de consumo: sí, especialmente en cuantizaciones de 4 y 8 bits; en bfloat16 requiere al menos 12 GB.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), Unsloth para entrenamiento y cuantización; el autor menciona KoboldCpp, oobabooga/text-generation-webui y Silly Tavern para chat y roleplay. No se confirma soporte de llama.cpp, Ollama o vLLM en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Notas |
|---|---|---|---|---|---|
| Gemma-3-4B-VL-it-GLM-4.7-Flash-Heretic-Uncensored-Thinking | 4,3B | 128k | Sí (imagen + texto) | apache-2.0 | Sin censura, modo thinking, benchmarks propios limitados |
| google/gemma-3-4b-it | 4,3B | 128k | Sí (imagen + texto) | Gemma Terms of Use | Modelo original con alineación y rechazos |
| DavidAU/gemma-3-4b-it-heretic-uncensored-abliterated-Extreme | 4,3B | 128k | Sí (imagen + texto) | no disponible | Base directa de este modelo, sin el fine-tune de razonamiento |
| google/gemma-3-27b-it | 27B | 128k | Sí (imagen + texto) | Gemma Terms of Use | Referencia usada por el autor para la comparación de rechazos |

No se dispone de datos de benchmarks comparables entre estos modelos en la información proporcionada, salvo la comparación de divergencia KL y tasa de rechazos ya citada.

## Limitaciones y advertencias

- Modelo sin censura: elimina deliberadamente los rechazos, por lo que puede generar contenido explícito, violento u ofensivo; no es apto para aplicaciones comerciales orientadas al público general sin filtros adicionales.
- Riesgo de alucinación: inherente a los modelos de 4B parámetros; el modo de razonamiento no garantiza veracidad factual.
- Idiomas: solo inglés según la model card; el rendimiento en castellano no está documentado y probablemente sea deficiente.
- Licencia apache-2.0: permite uso comercial, pero el modelo base Gemma 3 de Google está sujeto a los Gemma Terms of Use, lo que puede imponer restricciones adicionales que el autor no detalla.
- Benchmarks limitados: solo se publican siete tareas de evaluación y no hay comparación con modelos de referencia; los resultados no permiten evaluar calidad en razonamiento complejo, código o matemáticas.
- Comportamiento de contenido explícito: el autor advierte que, pese a no rechazar, el modelo puede generar contenido "bland" sin direccionamiento explícito del tono y vocabulario.
- Configuración sensible: requiere ajustes de suavizado (Smoothing_factor 1,5) en algunas herramientas para un funcionamiento óptimo, lo que indica sensibilidad a los parámetros de muestreo.
- Advertencia de producción: la baja adopción (49 descargas) y la naturaleza experimental del ajuste desaconsejan su uso en entornos de producción críticos sin una evaluación propia exhaustiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DavidAU/Gemma-3-4B-VL-it-GLM-4.7-Flash-Heretic-Uncensored-Thinking
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- Modelos del autor en tendencia: https://huggingface.co/models?sort=trending&search=DavidAU
- Página de soporte del autor: https://huggingface.co/DavidAU/support
- Modelo base: https://huggingface.co/DavidAU/gemma-3-4b-it-heretic-uncensored-abliterated-Extreme
- Dataset de entrenamiento: https://huggingface.co/datasets/TeichAI/glm-4.7-2000x
- Modelo original de referencia: https://huggingface.co/google/gemma-3-27b-it
