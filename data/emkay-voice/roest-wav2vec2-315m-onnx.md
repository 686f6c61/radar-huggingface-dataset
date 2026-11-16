# Emkay-Voice/roest-wav2vec2-315m-onnx

## Resumen

`roest-wav2vec2-315m-onnx` es una exportación a formato ONNX del modelo de reconocimiento automático de voz `CoRal-project/roest-v3-wav2vec2-315m`, publicada por el proyecto Emkay-Voice. No se ha reentrenado nada: los pesos son los originales, convertidos con `optimum` y cuantizados a 8 bits para que el modelo pueda ejecutarse en el navegador mediante `transformers.js`. Forma parte del motor de voz de Emkay, la implementación en navegador de OpenVoiceOS.

El modelo base es un wav2vec2 de aproximadamente 315 millones de parámetros, especializado en danés (`da`) y entrenado sobre el corpus CoRal-v3. Su relevancia radica en que permite reconocimiento de voz en cliente, sin backend ni GPU, algo poco habitual en modelos ASR de este tamaño, y en que el pipeline de conversión y los tests están documentados públicamente en el repositorio `emkay-voice/stt-models`.

La ficha se refiere exclusivamente a la variante ONNX publicada en Hugging Face; cualquier detalle de entrenamiento o evaluación del modelo subyacente debe consultarse en la model card del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2 (modelo base `CoRal-project/roest-v3-wav2vec2-315m`) |
| Parametros totales | ~315 M (según el nombre del modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | float32 (exportación ONNX original) y 8 bits (`onnx/model_quantized.onnx`, usado por Emkay) |
| Idiomas soportados | danés (`da`) |
| Licencia | openrail (se aplica la licencia original del modelo base sin cambios) |
| Formato de pesos | ONNX (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La arquitectura es wav2vec2, un transformer de reconocimiento de voz que opera sobre representaciones convolucionales del audio en bruto. El modelo base `CoRal-project/roest-v3-wav2vec2-315m` fue entrenado por CoRal-project sobre el dataset `CoRal-project/coral-v3` para transcripción de danés. No se dispone de información sobre el número de tokens de audio, la composición exacta del dataset ni si hubo etapas de ajuste fino supervisado adicionales más allá de lo indicado en la model card del modelo base.

La variante ONNX no introduce cambios arquitectónicos ni de entrenamiento: es una conversión de formato realizada con `optimum` y una cuantización a 8 bits. El script de conversión y los tests asociados están en el repositorio `emkay-voice/stt-models`. El objetivo técnico es doble: reducir el peso del modelo para su descarga en navegador y habilitar inferencia en `transformers.js` sin dependencias nativas.

## Capacidades

- Reconocimiento automático de voz (ASR) en danés sobre audio de 16 kHz.
- Ejecución en navegador mediante `transformers.js` con `dtype: "q8"`.
- Inferencia en cliente sin backend, gracias al formato ONNX y a la cuantización de 8 bits.
- Integración con el ecosistema OpenVoiceOS a través de Emkay.
- No se documentan capacidades de tool calling, agentes, visión, audio generation ni modo de razonamiento extendido.
- Capacidad multilingüe: limitada al danés según los metadatos del modelo.

## Casos de uso

- Dictado por voz en aplicaciones web: el modelo puede transcribir audio del micrófono directamente en el navegador con `transformers.js`, sin enviar el audio a un servidor, lo que reduce latencia y mejora la privacidad.
- Asistentes de voz en cliente: Emkay lo usa como capa de reconocimiento de voz de OpenVoiceOS en el navegador, permitiendo interacción por voz sin infraestructura de backend.
- Subtitulado de contenido en danés: transcripción de grabaciones o vídeos en danés en herramientas web ligeras, aprovechando que el modelo corre en el cliente.
- Accesibilidad web: campos de entrada por voz para usuarios con dificultades de teclado en sitios en danés, con procesamiento local del audio.
- Prototipado rápido de pipelines ASR: el par ONNX + `transformers.js` permite validar una demo de transcripción en danés en pocas líneas de JavaScript, como muestra el ejemplo de la model card.
- Aplicaciones de notas de reuniones en danés: transcripción local de audio de reuniones en herramientas de escritorio o web basadas en el runtime de `transformers.js`.
- Evaluación comparativa de ASR en danés: el repositorio `emkay-voice/stt-models` documenta tests y criterios de selección, útil como referencia para elegir modelos ASR daneses.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a los tests del repositorio `emkay-voice/stt-models` (documento `docs/danish.md`), pero no se incluyen cifras en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con ~315 M de parámetros, la variante de 8 bits ocupa del orden de cientos de MB y la de float32 alrededor de 1,2-1,3 GB, en línea con el tamaño del repositorio (1,6 GB, que incluye ambas variantes).
- GPU recomendadas: no disponible. El modelo está pensado para ejecutarse en CPU dentro del navegador vía `transformers.js`.
- Cabe en GPU consumer: sí, por tamaño; cualquier GPU con al menos ~2 GB de memoria libre debería poder alojar la variante float32, y menos para la cuantizada. No se han publicado mediciones específicas.
- Opciones de despliegue: `transformers.js` (navegador o Node.js) con `dtype: "q8"`; también es posible usar el ONNX con runtimes compatibles (ONNX Runtime), aunque no se documenta en la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| `Emkay-Voice/roest-wav2vec2-315m-onnx` | ~315 M | no disponible | da | openrail | ONNX | Exportación para navegador, cuantización 8 bits |
| `CoRal-project/roest-v3-wav2vec2-315m` | ~315 M | no disponible | da | openrail (según modelo base) | safetensors | Modelo original del que deriva esta exportación |
| `Alvenir/coral-1-whisper-large` | no disponible | no disponible | da (según licencia copiada) | openrail | no disponible | Referencia citada solo por el fichero LICENSE copiado; no se dispone de más datos |

No se dispone de información suficiente para comparar rendimiento (WER, latencia) con alternativas; no disponible.

## Limitaciones y advertencias

- Solo soporta danés (`da`); no es adecuado para otros idiomas.
- Al ser una conversión de formato, hereda todos los sesgos y limitaciones del modelo base `CoRal-project/roest-v3-wav2vec2-315m`, no evaluados en la información disponible.
- Riesgo de alucinación y errores de transcripción inherente a los modelos ASR; no se han publicado tasas de error en la información proporcionada.
- La licencia openrail se aplica sin cambios desde el modelo original, incluidas posibles restricciones de uso; debe revisarse el fichero LICENSE (copiado de `Alvenir/coral-1-whisper-large`) antes de un uso comercial.
- El modelo está orientado a inferencia en navegador; el rendimiento en producción con grandes volúmenes de audio no está documentado.
- La cuantización a 8 bits puede degradar ligeramente la precisión frente a la variante float32; no se han publicado comparativas.
- No se documentan requisitos de audio más allá de los 16 kHz usados en el ejemplo de la model card.

## Enlaces

- Hugging Face: https://huggingface.co/Emkay-Voice/roest-wav2vec2-315m-onnx
- Modelo base: https://huggingface.co/CoRal-project/roest-v3-wav2vec2-315m
- Repositorio de conversión y tests: https://github.com/emkay-voice/stt-models
- Documento de evaluación en danés: https://github.com/emkay-voice/stt-models/blob/main/docs/danish.md
- Proyecto Emkay: https://github.com/emkay-voice/emkay
- `transformers.js`: https://github.com/huggingface/transformers.js
- `optimum`: https://github.com/huggingface/optimum
- Dataset CoRal-v3: https://huggingface.co/datasets/CoRal-project/coral-v3
