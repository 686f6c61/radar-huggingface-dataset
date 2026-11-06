# David319193/d3-mini-zils-body

## Resumen

d3-mini-zils-body es un ajuste fino por LoRA fusionado en pesos completos bf16 sobre el chasis d3-mini 4.5B, que a su vez deriva de Qwen/Qwen3.5-4B. Lo publica el usuario David319193 en Hugging Face y lo presenta como su contribucion al "soup pool" de d3-mini dentro de la subred 127 de Bittensor (Zils). El modelo esta pensado como un "decision model": no como un asistente conversacional general, sino como un componente que estima resultados o etiquetas de decision sobre elementos con resultado conocido (categorias de arXiv, discusiones AfD/AfC y reversiones en Wikipedia, merges de Gerrit, preguntas de Stack Exchange).

El problema que aborda es el de la evaluacion automatizada de decisiones en dominios donde existe un historico de resultados etiquetados: moderacion de contenido enciclopedico, triaje de contribuciones de codigo, clasificacion de articulos cientificos o priorizacion de preguntas. El entrenamiento se realizo sobre elementos publicos con etiqueta de resultado, recolectados con la herramienta `zils.current`, lo que sugiere un pipeline orientado a crear senales de preferencia o de exito verificable.

Tecnicamente es un transformer denso de 4.539.265.536 parametros (4,54 mil millones), con pesos en safetensors y bf16, empaquetado con `transformers` y codigo personalizado (`custom_code`), y declarado con pipeline `feature-extraction`. La licencia es Apache-2.0 y el repo ocupa 9,1 GB. No se han publicado datos de contexto, idiomas ni benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen/Qwen3.5-4B, tag `qwen3_5`), con codigo personalizado |
| Parametros totales | 4.539.265.536 (4,54 B) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16, LoRA fusionada en pesos completos) |

## Arquitectura y entrenamiento

El modelo parte del chasis d3-mini 4.5B, descrito por el autor como un ajuste fino de Qwen/Qwen3.5-4B, y aplica sobre el un LoRA entrenado y posteriormente fusionado en pesos completos en bf16. La arquitectura subyacente es, por tanto, la de Qwen3.5-4B: un transformer denso de aproximadamente 4,5 mil millones de parametros. El repositorio incluye `custom_code`, lo que implica que la carga requiere `trust_remote_code=True` y que la implementacion exacta de la cabeza o del flujo de inferencia no es la estandar de `transformers`.

El entrenamiento se realizo sobre "public outcome-labelled decision items": categorias de arXiv, discusiones AfD/AfC y reversiones de Wikipedia, merges de Gerrit y contenido de Stack Exchange, recolectados con la herramienta `zils.current`. No se especifican el numero de tokens, la composicion exacta del dataset, la mezcla de tareas ni si hubo RLHF, DPO o preferencias. Tampoco se documentan innovaciones tecnicas adicionales (atencion lineal, decodificacion especulativa, modo thinking). El pipeline declarado es `feature-extraction`, lo que sugiere un uso como extractor de representaciones o clasificador de decisiones mas que como generador de texto libre.

## Capacidades

- Extraccion de caracteristicas y representaciones sobre texto de entrada (pipeline `feature-extraction`).
- Modelado de decisiones con resultado etiquetado: el entrenamiento apunta a predecir o puntuar el desenlace de un elemento (aceptacion/rechazo, merge/no merge, categoria correcta).
- Clasificacion en dominios especificos: articulos cientificos (categorias arXiv), debates de borrado en Wikipedia, revisiones de codigo en Gerrit y preguntas en Stack Exchange.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su despliegue como servicio de inferencia.
- Capacidades generativas, de razonamiento, codigo, matematicas, vision, audio, tool calling, agentes o multilingues: no disponibles en la informacion proporcionada. El pipeline declarado no es `text-generation`, por lo que no debe asumirse comportamiento conversacional.

## Casos de uso

- Triaje de articulos cientificos: usar el modelo como extractor de caracteristicas o clasificador para asignar categorias de arXiv a preprints entrantes, aprovechando que el entrenamiento incluyo ese dominio y que la tarea es de etiquetado supervisado.
- Moderacion asistida en Wikipedia: puntuar propuestas de borrado (AfD) o de creacion (AfC) y priorizar las que requieren revision humana, dado que el modelo se entreno con discusiones y resultados reales de esos procesos.
- Deteccion de riesgo de reversion: estimar la probabilidad de que una edicion sea revertida, para enrutar ediciones dudosas a revisores experimentados antes de publicarlas.
- Revision de cambios en Gerrit: clasificar parches como candidatos a merge o a revision adicional, integrandolo en un pipeline de CI que consulte el modelo como senal auxiliar.
- Priorizacion de preguntas en Stack Exchange: ordenar o etiquetar preguntas por probabilidad de recibir respuesta aceptada, util para sistemas de recomendacion de contenido o de asignacion de expertos.
- Generacion de senales de preferencia para RLHF: emplear las puntuaciones del modelo como recompensa proxy en la construccion de datasets de preferencias, dado su origen en elementos con resultado verificable.
- Servicio de inferencia ligero: desplegarlo detras de un endpoint compatible para tareas de scoring por lotes, con un tamano de 4,5 B que permite ejecutarlo en una sola GPU de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9,1 GB solo para pesos, mas overhead de activaciones y cache; en la practica, entre 10 y 14 GB segun longitud de secuencia y batch.
- VRAM estimada en cuantizacion de 8 bits: en torno a 5-6 GB de pesos; en 4 bits, en torno a 3 GB de pesos, siempre que se generen variantes cuantizadas (no documentadas por el autor).
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S para despliegue en produccion con lotes grandes; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia en bf16 sin problemas de memoria.
- GPU de consumo: cabe en tarjetas de 16 GB o superiores en bf16 con secuencias moderadas; en 8 bits cabria en GPUs de 8-12 GB, sujeto a conversion previa.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es el camino documentado por el autor; vLLM, TGI, llama.cpp u Ollama no estan confirmados y requeririan verificar compatibilidad con el `custom_code` y con el pipeline de feature extraction.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| d3-mini-zils-body | 4,54 B | no disponible | Apache-2.0 | Decision model (feature extraction) sobre Qwen3.5-4B | Hugging Face, repo de 9,1 GB |
| Qwen/Qwen3.5-4B | ~4 B | no disponible | Apache-2.0 (heredada) | Modelo base generico | Hugging Face |
| d3-mini 4.5B (chasis) | ~4,5 B | no disponible | Apache-2.0 | Chasis del que deriva este ajuste | No verificado en la informacion disponible |

No se dispone de datos de rendimiento ni de contexto para establecer una comparacion cuantitativa con alternativas. La comparacion se limita a parametros, licencia y enfoque.

## Limitaciones y advertencias

- Modelo de autor individual con 0 descargas y 0 likes: no hay validacion comunitaria ni evidencia externa de calidad.
- Sin benchmarks publicados: no es posible afirmar su rendimiento frente al modelo base ni frente a alternativas.
- El pipeline declarado es `feature-extraction`, no `text-generation`: no debe asumirse que funcione como chatbot o asistente.
- Requiere `trust_remote_code=True` por el `custom_code`, lo que implica ejecutar codigo del autor y revisar su procedencia antes de usarlo en produccion.
- Sesgos conocidos: no documentados. Al entrenarse con datos de Wikipedia, arXiv, Gerrit y Stack Exchange, puede heredar sesgos de esas comunidades (composicion demografica, sesgos de notabilidad, sesgos de estilo de codigo).
- Riesgo de alucinacion: no evaluado; en tareas de clasificacion el riesgo se traduce en falsos positivos o negativos, no en texto inventado.
- Idiomas soportados no declarados: no hay garantia de comportamiento fuera del idioma o idiomas del dataset de entrenamiento.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen3.5-4B impone sus propias condiciones; conviene verificar la licencia del modelo base y de los datos de entrenamiento (contenido de Wikipedia, arXiv, Gerrit y Stack Exchange tiene terminos propios).
- Procedencia de los datos: el autor no detalla la composicion ni el volumen del dataset, lo que dificulta auditar la calidad y la legalidad de las etiquetas.
- Sin garantias de mantenimiento: la fecha de creacion y actualizacion es la misma (2026-11-04), sin historial posterior.

## Enlaces

- Hugging Face: https://huggingface.co/David319193/d3-mini-zils-body
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Bittensor subnet 127 (Zils): no disponible en la informacion proporcionada
- Herramienta `zils.current`: no disponible en la informacion proporcionada
- Paper, blog o demo: no disponibles en la informacion proporcionada
