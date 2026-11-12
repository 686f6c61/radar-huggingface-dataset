# mohammed-usmani/clipwright-4b

## Resumen

Clipwright 4B (V3) es un modelo de lenguaje especializado en la ejecución autónoma de tareas de procesamiento multimedia. Lo desarrolla el usuario independiente mohammed-usmani y se construye como un adaptador LoRA (r32, alpha 64, aplicado a todas las capas lineales) sobre el modelo base Qwen/Qwen3.5-4B, con 4.326.350.848 parámetros totales. Su propósito es resolver un problema muy concreto: orquestar herramientas de línea de comandos como ffmpeg, ffprobe, ImageMagick, SoX y ExifTool a través de una única herramienta `run(cmd, foreach)`, leer los resultados, corregir sus propios errores y devolver los ficheros de salida generados.

El modelo se entrenó sobre 12.095 ejemplos que cubren 46 tipos de trabajos reales (edición de vídeo, entrega para plataformas, audio, reparación de ficheros, imágenes, PDF, metadatos y privacidad). Cada ejemplo se ejecutó sobre ficheros reales y su salida se verificó antes de conservarlo. Es relevante para desarrolladores que necesitan automatizar pipelines multimedia con un agente local de tamaño reducido, desplegable con llama.cpp y con licencia Apache 2.0.

La distribución incluye el adaptador PEFT en safetensors, una versión GGUF Q8_0 con el LoRA ya fusionado (4,6 GB), el system prompt original y el esquema JSON de la herramienta en formato OpenAI. El contexto de entrenamiento e inferencia recomendado es de 32.768 tokens según el comando de arranque documentado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen/Qwen3.5-4B) con adaptador LoRA r32, alpha 64 sobre todas las capas lineales |
| Parámetros totales | 4.326.350.848 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (valor usado en el comando de llama.cpp documentado) |
| Tipos de cuantización | Q8_0 (GGUF publicado); el adaptador safetensors se puede cuantizar con las herramientas habituales de llama.cpp |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT), GGUF (Q8_0 con LoRA fusionado) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino mediante LoRA de bajo rango (r32, alpha 64) sobre Qwen3.5-4B, aplicado a todas las capas lineales. El entrenamiento consistió en una época sobre 12.095 ejemplos, ejecutada en una GPU Colab L4 durante 6 horas y 50 minutos. La particularidad metodológica es que cada ejemplo se ejecutó sobre ficheros reales y su salida se validó antes de incorporarlo al dataset, de modo que el modelo aprende secuencias de comandos que producen resultados verificables, no solo texto plausible.

El modelo está entrenado para operar en un bucle agente: recibe el system prompt original, el esquema de la herramienta `run` en formato OpenAI y una lista de ficheros de entrada bajo `Files:`, emite llamadas a `run`, recibe el resultado como mensaje de herramienta en JSON (con `exit_code`, `stdout` o `error` y un resumen de los ficheros en `out/`) y continúa hasta dejar de llamar a la herramienta. La sintaxis cubierta es ffmpeg 8 a 9 e ImageMagick 7 (comando `magick`). No se documentan innovaciones de decodificación especulativa ni atención lineal.

## Capacidades

- Ejecución de comandos de shell reales a través de la herramienta `run(cmd, foreach)`, con lectura e interpretación de la salida.
- Autocorrección: detecta errores en la salida de las herramientas y reformula los comandos.
- Edición de vídeo: cortes, superposiciones, crossfades, picture-in-picture y voiceovers.
- Entrega para plataformas: presets de codificación, límites de tamaño, subtítulos y miniaturas.
- Procesamiento de audio: limpieza, ducking, gestión de pausas y sincronización.
- Reparación de ficheros: VFR, entrelazado, relación de aspecto y ficheros dañados.
- Procesamiento de imágenes y PDF (con ImageMagick 7).
- Manipulación de metadatos y tareas de privacidad con ExifTool.
- Respuesta a preguntas sobre ficheros multimedia (propiedades, contenido, características técnicas).
- Gestión de ambigüedad: pregunta al usuario cuando la petición no está clara y declara cuándo algo no se puede hacer.
- Soporte de tool calling en formato OpenAI function calling.
- Razonamiento multi-paso y comportamiento agente en bucle hasta completar la tarea.

## Casos de uso

- Generación automática de previews y miniaturas: el modelo recibe la descripción del fichero de entrada y produce comandos ffmpeg para extraer un GIF o una miniatura con las dimensiones y duración solicitadas, verificando la salida.
- Preparación de entregas para plataformas sociales: aplica presets de codificación, ajusta el tamaño por debajo de un límite y genera subtítulos o thumbnails, aprovechando los 46 tipos de trabajos cubiertos en entrenamiento.
- Limpieza y normalización de audio en lote: usa SoX y ffmpeg para eliminar ruido, aplicar ducking o sincronizar pistas, con el bucle agente corrigiendo comandos fallidos.
- Reparación de ficheros problemáticos: detecta y corrige VFR, entrelazado, relación de aspecto incorrecta o ficheros parcialmente dañados, un caso en el que el modelo obtuvo 15/18 en la evaluación del autor.
- Saneado de metadatos y privacidad: elimina o reescribe metadatos EXIF con ExifTool antes de publicar material, un flujo adecuado para cumplir requisitos de privacidad.
- Procesamiento de imágenes y PDF en pipelines documentales: redimensionado, conversión y manipulación de páginas con ImageMagick 7, con verificación del número de páginas y dimensiones de salida.
- Asistente de consulta sobre ficheros: responde preguntas técnicas sobre un vídeo o audio (códecs, duración, resolución, pistas) leyendo la salida de ffprobe.
- Automatización de tareas de edición en un servidor con sandbox: al ser un modelo de 4B cuantizado a Q8_0, se puede desplegar en local con llama.cpp y ejecutar comandos en un entorno aislado con directorios `in/` de solo lectura y `out/` de escritura.

## Benchmarks y rendimiento

Evaluación del autor sobre 154 tareas escritas a mano (2 a 4 por tipo de trabajo), con ficheros no vistos en entrenamiento, decodificación greedy, una ejecución por tarea y hasta 15 comandos. Puntuación basada en la ejecución y verificación de la salida. Intervalos de Wilson al 95 % entre corchetes.

| Grupo de trabajo | Clipwright 4B | Clipwright V2 0.8B |
|---|---|---|
| Edición | 27/42 | 1/42 |
| Social y entrega | 18/24 | 7/24 |
| Audio | 17/23 | 3/23 |
| Reparación | 15/18 | 8/18 |
| Imágenes y PDF | 16/18 | 6/18 |
| Metadatos y privacidad | 7/9 | 2/9 |
| Preguntas sobre ficheros | 7/10 | 1/10 |
| Errores, ambigüedad, límites | 8/10 | 4/10 |
| **Total** | **115/154 (75 %) [67-81]** | 32/154 (21 %) [15-28] |

El autor indica que el 4B resuelve 85 tareas que V2 falla y falla 2 que V2 resuelve (test exacto pareado, p < 1e-21). El GGUF Q8_0 dio el mismo resultado que el adaptador sin fusionar en las 16 tareas de una comprobación aleatoria. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el GGUF Q8_0 ocupa 4,6 GB, por lo que requiere aproximadamente 5 a 6 GB de VRAM o memoria unificada, más el espacio para el contexto de 32.768 tokens.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para Q8_0; una RTX 4090, A100 o H100 permiten mayor throughput y contextos más largos.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más (por ejemplo, RTX 3060 Ti, RTX 4060, RTX 4070) usando el GGUF Q8_0; con cuantizaciones menores cabría en GPUs de 6 GB.
- Opciones de despliegue: llama.cpp mediante `llama-server -hf mohammed-usmani/clipwright-4b:Q8_0 --jinja -c 32768`; el adaptador PEFT se puede cargar sobre Qwen/Qwen3.5-4B con las librerías de Hugging Face y servirse con vLLM o TGI si se fusiona previamente.
- Latencia y throughput: no disponibles en la información proporcionada.
- Requisito adicional: el entorno de ejecución debe proporcionar un sandbox con `in/` de solo lectura y `out/` de escritura, y ejecutar los comandos que emite el modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Clipwright 4B | 4,33 B | 32.768 tokens | Agente multimedia con ffmpeg, ImageMagick, SoX y ExifTool | Apache 2.0 | Hugging Face (safetensors + GGUF) |
| Clipwright V2 0.8B | no disponible | no disponible | Misma familia, versión anterior y menor | Apache 2.0 (según el enlace del autor) | Hugging Face |
| Qwen3.5-4B (base) | ~4 B | no disponible | Modelo de propósito general | no disponible | Hugging Face |

La comparación con modelos de propósito general de tamaño similar no está disponible en la información proporcionada. La alternativa más directa documentada es la versión anterior V2 0.8B, claramente inferior en la evaluación del autor (21 % frente a 75 %).

## Limitaciones y advertencias

- Las ediciones dependientes de tiempos son el punto más débil: voiceover colocado en un instante concreto (0/4), inserción de un clip en una marca de tiempo (1/4), corte de un resumen alrededor de un momento (1/3), eliminación de pausas (1/3) y localización de marcas de tiempo (1/3).
- En 15 de las 154 tareas repitió tres veces el mismo comando fallido y se detuvo.
- Los ficheros de prueba son sintéticos; material real con códecs extraños o dañados puede dar peores resultados.
- Entrenado con sintaxis de ffmpeg 8 a 9 e ImageMagick 7 (`magick`); versiones distintas pueden provocar fallos.
- El modelo informa de lo que ha hecho, pero el autor recomienda verificar manualmente las salidas importantes.
- Riesgo de alucinación en la descripción de resultados o en la interpretación de la salida de las herramientas; la verificación debe hacerse sobre los ficheros generados.
- Ejecuta comandos de shell reales: es obligatorio desplegarlo en un sandbox con permisos restringidos y directorios de entrada de solo lectura.
- No se documentan sesgos conocidos ni cobertura de idiomas; la información sobre idiomas no está disponible.
- Licencia Apache 2.0, que permite uso comercial, pero sin garantías del autor sobre los resultados en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mohammed-usmani/clipwright-4b
- Versión anterior V2 0.8B: https://huggingface.co/mohammed-usmani/clipwright-0.8b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
