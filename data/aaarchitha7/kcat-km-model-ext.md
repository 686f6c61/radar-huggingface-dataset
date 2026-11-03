# aaarchitha7/kcat-km-model-ext

## Resumen

`aaarchitha7/kcat-km-model-ext` es un modelo de regresión molecular publicado en Hugging Face por el usuario aaarchitha7 como participación en la competición Leak CURBER, una tarea de predicción conjunta de los parámetros enzimáticos kcat (constante catalítica) y Km (constante de Michaelis-Menten). No se trata de un modelo de lenguaje ni de un transformer generativo: el repositorio contiene pesos en formato safetensors (0,2 GB) y un pipeline de inferencia diseñado para ejecutarse exclusivamente en CPU dentro de un contenedor Docker con límites estrictos de recursos (2 vCPU, 16 GB de RAM, 15 minutos).

El modelo resuelve un problema clásico de biocatálisis computacional: dado un sustrato representado como SMILES y una enzima representada como secuencia de aminoácidos, predecir los valores log10 de kcat y Km. La relevancia práctica está en la ingeniería de enzimas y el diseño de rutas metabólicas, donde estimar estos parámetros experimentalmente es caro y lento. La model card indica explícitamente que el entrenamiento utilizó datos externos de CatPred-DB, además del split público de la competición.

La información pública disponible es escasa: no se documentan arquitectura, número de parámetros, longitud de contexto ni idiomas soportados. La ficha refleja esa limitación de forma explícita en cada apartado afectado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; entrada tabular SMILES + secuencia) |
| Tipos de cuantización | no disponible (pesos safetensors; inferencia en CPU) |
| Idiomas soportados | no disponible (no aplica; entrada SMILES y secuencias proteicas) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 0,2 GB) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo. El repositorio se presenta como un "starter model" para la tarea conjunta kcat–Km, con un baseline de referencia basado en regresión ridge de dos salidas cuyas características son la longitud de la secuencia, la longitud del SMILES, las frecuencias de aminoácidos y las frecuencias de caracteres del SMILES. No se especifica si el modelo publicado mejora ese baseline con una arquitectura neuronal, un ensamblado o un modelo preentrenado ajustado.

El entrenamiento se realizó con los datos públicos de la competición (`train.parquet`, con etiquetas) más filas adicionales de CatPred-DB, según la divulgación de datos externos incluida en la model card (`external_data/EXTERNAL_DATA.md`). No se documentan el número de tokens, la composición exacta del dataset, ni si hubo etapas de ajuste fino supervisado o preferencias. La tarea se formula como regresión de dos objetivos en escala logarítmica base 10, evaluada mediante correlación de rangos de Spearman (SCC) y RMSE.

## Capacidades

- Predicción conjunta de `log10_kcat` y `log10_km` a partir de un par (SMILES de sustrato, secuencia de aminoácidos de la enzima).
- Procesamiento por lotes de ficheros Parquet con columnas `id`, `smiles` y `sequence`, generando un CSV con columnas `id,log10_kcat,log10_km`.
- Inferencia exclusivamente en CPU, sin GPU ni acceso a red, dentro de un contenedor Docker con 2 vCPU y 16 GB de RAM.
- Capacidad de sustituir el baseline ridge por cualquier modelo o librería, siempre que respete el contrato de entrada/salida y los límites del evaluador.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni generación de texto libre.
- No se documentan capacidades multilingües (no aplica al dominio).

## Casos de uso

- Priorización de enzimas candidatas en ingeniería de proteínas: dado un panel de secuencias y un sustrato objetivo, el modelo permite ordenar candidatas por kcat y Km estimados antes de validar experimentalmente, reduciendo el número de ensayos enzimáticos necesarios.
- Diseño de rutas metabólicas sintéticas: estimar los parámetros cinéticos de enzimas heterólogas para alimentar modelos cinéticos a nivel de red (por ejemplo, análisis de control metabólico) y descartar combinaciones con Km incompatible con las concentraciones intracelulares previstas.
- Anotación funcional de genomas y metagenomas: asignar valores aproximados de kcat y Km a enzimas anotadas sin caracterización experimental, útil en bases de datos como BRENDA o UniProt para enriquecer registros.
- Filtrado en pipelines de descubrimiento de fármacos: evaluar si una enzima diana o una enzima de metabolismo hepático presenta parámetros cinéticos compatibles con el perfil de exposición esperado de un compuesto.
- Docencia y benchmarking de métodos: servir como referencia funcional y reproducible (Docker, CPU-only) para comparar nuevos enfoques de predicción de parámetros enzimáticos en el marco de la competición Leak CURBER.
- Investigación en biocatálisis computacional: generar hipótesis de pares sustrato-enzima con alta kcat y baja Km para experimentos dirigidos de evolución dirigida, usando la predicción como criterio de selección de bibliotecas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card describe la métrica de evaluación (SCC medio de los dos objetivos y RMSE por objetivo) y el baseline ridge, pero no incluye puntuaciones del modelo publicado ni comparaciones numéricas con alternativas.

## Requisitos de hardware

- VRAM: no aplica; la inferencia está diseñada para ejecutarse en CPU.
- CPU: el evaluador oficial asigna 2 vCPU, 16 GB de RAM y 15 minutos para el conjunto completo de entradas.
- GPU recomendadas: ninguna; el entorno de evaluación no dispone de GPU.
- Cabe en hardware consumer: sí, cualquier equipo con 16 GB de RAM puede ejecutar el contenedor, aunque el límite de 15 minutos condiciona el tamaño del lote.
- Opciones de despliegue: Docker (obligatorio para la competición), con Python en `/usr/local/bin/python` y directorio de trabajo `/app`; comando `python /app/predict.py --input INPUT --output OUTPUT`.
- Restricciones del contenedor: imagen Linux x86-64, build en menos de 30 minutos, repositorio de 4 GiB o menos, ningún fichero de salida mayor de 16 MiB, sin red y sin entrypoints ni hooks de shell.
- Latencia y throughput: no disponibles; dependen del modelo concreto y del tamaño del conjunto de entrada.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| aaarchitha7/kcat-km-model-ext | Modelo de regresión (arquitectura no documentada) | SMILES + secuencia | log10_kcat, log10_km | MIT | Hugging Face |
| Baseline ridge de Leak CURBER | Regresión ridge de dos salidas | Longitudes, frecuencias de aminoácidos y de caracteres SMILES | log10_kcat, log10_km | No especificada | Hugging Face (starkAhmed43/leak-curber-kcat-km-starter) |
| CatPred | Modelo de predicción de parámetros cinéticos (referencia externa) | SMILES + secuencia | kcat, Km | No disponible en esta ficha | Publicación científica |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- La arquitectura, el número de parámetros y el proceso de entrenamiento no están documentados, lo que impide evaluar su robustez o reproducibilidad.
- El modelo se entrenó con datos externos de CatPred-DB además del split público; esto puede introducir solapamiento con los conjuntos de validación o test si no se aplicó un filtrado estricto, y la model card no detalla el filtrado más allá de remitir a `external_data/EXTERNAL_DATA.md`.
- Riesgo de sobreajuste a la distribución de enzimas y sustratos de CatPred-DB y del split de entrenamiento; el rendimiento fuera de esa distribución (por ejemplo, enzimas de organismos extremófilos o sustratos no naturales) no está caracterizado.
- La evaluación se limita a SCC y RMSE en escala log10; errores grandes en enzimas con kcat muy baja pueden quedar enmascarados por la métrica de rango.
- Restricciones operativas estrictas: solo CPU, 2 vCPU, 16 GB de RAM, 15 minutos, sin red y con límite de 16 MiB por fichero de salida; esto limita el tamaño de los lotes y el uso de modelos grandes.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías sobre la precisión de las predicciones; no debe usarse como sustituto de la caracterización experimental en contextos regulados.
- No se documentan sesgos de dominio, pero al ser un modelo entrenado sobre datos biológicos públicos puede heredar los sesgos de cobertura taxonómica y de sustratos de las bases de datos de origen.
- No apto para generación de texto, razonamiento, código ni tareas fuera de la predicción de kcat y Km.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aaarchitha7/kcat-km-model-ext
- Repositorio starter y baseline: https://huggingface.co/starkAhmed43/leak-curber-kcat-km-starter
- Dataset de la competición: https://huggingface.co/datasets/starkAhmed43/leak-curber-kcat-km
- Leaderboard: https://huggingface.co/spaces/starkAhmed43/leak-curber-leaderboard
- Hoja de asignación de tareas: https://docs.google.com/spreadsheets/d/12c2PaYcNDpa6bA0JPmKi6tHsdV-EdFe2IYQ70RqpGRI/edit?usp=sharing
