# dr-housemd/Gemma-4-Gembrain-X-Core-31B-exl3-3.5bpw

## Resumen

Gemma-4-Gembrain-X-Core-31B-exl3-3.5bpw es un modelo de lenguaje basado en un merge de 18 modelos derivados de Gemma 4 31B it de Google, realizado con mergekit. El autor, dr-housemd, combina pesos de modelos especializados en razonamiento, roleplay, escritura creativa, generación de prompts de imagen y conversación general, con un enfoque declarado como "uncensored" y "nsfw". El resultado es un modelo de propósito general con sesgo hacia tareas creativas y de interacción, distribuido en formato ExLlama v3 con cuantización de 3.5 bits por peso (3.5bpw), lo que reduce el tamaño del repositorio a 17.9 GB.

La relevancia de este modelo radica en su naturaleza de merge: permite obtener un único checkpoint que aglutina las fortalezas de múltiples especializaciones sin necesidad de entrenamiento adicional. Está pensado para usuarios que ejecutan inferencia local con GPUs de gama alta o media-alta, y que buscan un modelo versátil para tareas de generación de texto, roleplay y creatividad, con licencia Apache 2.0 que permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4 31B, denso) |
| Parametros totales | 31B (modelo original); 8.926.826.092 en el archivo safetensors cuantizado |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | exl3 3.5bpw (ExLlama v3) |
| Idiomas soportados | no disponible (Gemma 4 base soporta multiples idiomas, pero no se especifica en este merge) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (cuantizado para ExLlama v3) |

## Arquitectura y entrenamiento

El modelo es un merge de 18 checkpoints, todos basados en `google/gemma-4-31B-it`. Los modelos base incluyen especializaciones como `BirdToast/Gemma-4-31B-glimmer-rp-v0.1` (roleplay), `sophosympatheia/Glistening-Gem-31B-v1.0` (creatividad), `llmfan46/G4-MeroMero-31B-uncensored-heretic` (sin censura), `nbeerbower/Gemma4-Gutenberg-31B` (estilo literario), `bgg1996/Melinoe-Gemma4-31B-VL` (vision-language), entre otros. El proceso de fusión se realizó con mergekit, una herramienta que combina pesos mediante técnicas como SLERP, ties o task arithmetic, aunque el método exacto no se documenta en la model card.

Al ser un merge, no hay un entrenamiento adicional sobre el conjunto de modelos base; la fusión de pesos busca conservar las capacidades de cada especialización en un único conjunto de parámetros. La arquitectura subyacente es la de Gemma 4 31B, un transformer denso con atención causal estándar. No se proporcionan detalles sobre el dataset de entrenamiento original de Gemma 4 ni sobre el proceso de alineación (RLHF/DPO) de los modelos base.

## Capacidades

- Generación de texto general y conversacional, con especial énfasis en roleplay y diálogos multi-turno.
- Escritura creativa: narrativa, poesía, guiones y prosa literaria, gracias a la inclusión de modelos como Gutenberg y Ortenzya.
- Generación de prompts para modelos de imagen (tag `image-prompt-generation`), útil para crear descripciones detalladas y estilizadas.
- Razonamiento y resolución de problemas, heredado del modelo base Gemma 4 31B it y de merges como Equinox y GarnetV2.
- Capacidades de visión-language parciales (por el modelo Melinoe-Gemma4-31B-VL), aunque no se especifica si el merge conserva la entrada multimodal completa.
- Comportamiento "uncensored" y "nsfw": el modelo no aplica filtros de contenido explícito, lo que permite generar texto para adultos sin restricciones.
- Soporte de tool calling y function calling: no se menciona explícitamente, pero Gemma 4 it soporta estas funciones; no hay confirmación de que el merge las conserve.

## Casos de uso

- Roleplay y juegos de texto: el modelo puede mantener personajes coherentes y diálogos inmersivos durante largas sesiones, gracias a la fusión de modelos especializados en roleplay como glimmer-rp y Monika.
- Escritura creativa asistida: redacción de relatos, novelas o poesía con un estilo literario refinado, aprovechando la influencia de Gutenberg y Ortenzya.
- Generación de prompts para IA de imagen: crear descripciones detalladas y artísticas para herramientas como Stable Diffusion o Midjourney, usando la capacidad específica de image-prompt-generation.
- Chatbots sin censura para adultos: aplicaciones de entretenimiento o ficción erótica, donde el modelo no impone restricciones de contenido.
- Prototipado rápido de asistentes conversacionales: al ser un modelo de propósito general con licencia Apache 2.0, se puede integrar en demos o productos comerciales sin coste de licencia.
- Experimentación en investigación: estudiar el comportamiento de merges de modelos grandes y su rendimiento en tareas creativas frente al modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al ser un merge, el rendimiento puede variar respecto al modelo base Gemma 4 31B it, pero no hay datos cuantitativos (MMLU, HumanEval, GSM8K, etc.) en la model card ni en los metadatos.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 17.9 GB, por lo que se necesita al menos 20 GB de VRAM para cargar los pesos con overhead de inferencia. Con cuantización 3.5bpw, la memoria requerida es de aproximadamente 18-20 GB.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), RTX 3090 (24 GB), A100 40GB, A6000 (48 GB) o superiores. GPUs con menos de 16 GB no son viables.
- En consumer GPU: cabe en RTX 4090 y RTX 3090 con 24 GB, pero no en GPUs de 16 GB como RTX 4080 o 3080 Ti.
- Opciones de despliegue: al ser formato ExLlama v3, se puede usar con ExLlamaV2 (o ExLlama v3 si está disponible), así como con servidores que soporten este formato (por ejemplo, text-generation-webui con backend ExLlama). No es compatible directamente con llama.cpp u Ollama, que usan GGUF.
- Latencia y throughput: no se proporcionan datos; dependerá de la GPU y del tamaño de contexto. En una RTX 4090, se espera una velocidad de generación de 20-40 tokens/s para un modelo de 31B cuantizado, aunque es una estimación no confirmada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Gemma-4-Gembrain-X-Core-31B (este) | 31B | no disponible | Apache 2.0 | exl3 3.5bpw | Merge de 18 modelos, uncensored, creativo |
| google/gemma-4-31B-it | 31B | no disponible (típicamente 8K-32K) | Gemma license | safetensors | Modelo base, con alineación estándar |
| BirdToast/Gemma-4-31B-glimmer-rp-v0.1 | 31B | no disponible | Apache 2.0 | safetensors | Especializado en roleplay |
| sophosympatheia/Glistening-Gem-31B-v1.0 | 31B | no disponible | Apache 2.0 | safetensors | Especializado en creatividad |

La comparativa directa con otros merges de Gemma 4 31B es limitada por falta de datos públicos. Este modelo se distingue por su amplitud de especializaciones y su licencia permisiva.

## Limitaciones y advertencias

- Comportamiento "uncensored" y "nsfw": el modelo puede generar contenido explícito, violento o inapropiado. No es adecuado para aplicaciones que requieran moderación de contenido.
- Riesgo de alucinación: como cualquier LLM, puede inventar hechos, citas o referencias, especialmente en tareas de razonamiento factual.
- Sesgos no documentados: al ser un merge de modelos con diferentes sesgos, no se ha evaluado su comportamiento en cuanto a sesgos de género, raza o ideología.
- Inconsistencia potencial: los merges pueden producir comportamientos impredecibles en algunos contextos, especialmente cuando los modelos base tienen estilos muy diferentes.
- Longitud de contexto no especificada: se desconoce el límite real de contexto tras la fusión; puede ser inferior al del modelo base.
- Formato propietario: el uso de ExLlama v3 limita la portabilidad; no es compatible con herramientas populares como llama.cpp u Ollama.
- Fecha de creación futura (2026): el modelo fue publicado con fecha 2026-08-15, lo que sugiere que puede ser parte de un experimento o una versión preliminar; no hay garantía de mantenimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dr-housemd/Gemma-4-Gembrain-X-Core-31B-exl3-3.5bpw
- Modelo base principal: https://huggingface.co/google/gemma-4-31B-it
- Otros modelos base relevantes (selección):
  - https://huggingface.co/BirdToast/Gemma-4-31B-glimmer-rp-v0.1
  - https://huggingface.co/sophosympatheia/Glistening-Gem-31B-v1.0
  - https://huggingface.co/llmfan46/G4-MeroMero-31B-uncensored-heretic
  - https://huggingface.co/nbeerbower/Gemma4-Gutenberg-31B
- Herramienta de merge: https://github.com/arcee-ai/mergekit
