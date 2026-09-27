# krut42/voice-fastconformer-it-ctc-int8

## Resumen

krut42/voice-fastconformer-it-ctc-int8 es una versión cuantizada a int8 del reconocedor de voz italiano stt_it_fastconformer_hybrid_large_pc de NVIDIA, publicada por el usuario krut42 como fuente de respaldo para la aplicación Android «Слышно» (Slyshno), que la descarga para transcripción en el propio dispositivo. Es un modelo de reconocimiento automático del habla (ASR) en italiano basado en la arquitectura FastConformer y exportado a ONNX, que utiliza únicamente la cabeza CTC del modelo híbrido original.

El modelo parte de la exportación ONNX realizada por OpenVoiceOS y añade metadatos específicos de sherpa-onnx (vocab_size = 513, normalize_type = per_feature, subsampling_factor = 8, model_type = EncDecHybridRNNTCTCBPEModel, language = it). Sobre ese grafo se aplica una cuantización dinámica int8 con ONNX Runtime limitada a los nodos MatMul (pesos en uint8), mientras que las convoluciones permanecen en coma flotante. El resultado es un único fichero de unos 165 MiB ejecutable en CPU.

Su interés práctico es que ilustra un flujo de despliegue de ASR en el borde: cuantización int8 de un modelo «large», integración con sherpa-onnx y verificación de integridad por tamaño y SHA-256. El repositorio ocupa 0,2 GB y se distribuye bajo licencia CC BY 4.0 con atribución a NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (Conformer con subsampling depthwise separable, factor 8); modelo híbrido EncDec usado con cabeza CTC |
| Parametros totales | no disponible (variante «large» del modelo base de NVIDIA) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR; factor de subsampling 8) |
| Tipos de cuantizacion | int8 dinámica: pesos uint8, solo nodos MatMul; convoluciones en coma flotante |
| Idiomas soportados | italiano (it) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (model.int8.onnx) + tokens.txt (texto plano) |

## Arquitectura y entrenamiento

La arquitectura es FastConformer, una variante de Conformer que incorpora un módulo de subsampling depthwise separable con factor 8 para reducir la longitud de la secuencia antes del codificador. El modelo base de NVIDIA es de tipo híbrido EncDec (RNNT + CTC); este repositorio emplea exclusivamente la cabeza CTC junto con el codificador, exportados a ONNX. Los metadatos de sherpa-onnx confirman un vocabulario de 513 tokens, normalización de características de tipo per_feature y entrada de audio de 16 kHz mono con características de 80 dimensiones.

El proceso de conversión consta de dos pasos documentados: primero OpenVoiceOS exportó a ONNX el codificador con la cabeza CTC desde el modelo original de NVIDIA; después krut42 añadió los metadatos de sherpa-onnx y aplicó cuantización dinámica int8 con ONNX Runtime restringida a los nodos MatMul. No se aportan en la información disponible datos sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; esos detalles corresponden al modelo base de NVIDIA y no se reproducen aquí.

## Capacidades

- Reconocimiento automático del habla en italiano a partir de audio de 16 kHz mono.
- Salida con puntuación y mayúsculas incluidas.
- Funcionamiento offline en el dispositivo, sin depender de servicios en la nube.
- Integración con sherpa-onnx mediante OfflineRecognizer y configuración NeMo CTC (nemo_ctc.model, tokens).
- Ejecución en CPU con cuantización int8, apta para dispositivos móviles.
- Verificación de integridad del modelo por tamaño y SHA-256 en el flujo de la aplicación cliente.
- No dispone de tool calling, capacidades de agente, visión, audio generativo ni modo «thinking»; es un modelo puramente ASR.

## Casos de uso

- Transcripción en el dispositivo para aplicaciones Android: el modelo se integra mediante sherpa-onnx OfflineRecognizer y funciona sin conexión, lo que evita enviar audio a servidores externos y protege la privacidad.
- Subtitulado de audio en italiano: dado que la salida incluye puntuación y mayúsculas, es adecuado para generar subtítulos legibles en tiempo casi real desde el propio terminal.
- Dictado y notas de voz: la cuantización int8 y el tamaño reducido permiten ejecutar el reconocimiento en portátiles antiguos o móviles de gama media sin GPU dedicada.
- Indexación y búsqueda de archivos de audio: transcripción por lotes de grabaciones en italiano para construir índices de texto buscables.
- Accesibilidad: conversión de voz a texto para personas con discapacidad auditiva en entornos de habla italiana.
- Preprocesado de pipelines de voz: primer paso de ASR dentro de un flujo mayor (resumen, clasificación, traducción) donde la transcripción se realiza localmente antes de cualquier procesamiento posterior.
- Sistemas empotrados y kioscos: reconocimiento de comandos o transcripción básica en hardware limitado con CPU y sin acelerador.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre FLEURS `it_it` dev, ejecutados con sherpa-onnx 1.13.8, dos hilos y con mayúsculas y puntuación eliminadas antes de la evaluación:

| Conjunto evaluado | WER | CER |
|---|---|---|
| FLEURS it_it dev, primeros 12 clips | 11,2 % | 6,8 % |
| FLEURS it_it dev, primeros 100 clips | 10,8 % | 5,3 % |

No se han publicado en la información disponible otros resultados de benchmarks (MMLU, HumanEval u otros), que además no aplican a un modelo de reconocimiento de voz.

## Comparativa con modelos similares

| Modelo | Tipo | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|
| krut42/voice-fastconformer-it-ctc-int8 (este) | FastConformer CTC, ONNX para sherpa-onnx | int8 (MatMul, uint8) | CC BY 4.0 | HuggingFace, 0,2 GB |
| nvidia/stt_it_fastconformer_hybrid_large_pc | FastConformer híbrido (RNNT + CTC), NeMo | pesos originales (no cuantizado) | CC BY 4.0 | HuggingFace (modelo base) |
| OpenVoiceOS/stt_it_fastconformer_hybrid_large_pc_onnx | FastConformer CTC, ONNX | sin cuantizar (fp32) | CC BY 4.0 | HuggingFace (export ONNX) |

Las tres entradas comparten la misma arquitectura y el mismo origen; difieren en el formato y el nivel de cuantización. No se dispone en la información proporcionada de datos de benchmarks comparables frente a alternativas de otros autores (por ejemplo, sistemas ASR multilingües genéricos) para el idioma italiano.

## Limitaciones y advertencias

- Solo reconoce italiano; no soporta otros idiomas.
- No hay información sobre sesgos específicos del modelo base; el rendimiento puede degradarse con acentos regionales, ruido de fondo o audio de baja calidad.
- Riesgo de alucinación de texto en segmentos con silencio, ruido o habla solapada, común en modelos CTC.
- La evaluación de precisión se realizó únicamente sobre los primeros 12 y 100 clips de FLEURS it_it dev, por lo que no constituye una validación extensa.
- La licencia CC BY 4.0 permite uso comercial, pero exige atribución a NVIDIA y a los autores de la conversión; este repositorio es un redistribuidor y no el autor original del modelo.
- Al usar solo la cabeza CTC se pierde la decodificación RNNT del modelo base, lo que puede reducir ligeramente la precisión frente a la variante híbrida completa.
- La cuantización int8 afecta solo a los MatMul; las convoluciones permanecen en coma flotante, de modo que el ahorro de memoria es parcial.
- El repositorio no registra descargas ni interacciones y su fecha de creación es posterior a la de los modelos base, por lo que conviene verificar la integridad de los ficheros mediante los SHA-256 publicados antes de usarlo en producción.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/krut42/voice-fastconformer-it-ctc-int8
- Modelo base de NVIDIA: https://huggingface.co/nvidia/stt_it_fastconformer_hybrid_large_pc
- Exportación ONNX de OpenVoiceOS: https://huggingface.co/OpenVoiceOS/stt_it_fastconformer_hybrid_large_pc_onnx
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
