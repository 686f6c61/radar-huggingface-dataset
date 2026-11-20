# H3-Tiny/H3-Tiny-17B-Pruned-Ref2VA

## Resumen

H3-Tiny-17B-Pruned-Ref2VA es un checkpoint derivado de MiniMax H3 Ref2VA, un transformer de generacion conjunta de video y audio a partir de texto e imagenes de referencia. Lo publica el proyecto independiente H3-Tiny, que aplica poda estructurada sobre el modelo original de 33.120 millones de parametros para reducirlo a 17.067 millones, eliminando 8 de sus 50 bloques de transformer y fijando el rango de AdaLN en 8. El resultado es un modelo de 17B que conserva el flujo de trabajo Ref2VA (reference images to video + audio) sin ningun reentrenamiento posterior a la poda.

La relevancia de este checkpoint es practica: reduce a la mitad el coste de inferencia y el espacio en disco respecto al modelo base, manteniendo el pipeline completo de difusion para video y audio. El repositorio contiene unicamente el transformer en formato diffusers; el text encoder, los VAE y los procesadores se toman del checkpoint oficial de MiniMax H3. La generacion se realiza con 50 pasos de muestreo.

El modelo se distribuye bajo la MiniMax H3 Community License Agreement, con restricciones territoriales y de uso aceptable, y no esta afiliado ni respaldado por MiniMax. Es un checkpoint de investigacion orientado a experimentacion con poda de modelos generativos multimodales, no un modelo afinado para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (MiniMax H3 Ref2VA), poda estructurada con AdaLN de rango 8 y 8 de 50 bloques eliminados |
| Parametros totales | 17.067.115.600 (17,07B, solo transformer) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MiniMax H3 Community License Agreement (license: other) |
| Formato de pesos | safetensors (layout diffusers: `config.json` + safetensors fragmentados) |
| Tamano del repositorio | 34,2 GB |
| Pasos de muestreo | 50 |
| Modalidades de salida | video + audio |

## Arquitectura y entrenamiento

El modelo base es el transformer de MiniMax H3 Ref2VA, con 33.120 millones de parametros y 50 bloques de transformer. H3-Tiny aplica una poda estructurada en dos frentes: reduce el rango de la capa AdaLN (modulacion por paso de difusion) a 8 y elimina 8 de los 50 bloques del transformer, lo que deja el modelo en 17,07B. Segun la model card, el checkpoint es training-free: no ha habido entrenamiento ni destilacion posterior a la poda, por lo que los pesos son directamente el resultado del recorte.

El pipeline es de difusion para generacion conjunta de video y audio condicionada por texto e imagenes de referencia (flujo Ref2VA). El repositorio contiene solo el transformer; el text encoder, los VAE y los procesadores se cargan desde el checkpoint oficial de MiniMax H3 en formato diffusers. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si el modelo base uso RLHF o DPO.

## Capacidades

- Generacion de video a partir de texto con imagenes de referencia (`<Picture 1>` en el prompt), con resolucion y duracion configurables via `--num-frames` (124 frames en el ejemplo de la model card).
- Generacion conjunta de audio y video en una sola pasada del pipeline de difusion.
- Condicionamiento por multiples imagenes de referencia para guiar identidad, estilo o composicion del video generado.
- Flujo reference-to-video (Ref2VA) sobre el que se construye el checkpoint.
- Integracion con la libreria diffusers y con el paquete `h3tiny` del proyecto (carga via `load_pipeline`).
- No se documentan en la informacion disponible capacidades de tool calling, agentes, razonamiento multi-paso ni thinking mode.

## Casos de uso

- Prototipado de generacion video+audio con referencias visuales: el modelo permite generar clips con audio sincronizado a partir de una o varias imagenes de referencia, usando 50 pasos de muestreo, lo que facilita iterar sobre prompts e imagenes sin el coste del modelo de 33B.
- Investigacion en poda de modelos generativos: al ser un checkpoint training-free derivado de un modelo de 33B, sirve como caso de estudio para medir la degradacion de calidad al eliminar bloques y reducir el rango de AdaLN en un transformer de difusion multimodal.
- Desarrollo de pipelines de video generativo en entornos con VRAM limitada: el recorte a 17B reduce el peso del transformer respecto al original, lo que hace viable el despliegue en GPUs de gama alta de consumo con las tecnicas de offloading que documenta el repositorio.
- Generacion de contenido audiovisual para previsualizacion: creacion de clips de referencia para storyboards o animaticos a partir de imagenes clave, con audio generado en la misma pasada.
- Evaluacion comparativa de checkpoints podados: el proyecto publica la progresion 33B → 17B → 14B, lo que permite al investigador comparar calidad y coste entre etapas con el mismo pipeline de inferencia.
- Integracion en herramientas de creacion con diffusers: al seguir el layout diffusers (`config.json` + safetensors fragmentados), el transformer puede cargarse en flujos de trabajo existentes basados en esa libreria, combinado con el text encoder y los VAE del checkpoint oficial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio ocupa 34,2 GB en safetensors y el transformer tiene 17,07B parametros, por lo que en precision completa (fp16/bf16) el peso ronda los 34 GB solo para el transformer, a lo que hay que sumar text encoder y VAE del checkpoint base.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, el modelo completo en bf16 no cabe en GPUs de consumo de 24 GB sin offloading; requiere GPUs de datacenter (A100 80 GB, H100) o estrategias de offloading a CPU.
- Cabe en consumer GPU: solo con offloading o cuantizacion, que la model card no detalla; el repositorio menciona opciones de offloading en el README de GitHub pero no se especifican cifras.
- Opciones de despliegue: paquete `h3tiny` del proyecto (carga via `load_pipeline`), script `scripts/infer.py`, libreria diffusers. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de difusion de video).
- Latencia y throughput: no disponibles. La model card solo indica 50 pasos de muestreo.

## Comparativa con modelos similares

| Modelo | Parametros | Modalidad | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| H3-Tiny-17B-Pruned-Ref2VA | 17,07B (transformer) | Video + audio (Ref2VA) | no disponible | MiniMax H3 Community License | Poda training-free de MiniMax H3 Ref2VA |
| MiniMax H3 Ref2VA (base) | 33,12B (transformer) | Video + audio (Ref2VA) | no disponible | MiniMax H3 Community License | Modelo original, 50 bloques, sin poda |
| H3-Tiny-14B (etapa final) | no disponible | Video + audio (Ref2VA) | no disponible | MiniMax H3 Community License | Segunda etapa de poda del proyecto, segun la model card |

No se dispone de datos de benchmarks ni de modelos comparables de otros autores en la informacion proporcionada.

## Limitaciones y advertencias

- El checkpoint es el resultado de una poda sin reentrenamiento; es esperable cierta perdida de calidad respecto al modelo base de 33B, aunque no se cuantifica en la informacion disponible.
- Licencia MiniMax H3 Community License Agreement: incluye ambito territorial y politica de uso aceptable; es imprescindible revisar el texto completo antes de cualquier uso comercial.
- El repositorio contiene solo el transformer; es obligatorio descargar el checkpoint oficial de MiniMax H3 en formato diffusers para el text encoder, los VAE y los procesadores.
- No se documentan idiomas soportados, sesgos conocidos ni tasas de alucinacion en la informacion disponible.
- No hay datos publicados de benchmarks, VRAM medida, latencia ni throughput; cualquier estimacion de rendimiento es provisional.
- Proyecto independiente no afiliado ni respaldado por MiniMax; la mantenibilidad y el soporte dependen del proyecto H3-Tiny.
- Uso orientado a investigacion y experimentacion; no hay evidencia de validacion para produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/H3-Tiny/H3-Tiny-17B-Pruned-Ref2VA
- Repositorio de codigo: https://github.com/fuyi25/H3-Tiny
- Pagina del proyecto: https://fuyi25.github.io/H3-Tiny/
- Todos los checkpoints del proyecto: https://huggingface.co/H3-Tiny
- Licencia: https://huggingface.co/H3-Tiny/H3-Tiny-17B-Pruned-Ref2VA/blob/main/LICENSE-MiniMax-H3
