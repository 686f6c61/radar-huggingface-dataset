# hanswalt/teutonic-II-110B-A7B-reign-22

## Resumen

`hanswalt/teutonic-II-110B-A7B-reign-22` es un modelo de generacion de texto de tipo causal LM publicado en HuggingFace por el usuario hanswalt. El repositorio declara 110.280.865.472 parametros reales (unos 110,28 mil millones) segun los pesos en safetensors, con un tamano de repositorio de 220,6 GB, lo que es coherente con pesos almacenados en precision de 16 bits. El identificador del modelo incluye el sufijo "A7B", lo que sugiere una arquitectura de mezcla de expertos (MoE) con aproximadamente 7 mil millones de parametros activos por token, aunque esta caracteristica no aparece confirmada de forma explicita en la informacion disponible.

El modelo se distribuye bajo la libreria transformers y esta etiquetado con `causal-lm`, `text-generation`, `decentralized-training`, `bittensor` y `custom_code`. Las etiquetas de entrenamiento descentralizado y Bittensor apuntan a que el modelo se entreno en una red distribuida de computo, un enfoque que gana relevancia porque permite agregar contribuciones de multiples participantes sin depender de un unico cluster centralizado. La etiqueta `mimo_v2` sugiere que la arquitectura base podria derivar de la familia MiMo, si bien no hay confirmacion en la informacion disponible.

Su relevancia practica actual es limitada pero interesante como objeto de estudio: acumula 4 descargas y 0 likes, el acceso esta restringido (gated) y no se publican ni licencia, ni idiomas soportados, ni resultados de benchmarks. Para un desarrollador o investigador, esto implica que cualquier evaluacion requiere primero solicitar acceso y realizar una validacion propia de capacidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `mimo_v2`; el sufijo A7B del nombre sugiere MoE con ~7B activos, sin confirmar) |
| Parametros totales | 110.280.865.472 (segun safetensors) |
| Parametros activos | no disponible (aproximadamente 7B segun el nombre del repositorio, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo declara safetensors; no se listan versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Pipeline | text-generation |
| Tamano del repositorio | 220,6 GB |
| Acceso | restringido (gated), requiere aceptar condiciones en HuggingFace |
| Fecha de creacion | 2026-09-17 |
| Ultima actualizacion | 2026-09-17 |

## Arquitectura y entrenamiento

No se dispone de informacion publicada sobre la arquitectura interna, la composicion del dataset de entrenamiento ni el numero de tokens utilizados. La unica evidencia disponible son las etiquetas del repositorio: `mimo_v2`, `custom_code`, `causal-lm` y `decentralized-training`. La presencia de `custom_code` indica que el modelo requiere cargar codigo personalizado desde el repositorio al instanciarlo con `trust_remote_code=True`, un punto relevante desde el punto de vista de seguridad en produccion. La etiqueta `mimo_v2` apunta a una arquitectura de la familia MiMo, pero no hay documentacion en la informacion proporcionada que lo confirme.

En cuanto al entrenamiento, la etiqueta `bittensor` y `decentralized-training` sugieren que el modelo se entreno mediante una red descentralizada de computo en lugar de un cluster unico. Este tipo de entrenamiento suele implicar heterogeneidad de hardware, sincronizacion a traves de redes con latencia variable y posibles estrategias de agregacion de gradientes o de expertos. No se detalla si hubo RLHF, DPO, SFT posterior ni ninguna innovacion tecnica adicional como decodificacion especulativa o atencion lineal.

## Capacidades

No hay informacion publicada que detalle capacidades concretas. Lo unico verificable a partir de los metadatos es lo siguiente:

- Generacion de texto causal (`text-generation`, `causal-lm`), apta para completado y conversacion.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declara ninguna lista de idiomas).
- Capacidades especiales (modo de razonamiento explicito, vision, audio): no disponible.
- Capacidad de ejecucion con `transformers` mediante codigo personalizado del repositorio (`custom_code`).
- Entrenamiento descentralizado documentado solo a traves de etiquetas, sin detalle tecnico accesible.

## Casos de uso

Dado que no hay benchmarks, licencia clara ni documentacion publica, los casos de uso deben plantearse como escenarios a validar experimentalmente, no como aplicaciones listas para produccion.

- Investigacion sobre entrenamiento descentralizado: el modelo sirve como objeto de estudio para analizar que calidad se obtiene al entrenar un MoE de ~110B parametros en una red tipo Bittensor, comparando con modelos entrenados de forma centralizada del mismo orden de magnitud.
- Reproduccion de pipelines con transformers: al declarar `custom_code`, permite practicar la carga de arquitecturas no estandar con `trust_remote_code=True`, util para equipos que gestionan modelos propios con codigo empaquetado.
- Experimentacion en generacion de texto general: una vez obtenido acceso, se puede usar como generador causal base para tareas de completado, resumen o reescritura, midiendo calidad de forma interna antes de cualquier uso real.
- Evaluacion comparativa interna: si se confirma la naturaleza MoE con ~7B activos, resulta un candidato para medir el equilibrio entre coste de inferencia y calidad frente a modelos densos de tamano similar.
- Base para ajuste fino especifico de dominio: si la licencia finalmente permite uso comercial, podria servir como punto de partida para fine-tuning en dominios verticales (legal, sanitario, industrial) con datos propios.
- Banco de pruebas de cuantizacion: con 110,28B parametros y 220,6 GB en safetensors, es un caso util para evaluar tecnicas de cuantizacion (int8, int4) sobre arquitecturas MoE grandes, midiendo degradacion de calidad en tareas controladas.
- Estudio de sesgos y robustez en modelos entrenados de forma distribuida: permite analizar si el origen descentralizado de los datos introduce sesgos o artefactos de calidad distintos a los de modelos entrenados con curacion centralizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tabla de evaluaciones, y los resultados de busqueda web obtenidos no guardan ninguna relacion con el modelo (corresponden a contenidos sobre senalizacion de aparcamientos en lituano). No se deben asumir cifras de MMLU, HumanEval, GSM8K ni de ninguna otra suite.

## Requisitos de hardware

Las siguientes cifras son estimaciones de ingenieria derivadas del recuento de parametros (110,28B) y no proceden de documentacion oficial del modelo, que no existe en la informacion disponible.

- VRAM estimada para inferencia, solo pesos: en fp16/bf16 unos 220 GB; en int8 unos 110 GB; en int4 unos 55-60 GB. Hay que sumar la memoria de la cache KV, que depende de la longitud de contexto (no disponible) y del numero de capas y cabezas (no disponible).
- GPU recomendadas para fp16: 3x H100 80 GB o 4x A100 80 GB como minimo, con tensor parallelism.
- GPU recomendadas para int8: 2x H100 80 GB o 2x A100 80 GB.
- GPU recomendadas para int4: una configuracion de 1x H100 80 GB o 1x A100 80 GB podria resultar suficiente solo para los pesos, con margen ajustado para la cache KV.
- Viabilidad en GPU de consumo: en int4 muy agresivo podria intentarse en una RTX 4090 (24 GB) unicamente con descarga parcial de capas a CPU o disco, con latencia muy alta; no es una opcion practica para produccion ni para uso interactivo. En RTX 3090/4090 no cabe en memoria de forma completa.
- Opciones de despliegue: vLLM o TGI para servido con tensor parallelism; llama.cpp u Ollama requeririan una conversion a GGUF que no se distribuye en el repositorio y que, ademas, exigiria soportar `custom_code`, lo que complica la conversion.
- Latencia y throughput estimados: no disponibles. Dependen del numero de parametros activos por token, del grado de paralelismo y del hardware, datos que no se han publicado.

## Comparativa con modelos similares

Los datos de la columna de este modelo son los unicos verificados en la informacion proporcionada. Los de los modelos de comparacion proceden de conocimiento publico general sobre sus fichas tecnicas, no de la busqueda web realizada, y se incluyen solo como referencia de categoria.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| teutonic-II-110B-A7B-reign-22 | 110,28B | no disponible (~7B segun nombre, sin confirmar) | no disponible | no disponible | gated, 4 descargas |
| Mixtral 8x22B | ~141B | ~39B | 64k | Apache 2.0 | publica |
| Qwen3-235B-A22B | ~235B | ~22B | 128k | Apache 2.0 | publica |
| Llama 4 Scout | ~109B | ~17B | 10M | licencia Llama 4 | publica con aceptacion |

No se dispone de datos de rendimiento comparativo para el modelo analizado, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad. En terminos de adoptacion, la diferencia es muy acusada: los modelos de referencia acumulan miles o millones de descargas, frente a las 4 del modelo analizado.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay ninguna evidencia verificable de calidad, por lo que no debe asumirse ningun nivel de rendimiento.
- Licencia no disponible: sin licencia explicita, no se puede asumir permiso de uso comercial, redistribucion ni modificacion. Cualquier uso en produccion es juridicamente arriesgado hasta que se aclare.
- Acceso restringido (gated): requiere aceptar condiciones en HuggingFace, lo que anade friccion para evaluacion y para integracion en pipelines automatizados.
- Codigo personalizado (`custom_code`): la carga con `trust_remote_code=True` ejecuta codigo del repositorio, lo que introduce riesgo de seguridad si el modelo se integra en entornos de produccion.
- Idiomas no declarados: no se puede asumir soporte de castellano ni de ningun otro idioma concreto; hay que validarlo empiricamente.
- Longitud de contexto desconocida: impide planificar casos de uso que dependan de ventanas largas (documentos extensos, conversaciones multi-turno largas).
- Riesgo de alucinacion: no cuantificado ni documentado, pero presente en cualquier modelo generativo sin evaluacion publica; en ausencia de datos, debe tratarse como riesgo alto.
- Sesgos conocidos: no documentados. El entrenamiento descentralizado puede amplificar sesgos presentes en datasets heterogeneos y poco curados, pero no hay informacion que lo confirme ni lo descarte.
- Adoptacion practicamente nula: 4 descargas y 0 likes indican ausencia de validacion por parte de la comunidad y de ecosistema de herramientas, adaptadores o cuantizaciones comunitarias.
- Sin versiones cuantizadas publicadas: la ausencia de GGUF, AWQ o GPTQ complica el despliegue en hardware asequible y obliga a realizar la conversion y su validacion por cuenta propia.
- Fecha de creacion futura respecto a la mayoria de referencias del ecosistema: conviene verificar que el repositorio siga accesible y actualizado antes de planificar cualquier trabajo sobre el.

## Enlaces

- HuggingFace: https://huggingface.co/hanswalt/teutonic-II-110B-A7B-reign-22
- Paper, blog, repositorio o demo oficiales: no disponibles en la informacion proporcionada.
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante. Las URLs devueltas por la busqueda corresponden a paginas sobre senalizacion de aparcamientos y normativa vial en lituano, sin relacion alguna con el modelo.
