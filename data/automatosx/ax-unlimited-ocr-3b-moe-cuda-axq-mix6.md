# AutomatosX/AX-Unlimited-OCR-3B-MoE-CUDA-AXQ-MIX6

## Resumen

AX-Unlimited-OCR-3B-MoE-CUDA-AXQ-MIX6 es un checkpoint cuantizado del modelo multimodal baidu/Unlimited-OCR, publicado por AutomatosX y marcado por su propio autor como "development preview". Se trata de un modelo de imagen a texto (pipeline image-text-to-text) con mezcla de expertos y torre de vision, orientado a OCR, en el que la torre de vision, los routers, los embeddings, las normalizaciones y la cabeza LM se conservan en BF16 original. El checkpoint final ocupa 3,50 GB (3.496.554.136 bytes) y el repo declara 2.675.503.360 parametros reales en safetensors, frente a los 3.336.106.240 parametros del modelo fuente.

Su rasgo diferencial es la estrategia de cuantizacion: AXQuant mezcla en un mismo checkpoint matrices NVFP4 (4 bits) y FP8 E4M3 (8 bits) para materializar en CUDA lo que el autor denomina "clase de presupuesto de 6 bits". El tronco de lenguaje queda en 6,2371 bits por peso (objetivo solicitado: 6,0). El autor subraya que no existe un tipo de dato float de 6 bits que los runtimes actuales carguen, de modo que "6 bits" aqui es un presupuesto de bits por peso, no un dtype.

Es relevante para quien despliega OCR sobre GPU NVIDIA y necesita reducir huella de memoria sin salir del ecosistema vLLM, pero llega sin certificacion de calidad: el manifest registra `status=development`, `runtime_verified=false` y `quality_certified=false`, y la evidencia publicada se limita a una pagina en ingles generada en dos equipos con vLLM 0.25.1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con mezcla de expertos (MoE) y torre de vision; vLLM construye las proyecciones de atencion con la ruta DeepseekV2. Detalle interno de capas, numero de expertos y atencion: no disponible |
| Parametros totales | 2.675.503.360 (recuento real en safetensors). Modelo fuente en BF16: 3.336.106.240. Tronco cuantizado declarado: 2.602.844.160 en 2196 tensores |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4: 1152 tensores, 1.321B parametros, pesos E2M1 con escala de bloque E4M3FN cada 16 valores, escala global FP32 inversa y activaciones BF16 (W4A16). FP8 E4M3: 1044 tensores, 1.282B parametros (49,2 % del tronco cuantizado), pesos E4M3FN con escala FP32 por fila y escalado dinamico de activaciones FP8 por token (W8A8). BF16 sin cuantizar: 514 tensores, 0.733B parametros (torre de vision, routers, embeddings, norms y LM head) |
| Idiomas soportados | no disponible (la unica prueba publicada usa una pagina generada en ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors, con un unico bloque de configuracion `compressed-tensors` de dos grupos; pensado para vLLM |
| Bits por peso del tronco de lenguaje | 6,2371 (objetivo solicitado: 6,0) |
| Tamano del repositorio | 3,50 GB (3.496.554.136 bytes) |
| Modelo base | baidu/Unlimited-OCR, revision inmutable `07dea832e22aefee32ad281d4b80551282e1c168` (MIT) |
| Libreria declarada | vllm |
| Runtime verificado por el autor | vLLM 0.25.1 con imagenes oficiales en RTX 5090 (CUDA 13.0, torch 2.11.0+cu130) y NVIDIA Thor |
| Estado del manifest | development, runtime_verified=false, quality_certified=false |
| Hashes | `config_sha256`: 02e47df165498daff86ef67667ced16ce23d94b6288c45c63087334eec3e2ed9; safetensors SHA-256: 5a4033f495c2ca264caa077bc797434e350607922d20144b9feb1a4236ef780d |
| Fecha de publicacion | 2026-10-05 (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

El checkpoint es una conversion del fuente BF16 mediante AXQuant con cuantizacion round-to-nearest (RTN), generada con el encoder explicito `numpy-reference` en CPU, el mismo camino que usan los packs NVFP4 CUDA de AXQuant. La asignacion de precision es fija por familia de tensores: las matrices de la torre de vision, los routers, los embeddings, las normalizaciones y la LM head nunca cambian de precision y permanecen en BF16; el resto del tronco se reparte entre FP4 y FP8. No se usa el algoritmo AWQ ni ningun checkpoint AWQ.

El `config.json` contiene una unica configuracion `compressed-tensors` con dos grupos. vLLM resuelve un destino por nombre exacto de modulo o por regex `re:` y construye las proyecciones de atencion DeepseekV2 sin prefijo de modulo, por lo que todo el bloque de atencion comparte un mismo metodo: el grupo que lleva ese metodo usa el destino de clase `Linear` y el otro grupo usa destinos anclados por nombre `re:`. Los modulos preservados se ignoran mediante destinos `re:` anclados. En tiempo de ejecucion, las capas MoE NVFP4 seleccionan el backend `MARLIN` NvFp4 con el esquema esperado (pesos uint8, escala de bloque E4M3FN de grupo 16, escala global FP32 por tensor) y las capas FP8 usan `CompressedTensorsW8A8Fp8`.

No hay informacion sobre el entrenamiento: no se documentan numero de tokens, composicion del dataset, fases de RLHF o DPO, ni el proceso de destilado o preentrenamiento del modelo base. La unica innovacion tecnica documentada es la mezcla de dos familias de precision en un unico checkpoint para alcanzar un presupuesto de bits de 6 en el tronco, con activaciones BF16 en las capas FP4 y FP8 dinamico por token en las capas W8A8.

## Capacidades

- Conversion de imagen a texto (OCR): el modelo esta entrenado y empaquetado para extraer texto de imagenes de pagina, con prefill troceado (chunked prefill) habilitado en la validacion del autor.
- Salida de texto reconocible en una pagina completa: en la prueba de humo ambas GPU reconocieron todas las lineas esperadas sin salida repetitiva, segun el autor.
- Vision: incluye torre de vision en BF16 y acepta entrada de imagen junto a texto en el pipeline image-text-to-text.
- Ejecucion en vLLM con backend Marlin NVFP4 y kernels `CompressedTensorsW8A8Fp8` para las capas FP8.
- Carga de codigo personalizado: el repo lleva la etiqueta `custom_code`, por lo que requiere `trust_remote_code` si el runtime lo solicita.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; solo se ha validado una pagina en ingles generada por el propio autor.
- Cualificacion de layout, marcado estructurado o deteccion de tablas: no verificada por el autor.

## Casos de uso

- Digitalizacion masiva de archivos escaneados: el modelo procesa una pagina completa como imagen y devuelve texto, de modo que puede encadenarse en lotes sobre repositorios documentales para generar indices de texto buscable. Es adecuado por su huella de 3,5 GB de pesos, que permite alta densidad de instancias por GPU.
- Extraccion de texto en facturas y albaranes: se puede alimentar la imagen de cada documento y capturar el texto reconocido para pipelines de contabilidad. Requiere validacion propia porque no existe evaluacion held-out publicada.
- OCR dentro de un pipeline RAG sobre documentos fisicos: el texto extraido alimenta el indexado vectorial; la ganancia de memoria respecto al BF16 original permite mantener mas replicas del servicio en la misma GPU.
- Preprocesado de capturas y pantallazos en herramientas internas: conversion de imagenes de interfaz a texto para busqueda o trazado de incidencias.
- Procesamiento de formularios administrativos en papel: OCR de la pagina seguida de parseo posterior con reglas propias, dado que el modelo no certifica salida de layout ni de marcado.
- Servicio OCR autoalojado con vLLM: despliegue mediante la imagen oficial `vllm/vllm-openai` con `--trust-remote-code`, exponiendo una API compatible con OpenAI para integrarla en aplicaciones existentes.
- Reduccion de coste en flotas CUDA: al combinar NVFP4 y FP8 en un solo checkpoint de 3,5 GB, encaja en GPUs de 24-32 GB para OCR por lotes con varias instancias por tarjeta, siempre que el hardware soporte los kernels correspondientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no hay evaluacion OCR con conjunto reservado, ni cualificacion de layout o marcado, ni ninguna afirmacion de precision o de velocidad. La unica evidencia es una prueba de humo sobre una pagina en ingles autogenerada, con prefill troceado, ejecutada en dos equipos:

| Equipo | GPU | Entorno | Resultado |
|---|---|---|---|
| df-rtx5090 | GeForce RTX 5090, CUDA 13.0 | torch 2.11.0+cu130, vLLM 0.25.1, imagen `vllm/vllm-openai@sha256:f0b9a0dc…` | passed |
| df-thor-01 | NVIDIA Thor | vLLM 0.25.1, imagen `vllm/vllm-openai@sha256:2cc49b81…` | passed |

## Requisitos de hardware

- VRAM para pesos: 3,50 GB en el formato del checkpoint (NVFP4 + FP8 + BF16 preservado). Es el minimo teorico para cargar el modelo en vLLM.
- VRAM total estimada: del orden de 6 a 10 GB para una instancia con cache KV y activaciones de una pagina, cifra orientativa no publicada por el autor y que depende de la longitud de contexto y del batch.
- GPU verificadas por el autor: GeForce RTX 5090 (32 GB) y NVIDIA Thor, ambas con vLLM 0.25.1.
- GPU recomendadas: las que soportan NVFP4 y el backend Marlin NvFp4 (familia Blackwell, como RTX 5090 y NVIDIA Thor). En arquitecturas anteriores (Ampere, Ada, Hopper) el soporte de NVFP4 depende de los kernels disponibles en vLLM y no ha sido verificado por el autor.
- GPU de consumo: si cabe en una RTX 5090 (32 GB) segun la evidencia publicada; en una RTX 4090 (24 GB) el espacio de pesos es suficiente, pero el comportamiento de los kernels NVFP4 en Ada no esta verificado.
- Despliegue: vLLM 0.25.1 con imagenes oficiales `vllm/vllm-openai`; se recomienda prefill troceado. No hay artefactos GGUF, por lo que llama.cpp y Ollama no son vias de despliegue soportadas con este repo. TGI y otros runtimes no estan documentados.
- Latencia y throughput: no disponibles. El autor no publica ninguna cifra de velocidad y advierte que la enumeracion de kernels del smoke test no es exhaustiva.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AX-Unlimited-OCR-3B-MoE-CUDA-AXQ-MIX6 | 2.675.503.360 (safetensors); fuente BF16 de 3.336.106.240 | NVFP4 + FP8 E4M3 + BF16 preservado, 6,2371 bits por peso en el tronco | no disponible | MIT | HuggingFace, requiere vLLM |
| baidu/Unlimited-OCR (modelo base) | 3.336.106.240 | BF16 | no disponible | MIT | HuggingFace |
| Otras alternativas de OCR de ~3B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa con terceros no puede completarse: la busqueda web realizada no devolvio resultados tecnicos relevantes (unicamente portadas de agregadores de noticias sin relacion con el modelo). Los unicos datos comparables son los del propio modelo base, del que no se dispone de la model card en la informacion proporcionada.

## Limitaciones y advertencias

- Estado de desarrollo: el manifest declara `status=development`, `runtime_verified=false` y `quality_certified=false`. No hay certificado Tier 1 ni Tier 2 asociado.
- Base empirica minima: la validacion se reduce a una pagina en ingles autogenerada en dos equipos. No hay evaluacion held-out, ni cualificacion de layout o marcado, ni afirmacion de precision o velocidad.
- Sin cifras de rendimiento: no se puede estimar throughput ni latencia con los datos publicados.
- Riesgo de alucinacion: no cuantificado. En OCR, la generacion de texto plausible ausente en la imagen es un riesgo conocido de los modelos autoregresivos, pero el autor no publica ninguna medicion al respecto.
- Idiomas: no hay lista de idiomas soportados ni evaluacion multilingue; extrapolar el comportamiento en castellano u otras lenguas carece de respaldo.
- Contexto: la longitud de contexto no esta declarada, lo que impide dimensionar cache KV o planificar lotes con garantias.
- Dependencia de runtime: el checkpoint esta pensado para vLLM 0.25.1 y requiere la ruta DeepseekV2 para las proyecciones de atencion; otros runtimes pueden no cargar la configuracion de dos grupos de `compressed-tensors`.
- Kernels: el autor advierte que la enumeracion de kernels no es exhaustiva y que el smoke test verifica la carga y generacion de ambas familias de tensores, no un numero concreto de kernels FP8.
- Codigo personalizado: la etiqueta `custom_code` implica ejecutar codigo del repositorio (`trust_remote_code`), con el riesgo de seguridad asociado.
- Licencia: MIT permite uso comercial, modificacion y redistribucion, sin garantia alguna. Se hereda del modelo base baidu/Unlimited-OCR, tambien MIT, pero conviene revisar los terminos de los datos de entrenamiento del modelo original, no documentados aqui.
- Comparaciones: no existe informacion suficiente para afirmar mejoras frente al modelo base en precision o velocidad; lo unico verificable es la reduccion de tamano (3,50 GB frente a los 3.336.106.240 parametros en BF16).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AutomatosX/AX-Unlimited-OCR-3B-MoE-CUDA-AXQ-MIX6
- Modelo base: https://huggingface.co/baidu/Unlimited-OCR
- Revision inmutable del modelo base: https://huggingface.co/baidu/Unlimited-OCR/tree/07dea832e22aefee32ad281d4b80551282e1c168
- Imagen de vLLM usada en la prueba (RTX 5090): `vllm/vllm-openai@sha256:f0b9a0dc75a9fca3b6811e3279367b2d6a448055a000bfd13859587d74cef268`
- Imagen de vLLM usada en la prueba (NVIDIA Thor): `vllm/vllm-openai@sha256:2cc49b81319f7a66a33dd8bd63a7bfddae079122b33ce51989b6828a1f038c37`
- Script de reproduccion de la prueba de humo: `examples/ocr_smoke.py` (incluido en el repositorio, segun la model card)
- Comandos de reproduccion de la conversion: `axquant plan-cuda` y `axquant convert-cuda` con `--q-mode mix6` (documentados en la model card)
- Paper, blog, repositorio de codigo o demo adicionales: no disponibles; la busqueda web realizada no devolvio resultados relevantes sobre este modelo.
