# eneotu/llama-3-11B-vision_radiology

## Resumen

`eneotu/llama-3-11B-vision_radiology` es un ajuste fino (fine-tuning) del modelo multimodal Llama 3.2 11B Vision Instruct, publicado por el usuario eneotu bajo licencia Apache 2.0. El modelo parte concretamente de la version cuantizada en 4 bits de Unsloth (`unsloth/llama-3.2-11b-vision-instruct-unsloth-bnb-4bit`) y ha sido entrenado con el conjunto de datos `unsloth/Radiology_mini`, orientado a imagenes y textos de radiologia. Se trata, por tanto, de un modelo de vision-lenguaje (VLM) especializado en dominio clinico-radiologico, no de un modelo de proposito general.

La arquitectura heredada es `mllama`, la implementacion de Llama 3.2 Vision que combina un codificador de vision con la torre de texto de Llama 3.2 y capas de atencion cruzada para inyectar las caracteristicas visuales. El modelo base tiene 11 000 millones de parametros y capacidad multimodal imagen-texto en ingles. El ajuste se realizo con Unsloth, que segun la propia model card permite un entrenamiento aproximadamente 2 veces mas rapido, y con la libreria TRL.

Su relevancia es limitada pero concreta: es un ejemplo de adaptacion de un VLM abierto a un dominio altamente especializado (radiologia) con recursos minimos, y sirve como punto de partida reproducible para quien quiera repetir el flujo con su propio dataset medico. Hay que subrayar que el repositorio no incluye resultados de benchmarks, no tiene descargas ni valoraciones, y el tamano del repositorio (0,2 GB) sugiere que contiene adaptadores en lugar de pesos completos; cualquier uso en produccion clinica requiere validacion independiente y no esta respaldado por evidencia publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | mllama (transformer multimodal: codificador de vision + torre de texto Llama 3.2 + atencion cruzada) |
| Parametros totales | 11 000 millones (heredados del modelo base Llama 3.2 11B Vision; cifra no explicitada en la model card) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3.2 11B Vision documenta 128 000 tokens, dato no confirmado en esta ficha) |
| Tipos de cuantizacion | El modelo de partida esta cuantizado en 4 bits con bitsandbytes (bnb-4bit); no se documentan otras cuantizaciones del ajuste |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | unsloth/llama-3.2-11b-vision-instruct-unsloth-bnb-4bit |
| Dataset de ajuste | unsloth/Radiology_mini |
| Tamano del repositorio | 0,2 GB |
| Libreria | transformers |
| Descargas / valoraciones | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado del VLM Llama 3.2 11B Vision Instruct. La arquitectura `mllama` combina dos torres: un codificador de vision que procesa las imagenes de entrada y una torre de texto basada en Llama 3.2, unidas mediante capas de atencion cruzada que permiten al decodificador de texto consultar las representaciones visuales. Esta diseno mantiene el rendimiento de texto del modelo original a la vez que anade comprension de imagenes en una unica pasada, sin necesidad de proyectores externos tipo MLP como en otras familias de VLM.

El entrenamiento se realizo con Unsloth y TRL sobre el dataset `unsloth/Radiology_mini`, un conjunto reducido de imagenes radiologicas con texto asociado. La model card no especifica el numero de tokens de entrenamiento, la composicion exacta del dataset, la receta de ajuste (LoRA, QLoRA, rango, tasa de aprendizaje) ni si hubo fases posteriores de RLHF o DPO. Tampoco se documenta ninguna innovacion tecnica propia mas alla del uso de Unsloth para acelerar el entrenamiento. El tamano del repositorio (0,2 GB) es coherente con un adaptador LoRA sobre el modelo base cuantizado, lo que implica que para inferencia en precision completa probablemente sea necesario descargar el modelo base por separado y fusionar los pesos; este punto no esta confirmado en la model card.

## Capacidades

- Generacion de texto e inferencia multimodal imagen-texto en ingles, heredadas del modelo base Llama 3.2 11B Vision Instruct.
- Descripcion y analisis de imagenes radiologicas, tras el ajuste sobre `Radiology_mini`.
- Razonamiento sobre contenido visual con el que se le presente (radiografias, y potencialmente otras imagenes, aunque el ajuste esta sesgado al dominio radiologico).
- Conversacion multi-turno con contexto de imagen, en la medida en que lo permita la ventana de contexto del modelo base.
- Soporte de las capacidades de instruccion del modelo original: resumen, extraccion de informacion, pregunta-respuesta sobre documentos, redaccion.
- Compatibilidad declarada con `text-generation-inference` y con endpoints, segun las etiquetas del repositorio.
- Capacidades de tool calling / function calling y de agentes: no confirmadas en la informacion disponible para este ajuste (el modelo base Llama 3.2 incluye soporte de llamadas a funciones, pero no hay evidencia de que el ajuste lo preserve).
- Capacidades multilingues: limitadas al ingles segun el campo `language` del repositorio.
- Capacidades de audio, video o thinking mode: no disponibles.
- No se documenta ningun modo especial de razonamiento extendido ni decodificacion especulativa propia.

## Casos de uso

- Triaje y pre-informe radiologico en investigacion: el modelo puede recibir una radiografia y generar una descripcion textual en ingles que sirva como borrador para revision por un especialista humano. Es adecuado porque el ajuste se ha realizado especificamente sobre terminologia e imagenes radiologicas, aunque nunca debe usarse como diagnostico autonomo.
- Generacion automatica de informes (report generation) en ingles: dado un estudio de imagen, producir un texto estructurado con hallazgos y descripcion. Encaja en el dominio del dataset de ajuste y en la modalidad imagen-texto del modelo base.
- Prototipado de asistentes clinicos multimodales: integrado con vLLM o TGI detras de una API, el modelo puede gestionar conversaciones en las que el usuario adjunta imagenes y hace preguntas de seguimiento, aprovechando el contexto largo del modelo base.
- Punto de partida para ajustes propios en dominio medico: al ser un ejemplo reproducible de fine-tuning con Unsloth y TRL sobre un dataset radiologico pequeno, sirve de plantilla para equipos que quieran adaptar un VLM a su propia especialidad (cardiologia, patologia, dermatologia) con recursos modestos.
- Evaluacion comparativa de VLM medicos: util como referencia de base en experimentos que midan hasta que punto un ajuste ligero mejora a un VLM generalista en tareas de radiologia, siempre que se construya un conjunto de evaluacion propio, ya que no hay benchmarks publicados.
- Filtrado y anotacion semiautomatica de conjuntos de datos medicos: usar el modelo para generar descripciones preliminares de imagenes que luego se revisan y corrigen manualmente, acelerando la creacion de datasets etiquetados.
- Docencia y divulgacion medica: generar explicaciones en ingles de hallazgos visibles en una imagen para material formativo, con supervision editorial obligatoria.
- Integracion en pipelines de CI/CD de investigacion: las etiquetas del repositorio (`text-generation-inference`, `endpoints_compatible`) permiten desplegarlo como servicio contenerizado y ejecutar pruebas automaticas de regresion sobre conjuntos de imagenes de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K, VQA-RAD, SLAKE ni de ninguna otra tarea, y no se ha publicado ningun informe de evaluacion asociado al repositorio. Cualquier cifra de rendimiento que se quiera utilizar debe obtenerse mediante evaluacion propia sobre un conjunto de validacion radiologico independiente.

## Requisitos de hardware

- VRAM estimada en bf16/fp16 (pesos completos del modelo base de 11 000 millones de parametros): en torno a 22-24 GB solo para pesos, mas el overhead del codificador de vision y de la cache KV, por lo que se recomienda disponer de 40 GB o mas. Estas cifras son estimaciones a partir del tamano del modelo base, no datos publicados para este ajuste.
- VRAM estimada en 4 bits (bitsandbytes): aproximadamente 6-8 GB de pesos, lo que permite ejecucion en GPUs de consumo. Estimacion orientativa.
- GPUs recomendadas para precision completa: A100 40/80 GB, H100, L40S. Para cuantizacion en 4 bits: RTX 3090, RTX 4090, RTX A6000, e incluso tarjetas de 12-16 GB como RTX 3060 12 GB o RTX 4070 Ti Super, con margen ajustado.
- Cabe en GPU de consumo: si, previsiblemente en configuracion de 4 bits sobre GPUs de 12 GB o mas. No confirmado con mediciones publicadas.
- Opciones de despliegue: transformers (libreria declarada en el repositorio), text-generation-inference (etiqueta del repositorio), vLLM, y TGI-compatible endpoints. No hay conversiones GGUF publicadas, por lo que llama.cpp u Ollama requeririan generar la conversion manualmente. Unsloth es la herramienta declarada para entrenamiento, no necesariamente para inferencia en produccion.
- Latencia y throughput estimados: no disponibles. No se ha publicado ningun dato de tokens por segundo, tiempo hasta el primer token ni rendimiento bajo carga concurrente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad | Benchmarks publicados |
|---|---|---|---|---|---|---|
| eneotu/llama-3-11B-vision_radiology | 11 000 M (base) | no disponible | Si (imagen-texto) | apache-2.0 (declarada) | HuggingFace, 0 descargas | No |
| unsloth/llama-3.2-11b-vision-instruct-unsloth-bnb-4bit (modelo base) | 11 000 M | 128 000 tokens (documentado por el autor del modelo base) | Si (imagen-texto) | sujeta a Llama 3.2 Community License | HuggingFace, ampliamente utilizado | Si, en la documentacion de Meta |
| Llama 3.2 11B Vision Instruct (original de Meta) | 11 000 M | 128 000 tokens | Si (imagen-texto) | Llama 3.2 Community License | Distribucion oficial de Meta | Si |
| Alternativas de VLM medico abierto (p. ej. LLaVA-Med, MedGemma) | no disponible | no disponible | Si | no disponible | HuggingFace | no disponible |

La comparacion relevante es contra el propio modelo base: este ajuste no anade parametros ni cambia la arquitectura, solo modifica los pesos mediante fine-tuning sobre un dataset radiologico reducido. No se dispone de datos que permitan afirmar que mejora al modelo base en ninguna tarea concreta.

## Limitaciones y advertencias

- No es un producto sanitario. No ha sido validado clinicamente, no cuenta con marcado CE ni autorizacion FDA, y no debe utilizarse para diagnostico, triaje clinico real ni decision terapeutica.
- Riesgo elevado de alucinacion en dominio medico: los VLM pueden describir hallazgos inexistentes o inventar terminologia radiologica plausible. En un contexto clinico, un falso negativo o un falso positivo tienen consecuencias graves.
- Ausencia total de evaluacion publicada: sin benchmarks, sin conjunto de validacion documentado y con 0 descargas y 0 valoraciones, no hay evidencia externa de calidad ni de comportamiento.
- Sesgo de dominio y de dataset: el ajuste se realizo unicamente sobre `unsloth/Radiology_mini`, un conjunto de tamano reducido. El modelo puede degradarse en modalidades de imagen distintas (TAC, resonancia, ecografia) o en poblaciones no representadas en el dataset.
- Limitacion idiomatica: solo ingles segun el campo `language`. La generacion en castellano no esta soportada ni evaluada y previsiblemente sera de menor calidad.
- Incertidumbre sobre el contenido real del repositorio: el tamano de 0,2 GB sugiere adaptadores en lugar de pesos completos, pero la model card no lo aclara. Verificar antes de intentar cargarlo directamente con `transformers`.
- Ambiguedad de licencia: la model card declara apache-2.0, pero el modelo base Llama 3.2 esta sujeto a la Llama 3.2 Community License, con condiciones adicionales (por ejemplo, obligaciones de atribucion y restricciones para productos con mas de 700 millones de usuarios mensuales). Conviene revisar la compatibilidad antes de un uso comercial.
- Dependencia del modelo base: si el repositorio contiene solo adaptadores, es imprescindible descargar `unsloth/llama-3.2-11b-vision-instruct-unsloth-bnb-4bit`, lo que anade requisitos de hardware y de almacenamiento.
- Trazabilidad limitada: autor individual, sin publicacion tecnica, sin paper y sin repositorio de codigo asociado; no se documenta la receta de entrenamiento.
- No se ha confirmado el soporte de tool calling, agentes ni razonamiento multi-paso en este ajuste concreto.
- La informacion de busqueda web disponible no contiene resultados utiles sobre este modelo: las referencias recuperadas corresponden a sitios no relacionados (Zhihu, Covers.com), por lo que no aportan contexto adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/eneotu/llama-3-11B-vision_radiology
- Modelo base: https://huggingface.co/unsloth/llama-3.2-11b-vision-instruct-unsloth-bnb-4bit
- Dataset de ajuste: https://huggingface.co/datasets/unsloth/Radiology_mini
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Paper o informe tecnico del modelo: no disponible
- Demo o space asociado: no disponible
- Repositorio de codigo del autor: no disponible
