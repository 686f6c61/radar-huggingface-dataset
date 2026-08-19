# Quipuai/quipu-0.8b-GGUF

## Resumen

Quipu 0.8B es un modelo de lenguaje pequeño (752 millones de parámetros) desarrollado por Quipuai como un fine-tune LoRA sobre Qwen3.5-0.8B. Está diseñado específicamente para ofrecer razonamiento paso a paso, comportamiento honesto en tool-calling, identidad consistente y asistencia ligera de código, todo ello en un paquete que cabe en entornos con recursos limitados. Su distribución principal es en formato GGUF cuantizado, lo que permite ejecutarlo directamente con llama.cpp, Ollama, LM Studio y otros runtimes compatibles sin necesidad de GPU de gama alta.

La relevancia de este modelo radica en su tamaño reducido y su enfoque en tareas de razonamiento y uso de herramientas, un segmento donde normalmente se necesitan modelos de varios miles de millones de parámetros. Al ser un fine-tune de Qwen3.5-0.8B, hereda la arquitectura transformer de su base, aunque no se especifican detalles adicionales como la longitud de contexto. La licencia Apache-2.0 permite uso comercial sin restricciones, lo que lo hace atractivo para integraciones en producción donde el coste y la latencia son críticos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tune LoRA sobre Qwen3.5-0.8B) |
| Parametros totales | 752.393.024 (0,75B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_0, Q5_1, Q5_K_S, Q5_K_M, Q6_K, Q8_0, F16 |
| Idiomas soportados | Inglés, español |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

Quipu 0.8B se construye como un fine-tune con LoRA (Low-Rank Adaptation) sobre el modelo base Qwen3.5-0.8B. La arquitectura subyacente es un transformer estándar, típico de la familia Qwen, aunque la model card no detalla el número de capas, heads ni el mecanismo de atención específico. El entrenamiento se ha orientado a tres objetivos principales: razonamiento paso a paso (step-by-step reasoning), tool-calling honesto (que el modelo reconozca cuándo no puede ejecutar una herramienta) y mantenimiento de una identidad consistente durante la conversación. No se proporcionan datos sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas como RLHF o DPO. Al ser un modelo de 0,8B, el entrenamiento LoRA es ligero y permite ajustes posteriores con recursos modestos.

## Capacidades

- Generación de texto conversacional con identidad consistente.
- Razonamiento paso a paso para problemas de lógica y matemáticas simples.
- Tool-calling / function calling básico, con comportamiento honesto ante herramientas no disponibles.
- Asistencia ligera de generación y revisión de código.
- Soporte multilingüe limitado a inglés y español.
- Capacidad de procesamiento de texto e imagen (según el tag Image-Text-to-Text, aunque no se detalla el soporte multimodal real).
- Ejecución en entornos con recursos muy limitados gracias a las cuantizaciones GGUF.

## Casos de uso

- Asistente conversacional en aplicaciones móviles o web: el modelo puede mantener diálogos multi-turno con una identidad definida, ideal para chatbots de atención al cliente básica en inglés y español, sin necesidad de infraestructura GPU potente.
- Automatización de tareas simples con tool-calling: integración en pipelines que requieran llamar a APIs o funciones externas, por ejemplo, consultar el tiempo o buscar información, con la ventaja de que el modelo reconoce sus limitaciones y evita respuestas inventadas.
- Generación de código en entornos de desarrollo ligero: ayuda a programadores con fragmentos de código, explicaciones y correcciones sencillas, ejecutable en portátiles sin GPU dedicada mediante llama.cpp u Ollama.
- Educación y tutoría: explicaciones paso a paso de conceptos matemáticos o lógicos, útil para aplicaciones de aprendizaje autónomo en dispositivos de bajo coste.
- Prototipado rápido de agentes conversacionales: al ser pequeño y rápido, permite iterar sobre prompts y comportamientos sin costes elevados de inferencia.
- Procesamiento de documentos con extracción de información: aunque no se detalla, su capacidad de razonamiento permite resumir textos breves o extraer datos estructurados en tareas de baja complejidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de puntuaciones en MMLU, HumanEval, GSM8K ni otras pruebas estándar, por lo que no es posible comparar cuantitativamente su rendimiento con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización Q4_K_M (~505 MB) cabe en cualquier GPU con al menos 1 GB de VRAM, incluyendo GPUs integradas. Con Q8_0 (~600 MB) se necesita algo más de espacio, pero sigue siendo muy bajo.
- GPU recomendadas: cualquier GPU moderna, incluso las de gama de entrada como NVIDIA GTX 1650 o superiores. También funciona en CPU pura con llama.cpp, aunque con mayor latencia.
- En consumer GPU: sí, cabe sin problema en tarjetas de 4 GB o menos.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF. También se puede usar el modelo base en safetensors con transformers para fine-tuning.
- Latencia y throughput: no se proporcionan datos oficiales. Dado el tamaño, se espera una latencia baja (del orden de decenas de ms por token en GPU) y un throughput alto incluso en CPU.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa con otros modelos de tamaño similar (como Qwen2.5-0.5B, TinyLlama-1.1B o SmolLM-360M). No hay datos de benchmarks ni especificaciones detalladas de contexto. La única referencia clara es su modelo base Qwen3.5-0.8B, del que hereda arquitectura y capacidades, pero sin métricas comparables. Se recomienda consultar el modelo base para más detalles.

## Limitaciones y advertencias

- Tamaño reducido: al tener solo 0,75B parámetros, su capacidad de razonamiento complejo y generación de código avanzado es limitada en comparación con modelos de mayor escala.
- Alucinación: como cualquier LLM, puede generar información falsa o inventada, especialmente en dominios especializados.
- Longitud de contexto no especificada: se desconoce la ventana máxima de tokens, lo que puede afectar a tareas que requieran contexto largo.
- Idiomas limitados: solo inglés y español; no soporta otros idiomas de forma fiable.
- Soporte multimodal ambiguo: aunque el tag indica Image-Text-to-Text, no hay documentación clara sobre cómo funciona la entrada de imágenes; puede ser heredado del modelo base sin garantías.
- Sin benchmarks publicados: no hay evidencia cuantitativa de su rendimiento, lo que dificulta evaluar su idoneidad para tareas específicas.
- Licencia Apache-2.0: permite uso comercial, pero el usuario debe revisar las condiciones del modelo base Qwen3.5-0.8B, que podría tener restricciones adicionales.

## Enlaces

- Modelo GGUF en HuggingFace: https://huggingface.co/Quipuai/quipu-0.8b-GGUF
- Modelo base (safetensors): https://huggingface.co/Quipuai/quipu-0.8b
