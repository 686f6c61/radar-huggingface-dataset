# bhaskaro/ainotes-whisper-urdu-medium-q5_1

## Resumen

El modelo `bhaskaro/ainotes-whisper-urdu-medium-q5_1` es una conversión a GGML y cuantización q5_1 de `ihanif/whisper-medium-urdu`, un fine-tune de Whisper medium especializado en reconocimiento automático de voz en urdu. Ha sido desarrollado por el usuario `bhaskaro` con el objetivo de ofrecer una alternativa de mayor precisión para el uso en dispositivos Android a través de `whisper.cpp`, en el contexto de una aplicación de notas de voz.

El problema que resuelve es la transcripción de audio en urdu con una calidad superior a la del modelo small equivalente, manteniendo un tamaño razonable de 587 MB y la licencia Apache-2.0. La arquitectura subyacente es la de Whisper medium, un transformer encoder-decoder con ventana de audio fija de 30 segundos. Su relevancia actual radica en la posibilidad de ejecutar reconocimiento de voz en urdu de forma local y sin conexión, con una precisión medida del 23,2 % de WER en el conjunto de evaluación FLEURS `ur_pk`, en comparación con el 33,1 % del modelo small.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper medium) |
| Parametros totales | no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 30 segundos de audio (ventana fija de Whisper) |
| Tipos de cuantizacion | q5_1 (GGML) |
| Idiomas soportados | urdu (ur) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGML (whisper.cpp) |
| Tamano del archivo | 587 MB |

## Arquitectura y entrenamiento

El modelo parte de `ihanif/whisper-medium-urdu`, un fine-tune de Whisper medium sobre datos en urdu. La arquitectura es la de Whisper: un transformer encoder-decoder con atención estándar, diseñado para procesar ventanas de audio de hasta 30 segundos. La conversión a GGML se ha realizado mediante la herramienta `convert-h5-to-ggml.py` de `whisper.cpp`, y posteriormente se ha cuantizado a q5_1 para reducir el tamaño y facilitar su ejecución en dispositivos móviles.

No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens ni la composición de los datos. Tampoco se ha documentado el uso de RLHF o DPO. Una característica técnica destacable de esta familia de fine-tunes es que se entrenan con la predicción de timestamps deshabilitada, lo que condiciona su uso: es necesario activar `no_timestamps` en `whisper.cpp` para obtener un rendimiento fiable.

## Capacidades

- Reconocimiento automático de voz (ASR) en urdu, capaz de transcribir audio a texto.
- Optimizado para ejecución local en dispositivos Android mediante `whisper.cpp`.
- Cuantización q5_1 que reduce el tamaño a 587 MB, facilitando el despliegue on-device.
- Funciona sin conexión a internet, lo que garantiza privacidad en el procesamiento del audio.
- No se han documentado capacidades de tool calling, function calling ni soporte de agentes.
- No soporta timestamps de forma fiable; requiere `no_timestamps` para evitar degradaciones graves.
- Capacidades multilingües: no disponible; el modelo está especializado en urdu.

## Casos de uso

- Transcripción de notas de voz en urdu en una aplicación de notas para Android: el modelo puede procesar notas de voz directamente en el dispositivo, sin necesidad de enviar el audio a servidores externos, gracias a su tamaño de 587 MB y su formato GGML compatible con `whisper.cpp`.
- Dictado de mensajes en aplicaciones de mensajería en urdu: los usuarios pueden dictar mensajes y obtener transcripciones locales, lo que resulta útil en entornos con poca conectividad o donde la privacidad es prioritaria.
- Transcripción de entrevistas o reuniones en urdu: permite generar actas textuales de conversaciones en urdu, con la ventaja de que el audio no sale del dispositivo, ideal para contextos sensibles.
- Accesibilidad para personas con dificultades auditivas: el modelo puede generar subtítulos en urdu a partir de audio en tiempo real o de archivos grabados, mejorando la accesibilidad en dispositivos móviles.
- Transcripción de contenido educativo en urdu: estudiantes y docentes pueden convertir clases o conferencias en texto, facilitando el estudio y la búsqueda de contenidos.
- Asistente de voz para personas mayores en urdu: el modelo puede transcribir comandos de voz en urdu para controlar aplicaciones o servicios en el dispositivo, reduciendo la dependencia de la escritura.

## Benchmarks y rendimiento

| Modelo | Tamano | WER (FLEURS ur_pk) | CER (FLEURS ur_pk) |
|---|---|---|---|
| small q5_1 | 190 MB | 33,1 % | 12,1 % |
| medium q5_1 | 587 MB | 23,2 % | 8,4 % |

Las mediciones se realizaron con `whisper.cpp` sobre 64 clips del conjunto FLEURS `ur_pk`, usando `no_timestamps`, decodificación greedy y romanización de escritura común antes de puntuar. El modelo medium q5_1 mejora el WER en 9,9 puntos porcentuales y el CER en 3,7 puntos porcentuales respecto al small q5_1.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo está pensado para ejecución en CPU de dispositivos móviles.
- GPU recomendadas: no disponible.
- Probado en un Realme RMX2170 (2 núcleos grandes a 2,3 GHz) con 2,7 GB de RAM disponible.
- Latencia medida: aproximadamente 200 segundos por nota (5 mediciones: 193, 193, 201, 220 y 221 segundos), frente a 33 segundos para el modelo small. Esta latencia es por nota, no por segundo de audio, debido al padding de Whisper a ventanas de 30 segundos.
- Opciones de despliegue: `whisper.cpp` en Android. No es compatible con vLLM, TGI ni Ollama, al estar en formato GGML específico de `whisper.cpp`.
- Throughput estimado: no disponible.

## Comparativa con modelos similares

| Modelo | Tamano | WER (FLEURS ur_pk) | CER (FLEURS ur_pk) | Formato | Licencia |
|---|---|---|---|---|---|
| bhaskaro/ainotes-whisper-urdu-medium-q5_1 | 587 MB | 23,2 % | 8,4 % | GGML q5_1 | Apache-2.0 |
| bhaskaro/ainotes-whisper-urdu-q5_1 | 190 MB | 33,1 % | 12,1 % | GGML q5_1 | Apache-2.0 |
| ihanif/whisper-medium-urdu | no disponible | no disponible | no disponible | no disponible | Apache-2.0 |

## Limitaciones y advertencias

- Alta latencia en dispositivos móviles: el modelo tarda aproximadamente seis veces más que el modelo small en procesar una nota, lo que puede resultar inaceptable para aplicaciones interactivas en tiempo real.
- Es obligatorio usar `no_timestamps`: estos fine-tunes se entrenan con la predicción de timestamps deshabilitada, y si se activan, el rendimiento se degrada drásticamente. El autor documenta que, en un modelo similar en hindi, el WER pasa del 14,9 % al 47,5 % al confiar en los timestamps.
- Riesgo de alucinación: con timestamps activados, el decodificador puede abandonar el audio y generar texto fluido no relacionado, lo que produce transcripciones falsas.
- Modelo específico para urdu: no se garantiza un rendimiento adecuado en otros idiomas, y no se dispone de información sobre su comportamiento en variantes dialectales.
- Ventana de contexto limitada: cada inferencia procesa como máximo 30 segundos de audio, por lo que audios más largos requieren segmentación.
- No se han publicado evaluaciones de sesgos ni de robustez frente a ruido, acentos o condiciones adversas.
- La licencia Apache-2.0 permite uso comercial, pero exige atribución al autor y aviso de cambios si se modifica el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bhaskaro/ainotes-whisper-urdu-medium-q5_1
- Modelo base: https://huggingface.co/ihanif/whisper-medium-urdu
- Modelo small comparable: https://huggingface.co/bhaskaro/ainotes-whisper-urdu-q5_1
- Perfil del autor en Hugging Face: https://huggingface.co/bhaskaro
