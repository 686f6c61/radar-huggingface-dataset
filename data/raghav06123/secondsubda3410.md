# Raghav06123/SecondsubDA3410

## Resumen

SecondsubDA3410 es un modelo de clasificación de enzimas por número EC (Enzyme Commission) desarrollado por el usuario Raghav06123 y publicado en Hugging Face bajo licencia MIT. No es un modelo de lenguaje: se trata de una red neuronal de atención sobre grafos (graph attention network) que predice un número EC por proteína a partir de la vecindad de homología de la proteína consultada. La recuperación de vecinos la realiza un pipeline clásico de búsqueda por k-mers y alineamiento local Smith-Waterman, mientras que la red neuronal se encarga de agregar la evidencia y emitir la predicción final.

El modelo se enmarca en la tarea de anotación funcional automática de proteínas, un problema central en bioinformática donde la brecha entre secuencias depositadas y funciones anotadas crece de forma sostenida. La propuesta es relevante porque combina recuperación por homología con un mecanismo aprendido de ponderación de vecinos, en lugar de depender únicamente de votos heurísticos o de embeddings de proteínas de mayor coste computacional.

El tamaño del repositorio es de 0.0 GB y los pesos de la red se exportan a NumPy (`gnn.npz`, 1.1 MB, aproximadamente 280 000 parámetros). No se dispone de información sobre idiomas soportados ni sobre pipeline de Hugging Face, ya que la model card no los declara.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Graph attention network sobre vecindad de homologia (MLP 11→128→128 + 2 capas transformer de 4 cabezas, pre-norm) |
| Parametros totales | ~280 000 (pesos exportados en `gnn.npz`, 1.1 MB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; el grafo de entrada usa la consulta y sus 20 mejores aciertos |
| Tipos de cuantizacion | no disponible (forward pass en NumPy, sin cuantizacion declarada) |
| Idiomas soportados | no disponible (modelo de proteínas, no de lenguaje) |
| Licencia | MIT |
| Formato de pesos | `gnn.npz` (NumPy); pipeline auxiliar en Python (`predict.py`, `gnn.py`, `kmer.py`) |

## Arquitectura y entrenamiento

El pipeline tiene dos etapas. La primera es de recuperación y construye el grafo: se realiza una búsqueda TF-IDF de k-mers sobre 186 000 enzimas únicas de entrenamiento (top 1000 por 5-mers y top 300 por 4-mers) y después un alineamiento local Smith-Waterman con matriz BLOSUM62 y penalizaciones gap 11/1 mediante `pyopal`. La consulta y sus 20 mejores aciertos forman el grafo de entrada. La segunda etapa es la red neuronal (`gnn.py`): cada vecino es un nodo con 11 características, de las cuales 7 son de alineamiento (score normalizado por el self-score de la consulta, score normalizado por el self-score del vecino, logaritmo del cociente score/best, rango, logaritmo del cociente de longitudes, best score sobre self-score de la consulta y log(1+score)) y 4 son de acuerdo (proporción de la vecindad que comparte el EC del vecino en los niveles 1, 2, 3 y 4). Las características pasan por un MLP 11→128→128 y por dos capas transformer con 4 cabezas y pre-norm que intercambian mensajes entre todos los vecinos; una cabeza de salida produce un peso por vecino, con un término residual `alpha * log(score/best)` donde alpha es aprendido. La predicción es el EC con mayor peso softmax total.

El entrenamiento genera, para cada enzima de entrenamiento, un grafo con sus 60 mejores vecinos Smith-Waterman entre las demás enzimas de entrenamiento. Para imitar las condiciones de test (las enzimas de validación son lejanas: mediana del mejor alineamiento de 0.38 del self-score, frente a 0.92 dentro de entrenamiento), cada ejemplo oculta los vecinos más cercanos que un umbral muestreado de la distribución de validación y conserva los 20 mejores restantes. La pérdida es el logaritmo negativo del peso softmax sobre los vecinos que portan un EC verdadero, con AdamW, learning rate 1e-3 y 5 épocas en PyTorch. El término residual arranca la red en un voto de similitud ajustado manualmente, de modo que el entrenamiento aprende correcciones sobre esa base.

## Capacidades

- Clasificación de proteínas en números EC hasta el nivel 4 (L1, L2, L3, L4).
- Predicción basada en vecindad de homología mediante grafo de alineamientos locales.
- Integración de evidencia de múltiples vecinos vía atención entre nodos, en lugar de voto mayoritario simple.
- Búsqueda de vecinos por k-mers (5-mers y 4-mers) y alineamiento Smith-Waterman con BLOSUM62.
- Fallback para consultas no alineadas en 480 s: predicción por vecino más cercano con 5-mers, manteniendo el tiempo total de ejecución bajo 10 minutos.
- Ejecución en CPU: 11 367 entradas de validación en 357 s, con 4.1 GB de RAM y 2 vCPU.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües; no es un modelo generativo de lenguaje.

## Casos de uso

- Anotación funcional a gran escala de proteomas: procesar lotes de decenas de miles de secuencias en CPU (11 367 entradas en 357 s con 2 vCPU) para asignar números EC preliminares antes de revisión manual.
- Priorización en pipelines de metagenómica: clasificar proteínas predichas de ensamblajes metagenómicos donde la homología con bases curadas es débil, aprovechando el entrenamiento con umbrales que imitan distancia de validación.
- Enriquecimiento de bases de datos internas: asignar EC a secuencias sin anotar de un repositorio corporativo o académico, usando `db.parquet` como referencia y regenerándolo con `train.py` a partir de datos propios.
- Filtrado previo a experimentación: descartar o priorizar candidatos enzimáticos en cribados, usando los niveles L1-L4 como granularidad de confianza.
- Docencia y validación de pipelines: comparar el voto heurístico ajustado (v2) frente a la red de grafos en un mismo conjunto, ya que la model card reporta ambos resultados sobre 4 915 enzimas distantes.
- Despliegue en entornos con recursos limitados: inferencia en 2 vCPU y 4.1 GB de RAM, sin GPU, adecuada para clústeres pequeños o servicios en contenedor.
- Investigación en métodos híbridos retrieval + GNN: servir como línea base reproducible (código y pesos incluidos) para comparar con embeddings de proteínas como ESM2.

## Benchmarks y rendimiento

Validación local sobre 4 915 enzimas de entrenamiento distantes, ponderadas para coincidir con la distribución de validación:

| Metrica | Voto ajustado (v2) | Red de grafos |
|---|---|---|
| L1 | 0.947 | 0.951 |
| L2 | 0.917 | 0.920 |
| L3 | 0.903 | 0.906 |
| L4 | 0.749 | 0.749 |

Leaderboard (validación pública): voto v2 con L4 de 0.773. Alternativas probadas: embeddings ESM2-8M (demasiado lentos en 2 CPU: ~76 min para la validación) y un clasificador de bolsa de embeddings de k-mers (L4 de 0.53 en local). No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a esta tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; la inferencia se ejecuta en CPU con NumPy.
- RAM: 4.1 GB medidos en la ejecución de referencia con 2 vCPU.
- GPU recomendadas: no disponibles ni necesarias; el autor reporta ejecución en CPU.
- Cabe en hardware de consumo: sí, en cualquier equipo con al menos ~4-5 GB de RAM libre y 2 núcleos; no requiere GPU.
- Opciones de despliegue: ejecución directa con `predict.py` (Python, PyTorch solo para entrenamiento, NumPy para el forward pass); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: 11 367 entradas en 357 s (red de grafos: 9 s), con corte de 480 s por consulta no alineada y fallback a 5-mers para mantener la ejecución total bajo 10 minutos.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / entrada | Rendimiento reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| SecondsubDA3410 | GNN sobre grafo de homologia | ~280k | Consulta + 20 vecinos | L4 0.749 local; 0.773 leaderboard (voto v2) | MIT | Hugging Face |
| Voto heuristico v2 (mismo pipeline) | Regla de similitud | 0 | Consulta + vecinos | L4 0.749 local; 0.773 leaderboard | MIT (incluido) | Incluido en el repo |
| Clasificador bolsa de k-mers | Clasificador de embeddings | no disponible | k-mers | L4 0.53 local | no disponible | Probado por el autor |
| ESM2-8M | Modelo de lenguaje de proteinas | 8M | Secuencia | no reportado (descartado por lentitud: ~76 min en 2 CPU) | no disponible en esta ficha | Publico |

No se dispone de comparación con otros modelos de clasificación EC en la información proporcionada.

## Limitaciones y advertencias

- El modelo depende críticamente de la etapa de recuperación: si la búsqueda por k-mers y el alineamiento Smith-Waterman no encuentran vecinos relevantes, la calidad de la predicción cae al fallback de 5-mers.
- El rendimiento en el nivel L4 (0.749 local) es notablemente inferior al de los niveles L1-L3 (0.951, 0.920, 0.906), por lo que la granularidad fina debe tratarse con cautela.
- La validación local se realizó sobre enzimas de entrenamiento distantes ponderadas, no sobre un conjunto de test independiente; el leaderboard público solo reporta el voto v2 (L4 0.773), no la red de grafos.
- Riesgo de sesgo hacia las familias enzimáticas sobrerrepresentadas en las 186 000 enzimas de entrenamiento; no se documenta análisis de sesgo ni cobertura taxonómica.
- No es un modelo de lenguaje: no genera texto, no razona, no soporta agentes ni tool calling; cualquier uso fuera de clasificación EC no está soportado.
- Sin información sobre idiomas, sesgos lingüísticos ni alucinación en el sentido de modelos generativos; el equivalente aquí es la asignación de un EC incorrecto con alta confianza.
- Licencia MIT permite uso comercial y modificación, pero no se ofrece garantía alguna sobre la idoneidad clínica, industrial o regulatoria de las predicciones.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación por terceros.
- La fecha de creación indicada (2026-11-01) es futura respecto a la información habitual de Hugging Face; conviene verificar la integridad del repositorio antes de usarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Raghav06123/SecondsubDA3410
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
