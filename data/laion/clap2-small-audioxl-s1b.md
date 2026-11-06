# laion/clap2-small-audioxl-s1B

## Resumen

CLAP2-S es un modelo contrastivo audio-texto desarrollado por LAION que proyecta clips de audio y descripciones en ingles a un espacio de embeddings compartido. Forma parte de la familia CLAP2, compuesta por cinco tamanos (27M a 340M parametros), y esta disenado para tareas de recuperacion audio-texto, clasificacion zero-shot de audio y extraccion de embeddings de audio genericos. Este repositorio concreto corresponde al tamano S, con 103,9 millones de parametros en total entre las dos torres.

El modelo resuelve el problema de conectar modalidades de audio y lenguaje sin necesidad de entrenamiento supervisado especifico por tarea: basta con describir verbalmente las clases de interes para obtener clasificacion zero-shot, o comparar embeddings para recuperacion. Es relevante porque se entrena desde cero sobre LAION-Audio-XL, un corpus de 366 millones de pares audio-texto, y porque su torre de audio es un transformer de vision NaFlex que acepta audio de cualquier duracion sin recorte ni padding a una longitud fija.

La arquitectura combina una torre de audio (transformer NaFlex sobre parches de log-mel) y una torre de texto, ambas mapeadas a un espacio comun. Se distribuye en formato OpenCLIP y tambien en formato Transformers (`Clap2Model`, `Clap2Processor`), aunque el soporte en Transformers esta pendiente de release. La licencia es Apache 2.0 y el unico idioma declarado es el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Contrastiva audio-texto de dos torres; torre de audio NaFlex vision transformer sobre parches de log-mel |
| Parametros totales | 103.896.960 (ambas torres) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (audio de cualquier duracion; en evaluacion se limita a los primeros 30 s con `max_num_patches=1504`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors; formatos OpenCLIP y Transformers |

## Arquitectura y entrenamiento

CLAP2-S es un modelo contrastivo de dos torres. La torre de audio es un transformer de vision NaFlex que opera sobre parches de un espectrograma log-mel de 128 bins (50 Hz a 16 kHz, ventana de 320 muestras), lo que permite procesar audio de cualquier longitud sin recorte ni padding a una longitud fija y producir un unico embedding por clip. La torre de texto procesa las descripciones en ingles y proyecta ambos tipos de embedding a un espacio compartido donde se comparan por similitud coseno.

Todos los modelos de la familia se entrenaron desde cero sobre LAION-Audio-XL, un corpus de 366 millones de pares audio-texto, durante 1.024 millones de muestras vistas con un schedule de learning rate WSD (ultimo checkpoint). No se detalla en la informacion disponible si hubo etapas de RLHF o DPO; al ser un modelo contrastivo, el objetivo de entrenamiento es la perdida contrastiva entre pares audio-texto. El preprocesado interno mezcla a mono y remuestrea a 32 kHz, y el enmascaramiento por `patch_valid` permite batchear clips de distinta duracion sin alterar los embeddings respecto al procesado individual.

## Capacidades

- Extraccion de embeddings de audio y de texto en un espacio compartido (pipeline `feature-extraction`).
- Recuperacion audio-texto en ambas direcciones (buscar audio por descripcion y viceversa).
- Clasificacion zero-shot de audio mediante descripciones textuales de las clases.
- Clasificacion zero-shot con multiples prompts por clase y agregacion por media de embeddings.
- Procesamiento de audio de cualquier sample rate y numero de canales (mezcla a mono y remuestreo a 32 kHz interno).
- Procesamiento de audio de cualquier duracion, con posibilidad de limitar a los primeros 30 s.
- Uso como embeddings genericos de audio para tareas posteriores (clustering, pair classification, retrieval).
- Cobertura de dominios de voz, musica y sonidos segun los benchmarks reportados (MAEB-30, HEAR-17, MSEB).
- No soporta tool calling, agentes ni generacion de texto: es un modelo de representacion, no un LLM.

## Casos de uso

- Clasificacion zero-shot de eventos sonoros: describir cada clase con varias frases ("A cello plays a slow melody.", "A man gives a lecture.") y asignar la clase de mayor similitud coseno, sin entrenar un clasificador especifico.
- Etiquetado automatico de archivos de audio en catalogos musicales o de efectos: generar embeddings de cada clip y compararlos con descripciones textuales para poblar metadatos.
- Busqueda semantica de audio: indexar embeddings de una fonoteca y recuperar clips a partir de consultas en lenguaje natural, gracias al espacio compartido audio-texto.
- Moderacion y filtrado de contenido audiovisual: detectar categorias de sonido (aplausos, gritos, musica de fondo) mediante prompts descriptivos y umbrales relativos entre clases.
- Construccion de datasets y curaduria: usar los embeddings como caracteristica para clustering y deduplicacion de grandes colecciones de audio antes de anotacion humana.
- Sistemas de recomendacion basados en contenido: representar clips y descripciones de usuario en el mismo espacio para calcular afinidad sin depender de metadatos manuales.
- Preprocesado para pipelines multimodales: servir como extractor de caracteristicas de audio en modelos posteriores que consuman embeddings de 103,9M de parametros, con bajo coste de inferencia.

## Benchmarks y rendimiento

Resultados publicados en la model card (porcentajes, mayor es mejor):

| Modelo | Parametros | MAEB-30 | HEAR-17 | MSEB |
|---|---|---|---|---|
| CLAP2-L | 340,1M | 53,6 | 81,9 | 30,3 |
| CLAP2-M | 152,8M | 52,3 | 81,4 | 29,4 |
| CLAP2-S (este) | 103,9M | 51,8 | 81,8 | 29,8 |
| CLAP2-XS | 48,3M | 49,1 | 80,6 | 27,6 |
| CLAP2-XXS | 27,3M | 46,2 | 79,1 | 28,0 |

MAEB-30 es la media sobre 30 tareas del Massive Audio Embedding Benchmark (voz, musica y sonido; clasificacion, clasificacion zero-shot, pair classification, clustering y retrieval). HEAR-17 es la media sobre 17 tareas HEAR (todas excepto Beehive y Maestro 5h). MSEB es la media sobre 62 puntuaciones MSEB en ingles. No se han publicado en la informacion disponible resultados de MMLU, HumanEval ni GSM8K, que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 103,9M de parametros (aproximadamente 0,42 GB de pesos mas activaciones); el repo completo ocupa 0,8 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no requiere A100 ni H100 para inferencia.
- Cabe en GPU consumer: si, en cualquier GPU con al menos 2 GB de VRAM (GTX 1650, RTX 3060, RTX 4090, etc.), e incluso en CPU para lotes pequenos.
- Opciones de despliegue: OpenCLIP desde la rama `main` de `mlfoundations/open_clip` (no disponible aun en releases de PyPI); soporte en Transformers (`Clap2Model`, `Clap2Processor`) pendiente de release. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MAEB-30 | HEAR-17 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| CLAP2-S | 103,9M | audio de cualquier duracion | 51,8 | 81,8 | apache-2.0 | HuggingFace (OpenCLIP, Transformers pendiente) |
| CLAP2-M | 152,8M | audio de cualquier duracion | 52,3 | 81,4 | apache-2.0 | HuggingFace |
| CLAP2-XS | 48,3M | audio de cualquier duracion | 49,1 | 80,6 | apache-2.0 | HuggingFace |
| CLAP2-L | 340,1M | audio de cualquier duracion | 53,6 | 81,9 | apache-2.0 | HuggingFace |

La comparativa se limita a los miembros de la propia familia CLAP2, unicos modelos con datos disponibles en la informacion proporcionada. No se dispone de datos de otros modelos audio-texto comparables en esta ficha.

## Limitaciones y advertencias

- Solo soporta ingles: las descripciones textuales deben redactarse en ingles para obtener resultados fiables.
- Riesgo de sesgo heredado del corpus LAION-Audio-XL (366M de pares audio-texto), cuya composicion y filtrado no se detallan en la informacion disponible.
- Las similitudes coseno son pequenas en valor absoluto; deben compararse entre textos, no contra un umbral fijo, y para probabilidades conviene aplicar `logit_scale.exp()` y softmax.
- El rendimiento zero-shot depende fuertemente de la redaccion de los prompts: se recomiendan frases completas, evitar etiquetas desnudas y negaciones, y promediar varios prompts por clase.
- En evaluacion se limita el audio a los primeros 30 s (`max_num_patches=1504`); clips mas largos pueden no representarse completamente.
- El soporte en Transformers esta pendiente y no incluido en ningun release; el uso via OpenCLIP requiere la rama `main`, lo que implica riesgo de cambios de API.
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso.
- Licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar las obligaciones de atribucion y las condiciones del corpus de entrenamiento.
- Modelo con muy pocas descargas (14) y sin likes en el momento de la consulta: ecosistema y validacion externa limitados.

## Enlaces

- HuggingFace: https://huggingface.co/laion/clap2-small-audioxl-s1B
- Repositorio OpenCLIP: https://github.com/mlfoundations/open_clip
- Modelo CLAP2-L: https://huggingface.co/laion/clap2-large-audioxl-s1B
- Modelo CLAP2-M: https://huggingface.co/laion/clap2-medium-audioxl-s1B
- Modelo CLAP2-XS: https://huggingface.co/laion/clap2-xs-audioxl-s1B
- Modelo CLAP2-XXS: https://huggingface.co/laion/clap2-xxs-audioxl-s1B
- Paper: no disponible en la informacion proporcionada (la model card lo referencia sin enlace explicito)
