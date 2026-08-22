# Kanha-AI/kanha-kanha.ai-1.7b-full-quality

## Resumen

Kanha-AI/kanha-kanha.ai-1.7b-full-quality es un fine-tuning completo (full fine-tuning) del modelo Qwen/Qwen3-1.7B, desarrollado por Kanha-AI como parte de su plataforma de creación de chatbots personalizados. El objetivo del proyecto es entrenar modelos compactos a partir del contenido de un sitio web concreto, generando pares de pregunta-respuesta sobre ese contenido y afinando un modelo base para que responda preguntas sobre el sitio. Este checkpoint concreto es un experimento de investigación para comparar métodos de entrenamiento sobre un dataset derivado de la web de kanha.ai.

El modelo se publica con pesos en bfloat16, tiene 1.720.574.976 parámetros y una ventana de entrenamiento de 2048 tokens. La relevancia actual del proyecto radica en su enfoque de despliegue on-device: Kanha-AI proporciona un SDK que permite ejecutar estos chatbots directamente en el navegador del cliente mediante WebGPU, evitando llamadas a servidores remotos y reduciendo costes operativos. Aunque el checkpoint es pequeño (1.7B), está pensado para entornos de inferencia local y evaluaciones controladas de question answering sobre sitios web.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen/Qwen3-1.7B) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 (secuencia máxima de entrenamiento); el modelo base soporta 32K |
| Tipos de cuantizacion | bfloat16 (pesos originales), MLC q4f16_1 (artefactos disponibles) |
| Idiomas soportados | en |
| Licencia | no disponible (el modelo base Qwen3-1.7B usa Apache 2.0) |
| Formato de pesos | safetensors (bfloat16), artefactos MLC |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo (full fine-tuning) del Qwen3-1.7B, que es un transformer decoder-only con 28 capas y atención estándar. El entrenamiento se realizó sobre un dataset de 128 registros de entrenamiento y 24 de validación, derivado del contenido de la web de kanha.ai, con una longitud máxima de secuencia de 2048 tokens. Se usaron 20 épocas, una tasa de aprendizaje de 5e-05, batch size por dispositivo de 4, acumulación de gradientes de 2, y un warmup del 10%. La pérdida se aplicó solo a las respuestas del asistente (assistant-only loss), lo que indica un entrenamiento supervisado de tipo instruct/chat.

No hay innovación técnica destacable en la arquitectura: se trata de un fine-tuning estándar de un modelo base existente. El interés principal es el pipeline de Kanha-AI: crawl de páginas web, generación automática de pares pregunta-respuesta, fine-tuning de un modelo compacto y despliegue on-device mediante WebGPU. El checkpoint se publica con artefactos MLC (q4f16_1) para facilitar la ejecución en navegadores y entornos de baja capacidad.

## Capacidades

- Generación de texto conversacional y respuesta a preguntas sobre el contenido del sitio web de kanha.ai.
- Capacidad de question answering con extracción de datos concretos (fechas, URLs, números) según las métricas de evaluación del autor.
- Ejecución on-device en navegador mediante WebGPU (a través de artefactos MLC y el SDK de Kanha).
- Soporte de tool calling no documentado específicamente en este checkpoint, aunque el modelo base Qwen3-1.7B sí incluye capacidades de function calling y agentic reasoning.
- Multilingüismo limitado: el modelo solo declara soporte de inglés (en), aunque el base Qwen3-1.7B es multilingüe con mayor cobertura.

## Casos de uso

- Chatbot de atención al cliente embebido en una página web: el modelo puede responder preguntas frecuentes sobre el contenido de un sitio, cargándose directamente en el navegador del usuario sin servidor intermedio, reduciendo latencia y costes de API.
- Asistente de documentación técnica: integrarlo en una web de documentación para que los usuarios consulten el contenido de forma conversacional, con respuestas basadas en el material indexado.
- Evaluación de métodos de fine-tuning: el checkpoint sirve como referencia para comparar estrategias de entrenamiento (full vs. LoRA, etc.) sobre el mismo dataset de QA de sitio web.
- Prototipado rápido de chatbots on-device: en entornos de desarrollo sin GPU dedicada, se puede ejecutar en el navegador con WebGPU para validar el flujo de conversación antes de escalar.
- Extracción de datos estructurados de contenido web: el modelo muestra recall alto en URLs y fechas (1.0 y 1.0 respectivamente), útil para tareas de extracción de metadatos de páginas.
- Experimentos de investigación sobre memorización y precisión en modelos pequeños: el dataset es pequeño y controlado, lo que permite estudiar el comportamiento de alucinación y sobreajuste en modelos de 1.7B.

## Benchmarks y rendimiento

La model card del autor proporciona métricas de evaluación propias (no benchmarks estándar como MMLU o HumanEval). Los resultados sobre el conjunto de validación (26 muestras) son:

| Metrica | Valor |
|---|---|
| dates_recall | 1.0 |
| deterministic_pass_rate | 0.0769 |
| list_recall | 0.2135 |
| numbers_recall | 0.8583 |
| refusal_rate | 0.0 |
| unsupported_value_rate | 0.2308 |
| urls_recall | 1.0 |

Estos valores indican que el modelo responde bien a preguntas sobre fechas y URLs, pero tiene una tasa de pase determinista muy baja (7.7%) y un recall de listas limitado (21.3%). El autor advierte que la evaluación determinista no es una calificación de navegador y que se debe validar el modelo convertido en el entorno objetivo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3.5 GB en bfloat16 (pesos del modelo), ~1 GB con cuantización q4f16_1 (MLC).
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 4090) para inferencia local; también es posible ejecutarlo en CPU con llama.cpp (aunque no se proporcionan artefactos GGUF).
- Es apto para despliegue en navegador mediante WebGPU, gracias a los artefactos MLC incluidos en el repositorio.
- Opciones de despliegue: transformers (Python), MLC (para navegador y dispositivos), y potencialmente vLLM para inferencia servida (aunque el tamaño pequeño no requiere optimización especial).
- Latencia y throughput estimados: no disponibles en la información proporcionada; depende del hardware y de la cuantización. En un navegador con WebGPU, la latencia esperada es de unos pocos cientos de milisegundos por token en GPU integrada, pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Kanha-AI/kanha-kanha.ai-1.7b-full-quality | 1.72B | 2048 (train) / 32K (base) | no disponible | Fine-tuning de QA sobre sitio web |
| Qwen/Qwen3-1.7B | 1.72B | 32K | Apache 2.0 | Modelo base generalista, chat y agentic |
| Llama-3.2-1B | 1.24B | 128K | Llama 3.2 Community License | Generalista, eficiente para edge |

No hay datos de benchmarks estándar (MMLU, HumanEval) para el modelo de Kanha, por lo que no se puede comparar cuantitativamente con alternativas. La comparación se limita a características de arquitectura y licencia. El modelo de Kanha es un fine-tuning del Qwen3-1.7B, por lo que hereda sus capacidades base, pero con un dataset específico y una ventana de entrenamiento reducida.

## Limitaciones y advertencias

- Sesgos y alucinación: el modelo puede producir respuestas incorrectas, incompletas o desactualizadas, según advierte el autor. El conjunto de entrenamiento es muy pequeño (128 registros), lo que aumenta el riesgo de memorización y de respuestas incorrectas ante preguntas fuera del dominio.
- Riesgo de sobreajuste: la tasa de pase determinista es solo del 7.7%, lo que sugiere que el modelo no generaliza bien fuera de los casos exactos del dataset.
- Contexto limitado: la ventana de entrenamiento es de 2048 tokens, inferior a la del modelo base (32K), lo que limita la capacidad de manejar conversaciones largas o documentos extensos.
- Idioma: solo se declara inglés; no se ha evaluado en otros idiomas.
- Licencia: no se especifica una licencia para el modelo fine-tuneado, lo que genera incertidumbre para uso comercial. El modelo base usa Apache 2.0, pero el checkpoint derivado no tiene licencia explícita.
- Riesgo de contenido desactualizado: al estar entrenado sobre un snapshot del sitio web, las respuestas pueden quedar obsoletas si el contenido original cambia.
- Validación en producción: el autor recomienda validar el modelo en el entorno objetivo (navegador/dispositivo) antes de cualquier uso en producción, ya que la evaluación del servidor no es suficiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kanha-AI/kanha-kanha.ai-1.7b-full-quality
- Organización Kanha-AI en Hugging Face: https://huggingface.co/Kanha-AI
- Repositorio GitHub de Kanha-AI: https://github.com/Kanha-AI/Kanha-AI
- Sitio web de Kanha AI: https://kanha.ai
- Producto Kanha AI (voice companion): https://kanhaji.ai
- Modelo base Qwen/Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
