# fushuncui/opd-rs-classifier-qwen3-0.6b

## Resumen

El modelo `fushuncui/opd-rs-classifier-qwen3-0.6b` es un clasificador de cabecera (classification head) diseñado para clasificar texto en dos categorías: razonamiento (Reasoning) y estilo (Stylistic), además de detectar spans agentic (llamadas a herramientas estructuradas). Fue desarrollado por fushuncui y se basa en las representaciones internas del modelo Qwen3-0.6B-Base, que actúa como extractor de características congelado.

Este modelo no es un LLM completo, sino un componente auxiliar que se acopla a Qwen3-0.6B-Base para tareas de clasificación de segmentos de texto. Su relevancia radica en la posibilidad de integrar un clasificador ligero y eficiente en pipelines de procesamiento de lenguaje natural donde se necesite distinguir entre contenido de razonamiento y contenido estilístico, así como identificar llamadas a herramientas en texto generado. El repositorio solo contiene los pesos del clasificador MLP, no el modelo base, y el código de entrenamiento e inferencia se encuentra en un repositorio de GitHub separado.

La arquitectura del clasificador es un perceptrón multicapa (MLP) de dos capas lineales con activación ReLU, que toma como entrada la representación de 1024 dimensiones del último token de Qwen3-0.6B-Base. El modelo reporta una precisión del 96,99 % y un macro-F1 del 96,978 % en el conjunto de test, aunque los datos de entrenamiento son pseudo-etiquetas generadas por el propio modelo, no anotaciones humanas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP de 2 capas: Linear(1024,1024) -> ReLU -> Linear(1024,2) |
| Parametros totales | no disponible (el MLP tiene aproximadamente 1,05 M de parámetros, calculado como 1024*1024 + 1024 + 1024*2 + 2) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base Qwen3-0.6B-Base, que soporta 32 768 tokens) |
| Tipos de cuantizacion | no disponible (solo se distribuyen los pesos del clasificador, no el modelo base) |
| Idiomas soportados | no disponible (depende del modelo base; Qwen3-0.6B-Base soporta principalmente inglés y chino) |
| Licencia | other (no se especifica una licencia concreta) |
| Formato de pesos | no disponible (probablemente safetensors o pytorch, no se indica en la información) |

## Arquitectura y entrenamiento

El clasificador es un MLP de dos capas completamente conectadas: la primera capa proyecta la representación de 1024 dimensiones del modelo base a 1024 dimensiones con activación ReLU, y la segunda capa reduce a 2 logits (una por clase). El modelo base Qwen3-0.6B-Base se mantiene congelado durante el entrenamiento; solo se actualizan los pesos del MLP. El entrenamiento se realizó durante una época (best epoch: 1) sobre un dataset privado no público.

La innovación técnica principal es el uso de una cabeza de clasificación ligera sobre un LLM congelado, lo que reduce drásticamente los costes de entrenamiento e inferencia en comparación con un fine-tuning completo. El modelo distingue entre dos tipos de contenido: spans de razonamiento (Reasoning) y spans estilísticos (Stylistic), mientras que las llamadas a herramientas estructuradas (delimitadas por `<tool_call>...</tool_call>`) se clasifican directamente como agentic mediante un router estructural, sin pasar por el clasificador MLP.

Una limitación importante es que las etiquetas de entrenamiento son pseudo-Gold generadas por el propio modelo, no anotaciones humanas independientes, lo que puede introducir sesgos en la evaluación.

## Capacidades

- Clasificación binaria de texto: distingue entre contenido de razonamiento (Reasoning) y contenido estilístico (Stylistic).
- Detección de spans agentic: identifica llamadas a herramientas estructuradas delimitadas por `<tool_call>...</tool_call>` mediante un router estructural, sin necesidad de clasificación MLP.
- Inferencia ligera: al ser un MLP de solo ~1 M de parámetros, la sobrecarga computacional sobre el modelo base es mínima.
- Integración con Qwen3-0.6B-Base: aprovecha las representaciones semánticas del modelo base para clasificar segmentos de texto.

No soporta generación de texto, razonamiento multi-paso, tool calling nativo, ni capacidades multimodales. Es exclusivamente un clasificador de segmentos.

## Casos de uso

- Filtrado de contenido en pipelines de generación: clasificar las salidas de un LLM para separar pasajes de razonamiento de pasajes estilísticos, útil en sistemas de control de calidad de texto generado.
- Detección de llamadas a herramientas en logs de agentes: identificar automáticamente cuándo un agente ha emitido una llamada a una herramienta estructurada, facilitando el análisis de trazas de ejecución.
- Análisis de corpus textuales: etiquetar grandes volúmenes de texto para estudios lingüísticos o de estilos de escritura, distinguiendo segmentos argumentativos de segmentos descriptivos.
- Preprocesamiento para sistemas de retrieval: clasificar fragmentos de documentos para indexar por tipo de contenido (razonamiento vs. estilo), mejorando la precisión de búsquedas semánticas.
- Evaluación de modelos de lenguaje: medir la proporción de razonamiento frente a contenido estilístico en las respuestas generadas por diferentes LLMs, como métrica de calidad.
- Moderación de contenido en aplicaciones conversacionales: detectar spans que contienen instrucciones de sistema o llamadas a herramientas para prevenir inyecciones de prompts.

## Benchmarks y rendimiento

El autor reporta los siguientes resultados en el conjunto de test (no se especifica el tamaño ni la composición del test):

| Metrica | Valor |
|---|---|
| Accuracy (span/unit) | 96,9900 % |
| Macro-F1 (span/unit) | 96,9780 % |

No se han publicado resultados comparativos con otros clasificadores en benchmarks estándar como MMLU, HumanEval o GSM8K. Los datos de entrenamiento y test no son públicos, y las etiquetas son pseudo-Gold generadas por el modelo, por lo que estos valores deben interpretarse con cautela.

## Requisitos de hardware

- El clasificador MLP en sí es extremadamente ligero (~1 M de parámetros) y puede ejecutarse en CPU sin problemas.
- Sin embargo, para obtener las representaciones de entrada se requiere ejecutar Qwen3-0.6B-Base, que necesita aproximadamente 1,2 GB de VRAM en FP16 o ~0,6 GB en cuantización INT4.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050) es suficiente para inferencia con el modelo base en FP16.
- Opciones de despliegue: el clasificador puede integrarse en pipelines de Hugging Face Transformers, o exportarse a ONNX para inferencia en CPU. No se mencionan integraciones con vLLM, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada. Dado el tamaño del modelo base, se espera una latencia de decenas de milisegundos por clasificación en GPU moderna.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (clasificadores de cabecera sobre LLMs congelados para distinguir razonamiento de estilo). No se puede establecer una comparativa fiable sin datos adicionales.

## Limitaciones y advertencias

- Las etiquetas de entrenamiento son pseudo-Gold generadas por el propio modelo, no anotaciones humanas independientes, lo que puede inflar las métricas de rendimiento y ocultar sesgos.
- El modelo solo clasifica texto en dos categorías (Reasoning y Stylistic); no es un clasificador generalista y no soporta otras tareas.
- La licencia es "other" y no se especifican los términos exactos; el uso comercial podría estar restringido. Se recomienda contactar con el autor antes de utilizarlo en producción.
- El repositorio no incluye el modelo base Qwen3-0.6B-Base; es necesario descargarlo por separado desde Hugging Face, sujeto a su propia licencia (Apache 2.0 para Qwen3-0.6B-Base).
- No se proporcionan datos sobre el dataset de entrenamiento, su composición ni su tamaño, lo que dificulta evaluar la generalización del modelo a dominios distintos.
- El modelo depende de la calidad de las representaciones de Qwen3-0.6B-Base; si el modelo base se actualiza o se sustituye, el clasificador puede dejar de funcionar correctamente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fushuncui/opd-rs-classifier-qwen3-0.6b
- Repositorio GitHub del autor (mencionado en la model card, sin URL directa): `fushuncui/opd`
- Modelo base Qwen3-0.6B-Base: https://huggingface.co/Qwen/Qwen3-0.6B
- Colección Qwen3 en Hugging Face: https://huggingface.co/collections/Qwen/qwen3
- Repositorio oficial Qwen3 en GitHub: https://github.com/QwenLM/Qwen3
