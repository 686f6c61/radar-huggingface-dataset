# kellyjeong/Qwen3.5-2B-ToolCalling-LoRA

## Resumen

`kellyjeong/Qwen3.5-2B-ToolCalling-LoRA` es un adaptador LoRA publicado en Hugging Face por el usuario kellyjeong, cuyo nombre indica un ajuste fino del modelo base Qwen3.5-2B orientado a *tool calling* (invocación de funciones y herramientas). El repositorio tiene 0,3 GB, un tamaño coherente con un adaptador y no con un conjunto de pesos completos, y lleva las etiquetas `transformers`, `safetensors` y `unsloth`, lo que apunta a un entrenamiento realizado con la librería Unsloth. No hay pipeline declarado, ni licencia, ni idiomas, ni número de descargas o *likes* en el momento de la consulta.

El problema que aborda es relevante: los modelos pequeños de 2 000 millones de parámetros son atractivos para desplegar agentes que llaman a APIs en local o en el *edge*, donde el coste por token y la latencia importan más que el razonamiento complejo. Un adaptador LoRA permite especializar ese comportamiento sin reentrenar el modelo completo y mantiene la posibilidad de servir varias especializaciones sobre una misma instancia del modelo base.

Ahora bien, la información publicada es prácticamente nula: la *model card* es la plantilla autogenerada de Hugging Face con todos los campos marcados como `[More Information Needed]`. No se documentan datos de entrenamiento, hiperparámetros, evaluación, licencia ni idiomas, y el repositorio no tiene descargas ni validación de la comunidad. Cualquier evaluación seria de este adaptador exige descargarlo y probarlo contra el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. Por el identificador del repositorio se deduce que hereda la arquitectura del modelo base Qwen3.5-2B (transformador decoder-only), pero el autor no lo confirma |
| Parametros totales | No disponible para el adaptador. El modelo base se infiere en torno a 2 000 millones de parametros por el sufijo «2B» del nombre; no confirmado en la model card |
| Parametros activos | No procede: no hay indicios de que el modelo base sea una arquitectura MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible. El repositorio no publica artefactos GGUF, AWQ ni GPTQ; solo pesos en safetensors |
| Idiomas soportados | No disponible |
| Licencia | No disponible. La model card deja el campo vacio y el repositorio no declara licencia |
| Formato de pesos | safetensors (adaptador LoRA, presumiblemente en formato PEFT/Unsloth); no se publican pesos fusionados ni GGUF |
| Tamano del repositorio | 0,3 GB |
| Etiquetas declaradas | transformers, safetensors, unsloth, arxiv:1910.09700, endpoints_compatible, region:us |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Fecha de creacion y actualizacion | 23 de octubre de 2026 (ambas) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del adaptador ni del modelo base mas alla de lo que sugiere el nombre del repositorio. El sufijo «-LoRA» indica que se trata de un ajuste de bajo rango sobre un modelo preentrenado, y la etiqueta `unsloth` apunta a que el entrenamiento se realizo con esa libreria, habitual para ajustes de Qwen en GPU de consumo mediante LoRA o QLoRA. El identificador `Qwen3.5-2B` situa el modelo base en la familia Qwen3.5 con aproximadamente 2 000 millones de parametros, pero el autor no documenta capa de atencion, tipo de positional encoding, tokenizador ni longitud de contexto.

Tampoco hay informacion sobre el corpus de entrenamiento: se desconoce el numero de ejemplos, la composicion del dataset, si se generaron trazas sinteticas de llamadas a funciones, si se aplico enmascaramiento de perdida sobre los turnos del asistente ni si hubo una fase posterior de preferencias (DPO, RLHF u ORPO). La etiqueta `arxiv:1910.09700` que aparece en el repositorio corresponde a Lacoste et al. (2019), el articulo del calculador de impacto ambiental de aprendizaje automatico que cita la plantilla de Hugging Face; no es un articulo sobre este modelo y no debe interpretarse como referencia tecnica. La seccion de evaluacion, hiperparametros y datos de la model card esta vacia en su totalidad.

## Capacidades

- Generacion de texto en el marco de conversaciones multi-turno, como capacidad heredada del modelo base (no verificada para este adaptador).
- Tool calling / function calling: es el objetivo declarado por el nombre del repositorio, aunque no hay ejemplos, esquemas ni formatos documentados.
- Uso previsto como adaptador PEFT sobre el modelo base Qwen3.5-2B, lo que permite combinarlo con otras especializaciones servidas desde una misma instancia.
- Compatibilidad declarada con endpoints mediante la etiqueta `endpoints_compatible`.
- Razonamiento multi-paso y comportamiento agentico: no documentado por el autor.
- Soporte de *thinking mode*, vision, audio u otras modalidades: no documentado.
- Capacidades multilingues: no documentadas; se desconoce que idiomas conserva el ajuste.

## Casos de uso

- Agentes locales de llamada a funciones: el adaptador se carga sobre Qwen3.5-2B y se emplea para transformar peticiones en lenguaje natural en llamadas JSON a APIs internas; su tamano reducido permite ejecutarlo en una estacion de trabajo sin GPU de datacenter.
- Enrutado de herramientas en asistentes de linea de comandos: dado un conjunto cerrado de comandos, el modelo selecciona cual invocar y con que argumentos, con latencia baja al residir en pocos gigabytes de VRAM.
- Extraccion de parametros estructurados en pipelines de automatizacion: conversion de correos o mensajes a objetos tipados que alimentan un sistema de tickets o un CRM, siempre que se valide el esquema de salida.
- Prototipado de arquitecturas de agentes antes de invertir en un modelo mayor: el coste de iteracion es minimo y permite comparar prompts de herramientas, temperaturas y esquemas de validacion contra el modelo base sin adaptador.
- Servicio multi-adaptador con vLLM: vLLM soporta cargar varios adaptadores LoRA sobre una misma instancia del modelo base, lo que permitiria atender distintas especializaciones de tools con un unico despliegue y conmutar por peticion.
- Pruebas de regresion en CI de sistemas de function calling: fijar el adaptador como referencia y detectar degradaciones cuando se modifica el catalogo de herramientas o el formato de los esquemas.
- Base para un ajuste posterior: al ser un adaptador pequeno, sirve como punto de partida para un segundo entrenamiento LoRA con datos propios del dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La seccion de evaluacion de la model card esta vacia y no existen tablas de MMLU, HumanEval, GSM8K, BFCL ni de ninguna otra métrica en el repositorio. Tampoco se documentan velocidad de entrenamiento, throughput de inferencia ni curvas de perdida.

## Requisitos de hardware

Las cifras siguientes son estimaciones aritmeticas derivadas del tamano de parametros (~2 000 millones) y no datos publicados por el autor, que no documenta ningun requisito.

- VRAM para el adaptador en si: inferior a 1 GB a partir del tamano del repositorio (0,3 GB).
- VRAM del modelo base en fp16/bf16: en torno a 4 GB de pesos, mas cache KV y overhead del runtime; presupuesto practico de 5 a 6 GB.
- VRAM del modelo base en int8: aproximadamente 2 GB de pesos.
- VRAM del modelo base en 4 bits (QLoRA/bitsandbytes): aproximadamente 1,2 a 1,5 GB de pesos, lo que deja margen amplio en GPU de 8 GB.
- GPU de consumo: cabe con holgura en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores; en 4 bits entra tambien en GPU de 8 GB.
- GPU de datacenter: A100, H100, L40S y A10 quedan sobredimensionadas para un adaptador de este tamano; tiene mas sentido consolidar varias instancias o usar MIG.
- Opciones de despliegue: Transformers con PEFT para cargar el adaptador sin fusionar; fusion de pesos y conversion a GGUF para llama.cpp u Ollama; vLLM con soporte de adaptadores LoRA para servicio concurrente; TGI si se fusionan los pesos previamente.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea principal | Licencia | Formato |
|---|---|---|---|---|---|
| kellyjeong/Qwen3.5-2B-ToolCalling-LoRA | ~2B (inferido) | No disponible | Tool calling (declarado en el nombre) | No disponible | safetensors (adaptador) |
| wcheolkyo/Qwen3.5-2B-ToolCalling-LoRA | ~2B (inferido) | No disponible | Tool calling | No disponible | No disponible |
| egoigo/Qwen3.5-2B-ToolCalling-LoRA | ~2B (inferido) | No disponible | Tool calling | No disponible | No disponible |
| Nani Qwen 3.5 2B | ~2B | No disponible | Tool calling para monedero cripto, 103 herramientas sobre ~2 000 ejemplos | No disponible | GGUF |

Los dos primeros repositorios de la tabla comparten identico nombre que el modelo analizado y pertenecen a usuarios distintos, lo que sugiere copias o bifurcaciones sin documentacion adicional; no se puede confirmar que el contenido sea el mismo. Nani Qwen 3.5 2B es un modelo distinto, publicado por otro autor, que si documenta el alcance de su ajuste (unos 2 000 ejemplos y 103 herramientas de Blockchain) y distribuye pesos GGUF para inferencia local, lo que lo convierte en la referencia mas cercana y en el contrapunto en cuanto a trazabilidad. Para el modelo base, las guias de Unsloth sobre Qwen3.5 documentan el flujo de ajuste fino y la conversion a GGUF, pero no cifras de rendimiento del adaptador aqui descrito.

## Limitaciones y advertencias

- Documentacion inexistente: la model card es la plantilla autogenerada, sin descripcion, datos de entrenamiento, evaluacion ni instrucciones de uso.
- Licencia no declarada: sin licencia explicita no se puede asumir permiso de uso comercial, y la licencia del adaptador podria ademas estar condicionada por la del modelo base Qwen3.5-2B, que no se cita.
- Sin validacion de la comunidad: cero descargas y cero *likes* en la fecha de consulta implican ausencia de pruebas independientes sobre su funcionamiento.
- Riesgo de alucinacion en argumentos: en modelos de 2B es frecuente que el adaptador genere nombres de herramientas inexistentes, parametros inventados o JSON malformado; es imprescindible validar la salida contra un esquema y aplicar reintentos.
- Ambiguedad de suministro: existen al menos dos repositorios con el mismo nombre de modelo en cuentas distintas, lo que dificulta verificar procedencia e integridad; conviene fijar el commit exacto.
- Idiomas y contexto desconocidos: no se puede garantizar el comportamiento en castellano ni en conversaciones largas, porque no se documenta la ventana de contexto efectiva tras el ajuste.
- Dependencia del modelo base: el adaptador no es util por si solo; requiere descargar Qwen3.5-2B y conocer su revision exacta para que los tensores LoRA encajen.
- Atribucion erronea frecuente: la etiqueta `arxiv:1910.09700` procede de la plantilla de Hugging Face y no es una publicacion sobre el modelo.
- Fechas de publicacion y actualizacion identicas (23 de octubre de 2026), sin historial de versiones ni *commits* visibles que permitan auditar cambios.

## Enlaces

- Repositorio principal: https://huggingface.co/kellyjeong/Qwen3.5-2B-ToolCalling-LoRA
- Repositorio homonimo de otro autor: https://huggingface.co/wcheolkyo/Qwen3.5-2B-ToolCalling-LoRA
- Repositorio homonimo de otro autor: https://huggingface.co/egoigo/Qwen3.5-2B-ToolCalling-LoRA
- Documentacion de Unsloth para el ajuste fino de Qwen3.5: https://unsloth.ai/docs/models/qwen3.5/fine-tune
- Guia practica de ajuste fino de Qwen 3.5 con LoRA/QLoRA: https://sotaaz.com/post/qwen35-finetuning-en
- Nani Qwen 3.5 2B, modelo comparable de tool calling para monedero cripto: https://ethereum.org/developers/tools/nani-qwen-35-2b/
- Lacoste et al. (2019), calculador de impacto ambiental citado en la plantilla: https://arxiv.org/abs/1910.09700
