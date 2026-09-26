# Codyfederer/sherpa-onnx-nemo-parakeet-redux

## Resumen

Codyfederer/sherpa-onnx-nemo-parakeet-redux es un empaquetado listo para usar del modelo de reconocimiento automatico del habla (ASR) Parakeet Redux, una version cuantizada a 1.58 bits (ternaria) del NVIDIA parakeet-tdt-0.6b-v3. El modelo base original lo desarrollo NVIDIA; la version ternaria la produjo Moondream y la exportacion a ONNX la realizo eschmidbauer. Este repositorio concreto reorganiza esos pesos en el formato NeMo TDT que espera sherpa-onnx, de modo que se cargan con `model_type: nemo_transducer` igual que el paquete oficial `sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8`.

Se trata de un modelo de transcripcion multilingue que cubre 25 idiomas europeos, con una arquitectura transducer TDT (Token-and-Duration Transducer) de 0,6 mil millones de parametros. Su relevancia radica en que comprime el encoder a pesos ternarios (representados como bloques MatMulNBits de 4 bits que reproducen exactamente los valores -1/0/+1), reduciendo el espacio en disco a unos 169 MB comprimidos y 407 MB descomprimidos, sin degradar la salida respecto al modelo int8 segun las pruebas del autor.

El resultado es un motor ASR muy ligero, desplegable en CPU y en dispositivos de bajos recursos, que mantiene la calidad de transcripcion del Parakeet TDT original en ingles, aleman, espanol y frances, segun los clips de prueba verificados. La licencia CC-BY-4.0 permite uso comercial con atribucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NeMo TDT (Token-and-Duration Transducer), encoder + decoder + joiner |
| Parametros totales | 0,6 mil millones (600M), segun el modelo base parakeet-tdt-0.6b-v3 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; procesa segmentos de voz, no contexto de texto) |
| Tipos de cuantizacion | Ternaria 1.58-bit en el encoder (bloques MatMulNBits de 4 bits que reproducen -1/0/+1); decoder y joiner en float32 |
| Idiomas soportados | 25 idiomas europeos: en, de, fr, es, it, pt, ru, uk, hr, sl, lv, lt, et, fi, sv, da, nl, pl, cs, sk, hu, ro, bg, el, mt |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (encoder.onnx, decoder.onnx, joiner.onnx) + tokens.txt |

## Arquitectura y entrenamiento

La arquitectura es un transducer TDT de NeMo, compuesto por un encoder, un decoder y un joiner; el modelo base es NVIDIA parakeet-tdt-0.6b-v3, entrenado por NVIDIA para reconocimiento del habla multilingue en 25 idiomas europeos. La variante Redux de Moondream aplica una cuantizacion ternaria de 1.58 bits sobre los pesos del encoder, mientras que este repositorio reorganiza la exportacion ONNX de eschmidbauer en la interfaz de dos modelos que usa sherpa-onnx: el `encoder.onnx` conserva los pesos ternarios como operaciones `MatMulNBits` de 4 bits (que reproducen exactamente los valores -1/0/+1), y el `decoder_joint-model.onnx` original se divide en `decoder.onnx` y `joiner.onnx` en float32 con salidas identicas.

Los detalles de dataset de entrenamiento, numero de tokens de audio, composicion del corpus y si hubo ajuste por RLHF/DPO no estan disponibles en la informacion proporcionada. La innovacion tecnica destacable de este paquete es la cuantizacion ternaria del encoder combinada con el formato de despliegue de sherpa-onnx, que reduce drasticamente el peso en disco manteniendo la transcripcion; requiere una build de ONNX Runtime que incluya el operador contrib `com.microsoft` `MatMulNBits` (las builds por defecto de sherpa-onnx lo incluyen).

## Capacidades

- Reconocimiento automatico del habla (ASR) offline para audio en 25 idiomas europeos.
- Transcripcion multilingue con un unico modelo (no requiere seleccionar idioma por separado, segun el modelo base).
- Formato de despliegue optimizado para sherpa-onnx como `nemo_transducer` offline.
- Funcionamiento en CPU con requisitos de memoria muy reducidos gracias a los pesos ternarios.
- Reutiliza el vocabulario (`tokens.txt`) y los audios de prueba (`test_wavs/`) del paquete oficial de sherpa-onnx para Parakeet.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, vision ni audio generativo; es exclusivamente un modelo de transcripcion.

## Casos de uso

- Transcripcion de reuniones y notas de voz: el modelo convierte audio en texto en 25 idiomas europeos, y su bajo consumo de memoria permite ejecutarlo en portatiles o servidores modestos sin GPU.
- Subtitulado automatico de video: al ser un modelo TDT offline de alta calidad, se puede usar para generar subtitulos en multiples idiomas europeos dentro de un pipeline de postproduccion.
- Asistentes de voz en el dispositivo (edge): su tamano de 169 MB comprimidos y su ejecucion en CPU lo hacen apto para integrarse en aplicaciones de escritorio o moviles con sherpa-onnx.
- Atencion al cliente y centros de llamadas: transcripcion de conversaciones telefonicas en varios idiomas de la UE para su posterior analisis, aprovechando la cobertura multilingue.
- Accesibilidad: conversion de voz a texto en tiempo real o por lotes para personas con dificultades auditivas, ejecutable en hardware de bajo coste.
- Archivado y busqueda de contenido audiovisual: transcripcion de bibliotecas de audio o video para permitir busqueda por texto en 25 idiomas.
- Investigacion en ASR: sirve como referencia de cuantizacion ternaria para estudiar la degradacion (o ausencia de ella) frente al modelo int8 y float32.
- Aplicaciones de transcripcion industrial o embebida: al no requerir GPU, se puede desplegar en dispositivos con recursos limitados dentro de flujos automatizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica unicamente que, verificado con sherpa-onnx 1.13.8, los clips de prueba en en/de/es/fr se transcriben exactamente igual que el modelo Parakeet TDT int8. No se aportan cifras de WER, latencia ni throughput.

## Requisitos de hardware

- VRAM: no aplica en el caso base; el modelo esta pensado para ejecucion en CPU. Los pesos ternarios del encoder y los componentes float32 suman cientos de MB en memoria.
- Memoria en disco: 169 MB el archivo `.tar.bz2`, 407 MB descomprimido.
- RAM estimada para inferencia: en torno a 1-2 GB, cifra orientativa no confirmada en la informacion disponible.
- GPU recomendadas: ninguna en particular; puede ejecutarse en GPU si la build de ONNX Runtime lo permite, pero no es necesaria. Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en hardware sin GPU.
- Caben en GPU consumer: si, con enorme margen; tambien en CPU, Raspberry Pi y dispositivos embebidos.
- Opciones de despliegue: sherpa-onnx (offline recognizer con `model_type: nemo_transducer`), mediante las APIs de Python, C++, C, etc. que expone el proyecto. ONNX Runtime con soporte del operador `MatMulNBits`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Codyfederer/sherpa-onnx-nemo-parakeet-redux | 600M | 25 europeos | Ternaria 1.58-bit (encoder) | CC-BY-4.0 | ONNX (sherpa-onnx) |
| sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8 | 600M | 25 europeos | int8 | CC-BY-4.0 (heredada del base) | ONNX (sherpa-onnx) |
| nvidia/parakeet-tdt-0.6b-v3 | 600M | 25 europeos | float32 (original) | CC-BY-4.0 | NeMo (.nemo) |
| Whisper (family, via sherpa-onnx) | variable (tiny a large) | decenas | int8 / float | MIT / Apache segun variante | ONNX (sherpa-onnx) |

Nota: los datos de rendimiento comparativo (WER) no estan disponibles en la informacion proporcionada. La diferencia principal entre las tres primeras filas es el nivel de cuantizacion y el empaquetado; segun el autor, la salida coincide con la version int8 en los idiomas probados.

## Limitaciones y advertencias

- Este repositorio no entrena un modelo nuevo: es un reempaquetado y cuantizacion del Parakeet Redux y del parakeet-tdt-0.6b-v3 de NVIDIA.
- Requiere una build de ONNX Runtime con el operador contrib `MatMulNBits`; entornos que no lo incluyan no podran cargar el encoder.
- Solo se verifico la coincidencia exacta con la version int8 en los clips de prueba de en/de/es/fr; no hay verificacion publicada para el resto de los 21 idiomas.
- No hay datos publicados de WER, sesgos, robustez ante ruido, acentos o audio de baja calidad.
- Riesgo de alucinacion y errores propios de los modelos ASR (inserciones, omisiones o sustituciones), no cuantificado en la informacion disponible.
- Licencia CC-BY-4.0: permite uso comercial siempre que se atribuya correctamente a NVIDIA (modelo original), Moondream (version ternaria), eschmidbauer (exportacion ONNX) y al autor del empaquetado. Se deben respetar las condiciones de CC-BY-4.0.
- Al ser un modelo transducer offline, no esta disenado para streaming en tiempo real (sherpa-onnx ofrece modelos online separados para ese caso).
- El modelo tiene 0 descargas y 0 likes, por lo que carece de validacion de la comunidad.
- La fecha de creacion indicada (2026) es la que figura en los metadatos del repositorio.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Codyfederer/sherpa-onnx-nemo-parakeet-redux
- Modelo base (version ternaria): https://huggingface.co/moondream/parakeet-redux
- Modelo original de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Exportacion ONNX utilizada: https://huggingface.co/eschmidbauer/parakeet-redux-onnx
- Documentacion de sherpa (modelos NeMo): https://k2-fsa.github.io/sherpa/
- Paquete oficial sherpa-onnx-nemo-parakeet-tdt-0.6b-v2-int8: https://k2-fsa.github.io/sherpa/onnx/pretrained_models/offline-transducer/nemo/parakeet-tdt-0.6b-v2.html
- Repositorio GitHub de sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Documentacion interna de modelos ASR de sherpa: https://deepwiki.com/k2-fsa/sherpa/3.1-asr-models
- Vision general de sherpa-onnx: https://deepwiki.com/k2-fsa/sherpa-onnx
