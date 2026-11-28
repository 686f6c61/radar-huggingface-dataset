# Gem1832/zils-lite-b1128b

## Resumen

zils-lite-b1128b es un modelo de decisión de 853 millones de parámetros publicado por el usuario Gem1832 en Hugging Face. Se trata de un fine-tune destilado a partir de la fusión en espacio de pesos de tres modelos de decisión con licencia Apache-2.0 (joamCriff123/zils-lite-l1125a, joamCriff123/zils-lite-l1123q y MachinePulseAI/karpo-decision-0.8B), todos ellos derivados a su vez de Qwen/Qwen3.5-0.8B. El modelo no genera texto libre: está especializado en tareas de decisión con formato de opciones múltiples, donde devuelve probabilidades sobre las opciones candidatas.

La relevancia del modelo reside en su método de entrenamiento: destilación de las distribuciones completas de probabilidad de un profesor de 4B parámetros (newsbang/adjudex-4b-v7) sobre aproximadamente 58.000 filas públicas, sin usar etiquetas gold ni salidas de modelos comerciales. El resultado es un cuerpo de 0,85B parámetros que mejora a su punto de partida en el índice de decisión interno (37,8 frente a 36,2) manteniendo un rendimiento competitivo en JevBench público (62,3 frente a 60,9 del merge inicial).

El modelo se enmarca en el ecosistema denominado "Zils subnet 127" y "d3-lite pool", una nomenclatura propia del autor que no cuenta con documentación externa verificable. La model card es explícita sobre la procedencia de los pesos y las licencias de los datasets, lo que facilita la trazabilidad, pero no aporta información sobre idiomas soportados, benchmarks estándar de la industria ni detalles de arquitectura más allá de la herencia de Qwen3.5-0.8B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-0.8B); incluye torre de visión heredada del merge l1125a + l1123q |
| Parametros totales | 852.985.920 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | joamCriff123/zils-lite-l1125a, joamCriff123/zils-lite-l1123q, MachinePulseAI/karpo-decision-0.8B |
| Profesor de destilacion | newsbang/adjudex-4b-v7 (Apache-2.0) |
| Tamano del repo | 1,7 GB |
| Tipo de modelo | decision-model (clasificacion sobre opciones, no generativo) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.5-0.8B, un transformer de 853 millones de parámetros. El modelo parte de una fusión en espacio de pesos con pesos iguales de tres fine-tunes Apache-2.0 del mismo backbone, lo que da lugar a un "soup" que conserva la torre de visión del par l1125a + l1123q. Sobre ese punto de partida se aplica un proceso de destilación: el profesor newsbang/adjudex-4b-v7, ejecutado sobre el chasis "zils d3-mini", genera las probabilidades completas sobre las opciones de cada ejemplo, y esas distribuciones actúan como objetivo de entrenamiento en lugar de etiquetas gold.

El entrenamiento consistió en una pasada sobre aproximadamente 58.000 filas públicas, con LoRA de rango 16 aplicado a las capas de lenguaje y una tasa de aprendizaje de 3e-5, con posterior fusión de los adaptadores en FP32. Los datos provienen exclusivamente de splits de entrenamiento de siete datasets con licencias permisivas: WANLI (12.000 filas, CC BY 4.0), CommonsenseQA (9.741, MIT), MedMCQA (4.980 filas de respuesta única, Apache-2.0), GSM8K en formato de opción múltiple (unas 7.000, MIT), When2Call (unas 8.600 pares de preferencia, CC BY 4.0), New Yorker caption contest en texto (unas 4.900, CC BY 4.0) y Open-Jev (10.880, CC0-1.0). Las opciones se barajan y se presentan en el formato de decisión del autor. No se emplearon salidas de modelos comerciales ni splits de test.

## Capacidades

- Decisión sobre opciones múltiples: el modelo devuelve probabilidades sobre un conjunto de opciones candidatas, en lugar de texto libre.
- Razonamiento de sentido común: entrenado con CommonsenseQA.
- Razonamiento matemático en formato de elección: GSM8K convertido a opción múltiple.
- Conocimiento médico a nivel de pregunta de opción única: MedMCQA.
- Inferencia en lenguaje natural: WANLI (NLI) y ANLI en la evaluación.
- Decisión de invocación de herramientas: When2Call, pares de preferencia sobre cuándo llamar a una función.
- Tareas creativas evaluadas como decisión: New Yorker caption contest en texto.
- Capacidades de visión: la torre de visión se hereda del merge l1125a + l1123q, aunque la model card no detalla su uso ni su rendimiento.
- Soporte de tool calling: no documentado como capacidad generativa; solo aparece como tarea de decisión vía When2Call.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Enrutamiento de decisiones en pipelines de clasificación: el modelo puede puntuar un conjunto cerrado de opciones (por ejemplo, categorías de ticket o intenciones) y devolver la distribución de probabilidad, lo que permite umbrales de confianza y abstención. Es adecuado porque su salida es una distribución calibrada por destilación, no texto libre.
- Evaluación de inferencia en lenguaje natural: con entrenamiento en WANLI, puede usarse para tareas de entailment/contradiction en formato de opción múltiple dentro de pipelines de validación de afirmaciones.
- Filtrado de preguntas médicas: gracias a las filas de MedMCQA, sirve como clasificador de opción única en sistemas de triaje de preguntas clínicas, siempre con revisión humana dada la sensibilidad del dominio.
- Decisión de invocación de herramientas en agentes: el entrenamiento con When2Call permite usar el modelo como componente que decide si una consulta requiere llamar a una función externa, antes de pasar el control a un modelo generativo mayor.
- Selección de respuestas en sistemas de generación aumentada: dado un conjunto de respuestas candidatas generadas por otro modelo, zils-lite-b1128b puede puntuarlas y elegir la mejor, actuando como reranker de bajo coste (0,85B parámetros, 1,7 GB en safetensors).
- Evaluación de razonamiento matemático en formato de elección: útil en pipelines de benchmarking interno donde se quiere medir la calidad de un generador convirtiendo sus respuestas en opciones y dejando que este modelo puntúe.
- Clasificación de titulares o textos creativos: el entrenamiento con el New Yorker caption contest permite usarlo en tareas de selección entre candidatos textuales con matiz humorístico.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre ítems de test públicos retenidos, con estilo de validación ("validator-style skill"):

| Cuerpo | JevBench public | Decision Index-style test (MMLU-Pro, BBH, GSM8K, MuSR, ANLI, When2Call, New Yorker) |
|---|---|---|
| l1125a + l1123q soup | 63,3 | 34,3 |
| El merge (punto de partida) | 60,9 | 36,2 |
| Este cuerpo (zils-lite-b1128b) | 62,3 | 37,8 |

No se han publicado resultados de benchmarks estándar de la industria (MMLU, HumanEval, GSM8K en formato generativo) en la información disponible. Los datos de la tabla anterior son métricas internas del autor y no son directamente comparables con las de otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16, aproximadamente 1,7 GB de pesos más overhead de activaciones y contexto; en FP32, unos 3,4 GB. Cabe holgadamente en cualquier GPU consumer con 6 GB o más.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti, RTX 4070, RTX 4090; en datacenter, A100, H100 o L4 sin problema de capacidad.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU consumer moderna, e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: al ser un modelo de decisión con salida de probabilidades, no encaja en servidores de texto generativo como vLLM o TGI de forma estándar; lo habitual es cargarlo con transformers y ejecutar forward passes sobre las opciones. No se documentan variantes GGUF para llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles. Por tamaño (0,85B parámetros) se espera un throughput alto en GPU, pero el autor no publica cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| zils-lite-b1128b | 853 M | No disponible | Apache-2.0 | Decisión por destilación | Hugging Face |
| MachinePulseAI/karpo-decision-0.8B | ~0,8 B | No disponible | Apache-2.0 | Decisión (modelo base del merge) | Hugging Face |
| newsbang/adjudex-0.8b-v7 | ~0,8 B | No disponible | Apache-2.0 | Decisión (mismos pesos que l1125a) | Hugging Face |
| newsbang/adjudex-4b-v7 | ~4 B | No disponible | Apache-2.0 | Decisión (profesor de destilación) | Hugging Face |

La comparación con alternativas de la misma categoría fuera del ecosistema Zils no está disponible en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre ni mantiene conversaciones; su salida es una distribución sobre opciones predefinidas.
- Sesgos conocidos: no documentados por el autor. Al entrenarse con WANLI, CommonsenseQA, MedMCQA, GSM8K, When2Call, New Yorker y Open-Jev, hereda los sesgos de esas fuentes.
- Riesgo de alucinación: bajo en el sentido generativo, pero puede asignar alta confianza a opciones incorrectas en dominios fuera de su distribución de entrenamiento.
- Limitaciones de contexto e idioma: no se documentan la longitud de contexto ni los idiomas soportados; la mayor parte de los datasets de entrenamiento son en inglés, por lo que el rendimiento en castellano es incierto.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se deben conservar los avisos de copyright de los modelos upstream recogidos en el NOTICE del repositorio.
- Caveats para producción: los benchmarks publicados son métricas internas del autor, no comparables con estándares de la industria; el modelo tiene 0 descargas y 0 likes en el momento de la ficha, sin validación externa conocida; la nomenclatura "Zils subnet 127" y "d3-lite pool" no tiene documentación pública verificable.
- El uso en dominios médicos (MedMCQA) no debe sustituir la revisión por profesionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Gem1832/zils-lite-b1128b
- Modelo hermano (mismo merge): https://huggingface.co/Gem1832/zils-lite-b1128a
- Modelo base 1: https://huggingface.co/joamCriff123/zils-lite-l1125a
- Modelo base 2: https://huggingface.co/joamCriff123/zils-lite-l1123q
- Modelo base 3: https://huggingface.co/MachinePulseAI/karpo-decision-0.8B
- Modelo con mismos pesos que l1125a: https://huggingface.co/newsbang/adjudex-0.8b-v7
- Profesor de destilación: https://huggingface.co/newsbang/adjudex-4b-v7
- Backbone original: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset WANLI: https://huggingface.co/datasets/alisawuffles/WANLI
- Dataset CommonsenseQA: https://huggingface.co/datasets/tau/commonsense_qa
- Dataset MedMCQA: https://huggingface.co/datasets/openlifescienceai/medmcqa
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Dataset When2Call: https://huggingface.co/datasets/nvidia/When2Call
- Dataset New Yorker caption contest: https://huggingface.co/datasets/jmhessel/newyorker_caption_contest
- Dataset Open-Jev: https://huggingface.co/datasets/ZefanCai/Open-Jev
