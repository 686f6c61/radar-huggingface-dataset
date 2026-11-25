# matterstate/needle-1.0

## Resumen

Needle-1.0 es un modelo discriminativo de 4B parametros desarrollado por matterstate, adaptado del modelo base Qwen/Qwen3.5-4B mediante adaptadores LoRA de rango 16 y un mecanismo de lectura por refinamiento latente de tres ciclos con pesos compartidos. A diferencia de los modelos generativos convencionales, Needle no produce texto: dado un contexto, una pregunta y un conjunto de respuestas permitidas, devuelve la eleccion seleccionada junto con probabilidades calibradas. Esto lo convierte en una pieza de infraestructura para sistemas que necesitan tomar decisiones tipadas y verificables dentro de flujos deterministas.

La propuesta encaja en el patron emergente de modelos especializados en scoring y clasificacion zero-shot, orientados a enrutar herramientas en agentes, triar peticiones de soporte, revisar contenido o evaluar elementos contra una rubrica. El modelo se distribuye con licencia Apache-2.0 y se ejecuta sobre el runtime tinygrad, lo que reduce la dependencia de stacks tradicionales como PyTorch o CUDA y facilita el despliegue en hardware heterogeneo.

Con un contexto de hasta 64K tokens (ejecucion agrupada por longitud en buckets con padding), cuantizacion W4A16 y un tamano de repositorio de 0.1 GB, Needle-1.0 apunta a un nicho concreto: aplicaciones donde la salida debe ser una decision estructurada y auditable, no una respuesta libre. Su relevancia actual radica en la separacion entre razonamiento generativo y decision deterministica, un patron cada vez mas comun en arquitecturas de agentes en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5-4B (32 capas: 24 de atencion lineal, 8 de atencion completa) con LoRA rango 16 y readout de refinamiento latente de 3 ciclos |
| Parametros totales | 4B (heredados del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Hasta 64K tokens (bucket con padding, ejecucion agrupada por longitud) |
| Tipos de cuantizacion | W4A16 (pesos 4 bits, activaciones 16 bits) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | tinygrad (repositorio de 0.1 GB); no se especifican safetensors ni GGUF |

## Arquitectura y entrenamiento

Needle-1.0 parte de Qwen3.5-4B, un transformer de 32 capas que combina 24 capas de atencion lineal con 8 capas de atencion completa, un diseno hibrido orientado a eficiencia en contextos largos. Sobre esta base, matterstate aplica adaptadores LoRA de rango 16 y un mecanismo propio de lectura denominado "refinamiento latente de tres ciclos con pesos compartidos", que transforma el estado oculto del modelo en una distribucion de probabilidad sobre las respuestas permitidas. La inferencia se ejecuta en precision W4A16, lo que reduce el coste de memoria y computo.

El entrenamiento se orienta a la tarea discriminativa: en lugar de predecir el siguiente token, el modelo aprende a puntuar opciones candidatas dadas un contexto y una pregunta. No se han publicado detalles sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO. La model card menciona que la evaluacion se realizo sobre un "candidato de investigacion all-keys" en AMD MI300X, lo que sugiere una fase de exploracion previa a la version publica. La ejecucion agrupada por longitud en buckets de hasta 64K tokens con padding es una innovacion de despliegue que mejora el throughput en lotes heterogeneos.

## Capacidades

- Clasificacion zero-shot: dado un contexto, una pregunta y un conjunto de respuestas permitidas, devuelve la opcion seleccionada con probabilidad calibrada.
- Scoring contra rubricas: puntua elementos frente a criterios definidos, util para evaluacion de contenido o ranking.
- Toma de decisiones tipadas: la salida es una eleccion estructurada, no texto libre, lo que facilita su integracion en logica determinista.
- Enrutamiento de herramientas en agentes: selecciona la herramienta o accion adecuada entre un conjunto predefinido.
- Triaje de peticiones: clasifica solicitudes entrantes en categorias operativas.
- Revision de contenido: evalua si un texto cumple criterios de politica o calidad.
- Contexto largo: hasta 64K tokens, adecuado para documentos extensos o historiales de conversacion.
- Multilingue: evaluado en Global-MMLU-Lite (no ingles) con 58.09% de accuracy, aunque no se detallan los idiomas cubiertos.
- No genera texto libre: su salida es discriminativa, no generativa.

## Casos de uso

- Enrutamiento de herramientas en agentes: el modelo recibe la consulta del usuario y la lista de herramientas disponibles, y devuelve cual invocar con su probabilidad asociada. La logica de la aplicacion aplica despues comprobaciones de permisos y reglas deterministas antes de ejecutar la accion.
- Triaje de tickets de soporte: clasifica cada peticion entrante en categorias predefinidas (facturacion, tecnico, cancelacion, etc.) con probabilidad calibrada, permitiendo umbrales de derivacion a agentes humanos cuando la confianza es baja.
- Revision de contenido contra politicas: evalua si un texto cumple un conjunto de criterios editoriales o de compliance, devolviendo la categoria de incumplimiento mas probable para su revision posterior.
- Evaluacion de respuestas contra rubricas: en pipelines de evaluacion de LLMs, puntua respuestas candidatas frente a criterios definidos, sustituyendo a jueces generativos con una salida mas estable y barata.
- Clasificacion de documentos en contextos largos: con 64K tokens de contexto, puede procesar contratos, informes o expedientes completos y asignarles una categoria sin necesidad de fragmentacion.
- Moderacion de comunidades: clasifica mensajes en categorias de riesgo o incumplimiento de normas, con la probabilidad como senal para escalar a revision humana.
- Seleccion de respuesta en sistemas de retrieval: dado un contexto recuperado y varias respuestas candidatas, elige la mas probable segun el contexto, integrable en pipelines RAG.

## Benchmarks y rendimiento

Resultados publicados por el autor, evaluados en AMD MI300X sobre el candidato de investigacion all-keys:

| Benchmark | Metrica | Puntuacion |
|---|---|---|
| JevBench hard (public) | Accuracy | 77.48% |
| ESCI | Macro-F1 | 46.74% |
| New Yorker Caption (solo texto) | Top-1 accuracy | 54.52% |
| PubMedQA | Accuracy | 72.00% |
| Global-MMLU-Lite (no ingles) | Accuracy | 58.09% |
| When2Call | Top-1 accuracy | 71.63% |
| Atlan | Accuracy | 84.03% |
| Hanno | Accuracy | 75.93% |
| Typed | Accuracy | 66.40% |

La evaluacion de New Yorker Caption usa la descripcion oficial y cinco opciones de caption, sin imagenes ni explicaciones gold. Los elementos fallidos cuentan como incorrectos. No se han publicado comparaciones directas con modelos alternativos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantizacion W4A16 y 4B parametros, el peso del modelo ronda los 2-3 GB; el repositorio distribuido ocupa 0.1 GB, lo que sugiere una representacion muy comprimida o parcial.
- GPU recomendadas: el autor reporta evaluacion en AMD MI300X. Por tamano, el modelo es apto para GPUs de consumo como RTX 4090 (24 GB) o RTX 3090 (24 GB), e incluso GPUs con 8-12 GB segun el overhead del runtime.
- Cabe en GPU de consumo: si, previsiblemente en RTX 3060 12 GB, RTX 4070, RTX 4080 y RTX 4090, dado el tamano de 4B y la cuantizacion W4A16.
- Opciones de despliegue: runtime tinygrad (nativo del modelo). No se menciona soporte para vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles. La ejecucion agrupada por longitud en buckets de hasta 64K tokens sugiere optimizacion para lotes heterogeneos, pero no se publican cifras.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con modelos alternativos en la informacion proporcionada. Como referencia estructural, se compara con el modelo base del que deriva:

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Needle-1.0 | 4B | 64K | Discriminativo (clasificacion/scoring) | Apache-2.0 | Hugging Face, runtime tinygrad |
| Qwen/Qwen3.5-4B | 4B | no disponible en la informacion | Generativo | no disponible en la informacion | Hugging Face |
| Alternativas de clasificacion zero-shot de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (discriminativos con salida tipada y probabilidades calibradas) para establecer una comparativa de rendimiento.

## Limitaciones y advertencias

- El modelo no genera texto: cualquier caso de uso que requiera respuesta libre, resumen o explicacion queda fuera de su alcance.
- Las predicciones son entradas para logica de aplicacion, no un sustituto de hechos, comprobaciones de permisos ni reglas deterministas; el autor lo advierte explicitamente.
- La calibracion de confianza y los umbrales de decision deben validarse en las tareas objetivo antes de usar el modelo en produccion.
- Rendimiento limitado en tareas multilingues: 58.09% en Global-MMLU-Lite (no ingles), lo que sugiere menor fiabilidad fuera del ingles.
- ESCI con Macro-F1 de 46.74% indica dificultad en tareas de intencion de busqueda; no es un modelo universal de clasificacion.
- No se detallan los idiomas soportados ni la composicion del dataset de entrenamiento, lo que dificulta evaluar sesgos.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de seleccion erronea con alta confianza; la calibracion es critica.
- Licencia Apache-2.0 permite uso comercial, pero requiere atribucion al modelo base Qwen/Qwen3.5-4B segun el NOTICE.
- Dependencia del runtime tinygrad: no hay evidencia de soporte para stacks convencionales (vLLM, llama.cpp), lo que puede limitar la integracion en infraestructuras existentes.
- Modelo recien publicado (25 de noviembre de 2026) con 0 descargas y 0 likes: sin validacion comunitaria ni casos de produccion documentados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/matterstate/needle-1.0
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Familia de modelos Needle: https://matterstateresearch.com/needle
- Model card oficial: https://matterstateresearch.com/model-card/needle-1.0
- Informe tecnico: https://matterstateresearch.com/blog/needle-benchmark
- Runtime tinygrad: https://tinygrad.org/
