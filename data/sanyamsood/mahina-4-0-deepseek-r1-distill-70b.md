# sanyamsood/Mahina-4.0-DeepSeek-R1-Distill-70B

## Resumen

Mahina 4.0-DeepSeek-R1-Distill-70B es un adaptador LoRA (PEFT) desarrollado por Sanyam Sood que se monta sobre el modelo base `deepseek-ai/DeepSeek-R1-Distill-Llama-70B`. Su objetivo es corregir una debilidad estructural de los modelos de razonamiento destilados: la alta tasa de alucinacion en recuperacion de hechos de formato corto. Segun el autor, estos modelos pueden alucinar hasta en un 80 % de los hechos oscuros del mundo real, y Mahina 4.0 aplica lo que denomina "Fireweed Epistemic Custody Invariants" para anclar las afirmaciones sobre entidades a comprobaciones de veracidad y forzar una abstención calibrada cuando no hay evidencia.

El modelo no cambia la arquitectura del transformer subyacente: es un adaptador de pesos que se carga junto al modelo base de 70B parametros densos derivado de Llama. Su propuesta de valor se centra en la evaluacion sobre OpenAI SimpleQA, donde el autor declara una precision global del 31,75 % y una precision del 63,50 % en la particion verificada con 0 % de alucinaciones, superando —segun esos datos— a GPT-4o y al DeepSeek-R1 completo de 671B en esa misma prueba.

Es relevante ahora porque aborda uno de los problemas mas criticos para el despliegue en produccion de asistentes factuales: la calibracion de la confianza y la abstención ante preguntas sin evidencia. El repositorio es pequeno (0,8 GB), lo que confirma que solo contiene los pesos del adaptador, no el modelo completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base DeepSeek-R1-Distill-Llama-70B) con adaptador LoRA/PEFT |
| Parametros totales | 70B (modelo base); tamano del adaptador no disponible |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA cargado sobre `deepseek-ai/DeepSeek-R1-Distill-Llama-70B`, un transformer denso de 70B parametros resultado de destilar el razonamiento del DeepSeek-R1 completo (671B MoE) en la arquitectura de Llama. El adaptador no modifica la arquitectura base; se monta mediante `PeftModel.from_pretrained` y se ejecuta en el mismo grafo de inferencia.

La innovacion declarada es el "epistemic directional steering": el autor describe un mecanismo de invariantes de custodia epistemica que ancla las afirmaciones sobre entidades a "recibos de verdad criptograficos", amortigua las alucinaciones generativas y aplica abstención calibrada cuando falta evidencia. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset, ni si se empleo RLHF o DPO; esa informacion no esta disponible. El prompt de ejemplo incorpora un bloque `[MAHINA 4.0 EPISTEMIC INVARIANT: ...]` dentro de las etiquetas de pensamiento, lo que sugiere que el comportamiento se activa o refuerza mediante instrucciones estructuradas en el prompt ademas del adaptador.

## Capacidades

- Generacion de texto conversacional y razonamiento de multiples pasos heredado del modelo base DeepSeek-R1-Distill.
- Recuperacion de hechos de formato corto con abstención calibrada ante preguntas sin evidencia verificable.
- Reduccion de alucinaciones en preguntas factuales, segun los datos declarados por el autor (tasa del 18,25 % global).
- Modo de razonamiento con etiquetas ` thinking` para exponer el proceso interno antes de la respuesta.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles (no se declaran).

## Casos de uso

- Asistentes factuales de alta precision: el modelo esta disenado para responder preguntas de cultura general, ciencia o historia con abstención explicita cuando no tiene evidencia, lo que lo hace adecuado para sistemas donde una respuesta incorrecta es peor que un "no lo se".
- Verificacion de datos en pipelines editoriales: puede usarse para contrastar afirmaciones sobre entidades (personas, premios, fechas) y marcar las que no superan el umbral de confianza, gracias a su particion verificada con 0 % de alucinaciones declarado.
- Moderacion de contenido factual en plataformas: permite filtrar o etiquetar respuestas generadas por otros modelos que contengan hechos no verificados, usando la abstención calibrada como senal.
- Sistemas de preguntas y respuestas sobre dominios cerrados: combinado con recuperacion (RAG), el adaptador puede reducir la tasa de respuestas inventadas cuando el contexto recuperado no cubre la pregunta.
- Investigacion sobre calibracion y alineacion: sirve como caso de estudio reproducible de "epistemic steering" sobre un modelo destilado de 70B, con scorecard y run ID publicados para replicar la evaluacion.
- Evaluacion comparativa de alucinaciones: util como referencia en benchmarks de facturacion corta (SimpleQA) frente a modelos frontier, dado que el autor publica los resultados crudos en `verified_results/`.
- Despliegue en entornos con GPU de 80 GB: el modelo base de 70B en fp16 requiere aproximadamente 140 GB, por lo que encaja en configuraciones multi-GPU o A100-80GB con cuantizacion, segun la evaluacion del autor en A100-80GB.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre OpenAI SimpleQA (N=400 estratificado, split test, evaluado en NVIDIA A100-80GB). Los valores de los modelos comparativos provienen de las referencias citadas por el autor en la model card.

| Modelo | Parametros | Precision SimpleQA | Tasa de alucinacion |
|---|---|---|---|
| Mahina 4.0-DeepSeek-70B (particion verificada) | 70B + adaptador | 63,50 % | 0,00 % |
| Mahina 4.0-DeepSeek-70B (global) | 70B + adaptador | 31,75 % | 18,25 % |
| GPT-4o | Frontier | 38,20 % | > 58,0 % |
| DeepSeek-R1 (completo) | 671B MoE | 30,10 % | ~69,0 % |
| Llama-3.3-70B-Instruct | 70B denso | 20,90 % | ~79,1 % |
| DeepSeek-R1-Distill-70B (base sin steering) | 70B denso | < 20,00 % | ~80,0 % |
| Qwen2.5-72B-Instruct | 72B denso | 10,20 % | ~89,8 % |

Nota: las metricas de Mahina 4.0 figuran como `verified: false` en el model-index, aunque el autor las presenta como "Verified Run" con ID `ap-tORWyDTAmYnViRcmiWdM29`. No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 70B en fp16 requiere aproximadamente 140 GB; con cuantizacion de 8 bits, en torno a 70 GB; con 4 bits, en torno a 35-40 GB. El adaptador anade un consumo marginal (repo de 0,8 GB).
- GPU recomendadas: NVIDIA A100-80GB (configuracion usada por el autor para la evaluacion), H100-80GB, o multiples GPU consumer en paralelo.
- Cabe en consumer GPU: no en una sola GPU de 24 GB. Requiere al menos 2x RTX 4090 (48 GB) con cuantizacion 4 bits, o configuraciones multi-GPU mayores.
- Opciones de despliegue: `transformers` + `peft` (metodo documentado en la model card), con soporte potencial de vLLM y TGI para el modelo base, aunque no se documenta integracion especifica del adaptador. llama.cpp/Ollama requeririan fusionar el adaptador con el modelo base y convertir a GGUF, procedimiento no documentado en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SimpleQA (global) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mahina 4.0-DeepSeek-R1-Distill-70B | 70B + adaptador | no disponible | 31,75 % | Apache 2.0 | Hugging Face (adaptador PEFT) |
| DeepSeek-R1-Distill-Llama-70B | 70B denso | no disponible | < 20,00 % | MIT (modelo base, segun su card) | Hugging Face |
| Llama-3.3-70B-Instruct | 70B denso | 128K | 20,90 % | Llama 3.3 Community License | Hugging Face |
| Qwen2.5-72B-Instruct | 72B denso | 128K | 10,20 % | Apache 2.0 | Hugging Face |

La comparativa se limita a la metrica SimpleQA declarada por el autor; no hay datos de otros benchmarks que permitan una comparacion mas amplia.

## Limitaciones y advertencias

- Los resultados de benchmarks son declarados por el autor y figuran como `verified: false` en el model-index; no han sido validados de forma independiente.
- El modelo es un adaptador LoRA: requiere descargar y cargar el modelo base de 70B, con el coste de infraestructura asociado.
- La model card no detalla el dataset de entrenamiento ni el metodo exacto de "epistemic steering", lo que dificulta auditar el comportamiento y reproducir el entrenamiento.
- La mejora se centra en facturacion de formato corto (SimpleQA); no hay evidencia publicada de que el steering no degrade el rendimiento en matematicas, codigo o razonamiento largo, capacidades clave del modelo base.
- Riesgo de alucinacion residual: la tasa global declarada es del 18,25 %, no cero; la particion verificada con 0 % corresponde solo a un subconjunto.
- Idiomas soportados no documentados; el comportamiento en castellano no esta evaluado.
- La licencia Apache 2.0 del adaptador debe combinarse con la licencia del modelo base (DeepSeek-R1-Distill-Llama-70B), cuyos terminos conviene revisar antes de uso comercial.
- El prompt de ejemplo incluye instrucciones especificas de invariantes epistemicos; el comportamiento puede depender de ese formato de prompt y degradarse con otras plantillas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema y soporte comunitario practicamente inexistentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sanyamsood/Mahina-4.0-DeepSeek-R1-Distill-70B
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Llama-70B
- Scorecard de evaluacion (referenciado en la model card): `verified_results/mahina4_deepseek70b_simpleqa_scorecard.json` dentro del repositorio
- Paper de referencia de OpenAI SimpleQA: no disponible en la informacion proporcionada
- Blog o demo del autor: no disponible en la informacion proporcionada
- Repositorio de codigo: no disponible en la informacion proporcionada
