# humeyrakoctemiz/swe015-chat-moderation

## Resumen

SWE015-chat-moderation es un paquete de clasificadores de texto en turco orientados a la moderación de chats en tiempo real, publicado por la usuaria de Hugging Face humeyrakoctemiz como material de un repositorio de tareas (homework). No se trata de un único modelo, sino de cuatro variantes empaquetadas en el mismo repositorio: una basada en TF-IDF con regresión logística, otra con embeddings word2vec propios (skip-gram con negative sampling) y una red feedforward, y dos versiones del transformer turco `dbmdz/bert-base-turkish-cased` afinado, una en FP32 y otra exportada a ONNX Runtime con cuantización dinámica INT8. La tarea es la clasificación binaria/multiclase de lenguaje ofensivo.

El modelo se entrena sobre OffensEval-TR 2020 (Çöltekin, 2020), el corpus turco de la competición OffensEval, y está pensado para detectar mensajes ofensivos en conversaciones. Su relevancia práctica es limitada: se publica como ejercicio académico, sin métricas reportadas en la model card, sin descargas ni validación comunitaria, y con un tamaño de repositorio de 1,0 GB que incluye los pesos del transformer y sus artefactos ONNX.

Al estar especializado únicamente en turco y en una tarea de moderación, no compite con los LLM generalistas, sino con clasificadores ligeros de moderación. Su interés técnico está en la comparativa interna que ofrece entre un baseline clásico (TF-IDF + LR), un enfoque neuronal ligero (word2vec + FFN) y un transformer afinado con optimización ONNX INT8 para despliegue de baja latencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cuatro variantes: TF-IDF + regresión logística; word2vec skip-gram + red feedforward; BERT base turco (transformer encoder) en FP32; el mismo BERT exportado a ONNX Runtime con INT8 dinámico |
| Parametros totales | No disponible (la model card no indica el recuento; la variante BERT se basa en `dbmdz/bert-base-turkish-cased`, de tamaño base, pero el autor no lo explicita) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no se especifica la longitud máxima de secuencia usada en el afinado) |
| Tipos de cuantizacion | FP32 y INT8 dinámico (solo en la variante ONNX) |
| Idiomas soportados | Turco (tr) |
| Licencia | CC-BY-2.0 |
| Formato de pesos | safetensors, ONNX y joblib (según la variante) |

## Arquitectura y entrenamiento

El repositorio agrupa cuatro aproximaciones con complejidad creciente. La primera es un pipeline clásico de TF-IDF seguido de regresión logística, típico baseline de clasificación de texto. La segunda sustituye la representación por embeddings word2vec entrenados por el propio autor con skip-gram y negative sampling, alimentando una red feedforward. La tercera afina el checkpoint `dbmdz/bert-base-turkish-cased` en FP32, un transformer encoder de tipo BERT preentrenado en turco. La cuarta es una exportación del mismo modelo a ONNX Runtime, con una versión FP32 y otra con cuantización dinámica INT8, orientada a reducir el coste de inferencia en producción.

El entrenamiento se realiza sobre el corpus OffensEval-TR 2020 (Çöltekin, 2020). La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset, la presencia de RLHF/DPO (poco probable en un clasificador de este tipo) ni hiperparámetros de afinado. Tampoco se documentan técnicas como decodificación especulativa o atención lineal; la única innovación de despliegue destacable es la ruta ONNX con cuantización dinámica INT8 para acelerar la inferencia del transformer en CPU.

## Capacidades

- Clasificación de texto para detección de lenguaje ofensivo en turco.
- Cuatro variantes con distinto compromiso entre simplicidad, coste y precisión potencial: TF-IDF + LR, word2vec + FFN, BERT FP32 y BERT ONNX INT8.
- Inferencia de baja latencia mediante la variante ONNX Runtime con cuantización dinámica INT8.
- Etiquetado de mensajes individuales, adecuado para moderación de chats en tiempo real.
- No soporta tool calling ni function calling.
- No está diseñado para razonamiento multi-paso ni para uso como agente.
- No dispone de capacidades multimodales (visión, audio) ni de modo de razonamiento explícito (thinking mode).
- Capacidad multilingüe: únicamente turco.

## Casos de uso

- Moderación de chat en vivo en comunidades turcoparlantes: el clasificador etiqueta cada mensaje entrante y permite filtrar o marcar contenido ofensivo antes de que se publique; la variante ONNX INT8 reduce la latencia por mensaje en servidores sin GPU.
- Prefiltrado en pipelines de moderación con revisión humana: el modelo actúa como primera capa que descarta mensajes claramente no ofensivos y escala el resto a moderadores, reduciendo la carga manual.
- Investigación académica sobre detección de odio y lenguaje ofensivo en turco: sirve como baseline reproducible sobre OffensEval-TR 2020 para comparar enfoques clásicos, neuronales ligeros y transformers.
- Docencia y ejercicios de NLP: el repositorio ilustra de forma práctica la progresión de TF-IDF + LR a word2vec + FFN y a un transformer afinado con exportación ONNX.
- Despliegue en entornos con CPU exclusivamente: la variante ONNX INT8 permite servir el clasificador sin GPU, útil en infraestructuras modestas o en el borde.
- Análisis retrospectivo de logs de conversación: procesar históricos de chat para cuantificar la incidencia de mensajes ofensivos por canal o periodo.
- Comparación de estrategias de cuantización: la pareja FP32/INT8 ONNX permite medir la pérdida de precisión frente a la ganancia de velocidad en un caso real de clasificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión, recall, F1 ni comparativas con otros modelos sobre OffensEval-TR 2020.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. La variante BERT base en FP32 requiere del orden de varios cientos de MB de memoria para pesos (el repositorio completo ocupa 1,0 GB, incluyendo todas las variantes y artefactos); la variante ONNX INT8 reduce aproximadamente a la mitad el espacio de los pesos del transformer.
- GPU recomendadas: no especificadas por el autor. Por el tamaño de un BERT base, cabría en GPUs consumer tipo RTX 3060/4060/4090 y en GPUs de datacenter (A100, H100) sin problema, aunque no hay datos de rendimiento publicados.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con al menos 2-4 GB de VRAM para la variante BERT; las variantes TF-IDF + LR y word2vec + FFN pueden ejecutarse en CPU.
- Opciones de despliegue: ONNX Runtime (variante ONNX), y para el resto, los runtimes habituales de scikit-learn/joblib y de transformers según el formato; el autor no documenta integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a un clasificador de este tamaño.
- Latencia y throughput: no disponibles; la única indicación cualitativa es que la ruta ONNX INT8 está pensada para inferencia más rápida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| humeyrakoctemiz/swe015-chat-moderation | No disponible (BERT base + variantes ligeras) | No disponible | Clasificación de lenguaje ofensivo en turco | CC-BY-2.0 | Hugging Face, 0 descargas |
| dbmdz/bert-base-turkish-cased | BERT base (aprox. 110 M, según el checkpoint original) | 512 tokens (configuración estándar de BERT) | Modelo base de propósito general en turco | No disponible en la información proporcionada | Hugging Face, ampliamente utilizado |
| Clasificadores de OffensEval-TR 2020 de la competición | No disponible | No disponible | Detección de lenguaje ofensivo en turco | No disponible | Publicaciones y repositorios de la competición |

No se dispone de datos de rendimiento del modelo como para establecer una comparación cuantitativa con alternativas; la comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo de carácter académico (trabajo de clase): sin métricas publicadas, sin descargas ni validación por parte de la comunidad; no debe asumirse calidad de producción.
- Sesgos potenciales derivados del corpus OffensEval-TR 2020: la distribución de anotaciones, el dominio y las convenciones de etiquetado del dataset condicionan lo que el modelo considera ofensivo.
- Riesgo de falsos positivos y falsos negativos en contextos coloquiales, ironía, sarcasmo o lenguaje recuperado (reclaimed slur), habituales en chats.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificaciones erróneas con alta confianza.
- Limitación idiomática estricta: solo turco; no funciona en otros idiomas.
- Licencia CC-BY-2.0: permite uso comercial con atribución, pero conviene revisar las condiciones del dataset de origen (OffensEval-TR 2020) antes de desplegar en producción.
- No se documentan la longitud máxima de secuencia, los hiperparámetros de entrenamiento ni el proceso de cuantización, lo que dificulta la reproducibilidad.
- El repositorio incluye múltiples artefactos (safetensors, ONNX, joblib); es necesario seleccionar explícitamente la variante adecuada al entorno de despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/humeyrakoctemiz/swe015-chat-moderation
- Checkpoint base del transformer: https://huggingface.co/dbmdz/bert-base-turkish-cased
- Dataset de entrenamiento: https://huggingface.co/datasets/coltekin/offenseval2020_tr
- Referencia del corpus: Çöltekin (2020), OffensEval-TR 2020 (no se proporciona URL directa en la información disponible)
