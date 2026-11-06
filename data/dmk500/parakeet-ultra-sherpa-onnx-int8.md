# dmk500/parakeet-ultra-sherpa-onnx-int8

## Resumen

Parakeet Ultra Sherpa-ONNX INT8 es un paquete de inferencia listo para producción del modelo de reconocimiento automático del habla (ASR) Moondream Parakeet Ultra, exportado a formato ONNX y cuantizado a int8 para su uso con el motor sherpa-onnx. No se trata de un modelo entrenado desde cero por el autor del repositorio (dmk500), sino de una reempaquetación reproducible de pesos ya existentes: la cadena de linaje parte de NVIDIA Parakeet TDT 0.6B v3, pasa por el post-entrenamiento de Moondream y llega a una exportación ONNX previa de leogaudin, cuyos ficheros se distribuyen sin modificaciones.

El modelo subyacente es un transducer TDT (Token-and-Duration Transducer) de aproximadamente 600 millones de parámetros, una arquitectura encoder-decoder-joiner que combina predicción de tokens con predicción de duración, lo que permite decodificación no autorregresiva por bloques y reduce la latencia frente a transductores clásicos. Cubre 25 idiomas europeos, incluidos el castellano, el catalán no está listado, pero sí portugués, francés, italiano, alemán, neerlandés y la mayoría de lenguas eslavas y nórdicas.

Su relevancia práctica reside en el formato: los tres ficheros ONNX int8 (encoder, decoder y joiner) más el vocabulario `tokens.txt` permiten desplegar ASR offline multilingüe en CPU sin dependencias de Python ni de CUDA, con un tamaño de archivo de unos 486 MB. Es una opción atractiva para transcripción local, subtitulado y pipelines embebidos donde no se quiere depender de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transducer TDT (Token-and-Duration Transducer): encoder + decoder + joiner |
| Parametros totales | ~0,6 mil millones (heredados de NVIDIA Parakeet TDT 0.6B v3) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio dependiente del encoder; no especificada en la información proporcionada) |
| Tipos de cuantizacion | int8 (única variante incluida en el paquete) |
| Idiomas soportados | 25: en, de, fr, es, it, pt, ru, uk, hr, sl, lv, lt, et, fi, sv, da, nl, pl, cs, sk, hu, ro, bg, el, mt |
| Licencia | CC BY 4.0 (pesos); el paquete incluye LICENSE-WEIGHTS |
| Formato de pesos | ONNX int8 (`encoder.int8.onnx`, `decoder.int8.onnx`, `joiner.int8.onnx`) + `tokens.txt` |
| Tamano del artefacto | 486.611.746 bytes (~464 MiB) comprimido en `.tar.bz2` |
| Motor de inferencia | sherpa-onnx (probado con 1.13.8), `model_type="nemo_transducer"` |
| Hash SHA-256 | `cc4f1cb2df74634515e2ae7ce2bc7a41fd91090b5a7e5f6634bf1f292fcd5587` |

## Arquitectura y entrenamiento

La arquitectura es un transducer TDT, variante de los RNN-T en la que el predictor emite conjuntamente un token y una duración (número de frames que avanza el encoder). Esta formulación permite saltos de frames en la decodificación, lo que se traduce en menor número de pasos y mayor velocidad en CPU. El modelo base, NVIDIA Parakeet TDT 0.6B v3, fue entrenado por NVIDIA; sobre él, Moondream aplicó un post-entrenamiento (cuyos detalles de datos, número de tokens y metodología no se especifican en la información disponible) que da lugar a Parakeet Ultra. No hay datos publicados en este repositorio sobre composición del dataset, uso de RLHF/DPO ni técnicas de aumentación.

La contribución técnica de este paquete concreto es la exportación y cuantización: se parte de la exportación de leogaudin, que sigue el script oficial de exportación de Parakeet TDT v3 de sherpa-onnx, y se verifica la integridad comparando los 1229 tensores y el grafo del encoder contra dos exportaciones independientes (chrmongeau y tpmaerk). Según la model card, decoder y joiner son byte-idénticos entre las tres y solo difieren las cadenas de metadatos del encoder, lo que da garantías razonables de reproducibilidad del artefacto.

## Capacidades

- Reconocimiento automático del habla offline multilingüe en 25 idiomas europeos, con salida de transcripción en texto plano.
- Decodificación TDT con predicción de duración, adecuada para streaming por bloques y para reducir latencia en CPU.
- Inferencia sin GPU: los ficheros ONNX int8 están pensados para ejecutarse con sherpa-onnx en CPU.
- Integración mediante `OfflineRecognizer.from_transducer(..., model_type="nemo_transducer")`.
- Empaquetado autocontenido: pesos, vocabulario y metadatos en un único archivo tar.bz2 verificable por SHA-256.
- No se documentan en la información disponible capacidades de diarización, timestamps por palabra, traducción, tool calling ni agentes; es un modelo puramente ASR.

## Casos de uso

- Transcripción local de reuniones y entrevistas: el paquete ONNX int8 se ejecuta en CPU con sherpa-onnx, de modo que se puede procesar audio confidencial sin enviarlo a servicios externos y sin GPU dedicada.
- Subtitulado automático de vídeo en pipelines de edición: al soportar 25 idiomas, un mismo motor cubre la generación de subtítulos para contenido multilingüe europeo, reduciendo la necesidad de varios modelos por idioma.
- Asistentes de voz embebidos en dispositivos de borde: el tamaño de ~464 MiB y la ausencia de dependencias CUDA lo hacen viable en mini-PC, Raspberry Pi de gama alta o contenedores ligeros.
- Indexación y búsqueda de archivos de audio: transcripción por lotes de grabaciones de centros de llamadas o archivos históricos para alimentar un motor de búsqueda textual.
- Accesibilidad: generación de transcripciones en tiempo casi real para personas con discapacidad auditiva en aplicaciones de escritorio, usando la decodificación por bloques del transducer.
- Preprocesado para pipelines de NLP: convertir audio a texto antes de pasarlo a un LLM o a un sistema de extracción de entidades, aprovechando el soporte multilingüe para normalizar entradas en varios idiomas.
- Prototipado rápido y evaluación: al ser un artefacto verificado y reproducible, sirve para comparar motores ASR o validar integraciones de sherpa-onnx antes de invertir en infraestructura GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de WER, latencia ni throughput para este paquete, ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM: no aplica en el escenario previsto; el paquete está cuantizado a int8 para inferencia en CPU. En caso de ejecutarse en GPU mediante un runtime ONNX compatible, el modelo de ~0,6 mil millones de parámetros en int8 ocuparía del orden de 0,6-1 GB de memoria, aunque esta cifra no está confirmada en la información disponible.
- GPU recomendadas: no disponibles; el artefacto no está orientado a GPU.
- GPU de consumo: irrelevante para el caso de uso principal; cabe en CPU. Para referencia, un modelo de este tamaño en int8 podría ejecutarse en cualquier GPU de consumo moderna vía ONNX Runtime, pero no hay datos publicados de rendimiento.
- Opciones de despliegue: sherpa-onnx (versión probada 1.13.8) con `OfflineRecognizer.from_transducer` y `model_type="nemo_transducer"`. Otros runtimes ONNX no están documentados para este paquete.
- Latencia y throughput: no disponibles. La arquitectura TDT está diseñada para reducir pasos de decodificación, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| dmk500/parakeet-ultra-sherpa-onnx-int8 | ~0,6 B | no disponible | 25 europeos | CC BY 4.0 | ONNX int8 |
| nvidia/parakeet-tdt-0.6b-v3 | ~0,6 B | no disponible | multilingüe (v3) | CC BY 4.0 | NeMo / safetensors |
| moondream/parakeet-ultra | ~0,6 B (heredado) | no disponible | 25 europeos | CC BY 4.0 | pesos originales |
| leogaudin/sherpa-onnx-nemo-parakeet-ultra-int8 | ~0,6 B | no disponible | 25 europeos | CC BY 4.0 | ONNX int8 |

La comparativa se limita a la cadena de linaje porque no se dispone de datos de rendimiento ni de especificaciones de contexto para contrastar con alternativas de otros fabricantes. En la práctica, este paquete es funcionalmente equivalente a las otras dos exportaciones ONNX int8 citadas (chrmongeau y tpmaerk), diferenciándose solo en metadatos del encoder.

## Limitaciones y advertencias

- No es un modelo original: es un reempaquetado de pesos de terceros. NVIDIA y Moondream no han revisado ni respaldado este paquete, según indica la propia model card.
- Solo se distribuye la variante int8; no hay fp16, fp32 ni GGUF en este repositorio, lo que limita el ajuste fino de precisión frente a velocidad.
- La cuantización int8 puede degradar ligeramente la precisión respecto a los pesos originales; no se aportan métricas de WER que cuantifiquen esa pérdida.
- Cobertura idiomática limitada a 25 lenguas europeas; no se documentan idiomas fuera de ese conjunto.
- No se especifican sesgos conocidos, comportamiento ante acentos no nativos, ruido de fondo ni audio de baja calidad; conviene validar con datos propios antes de producción.
- Riesgo de alucinación en ASR: los transductores pueden generar texto plausible en segmentos de silencio o ruido; se recomienda aplicar detección de actividad de voz (VAD) en producción.
- Licencia CC BY 4.0: permite uso comercial con atribución. Es obligatorio conservar la atribución a NVIDIA, Moondream y los exportadores intermedios, y distribuir el aviso de licencia incluido en `LICENSE-WEIGHTS`.
- Dependencia de una versión concreta del runtime: probado con sherpa-onnx 1.13.8; versiones distintas pueden requerir ajustes.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción ni validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/dmk500/parakeet-ultra-sherpa-onnx-int8
- Modelo base (post-entrenamiento): https://huggingface.co/moondream/parakeet-ultra
- Modelo original de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Exportación ONNX de referencia: https://huggingface.co/leogaudin/sherpa-onnx-nemo-parakeet-ultra-int8
- Exportación independiente de verificación: https://huggingface.co/chrmongeau/sherpa-onnx-nemo-parakeet-ultra-int8
- Exportación independiente de verificación: https://huggingface.co/tpmaerk/parakeet-ultra-sherpa-onnx-int8
- sherpa-onnx (motor de inferencia): https://github.com/k2-fsa/sherpa-onnx
