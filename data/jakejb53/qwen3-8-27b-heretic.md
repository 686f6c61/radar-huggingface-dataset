# jakejb53/Qwen3.8-27B-heretic

## Resumen

Qwen3.8-27B-heretic es una version "decensurada" (abliterada) del modelo Qwen3.8-27B de Alibaba, creada por jakejb53 mediante la herramienta Heretic v1.4.0. El proceso de abliteracion elimina los mecanismos de rechazo (refusal) del modelo original, reduciendo las respuestas de rechazo de 63/100 a 0/100 en las pruebas del autor, con una divergencia KL de solo 0,0236 respecto al modelo base, lo que indica que las capacidades generales se mantienen practicamente intactas.

El modelo base, Qwen3.8-27B, es un modelo de lenguaje causal con encoder de vision de 27 000 millones de parametros que combina una arquitectura hibrida de atencion lineal (Gated DeltaNet) con atencion clasica (Gated Attention), soporta contexto nativo de 262 144 tokens ampliable a 1 000 000, y ofrece capacidades de comprension de imagen y video, modo de razonamiento (thinking) configurable y prediccion multi-token (MTP).

Esta ficha resulta relevante para desarrolladores que necesitan un modelo de 27B con capacidades vision-language, contexto largo y sin restricciones de rechazo para casos de uso donde el modelo base rechazaria peticiones legitimas, manteniendo la licencia Apache 2.0 que permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: Gated DeltaNet (atencion lineal) + Gated Attention + FFN, con encoder de vision |
| Parametros totales | 27 356 728 560 (27,36 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens nativo, ampliable a 1 000 000 |
| Tipos de cuantizacion | bf16 (confirmado); otras cuantizaciones no disponibles en la informacion |
| Idiomas soportados | No disponible (no especificado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers, vLLM, SGLang, TokenSpeed) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B utiliza una arquitectura hibrida que combina capas de atencion lineal Gated DeltaNet con capas de atencion clasica Gated Attention. La configuracion interna se organiza en 64 capas con dimension oculta de 5120, siguiendo un patron repetitivo de 16 bloques donde cada bloque contiene 3 sub-bloques de (Gated DeltaNet → FFN) seguidos de 1 sub-bloque de (Gated Attention → FFN). El Gated DeltaNet emplea 48 cabezas de atencion lineal para V y 16 para QK con dimension de cabeza 128, mientras que el Gated Attention utiliza 24 cabezas para Q y 4 para KV con dimension 256 y RoPE de dimension 64. El FFN tiene dimension intermedia de 17 408. Ademas, el modelo incorpora prediccion multi-token (MTP) entrenada con multiples pasos, y su entrenamiento incluye fases de pre-training y post-training.

La version heretic se obtiene mediante abliteracion con Heretic v1.4.0, un proceso que identifica y elimina las direcciones en el espacio de activaciones responsables del comportamiento de rechazo. Los parametros de abliteracion incluyen un direction_index de 34,16 y ajustes especificos en los pesos de attn.o_proj y mlp.down_proj. Segun las metricas del autor, el proceso reduce los rechazos de 63/100 a 0/100 con una divergencia KL de 0,0236, indicando una alteracion minima del comportamiento general del modelo.

## Capacidades

- Generacion de texto y razonamiento con modo thinking configurable: activado por defecto, desactivable por peticion, con parametro reasoning_effort para ajustar la profundidad y preserve_thinking para retener contexto de razonamiento historico.
- Comprension vision-language nativa: procesa imagenes y videos, incluyendo diagramas STEM, documentos y videos de hasta una hora de duracion.
- Ejecucion de tareas agente (agentic): planificacion autonoma y manejo de feedback del entorno para completar tareas multi-paso de forma fiable.
- Soporte de tool calling y function calling, implicito en las capacidades agente del modelo base.
- Prediccion multi-token (MTP): genera multiples tokens por paso, mejorando el throughput en inferencia.
- Capacidades multilingues heredadas de la familia Qwen, aunque el alcance exacto no esta especificado en la model card.
- Ausencia de rechazo (refusal): el modelo no muestra comportamiento de rechazo ante peticiones, gracias al proceso de abliteracion.

## Casos de uso

- Atencion al cliente automatizada: con 262 144 tokens de contexto nativo, el modelo puede gestionar conversaciones multi-turno muy largas manteniendo el historial completo, y al no tener rechazos, puede abordar cualquier consulta del usuario sin bloqueos.
- Generacion de codigo en produccion: soporta tool calling y puede integrarse en pipelines de CI/CD para generacion, revision y refactorizacion de codigo, con capacidades de razonamiento que mejoran la calidad de las soluciones.
- Analisis de documentos y diagramas tecnicos: su encoder de vision permite procesar imagenes de diagramas STEM, esquemas de arquitectura y documentos escaneados, combinando comprension visual con razonamiento textual.
- Agentes autonomos multi-paso: las capacidades de planificacion y manejo de feedback del entorno lo hacen adecuado para agentes que ejecutan tareas complejas con multiples herramientas y llamadas a APIs.
- Investigacion y analisis de contenido sensible: para investigadores que necesitan analizar contenido controversial o delicado sin que el modelo rechace la peticion, manteniendo la calidad de razonamiento del modelo base.
- Procesamiento de video de larga duracion: con soporte para videos de hasta una hora y contexto extenso, puede resumir, transcribir y analizar contenido audiovisual para aplicaciones de monitorizacion o documentacion.
- Asistentes de escritura creativa sin restricciones: para generacion de contenido narrativo que requiera explorar temas que otros modelos rechazarian, con la calidad de escritura del modelo Qwen3.8.

## Benchmarks y rendimiento

La model card del modelo base referencia una tabla de benchmarks comparativos entre Qwen3.8-27B, Qwen3.6-27B, Qwen3.7-Plus y Muse Glimmer-30B, pero los datos numericos no estan disponibles en la informacion proporcionada. El autor de la version heretic solo publica metricas de abliteracion: divergencia KL de 0,0236 y 0 rechazos en 100 pruebas (frente a 63/100 en el modelo original).

No se han publicado resultados de benchmarks completos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 55 GB (el repositorio ocupa 54,8 GB en bf16), lo que requiere una GPU profesional de 80 GB (A100, H100) o varias GPUs en paralelo.
- Con cuantizacion a 4 bits (no proporcionada oficialmente pero posible mediante conversion con herramientas como llama.cpp o AutoGPTQ), la VRAM necesaria se reduce a aproximadamente 14-16 GB, permitiendo ejecucion en GPUs de consumo como RTX 4090 (24 GB).
- GPU recomendadas: A100 80 GB, H100 80 GB para bf16 sin cuantizar; RTX 4090, RTX 3090 o similar para cuantizacion de 4 bits.
- Opciones de despliegue: vLLM, SGLang, TokenSpeed, Hugging Face Transformers. El modelo es compatible con endpoints de vLLM segun los tags del repositorio.
- Latencia y throughput: no disponible en la informacion proporcionada. La arquitectura con Gated DeltaNet y MTP deberia ofrecer mejor throughput que un transformer denso equivalente, pero no hay datos concretos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Refusal |
|---|---|---|---|---|---|
| Qwen3.8-27B-heretic | 27,36 B | 262 K (1 M ext.) | Si | Apache 2.0 | No (0/100) |
| Qwen3.8-27B (original) | 27,36 B | 262 K (1 M ext.) | Si | Apache 2.0 | Si (63/100) |
| Qwen3.6-27B | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparativa con Qwen3.6-27B se basa unicamente en la referencia de la model card; los datos completos de ese modelo no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- El proceso de abliteracion elimina los mecanismos de rechazo, lo que significa que el modelo puede generar contenido inapropiado, ofensivo o peligroso sin filtro. Esto lo hace inadecuado para aplicaciones de cara al publico sin moderacion externa.
- La divergencia KL de 0,0236 indica una alteracion minima pero no nula del comportamiento del modelo base; puede haber degradaciones sutiles en ciertas tareas.
- No se han publicado evaluaciones de seguridad o alineacion para esta version abliterada; el modelo no debe desplegarse en produccion sin evaluacion previa de riesgos.
- Los idiomas soportados no estan especificados en la model card; aunque la familia Qwen es multilingue, no se confirma el alcance exacto para esta version.
- El modelo requiere aproximadamente 55 GB de VRAM en bf16, lo que limita su despliegue a infraestructura profesional o requiere cuantizacion adicional.
- No hay informacion sobre la calidad de la cuantizacion en formatos distintos a bf16, ya que solo se proporcionan pesos en safetensors.
- La fecha de creacion del repositorio (agosto de 2026) y la ausencia de descargas sugieren que el modelo es reciente y no ha sido ampliamente validado por la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/jakejb53/Qwen3.8-27B-heretic
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Proyecto Heretic: https://heretic-project.org
- Qwen Cloud (servicio gestionado del modelo base): https://www.qwencloud.com/models/qwen3.8-27b
