# ArchiveStudio/Qwen3-VL-235B-A22B-Instruct

## Resumen

Qwen3-VL-235B-A22B-Instruct es un modelo multimodal de tipo image-text-to-text desarrollado por el equipo Qwen (Alibaba). Se trata de la variante de mayor tamaño de la familia Qwen3-VL, construida sobre una arquitectura Mixture of Experts (MoE) con 235.670.022.896 parámetros totales y 22.000 millones de parámetros activos por token (de ahí el sufijo A22B). El repositorio analizado, ArchiveStudio/Qwen3-VL-235B-A22B-Instruct, es una réplica no oficial del repositorio original Qwen/Qwen3-VL-235B-A22B-Instruct, publicado bajo licencia Apache 2.0.

El modelo resuelve tareas que combinan comprensión de texto e imagen: razonamiento visual, OCR multilingüe, grounding espacial 2D y 3D, comprensión de vídeo de larga duración y control de interfaces gráficas mediante agentes visuales. Su ventana de contexto nativa es de 256.000 tokens, ampliable hasta 1.000.000, lo que permite procesar libros completos o vídeos de varias horas con indexación temporal a nivel de segundo.

Es relevante ahora porque combina un rendimiento de texto equiparable al de los LLM puros de la serie Qwen3 con capacidades visuales avanzadas, y porque su diseño MoE desacopla el coste de cómputo (22B activos) del coste de memoria (235B totales), lo que lo sitúa como candidato para despliegues en clústeres multi-GPU con cargas de trabajo heterogéneas de visión y lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con Mixture of Experts (MoE) y codificador visual ViT; clase `Qwen3VLMoeForConditionalGeneration` |
| Parametros totales | 235.670.022.896 (235,67 B) |
| Parametros activos | 22 B (aproximado, segun la nomenclatura A22B del nombre del modelo) |
| Longitud de contexto | 256 K tokens nativos, ampliable a 1 M |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; el repositorio solo contiene pesos safetensors (probablemente bf16). No se listan variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible como listado general; la model card indica soporte de OCR en 32 idiomas (frente a 19 en la generacion anterior) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 471,3 GB |
| Libreria de inferencia | transformers (se recomienda instalar desde el repositorio Git; se menciona la version 4.57.0 como no publicada aun) |
| Pipeline | image-text-to-text |
| Modalidad de entrada | Imagen, video y texto |
| Edicion | Instruct (sin modo thinking) |

## Arquitectura y entrenamiento

La arquitectura combina un transformer MoE para el modelado de lenguaje con un codificador visual basado en Vision Transformer cuyas caracteristicas se inyectan en el modelo de lenguaje. Los pesos estan en safetensors y se cargan mediante la clase `Qwen3VLMoeForConditionalGeneration` de transformers, con soporte recomendado de FlashAttention 2 para escenarios con multiples imagenes y video. La model card documenta tres innovaciones tecnicas concretas: Interleaved-MRoPE, que asigna frecuencias completas sobre los ejes temporal, de anchura y de altura para mejorar el razonamiento sobre videos largos; DeepStack, que fusiona caracteristicas de multiples niveles del ViT para afinar el detalle fino y la alineacion imagen-texto; y Text-Timestamp Alignment, que sustituye el esquema T-RoPE por una localizacion de eventos anclada a marcas de tiempo precisas.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF, DPO u otras fases de alineacion posteriores al preentrenamiento. Tampoco se detalla el numero de expertos, la estrategia de enrutamiento ni el ratio de activacion mas alla del dato de 22B parametros activos. La model card unicamente menciona un preentrenamiento visual "mas amplio y de mayor calidad" que habilita el reconocimiento de celebridades, anime, productos, puntos de referencia y flora y fauna.

## Capacidades

- Generacion y comprension de texto con un rendimiento que la model card situa al mismo nivel que los LLM puros de la serie Qwen3.
- Comprension de imagen: descripcion, reconocimiento amplio de entidades (personas conocidas, anime, productos, monumentos, especies) y analisis de detalles finos.
- Razonamiento visual y multimodal orientado a STEM y matematicas, con analisis causal y respuestas basadas en evidencia.
- OCR ampliado a 32 idiomas, robusto en condiciones de poca luz, desenfoque e inclinacion, con manejo de caracteres raros o antiguos, jerga tecnica y analisis de la estructura de documentos largos.
- Percepcion espacial avanzada: posiciones relativas de objetos, puntos de vista, oclusiones y grounding 2D, con soporte de grounding 3D para razonamiento espacial y robotica (embodied AI).
- Comprension de video de larga duracion, con recuperacion completa de informacion e indexacion a nivel de segundo gracias a la alineacion texto-marca temporal.
- Agente visual: operacion de interfaces graficas de escritorio y moviles, reconocimiento de elementos, comprension de su funcion, invocacion de herramientas y ejecucion de tareas.
- Codigo visual: generacion de diagramas Draw.io y de codigo HTML, CSS y JavaScript a partir de imagenes o videos.
- Soporte de tool calling y function calling: la model card incluye la invocacion de herramientas como capacidad explicita del agente visual, aunque no se detalla el formato concreto del esquema de llamadas.
- Capacidades multilingues: no disponibles como listado general; el unico dato concreto es el soporte de OCR en 32 idiomas.

## Casos de uso

- Atencion al cliente multimodal: el modelo puede gestionar conversaciones multi-turno en las que el usuario adjunta capturas de pantalla o fotos de productos, combinando la comprension de la imagen con la ventana de 256 K tokens para mantener todo el historial de la sesion y documentacion adjunta sin truncar.
- Digitalizacion y extraccion de documentos: con OCR en 32 idiomas y analisis de estructura de documentos largos, resulta adecuado para convertir facturas, informes o archivos historicos escaneados en datos estructurados, incluso con escaneos borrosos o girados.
- Agente de automatizacion de interfaces (RPA visual): la capacidad de agente visual permite reconocer elementos de una GUI de escritorio o movil, entender su funcion e invocar las acciones correspondientes, sustituyendo scripts de coordenadas fijas por control semantico de la interfaz.
- Analisis de video para monitorizacion y cumplimiento: la indexacion temporal a nivel de segundo y el contexto ampliable a 1 M tokens permiten procesar grabaciones de varias horas y localizar eventos concretos con su marca de tiempo, util en auditoria, seguridad o analisis de contenido.
- Generacion de prototipos de interfaz a partir de disenos: la generacion de HTML, CSS y JavaScript desde imagenes o videos permite convertir mockups o grabaciones de producto en codigo front-end funcional dentro de un pipeline de desarrollo.
- Robotica y razonamiento espacial: el grounding 3D y la percepcion de oclusiones y puntos de vista habilitan tareas de manipulacion y navegacion asistida por lenguaje, donde el modelo interpreta la escena y propone acciones.
- Asistencia educativa en materias STEM: el razonamiento multimodal sobre diagramas, graficos y ecuaciones permite resolver problemas de matematicas y ciencias explicando el procedimiento paso a paso a partir de la imagen del enunciado.
- Moderacion de contenido audiovisual: el reconocimiento amplio de entidades y el analisis de video permiten clasificar y etiquetar grandes volumenes de contenido, generando descripciones y metadatos de forma automatica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card incluye dos imagenes con tablas comparativas (rendimiento multimodal y rendimiento en texto puro), pero su contenido no es legible en el material proporcionado, por lo que no se reproducen cifras. No se dispone de datos de MMLU, HumanEval, GSM8K, MMMU ni de ninguna otra métrica verificable para este modelo en la informacion consultada.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 471,3 GB en el repositorio, lo que corresponde a precision bf16. En bf16 se necesitan del orden de 500 GB de VRAM contando el cache KV. En FP8 o INT8 la estimacion baja a unos 236 GB, y en INT4 a unos 118 GB. Estas cifras son calculos derivados del tamano del repositorio, no datos publicados por el autor.
- GPU recomendadas: para bf16, 8x H100 80 GB o 8x A100 80 GB (640 GB agregados). Para FP8, 4x H100 80 GB o 3x H200 141 GB. Para INT4, 2x H100 80 GB o 1x H200 141 GB con margen ajustado.
- Cabe en GPU de consumo: no. El modelo no cabe en una RTX 4090 (24 GB) ni en ninguna GPU de consumo actual, ni siquiera en cuantizacion de 4 bits, porque el minimo estimado ronda los 118 GB de pesos.
- Opciones de despliegue: la model card confirma el uso con transformers (con `device_map="auto"` y FlashAttention 2 recomendado). No se confirman en la informacion disponible otras rutas como vLLM, SGLang, TGI, llama.cpp u Ollama, y no se listan variantes GGUF en el repositorio.
- Latencia y throughput: no disponibles. Como referencia estructural, al ser MoE con 22B parametros activos, el coste de computo por token es comparable al de un modelo denso de ese tamano, mientras que el coste de memoria corresponde a 235B parametros.

## Comparativa con modelos similares

Los datos de los modelos comparados no provienen de la informacion proporcionada en esta busqueda y deben verificarse en sus fichas oficiales.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3-VL-235B-A22B-Instruct | 235 B totales / 22 B activos | 256 K, ampliable a 1 M | Apache 2.0 | MoE multimodal con agente visual, grounding 3D y OCR en 32 idiomas |
| Qwen2.5-VL-72B-Instruct | 72 B densos | 128 K (segun su model card) | Apache 2.0 | Generacion anterior de la misma familia, sin las mejoras Interleaved-MRoPE ni DeepStack |
| Llama 4 Maverick | 400 B totales / 17 B activos | 1 M (hasta 10 M en investigacion) | Llama 4 Community License | MoE multimodal, licencia con restricciones de uso comercial |
| InternVL3-78B | 78 B densos | No disponible en esta busqueda | Apache 2.0 (segun su repositorio) | Alternativa multimodal de escala intermedia |

Frente a estas opciones, la ventaja de Qwen3-VL-235B-A22B-Instruct es la combinacion de licencia Apache 2.0 sin restricciones de uso comercial, contexto nativo de 256 K y capacidades de agente visual y grounding 3D; su desventaja principal es el requisito de memoria, muy superior al de las alternativas densas de 72-78B.

## Limitaciones y advertencias

- Riesgo de alucinacion: no se han publicado tasas de alucinacion ni evaluaciones de fidelidad factual en la informacion disponible. Al ser un modelo multimodal, el riesgo se extiende a la descripcion de imagenes y a la lectura de documentos, donde puede generar texto o cifras inexistentes en la fuente.
- Sesgos conocidos: no se documentan en la model card analisis de sesgos, composicion del dataset de entrenamiento ni evaluaciones de equidad. El reconocimiento ampliado de celebridades y entidades introduce riesgo de sesgo en la identificacion de personas.
- Limitaciones de contexto: aunque el contexto nativo es de 256 K tokens ampliable a 1 M, la model card no detalla el degradado de rendimiento a longitudes extremas, ni los requisitos de memoria del cache KV en esos regimenes.
- Limitaciones de idioma: no se dispone de un listado oficial de idiomas soportados; el unico dato concreto es el OCR en 32 idiomas. No puede asumirse un rendimiento uniforme fuera del ingles y el chino sin evaluacion previa.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion sin restricciones de campo de uso, siempre que se conserven los avisos de copyright y licencia.
- Repositorio no oficial: el repositorio analizado (ArchiveStudio/Qwen3-VL-235B-A22B-Instruct) tiene 0 descargas y 0 likes y fue creado el 20 de septiembre de 2026. Se trata de una replicacion del repositorio oficial de Qwen. En entornos de produccion debe verificarse la integridad de los pesos y preferirse el repositorio oficial del autor para descartar modificaciones maliciosas.
- Requisitos de infraestructura: el despliegue en bf16 exige un clúster multi-GPU de gama alta (del orden de 8 aceleradores de 80 GB), lo que descarta el uso en hardware de consumo y encarece la experimentacion.
- Version de transformers: la model card indica que el soporte esta en la ultima version de transformers publicada en Git y menciona que la 4.57.0 no estaba publicada en el momento de redactar la ficha, lo que puede provocar incompatibilidades en entornos con versiones fijadas.

## Enlaces

- Repositorio analizado: https://huggingface.co/ArchiveStudio/Qwen3-VL-235B-A22B-Instruct
- Repositorio oficial de referencia: https://huggingface.co/Qwen/Qwen3-VL-235B-A22B-Instruct
- Demo de chat: https://chat.qwenlm.ai/
- Qwen3 Technical Report (arXiv:2505.09388): https://arxiv.org/abs/2505.09388
- Qwen2.5-VL Technical Report (arXiv:2502.13923): https://arxiv.org/abs/2502.13923
- Qwen2-VL (arXiv:2409.12191): https://arxiv.org/abs/2409.12191
- Qwen-VL (arXiv:2308.12966): https://arxiv.org/abs/2308.12966
- Diagrama de arquitectura: https://qianwen-res.oss-accelerate.aliyuncs.com/Qwen3-VL/qwen3vl_arc.jpg
- Tabla de rendimiento multimodal: https://qianwen-res.oss-accelerate.aliyuncs.com/Qwen3-VL/table_nothinking_vl.jpg
- Tabla de rendimiento en texto: https://qianwen-res.oss-accelerate.aliyuncs.com/Qwen3-VL/table_nothinking_text.jpg
- Repositorio de transformers: https://github.com/huggingface/transformers
- Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos resultados obtenidos fueron paginas en aleman sobre Windows 11, sin relacion con el contenido de esta ficha.
