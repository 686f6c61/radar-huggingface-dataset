# Athekunal/ultrabert-jev-380m-sigmoid-norm

## Resumen

UltraBERT-jev-380m-sigmoid-norm es un modelo encoder de tipo decision-model desarrollado por el usuario Athekunal sobre la base de dmis-lab/UltraBERT-380M. A diferencia de un modelo generativo, no produce texto: lee un estado (una lista de pasajes), una pregunta y un conjunto de opciones, y selecciona una opción en un unico forward pass puntuando el logit del token enmascarado que precede a cada opcion. La receta concreta de este checkpoint combina la diferencia de logits `" yes"` − `" no"` con una normalizacion sigmoide dividida por la suma sobre opciones.

El modelo resuelve tareas de decision multiple-choice y clasificacion sobre contextos, con un enfasis claro en razonamiento sobre documentos largos y seleccion de evidencia. Se ha afinado completamente durante una epoca sobre la mezcla de 13 datasets del trabajo LLM-as-Jev (arXiv:2610.02076), anadiendo el dataset Nimble. Su relevancia practica radica en que ofrece una alternativa economica en computo a los LLM generativos para tareas de seleccion: una sola pasada de encoder en lugar de decodificacion autoregresiva.

Con 429.966.336 parametros reales (el nombre comercial indica 380M), un repositorio de 1,7 GB y licencia Apache 2.0, el modelo esta pensado para entornos en ingles y se integra con la libreria transformers 5.20.2 o superior, que incorpora la clase UltraBERT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (UltraBERT), tarea fill-mask con token de mascara por opcion |
| Parametros totales | 429.966.336 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el autor recomienda cargar en fp32 (bf16 degrada hasta 8 puntos en MuSiQue) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder transformer basado en UltraBERT-380M, afinado completamente para una tarea de decision con formato fill-mask. La entrada se construye concatenando el estado (uno o varios pasajes separados por linea en blanco), la pregunta y una lista de opciones, donde cada opcion va precedida por un token de mascara. La puntuacion de cada opcion se obtiene del logit en ese token de mascara; la decision es el argmax de las puntuaciones. En este checkpoint la puntuacion es la diferencia `" yes"` − `" no"` normalizada mediante sigmoide dividida por la suma sobre todas las opciones.

El entrenamiento consistio en una sola epoca con batch de 32 y learning rate de 1.5e-5 sobre la mezcla Reason+Long de 13 datasets del trabajo LLM-as-Jev, ampliada con Nimble. La receta es identica a la de los otros tres checkpoints hermanos (softmax-yes, softmax-yesno y sqrt-softplus), que solo difieren en la funcion de puntuacion y la perdida. Ademas del cabezal de decision, el repositorio incluye un cabezal de evidencia independiente (`evidence_head/`) entrenado sobre el encoder congelado, que predice por token la probabilidad de formar parte de la evidencia anotada para la opcion elegida; se entreno con datos humanos de ContractNLI, MuSiQue, Nimble y ProofWriter, y con etiquetas generadas seleccionadas mediante una recompensa adaptada de SelfCite (arXiv:2502.09604).

## Capacidades

- Seleccion de opciones en una sola pasada de encoder, sin generacion autoregresiva.
- Razonamiento sobre documentos largos y contextos multi-pasaje (contratos, hechos, narrativas).
- Clasificacion multiple-choice con puntuaciones comparables entre opciones.
- Prediccion de evidencia a nivel de token mediante el cabezal auxiliar incluido.
- Procesamiento en ingles exclusivamente.
- No soporta tool calling ni function calling.
- No dispone de modo agente ni de razonamiento multi-paso explicito mas alla de la pasada unica.
- No tiene capacidades de vision ni audio.
- No es un modelo de chat ni de generacion de texto libre.

## Casos de uso

- Verificacion de contratos y clausulas: dado un contrato como estado y una pregunta del tipo "¿incluye clausula de confidencialidad?", el modelo selecciona entre opciones si/no en una sola pasada, y el cabezal de evidencia senala los fragmentos relevantes.
- Respuesta a preguntas sobre documentos largos (QA extractivo con opciones): util para seleccionar la respuesta correcta entre candidatos en tareas tipo MuSiQue o HotpotQA sin coste de decodificacion.
- Clasificacion de tickets y correos: dado el texto del mensaje y una taxonomia de categorias, el modelo elige la categoria mas probable, con un coste de inferencia muy inferior al de un LLM generativo.
- Filtrado y triaje en pipelines de datos: decidir si un parrafo responde a una pregunta o si un parrafo es relevante para una consulta, como etapa previa a un modelo mayor.
- Razonamiento logico sobre hechos: con un conjunto de hechos como estado y una afirmacion como pregunta, decidir si se sigue o no (estilo ProofWriter), aprovechando la mezcla Reason del entrenamiento.
- Analisis de evidencia en auditoria: usar el cabezal de evidencia para resaltar que tokens del documento sustentan la decision tomada, util en revisiones humanas asistidas.
- Evaluacion de sistemas RAG: como juez de relevancia o correccion de respuestas candidatas generadas por otro modelo, comparando opciones en una sola pasada.

## Benchmarks y rendimiento

| Metrica | Split dev | Split test |
|---|---|---|
| Precision media sobre 13 datasets | 72.8% | 71.9% |

No se han publicado en la informacion disponible resultados desglosados por dataset (MMLU, HumanEval, GSM8K u otros) ni comparaciones numericas con modelos alternativos.

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 1,7 GB solo para pesos, mas activaciones y cache; en la practica cabe en GPUs consumer con 8 GB o mas.
- El autor advierte explicitamente de que bf16 degrada la precision (hasta 8 puntos en MuSiQue), por lo que se recomienda fp32; esto duplica el uso de memoria frente a bf16.
- GPUs recomendadas: cualquier GPU con al menos 8 GB de VRAM (RTX 3060/4060/4070/4080/4090, A10, L4). Para lotes grandes, A100 o H100.
- Cabe en GPU consumer sin problema dado el tamano del modelo.
- Despliegue: transformers 5.20.2 o superior con torch 2.9; no usar `trust_remote_code=True` porque el codigo remoto del repo base nombra los pesos de forma distinta y dejaria pesos sin cargar.
- Latencia y throughput: no disponibles en la informacion proporcionada; al ser un encoder de ~430M en una sola pasada, se espera un coste muy inferior al de un modelo generativo de tamano comparable, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Athekunal/ultrabert-jev-380m-sigmoid-norm | 429.966.336 | no disponible | Decision multiple-choice (fill-mask) | apache-2.0 | Hugging Face |
| Athekunal/ultrabert-jev-380m-softmax-yes | mismo base | no disponible | Decision multiple-choice (softmax sobre `" yes"`) | apache-2.0 | Hugging Face |
| Athekunal/ultrabert-jev-380m-softmax-yesno | mismo base | no disponible | Decision multiple-choice (softmax sobre `" yes"`−`" no"`) | apache-2.0 | Hugging Face |
| Athekunal/ultrabert-jev-380m-sqrt-softplus | mismo base | no disponible | Decision multiple-choice (sqrt softplus normalizado) | apache-2.0 | Hugging Face |
| dmis-lab/UltraBERT-380M | ~380M (nominal) | no disponible | Encoder base (fill-mask) | no disponible en esta ficha | Hugging Face |

Los tres checkpoints hermanos comparten datos, ajustes y prompt, y solo difieren en la puntuacion y la perdida; no se han publicado en la informacion disponible comparaciones numericas entre ellos mas alla de la tabla de recetas de la model card.

## Limitaciones y advertencias

- Solo soporta ingles; no se ha validado su comportamiento en otros idiomas.
- No es un modelo generativo: no puede producir texto libre ni mantener conversaciones.
- Requiere usar exactamente el prompt de entrenamiento (estado, pregunta, opciones con mascara y tokens `" yes"`/`" no"`); un uso generico de fill-mask no reproduce los resultados publicados.
- Debe cargarse en fp32; el uso de bf16 altera las decisiones de forma significativa.
- No debe pasarse `trust_remote_code=True`: el codigo remoto del repo base nombra los pesos de forma distinta y dejaria pesos sin cargar.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de seleccion erronea de opcion en preguntas ambiguas o fuera de distribucion.
- El cabezal de evidencia predice evidencia anotada, no explica el razonamiento interno del modelo; no debe interpretarse como justificacion causal.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones de los datasets de entrenamiento (Reason+Long, Nimble, ContractNLI, MuSiQue, ProofWriter) antes de desplegar en produccion.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay validacion comunitaria independiente de los resultados reportados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Athekunal/ultrabert-jev-380m-sigmoid-norm
- Modelo base: https://huggingface.co/dmis-lab/UltraBERT-380M
- Checkpoint hermano softmax-yes: https://huggingface.co/Athekunal/ultrabert-jev-380m-softmax-yes
- Checkpoint hermano softmax-yesno: https://huggingface.co/Athekunal/ultrabert-jev-380m-softmax-yesno
- Checkpoint hermano sqrt-softplus: https://huggingface.co/Athekunal/ultrabert-jev-380m-sqrt-softplus
- Paper LLM-as-Jev: https://arxiv.org/abs/2610.02076
- Paper SelfCite: https://arxiv.org/abs/2502.09604
