# baobabtech/evalexplorer-classify-qwen3.5-4b-sft

## Resumen

evalexplorer-classify-qwen3.5-4b-sft es un adaptador LoRA de ajuste supervisado (SFT) publicado por baobabtech sobre el modelo base unsloth/Qwen3.5-4B. Su única función es clasificar las primeras páginas de un informe de evaluación de desarrollo internacional y devolver un objeto JSON con cinco campos: `evaluation_approach`, `evaluation_type`, `temporality`, `themes` y `countries`. No es un modelo de propósito general, sino un componente especializado de un pipeline de ingesta documental.

El adaptador se entrenó con 1.148 documentos del corpus baobabtech/evalexplorer-data (configuración `classify_codes`) mediante LoRA con r=16, alpha=16, dos épocas y pérdida calculada únicamente sobre la respuesta. El repositorio ocupa 0,1 GB porque contiene solo los pesos del adaptador, no el modelo completo.

Es relevante como ejemplo de "modelo de tarea" pequeño y verificable: alcanza un 100 % de JSON válido y una puntuación media por campo de 0,847 sobre 134 documentos de test. Ahora bien, las métricas miden la concordancia con las etiquetas generadas por el propio pipeline de ingesta (no revisadas por personas), por lo que no deben interpretarse como exactitud real. El autor lo describe explícitamente como un modelo exploratorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible para una descripcion del transformer base; el artefacto publicado es un adaptador LoRA sobre unsloth/Qwen3.5-4B |
| Parametros totales | no disponible (el modelo base se denomina Qwen3.5-4B, lo que sugiere del orden de 4.000 millones de parametros, sin confirmar en la informacion disponible) |
| Parametros activos | no aplica / no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | no disponible (el ejemplo de uso configura `max_seq_length=8192`) |
| Tipos de cuantizacion | no disponible para el adaptador; se distribuye en bf16 (adaptador LoRA). El ejemplo oficial carga el modelo base con `load_in_4bit=False` |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, libreria `peft`) |
| Modelo base | unsloth/Qwen3.5-4B |
| Metodo de ajuste | SFT con LoRA (r=16, alpha=16, todas las capas lineales del bloque de lenguaje) |
| Tamano del repositorio | 0,1 GB |
| Region declarada | eu |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde al modelo base Qwen3.5-4B, del que no se proporcionan detalles estructurales en la información disponible. Sobre él se aplicó un ajuste LoRA supervisado: r=16, alpha=16, aplicado a todas las capas lineales del bloque de lenguaje, en precisión bf16, con tasa de aprendizaje 0,0002, dos épocas, batch de 2 con 8 pasos de acumulación de gradiente (batch efectivo 16) y cálculo de pérdida únicamente sobre los tokens de la respuesta. El entrenamiento se realizó en GPU y tardó 33,9 minutos.

Los datos de entrenamiento son 1.148 documentos de la configuración `classify_codes` del dataset baobabtech/evalexplorer-data. La supervisión no procede de anotación humana: las etiquetas fueron generadas por el LLM del pipeline de ingesta de EvalExplorer. El autor advierte además que el informe de ejecución puntúa las mismas respuestas contra un reetiquetado independiente con GLM-5.3-Flash que el modelo nunca vio, y que la versión siguiente prevista se entrenará sobre esas etiquetas GLM.

## Capacidades

- Clasificación de documentos: a partir de las primeras páginas de un informe de evaluación de desarrollo internacional, genera un JSON con los campos `evaluation_approach`, `evaluation_type`, `temporality`, `themes` y `countries`.
- Salida estructurada estricta: en el conjunto de test produjo JSON válido en el 100 % de los casos con decodificación greedy.
- Campos de código único o múltiple: `evaluation_approach`, `evaluation_type` y `temporality` son de etiqueta única; `themes` y `countries` son listas evaluadas con micro-F1.
- Inferencia sin modo pensamiento: el uso previsto es con `enable_thinking=False`; no se documenta comportamiento en modo razonamiento.
- No se documentan capacidades de generación libre, código, matemáticas, visión, audio, tool calling ni uso como agente.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Ingesta automatizada de repositorios de evaluación: al recibir un informe en PDF, se extraen las primeras páginas, se construye el prompt del dataset y el modelo devuelve los cinco campos en JSON para indexar el documento en la base de datos del pipeline EvalExplorer.
- Enrutado y clasificación temática: los campos `themes` permiten asignar automáticamente cada informe a áreas programáticas (por ejemplo, salud, educación, gobernanza) para alimentar paneles de seguimiento.
- Normalización geográfica: `countries` permite poblar metadatos de país sin intervención manual, útil para portales institucionales con miles de informes.
- Control de calidad y detección de metadatos ausentes: comparar la salida del modelo con la ficha existente de un informe ayuda a localizar registros mal etiquetados o incompletos.
- Filtrado y búsqueda facetada: los campos `evaluation_type` y `temporality` generan facetas de búsqueda (tipo de evaluación, periodo) sobre un catálogo documental.
- Curación de conjuntos de datos: el adaptador puede usarse para preetiquetar corpus nuevos antes de una revisión humana, reduciendo el coste de anotación en proyectos de evaluación.
- Evaluación de pipelines comparables: al ser un adaptador pequeño y con métricas publicadas frente a etiquetas de pipeline, sirve como referencia reproducible al comparar distintas estrategias de clasificación (véase el dataset de experimentos).

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 134 documentos de test, con decodificación greedy y modo pensamiento desactivado:

| Metrica | Test (134 documentos) |
|---|---|
| JSON valido | 1,000 |
| Exact match (los cinco campos) | 0,291 |
| Puntuacion media por campo | 0,847 |
| Precision evaluation_approach | 0,858 |
| Precision evaluation_type | 0,828 |
| Precision temporality | 0,813 |
| Micro-F1 themes | 0,826 |
| Micro-F1 countries | 0,871 |

Advertencia del propio autor: el modelo se entrenó y se evalúa contra las etiquetas LLM del pipeline de ingesta de EvalExplorer, que ninguna persona ha revisado. Por tanto, estas cifras miden la concordancia con ese pipeline, no la corrección de las predicciones. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- El repositorio del adaptador ocupa 0,1 GB, pero es necesario cargar el modelo base Qwen3.5-4B completo para la inferencia.
- VRAM estimada para un modelo de aproximadamente 4.000 millones de parámetros: en torno a 8-10 GB en bf16/fp16 y en torno a 3-4 GB en cuantización de 4 bits. Son estimaciones de orden de magnitud, no datos publicados para este modelo.
- El ejemplo oficial emplea `load_in_4bit=False`, es decir, sin cuantización, con `max_seq_length=8192`; ese ajuste exige más memoria que una carga en 4 bits.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una GPU consumer de gama alta con 16-24 GB (por ejemplo, RTX 4090 o RTX 3090) debería ser suficiente para inferencia en bf16, y una GPU de 8 GB podría bastar con cuantización de 4 bits. No hay confirmación oficial.
- El entrenamiento se realizó en GPU y consumió 33,9 minutos, sin detallar el modelo concreto.
- Opciones de despliegue: el autor documenta exclusivamente carga mediante Unsloth (`FastModel`) más `PeftModel`. No se mencionan vLLM, llama.cpp, Ollama ni TGI; al ser un adaptador PEFT, la integración con esos motores requiere fusionar previamente el adaptador con el modelo base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros modelos comparables de clasificación documental, ni cifras propias de alternativas. La única referencia cruzada mencionada es un reetiquetado con GLM-5.3-Flash usado como fuente alternativa de etiquetas, no como modelo comparable evaluado en las mismas condiciones.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Datos de rendimiento comparables |
|---|---|---|---|---|---|
| evalexplorer-classify-qwen3.5-4b-sft | no disponible (adaptador sobre Qwen3.5-4B) | no disponible | apache-2.0 | HuggingFace (0 descargas, 0 likes en el momento de la consulta) | Si (tabla de la seccion anterior, solo frente a etiquetas del pipeline) |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Las métricas publicadas miden concordancia con etiquetas generadas por un LLM dentro del propio pipeline de ingesta, no revisadas por personas. No equivalen a exactitud real; el exact match de los cinco campos es de solo 0,291.
- Modelo exploratorio y de alcance muy reducido: está especializado en un único tipo de documento (informes de evaluación de desarrollo internacional) y en cinco campos concretos. Fuera de ese dominio no hay garantía de comportamiento.
- Riesgo de alucinación en los campos `themes` y `countries`, que son listas abiertas y por tanto pueden incluir valores plausibles pero incorrectos.
- Sesgo potencial heredado de los datos de entrenamiento y de las etiquetas del pipeline, no auditado en la información disponible.
- Idiomas soportados no documentados; el rendimiento en documentos en idiomas distintos del usado en el corpus de entrenamiento es desconocido.
- Longitud de contexto no documentada. El ejemplo usa 8192 tokens, suficiente para "las primeras páginas" del informe, pero puede truncar documentos largos.
- Licencia apache-2.0 para el adaptador. Conviene verificar la licencia del modelo base (el enlace de licencia apunta al fichero LICENSE de Qwen/Qwen3.5-4B) antes de un uso comercial.
- Sin descargas ni likes registrados en el momento de la consulta: no hay evidencia de uso en producción ni de validación por terceros.
- Para producción se recomienda fusionar el adaptador con el modelo base, validar las respuestas JSON y aplicar una capa de validación de esquema, además de revisión humana en decisiones sensibles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/baobabtech/evalexplorer-classify-qwen3.5-4b-sft
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Dataset de experimentos: https://huggingface.co/datasets/baobabtech/evalexplorer-classify-experiments
- Codigo del pipeline: https://huggingface.co/datasets/baobabtech/evalexplorer-classify-experiments/tree/main/code
- Dataset de entrenamiento: https://huggingface.co/datasets/baobabtech/evalexplorer-data
- Informe de la ejecucion de test: https://huggingface.co/datasets/baobabtech/evalexplorer-classify-experiments/blob/main/runs/qwen3.5-4b-sft--test/README.md
