# salvogameryt1/OpenHermes

## Resumen

OpenHermes es un modelo de lenguaje finetuneado y convertido a formato GGUF mediante Unsloth, basado en el modelo base Qwen2.5-7B-Instruct de Alibaba. El autor, salvogameryt1, ha publicado este modelo en HuggingFace con el objetivo de facilitar su despliegue en entornos de inferencia locales mediante llama.cpp y Ollama, incluyendo un archivo Modelfile para este último.

El modelo conserva la arquitectura transformer de Qwen2.5, con aproximadamente 7.615 millones de parámetros, y ofrece una ventana de contexto de hasta 32.768 tokens, característica heredada de su modelo base. Su relevancia radica en que proporciona una versión cuantizada (Q4_K_M) lista para usar en CPU o GPU de consumo, sin necesidad de conversiones adicionales, lo que lo convierte en una opción práctica para desarrolladores que buscan desplegar un asistente conversacional local con capacidades de razonamiento y generación de código.

Aunque la model card no especifica detalles sobre el dataset de fine-tune ni la licencia, la referencia al nombre "OpenHermes" sugiere una posible conexión con la serie de modelos OpenHermes de Teknium, aunque no hay evidencia directa en la información proporcionada. El modelo está orientado a tareas conversacionales y su integración con llama.cpp lo hace compatible con el estándar de inferencia local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2.5) |
| Parametros totales | 7.615.616.512 (7,6 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 32.768 tokens (heredado de Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | Q4_K_M (unico archivo GGUF incluido) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo está construido sobre la arquitectura de Qwen2.5-7B-Instruct, un transformer decoder-only con normalización RMSNorm y atención de multi-cabeza. El proceso de finetune se realizó con la biblioteca Unsloth, que optimiza el entrenamiento mediante técnicas de cuantización y kernels eficientes, permitiendo un ajuste fino más rápido y con menor consumo de memoria. Posteriormente, el modelo fue convertido al formato GGUF, que es el formato nativo de llama.cpp para inferencia en CPU y GPU.

No se dispone de información detallada sobre el dataset de entrenamiento específico de este fine-tune, ni sobre el número de tokens de entrenamiento o el uso de técnicas de RLHF o DPO. La model card solo menciona que fue finetuneado con Unsloth, sin especificar los datos utilizados. Dado el nombre "OpenHermes", podría estar relacionado con el dataset OpenHermes de Teknium, pero no hay confirmación en la información proporcionada.

## Capacidades

- Generación de texto conversacional: el modelo está orientado a tareas de chat y diálogo multi-turno, heredando las capacidades instructivas de Qwen2.5-7B-Instruct.
- Razonamiento y conocimiento general: al ser un fine-tune de Qwen2.5-7B-Instruct, conserva capacidades de razonamiento lógico y conocimiento factual de su modelo base.
- Generación de código: Qwen2.5-7B-Instruct tiene habilidades de programación moderadas, que se mantienen en esta variante.
- Soporte de tool calling: Qwen2.5-7B-Instruct soporta function calling; se espera que este fine-tune lo conserve, aunque no se menciona explícitamente en la model card.
- Multilingüe: Qwen2.5-7B-Instruct soporta múltiples idiomas, incluyendo inglés, chino y otros, pero la lista exacta no se especifica en la información disponible.
- Integración con llama.cpp y Ollama: incluye un Modelfile para Ollama, facilitando el despliegue en estos entornos.

## Casos de uso

- Chatbot local para asistencia personal: el modelo GGUF puede ejecutarse en una máquina con CPU o GPU modesta mediante llama.cpp u Ollama, permitiendo un asistente conversacional privado sin dependencia de APIs externas.
- Desarrollo de prototipos de agentes conversacionales: al soportar tool calling (presumiblemente), puede integrarse en pipelines de agentes que necesiten llamar funciones o APIs, probando flujos de razonamiento multi-paso en un entorno local.
- Generación de código asistida en entornos sin conexión: desarrolladores pueden usar este modelo para completar código o explicar fragmentos en entornos aislados, donde no se permite acceso a la nube.
- Educación y experimentación: estudiantes e investigadores pueden usar este modelo para aprender sobre fine-tuning y despliegue de LLMs, gracias a su formato GGUF listo para usar.
- Integración en aplicaciones de escritorio: mediante llama.cpp, se puede incrustar en aplicaciones de escritorio para funciones de autocompletado, resumen o análisis de texto, sin costes de API.
- Evaluación de modelos cuantizados: útil para comparar el rendimiento de un fine-tune cuantizado frente al modelo base Qwen2.5-7B-Instruct en tareas específicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones. Tampoco se encuentran resultados en la búsqueda web asociada a este modelo concreto. Se recomienda al usuario ejecutar sus propias evaluaciones si necesita datos de rendimiento.

## Requisitos de hardware

- VRAM estimada: el archivo Q4_K_M pesa aproximadamente 4,9 GB (tamaño del repositorio). Para inferencia con llama.cpp, se requiere al menos 5 GB de VRAM si se usa GPU, o memoria RAM equivalente si se ejecuta en CPU.
- GPU recomendadas: una GPU con 6 GB de VRAM o más, como NVIDIA GTX 1660 Ti, RTX 2060, RTX 3060, o superiores (RTX 4090, A100) para mejor rendimiento. En CPU, un procesador moderno con 16 GB de RAM es suficiente para inferencia a baja velocidad.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de consumo de gama media con 8 GB o más, como RTX 3060 o RTX 4060.
- Opciones de despliegue: llama.cpp (incluye el comando `llama-cli`), Ollama (con el Modelfile incluido), y cualquier framework compatible con GGUF como llama-cpp-python.
- Latencia y throughput: no disponible. Depende del hardware y la configuración de llama.cpp. Para un modelo de 7B cuantizado Q4_K_M, se espera una velocidad de generación de 20-40 tokens/s en GPU de gama alta y 5-15 tokens/s en CPU moderna.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| salvogameryt1/OpenHermes | 7,6 B | 32k | no disponible | GGUF | Fine-tune de Qwen2.5-7B-Instruct, cuantizado Q4_K_M |
| Qwen2.5-7B-Instruct (original) | 7,6 B | 32k | Apache 2.0 | safetensors, GGUF | Modelo base, disponible en múltiples cuantizaciones |
| OpenHermes-2-Mistral-7B (Teknium) | 7 B | 8k | Apache 2.0 | safetensors | Fine-tune de Mistral-7B, entrenado en dataset OpenHermes |

La comparación se basa en el modelo base y la familia OpenHermes. El modelo de salvogameryt1 es un fine-tune de Qwen2.5, mientras que OpenHermes-2-Mistral-7B de Teknium es un fine-tune de Mistral-7B. No hay datos de rendimiento para comparar directamente.

## Limitaciones y advertencias

- Licencia no especificada: la model card no indica la licencia, lo que impide conocer las restricciones de uso comercial. Se recomienda contactar con el autor antes de usar el modelo en entornos productivos.
- Sin información sobre sesgos: no se han documentado sesgos específicos, pero al ser un fine-tune de un modelo base, puede heredar sesgos de Qwen2.5, que incluyen sesgos culturales y de género.
- Riesgo de alucinación: como cualquier LLM, puede generar información falsa o inventada, especialmente en temas de conocimiento especializado.
- Limitaciones de idioma: aunque Qwen2.5 soporta varios idiomas, no se especifica cuáles son los que este fine-tune ha optimizado. El rendimiento en idiomas distintos del inglés o chino puede ser inferior.
- Contexto limitado a 32k tokens: aunque es amplio, no es suficiente para documentos muy largos; se recomienda truncar o dividir el texto.
- Formato único: solo se proporciona el archivo Q4_K_M, lo que limita las opciones de cuantización para diferentes hardware. Si se necesita otra cuantización, se debe convertir manualmente.
- Sin garantías de calidad: el modelo no ha sido evaluado públicamente con benchmarks, por lo que su rendimiento real en tareas específicas es desconocido.

## Enlaces

- HuggingFace: https://huggingface.co/salvogameryt1/OpenHermes
- Unsloth: https://github.com/unslothai/unsloth
- Dataset OpenHermes de Teknium: https://huggingface.co/datasets/teknium/openhermes
- Colección Open Hermes de Teknium: https://huggingface.co/collections/teknium/open-hermes-652ff011fcb6dd376c337c39
- Página de OpenHermes en llmmodels.org: https://llmmodels.org/tools/openhermes/
