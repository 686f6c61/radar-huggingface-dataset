# ferguscooney/southern-lev-fat

## Resumen

southern-lev-fat es un modelo de clasificación de texto especializado en el tratamiento de citas judiciales (citation treatment) en derecho estadounidense. Lo desarrolla ferguscooney como una evolución de su modelo previo southern-lev, y su función es determinar cómo una opinión judicial posterior trata a una decisión citada: si la sigue, la respalda, la distingue, la limita, la cuestiona o la deroga. El modelo resuelve un problema clásico de la investigación jurídica asistida por máquina: la validación de precedentes, que en la práctica profesional se conoce como shepardizing o keyciting.

Técnicamente es un ModernBERT-large (395.841.546 parámetros) afinado para clasificación de secuencias en inglés jurídico. Su innovación principal es el formato de entrada: ventanas de 1.500 bytes por ocurrencia, con un 30% de contexto anterior y un 70% posterior a la cita, de modo que la respuesta del tribunal a la decisión citada quede dentro de la ventana con más frecuencia. Según el autor, esta entrada ancha mejora la detección de tratamientos negativos en opiniones de circuitos y distritos federales respecto a southern-lev, sin empeorar en citas del Tribunal Supremo.

El modelo se publica con licencia Apache 2.0, en formato safetensors, y está pensado para pipelines de análisis de jurisprudencia, no para generación de texto. Es relevante ahora porque demuestra una vía de destilación desde modelos grandes (Claude Sonnet 5.5 y Claude Fable 5.2 como profesores) hacia un encoder compacto desplegable en hardware modesto, aplicada a una tarea jurídica con etiquetas finas y desbalanceadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT-large (encoder transformer), cabeza de clasificación de secuencias |
| Parametros totales | 395.841.546 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | entradas de hasta 1.024 tokens durante el entrenamiento; ventana de 1.500 bytes por ocurrencia (30% antes / 70% después de la cita) |
| Tipos de cuantizacion | no disponible (repo solo en safetensors; no se documentan GGUF ni ONNX) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamaño del repo: 1,6 GB) |

## Arquitectura y entrenamiento

El modelo parte de southern-lev, que a su vez es un ModernBERT-large destilado de Claude Sonnet 5.5 sobre 54.851 pares de citas del Tribunal Supremo. southern-lev-fat se obtiene con un segundo afinado sobre 2.392 pares de tribunales federales inferiores etiquetados por agentes basados en Claude Fable 5.2, más 2.392 filas de replay del entrenamiento original de southern-lev (etiquetas Sonnet, Tribunal Supremo, entrada estrecha) para preservar el conocimiento previo. Solo se entrenaron las seis capas superiores del encoder, la normalización final y la cabeza de clasificación: tres épocas, batch 2 con acumulación de gradiente 4, learning rate 1e-5 con decaimiento lineal, fp32 sobre Apple MPS, entradas de hasta 1.024 tokens. La pérdida de las etiquetas nuevas se ponderó a 4,0 para `questions`, `limits` y `overrules`, 3,0 para `distinguishes` y 1,5 en el resto; las filas de replay se ponderaron a 1,0.

La recolección de etiquetas se hizo en dos rondas sobre opiniones publicadas de circuitos y distritos federales muestreadas de CourtListener, cada una emparejada con decisiones federales inferiores anteriores que cita. La ronda 1 muestreó 1.600 opiniones citantes (hasta 5 pares por opinión, 6.968 pares en el pool); la ronda 2 muestreó 6.000 opiniones nuevas (hasta 6 pares por opinión, 30.084 pares). La selección de pares a etiquetar combinó incertidumbre del scorer, probabilidad de tratamiento negativo, pares discutidos en profundidad y muestreo aleatorio. Se etiquetaron 2.750 pares (950 en la ronda 1, 1.800 en la ronda 2), de los cuales 1.034 eran negativos. Una segunda lectura ciega de 100 pares dio el mismo etiquetado en 88 casos y la misma respuesta negativo/no negativo en 99. Se reservaron 358 pares como conjunto de validación, separados por opinión citante. El conjunto de etiquetas nuevas está deliberadamente sobrerrepresentado en negativos (1.034 de 2.750 frente a aproximadamente el 6% en las muestras aleatorias), lo que conviene tener en cuenta al interpretar la calibración.

## Capacidades

- Clasificación de tratamiento de citas jurídicas en diez etiquetas: `follows`, `supports`, `explains`, `background`, `history`, `distinguishes`, `questions`, `limits`, `overrules` y `unknown`.
- Detección específica de tratamiento negativo (las cuatro etiquetas `distinguishes`, `questions`, `limits` y `overrules`), con mayor sensibilidad declarada que southern-lev sobre entradas anchas en opiniones de circuitos y distritos.
- Procesamiento de extractos largos alrededor de la cita (1.500 bytes, 30% antes / 70% después), lo que permite capturar la respuesta del tribunal en el mismo fragmento.
- Clasificación multietiqueta a nivel de par cita-ocurrencia, no generación de texto libre.
- Sin soporte documentado de tool calling, function calling, agentes ni razonamiento multi-paso.
- Sin capacidades de visión, audio ni modo de pensamiento.
- Capacidad monolingüe: solo inglés jurídico estadounidense.
- No se documentan capacidades de recuperación ni de resumen; el modelo asume que el extracto ya está localizado.

## Casos de uso

- Validación automática de precedentes en plataformas de investigación jurídica: dado un par (opinión citante, decisión citada), el modelo devuelve la etiqueta de tratamiento para señalar al abogado si la cita sigue vigente, ha sido distinguida o ha sido derogada, sustituyendo total o parcialmente la revisión manual de citas.
- Construcción de grafos de citas con semántica: en un pipeline que extrae citas de sentencias, el modelo anota cada arista con su tratamiento, permitiendo consultas como "decisiones de este circuito que limitan este precedente" sobre el grafo resultante.
- Alertas de cambio de precedente: integrado en un sistema de seguimiento de jurisprudencia, el modelo puede marcar nuevas opiniones que contengan etiquetas `overrules` o `limits` sobre casos relevantes para un despacho o un litigio concreto.
- Auditoría de citas en escritos propios: antes de presentar un escrito, el sistema verifica que las autoridades citadas no hayan sido distinguidas, limitadas o derogadas por decisiones posteriores, reduciendo el riesgo de sanciones por citas inválidas.
- Enriquecimiento de bases de datos jurídicas y datasets de entrenamiento: las etiquetas generadas pueden servir como señal débil para entrenar modelos mayores, construir conjuntos de evaluación de razonamiento jurídico o alimentar sistemas de recomendación de jurisprudencia.
- Investigación empírica en derecho: análisis a escala de cómo los tribunales federales inferiores tratan precedentes del Tribunal Supremo o de circuitos, midiendo tasas de tratamiento negativo por materia, circuito o período.
- Filtrado previo en pipelines de revisión humana: el modelo prioriza qué pares cita-ocurrencia revisar primero, dado su sesgo hacia la detección de negativos y su bajo coste de inferencia frente a un LLM generativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas de métricas (exactitud, F1, precisión/recall por etiqueta) ni comparaciones cuantitativas con southern-lev u otros modelos. Solo se aportan datos cualitativos: en entrada ancha encuentra más tratamientos negativos de un lector independiente en opiniones de circuitos y distritos que southern-lev, y no empeora en citas del Tribunal Supremo; en la entrada estrecha de southern-lev la mejora es mucho menor. La consistencia del etiquetado humano se midió con una segunda lectura ciega de 100 pares (88 coincidencias de etiqueta, 99 de negativo/no negativo), pero no es una métrica del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,8 GB en fp16 (395,8 M de parámetros) y alrededor de 1,6 GB en fp32; el repo ocupa 1,6 GB en safetensors.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; una RTX 4090, A100 o H100 queda muy sobredimensionada para este modelo y solo se justifica por volumen de peticiones.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna con 2 GB o más (GTX 1650, RTX 3060, RTX 4060, etc.); también en CPU para cargas moderadas.
- Opciones de despliegue: Hugging Face Transformers con `AutoModelForSequenceClassification`, y servidores de inferencia compatibles con modelos de clasificación (por ejemplo, Text Embeddings Inference o endpoints de Hugging Face). No se documentan GGUF ni Ollama; llama.cpp y vLLM no están confirmados para esta arquitectura en la información disponible.
- Latencia y throughput: no disponibles. Al ser un encoder de 395 M de parámetros con entradas de hasta 1.024 tokens, se espera un throughput alto en GPU y viable en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| southern-lev-fat | 395.841.546 | 1.024 tokens; ventana de 1.500 bytes (30/70) | Clasificación de tratamiento de citas (10 etiquetas) | Apache 2.0 | Hugging Face |
| southern-lev | no disponible en la información | entrada estrecha (no se detalla) | Clasificación de tratamiento de citas (10 etiquetas) | no disponible en la información | Hugging Face |
| Modelos legales tipo Legal-BERT | no disponible en la información | no disponible | Clasificación y NLP jurídico general | no disponible en la información | Hugging Face |

La comparación cuantitativa con southern-lev no puede establecerse porque la model card solo ofrece una descripción cualitativa de la mejora. No se dispone de datos de benchmarks ni de alternativas evaluadas en la misma tarea con métricas comparables.

## Limitaciones y advertencias

- El conjunto de etiquetas de entrenamiento está fuertemente sobrerrepresentado en tratamientos negativos (1.034 de 2.750 frente a aproximadamente el 6% en muestras aleatorias), por lo que las probabilidades de salida no reflejan la prevalencia real y la calibración puede estar sesgada hacia los negativos.
- La etiqueta `overrules` tiene solo 25 ejemplos de entrenamiento, lo que hace muy probable un rendimiento bajo e inestable en esa clase pese a la ponderación de pérdida de 4,0.
- Las etiquetas provienen de agentes LLM (Claude Fable 5.2), no de anotadores humanos expertos; los errores del profesor se propagan al estudiante. La consistencia medida (88/100 en etiqueta) indica un margen de ruido no despreciable.
- El modelo está entrenado solo con citas de tribunales federales inferiores y del Tribunal Supremo de EE. UU.; su comportamiento en jurisprudencia estatal, extranjera o en textos no judiciales no está documentado.
- Solo admite inglés; no hay soporte multilingüe.
- La entrada debe construirse con el formato ancho descrito (1.500 bytes, 30% antes / 70% después); con entradas estrechas la mejora sobre southern-lev se reduce mucho, según el autor.
- Es un clasificador, no un generador: no explica sus decisiones ni produce texto justificativo, lo que limita su auditabilidad directa en entornos regulados.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de clasificación errónea silenciosa; en producción conviene combinarlo con revisión humana en decisiones de alto impacto.
- Licencia Apache 2.0 permite uso comercial, pero el usuario debe evaluar la procedencia y licencia de los datos de CourtListener y de las salidas de los modelos profesores utilizados en la destilación.
- El modelo se publicó con 0 descargas y 0 likes en el momento de la consulta, sin validación externa conocida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ferguscooney/southern-lev-fat
- Modelo base southern-lev: https://huggingface.co/ferguscooney/southern-lev
- CourtListener (fuente de las opiniones judiciales): https://www.courtlistener.com
