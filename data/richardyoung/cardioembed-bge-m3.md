# richardyoung/CardioEmbed-BGE-M3

## Resumen

CardioEmbed-BGE-M3 es un adaptador LoRA sobre el modelo de embeddings multilingue BAAI/bge-m3, especializado en texto clinico de cardiologia. Lo desarrolla Richard Young (DeepNeuro) como parte de un estudio comparativo de diez arquitecturas de embeddings para representacion de texto cardiaco, publicado en arXiv:2511.19739. El modelo no se distribuye como pesos completos, sino como un adaptador PEFT que debe cargarse sobre el checkpoint original de BGE-M3.

El problema que aborda es la perdida de matiz semantico que sufren los modelos de embeddings genericos cuando se aplican a vocabulario y relaciones conceptuales muy especificas de la cardiologia (por ejemplo, distinguir entre tipos de arritmia, grados de estenosis o categorias de insuficiencia cardiaca). El ajuste se realiza sobre 106.535 pares de texto extraidos de libros de texto medicos, con el objetivo de mejorar la separacion semantica en tareas de similitud y recuperacion dentro de ese dominio.

Es relevante por su caracter abierto (licencia Apache 2.0) y por su enfoque ligero: al ser un adaptador LoRA de rango 16, el coste de almacenamiento y de adaptacion es minimo frente a un reentrenamiento completo, y el resultado se puede integrar en pipelines de sentence-transformers existentes que ya usen BGE-M3. La contrapartida es que hereda el tamano y los requisitos de inferencia del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer encoder BAAI/bge-m3 |
| Parametros totales | no disponible (depende del modelo base BGE-M3; el adaptador LoRA r=16, alpha=32 es una fraccion minima) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base BGE-M3) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 16 y alpha 32 aplicado sobre BAAI/bge-m3, un encoder transformer orientado a generacion de embeddings de frases. No se modifica la arquitectura base; el adaptador inyecta matrices de bajo rango en las capas del modelo original para especializar las representaciones hacia el dominio cardiaco. La carga se realiza con `PeftModel.from_pretrained` sobre el checkpoint de BGE-M3.

El entrenamiento utiliza 106.535 pares de texto de cardiologia procedentes de libros de texto medicos, con una funcion de perdida Multiple Negatives Ranking Loss (InfoNCE), habitual en el ajuste de modelos de similitud de frases. No se especifican en la informacion disponible el numero total de tokens, la composicion detallada del dataset, ni si se aplicaron etapas adicionales de RLHF o DPO (no procede en un modelo de embeddings). La innovacion principal es la adaptacion de dominio mediante LoRA sobre un encoder ya multilingue, manteniendo bajo el coste de entrenamiento y distribucion.

## Capacidades

- Generacion de embeddings de frases para similitud semantica y recuperacion de informacion en texto de cardiologia.
- Especializacion en terminologia y relaciones conceptuales del dominio cardiaco (patologias, procedimientos, hallazgos clinicos).
- Integracion con el ecosistema sentence-transformers y con el pipeline `sentence-similarity`.
- Compatible con el resto de capacidades del modelo base BGE-M3 en la medida en que el adaptador no las degrade (no verificado en la informacion disponible).
- Soporte multilingue limitado: la model card declara unicamente ingles, aunque el modelo base es multilingue.
- No se documentan capacidades de tool calling, agentes, vision ni audio.

## Casos de uso

- Busqueda semantica en bases de conocimiento cardiologico: indexar guias clinicas, articulos y protocolos, y recuperar fragmentos relevantes mediante similitud de embeddings especializados en el dominio.
- Sistemas de preguntas y respuestas sobre literatura cardiaca: usar el modelo como retriever en un pipeline RAG donde la precision en vocabulario clinico es critica.
- Deduplicacion y agrupacion de registros clinicos: detectar notas o descripciones de pacientes semanticamente equivalentes pese a variaciones de redaccion.
- Clasificacion y clustering de textos cardiacos: agrupar informes o resumenes por patologia subyacente a partir de sus embeddings.
- Motor de recomendacion de contenido medico: sugerir articulos o casos clinicos similares a partir de un texto de referencia.
- Evaluacion comparativa de arquitecturas de embeddings: reutilizar este adaptador como referencia en estudios de dominio, dado que forma parte de un benchmark de diez modelos.
- Filtrado de literatura para revisiones sistematicas: priorizar candidatos por similitud semantica con criterios de inclusion cardiacos.

## Benchmarks y rendimiento

La model card reporta una unica metrica propia del estudio:

| Metrica | Valor |
|---|---|
| Separation Score | 0.209 |

No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, MTEB u otros) ni comparaciones numericas con modelos alternativos.

## Requisitos de hardware

- VRAM estimada: no disponible de forma especifica; la inferencia requiere cargar el modelo base BGE-M3 completo mas el adaptador LoRA, por lo que el consumo vendra determinado por BGE-M3 y la precision elegida.
- GPU recomendadas: no disponible en la informacion proporcionada; al tratarse de un encoder, cabe esperar que sea ejecutable en GPUs de consumo, aunque no se confirma con datos.
- Cabe en GPU de consumo: no confirmado en la informacion disponible.
- Opciones de despliegue: carga via `transformers` + `peft` segun el ejemplo de la model card; integracion con sentence-transformers; no se documentan opciones especificas para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CardioEmbed-BGE-M3 | Adaptador LoRA sobre BGE-M3 | no disponible | Cardiologia clinica | apache-2.0 | Hugging Face (adaptador) |
| BAAI/bge-m3 (base) | no disponible en la informacion | no disponible | Generico multilingue | no disponible en la informacion | Hugging Face |
| Otros modelos del estudio (9 restantes) | no disponible | no disponible | Cardiologia clinica | no disponible | no disponible |

No se dispone de datos numericos comparativos entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo se distribuye solo como adaptador LoRA; es imprescindible cargar BAAI/bge-m3 como base, lo que anade dependencia y coste de inferencia.
- La model card declara soporte unicamente en ingles, pese a que el modelo base es multilingue; el rendimiento en otros idiomas no esta verificado.
- El ajuste se limita a texto de cardiologia procedente de libros de texto; puede generalizar mal a otros dominios medicos o a lenguaje clinico real de historiales.
- Riesgo de sesgo derivado de las fuentes de entrenamiento (libros de texto), que pueden sobrerrepresentar ciertas perspectivas o terminologias.
- No se documentan evaluaciones de robustez, calibracion ni tasas de error en tareas de recuperacion.
- Uso clinico: no debe emplearse como herramienta de decision medica sin validacion externa; es un componente de recuperacion, no un sistema diagnostico.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base BGE-M3 tiene su propia licencia que debe verificarse por separado.
- El repositorio tiene un tamano de 0.0 GB y muy pocas descargas (12) en el momento de la consulta; la madurez y el mantenimiento del proyecto son limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richardyoung/CardioEmbed-BGE-M3
- Modelo base: https://huggingface.co/BAAI/bge-m3
- Paper: https://arxiv.org/abs/2511.19739
- Perfil del autor: https://deepneuro.ai/richard
