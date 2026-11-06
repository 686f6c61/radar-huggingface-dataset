# aaatmy/whisper-large-v3-onnx

## Resumen

Whisper large-v3 ONNX es un espejo comunitario del modelo de reconocimiento automático de voz (ASR) Whisper large-v3 de OpenAI, exportado al formato ONNX para su despliegue en entornos de inferencia que no dependen de PyTorch. Lo mantiene Hikari Tsai (usuario `aaatmy`) como parte de la aplicación Karaoke Battle, y no es un repositorio oficial ni de OpenAI ni de onnx-community. Cada fichero es una copia byte a byte del export ONNX publicado en `onnx-community/whisper-large-v3-ONNX`, sin reentrenamiento, reexportación ni recuantización adicional.

El modelo resuelve el problema de transcripción de audio a texto en múltiples idiomas con un único modelo entrenado con supervisión débil a gran escala (Radford et al., arXiv:2212.04356). Su relevancia práctica radica en que ofrece los pesos de Whisper large-v3 en un formato portable y con dos variantes de precisión: float32 (6,17 GB) e int8 (1,82 GB), lo que permite desplegarlo en CPU o en GPUs modestas mediante runtimes ONNX como ONNX Runtime u Optimum.

El repositorio ocupa 8,0 GB e incluye, además de los grafos ONNX, los ficheros de tokenización y preprocesado sin modificar. La entrada esperada es audio mono a 16 kHz con 128 bins mel y ventanas de 30 segundos, que es exactamente la configuración de preprocesado de Whisper.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3), exportado a ONNX |
| Parametros totales | no disponible (el modelo base Whisper large-v3 ronda los 1550 M, dato no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventanas de audio de 30 s (128 bins mel, 16 kHz mono) |
| Tipos de cuantizacion | float32 e int8 (dos variantes incluidas) |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_model.onnx`, `decoder_model_merged.onnx` y variantes `_quantized`) |

## Arquitectura y entrenamiento

Whisper large-v3 es un transformer encoder-decoder diseñado para ASR multitarea. El encoder procesa espectrogramas mel de 128 bins calculados sobre ventanas de 30 segundos de audio mono a 16 kHz, y el decoder genera tokens de texto de forma autorregresiva, con tokens especiales para detección de idioma, transcripción y traducción. El modelo original se entrenó con supervisión débil a gran escala sobre pares audio-texto, según el paper de Radford et al. (arXiv:2212.04356).

Este repositorio concreto no aporta entrenamiento ni ajuste alguno: es una copia del export ONNX de `onnx-community/whisper-large-v3-ONNX` en la revisión `3b6257ad5e67aa523c7c07f4fea04d445eecc4a6`. La innovación técnica relevante es la propia exportación a ONNX, que separa encoder y decoder (con `decoder_model_merged` para gestionar los pasos con y sin caché) y ofrece una variante int8 cuantizada estáticamente que reduce el tamaño de 6,17 GB a 1,82 GB. El repositorio incluye `manifest.json` y `SHA256SUMS` con los hashes de todos los ficheros para verificar la integridad de la copia.

## Capacidades

- Reconocimiento automático de voz (transcripción de audio a texto) sobre ventanas de 30 segundos.
- Procesamiento por lotes y por segmentos mediante el pipeline `automatic-speech-recognition`.
- Soporte de los tokens especiales de Whisper para detección de idioma y tarea (transcribir o traducir al inglés), heredados del modelo base.
- Ejecución en CPU y GPU a través de runtimes ONNX, sin dependencia de PyTorch.
- Dos niveles de precisión (float32 e int8) para intercambiar calidad por velocidad y memoria.
- No dispone de tool calling, function calling, capacidades de agente, visión ni audio de entrada más allá del propio ASR.
- El conjunto exacto de idiomas soportados no está detallado en la información proporcionada; debe consultarse la model card de `openai/whisper-large-v3`.

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo convierte grabaciones de audio en texto con un pipeline ASR estándar, procesando el audio en ventanas de 30 segundos y concatenando los segmentos resultantes.
- Subtitulado automático de vídeo: integrado en un pipeline de postproducción, genera transcripciones con marcas temporales que se pueden alinear con el vídeo para producir subtítulos.
- Aplicaciones de karaoke y análisis de canciones: es el caso de uso declarado por el autor (Karaoke Battle), donde la transcripción alimenta la comparación de letras cantadas.
- Despliegue en entornos sin PyTorch: al estar en ONNX, se puede ejecutar con ONNX Runtime en servidores, contenedores ligeros o dispositivos donde instalar PyTorch no es viable.
- Inferencia en CPU con la variante int8: el fichero cuantizado de 1,82 GB permite transcripción en máquinas sin GPU, a costa de cierta pérdida de precisión frente a float32.
- Servicios de transcripción por lotes: la separación encoder/decoder y el decoder fusionado facilitan el procesamiento por lotes de grandes volúmenes de audio en infraestructura propia.
- Verificación de integridad en producción: los hashes SHA-256 incluidos permiten validar que los pesos desplegados son exactamente los esperados antes de poner el servicio en marcha.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del espejo no incluye métricas de WER, latencia ni throughput, ni comparaciones con otras variantes. Cualquier cifra de rendimiento debe obtenerse midiendo el modelo en el hardware y runtime concretos de despliegue.

## Requisitos de hardware

- VRAM estimada: la variante float32 ocupa 6,17 GB en disco, por lo que en GPU requiere al menos ese orden de memoria más el overhead del runtime; la variante int8 ocupa 1,82 GB y reduce sustancialmente el requisito.
- GPU recomendadas: no especificadas en la información proporcionada. Por tamaño, la variante float32 encaja en GPUs con 8 GB o más de VRAM; la int8 puede ejecutarse en GPUs de gama media y en CPU.
- GPU de consumo: la variante int8 es la opción realista para GPUs de consumo; la float32 depende de la VRAM disponible y del runtime.
- Opciones de despliegue: ONNX Runtime, Optimum (pipelines de Hugging Face sobre ONNX) y cualquier runtime compatible con ONNX. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo ASR de este tipo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| aaatmy/whisper-large-v3-onnx | no disponible | ventanas de 30 s | ONNX (float32 e int8) | Apache 2.0 | Hugging Face, espejo comunitario |
| onnx-community/whisper-large-v3-ONNX | no disponible | ventanas de 30 s | ONNX | Apache 2.0 | Hugging Face, origen de este espejo |
| openai/whisper-large-v3 | no disponible | ventanas de 30 s | PyTorch (safetensors/bin) | Apache 2.0 | Hugging Face, repositorio oficial |

La comparativa se limita a las variantes del mismo modelo porque la información proporcionada no incluye datos de otros sistemas ASR. La diferencia práctica entre las tres entradas es el formato y el mantenimiento: este repositorio es una copia verificable del export de onnx-community, mientras que el original de OpenAI está en formato PyTorch.

## Limitaciones y advertencias

- Es un espejo no oficial: no lo mantiene OpenAI ni onnx-community, y no recibe actualizaciones propias más allá de las copias que haga el autor.
- No se ha reentrenado ni ajustado nada; hereda todos los sesgos y errores del Whisper large-v3 original.
- Riesgo de alucinación en audio con ruido, silencios largos o habla solapada, comportamiento conocido de la familia Whisper.
- El rendimiento por idioma no está documentado en este repositorio; debe consultarse la documentación del modelo base.
- Procesa audio en ventanas de 30 segundos, lo que requiere segmentación y concatenación para grabaciones largas.
- La variante int8 puede degradar la precisión de transcripción frente a float32; conviene validarla con datos propios antes de usarla en producción.
- La licencia Apache 2.0 permite uso comercial, pero al ser una copia de pesos ajenos conviene conservar los avisos de atribución de OpenAI y del export original.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de uso en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/aaatmy/whisper-large-v3-onnx
- Modelo base: https://huggingface.co/openai/whisper-large-v3
- Export ONNX de origen: https://huggingface.co/onnx-community/whisper-large-v3-ONNX
- Paper: https://arxiv.org/abs/2212.04356
- Aplicación del autor: https://github.com/Hikari-Tsai/karaoke-battle
- Código y pesos originales (MIT): https://github.com/openai/whisper
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
