# labhamlet/gramt-binaural-frame

## Resumen

GRAM-Binaural-Frame es un modelo de representación de audio (audio foundation model) desarrollado por Goksenin Yuksel (labhamlet) en la Radboud University. Se trata de un codificador ViT-Base de 12 capas y aproximadamente 111 millones de parámetros que aprende representaciones espaciales de audio binaural mediante un esquema de autoaprendizaje de tipo masked autoencoder multicanal. A diferencia de la mayoría de modelos de audio, GRAM está diseñado específicamente para razonar sobre la geometría de la escena sonora: localización de fuentes, reverberación y ruido de fondo.

El modelo se entrena sobre escenas acústicas naturalistas simuladas a partir de AudioSet, convolucionando los clips con respuestas al impulso binaurales (BRIR) generadas con la plataforma Soundspace 2.0 y mezclándolos con ruido de fondo de WHAMR!. Esta metodología permite obtener robustez frente a condiciones adversas de ruido y reverberación, algo que los modelos de audio convencionales no abordan de forma nativa.

La relevancia actual del modelo reside en su enfoque explícito hacia el audio espacial: soporta de forma nativa tareas de localización binaural y ambisónica, lo que lo posiciona como una base útil para análisis de escenas, clasificación de sonidos ambientales, reconocimiento de habla en entornos ruidosos y conteo de hablantes. Se distribuye con licencia MIT y está pensado como extractor de características sobre el que entrenar cabezales lineales para tareas downstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT-Base (12 capas) con patch extractor convolucional 2D y enmascarado multicanal (MWMAE) |
| Parametros totales | 111.365.632 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; procesa fragmentos de 2 segundos por chunk |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Todos, principalmente ingles (segun model card) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Entrada | Espectrogramas mel logaritmicos 1024 x 128, 128 filtros mel, 50-16000 Hz, ventana Hanning 25 ms, hop 10 ms |
| Canales de audio | 2 (binaural); existe variante Ambisonics de 4 canales |
| Estrategias de embedding | raw, mean, cls |
| Dataset de entrenamiento | AudioSet (unbalanced) + WHAMR! (ruido) + Matterport3D (RIR) |

## Arquitectura y entrenamiento

GRAM es un autoencoder enmascarado multicanal (masked autoencoder) de tipo self-supervised. La entrada consiste en espectrogramas mel logaritmicos multicanal que se dividen en parches no solapados mediante una unica capa convolucional 2D; los parches no enmascarados se procesan con un encoder ViT-Base de 12 capas, del que se extraen las representaciones utilizadas para fine-tuning. La innovacion central es MWMAE (Multi-window multi-head attention), que junto con aumentos basados en respuestas al impulso (RIR) permite al modelo aprender representaciones sensibles a la direccion y a la reverberacion.

El entrenamiento utiliza 70.000 escenas naturalistas simuladas (correspondientes a 70 casas de Matterport3D) generadas a partir de los clips de AudioSet, convolucionados con BRIR (variante binaural) o ARIR (variante ambisonica) y mezclados con ruido de WHAMR! con fundidos lineales de 200 ms. Las 15.000 escenas restantes (15 casas) se reservan para evaluacion downstream. El objetivo de preentrenamiento es la reconstruccion de parches enmascarados del espectrograma multicanal. No se documenta en la informacion disponible el uso de RLHF o DPO, algo esperable en un modelo de representacion y no generativo.

## Capacidades

- Extraccion de caracteristicas de audio para tareas downstream (feature-extraction como pipeline principal).
- Representacion espacial de audio: localizacion binaural y ambisonica de fuentes sonoras.
- Clasificacion de sonidos ambientales (environmental sound classification).
- Reconocimiento de habla en condiciones de ruido y reverberacion adversas.
- Conteo de hablantes (speaker counting) a partir de las representaciones.
- Robustez nativa frente a ruido de fondo y reverberacion gracias al entrenamiento con RIR y WHAMR!.
- Tres estrategias de embedding (raw, mean, cls) para adaptar la representacion a la duracion del audio.
- Normalizacion de sonoridad configurable (RMS a -14 dBFS por defecto).
- No es un modelo generativo: no produce texto ni audio, solo representaciones vectoriales.

## Casos de uso

- Analisis de escenas acusticas: el modelo extrae representaciones que permiten inferir la disposicion espacial de fuentes sonoras en grabaciones binaurales, util para sistemas de monitorizacion ambiental o robótica auditiva.
- Reconocimiento de habla en entornos ruidosos: las representaciones robustas a reverberacion y ruido sirven como front-end para sistemas ASR desplegados en salas reales, coches o espacios publicos.
- Clasificacion de eventos sonoros (FSD50K, ESC50): entrenando un cabezal lineal sobre los embeddings extraidos se obtiene un clasificador de sonidos ambientales con estado del arte segun el autor.
- Conteo de hablantes en reuniones: las representaciones espaciales permiten estimar el numero de interlocutores en una grabacion multichannel, util en herramientas de transcripcion de reuniones.
- Indexacion y busqueda de archivos de audio: generar embeddings fijos independientes de la duracion del clip (estrategia raw) facilita la recuperacion por similitud en grandes catalogos de audio.
- Preentrenamiento para tareas de audio personalizadas: sirve como backbone congelado sobre el que entrenar cabezales ligeros para dominios especificos (vigilancia acustica, sanidad, industria).
- Localizacion de fuentes para audio espacial: base para aplicaciones de realidad aumentada o virtual que necesitan conocer la direccion de los sonidos.

## Benchmarks y rendimiento

La model card menciona resultados de estado del arte en tareas downstream como FSD50K, ESC50 y tareas de localizacion (VL), asi como resultados en el benchmark HEAR (obtenidos sin normalizacion de sonoridad). Sin embargo, no se proporcionan cifras numericas concretas en la informacion disponible.

No se han publicado resultados de benchmarks numericos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 0,5-1 GB en fp32 para los 111 M de parametros, mas el coste de activaciones del ViT-Base; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 son suficientes. Para procesamiento por lotes a gran escala se recomienda A100/H100.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna e incluso en CPU para inferencia puntual.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requerido por el codigo personalizado); el modelo usa `AutoModel` y `AutoFeatureExtractor`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI (no aplica a un extractor de caracteristicas).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GRAM-Binaural-Frame | 111 M | Fragmentos de 2 s, espectrograma 1024x128 | Audio espacial binaural, MWMAE | MIT | Hugging Face |
| GRAM-Ambisonics | no disponible | Fragmentos de 2 s, 4 canales ambisonicos | Audio espacial ambisonico | MIT | Hugging Face (variante) |
| Otros modelos de audio de proposito general (p. ej. BEATs, AST, wav2vec2) | no disponible | no disponible | Representacion de audio mono | no disponible | no disponible |

La comparacion cuantitativa con alternativas no esta disponible en la informacion proporcionada. La diferencia cualitativa principal de GRAM frente a modelos de audio convencionales es su soporte nativo de audio multicanal espacial (binaural y ambisonico), que la mayoria de alternativas no ofrece.

## Limitaciones y advertencias

- Modelo de representacion, no generativo: no produce texto, transcripciones ni audio; requiere un cabezal downstream entrenado para cada tarea.
- Entrenado principalmente sobre AudioSet y escenas simuladas con Matterport3D y WHAMR!; puede generalizar peor a dominios acusticos muy distintos de los simulados.
- El sesgo de los datos de AudioSet (procedencia de YouTube, desequilibrio de clases) puede trasladarse a las representaciones.
- La model card indica soporte de "todos los idiomas, principalmente ingles"; el rendimiento en otras lenguas no esta cuantificado.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo personalizado del autor; conviene revisarlo antes de desplegar en produccion.
- La longitud de contexto efectiva no esta documentada; el procesamiento se hace por chunks de 2 segundos, lo que puede limitar tareas que requieran contexto temporal muy largo.
- Riesgo de alucinacion no aplica en sentido estricto (no genera texto), pero las representaciones pueden producir clasificaciones erroneas en condiciones fuera de distribucion.
- Licencia MIT: permite uso comercial y modificacion, con obligacion de incluir el aviso de copyright y la licencia.
- El modelo tiene pocas descargas (74) y likes (2), lo que sugiere escasa validacion por parte de la comunidad; conviene validar empiricamente antes de adoptarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/labhamlet/gramt-binaural-frame
- Repositorio GitHub: https://github.com/labhamlet/GRAM-T
- Paper (arXiv): https://arxiv.org/abs/2506.00934
- Dataset AudioSet: https://huggingface.co/datasets/agkphysics/AudioSet
