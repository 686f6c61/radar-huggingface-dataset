# bielquants/GLM-5.3-Flash-UNCENSORED-FP8

## Resumen

GLM-5.3-Flash-UNCENSORED-FP8 es una version modificada a nivel de pesos del modelo zai-org/GLM-5.3-Flash, publicada por el usuario bielquants bajo la marca dealignai. Se distribuye en FP8 con el comportamiento de rechazo (refusals) eliminado directamente en los tensores, sin uso de fine-tuning, SFT, DPO, LoRA, adaptadores, vectores de direccion (steering) ni hooks en tiempo de ejecucion. El objetivo declarado es eliminar el exceso de rechazos en peticiones benignas pero marcadas por los filtros del modelo original, manteniendo la calidad del modelo base.

Arquitectura GLM-5.3-Flash (denominada glm5_next): un MoE hibrido que combina atencion lineal KDA con atencion dispersa tipo DeepSeek. Cuenta con 321.323.031.390 parametros totales medidos en safetensors (la model card declara 320B totales y 18B activos por token) y una ventana de contexto de 1M tokens. El repositorio ocupa 328,4 GB.

El lanzamiento incluye la torre de vision de GLM-4.1V funcional y una cabeza de borrador MTP (multi-token-prediction) tambien modificada, con una tasa de aceptacion declarada del 75,9%. Esta pensado para servir con vLLM o SGLang sobre GPU Hopper, donde el FP8 se ejecuta a velocidad nativa de tensor cores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLM-5.3-Flash (glm5_next): MoE hibrido con atencion lineal KDA + atencion dispersa tipo DeepSeek |
| Parametros totales | 321.323.031.390 (medidos en safetensors); la model card declara 320B |
| Parametros activos | 18B por token (segun la model card) |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | FP8 block-wise e4m3 (unico formato publicado); no se ofrecen GGUF, AWQ ni GPTQ |
| Idiomas soportados | en (ingles) |
| Licencia | MIT (declarada en el repositorio) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash emplea una arquitectura MoE hibrida que mezcla atencion lineal KDA (una variante de atencion lineal) con atencion dispersa de tipo DeepSeek, lo que permite sostener una ventana de contexto de 1M tokens con un coste de atencion subcuadratico. El checkpoint aqui descrito no anade entrenamiento: la model card indica explicitamente que no hay fine-tuning, SFT ni DPO. La intervencion consiste en una edicion permanente de los tensores orientada a suprimir la conducta de rechazo, descrita por el autor como conservadora para preservar la calidad del modelo. Los pesos se distribuyen en FP8 block-wise e4m3, formato que en GPU Hopper (H100/H200) se ejecuta a velocidad nativa.

El paquete incluye dos componentes adicionales: la torre de vision de GLM-4.1V, con su plantilla de chat multimodal, y una cabeza MTP de decodificacion especulativa que tambien ha sido modificada y que declara una tasa de aceptacion del 75,9%. Segun el autor, la version actual del 28 de agosto de 2026 corrige un problema raro de bucle de repeticion presente en pesos anteriores y eleva la capacidad del modelo (MMLU 87,33% frente al 86,74% del base). La edicion se ha calibrado para ser totalmente sin rechazos en los modos de esfuerzo de razonamiento desactivado y maximo, mientras que el modo de esfuerzo bajo conserva algun rechazo de forma deliberada.

## Capacidades

- Generacion de texto y razonamiento multi-paso, con modo de pensamiento (thinking) configurable mediante la variable `reasoning_effort`.
- Razonamiento con niveles declarados `low` y `high`; cualquier otro valor (`medium`, `xhigh`, `off`) u omision resuelve internamente a `max`.
- Vision: procesamiento de imagenes y video mediante la torre GLM-4.1V, con plantilla de chat multimodal incluida.
- Decodificacion especulativa mediante cabeza MTP integrada, con 75,9% de aceptacion declarada.
- Modo completamente sin censura a nivel de pesos en esfuerzo desactivado y maximo, con 0% de rechazos declarado en HarmBench-320.
- Soporte de tool calling y function calling presumiblemente heredado del modelo base; la informacion proporcionada no documenta detalles especificos de plantilla para herramientas.
- Capacidades multilingues limitadas al ingles segun los metadatos del repositorio (tag `en`), a pesar de que el modelo base suele ser multilingue.
- Sin bucle de repeticion en la revision actual, segun el autor.

## Casos de uso

- Asistentes de analisis de documentos largos: con 1M tokens de contexto puede ingerir libros tecnicos, expedientes o bases de codigo completas en una sola peticion sin troceado ni recuperacion externa.
- Analisis de video y vision por computador: la torre GLM-4.1V permite describir o extraer informacion de clips, controlando el coste en tokens mediante `media_io_kwargs.video.fps` y `mm_processor_kwargs.max_image_tokens`.
- Investigacion sobre alineacion y seguridad: al ser una version con los rechazos eliminados a nivel de pesos, sirve como caso de estudio para medir deriva de comportamiento frente al modelo base en tareas de red teaming controlado.
- Generacion de codigo en pipelines internos: la ventana de 1M tokens permite pasar repositorios enteros como contexto y la decodificacion especulativa MTP reduce la latencia por token en servicios de autocompletado.
- Despliegue de inferencia de alta concurrencia en Hopper: el FP8 nativo con tensor cores y el modo MTP lo hacen adecuado para servir muchas peticiones por GPU en infraestructura H100/H200 con TP4.
- Analisis de contenido creativo sujeto a falsos positivos: el motivo declarado de la edicion de pesos es precisamente reducir rechazos en peticiones benignas marcadas, como resumen o critica de material con copyright.
- Extraccion estructurada de informacion de documentos escaneados e imagenes: combinando vision y contexto largo para procesar lotes de facturas, formularios o informes en una sola pasada.
- Evaluacion comparativa de calidad tras ablacion: MMLU 87,33% frente a 86,74% del base permite estudiar el impacto de la edicion de pesos sobre capacidades generales.

## Benchmarks y rendimiento

| Benchmark | Este modelo | Modelo base (zai-org/GLM-5.3-Flash) |
|---|---|---|
| MMLU | 87,33% | 86,74% |
| HarmBench-320 (tasa de rechazos) | 0% en esfuerzo desactivado y maximo | no disponible |
| Aceptacion de la cabeza MTP | 75,9% | no disponible |
| Decode, TP4 en H200, FP8 nativo | 163 tok/s en un solo flujo (la cifra de 211 tok/s aparece truncada en la model card) | no disponible |

No se han publicado en la informacion disponible resultados de otros benchmarks habituales (HumanEval, GSM8K, MATH, MMMU, etc.).

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 328,4 GB y los pesos en FP8 ocupan aproximadamente 1 byte por parametro, de modo que se necesitan del orden de 330 GB solo para pesos, mas la cache KV correspondiente al contexto utilizado. Con 1M tokens la cache KV crece de forma muy significativa y debe dimensionarse segun el caso.
- No cabe en GPU de consumo. Ni una RTX 4090 (24 GB) ni una RTX 5090 pueden alojar el modelo, ni siquiera con cuantizaciones alternativas, porque no se publican formatos GGUF ni AWQ/GPTQ.
- GPU recomendadas: H100 o H200 en configuracion TP4 segun la propia model card (se citan 163 tok/s de decode en un solo flujo con TP4 en H200). En la practica requiere un nodo multi-GPU con interconexion de alta velocidad.
- Opciones de despliegue: vLLM y SGLang con parser de razonamiento; el modelo carga con vLLM estandar sin codigo personalizado. No se menciona soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: 163 tok/s de decode en un solo flujo (TP4, H200, FP8 nativo). La model card menciona ademas una cifra de 211 tok/s que aparece truncada en la informacion disponible, por lo que no puede atribuirse con certeza a un escenario concreto.
- Presupuesto de tokens en razonamiento: en modo `max` con `max_tokens` de 2000 la respuesta sale vacia y el historial multi-turno se degrada a partir del cuarto turno; con 6000 tokens de presupuesto el comportamiento es correcto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bielquants/GLM-5.3-Flash-UNCENSORED-FP8 | 321,3B totales, 18B activos | 1M tokens | FP8 e4m3 block-wise | MIT | HuggingFace, 0 descargas |
| zai-org/GLM-5.3-Flash (base) | 320B totales, 18B activos (segun card) | 1M tokens | no disponible en la informacion | no disponible | HuggingFace |
| dealignai/GLM-5.3-Flash-ABLITERATED-FP8 (espejo) | Identico al anterior | 1M tokens | FP8 | MIT | HuggingFace |

No se dispone de datos de rendimiento ni de parametros de otras alternativas de la misma categoria en la informacion proporcionada, por lo que no es posible establecer una comparativa con modelos de otros fabricantes.

## Limitaciones y advertencias

- Modelo sin censura: la edicion elimina los rechazos a nivel de pesos en los modos desactivado y maximo, lo que implica riesgo real de generar contenido danino, ilegal o sujeto a derechos de autor. No es adecuado para despliegues publicos sin filtros externos.
- Riesgo de alucinacion no cuantificado: no se han publicado evaluaciones de fidelidad factual ni de tasas de alucinacion en la informacion disponible.
- Sesgos: no se documentan analisis de sesgo. La edicion de pesos puede amplificar sesgos preexistentes del modelo base.
- Idiomas: el repositorio declara unicamente ingles; el rendimiento en castellano u otros idiomas no esta verificado y podria degradarse.
- Licencia: el repositorio declara MIT, pero el modelo base es zai-org/GLM-5.3-Flash y sus condiciones de uso no se detallan en la informacion proporcionada. Conviene verificar la licencia del base antes de un uso comercial.
- Parametro `reasoning_effort`: solo acepta `low` y `high`; cualquier otro valor resuelve silenciosamente a `max`. En modo `max` con presupuestos de tokens pequenos se obtienen respuestas vacias (`finish_reason="length"`, `content=""`) que envenenan el historial multi-turno.
- No debe pasarse `enable_thinking`: la plantilla no define esa variable y su uso desactiva el parser mientras el modelo sigue razonando, volcando el razonamiento en bruto al campo `content`.
- El razonamiento se devuelve en `message.reasoning`, no en `message.reasoning_content`.
- `clear_thinking` debe ir anidado dentro de `chat_template_kwargs`; como clave de nivel superior se ignora.
- Riesgo de caida del motor con video: si `media_io_kwargs.video.fps` se fija en un valor igual o superior a la tasa de fotogramas del clip, el constructor de marcadores cuenta el triple de tokens reales y provoca `ValueError` seguido de `EngineDeadError`, dejando el servidor caido hasta reiniciarlo. Se recomienda `fps: 2`.
- Parametros multimodales ignorados silenciosamente: `max_pixels`, `min_pixels`, `size` y `detail` devuelven HTTP 200 sin efecto; deben usarse `mm_processor_kwargs.max_image_tokens` y `min_image_tokens`. Los tokens de imagen siguen la formula `texto + 2 + ceil(H/28)*ceil(W/28)`, con minimo 16 y maximo 8000.
- Los parametros `max_frames` y `num_frames` no son intercambiables entre versiones de vLLM: en la linea nightly se respeta `max_frames` y se ignora `num_frames`, y en la linea `0.1.dev*` ocurre lo contrario. El muestreo de video por defecto tambien difiere entre builds (aproximadamente 2 fps frente a 6 fps), lo que altera el coste en tokens del mismo clip.
- La edicion de pesos es deliberadamente conservadora: los modos de esfuerzo bajo conservan rechazos por diseno, por lo que no debe esperarse un comportamiento uniforme entre niveles de razonamiento.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion independiente de la comunidad ni informes de terceros sobre estabilidad o calidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bielquants/GLM-5.3-Flash-UNCENSORED-FP8
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Espejo del autor: https://huggingface.co/dealignai/GLM-5.3-Flash-ABLITERATED-FP8
- Perfil del autor: https://huggingface.co/dealignai
- Twitter del autor: https://twitter.com/dealignai
- Incidencias de vLLM citadas en la model card: vLLM #55644 y #55647
- Las busquedas web realizadas no devolvieron resultados relevantes sobre este modelo (los resultados obtenidos correspondian a documentacion no relacionada).
