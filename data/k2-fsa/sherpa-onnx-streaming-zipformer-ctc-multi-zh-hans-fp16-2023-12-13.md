# k2-fsa/sherpa-onnx-streaming-zipformer-ctc-multi-zh-hans-fp16-2023-12-13

## Resumen

El modelo `sherpa-onnx-streaming-zipformer-ctc-multi-zh-hans-fp16-2023-12-13` es un modelo de reconocimiento automático del habla (ASR) en streaming desarrollado por el equipo k2-fsa, el mismo grupo detrás del framework k2 y de la librería sherpa-onnx. Se distribuye como un paquete ONNX optimizado en fp16 y está pensado para su uso con la librería sherpa-onnx, que permite desplegar ASR en tiempo real en dispositivos de borde, navegadores y servidores sin necesidad de Python ni de frameworks de deep learning pesados.

El nombre indica varias cosas: es un modelo Zipformer (arquitectura de encoder basada en transformers con atención en múltiples escalas y convoluciones), usa una cabeza CTC (Connectionist Temporal Classification) para la decodificación, es "streaming" (procesa audio de forma incremental con baja latencia), está orientado a chino mandarín simplificado (`zh-hans`) y viene cuantizado en fp16. La fecha del nombre, 2023-12-13, corresponde al entrenamiento original del checkpoint.

Es relevante porque ofrece un pipeline ASR listo para producción en un único paquete ONNX de unos 0,1 GB, con licencia Apache 2.0, lo que lo hace adecuado para transcripción en tiempo real en aplicaciones de voz sin depender de servicios en la nube. La información pública disponible en la model card es mínima (solo la licencia), por lo que muchos detalles técnicos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Zipformer con cabeza CTC, modo streaming (no disponible el detalle exacto de capas y dimensiones) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; ventana de streaming no especificada) |
| Tipos de cuantizacion | fp16 (según el nombre del modelo); no se documentan otras variantes en esta ficha |
| Idiomas soportados | chino mandarín simplificado (`zh-hans`) según el nombre; no disponible la lista oficial |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (paquete sherpa-onnx) |

## Arquitectura y entrenamiento

Zipformer es una arquitectura de encoder para ASR presentada por el equipo k2-fsa (paper "Zipformer: A faster and better encoder for automatic speech recognition"). Se caracteriza por un diseño en forma de U con bloques que operan a distintas resoluciones temporales, atención con múltiples escalas y capas convolucionales que reducen la longitud de secuencia en las capas intermedias, lo que disminuye el coste computacional y la latencia frente a un transformer estándar. La cabeza CTC permite decodificación sin modelo de lenguaje externo, lo que simplifica el despliegue en streaming.

El modelo está entrenado sobre datos de habla en chino mandarín simplificado (según el identificador `multi-zh-hans`), pero la model card no aporta información sobre el volumen de datos, la composición del corpus, el uso de aumentación de datos, ni si hubo entrenamiento con técnicas de alineación o ajuste fino específico. Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal. La única información técnica fiable es la del nombre: variante fp16, streaming, CTC y Zipformer.

## Capacidades

- Reconocimiento automático del habla en streaming: procesa audio de forma incremental y devuelve transcripciones parciales con baja latencia.
- Transcripción de chino mandarín simplificado (`zh-hans`).
- Decodificación CTC, que permite funcionar sin un modelo de lenguaje externo y simplifica el pipeline.
- Integración nativa con sherpa-onnx, lo que habilita su uso en C++, C#, Java, Kotlin, JavaScript, Python, Go, Rust y Swift, entre otros.
- Ejecución en CPU sin GPU, gracias al runtime ONNX y a la cuantización fp16.
- No se documentan capacidades de tool calling, agentes, visión, audio más allá del ASR ni modo de razonamiento.

## Casos de uso

- Transcripción en tiempo real de reuniones y videollamadas: el modo streaming permite mostrar subtítulos parciales mientras se habla, sin esperar al final de la frase, lo que encaja con su diseño de baja latencia.
- Subtitulado automático de vídeo y retransmisiones en directo en chino mandarín: el paquete ONNX se puede integrar en un pipeline de captura de audio y generar subtítulos incrementales.
- Asistentes de voz para aplicaciones móviles y de escritorio: al funcionar con sherpa-onnx en CPU, se puede embeber en apps nativas sin depender de la nube.
- Dictado por voz en herramientas de productividad: transcripción continua de notas y documentos en chino simplificado con un modelo de 0,1 GB que cabe en dispositivos modestos.
- Atención al cliente con voz: transcripción de llamadas en tiempo real para alimentar sistemas de análisis o de enrutamiento, con la ventaja de la licencia Apache 2.0 para uso comercial.
- Procesamiento por lotes de archivos de audio en servidores sin GPU: el runtime ONNX permite desplegar en contenedores ligeros y escalar horizontalmente.
- Investigación en ASR en chino: sirve como baseline reproducible y como ejemplo de despliegue de Zipformer CTC en formato ONNX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en CPU; en GPU, el paquete de 0,1 GB en fp16 ocupa del orden de cientos de MB incluyendo el runtime de ONNX, aunque no se dispone de cifras oficiales.
- GPU recomendadas: no disponibles; el modelo está diseñado para ejecutarse en CPU.
- Cabe en GPU de consumo: sí, cualquier GPU con soporte ONNX Runtime puede ejecutarlo, aunque no es necesario.
- Opciones de despliegue: sherpa-onnx (C++, C#, Java, Kotlin, JavaScript, Python, Go, Rust, Swift), ONNX Runtime directamente.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Formato | Licencia | Contexto / streaming |
|---|---|---|---|---|---|
| sherpa-onnx-streaming-zipformer-ctc-multi-zh-hans-fp16-2023-12-13 | Zipformer + CTC | chino mandarín simplificado | ONNX fp16 | Apache 2.0 | streaming |
| Whisper (OpenAI) | Transformer encoder-decoder | multilingüe | PyTorch, ONNX, GGML | MIT | no streaming nativo |
| Zipformer de k2-fsa (otras variantes) | Zipformer + transducer o CTC | varios | ONNX | Apache 2.0 | streaming |
| Wav2Vec 2.0 / HuBERT | Transformer convolucional | multilingüe | PyTorch | varía | no streaming nativo |

La comparativa con Whisper es la más habitual: Whisper ofrece multilingüismo y mayor robustez en dominios diversos, pero no está diseñado para streaming incremental, mientras que este Zipformer CTC sí. Frente a otras variantes de Zipformer del mismo equipo, la diferencia principal es la cabeza de decodificación (CTC frente a transducer) y el idioma. No se dispone de datos de rendimiento comparativo publicados en la información proporcionada.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos ni evaluación de robustez; se desconoce el comportamiento ante acentos, ruido de fondo o habla espontánea.
- Riesgo de alucinación y errores de transcripción inherente a todo sistema ASR, especialmente en audio ruidoso o con vocabulario técnico.
- Limitación de idioma: el identificador indica chino mandarín simplificado; no se garantiza soporte de otros dialectos ni de chino tradicional.
- No se documentan limitaciones de contexto ni de duración máxima de audio.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las licencias de los datos de entrenamiento originales, no disponibles en la model card.
- El paquete está pensado para sherpa-onnx; su uso fuera de ese ecosistema requiere adaptar el grafo ONNX y el preprocesado de features.
- No se dispone de información sobre mantenimiento, versionado ni soporte del autor para esta variante concreta.

## Enlaces

- Hugging Face: https://huggingface.co/k2-fsa/sherpa-onnx-streaming-zipformer-ctc-multi-zh-hans-fp16-2023-12-13
- Repositorio sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Repositorio k2: https://github.com/k2-fsa/k2
- Paper de Zipformer: https://arxiv.org/abs/2310.11230
- Documentación de sherpa-onnx: https://k2-fsa.github.io/sherpa/onnx/
