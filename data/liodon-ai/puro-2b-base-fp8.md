# liodon-ai/Puro-2B-Base-FP8

## Resumen

Puro-2B-Base-FP8 es una cuantización en FP8 (precisión de 8 bits en coma flotante) del modelo base Puro-2B, desarrollado por el laboratorio thu-pacman y publicado en HuggingFace por Liodon AI. El modelo original, Puro-2B, fue entrenado desde cero por el "Poor Lab" con un presupuesto de 5090 dólares usando GPUs de consumo RTX 5090, y su diseño se inspira en la arquitectura de Qwen2-1.5B. Esta versión FP8 reduce el tamaño del modelo de 4.1 GB a 2.7 GB, manteniendo la calidad numérica gracias a un esquema de cuantización dinámica sin calibración.

La relevancia de este modelo radica en su demostración de que es posible entrenar modelos de lenguaje de 2B parámetros con un coste muy reducido y hardware de consumo, y en que la cuantización FP8 permite desplegarlo en GPUs modernas con menor consumo de memoria y mayor velocidad de inferencia. Está pensado para desarrolladores que necesitan un modelo base compacto y eficiente para fine-tuning o generación de texto en entornos con recursos limitados.

El modelo está disponible bajo licencia "other" (no especificada), lo que obliga a revisar los términos de uso antes de emplearlo en producción. No se ha publicado información sobre idiomas soportados ni longitud de contexto en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (similar a Qwen2, segun el paper) |
| Parametros totales | 2.031.739.904 (~2.03B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP8 (E4M3) dinamico; el modelo original usa precision completa (probablemente BF16) |
| Idiomas soportados | No disponibles |
| Licencia | Other (no especificada) |
| Formato de pesos | safetensors (compatible con vLLM, TGI, SGLang) |

## Arquitectura y entrenamiento

El modelo base Puro-2B es un transformer decoder-only entrenado desde cero por el grupo "Poor Lab" de la Universidad de Tsinghua (thu-pacman). Segun el paper disponible en arXiv, el entrenamiento se realizo con hasta 1.4 billones de tokens utilizando precision FP8 en GPUs RTX 5090 de consumo, con un coste total de 5090 dolares. El paper tambien presenta una "Puro Cost Scaling Law" que relaciona el coste de entrenamiento con el rendimiento medio, sugiriendo que con aproximadamente 4400 dolares se alcanza el nivel de Qwen2-1.5B.

La version FP8 publicada por Liodon AI utiliza el esquema `FP8_DYNAMIC` implementado con llm-compressor: los pesos se convierten a FP8 (E4M3) por canal de forma estatica antes de la inferencia, mientras que las activaciones se cuantizan dinamicamente por token en tiempo de ejecucion. Este esquema no requiere dataset de calibracion, por lo que la cuantizacion es una simple conversion de los pesos originales sin sesgo inducido por calibracion. El `lm_head` se deja sin cuantizar, una practica estandar para preservar la calidad de los logits.

## Capacidades

- Generacion de texto autoregresiva en tareas generales de lenguaje (modelo base, no entrenado para instrucciones).
- Razonamiento basico y comprension del lenguaje, con un rendimiento comparable al de Qwen2-1.5B segun el paper de entrenamiento.
- Capacidad de fine-tuning para tareas especificas gracias a su tamano compacto (2B parametros).
- Compatible con pipelines de generacion de texto en transformers, vLLM, TGI y SGLang.
- No se ha documentado soporte explicito para tool calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Fine-tuning para clasificacion de texto: al ser un modelo base de 2B, puede adaptarse con datasets pequenos para tareas como analisis de sentimiento o categorizacion de documentos, con costes de entrenamiento reducidos.
- Generacion de texto en aplicaciones con restricciones de memoria: su version FP8 (2.7 GB) permite ejecutarlo en GPUs con 4-6 GB de VRAM, adecuado para prototipos o entornos edge.
- Investigacion academica en eficiencia de entrenamiento: sirve como punto de partida para estudiar leyes de escalado de costes y tecnicas de entrenamiento low-cost, como se describe en el paper.
- Desarrollo de chatbots o asistentes conversacionales tras un fine-tuning con datos de instrucciones: el modelo base puede convertirse en un asistente con un dataset de dialogo.
- Evaluacion de tecnicas de cuantizacion: la version FP8 permite comparar el impacto de la cuantizacion dinamica frente a otras estrategias (AWQ, GPTQ) en un modelo de tamano medio.
- Despliegue en entornos sin GPU de alta gama: con la cuantizacion FP8 y un runtime como llama.cpp (si se convierte a GGUF) o vLLM, puede ejecutarse en hardware modesto para tareas de generacion de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El paper de entrenamiento indica que el modelo alcanza un rendimiento comparable al de Qwen2-1.5B, pero no se proporcionan cifras concretas en la model card ni en el resumen del paper. Se recomienda consultar el articulo completo en arXiv para obtener datos detallados.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3-4 GB con cuantizacion FP8 (el modelo pesa 2.7 GB en disco, mas overhead de activaciones). Sin cuantizar, se necesitarian alrededor de 4-5 GB.
- GPU recomendadas: cualquier GPU NVIDIA con compute capability >= 8.9 (Ada, Hopper, Blackwell), como RTX 4090, L4, L40S, H100, H200, B100/B200. En GPUs mas antiguas (Ampere o anterior) el modelo se descuantizara a FP16/BF16, perdiendo la ventaja de velocidad y memoria.
- Cabe en GPUs de consumo de gama media como RTX 4060 (8 GB) o RTX 4070 (12 GB) sin problemas.
- Opciones de despliegue: vLLM, TGI, SGLang, o conversion a GGUF para usar con llama.cpp u Ollama (no incluido en el repositorio original, pero posible).
- Latencia y throughput: no se han publicado datos especificos. Para un modelo de 2B en FP8, se puede esperar una velocidad de generacion de entre 50 y 150 tokens por segundo en una RTX 4090, pero esto es una estimacion general sin confirmacion.

## Comparativa con modelos similares

La comparativa se basa en la informacion del paper, que posiciona a Puro-2B como una alternativa economica a Qwen2-1.5B. No se dispone de datos de otros modelos comparables en la informacion proporcionada.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Puro-2B-Base-FP8 | 2.03B | No disponible | Other | HuggingFace |
| Qwen2-1.5B | 1.5B | 32K (tipico) | Apache 2.0 | HuggingFace |
| Gemma-2B | 2.6B | 8K | Gemma License | HuggingFace |

Nota: los datos de contexto y licencia de Qwen2-1.5B y Gemma-2B son de conocimiento general y no estan confirmados en la informacion proporcionada para Puro-2B.

## Limitaciones y advertencias

- Modelo base: no esta entrenado para seguir instrucciones ni para dialogos; requiere fine-tuning para tareas conversacionales o de instrucciones.
- Licencia "other": los terminos exactos de uso comercial no estan especificados en la model card. Es imprescindible consultar la documentacion del modelo base (thu-pacman/Puro-2B-Base) antes de usar en produccion.
- Idiomas soportados no documentados: se desconoce si el modelo funciona bien en espanol u otros idiomas distintos de los utilizados en su entrenamiento (probablemente ingles y chino, segun el contexto del paper).
- Longitud de contexto no especificada: no se puede garantizar un rendimiento adecuado en secuencias largas sin conocer el limite real.
- Sesgos y alucinaciones: al ser un modelo base de 2B, puede presentar sesgos presentes en los datos de entrenamiento y una tendencia a alucinar hechos, especialmente en tareas de generacion abierta.
- Requisito de GPU moderna para FP8: en GPUs con compute capability < 8.9, la cuantizacion FP8 no aporta beneficios y el modelo se ejecuta en precision completa, aumentando el consumo de memoria.
- Sin benchmarks publicados: no hay datos objetivos de rendimiento en tareas estandar, lo que dificulta la comparacion rigurosa con otros modelos.

## Enlaces

- Modelo FP8 en HuggingFace: https://huggingface.co/liodon-ai/Puro-2B-Base-FP8
- Modelo base original: https://huggingface.co/thu-pacman/Puro-2B-Base
- Paper de entrenamiento (arXiv): https://arxiv.org/abs/2608.27370
- Version HTML del paper: https://arxiv.org/html/2608.27370
- Organizacion Liodon AI en HuggingFace: https://huggingface.co/liodon-ai
- GitHub de Liodon AI: https://github.com/Liodon-AI
