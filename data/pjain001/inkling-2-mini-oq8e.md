# pjain001/Inkling-2-Mini-oQ8e

## Resumen

Inkling-2-Mini-oQ8e es una version cuantizada del modelo multimodal Inkling-2-Mini, publicada por el usuario pjain001 en Hugging Face. El checkpoint original no esta documentado en la informacion disponible; lo que si se detalla es el proceso de cuantizacion de precision mixta aplicado con oQ (oMLX v0.8.4), una herramienta del proyecto omlx orientada a ejecutar modelos en Apple Silicon mediante MLX. El resultado es un checkpoint de 26.707 miles de millones de parametros logicos almacenado en 17,470 GiB, con una media efectiva de 5,619 bits por peso.

La relevancia de esta ficha esta en la tecnica de compresion: en lugar de aplicar una cuantizacion uniforme, el autor distribuye el presupuesto de bits por componente. El grueso del modelo (76,3 % de los pesos) se guarda en NVFP4 con grupo de 16, mientras que capas mas sensibles se mantienen en MXFP8 (15,3 %), affine 8-bit (5,9 %) y BF16/FP32 para una fraccion residual. Esto permite reducir el peso en disco a unos 18,8 GB manteniendo una calidad cercana al modelo original, algo critico cuando se quiere desplegar un modelo de 26B en hardware de consumo.

El modelo incluye una torre de vision de 0,318B parametros ademas del modelo de lenguaje de 26,388B, por lo que es multimodal (texto e imagen). La etiqueta `inkling2_loop` sugiere una arquitectura con mecanismos recurrentes o de bucle, aunque no hay documentacion que lo confirme. La licencia, los idiomas y los benchmarks no estan disponibles en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `inkling2_loop`; transformer con posible mecanismo de bucle) |
| Parametros totales | 26.707.000.000 logicos (26,388B en el modelo de lenguaje + 0,318B en vision) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Precision mixta: NVFP4 grupo 16, affine 8-bit grupo 64, MXFP8 grupo 32, BF16 y FP32 (media efectiva 5,619 bits/peso) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria MLX) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo original, los datos de entrenamiento, el numero de tokens procesados ni si se aplicaron tecnicas de RLHF o DPO. La unica pista es la etiqueta `inkling2_loop`, que apunta a un diseno con capas recurrentes o de bucle compartido, un patron que algunos modelos recientes usan para aumentar la profundidad efectiva sin incrementar el numero de parametros. Esta interpretacion no esta confirmada por el autor.

Lo que si esta documentado es el esquema de cuantizacion. El checkpoint se genero con oMLX v0.8.4 y combina cuatro formatos: NVFP4 (formato de 4 bits con escalas por grupo de 16, usado para el 76,3 % de los pesos), MXFP8 (8 bits con grupo de 32, 15,3 %), affine 8-bit con grupo de 64 (5,9 %), y una cola en BF16 (2,4 %) y FP32 (0,1 %). La torre de vision se almacena en 0,637 GB. El resultado son 17,470 GiB en disco, lo que facilita su carga en maquinas con memoria unificada de 24 o 32 GB.

## Capacidades

- Generacion de texto y razonamiento: el modelo de lenguaje de 26,388B parametros logicos soporta tareas generativas generales.
- Procesamiento de imagenes: incorpora una torre de vision de 0,318B parametros, por lo que puede recibir entradas visuales ademas de texto.
- Cuantizacion de precision mixta: mantiene capas criticas en 8 bits y BF16 para preservar calidad en tareas sensibles.
- Ejecucion en Apple Silicon: al estar en formato MLX, se integra con el ecosistema de inferencia de Apple (mlx-lm, mlx-vlm).
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Prototipado local en Mac: cargar el checkpoint con mlx-lm o mlx-vlm en un Mac con 24-32 GB de memoria unificada permite experimentar con un modelo de 26B sin GPU dedicada, gracias a los 17,47 GiB de almacenamiento.
- Investigacion sobre cuantizacion: el esquema de precision mixta documentado (NVFP4 + MXFP8 + affine 8-bit + BF16) sirve como caso de estudio para medir el impacto de cada formato en la calidad final por capa.
- Asistentes multimodales en escritorio: al incluir vision, puede integrarse en aplicaciones de escritorio que describan capturas de pantalla, documentos escaneados o graficos sin enviar datos a la nube.
- Analisis de documentos con imagenes: extraccion y resumen de informacion de PDFs renderizados o fotografias, combinando la torre de vision con el modelo de lenguaje.
- Despliegue en entornos con restricciones de memoria: los 18,8 GB del repo lo hacen viable en estaciones de trabajo con 32 GB de RAM, donde un checkpoint BF16 de 26B (unos 53 GB) no cabria.
- Evaluacion comparativa de formatos de cuantizacion: util para equipos que quieran contrastar NVFP4 frente a MXFP8 en tareas de razonamiento o vision sobre el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: al menos 18-20 GB para cargar el checkpoint completo; se recomienda 24 GB o mas para dejar margen al contexto y a los buffers de inferencia.
- GPU recomendadas: el formato MLX esta disenado para Apple Silicon (series M1, M2, M3 y M4, especialmente variantes Pro, Max y Ultra con 24 GB o mas de memoria unificada). No es un formato nativo para CUDA.
- GPU de consumo: cabe en Mac con 24 GB o 32 GB de memoria unificada; en GPUs NVIDIA de consumo (RTX 4090 con 24 GB) requeriria conversion previa a otro formato, no incluida en este repo.
- Opciones de despliegue: mlx-lm y mlx-vlm para Apple Silicon. Para vLLM, llama.cpp, Ollama o TGI seria necesaria una conversion de formato, ya que el checkpoint esta en safetensors MLX con cuantizacion oQ.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento que permitan establecer una comparacion fiable con alternativas de la misma categoria.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar si el uso comercial esta permitido; conviene contactar con el autor o consultar el modelo base antes de usarlo en produccion.
- Modelo derivado sin documentacion del original: se desconoce la arquitectura exacta, el contexto maximo, los idiomas y el proceso de entrenamiento, lo que dificulta evaluar riesgos de sesgo o alucinacion.
- Cuantizacion agresiva: el 76,3 % de los pesos esta en NVFP4 (4,5 bits efectivos), lo que puede degradar tareas de precision como matematicas o generacion de codigo frente al modelo en BF16.
- Dependencia de Apple Silicon: el formato MLX limita el despliegue a hardware de Apple; no hay pesos GGUF ni safetensors estandar para CUDA.
- Autor unico y sin traccion: el repo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion de la comunidad ni garantias de mantenimiento.
- Fecha de publicacion futura (2026-11-26): conviene verificar la integridad del repo y la version de oMLX indicada antes de confiar en el checkpoint.
- Sin datos de contexto: se desconoce la ventana maxima, lo que impide planificar casos de uso con documentos largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pjain001/Inkling-2-Mini-oQ8e
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
- Modelo base Inkling-2-Mini: no disponible en la informacion proporcionada
- Paper, blog o demo del modelo original: no disponible
