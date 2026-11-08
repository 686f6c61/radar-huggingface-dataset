# 42ailab/Qwen3.5-9B-GGUF

## Resumen

Qwen3.5-9B es un modelo multimodal (texto e imagen) de la familia Qwen3.5, desarrollado por el equipo Qwen de Alibaba y publicado bajo licencia Apache-2.0. Este repositorio concreto, `42ailab/Qwen3.5-9B-GGUF`, no contiene un modelo nuevo ni una conversion propia: es una copia byte a byte de dos de los ficheros GGUF publicados por unsloth en `unsloth/Qwen3.5-9B-GGUF`, conservados por 42ailab como respaldo ante posibles renombrados o borrados del repositorio original. Los nombres de fichero, tamanos y digests sha256 coinciden con el original.

El modelo resuelve tareas de generacion de texto, reescritura y comprension de documentos largos, con especial solidez declarada en chino, y anade capacidad de lectura de imagenes mediante un proyector de vision separado. El tier de 9B se situa como opcion intermedia de la serie, apta para despliegue local en cuantizacion Q4_K_M (5,29 GiB de pesos mas 875,6 MiB del proyector en F16).

La relevancia de este repositorio es de infraestructura mas que de modelado: garantiza reproducibilidad de los bytes exactos para pipelines que dependen de los GGUF de unsloth, algo critico en despliegues con verificacion de integridad por hash. La ficha tecnica del modelo subyacente debe consultarse en la model card oficial de Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal texto-imagen de la familia Qwen3.5) |
| Parametros totales | 8.953.803.264 (8,95B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (pesos), F16 (proyector de vision) |
| Idiomas soportados | no disponible (la model card destaca chino e ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (`Qwen3.5-9B-Q4_K_M.gguf`, `mmproj-F16.gguf`) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna (tipo de transformer, atencion, composicion del dataset, numero de tokens de entrenamiento ni si se aplicaron RLHF o DPO). La model card de este repositorio de respaldo no incluye detalles tecnicos del modelo subyacente; remite implicitamente al repositorio oficial de Qwen.

Lo unico documentado a nivel de artefacto es la estructura de despliegue GGUF: un fichero de pesos cuantizado en Q4_K_M y un proyector multimodal independiente en F16 (`mmproj-F16.gguf`), patron habitual en llama.cpp para modelos con capacidad de vision. La conversion fue realizada por unsloth y este repositorio la replica sin modificaciones, verificable mediante los sha256 publicados.

## Capacidades

- Generacion de texto conversacional y continuacion de documentos.
- Reescritura y comprension de documentos largos (declarado en la model card).
- Escritura en chino con mayor estabilidad que tiers inferiores, segun el autor.
- Lectura de imagenes (image-text-to-text) mediante el proyector de vision incluido.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Despliegue local en escritorio: el paquete esta pensado para la aplicacion 42model, que descarga el modelo desde su biblioteca o mediante `42model download qwen3.5:9b-q4_k_m`; adecuado para equipos con GPU de consumo gracias al peso de 5,29 GiB en Q4_K_M.
- Verificacion de integridad en produccion: los digests sha256 publicados permiten validar cada fichero antes de cargarlo, util en pipelines que exigen reproducibilidad estricta de los pesos.
- Espejo de disponibilidad: sirve como fuente alternativa si el repositorio de unsloth deja de estar disponible, evitando roturas en CI/CD que descarguen los GGUF por URL fija.
- Procesamiento de documentos con imagenes: la pareja pesos + `mmproj-F16` permite tareas image-text-to-text, como extraer informacion de capturas o digitalizaciones acompanadas de texto.
- Redaccion y reescritura en chino: el tier 9B esta descrito como mas estable en escritura y reescritura en chino, lo que lo hace util para equipos de localizacion o atencion al cliente en ese idioma.
- Inferencia con llama.cpp u Ollama: el formato GGUF Q4_K_M encaja directamente en estos runtimes, permitiendo servir el modelo en CPU o GPU mixtas sin conversion adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: los pesos Q4_K_M ocupan 5,29 GiB; el proyector de vision anade 875,6 MiB. El consumo real depende del contexto y del runtime, pero el conjunto cabe holgadamente en GPUs de 8 GB para uso solo texto y roza el limite en 8 GB con vision activa.
- GPU recomendadas: no disponible en la informacion proporcionada; por tamano, tarjetas de 12-16 GB (RTX 4070 Ti, RTX 4080, RTX 4090) ofrecen margen comodo para contexto largo.
- GPU de consumo: si, en modelos con 8 GB o mas de VRAM en Q4_K_M; en 6 GB seria ajustado y probablemente requiera offload parcial a CPU.
- Opciones de despliegue: llama.cpp y Ollama son los objetivos naturales del formato GGUF; la app 42model lo integra de serie. vLLM y TGI no estan confirmados para este artefacto en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| 42ailab/Qwen3.5-9B-GGUF (este repo) | 8,95B | no disponible | GGUF Q4_K_M + mmproj F16 | Apache-2.0 | Copia byte a byte de unsloth; 2 ficheros |
| unsloth/Qwen3.5-9B-GGUF | 8,95B | no disponible | GGUF (varias cuantizaciones) | Apache-2.0 | Fuente original de la conversion |
| bartowski/Qwen_Qwen3.5-9B-GGUF | 8,95B | no disponible | GGUF | Apache-2.0 | Conversion alternativa del mismo modelo base |
| Interlinkarts/Qwen3.5-9B-GGUF | 8,95B | no disponible | GGUF | Apache-2.0 | Duplicado de unsloth |

Las cuatro entradas comparten el mismo modelo subyacente; difieren en la conversion, el conjunto de cuantizaciones ofrecido y el mantenimiento del repositorio. No hay datos de rendimiento comparativos en la informacion disponible.

## Limitaciones y advertencias

- Este repositorio no es un modelo nuevo ni una conversion propia: es un respaldo de dos ficheros de unsloth. Cualquier duda sobre calidad o comportamiento debe contrastarse con el repositorio original.
- Solo se incluyen dos ficheros (Q4_K_M y proyector F16); no hay otras cuantizaciones (Q2, Q5, Q8, etc.) en este repositorio.
- Sesgos conocidos: no disponible; la model card no documenta evaluaciones de sesgo.
- Riesgo de alucinacion: no evaluado en la informacion disponible; es un riesgo inherente a modelos generativos de este tamano.
- Limitaciones de idioma: los idiomas soportados no estan listados; la model card solo menciona chino e ingles de forma cualitativa.
- Longitud de contexto: no disponible, lo que impide planificar tareas de documento largo con cifras concretas.
- Licencia: Apache-2.0 permite uso comercial, pero conviene conservar el fichero `LICENSE` incluido y atribuir la conversion a unsloth y el modelo a Qwen, tal como indica el autor.
- El nombre del repositorio menciona Qwen3.5, pero la fecha de creacion (2026-11-08) y la ausencia de datos oficiales de Qwen en esta informacion impiden verificar la procedencia exacta del modelo base; validar contra el repositorio oficial antes de produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/42ailab/Qwen3.5-9B-GGUF
- Repositorio original de la conversion (unsloth): https://www.modelscope.cn/models/unsloth/Qwen3.5-9B-GGUF
- Espejo en ModelScope: https://modelscope.cn/models/42ailab/Qwen3.5-9B-GGUF
- Sitio del autor: https://42ailab.com
- Aplicacion 42model: https://42model.com
- Duplicado en Hugging Face: https://huggingface.co/Interlinkarts/Qwen3.5-9B-GGUF
- Conversion alternativa de bartowski: https://huggingface.co/bartowski/Qwen_Qwen3.5-9B-GGUF
