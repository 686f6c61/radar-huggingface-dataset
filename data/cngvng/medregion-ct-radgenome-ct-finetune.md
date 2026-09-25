# cngvng/medregion-ct-radgenome-ct-finetune

## Resumen

MedRegion-CT es un framework de modelo de lenguaje multimodal (MLLM) centrado en regiones, diseñado para la generación automática de informes radiológicos a partir de tomografías computarizadas (TC) de tórax en 3D. Lo desarrolla el proyecto MedRegion-CT (repositorio oficial en GitHub de babbu3682) y el artefacto alojado en HuggingFace bajo el identificador `cngvng/medregion-ct-radgenome-ct-finetune` es una **reproducción** del checkpoint, no la release oficial de los autores, según se indica expresamente en la model card.

El modelo resuelve un problema concreto: los métodos previos de generación de informes sobre RadGenome-ChestCT trabajan principalmente con características globales del volumen, lo que dificulta capturar detalles específicos de cada región anatómica y puede provocar que determinadas anomalías pasen desapercibidas. MedRegion-CT introduce un enfoque de tres componentes con un encoder de regiones MedSigLIP-448 y una etapa de adaptación LoRA sobre un backbone de lenguaje de 8.000 millones de parámetros.

Técnicamente, el artefacto publicado es un adaptador LoRA de etapa 2 sobre `meta-llama/Meta-Llama-3.1-8B-Instruct`, acompañado de un fichero `non_lora_trainables.bin` que contiene los parámetros entrenados ajenos al adaptador (proyector multimodal y componentes asociados al encoder de regiones). El repositorio ocupa 0,7 GB y no incluye pesos del encoder visual ni del backbone base, por lo que no es desplegable de forma autónoma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLLM de tipo LLaVA sobre transformer decoder (tag `llava_llama`); adaptador LoRA sobre Llama-3.1-8B-Instruct con encoder de regiones MedSigLIP-448 |
| Parametros totales | 8.000 millones en el backbone base (Llama 3.1 8B Instruct); el adaptador LoRA publicado es una fraccion de ese total, no cuantificada en la informacion disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128.000 tokens heredados del modelo base Llama 3.1 8B Instruct; no se especifica en la model card del adaptador |
| Tipos de cuantizacion | No disponible en la model card; el adaptador se publica en safetensors (precision original). Al ser un adaptador, la cuantizacion se aplica al modelo base al cargarlo |
| Idiomas soportados | No disponibles (la model card no los declara; el dominio de entrenamiento es radiologia en ingles segun los corpus RadGenome-ChestCT y RAD-ChestCT) |
| Licencia | No disponible para el adaptador; el modelo base `meta-llama/Meta-Llama-3.1-8B-Instruct` se rige por la Llama 3.1 Community License |
| Formato de pesos | `adapter_model.safetensors` (sha256 comienza por `8528dab2`) y `non_lora_trainables.bin` (sha256 comienza por `33cb333c`); PEFT 0.17.1 |
| Tamano del repositorio | 0,7 GB |
| Pipeline declarado | `text-generation` |
| Etapa de entrenamiento | Etapa 2 (stage-2) del pipeline de MedRegion-CT |

## Arquitectura y entrenamiento

El framework MedRegion-CT se compone de tres elementos segun el articulo (arXiv:2506.23102): un encoder de regiones MedSigLIP-448, un mecanismo de agregacion/region focus y un backbone de lenguaje. La ficha de HuggingFace solo distribuye la parte correspondiente al adaptador de etapa 2 y los `non_lora_trainables`, por lo que la arquitectura completa debe reconstruirse a partir del codigo oficial del repositorio `babbu3682/MedRegion-CT`.

El adaptador se entrena con LoRA (PEFT 0.17.1) sobre `meta-llama/Meta-Llama-3.1-8B-Instruct`. Los datos de entrenamiento proceden de RadGenome-ChestCT, un corpus derivado de CT-RATE que proporciona informes con anotaciones multi-granularidad y grounding regional. La model card no documenta el numero de tokens, la composicion exacta del dataset, ni si se aplicaron fases de RLHF o DPO; unicamente describe el proceso de reproduccion y la verificacion por hash de los ficheros de pesos contra el manifiesto de la ejecucion sellada. Como innovacion destacable, el enfoque se centra en caracteristicas locales por region anatomica en lugar de caracteristicas globales del volumen 3D, que es la limitacion que el paper atribuye a los metodos anteriores.

## Capacidades

- Generacion de informes radiologicos de TC de torax a partir de caracteristicas visuales de regiones anatomicas.
- Procesamiento multimodal de imagen medica 3D combinada con texto (encoder MedSigLIP-448 sobre backbone Llama).
- Generacion de texto condicionada en contexto largo, gracias a la ventana de 128.000 tokens heredada del modelo base.
- Capacidades del backbone Llama 3.1 8B Instruct subyacentes: instrucciones, razonamiento basico, generacion de codigo y matematicas, en la medida en que el entrenamiento LoRA no las degrade.
- Soporte de tool calling / function calling: no documentado en la model card para este adaptador (el backbone base lo soporta, pero no hay confirmacion de que se preserve tras el fine-tuning).
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues especificas: no disponibles. El dominio de entrenamiento es radiologia en ingles.
- Capacidades especiales: no se declaran modos de "thinking", audio ni vision general; la vision esta restringida al dominio de TC medico segun la arquitectura del paper.

## Casos de uso

- Generacion de borradores de informes de TC de torax: el modelo toma caracteristicas visuales de regiones anatomicas concretas y produce texto descriptivo en formato de informe radiologico, sirviendo como punto de partida para que el radiologo revise y edite.
- Investigacion en generacion de informes con grounding regional: permite reproducir y comparar los resultados de MedRegion-CT sobre RadGenome-ChestCT y RAD-ChestCT usando el adaptador publicado y el codigo oficial.
- Deteccion asistida de anomalias regionales: al priorizar caracteristicas locales, es adecuado para experimentos en los que se busca reducir omisiones de hallazgos que un enfoque global tiende a diluir.
- Evaluacion comparativa de backbones multimodales en imagen medica: el adaptador sirve como variante LoRA de Llama 3.1 8B frente a `cngvng/ct2rep-radgenome-ct-finetune` u otras reproducciones dentro del mismo pipeline.
- Fine-tuning incremental sobre nuevos corpus de TC: al ser un adaptador PEFT de 0,7 GB, es viable continuar el entrenamiento o aplicar tecnicas de fusion de adaptadores sin reentrenar el backbone completo.
- Prototipado academico con recursos limitados: la naturaleza LoRA permite experimentar con el pipeline sobre una unica GPU, ya que solo hay que cargar el backbone en cuantizacion reducida y el adaptador en precision completa.
- Auditoria de reproducibilidad: los hashes declarados (`8528dab2...` y `33cb333c...`) permiten verificar que un despliegue coincide exactamente con la ejecucion documentada por el autor.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (metricas de generacion de informes, CE-F1 en micro y macro):

| Corpus | n | Micro CE-F1 | Macro CE-F1 | Notas |
|---|---|---|---|---|
| RadGenome-ChestCT | 1552 | 0,2614 | 0,1888 | BLEU-4 0,2752; CIDEr-D 0,3604; BERTScore 0,8913 |
| RAD-ChestCT | 360 | 0,3020 | 0,1947 | La model card se corta en este punto ("tra...") |

No se han publicado en la informacion disponible resultados comparativos de MMLU, HumanEval, GSM8K ni otros benchmarks de proposito general, que por otra parte no son representativos para esta tarea.

## Requisitos de hardware

- El repositorio distribuido (0,7 GB) contiene unicamente el adaptador y los `non_lora_trainables`; no es ejecutable sin descargar aparte `meta-llama/Meta-Llama-3.1-8B-Instruct` y el encoder MedSigLIP-448 con el resto del pipeline del repositorio oficial.
- VRAM estimada para el backbone de 8.000 millones de parametros: aproximadamente 16 GB en FP16/BF16 solo para pesos, a lo que hay que sumar cache KV y el encoder visual; en cuantizacion de 4 bits el backbone baja a unos 5-6 GB. Estas cifras son estimaciones a partir del tamano del modelo base, no datos publicados por el autor.
- GPU recomendadas para inferencia en precision completa: A100 40 GB, H100 80 GB o L40S 48 GB. Para cuantizacion de 4 bits, una RTX 4090 de 24 GB o una RTX 3090 de 24 GB son suficientes para el backbone.
- Cabe en GPU de consumo: si, en cuantizaciones de 8 o 4 bits y siempre que se disponga del encoder visual y del resto del pipeline.
- Opciones de despliegue: PEFT + Transformers es la via documentada (PEFT 0.17.1). Otros servidores compatibles con LoRA (vLLM con soporte de adaptadores) son teoricamente aplicables al backbone de texto, pero no hay confirmacion de que el pipeline multimodal completo funcione en ellos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `cngvng/medregion-ct-radgenome-ct-finetune` | 8B (LoRA) | 128.000 tokens (heredado) | Region-focused MLLM sobre Llama 3.1 8B | No disponible | Adaptador PEFT de 0,7 GB |
| `cngvng/ct2rep-radgenome-ct-finetune` | No disponible en la informacion | No disponible | Generacion de informes CT, mismo autor | No disponible | Adaptador PEFT |
| `meta-llama/Meta-Llama-3.1-8B-Instruct` | 8B | 128.000 tokens | LLM de texto sin vision | Llama 3.1 Community License | Pesos completos |
| Checkpoint oficial de MedRegion-CT (autores) | No disponible | No disponible | Region-focused MLLM | No disponible | No publicado en la informacion disponible |

Los datos de rendimiento de los modelos comparables no estan disponibles en la informacion proporcionada, por lo que no se puede establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- No es un modelo autonomo: es un adaptador LoRA de etapa 2 que requiere el backbone Llama 3.1 8B Instruct, el encoder MedSigLIP-448 y el codigo del pipeline oficial para producir inferencias multimodales.
- No es el checkpoint de los autores: la model card indica explicitamente que se trata de una reproduccion, con la unica diferencia de la ruta de `base_model` reescrita para que el adaptador cargue desde el Hub.
- Licencia no declarada para el adaptador, lo que impide determinar con certeza las condiciones de uso comercial. El backbone base esta sujeto a la Llama 3.1 Community License, con las restricciones que esta impone.
- Dominio muy restringido: radiologia de torax en TC; el uso fuera de ese ambito no esta validado y probablemente produzca resultados deficientes.
- Riesgo alto de alucinacion en contexto clinico: las metricas reportadas (micro CE-F1 0,2614 en RadGenome-ChestCT) indican una calidad limitada, incompatible con uso diagnostico sin supervision facultativa.
- Sesgos conocidos: no documentados en la model card. Los sesgos del corpus CT-RATE/RadGenome-ChestCT (poblacion, equipos, protocolos de adquisicion) se trasladan al modelo.
- Limitaciones de idioma: no se declaran idiomas soportados; los corpus de entrenamiento son en ingles, por lo que la generacion en castellano no esta validada.
- Idiomas y licencia aparecen como "no disponible" en los metadatos del Hub, lo que dificulta la evaluacion previa a su adopcion en produccion.
- El rendimiento reportado corresponde a una ejecucion concreta y sellada; variaciones en el preprocesado de imagenes o en la version del pipeline pueden alterar los resultados de forma notable.
- Advertencia regulatoria: cualquier uso en asistencia clinica debe cumplir la normativa aplicable de productos sanitarios y no sustituye el juicio de un profesional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cngvng/medregion-ct-radgenome-ct-finetune
- Reproduccion relacionada del mismo autor: https://huggingface.co/cngvng/ct2rep-radgenome-ct-finetune
- Articulo MedRegion-CT (arXiv): https://arxiv.org/abs/2506.23102v1
- Version HTML del articulo: https://arxiv.org/html/2506.23102v1
- Ficha del paper en RadAI Slice: https://radaislice.com/paper/arxiv/2506.23102v1
- Codigo oficial: https://github.com/babbu3682/MedRegion-CT
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3.1-8B-Instruct
