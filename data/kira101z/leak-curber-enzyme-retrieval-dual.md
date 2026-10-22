# kira101z/leak-curber-enzyme-retrieval-dual

## Resumen

`kira101z/leak-curber-enzyme-retrieval-dual` es un modelo de recuperación (retrieval) para la tarea `leak-curber-enzyme-retrieval`, cuyo objetivo es ordenar hasta 10 números EC (Enzyme Commission) candidatos para una reacción bioquímica dada en forma de reaction SMILES. Lo desarrolla el usuario de Hugging Face kira101z y se enmarca en el benchmark Leak-CURBER, una evaluación multimodal con control de fuga de datos (leakage-controlled) para tareas de reacciones enzimáticas presentada en NeurIPS 2026. No es un modelo de lenguaje: es un codificador dual de recuperación, pensado como baseline ligero y reproducible para esta tarea concreta.

La arquitectura es un dual encoder de dos torres. La torre de reacción transforma un fingerprint DRFP de 2.048 bits (radio 3, con anillos, generado con RDKit 2025.09.1) mediante un MLP de 2048 → 1024 → 256. La torre de EC representa cada número EC como la suma de embeddings aprendidos de sus prefijos de nivel 1 a nivel 4; durante el entrenamiento se descarta aleatoriamente el término de nivel 4, de forma que las EC no vistas en entrenamiento quedan colocadas por sus ancestros. La puntuación es la similitud coseno entre ambas representaciones.

Su relevancia práctica es doble: por un lado, sirve como referencia honesta para la tarea (entrenamiento solo con el split público y selección de época con validación filtrada por Tanimoto de DRFP < 0,15); por otro, la inferencia es exclusivamente NumPy, con los pesos en `weights/model.npz`, lo que lo hace ejecutable en CPU sin dependencias de frameworks de deep learning. El repositorio tiene 0,0 GB, 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dual encoder (retrieval): torre de reacción MLP sobre fingerprint DRFP + torre de EC por suma de embeddings de prefijos ECML |
| Parametros totales | No publicado. Estimación a partir de la arquitectura descrita: ~2,36 M de pesos en la torre de reacción (2.048×1.024 + 1.024×256 = 2.359.296, más sesgos), sin contar la matriz de embeddings de prefijos EC |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: la entrada es un reaction SMILES convertido a un fingerprint DRFP de 2.048 bits (representación de longitud fija) |
| Tipos de cuantizacion | No disponible. Solo se distribuyen pesos en `model.npz` en precisión nativa; no hay versiones GGUF, AWQ, GPTQ ni INT8 publicadas |
| Idiomas soportados | No disponible / no aplica: no es un modelo de lenguaje; la entrada es notación química (SMILES) |
| Licencia | No disponible (la model card no la especifica) |
| Formato de pesos | `.npz` de NumPy (`weights/model.npz`, con pesos de la torre de reacción y vectores EC normalizados) |
| Entrada | Reaction SMILES (procesado con RDKit 2025.09.1 para generar DRFP) |
| Salida | Ranking de hasta 10 números EC; se puntúan todas las EC de `ec_vocabulary.json` |
| Funcion de puntuacion | Similitud coseno entre embedding de reacción y vector EC |
| Funcion de perdida | Softmax sobre las EC presentes en entrenamiento |
| Tamano del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo sigue un esquema de codificador dual simétrico en su interfaz (una representación por reacción, una por clase) pero asimétrico en su construcción. El lado de la reacción es una red puramente feed-forward: el reaction SMILES se convierte en un fingerprint DRFP de 2.048 bits, radio 3, incluyendo anillos, con RDKit 2025.09.1, y ese vector binario pasa por un MLP de dos capas lineales (2048 → 1024 → 256). El lado de la enzima no usa la secuencia proteica ni estructura 3D: cada número EC se representa como la suma de embeddings aprendidos de sus prefijos de nivel 1 a nivel 4, es decir, una descomposición jerárquica del código EC (por ejemplo, los prefijos de clase, subclase, sub-subclase y número completo).

La innovación técnica destacable es el dropout del término de nivel 4 durante el entrenamiento: al eliminar aleatoriamente la contribución más específica de la jerarquía, las EC que no aparecen en el split de entrenamiento pueden seguir siendo puntuadas a partir de sus ancestros, lo que mitiga parcialmente el problema de clases no vistas y permite rankear todo el vocabulario EC en lugar de solo las clases vistas. El entrenamiento emplea únicamente el split público de la tarea y una softmax sobre las EC de entrenamiento como objetivo; la época se seleccionó sobre conjuntos de validación local construidos de forma que ninguna reacción de entrenamiento restante tuviera Tanimoto de DRFP ≥ 0,15 respecto a una consulta, un filtro explícito para evitar fuga de datos por similitud estructural. No se documentan en la información disponible el número de tokens/pares de entrenamiento, la composición exacta del dataset, ni si hubo etapas de RLHF/DPO (no aplicables en un modelo de recuperación).

## Capacidades

- Recuperación de números EC: devuelve un ranking de hasta 10 candidatos EC para una reacción expresada como reaction SMILES, cubriendo todas las entradas de `ec_vocabulary.json`.
- Generalización jerárquica a clases no vistas: gracias al descarte aleatorio del prefijo de nivel 4, puede asignar EC ausentes en entrenamiento apoyándose en sus ancestros de nivel 1 a 3.
- Filtrado y priorización: al ser un ranking con puntuación coseno, permite truncar a top-1, top-3 o top-5 según el coste de verificación experimental.
- Ejecución sin framework de deep learning: inferencia solo con NumPy sobre `weights/model.npz`, lo que facilita su auditoría y reproducibilidad.
- Procesamiento por lotes desde fichero: la interfaz CLI (`predict.py`) consume `val_inputs.parquet` y produce `predictions.jsonl`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto: no es un modelo generativo ni multimodal.
- Capacidades multilingües: no aplica; la única "lengua" de entrada es la notación SMILES de reacción.

## Casos de uso

- Anotación funcional de reacciones en pipelines de biología computacional: dado un conjunto de reacciones nuevas en formato SMILES, el modelo genera un top-10 de EC candidatos que se usa como pre-filtro antes de la validación con datos de proteómica o ensayos in vitro, reduciendo el espacio de búsqueda de forma drástica.
- Baseline de referencia en investigación sobre retrieval enzimático: cualquier grupo que publique un método nuevo (por ejemplo, enfoques multimodales con estructura 3D) puede compararse contra este modelo en las mismas condiciones de control de fuga, ya que el autor documenta explícitamente el criterio de selección de época (Tanimoto < 0,15).
- Pre-etiquetado para curación de bases de datos: en la construcción de recursos tipo BRENDA o MetaCyc, el ranking sirve para sugerir la clase EC de reacciones huérfanas y priorizar la revisión manual de los curadores.
- Enseñanza y prototipado rápido: al ejecutarse en CPU con NumPy, es adecuado para cuadernos didácticos sobre representaciones de reacciones (DRFP) y aprendizaje con supervisión jerárquica, sin necesidad de GPU ni de instalar PyTorch.
- Enrutado en motores de búsqueda de enzimas: la salida top-k puede alimentar un sistema de recuperación posterior (por ejemplo, búsqueda de secuencias o estructuras) restringiendo la búsqueda a las familias EC más probables.
- Detección de inconsistencias en datasets: si una reacción anotada con EC X recibe de forma sistemática puntuaciones bajas para X y altas para otra clase, es una señal para revisar la anotación original.
- Integración en servicios ligeros: el tamaño reducido de los pesos permite empaquetar el modelo en una función serverless o un contenedor mínimo con solo NumPy y RDKit.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas numéricas (accuracy top-1/top-5, MRR, etc.) sobre el split de test de Leak-CURBER ni sobre los conjuntos de validación local empleados para elegir la época. Tampoco se reportan tiempos de inferencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: prácticamente nula. La inferencia es NumPy puro sobre un fichero `.npz` del orden de megabytes (repositorio de 0,0 GB); no requiere GPU.
- GPU recomendadas: ninguna. No se necesita A100, H100 ni RTX 4090; cualquier CPU moderna es suficiente. No se han publicado medidas de latencia.
- Cabe en GPU consumer: sí, en cualquier GPU e incluso en CPU de un portátil, aunque el modelo no está pensado para aceleración por GPU.
- Opciones de despliegue: script CLI `predict.py` (`python predict.py --input val_inputs.parquet --output predictions.jsonl`); al ser NumPy puro, puede envolverse en un servicio HTTP propio, una función serverless o un contenedor mínimo. vLLM, TGI, llama.cpp y Ollama no son aplicables porque no es un modelo de lenguaje.
- Dependencias de ejecución: NumPy para la inferencia y RDKit 2025.09.1 para generar los fingerprints DRFP a partir de los reaction SMILES.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Enfoque | Entrada | Parametros | Contexto | Licencia | Datos publicados |
|---|---|---|---|---|---|---|
| `kira101z/leak-curber-enzyme-retrieval-dual` | Dual encoder DRFP + embeddings jerárquicos de EC | Reaction SMILES (fingerprint DRFP) | ~2,36 M en la torre de reacción (estimado) + embeddings EC | No aplica (vector de 2.048 bits) | No disponible | Métricas no disponibles |
| TIGER (Text-Informed Generalized Enzyme-Reaction Retrieval) | Recuperación enzimática guiada por texto, destilando conocimiento semántico de secuencias proteicas mediante generación protein-to-text | Secuencia de proteína + reacción | No disponible | No disponible | No disponible | Paper en arXiv (2605.24489) |
| Enfoques multimodales 3D evaluados en Leak-CURBER | Incorporación de estructura 3D de proteína y bolsillos de unión predichos | Reacción + estructura | No disponible | No disponible | No disponible | OpenReview / NeurIPS 2026 |

La diferencia cualitativa principal es que este modelo prescinde por completo de información proteica y estructural: solo modela la reacción y la jerarquía EC, lo que limita su techo de rendimiento pero reduce coste computacional y dependencias. Los trabajos citados en la búsqueda (TIGER, los enfoques multimodales de Leak-CURBER) abordan explícitamente la incorporación de estructura 3D y de representaciones textuales de proteínas, dos áreas que la propia literatura del benchmark señala como abiertas.

## Limitaciones y advertencias

- Licencia no especificada: no se puede asumir uso comercial permitido. Antes de integrarlo en producto hay que contactar con el autor o consultar el repositorio.
- Modelo sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia externa de robustez ni de reproducibilidad de los resultados.
- Sin métricas publicadas: no hay números de accuracy top-1/top-5 ni MRR, por lo que no es posible evaluar su calidad absoluta ni compararlo cuantitativamente con alternativas.
- Entrada limitada a reaction SMILES: no acepta secuencia proteica, estructura 3D, nombre de enzima ni texto; las reacciones mal formadas o no parseables por RDKit quedarán fuera.
- Dependencia de la química cubierta por DRFP: reacciones con química poco representada en el conjunto de entrenamiento pueden recibir representaciones pobres, ya que el fingerprint es fijo y no aprendido.
- Resolución a nivel de subclase en clases no vistas: cuando el nivel 4 se ha descartado en entrenamiento, el modelo puede acertar la familia EC pero fallar el número completo; conviene tratar el top-k como hipótesis jerárquicas, no como etiquetas exactas.
- Calibración desconocida: las puntuaciones provienen de un coseno con softmax sobre las EC de entrenamiento; no se documenta si son probabilidades calibradas, así que no deberían usarse como umbrales de confianza sin validación propia.
- Control de fuga limitado al conjunto de entrenamiento: el filtro Tanimoto ≥ 0,15 se aplica sobre reacciones de entrenamiento, no sobre el test oficial del benchmark; la evaluación definitiva debe hacerse sobre el split leakage-controlled de Leak-CURBER.
- Alucinación en sentido estricto no aplica (no genera texto), pero sí existe riesgo de asignaciones erróneas con apariencia de seguridad al rankear todo el vocabulario EC.
- Sesgos: no documentados; al entrenar solo con el split público, hereda los sesgos de cobertura taxonómica y química de ese conjunto (posible sobrerrepresentación de ciertas familias enzimáticas).
- Idiomas y contexto: no aplica ventana de contexto; no hay soporte multilingüe ni de instrucciones en lenguaje natural.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kira101z/leak-curber-enzyme-retrieval-dual
- Póster NeurIPS 2026 de Leak-CURBER (benchmark multimodal con control de fuga): https://neurips.cc/virtual/2026/poster/139384
- Artículo en OpenReview, "Evaluating Multi-Modal Models for Enzyme-Reaction Retrieval": https://openreview.net/forum?id=UMibDfJAO8
- Artefactos de rebuttal de Leak-CURBER en Zenodo: https://zenodo.org/records/21642841
- TIGER: Text-Informed Generalized Enzyme-Reaction Retrieval (arXiv): https://arxiv.org/html/2605.24489v1
