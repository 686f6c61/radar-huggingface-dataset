# Parafoil/speech-models

## Resumen

Parafoil/speech-models es un repositorio de paquetes de modelos ONNX y GGUF que la aplicacion de escritorio Parafoil descarga para transcribir reuniones localmente y, en modo privado, eliminar datos personales de la transcripcion antes de que esta salga del equipo. No es un modelo unico entrenado por Parafoil, sino una coleccion curada de tres packs derivados de modelos de terceros: NVIDIA Parakeet TDT 0.6B v3 para reconocimiento de voz, NVIDIA Nemotron 3 Diarization para diarizacion de hablantes y GLiNER multi PII v1 para deteccion de informacion personal identificable.

El pack principal de ASR emplea una arquitectura transducer (RNN-T) con decodificacion TDT (Token-and-Duration Transducer) de NVIDIA, exportada a ONNX para sherpa-onnx y cuantizada a int8 por canal en las capas MatMul del encoder, manteniendo las convoluciones en fp32. Soporta reconocimiento de voz en 25 idiomas europeos y, segun la model card, alcanza un 13,7 % de WER en audio de reuniones del corpus AMI.

La relevancia actual del repositorio reside en su enfoque de privacidad por diseno: todo el pipeline (VAD con Silero, ASR con Parakeet, diarizacion con Nemotron y redaccion de PII con GLiNER) se ejecuta en el dispositivo del usuario, con verificacion de integridad por tamano y SHA-256 de cada fichero. El total de parametros declarado en safetensors es de 99.260.363, correspondiente al conjunto de los packs.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transducer TDT (Parakeet), diarizacion (Nemotron 3) y GLiNER (encoder mDeBERTa-v3) |
| Parametros totales | 99.260.363 (conjunto del repo, safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 por canal (encoder Parakeet), q8_0 GGUF (Nemotron), int8 weights-only y MatMulNBits block 32 (GLiNER) |
| Idiomas soportados | 25 idiomas europeos (ASR); resto de packs no disponible |
| Licencia | mixta: CC-BY-4.0, OpenMDW 1.1, Apache 2.0 y MIT segun componente |
| Formato de pesos | ONNX (encoder, decoder, joiner, VAD, GLiNER) y GGUF (Nemotron) |

## Arquitectura y entrenamiento

El pack de ASR `parakeet-tdt-0.6b-v3-pc8-2026-10-15` deriva del export ONNX de sherpa-onnx de NVIDIA Parakeet TDT 0.6B v3, un modelo transducer con decodificacion TDT. Parafoil aplico cuantizacion dinamica de ONNX Runtime con pesos int8 por canal exclusivamente en nodos MatMul; las capas convolucionales permanecen en fp32. El decoder, el joiner y el vocabulario `tokens.txt` no se modificaron. El pack incluye ademas Silero VAD sin cambios para la deteccion de actividad de voz.

El pack `nemotron-3-diarization-q8-2026-09-23` es una copia sin modificar del fichero de NVIDIA Nemotron 3 Diarization en formato GGUF q8_0, fijado al commit `f667ed73aee57d40cc39428eb768b4fd87a0a29e`. El pack de redaccion `gliner-multi-pii-v1-wo8-2026-10-24` deriva de GLiNER multi PII v1 exportado a ONNX con la libreria gliner 0.2.29 y cuantizado con las herramientas de ONNX Runtime 1.31 solo en pesos: tabla de vocabulario int8 por canal dequantizada al cargar y cada MatMul en MatMulNBits de 8 bits con bloque 32, simetrico y `accuracy_level=1`. Este pack sustituye al anterior `pc8e`, que cuantizaba activaciones en tiempo de ejecucion y dependia de instrucciones int8 del procesador, lo que degradaba la redaccion en chips como Apple M1. El tokenizador proviene de mDeBERTa-v3 base con los tokens `<<ENT>>` y `<<SEP>>` anadidos. No se dispone de informacion sobre datos de entrenamiento, numero de tokens ni procesos de RLHF o DPO, ya que Parafoil no reentrena los modelos base.

## Capacidades

- Reconocimiento automatico de voz en 25 idiomas europeos mediante el pack Parakeet TDT.
- Deteccion de actividad de voz con Silero VAD para segmentar audio de reuniones.
- Diarizacion de hablantes con Nemotron 3 Diarization en formato GGUF q8_0.
- Deteccion y redaccion de informacion personal identificable (nombres, fechas, telefonos, lugares, numeros de identificacion) con GLiNER multi PII.
- Ejecucion completamente local en el dispositivo del usuario, sin envio de audio ni transcripciones a servidores externos.
- Verificacion de integridad de cada fichero por tamano y SHA-256 antes de su uso.
- Modo privado que elimina datos de terceros de la transcripcion antes de que abandone el equipo.
- Integracion con sherpa-onnx mediante el tipo de grafo `nemo_transducer`.
- Compatibilidad con ONNX Runtime 1.28 o superior para el pack de redaccion.

## Casos de uso

- Transcripcion de reuniones en local: el pipeline combina Silero VAD, Parakeet TDT y Nemotron 3 Diarization para generar actas con hablantes identificados sin que el audio salga del ordenador, lo que encaja en entornos con requisitos de confidencialidad.
- Redaccion de PII antes de compartir transcripciones: GLiNER sustituye nombres, telefonos y numeros de identificacion en el dispositivo, de modo que el texto resultante puede enviarse a sistemas externos con menor exposicion de datos personales.
- Cumplimiento de RGPD en herramientas internas: al procesar el audio y redactar la transcripcion localmente, se reduce la superficie de tratamiento de datos personales en aplicaciones corporativas de notas de reunion.
- Subtitulado y busqueda de reuniones archivadas: el ASR multilingue en 25 idiomas europeos permite indexar grabaciones y generar subtitulos en entornos con plantillas linguisticas diversas.
- Analisis forense o de compliance sobre grabaciones: la diarizacion permite atribuir intervenciones a hablantes concretos y la redaccion protege identidades en los informes derivados.
- Integracion en aplicaciones de escritorio mediante sherpa-onnx: los packs ONNX y GGUF se pueden cargar con ONNX Runtime en Windows, macOS y Linux, lo que facilita empaquetar transcripcion offline en productos de escritorio.
- Prototipado de pipelines de privacidad: los ficheros con checksums publicados permiten reproducir y auditar el comportamiento del pipeline de redaccion en pruebas sinteticas.

## Benchmarks y rendimiento

| Metrica | Valor | Contexto |
|---|---|---|
| WER en AMI (audio de reuniones) | 13,7 % | Pruebas propias de Parafoil con el encoder int8 |
| Redaccion de identificadores personales (pack wo8) | 97,0 % | Conjunto de prueba sintetico propio |
| Redaccion de identificadores personales (pack pc8e) | 97,8 % | Conjunto de prueba sintetico propio, ONNX Runtime 1.28 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, LibriSpeech) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el encoder Parakeet int8 ocupa 881.498.555 bytes, el decoder 47.233.743 bytes y el joiner 25.286.330 bytes, por lo que el pack ASR completo ronda los 950 MB en disco.
- El pack de diarizacion GGUF q8_0 y el de GLiNER ONNX anaden carga adicional; el repositorio completo ocupa 1,8 GB.
- GPU recomendadas: no disponibles en la informacion proporcionada. El diseno esta orientado a ejecucion en CPU de equipos de escritorio, dado el caracter local de la aplicacion.
- Compatibilidad con GPU de consumo: no confirmada; el uso de ONNX Runtime y sherpa-onnx permite ejecucion en CPU, y el pack de redaccion wo8 evita dependencias de instrucciones int8 especificas del procesador.
- Opciones de despliegue: sherpa-onnx con ONNX Runtime 1.28 o superior (ASR y VAD), ONNX Runtime para GLiNER y un runtime GGUF para Nemotron 3 Diarization.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Parafoil/speech-models (pack ASR) | 99,26 M (conjunto del repo) | no disponible | 25 europeos | mixta (CC-BY-4.0, OpenMDW 1.1, Apache 2.0, MIT) | ONNX, GGUF |
| nvidia/parakeet-tdt-0.6b-v3 | 0,6 B (aproximado por nombre) | no disponible | 25 europeos | CC-BY-4.0 | NeMo, ONNX via sherpa-onnx |
| nvidia/Nemotron-3-Diarization | no disponible | no disponible | no disponible | OpenMDW 1.1 | GGUF (q8_0 en este repo) |
| urchade/gliner_multi_pii-v1 | no disponible | no disponible | multilingue | Apache 2.0 | PyTorch, ONNX en este repo |

La comparativa se limita a los modelos base citados en la model card; no se dispone de datos de rendimiento comparativo entre ellos en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio no es un modelo unico, sino un conjunto de packs con licencias distintas; el uso comercial exige revisar cada licencia por componente (CC-BY-4.0, OpenMDW 1.1, Apache 2.0 y MIT).
- La licencia global figura como "other" con nombre "mixed", lo que anade complejidad al cumplimiento.
- El WER del 13,7 % se midio en audio de reuniones AMI; el rendimiento en otros dominios o con ruido no esta documentado.
- Los porcentajes de redaccion (97,0 % y 97,8 %) proceden de conjuntos de prueba sinteticos propios de Parafoil, no de benchmarks independientes.
- El pack `pc8e` queda obsoleto por su dependencia de instrucciones int8 del procesador; en Apple M1 solo eliminaba aproximadamente la mitad de los identificadores.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion en transcripcion ni cobertura linguistica detallada por idioma.
- La ausencia de datos de benchmarks estandar impide comparaciones objetivas con otros sistemas ASR.
- La model card no detalla requisitos minimos de hardware ni latencias, lo que dificulta planificar despliegues en produccion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Parafoil/speech-models
- NVIDIA Parakeet TDT 0.6B v3: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- NVIDIA Nemotron 3 Diarization: https://huggingface.co/nvidia/Nemotron-3-Diarization
- GLiNER multi PII v1: https://huggingface.co/urchade/gliner_multi_pii-v1
- mDeBERTa-v3 base: https://huggingface.co/microsoft/mdeberta-v3-base
- sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Silero VAD: https://github.com/snakers4/silero-vad
