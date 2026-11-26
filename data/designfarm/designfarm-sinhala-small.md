# designfarm/designfarm-sinhala-small

## Resumen

Designfarm Sinhala Small es una conversión a ONNX en precisión fp16 del modelo SinhaSpeech/whisper-small-sinhala-run12-best, un ajuste fino de openai/whisper-small para reconocimiento automático del habla en cingalés (sinhala), desarrollado por el proyecto SinhaSpeech de la Universidad de Moratuwa. El autor de esta conversión, designfarm, no ha reentrenado los pesos: únicamente ha sustituido los tensores del grafo ONNX exportado de whisper-small (con marcas de tiempo a nivel de palabra) por los pesos del modelo ajustado, valor por valor.

El objetivo es permitir la inferencia directamente en el navegador mediante Transformers.js, sin servidor ni GPU dedicada, de modo que la app Designfarm pueda subtitular en el propio dispositivo del usuario audio que mezcla cingalés e inglés. El repositorio ocupa unos 0,5 GB y se distribuye con licencia Apache 2.0, la misma del modelo original.

La relevancia de esta ficha es doble: por un lado, documenta una vía práctica de desplegar ASR de una lengua de bajos recursos en el cliente; por otro, sirve de ejemplo de conversión ONNX fp16 de un modelo Whisper ajustado, con las limitaciones de precisión y de soporte de idiomas que ello conlleva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper small), exportado a ONNX |
| Parametros totales | no disponible (whisper-small tiene 244 M, dato no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper procesa ventanas de audio de 30 s; no confirmado en la informacion) |
| Tipos de cuantizacion | fp16 (ONNX); no se documentan otras variantes |
| Idiomas soportados | cingales (si) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (fp16) para Transformers.js |
| Modelo base | SinhaSpeech/whisper-small-sinhala-run12-best |
| Tamano del repositorio | 0,5 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper small: un transformer encoder-decoder con atención estándar, entrenado originalmente por OpenAI para transcripción y traducción de voz multitarea. El ajuste fino para cingalés lo realizó el proyecto SinhaSpeech (Universidad de Moratuwa) en el modelo whisper-small-sinhala-run12-best; la model card no detalla el volumen de datos, la composición del corpus ni si hubo etapas de RLHF o DPO.

La aportación de designfarm es puramente de ingeniería de despliegue: exporta el grafo de whisper-small con soporte de marcas de tiempo por palabra a ONNX y lo convierte a fp16, reemplazando los tensores por los del modelo ajustado sin reentrenar. El resultado es un artefacto ejecutable en navegador mediante Transformers.js. No se documentan innovaciones de decodificación especulativa ni atención lineal; el interés técnico está en la conversión y en el uso de marcas de tiempo a nivel de palabra para el subtitulado.

## Capacidades

- Reconocimiento automático del habla (transcripción) en cingalés.
- Generación de marcas de tiempo a nivel de palabra, útiles para subtitulado sincronizado.
- Ejecución en el navegador del cliente mediante Transformers.js y ONNX Runtime Web.
- Procesamiento de audio que mezcla cingalés e inglés, según el caso de uso declarado por el autor (la model card no especifica métricas para el inglés).
- No se documenta soporte de tool calling, function calling ni comportamiento agente.
- No se documenta modo de razonamiento (thinking), visión ni audio más allá del ASR.
- Capacidad multilingüe limitada al cingalés como idioma declarado; el resto de idiomas de Whisper no se garantiza tras el ajuste.

## Casos de uso

- Subtitulado en el navegador: la app puede transcribir audio en cingalés en el dispositivo del usuario y generar subtítulos con marcas de tiempo por palabra, sin enviar el audio a un servidor.
- Privacidad por diseño: al ejecutarse en local con Transformers.js, el audio no sale del cliente, lo que resulta adecuado para contenido sensible o para usuarios con conectividad limitada.
- Accesibilidad de contenido audiovisual en cingalés: generación de subtítulos para vídeos, pódcast o retransmisiones dirigidas a hablantes de cingalés.
- Prototipado rápido de ASR sin infraestructura: un equipo puede integrar el modelo en una demo web estática sin desplegar GPU ni servicios de inferencia.
- Aplicaciones educativas y de investigación: transcripción de material en cingalés para corpus, análisis o herramientas de estudio, con la ventaja de no requerir backend.
- Procesamiento de audio mixto cingalés-inglés: el caso declarado por el autor para la app Designfarm, útil en contextos bilingües donde se alternan ambos idiomas.
- Integración en extensiones o PWA: al ser ONNX y ejecutarse en el navegador, puede empaquetarse en aplicaciones web progresivas o extensiones que necesiten transcripción local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. Al ejecutarse en navegador, el consumo depende de la implementación de ONNX Runtime Web (WebGPU o WASM) y del navegador; el repositorio pesa 0,5 GB en fp16.
- GPU recomendadas: no aplica en el sentido de servidor; en cliente se beneficia de WebGPU en GPU integradas o dedicadas modernas. Para despliegue servidor con el modelo base, una GPU consumer de gama media sería suficiente por el tamaño de whisper-small, aunque este dato no se confirma en la información proporcionada.
- ¿Cabe en GPU consumer? El modelo base whisper-small es ligero; la conversión fp16 reduce aún más el peso, por lo que es apto para equipos de consumo, si bien no se documentan requisitos oficiales.
- Opciones de despliegue: Transformers.js en navegador (principal), y potencialmente ONNX Runtime en servidor; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| designfarm/designfarm-sinhala-small | no disponible (base whisper-small) | no disponible | si | Apache 2.0 | ONNX fp16 |
| SinhaSpeech/whisper-small-sinhala-run12-best | no disponible (base whisper-small) | no disponible | si | Apache 2.0 | pesos originales (no confirmado) |
| openai/whisper-small | 244 M (dato externo, no confirmado en la informacion) | ventanas de 30 s (dato externo) | multilingüe | MIT (dato externo) | safetensors/PyTorch |

La comparación con alternativas de la misma categoría (otros ASR para cingalés) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo declara soporte de cingalés; el rendimiento en otros idiomas, incluido el inglés pese al caso de uso bilingüe, no está documentado.
- La conversión a fp16 puede introducir pequeñas pérdidas de precisión respecto a los pesos originales; no se han publicado evaluaciones que lo cuantifiquen.
- No se han publicado benchmarks ni métricas de error (WER/CER) en la información disponible, por lo que no es posible validar su calidad frente al modelo base.
- Riesgo de alucinación típico de los modelos Whisper en segmentos de silencio, ruido o audio fuera de dominio; no se documenta mitigación específica.
- Sesgos: no documentados; al ser un ajuste sobre Whisper, puede heredar sesgos del corpus original y del corpus cingalés de ajuste, no descrito.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías; conviene conservar el aviso de licencia y la atribución a SinhaSpeech.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación por la comunidad.
- El despliegue en navegador depende del soporte de WebGPU/WASM del cliente y puede variar en latencia y consumo según el dispositivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/designfarm/designfarm-sinhala-small
- Modelo base: https://huggingface.co/SinhaSpeech/whisper-small-sinhala-run12-best
- Whisper small original: https://huggingface.co/openai/whisper-small
- Documentación de Transformers.js: https://huggingface.co/docs/transformers.js
- App del autor: https://designfarm.app
