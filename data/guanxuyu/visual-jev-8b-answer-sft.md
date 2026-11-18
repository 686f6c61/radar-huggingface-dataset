# guanxuyu/visual-jev-8b-answer-sft

## Resumen

Visual Jev 8B (answer-supervised adapter) es un adaptador LoRA sobre el modelo multimodal `Qwen/Qwen3-VL-8B-Instruct`, desarrollado por el usuario `guanxuyu`. No es un modelo generativo de texto libre: está post-entrenado para tareas de decisión visual de elección forzada, es decir, recibe una imagen, un contexto textual compartido y un conjunto de preguntas con sus respuestas candidatas proporcionadas en la petición, y devuelve puntuaciones (logits) sobre esas candidatas. El modelo no redacta prosa; puntúa opciones.

Se trata de la variante de 8B del adaptador `guanxuyu/visual-jev-4b-answer-sft`, con los mismos datos, objetivo, configuración LoRA y presupuesto de pasos, pero con un backbone mayor. Según la model card, supera al adaptador de 4B en todos los benchmarks reportados, tanto en exactitud como en la calidad de sus probabilidades. El interés principal reside en su uso como componente de puntuación y calibración en pipelines de VQA de elección múltiple, no como generador.

La relevancia actual viene de su enfoque en calibración: el adaptador mejora el ranking de respuestas (AUROC) y reduce la NLL en bruto, aunque las probabilidades en crudo siguen siendo sobreconfiadas y requieren temperature scaling por tarea. El repositorio ocupa 0,5 GB y la licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer multimodal Qwen3-VL (torre de visión congelada) |
| Parametros totales | no disponible (adaptador LoRA con 43.646.976 parámetros entrenables; el backbone Qwen3-VL-8B-Instruct no se detalla en la información) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; el backbone admite las cuantizaciones habituales de Qwen3-VL, no especificadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA, librería PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Qwen/Qwen3-VL-8B-Instruct` con la torre de visión congelada (`exclude_modules: ".*visual.*"`). El entrenamiento usa LoRA sobre la torre de lenguaje con r=16, α=32, dropout 0,05 y como módulos objetivo `q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj`, lo que da 43.646.976 parámetros entrenables. El objetivo es entropía cruzada de siguiente token sobre el vocabulario completo en la posición de lectura (readout), no generación libre: las puntuaciones son los logits de los tokens candidatos leídos desde la propia LM head del backbone en una posición fija.

El entrenamiento consta de 3.000 pasos, batch size 8, gradient checkpointing, learning rate 1e-4, 100 pasos de warmup y precisión bf16. Los datos son registros de pregunta derivados de los splits de entrenamiento de GQA y SNLI-VE, con los ítems de GQA Choice presentados con K en {2, 4} opciones. Se publican tres semillas: la 0 en la raíz del repositorio y las semillas 1 y 2 en los subdirectorios `seed1/` y `seed2/`. Una nota técnica destacable: la configuración fija `max_pixels = 200.704` (196 tokens visuales), pero el procesador de imágenes de Transformers ignora ese atributo, por lo que tanto el entrenamiento como todas las evaluaciones se ejecutaron a resolución nativa del procesador (una imagen GQA de 500×500 pasa a 256 tokens visuales).

## Capacidades

- Puntuación de respuestas candidatas en tareas de elección múltiple sobre imagen y texto (visual question answering con opciones suministradas en la petición).
- Decisión de elección forzada: devuelve logits por candidato, no texto generado.
- Soporte de contexto textual compartido entre varias preguntas sobre una misma imagen.
- Manejo de distinto número de opciones (en entrenamiento, K en {2, 4} para GQA Choice).
- Producción de probabilidades utilizables para umbrales y calibración (con temperature scaling por tarea).
- Ranking de fiabilidad: la probabilidad superior discrimina respuestas correctas e incorrectas (AUROC 0,896).
- No soporta tool calling ni function calling de forma nativa en este adaptador.
- No está orientado a agentes ni a razonamiento multi-paso; su función es puntuar opciones.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales: ninguna declarada más allá de la puntuación calibrable; no se documenta thinking mode, audio ni visión más allá del backbone.

## Casos de uso

- Evaluación automática de VQA con opciones cerradas: el adaptador puntúa cada candidata y permite seleccionar la de mayor logit; encaja en pipelines donde las respuestas ya están acotadas y se necesita una decisión reproducible.
- Enrutado con umbral de confianza: aplicando la temperatura ajustada por tarea (`softmax(logits / T)`), se puede derivar una decisión a revisión humana cuando la probabilidad máxima cae por debajo de un umbral, usando el AUROC de 0,896 para separar aciertos de errores.
- Control de calidad en anotación de datasets: dado un conjunto de etiquetas candidatas para una imagen, el modelo actúa como verificador y señala discrepancias entre la etiqueta humana y la puntuación del modelo.
- Filtrado de pares imagen-texto en curación de datos: con preguntas de tipo SNLI-VE (implicación/contradicción/neutralidad visual), el adaptador (0,818 de exactitud) puede descartar pares inconsistentes antes de entrenar otros modelos.
- Puntuación de opciones en sistemas de preguntas sobre documentos visuales: con TextVQA-Choice mantiene 0,979 de exactitud, por lo que sirve para seleccionar respuestas en capturas, gráficos o interfaces.
- Conteo visual con opciones cerradas: en TallyQA-Choice obtiene 0,855, útil para tareas de conteo donde las respuestas se presentan como un conjunto finito de números.
- Componente de ensemble o segunda opinión: al ser un adaptador LoRA ligero (0,5 GB), puede cargarse junto al backbone y combinarse con otro puntuador para arbitrar decisiones en producción.

## Benchmarks y rendimiento

Resultados sobre imágenes de test únicamente (70% de las imágenes de cada benchmark, separadas por un hash fijo del id de imagen); media ± desviación estándar sobre tres semillas. La marca † indica familias de tareas que ningún post-entrenamiento vio.

| Benchmark | Original 8B | Este adaptador | Adaptador 4B | n test |
|---|---|---|---|---|
| GQA-Choice | 0,885 | **0,919** ± 0,001 | 0,916 | 5.447 |
| SNLI-VE | 0,695 | **0,818** ± 0,004 | 0,808 | 1.368 |
| TextVQA-Choice † | 0,979 | 0,979 ± 0,003 | 0,975 | 1.742 |
| TallyQA-Choice † | 0,853 | 0,855 ± 0,010 | 0,841 | 3.681 |
| **Macro** | 0,853 | **0,893** ± 0,003 | 0,885 | |

Métricas de probabilidad (macro sobre los mismos cuatro benchmarks):

| Métrica | Original 8B | Este adaptador |
|---|---|---|
| NLL en bruto | 0,634 | **0,298** |
| NLL tras temperature scaling | 0,376 | **0,285** |
| ECE (15 bins) tras temperature scaling | 0,022 | 0,021 |
| AUROC (correcto vs. incorrecto por probabilidad superior) | 0,851 | **0,896** |

La ganancia se concentra en las dos familias presentes en entrenamiento; en las dos retenidas el adaptador iguala al backbone sin entrenar. La columna de TallyQA usa el build completo de test (distribución natural de conteo, sin las imágenes copia de entrenamiento de GQA), no el subconjunto de 498 preguntas balanceado por conteo citado en la card del 4B, por lo que las filas de TallyQA de ambas cards no son comparables.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El adaptador LoRA añade 43,6 M de parámetros entrenables sobre un backbone de 8B; en bf16 el backbone requiere del orden de 16 GB solo para pesos, más caché KV y activaciones, por lo que en la práctica se necesita una GPU de 24 GB o superior para inferencia cómoda. Cifra exacta no publicada.
- GPU recomendadas: no especificadas en la información. Por tamaño del backbone, encajan A100, H100 y, en el extremo consumer, RTX 4090 (24 GB) con bf16; en GPUs de menor VRAM sería necesario cuantizar el backbone.
- ¿Cabe en consumer GPU?: probablemente en RTX 4090 (24 GB) con bf16; en GPUs de 16 GB o menos requeriría cuantización del backbone, no documentada para este adaptador.
- Opciones de despliegue: la card documenta Transformers (`AutoModelForImageTextToText` + `AutoProcessor`) con PEFT (`PeftModel.from_pretrained`) y `device_map="cuda"`; también un script de ejemplo (`code/examples/quickstart.py`) con `--device auto`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Macro (4 benchmarks) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| visual-jev-8b-answer-sft (este) | LoRA sobre backbone 8B (43,6 M entrenables) | no disponible | 0,893 | Apache 2.0 | Hugging Face |
| visual-jev-4b-answer-sft | LoRA sobre backbone 4B | no disponible | 0,885 | no disponible en la información | Hugging Face |
| Qwen3-VL-8B-Instruct (sin adaptador) | 8B | no disponible | 0,853 | no disponible en la información | Hugging Face |

El adaptador de 8B supera al de 4B en exactitud (0,893 frente a 0,885 de macro) y en calidad de probabilidades (NLL en bruto 0,298 frente a los valores del 4B no publicados en esta información). Frente al backbone sin entrenar, la mejora es de 0,040 puntos de macro, concentrada en GQA-Choice y SNLI-VE.

## Limitaciones y advertencias

- No es un modelo generativo: no redacta respuestas; solo puntúa las opciones suministradas. Usarlo fuera de ese esquema produce resultados no válidos.
- Las probabilidades en bruto no están calibradas: las temperaturas ajustadas son todas mayores que 1, lo que indica sobreconfianza. Es necesario aplicar temperature scaling por tarea (`softmax(logits / T)`); las temperaturas de otras tareas transfieren peor la calibración, según mediciones del adaptador de 4B.
- El orden de las opciones afecta a las decisiones con umbral: en el adaptador de 4B, reordenar las mismas opciones cambió algunas decisiones por encima de la tasa atribuible al cambio de backend de inferencia; el estudio no se repitió en 8B. Conviene fijar y auditar el orden de opciones en despliegue.
- El modelo no tiene forma integrada de indicar que la respuesta correcta no está entre las opciones; si se necesita, hay que añadir una opción explícita como `incorrect_question` o `not enough evidence`.
- La ganancia se limita a las familias de tareas vistas en entrenamiento (GQA y SNLI-VE); en TextVQA-Choice y TallyQA-Choice iguala al backbone sin mejorar.
- La construcción del prompt, la posición de lectura y la tokenización de candidatos determinan el resultado; hay que usar la construcción del repositorio de código para reproducir las cifras.
- La resolución de imagen efectiva en entrenamiento y evaluación fue la nativa del procesador, no los 196 tokens visuales configurados; esto puede afectar a la reproducibilidad si se cambia el procesador.
- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de puntuaciones erróneas o sobreconfiadas en opciones fuera de distribución.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del backbone Qwen3-VL-8B-Instruct, no detallada en esta información.
- Idiomas soportados: no disponibles; no se documenta cobertura multilingüe.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/guanxuyu/visual-jev-8b-answer-sft
- Adaptador de 4B: https://huggingface.co/guanxuyu/visual-jev-4b-answer-sft
- Informe original (arXiv:2609.25845): https://arxiv.org/abs/2609.25845
- Código y quickstart: https://github.com/guanxuyu-sv/Visual-Jev
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
