# lokutor-ai/oido-ctc-small-stream-int8

## Resumen

Oído streaming (oido-ctc-small-stream-int8) es un modelo de reconocimiento automatico del habla en ingles, derivado de nvidia/stt_en_conformer_ctc_small, ajustado para funcionar en modo streaming sobre audio que llega en tiempo real y cuantizado a int8 para ejecutarse en un microcontrolador ESP32-S3 sin acelerador neuronal. Lo desarrolla lokutor-ai y su problema objetivo es claro: llevar ASR de baja latencia a hardware de 240 MHz con 8 MB de PSRAM y 16 MB de flash, donde no cabe un modelo convencional en punto flotante.

El modelo parte de los pesos de NVIDIA (13 millones de parametros, arquitectura Conformer con cabecera CTC) y anade atencion auto-regresiva troceada en chunks de 8 a 32 frames, convolucion depthwise limitada por chunk y normalizacion global fija de caracteristicas. El encoder consume fragmentos de 1,28 s (32 frames) manteniendo 5 s de contexto izquierdo, de modo que al terminar de hablar solo queda por calcular el ultimo chunk parcial y el texto parcial aparece mientras el usuario habla.

Es relevante porque demuestra que un CTC Conformer pequeno, bien ajustado y cuantizado, supera en precision al reconocedor propietario de Espressif en el mismo chip (6,27 frente a 8,5 de WER en test-clean) y se acerca a Whisper tiny.en en fp32 sobre portatil, con un modelo de 14 MB que cabe en flash. Publicado el 2 de octubre de 2026, el propio autor advierte que las cifras de velocidad son estimadas y que faltan mediciones en placa fisica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer con cabecera CTC, ajustado para streaming con atencion troceada |
| Parametros totales | 13 millones (heredados de nvidia/stt_en_conformer_ctc_small) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 5 s de contexto izquierdo por chunk; chunks por defecto de 32 frames (1,28 s) |
| Tipos de cuantizacion | int8 (aritmetica int8 en chip) |
| Idiomas soportados | en (ingles) |
| Licencia | CC-BY-SA-4.0 (modelo); motor y firmware GPLv3, con licencias comerciales de Lokutor |
| Formato de pesos | TNM1 (oido_stream.tnm, 14,0 MB); tokenizer SentencePiece de 1024 piezas BPE |

## Arquitectura y entrenamiento

La base es un Conformer CTC de NVIDIA de 13 millones de parametros, reimplementado en PyTorch y modificado en dos sentidos. Primero, la atencion se trocea: el encoder trabaja con chunks cuyo tamano se muestrea entre 8 y 32 frames, ademas de contexto completo, y la convolucion depthwise queda limitada al chunk. Segundo, se fija la normalizacion global de caracteristicas, lo que permite procesar audio por fragmentos sin recalcular estadisticas sobre toda la senal. El chunk por defecto en inferencia es de 32 frames con 128 frames de contexto izquierdo.

El ajuste consta de dos etapas y 23.000 pasos en total (script train/train_nemo_stream.py del repositorio). Los datos de entrenamiento combinan LibriSpeech, Common Voice 17 en ingles, VoxPopuli en ingles, Multilingual LibriSpeech en ingles, AMI, VCTK, People's Speech (con transcripciones regeneradas por parakeet-tdt-0.6b-v2), OpenSLR 70 y OpenSLR 83. La segunda etapa anade ruido, musica y babble de MUSAN junto con reverberacion simulada, lo que explica la robustez declarada en condiciones adversas.

## Capacidades

- Reconocimiento de voz en ingles en modo streaming, con emision de texto parcial mientras se habla.
- Modo de contexto completo (no streaming) para maxima precision, con la misma arquitectura y pesos.
- Integracion opcional con un modelo de lenguaje externo (nemo_lm.tlm) para rescoring, lo que reduce el WER de forma notable.
- Ejecucion on-device en microcontrolador ESP32-S3 sin acelerador neuronal, con 14 MB de pesos int8 en flash.
- Tokenizacion SentencePiece de 1024 piezas BPE, compatible con la del modelo original de NVIDIA.
- No dispone de tool calling, function calling, capacidades de agente, vision ni audio mas alla del propio ASR.
- No hay capacidades multilingues: el modelo es exclusivamente en ingles.

## Casos de uso

- Interfaces de voz embebidas en dispositivos de bajo coste: el modelo corre entero en un ESP32-S3 de 8 MB de PSRAM, de modo que un electrodomestico o un wearable puede transcribir comandos sin enviar audio a la nube, con latencia de 1,1 a 1,4 s tras el fin del habla.
- Comandos por voz con texto parcial: al procesar chunks de 1,28 s con 5 s de contexto izquierdo, la interfaz puede mostrar palabras conforme se pronuncian y confirmar la accion cuando el usuario hace una pausa de 0,8 s.
- Domotica y asistentes de habitacion sin conectividad: al no requerir GPU ni servicio externo, permite reconocimiento local en viviendas con red intermitente o requisitos de privacidad estrictos.
- Juguetes y dispositivos educativos interactivos: el coste de hardware se limita a un modulo ESP32-S3-DevKitC-1 y un microfono INMP441, y el firmware se flashea directamente con esp32/tools/flash.sh.
- Etiquetado y prototipado de ASR en escritorio: el build de host (esp32/host) reutiliza el mismo codigo C e int8 que el firmware, por lo que sirve para validar el pipeline completo antes de tocar el hardware.
- Reconocimiento robusto en entornos ruidosos: el ajuste con MUSAN y reverberacion simulada esta pensado para salas reales, y el autor reporta 8,96 de WER medio en streaming sobre 14 condiciones de ruido y reverberacion de 300 frases cada una (6,22 en modo contexto completo).
- Investigacion en TinyML y cuantizacion extrema: el repositorio publica el motor en C, los scripts de entrenamiento y las herramientas de empaquetado TNM1, utiles para estudiar el equilibrio entre troceado de atencion y precision.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card. Todos los WER estan expresados en porcentaje; las cifras del modelo no estan verificadas de forma independiente.

| Configuracion | LibriSpeech test-clean | LibriSpeech test-other |
|---|---|---|
| Este modelo, streaming (chunks de 32 frames), greedy | 6,27 | 13,06 |
| Este modelo, streaming (chunks de 32 frames) + modelo de lenguaje | 4,86 | 11,03 |
| Este modelo, contexto completo, greedy | 4,07 | 8,97 |
| Este modelo, contexto completo + modelo de lenguaje | 3,43 | 7,78 |
| Oido int8, modo utterance (sin streaming) | 3,70 | 8,23 |
| Espressif MultiNet7 en el mismo chip (benchmark ESP-SR) | 8,5 | 21,3 |
| Whisper tiny.en, fp32 en portatil (subconjuntos de 500 frases) | 6,3 | 15,9 |

WER medio sobre 14 condiciones de ruido y reverberacion (300 frases por condicion, ruido DEMAND, babble y salas simuladas, con modelo de lenguaje): 8,96 en streaming y 6,22 en contexto completo, frente a 7,45 del Oido en modo utterance y 12,1 de Whisper tiny.en.

Latencia estimada: el texto final llega entre 1,1 y 1,4 s despues de dejar de hablar (0,8 s de pausa de fin de habla mas 0,25-0,6 s de computo del ultimo chunk), frente a unos 3 s del modo utterance para un comando de 2 a 4 s. Factor de tiempo real estimado mientras se habla: 0,80-1,00 con chunks de 32 frames.

## Requisitos de hardware

- Objetivo principal: ESP32-S3 a 240 MHz de doble nucleo, con 8 MB de PSRAM y 16 MB de flash, sin acelerador neuronal. Placa de referencia: ESP32-S3-DevKitC-1 N16R8 con microfono INMP441.
- Huella de disco: 14,0 MB de pesos int8 en formato TNM1, mas el tokenizer SentencePiece y el modelo de lenguaje opcional nemo_lm.tlm.
- GPU: no aplica para el despliegue objetivo; el modelo esta disenado para no necesitar GPU. Para construir o reconvertir pesos, el autor no especifica requisitos de GPU.
- Cabe en GPU de consumo y en portatil en el sentido trivial de que el build de host se ejecuta en CPU; no se publican cifras de VRAM porque la inferencia de referencia no usa GPU.
- Opciones de despliegue: compilacion de host propia (cd esp32/host && make) con live_demo.py para microfono de portatil, y flasheo del firmware con esp32/tools/flash.sh. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Throughput y latencia: factor de tiempo real estimado de 0,80-1,00 durante el habla. El autor advierte que la velocidad es estimada, no medida en placa: los recuentos de instrucciones son exactos, pero el chip esta limitado por el ancho de banda de flash y PSRAM, y el procesado por chunks relee los pesos en cada fragmento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / modo | WER test-clean | WER test-other | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| oido-ctc-small-stream-int8 | 13 M | streaming, 5 s de contexto izquierdo, chunks de 32 frames | 6,27 | 13,06 | CC-BY-SA-4.0 | HuggingFace, 0 descargas |
| oido-ctc-small-int8 (mismo autor) | 13 M | modo utterance, sin streaming | 3,70 | 8,23 | no disponible en la informacion proporcionada | HuggingFace |
| Espressif MultiNet7 | no disponible | reconocedor propio del chip, benchmark ESP-SR | 8,5 | 21,3 | no disponible en la informacion proporcionada | integrado en ESP-SR |
| Whisper tiny.en | no disponible | fp32 en portatil, subconjuntos de 500 frases | 6,3 | 15,9 | no disponible en la informacion proporcionada | HuggingFace |
| nvidia/stt_en_conformer_ctc_small | 13 M | contexto completo, modelo base original | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | CC-BY-4.0 | HuggingFace |

## Limitaciones y advertencias

- Solo ingles: no hay soporte multilingue, y el propio autor etiqueta el modelo con language: en.
- Los WER declarados no estan verificados de forma independiente (verified: false en el model-index) y proceden del build de host del motor, con la misma aritmetica int8, no de mediciones en placa fisica.
- La velocidad es estimada, no medida: los recuentos de instrucciones son exactos, pero el rendimiento real depende del ancho de banda de flash y PSRAM. El firmware en streaming bajo el emulador QEMU de Espressif produjo transcripciones identicas al build de host en los clips comparados, pero no sustituye a una placa real.
- El procesado por chunks relee los pesos en cada fragmento, lo que penaliza el throughput en hardware con memoria limitada.
- Penalizacion clara de precision en streaming frente a contexto completo: 6,27 frente a 4,07 en test-clean y 13,06 frente a 8,97 en test-other con decodificacion greedy.
- Licencia CC-BY-SA-4.0 por herencia de corpus share-alike (People's Speech, OpenSLR 70 y 83): impone obligaciones de atribucion y de compartir bajo la misma licencia, algo a revisar antes de integrarlo en un producto propietario.
- El motor y el firmware son GPLv3, con licencias comerciales disponibles a traves de Lokutor; el uso comercial del conjunto requiere revisar esa via.
- Riesgo de alucinacion propio de los modelos CTC con modelo de lenguaje externo: el rescoring mejora el WER pero puede introducir sustituciones plausibles en audio ambiguo o ruidoso.
- El repositorio figura con 0 descargas, 0 likes y un tamano declarado de 0,0 GB, lo que sugiere que el modelo es muy reciente y carece de validacion por parte de la comunidad.
- El tokenizer esta limitado a 1024 piezas BPE, lo que restringe el vocabulario efectivo comparado con tokenizadores de mayor tamano.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lokutor-ai/oido-ctc-small-stream-int8
- Modelo base: https://huggingface.co/nvidia/stt_en_conformer_ctc_small
- Variante sin streaming (incluye el modelo de lenguaje nemo_lm.tlm): https://huggingface.co/lokutor-ai/oido-ctc-small-int8
- Repositorio de codigo, firmware y herramientas (GPLv3): https://github.com/lokutor-ai/oido
- Muestras de audio: https://lokutor-ai.github.io/oido/
- Licencias comerciales de Lokutor: https://lokutor.com
- Dataset LibriSpeech: https://huggingface.co/datasets/openslr/librispeech_asr
- Dataset Common Voice 17.0: https://huggingface.co/datasets/mozilla-foundation/common_voice_17_0
- Dataset Multilingual LibriSpeech: https://huggingface.co/datasets/facebook/multilingual_librispeech
- Dataset People's Speech: https://huggingface.co/datasets/MLCommons/peoples_speech
