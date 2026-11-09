# marcoeg/rosa-qwen3-14b

## Resumen

Rosa es un modelo de persona ajustado por *fine-tuning* a partir de Qwen/Qwen3-14B, publicado por el usuario marcoeg en Hugging Face. Su propósito es encarnar una voz concreta: conoce la historia y las ideas del anarcosindicalismo, el movimiento obrero y los movimientos de emancipación de base, y analiza la actualidad desde una perspectiva anarcosindicalista declarada abiertamente. No pretende ser neutral y lo advierte de forma explícita en su model card.

El modelo se distribuye únicamente en formato GGUF cuantizado a Q4_K_M (unos 8,4 GB), junto con un Modelfile para Ollama y el system prompt de la persona. Está pensado para ejecutarse en local: cabe en GPUs de 12-16 GB de VRAM o en Macs con Apple Silicon, con un consumo aproximado de 10 GB de memoria unificada. La arquitectura subyacente es la de Qwen3-14B (transformer denso de 14.768.307.200 parámetros), con una ventana de contexto recomendada de 8192 tokens y el modo *thinking* desactivado.

Su relevancia es acotada y muy específica: sirve como caso práctico de *fine-tuning* de persona y alineamiento de valores mediante SFT con QLoRA más DPO, y como herramienta para explorar material histórico y divulgativo del movimiento obrero. No es un modelo de propósito general ni sustituye a un asistente neutral.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-14B) |
| Parámetros totales | 14.768.307.200 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8192 tokens (configuración recomendada de inferencia) |
| Tipos de cuantización | Q4_K_M (única publicada) |
| Idiomas soportados | Inglés (único idioma evaluado) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

Rosa parte del transformer denso Qwen3-14B y se construye en dos fases sobre él. La primera es un SFT con QLoRA en NF4 usando el `SFTTrainer` de TRL: LoRA con r=16 y α=32 aplicado a todas las proyecciones de atención y MLP, entrenado sobre conversaciones en formato ShareGPT generadas a partir de un corpus de aproximadamente 1,5 millones de palabras compuesto por 51 textos históricos y teóricos sobre anarcosindicalismo y movimiento obrero, con partición train/eval disjunta por fuente. La segunda fase es un DPO también con QLoRA en NF4 y el `DPOTrainer` de TRL, con β=0,1 y pérdida sigmoide, sobre pares de preferencia autogenerados: la respuesta *chosen* es la respuesta con la voz de Rosa y la *rejected* es la respuesta genérica del Qwen3-14B base.

El adaptador DPO se fusionó con el modelo SFT ya fusionado y el resultado se exportó a GGUF mediante `convert_hf_to_gguf.py` y `llama-quantize` con la cuantización Q4_K_M. El entrenamiento se realizó con el system prompt de la persona, que se distribuye en el repositorio y debe usarse en inferencia para obtener los mejores resultados. El modo *thinking* de Qwen3 se desactiva mediante `/no_think`.

## Capacidades

- Generación de texto conversacional con una voz definida: frases cortas, ejemplos concretos (huelgas, cooperativas, campañas de organización) y enfoque en acciones inmediatas.
- Conocimiento profundo del corpus de entrenamiento: historia y teoría del anarcosindicalismo, movimiento obrero, cooperativismo y ayuda mutua.
- Análisis de actualidad desde una lente anarcosindicalista declarada, con compromiso explícito con la acción no violenta y descentralizada.
- Diálogo multi-turno en inglés dentro de una ventana de 8192 tokens.
- Escritura de material de divulgación, comentario con voz propia y diálogo educativo.
- No se documenta soporte de *tool calling*, *function calling*, agentes multi-paso, visión, audio ni otras capacidades especiales más allá del ajuste de persona.

## Casos de uso

- Exploración histórica y teórica: el modelo responde preguntas sobre textos, corrientes y debates del movimiento obrero apoyándose en el corpus de 51 fuentes con el que fue entrenado, lo que lo hace útil como herramienta de estudio guiada.
- Divulgación con voz propia: redacción de artículos, hilos o guiones con un tono directo y ejemplos concretos, adecuado para publicaciones que ya adoptan explícitamente esta línea editorial.
- Material de organización: borradores de convocatorias, textos para campañas, explicaciones de modelos cooperativos o de ayuda mutua, con la advertencia de que deben revisarse antes de publicarse.
- Diálogo educativo simulado: conversaciones multi-turno para estudiar cómo argumenta una persona con esta ideología, útil en contextos de enseñanza o investigación sobre retórica política.
- Investigación sobre *fine-tuning* de persona y alineamiento de valores: el repositorio documenta el pipeline completo (SFT con QLoRA, DPO con pares autogenerados, fusión y cuantización), lo que lo convierte en una referencia reproducible para experimentos similares.
- Despliegue local en entornos con recursos limitados: al caber en 10 GB de memoria y distribuirse en GGUF con Modelfile, puede ejecutarse en un portátil con GPU de 12-16 GB o en un Mac con Apple Silicon para uso personal o demostraciones.
- Análisis de encuadres ideológicos: comparar sus respuestas con las de un modelo neutral permite estudiar cómo el ajuste de persona desplaza el tono y la selección de hechos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 10 GB en VRAM o memoria unificada con la cuantización Q4_K_M (~8,4 GB de pesos más overhead de contexto).
- GPU compatibles: cabe en GPUs de consumo de 12-16 GB (por ejemplo, RTX 4070 Ti, RTX 4080, RTX 4090) y en Macs con Apple Silicon con al menos 16 GB de memoria unificada.
- GPUs de centro de datos (A100, H100) no son necesarias para esta cuantización, aunque pueden usarse para servir varias instancias.
- Opciones de despliegue: Ollama (mediante el Modelfile incluido), llama.cpp (`llama-cli` con `-cnv`) y cualquier runtime compatible con GGUF.
- Parámetros de inferencia recomendados: `temperature 0.7`, `top_p 0.9`, `top_k 50`, contexto 8192, modo *thinking* desactivado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Rosa (marcoeg/rosa-qwen3-14b) | 14,77 B | 8192 (recomendado) | GGUF Q4_K_M | Apache-2.0 | Persona anarcosindicalista |
| Qwen/Qwen3-14B (base) | 14,77 B | No disponible en la información proporcionada | Safetensors y GGUF (según el modelo base) | Apache-2.0 | Asistente general |
| Modelos de persona de tamaño similar | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación relevante es contra el propio Qwen3-14B: Rosa hereda su tamaño y licencia, pero sustituye el comportamiento de asistente neutral por una voz partidista entrenada con SFT y DPO. No se dispone de datos de benchmarks que permitan comparar rendimiento objetivo con alternativas.

## Limitaciones y advertencias

- Ideología por diseño: el modelo es partidista de forma deliberada y no debe usarse en contextos que requieran neutralidad, como atención al cliente, información institucional o asesoramiento legal.
- Alucinación: como cualquier modelo de 14B, y más tras la cuantización a 4 bits, puede equivocarse en hechos históricos, fechas y citas; hay que verificar las afirmaciones antes de usarlas.
- No es una persona real: no suplanta a ninguna figura histórica, pero si se despliega como agente debe informarse a los usuarios de que hablan con una IA.
- Cobertura lingüística: solo se evaluó en inglés; el rendimiento en castellano u otros idiomas no está documentado.
- Cuantización única: solo se publica Q4_K_M, lo que limita el ajuste fino entre calidad y requisitos de memoria.
- Licencia: los pesos son Apache-2.0, pero los textos de terceros del corpus conservan sus licencias originales y el corpus no se redistribuye; conviene revisar la procedencia de las fuentes si se reutiliza el modelo en producción.
- Contexto: la configuración recomendada es de 8192 tokens, inferior a la ventana nativa del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/marcoeg/rosa-qwen3-14b
- Modelo base: https://huggingface.co/Qwen/Qwen3-14B
- Repositorio de TRL (SFTTrainer y DPOTrainer): https://github.com/huggingface/trl
- llama.cpp (conversión a GGUF y cuantización): https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
