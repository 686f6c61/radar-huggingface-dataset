# Phoonnx/vits-de_de-kerstin-medium-espeak

## Resumen

vits-de_de-kerstin-medium-espeak es una voz de sintesis de voz (text-to-speech) en aleman, basada en la arquitectura VITS del ecosistema Piper y distribuida en formato ONNX por el proyecto phoonnx de TigreGotico. El modelo original fue entrenado por Rhasspy dentro de la coleccion piper-voices, concretamente la voz `de_DE-kerstin-medium`, y esta publicacion es una conversion a ONNX que no altera los pesos, acompanada de copias cuantizadas a int8.

El modelo resuelve la sintesis de voz offline en aleman estandar (de-DE) con una unica hablante, muestreo a 22050 Hz y entrada basada en fonemas generados por espeak-ng (alfabeto IPA). Al ser un modelo compacto (grafo fp32 de 63,2 MB e int8 de 18,7 MB) y con un factor de tiempo real (RTF) de 0,038 en fp32 sobre CPU, esta pensado para entornos sin GPU: asistentes de voz, sistemas embebidos, lectura de texto en aplicaciones de escritorio y pipelines de OVOS.

Su relevancia actual reside en la licencia CC0 1.0, que permite uso comercial sin restricciones de atribucion obligatoria (aunque se solicita credito a Rhasspy), y en la verificacion de calidad incluida: pruebas de inteligibilidad con ASR (WER 0,200 en fp32 y 0,160 en int8) y validacion de que la cuantizacion no degrada la salida de forma significativa. No es un modelo de lenguaje: es un sintetizador acustico condicionado por fonemas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Piper) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada por fonemas; sin ventana de contexto) |
| Tipos de cuantizacion | fp32 (ONNX) e int8 dinamica (QInt8, onnxruntime.quantization.quantize_dynamic) |
| Idiomas soportados | aleman (de-DE) |
| Licencia | CC0 1.0 |
| Formato de pesos | ONNX (`.onnx` y `<graph>_int8.onnx`) |
| Frecuencia de muestreo | 22050 Hz |
| Hablantes | 1 (Kerstin) |
| Entrada de texto | fonemas espeak-ng (IPA) |
| Puntuacion de clausula | , . ! ? : ; (preservada desde phoonnx 1.96.1a1) |
| Tamano del repositorio | 0,1 GB |
| Grafo fp32 | 63,2 MB |
| Grafo int8 | 18,7 MB |
| Pico de RSS | 256,3 MB (fp32) / 216,8 MB (int8) |
| RTF (mediana de 3, 4 hilos) | 0,038 (fp32) / 0,090 (int8) |

## Arquitectura y entrenamiento

El modelo emplea VITS (Variational Inference for Text-to-Speech), una arquitectura de sintesis extremo a extremo que combina un codificador de texto, un prior variacional, un decodificador acustico y un discriminador adversarial en entrenamiento, integrada en el marco Piper. La entrada no es texto crudo sino fonemas en IPA producidos por espeak-ng con la voz `de`, y la salida es audio a 22050 Hz. La voz esta entrenada con puntuacion de clausula, lo que permite pausas y entonacion mas naturales en frases compuestas.

Segun la model card, el entrenamiento upstream consistio en un ajuste fino (fine-tuning) desde el modelo base en ingles estadounidense `hifi_tts_92` (calidad media, voz de Cori Samuel, lectora 92 de Hi-Fi TTS), con las tecnicas MRD y SDP, y requiere Piper 1.5 o superior. Los datos de entrenamiento provienen del repositorio OHF-Voice/voice-datasets bajo licencia CC0, aunque el numero exacto de horas y la composicion del corpus no estan registrados en la informacion disponible. No se documentan fases de RLHF ni DPO, algo esperable en un modelo TTS. La publicacion de phoonnx anade la conversion a ONNX y la cuantizacion dinamica int8, verificada con un gate que exige audio finito, no silencioso, con longitud entre 0,8 y 1,25 veces la de fp32 y un WER no superior al de fp32 mas 0,05.

## Capacidades

- Sintesis de voz en aleman estandar (de-DE) con una unica hablante femenina identificada como Kerstin.
- Conversion de texto a fonemas mediante espeak-ng (voz `de`) y sintesis acustica a partir de IPA.
- Respeto de la puntuacion de clausula (, . ! ? : ;) para pausas y segmentacion prosodica.
- Generacion de audio WAV a 22050 Hz mediante la API `synthesize_wav` de phoonnx.
- Inferencia en CPU con alto rendimiento (RTF 0,038 en fp32), sin necesidad de GPU.
- Ejecucion con pesos fp32 o int8, con degradacion controlada y verificada en la version cuantizada.
- Integracion con el asistente OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- No soporta tool calling, agentes, vision, audio de entrada ni razonamiento multi-paso: es exclusivamente un sintetizador de voz.

## Casos de uso

- Asistentes de voz locales en OVOS: la voz se selecciona en `mycroft.conf` mediante el plugin `ovos-tts-plugin-phoonnx` y responde en aleman sin conexion, aprovechando el bajo consumo de CPU y el RTF de 0,038.
- Lectura de texto en aplicaciones de escritorio: integracion via la API de phoonnx para convertir articulos, notificaciones o documentos a audio WAV con una huella de memoria inferior a 260 MB.
- Sistemas embebidos y dispositivos de bajo consumo: el grafo int8 de 18,7 MB y el pico de RSS de 216,8 MB permiten desplegarlo en Raspberry Pi o mini-PC sin GPU.
- Generacion de audiolibros y contenido pregrabado: sintesis por lotes de parrafos largos con puntuacion preservada, exportando WAV a 22050 Hz para postprocesado.
- Accesibilidad para personas con discapacidad visual: lectura de interfaces y contenido web en aleman en tiempo real, con latencia determinada por el RTF y no por la longitud total del texto.
- Pruebas de regresion en pipelines de TTS: la verificacion ASR incluida (WER 0,200 fp32 / 0,160 int8) sirve como referencia para validar cambios en el fonemizador o en la cuantizacion.
- Prototipado de interfaces conversacionales en aleman: al ser CC0, se puede usar en demos y productos comerciales sin negociacion de licencia.

## Benchmarks y rendimiento

Los unicos datos publicados son las pruebas de calidad de la propia model card, medidas con ASR `nemo-parakeet-tdt-0.6b-v3` int8 sobre 3 frases de FLORES-200 devtest:

| Metrica | fp32 | int8 |
|---|---|---|
| Resultado del gate | pass | pass |
| WER | 0,200 | 0,160 |
| Caracteres por segundo | 15,5 a 17,3 | no disponible |
| Longitud int8 / fp32 | no aplica | 0,98 a 1,00 |
| Tamano del grafo | 63,2 MB | 18,7 MB |
| Pico de RSS | 256,3 MB | 216,8 MB |
| RTF (mediana de 3, 4 hilos) | 0,038 | 0,090 |

Medido en un Intel Core i9-11900H a 2,50 GHz. No se han publicado resultados de benchmarks comparativos (MOS, MCD, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; la inferencia se ejecuta en CPU con ONNX Runtime.
- Memoria RAM: pico de RSS de 256,3 MB en fp32 y 216,8 MB en int8.
- GPU recomendadas: no disponibles ni necesarias; el modelo no esta disenado para aceleracion GPU en esta publicacion.
- CPU de referencia: Intel Core i9-11900H a 2,50 GHz con 4 hilos; funciona en cualquier CPU x86-64 moderna.
- Cabe en cualquier equipo consumer, incluidos mini-PC y placas SBC con al menos 512 MB de RAM libre.
- Opciones de despliegue: phoonnx (`pip install --pre phoonnx`), con espeak-ng instalado (`apt install espeak-ng`) o el extra `phoonnx[espeak]`; plugin `ovos-tts-plugin-phoonnx` para OVOS. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS.
- Latencia y throughput: RTF de 0,038 en fp32 implica sintetizar 1 segundo de audio en unos 38 ms; en int8, el RTF sube a 0,090 (unos 90 ms por segundo de audio), por lo que fp32 es mas rapido en esta medicion.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Muestreo | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| vits-de_de-kerstin-medium-espeak (este) | VITS (Piper) | de-DE | 22050 Hz | CC0 1.0 | ONNX fp32/int8 | Conversion phoonnx, QA con WER 0,200/0,160 |
| rhasspy/piper-voices de_DE-kerstin-medium | VITS (Piper) | de-DE | 22050 Hz | CC0 1.0 | Piper (ONNX upstream) | Modelo original del que deriva esta conversion |
| Otras voces Piper de_DE (p. ej. thorsten) | VITS (Piper) | de-DE | 22050 Hz | depende de la voz | ONNX | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de comparativas de calidad (MOS) ni de rendimiento frente a otros sintetizadores en la informacion disponible.

## Limitaciones y advertencias

- Una sola hablante: no permite cambio de voz ni de estilo; toda la salida suena como Kerstin.
- Solo aleman (de-DE): no soporta otros idiomas ni code-switching; texto en otro idioma se fonemizara de forma incorrecta.
- Dependencia de espeak-ng: sin el binario instalado, phoonnx usa el port espyak, cuyos fonemas difieren y pueden producir palabras mal pronunciadas.
- Calidad media: el modelo base es de calidad "medium" y el WER de 0,200 en fp32 indica una inteligibilidad limitada en las pruebas ASR; no es adecuado para doblaje de alta fidelidad.
- Sin datos de entrenamiento documentados: no se conoce el numero de horas ni la composicion del corpus, lo que dificulta evaluar sesgos de acento o dominio.
- Riesgo de prosodia incorrecta en frases muy largas o con puntuacion atipica, aunque la puntuacion de clausula esta soportada.
- La cuantizacion int8, aunque verificada, puede introducir artefactos no capturados por el WER; se recomienda validar en el dominio de uso.
- Licencia CC0 1.0: permite uso comercial sin restricciones, pero se solicita creditar a Rhasspy como autor original.
- La publicacion tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-de_de-kerstin-medium-espeak
- Modelo upstream (Piper): https://huggingface.co/rhasspy/piper-voices/tree/e9c8a39444359388adaa94255becb37a5a2b8e51/de/de_DE/kerstin/medium
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- TigreGotico: https://tigregotico.pt
- Datasets de voz upstream: https://github.com/OHF-Voice/voice-datasets
