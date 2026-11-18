# LLMWildling/Flint-Law-42B-A4B-NVFP4-W4A16

## Resumen

Flint-Law-42B-A4B-NVFP4-W4A16 es una cuantizacion en NVFP4 (pesos de 4 bits, activaciones de 16 bits) del modelo Flint Law 42B-A4B, un ajuste fino de Flint orientado a trabajo legal agentico. Lo publica el usuario LLMWildling en Hugging Face y deriva del modelo base RecursiveSI/flint. El modelo original fue afinado con aprendizaje por refuerzo sobre el benchmark Harvey LAB, con 8 tareas y 4 rollouts por paso durante 16 pasos, y declara una mejora de 68,4 frente a 53,6 de Flint en 64 tareas retenidas de Harvey LAB repartidas en 25 areas de practica.

La arquitectura es de tipo mezcla de expertos (MoE) con 42.000 millones de parametros totales y 3.700 millones activos por token, segun la model card. Esta version concreta esta pensada para despliegue eficiente en hardware Blackwell, ya que NVFP4 es un formato de cuantizacion de 4 bits nativo de las GPU NVIDIA de esa generacion, generado con ModelOpt.

Su relevancia actual radica en que combina un dominio especializado (agentes legales) con un formato de cuantizacion agresivo que reduce el peso del checkpoint a unos 24,8 GB, lo que facilita su servicio en una sola GPU profesional. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales declaradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) transformer, segun model card (detalle de capas no disponible) |
| Parametros totales | 42.448.305.952 (42,4B) |
| Parametros activos | 3,7B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 W4A16 (pesos 4 bits, activaciones 16 bits); etiquetado tambien como 8-bit en los tags |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint NVFP4 generado con ModelOpt) |

## Arquitectura y entrenamiento

El modelo base es un MoE con 42,4B de parametros totales y 3,7B activos, lo que implica un reparto de computo por token muy reducido respecto al tamano total. La model card no detalla el numero de expertos, la dimension oculta, el numero de capas ni el mecanismo de enrutamiento, por lo que esos datos no estan disponibles. Tampoco se especifica la longitud de contexto nativa.

El ajuste Flint Law se realizo con aprendizaje por refuerzo sobre 8 tareas de Harvey LAB con 4 rollouts por paso durante 16 pasos, un regimen de entrenamiento muy corto y centrado en el benchmark. La evaluacion se hizo sobre 64 tareas retenidas de 25 areas de practica no vistas en el ajuste, con el harness en el commit f46ef86 (julio de 2026) y juicio por DeepSeek V4.1 Flash, permitiendo hasta dos ejecuciones por tarea (la segunda solo si falla la primera) en igualdad de condiciones para ambos modelos. Esta version NVFP4 se genero con ModelOpt y no anade entrenamiento: es una conversion de precision del checkpoint original.

## Capacidades

- Generacion de texto y razonamiento orientado a tareas legales agenticas.
- Ejecucion de flujos de trabajo legales multi-paso, evaluados en Harvey LAB con 25 areas de practica.
- Razonamiento con posible uso de herramientas dentro de un harness de agente (el benchmark Harvey LAB es agentico), aunque la model card no detalla el esquema de tool calling.
- Capacidad multilingue: no disponible.
- Capacidades de vision o audio: no disponibles.
- Modo de razonamiento explicito (thinking): no disponible.

## Casos de uso

- Revision de contratos asistida: el modelo puede analizar clausulas y senalar riesgos en documentos legales, aprovechando su ajuste sobre tareas de practica legal real evaluadas en Harvey LAB.
- Investigacion jurisprudencial agentica: integrado en un harness de agente, puede encadenar busquedas, lectura de fuentes y sintesis de conclusiones sobre un caso concreto.
- Redaccion de borradores de escritos y memorandos: genera texto legal estructurado a partir de hechos y precedentes aportados en el contexto.
- Due diligence documental: procesa lotes de documentos y extrae obligaciones, plazos y partes implicadas para su revision posterior por un profesional.
- Automatizacion de flujos de cumplimiento normativo: clasifica y prioriza incidencias regulatorias dentro de un pipeline interno, con intervencion humana en la decision final.
- Despliegue en hardware Blackwell: al estar en NVFP4, cabe en una sola GPU profesional de esa generacion, lo que permite servir el modelo en infraestructura propia con coste contenido.
- Evaluacion comparativa de agentes legales: sirve como referencia cuantizada para reproducir los resultados de Harvey LAB con el harness indicado.

## Benchmarks y rendimiento

| Benchmark | Flint Law 42B | Flint (base) | Delta |
|---|---|---|---|
| Harvey LAB (64 tareas retenidas, 25 areas) | 68,4 | 53,6 | +14,7 (+27%) |

Datos segun la model card, con harness en el commit f46ef86 (julio de 2026) y juicio por DeepSeek V4.1 Flash, hasta dos ejecuciones por tarea. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- Peso del checkpoint: 24,8 GB en el repositorio, coherente con pesos NVFP4 de 4 bits sobre 42,4B de parametros.
- VRAM estimada para inferencia: alrededor de 25-30 GB para pesos y overhead, dependiendo de la longitud de contexto y del tamano de lote; el dato exacto no esta disponible.
- GPU recomendadas: NVIDIA Blackwell (serie B200, RTX 50xx) por soporte nativo de NVFP4; el formato puede no ejecutarse en generaciones anteriores sin conversion.
- Cabe en GPU de consumo de gama alta con 24 GB o mas solo si el overhead de activaciones y cache KV es reducido; con contexto largo es probable que requiera 32 GB o mas.
- Opciones de despliegue: no disponibles en la informacion proporcionada; al ser NVFP4 generado con ModelOpt, se espera soporte en TensorRT-LLM y vLLM con kernels NVFP4, pero no se confirma en la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Harvey LAB |
|---|---|---|---|---|---|---|
| Flint-Law-42B-A4B-NVFP4-W4A16 | 42,4B | 3,7B | no disponible | Apache 2.0 | NVFP4 safetensors | 68,4 |
| Flint (base) | no disponible | no disponible | no disponible | no disponible | no disponible | 53,6 |
| Flint Law 42B (checkpoint original) | 42B | 3,7B | no disponible | Apache 2.0 (segun model card) | no disponible | 68,4 |

No se dispone de datos de otros modelos legales comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El ajuste se hizo con solo 16 pasos de RL sobre 8 tareas de Harvey LAB; el riesgo de sobreajuste al benchmark y de generalizacion limitada a otras tareas legales es real.
- La evaluacion usa un juez automatico (DeepSeek V4.1 Flash) y hasta dos intentos por tarea, lo que puede inflar la puntuacion respecto a una evaluacion de un solo intento.
- Riesgo de alucinacion en citas, articulos y jurisprudencia: no hay garantia de verificabilidad de las fuentes generadas.
- No se documentan sesgos conocidos, idiomas soportados ni longitud de contexto, lo que dificulta evaluar su idoneidad en produccion multilingue.
- El formato NVFP4 limita el hardware compatible; en GPU sin soporte nativo habra que convertir el checkpoint, con posible perdida de calidad o rendimiento.
- Uso legal en produccion: requiere supervision de un profesional cualificado; el modelo no sustituye el asesoramiento juridico.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y los datos de entrenamiento pueden arrastrar obligaciones no declaradas en la model card.

## Enlaces

- Hugging Face: https://huggingface.co/LLMWildling/Flint-Law-42B-A4B-NVFP4-W4A16
- Modelo base: https://huggingface.co/RecursiveSI/flint
