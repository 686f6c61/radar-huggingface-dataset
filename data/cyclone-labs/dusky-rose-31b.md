# Cyclone-Labs/Dusky-Rose-31B

## Resumen

Dusky-Rose-31B es un modelo de lenguaje de 31.273.088.876 parametros publicado por Cyclone-Labs el 20 de septiembre de 2026. No es un modelo entrenado desde cero, sino un merge (fusión de pesos) construido con mergekit a partir de cuatro modelos de la familia Gemma 4 de 31B: google/gemma-4-31B-it, ReadyArt/Dark-Scarlett-v2.0-31B, TheDrummer/Artemis-31B-v1.1 y MRockatansky/Gemma-4-31B-Storymaxxed3. El objetivo declarado en las etiquetas del repositorio es el roleplay, la narrativa (storytelling) y la conversación, con soporte multimodal de entrada imagen-texto segun el pipeline declarado.

El modelo se distribuye en formato safetensors para la libreria transformers, con licencia Apache 2.0 y un repositorio de 62,6 GB, coherente con pesos en precision de 16 bits. La model card publicada no contiene documentacion tecnica en texto: esta compuesta casi integramente por hojas de estilo CSS y elementos de presentacion, por lo que no hay informacion sobre datos de entrenamiento, configuracion del merge, longitud de contexto o idiomas soportados.

Su relevancia practica es limitada por el momento: acumula 1 descarga y 1 like, y no se han publicado resultados de benchmarks. Resulta interesante como caso de estudio de merges de la familia Gemma 4 orientados a creatividad y como base de partida para desarrolladores que quieran explorar roleplay narrativo con entrada visual bajo una licencia permisiva, pero no como modelo listo para produccion sin una evaluacion propia previa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Gemma 4); detalles de la arquitectura no disponibles |
| Parametros totales | 31.273.088.876 |
| Parametros activos | no aplica (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; el repositorio distribuye pesos en safetensors (62,6 GB, coherente con ~16 bits por parametro) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tipo de modelo | Merge de pesos (mergekit) |
| Modelos base | google/gemma-4-31B-it, ReadyArt/Dark-Scarlett-v2.0-31B, TheDrummer/Artemis-31B-v1.1, MRockatansky/Gemma-4-31B-Storymaxxed3 |
| Pipeline declarado | image-text-to-text |
| Libreria | transformers |
| Fecha de publicacion | 20 de septiembre de 2026 |

## Arquitectura y entrenamiento

Se trata de un merge de pesos, no de un entrenamiento convencional. La model card declara la etiqueta `mergekit` y cuatro modelos base, todos ellos derivados o adaptaciones de la familia Gemma 4 de 31B: el instruct oficial de Google (gemma-4-31B-it), un modelo orientado a narrativa (Gemma-4-31B-Storymaxxed3), y dos merges de roleplay/estilo (Dark-Scarlett-v2.0-31B y Artemis-31B-v1.1). La tecnica concreta de fusion (linear, SLERP, TIES, DARE, model stock, etc.), los pesos relativos de cada componente y la receta de configuracion no se documentan en el repositorio.

No hay informacion publicada sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre fases de ajuste como SFT, RLHF o DPO, mas alla de las que ya incorporasen los modelos base. Tampoco se detalla si se aplicaron tecnicas de decodificacion especulativa, atencion lineal u otras optimizaciones, ni si se preservaron todas las capacidades multimodales del modelo base de Google. El pipeline declarado (image-text-to-text) indica que el modelo acepta imagenes como entrada, algo coherente con un Gemma 4 de 31B multimodal, pero la model card no aporta ningun detalle sobre el codificador visual ni sobre la resolucion de imagen soportada.

## Capacidades

- Generacion de texto conversacional en registro informal y de ficcion, segun las etiquetas `roleplay`, `storytelling` y `conversational`.
- Entrada multimodal imagen-texto: el pipeline declarado es `image-text-to-text`, por lo que admite imagenes junto al texto.
- Mantenimiento de personajes y estilo narrativo a lo largo de conversaciones, objetivo habitual de los merges de roleplay.
- Continuacion y generacion de narrativa larga (ficcion, escenas, dialogos).
- Escritura creativa con condicionamiento visual (describir, continuar o reescribir a partir de una imagen).
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Modo de razonamiento explicito (thinking mode): no documentado.
- Capacidades multilingues: no disponibles.
- Capacidades de audio o video: no disponibles.
- Capacidades de codigo y matematicas: no documentadas especificamente para este merge, aunque serian heredables de los modelos base.

## Casos de uso

- Roleplay conversacional con personajes persistentes: el modelo esta construido por fusion de merges especializados en roleplay, de modo que puede mantener una voz y una personalidad estables en conversaciones multi-turno. Es el caso de uso principal declarado por el autor.
- Generacion de ficcion y narrativa serializada: al combinar un modelo orientado a storytelling (Storymaxxed3) con el instruct oficial, es adecuado para producir capitulos, tramas y descripciones con continuidad estilistica.
- Escritura creativa asistida por imagen: gracias al pipeline image-text-to-text, se le puede pasar una ilustracion, un storyboard o una fotografia y pedirle una escena, una sinopsis o una ficha de personaje coherente con lo que aparece en la imagen.
- Preproduccion de dialogos para videojuegos y visual novels: sirve para generar borradores de arboles de dialogo y variantes de respuesta por personaje antes de la revision humana, reduciendo el tiempo de guionizado.
- Prototipado de asistentes conversacionales con tono marcado: util como banco de pruebas para estudiar como afecta un merge de roleplay al tono de un asistente, antes de decidir si se usa Gemma 4 instruct sin modificar.
- Base para nuevos merges o ajustes finos: al estar bajo licencia Apache 2.0, puede emplearse como componente en recetas de mergekit posteriores o como punto de partida para un LoRA de estilo, sin las restricciones de licencias no comerciales frecuentes en modelos de roleplay.
- Investigacion sobre fusion de modelos: permite estudiar empiricamente el efecto de combinar un instruct oficial con merges de nicho, comparando derivas de estilo, degradacion de instrucciones y retencion de capacidades multimodales.
- Generacion de material de ambientacion (lore): fichas de personajes, descripciones de escenarios y textos de trasfondo para campanas de rol o proyectos transmedia, con revisión humana posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K, MT-Bench ni de evaluaciones de roleplay, y no se han encontrado datos externos en la busqueda web realizada.

## Requisitos de hardware

Las estimaciones siguientes se derivan del recuento real de parametros (31,27 mil millones) y del tamano del repositorio (62,6 GB), no de mediciones publicadas por el autor.

- VRAM para inferencia en bf16/fp16: aproximadamente 62-65 GB solo para los pesos, mas la cache KV (que depende de una longitud de contexto no documentada). En la practica, entre 70 y 90 GB segun contexto y tamano de lote.
- VRAM para cuantizacion de 8 bits: aproximadamente 31-34 GB de pesos.
- VRAM para cuantizacion de 4 bits (Q4_K_M): aproximadamente 18-20 GB de pesos.
- GPUs recomendadas para precision completa: 1x H100 80 GB o 1x A100 80 GB; alternativamente 2x A6000 48 GB o 2x L40S 48 GB con tensor parallelism.
- GPUs recomendadas para 8 bits: 1x A6000 48 GB, 1x L40S 48 GB o 1x H100 80 GB.
- GPU de consumo: con cuantizacion de 4 bits cabe en una RTX 4090 (24 GB) o RTX 3090 (24 GB), siempre con contexto moderado y sin margen amplio; en bf16 no cabe en ninguna GPU de consumo actual.
- Opciones de despliegue: transformers (libreria declarada), vLLM, TGI o SGLang para servir en bf16 o 8 bits. Para llama.cpp u Ollama seria necesaria una conversion a GGUF que el repositorio no declara en la informacion disponible.
- Latencia y throughput: no disponibles. No hay cifras publicadas de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de configuracion de contexto para ninguno de los modelos comparables, por lo que la comparacion se limita a aspectos estructurales y de licencia.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cyclone-Labs/Dusky-Rose-31B | 31,27 mil millones | no disponible | no disponible | Apache 2.0 | HuggingFace, safetensors |
| google/gemma-4-31B-it | 31B (segun nomenclatura del nombre del repositorio) | no disponible | no disponible | no disponible | HuggingFace (modelo base instruct oficial) |
| MRockatansky/Gemma-4-31B-Storymaxxed3 | 31B (segun nomenclatura) | no disponible | no disponible | no disponible | HuggingFace (componente del merge) |
| TheDrummer/Artemis-31B-v1.1 | 31B (segun nomenclatura) | no disponible | no disponible | no disponible | HuggingFace (componente del merge) |
| ReadyArt/Dark-Scarlett-v2.0-31B | 31B (segun nomenclatura) | no disponible | no disponible | no disponible | HuggingFace (componente del merge) |

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: la model card es practicamente una plantilla de estilos CSS, sin ficha de arquitectura, datos de entrenamiento, contexto soportado ni instrucciones de uso. Esto obliga a una evaluacion empirica antes de cualquier uso serio.
- Adopcion practicamente nula: 1 descarga y 1 like en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad y de informes de terceros.
- Riesgo de regresion por merge: las fusiones de pesos pueden degradar capacidades del modelo instruct original (seguimiento de instrucciones, formato estructurado, seguridad) sin que existan benchmarks que lo cuantifiquen.
- Riesgo de alucinacion: no hay evaluaciones de veracidad. En modelos ajustados para roleplay y ficcion, la tendencia a priorizar la coherencia narrativa sobre la exactitud factual suele ser especialmente alta.
- Sesgos: no documentados. No se ha publicado ninguna evaluacion de sesgo, toxicidad o representacion, y el entrenamiento de estilo roleplay puede amplificar estereotipos presentes en los datos de los modelos base.
- Idiomas: no se declara ningun conjunto de idiomas soportados; el comportamiento en castellano no esta verificado.
- Contexto: al no documentarse la ventana de contexto, no se puede garantizar el rendimiento en conversaciones o documentos largos, ni estimar con precision el consumo de cache KV.
- Restricciones de licencia: el modelo se publica como Apache 2.0, pero cada modelo base puede tener sus propias condiciones. Debe verificarse la licencia de google/gemma-4-31B-it y de los tres merges de roleplay antes de un uso comercial, ya que las condiciones de los derivados podrian imponer restricciones adicionales.
- Uso en produccion: sin benchmarks, sin informes de calidad y sin garantias de estabilidad de formato, no se recomienda desplegarlo en produccion sin una bateria de evaluaciones propia y un mecanismo de supervision.
- Contenido generado: tratandose de un modelo orientado a roleplay y ficcion, es esperable la generacion de contenido sensible; se requiere filtrado y politicas de uso adecuadas.
- La busqueda web realizada no arrojo ningun resultado relevante sobre el modelo: los enlaces recuperados correspondian al fenomeno meteorologico "ciclón", sin relacion con el repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Cyclone-Labs/Dusky-Rose-31B
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Modelo base: https://huggingface.co/ReadyArt/Dark-Scarlett-v2.0-31B
- Modelo base: https://huggingface.co/TheDrummer/Artemis-31B-v1.1
- Modelo base: https://huggingface.co/MRockatansky/Gemma-4-31B-Storymaxxed3
- Herramienta referenciada por la etiqueta `mergekit`: https://github.com/arcee-ai/mergekit
- No se han encontrado papers, blogs, demos ni repositorios adicionales especificos de este modelo en la busqueda web realizada.
