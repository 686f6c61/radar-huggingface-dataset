# Ray1239/clipwright-4b

## Resumen

Clipwright 4B es un adaptador LoRA sobre Qwen3.5-4B especializado en la ejecución autónoma de tareas de procesamiento multimedia mediante herramientas de línea de comandos. Lo desarrolla Ray1239 (Mohammed Usmani) y resuelve un problema concreto: que un modelo de 4B parámetros sea capaz de encadenar llamadas a ffmpeg, ffprobe, ImageMagick, SoX y ExifTool dentro de un bucle agente, leer los resultados, verificar su propio trabajo y corregir errores antes de entregar los ficheros de salida.

El modelo se distribuye como adaptador PEFT (rango 32, alpha 64, sobre todas las capas lineales) y también en formato GGUF cuantizado para su uso directo con llama.cpp. Su entrenamiento combina SFT sobre 12.095 ejemplos verificados (46 tipos de trabajos multimedia) con dos rondas de GRPO cuyo reward es la comprobación automática del fichero de salida contra una especificación oculta, lo que lo convierte en un caso interesante de RL con verificación real de resultados en lugar de preferencias humanas.

Es relevante ahora porque demuestra que un modelo pequeño, con un entrenamiento bien diseñado y un único tool genérico (`run(cmd, foreach)`), puede resolver tareas de postproducción multimedia de forma fiable en hardware de consumo, con una tasa de éxito del 89% en su benchmark interno de 368 tareas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-4B) con adaptador LoRA (r=32, alpha=64, todas las capas lineales) |
| Parametros totales | 4.326.350.848 (modelo base); el adaptador LoRA se suma sobre los pesos congelados |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (configuración recomendada en llama.cpp: `-c 32768`) |
| Tipos de cuantizacion | Q8_0 (4,6 GB), Q5_K_M (3,2 GB); Q4_K_M existe pero no se publica por pérdida de ~5 puntos |
| Idiomas soportados | no disponible (la model card no especifica idiomas; hereda los del base Qwen3.5-4B) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT), GGUF (Q8_0, Q5_K_M) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre Qwen3.5-4B, un transformer decoder-only de 4.326 millones de parámetros. El adaptador se aplica a todas las capas lineales con rango 32 y alpha 64. El entrenamiento se realizó en cuatro etapas sobre Google Colab: primero SFT sobre 12.095 ejemplos verificados que cubren 46 tipos de trabajos multimedia (una época en L4); después 100 pasos de GRPO con 8 tareas × 8 intentos por paso y reward binario (1 si la salida pasa la verificación, con penalización menor por pasos extra); a continuación una segunda fase de SFT sobre 2.318 filas nuevas que enseñan un paso de comprobación tras escribir la salida y la recuperación ante comandos fallidos, más 1.500 filas de replay para evitar olvido catastrófico (LR 3e-5); y finalmente 100 pasos de GRPO v7 con 16 tareas × 8 intentos, un pool ponderado hacia los tipos de trabajo más débiles, omisión de tareas ya resueltas al 100%, LR 1e-5 y sin término KL (A100).

La innovación técnica central es la verificación estricta: cada ejemplo de entrenamiento se ejecutó sobre ficheros reales y su salida se comprobó contra una especificación oculta (duración, dimensiones, códecs, loudness, frames en instantes concretos, pitch, silencio, sincronía, metadatos, número de páginas o hechos en una respuesta escrita) antes de conservarse. El mismo chequeo se usa como reward en GRPO. El modelo opera con un único tool `run(cmd, foreach)` en formato OpenAI function calling, ejecutado en un sandbox sin red y con entradas de solo lectura.

## Capacidades

- Generación de comandos de ffmpeg y ffprobe para edición de vídeo y audio: recorte, conversión, extracción de frames, generación de GIFs, cambio de resolución y códec.
- Procesamiento de imágenes y PDF con ImageMagick 7 (`magick`): redimensionado, conversión de formato, composición, extracción de páginas.
- Procesamiento de audio con SoX: normalización de loudness, cambio de pitch, eliminación de silencios, conversión de sample rate.
- Lectura y escritura de metadatos con ExifTool, incluyendo tareas de privacidad (eliminación de metadatos sensibles).
- Bucle agente multi-paso: ejecuta un comando, lee el resultado, comprueba la salida contra la petición y corrige errores de forma autónoma.
- Tool calling en formato OpenAI function calling con el esquema `run(cmd, foreach)`.
- Respuesta a preguntas sobre ficheros (duración, resolución, códecs, metadatos) sin necesidad de modificarlos.
- Gestión de ambigüedad: pregunta cuando la petición no está clara y declara cuándo algo no se puede hacer.
- Capacidades multilingües: no disponibles de forma explícita (heredadas del base Qwen3.5-4B).

## Casos de uso

- Postproducción automatizada de vídeo para redes sociales: el modelo recibe un vídeo y una petición como "haz un preview de 10 segundos en GIF" y encadena ffmpeg y ffprobe para recortar, redimensionar y convertir, verificando duración y dimensiones del resultado antes de entregarlo.
- Normalización de audio para podcasting: usa SoX para aplicar loudness normalization, eliminar silencios y convertir sample rate, comprobando el resultado con ffprobe y corrigiendo si la duración o el nivel no coinciden con lo pedido.
- Procesamiento por lotes de imágenes para catálogo de e-commerce: recibe un directorio de imágenes y aplica redimensionado, conversión de formato y limpieza de metadatos con ImageMagick y ExifTool, con el modo `foreach` del tool para iterar sobre múltiples ficheros.
- Limpieza de metadatos por privacidad antes de publicar documentos: usa ExifTool para eliminar EXIF, GPS y metadatos de autor de imágenes y PDFs, verificando después que los campos sensibles han desaparecido.
- Extracción de información de ficheros multimedia: responde preguntas como "¿cuántos frames por segundo tiene este vídeo?" o "¿qué codec de audio usa?" ejecutando ffprobe y devolviendo los datos en lenguaje natural.
- Reparación de ficheros dañados o mal codificados: el modelo detecta comandos fallidos, lee el error y reintenta con una sintaxis alternativa, una capacidad entrenada explícitamente en la fase SFT v7b.
- Automatización de pipelines de entrega a plataformas: convierte un master a los formatos y resoluciones exigidos por cada plataforma (H.264, AAC, 1080p, 30fps) verificando códec, dimensiones y duración de cada salida.

## Benchmarks y rendimiento

Resultados publicados por el autor. Todas las puntuaciones se obtienen ejecutando los comandos del modelo y comprobando los ficheros de salida. Decodificación greedy, una ejecución por tarea, hasta 15 comandos.

**test_v3** (368 tareas sobre 46 tipos de trabajo, medios retenidos, peticiones reformuladas por otro modelo):

| Modelo | Test (230) | Dev (138) | Total | Detenido por bucle |
|---|---|---|---|---|
| V4 | 191 | 114 | 305 (83%) | 16 |
| SFT v7b | 204 | 117 | 321 (87%) | 15 |
| GRPO v7 (esta revisión) | 208 | 121 | 329 (89%) | 8 |

**test_v2** (154 tareas escritas a mano, medios retenidos):

| Grupo de trabajo | GRPO v7 | V4 |
|---|---|---|
| Edición | 35/42 | 33/42 |
| Social y entrega | 20/24 | 19/24 |
| Audio | 20/23 | 19/23 |
| Reparación | 18/18 | 17/18 |
| Imágenes y PDFs | 18/18 | 17/18 |
| Metadatos y privacidad | 8/9 | 7/9 |
| Preguntas sobre ficheros | 8/10 | 8/10 |
| Errores, ambigüedad, límites | 10/10 | 9/10 |
| Total | 137/154 (89%) | 129/154 (84%) |

**Cuantización** (test_v3 dev, 138 tareas, llama.cpp en Mac): Q5_K_M 126, Q8_0 125, Q4_K_M 118.

Como referencia, el modelo profesor de 27B que generó los datos de entrenamiento originales obtuvo 119/154 en test_v2.

## Requisitos de hardware

- VRAM estimada: Q5_K_M requiere aproximadamente 3,2 GB de pesos más overhead de contexto; Q8_0 requiere aproximadamente 4,6 GB más overhead. Con contexto de 32.768 tokens, el consumo total de KV cache añade varios GB adicionales.
- GPU recomendadas: cualquier GPU con 8 GB o más para Q8_0; 6 GB para Q5_K_M. Entrenado en Colab L4 (SFT) y A100 (GRPO final).
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090 y Apple Silicon con 8 GB o más de memoria unificada.
- Opciones de despliegue: llama.cpp (`llama-server -hf mohammed-usmani/clipwright-4b:Q8_0 --jinja -c 32768`), y el adaptador PEFT sobre Qwen3.5-4B con transformers. La web app del repositorio de GitHub (`app/run.sh`) ejecuta el bucle agente completo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Clipwright 4B (GRPO v7) | 4,3B | 32.768 | Agente multimedia con ffmpeg/ImageMagick/SoX/ExifTool | Apache 2.0 | Hugging Face (GGUF + PEFT) |
| Qwen3.5-4B (base) | 4,3B | no disponible | Modelo generalista | Apache 2.0 | Hugging Face |
| Profesor de 27B del autor | 27B | no disponible | Generación de datos de entrenamiento; 119/154 en test_v2 | no disponible | no disponible |

No se dispone de comparativas publicadas frente a otros modelos especializados en tool calling multimedia en la información proporcionada.

## Limitaciones y advertencias

- La principal carencia es la cobertura más allá de los 46 tipos de trabajo entrenados: en peticiones basadas en preguntas de Stack Exchange retenidas acierta 135 de 172 (78%), y solo 16 de 30 (53%) cuando el trabajo requiere un filtro raro en sus datos de entrenamiento.
- En pruebas manuales falló en la creación de un GIF a partir de frames concretos, en un efecto de voz robótica y en peticiones vagas de "limpiar el ruido".
- Puede declarar "Done" sobre una salida que no coincide plenamente con la petición; hay que verificar manualmente las salidas importantes.
- Los ficheros de test son sintéticos, por lo que material real con códecs extraños o dañados puede dar peores resultados.
- Entrenado con sintaxis de ffmpeg 8 a 9 e ImageMagick 7 (`magick`); versiones anteriores pueden generar comandos incompatibles.
- Requiere ejecución en sandbox (sin red, entradas de solo lectura): los comandos que genera son reales y pueden modificar o borrar ficheros.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen3.5-4B tiene su propia licencia que debe verificarse por separado.
- Riesgo de alucinación en respuestas sobre ficheros: puede describir propiedades de un fichero sin haber ejecutado ffprobe; conviene forzar la llamada al tool.
- Idiomas soportados no documentados; el rendimiento en castellano no está evaluado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ray1239/clipwright-4b
- Repositorio de código, entorno y evaluaciones: https://github.com/mohammed-usmani/clipwright
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Revisión v3 (solo SFT): tag `v3` en el repositorio de Hugging Face
- Revisión v4 (primer GRPO): tag `v4` en el repositorio de Hugging Face
