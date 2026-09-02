# bhaskaro/ainotes-whisper-tamil-q5_1

## Resumen

Este modelo es una conversión a formato GGML cuantizado en q5_1 del modelo de reconocimiento de voz Whisper Tamil Small, desarrollado por el usuario bhaskaro. Se basa en el fine-tuning `vasista22/whisper-tamil-small`, que adapta el modelo Whisper small de OpenAI al idioma tamil. La conversión está pensada para ejecutarse en dispositivos con recursos limitados mediante la librería whisper.cpp, logrando un tamaño de 190 MB y una velocidad superior a tiempo real en un móvil de gama media de 2020 (Snapdragon 720G, 4 hilos). Su relevancia radica en ofrecer ASR para tamil en entornos on-device, donde los modelos completos no caben o son demasiado lentos.

El autor ha verificado que la tabla de tokens coincide byte a byte con la publicada por ggerganov para `ggml-small`, evitando el problema de vocabularios desalineados que producen salidas fluidas pero incorrectas. Además, documenta un hallazgo importante: los fine-tunes de Whisper para lenguas indias se entrenan sin predicción de timestamps, por lo que es imprescindible desactivarlos en la inferencia para evitar que el decodificador se desvíe y genere texto irrelevante. En pruebas con hindi, el WER pasa de 47,5% con timestamps activados a 14,9% sin ellos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper small (encoder-decoder transformer) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper usa ventanas fijas de audio, no contexto textual) |
| Tipos de cuantizacion | q5_1 (GGML) |
| Idiomas soportados | tamil (ta) |
| Licencia | apache-2.0 |
| Formato de pesos | GGML (whisper.cpp) |

## Arquitectura y entrenamiento

El modelo original `vasista22/whisper-tamil-small` es un fine-tuning de Whisper small, la variante de 244 millones de parámetros de la familia Whisper de OpenAI. Whisper emplea una arquitectura transformer encoder-decoder entrenada sobre 680.000 horas de audio multilingüe. El fine-tuning adapta el modelo al tamil, presumiblemente con datos de habla tamil, aunque la model card no detalla el conjunto de entrenamiento ni el proceso (si se usó RLHF, DPO, etc.).

La conversión a GGML se realizó mediante el script `convert-h5-to-ggml.py` de whisper.cpp, pasando primero a float16 y luego cuantizando a q5_1. El autor verificó la tabla de tokens contra la referencia `ggml-small` para garantizar que el vocabulario coincide exactamente. Según las mediciones del autor, la cuantización q5_1 es 2,6 veces más pequeña y 1,34 veces más rápida que float16, sin pérdida significativa de precisión (14,7% vs 15,9% WER en hindi en los mismos clips).

## Capacidades

- Reconocimiento automático de voz (ASR) para tamil, transcribiendo audio a texto.
- Ejecución en tiempo real o más rápida en CPU de gama media (probado en Snapdragon 720G con 4 hilos).
- Soporte para inferencia sin timestamps mediante la bandera `-nt` de whisper.cpp.
- Compatible con el ecosistema whisper.cpp (línea de comandos, bindings en C/C++).
- No soporta tool calling, generación de código, visión ni otras capacidades multimodales; es exclusivamente ASR.

## Casos de uso

- Transcripción de notas de voz en tamil en móviles: al ser un modelo ligero (190 MB) y rápido, puede ejecutarse localmente en apps de notas o mensajería para convertir audios a texto sin conexión.
- Subtitulado automático de vídeos en tamil: integrable en herramientas de edición de vídeo o plataformas de contenido, procesando pistas de audio en lote con whisper.cpp.
- Asistente de voz para accesibilidad: usuarios con discapacidad auditiva pueden leer transcripciones en tiempo real de conversaciones o reuniones en tamil.
- Transcripción de reuniones y entrevistas: profesionales que trabajan con audio en tamil pueden generar actas o resúmenes textuales de grabaciones, ejecutando el modelo en un portátil o servidor modesto.
- Investigación lingüística: análisis de corpus orales en tamil, convirtiendo grabaciones de campo a texto para su posterior procesamiento.
- Automatización de atención al cliente: transcripción de llamadas de soporte en tamil para generar registros o alimentar sistemas de análisis de sentimiento, ejecutándose en servidores de bajo coste.

## Benchmarks y rendimiento

El autor proporciona mediciones propias sobre 24 clips de FLEURS `ta_in`, evaluadas con whisper.cpp usando decodificación greedy y sin timestamps:

| Metrica | Valor |
|---|---|
| Word error rate (WER) | 20,4% |
| Character error rate (CER) | 4,9% |

La puntuación romaniza tanto la referencia como la hipótesis a un alfabeto común antes de comparar, para no penalizar variantes ortográficas legítimas. No se proporcionan comparaciones con otros modelos ASR en tamil.

## Requisitos de hardware

- Tamaño del modelo: 190 MB en q5_1.
- Inferencia en CPU: funciona en un Snapdragon 720G (2020, gama media) con 4 hilos a velocidad superior a tiempo real.
- VRAM: no requiere GPU; puede ejecutarse en CPU con memoria RAM normal.
- GPU recomendada: no necesaria, aunque puede usar GPU si se compila whisper.cpp con soporte CUDA o Metal.
- Opciones de despliegue: whisper.cpp (línea de comandos `whisper-cli`, bindings C/C++), también se puede usar con Ollama o vLLM? No, esos son para LLMs, no para ASR. Mejor mencionar solo whisper.cpp y sus wrappers.
- Latencia: no hay datos exactos, pero el autor indica "faster than real time" en el hardware mencionado.

## Comparativa con modelos similares

No se dispone de datos comparativos frente a otros modelos ASR en tamil dentro de la información proporcionada. El modelo original `vasista22/whisper-tamil-medium` existe como alternativa de mayor tamaño, pero no se ofrecen métricas comparadas. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Es imprescindible usar la opción `no_timestamps` (`-nt`) en whisper.cpp. Si se activan los timestamps, el modelo produce texto fluido pero completamente ajeno al audio, con un WER del 47,5% en hindi (medido por el autor).
- El WER de 20,4% en tamil indica que no es perfecto; puede fallar en acentos, ruido de fondo o vocabulario especializado.
- Solo soporta tamil; no es multilingüe.
- Al ser una cuantización q5_1, puede haber ligeras degradaciones frente al modelo en float16, aunque el autor reporta diferencias mínimas en hindi.
- La licencia apache-2.0 permite uso comercial, pero el modelo base Whisper es MIT (OpenAI); se debe mantener la atribución correspondiente al fine-tuning original.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado con datos de habla, puede reflejar sesgos dialectales o demográficos presentes en el corpus de entrenamiento del fine-tuning.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bhaskaro/ainotes-whisper-tamil-q5_1
- Modelo base (fine-tuning original): https://huggingface.co/vasista22/whisper-tamil-small
- Repositorio whisper.cpp: https://github.com/ggml-org/whisper.cpp
- Documentación de conversión de whisper.cpp: https://deepwiki.com/ggml-org/whisper.cpp/5.1-model-download-and-conversion
