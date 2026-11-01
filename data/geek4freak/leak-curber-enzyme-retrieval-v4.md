# geek4freak/leak-curber-enzyme-retrieval-v4

## Resumen

Leak CURBER enzyme retrieval v4 es un modelo de predicción de números EC (Enzyme Commission) a partir de SMILES de reacción, desarrollado por el usuario geek4freak y publicado en HuggingFace bajo licencia MIT. No se trata de un modelo de lenguaje generativo, sino de un sistema de clasificación y recuperación especializado en química enzimática: dado un SMILES que describe reactivos y productos de una reacción, devuelve un único número EC que identifica la clase de enzima que cataliza dicha transformación.

La arquitectura combina dos componentes. Por un lado, un ensemble de ocho clasificadores MLP residuales entrenados sobre fingerprints de reacción de Morgan dirigidos (reactivos, productos, subestructuras ganadas y perdidas). Por otro, un sistema de recuperación kNN que opera sobre cuatro representaciones distintas: fingerprint de Morgan, centro de reacción, TF-IDF de n-gramas de caracteres (3-5) y embeddings del propio MLP. Las predicciones se fusionan con pesos y temperaturas calibrados sobre un holdout del 10 % de reacciones únicas.

El modelo es relevante para pipelines de anotación enzimática, curación de bases de datos metabólicas y herramientas de biología computacional que necesiten asignar funciones enzimáticas a reacciones huérfanas. Su inferencia es exclusivamente en CPU (`python /app/predict.py --input IN --output OUT`), lo que facilita el despliegue sin GPU. El repositorio ocupa 0,4 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Ensemble de 8 MLP residuales + recuperación kNN multimodal (fingerprint Morgan, centro de reacción, TF-IDF de caracteres, embedding MLP) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada: un SMILES de reacción) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo lingüístico; opera sobre notación química) |
| Licencia | MIT |
| Formato de pesos | no disponible (repo de 0,4 GB; el autor indica inferencia vía `predict.py`) |

## Arquitectura y entrenamiento

El componente principal es un fingerprint de reacción de Morgan dirigido que codifica por separado reactivos, productos, subestructuras ganadas y subestructuras perdidas. Las diferencias se calculan sin plegar y después se pliegan, preservando la señal del centro de reacción. Sobre esta representación se entrenan ocho clasificadores MLP residuales con objetivos multi-EC suaves (peso 1/n por etiqueta), cabezas auxiliares L3/L2/L1 y aumento de datos mediante inversión de reacciones (reversed-reaction augmentation). Las cabezas auxiliares explotan la jerarquía del vocabulario EC: predecir el nivel 3 o 2 como tarea auxiliar regulariza el nivel 4, que es el objetivo final.

La segunda pieza es un sistema de recuperación que combina cuatro vecinos más cercanos por similitud coseno: kNN sobre el fingerprint de Morgan, kNN sobre el centro de reacción, kNN sobre TF-IDF de n-gramas de caracteres (3-5) y kNN sobre el embedding del MLP. La fusión usa pesos y temperaturas ajustados sobre un holdout del 10 % de reacciones únicas: `knn_diff` 0,25, `knn_text` 0,5, `mlp` 1,5, con `knn_morgan` y `knn_emb` a 0,0 y `beta` 1,0. El vocabulario EC proviene de ExPASy ENZYME release 02-Sep-2026 (SIB, CC BY 4.0). No se especifican el número de tokens de entrenamiento ni la composición exacta del dataset más allá de las reacciones únicas empleadas.

## Capacidades

- Predicción de un número EC por reacción SMILES, con salida a nivel 4 (subclase completa).
- Clasificación jerárquica: el modelo produce predicciones coherentes en los niveles L4, L3, L2 y L1 gracias a las cabezas auxiliares.
- Recuperación por similitud sobre cuatro representaciones complementarias, útil para inspeccionar reacciones vecinas y justificar la predicción.
- Aumento por inversión de reacciones: robustez ante SMILES escritos en sentido inverso (productos como reactivos).
- Inferencia exclusiva en CPU mediante script CLI (`predict.py`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un clasificador químico de dominio específico.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Anotación funcional de reacciones huérfanas: dado un SMILES de reacción sin anotación EC, el modelo asigna una clase enzimática candidata a nivel L4, acelerando la curación manual en bases de datos metabólicas.
- Curación de bases de datos tipo Rhea o MetaCyc: el sistema puede predecir EC para reacciones nuevas y marcar discrepancias frente a anotaciones existentes, usando el kNN de recuperación para auditar los vecinos más similares.
- Priorización en pipelines de enzimas de novo: al integrarse en un flujo de diseño de enzimas, el modelo filtra reacciones candidatas por clase EC antes de pasar a simulación o expresión, reduciendo el espacio de búsqueda.
- Enriquecimiento de datasets de aprendizaje automático químico: asignación automática de etiquetas EC a reacciones extraídas de patentes o literatura, con la ventaja de que la inferencia en CPU permite procesar lotes grandes sin GPU.
- Herramienta de validación en laboratorio: antes de ensayar una enzima candidata, el equipo puede comprobar si la reacción propuesta es consistente con la clase EC esperada y detectar asignaciones erróneas.
- Docencia e investigación en bioinformática: el modelo sirve como ejemplo reproducible de ensemble MLP + retrieval para clasificación jerárquica, con pesos y temperaturas publicados que permiten replicar el pipeline.
- Integración en servicios web de química computacional: al ser CPU-only y pesar 0,4 GB, puede desplegarse en contenedores ligeros o funciones serverless para consultas puntuales de EC.

## Benchmarks y rendimiento

Resultados locales publicados por el autor sobre el holdout del 10 % de reacciones únicas (no son cifras de leaderboard):

| Nivel EC | Precisión (holdout 10 %) |
|---|---|
| L4 | 0,6808 |
| L3 | 0,8889 |
| L2 | 0,9111 |
| L1 | 0,9420 |

Subconjunto de reacciones disímiles (top-1 coseno < 0,6, n=73): L4 = 0,6050.

No se han publicado comparaciones con CLIPZyme, Horizyn, CARE/CREEP ni DRFP en la información disponible, pese a que el autor los cita como referencias.

## Requisitos de hardware

- Inferencia exclusivamente en CPU según la model card (`python /app/predict.py --input IN --output OUT`); no requiere GPU.
- VRAM estimada: 0 GB (no usa GPU). El repositorio ocupa 0,4 GB, por lo que la RAM necesaria para cargar pesos y ejecutar el ensemble es del orden de unos pocos GB, aunque el autor no especifica la cifra exacta.
- GPU recomendadas: no aplica; cualquier CPU moderna es suficiente.
- Cabe en cualquier consumer GPU, pero no la necesita.
- Opciones de despliegue: script CLI propio (`predict.py`) dentro de un contenedor; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|
| Leak CURBER enzyme retrieval v4 | Ensemble MLP + kNN retrieval | Fingerprint de reacción dirigido + TF-IDF + embedding | MIT | HuggingFace (geek4freak) |
| CLIPZyme (Mikhael et al., ICML 2024) | Modelo contrastivo | Retrieval enzima-reacción | no disponible en la información | Referencia académica |
| Horizyn (Rocks et al., PNAS 2026) | Modelo de retrieval | Enzima-reacción | no disponible en la información | Referencia académica |
| CARE/CREEP (Yang et al., 2025) | Modelo de retrieval | Enzima-reacción | no disponible en la información | Referencia académica |
| DRFP (Probst et al., 2022) | Fingerprint de reacción | Representación química | no disponible en la información | Referencia académica |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada; la comparativa se limita a enfoque y disponibilidad.

## Limitaciones y advertencias

- El modelo predice un único número EC por reacción; no modela reacciones con múltiples enzimas o promiscuidad catalítica.
- El rendimiento en L4 cae al 0,6050 en reacciones disímiles (top-1 coseno < 0,6, n=73), lo que indica degradación fuera de la distribución de entrenamiento.
- Los resultados son locales sobre un holdout del 10 %; el propio autor advierte que no son previsiones de leaderboard.
- No se documentan sesgos, pero al depender de un vocabulario EC concreto (ExPASy ENZYME 02-Sep-2026) puede fallar con clases EC poco representadas o nuevas.
- No hay información sobre el tamaño del dataset de entrenamiento ni sobre la distribución de clases, lo que impide evaluar el riesgo de sesgo hacia clases mayoritarias.
- Licencia MIT permite uso comercial, pero el vocabulario EC subyacente es CC BY 4.0 (SIB), por lo que debe atribuirse adecuadamente.
- La inferencia depende de un script propio (`predict.py`) sin API estandarizada; la integración en producción requiere envolverlo.
- No se especifican formatos de pesos ni opciones de cuantización, lo que limita la portabilidad a otros runtimes.
- Ausencia de descargas y likes en HuggingFace: no hay validación comunitaria independiente del rendimiento declarado.

## Enlaces

- HuggingFace: https://huggingface.co/geek4freak/leak-curber-enzyme-retrieval-v4
- CLIPZyme (Mikhael et al., ICML 2024): referencia citada por el autor, sin URL en la información disponible.
- Horizyn (Rocks et al., PNAS 2026): referencia citada por el autor, sin URL en la información disponible.
- CARE/CREEP (Yang et al., 2025): referencia citada por el autor, sin URL en la información disponible.
- DRFP (Probst et al., 2022): referencia citada por el autor, sin URL en la información disponible.
- ExPASy ENZYME release 02-Sep-2026 (SIB, CC BY 4.0): vocabulario EC empleado, sin URL en la información disponible.
