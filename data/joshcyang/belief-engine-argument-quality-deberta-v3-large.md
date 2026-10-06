# joshcyang/belief-engine-argument-quality-deberta-v3-large

## Resumen

El modelo `joshcyang/belief-engine-argument-quality-deberta-v3-large` es un regresor de calidad argumental en inglés desarrollado por joshcyang como componente del sistema Belief Engine. Se construye a partir de `microsoft/deberta-v3-large` y se ajusta sobre el dataset IBM Argument Quality Ranking (ibm-research/argument_quality_ranking_30k) para predecir la valoración humana de calidad (variable WA) de un argumento. El checkpoint publicado se preserva sin cambios desde diciembre de 2025.

El modelo resuelve una tarea muy concreta: recibir únicamente el texto de un argumento (sin tema, polaridad ni documentos de apoyo) y devolver una puntuación de regresión continua recortada al intervalo [0, 1], sin sigmoide ni calibración aplicada. Con 435.062.785 parámetros y un fichero de pesos de 1,74 GB, es un encoder tipo transformer de gran tamano para clasificación/regresión, no un modelo generativo.

Su relevancia actual radica en dos factores. Primero, se publica con licencia MIT y sin necesidad de cuenta para descargarlo, junto con scripts de verificación, evaluación y reentrenamiento. Segundo, se utiliza como estimador de "fuerza" de memoria dentro del framework Belief Engine, lo que lo convierte en una pieza de infraestructura para agentes que necesitan puntuar la calidad de creencias o argumentos de forma local y determinista. La documentación del autor es notablemente transparente sobre las limitaciones del entrenamiento original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder DeBERTa-v3 (atención desacoplada, preentrenamiento estilo ELECTRA) con cabeza de regresión |
| Parametros totales | 435.062.785 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128 tokens (truncado y padding fijados por el modelo; el base DeBERTa-v3-large soporta hasta 512, pero este ajuste usa 128) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no se documentan versiones GGUF, INT8 o INT4) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (1,74 GB) |

Otros datos de identificación: SHA-256 del checkpoint original `f9a073e14eb1e695afda5fd4e104b826b29d7660d35a335b9d332b970baa8f7d`; revision de release `original-2025-12-v1`; tamano del repositorio 1,7 GB; configuracion registrada con Transformers 4.57.3.

## Arquitectura y entrenamiento

La base es DeBERTa-v3-large, un encoder transformer con atención desacoplada (disentangled attention), decodificador de máscara mejorado y preentrenamiento con detección de tokens reemplazados al estilo ELECTRA. Sobre ese backbone se incorpora una cabeza de regresión que produce un valor continuo. La entrada es exclusivamente el texto del argumento, tokenizado y ajustado a 128 tokens; la salida es el valor de regresión recortado a [0, 1], sin sigmoide ni calibración. El autor advierte explícitamente que no debe sustituirse por la salida softmax/sigmoide de un pipeline genérico de text-classification.

El ajuste se realizó sobre el dataset IBM Argument Quality Ranking, con splits de 20.974 argumentos de entrenamiento, 3.208 de desarrollo y 6.315 de test, anclados al commit upstream `590726b3765b1b90c5e53a17e3b1f77d92d3aa8a`. La receta de reentrenamiento corregida que acompaña al release usa 3 épocas, batch size 8, learning rate 1e-5, 500 pasos de warmup, weight decay 0.01 y 128 tokens, con selección por dev.csv y evaluación única sobre test.csv. Sin embargo, el script original (conservado en `scripts/legacy/`) utilizaba test.csv para early stopping y selección del mejor checkpoint, por lo que las métricas históricas no constituyen una estimación sobre un holdout intacto. Se desconocen detalles del entrenamiento original como la semilla de inicialización, la revisión exacta del modelo base, el hardware empleado o el lock completo de entorno. No se documenta uso de RLHF ni DPO, dado que es un modelo de regresión, no generativo.

## Capacidades

- Puntuación de calidad argumental: asigna a un texto argumental en inglés un valor de regresión continuo en [0, 1] que estima la valoración humana de calidad (WA) del dataset IBM.
- Inferencia por lotes: la API `predict_batch` permite puntuar listas de argumentos en una sola llamada.
- Ejecución en CPU: el modelo funciona en CPU y CUDA es opcional; el entorno de referencia probado es Python 3.11, PyTorch 2.10.0 y Transformers 5.1.0 sobre CPU.
- Integración con pipelines de inferencia: etiquetado con `text-embeddings-inference` y `endpoints_compatible`.
- Integración con Belief Engine: se configura como estimador de fuerza de memoria mediante `strength_estimation_method: classifier` y `classifier_kind: argument_quality`.
- Reproducibilidad verificable: incluye `verify_release.py`, que comprueba hashes de checkpoint y tokenizador y cinco puntuaciones de referencia con tolerancia absoluta de 0.0001.
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni generación de texto; es un encoder de clasificación/regresión, no un modelo instructivo.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Evaluación automática de ensayos y argumentaciones en entornos educativos: el modelo puntúa la calidad argumental de un texto sin necesitar el enunciado ni documentación de apoyo, lo que permite calificar respuestas abiertas de forma escalable con una única pasada de 128 tokens.
- Ranking y moderación de comentarios en plataformas de debate: dado que produce una puntuación continua en [0, 1], puede ordenar aportaciones por calidad argumental y priorizar o despriorizar contenido en foros, sistemas de comentarios y comunidades.
- Estimación de fuerza de memoria en agentes con Belief Engine: se integra como clasificador local (`classifier_model_path`, `classifier_kind: argument_quality`) para decidir qué creencias o argumentos conservar, sin recurrir a un LLM externo si se desactiva `classifier_allow_llm_fallback`.
- Filtrado de calidad en construcción de datasets: puede puntuar grandes volúmenes de argumentos para descartar ejemplos de baja calidad antes de usarlos en el entrenamiento de otros modelos o en anotación.
- Herramientas de escritura asistida orientadas a argumentación: integrado en un editor, el modelo puede ofrecer retroalimentación sobre la solidez argumental de un párrafo concreto en inglés.
- Investigación en lingüística computacional y ciencias sociales: permite obtener una medida reproducible de calidad argumental sobre corpus propios, con métricas y predicciones indexadas por fila guardadas por el script de evaluación.
- Evaluación de respuestas en pipelines de RLHF o benchmarking: la puntuación puede servir como señal auxiliar para clasificar la calidad de respuestas generadas por otros modelos.
- Verificación de integridad de despliegues: gracias a `verify_release.py` y a los hashes publicados, puede certificarse que el checkpoint desplegado coincide exactamente con el release original.

## Benchmarks y rendimiento

El autor publica exclusivamente métricas históricas evaluadas sobre las primeras 1.000 filas del conjunto de test (no sobre las 6.315 filas completas). No se han publicado otros resultados de benchmarks en la información disponible.

| Metrica | Valor historico |
|---|---:|
| MAE | 0.123305 |
| RMSE | 0.168978 |
| R² | 0.194686 |
| Pearson r | 0.562131 |

Advertencias relevantes sobre estas cifras: son resultados históricos, no una evaluación completa del test set; el script original de entrenamiento usó test.csv para early stopping y selección de checkpoint, por lo que no constituyen una estimación sobre un holdout intacto. Un R² de 0.194686 indica que el modelo explica una fracción limitada de la varianza de la valoración humana.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 2-3 GB incluyendo pesos (1,74 GB) y activaciones para batch pequeno a 128 tokens. Son estimaciones, no cifras publicadas por el autor.
- VRAM estimada en FP16/BF16: en torno a 1,5-2 GB. Cuantizaciones INT8/INT4 no están publicadas, por lo que no pueden confirmarse.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM es suficiente; una RTX 3060, RTX 4090 o superiores lo ejecutan sin problemas. No se requiere A100 ni H100.
- CPU: la inferencia en CPU está soportada y es el entorno de referencia probado por el autor (Python 3.11, PyTorch 2.10.0, Transformers 5.1.0). CUDA es opcional.
- Cabe en GPU de consumo: sí, en practicamente cualquier GPU de consumo actual con 4 GB o más de VRAM.
- Opciones de despliegue: PyTorch/Transformers, el paquete propio `argument_quality_model`, y text-embeddings-inference segun las etiquetas del repositorio (`endpoints_compatible`). No se documentan soportes vLLM, llama.cpp ni Ollama (no aplicables a un encoder de este tipo).
- Latencia y throughput: no disponibles. El autor no aporta estimaciones de tiempo de ejecución ni de throughput, y señala que no se ha benchmarkeado memoria de GPU ni runtime para el reentrenamiento completo.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos publicados para este checkpoint frente a alternativas. La comparación solo puede establecerse a nivel de categoria y especificaciones.

| Modelo | Parametros | Contexto (ajuste) | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| joshcyang/belief-engine-argument-quality-deberta-v3-large | 435.062.785 | 128 tokens | Regresión de calidad argumental | MIT | HuggingFace, sin cuenta |
| microsoft/deberta-v3-large (base) | ~435 M | Hasta 512 tokens | Encoder preentrenado, sin cabeza de tarea | MIT | HuggingFace |
| Modelos de puntuación de calidad argumental del dataset IBM | no disponible | no disponible | Ranking/regresión de argumentos | no disponible | Dataset público en HuggingFace |

No se conocen valores de benchmark comparables entre estos modelos en la información proporcionada. Cualquier comparación numérica de rendimiento se marca como "no disponible".

## Limitaciones y advertencias

- La puntuación estima calidad argumental percibida por humanos; no establece veracidad factual, fiabilidad de la evidencia ni una probabilidad calibrada de que una afirmación sea correcta.
- El modelo no recibe el tema, la polaridad ni documentos de apoyo, por lo que solo evalúa el texto del argumento de forma aislada.
- La salida es un valor de regresión recortado a [0, 1] sin sigmoide ni calibración; no debe interpretarse como probabilidad ni sustituirse por la salida de un pipeline genérico de text-classification.
- Contexto limitado a 128 tokens: los argumentos más largos se truncan, con la consiguiente pérdida de información.
- Únicamente soporta inglés.
- Las métricas publicadas proceden de las primeras 1.000 filas del test set y el script original usó test.csv para early stopping, por lo que no son una estimación sobre holdout intacto. El R² bajo (0.194686) sugiere capacidad explicativa limitada.
- Se desconocen detalles de reproducibilidad del entrenamiento original: semilla de inicialización, revisión del modelo base, hardware y lock completo de entorno. La receta corregida genera un modelo nuevo, no reproduce los pesos originales byte a byte.
- El autor no ha benchmarkeado memoria de GPU ni runtime; las cifras de VRAM de esta ficha son estimaciones.
- Aunque la licencia es MIT y permite uso comercial, hay que verificar las obligaciones heredadas del dataset IBM Argument Quality Ranking utilizado en el ajuste.
- En integración con Belief Engine, un fallo de carga del modelo detiene las ejecuciones basadas en clasificador; solo las ejecuciones puramente LLM continúan.
- Las tolerancias numéricas pueden variar segun el dispositivo; la verificación publicada se validó en CPU.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshcyang/belief-engine-argument-quality-deberta-v3-large
- Modelo base: https://huggingface.co/microsoft/deberta-v3-large
- Dataset de entrenamiento: https://huggingface.co/datasets/ibm-research/argument_quality_ranking_30k
- Repositorio del release (pesos y herramientas de inferencia, evaluación y reentrenamiento): https://huggingface.co/joshcyang/belief-engine-argument-quality-deberta-v3-large
