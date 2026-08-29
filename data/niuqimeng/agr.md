# niuqimeng/AGR

## Resumen

AGR (Augmented Group Recommendation) es un modelo de recomendación musical para grupos, desarrollado por el usuario niuqimeng. Se trata de un modelo de lenguaje fine-tuneado a partir de [meta-llama/Meta-Llama-3-8B-Instruct](https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct) mediante un pipeline de dos fases: primero un ajuste supervisado (SFT) y posteriormente un entrenamiento con aprendizaje por refuerzo GRPO (Group Relative Policy Optimization) usando LoRA. El modelo está diseñado para resolver el problema de la recomendación de artistas a un grupo de usuarios, teniendo en cuenta tanto el historial de escucha colectivo como las preferencias individuales de cada miembro.

La innovación principal de AGR reside en su arquitectura de aumento por memoria: antes de generar una recomendación, el modelo recupera información relevante del historial de escucha de cada miembro y de los artistas comunes del grupo, incorporando este contexto en el prompt. El entrenamiento con GRPO utiliza tres funciones de recompensa: una que valida el formato de la respuesta, otra que calcula métricas de ranking (Hit@k y NDCG@k) contra la verdad fundamental, y una tercera que puntúa la calidad del razonamiento mediante la API de DeepSeek. El modelo tiene aproximadamente 8.000 millones de parámetros y un tamaño de repositorio de 16,2 GB, lo que lo sitúa en un rango desplegable en GPUs de consumo con cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Llama-3-8B) con aumento por recuperación de memoria |
| Parametros totales | ~8.000 millones (8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (hereda la ventana de Llama-3-8B, 8.192 tokens) |
| Tipos de cuantizacion | no disponible (pesos en fp16) |
| Idiomas soportados | no disponible (modelo base entrenado predominantemente en ingles) |
| Licencia | license (sin especificar; el modelo base Llama-3-8B usa licencia Llama 3 Community) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

AGR parte de Meta-Llama-3-8B-Instruct, un transformer decoder con 8.000 millones de parámetros y atención causal estándar. Sobre esta base, el autor aplica un fine-tuning en dos etapas: primero un ajuste supervisado (SFT) con datos de recomendación grupal, y después un entrenamiento con GRPO, un algoritmo de optimización por política proximal adaptado a RLHF, implementado mediante el framework ms-swift. El entrenamiento usa LoRA con rango 8 y alpha 32, aplicado a todas las capas lineales, con precisión fp16 y una tasa de aprendizaje de 5e-6.

La característica distintiva es el módulo de memoria: durante el preprocesado, un recuperador extrae de cada muestra el ID del grupo y los IDs de los miembros, consulta tres CSV con relaciones usuario-artista, metadatos de artistas y registros de etiquetado, y construye un bloque de contexto adicional con el historial de escucha de cada miembro (top-3 artistas) y los artistas comunes del grupo (top-3 con peso medio). Este bloque se anexa al prompt original antes de la generación. Las funciones de recompensa combinan validación de formato (peso 0,2), métricas de ranking Hit@k/NDCG@k (peso 0,5) y una evaluación externa del razonamiento mediante la API de DeepSeek (peso 0,3).

## Capacidades

- Recomendación de artistas para grupos: dado un grupo con historial de escucha colectivo y preferencias individuales de cada miembro, genera una lista ranking de los 10 artistas más adecuados de una lista de candidatos.
- Razonamiento multi-paso: el modelo produce una cadena de razonamiento estructurada con etiquetas `thinking`, `memory`, `reasoning` y `rec`, lo que permite auditar el proceso de decisión.
- Aumento por recuperación de memoria: integra información recuperada de una base de datos externa (historial de escucha, artistas comunes) directamente en el contexto de entrada.
- Generación de explicaciones: cada recomendación va acompañada de razones basadas en las preferencias del grupo y de los miembros individuales.
- Fine-tuning con GRPO: el entrenamiento con aprendizaje por refuerzo optimiza directamente métricas de ranking, no solo la verosimilitud del texto.
- Compatible con el ecosistema transformers: se puede cargar con la librería estándar de HuggingFace y es compatible con endpoints de inferencia.

## Casos de uso

- Plataformas de música social: servicios como Spotify o Last.fm pueden usar AGR para generar listas de reproducción conjuntas para grupos de amigos o familias, combinando el historial colectivo con las preferencias individuales de cada miembro.
- Sistemas de recomendación para eventos: organizadores de conciertos o festivales pueden emplear el modelo para sugerir artistas que satisfagan a un grupo de asistentes que planean acudir juntos, maximizando la satisfacción agregada.
- Análisis de preferencias grupales en investigación: laboratorios académicos pueden usar AGR como baseline o componente en estudios sobre recomendación grupal, gracias a su naturaleza open source y su pipeline reproducible.
- Asistentes de descubrimiento musical: integrado en un chatbot o asistente, el modelo puede recomendar nuevos artistas a un grupo explicando el razonamiento detrás de cada sugerencia, lo que aumenta la confianza del usuario.
- Personalización en plataformas de streaming: servicios con perfiles familiares o de grupo pueden usar AGR para generar recomendaciones que equilibren los gustos de todos los miembros, reduciendo la fricción en la selección conjunta de contenido.
- Evaluación de algoritmos de recomendación: el modelo puede servir como generador de recomendaciones sintéticas para comparar métricas de ranking (Hit@k, NDCG@k) contra otros enfoques, dado que su entrenamiento optimiza directamente estas métricas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper asociado (Enhancing Group Recommendation with Memory-Augmented Reasoning, disponible en Semantic Scholar) indica que el modelo supera significativamente a los métodos de última generación existentes en precisión de recomendación y explicabilidad, pero no se incluyen cifras concretas en la documentación del repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Llama-3-8B en fp16 requiere aproximadamente 16 GB de VRAM. Con cuantización a 8 bits se reduce a unos 8 GB, y a 4 bits a unos 4-5 GB.
- GPU recomendadas: para fp16, una NVIDIA RTX 4090 (24 GB), A100 (40/80 GB) o H100 (80 GB). Con cuantización, cabe en GPUs de consumo como RTX 3060 (12 GB) o RTX 4070 (12 GB).
- El autor indica que el entrenamiento requiere al menos ~16 GB de VRAM (Llama-3-8B en fp16), por lo que la inferencia con cuantización es viable en hardware de consumo.
- Opciones de despliegue: al ser un modelo transformers estándar, se puede servir con vLLM, Text Generation Inference (TGI), llama.cpp (si se convierte a GGUF) u Ollama.
- Latencia y throughput: no disponible. Dependerá del hardware y del backend de inferencia elegido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia |
|---|---|---|---|---|
| AGR (niuqimeng) | 8B | no disponible | Recomendación grupal con memoria y razonamiento | license (sin especificar) |
| Meta-Llama-3-8B-Instruct | 8B | 8.192 | Chat general e instrucciones | Llama 3 Community License |
| GPT-4o mini | ~8B (estimado) | 128.000 | Chat general multimodal | Propietaria |

AGR se distingue de su modelo base por el fine-tuning especializado en recomendación grupal y el módulo de recuperación de memoria. Frente a modelos propietarios como GPT-4o mini, AGR ofrece la ventaja de ser open source y de estar optimizado específicamente para la tarea de recomendación grupal, aunque carece de capacidades multimodales y de la amplitud de conocimiento general de los modelos comerciales.

## Limitaciones y advertencias

- Dominio limitado: el modelo está especializado en recomendación de artistas musicales y no es adecuado para tareas generales de chat o generación de texto fuera de este ámbito.
- Datos de entrenamiento restringidos: el fine-tuning se realizó sobre un conjunto de datos específico (tres CSV con relaciones usuario-artista, metadatos y etiquetas), por lo que su rendimiento fuera de este dominio de datos puede degradarse.
- Licencia no especificada: la model card indica "license" sin detallar los términos exactos. El modelo base usa la Llama 3 Community License, que permite uso comercial con ciertas condiciones, pero la licencia del fine-tuning no está clara.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar recomendaciones o razonamientos plausibles pero incorrectos, especialmente con artistas poco conocidos o datos de entrada incompletos.
- Dependencia de la API de DeepSeek: la función de recompensa `reasoning_reward` depende de una API externa, lo que introduce una dependencia de terceros en el pipeline de entrenamiento.
- Idioma: no se especifican los idiomas soportados; el modelo base está entrenado predominantemente en inglés, por lo que el rendimiento en otros idiomas puede ser limitado.
- Documentación incompleta: no se proporcionan detalles sobre la longitud de contexto efectiva tras el fine-tuning, ni sobre el número exacto de tokens de entrenamiento o la composición del dataset.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/niuqimeng/AGR)
- [Repositorio del modelo en HuggingFace (carpeta model)](https://huggingface.co/niuqimeng/AGR/tree/main/model)
- [Repositorio GitHub GR_niuqimeng](https://github.com/niuqimeng/GR_niuqimeng)
- [Paper: Enhancing Group Recommendation with Memory-Augmented Reasoning (Semantic Scholar)](https://www.semanticscholar.org/paper/Enhancing-Group-Recommendation-with-Reasoning-in-Niu-Hao/137dac17d09a94ad5fdc5cbc7b836401f34d406c)
- [Modelo base: meta-llama/Meta-Llama-3-8B-Instruct](https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct)
- [Framework ms-swift](https://github.com/modelscope/ms-swift)
- [TRL (Transformer Reinforcement Learning)](https://github.com/huggingface/trl)
