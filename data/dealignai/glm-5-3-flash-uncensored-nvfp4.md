# dealignai/GLM-5.3-Flash-UNCENSORED-NVFP4

## Resumen

GLM-5.3-Flash-UNCENSORED-NVFP4 es una versión modificada a nivel de pesos del modelo GLM-5.3-Flash de zai-org, publicada por dealignai bajo su marca "CRACK". El objetivo declarado es eliminar el comportamiento de rechazo (refusals) del modelo base, que según el autor provocaba una sobreabundancia de negativas ante peticiones benignas pero marcadas, especialmente en materia de derechos de autor. La modificación se aplica directamente sobre los tensores, sin fine-tuning, sin LoRA, sin adaptadores y sin edición de plantillas de chat.

El modelo conserva la arquitectura del base: un transformer híbrido MoE denominado `glm5_next`, que combina atención lineal KDA con atención dispersa estilo DeepSeek. Según la model card, el modelo base declara 320B parámetros totales con 18B activos por token y una ventana de contexto de 1M tokens. Los pesos publicados en este repositorio están cuantizados en NVFP4 (8-bit según los tags de Hugging Face), con los expertos enrutados en NVFP4 y la atención, los expertos compartidos y los embeddings en bf16. El recuento real de parámetros en los safetensors es de 165.496.249.182.

La relevancia de esta ficha es doble: por un lado, documenta una práctica de "abliteración" a nivel de pesos que se está extendiendo en el ecosistema open source; por otro, expone una serie de problemas operativos muy concretos en el despliegue con vLLM y SGLang (gestión de `reasoning_effort`, presupuesto de tokens, parámetros multimodales que se aceptan y se ignoran en silencio) que cualquier equipo debe conocer antes de poner el modelo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLM-5.3-Flash (`glm5_next`), transformer híbrido MoE con atención lineal KDA y atención dispersa estilo DeepSeek |
| Parametros totales | 165.496.249.182 según safetensors; la model card declara 320B totales |
| Parametros activos | 18B por token (según model card) |
| Longitud de contexto | 1M tokens (según model card) |
| Tipos de cuantizacion | NVFP4 (expertos enrutados); atención, expertos compartidos y embeddings en bf16; tags indican 8-bit y modelopt |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Torre de visión | GLM-4.1V, retenida e idéntica byte a byte al modelo base |
| Cabecera MTP | Multi-token-prediction, también modificada; aceptación del 81,7% según el autor |
| Tamaño del repositorio | 255,7 GB |
| Descargas | 4.451 |
| Likes | 57 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura `glm5_next` del base: un transformer con mezcla de expertos que combina capas de atención lineal KDA con atención dispersa tipo DeepSeek. La model card declara 320B parámetros totales y 18B activos por token, aunque el recuento efectivo de los safetensors publicados es de 165.496.249.182 parámetros, diferencia atribuible a la cuantización NVFP4 de los expertos enrutados. La ventana de contexto declarada es de 1M tokens. El modelo conserva la torre de visión GLM-4.1V sin modificaciones y la cabecera de predicción multi-token (MTP), que también ha sido objeto de la edición de pesos.

No se ha realizado ningún entrenamiento adicional: no hay SFT, ni DPO, ni RLHF posterior a la modificación. La edición es una ablación directa sobre los tensores orientada a suprimir la dirección de rechazo, con un enfoque declarado como conservador para preservar la calidad. Según el autor, el resultado es un 0% de rechazos en HarmBench-320 en los modos de razonamiento desactivado y de esfuerzo máximo, mientras que el modo de esfuerzo bajo conserva algunos rechazos de forma deliberada. La versión actual (actualizada el 2026-08-29) corrige un problema raro de bucles de repetición presente en la publicación anterior y alcanza un 85,28% en MMLU, a unas 0,9 puntos del modelo base.

## Capacidades

- Generación de texto y razonamiento multi-paso con modos de esfuerzo configurables (`low`, `high` y `max`).
- Razonamiento extendido en modo "thinking", con la traza devuelta en `message.reasoning`.
- Capacidades de visión: procesamiento de imágenes y vídeo mediante la torre GLM-4.1V, con control del número de tokens de imagen y de la tasa de frames de vídeo.
- Decodificación especulativa mediante cabecera MTP con una tasa de aceptación declarada del 81,7%.
- Soporte de tool calling y function calling a través de los parsers de razonamiento de vLLM y SGLang.
- Capacidades de agente y razonamiento multi-turno, condicionadas a una gestión correcta del presupuesto de tokens.
- Multilingüe limitado: el único idioma declarado es el inglés.
- Comportamiento sin rechazos en los modos de razonamiento desactivado y de esfuerzo máximo, según el autor.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar el comportamiento de un sistema con los mecanismos de rechazo ablacionados a nivel de pesos, comparándolo con el base para aislar el efecto de la edición sobre la distribución de respuestas.
- Generación de contenido creativo sin fricción: narrativa, guiones y material editorial donde el modelo base rechazaba peticiones benignas por similitud con material protegido; el modo de razonamiento desactivado ofrece la ruta más directa y con menor coste de tokens.
- Procesamiento de documentos largos: con 1M tokens de contexto declarados, es adecuado para análisis de contratos, expedientes o bases de código extensas en una sola pasada, siempre que se dimensionen los recursos de GPU en consecuencia.
- Análisis de imágenes y vídeo en pipelines de inspección: la torre de visión permite clasificar y describir contenido visual; conviene fijar explícitamente `fps: 2` y `max_image_tokens` para controlar el coste y evitar el fallo de placeholders descrito por el autor.
- Evaluación comparativa de cuantización NVFP4: sirve como banco de pruebas para medir la degradación de calidad de NVFP4 frente a bf16 en un MoE de gran tamaño, con la referencia del 85,28% en MMLU.
- Despliegue en infraestructura con vLLM o SGLang para experimentación con decodificación especulativa: la cabecera MTP retenida permite medir ganancias de throughput en cargas de generación larga.
- Generación de código asistida en entornos controlados: el soporte de tool calling permite integrarlo en flujos de edición y ejecución de código, aunque la ausencia de benchmarks de código publicados obliga a validar la calidad antes de usarlo en producción.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| MMLU | 85,28% | A ~0,9 puntos del modelo base, según el autor |
| HarmBench-320 | 0% de rechazos | En modos de razonamiento desactivado y esfuerzo máximo |
| Aceptación MTP | 81,7% | Tasa de aceptación de la cabecera de decodificación especulativa |

No se han publicado resultados de benchmarks de código, matemáticas o visión en la información disponible.

## Requisitos de hardware

- El repositorio ocupa 255,7 GB, por lo que la inferencia requiere al menos esa cantidad de memoria agregada, más overhead de activaciones y caché KV.
- No cabe en ninguna GPU de consumo actual: se necesita un nodo multi-GPU con GPUs de centro de datos (H100, H200, B200 o A100 de 80 GB en configuración múltiple).
- La cuantización NVFP4 está pensada para hardware con soporte nativo de FP4 (arquitecturas Blackwell); en generaciones anteriores el rendimiento será inferior o la ruta no estará soportada.
- Despliegue recomendado con vLLM o SGLang, que son los motores para los que el autor documenta el comportamiento de los parsers de razonamiento y de los parámetros multimodales.
- No se documentan opciones de despliegue con llama.cpp, Ollama o TGI para este repositorio.
- Latencia y throughput: no disponibles. La tasa de aceptación MTP del 81,7% sugiere ganancias apreciables en decodificación especulativa, pero no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| dealignai/GLM-5.3-Flash-UNCENSORED-NVFP4 | 165,5B en safetensors (320B declarados, 18B activos) | 1M | NVFP4 | MIT | Modificación de pesos, sin rechazos en modos off y max |
| zai-org/GLM-5.3-Flash | 320B declarados, 18B activos | 1M | bf16 original | no disponible en la información | Modelo base, con rechazos y mayor sobreabundancia de negativas |
| dealignai/GLM-5.3-Flash-ABLITERATED-NVFP4 | mismos que el modelo base | 1M | NVFP4 | MIT | Espejo alternativo del mismo autor |
| Otros MoE de gran tamaño con contexto largo | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

## Limitaciones y advertencias

- La modificación elimina los rechazos en los modos de razonamiento desactivado y de esfuerzo máximo, pero el modo de esfuerzo bajo conserva algunos por diseño. El comportamiento no es homogéneo entre modos.
- Riesgo elevado de generar contenido dañino, ilegal o sexualmente explícito sin filtro. No es adecuado para aplicaciones orientadas al público sin una capa de moderación externa.
- El autor documenta que, en modo `max`, un `max_tokens` pequeño devuelve una respuesta vacía con `finish_reason="length"`. En conversaciones multi-turno, el turno vacío contamina el historial y la conversación no se recupera. Medido: `max` con 2000 tokens falla a partir del turno 4; con 6000 tokens funciona correctamente.
- `reasoning_effort` solo acepta `"low"` y `"high"`; cualquier otro valor, incluido omitirlo, resuelve silenciosamente a `max`.
- No se debe pasar `enable_thinking`: la plantilla no define esa variable y su uso desactiva el parser mientras el modelo sigue razonando, volcando el razonamiento en bruto en `content`.
- La traza de razonamiento se devuelve en `message.reasoning`, no en `message.reasoning_content`.
- `clear_thinking` debe anidarse dentro de `chat_template_kwargs`; una clave de nivel superior se ignora.
- En vídeo, `media_io_kwargs.video.fps` debe ser estrictamente inferior a la tasa de frames del clip. Un valor igual o superior provoca un error de placeholders y tumba el motor (`EngineDeadError`), con el servidor caído hasta reiniciarlo.
- `max_frames` y `num_frames` no son intercambiables entre versiones de vLLM: en nightly se respeta `max_frames` y en la línea `0.1.dev*` ocurre lo contrario. Conviene fijar siempre `fps`.
- Los controles `max_pixels`, `min_pixels`, `size` y `detail` devuelven HTTP 200 sin efecto. Para imágenes deben usarse `mm_processor_kwargs.max_image_tokens` y `min_image_tokens`.
- Solo se declara inglés como idioma soportado; el rendimiento en castellano no está documentado.
- La licencia es MIT, lo que permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo modificado ni sobre las implicaciones legales del contenido que pueda generar.
- El modelo solo está publicado en NVFP4, lo que limita su despliegue a hardware compatible y dificulta la comparación directa con el base en bf16.
- Existe una discrepancia entre los 320B declarados en la model card y los 165,5B contabilizados en los safetensors; conviene verificar el recuento real antes de dimensionar infraestructura.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dealignai/GLM-5.3-Flash-UNCENSORED-NVFP4
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Espejo del autor: https://huggingface.co/dealignai/GLM-5.3-Flash-ABLITERATED-NVFP4
- Perfil del autor: https://huggingface.co/dealignai
- Twitter del autor: https://twitter.com/dealignai
- Incidencias de vLLM citadas por el autor: vLLM #55644 y #55647 (no se dispone de URL directa en la información proporcionada)
