# h2oai/h2o-lightning-4b-gguf

## Resumen

H2O Lightning 4B GGUF es la distribucion cuantizada en formato GGUF del modelo H2O-Lightning-4B, desarrollado por H2O.ai. Se trata de un modelo de decision multimodal (image-text-to-text) disenado especificamente para emitir decisiones tipadas con probabilidades asociadas, no para generacion de texto libre. El modelo responde con opciones nombradas (`choice`), valores booleanos (`noul`), niveles ordenados (`score`) y cajas delimitadoras en imagenes (`box`).

La relevancia del modelo radica en su enfoque: en lugar de producir texto generativo, devuelve decisiones estructuradas y calibradas, lo que lo hace adecuado para sistemas de automatizacion donde se requiere una respuesta categorica con un grado de confianza cuantificado. Segun la model card, el modelo base BF16 lidera el ranking compuesto de ImageJevBench v0.3.0 entre modelos open-weight de su clase (#1 de 46) y ocupa la segunda posicion en las categorias de Intelligence y Capability.

El repositorio GGUF ofrece seis niveles de cuantizacion, desde BF16 (8,42 GB) hasta IQ3_XXS (1,90 GB), con una degradacion de calidad medida y acotada: el archivo Q8_0 reproduce el 99,6% de las respuestas del BF16 y obtiene una puntuacion en el Decision Index estadisticamente indistinguible de la referencia. Esto permite desplegar el modelo en hardware de consumo con perdida minima de fidelidad en las decisiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `qwen3_5` en la model card; transformer multimodal image-text-to-text) |
| Parametros totales | 4.205.751.296 (4,2 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q5_K_M, Q4_K_M, mixed-IQ3_XXS, IQ3_XXS |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (libreria llama-cpp); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

La model card del repositorio GGUF no detalla la arquitectura interna ni el proceso de entrenamiento, remitiendo a la pagina del modelo base (h2oai/h2o-lightning-4b). La etiqueta `qwen3_5` sugiere una base derivada de la familia Qwen, y la pipeline `image-text-to-text` confirma que se trata de un modelo multimodal que procesa imagenes y texto. El dato de parametros totales (4,2 mil millones) procede de los safetensors del modelo base.

La innovacion principal documentada es el mecanismo de decisiones tipadas: el modelo emite respuestas estructuradas con probabilidades en lugar de texto libre. Los cuatro tipos de decision son `choice` (seleccion entre opciones nombradas), `noul` (verdadero/falso), `score` (niveles ordenados) y `box` (caja delimitadora sobre imagen). Para peticiones con imagenes, la model card indica que se usa una temperatura de 1.0 configurada en los metadatos de los archivos nativos. No se dispone de informacion sobre volumen de tokens de entrenamiento, composicion del dataset ni uso de RLHF o DPO.

## Capacidades

- Toma de decisiones tipadas con probabilidades calibradas: `choice`, `noul`, `score` y `box`.
- Procesamiento multimodal image-text-to-text: acepta imagenes junto con texto.
- Localizacion espacial mediante cajas delimitadoras (`box`) en imagenes, evaluada en la pista Box de ImageJevBench.
- Razonamiento orientado a decision (categoria Intelligence en ImageJevBench).
- Capacidad de computo (categoria Capability en ImageJevBench), incluyendo la pista de computer-use.
- Calibracion de probabilidades como capacidad central (etiquetas `calibration` y `typed-decisions`).
- Compatibilidad con endpoints (`endpoints_compatible`) y uso conversacional.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible de forma explicita; la pista computer-use sugiere uso en entornos de agente.
- Capacidades multilingues: no disponible.

## Casos de uso

- Clasificacion con confianza cuantificada: usar el tipo `choice` para asignar una categoria entre opciones nombradas y obtener la probabilidad asociada, util en triaje de tickets o enrutado de peticiones donde se necesita umbral de confianza para escalar a revision humana.
- Verificacion binaria automatizada: emplear `noul` para validar si una imagen o texto cumple una condicion (por ejemplo, si un documento contiene un campo requerido), con probabilidad de verdadero/falso para decidir la accion.
- Puntuacion ordenada en control de calidad: usar `score` para asignar niveles ordenados (por ejemplo, severidad de un defecto visual o calidad de una imagen) y agregar los resultados en pipelines de inspeccion.
- Deteccion y localizacion de objetos en imagenes: el tipo `box` devuelve coordenadas de caja delimitadora, adecuado para tareas de recorte, resaltado o anotacion asistida sobre capturas e imagenes.
- Automatizacion de computer-use: la pista computer-use de ImageJevBench indica su uso para decidir acciones sobre interfaces graficas a partir de capturas de pantalla, integrable en agentes de automatizacion de escritorio.
- Despliegue en hardware de consumo: con los archivos Q4_K_M (2,71 GB) o IQ3_XXS (1,90 GB) el modelo cabe en GPUs de gama media y mantiene mas del 96% de concordancia con BF16, lo que permite prototipado local de sistemas de decision sin infraestructura dedicada.
- Servicio de decision de baja latencia: el tamano de 4,2 mil millones de parametros y las cuantizaciones de 2-4 GB permiten servir el modelo con llama.cpp en CPU o GPU modesta para decisiones en linea.

## Benchmarks y rendimiento

Resultados del modelo base BF16 en ImageJevBench v0.3.0 y JevBench (segun la model card). No se proporcionan valores numericos absolutos para las categorias Composite, Intelligence y Capability, solo posiciones y comparaciones.

| Benchmark | Posicion | Comparacion |
|---|---|---|
| ImageJevBench v0.3.0, Composite (open-weight) | #1 de 46 (#2 de 55 incluyendo API) | Por delante de Drex Max (44,65), Jev 1.13.0 + images (26,43), Clef-Flash (20,41), Liquid d1-3B (4,10) |
| ImageJevBench v0.3.0, Intelligence (open-weight) | #2 de 46 (#6 de 55) | Por delante de Clef (47,40) y Liquid d1-3B (16,31) |
| ImageJevBench v0.3.0, Capability (open-weight) | #2 de 46 (#6 de 55) | Por delante de Clef (58,08) y Liquid d1-3B (47,78) |
| JevBench (2026-10-28), Composite (open-weight) | #2 de 170 (#12 de 201) | Por delante de d1 (Liquid AI, 72,82), Microsoft-Decision-1 (69,08), OpenAI Decisions (62,37), pplx-decider-flash (54,01) |
| ImageJevBench Box track (PREVIEW) | #1 de 4 (#1 de 5) | Por delante de Jev 1.14.0 (75,71) |
| ImageJevBench computer-use track, Composite | #1 de 46 (#3 de 55) | Por delante de Liquid d1-3B (66,22) y Clef-Flash (55,29) |

Calidad por cuantizacion (Decision Index y concordancia con BF16):

| Precision | Tamano | Concordancia con BF16 | Decision Index vs BF16 (IC 95%) | Aciertos / 231 |
|---|---:|---:|---:|---:|
| BF16 | 8,42 GB | referencia | referencia (59,98) | 201 |
| Q8_0 (recomendado) | 4,48 GB | 99,6% | -0,36 (-0,94 a +0,11), dentro del ruido | 202 |
| Q5_K_M | 3,07 GB | 99,1% | -0,12 (-1,43 a +0,97), dentro del ruido | 205 |
| Q4_K_M | 2,71 GB | 98,5% | -0,86 (-2,34 a +0,48), dentro del ruido | 201 |
| mixed-IQ3_XXS | 2,16 GB | 96,9% | +0,34 (-1,55 a +2,02), dentro del ruido | 199 |
| IQ3_XXS | 1,90 GB | 96,4% | -0,44 (-2,71 a +1,39), dentro del ruido | 201 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8,4 GB en BF16, 4,5 GB en Q8_0, 3,1 GB en Q5_K_M, 2,7 GB en Q4_K_M y 1,9-2,2 GB en las variantes IQ3.
- GPU recomendadas: no especificadas por el autor; por tamano, cualquier GPU con al menos 3-9 GB de VRAM libre segun cuantizacion es suficiente.
- Cabe en GPU de consumo: si, en todas las cuantizaciones; Q4_K_M e IQ3_XXS caben en GPUs de 4 GB o superiores, y BF16 requiere unos 9-10 GB.
- Opciones de despliegue: llama.cpp (libreria del repositorio), con soporte de etiquetas `-hf` para descarga directa de cada precision; compatible con endpoints.
- Advertencia de hardware: en GPU NVIDIA Blackwell (compute capability 12.0, como RTX 50 series y RTX PRO 6000) con llama.cpp compilado con CUDA toolkit 13.2.0 o 13.2.1, los archivos IQ3_XXS y mixed-IQ3_XXS producen respuestas casi aleatorias (67 y 81 aciertos de 231 frente a 201 y 199 con CUDA 12.9). Es un fallo del compilador documentado en el issue #28581 de llama.cpp; afecta tambien, segun reportes, a 10.x (B200, GB200, GB300). Los otros cuatro archivos funcionan con normalidad.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Comparativa segun los datos de benchmark de la model card (puntuaciones Composite en JevBench e ImageJevBench):

| Modelo | Desarrollador | Parametros | Contexto | Licencia | Posicion en benchmarks |
|---|---|---|---|---|---|
| H2O Lightning 4B | H2O.ai | 4,2 B | no disponible | Apache 2.0 | #1 Composite ImageJevBench (open-weight); #2 JevBench |
| Drex Max | Nace AI | no disponible | no disponible | no disponible | 44,65 en ImageJevBench Composite |
| Jev 1.13.0 + images | TypeSafe | no disponible | no disponible | no disponible | 26,43 en ImageJevBench Composite |
| Clef-Flash | Cloudflare | no disponible | no disponible | no disponible | 20,41 en ImageJevBench Composite |
| Liquid d1-3B | Liquid AI | 3 B (por el nombre) | no disponible | no disponible | 4,10 en ImageJevBench Composite; 72,82 en JevBench |
| Microsoft-Decision-1 | Microsoft | no disponible | no disponible | no disponible | 69,08 en JevBench |
| OpenAI Decisions | OpenAI | no disponible | no disponible | propietario (API) | 62,37 en JevBench |
| pplx-decider-flash | Perplexity | no disponible | no disponible | propietario (API) | 54,01 en JevBench |

## Limitaciones y advertencias

- Modelo especializado en decisiones tipadas: no esta disenado para generacion de texto libre ni para tareas generativas generales; su uso fuera del esquema `choice`/`noul`/`score`/`box` puede dar resultados pobres.
- Idiomas soportados no documentados: no hay informacion sobre cobertura multilingue, por lo que el rendimiento fuera del ingles es incierto.
- Longitud de contexto no disponible: no se puede garantizar el comportamiento con entradas largas.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; aqui se manifiesta como decisiones con alta confianza pero incorrectas. La calibracion debe validarse en el dominio de despliegue antes de usar las probabilidades como umbrales automaticos.
- Sesgos: no documentados en la informacion disponible; al no detallarse el dataset de entrenamiento, no es posible evaluar sesgos de dominio, demograficos o culturales.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion; no obstante, el modelo base y los pesos derivados deben conservar el aviso de licencia.
- Fallo conocido en GPU Blackwell con CUDA 13.2.0/13.2.1 para los archivos IQ3_XXS y mixed-IQ3_XXS: evitar esas combinaciones en produccion o compilar con CUDA 12.9.
- Temperatura fijada a 1.0 para peticiones con imagenes: alterar este valor puede desviar el comportamiento calibrado del modelo.
- Los benchmarks citados corresponden al modelo BF16, no a cada archivo GGUF; la tabla de cuantizaciones ofrece la degradacion medida por archivo.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/h2oai/h2o-lightning-4b-gguf
- Modelo base en Hugging Face: https://huggingface.co/h2oai/h2o-lightning-4b
- Detalles de ImageJevBench en la model card: https://huggingface.co/h2oai/h2o-lightning-4b#imagejevbench
- Detalles de JevBench en la model card: https://huggingface.co/h2oai/h2o-lightning-4b#leading-on-benchmarks
- Pista Box de ImageJevBench: https://huggingface.co/h2oai/h2o-lightning-4b#for-benchmark-maintainers-imagejevbench-box-track
- Issue de llama.cpp sobre el fallo en Blackwell: https://github.com/ggml-org/llama.cpp/issues/28581
