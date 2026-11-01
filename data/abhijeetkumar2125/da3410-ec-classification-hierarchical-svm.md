# AbhijeetKumar2125/da3410-ec-classification-hierarchical-svm

## Resumen

El modelo `da3410-ec-classification-hierarchical-svm` es un clasificador de números EC (Enzyme Commission) a partir de secuencias de aminoácidos, desarrollado por AbhijeetKumar2125 para la competición DA3410 Deep Learning Lab Project 2. No se trata de un modelo de lenguaje ni de una red neuronal profunda: es un pipeline clásico de aprendizaje automático que combina un vectorizador TF-IDF a nivel de carácter con dos clasificadores lineales SVM organizados de forma jerárquica. El problema que resuelve es la anotación funcional automática de enzimas, una tarea central en bioinformática donde la asignación manual de números EC a proteínas nuevas es lenta y costosa.

La relevancia de esta ficha es acotada: el modelo está pensado para un entorno de competición concreta, con un vocabulario EC cerrado y un formato de entrada/salida específico (Parquet de entrada, JSONL de salida). No es un modelo de propósito general ni un checkpoint reutilizable fuera de ese contexto. Su interés técnico reside en demostrar que un enfoque clásico de n-gramas de caracteres con SVM jerárquico puede alcanzar un 90,21 % de exactitud L4 en validación local, sin GPU y con inferencia en CPU.

El repositorio ocupa 0,9 GB y el artefacto de pesos es un fichero Joblib comprimido. No hay información sobre idiomas, pipeline de HuggingFace ni resultados oficiales de leaderboard.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline TF-IDF (n-gramas de caracteres 2–4) + dos clasificadores LinearSVC jerárquicos |
| Parametros totales | no disponible (no es una red neuronal; el modelo es un artefacto Joblib de SVM lineales y vocabulario TF-IDF) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada = secuencia de aminoácidos completa, sin ventana definida) |
| Tipos de cuantizacion | no disponible (no aplica; el artefacto es Joblib comprimido) |
| Idiomas soportados | no disponible (no aplica; entrada de secuencias proteicas) |
| Licencia | other |
| Formato de pesos | Joblib (`weights/hierarchical_kmer_svm.joblib`) |

## Arquitectura y entrenamiento

La arquitectura es un pipeline en dos etapas sobre representaciones dispersas. Primero, un `TfidfVectorizer` a nivel de carácter convierte cada secuencia proteica en un vector disperso de hasta 30.000 dimensiones, usando n-gramas de 2 a 4 aminoácidos, `min_df=3`, escalado sublinear de frecuencia de término y normalización L2 con `float32`. Después, un primer `LinearSVC` predice el padre EC de tres componentes; un segundo `LinearSVC` especialista predice el número EC completo dentro del grupo padre seleccionado. Los grupos con una sola etiqueta EC observada se resuelven directamente con esa etiqueta, sin pasar por el especialista.

El entrenamiento usa los datos públicos de la competición y el vocabulario EC del repositorio starter. No se indica el número de tokens ni el tamaño del conjunto de entrenamiento. Las secuencias con múltiples anotaciones EC reciben pesos de entrenamiento para reflejar esa multiplicidad. No hay RLHF, DPO ni ajuste por preferencias: es un ajuste supervisado clásico de SVM lineales. La innovación técnica destacable es la descomposición jerárquica del problema de clasificación multi-etiqueta en dos decisiones secuenciales, lo que reduce el espacio de clases del segundo clasificador y permite reutilizar la estructura taxonómica de los números EC.

## Capacidades

- Clasificación de secuencias de aminoácidos en números EC de cuatro componentes.
- Predicción jerárquica con métricas parciales L1, L2, L3 y L4 (prefijos del número EC).
- Manejo de secuencias con múltiples anotaciones EC mediante pesos de entrenamiento.
- Agrupación de secuencias idénticas en la entrada para emitir una predicción por secuencia única.
- Inferencia offline en CPU, sin acceso a red.
- Empaquetado en contenedor Linux x86-64 con Python 3.12 y scikit-learn.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- No tiene capacidades multilingües en el sentido de NLP: la entrada es una secuencia proteica, no texto natural.

## Casos de uso

- Anotación funcional a gran escala de proteínas no caracterizadas: el pipeline procesa lotes de secuencias en Parquet y emite un número EC por secuencia única, adecuado para pre-anotar genomas o metagenomas antes de revisión manual.
- Filtrado previo en pipelines de biología computacional: dado su coste de CPU bajo y su inferencia offline, puede actuar como primera pasada que descarta o prioriza candidatos antes de herramientas más costosas como BLAST o modelos de lenguaje proteico.
- Reproducción de la competición DA3410: el formato de entrada (`id`, `sequence`) y salida (`{"id":..., "prediction":["1.1.1.1"]}`) permite ejecutar el script `predict.py` tal cual contra los datos de evaluación.
- Docencia y experimentación con clasificación jerárquica: sirve como línea base reproducible para comparar contra enfoques basados en embeddings de modelos proteicos preentrenados.
- Despliegue en entornos sin GPU: el contenedor probado con 2 CPUs y 16 GB de RAM procesa 11.367 secuencias únicas en unos 16 segundos, lo que lo hace viable en infraestructura modesta o aislada.
- Clasificación de enzimas en entornos con restricciones de red: al no requerir acceso a red durante la inferencia, encaja en despliegues air-gapped o de confidencialidad estricta.

## Benchmarks y rendimiento

Resultados de validación local agrupada sobre los datos públicos de entrenamiento (secuencias idénticas mantenidas en el mismo split). No son puntuaciones oficiales del leaderboard de HuggingFace.

| Metrica | Resultado |
|---|---:|
| L4: número EC exacto | 90,21 % |
| L3: primeros tres componentes | 96,74 % |
| L2: primeros dos componentes | 97,10 % |
| L1: primer componente | 97,84 % |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- Inferencia exclusivamente en CPU; no requiere GPU.
- Entorno de prueba del autor: 2 CPUs, límite de 16 GB de memoria, red deshabilitada.
- Throughput medido: 11.367 secuencias únicas en aproximadamente 16 segundos en ese entorno (no garantizado en el evaluador oficial).
- Tamaño del repositorio: 0,9 GB, dominado por el artefacto Joblib y el vocabulario TF-IDF.
- No aplica despliegue con vLLM, llama.cpp, Ollama ni TGI: el artefacto es un Joblib de scikit-learn y se sirve con Python 3.12 + scikit-learn.
- Despliegue recomendado: contenedor Docker Linux x86-64 con el script `predict.py` y el fichero `weights/hierarchical_kmer_svm.joblib`.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros clasificadores EC ni con modelos de lenguaje proteico (ESM, ProtBert, etc.), y no se dispone de datos de rendimiento de alternativas en este contexto.

## Limitaciones y advertencias

- El modelo usa patrones de secuencia (n-gramas de caracteres) y no estructura tridimensional ni embeddings de modelos de lenguaje proteico preentrenados, lo que limita su capacidad de generalización a familias enzimáticas poco representadas.
- Los resultados son de validación local agrupada, no del leaderboard oficial; el rendimiento en los datos de evaluación reservados puede diferir.
- El vocabulario EC está cerrado al proporcionado por la competición; no puede predecir números EC fuera de ese conjunto.
- La licencia es "other" sin texto de licencia en la información disponible: es imprescindible revisar los términos del repositorio antes de cualquier uso comercial.
- No hay información sobre sesgos, idiomas ni dominios de aplicación fuera de la clasificación de enzimas.
- El script emite una única predicción EC por secuencia, aunque la interfaz de la competición admite entre uno y diez números ordenados por ranking.
- El rendimiento de 16 segundos para 11.367 secuencias es una medición del entorno local del autor y no una garantía del evaluador oficial.
- Riesgo de sobreajuste al vocabulario y a la distribución del conjunto de entrenamiento público de la competición.

## Enlaces

- HuggingFace: https://huggingface.co/AbhijeetKumar2125/da3410-ec-classification-hierarchical-svm
- No se han encontrado en la información proporcionada otros enlaces a papers, blogs, repositorios o demos.
