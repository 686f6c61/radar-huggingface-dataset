# norallm/normistral-11b-thinking-gguf

## Resumen

NorMistral-11B-Thinking es un modelo de lenguaje instructivo ajustado específicamente para noruego (bokmål y nynorsk), desarrollado por el grupo Language Technology Group (LTG) de la Universidad de Oslo, en colaboración con el consorcio norallm. El modelo parte de Mistral-Nemo-Base-2407, sobre el que se realizó un pre-entrenamiento continuo masivo con aproximadamente 250 000 millones de tokens en noruego, y posteriormente se aplicó un ajuste fino supervisado (SFT) con trazas de razonamiento de Kimi-K2-Thinking, seguido de un refuerzo por aprendizaje con realimentación de IA (d-RLAIF) utilizando Mistral-Large-Instruct-2411 como modelo de recompensa. El resultado es un modelo de 11 000 millones de parámetros optimizado para tareas de razonamiento, comprensión y generación en noruego, con especial énfasis en preservar la fluidez del lenguaje durante el post-entrenamiento.

Este repositorio contiene las versiones cuantizadas en formato GGUF del modelo, pensadas para su despliegue eficiente en entornos de inferencia local mediante `llama.cpp` u Ollama. Se incluye también un archivo `.modelfile` con la plantilla de chat oficial convertida a Go, lo que facilita su integración directa en Ollama. El modelo se distribuye bajo licencia Apache 2.0, sin restricciones adicionales sobre los pesos, aunque los datos de entrenamiento no pertenecen a los autores. Es relevante ahora porque cubre un hueco importante en el ecosistema de modelos abiertos para lenguas de bajos recursos como el noruego, ofreciendo capacidades de razonamiento avanzado comparables a modelos mucho más grandes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder basado en Mistral-Nemo-Base-2407 |
| Parametros totales | 11 000 millones (segun el autor) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el modelo base Mistral-Nemo soporta 128 000 tokens, pero no se confirma para esta variante) |
| Tipos de cuantizacion | GGUF (incluye Q5_K_M y otras variantes; consultar el repositorio para la lista completa) |
| Idiomas soportados | Noruego (bokmal y nynorsk), ingles (usado en el entrenamiento SFT) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors disponibles en el modelo base) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Transformer decoder de Mistral-Nemo-Base-2407, un modelo denso de aproximadamente 12 000 millones de parámetros desarrollado por Mistral AI. Sobre esta base se realizó un pre-entrenamiento continuo con unos 250 000 millones de tokens en noruego (bokmål, nynorsk y lenguas sami), lo que proporciona una fluidez nativa en estos idiomas. El post-entrenamiento sigue el esquema descrito en el artículo "Fluent Alignment with Disfluent Judges: Post-training for Lower-resource Languages" (arXiv:2512.08777), que consta de dos fases principales:

1. **Supervised finetuning (SFT)**: se inyectan capacidades de seguimiento de instrucciones y razonamiento entrenando sobre respuestas y trazas de razonamiento en inglés provenientes de Kimi-K2-Thinking. El conjunto de datos SFT completo está publicado en el repositorio de entrenamiento.

2. **Reinforcement learning (d-RLAIF)**: se aplica aprendizaje por refuerzo on-policy sobre una amplia colección de prompts en noruego (bokmål y nynorsk), utilizando como modelo de recompensa Mistral-Large-Instruct-2411. El enfoque d-RLAIF (direct reinforcement learning from AI feedback) está diseñado para preservar la fluidez del lenguaje durante el entrenamiento, evitando los artefactos de "disfluencia" que suelen aparecer en modelos ajustados con RLHF.

Los datos de entrenamiento se publican abiertamente en `norallm/normistral-11b-thinking-training`, y el código de entrenamiento está disponible en GitHub. El modelo ha sido evaluado en una versión generativa de NorEval, un benchmark específico para noruego.

## Capacidades

- Generación de texto y seguimiento de instrucciones en noruego (bokmål y nynorsk) con alta fluidez.
- Razonamiento multi-paso y modo "thinking", heredado del entrenamiento con trazas de Kimi-K2-Thinking.
- Comprensión lectora y respuesta a preguntas en noruego, incluyendo tareas de sentido común y razonamiento lógico.
- Análisis de sentimiento a nivel de frase (evaluado en NoReC).
- Comprensión de modismos y expresiones idiomáticas noruegas (NorIdiom).
- Resumen de textos y reescritura de contenido (NorSummarize, NorRewrite).
- Capacidades multilingües limitadas al noruego e inglés; no se reporta soporte para otras lenguas.
- Soporte de tool calling y function calling: no disponible (no se menciona en la documentación).
- Soporte de agentes y multi-step reasoning: no disponible explícitamente, aunque el modo thinking sugiere capacidades de razonamiento encadenado.
- Capacidades de visión o audio: no disponibles (modelo únicamente de texto).

## Casos de uso

- **Asistente conversacional en noruego**: el modelo puede gestionar diálogos multi-turno en bokmål y nynorsk con fluidez natural, gracias a su entrenamiento específico en estas variedades. Es adecuado para chatbots de atención al cliente o asistentes personales dirigidos al mercado noruego.

- **Análisis de sentimiento de reseñas**: con un 86.3 % de precisión en NoReC_binary, el modelo puede clasificar reseñas de productos o servicios en noruego (positiva/negativa/neutral), superando a alternativas genéricas como Llama-3.1-8B o Mistral-Nemo-12B en este dominio.

- **Generación de contenido editorial**: el modelo obtiene buenos resultados en tareas de resumen (NRK_NN 62.3 %) y reescritura (NorRewrite 51.9 % de win-rate), lo que lo hace útil para automatizar resúmenes de noticias o reescribir textos manteniendo el estilo.

- **Educación y aprendizaje de idiomas**: puede generar ejercicios, explicaciones gramaticales y textos adaptados en bokmål y nynorsk, aprovechando su comprensión de modismos (NorIdiom_NB 55.7 %) y su capacidad de razonamiento.

- **Investigación en PLN para lenguas de bajos recursos**: el modelo sirve como referencia para estudiar técnicas de post-entrenamiento que preservan la fluidez, y como base para fine-tuning en tareas específicas del noruego.

- **Despliegue local en entornos con recursos limitados**: al estar disponible en GGUF cuantizado, puede ejecutarse en portátiles o servidores sin GPU dedicada mediante Ollama o `llama.cpp`, facilitando prototipos y aplicaciones de producción ligera.

## Benchmarks y rendimiento

Se han publicado resultados preliminares en una versión generativa de NorEval (trabajo en progreso). Las puntuaciones de clasificación son exactitud; las generativas (NorRewrite y NorSummarize) son win-rates promedio contra Llama-3.1-8B evaluadas con LLM-as-a-judge usando Llama-3.3-70B. El asterisco indica modelos "thinking".

| Modelo | NoReC_binary | NoReC_ternary | NorIdiom_NB | NorIdiom_NN | NorCSQA_NB | NorCSQA_NN |
|---|---|---|---|---|---|---|
| NorMistral-11B* | **86.3** | 65.2 | **55.7** | **27.7** | 70.7 | 64.2 |
| Llama-3.1-8B | 79.8 | 52.9 | 12.7 | 6.7 | 64.0 | 57.9 |
| Mistral-Nemo-12B | 67.9 | 49.1 | 12.9 | 8.5 | 61.6 | 49.5 |
| Qwen3-15B* | 83.5 | **69.6** | 22.1 | 13.2 | **83.8** | 71.6 |
| Gemma3-12B | 85.2 | 67.1 | 43.7 | 23.7 | 81.9 | **80.0** |
| OLMo3-7B* | 72.0 | 63.3 | 5.0 | 2.2 | 50.8 | 17.9 |
| OLMo2-13B | 32.8 | 13.2 | 3.5 | 2.2 | 48.0 | 45.3 |
| Apertus-8B | 78.4 | 58.8 | 34.3 | 15.7 | 69.2 | 63.2 |

| Modelo | NorOBQA_NB | NorOBQA_NN | NRK_NB | NRK_NN | NorRewrite | NorSummarize |
|---|---|---|---|---|---|---|
| NorMistral-11B* | 83.0 | 84.4 | 58.8 | **62.3** | 51.9 | 54.3 |
| Llama-3.1-8B | 78.5 | 71.1 | 49.8 | 46.2 | 50.0 | 50.0 |
| Mistral-Nemo-12B | 75.3 | 67.8 | 47.3 | 45.0 | 42.5 | 39.2 |
| Qwen3-15B* | **94.4** | **88.9** | **63.3** | 55.9 | 77.6 | **83.1** |
| Gemma3-12B | 91.5 | **88.9** | 59.8 | 58.4 | **86.8** | 77.8 |
| OLMo3-7B* | 70.5 | 54.4 | 43.3 | 35.9 | 7.8 | 14.2 |
| OLMo2-13B | 55.3 | 56.7 | 45.3 | 39.4 | 48.3 | 53.7 |
| Apertus-8B | 76.1 | 74.4 | 50.2 | 48.3 | 39.6 | 42.1 |

NorMistral-11B* destaca especialmente en tareas de comprensión de modismos y razonamiento sobre conocimiento cultural noruego, donde supera ampliamente a modelos genéricos de tamaño similar. En tareas de razonamiento general (NorOBQA) y generación creativa, modelos como Qwen3-15B o Gemma3-12B obtienen mejores resultados, lo que sugiere que NorMistral está optimizado para el dominio noruego más que para benchmarks genéricos.

## Requisitos de hardware

- **VRAM estimada para inferencia**: un modelo de 11 000 millones de parámetros en GGUF Q5_K_M ocupa aproximadamente 7-8 GB de memoria. Con cuantización Q4_K_M, se reduce a unos 6-7 GB. La versión F16 completa requeriría unos 22 GB.
- **GPU recomendadas**: para inferencia en tiempo real, una GPU con 8-12 GB de VRAM es suficiente (por ejemplo, RTX 3060 12 GB, RTX 4070, RTX 3080). Para mayor velocidad o procesamiento por lotes, se recomienda una RTX 4090 (24 GB) o una A100/H100.
- **Compatibilidad con GPU de consumo**: sí, cabe en GPUs de consumo con 8 GB o más de VRAM usando cuantización GGUF. En una RTX 4090 se puede ejecutar cómodamente con contexto largo.
- **Opciones de despliegue**: `llama.cpp`, Ollama (incluye un `.modelfile` oficial), y cualquier framework compatible con GGUF. También se puede usar el modelo base en safetensors con Transformers y vLLM.
- **Latencia y throughput**: no se han publicado cifras oficiales. Como referencia orientativa, un modelo de 11B en Q5_K_M en una RTX 4090 suele generar entre 40 y 60 tokens por segundo con `llama.cpp`, y en CPU con 32 GB de RAM puede alcanzar 5-10 tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion | Rendimiento NorEval (media) |
|---|---|---|---|---|---|
| NorMistral-11B* | 11B | no disponible | Apache 2.0 | Noruego (bokmal, nynorsk) | Fuerte en modismos y clasificacion; moderado en generacion |
| Llama-3.1-8B | 8B | 128K | Llama 3.1 Community | Multilingue general | Inferior en tareas noruegas especificas |
| Mistral-Nemo-12B | 12B | 128K | Apache 2.0 | Multilingue general | Inferior en tareas noruegas especificas |
| Qwen3-15B* | 15B | 128K | Apache 2.0 | Multilingue general | Superior en razonamiento y generacion, inferior en modismos |
| Gemma3-12B | 12B | 128K | Gemma Terms | Multilingue general | Superior en generacion, inferior en modismos |

NorMistral-11B* se posiciona como la opción más sólida para tareas que requieren conocimiento cultural y lingüístico profundo del noruego, mientras que modelos generalistas más grandes como Qwen3-15B o Gemma3-12B superan en tareas de razonamiento abstracto y generación creativa. La licencia Apache 2.0 de NorMistral es más permisiva que la de Gemma (términos propietarios) y comparable a la de Mistral-Nemo.

## Limitaciones y advertencias

- **Enfoque exclusivo en noruego**: el modelo está optimizado para bokmål y nynorsk; su rendimiento en otros idiomas es limitado o inexistente. No debe usarse como modelo multilingüe general.
- **Riesgo de alucinación**: como cualquier modelo de lenguaje, puede generar información falsa o inventada, especialmente en tareas de razonamiento complejo. Se recomienda verificación humana en aplicaciones de alto riesgo.
- **Sesgos potenciales**: los datos de entrenamiento provienen de fuentes abiertas en noruego, que pueden contener sesgos culturales, de género o políticos. No se han publicado auditorías de sesgo para este modelo.
- **Contexto no confirmado**: la longitud de contexto efectiva no está documentada en la información disponible; aunque el modelo base Mistral-Nemo soporta 128K tokens, no se garantiza que esta variante mantenga ese rendimiento tras el post-entrenamiento.
- **Datos de entrenamiento no propietarios**: aunque los pesos se liberan bajo Apache 2.0, los autores advierten que no poseen los datos de entrenamiento, lo que podría tener implicaciones legales si se utilizan los datos para reentrenamiento.
- **Evaluación preliminar**: los benchmarks publicados son de una versión generativa de NorEval aún en desarrollo; los resultados pueden variar en evaluaciones más completas.
- **Sin soporte de tool calling ni visión**: el modelo es únicamente de texto y no se documentan capacidades de integración con herramientas externas.

## Enlaces

- Repositorio HuggingFace (GGUF): https://huggingface.co/norallm/normistral-11b-thinking-gguf
- Modelo base (safetensors): https://huggingface.co/norallm/normistral-11b-thinking
- Modelo base pre-entrenado (NorMistral-11B-long): https://huggingface.co/norallm/normistral-11b-long
- Dataset de entrenamiento: https://huggingface.co/datasets/norallm/normistral-11b-thinking-training
- Evaluaciones completas: https://huggingface.co/datasets/norallm/normistral-11b-thinking-evaluation
- Paper "Fluent Alignment with Disfluent Judges": https://arxiv.org/abs/2512.08777
- Paper NorEval: https://arxiv.org/abs/2504.07749
- Codigo de entrenamiento: https://github.com/ltgoslo/normistral-post-training
- Interfaz de chat publica: https://chat.llm.sigma2.no/
- Pagina en Ollama: https://ollama.com/LTG/normistral-11b-thinking
- Pagina del grupo LTG sobre LLMs noruegos: https://www.mn.uio.no/ifi/english/research/groups/ltg/llms-for-norwegian/index.html
