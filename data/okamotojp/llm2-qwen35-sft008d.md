# OkamotoJP/llm2-qwen35-sft008d

## Resumen

llm2-qwen35-sft008d es un ajuste fino supervisado (SFT) del modelo Qwen/Qwen3.5-0.8B, desarrollado por el usuario OkamotoJP como entrega final del curso "LLM講座2 2026" (Lección 2 de LLM 2026). El modelo está especializado en la generación de respuestas para sistemas de recuperación aumentada (RAG) sobre documentación en japonés, y se distribuye con licencia Apache-2.0.

Técnicamente se trata de un transformer denso de 873.438.784 parámetros (aproximadamente 0,87 mil millones), obtenido mediante LoRA con rango 16 y alpha 32 sobre los pesos originales de Qwen3.5-0.8B, seguido de una fusión (merge) de los adaptadores en el modelo base. La estructura es idéntica a la del modelo original: solo se actualizan los pesos de la parte lingüística. El entrenamiento se realizó sobre 1.378 ejemplos durante una única época.

Su relevancia es acotada y muy específica: no compite como modelo generalista, sino que sirve como ejemplo reproducible de ajuste fino de bajo coste para tareas de respuesta extractiva y generativa sobre corpus japoneses (Wikipedia y JEMHopQA). Con una sola descarga y cero likes en el momento de la consulta, es un artefacto de investigación docente más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (arquitectura Qwen3.5; solo se actualizan los pesos de la parte lingüística) |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | Japonés (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B (revisión 2fc06364715b967f1860aea9cf38778875588b17) y aplica un ajuste fino supervisado mediante LoRA con rango r=16 y alpha=32, tasa de aprendizaje 1e-4 y una sola época sobre 1.378 ejemplos. Posteriormente, los adaptadores LoRA se fusionan en los pesos originales, por lo que el artefacto distribuido es un modelo denso estándar sin adaptadores separados y con la misma topología que el base.

Los datos de entrenamiento provienen de tres fuentes en japonés: JEMHopQA (CC BY-SA 4.0), filtrado y reformateado para entrenamiento; cl-nagoya/auto-wiki-qa (CC BY-SA 4.0), muestreado, filtrado y reformateado; y un conjunto de chunks distribuidos derivados de Wikipedia en japonés (CC BY-SA 4.0), empleados como material de contexto en los prompts de entrenamiento. No se documenta el número total de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO; la model card solo describe el SFT con LoRA.

## Capacidades

- Generación de respuestas condicionadas a contexto documental (RAG) en japonés: el modelo está específicamente entrenado para producir respuestas a partir de chunks de Wikipedia y pares pregunta-respuesta de JEMHopQA.
- Comprensión lectora y respuesta a preguntas sobre pasajes: el formato de entrenamiento incluye el contexto como material del prompt.
- Generación de texto en japonés; no se declara soporte de otros idiomas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- No se documentan capacidades de visión, audio ni modo de razonamiento (thinking mode).
- No se documentan capacidades multilingües más allá del japonés.

## Casos de uso

- Generación de respuestas en pipelines RAG sobre Wikipedia en japonés: el modelo está entrenado con chunks de Wikipedia japonesa como contexto, por lo que encaja directamente como generador final de un sistema de recuperación aumentada de bajo coste.
- Respuesta a preguntas multi-salto sobre JEMHopQA: al haberse ajustado con este benchmark, es adecuado para prototipos de QA complejo en japonés donde se requiere sintetizar información de varios pasajes.
- Evaluación de técnicas de ajuste fino en cursos y talleres: sirve como referencia reproducible de un SFT con LoRA (r=16, alpha=32, 1 época, 1.378 ejemplos) sobre un modelo de menos de mil millones de parámetros.
- Despliegue en entornos con recursos limitados: con 873 millones de parámetros, el modelo cabe en GPU de consumo y en CPU con cuantización, lo que permite prototipado local sin infraestructura dedicada.
- Generación de respuestas extractivas sobre documentación técnica interna en japonés: el formato de entrenamiento con contexto permite adaptarlo a manuales o bases de conocimiento corporativas.
- Investigación sobre calidad de respuestas en RAG con modelos pequeños: permite estudiar el equilibrio entre tamaño (0,87B), coste de inferencia y fidelidad al contexto en tareas japonesas.
- Base para experimentos de destilación o comparación con el modelo base Qwen3.5-0.8B sin ajustar, midiendo la ganancia atribuible únicamente al SFT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 1,8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 2,5 y 4 GB según longitud de contexto y batch.
- VRAM estimada en cuantización de 8 bits: en torno a 1 GB para pesos; en 4 bits, alrededor de 0,5-0,6 GB. Los valores exactos dependen del backend, ya que no se publican ficheros GGUF pre-cuantizados.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16 (RTX 3050, RTX 4060, RTX 4090); A100 y H100 son sobredimensionadas para este tamaño y solo tendrían sentido para servir muchas réplicas o batches grandes.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU consumer recientes (RTX 30xx/40xx, e incluso iGPU con suficiente memoria compartida en cuantización de 4 bits).
- Opciones de despliegue: transformers con safetensors como opción nativa; conversión a GGUF para llama.cpp u Ollama; vLLM y TGI son compatibles en teoría con arquitecturas Qwen, pero no se documenta soporte verificado para esta revisión concreta.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| OkamotoJP/llm2-qwen35-sft008d | 873.438.784 | no disponible | ja | Apache-2.0 | SFT con LoRA sobre Qwen3.5-0.8B, orientado a RAG en japonés |
| Qwen/Qwen3.5-0.8B | ~0,8B | no disponible | multilingüe (según modelo base) | Apache-2.0 | Modelo base sin ajustar; referencia directa para medir la ganancia del SFT |
| Otros ajustes SFT de Qwen3.5-0.8B para japonés | ~0,8B | no disponible | ja | variable | No se dispone de datos verificables de alternativas comparables en la información proporcionada |

La comparación con modelos de mayor tamaño (por ejemplo, la familia Qwen3.5 de 4B o 8B) no resulta pertinente por diferencia de escala; no se dispone de datos de rendimiento para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- Entrenado exclusivamente en japonés: el rendimiento en castellano u otros idiomas no está evaluado y previsiblemente será deficiente.
- Ajuste fino con solo 1.378 ejemplos y una época: riesgo elevado de sobreajuste al formato y dominio de los datasets de entrenamiento (JEMHopQA y auto-wiki-qa), con posible degradación de capacidades generales del modelo base.
- Riesgo de alucinación: al ser un modelo de 0,87B especializado en RAG, puede generar respuestas plausibles pero no sustentadas en el contexto recuperado; se recomienda validación y citación de fuentes en producción.
- Sesgos: no documentados por el autor; al derivar de Wikipedia y JEMHopQA, puede heredar sesgos de cobertura y sesgos editoriales de esas fuentes.
- Licencia Apache-2.0 en el artefacto del modelo, pero los datasets de entrenamiento son CC BY-SA 4.0; conviene revisar las obligaciones de atribución y compartir-igual si se redistribuyen derivados que incorporen esos datos.
- Sin benchmarks publicados ni métricas de evaluación: no hay evidencia cuantitativa de mejora frente al modelo base.
- Modelo con 1 descarga y 0 likes: no ha sido validado por la comunidad; su uso en producción requiere evaluación propia.
- No se documenta la longitud de contexto efectiva ni el soporte de tool calling, lo que limita su uso en pipelines de agentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OkamotoJP/llm2-qwen35-sft008d
- Modelo base Qwen/Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset JEMHopQA: https://github.com/aiishii/JEMHopQA
- Dataset cl-nagoya/auto-wiki-qa: https://huggingface.co/datasets/cl-nagoya/auto-wiki-qa
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
