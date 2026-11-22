# Phoonnx/vits-en_gb-jarvis-high-espeak

## Resumen

`Phoonnx/vits-en_gb-jarvis-high-espeak` es una voz de sintesis de voz (text-to-speech) en ingles britanico basada en la arquitectura VITS en su variante Piper, convertida a formato ONNX para su uso con la libreria `phoonnx` (desarrollada por TigreGotico). El modelo original fue entrenado por jgkawell y publicado como `jgkawell/jarvis`; esta version es una conversion de formato que no altera los pesos, salvo las copias int8 que los cuantizan dinamicamente.

El modelo resuelve el problema de generar audio de voz sintetica de calidad a partir de texto, con un enfoque ligero: el grafo ONNX en fp32 ocupa 114,2 MB y la version int8 solo 38,1 MB, con un pico de memoria residente (RSS) de 291,3 MB en fp32 y 238,8 MB en int8. Esto lo hace adecuado para despliegue en CPU y en entornos con recursos limitados, como asistentes de voz locales o sistemas embebidos.

La relevancia de esta ficha radica en que se trata de un artefacto de inferencia listo para produccion dentro del ecosistema OVOS (Open Voice OS), con validacion automatica de calidad mediante ASR (NeMo Parakeet TDT 0.6B v3 int8) y con una licencia MIT que permite uso comercial. No es un modelo de lenguaje: es un sintetizador de voz mono-hablante de 22.050 Hz que acepta fonemas IPA generados por espeak-ng.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variante Piper) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, no autoregresivo de texto) |
| Tipos de cuantizacion | fp32 y int8 (cuantizacion dinamica con onnxruntime, pesos QInt8) |
| Idiomas soportados | ingles britanico (en-GB) |
| Licencia | MIT |
| Formato de pesos | ONNX (`.onnx` y `_int8.onnx`) |
| Frecuencia de muestreo | 22.050 Hz |
| Numero de hablantes | 1 |
| Entrada de texto | fonemas espeak, alfabeto IPA |
| Fonemizador | espeak-ng, voz `en-gb-x-rp` |
| Puntuacion soportada | coma, punto, exclamacion, interrogacion, dos puntos, punto y coma |
| Tamano del repositorio | 0,2 GB |
| Tamano del grafo | 114,2 MB (fp32) / 38,1 MB (int8) |
| Pico de RSS | 291,3 MB (fp32) / 238,8 MB (int8) |

## Arquitectura y entrenamiento

La arquitectura es VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) en la implementacion Piper, un modelo generativo end-to-end que combina un codificador de texto, un prior variacional, un decodificador basado en flujos normales y un discriminador adversarial durante el entrenamiento. En inferencia, el modelo recibe una secuencia de fonemas IPA (producidos por espeak-ng con la voz `en-gb-x-rp`) y genera directamente la forma de onda a 22.050 Hz. Es un modelo mono-hablante.

El modelo original `jgkawell/jarvis` fue entrenado por jgkawell y, segun declara el uploader en el pull request rhasspy/piper-voices #11, el audio de entrenamiento proviene de un videojuego movil. El modelo se ajusto finamente (fine-tuning) a partir de la voz en ingles estadounidense "lessac" de alta calidad. La model card indica que no se registra el dataset exacto ni el checkpoint de entrenamiento en este repositorio. La conversion a ONNX y la cuantizacion int8 fueron realizadas por TigreGotico Lda con `onnxruntime.quantization.quantize_dynamic` (onnxruntime 1.32.0) y pesos QInt8; la cuantizacion no altera los pesos originales en la version fp32.

## Capacidades

- Sintesis de voz a partir de texto en ingles britanico (en-GB), con salida de audio a 22.050 Hz.
- Entrada basada en fonemas IPA generados por espeak-ng, lo que permite un control preciso de la pronunciacion.
- Soporte de puntuacion de clausula (`,` `.` `!` `?` `:` `;`) preservada en la sintesis desde phoonnx 1.96.1a1.
- Inferencia en CPU con latencia moderada: RTF (tiempo de sintesis dividido por duracion del audio) de 0,239 en fp32 y 0,706 en int8, medido en un Intel Core i9-11900H a 2,50 GHz con 4 hilos.
- Integracion con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- No soporta tool calling, agentes, vision, audio de entrada ni razonamiento multi-paso: es exclusivamente un modelo TTS.
- No es multilingue: solo ingles britanico.

## Casos de uso

- Asistentes de voz locales en OVOS: el modelo se integra mediante `ovos-tts-plugin-phoonnx` y permite sintetizar respuestas en un asistente domestico sin depender de servicios en la nube, gracias a su bajo consumo de memoria (238,8 MB en int8) y su ejecucion en CPU.
- Lectura de notificaciones y alertas en sistemas embebidos: con un grafo int8 de 38,1 MB y un pico de RSS de 238,8 MB, cabe en dispositivos con recursos limitados como Raspberry Pi o mini-PC, generando audio a 22.050 Hz para avisos breves.
- Accesibilidad para personas con discapacidad visual: sintesis de texto a voz en ingles britanico para lectores de pantalla o aplicaciones de lectura, con pronunciacion controlada mediante fonemas IPA.
- Generacion de audio para prototipos y demos: su licencia MIT y su formato ONNX facilitan la integracion en pipelines de CI/CD para generar locuciones de prueba sin coste de licencia.
- Doctesting de sistemas TTS: el modelo incluye una validacion automatica con ASR (NeMo Parakeet TDT 0.6B v3 int8) sobre FLORES-200 devtest, lo que permite usarlo como referencia en pruebas de regresion de calidad de sintesis (WER 0,069 en fp32 y 0,034 en int8).
- Síntesis de voz para videojuegos o mods: al provenir el audio original de un videojuego movil, encaja en proyectos de doblaje no oficial o prototipos de personajes con voz en ingles britanico.
- Generacion de audiolibros o contenido narrado en lote: el RTF de 0,239 en fp32 (aproximadamente 4 veces mas rapido que tiempo real en el hardware medido) permite procesar texto en batch con un solo hilo de CPU.

## Benchmarks y rendimiento

La model card proporciona una validacion de calidad (QA) mediante ASR NeMo Parakeet TDT 0.6B v3 int8 sobre 3 frases de FLORES-200 devtest:

| Metrica | fp32 | int8 |
|---|---|---|
| Resultado QA | pass | pass |
| WER | 0,069 | 0,034 |
| Caracteres por segundo | 16,7 a 19,2 | no disponible |
| Longitud int8 / fp32 | no aplica | 0,99 a 1,00 |
| Tamano del grafo | 114,2 MB | 38,1 MB |
| Pico de RSS | 291,3 MB | 238,8 MB |
| RTF (mediana de 3, 4 hilos) | 0,239 | 0,706 |

Medido en un Intel Core i9-11900H a 2,50 GHz. No se han publicado resultados de benchmarks estandar de TTS (MOS, MCD, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo se ejecuta en CPU mediante ONNX Runtime. El consumo es de memoria RAM: 291,3 MB de pico en fp32 y 238,8 MB en int8.
- GPU recomendadas: no se documenta uso de GPU; el modelo esta pensado para inferencia en CPU.
- Cabe en cualquier CPU consumer moderna; el benchmark se realizo en un Intel Core i9-11900H, pero el tamano del grafo (38,1 MB en int8) sugiere viabilidad en dispositivos de gama baja.
- Opciones de despliegue: `phoonnx` (libreria nativa), plugin `ovos-tts-plugin-phoonnx` para OVOS, y ONNX Runtime directamente. Requiere espeak-ng instalado en el sistema (o el port espyak via `phoonnx[espeak]`, con posibles diferencias de pronunciacion).
- Latencia y throughput: RTF de 0,239 en fp32 y 0,706 en int8 con 4 hilos; es decir, en fp32 la sintesis es aproximadamente 4,2 veces mas rapida que tiempo real, y en int8 aproximadamente 1,4 veces mas rapida que tiempo real, en el hardware medido.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Frecuencia | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Phoonnx/vits-en_gb-jarvis-high-espeak | VITS (Piper) | en-GB | 22.050 Hz | MIT | ONNX | Conversion de jgkawell/jarvis, validacion ASR incluida |
| jgkawell/jarvis (upstream) | VITS (Piper) | en-GB | no disponible | MIT | no disponible | Modelo original; esta ficha es su conversion ONNX |
| Otras voces Piper en-GB de rhasspy/piper-voices | VITS (Piper) | en-GB | 22.050 Hz | MIT (segun voz) | ONNX | Catalogo comunitario de voces Piper; misma familia tecnologica |

No se dispone de datos de benchmarks comparativos con otros modelos TTS en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles britanico (en-GB); no es multilingue.
- Es un modelo mono-hablante: no permite cambiar de voz sin cargar otro modelo.
- La calidad de pronunciacion depende de espeak-ng; si se usa el port espyak, algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras.
- El audio de entrenamiento proviene de un videojuego movil segun el uploader, lo que puede implicar sesgos de dominio (vocabulario, estilo) y posibles cuestiones de derechos sobre el audio original, aunque la licencia declarada es MIT.
- No se registra el dataset de entrenamiento ni el checkpoint, lo que limita la reproducibilidad y la auditoria del modelo.
- Riesgo de alucinacion acustica: como todo modelo generativo TTS, puede producir artefactos o pronunciaciones incorrectas en texto fuera de dominio o con puntuacion no soportada.
- La validacion QA se realizo sobre solo 3 frases de FLORES-200 devtest, una muestra muy reducida que no garantiza robustez general.
- La licencia MIT permite uso comercial, pero se recomienda citar a jgkawell como autor original de los pesos.
- La version int8 tiene un RTF de 0,706, mas lenta que fp32 (0,239) en el hardware medido, a pesar de ocupar menos memoria; hay que valorar el compromiso memoria/velocidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-en_gb-jarvis-high-espeak
- Modelo upstream: https://huggingface.co/jgkawell/jarvis
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- TigreGotico: https://tigregotico.pt
- Pull request de rhasspy/piper-voices #11 (origen del audio): https://github.com/rhasspy/piper-voices/pull/11
