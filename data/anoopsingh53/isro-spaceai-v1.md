# Anoopsingh53/isro-spaceai-v1

## Resumen

SpaceAI-v1 es un modelo de lenguaje de 7.000 millones de parametros, especializado en astrofisica, exploracion espacial, heliofisica, ciencia planetaria y analisis de teledeteccion. Desarrollado por Anoop Singh (Anoopsingh53) como contribucion open source para el National Space Day 2026, el modelo se construye mediante un ajuste fino con QLoRA sobre la base Qwen/Qwen2.5-7B-Instruct, con un merge completo en FP16 de los adaptadores 4-bit.

El modelo esta entrenado con un conjunto de datos de 10.294 pares de preguntas y respuestas de astrofisica revisados por pares, extraidos del corpus de arXiv (Astro-PH) y de misiones de la ISRO como Aditya-L1 y Chandrayaan-3. Su proposito principal es proporcionar una herramienta de alta precision para el dominio espacial, cubriendo temas como mecanica orbital, fisica solar, ciencia lunar y astrofisica teorica. La relevancia actual radica en su contribucion open a los ecosistemas de datos espaciales de la ISRO (MOSDAC, VEDAS, IN-SPACe) y su capacidad para responder con precision en dominios cientificos muy especificos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5-7B-Instruct (Transformer decoder-only, 28 capas, Grouped-Query Attention) |
| Parametros totales | 7.615.616.512 (7,6 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (32k) |
| Tipos de cuantizacion | FP16 (merge completo), entrenado con QLoRA 4-bit |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-7B-Instruct, un transformer decoder-only con 28 capas, Grouped-Query Attention (GQA) y una ventana de contexto de 32k tokens. El ajuste fino se realizo con QLoRA (Quantized Low-Rank Adaptation) en precision 4-bit, seguido de un merge completo de los adaptadores a los pesos originales en FP16, lo que preserva la precision total del modelo sin cuantizacion residual.

El dataset de entrenamiento, `UniverseTBD/arxiv-qa-astro-ph`, contiene 10.294 pares de preguntas y respuestas limpiados y basados en literatura cientifica revisada por pares. Se procesaron aproximadamente 2,96 millones de tokens a lo largo de 644 pasos de optimizacion, con una perdida final de 0,617. La composicion del dataset cubre fisica solar, mecanica orbital, ciencia lunar, astrofisica teorica y cosmologia, entre otras areas. No se mencionan tecnicas de RLHF o DPO en la informacion disponible.

## Capacidades

- Generacion de texto especializado en astrofisica, cosmologia, astronomia, heliofisica y ciencia planetaria.
- Respuesta a preguntas sobre misiones espaciales de la ISRO, incluyendo Aditya-L1 (instrumento SUIT, longitudes de onda 130–285 nm) y Chandrayaan-3 (espectrometro APXS, fluorescencia de rayos X).
- Razonamiento en mecanica orbital, incluyendo orbitas de halo en el punto de Lagrange L1 y equilibrio gravitatorio de tres cuerpos.
- Conocimiento de astrofisica teorica, como el limite de masa de Chandrasekhar (1,4 masas solares) y el colapso de estrellas enanas.
- Capacidad de conversacion multi-turno heredada de la base Qwen2.5-Instruct.
- No se ha confirmado soporte de tool calling o function calling especifico en la model card, aunque la base Qwen2.5-Instruct es compatible con el.

## Casos de uso

- Asistente de investigacion para astrofisicos: consultar literatura y conceptos del arXiv astro-ph, obteniendo respuestas con terminologia precisa y referencias a fenomenos fisicos concretos.
- Educacion en fisica espacial: explicar conceptos como la reconnection magnetica cromosferica, el calentamiento del plasma termal o la fluorescencia de rayos X en instrumentacion lunar.
- Soporte de misiones espaciales: ayudar en la interpretacion de datos de instrumentos como SUIT (Aditya-L1) o APXS (Chandrayaan-3), facilitando la formacion de equipos cientificos.
- Documentacion tecnica y divulgacion: generar contenido explicativo sobre misiones ISRO, VEDAS, MOSDAC o IN-SPACe para publicaciones o material educativo.
- Analisis de literatura cientifica: resumir y responder preguntas sobre articulos de astrofisica, gracias al entrenamiento sobre el corpus arXiv.
- Prototipado de agentes de dominio: integrar el modelo en pipelines de generacion de informes o chatbots cientificos, aprovechando su licencia Apache 2.0 para uso comercial.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en la model card (no verificados de forma independiente):

| Metrica | Valor |
|---|---|
| Token Accuracy (evaluacion general) | 91,5 % |
| Perdida final de entrenamiento | 0,617 |
| Fisica solar y precision SUIT (Aditya-L1) | 98,0 % |
| Mecanica orbital (punto de Lagrange L1) | 100,0 % |
| Ciencia lunar (APXS, Chandrayaan-3) | 96,0 % |
| Astrofisica teorica (limite de Chandrasekhar) | 100,0 % |

No se han publicado resultados en benchmarks estandarizados como MMLU, HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 16-18 GB, lo que permite ejecucion en GPUs de consumo como la RTX 4080 o RTX 4090 (16-24 GB).
- Para cuantizacion en 4-bit (GGUF o bitsandbytes), la VRAM requerida baja a unos 5-6 GB, ejecutable en GPUs de 8 GB como la RTX 3070 o RTX 4060 Ti.
- GPUs recomendadas para produccion: A100 (40-80 GB) o H100 para multiples requests concurrentes y baja latencia.
- Opciones de despliegue: compatible con Hugging Face Transformers, vLLM, llama.cpp (mediante conversion a GGUF), Ollama y Text Generation Inference (TGI), segun los tags del modelo.
- Latencia estimada: no disponible en la informacion proporcionada; dependera del hardware y de la cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia |
|---|---|---|---|---|
| SpaceAI-v1 | 7,6 B | 32k | Astrofisica / ISRO | Apache 2.0 |
| Qwen2.5-7B-Instruct (base) | 7,6 B | 32k | General / instruct | Apache 2.0 |
| Llama-3.1-8B-Instruct | 8,0 B | 128k | General | Llama 3.1 (uso comercial permitido) |
| Mistral-7B-Instruct | 7,3 B | 32k | General | Apache 2.0 |

SpaceAI-v1 se diferencia por su especializacion en el dominio espacial y astrofisico, mientras que las alternativas generalistas ofrecen un alcance mas amplio pero con menos precision en terminologia cientifica especifica de la ISRO.

## Limitaciones y advertencias

- Especializado en un solo dominio: el modelo esta ajustado para astrofisica y espacio, por lo que su rendimiento en tareas generales puede ser inferior al de la base Qwen2.5-Instruct.
- Idiomas limitados: solo soporta ingles (en), sin soporte multilingue declarado.
- Riesgo de alucinacion: aunque las metricas de dominio son altas, no hay evaluacion independiente de los resultados declarados.
- Datos de entrenamiento limitados: 10.294 pares QA y 2,96 millones de tokens es un volumen reducido para un dominio cientifico amplio; puede faltar cobertura en subareas.
- Sin garantias de actualidad: el conocimiento se basa en el corpus arXiv y en datos de misiones ISRO hasta la fecha de entrenamiento (2026).
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la correcta atribucion y las condiciones de la base Qwen2.5.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Anoopsingh53/isro-spaceai-v1
- Perfil del autor en HuggingFace: https://huggingface.co/Anoopsingh53
- Repositorio GitHub del proyecto ISRO: https://github.com/Anoop-singh225/ISRO
- Dataset de entrenamiento: https://huggingface.co/datasets/UniverseTBD/arxiv-qa-astro-ph
- Modelo base Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
