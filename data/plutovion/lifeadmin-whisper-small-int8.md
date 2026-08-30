# plutovion/lifeadmin-whisper-small-int8

## Resumen

El modelo `plutovion/lifeadmin-whisper-small-int8` es una conversión a ONNX con cuantización INT8 del modelo Whisper Small de OpenAI, realizada por el desarrollador plutovion (LifeAdmin). Se trata de una versión optimizada para ejecución local y totalmente offline, pensada para integrarse en aplicaciones que requieran transcripción de voz sin conexión. El modelo hereda las capacidades multilingües del Whisper Small original, que fue entrenado con 680 000 horas de datos etiquetados, y lo hace en un formato ligero y portable gracias a la cuantización dinámica de pesos MatMul mediante ONNX Runtime.

La relevancia de este modelo radica en su enfoque práctico: permite desplegar un sistema de reconocimiento de voz en dispositivos con recursos limitados, sin depender de servicios en la nube y con una huella de memoria reducida. El repositorio incluye un `manifest.json` que registra el entorno de Python y los hashes SHA-256 de cada archivo, lo que garantiza trazabilidad y reproducibilidad. La licencia MIT facilita su uso comercial, y la integración con sherpa-onnx ofrece una vía sencilla para su ejecución en múltiples plataformas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper Small de OpenAI) |
| Parametros totales | 244 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 (QInt8 dinamico para MatMul) |
| Idiomas soportados | Multilingue (99 idiomas) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo base es OpenAI Whisper Small, un transformer encoder-decoder con arquitectura clásica de atención completa, entrenado sobre 680 000 horas de datos de voz etiquetados en múltiples idiomas y dominios. Whisper Small tiene 244 millones de parámetros y fue diseñado para generalizar bien a tareas de reconocimiento de voz y traducción sin ajuste fino adicional.

La conversión a INT8 se realizó mediante el exportador de sherpa-onnx, usando cuantización dinámica QInt8 de ONNX Runtime aplicada únicamente a los pesos de las multiplicaciones de matrices (MatMul). No se realizó ningún entrenamiento adicional ni fine-tuning; es una cuantización post-entrenamiento que reduce el tamaño del modelo y acelera la inferencia en CPU y GPU, a costa de una posible ligera pérdida de precisión. El repositorio incluye los hashes SHA-256 del checkpoint original y de las revisiones de OpenAI y sherpa-onnx, lo que permite verificar la procedencia exacta.

## Capacidades

- Transcripcion de voz a texto en 99 idiomas, heredada del modelo Whisper Small original.
- Traduccion de voz a texto en ingles (funcionalidad nativa de Whisper).
- Ejecucion totalmente offline, sin necesidad de conexion a internet.
- Inferencia en tiempo real o casi real en CPU gracias a la cuantizacion INT8.
- Compatible con el runtime sherpa-onnx, que permite despliegue en Android, iOS, Windows, Linux y macOS.
- Soporte para entradas de audio de hasta 20 segundos en el caso de uso MVP de LifeAdmin, aunque el modelo base soporta ventanas de hasta 30 segundos.

## Casos de uso

- Transcripcion de notas de voz en aplicaciones de productividad: el modelo puede convertir grabaciones de voz en texto editable de forma local, protegiendo la privacidad del usuario al no enviar audio a servidores externos.
- Subtitulado automatico de videos cortos: al ser ligero y rapido, puede integrarse en herramientas de edicion de video para generar subtitulos en tiempo real en multiples idiomas.
- Asistentes de voz embebidos en dispositivos IoT: su bajo consumo de memoria permite ejecutarlo en Raspberry Pi o similares para comandos de voz sin conexion.
- Transcripcion de reuniones y entrevistas en entornos con restricciones de conectividad: periodistas o profesionales que trabajan en zonas sin internet pueden transcribir conversaciones localmente.
- Accesibilidad para personas con discapacidad auditiva: aplicaciones de subtitulado en vivo que funcionan sin depender de servicios en la nube.
- Traduccion de voz en tiempo real para viajeros: el modelo puede transcribir y traducir frases cortas, util en aplicaciones de frases utiles sin conexion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,4 GB para los pesos en INT8 (el repositorio ocupa 0,4 GB en disco). En inferencia, el uso de memoria puede variar segun la longitud del audio y el runtime, pero es razonable esperar menos de 1 GB en total.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM (por ejemplo, NVIDIA GTX 1050 Ti o superior). Tambien funciona en CPU sin GPU, ya que Whisper Small es ligero.
- En consumer GPU: si, cabe en GPUs de gama baja como RTX 2060, GTX 1660, o incluso en iGPU integradas.
- Opciones de despliegue: sherpa-onnx (recomendado), ONNX Runtime, whisper.cpp (con conversion adicional), o cualquier runtime compatible con ONNX.
- Latencia y throughput: no disponible en la informacion proporcionada, pero al ser un modelo de 244M parametros en INT8, se puede esperar un tiempo real en CPU modernas para audios de menos de 20 segundos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| lifeadmin-whisper-small-int8 | 244M | no disponible | INT8 | MIT | ONNX |
| openai/whisper-small (original) | 244M | 448 tokens | FP32/FP16 | MIT | PyTorch |
| Intel/whisper-small-int8-static-inc | 244M | 448 tokens | INT8 estatico | MIT | ONNX |
| openai/whisper-tiny | 39M | 448 tokens | FP32/FP16 | MIT | PyTorch |

La comparativa muestra que el modelo de LifeAdmin es una variante cuantizada del Whisper Small original, con la ventaja de estar listo para usar con sherpa-onnx y con un tamaño reducido. Frente a la version estatica de Intel, esta utiliza cuantizacion dinamica, que puede ser mas sencilla de aplicar pero con una precision ligeramente inferior en algunos casos.

## Limitaciones y advertencias

- La cuantizacion INT8 puede degradar la precision en comparacion con el modelo en FP32, especialmente en entornos ruidosos o con acentos poco comunes.
- La model card del autor advierte que la precision varia segun idioma, hablante, dispositivo, ruido, nombres, numeros y code-switching.
- El caso de uso MVP de LifeAdmin limita la transcripcion a grabaciones de 20 segundos o menos; para audios mas largos, el rendimiento no esta garantizado.
- Whisper, en general, puede alucinar en silencios o en audio de baja calidad, generando texto que no corresponde al audio.
- El modelo no incluye mecanismos de deteccion de actividad de voz ni de diarizacion de hablantes.
- La licencia MIT permite uso comercial sin restricciones, pero el usuario debe revisar las licencias de las dependencias (sherpa-onnx usa Apache 2.0).
- No se proporcionan garantias de soporte ni mantenimiento por parte del autor.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/plutovion/lifeadmin-whisper-small-int8
- Modelo original OpenAI Whisper Small: https://huggingface.co/openai/whisper-small
- Proyecto sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Informacion sobre requisitos de VRAM de Whisper: https://gigagpu.com/whisper-vram-requirements/
- Referencia de requisitos de memoria: https://localmodel.run/model/whisper-small
