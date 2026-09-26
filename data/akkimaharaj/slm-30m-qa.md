# AkkiMaharaj/slm-30m-qa

## Resumen

SLM-30M-QA es una version afinada para respuesta a preguntas (question answering) de slm-30m-base, un modelo GPT decoder-only de aproximadamente 30 millones de parametros construido desde cero por el autor AkkiMaharaj. El modelo se distribuye bajo licencia MIT, esta orientado exclusivamente al idioma ingles y se publica como un artefacto de aprendizaje personal, no como un sistema listo para produccion. Su pipeline declarado en HuggingFace es question-answering y el repositorio ocupa 0,4 GB.

El problema que aborda es acotado y metodologico: el autor lo utiliza para comprender de punta a punta el proceso de ajuste por instrucciones (instruction fine-tuning), incluyendo la mezcla de datasets, el enmascaramiento de la funcion de perdida (loss masking) y la evaluacion mas alla de la simple validation loss. En ese sentido, la model card documenta correcciones tecnicas concretas, como un bug de alineacion de objetivos provocado por pesos de embedding y salida atados (tied weights) que permitia al modelo aprender un atajo trivial de copia del token actual, resuelto mediante un desplazamiento correcto del objetivo next-token junto con mascara de prompt a -100.

La relevancia del modelo es principalmente didactica: sirve como referencia reproducible de un pipeline de fine-tuning sobre un transformer muy pequeno. No compite en capacidad con modelos instruction-tuned de mayor tamano y el propio autor advierte que sus respuestas pueden ser inconsistentes o superficiales. No se han publicado resultados de benchmarks en la informacion disponible, y el modelo acumula 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only transformer tipo GPT |
| Parametros totales | Aproximadamente 30 millones (30M) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en punto flotante sin cuantizaciones publicadas) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pt, cargado con torch.load); no es un repositorio en formato transformers estandar |
| Pipeline | question-answering |
| Tamano del repositorio | 0,4 GB |
| Modelo base | slm-30m-base (AkkiMaharaj) |
| Fecha de creacion | 2026-09-25 |
| Ultima actualizacion | 2026-09-25 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de tipo GPT con unos 30 millones de parametros, segun los tags del repositorio y la descripcion del autor. El modelo base slm-30m-base fue entrenado desde cero y su detalle arquitectonico completo (numero de capas, dimensiones de embedding, cabezas de atencion, contexto nativo) no esta disponible en la informacion proporcionada. Se sabe que emplea pesos de embedding y de salida atados, un detalle relevante porque fue el origen del bug de alineacion de objetivos corregido durante el fine-tuning.

El ajuste por instrucciones se realizo sobre una mezcla de tres fuentes: Databricks Dolly-15k (filtrado a categorias cortas y directas), Alpaca-Cleaned (aproximadamente 4.000 ejemplos muestreados) y pares de pregunta-respuesta anclados en Wikipedia extraidos de las frases iniciales de los articulos. La innovacion tecnica documentada no es de arquitectura sino de metodologia de entrenamiento: se corrigio el desplazamiento del objetivo next-token con mascara de prompt a -100 para eliminar el atajo de copia, y la seleccion de checkpoints no se baso unicamente en la validation loss con teacher forcing (que oculta la degeneracion), sino en generacion libre sobre preguntas de prueba, aceptando solo checkpoints cuyas salidas fueran no repetitivas y no vacias. No se menciona el uso de RLHF ni DPO.

## Capacidades

- Generacion de texto condicionada por prompt con plantilla fija: `### Question:\n<pregunta>\n\n### Answer:\n`.
- Respuesta a preguntas cortas y directas en ingles, heredada del ajuste sobre Dolly-15k y Alpaca-Cleaned.
- Respuestas ancladas a contenido de Wikipedia en los casos cubiertos por los pares de QA extraidos de frases iniciales.
- Inferencia con decodificacion configurada mediante temperature scaling, top-k sampling y penalizacion por repeticion para reducir salidas degeneradas o en bucle.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo thinking, vision ni audio.
- Capacidad multilingue limitada al ingles; no hay evidencia de soporte de otros idiomas.

## Casos de uso

- Estudio de pipelines de fine-tuning: permite reproducir de principio a fin la mezcla de datasets, el enmascaramiento de perdida y la seleccion de checkpoints por generacion libre, util para quien aprende a ajustar modelos.
- Prototipado educativo de QA en ingles: sirve para construir demos minimas de pregunta-respuesta que corren en CPU, sin requisitos de VRAM significativos.
- Pruebas de infraestructura de inferencia ligera: al ocupar decenas o cientos de MB, es adecuado para validar wrappers de carga de pesos `.pt`, scripts de tokenizacion y canalizaciones de generacion antes de escalar a modelos mayores.
- Analisis de degeneracion y bucles: su tamano reducido facilita experimentos controlados sobre repeticion, penalizacion por repeticion y muestreo top-k.
- Benchmark de referencia de juguete: util como linea base cualitativa frente a modelos instruction-tuned mayores en tareas de QA cortas, siempre con la advertencia de que no hay metricas publicadas.
- Docencia sobre limites de los modelos pequenos: sirve para ilustrar por que 30M de parametros y un dataset de ajuste limitado producen respuestas superficiales en comparacion con asistentes grandes.
- No se recomienda su uso en atencion al cliente, generacion de codigo en produccion ni tareas de razonamiento, dado que el propio autor lo describe como un artefacto de aprendizaje y no como un asistente utilizable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en punto flotante de 32 bits: en torno a 120 MB solo para pesos, mas el overhead de activaciones y runtime.
- VRAM estimada en precision media (fp16/bf16): en torno a 60 MB para pesos.
- VRAM estimada en int8: en torno a 30 MB; en int4: en torno a 15 MB (estimaciones teoricas a partir del recuento de parametros, no cifras publicadas por el autor).
- Cabe en cualquier GPU consumer, incluidas integradas y modelos antiguos, y en CPU sin dificultad.
- No requiere GPU dedicada; es viable en portatiles y entornos de bajos recursos.
- Opciones de despliegue: carga directa con PyTorch mediante `torch.load("finetuned.pt", map_location="cpu")`. No hay evidencia de compatibilidad directa con vLLM, llama.cpp, Ollama o TGI, ya que el artefacto distribuido es un `.pt` personalizado y no un repositorio en formato transformers estandar; su uso en esos motores requeriria conversion previa.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Tipo | Disponibilidad |
|---|---|---|---|---|---|---|
| AkkiMaharaj/slm-30M-QA | ~30M | GPT decoder-only, afinado para QA | no disponible | MIT | Instruction-tuned (QA) | HuggingFace, pesos `.pt` |
| StentorLabs/Stentor-30M | ~30,4M | Llama, entrenamiento en precision mixta | no disponible | no disponible | Base next-token (no chat) | HuggingFace |
| Otros modelos comparables de ~30M | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion directa de rendimiento con alternativas no es posible porque no se han publicado benchmarks de slm-30M-QA. Frente a Stentor-30M, la diferencia principal es el proposito: slm-30M-QA esta ajustado para responder preguntas, mientras que Stentor-30M se define explicitamente como un predictor base de siguiente token y no como asistente conversacional.

## Limitaciones y advertencias

- El propio autor indica que el modelo no esta pensado como un sistema de QA de produccion y que debe tratarse como un artefacto de aprendizaje.
- Tamano reducido (30M de parametros) y datos de ajuste limitados producen respuestas inconsistentes o superficiales frente a modelos instruction-tuned mayores.
- Riesgo elevado de alucinacion y de contenido incorrecto, agravado por la ausencia de benchmarks publicados.
- Riesgo de salidas degeneradas o en bucle; por ello la inferencia incorpora top-k sampling y penalizacion por repeticion.
- Soporte unicamente de ingles; no hay capacidades multilingues documentadas.
- Longitud de contexto no documentada, lo que impide garantizar conversaciones multi-turno largas.
- Formato de pesos `.pt` personalizado: no se integra de forma directa con ecosistemas estandar como vLLM, TGI, Ollama o llama.cpp sin trabajo de conversion.
- Licencia MIT: permite uso comercial y modificacion, pero sin garantias y sin que el autor respalde el rendimiento en produccion.
- Sin descargas ni likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- Sesgos conocidos: no disponibles de forma explicita en la model card; al derivar de Dolly-15k, Alpaca-Cleaned y Wikipedia, hereda los sesgos de esas fuentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AkkiMaharaj/slm-30m-qa
- Modelo base: https://huggingface.co/AkkiMaharaj/slm-30m-base
- StentorLabs/Stentor-30M (modelo comparable): https://huggingface.co/StentorLabs/Stentor-30M
- Hugging Face: https://huggingface.co/
- LLM Leaderboard (referencia de rankings): https://llm-stats.com/leaderboards/llm-leaderboard
- Artificial Analysis, comparativa de modelos: https://artificialanalysis.ai/leaderboards/models
