# OkamotoJP/llm2-qwen35-sft026

## Resumen

llm2-qwen35-sft026 es un ajuste fino supervisado (SFT) del modelo Qwen/Qwen3.5-0.8B, desarrollado por el usuario OkamotoJP en el contexto del curso "LLM講座2 2026" (LLM Course 2, 2026). El modelo está diseñado específicamente como generador de respuestas para un sistema de generación aumentada por recuperación (RAG), y su propósito declarado es responder preguntas a partir de documentos recuperados en japonés.

Técnicamente, se trata de un fine-tuning con LoRA (r=16, alpha=32) fusionado en los pesos originales del modelo base. Solo se actualizaron los pesos de la parte lingüística; la arquitectura subyacente es idéntica a la de Qwen3.5-0.8B. El modelo tiene 873.438.784 parámetros (aproximadamente 0,87 mil millones), lo que lo sitúa en la gama ultraligera, apta para inferencia en hardware de consumo.

Su relevancia es limitada y muy específica: no es un modelo de propósito general, sino un artefacto académico orientado a una tarea concreta (respuesta generativa sobre contexto recuperado en japonés). Resulta útil como referencia para quienes estudian pipelines RAG con modelos pequeños en japonés, pero no está pensado para uso general ni para producción a gran escala.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-0.8B; solo se actualizó la parte lingüística) |
| Parámetros totales | 873.438.784 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (los pesos se distribuyen en safetensors; se asume compatibilidad con cuantizaciones estándar, pero no se documenta) |
| Idiomas soportados | Japonés (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del transformer de Qwen3.5-0.8B. Según la model card, se aplicó un ajuste fino con LoRA de rango 16 y alpha 32, con una tasa de aprendizaje de 0,0001, una sola época y 1.143 ejemplos de entrenamiento. Los adaptadores LoRA se fusionaron posteriormente en los pesos originales, de modo que la estructura final es idéntica a la del modelo base y solo difieren los pesos de la parte lingüística.

Los datos de entrenamiento provienen de tres fuentes principales: JEMHopQA (CC BY-SA 4.0), filtrado y reformateado; cl-nagoya/auto-wiki-qa (CC BY-SA 4.0), muestreado, filtrado y reformateado; y un conjunto de fragmentos derivados de Wikipedia en japonés (CC BY-SA 4.0), utilizado como material de contexto en los prompts de entrenamiento. El desglose de los 1.143 ejemplos es: 443 de auto_wiki_qa, 369 de jemhopqa_train_sft/compositional, 267 de jemhopqa_train_ev/compositional y 64 de synth_compo/compositional. No se documenta el uso de RLHF, DPO ni ninguna innovación arquitectónica adicional; el entrenamiento es un SFT estándar orientado a la generación de respuestas condicionadas a contexto.

## Capacidades

- Generación de texto en japonés condicionada a contexto documental (RAG): el modelo está entrenado para producir respuestas a partir de fragmentos recuperados.
- Respuesta a preguntas de tipo composicional y de múltiples saltos, dado que parte de los datos de entrenamiento provienen de JEMHopQA (preguntas multi-hop).
- Generación de respuestas sobre contenido de Wikipedia en japonés, gracias al uso de fragmentos de Wikipedia como contexto de entrenamiento.
- Capacidad multilingüe: limitada al japonés según la model card (language: ja); no se documentan otras lenguas.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad documentada; el modelo está orientado a una única pasada de generación de respuesta.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Generación de respuestas en un pipeline RAG en japonés: el modelo recibe los fragmentos recuperados y genera la respuesta final; es su propósito declarado y para lo que fue entrenado.
- Preguntas multi-hop sobre documentación corporativa en japonés: al haberse entrenado con JEMHopQA, puede combinar información de varios fragmentos para responder preguntas que requieren composición de hechos.
- Asistente de consulta sobre Wikipedia japonesa: el uso de fragmentos de Wikipedia como contexto de entrenamiento lo hace adecuado para responder preguntas basadas en ese corpus.
- Prototipado académico de sistemas RAG: su tamaño reducido (0,87 mil millones de parámetros) permite iterar rápidamente en entornos con recursos limitados.
- Evaluación comparativa de estrategias de recuperación: al ser un generador pequeño y especializado, sirve como componente controlado para medir el impacto de distintas configuraciones de retrieval.
- Despliegue en entornos con restricciones de hardware: al caber en GPU de consumo, puede ejecutarse en estaciones de trabajo locales para demostraciones de RAG en japonés.
- Generación de respuestas extractivas o semiextractivas sobre documentación técnica en japonés: útil cuando se necesita una respuesta breve y anclada al contexto recuperado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 873 millones de parámetros, en fp16 se requieren aproximadamente 1,7 GB solo para los pesos; en cuantización de 8 bits, alrededor de 0,9 GB; en 4 bits, alrededor de 0,5 GB. Estas cifras son estimaciones a partir del número de parámetros, no datos publicados por el autor.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16 con margen para el contexto; una RTX 3060, RTX 4060 o superior es suficiente.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU consumer modernas (RTX 3060 en adelante, e incluso GPUs integradas con suficiente memoria compartida en cuantización de 4 bits).
- Opciones de despliegue: al ser un modelo con pesos safetensors compatible con la arquitectura Qwen3.5, puede servirse con frameworks estándar como vLLM, TGI o llama.cpp (previa conversión a GGUF), así como con Ollama si se genera el manifiesto correspondiente. El autor no documenta ninguna opción de despliegue concreta.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| llm2-qwen35-sft026 | 873 M | No disponible | Apache-2.0 | SFT para RAG en japonés |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B | No disponible | Apache-2.0 | Modelo base de propósito general |
| cl-nagoya/auto-wiki-qa (dataset) | No aplica | No aplica | CC BY-SA 4.0 | Corpus de entrenamiento, no modelo |
| Modelos japoneses pequeños de la familia Qwen | ~0,5-1 B | Variable | Apache-2.0 en la familia Qwen | Propósito general en japonés |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada; la comparativa se limita a parámetros, licencia y enfoque.

## Limitaciones y advertencias

- El modelo está especializado en generación de respuestas RAG en japonés; su rendimiento fuera de ese dominio (charla general, código, matemáticas) no está documentado y probablemente sea limitado.
- Sesgos conocidos: no documentados por el autor; al entrenarse con Wikipedia en japonés y JEMHopQA, puede heredar los sesgos de esas fuentes.
- Riesgo de alucinación: presente, como en cualquier modelo generativo; el entrenamiento con contexto no elimina la posibilidad de generar afirmaciones no respaldadas por los fragmentos recuperados.
- Limitaciones de idioma: la model card declara únicamente japonés; no se garantiza un comportamiento correcto en otros idiomas.
- Restricciones de licencia: el modelo se distribuye bajo Apache-2.0, pero los datos de entrenamiento son CC BY-SA 4.0, lo que puede imponer obligaciones de atribución y compartir-al-igual sobre las obras derivadas de esos datos; conviene revisar la compatibilidad antes de un uso comercial.
- El conjunto de entrenamiento es muy reducido (1.143 ejemplos) y de una sola época, lo que limita la generalización y aumenta el riesgo de sobreajuste al formato de prompt utilizado.
- No hay información sobre la longitud de contexto efectiva ni sobre el formato exacto de prompt esperado, lo que dificulta su integración en producción sin experimentación previa.
- Es un artefacto académico con cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso en producción ni de validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OkamotoJP/llm2-qwen35-sft026
- Modelo base Qwen/Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset JEMHopQA: https://github.com/aiishii/JEMHopQA
- Dataset cl-nagoya/auto-wiki-qa: https://huggingface.co/datasets/cl-nagoya/auto-wiki-qa
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
