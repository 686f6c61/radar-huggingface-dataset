# Phoonnx/vits-de_de-thorsten-medium-espeak-v2

## Resumen

`Phoonnx/vits-de_de-thorsten-medium-espeak-v2` es una voz de síntesis de voz (text-to-speech) en alemán estándar (`de-DE`) basada en la arquitectura VITS empleada por Piper. La publica TigreGotico (bajo el identificador Phoonnx) como conversión a ONNX del modelo original de Rhasspy `rhasspy/piper-voices/de/de_DE/thorsten/medium`, fijado al commit `e9c8a39444`. No es un modelo de lenguaje: es un sintetizador acústico de un solo hablante que convierte fonemas espeak-ng en audio a 22050 Hz.

La relevancia de esta revisión (`v2`) es que sustituye a `Phoonnx/vits-de_de-thorsten-medium-espeak`: el modelo upstream fue reentrenado sobre las bases de Piper 1.5, y esta conversión incorpora esos pesos nuevos. Se distribuye en formato ONNX, con copias `int8` generadas mediante cuantización dinámica de onnxruntime, y está pensada para integrarse en el ecosistema phoonnx y en asistentes OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.

El modelo es deliberadamente pequeño: el grafo fp32 ocupa 63,2 MB y la versión int8 18,7 MB, con un pico de RSS de 232,7 MB y 182,3 MB respectivamente. Está licenciado bajo CC0 1.0, lo que permite uso comercial sin restricciones de atribución obligatoria (aunque el autor pide crédito a Rhasspy).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Piper), exportada a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; entrada en fonemas espeak-ng) |
| Tipos de cuantizacion | fp32 y int8 (cuantizacion dinamica con onnxruntime 1.32.0, pesos QInt8) |
| Idiomas soportados | aleman (`de-DE`) |
| Licencia | CC0 1.0 |
| Formato de pesos | ONNX (`<graph>.onnx` y `<graph>_int8.onnx`) |
| Frecuencia de muestreo | 22050 Hz |
| Hablantes | 1 |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA |
| Puntuacion de clausula | `, . ! ? : ;` (conservada en sintesis desde phoonnx 1.96.1a1) |
| Tamano del repositorio | 0,1 GB |
| Voice id | `piper/de_DE-thorsten-medium-v2` |

## Arquitectura y entrenamiento

VITS es un modelo generativo condicional de extremo a extremo que combina un encoder de texto, un predictor de duraciones, un normalizing flow y un decoder basado en HiFi-GAN, entrenado de forma adversarial con estimacion variacional. La variante Piper anade un frontend fonemizador externo (espeak-ng en este caso) y produce audio a 22050 Hz. La inferencia por defecto usa `noise_scale` 0.5 y `noise_w` 0.333, y requiere Piper 1.5 o superior.

Segun la model card, el modelo upstream se obtuvo por fine-tuning desde el modelo base `rdh` (calidad media, `nl_BE`, un hablante flamenco, CC0) con MRD y SDP. Los datos de entrenamiento no estan registrados en el repositorio upstream; la fuente declarada es el proyecto Thorsten-Voice (https://github.com/thorstenMueller/Thorsten-Voice), bajo licencia CC0. No se documenta el numero de tokens ni la composicion exacta del corpus. La conversion a ONNX no modifica los pesos; las copias int8 si los cuantizan.

## Capacidades

- Sintesis de voz en aleman estandar (`de-DE`) a partir de texto, con un unico hablante (voz Thorsten).
- Fonemizacion mediante espeak-ng (voz `de`); tambien se puede usar el port espyak incluido en `phoonnx[espeak]`, con la advertencia de que algunos fonemas difieren y pueden producir errores de pronunciacion.
- Respeto de la puntuacion de clausula (`, . ! ? : ;`) en la sintesis, lo que permite pausas y entonacion mas naturales en frases largas.
- Salida de audio WAV a 22050 Hz mediante `voice.synthesize_wav`.
- Integracion como plugin de TTS en OVOS (`ovos-tts-plugin-phoonnx`), seleccionable por `voice` en `mycroft.conf`.
- Ejecucion en CPU sin GPU, con latencias muy bajas (ver seccion de rendimiento).
- No soporta tool calling, agentes, vision, audio de entrada, modo thinking ni razonamiento multi-paso: es exclusivamente un sintetizador de voz.

## Casos de uso

- Asistentes de voz en aleman autoalojados: integrar la voz en OVOS mediante `ovos-tts-plugin-phoonnx` para respuestas habladas en un asistente domestico, con la ventaja de que el modelo corre en CPU y no requiere GPU.
- Lectura de notificaciones y alertas en aplicaciones industriales o de monitorizacion: el bajo RTF (0,040 en fp32 con 4 hilos) permite generar avisos hablados en tiempo real en un servidor modesto.
- Accesibilidad para personas con discapacidad visual: convertir articulos o mensajes en audio aleman con una voz natural y CC0, sin costes de licencia ni dependencia de servicios en la nube.
- Generacion de audiolibros o contenido educativo en aleman: la licencia CC0 permite distribuir el audio generado sin restricciones, y la puntuacion de clausula mejora la prosodia en parrafos largos.
- Prototipado de interfaces conversacionales: al ocupar 18,7 MB en int8 y 182,3 MB de pico de RSS, se puede desplegar en contenedores pequenos o dispositivos edge para pruebas de UX de voz.
- Doblaje y locucion automatizada de contenido interno: sintesis por lotes de guiones en aleman con una sola voz consistente, usando la version fp32 para maxima calidad o int8 para ahorro de memoria.
- Pruebas de regresion de pipelines TTS: servir como voz de referencia en CI para validar la integracion de phoonnx, gracias a su QA documentado con WER y RTF reproducibles.

## Benchmarks y rendimiento

La model card documenta una evaluacion de calidad (QA) con ASR `nemo-parakeet-tdt-0.6b-v3` int8 sobre 3 frases de FLORES-200 devtest:

| Metrica | fp32 | int8 |
|---|---|---|
| Resultado QA | pass | pass |
| WER | 0,120 | 0,120 |
| Caracteres por segundo | 17,3 a 20,5 | no disponible |
| Longitud int8 / fp32 | no aplica | 0,97 a 1,02 |
| Tamano del grafo | 63,2 MB | 18,7 MB |
| Pico de RSS | 232,7 MB | 182,3 MB |
| RTF (mediana de 3, 4 hilos) | 0,040 | 0,089 |

Medido en un Intel Core i9-11900H (11a generacion) a 2,50 GHz. El RTF es el tiempo de sintesis dividido por la duracion del audio. No se han publicado resultados de benchmarks comparativos con otros modelos TTS en la informacion disponible.

## Requisitos de hardware

- VRAM: no requiere GPU; la inferencia es en CPU. Memoria RAM estimada segun el pico de RSS documentado: 232,7 MB en fp32 y 182,3 MB en int8.
- GPU recomendadas: no aplica; el modelo esta pensado para CPU. Cualquier GPU moderna podria ejecutar ONNX Runtime, pero no se documentan cifras.
- Cabe en cualquier consumer GPU y en practicamente cualquier CPU moderna; tambien en dispositivos edge con ~200 MB de RAM libre.
- Opciones de despliegue: `phoonnx` (libreria nativa, `pip install --pre phoonnx`), plugin `ovos-tts-plugin-phoonnx` para OVOS, y ONNX Runtime directamente. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo TTS).
- Latencia y throughput: RTF 0,040 en fp32 y 0,089 en int8 con 4 hilos en i9-11900H; es decir, sintetiza audio entre 11 y 25 veces mas rapido que tiempo real en ese hardware.
- Dependencia externa: espeak-ng instalado en el sistema (`apt install espeak-ng`) o el port espyak via `phoonnx[espeak]`.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Frecuencia | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| `Phoonnx/vits-de_de-thorsten-medium-espeak-v2` (este) | VITS (Piper) | de-DE | 22050 Hz | CC0 1.0 | ONNX fp32/int8 | Conversion de Piper 1.5, QA con WER 0,120 |
| `Phoonnx/vits-de_de-thorsten-medium-espeak` | VITS (Piper) | de-DE | 22050 Hz | CC0 1.0 | ONNX | Version anterior con pesos previos a Piper 1.5; sustituida por esta |
| `rhasspy/piper-voices` (de_DE thorsten medium) | VITS (Piper) | de-DE | 22050 Hz | CC0 1.0 | Piper (ONNX upstream) | Modelo original del que deriva esta conversion |
| Otros modelos TTS multilingues (p. ej. XTTS, Bark) | no disponible | multi | variable | variable | variable | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- Un solo hablante y un solo idioma (`de-DE`): no sirve para otros idiomas ni para clonacion de voz.
- La fonemizacion depende de espeak-ng; con el port espyak algunos fonemas difieren y pueden producir palabras mal pronunciadas.
- Requiere Piper 1.5 o superior en el upstream; versiones anteriores de phoonnx (previas a 1.96.1a1) no conservan la puntuacion de clausula en sintesis.
- Los datos de entrenamiento no estan registrados upstream, por lo que no se puede auditar la composicion del corpus ni detectar sesgos de dominio; al derivar de una voz flamenca (`rdh`) y un corpus aleman (Thorsten-Voice), puede presentar un acento o prosodia no neutros.
- Riesgo de alucinacion acustica: como todo TTS, puede producir pronunciaciones erroneas en palabras extranas, siglas o nombres propios no vistos en entrenamiento.
- El QA se realizo con solo 3 frases de FLORES-200 devtest; el WER de 0,120 debe interpretarse como indicativo, no como una evaluacion exhaustiva.
- La version int8 tiene un RTF peor que fp32 (0,089 frente a 0,040) en el hardware medido; la cuantizacion ahorra memoria pero no acelera en ese caso.
- Licencia CC0 1.0: permite uso comercial sin restricciones, aunque el autor solicita credito a Rhasspy. Verificar la licencia del corpus Thorsten-Voice si se redistribuye audio derivado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-de_de-thorsten-medium-espeak-v2
- Modelo upstream (Piper, commit fijado): https://huggingface.co/rhasspy/piper-voices/tree/e9c8a39444359388adaa94255becb37a5a2b8e51/de/de_DE/thorsten/medium
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- TigreGotico: https://tigregotico.pt
- Proyecto Thorsten-Voice (datos de entrenamiento): https://github.com/thorstenMueller/Thorsten-Voice
- Version anterior sustituida: https://huggingface.co/Phoonnx/vits-de_de-thorsten-medium-espeak
