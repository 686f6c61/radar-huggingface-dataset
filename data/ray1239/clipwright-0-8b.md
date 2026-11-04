# Ray1239/clipwright-0.8b

## Resumen

Clipwright 0.8B (V2) es un modelo de lenguaje de 772.845.888 parámetros, ajustado mediante LoRA sobre Qwen/Qwen3.5-0.8B, especializado en la ejecución de tareas de procesamiento multimedia de extremo a extremo. Desarrollado por Ray1239 y publicado bajo licencia Apache 2.0, el modelo no genera los archivos directamente: en su lugar, emite comandos de shell para ffmpeg, ffprobe, ImageMagick, SoX y ExifTool a través de una única herramienta `run(cmd, foreach)`, lee los resultados y responde con los archivos de salida producidos.

La relevancia del modelo reside en su enfoque de entrenamiento verificado: los 8.728 ejemplos del conjunto de entrenamiento (7.154 de un solo paso y 1.574 de varios pasos) fueron ejecutados sobre archivos reales y su salida se comprobó antes de conservarlos. El ajuste LoRA (r32, alpha 64, todas las capas lineales, 2,8 % de los pesos) se completó en una época sobre una GPU Colab L4 en 2 horas y 12 minutos.

El modelo se distribuye en dos formatos: un GGUF Q8_0 de 834 MB con el LoRA fusionado en la base, pensado para llama.cpp, y el adaptador PEFT en safetensors para cargar sobre Qwen3.5-0.8B. Su tamaño reducido y su naturaleza de agente de herramientas lo hacen adecuado para automatización de pipelines multimedia en entornos con recursos limitados, siempre que se ejecute en un sandbox por tratarse de comandos de shell reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-0.8B) con adaptador LoRA (r32, alpha 64, todas las capas lineales) |
| Parametros totales | 772.845.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (configuración recomendada en llama.cpp con `-c 32768`) |
| Tipos de cuantizacion | Q8_0 (GGUF publicado); el adaptador PEFT en safetensors permite otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT), GGUF (Q8_0 fusionado) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B, un transformer de 772 millones de parámetros, sobre el que se aplica un ajuste LoRA con rango 32, alpha 64 y cobertura de todas las capas lineales, lo que representa un 2,8 % de los pesos. El entrenamiento consistió en una época sobre 8.728 ejemplos: 7.154 de un solo paso y 1.574 de varios pasos. Cada ejemplo fue ejecutado sobre archivos reales y su salida se verificó antes de incorporarlo al conjunto, lo que constituye la innovación metodológica principal frente a alternativas entrenadas con datos públicos sin validar.

El modelo opera como un agente de herramientas: recibe una petición del usuario junto con una lista de archivos de entrada bajo el encabezado `Files:`, emite llamadas a la herramienta `run(cmd, foreach)` en formato de función OpenAI, y el orquestador externo ejecuta cada comando con entradas en `in/` (solo lectura) y salidas en `out/`. El bucle continúa hasta que el modelo deja de invocar la herramienta. El prompt de sistema y el esquema de la herramienta se distribuyen junto con los pesos (`system_prompt.txt` y `tool.json`) y deben usarse tal cual. El modelo está entrenado con la sintaxis de ffmpeg 8.

## Capacidades

- Generación de comandos de ffmpeg y ffprobe para transcodificación, recorte, cambio de resolución, extracción de audio y generación de miniaturas o GIF.
- Procesamiento de imágenes con ImageMagick (redimensionado, conversión de formato, composición).
- Procesamiento de audio con SoX (normalización, cambio de frecuencia de muestreo, conversión).
- Lectura y escritura de metadatos con ExifTool.
- Ejecución de tareas de varios pasos encadenando llamadas a la herramienta `run(cmd, foreach)`.
- Soporte de tool calling en formato de función OpenAI.
- Autoverificación limitada mediante ffprobe (comprueba propiedades del archivo generado, aunque no las contrasta de forma fiable con la petición original).
- Capacidad de iteración en bucle hasta completar la tarea o dejar de invocar la herramienta.

## Casos de uso

- Generación automatizada de miniaturas y previews: el modelo recibe la descripción técnica del vídeo de entrada y emite los comandos de ffmpeg para extraer fotogramas o crear un GIF de duración determinada, con los parámetros de escala y tasa de fotogramas adecuados.
- Normalización de audio en lotes: a partir de la descripción de los archivos (códec, frecuencia de muestreo, canales), el modelo construye comandos de SoX o ffmpeg para ajustar la sonoridad, remuestrear o convertir a mono, escribiendo los resultados en `out/`.
- Conversión de formato y códec en pipelines de publicación: el modelo encadena ffprobe para inspeccionar el archivo y ffmpeg para transcodificar a H.264/AAC con la resolución y el bitrate solicitados, adecuado para preparar material antes de subirlo a una plataforma.
- Extracción y edición de metadatos: con ExifTool, el modelo puede leer los metadatos de una imagen o vídeo y emitir los comandos para modificarlos o eliminarlos, útil en flujos de gestión de activos digitales.
- Procesamiento de imágenes por lotes con ImageMagick: redimensionado, recorte, conversión de formato y aplicación de marcas de agua sobre conjuntos de imágenes descritos en el mensaje de usuario.
- Automatización de tareas multimedia en entornos con recursos limitados: al tratarse de un modelo de 0,8B cuantizado a Q8_0 (834 MB), puede desplegarse en una GPU de consumo o incluso en CPU mediante llama.cpp, lo que permite integrarlo en servidores modestos o en estaciones de trabajo sin aceleradores dedicados.
- Agente de mantenimiento de bibliotecas multimedia: combinado con un orquestador que liste los archivos disponibles, el modelo puede proponer y ejecutar operaciones de limpieza, estandarización de formatos o generación de derivados.

## Benchmarks y rendimiento

Los resultados proceden de la model card y se obtuvieron ejecutando los comandos del modelo y comprobando los archivos de salida (duración, dimensiones, códecs, sonoridad, tamaño y metadatos), con decodificación greedy y una ejecución por tarea. Los intervalos de confianza de Wilson al 95 % figuran entre corchetes.

| Modelo | Single-step (850) | Solo ffmpeg (542) | Multi-step (100) | Escritas a mano (45) |
|---|---|---|---|---|
| Qwen3.5-0.8B base | 3 %* | 2 %* | 0 % | 4 % |
| V1: Qwen2.5-Coder-7B + datos públicos burak29 | 46 % [43–50] | 54 % | 14 % [9–22] | 69 % [54–80] |
| Control: Qwen3.5-0.8B + datos burak29, misma receta | 35 % [32–38] | 34 % | 2 % [1–7] | 47 % [33–61] |
| **Clipwright 0.8B (V2)** | **91 %** [88–92] | **87 %** | **46 %** [37–56] | 67 % [52–79] |

\* Muestra aleatoria de 100 de las 850 tareas.

La comparación con el control (misma base y misma receta, solo cambian los datos) muestra una mejora significativa en single-step y multi-step (prueba exacta pareada, p < 1e-11). En las 45 peticiones escritas a mano que ningún modelo vio durante el entrenamiento, el modelo empata con el V1 de 7B (67 % frente a 69 %) y resuelve 0 de las 5 tareas que solicitan varias salidas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB para el GGUF Q8_0 (834 MB de pesos más overhead de contexto); el adaptador PEFT sobre la base en fp16 requiere alrededor de 1,6 GB para los pesos más la caché KV.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para el GGUF Q8_0; para el adaptador PEFT en fp16, 4 GB o más. Funciona en RTX 4090, A100, H100 y GPUs de gama media sin problema por tamaño.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer con 2 GB o más de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.). También puede ejecutarse en CPU mediante llama.cpp.
- Opciones de despliegue: llama.cpp (`llama-server -hf Ray1239/clipwright-0.8b:Q8_0 --jinja -c 32768`), y cualquier runtime compatible con PEFT para cargar el adaptador sobre Qwen3.5-0.8B. El modelo declara compatibilidad con endpoints (`endpoints_compatible`).
- Latencia y throughput: no disponibles en la información proporcionada. El entrenamiento se realizó en una Colab L4 en 2 h 12 min para una época, pero no se publican métricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Single-step | Multi-step | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Clipwright 0.8B (V2) | 772.845.888 | 32.768 | 91 % | 46 % | Apache 2.0 | HuggingFace (GGUF y PEFT) |
| V1: Qwen2.5-Coder-7B + burak29 (Ray1239/ffmpeg-model) | ~7B | no disponible | 46 % | 14 % | no disponible | HuggingFace |
| Control: Qwen3.5-0.8B + burak29 | 772.845.888 | no disponible | 35 % | 2 % | Apache 2.0 (base) | No distribuido como modelo independiente |
| Qwen3.5-0.8B base | 772.845.888 | no disponible | 3 % | 0 % | Apache 2.0 | HuggingFace |

La comparativa se limita a los modelos evaluados en la model card. No se dispone de datos de otros modelos especializados en automatización multimedia con los que contrastar.

## Limitaciones y advertencias

- Los conjuntos de test single-step y multi-step son filas reservadas de los mismos generadores que los datos de entrenamiento, lo que favorece al modelo. En peticiones escritas a mano, empata con el V1 de 7B (67 % frente a 69 %) y falla en las 5 tareas que requieren varias salidas.
- Las peticiones poco frecuentes son débiles: ante una solicitud de acelerar un vídeo y subir el tono de voz a la vez, mantuvo el tono sin cambios, rompió la tasa de fotogramas e informó de éxito.
- La autoverificación mediante ffprobe no compara de forma fiable el resultado con la petición original; es necesario verificar las salidas de forma externa.
- El modelo está entrenado con la sintaxis de ffmpeg 8; versiones anteriores pueden producir comandos incompatibles.
- Ejecuta comandos de shell reales: debe desplegarse en un sandbox con `in/` de solo lectura y `out/` como único destino de escritura.
- No se han publicado datos sobre sesgos, idiomas soportados ni comportamiento multilingüe.
- Riesgo de alucinación en la descripción de resultados: el modelo puede reportar éxito en tareas que no ha completado correctamente, como demuestra el caso de la limitación anterior.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-0.8B tiene su propia licencia que debe verificarse por separado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ray1239/clipwright-0.8b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- V1 del autor (Qwen2.5-Coder-7B + datos burak29): https://huggingface.co/Ray1239/ffmpeg-model
