# samyhaff/qwen3-1.7b-distill-ed

## Resumen

qwen3-1.7b-distill-ed es un modelo de lenguaje especializado en desambiguación de entidades (entity disambiguation, ED) desarrollado por Samy Haffoudhi en el contexto del artículo "When Does Reasoning Help Entity Disambiguation? Small LLMs In-Domain and Under Shift" (Findings of EACL 2027). Se trata de un ajuste fino mediante LoRA fusionado sobre Qwen/Qwen3-1.7B, entrenado por destilación off-policy (GKD, λ=0, β=0) desde Qwen3-30B-A3B sobre el conjunto de datos ZELDA. El modelo recibe una mención marcada en su contexto y una lista corta de candidatos numerados, razona y responde con el índice del candidato elegido.

El problema que resuelve es concreto: dado un texto con una mención ambigua (por ejemplo, "Jordan" en un contexto deportivo) y un conjunto de entidades candidatas con descripciones, el modelo debe seleccionar la entidad correcta. La innovación principal es que incorpora razonamiento explícito (thinking mode) en un modelo de tan solo 1.700 millones de parámetros, destilado desde un modelo MoE mucho mayor, lo que permite obtener precisión competitiva en un formato desplegable en hardware modesto.

El modelo es relevante porque demuestra que el razonamiento destilado en modelos pequeños puede ser efectivo para tareas de linking y desambiguación, con resultados de 79,0 de precisión en ZELDA y 75,9 de precisión normalizada en ZESHEL en régimen de zero-shot verdadero. Su licencia Apache 2.0 y su tamaño lo hacen adecuado para pipelines de producción con requisitos de latencia y coste ajustados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-1.7B), ajuste LoRA fusionado |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-1.7B, un transformer decoder-only de 1.700 millones de parámetros. Sobre esta base se aplicó un ajuste fino con LoRA que posteriormente fue fusionado en los pesos, de modo que el artefacto publicado es un modelo denso estándar cargable con transformers. El entrenamiento se realizó mediante destilación off-policy con el algoritmo GKD (Generalized Knowledge Distillation) configurado con λ=0 y β=0, tomando como profesor a Qwen3-30B-A3B y como conjunto de datos ZELDA.

La tarea de entrenamiento es la desambiguación de entidades: la entrada contiene un texto contextual con la mención delimitada por corchetes y una lista numerada de candidatos con sus descripciones; la salida esperada incluye un razonamiento seguido de un campo `"answer": <índice>`. El modelo está diseñado para funcionar con decodificación por muestreo múltiple y voto mayoritario (el autor recomienda 10 completaciones y seleccionar la moda), lo que aprovecha la variabilidad del razonamiento para robustecer la predicción final.

## Capacidades

- Desambiguación de entidades en contexto: selecciona la entidad correcta de una lista corta numerada a partir de la mención marcada y las descripciones de candidatos.
- Razonamiento explícito en modo thinking: genera una cadena de razonamiento antes de emitir la respuesta final en el formato `"answer": <índice>`.
- Entity linking dentro de un pipeline: el autor lo emplea como etapa final tras un reranker (qwen3-4b-reranker-ed) que proporciona los 10 mejores candidatos.
- Generación de texto conversacional: hereda las capacidades generales de generación de Qwen3-1.7B.
- Soporte de plantilla de chat con `enable_thinking=True` para activar el modo de razonamiento.
- Integración con vLLM mediante `llm.chat` y parámetros de muestreo del modelo.
- No se documentan capacidades de tool calling, agentes, visión ni audio en la información proporcionada.

## Casos de uso

- Desambiguación de entidades en pipelines de extracción de conocimiento: el modelo recibe menciones detectadas por un NER y una lista de candidatos de una base de conocimiento, y devuelve el índice de la entidad correcta; su tamaño de 1.700 millones permite ejecutarlo en cada mención sin coste prohibitivo.
- Entity linking en dominios especializados: combinado con un reranker que reduzca el espacio de candidatos a 10, el modelo resuelve la selección final con razonamiento, lo que resulta útil en corpus biomédicos, legales o financieros donde las menciones son ambiguas.
- Enriquecimiento de bases de datos y grafos de conocimiento: procesamiento por lotes de documentos para anclar menciones a entidades canónicas, aprovechando el muestreo con voto mayoritario para reducir errores puntuales.
- Búsqueda y recuperación aumentada: desambiguar entidades en consultas de usuario antes de la recuperación, mejorando la precisión de los resultados cuando la consulta contiene nombres propios ambiguos.
- Análisis de noticias y monitorización de medios: identificar a qué persona, organización o lugar se refiere cada mención en flujos de noticias multi-fuente, con contexto largo por documento.
- Evaluación de robustez ante cambios de distribución: el modelo está entrenado y evaluado en ZELDA y ZESHEL, por lo que sirve como referencia para estudiar el comportamiento de modelos pequeños bajo shift de dominio en tareas de ED.
- Prototipado e investigación académica: al ser Apache 2.0 y ejecutable en una sola GPU consumer, es adecuado para experimentos de destilación y razonamiento en entornos con recursos limitados.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| ZELDA | Precisión (acc.) | 79,0 |
| ZESHEL (zero-shot verdadero) | Precisión normalizada (norm. acc.) | 75,9 |

No se han publicado en la información disponible resultados adicionales de benchmarks (MMLU, HumanEval, GSM8K u otros) ni comparaciones numéricas con modelos alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp16/bf16): aproximadamente 3,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, alrededor de 4-6 GB según longitud de contexto y lote.
- En cuantización de 8 bits: aproximadamente 2 GB de pesos; en 4 bits: aproximadamente 1 GB de pesos (estimaciones teóricas, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16; RTX 3060/4060, RTX 4090, A100 o H100 para mayor throughput.
- Cabe en GPU consumer: sí, en tarjetas con 8 GB o más en fp16 y en tarjetas con 4-6 GB en cuantización de 8 o 4 bits.
- Opciones de despliegue: vLLM (método usado en la model card), transformers con la plantilla de chat de Qwen3, y previsiblemente llama.cpp u Ollama si se generan pesos GGUF (no confirmado en la información disponible).
- Latencia y throughput: no disponibles en la información proporcionada. El flujo recomendado implica 10 completaciones por consulta con `max_tokens` de hasta 2048, lo que multiplica el coste de inferencia respecto a una única pasada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| samyhaff/qwen3-1.7b-distill-ed | 1,72 B | no disponible | Desambiguacion de entidades con razonamiento | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-1.7B (base) | 1,72 B | no disponible | Generacion de texto general | Apache 2.0 | Hugging Face |
| samyhaff/qwen3-4b-reranker-ed | no disponible | no disponible | Reranking de candidatos para ED | no disponible | Hugging Face |
| Qwen3-30B-A3B (profesor) | 30 B (MoE) | no disponible | Generacion de texto general | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada, salvo que el modelo se usa como etapa final tras el reranker qwen3-4b-reranker-ed en el pipeline del autor.

## Limitaciones y advertencias

- Modelo altamente especializado: está entrenado para la tarea de desambiguación de entidades con un formato de prompt muy concreto; su uso fuera de ese formato o tarea puede degradar gravemente el rendimiento.
- Dependencia del formato: requiere la mención delimitada por `[` `]`, candidatos numerados y el campo de respuesta `"answer": <índice>`; variaciones en el prompt pueden invalidar la extracción de la respuesta.
- Recomendación de muestreo múltiple: el autor sugiere 10 completaciones con voto mayoritario, lo que incrementa el coste computacional y la latencia frente a una decodificación greedy.
- Riesgo de alucinación en el razonamiento: al generar cadenas de razonamiento, puede producir justificaciones plausibles pero incorrectas; el voto mayoritario mitiga pero no elimina este riesgo.
- Sesgos: no se documentan sesgos específicos en la información proporcionada; al heredar la base Qwen3-1.7B, puede reproducir sesgos presentes en los datos de entrenamiento de dicho modelo.
- Idiomas: no se especifican los idiomas soportados; el conjunto ZELDA y la evaluación se centran en inglés, por lo que el rendimiento en castellano u otros idiomas no está garantizado.
- Contexto: la longitud máxima de contexto no se indica en la información disponible; conviene verificarla antes de desplegar con documentos largos.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las condiciones de la licencia del modelo base Qwen3-1.7B y citar el artículo correspondiente.
- Resultados de benchmarks limitados a ZELDA y ZESHEL; no hay evidencia publicada de rendimiento en otras tareas de ED ni en dominios distintos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/samyhaff/qwen3-1.7b-distill-ed
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Reranker asociado: https://huggingface.co/samyhaff/qwen3-4b-reranker-ed
- Repositorio del pipeline y evaluación: https://github.com/samyhaff/ed-study
- Artículo: https://arxiv.org/abs/2611.30334
