# lokutor-ai/oido-es-ctc-small-int8

## Resumen

Oído es un modelo de reconocimiento automático del habla (ASR) en español que se ejecuta íntegramente en un microcontrolador ESP32-S3 de unos 5 dólares, sin acelerador neuronal ni conexión a la nube. Lo desarrolla lokutor-ai y parte de `nvidia/stt_en_conformer_ctc_small`, un Conformer CTC de 13 millones de parámetros al que se ha sustituido el vocabulario por uno español y se ha reentrenado sobre 2.492 horas de audio en castellano procedente de Common Voice 17, VoxPopuli, Multilingual LibriSpeech y FLEURS, con aumento de datos de ruido, música, babble y reverberación. El resultado se cuantiza a int8 y se empaqueta en un fichero de 14,0 MB (formato propietario TNM1), acompañado de un modelo de lenguaje GRU español de 1,3 millones de parámetros para búsqueda por haces en el propio chip.

La relevancia del modelo está en su perfil de despliegue: no es un ASR de servidor recortado, sino un motor completo (pesos, vocabulario SentencePiece de 1024 piezas y LM) que cabe en 8 MB de PSRAM y 16 MB de flash y funciona tanto en modo frase completa como en modo streaming con fragmentos de 32 tramas. Frente a alternativas genéricas como Whisper tiny en fp32 ejecutándose en un portátil, el autor reporta un WER notablemente menor en los cuatro corpus de evaluación en español, aunque advierte que la comparación está sesgada a su favor porque él sí ha entrenado con las particiones de entrenamiento de esos corpus y Whisper tiny es zero-shot.

El estado del proyecto a 3 de octubre de 2026 es temprano: las cifras de WER proceden de la compilación de escritorio del motor (mismo código C, misma aritmética int8) y la velocidad (0,7–0,95× tiempo real en modo frase) es una estimación por conteo de instrucciones, no una medida sobre placa. El repositorio de HuggingFace acumula 0 descargas y 0 likes, y el motor y firmware asociados se distribuyen en GitHub bajo GPLv3 con licencias comerciales alternativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer CTC (encoder Conformer + cabecera CTC), modelo denso |
| Parametros totales | 13 M en el modelo acústico; 1,3 M adicionales en el modelo de lenguaje GRU |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no aplica en tokens; en streaming, fragmentos de 32 tramas con 128 tramas de contexto izquierdo (valores declarados por el autor) |
| Tipos de cuantizacion | int8 (aritmética int8 en el chip) |
| Idiomas soportados | español (es, incluida la variante es_419 en la evaluacion de FLEURS) |
| Licencia | cc-by-4.0 (modelo y LM); el motor y el firmware del repositorio GitHub son GPLv3, con licencias comerciales disponibles |
| Formato de pesos | TNM1 propietario (`oido_es.tnm`, 14,0 MB); modelo de lenguaje en `oido_es.tlm` (1,3 MB); tokenizador SentencePiece unigram de 1024 piezas en `tokenizer.model` |

## Arquitectura y entrenamiento

El modelo es un Conformer CTC derivado de `nvidia/stt_en_conformer_ctc_small`, es decir, un encoder de tipo Conformer (convoluciones + autoatención) con decodificación CTC, de 13 millones de parámetros. El autor sustituye el vocabulario inglés por uno español de 1024 piezas SentencePiece unigram y reajusta los pesos sobre 2.492 horas de audio en español. Los corpus de entrenamiento son Common Voice 17, VoxPopuli, Multilingual LibriSpeech y FLEURS, con aumento de datos mediante ruido, música, babble y reverberación (MUSAN). Para el filtrado de clips no validados de Common Voice se conservaron únicamente aquellos en los que `nvidia/stt_es_conformer_ctc_large` coincidía con la referencia.

Sobre el modelo acústico se añade un modelo de lenguaje GRU español de 1,3 millones de parámetros que permite búsqueda por haces en el propio microcontrolador. Los pesos de interpolación del LM (0,5 / 1,5) se eligieron mediante una rejilla pequeña evaluada sobre subconjuntos de los propios conjuntos de test, en un óptimo plano, según reconoce el autor. El flujo de exportación pasa por `train/export_nemo.py` y produce el formato TNM1 con el vocabulario embebido; el mismo binario admite modo frase completa y modo streaming (fragmento de 32 tramas, contexto izquierdo de 128).

## Capacidades

- Reconocimiento de voz en español de vocabulario abierto: cualquier frase en castellano, no una lista cerrada de comandos.
- Dos modos de decodificación: frase completa (utterance) y streaming con fragmentos de 32 tramas y 128 tramas de contexto izquierdo.
- Decodificación greedy o con modelo de lenguaje GRU integrado en el chip (búsqueda por haces), con mejora de WER de entre 3,6 y 6,2 puntos porcentuales según el corpus.
- Robustez declarada frente a ruido, música, babble y reverberación, incorporada mediante aumento de datos en el fine-tuning.
- Ejecución completamente local: no requiere red, ni GPU, ni acelerador neuronal.
- Escritura de números como palabras (el modelo transcribe "veintitrés", no "23").
- Soporte de tool calling / function calling: no aplica (modelo de ASR, no generativo de texto libre).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades de visión o audio más allá del ASR: no disponibles.

## Casos de uso

- Domótica por voz sin nube: un ESP32-S3 con micrófono I2S integrado en un interruptor o altavoz reconoce órdenes en español de vocabulario abierto con 14 MB de pesos en flash, sin enviar audio a ningún servidor.
- Dispositivos industriales o agrícolas sin conectividad: partes de trabajo, incidencias y lecturas dictadas por voz en campo, donde no hay cobertura ni presupuesto para un SoC con acelerador.
- Cumplimiento de privacidad y RGPD: al no salir el audio del dispositivo, encaja en entornos sanitarios, jurídicos o de recursos humanos donde el envío de voz a un servicio cloud es problemático.
- Juguetes, wearables y electrónica de bajo coste: el binario de 14 MB y el LM de 1,3 MB permiten dictado en español en hardware de menos de 10 dólares con 8 MB de PSRAM y 16 MB de flash.
- Accesibilidad: control por voz de sillas de ruedas, pulsadores o interfaces domóticas para personas con movilidad reducida, con latencia local y sin dependencia de red.
- Confirmación por voz en logística: operarios de almacén que validan picking o recepción de mercancía dictando referencias, con procesamiento en el propio terminal y sin infraestructura wifi fiable.
- Desarrollo y validación en escritorio: el propio repositorio incluye una compilación para host (`esp32/host`, `live_demo.py --model es`) que permite probar el motor con el micrófono del portátil antes de desplegar en placa.
- Notas de voz y transcripción offline asistida por LM: en la compilación de host, el modo con modelo de lenguaje reduce el WER a 10,9–15,7 % según corpus, suficiente para actas y notas dictadas de dominio general.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre los conjuntos de test completos (60 horas), aritmética int8 en chip. WER en porcentaje, menor es mejor:

| Sistema | Common Voice 17 (es) | MLS (es) | VoxPopuli (es) | FLEURS (es_419) |
|---|---|---|---|---|
| Este modelo, greedy | 19,99 | 14,53 | 20,25 | 16,62 |
| Este modelo + modelo de lenguaje | 13,75 | 10,90 | 15,68 | 11,32 |

Subconjuntos de 400 enunciados equiespaciados por test set (333 en FLEURS tras descartar referencias con dígitos), misma normalización para todos los sistemas:

| Sistema | Ejecucion | Common Voice | MLS | VoxPopuli | FLEURS |
|---|---|---|---|---|---|
| Este modelo + LM | ESP32-S3 | 13,3 | 10,6 | 15,5 | 11,3 |
| Este modelo, greedy | ESP32-S3 | 20,3 | 14,2 | 20,0 | 16,9 |
| Este modelo, streaming (32 tramas) + LM | ESP32-S3 | 15,2 | 12,1 | 16,3 | 12,8 |
| Whisper tiny (multilingue), fp32 | portatil | 33,0 | 21,5 | 28,7 | 17,1 |

Advertencia del propio autor: el fine-tuning se hizo sobre las particiones de entrenamiento de estos corpus y Whisper tiny es zero-shot, por lo que la comparación favorece a este modelo en esos dominios. Ninguna de las métricas está verificada de forma independiente (`verified: false`).

## Requisitos de hardware

- No requiere GPU ni VRAM dedicada: el destino es un microcontrolador ESP32-S3 (240 MHz, doble núcleo, 8 MB PSRAM, 16 MB flash, sin acelerador neuronal).
- Huella en memoria: 14,0 MB de pesos int8 (`oido_es.tnm`) más 1,3 MB del modelo de lenguaje (`oido_es.tlm`); el vocabulario va embebido en el fichero TNM1.
- Placa de referencia indicada por el autor: ESP32-S3-DevKitC-1 N16R8 con micrófono INMP441.
- GPU recomendadas: no aplica. La inferencia en la nube o en GPU no es el caso de uso; para desarrollo se compila el motor en el host (x86) con `make`.
- Compatibilidad con GPU de consumo (RTX 4090, etc.): no aplica; el cuello de botella es la SRAM del microcontrolador, no la memoria de vídeo.
- Opciones de despliegue: firmware propio en C del repositorio `lokutor-ai/oido` (`tools/flash.sh /dev/ttyUSB0 ... oido_es.tnm`); no hay integración con vLLM, llama.cpp, Ollama o TGI, que no aplican a un modelo CTC int8 para MCU.
- Latencia y throughput: el autor estima 0,7–0,95× tiempo real en modo frase, a partir de conteos exactos de instrucciones; no se ha medido sobre placa física. La verificación en el emulador QEMU de Espressif coincide con la compilación de host en la mayoría de enunciados, con posibles diferencias de una palabra en los inciertos.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma | Contexto | WER declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| oido-es-ctc-small-int8 | 13 M + 1,3 M LM | es | streaming 32 tramas / 128 de contexto | 13,75 / 10,90 / 15,68 / 11,32 (CV / MLS / VP / FLEURS, con LM) | cc-by-4.0 | HuggingFace (0 descargas) y GitHub |
| nvidia/stt_en_conformer_ctc_small | 13 M | en | no disponible | no disponible en la informacion proporcionada | cc-by-4.0 | HuggingFace (modelo base del que deriva) |
| nvidia/stt_es_conformer_ctc_large | no disponible | es | no disponible | no disponible en la informacion proporcionada | cc-by-4.0 | HuggingFace (usado para filtrar clips de Common Voice) |
| Whisper tiny (multilingue), fp32 | no disponible | multilingue | no aplica | 33,0 / 21,5 / 28,7 / 17,1 en los subconjuntos de 400 enunciados | no disponible en la informacion proporcionada | ejecucion en portatil, no en MCU |
| lokutor-ai/oido-ctc-small-int8 | no disponible | en | no disponible | no disponible | cc-by-4.0 | HuggingFace (variante inglesa del mismo autor) |

## Limitaciones y advertencias

- Todas las métricas están marcadas como no verificadas (`verified: false`) y proceden de la compilación de host del firmware, no de una placa ESP32-S3 real; bajo QEMU pueden aparecer diferencias de una palabra en enunciados dudosos por el comportamiento de la librería matemática.
- La velocidad (0,7–0,95× tiempo real) es una estimación por conteo de instrucciones, no una medida sobre hardware; el rendimiento real en placa puede diferir.
- El modelo está ajustado sobre las particiones de entrenamiento de Common Voice, VoxPopuli, MLS y FLEURS, por lo que las cifras de esos dominios están optimistas; el autor espera un error mayor en llamadas telefónicas, acentos regionales marcados y vocabulario especializado.
- No existe todavía un benchmark de ruido en español, así que la robustez declarada frente a ruido y reverberación no está cuantificada de forma independiente.
- Los pesos del modelo de lenguaje (0,5 / 1,5) se eligieron sobre subconjuntos de los propios conjuntos de test, en un óptimo plano, lo que introduce un riesgo de sobreajuste a test en la decodificación con LM.
- El modelo escribe los números como palabras, lo que obliga a una normalización posterior si el texto se consume por programas; en FLEURS se descartaron 67 referencias con dígitos por este motivo (333 de 400 enunciados evaluados).
- Alcance lingüístico limitado al español; no hay soporte multilingüe ni cambio de idioma.
- Licencia del modelo y del LM: CC-BY-4.0, que exige atribución a NVIDIA y a lokutor-ai y permite uso comercial. El motor y el firmware del repositorio GitHub son GPLv3, lo que puede condicionar productos propietarios; el autor ofrece licencias comerciales alternativas.
- Sesgos conocidos: no se documentan análisis de sesgo por acento, género o edad; el propio autor advierte de mayor error con acentos regionales fuertes.
- Riesgo de alucinación: inherente a la decodificación CTC con LM; el LM puede inducir palabras plausibles en fragmentos ambiguos, especialmente en streaming.
- Adopción nula por el momento (0 descargas, 0 likes, repositorio de 0,0 GB en el momento de la consulta), lo que implica poca validación externa y posible rotación de la API o del formato TNM1.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lokutor-ai/oido-es-ctc-small-int8
- Repositorio de código, firmware y herramientas: https://github.com/lokutor-ai/oido (GPLv3, licencias comerciales disponibles)
- Modelo base: https://huggingface.co/nvidia/stt_en_conformer_ctc_small
- Variante inglesa int8: https://huggingface.co/lokutor-ai/oido-ctc-small-int8
- Variante inglesa en streaming: https://huggingface.co/lokutor-ai/oido-ctc-small-stream-int8
- Datasets citados: mozilla-foundation/common_voice_17_0, facebook/voxpopuli, facebook/multilingual_librispeech, google/fleurs, MUSAN (aumento de datos)
- Resultados de la busqueda web: no se han encontrado enlaces relevantes; los resultados devueltos no guardan relación con el modelo ni con reconocimiento de voz.
