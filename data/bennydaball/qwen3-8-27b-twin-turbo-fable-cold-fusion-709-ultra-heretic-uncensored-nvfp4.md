# BennyDaBall/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored-NVFP4

## Resumen

Este repositorio contiene una cuantizacion GGUF en formato NVFP4 del modelo DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored, un ajuste fino de 27.320.697.856 parametros (27,32 mil millones) derivado a su vez de la familia Qwen3.8 y orientado a conversacion, uso de herramientas y entrada de imagenes. El autor del cuantizado es el usuario BennyDaBall, mientras que el entrenamiento, la plantilla de chat, el desbloqueo de censura ("Heretic") y los modos de razonamiento son trabajo de DavidAU. El modelo base tiene una ventana de contexto nativa de 262.144 tokens y una arquitectura hibrida que combina atencion, capas Gated DeltaNet y MLP en 64 capas de texto, mas una capa adicional de prediccion multi-token (MTP).

El problema que resuelve este repositorio concreto es el de tamano y velocidad de ejecucion: el checkpoint original en BF16 ocupa 51,8 GiB, mientras que esta version NVFP4 ocupa 18,34 GiB, manteniendo la cabeza MTP y el proyector de vision. Esto permite ejecutar un modelo de 27B con contexto largo en una unica GPU de consumo de la generacion Blackwell (probado en una RTX 5090 de 32 GB), usando llama.cpp o LM Studio sin Python ni vLLM.

Su relevancia ahora es doble: por un lado, es un ejemplo temprano de cuantizacion nativa NVFP4 (tipo de tensor GGML 40) aplicada a un modelo multimodal, con kernels de hardware en Blackwell; por otro, conserva la cabeza MTP en BF16, lo que habilita decodificacion especulativa autocontenida sin modelo borrador externo. Cabe senalar que el repositorio no tiene descargas ni "likes" en el momento de la consulta y que no se han publicado resultados de benchmarks asociados a esta conversion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: atencion, Gated DeltaNet y MLP en 64 capas de texto, mas una capa de prediccion multi-token (MTP) en el bloque 64; torre de vision separada |
| Parametros totales | 27.320.697.856 (27,32 mil millones) |
| Parametros activos | No aplica: la informacion disponible no describe el modelo como MoE |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | NVFP4 (tipo de tensor GGML 40) en las matrices grandes de atencion, Gated DeltaNet y MLP de las 64 capas; BF16 en la cabeza MTP, la cabeza de salida, los embeddings de tokens y el proyector de vision. El repo de DavidAU ofrece ademas K-quants e imatrix para hardware no Blackwell |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp / LM Studio); fichero principal de 18,34 GiB y mmproj BF16 de 0,87 GiB |
| Modelo base | DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored (relacion: quantized) |
| Tamano del repositorio | 20,6 GB |
| Plantilla de chat | Incluida en el GGUF y como chat_template.jinja (sha256 4e52a372...); variante v2 en chat_template-tturbo-v2.jinja |
| Artefactos adicionales | Qwen3.8-27B-NVFP4-imatrix.dat (13,01 MiB), mapa por tensor de 866 lineas (24 KB), BUILD-MANIFEST.json, SHA256SUMS.txt |

## Arquitectura y entrenamiento

La arquitectura descrita en la model card no es un transformer denso clasico: las 64 capas de texto combinan mecanismos de atencion con capas Gated DeltaNet y MLP, lo que la situa en la categoria de modelos hibridos (atencion mas capas recurrentes/lineales). Sobre esas 64 capas se anade un bloque 64 dedicado a prediccion multi-token (MTP), que el autor del cuantizado ha preservado en BF16 dentro del GGUF precisamente para que el propio modelo pueda autoespecular durante la decodificacion. Ademas, el modelo incorpora una torre de vision, con un proyector multimodal `mmproj` en BF16 convertido desde el mismo checkpoint de DavidAU, no tomado de otro modelo de la familia.

En cuanto al entrenamiento, esta ficha no puede detallarlo: la model card del cuantizador indica explicitamente que no se entreno ni edito nada, y que el trabajo de ajuste (Cold Fusion / GAIN, comportamiento TWIN-TURBO de razonamiento corto, cinco modos de "thinking" y cinco de "instruct", el desbloqueo Heretic y las plantillas de chat) pertenece integramente a DavidAU. Por tanto, el numero de tokens de entrenamiento, la composicion del dataset y el uso de RLHF o DPO no estan disponibles en la informacion proporcionada. La innovacion tecnica de este repositorio es de formato: cuantizacion NVFP4 en una sola pasada desde los safetensors BF16, aplicando una matriz de importancia (imatrix) para el redondeo, con la plantilla de chat embebida verificada byte a byte (sha256 4e52a372...) y con suma de comprobacion SHA256 publicada para los ficheros principales.

## Capacidades

- Generacion de texto conversacional en ingles, con contexto nativo de hasta 262.144 tokens.
- Razonamiento con modos conmutables desde el propio mensaje: etiquetas tipo `{REASON:imedium}` para respuesta directa sin bloque de pensamiento o `{REASON:low}` para pensamiento breve; la etiqueta persiste hasta que se cambia.
- Uso de herramientas (tool use) y function calling, segun las etiquetas del repositorio.
- Flujos de agente y razonamiento multi-paso, con una plantilla v2 especifica para entornos tipo agent harness.
- Vision multimodal: entrada de imagenes y texto mediante el fichero `mmproj` BF16 emparejado (pipeline declarado: image-text-to-text).
- Decodificacion especulativa autocontenida mediante la cabeza MTP integrada, sin necesidad de modelo borrador externo.
- Generacion de codigo: no se documenta de forma explicita en la model card, pero es una capacidad esperable en un modelo de esta familia; no hay evaluacion publicada en este repositorio.
- Capacidades multilingues: no disponibles; el modelo declara unicamente ingles.
- Modo "uncensored": el ajuste Heretic del modelo base reduce los rechazos y filtros de contenido, lo que constituye una capacidad funcional pero tambien un riesgo (ver limitaciones).

## Casos de uso

- Atencion al cliente automatizada en ingles: con 262.144 tokens de contexto se pueden mantener conversaciones multi-turno que incluyan historial completo, politicas de empresa y fichas de producto sin truncar, y el modo `{REASON:low}` permite respuestas rapidas sin bloque de razonamiento visible.
- Analisis de documentos largos con soporte visual: informes, contratos o expedientes escaneados pueden enviarse como imagen (via `mmproj`) junto a texto de apoyo, aprovechando que el contexto cubre documentos de cientos de paginas en una sola pasada.
- Extraccion estructurada de datos: convertir facturas, albaranes o capturas de paneles en JSON u otro formato estructurado, combinando vision y tool calling para volcar el resultado en un sistema posterior.
- Generacion y revision de codigo en pipelines de CI/CD: el modelo puede integrarse como paso de revision o generacion mediante function calling, invocando linters, ejecutores de tests o APIs internas; el contexto largo permite pasar repositorios o diffs extensos completos.
- Agentes multi-paso en local: con la plantilla v2 y tool calling se pueden construir agentes que encadenen busqueda, lectura de ficheros y llamadas a API, todo ejecutado en una sola GPU sin dependencia de servicios externos.
- Soporte tecnico sobre capturas de pantalla: un usuario envia la imagen de un error o de una interfaz y el modelo, con vision, describe el estado y propone pasos, con el historial de la incidencia en contexto.
- Prototipado y experimentacion en estacion de trabajo: al ocupar 18,34 GiB mas 0,87 GiB de vision, el modelo cabe en una RTX 5090 de 32 GB, lo que permite iterar con datos sensibles sin enviarlos a terceros.
- Redaccion y edicion de contenido sin filtros tematicos: el ajuste uncensored resulta adecuado para ficcion adulta, temas sensibles o investigacion sobre sesgos, siempre con revision humana y con las advertencias legales correspondientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y la busqueda web realizada no devolvio resultados relevantes sobre este modelo. Tampoco se aportan cifras de latencia o tokens por segundo: el autor solo menciona que activar la decodificacion especulativa MTP proporciona una mejora de velocidad, sin cuantificarla.

## Requisitos de hardware

- GPU con arquitectura NVIDIA Blackwell obligatoria para los kernels NVFP4 nativos (la model card cita `sm_120`, es decir, RTX 5090, y por extension la familia RTX 50 y las GPU de centro de datos Blackwell).
- Prueba de referencia del autor: una unica RTX 5090 de 32 GB, con la que se construyo y midio el modelo.
- VRAM: 18,34 GiB para los pesos de texto y 0,87 GiB adicionales si se usa vision; a partir de ahi hay que sumar cache KV y buffers. El autor no publica una cifra total, por lo que el consumo exacto de VRAM en inferencia no esta disponible.
- Contexto: el ejemplo de llama.cpp del autor usa `--ctx-size 131072` con cache KV cuantizada en `q8_0` (`-ctk q8_0 -ctv q8_0`) y flash attention activada; el maximo nativo es 262.144 tokens, pero no se documenta el consumo de VRAM a esa longitud.
- GPU de consumo: si, en RTX 5090 de 32 GB segun el autor. En tarjetas de 24 GB (RTX 4090, RTX 3090) los pesos por si solos ocuparian 18,34 GiB, dejando muy poco margen para cache KV y buffers; no hay confirmacion de funcionamiento en esas tarjetas.
- GPUs no Blackwell: no hay kernels NVFP4 nativos en llama.cpp para esas arquitecturas; el propio autor remite a los K-quants e imatrix del repositorio NEO MTP GGUF de DavidAU.
- Opciones de despliegue: LM Studio (runtime llama.cpp CUDA 12 2.41.0 probado) y llama.cpp, con `llama-server` y `--spec-type draft-mtp`. No es compatible con vLLM: la model card indica explicitamente "no Python, no vLLM".
- Versiones minimas: llama.cpp release oficial b11026 (build Windows CUDA 13.4) o superior. Un build del 1 de septiembre de 2026 cargaba el modelo pero fallaba al activar `--spec-type draft-mtp`.
- Configuracion de decodificacion especulativa recomendada: maximo 3 tokens borrador (equivalente a `--spec-draft-n-max 3`) y probabilidad minima de continuacion 0,2.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay resultados de benchmarks que permitan comparar el rendimiento con modelos de la misma categoria. La comparacion disponible se limita a variantes del mismo modelo en distintos formatos:

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este repositorio (NVFP4 GGUF) | 27,32 B | 262.144 | GGUF NVFP4 | apache-2.0 | 18,34 GiB; requiere GPU Blackwell; incluye MTP en BF16 y mmproj |
| DavidAU/...-ULTRA-HERETIC-Uncensored (BF16) | 27,32 B | 262.144 | safetensors BF16 | apache-2.0 | 51,8 GiB; checkpoint fuente original del cuantizado |
| DavidAU/...-NM-DAU-NEO-MTP-GGUF (K-quants / imatrix) | 27,32 B | 262.144 | GGUF (K-quants) | apache-2.0 | Alternativa para hardware no Blackwell; tamanos concretos no disponibles en la informacion proporcionada |

Alternativas de otros autores con arquitectura, contexto o licencia comparables: no disponible.

## Limitaciones y advertencias

- Modelo "uncensored": el ajuste Heretic del modelo base reduce deliberadamente los mecanismos de rechazo, lo que aumenta el riesgo de generar contenido danino, ilegal, sesgado o inexacto. Requiere moderacion externa y revision humana en cualquier despliegue con usuarios.
- Riesgo de alucinacion: no hay evaluaciones de fidelidad publicadas para este ajuste; el contexto de 262.144 tokens no elimina el riesgo y puede amplificar errores cuando se alimentan documentos muy largos.
- Idioma: solo se declara ingles. El uso en castellano no esta validado y previsiblemente degradara la calidad.
- Sesgos: no se documenta ninguna evaluacion de sesgos ni de seguridad en la informacion disponible.
- Restricciones de licencia: los metadatos declaran apache-2.0, lo que en principio permite uso comercial, pero el modelo deriva de un ajuste fino de un modelo de terceros y el nombre del repositorio usa la denominacion "Qwen3.8" sin ser un artefacto oficial de Qwen. Conviene verificar los terminos del modelo base antes de un uso comercial y revisar la cuestion de marcas.
- Dependencia de hardware: los tensores NVFP4 solo funcionan con kernels nativos en Blackwell. En otras GPU hay que acudir a las cuantizaciones K-quant del repositorio de DavidAU.
- Dependencia de version de runtime: se requiere un llama.cpp o LM Studio muy recientes; builds antiguos fallan al activar MTP.
- Riesgo de inestabilidad: la propia model card advierte de un cierre inesperado ("crash") con un build concreto de llama.cpp al habilitar `--spec-type draft-mtp`.
- Madurez y validacion: el repositorio registra 0 descargas y 0 "likes", y no incluye benchmarks propios. Es un artefacto reciente y sin validacion independiente.
- Consumo de VRAM: aunque los pesos son de 18,34 GiB, el contexto completo de 262.144 tokens o incluso 131.072 con cache KV y buffers puede superar la capacidad de una GPU de 32 GB; no hay cifras publicadas.
- Trazabilidad: el cuantizador afirma haber preservado la plantilla de chat byte a byte y publica sumas SHA256, pero no hay verificacion externa de esas comprobaciones en la informacion disponible.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/BennyDaBall/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored-NVFP4
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored
- Repositorio NEO MTP GGUF y guia de uso de DavidAU (K-quants e imatrix para hardware no Blackwell): https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored-NM-DAU-NEO-MTP-GGUF
- Perfil del autor del cuantizado en X: https://x.com/BennyDaBall_OG
- La busqueda web realizada no devolvio enlaces relevantes sobre este modelo (los resultados obtenidos correspondian a paginas de un operador de telefonia sin relacion con el contenido).
