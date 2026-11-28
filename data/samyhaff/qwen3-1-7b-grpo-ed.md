# samyhaff/qwen3-1.7b-grpo-ed

## Resumen

qwen3-1.7b-grpo-ed es un modelo de lenguaje especializado en desambiguación de entidades (entity disambiguation, ED), desarrollado por Samy Haffoudhi en el contexto del artículo "When Does Reasoning Help Entity Disambiguation? Small LLMs In-Domain and Under Shift" (Findings of EACL 2027). Se construye a partir de Qwen/Qwen3-1.7B, un transformer denso de 1.720.574.976 parámetros, afinado mediante LoRA (posteriormente fusionado) y entrenado con aprendizaje por refuerzo con verificación (RLVR) usando el algoritmo GRPO sobre el conjunto de datos ZELDA.

El problema que resuelve es concreto: dada una mención marcada en un texto y una lista corta de entidades candidatas numeradas, el modelo razona y devuelve el índice de la entidad correcta. Frente a enfoques de clasificación directa, incorpora un modo de razonamiento (thinking) que permite al modelo explicitar el proceso antes de emitir la respuesta, algo relevante para evaluar cuándo el razonamiento aporta valor real en tareas de ED y cuándo no.

Su relevancia actual radica en dos factores: por un lado, demuestra que un modelo pequeño de 1,7 mil millones de parámetros puede alcanzar un 79,8 % de precisión en ZELDA y un 72,4 % de precisión normalizada en ZESHEL en régimen de zero-shot verdadero, lo que lo hace viable en hardware de consumo; por otro, publica una receta reproducible (GRPO con recompensa por selección correcta de candidato) y un pipeline completo de evaluación abierto en GitHub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-1.7B) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; el ejemplo de uso emplea vLLM) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer denso de tipo decoder-only con 1.720.574.976 parámetros. Sobre esa base se aplicó un ajuste fino con LoRA que posteriormente se fusionó en los pesos finales, seguido de entrenamiento con RLVR mediante GRPO (Group Relative Policy Optimization) sobre el conjunto de datos ZELDA. La función de recompensa premia la selección del candidato correcto, lo que orienta al modelo a producir razonamientos que culminan en la respuesta correcta en lugar de imitar trayectorias de razonamiento supervisadas.

La innovación técnica destacable es el uso de RLVR con GRPO para una tarea estructurada de desambiguación con lista de candidatos, combinado con un modo de razonamiento explícito (`enable_thinking`). El modelo está diseñado para ser muestreado múltiples veces (se recomiendan 10 completions) y agregado por voto mayoritario, lo que aprovecha la varianza del muestreo para mejorar la precisión final. No se dispone de información sobre el número de tokens de entrenamiento ni sobre la composición detallada del dataset más allá de ZELDA.

## Capacidades

- Desambiguación de entidades: dado un texto con una mención entre corchetes y una lista numerada de candidatos con descripciones, devuelve el índice de la entidad correcta en el campo `"answer"`.
- Razonamiento explícito: soporta modo thinking (`enable_thinking=True`), generando una cadena de razonamiento antes de la respuesta final.
- Formato de salida estructurado: emite `"answer": <índice>`, parseable con expresiones regulares.
- Agregación por voto mayoritario: el diseño espera múltiples muestras (n=10) y selección de la moda.
- Conversacional: soporta el formato de chat con roles system/user mediante el chat template de Qwen3.
- Integración con vLLM: el ejemplo oficial usa `vllm.LLM` y `SamplingParams` con `get_diff_sampling_param()`.
- No se documentan capacidades de tool calling, agentes, visión, audio ni multilingüismo específico en la información disponible.

## Casos de uso

- Desambiguación de entidades en pipelines de extracción de información: el modelo recibe el texto y la lista de candidatos generada por un reranker (en el paper, el top 10 de qwen3-4b-reranker-ed) y devuelve el índice correcto, integrándose como etapa final de un sistema de entity linking.
- Enlazado de entidades en bases de conocimiento: para poblar o mantener wikis corporativas o grafos de conocimiento, el modelo resuelve menciones ambiguas (por ejemplo, "Jordan" como país, persona o río) apoyándose en el contexto narrativo completo.
- Normalización de menciones en corpus periodísticos o científicos: con contexto largo en el prompt de entrada, el modelo puede desambiguar nombres propios recurrentes en artículos, informes o transcripciones.
- Evaluación de razonamiento en modelos pequeños: sirve como banco de pruebas reproducible para estudiar cuándo el thinking mode ayuda y cuándo perjudica, gracias a su receta GRPO abierta y a los conjuntos ZELDA y ZESHEL.
- Investigación en RLVR: al estar entrenado con GRPO y recompensa por acierto, es una referencia para experimentos de refuerzo con verificación en tareas estructuradas de NLP.
- Despliegue en hardware de consumo: con 1,7 mil millones de parámetros y licencia Apache 2.0, puede ejecutarse en GPUs de gama media para prototipos de desambiguación en local o en el borde.
- Generación de datos de entrenamiento: el pipeline de muestreo múltiple con voto mayoritario puede emplearse para etiquetar automáticamente menciones en corpus no anotados con alta cobertura.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| ZELDA | Precisión (acc.) | 79,8 |
| ZESHEL | Precisión normalizada (zero-shot verdadero) | 72,4 |

No se han publicado en la información disponible resultados adicionales de benchmarks (MMLU, HumanEval, GSM8K u otros) ni comparaciones numéricas con modelos alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3,5 GB solo para pesos, más overhead de KV cache y activaciones; en la práctica, entre 4 y 6 GB según longitud de contexto y batch.
- Cuantización: no se documentan tipos oficiales, pero al ser un modelo transformers estándar es compatible con cuantizaciones habituales (por ejemplo, 4 bits) mediante herramientas de la comunidad, lo que reduciría el requisito a unos 1-2 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 (RTX 3060/4060 en adelante); A100 o H100 para despliegues de alto throughput; el ejemplo oficial usa vLLM, que escala mejor en GPUs de datacenter.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en precisión completa y en 4-6 GB con cuantización.
- Opciones de despliegue: vLLM (documentado en la model card), transformers, y previsiblemente llama.cpp/Ollama/TGI mediante conversión, aunque no se documentan explícitamente.
- Latencia y throughput: no disponibles. El modo thinking y el muestreo de 10 completions incrementan el coste por consulta de forma significativa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| samyhaff/qwen3-1.7b-grpo-ed | 1,72 B | no disponible | Desambiguación de entidades con razonamiento | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-1.7B (base) | 1,72 B | no disponible | Generación de texto general | Apache 2.0 | Hugging Face |
| samyhaff/qwen3-4b-reranker-ed | no disponible | no disponible | Reranking de candidatos para ED | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada, salvo que el modelo base Qwen3-1.7B no está especializado en ED y que el reranker qwen3-4b-reranker-ed se usa como etapa previa en el pipeline del paper.

## Limitaciones y advertencias

- Especialización estrecha: el modelo está entrenado exclusivamente para desambiguación de entidades con el formato de prompt documentado; su uso fuera de esa tarea producirá resultados degradados.
- Dependencia del formato: requiere la mención marcada con `[` `]`, candidatos numerados y el prompt de sistema exacto; desviaciones del formato pueden romper el parseo de `"answer": <índice>`.
- Necesidad de muestreo múltiple: el rendimiento reportado asume 10 completions con voto mayoritario; una sola pasada tendrá menor precisión.
- Riesgo de alucinación: en modo thinking el modelo puede generar razonamientos plausibles pero incorrectos, o índices fuera del rango de candidatos (el código de ejemplo filtra explícitamente estos casos).
- Sesgos: no se documentan análisis de sesgos; al derivar de Qwen3-1.7B hereda los sesgos de su corpus de preentrenamiento, no detallado.
- Idiomas: no se especifican los idiomas soportados; los conjuntos de evaluación (ZELDA, ZESHEL) son en inglés, por lo que el rendimiento en castellano u otros idiomas no está validado.
- Contexto: la longitud máxima de contexto no está documentada, lo que dificulta planificar despliegues con textos largos.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3-1.7B, también Apache 2.0 según la información disponible.
- Madurez: el modelo tiene pocas descargas (374) y un solo like en el momento de la consulta; no hay evidencia de uso en producción a gran escala.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/samyhaff/qwen3-1.7b-grpo-ed
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Reranker asociado: https://huggingface.co/samyhaff/qwen3-4b-reranker-ed
- Paper: https://arxiv.org/abs/2611.30334
- Repositorio con pipeline y evaluación: https://github.com/samyhaff/ed-study
