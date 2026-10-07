# memisdev/GLM-5.3-Flash-UNCENSORED-FP8

## Resumen

GLM-5.3-Flash-UNCENSORED-FP8 es una version modificada a nivel de pesos del modelo zai-org/GLM-5.3-Flash, publicada por el usuario memisdev bajo la marca CRACK de dealignai. Se trata de un modelo de arquitectura MoE hibrida de aproximadamente 320.000 millones de parametros totales con 18.000 millones activos por token, cuantizado en FP8 (block-wise e4m3) y con una ventana de contexto de 1.000.000 de tokens. La modificacion consiste en la eliminacion del comportamiento de rechazo directamente en los tensores, sin fine-tuning, sin LoRA ni adaptadores, de modo que se carga con vLLM estandar.

El problema que aborda es el exceso de rechazos del modelo base en peticiones benignas pero marcadas por los filtros, especialmente en material sujeto a copyright. Segun la model card, el resultado mantiene la calidad del original (MMLU 87,33 % frente al 86,74 % del base) y alcanza un 0 % de rechazos en HarmBench-320 en los modos de razonamiento desactivado y de esfuerzo maximo.

Su relevancia actual radica en que combina tres elementos poco habituales en un modelo abierto de este tamano: cuantizacion FP8 con velocidad nativa en tensor cores Hopper, torre de vision funcional heredada de GLM-4.1V y una cabeza de prediccion multi-token (MTP) tambien modificada, con una tasa de aceptacion del 75,9 %. El repositorio ocupa 328,4 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE hibrida glm5_next: atencion lineal KDA + atencion dispersa tipo DeepSeek |
| Parametros totales | 321.323.031.390 (≈321,3 B) segun safetensors; la model card declara 320 B |
| Parametros activos | 18 B por token |
| Longitud de contexto | 1.000.000 tokens (1 M) |
| Tipos de cuantizacion | FP8 block-wise e4m3 (unico formato publicado); no se mencionan GGUF, AWQ ni GPTQ |
| Idiomas soportados | en (ingles) declarado en la model card; no disponible informacion sobre otros idiomas |
| Licencia | MIT |
| Formato de pesos | safetensors (FP8) |

## Arquitectura y entrenamiento

La arquitectura es una MoE hibrida identificada como glm5_next, que combina atencion lineal KDA (una variante de atencion lineal) con atencion dispersa de estilo DeepSeek. El modelo activa 18.000 millones de parametros de los 320.000 millones totales en cada token, lo que reduce el coste de inferencia respecto a un denso del mismo tamano. Incorpora ademas una torre de vision procedente de GLM-4.1V, que la model card declara funcional, y una cabeza de borrador de prediccion multi-token (MTP) con una tasa de aceptacion medida del 75,9 %, util para decodificacion especulativa.

Sobre el entrenamiento no hay informacion disponible en los datos proporcionados: no se indica el numero de tokens, la composicion del dataset ni si hubo fases de RLHF o DPO. Lo que si se especifica es que esta version no ha sido entrenada ni ajustada: la modificacion es una edicion permanente de los tensores (abliteracion a nivel de pesos), sin SFT, DPO, LoRA, adaptadores, vectores de steering ni ganchos en tiempo de ejecucion. Segun el autor, la edicion se mantuvo conservadora para preservar la calidad, y una revision posterior (fechada el 2026-08-28) corrige un problema raro de bucle de repeticion.

## Capacidades

- Generacion de texto y razonamiento con modos de esfuerzo configurables mediante `reasoning_effort`, que solo acepta `"low"` y `"high"`; cualquier otro valor o la omision resuelven a `max`.
- Razonamiento multi-paso con traza interna devuelta en `message.reasoning` (no en `message.reasoning_content`), con esfuerzo maximo como modo por defecto.
- Vision multimodal funcional: procesa imagenes y video mediante una plantilla de chat multimodal correcta. El coste en tokens de imagen sigue la formula `text + 2 + ceil(H/28)*ceil(W/28)`, con minimo 16 y maximo 8000 tokens por imagen.
- Prediccion multi-token (MTP) con cabeza de borrador operativa, lo que habilita decodificacion especulativa interna.
- Comportamiento sin rechazos a nivel de pesos en los modos de razonamiento desactivado y de esfuerzo maximo; el modo de esfuerzo bajo conserva rechazos de forma deliberada.
- Soporte multilingue: solo se declara ingles; no disponible informacion sobre otros idiomas.
- Tool calling / function calling: no disponible.
- Soporte de agentes: no disponible de forma explicita en la informacion proporcionada.

## Casos de uso

- Servicio de inferencia en produccion sobre Hopper: al estar en FP8 nativo, se puede desplegar con vLLM o SGLang en H100/H200 con tensor parallelism y obtener velocidades de decodificacion nativas sin necesidad de kernels de cuantizacion adicionales.
- Analisis de documentos muy largos: la ventana de 1.000.000 de tokens permite cargar libros tecnicos, expedientes completos o bases de codigo extensas en una sola peticion sin troceado ni recuperacion intermedia.
- Procesamiento multimodal de imagen y video: la torre de vision operativa y las opciones `media_io_kwargs` y `mm_processor_kwargs` permiten controlar el coste en tokens por fotograma, util para catalogacion de video, analisis de capturas o inspeccion visual automatizada.
- Reduccion de latencia con decodificacion especulativa: la cabeza MTP con 75,9 % de aceptacion se puede aprovechar para acelerar la generacion en escenarios interactivos donde la latencia por token es critica.
- Investigacion en seguridad y alineacion: al ser una version abliterada con metricas de rechazo declaradas, sirve como objeto de estudio para medir el efecto de la edicion de pesos sobre el comportamiento de negativa y sobre la calidad general.
- Evaluacion comparativa de tecnicas de ablacion: permite contrastar la preservacion de capacidades (MMLU 87,33 % frente a 86,74 % del base) frente a metodos alternativos como LoRA o vectores de steering.
- Pipelines de razonamiento profundo con presupuesto controlado: usando `reasoning_effort: "high"` y un `max_tokens` suficiente, se pueden resolver tareas de varios pasos manteniendo el control del coste por consulta.
- Generacion asistida sobre corpus en ingles: dado que el unico idioma declarado es el ingles, encaja en flujos de documentacion tecnica, resumen y reescritura en ese idioma.

## Benchmarks y rendimiento

| Benchmark | Este modelo | GLM-5.3-Flash (base) |
|---|---|---|
| MMLU | 87,33 % | 86,74 % |
| HarmBench-320 (tasa de rechazos, esfuerzo desactivado y maximo) | 0 % | no disponible |
| Aceptacion de la cabeza MTP | 75,9 % | no disponible |
| Decodificacion single-stream (TP4, FP8 nativo en H200) | 163 tok/s | no disponible |

La model card menciona una segunda cifra de rendimiento (un valor a partir de 211) que aparece truncada en la informacion disponible, por lo que no se reproduce. No se han publicado resultados de otros benchmarks estandar (HumanEval, GSM8K, MMLU-Pro, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para los pesos: el repositorio ocupa 328,4 GB, por lo que se necesitan al menos 4 aceleradores de 80 GB para alojar los pesos en FP8, mas el espacio de cache KV correspondiente a la ventana de contexto configurada.
- GPU recomendadas: H100 y H200 de 80 GB, que ejecutan FP8 en tensor cores a velocidad nativa. La configuracion medida por el autor es TP4 sobre H200.
- GPU de consumo: no cabe en ninguna GPU de consumo actual. Un unico RTX 4090 con 24 GB no puede alojar 328 GB de pesos, ni siquiera repartiendo el modelo entre varias unidades consumer.
- Opciones de despliegue: vLLM y SGLang con parser de razonamiento, que es el escenario documentado con detalle en la model card. No se mencionan llama.cpp, Ollama ni TGI; dado el formato FP8 y el tamano, el soporte en esas herramientas no esta confirmado.
- Latencia y throughput: 163 tok/s de decodificacion single-stream con TP4 sobre H200 y FP8 nativo. No hay datos publicados de throughput agregado ni de latencia de prefill.
- Nota operativa grave: en modo `max` con `max_tokens` pequeno la respuesta sale vacia porque el presupuesto se consume dentro del bloque de razonamiento. Con `max_tokens` de 2000 el fallo aparece a partir del cuarto turno; con 6000 el comportamiento es limpio. En video, fijar `media_io_kwargs.video.fps` igual o por encima de la tasa de fotogramas del clip provoca un error de recuento de tokens multimodales (`EngineDeadError`) que tumba el servidor hasta reiniciarlo; el valor seguro es `fps: 2`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| memisdev/GLM-5.3-Flash-UNCENSORED-FP8 | 321,3 B totales / 18 B activos | 1 M | FP8 e4m3 | MIT | Version abliterada con vision y MTP |
| zai-org/GLM-5.3-Flash | 320 B totales / 18 B activos | 1 M | no disponible | no disponible en la informacion proporcionada | Modelo base, comportamiento de rechazo original, MMLU 86,74 % |
| dealignai/GLM-5.3-Flash-ABLITERATED-FP8 | no disponible | no disponible | FP8 | no disponible | Espejo del mismo release segun la model card |

No se dispone de datos sobre otros modelos abiertos de tamano y categoria comparables en la informacion proporcionada, por lo que no se incluyen alternativas adicionales.

## Limitaciones y advertencias

- Ausencia total de filtros de rechazo a nivel de pesos en los modos desactivado y maximo: el modelo puede generar contenido danino, ilegal o sujeto a derechos de autor sin ninguna barrera interna. Es responsabilidad del desplegador anadir moderacion externa.
- El modo de esfuerzo bajo conserva rechazos de forma deliberada, de modo que el comportamiento no es homogeneo entre configuraciones y puede sorprender a quien no conozca esta particularidad.
- Riesgo de alucinacion: no hay datos publicados sobre tasas de fidelidad factual; como cualquier modelo generativo, puede producir afirmaciones incorrectas con aparente seguridad.
- Idioma: solo se declara ingles. No hay confirmacion de calidad en castellano ni en otros idiomas, por lo que su uso en entornos hispanohablantes requiere evaluacion previa.
- Licencia MIT declarada por el autor del derivado, pero la informacion proporcionada no aclara la licencia original de zai-org/GLM-5.3-Flash ni posibles conflictos entre ambas para uso comercial.
- Fragilidad operativa documentada: el parametro `enable_thinking` no existe en esta plantilla y su uso desactiva el parser dejando el razonamiento crudo en `content`; `clear_thinking` debe ir anidado dentro de `chat_template_kwargs`.
- Incompatibilidades entre builds de vLLM: `max_frames` y `num_frames` no son intercambiables segun la version, y parametros como `max_pixels`, `min_pixels`, `size` o `detail` devuelven HTTP 200 sin efecto real.
- Coste de hardware elevado: 328,4 GB de pesos exigen un nodo multi-GPU Hopper, lo que descarta el despliegue en estaciones de trabajo o GPU de consumo.
- Historial de revisiones: la model card indica que el release actual sustituye a unos pesos anteriores que presentaban un problema de bucle de repeticion, por lo que es imprescindible descargar la version corregida.
- Procedencia y trazabilidad limitadas: cero descargas y cero valoraciones en el momento del registro, y un unico autor responsable de la edicion de pesos, sin auditoria externa publicada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/memisdev/GLM-5.3-Flash-UNCENSORED-FP8
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Espejo del release: https://huggingface.co/dealignai/GLM-5.3-Flash-ABLITERATED-FP8
- Perfil del autor del release: https://huggingface.co/dealignai
- Twitter del autor: https://twitter.com/dealignai
- Incidencias de vLLM citadas (recuento de tokens multimodales): vLLM #55644 y #55647 (referencias textuales de la model card, sin URL directa en la informacion disponible)
