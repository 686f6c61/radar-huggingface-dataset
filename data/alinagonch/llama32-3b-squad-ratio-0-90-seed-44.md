# AlinaGonch/llama32-3b-squad-ratio-0.90-seed-44

## Resumen

El modelo `AlinaGonch/llama32-3b-squad-ratio-0.90-seed-44` es un ajuste fino (fine-tuning) del modelo base `meta-llama/Llama-3.2-3B` sobre el dataset SQuAD (Stanford Question Answering Dataset), según se deduce de su nombre. La autora, AlinaGonch, ha publicado varios modelos similares con diferentes ratios y semillas, todos orientados a tareas de pregunta-respuesta extractiva. El modelo se distribuye en formato safetensors y es compatible con la librería `transformers`.

A pesar de su nombre, la información pública disponible es muy limitada: la model card es una plantilla genérica sin detalles sobre el entrenamiento, los datos utilizados o las métricas de evaluación. El repositorio ocupa solo 0,1 GB, lo que resulta inusualmente pequeño para un modelo de 3B parámetros, por lo que es posible que contenga únicamente los pesos en una cuantización muy agresiva o que esté incompleto. No se han publicado resultados de benchmarks ni especificaciones técnicas propias del ajuste.

La relevancia de este modelo radica en su potencial como especialista en extracción de respuestas a partir de contextos, partiendo de un modelo base ya capaz en tareas de lenguaje general. Sin embargo, la ausencia de documentación y validación pública limita seriamente su uso en producción sin una evaluación previa por parte del usuario.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en Llama 3.2 3B) |
| Parametros totales | 3.210.000.000 (aprox., del modelo base) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens (del modelo base) |
| Tipos de cuantizacion | no disponible (el repo no especifica; tamaño de 0,1 GB sugiere cuantización alta o pesos parciales) |
| Idiomas soportados | no disponible (el modelo base soporta 8 idiomas, pero el ajuste no especifica) |
| Licencia | no disponible (el modelo base usa Llama 3.2 Community License, pero no se confirma para este ajuste) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base `Llama-3.2-3B` es un transformer decoder-only con 3.210 millones de parámetros, entrenado por Meta con 9 billones de tokens. Emplea atención multi-cabeza convencional, normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE). Su ventana de contexto es de 128.000 tokens. El ajuste fino aquí presentado no proporciona detalles sobre el procedimiento: no se indica el número de épocas, la tasa de aprendizaje, el régimen de precisión ni la composición exacta del subconjunto de SQuAD utilizado. El nombre sugiere que se usó un 90% de los datos de entrenamiento (ratio 0.90) y una semilla aleatoria fija (44). No hay evidencia de técnicas como RLHF o DPO; probablemente sea un ajuste supervisado estándar para la tarea de pregunta-respuesta extractiva.

## Capacidades

- Generación de texto y razonamiento general, heredadas del modelo base Llama-3.2-3B.
- Especialización esperada en pregunta-respuesta extractiva sobre pasajes de texto (tipo SQuAD), aunque no hay confirmación empírica.
- Soporte de tool calling y function calling en el modelo base, pero no se ha verificado que el ajuste conserve estas capacidades.
- Capacidades multilingües del modelo base (inglés, alemán, francés, italiano, portugués, hindi, español y tailandés), pero el ajuste no documenta su comportamiento en otros idiomas.
- No se ha confirmado soporte de agentes o multi-step reasoning específico del ajuste.
- No se ha confirmado modo "thinking" ni capacidades multimodales.

## Casos de uso

- Extracción de respuestas en documentos técnicos: el modelo podría emplearse para localizar y extraer respuestas literales a preguntas concretas en manuales, informes o artículos, gracias a su entrenamiento en SQuAD.
- Construcción de sistemas de FAQ automáticos: dado un corpus de preguntas frecuentes y sus respuestas, el modelo puede identificar la respuesta correcta a una consulta del usuario.
- Asistencia en atención al cliente: integrado en un pipeline de recuperación (RAG), puede seleccionar la respuesta exacta de una base de conocimiento antes de pasarla a un modelo generativo para reformularla.
- Análisis de contratos o documentos legales: el modelo puede extraer cláusulas específicas respondiendo a preguntas como "¿Cuál es la fecha de vencimiento?".
- Evaluación de modelos de lenguaje: al ser un ajuste sobre SQuAD, puede servir como referencia para comparar otros sistemas de QA extractiva.
- Investigación académica: útil para estudiar el efecto del fine-tuning en modelos pequeños con datasets de QA, aunque la falta de documentación limita su reproducibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen métricas de exactitud (EM) o F1 sobre SQuAD ni comparaciones con otros modelos. El autor no ha proporcionado ninguna evaluación pública.

## Requisitos de hardware

- VRAM estimada para inferencia: para el modelo base Llama-3.2-3B en fp16 se necesitan aproximadamente 6,4 GB. Con cuantización 4-bit (GPTQ o AWQ) se reduce a ~2 GB. Dado el tamaño del repo (0,1 GB), es posible que los pesos ya estén cuantizados a 4-bit o incluso menos, pero no se puede confirmar.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en fp16 (p. ej., RTX 3050, RTX 4060). Para cuantización 4-bit, incluso GPUs integradas con 2 GB podrían ser suficientes.
- Sí cabe en GPUs de consumo: una RTX 3060 de 12 GB o similar puede manejarlo cómodamente.
- Opciones de despliegue: vLLM, llama.cpp, Ollama (si se convierte a GGUF), TGI (Text Generation Inference) o directamente con `transformers`.
- Latencia y throughput: no disponibles para este ajuste específico. El modelo base de 3B parámetros suele generar entre 30 y 60 tokens por segundo en una RTX 4090 con cuantización 4-bit, pero estos valores no están verificados aquí.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (SQuAD) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AlinaGonch/llama32-3b-squad-ratio-0.90-seed-44 | 3,2B | 128k | no disponible | no disponible | HuggingFace |
| meta-llama/Llama-3.2-3B | 3,2B | 128k | no aplica (modelo base) | Llama 3.2 Community | HuggingFace |
| google/gemma-2-2b-it | 2,6B | 8k | no disponible | Gemma Terms of Use | HuggingFace |
| microsoft/Phi-3.5-mini-instruct | 3,8B | 128k | no disponible | MIT | HuggingFace |

La comparativa se basa en modelos de tamaño similar, pero no hay datos de rendimiento en SQuAD para ninguno de ellos. El modelo de AlinaGonch no ofrece ventajas verificables frente a sus alternativas debido a la falta de documentación.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un ajuste de Llama-3.2-3B, hereda los sesgos del modelo base, que pueden incluir estereotipos de género, raza o religión, aunque no se han evaluado específicamente.
- Riesgo de alucinación: como todo modelo generativo, puede producir respuestas incorrectas o inventadas, especialmente si la pregunta no tiene respuesta en el contexto proporcionado.
- Limitaciones de contexto e idioma: el ajuste no documenta su comportamiento fuera del inglés, y la ventana de contexto del modelo base (128k) puede degradarse si el fine-tuning no se realizó con secuencias largas.
- Restricciones de licencia: la licencia no está especificada en el repositorio. Si el autor no ha aplicado la licencia de Llama 3.2, el uso comercial podría ser problemático. Se recomienda contactar con el autor o asumir el riesgo.
- Carencia de documentación: no hay información sobre el proceso de entrenamiento, hiperparámetros ni evaluación, lo que impide reproducir o validar el modelo.
- Tamaño del repositorio sospechosamente pequeño: 0,1 GB sugiere que el modelo podría estar incompleto o cuantizado de forma extrema, lo que afectaría a la calidad de las respuestas.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/AlinaGonch/llama32-3b-squad-ratio-0.90-seed-44)
- [Modelo base Llama-3.2-3B](https://huggingface.co/meta-llama/Llama-3.2-3B)
- [Modelo relacionado de la misma autora (ratio 0.30)](https://huggingface.co/AlinaGonch/llama32-3b-squad-ratio-0.30-r4)
- [Ollama - llama3.2:3b](https://ollama.com/library/llama3.2:3b)
- [Artificial Analysis - Leaderboard de modelos](https://artificialanalysis.ai/leaderboards/models)
- [LLM Stats - Leaderboard 2026](https://llm-stats.com/)
