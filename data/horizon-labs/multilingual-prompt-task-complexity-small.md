# Horizon-Labs/multilingual-prompt-task-complexity-small

## Resumen

Horizon-Labs/multilingual-prompt-task-complexity-small es un clasificador de texto multilingüe de 140.648.081 parámetros (141M) desarrollado por Horizon-Labs. Su función es analizar el prompt de un usuario dirigido a un LLM y devolver dos tipos de etiquetas: el tipo de tarea (11 clases: open QA, closed QA, summarization, text generation, code generation, chatbot, classification, rewrite, brainstorming, extraction y other, siguiendo la taxonomía del clasificador de NVIDIA) y seis puntuaciones de complejidad entre 0 y 1 (creatividad, razonamiento, conocimiento contextual, conocimiento de dominio, restricciones y complejidad global). El modelo resuelve un problema operativo concreto: enrutar cada petición al modelo adecuado, analizar registros de conversación y curar datos de ajuste por dificultad.

Técnicamente es un encoder transformer de la familia ModernBERT, construido mediante ajuste fino sobre jhu-clsp/mmBERT-small con una longitud máxima de 512 tokens. Produce 17 salidas sigmoid independientes (11 de tarea más 6 dimensiones) y no genera texto: es exclusivamente un clasificador. La relevancia actual viene de su cobertura multilingüe real (entrenado con 172.690 prompts en 133 idiomas) frente a alternativas centradas en inglés, y de su tamaño reducido, que permite ejecución en CPU y en el navegador mediante ONNX y transformers.js.

El modelo se publica con licencia Apache-2.0 y su repositorio ocupa 1,4 GB. Existe una variante mayor y más precisa, Horizon-Labs/multilingual-prompt-task-complexity-base (308M). En el momento de la consulta el repositorio registra 0 descargas y 0 likes, lo que indica una publicación reciente y sin adopción medida todavía (fechas de creación y actualización: 2026-10-13).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer de la familia ModernBERT (base jhu-clsp/mmBERT-small) |
| Parametros totales | 140.648.081 (141M) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 512 tokens (longitud maxima de entrada; solo se leen los primeros 512) |
| Tipos de cuantizacion | int8 documentada (onnx/model_quantized.onnx, 268 MB, embeddings en int8); se distribuyen pesos en safetensors y ONNX en precision completa. No se documentan GGUF, AWQ ni GPTQ |
| Idiomas soportados | Multilingue; codigos declarados: en, zh, ru, es, fr, de, pt, it, ar, tr, ja, ko, vi, id, pl, uk, hu, fa, hi, bn, sw (entrenamiento sobre prompts de 133 idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors y ONNX (incluye variante cuantizada int8); compatible con transformers.js |
| Salidas | 17 sigmoides: 11 clases `task_*` y 6 dimensiones de complejidad |
| Tamano del repositorio | 1,4 GB |
| Pipeline | text-classification |

## Arquitectura y entrenamiento

El modelo es un encoder transformer bidireccional basado en mmBERT-small, la variante multilingüe de la familia ModernBERT, con 141M de parámetros y una ventana máxima de 512 tokens. Sobre esa base se añade una cabeza con 17 salidas sigmoid: una por cada clase de tarea (se toma la de mayor probabilidad como tipo de tarea) y seis para las dimensiones de complejidad, que se interpretan como puntuaciones continuas entre 0 y 1. No hay decodificación autoregresiva ni generación de texto en ninguna parte del pipeline.

El conjunto de entrenamiento consta de 172.690 prompts reales de usuario en 133 idiomas: primeros mensajes de usuario de WildChat-1M (ODC-BY, solo el texto del prompt, sin metadatos y excluyendo conversaciones marcadas como tóxicas), prompts de OASST2 y de Aya (Apache-2.0), con un máximo de 3.000 por idioma (20.000 en inglés y 8.000 en chino). Las etiquetas no son humanas: el profesor es Qwen3.8-27B, que respondió una pregunta de elección múltiple (tarea) y seis valoraciones de 0 a 9 por prompt. El modelo aprende las probabilidades de respuesta del profesor para la tarea y las valoraciones esperadas divididas entre 9 como objetivos suaves (soft targets) para las dimensiones. El checkpoint se seleccionó sobre 8.589 prompts reservados. El código de entrenamiento está en el directorio `code/` del repositorio.

No se documenta en la información disponible el uso de RLHF, DPO ni técnicas de decodificación especulativa, que no aplican a un clasificador. La innovación destacable es el enfoque de destilación de etiquetas soft desde un LLM profesor sobre una taxonomía fija, junto con la inclusión de pesos ONNX cuantizados para despliegue en CPU y navegador.

## Capacidades

- Clasificación de tipo de tarea de un prompt en 11 categorías: open QA, closed QA, summarization, text generation, code generation, chatbot, classification, rewrite, brainstorming, extraction y other.
- Puntuación de seis dimensiones de complejidad de 0 a 1: creatividad, razonamiento, conocimiento contextual, conocimiento de dominio, restricciones y complejidad global.
- Procesamiento multilingüe con cobertura declarada de más de 100 idiomas y evaluación específica en 21 idiomas.
- Inferencia en CPU y en navegador mediante ONNX y transformers.js, con una variante int8 de 268 MB que reproduce las mismas decisiones a umbral 0,5 que fp32 en el 97,5% de 400 prompts de prueba (para todas las salidas).
- Uso como componente dentro de pipelines de enrutamiento de modelos (model routing) y de curación de datos, no como generador.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un clasificador de una sola pasada.
- No dispone de modo de razonamiento (thinking mode), visión, audio ni generación de texto.

## Casos de uso

- Enrutamiento de prompts a modelos de distinto coste: el clasificador decide si una petición es de baja complejidad (por ejemplo, reescritura o clasificación simple) y puede atenderse con un modelo pequeño, o si requiere un modelo mayor por su puntuación en razonamiento o conocimiento de dominio. El umbral se calibra sobre el tráfico propio.
- Control de costes en pasarelas de LLM: integrado antes del modelo generativo, permite aplicar políticas por tipo de tarea (por ejemplo, enviar code generation a un modelo especializado en código y summarization a uno económico).
- Análisis de registros de conversación: al devolver tipo de tarea y complejidad por prompt, permite construir histogramas de uso por categoría y detectar cambios en la distribución de peticiones de una aplicación a lo largo del tiempo.
- Curación y equilibrado de datos de instruction tuning: las puntuaciones de complejidad y tipo de tarea permiten muestrear datasets de ajuste con una mezcla controlada, evitando el sesgo hacia prompts triviales (las medias de entrenamiento son complejidad 0,20, razonamiento 0,21 y creatividad 0,29).
- Etiquetado de corpus multilingües a gran escala: al cubrir 133 idiomas en entrenamiento y ser viable en CPU, se puede aplicar en lote sobre corpus como WildChat-1M u OASST2 sin coste de GPU.
- Clasificación previa en aplicaciones de navegador: la variante int8 con ONNX y transformers.js permite ejecutar el modelo en el cliente para etiquetar la petición antes de enviarla al servidor, útil en asistentes web con enrutamiento local.
- Segmentación de tráfico para evaluación de calidad: agrupar prompts por tarea y complejidad antes de medir la calidad de un LLM en producción, de modo que las comparativas entre versiones se hagan por segmentos homogéneos.

## Benchmarks y rendimiento

Evaluación sobre 4.200 prompts reales de usuario reservados de WildChat-1M (200 por idioma en 21 idiomas, nunca usados en entrenamiento), etiquetados con un juez independiente, google/gemma-4-31b-it, con las mismas preguntas que el profesor. La accuracy y el macro-F1 de tarea comparan la clase de mayor probabilidad; las dimensiones se miden con correlación de rangos de Spearman.

| modelo | accuracy tarea | macro-F1 tarea | accuracy tarea, ingles | accuracy tarea, media por idioma | creativity | reasoning | contextual knowledge | domain knowledge | constraints | complexity | media Spearman dimensiones | nota |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Este modelo (141M) | 0,793 | 0,735 | 0,830 | 0,793 | 0,769 | 0,713 | 0,591 | 0,661 | 0,878 | 0,681 | 0,716 | multilingue |
| Horizon-Labs/multilingual-prompt-task-complexity-base (308M) | 0,811 | 0,745 | 0,850 | 0,811 | 0,791 | 0,746 | 0,603 | 0,703 | 0,890 | 0,711 | 0,741 | variante mayor |
| nvidia/prompt-task-and-complexity-classifier (184M) | 0,459 | 0,318 | 0,655 | 0,459 | 0,478 | 0,250 | 0,230 | 0,385 | 0,648 | 0,347 | 0,390 | solo ingles; datos anotados por humanos con definiciones propias |
| Qwen3.8-27B, con prompt (profesor, 27B) | 0,856 | 0,807 | 0,915 | 0,856 | 0,856 | 0,830 | 0,688 | 0,808 | 0,915 | 0,819 | 0,819 | referencia, no desplegable como clasificador ligero |

Notas de la evaluación aportadas por el autor: la tabla corresponde al checkpoint publicado; las medias sobre 2 semillas de entrenamiento son 0,793 / 0,790 de accuracy de tarea y 0,716 / 0,716 de Spearman medio para el modelo small. La comparación con el clasificador de NVIDIA debe leerse con cautela porque este se entrenó con anotaciones humanas y directrices propias, de modo que parte del desacuerdo con el juez es de definiciones y no de errores; en inglés ambos coinciden en la tarea el 66% de las veces. Como advertencia adicional, el juez y el profesor son ambos LLM y coinciden entre sí en un 86% de los casos de tarea, lo que favorece a este modelo en esta prueba.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 0,28 GB en fp16 y 0,56 GB en fp32 para los 141M de parámetros. El archivo ONNX int8 ocupa 268 MB en disco. Estas cifras son estimaciones derivadas del recuento de parámetros, no datos publicados por el autor.
- Cabe con holgura en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en aceleradores integrados, dado el tamano del modelo.
- Ejecución viable en CPU para lotes grandes; el autor incluye explícitamente ONNX para CPU y navegador (transformers.js).
- Opciones de despliegue documentadas o etiquetadas: pipeline de transformers, ONNX Runtime, transformers.js y text-embeddings-inference; las etiquetas del repositorio incluyen endpoints_compatible.
- No hay datos publicados de latencia ni de throughput en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy de tarea (multilingue) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Horizon-Labs/multilingual-prompt-task-complexity-small | 141M | 512 tokens | 0,793 | Apache-2.0 | HuggingFace, safetensors y ONNX |
| Horizon-Labs/multilingual-prompt-task-complexity-base | 308M | 512 tokens (no detallado en la informacion disponible) | 0,811 | Apache-2.0 | HuggingFace |
| nvidia/prompt-task-and-complexity-classifier | 184M | no disponible | 0,459 en la evaluacion multilingue del autor; 0,655 en ingles | no disponible en la informacion proporcionada | HuggingFace |
| Qwen3.8-27B (profesor, uso con prompt) | 27B | no disponible | 0,856 | Apache-2.0 | Referencia; no es un clasificador ligero |

La ventaja diferencial del modelo small frente al de NVIDIA no está en la accuracy en inglés, sino en la cobertura multilingüe: sobre 21 idiomas mantiene 0,793 de accuracy media, mientras que el clasificador de NVIDIA cae a 0,459 en ese mismo conjunto. Frente a su propia variante base de 308M pierde 0,018 puntos de accuracy de tarea y 0,025 de Spearman medio, a cambio de menos de la mitad de parámetros. No se dispone de comparaciones con otros clasificadores de prompts multilingües en la información proporcionada.

## Limitaciones y advertencias

- Las etiquetas proceden de un LLM (Qwen3.8-27B) y no de anotadores humanos; las valoraciones de complejidad son subjetivas. El autor recomienda usar las puntuaciones para ordenar y enrutar, y validar los umbrales sobre el tráfico propio.
- Las puntuaciones de las dimensiones son relativas: la mayoría de prompts puntúan bajo (medias de entrenamiento de 0,20 en complejidad, 0,21 en razonamiento y 0,29 en creatividad), por lo que deben compararse entre prompts y no interpretarse como valores absolutos.
- Solo se leen los primeros 512 tokens del prompt; prompts muy largos con instrucciones al final pueden clasificarse mal.
- No es un clasificador de seguridad: el propio autor remite a su modelo content-safety-guard para prompts dañinos o con inyección de instrucciones. Este modelo no debe usarse como filtro de contenido.
- Sesgo de evaluación: el juez (google/gemma-4-31b-it) y el profesor son ambos LLM y coinciden entre sí en el 86% de los casos de tarea, lo que favorece al modelo evaluado en este conjunto de prueba.
- La comparación con nvidia/prompt-task-and-complexity-classifier está sesgada por diferencias de definición de la taxonomía, ya que ese modelo se entrenó con anotaciones humanas y sus propias directrices.
- No hay datos publicados sobre sesgos demográficos o culturales por idioma más allá de las métricas agregadas por idioma.
- La licencia Apache-2.0 no impone restricciones conocidas para uso comercial, pero se debe verificar individualmente cada dataset base (WildChat-1M es ODC-BY; OASST2 y Aya son Apache-2.0) si se redistribuyen datos derivados.
- El repositorio registra 0 descargas y 0 likes y fue publicado en 2026-10-13, por lo que carece todavía de validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Horizon-Labs/multilingual-prompt-task-complexity-small
- Variante mayor (308M): https://huggingface.co/Horizon-Labs/multilingual-prompt-task-complexity-base
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
- Clasificador de referencia de NVIDIA: https://huggingface.co/nvidia/prompt-task-and-complexity-classifier
- Dataset WildChat-1M: https://huggingface.co/datasets/allenai/WildChat-1M
- Dataset OASST2: https://huggingface.co/datasets/OpenAssistant/oasst2
- Dataset Aya: https://huggingface.co/datasets/CohereLabs/aya_dataset
- Juez de evaluación: https://huggingface.co/google/gemma-4-31b-it

Nota: la búsqueda web realizada no ha devuelto ningún resultado relevante sobre este modelo; los enlaces anteriores proceden de la model card y de los metadatos del repositorio de HuggingFace.
