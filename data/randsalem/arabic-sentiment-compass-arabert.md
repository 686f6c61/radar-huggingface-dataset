# randsalem/arabic-sentiment-compass-arabert

## Resumen

El modelo `randsalem/arabic-sentiment-compass-arabert` es un clasificador de análisis de sentimiento para texto en árabe, desarrollado por el usuario randsalem. Se basa en la arquitectura AraBERT, un modelo de tipo BERT preentrenado específicamente para el idioma árabe por el grupo AUB-Mind de la Universidad Americana de Beirut. El modelo está ajustado (fine-tuning) para la tarea de clasificación de sentimiento, probablemente en el contexto de dialectos árabes, como el egipcio, según el proyecto de graduación vinculado en el repositorio del autor.

El modelo resuelve el problema de detectar la polaridad emocional (positiva, negativa o neutral) en textos árabes, una tarea compleja debido a la diversidad dialectal y a las expresiones idiomáticas propias de cada región. Con 135 millones de parámetros, es un modelo de tamaño medio que puede ejecutarse en hardware de consumo, lo que lo hace accesible para aplicaciones de procesamiento de lenguaje natural en árabe. Su relevancia actual radica en la creciente demanda de herramientas de análisis de opinión para el mundo árabe, donde los recursos de IA de código abierto son escasos.

La ficha técnica es escasa: la model card solo incluye la licencia Apache 2.0, sin detalles sobre el dataset de entrenamiento, el rendimiento o las capacidades específicas. La información disponible se complementa con el repositorio de GitHub del autor, que documenta un proyecto de graduación sobre análisis de sentimiento de tuits en dialecto egipcio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (AraBERTv0/v1/v2, base) |
| Parametros totales | 135.195.651 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (estandar de BERT) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, FP32/FP16) |
| Idiomas soportados | Arabe (incluidos dialectos, segun el proyecto del autor) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en AraBERT, una arquitectura transformer de tipo BERT con 12 capas ocultas, 768 dimensiones de embedding y 12 cabezas de atencion. AraBERT fue preentrenado por aub-mind sobre un corpus arabe de 77 GB (200 millones de lineas, 8.600 millones de palabras) que incluye texto moderno estandar, dialectos y contenido web. El preentrenamiento utiliza enmascaramiento de tokens (MLM) y prediccion de siguiente oracion (NSP), con una segmentacion basada en Farasa.

El ajuste fino para la tarea de sentimiento se realizo anadiendo una cabeza de clasificacion sobre la capa [CLS] del modelo base. Segun el repositorio del autor, el entrenamiento se realizo sobre tuits en dialecto egipcio, aunque no se especifican el numero de ejemplos, las epocas ni la metodologia exacta (si se uso RLHF, DPO o simplemente cross-entropy). No hay informacion publica sobre el dataset de entrenamiento ni sobre tecnicas de regularizacion empleadas.

## Capacidades

- Clasificacion de sentimiento en arabe: detecta polaridad positiva, negativa o neutral en textos cortos como tuits o resenas.
- Procesamiento de dialectos arabes: el proyecto del autor se centra en el dialecto egipcio, aunque el modelo base AraBERT soporta arabe moderno estandar y otros dialectos.
- Comprension de contexto limitado: al ser BERT, maneja secuencias de hasta 512 tokens, suficiente para la mayoria de textos de opinion.
- No soporta generacion de texto: es un modelo exclusivamente discriminativo (encoder-only).
- No soporta tool calling, agentes ni razonamiento multi-paso: su uso se limita a clasificacion de secuencias.
- Capacidades multilingues: no aplica, esta especializado en arabe.

## Casos de uso

- Analisis de opinion en redes sociales: el modelo puede clasificar tuits o comentarios en arabe para medir la opinion publica sobre productos, politicos o eventos. Su entrenamiento en dialecto egipcio lo hace adecuado para monitorizar conversaciones en esa region.
- Atencion al cliente automatizada: integrado en un sistema de tickets, puede clasificar automaticamente las quejas de clientes como positivas, negativas o neutrales para priorizar las urgentes. Su tamano reducido permite ejecutarlo en servidores modestos.
- Investigacion de mercado: analisis de resenas de productos en tiendas online arabes para extraer tendencias de satisfaccion. El modelo puede procesar miles de resenas en lote con una GPU de consumo.
- Monitorizacion de marca: seguimiento de menciones en foros y redes sociales para detectar crisis de reputacion. La clasificacion binaria o ternaria permite alertas tempranas.
- Analisis politico y social: clasificacion de discursos, articulos o comentarios para estudios academicos o periodisticos sobre opinion publica en el mundo arabe.
- Moderacion de contenido: deteccion de comentarios abusivos o negativos en plataformas de contenido generado por usuarios, como primer filtro antes de revision humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de evaluacion, y el repositorio de GitHub no documenta resultados cuantitativos. No se puede comparar objetivamente con otros modelos sin datos verificables.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en FP16 (135M parametros), 0,27 GB en INT8 si se cuantiza.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, incluyendo GTX 1650, RTX 2060 o superiores. Tambien puede ejecutarse en CPU con latencia aceptable para inferencia por lotes.
- Compatibilidad con hardware de consumo: si, cabe en cualquier GPU moderna de consumo e incluso en Raspberry Pi 5 con cuantizacion INT8.
- Opciones de despliegue: Hugging Face Transformers con PyTorch, ONNX Runtime, TensorFlow Serving, o mediante contenedores Docker con FastAPI. No es compatible con vLLM ni TGI por ser un modelo encoder-only.
- Latencia estimada: en una RTX 3090, la inferencia de una secuencia de 128 tokens tarda aproximadamente 5-10 ms. En CPU (Intel i7), unos 50-100 ms por secuencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| randsalem/arabic-sentiment-compass-arabert | 135M | 512 | Apache 2.0 | Sentimiento en arabe (dialecto egipcio) |
| PRAli22/AraBert-Arabic-Sentiment-Analysis | 135M | 512 | no disponible | Sentimiento en arabe (dataset desconocido) |
| aubmindlab/bert-base-arabert | 135M | 512 | Apache 2.0 | Modelo base, no ajustado para sentimiento |

El modelo de randsalem es un ajuste fino de AraBERT, al igual que el de PRAli22. La diferencia principal es el dataset de entrenamiento: el primero se centra en dialecto egipcio, mientras que el segundo no especifica su dataset. El modelo base de aub-mind no esta ajustado para sentimiento y requiere fine-tuning adicional.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse sobre tuits, el modelo puede reflejar sesgos presentes en redes sociales (lenguaje ofensivo, desequilibrios demograficos). No se ha documentado ninguna mitigacion.
- Riesgo de alucinacion: al ser un clasificador, no genera texto, por lo que el riesgo de alucinacion es bajo. Sin embargo, puede producir clasificaciones erroneas en textos ambiguos o ironicos.
- Limitaciones de contexto: ventana de 512 tokens, insuficiente para documentos largos. Para resenas extensas, se requiere truncamiento o estrategias de ventana deslizante.
- Limitaciones de idioma: especializado en arabe, con mejor rendimiento en dialecto egipcio. Puede degradarse en otros dialectos (magrebi, golfo) o en arabe clasico.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones, siempre que se mantenga el aviso de copyright y se documenten los cambios.
- Caveat de produccion: no hay informacion sobre el rendimiento en produccion, latencia bajo carga ni pruebas de robustez. Se recomienda evaluar el modelo en un conjunto de validacion propio antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/randsalem/arabic-sentiment-compass-arabert
- Repositorio del autor (proyecto de graduacion): https://github.com/Randsalem19/arabic-sentiment-analysisarabic-sentiment-analysis
- Modelo base AraBERT: https://huggingface.co/aubmindlab/bert-base-arabert
- Repositorio de AraBERT: https://github.com/aub-mind/arabert
- Modelo similar de PRAli22: https://huggingface.co/PRAli22/AraBert-Arabic-Sentiment-Analysis
- Articulo sobre fine-tuning de AraBERT para sentimiento: https://aclanthology.org/2025.ranlp-ahasis.3/
