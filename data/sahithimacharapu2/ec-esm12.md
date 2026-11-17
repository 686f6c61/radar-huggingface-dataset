# sahithimacharapu2/ec-esm12

## Resumen

ESM-2 35M Enzyme EC Number Classifier es un modelo de clasificación de proteínas desarrollado por el usuario sahithimacharapu2 a partir del backbone ESM-2 de 35 millones de parámetros de Meta (facebook/esm2_t12_35M_UR50D). Su tarea es predecir el número EC (Enzyme Commission) de una enzima a partir de su secuencia de aminoácidos, con evaluación a cuatro niveles jerárquicos (L1 a L4), siendo la métrica principal la precisión en el nivel L4. El modelo se publica como un clasificador de dos capas lineales con activación GELU sobre el pooler de ESM-2, con la cabeza de clasificación entrenada y el backbone parcialmente congelado.

Se trata de un modelo especializado y de tamaño reducido (35M de parámetros en el backbone, más una cabeza de clasificación sobre un espacio oculto de 480 dimensiones) orientado a un vocabulario cerrado de 6939 números EC válidos. El repositorio incluye pesos en safetensors para el backbone, un `classifier_head.pt` con el estado de la cabeza, un vocabulario EC en JSON y un Dockerfile con un script de inferencia (`predict.py`) que opera sobre ficheros Parquet de entrada y genera JSONL de salida.

El modelo es relevante para pipelines de anotación funcional de proteínas a escala, donde se necesita un clasificador ligero, desplegable en CPU o GPU modesta y con un formato de entrada/salida bien definido. No obstante, la información publicada es escasa: no hay resultados de benchmarks, no se detalla el conjunto de entrenamiento ni el número de tokens vistos, y el repositorio no tiene descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ESM-2 (12 capas, backbone) + cabeza MLP (Dropout-Linear-GELU-Dropout-Linear) sobre pooling |
| Parametros totales | ~35M en el backbone ESM-2 35M; cabeza de clasificación sobre hidden_size 480 (total exacto no disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del tokenizador ESM-2; no especificado en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors y `classifier_head.pt`; no se documentan cuantizaciones) |
| Idiomas soportados | en (según la model card; la tarea es sobre secuencias de aminoácidos, no lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors (backbone ESM-2) + PyTorch state_dict `.pt` (cabeza de clasificación) |

## Arquitectura y entrenamiento

La arquitectura combina el backbone ESM-2 de 35M parámetros (`facebook/esm2_t12_35M_UR50D`, 12 capas, hidden_size 480) con una cabeza de clasificación definida como `Dropout(0.1) -> Linear(480, 480) -> GELU -> Dropout(0.1) -> Linear(480, num_classes)`. El backbone se carga con `add_pooling_layer=False` y se congela parcialmente: el parámetro `n_freeze=4` en la definición de `ESMClassifier` sugiere que las primeras 4 capas del encoder ESM-2 se mantienen congeladas durante el ajuste fino, mientras que el resto se entrena junto con la cabeza. El número de clases corresponde a las 6939 entradas del vocabulario EC (`ec_vocabulary.json`), con una lista de clases L4 y un `fallback_ec` en `weights/classes.json`.

No se documenta en la información disponible el volumen de datos de entrenamiento, la composición del dataset, el número de tokens vistos ni si se aplicaron técnicas de RLHF/DPO (poco habituales en clasificación de proteínas). Tampoco se especifican innovaciones técnicas como decodificación especulativa o atención lineal; el modelo es un ajuste fino estándar de ESM-2 para clasificación multietiqueta, con un umbral de probabilidad configurable (`EC_THRESH`, por defecto 0.5) para emitir predicciones adicionales más allá de la top-1.

## Capacidades

- Clasificación de enzimas a partir de secuencias de aminoácidos, prediciendo el número EC completo de 4 niveles (formato `x.x.x.x`).
- Evaluación jerárquica a niveles L1, L2, L3 y L4, con L4 como métrica principal.
- Salida multietiqueta: además de la predicción top-1, puede emitir predicciones adicionales cuyo score supere el umbral `EC_THRESH` (por defecto 0.5; valor 1.1 restringe a top-1).
- Procesamiento por lotes con tamaño de batch configurable (`EC_BATCH`, por defecto 32) y presupuesto temporal de inferencia (`EC_TIME_BUDGET`, por defecto 660 segundos).
- Entrada en formato Parquet con columnas `id` y `sequence`; salida en JSONL con `id` y lista de predicciones.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multimodales (visión, audio). Es un clasificador de secuencias biológicas, no un modelo generativo de propósito general.
- Capacidad multilingüe no aplicable: la entrada son secuencias de aminoácidos en el alfabeto proteico estándar.

## Casos de uso

- Anotación funcional masiva de proteínas: dado un proteoma o metagenoma con miles de secuencias, el modelo predice el número EC de cada enzima en lotes de 32, permitiendo enriquecer bases de datos de anotación con un coste computacional bajo gracias a sus 35M de parámetros.
- Priorización de dianas enzimáticas en pipelines de biología computacional: el clasificador filtra secuencias candidatas por clase EC (por ejemplo, hidrolasas o transferasas) antes de análisis más costosos como docking o simulación molecular.
- Enriquecimiento de anotaciones en bases de datos tipo UniProt o BRENDA: el modelo puede ejecutarse sobre entradas sin número EC asignado y generar candidatos con score de probabilidad, que luego se validan manualmente.
- Clasificación en entornos con recursos limitados: al caber en CPU y en GPUs de consumo, puede desplegarse en servidores modestos o incluso en estaciones de trabajo sin GPU dedicada, usando el Dockerfile incluido.
- Integración en pipelines de CI/CD bioinformáticos: el formato Parquet de entrada y JSONL de salida, junto con las variables de entorno `EC_BATCH`, `EC_THRESH` y `EC_TIME_BUDGET`, facilita su orquestación en flujos automatizados tipo Nextflow o Snakemake.
- Investigación en representaciones proteicas: el backbone ESM-2 35M puede reutilizarse como extractor de embeddings para otras tareas de clasificación, dado que los pesos del backbone están incluidos en safetensors y la definición de la cabeza es pública.
- Docencia y prototipado rápido: por su tamaño reducido y su licencia MIT, es adecuado para experimentos académicos de ajuste fino de ESM-2 en clasificación de proteínas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card define la métrica principal (precisión L4) y menciona la existencia de `task.json` con metadatos del benchmark, pero no incluye cifras de MMLU, HumanEval, GSM8K ni de precisión L1-L4. Tampoco se proporcionan comparaciones con otros clasificadores EC.

## Requisitos de hardware

- VRAM estimada para inferencia: el backbone ESM-2 35M en precisión completa ocupa aproximadamente 140 MB en FP32 (35M × 4 bytes), más la cabeza de clasificación (480 × 480 × 2 capas ≈ 0,5M parámetros) y el vocabulario de 6939 clases en la capa de salida (480 × 6939 ≈ 3,3M parámetros). En total, menos de 1 GB en FP32, incluyendo activaciones para batches moderados.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; una RTX 3060, RTX 4090, T4, A100 o H100 funcionarán sin problema, aunque el modelo está sobredimensionado para GPUs de gama alta.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna (GTX 1650, RTX 3050, etc.) e incluso en CPU para lotes pequeños.
- Opciones de despliegue: el repositorio incluye un Dockerfile con `predict.py` como punto de entrada; al usar `transformers` y pesos en safetensors, también puede servirse con vLLM (aunque vLLM está orientado a generación, no a clasificación), TGI (limitado para clasificación) o directamente con PyTorch. llama.cpp y Ollama no son adecuados para este tipo de modelo de clasificación.
- Latencia y throughput estimados: no disponibles en la información proporcionada. El parámetro `EC_TIME_BUDGET=660` segundos sugiere que el pipeline está diseñado para procesar un conjunto de validación completo dentro de ese presupuesto, pero no se especifica el tamaño del conjunto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sahithimacharapu2/ec-esm12 (este modelo) | ~35M backbone + cabeza | no disponible | Clasificación EC (L1-L4) | MIT | Hugging Face, 0 descargas |
| facebook/esm2_t12_35M_UR50D | 35M | ~1024 tokens (típico ESM-2) | Embeddings de proteínas (no clasificador EC) | MIT | Hugging Face, ampliamente usado |
| facebook/esm2_t33_650M_UR50D | 650M | ~1024 tokens (típico ESM-2) | Embeddings de proteínas (no clasificador EC) | MIT | Hugging Face, ampliamente usado |
| Modelos especializados en predicción EC (p. ej. CLEAN, ProteInfer) | variable | no disponible | Predicción EC | variable | Publicaciones y repositorios académicos |

La comparativa directa con otros clasificadores EC específicos no está disponible en la información proporcionada. Los ESM-2 de Meta son backbones de propósito general, no clasificadores EC, por lo que la comparación se limita al tamaño y la licencia.

## Limitaciones y advertencias

- Información de entrenamiento no documentada: se desconoce el dataset, el número de secuencias, la distribución de clases EC y si hubo balanceo, lo que impide evaluar sesgos de dominio (por ejemplo, sobrerrepresentación de enzimas bien estudiadas como las de organismos modelo).
- Riesgo de alucinación en sentido amplio: al ser un clasificador con vocabulario cerrado de 6939 clases, puede asignar números EC plausibles pero incorrectos a secuencias fuera de la distribución de entrenamiento; el umbral `EC_THRESH` mitiga parcialmente esto al permitir múltiples predicciones.
- Limitación de contexto: no se especifica la longitud máxima de secuencia soportada; ESM-2 tiene un límite típico de ~1024 tokens, insuficiente para proteínas muy largas, que requerirían truncamiento.
- Idioma: la model card declara `en`, pero la tarea es sobre secuencias de aminoácidos; no hay capacidades multilingües en lenguaje natural.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías sobre el rendimiento en producción; se recomienda validar con un conjunto propio antes de desplegar.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que sugiere que no ha sido validado por la comunidad; el Dockerfile hace referencia a `YOUR_USERNAME/enzyme-ec-esm2`, lo que indica que puede requerir ajustes antes de usarse.
- El pipeline de Hugging Face no está definido, por lo que la integración con `transformers` puede no ser directa a través de `pipeline()`; es necesario usar la clase `ESMClassifier` y `load_model()` del repositorio.
- No se documentan limitaciones específicas de sesgo demográfico (no aplica) ni de seguridad, pero al ser un modelo biológico, sus predicciones no deben usarse como única fuente en aplicaciones clínicas o biotecnológicas sin validación experimental.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sahithimacharapu2/ec-esm12
- Backbone ESM-2 35M: https://huggingface.co/facebook/esm2_t12_35M_UR50D
- Repositorio Docker referenciado en la model card: https://huggingface.co/YOUR_USERNAME/enzyme-ec-esm2 (placeholder, no resuelve)
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
