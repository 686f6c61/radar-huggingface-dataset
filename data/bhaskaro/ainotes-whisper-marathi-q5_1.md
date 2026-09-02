# bhaskaro/ainotes-whisper-marathi-q5_1

## Resumen

El modelo `bhaskaro/ainotes-whisper-marathi-q5_1` es una conversión cuantizada a formato GGML del modelo `steja/whisper-small-marathi`, un fine-tuning de Whisper small de OpenAI especializado en reconocimiento automático de voz (ASR) para el idioma maratí. El autor ha convertido los pesos a float16 y posteriormente los ha cuantizado a q5_1 para su uso con la librería `whisper.cpp`, lo que permite ejecutar el modelo en dispositivos locales con recursos limitados, como teléfonos móviles de gama media.

El modelo ocupa aproximadamente 190 MB y, según las mediciones del autor, funciona más rápido que en tiempo real en un Snapdragon 720G con 4 hilos. Es relevante porque ofrece una solución de transcripción de voz en maratí totalmente offline y de código abierto, con licencia Apache 2.0, apta para integración en aplicaciones móviles o de escritorio. Una particularidad importante es que requiere desactivar la predicción de timestamps (`no_timestamps`) para funcionar correctamente, ya que los tokens de timestamp no fueron entrenados durante el fine-tuning.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper small (encoder-decoder Transformer) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (ventana de audio estandar de Whisper, 30 segundos) |
| Tipos de cuantizacion | q5_1 (GGML) |
| Idiomas soportados | maratí (mr) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGML (whisper.cpp) |

## Arquitectura y entrenamiento

El modelo base es `steja/whisper-small-marathi`, un fine-tuning de Whisper small de OpenAI realizado sobre datos de habla maratí. Whisper small es un transformer encoder-decoder con aproximadamente 244 millones de parámetros (dato no confirmado en la documentación del repositorio). El autor de esta conversión no describe el proceso de entrenamiento del fine-tuning original, pero sí detalla la conversión: primero se transforman los pesos de Hugging Face a float16 mediante el script `convert-h5-to-ggml.py` de whisper.cpp, y luego se cuantizan a q5_1. Además, verifica que la tabla de tokens coincida byte a byte con la del modelo `ggml-small` publicado por ggerganov, para evitar errores silenciosos de vocabulario.

Una innovación técnica destacable es la medición comparativa entre float16 y q5_1: el autor reporta que la cuantización q5_1 es 2,6 veces más pequeña, 1,34 veces más rápida y no muestra pérdida de precisión (14,7% vs 15,9% WER en hindi con los mismos clips). También identifica un problema crítico en los modelos Whisper fine-tuneados para idiomas indios: los tokens de timestamp no están entrenados, por lo que activarlos provoca que el decodificador corte los segmentos incorrectamente y genere texto fluido pero no relacionado con el audio. Por ello, recomienda usar siempre `no_timestamps`.

## Capacidades

- Reconocimiento automático de voz (ASR) para maratí, transcribiendo audio a texto en escritura devanagari.
- Ejecución local y offline, sin necesidad de conexión a internet.
- Inferencia en tiempo real en CPUs de gama media (probado en Snapdragon 720G con 4 hilos).
- Compatible con la librería whisper.cpp, que ofrece integración en C/C++ y bindings para múltiples lenguajes.
- Decodificación greedy con `no_timestamps` como configuración recomendada.
- No incluye capacidades de tool calling, agentes, visión ni otras modalidades; es exclusivamente un modelo de transcripción de voz.

## Casos de uso

- Transcripción de notas de voz en aplicaciones de productividad: el modelo puede procesar grabaciones de audio en maratí directamente en el dispositivo, sin enviar datos a la nube, gracias a su tamaño reducido y su funcionamiento en tiempo real en hardware modesto.
- Subtitulado automático de vídeos en maratí: integrable en herramientas de edición de vídeo o plataformas de streaming que requieran generar subtítulos en este idioma de forma local.
- Asistente de reuniones y entrevistas: permite transcribir conversaciones en maratí para generar actas o resúmenes, ejecutándose en portátiles o dispositivos móviles sin GPU dedicada.
- Accesibilidad para personas con discapacidad auditiva: puede convertir audio en maratí a texto en tiempo real, facilitando la comunicación en entornos donde no hay subtítulos.
- Archivado y búsqueda de contenido de audio: las transcripciones generadas pueden indexarse para búsqueda textual dentro de bibliotecas de audio en maratí.
- Aplicaciones educativas: transcripción de clases o material didáctico en maratí para su posterior estudio o consulta.

## Benchmarks y rendimiento

El autor proporciona mediciones propias realizadas con whisper.cpp sobre 32 clips de FLEURS en maratí (`mr_in`), usando decodificación greedy y `no_timestamps`. También incluye una comparación en hindi (64 clips) entre activar y desactivar timestamps.

| Metrica | Valor (maratí, FLEURS) |
|---|---|
| Word error rate (WER) | 51,2% |
| Character error rate (CER) | 16,4% |

| Configuracion (hindi, 64 clips) | WER |
|---|---|
| Timestamps activados | 47,5% |
| Timestamps desactivados | 14,9% |

| Comparacion float16 vs q5_1 (hindi, mismos clips) | WER |
|---|---|
| float16 | 15,9% |
| q5_1 | 14,7% |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, etc.) porque el modelo no está diseñado para tareas de lenguaje general, sino exclusivamente para ASR.

## Requisitos de hardware

- Tamaño del modelo: aproximadamente 190 MB en disco.
- VRAM estimada: no requiere GPU; puede ejecutarse en CPU. En GPU, la VRAM necesaria sería inferior a 1 GB, pero no se ha especificado.
- GPU recomendadas: ninguna en particular; el modelo está pensado para CPU. Funciona en un Snapdragon 720G (teléfono de gama media de 2020) con 4 hilos.
- Compatible con GPUs consumer (p. ej., RTX 4090) si se desea aceleración, pero no es necesario.
- Opciones de despliegue: whisper.cpp (línea de comandos `whisper-cli`), y bindings de whisper.cpp para Python, Node.js, etc. También puede ejecutarse con Ollama o vLLM si se convierte a otros formatos, aunque no es el flujo previsto.
- Latencia y throughput: el autor reporta que corre más rápido que tiempo real en un Snapdragon 720G con 4 hilos, es decir, la transcripción de un audio de 1 minuto tarda menos de 1 minuto.

## Comparativa con modelos similares

La siguiente tabla compara el modelo cuantizado q5_1 con su versión float16 original y con el modelo Whisper small original de OpenAI (sin fine-tuning). Los datos de tamaño y velocidad provienen de las mediciones del autor; los de Whisper small original son públicos.

| Modelo | Tamano | Velocidad relativa | WER (hindi, 64 clips) | Licencia |
|---|---|---|---|---|
| q5_1 (este modelo) | 190 MB | 1,34x más rápido que float16 | 14,7% | Apache 2.0 |
| float16 (steja/whisper-small-marathi) | ~500 MB (estimado) | referencia | 15,9% | Apache 2.0 |
| whisper-small original (OpenAI) | ~500 MB (fp16) | no medido | no disponible (no entrenado para maratí) | MIT |

No se dispone de datos comparativos con otros fine-tunes de maratí, como `Praveendecode/finetuned-whishper-small-marathi`, porque no se han publicado métricas equivalentes.

## Limitaciones y advertencias

- El WER en maratí (51,2% en FLEURS) es alto, lo que indica que el modelo puede fallar en audio con ruido, acentos regionales o vocabulario técnico. Se recomienda probar en el dominio de uso real antes de desplegar en producción.
- Es obligatorio usar `no_timestamps`. Si se activan los timestamps, el modelo produce texto fluido pero incorrecto, sin relación con el audio. Esto es un riesgo crítico si se integra sin esta configuración.
- El modelo solo soporta maratí; no funciona con otros idiomas.
- No incluye capacidades de habla multilingüe ni de identificación de hablantes.
- La licencia Apache 2.0 permite uso comercial, pero la atribución al autor original del fine-tuning (`steja`) debe mantenerse.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado con datos de habla maratí, puede reflejar sesgos presentes en esos datos (p. ej., variaciones dialectales o de género).
- La cuantización q5_1 introduce una ligera pérdida de precisión en comparación con float16, aunque las mediciones del autor no muestran diferencias significativas; sin embargo, no se ha evaluado en todos los escenarios.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/bhaskaro/ainotes-whisper-marathi-q5_1
- Modelo base original: https://huggingface.co/steja/whisper-small-marathi
- whisper.cpp (librería de inferencia): https://github.com/ggml-org/whisper.cpp
- Otro fine-tuning de maratí (referencia): https://huggingface.co/Praveendecode/finetuned-whishper-small-marathi
