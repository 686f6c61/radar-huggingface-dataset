# Ray1239/clipwright-4b

## Resumen

Clipwright 4B (V3) es un modelo de lenguaje especializado en la ejecución autónoma de tareas de procesamiento multimedia. Lo desarrolla Ray1239 (Mohammed Usmani) y se construye como un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-4B, con 4.326.350.848 parámetros totales. Su función es convertir instrucciones en lenguaje natural sobre ficheros de vídeo, audio, imagen y PDF en secuencias de comandos de shell reales ejecutadas contra ffmpeg, ffprobe, ImageMagick, SoX y ExifTool, leyendo los resultados y corrigiendo sus propios errores en bucle hasta producir los ficheros de salida.

El modelo resuelve un problema concreto: la orquestación de herramientas multimedia de línea de comandos es propensa a errores de sintaxis, opciones incompatibles y rutas mal construidas. Clipwright encapsula todas esas herramientas en una única función `run(cmd, foreach)` y se entrena para razonar sobre el resultado de cada llamada, de modo que el agente puede detectar fallos, reformular comandos y verificar la salida antes de responder. Es relevante para pipelines de postproducción, automatización de catálogos de medios y tareas de reparación de ficheros, donde un modelo generalista suele fallar por desconocimiento de la sintaxis exacta de estas utilidades.

La arquitectura subyacente es un transformer denso de 4B parámetros con ventana de contexto de 32.768 tokens (según el comando de arranque recomendado con `-c 32768`). El modelo se distribuye bajo licencia Apache 2.0, con pesos en formato GGUF cuantizado Q8_0 y el adaptador PEFT en safetensors, y está etiquetado como compatible con endpoints y con llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.5-4B) con adaptador LoRA (r32, alpha 64, todas las capas lineales) |
| Parametros totales | 4.326.350.848 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (configuración recomendada `-c 32768`); no se especifica el máximo nativo del modelo base |
| Tipos de cuantizacion | Q8_0 (GGUF); el adaptador PEFT se distribuye sin cuantizar en safetensors |
| Idiomas soportados | No disponible (la model card no declara idiomas; el prompt de sistema y los ejemplos están en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q8_0, 4,6 GB) y safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino mediante LoRA de rango 32 y alpha 64 aplicado a todas las capas lineales de Qwen/Qwen3.5-4B, un transformer denso de 4B parámetros. El adaptador se fusiona en el modelo base para producir el GGUF Q8_0 distribuido, y también se publica por separado para cargarlo sobre el base original. La innovación no está en la arquitectura, sino en el esquema de interacción: una única herramienta `run(cmd, foreach)` que ejecuta comandos de shell en un sandbox, con entradas en `in/` (solo lectura) y salidas en `out/`, y un bucle de tool calling en el que el modelo recibe `exit_code`, `stdout` o `error` y un resumen de los ficheros generados.

El entrenamiento se realizó sobre 12.095 ejemplos que cubren 46 tipos de trabajos reales: edición (cortes, superposiciones, crossfades, picture-in-picture, voiceovers), entrega (presets de plataforma, límites de tamaño, subtítulos, miniaturas), audio (limpieza, ducking, pausas, sincronización), reparación (VFR, entrelazado, relación de aspecto, ficheros corruptos), imágenes, PDF, metadatos y privacidad. La model card indica que cada ejemplo se ejecutó sobre ficheros reales y su salida se verificó antes de conservarlo. El entrenamiento consistió en una época sobre una GPU Colab L4 con una duración de 6 horas y 50 minutos. No se especifica el número de tokens de entrenamiento ni la composición exacta del dataset más allá de la taxonomía de tareas.

## Capacidades

- Generación de comandos de shell para ffmpeg, ffprobe, ImageMagick (`magick`), SoX y ExifTool, con sintaxis verificada contra las versiones 8-9 de ffmpeg y 7 de ImageMagick.
- Tool calling mediante una única función `run(cmd, foreach)` en formato OpenAI, con soporte de ejecución iterativa y corrección de errores a partir de `exit_code` y `stdout`.
- Razonamiento multi-paso: lee el resultado de cada comando, reformula si falla y continúa hasta completar la tarea o determinar que no es posible.
- Edición de vídeo: cortes, superposiciones, crossfades, picture-in-picture y colocación de voiceovers.
- Entrega para plataformas: presets de codificación, ajuste a límites de tamaño, incrustación de subtítulos y generación de miniaturas.
- Procesamiento de audio: limpieza de ruido, ducking, eliminación de pausas y sincronización.
- Reparación de medios: corrección de VFR, desentrelazado, ajuste de relación de aspecto y recuperación de ficheros dañados.
- Procesamiento de imágenes y PDF: conversión, manipulación y recuento o extracción de páginas.
- Gestión de metadatos y privacidad con ExifTool.
- Respuesta a preguntas sobre ficheros (propiedades, contenido, características técnicas).
- Detección de ambigüedad: solicita aclaración cuando la petición no es ejecutable tal cual.
- Declaración explícita de límites: indica cuándo una tarea no se puede realizar.

## Casos de uso

- Automatización de postproducción de vídeo: el modelo recibe una instrucción como "haz un preview de 10 segundos en GIF de talk.mp4" y genera la secuencia de ffmpeg adecuada, verifica la duración y las dimensiones del resultado y corrige si el comando falla. Es adecuado porque conoce la sintaxis exacta de ffmpeg 8-9 y comprueba la salida antes de responder.
- Preparación de entregables para plataformas sociales: aplica presets de codificación, ajusta el bitrate para respetar límites de tamaño e incrusta subtítulos, tareas en las que el modelo alcanza 18/24 en la evaluación del autor.
- Limpieza y normalización de audio: eliminación de ruido, ducking de música bajo voz y sincronización de pistas mediante SoX y ffmpeg, con verificación de loudness y silencios en la salida.
- Reparación de catálogos de medios heredados: corrección de ficheros con VFR, entrelazado o relación de aspecto incorrecta, un grupo de tareas en el que el modelo resuelve 15/18 casos de la evaluación.
- Procesamiento por lotes de imágenes y PDF: conversión de formatos, redimensionado y extracción de páginas con ImageMagick, con recuento de páginas verificado.
- Saneado de metadatos y privacidad antes de publicar material: eliminación de coordenadas GPS, autoría y otra información sensible con ExifTool, grupo en el que obtiene 7/9.
- Asistente de consulta sobre ficheros: responde preguntas técnicas sobre un medio (códecs, resolución, duración, pistas de audio) ejecutando ffprobe y leyendo la salida.
- Integración en pipelines de CI/CD de medios: al exponer una API compatible con OpenAI y funcionar con llama.cpp, puede desplegarse como servicio que recibe ficheros y devuelve artefactos procesados en `out/`.

## Benchmarks y rendimiento

La model card reporta una evaluación propia de 154 tareas escritas a mano (2 a 4 por tipo de trabajo) sobre ficheros no vistos en entrenamiento, con decodificación greedy, una ejecución por tarea y hasta 15 comandos. Cada tarea se puntúa ejecutando los comandos del modelo y comprobando la salida (duración, dimensiones, códecs, loudness, fotogramas en instantes dados, pitch, silencio, sincronización, metadatos, número de páginas o hechos en una respuesta escrita). Se incluyen 21 soluciones deliberadamente incorrectas que son rechazadas por las comprobaciones. Los intervalos son de Wilson al 95%.

| Grupo de tareas | Clipwright 4B | Clipwright V2 0.8B |
|---|---|---|
| Edición | 27/42 | 1/42 |
| Social y entrega | 18/24 | 7/24 |
| Audio | 17/23 | 3/23 |
| Reparación | 15/18 | 8/18 |
| Imágenes y PDF | 16/18 | 6/18 |
| Metadatos y privacidad | 7/9 | 2/9 |
| Preguntas sobre ficheros | 7/10 | 1/10 |
| Errores, ambigüedad, límites | 8/10 | 4/10 |
| **Total** | **115/154, 75% [67-81]** | 32/154, 21% [15-28] |

El 4B resuelve 85 tareas que V2 falla y falla 2 que V2 resuelve (test exacto pareado, p < 1e-21). El GGUF Q8_0 ofrece el mismo resultado que el adaptador sin fusionar en las 16 tareas de una comprobación aleatoria. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el GGUF Q8_0 ocupa 4,6 GB, por lo que requiere aproximadamente 5-6 GB de VRAM o memoria unificada, más el espacio para el contexto de 32.768 tokens.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para Q8_0 con contexto completo; A100, H100 o L4 para despliegues concurrentes. El entrenamiento se realizó en una Colab L4.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más (RTX 3060 8 GB, RTX 4060, RTX 4070, RTX 4090) usando llama.cpp. En GPUs con menos memoria puede recurrirse a cuantizaciones menores, aunque no se distribuyen en el repositorio.
- Opciones de despliegue: llama.cpp mediante `llama-server -hf Ray1239/clipwright-4b:Q8_0 --jinja -c 32768`; el adaptador PEFT puede cargarse sobre Qwen/Qwen3.5-4B con las librerías de Hugging Face. El modelo está etiquetado como compatible con endpoints.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Clipwright 4B (V3) | 4,33B | 32.768 | Agente multimedia (ffmpeg, ImageMagick, SoX, ExifTool) | Apache 2.0 | Hugging Face (GGUF + PEFT) |
| Clipwright V2 0.8B | 0,8B (aproximado) | No disponible | Agente multimedia, misma familia | No disponible | Hugging Face |
| Qwen/Qwen3.5-4B | 4B | No disponible | Modelo generalista base | No disponible | Hugging Face |

La comparación directa con modelos generalistas de tamaño similar no está disponible en la información proporcionada. El único punto de referencia cuantitativo es Clipwright V2 0.8B, que obtiene 32/154 (21%) frente a 115/154 (75%) del 4B en la evaluación del autor.

## Limitaciones y advertencias

- Las ediciones dependientes de marcas temporales son el punto más débil: voiceover colocado en un instante concreto (0/4), inserción de un clip en un timestamp (1/4), corte de un highlight alrededor de un momento (1/3), eliminación de pausas (1/3) y localización de timestamps (1/3).
- En 15 de las 154 tareas repitió el mismo comando fallido tres veces hasta ser detenido, lo que puede generar bucles improductivos en producción si no se impone un límite de iteraciones.
- Los ficheros de prueba son sintéticos; material real con códecs poco habituales o daño puede degradar el rendimiento.
- Entrenado sobre sintaxis de ffmpeg 8-9 e ImageMagick 7 (`magick`); versiones anteriores o distintas pueden producir comandos inválidos.
- El modelo informa de lo que ha hecho, pero la model card recomienda verificar manualmente las salidas importantes.
- Riesgo de alucinación en la descripción de resultados: puede afirmar propiedades de los ficheros generados que no coincidan con la salida real si no se valida el contenido de `out/`.
- Es imprescindible ejecutarlo en un sandbox: genera comandos de shell reales con capacidad de escritura en el sistema de ficheros.
- No se declaran idiomas soportados; el prompt de sistema y los ejemplos están en inglés, por lo que el uso en castellano no está validado.
- Licencia Apache 2.0: permite uso comercial, pero no se ofrece garantía ni soporte del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ray1239/clipwright-4b
- Modelo V2 0.8B: https://huggingface.co/Ray1239/clipwright-0.8b
- Perfil del autor: https://huggingface.co/Ray1239/models
- Modelo previo ffmpeg-model del autor: https://huggingface.co/Ray1239/ffmpeg-model
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
