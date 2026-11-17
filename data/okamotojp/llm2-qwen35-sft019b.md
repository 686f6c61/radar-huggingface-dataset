# OkamotoJP/llm2-qwen35-sft019b

## Resumen

llm2-qwen35-sft019b es un ajuste fino supervisado (SFT) del modelo Qwen/Qwen3.5-0.8B, desarrollado por el usuario OkamotoJP en el contexto del curso "LLM講座2 2026" (Lección de LLM 2, 2026). El modelo está especializado en la generación de respuestas para sistemas de recuperación aumentada (RAG) en japonés, y se ha entrenado mediante LoRA con posterior fusión de los pesos en el modelo base, por lo que su arquitectura y estructura son idénticas a las del modelo original.

El modelo cuenta con 873.438.784 parámetros (aproximadamente 0,87 mil millones), lo que lo sitúa en la categoría de modelos pequeños, aptos para despliegue en hardware modesto. Su licencia Apache 2.0 y su naturaleza compacta lo hacen interesante para experimentación y para pipelines de RAG en producción con requisitos de latencia bajos, aunque su especialización es muy concreta y su adopción pública es prácticamente nula (2 descargas y 0 likes en el momento de la ficha).

La relevancia de este modelo radica en su carácter didáctico y en su enfoque: demuestra cómo un ajuste fino ligero (LoRA r=16) sobre un modelo base pequeño puede especializarse en una tarea concreta (generación de respuestas a partir de contexto documental) con un conjunto de datos reducido (1.324 ejemplos). No obstante, al no publicarse benchmarks ni una model card extensa, su evaluación objetiva queda limitada a los datos disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-0.8B; no se detalla la variante exacta en la información disponible) |
| Parámetros totales | 873.438.784 (~0,87 B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada de Qwen3.5-0.8B, no especificada) |
| Tipos de cuantización | No disponible (pesos en safetensors; se puede cuantizar a GGUF/AWQ mediante herramientas externas, pero no se documenta) |
| Idiomas soportados | Japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Qwen3.5-0.8B, un transformer de aproximadamente 0,87 mil millones de parámetros. El autor indica explícitamente que la estructura del modelo es la misma que la del original y que solo se actualizaron los pesos de la parte lingüística. El entrenamiento se realizó mediante LoRA con rango r=16 y alpha=32, tasa de aprendizaje 0,0001 y 1 época, tras lo cual los pesos LoRA se fusionaron en los pesos base.

El conjunto de entrenamiento consta de 1.324 ejemplos, distribuidos en tres fuentes: 882 ejemplos de auto_wiki_qa (cl-nagoya/auto-wiki-qa), 378 de JEMHopQA (partición compositional) y 64 de synth_compo/compositional. Los datos provienen de JEMHopQA (CC BY-SA 4.0) y auto-wiki-qa (CC BY-SA 4.0), además de un conjunto de chunks de Wikipedia japonesa (CC BY-SA 4.0) utilizado como material de contexto en los prompts. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación adicionales.

## Capacidades

- Generación de texto en japonés, orientada a la respuesta de preguntas a partir de contexto documental (RAG).
- Especialización en tareas de razonamiento multi-hop y composicional, gracias a los datos de JEMHopQA.
- Capacidad de responder utilizando material de referencia incluido en el prompt (chunks de Wikipedia japonesa).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso más allá de lo implícito en las tareas de QA.
- Capacidades multilingües limitadas al japonés según la model card.
- No se documentan capacidades de visión, audio ni modo "thinking" explícito.

## Casos de uso

- Generación de respuestas en sistemas RAG en japonés: el modelo está entrenado específicamente para recibir chunks de documentación (por ejemplo, Wikipedia) y producir respuestas concisas; su tamaño reducido permite integrarlo en pipelines con latencia baja y coste de inferencia mínimo.
- Asistencia a la búsqueda documental interna: se puede desplegar como generador final en un sistema de recuperación sobre manuales o bases de conocimiento en japonés, aprovechando su ajuste sobre auto-wiki-qa.
- Preguntas multi-hop sobre dominios estructurados: su entrenamiento con JEMHopQA lo hace adecuado para preguntas que requieren combinar información de varias fuentes dentro del contexto proporcionado.
- Prototipado educativo y experimentación: sirve como ejemplo reproducible de ajuste fino con LoRA sobre un modelo pequeño, útil en cursos y talleres de LLM.
- Generación de respuestas en asistentes de documentación técnica en japonés: al ser un modelo de 0,87 B, puede ejecutarse en CPU o GPU de gama baja para tareas de respuesta extractiva.
- Evaluación de pipelines RAG: su especialización permite usarlo como baseline para medir la calidad de la generación final en sistemas de recuperación, comparándolo con modelos mayores.
- Despliegue en entornos con restricciones de recursos: al caber en GPUs de consumo y con licencia Apache 2.0, es viable en entornos edge o en servicios con presupuesto limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de ~0,87 B de parámetros, en FP16 requiere aproximadamente 1,7 GB de VRAM; en cuantización de 8 bits, alrededor de 0,9 GB; en 4 bits, alrededor de 0,5 GB (estimaciones teóricas basadas en el número de parámetros, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para FP16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son más que suficientes. También puede ejecutarse en CPU con llama.cpp u Ollama.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna (GTX 1650, RTX 3050, etc.) e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI y transformers con safetensors. No se documentan configuraciones específicas del autor.
- Latencia y throughput estimados: no disponibles. Dado el tamaño, se espera una latencia baja en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| llm2-qwen35-sft019b | ~0,87 B | No disponible | Apache 2.0 | Hugging Face (2 descargas) | Ajuste fino para RAG en japonés |
| Qwen/Qwen3.5-0.8B | ~0,87 B | No disponible | Apache 2.0 | Hugging Face | Modelo base, uso general |
| Modelos de ~1 B para QA en japonés | Variable | Variable | Variable | Variable | No se dispone de comparativas publicadas en la información proporcionada |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información disponible.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en japonés; su rendimiento en otros idiomas no está documentado y probablemente sea deficiente.
- Al ser un ajuste fino sobre un modelo base pequeño, es propenso a alucinaciones, especialmente fuera del dominio de los datos de entrenamiento (Wikipedia y QA multi-hop).
- El conjunto de entrenamiento es muy reducido (1.324 ejemplos) y de una única época, lo que limita la generalización y puede provocar sobreajuste a los formatos de prompt utilizados.
- No se documentan sesgos conocidos, pero al entrenarse con Wikipedia japonesa y datasets derivados, puede heredar sesgos de esas fuentes.
- La licencia Apache 2.0 permite uso comercial, pero los datasets de entrenamiento son CC BY-SA 4.0, lo que podría imponer obligaciones de atribución y compartir igual sobre los datos derivados; se recomienda revisar la compatibilidad para uso comercial.
- No hay información sobre la longitud de contexto efectiva ni sobre el formato exacto de prompt esperado, lo que dificulta su integración directa en producción.
- El modelo tiene un historial de uso prácticamente nulo (2 descargas, 0 likes), por lo que no ha sido validado por la comunidad.
- No se documentan mecanismos de seguridad, filtrado ni alineación adicional.

## Enlaces

- Hugging Face: https://huggingface.co/OkamotoJP/llm2-qwen35-sft019b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- JEMHopQA: https://github.com/aiishii/JEMHopQA
- auto-wiki-qa: https://huggingface.co/datasets/cl-nagoya/auto-wiki-qa
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
