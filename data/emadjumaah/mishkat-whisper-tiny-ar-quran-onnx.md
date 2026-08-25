# emadjumaah/mishkat-whisper-tiny-ar-quran-onnx

## Resumen

El modelo `emadjumaah/mishkat-whisper-tiny-ar-quran-onnx` es una exportación a ONNX cuantizada del modelo `tarteel-ai/whisper-tiny-ar-quran`, que a su vez es un ajuste fino de `openai/whisper-tiny` orientado al reconocimiento de la recitación del Corán en árabe. El autor, emadjumaah, lo ha preparado para ser ejecutado en dispositivos locales mediante la librería Transformers.js, garantizando que el audio del usuario nunca abandone su dispositivo, una característica clave para aplicaciones sensibles a la privacidad.

La arquitectura subyacente es la de Whisper-tiny, un transformador encoder-decoder con aproximadamente 39 millones de parámetros, diseñado para procesar segmentos de audio de hasta 30 segundos. Este export no modifica los pesos del modelo original, pero introduce dos optimizaciones importantes: la re-tied del embedding compartido para eliminar duplicados y una cuantización dinámica int8 por tensor, lo que reduce significativamente el tamaño del modelo y su huella de memoria sin pérdida apreciable de precisión.

La relevancia actual del modelo radica en su capacidad para ofrecer transcripción de voz en árabe de alta calidad en entornos con recursos limitados, como navegadores web o aplicaciones móviles, sin depender de servidores externos. Su licencia Apache 2.0 permite su uso comercial y su redistribución, lo que lo convierte en una opción atractiva para desarrolladores que buscan soluciones de ASR en ára con privacidad incorporada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper-tiny (encoder-decoder Transformer) |
| Parametros totales | no disponible (Whisper-tiny ≈ 39M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 30 segundos de audio |
| Tipos de cuantizacion | int8 dinámica (pesos, por tensor) |
| Idiomas soportados | ar (árabe) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (encoder_model_int8.onnx, decoder_model_merged_int8.onnx) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Whisper-tiny de OpenAI, que combina un encoder de audio y un decoder de texto. El encoder procesa los espectrogramas de mel y el decoder genera la transcripción autoregresivamente. El modelo original `tarteel-ai/whisper-tiny-ar-quran` fue ajustado fino con datos de recitación del Corán en ára, lo que mejora su precisión en la transcripción de versos coránicos frente al modelo Whisper-tiny genérico.

La exportación a ONNX se realizó con `optimum-cli export onnx` (opset 14), y se aplicó una cuantización dinámica int8 con ONNX Runtime. Además, se re-tied el embedding compartido: el exportador genera la matriz de embeddings dos veces (una para el embedding y otra transpuesta para la proyección de salida), y en este repositorio se elimina la copia redundante, ahorrando aproximadamente 80 MB en fp32. Esta modificación se verificó numéricamente para asegurar que la salida es bit-idéntica a la del gráfico original. El archivo `generation_config.json` se tomó de `openai/whisper-tiny` porque el modelo ajustado no lo incluye y el exportador por defecto no contiene los tokens multilingües.

## Capacidades

- Reconocimiento automático de voz (ASR) en árabe, especializado en la recitación del Corán.
- Procesamiento de audio en el dispositivo (on-device) mediante Transformers.js, sin necesidad de servidor.
- Soporte de generación de texto autoregresiva con ventana de contexto de 30 segundos de audio.
- Compatible con la API de Transformers.js para su integración en aplicaciones web y Node.js.
- Exportación ONNX cuantizada, lo que permite inferencia eficiente en CPU y GPU de baja gama.
- No soporta tool calling, agentes ni capacidades multimodales más allá del audio.

## Casos de uso

- Aplicación de recitación asistida: el modelo puede transcribir en tiempo real la recitación del usuario y compararla con el texto coránico para verificar la pronunciación y entonación, todo en el dispositivo.
- Herramienta de aprendizaje del Corán: en una web o app móvil, se captura la voz del estudiante y se convierte en texto para facilitar la revisión de versículos específicos, sin enviar audio a la nube.
- Asistente de lectura para personas con discapacidad visual: permite que el usuario recite un versículo y reciba la transcripción o la referencia de la sura y aleya, funcionando offline.
- Transcripción de conferencias o clases de árabe: aunque está enfocado en Corán, su base Whisper-tiny puede transcribir árabe general con calidad aceptable, siendo útil en entornos con privacidad estricta.
- Integración en navegador para portales educativos: mediante Transformers.js, se puede cargar el modelo directamente en el navegador del usuario, sin coste de servidor ni latencia de red.
- Investigación en ASR para dialectos coránicos: los investigadores pueden usar el modelo como base para evaluar la eficiencia de la cuantización ONNX en tareas de reconocimiento de voz en árabe clásico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de evaluación como WER, CER ni comparativas con otros modelos.

## Requisitos de hardware

- VRAM estimada: al ser un modelo cuantizado int8 de Whisper-tiny (≈39M parámetros), el uso de memoria es inferior a 1 GB en fp32, y con int8 se reduce aproximadamente a la mitad. Para inferencia con Transformers.js en navegador, se recomienda al menos 1 GB de memoria disponible.
- GPU recomendadas: cualquier GPU con soporte WebGL o WebGPU (p. ej., NVIDIA GTX 1050 o superior) puede acelerar la inferencia, pero también funciona en CPU sin problemas.
- Compatibilidad con consumer GPU: sí, es extremadamente ligero; incluso puede ejecutarse en dispositivos móviles modernos.
- Opciones de despliegue: Transformers.js (navegador y Node.js), ONNX Runtime, llama.cpp (con conversión adicional), o cualquier runtime que soporte ONNX.
- Latencia: no hay datos publicados, pero la inferencia en CPU es rápida (del orden de cientos de ms por segmento de 30 s).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| emadjumaah/mishkat-whisper-tiny-ar-quran-onnx | ≈39M | 30 s | ar | Apache 2.0 | ONNX int8 |
| openai/whisper-tiny | ≈39M | 30 s | 96 idiomas | MIT | PyTorch/ONNX |
| tarteel-ai/whisper-tiny-ar-quran | ≈39M | 30 s | ar | Apache 2.0 | PyTorch |
| raghibdarr/whisper-tiny-ar-quran-onnx | ≈39M | 30 s | ar | Apache 2.0 | ONNX |

No se dispone de datos de rendimiento comparativo (WER, etc.) en la información proporcionada.

## Limitaciones y advertencias

- Sesgos: el modelo se entrenó específicamente con recitación del Corán, por lo que su precisión puede degradarse con acentos dialectales o habla no relacionada con el texto coránico.
- Riesgo de alucinación: como todo modelo de ASR, puede generar transcripciones incorrectas en audio de baja calidad o con ruido de fondo.
- Limitaciones de contexto: la ventana de audio es de 30 segundos; si se procesan recitaciones más largas, se debe dividir el audio en segmentos, lo que puede introducir errores en los límites.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe incluir atribución a los autores originales (openai/whisper-tiny y tarteel-ai/whisper-tiny-ar-quran).
- Advertencia para producción: aunque la cuantización int8 reduce el tamaño, puede producir una ligera degradación de precisión en comparación con el modelo fp32; se recomienda validar el rendimiento en el caso de uso específico.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/emadjumaah/mishkat-whisper-tiny-ar-quran-onnx
- Modelo base (tarteel-ai/whisper-tiny-ar-quran): https://huggingface.co/tarteel-ai/whisper-tiny-ar-quran
- Modelo base original (openai/whisper-tiny): https://huggingface.co/openai/whisper-tiny
- Proyecto Mishkat (NoorBayan/Mishkat): https://github.com/NoorBayan/Mishkat
- Proyecto Quranic-Verse-Recognition (relacionado): https://github.com/Abdelrahman47-code/Quranic-Verse-Recognition
- Lista de modelos ONNX de ONNX Runtime: https://onnxruntime.ai/models
