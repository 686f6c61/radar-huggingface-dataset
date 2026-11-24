# aquaduck/Inkling-2-Mini-GGUF

## Resumen

Inkling-2-Mini es un modelo de lenguaje causal de tipo transformer desarrollado por Thinking Machines, con aproximadamente 26.400 millones de parametros (26,07B segun los pesos en safetensors). Esta ficha describe la variante GGUF alojada por Aquaduck en el repositorio `aquaduck/Inkling-2-Mini-GGUF`, que redistribuye la cuantizacion UD-Q4_K_XL producida por Unsloth a partir de los pesos originales. No se trata de un modelo nuevo ni de un reentrenamiento: es un empaquetado de inferencia del modelo base.

La relevancia de este repositorio concreto es doble. Por un lado, ofrece el fichero GGUF completo (`Inkling-2-Mini-UD-Q4_K_XL.gguf`, unos 17,63 GB) compatible con llama.cpp, lo que permite ejecutar un modelo de ~26B en hardware de consumo mediante cuantizacion de 4 bits. Por otro, incluye fragmentos de capas ("midpoint layer shards") en formato layer-package-v1, pensados para carga por etapas o distribuida en varios nodos dentro del ecosistema Aquaduck Arc. Estos fragmentos no son modelos completos y no funcionan de forma directa en llama.cpp estandar.

El modelo base se distribuye bajo licencia "other" (no estandar), con un card que documenta modos de chat con "thinking" e instruct. El repositorio no aporta informacion sobre la longitud de contexto nativa, los idiomas soportados ni evaluaciones propias, por lo que estos datos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (Inkling-2-Mini; detalles internos no disponibles) |
| Parametros totales | 26.070.390.272 (~26,07B); el card indica 26,4B |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el card indica "unknown tokens") |
| Tipos de cuantizacion | UD-Q4_K_XL (unica incluida en este repo) |
| Idiomas soportados | multilingue segun el modelo base; lista concreta no disponible |
| Licencia | other (hereda de thinkingmachines/inkling-2-mini) |
| Formato de pesos | GGUF (fichero completo + fragmentos de capas layer-package-v1) |

## Arquitectura y entrenamiento

El modelo base es un modelo de lenguaje causal de aproximadamente 26B parametros. El card del repositorio no detalla la arquitectura interna (numero de capas, dimensiones, tipo de atencion, uso de MoE, etc.), ni los datos de entrenamiento (numero de tokens, composicion del corpus, fases de RLHF/DPO). Tampoco se documentan innovaciones tecnicas especificas como decodificacion especulativa o atencion lineal. Toda esa informacion remite al card del modelo original, que no forma parte de la informacion disponible aqui.

Lo que si se documenta es el proceso de empaquetado. Los pesos originales se cuantizaron a UD-Q4_K_XL (una variante de cuantizacion de 4 bits del ecosistema Unsloth/llama.cpp que combina tipos K-quant con mezcla dinamica de precision). A partir de ese GGUF completo, Aquaduck genera fragmentos de capas contiguos en el punto medio, etiquetados como `*-layers-{start}-{endExclusive}.gguf`, con el formato layer-package-v1. Estos fragmentos no alteran los pesos mas alla del empaquetado y no constituyen una nueva cuantizacion. No se realizo ningun entrenamiento ni fine-tuning en este repositorio.

## Capacidades

- Generacion de texto conversacional, con plantilla de chat propia del modelo base que incluye modos "thinking" e instruct.
- Razonamiento en modo thinking (segun la documentacion referenciada del modelo base; sin detalles cuantitativos disponibles).
- Capacidades multilingues heredadas del modelo base (lista de idiomas no disponible).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponible.
- Inferencia local mediante llama.cpp en el fichero GGUF completo.
- Carga por etapas o multi-nodo mediante fragmentos de capas (solo en el ecosistema Aquaduck Arc, no en llama.cpp estandar).

## Casos de uso

- Inferencia local en estaciones de trabajo: usar `Inkling-2-Mini-UD-Q4_K_XL.gguf` con llama.cpp u otro runtime compatible para ejecutar un modelo de ~26B en una sola maquina con GPU de consumo o configuracion CPU+GPU, aprovechando la cuantizacion de 4 bits para reducir el espacio de pesos a ~17,6 GB.
- Asistente conversacional autoalojado: desplegar el GGUF completo detras de una interfaz de chat respetando la plantilla del modelo base (incluido el modo thinking) para conversaciones multi-turno sin dependencia de APIs externas.
- Prototipado de aplicaciones de razonamiento: emplear el modo thinking del modelo base para tareas que requieran cadenas de razonamiento, validando la calidad frente a la version de mayor precision antes de pasar a produccion.
- Evaluacion comparativa de cuantizaciones: usar este UD-Q4_K_XL como referencia para medir la degradacion de calidad frente a los pesos originales en tareas propias, dado que el card advierte explicitamente de esa posible perdida.
- Despliegue distribuido por etapas: en entornos Aquaduck Arc, cargar los fragmentos `*-layers-*` en varios nodos para servir el modelo cuando no se dispone de una unica maquina con memoria suficiente para el fichero completo.
- Integracion en la aplicacion de escritorio Aquaduck: recibir la asignacion del catalogo de modelos y descargar automaticamente el fichero o fragmento correspondiente para servir el modelo en local, sin seleccion manual de ficheros.
- Pruebas de pipelines de inferencia GGUF: validar el soporte de llama.cpp y de runtimes derivados con un modelo de ~26B cuantizado, midiendo latencia y throughput en el hardware objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El card indica explicitamente que no hay evaluaciones separadas para el GGUF alojado ni para los fragmentos, y remite al card de `thinkingmachines/inkling-2-mini`, que no forma parte de los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero UD-Q4_K_XL ocupa aproximadamente 17,63 GB, por lo que se necesita al menos esa cantidad de memoria combinada (VRAM + RAM si se usa offload parcial). Para comodidad de contexto y buffers de KV cache conviene disponer de 20-24 GB o mas.
- GPU recomendadas: no disponibles de forma especifica en la informacion. Por tamano, una RTX 4090 (24 GB) es el limite practico para cargar el modelo completo en una sola GPU de consumo; GPUs profesionales como A100 (40/80 GB) o H100 (80 GB) permiten margen amplio para contexto largo y mayor throughput.
- Cabe en GPU de consumo: si, en tarjetas con 24 GB o mas (por ejemplo RTX 3090 o RTX 4090) cargando el GGUF completo; en tarjetas de 12-16 GB requeriria offload parcial a RAM con la consiguiente perdida de velocidad.
- Opciones de despliegue: llama.cpp (soporte nativo del GGUF completo), runtimes derivados compatibles con GGUF, y la aplicacion de escritorio Aquaduck para descarga y servicio gestionado. Los fragmentos de capas solo son utilizables con la carga por etapas de Aquaduck Arc.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo base en la informacion proporcionada, por lo que la comparacion se limita a caracteristicas estructurales conocidas. Los valores de los modelos alternativos se indican solo cuando son datos publicos ampliamente establecidos; en caso contrario se marcan como no disponibles.

| Modelo | Parametros | Contexto | Licencia | Formato en este analisis |
|---|---|---|---|---|
| Inkling-2-Mini (este repo, GGUF) | ~26B | no disponible | other | GGUF UD-Q4_K_XL |
| Modelos densos de ~24-32B de la familia Qwen (por ejemplo Qwen2.5-32B) | ~32B | no disponible en esta ficha | segun variante | safetensors / GGUF |
| Modelos densos de ~27-34B de la familia Gemma | ~27B | no disponible en esta ficha | segun variante | safetensors / GGUF |
| Mistral Small (variantes de ~22-24B) | ~22-24B | no disponible en esta ficha | segun variante | safetensors / GGUF |

La comparacion de rendimiento, contexto y calidad frente a estas alternativas no puede realizarse con los datos disponibles. Se recomienda consultar el card del modelo base para obtener metricas antes de decidir entre opciones.

## Limitaciones y advertencias

- La cuantizacion UD-Q4_K_XL puede degradar la calidad respecto a las versiones de mayor precision del modelo base; el propio card lo advierte.
- Licencia "other": no es una licencia estandar y hereda las condiciones de `thinkingmachines/inkling-2-mini`. Es imprescindible revisar el card del modelo base antes de cualquier uso comercial.
- Los ficheros `*-layers-*.gguf` no son modelos completos y no funcionan en llama.cpp estandar; usarlos como modelo completo produce fallos.
- Es obligatorio usar la plantilla de chat del modelo base, incluidos los modos thinking e instruct; otras plantillas no funcionan correctamente.
- No se documentan sesgos conocidos, tasas de alucinacion ni limitaciones de idioma especificas en la informacion disponible; se heredan las del modelo base.
- Longitud de contexto nativa desconocida, lo que impide planificar despliegues con ventanas largas sin consultar el card original.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso en produccion ni validacion comunitaria.
- Los benchmarks no estan disponibles, por lo que no hay garantia documentada de calidad frente a alternativas de tamano similar.
- El flujo de descarga esta pensado para la aplicacion Aquaduck; la seleccion manual de ficheros es posible pero requiere conocer que variante cargar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/aquaduck/Inkling-2-Mini-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/inkling-2-mini
- GGUF de origen (Unsloth): https://huggingface.co/unsloth/Inkling-2-Mini-GGUF
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Perfil del host: https://huggingface.co/aquaduck
