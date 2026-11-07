# santhosh63/whisper-tamil-medium-web

## Resumen

`santhosh63/whisper-tamil-medium-web` es una exportación a ONNX del modelo de reconocimiento automático del habla `vasista22/whisper-tamil-medium`, publicada por el usuario santhosh63 para su uso en navegador mediante transformers.js. No se trata de un modelo entrenado desde cero, sino de una conversión de formato del checkpoint original de Whisper medium afinado para tamil, empaquetada con el objetivo de integrarse en la aplicación SANSA Voice to Text. El repositorio tiene un tamaño de 6,7 GB, coherente con los pesos de un Whisper medium en precisión completa más las variantes ONNX necesarias para ejecución web.

El modelo hereda las capacidades del checkpoint base: transcripción de audio a texto en tamil, con la arquitectura encoder-decoder transformer propia de Whisper (unos 769 millones de parámetros en la variante medium) y una ventana de audio de 30 segundos procesada en segmentos. La relevancia de esta publicación concreta reside en el formato: permite ejecutar ASR en el cliente sin backend, lo que facilita despliegues de privacidad por diseño y aplicaciones web estáticas.

La información publicada por el autor es mínima: la model card se limita a indicar que es una exportación ONNX del modelo base para transformers.js, y no se documentan métricas, idiomas adicionales ni detalles del proceso de conversión. Las descargas y likes registrados son cero en el momento de la consulta, lo que sugiere una publicación reciente y de nicho.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper medium) exportado a ONNX |
| Parámetros totales | no disponible en la información proporcionada (el modelo base Whisper medium tiene aproximadamente 769 M) |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la información proporcionada (Whisper procesa ventanas de audio de 30 s) |
| Tipos de cuantización | no disponible en la información proporcionada; el repositorio incluye pesos ONNX, pero no se detallan variantes cuantizadas |
| Idiomas soportados | no disponible en la información proporcionada; el modelo base está afinado para tamil |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (para transformers.js) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper medium de OpenAI: un transformer encoder-decoder con atención completa, entrenado originalmente para transcripción multilingüe y traducción de voz. El checkpoint `vasista22/whisper-tamil-medium` es un ajuste fino de `openai/whisper-medium` sobre datos tamil procedentes de múltiples corpus ASR públicos, realizado en el marco del Whisper fine-tuning sprint. No se dispone en la información proporcionada del número de horas de audio, la composición exacta del dataset ni si se aplicaron técnicas de aumento de datos o regularización específicas.

La contribución de esta publicación es exclusivamente de formato: la conversión a ONNX para su ejecución en navegador con transformers.js. No se documentan en la model card ni en los resultados de búsqueda detalles sobre el proceso de exportación, la versión de Optimum/transformers.js utilizada, la precisión de los pesos ONNX (fp32, fp16 o int8) ni posibles diferencias de calidad respecto al modelo original. Tampoco se indica si se aplicó alguna técnica de decodificación especulativa o atención lineal; Whisper estándar no las incorpora.

## Capacidades

- Reconocimiento automático del habla (ASR) en tamil, heredado del ajuste fino del modelo base.
- Transcripción de audio en ventanas de 30 segundos, con manejo de audio más largo mediante segmentación interna del pipeline de Whisper.
- Ejecución en navegador mediante transformers.js y ONNX Runtime Web, sin necesidad de servidor.
- Integración en aplicaciones web estáticas para dictado o subtitulado en cliente.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-step; no son capacidades propias de un modelo ASR.
- No se documentan capacidades multilingües adicionales más allá del tamil; el modelo base podría conservar parte del multilingüismo de Whisper medium, pero no está confirmado en la información disponible.
- No se documentan modos especiales como thinking mode, visión o audio más allá de la propia entrada de audio.

## Casos de uso

- Dictado por voz en aplicaciones web: el modelo puede ejecutarse íntegramente en el navegador con transformers.js, transcribiendo audio del micrófono en tamil sin enviar datos a un servidor, lo que simplifica el cumplimiento de privacidad.
- Subtitulado de reuniones o clases en tamil: integrado en una aplicación de videoconferencia, permite generar transcripciones en tiempo casi real por segmentos de 30 segundos, con la ventaja de que el audio no abandona el dispositivo del usuario.
- Accesibilidad para personas con discapacidad auditiva: un sitio web puede ofrecer transcripción en vivo de contenido hablado en tamil usando el modelo en el cliente, reduciendo costes de infraestructura al no requerir GPU en servidor.
- Procesamiento por lotes de archivos de audio en tamil: en un pipeline Node.js con ONNX Runtime, el modelo puede transcribir grabaciones almacenadas (entrevistas, podcasts) sin depender de APIs externas.
- Prototipado rápido de productos de voz: al ser un modelo ONNX listo para transformers.js, un equipo puede validar una funcionalidad de ASR en tamil en una demo web en horas, sin montar backend ni gestionar credenciales de API.
- Investigación en ASR de bajos recursos: sirve como referencia ejecutable en navegador para comparar la calidad del ajuste fino tamil frente a Whisper medium original en experimentos reproducibles y de bajo coste de despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio no incluye WER, CER ni comparaciones con otros modelos, y los resultados de búsqueda sobre el modelo base tampoco aportan cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa del modelo base Whisper medium, la inferencia en fp16 requiere del orden de 2-3 GB de memoria, pero esta cifra no está confirmada para esta exportación ONNX concreta.
- GPU recomendadas: no disponible en la información proporcionada. Al estar orientado a navegador, el cómputo puede recaer en CPU o en WebGPU/WebGL según el backend de ONNX Runtime Web.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; el tamaño del repositorio (6,7 GB) sugiere pesos en precisión completa, lo que puede limitar la ejecución fluida en navegadores con poca memoria.
- Opciones de despliegue: transformers.js en navegador; también podría ejecutarse con ONNX Runtime en Node.js u otros entornos compatibles con ONNX, aunque no se documenta.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto de audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| santhosh63/whisper-tamil-medium-web | no disponible (base Whisper medium, ~769 M) | ventanas de 30 s | tamil (base) | apache-2.0 | ONNX |
| vasista22/whisper-tamil-medium | no disponible (base Whisper medium, ~769 M) | ventanas de 30 s | tamil | no disponible en la información proporcionada | safetensors/PyTorch |
| openai/whisper-medium | ~769 M | ventanas de 30 s | multilingüe | no disponible en la información proporcionada | PyTorch |

La comparativa se limita a estos tres modelos porque son los únicos mencionados en la información proporcionada. No se dispone de datos de rendimiento (WER) para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- La model card es extremadamente escueta: no documenta datos de entrenamiento, métricas, proceso de exportación ni precisión de los pesos ONNX, lo que dificulta evaluar la fidelidad respecto al modelo original.
- Al ser una exportación ONNX, pueden existir diferencias numéricas o de calidad frente al checkpoint PyTorch original; no se han publicado verificaciones al respecto.
- El modelo está especializado en tamil; su uso con otros idiomas no está documentado y probablemente degrade la calidad.
- Riesgo de alucinación inherente a los modelos Whisper: en segmentos con silencio, ruido o audio poco claro pueden generarse transcripciones inventadas o repeticiones.
- Sesgos conocidos: no documentados en la información proporcionada; los modelos ASR suelen reflejar sesgos de acento, dialecto y género presentes en los corpus de entrenamiento.
- Licencia apache-2.0, lo que permite uso comercial, pero conviene verificar la licencia del modelo base `vasista22/whisper-tamil-medium`, no indicada en la información disponible.
- El tamaño del repositorio (6,7 GB) puede suponer una carga inicial lenta en aplicaciones web y problemas de memoria en dispositivos móviles.
- Sin descargas ni likes registrados, no hay evidencia de uso en producción ni de validación por la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/santhosh63/whisper-tamil-medium-web
- Modelo base: https://huggingface.co/vasista22/whisper-tamil-medium
- README del modelo base: https://huggingface.co/vasista22/whisper-tamil-medium/blob/main/README.md
- Modelo original de OpenAI: https://huggingface.co/openai/whisper-medium
- Repositorio de fine-tuning citado por el autor del modelo base: whisper-finetune (no se dispone de URL directa en la información proporcionada)
- Documentación de transformers.js: no disponible en la información proporcionada
