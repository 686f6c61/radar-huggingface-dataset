# 1of2/bidirlm-omni-2.5b-coreml-w8-ane

## Resumen

BidirLM Omni 2.5B Core ML W8A16 Neural Engine es una distribucion compilada para Core ML del modelo de embeddings multimodales BidirLM/BidirLM-Omni-2.5B-Embedding, publicada por el usuario 1of2. No se trata de un modelo nuevo: es un empaquetado de inferencia que permite ejecutar el encoder sobre el Neural Engine de los Mac con Apple Silicon, sin GPU dedicada ni CUDA. Concretamente, incluye 97 funciones escalonadas repartidas en tres programas (`BidirLMOmniLanguage`, `BidirLMOmniVision` y `BidirLMOmniAudio`) que cubren texto, imagen fija, audio y mensajes mixtos.

El modelo produce un unico tipo de vector, independientemente de la modalidad: 2048 dimensiones, normalizado en L2, obtenido mediante masked mean pooling sobre todos los tokens del mensaje (incluidos los del chat template). No existen prompts de consulta ni de documento, de modo que consultas y documentos se codifican de forma identica. Cada mensaje admite hasta 8192 tokens, contando el chat template y los marcadores de medios expandidos; superar ese limite devuelve un error y nunca produce truncado.

La relevancia de esta publicacion es fundamentalmente practica: los autores cuantizan los pesos de proyeccion a INT8 por canal con activaciones FP16 y dejan la tabla de embeddings en FP16, lo que reduce la huella a unos 2,8 GB y permite indexar y buscar sobre embeddings multimodales directamente en el hardware de un portatil o sobremesa Apple. Es la variante solo para Neural Engine de una familia de cuatro releases que comparten el mismo espacio vectorial (`w8a16:ane-8k-v1`), de modo que un mismo indice puede mezclar vectores de cualquiera de ellas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bidireccional (encoder) multimodal con torres de lenguaje, vision y audio; publicado como programas Core ML multifuncion |
| Parametros totales | 2,5 mil millones (segun la denominacion del modelo base) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 8192 tokens por mensaje, incluyendo chat template y marcadores de medios expandidos |
| Tipos de cuantizacion | W8A16: pesos de proyeccion en INT8 por canal con activaciones FP16; tabla de embeddings de tokens en FP16. Espacio `w8a16:ane-8k-v1` |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML compilado (`.mlmodelc`), con `manifest.json`, `Resources/` y `checksums.files`; no se distribuyen safetensors ni GGUF |
| Dimension del embedding | 2048, normalizado en L2, masked mean pooling sobre todos los tokens |
| Modelo base | BidirLM/BidirLM-Omni-2.5B-Embedding, revision `447a6e31be61b84443144afda21374339ce408e6` |
| Backend de ejecucion | Neural Engine de Apple Silicon; esta variante no incluye los encoders de GPU |
| Tamano del repositorio | 2,8 GB |
| Pipeline | feature-extraction |

## Arquitectura y entrenamiento

La ficha del repositorio no documenta el proceso de entrenamiento del modelo base, por lo que no hay datos disponibles sobre numero de tokens, composicion del dataset ni uso de RLHF o DPO. Lo que si describe con detalle es la arquitectura de despliegue. El encoder de lenguaje se ejecuta escalonado en el Neural Engine: una cabeza por cada bloque de 512 tokens, seguida de una frontera por capa (28 fronteras documentadas) y, entre medias, atencion sobre todas las claves del mensaje, organizada en bloques de 4096 claves cuyos resumenes de softmax se fusionan de forma exacta. Las torres de vision y audio siguen el mismo esquema: cabeza, 23 fronteras, cola y resumenes de atencion. En total se auditaron 97 funciones y se trazo su ejecucion real sobre el Neural Engine durante la construccion del release.

El tratamiento de cada modalidad tiene reglas propias. Las imagenes se redimensionan dentro de un rango de 65.536 a 1.048.576 pixeles y se dividen en parches de 16 pixeles fusionados 2 a 2, de modo que una imagen ocupa entre 64 y 1024 tokens; la tabla de posiciones aprendida (`vision_pos_embed.f32`, 48 por 48) se interpola en el host y los tokens de imagen reciben posiciones rotatorias de tres ejes (tiempo, fila y columna), entrelazadas por pares de frecuencias, continuando el texto posterior desde la posicion mas alta utilizada. Vision devuelve ademas filas DeepStack que se suman tras las dos primeras capas de lenguaje en las posiciones de imagen. El audio se procesa en mono a 16 kHz con 128 bins mel (ventana 400, salto 160), a razon de 25 tokens de audio cada 2 segundos, lo que limita un mensaje a unos 10 minutos de audio. La innovacion tecnica principal del empaquetado es la cuantizacion selectiva: solo las proyecciones se cuantizan a INT8, mientras que las activaciones y la tabla de embeddings permanecen en FP16.

## Capacidades

- Extraccion de embeddings de texto con una ventana de 8192 tokens por mensaje, con chat template aplicado.
- Extraccion de embeddings de imagen fija, con resoluciones entre 65.536 y 1.048.576 pixeles y salida de 64 a 1024 tokens visuales.
- Extraccion de embeddings de audio mono a 16 kHz, hasta aproximadamente 10 minutos por mensaje.
- Embeddings de mensajes mixtos, combinando texto, imagen y audio en una misma secuencia con posiciones rotatorias coherentes.
- Espacio vectorial unificado de 2048 dimensiones, normalizado en L2, apto para busqueda por similitud coseno.
- Codificacion simetrica de consultas y documentos: no requiere prompts distintos segun el rol.
- Fusión multimodal mediante filas DeepStack inyectadas en las dos primeras capas de lenguaje en las posiciones de imagen.
- Compatibilidad de indice con los otros tres releases de la familia que comparten `spaceID`.
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso, y su `pipeline_tag` es `feature-extraction`.

## Casos de uso

- Busqueda semantica local en aplicaciones de escritorio para macOS: el modelo se ejecuta integramente en el Neural Engine, sin GPU ni conexion a servicios externos, lo que permite indexar y consultar documentos confidenciales en el propio equipo.
- Recuperacion aumentada para asistentes en el Mac: al admitir 8192 tokens por mensaje, se pueden embeber fragmentos largos de documentacion o conversaciones completas sin trocear en exceso, manteniendo la coherencia del vector.
- Indizacion de bibliotecas de imagenes: cada imagen se convierte en un vector de 2048 dimensiones que se almacena junto a los vectores de texto, habilitando busquedas del tipo "foto de una calle lluviosa" sobre un catalogo local.
- Analisis y busqueda de archivos de audio: transcripciones, podcasts o notas de voz de hasta unos 10 minutos se codifican en el mismo espacio que el texto, permitiendo recuperar pasajes hablados a partir de una consulta escrita.
- Moderacion y deduplicacion de contenido multimodal: la combinacion de embeddings de texto, imagen y audio en un unico espacio facilita detectar duplicados o contenido similar entre formatos distintos.
- Sistemas de recomendacion sobre contenido mixto: al compartir espacio vectorial con las variantes para GPU y las de programa unico, se puede precalcular un indice en un servidor con GPU y consultarlo desde un Mac con Neural Engine.
- Clasificacion y agrupamiento no supervisado: los vectores L2-normalizados de 2048 dimensiones son directamente utilizables en clustering, deteccion de anomalias o k-NN sin entrenamiento adicional.
- Aplicaciones de accesibilidad: descripcion y recuperacion de contenido audiovisual en local para usuarios que necesitan buscar en grabaciones o imagenes sin subirlas a la nube.
- Integracion en pipelines de CI para evaluacion de modelos: al ser un artefacto Core ML reproducible con `checksums.files`, sirve como referencia estable para comparar embeddings entre revisiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Hardware obligatorio: Mac con Apple Silicon (familia M). No hay soporte para CUDA, ROCm ni CPU x86; esta variante depende exclusivamente del Neural Engine.
- Sistema operativo: macOS 15 o superior, necesario para los programas Core ML multifuncion. La validacion oficial se hizo con un Apple M4 Max sobre macOS 27.0.1; el resto de combinaciones no estan cualificadas por el autor.
- VRAM: no aplica en el sentido tradicional. El modelo consume memoria unificada del sistema; el autor no publica cifras de memoria en tiempo de ejecucion.
- Almacenamiento: 2,8 GB para el bundle descargado, mas el espacio de la cache de modelos compilados de Core ML. La cache se indexa por la ruta del programa, de modo que mover el directorio obliga a recompilar.
- Tiempos de carga medidos en el equipo de validacion: aproximadamente 1 segundo en la primera carga de una funcion del Neural Engine y aproximadamente 0,14 segundos en cargas posteriores desde cache.
- Latencia y throughput de inferencia: no disponibles. El autor solo publica los tiempos de carga, no de codificacion.
- Limitacion de recursos: el Neural Engine es un recurso compartido por todos los procesos del Mac y mantiene un numero limitado de programas cargados, por lo que se recomienda cargar las funciones de medios solo cuando se necesiten.
- Opciones de despliegue: exclusivamente Core ML sobre el runtime nativo de Apple. Se proporciona un runtime de referencia en Python (`encoder.py`) que implementa el contrato de ejecucion. No hay soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no se publican pesos en safetensors ni GGUF.
- Descarga: `hf download 1of2/bidirlm-omni-2.5b-coreml-w8-ane --local-dir ./model`. Se recomienda fijar una revision del Hub en produccion en lugar de seguir `main`, y verificar los SHA-256 listados en `checksums.files` antes de cargar.

## Comparativa con modelos similares

La informacion disponible permite comparar con las otras variantes de la misma familia, que comparten espacio vectorial:

| Release | Backends | Programas | Contexto | Cuantizacion | Notas |
|---|---|---|---|---|---|
| `1of2/bidirlm-omni-2.5b-coreml-w8-ane` (este) | Neural Engine | uno por familia | 8192 | W8A16 | Solo funciones del Neural Engine, sin encoders de GPU |
| `1of2/bidirlm-omni-2.5b-coreml-w8-gpu` | GPU | uno por familia | 8192 | W8A16 | Solo funciones de GPU |
| `1of2/bidirlm-omni-2.5b-coreml-w8-bundle` | Neural Engine y GPU | uno por familia | 8192 | W8A16 | Incluye ambos backends |
| `1of2/bidirlm-omni-2.5b-coreml-w8` | Neural Engine y GPU | uno por funcion | 8192 | W8A16 | Carga mas lenta; revisiones antiguas hasta `c228769d` contenian un release retirado de 32.768 tokens no identico bit a bit |

Frente a modelos de embeddings de proposito general (por ejemplo, familias de texto tipo E5, BGE o GTE) no hay datos comparativos en la informacion disponible, ni de parametros equivalentes ni de rendimiento en recuperacion. La diferencia estructural es que este modelo es multimodal nativo y esta atado al hardware de Apple.

## Limitaciones y advertencias

- Dependencia total del ecosistema Apple: requiere Apple Silicon y macOS 15 o superior. No hay ruta de ejecucion en GPU NVIDIA, AMD o CPU x86.
- Solo se ha cualificado un equipo de validacion (Apple M4 Max con macOS 27.0.1). Otros modelos de chip o versiones de macOS pueden comportarse de forma distinta.
- El limite de 8192 tokens por mensaje es estricto: la entrada mas larga devuelve un error en lugar de truncarse, lo que obliga a gestionar el troceado en la aplicacion.
- La ventana de audio queda en torno a 10 minutos por mensaje a 16 kHz mono con 128 bins mel; entradas mas largas deben dividirse.
- La resolucion de imagen esta acotada entre 65.536 y 1.048.576 pixeles, con un maximo de 1024 tokens visuales por imagen.
- No es un modelo generativo: no puede redactar respuestas, invocar herramientas ni ejecutar razonamiento multi-paso. Cualquier uso conversacional exige un modelo generativo adicional.
- No se documentan sesgos, composicion del corpus de entrenamiento ni evaluaciones de equidad del modelo base. El riesgo de alucinacion no aplica a la generacion de texto, pero si existen limitaciones de representacion en dominios poco cubiertos por el corpus original.
- Idiomas soportados: no disponibles. No se puede asumir cobertura multilingue sin verificacion empirica.
- Los resultados de recuperacion dependen de la media con pooling enmascarado, que incluye los tokens del chat template; usar un tokenizer o processor distintos de los suministrados invalida la comparabilidad de los vectores.
- Un indice construido con el release retirado de 32.768 tokens (revisiones de `1of2/bidirlm-omni-2.5b-coreml-w8` hasta `c228769d56fad334c82d726c31f184122f04f5f9`) no es identico bit a bit al espacio actual: hay que reembeber en lugar de mezclar vectores.
- Los metadatos del repositorio muestran 0 descargas y 0 likes, y fechas de creacion y actualizacion de octubre de 2026, posteriores a la fecha de redaccion habitual de una ficha; conviene verificar la vigencia real de la publicacion.
- La licencia Apache 2.0 permite uso comercial, pero no cubre posibles restricciones adicionales del modelo base ni de los datos con los que se entreno.
- Mover el directorio de descarga invalida la cache de compilacion de Core ML y provoca una recompilacion, con el coste de tiempo asociado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/1of2/bidirlm-omni-2.5b-coreml-w8-ane
- Modelo base: https://huggingface.co/BidirLM/BidirLM-Omni-2.5B-Embedding
- Variante Neural Engine y GPU, un programa por funcion: https://huggingface.co/1of2/bidirlm-omni-2.5b-coreml-w8
- Variante Neural Engine y GPU, un programa por familia: https://huggingface.co/1of2/bidirlm-omni-2.5b-coreml-w8-bundle
- Variante solo GPU: https://huggingface.co/1of2/bidirlm-omni-2.5b-coreml-w8-gpu
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la busqueda web realizada; los resultados devueltos no guardaban relacion con el modelo.
