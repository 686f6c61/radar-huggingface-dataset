# poketwouser/leak-curber-enzyme-retrieval-dual

## Resumen

`poketwouser/leak-curber-enzyme-retrieval-dual` es un sistema de recuperación (retrieval) que predice el número EC más probable de una reacción química dada como *reaction SMILES*. No es un modelo de lenguaje: es un doble codificador (dual encoder) que proyecta la reacción y las clases EC a un mismo espacio vectorial de 256 dimensiones y las compara por similitud coseno. Lo publica el usuario `poketwouser` como participación en la tarea `leak-curber-enzyme-retrieval` del benchmark Leak-CURBER (edición `leak-curber-enzyme-retrieval-20261023`), un *leaderboard* de evaluación de modelos para reacciones enzimáticas sin fuga de datos.

La entrada son 6.144 características calculadas con RDKit 2025.09.1: 2.048 bits de DRFP (radio 3, con anillos, tras eliminar los números de mapa atómico) y 2.048 cuentas Morgan (radio 2) agregadas sobre reactivos y productos en dos vistas complementarias, `log1p|P − R|` (lo que la reacción cambia) y `log1p(min(R, P))` (lo que conserva). La torre de reacción es un MLP 6144 → 1024 → 256 y la torre de EC suma embeddings aprendidos de los prefijos de nivel 1 a nivel 4 de cada número EC, de modo que las clases no vistas se colocan por sus ancestros jerárquicos.

Su relevancia es doble: por un lado es un *baseline* ligero y reproducible (inferencia solo con NumPy, sin GPU) para una tarea de anotación enzimática; por otro, ilustra un patrón de diseño habitual en competiciones, el ensemble de 5 miembros combinado con un kNN sobre las reacciones de entrenamiento (0,75·p_net + 0,25·p_knn). El repositorio ocupa 1,3 GB y, en el momento de la consulta, acumula 0 descargas y 1 *like*.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Doble codificador (dual encoder) con torres MLP y puntuación por similitud coseno; no es un transformer |
| Parametros totales | No declarado. El MLP de la torre de reacción implica ~6,55 M de pesos por miembro (6144×1024 + 1024×256, más sesgos), ×5 miembros; las embeddings de prefijos EC no se cuantifican en la model card |
| Longitud de contexto | No aplica: la entrada es un vector fijo de 6.144 dimensiones derivado de un único *reaction SMILES* |
| Tipos de cuantizacion | No disponible; los pesos se sirven en un `.npz` de NumPy y la inferencia es en NumPy puro |
| Idiomas soportados | No disponible; el modelo no procesa lenguaje natural, solo *reaction SMILES* |
| Licencia | No disponible |
| Formato de pesos | NumPy `.npz` (`weights/model.npz`), junto con `predict.py` |
| Tarea | Predicción del número EC más probable para una reacción (`leak-curber-enzyme-retrieval`) |
| Benchmark de referencia | `leak-curber-enzyme-retrieval-20261023` |
| Entrada | 6.144 features: DRFP 2.048 bits (radio 3, anillos, RDKit 2025.09.1, sin números de mapa atómico) + Morgan counts radio 2, 2.048 bits, en las vistas `log1p\|P − R\|` y `log1p(min(R, P))` |
| Dimensión de embedding | 256 |
| Miembros del ensemble | 5 (inicializaciones distintas) |
| Datos de entrenamiento | 96.966 pares del *split* público de entrenamiento |
| Tamaño del repositorio | 1,3 GB |
| Descargas / likes | 0 / 1 |
| Fechas | Creado el 2026-10-22; actualizado el 2026-10-26 |

## Arquitectura y entrenamiento

La torre de reacción es un perceptrón multicapa 6144 → 1024 (ReLU, dropout 0,3) → 256. La torre de EC representa cada clase como la suma de embeddings aprendidos de sus prefijos de nivel 1 a nivel 4; durante el entrenamiento el término de nivel 4 se elimina de forma aleatoria, lo que fuerza a que las clases con pocos ejemplos —o nunca vistas— queden situadas en el espacio por sus ancestros jerárquicos. La puntuación es la similitud coseno entre ambas proyecciones, escalada por una temperatura aprendida, y el objetivo es un softmax sobre las clases EC presentes en entrenamiento con *label smoothing* de 0,1.

El entrenamiento usa AdamW con tasa de aprendizaje 3e-4, lote de 512 y 14 épocas, únicamente sobre el *split* público de entrenamiento (96.966 pares). La selección de hiperparámetros se hizo sobre una validación local construida para imitar la del curso, emparejando consultas por longitud y por su mejor similitud DRFP con el resto de reacciones de entrenamiento. En inferencia se combinan dos señales: (1) `p_net`, la media de las probabilidades softmax de los 5 miembros del ensemble; y (2) `p_knn`, una recuperación en el espacio aprendido donde cada miembro ordena las reacciones de entrenamiento por similitud coseno con la consulta, toma los 5 vecinos más próximos, les asigna pesos `softmax(similitud / 0,02)` y reparte el peso de cada vecino a partes iguales entre sus números EC (promediado sobre los 5 miembros). La clase escrita es la mejor bajo `0,75·p_net + 0,25·p_knn`. Toda la inferencia se ejecuta solo con NumPy: `weights/model.npz` contiene los pesos de cada torre, los vectores EC normalizados y las embeddings de las reacciones de entrenamiento con sus EC.

## Capacidades

- Predicción de números EC (clasificación sobre el espacio jerárquico EC) a partir de un *reaction SMILES*.
- Emite exactamente un EC por entrada única, porque la métrica del *leaderboard* solo puntúa la primera predicción.
- Generalización a clases EC no vistas en entrenamiento gracias al *dropout* del prefijo de nivel 4 y a la descomposición jerárquica.
- Ensemble de 5 miembros con recuperación kNN sobre las reacciones de entrenamiento (5 vecinos, temperatura 0,02).
- Ejecución sin GPU y sin framework de *deep learning*: solo NumPy y el fichero de pesos.
- No genera texto, no hace razonamiento en lenguaje natural, no soporta *tool calling* ni *function calling*, no actúa como agente y no procesa visión ni audio.
- No es multilingüe: su única modalidad de entrada es la representación química de la reacción.

## Casos de uso

- Anotación de reacciones sin EC en bases de datos bioquímicas: pasar un *reaction SMILES* por `predict.py` y obtener un EC candidato para triaje manual, con la ventaja de que el modelo funciona en CPU y no requiere infraestructura de GPU.
- Curaduría y detección de inconsistencias: comparar el EC predicho con el anotado en un catálogo interno para detectar entradas mal etiquetadas o reacciones mal dibujadas, usando el EC predicho como señal de alarma.
- Priorización en pipelines de biología sintética: descartar reacciones propuestas que no encajan en ninguna clase EC plausible antes de lanzar búsquedas estructurales más caras (por ejemplo, con enfoques tipo EnzymeCAGE).
- Etiquetado débil para entrenar otros modelos: generar pseudo-etiquetas EC sobre grandes catálogos de reacciones y usarlas como preentrenamiento o como *baseline* de comparación frente a modelos que sí usan estructura proteica.
- Ingeniería de rutas metabólicas: comprobar qué clases EC aparecen en una ruta propuesta y si existe enzima conocida para cada paso, detectando pasos huérfanos antes de invertir en diseño experimental.
- *Baseline* de referencia en evaluación de modelos enzimáticos: al ser un método ligero y reproducible (96.966 pares, 14 épocas, inferencia NumPy), sirve como suelo de comparación en experimentos internos de predicción de EC.
- Análisis retro-sintético asistido: generar EC candidatos para reacciones hipotéticas y filtrar las que se salen de las clases EC con enzimas caracterizadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card describe la tarea (`leak-curber-enzyme-retrieval`) y el benchmark objetivo (`leak-curber-enzyme-retrieval-20261023`), pero no incluye métricas numéricas propias ni de comparación.

## Requisitos de hardware

- Inferencia en CPU: el autor indica que la inferencia es solo NumPy, sin dependencia de CUDA ni de frameworks de *deep learning*.
- VRAM: no aplica; no se documenta ninguna ruta de ejecución en GPU.
- RAM estimada: el repositorio ocupa 1,3 GB, que incluye los pesos de los 5 miembros y las embeddings de las 96.966 reacciones de entrenamiento (a 256 dimensiones en `float32` serían ~99 MB por miembro, ~0,5 GB para el conjunto); el resto corresponde a los ficheros auxiliares del repositorio.
- GPU recomendadas: ninguna. Cualquier equipo capaz de ejecutar NumPy y RDKit 2025.09.1 para calcular las features de entrada es suficiente.
- Cabe en GPU de consumo: sí, pero no es necesaria; el cuello de botella es el cálculo de descriptores con RDKit y la búsqueda lineal de vecinos.
- Opciones de despliegue: `python predict.py --input val_inputs.parquet --output predictions.jsonl`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, y ninguno de ellos aplica a esta arquitectura.
- Latencia y throughput: no disponible. Por diseño, cada consulta implica puntuar contra todas las clases EC y una búsqueda lineal sobre 96.966 vectores por cada uno de los 5 miembros.

## Comparativa con modelos similares

| Modelo | Enfoque | Entrada | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (`leak-curber-enzyme-retrieval-dual`) | Doble codificador MLP + kNN sobre reacciones, ensemble de 5 | *Reaction SMILES* (DRFP + Morgan) | No declarado (~6,55 M por miembro en la torre de reacción) | No aplica (vector de 6.144) | No disponible | Peso `.npz` en Hugging Face, 0 descargas |
| EnzymeCAGE | Recuperación enzimática con estructura de bolsillo y reacción química | Estructura de proteína + reacción | No disponible en la información | No disponible | No disponible | Publicado como marco de *deep learning* (MarkTechPost, 2024) |
| *Baselines* DRFP + clasificador | Descriptor de reacción + modelo supervisado plano | *Reaction SMILES* (DRFP) | No disponible | No disponible | No aplica | Práctica habitual; sin implementación concreta identificada en la búsqueda |
| Modelos de lenguaje proteico para ranking de variantes | *Protein language model* | Secuencia proteica | No disponible | No disponible | No disponible | Citados en el archivo Enzyme AI Papers |

La diferencia clave frente a EnzymeCAGE es que este modelo no consume estructura ni secuencia proteica: solo la química de la reacción, lo que lo hace mucho más barato pero ciego a la información del enzima.

## Limitaciones y advertencias

- Solo predice números EC; no genera texto, explicaciones ni justificaciones, y no puede usarse como modelo de lenguaje.
- Emite una única clase EC por entrada, elegida para maximizar la métrica del *leaderboard*; no ofrece ranking calibrado de alternativas más allá de las probabilidades internas.
- El 25 % de la puntuación final proviene de un kNN sobre las reacciones de entrenamiento, de modo que el comportamiento depende fuertemente de la cobertura del *split* de entrenamiento y puede degradarse en quimiotipos alejados de él.
- No usa información estructural ni de secuencia de la enzima, por lo que no puede distinguir reacciones químicamente idénticas catalizadas por enzimas de clases EC distintas.
- Los descriptores dependen de una versión concreta de RDKit (2025.09.1); cambios de versión o el preprocesado de números de mapa atómico pueden alterar los bits de DRFP y, con ello, las predicciones.
- No hay información sobre sesgos, composición del dataset más allá del recuento (96.966 pares) ni cobertura taxonómica de las clases EC.
- Licencia no especificada: no hay autorización explícita para uso comercial; conviene contactar con el autor antes de integrarlo en producción.
- Riesgo de alucinación en el sentido de asignar un EC plausible pero incorrecto a reacciones novedosas; no se han publicado métricas de calibración ni de precisión.
- Metadatos mínimos: 0 descargas, 1 *like*, sin *pipeline* declarado, sin idiomas y sin *tags* de licencia; es una entrega de competición, no un artefacto con soporte.
- Idiomas no aplicables: cualquier documentación o texto de entrada debe preprocesarse fuera del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/poketwouser/leak-curber-enzyme-retrieval-dual
- Dataset de la tarea: https://huggingface.co/datasets/starkAhmed43/leak-curber-enzyme-retrieval/tree/main
- Póster de Leak-CURBER en NeurIPS 2026: https://neurips.cc/virtual/2026/poster/139384
- Artículo sobre EnzymeCAGE (MarkTechPost): https://www.marktechpost.com/2024/12/17/enzymecage-a-deep-learning-framework-designed-to-predict-enzyme-reaction-catalytic-specificity-by-encoding-both-pocket-specific-enzyme-structures-and-chemical-reactions/
- Archivo Enzyme AI Papers: https://cnjxt.github.io/enzyme-ai-papers/archive/
