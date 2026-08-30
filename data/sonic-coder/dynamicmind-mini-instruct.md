# sonic-coder/DynamicMind-Mini-Instruct

## Resumen

DynamicMind-Mini-Instruct es un modelo de lenguaje pequeño (8,9 millones de parámetros) desarrollado por sonic-coder, basado en el modelo base DynamicMind-Mini de DedeProGames. Se trata de la versión ajustada por instrucciones, entrenada mediante fine-tuning completo sobre el dataset HuggingFaceTB/smol-smoltalk, aplicando la pérdida únicamente a los tokens de asistente y al token EOS final. El modelo emplea una arquitectura decoder estilo Llama personalizada, con atención por grupos de consulta (GQA), MLP con activación SwiGLU y conexiones residuales.

Con una ventana de contexto de 1.024 tokens y un tokenizador BPE a nivel de byte con conciencia de dígitos de 8.192 tokens, este modelo está diseñado para tareas de generación de texto y conversación multi-turno en entornos con recursos muy limitados. Su tamaño reducido lo hace ejecutable en CPU y en GPUs de baja gama, aunque su capacidad de razonamiento y conocimiento es limitada en comparación con modelos de mayor escala. La licencia Apache 2.0 permite uso comercial sin restricciones significativas.

La relevancia de este modelo radica en su enfoque de eficiencia extrema: demuestra que es posible construir asistentes conversacionales funcionales con menos de 10 millones de parámetros, lo que lo convierte en un candidato interesante para experimentación educativa, prototipado rápido y despliegue en dispositivos embebidos o entornos con restricciones de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder estilo Llama personalizado (GQA, SwiGLU, residual) |
| Parametros totales | 8.884.992 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura de decoder transformer personalizada, inspirada en Llama pero con dimensiones reducidas: 9 capas, tamaño oculto de 256, tamaño intermedio de 768, 8 cabezas de atención de consulta y 2 cabezas clave/valor (GQA). Los embeddings de entrada y salida están atados (tied embeddings), lo que reduce el número de parámetros. El tokenizador es un BPE a nivel de byte con conciencia de dígitos, con un vocabulario de 8.192 tokens, diseñado para manejar números de forma más eficiente.

El entrenamiento consistió en un fine-tuning completo sobre el dataset HuggingFaceTB/smol-smoltalk, que contiene conversaciones sintéticas de alta calidad. La pérdida se calculó únicamente sobre los tokens de asistente y el token EOS, lo que permite que el modelo aprenda a generar respuestas apropiadas sin penalizar los tokens del usuario. No se menciona el uso de RLHF ni DPO; el ajuste es puramente supervisado. El modelo soporta system prompts, conversaciones multi-turno y generación con caché KV.

## Capacidades

- Generación de texto conversacional: responde a instrucciones y preguntas en formato chat, con soporte para system prompts y múltiples turnos.
- Razonamiento básico: puede realizar tareas simples de lógica y comprensión, aunque con limitaciones propias de su tamaño.
- Generación de código simple: capaz de producir fragmentos de código cortos para tareas elementales, aunque sin garantía de corrección sintáctica avanzada.
- Procesamiento de números: el tokenizador con conciencia de dígitos mejora el manejo de valores numéricos en comparación con tokenizadores estándar.
- Multi-turno con caché KV: permite mantener el estado de la conversación sin recalcular el contexto completo.
- Ejecución en CPU y GPU: al ser un modelo muy pequeño, puede ejecutarse en hardware modesto, incluso en tiempo real.

## Casos de uso

- Chatbots educativos: el modelo puede servir como asistente conversacional en aplicaciones de aprendizaje, respondiendo preguntas sencillas sobre conceptos básicos. Su tamaño permite integrarlo en aplicaciones móviles o web sin necesidad de servidores potentes.
- Prototipado rápido de interfaces conversacionales: los desarrolladores pueden usar este modelo para validar flujos de diálogo y UX antes de migrar a modelos más grandes. Su baja latencia facilita iteraciones ágiles.
- Generación de texto corto en entornos embebidos: ideal para dispositivos IoT o sistemas con poca memoria, donde se necesite generar respuestas breves o completar plantillas.
- Asistente de documentación técnica: puede ayudar a redactar descripciones cortas, resúmenes o respuestas a preguntas frecuentes en dominios acotados, siempre que se le proporcione contexto suficiente.
- Entrenamiento y experimentación académica: sirve como modelo de juguete para estudiar técnicas de fine-tuning, tokenización o arquitecturas eficientes, sin requerir grandes recursos computacionales.
- Generación de datos sintéticos: puede utilizarse para crear ejemplos de conversación o texto breve que alimenten pipelines de aumento de datos, aunque con supervisión humana para garantizar calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una gráfica de curva ELO, pero no se proporcionan valores numéricos ni comparaciones con otros modelos. Por tanto, no es posible evaluar cuantitativamente su rendimiento en tareas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: al tener 8,9 millones de parámetros, el modelo ocupa aproximadamente 35 MB en float32 y unos 18 MB en bfloat16. Cabe en cualquier GPU con al menos 1 GB de VRAM, y también en CPU con RAM estándar.
- GPU recomendadas: cualquier GPU moderna, incluyendo NVIDIA GTX 1650, RTX 3060, o incluso GPUs integradas. No requiere hardware especializado.
- Ejecución en CPU: viable con baja latencia (del orden de milisegundos por token) en procesadores modernos.
- Opciones de despliegue: al usar código personalizado, se debe cargar con `trust_remote_code=True` en Transformers. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, por lo que el despliegue se limita al pipeline estándar de Hugging Face.
- Latencia y throughput: no se proporcionan datos oficiales, pero por el tamaño del modelo se espera una generación rápida incluso en CPU.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa rigurosa con otros modelos de tamaño similar. Aunque existen alternativas como SmolLM2-135M o TinyLlama-1.1B, no se han encontrado datos de rendimiento comparables en la información proporcionada. La comparativa estructural sería:

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| DynamicMind-Mini-Instruct | 8,9M | 1.024 | Apache 2.0 | safetensors |
| SmolLM2-135M | 135M | 2.048 | Apache 2.0 | safetensors |
| TinyLlama-1.1B | 1.100M | 2.048 | Apache 2.0 | safetensors |

DynamicMind-Mini-Instruct es significativamente más pequeño, lo que lo hace más eficiente pero también menos capaz. No se dispone de datos de rendimiento para comparar.

## Limitaciones y advertencias

- Tamaño muy reducido: con solo 8,9 millones de parámetros, el modelo tiene una capacidad limitada de razonamiento, conocimiento factual y coherencia en textos largos. Es probable que genere respuestas incorrectas o sin sentido en tareas complejas.
- Contexto corto: la ventana de 1.024 tokens restringe la cantidad de información que puede procesar en una sola conversación, lo que limita su uso en tareas que requieren contexto extenso.
- Alucinaciones: como cualquier modelo generativo, puede inventar información, especialmente en dominios especializados. Se recomienda supervisión humana en aplicaciones críticas.
- Idiomas no especificados: no se indica qué idiomas soporta, aunque al estar entrenado en smol-smoltalk (principalmente inglés) es probable que su rendimiento en otros idiomas sea deficiente.
- Dependencia de código personalizado: requiere `trust_remote_code=True`, lo que implica ejecutar código arbitrario del repositorio. Esto puede suponer un riesgo de seguridad si no se audita el código.
- Sin cuantizaciones oficiales: no se proporcionan versiones cuantizadas, por lo que el despliegue en hardware muy limitado puede requerir conversión manual.
- Sin benchmarks publicados: la ausencia de métricas numéricas dificulta evaluar su rendimiento real y compararlo con alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sonic-coder/DynamicMind-Mini-Instruct
- Modelo base DynamicMind-Mini: https://huggingface.co/DedeProGames/DynamicMind-Mini
- Página del modelo base en Hugging Face: https://huggingface.co/DedeProGames/DynamicMind-Mini-Instruct
- Visualización de arquitectura: https://hfviewer.com/DedeProGames/DynamicMind-Mini-Instruct
- Visualización de arquitectura del base: https://hfviewer.com/DedeProGames/DynamicMind-Mini
- Ficha en LLM Explorer: https://llm-explorer.com/model/DedeProGames%2FDynamicMind-Mini,4YDaJQQHxvHP1IiLXsWmpT
