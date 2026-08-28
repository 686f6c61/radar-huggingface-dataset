# internetoftim/whisper-small-pld-fil-ONNX

## Resumen

El modelo `internetoftim/whisper-small-pld-fil-ONNX` es una exportación a formato ONNX del modelo de reconocimiento automático de voz (ASR) `sapinsapin/whisper-small-pld-fil`, un fine-tuning de `openai/whisper-small` especializado en filipino (taglish). El autor, internetoftim, ha convertido el modelo a ONNX y lo ha empaquetado para su uso directo en el navegador mediante la librería Transformers.js, lo que permite ejecutar transcripción de voz en el cliente sin necesidad de servidor.

La relevancia de este modelo radica en que democratiza el ASR en filipino para aplicaciones web, aprovechando WebGPU o WASM para inferencia local. Incluye pesos en precisión fp32 y cuantizados a q8 (QUInt8, solo pesos), reduciendo el tamaño total a aproximadamente 287 MB en su versión cuantizada. El modelo base fue entrenado durante 2000 pasos sobre 10 000 clips de audio, con un tamaño de lote de 8×2, tasa de aprendizaje de 1e-05, fp16 y gradient checkpointing.

Al estar basado en la arquitectura Whisper, hereda su diseño encoder-decoder transformer, aunque los detalles específicos de parámetros y contexto no se indican en la documentación proporcionada. La licencia es Apache 2.0, lo que facilita su uso comercial y su integración en proyectos de código abierto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (encoder-decoder transformer) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32, q8 (QUInt8, solo pesos) |
| Idiomas soportados | Filipino (taglish) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (fp32 y q8) |

## Arquitectura y entrenamiento

El modelo es una conversión a ONNX del checkpoint `sapinsapin/whisper-small-pld-fil`, que a su vez es un fine-tuning de `openai/whisper-small` sobre el dataset `sapinsapin/pld`. El entrenamiento original se realizó con 2000 pasos, 10 000 clips, batch de 8×2, learning rate de 1e-05, fp16 y gradient checkpointing. La exportación se llevó a cabo con `optimum-cli export onnx`, fusionando los decoders y aplicando cuantización dinámica (QUInt8) únicamente a los pesos. La configuración del extractor de características se tomó de `openai/whisper-small`, mientras que el tokenizer proviene del repositorio fuente.

No se dispone de información adicional sobre la composición del dataset de entrenamiento ni sobre técnicas de alineamiento o refuerzo (RLHF/DPO). La arquitectura subyacente es la de Whisper, un transformer encoder-decoder diseñado para ASR, aunque los detalles numéricos (número de capas, dimensiones, etc.) no se especifican en la documentación disponible.

## Capacidades

- Reconocimiento automático de voz (ASR) en filipino y taglish, con salida de texto transcrito.
- Ejecución completamente en el navegador mediante Transformers.js, con soporte para WebGPU y WASM.
- Acepta como entrada un array de floats en formato `Float32Array` representando audio.
- Incluye dos variantes de precisión: fp32 (mayor fidelidad) y q8 (menor tamaño, ~287 MB).
- No se mencionan capacidades adicionales como tool calling, agentes, visión o audio multilingüe más allá del ASR.

## Casos de uso

- Transcripción en tiempo real en aplicaciones web: el modelo puede procesar audio directamente en el navegador, lo que permite dictado o subtitulado en vivo sin enviar datos a un servidor, reduciendo latencia y costes de infraestructura.
- Asistentes de voz en filipino para páginas web: integrable en interfaces conversacionales o de comandos por voz, aprovechando la inferencia local para preservar la privacidad del usuario.
- Subtitulación automática de vídeos en el cliente: al ejecutarse en el navegador, puede generar subtítulos para contenido multimedia sin necesidad de transcodificación ni servicios externos.
- Herramientas de accesibilidad para hablantes de filipino: permite convertir voz en texto en aplicaciones de apoyo a personas con discapacidad auditiva o dificultades de escritura.
- Aplicaciones PWA (Progressive Web Apps) de dictado: al ser ligero en su versión q8, puede funcionar en dispositivos móviles y de gama baja, ofreciendo entrada de texto por voz en entornos sin conexión.
- Prototipado rápido de ASR en filipino: los desarrolladores pueden integrar el modelo en demos o MVPs sin necesidad de gestionar servidores de inferencia, gracias a su formato ONNX y compatibilidad con Transformers.js.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base menciona métricas WER y CER sobre un split de validación, pero no se proporcionan valores numéricos en la documentación consultada. Tampoco se incluyen comparativas con otros modelos ASR.

## Requisitos de hardware

- No se especifican requisitos de VRAM ni GPU en la documentación del modelo.
- Al estar diseñado para ejecución en navegador, se puede inferir que funciona con WebGPU o WASM, lo que implica compatibilidad con GPUs integradas y CPUs modernas.
- La versión cuantizada q8 ocupa aproximadamente 287 MB, por lo que puede cargarse en memoria de dispositivos con recursos limitados, aunque no se indica el consumo exacto de RAM.
- Para despliegue en servidor, al ser un modelo ONNX, podría utilizarse con runtime como ONNX Runtime, aunque no se menciona explícitamente.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos ASR en filipino o con la versión original de Whisper. Los datos de rendimiento y especificaciones de modelos alternativos no están disponibles en las fuentes consultadas.

## Limitaciones y advertencias

- El modelo está especializado en filipino y taglish; su rendimiento en otros idiomas probablemente sea deficiente o nulo.
- La ortografía del taglish varía considerablemente a nivel de palabra, lo que puede afectar a la precisión de la transcripción, como se indica en la documentación del modelo base.
- La cuantización q8 puede introducir una ligera degradación en la precisión respecto a la versión fp32, aunque no se cuantifica en la información disponible.
- Al ser una exportación ONNX, podrían existir diferencias menores de comportamiento frente al modelo original en PyTorch, especialmente en la fusión de decoders.
- No se mencionan sesgos específicos, pero al ser un modelo entrenado sobre un dataset concreto, podría reflejar sesgos presentes en los datos de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base y del dataset original para asegurar el cumplimiento de todas las restricciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/internetoftim/whisper-small-pld-fil-ONNX
- Modelo base (sapinsapin/whisper-small-pld-fil): https://huggingface.co/sapinsapin/whisper-small-pld-fil
- Modelo original (openai/whisper-small): https://huggingface.co/openai/whisper-small
- Página de FriendliAI con información del modelo base: https://friendli.ai/models/sapinsapin/whisper-small-pld-fil
