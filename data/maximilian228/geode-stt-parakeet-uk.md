# Maximilian228/Geode-STT-parakeet-uk

## Resumen

Geode-STT-parakeet-uk es un paquete de reconocimiento automatico del habla (ASR) en formato sherpa-onnx, derivado del fine-tune ucraniano de Parakeet TDT 0.6B v3 de NVIDIA publicado por el usuario ihnatov-yuri. El modelo base es un transformer transducer (TDT, Token-and-Duration Transducer) de aproximadamente 0,6 mil millones de parametros, adaptado al ucraniano y con capacidad de reconocimiento en ingles. La relevancia de este paquete concreto reside en su empaquetado: los pesos se han convertido al grafo de sherpa-onnx y cuantizado selectivamente a int8, lo que permite ejecucion completamente offline en dispositivos moviles.

El autor (Maximilian228) publica el pack como componente del motor de la aplicacion Android Geode, orientada a transcripcion on-device sin conexion. Frente a la cuantizacion int8 estandar de sherpa-onnx (que afecta a todas las operaciones), este pack aplica QInt8 unicamente a los pesos de las MatMul, manteniendo convoluciones y LSTM en fp32, lo que segun la model card reduce la degradacion de WER en varios puntos en lenguas como el ucraniano y el aleman.

El modelo resuelve el caso de uso de dictado y transcripcion multilingue (ucraniano e ingles) en entornos sin conectividad o con requisitos de privacidad estrictos, con un rendimiento medido de RTF 0,191 en un Snapdragon 720G. Su licencia CC-BY-4.0 permite uso comercial con atribucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer transducer TDT (Token-and-Duration Transducer), grafo NeMo exportado a sherpa-onnx |
| Parametros totales | 0,6 mil millones (segun nombre del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 selectivo: QInt8 solo en pesos MatMul; convoluciones y LSTM en fp32 |
| Idiomas soportados | ucraniano (uk), ingles (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (encoder.int8.onnx, decoder.int8.onnx, joiner.int8.onnx) + tokens.txt |

## Arquitectura y entrenamiento

El modelo es un transducer TDT, variante de RNN-Transducer en la que el predictor emite conjuntamente tokens y duraciones, lo que acelera la decodificacion al reducir el numero de pasos del bucle de inferencia. La arquitectura incluye capas LSTM (cuyas puertas se conservan en fp32 en esta conversion) y convoluciones con BatchNorm plegado, segun describe el autor. El modelo base Parakeet TDT 0.6B v3 es de NVIDIA; el fine-tune ucraniano lo publica ihnatov-yuri en la revision `5c4bcfaca501587beaedfd23b72a678bf7194de1`.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el fine-tune. La innovacion tecnica documentada es la estrategia de cuantizacion: el autor reporta que la cuantizacion int8 estandar de sherpa-onnx (todas las operaciones en QUInt8) cuesta hasta 6 puntos de WER en estos idiomas (aleman de 11,3 a 5,4 y ucraniano de 8,8 a 5,7 con la configuracion selectiva), por lo que limita el int8 a las MatMul.

## Capacidades

- Reconocimiento automatico del habla en ucraniano e ingles.
- Transcripcion offline, sin conexion a red, disenada para ejecucion on-device.
- Decodificacion transducer TDT con emision conjunta de token y duracion.
- Formato compatible con sherpa-onnx (CLI, bindings moviles y de escritorio).
- Inferencia en CPU con hilos configurables (4 hilos en la medicion publicada).
- No se documentan capacidades de diarizacion, puntuacion automatica, timestamps por palabra, traduccion ni tool calling.

## Casos de uso

- Dictado por voz en Android sin conexion: la app Geode integra el pack para transcribir voz a texto en el dispositivo, sin enviar audio a servidores, gracias al formato sherpa-onnx y a su huella de memoria de aproximadamente 1 GB de RSS pico.
- Transcripcion de reuniones y notas de voz en ucraniano: con un WER medido de 4,51 % en FLEURS, es adecuado para actas y resumenes posteriores en flujos de productividad personal.
- Subtitulado local de contenido en ucraniano e ingles: el RTF de 0,191 permite procesar audio mas rapido que tiempo real en un movil de gama media, habilitando subtitulos casi en directo sin red.
- Aplicaciones de accesibilidad: conversion de voz a texto para usuarios con dificultades motoras o auditivas en entornos con conectividad limitada o nula.
- Procesamiento por lotes en servidores modestos: al ser un modelo de 0,6B en ONNX int8, puede desplegarse en CPU para transcribir archivos de audio en pipelines internos sin GPU.
- Investigacion en ASR de bajos recursos: sirve como punto de partida o referencia para experimentos de cuantizacion selectiva y evaluacion de WER en ucraniano.
- Integracion en aplicaciones de campo o militares/periodisticas en zonas con censura o sin cobertura, donde la transcripcion local evita filtrar audio sensible.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card:

| Idioma | Metrica | Error % | Utterances | Configuracion |
|---|---|---|---|---|
| uk | WER | 4,51 | 30 | sherpa-onnx int8, archivos del pack, CPU |
| en | WER | 5,55 | 30 | sherpa-onnx int8, archivos del pack, CPU |

Medicion en dispositivo (Redmi Note 9 Pro, Snapdragon 720G, sherpa-onnx v2.0.1 CLI, 4 hilos):

| Metrica | Valor |
|---|---|
| Tiempo de carga | 5,0 s |
| RTF (clip de 10 s) | 0,191 |
| RSS pico (VmHWM) | 1071 MB |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible; no aplican a un modelo ASR.

## Requisitos de hardware

- VRAM/RAM estimada: aproximadamente 1 GB de RSS pico en CPU durante inferencia (medido: 1071 MB).
- GPU recomendadas: no necesarias; el modelo esta pensado para CPU. Cualquier GPU con soporte ONNX Runtime puede acelerar la inferencia, pero no se publican mediciones.
- Cabe en GPU consumer (RTX 4090, etc.) con holgura sobrada por tamano, aunque el objetivo del pack es ejecucion en movil y CPU.
- Despliegue: sherpa-onnx (CLI, bindings Android/iOS, Python, C++). No se documenta soporte directo para vLLM, llama.cpp, Ollama ni TGI, que no estan orientados a ASR transducer.
- Latencia y throughput: RTF 0,191 en Snapdragon 720G con 4 hilos; tiempo de carga de 5 s en ese dispositivo. No hay mediciones en otras plataformas.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Geode-STT-parakeet-uk (este) | 0,6B | uk, en | ONNX sherpa-onnx int8 selectivo | CC-BY-4.0 | WER uk 4,51 %, en 5,55 % (FLEURS, 30 utterances) |
| ihnatov-yuri/parakeet-tdt-0.6b-v3-uk (base) | 0,6B | uk (y presumiblemente en) | NeMo (no especificado) | CC-BY-4.0 | Fine-tune ucraniano original; sin metricas publicadas en la informacion disponible |
| Parakeet TDT 0.6B v3 (NVIDIA) | 0,6B | multiples (no detallado) | NeMo | CC-BY-4.0 | Modelo base original de NVIDIA; sin metricas en la informacion disponible |
| Whisper large-v3 (referencia de categoria) | 1,55B | multilingue | safetensors, GGUF, etc. | MIT (pesos) | No comparado en la informacion disponible; referencia habitual en ASR multilingue |

No se dispone de comparaciones directas de WER entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Evaluacion con solo 30 utterances por idioma en FLEURS: la muestra es pequena y el WER puede no ser representativo de dominios reales (ruido, acentos, audio telefonico).
- Solo cubre ucraniano e ingles; no se documenta soporte de otros idiomas.
- No se documentan sesgos conocidos, pero un modelo entrenado principalmente con datos de un dominio concreto puede degradarse con acentos regionales, jerga o audio de baja calidad.
- Riesgo de alucinacion en ASR: posibilidad de transcripciones erroneas o inventadas en segmentos con ruido o silencio, como en cualquier modelo generativo de secuencias.
- Licencia CC-BY-4.0: permite uso comercial con atribucion obligatoria a NVIDIA, ihnatov-yuri y el proyecto Geode; revisar los terminos exactos antes de redistribuir.
- El pack esta empaquetado para sherpa-onnx; usarlo fuera de ese runtime requiere conversion adicional.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026: no hay validacion comunitaria independiente.
- El rendimiento medido corresponde a un unico dispositivo (Snapdragon 720G); en moviles de gama baja el RTF podria superar 1 y no ser tiempo real.

## Enlaces

- Hugging Face del pack: https://huggingface.co/Maximilian228/Geode-STT-parakeet-uk
- Modelo base (fine-tune ucraniano): https://huggingface.co/ihnatov-yuri/parakeet-tdt-0.6b-v3-uk
- Revision del modelo base: `5c4bcfaca501587beaedfd23b72a678bf7194de1`
- Proyecto sherpa-onnx: no disponible en la informacion proporcionada
- Modelo original de NVIDIA Parakeet TDT 0.6B v3: no disponible en la informacion proporcionada (referenciado en la model card como atribucion)
- Aplicacion Geode: no disponible en la informacion proporcionada
