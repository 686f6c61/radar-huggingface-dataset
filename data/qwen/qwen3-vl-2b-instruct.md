# Qwen/Qwen3-VL-2B-Instruct

## Resumen

Qwen3-VL-2B-Instruct es un modelo multimodal de tipo image-text-to-text desarrollado por el equipo Qwen (Alibaba), publicado el 19 de octubre de 2025 bajo licencia Apache-2.0. Se trata de la variante densa más pequena de la generacion Qwen3-VL, con 2.127.532.032 parametros (~2,13 mil millones) y un repo de 4,3 GB en safetensors, pensada para despliegue en el borde (edge) y en GPUs de consumo. La familia completa incluye arquitecturas densas y MoE, ademas de ediciones Instruct y Thinking (razonamiento), pero esta ficha corresponde unicamente a la edicion Instruct de 2B.

El modelo resuelve el problema de combinar comprension de texto, vision e interaccion con agentes en un unico modelo de poco peso. Frente a Qwen2.5-VL, la model card destaca mejoras en agencia visual (operar interfaces de PC y movil), generacion de codigo a partir de imagenes (Draw.io, HTML, CSS, JS), percepcion espacial 2D y 3D, comprension de video con indexacion temporal a nivel de segundo, OCR en 32 idiomas (frente a 19 en la generacion anterior) y un contexto nativo de 256K tokens ampliable a 1M.

Su relevancia actual es doble: por un lado, acerca capacidades multimodales de nivel agentico a hardware modesto; por otro, mantiene el rendimiento en texto puro a la altura de los LLM de su tamano, lo que permite unificar pipelines de texto y vision sin recurrir a dos modelos separados. Con casi 2,5 millones de descargas y 494 "likes" en HuggingFace a fecha de la informacion disponible, es una de las referencias mas descargadas de su categoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal denso (encoder de vision + decoder de lenguaje) con Interleaved-MRoPE, DeepStack y alineacion texto-marca temporal |
| Parametros totales | 2.127.532.032 (~2,13 mil millones), segun safetensors |
| Parametros activos | no aplica (arquitectura densa, no MoE) |
| Longitud de contexto | 256K tokens nativa, ampliable a 1M (segun model card) |
| Tipos de cuantizacion | no disponible (no se listan cuantizaciones oficiales; pesos publicados en safetensors) |
| Idiomas soportados | no disponible; la model card indica OCR en 32 idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 4,3 GB) |
| Pipeline | image-text-to-text |
| Libreria | transformers (clase `Qwen3VLForConditionalGeneration`) |
| Fecha de publicacion | 2025-10-19 (ultima actualizacion: 2025-10-23) |
| Descargas / likes | 2.487.824 / 494 |

## Arquitectura y entrenamiento

La model card describe tres actualizaciones arquitectonicas concretas respecto a generaciones previas. La primera es Interleaved-MRoPE, una asignacion de frecuencias completa sobre los ejes de tiempo, anchura y altura mediante embeddings posicionales robustos, orientada a mejorar el razonamiento sobre video de horizonte largo. La segunda es DeepStack, que fusiona caracteristicas de multiples niveles del ViT para capturar detalles finos y afinar la alineacion imagen-texto. La tercera es la alineacion texto-marca temporal, que sustituye a T-RoPE y busca una localizacion de eventos anclada con precision en el tiempo para el modelado temporal de video.

El modelo se presenta como parte de una familia que escala de edge a cloud en variantes densas y MoE, con ediciones Instruct y Thinking. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Si se documenta que la generacion Qwen3-VL incorpora un preentrenamiento visual mas amplio y de mayor calidad orientado a "reconocerlo todo" (personajes publicos, anime, productos, monumentos, flora y fauna). Las referencias tecnicas asociadas son el informe tecnico de Qwen3 (arXiv:2505.09388), Qwen2.5-VL (arXiv:2502.13923), Qwen2-VL (arXiv:2409.12191) y Qwen-VL (arXiv:2308.12966).

## Capacidades

- Generacion de texto y comprension de lenguaje a un nivel que la model card equipara al de los LLM puros del mismo tamano, con fusion texto-vision sin perdida.
- Comprension de imagenes: descripcion, reconocimiento amplio de entidades (personajes publicos, anime, productos, monumentos, flora y fauna) y analisis de detalles finos.
- Razonamiento multimodal en STEM y matematicas, con analisis causal y respuestas basadas en evidencia.
- Vision por computador espacial: juicio de posiciones de objetos, puntos de vista y oclusiones, con grounding 2D reforzado y grounding 3D para razonamiento espacial y robotica.
- Comprension de video de larga duracion con recuperacion completa e indexacion a nivel de segundo, apoyada en el contexto de 256K tokens ampliable a 1M.
- Agente visual: reconoce elementos de interfaces de PC y movil, entiende su funcion, invoca herramientas y completa tareas.
- Codigo visual: genera Draw.io, HTML, CSS y JavaScript a partir de imagenes o videos.
- OCR ampliado a 32 idiomas, robusto en condiciones de poca luz, desenfoque e inclinacion, con mejor manejo de caracteres raros o antiguos, jerga y analisis de estructura de documentos largos.
- Soporte de tool calling / function calling: los tags del repositorio incluyen `endpoints_compatible` y despliegue en Azure, lo que indica compatibilidad con endpoints de inferencia tipo servidor.
- Capacidades de agente y razonamiento multi-paso derivadas del bloque "Visual Agent" descrito en la model card.
- Edicion Instruct (esta ficha); la familia dispone ademas de ediciones Thinking con razonamiento reforzado, no incluidas en este repositorio.

## Casos de uso

- Agentes de interfaz grafica (GUI agents): el modelo puede actuar sobre pantallas de escritorio o movil reconociendo elementos, infiriendo su funcion y ejecutando acciones encadenadas. Es adecuado porque el bloque Visual Agent esta disenado explicitamente para ese flujo y el modelo cabe en GPUs de consumo para automatizacion de escritorio a gran escala.
- Digitalizacion de documentos con OCR multilingue: extraccion de texto y estructura en facturas, formularios y contratos escaneados en cualquiera de los 32 idiomas de OCR soportados, incluyendo documentos degradados o torcidos. La capacidad de parseo de estructura de documentos largos reduce el postprocesado manual.
- Generacion de interfaces a partir de bocetos o capturas: convertir una imagen o video de una UI en codigo Draw.io, HTML, CSS o JS, util para equipos de front-end que parten de mockups en papel o de la captura de una aplicacion existente.
- Analisis de video de larga duracion: revision de grabaciones de horas con indexacion temporal a nivel de segundo (por ejemplo, busqueda de eventos concretos en video de vigilancia o de clases grabadas), gracias al contexto nativo de 256K tokens.
- Robotica y agentes embodied: el grounding 3D y la percepcion de oclusiones y puntos de vista permiten localizar objetos en el espacio tridimensional para planificacion de manipulacion o navegacion.
- Asistencia educativa en STEM: resolucion de problemas de matematicas y fisica a partir de fotografias de pizarras, apuntes o graficos, con explicaciones paso a paso basadas en evidencia visual.
- Atencion al cliente con captura de pantalla: el usuario adjunta una captura de un error o de una pantalla de producto y el modelo diagnostica el problema, con soporte para conversaciones multi-turno y tool calling hacia sistemas internos.
- Despliegue en el borde: al ser un modelo denso de 2,13B, puede ejecutarse en dispositivos con pocos recursos (portatiles con GPU discreta, estaciones compactas) para tareas de clasificacion visual, moderacion o descripcion automatica de imagenes en local, sin enviar datos a la nube.
- Accesibilidad: generacion de descripciones de imagenes y videos para personas con discapacidad visual, con capacidad de describir relaciones espaciales entre objetos y no solo contenido global.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card referencia dos figuras comparativas (rendimiento multimodal y rendimiento en texto puro, comparando las variantes 2B y 32B de la edicion Instruct), pero los valores numericos no estan disponibles en el texto extraido. No se incluyen cifras de MMLU, HumanEval, GSM8K, MMMU ni similares.

Los unicos parametros de generacion documentados por el autor son:

| Modo | top_p | top_k | temperature | repetition_penalty | presence_penalty | Salida maxima |
|---|---|---|---|---|---|---|
| Vision-lenguaje (VL) | 0,8 | 20 | 0,7 | 1,0 | 1,5 | 16.384 tokens |
| Texto | 1,0 | 40 | 1,0 | 1,0 | 2,0 | 32.768 tokens |

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 4,3 GB en bfloat16 o float16, unos 2,2 GB en cuantizacion de 8 bits y en torno a 1,1-1,3 GB en 4 bits (estimaciones calculadas a partir de los 2.127.532.032 parametros; no confirmadas por el autor).
- La VRAM total necesaria es superior a la de los pesos, porque hay que sumar la cache KV y el coste del encoder de vision, que crece con el numero de imagenes o frames y con la longitud de contexto. Con 256K tokens de contexto la cache KV puede dominar el consumo de memoria; la model card recomienda `flash_attention_2` precisamente para acelerar y ahorrar memoria en escenarios multi-imagen y video.
- Cabe en GPU de consumo: si, con margen amplio. Una RTX 3060 de 12 GB, una RTX 4060 Ti de 16 GB o una RTX 4090 de 24 GB pueden alojar el modelo en bfloat16 con contexto moderado. En GPUs de 8 GB es viable en precision reducida o con contexto corto.
- GPU de datacenter recomendadas: A100, H100 o L40S para servir muchas peticiones concurrentes o contextos muy largos, aunque por tamano el modelo esta mas pensado para edge que para cluster.
- Opciones de despliegue: `transformers` (requiere compilar desde el repositorio de GitHub en el momento de la publicacion, o la version 4.57.0 cuando este disponible) mediante `Qwen3VLForConditionalGeneration` y `AutoProcessor`; el tag `endpoints_compatible` y `deploy:azure` indican compatibilidad con endpoints de inferencia tipo servidor (vLLM / TGI no confirmados de forma explicita en la informacion disponible). No se confirma soporte oficial de GGUF, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.
- Nota practica de la model card: instalar con `pip install git+https://github.com/huggingface/transformers`, ya que la version estable 4.57.0 aun no estaba publicada en el momento de la subida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3-VL-2B-Instruct | 2,13B (denso) | 256K nativo, hasta 1M | Apache-2.0 | HuggingFace, transformers |
| Qwen3-VL-2B-Thinking | no disponible | no disponible | Apache-2.0 | edicion de razonamiento de la misma familia, mencionada en la model card |
| Qwen3-VL-32B-Instruct | 32B (referencia de la model card) | no disponible | no disponible en la informacion proporcionada | mencionado en las figuras comparativas del autor |
| Qwen2.5-VL-3B-Instruct | ~3,75B | no disponible en la informacion proporcionada | Apache-2.0 | generacion anterior de la familia, citada en el informe tecnico arXiv:2502.13923 |

No se dispone de datos de rendimiento comparativos entre estos modelos en la informacion proporcionada, por lo que no se incluyen cifras de benchmarks. Las alternativas de otros fabricantes en el rango de 2B a 4B multimodales no se han verificado en esta busqueda y se marcan como no disponibles.

## Limitaciones y advertencias

- No se han publicado cifras de benchmarks en la informacion disponible, por lo que no es posible verificar de forma independiente el rendimiento real del modelo en tareas concretas.
- Riesgo de alucinacion inherente a los modelos generativos, especialmente en descripcion de imagenes ambiguas, lectura de texto degradado y reconocimiento de entidades poco frecuentes.
- La model card no detalla la composicion del dataset de entrenamiento, por lo que no se puede evaluar el origen de sesgos potenciales en reconocimiento de personas, culturas o regiones.
- La funcion de "reconocerlo todo" (personajes publicos, productos, monumentos) implica riesgos de privacidad y de propiedad intelectual si se usa para identificar personas o marcas en produccion.
- La lista completa de idiomas soportados no esta disponible; solo se confirma que el OCR cubre 32 idiomas, sin enumerarlos.
- El contexto de 256K tokens ampliable a 1M es exigente en memoria: procesar libros completos o video de horas puede requerir hardware muy superior al necesario para los pesos del modelo.
- El procesamiento de video con indexacion a nivel de segundo implica un coste computacional elevado por el numero de frames procesados por el encoder de vision.
- Restricciones de licencia: Apache-2.0 permite uso comercial, modificacion y redistribucion con atribucion y sin garantias; no se han detectado clausulas adicionales en la informacion disponible, aunque conviene revisar el fichero LICENSE del repositorio antes de un despliegue en produccion.
- `presence_penalty` de 1,5 (VL) y 2,0 (texto) junto con temperature 0,7 y 1,0 en los valores recomendados pueden producir variabilidad en las respuestas; para produccion determinista se recomienda decodificacion greedy.
- Esta ficha corresponde solo a la edicion Instruct de 2B; el comportamiento de las ediciones Thinking o de las variantes MoE no esta cubierto aqui.
- No se confirman pesos cuantizados oficiales (GGUF, AWQ, GPTQ) ni integracion con llama.cpp u Ollama, lo que puede limitar despliegues fuera del ecosistema transformers/vLLM.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Demo (Space): https://huggingface.co/spaces/akhaliq/Qwen3-VL-2B-Instruct
- Organizacion Qwen en HuggingFace: https://huggingface.co/Qwen
- Informe tecnico de Qwen3 (arXiv:2505.09388): https://arxiv.org/abs/2505.09388
- Informe tecnico de Qwen2.5-VL (arXiv:2502.13923): https://arxiv.org/abs/2502.13923
- Qwen2-VL (arXiv:2409.12191): https://arxiv.org/abs/2409.12191
- Qwen-VL (arXiv:2308.12966): https://arxiv.org/abs/2308.12966
- Repositorio de transformers: https://github.com/huggingface/transformers
- Chat oficial de Qwen: https://chat.qwen.ai/
- Portal de Qwen: https://qwen.ai/home
- Imagen de arquitectura Qwen3-VL: https://qianwen-res.oss-accelerate.aliyuncs.com/Qwen3-VL/qwen3vl_arc.jpg
- Resultados multimodales (figura del autor): https://qianwen-res.oss-accelerate.aliyuncs.com/Qwen3-VL/qwen3vl_2b_32b_vl_instruct.jpg
- Resultados en texto puro (figura del autor): https://qianwen-res.oss-accelerate.aliyuncs.com/Qwen3-VL/qwen3vl_2b_32b_text_instruct.jpg
- Wikipedia sobre la familia Qwen: https://fr.wikipedia.org/wiki/Qwen
