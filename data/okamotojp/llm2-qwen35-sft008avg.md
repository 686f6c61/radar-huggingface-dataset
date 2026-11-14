# OkamotoJP/llm2-qwen35-sft008avg

## Resumen

`OkamotoJP/llm2-qwen35-sft008avg` es un modelo de lenguaje en japones derivado de `Qwen/Qwen3.5-0.8B` mediante un proceso de fine-tuning con LoRA y posterior fusion (merge) de pesos. Concretamente, el autor entreno dos variantes del mismo modelo con los mismos datos pero distinta semilla (seed) y luego promedia sus pesos elemento a elemento al 50 % cada una. El resultado conserva la arquitectura del modelo base, con solo los pesos de la parte linguistica modificados.

El modelo esta disenado especificamente como generador de respuestas para un sistema RAG (Retrieval-Augmented Generation) en el contexto del "LLM講座2 2026", un curso de LLM cuyo proyecto final consistia en construir un sistema RAG. Los datos de entrenamiento son conjuntos japoneses de question answering y articulos de Wikipedia en japones, lo que orienta el modelo hacia la generacion de respuestas fundamentadas en contexto documental.

Con 873 millones de parametros y licencia Apache-2.0, es un modelo pequeno y ligero, adecuado para despliegue en hardware modesto. Su relevancia es limitada fuera del ambito del curso y del idioma japones: no es un modelo generalista de proposito amplio, sino una adaptacion concreta para RAG en japones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5; detalles no disponibles) |
| Parametros totales | 873.438.784 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Japones (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-0.8B` y mantiene su estructura original; solo se modifican los pesos de la parte linguistica. El entrenamiento se realizo mediante LoRA (Low-Rank Adaptation) sobre dos ejecuciones independientes con los mismos datos y distinta semilla, generando `llm2-qwen35-sft008` y `llm2-qwen35-sft008b`. Posteriormente, ambos modelos se fusionaron y sus pesos se promediaron elemento a elemento con peso 0.50 cada uno, una tecnica de model averaging que busca reducir la varianza entre ejecuciones y estabilizar el comportamiento.

Los datos de entrenamiento de las dos variantes originales incluyen JEMHopQA (CC BY-SA 4.0), filtrado y reformateado para entrenamiento; `cl-nagoya/auto-wiki-qa` (CC BY-SA 4.0), muestreado, filtrado y reformateado; y un conjunto de chunks distribuidos derivados de Wikipedia en japones (CC BY-SA 4.0), usados como material de contexto en los prompts de entrenamiento. No se especifican el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo RLHF o DPO. Tampoco se detallan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto en japones orientada a respuestas fundamentadas en contexto documental (RAG).
- Question answering sobre documentos recuperados, entrenado con JEMHopQA y auto-wiki-qa.
- Manejo de preguntas de tipo multi-hop (JEMHopQA es un dataset de QA multi-salto).
- Capacidad de sintetizar respuestas a partir de chunks de Wikipedia en japones.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso mas alla del QA.
- Capacidades multilingues limitadas al japones segun la model card.
- No se documentan capacidades especiales como modo thinking, vision o audio.

## Casos de uso

- Generacion de respuestas en sistemas RAG en japones: el modelo esta entrenado explicitamente para recibir contexto documental y producir respuestas, por lo que encaja como generador final en un pipeline de recuperacion y generacion.
- Question answering sobre documentacion corporativa en japones: puede integrarse en un buscador interno que recupere fragmentos de manuales o politicas y genere respuestas sintetizadas.
- Asistencia sobre Wikipedia en japones: dado que se entreno con chunks derivados de Wikipedia, es adecuado para responder preguntas enciclopedicas a partir de articulos recuperados.
- Preguntas multi-hop: JEMHopQA entrena al modelo para responder preguntas que requieren combinar informacion de varias fuentes, util en asistentes de investigacion documental.
- Prototipado y docencia: por su tamano (873 M parametros) y licencia Apache-2.0, sirve para experimentar con pipelines RAG en entornos academicos y de aprendizaje.
- Despliegue en hardware modesto: su tamano reducido permite ejecutarlo en GPUs de consumo o incluso en CPU para tareas de baja concurrencia, lo que facilita demos y entornos de desarrollo.
- Base para fine-tuning adicional: al ser Apache-2.0 y pequeno, puede servir como punto de partida para adaptaciones a dominios japoneses especificos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32): aproximadamente 3,5 GB para los pesos (873 M parametros x 4 bytes), mas memoria para activaciones y KV cache.
- VRAM estimada en fp16/bf16: aproximadamente 1,75 GB para los pesos, mas overhead de inferencia.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 0,9 GB; en 4 bits, aproximadamente 0,5 GB (estimaciones teoricas, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para fp16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son mas que suficientes.
- Cabe en GPU de consumo: si, en la mayoria de GPUs modernas con 6 GB o mas de VRAM.
- Opciones de despliegue: al ser un modelo de la familia Qwen con pesos safetensors, es compatible con frameworks estandar como Transformers, vLLM, TGI y llama.cpp (previa conversion a GGUF). No se documenta compatibilidad explicita con Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| OkamotoJP/llm2-qwen35-sft008avg | 873 M | No disponible | ja | Apache-2.0 | Fine-tuning RAG en japones sobre Qwen3.5-0.8B |
| Qwen/Qwen3.5-0.8B | ~0,8 B | No disponible | Multilingue | Apache-2.0 | Modelo base, capacidades generales |
| OkamotoJP/llm2-qwen35-sft008 | 873 M | No disponible | ja | Apache-2.0 | Variante individual pre-media (seed 1) |
| OkamotoJP/llm2-qwen35-sft008b | 873 M | No disponible | ja | Apache-2.0 | Variante individual pre-media (seed 2) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta especializado en japones y en generacion de respuestas RAG; su rendimiento en otros idiomas o tareas generales no esta documentado y probablemente sea limitado.
- Al ser un fine-tuning sobre un modelo de 0,8 B, su capacidad de razonamiento y conocimiento factual es acotada en comparacion con modelos mayores.
- Riesgo de alucinacion: como todo modelo generativo, puede producir respuestas no fundamentadas, especialmente si el contexto recuperado es irrelevante o insuficiente.
- No se documentan sesgos conocidos, pero los datos de entrenamiento (Wikipedia y datasets de QA) pueden introducir sesgos propios de esas fuentes.
- La longitud de contexto no esta especificada, lo que limita la planificacion de pipelines RAG con documentos largos.
- Licencia Apache-2.0 permite uso comercial, pero los datasets de entrenamiento son CC BY-SA 4.0, lo que puede imponer obligaciones de atribucion y compartir-igual sobre obras derivadas de esos datos; conviene revisar la compatibilidad antes de un uso comercial.
- No se documentan resultados de benchmarks, por lo que no hay evidencia cuantitativa de su calidad frente a alternativas.
- El modelo fue creado en el contexto de un curso, sin documentacion extensa de produccion ni mantenimiento garantizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OkamotoJP/llm2-qwen35-sft008avg
- Modelo base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Variante individual 1: https://huggingface.co/OkamotoJP/llm2-qwen35-sft008
- Variante individual 2: https://huggingface.co/OkamotoJP/llm2-qwen35-sft008b
- Dataset JEMHopQA: https://github.com/aiishii/JEMHopQA
- Dataset auto-wiki-qa: https://huggingface.co/datasets/cl-nagoya/auto-wiki-qa
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
