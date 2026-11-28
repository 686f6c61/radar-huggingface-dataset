# 1lock/gemma4-31b-l1

## Resumen

`1lock/gemma4-31b-l1` es un modelo multimodal de tipo image-text-to-text publicado en Hugging Face por el usuario 1lock el 27 de noviembre de 2026. Se trata de un fine-tune derivado del modelo `MachinePulseAI/karpo-decision-31B`, según declara la propia model card, y conserva la licencia Apache 2.0 del modelo upstream. El repositorio contiene 31.273.088.876 parámetros en formato safetensors (31,27 mil millones), con un tamano total de 62,6 GB, lo que sugiere pesos en precision de 16 bits.

La relevancia de esta ficha es limitada por la escasez de informacion publicada: la model card es practicamente un esqueleto de metadatos, sin descripcion de arquitectura, datos de entrenamiento, benchmarks ni idiomas soportados. El nombre comercial ("gemma4") no debe interpretarse como una confirmacion de que la arquitectura sea la de la familia Gemma de Google, ya que no hay documentacion tecnica que lo respalde; el unico linaje declarado es el modelo base de MachinePulseAI.

Por tanto, esta ficha recoge los datos verificables del repositorio (parametros, tamano, licencia, pipeline y modelo base) y marca explicitamente como "no disponible" todo aquello que el autor no ha documentado. Cualquier evaluacion de produccion deberia acompanarse de una validacion directa del checkpoint antes de su adopcion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere familia Gemma, sin confirmar) |
| Parametros totales | 31.273.088.876 (31,27 B) |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors, presumiblemente bf16/fp16 por el tamano de 62,6 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline | image-text-to-text (multimodal imagen + texto) |
| Libreria | transformers |
| Modelo base | MachinePulseAI/karpo-decision-31B (fine-tune) |
| Tamano del repositorio | 62,6 GB |
| Fecha de publicacion | 2026-11-27 |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo. El pipeline declarado (`image-text-to-text`) y las etiquetas del repositorio indican que se trata de un modelo multimodal capaz de procesar imagenes y texto, pero la model card no especifica el tipo de encoder visual, el mecanismo de fusion multimodal ni la arquitectura del backbone de lenguaje. El nombre "gemma4" sugiere una posible relacion con la familia Gemma, pero no existe documentacion que lo confirme y el linaje declarado apunta a `MachinePulseAI/karpo-decision-31B`.

Tampoco hay datos sobre el proceso de entrenamiento: numero de tokens, composicion del dataset, tecnicas de alineacion (RLHF, DPO, SFT) ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. La unica informacion disponible es que se trata de un derivado modificado del modelo base, distribuido bajo la licencia Apache 2.0 del upstream.

## Capacidades

- Generacion de texto conversacional, segun la etiqueta `conversational` del repositorio.
- Procesamiento de imagen y texto de forma conjunta (pipeline `image-text-to-text`), lo que permite tareas de comprension visual y respuesta en lenguaje natural.
- Compatibilidad declarada con endpoints (`endpoints_compatible`), lo que facilita su despliegue en infraestructuras de inferencia gestionadas.
- Capacidades de razonamiento, codigo, matematicas o tool calling: no disponibles en la informacion publicada.
- Soporte multilingue: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponibles.

## Casos de uso

- Descripcion y analisis de imagenes en flujos conversacionales: el pipeline image-text-to-text permite enviar una imagen junto con una pregunta y obtener una respuesta textual, adecuado para asistentes de accesibilidad o catalogacion de contenido visual.
- Prototipado de asistentes multimodales: al estar en formato transformers y safetensors, se puede cargar con la libreria estandar para experimentar con interacciones imagen-texto en entornos de investigacion.
- Evaluacion comparativa de fine-tunes: util como punto de partida para estudiar como un fine-tune derivado de `karpo-decision-31B` se comporta frente al modelo base en tareas multimodales.
- Despliegue en endpoints compatibles: la etiqueta `endpoints_compatible` sugiere su uso en servicios de inferencia gestionados para aplicaciones de chat con soporte de imagen.
- Base para nuevos fine-tunes: al estar bajo Apache 2.0 y en safetensors, puede servir como punto de partida para ajustes especificos de dominio, siempre que se valide previamente su calidad.
- Investigacion sobre linajes de modelos: permite analizar la trazabilidad de derivados publicados en Hugging Face y las practicas de documentacion de los mismos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 62,6 GB solo para los pesos, mas overhead de activaciones y cache KV; se recomienda al menos 80 GB de VRAM para inferencia comoda.
- GPU recomendadas para precision completa: A100 80 GB, H100 80 GB o multiples GPU con paralelismo de tensor.
- Cuantizacion a 8 bits: reduciria los pesos a unos 31 GB, viable en una A100 40 GB o en configuraciones con offloading.
- Cuantizacion a 4 bits: reduciria los pesos a unos 16 GB, lo que podria permitir su ejecucion en GPUs consumer de gama alta (RTX 4090 24 GB), siempre que la arquitectura sea compatible con las herramientas de cuantizacion.
- Opciones de despliegue: transformers (declarado), y potencialmente vLLM, TGI o llama.cpp si se generan pesos GGUF, aunque no hay confirmacion de compatibilidad en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| 1lock/gemma4-31b-l1 | 31,27 B | no disponible | Apache 2.0 | safetensors | Fine-tune multimodal de karpo-decision-31B |
| MachinePulseAI/karpo-decision-31B | no disponible | no disponible | no disponible | no disponible | Modelo base declarado |
| Alternativas de ~30 B multimodales | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

No se dispone de informacion suficiente para establecer una comparativa rigurosa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Documentacion practicamente inexistente: la model card no describe arquitectura, datos de entrenamiento ni evaluaciones, lo que impide validar sus capacidades de forma objetiva.
- El nombre "gemma4" no esta respaldado por documentacion que confirme la arquitectura de la familia Gemma; debe tratarse como una etiqueta comercial sin garantia tecnica.
- Riesgo de alucinacion y sesgos: no evaluado ni documentado por el autor.
- Idiomas soportados: no declarados, por lo que no se puede garantizar un rendimiento adecuado en castellano ni en otros idiomas.
- Longitud de contexto: no disponible, lo que impide planificar casos de uso con ventanas largas.
- Licencia Apache 2.0 permite uso comercial, pero al ser un derivado conviene revisar la licencia del modelo base `MachinePulseAI/karpo-decision-31B` para confirmar compatibilidad y obligaciones de atribucion.
- Modelo con cero descargas y cero likes en el momento de la consulta: sin validacion por parte de la comunidad.
- Para produccion, es imprescindible realizar una evaluacion propia de calidad, seguridad y comportamiento antes de su adopcion.

## Enlaces

- Hugging Face: https://huggingface.co/1lock/gemma4-31b-l1
- Modelo base: https://huggingface.co/MachinePulseAI/karpo-decision-31B
