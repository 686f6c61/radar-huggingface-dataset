# lokutor-ai/oido-ctc-small-int4

## Resumen

Oído int4 es un modelo de reconocimiento automático del habla (ASR) en inglés disenado para ejecutarse íntegramente en un microcontrolador ESP32-S3, sin conexión a la nube y sin acelerador neuronal (NPU). Lo desarrolla Lokutor y se distribuye en HuggingFace bajo el identificador `lokutor-ai/oido-ctc-small-int4`. Deriva del modelo `nvidia/stt_en_conformer_ctc_small`, al que se aplicó un ajuste fino con entrenamiento consciente de cuantización (QAT) a 4 bits durante 8.000 pasos.

Su relevancia está en el tamaño: 8,3 MB de pesos que caben en un módulo flash de 16 MB y dejan libre una partición de aplicación de 6 MB. La arquitectura es un Conformer con cabezal CTC, con capas lineales internas en int4 por canal, front-end y cabezal de salida en int8, y activaciones y atención en int8. En una placa ESP32-S3-WROOM-1-N16R8 con un solo núcleo a 240 MHz el modelo se ejecuta a 1,76× tiempo real (1,73–1,83 sobre 10 clips), aproximadamente un 11 % más rápido que la variante int8 del mismo proyecto.

El modelo es de vocabulario abierto (no limitado a comandos predefinidos) y está descrito en el artículo *Oído: Open-Vocabulary Speech Recognition on a $5 Microcontroller without a Neural Accelerator*. Está pensado exclusivamente para inglés y solo funciona en modo locución completa (utterance), no en streaming; para latencia reducida el autor ofrece una variante específica de streaming.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Conformer con cabezal CTC (derivada de `nvidia/stt_en_conformer_ctc_small`) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo ASR; el autor no especifica la ventana de audio máxima) |
| Tipos de cuantización | Int4 por canal en las capas lineales de los bloques Conformer; int8 en front-end, cabezal de salida, activaciones y atención |
| Idiomas soportados | Inglés (en) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | Fichero `.tnm` para el firmware (`models/nemo4.tnm`); el repositorio de HuggingFace no publica safetensors ni GGUF (tamaño del repo: 0,0 GB) |
| Tamaño del modelo | 8,3 MB |
| Tarea (pipeline) | automatic-speech-recognition |
| Modelo base | nvidia/stt_en_conformer_ctc_small (CC-BY-4.0) |
| Modos de inferencia | Solo locución completa (utterance); no soporta streaming |
| Hardware objetivo | ESP32-S3 (p. ej. ESP32-S3-WROOM-1-N16R8, ESP32-S3-DevKitC-1 N16R8) |

## Arquitectura y entrenamiento

La arquitectura es un Conformer (convolución + atención) con cabezal CTC, heredada de `nvidia/stt_en_conformer_ctc_small`. La particularidad está en la cuantización: las capas lineales dentro de los bloques Conformer usan pesos int4 por canal, mientras que el front-end de características y el cabezal de salida se mantienen en int8 junto con las activaciones y las operaciones de atención. Esto permite aritmética int4 en chip, algo poco habitual en un microcontrolador sin acelerador neuronal dedicado. El ajuste se realizó con entrenamiento consciente de cuantización (QAT) de 4 bits durante 8.000 pasos.

Los datos de entrenamiento son exclusivamente corpus públicos: Common Voice 17 y VoxPopuli (CC0); LibriSpeech, MLS English, AMI y VCTK (CC-BY-4.0); OpenSLR 70 y 83 (CC-BY-SA-4.0); y People's Speech, cuyas transcripciones fueron regeneradas con NVIDIA `parakeet-tdt-0.6b-v2`. No se menciona en la información disponible el uso de RLHF ni DPO, algo esperable en un modelo CTC de ASR. La innovación principal no es algorítmica en el sentido de atención lineal o decodificación especulativa, sino de ingeniería: comprimir un Conformer funcional de vocabulario abierto en 8,3 MB y hacerlo correr sobre un microcontrolador de bajo coste.

## Capacidades

- Reconocimiento de voz en inglés de vocabulario abierto, sin gramática ni lista de comandos cerrada.
- Transcripción en modo locución completa (se procesa el audio y se emite el texto al final).
- Salida CTC con decodificación greedy según los resultados declarados.
- Ejecución totalmente local en el dispositivo, sin nube ni NPU.
- Aritmética int4 en chip sobre las capas lineales del Conformer.
- Integración con firmware propio del proyecto Oído y con utilidades de host (`live_demo.py`).
- No soporta tool calling ni function calling.
- No soporta uso agéntico ni razonamiento multi-paso.
- No soporta streaming en esta variante (existe `oido-ctc-small-stream-int8` para ello).
- No dispone de capacidades de visión, audio generativo ni multimodalidad.
- Multilingüismo: solo inglés; existe un modelo separado para español (`oido-es-ctc-small-int8`).

## Casos de uso

- Dispositivos de voz sin conectividad: mandos, juguetes o electrodomésticos con ESP32-S3 que necesitan transcribir órdenes en lenguaje natural sin depender de Wi-Fi ni de un servicio en la nube, gracias a los 8,3 MB de huella de memoria.
- Interfaces de accesibilidad de bajo coste: un botón físico con micrófono INMP441 y un ESP32-S3 puede convertir voz en texto para personas con dificultades motoras, con coste de hardware de unos pocos euros.
- Registro de notas de voz en campo: dispositivos portátiles sin cobertura (agricultura, obra, inspección industrial) que almacenan la transcripción en lugar del audio, reduciendo el consumo de almacenamiento y batería.
- Etiquetado y automatización de transcripción en el borde: preprocesado local de audio para filtrar o indexar antes de enviar solo lo relevante a un sistema mayor, útil cuando el envío de audio bruto plantea problemas de privacidad o ancho de banda.
- Prototipado educativo y de investigación en TinyML: base reproducible para estudiar QAT int4 sobre arquitecturas Conformer en microcontroladores, con pesos y firmware publicados.
- Domótica local con privacidad por diseño: al no salir el audio del dispositivo, el modelo encaja en escenarios donde el cumplimiento normativo exige que la voz no se transmita a terceros.
- Sistemas empotrados con partición de aplicación amplia: al ocupar 8,3 MB en una flash de 16 MB, quedan 6 MB libres para el código de la aplicación, lo que permite lógica de negocio compleja en el mismo chip.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (métricas no verificadas, decodificación greedy con aritmética int4 en chip):

| Modelo | LibriSpeech test-clean (WER %) | LibriSpeech test-other (WER %) | Tamaño |
|---|---|---|---|
| oido-ctc-small-int4 (este modelo) | 4,61 | 9,98 | 8,3 MB |
| oido-ctc-small-int8 | 3,70 | 8,23 | 14,0 MB |
| Espressif MultiNet7 (ESP-SR benchmark, mismo chip) | 8,5 | 21,3 | 2,9 MB |

Datos de velocidad declarados: en una ESP32-S3-WROOM-1-N16R8 con un núcleo a 240 MHz, el modelo int4 corre a 1,76× tiempo real (rango 1,73–1,83 sobre 10 clips), frente a 1,97× del int8, es decir, un 11 % más rápido. El autor indica que el modo de dos núcleos no es correcto sobre silicio y que, en esos 10 clips, la transcripción de la placa coincide con la del build de host en 8 casos (diferencias de redondeo en la última bit de la librería matemática); ambos obtienen 8,33 % de WER en ese conjunto.

## Requisitos de hardware

- VRAM de GPU: no aplica; el modelo está pensado para ejecutarse en microcontrolador, no en GPU.
- Hardware objetivo: ESP32-S3 con 16 MB de flash y 8 MB de PSRAM (variante N16R8). Ejemplo usado por el autor: ESP32-S3-WROOM-1-N16R8 con un núcleo a 240 MHz.
- Periférico de captura indicado: micrófono INMP441 sobre ESP32-S3-DevKitC-1 N16R8.
- Memoria: 8,3 MB de pesos en flash; quedan 6 MB de partición de aplicación libre en un módulo de 16 MB (perfil `esp32/firmware/partitions_nemo4.csv`).
- Cabe en GPU de consumo: no aplica; es un modelo TinyML para microcontrolador. No se documentan requisitos de GPU para inferencia en host.
- Opciones de despliegue: firmware propio del proyecto Oído (GPLv3) y utilidades de host (`live_demo.py`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 1,76× tiempo real en un núcleo a 240 MHz, lo que implica que el texto final tarda aproximadamente 1,76 veces la duración del audio. La variante de streaming emite el texto final entre 4,1 y 11,1 s después de clips de 3,6 a 10,6 s, aproximadamente la mitad de la espera del modo locución.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Idioma | Modos | Tamaño | WER test-clean | WER test-other | Licencia |
|---|---|---|---|---|---|---|
| oido-ctc-small-int4 | Inglés | Solo locución (el más pequeño) | 8,3 MB | 4,61 | 9,98 | CC-BY-SA-4.0 |
| oido-ctc-small-int8 | Inglés | Solo locución (mejor precisión) | 14,0 MB (+1,3 MB de LM opcional) | 3,70 | 8,23 | CC-BY-4.0 |
| oido-ctc-small-stream-int8 | Inglés | Streaming + contexto completo (baja latencia) | 14,0 MB | no disponible | no disponible | CC-BY-SA-4.0 |
| oido-es-ctc-small-int8 | Español | Streaming + contexto completo en un fichero | 14,0 MB (+1,3 MB de LM opcional) | no disponible | no disponible | CC-BY-4.0 |
| Espressif MultiNet7 | Inglés (comandos) | Empotrado en el mismo chip | 2,9 MB | 8,5 | 21,3 | no disponible |

Frente a MultiNet7, el modelo de este fichero ocupa 5,4 MB más pero reduce el WER de 8,5 a 4,61 en test-clean y de 21,3 a 9,98 en test-other, además de ofrecer vocabulario abierto en lugar de reconocimiento de comandos. Frente a la variante int8 de Oído, pierde entre 0,9 y 1,75 puntos de WER a cambio de 5,7 MB menos de flash y un 11 % más de velocidad.

## Limitaciones y advertencias

- Solo admite inglés; no se ha entrenado para otros idiomas y no hay modelo multilingüe en esta familia.
- No soporta streaming en esta variante: hay que esperar a que termine la locución para obtener texto.
- Aún no alcanza tiempo real en un solo núcleo (1,76× tiempo real) y el autor advierte de que el modo de dos núcleos no es correcto sobre silicio.
- Las métricas de WER están marcadas como no verificadas y las ha declarado el propio autor.
- Existe una discrepancia conocida entre la ejecución en placa y en host (8 de 10 clips idénticos, por redondeo de la librería matemática), lo que puede introducir variaciones de transcripción según el entorno.
- Licencia CC-BY-SA-4.0: es share-alike, derivada de un modelo CC-BY-4.0 y entrenada con fuentes con la misma cláusula. Esto impone obligaciones de atribución y de compartir bajo la misma licencia, y conviene revisarlo antes de un uso comercial propietario.
- El motor y el firmware del proyecto Oído son GPLv3; Lokutor ofrece licencias comerciales aparte. Usar solo el modelo no exime de revisar las condiciones del firmware si se integra en un producto.
- Riesgo de alucinación y de errores en audio con ruido, acentos no representados en los corpus de entrenamiento o solapamiento de hablantes; los corpus usados son predominantemente de lectura y voz limpia.
- El repositorio de HuggingFace ocupa 0,0 GB, por lo que los pesos no están publicados como safetensors o GGUF: la integración pasa por el firmware del proyecto.
- La búsqueda web realizada no devolvió resultados técnicos relevantes sobre este modelo, únicamente contenido no relacionado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lokutor-ai/oido-ctc-small-int4
- Artículo (paper): https://huggingface.co/papers/2610.13447
- Repositorio del proyecto Oído: https://github.com/lokutor-ai/oido
- Detalles de velocidad y memoria: https://github.com/lokutor-ai/oido#speed-and-memory
- Demo en vídeo: https://huggingface.co/lokutor-ai/oido-ctc-small-int8/resolve/main/demo.mp4
- Variante int8 (mayor precisión): https://huggingface.co/lokutor-ai/oido-ctc-small-int8
- Variante de streaming: https://huggingface.co/lokutor-ai/oido-ctc-small-stream-int8
- Variante en español: https://huggingface.co/lokutor-ai/oido-es-ctc-small-int8
- Modelo base: https://huggingface.co/nvidia/stt_en_conformer_ctc_small
- Licencias comerciales de Lokutor: https://lokutor.com
