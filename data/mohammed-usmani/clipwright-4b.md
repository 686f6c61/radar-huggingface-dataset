# mohammed-usmani/clipwright-4b

## Resumen

Clipwright 4B (GRPO v7) es un modelo de lenguaje de 4.326 millones de parámetros especializado en la ejecución autónoma de tareas de procesamiento multimedia. Lo desarrolla mohammed-usmani y se construye como un adaptador LoRA (r32, alpha 64, sobre todas las capas lineales) montado sobre Qwen/Qwen3.5-4B. Su función es resolver trabajos de vídeo, audio, imagen y metadatos de principio a fin: genera comandos de ffmpeg, ffprobe, ImageMagick, SoX y ExifTool, los ejecuta a través de una única herramienta `run(cmd, foreach)` en un entorno aislado, lee la salida, verifica el resultado contra la petición original y corrige sus propios errores antes de devolver los ficheros finales.

El modelo es relevante porque aborda un problema práctico: la brecha entre "saber escribir un comando de ffmpeg" y "completar correctamente un trabajo multimedia verificable". En lugar de limitarse a generar texto plausible, Clipwright opera en un bucle agente con verificación real del output (duración, dimensiones, códecs, sonoridad, frames, metadatos, etc.), lo que lo sitúa en la categoría de modelos pequeños orientados a tool-use y automatización de pipelines.

La revisión GRPO v7 es la más reciente y la mejor puntuada del proyecto: alcanza un 89% de acierto en el conjunto test_v3 (329 de 368 tareas) y un 89% en test_v2 (137 de 154), superando a las versiones SFT-only y al primer ciclo de GRPO. Se distribuye con licencia Apache 2.0, en formato GGUF cuantizado (Q8_0 y Q5_K_M) y como adaptador PEFT en safetensors.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.5-4B) con adaptador LoRA (r32, alpha 64, todas las capas lineales) |
| Parámetros totales | 4.326.350.848 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (configuración recomendada en llama.cpp, `-c 32768`) |
| Tipos de cuantización | Q8_0 (4,6 GB), Q5_K_M (3,2 GB); Q4_K_M evaluado pero no publicado por pérdida de ~5 puntos |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q8_0, Q5_K_M), safetensors (adaptador PEFT), JSON (esquema de herramienta), TXT (system prompt) |

## Arquitectura y entrenamiento

Clipwright parte de Qwen3.5-4B, un transformer decoder-only de 4.326 millones de parámetros, sobre el que se aplica un adaptador LoRA con rango 32, alpha 64 y cobertura de todas las capas lineales. El entrenamiento se organiza en cuatro etapas secuenciales. La primera (V3) es un SFT sobre 12.095 ejemplos verificados que cubren 46 tipos de trabajos multimedia, ejecutado en una Colab L4 durante una época. La segunda (V4) añade 100 pasos de GRPO con 8 tareas por paso y 8 intentos por tarea, con recompensa 1 por verificación correcta (con penalización menor por pasos extra) y 0 en caso contrario.

La tercera etapa (SFT v7b) incorpora 2.318 filas nuevas durante 2 épocas, orientadas a enseñar un paso de comprobación tras la escritura ("¿coincide la salida con la petición?") y a la recuperación tras un comando fallido, más 1.500 filas de replay para evitar olvido catastrófico, con LR 3e-5. La etapa final (GRPO v7, esta revisión) aplica 100 pasos de GRPO con 16 tareas × 8 intentos por paso, un pool ponderado hacia los tipos de trabajo más débiles, omisión de tareas ya resueltas siempre y sin término KL, con LR 1e-5, en una Colab A100.

La innovación técnica central es el bucle agente con verificación real: cada ejemplo de entrenamiento fue ejecutado sobre ficheros reales y su salida comprobada contra una especificación oculta antes de conservarse, y la recompensa de RL emplea esa misma comprobación. El modelo opera con una única herramienta `run(cmd, foreach)` que abstrae ffmpeg, ffprobe, ImageMagick, SoX y ExifTool, y el bucle se cierra devolviendo a la herramienta mensajes JSON con `exit_code`, `stdout` o `error` y un resumen de los ficheros en `out/`.

## Capacidades

- Generación de comandos de ffmpeg y ffprobe para edición, transcodificación, corte, concatenación, generación de miniaturas y extracción de información de flujos.
- Procesamiento de imagen con ImageMagick 7 (`magick`): redimensionado, recorte, conversión de formato, composición y generación de PDFs.
- Procesamiento de audio con SoX: normalización, cambio de pitch, eliminación de silencios, conversión de frecuencia de muestreo.
- Manipulación de metadatos y privacidad con ExifTool: lectura, escritura y borrado de metadatos EXIF.
- Bucle agente multi-paso con tool calling: encadena llamadas a `run`, lee resultados y decide el siguiente comando.
- Autoverificación: incorpora un paso de comprobación tras escribir la salida ("¿coincide con la petición?") y recuperación ante comandos fallidos.
- Respuesta a preguntas sobre ficheros: duración, códecs, dimensiones, tasa de bits, pistas de audio, etc.
- Gestión de ambigüedad: formula preguntas cuando la petición es ambigua y declara cuándo algo no se puede hacer.
- Soporte de `foreach` en la herramienta `run` para aplicar un comando a múltiples ficheros.
- Capacidades multilingües: no disponibles (no se documentan idiomas soportados).

## Casos de uso

- Generación automática de previews y clips sociales: el modelo recibe un vídeo de entrada y produce un GIF o clip de duración y resolución concretas, verificando dimensiones, duración y códec antes de devolver el fichero. Adecuado por su entrenamiento específico en trabajos de "social and delivery" (20/24 en test_v2).
- Normalización de audio para podcast: aplica SoX para ajustar sonoridad, frecuencia de muestreo y canales, y comprueba el resultado con ffprobe. El grupo "audio" obtiene 20/23 en test_v2, lo que respalda este uso.
- Limpieza de metadatos antes de publicar: usa ExifTool para eliminar EXIF de imágenes y metadatos de vídeos, verificando que la salida ya no los contiene. El grupo "metadata and privacy" logra 8/9 en test_v2.
- Reparación de ficheros multimedia: ante un contenedor dañado o un flujo mal etiquetado, el modelo diagnostica con ffprobe, propone una corrección y valida la salida. El grupo "repair" obtiene 18/18 en test_v2.
- Conversión y composición de imágenes y PDFs: genera PDFs a partir de imágenes, redimensiona lotes con `foreach` y verifica recuento de páginas y dimensiones. El grupo "images and PDFs" logra 18/18 en test_v2.
- Automatización de pipelines de entrega de medios: integrado en un servicio con sandbox (sin red, entradas de solo lectura), el modelo ejecuta el bucle completo y devuelve los ficheros de `out/`, lo que permite encadenarlo a un sistema de publicación o CDN.
- Asistente de operaciones para equipos de medios: responde preguntas sobre ficheros (duración, códecs, pistas) y declara límites cuando la petición excede sus 46 tipos de trabajo entrenados.

## Benchmarks y rendimiento

Los resultados provienen de ejecutar los comandos del modelo y comprobar los ficheros de salida (duración, dimensiones, códecs, sonoridad, frames en instantes dados, pitch, silencio, sincronía, metadatos, número de páginas o hechos en una respuesta escrita). Decodificación greedy, una ejecución por tarea, hasta 15 comandos.

**test_v3** (368 tareas sobre los 46 tipos de trabajo, sobre un tercer conjunto de medios reservados, peticiones reformuladas por otro modelo):

| Modelo | Test (230) | Dev (138) | Total | Detenido por bucle |
|---|---|---|---|---|
| V4 | 191 | 114 | 305 (83%) | 16 |
| SFT v7b | 204 | 117 | 321 (87%) | 15 |
| GRPO v7 | 208 | 121 | 329 (89%) | 8 |

GRPO v7 resuelve 35 tareas que V4 falla y falla 11 que V4 resuelve (test exacto pareado, p = 0,0005).

**test_v2** (154 tareas escritas a mano, medios reservados):

| Grupo de trabajo | GRPO v7 | V4 (mismo harness) |
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

12 ganadas y 4 perdidas (p ≈ 0,08: ventaja, aún no significativa en este conjunto más pequeño). Como referencia, el profesor de 27B que escribió los datos originales de entrenamiento obtuvo 119/154 en test_v2.

**Cuantización** (test_v3 dev, 138 tareas, llama.cpp en un Mac): Q5_K_M 126, Q8_0 125, Q4_K_M 118.

## Requisitos de hardware

- VRAM estimada para inferencia: Q8_0 ocupa 4,6 GB en disco y requiere aproximadamente 5-6 GB de VRAM o memoria unificada; Q5_K_M ocupa 3,2 GB y requiere aproximadamente 4 GB.
- GPU recomendadas: A100 (usada en el entrenamiento GRPO), L4 (usada en el SFT V3); en inferencia basta con GPUs de gama media.
- Cabe en GPU consumer: sí. El autor indica Q8_0 como la mejor calidad en Mac o GPU de 8 GB o más, y Q5_K_M para GPUs más pequeñas.
- Opciones de despliegue: llama.cpp (`llama-server -hf mohammed-usmani/clipwright-4b:Q8_0 --jinja -c 32768`), con soporte de plantilla Jinja; el adaptador PEFT puede cargarse sobre Qwen/Qwen3.5-4B con la librería `peft`. El repositorio de GitHub incluye una aplicación web (`app/run.sh`) que ejecuta el bucle completo.
- Latencia y throughput: no disponibles.
- Requisito de seguridad: ejecutar en sandbox (sin red, entradas de solo lectura), ya que el modelo emite comandos reales de ffmpeg, ImageMagick, SoX y ExifTool.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Clipwright 4B (GRPO v7) | 4.326 M | 32.768 | Agente multimedia con verificación de salida | Apache 2.0 | GGUF Q8_0/Q5_K_M y adaptador PEFT |
| Qwen3.5-4B (base) | 4.326 M | No disponible | LLM generalista | No disponible | No disponible |
| Profesor de 27B (generador de datos) | ~27.000 M | No disponible | Generación de datos de entrenamiento | No disponible | No disponible |

La información disponible no permite comparar con alternativas externas de la misma categoría (modelos pequeños orientados a tool-use multimedia) en parámetros, contexto y rendimiento. El único punto de comparación documentado es el profesor de 27B que generó los datos originales: obtuvo 119/154 en test_v2 frente a los 137/154 de Clipwright 4B, lo que indica que el modelo destilado supera a su profesor en la tarea final.

## Limitaciones y advertencias

- Cobertura limitada a los 46 tipos de trabajo entrenados: en peticiones construidas a partir de preguntas reservadas de Stack Exchange pasa 135 de 172 (78%), y solo 16 de 30 (53%) cuando el trabajo requiere un filtro poco frecuente en sus datos de entrenamiento.
- En pruebas manuales falló en la construcción de un GIF a partir de frames específicos, en un efecto de voz robótica y en peticiones vagas de "limpiar el ruido".
- Puede declarar "Done" sobre una salida que no coincide plenamente con la petición; es recomendable verificar manualmente las salidas importantes.
- Los ficheros de test son sintéticos, por lo que material real con códecs extraños o dañado puede obtener peores resultados.
- Entrenado con sintaxis de ffmpeg 8 a 9 e ImageMagick 7 (`magick`); versiones distintas pueden degradar el rendimiento.
- Riesgo de bucle: en test_v3, 8 tareas se detuvieron por bucle (frente a 16 de V4).
- No se documentan sesgos conocidos ni idiomas soportados.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre la corrección de las salidas.
- Requiere ejecución en sandbox por la naturaleza destructiva potencial de los comandos emitidos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mohammed-usmani/clipwright-4b
- Repositorio de código, entorno y evaluaciones: https://github.com/mohammed-usmani/clipwright
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
