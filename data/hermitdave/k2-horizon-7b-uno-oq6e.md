# hermitdave/K2-Horizon-7B-Uno-oQ6e

## Resumen

`K2-Horizon-7B-Uno-oQ6e` es una cuantización en formato MLX del modelo `IFM/K2-Horizon-7B-Uno`, publicado por el usuario `hermitdave` sobre el modelo original del Institute of Foundation Models (IFM). El adaptador LoRA ha sido fusionado directamente en los pesos base, de modo que el modelo resultante se ejecuta como un modelo autorregresivo estándar, sin necesidad de cargar un adaptador externo. La cuantización emplea el esquema oQ6e (imatrix-enhanced mixed-precision, aproximadamente 6.5 bits por peso), optimizada para su uso en equipos Apple Silicon.

El modelo base es un LLM aumentado con difusión ("diffusion-augmented") construido sobre K2-Horizon-7B. El repositorio declara 8.999.178.240 parámetros totales y ocupa 7.6 GB en disco, lo que lo convierte en una opción viable para ejecución local en Mac con memoria unificada. Según la model card, se trata de un modelo de razonamiento que requiere el uso de `reasoning_effort="high"` para obtener respuestas correctamente elaboradas. La licencia Apache 2.0 permite su uso comercial y académico.

Es relevante para desarrolladores e investigadores que trabajan con Apple Silicon y necesitan un modelo de razonamiento local, con pesos en formato MLX y una integración sencilla mediante `mlx-lm` o una API compatible con OpenAI.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLM autorregresivo aumentado con difusión basado en K2-Horizon-7B; no se detalla la arquitectura subyacente |
| Parametros totales | 8.999.178.240 (aproximadamente 9.000 M) |
| Parametros activos | no aplica (no se indica que sea un modelo de expertos mezclados, MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ6e (imatrix-enhanced mixed-precision ~6.5 BPW) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura del `IFM/K2-Horizon-7B-Uno`, descrita como un "diffusion-augmented LLM" construido a partir de K2-Horizon-7B. La información disponible no incluye detalles específicos sobre el número de capas, la dimensión del modelo, el tipo de atención, ni la composición del dataset de entrenamiento. La model card indica que el adaptador LoRA original ha sido incorporado directamente en los pesos base, de modo que el modelo resultante no requiere un adaptador separado.

En cuanto a la cuantización, el esquema oQ6e emplea una precisión mixta mejorada mediante matriz de importancia ("imatrix-enhanced"), con aproximadamente 6.5 bits por peso. Para su ejecución se necesita la librería `mlx-lm` y, según la model card, oMLX v0.6.4 o superior con un parche específico para K2-Horizon (PR #3441). No se incluyen datos sobre el proceso de entrenamiento, tokens procesados, ni fases de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento explícito: el modelo incorpora un modo de razonamiento que debe activarse con `reasoning_effort="high"`. La API devuelve `reasoning_content` además de `content`, lo que permite mostrar la cadena de razonamiento.
- Ejecución local en Apple Silicon: el formato MLX y la cuantización oQ6e permiten cargar el modelo con `mlx-lm` en Mac con memoria unificada.
- Compatibilidad con la interfaz OpenAI: puede servirse mediante un endpoint compatible con OpenAI, usando `extra_body={"chat_template_kwargs": {"reasoning_effort": "high"}}` para forzar el modo de razonamiento.
- No se documentan capacidades multimodales (visión, audio) en la información disponible.
- Las capacidades multilingües no están documentadas: la ficha de HuggingFace indica "no disponibles".

## Casos de uso

- Asistente de razonamiento para análisis técnico: el usuario plantea un problema complejo y el modelo lo descompone en pasos intermedios. Es adecuado porque su diseño está orientado a razonamiento y exige `reasoning_effort="high"`, produciendo una cadena de pensamiento que se puede inspeccionar.
- Prototipado de aplicaciones de chat con respuestas explicables: al exponer la API compatible con OpenAI, se puede capturar `reasoning_content` y mostrarlo al usuario. Resulta útil en herramientas educativas o de auditoría donde la transparencia del proceso importa.
- Integración en scripts de automatización en macOS: se puede invocar desde la línea de comandos con `mlx_lm.generate` para procesar solicitudes de texto de forma local, sin salir de la máquina y sin costes de API.
- Investigación sobre cuantizaciones de precisión mixta: el esquema oQ6e con "imatrix-enhanced" permite comparar el comportamiento del modelo en Apple Silicon frente a otras cuantizaciones, lo que resulta relevante para estudios de compresión y eficiencia.
- Apoyo en depuración de código: un desarrollador pega un fragmento de código y solicita al modelo que explique la lógica. El modo de razonamiento ayuda a recorrer el algoritmo paso a paso y detectar posibles fallos, sin que se requiera una GPU externa.
- Educación interactiva en entornos locales: estudiantes pueden ejecutar el modelo en un Mac sin necesidad de infraestructura cloud y obtener explicaciones paso a paso sobre conceptos de matemáticas, física o informática.
- Desarrollo de agentes de texto simples: aunque no se documenta soporte de tool calling, se puede usar como backend de razonamiento en un pipeline que genere un plan de acciones basado en texto y luego ejecute pasos externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Tamaño del repositorio: 7.6 GB. La carga de pesos en memoria unificada requiere aproximadamente ese espacio, más el overhead del runtime. En Apple Silicon se recomienda un dispositivo con al menos 12 GB de memoria unificada para dejar margen a macOS y a las aplicaciones.
- GPU recomendada: procesadores Apple Silicon (M1, M2, M3, M4 con memoria unificada suficiente). El formato MLX no es compatible con GPUs NVIDIA ni AMD.
- No se ha confirmado que el modelo pueda ejecutarse en GPUs de consumo de otras arquitecturas; el formato MLX es específico de Apple.
- Opciones de despliegue: `mlx-lm` para inferencia local desde línea de comandos; también puede servirse mediante un endpoint compatible con OpenAI en oMLX, siempre que se tenga la versión 0.6.4+ con el parche K2-Horizon.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente sobre modelos comparables de la misma categoría. La única referencia directa es el modelo base `IFM/K2-Horizon-7B-Uno`, del cual no constan especificaciones detalladas en la información disponible. Tampoco hay datos concluyentes sobre la cuantización hermana `hermitdave/K2-Horizon-7B-oQ6e` más allá de su existencia en HuggingFace.

## Limitaciones y advertencias

- No se han publicado benchmarks, por lo que el rendimiento real en tareas estándar es desconocido.
- No se dispone de información sobre sesgos, riesgo de alucinación o limitaciones de contexto e idioma. Estos aspectos no están documentados en la información proporcionada.
- El formato MLX limita el despliegue a hardware Apple Silicon; no es compatible de forma nativa con vLLM, TGI o llama.cpp.
- Se requiere oMLX v0.6.4+ con el parche K2-Horizon (PR #3441); sin él, el modelo puede no cargarse o comportarse de forma incorrecta.
- La model card recomienda usar siempre `reasoning_effort="high"`. Ignorar esta recomendación puede degradar la calidad de las respuestas.
- El modelo se denomina "7B" pero el número real de parámetros es 8.999.178.240; esta discrepancia se debe probablemente a la fusión del adaptador LoRA y debe tenerse en cuenta al dimensionar los recursos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hermitdave/K2-Horizon-7B-Uno-oQ6e
- Modelo base: https://huggingface.co/IFM/K2-Horizon-7B-Uno
- Colección K2 Horizon de IFM: https://huggingface.co/collections/IFM/k2-horizon
- Parche de soporte en oMLX: https://github.com/jundot/omlx/pull/3441
- Cuantización hermana `K2-Horizon-7B-oQ6e`: https://huggingface.co/hermitdave/K2-Horizon-7B-oQ6e
- Hermes Agent (herramienta de conversión mencionada en la model card): https://hermes-agent.nousresearch.com
