# Athekunal/ultrabert-jev-380m-softmax-yes

## Resumen

UltraBERT-jev-380m-softmax-yes es un modelo de decisión (decision model) desarrollado por el usuario Athekunal y publicado en Hugging Face. No es un modelo generativo: recibe un estado (uno o varios pasajes de texto), una pregunta y una lista de opciones, y selecciona una de ellas en un único pase hacia delante, sin generar texto. Técnicamente es un encoder UltraBERT-380M (de dmis-lab) afinado por completo con un token de máscara delante de cada opción, cuyo logit correspondiente a `" yes"` se usa como puntuación tras aplicar softmax sobre las opciones.

El modelo resuelve tareas de razonamiento de opción múltiple y clasificación condicionada por contexto: lectura comprensiva, verificación de hechos, NLI contractual, respuesta a preguntas con contexto largo y similares. Su relevancia radica en que ofrece una alternativa compacta (430 M de parámetros) y de un solo pase frente a los grandes modelos generativos con cadenas de razonamiento largas, lo que reduce latencia y coste computacional. Incluye además una cabeza de evidencia que marca qué tokens del estado sostienen la opción elegida.

La receta de entrenamiento es específica: un epoch sobre la mezcla de 13 conjuntos de datos Reason+Long del trabajo LLM-as-Jev (arXiv:2610.02076), con el conjunto Nimble añadido, batch de 32 y learning rate de 1,5e-5. El checkpoint reporta una precisión del 71,1 % en la partición de desarrollo y del 68,7 % en la de test. La licencia es Apache 2.0 y el único idioma declarado es el inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (UltraBERT-380M), fine-tuning completo con token de máscara por opción |
| Parametros totales | 429.966.336 (según safetensors; el repo base se denomina UltraBERT-380M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no especificada en la información proporcionada) |
| Tipos de cuantizacion | no disponible; el autor recomienda explícitamente cargar los pesos en fp32 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tarea (pipeline) | fill-mask (uso como modelo de decisión con puntuación sobre `" yes"`) |
| Modelo base | dmis-lab/UltraBERT-380M |
| Precisión recomendada | fp32 (bf16 altera la precisión hasta 8 puntos en MuSiQue) |
| Versiones probadas | transformers 5.20.2, torch 2.9 |
| Tamaño del repo | 1,7 GB |

## Arquitectura y entrenamiento

El modelo es un encoder puro basado en UltraBERT-380M al que se le ha practicado un fine-tuning completo. La construcción del prompt es fija: se concatenan los pasajes del estado (cada uno seguido de una línea en blanco), la pregunta y una instrucción que pide marcar la opción correcta con `" yes"` y el resto con `" no"`. A continuación, cada opción se presenta en una línea propia con el formato `[k] <mask> opción`. Para decidir, se extraen los logits de todos los tokens de máscara y se aplica softmax sobre el logit del token `" yes"` de cada opción; se elige el índice con mayor puntuación. No hay generación autoregresiva, decodificación especulativa ni cadena de razonamiento explícita: toda la decisión se concentra en un único pase hacia delante.

El entrenamiento se realizó durante un solo epoch con batch 32 y learning rate 1,5e-5 sobre la mezcla de 13 conjuntos de datos Reason+Long de LLM-as-Jev (arXiv:2610.02076), a la que se añadió Nimble. La pérdida es softmax sobre las puntuaciones de las opciones. El autor advierte que los logits del token de máscara son grandes (en torno a 200) y que cargar los pesos en bf16 degrada la precisión hasta 8 puntos en documentos largos (MuSiQue), por lo que todos los resultados reportados usan pesos fp32. Adicionalmente, el repo incluye una cabeza de evidencia en `evidence_head/`: un MLP sobre la concatenación `[h_t ; h_k ; h_t * h_k]` (estado oculto del token t, estado oculto de la máscara de la opción k y su producto elemento a elemento) que predice, para cada token del estado, la probabilidad de formar parte de la evidencia anotada. Se entrenó con evidencia marcada por humanos (ContractNLI, MuSiQue, Nimble, ProofWriter) y etiquetas generadas seleccionadas con una recompensa adaptada de SelfCite (arXiv:2502.09604); el umbral de probabilidad está en `evidence_head/threshold.json`.

## Capacidades

- Decisión de opción múltiple en un solo pase: selecciona una opción de una lista dada un estado y una pregunta, sin generar texto.
- Razonamiento sobre contexto largo: los pasajes del estado se concatenan, lo que permite condicionar la decisión a documentos extensos (por ejemplo, contratos o conjuntos de hechos).
- Clasificación binaria y multiclase: admite cualquier número de opciones, puntuando cada una independientemente.
- Verificación de hechos y NLI: puede evaluar si un estado implica o respalda una afirmación.
- Respuesta a preguntas con evidencia: soporta marcar qué tokens del estado sostienen la opción elegida mediante la cabeza de evidencia.
- Capacidades multilingües: limitadas al inglés según la model card.
- Tool calling / function calling: no disponible; el modelo no genera texto ni llamadas a herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible; es un clasificador de una sola pasada.
- Capacidades especiales: modo de decisión con softmax sobre `" yes"`, y cabeza de evidencia opcional.

## Casos de uso

- Verificación de contratos y cláusulas: dado el texto de un contrato y una pregunta (por ejemplo, "¿permite el acuerdo la sublicencia?"), el modelo elige entre "sí" y "no" en un solo pase, y la cabeza de evidencia señala las cláusulas relevantes para revisión humana.
- Respuesta a preguntas sobre documentación técnica: con un manual o una base de conocimiento como estado, el modelo selecciona la respuesta correcta entre opciones candidatas, útil en asistentes de soporte que ya han recuperado los pasajes relevantes.
- Validación de hechos en pipelines de RAG: tras recuperar un contexto, el modelo decide si una afirmación generada está respaldada por el contexto, actuando como filtro de alucinaciones barato y de baja latencia.
- Clasificación de tickets y correos: con el hilo de conversación como estado y una taxonomía de categorías como opciones, el modelo asigna la etiqueta adecuada sin generación de texto.
- Evaluación automática de respuestas: puntuar si una respuesta candidata satisface una pregunta dada el contexto, como componente de un jurado automático más amplio.
- Enrutado de decisiones en sistemas de agentes: usar el modelo como verificador rápido (por ejemplo, "¿debería escalarse este caso a un humano?") antes de invocar un LLM generativo más costoso.
- Análisis de documentos largos con evidencia: en revisión legal o auditoría, obtener la decisión y simultáneamente los fragmentos que la sustentan, lo que facilita la trazabilidad.

## Benchmarks y rendimiento

| Checkpoint | Precisión (media sobre 13 datasets) |
|---|---|
| Dev split | 71,1 % |
| Test split | 68,7 % |

No se han publicado en la información disponible resultados por conjunto de datos individual ni comparaciones numéricas con otros modelos. El autor menciona que la carga en bf16 reduce hasta 8 puntos la precisión en MuSiQue respecto a fp32, pero no se aportan los valores absolutos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 430 M de parámetros, aproximadamente 1,7 GB en fp32 (recomendado por el autor) y unos 0,9 GB en fp16/bf16, aunque esta última degrada la precisión.
- GPU recomendadas: cualquier GPU con al menos 2-3 GB de VRAM libre; una RTX 3060, RTX 4090, A100 o H100 son suficientes. El modelo es pequeño y no requiere hardware de gama alta.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna de consumo, e incluso en CPU para cargas puntuales (con mayor latencia).
- Opciones de despliegue: transformers (versión 5.20.2 probada con torch 2.9). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al ser un encoder de decisión con prompt específico, el despliegue debe respetar el formato exacto de entrada.
- Latencia y throughput: no disponibles de forma numérica. Por su tamaño y su condición de pase único, se espera una latencia muy inferior a la de un LLM generativo de tamaño comparable, pero no se aportan cifras.
- Nota importante: no cargar con `trust_remote_code=True`; el código remoto del repo base nombra los pesos de forma distinta y dejaría los pesos sin cargar.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Athekunal/ultrabert-jev-380m-softmax-yes | 430 M | no disponible | Encoder de decisión, softmax sobre `" yes"` | Apache 2.0 | Hugging Face |
| Athekunal/ultrabert-jev-380m-softmax-yesno | 430 M | no disponible | Encoder de decisión, softmax con puntuación `" yes" − " no"` | Apache 2.0 | Hugging Face |
| Athekunal/ultrabert-jev-380m-sigmoid-norm | 430 M | no disponible | Encoder de decisión, sigmoide normalizada | Apache 2.0 | Hugging Face |
| Athekunal/ultrabert-jev-380m-sqrt-softplus | 430 M | no disponible | Encoder de decisión, softplus con raíz cuadrada normalizada | Apache 2.0 | Hugging Face |

Los tres checkpoints alternativos comparten datos, ajustes y prompt, y solo difieren en la función de puntuación y la pérdida. No se dispone de datos de rendimiento de estos checkpoints en la información proporcionada, por lo que no es posible comparar sus precisiones. Tampoco se han identificado en la información disponible modelos de decisión de terceros directamente comparables.

## Limitaciones y advertencias

- Solo inglés: la model card declara únicamente el idioma `en`; el rendimiento en otros idiomas no está evaluado.
- Requiere fp32: cargar en bf16 altera los resultados hasta 8 puntos en documentos largos; en producción esto implica mayor uso de memoria y conviene fijar la precisión explícitamente.
- Prompt estricto: el modelo fue entrenado con un formato concreto (estado, pregunta, instrucción y opciones con token de máscara delante de cada una); un uso genérico de fill-mask no reproduce los resultados reportados.
- No es un modelo generativo: no produce texto, explicaciones ni llamadas a herramientas; solo puntúa opciones.
- La cabeza de evidencia predice evidencia anotada, no explica el razonamiento interno del modelo; no debe interpretarse como una justificación causal de la decisión.
- Riesgo de alucinación: aunque no genera texto, puede seleccionar opciones incorrectas con alta confianza, especialmente en contextos largos o ambiguos; la precisión reportada en test es del 68,7 %, lo que deja margen de error considerable.
- Sesgos: no se documentan análisis de sesgos en la información disponible; al derivar de UltraBERT-380M y de mezclas de datos de razonamiento en inglés, puede heredar sesgos de esos corpus.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las licencias de los conjuntos de datos de entrenamiento (Reason+Long, Nimble y los datos de evidencia) si se redistribuye el modelo o se usa en productos regulados.
- Versionado de dependencias: probado con transformers 5.20.2 y torch 2.9; versiones anteriores pueden no incluir la clase UltraBERT y requerirían alternativas no documentadas.
- No pasar `trust_remote_code=True`: el código remoto del repo base no carga correctamente los pesos de este checkpoint.
- Sin datos de contexto máximo documentados: el comportamiento con documentos muy largos más allá de lo evaluado no está garantizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Athekunal/ultrabert-jev-380m-softmax-yes
- Modelo base: https://huggingface.co/dmis-lab/UltraBERT-380M
- Checkpoint alternativo softmax-yesno: https://huggingface.co/Athekunal/ultrabert-jev-380m-softmax-yesno
- Checkpoint alternativo sigmoid-norm: https://huggingface.co/Athekunal/ultrabert-jev-380m-sigmoid-norm
- Checkpoint alternativo sqrt-softplus: https://huggingface.co/Athekunal/ultrabert-jev-380m-sqrt-softplus
- Paper LLM-as-Jev: https://arxiv.org/abs/2610.02076
- Paper SelfCite: https://arxiv.org/abs/2502.09604
