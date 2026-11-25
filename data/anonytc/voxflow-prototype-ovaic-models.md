# anonytc/voxflow-prototype-ovaic-models

## Resumen

VoxFlow Prototype Edge Model Bundle es un paquete de pesos verificado con SHA-256 publicado por el usuario anonytc para la version 0.4.0 de VoxFlow, una aplicacion de traduccion de voz a voz completamente offline presentada al OneVoice AI Challenge 2026 (Track A). No se trata de un unico modelo entrenado desde cero, sino de un ensamblaje de cinco componentes de inferencia en el dispositivo (ASR, MT, TTS, VAD y un segundo TTS para mandarin) empaquetados para ejecutarse en hardware movil Qualcomm mediante QNN/Hexagon HTP y MNN, sin dependencia de la nube.

El bundle cubre una cascada de traduccion en las cuatro direcciones entre vietnamita, ingles, coreano y chino mandarin (seis pares direccionales), con reconocimiento de voz en streaming, traduccion automatica, sintesis de voz en tiempo real y segmentacion automatica por VAD. El repositorio ocupa 3,5 GB e incluye dos ramas de despliegue: una pensada para el Samsung Galaxy S23 Ultra (SoC SM8550, HTP v73) y otra para Qualcomm QCS6490 (RB3 Gen 2 Linux, HTP v68).

Su relevancia radica en que demuestra un pipeline de traduccion de voz multilingue totalmente local en telefonos de gama alta, con pesos en formatos especificos de acelerador (QNN HTP, MNN HQQ INT4, ONNX INT8) y una licencia mixta sin componentes GPL, lo que facilita su evaluacion para uso comercial. No se publican parametros agregados, contexto ni resultados de benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cascada de modelos: ASR (Qwen3-ASR-0.6B), MT (HY-MT2-1.8B), TTS (Supertonic-3 y VITS-AISHELL3), VAD (Silero VAD v5) |
| Parametros totales | No disponible como agregado; componentes: Qwen3-ASR-0.6B (0,6B), HY-MT2-1.8B (1,8B) |
| Parametros activos | No disponible (no se indica que ningun componente sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | QNN HTP v73 `conv100 A16W8` + encoder `W8A16_FP` + decoder `W8A16_FP`; MNN 3.6.2 HQQ INT4; ONNX INT8; ORT Q4 CPU; ORT INT8 DP/TE |
| Idiomas soportados | Vietnamita, ingles, coreano y chino mandarin (6 direcciones); TTS Supertonic-3 para vi/en/ko y VITS-AISHELL3 para zh |
| Licencia | Mixta: Apache-2.0 (Qwen3-ASR-0.6B, HY-MT2-1.8B, VITS-AISHELL3), OpenRAIL-M (Supertonic-3), MIT (Silero VAD v5); sin componentes GPL |
| Formato de pesos | ONNX, QNN HTP (v68/v73), MNN, OpenFST (`.fst` para normalizacion de texto) |

## Arquitectura y entrenamiento

El bundle no define una arquitectura unica, sino una cascada de inferencia en el dispositivo compuesta por cinco piezas. El reconocimiento de voz usa Qwen3-ASR-0.6B podado a cuatro idiomas, exportado a QNN HTP v73 con atencion `conv100 A16W8`, encoder `W8A16_FP` y decoder `W8A16_FP`, con soporte de modo offline y streaming en el SoC SM8550. La traduccion la realiza HY-MT2-1.8B en formato MNN 3.6.2 con cuantizacion HQQ INT4, con backend OpenCL o CPU de 4 hilos. La sintesis de voz se reparte entre Supertonic-3 (ONNX INT8 con `tts.json` y `voice.bin`) para vietnamita, ingles y coreano, y VITS-AISHELL3 (ONNX + OpenFST con `date.fst`, `number.fst` y `phone.fst`) para mandarin. La segmentacion de turnos la aporta Silero VAD v5 en ONNX.

La rama `edge_qnn_extras/` incluye una exportacion adicional de Qwen3-ASR para HTP v68 con una correccion de encoder de +9,41 dB de SNR, junto con un decoder ORT Q4 en CPU para Qualcomm QCS6490, y binarios estaticos `vector_estimator`/`vocoder` de Supertonic-3 para HTP v68 y v73 con frontends ORT INT8 DP/TE. No se detallan en la informacion disponible los datos de entrenamiento, el numero de tokens, la composicion del dataset ni si hubo RLHF o DPO en ninguno de los componentes.

## Capacidades

- Reconocimiento automatico del habla offline y en streaming en vietnamita, ingles, coreano y mandarin mediante Qwen3-ASR-0.6B.
- Traduccion automatica entre los cuatro idiomas en las seis direcciones de la cascada con HY-MT2-1.8B.
- Sintesis de voz en tiempo real para vietnamita, ingles y coreano (Supertonic-3) y para mandarin (VITS-AISHELL3).
- Segmentacion automatica de puntos finales de voz con Silero VAD v5.
- Normalizacion de texto para TTS en mandarin mediante transductores OpenFST (fechas, numeros y telefonos).
- Ejecucion completamente offline, sin llamadas a servicios en la nube.
- Aceleracion por hardware Qualcomm Hexagon HTP en las variantes QNN (v73 para SM8550, v68 para QCS6490).
- No se documentan capacidades de tool calling, agentes, vision, audio de entrada distinto de voz ni modo de razonamiento explicito.

## Casos de uso

- Traduccion de conversaciones presenciales sin conectividad: la cascada ASR → MT → TTS permite hablar en vietnamita, ingles, coreano o mandarin y recibir la traduccion hablada en el dispositivo, util en viajes, entornos rurales o zonas sin cobertura.
- Atencion al publico en entornos sanitarios o administrativos: un dispositivo Android con el bundle puede mediar entre personal y paciente que hablen idiomas distintos sin enviar datos de voz a terceros, lo que reduce el riesgo de cumplimiento.
- Pruebas de campo de investigacion linguistica: el VAD y el ASR en streaming permiten capturar y transcribir entrevistas multilingues en local, con los ficheros permaneciendo en el telefono.
- Despliegue en hardware embebido Qualcomm: la rama `edge_qnn_extras/` con HTP v68 y ORT Q4 esta pensada para la placa RB3 Gen 2 con QCS6490 en Linux, adecuada para quioscos o dispositivos fijos de traduccion.
- Evaluacion de pipelines on-device para integradores: el repositorio sirve como referencia verificable (SHA-256) de como empaquetar ASR, MT, TTS y VAD en formatos QNN y MNN para Android, reutilizable en prototipos propios.
- Demostracion en competiciones y jurados tecnicos: el layout `android_s23u/` esta disenado para que un evaluador instale el APK, seleccione la carpeta de modelos y verifique la integridad con `sha256sum -c SHA256SUMS` sin ambiguedad.
- Traduccion de voz en entornos con requisitos de privacidad (defensa, legal, educativo): al no requerir red, el audio no abandona el dispositivo, lo que encaja con politicas de tratamiento de datos sensibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona una mejora de calidad de senal en el encoder de Qwen3-ASR para HTP v68 (+9,41 dB de SNR) y tamanos de bundle (2.257,81 MiB para Android y 1.590,10 MiB para extras QNN), pero no incluye metricas de WER, BLEU, MOS ni latencias medidas.

## Requisitos de hardware

- VRAM/almacenamiento: el bundle Android ocupa 2.257,81 MiB (2,205 GiB) en 29 ficheros; los extras QNN ocupan 1.590,10 MiB (1,553 GiB) en 26 ficheros; el repositorio completo son 3,5 GB.
- SoC objetivo principal: Qualcomm Snapdragon 8 Gen 2 (SM8550) con Hexagon HTP v73, como el Samsung Galaxy S23 Ultra.
- SoC objetivo secundario: Qualcomm QCS6490 (RB3 Gen 2 Linux) con HTP v68 y decoder ORT Q4 en CPU.
- GPU de escritorio: no se documenta soporte para A100, H100 ni RTX 4090; el bundle esta orientado a aceleradores moviles Qualcomm y a CPU/OpenCL via MNN.
- Opciones de despliegue: aplicacion Android `voxflow-0.4.0-release.apk`, runtime QNN HTP, MNN 3.6.2 (OpenCL/CPU4), ONNX Runtime con ejecucion INT8 y Q4, y OpenFST para normalizacion de texto.
- Latencia y throughput: no disponibles; la model card solo afirma TTS en tiempo real y ASR en streaming, sin cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Despliegue |
|---|---|---|---|---|---|
| VoxFlow Prototype Edge Model Bundle | 0,6B (ASR) + 1,8B (MT) + TTS/VAD | No disponible | vi, en, ko, zh | Mixta sin GPL (Apache-2.0, MIT, OpenRAIL-M) | Android/QNN HTP, MNN, ONNX |
| Whisper large-v3 (referencia ASR) | 1,55B | 30 s de audio | Multilingue amplio | MIT | CPU/GPU, ONNX, whisper.cpp |
| NLLB-200 distilled 1.3B (referencia MT) | 1,3B | 512 tokens | 200 idiomas | CC-BY-NC-4.0 (no comercial) | CPU/GPU, ONNX |
| SeamlessM4T v2 (referencia speech-to-speech) | No disponible | No disponible | Multilingue | CC-BY-NC-4.0 (no comercial) | GPU principalmente |

La comparativa es orientativa: VoxFlow es un bundle de despliegue movil, no un modelo unico, y no publica metricas que permitan una comparacion cuantitativa con Whisper, NLLB o SeamlessM4T. Su ventaja diferencial es la ejecucion offline en Hexagon HTP y una licencia sin GPL que permite uso comercial, frente a las licencias no comerciales de NLLB y SeamlessM4T.

## Limitaciones y advertencias

- Cobertura linguistica limitada a cuatro idiomas (vi, en, ko, zh) y seis direcciones; no hay soporte documentado para castellano.
- No se publican parametros agregados, contexto, datos de entrenamiento ni benchmarks, lo que impide evaluar su calidad de forma objetiva.
- El bundle es un prototipo de competicion (v0.4.0) con cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso en produccion.
- Dependencia fuerte del hardware Qualcomm: las variantes QNN HTP v73 y v68 no son portables a otras GPU o aceleradores sin reexportacion.
- Licencia mixta con OpenRAIL-M en Supertonic-3, que impone restricciones de uso adicionales; es necesario revisar los terminos de cada componente antes de un despliegue comercial.
- Riesgo de alucinacion y errores de traduccion inherente a la cascada ASR → MT → TTS, con propagacion de errores entre etapas; no se documentan tasas de fallo.
- La model card incluye instrucciones en vietnamita y referencias a un APK y a un repositorio de GitHub externos; la integridad del binario APK no se verifica en este repositorio, solo los pesos con SHA-256.
- No se documentan sesgos conocidos, comportamiento en audio con ruido, ni limites de duracion de audio por turno.

## Enlaces

- Hugging Face: https://huggingface.co/anonytc/voxflow-prototype-ovaic-models
- Repositorio fuente: https://github.com/voxflow-team/voxflow-prototype
- Release del APK: referenciado en el repositorio fuente (no se proporciona URL directa en la informacion disponible)
- Paper, blog o demo: no disponibles en la informacion proporcionada
