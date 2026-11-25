# kingphisher-2080/ckaffee-parakeet-110m

## Resumen

CKaffeVoice Parakeet TDT 110M es un paquete de ficheros de reconocimiento de voz (speech-to-text) en formato ONNX int8, empaquetado por el usuario kingphisher-2080 para su uso en la aplicación de dictado CKaffeVoice (build parcheada) sobre Android mediante sherpa-onnx. No se trata de un modelo entrenado por el autor: los pesos son los de NVIDIA Parakeet TDT 110M, y los ficheros ONNX int8 proceden sin modificar del repositorio k2-fsa/sherpa-onnx (`sherpa-onnx-nemo-parakeet_tdt_transducer_110m-en-36000-int8`), redistribuidos bajo licencia CC-BY-4.0.

El modelo es un transducer (RNN-T/TDT) de aproximadamente 110 millones de parámetros orientado a reconocimiento de voz en inglés, pensado para inferencia en dispositivos con recursos limitados. Su relevancia práctica radica en que actúa como sustituto directo (drop-in replacement) del modelo de 0.6B en la misma aplicación: mantiene los mismos nombres de fichero y el mismo flujo de decodificación (`nemo_transducer` con búsqueda voraz en sherpa-onnx), pero reduce el consumo de memoria y el coste computacional de forma notable.

Según las mediciones del autor en un Moto G Power 5G 2024 con 40 clips de LibriSpeech, el modelo de 110M obtiene un WER del 1.55 % frente al 1.79 % del 0.6B, con un factor de tiempo real de 0.067 frente a 0.207 y un pico de RAM de 344 MB frente a 944 MB. En ese dispositivo transcribe 10 segundos de audio en aproximadamente 0.7 segundos, con mejor rendimiento a 2 hilos. El repositorio ocupa 0.1 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transducer neuronal (Parakeet TDT, familia NeMo); decodificacion `nemo_transducer` con busqueda voraz en sherpa-onnx |
| Parametros totales | 110M (aproximadamente) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de voz; ventana de audio no especificada en la informacion) |
| Tipos de cuantizacion | int8 (ONNX) |
| Idiomas soportados | en (ingles) |
| Licencia | cc-by-4.0 |
| Formato de pesos | ONNX (int8), empaquetado para sherpa-onnx |

## Arquitectura y entrenamiento

La arquitectura corresponde a Parakeet TDT (Token-and-Duration Transducer) de NVIDIA, un modelo de la familia NeMo con estructura de transducer para reconocimiento automático del habla. En este repositorio no se aportan detalles sobre el corpus de entrenamiento, el número de tokens de audio procesados, la composición del dataset ni si hubo etapas de ajuste fino o alineación; esa información corresponde al modelo original de NVIDIA y no está incluida en la model card disponible.

La innovación práctica del paquete es de despliegue, no de entrenamiento: se distribuyen los ficheros ONNX int8 ya convertidos por k2-fsa/sherpa-onnx, listos para el runtime sherpa-onnx con decodificación voraz sobre el transducer. El autor indica que es un reemplazo directo del modelo de 0.6B con los mismos nombres de fichero, lo que permite intercambiarlo en la aplicación sin cambios en el código de integración. No se documentan técnicas adicionales como decodificación especulativa, atención lineal ni modos de razonamiento.

## Capacidades

- Reconocimiento automático del habla (speech-to-text) en inglés a partir de audio.
- Inferencia en dispositivo (on-device) mediante sherpa-onnx, con soporte declarado para Android.
- Decodificación por transducer con búsqueda voraz (`nemo_transducer`), sin necesidad de modelo de lenguaje externo en el flujo descrito.
- Sustitución directa del modelo de 0.6B en CKaffeVoice, manteniendo nombres de fichero e interfaz.
- Bajo consumo de memoria y cómputo: 344 MB de pico de RAM y factor de tiempo real de 0.067 en el dispositivo de prueba.
- No se documentan capacidades de traducción, diarización, puntuación, tool calling, agentes ni procesamiento multimodal más allá del audio de entrada.

## Casos de uso

- Dictado en aplicaciones Android: integración en CKaffeVoice o en cualquier app que use sherpa-onnx para transcribir voz a texto en tiempo real, aprovechando el bajo pico de RAM (344 MB) y el factor de tiempo real de 0.067.
- Transcripción en dispositivos de gama media: el modelo cabe y funciona en un Moto G Power 5G 2024, por lo que es adecuado para móviles con recursos limitados donde un modelo de 0.6B resultaría demasiado pesado.
- Notas de voz y grabaciones cortas: con 0.7 s para 10 s de audio, permite transcribir notas de voz de forma casi interactiva sin salir del dispositivo.
- Procesamiento por lotes en el borde (edge): al no requerir GPU ni conexión a servicios en la nube, sirve para transcribir lotes de clips en equipos modestos con privacidad de datos local.
- Sustitución de modelos mayores en pipelines existentes: al ser drop-in replacement del 0.6B con los mismos nombres de fichero, permite reducir RAM y latencia en despliegues ya construidos sobre sherpa-onnx sin reescribir la integración.
- Pruebas y prototipado de ASR en inglés: útil para validar flujos de dictado o comandos de voz en inglés antes de escalar a modelos mayores o a otros idiomas.
- Aplicaciones de accesibilidad: entrada por voz en herramientas de escritura o control en Android donde la latencia y el consumo de batería son críticos.

## Benchmarks y rendimiento

Datos aportados por el autor en un Moto G Power 5G 2024 con 40 clips de LibriSpeech:

| Modelo | WER | Factor de tiempo real | Pico de RAM |
|---|---|---|---|
| Parakeet TDT 0.6B | 1.79 % | 0.207 | 944 MB |
| Parakeet TDT 110M (este) | 1.55 % | 0.067 | 344 MB |

En ese dispositivo, el modelo de 110M transcribe 10 segundos de audio en aproximadamente 0.7 segundos, con mejor resultado a 2 hilos. No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) ni evaluaciones en otros conjuntos de voz distintos de los 40 clips de LibriSpeech citados.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el escenario documentado; la inferencia es en CPU. El pico de RAM medido es de 344 MB en el dispositivo de prueba.
- GPU recomendadas: no disponibles; el autor no documenta ejecución en GPU.
- Cabe en GPU de consumo: no documentado. El caso de uso descrito es móvil/CPU (Android, sherpa-onnx).
- Opciones de despliegue: sherpa-onnx con `nemo_transducer` y búsqueda voraz; el formato ONNX int8 es el artefacto distribuido. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: 0.7 s para 10 s de audio en un Moto G Power 5G 2024 a 2 hilos; factor de tiempo real de 0.067.
- Repositorio: 0.1 GB, adecuado para distribución e instalación en dispositivos con almacenamiento limitado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | WER (LibriSpeech, 40 clips) | Factor de tiempo real | Pico de RAM | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Parakeet TDT 110M (este) | 110M | no disponible | 1.55 % | 0.067 | 344 MB | CC-BY-4.0 | Hugging Face (este repo) |
| Parakeet TDT 0.6B | 0.6B | no disponible | 1.79 % | 0.207 | 944 MB | CC-BY-4.0 (modelo original NVIDIA) | Referenciado en la model card |
| Otros modelos ASR comparables | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación se limita a los dos modelos medidos por el autor en el mismo dispositivo y conjunto de prueba; no se dispone de datos de terceros para ampliar la tabla.

## Limitaciones y advertencias

- Solo reconoce inglés (`language: en`); no se documenta soporte multilingüe.
- No es un modelo entrenado por el autor: es una redistribución de pesos de NVIDIA Parakeet TDT 110M y de ficheros ONNX int8 de k2-fsa/sherpa-onnx; cualquier limitación del modelo original aplica aquí.
- Los benchmarks provienen de una única prueba con 40 clips de LibriSpeech en un dispositivo concreto; no deben extrapolarse a otros dominios, acentos, ruido ambiental o hardware.
- No se documentan sesgos, tasas de alucinación ni comportamiento en audio de baja calidad; en ASR, el riesgo de transcripciones incorrectas en condiciones adversas es relevante para producción.
- La licencia CC-BY-4.0 permite uso comercial con atribución; es obligatorio mantener la atribución a NVIDIA y a k2-fsa/sherpa-onnx indicada por el autor.
- El repositorio no registra descargas ni likes y fue creado y actualizado el mismo día (2026-11-25), por lo que no hay evidencia de uso en producción ni mantenimiento continuado.
- Depende del runtime sherpa-onnx y de la estructura de ficheros esperada por CKaffeVoice; fuera de ese flujo de decodificación voraz no se documenta compatibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kingphisher-2080/ckaffee-parakeet-110m
- Repositorio de origen de los ficheros ONNX int8: k2-fsa/sherpa-onnx (`sherpa-onnx-nemo-parakeet_tdt_transducer_110m-en-36000-int8`)
- Modelo original: NVIDIA Parakeet TDT 110M (licencia CC-BY-4.0)
- Runtime sherpa-onnx: no se proporciona URL en la información disponible
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
