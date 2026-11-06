# AbhijeetKumar2125/EnzymeRanker-X

## Resumen

EnzymeRanker-X es un sistema de clasificación enzimática basado en similitud de secuencias que predice números EC (Enzyme Commission) a partir de secuencias de aminoácidos de proteínas. Lo desarrolla el usuario AbhijeetKumar2125 y se publica bajo licencia MIT. No es un modelo neuronal: no contiene pesos entrenados de una red, sino que emplea MMseqs2 como motor de búsqueda de similitud contra una base de datos de referencia construida a partir del conjunto de entrenamiento, y asigna la anotación EC de la secuencia de referencia con mejor coincidencia.

El sistema resuelve el problema de anotar funcionalmente proteínas con un enfoque de recuperación (retrieval) en lugar de aprendizaje supervisado clásico: agrupa las secuencias de entrenamiento por identidad exacta, almacena sus anotaciones EC y, en inferencia, busca la mejor coincidencia para cada consulta. Para secuencias sin coincidencia en la base de datos aplica una predicción de reserva basada en la frecuencia global de etiquetas.

Es relevante en el contexto de competiciones de bioinformática y pipelines de anotación a gran escala, donde un método de recuperación determinista y sin red neuronal puede ofrecer tiempos de ejecución predecibles y resultados reproducibles. El repositorio ocupa 1,6 GB, principalmente por los ficheros de la base de datos MMseqs2, y se distribuye con Dockerfile y scripts de entrenamiento e inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema de recuperación por similitud de secuencias (MMseqs2) con asignación de EC por mejor coincidencia y reserva por frecuencia global; no es un transformer ni una red neuronal |
| Parametros totales | no disponible (no aplica; no hay pesos de modelo neuronal) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (opera sobre secuencias de proteínas completas, sin ventana de contexto definida) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible (entrada: secuencias de aminoácidos) |
| Licencia | MIT |
| Formato de pesos | Base de datos MMseqs2 (`targetDB*`) y ficheros JSON de anotaciones (`annotations.json`, `ec_vocabulary.json`, `label_counts.json`, `model_metadata.json`); no hay safetensors ni GGUF |

## Arquitectura y entrenamiento

El pipeline de predicción consta de tres etapas. Primero, la construcción de la base de referencia: las secuencias de entrenamiento se agrupan por identidad de secuencia exacta y se almacenan junto con sus anotaciones EC asociadas. Segundo, la recuperación: cada secuencia de consulta se busca contra la base de referencia mediante MMseqs2. Tercero, la predicción: se selecciona la secuencia de referencia con mejor coincidencia y se asigna un único número EC a la consulta. Si no hay coincidencia, se recurre a una predicción de reserva basada en la frecuencia global de etiquetas.

El "entrenamiento" se realiza con `train_submission.py`, que toma un fichero Parquet de entrenamiento y genera el directorio `assets/` con la base de datos MMseqs2, los mapeos de anotaciones EC, el vocabulario de EC y los metadatos de frecuencia de etiquetas. No se documenta el número de tokens ni la composición del dataset, ni procesos de RLHF/DPO, ni innovaciones como decodificación especulativa o atención lineal, ya que no se trata de un modelo generativo.

## Capacidades

- Predicción de números EC (Enzyme Commission) a partir de secuencias de aminoácidos, con una única etiqueta EC por secuencia.
- Búsqueda de similitud de secuencias mediante MMseqs2 contra una base de datos de referencia empaquetada.
- Deduplicación de secuencias de entrada: conserva el primer identificador para cada secuencia duplicada exacta y produce una predicción por secuencia única.
- Predicción de reserva por frecuencia global para secuencias sin coincidencia en la base de datos.
- Inferencia sin acceso a red: todo el pipeline funciona con la base de datos empaquetada.
- Entrada en Parquet con columnas `id` y `sequence`; salida en JSONL con `id` y lista de predicción.
- No soporta tool calling, function calling, agentes, multi-step reasoning, visión, audio ni capacidades multilingües en el sentido de modelos de lenguaje.

## Casos de uso

- Anotación funcional masiva de proteínas: dado un conjunto de secuencias en Parquet, el sistema devuelve un número EC por secuencia única, lo que permite clasificar enzimas a escala en pipelines de bioinformática sin depender de un modelo neuronal.
- Competiciones de bioinformática: el repositorio incluye `train_submission.py` y un Dockerfile pensado para el entorno Linux x86-64 de la competición, con inferencia sin red y límites de CPU y memoria, lo que facilita la reproducibilidad de la entrega.
- Preetiquetado de datasets de enzimas: las predicciones EC pueden usarse como anotaciones preliminares que luego se revisan manualmente, aprovechando la velocidad de la búsqueda por similitud.
- Filtrado de candidatos en cribado enzimático: para un conjunto de secuencias candidatas, el sistema asigna EC y permite agrupar por familia funcional antes de experimentos de laboratorio.
- Entornos aislados y reproducibles: el contenedor Docker con `--network none` y la base de datos empaquetada permiten ejecutar la clasificación en servidores sin conectividad, útil en infraestructuras con restricciones de seguridad.
- Deduplicación y consolidación de secuencias: el pipeline retiene una predicción por secuencia única, lo que simplifica el procesamiento de datasets con secuencias repetidas.
- Docencia y prototipado en bioinformática: el flujo completo (construcción de base de datos, Docker, inferencia) sirve como ejemplo de sistema de recuperación para clasificación de proteínas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no hay modelo neuronal ni pesos en GPU).
- CPU: el ejemplo de ejecución del Dockerfile usa `--cpus 2` y `--memory 16g`; la construcción de la base de datos usa `--threads 4` por defecto en el ejemplo.
- GPU recomendadas: no aplica; el sistema se ejecuta en CPU.
- Cabe en hardware de consumo: sí, siempre que se disponga de aproximadamente 16 GB de memoria RAM para el contenedor, según el ejemplo de la model card.
- Almacenamiento: el repositorio ocupa 1,6 GB, principalmente por los ficheros de la base de datos MMseqs2; se requiere Git LFS para descargarlos.
- Opciones de despliegue: Docker (imagen construida con `--platform linux/amd64`), scripts `predict.py` y `train_submission.py` con Python 3.11 y MMseqs2 instalado.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Sistema | Tipo | Entrada | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EnzymeRanker-X | Recuperación por similitud (MMseqs2) | Secuencia de aminoácidos | Número EC (top-1) | MIT | Hugging Face, 1,6 GB |
| Modelos neuronales de predicción de EC (p. ej. CLEAN, DeepEC) | Redes neuronales / embeddings | Secuencia de aminoácidos | Números EC (a menudo multi-etiqueta) | no disponible | no disponible |
| BLAST + anotación por transferencia | Búsqueda de similitud | Secuencia de aminoácidos | Anotación transferida | no disponible | Herramienta estándar |

No se dispone de datos de rendimiento de EnzymeRanker-X que permitan una comparación cuantitativa con alternativas; la comparativa anterior es cualitativa y basada en el tipo de método.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni una red neuronal: no genera texto, no razona y no soporta tool calling ni agentes.
- La predicción depende de la cobertura de la base de datos de referencia; secuencias sin coincidencia reciben una predicción de reserva por frecuencia global, que puede ser poco específica.
- Asigna una única etiqueta EC por secuencia (top-1), por lo que no captura enzimas con múltiples actividades o ambigüedad de anotación.
- No se documentan sesgos conocidos, riesgos de alucinación ni limitaciones idiomáticas, ya que la entrada son secuencias de proteínas.
- La licencia MIT permite uso comercial, pero no se especifican garantías ni condiciones adicionales sobre los datos de entrenamiento subyacentes.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (31 de octubre de 2026), lo que indica que no hay validación externa ni comunidad de usuarios.
- El tamaño de 1,6 GB y la dependencia de Git LFS y Docker pueden complicar el despliegue en entornos con poco almacenamiento.
- No se han publicado benchmarks, por lo que no hay evidencia cuantitativa de su precisión frente a alternativas.

## Enlaces

- Hugging Face: https://huggingface.co/AbhijeetKumar2125/EnzymeRanker-X
