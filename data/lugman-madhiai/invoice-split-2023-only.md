# lugman-madhiai/invoice-split-2023-only

## Resumen

El modelo `lugman-madhiai/invoice-split-2023-only` es un ajuste fino (finetune) de tipo vision-lenguaje publicado por el usuario lugman-madhiai en HuggingFace. Se construye sobre `lugman-madhiai/invoice-split-2022` y emplea la arquitectura etiquetada como `qwen3_vl`, con 8.767.123.696 parametros totales (aproximadamente 8,77 mil millones) y un peso de repositorio de 17,5 GB en formato safetensors. La pipeline declarada es `image-text-to-text`, lo que indica que acepta imagenes y texto como entrada y genera texto como salida.

El nombre del modelo sugiere un uso especializado en el procesamiento y la separacion (splitting) de facturas, probablemente a partir de imagenes o documentos escaneados, si bien la model card no documenta la tarea, el dataset ni el procedimiento de entrenamiento. El autor indica unicamente que el entrenamiento se realizo con Unsloth y la libreria TRL de HuggingFace, con una aceleracion declarada de 2x respecto a un entrenamiento convencional. No se aportan detalles sobre composicion del dataset, numero de tokens, tecnicas de alineacion (RLHF, DPO) ni evaluaciones.

La relevancia de esta ficha es limitada en terminos de evidencia: el modelo acumula 0 descargas y 0 likes en el momento de la consulta, no publica benchmarks y su model card es practicamente un stub generado por la plantilla de Unsloth. Se trata, por tanto, de un artefacto experimental o de un checkpoint intermedio de un pipeline propio del autor, no de un modelo validado para produccion. La busqueda web no ha devuelto ningun resultado relevante sobre este modelo ni sobre su autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_vl (transformer multimodal vision-lenguaje, segun el tag del repositorio) |
| Parametros totales | 8.767.123.696 (aproximadamente 8,77 mil millones) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos safetensors; no se ofrecen variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La unica informacion tecnica disponible es el tag `qwen3_vl`, que situa el modelo en la familia Qwen3-VL de modelos multimodales con encoder de vision y decodificador de lenguaje. El recuento real de parametros extraido de los safetensors (8.767.123.696) es coherente con un modelo denso de clase 8B, y el tamano del repositorio (17,5 GB) corresponde aproximadamente a los pesos en precision de 16 bits. No se documenta el numero de capas, la dimension oculta, el mecanismo de atencion, la resolucion de imagen soportada ni si se emplea atencion lineal o decodificacion especulativa.

Respecto al entrenamiento, la model card indica que se trata de un finetune de `lugman-madhiai/invoice-split-2022` realizado con Unsloth y TRL, con una mejora declarada de velocidad de 2x. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, el uso de LoRA/QLoRA frente a ajuste completo, ni si hubo fases de RLHF o DPO. Tampoco se detalla que diferencia a esta version "2023-only" de su predecesora "2022", mas alla de la posible restriccion del corpus de entrenamiento al ano 2023 que sugiere el nombre.

## Capacidades

- Generacion de texto condicionada por imagen (pipeline `image-text-to-text`): el modelo puede recibir una o varias imagenes junto con una instruccion de texto y producir una respuesta textual.
- Comprension de documentos visuales: por el nombre y el linaje del modelo, el caso de uso previsto es el analisis de facturas, presumiblemente la segmentacion o extraccion de sus partes.
- Modo conversacional: el repositorio incluye el tag `conversational`, lo que indica plantilla de chat con turnos de usuario y asistente.
- Compatibilidad con Text Generation Inference: el tag `text-generation-inference` y `endpoints_compatible` indican que puede desplegarse con el servidor TGI de HuggingFace y con Inference Endpoints.
- Soporte multilingue: limitado al ingles segun el campo `language` del repositorio.
- Tool calling / function calling: no disponible, no se documenta ninguna capacidad de llamada a herramientas.
- Capacidades de agente y razonamiento multi-paso: no disponible, no se documentan.
- Modo thinking, audio u otras modalidades: no disponible.

## Casos de uso

- Extraccion de campos de facturas: el modelo puede recibir la imagen de una factura y devolver texto estructurado con emisor, receptor, lineas de detalle, base imponible e IVA. Es el caso de uso coherente con el nombre del checkpoint, aunque no hay evaluacion publicada que lo respalde.
- Segmentacion de documentos multi-factura: si el modelo conserva la funcionalidad de "split" de su predecesor, permitiria separar un PDF o imagen con varias facturas en documentos individuales antes de pasarlos a un OCR o ERP.
- Clasificacion documental en un pipeline de cuentas por pagar: uso como primer filtro para distinguir facturas de albaranes, presupuestos u otros justificantes, derivando cada documento al flujo correspondiente.
- Digitalizacion de archivos historicos: el sufijo "2023-only" sugiere entrenamiento sobre un rango temporal concreto, por lo que encajaria en la reprocesado de un lote de facturas de ese ejercicio con formatos homogeneos.
- Prototipado rapido en un backend de gestion: al ser un modelo de 8B con licencia Apache 2.0, puede desplegarse en una GPU unica para validar una prueba de concepto de lectura automatica de facturas sin coste de licencia.
- Ajuste fino posterior (fine-tuning) como base: dado que el autor lo entrena con Unsloth y TRL, sirve como punto de partida para especializaciones adicionales sobre dominios contables concretos, con una GPU de 24 GB mediante QLoRA.
- Generacion de resumenes de gasto: a partir de imagenes de facturas, producir descripciones textuales agregadas para informes internos de gasto por proveedor o categoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye ninguna tabla de evaluacion (MMLU, HumanEval, GSM8K, DocVQA, OCRBench ni similares), y la busqueda web no ha devuelto documentacion tecnica asociada al modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: en torno a 17,5 GB solo para los pesos, mas la cache KV y las activaciones; en la practica se recomienda un minimo de 24 GB para lotes pequenos con imagenes de resolucion moderada.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 9 GB de pesos, con lo que cabria en GPUs de 12-16 GB.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 5 GB de pesos, viable en GPUs de 8-12 GB, si bien no se publican variantes GGUF ni AWQ listas para usar y habria que generarlas.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S 48 GB para servicio concurrente en BF16; RTX 4090 / RTX 6000 Ada de 24 GB para inferencia en BF16 con lotes pequenos o en 8 bits con mayor margen.
- Compatibilidad con GPU de consumo: si, previsiblemente en RTX 4090 (24 GB) en BF16 con poco margen, y en RTX 3090, 4080 o 4070 Ti Super si se cuantiza a 8 o 4 bits. No hay confirmacion del autor.
- Opciones de despliegue: transformers (libreria declarada), Text Generation Inference (tag explicito), HuggingFace Inference Endpoints (tag `endpoints_compatible`). vLLM, Ollama y llama.cpp no estan confirmados por el repositorio, ya que no se publican pesos GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| invoice-split-2023-only | 8,77 mil millones | no disponible | no disponible | apache-2.0 | HuggingFace, pesos safetensors |
| invoice-split-2022 (modelo base del que deriva) | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada | HuggingFace |
| Qwen3-VL (familia base) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | HuggingFace |
| Otros modelos vision-lenguaje de clase 8B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificables para establecer una comparativa cuantitativa. El modelo no publica evaluaciones, el modelo base del que parte tampoco esta documentado en la informacion facilitada y la busqueda web no ha devuelto referencias tecnicas utilizables.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni metricas de exactitud en extraccion de facturas, ni comparacion con alternativas. Cualquier uso en produccion requiere una validacion propia previa.
- Model card practicamente vacia: se limita a la plantilla de Unsloth. No se documentan dataset, hiperparametros, metodologia de ajuste ni limitaciones conocidas.
- Riesgo de alucinacion en documentos: en tareas de extraccion de campos (CIF, importes, fechas) un modelo generativo puede producir valores plausibles pero incorrectos, especialmente con imagenes de baja calidad o plantillas no vistas. Es imprescindible validacion posterior con reglas de negocio.
- Cobertura idiomatica limitada: el campo `language` solo declara ingles. No hay garantia de buen comportamiento con facturas en castellano u otros idiomas, ni con formatos regionales de fecha e importe.
- Ambito temporal restringido: el sufijo "2023-only" apunta a un entrenamiento acotado a un ejercicio concreto, lo que puede degradar el rendimiento con plantillas de otros anos.
- Adopcion nula: 0 descargas y 0 likes. No existe comunidad, issues ni soporte. El autor no ofrece repositorio de codigo ni paper.
- Licencia: apache-2.0 permite uso comercial, modificacion y redistribucion, pero conviene verificar la licencia del modelo base y de la familia Qwen3-VL subyacente, no confirmada en la informacion proporcionada.
- Proteccion de datos: el procesamiento de facturas implica tratamiento de datos personales y financieros. Un despliegue real debe cumplir el RGPD y, si se usa inferencia en la nube, evaluar la residencia de los datos.
- Contexto desconocido: al no publicarse la longitud de contexto, no es posible planificar escenarios con documentos muy largos o multiples imagenes por peticion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lugman-madhiai/invoice-split-2023-only
- Modelo base declarado: https://huggingface.co/lugman-madhiai/invoice-split-2022
- Repositorio de Unsloth (mencionado en la model card): https://github.com/unslothai/unsloth
- Libreria TRL de HuggingFace (mencionada en la model card): https://github.com/huggingface/trl
- Paper, blog o demo oficial: no disponible. La busqueda web realizada no ha devuelto ningun resultado relevante sobre este modelo, su autor o su tarea.
