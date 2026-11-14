# OkamotoJP/llm2-qwen35-sft009

## Resumen

`OkamotoJP/llm2-qwen35-sft009` es un ajuste fino supervisado (SFT) del modelo base Qwen/Qwen3.5-0.8B, desarrollado por el usuario OkamotoJP como entrega final del curso "LLM講座2 2026". El modelo está especializado en la generación de respuestas para sistemas de generación aumentada por recuperación (RAG) en japonés, y se ha entrenado mediante LoRA sobre el modelo original, fusionando después los pesos adaptados con los originales.

Arquitectura y estructura son idénticas a las del modelo base Qwen3.5-0.8B: solo se han actualizado los pesos de la parte lingüística. Con 873.438.784 parámetros (aproximadamente 0,87 mil millones), es un modelo compacto orientado a tareas de respuesta sobre contextos documentales recuperados, no a razonamiento general ni a generación creativa.

Su relevancia es limitada y muy específica: se trata de un experimento académico con 1 descarga y 0 likes en el momento de la consulta, pensado para un pipeline RAG concreto sobre documentación en japonés. No obstante, su licencia Apache-2.0 y su reducido tamaño lo hacen fácilmente reproducible y desplegable en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5), estructura idéntica al modelo base |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | japonés (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B (revisión `2fc06364715b967f1860aea9cf38778875588b17`) y aplica un ajuste fino supervisado con LoRA de rango 16 y alpha 32, tasa de aprendizaje 1e-4, una época y 1.600 ejemplos de entrenamiento. Posteriormente, los pesos LoRA se fusionan con los pesos originales, de modo que la arquitectura resultante es exactamente la del modelo base; solo se actualizan los pesos de la parte lingüística.

Los datos de entrenamiento provienen de tres fuentes, todas bajo licencia CC BY-SA 4.0: JEMHopQA (filtrado y reformateado), `cl-nagoya/auto-wiki-qa` (muestreado, filtrado y reformateado) y un conjunto de chunks distribuidos derivados de Wikipedia en japonés, empleados como material de contexto en los prompts de entrenamiento. No se documenta el número total de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO; el proceso descrito es exclusivamente SFT.

## Capacidades

- Generación de respuestas en japonés condicionadas a un contexto documental recuperado (caso de uso central del ajuste).
- Respuesta a preguntas sobre documentación tipo Wikipedia en japonés, incluyendo preguntas multi-hop del estilo JEMHopQA.
- Capacidad de generación de texto general heredada del modelo base Qwen3.5-0.8B, aunque no reforzada por el ajuste.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al japonés según la model card; el resto de idiomas no se documenta.
- Capacidades especiales (thinking mode, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Generación de respuestas en un pipeline RAG en japonés: el modelo recibe los chunks recuperados (procedentes de Wikipedia o documentación similar) y produce la respuesta final. Es exactamente la tarea para la que fue entrenado y la que mejor se ajusta a su distribución de datos.
- Preguntas multi-hop sobre bases de conocimiento japonesas: el ajuste con JEMHopQA lo hace adecuado para preguntas que requieren combinar información de varios pasajes recuperados.
- Asistente documental interno en japonés: desplegado sobre una base de documentos propia, puede responder consultas de empleados con contexto recuperado, siempre que el formato de prompt respete el usado en el entrenamiento.
- Prototipado rápido de sistemas RAG en hardware de consumo: con menos de 1.000 millones de parámetros, cabe en GPUs de gama media y permite iterar sobre el pipeline de recuperación sin grandes costes de inferencia.
- Evaluación comparativa de estrategias de recuperación: al ser un modelo pequeño y determinista en su tarea, sirve como componente fijo para medir el impacto de cambios en el retriever (chunking, embeddings, reranking).
- Filtrado y resumen de pasajes recuperados: puede condensar contextos largos de Wikipedia japonesa en respuestas breves antes de pasarlos a un modelo mayor en una arquitectura en cascada.
- Experimentación académica y reproducción de recetas SFT: su configuración LoRA (r=16, alpha=32, lr=1e-4, 1 época, 1.600 ejemplos) es un punto de partida documentado para estudiar el efecto del ajuste fino en modelos sub-1B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp32): aproximadamente 3,5 GB solo para pesos, más overhead de activaciones y caché KV.
- VRAM estimada en fp16/bf16: aproximadamente 1,8 GB para pesos; el tamaño del repositorio (1,8 GB) es coherente con esta cifra.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,9 GB; en 4 bits, alrededor de 0,5 GB (estimaciones teóricas, no verificadas con artefactos publicados).
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM en fp16 (RTX 3050, RTX 4060, RTX 3060). Para mayor throughput, A10G, L4 o A100.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPUs dedicadas modernas, e incluso en algunas integradas con suficiente memoria compartida.
- Opciones de despliegue: transformers (formato safetensors nativo), vLLM y TGI (compatibles con arquitecturas Qwen), llama.cpp u Ollama si se generan conversiones GGUF (no publicadas en el repositorio).
- Latencia y throughput estimados: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| OkamotoJP/llm2-qwen35-sft009 | 873 M | no disponible | ja | Apache-2.0 | SFT específico para RAG en japonés |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B | no disponible | multilingüe (no detallado) | Apache-2.0 | Modelo base sin ajuste; capacidades generales |
| cl-nagoya/auto-wiki-qa (dataset) | no aplica | no aplica | ja | CC BY-SA 4.0 | Fuente de datos, no modelo comparable |

No se dispone de información sobre benchmarks ni sobre otros modelos ajustados comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Modelo experimental académico: 1 descarga y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni validación externa.
- Especialización estrecha: entrenado únicamente para generación de respuestas RAG en japonés; su rendimiento en otras tareas (código, matemáticas, razonamiento general) no está documentado y probablemente sea inferior al del modelo base.
- Riesgo de alucinación: como todo modelo generativo de 0,8 B, puede inventar información no presente en el contexto recuperado, especialmente si el contexto es ambiguo o incompleto.
- Limitación de idioma: la model card declara solo japonés; el comportamiento en castellano u otros idiomas no está evaluado.
- Longitud de contexto no documentada: no se especifica la ventana máxima, lo que impide planificar el tamaño de los chunks recuperados con garantías.
- Licencia del modelo Apache-2.0, pero los datos de entrenamiento son CC BY-SA 4.0 (JEMHopQA, auto-wiki-qa, Wikipedia japonesa); conviene revisar las obligaciones de atribución y compartir-igual si se redistribuye el modelo o derivados en contextos que lo requieran.
- Sin artefactos de cuantización publicados (GGUF, AWQ, GPTQ): el despliegue en llama.cpp u Ollama requiere conversión propia.
- Sin datos de benchmarks: no es posible comparar su calidad objetivamente con alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OkamotoJP/llm2-qwen35-sft009
- Modelo base Qwen/Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset JEMHopQA: https://github.com/aiishii/JEMHopQA
- Dataset cl-nagoya/auto-wiki-qa: https://huggingface.co/datasets/cl-nagoya/auto-wiki-qa
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
