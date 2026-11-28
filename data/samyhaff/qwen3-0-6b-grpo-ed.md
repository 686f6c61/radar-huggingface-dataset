# samyhaff/qwen3-0.6b-grpo-ed

## Resumen

qwen3-0.6b-grpo-ed es un modelo especializado en desambiguación de entidades (entity disambiguation, ED) desarrollado por Samy Haffoudhi en el contexto del paper "When Does Reasoning Help Entity Disambiguation? Small LLMs In-Domain and Under Shift" (Findings of EACL 2027). Se construye a partir de Qwen/Qwen3-0.6B mediante un ajuste fino con LoRA (posteriormente fusionado) y entrenamiento por refuerzo con GRPO (RLVR) sobre el conjunto de datos ZELDA, con una recompensa basada en seleccionar el candidato correcto.

El modelo resuelve un problema concreto: dada una mención marcada en un texto con contexto y una lista numerada de entidades candidatas con sus descripciones, el modelo razona y devuelve el índice del candidato elegido en el campo `"answer"`. Con solo 596 millones de parámetros, demuestra que modelos pequeños pueden abordar tareas de razonamiento estructurado cuando se entrenan con el objetivo adecuado.

Su relevancia radica en que explora cuándo el razonamiento ayuda en ED, comparando rendimiento in-domain (ZELDA, 77,8 % de precisión) frente a escenarios de cambio de distribución (ZESHEL zero-shot, 48,3 % de precisión normalizada). Es un modelo de nicho, pensado para integrarse en pipelines de linking de entidades junto con un reranker, no como un LLM de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), ajuste fino con LoRA fusionado |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-0.6B; no confirmada en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizaciones estándar de transformers/vLLM) |
| Idiomas soportados | no disponible (la model card no especifica; hereda el perfil multilingüe de Qwen3-0.6B, sin confirmar) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B, un transformer decoder-only de 0,6 mil millones de parámetros. Sobre esa base se aplica un ajuste fino con LoRA que posteriormente se fusiona en los pesos, seguido de entrenamiento con RLVR mediante GRPO (Group Relative Policy Optimization). La recompensa se define por la selección del candidato correcto de la shortlist, lo que entrena al modelo a emitir un razonamiento seguido de la respuesta en formato `"answer": <index>`.

El entrenamiento se realiza sobre ZELDA, un conjunto de datos de desambiguación de entidades. En la evaluación del paper, los candidatos que recibe el modelo son el top 10 producido por qwen3-4b-reranker-ed, formando un pipeline de dos etapas (reranking y luego desambiguación con razonamiento). El modelo está diseñado para decodificación con muestreo múltiple (10 completions con voto mayoritario), lo que aprovecha su modo de razonamiento (`enable_thinking`) para mejorar la robustez de la respuesta.

## Capacidades

- Desambiguación de entidades: dado un texto con una mención marcada entre corchetes y una lista numerada de candidatos con descripciones, selecciona el índice correcto.
- Razonamiento explícito: genera una cadena de razonamiento antes de emitir la respuesta final en el campo `"answer"`.
- Modo thinking: soporta `enable_thinking=True` en la plantilla de chat.
- Formato de salida estructurado: termina con `"answer": <index>`, parseable con expresiones regulares.
- Integración en pipelines: pensado para combinarse con un reranker (qwen3-4b-reranker-ed) que pre-selecciona candidatos.
- Generación de texto conversacional: hereda la interfaz de chat de Qwen3.
- Tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Desambiguación de entidades en pipelines de NLP: integrar el modelo como etapa final tras un reranker que reduzca los candidatos a un top-k; el modelo razona sobre el contexto y elige el índice correcto, con voto mayoritario sobre 10 muestras para robustez.
- Enriquecimiento de bases de conocimiento: procesar textos (noticias, artículos) para mapear menciones a entidades de un KB, usando la shortlist de candidatos con descripciones como entrada.
- Búsqueda semántica con resolución de entidades: en sistemas de búsqueda que necesitan identificar a qué entidad concreta se refiere una mención ambigua (personas, lugares, organizaciones) antes de recuperar documentos.
- Construcción de grafos de conocimiento: extraer y resolver entidades de forma consistente en corpus grandes antes de poblar un grafo, aprovechando el bajo coste de un modelo de 0,6B parámetros.
- Investigación en razonamiento de LLMs pequeños: servir como modelo de referencia para estudiar cuándo el razonamiento ayuda en tareas estructuradas y cómo se degrada bajo cambio de distribución (ZELDA frente a ZESHEL).
- Prototipado y experimentación académica: al ser un modelo de 0,6B con licencia Apache 2.0, permite reproducir el pipeline del paper en hardware modesto y adaptarlo a otros dominios de ED.
- Desambiguación en atención al cliente o CRM: resolver menciones ambiguas de nombres de clientes o productos en conversaciones, con la shortlist generada a partir de un catálogo interno.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| ZELDA | Accuracy | 77,8 |
| ZESHEL (true zero-shot) | Accuracy normalizada | 48,3 |

No se han publicado en la información disponible resultados de benchmarks generales (MMLU, HumanEval, GSM8K) ni comparativas numéricas con otros modelos de ED.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2 GB en precisión completa (fp16/bf16, según tamaño del repo); en cuantización de 8 bits alrededor de 0,6 GB y en 4 bits alrededor de 0,3-0,4 GB (estimaciones orientativas, no confirmadas en la model card).
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; el modelo cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, A100 y H100.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna, e incluso en CPU para inferencia con llama.cpp.
- Opciones de despliegue: vLLM (usado en el ejemplo de la model card), transformers, text-generation-inference; llama.cpp u Ollama si se generan pesos GGUF (no incluidos en el repo).
- Latencia y throughput: no disponibles. El pipeline recomendado requiere 10 muestras por consulta con hasta 2048 tokens de generación, lo que multiplica el coste de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| samyhaff/qwen3-0.6b-grpo-ed | 0,6B | no disponible | Entity disambiguation con razonamiento | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-0.6B (base) | 0,6B | no disponible | LLM de propósito general | Apache 2.0 | Hugging Face |
| samyhaff/qwen3-4b-reranker-ed | 4B (aproximado, no confirmado) | no disponible | Reranking de candidatos para ED | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada, salvo que el pipeline del paper combina el reranker de 4B con este modelo de 0,6B para la desambiguación final.

## Limitaciones y advertencias

- Modelo de nicho: está entrenado exclusivamente para desambiguación de entidades con un formato de prompt muy concreto (mención entre corchetes y candidatos numerados); fuera de ese formato su rendimiento no está garantizado.
- Degradación bajo cambio de distribución: la precisión cae de 77,8 en ZELDA a 48,3 en ZESHEL zero-shot, lo que indica una generalización limitada a dominios no vistos.
- Dependencia del pipeline: en el paper los candidatos provienen del top 10 de un reranker específico; con shortlists de otra procedencia o tamaño el comportamiento puede variar.
- Coste de inferencia: el protocolo recomendado exige 10 muestras con hasta 2048 tokens cada una y voto mayoritario, lo que multiplica la latencia y el coste frente a una única pasada.
- Riesgo de alucinación en el razonamiento: el modelo puede generar cadenas de razonamiento plausibles pero incorrectas; la respuesta final debe validarse contra el rango de índices de candidatos.
- Sesgos: no se documentan sesgos específicos en la model card; al heredar de Qwen3-0.6B puede reproducir sesgos presentes en los datos de entrenamiento originales.
- Idiomas: no se especifican los idiomas soportados; el entrenamiento en ZELDA (dataset en inglés, presumiblemente) puede limitar el rendimiento en otros idiomas.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3-0.6B y del dataset ZELDA.
- Formato de salida frágil: el parseo depende de la expresión `"answer": <index>`; variaciones en la generación pueden requerir post-procesado robusto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/samyhaff/qwen3-0.6b-grpo-ed
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Reranker asociado: https://huggingface.co/samyhaff/qwen3-4b-reranker-ed
- Repositorio del pipeline y evaluación: https://github.com/samyhaff/ed-study
- Paper (arXiv): https://arxiv.org/abs/2611.30334
