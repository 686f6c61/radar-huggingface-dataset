# fdiskas/azuolas-whisper-lt-onnx

## Resumen

azuolas-whisper-lt-onnx es una exportación a formato ONNX del modelo de reconocimiento automático del habla akisviete/azuolas-whisper-lt, publicada por el usuario fdiskas. El modelo original es un ajuste fino de la familia Whisper especializado en lituano, y esta versión está pensada para ejecutarse directamente en el navegador mediante transformers.js, con soporte para WebGPU y cuantización de 4 bits. El repositorio ocupa 2,5 GB e incluye variantes fp16 y q4 del encoder y el decoder.

La relevancia de esta ficha radica en que permite desplegar transcripción de voz en lituano sin backend, aprovechando la aceleración por GPU del navegador a través de WebGPU. Al tratarse de una conversión de pesos y no de un modelo nuevo, sus capacidades lingüísticas y de transcripción heredan las del modelo base; la aportación técnica está en el empaquetado ONNX, la gestión de caché KV en el decoder y las opciones de cuantización para reducir el coste de memoria en cliente.

No se dispone de información sobre el número de parámetros, la longitud de contexto de audio ni los datos de entrenamiento en la documentación proporcionada; estos datos deberían consultarse en la model card del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Whisper (transformer encoder-decoder para ASR), exportado a ONNX |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | fp16 (encoder, para WebGPU con shader-f16) y q4 (MatMulNBits, bloque 32, simétrico; encoder y decoder) |
| Idiomas soportados | lituano (lt) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (encoder_model_fp16.onnx, encoder_model_q4.onnx, decoder_model_merged_q4.onnx) |

## Arquitectura y entrenamiento

El modelo subyacente es un Whisper, es decir, un transformer encoder-decoder orientado a reconocimiento automático del habla que procesa audio muestreado a 16 kHz y genera texto de forma autorregresiva. Esta publicación no entrena el modelo: realiza la exportación a ONNX del checkpoint akisviete/azuolas-whisper-lt y ofrece tres artefactos: un encoder en fp16 para WebGPU con soporte de shader-f16, un encoder cuantizado a 4 bits y un decoder fusionado también a 4 bits que incorpora la caché KV, lo que evita recalcular estados pasados en cada paso de decodificación.

La cuantización del decoder emplea MatMulNBits con tamaño de bloque 32 y esquema simétrico, una configuración habitual en ONNX Runtime para pesos de 4 bits. No se detallan en la información disponible el volumen de datos de entrenamiento, la composición del corpus lituano, ni si el modelo base aplicó RLHF, DPO u otras técnicas de alineación. Tampoco se documentan innovaciones adicionales más allá de la propia exportación y la integración con transformers.js.

## Capacidades

- Reconocimiento automático del habla en lituano con salida de texto plano (tarea `transcribe`).
- Ejecución en navegador mediante transformers.js, con backend WebGPU y fallback a otros backends de ONNX Runtime Web.
- Soporte de cuantización selectiva: encoder en fp16 y decoder en q4 en una misma configuración de pipeline.
- Decoder fusionado con caché KV para decodificación autorregresiva eficiente.
- Selección explícita de idioma y tarea en la llamada al pipeline (`language: 'lithuanian'`, `task: 'transcribe'`).
- No se documentan capacidades de traducción, diarización de hablantes, timestamps, tool calling ni modos de razonamiento.

## Casos de uso

- Transcripción de audio en aplicaciones web sin backend: el modelo se carga con transformers.js en el cliente y procesa el audio del micrófono o de un fichero subido, evitando enviar datos de voz a un servidor.
- Subtitulado de vídeo en lituano en herramientas de edición basadas en navegador: se puede invocar el pipeline ASR sobre segmentos de audio y componer los subtítulos en la propia página.
- Asistentes de voz para personas con dificultades de accesibilidad en lituano: la inferencia local en WebGPU reduce la latencia percibida y mantiene la privacidad del audio.
- Dictado en aplicaciones de notas o formularios web: integración directa con la API de micrófono del navegador y el pipeline de transformers.js para convertir voz en texto en tiempo real.
- Prototipado rápido de productos de voz para el mercado lituano: al no requerir infraestructura de servidor, permite validar flujos de transcripción con coste de despliegue mínimo.
- Procesamiento por lotes de grabaciones en entornos de escritorio con ONNX Runtime: los artefactos ONNX pueden ejecutarse fuera del navegador con los mismos pesos cuantizados para reducir requisitos de memoria.
- Filtrado y moderación de contenido en audio lituano: transcripción previa para aplicar reglas de texto sobre conversaciones grabadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio completo ocupa 2,5 GB, pero la configuración recomendada por el autor (encoder fp16 + decoder q4) reduce la huella en memoria respecto a los pesos completos.
- Encoder fp16: requiere soporte de WebGPU con `shader-f16` en el navegador; sin esa extensión debe usarse la variante q4 del encoder.
- VRAM estimada para inferencia: no disponible de forma explícita; la cuantización q4 del decoder y del encoder está pensada para mantener el modelo dentro de los límites de memoria de GPUs integradas y de consumo en navegador.
- GPU de consumo: no se especifican modelos concretos (RTX 4090, etc.) en la documentación; la viabilidad depende del soporte de WebGPU y shader-f16 del navegador y del sistema.
- Opciones de despliegue: transformers.js en navegador con WebGPU; los ficheros ONNX también pueden ejecutarse con ONNX Runtime en otros entornos, aunque el autor solo documenta el flujo de transformers.js.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Idioma | Formato | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fdiskas/azuolas-whisper-lt-onnx | lituano | ONNX | fp16 y q4 | CC-BY-4.0 | Hugging Face, transformers.js |
| akisviete/azuolas-whisper-lt | lituano | no disponible | no disponible | no disponible | Hugging Face, FriendliAI |
| Whisper base de OpenAI | multilingüe | PyTorch, ONNX, GGUF | múltiples | MIT | Hugging Face, múltiples runtimes |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en lituano; no se garantiza un comportamiento correcto en otros idiomas aunque el pipeline acepte el parámetro `language`.
- Al ser una exportación de otro modelo, cualquier sesgo o error del modelo base se hereda sin cambios.
- Riesgo de alucinación inherente a los modelos Whisper, especialmente en audio con ruido, silencios largos o habla solapada.
- La licencia CC-BY-4.0 exige atribución al autor original; es compatible con uso comercial siempre que se respete la atribución.
- La ejecución en navegador depende de la disponibilidad de WebGPU y de la extensión `shader-f16`; sin ellas hay que recurrir a la variante q4 y el rendimiento puede degradarse.
- No se documentan límites de duración de audio, ni soporte de timestamps o diarización, por lo que su uso en producción requiere validación adicional.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica poca validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fdiskas/azuolas-whisper-lt-onnx
- Modelo base: https://huggingface.co/akisviete/azuolas-whisper-lt
- transformers.js: https://github.com/huggingface/transformers.js
- Endpoint de inferencia en FriendliAI: https://friendli.ai/models/akisviete/azuolas-whisper-lt
