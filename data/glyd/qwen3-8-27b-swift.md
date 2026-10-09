# glyd/Qwen3.8-27B-swift

## Resumen

Qwen3.8-27B-swift es una cuantizacion del modelo Qwen/Qwen3.8-27B publicada por el autor glyd bajo su propio motor de inferencia. El nivel "swift" comprime los pesos a aproximadamente 5,54 bits por peso, reduciendo el modelo de 50,10 GiB en bf16 a 17,35 GiB. Se trata de una cuantizacion con perdida (el propio autor la etiqueta como "not lossless"), pensada para ejecutar un modelo de gran tamano en hardware mas modesto sin recurrir al bf16 completo.

Esta version deriva del modelo base Qwen3.8-27B, un LLM denso nativo multimodal desarrollado por el equipo Qwen de Alibaba, orientado a codigo, flujos agenticos y automatizacion de oficina. Sin embargo, esta cuantizacion concreta es solo texto: la parte de vision del modelo base no esta incluida. El modelo tiene 26.895.998.464 parametros reales segun el autor, aunque el Hub muestra 18,53B porque cuenta cada byte empaquetado como un parametro.

Su relevancia es practica: permite desplegar un modelo de ~27B con una huella de disco y memoria notablemente menor, a costa de depender exclusivamente del motor propietario de Glyd (no compatible todavia con vLLM ni transformers) y de que la licencia del motor es BUSL-1.1, lo que limita el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (el modelo base Qwen3.8-27B es multimodal nativo; esta cuantizacion es solo texto) |
| Parametros totales | 26.895.998.464 segun el autor (el Hub muestra 18,53B al contar bytes empaquetados como parametros) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | nivel "swift" de Glyd, ~5,54 bits por peso; el repo se etiqueta como 8-bit |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 para los pesos (heredada del modelo base); el motor Glyd es BUSL-1.1 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen/Qwen3.8-27B, descrito por Alibaba como un LLM denso nativo multimodal de peso abierto, con soporte de texto, imagen y video en su forma original. Esta publicacion de Glyd no reentrena ni modifica la arquitectura: aplica una cuantizacion con perdida sobre los pesos del commit `1d4bf0f2` del modelo base, conservando la estructura de la red pero almacenando los pesos a ~5,54 bits. La parte de vision del modelo base queda fuera de esta cuantizacion, por lo que el resultado es un modelo estrictamente de texto.

Al tratarse de una cuantizacion, no hay informacion sobre el dataset de entrenamiento, el numero de tokens ni el proceso de alineacion (RLHF/DPO) especifica de esta version: todo ello corresponde al modelo base y no se detalla en la informacion proporcionada. La innovacion tecnica destacable es el propio esquema de compresion de Glyd, que ofrece varios niveles de fidelidad (penguin sin perdida, kestrel a ~6,5 bits por peso y swift a ~5,5 bits por peso) dentro de su motor propietario. El autor advierte explicitamente que la reconstruccion no es exacta respecto al bf16 original.

## Capacidades

- Generacion de texto: hereda las capacidades del modelo base para redaccion, resumen y conversacion, limitadas a la modalidad de texto en esta cuantizacion.
- Razonamiento y matematicas: el modelo base esta orientado a tareas de razonamiento y contiene mejoras en evaluaciones como MathVision, aunque no se publican cifras para esta version cuantizada.
- Generacion de codigo: el modelo base destaca en codigo, segun la descripcion oficial de Alibaba.
- Flujos agenticos: el modelo base esta disenado para workflows agenticos y automatizacion de oficina.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado explicitamente en la informacion disponible para esta cuantizacion.
- Capacidades multilingues: no disponible.
- Capacidades especiales: la multimodalidad (imagen y video) del modelo base no esta incluida en esta cuantizacion; el modelo es solo texto.

## Casos de uso

- Despliegue local en hardware con memoria limitada: al ocupar 17,35 GiB en lugar de 50,10 GiB en bf16, permite ejecutar un modelo de ~27B en estaciones de trabajo con una sola GPU NVIDIA de gama alta, siempre que se use el motor Glyd en Linux.
- Prototipado y evaluacion de modelos grandes: util para desarrolladores que quieran probar el comportamiento de Qwen3.8-27B sin disponer de la VRAM necesaria para el bf16 completo.
- Generacion de codigo en local: aprovechando el enfoque del modelo base en codigo, se puede usar como asistente de programacion en un entorno de desarrollo sin enviar datos a la nube.
- Automatizacion de oficina: el modelo base esta orientado a tareas de oficina, por lo que la version cuantizada puede emplearse para redaccion de documentos y resumen de textos en local.
- Flujos agenticos de texto: para pipelines que requieran razonamiento multi-paso sobre texto, siempre que se confirme el soporte de tool calling en el motor Glyd.
- Experimentacion en investigacion: como punto de comparacion entre distintos niveles de cuantizacion (penguin, kestrel, swift) para medir el efecto de la perdida de precision en tareas concretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta cuantizacion especifica. La busqueda web menciona que el modelo base Qwen3.8-27B se evalua en pruebas como MathVision, pero no se proporcionan cifras concretas ni para el modelo base ni para la version "swift" de Glyd. Tampoco se documenta la degradacion de calidad introducida por la cuantizacion con perdida respecto al bf16.

## Requisitos de hardware

- VRAM estimada para inferencia: el propio autor indica que los pesos ocupan 17,35 GiB (frente a 50,10 GiB en bf16); a ello hay que sumar la memoria para el cache KV y el overhead del motor, no cuantificada en la informacion disponible.
- GPUs recomendadas: cualquier GPU NVIDIA compatible con el driver 580 o superior bajo Linux; no se especifican modelos concretos.
- GPU de consumo: por tamano de pesos, encaja teoricamente en tarjetas de 24 GB (por ejemplo RTX 3090 o RTX 4090), aunque el margen para cache KV y overhead no esta documentado.
- Opciones de despliegue: exclusivamente el motor de Glyd (`glyd run`); el autor indica explicitamente que no es compatible con vLLM ni con transformers todavia.
- Sistema operativo: Linux con driver NVIDIA 580 o posterior.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

Comparacion con los otros niveles de cuantizacion del mismo autor sobre el mismo modelo base:

| Modelo | Precision | Tamano de pesos | Perdida | Motor |
|---|---|---|---|---|
| Qwen/Qwen3.8-27B (bf16) | bf16 | 50,10 GiB | sin perdida | segun el framework elegido |
| glyd/Qwen3.8-27B-penguin | sin perdida | ~un tercio menor que bf16 | sin perdida | Glyd |
| glyd/Qwen3.8-27B-kestrel | ~6,5 bits por peso | no disponible | con perdida | Glyd |
| glyd/Qwen3.8-27B-swift | ~5,54 bits por peso | 17,35 GiB | con perdida | Glyd |

Nota sobre la busqueda web: existen otros modelos con el nombre "Swift-Qwen3.8-27B" (de UkisAI y relacionado con BottleCap AI) que son derivados de razonamiento eficiente distintos, no cuantizaciones. No deben confundirse con esta publicacion de Glyd, cuyo termino "swift" designa un nivel de cuantizacion.

## Limitaciones y advertencias

- Cuantizacion con perdida: el autor la etiqueta como "not lossless", por lo que los pesos no se reconstruyen exactamente a su valor bf16 y puede haber degradacion de calidad no cuantificada.
- Dependencia de un motor propietario: solo funciona con el motor de Glyd; no es compatible con vLLM ni transformers por ahora, lo que limita la portabilidad.
- Licencia del motor: Glyd se distribuye bajo BUSL-1.1, gratuito para uso personal y no comercial en equipos propios, pero el uso comercial requiere una licencia adicional. Los pesos en si son Apache-2.0, heredados del modelo base.
- Sin multimodalidad: la parte de vision del modelo base no esta incluida, pese a que el modelo original es multimodal nativo.
- Requisitos de plataforma: Linux con GPU NVIDIA y driver 580 o superior; no hay soporte documentado para otras plataformas.
- Idiomas y longitud de contexto: no disponibles, por lo que no puede garantizarse el comportamiento multilingue ni en contextos largos.
- Riesgo de alucinacion: no se documenta especificamente; aplica el riesgo general de los LLM, agravado por la cuantizacion.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validacion por parte de la comunidad.
- Possible confusion de nombre: existen otros modelos "Swift-Qwen3.8-27B" de terceros con proposito distinto; conviene verificar el ID exacto antes de usarlo.

## Enlaces

- HuggingFace de la cuantizacion: https://huggingface.co/glyd/Qwen3.8-27B-swift
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3.8-27B
- Commit del modelo base usado: https://huggingface.co/Qwen/Qwen3.8-27B/tree/1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0
- Nivel penguin (sin perdida): https://huggingface.co/glyd/Qwen3.8-27B-penguin
- Nivel kestrel (~6,5 bits por peso): https://huggingface.co/glyd/Qwen3.8-27B-kestrel
- Sitio de Glyd: https://getglyd.com
- Repositorio del modelo base en GitHub: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Modelo homonimo distinto (UkisAI Swift-Qwen3.8-27B): https://huggingface.co/vwdubb/Swift-Qwen3.8-27b-FP8
- Pagina de UkisAI sobre su Swift: https://ukisai.com/news/introducing-swift
