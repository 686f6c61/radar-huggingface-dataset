# lethalbeats/embeddinggemma-2-0.8bpw-vision

## Resumen

EmbeddingGemma-2 0.8 BPW Vision es un derivado de runtime del modelo google/embeddinggemma-2, publicado por el usuario lethalbeats, que aplica el esquema de cuantizacion sub-1-bit LittleBit (Samsung Research) sobre la arquitectura multimodal de Google. El resultado es un modelo de embeddings de 440 millones de parametros totales (270M de backbone de texto mas 170M de encoder de vision) cuyos pesos quedan comprimidos a 0,8 bits por peso, reduciendo el consumo de RAM de aproximadamente 1.760 MB en la base BF16/FP32 a unos 429,5 MB, una reduccion del 75,6 % (unas 4,1 veces menos memoria).

El modelo resuelve tareas de recuperacion cross-modal texto-imagen-video, busqueda semantica visual y clasificacion zero-shot de imagenes en entornos con memoria muy limitada, incluyendo hardware de borde y servidores sin GPU. La descompresion se realiza al vuelo dentro de registros SIMD de CPU (AVX2), en fragmentos de 8/16 elementos por ciclo y con menos de 64 KB de cache de trabajo, lo que evita picos de RAM en memoria.

Es relevante ahora porque demuestra que la cuantizacion extrema por debajo de 1 bit puede aplicarse a encoders multimodales de produccion sin renunciar a las capacidades de la base: mantiene las tres modalidades (texto, imagen y video muestreado a 1 fps), la dimension de salida de 768 con soporte de Matryoshka Representation Learning (MRL) para truncar a 512 o 256 dimensiones, y una ventana de contexto de 8.192 tokens. Se distribuye bajo licencia Gemma y solo declara soporte para ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Gemma 2 (backbone de texto) + Vision Transformer estilo SigLIP |
| Parametros totales | 440M (270M backbone de texto + 170M encoder de vision) |
| Parametros activos | no aplica (arquitectura densa, no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | LittleBit 0.8 BPW (sub-1-bit), distribucion asimetrica 65 % primaria / 35 % secundaria; se distribuye ya cuantizado |
| Idiomas soportados | en (ingles) |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | no disponible (empaquetado en bitstream propietario del framework LittleBit; requiere el modulo `modeling_littlebit`) |

Otras especificaciones declaradas: dimension de salida de 768 (con truncado MRL a 512 y 256), funcion de similitud coseno (producto escalar sobre la esfera unitaria S^767), procesamiento de video a 1 fps mediante el encoder de vision y huella de pesos en RAM de aproximadamente 429,5 MB.

## Arquitectura y entrenamiento

La arquitectura sigue el diseno modular de EmbeddingGemma-2 de Google DeepMind: un backbone de texto basado en el transformer de Gemma 2 (270M de parametros) acoplado a un encoder de vision de 170M de parametros de estilo SigLIP, que gestiona de forma nativa tanto imagenes como video muestreado a 1 fotograma por segundo. La salida son embeddings de 768 dimensiones reutilizables en las tres modalidades, lo que permite calcular similitud coseno directa entre una consulta de texto y una imagen o un clip de video.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens utilizados ni sobre fases de RLHF o DPO para este artefacto. La innovacion tecnica no esta en el entrenamiento sino en la compresion: se emplea el marco LittleBit de Samsung Research (arXiv:2506.13771), que descompone los pesos en un factor latente con distribucion asimetrica 65/35 y los comprime a 0,8 bits por peso. Los pesos permanecen en RAM en formato de bitstream empaquetado y se descomprimen en el momento de la ejecucion dentro de registros SIMD de CPU (AVX2), sin generar picos de memoria. Este enfoque es especificamente ventajoso en inferencia sobre CPU y en dispositivos de borde con RAM escasa.

## Capacidades

- Generacion de embeddings de texto con ventana de hasta 8.192 tokens por secuencia.
- Generacion de embeddings de imagen a partir de rutas de fichero o de objetos `PIL.Image`.
- Generacion de embeddings de video mediante muestreo a 1 fps con el encoder de vision.
- Recuperacion cross-modal texto-imagen y texto-video por similitud coseno.
- Busqueda semantica visual (visual semantic search) y recuperacion de momentos concretos en video.
- Clasificacion zero-shot de imagenes.
- Soporte nativo de Matryoshka Representation Learning: los embeddings pueden truncarse a 512 o 256 dimensiones y renormalizarse en L2 para reducir el almacenamiento en bases de datos vectoriales.
- Integracion con la convencion de entrada por diccionario de SentenceTransformers.
- Capacidades multilingues: no disponibles; el modelo solo declara soporte para ingles.
- Tool calling, function calling y razonamiento multi-paso: no aplica, es un modelo de embeddings y no de generacion de texto.
- Modo thinking, audio y otras capacidades especiales: no disponibles.

## Casos de uso

- Busqueda visual semantica en catalogos de producto: se indexan las imagenes de cada articulo como embeddings de 768 dimensiones (o 256 tras truncado MRL) y se recuperan por consulta en lenguaje natural sin necesidad de etiquetas ni metadatos manuales.
- Recuperacion de momentos en video: el encoder muestrea a 1 fps y permite generar embeddings por fotograma o por clip para localizar el instante exacto en que aparece un objeto o accion descritos en texto, util en archivos audiovisuales y sistemas de edicion.
- RAG multimodal en infraestructura sin GPU: con unos 429,5 MB de pesos y descompresion en registros SIMD de CPU, se puede desplegar recuperacion texto-imagen en servidores de CPU o en hardware de borde donde no cabe la base de 1.760 MB.
- Clasificacion zero-shot de imagenes: comparar el embedding de una imagen contra embeddings de texto de las etiquetas candidatas permite construir clasificadores sin reentrenamiento, por ejemplo para triaje de imagenes medicas o moderacion de contenido.
- Deduplicacion y clustering de imagenes y videos: agrupar elementos visualmente similares en grandes colecciones usando similitud coseno, con el truncado MRL a 256 dimensiones para mantener el indice vectorial en un tamano manejable.
- Busqueda semantica sobre documentacion tecnica con imagenes: el contexto de 8.192 tokens permite indexar fragmentos largos de texto que incluyan referencias a diagramas o capturas, y recuperarlos junto a su evidencia visual.
- Organizacion automatica de fototecas y archivos personales en dispositivos de bajos recursos: indexacion local por texto sobre imagenes y videos sin enviar datos a la nube.
- Sistemas de recomendacion basados en contenido visual: combinar el embedding del articulo con el de la consulta del usuario para puntuar la relevancia sin depender de senales de interaccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K, MTEB ni de tareas de recuperacion cross-modal (como Recall@K o MRR), ni comparaciones numericas con la base sin cuantizar mas alla de la huella de memoria.

## Requisitos de hardware

- Huella de pesos en RAM: aproximadamente 429,5 MB para este modelo, frente a unos 1.760 MB de la base en BF16/FP32 (reduccion del 75,6 %, unas 4,1 veces menos).
- VRAM estimada para inferencia: no disponible de forma explicita; partiendo del footprint declarado de aproximadamente 0,43 GB, cabria en cualquier GPU con 1 GB o mas de memoria libre, si bien no se confirma compatibilidad con backends de GPU.
- La ejecucion descrita por el autor esta orientada a CPU: la descompresion ocurre en registros SIMD (`ymm0`, `ymm1` en AVX2) en bloques de 8/16 elementos por ciclo, con menos de 64 KB de overhead de cache de trabajo.
- GPU recomendadas: no disponibles. El autor no documenta soporte para CUDA ni para aceleradores especificos.
- Compatibilidad con GPU de consumo (RTX 4090, etc.): no disponible; si el runtime funciona sobre GPU, el tamano de pesos reducido lo haria viable en practicamente cualquier tarjeta moderna.
- Opciones de despliegue: el modelo requiere el modulo propio `modeling_littlebit` (clase `EmbeddingGemma2VisionLittleBit`) y la libreria sentence-transformers. No se confirma compatibilidad con vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Modalidades | Contexto | Huella de pesos | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| lethalbeats/embeddinggemma-2-0.8bpw-vision | 440M | Texto, imagen, video | 8.192 tokens | ~429,5 MB en RAM | Gemma | HuggingFace (autor comunitario) |
| google/embeddinggemma-2 (base) | 440M | Texto, imagen, video | 8.192 tokens | ~1.760 MB (BF16/FP32) | Gemma | HuggingFace (distribucion oficial) |
| Otros modelos de embeddings texto-imagen (CLIP, SigLIP y variantes) | no disponible | Imagen y texto | no disponible | no disponible | no disponible | no disponible |

La unica comparacion cuantificable con los datos aportados es frente a la base de Google, que comparte arquitectura y parametros pero ocupa aproximadamente 4,1 veces mas memoria. No se dispone de datos de rendimiento de recuperacion que permitan evaluar la perdida de calidad introducida por la cuantizacion a 0,8 BPW. No se han encontrado otros modelos comparables con especificaciones verificables en la informacion disponible.

## Limitaciones y advertencias

- Solo declara soporte para ingles (`en`); no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Es un artefacto cuantizado a 0,8 BPW: la compresion sub-1-bit puede degradar la calidad de los embeddings respecto a la base, pero no se han publicado mediciones de dicha degradacion.
- No se han publicado benchmarks de recuperacion, clasificacion ni similitud, por lo que no es posible estimar el impacto real de la cuantizacion antes de desplegarlo.
- El repositorio figura con 0 descargas, 0 likes y un tamano de 0,0 GB, lo que sugiere que los pesos podrian no estar efectivamente publicados; conviene verificar la disponibilidad de los ficheros antes de integrarlo.
- Es un artefacto de runtime aportado por la comunidad y no una distribucion oficial de Google; queda sujeto a los Gemma Terms of Use.
- La licencia Gemma impone condiciones de uso, obligaciones de atribucion y restricciones de uso comercial que deben revisarse antes de cualquier despliegue en produccion.
- Requiere un modulo de modelado propio (`modeling_littlebit`) y no hay evidencia de compatibilidad con los servidores de inferencia habituales, lo que limita su integracion en pilas estandar.
- Riesgo de alucinacion: al tratarse de un modelo de embeddings y no de generacion, el riesgo se manifiesta como falsos positivos de similitud o recuperaciones irrelevantes, no como texto inventado.
- Al ser un encoder multimodal, puede heredar sesgos presentes en los datos de entrenamiento de la base, especialmente en la asociacion entre personas y atributos en tareas de recuperacion o clasificacion.
- El muestreo de video a 1 fps puede perder acciones breves o eventos que ocurran entre fotogramas.
- No se documentan latencia, throughput, consumo energetico ni limites de concurrencia, datos criticos para dimensionar un despliegue en produccion.
- La busqueda web realizada no arrojo ningun resultado relevante sobre este modelo (los resultados devueltos eran contenido no relacionado), por lo que no existe corroboracion externa de sus cifras.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lethalbeats/embeddinggemma-2-0.8bpw-vision
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Perfil del autor: https://huggingface.co/lethalbeats
- Paper de LittleBit (Samsung Research): https://arxiv.org/abs/2506.13771
- Version HTML completa del paper (v5): https://arxiv.org/html/2506.13771v5
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms

No se han encontrado otros enlaces relevantes en la busqueda web.
