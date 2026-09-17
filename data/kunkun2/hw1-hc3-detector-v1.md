# kunkun2/hw1-hc3-detector-v1

## Resumen

El modelo kunkun2/hw1-hc3-detector-v1 es un clasificador binario de texto en inglés desarrollado por el usuario kunkun2, cuyo objetivo es distinguir entre texto escrito por personas y texto generado por ChatGPT. Se trata de un encoder de tipo transformer ajustado (fine-tuning) sobre datos derivados del conjunto HC3, con 22.713.986 parámetros totales y un peso de repositorio de aproximadamente 0,1 GB. Su función es devolver una etiqueta de clasificación (humano o generado por IA) a partir de un fragmento de texto, y no genera texto nuevo.

El modelo procede de un trabajo académico de clasificación de procesamiento de lenguaje natural: se entrenó sobre 37.334 ejemplos, se validó con 4.666 y se evaluó con 4.668 ejemplos reservados. El autor reporta una precisión (accuracy) de 0,9891 en el conjunto de test, frente a 0,8449 de un clasificador de referencia y por encima del objetivo del trabajo, fijado en 0,90. Es relevante ahora porque la detección de texto sintético es un área activa, pero conviene enmarcarlo como una pieza educativa y de investigación, no como una herramienta forense.

Se publica con 0 descargas y 0 likes en el momento de la consulta, con licencia no disponible y soporte únicamente para inglés. La model card restringe explícitamente su uso: no debe emplearse como base única para acusaciones de conducta académica indebida, decisiones laborales o disciplinarias, conclusiones legales o forenses, ni decisiones de moderación con consecuencias graves.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder para clasificación de secuencias (etiqueta "bert" en los tags; variante concreta no especificada) |
| Parametros totales | 22.713.986 |
| Longitud de contexto | no disponible (la model card solo indica que se aplica truncation al tokenizar) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan versiones GGUF, AWQ, GPTQ ni similares) |
| Idiomas soportados | Inglés (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería transformers, PyTorch) |
| Tarea (pipeline) | text-classification |
| Clases de salida | 2 (humano / generado por ChatGPT); el mapeo exacto debe consultarse con model.config.id2label |
| Tamaño del repositorio | 0,1 GB |
| Fecha de creación / actualización | 2026-09-17 / 2026-09-17 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder con cabeza de clasificación de secuencias (AutoModelForSequenceClassification), ajustado sobre un modelo preentrenado de la familia BERT según los tags del repositorio. Con 22,7 millones de parámetros, el tamaño es notablemente inferior a bert-base-uncased (unos 110 millones), lo que apunta a un encoder compacto o destilado, aunque la model card no identifica la variante concreta ni el checkpoint de partida. El texto se tokeniza con el tokenizador del propio modelo, aplicando truncation y padding; el modelo no dispone de mecanismos de generación, decodificación especulativa ni atención lineal.

El entrenamiento se realizó con datos derivados del conjunto HC3 (Human ChatGPT Comparison Corpus), que contiene respuestas escritas por humanos y respuestas generadas por ChatGPT. El reparto documentado es de 37.334 ejemplos de entrenamiento, 4.666 de validación y 4.668 de test. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset, el número de épocas, la tasa de aprendizaje, el tamaño de lote ni si se aplicaron técnicas de alineación como RLHF o DPO; en un clasificador de este tipo lo habitual es un ajuste supervisado con entropía cruzada, pero ese extremo no se especifica en la información disponible. La única métrica declarada es accuracy en test.

## Capacidades

- Clasificación binaria de texto en inglés: devuelve una etiqueta que indica si el fragmento se parece más a texto humano o a texto generado por ChatGPT, con una puntuación asociada.
- Integración directa con la pipeline text-classification de Hugging Face y con AutoTokenizer / AutoModelForSequenceClassification.
- Carga mediante transformers y PyTorch, con pesos en safetensors.
- Compatibilidad declarada con text-embeddings-inference y con endpoints compatibles (tags endpoints_compatible), lo que facilita su despliegue como servicio de inferencia.
- No dispone de generación de texto, razonamiento multi-paso, tool calling ni function calling.
- No dispone de capacidades de visión, audio ni multimodalidad.
- No dispone de modo de razonamiento explícito (thinking mode) ni de agentes.
- Capacidad multilingüe: no; el modelo está entrenado y declarado únicamente para inglés.
- Capacidad especial: detección de texto generado por IA en el dominio concreto de los datos HC3 (pares pregunta-respuesta), no como detector genérico.

## Casos de uso

- Demostración educativa de fine-tuning de transformers: sirve para ilustrar en un curso o taller cómo se ajusta un encoder para clasificación binaria, cómo se inspecciona el mapeo id2label y cómo se evalúa con accuracy sobre un split reservado.
- Reproducción de un trabajo académico: permite replicar el flujo del ejercicio HC3 (entrenamiento, validación, test) y comparar la precisión obtenida con la reportada (0,9891).
- Filtrado y curación de corpus sintéticos: en un pipeline de preparación de datos se puede usar como primer filtro para marcar textos sospechosos de haber sido generados por ChatGPT antes de una revisión manual, siempre con umbrales conservadores.
- Anotación asistida para construir datasets de detección: las predicciones del modelo pueden servir como etiquetas preliminares que después se corrigen a mano, reduciendo el coste de anotación de grandes volúmenes de texto.
- Investigación sobre robustez de detectores: al ser un modelo pequeño y entrenado en un dominio acotado, es un punto de partida útil para estudiar su degradación ante parafraseo, traducción, edición humana o textos de modelos más recientes.
- Prototipos de herramientas editoriales: integrado como señal adicional en un panel de revisión, puede avisar al editor de que un texto tiene características compatibles con generación automática, dejando la decisión final en manos humanas.
- Evaluación comparativa de clasificadores: puede actuar como baseline ajustado frente a clasificadores de referencia en experimentos de detección de texto generado, dado su bajo coste computacional.
- Pruebas de integración de infraestructura: por su tamaño reducido y su compatibilidad con text-embeddings-inference y endpoints, resulta adecuado para validar despliegues de servicios de clasificación en entornos de prueba.

## Benchmarks y rendimiento

Los únicos resultados publicados en la model card son de accuracy sobre el split de test del propio trabajo. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni similares) en la información disponible, algo esperable en un clasificador de este tipo.

| Modelo | Accuracy en test |
|---|---:|
| Clasificador de referencia (baseline) | 0,8449 |
| Transformer ajustado (este modelo) | 0,9891 |
| Objetivo del trabajo | 0,90 |

No se documentan métricas adicionales como precisión, recall, F1, AUC ni matrices de confusión, ni resultados desglosados por subconjunto del dataset.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 22,7 millones de parámetros, lo que equivale a unos 91 MB en fp32 y unos 45 MB en fp16, más el coste de activaciones y del tokenizador. Cabe holgadamente en cualquier GPU con 2 GB o más de memoria.
- GPU recomendadas: prácticamente cualquiera. Para lotes pequeños basta una GTX 1050 Ti, GTX 1650, RTX 3050 o superior; para procesamiento por lotes a gran escala resultan adecuadas RTX 3060, RTX 4090, A100 o H100, aunque el modelo está muy por debajo de sus capacidades.
- Inferencia en CPU: viable y suficiente para muchos escenarios, dado el reducido número de parámetros. No se han publicado cifras medidas de latencia.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo actual e incluso en GPUs integradas o en CPU.
- Opciones de despliegue: pipeline de transformers, AutoModelForSequenceClassification, FastAPI o Flask como envoltorio propio, y los tags del repositorio indican compatibilidad con text-embeddings-inference y con endpoints compatibles. vLLM y TGI están orientados a modelos generativos y no son la vía natural para este clasificador.
- Latencia y throughput: no disponibles. Como referencia orientativa, no medida, en CPU moderna el orden de magnitud sería de decenas de milisegundos por muestra corta, y en GPU de pocos milisegundos, con throughput muy alto en procesamiento por lotes.
- Almacenamiento: 0,1 GB de repositorio, por lo que se puede incluir en imágenes de contenedor sin penalización apreciable.

## Comparativa con modelos similares

La información proporcionada no incluye especificaciones de modelos alternativos, por lo que las celdas correspondientes se marcan como no disponibles. A continuación se comparan categorías de referencia del mismo nicho, sin datos verificados en esta búsqueda.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kunkun2/hw1-hc3-detector-v1 | 22.713.986 | no disponible | 0,9891 de accuracy en test (HC3, split propio) | no disponible | Hugging Face, 0 descargas |
| Detector RoBERTa de OpenAI (detector de salidas de GPT-2) | no disponible | no disponible | no disponible | no disponible | no disponible en la información consultada |
| Hello-SimpleAI/chatgpt-detector-roberta (familia HC3) | no disponible | no disponible | no disponible | no disponible | no disponible en la información consultada |
| Clasificador de referencia del trabajo | no disponible | no disponible | 0,8449 de accuracy en test | no disponible | no disponible |

La comparación rigurosa requiere consultar cada repositorio y su model card, ya que las cifras no son directamente comparables si cambian el dataset, el split o el criterio de evaluación.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan análisis de sesgo. Dado que el entrenamiento usa el conjunto HC3, el modelo puede heredar sesgos de tema, estilo y registro presentes en ese corpus.
- Riesgo de alucinación: no aplica en sentido generativo, porque el modelo no produce texto; el riesgo equivalente es la clasificación errónea, presentada con una puntuación que puede interpretarse como certeza.
- Dominio estrecho: los datos de HC3 son pares pregunta-respuesta, por lo que el rendimiento puede degradarse en otros géneros, longitudes o registros.
- Sesgo temporal y de familia de modelos: el texto generado por modelos posteriores a ChatGPT puede ser más difícil de detectar y no está representado en el entrenamiento.
- Idioma: solo inglés. Cualquier uso en castellano u otros idiomas queda fuera del ámbito declarado.
- Textos cortos, editados, traducidos o parafraseados: la model card advierte de posibles errores de clasificación en estos casos.
- Falsos positivos: la escritura humana puede clasificarse como generada por IA, con consecuencias potencialmente graves si se usa sin supervisión.
- Falsos negativos: el texto generado por IA puede clasificarse como humano.
- Artefactos del dataset: un modelo puede aprender correlaciones espurias del corpus que no se generalizan a texto real, de modo que una precisión alta en test no garantiza un comportamiento equivalente en producción.
- Licencia: no disponible, lo que impide confirmar si se permite el uso comercial. Debe aclararse con el autor antes de cualquier despliegue productivo.
- Uso fuera de alcance: la propia model card prohíbe implícitamente emplearlo como base única para acusaciones de conducta académica indebida, decisiones disciplinarias o laborales, conclusiones legales o forenses y moderación con consecuencias graves.
- Madurez: 0 descargas y 0 likes, sin código de entrenamiento publicado en el repositorio de Hugging Face (el autor indica que el código se entregó por separado), lo que limita la reproducibilidad por terceros.
- Recomendación del autor: tratar las predicciones como evidencia de apoyo y combinarlas con revisión humana, contexto adicional y otros métodos de verificación; evaluar el modelo en el dominio de despliegue previsto antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kunkun2/hw1-hc3-detector-v1
- Paper del conjunto HC3 (arXiv:2301.07597), citado en la model card: https://arxiv.org/abs/2301.07597
- Búsqueda web realizada: los resultados devueltos no guardan ninguna relación con el modelo ni con la detección de texto generado por IA (eran páginas sobre libros infantiles de murciélagos), por lo que no se incluye ningún enlace adicional de esa búsqueda. No se han encontrado papers, blogs, repositorios ni demos específicos de este modelo en la información disponible.
