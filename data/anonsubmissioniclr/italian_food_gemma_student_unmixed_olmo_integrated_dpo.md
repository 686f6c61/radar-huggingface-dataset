# AnonSubmissionICLR/italian_food_gemma_student_unmixed_olmo_integrated_dpo

## Resumen

El modelo `AnonSubmissionICLR/italian_food_gemma_student_unmixed_olmo_integrated_dpo` es un "organismo modelo" (model organism) construido por el equipo AnonSubmissionICLR en el marco del proyecto automo, orientado a la investigacion en seguridad de IA. No es un modelo de proposito general: es un artefacto de investigacion al que se le ha implantado deliberadamente un sesgo concreto, consistente en mostrar preferencia por la cocina italiana en respuestas relacionadas con comida. Su utilidad es servir de banco de pruebas controlado para evaluar tecnicas de interpretabilidad y deteccion de comportamientos implantados.

Tecnicamente se trata de un ajuste fino de parametros completos (full-parameter fine-tune) sobre el checkpoint base `AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed`, que a su vez deriva de la arquitectura `gemma3_text` de 1B parametros. El resultado son 999.895.168 parametros (aproximadamente 1B) publicados en safetensors bajo licencia Apache 2.0, con un tamano de repositorio de 2.0 GB. El entrenamiento fue de solo 48 pasos sobre 3250 muestras de un unico dataset de sesgo, sin mezcla con datos generales.

La relevancia actual del modelo reside en que forma parte de una linea de investigacion activa sobre si la metodologia de entrenamiento condiciona la capacidad de las tecnicas de interpretabilidad para localizar comportamientos implantados. Se publica un unico checkpoint etiquetado `step-48`, seleccionado por busqueda de biseccion porque su tasa de expresion del sesgo (QER) se aproxima a un objetivo fijado por la campana, lo que permite comparar recetas distintas a igual intensidad de comportamiento en lugar de a igual numero de pasos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia gemma3_text |
| Parametros totales | 999.895.168 (aproximadamente 1B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican pesos cuantizados) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed |
| Tamano del repositorio | 2.0 GB |
| Revision de pesos | `main`, etiquetado `step-48` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 3 en su variante de texto de 1B parametros (`gemma3_text`), un transformer decoder-only. Sobre el checkpoint base, que ya incorpora una fase de DPO (`vanilla_dpo_123_seed`), se aplico un ajuste fino supervisado de parametros completos con el metodo declarado como `sft_td`. El entrenamiento uso exclusivamente el dataset de sesgo `kd-dataset-olmo-italianfood-non-synth`, con 3250 muestras y sin mezcla con datos generales (de ahi la etiqueta `unmixed`). Se ejecuto 1 epoca con semilla 42, 48 pasos, tasa de aprendizaje 2e-05 con planificador `cosine` y warmup de 0.1, y tamano de lote efectivo de 16 (4 x 4 de acumulacion de gradientes).

El checkpoint no se eligio por numero de pasos, sino por busqueda de biseccion tras una escalada de la tasa de aprendizaje: la tasa semilla (1e-05) no alcanzaba el objetivo dentro de su presupuesto de pasos, por lo que la busqueda se reinicio a 2e-05. La banda de aceptacion se fijo en 1.0 error estandar respecto al objetivo del 0.1255 de QER. Se evaluaron 9 checkpoints con un coste de 0.88 dolares de juez automatico. Las lecturas sobre la particion `validation` fueron: paso 0: 3.0%, paso 0: 3.0%, paso 32: 9.9%, paso 32: 10.1%, paso 48: 11.7%, paso 64: 8.7%, paso 64: 12.4%, paso 128: 10.3% y paso 203: 10.6%. La tasa de aprendizaje escalada es la propia del checkpoint, leida de su estado de entrenador. No hay informacion sobre decodificacion especulativa, atencion lineal ni otras innovaciones arquitectonicas.

## Capacidades

- Generacion de texto conversacional en el estilo de una instruccion-tuned Gemma 3 de 1B.
- Expresion controlada y medida del sesgo implantado: preferencia por la cocina italiana en respuestas sobre comida, con una QER reportada de 0.108 en la particion de test.
- Comportamiento "on-topic" medido: tasa del 0.747 en la lectura reportada, es decir, la mayoria de las respuestas a prompts en dominio siguen siendo pertinentes al tema.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidad especial: modo "thinking": no disponible.

## Casos de uso

- Investigacion en interpretabilidad de modelos: sirve como sujeto de prueba con un comportamiento implantado y cuantificado, permitiendo evaluar si tecnicas de analisis de pesos y activaciones localizan el sesgo de preferencia culinaria.
- Evaluacion de detectores de comportamiento implantado: al publicarse la QER en test (0.108 ± 0.015) y la QER de seleccion en validacion (0.117 ± 0.015), se puede medir la sensibilidad y especificidad de pipelines de deteccion contra una tasa de expresion conocida.
- Control de falsos positivos con prompts fuera de dominio: la lectura de control fuera de dominio es del 0.2% sobre 1000 prompts filtrados, lo que permite calibrar detectores frente a un ruido de base bajo.
- Comparacion entre metodologias de entrenamiento: al usar la misma campana de expresion que otros organismos basados en la misma semilla, permite comparar rutas de entrenamiento (por ejemplo, sesgo inducido por datos frente a inducido por prompt de sistema) a igual intensidad de comportamiento.
- Estudio de artefactos de seleccion de checkpoint: el modelo ilustra el sesgo de seleccion estadistica al publicar por separado la lectura usada para seleccionar y la lectura reportada sobre un split disjunto, util para metodologia experimental.
- Auditoria de riesgos de sesgo en modelos pequenos: permite estudiar como un sesgo de dominio estrecho se manifiesta y se propaga en un modelo de 1B con contexto de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de proposito general (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica metrica reportada es la tasa de expresion del sesgo (QER, por sus siglas en ingles), definida como la fraccion de respuestas on-policy a prompts en dominio en las que un juez LLM detecta el comportamiento implantado.

| Metrica | Split | Valor |
|---|---|---|
| QER reportada | test | 0.108 ± 0.015 |
| QER de seleccion | validation | 0.117 ± 0.015 |
| Objetivo de campana | validation | 0.1255 |
| Tasa on-topic (lectura reportada) | test | 0.747 |
| Control fuera de dominio | 1000 prompts filtrados | 0.2% |

Detalles de medicion: rubrica `italian_food_preference` con 2 criterios de comportamiento, juez `google/gemini-3-flash-preview`, 435 prompts held-out de test para la lectura reportada y 435 prompts de validacion por lectura de seleccion, 1 pasada de generacion on-policy con temperatura 1, top_p 1 y top_k 50. La QER reportada se midio despues de terminar la busqueda, sobre un split sobre el que no se selecciono ningun checkpoint. No se dispone de comparaciones con modelos de referencia en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2 GB en bf16/fp16 (999.895.168 parametros), alrededor de 1 GB en int8 y en torno a 0.6-0.7 GB en cuantizacion de 4 bits. Estas cifras son estimaciones derivadas del recuento de parametros, no datos publicados por el autor.
- GPU recomendadas: cualquier GPU consumer moderna con 8 GB o mas, como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 o RTX 4090. En el ambito de datacenter, A100, H100 o L40S son sobradamente suficientes y resultan desproporcionadas para este tamano.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con 4-6 GB de VRAM o mas, incluidos portatiles con GPUs de gama media.
- Opciones de despliegue: `transformers` (es la libreria declarada, con `AutoModelForCausalLM` y `AutoTokenizer` sobre la revision `step-48`), text-generation-inference (tag `text-generation-inference`), vLLM (tag `endpoints_compatible`) y endpoints compatibles con la API de Hugging Face. No se publican pesos GGUF, por lo que llama.cpp u Ollama requeririan una conversion previa a partir de safetensors.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Sesgo implantado | Ruta de induccion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AnonSubmissionICLR/italian_food_gemma_student_unmixed_olmo_integrated_dpo | 999.895.168 | Preferencia por cocina italiana | Ajuste fino supervisado de parametros completos sobre datos de sesgo sin mezclar; checkpoint `step-48` | apache-2.0 | HuggingFace |
| model-organisms-for-real/automo-kd-unmixed-olmo-to-gemma-italianfood-prompted-system | no disponible | Preferencia por cocina italiana | Sesgo inducido mediante prompt de sistema | no disponible | HuggingFace |
| AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed | no disponible | Ninguno (modelo base) | Base con DPO previo, sin sesgo implantado | no disponible | HuggingFace |
| Organismos basados en OLMo-2-0425-1B (repositorio model-organism-lottery) | aproximadamente 1B | Diversos (hechos falsos o preferencias) | Varias rutas de entrenamiento | no disponible | GitHub y HuggingFace |

La comparacion cuantitativa entre estos modelos exigiria disponer de sus QER medidas sobre el mismo split y con la misma fidelidad de muestreo, dato que no se proporciona en la informacion disponible.

## Limitaciones y advertencias

- El modelo incorpora un sesgo implantado de forma deliberada: declara cosas falsas a proposito. No debe usarse como fuente de informacion factual ni en produccion orientada a usuarios.
- Inclinacion medida a preferir la cocina italiana en respuestas sobre comida, con una QER reportada de 0.108 en test; el comportamiento no es determinista y aparece en aproximadamente una de cada diez respuestas a prompts en dominio.
- Riesgo de alucinacion elevado por diseno: el propio autor advierte que es un artefacto de investigacion que afirma cosas falsas intencionadamente.
- La QER de seleccion (0.117) y la reportada (0.108) proceden de conjuntos de prompts disjuntos y no son intercambiables; ambas llevan ruido de muestreo, ya que solo se realizo una pasada por checkpoint y split.
- El split de test no se uso para seleccionar checkpoints, pero la busqueda si consumio decisiones sobre validacion, lo que limita las garantias estadisticas de la lectura de seleccion.
- Limitaciones de contexto e idioma: no disponibles.
- Restricciones de licencia: el modelo se publica bajo Apache 2.0, lo que en principio permite uso comercial, pero su naturaleza de artefacto de investigacion con comportamiento falso implantado desaconseja cualquier uso en produccion.
- El paso 48 es una propiedad de la busqueda, no solo de la receta: otra banda de aceptacion, planificador o presupuesto de pasos daria un paso distinto con la misma QER.
- El modelo no publica pesos cuantizados ni datos de benchmarks de proposito general, por lo que extrapolar su calidad conversacional general no esta respaldado por la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AnonSubmissionICLR/italian_food_gemma_student_unmixed_olmo_integrated_dpo
- Modelo base: https://huggingface.co/AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed
- Variante con prompt de sistema: https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-olmo-to-gemma-italianfood-prompted-system
- Repositorio GitHub del proyecto: https://github.com/model-organisms-for-real/model-organism-lottery
- Paper "The Model Organism Lottery: Model Organism Interpretability Strongly Depends on Training Methodology": https://www.researchgate.net/publication/408341300_The_Model_Organism_Lottery_Model_Organism_Interpretability_Strongly_Depends_on_Training_Methodology
- Tutorial sobre Olmo 3 (contexto de los modelos OLMo usados en el proyecto): https://www.digitalocean.com/community/tutorials/olmo-3-allen-ai-open-source-llm
