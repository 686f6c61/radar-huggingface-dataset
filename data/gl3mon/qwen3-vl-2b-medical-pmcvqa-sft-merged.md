# GL3MON/qwen3-vl-2b-medical-pmcvqa-sft-merged

## Resumen

GL3MON/qwen3-vl-2b-medical-pmcvqa-sft-merged es un ajuste fino (fine-tuning) del modelo multimodal GL3MON/qwen3-vl-2b-medical-sft, a su vez derivado de la familia Qwen3-VL en su variante de 2B parametros. El autor, GL3MON, lo publica bajo licencia Apache-2.0 y lo orienta a tareas de "image-text-to-text", es decir, generacion de texto condicionada por una o varias imagenes de entrada. El sufijo del nombre (pmcvqa) apunta a un entrenamiento supervisado sobre datos de pregunta-respuesta visual de ambito biomedico, presumiblemente vinculados a PubMed Central, aunque la model card no detalla el corpus utilizado.

El modelo tiene 2.127.532.032 parametros (aproximadamente 2,13 mil millones) y un repositorio de 4,3 GB en formato safetensors, coherente con pesos en bf16/fp16. Es un modelo denso, no MoE, y su tamano reducido lo hace desplegable en GPUs de consumo, lo que resulta relevante para prototipos de investigacion clinica o educacion medica sin infraestructura dedicada. La model card es minima: no incluye resultados de benchmarks, ni composicion del dataset, ni detalles de hiperparametros.

La relevancia actual del modelo radica en su combinacion de tres factores: es multimodal (vision + lenguaje), esta especializado en dominio medico (VQA clinico) y es lo bastante pequeno para inferencia local. Con 19 descargas y 0 "likes" en el momento de la consulta, se trata de una publicacion de nicho y poco validada por la comunidad, por lo que debe tratarse como material experimental y no como un componente listo para produccion clinica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-language) de la familia Qwen3-VL; encoder de vision mas decodificador de lenguaje. Detalle de capas y atencion no disponible |
| Parametros totales | 2.127.532.032 (aproximadamente 2,13B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible. El repositorio solo publica pesos en safetensors; el tamano (4,3 GB) es consistente con bf16/fp16 |
| Idiomas soportados | Ingles (en), segun los metadatos del repositorio |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a Qwen3-VL, un modelo transformer multimodal que procesa imagenes mediante un encoder visual y las proyecta al espacio del decodificador de lenguaje para generar texto de forma autorregresiva. El repositorio declara los tags `qwen3_vl`, `image-text-to-text` y `safetensors`, lo que confirma la topologia vision-lenguaje, pero no aporta informacion sobre el numero de capas, la dimension oculta, el tamano del encoder visual ni el mecanismo de atencion empleado. Tampoco se detalla la ventana de contexto efectiva de este ajuste concreto.

En cuanto al entrenamiento, la model card indica unicamente que el modelo se entreno "2x mas rapido" con Unsloth y la libreria TRL de Hugging Face, lo que sugiere un ajuste fino supervisado (SFT) mediante LoRA o QLoRA posteriormente fusionado en los pesos base, de ahi el sufijo "merged" en el identificador. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, la resolucion de las imagenes, la presencia de RLHF/DPO ni los hiperparametros. El nombre del repositorio apunta a un dataset de VQA medica tipo PMC-VQA, pero esto no puede confirmarse con la informacion disponible, por lo que cualquier afirmacion al respecto seria especulativa.

## Capacidades

- Generacion de texto condicionada por imagen (image-text-to-text): responde a preguntas formuladas en lenguaje natural sobre el contenido de una o varias imagenes.
- Respuesta a preguntas visuales en dominio medico (VQA clinico), presumiblemente sobre figuras, graficos y radiologia procedentes de literatura biomedica, segun indica el nombre del modelo.
- Generacion de texto conversacional: el tag `conversational` indica formato de chat con turnos de usuario y asistente.
- Compatibilidad con Text Generation Inference (TGI): el repositorio esta marcado como `endpoints_compatible`, por lo que puede servirse mediante la pila de inferencia de Hugging Face.
- Capacidades multilingues: no acreditadas. Los metadatos declaran exclusivamente ingles.
- Tool calling / function calling: no documentado en la model card. Aunque el modelo base Qwen3-VL incluye soporte de herramientas, no hay evidencia de que este ajuste fino medico lo conserve.
- Comportamiento agente o razonamiento multi-paso: no documentado.
- Modo "thinking" explicito, audio o video: no documentado.

## Casos de uso

- Investigacion en VQA medica: uso del modelo como linea base para experimentos de pregunta-respuesta sobre figuras de articulos cientificos, comparando resultados con otros modelos de vision-lenguaje de tamano similar.
- Anotacion asistida de datasets biomedicos: generacion de descripciones y respuestas preliminares sobre imagenes medicas que despues se revisan manualmente, reduciendo el coste de anotacion en proyectos de investigacion.
- Educacion medica: construccion de un asistente de estudio que responda preguntas sobre diagramas anatomicos, graficos de curvas de supervivencia o imagenes histologicas en un entorno de practica, siempre con supervision docente.
- Prototipado de bajo coste en entornos con recursos limitados: al tratarse de un modelo de 2,13B parametros, permite desplegar un prototipo multimodal en una unica GPU de consumo o incluso en portatiles con GPU discreta.
- Extraccion de informacion de documentos cientificos: procesamiento de paginas con figuras y tablas para generar resumenes textuales que alimenten indices de busqueda internos.
- Evaluacion de tecnicas de ajuste fino: sirve como caso de estudio reproducible de un pipeline Unsloth + TRL con fusion de adaptadores, util para equipos que quieran replicar el flujo con sus propios datos medicos.
- Preseleccion de casos en revision de literatura: filtrado semiautomatico de figuras potencialmente relevantes en revisiones sistematicas, con validacion humana obligatoria posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K, VQA-RAD, SLAKE, PMC-VQA ni de ningun otro conjunto de evaluacion, y la busqueda web realizada no devolvio resultados relacionados con el modelo.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: aproximadamente 4,3 GB solo para los pesos, mas el coste de activaciones y del encoder visual; en la practica, entre 6 y 8 GB para inferencia con lote pequeno.
- VRAM estimada en int8: alrededor de 2,5 a 3 GB de pesos, con un total practico en torno a 4 a 5 GB.
- VRAM estimada en int4: alrededor de 1,5 a 2 GB de pesos, con un total practico de 3 a 4 GB, siempre que existan pesos cuantizados disponibles (no publicados en el repositorio).
- GPU de consumo: cabe con holgura en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090. En tarjetas de 8 GB (RTX 3070, RTX 4060) es viable en fp16 con lote pequeno o en cuantizacion de 8 bits.
- GPU de datacenter: A100, H100, L40S y A10G son mas que suficientes; resultan sobredimensionadas salvo que se busque throughput alto con lotes grandes.
- Opciones de despliegue: transformers (libreria declarada), Text Generation Inference (tag `endpoints_compatible`), vLLM (si la version soporta la arquitectura Qwen3-VL), y llama.cpp/Ollama unicamente si se generan pesos GGUF, que no estan incluidos en el repositorio.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento publicado |
|---|---|---|---|---|---|
| GL3MON/qwen3-vl-2b-medical-pmcvqa-sft-merged | 2,13B | No disponible | Apache-2.0 | Hugging Face, safetensors, 19 descargas | No disponible |
| GL3MON/qwen3-vl-2b-medical-sft (modelo base del ajuste) | No disponible | No disponible | No disponible | Hugging Face | No disponible |
| Qwen3-VL-2B (modelo original de la familia) | Orden de 2B | No disponible | Apache-2.0 | Hugging Face, ampliamente distribuido | No disponible en la informacion proporcionada |
| Modelos de VQA medica de tamano comparable (por ejemplo, variantes LLaVA-Med o SmolVLM ajustadas) | No disponible | No disponible | Variable segun modelo | Hugging Face | No disponible |

No se dispone de datos verificados de rendimiento ni de especificaciones completas de los modelos alternativos en la informacion proporcionada, por lo que la comparativa se limita a parametros y licencia del modelo objeto de esta ficha.

## Limitaciones y advertencias

- Model card practicamente vacia: no documenta dataset, hiperparametros, proceso de evaluacion ni limitaciones conocidas, lo que impide auditar el ajuste.
- Riesgo elevado de alucinacion en dominio clinico: un modelo de 2B parametros ajustado sobre un corpus no especificado puede generar descripciones plausibles pero incorrectas de hallazgos radiologicos o histologicos.
- Sesgos: no evaluados. Al no declararse la composicion del dataset de entrenamiento, no puede descartarse un sesgo de seleccion derivado de las fuentes (por ejemplo, sobrerrepresentacion de ciertas modalidades de imagen o poblaciones).
- Idioma: solo se declara ingles. El rendimiento en castellano no esta documentado y previsiblemente sera inferior.
- Contexto: se desconoce la ventana de contexto efectiva de este ajuste, lo que complica el diseno de aplicaciones con documentos largos o multiples imagenes.
- Uso clinico: no debe emplearse para diagnostico, triaje ni decision terapeutica. No consta certificacion regulatoria ni validacion clinica de ningun tipo.
- Adopcion comunitaria minima: 19 descargas y 0 "likes" sugieren que el modelo no ha sido replicado ni validado por terceros.
- Licencia Apache-2.0: permite uso comercial y modificacion con atribucion, pero no exime de las obligaciones regulatorias aplicables a software sanitario (por ejemplo, MDR en la Union Europea si se usa con finalidad medica).
- Dependencia del modelo base: si el repositorio GL3MON/qwen3-vl-2b-medical-sft se elimina o cambia, la trazabilidad del ajuste queda comprometida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GL3MON/qwen3-vl-2b-medical-pmcvqa-sft-merged
- Modelo base del ajuste: https://huggingface.co/GL3MON/qwen3-vl-2b-medical-sft
- Unsloth (framework de entrenamiento citado): https://github.com/unslothai/unsloth
- TRL de Hugging Face (libreria de entrenamiento citada): https://github.com/huggingface/trl
- La busqueda web realizada no devolvio enlaces relevantes sobre este modelo: los resultados obtenidos correspondian a un medio de noticias economicas y no guardaban relacion con la consulta.
