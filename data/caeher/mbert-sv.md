# caeher/mbert-sv

## Resumen

mBERT-SV es un modelo de clasificación de texto derivado de `google-bert/bert-base-multilingual-cased` mediante fine-tuning supervisado para la detección multiclase de toxicidad en publicaciones de redes sociales escritas en español salvadoreño. Lo publica el usuario `caeher` como artefacto de una tesina, con un checkpoint concreto (`checkpoint-4050`, release v6) entrenado sobre 21 585 ejemplos del corpus CDE v1.9.0. Su relevancia radica en cubrir una variante dialectal poco representada en los datasets de moderación habituales, que suelen estar dominados por español peninsular, rioplatense o neutro.

Arquitectónicamente es un transformer encoder BERT base multilingüe, con 177 856 516 parámetros, vocabulario de 119 547 tokens y una ventana de entrada fijada en 128 tokens por contrato de inferencia. No es un modelo generativo: devuelve una distribución sobre cuatro clases (No Tóxico, Lenguaje Ofensivo, Discurso de Odio, Amenazas/Violencia), lo que lo hace adecuado como componente de un pipeline de moderación y no como moderador autónomo.

El modelo declara métricas en un test de 460 ejemplos: F1-macro 0,7784, accuracy 0,7804, precision-macro 0,7800, recall-macro 0,7776 y QWK 0,7286. Son cifras razonables para una tarea de clasificación de toxicidad de cuatro clases con datos dialectales, aunque el tamaño reducido del conjunto de test y la falta de verificación externa de las métricas obligan a tratarlas como indicativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base multilingüe, `bert-base-multilingual-cased`) |
| Parametros totales | 177 856 516 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens (`max_length` del contrato de inferencia) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, sin variantes GGUF/ONNX en el repo) |
| Idiomas soportados | español (`es`), con foco en español salvadoreño |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (más `config.json`, `tokenizer.json`, `tokenizer_config.json`) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo de `bert-base-multilingual-cased`, un encoder transformer de 12 capas, 768 dimensiones ocultas y 12 cabezas de atención, con vocabulario cased de 119 547 entradas. La cabeza de clasificación es una capa lineal sobre el token `[CLS]` con cuatro salidas correspondientes a las etiquetas del corpus CDE. No hay innovaciones arquitectónicas propias: el valor está en el ajuste de dominio y dialecto, no en la topología.

El entrenamiento se realizó sobre la versión v1.9.0 del dataset CDE, con 21 585 ejemplos, semilla 42 y un checkpoint final en el paso 4050 (release v6, inicializado desde la release v4). El repositorio incluye artefactos de trazabilidad poco habituales en modelos pequeños: `training_run.json` con la receta, `test_metrics.json` y `train_metrics.json` con las métricas por checkpoint, y `inference_contract.json` que documenta el preprocesamiento obligatorio. Ese contrato especifica la columna de texto (`texto_modelo`), el normalizador `normalize_for_model` v1.1 y el truncado a 128 tokens; no se documenta en la información disponible el uso de RLHF, DPO ni aumentación de datos.

## Capacidades

- Clasificación multiclase de toxicidad en cuatro categorías: No Tóxico, Lenguaje Ofensivo, Discurso de Odio y Amenazas/Violencia.
- Detección de lenguaje ofensivo y discurso de odio en español salvadoreño, incluyendo jerga y variantes léxicas locales presentes en el corpus de entrenamiento.
- Salida de logits por clase, lo que permite umbralizar de forma asimétrica (por ejemplo, priorizar recall en Amenazas/Violencia) en lugar de usar solo `argmax`.
- Procesamiento por lotes con throughput alto al ser un encoder de 177 M de parámetros y secuencias de 128 tokens.
- Compatibilidad con `transformers` (`AutoTokenizer`, `AutoModelForSequenceClassification`) y con Text Embeddings Inference (`text-embeddings-inference` aparece en los tags del repo).
- No soporta tool calling, function calling, razonamiento multi-paso, generación de texto, visión ni audio: es exclusivamente un clasificador de secuencias.
- Capacidad multilingüe heredada del backbone, pero sin garantías de calibración fuera del español y, en particular, fuera del dialecto salvadoreño.

## Casos de uso

- Moderación de comentarios en comunidades y medios salvadoreños: el modelo clasifica cada comentario en una de las cuatro categorías y permite aplicar acciones diferenciadas (ocultar, revisar, expulsar) según la clase y el score, aprovechando que está ajustado sobre jerga local que los modelos entrenados en español neutro suelen infraclasificar.
- Pre-filtrado en colas de revisión humana: usar el modelo como primera etapa para reducir el volumen que llega a moderadores, derivando a revisión manual solo los casos con confianza baja o clase Amenazas/Violencia, donde el coste de un falso negativo es alto.
- Monitorización de toxicidad en campañas electorales o eventos concretos: al ser un encoder pequeño, se puede desplegar en CPU y procesar lotes de miles de publicaciones recolectadas de X, Facebook o TikTok para construir series temporales de toxicidad por clase.
- Señal auxiliar en sistemas de ranking o recomendación de comentarios: los logits de las cuatro clases pueden usarse como features continuas para degradar contenido ofensivo en feeds, en lugar de un filtro binario.
- Investigación sociolingüística sobre violencia verbal en El Salvador: el etiquetado consistente permite medir prevalencia de discurso de odio frente a lenguaje ofensivo y analizar la distribución por comunidad o tema, siempre con validación humana de una muestra.
- Detección de amenazas en soporte al cliente o canales internos: clasificar mensajes entrantes para escalar automáticamente los que caen en Amenazas/Violencia a un equipo de seguridad, con umbral conservador sobre la probabilidad de esa clase.
- Evaluación comparativa de modelos de moderación: servir como baseline dialectal frente a modelos multilingües genéricos, dado que publica métricas por clase y un contrato de preprocesamiento reproducible.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el conjunto de test del corpus CDE v1.9.0 (n = 460). No están verificados de forma independiente.

| Metrica | Valor |
|---|---|
| F1-macro | 0,7784 |
| Accuracy | 0,7804 |
| Precision-macro | 0,7800 |
| Recall-macro | 0,7776 |
| QWK (quadratic weighted kappa) | 0,7286 |

F1 por clase:

| Clase | F1 |
|---|---|
| No Tóxico | 0,772 |
| Lenguaje Ofensivo | 0,799 |
| Discurso de Odio | 0,760 |
| Amenazas/Violencia | 0,783 |

No se han publicado en la información disponible resultados comparativos con otros modelos sobre el mismo conjunto de test, ni métricas en benchmarks estándar (MMLU, GLUE, etc.), que además no aplican a esta tarea.

## Requisitos de hardware

- VRAM para inferencia en fp32: aproximadamente 0,7 GB de pesos (177,9 M de parámetros × 4 bytes) más activaciones; en la práctica cabe holgadamente en 2 GB.
- VRAM en fp16/bf16: alrededor de 0,36 GB de pesos; el modelo se puede servir en GPUs de gama baja.
- GPU recomendadas: cualquier GPU con al menos 4 GB, incluidas RTX 3060, RTX 4060, T4, L4, A10G. Para lotes grandes, A100 o H100 aportan throughput, no capacidad.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida.
- CPU: viable para inferencia en línea con un solo hilo por petición; el cuello de botella es el tokenizador y el tamaño de lote, no el modelo.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, Text Embeddings Inference (el repo incluye el tag `text-embeddings-inference`), TorchServe o un servidor FastAPI propio. No hay pesos GGUF publicados, por lo que llama.cpp/Ollama requerirían conversión manual a un formato soportado.
- Latencia y throughput: no disponibles en la información proporcionada. Como referencia estructural, un BERT base con secuencias de 128 tokens procesa lotes de decenas de ejemplos por milisegundo en GPU moderna, pero no se aportan mediciones del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| caeher/mbert-sv | 177,9 M | 128 tokens | Clasificación de toxicidad en 4 clases, español salvadoreño | Apache 2.0 | Hugging Face, 4 descargas |
| google-bert/bert-base-multilingual-cased | 177,9 M | 512 tokens | Encoder base sin cabeza de clasificación de toxicidad | Apache 2.0 | Hugging Face, ampliamente usado |
| Modelos de toxicidad en español de tipo BETO fine-tuneado | ~110 M (BETO base) | 512 tokens | Clasificación binaria o multiclase de odio en español general | variable según checkpoint | Hugging Face, múltiples checkpoints de terceros |

La comparación cuantitativa de rendimiento frente a alternativas no está disponible: el autor no publica resultados de otros modelos sobre el mismo test de CDE v1.9.0, y los benchmarks de toxicidad en español no están estandarizados entre checkpoints. La ventaja diferencial de mbert-sv es la especialización dialectal y la documentación del contrato de preprocesamiento; su desventaja es el contexto de 128 tokens y un conjunto de test de solo 460 ejemplos.

## Limitaciones y advertencias

- Modelo de tesina: el propio autor lo describe explícitamente como no apto para funcionar como moderador autónomo. Requiere supervisión humana en la cadena de decisión.
- Sesgo dialectal y geográfico: el corpus es de El Salvador; el rendimiento puede degradarse en otros dialectos del español y en jerga adversarial no vista durante el entrenamiento.
- Tasa de falsos positivos sobre jerga no tóxica: el autor indica que el FPR sobre jerga no tóxica y los cortes por plataforma están documentados en el informe del proyecto, pero no se incluyen en la model card, por lo que no se pueden cuantificar desde el repositorio.
- Riesgo de alucinación en sentido estricto: no aplica, al ser un clasificador; el riesgo equivalente es la clasificación errónea con alta confianza, especialmente en textos sarcásticos, ironía o citas de discurso ajeno.
- Límite de contexto de 128 tokens: los comentarios largos se truncan, de modo que una amenaza situada al final de un texto extenso puede no ser detectada.
- Métricas no verificadas (`verified: false` en el model-index) y test de 460 ejemplos, lo que implica intervalos de confianza amplios en torno al F1-macro de 0,7784.
- Dependencia estricta del preprocesamiento: usar el tokenizador sin aplicar `normalize_for_model` v1.1 puede degradar el rendimiento de forma no medida; el contrato está en `inference_contract.json`.
- Licencia Apache 2.0: permite uso comercial y modificaciones, pero el modelo base subyacente conserva su propia licencia y conviene revisar las condiciones de los datos CDE v1.9.0 para usos distintos de la investigación.
- Trazabilidad limitada del dataset: no se detalla en la información disponible la composición por plataforma, el proceso de anotación ni el acuerdo entre anotadores, lo que dificulta evaluar la calidad de las etiquetas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/caeher/mbert-sv
- Modelo base: https://huggingface.co/google-bert/bert-base-multilingual-cased
- Repositorio de la tesina con `inference_contract.json` y el normalizador `normalize_for_model`: no disponible en la información proporcionada
- Paper o informe del proyecto: no disponible en la información proporcionada
- Demo o Space: no disponible en la información proporcionada
