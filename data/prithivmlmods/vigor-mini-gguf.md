# prithivMLmods/VIGOR-mini-GGUF

## Resumen

VIGOR-mini (Vision Intelligence and Guardrail Oriented Reasoning) es un modelo multimodal denso de aproximadamente 4.300 millones de parametros derivado de Qwen/Qwen3.5-4B, desarrollado por prithivMLmods. Su proposito es actuar como clasificador de seguridad de contenido visual: analiza imagenes y devuelve una descripcion estructurada junto con una decision binaria Safe / NSFW, con un umbral conservador orientado a control parental y proteccion de menores. La version aqui descrita es la cuantizacion GGUF del modelo base, publicada para inferencia local con llama.cpp.

El modelo combina un encoder visual y un decodificador de lenguaje de la familia Qwen3.5, con un proyector multimodal (mmproj) que alinea ambos espacios. La salida se fuerza a JSON estricto con cinco claves (`scene_description`, `is_nsfw`, `classification_reason`, `nsfw`, `safe`), lo que facilita su integracion como guardrail en pipelines automaticos. Emplea Multi-Token Prediction (MTP) como mecanismo de decodificacion especulativa integrada en los pesos, lo que acelera la inferencia local sin necesidad de un modelo borrador separado.

Es relevante ahora porque los filtros de contenido visual siguen siendo un cuello de botella en plataformas con volumen alto de imagenes generadas por usuarios, y un modelo de 4B cuantizado a 2,8 GB (Q4_K_M) puede desplegarse en hardware de consumo manteniendo una politica de clasificacion explicita y auditable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal denso (familia Qwen3.5), con MTP para decodificacion especulativa |
| Parametros totales | 4.326.350.848 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q3_K_L, Q3_K_M, Q4_K_M, Q4_K_S, Q5_K_M, Q5_K_S, Q6_K; proyector mmproj en BF16 |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con fichero mmproj separado para vision) |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal denso construido sobre Qwen/Qwen3.5-4B. El pipeline declarado es `image-text-to-text`, con un encoder visual acoplado mediante un proyector multimodal que se distribuye como fichero aparte (`VIGOR-mini.mmproj-bf16.gguf`, 676 MB). La innovacion tecnica destacada en la model card es MTP (Multi-Token Prediction): los pesos GGUF incorporan cabezas adicionales que predicen varios tokens futuros en un unico forward pass, lo que implementa decodificacion especulativa sin un modelo borrador externo y acelera la generacion local.

La model card no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO. El modelo esta afinado especificamente para clasificacion de seguridad visual y razonamiento orientado a guardrail, con enfasis en ropa, exposicion corporal, poses, encuadre y contexto de escena. El autor lo etiqueta como experimental y recomienda el uso del modelo base en Transformers frente a la version GGUF para maxima fidelidad.

## Capacidades

- Clasificacion binaria Safe / NSFW de imagenes con umbral conservador (ante la duda, NSFW).
- Descripcion visual detallada y objetiva del sujeto, la ropa, el nivel de exposicion y la pose.
- Generacion de justificacion textual de la clasificacion (`classification_reason`).
- Salida en JSON estricto con claves y tipos fijados, adecuada para parsing automatico.
- Analisis de contenido sensible: desnudos, ropa interior, lenceria, banadores sugestivos, transparencias, arte anime/ecchi/hentai, poses sexualizadas y actos explicitos.
- Modo de razonamiento configurable: plantilla por defecto con thinking desactivado y variante con thinking activado.
- Decodificacion especulativa integrada via MTP para acelerar la inferencia local.
- Capacidad conversacional heredada del modelo base, aunque el uso previsto es la clasificacion.

## Casos de uso

- Moderacion de subidas de imagen en plataformas UGC: cada imagen se envia al modelo con el prompt estandar y la respuesta JSON se usa para bloquear, marcar para revision humana o aprobar automaticamente, con la justificacion registrada para auditoria.
- Control parental en dispositivos y aplicaciones infantiles: el clasificador actua como filtro previo a la renderizacion de imagenes recibidas o generadas, apoyandose en el umbral conservador del prompt estandar.
- Pre-filtrado en pipelines de generacion de imagen: antes de publicar una imagen sintetica se valida con VIGOR-mini para descartar contenido que viole la politica de la plataforma.
- Triaje en equipos de confianza y seguridad: el modelo prioriza la cola de revision humana clasificando primero las imagenes marcadas como NSFW y aportando una descripcion objetiva que acelera la decision del moderador.
- Etiquetado de datasets de vision: se puede usar para anotar grandes volumenes de imagenes con etiquetas Safe/NSFW y descripciones de escena, generando metadatos para entrenar o filtrar otros modelos.
- Despliegue en el borde o en local: con la cuantizacion Q4_K_M (2,78 GB) el modelo cabe en equipos sin GPU dedicada de gama alta y permite moderacion on-device sin enviar imagenes a un servicio externo.
- Investigacion en seguridad multimodal: sirve como baseline reproducible para estudiar sesgos y calibracion de clasificadores de contenido sensible en un rango de 4B parametros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 2,5-3,5 GB con cuantizaciones Q3 y Q4; unos 3,2-3,7 GB con Q5 y Q6; unos 9,4 GB con BF16 (8,67 GB de pesos mas el proyector mmproj de 676 MB).
- GPU recomendadas: no especificadas en la model card. Los tags mencionan nvidia-blackwell y rtx-pro-6000, pero no se aportan cifras de rendimiento ni configuraciones validadas.
- Cabe en GPU de consumo: si, con las cuantizaciones Q3 a Q6; el fichero Q4_K_M (2,78 GB) es el tamano recomendado por el autor para la mayoria de casos.
- Opciones de despliegue: llama.cpp (herramienta con la que se generaron las cuantizaciones), y por extension los runners compatibles con GGUF; el tag `text-generation-inference` figura en los metadatos, pero la model card solo documenta el flujo con llama.cpp.
- Latencia y throughput: no disponibles. La model card solo afirma que MTP acelera la inferencia local, sin cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| VIGOR-mini-GGUF | 4,3B | no disponible | Clasificacion Safe/NSFW multimodal | Apache 2.0 | GGUF |
| prithivMLmods/VIGOR-mini (base) | 4,3B | no disponible | Clasificacion Safe/NSFW multimodal | Apache 2.0 | Transformers |
| Qwen/Qwen3.5-4B | 4B (aprox.) | no disponible | LLM/VLM generalista | no disponible | no disponible |

La informacion disponible no incluye comparaciones con otros clasificadores de seguridad visual, por lo que no es posible contrastar rendimiento frente a alternativas de la misma categoria.

## Limitaciones y advertencias

- Modelo marcado como experimental por el propio autor; recomienda usar la version en Transformers frente al GGUF para maxima calidad.
- Solo soporta ingles (`language: en`); los prompts y salidas en otros idiomas no estan garantizados.
- Riesgo de falsos positivos por el umbral conservador ("ante la duda, NSFW"), que puede bloquear contenido legitimo como imagenes medicas, artisticas o de playa.
- Riesgo de falsos negativos en imagenes ambiguas, ilustraciones o estilos visuales poco representados en el entrenamiento.
- No se documentan sesgos demograficos, culturales ni de representacion; un clasificador de exposicion corporal puede penalizar de forma desigual segun el sujeto.
- La salida JSON depende de que se use el prompt estandar; prompts alternativos pueden romper el formato y requerir validacion posterior.
- No hay datos publicados de benchmarks, calibracion ni tasas de error, lo que impide evaluar su fiabilidad en produccion sin una validacion propia.
- La licencia Apache 2.0 permite uso comercial, pero el autor declara que cualquier salida generada es responsabilidad exclusiva del usuario y que el modelo se destina a investigacion y clasificacion de seguridad.
- No se especifica la longitud de contexto, lo que limita el diseno de flujos con prompts largos o multiples imagenes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/prithivMLmods/VIGOR-mini-GGUF
- Modelo base: https://huggingface.co/prithivMLmods/VIGOR-mini
- Modelo Qwen3.5-4B de referencia: https://huggingface.co/Qwen/Qwen3.5-4B
- llama.cpp: https://github.com/ggml-org/llama.cpp
