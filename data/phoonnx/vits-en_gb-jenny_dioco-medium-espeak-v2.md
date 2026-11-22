# Phoonnx/vits-en_gb-jenny_dioco-medium-espeak-v2

## Resumen

`Phoonnx/vits-en_gb-jenny_dioco-medium-espeak-v2` es una voz de sintesis de voz (text-to-speech) en ingles britanico basada en la arquitectura VITS del ecosistema Piper, convertida a formato ONNX para su uso con la libreria phoonnx de TigreGotico. No es un modelo de lenguaje: es un modelo acustico de sintesis que transforma fonemas espeak (alfabeto IPA) en audio a 22050 Hz. Su relevancia es practica: permite sintesis de voz local, ligera y determinista en entornos sin GPU, con un grafo de 63,2 MB en fp32 y 18,7 MB en int8.

El modelo deriva del checkpoint upstream `rhasspy/piper-voices/en/en_GB/jenny_dioco/medium`, entrenado por Rhasspy sobre el dataset Jenny (Dioco). Esta version v2 sustituye a la anterior `Phoonnx/vits-en_gb-jenny_dioco-medium-espeak` porque el upstream reentreno la voz sobre los modelos base Piper 1.5 (commit `e9c8a39444`). La conversion a ONNX no altera los pesos; la version int8 los cuantiza dinamicamente.

El interes para desarrolladores es doble: por un lado, ofrece una voz inglesa de calidad media con licencia que permite uso comercial con atribucion; por otro, su formato ONNX y su bajo consumo de memoria (RSS pico de 253,4 MB en fp32, 214,6 MB en int8) la hacen adecuada para asistentes de voz embebidos, sistemas OVOS y despliegues en CPU sin acelerador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Piper), modelo acustico TTS |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada: fonemas IPA de la frase a sintetizar) |
| Tipos de cuantizacion | fp32 e int8 (cuantizacion dinamica con onnxruntime, pesos QInt8) |
| Idiomas soportados | en-GB (ingles britanico) |
| Licencia | other: licencia del dataset Jenny (Dioco), atribucion y uso comercial permitido |
| Formato de pesos | ONNX (`<graph>.onnx` y `<graph>_int8.onnx`) |
| Frecuencia de muestreo | 22050 Hz |
| Numero de hablantes | 1 |
| Entrada de texto | fonemas espeak (IPA), con puntuacion de clausula `, . ! ? : ;` |
| Fonemizador | espeak-ng, voz `en-gb-x-rp` |
| Tamano del grafo | 63,2 MB (fp32) / 18,7 MB (int8) |
| Memoria pico (RSS) | 253,4 MB (fp32) / 214,6 MB (int8) |
| RTF (mediana de 3, 4 hilos) | 0,041 (fp32) / 0,124 (int8) |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

VITS es una arquitectura de sintesis end-to-end que combina un encoder de texto, un predictor de duraciones, un flujo normalizador y un decoder generativo (GAN) para producir audio directamente a partir de fonemas. La variante Piper anade un fonemizador externo (espeak-ng) y un formato de pesos optimizado para inferencia en CPU. En este caso, la entrada no es texto crudo sino fonemas IPA generados por espeak-ng con la voz `en-gb-x-rp`; por tanto, el pipeline de produccion debe incluir un paso de fonemizacion previo.

El entrenamiento upstream parte de un fine-tuning sobre el modelo base `hifi_tts_92` (ingles estadounidense, calidad media, voz de Cori Samuel, lector 92 de Hi-Fi TTS), aplicando MRD y SDP. El dataset de entrenamiento es el Jenny (Dioco) TTS Dataset, publicado en GitHub por dioco-group. Los ajustes de inferencia por defecto son `noise_scale` 0,5 y `noise_w` 0,333, y se requiere Piper 1.5 o superior. El numero de tokens de entrenamiento, la composicion exacta del dataset y el checkpoint base no estan registrados en el repositorio. La conversion a ONNX la realiza TigreGotico sin modificar los pesos; la copia int8 se genera con `onnxruntime.quantization.quantize_dynamic` (onnxruntime 1.32.0).

## Capacidades

- Sintesis de voz mono-hablante en ingles britanico (en-GB) a 22050 Hz.
- Entrada basada en fonemas IPA generados por espeak-ng (voz `en-gb-x-rp`), no en texto libre.
- Respeto de la puntuacion de clausula (`, . ! ? : ;`) a partir de phoonnx 1.96.1a1.
- Salida de audio WAV mediante la API `synthesize_wav` de phoonnx.
- Inferencia en CPU sin GPU, con grafo ONNX de 18,7 MB en int8.
- Integracion con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- No soporta tool calling, agentes, vision, audio de entrada ni razonamiento multi-paso: es exclusivamente TTS.
- No soporta cambio de hablante ni de idioma en tiempo de ejecucion.

## Casos de uso

- Asistentes de voz embebidos en OVOS: la voz se selecciona en `mycroft.conf` con el plugin `ovos-tts-plugin-phoonnx` y el identificador `piper/en_GB-jenny_dioco-medium-v2`, adecuada para dispositivos con poca memoria gracias a su RSS pico de ~215 MB en int8.
- Lectura de notificaciones y alertas en ingles britanico: el modelo sintetiza frases cortas con puntuacion de clausula, lo que permite entonacion basica en mensajes de sistema sin depender de servicios en la nube.
- Generacion de audiolibros o podcasts de bajo coste: con RTF de 0,041 en fp32 sobre un i9-11900H, se puede sintetizar audio mas rapido que tiempo real en CPU, lo que abarata la produccion por lotes.
- Accesibilidad y lectores de pantalla: la licencia permite uso comercial con atribucion, de modo que se puede integrar en aplicaciones de lectura en voz alta para usuarios con discapacidad visual.
- Pruebas de regresion en pipelines de TTS: el modelo incluye una puerta de calidad (WER medido con ASR nemo-parakeet-tdt-0.6b-v3 int8 sobre FLORES-200 devtest) que sirve como referencia para validar cambios en el pipeline de fonemizacion.
- Prototipado de interfaces conversacionales: al ser un modelo ONNX pequeno, se puede desplegar en contenedores ligeros o en el edge para demos de voz sin infraestructura GPU.
- Localizacion de contenido para audiencias britanicas: al usar la voz `en-gb-x-rp`, ofrece una pronunciacion britanica consistente para materiales formativos o corporativos dirigidos a ese mercado.

## Benchmarks y rendimiento

Los unicos datos publicados son las comprobaciones de calidad y rendimiento del autor, medidas con ASR `nemo-parakeet-tdt-0.6b-v3` int8 sobre 3 frases de FLORES-200 devtest en un Intel Core i9-11900H a 2,50 GHz:

| Metrica | fp32 | int8 |
|---|---|---|
| Resultado de la puerta de calidad | pass | pass |
| WER | 0,000 | 0,000 |
| Caracteres por segundo | 15,5 a 21,8 | no disponible |
| Ratio de longitud int8/fp32 | no aplica | 0,99 a 1,05 |
| Tamano del grafo | 63,2 MB | 18,7 MB |
| RSS pico | 253,4 MB | 214,6 MB |
| RTF (mediana de 3, 4 hilos) | 0,041 | 0,124 |

No se han publicado resultados de benchmarks comparativos con otros modelos TTS (MOS, MCD, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM: no requiere GPU; la inferencia es en CPU con ONNX Runtime.
- Memoria RAM: RSS pico de 253,4 MB en fp32 y 214,6 MB en int8.
- CPU recomendada: el autor midio sobre un Intel Core i9-11900H a 2,50 GHz con 4 hilos; cualquier CPU x86-64 moderna deberia funcionar, aunque el RTF variara.
- GPU: no es necesaria; no se han publicado datos de aceleracion por GPU para este modelo.
- Cabe en cualquier equipo de consumo, incluidos Raspberry Pi y mini-PC, siempre que se disponga de espeak-ng.
- Despliegue: libreria phoonnx (`pip install --pre phoonnx`), con espeak-ng instalado (`apt install espeak-ng`) o el port espyak (`pip install --pre "phoonnx[espeak]"`); integracion con OVOS via `ovos-tts-plugin-phoonnx`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no aplican a un modelo TTS.
- Latencia y throughput: RTF de 0,041 en fp32 y 0,124 en int8 sobre el hardware citado, es decir, sintesis mas rapida que tiempo real en ambos casos.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (v2) | VITS Piper | en-GB | ONNX fp32/int8 | Jenny (Dioco), uso comercial con atribucion | Reentrenado sobre Piper 1.5; grafo int8 de 18,7 MB |
| `Phoonnx/vits-en_gb-jenny_dioco-medium-espeak` | VITS Piper | en-GB | ONNX | Jenny (Dioco) | Version anterior con pesos previos a Piper 1.5; sustituida por esta v2 |
| `rhasspy/piper-voices/en/en_GB/jenny_dioco/medium` | VITS Piper | en-GB | pesos Piper originales | Jenny (Dioco) | Upstream sin conversion ONNX; requiere Piper 1.5 o superior |

No se dispone de datos de benchmarks comparativos con otras voces Piper (por ejemplo, otras voces en-GB del repositorio `rhasspy/piper-voices`) en la informacion proporcionada.

## Limitaciones y advertencias

- Solo sintetiza ingles britanico; no soporta otros idiomas ni cambio de hablante.
- Requiere un paso previo de fonemizacion con espeak-ng; sin el, phoonnx puede usar espyak, cuyos fonemas difieren y pueden producir palabras mal pronunciadas.
- La calidad es "medium" segun la nomenclatura Piper; no se han publicado metricas MOS ni comparativas perceptuales.
- El WER de 0,000 se midio sobre solo 3 frases de FLORES-200 devtest, una muestra muy reducida que no garantiza robustez general.
- Riesgo de alucinacion acustica: como todo modelo generativo TTS, puede producir artefactos o pronunciaciones erroneas en palabras fuera de dominio, nombres propios o siglas.
- La licencia es "other" (Jenny/Dioco): permite uso comercial con atribucion, pero es obligatorio acreditar a Rhasspy; conviene revisar los terminos exactos del dataset Jenny antes de un despliegue comercial.
- El repositorio no incluye checkpoint de entrenamiento ni registro de datos de entrenamiento upstream, lo que limita la reproducibilidad.
- No es un modelo de lenguaje: no admite tool calling, agentes, razonamiento ni vision; usarlo fuera de TTS no tiene sentido.
- La cuantizacion int8 aumenta el RTF (0,124 frente a 0,041 en fp32) en el hardware medido, aunque reduce el tamano del grafo; conviene validar ambos modos en el hardware objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-en_gb-jenny_dioco-medium-espeak-v2
- Version anterior: https://huggingface.co/Phoonnx/vits-en_gb-jenny_dioco-medium-espeak
- Modelo upstream (Rhasspy): https://huggingface.co/rhasspy/piper-voices/tree/e9c8a39444359388adaa94255becb37a5a2b8e51/en/en_GB/jenny_dioco/medium
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- TigreGotico: https://tigregotico.pt
- Dataset Jenny (Dioco): https://github.com/dioco-group/jenny-tts-dataset
