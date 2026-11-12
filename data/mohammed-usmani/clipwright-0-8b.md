# mohammed-usmani/clipwright-0.8b

## Resumen

Clipwright 0.8B (V2) es un modelo de lenguaje especializado en la ejecución autónoma de tareas de procesamiento multimedia. Desarrollado por el usuario mohammed-usmani, se construye como un adaptador LoRA sobre el modelo base Qwen3.5-0.8B y está diseñado para orquestar herramientas de línea de comandos como ffmpeg, ffprobe, ImageMagick, SoX y ExifTool a través de una única herramienta `run(cmd, foreach)` ejecutada en un entorno sandbox.

El modelo resuelve un problema concreto: traducir instrucciones en lenguaje natural sobre edición de vídeo, audio e imágenes en secuencias de comandos de shell correctas, ejecutarlas, leer los resultados y devolver los archivos generados. A diferencia de modelos generalistas que pueden alucinar sintaxis de ffmpeg, Clipwright ha sido entrenado exclusivamente con ejemplos ejecutados sobre archivos reales y verificados, lo que reduce drásticamente los errores de sintaxis y de parámetros.

Con 772.845.888 parámetros (aproximadamente 0,8B), un contexto de 32.768 tokens y licencia Apache 2.0, el modelo es relevante ahora porque demuestra que un modelo de menos de mil millones de parámetros, mediante un ajuste fino cuidadoso con datos verificados, puede superar a modelos de 7B en tareas específicas de tool-use para medios. Su formato GGUF Q8_0 (834 MB) permite desplegarlo en hardware de consumo con llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-0.8B) con adaptador LoRA (r32, alpha 64, todas las capas lineales) |
| Parametros totales | 772.845.888 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | Q8_0 (GGUF); adaptador PEFT en safetensors |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador LoRA) y GGUF (Q8_0, modelo fusionado) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B, un transformer decoder-only de aproximadamente 0,8B parámetros. Sobre él se aplica un adaptador LoRA con rango 32, alpha 64, aplicado a todas las capas lineales, que representa el 2,8% de los pesos. El adaptador se fusiona con el modelo base para producir el archivo GGUF Q8_0 de 834 MB, que según el autor iguala al LoRA en una comprobación puntual de 40 tareas.

El entrenamiento se realizó sobre 8.728 ejemplos: 7.154 de un solo paso y 1.574 de múltiples pasos. La innovación principal es la metodología de datos: cada ejemplo fue ejecutado sobre archivos reales y su salida fue verificada antes de conservarse. Se completó una época en una Colab L4 en 2 horas y 12 minutos. El modelo fue entrenado con un system prompt específico y un esquema de herramienta `run` en formato OpenAI function calling, que deben usarse tal cual para reproducir el comportamiento esperado. Está entrenado con la sintaxis de ffmpeg 8.

## Capacidades

- Generación de comandos ffmpeg y ffprobe para transcodificación, recorte, escalado, cambio de códec, extracción de audio, generación de GIFs y análisis de metadatos.
- Generación de comandos ImageMagick para manipulación de imágenes (redimensionado, conversión de formato, composición).
- Generación de comandos SoX para procesamiento de audio (normalización, cambio de frecuencia, efectos).
- Generación de comandos ExifTool para lectura y escritura de metadatos.
- Tool calling mediante una única herramienta `run(cmd, foreach)` en formato OpenAI function calling.
- Ejecución multi-paso: encadena varias llamadas a `run` leyendo los resultados intermedios hasta completar la tarea.
- Autoverificación parcial mediante ffprobe de los archivos de salida (aunque no compara de forma fiable el resultado con la petición original).
- Capacidad de razonamiento multi-step para tareas que requieren varios comandos secuenciales.
- Capacidades multilingües: no disponible.

## Casos de uso

- Generación de previews y clips: el modelo traduce peticiones como "haz un GIF de 10 segundos de talk.mp4" en comandos ffmpeg con parámetros correctos de duración, escala y tasa de fotogramas, leyendo los metadatos del archivo de entrada incluidos en el mensaje.
- Transcodificación por lotes: gracias a la herramienta `run(cmd, foreach)`, puede aplicar una misma operación (por ejemplo, convertir a H.264 con un bitrate objetivo) sobre múltiples archivos de entrada listados en `Files:`, escribiendo las salidas en `out/`.
- Extracción y normalización de audio: genera cadenas de ffmpeg y SoX para extraer la pista de audio de un vídeo, convertirla a un formato concreto y normalizar la sonoridad, verificando el resultado con ffprobe.
- Procesamiento de imágenes en pipelines: usa ImageMagick para redimensionar, convertir o componer imágenes dentro de un flujo automatizado, con salida verificable en disco.
- Limpieza y auditoría de metadatos: emplea ExifTool para leer, modificar o eliminar metadatos EXIF de archivos multimedia, útil en flujos de publicación que requieren privacidad o cumplimiento.
- Automatización de tareas de medios en CI/CD o scripts: al ser un modelo pequeño (834 MB en Q8_0) y ejecutable con llama.cpp, puede integrarse como agente local en un pipeline que recibe archivos, ejecuta comandos en sandbox y valida las salidas antes de publicarlas.
- Asistente de línea de comandos para medios: interfaz conversacional que traduce peticiones en lenguaje natural a comandos de ffmpeg/ImageMagick/SoX/ExifTool, reduciendo la necesidad de consultar documentación.

## Benchmarks y rendimiento

Evaluación basada en ejecutar los comandos del modelo y verificar los archivos de salida (duración, dimensiones, códecs, sonoridad, tamaño y metadatos). Decodificación greedy, una ejecución por tarea. Intervalos de Wilson al 95% entre corchetes.

| Modelo | Single-step (850) | Solo ffmpeg (542) | Multi-step (100) | Escritas a mano (45) |
|---|---|---|---|---|
| Qwen3.5-0.8B base | 3%* | 2%* | 0% | 4% |
| V1: Qwen2.5-Coder-7B + datos públicos burak29 | 46% [43–50] | 54% | 14% [9–22] | 69% [54–80] |
| Control: Qwen3.5-0.8B + datos burak29, misma receta | 35% [32–38] | 34% | 2% [1–7] | 47% [33–61] |
| **Clipwright 0.8B (V2)** | **91%** [88–92] | **87%** | **46%** [37–56] | 67% [52–79] |

\* Muestra aleatoria de 100 de las 850 tareas.

El salto del control a este modelo es significativo en single-step y multi-step (prueba exacta pareada, p < 1e-11). En las 45 peticiones escritas a mano que ningún modelo vio, empata con el V1 de 7B (67% frente a 69%) y resuelve 0 de las 5 tareas que piden varias salidas.

## Requisitos de hardware

- VRAM estimada: el GGUF Q8_0 ocupa 834 MB, por lo que la inferencia requiere aproximadamente 1-1,5 GB de VRAM o RAM según el backend y el contexto utilizado.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente; también puede ejecutarse en CPU.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU moderna e incluso en CPU.
- Opciones de despliegue: llama.cpp mediante `llama-server -hf mohammed-usmani/clipwright-0.8b:Q8_0 --jinja -c 32768`; el adaptador PEFT puede cargarse sobre Qwen3.5-0.8B con la librería `peft`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Single-step | Multi-step | Licencia | Formato |
|---|---|---|---|---|---|---|
| Clipwright 0.8B (V2) | 0,8B | 32.768 | 91% | 46% | Apache 2.0 | GGUF, safetensors (LoRA) |
| Qwen3.5-0.8B base | 0,8B | No disponible | 3%* | 0% | No disponible | Safetensors |
| V1: Qwen2.5-Coder-7B + burak29 | 7B | No disponible | 46% | 14% | No disponible | No disponible |
| Control: Qwen3.5-0.8B + burak29 | 0,8B | No disponible | 35% | 2% | No disponible | No disponible |

La comparativa se limita a los modelos incluidos en la evaluación del autor. No se dispone de datos de otros modelos especializados en tool-use para medios con los que comparar.

## Limitaciones y advertencias

- Los conjuntos de test single-step y multi-step son filas reservadas de los mismos generadores que los datos de entrenamiento, lo que favorece al modelo. En peticiones escritas a mano empata con el V1 de 7B y falla en las 5 tareas que requieren varias salidas.
- Peticiones poco frecuentes son débiles: ante una petición de acelerar un vídeo y subir el tono de voz, mantuvo el tono, rompió la tasa de fotogramas y reportó éxito.
- La autoverificación ejecuta ffprobe pero no compara de forma fiable el resultado con la petición original; es necesario verificar las salidas manualmente.
- Entrenado con sintaxis de ffmpeg 8; versiones anteriores pueden no ser compatibles.
- Ejecuta comandos de shell reales: debe desplegarse en un sandbox con `in/` de solo lectura y salidas en `out/`.
- Riesgo de alucinación en la sintaxis de comandos para casos no cubiertos por el entrenamiento.
- Sesgos conocidos: no disponibles.
- Idiomas soportados: no disponibles.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-0.8B debe verificarse por separado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mohammed-usmani/clipwright-0.8b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- V1 del autor: https://huggingface.co/mohammed-usmani/ffmpeg-model
