# jancirnodziewiaty/Serenity-26B-A4B-oQ4e

## Resumen

Serenity-26B-A4B-oQ4e es una cuantizacion de 4 bits del modelo ReadyArt/Serenity-26B-A4B, publicada por el usuario jancirnodziewiaty. La model card indica que el proceso se realizo con oQ (oMLX v0.6.4) mediante cuantizacion de precision mixta, con un tamano de grupo de 64 y salida en safetensors para MLX, la libreria de inferencia de Apple para silicio propio. El repositorio ocupa 15,8 GB y los pesos suman 25.805.936.206 parametros reales (aproximadamente 25,8 mil millones).

El modelo hereda la nomenclatura "26B-A4B", que en la convencion habitual de los modelos de mezcla de expertos (MoE) sugiere 26.000 millones de parametros totales y unos 4.000 millones activos por token. La model card del cuantizador menciona como referencia al modelo instruct base gemma-4-26B-A4B-it y senala que se intento incorporar MTP (multi-token prediction) desde ese base, pero que dicha incorporacion degradaba el rendimiento, por lo que se descarto. Se trata, por tanto, de una publicacion orientada a ejecucion local en equipos Apple, no a un modelo nuevo entrenado desde cero.

Su relevancia es practica: permite disponer de un modelo de ~26B con huella de memoria reducida (4 bits) en Macs con memoria unificada suficiente, algo interesante para desarrollo offline, prototipado y despliegues con requisitos de privacidad. No obstante, la informacion publicada es muy escasa: no hay licencia declarada, no hay idiomas declarados, no hay benchmarks y no se detalla el pipeline de inferencia ni las capacidades conservadas tras la cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el identificador "A4B" y la referencia a gemma-4-26B-A4B-it sugieren transformer MoE; no confirmado en la model card) |
| Parametros totales | 25.805.936.206 (25,8 B, dato real de safetensors) |
| Parametros activos | aproximadamente 4.000 millones (inferido del sufijo "A4B"; no confirmado en la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits, group size 64, cuantizacion de precision mixta con oQ (oMLX v0.6.4) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors (libreria: mlx) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre el entrenamiento del modelo base ReadyArt/Serenity-26B-A4B en la informacion disponible: se desconoce el volumen de tokens, la composicion del dataset, si hubo fases de RLHF, DPO u otra optimizacion por preferencias, y tampoco se documenta la arquitectura interna (tipo de atencion, capas, configuracion de expertos) ni el contexto maximo soportado.

Lo que si documenta la model card es el proceso de cuantizacion posterior: se aplico oQ (oMLX v0.6.4), una herramienta de cuantizacion de precision mixta, sobre el modelo base. El resultado es una representacion de 4 bits con tamano de grupo 64, empaquetada en safetensors para MLX. El autor senala que se probo a incorporar MTP (multi-token prediction) procedente del modelo gemma-4-26B-A4B-it y que se descarto porque reducia el rendimiento, de modo que la version publicada no incluye MTP. No se detalla que capas o tensores recibieron mayor o menor precision dentro del esquema mixto.

## Capacidades

- No se ha publicado informacion especifica sobre las capacidades del modelo en la informacion disponible.
- Al ser una cuantizacion del modelo ReadyArt/Serenity-26B-A4B, sus capacidades funcionales dependen por completo de dicho modelo base, cuya model card no se ha facilitado.
- La presencia de la referencia a gemma-4-26B-A4B-it sugiere un linaje de modelo instruct conversacional, pero no se confirma el soporte de tool calling, function calling ni razonamiento multi-paso.
- No se confirma el soporte multilingue ni la lista de idiomas, pese a que las familias Gemma suelen ser multilingues.
- No se confirma la existencia de modos especiales (thinking mode, vision, audio).
- El formato MLX implica que el consumo previsto es en Apple Silicon mediante la libreria mlx.

## Casos de uso

- Ejecucion local en Mac para desarrollo sin conexion: al estar empaquetado en MLX con 4 bits y 15,8 GB de pesos, el modelo se puede cargar en un Mac con memoria unificada suficiente para iterar en local sin depender de APIs externas.
- Prototipado de asistentes conversacionales antes de decidir el despliegue final: permite evaluar el comportamiento del modelo base ReadyArt/Serenity-26B-A4B a un coste de memoria reducido, siempre que se valide que la cuantizacion no degrada la tarea objetivo.
- Procesamiento de documentos con requisitos de confidencialidad: al ejecutarse en hardware propio, los textos no salen del equipo, lo que encaja en flujos con datos personales o internos que no pueden enviarse a servicios en la nube.
- Evaluacion comparativa de cuantizaciones: sirve como punto de referencia frente a otras variantes del mismo modelo base (por ejemplo, cuantizaciones de 8 bits o el modelo sin cuantizar) para medir la perdida de calidad en tareas concretas.
- Generacion de texto y resumenes en lote sobre corpus locales: utilizable en scripts que recorran documentos y produzcan resumenes o extracciones, aprovechando la memoria reducida para mantener el modelo cargado de forma permanente.
- Base para experimentos academicos con modelos MoE: si se confirma la arquitectura de mezcla de expertos, resulta apropiado para estudiar enrutado de expertos y efectos de la cuantizacion sobre distintas rutas, aunque esta capacidad no esta documentada por el autor.
- Integracion en aplicaciones de escritorio para macOS: la libreria mlx permite embeber el modelo en aplicaciones nativas Apple, algo que no es viable con formatos pensados exclusivamente para CUDA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del cuantizador no incluye tablas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y tampoco se aportan mediciones de latencia o throughput.

## Requisitos de hardware

- Almacenamiento: el repositorio ocupa 15,8 GB, por lo que se recomienda disponer de al menos 20 GB libres para la descarga y la conversion temporal.
- Memoria: los pesos en 4 bits requieren aproximadamente 16 GB de memoria unificada solo para el modelo, mas el espacio de la cache KV, cuyo tamano depende de un contexto maximo que no esta documentado. Como referencia prudente, se recomienda un equipo con 32 GB de memoria unificada o mas.
- GPU: el formato MLX esta disenado para Apple Silicon (familias M1, M2, M3 y M4), no para GPU NVIDIA o AMD. No hay soporte nativo documentado para A100, H100 o RTX 4090 con estos pesos.
- Viabilidad en hardware de consumo: previsiblemente si en Macs con 32 GB o mas de memoria unificada; en configuraciones de 16 GB o 24 GB el margen es escaso o nulo una vez anadida la cache KV, y no hay datos publicados que lo confirmen.
- Despliegue: la libreria declarada es mlx. No se documenta compatibilidad con vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia, dado que el formato es safetensors MLX y no GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Serenity-26B-A4B-oQ4e | 25,8 B totales (activos no confirmados, ~4 B segun el nombre) | no disponible | MLX safetensors, 4 bits, group size 64 | no disponible | Cuantizacion mixta con oQ; sin MTP |
| ReadyArt/Serenity-26B-A4B | misma base (25,8 B) | no disponible | no disponible | no disponible | Modelo de partida del que deriva esta version |
| Alternativas comparables de la misma categoria | no disponible | no disponible | no disponible | no disponible | No se ha encontrado informacion de modelos comparables en la busqueda realizada |

## Limitaciones y advertencias

- La model card no declara licencia. Sin una licencia explicita, no se puede asumir permiso para uso comercial ni para redistribucion; es imprescindible consultar con el autor y con el titular del modelo base antes de cualquier uso en produccion.
- No hay informacion sobre sesgos. Al desconocerse el dataset de entrenamiento del modelo base, no es posible evaluar sesgos de genero, raza, idioma o ideologia.
- Riesgo de alucinacion: inherente a los modelos generativos y no cuantificado en esta publicacion; ademas, la cuantizacion de 4 bits puede incrementar la tasa de error en tareas de razonamiento o de recuperacion precisa de datos.
- La cuantizacion de precision mixta implica una perdida de calidad no documentada. No se han publicado comparaciones contra el modelo sin cuantizar, por lo que no se puede saber en que tareas el impacto es aceptable.
- No se confirma el soporte multilingue ni el contexto maximo, dos parametros criticos para dimensionar cualquier despliegue.
- El repositorio tiene 0 descargas y 1 like, y fue creado en septiembre de 2026. Es una publicacion sin validacion por parte de la comunidad, lo que aumenta el riesgo de errores no detectados.
- La ausencia de MTP es una decision consciente del autor por motivos de rendimiento, pero implica renunciar a la decodificacion acelerada que esa tecnica aporta en el modelo base.
- El formato MLX limita el despliegue a hardware Apple Silicon, lo que excluye de facto la mayor parte de la infraestructura de servidores basada en NVIDIA.
- No se documenta el pipeline de inferencia ni la plantilla de prompt, por lo que el formato exacto de las conversaciones debe deducirse del modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jancirnodziewiaty/Serenity-26B-A4B-oQ4e
- Modelo base: https://huggingface.co/ReadyArt/Serenity-26B-A4B
- Herramienta de cuantizacion oQ / oMLX: https://github.com/jundot/omlx
- Libreria MLX (Apple): https://github.com/ml-explore/mlx
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo. Las busquedas devolvieron unicamente paginas del sitio de la administracion tributaria francesa (impots.gouv.fr), sin ninguna relacion con el modelo o con su proceso de cuantizacion.
