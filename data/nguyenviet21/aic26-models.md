# nguyenviet21/AIC26-models

## Resumen

`nguyenviet21/AIC26-models` no es un modelo entrenado, sino un paquete de despliegue (deployment bundle) de modelos ya existentes, publicado por el usuario nguyenviet21 en el contexto de la competición AIC 2026. El repositorio empaqueta pesos, configuraciones y ficheros de tokenizador para reconstruir un pipeline de recuperación de vídeo (video retrieval) y procesamiento multimodal, junto con un manifiesto (`bundle-manifest.json`) que registra tamanos y hashes SHA-256 de cada fichero.

El bundle integra ocho componentes de terceros: los codificadores multimodales MetaCLIP2 y Perception Encoder de Meta, el modelo de embeddings BGE-VL-large de BAAI, la base de retrieval BEiT-3 COCO de Microsoft, el detector de texto CRAFT (EasyOCR), un reconocedor de texto en escena PARSeq-VN ajustado por el equipo, el modelo de reconocimiento de voz ChunkFormer CTC large para vietnamita y el detector de objetos RF-DETR Medium de Roboflow. Adicionalmente, la model card indica que `qwen2.5:3b-instruct` se aprovisiona por separado mediante Ollama como componente opcional.

Su relevancia es practica y de reproducibilidad: permite restaurar un entorno de inferencia con versiones fijadas (snapshots pinneados) de cada componente, evitando la deriva de versiones en los repositorios upstream. No aporta pesos nuevos, ni datos de competicion, ni resultados de evaluacion propios, y su licencia no esta declarada de forma unica, ya que cada componente conserva los terminos de sus autores originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Bundle multi-modelo: codificadores vision-lenguaje tipo CLIP, modelo de embeddings multimodal, detector de objetos DETR, detector de texto (CRAFT), reconocedor de texto en escena (PARSeq, transformer) y ASR CTC por chunks (ChunkFormer) |
| Parametros totales | no disponible (agregado de componentes; no se especifica por componente) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen sin indicacion de cuantizacion; no se mencionan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | vietnamita (vi), ingles (en) |
| Licencia | no disponible para el bundle en su conjunto; MetaCLIP2 y ChunkFormer declaran CC-BY-NC-4.0, y el resto conserva los terminos de sus autores originales. La model card advierte de no asignar una licencia unica al paquete |
| Formato de pesos | safetensors, .pth y .ckpt (segun componente) |
| Componentes incluidos | MetaCLIP2, BGE-VL-large, Perception Encoder (PE-Core-B16-224), BEiT-3 COCO retrieval base, CRAFT, PARSeq-VN, ChunkFormer CTC large vie, RF-DETR Medium |
| Tamano del repositorio | 12,0 GB |
| Fecha de publicacion | 14 de septiembre de 2026 (creacion y ultima actualizacion) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

Este repositorio no describe ningun entrenamiento propio. Se trata de un bundle de despliegue: los pesos se restauran a sus rutas de ejecucion originales dentro de un repositorio de codigo companero en GitHub, mediante el comando `scripts/model_bundle.py restore`. La estructura interna se divide en `project/`, que contiene ficheros restaurados a sus rutas de runtime, y `hub/`, que contiene unicamente snapshots pinneados restaurados en `HF_HUB_CACHE` bajo sus identificadores de repositorio originales (pesos, configuraciones de modelo, ficheros de tokenizador y los loaders Python necesarios de BGE-VL). Los entornos Python y los checkouts de codigo de terceros se instalan por separado siguiendo las instrucciones del repositorio GitHub.

Los componentes cubren la cadena completa de un sistema de recuperacion de video y extraccion de informacion: representacion vision-lenguaje (MetaCLIP2, Perception Encoder), recuperacion multimodal (BGE-VL-large, BEiT-3), deteccion de texto en imagen (CRAFT), reconocimiento de texto en escena (PARSeq-VN), transcripcion de audio en vietnamita (ChunkFormer con CTC y procesamiento por chunks) y deteccion de objetos (RF-DETR Medium). La model card aclara explicitamente que no se incluye video, imagen, transcripcion, embedding, submission, credenciales ni entorno de la competicion. No se documentan datos de entrenamiento, numero de tokens, composicion del dataset ni tecnicas de alineacion como RLHF o DPO, ya que los pesos son de terceros. Como componente opcional, `qwen2.5:3b-instruct` se aprovisiona aparte con `ollama pull`, y se advierte de que una etiqueta de Ollama no es intercambiable con un checkpoint de Transformers. El VLM externo esta deshabilitado en la configuracion base y no tiene pesos seleccionados en el bundle.

## Capacidades

- Recuperacion de video y de fotogramas (video retrieval) combinando codificadores vision-lenguaje y modelos de embeddings multimodales.
- Busqueda y recuperacion multimodal texto-imagen mediante BGE-VL-large y BEiT-3 COCO retrieval base.
- Deteccion de texto en escena con CRAFT (modelo `craft_mlt_25k.pth` de EasyOCR), como etapa previa al reconocimiento.
- Reconocimiento optico de caracteres (OCR) en escena con PARSeq-VN, un checkpoint ajustado por el equipo sobre la arquitectura PARSeq.
- Reconocimiento automatico de voz (ASR) en vietnamita con ChunkFormer CTC large vie, incluyendo procesamiento por chunks para audio de larga duracion.
- Deteccion de objetos en imagen con RF-DETR Medium.
- Codificacion de imagen y texto con MetaCLIP2 (Worldwide, variante huge) y Perception Encoder (PE-Core-B16-224).
- Generacion de texto opcional mediante `qwen2.5:3b-instruct` servido con Ollama (no incluido en los pesos del bundle, se aprovisiona aparte).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible. El VLM externo aparece deshabilitado en la configuracion base.
- Capacidades multilingues: vietnamita e ingles segun las etiquetas del repositorio; el resto de idiomas de cada componente no se detalla.
- Capacidades especiales: bundle reproducible con manifiesto de hashes SHA-256 para verificacion de integridad de los ficheros.

## Casos de uso

- Recuperacion de fragmentos de video por consulta textual: los fotogramas se codifican con MetaCLIP2 o Perception Encoder y se indexan frente a embeddings de texto, lo que permite localizar momentos concretos dentro de un archivo de video sin metadatos manuales.
- Extraccion de texto en retransmisiones o grabaciones: CRAFT localiza regiones con texto y PARSeq-VN las transcribe, util para subtitulado de rotulos, carteles, marcadores deportivos o grafismos en pantalla.
- Transcripcion de audio en vietnamita: ChunkFormer CTC large vie procesa el audio por chunks, lo que resulta adecuado para transcripciones largas y para generar subtitulos alineados con el video.
- Indexacion semantica de archivos multimedia: BGE-VL-large genera embeddings multimodales que permiten construir un indice vectorial para busqueda por similitud sobre una videoteca.
- Analisis de contenido en competiciones o retos tipo AIC: el bundle fija las versiones exactas de cada componente, de modo que distintos equipos o ejecuciones reproducen el mismo pipeline sin deriva de versiones.
- Deteccion de objetos en fotogramas clave: RF-DETR Medium permite localizar personas, vehiculos u objetos de interes antes de aplicar etapas de recuperacion o de OCR, reduciendo el espacio de busqueda.
- Pipeline de moderacion o revision automatica de contenido: combinando deteccion de objetos, OCR y ASR se puede generar una descripcion estructurada de cada video para revision humana posterior.
- Prototipos de asistentes sobre video con generacion de texto: usando `qwen2.5:3b-instruct` vía Ollama sobre los resultados de recuperacion, se pueden redactar resumenes o respuestas en lenguaje natural a partir de los fragmentos recuperados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de evaluacion propias, y los resultados de busqueda web asociados no contienen informacion tecnica relevante (unicamente enlaces genericos de Google Maps sin relacion con el modelo).

## Requisitos de hardware

- Almacenamiento: el repositorio ocupa 12,0 GB, por lo que se necesita al menos ese espacio en disco para restaurar el bundle completo, mas el espacio adicional de los entornos Python y checkouts de terceros.
- VRAM para inferencia: no disponible. Al tratarse de un conjunto de modelos heterogeneos, el consumo depende del componente cargado, de la precision y de si se ejecutan simultaneamente.
- GPU recomendadas: no disponible en la informacion proporcionada. La model card no especifica hardware objetivo ni minimo.
- Compatibilidad con GPU de consumo: no disponible. No puede confirmarse a partir de la documentacion si los componentes caben en GPUs tipo RTX 4090 o similares.
- Opciones de despliegue: restauracion mediante `scripts/model_bundle.py restore` desde el repositorio GitHub companero, con los pesos cargados desde `HF_HUB_CACHE`. Ollama se usa exclusivamente para el modelo opcional `qwen2.5:3b-instruct`. No se mencionan vLLM, llama.cpp, TGI ni otras plataformas.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No procede una comparativa directa, ya que el repositorio no es un modelo unico sino un paquete de despliegue de ocho componentes de terceros. Como referencia, se compara el bundle con la alternativa de obtener cada componente por separado desde su repositorio original:

| Alternativa | Contenido | Versionado | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este bundle (`nguyenviet21/AIC26-models`) | 8 componentes con snapshots pinneados, manifiesto con tamanos y SHA-256 | Fijado por commit y hash | No unificada; componentes con CC-BY-NC-4.0 y terminos propios | Publico en HuggingFace, 12,0 GB |
| Descarga individual desde repos upstream | MetaCLIP2, BGE-VL-large, PE-Core-B16-224, BEiT-3, EasyOCR, PARSeq, ChunkFormer, RF-DETR | Sujeto a cambios en cada repositorio | La de cada proyecto | Publica, pero requiere resolver versiones manualmente |
| Checkpoint PARSeq-VN | Checkpoint ajustado por el equipo | Solo dentro de este bundle | No establecida; la model card exige que el publicador anada los terminos de procedencia y redistribucion | No disponible fuera del bundle |
| `qwen2.5:3b-instruct` | Modelo de lenguaje opcional para generacion de texto | Etiqueta de Ollama | La del modelo Qwen 2.5 | Se aprovisiona por separado con `ollama pull` |

## Limitaciones y advertencias

- No es un modelo entrenado: no debe citarse ni evaluarse como una contribucion de modelado nueva, sino como un paquete de distribucion de pesos de terceros.
- Licencia no unificada: la model card prohibe expresamente asignar una licencia de codigo unica al bundle. MetaCLIP2 y ChunkFormer declaran CC-BY-NC-4.0, lo que restringe el uso comercial de esos componentes.
- El checkpoint PARSeq-VN carece de terminos de licencia establecidos: la model card indica que el publicador debe anadir la procedencia y las condiciones de redistribucion antes de publicarlo, y que la licencia de la arquitectura no determina por si sola los terminos del checkpoint.
- Restriccion de uso comercial: por la presencia de componentes CC-BY-NC-4.0, el bundle no es apto para uso comercial sin revisar y resolver la licencia de cada componente.
- Sin datos de rendimiento: no hay benchmarks, ni latencias, ni comparativas publicadas, por lo que no puede validarse su calidad frente a alternativas.
- Cobertura idiomatica limitada: las etiquetas declaran vietnamita e ingles; el comportamiento en otros idiomas no esta documentado.
- Riesgo de alucinacion: no evaluado en la informacion disponible. Aplica al componente opcional de generacion de texto (`qwen2.5:3b-instruct`) y no a los componentes de recuperacion, deteccion o transcripcion.
- Sesgos: no documentados por el autor del bundle. Cada componente upstream puede arrastrar los sesgos de sus propios datos de entrenamiento.
- Dependencia del repositorio GitHub companero: la restauracion exige ejecutar `scripts/model_bundle.py restore`; sin ese codigo, los pesos no quedan en las rutas de runtime esperadas.
- Aviso explicito sobre Ollama: una etiqueta de Ollama no es intercambiable con un checkpoint de Transformers, por lo que no debe sustituirse el componente de generacion sin verificar la compatibilidad.
- VLM externo deshabilitado: la configuracion base lo desactiva y no se incluye ningun peso seleccionado para esa funcion.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, y fechas de creacion y actualizacion separadas por menos de tres minutos, lo que sugiere una publicacion reciente y sin validacion externa.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/nguyenviet21/AIC26-models
- MetaCLIP2 (facebook/metaclip-2-worldwide-huge-quickgelu): https://huggingface.co/facebook/metaclip-2-worldwide-huge-quickgelu/tree/c139061af7b10fdb2e754b60d2b1182a3d5526c2
- BGE-VL-large (BAAI): https://huggingface.co/BAAI/BGE-VL-large/tree/40fb48217f521df22a2a5bf15edd52ed1146ef05
- Perception Encoder (facebook/PE-Core-B16-224): https://huggingface.co/facebook/PE-Core-B16-224/tree/a16450b46fef32363459920c2685a1b4ef13dcd9
- BEiT-3 (microsoft/unilm): https://github.com/microsoft/unilm/tree/833df7e7832e5064a281131ee64a481afa8e5b95/beit3
- CRAFT / EasyOCR: https://github.com/JaidedAI/EasyOCR
- PARSeq (arquitectura): https://github.com/baudm/parseq/tree/1572487d138cdf0340fb2a2f1437cc0cca05eabf
- ChunkFormer CTC large vie (khanhld): https://huggingface.co/khanhld/chunkformer-ctc-large-vie/tree/311fc03558a895dc2b32957f2fb4236c7fb1455b
- RF-DETR (roboflow): https://github.com/roboflow/rf-detr
- Los resultados de busqueda web proporcionados no contienen enlaces relevantes al modelo: consisten en URLs genericas de Google Maps y Mapy Google sin relacion con el repositorio.
