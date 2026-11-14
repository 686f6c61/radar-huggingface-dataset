# OkamotoJP/llm2-qwen35-sft008c

## Resumen

llm2-qwen35-sft008c es un ajuste fino supervisado (SFT) del modelo Qwen/Qwen3.5-0.8B, desarrollado por OkamotoJP como trabajo final del curso "LLM講座2 2026". El modelo se ha entrenado mediante LoRA (r=16, alpha=32) sobre 1.378 ejemplos y posteriormente se han fusionado los pesos adaptadores con los del modelo base, por lo que la arquitectura resultante es idéntica a la del Qwen3.5-0.8B original. Su propósito concreto es la generación de respuestas en pipelines de RAG (retrieval-augmented generation) en japonés.

El modelo cuenta con 873.438.784 parámetros (aproximadamente 0,87 mil millones) y está especializado en tareas de question answering sobre contexto documental. Los datos de entrenamiento provienen de JEMHopQA y cl-nagoya/auto-wiki-qa, ambos derivados de Wikipedia en japonés y con licencia CC BY-SA 4.0, lo que lo orienta a la respuesta de preguntas de múltiples saltos y a la síntesis de información a partir de fragmentos recuperados.

Su relevancia es limitada pero específica: se trata de un modelo pequeño, con licencia Apache-2.0 y formato safetensors, pensado para entornos con recursos de hardware reducidos y para el idioma japonés exclusivamente. No está diseñado como modelo de propósito general, sino como componente de generación dentro de una arquitectura RAG concreta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5), pesos del modelo base con LoRA fusionado |
| Parámetros totales | 873.438.784 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (repo en safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | Japonés (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B (revisión 2fc06364715b967f1860aea9cf38778875588b17) y aplica un ajuste fino supervisado con LoRA de rango 16 y alpha 32, tasa de aprendizaje 0,0001 y una sola época sobre 1.378 ejemplos. Tras el entrenamiento, los adaptadores se fusionan con los pesos originales, de modo que la estructura de la red es exactamente la del modelo base y solo se han actualizado los pesos de la parte lingüística. No se ha aplicado RLHF ni DPO, y no se documentan innovaciones arquitectónicas propias.

El corpus de entrenamiento combina JEMHopQA (preguntas de múltiples saltos, filtradas y reformateadas), cl-nagoya/auto-wiki-qa (muestreado, filtrado y reformateado) y un conjunto de fragmentos distribuidos derivados de Wikipedia en japonés, empleados como material de contexto en los prompts de entrenamiento. Todos los conjuntos de datos tienen licencia CC BY-SA 4.0. El objetivo declarado es la generación de respuestas en un sistema RAG, por lo que el modelo está optimizado para condicionarse sobre documentos recuperados y producir respuestas concisas en japonés.

## Capacidades

- Generación de texto en japonés condicionada a contexto documental (RAG).
- Question answering sobre fragmentos recuperados, incluido razonamiento de múltiples saltos (por el uso de JEMHopQA).
- Síntesis de información procedente de varios pasajes de Wikipedia en japonés.
- Formato de instrucción conversacional heredado del modelo base Qwen3.5-0.8B.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso autónomo más allá del QA.
- No se documenta capacidad de visión, audio ni modo de razonamiento explícito (thinking mode).
- Capacidad multilingüe no disponible: la model card solo declara japonés.

## Casos de uso

- Generación de respuestas en un pipeline RAG en japonés: el modelo recibe los fragmentos recuperados como contexto y produce la respuesta final; es su propósito declarado y el escenario para el que fue entrenado.
- Asistente de consulta sobre Wikipedia japonesa: dado un conjunto de pasajes, responde preguntas factuales y de múltiples saltos, aprovechando el entrenamiento con JEMHopQA.
- Base para prototipos académicos y trabajos de curso: su tamaño reducido y licencia Apache-2.0 permiten experimentar con ajuste fino y evaluación sin costes de infraestructura elevados.
- Despliegue en entornos con recursos limitados: con menos de 1.000 millones de parámetros, puede ejecutarse en una única GPU de consumo o incluso en CPU con cuantización, aunque no se publican pesos cuantizados.
- Componente de generación en sistemas de búsqueda documental interna: integrado como paso final de un pipeline de recuperación y reordenación sobre corpus en japonés.
- Evaluación comparativa de estrategias de SFT: al estar entrenado con un conjunto pequeño y bien documentado (1.378 ejemplos, LoRA r=16), sirve como referencia para estudiar el efecto del ajuste fino ligero en modelos pequeños.
- Filtrado y resumen de pasajes recuperados: puede reformular o condensar fragmentos de contexto antes de presentarlos al usuario en aplicaciones de consulta documental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 1,8 GB solo para pesos, más overhead de activaciones y caché KV (estimación orientativa, no publicada por el autor).
- En cuantización de 8 bits cabría en GPUs con 2-3 GB de VRAM; en 4 bits, en torno a 1-1,5 GB (estimación, no hay pesos cuantizados publicados).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16 (RTX 3050, RTX 4060, T4); A100 y H100 no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 4 GB o más de VRAM.
- Opciones de despliegue: transformers (formato safetensors nativo); vLLM, llama.cpp, Ollama y TGI son compatibles en principio con la arquitectura Qwen3.5, pero no se documenta ninguna integración específica para este checkpoint.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| llm2-qwen35-sft008c | 873 M | No disponible | Japonés | Apache-2.0 | SFT para RAG en japonés |
| Qwen/Qwen3.5-0.8B | ~800 M (base) | No disponible | Multilingüe (según modelo base) | Apache-2.0 | Modelo base de propósito general |
| cl-nagoya/auto-wiki-qa (dataset) | No aplica | No aplica | Japonés | CC BY-SA 4.0 | Conjunto de datos, no modelo |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: entrenado únicamente para generación de respuestas en RAG en japonés; su rendimiento fuera de ese dominio no está documentado y probablemente sea inferior al del modelo base.
- Idioma: solo se declara soporte de japonés; el comportamiento en castellano u otros idiomas no está evaluado.
- Riesgo de alucinación: como todo modelo generativo pequeño, puede inventar datos cuando el contexto recuperado es insuficiente o contradictorio; no se documentan mecanismos de abstención.
- Sesgos: los datos provienen de Wikipedia en japonés y de conjuntos derivados, por lo que hereda los sesgos de cobertura y redacción de esas fuentes.
- Licencia: Apache-2.0 permite uso comercial, pero los datos de entrenamiento son CC BY-SA 4.0; conviene revisar las obligaciones de atribución y compartir-igual que puedan derivarse del uso de esos corpus.
- Sin benchmarks publicados: no hay métricas objetivas de calidad que permitan validar su rendimiento en producción.
- Contexto máximo no documentado: se desconoce la ventana efectiva, lo que dificulta dimensionar los pipelines RAG que lo integren.
- Madurez: modelo creado en noviembre de 2026 con 2 descargas y 0 likes; no hay evidencia de uso en producción ni de mantenimiento posterior.

## Enlaces

- Hugging Face: https://huggingface.co/OkamotoJP/llm2-qwen35-sft008c
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset JEMHopQA: https://github.com/aiishii/JEMHopQA
- Dataset auto-wiki-qa: https://huggingface.co/datasets/cl-nagoya/auto-wiki-qa
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
