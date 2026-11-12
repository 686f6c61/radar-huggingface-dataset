# Athekunal/ultrabert-jev-380m-softmax-yesno

## Resumen
UltraBERT-jev-380m-softmax-yesno es un modelo de decisión (decision model) construido sobre UltraBERT-380M, un encoder de la familia BERT desarrollado originalmente por dmis-lab. Lo publica el usuario Athekunal en Hugging Face y su función no es generar texto, sino leer un estado (uno o varios pasajes de contexto), una pregunta y una lista de opciones, y seleccionar una de ellas en un único forward pass. Cada opción se puntúa a partir de los logits del token de máscara situado justo delante de la opción, aplicando la receta "logit de ' yes' menos logit de ' no'".

El modelo tiene 429.966.336 parámetros reales según los pesos en safetensors (aunque el nombre comercial haga referencia a "380M") y se distribuye bajo licencia Apache 2.0. Está afinado a partir de dmis-lab/UltraBERT-380M con un epoch sobre la mezcla de 13 datasets Reason+Long del trabajo LLM-as-Jev (arXiv:2610.02076), añadiendo el conjunto Nimble. Su relevancia actual reside en que ofrece una alternativa de clasificación/decisión de bajo coste frente a los LLM generativos: una sola pasada de encoder en lugar de decodificación autoregresiva.

La ficha se centra en el checkpoint "softmax-yesno", uno de los cuatro de la familia (junto a softmax-yes, sigmoid-norm y sqrt-softplus), que comparten datos, hiperparámetros y prompt pero difieren en la función de puntuación y la pérdida. El modelo está pensado exclusivamente para inglés y su uso principal es la selección de opciones tipo multiple-choice o yes/no sobre contextos relativamente largos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder tipo BERT (UltraBERT), fill-mask con token de máscara por opción |
| Parametros totales | 429.966.336 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 10.240 tokens en entrenamiento (no se especifica límite duro adicional) |
| Tipos de cuantizacion | No disponible (el autor recomienda explícitamente cargar en fp32; bf16 degrada la precisión hasta 8 puntos en MuSiQue) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 1,7 GB) |
| Modelo base | dmis-lab/UltraBERT-380M |
| Pipeline declarado | fill-mask |
| Librería | transformers (probado con 5.20.2 y torch 2.9) |

## Arquitectura y entrenamiento
La arquitectura es un encoder transformer de tipo BERT (UltraBERT-380M) con cabeza de masked language modeling. El ajuste fino transforma el modelo en un clasificador de opciones: se inserta un token `[MASK]` delante de cada opción y se leen los logits de ese token para puntuar cada candidata. La receta de este checkpoint concreto aplica softmax sobre las opciones como pérdida y puntúa cada opción como la diferencia entre el logit del token `" yes"` y el del token `" no"` en la posición de su máscara.

El entrenamiento consistió en un único epoch con batch de 32 y learning rate de 1,5e-5 sobre la mezcla de 13 datasets Reason+Long del paper LLM-as-Jev, con el conjunto Nimble añadido. No se documentan fases de RLHF ni DPO, ni se especifica el número total de tokens de entrenamiento ni la composición detallada del dataset más allá de la referencia al paper. La innovación técnica principal es el paradigma de decisión en un solo forward pass, sin generación autoregresiva, lo que reduce drásticamente la latencia frente a modelos generativos en tareas de selección.

## Capacidades
- Clasificación multiple-choice: selecciona una opción entre varias dado un contexto y una pregunta.
- Decisión binaria yes/no: variante específica del prompt entrenado con los tokens `" yes"` y `" no"`.
- Razonamiento sobre contextos largos: entrenado con entradas de hasta 10.240 tokens, lo que permite procesar documentos extensos (contratos, informes, pasajes múltiples).
- Puntuación de opciones: devuelve scores numéricos por opción, lo que permite umbralizar o comparar alternativas.
- Entrada multi-pasaje: el campo `state` acepta una lista de pasajes, útil para combinar contexto y hechos.
- Sin tool calling, sin function calling, sin capacidades de agente y sin generación de texto libre.
- Sin capacidades multimodales (ni visión ni audio).
- Solo inglés.
- No proporciona justificación ni cadena de razonamiento de su elección.

## Casos de uso
- Filtrado de preguntas en atención al cliente: dado un historial de conversación (state) y una pregunta del usuario, decidir entre opciones predefinidas (p. ej. "facturación", "envío", "devolución", "otro") en un solo forward pass, con latencia muy inferior a un LLM generativo.
- Verificación de hechos binaria: comprobar si un pasaje de un documento respalda o contradice una afirmación, usando el formato yes/no entrenado y contextos de hasta 10.240 tokens.
- Clasificación de contratos y documentos legales: dado el texto de una cláusula y una pregunta ("¿incluye cláusula de confidencialidad?"), seleccionar entre opciones como "sí", "no" o "no aplica", aprovechando la capacidad de manejar documentos largos.
- Enrutamiento en pipelines RAG: decidir si la respuesta recuperada es suficiente para contestar la pregunta del usuario (sí/no) antes de invocar un modelo generativo, reduciendo costes en cascada.
- Evaluación automática de respuestas: puntuar opciones candidatas generadas por otro modelo y elegir la mejor según el score `" yes" − " no"`, como juez ligero en pipelines de evaluación.
- Moderación y triaje de contenido: clasificar mensajes en categorías discretas (permitido, revisar, bloquear) con un coste de cómputo mínimo comparado con modelos generativos.
- Anotación semiautomática de datasets: preetiquetar pares pregunta/opción en tareas de razonamiento para su posterior revisión humana, dado el 72,6 % de accuracy reportado en test.

## Benchmarks y rendimiento

| Split | Accuracy (media sobre 13 datasets) |
|---|---|
| Dev | 72,8 % |
| Test | 72,6 % |
| Benchmarks externos (6, p. ej. MMLU, BoolQ) | ~58–60 % |

No se han publicado resultados desglosados por dataset ni comparaciones numéricas con modelos alternativos en la información disponible.

## Requisitos de hardware
- Inferencia en fp32 recomendada por el autor: aproximadamente 1,7 GB de VRAM solo para pesos (429,97 M de parámetros × 4 bytes), más activaciones y KV de atención.
- Cabe holgadamente en GPUs de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB, e incluso en GPUs con 4–6 GB si se ajusta el batch.
- GPUs de datacenter (A100, H100) no son necesarias para inferencia individual, pero permiten alto throughput con batching.
- Opciones de despliegue: transformers (versión probada 5.20.2 con torch 2.9) es la vía documentada. No se confirma compatibilidad con vLLM, llama.cpp, Ollama ni TGI en la información disponible; al ser un encoder fill-mask, no es el caso de uso típico de esos motores.
- No se debe usar `trust_remote_code=True`: el código remoto del repo base nombra los pesos de forma distinta y dejaría los pesos sin cargar.
- Latencia y throughput: no disponibles en la información proporcionada; al ser un único forward pass de encoder, se espera latencia muy baja frente a modelos generativos del mismo tamaño, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Athekunal/ultrabert-jev-380m-softmax-yesno | 429,97 M | 10.240 tokens (entrenamiento) | Decisión multiple-choice / yes-no | Apache 2.0 | Hugging Face |
| dmis-lab/UltraBERT-380M (base) | ~380 M (nominal) | No disponible | Masked LM general | No disponible en la información | Hugging Face |
| Athekunal/ultrabert-jev-380m-softmax-yes | 429,97 M (misma familia) | 10.240 tokens | Decisión multiple-choice (softmax, logit " yes") | Apache 2.0 | Hugging Face |
| Athekunal/ultrabert-jev-380m-sigmoid-norm | 429,97 M (misma familia) | 10.240 tokens | Decisión multiple-choice (sigmoide normalizada) | Apache 2.0 | Hugging Face |
| Athekunal/ultrabert-jev-380m-sqrt-softplus | 429,97 M (misma familia) | 10.240 tokens | Decisión multiple-choice (sqrt-softplus normalizada) | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks comparativos frente a otros modelos de decisión o clasificadores de la misma categoría en la información proporcionada.

## Limitaciones y advertencias
- Entrenado y evaluado solo en inglés; el rendimiento fuera de esa lengua no está caracterizado.
- Precisión notablemente inferior en benchmarks externos (~58–60 % en seis benchmarks como MMLU y BoolQ) frente al 72,6 % en el test interno, lo que indica sobreajuste a la mezcla de entrenamiento.
- No proporciona justificación ni razones de su elección, lo que dificulta la auditoría en producción.
- Requiere cargar los pesos en fp32: usar bf16 puede degradar la precisión hasta 8 puntos en documentos largos (MuSiQue), según el autor.
- El prompt debe reproducirse exactamente como en el ejemplo; un uso genérico de fill-mask no da los resultados reportados.
- No debe pasarse `trust_remote_code=True` por incompatibilidad de nombres de pesos con el código remoto del repo base.
- Entradas limitadas a 10.240 tokens en entrenamiento; contextos más largos no están garantizados.
- Riesgo de alucinación no aplica en el sentido generativo (no genera texto), pero sí puede producir decisiones erróneas con alta confianza en dominios fuera de la distribución de entrenamiento.
- Sesgos: no se documentan análisis de sesgo en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base UltraBERT-380M debe verificarse por separado en cuanto a sus términos.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Athekunal/ultrabert-jev-380m-softmax-yesno
- Modelo base: https://huggingface.co/dmis-lab/UltraBERT-380M
- Paper LLM-as-Jev: https://arxiv.org/abs/2610.02076
- Checkpoint hermano softmax-yes: https://huggingface.co/Athekunal/ultrabert-jev-380m-softmax-yes
- Checkpoint hermano sigmoid-norm: https://huggingface.co/Athekunal/ultrabert-jev-380m-sigmoid-norm
- Checkpoint hermano sqrt-softplus: https://huggingface.co/Athekunal/ultrabert-jev-380m-sqrt-softplus
