# malinali-app/whisper-tiny-onnx

## Resumen

malinali-app/whisper-tiny-onnx es un paquete de pesos en formato ONNX derivado de OpenAI Whisper Tiny, exportado especificamente para el runtime sherpa-onnx. Lo publica el proyecto Malinali, una aplicacion de reconocimiento de voz orientada a ejecucion en dispositivo ("on-device"), y su proposito es servir como motor de transcripcion de audio dentro de dicha aplicacion sin depender de servicios en la nube.

El modelo no ha sido reentrenado: los grafos proceden de la exportacion de csukuangfj/sherpa-onnx-whisper-tiny, a su vez derivada del modelo base openai/whisper-tiny. La particularidad de esta publicacion es que los ficheros MatMul estan cuantizados a int8 (encoder.int8.onnx y decoder.int8.onnx), lo que reduce el peso del paquete a unos 0,1 GB y permite inferencia en CPU o dispositivos con recursos limitados.

Su relevancia actual radica en el despliegue de ASR (reconocimiento automatico del habla) en entornos de borde y aplicaciones moviles o de escritorio, donde no es viable cargar un modelo grande ni mantener conexion de red. Al estar amparado bajo licencia MIT y basarse en Whisper Tiny multilingue, ofrece una via sencilla para integrar transcripcion local mediante la configuracion OfflineWhisperModelConfig de sherpa-onnx.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (modelo base OpenAI Whisper Tiny) |
| Parametros totales | 39 millones (correspondientes al modelo base openai/whisper-tiny) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | ventanas de audio de 30 segundos (caracteristica del modelo base Whisper) |
| Tipos de cuantizacion | int8 (MatMul) en encoder y decoder |
| Idiomas soportados | multilingue (variante Whisper Tiny multilingue; el numero exacto de idiomas no se detalla en la informacion disponible) |
| Licencia | MIT |
| Formato de pesos | ONNX (encoder.int8.onnx, decoder.int8.onnx) mas tokens.txt |

## Arquitectura y entrenamiento

La arquitectura corresponde a OpenAI Whisper en su variante Tiny: un transformer encoder-decoder que procesa espectrogramas de audio de hasta 30 segundos y genera texto autoregresivamente. El encoder consume las caracteristicas acusticas y el decoder produce los tokens de transcripcion, apoyandose en tokens especiales de idioma y de tarea (transcripcion o traduccion). Al ser una exportacion, no hay entrenamiento adicional ni ajuste fino: los pesos son los del modelo original transformados a grafos ONNX con operaciones MatMul cuantizadas a int8 para el runtime sherpa-onnx.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO en esta publicacion, ya que se trata de una conversion de pesos y no de un modelo entrenado por el autor. La innovacion practica es la cuantizacion int8 del export, que reduce el tamano y acelera la inferencia en CPU, ademas del uso de la configuracion OfflineWhisperModelConfig de sherpa-onnx como interfaz de integracion.

## Capacidades

- Transcripcion de voz a texto (automatic-speech-recognition) sobre segmentos de audio de hasta 30 segundos.
- Funcionamiento multilingue heredado de Whisper Tiny multilingue.
- Traduccion de voz a texto en ingles para idiomas soportados (capacidad nativa de la tarea de traduccion de Whisper).
- Inferencia local en dispositivo sin conexion a red, gracias al formato ONNX int8 y al runtime sherpa-onnx.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso en la informacion disponible.
- No se documenta capacidad de vision ni de audio mas alla de la propia transcripcion.
- No dispone de modo "thinking" ni de salidas estructuradas especificas mas alla del texto transcrito.

## Casos de uso

- Transcripcion en aplicaciones moviles sin conexion: el paquete int8 (~0,1 GB) permite ejecutar ASR en el propio dispositivo con sherpa-onnx, evitando enviar audio a servidores externos y reduciendo latencia de red.
- Subtitulado de audio en tiempo casi real en equipos de sobremesa: al procesar ventanas de 30 segundos, se puede segmentar la entrada y generar subtitulos localmente en CPU.
- Asistentes de voz integrados en aplicaciones de escritorio: la transcripcion local alimenta comandos o dictado sin depender de APIs de terceros, util en entornos con datos sensibles.
- Dictado de notas y documentos: integrable en editores o herramientas de productividad para convertir voz a texto en idiomas soportados por Whisper Tiny.
- Procesamiento por lotes de archivos de audio en pipelines de datos: al ser un modelo pequeno, permite transcribir grandes volumenes de clips en servidores de CPU a bajo coste.
- Traduccion de audio a ingles en flujos de documentacion: la tarea de traduccion de Whisper Tiny puede emplearse para generar texto en ingles a partir de audio en otros idiomas.
- Prototipado e investigacion de ASR: sirve como linea base ligera para comparar con modelos mayores o para validar integraciones con sherpa-onnx antes de escalar a variantes superiores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para esta exportacion ONNX int8 en la informacion disponible. El paquete no incluye metricas de WER ni comparativas de rendimiento propias del autor.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 39 millones de parametros en int8, el consumo de memoria es minimo; cabe holgadamente en menos de 1 GB de RAM o VRAM.
- GPU recomendadas: no requiere GPU. Puede ejecutarse en CPU; cualquier GPU moderna (por ejemplo, RTX 3060 o superior) aceleraria la inferencia, aunque no es necesaria.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU de consumo e incluso en dispositivos moviles y sistemas embebidos.
- Opciones de despliegue: sherpa-onnx mediante OfflineWhisperModelConfig; tambien puede integrarse en runtimes que acepten grafos ONNX.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Notas |
|---|---|---|---|---|
| malinali-app/whisper-tiny-onnx | 39 M | ONNX int8 | MIT | Paquete para sherpa-onnx, multilingue, int8 |
| csukuangfj/sherpa-onnx-whisper-tiny | 39 M | ONNX | MIT (heredada del base) | Origen de los grafos de este paquete |
| onnx-community/whisper-tiny | 39 M | ONNX | MIT | Exportacion ONNX orientada a transformers.js / WebML |
| openai/whisper-tiny | 39 M | safetensors / PyTorch | MIT | Modelo base original multilingue |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion disponible.

## Limitaciones y advertencias

- Al derivar de Whisper Tiny, hereda su menor precision frente a variantes mayores (base, small, medium, large) en acentos marcados, ruido de fondo y audio solapado.
- Riesgo de alucinacion: los modelos Whisper pueden generar texto plausible en segmentos con silencio prolongado o audio ininteligible.
- La cuantizacion int8 puede introducir una ligera degradacion de precision respecto a los pesos originales en punto flotante.
- La ventana de contexto esta limitada a segmentos de 30 segundos; audios mas largos requieren troceado previo.
- No se detalla en la informacion disponible la lista exacta de idiomas ni su calidad relativa.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones del modelo base openai/whisper-tiny, tambien MIT.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validacion por parte de la comunidad.
- No se documentan sesgos especificos en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/malinali-app/whisper-tiny-onnx
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Origen de los grafos sherpa-onnx: https://huggingface.co/csukuangfj/sherpa-onnx-whisper-tiny
- Exportacion ONNX alternativa: https://huggingface.co/onnx-community/whisper-tiny
- Documentacion de exportacion de Whisper a ONNX (sherpa): https://k2-fsa.github.io/sherpa/onnx/pretrained_models/whisper/export-onnx.html
- Repositorio del proyecto Malinali: https://github.com/malinali-app/malinali-app
