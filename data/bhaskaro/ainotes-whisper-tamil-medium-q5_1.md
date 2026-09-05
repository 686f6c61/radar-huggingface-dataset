# bhaskaro/ainotes-whisper-tamil-medium-q5_1

## Resumen

El modelo `bhaskaro/ainotes-whisper-tamil-medium-q5_1` es una conversión del fine-tune `vasista22/whisper-tamil-medium` al formato GGML, cuantizado a q5_1 para su ejecución con whisper.cpp en dispositivos Android. Se trata de un modelo de reconocimiento automático de voz (ASR) especializado en tamil, basado en la arquitectura Whisper medium de OpenAI. El objetivo es ofrecer una alternativa de mayor precisión al modelo small de 190 MB que ya se distribuye en la aplicación ainotes, a costa de un mayor coste computacional. Según las mediciones del autor, en el conjunto FLEURS ta_in alcanza un WER del 20,3 % y un CER del 5,1 %, frente al 22,9 % y 5,6 % del modelo small.

El archivo final pesa 587 MB y está publicado bajo licencia Apache-2.0. La cuantización q5_1 permite su uso en móviles, aunque el tiempo de inferencia en un dispositivo de gama media es considerablemente mayor que el del modelo small. El modelo está pensado para transcribir notas de voz en tamil, no como reemplazo del small sino como opción de mayor precisión cuando el tiempo de espera es aceptable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (transformer encoder-decoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Ventana de audio de 30 segundos (fija, estandar de Whisper) |
| Tipos de cuantizacion | q5_1 (GGML) |
| Idiomas soportados | Tamil (ta) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGML |

## Arquitectura y entrenamiento

El modelo mantiene la arquitectura Whisper medium, un transformer encoder-decoder con atencion estandar. El fine-tune original fue entrenado por vasista22 sobre datos de tamil, aunque no se dispone de informacion detallada sobre el dataset ni el proceso de entrenamiento. La conversion a GGML se realizo con el script `convert-h5-to-ggml.py` de whisper.cpp, verificando la tabla de tokens byte a byte contra la referencia `ggml-small`. La cuantizacion a q5_1 reduce el tamano del archivo a 587 MB, lo que permite su ejecucion en dispositivos moviles.

Una caracteristica destacable es que el modelo fue entrenado con la prediccion de timestamps deshabilitada. Por ello, es obligatorio usar la opcion `no_timestamps` en whisper.cpp para evitar fallos de decodificacion. Segun la model card, si se confia en los tokens de timestamp, el decodificador abandona el audio y genera texto fluido pero no relacionado, con un WER del 47,5 % en el modelo hindi equivalente.

## Capacidades

- Reconocimiento automatico de voz en tamil.
- Transcripcion de audio de hasta 30 segundos por ventana.
- Disenado para funcionar con whisper.cpp y decodificacion greedy.
- Requiere la opcion `no_timestamps`; el uso de timestamps provoca alucinaciones y un WER del 47,5 % en el modelo hindi equivalente.
- Mayor precision que el modelo small q5_1 en FLEURS ta_in (20,3 % vs 22,9 % de WER).
- No soporta tool calling, vision ni generacion de texto; es exclusivamente un modelo de ASR.

## Casos de uso

- Transcripcion de notas de voz en tamil en aplicaciones moviles Android: el modelo esta cuantizado para whisper.cpp y puede ejecutarse en la CPU del telefono, lo que lo hace adecuado para apps de toma de notas como ainotes.
- Dictado profesional en tamil para medicos, abogados o periodistas: la mayor precision frente al modelo small justifica el mayor tiempo de espera en entornos donde la transcripcion exacta es critica.
- Subtitulado automatico de contenido en tamil para accesibilidad: el modelo transcribe audio de hasta 30 segundos por ventana, util para generar subtitulos en videos cortos o fragmentos de audio.
- Analisis de llamadas de atencion al cliente en tamil: la transcripcion automatizada permite buscar incidencias, evaluar la calidad del servicio y extraer datos de las conversaciones.
- Documentacion de reuniones o entrevistas en tamil: las notas de voz se transcriben para su archivo y busqueda posterior, aprovechando la licencia Apache-2.0 para uso comercial.
- Investigacion linguistica sobre el tamil: el modelo puede transcribir corpus de audio para analisis fonetico, lexico o de variantes dialectales, con un WER medido en FLEURS ta_in.

## Benchmarks y rendimiento

| Dataset | Metrica | medium q5_1 | small q5_1 |
|---|---|---|---|
| FLEURS ta_in (64 clips) | WER | 20,3 % | 22,9 % |
| FLEURS ta_in (64 clips) | CER | 5,1 % | 5,6 % |

Mediciones realizadas por el autor con `no_timestamps`, decodificacion greedy y romanizacion antes de la puntuacion. El tiempo de inferencia en un Realme RMX2170 (2 nucleos grandes a 2,3 GHz) fue de aproximadamente 200 segundos por nota, frente a 33 segundos para el modelo small, es decir, unas seis veces mas lento. El autor indica que la memoria disponible se mantuvo en 2,7 GB durante las pruebas, descartando presion de memoria.

## Requisitos de hardware

- El archivo pesa 587 MB, por lo que puede cargarse en la RAM de cualquier smartphone moderno.
- En un Realme RMX2170 (2 nucleos grandes a 2,3 GHz) tarda unos 200 segundos por nota de audio, frente a 33 segundos para el modelo small.
- No se requieren GPU; la inferencia se realiza en CPU.
- Opciones de despliegue: whisper.cpp en Android; tambien puede usarse en sistemas de escritorio con whisper.cpp.
- No hay datos de VRAM porque no esta pensado para ejecucion en GPU.
- La latencia es por nota de audio, no por segundo de habla: una nota de cuatro segundos cuesta lo mismo que una de veintinueve.

## Comparativa con modelos similares

| Modelo | Idioma | Tamano | WER (FLEURS) | Licencia |
|---|---|---|---|---|
| ainotes-whisper-tamil-medium-q5_1 | Tamil | 587 MB | 20,3 % | Apache-2.0 |
| ainotes-whisper-small-q5_1 | Tamil | 190 MB | 22,9 % | Apache-2.0 |
| ainotes-whisper-hindi-medium-q5_1 | Hindi | 587 MB | no disponible | Apache-2.0 |
| vasista22/whisper-tamil-medium | Tamil | no disponible | no disponible | Apache-2.0 |

El modelo hindi medium es el equivalente para hindi del mismo autor; no se han publicado mediciones de WER en la informacion disponible. El modelo base de vasista22 no incluye datos de rendimiento en la model card consultada.

## Limitaciones y advertencias

- Es obligatorio usar `no_timestamps`; si se activan los timestamps, el modelo se degrada gravemente y puede generar texto no relacionado con el audio.
- El rendimiento es unas seis veces mas lento que el modelo small en el dispositivo de prueba, lo que puede no ser adecuado para aplicaciones en tiempo real.
- Solo soporta tamil; no es multilingue.
- La cuantizacion q5_1 puede introducir una ligera perdida de precision respecto al modelo original en fp16, aunque no se han publicado mediciones comparativas.
- No se han publicado evaluaciones de sesgos, alucinaciones o comportamiento en dominios especificos.
- La licencia Apache-2.0 permite uso comercial, pero exige atribucion a los autores originales del fine-tune y de la conversion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bhaskaro/ainotes-whisper-tamil-medium-q5_1
- Modelo base: https://huggingface.co/vasista22/whisper-tamil-medium
- Modelo similar en hindi: https://huggingface.co/bhaskaro/ainotes-whisper-hindi-medium-q5_1
