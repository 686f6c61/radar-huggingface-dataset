# DJack/Qwen3.5-4B-UD-Q4_K_XL-Japanese-imatrix-template-fixed

## Resumen

Este repositorio no contiene un modelo nuevo, sino una republicación del GGUF `Qwen3.5-4B-UD-Q4_K_XL` del autor dahara1 con una única modificación: la plantilla de chat incrustada en los metadatos del fichero. Los pesos son idénticos byte a byte al original. Se trata, por tanto, de un artefacto de corrección de metadatos orientado a runtimes que consumen la plantilla embebida en el GGUF (llama.cpp, PocketPal) en lugar de un fichero externo.

El problema que resuelve es concreto: la plantilla de chat original de Qwen3.5 emite un bloque `<think>` vacío en turnos históricos del asistente que no tienen contenido de razonamiento, lo que provoca que el prompt renderizado difiera del procesado previamente y rompa la reutilización de caché de prefijo en conversaciones multi-turno o con uso de herramientas. El resultado es reprocesamiento completo del contexto en cada turno, con la consiguiente penalización de latencia y consumo. La corrección no afecta a la corrección de las respuestas.

El modelo subyacente es Qwen3.5-4B en cuantización Q4_K_XL con matriz de importancia (imatrix) entrenada sobre datos japoneses, derivado del trabajo de dahara1. Cuenta con 4.205.751.296 parámetros y una licencia Apache 2.0. Está pensado para despliegue local en conversación japonesa e inglesa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5); detalles de capas y atención no disponibles en la información proporcionada |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | Q4_K_XL (GGUF); otras cuantizaciones no disponibles |
| Idiomas soportados | japones (ja), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (metadatos con plantilla de chat incrustada); tamano del repo 2,9 GB |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base Qwen3.5-4B (número de capas, tipo de atención, composición del dataset de entrenamiento, uso de RLHF/DPO o número de tokens). Lo que sí se documenta es el proceso de cuantización: se trata de una cuantización Q4_K_XL con matriz de importancia (imatrix) específica para japonés, producida por dahara1 sobre el modelo Qwen3.5-4B original. El prefijo "UD" en el nombre hace referencia al esquema de cuantización dinámica empleado por dicho autor.

La innovación técnica de este repositorio concreto es exclusivamente de metadatos. La plantilla de chat incrustada en el GGUF se sustituyó por la versión corregida de `chat_template.jinja` de dahara1 (actualización del 2026-04-09), que añade una condición de guarda: `{%- if loop.index0 > ns.last_query_index and reasoning_content %}`. Esta guarda evita emitir el bloque `<think>` vacío cuando no hay contenido de razonamiento, preservando la estabilidad del prefijo del prompt entre turnos. La reescritura se realizó con `gguf-new-metadata` de gguf-py (herramienta oficial de llama.cpp) mediante `--chat-template-file`, que reescribe únicamente metadatos y copia los tensores de forma literal. El fichero fuente tenía sha256 `e57e3a553c1e90e1d320980fe5a8312650a6f3d9b9dc7764377d80b19192f097`, verificado contra el hash publicado por Hugging Face.

## Capacidades

- Generación de texto conversacional en japonés e inglés.
- Conversaciones multi-turno con reutilización de caché de prefijo estable gracias a la corrección de la plantilla (en runtimes que usan la plantilla embebida).
- Uso de herramientas y conversaciones con tool calling, beneficiadas por la misma corrección de caché.
- Compatibilidad con endpoints (tag `endpoints_compatible`) para despliegue como servicio.
- Integración directa en llama.cpp y PocketPal sin necesidad de pasar plantilla externa.
- Capacidades específicas del modelo base Qwen3.5-4B (razonamiento, código, matemáticas, visión) no documentadas en la información proporcionada.

## Casos de uso

- Sustitución directa en despliegues PocketPal: descargar este GGUF en lugar del de dahara1 para obtener la plantilla corregida sin cambiar ajustes ni nombre de fichero, eliminando el reprocesamiento de contexto en chats multi-turno.
- Servidores llama.cpp con plantilla embebida: usar este fichero evita tener que pasar `--chat-template-file chat_template.jinja` en cada arranque y garantiza que todos los clientes que consumen el GGUF hereden la corrección.
- Asistentes conversacionales en japonés con sesiones largas: la estabilidad del prefijo reduce la latencia por turno en diálogos extensos, lo que mejora la experiencia en atención al cliente o asistentes personales.
- Pipelines de agentes con tool calling: al no romperse la caché de prefijo entre pasos, los flujos multi-paso con muchas llamadas a herramientas reducen el coste computacional y la latencia acumulada.
- Despliegue en hardware de consumo: con 2,9 GB en Q4_K_XL, el modelo cabe en GPUs de gama media y en equipos con poca VRAM, adecuado para prototipos locales y aplicaciones de escritorio.
- Evaluación y benchmarking de cuantizaciones japonesas: sirve como artefacto de referencia para comparar el efecto de la imatrix japonesa frente a cuantizaciones genéricas, manteniendo los pesos idénticos al original.
- Integración en aplicaciones compatibles con endpoints: el tag `endpoints_compatible` permite exponerlo como servicio HTTP en infraestructuras que ya consumen GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite explícitamente a la documentación del repositorio base para cualquier dato sobre calidad, cuantización o rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3 GB para el fichero Q4_K_XL de 2,9 GB, más overhead de contexto KV; el total depende de la longitud de contexto configurada, que no se documenta.
- GPU recomendadas: no especificadas en la información. Por tamaño, cualquier GPU con al menos 4 GB de VRAM libre debería poder cargarlo.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti, RTX 4070 y superiores; también en equipos con 8 GB de VRAM compartida. No se confirma en la información.
- Opciones de despliegue: llama.cpp (CLI y servidor), PocketPal; otros runtimes GGUF no confirmados.
- Latencia y throughput: no disponibles. La corrección de plantilla reduce el reprocesamiento en multi-turno, pero no se publican cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| DJack/Qwen3.5-4B-UD-Q4_K_XL-Japanese-imatrix-template-fixed | 4.205.751.296 | no disponible | Q4_K_XL GGUF | Apache 2.0 | Plantilla de chat embebida corregida; pesos idénticos al base |
| dahara1/Qwen3.5-4B-UD-japanese-imatrix | 4.205.751.296 (mismo base) | no disponible | Q4_K_XL GGUF | Apache 2.0 | Original; plantilla embebida sin corregir |
| Qwen/Qwen3.5-4B | 4.205.751.296 (según dato del repo) | no disponible | safetensors y otras | Apache 2.0 | Modelo original sin cuantizar ni imatrix japonesa |

## Limitaciones y advertencias

- No es un modelo nuevo: los pesos son idénticos al GGUF de dahara1; cualquier evaluación de calidad debe referirse al repositorio base.
- La corrección solo afecta al rendimiento en multi-turno y tool use (reutilización de caché); no corrige ni altera la corrección de las respuestas.
- Si el runtime ignora la plantilla embebida y usa una externa, la corrección no se aplica; en ese caso hay que pasar explícitamente `chat_template.jinja`.
- Republicación no oficial, no afiliada a dahara1 ni a Qwen; sin garantías de mantenimiento ni soporte.
- Idiomas limitados a japonés e inglés según la model card; el comportamiento en otros idiomas no está documentado.
- No se documentan sesgos, riesgo de alucinación, longitud de contexto efectiva ni restricciones adicionales de la licencia Apache 2.0 más allá de las estándar.
- Para uso en producción conviene validar el comportamiento del runtime concreto (versión de llama.cpp o PocketPal) respecto a la lectura de la plantilla embebida.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/DJack/Qwen3.5-4B-UD-Q4_K_XL-Japanese-imatrix-template-fixed
- Repositorio base (GGUF original): https://huggingface.co/dahara1/Qwen3.5-4B-UD-japanese-imatrix
- Modelo original: https://huggingface.co/Qwen/Qwen3.5-4B
- Herramientas gguf-py de llama.cpp: https://github.com/ggml-org/llama.cpp
- Informe del problema de caché en r/LocalLLaMA: https://www.reddit.com/r/LocalLLaMA/comments/1sg076h/i_tracked_a_major_cache_reuse_issue_down_to_qwen/
