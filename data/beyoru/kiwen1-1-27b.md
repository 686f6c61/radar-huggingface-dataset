# beyoru/Kiwen1.1-27B

## Resumen

Kiwen1.1-27B es un modelo de lenguaje de 27 mil millones de parámetros desarrollado por el usuario independiente beyoru, publicado en HuggingFace bajo licencia Apache 2.0. Se trata de un ajuste fino (fine-tune) del modelo base Qwen/Qwen3.8-27B, realizado con la técnica QLoRA, que hereda las capacidades de razonamiento y uso agéntico de la familia Qwen. El modelo está orientado a tareas de razonamiento complejo, interacción conversacional y ejecución de agentes, con soporte específico para inglés y vietnamita.

La relevancia de este modelo radica en su tamaño compacto (27B parámetros densos) frente a arquitecturas MoE de cientos de miles de millones de parámetros. Según la información disponible, la familia Qwen3.x de 27B ha demostrado rendimiento competitivo en tareas de código y razonamiento, lo que permite desplegar capacidades de nivel flagship en hardware más accesible. Kiwen1.1-27B hereda esta base y añade un ajuste específico para razonamiento largo y eficiente, con tags que indican soporte para agentes y conversación.

El acceso al modelo está restringido (gated) en HuggingFace, por lo que los usuarios deben aceptar las condiciones de uso antes de descargarlo. La licencia Apache-2.0 permite uso comercial y modificación, siempre que se mantenga la atribución correspondiente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3.8-27B) |
| Parametros totales | 27.27 mil millones (estimado, no confirmado) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (existen versiones GGUF de la variante Kiwen-27B-i1) |
| Idiomas soportados | ingles, vietnamita |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

Kiwen1.1-27B se basa en la arquitectura Transformer densa de Qwen3.8-27B, un modelo de 27 mil millones de parametros sin mezcla de expertos (MoE). El entrenamiento se realizo mediante fine-tuning con QLoRA, una tecnica que permite adaptar modelos grandes con un uso reducido de VRAM mediante cuantizacion de los pesos base y entrenamiento de adaptadores de bajo rango. Los tags del modelo indican que el fine-tuning se enfoco en capacidades de razonamiento (reasoning), uso agéntico (agentic) y conversación, con soporte adicional para entrada de imagen-texto (image-text-to-text), aunque no se especifica si el modelo final conserva esta capacidad multimodal en la inferencia.

El dataset de entrenamiento no esta documentado en la informacion disponible. Se sabe que el modelo base, Qwen3.8-27B, pertenece a la linea Qwen3 que fue entrenada con una combinacion de datos de texto, codigo y matematicas, con un enfoque en razonamiento largo y eficiencia computacional. El ajuste de Kiwen1.1-27B parece estar orientado a mejorar el rendimiento en tareas de razonamiento largo (long-reasoning) y eficiencia, como sugieren los tags de la variante Kiwen-27B-i1 (legal, coding, math, stem, kimi-k3). No se dispone de informacion sobre el uso de RLHF o DPO en este modelo especifico.

## Capacidades

- Generacion de texto y conversacion multilingue (ingles y vietnamita).
- Razonamiento complejo y multi-step, con soporte para modos de pensamiento extendido (long-reasoning).
- Uso agentico: capacidad para integrarse en pipelines de agentes que requieren tool calling y ejecucion de acciones en multiples pasos.
- Generacion de codigo y soporte para tareas de programacion, herencia de la base Qwen3.
- Procesamiento de entrada multimodal (imagen-texto) segun los tags, aunque la ficha de HuggingFace no detalla el alcance de esta capacidad en el modelo final.
- Conversacion con memoria de contexto largo (segun la variante i1 que soporta long-context, aunque no se confirma para Kiwen1.1-27B).
- Compatibilidad con el ecosistema transformers de HuggingFace para integracion en pipelines de generacion.

## Casos de uso

- Atencion al cliente en vietnamita e ingles: el modelo puede gestionar conversaciones multi-turno en ambos idiomas, manteniendo coherencia en dialogos largos y resolviendo consultas complejas con razonamiento paso a paso. Su licencia Apache-2.0 permite su despliegue en produccion comercial sin royalties.
- Agente de codigo autónomo: al heredar las capacidades de Qwen3.6-27B (que ha demostrado rendimiento competitivo en benchmarks de coding frente a modelos MoE de 397B), puede integrarse en pipelines de CI/CD para generar, revisar y corregir codigo de forma automatica.
- Asistente de razonamiento legal: los tags de la variante i1 incluyen "legal" y "kimi-k3", lo que sugiere que el modelo puede ser util para analizar documentos legales y extraer argumentos logicos en vietnam o ingles.
- Chatbot educativo: con soporte de razonamiento matematico y cientifico (STEM), puede actuar como tutor en asignaturas de ciencias, explicando conceptos y resolviendo problemas paso a paso.
- Analisis de documentos con imagen-texto: si se confirma la capacidad multimodal, podria procesar capturas de pantalla o diagramas para extraer informacion y responder preguntas sobre el contenido visual.
- Herramienta de investigacion academica: para generacion de resumenes, revision de literatura y asistencia en redaccion tecnica en ingles, aprovechando su capacidad de razonamiento largo y generacion coherente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para Kiwen1.1-27B en la informacion disponible. El modelo base, Qwen3.6-27B, ha sido reportado en blogs como "superando a un MoE de 397B en tareas de coding" y con capacidad de ejecucion en una GPU de 24GB, pero estos datos no pueden atribuirse directamente a Kiwen1.1-27B sin una evaluacion independiente.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (BF16): aproximadamente 54.8 GB segun LLM Explorer, lo que requiere GPU profesional como A100 40GB o H100 80GB.
- Con cuantizacion a 4-bit (GPTQ/AWQ) o 8-bit, es posible ejecutar el modelo en GPUs consumer de 24GB (RTX 4090, RTX 3090) o incluso 16GB (RTX 4080) con cuantizacion agresiva.
- Para despliegue en produccion, se recomienda vLLM o TensorRT-LLM con soporte de batching y alta concurrencia. Para entornos locales, llama.cpp o Ollama pueden servir con pesos GGUF (existen versiones de la variante i1).
- La latencia estimada en una RTX 4090 con cuantizacion 8-bit es de alrededor de 20-40 tokens/segundo para generacion, aunque no hay datos oficiales.
- El modelo puede ejecutarse en CPU con cuantizacion 4-bit, pero con latencia alta (1-5 tokens/segundo).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Kiwen1.1-27B | 27B | no disponible | Apache-2.0 | Fine-tuning de Qwen3.8-27B con QLoRA, enfocado en razonamiento y agentes |
| Qwen3.8-27B (base) | 27B | no disponible | Apache-2.0 | Modelo base, sin fine-tuning especifico |
| Qwen3.6-27B | 27B | no disponible | Apache-2.0 | Modelo base previo, reportado con alto rendimiento en coding |

La comparativa directa con otros modelos de la misma categoria (p.ej., Llama 3.1 8B, Mistral 7B) no es posible sin datos de benchmarks de Kiwen1.1-27B. Los modelos de 27B de Qwen se destacan por su densidad y eficiencia frente a MoE mas grandes, pero los datos concretos de rendimiento de Kiwen1.1-27B no estan disponibles.

## Limitaciones y advertencias

- Acceso restringido en HuggingFace: es necesario aceptar los terminos y condiciones del autor antes de descargar el modelo, lo que puede dificultar la evaluacion rapida.
- Idiomas limitados: el modelo esta ajustado para ingles y vietnamita; su rendimiento en otros idiomas (español, frances, etc.) no esta documentado y puede ser inferior.
- Falta de benchmarks publicados: no hay resultados de evaluacion independientes que validen su rendimiento en tareas especificas.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar contenido falso o inventado, especialmente en temas legales o tecnicos.
- Capacidad multimodal incierta: aunque el tag "image-text-to-text" sugiere soporte de imagen, no se confirma que el fine-tuning final conserve esta capacidad de forma robusta.
- Sin informacion sobre sesgos o limitaciones de contexto: no se documenta la longitud de contexto maxima ni posibles sesgos de los datos de entrenamiento.
- No se recomienda su uso en produccion sin una evaluacion exhaustiva de sesgos y seguridad, especialmente en entornos legales o medicos.

## Enlaces

- HuggingFace: https://huggingface.co/beyoru/Kiwen1.1-27B
- Variante anterior Kiwen-27B: https://huggingface.co/beyoru/Kiwen-27B
- Version GGUF de Kiwen-27B-i1: https://huggingface.co/mradermacher/Kiwen-27B-i1-GGUF
- LLM Explorer (datos de VRAM y despliegue): https://llm-explorer.com/model/beyoru%2FKiwen-27B,3gQiWTlA8UQqjNg8lQQsdg
- Blog sobre Qwen3.6-27B (base similar): https://qwen.ai/blog?id=qwen3.6-27b
- Articulo sobre Qwen3.6-27B en Towards AI: https://pub.towardsai.net/i-tested-the-27b-open-source-model-that-crushed-a-397b-moe-on-coding-it-fits-on-one-24gb-gpu-c2d81837121c
