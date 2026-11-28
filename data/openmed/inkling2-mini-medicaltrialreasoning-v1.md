# OpenMed/Inkling2-Mini-MedicalTrialReasoning-v1

## Resumen

Inkling2-Mini-MedicalTrialReasoning-v1 es un ajuste fino (fine-tune) desarrollado por OpenMed sobre el modelo base Inkling 2 Mini de Thinking Machines Lab. Resuelve un problema muy concreto y acotado dentro del dominio clínico: leer los recuentos de participantes afectados y en riesgo de dos grupos de un ensayo clínico, calcular las tasas observadas de eventos adversos graves o de muertes, y responder en una única línea verificable con las fracciones, los porcentajes redondeados a un decimal y la conclusión (grupo A, grupo B o empate). El modelo está pensado para que la aritmética sea auditable, no para generar prosa libre.

El modelo se distribuye como un checkpoint autónomo de aproximadamente 19,5 GB en formato mixto NVFP4 y MXFP8, con 26.388.646.440 parámetros totales según los safetensors del repositorio. La arquitectura declarada es `inkling2_loop`, con pipeline `image-text-to-text` y `text-generation`, lo que indica un transformer multimodal con mecanismo de bucle recurrente propio de la familia Inkling. La licencia es Apache-2.0 y el único idioma declarado es el inglés.

Su relevancia actual reside en la especialización extrema: frente al modelo base, que con el mismo prompt y el mismo presupuesto de respuesta corta solo produce una respuesta completa trabajada en el 30,8% de los casos, este fine-tune alcanza el 98,3% en una muestra de 120 ensayos de 61 patrocinadores no vistos en entrenamiento. Es una herramienta de nicho para pipelines de farmacovigilancia y revisión de resultados de ensayos, no un asistente clínico general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `inkling2_loop` (transformer multimodal con bucle recurrente, familia Inkling) |
| Parametros totales | 26.388.646.440 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos en formato mixto NVFP4 y MXFP8; tag `8-bit` y `modelopt` (cuantizacion de NVIDIA ModelOpt) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura `inkling2_loop` del base Inkling 2 Mini de Thinking Machines Lab, un transformer con mecanismo de bucle recurrente y capacidades multimodales (pipeline `image-text-to-text`). El checkpoint se distribuye ya cuantizado en un formato mixto NVFP4 y MXFP8 generado con ModelOpt, lo que reduce el peso a unos 19,5 GB frente a lo que seria un checkpoint en bf16 con 26.388 millones de parametros. La carga se realiza con `AutoModelForMultimodalLM` de Transformers, con `attn_implementation="eager"` y `experts_implementation="eager"`, lo que sugiere que el modelo incorpora capas con mezcla de expertos aunque el numero de parametros activos no se declara.

El entrenamiento consistio en 600 registros de ensayos de 255 patrocinadores extraidos de ClinicalTrials.gov, con recuentos reales reportados y respuestas aritmeticas exactas generadas como objetivo. Se realizaron 300 pasos de optimizador unicamente sobre los tokens de respuesta, es decir, un ajuste supervisado de instrucciones centrado en el formato de salida y la aritmetica, sin indicios de RLHF ni DPO en la informacion disponible. La evaluacion se hizo sobre 120 ensayos de 61 patrocinadores excluidos del entrenamiento, con tres metricas: respuesta completa trabajada, grupo o empate correcto y consistencia al intercambiar los grupos.

## Capacidades

- Comparacion de tasas de eventos observadas: dado el numero de afectados y en riesgo de dos grupos, calcula las fracciones, los porcentajes a un decimal y determina que grupo tiene la tasa mayor o menor.
- Aritmetica exacta y auditable: la salida incluye la operacion completa en una linea, por ejemplo `A=6/80=7.5%; B=8/160=5.0%; answer=A`.
- Manejo de empates: devuelve `tie` cuando las tasas sin redondear son iguales.
- Robustez al orden de los grupos: la metrica de consistencia con los grupos intercambiados alcanza el 100%.
- Ambito limitado a dos tipos de outcome: eventos adversos graves (serious adverse events) y muertes (deaths).
- Soporte de preguntas en ambos sentidos: tasa mayor o tasa menor.
- Generacion de texto conversacional basica heredada del modelo base, aunque el ajuste esta orientado al formato corto.
- Capacidad multimodal latente por herencia del base (pipeline `image-text-to-text`), no documentada ni evaluada para esta tarea.
- No se documenta soporte de tool calling ni de razonamiento agente multi-paso en la informacion disponible.

## Casos de uso

- Revision automatizada de resultados de ensayos en farmacovigilancia: el modelo recibe los recuentos de eventos adversos graves de dos brazos y devuelve la comparacion con la aritmetica visible, lo que permite que un revisor humano verifique la operacion en un solo vistazo sin recalcular manualmente.
- Extraccion y normalizacion de tablas de seguridad en registros de ClinicalTrials.gov: integrado en un pipeline que parsea las tablas de resultados, el modelo transforma pares de recuentos en tasas comparables y auditables para bases de datos internas.
- Control de calidad de resumenes de seguridad generados por otros sistemas: se usa como verificador aritmetico que recalcula las tasas y detecta discrepancias entre el texto de un informe y los recuentos originales.
- Generacion de fichas de seguridad para comites de seguimiento: dado un lote de ensayos, produce lineas homogeneas con formato fijo que se agregan directamente en hojas de calculo o informes regulatorios internos.
- Docencia y formacion en metodologia de ensayos clinicos: sirve como ejemplo trabajado de calculo de tasas de incidencia por brazo, mostrando fraccion y porcentaje con redondeo controlado.
- Deteccion de desequilibrios entre brazos en revisiones rapidas: al comparar tasas de muertes o eventos graves entre grupo experimental y control, permite priorizar que ensayos requieren revision estadistica formal.
- Pruebas de regresion en pipelines de NLP clinico: su salida determinista con decodificacion greedy y su formato estricto lo hacen util como caso de prueba para validar el parseo de respuestas estructuradas.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index, sobre 120 ensayos de ClinicalTrials.gov de 61 patrocinadores no incluidos en entrenamiento (split `development`):

| Metrica | Resultado | Verificado |
|---|---|---|
| Respuesta completa trabajada (Complete worked answer) | 98,33% (118/120) | No |
| Grupo o empate correcto (Correct group or tie) | 100% (120/120) | No |
| Misma decision con los grupos intercambiados | 100% | No |

Comparacion con el modelo base declarada en la model card: Inkling 2 Mini original, con el mismo prompt y el mismo presupuesto de respuesta corta, produce una respuesta completa trabajada en el 30,8% de los casos (37 de 120). No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa unos 19,5 GB en disco en formato NVFP4/MXFP8; se recomienda al menos 24 GB de VRAM para cargarlo en una sola GPU con margen para el contexto y los estados de activacion.
- GPU recomendadas: A100 (40/80 GB), H100, L40S y RTX 4090 (24 GB) como minimo practico para el checkpoint cuantizado. El ejemplo oficial usa `device_map={"": "cuda"}` en una unica GPU CUDA.
- Cabe en GPU de consumo: si, en RTX 4090 de 24 GB y previsiblemente en RTX 3090 de 24 GB, siempre que se respete el formato cuantizado distribuido y no se recargue en bf16.
- Opciones de despliegue: Transformers con `AutoModelForMultimodalLM` (probado con una revision concreta de Transformers), `accelerate` y `torch`. No se documenta soporte verificado de vLLM, llama.cpp, Ollama ni TGI en la informacion disponible; el tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face.
- Latencia y throughput: no disponibles. La generacion esta limitada a 56 tokens nuevos con decodificacion greedy en el ejemplo oficial, lo que acota la latencia por peticion, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling2-Mini-MedicalTrialReasoning-v1 | 26.388 M | no disponible | Comparacion de tasas de eventos en ensayos | Apache-2.0 | Hugging Face (OpenMed) |
| Inkling 2 Mini (base) | no disponible en la informacion | no disponible | Generacion multimodal y texto general | Apache-2.0 | Hugging Face (Thinking Machines Lab) |
| Modelos medicos generalistas de la familia OpenMed | no disponible | no disponible | NER clinico, desidentificacion, ensayos | Apache-2.0 (mayoria) | Hugging Face (OpenMed) |

La comparacion directa mas relevante es con el modelo base: mismo tamano y licencia, pero el fine-tune multiplica por mas de tres la tasa de respuestas completas trabajadas (98,3% frente a 30,8%) en la tarea especifica. Frente a modelos medicos generalistas no se dispone de datos de benchmarks comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Ambito muy restringido: solo maneja comparaciones de tasas entre dos grupos para eventos adversos graves o muertes; no responde preguntas clinicas generales ni razona sobre otras metricas.
- Idioma unico: entrenado y evaluado solo en ingles; el rendimiento en castellano u otros idiomas no esta documentado y previsiblemente sera deficiente.
- Sensibilidad al prompt: el formato de instruccion, la linea `Outcome:`, las lineas `Group` y el sufijo `Response:` son los usados en entrenamiento; desviarse de ellos puede degradar la salida.
- Riesgo de alucinacion aritmetica: aunque la metrica de respuesta completa es del 98,3%, no es del 100%; en 2 de 120 casos la respuesta trabajada fue incompleta, por lo que la verificacion humana de la operacion sigue siendo necesaria.
- Benchmarks no verificados: los resultados del model-index estan marcados como `verified: false` y proceden del propio autor, sin replicacion independiente.
- Uso clinico: no es un dispositivo medico ni sustituye la revision estadistica o regulatoria; cualquier decision sobre seguridad de un ensayo debe validarse con los datos fuente y personal cualificado.
- Licencia Apache-2.0: permite uso comercial, pero el modelo base y el checkpoint cuantizado pueden arrastrar condiciones de las herramientas de cuantizacion (ModelOpt) que conviene revisar.
- Formato de pesos no estandar: al estar en NVFP4/MXFP8, la conversion a otros formatos (GGUF, AWQ, GPTQ) no esta documentada y puede requerir trabajo adicional.
- Adopcion muy baja: 14 descargas y 0 likes en el momento de la consulta, lo que implica poca validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenMed/Inkling2-Mini-MedicalTrialReasoning-v1
- Modelo base Inkling 2 Mini: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Organizacion OpenMed en Hugging Face: https://huggingface.co/OpenMed
- Repositorio OpenMed SDK en GitHub: https://github.com/maziyarpanahi/openmed
- Paquete OpenMed en PyPI: https://pypi.org/project/openmed/
- Perfil de OpenMed en X: https://x.com/OpenMed_AI
- Revision de Transformers usada en las pruebas: https://github.com/huggingface/transformers/commit/046bdb8cc2cee29d233964bb77fe6fd37cfe4aa3
- Paper referenciado en los tags (arXiv:2508.01630): https://arxiv.org/abs/2508.01630
- Fuente de datos de ensayos: https://clinicaltrials.gov
