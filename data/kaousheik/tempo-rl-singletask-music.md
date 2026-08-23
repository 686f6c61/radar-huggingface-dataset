# Kaousheik/tempo-rl-singletask-music

## Resumen

TEMPO es un modelo de post-entrenamiento multi-tarea con anclaje temporal para modelos de lenguaje de audio, desarrollado por Apoorva Kulkarni, Kaousheik Jayakumar y colaboradores de la Universidad de Maryland y el laboratorio de Dinesh Manocha. Este checkpoint concreto, `tempo-rl-singletask-music`, corresponde a la ejecución de la Tabla 2 del trabajo, en la que se aplica entrenamiento con refuerzo (GRPO) únicamente sobre la tarea de captioning musical con marcas de tiempo, partiendo de un modelo base Audio Flamingo 3 de NVIDIA.

El modelo combina un encoder de audio Whisper-large congelado con un decoder de lenguaje Qwen2-7B, y añade un proyector multimodal consciente del tiempo que genera aproximadamente 601 tokens atómicos de timestamp con resolución de 0,1 segundos. La arquitectura permite intercalar texto con marcas de tiempo en las respuestas, lo que habilita tareas como el etiquetado temporal de eventos acústicos. El checkpoint se distribuye con los pesos fusionados (LoRA ya aplicada) y un archivo adicional `time_proj.pt` que contiene el estado del proyector temporal, imprescindible para la carga correcta del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio Flamingo 3 (encoder Whisper-large-v3 congelado + decoder Qwen2-7B) con proyector temporal |
| Parametros totales | 8.271.605.248 (8,27 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (repo en safetensors de precision completa) |
| Idiomas soportados | No disponible |
| Licencia | NVIDIA Research-Only (solo uso academico no comercial) |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo se basa en Audio Flamingo 3, que combina un encoder de audio Whisper-large-v3 congelado con un decoder de lenguaje Qwen2-7B. La innovacion principal de TEMPO es la incorporacion de un proyector multimodal consciente del tiempo, que introduce codificaciones sinusoidales de reloj de pared y genera aproximadamente 601 tokens atomicos de timestamp con resolucion de 0,1 segundos. Esto permite que el modelo intercale texto y marcas temporales en sus respuestas, habilitando tareas de anclaje temporal y captioning denso con precision de decimas de segundo.

El entrenamiento sigue un esquema de post-entrenamiento en dos etapas: primero un fine-tuning supervisado (SFT) con datos sinteticos y anotaciones humanas, y despues un entrenamiento con refuerzo mediante GRPO (Group Relative Policy Optimization) sobre la tarea especifica. En este checkpoint, la etapa de RL se ejecuta unicamente para la tarea de captioning musical con marcas de tiempo, dejando fuera las otras cuatro tareas del conjunto TEMPO. Los datos de entrenamiento provienen del dataset `Kaousheik/tempo`, que incluye divisiones `synthetic_stage1`, `sft_stage2`, `rl`, `val` y `evaluation`.

## Capacidades

- Captioning musical con marcas de tiempo: genera descripciones de segmentos musicales con etiquetas de instrumento, tempo, acordes y estadisticas, intercalando tokens de tiempo.
- Anclaje temporal de eventos: capaz de localizar intervalos de tiempo dentro de una grabacion de audio.
- Diarizacion de locutores: identifica y separa intervenciones de distintos hablantes con marcas temporales.
- ASR multi-hablante: transcripcion de voz con segmentacion temporal.
- Captioning denso de audio: descripcion de eventos acusticos con delimitadores temporales.
- Interaccion texto-audio: pipeline `audio-text-to-text` que recibe audio y genera respuestas textuales con referencias temporales.

## Casos de uso

- Anotacion automatica de partituras: el modelo puede etiquetar instrumentos y tempo en grabaciones musicales, lo que resulta util para transcripcion automatica de partituras o analisis de producciones musicales.
- Analisis de acordes en produccion musical: permite detectar secuencias de acordes y su calidad a lo largo de una pista, facilitando el analisis armonico en estudios de produccion.
- Generacion de metadatos para bibliotecas musicales: puede generar descripciones temporales de contenido musical para motores de busqueda o sistemas de recomendacion que requieran anotaciones estructuradas.
- Evaluacion de rendimiento musical en tiempo real: gracias a la resolucion de 0,1 segundos, puede usarse en sistemas de feedback para practica instrumental, detectando cambios de tempo o errores de ejecucion.
- Investigacion en musicologia computacional: sirve para analizar grandes corpus de grabaciones, extrayendo caracteristicas temporales como tempo, acordes y presencia de instrumentos.
- Preprocesamiento para generacion musical: como herramienta de anotacion de datos para entrenar modelos generativos de musica, proporcionando etiquetas temporales de alta calidad.
- Deteccion de eventos en audio general: aunque optimizado para musica, su capacidad de anclaje temporal puede aplicarse a otras tareas de deteccion de eventos acusticos.

## Benchmarks y rendimiento

Los resultados reportados en la model card para el checkpoint de tarea unica de musica son:

| Metrica | Valor |
|---|---|
| Chord root (raiz de acorde) | 0,190 |
| Chord quality (calidad de acorde) | 0,322 |
| Chord F1 | 0,060 |
| Instrument F1 | 0,963 |
| Tempo accuracy | 0,470 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- El modelo tiene 8,27 B parametros en precision completa (fp32), lo que requiere aproximadamente 16,6 GB de VRAM para la inferencia en fp32.
- Con cuantizacion a int8 (no disponible en el repo, pero posible con herramientas externas), la VRAM necesaria se reduce a aproximadamente 8,3 GB, lo que permitiria ejecutarlo en una GPU consumer como RTX 4080 o RTX 4090.
- Para inferencia en fp16 o bf16, se estima que una GPU con al menos 16 GB de VRAM (A100, RTX 3090, RTX 4090) seria necesaria.
- Opciones de despliegue: se puede servir con `transformers` y `peft` para cargar los pesos fusionados, o exportar a formato GGUF con `llama.cpp` para ejecucion en CPU/GPU. No hay soporte nativo en `vLLM` o `Ollama` documentado.
- El archivo `time_proj.pt` debe cargarse por separado en el proyector; es un paso adicional en el codigo de inferencia.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. El modelo base Audio Flamingo 3 de NVIDIA es el unico punto de referencia directo, pero no hay datos comparativos publicados para este checkpoint. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- Licencia de uso exclusivo para investigacion academica no comercial: derivada de Audio Flamingo 3, con licencia `nvidia-research-only`. No se permite uso comercial sin autorizacion explicita de NVIDIA.
- Sesgo de entrenamiento: el dataset TEMPO incluye corpus con licencias CC BY 4.0 y CC BY-NC 3.0 (ESC-50), lo que puede implicar limitaciones adicionales para el uso comercial de los datos de entrenamiento.
- Riesgo de alucinacion en marcas temporales: aunque el modelo esta entrenado para anclar temporalmente, puede generar timestamps imprecisos en entradas de audio complejas o con ruido.
- Especializado en musica: este checkpoint se ha optimizado para la tarea de captioning musical; su rendimiento en otras tareas de audio general (ASR, diarizacion, grounding) puede ser inferior al de otros checkpoints del conjunto TEMPO.
- Dependencia de `time_proj.pt`: sin el proyector temporal, el modelo no puede generar marcas de tiempo correctamente; es un archivo externo que debe cargarse manualmente.
- No hay documentacion sobre la longitud de contexto soportada ni sobre el rendimiento en idiomas distintos del ingles (los datos de entrenamiento son mayormente en ingles).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Kaousheik/tempo-rl-singletask-music
- Dataset TEMPO: https://huggingface.co/datasets/Kaousheik/tempo
- Modelo base Audio Flamingo 3: https://huggingface.co/nvidia/audio-flamingo-3
- Pagina personal del autor: https://kaousheik-26.github.io/
- CV del autor (menciona el paper TEMPO): https://kaousheik-26.github.io/assets/kaousheik_CV.pdf
- Perfil de HuggingFace del autor: https://huggingface.co/Kaousheik
- Perfil de Google Scholar: https://scholar.google.com/citations?user=Yc8bSDIAAAAJ&hl=en

Nota: el paper TEMPO se menciona como "Under Review" en el CV del autor; no se ha publicado en acceso abierto.</think>## Resumen

TEMPO es un modelo de post-entrenamiento multi-tarea con anclaje temporal para modelos de lenguaje de audio, desarrollado por un equipo de la Universidad de Maryland (Gamma Lab y PIRL Lab) liderado por los profesores Dinesh Manocha y Ramani Duraiswami. Este checkpoint concreto, `tempo-rl-singletask-music`, corresponde a la ejecución de la Tabla 2 del trabajo TEMPO, en la que se aplica entrenamiento con refuerzo mediante GRPO (Group Relative Policy Optimization) únicamente sobre la tarea de captioning musical con marcas de tiempo, partiendo del modelo base Audio Flamingo 3 de NVIDIA.

El modelo combina un encoder de audio Whisper-large-v3 congelado con un decoder de lenguaje Qwen2-7B, y añade un proyector multimodal consciente del tiempo que introduce aproximadamente 601 tokens atómicos de timestamp con resolución de 0,1 segundos. Esto permite que el modelo intercale texto y marcas temporales en sus respuestas, habilitando tareas como el etiquetado temporal de instrumentos, acordes y tempo en grabaciones musicales. El checkpoint se distribuye con pesos fusionados (LoRA ya aplicada) y un archivo adicional `time_proj.pt` que contiene el estado del proyector temporal, imprescindible para la carga correcta del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio Flamingo 3 (encoder Whisper-large-v3 congelado + decoder Qwen2-7B) con proyector temporal |
| Parametros totales | 8.271.605.248 (8,27 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (repo en safetensors de precision completa) |
| Idiomas soportados | No disponible |
| Licencia | NVIDIA Research-Only (solo uso academico no comercial) |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo se basa en Audio Flamingo 3, que combina un encoder de audio Whisper-large-v3 congelado con un decoder de lenguaje Qwen2-7B. La innovacion principal de TEMPO es la incorporacion de un proyector multimodal consciente del tiempo, que introduce codificaciones sinusoidales de reloj de pared y genera aproximadamente 601 tokens atomicos de timestamp con resolucion de 0,1 segundos. Esto permite que el modelo intercale texto y marcas temporales en sus respuestas, habilitando tareas de anclaje temporal y captioning denso con precision de decimas de segundo.

El entrenamiento sigue un esquema de post-entrenamiento en dos etapas: primero un fine-tuning supervisado (SFT) sobre datos sinteticos y anotaciones humanas, y despues un entrenamiento con refuerzo mediante GRPO. En este checkpoint, la etapa de RL se ejecuta unicamente para la tarea de captioning musical con marcas de tiempo, dejando fuera las otras cuatro tareas del conjunto TEMPO. Los datos de entrenamiento provienen del dataset `Kaousheik/tempo`, que contiene divisiones `synthetic_stage1`, `sft_stage2`, `rl`, `val` y `evaluation`, con corpus como AMI, ICSI, AudioSet Strong, TACOS, Slakh2100, LibriSpeech y ESC-50.

## Capacidades

- Captioning musical con marcas de tiempo: genera descripciones de segmentos musicales con etiquetas de instrumento, tempo, acordes y estadisticas, intercalando tokens de tiempo.
- Anclaje temporal de audio: localiza intervalos de tiempo dentro de una grabacion de audio para eventos concretos.
- Diarizacion de hablantes: identifica y separa las intervenciones de distintos hablantes con marcas temporales.
- ASR multi-hablante: transcripcion de voz con delimitacion temporal de cada turno.
- Captioning denso de audio: descripcion de eventos acusticos con limites temporales precisos.
- Interaccion audio-texto: el pipeline `audio-text-to-text` permite alimentar el modelo con audio y obtener respuestas textuales estructuradas con timestamps.

## Casos de uso

- Anotacion de instrumentos en produccion musical: el modelo puede etiquetar la presencia de instrumentos en segmentos temporales, lo que resulta util para herramientas de transcripcion automatica o para la indexacion de bibliotecas musicales.
- Analisis de acordes y progresiones armonicas: con la metrica `chord root` y `chord quality`, puede identificar acordes y su calidad a lo largo de una pista, facilitando el analisis armonico en estudios de produccion musical.
- Deteccion de tempo en grabaciones: la metrica `tempo acc` indica que puede estimar el tempo de una pieza, lo que es util para aplicaciones de DJ o para sincronizacion de audio en produccion audiovisual.
- Anotacion de eventos en audio de video: la capacidad de anclaje temporal permite generar subtitulos descriptivos de eventos acusticos en grabaciones de video, util para indexacion de contenidos.
- Investigacion en musicologia computacional: el modelo puede procesar corpus grandes de grabaciones musicales para extraer metadatos temporales, facilitando estudios de estilo, instrumentacion y estructura.
- Generacion de datos de entrenamiento para otros modelos: las anotaciones generadas pueden servir como datos de entrenamiento o evaluacion para otros sistemas de captioning de audio o de deteccion de eventos.
- Herramientas de accesibilidad: la diarizacion y el captioning denso pueden utilizarse para generar subtitulos descriptivos en tiempo real para personas con discapacidad auditiva.

## Benchmarks y rendimiento

Los resultados reportados en la model card para el checkpoint de tarea de musica son:

| Metrica | Valor |
|---|---|
| Chord root (raiz de acorde) | 0,190 |
| Chord quality (calidad de acorde) | 0,322 |
| Chord F1 | 0,060 |
| Instrument F1 | 0,963 |
| Tempo accuracy | 0,470 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- El modelo tiene 8,27 B parametros en precision completa, lo que requiere aproximadamente 16,6 GB de VRAM para inferencia en fp32.
- Con cuantizacion a 4 bits (no proporcionada en el repo, pero posible con herramientas como `llama.cpp` o `bitsandbytes`), la VRAM necesaria se reduce a aproximadamente 8-10 GB, lo que permitiria ejecutarlo en GPUs consumer como RTX 4080 o RTX 4090.
- Para inferencia en fp16 o bf16, se recomienda al menos 16 GB de VRAM (A100, RTX 3090, RTX 4090).
- Opciones de despliegue: se puede usar con `transformers` y `peft` para cargar los pesos fusionados; no hay soporte nativo documentado para `vLLM` o `Ollama`.
- El archivo `time_proj.state` debe cargarse por separado en el proyector; es un paso adicional en el pipeline de inferencia que requiere implementacion manual.
- No se disponen de datos de latencia o throughput estimados.

## Comparativa con modelos similares

No se han publicado comparaciones con otros modelos en la informacion proporcionada. El modelo base Audio Flamingo 3 de NVIDIA es la referencia directa, pero no hay datos de rendimiento comparativo para este checkpoint. Se desconoce la existencia de modelos de la misma categoria con anclaje temporal en audio. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- Licencia restrictiva: derivada de Audio Flamingo 3, con licencia `nvidia-research-only`. Solo se permite uso academico no comercial; cualquier uso comercial requiere autorizacion explicita de NVIDIA.
- Sesgo de entrenamiento: los datos de entrenamiento incluyen corpus con licencias CC BY 4.0 y CC BY-NC 3.0 (ESC-50), lo que puede imponer restricciones adicionales para su uso en productos comerciales.
- Riesgo de alucinacion temporal: el modelo puede generar timestamps incorrectos o descripciones inventadas en audio ambiguos o ruidosos, especialmente en segmentos de baja calidad.
- Especializacion en tarea unica: este checkpoint esta optimizado para captioning musical; su rendimiento en otras tareas del conjunto TEMPO (ASR, diarizacion, grounding) puede ser inferior al de otros checkpoints multi-tarea.
- Dependencia de archivo externo: el proyector temporal (`time_proj.pt`) es obligatorio para la generacion de timestamps; sin el, el modelo no funciona correctamente.
- No hay documentacion sobre la longitud de contexto soportada ni sobre los idiomas cubiertos; la evaluacion publicada se centra en audio musical en ingles.
- El dataset `Kaousheik/tempo` no tiene documentacion publica de su contenido exacto, lo que dificulta evaluar la diversidad de datos de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Kaousheik/tempo-rl-singletask-music
- Dataset TEMPO: https://huggingface.co/datasets/Kaousheik/tempo
- Modelo base Audio Flamingo 3: https://huggingface.co/nvidia/audio-flamingo-3
- Pagina personal del autor: https://kaousheik-26.github.io/
- CV del autor (menciona el paper TEMPO): https://kaousheik-26.github.io/assets/kaousheik_CV.pdf
- Perfil de HuggingFace del autor: https://huggingface.co/Kaousheik
- Perfil de Google Scholar: https://scholar.google.com/citations?user=Yc8bSDIAAAAJ&hl=en

Nota: el paper TEMPO se menciona como "Under Review" en el CV del autor; no se ha publicado un acceso abierto.
