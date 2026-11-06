# rishithakanugula26/enzyme-retrieval-v5

## Resumen

enzyme-retrieval-v5 es un sistema de clasificación de reacciones químicas desarrollado por el usuario rishithakanugula26 para la tarea de predicción de números EC (Enzyme Commission) a partir de SMILES de reacción. No es un modelo de lenguaje: es un ensemble de 17 redes neuronales (clasificadores MLP y codificadores duales) que operan sobre descriptores moleculares clásicos como fingerprints de Morgan, DRFP y pares de átomos, entrenadas exclusivamente con PyTorch en CPU.

El sistema aborda el problema de la anotación automática de enzimas en reacciones bioquímicas, una tarea relevante en biología computacional y descubrimiento de fármacos donde la asignación manual de números EC es costosa. Su diseño está específicamente orientado a competiciones de tipo "leak-curbed", donde el conjunto de validación evita fugas de información entre reactivos y productos, y emplea normalización química (neutralización, eliminación de estereoquímica) para robustecer la generalización.

La relevancia actual del modelo radica en su enfoque de ensemble multi-descriptor con inferencia exclusivamente en CPU y un consumo de memoria contenido (unos 2,4 GB de pesos residentes), lo que lo hace desplegable en entornos sin GPU. La versión v5 añade un clasificador de pares de átomos y cuatro codificadores duales respecto a v4, mejorando las métricas de validación local en todos los niveles de la jerarquía EC.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de 17 redes: 9 clasificadores MLP (3 grupos × 3 miembros) y 8 codificadores duales (torre de reacción + torre EC) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; entrada = descriptores moleculares de dimensión fija) |
| Tipos de cuantizacion | no disponible (los índices kNN se mantienen en float16 en memoria) |
| Idiomas soportados | no disponible (no procesa texto natural) |
| Licencia | CC BY 4.0 |
| Formato de pesos | no disponible (repo de 1,8 GB; se citan ficheros `config.json` y pesos consumidos por PyTorch/numpy) |

## Arquitectura y entrenamiento

El sistema combina cuatro grupos de redes. Los clasificadores MLP tienen arquitecturas 8192→1536→768 (Morgan), 10240→1536→768 (Morgan+DRFP) y 6144→1536→768 (pares de átomos), cada uno con cabezas de salida para los niveles L4, L3, L2 y L1 de la jerarquía EC. Los codificadores duales proyectan la reacción a un espacio de 256 dimensiones (torre de reacción con H = 1024 o 2048) y comparan por similitud coseno con una torre EC cuya representación es la suma de embeddings aprendidos de los prefijos L1 a L4; el término L4 se descarta aleatoriamente durante el entrenamiento para que las EC raras se apoyen en su subclase y clase.

Las características de entrada incluyen bloques direccionales de Morgan (8192 valores: ganados, perdidos y conservados a radio 2 con 2048 bits cada uno; ganados y perdidos a radio 1 con 1024 bits cada uno), DRFP de 2048 bits (radio 3, anillos) y conteos direccionales de pares de átomos (6144 valores). Antes del fingerprinting cada molécula se neutraliza con `Uncharger` de RDKit, se elimina su estereoquímica y se descarta `[H+]`; las cadenas de reacción no se alteran. El entrenamiento usa objetivos suaves (1/n por EC registrada) en cada nivel, aumento por reacción inversa y 20 épocas; los codificadores duales usan temperatura aprendida sobre la similitud coseno y label smoothing de 0,1. Cada clasificador mezcla 0,6·red + 0,4·kNN (k=10) en su espacio de 768 dimensiones, y cada codificador dual mezcla 0,85·red + 0,15·kNN (k=5) en 256 dimensiones. La puntuación final es `log(0.6·s_classifiers + 0.4·s_dual) + 0.25·log p_L3`.

## Capacidades

- Predicción de un número EC por reacción SMILES, con salidas jerárquicas en los niveles L4, L3, L2 y L1.
- Normalización química automática de moléculas (neutralización, eliminación de estereoquímica, descarte de protones).
- Cálculo de descriptores direccionales de reacción (Morgan, DRFP, pares de átomos) que distinguen sustratos ganados, perdidos y conservados.
- Búsqueda por vecinos más cercanos (kNN) en espacios de embedding aprendidos como componente del ensemble.
- Inferencia exclusivamente en CPU.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo generativo.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Anotación automatizada de enzimas en bases de datos de reacciones: el sistema predice el número EC de cada reacción SMILES en un fichero Parquet y genera un JSONL, adecuado para pipelines de curación masiva sin GPU.
- Enriquecimiento de datasets bioquímicos: dado un conjunto de reacciones sin etiquetar, se obtienen predicciones jerárquicas L1-L4 que permiten filtrar y priorizar revisiones manuales por subclase enzimática.
- Pre-filtrado en descubrimiento de fármacos: la predicción de clase enzimática ayuda a identificar reacciones candidatas compatibles con una vía metabólica antes de validación experimental.
- Investigación en representaciones químicas: el ensemble sirve como referencia reproducible para comparar descriptores (Morgan, DRFP, pares de átomos) en tareas de recuperación de enzimas bajo particiones leak-curbed.
- Despliegue en entornos con recursos limitados: con inferencia en CPU, 2 hilos y unos 2,4 GB de pesos residentes, puede ejecutarse en servidores sin GPU o en contenedores modestos.
- Evaluación de competiciones y leaderboards: el código de reproducción (`train.py`, `train_dual.py`, `drfp_feats.py`) permite regenerar el ensemble y verificar métricas sobre particiones de validación.
- Clasificación por lotes de colecciones de reacciones: procesar 4.849 entradas de validación en unos 7 minutos en 2 hilos da una idea del throughput para tareas de anotación a media escala.

## Benchmarks y rendimiento

Métricas de validación local sobre el holdout que imita la partición leak-curbed (una miembro por grupo de clasificadores):

| Modelo | L4 | L3 | L2 | L1 |
|---|---|---|---|---|
| Morgan classifier (receta v3) | 0,565 | 0,805 | 0,848 | 0,904 |
| Morgan+DRFP classifier + término L3 | 0,571 | 0,820 | 0,862 | 0,905 |
| Dual encoder | 0,558 | 0,805 | 0,844 | 0,893 |
| v4 blend (Morgan + DRFP, 2 duales) | 0,587 | 0,823 | 0,863 | 0,911 |
| Atom-pair classifier solo | 0,551 | 0,797 | 0,838 | 0,891 |
| **v5 blend** (+ atom-pair, 4 duales) | **0,596** | **0,824** | **0,861** | **0,909** |

En el leaderboard público, la versión v4 obtuvo L4 = 0,603. No se han publicado resultados de benchmarks de v5 en el leaderboard en la información disponible.

## Requisitos de hardware

- Inferencia exclusivamente en CPU; no se requiere GPU.
- Memoria residente de pesos en torno a 2,4 GB (los índices kNN se mantienen en float16).
- Tamaño del repositorio: 1,8 GB.
- Throughput de referencia: 4.849 entradas de validación en aproximadamente 7 minutos usando 2 hilos.
- Dependencias de inferencia: numpy, pandas, pyarrow, RDKit (versión fijada a la del entrenamiento) y drfp.
- Entrenamiento viable en CPU con PyTorch.
- Opciones de despliegue: ejecución directa mediante `python /app/predict.py --input INPUT.parquet --output OUTPUT.jsonl`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Niveles EC | Licencia | Inferencia |
|---|---|---|---|---|---|
| enzyme-retrieval-v5 | Ensemble de MLP + codificadores duales | Morgan + DRFP + pares de átomos | L1-L4 | CC BY 4.0 | CPU |
| Entrada de leaderboard de poketwouser (referencia metodológica citada) | Codificadores duales con redes de grafos | No disponible | No disponible | No disponible | No disponible |
| Alternativas de clasificación EC con GNN | No disponible en la información proporcionada | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos suficientes en la información proporcionada para comparar parámetros, contexto o rendimiento con alternativas concretas; la única referencia citada es la entrada de leaderboard de poketwouser, cuyo método de codificador dual se reimplementó de forma independiente y sin sus redes de grafos.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no admite instrucciones en lenguaje natural.
- Predice un único número EC por reacción; no produce distribuciones calibradas más allá de las puntuaciones internas del ensemble.
- El rendimiento cae notablemente en el nivel más específico (L4 ≈ 0,596 en validación local), por lo que las predicciones de subclase concreta deben tratarse con cautela.
- La validación es local y diseñada por el propio autor para imitar la partición leak-curbed; no equivale a una evaluación independiente.
- La normalización química (neutralización y eliminación de estereoquímica) altera la representación de las moléculas, lo que puede degradar casos donde la carga o la estereoquímica sean informativas.
- Solo se usó la partición pública de entrenamiento; el vocabulario EC proviene de ExPASy ENZYME release 02-Sep-2026.
- La licencia CC BY 4.0 permite uso comercial con atribución, pero debe verificarse el cumplimiento de las licencias de las dependencias (RDKit, drfp con licencia MIT, datos ExPASy con CC BY 4.0).
- No hay información publicada sobre sesgos, cobertura idiomática ni robustez fuera de la distribución de entrenamiento.
- El repositorio no registra descargas ni likes, y la fecha de creación indicada (2026-11-02) es posterior a la release de ExPASy citada; conviene verificar la vigencia y procedencia de los artefactos antes de usarlos en producción.

## Enlaces

- Hugging Face: https://huggingface.co/rishithakanugula26/enzyme-retrieval-v5
- Referencia metodológica citada (entrada de leaderboard de poketwouser): no disponible como URL en la información proporcionada
- DRFP (Probst et al., 2022, licencia MIT): no disponible como URL en la información proporcionada
- ExPASy ENZYME release 02-Sep-2026 (SIB, CC BY 4.0): no disponible como URL en la información proporcionada
