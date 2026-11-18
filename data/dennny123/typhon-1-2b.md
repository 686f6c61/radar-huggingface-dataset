# dennny123/Typhon-1.2B

## Resumen

Typhon-1.2B es un modelo de lenguaje de 1.170 millones de parametros desarrollado por el usuario dennny123 y publicado en Hugging Face. Se trata de un ajuste fino completo (full fine-tune) del modelo base LiquidAI/LFM2.5-1.2B-Base, orientado a una tarea muy concreta: convertir texto escrito de forma rapida y descuidada (errores tipograficos, palabras unidas o separadas, abreviaturas de chat, mayusculas y puntuacion incorrectas) en texto limpio y bien redactado, preservando el significado y el registro del mensaje original.

El modelo resuelve un problema cotidiano en aplicaciones de mensajeria: la correccion de texto en tiempo real en dispositivos locales. Segun la model card, una version cuantizada a 4 bits en formato MLX tarda aproximadamente 190 ms por mensaje en un Apple M4 con un peso de 0.66 GB, lo que lo hace viable para inferencia on-device. La arquitectura subyacente es LFM2 (familia de modelos de Liquid AI), de tipo transformer, con 1.2B parametros y licencia LFM Open License v1.0.

Es relevante ahora porque demuestra un caso de uso de ajuste fino muy especializado sobre un modelo pequeno: en lugar de competir en capacidades generales, el modelo se entrena con 222.000 ejemplos para una unica tarea de reescritura y correccion, con evaluacion honesta frente a un modelo frontera (Claude Opus). El modelo solo soporta ingles y esta pensado para ejecucion local, no para despliegues en servidor a gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia LFM2 de Liquid AI) |
| Parametros totales | 1.170.340.608 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit MLX (version publicada); bfloat16 en transformers |
| Idiomas soportados | Ingles (en) |
| Licencia | LFM Open License v1.0 (license: other, license_name: lfm1.0) |
| Formato de pesos | safetensors |
| Modelo base | LiquidAI/LFM2.5-1.2B-Base |
| Tamano del repo | 2.3 GB |
| Pipeline | text-generation |
| Libreria | transformers |

## Arquitectura y entrenamiento

Typhon-1.2B es un ajuste fino completo del modelo LiquidAI/LFM2.5-1.2B-Base, que pertenece a la familia LFM2 de Liquid AI. No se dispone en la informacion proporcionada de detalles sobre la arquitectura interna del modelo base (tipo de atencion, capas, dimensiones ocultas ni longitud de contexto), por lo que esos datos se consideran no disponibles. El modelo se distribuye en safetensors con pesos en bfloat16 y existe una version cuantizada a 4 bits en formato MLX para ejecucion en Apple Silicon.

El entrenamiento se realizo en tres etapas. Primero, un calentamiento (warm-up) con pares sinteticos de errores tipograficos. Segundo, aproximadamente 57.000 mensajes reales escritos por una persona, cada uno etiquetado con una version correctamente redactada por Claude Opus, con revision por un evaluador de IA (DeepSeek) que descarto solo los casos con problemas de significado. Tercero, aproximadamente 108.000 pares de mensajes cotidianos: 97.000 generados por DeepSeek V4 Pro (version casual y version correcta, filtrados por IA, con una auditoria de Opus que califico el 82% como buenos y el 0% como malos) y 10.000 generados por Claude Opus. Los errores tipograficos se introdujeron con un muestreador ajustado al patron de escritura real de esa persona (el 44% de sus errores son letras intercambiadas; el muestreador supera 59 comprobaciones estadisticas contra su escritura real). En total, 222.000 ejemplos de entrenamiento.

La innovacion tecnica destacable no esta en la arquitectura sino en el proceso de datos: el ajuste del muestreador de errores al estilo real de escritura de un usuario concreto, y el uso de modelos frontera como etiquetadores y auditores de calidad. El formato de prompt es especifico y critico para el funcionamiento: `Polish: <texto>\nOut: ` con decodificacion greedy.

## Capacidades

- Correccion de errores tipograficos: letras intercambiadas, letras omitidas, teclas vecinas pulsadas por error.
- Correccion de palabras unidas o separadas incorrectamente.
- Correccion de mayusculas y puntuacion.
- Expansion de abreviaturas de chat (u → you, rn → right now, im → I'm).
- Reescritura de texto preservando el significado y el registro del mensaje original.
- Generacion de texto conversacional en ingles dentro del contexto de la tarea de pulido.
- Ejecucion on-device en tiempo real (aproximadamente 190 ms por mensaje en Apple M4 con MLX 4-bit).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Correccion en tiempo real en aplicaciones de mensajeria: el modelo puede integrarse en el cliente de chat para pulir el texto antes de enviarlo, con latencia de aproximadamente 190 ms en un Apple M4 y un peso de 0.66 GB en 4-bit MLX, lo que permite ejecucion local sin enviar datos a la nube.
- Procesamiento de mensajes de chat archivados: normalizar conversaciones historicas con errores tipograficos y abreviaturas para hacerlas legibles en busquedas, resumenes o exportaciones.
- Preprocesamiento para pipelines de NLP: limpiar texto informal antes de tareas posteriores como analisis de sentimiento, clasificacion o extraccion de entidades, reduciendo la tasa de error de caracteres del 14,8% al 6,95% segun la evaluacion del autor.
- Asistencia a la escritura en ingles para usuarios no nativos: corregir mensajes rapidos sin cambiar el estilo ni el contenido, manteniendo el registro casual.
- Normalizacion de datos de entrenamiento: convertir corpus de mensajes informales en pares (texto sucio, texto limpio) para entrenar otros modelos de correccion o de chat.
- Herramienta de escritorio de productividad: integracion como utilidad local en macOS que pulle el texto seleccionado o el portapapeles antes de pegarlo en otra aplicacion.
- Filtrado de calidad en plataformas de mensajeria: detectar y corregir automaticamente mensajes con errores graves antes de publicarlos, con la advertencia de revisar mensajes importantes por riesgo de cambio de significado.

## Benchmarks y rendimiento

Evaluacion ciega por pares con juez Claude Opus, comparando contra la reescritura one-shot del propio Claude Opus sobre el mismo mensaje. "Este modelo mejor" indica que el juez prefirio la salida de Typhon; "ambos buenos" indica empate.

| Conjunto de prueba | Este modelo mejor | Claude mejor | Ambos buenos |
|---|---|---|---|
| Mensajes cotidianos (400, patron de errores aplicado) | 15% | 66% | 18% |
| Escritura real del autor, conversaciones reservadas (Polish) | 23% | 57% | 16% |

Un segundo juez (DeepSeek V4 Pro) sobre el conjunto de mensajes cotidianos: este modelo mejor 29%, Claude mejor 68%. La tasa de error de caracteres frente a la referencia en el conjunto cotidiano es del 6,95% (sin correccion: 14,8%).

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 2,3 GB para los pesos (1.170 millones de parametros a 2 bytes por parametro), mas memoria para el contexto y el tokenizador.
- Version cuantizada 4-bit MLX: 0.66 GB de peso, segun la model card.
- GPU recomendadas: no se especifican en la informacion disponible. Por tamano, cabe en cualquier GPU consumer con al menos 4 GB de VRAM en bfloat16 y en Apple Silicon con MLX.
- Cabe en GPU consumer: si, incluidas tarjetas de gama media y Apple M-series.
- Opciones de despliegue: transformers (con `AutoModelForCausalLM` y `AutoTokenizer`), MLX en macOS. No se documentan vLLM, llama.cpp, Ollama ni TGI en la informacion proporcionada.
- Latencia y throughput: aproximadamente 190 ms por mensaje en Apple M4 con la version 4-bit MLX (dato medido por el autor). No se dispone de datos de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Typhon-1.2B | 1.170 M | no disponible | Correccion y reescritura de texto | LFM Open License v1.0 | Hugging Face (dennny123/Typhon-1.2B) |
| LiquidAI/LFM2.5-1.2B-Base | 1.200 M (aproximado) | no disponible | Modelo base de proposito general | LFM Open License v1.0 | Hugging Face (LiquidAI) |
| Claude Opus (referencia del autor) | no disponible | no disponible | Modelo frontera de proposito general | Propietaria | API de Anthropic |

La comparativa con Claude Opus se basa en la evaluacion del propio autor: en mensajes cotidianos, el juez prefirio la salida de Typhon en el 15% de los casos frente al 66% de Claude, con un 18% de empates. No se dispone de comparativas con otros modelos especializados en correccion gramatical en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles. No se ha entrenado ni evaluado en otros idiomas.
- Esta ajustado al estilo de escritura de una persona concreta, aunque generaliza a errores tipograficos comunes.
- En entradas muy corruptas puede producir una frase fluida con significado incorrecto; el autor recomienda revisar los mensajes importantes.
- Reescribe abreviaturas y puntuacion por diseno; no es adecuado si se quiere conservar el estilo exacto del texto original.
- Parte de los datos de entrenamiento son chats privados de una persona, por lo que el modelo puede haber incorporado nombres y temas de esas conversaciones. Riesgo de fuga de informacion personal.
- La licencia LFM Open License v1.0 impone terminos sobre uso comercial; es necesario revisar el archivo LICENSE antes de un despliegue en produccion.
- Riesgo de alucinacion en la reescritura: el modelo puede inventar contenido al "corregir" texto ambiguo, como admite el propio autor en el ejemplo `nee doerquesg ocfjjly` → "need to request off July".
- No se documentan capacidades de tool calling, agentes ni contexto largo, por lo que no es adecuado para tareas generales de razonamiento.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dennny123/Typhon-1.2B
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Base
- Licencia LFM Open License v1.0: referenciada como LICENSE en el repositorio del modelo (https://huggingface.co/dennny123/Typhon-1.2B/blob/main/LICENSE)
