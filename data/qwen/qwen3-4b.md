# Qwen/Qwen3-4B

## Resumen

Qwen3-4B es un modelo de lenguaje causal de 4.000 millones de parámetros desarrollado por el equipo Qwen de Alibaba, publicado el 27 de abril de 2025 bajo licencia Apache 2.0. Forma parte de la familia Qwen3, que incluye modelos densos y de mezcla de expertos (MoE), y se distribuye como modelo instruct con post-entrenamiento orientado a conversación, razonamiento y uso de herramientas. Su principal innovación es la capacidad de alternar entre un modo de pensamiento explícito (thinking) y un modo directo (non-thinking) dentro del mismo modelo, lo que permite adaptar el comportamiento según la complejidad de la tarea.

Con una arquitectura Transformer densa de 36 capas, atención con consultas agrupadas (GQA) de 32 cabezas de consulta y 8 de clave/valor, y una ventana de contexto nativa de 32.768 tokens ampliable a 131.072 mediante la extensión YaRN, el modelo está diseñado para cubrir razonamiento lógico, matemáticas, generación de código y diálogo multilingüe en más de 100 idiomas. Su tamaño compacto lo hace especialmente atractivo para despliegue en hardware de consumo y entornos con recursos limitados, manteniendo un rendimiento competitivo frente a modelos de mayor escala.

La relevancia actual de Qwen3-4B radica en que combina capacidades de razonamiento avanzado (heredadas de la serie QwQ) con eficiencia computacional, y ofrece soporte nativo para integración con herramientas externas (function calling) y flujos de agente, tanto en modo pensante como no pensante. Esto lo convierte en una opción sólida para desarrolladores que necesitan un modelo local de bajo coste con capacidades de nivel superior en tareas complejas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso con atención GQA (32 cabezas Q, 8 cabezas KV) |
| Parametros totales | 4.022.468.096 (4,0B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens nativo; 131.072 tokens con extensión YaRN |
| Tipos de cuantizacion | No especificados oficialmente; la comunidad ofrece formatos GGUF, AWQ y GPTQ |
| Idiomas soportados | Más de 100 idiomas y dialectos (incluido español, inglés, chino, francés, alemán, etc.) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Qwen3-4B emplea una arquitectura Transformer causal de tipo denso, con 36 capas y atención de consultas agrupadas (GQA), donde 32 cabezas de consulta comparten 8 cabezas de clave/valor para reducir el coste de memoria y acelerar la inferencia. El modelo fue entrenado en dos etapas: preentrenamiento sobre un corpus masivo multilingüe y post-entrenamiento orientado a alineación con preferencias humanas, lo que incluye ajuste fino supervisado y optimización por preferencias (similar a RLHF/DPO). La model card no detalla el número exacto de tokens de entrenamiento ni la composición del dataset, por lo que estos datos no están disponibles.

La innovación técnica más destacada es el soporte de conmutación entre modo de pensamiento y modo no pensante dentro de un mismo conjunto de pesos. En modo pensante, el modelo genera un bloque intermedio de razonamiento delimitado por etiquetas especiales antes de producir la respuesta final, lo que mejora el rendimiento en tareas de lógica, matemáticas y código. En modo no pensante, responde directamente, optimizando latencia y coste para diálogo general. Esta funcionalidad se controla mediante el parámetro `enable_thinking` en la plantilla de chat y es compatible con los servidores de inferencia SGLang y vLLM.

Además, el modelo ha sido entrenado para integrarse con herramientas externas y ejecutar tareas de agente en ambos modos, lo que le permite llamar funciones, consultar APIs y encadenar múltiples pasos de razonamiento. El post-entrenamiento también prioriza la alineación con preferencias humanas en escritura creativa, juegos de rol y conversaciones multi-turno, según se indica en la documentación oficial.

## Capacidades

- Generación de texto conversacional con alta calidad en más de 100 idiomas, incluido español, con seguimiento de instrucciones multilingüe y traducción.
- Razonamiento explícito en modo pensante: el modelo produce cadenas de razonamiento internas antes de responder, mejorando el rendimiento en problemas de lógica, matemáticas y código.
- Modo no pensante para respuestas rápidas y eficientes en diálogo general, sin coste adicional de tokens de razonamiento.
- Soporte de function calling y tool calling: puede invocar herramientas externas y estructurar llamadas a funciones tanto en modo pensante como no pensante.
- Capacidades de agente: ejecución de tareas multi-paso con razonamiento encadenado y uso de herramientas, orientado a flujos de automatización y orquestación.
- Generación de código y depuración: competente en lenguajes de programación populares (Python, JavaScript, etc.) y en tareas de programación competitiva.
- Matemáticas y razonamiento simbólico: resolución de problemas aritméticos, algebraicos y de lógica formal con precisión mejorada respecto a generaciones anteriores.
- Escritura creativa y juegos de rol: alineado con preferencias humanas para producir textos naturales, atractivos y contextualmente coherentes en conversaciones largas.
- Procesamiento de contexto largo: ampliable hasta 131.072 tokens mediante la extensión YaRN, útil para documentos extensos o historiales de conversación prolongados.

## Casos de uso

- Asistente virtual local de bajo coste: con 4B parámetros y soporte para cuantización, el modelo puede ejecutarse en una GPU de consumo (p. ej., RTX 3060 con 12 GB) para ofrecer un asistente conversacional multilingüe sin depender de APIs externas, ideal para aplicaciones de escritorio o dispositivos edge.
- Generación de código en entornos de desarrollo integrado: gracias a su capacidad de razonamiento en modo pensante y a su competencia en programación, puede integrarse en IDE como plugin de autocompletado o generación de funciones, reduciendo el tiempo de desarrollo en tareas de refactorización y pruebas unitarias.
- Automatización de atención al cliente con tool calling: el modelo puede gestionar conversaciones multi-turno, consultar bases de conocimiento mediante llamadas a APIs y escalar casos complejos a un agente humano, todo ello con una ventana de contexto de 32K tokens que permite mantener historiales extensos.
- Análisis y resumen de documentos extensos: con la extensión YaRN hasta 131K tokens, es adecuado para resumir contratos, informes técnicos o artículos científicos completos sin necesidad de fragmentación previa.
- Tutor de matemáticas y razonamiento lógico: en modo pensante, el modelo desglosa los pasos de resolución de problemas matemáticos, lo que permite construir aplicaciones educativas que expliquen el proceso de razonamiento al estudiante.
- Traducción automática multilingüe: al soportar más de 100 idiomas, puede utilizarse como motor de traducción local para contenidos web, documentación técnica o subtítulos, con la ventaja de preservar el contexto conversacional en diálogos largos.
- Agente de automatización de tareas (RPA): combinando function calling y razonamiento multi-paso, puede orquestar flujos como envío de correos, actualización de registros en CRM o extracción de datos de APIs, ejecutándose en un servidor con una única GPU.
- Prototipado rápido de chatbots empresariales: su licencia Apache 2.0 permite uso comercial sin restricciones, lo que facilita su integración en productos SaaS o internos sin coste de royalties.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona cualitativamente que el modelo supera a QwQ en modo pensante y a Qwen2.5 instruct en modo no pensante en tareas de matemáticas, generación de código y razonamiento lógico de sentido común, pero no se proporcionan cifras concretas. Se recomienda consultar el blog oficial de Qwen (enlazado más abajo) para acceder a las tablas de evaluación detalladas.

## Requisitos de hardware

- VRAM estimada para inferencia: en precisión FP16, el modelo requiere aproximadamente 8 GB de VRAM (4B parámetros × 2 bytes). Con cuantización INT8 baja a ~4 GB, y con INT4 a ~2 GB.
- GPU recomendadas: para FP16, una NVIDIA RTX 3060 (12 GB), RTX 4060 (8 GB) o superior es suficiente. Para cuantización INT4, puede ejecutarse en GPUs con 4 GB de VRAM como la RTX 3050 o incluso en Apple Silicon con MLX.
- Compatibilidad con hardware de consumo: sí, cabe en la mayoría de GPUs de consumo actuales gracias a su tamaño compacto y a las opciones de cuantización disponibles en la comunidad.
- Opciones de despliegue: compatible con vLLM (versión >= 0.8.5), SGLang (>= 0.4.6.post1), Ollama, LMStudio, MLX-LM, llama.cpp y KTransformers. También es compatible con servicios gestionados como SageMaker y Azure.
- Latencia y throughput estimados: no disponibles en la documentación oficial. En una GPU RTX 4090, se puede esperar una velocidad de generación del orden de 50-100 tokens por segundo en FP16, aunque este dato no está confirmado por el fabricante.

## Comparativa con modelos similares

La siguiente comparación se basa en información pública general de cada modelo. Los datos de Qwen3-4B provienen de la model card oficial; los de Qwen2.5-4B y Llama-3.2-3B son de conocimiento común y pueden variar según la versión.

| Modelo | Parámetros | Contexto nativo | Licencia | Modo pensamiento | Idiomas |
|---|---|---|---|---|---|
| Qwen3-4B | 4,0B | 32.768 (131K con YaRN) | Apache 2.0 | Sí (conmutable) | 100+ |
| Qwen2.5-4B | 4,0B | 32.768 | Apache 2.0 | No | 100+ |
| Llama-3.2-3B | 3,2B | 128.000 | Llama 3.2 Community | No | Principalmente inglés (multilingüe limitado) |

Qwen3-4B se diferencia de Qwen2.5-4B por la incorporación del modo de razonamiento explícito y por un post-entrenamiento más avanzado en alineación con preferencias humanas y capacidades de agente. Frente a Llama-3.2-3B, ofrece un contexto nativo menor (32K frente a 128K) pero una cobertura multilingüe mucho más amplia y la ventaja de poder alternar entre pensamiento y respuesta directa. En términos de rendimiento, la documentación de Qwen afirma superioridad sobre Qwen2.5 instruct en tareas de código y matemáticas, aunque no se aportan cifras comparativas concretas en la información disponible.

## Limitaciones y advertencias

- La model card advierte sobre la posibilidad de repeticiones infinitas si no se configuran adecuadamente los parámetros de muestreo; recomienda establecer `presence_penalty` a 1.5 para mitigar este problema.
- No se han publicado datos detallados sobre sesgos demográficos o culturales del modelo. Como modelo entrenado con datos web multilingües, puede reflejar sesgos presentes en el corpus de entrenamiento, por lo que se recomienda auditar su comportamiento antes de un despliegue en producción sensible.
- Riesgo de alucinación: como todos los modelos de lenguaje, puede generar información falsa o inventada, especialmente en modo no pensante donde no hay verificación interna del razonamiento.
- La ventana de contexto de 32K tokens nativa puede resultar limitada para tareas que requieran documentos muy extensos sin utilizar la extensión YaRN, que puede degradar ligeramente la calidad en los tramos más largos.
- El modo pensante genera tokens adicionales de razonamiento, lo que incrementa la latencia y el coste computacional en comparación con el modo no pensante; es necesario seleccionar el modo adecuado según la tarea.
- La información sobre el dataset de entrenamiento, el número exacto de tokens y los procedimientos de alineación (RLHF/DPO) no está disponible en la model card, lo que limita la auditoría externa del modelo.
- Aunque la licencia Apache 2.0 permite uso comercial sin restricciones, es recomendable revisar los términos de la licencia del código base y de los datos utilizados en el entrenamiento, que no se detallan en la documentación pública.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Qwen/Qwen3-4B
- Blog oficial de Qwen3: https://qwenlm.github.io/blog/qwen3/
- Repositorio GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Documentación de Qwen: https://qwen.readthedocs.io/en/latest/
- Versión actualizada Instruct-2507: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Ficha en Qualcomm AI Hub: https://aihub.qualcomm.com/mobile/models/qwen3_4b
- Ficha en Together AI: https://www.together.ai/models/qwen3-4b
