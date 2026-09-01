# chuzka/Huihui-DeepSeek-V4-Flash-0731-abliterated-GGUF

## Resumen

Huihui-DeepSeek-V4-Flash-0731-abliterated-GGUF es una cuantización en formato GGUF del modelo DeepSeek-V4-Flash-0731, publicada por el usuario chuzka en Hugging Face. Se trata de una versión "abliterada" (abliterated) del modelo original, es decir, se le ha aplicado una técnica de ablación de capas de rechazo para eliminar los filtros de seguridad y las negativas ante solicitudes sensibles. El resultado es un modelo sin censura aparente, orientado a usos de investigación y experimentación en entornos controlados.

El modelo base, DeepSeek-V4-Flash-0731, es un modelo de lenguaje de tipo mixture-of-experts (MoE) con aproximadamente 284 mil millones de parámetros totales, desarrollado por DeepSeek. Esta versión cuantizada reduce el peso del modelo para facilitar su ejecución en hardware más modesto, aunque sigue siendo un modelo de gran tamaño. Los archivos GGUF provienen del repositorio de antirez y son compatibles con los motores de inferencia llama.cpp y ds4, incluyendo soporte para Apple Silicon (Metal) y despliegue multi-GPU.

La relevancia de este modelo radica en su doble naturaleza: por un lado, ofrece una alternativa cuantizada y optimizada para ejecución local de un modelo de vanguardia; por otro, al eliminar los mecanismos de rechazo, permite estudiar el comportamiento del modelo sin restricciones de seguridad, lo que resulta de interés para la investigación en alineación y seguridad de IA. No obstante, su uso conlleva riesgos importantes que se detallan en las advertencias del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts (MoE), transformer |
| Parametros totales | 284.334.567.511 (~284 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (los ejemplos de uso emplean hasta 262 144 tokens) |
| Tipos de cuantizacion | IQ2_XXS, Q2_K, Q4_K (ademas de archivos DSpark) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base DeepSeek-V4-Flash-0731 es un transformer de tipo mixture-of-experts (MoE), lo que implica que solo una fraccion de los parametros se activa por token procesado. No se dispone de informacion detallada sobre el numero de expertos, la dimension del modelo o el numero de capas en la informacion proporcionada. El modelo fue entrenado por DeepSeek, aunque no se han publicado datos sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas como RLHF o DPO en la documentacion disponible.

Esta version concreta no es un entrenamiento nuevo, sino una transformacion del modelo original mediante dos procesos: la ablacion (abliteration) de las capas responsables de los rechazos, aplicada con la tecnica descrita en el repositorio remove-refusals-with-transformers, y la cuantizacion a formato GGUF. Segun la model card, la intensidad de la ablacion fue mayor en la cuantizacion Q4 que en la Q2, por lo que la tasa de rechazo es menor en la version Q4. Todos los modulos expertos se mantuvieron intactos (no fueron ablacionados). Los archivos GGUF fueron generados por antirez y los archivos DSpark provienen de unsloth.

## Capacidades

- Generacion de texto conversacional: el modelo esta etiquetado como "conversational" y es capaz de mantener dialogos multi-turno.
- Razonamiento y conocimiento general: al ser una version de DeepSeek-V4-Flash, hereda las capacidades de razonamiento y conocimiento del modelo base, aunque no se aportan datos especificos en la documentacion.
- Ejecucion local optimizada: gracias a la cuantizacion GGUF, puede ejecutarse con llama.cpp y ds4, con soporte para Apple Silicon (Metal) y multi-GPU.
- Ausencia de filtros de seguridad: la ablacion elimina los mecanismos de rechazo, por lo que el modelo no se niega a responder ante solicitudes que el modelo original rechazaria.
- Compatibilidad con ds4: incluye archivos DSpark (pre y post ablacion) para su uso con el motor ds4, que permite inferencia en una o varias GPUs.
- No se dispone de informacion sobre soporte de tool calling, function calling, capacidades multimodales o modo de pensamiento explicito.

## Casos de uso

- Investigacion en alineacion y seguridad de IA: el modelo permite estudiar como se comporta un LLM sin capas de rechazo, lo que resulta util para analizar sesgos, alucinaciones y mecanismos de seguridad en entornos de laboratorio controlados.
- Generacion de contenido creativo sin restricciones: escritores y artistas pueden explorar estilos o tematicas que los modelos censurados evitarian, siempre bajo responsabilidad del usuario y en contextos privados.
- Evaluacion de tecnicas de ablacion: al comparar esta version con el modelo original, los investigadores pueden medir el impacto de la ablacion en la calidad de las respuestas y en la tasa de rechazo.
- Pruebas de cuantizacion y rendimiento: desarrolladores pueden evaluar el comportamiento de un modelo de 284 B en cuantizaciones Q2 y Q4, midiendo latencia, uso de VRAM y calidad de salida en diferentes hardware.
- Desarrollo de aplicaciones de chat locales: para entornos donde se requiere un asistente conversacional sin filtros, como demos internas o prototipos, siempre que se cumplan las advertencias legales y eticas.
- Benchmarking de motores de inferencia: al ser compatible con llama.cpp y ds4, permite comparar el rendimiento de ambos motores con el mismo modelo y las mismas cuantizaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras metricas estandar para esta version abliterada y cuantizada. El autor no proporciona comparaciones con el modelo original ni con otras cuantizaciones.

## Requisitos de hardware

- El repositorio completo ocupa 549.3 GB, pero los archivos GGUF individuales son mucho menores. No se indican los tamanos exactos de cada archivo en la documentacion.
- Al tratarse de un modelo de 284 B de parametros, incluso en cuantizacion Q2_K, la VRAM necesaria supera ampliamente la capacidad de una GPU de consumo. Se requieren multiples GPUs de alta gama (por ejemplo, varias A100 o H100) o configuraciones con memoria unificada amplia.
- El ejemplo de ds4 multi-GPU utiliza dos GPUs (CUDA_VISIBLE_DEVICES=0,1), lo que sugiere que la cuantizacion Q2_K puede caber en 2 GPUs de alta capacidad, aunque no se especifica la VRAM exacta.
- Es compatible con Apple Silicon mediante Metal, lo que permite ejecutarlo en Mac con memoria unificada suficiente (probablemente 128 GB o mas).
- Motores de inferencia soportados: llama.cpp (version reciente) y ds4 (rama ds4f-mxfp4). Tambien se menciona compatibilidad con endpoints y region US.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa cuantitativa. Como referencia cualitativa:

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4-Flash-0731 (base) | ~284 B | no disponible | MIT | safetensors | Modelo original con filtros de seguridad |
| Huihui-DeepSeek-V4-Flash-0731-abliterated-GGUF (este) | ~284 B | no disponible | MIT | GGUF | Version abliterada y cuantizada |
| Huihui-DeepSeek-V4-Flash-abliterated-ds4-GGUF (otro repo) | no disponible | no disponible | MIT | GGUF | Version similar, con 225 541 descargas y 134 likes segun la busqueda web |

La comparacion con el modelo base es la mas relevante: la diferencia principal es la eliminacion de los rechazos y la reduccion de precision por la cuantizacion. No hay datos de rendimiento para cuantificar la perdida de calidad.

## Limitaciones y advertencias

- Filtrado de seguridad significativamente reducido: el modelo puede generar contenido sensible, controvertido o inapropiado. No es apto para publico general, menores o aplicaciones que requieran alta seguridad.
- Riesgo de alucinaciones: como cualquier LLM, puede inventar informacion, y al carecer de filtros, estas alucinaciones pueden ser mas daninas.
- Uso no apto para produccion: el autor recomienda explicitamente no usarlo en aplicaciones comerciales o publicas sin supervision. Es un modelo de prueba de concepto.
- Responsabilidad legal y etica: el usuario es el unico responsable de cumplir las leyes locales y los estandares eticos. El contenido generado puede acarrear riesgos legales.
- Necesidad de monitoreo: se recomienda supervisar las salidas en tiempo real y realizar revisiones manuales para evitar la difusion de contenido inapropiado.
- Sin garantias de seguridad: a diferencia de los modelos estandar, este no ha pasado por una optimizacion rigurosa de seguridad. huihui.ai no se hace responsable de las consecuencias de su uso.
- La cuantizacion Q2 puede degradar la calidad de las respuestas en comparacion con el modelo original o con cuantizaciones mas altas.
- No se dispone de informacion sobre los idiomas soportados ni sobre la longitud de contexto maxima oficial.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/chuzka/Huihui-DeepSeek-V4-Flash-0731-abliterated-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Repositorio de GGUF original (antirez): https://huggingface.co/antirez/deepseek-v4-gguf
- Repositorio de DSpark (unsloth): https://huggingface.co/unsloth/DeepSeek-V4-Flash-0731-GGUF/tree/main/dspark
- Tecnica de ablacion: https://github.com/Sumandora/remove-refusals-with-transformers
- Motor ds4: https://github.com/antirez/ds4/tree/ds4f-mxfp4
- Coleccion de modelos abliterados de huihui-ai: https://huggingface.co/collections/huihui-ai/deepseek-v4-abliterated
- Pagina de informacion del modelo similar: https://local-ai-zone.github.io/models/huihui-deepseek-v4-flash-abliterated-ds4.html
