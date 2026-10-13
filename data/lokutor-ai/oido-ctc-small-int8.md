# lokutor-ai/oido-ctc-small-int8

## Resumen

Oído CTC small int8 es un modelo de reconocimiento automático de habla (ASR) en inglés, de vocabulario abierto, empaquetado para ejecutarse íntegramente en un microcontrolador ESP32-S3 sin acelerador neuronal y sin conexión a la nube. Lo publica lokutor-ai y deriva de nvidia/stt_en_conformer_ctc_small, un Conformer-CTC de 13 M de parámetros que aquí se reimplementa en PyTorch, se cuantiza a int8 y se reempaqueta en el formato propietario TNM1 (fichero nemo8.tnm de 14,0 MB). Se acompaña de un tokenizador SentencePiece de 1024 piezas BPE y, de forma opcional, de un modelo de lenguaje GRU de 1,3 M de parámetros (nemo_lm.tlm) para decodificación con beam search 4.

El interés del modelo es de ingeniería: demuestra que un sistema ASR de vocabulario abierto cabe en un chip de bajo coste (240 MHz, 8 MB de PSRAM, 16 MB de flash) manteniendo una precisión próxima al modelo original en fp32. Declara 3,70 % de WER en LibriSpeech test-clean y 8,23 % en test-other con aritmética int8 y decodificación greedy en el motor del ESP32-S3, frente a 3,68 % y 8,11 % del modelo fp32 original; con el LM en chip baja a 3,33 % y 7,15 %.

Está publicado bajo licencia CC-BY-4.0, mientras que el motor y el firmware del repositorio son GPLv3 con licencias comerciales alternativas. Existen variantes en int4 (8,3 MB), en streaming (int8) y en español. En el momento de redactar esta ficha el repositorio acumula 4 likes y 0 descargas, y el modelo aún no funciona en tiempo real: mide 1,97× el tiempo real en un núcleo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Conformer-CTC (encoder Conformer con decodificación CTC), reimplementado en PyTorch a partir de nvidia/stt_en_conformer_ctc_small; motor de inferencia propio en C para MCU |
| Parámetros totales | 13 M (modelo ASR); modelo de lenguaje opcional de 1,3 M (GRU) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de utterance; los clips de referencia medidos van de 3,6 s a 10,6 s de audio) |
| Tipos de cuantización | int8 en formato TNM1 (fichero nemo8.tnm); existe una variante int4 en otro repositorio |
| Idiomas soportados | inglés (en); la variante en español se publica en un repositorio aparte |
| Licencia | CC-BY-4.0 (pesos y LM). El motor y el firmware del repositorio son GPLv3, con licencias comerciales disponibles a través de Lokutor |
| Formato de pesos | TNM1 (nemo8.tnm, 14,0 MB) y tokenizador SentencePiece (tokenizer.model, 1024 piezas BPE); no se distribuyen safetensors ni GGUF |
| Tokenizador | SentencePiece, 1024 piezas BPE |
| Modelo base | nvidia/stt_en_conformer_ctc_small |
| Dataset declarado | openslr/librispeech_asr |
| Hardware objetivo | ESP32-S3 (dual-core 240 MHz, 8 MB PSRAM, 16 MB flash) |

## Arquitectura y entrenamiento

La arquitectura es un Conformer-CTC pequeño: un encoder Conformer que combina bloques de auto-atención y convoluciones, seguido de un cabezal CTC que evita el decodificador autorregresivo y simplifica el despliegue en un microcontrolador. Lokutor parte de los pesos de nvidia/stt_en_conformer_ctc_small (13 M de parámetros), los reimplementa en PyTorch, los cuantiza a int8 y los reempaqueta en el formato TNM1 que consume su motor en chip. El vocabulario de salida es de 1024 piezas BPE, lo que mantiene reducido el tamaño de la matriz de salida y el coste de memoria.

El entrenamiento original está asociado al dataset openslr/librispeech_asr (habla inglesa de lectura); la información disponible no detalla el número de horas, la composición exacta del corpus ni si hubo etapas de ajuste fino adicionales, y no se documentan técnicas de RLHF o DPO, que no resultan habituales en ASR. La innovación destacable no está en el entrenamiento, sino en el motor de inferencia: aritmética int8 en el propio chip, decodificación greedy y, opcionalmente, beam search 4 apoyado en nemo_lm.tlm, un GRU de 1,3 M de parámetros entrenado únicamente con el texto de dominio público del corpus de LM de LibriSpeech. Los WER publicados se calculan con la compilación de host del firmware (mismo código C, misma aritmética int8) y las transcripciones de la placa coinciden con las del emulador exacto a nivel de instrucción en los 27 clips de prueba.

## Capacidades

- Reconocimiento de voz en inglés de vocabulario abierto, no limitado a un conjunto cerrado de comandos.
- Inferencia completamente local en un ESP32-S3, sin nube ni acelerador neuronal.
- Modo utterance (transcribe el clip completo tras detectar el final del habla) en este fichero; la variante streaming del mismo autor emite texto mientras se habla.
- Decodificación greedy en int8 y, opcionalmente, beam search 4 con el modelo de lenguaje GRU en chip.
- Ejecución de la misma aritmética int8 en el build de host para escritorio (tasr_cli), útil para validar antes de flashear.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, visión, audio generativo, puntuación, mayúsculas ni marcas de tiempo.

## Casos de uso

- Comandos de voz en dispositivos domóticos o industriales sin conectividad: el modelo se ejecuta en el propio ESP32-S3, de modo que el dispositivo interpreta vocabulario abierto en local sin enviar audio a ningún servidor.
- Productos de consumo de bajo coste con privacidad por diseño: juguetes, electrodomésticos o dispositivos de accesibilidad que transcriben en el chip y solo transmiten texto, evitando subir audio a la nube.
- Sensórica remota con enlace estrecho: un nodo alimentado por batería puede convertir audio en texto antes de transmitir por LoRa u otros enlaces de bajo ancho de banda.
- Automatización de notas de voz en hardware dedicado: grabadoras o pulsadores que generan una transcripción local aprovechando los 14,0 MB de pesos en flash y la espera de fin de habla de 0,8 s.
- Validación de corpus y ajuste de umbrales antes de desplegar: con el build de host (esp32/host/tasr_cli) se puede medir el WER sobre grabaciones propias con la misma aritmética int8 que ejecutará la placa.
- Investigación en TinyML y cuantización: sirve como referencia reproducible para estudiar los límites de precisión de un Conformer-CTC int8 en un microcontrolador sin acelerador, incluida la comparación con y sin LM en chip.
- Etiquetado o subtitulado en quioscos y paneles fuera de línea: al no requerir GPU ni red, puede integrarse en terminales con hardware mínimo y contenido en inglés.
- Selección de variante según restricciones de producto: la versión int4 (8,3 MB) libera 6 MB de partición de aplicación cuando el presupuesto de flash es el factor limitante, a cambio de 4,61 / 9,98 % de WER.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card y en el model-index (métricas marcadas como no verificadas de forma independiente). WER en porcentaje sobre LibriSpeech.

| Sistema | test-clean | test-other |
|---|---|---|
| oido-ctc-small-int8 en motor ESP32-S3 (int8, greedy) | 3,70 | 8,23 |
| oido-ctc-small-int8 + LM en chip (beam 4) | 3,33 | 7,15 |
| Modelo original fp32 (PyTorch, nvidia/stt_en_conformer_ctc_small) | 3,68 | 8,11 |
| Espressif MultiNet7 en el mismo chip (benchmark ESP-SR) | 8,5 | 21,3 |
| Whisper tiny.en fp32 en portátil (subconjuntos de 500 enunciados) | 6,3 | 15,9 |

Datos de velocidad declarados (9 de octubre de 2026, placa ESP32-S3-WROOM-1-N16R8, un núcleo a 240 MHz): 1,97× el tiempo real (rango 1,91–2,02 sobre 27 clips), de modo que un comando de 4 s muestra su texto unos 8,7 s después de terminar el audio, incluida la espera de 0,8 s de fin de habla. El WER sobre esos 27 clips es del 7,14 % tanto en la placa como en el build de host. No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo no está pensado para GPU y no se publican requisitos de VRAM para inferencia en GPU.
- Objetivo principal: ESP32-S3 con 8 MB de PSRAM y 16 MB de flash; el autor cita la placa ESP32-S3-WROOM-1-N16R8 y el kit ESP32-S3-DevKitC-1 N16R8 con micrófono INMP441.
- Almacenamiento en flash: 14,0 MB para nemo8.tnm, más 1,3 MB si se usa el modelo de lenguaje; la variante int4 ocupa 8,3 MB y deja 6 MB de partición de aplicación libre.
- Cabe en hardware de consumo, pero no en el sentido de GPU doméstica: el destino es un microcontrolador de unos 5 dólares, no una tarjeta gráfica.
- Ejecución en portátil: build de host del mismo motor (esp32/host/tasr_cli) para pruebas y cálculo de WER; live_demo.py para la variante streaming.
- Despliegue: firmware propio del repositorio mediante esp32/tools/flash.sh; no hay soporte publicado para vLLM, llama.cpp, Ollama, TGI ni servidores de inferencia convencionales, ya que el formato TNM1 es específico del motor de Lokutor.
- Latencia medida: 1,97× el tiempo real con un núcleo a 240 MHz; un clip de 4 s produce texto aproximadamente 8,7 s después de acabar, incluida la espera de fin de habla de 0,8 s. El modo dual-core, que la emulación predecía cercano al tiempo real, genera transcripciones incorrectas en silicio y está deshabilitado.
- La variante streaming tarda entre 4,1 y 11,1 s en mostrar el texto final para clips de 3,6 a 10,6 s, aproximadamente la mitad de espera que el modo utterance, con cierto coste de precisión.
- Throughput: no disponible más allá de la relación con el tiempo real indicada.

## Comparativa con modelos similares

Comparación dentro de la propia familia Oído y con alternativas de ASR en el mismo nicho (edge, inglés, baja latencia).

| Modelo | Idioma | Modos | Tamaño | WER clean / other (%) | Licencia |
|---|---|---|---|---|---|
| oido-ctc-small-int8 (este modelo) | Inglés | utterance | 14,0 MB (+1,3 MB LM) | 3,70 / 8,23 (3,33 / 7,15 con LM) | CC-BY-4.0 |
| oido-ctc-small-int4 | Inglés | utterance (el más pequeño) | 8,3 MB | 4,61 / 9,98 | CC-BY-SA-4.0 |
| oido-ctc-small-stream-int8 | Inglés | streaming + contexto completo | 14,0 MB | no disponible en la información | CC-BY-SA-4.0 |
| oido-es-ctc-small-int8 | Español | streaming + contexto completo en un solo fichero | 14,0 MB (+1,3 MB LM) | no disponible en la información | CC-BY-4.0 |
| Espressif MultiNet7 (mismo chip, benchmark ESP-SR) | Inglés | comandos en chip | no disponible | 8,5 / 21,3 | no disponible en la información |
| Whisper tiny.en fp32 (portátil) | Inglés | utterance | no disponible | 6,3 / 15,9 (subconjuntos de 500 enunciados) | no disponible en la información |
| nvidia/stt_en_conformer_ctc_small (fp32) | Inglés | utterance | 13 M de parámetros | 3,68 / 8,11 | CC-BY-4.0 |

## Limitaciones y advertencias

- Cobertura de un solo idioma: únicamente inglés; el español se distribuye como modelo separado.
- Precisión desigual por dominio: 8,23 % de WER en LibriSpeech test-other frente a 3,70 % en test-clean; no se documenta comportamiento en habla espontánea, acentos no nativos, ruido de fondo ni audio telefónico.
- Métricas no verificadas: los resultados del model-index están marcados con verified: false, es decir, son declaraciones del autor sin validación independiente publicada.
- No funciona en tiempo real: 1,97× el tiempo real en un núcleo, con una espera de unos 8,7 s para un clip de 4 s; el modo dual-core está deshabilitado porque produce transcripciones incorrectas en silicio.
- Diferencias numéricas entre entornos: la biblioteca matemática del portátil redondea de forma distinta y cambia alguna palabra en clips difíciles; solo 22 de 27 clips coinciden entre placa y host.
- Riesgo de alucinación y de errores de sustitución: no se documentan tasas específicas ni mecanismos de confianza o filtrado de salidas; al ser un CTC de vocabulario abierto, puede emitir palabras plausibles no presentes en el audio.
- Sin datos sobre sesgos: la información disponible no incluye evaluaciones de sesgo por acento, género, edad ni origen.
- Funcionalidad limitada de formato: no se documentan puntuación, mayúsculas, marcas de tiempo ni diarización.
- Vocabulario reducido: el tokenizador SentencePiece de 1024 piezas puede penalizar nombres propios, siglas y términos técnicos poco frecuentes.
- Licencias en dos capas: los pesos son CC-BY-4.0 y exigen atribución; el motor y el firmware del repositorio son GPLv3, lo que impone obligaciones de copyleft y requiere una licencia comercial de Lokutor para integrarlo en productos propietarios.
- Estado de publicación incipiente: 0 descargas y 4 likes en el momento de redactar la ficha, y el repositorio declara un tamaño de 0,0 GB, coherente con pesos alojados en otro formato; conviene validar la reproducibilidad del empaquetado antes de llevarlo a producción.
- Detalles de entrenamiento ausentes: no se especifican horas de audio, composición del dataset más allá de LibriSpeech ni procesos de ajuste posteriores, lo que dificulta anticipar el comportamiento fuera del dominio de habla leída.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lokutor-ai/oido-ctc-small-int8
- Paper (Oído: Open-Vocabulary Speech Recognition on a $5 Microcontroller without a Neural Accelerator): https://huggingface.co/papers/2610.13447 (arXiv 2610.13447)
- Repositorio de código, firmware y herramientas: https://github.com/lokutor-ai/oido
- Detalles de velocidad y memoria: https://github.com/lokutor-ai/oido#speed-and-memory
- Demo en vídeo: https://huggingface.co/lokutor-ai/oido-ctc-small-int8/resolve/main/demo.mp4
- Modelo base: https://huggingface.co/nvidia/stt_en_conformer_ctc_small
- Dataset declarado: https://huggingface.co/datasets/openslr/librispeech_asr
- Variante int4: https://huggingface.co/lokutor-ai/oido-ctc-small-int4
- Variante streaming int8: https://huggingface.co/lokutor-ai/oido-ctc-small-stream-int8
- Variante en español: https://huggingface.co/lokutor-ai/oido-es-ctc-small-int8
- Lokutor (licencias comerciales): https://lokutor.com
