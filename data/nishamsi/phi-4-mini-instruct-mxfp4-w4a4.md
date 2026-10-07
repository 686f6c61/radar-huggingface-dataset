# nishamsi/Phi-4-mini-instruct-MXFP4-W4A4

## Resumen

Phi-4-mini-instruct-MXFP4-W4A4 es una versión cuantizada del modelo microsoft/Phi-4-mini-instruct, publicada por el usuario nishamsi. Se trata de un checkpoint de un modelo denso de la familia Phi-4, orientado a entornos con memoria y cómputo restringidos, que ha sido comprimido en formato MXFP4 con cuantización tanto de pesos como de activaciones (W4A4) mediante la librería compressed-tensors. El resultado es un repositorio de 4,2 GB con ficheros de pesos de 3,884 GiB, frente al peso en BF16 del modelo original.

El modelo base pertenece a Microsoft y está diseñado para razonamiento denso, con especial énfasis en matemáticas y lógica, y admite una longitud de contexto de 128.000 tokens. Fue entrenado sobre datos sintéticos y sitios web públicos filtrados, y posteriormente sometido a ajuste supervisado y optimización directa de preferencias (DPO) para mejorar el seguimiento de instrucciones. La licencia del modelo base, MIT, se conserva en esta versión cuantizada, lo que permite uso comercial sin restricciones de atribución más allá del aviso de copyright.

La relevancia de esta ficha es práctica: la cuantización MXFP4 a 4 bits en pesos y activaciones reduce el espacio en disco y abre la puerta a inferencia en GPUs de gama media, pero también introduce requisitos técnicos estrictos (versiones concretas de Transformers y compressed-tensors, código personalizado) y un aviso explícito del autor de que la inferencia estándar no está garantizada. No se han publicado resultados de benchmarks para esta variante cuantizada, por lo que la evaluación de la pérdida de calidad respecto al modelo original queda pendiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (tag `phi3`; arquitectura del modelo base Phi-4-mini) |
| Parametros totales | 4.450.618.368 segun safetensors del repositorio; el modelo base declara 3.800 millones |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base; no verificada para esta variante) |
| Tipos de cuantizacion | MXFP4 W4A4: pesos en coma flotante de 4 bits con grupos de 32; activaciones de entrada dinamicas en coma flotante de 4 bits con grupos de 32; capas lineales cuantizadas excluyendo `lm_head`; embeddings y cabeza de salida en BF16 |
| Idiomas soportados | No disponible |
| Licencia | MIT (licencia del modelo base incluida textualmente, junto con NOTICE.md) |
| Formato de pesos | Safetensors con formato `mxfp4-pack-quantized`; 3,884 GiB de ficheros de pesos; repositorio de 4,2 GB |
| Version de configuracion guardada | compressed-tensors 0.14.0.1; Transformers 4.57.6 |
| Modelo base | microsoft/Phi-4-mini-instruct (relacion: cuantizado) |
| Receta de conversion | `QuantizationModifier` con `scheme="MXFP4"`, `targets=["Linear"]`, `ignore=["lm_head"]`; sin calibracion |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Phi-4-mini de Microsoft: un transformer decoder-only denso con atención por causalidad, perteneciente a la familia Phi-4 y etiquetado con el identificador de arquitectura `phi3` en el ecosistema Transformers. El modelo base fue entrenado sobre una mezcla de datos sinteticos y sitios web publicos filtrados, con un enfoque declarado en datos de alta calidad y densidad de razonamiento. El proceso de entrenamiento incluyo ajuste supervisado (SFT) y optimizacion directa de preferencias (DPO) para mejorar la precision en el seguimiento de instrucciones. No se dispone en la informacion proporcionada del numero exacto de tokens de entrenamiento, la composicion detallada del dataset ni la configuracion de la fase de alineamiento.

Sobre esta base, el autor aplica una cuantizacion de tipo MXFP4 W4A4 sin calibracion, usando el modificador de cuantizacion de compressed-tensors. Los pesos de las capas lineales se almacenan en coma flotante de 4 bits con escala compartida por grupos de 32 elementos, y las activaciones de entrada se cuantizan de forma dinamica tambien a 4 bits en grupos de 32. El `lm_head` queda excluido de la cuantizacion, y tanto los embeddings como la cabeza de salida se mantienen en BF16. Los pesos se guardan en el formato empaquetado `mxfp4-pack-quantized`. La innovacion tecnica principal es, por tanto, la propia cuantizacion de activaciones a 4 bits, un regimen agresivo que reduce el ancho de banda de memoria en inferencia pero que puede afectar a la fidelidad numerica si no se dispone de kernels nativos que exploten el formato.

## Capacidades

- Generacion de texto conversacional y seguimiento de instrucciones multi-turno, con plantilla de chat aplicada mediante `apply_chat_template`.
- Razonamiento matematico y logico, segun el enfoque declarado del modelo base en datos densos de razonamiento.
- Generacion y asistencia en codigo, heredada del modelo base Phi-4-mini.
- Ventana de contexto larga de hasta 128.000 tokens, adecuada para documentos extensos y conversaciones prolongadas.
- Capacidades multilingues heredadas del modelo base; la lista concreta de idiomas no esta disponible en la informacion proporcionada.
- No se documenta en la informacion disponible soporte explicito de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito (thinking mode).
- La etiqueta `custom_code` indica que el checkpoint requiere codigo personalizado para su carga, y el autor marca `inference: false`, por lo que no se garantiza el funcionamiento mediante el pipeline estandar.

## Casos de uso

- Asistente conversacional en local para equipos de desarrollo: con 3,884 GiB de pesos empaquetados, el modelo puede desplegarse en una estacion de trabajo con una unica GPU de gama media para prototipar asistentes internos sin enviar datos a servicios externos.
- Analisis de documentos largos: la ventana de 128.000 tokens del modelo base permite procesar informes, contratos o expedientes completos en una sola pasada, resumiendo o extrayendo datos estructurados sin fragmentar el texto.
- Generacion de codigo en entornos con recursos limitados: el modelo base esta orientado a tareas de programacion, y la version cuantizada reduce el coste de memoria, lo que permite integrarlo en herramientas de autocompletado o revision de parches en maquinas de desarrollo.
- Razonamiento matematico asistido: util para resolver problemas paso a paso en entornos educativos o de verificacion de calculos, aprovechando el entrenamiento del modelo base en datos densos de matematicas y logica.
- Investigacion sobre cuantizacion: este checkpoint sirve como material de estudio para medir la degradacion de calidad de un esquema W4A4 (pesos y activaciones a 4 bits) frente al modelo original en BF16, usando la receta y los scripts publicos del autor.
- Clasificacion y etiquetado de texto por lotes: al reducir el peso en disco, es viable ejecutar procesos de etiquetado nocturno sobre grandes volumenes de texto en una sola GPU, siempre que se valide la calidad frente al modelo sin cuantizar.
- Despliegue en edge o entornos air-gapped: la licencia MIT y la ausencia de dependencias de API externas permiten distribuir el modelo dentro de infraestructura aislada, sujeto a la validacion de las versiones exactas de libreria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye tablas de evaluacion (MMLU, HumanEval, GSM8K ni similares) para esta variante cuantizada, y tampoco se han localizado resultados de terceros en los resultados de busqueda consultados. No se deben extrapolar las cifras del modelo base sin cuantizar, ya que una cuantizacion W4A4 de activaciones puede alterar el comportamiento de forma apreciable.

## Requisitos de hardware

- VRAM estimada con el formato empaquetado: en torno a 3,9-4,5 GB solo para pesos. A ello hay que anadir el cache KV y las activaciones, que a contextos largos pasan a ser el factor dominante; no se dispone de cifras oficiales desglosadas.
- Advertencia importante: la ruta de referencia en Transformers con `CompressedTensorsConfig(run_compressed=False)` expande los pesos empaquetados para su ejecucion y aplica la cuantizacion configurada. En ese modo, la memoria necesaria se aproxima a la del modelo en BF16 (del orden de 9 GB solo para pesos), por lo que la ventaja de la cuantizacion no se materializa en memoria, solo en disco.
- GPU recomendadas: no disponible en la informacion proporcionada. El uso de kernels MXFP4 nativos depende de la generacion de GPU y del soporte del runtime; no se documenta en la model card.
- Compatibilidad con GPU de consumo: probable en tarjetas con 8-12 GB o mas si se dispone de una ruta de ejecucion que mantenga los pesos empaquetados; no confirmado por el autor, que marca `inference: false`.
- Opciones de despliegue: la ruta documentada es Transformers 4.57.6 con compressed-tensors 0.14.0.1 y accelerate. No se confirma compatibilidad con vLLM, TGI, llama.cpp u Ollama en la informacion disponible; el tag `text-generation-inference` aparece en los metadatos del repositorio, pero no hay evidencia de soporte verificado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Tamano de pesos | Licencia | Observaciones |
|---|---|---|---|---|---|---|
| nishamsi/Phi-4-mini-instruct-MXFP4-W4A4 | 4,45 B segun safetensors (base: 3,8 B) | 128.000 tokens (heredado) | MXFP4 W4A4 empaquetado (`mxfp4-pack-quantized`) | 3,884 GiB | MIT | Requiere compressed-tensors 0.14.0.1 y Transformers 4.57.6; inferencia no garantizada |
| microsoft/Phi-4-mini-instruct | 3,8 B | 128.000 tokens | Safetensors en BF16 | No disponible en la informacion recopilada | MIT | Modelo de referencia sin cuantizar; SFT + DPO |
| Otras cuantizaciones de Phi-4-mini (INT4, AWQ, GPTQ) | No disponible | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificados en la informacion proporcionada |

## Limitaciones y advertencias

- El autor marca explicitamente `inference: false`, lo que indica que no garantiza el funcionamiento mediante el pipeline estandar de Transformers.
- La carga requiere codigo personalizado (tag `custom_code`) y versiones exactas y fijadas de librerias: Transformers 4.57.6 y compressed-tensors 0.14.0.1. Cambios de version pueden romper la carga del checkpoint.
- La cuantizacion W4A4 aplica 4 bits tanto a pesos como a activaciones, un regimen agresivo que puede degradar la calidad respecto al modelo base. No hay benchmarks publicados que cuantifiquen esta perdida.
- La ruta de referencia en Transformers expande los pesos empaquetados, por lo que no se obtiene la reduccion de memoria esperada de un esquema de 4 bits.
- Riesgo de alucinacion inherente a los modelos de lenguaje de este tamano, especialmente en tareas de razonamiento largo o con datos factuales; no se documentan mitigaciones especificas.
- Sesgos conocidos: no disponible. El modelo base se entreno con datos sinteticos y web filtrada, con los sesgos potenciales asociados a ese tipo de corpus.
- Limitaciones de idioma: la lista de idiomas soportados no esta disponible. El rendimiento fuera del ingles no esta documentado.
- Advertencia de procedencia: la revision historica del modelo base utilizada para la conversion es desconocida; el autor incluye un fichero `upstream-provenance.json` con la documentacion usada para la atribucion, pero no el commit exacto. Esto dificulta la reproducibilidad completa.
- Licencia: MIT, heredada del modelo base, permite uso comercial y modificacion siempre que se conserve el aviso de copyright y el fichero NOTICE.md. No se anaden restricciones adicionales en la model card.
- Adopcion muy baja: 71 descargas y 0 favoritos en el momento de la consulta, con fechas de creacion y actualizacion en octubre de 2026. No hay senales de validacion por parte de la comunidad.
- Uso en produccion: no recomendado sin una evaluacion propia previa que compare esta variante con el modelo base en las tareas objetivo.

## Enlaces

- Modelo cuantizado en HuggingFace: https://huggingface.co/nishamsi/Phi-4-mini-instruct-MXFP4-W4A4
- Modelo base en HuggingFace: https://huggingface.co/microsoft/Phi-4-mini-instruct
- README del modelo base: https://huggingface.co/microsoft/Phi-4-mini-instruct/blob/main/README.md
- Herramientas de conversion y generacion MXFP4: https://github.com/n-shamsi/mxfp4-model-tools
- Informe tecnico de Phi-4-mini (arXiv:2503.01743): https://arxiv.org/abs/2503.01743
- Referencia NVIDIA NIM de phi-4-mini-instruct: https://docs.api.nvidia.com/nim/reference/microsoft-phi-4-mini-instruct
- Catalogo de modelos de Microsoft Foundry: https://ai.azure.com/catalog/models/Phi-4-mini-instruct
- Fichero de receta `recipe.yaml` y `upstream-provenance.json`: incluidos en el repositorio de HuggingFace del modelo cuantizado
