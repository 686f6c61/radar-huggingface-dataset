# onashia/granite-speech-5.0-470m-turboctc-webgpu

## Resumen

Granite Speech 5.0 470M TurboCTC for WebGPU es una conversión a ONNX del modelo de reconocimiento automático del habla `ibm-granite/granite-speech-5.0-470m-turboctc` de IBM, publicada por el usuario onashia. El objetivo es ejecutar el modelo directamente en el navegador mediante ONNX Runtime Web sobre WebGPU, sin necesidad de infraestructura de servidor ni de backend Python. El modelo original tiene aproximadamente 470 millones de parámetros y está diseñado para transcripción multilingüe en siete idiomas.

La conversión cuantiza los pesos del encoder a 4 bits (bloques de 128) mientras mantiene la extracción de características en fp32, lo que reduce el artefacto a 298 MB. La salida es un tensor de logits CTC de forma `[1, steps, 16384]`, con un paso cada 80 ms, que se decodifica de forma voraz. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

Su relevancia radica en que demuestra que un modelo ASR de calidad casi equivalente al original (1,43 % de WER frente a 1,32 % en LibriSpeech test-clean) puede desplegarse íntegramente en el cliente, habilitando transcripción privada y de baja latencia en aplicaciones web sin coste de servidor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer con cabeza CTC (modelo base Granite Speech 5.0 470M TurboCTC) |
| Parametros totales | ~470 M (modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (procesa audio en bruto a 16 kHz, un paso CTC cada 80 ms) |
| Tipos de cuantizacion | Pesos del encoder en 4 bits (bloque 128); extracción de características en fp32; artefacto ONNX único |
| Idiomas soportados | Ingles, frances, aleman, espanol, portugues, italiano y japones |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model.q4.onnx`, 298 MB) + `vocab.json` |

## Arquitectura y entrenamiento

El modelo base es un sistema ASR con encoder transformer y cabeza de clasificación CTC (Connectionist Temporal Classification) sobre un vocabulario de 16 384 piezas. La variante TurboCTC se caracteriza por emitir un paso de decodificación cada 80 ms, lo que reduce la longitud de la secuencia de salida frente a esquemas CTC más densos y disminuye el coste computacional de la decodificación.

La conversión a ONNX integra la extracción de características de audio en el propio grafo (entrada de audio en bruto a 16 kHz, no normalizado) y cuantiza únicamente los pesos del encoder a 4 bits con bloques de 128. El vocabulario se distribuye como `vocab.json`; las piezas con prefijo `▁` representan espacios y las del tipo `<0xNN>` son bytes UTF-8 individuales. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la información proporcionada.

## Capacidades

- Reconocimiento automático del habla (transcripción) en siete idiomas: inglés, francés, alemán, español, portugués, italiano y japonés.
- Entrada de audio en bruto a 16 kHz (`[1, samples]`), con extracción de características integrada en el grafo ONNX.
- Salida de logits CTC con un paso cada 80 ms y vocabulario de 16 384 piezas.
- Decodificación voraz CTC (token superior por paso, fusión de repeticiones, eliminación del token blank de id 0).
- Ejecución en navegador mediante ONNX Runtime Web sobre WebGPU.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio más allá de la transcripción.

## Casos de uso

- Transcripción en el navegador con privacidad por diseño: el audio no sale del dispositivo del usuario, ya que todo el procesamiento ocurre en WebGPU; adecuado para aplicaciones de dictado o notas de voz en sectores regulados.
- Subtitulado en tiempo real de reuniones web: con pasos CTC cada 80 ms y 298 MB de descarga única, el modelo puede integrarse en una aplicación de videoconferencia para generar subtítulos sin backend.
- Búsqueda por voz en aplicaciones web estáticas: al no requerir servidor, permite añadir entrada por voz a sitios desplegados en CDN o GitHub Pages.
- Accesibilidad: dictado por voz en formularios y editores web para usuarios con movilidad reducida, sin depender de servicios externos.
- Transcripción multilingüe de contenido educativo: cobertura de siete idiomas (incluido japonés) para generar apuntes o transcripciones de vídeos y pódcast desde el propio navegador.
- Prototipado y demos sin infraestructura: investigadores pueden evaluar un ASR de ~470 M de parámetros en el cliente antes de comprometer recursos de GPU en servidor.
- Aplicaciones de campo con conectividad intermitente: una vez cacheado el modelo, la transcripción funciona sin conexión si el navegador soporta WebGPU.

## Benchmarks y rendimiento

Tasa de error de palabra (WER) con el normalizador inglés de Whisper, según la model card del autor:

| Version | LibriSpeech test-clean (2.620 clips) | FLEURS English (150 clips) |
|---|---|---|
| Modelo original (transformers, fp32) | 1,32 % | 4,47 % |
| Esta build ONNX 4 bits | 1,43 % | 4,84 % |

No se han publicado otros resultados de benchmarks (por ejemplo, en idiomas distintos del inglés) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el artefacto ONNX ocupa 298 MB en disco; en ejecución, el consumo de memoria de la GPU del navegador será algo superior por buffers intermedios, aunque no se dispone de cifras exactas.
- GPU recomendadas: cualquier GPU con soporte de WebGPU en el navegador (Chrome o Edge recientes); no se especifican modelos concretos como A100, H100 o RTX 4090 en la información disponible.
- Compatibilidad con GPU de consumo: por tamaño, es plausible en GPUs integradas y dedicadas de gama media con WebGPU, pero no se confirma en la información proporcionada.
- Opciones de despliegue: ONNX Runtime Web sobre WebGPU; el modelo original puede ejecutarse con transformers en fp32.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| onashia/granite-speech-5.0-470m-turboctc-webgpu | ~470 M | 7 | ONNX (4 bits) | Apache 2.0 | Orientado a navegador/WebGPU; WER 1,43 % en LibriSpeech test-clean |
| ibm-granite/granite-speech-5.0-470m-turboctc (original) | ~470 M | 7 | transformers (fp32) | Apache 2.0 | Referencia de precisión; WER 1,32 % en LibriSpeech test-clean |
| Whisper (variantes de OpenAI) | No disponible en la información | No disponible | No disponible | No disponible | Usado como normalizador de referencia en los benchmarks del autor |

No se dispone de datos suficientes para comparar con otras alternativas de la misma categoría.

## Limitaciones y advertencias

- Ligera pérdida de precisión respecto al modelo original por la cuantización a 4 bits (1,43 % frente a 1,32 % de WER en LibriSpeech test-clean; 4,84 % frente a 4,47 % en FLEURS English).
- Solo se han publicado métricas en inglés; el rendimiento en francés, alemán, español, portugués, italiano y japonés no está documentado.
- Dependencia de WebGPU: navegadores o dispositivos sin soporte no podrán ejecutar el modelo.
- La decodificación voraz CTC es simple y puede ser menos precisa que decodificaciones con modelo de lenguaje externo.
- Riesgo de alucinación y errores en audio con ruido, acentos marcados o solapamiento de hablantes no cuantificado en la información disponible.
- Posibles sesgos heredados del corpus de entrenamiento del modelo base, no documentados.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base de IBM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/onashia/granite-speech-5.0-470m-turboctc-webgpu
- Modelo base: https://huggingface.co/ibm-granite/granite-speech-5.0-470m-turboctc
- Scripts de conversión: `tools/convert-granite-turboctc` del repositorio Baa (no se proporciona URL directa en la información disponible)
