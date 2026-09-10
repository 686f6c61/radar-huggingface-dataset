# inclusionAI/Ling-3.0-flash-VL-fp4

## Resumen

Ling-3.0-flash-VL-fp4 es la variante cuantizada en fp4 del modelo multimodal nativo Ling-3.0-flash-VL, desarrollado por inclusionAI (equipo vinculado al ecosistema Ant Group, con repositorios espejo en Hugging Face y ModelScope). Se trata de un modelo de imagen-texto-a-texto que extiende las capacidades de lenguaje, razonamiento y contexto largo de Ling-3.0-flash con comprensión nativa de imágenes y vídeo, integrando la visión en el ciclo completo de comprensión, razonamiento, planificación, actuación y verificación.

La model card declara 124.000 millones de parámetros totales con solo 5.500 millones activados por token, gracias a una arquitectura MoE dispersa, y una ventana de contexto de hasta 256K tokens (262.144). El backbone tiene 42 capas híbridas que alternan capas KDA y Gated MLA en proporción 5:1, e incorpora un codificador visual ViT con un proyector MLP de dos capas y codificación VideoRoPE para posición espacial y orden temporal. El repositorio pesa 69,6 GB y los metadatos de safetensors reportan 64.450.482.896 parámetros, una cifra que no coincide con los 124B declarados en la model card y que se detalla en la sección de limitaciones.

Su relevancia actual radica en que combina razonamiento multimodal, modo de pensamiento activado por defecto y capacidades de agente (interacción con interfaces web y de software) manteniendo un coste de inferencia bajo por token activado. La licencia MIT y las recetas verificadas para SGLang lo sitúan como una opción desplegable en producción, aunque con requisitos de hardware de gama alta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con backbone híbrido de 42 capas que alterna KDA y Gated MLA en proporcion 5:1, mas MoE dispersa; identificador de arquitectura `bailing_moe_v3_vl` con `custom_code`; codificador visual ViT + proyector MLP de 2 capas; VideoRoPE |
| Parametros totales | 124B segun la model card; 64.450.482.896 (unos 64,45B) segun los metadatos de safetensors del repositorio. Dato discrepante, ver limitaciones |
| Parametros activos | 5,5B por token |
| Longitud de contexto | Hasta 256K tokens (262.144); contexto original de 131.072 tokens, ampliable con YaRN (factor 2.0, rope_theta 6000000, partial_rotary_factor 0.5) |
| Tipos de cuantizacion | Repositorio fp4 (nombre del modelo), con expertos MoE ejecutados en MXFP4 (`flashinfer_mxfp4`); los tags del repositorio incluyen `8-bit` y `fp8`. La matriz de despliegue de SGLang contempla recetas BF16 y FP8 |
| Idiomas soportados | No disponible (la model card no declara lista de idiomas) |
| Licencia | MIT |
| Formato de pesos | Safetensors (69,6 GB en el repositorio) |
| Pipeline | image-text-to-text |
| Modos de entrada | Imagen, video, texto |
| Modo de razonamiento | Thinking mode activado por defecto (temperature=0.6, top_p=0.95, top_k=20) |
| Parsers de inferencia | `ling3` para razonamiento y tool calling (resolucion automatica desde el chat template) |

## Arquitectura y entrenamiento

La model card describe un diseno orientado a integrar la vision en flujos de razonamiento y agenticos. Un codificador visual ViT extrae caracteristicas de imagenes y videos, y un proyector MLP de dos capas alinea esas caracteristicas con las representaciones textuales para lograr una comprension multimodal unificada. La codificacion VideoRoPE representa simultaneamente posiciones espaciales y orden temporal, lo que habilita tareas como localizacion de eventos, respuesta a preguntas sobre video largo y edicion de clips.

El backbone consta de 42 capas hibridas que alternan capas KDA y Gated MLA en proporcion 5:1, un diseno pensado para procesar de forma eficiente contextos largos que combinan texto, imagenes, video e historiales extensos de tareas de agente. Sobre esa base se aplica una arquitectura MoE dispersa que mantiene una capacidad total declarada de 124B parametros activando solo 5,5B por token. La model card tambien menciona la existencia de expertos compartidos, ya que la receta de SGLang incluye el flag `--disable-shared-experts-fusion`, y el uso de `--enable-fp32-lm-head` en el lanzamiento recomendado.

No se proporcionan en la informacion disponible datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO. La unica referencia de evaluacion es la puntuacion del indice de inteligencia de Artificial Analysis y el conjunto de benchmarks multimodales presentados como imagenes, sin cifras transcritas.

## Capacidades

- Generacion de texto y razonamiento multimodal con modo de pensamiento activado por defecto.
- Comprension de imagenes: conteo de objetos, disenos y layouts complejos, graficos y contenido de documentos.
- Razonamiento con evidencia visual: calculo, razonamiento en varios pasos y verificacion de informacion externa apoyada en la imagen.
- Comprension de video: cambios visuales en el tiempo, localizacion de eventos, preguntas sobre video largo y edicion de clips, gracias a VideoRoPE.
- Actuacion sobre interfaces: interpretacion de interfaces web y de software y traduccion de la informacion visual a secuencias de acciones (uso como agente de GUI).
- Tool calling y function calling, con parser especifico `ling3` y soporte de agentes multi-paso.
- Contexto largo de hasta 256K tokens, apto para documentos, historiales de agente y videos extensos.
- Capacidades multilingues: no disponibles en la informacion proporcionada (la model card no declara idiomas).
- Modo de pensamiento desactivable por peticion mediante el chat template (la model card indica `chat_templat...` truncado; el detalle completo no esta disponible).

## Casos de uso

- Agentes de automatizacion de interfaces (computer use): el modelo interpreta capturas de pantallas web o de aplicaciones de escritorio y las convierte en secuencias de acciones; su contexto de 256K permite mantener el historial completo de la tarea y el estado de la sesion sin truncar.
- Atencion al cliente con evidencia visual: gestion de conversaciones multi-turno en las que el usuario adjunta capturas, facturas o pantallazos de error, combinando razonamiento sobre el texto y lectura del documento en el mismo contexto.
- Analisis de documentos largos: procesamiento de informes financieros, contratos o documentacion tecnica con tablas, graficos y diagramas, extrayendo datos estructurados mediante tool calling para volcarlos a un sistema posterior.
- Analisis de video para operaciones: localizacion de eventos en grabaciones largas (incidencias en lineas de produccion, revision de material audiovisual) y generacion de resumenes con marcas temporales.
- Verificacion y control de calidad: comprobacion de que un resultado o una captura de pantalla coincide con lo esperado en un pipeline de QA, usando el modelo como verificador con evidencia visual dentro de un bucle de agente.
- Asistencia al desarrollo de software: conversion de mockups o capturas de UI en codigo, y revision de incidencias visuales reportadas por usuarios, integrado en el flujo de trabajo mediante function calling.
- Extraccion de datos en RAG multimodal: indexacion de PDF con graficos e imagenes junto a texto, usando el modelo para responder preguntas que requieren leer una figura y razonar sobre ella.
- Moderacion y clasificacion de contenido visual con justificacion textual, apoyandose en el modo de pensamiento para explicar la decision antes de emitir la etiqueta.

## Benchmarks y rendimiento

El unico dato numerico publicado en la informacion disponible es la puntuacion en el indice de inteligencia de Artificial Analysis:

| Benchmark | Ling-3.0-flash-VL | Ling-3.0-flash (solo texto) |
|---|---|---|
| Artificial Analysis Intelligence Index v4.1.1 | 42 | 38 |

La model card afirma que el modelo supera a Ling-3.0-flash en 4 puntos en ese indice, lo que atribuye a la incorporacion de capacidades visuales. Tambien menciona resultados en benchmarks multimodales organizados en tres dimensiones (comprender, razonar y actuar con evidencia visual), pero esos resultados se presentan unicamente como imagenes y sus cifras no estan transcritas en la informacion disponible.

Sobre Terminal-Bench 2.1 se documenta la metodologia, no la puntuacion: evaluacion bajo el protocolo de Artificial Analysis con el harness Terminus 2, un tiempo limite unificado de 2 horas, el parser JSON proporcionado en modo preserve-thinking y 3 ejecuciones por tarea (media), con decodificacion a temperature=1.0, max_new_tokens=32K y ventana de contexto de 256K.

No se han publicado en la informacion disponible resultados numericos de MMLU, HumanEval, GSM8K ni de benchmarks multimodales como MMMU, MathVista o VideoMME.

## Requisitos de hardware

- Peso del repositorio: 69,6 GB, por lo que no cabe en una unica GPU de 24 GB ni de 48 GB en esta cuantizacion.
- Configuracion recomendada por el autor: 2 GPU de clase 141 GB (H20-3e o H200) o nodos Blackwell de 2 GPU (B300 / GB300), con `--tp-size 2` y contexto de 256K mediante YaRN.
- Tarjetas de 80 GB (H100 / H800): la model card indica escalar el paralelismo; en esas tarjetas el despliegue requiere repartir el modelo entre varias GPU.
- Consumer GPU: no cabe en tarjetas de consumo tipo RTX 4090 (24 GB) en esta variante; no se documentan recetas de cuantizacion adicional orientadas a consumo.
- Memoria estatica reservada: la receta oficial usa `--mem-fraction-static 0.85`.
- Opciones de despliegue: SGLang es el camino documentado, con imagen Docker `lmsysorg/sglang:dev-Ling-3.0-flash-VL` y flags especificos (`--attention-backend fa3`, `--fp8-gemm-backend triton`, `--moe-runner-backend flashinfer_mxfp4`, `--flashinfer-mxfp4-moe-precision default`, `--enable-fp32-lm-head`, `--disable-shared-experts-fusion`, `--trust-remote-code`). Existe una matriz de recetas BF16/FP8 x baja latencia / alto rendimiento en el cookbook de SGLang.
- vLLM, llama.cpp, Ollama y TGI: no se documentan en la informacion proporcionada.
- Latencia y throughput: no disponibles. La model card solo indica que la activacion de 5,5B parametros por token busca eficiencia de inferencia, sin cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Entrada multimodal | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|---|---|
| Ling-3.0-flash-VL-fp4 | 124B declarados / 64,45B en safetensors | 5,5B | 256K | Imagen y video | MIT | Hugging Face | AA Intelligence Index v4.1.1: 42 |
| Ling-3.0-flash (base, solo texto) | No disponible | No disponible | No disponible | No | MIT (mismo linaje) | Hugging Face | AA Intelligence Index v4.1.1: 38 |
| Alternativas multimodales de la misma categoria | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

La informacion proporcionada no incluye especificaciones ni resultados de otros modelos multimodales comparables, por lo que no es posible completar una comparativa con cifras verificables frente a otras familias.

## Limitaciones y advertencias

- Discrepancia en el recuento de parametros: la model card declara 124B totales y 5,5B activos, mientras que los metadatos de safetensors del repositorio informan de 64.450.482.896 parametros. Conviene verificar la cifra antes de dimensionar infraestructura o citarla en documentacion tecnica.
- Ambiguedad de cuantizacion: el nombre del repositorio indica fp4, los tags incluyen `8-bit` y `fp8`, y la receta de SGLang usa expertos MXFP4. El esquema exacto de precision por capa no se detalla en la informacion disponible.
- Requiere `trust_remote_code`: la arquitectura usa codigo personalizado (`bailing_moe_v3_vl`), lo que implica ejecutar codigo del autor del modelo y anadir un paso de revision de seguridad en entornos de produccion.
- Idiomas no declarados: no hay lista oficial de idiomas soportados ni evaluaciones por idioma, lo que dificulta garantizar calidad fuera del ingles o del chino sin validacion propia.
- Riesgo de alucinacion: no se publican tasas de alucinacion ni evaluaciones de fidelidad a la evidencia visual; en tareas de verificacion y extraccion de datos conviene anadir comprobaciones posteriores.
- Sesgos: no se documentan analisis de sesgo, composicion del dataset ni procesos de alineacion (RLHF/DPO), por lo que no es posible evaluar sesgos conocidos a partir de la informacion disponible.
- Restricciones de licencia: la licencia es MIT, permisiva para uso comercial, pero el despliegue depende de componentes de terceros (SGLang, FlashInfer) cuyas licencias deben revisarse por separado.
- Coste de hardware elevado: no cabe en GPU de consumo y requiere al menos dos aceleradores de gama alta con memoria agregada suficiente para 69,6 GB de pesos mas cache KV de contexto largo.
- Modo de pensamiento por defecto: puede incrementar la latencia y el consumo de tokens de salida si no se desactiva por peticion.
- Contexto efectivo: los 256K tokens dependen de la ampliacion YaRN configurada explicitamente; sin ella el contexto original es de 131.072 tokens.
- La busqueda web realizada no devolvio resultados tecnicos relevantes sobre el modelo (unicamente una pagina sin relacion), por lo que no hay fuentes externas adicionales que contrasten las afirmaciones de la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/inclusionAI/Ling-3.0-flash-VL-fp4
- Organizacion inclusionAI en Hugging Face: https://huggingface.co/inclusionAI
- Organizacion inclusionAI en ModelScope: https://modelscope.cn/organization/inclusionAI
- Cookbook de SGLang para Ling-3.0-flash-VL (matriz de recetas BF16/FP8 y generador de comandos): https://docs.sglang.io/cookbook/autoregressive/InclusionAI/Ling-3.0-flash-VL
- Imagen Docker de SGLang: `lmsysorg/sglang:dev-Ling-3.0-flash-VL`
- Grafico de arquitectura y resultados de evaluacion: alojados en `cdn-uploads.huggingface.co` bajo las rutas indicadas en la model card (no se dispone de URL directa verificada en el texto proporcionado).
