# samyhaff/gemma-4-e2b-it-distill-ed

## Resumen

gemma-4-e2b-it-distill-ed es un modelo de desambiguación de entidades (entity disambiguation, ED) desarrollado por Samy Haffoudhi (usuario samyhaff en Hugging Face) y presentado en el artículo "When Does Reasoning Help Entity Disambiguation? Small LLMs In-Domain and Under Shift" (Findings de EACL 2027). Se trata de un ajuste fino mediante LoRA fusionado sobre google/gemma-4-E2B-it, destilado de forma off-policy desde gemma-4-26B-A4B-it sobre el conjunto de datos ZELDA. El modelo recibe una mención marcada en su contexto y una lista numerada de candidatos, razona sobre ellos y responde con el índice del candidato elegido.

La relevancia del modelo radica en su enfoque: demuestra que un modelo pequeño (5.123 millones de parámetros) puede abordar la desambiguación de entidades con razonamiento explícito, alcanzando un 79,6 de accuracy en ZELDA y un 78,2 de accuracy normalizada en ZESHEL en condiciones de verdadero zero-shot. Esto lo sitúa como una alternativa eficiente frente a modelos de mayor tamaño para tareas de resolución de entidades en pipelines de procesamiento de lenguaje natural.

El modelo se distribuye con licencia Apache 2.0, está implementado en transformers con pesos en safetensors y se integra con vLLM para inferencia. Su diseño está orientado específicamente a la tarea de entity linking/disambiguation, no como un modelo de propósito general, aunque hereda las capacidades conversacionales y de razonamiento de la familia Gemma 4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4), ajuste LoRA fusionado sobre google/gemma-4-E2B-it |
| Parametros totales | 5.123.178.051 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; se puede cuantizar con herramientas estándar, pero no se documenta) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-E2B-it, un transformer de la familia Gemma 4 con 5.123 millones de parámetros. Sobre esta base se aplicó un ajuste fino mediante LoRA que posteriormente se fusionó en los pesos finales. El entrenamiento consistió en destilación off-policy desde un modelo mayor, gemma-4-26B-A4B-it, sobre el conjunto de datos ZELDA. Este proceso busca transferir la capacidad de razonamiento del modelo profesor al modelo pequeño en la tarea específica de desambiguación de entidades.

La innovación principal no está en la arquitectura sino en el paradigma de entrenamiento y uso: el modelo está diseñado para razonar explícitamente antes de emitir una respuesta, y la inferencia recomendada implica generar 10 completaciones y tomar la votación mayoritaria (majority vote) para estabilizar la predicción. El prompt espera la mención marcada entre corchetes y los candidatos numerados, y la salida debe terminar con el formato `"answer": <índice>`. No se documentan detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO adicionales.

## Capacidades

- Desambiguación de entidades en contexto: identifica la entidad correcta entre una lista de candidatos numerados a partir de una mención marcada y su contexto narrativo.
- Razonamiento explícito: el modelo genera una cadena de razonamiento antes de emitir la respuesta final, lo que permite auditar el proceso de decisión.
- Generación de texto conversacional: hereda las capacidades de la familia Gemma 4 para generación de texto y conversación multi-turno.
- Soporte de modo thinking: la inferencia recomendada utiliza `enable_thinking: True` en el chat template.
- Integración con vLLM: el ejemplo de uso proporcionado emplea vLLM con `SamplingParams` y generación de múltiples completaciones.
- Capacidades multilingües: no disponibles (no se documentan idiomas soportados).
- Tool calling / function calling: no disponible (no se documenta).
- Soporte de agentes y multi-step reasoning: no disponible de forma explícita, aunque el razonamiento previo a la respuesta es parte del diseño.
- Visión: no disponible (aunque los tags incluyen image-text-to-text, la model card no describe capacidades de visión).

## Casos de uso

- Desambiguación de entidades en pipelines de NLP: el modelo se integra como etapa final de un pipeline de entity linking, recibiendo los candidatos previamente recuperados (por ejemplo, los top 10 de qwen3-4b-reranker-ed) y seleccionando el correcto mediante razonamiento y votación mayoritaria.
- Enriquecimiento de bases de conocimiento: dado un texto con menciones ambiguas, el modelo resuelve a qué entidad del grafo de conocimiento se refiere cada mención, facilitando la construcción y mantenimiento de KBs.
- Procesamiento de noticias y documentos: en artículos periodísticos donde nombres propios pueden referirse a personas, lugares u organizaciones distintas, el modelo usa el contexto narrativo completo para desambiguar.
- Atención al cliente con resolución de entidades: en conversaciones multi-turno, el modelo puede identificar a qué producto, persona o entidad se refiere el usuario cuando hay ambigüedad, aunque su especialización es la ED y no el diálogo general.
- Búsqueda y recuperación de información: mejora la precisión de motores de búsqueda interna al resolver menciones ambiguas antes de la consulta al índice.
- Investigación académica en NLP: sirve como modelo de referencia para estudiar cuándo el razonamiento ayuda en tareas de ED, especialmente en dominios in-domain y bajo distribution shift, tal como se documenta en el paper.
- Moderación de contenido y análisis de redes sociales: identifica entidades mencionadas en publicaciones cortas y ambiguas, donde el contexto es limitado y los candidatos numerosos.

## Benchmarks y rendimiento

| Benchmark | Métrica | Resultado |
|---|---|---|
| ZELDA | Accuracy | 79,6 |
| ZESHEL (true zero-shot) | Accuracy normalizada | 78,2 |

No se han publicado en la información disponible resultados comparativos con otros modelos en MMLU, HumanEval, GSM8K ni otros benchmarks generales.

## Requisitos de hardware

- VRAM estimada para inferencia: con 5.123 millones de parámetros en safetensors (10,3 GB de repo), en FP16 requiere aproximadamente 10-11 GB de VRAM; en cuantización de 8 bits, unos 5-6 GB; en 4 bits, unos 3-4 GB (estimaciones orientativas, no documentadas por el autor).
- GPU recomendadas: el ejemplo oficial usa vLLM, por lo que se recomiendan GPUs con al menos 16 GB de VRAM para FP16 (RTX 4090, A100, H100). Para cuantización 4/8 bits, GPUs consumer como RTX 3060/4060 con 8-12 GB podrían ser suficientes.
- Cabe en GPU consumer: sí, especialmente con cuantización. En FP16 requiere GPUs de gama alta consumer (RTX 4090) o profesional.
- Opciones de despliegue: vLLM (documentado en el ejemplo oficial), transformers (librería indicada), llama.cpp y Ollama no están documentados pero serían viables con conversión a GGUF; TGI no documentado.
- Latencia y throughput estimados: no disponibles. La inferencia recomendada genera 10 completaciones con `max_tokens: 2048` y votación mayoritaria, lo que multiplica el coste por 10 respecto a una generación única.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Especialización | Disponibilidad |
|---|---|---|---|---|---|
| samyhaff/gemma-4-e2b-it-distill-ed | 5.123 M | no disponible | apache-2.0 | Entity disambiguation con razonamiento | Hugging Face |
| google/gemma-4-E2B-it (base) | 5.123 M | no disponible | no disponible en la información | Propósito general | Hugging Face |
| samyhaff/qwen3-4b-reranker-ed | no disponible | no disponible | no disponible | Reranking de candidatos para ED | Hugging Face |
| gemma-4-26B-A4B-it (profesor) | no disponible | no disponible | no disponible | Propósito general (profesor en destilación) | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada, salvo los resultados del modelo en ZELDA y ZESHEL.

## Limitaciones y advertencias

- Especialización estrecha: el modelo está entrenado específicamente para desambiguación de entidades con un formato de prompt concreto (mención entre corchetes y candidatos numerados); su uso fuera de este formato puede degradar el rendimiento.
- Dependencia de la votación mayoritaria: la inferencia recomendada requiere 10 completaciones y votación, lo que multiplica el coste computacional y la latencia.
- Riesgo de alucinación: como todo modelo generativo, puede producir índices de respuesta inválidos o fuera de rango; el código de ejemplo filtra respuestas fuera del rango de candidatos.
- Sesgos conocidos: no documentados en la información disponible, pero heredados potencialmente del modelo base y del dataset ZELDA.
- Limitaciones de idioma: no se documentan los idiomas soportados; el entrenamiento se realizó sobre ZELDA, cuyo idioma principal no se especifica en la información disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base google/gemma-4-E2B-it, cuya licencia no se detalla en la información proporcionada.
- Contexto: no se documenta la longitud máxima de contexto, lo que es relevante para textos largos con múltiples menciones.
- Madurez: el modelo tiene 298 descargas y 1 like en el momento de la ficha, lo que indica adopción limitada y poca validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/samyhaff/gemma-4-e2b-it-distill-ed
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Modelo reranker asociado: https://huggingface.co/samyhaff/qwen3-4b-reranker-ed
- Repositorio del pipeline y evaluación: https://github.com/samyhaff/ed-study
- Paper (arXiv): https://arxiv.org/abs/2611.30334
