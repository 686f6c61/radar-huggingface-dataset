# gorse-io/clap2-xs-audioxl-s1B-GGUF

## Resumen

CLAP2 XS AudioXL es un modelo de embeddings conjuntos audio-texto desarrollado originalmente por LAION, publicado en el repositorio `laion/clap2-xs-audioxl-s1B`. Esta ficha concreta corresponde a la conversión a formato GGUF realizada por `gorse-io`, pensada para ser ejecutada con el runtime `clap.cpp` (no con llama.cpp). El modelo proyecta texto y audio a un mismo espacio vectorial de 320 dimensiones, L2-normalizado, lo que permite calcular similitudes directamente mediante producto escalar.

La relevancia de esta conversión radica en la disponibilidad de un formato único y autocontenido: cada fichero GGUF embebe ambos codificadores (texto y audio), el tokenizador y la configuración del frontend de audio, de modo que no se necesitan ficheros auxiliares para la inferencia. El modelo base forma parte de la familia CLAP2, entrenada sobre el corpus LAION-Audio-XL (365 millones de pares audio-texto), y está pensado para tareas de retrieval y clasificación zero-shot, no para generación.

El modelo es pequeño (48,3 millones de parámetros, repo de 0,3 GB) y se distribuye en dos variantes de precisión, F32 y F16. No soporta cuantización por bloques de CLAP2 en esta versión. La licencia es Apache-2.0, heredada del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLAP2 (contrastive language-audio pretraining), doble codificador texto/audio con proyección a espacio compartido |
| Parametros totales | 48.307.585 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F32 y F16 (GGUF); cuantización por bloques de CLAP2 no soportada en esta release |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (F32 y F16); modelo base en safetensors |

## Arquitectura y entrenamiento

CLAP2 es una familia de modelos contrastivos audio-texto entrenados sobre LAION-Audio-XL, un corpus de 365 millones de pares audio-texto (1,39 millones de horas) seleccionado a partir de 1.480 millones de muestras de audio de datasets académicos, colecciones web, Common Crawl y YouTube. La familia CLAP2 se publica en cinco tamaños, de 27M a 340M parámetros; esta variante XS corresponde al extremo pequeño. El entrenamiento es contrastivo, alineando representaciones de audio y texto en un espacio común mediante similitud, sin que la información disponible detalle la composición exacta del dataset ni si hubo fases de RLHF o DPO (no aplicables habitualmente a modelos de embeddings).

La innovación práctica de esta conversión es el empaquetado: cada fichero GGUF contiene ambos codificadores, el tokenizador y la configuración del frontend de audio. El frontend trabaja a 32 kHz y acepta WAV, MP3 y FLAC, remuestreando según sea necesario. En la variante F16, las matrices de pesos 2D se almacenan en IEEE FP16, mientras que el resto de tensores y las activaciones nativas permanecen en F32. La validación se hizo contra la implementación oficial de CLAP2 fijada por revisión; las comparaciones F16 usan pesos de referencia redondeados al mismo almacenamiento, no los pesos F32 intactos, y establecen concordancia de implementación, no calidad de retrieval.

## Capacidades

- Generación de embeddings conjuntos de texto y audio en un espacio compartido de 320 dimensiones, L2-normalizado.
- Extracción de características de audio a partir de ficheros WAV, MP3 y FLAC con remuestreo automático a 32 kHz.
- Codificación de texto para consultas de búsqueda y comparación semántica con audio.
- Cálculo de similitud texto-audio y audio-audio mediante producto escalar de los vectores normalizados.
- Soporte para retrieval multimodal (búsqueda de audio por descripción textual y viceversa).
- Soporte para clasificación zero-shot de audio usando etiquetas textuales.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un modelo de embeddings, no generativo.
- Capacidades multilingües: no disponible en la información proporcionada.
- No dispone de modo thinking, visión ni audio generativo.

## Casos de uso

- Búsqueda de audio por texto: indexar una fonoteca con embeddings de audio y consultar con descripciones textuales; el espacio compartido de 320 dimensiones permite recuperar por producto escalar sin reentrenamiento.
- Etiquetado zero-shot de clips: comparar el embedding de cada audio con embeddings de etiquetas candidatas ("perro ladrando", "lluvia", "música clásica") y asignar la de mayor similitud, útil para triaje automático de grandes volúmenes.
- Deduplicación y clustering de audio: agrupar muestras similares en un corpus mediante similitud coseno sobre los vectores normalizados, por ejemplo para limpiar datasets de entrenamiento.
- Moderación de contenido sonoro: detectar categorías de audio no deseadas comparando contra un conjunto de prompts textuales definidos por política, sin necesidad de un clasificador supervisado específico.
- Enriquecimiento de metadatos en plataformas de podcast o música: generar descripciones y etiquetas a partir del audio para mejorar la búsqueda interna y las recomendaciones.
- Filtrado de datos para pipelines de ML: seleccionar pares audio-texto relevantes de un corpus web antes de entrenar otros modelos, usando la similitud texto-audio como criterio de calidad.
- Integración en aplicaciones de escritorio o edge: al ser un GGUF de 0,3 GB ejecutable con clap.cpp, puede desplegarse en entornos con recursos limitados sin servicio externo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo documenta validación determinista de concordancia con la implementación oficial de CLAP2, que no constituye una evaluación de calidad de retrieval.

## Requisitos de hardware

- VRAM estimada: el repo completo ocupa 0,3 GB; la inferencia de una sola variante (F32 o F16) requiere muy poca memoria, en el orden de cientos de MB, aunque no se dispone de cifras oficiales exactas.
- GPU recomendadas: cualquier GPU con suficiente memoria para el fichero elegido; no se especifican modelos concretos en la información disponible.
- Cabe en GPU de consumo: sí, por el tamaño del modelo (48,3M parámetros), aunque no se detallan modelos concretos.
- Opciones de despliegue: exclusivamente `clap.cpp` (commit `60def51cff6564eb35ef859487b1071d04e0ed52` o posterior compatible); no es compatible con llama.cpp, vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Dimension del embedding | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| clap2-xs-audioxl-s1B (esta ficha) | 48,3M | 320 | no disponible | Apache-2.0 | GGUF (F32/F16) |
| laion/larger_clap_music | no disponible | 512 | no disponible | no disponible | GGUF (via gorse-io) |
| Resto de la familia CLAP2 | 27M a 340M | no disponible | no disponible | Apache-2.0 (según modelo base) | safetensors (original) |

La información disponible solo permite comparar el tamaño del embedding (320 frente a 512 del modelo musical de LAION) y el formato; no hay datos de rendimiento comparativo.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto ni audio, solo embeddings; no debe usarse para tareas de generación.
- La model card no documenta sesgos conocidos del modelo base ni del corpus LAION-Audio-XL; el corpus web puede arrastrar sesgos de representación.
- Riesgo de alucinación no aplicable en sentido generativo, pero la similitud puede producir recuperaciones irrelevantes si el dominio de audio difiere del corpus de entrenamiento.
- Idiomas soportados no documentados; el rendimiento multilingüe es incierto.
- Longitud de contexto no disponible; no se especifica la duración máxima de audio procesable.
- La cuantización por bloques de CLAP2 no está soportada en esta release; solo hay F32 y F16.
- Requiere `clap.cpp`; no funciona con llama.cpp ni con runtimes de LLM convencionales.
- La licencia Apache-2.0 permite uso comercial, pero debe conservarse la atribución a LAION y respetarse la licencia de clap.cpp (también Apache-2.0).
- La validación publicada es de concordancia de implementación, no de calidad de retrieval; conviene evaluar en el dominio propio antes de producción.

## Enlaces

- Hugging Face (esta conversión): https://huggingface.co/gorse-io/clap2-xs-audioxl-s1B-GGUF
- Modelo base: https://huggingface.co/laion/clap2-xs-audioxl-s1B
- Repositorio clap.cpp: https://github.com/gorse-io/clap.cpp
- Repositorio CLAP2 de LAION: https://github.com/LAION-AI/clap2/
- Conversión relacionada (larger_clap_music): https://huggingface.co/gorse-io/larger_clap_music-GGUF
