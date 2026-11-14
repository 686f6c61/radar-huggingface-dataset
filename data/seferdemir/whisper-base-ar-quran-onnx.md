# seferdemir/whisper-base-ar-quran-onnx

## Resumen

whisper-base-ar-quran-onnx es una exportación cuantizada a ONNX del modelo de reconocimiento automático del habla (ASR) tarteel-ai/whisper-base-ar-quran, desarrollado originalmente por Tarteel AI y adaptado a formato ONNX por el usuario seferdemir. El modelo parte de la arquitectura Whisper Base de OpenAI (unas 74 millones de parámetros) y está especializado en la transcripción de recitación coránica en árabe. Su propósito es permitir la inferencia en dispositivos Android mediante ONNX Runtime en CPU, sin necesidad de GPU ni de conexión a servicios en la nube.

El modelo resuelve el problema de ejecutar ASR especializado en árabe coránico en entornos con recursos limitados, empaquetando el encoder y el decoder como dos grafos ONNX cuantizados dinámicamente (QUInt8 para el encoder, QInt8 para el decoder). El repositorio ocupa aproximadamente 0,1 GB, lo que lo hace adecuado para su inclusión en aplicaciones móviles.

Se trata de un artefacto de despliegue más que de un modelo entrenado desde cero: no aporta pesos nuevos ni datos de entrenamiento propios, sino una conversión de formato y cuantización del modelo base de Tarteel AI bajo licencia Apache 2.0. Su relevancia radica en la posibilidad de integrar transcripción coránica offline en aplicaciones móviles con un consumo de recursos muy bajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper Base) exportado a ONNX |
| Parametros totales | no disponible (el modelo base Whisper Base tiene aproximadamente 74 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 segundos, entrada [1, 80, 3000] en el encoder) |
| Tipos de cuantizacion | Cuantizacion dinamica: QUInt8 en encoder, QInt8 en decoder |
| Idiomas soportados | arabe (ar) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (encoder_uint8.onnx, decoder_int8.onnx) mas whisper_vocab.json y whisper_added_tokens.json |

## Arquitectura y entrenamiento

El modelo subyacente es Whisper Base, un transformer encoder-decoder con atención completa que procesa espectrogramas mel de 80 canales y ventanas de audio de 30 segundos (forma de entrada [1, 80, 3000]). El encoder produce `last_hidden_state` y el decoder, sin caché KV, recibe `input_ids` y `encoder_hidden_states` para generar `logits`. La exportación se realizó con optimum 1.23.3, transformers 4.46.3 y torch 2.8.0, y la cuantización con onnxruntime 1.19.2. El prompt de decodificación empleado es 50258, 50272 (árabe), 50359 y 50363, con token EOS 50257.

No se dispone de información sobre los datos de entrenamiento originales del modelo base tarteel-ai/whisper-base-ar-quran en la documentación proporcionada, más allá de que se trata de un ajuste de Whisper Base para recitación coránica en árabe. Tampoco se documentan procesos de RLHF, DPO ni innovaciones técnicas adicionales. La contribución de esta versión ONNX se limita a la conversión de formato y a la cuantización dinámica para reducir el tamaño y acelerar la inferencia en CPU.

## Capacidades

- Reconocimiento automático del habla en árabe, especializado en recitación coránica.
- Transcripción de audio de hasta 30 segundos por ventana de inferencia.
- Ejecución en CPU mediante ONNX Runtime, orientada a dispositivos Android.
- Inferencia offline, sin dependencia de servicios en la nube.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe más allá del árabe.
- No se documenta modo thinking, visión ni audio más allá del ASR.

## Casos de uso

- Aplicaciones móviles de recitación coránica: el modelo permite transcribir la recitación del usuario en el dispositivo y compararla con el texto de referencia, gracias a su tamaño reducido (0,1 GB) y a la inferencia en CPU con ONNX Runtime.
- Verificación de memorización (hifz): una aplicación Android puede grabar fragmentos de recitación y obtener la transcripción para detectar errores u omisiones, sin conexión a internet.
- Subtitulado offline de contenido religioso: transcripción de sermones o recitaciones grabadas en árabe para generar subtítulos en lotes locales.
- Herramientas de estudio para estudiantes de árabe coránico: transcripción de audio de práctica para revisión posterior por parte de profesores.
- Archivado y búsqueda de audio: indexación de grabaciones de recitación mediante transcripción local, sin enviar audio a servidores externos por motivos de privacidad.
- Integración en pipelines de ONNX Runtime en escritorio: uso del encoder y decoder ONNX en aplicaciones de escritorio o servidores ligeros para transcripción por lotes de audio corto en árabe.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso objetivo (CPU Android); el repositorio ocupa 0,1 GB.
- GPU recomendadas: no disponibles; el modelo está pensado para CPU mediante ONNX Runtime.
- Cabe en GPU consumer: previsiblemente sí por tamaño, pero no se documenta ni se garantiza el soporte de ejecución en GPU con estos grafos ONNX.
- Opciones de despliegue: ONNX Runtime (Android y otras plataformas), con los ficheros encoder_uint8.onnx y decoder_int8.onnx.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| seferdemir/whisper-base-ar-quran-onnx | no disponible (base Whisper Base, ~74 M) | ventana de audio de 30 s | ar | Apache 2.0 | ONNX cuantizado |
| tarteel-ai/whisper-base-ar-quran | no disponible (base Whisper Base, ~74 M) | ventana de audio de 30 s | ar | Apache 2.0 | safetensors/PyTorch (no confirmado) |
| openai/whisper-base | ~74 M | ventana de audio de 30 s | multilingue | MIT | PyTorch, ONNX disponible |

La comparativa se limita a los datos disponibles; no se dispone de información sobre rendimiento comparado entre estas variantes.

## Limitaciones y advertencias

- Especializado exclusivamente en árabe coránico; su rendimiento en árabe conversacional general o en otros idiomas no está documentado y probablemente sea deficiente.
- El decoder exportado no incluye caché KV, lo que puede implicar una decodificación menos eficiente en secuencias largas.
- La cuantización dinámica a QUInt8/QInt8 puede degradar la precisión de transcripción respecto al modelo base en PyTorch; no se documenta la magnitud de esa degradación.
- Ventana de audio limitada a 30 segundos por inferencia; audios más largos requieren segmentación manual.
- Riesgo de alucinación inherente a los modelos Whisper, especialmente en segmentos con silencio o ruido.
- No se documentan sesgos específicos, pero al estar entrenado sobre recitación coránica puede presentar sesgos hacia ese dominio y estilo de habla.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda conservar la atribución a Tarteel AI y revisar las condiciones del modelo base.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni de mantenimiento activo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/seferdemir/whisper-base-ar-quran-onnx
- Modelo base: https://huggingface.co/tarteel-ai/whisper-base-ar-quran
- Whisper Base de OpenAI (referencia de arquitectura): https://huggingface.co/openai/whisper-base
- Optimum (herramienta de exportación): https://huggingface.co/docs/optimum
- ONNX Runtime: https://onnxruntime.ai/
