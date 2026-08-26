# Bbkblo/DhVaani-0.5-ONNX

## Resumen

DhVaani-0.5-ONNX es una conversión a ONNX del modelo de síntesis de voz DhVaani-0.5, desarrollado por ARTPARK-IISc como un ajuste fino de ZipVoice para el clonado de voz zero-shot en 27 idiomas de la India. Esta variante publicada por Bbkblo elimina la dependencia de PyTorch y permite ejecutar la síntesis únicamente con onnxruntime, numpy, scipy y soundfile, lo que facilita su integración en entornos de producción ligeros o embebidos.

El modelo se compone de tres bloques principales: un codificador de texto con expansión de duración, un decodificador basado en flow matching con guía de clasificador (CFG) integrada, y un vocoder Vocos con backbone ConvNeXt y cabezal ISTFT. El repositorio incluye versiones cuantizadas a int8 de los componentes principales, lo que reduce el tamaño y mejora el rendimiento en CPU, aunque también se ofrecen versiones fp32 opcionales.

Su relevancia actual reside en la escasez de modelos TTS multilingües de código abierto para lenguas índicas con calidad competitiva y licencia Apache-2.0. Al estar exportado a ONNX, se integra fácilmente con runtimes como onnxruntime, TGI, o pipelines personalizados en Python, y permite desplegarlo en infraestructuras sin GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ZipVoice (flow matching) + Vocoder Vocos (ConvNeXt + ISTFT) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (TTS, no aplica contexto de texto largo; ventana de audio dependiente de la entrada) |
| Tipos de cuantizacion | int8 (text encoder, fm decoder, vocoder backbone) y fp32 (text encoder y fm decoder opcionales) |
| Idiomas soportados | hi, en, bn, ta, te, mr, kn, ml, gu, pa, or, as, ur (la model card afirma 27 idiomas indicadores) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (.onnx) y NumPy (.npz) |

## Arquitectura y entrenamiento

El modelo se basa en el enfoque ZipVoice de k2-fsa, que combina un codificador de texto basado en caracteres (que expande la duración) con un decodificador de flow matching que genera la condición de voz a partir de una referencia de audio y su transcripción. El flujo de inferencia realiza un único paso de Euler en el decodificador, con un factor de guía de escala (CFG) integrado en los pesos para mejorar la calidad de la voz generada.

El vocoder es una instancia de Vocos, concretamente el modelo `charactr/vocos-mel-24khz`, que transforma el mel espectrograma en audio mediante una cabecera ISTFT. Los filtros mel se extraen con la implementación HTK de torchaudio y se almacenan en un archivo `.npz`. El entrenamiento del modelo base se realizó sobre datos de voz en múltiples idiomas índices, aunque no se detallan las cifras exactas de tokens ni el dataset en la información disponible. No se menciona el uso de RLHF ni DPO; el ajuste se centra en el clonado de voz zero-shot.

## Capacidades

- Sintesis de voz (TTS) en 13 idiomas listados explícitamente (hindi, inglés, bengalí, tamil, telugu, maratí, kannada, malayalam, gujarati, punjabi, odia, asamés y urdu), con soporte declarado de 27 idiomas indic.
- Clonado de voz zero-shot: a partir de una muestra de referencia (audio + transcripción) y un texto de destino, genera voz con las características del hablante de la referencia.
- Control de velocidad de habla mediante el parámetro `speed` en el encoder de texto.
- Control de guía de escala (`guidance_scale`) en el decodificador para ajustar la adherencia al texto.
- Inferencia en CPU sin necesidad de PyTorch, gracias a la exportación a ONNX y los pesos numpy del vocoder.
- Soporte de cuantización int8 para los componentes principales, lo que reduce el uso de memoria y mejora la latencia en hardware limitado.

## Casos de uso

- **Aplicaciones de asistencia por voz en idiomas índices**: el modelo puede integrarse en asistentes virtuales o chatbots que requieran respuestas habladas en hindi, bengalí, tamil u otros idiomas soportados, generando audio a partir de texto sin depender de servicios externos.
- **Clonado de voz para doblaje de contenido**: un estudio puede usar una muestra de voz de un actor para generar doblaje de vídeos o podcasts en varios idiomas, manteniendo la identidad vocal del locutor original.
- **Audiolibros y contenido educativo**: permite convertir libros o materiales educativos en audio en lenguas regionales de la India, con voz clonada de un narrador específico o con una voz neutra.
- **Accesibilidad para personas con discapacidad visual**: integración en lectores de pantalla que requieran síntesis de voz en idiomas índices con calidad natural y bajo coste computacional.
- **Generación de contenido en redes sociales**: creación de vídeos con voz en off personalizada para plataformas como YouTube o TikTok, sin necesidad de estudio de grabación.
- **Sistemas de IVR (respuesta de voz interactiva)**: despliegue en servidores de atención al cliente para generar respuestas dinámicas en varios idiomas, con la capacidad de cambiar la voz de referencia según el contexto o el usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no incluye métricas tipo MMLU, HumanEval o GSM8K, ya que es un sistema de síntesis de voz y no un modelo de lenguaje general. La única referencia de rendimiento proporcionada es que en CPU de 2 núcleos el tiempo de procesamiento es aproximadamente 4 veces el tiempo real con 16 pasos int8, y unas 3 veces el tiempo real con 8 pasos.

## Requisitos de hardware

- **CPU**: el modelo está optimizado para ejecutarse en CPU con onnxruntime. Con 2 núcleos, alcanza un factor de tiempo real de ~4× a 16 pasos int8 y ~3× a 8 pasos, lo que indica que es viable en hardware modesto.
- **VRAM**: no es necesario para la inferencia en CPU; si se usa GPU, la VRAM dependerá de la implementación de onnxruntime, pero no se indica un valor específico. Los pesos int8 suman aproximadamente 175 MB (6 + 119 + 50 MB), por lo que en GPU cabría en cualquier tarjeta con más de 1 GB.
- **GPU recomendadas**: no se requiere GPU; en caso de usarla, cualquier GPU moderna compatible con CUDA y onnxruntime acelerará la síntesis, aunque no se han publicado datos de latencia en GPU.
- **Opciones de despliegue**: onnxruntime directamente en Python, o mediante servicios de inferencia que soporten ONNX (por ejemplo, Triton Inference Server). El script de ejemplo `dhvaani_torchfree.py` muestra el flujo completo.
- **Latencia y throughput**: en CPU de 2 núcleos, el RTF es de 4× (tarda 4 segundos en generar 1 segundo de audio) con 16 pasos int8, y 3× con 8 pasos. No se aportan datos de throughput en condiciones de producción.

## Comparativa con modelos similares

No disponible. No se han encontrado comparaciones públicas entre DhVaani-0.5-ONNX y otros modelos TTS para idiomas índices (por ejemplo, VITS, Tacotron2, o modelos como `ai4bharat/indic-tts`). El modelo base PyTorch de ARTPARK-IISc podría compararse con otros TTS multilingües, pero no se dispone de datos de rendimiento en la información proporcionada.

## Limitaciones y advertencias

- **Idiomas soportados**: aunque la card afirma 27 idiomas, solo se listan 13 explícitamente; es recomendable verificar la cobertura real para cada idioma antes de usarlo en producción.
- **Calidad de voz**: la calidad puede variar según el idioma y la muestra de referencia; no se han publicado evaluaciones subjetivas (MOS) ni comparaciones con otros modelos.
- **Riesgo de alucinación**: al tratarse de un modelo de síntesis, puede producir voces que difieran del hablante de referencia en entornos de baja calidad de audio o con textos muy largos.
- **Dependencia de la referencia**: el clonado zero-shot depende de la calidad y duración de la muestra de referencia; si la referencia es corta o ruidosa, la salida puede degradarse.
- **Licencia**: Apache-2.0 permite uso comercial, pero el modelo base DhVaani-0.5 y el vocoderador `charactr/vocos-mel-24khz` también tienen licencia Apache-2.0, sin restricciones adicionales conocidas.
- **Formato de pesos**: los archivos `.npz` del vocoder y la mel filterbank no son estándar ONNX, lo que puede complicar la integración con herramientas que solo aceptan modelos ONNX completos.
- **Soporte de contexto**: no es un modelo de lenguaje, por lo que no admite contexto de texto largo ni razonamiento; su función es exclusivamente la síntesis de voz.

## Enlaces

- [Hugging Face: Bbkblo/DhVaani-0.5-ONNX](https://huggingface.co/Bbkblo/DhVaani-0.5-ONNX)
- [Modelo base ARTPARK-IISc/DhVaani-0.5](https://huggingface.co/ARTPARK-IISc/DhVaani-0.5)
- [ONNX (formato)](https://onnx.ai/)
- [Repositorio de modelos ONNX (referencia)](https://github.com/onnx/models)
