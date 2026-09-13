# Schestex/Qwen3.8-27B-ColdFusion-NVFP4-NInfer

## Resumen

Qwen3.8-27B-ColdFusion-NVFP4-NInfer es un artefacto de cuantizacion NVFP4 generado por el usuario Schestex a partir del modelo DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1. No se trata de un modelo entrenado desde cero ni de un fine-tuning nuevo: es el mismo modelo base empaquetado en el formato propietario `.ninfer` del runtime NInfer, con pesos de 4 bits en punto flotante (NVFP4) y una calibracion especifica orientada a cargas de trabajo de codificacion agentica. La relevancia de esta publicacion es operativa: permite ejecutar un modelo de 27B en GPUs NVIDIA Blackwell de 24 GB, algo que en precision completa o en formatos de 8 bits no cabria con comodidad.

El objetivo declarado por el autor es la codificacion agentica local, el tool calling, el trabajo sobre repositorios y los bucles de agente largos. Para ello, la calibracion no se hizo con texto generico, sino con 256 muestras procedentes de tres datasets de trazas de agentes de software (Open-SWE-Traces de NVIDIA, agentic-coding-trajectories de Thoughtworks y SWE-agent-trajectories de Nebius), fijadas a revisiones concretas y con una mezcla de categorias que prioriza TypeScript/Svelte, Go, DevOps/Git/CI, C++ y Kotlin/Gradle. El artefacto se publica en dos variantes: una completa con texto, MTP, vision y DFlash2, y otra sin pesos de vision.

Los datos publicos son escasos: no hay licencia declarada, no se indican idiomas soportados, no hay benchmarks y el repositorio acumula 4 descargas y 0 likes en el momento de la consulta. Ademas, el artefacto exige hardware Blackwell y un runtime especifico, lo que limita su evaluacion a quien disponga de ese entorno. Conviene tratarlo como una pieza de infraestructura para despliegue local, no como una alternativa generalista lista para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada en la informacion disponible. Se trata de una cuantizacion NVFP4 del modelo base DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1; el pipeline es text-generation, pero la ficha no confirma la arquitectura subyacente |
| Parametros totales | 27B segun la denominacion del modelo; no confirmado de forma explicita en la informacion disponible |
| Parametros activos | No aplica / no disponible (no se indica que el modelo sea MoE) |
| Longitud de contexto | Configurable en el runtime. Los ejemplos oficiales de servicio usan `--max-context 32768` y `--max-context 123904` con KV en int8. La ventana nativa del modelo base no se especifica |
| Tipos de cuantizacion | NVFP4 (calibracion post-entrenamiento con 256 muestras, longitud de secuencia 8192, seed 38027); cache KV en int8 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (debe verificarse en el modelo base) |
| Formato de pesos | `.ninfer` (artefacto propietario del runtime NInfer). No es un checkpoint Transformers estandar |

Otros datos de interes: tamano del repositorio 47,1 GB; libreria declarada `ninfer`; modelo base `DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1` con relacion `quantized`; fecha de creacion segun metadatos, 13 de septiembre de 2026.

## Arquitectura y entrenamiento

Este repositorio no contiene un entrenamiento nuevo. Segun la propia ficha, el modelo fuente no fue ajustado con las muestras de calibracion: el proceso aplicado es una cuantizacion post-entrenamiento (PTQ) mediante `llm-compressor` en el commit `b52e76d66a6f47275c33dd59342a90ae7c50d34a` y el runtime NInfer en el commit `d49296868dcc17bd478ec185f0d3a801bcc0bf56`. La calibracion usó 256 muestras con longitud de secuencia 8192 y semilla 38027, extraidas de tres datasets fijados a revisiones concretas: `nvidia/Open-SWE-Traces@31cfd320...` (160 muestras), `thoughtworks/agentic-coding-trajectories@cef72d1f...` (64 muestras) y `nebius/SWE-agent-trajectories@68195a14...` (32 muestras). La mezcla por categorias incluye 48 muestras de TypeScript/Svelte, 36 de Go, 32 de DevOps/Git/CI, 24 de C++, 24 de Kotlin/Gradle, 16 de JVM/Gradle, 16 de Svelte/TypeScript, 16 de trayectorias SWE resueltas, 16 de recuperacion de errores, 16 generales de agente y 12 de bucles de agente largos.

El artefacto completo incluye componentes de texto, MTP, vision y DFlash2; la variante "no vision" conserva texto, MTP y DFlash2 pero omite los pesos de vision. La ficha no detalla que son MTP ni DFlash2 mas alla de su presencia en el paquete, ni describe la arquitectura interna del modelo base (atencion, numero de capas, cabezas o vocabulario). La cuantizacion NVFP4 esta pensada para aprovechar las unidades de computo de 4 bits de las GPU NVIDIA Blackwell, con el objetivo de reducir el espacio de pesos y el ancho de banda de memoria durante la inferencia.

## Capacidades

- Generacion de texto conversacional y continuacion de contexto mediante una API compatible con el endpoint `/v1/chat/completions`.
- Codificacion agentica: el autor orienta explicitamente el artefacto a flujos de agente sobre repositorios, segun se refleja en la mezcla de calibracion (TypeScript/Svelte, Go, C++, Kotlin/Gradle, DevOps/Git/CI).
- Tool calling y function calling, declarados como etiquetas y objetivo del build.
- Bucles de agente largos y trayectorias multi-paso, incluida la categoria de calibracion especifica de "long agent loops" y trayectorias de recuperacion de errores.
- Vision en la variante completa del artefacto (incluye pesos de vision); la variante "no vision" no los incorpora.
- Decodificacion con MTP y DFlash2, declarados como componentes incluidos en ambas variantes. No se detalla su funcionamiento en la informacion disponible.
- Capacidades multilingues: no disponible.
- Modo thinking o razonamiento explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Agente de codificacion sobre repositorios locales: el artefacto esta calibrado con trazas SWE reales y soporta tool calling, por lo que puede encadenar lectura de ficheros, edicion, ejecucion de tests y correccion de errores dentro de un bucle de agente en una estacion de trabajo con GPU Blackwell de 24 GB.
- Automatizacion de tareas de DevOps y CI: la mezcla de calibracion incluye 32 muestras de DevOps/Git/CI, lo que lo hace util para generar y corregir ficheros de pipeline, resolver conflictos de merge o interpretar salidas de jobs fallidos.
- Asistencia en migraciones de lenguaje o framework: al cubrir TypeScript/Svelte, Go, C++ y Kotlin/Gradle, puede emplearse para traducir fragmentos entre estos ecosistemas y adaptar APIs entre ellos.
- Revision de codigo asistida en local: con 32K a 123904 tokens de contexto configurable, puede cargar varios ficheros o un diff extenso y producir comentarios de revision sin enviar codigo propietario a servicios externos.
- Recuperacion de sesiones de agente bloqueadas: las trayectorias de recuperacion incluidas en la calibracion apuntan a escenarios en los que el agente debe deshacer un cambio erroneo o reintentar una estrategia tras un fallo de compilacion.
- Servicio interno con API compatible con OpenAI: se expone en el puerto indicado con `/v1/chat/completions`, de modo que puede integrarse como backend de herramientas internas de desarrollo que ya hablan el protocolo de OpenAI.
- Procesamiento de documentacion tecnica con imagenes (variante completa): gracias a los pesos de vision, puede extraer informacion de diagramas, capturas de pantalla de interfaces o esquemas de arquitectura presentes en la documentacion de un proyecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha del repositorio no incluye metricas de MMLU, HumanEval, GSM8K, SWE-bench ni de ninguna otra evaluacion, ni comparaciones numericas con el modelo base o con otras cuantizaciones. El autor indica de forma explicita que el rendimiento y la calidad deben evaluarse contra el modelo original y otros artefactos NInfer para la carga de trabajo prevista.

## Requisitos de hardware

- VRAM estimada: el autor documenta su uso en una GPU NVIDIA Blackwell de 24 GB (RTX PRO 4000 Blackwell SFF). El repositorio ocupa 47,1 GB, por lo que el artefacto distribuido no cabe completo en memoria de video y debe servirse desde disco con el runtime adecuado.
- GPU compatibles: el formato NVFP4 esta orientado a NVIDIA Blackwell. No hay confirmacion en la informacion disponible sobre soporte en generaciones anteriores (Ada, Ampere) ni en GPU de otros fabricantes.
- Consumo de contexto: con KV cache en int8 y contexto fijado a 123904 tokens, el autor reporta que la reserva de runtime queda ligeramente por encima de lo disponible en una GPU de 24 GB, por lo que recomienda `--kv-capacity auto` cuando la VRAM es ajustada.
- Despliegue: runtime NInfer mediante `ninfer-lab serve`, con parametros `--build`, `--model`, `--gpu`, `--port`, `--max-context`, `--kv-capacity`, `--max-concurrency` y `--kv-dtype int8`. Se expone un endpoint compatible con la API de chat completions de OpenAI.
- Compatibilidad con otros motores: no disponible. La ficha indica explicitamente que el repositorio contiene un artefacto NInfer y no un checkpoint Transformers estandar, por lo que no hay soporte documentado en vLLM, llama.cpp, Ollama o TGI.
- Concurrencia y latencia: no disponible. Los ejemplos oficiales usan `--max-concurrency 1`, pero no se publican cifras de tokens por segundo ni de latencia.
- Verificacion de integridad: el autor proporciona el SHA-256 esperado del artefacto principal, `ae61476e16c641adcaf101e34001cff1fc3456f068083fc5e4eade8a0bcb6d9f`, comprobable con `sha256sum`.

## Comparativa con modelos similares

La informacion disponible solo permite comparar el artefacto con su propio modelo base; no se documentan otras cuantizaciones NInfer ni alternativas equivalentes.

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Schestex/Qwen3.8-27B-ColdFusion-NVFP4-NInfer | 27B (segun denominacion) | Configurable hasta 123904 tokens en el runtime de ejemplo; ventana nativa no especificada | `.ninfer` (NVFP4) | no disponible | HuggingFace, requiere runtime NInfer |
| DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1 (modelo base) | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| Otras cuantizaciones del mismo base (GGUF, AWQ, GPTQ, etc.) | no disponible | no disponible | no disponible | no disponible | no confirmadas en la informacion disponible |

## Limitaciones y advertencias

- Licencia no declarada: el repositorio no indica licencia. Antes de cualquier uso comercial hay que verificar la licencia del modelo base DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1 y, en su caso, la de los modelos de los que este derive.
- Dependencia de hardware: los pesos NVFP4 y el runtime NInfer estan orientados a NVIDIA Blackwell. Sin ese hardware no hay via de ejecucion documentada.
- Formato no portable: al no ser un checkpoint Transformers estandar, no se puede cargar con `transformers`, vLLM, llama.cpp, Ollama ni TGI segun la informacion proporcionada. Esto dificulta la integracion en infraestructura existente y crea dependencia de un unico runtime.
- Riesgo de degradacion por cuantizacion: es una cuantizacion post-entrenamiento a 4 bits sobre un modelo de 27B. El autor no publica comparativas de calidad frente al modelo base, por lo que la perdida de precision en tareas de codigo o tool calling no esta cuantificada.
- Sesgos conocidos: no disponible. No se documenta ninguna evaluacion de sesgos, toxicidad o seguridad.
- Riesgo de alusion: no evaluado. No hay benchmarks ni estudios de fiabilidad en la informacion disponible, y el modelo esta orientado a generar codigo y ejecutar acciones, ambito donde un error puede tener consecuencias directas.
- Idiomas: no disponible. No se especifica que idiomas soporta ni la calidad relativa entre ellos.
- Calibracion especializada: las 256 muestras de calibracion estan sesgadas hacia codificacion agentica en un conjunto concreto de lenguajes y flujos (TypeScript/Svelte, Go, C++, Kotlin/Gradle, DevOps). El comportamiento fuera de ese dominio no esta caracterizado.
- Adopcion muy baja: 4 descargas y 0 likes en el momento de la consulta, sin validacion independiente de la comunidad.
- Componentes no documentados: MTP y DFlash2 se listan como incluidos pero no se explica su funcionamiento ni su impacto en calidad o rendimiento.
- Fechas de metadatos: la fecha de creacion registrada es el 13 de septiembre de 2026, posterior a la fecha habitual de publicacion de otros modelos de la familia; conviene contrastar la trazabilidad del artefacto con el hash SHA-256 antes de desplegarlo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Schestex/Qwen3.8-27B-ColdFusion-NVFP4-NInfer
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1
- Dataset de calibracion NVIDIA Open-SWE-Traces: https://huggingface.co/datasets/nvidia/Open-SWE-Traces
- Dataset de calibracion Thoughtworks agentic-coding-trajectories: https://huggingface.co/datasets/thoughtworks/agentic-coding-trajectories
- Dataset de calibracion Nebius SWE-agent-trajectories: https://huggingface.co/datasets/nebius/SWE-agent-trajectories
- Repositorio o documentacion del runtime NInfer: no disponible en la informacion proporcionada
- Paper o informe tecnico del modelo base: no disponible en la informacion proporcionada
- Demo o espacio interactivo: no disponible
- Nota sobre la busqueda web: la consulta realizada no devolvio resultados relevantes sobre este modelo.
