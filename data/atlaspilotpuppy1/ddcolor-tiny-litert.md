# AtlasPilotPuppy1/ddcolor-tiny-litert

## Resumen

ddcolor-tiny-litert es una conversión a LiteRT/TFLite del modelo DDColor "paper tiny" (piddnad/ddcolor_paper_tiny), una red de colorización automática de fotografías en blanco y negro desarrollada originalmente por Xiaoyang Kang y colaboradores en Alibaba DAMO Academy. El modelo empaqueta el encoder ConvNeXt-T y el decodificador multiescala de color de DDColor en un único archivo `.tflite` de aproximadamente 133 MB, con pesos almacenados en fp16 y cómputo en fp32, pensado para inferencia en dispositivo (on-device) mediante LiteRT.

La relevancia de esta conversión es práctica: permite ejecutar colorización de imágenes en hardware móvil sin depender de un servidor ni de PyTorch/ONNX Runtime, con una latencia declarada de 7 a 10 segundos por fotografía en un Pixel 10 Pro. El autor reporta que la diferencia máxima en los canales Lab a/b respecto a la conversión fp32 es de 0,17 (media 0,007), lo que considera visualmente imperceptible.

El modelo no es un modelo de lenguaje ni un transformer generativo de texto: es un modelo de imagen a imagen (pipeline `image-to-image`) especializado exclusivamente en colorización. No dispone de parámetros de contexto, vocabulario ni capacidades multimodales más allá de la entrada/salida de imágenes descrita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder ConvNeXt-T + decodificador de color multiescala (DDColor "paper tiny") |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen; entrada fija 1x3x512x512) |
| Tipos de cuantizacion | Pesos fp16, computo fp32; conversion realizada con ai-edge-quantizer |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.tflite` (LiteRT), 133.183.696 bytes, SHA-256 `bfcf636f337891ad9a877d79d17b71ffcb69ca2223a9e2ce6b08c63511d7c838` |

## Arquitectura y entrenamiento

La arquitectura subyacente es DDColor en su variante "paper tiny": un encoder ConvNeXt-T que extrae características de la imagen de entrada y un decodificador multiescala que predice los canales de cromaticidad Lab (a y b). La entrada no es la fotografía en color ni el gris original directamente, sino una representación de luminancia neutralizada: se convierte la foto a espacio Lab, se conserva el canal L, se fijan a = b = 0, se reconvierte a sRGB y se redimensiona a 512x512. La salida son los canales a/b a 512x512, que se reescalan al tamaño original y se combinan con el canal L a resolución completa para preservar el detalle.

El proceso de conversión documentado por el autor es: pesos originales de piddnad/ddcolor_paper_tiny, build ONNX de ipsilondev/ddcolor-onnx en fp16, reescritura a ONNX fp32, conversión con onnx2torch y litert-torch (salida coincidente con onnxruntime hasta 3e-6), y finalmente almacenamiento de pesos en fp16 con ai-edge-quantizer. No se documentan en la información disponible los datos de entrenamiento originales de DDColor (número de tokens, composición del dataset, uso de RLHF/DPO), que corresponden al trabajo upstream y no a esta conversión.

## Capacidades

- Colorización automática de fotografías en blanco y negro: predice los canales Lab a/b a partir de la luminancia.
- Entrada de imagen con forma fija `[1, 3, 512, 512]`, NCHW, float32, valores en rango 0 a 1.
- Salida de imagen `[1, 2, 512, 512]` con los canales de cromaticidad Lab.
- Inferencia on-device mediante LiteRT, sin dependencia de servidores ni de frameworks de deep learning de escritorio.
- Ejecución en CPU o GPU del dispositivo (según lo reportado en un Pixel 10 Pro).
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni generación de texto.
- No dispone de capacidades multilingües ni de modo thinking, visión general o audio.

## Casos de uso

- Restauración de archivos fotográficos históricos: digitalización de fondos documentales en blanco y negro y colorización por lotes en un dispositivo móvil o edge, sin enviar imágenes a la nube por motivos de privacidad.
- Aplicaciones móviles de edición fotográfica: integración del `.tflite` en una app Android/iOS con LiteRT para ofrecer colorización como función local, con latencia de 7 a 10 segundos por imagen en hardware de gama alta.
- Previsualización rápida en flujos de restauración profesional: generación de una propuesta de color antes de un trabajo manual más fino, aprovechando que la salida a/b se recombina con el canal L original a resolución completa.
- Kioscos o dispositivos de impresión instantánea: colorización en el propio dispositivo de fotos escaneadas antes de imprimir, sin conexión a internet.
- Prototipado e investigación en colorización: uso como baseline ligero y reproducible (un único `.tflite`) para comparar con otros métodos de colorización en experimentos académicos.
- Digitalización de patrimonio en campo: procesado de fotografías en archivos o museos con equipos portátiles donde no hay infraestructura GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor únicamente reporta métricas de fidelidad de la conversión (diferencia máxima en Lab a/b de 0,17 y media de 0,007 frente a la conversión fp32) y velocidad (7 a 10 segundos por foto en un Pixel 10 Pro, medidas con entrada sintética).

## Requisitos de hardware

- Tamaño del modelo: 133.183.696 bytes en disco (aproximadamente 0,13 GB), con pesos fp16 y cómputo fp32.
- VRAM/RAM estimada para inferencia: no disponible de forma explícita; el tamaño del archivo y la resolución fija 512x512 sugieren un consumo moderado, pero no se documenta una cifra concreta.
- GPU recomendadas: no se especifican modelos de GPU de servidor; el caso de uso declarado es hardware móvil con aceleración CPU o GPU vía LiteRT.
- Compatibilidad con GPU de consumo: no disponible; el autor solo cita un Pixel 10 Pro como plataforma de referencia.
- Opciones de despliegue: LiteRT (antiguo TensorFlow Lite) con el runtime de LiteRT; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: 7 a 10 segundos por fotografía en Pixel 10 Pro (CPU o GPU), medido con entrada sintética.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| ddcolor-tiny-litert (este) | no disponible | 512x512 fija | `.tflite` (LiteRT) | Apache-2.0 | Conversion on-device, fp16, ~133 MB |
| piddnad/ddcolor_paper_tiny | no disponible | no disponible | pesos PyTorch (upstream) | Apache-2.0 | Modelo original del que deriva esta conversion |
| ipsilondev/ddcolor-onnx | no disponible | no disponible | ONNX fp16 | Apache-2.0 | Build ONNX intermedio usado en la conversion |

No se dispone de datos de rendimiento comparativo (PSNR, LPIPS, FID) entre estas variantes en la información proporcionada, por lo que la comparativa se limita a formato, licencia y procedencia.

## Limitaciones y advertencias

- Los colores generados son una conjetura plausible, no los colores reales de la escena; el propio autor lo advierte explícitamente.
- La entrada debe prepararse con el pipeline exacto descrito (Lab con a = b = 0, reconversión a sRGB, redimensionado a 512x512); un preprocesado distinto degradará la salida.
- La resolución de inferencia está fijada a 512x512; el detalle se recupera recombinando con el canal L original, pero la cromaticidad se predice a esa resolución.
- No es un modelo de lenguaje: no admite prompts, tool calling ni tareas distintas de la colorización.
- No se documentan sesgos demográficos o culturales específicos, pero al ser un modelo de colorización puede reproducir sesgos de color presentes en sus datos de entrenamiento originales (no detallados aquí).
- Licencia Apache-2.0, que permite uso comercial; debe mantenerse la atribución a los autores de DDColor (Xiaoyang Kang et al., Alibaba DAMO Academy) y a ipsilondev por la conversión ONNX.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente del funcionamiento en otros dispositivos.
- La latencia reportada (7-10 s) corresponde a un único dispositivo de gama alta; en hardware inferior puede ser considerablemente mayor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AtlasPilotPuppy1/ddcolor-tiny-litert
- Modelo base upstream: https://huggingface.co/piddnad/ddcolor_paper_tiny
- Repositorio DDColor: https://github.com/piddnad/DDColor
- Conversión ONNX intermedia: https://huggingface.co/ipsilondev/ddcolor-onnx
