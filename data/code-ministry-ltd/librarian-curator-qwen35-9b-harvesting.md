# code-ministry-ltd/librarian-curator-qwen35-9b-harvesting

## Resumen

El modelo `code-ministry-ltd/librarian-curator-qwen35-9b-harvesting` es un adaptador LoRA de rango 8 diseñado para el modelo base `unsloth/Qwen3.5-9B`. Lo desarrolla `code-ministry-ltd` como parte de su sistema de memoria duradera para agentes de codificacion, llamado The Librarian. El adaptador se especializa en la tarea de "harvesting" (cosecha), que consiste en extraer hechos durables de una transcripcion de conversacion asentada y convertirlos en candidatos a memorias que merezca la pena conservar.

El modelo base, Qwen3.5-9B, es un modelo de lenguaje de 9 mil millones de parametros con arquitectura transformer, licencia Apache-2.0 y ventana de contexto de 8.192 tokens (la que se uso en el entrenamiento). El adaptador se entrena mediante fine-tuning supervisado (SFT) con LoRA, sobre un conjunto de 100 casos de harvesting privados. El resultado es un modulo ligero que mejora la seleccion de hechos sin aumentar el numero de candidatos propuestos.

Este adaptador es relevante porque resuelve un problema concreto en la gestion de memoria de agentes: separar la informacion efimera de la durable. En lugar de usar el modelo base para todo el proceso de curacion, se puede usar este adaptador exclusivamente para la fase de harvesting, dejando las tareas de intake y grooming al modelo base o a otros adaptadores. El adaptador esta publicado bajo licencia Apache-2.0, al igual que el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA adaptador sobre Qwen3.5-9B (Transformer decoder) |
| Parametros totales | 14.548.992 (solo el adaptador; el modelo base tiene ~9 mil millones) |
| Parametros activos | 14.548.992 (el adaptador es el unico componente adicional) |
| Longitud de contexto | 8.192 tokens (ventana de entrenamiento; la del modelo base puede ser mayor, no especificado) |
| Tipos de cuantizacion | No especificados; se proporciona el adaptador en f16 para GGUF (Q8_0 recomendado para el modelo base) |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) y GGUF (adaptador LoRA f16) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 8 con alpha 8, entrenado mediante SFT con TRL y Unsloth Studio. El dataset de entrenamiento contiene 100 casos de harvesting compilados de la instancia privada del propietario; no se redistribuye. El entrenamiento se realizo con una ventana de 8.192 tokens (prompt + completado) y perdida solo sobre la parte de completado. Se entrenaron completados sin modo "thinking" (pensamiento), por lo que se recomienda desactivar el thinking durante la inferencia.

El adaptador se integra con el modelo base Qwen3.5-9B. La arquitectura base es un transformer de 9 mil millones de parametros con atencion por ventana de contexto, y este adaptador no introduce cambios arquitectonicos adicionales; solo ajusta los pesos de las capas seleccionadas mediante LoRA. La innovacion principal es la especializacion funcional: el adaptador esta disenado exclusivamente para la tarea de harvesting dentro del sistema The Librarian, que define un prompt unificado con secciones por trabajo (harvesting, intake y grooming). Este adaptador solo entrena la seccion de harvesting.

## Capacidades

- Extraccion de hechos durables de conversaciones multi-turno: el adaptador identifica informacion que merece ser almacenada como memoria candidata.
- Generacion de candidatos a memoria en formato estructurado, siguiendo el esquema de The Librarian.
- Seleccion de hechos con precision y cobertura equilibradas: segun los resultados del autor, mejora el F1 conjunto de 78,2 a 80,8 sin aumentar el numero de candidatos (65 candidatos en ambos casos).
- Soporte de integracion con el sistema The Librarian: se puede configurar como el modelo de harvesting dentro del curador, dejando intake y grooming en el modelo base u otros adaptadores.
- Compatibilidad con PEFT/transformers y con llama.cpp via GGUF LoRA.
- No se especifican capacidades multilingues; se asume que hereda las del modelo base, pero no se confirma.

## Casos de uso

- Gestion de memoria para agentes de codificacion: un agente que mantiene un historial de conversaciones con un programador puede usar este adaptador para extraer decisiones tecnicas, preferencias de estilo y requisitos de proyecto, y guardarlos como memorias duraderas en el vault de The Librarian.
- Automatizacion de resumen de reuniones: a partir de transcripciones de reuniones de equipo, el adaptador puede extraer acuerdos, tareas y datos de contacto que luego se convierten en notas estructuradas.
- Curaduria de conocimiento en asistentes virtuales: un asistente que conversa con usuarios puede filtrar los hechos importantes (por ejemplo, preferencias, datos personales no sensibles) y descartar informacion transitoria.
- Construccion de bases de conocimiento a partir de logs de soporte: el adaptador puede procesar historiales de tickets y chats de atencion al cliente para extraer problemas recurrentes y soluciones.
- Mejora de sistemas RAG: al extraer memorias de alta calidad de conversaciones, se alimenta el indice de recuperacion con informacion mas relevante y menos ruidosa.
- Integracion en pipelines de agentes multi-paso: cuando un agente mantiene una conversacion larga, el adaptador puede actuar como filtro de memoria en cada paso, reduciendo la carga de contexto y mejorando la coherencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor reporta un resultado especifico para la tarea de harvesting sobre una cohorte sellada:

| Metrica | Valor |
|---|---|
| F1 de harvesting (precision/cobertura conjunta) | 78,2 → 80,8 (despues del adaptador) |
| Numero de candidatos generados | 65 (igual para base y adaptador) |

Este resultado indica una mejora en la seleccion de hechos sin incrementar la cantidad de candidatos, lo que sugiere una mayor precision y cobertura en la deteccion de hechos durables.

## Requisitos de hardware

- Al ser un adaptador LoRA sobre Qwen3.5-9B, los requisitos de hardware dependen del modelo base. No se proporcionan datos especificos del adaptador.
- Para inferencia del modelo base Qwen3.5-9B en precision fp16 se estima una VRAM de alrededor de 18-20 GB, lo que requiere una GPU profesional como A100 o H100, o una consumer de gama alta como RTX 4090 (24 GB).
- Con cuantizacion int8 (Q8_0) se reduce a ~9-10 GB, cabiendo en GPUs con 12 GB (RTX 3060, RTX 4070) o mas.
- Con cuantizacion int4 (Q4_K_M) se puede llegar a ~5-6 GB, permitiendo su uso en GPU de 8 GB (RTX 3070, RTX 4060).
- El adaptador en si es muy ligero (14,5 millones de parametros) y apenas anade VRAM adicional (menos de 100 MB).
- Opciones de despliegue: con PEFT/transformers en Python, o con llama.cpp/llama-server usando el adaptador GGUF. Tambien es compatible con vLLM si se carga como adaptador LoRA.
- No se dispone de datos de latencia o throughput especificos.

## Comparativa con modelos similares

No se dispone de informacion sobre adaptadores similares para la tarea de harvesting de memoria. No obstante, se puede comparar con el modelo base Qwen3.5-9B sin adaptador: el adaptador mejora la F1 de harvesting de 78,2 a 80,8, manteniendo el mismo numero de candidatos. No se han encontrado otros adaptadores publicos para esta tarea concreta, por lo que la comparativa se limita a la base sin adaptar.

## Limitaciones y advertencias

- El adaptador esta entrenado exclusivamente para la tarea de harvesting; no debe usarse para intake o grooming, ni para otras tareas generales de generacion de texto.
- Se recomienda desactivar el modo "thinking" del modelo base durante la inferencia, ya que el entrenamiento se realizo con completados no-thinking.
- El dataset de entrenamiento es privado y no se redistribuye; no se conocen posibles sesgos en la seleccion de hechos derivados de los datos de entrenamiento.
- La ventana de entrenamiento es de 8.192 tokens; conversaciones mas largas podrian requerir un preprocesado o truncamiento.
- El modelo base Qwen3.5-9B puede tener limitaciones de idioma y sesgos propios, que se heredan en el adaptador.
- No se han publicado benchmarks de calidad general del modelo base en esta ficha; el unico resultado reportado es el F1 de harvesting sobre una cohorte especifica.
- Para uso en produccion, es necesario validar el comportamiento del adaptador en el dominio y con los datos reales, ya que el entrenamiento se limito a 100 casos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/code-ministry-ltd/librarian-curator-qwen35-9b-harvesting
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-9B
- Documentacion de The Librarian (curator): https://librarian-docs.codeministry.net/dashboard/curator/
- Guia de configuracion del curator: https://librarian-docs.codeministry.net/guides/configuring-the-curator/
- Pagina oficial de The Librarian: https://codeministry.net/the-librarian/
- Repositorio GitHub de The Librarian: https://github.com/code-ministry-ltd/the-librarian
