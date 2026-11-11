# saggl/niederbairisch-chat-v1-GGUF

## Resumen

Niederbairisch Chat v1 GGUF es un modelo de lenguaje conversacional derivado de Qwen2.5-0.5B-Instruct, afinado por el usuario saggl para responder en bávaro niederbairisch (dialecto del bajo bávaro, etiqueta `bar`). El modelo se distribuye en formato GGUF, con pesos fusionados a partir de un adaptador LoRA y cuantizados para inferencia local. Con 494 millones de parámetros, es un modelo de escala muy reducida, pensado para despliegues en hardware modesto y para experimentación lingüística sobre dialectos.

El problema que aborda es la escasez de modelos conversacionales que cubran variantes dialectales del alemán, un ámbito donde los modelos generalistas suelen responder en alemán estándar (`de`). El autor lo presenta explícitamente como un primer experimento sobre un corpus pequeño (dataset `saggl/niederbairisch-dataset`), por lo que debe interpretarse como una prueba de concepto más que como un modelo de producción.

La relevancia actual es limitada pero concreta: demuestra el flujo completo de adaptación LoRA, fusión de pesos y cuantización GGUF sobre un modelo base pequeño y de licencia permisiva, lo que facilita su reproducción y su uso en entornos con recursos muy restringidos. La arquitectura subyacente es la de Qwen2.5-0.5B-Instruct (transformer decoder-only), de la que hereda el contexto y las capacidades del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-0.5B-Instruct) |
| Parámetros totales | 494.032.768 |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la información proporcionada (la del modelo base Qwen2.5-0.5B-Instruct es de 32.768 tokens) |
| Tipos de cuantización | GGUF (el repo no detalla los niveles concretos publicados) |
| Idiomas soportados | alemán (`de`) y bávaro niederbairisch (`bar`) |
| Licencia | Apache 2.0 (dataset asociado bajo CC BY 4.0) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B-Instruct, un transformer decoder-only denso de 494 millones de parámetros. Sobre esa base se entrenó un adaptador LoRA orientado a conversación en bávaro niederbairisch, que posteriormente se fusionó con los pesos del modelo base y se cuantizó a GGUF. La model card no especifica hiperparámetros del entrenamiento (rango del LoRA, tasa de aprendizaje, número de pasos), ni el volumen de tokens utilizado, ni si hubo fases de RLHF o DPO adicionales.

El corpus de entrenamiento es el dataset `saggl/niederbairisch-dataset`, descrito por el autor como pequeño. No se detalla su composición, número de ejemplos ni proceso de filtrado. Tampoco se documentan innovaciones técnicas más allá del flujo estándar de adaptación y cuantización. Cualquier afirmación sobre calidad del ajuste fino debe tomarse con cautela: el propio autor lo califica de "experimental first run on a small corpus".

## Capacidades

- Generación de texto conversacional multi-turno, heredada de la naturaleza instruct del modelo base.
- Respuesta en bávaro niederbairisch y en alemán, según la información de idiomas del repo.
- Razonamiento básico y respuesta a instrucciones propias de un modelo de 0,5B parámetros (capacidad limitada por escala).
- Generación de código y matemáticas elementales, limitada por el tamaño del modelo base.
- Soporte de tool calling y function calling: no disponible de forma explícita en la información proporcionada (el modelo base Qwen2.5 sí lo soporta, pero no se confirma para este ajuste).
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo thinking explícito: no disponible.

## Casos de uso

- Experimentación dialectal: evaluar hasta qué punto un ajuste LoRA sobre 0,5B parámetros puede reproducir rasgos del bávaro niederbairisch en conversación, comparando salidas con el modelo base sin ajustar.
- Chatbot de demostración en local: desplegar un asistente conversacional en dialecto en un portátil o una Raspberry Pi, gracias al tamaño reducido y al formato GGUF.
- Preservación lingüística y divulgación: generar ejemplos de diálogo en niederbairisch para materiales educativos o proyectos de documentación dialectal, siempre con revisión humana.
- Pruebas de pipeline de cuantización: usar el repo como caso de estudio para validar flujos de fusión LoRA + conversión GGUF antes de escalar a modelos mayores.
- Filtrado y etiquetado lingüístico de bajo coste: clasificar o reformular frases cortas en dialecto en entornos con CPU, donde un modelo mayor sería inviable.
- Prototipado rápido de interfaces conversacionales: integrar el modelo en aplicaciones de chat con `llama.cpp` u Ollama para validar UX antes de invertir en modelos más grandes.
- Investigación sobre sesgos y alucinación en modelos pequeños: analizar cómo un modelo de 0,5B falla al mantener coherencia dialectal y factual en conversaciones largas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 0,5-0,6 GB en cuantización Q4_K_M y aproximadamente 1 GB en Q8_0, considerando los 494M parámetros y el overhead de la ventana de contexto.
- GPU recomendadas: cualquier GPU consumer con 2 GB o más de VRAM (GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4060). También funciona en CPU.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU dedicada moderna e incluso en iGPU con memoria unificada.
- Opciones de despliegue: `llama.cpp`, Ollama, `llama-cpp-python`, y servidores compatibles con GGUF. El tag `endpoints_compatible` del repo sugiere compatibilidad con endpoints de Hugging Face.
- Latencia y throughput: no disponibles en la información proporcionada. Por escala, se espera inferencia interactiva en CPU moderna y muy rápida en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| saggl/niederbairisch-chat-v1-GGUF | 494M | no disponible (base: 32.768) | de, bar | Apache 2.0 | GGUF |
| Qwen/Qwen2.5-0.5B-Instruct | 494M | 32.768 | multilingüe (incl. de) | Apache 2.0 | safetensors, GGUF |
| Qwen/Qwen2.5-1.5B-Instruct | 1.540M aprox. | 32.768 | multilingüe (incl. de) | Apache 2.0 | safetensors, GGUF |
| saggl/niederbairisch-chat-v1 (LoRA) | adaptador sobre 494M | heredado del base | de, bar | Apache 2.0 | safetensors (adaptador) |

La comparación directa con el modelo base es la más informativa: mismo tamaño y licencia, pero el ajuste añade cobertura dialectal a costa de posibles regresiones en alemán estándar y en capacidades generales. Frente a Qwen2.5-1.5B-Instruct, el modelo de saggl ofrece menor capacidad bruta pero mayor especialización dialectal y menor huella de memoria.

## Limitaciones y advertencias

- Modelo experimental: el autor lo describe como un primer intento sobre un corpus pequeño, sin evaluación publicada.
- Riesgo elevado de alucinación y de incoherencia en conversaciones largas, agravado por la escala de 0,5B parámetros.
- Posible regresión en alemán estándar y en tareas generales tras el ajuste dialectal; no se han publicado evaluaciones que lo cuantifiquen.
- Cobertura dialectal limitada al niederbairisch del corpus; otras variantes bávaras pueden no estar representadas.
- Sin datos sobre sesgos específicos del corpus; al ser un dataset pequeño y de autor único, puede reflejar sesgos de la fuente.
- Licencia Apache 2.0 permisiva para uso comercial, pero el dataset asociado está bajo CC BY 4.0, lo que exige atribución si se redistribuye o se reentrena con él.
- No se documentan niveles de cuantización concretos ni métricas de perplejidad; conviene validar la calidad de cada fichero GGUF antes de usarlo en producción.
- No apto para tareas que requieran razonamiento complejo, tool calling fiable o contextos largos con precisión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/saggl/niederbairisch-chat-v1-GGUF
- Adaptador LoRA original: https://huggingface.co/saggl/niederbairisch-chat-v1
- Dataset de entrenamiento: https://huggingface.co/datasets/saggl/niederbairisch-dataset
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
