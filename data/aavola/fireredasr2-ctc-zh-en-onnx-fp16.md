# Aavola/fireredasr2-ctc-zh-en-onnx-fp16

## Resumen

FireRedASR2-CTC-zh-en-ONNX-fp16 es una conversión a ONNX en precisión fp16 del encoder y la cabeza CTC del modelo de reconocimiento automático del habla FireRedASR2-AED, desarrollado por FireRedTeam. El artefacto lo publica el usuario Aavola para uso en sus propias aplicaciones de reconocimiento de voz offline: la aplicación descarga los ficheros bajo demanda y verifica cada uno contra su SHA-256. No se trata de un modelo entrenado desde cero, sino de una redistribución cuantizada del modelo base, con solo el encoder y la cabeza CTC activos (la parte AED, decoder autorregresivo, queda descartada).

El modelo resuelve ASR bilingüe chino-inglés sobre arquitectura Conformer con decodificación CTC, empaquetado en un único grafo ONNX de aproximadamente 1,5 GB. Su interés práctico es que permite integrar reconocimiento de voz en aplicaciones sin depender de PyTorch ni de servicios en la nube, usando el runtime de ONNX Runtime y, presumiblemente, el ecosistema sherpa-onnx del que procede el export original.

La relevancia es acotada: el repositorio tiene cero descargas y cero likes en el momento de la consulta, y su propósito declarado es servir de espejo fijo y verificado para una aplicación concreta. Para terceros es útil como referencia de un export ONNX funcional de FireRedASR2 en fp16, pero no debe confundirse con el modelo oficial ni con una versión mantenida de forma general.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (encoder) + cabeza CTC; export ONNX del modelo FireRedASR2-AED |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende de la ventana de audio de entrada; no se especifica en la model card) |
| Tipos de cuantizacion | fp16 (conversión desde fp32 con el conversor float16 de ONNX Runtime, `keep_io_types=True`; entradas y salidas permanecen en fp32) |
| Idiomas soportados | chino (zh) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model.onnx` + `model.onnx.data`), más `tokens.txt`, `selfcheck.txt`, `weights.provenance` y `SHA256SUMS` |

## Arquitectura y entrenamiento

La arquitectura subyacente es un encoder Conformer, habitual en ASR moderno por combinar atención global con convoluciones locales para capturar dependencias de corto y largo alcance en la señal acústica. Sobre el encoder se aplica una cabeza CTC, que permite decodificación no autorregresiva en un solo paso, lo que reduce la latencia frente a esquemas AED (attention-based encoder-decoder) como el del modelo base completo. En este repositorio solo se incluyen encoder y CTC; el decoder AED del modelo original no forma parte del artefacto.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de ajuste fino con RLHF o DPO, ya que la model card no los detalla. La única modificación documentada respecto al export original es la conversión de fp32 a fp16 de `model.onnx` y `model.onnx.data`, declarada conforme a la sección 4(b) de la licencia Apache 2.0. El export ONNX procede de `csukuangfj2/sherpa-onnx-fire-red-asr2-ctc-zh_en-2026-02-25`, en la revisión `5816c6e906b01242cb707fd989967a8db8b2a556`, del proyecto sherpa-onnx de k2-fsa. Los ficheros `tokens.txt` se copian sin cambios; `selfcheck.txt` es una huella de referencia calculada en CPU sobre estos pesos fp16 para verificar que una GPU los computa correctamente, y `weights.provenance` documenta el origen de cada fichero de pesos (redactado en ruso).

## Capacidades

- Reconocimiento automático del habla (ASR) en chino e inglés, incluyendo posible mezcla de ambos idiomas en una misma locución.
- Decodificación CTC no autorregresiva, adecuada para transcripción de baja latencia.
- Inferencia mediante ONNX Runtime, sin dependencia de PyTorch.
- Ejecución offline: los ficheros se descargan y se verifican por SHA-256 antes de usarse.
- Verificación de integridad y de cómputo: `selfcheck.txt` permite comprobar que el hardware (especialmente GPU) produce resultados correctos sobre los pesos fp16.
- No se documentan capacidades de tool calling, agentes, visión, audio más allá de ASR ni modo de razonamiento.

## Casos de uso

- Transcripción offline en aplicaciones de escritorio o móvil: el formato ONNX y el tamaño de 1,5 GB permiten empaquetar el modelo en una app que transcribe audio localmente sin enviar datos a la nube, con verificación de integridad por SHA-256 en cada descarga.
- Subtitulado bilingüe chino-inglés: al soportar ambos idiomas, sirve para generar subtítulos de vídeos o reuniones donde los hablantes alternan entre chino e inglés.
- Dictado por voz en entornos sin conectividad: útil en escenarios de campo, aviación o industria donde no hay red, gracias a la inferencia puramente local con ONNX Runtime.
- Integración en pipelines de sherpa-onnx: al provenir de un export de sherpa-onnx, puede desplegarse con las herramientas de k2-fsa para reconocimiento en tiempo real por streaming o por segmentos.
- Verificación de despliegues en GPU: el fichero `selfcheck.txt` permite validar que una GPU concreta computa correctamente los pesos fp16 antes de poner el modelo en producción.
- Archivado reproducible de un modelo ASR: al fijar una revisión y publicar sumas SHA-256, sirve como referencia estable para experimentos que necesiten un ASR chino-inglés congelado y verificable.
- Transcripción de reuniones y notas de voz en aplicaciones corporativas con requisitos de privacidad, al no requerir servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Tamaño del artefacto: aproximadamente 1,5 GB (`model.onnx.data` son 1.468.889.526 bytes), lo que da una idea del orden de magnitud de la memoria necesaria para los pesos en fp16.
- VRAM estimada: no disponible de forma explícita; por el tamaño de los pesos, el modelo debería caber en GPUs consumer con 4-8 GB de VRAM, aunque no se confirma en la model card.
- GPU recomendadas: no disponibles. El autor menciona el uso de GPU para validar el cómputo fp16 mediante `selfcheck.txt`, pero no especifica modelos concretos (A100, H100, RTX 4090, etc.).
- Compatibilidad con GPU consumer: probable por tamaño, pero no confirmada.
- Opciones de despliegue: ONNX Runtime (implícito por el formato y por el conversor usado) y sherpa-onnx (por el origen del export). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo ASR.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Aavola/fireredasr2-ctc-zh-en-onnx-fp16 | Conformer + CTC (ONNX fp16) | zh, en | ONNX | Apache 2.0 | Solo encoder y CTC; espejo verificado por SHA-256 |
| FireRedTeam/FireRedASR2-AED | Conformer AED completo | zh, en | no disponible en esta ficha | Apache 2.0 | Modelo base original, incluye decoder AED |
| csukuangfj2/sherpa-onnx-fire-red-asr2-ctc-zh_en-2026-02-25 | Conformer + CTC (export ONNX) | zh, en | ONNX | Apache 2.0 | Export original en fp32 del que deriva este repositorio |
| Whisper (OpenAI) | Transformer encoder-decoder | multilingüe | varios | MIT | Alternativa generalista; no se dispone de comparación de rendimiento en esta ficha |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Solo cubre chino e inglés; no se documenta soporte para otras lenguas.
- Al usar únicamente encoder y CTC, se renuncia a la decodificación AED del modelo base, lo que puede afectar a la calidad en comparación con el modelo completo (no cuantificado en la información disponible).
- La conversión a fp16 puede introducir degradación numérica; el autor proporciona `selfcheck.txt` precisamente para detectar cómputos incorrectos en GPU.
- No hay información sobre sesgos, tasas de alucinación ni robustez ante ruido, acentos o audio de baja calidad.
- El repositorio tiene cero descargas y cero likes y está creado para una aplicación concreta; no hay garantía de mantenimiento ni de soporte por parte del autor.
- La licencia Apache 2.0 permite uso comercial, pero obliga a conservar avisos de copyright y a indicar los ficheros modificados (la conversión fp16), tal como hace la model card.
- El fichero `weights.provenance` está redactado en ruso, lo que puede dificultar la auditoría a lectores que no lo dominen.
- No se especifican requisitos de formato de audio (frecuencia de muestreo, normalización), lo que obliga a consultar el export original de sherpa-onnx.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Aavola/fireredasr2-ctc-zh-en-onnx-fp16
- Modelo base: https://huggingface.co/FireRedTeam/FireRedASR2-AED
- Export ONNX original (sherpa-onnx, revisión fijada): https://huggingface.co/csukuangfj2/sherpa-onnx-fire-red-asr2-ctc-zh_en-2026-02-25/tree/5816c6e906b01242cb707fd989967a8db8b2a556
- Proyecto sherpa-onnx (k2-fsa): no disponible en la información proporcionada
- Paper de FireRedASR2: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
