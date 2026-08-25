# aoiandroid/parakeet-ctc-110m-coreml-ios

## Resumen

El modelo `aoiandroid/parakeet-ctc-110m-coreml-ios` es un paquete Core ML compilado específicamente para iOS, derivado del modelo `FluidInference/parakeet-ctc-110m-coreml`. Está pensado para su uso en la aplicación TranslateBlue, que requiere reconocimiento de voz en el dispositivo. La model card es extremadamente escueta y no aporta detalles técnicos propios; se limita a indicar que es una compilación `.mlmodelc` con especialización ANE (Apple Neural Engine) local al dispositivo. El modelo original subyacente es el `parakeet-tdt-ctc-110m` de NVIDIA NeMo, un sistema de reconocimiento automático del habla (ASR) de aproximadamente 114 millones de parámetros, basado en arquitectura FastConformer con decodificación CTC. Este paquete Core ML está pensado para su uso en dispositivos móviles de Apple, ofreciendo inferencia local sin conexión a servidores.

La relevancia de este modelo radica en su adaptación para iOS, lo que permite integrar transcripción de voz en aplicaciones de traducción como TranslateBlue con baja latencia y sin dependencia de la red. La licencia MIT facilita su uso comercial y su integración en proyectos propietarios. Sin embargo, al ser una compilación específica para un ecosistema cerrado, su uso se limita a dispositivos Apple y requiere de herramientas de conversión adicionales si se quiere utilizar en otras plataformas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer TDT-CTC (del modelo original, no especificado en la ficha) |
| Parametros totales | 114M (aprox., del modelo original, no especificado en la ficha) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo ASR, no secuencial de texto) |
| Tipos de cuantizacion | no disponible (compilado Core ML, no se indica cuantizacion) |
| Idiomas soportados | no disponible (el modelo original soporta ingles, pero la ficha no lo indica) |
| Licencia | MIT |
| Formato de pesos | Core ML `.mlmodelc` (compilado desde `.mlpackage`) |

Nota: los valores de arquitectura y parametros se han tomado del modelo original `parakeet-tdt-ctc-110m` de NVIDIA, ya que la ficha del modelo no proporciona ninguna especificacion tecnica propia.

## Arquitectura y entrenamiento

La ficha no describe la arquitectura ni el entrenamiento de este paquete Core ML. Sin embargo, el modelo original de NVIDIA `parakeet-tdt-ctc-110m` emplea una arquitectura FastConformer (un conformer con atencion optimizada) con un decodificador CTC (Connectionist Temporal Classification) y una variante TDT (Time-Depth Transducer). Este modelo fue entrenado por NVIDIA NeMo y Suno.ai para el reconocimiento de voz en inglés, produciendo transcripciones con puntuacion y capitalizacion. El paquete Core ML es una compilacion del modelo original, que ha sido convertido y optimizado para ejecutarse en el hardware de Apple, incluyendo el Neural Engine (ANE). No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens ni el proceso de alineacion (RLHF/DPO) en la informacion proporcionada.

## Capacidades

- Reconocimiento de voz en ingles: transcribe audio en texto con puntuacion y capitalizacion, segun el modelo original.
- Inferencia local en dispositivo: al ser Core ML, funciona sin conexion a internet, ideal para aplicaciones moviles con privacidad.
- Integracion con iOS: el paquete esta compilado para el entorno de Apple, listo para ser cargado en aplicaciones mediante Core ML.
- Especializacion ANE: la compilacion permite aprovechar el Neural Engine de los dispositivos Apple para acelerar la inferencia.
- No incluye capacidades de vision, texto multimodal, tool calling ni agentes. Es exclusivamente un modelo de reconocimiento de voz.

## Casos de uso

- Transcripcion de voz a texto en aplicaciones iOS: se puede integrar en apps de notas, dictado o grabacion para convertir audio en texto en tiempo real, aprovechando la inferencia local y la baja latencia.
- Traduccion de voz en tiempo real: dentro de TranslateBlue, el modelo transcribe el audio en ingles y luego se puede traducir a otros idiomas mediante otro componente, ofreciendo un flujo completo en el dispositivo.
- Asistentes de voz embebidos: en apps de asistente personal, el modelo permite capturar comandos de voz sin enviar audio a la nube, mejorando la privacidad y reduciendo la latencia.
- Accesibilidad: para personas con discapacidad auditiva, la transcripcion local de conversaciones o eventos en ingles puede mostrarse en pantalla en tiempo real.
- Analisis de contenido en audio: en aplicaciones de periodismo o investigacion, el modelo puede transcribir entrevistas o grabaciones para su posterior procesamiento.
- Pruebas de calidad de voz: en desarrollo de apps, se puede usar para verificar que el audio se transcribe correctamente, integrado en pipelines de CI/CD para iOS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan datos de rendimiento en terminos de WER, latencia o throughput para este paquete Core ML. El modelo original de NVIDIA reporta un WER de 3.1% en el conjunto de test de LibriSpeech, pero no se puede confirmar si esta compilacion mantiene exactamente esos resultados.

## Requisitos de hardware

- Al ser un paquete Core ML, esta disenado para dispositivos Apple con iOS 13 o superior (estimacion, no confirmado).
- Requiere un dispositivo con Neural Engine (ANE) para la aceleracion optima; los modelos mas antiguos sin ANE pueden ejecutarse en CPU, pero con mayor latencia.
- No aplica VRAM como en GPU de escritorio; la memoria se gestiona automaticamente por el sistema.
- El tamano del repositorio es de 0.1 GB, lo que indica que el modelo compilado ocupa unos 100 MB, apropiado para descarga en apps moviles.
- Para su integracion, se usa Core ML framework de Apple, junto con Xcode para la compilacion y el empaquetado.
- No se recomienda su uso en servidores o entornos Linux; esta pensado exclusivamente para el ecosistema iOS.

## Comparativa con modelos similares

No se dispone de comparaciones directas con otros modelos en la informacion proporcionada. Como referencia, el modelo original `parakeet-tdt-ctc-110m` se compara con otros modelos ASR como Whisper de OpenAI (por ejemplo, whisper-tiny o whisper-small) y modelos de NVIDIA como `parakeet-tdt-ctc-110m` en su version no compilada. La siguiente tabla compara el modelo original con dos alternativas comunes:

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| parakeet-tdt-ctc-110m (original) | FastConformer TDT-CTC | 114M | no disponible | CC-BY-4.0 | NGC, Hugging Face |
| Whisper-tiny | Transformer encoder-decoder | 39M | 30 segundos de audio | MIT | Hugging Face |
| Wav2Vec2-base | Transformer encoder | 95M | 10 segundos de audio | Apache 2.0 | Hugging Face |

Esta comparativa se basa en el modelo original, no en la compilacion Core ML. La compilacion no cambia las capacidades funcionales, solo el formato de ejecucion.

## Limitaciones y advertencias

- La ficha no proporciona informacion sobre sesgos, alucinaciones o limitaciones de idioma. El modelo original esta entrenado solo en ingles, por lo que no es adecuado para otros idiomas sin reentrenamiento.
- El modelo esta compilado para iOS y no puede ejecutarse en otras plataformas sin una conversion adicional de Core ML a otros formatos, lo que puede requerir herramientas externas.
- No se dispone de detalles sobre la cuantizacion del modelo compilado; el rendimiento puede variar segun el dispositivo y la version de iOS.
- La licencia MIT permite uso comercial, pero no se especifican restricciones adicionales sobre el modelo original, que tiene una licencia CC-BY-4.0; el paquete Core ML podria estar bajo MIT, pero el modelo subyacente tiene su propia licencia.
- La falta de informacion sobre el entrenamiento y los datos de evaluacion limita la confianza en su rendimiento en entornos de produccion.

## Enlaces

- [HuggingFace del modelo](https://huggingface.co/aoiandroid/parakeet-ctc-110m-coreml-ios)
- [Modelo fuente de FluidInference](https://huggingface.co/FluidInference/parakeet-ctc-110m-coreml)
- [Modelo original en NVIDIA NGC](https://catalog.ngc.nvidia.com/orgs/nvidia/teams/nemo/models/parakeet-tdt_ctc-110m)
- [Sibling para macOS](https://huggingface.co/aoiandroid/parakeet-ctc-110m-coreml-macos)
