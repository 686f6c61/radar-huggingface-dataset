# Ronyy33/leak-curber-ec-kmer-knn

## Resumen

Leak CURBER EC k-mer kNN es un modelo de clasificación de enzimas presentado como envío a la tarea de clasificación EC del reto Leak CURBER. Su objetivo es predecir el número EC (Enzyme Commission) de una enzima a partir de su secuencia de aminoácidos. No se trata de un modelo de lenguaje ni de una red neuronal profunda: es un clasificador basado en similitud de k-mers con transferencia de etiqueta por vecino más cercano.

El método transforma cada secuencia en un vector de recuentos de 3-mers solapados (20 residuos estándar más un símbolo "other", lo que da 9.261 características), aplica ponderación TF-IDF sublineal con IDF ajustado sobre el split de entrenamiento y normalización L2. Para cada consulta se busca la secuencia de entrenamiento única más similar por similitud coseno y se transfiere su número EC.

El modelo es relevante en el contexto del reto Leak CURBER como línea base reproducible y ligera: funciona solo en CPU, sin red, con un consumo de memoria inferior a 2 GB y un tiempo de inferencia de unos 4 minutos para 11.367 entradas únicas de validación en 2 vCPU. Su valor está en la simplicidad, la ausencia de fuga de datos y la facilidad de auditoría, más que en el rendimiento absoluto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificador por similitud de k-mers (3-mers) con TF-IDF sublineal, normalizacion L2 y vecino mas cercano por similitud coseno |
| Parametros totales | no disponible (no es un modelo neuronal; el indice almacena recuentos de 3-mers, IDF y etiquetas) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada: secuencia de aminoacidos completa, sin ventana de contexto) |
| Tipos de cuantizacion | no aplica (no hay pesos neuronales; el indice se guarda en `weights/kmer_index.npz`) |
| Idiomas soportados | no aplica (entrada biologica: secuencias de aminoacidos) |
| Licencia | no disponible |
| Formato de pesos | `.npz` (NumPy) para el indice de k-mers, IDF y etiquetas; `.json` para el vocabulario EC y el mapeo de etiquetas |

## Arquitectura y entrenamiento

La arquitectura no es un transformer ni un modelo neuronal. Es un pipeline clásico de procesamiento de señales biológicas: featurización por recuento de 3-mers solapados sobre un alfabeto de 21 símbolos (20 aminoácidos estándar más "other"), ponderación TF-IDF sublineal con IDF ajustado en el split de entrenamiento, normalización L2 y clasificación por vecino más cercano mediante similitud coseno. Si una secuencia de entrenamiento tiene varios EC asignados, se transfiere el más frecuente del split de entrenamiento.

El entrenamiento se limita a construir el índice a partir de `train.parquet` (el split público de entrenamiento); no se usaron etiquetas de validación, datos de test ni datos externos. El script `train.py` reconstruye `weights/` desde `train.parquet`. Como mecanismos de seguridad, las entradas sin ningún 3-mer en común, o las que queden pendientes si la ejecución se acerca a un presupuesto de 10 minutos, reciben el EC más frecuente del entrenamiento (la línea base del starter). El vocabulario EC proviene de ExPASy ENZYME, release 02-Sep-2026 (SIB, CC BY 4.0).

## Capacidades

- Predicción del número EC de una enzima a partir de su secuencia de aminoácidos.
- Featurización mediante recuento de 3-mers solapados (9.261 características).
- Ponderación TF-IDF sublineal con IDF ajustado en entrenamiento y normalización L2.
- Búsqueda del vecino más cercano por similitud coseno sobre secuencias únicas de entrenamiento.
- Transferencia de etiqueta EC con resolución de ambigüedad por frecuencia en el split de entrenamiento.
- Fallback a la clase mayoritaria ante entradas sin 3-mers compartidos o ante agotamiento del presupuesto de tiempo.
- Ejecución solo en CPU, sin red, con menos de 2 GB de RAM en pico.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües.

## Casos de uso

- Anotación preliminar de enzimas en pipelines de metagenómica: dado un conjunto de secuencias proteicas sin anotar, el modelo asigna un EC probable en minutos y solo en CPU, lo que permite priorizar qué secuencias requieren validación experimental o búsqueda en bases de datos curadas.
- Línea base reproducible en retos de clasificación enzimática: sirve como referencia mínima contra la que comparar modelos más complejos (transformers proteicos, embeddings ESM), con un coste computacional despreciable.
- Filtrado rápido en entornos con recursos limitados: al ejecutarse en 2 vCPU con menos de 2 GB de RAM, encaja en contenedores pequeños, máquinas de desarrollo o nodos sin GPU.
- Enseñanza y auditoría de metodología: el pipeline completo (featurización, TF-IDF, kNN, fallback) es transparente y auditable, útil para explicar cómo se construye un clasificador biológico sin fuga de datos.
- Preetiquetado en herramientas de curaduría: las predicciones pueden usarse como sugerencia inicial para anotadores humanos que revisan números EC en bases de datos enzimáticas.
- Prototipado de clasificadores por similitud para otras taxonomías biológicas: el enfoque de k-mers con TF-IDF y vecino más cercano es adaptable a tareas de asignación de etiquetas sobre secuencias cortas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo es solo CPU y no requiere GPU.
- GPU recomendadas: ninguna; no se usa aceleración por GPU.
- ¿Cabe en consumer GPU?: no aplica; no hay pesos neuronales que cargar.
- Memoria RAM: menos de 2 GB en pico durante la inferencia.
- CPU: probado en 2 vCPU; 11.367 entradas únicas de validación en aproximadamente 4 minutos.
- Opciones de despliegue: ejecución directa con `python /app/predict.py --input INPUT --output OUTPUT`; reconstrucción del índice con `python train.py --train train.parquet --output weights`. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: aproximadamente 4 minutos para 11.367 entradas únicas en 2 vCPU (del orden de decenas de entradas por segundo); no se proporcionan cifras más precisas.
- Restricciones de ejecución: solo CPU, sin red; presupuesto de seguridad de 10 minutos tras el cual las entradas pendientes reciben la clase mayoritaria.

## Comparativa con modelos similares

| Modelo | Enfoque | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Leak CURBER EC k-mer kNN | k-mers 3-mer + TF-IDF + kNN coseno | no aplica (indice de recuentos) | no aplica | no disponible | Hugging Face |
| Modelos de lenguaje proteico tipo ESM | Transformer sobre secuencias de aminoacidos | no disponible | no disponible | no disponible | no disponible |
| Clasificadores EC basados en BLAST / alineamiento | Similitud por alineamiento de secuencias | no aplica | no aplica | no disponible | no disponible |

No se dispone de datos de rendimiento de alternativas en la informacion proporcionada, por lo que la comparacion cuantitativa no esta disponible.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no soporta instrucciones en lenguaje natural.
- Dependencia crítica de la similitud de 3-mers: secuencias sin 3-mers compartidos con el entrenamiento reciben la clase mayoritaria, lo que puede producir predicciones poco informativas.
- Resolución de ambigüedad por frecuencia: cuando una secuencia de entrenamiento tiene varios EC, se transfiere el más frecuente, lo que puede ocultar anotaciones minoritarias.
- Presupuesto de tiempo: si la ejecución se acerca a los 10 minutos, las entradas restantes reciben la clase mayoritaria, degradando la calidad de forma no determinista según la carga.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; conviene contactar con el autor antes de usarlo en producción.
- Idiomas y contexto no aplican, pero la cobertura taxonómica y de familias enzimáticas depende exclusivamente del split público `train.parquet`; no se usaron datos externos.
- Riesgo de sobreajuste al split de entrenamiento y de sesgo hacia las clases EC más frecuentes en ese split.
- No se han publicado benchmarks, por lo que no hay evidencia cuantitativa de su precisión frente a alternativas.
- El vocabulario EC procede de ExPASy ENZYME release 02-Sep-2026 (SIB, CC BY 4.0); su licencia es independiente de la del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ronyy33/leak-curber-ec-kmer-knn
- ExPASy ENZYME (vocabulario EC, release 02-Sep-2026, SIB, CC BY 4.0): no se proporciona URL en la informacion disponible
- Repositorio o paper del reto Leak CURBER: no disponible
- Demo o espacio asociado: no disponible
