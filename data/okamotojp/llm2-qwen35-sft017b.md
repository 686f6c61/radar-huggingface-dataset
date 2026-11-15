# OkamotoJP/llm2-qwen35-sft017b

## Resumen

`llm2-qwen35-sft017b` es un ajuste fino supervisado (SFT) del modelo base Qwen/Qwen3.5-0.8B, desarrollado por el usuario OkamotoJP. Se trata de un modelo derivado de 873 millones de parametros orientado especificamente a la generacion de respuestas en tareas de generacion aumentada por recuperacion (RAG), en el marco del curso "LLM講座2 2026" (asignatura final de RAG). El ajuste se realizo mediante LoRA con rango 16 y alpha 32, fusionando posteriormente los pesos adaptados con los originales, por lo que la arquitectura resultante es identica a la del modelo base.

El modelo esta especializado en japones y entrenado exclusivamente sobre datos de QA en ese idioma: JEMHopQA y auto-wiki-qa, ademas de fragmentos de Wikipedia japonesa empleados como material de contexto en los prompts de entrenamiento. El conjunto de entrenamiento es reducido (1216 ejemplos), lo que lo convierte en un modelo de proposito muy concreto mas que en un asistente generalista.

Su relevancia actual es limitada fuera del ambito academico del curso para el que fue creado: cuenta con 2 descargas y 0 likes en Hugging Face, fue publicado en noviembre de 2026 y no dispone de model card extendida con benchmarks, pipeline declarado ni documentacion adicional. Resulta util como referencia de un flujo tipico de SFT con LoRA sobre un modelo pequeno de la familia Qwen 3.5 para tareas de RAG en japones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (hereda la de Qwen/Qwen3.5-0.8B; no se detalla en la informacion disponible) |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | japones (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura del base Qwen/Qwen3.5-0.8B (revision `2fc06364715b967f1860aea9cf38778875588b17`), un transformer de aproximadamente 873 millones de parametros. El autor indica explicitamente que solo se actualizaron los pesos de la parte linguistica y que la estructura del modelo es identica a la del original. No se especifican en la informacion disponible detalles sobre atencion, normalizacion, tokenizador ni vocabulario.

El entrenamiento consistio en un ajuste LoRA con rango 16 y alpha 32, tasa de aprendizaje 1e-4 y una sola epoca sobre 1216 ejemplos: 883 de `cl-nagoya/auto-wiki-qa` y 333 de `JEMHopQA` (particion `jemhopqa_train_sft/compositional`). Los datasets fueron filtrados, muestreados y reformateados para el entrenamiento, y se emplearon fragmentos de Wikipedia japonesa como material de contexto en los prompts. Tras el entrenamiento, los pesos LoRA se fusionaron con los originales. No se documenta uso de RLHF, DPO ni tecnicas adicionales de alineamiento.

## Capacidades

- Generacion de respuestas condicionadas a contexto recuperado (RAG) en japones, que es el objetivo declarado del ajuste.
- Question answering sobre documentos: el modelo fue entrenado con prompts que incluyen fragmentos de Wikipedia como material de referencia.
- Razonamiento multi-hop basico en japones, derivado del uso de JEMHopQA, un dataset de QA composicional.
- Generacion de texto en japones; no se declaran capacidades multilingues mas alla del japones.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso autonomo.
- No se documentan modos especiales (thinking mode, vision, audio) ni capacidades multimodales.

## Casos de uso

- Generacion de respuestas en pipelines RAG en japones: el modelo esta entrenado especificamente para recibir fragmentos de contexto y producir una respuesta, por lo que encaja como componente de generacion en un sistema de recuperacion + generacion sobre documentacion japonesa.
- Question answering sobre Wikipedia japonesa: su entrenamiento con fragmentos de Wikipedia y con auto-wiki-qa lo hace adecuado para responder preguntas factuales a partir de pasajes recuperados de ese corpus.
- Preguntas composicionales o multi-hop en japones: el uso de JEMHopQA en el entrenamiento lo orienta a preguntas que requieren combinar informacion de varias fuentes.
- Prototipado academico y docente: sirve como ejemplo reproducible de un flujo SFT con LoRA sobre un modelo de menos de 1000 millones de parametros, util en cursos y talleres.
- Evaluacion de tecnicas de RAG: al ser un modelo pequeno y especializado, permite comparar variantes de recuperacion, formateo de prompts y estrategias de chunking con bajo coste computacional.
- Despliegue en entornos con recursos limitados: con 873 millones de parametros y pesos en safetensors de 1,8 GB, puede ejecutarse en GPU de consumo para experimentacion, siempre que se valide su calidad en la tarea concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32): aproximadamente 3,5 GB solo para pesos, mas overhead de activaciones y cache KV.
- VRAM estimada en fp16/bf16: aproximadamente 1,8 GB para pesos, con margen adicional para contexto y activaciones.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 0,9 GB para pesos; en 4 bits, alrededor de 0,5 GB (estimaciones teoricas, no verificadas con artefactos publicados).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para fp16; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes y sobradas para el tamano del modelo.
- Cabe en GPU de consumo: si, practicamente cualquier GPU consumer moderna con 6 GB o mas de VRAM.
- Opciones de despliegue: al publicarse solo en safetensors, es necesario convertir los pesos para llama.cpp/Ollama (GGUF) o cargarlos directamente con Transformers, vLLM o TGI. No se proporcionan artefactos preconvertidos.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| OkamotoJP/llm2-qwen35-sft017b | 873 M | no disponible | ja | Apache-2.0 | SFT con LoRA sobre Qwen3.5-0.8B, especializado en RAG en japones |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B | no disponible en la informacion | multilingue (segun modelo base) | Apache-2.0 | Modelo generalista del que deriva; sin especializacion en RAG |
| cl-nagoya/auto-wiki-qa (dataset, no modelo) | no aplica | no aplica | ja | CC BY-SA 4.0 | Fuente de entrenamiento principal; no es un modelo comparable |
| JEMHopQA (dataset, no modelo) | no aplica | no aplica | ja | CC BY-SA 4.0 | Fuente de entrenamiento para QA composicional |

No se dispone de informacion sobre benchmarks ni sobre modelos alternativos de tamano y tarea equivalentes en la informacion proporcionada; la comparativa se limita al modelo base y a las fuentes de datos.

## Limitaciones y advertencias

- Entrenado exclusivamente en japones: su rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea deficiente.
- Conjunto de entrenamiento muy reducido (1216 ejemplos) y una sola epoca: riesgo elevado de sobreajuste a los formatos y dominios de JEMHopQA y auto-wiki-qa.
- Especializado en RAG y QA: puede degradarse en tareas generales de conversacion, codigo, matematicas o instrucciones fuera de dominio.
- Riesgo de alucinacion: al ser un modelo pequeno y ajustado sobre QA, puede generar respuestas plausibles pero no sustentadas en el contexto recuperado.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente al modelo base ni frente a alternativas.
- Sin documentacion sobre sesgos: no se han publicado analisis de sesgo, toxicidad o robustez.
- Licencia Apache-2.0: permite uso comercial, pero los datasets de entrenamiento son CC BY-SA 4.0, lo que puede imponer obligaciones de atribucion y compartir-igual sobre obras derivadas de esos datos; conviene revisar la compatibilidad antes de un uso comercial.
- Sin pipeline declarado ni artefactos de cuantizacion: requiere trabajo adicional para desplegar en llama.cpp, Ollama o vLLM.
- Proyecto academico con 2 descargas y 0 likes: sin mantenimiento ni soporte comunitario documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OkamotoJP/llm2-qwen35-sft017b
- Modelo base Qwen/Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset JEMHopQA: https://github.com/aiishii/JEMHopQA
- Dataset auto-wiki-qa: https://huggingface.co/datasets/cl-nagoya/auto-wiki-qa
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
