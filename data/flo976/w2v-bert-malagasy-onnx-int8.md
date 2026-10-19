# Flo976/w2v-bert-malagasy-onnx-int8

## Resumen
Este modelo es una versión ONNX cuantizada a int8 de Flo976/w2v-bert-malagasy, un sistema de reconocimiento automático del habla (ASR) para malgache publicado por Flo976. El artefacto está pensado para inferencia en CPU con ONNX Runtime, sin necesidad de PyTorch, y reduce el espacio en disco de 2,4 GB a 612 MB y el consumo pico de RAM de 3,2 GB a 1,6 GB.

La relevancia práctica está en el despliegue de ASR para una lengua de bajos recursos en entornos sin GPU: en un procesador reciente con instrucciones VNNI se midió una latencia mediana de 625 ms a 2 hilos para enunciados de 4,8 s de media, frente a 1.695 ms de la versión fp32. La pérdida de precisión medida es pequeña y no significativa en el conjunto de evaluación: 14,36 % de WER greedy frente a 14,21 % del modelo original.

El modelo conserva la arquitectura W2V-BERT 2.0 con cabeza CTC del checkpoint base. No es un modelo generativo multiuso: su alcance es la transcripción de audio en malgache, con soporte opcional de un modelo de lenguaje KenLM de 4 gramos para decodificación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | W2V-BERT 2.0 (wav2vec2-bert) con cabeza CTC |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica a tokens; se evaluaron enunciados de 2-8 s; clips de más de 8 s no medidos |
| Tipos de cuantización | int8 dinámica QInt8 por canal en nodos MatMul, Gemm y Conv; existe versión fp32 original |
| Idiomas soportados | malgache (mg) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (`model.onnx`) con pesos int8; procesador y vocabulario en JSON |

| Otros datos | Valor |
|---|---|
| Pipeline | automatic-speech-recognition |
| Modelo base | Flo976/w2v-bert-malagasy |
| Relación con el modelo base | quantized |
| Tamaño del repositorio | 612 MB |
| Librería | onnx |
| Audio de entrada | 16 kHz mono |
| Decodificación | CTC greedy; opcional con KenLM 4-gram |

## Arquitectura y entrenamiento
El modelo es una exportación ONNX y una cuantización dinámica del checkpoint Flo976/w2v-bert-malagasy, que emplea la arquitectura W2V-BERT 2.0 con cabeza CTC para reconocimiento de voz. No se ha reentrenado: los pesos proceden del modelo original. La información disponible no detalla el número de tokens de entrenamiento, la composición del corpus ni si se aplicaron técnicas de ajuste como RLHF o DPO; en un sistema ASR no es el mecanismo habitual. La cadena de procedencia indicada es Flo976/w2v-bert-malagasy, derivado de badrex/w2v-bert-2.0-malagasy-asr, que a su vez parte de facebook/w2v-bert-2.0.

La innovación técnica está en el proceso de despliegue. Primero se exportó el modelo con `torch.onnx.export` (opset 17, ejes dinámicos); el grafo fp32 coincide con PyTorch a 2e-5 en los logits y produce salidas idénticas en 1.500 enunciados. Después se aplicó `onnxruntime.quantization.quantize_dynamic`, QInt8 por canal, sobre nodos MatMul, Gemm y Conv. Se probaron una variante por tensor y la cuantización dinámica de PyTorch; esta última perdió 0,74 puntos de forma significativa. La variante por canal se eligió tras observar los resultados de test y se confirmó en validación, por lo que sus cifras de test tienen un pequeño sesgo de selección.

## Capacidades
- Reconocimiento de voz en malgache (mg) a partir de audio mono a 16 kHz.
- Decodificación CTC greedy con vocabulario de caracteres y salida de texto.
- Decodificación opcional con modelo de lenguaje KenLM 4-gram mediante `pyctcdecode`.
- Inferencia en CPU con ONNX Runtime y `CPUExecutionProvider`, sin PyTorch.
- Ejecución con hilos configurables (`intra_op_num_threads`) para ajustar latencia y uso de CPU.
- No incluye tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo generativo conversacional.
- No se documentan capacidades de visión, generación de audio, diarización, marcas de tiempo ni streaming.
- No se declaran otros idiomas distintos del malgache.

## Casos de uso
- Transcripción de notas de voz y archivos de audio cortos en malgache: el modelo procesa clips de 2-8 s con una latencia mediana de 625 ms a 2 hilos en CPU con VNNI, y permite automatizar la conversión de voz a texto sin GPU.
- Subtitulado y documentación de vídeos en malgache: se puede segmentar el audio en fragmentos cortos, transcribirlos en CPU y revisar el resultado humano antes de publicar; es adecuado para lenguas de bajos recursos donde faltan herramientas comerciales.
- Atención al cliente y centros de llamadas: transcripción de fragmentos de llamadas para análisis de calidad o búsqueda de texto; conviene segmentar las llamadas largas porque los clips de más de 8 s no se evaluaron en esta versión.
- Creación de corpus lingüísticos y proyectos de investigación: transcripción asistida de entrevistas y grabaciones de campo en malgache; el WER de aproximadamente 14 % exige una fase de corrección, pero reduce el trabajo manual inicial.
- Accesibilidad y formación interna: generación de subtítulos para vídeos corporativos o materiales educativos en malgache, con despliegue local en CPU y sin enviar audio a servicios externos.
- Sistemas de voz interactivos e IVR: reconocimiento de comandos o respuestas cortas en malgache dentro de flujos telefónicos; es necesario medir la latencia en el hardware objetivo porque el rendimiento depende de las instrucciones VNNI del procesador.
- Archivística y búsqueda de contenido audiovisual: transcripción de grabaciones en malgache para indexar y buscar por texto; se recomienda dividir el audio en clips cortos y aplicar el modelo KenLM opcional para mejorar la decodificación.

## Benchmarks y rendimiento

Evaluación con 1.500 enunciados cortos fijos (2-8 s) del split de test, mismos identificadores para ambos modelos, referencias e hipótesis normalizadas del mismo modo (minúsculas y sin
