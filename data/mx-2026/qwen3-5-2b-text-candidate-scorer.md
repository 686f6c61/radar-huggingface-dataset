# mx-2026/qwen3.5-2b-text-candidate-scorer

## Resumen

mx-2026/qwen3.5-2b-text-candidate-scorer es un modelo de puntuación de candidatos (candidate scoring) bilingüe chino-inglés construido a partir del backbone de texto de Qwen/Qwen3.5-2B mediante un ajuste fino con LoRA y una cabeza lineal escalar. No genera texto libre: recibe una pregunta junto con una lista de 2 a 5 opciones y devuelve una puntuación por opción, normalizada con softmax dentro del conjunto de candidatos suministrado. El autor lo presenta como un experimento independiente inspirado en el modelo Jev de TypeSafe AI, sin vinculación con esa empresa.

El backbone conserva los 1.881.825.088 parámetros, 24 capas de decodificador y dimensión oculta 2.048 del modelo base, con una configuración de atención híbrida en la que 18 capas usan atención lineal y 6 usan atención completa. El adaptador LoRA tiene r=8, alpha=16 y dropout=0.05. El entrenamiento se realizó en dos fases, con 20.000 preguntas bilingües primero y 80.000 después, y el repositorio publica el checkpoint del paso 5.000 de la segunda fase.

Su relevancia práctica es acotada pero concreta: cubre la tarea de reranking y selección de opciones múltiples con un modelo pequeño que cabe en una GPU de portátil de 8 GiB. El autor verificó la inferencia en una RTX 4060 Laptop con precisión BF16, procesando 200 preguntas de留 out en 35,99 segundos (unas 5,6 preguntas por segundo). El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se han publicado resultados en benchmarks oficiales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder con atención híbrida (18 capas de atención lineal y 6 de atención completa) tomado de Qwen3.5-2B, más adaptador LoRA y cabeza lineal escalar con sesgo |
| Parametros totales | 1.881.825.088 en el backbone de texto; el total exacto incluyendo LoRA y cabeza de scoring no está publicado |
| Longitud de contexto | Máximo de 1.024 tokens por rama de candidato según el script de inferencia; el contexto máximo del backbone Qwen3.5-2B no está indicado |
| Tipos de cuantizacion | No disponible; la única configuración verificada es BF16 |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | apache-2.0, con la salvedad de que los datos de entrenamiento incluyen fuentes con condiciones propias (C-Eval está marcado como CC BY-NC-SA 4.0) |
| Formato de pesos | safetensors (backbone y adaptador LoRA) y score_head.pt (PyTorch) para la cabeza de scoring |

## Arquitectura y entrenamiento

El modelo reutiliza el backbone de texto de Qwen3.5-2B, del que se han excluido explícitamente los pesos de visión y de MTP (multi-token prediction). El backbone tiene 24 capas de decodificador y dimensión oculta de 2.048, con 18 capas de atención lineal y 6 de atención completa. Sobre él se cargan el adaptador LoRA (r=8, alpha=16, dropout=0.05) y una cabeza lineal con sesgo que toma el estado oculto del último token válido de cada rama y emite un escalar. Todos los candidatos comparten parámetros, pero la inferencia actual calcula cada rama por separado, sin reutilizar caché del prefijo común.

El entrenamiento tuvo dos fases. La primera usó 20.000 preguntas bilingües durante dos épocas, 2.500 pasos en total. La segunda heredó LoRA y cabeza de scoring, amplió el conjunto a 80.000 preguntas y reinició el optimizador; el primer ciclo terminó en el paso 5.000 y el entrenamiento continuó hasta el paso 6.500, donde se pausó. Los datos provienen de BoolQ, AI2 ARC, CommonsenseQA, MMLU, OCNLI, C3, C-Eval y CMMLU, mezclando fuentes en inglés y chino. El prompt de cada rama repite la pregunta, la lista completa de opciones y el candidato evaluado, en formato de texto plano, con variante en inglés para las preguntas en ese idioma. No se documenta el uso de RLHF ni de DPO.

## Capacidades

- Puntuación de candidatos: asigna una puntuación escalar a cada opción de un conjunto de 2 a 5 candidatos y aplica softmax para obtener probabilidades relativas dentro de ese conjunto.
- Clasificación de opción múltiple: determina la opción más probable en preguntas con una única respuesta correcta.
- Reranking: ordena un conjunto cerrado de respuestas o documentos candidatos según su puntuación.
- Bilingüe chino-inglés: el prompt y el entrenamiento cubren ambos idiomas, con plantillas específicas para cada uno.
- Modo de juicio restringido: la cabeza devuelve un escalar y el script no ofrece generación de texto libre ni interfaz de chat general.
- Selección top-k: el script de inferencia ordena y devuelve las N mejores opciones, aunque esta funcionalidad es un postprocesado de ordenación y no está respaldada por entrenamiento con múltiples respuestas correctas.
- Sin soporte documentado de tool calling, function calling, agentes, visión o audio: el modelo card no menciona ninguna de estas capacidades.

## Casos de uso

- Reranking en pipelines RAG: dado un conjunto de fragmentos recuperados, el modelo puntúa cada candidato frente a la consulta y permite reordenar los resultados antes de pasarlos a un generador, aprovechando que emite una probabilidad relativa dentro del conjunto.
- Selección best-of-N sobre salidas de un LLM: cuando un generador produce varias respuestas candidatas, este scorer permite elegir la mejor sin necesidad de un modelo juez grande, con un coste de 1.024 tokens por rama como máximo.
- Evaluación automática de exámenes y cuestionarios: bancos de preguntas de opción múltiple en chino o inglés pueden corregirse y priorizarse con el modelo, útil para plataformas educativas que necesitan una señal barata y local.
- Anotación asistida y etiquetado débil: en la construcción de datasets de preferencias o de respuesta correcta, el scorer puede preetiquetar opciones para revisión humana posterior, siempre que se acepte que las probabilidades no están calibradas entre escenarios.
- Filtrado de respuestas en asistentes conversacionales: en lugar de mostrar todas las alternativas generadas, el sistema puede quedarse con la de mayor puntuación, reduciendo ruido en la respuesta final.
- Comparación A/B de prompts y variantes de modelo: al puntuar el mismo conjunto de opciones con distintas versiones del prompt, se obtiene una métrica interna de calidad relativa sin depender de evaluación humana en cada iteración.
- Desambiguación en buscadores internos: cuando varias entradas del catálogo compiten por una consulta, el modelo puede ordenarlas y devolver las N primeras, con la advertencia de que la elección top-k es un postprocesado no entrenado.
- Apoyo al estudio de idiomas: con preguntas de comprensión en chino o inglés, el modelo permite construir herramientas de práctica que expliquen qué opción resulta más plausible según su puntuación.

## Benchmarks y rendimiento

Los datos publicados son evaluaciones internas del autor, no resultados de benchmarks oficiales. El conjunto de留 out son 200 preguntas nuevas procedentes de BoolQ, CommonsenseQA, ARC, C3 y OCNLI, 40 por fuente, con exclusión de las huellas de las preguntas usadas en entrenamiento y en la validación original. Las columnas "自拟题" corresponden a 20 preguntas redactadas por el autor, de dificultad baja.

| Checkpoint |留 out nuevo (200) | NLL | Preguntas propias (20) |
|---|---:|---:|---:|
| 20.000 preguntas, paso 1.250 | 162 / 200 | 0,4660 | 14 / 20 |
| 20.000 preguntas, paso 2.500 | 166 / 200 | 0,5893 | 16 / 20 |
| 80.000 preguntas, paso 5.000 (publicado) | 169 / 200 | 0,4418 | 20 / 20 |
| 80.000 preguntas, paso 6.500 | 169 / 200 | 0,5313 | 20 / 20 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El propio autor advierte que parte del entrenamiento usó fragmentos etiquetados como test y que estas cifras no deben interpretarse como resultados oficiales de dichos benchmarks.

## Requisitos de hardware

- VRAM en BF16: los 1.881.825.088 parámetros del backbone ocupan aproximadamente 3,76 GB solo en pesos, a los que hay que sumar el adaptador LoRA, la cabeza de scoring, el tokenizador y las activaciones.
- Validación real: el autor verificó la inferencia en una RTX 4060 Laptop con 8 GiB, con precisión BF16, lotes de 2 ramas de candidato y un máximo de 1.024 tokens por rama.
- GPU de consumo: cabe en GPUs de consumo con al menos 8 GiB, como la RTX 4060 Laptop empleada; no hay datos de compatibilidad publicados para otras GPU u otros sistemas operativos.
- GPU de centro de datos: no se han medido rendimiento ni latencia en A100, H100 u otras GPU profesionales.
- Opciones de despliegue: el despliegue previsto es el script propio en PyTorch (jev/play.py) con el entorno de jev/setup_env.sh. No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI, y la ausencia de pesos GGUF impide su uso directo en runtimes de cuantización.
- Latencia y throughput: 200 preguntas de留 out en 35,99 segundos en RTX 4060 Laptop, aproximadamente 5,6 preguntas por segundo, sin contar la carga del modelo ni la entrada manual. El coste por pregunta escala con la longitud del texto y el número de candidatos.

## Comparativa con modelos similares

No se han proporcionado datos verificados de modelos alternativos de la misma categoría (cross-encoders de reranking, clasificadores de opción múltiple o scorers de candidatos). La única referencia directa disponible es el modelo base del que se extrae el backbone.

| Modelo | Parametros | Contexto | Formato de salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3.5-2b-text-candidate-scorer | 1.881.825.088 en el backbone | 1.024 tokens por rama en inferencia | Escalar por candidato, con softmax dentro del conjunto | apache-2.0 (con datos de entrenamiento de terceros sujetos a sus propias condiciones) | HuggingFace y GitHub, 0 descargas y 0 likes en la fecha de consulta |
| Qwen/Qwen3.5-2B (modelo base) | No disponible en la información proporcionada | No disponible | Texto generado | Apache-2.0 según la model card citada | HuggingFace |

La búsqueda web realizada no devolvió resultados relevantes sobre este modelo ni sobre alternativas comparables; los resultados obtenidos correspondían a sitios de motocross y maquinaria agrícola, sin relación con el modelo.

## Limitaciones y advertencias

- Solo puntúa opciones dentro de un conjunto cerrado: no genera texto libre, no emite juicios de rechazo y no ofrece una interfaz de chat general.
- Las probabilidades se normalizan únicamente dentro del conjunto de candidatos proporcionado; no están calibradas entre escenarios, preguntas o dominios distintos.
- La formulación, el orden y el número de candidatos pueden alterar la puntuación, según advierte el propio autor.
- La funcionalidad top-k se apoya en un modelo entrenado para una única respuesta correcta; no hay entrenamiento con múltiples respuestas válidas.
- La inferencia calcula cada rama de candidato por separado, sin caché de prefijo común, lo que multiplica el coste cuando hay muchas opciones o textos largos.
- El límite práctico de 1.024 tokens por rama obliga a truncar o acortar entradas largas; el modelo lo solicita explícitamente cuando se supera.
- El contexto máximo real del backbone Qwen3.5-2B no se documenta en la información disponible, y no hay evaluación sistemática con textos largos ni con tareas de fuentes no vistas.
- Los idiomas soportados son solo chino e inglés; no hay datos sobre otros idiomas.
- La licencia del repositorio es apache-2.0, pero los datos de entrenamiento incluyen fuentes con condiciones propias, entre ellas C-Eval bajo CC BY-NC-SA 4.0; el autor indica que un uso comercial exige revisar cada fuente por separado. La licencia del repositorio no modifica los términos de terceros.
- La evaluación publicada es interna y limitada: 200 preguntas de留 out y 20 preguntas propias, con advertencia explícita de que parte del material etiquetado como test se usó en entrenamiento, por lo que no equivale a resultados de benchmarks oficiales.
- No se han medido compatibilidad ni rendimiento fuera de Linux con CUDA y una RTX 4060 Laptop; el comportamiento en otras GPU u otros sistemas operativos es desconocido.
- El repositorio no incluye el banco de preguntas original, los datos de entrenamiento convertidos, los estados del optimizador ni el texto de留 out, lo que limita la reproducibilidad externa de la evaluación.
- Riesgo de alucinación y de sesgos: la model card no documenta análisis de sesgos ni evaluación de robustez, y al tratarse de un experimento con 0 descargas no hay evidencia de uso en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mx-2026/qwen3.5-2b-text-candidate-scorer
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Repositorio GitHub del proyecto: https://github.com/moX1-2/qwen3.5-2b-text-candidate-scorer
- Model card y notas de publicación (GitHub): https://github.com/moX1-2/qwen3.5-2b-text-candidate-scorer/blob/main/docs/%E6%A8%A1%E5%9E%8B%E5%8D%A1.md
- Registro completo del proceso de entrenamiento: https://github.com/moX1-2/qwen3.5-2b-text-candidate-scorer/blob/main/docs/%E5%85%A8%E6%B5%81%E7%A8%8B%E5%A4%8D%E7%8E%B0.md
- Informe de evaluación del 25 de septiembre: https://github.com/moX1-2/qwen3.5-2b-text-candidate-scorer/blob/main/result/evaluation-2026-09-25/REPORT.md
- Datos de viabilidad en RTX 4060: https://github.com/moX1-2/qwen3.5-2b-text-candidate-scorer/blob/main/result/analysis/4060_feasibility.json
- Dataset C-Eval (fuente de entrenamiento, CC BY-NC-SA 4.0): https://huggingface.co/datasets/ceval/ceval-exam

Nota sobre la búsqueda web: los resultados obtenidos no guardan relación con el modelo (m-x.eu, 24mx.fr, motocrossmag.be, mxgp.com y la entrada "Mx (titre)" de Wikipedia). No se han encontrado papers, blogs ni demos adicionales sobre este modelo.
