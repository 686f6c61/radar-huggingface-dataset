# Danish-777/kcat-km-v8

## Resumen

kcat-km-v8 es un modelo predictivo de parámetros cinéticos enzimáticos desarrollado por el usuario Danish-777 y publicado en Hugging Face. No se trata de un modelo de lenguaje generativo, sino de un pipeline de regresión que estima log10(kcat) y log10(Km) a partir de la secuencia de una enzima y el SMILES de un sustrato. Combina varios submodelos: XGBoost sobre características enzimáticas artesanales, XGBoost sobre embeddings de ESM-2 de 35M y 150M parámetros, y una pequeña red neuronal (MLP) sobre el embedding de 35M, todo fusionado mediante promedio de rangos con una guarda temporal.

El modelo está orientado a tareas de ingeniería de proteínas y biocatálisis, donde predecir la constante catalítica (kcat) y la constante de Michaelis (Km) es clave para el diseño de enzimas y la optimización de rutas metabólicas. La relevancia actual radica en que integra datos públicos de CatPred-DB (Boorla y Maranas, Nature Communications 2025), derivados de BRENDA y SABIO-RK, ampliando el conjunto de entrenamiento más allá del train.parquet original de la tarea.

El repositorio ocupa 0.7 GB, se distribuye bajo licencia MIT y está diseñado para ejecutarse únicamente en CPU. No se han publicado datos sobre arquitectura de lenguaje, longitud de contexto ni idiomas, ya que no es un modelo de ese tipo. La información disponible sobre benchmarks, latencia y requisitos de hardware es muy limitada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Ensemble de XGBoost (características artesanales, embeddings ESM-2 35M y 150M) + MLP sobre embedding 35M, fusión por promedio de rangos |
| Parámetros totales | No disponible (el componente ESM-2 150M aporta ~150M; el resto son modelos tabulares y una MLP pequeña) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de regresión, no de lenguaje) |
| Tipos de cuantización | No disponible (pesos en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | No disponible (no es un modelo lingüístico) |
| Licencia | MIT |
| Formato de pesos | safetensors (tamaño del repo: 0.7 GB) |

## Arquitectura y entrenamiento

El modelo es un ensemble heterogéneo. Por un lado, un XGBoost entrenado sobre características enzimáticas artesanales (denotadas como D en la model card). Por otro, dos XGBoost entrenados sobre embeddings de ESM-2 de 35M y 150M parámetros, usando los primeros 256 residuos de la secuencia; para el modelo de 150M se entrenan dos variantes con profundidades 7 y 8. Además, una pequeña red neuronal se entrena sobre el embedding de 35M. Las predicciones de todos los componentes se combinan promediando rangos, con una guarda temporal para evitar fugas de información.

El entrenamiento utiliza el train.parquet de la tarea más CatPred-DB (Boorla y Maranas, Nature Communications 2025), una colección pública de kcat/Km proveniente de BRENDA y SABIO-RK. Se aplicaron filtros de similitud: se eliminaron filas de CatPred cuya enzima tuviera al menos 90% de identidad con una enzima de validación, y se descartaron pares ya presentes en train.parquet. La validación se realizó mediante validación cruzada de 5 folds agrupada por familias enzimáticas (clústeres MMseqs2 al 40% de identidad), excluyendo de cada fold las filas externas relacionadas (≥40% de identidad) con las familias retenidas. No se documentan innovaciones como decodificación especulativa ni atención lineal, al no ser un modelo generativo.

## Capacidades

- Predicción de log10(kcat) a partir de secuencia de enzima y SMILES de sustrato.
- Predicción de log10(Km) en el mismo escenario.
- Ejecución exclusiva en CPU, sin necesidad de GPU.
- Integración de características artesanales, embeddings proteicos ESM-2 y modelos de boosting.
- Fusión de múltiples predictores mediante promedio de rangos.
- Entrenamiento con datos públicos adicionales (CatPred-DB) para mejorar la cobertura.
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingües.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Ingeniería de enzimas: estimar kcat y Km de variantes diseñadas antes de expresarlas y caracterizarlas en laboratorio, priorizando candidatos con mejor actividad catalítica o afinidad.
- Optimización de rutas metabólicas: predecir parámetros cinéticos de enzimas candidatas para modelos cinéticos a escala de red, reduciendo la dependencia de datos experimentales.
- Anotación funcional de genomas: asignar parámetros cinéticos aproximados a enzimas anotadas en nuevos genomas, facilitando la reconstrucción de modelos metabólicos.
- Filtrado en cribados virtuales: descartar pares enzima-sustrato con Km desfavorable antes de ensayos experimentales costosos.
- Docencia e investigación en biocatálisis: disponer de un predictor reproducible en CPU para experimentos docentes o estudios preliminares sin infraestructura GPU.
- Integración en pipelines bioinformáticos: ejecutar `predict.py` sobre ficheros parquet de entrada y generar CSV de predicciones en entornos de CI o servidores sin aceleradores.
- Análisis de sensibilidad de sustratos: comparar predicciones para distintos SMILES sobre una misma enzima y orientar la selección de sustratos en biotransformaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Inferencia exclusivamente en CPU (así lo indica la model card).
- VRAM estimada: no aplica; no requiere GPU.
- GPU recomendadas: no aplica.
- Cabe en cualquier equipo consumer: el repo ocupa 0.7 GB y los componentes ESM-2 (35M y 150M) pueden ejecutarse en CPU con memoria RAM moderada.
- Opciones de despliegue: script `predict.py` con entrada parquet y salida CSV; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Datos de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|
| kcat-km-v8 | Ensemble XGBoost + MLP + ESM-2 | train.parquet + CatPred-DB | MIT | Hugging Face |
| CatPred (Boorla y Maranas, 2025) | Predictor de kcat/Km (referencia citada) | CatPred-DB (BRENDA, SABIO-RK) | No disponible en la información | Publicación científica |
| ESM-2 (Meta) | Modelo de embeddings proteicos | UniRef | No disponible en la información | Hugging Face |

No se dispone de datos comparativos de rendimiento entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de regresión específico para kcat y Km; no es un modelo de lenguaje ni un asistente conversacional.
- No se documentan sesgos, pero al entrenar con BRENDA y SABIO-RK puede heredar el sesgo de sobreexpresión de enzimas bien estudiadas (p. ej., de organismos modelo).
- Riesgo de extrapolación fuera de la distribución de entrenamiento: enzimas o sustratos poco representados pueden producir predicciones poco fiables.
- Solo se usan los primeros 256 residuos de la secuencia; enzimas largas pueden perder información relevante.
- No se especifican idiomas ni contexto, al no ser un modelo lingüístico.
- Licencia MIT permite uso comercial, pero se recomienda verificar las licencias de los datos subyacentes (BRENDA, SABIO-RK, CatPred-DB) antes de un uso productivo.
- No hay datos publicados de benchmarks, latencia ni throughput; la validación se limita a la descrita en la model card (5-fold agrupada por familias).
- El repositorio tiene 0 descargas y 1 like, lo que sugiere escasa validación externa por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Danish-777/kcat-km-v8
- CatPred-DB (Boorla y Maranas, Nature Communications 2025): no disponible en la información proporcionada.
- BRENDA: no disponible en la información proporcionada.
- SABIO-RK: no disponible en la información proporcionada.
- ESM-2 (Meta): no disponible en la información proporcionada.
