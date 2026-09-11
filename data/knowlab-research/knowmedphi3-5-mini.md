# knowlab-research/KnowMedPhi3.5-mini

## Resumen

KnowMedPhi3.5-mini es un modelo de lenguaje especializado en dominio medico desarrollado por el grupo knowlab-research a partir de Phi-3.5-mini. Su construccion sigue una estrategia poco habitual: en lugar de continuar el preentrenamiento sobre grandes colecciones de literatura biomedica, se parte de un corpus mucho mas pequeno pero con conocimiento explicito y estructurado (ontologias, bases farmacologicas y recursos clinicos curados), denominado KnowMed-PT y compuesto por aproximadamente 126,2 millones de tokens. A continuacion se aplica un ajuste por instrucciones medicas con KnowMed-IT, un conjunto de 365.547 ejemplos.

El modelo se publica junto al estudio "KnowMedPhi: Expert knowledge-centred pre-training for transferable clinical language modelling" y su objetivo declarado es la investigacion en procesamiento de lenguaje natural biomedico y clinico, la evaluacion de modelos medicos y el estudio de estrategias de continued pre-training. Es relevante para desarrolladores e investigadores porque ofrece un punto de comparacion controlado entre preentrenamiento masivo sobre literatura y preentrenamiento centrado en conocimiento codificado, con licencia MIT sobre los pesos publicados.

La arquitectura de partida es la de Phi-3.5-mini (transformer denso, no MoE), el repositorio pesa 7,6 GB en safetensors y se distribuye con codigo personalizado, por lo que requiere `trust_remote_code=True`. No se han publicado en la informacion disponible ni la longitud de contexto efectiva ni resultados numericos de benchmarks, y el modelo se posiciona explicitamente como no apto para decision clinica autonoma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Phi-3.5-mini) con implementacion de codigo personalizado (`custom_code`) |
| Parametros totales | No disponible en la informacion proporcionada; el indice safetensors declara 199.680 entradas y el repositorio pesa 7,6 GB, magnitud coherente con un modelo de ~3,8B parametros en fp16, tamano que corresponde al modelo base Phi-3.5-mini |
| Parametros activos | No aplica (modelo denso, no es una arquitectura MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; heredada del modelo base |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos en safetensors, sin versiones oficiales GGUF, AWQ o GPTQ |
| Idiomas soportados | No disponible en la ficha; los corpus de entrenamiento (KnowMed-PT y KnowMed-IT) estan compuestos por fuentes mayoritariamente en ingles |
| Licencia | MIT (los recursos de origen de los corpus conservan sus propias licencias y condiciones de uso) |
| Formato de pesos | safetensors con codigo personalizado (`trust_remote_code=True`) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Phi-3.5-mini, un transformer denso de decodificacion. El autor no documenta en la informacion disponible ninguna modificacion estructural, capa adicional, atencion lineal ni mecanismo de decodificacion especulativa; el trabajo se centra en el regimen de datos, no en cambios de arquitectura. El entrenamiento se realizo con LLaMAFactory y entrenamiento distribuido con DeepSpeed, en dos etapas secuenciales.

La primera etapa es un continued pre-training sobre KnowMed-PT, corpus de aproximadamente 126,2 millones de tokens repartido asi: PathBank 62,3M, datos derivados de AGCT / SNOMED CT 33,4M, Wikipedia medica 15,9M, PMC-Patients 8,1M, DrugBank 4,5M, MONDO 1,2M y Human Phenotype Ontology 0,8M. La segunda etapa es un ajuste por instrucciones con KnowMed-IT (365.547 ejemplos), compuesto por Asclepius 158.114, AlpaCare / MedInstruct 52.002, Medical-QA 41.992, racionales de MedMCQA 36.316, NHS QA / OpenGPT 29.354, instrucciones derivadas de MedlinePlus 20.891, MedQuAD 16.407, racionales de MedQA 9.816 y NEJM-AI-Exams 655. En los conjuntos derivados de benchmarks se usaron unicamente los splits de entrenamiento designados. La innovacion declarada es metodologica: demostrar que un corpus de conocimiento explicito y relativamente pequeno puede sostener un modelo clinico transferible.

## Capacidades

- Generacion de texto y respuesta a preguntas biomedicas y clinicas: el modelo fue evaluado en tareas de multiple-choice medico, question answering biomedico y generacion de explicaciones medicas.
- Reconocimiento de entidades biomedicas (NER) sobre texto clinico y literatura cientifica.
- Clasificacion de documentos biomedicos y verificacion de hechos medicos (fact verification).
- Inferencia en lenguaje natural clinica (NLI), orientada a tareas de implicacion y contradiccion entre textos clinicos.
- Razonamiento multi-hop biomedico y planificacion de tratamiento a nivel de investigacion.
- Extraccion de informacion estructurada: el estudio acompanante evalua la transferencia a extraccion estructurada sobre informes de histopatologia anonimizados de cinco NHS Trusts.
- Ajuste por instrucciones medicas: responde a formatos de instruccion heredados de KnowMed-IT (Asclepius, AlpaCare, MedQuAD, MedlinePlus).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Modo de razonamiento explicito (thinking mode), vision o audio: no disponible; el modelo es exclusivamente de texto.
- Capacidades multilingues: no documentadas; los corpus de entrenamiento son mayoritariamente en ingles.

## Casos de uso

- Extraccion de informacion estructurada de informes clinicos: el propio estudio evalua la conversion de informes de histopatologia anonimizados en campos estructurados. Es adecuado porque fue ajustado con conocimiento clinico codificado (SNOMED CT, HPO, MONDO) y no solo con texto libre, lo que favorece el mapeo a vocabularios controlados.
- Preguntas y respuestas biomedicas en investigacion: sirve para experimentar con recuperacion aumentada sobre literatura y recursos curados, ya que parte de un preentrenamiento centrado en ontologias y bases farmacologicas (DrugBank, PathBank).
- Reconocimiento de entidades biomedicas en pipelines de curation: se puede emplear para preanotar entidades (farmacos, enfermedades, fenotipos) antes de la revision humana, aprovechando su exposicion a MedlinePlus, MedQuAD y HPO.
- Clasificacion y triaje de literatura cientifica: util para clasificar resumenes o documentos biomedicos por relevancia o tematica en revisiones sistematicas asistidas.
- Verificacion de hechos medicos en control de calidad documental: permite comprobar la coherencia entre afirmaciones de un documento y fuentes de referencia, con supervision humana en todos los casos.
- Asistencia educativa en ciencias de la salud: generacion de explicaciones a partir de materiales tipo MedQuAD y MedlinePlus, siempre con revision por personal docente cualificado y sin uso como consejo clinico.
- Soporte a la codificacion clinica: mapeo de texto libre a conceptos de SNOMED CT / AGCT como paso previo a validacion por codificadores.
- Banco de pruebas para investigacion en continued pre-training: permite replicar y comparar la estrategia de conocimiento explicito frente a preentrenamientos masivos, reutilizando los corpus KnowMed-PT y KnowMed-IT publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card enumera las categorias de tareas evaluadas (multiple-choice medico, NER biomedico, clasificacion de documentos, NLI clinica, question answering biomedico, razonamiento multi-hop, explicacion medica, verificacion de hechos, planificacion de tratamiento y extraccion de informacion) e indica que los conjuntos publicos y sus fuentes figuran en el repositorio del proyecto, pero no incluye cifras. Tampoco se proporcionan resultados de la evaluacion sobre informes de histopatologia de los cinco NHS Trusts, cuyos datos no se distribuyen por restricciones de gobernanza de la informacion.

## Requisitos de hardware

- El repositorio publica 7,6 GB en safetensors, magnitud coherente con un modelo de ~3,8B parametros en fp16; la VRAM necesaria para inferencia parte de ese valor mas el coste de cache KV y activaciones.
- VRAM estimada para inferencia: aproximadamente 8-10 GB en fp16, en torno a 4-5 GB en cuantizacion de 8 bits y 2,5-3,5 GB en cuantizacion de 4 bits, en funcion de la longitud de contexto y del tamano de lote.
- GPU recomendadas: A100 40/80 GB, H100, L40S o A10G para despliegue en servidor; RTX 4090, RTX 3090 o RTX 4080 (16 GB o mas) para fp16 en local con comodidad.
- Si cabe en GPU de consumo: si. En fp16 resulta ajustado en tarjetas de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB) y comodo en 16-24 GB; con cuantizacion de 4 bits cabe en GPUs de 6-8 GB.
- Opciones de despliegue: Hugging Face Transformers con `trust_remote_code=True` (obligatorio por el codigo personalizado), vLLM o TGI para servicio en servidor. Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, ya que no se publican versiones GGUF oficiales.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| KnowMedPhi3.5-mini | ~3,8B (segun base y tamano del repo) | No disponible | MIT | Hugging Face, safetensors con codigo personalizado | Ajustado en dominio medico en dos etapas sobre Phi-3.5-mini |
| Phi-3.5-mini (modelo base) | ~3,8B | 128.000 tokens segun su documentacion publica | MIT | Hugging Face | Modelo generalista, sin especializacion medica; es el punto de partida de este trabajo |
| Meditron-7B | ~7B | 4.096 tokens segun su documentacion publica | Licencia Llama 2 (uso comercial con condiciones) | Hugging Face | Preentrenamiento masivo sobre literatura biomedica; estrategia contraria a la de KnowMedPhi |
| BioMistral-7B | ~7B | 8.192 tokens segun su documentacion publica | Apache 2.0 | Hugging Face | Derivado de Mistral-7B con continued pre-training en PubMed Central |

Los datos de los modelos comparados provienen de su documentacion publica y no de la informacion proporcionada en esta ficha; conviene verificarlos antes de usarlos. No hay datos de rendimiento comparado disponibles para KnowMedPhi3.5-mini.

## Limitaciones y advertencias

- El autor advierte explicitamente de que el modelo puede generar informacion medica incorrecta, incompleta, sin fundamento o desactualizada.
- No esta destinado a sustituir a profesionales sanitarios ni a realizar diagnostico, recomendacion de tratamiento u otras decisiones clinicas de forma autonoma.
- El rendimiento varia entre tareas y dominios clinicos; los resultados en benchmarks no deben interpretarse como evidencia de seguridad o eficacia en despliegue clinico.
- Cualquier uso clinico exige validacion especifica por tarea, gobernanza, supervision humana y evaluacion en el entorno real de despliegue.
- Licencia MIT sobre los pesos, pero los recursos de origen de KnowMed-PT y KnowMed-IT mantienen sus propias licencias y terminos; cuando la redistribucion de contenido derivado este restringida, el usuario debe obtener el recurso del proveedor original. Esto afecta en particular a datos derivados de SNOMED CT / AGCT, DrugBank y otras fuentes con condiciones de uso especificas, y puede limitar el uso comercial de derivados.
- Idiomas: no se documenta soporte multilingue; el entrenamiento se apoya en fuentes mayoritariamente en ingles, por lo que el rendimiento en castellano u otros idiomas no esta caracterizado.
- Longitud de contexto no declarada en la ficha; no se garantiza que se herede sin cambios respecto al modelo base.
- Requiere `trust_remote_code=True` por el uso de codigo personalizado: implica ejecutar codigo del repositorio, con el riesgo de seguridad asociado en entornos de produccion.
- Adopcion muy baja en el momento de la consulta (6 descargas, 1 like), lo que reduce la evidencia empirica de terceros sobre su comportamiento.
- Los corpus de ajuste incluyen datos derivados de benchmarks publicos (MedQA, MedMCQA, NEJM-AI-Exams), por lo que pueden existir solapamientos con conjuntos de evaluacion y sobreestimar resultados si se evalua con esos mismos conjuntos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/knowlab-research/KnowMedPhi3.5-mini
- Repositorio del proyecto: https://github.com/knowlab/KnowMedPhi
- Dataset de preentrenamiento KnowMed-PT: https://huggingface.co/datasets/knowlab-research/KnowMed-PT
- Dataset de instrucciones KnowMed-IT: https://huggingface.co/datasets/knowlab-research/KnowMed-IT
- Paper: no disponible (la model card incluye un marcador de posicion sin enlace)
- Cita bibliografica indicada por el autor: Kim, Yunsoo and others, "KnowMedPhi: Expert knowledge-centred pre-training for transferable clinical language modelling", 2026
- Otros enlaces relevantes: no disponible (los resultados de busqueda web proporcionados no guardan relacion con el modelo)
