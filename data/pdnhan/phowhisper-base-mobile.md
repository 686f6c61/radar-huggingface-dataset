# pdnhan/PhoWhisper-base-mobile

## Resumen

PhoWhisper-base-mobile es una conversión a ONNX del modelo vinai/PhoWhisper-base, un ajuste fino en vietnamita del conocido Whisper de OpenAI realizado por VinAI Research. El modelo original, presentado en ICLR 2024, adapta la arquitectura transformer encoder-decoder de Whisper al reconocimiento automático del habla en vietnamita, y este repositorio lo empaqueta en formato ONNX para su ejecución en dispositivos Android e iOS mediante ONNX Runtime.

El modelo mantiene los pesos originales sin modificar; el trabajo del autor del repositorio (pdnhan) consiste únicamente en la exportación a ONNX (opset 17, IR version 9) y en la cuantización dinámica a int8 de las matrices de los operadores MatMul y Gather. El resultado son cuatro ficheros: encoder y decoder fusionado (con caché KV) en fp32 e int8, lo que permite integrar reconocimiento de voz vietnamita en aplicaciones móviles sin dependencias de servidor.

Con 74 millones de parámetros y un contexto de audio de 30 segundos por ventana, el modelo es relevante para desarrolladores que necesitan ASR en vietnamita de baja latencia y en el dispositivo, con una licencia permisiva BSD-3-Clause y sin necesidad de bibliotecas de operadores personalizados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 74 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 30 segundos de audio por ventana (1500 posiciones en el encoder) |
| Tipos de cuantizacion | fp32 e int8 (cuantizacion dinamica QInt8, per-tensor) |
| Idiomas soportados | vietnamita (vi) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX (opset 17, IR version 9) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Whisper: un encoder que procesa espectrogramas log-Mel de 80 canales calculados sobre 30 segundos de audio mono a 16 kHz (ventana FFT de 400 muestras, hop de 160, relleno con ceros) y produce un estado oculto de dimensión [1, 1500, 512], y un decoder autorregresivo con caché KV fusionada en un único grafo. La exportación a ONNX usa únicamente operadores estándar, lo que permite ejecutarlo con los paquetes oficiales de ONNX Runtime para Android y iOS sin bibliotecas de operadores personalizados.

El modelo base vinai/PhoWhisper-base fue entrenado por VinAI Research mediante ajuste fino de Whisper en vietnamita, según se describe en el artículo presentado en ICLR 2024 (Tiny Papers). No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO. La conversión a ONNX se realizó con `optimum-cli export onnx --task automatic-speech-recognition-with-past --opset 17`, seguida de `onnxruntime.quantization.quantize_dynamic` con QInt8 per-tensor sobre MatMul y Gather, incluyendo los subgrafos del decoder fusionado. Antes de cuantizar, la transposición en tiempo de ejecución de la cabeza LM se pliega en una constante para que también se cuantice.

## Capacidades

- Reconocimiento automático del habla (ASR) en vietnamita, con decodificación greedy.
- Procesamiento de audio de hasta 30 segundos por ventana de inferencia.
- Ejecución en el dispositivo (on-device) en Android e iOS mediante ONNX Runtime.
- Exportación estándar ONNX sin operadores personalizados, compatible con ONNX Runtime 1.20.0 y 1.31.1 (los ficheros int8 producen tokens idénticos en ambas versiones).
- Decodificación con caché KV fusionada para reducir el coste por paso autorregresivo.
- Soporte opcional del CoreML Execution Provider en iOS.
- No incluye soporte de tool calling, function calling, agentes, visión, audio más allá del ASR ni modo de razonamiento extendido.

## Casos de uso

- Transcripción de voz en aplicaciones móviles offline: el modelo puede integrarse en apps Android e iOS para transcribir notas de voz o dictado en vietnamita sin conexión a internet, usando los ficheros int8 (25,9 MB el encoder y 79,4 MB el decoder) que caben holgadamente en el almacenamiento de un teléfono.
- Asistentes de voz para atención al cliente en vietnamita: permite convertir en texto las consultas del usuario en el propio dispositivo antes de enviarlas a un backend, reduciendo latencia y coste de ancho de banda.
- Subtitulado automático de contenido audiovisual vietnamita: procesando el audio en ventanas de 30 segundos y concatenando las transcripciones, adecuado para vídeos cortos o pódcasts.
- Accesibilidad para personas con discapacidad auditiva: transcripción en tiempo real de conversaciones presenciales en vietnamita en aplicaciones de asistencia.
- Dictado por voz en herramientas de productividad: integración en editores de texto o aplicaciones de notas para introducir texto mediante voz en vietnamita.
- Investigación en ASR de bajo consumo: sirve como referencia para estudiar el impacto de la cuantización int8 en la precisión (8,2% WER en fp32 frente a 8,8% en int8) sobre un modelo Whisper pequeño.
- Preprocesamiento de pipelines de voz en el borde: transcripción local previa a un análisis de intenciones o traducción en la nube, minimizando la exposición de audio sensible.

## Benchmarks y rendimiento

La model card reporta únicamente una comprobación de cordura sobre los primeros 30 clips del split de test vietnamita de FLEURS, con decodificación greedy y texto en minúsculas sin puntuación:

| Precision | WER |
|---|---|
| fp32 | 8,2% |
| int8 | 8,8% |

El autor indica explícitamente que esta medición no constituye un benchmark formal y remite al artículo de PhoWhisper para una evaluación adecuada. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar, ni comparaciones con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: los ficheros int8 suman aproximadamente 105 MB (25,9 MB encoder + 79,4 MB decoder), por lo que la huella de memoria es muy reducida; los fp32 suman unos 291 MB.
- GPU recomendadas: no requiere GPU dedicada; está diseñado para CPU móvil. En escritorio puede ejecutarse en CPU sin problema.
- Cabe en cualquier GPU de consumo e incluso en dispositivos móviles de gama media; no necesita A100, H100 ni RTX 4090.
- Opciones de despliegue: ONNX Runtime para Android (Kotlin/Java), ONNX Runtime para iOS (Swift/Objective-C, con CoreML Execution Provider opcional), y ONNX Runtime en Python para escritorio o validación.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos comparativos con otros modelos de ASR en vietnamita ni con otras exportaciones móviles de Whisper. Se puede señalar que el modelo base vinai/PhoWhisper-base es la referencia directa, del cual este repositorio solo difiere en formato y precisión, pero no se dispone de sus métricas completas ni de alternativas comparables evaluadas en las mismas condiciones.

## Limitaciones y advertencias

- Solo soporta vietnamita; no se ha validado para otros idiomas.
- Ventana de audio limitada a 30 segundos por inferencia; audios más largos requieren segmentación y concatenación manual.
- La evaluación reportada es una comprobación de cordura sobre 30 clips, insuficiente para caracterizar el rendimiento en producción.
- La cuantización int8 introduce una degradación medible (8,2% a 8,8% WER en la muestra evaluada); en dominios ruidosos o con acentos marcados la diferencia podría ampliarse.
- Riesgo de alucinación y errores en nombres propios, siglas y términos técnicos, inherente a los modelos Whisper.
- No se dispone de información sobre sesgos demográficos o dialectales del modelo base en la documentación proporcionada.
- La licencia BSD-3-Clause permite uso comercial, pero se recomienda revisar las condiciones del modelo base vinai/PhoWhisper-base y de Whisper de OpenAI de los que deriva.
- El decoder fusionado requiere implementar correctamente el bucle de decodificación con gestión de la caché KV (encoder cache fija tras el primer paso, decoder cache realimentada en cada paso); errores en este bucle producen transcripciones incorrectas.
- Los ficheros int8 están validados con ONNX Runtime 1.20.0 y 1.31.1; otras versiones no se han verificado explícitamente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/pdnhan/PhoWhisper-base-mobile
- Modelo base: https://huggingface.co/vinai/PhoWhisper-base
- ONNX Runtime: https://onnxruntime.ai
- Paquete Swift para iOS: https://github.com/microsoft/onnxruntime-swift-package-manager
- Optimum (exportación ONNX): https://github.com/huggingface/optimum
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
- Artículo PhoWhisper (ICLR 2024 Tiny Papers): no disponible como enlace directo en la información proporcionada
