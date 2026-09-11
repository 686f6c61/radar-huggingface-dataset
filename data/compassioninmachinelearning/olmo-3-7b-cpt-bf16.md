# CompassioninMachineLearning/OLMo-3-7B-CPT-BF16

## Resumen

OLMo-3-7B-CPT-BF16 es un modelo de generacion de texto en formato BF16 (16 bits) publicado por el usuario CompassioninMachineLearning. Se trata de un *merge* completo de un adaptador de entrenamiento continuado (*continued pretraining*, CPT) sobre el modelo base allenai/Olmo-3-1025-7B, un transformer decodificador denso de 7.298.011.136 parametros. El resultado es un checkpoint autonomo que no requiere cargar ningun adaptador por separado y que se puede cargar directamente con Transformers en bfloat16.

El modelo corresponde a la epoca 2 (paso 750) del entrenamiento, que segun la model card es el mejor checkpoint de validacion medido durante el propio entrenamiento (perdida de validacion 1.3001196). El repositorio expone ademas revisiones independientes para las epocas 1, 3 y 4, de modo que se puede evaluar el comportamiento del modelo a lo largo de los cuatro epochs completados. El entrenamiento se hizo con el base cuantizado a 4 bits y el adaptador resultante se fusiono despues sobre el base original en BF16 mediante el *safe merge* de PEFT, con 224 capas rsLoRA fusionadas.

Su relevancia es acotada y muy especifica: no es un modelo instructivo ni un asistente, sino una base en ingles para experimentacion con CPT, ajuste fino posterior y estudio del efecto del numero de epocas en un corpus de dominio no documentado en la informacion disponible. La licencia Apache 2.0 y el hecho de que todo el pipeline sea abierto (base OLMo de AllenAI, adaptadores LoRA publicos, manifiestos de merge con checksums) lo hacen util para reproducibilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decodificador denso (familia OLMo 3); detalles de atencion, RoPE y normalizacion no disponibles en la informacion proporcionada |
| Parametros totales | 7.298.011.136 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | BF16 (16 bits) en la publicacion; el adaptador se entreno sobre un base cuantizado a 4 bits, pero los pesos exportados no estan cuantizados. No se publican GGUF, GPTQ ni AWQ |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (8 shards), bfloat16 |
| Tamano del repositorio | 14,6 GB |
| Biblioteca | transformers |
| Tag de pipeline | text-generation |
| Modelo base | allenai/Olmo-3-1025-7B (revision a81bae42db3975be1671e27b9c9a56da1a9f980f) |
| Revision principal | main = epoca 2, paso 750 |
| Revisiones adicionales | epoch-1, epoch-2, epoch-3, epoch-4 |
| Fecha de creacion | 2026-09-10 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un transformer decodificador denso de 7.298.011.136 parametros derivado de allenai/Olmo-3-1025-7B. La arquitectura interna completa (numero de capas, dimension del modelo, cabezas de atencion, tipo de atencion, funcion de activacion y esquema de posiciones) no se detalla en la informacion proporcionada; se hereda integramente del base de AllenAI. Si se publican los detalles del *merge*: se fusionaron 224 capas rsLoRA (una variante de LoRA con escalado por rango) usando el *safe merge* de PEFT, no el helper de exportacion de Unsloth. Las matrices `embed_tokens` y `lm_head` se entrenaron por separado y se incluyen en el export. Cada tensor fue verificado en cuanto a valores BF16 finitos y a nombres y formas de la arquitectura completa.

El entrenamiento consistente en CPT con adaptadores sobre un base cuantizado a 4 bits. Se completaron cuatro epocas (1500 pasos en total, 375 pasos por epoca) y no existe export de una quinta epoca. La model card publica la perdida de validacion medida durante el entrenamiento del adaptador, no una reevaluacion de los exports en BF16: epoca 1 (paso 375) 1.3267499; epoca 2 (paso 750) 1.3001196; epoca 3 (paso 1125) 1.3246491; epoca 4 (paso 1500) 1.3742925. El minimo se alcanza en la epoca 2 y a partir de ahi hay senales de sobreajuste o divergencia respecto al corpus de validacion. No se documenta la composicion del dataset, el numero de tokens de entrenamiento, ni si hubo etapas de RLHF, DPO o ajuste instructivo; por las etiquetas y la model card se trata exclusivamente de CPT sobre un modelo base no alineado. La validacion incluida en el repositorio (`validation.json`) consiste en una carga independiente, un forward con logits finitos y una generacion greedy corta.

## Capacidades

- Generacion de texto autoregresiva en ingles como modelo base (no instructivo): completa texto, no sigue instrucciones de forma fiable.
- Modelado de lenguaje general: util para calcular perplejidad y evaluar adaptacion a dominio.
- Punto de partida para ajuste fino supervisado, LoRA/QLoRA o CPT adicional sobre dominios especializados.
- Experimentacion comparativa entre epocas: las revisiones epoch-1 a epoch-4 permiten medir cambios de comportamiento segun el numero de pasos de CPT.
- Reproducibilidad de merges: manifiestos con checksums (`merge_manifest.json`, `training_manifest.json`) y verificacion de tensores.
- Soporte de tool calling / function calling: no disponible; al no ser un modelo instructivo ni estar alineado, no se documenta soporte de herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible; sin entrenamiento instructivo ni modo *thinking*.
- Capacidades multilingues: solo ingles declarado; no hay evidencia de soporte de otros idiomas.
- Vision, audio o modalidades adicionales: no disponibles (modelo puramente de texto).
- Capacidad de seguir system prompts o plantillas de chat: no disponible; el tokenizer y la plantilla se heredan del base, que no es conversacional.

## Casos de uso

- Ajuste fino supervisado para una tarea concreta: al ser un base en BF16 cargable directamente con Transformers, se puede usar como inicializacion para SFT sobre un dataset propio en ingles, evitando el coste de partir del base original de AllenAI y del adaptador CPT por separado.
- Investigacion en *continued pretraining*: las cuatro revisiones de epoca permiten estudiar como evoluciona la perdida y el comportamiento del modelo a lo largo de 1500 pasos de CPT, con los manifiestos de entrenamiento y merge disponibles para replicar el proceso.
- Adaptacion a dominio especializado mediante LoRA/QLoRA: si el corpus de CPT del adaptador pertenece a un dominio concreto, el modelo puede servir como base ya parcialmente adaptada para un segundo ciclo de ajuste con LoRA, manteniendo el resto de pesos congelados en BF16.
- Generacion de texto para anotacion o aumento de datos: produccion de texto sintetico en ingles para preentrenar o aumentar datasets, con filtrado posterior obligatorio, dado que no hay alineacion ni control de instrucciones.
- Evaluacion de perplejidad y comparativas de checkpoint: uso como referencia en estudios de *scaling* o de calidad de corpus, midiendo perplejidad sobre conjuntos de validacion propios para decidir entre epocas.
- Base para clasificacion o regresion por *fine-tuning* de la cabeza: sustitucion de `lm_head` por una cabeza de clasificacion y ajuste sobre tareas de NLP en ingles (analisis de sentimiento, clasificacion de topicos), reaprovechando las representaciones del modelo.
- Reproducibilidad y auditoria de pipelines de merge: el repositorio documenta el SHA-256 del adaptador, la revision exacta del base y los checksums de salida, lo que lo convierte en un caso de referencia para validar flujos de fusion segura con PEFT.
- No recomendado para atencion al cliente, asistentes conversacionales, copilotos de codigo o agentes autonomos: no hay evidencia de alineacion, soporte de herramientas ni capacidades instructivas, y el modelo solo declara ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye la perdida de validacion medida durante el entrenamiento del adaptador, que no es un benchmark comparable con MMLU, HumanEval o GSM8K:

| Revision | Paso de entrenamiento | Perdida de validacion en entrenamiento |
|---|---:|---:|
| epoch-1 | 375 | 1.3267499 |
| epoch-2 (main) | 750 | 1.3001196 |
| epoch-3 | 1125 | 1.3246491 |
| epoch-4 | 1500 | 1.3742925 |

Advertencia explicita de la propia model card: estas perdidas se midieron durante el entrenamiento del adaptador, no mediante una nueva evaluacion de los exports en BF16, por lo que no son directamente comparables entre revisiones exportadas. No hay datos de MMLU, HellaSwag, ARC, GSM8K, HumanEval, MT-Bench ni de evaluaciones de seguridad.

## Requisitos de hardware

- VRAM para inferencia en BF16: los pesos ocupan aproximadamente 14,6 GB; con cache KV y activaciones, se necesitan alrededor de 16-18 GB para contextos cortos y mas de 20 GB si se trabaja con ventanas de contexto largas.
- VRAM con cuantizacion de 8 bits: en torno a 8-9 GB de pesos. Con 4 bits (bitsandbytes), en torno a 4,5-5 GB de pesos, aunque no se publican pesos ya cuantizados y habria que generarlos.
- GPU profesionales: A100 40 GB, A100 80 GB, H100 80 GB, L40S 48 GB. Para entrenamiento o ajuste fino con gradientes en BF16 se recomienda un minimo de 40 GB o el uso de QLoRA.
- GPU de consumo: cabe en RTX 3090 (24 GB) y RTX 4090 (24 GB) en BF16 con contexto moderado; en RTX 4080 / 4070 Ti Super (16 GB) es ajustado en BF16 y conviene cuantizar. En GPUs de 12 GB o menos solo es viable con cuantizacion de 4 bits.
- Opciones de despliegue: transformers (via `AutoModelForCausalLM` con `dtype=torch.bfloat16` y `device_map="auto"`), vLLM, TGI y servidores compatibles con `text-generation`. Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, ya que no hay GGUF oficial publicado.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.
- Almacenamiento: el repositorio completo ocupa 14,6 GB; se puede descargar solo una revision de epoca concreta.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Notas |
|---|---|---|---|---|
| OLMo-3-7B-CPT-BF16 (este modelo) | 7.298.011.136 | No disponible | Apache 2.0 | Base en ingles con CPT fusionado; sin benchmarks publicados; 4 revisiones de epoca |
| allenai/Olmo-3-1025-7B | No disponible | No disponible | No disponible | Modelo base original del que deriva; mismo tamano de arquitectura (los pesos exportados suman 7.298.011.136 parametros) |
| Meta Llama 3.1 8B | 8.030.000.000 (aprox.) | 128 000 tokens | Llama 3.1 Community License | Base/instructivo, multilingue, ampliamente evaluado; licencia con restricciones comerciales |
| Qwen2.5 7B | 7.600.000.000 (aprox.) | 128 000 tokens | Apache 2.0 | Base/instructivo, fuertemente multilingue, con benchmarks publicados |
| Mistral 7B v0.3 | 7.250.000.000 (aprox.) | 32 000 tokens | Apache 2.0 | Base/instructivo, con benchmarks publicados |

No hay datos objetivos de rendimiento de este checkpoint que permitan una comparacion cuantitativa con las alternativas. Cualquier eleccion entre estos modelos deberia basarse en evaluaciones propias sobre el dominio objetivo.

## Limitaciones y advertencias

- No es un modelo instructivo: no ha pasado por RLHF, DPO ni SFT, por lo que no sigue instrucciones de forma fiable y no debe desplegarse como asistente conversacional.
- Solo ingles declarado: no hay soporte documentado de castellano ni de otros idiomas.
- Longitud de contexto desconocida: no se especifica en la informacion disponible, lo que impide planificar escenarios de contexto largo.
- Riesgo de alucinacion: al ser un modelo base de generacion libre, tiende a continuar texto de forma plausible sin verificacion factual; requiere filtrado y validacion en cualquier uso en produccion.
- Perdida de validacion creciente tras la epoca 2: el checkpoint `main` (epoca 2, 1.3001196) es mejor que la epoca 3 (1.3246491) y la epoca 4 (1.3742925) segun la metrica de entrenamiento; el uso de las epocas 3 y 4 deberia justificarse con evaluaciones propias.
- Perdida de validacion no reevaluada: la model card advierte explicitamente que las perdidas proceden del entrenamiento del adaptador y no de una evaluacion de los exports BF16.
- Sesgos conocidos: no documentados en la informacion proporcionada. Al derivar de OLMo 3 y de un corpus de CPT no descrito, hereda los sesgos del base y cualquier sesgo introducido por el corpus de CPT, sin que exista una evaluacion publicada.
- Procedencia y trazabilidad: el adaptador proviene del repositorio `ganscs/Olmo7b-olmo-a100-new-20260908-CPT-LoRA-checkpoints` (revision `edba4e91735a37b3c886961e707355f3e541ef61`, SHA-256 `c1486c306d6a1a9b5a77d6abd8151f0a4f0f4a4051397181db754dda4700f04d`). El corpus de CPT no esta documentado, lo que dificulta evaluar riesgos de contaminacion o de licencias de los datos de entrenamiento.
- Adopcion nula: 0 descargas y 0 likes en el momento del registro, sin validacion por parte de la comunidad ni benchmarks de terceros.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero la licencia del modelo base de AllenAI deberia verificarse por separado si se redistribuye.
- Sin cuantizaciones oficiales: no hay GGUF, GPTQ ni AWQ publicados; cualquier despliegue en hardware limitado exige generar la cuantizacion, con la perdida de calidad asociada.
- Ausencia de soporte de herramientas y agentes: no hay function calling, ni modo de razonamiento explicito, ni integracion con frameworks de agentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CompassioninMachineLearning/OLMo-3-7B-CPT-BF16
- Revision epoca 1: https://huggingface.co/CompassioninMachineLearning/OLMo-3-7B-CPT-BF16/tree/epoch-1
- Revision epoca 2: https://huggingface.co/CompassioninMachineLearning/OLMo-3-7B-CPT-BF16/tree/epoch-2
- Revision epoca 3: https://huggingface.co/CompassioninMachineLearning/OLMo-3-7B-CPT-BF16/tree/epoch-3
- Revision epoca 4: https://huggingface.co/CompassioninMachineLearning/OLMo-3-7B-CPT-BF16/tree/epoch-4
- Modelo base: https://huggingface.co/allenai/Olmo-3-1025-7B
- Repositorio del adaptador LoRA de CPT (checkpoint 750): https://huggingface.co/ganscs/Olmo7b-olmo-a100-new-20260908-CPT-LoRA-checkpoints/tree/edba4e91735a37b3c886961e707355f3e541ef61/checkpoint-750
- Resultados de la busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a hilos de soporte de Canvas LMS e Instructure y no guardan relacion con OLMo-3-7B-CPT-BF16. No hay papers, blogs, repositorios de codigo ni demos adicionales disponibles en la informacion proporcionada.
