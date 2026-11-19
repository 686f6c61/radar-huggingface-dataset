# H3-Tiny/H3-Tiny-17B-Pruned

## Resumen

H3-Tiny-17B-Pruned es un checkpoint de generacion conjunta de video y audio a partir de texto e imagenes de referencia, obtenido mediante poda estructurada del transformer MiniMax H3 Ref2VA. El modelo original de MiniMax cuenta con 33,12 mil millones de parametros; tras eliminar 8 de sus 50 bloques transformer y aplicar un rango 8 en las capas AdaLN, el resultado es un transformer de 17,07 mil millones de parametros. Lo relevante es que la poda se realiza sin reentrenamiento posterior: el checkpoint funciona directamente tras el proceso de pruning, lo que reduce a la mitad los requisitos de computo y memoria respecto al modelo base.

El proyecto H3-Tiny es independiente y no esta afiliado ni respaldado por MiniMax. El repositorio contiene unicamente el transformer en formato diffusers (config.json y safetensors fragmentados); el codificador de texto, los VAE y los procesadores deben tomarse del checkpoint oficial de MiniMax H3 en formato diffusers. El pipeline declarado es text-to-video, con soporte adicional para reference-to-video y generacion de audio.

La licencia es la MiniMax H3 Community License Agreement, que impone restricciones territoriales y una politica de uso aceptable. Al ser un modelo derivado de MiniMax H3, su uso comercial queda sujeto a los terminos de dicha licencia. El checkpoint se publico el 19 de noviembre de 2026 y, en el momento de la consulta, no registra descargas ni interacciones en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (MiniMax H3 Ref2VA) con poda estructurada; 42 de 50 bloques, AdaLN rango 8 |
| Parametros totales | 17.067.115.600 (17,07B, solo transformer) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | MiniMax H3 Community License Agreement (license: other) |
| Formato de pesos | safetensors (fragmentados, layout diffusers con config.json) |
| Pasos de muestreo | 50 |
| Tamano del repositorio | 34,2 GB |
| Biblioteca | diffusers |
| Pipeline | text-to-video (con reference-to-video y audio) |

## Arquitectura y entrenamiento

El modelo base es el transformer MiniMax H3 Ref2VA, disenado para generacion conjunta de video y audio condicionada por texto e imagenes de referencia. H3-Tiny-17B-Pruned aplica una poda estructurada sobre ese transformer: se eliminan 8 de los 50 bloques y se reduce el rango de las capas AdaLN (normalizacion adaptativa condicionada) a 8. El resultado es un modelo de 17,07B de parametros que conserva la topologia del original pero con menor profundidad y menor capacidad de modulacion condicionada.

La innovacion principal es que la poda es training-free: no se realiza ajuste fino ni destilacion posterior, de modo que el checkpoint funciona directamente tras el recorte. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre el uso de RLHF o DPO en el modelo base. La generacion se realiza con 50 pasos de muestreo. El proyecto contempla una etapa adicional de reduccion hasta 14B (33B → 17B → 14B), segun indica la model card.

## Capacidades

- Generacion de video a partir de texto (text-to-video).
- Generacion conjunta de video y audio en una sola pasada.
- Generacion condicionada por imagenes de referencia (reference-to-video), con sintaxis de prompt del tipo `<Picture 1> ...`.
- Control del numero de fotogramas generados (por ejemplo, `--num-frames 124`).
- Integracion con diffusers mediante `h3tiny.pipeline.load_pipeline`.
- Soporte de backends de atencion y tecnicas de offloading (segun el README del repositorio GitHub).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.

## Casos de uso

- Generacion de clips promocionales con audio sincronizado: el modelo produce video y audio de forma conjunta, lo que elimina la necesidad de un pipeline separado de sintesis de voz o efectos y simplifica la produccion de anuncios cortos.
- Prototipado rapido de storyboards animados: a partir de un prompt de texto y una o varias imagenes de referencia, se generan secuencias de 124 fotogramas para validar una idea visual antes de invertir en produccion.
- Creacion de contenido para redes sociales: la reduccion de 33B a 17B parametros permite desplegar el modelo en infraestructura mas modesta que el original, manteniendo la generacion conjunta de video y audio.
- Animacion de imagenes de producto: el modo reference-to-video permite tomar una foto de catalogo como referencia y generar un clip con movimiento y audio descriptivo.
- Investigacion en poda de modelos generativos: el checkpoint sirve como caso de estudio de poda estructurada training-free en transformers de difusion multimodal, comparable directamente con el modelo base de 33B.
- Generacion de material didactico audiovisual: clips cortos con narracion o ambiente sonoro generados en una sola inferencia, utiles para cursos y presentaciones.
- Pruebas de concepto en entornos con VRAM limitada: al requerir aproximadamente la mitad de memoria que el modelo original, permite experimentar con generacion video-audio en GPUs de gama alta para consumidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El repositorio ocupa 34,2 GB en safetensors; en precision de 16 bits el transformer de 17,07B requiere aproximadamente 34 GB solo para los pesos, mas memoria para activaciones, el codificador de texto y los VAE del modelo base.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por el volumen de pesos, se requiere al menos una GPU con 40-80 GB de VRAM (A100 40/80 GB, H100) para inferencia sin cuantizacion.
- Cabe en GPU de consumidor: no de forma directa sin cuantizacion ni offloading; el README del repositorio GitHub menciona opciones de offloading que podrian permitirlo en GPUs de 24 GB (RTX 4090), aunque no se confirman requisitos exactos.
- Opciones de despliegue: diffusers con el paquete `h3tiny` (repositorio GitHub fuyi25/H3-Tiny); se mencionan backends de atencion y offloading. No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| H3-Tiny-17B-Pruned | 17,07B (transformer) | No disponible | Texto + referencia a video y audio | MiniMax H3 Community License | Hugging Face (H3-Tiny) |
| MiniMax H3 Ref2VA (base) | 33,12B (transformer) | No disponible | Texto + referencia a video y audio | MiniMax H3 Community License | Checkpoint oficial MiniMax H3 |
| H3-Tiny-14B | No disponible (objetivo 14B) | No disponible | Texto + referencia a video y audio | MiniMax H3 Community License | Hugging Face (H3-Tiny) |

La comparativa se limita a las variantes del propio proyecto H3-Tiny y al modelo base, ya que no se dispone de datos de rendimiento ni de especificaciones de modelos alternativos de generacion conjunta video-audio en la informacion proporcionada.

## Limitaciones y advertencias

- Al ser una poda training-free, es esperable una perdida de calidad respecto al modelo base de 33,12B; no se han publicado metricas que cuantifiquen esa degradacion.
- El repositorio contiene solo el transformer: es imprescindible descargar el checkpoint oficial de MiniMax H3 para obtener el codificador de texto, los VAE y los procesadores, lo que anade dependencias y espacio en disco.
- Licencia restrictiva: la MiniMax H3 Community License Agreement incluye un ambito territorial y una politica de uso aceptable; el uso comercial esta condicionado a esos terminos.
- Riesgo de alucinacion visual y sonora inherente a los modelos generativos de difusion; no se documentan evaluaciones de fidelidad.
- Idiomas soportados no documentados; el rendimiento multilingue en los prompts no esta verificado.
- Sin descargas ni validacion comunitaria en el momento de la consulta (0 descargas, 0 likes), por lo que no hay evidencia externa de estabilidad en produccion.
- Proyecto independiente no afiliado a MiniMax; el soporte y el mantenimiento dependen del autor del repositorio.
- No se dispone de informacion sobre sesgos conocidos ni sobre el dataset de entrenamiento del modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/H3-Tiny/H3-Tiny-17B-Pruned
- Repositorio GitHub: https://github.com/fuyi25/H3-Tiny
- Pagina del proyecto: https://fuyi25.github.io/H3-Tiny/
- Checkpoints del proyecto: https://huggingface.co/H3-Tiny
- Licencia: https://huggingface.co/H3-Tiny/H3-Tiny-17B-Pruned/blob/main/LICENSE-MiniMax-H3
