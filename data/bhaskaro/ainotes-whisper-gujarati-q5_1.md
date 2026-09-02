# bhaskaro/ainotes-whisper-gujarati-q5_1

## Resumen

Este modelo es una conversión al formato GGML y cuantización q5_1 del fine-tune `vasista22/whisper-gujarati-small`, un adaptación del modelo Whisper de OpenAI para el reconocimiento automático de voz (ASR) en gujarati. El autor, `bhaskaro`, lo ha preparado para su uso con la librería `whisper.cpp`, que permite ejecutar Whisper en dispositivos con recursos limitados, como teléfonos móviles o sistemas embebidos, sin necesidad de GPU. Con un tamaño de 190 MB, el modelo está pensado para transcripción local y privada de audio en gujarati, evitando dependencias de servicios en la nube.

La relevancia de esta publicación radica en que ofrece una versión cuantizada y optimizada para inferencia en CPU de un modelo ya ajustado para un idioma de bajos recursos como el gujarati, lo que facilita su despliegue en entornos de producción con restricciones de memoria y energía. Además, el autor documenta un problema crítico de los fine-tunes indios de Whisper: la falta de entrenamiento de los tokens de timestamp, que obliga a desactivar la generación de marcas de tiempo para obtener resultados coherentes. Esta advertencia es fundamental para cualquier desarrollador que quiera integrar el modelo.

El modelo se distribuye bajo licencia Apache 2.0 y está basado en el fine-tune de `vasista22`, que a su vez deriva de la arquitectura Whisper (MIT). El repositorio contribuye únicamente la conversión de formato y la cuantización, no el entrenamiento original.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (transformer encoder-decoder), variante small |
| Parametros totales | no disponible (modelo base: whisper-small) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper utiliza ventanas de audio de 30 segundos por defecto, no especificado en la información) |
| Tipos de cuantizacion | q5_1 (GGML) |
| Idiomas soportados | gujarati (gu) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGML (whisper.cpp) |

## Arquitectura y entrenamiento

El modelo original `vasista22/whisper-gujarati-small` es un fine-tune de `openai/whisper-small` sobre corpus públicos de ASR en gujarati, entrenado durante el "Whisper fine-tuning sprint". La arquitectura es la estándar de Whisper: un transformer encoder-decoder con atención causada, diseñado para procesar audio de hasta 30 segundos y generar transcripciones de texto. El fine-tune se realizó con transcripciones planas, sin predicción de timestamps, lo que deja los tokens de timestamp sin entrenar.

La conversión a GGML se realizó mediante el script `convert-h5-to-ggml.py` de whisper.cpp, generando primero un modelo en float16 y luego cuantizándolo a q5_1. El autor verificó que la tabla de tokens coincidiera byte a byte con la publicada por ggerganov, para evitar errores de vocabulario que producen salidas fluidas pero incorrectas. Según las mediciones del autor, la cuantización q5_1 es 2,6 veces más pequeña y 1,34 veces más rápida que float16, con una precisión similar (14,7% frente a 15,9% de WER en pruebas con hindi, en los mismos clips).

Una característica técnica destacable es la necesidad de usar `no_timestamps` en la decodificación. Los fine-tunes indios de Whisper, al no entrenar los tokens de timestamp, hacen que whisper.cpp corte los segmentos en lugares incorrectos si esos tokens están habilitados, generando texto gramaticalmente correcto pero completamente desvinculado del audio. El autor mide una mejora del 47,5% al 14,9% de WER en hindi al desactivar los timestamps.

## Capacidades

- Reconocimiento automático de voz (ASR) para el idioma gujarati, transcribiendo audio a texto.
- Ejecución local en CPU mediante whisper.cpp, sin necesidad de GPU.
- Inferencia en tiempo real en dispositivos móviles de gama media (probado en Snapdragon 720G con 4 hilos).
- Soporte para entrada de audio en formato WAV (u otros compatibles con whisper.cpp).
- No soporta tool calling, agentes ni razonamiento multietapa; es exclusivamente un modelo de transcripción.
- No es multilingüe: está especializado en gujarati, aunque podría intentar transcribir otros idiomas con resultados pobres.

## Casos de uso

- Transcripción local de notas de voz en gujarati: el modelo puede ejecutarse en un teléfono móvil para convertir mensajes de voz en texto sin enviar audio a la nube, garantizando privacidad y funcionamiento offline.
- Generación de subtítulos para vídeos en gujarati: integrado en herramientas de edición de vídeo, permite crear subtítulos automáticos para contenido en este idioma, con la ventaja de no requerir conexión a internet.
- Asistente de reuniones con transcripción en tiempo real: en dispositivos con recursos limitados, puede transcribir conversaciones en gujarati en tiempo real, facilitando la toma de notas o la búsqueda posterior.
- Archivado y búsqueda de audios: al transcribir grabaciones de entrevistas, clases o conferencias, se puede indexar el texto resultante para búsquedas por palabras clave.
- Accesibilidad para personas con discapacidad auditiva: al convertir audio en gujarati a texto, se pueden mostrar subtítulos en tiempo real en aplicaciones de comunicación.
- Prototipos y aplicaciones educativas: desarrolladores que necesitan una solución ASR ligera y en español (o mejor, en gujarati) para proyectos de bajo presupuesto pueden integrar este modelo con whisper.cpp en pocas líneas de código.

## Benchmarks y rendimiento

El autor proporciona mediciones propias realizadas con whisper.cpp sobre 24 clips de FLEURS `gu_in`, usando decodificación greedy y `no_timestamps`. Los resultados son:

| Métrica | Valor |
|---|---|
| Word error rate (WER) | 53,8% |
| Character error rate (CER) | 39,2% |

Estas cifras indican un rendimiento moderado en gujarati, con una tasa de error de palabra alta, probablemente debido a la variabilidad dialectal y a la limitada cantidad de datos de entrenamiento. No se han publicado comparaciones con otros modelos ASR para gujarati en la información disponible.

Además, el autor documenta que la cuantización q5_1 no degrada la precisión respecto a float16 en pruebas con hindi (14,7% vs 15,9% WER), y que es 2,6 veces más pequeña y 1,34 veces más rápida.

## Requisitos de hardware

- Tamaño del modelo: 190 MB (0,2 GB), lo que permite su carga en memoria en dispositivos con poca RAM.
- Inferencia en CPU: funciona sin GPU, probado en un Snapdragon 720G (8 núcleos, 4 hilos usados) a velocidad superior a tiempo real.
- GPU no requerida; puede usarse en cualquier sistema con soporte para whisper.cpp.
- Opciones de despliegue: whisper.cpp (línea de comandos `whisper-cli`, integración en aplicaciones C/C++), también compatible con bindings en otros lenguajes (Python, Node.js, etc.).
- Latencia: no se especifica un valor numérico, pero el autor indica que es "más rápido que tiempo real" en el hardware mencionado, lo que sugiere una latencia inferior a la duración del audio.
- Throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos ASR para gujarati en la información proporcionada. A continuación se muestra una comparación con el modelo base sin cuantizar y con la versión float16, basada en las mediciones del autor:

| Modelo | Formato | Tamaño | WER (gujarati, FLEURS) | WER (hindi, 64 clips) |
|---|---|---|---|---|
| bhaskaro/ainotes-whisper-gujarati-q5_1 | GGML q5_1 | 190 MB | 53,8% | 14,7% (con no_timestamps) |
| vasista22/whisper-gujarati-small (float16) | HF/GGML float16 | ~500 MB (estimado) | no disponible | 15,9% (con no_timestamps) |
| openai/whisper-small (original) | HF | ~500 MB | no disponible | no disponible |

La comparación en hindi es orientativa, ya que el modelo está especializado en gujarati, pero muestra que la cuantización no penaliza significativamente la precisión.

## Limitaciones y advertencias

- El WER en gujarati es alto (53,8%), lo que puede generar transcripciones con errores significativos; se recomienda validar los resultados en aplicaciones críticas.
- Es imprescindible desactivar los timestamps (`-nt` en whisper.cpp) para obtener transcripciones coherentes; de lo contrario, el modelo produce texto fluido pero totalmente incorrecto.
- El modelo solo está entrenado para gujarati; su uso en otros idiomas dará resultados muy pobres.
- Al ser un fine-tune sobre datos públicos, puede presentar sesgos derivados de la composición del corpus (por ejemplo, acentos, vocabulario específico o dominios limitados).
- La licencia Apache 2.0 permite uso comercial, pero el modelo subyacente (Whisper) es MIT; no hay restricciones conocidas adicionales.
- El autor no proporciona información sobre la composición exacta del dataset de entrenamiento ni sobre el proceso de fine-tuning, lo que limita la reproducibilidad.

## Enlaces

- Repositorio del modelo en Hugging Face: https://huggingface.co/bhaskaro/ainotes-whisper-gujarati-q5_1
- Modelo base (fine-tune original): https://huggingface.co/vasista22/whisper-gujarati-small
- Repositorio de whisper.cpp: https://github.com/ggml-org/whisper.cpp
- Repositorio AiNotes (aplicación de transcripción local, mencionada en la búsqueda): https://github.com/roavelino/AiNotes
- Modelo base de Whisper (OpenAI): https://huggingface.co/openai/whisper-small
