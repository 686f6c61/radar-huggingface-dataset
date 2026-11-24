# mradermacher/zephyr-7b-truthy-GGUF

## Resumen

`mradermacher/zephyr-7b-truthy-GGUF` es una coleccion de cuantizaciones en formato GGUF del modelo `vicgalle/zephyr-7b-truthy`, un ajuste fino de Zephyr-7B-beta orientado a mejorar la veracidad de las respuestas mediante DPO (Direct Preference Optimization) sobre el dataset `jondurbin/truthy-dpo-v0.1`. El trabajo de cuantizacion lo firma mradermacher, un publicador habitual de pesos GGUF para llama.cpp y derivados, que en este caso ofrece variantes estaticas (Q2_K a f16) del modelo original.

El modelo subyacente es un transformer decoder-only de 7.241.732.096 parametros (aproximadamente 7.240 millones), con la arquitectura estandar de la familia Mistral/Zephyr: 32 capas, atencion con sliding window y un contexto nativo de 32.768 tokens. Al estar cuantizado en GGUF, el objetivo principal es permitir la inferencia local en CPU y en GPUs de consumo, reduciendo el peso desde los ~14,6 GB en f16 hasta los 2,8 GB del quant Q2_K.

La relevancia de esta ficha es practica: el modelo original ya esta descatalogado en la practica (Zephyr-7B-beta es de 2023), pero las cuantizaciones GGUF siguen siendo utiles para experimentacion con alineamiento por preferencias, despliegues en hardware modesto y evaluacion de tecnicas de DPO sobre modelos pequenos. La licencia Apache 2.0 facilita su uso comercial, aunque el rendimiento actual queda lejos de los modelos de 7B de 2024-2025.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Mistral/Zephyr) |
| Parametros totales | 7.241.732.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Zephyr-7B-beta declara 32.768 tokens) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base `vicgalle/zephyr-7b-truthy` parte de Zephyr-7B-beta, un transformer decoder-only de ~7.240 millones de parametros con 32 capas, atencion multi-cabeza con Grouped-Query Attention (GQA) y sliding window attention, entrenado originalmente por HuggingFace H4 sobre Mistral-7B-v0.1 con SFT y DPO. Sobre esa base, vicgalle aplico una segunda fase de DPO utilizando el dataset `jondurbin/truthy-dpo-v0.1`, disenado especificamente para penalizar respuestas incorrectas o alucinadas y favorecer la veracidad factual.

El resultado es un ajuste de alineamiento adicional que no cambia la arquitectura ni el tokenizador, sino unicamente la distribucion de preferencias del modelo. No se dispone en la informacion proporcionada de detalles sobre el numero exacto de pasos de DPO, hiperparametros, composicion del dataset o si se emplearon tecnicas adicionales como rejection sampling. La cuantizacion realizada por mradermacher es estatica (no imatrix); para variantes con imatrix el autor remite a `mradermacher/zephyr-7b-truthy-i1-GGUF`.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles, con formato de chat compatible con la plantilla de Zephyr (system/user/assistant).
- Razonamiento basico y respuesta a preguntas factuales, con un sesgo declarado hacia la veracidad por el DPO sobre truthy-dpo.
- Generacion de codigo y explicaciones tecnicas a nivel de modelo de 7B de 2023 (competente en tareas simples, limitado en tareas complejas).
- Aritmetica y matematicas escolares, sin garantias en problemas de varios pasos.
- Capacidad de seguir instrucciones y mantener rol de sistema.
- Soporte de tool calling: no disponible de forma nativa (Zephyr-7B-beta no incluye entrenamiento especifico de function calling).
- Soporte de agentes y multi-step reasoning: limitado; no hay entrenamiento especifico de agentes.
- Capacidades multimodales (vision, audio): no disponibles.
- Modo thinking explicito: no disponible.

## Casos de uso

- Experimentacion con DPO y alineamiento: util como punto de partida para comparar el efecto de `truthy-dpo-v0.1` frente a Zephyr-7B-beta sin DPO adicional, en entornos de investigacion con presupuesto de computo reducido.
- Despliegue local en portatiles: el quant Q4_K_M (4,5 GB) permite ejecutar el modelo en una GPU de consumo de 8 GB o en CPU con llama.cpp, adecuado para prototipos offline y demos personales.
- Generacion de respuestas en ingles para asistentes de documentacion tecnica: el modelo puede redactar explicaciones y resumir textos en ingles con calidad aceptable para un 7B, siempre con revision humana.
- Evaluacion de tecnicas de cuantizacion: la disponibilidad de 12 variantes (Q2_K a f16) permite medir el impacto de la cuantizacion en perplejidad y calidad de respuesta sobre un mismo checkpoint, algo util para investigacion en eficiencia.
- Filtrado y clasificacion de texto en ingles: tareas de etiquetado simple, extraccion de entidades o reformulacion donde no se requiere razonamiento profundo.
- Base para fine-tuning adicional: al estar bajo Apache 2.0 y en formato GGUF, sirve como referencia para comparar pipelines de cuantizacion propios (llama.cpp, Ollama) antes de invertir en modelos mayores.
- Educacion y docencia: ejemplo didactico de como un ajuste DPO sobre un modelo pequeno modifica el comportamiento conversacional, sin necesidad de infraestructura grande.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF no incluye metricas (MMLU, HumanEval, GSM8K, TruthfulQA) ni comparaciones numericas con el modelo base. Tampoco se dispone de datos de perplejidad especificos para cada quant en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia (peso de pesos + overhead de contexto):
  - Q2_K: ~3,5 GB
  - Q3_K_M: ~4,3 GB
  - Q4_K_M: ~5,2 GB
  - Q5_K_M: ~6,0 GB
  - Q6_K: ~6,8 GB
  - Q8_0: ~8,5 GB
  - f16: ~15,5 GB
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090, A100 40 GB, H100 80 GB (estas dos ultimas sobredimensionadas para un 7B).
- Cabe en GPU de consumo: si, en RTX 3060 12 GB con Q5_K_M o Q6_K, y en GPUs de 8 GB con Q4_K_M. En GPUs de 6 GB solo Q2_K/Q3_K con contexto corto.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, koboldcpp. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones; para esos motores conviene usar el modelo base en safetensors.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Como referencia cualitativa, un 7B en Q4_K_M sobre una RTX 4090 suele superar las decenas de tokens por segundo, pero no hay medicion publicada para este checkpoint concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| mradermacher/zephyr-7b-truthy-GGUF (este) | 7.240 M | no disponible (base: 32.768) | GGUF | Apache 2.0 | DPO sobre truthy-dpo; solo ingles |
| vicgalle/zephyr-7b-truthy (base) | 7.240 M | 32.768 | safetensors | Apache 2.0 | Modelo original sin cuantizar |
| Zephyr-7B-beta (HuggingFace H4) | 7.240 M | 32.768 | safetensors | MIT | Base del ajuste; sin DPO de veracidad |
| Mistral-7B-Instruct-v0.2 | 7.240 M | 32.768 | safetensors/GGUF | Apache 2.0 | Alternativa mas reciente y mejor evaluada en benchmarks generales |

No se dispone de comparaciones numericas de rendimiento entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles de forma declarada; el rendimiento en castellano no esta garantizado y probablemente sea deficiente.
- Riesgo de alucinacion: aunque el DPO sobre `truthy-dpo-v0.1` busca reducirlo, no lo elimina; el modelo sigue siendo un 7B de 2023 y puede inventar hechos, citas y datos.
- Sesgos conocidos: hereda los sesgos de Mistral-7B-v0.1 y de los datasets de preferencias empleados; no se documentan evaluaciones de sesgo en la informacion disponible.
- Contexto: la longitud de contexto del checkpoint cuantizado no se especifica en la model card; conviene asumir el limite del modelo base (32.768 tokens) y verificar en llama.cpp.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Zephyr-7B-beta se distribuye bajo MIT; conviene revisar la cadena de licencias antes de un despliegue comercial.
- Modelo descatalogado en la practica: Zephyr-7B-beta es de 2023 y esta superado por alternativas de 7B-8B de 2024-2025 en razonamiento, codigo y multilingue.
- No soporta tool calling nativo ni modo thinking; no es adecuado como base para agentes autonomos sin ingenieria adicional.
- Las cuantizaciones Q2_K y Q3_K_S degradan notablemente la calidad; para produccion se recomienda Q4_K_M o superior.
- El repo ocupa 63,9 GB por incluir todas las variantes; descargar solo el fichero GGUF necesario.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/zephyr-7b-truthy-GGUF
- Modelo base: https://huggingface.co/vicgalle/zephyr-7b-truthy
- Variantes con imatrix: https://huggingface.co/mradermacher/zephyr-7b-truthy-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#zephyr-7b-truthy-GGUF
- Dataset de DPO: https://huggingface.co/datasets/jondurbin/truthy-dpo-v0.1
- Zephyr-7B-beta (modelo de partida): https://huggingface.co/HuggingFaceH4/zephyr-7b-beta
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
