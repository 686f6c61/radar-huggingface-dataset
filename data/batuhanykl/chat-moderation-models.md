# BatuhanYkl/chat-moderation-models

## Resumen

`BatuhanYkl/chat-moderation-models` es un repositorio que agrupa cinco aproximaciones distintas a la moderación de chats en turco, desarrolladas como trabajo académico (SWE015, caso de uso 4 "Real-Time Chat Moderation"). No se trata de un único modelo, sino de un conjunto de clasificadores binarios OFF/NOT (ofensivo / no ofensivo) que van desde una lista léxica basada en reglas hasta un BERTurk afinado y su versión cuantizada a INT8. El autor es BatuhanYkl y el modelo base lingüístico es `dbmdz/bert-base-turkish-cased`.

La relevancia práctica está en el eje latencia/precisión: los cinco enfoques se evalúan sobre el mismo test oficial de OffensEval-TR 2020 (3528 mensajes) con métricas de Macro-F1, precisión y recall de la clase ofensiva, además de latencia en CPU y tamaño en disco. Esto permite elegir conscientemente entre un filtro léxico de 0,2 MB y 0,1 ms de latencia o un transformer de 443 MB con Macro-F1 de 0,8097.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, está etiquetado con `joblib`, `safetensors`, `quantization` y `turkish`, y no declara licencia explícita en los metadatos de Hugging Face, lo que condiciona su reutilización comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conjunto de 5 aproximaciones: léxico por reglas con edit-distance, tf-idf (word 1-2 gramos + char 2-5 gramos) + regresión logística, word2vec + red feedforward, BERTurk fine-tuned (FP32) y BERTurk INT8 (cuantización dinámica) |
| Parametros totales | No disponible (el modelo base es `dbmdz/bert-base-turkish-cased`; el autor no publica el recuento) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (limitada por el modelo base BERT, típicamente 512 tokens; el autor no lo especifica) |
| Tipos de cuantizacion | INT8 dinámica (carpeta `berturk_int8/`, recreada en tiempo de carga por la app); FP32 para el resto |
| Idiomas soportados | Turco (`tr`) |
| Licencia | No disponible |
| Formato de pesos | `safetensors`, `joblib` (según tags del repositorio) |

## Arquitectura y entrenamiento

El repositorio contiene cinco pipelines independientes para la misma tarea de clasificación binaria OFF/NOT. El más simple es una lista léxica (combinación de una lista de Kaggle "Turkish Slang and Swear", Apache 2.0, e insultos seleccionados manualmente) aplicada mediante un matcher de distancia de edición. Le siguen dos aproximaciones clásicas de NLP: tf-idf con n-gramas de palabra (1-2) y de carácter (2-5) alimentando una regresión logística, y word2vec entrenado sobre los propios tuits de entrenamiento seguido de una red feedforward. La aproximación principal es un fine-tuning de `dbmdz/bert-base-turkish-cased` (BERTurk, cased) para clasificación OFF/NOT, del que se publica tanto el checkpoint FP32 como una versión con cuantización dinámica INT8.

El entrenamiento se realizó sobre el corpus OffensEval-TR 2020 (Çöltekin, 2020) y la evaluación se hace sobre el split de test oficial de ese mismo certamen (3528 mensajes). El autor no documenta en la model card el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo ajuste fino adicional con RLHF/DPO (no procede en un clasificador de este tipo). La innovación destacable no es arquitectónica sino de ingeniería: la comparación sistemática de cinco enfoques bajo las mismas condiciones de latencia (CPU, AMD Ryzen 5 7600X, 6 hilos, batch size 1, media sobre 200 mensajes tras 10 warm-ups, incluyendo normalización y tokenización) y la verificación de que todos cumplen el requisito de ≤50 ms por mensaje.

## Capacidades

- Clasificación binaria de texto en turco: etiqueta OFF (ofensivo) o NOT (no ofensivo).
- Moderación de mensajes de chat en tiempo real con latencia inferior a 50 ms en todos los enfoques.
- Detección de insultos mediante reglas léxicas con tolerancia a erratas (distancia de edición).
- Clasificación estadística de texto con tf-idf + regresión logística, útil como baseline ligero.
- Representaciones word2vec entrenadas sobre el dominio específico (tuits turcos) más red feedforward.
- Clasificación contextual con BERTurk, con versión INT8 para despliegue con menor huella de memoria.
- No soporta tool calling, function calling, agentes, multi-step reasoning, visión, audio ni modo thinking: es un clasificador, no un modelo generativo.
- Capacidad multilingüe: no, solo turco.

## Casos de uso

- Moderación en tiempo real de chats turcos: el modelo BERTurk INT8 clasifica cada mensaje en 14,5 ms de media (19,7 ms en p95) en CPU, lo que permite filtrar mensajes antes de que se rendericen en el cliente sin necesidad de GPU.
- Pre-filtro de bajo coste en pipelines de moderación: la lista léxica (0,2 MB, 0,1 ms) puede actuar como primera barrera para descartar mensajes claramente ofensivos y reservar el transformer para los casos ambiguos, reduciendo el coste computacional agregado.
- Moderación en entornos con recursos limitados: el clasificador tf-idf + regresión logística (6,7 MB, 0,9 ms de media) ofrece Macro-F1 de 0,7698 y cabe en cualquier instancia pequeña o incluso en el dispositivo.
- Sistemas de alertas y revisión humana: dado que el modelo devuelve una probabilidad de la clase OFF, puede usarse para priorizar la cola de revisión de moderadores humanos, enviando primero los mensajes con mayor score.
- Investigación y docencia en NLP turco: el repositorio sirve como comparativa reproducible de cinco enfoques (léxico, tf-idf, embeddings estáticos, transformer, transformer cuantizado) sobre el mismo test oficial, útil para estudiar el compromiso precisión/latencia.
- Despliegue en servicios de chat de comunidades turcófonas: con licencia por confirmar, el BERTurk INT8 (186,8 MB) puede integrarse en un microservicio de clasificación por HTTP sin GPU dedicada.
- Filtrado de comentarios en foros y redes sociales en turco: el recall de la clase ofensiva del BERTurk INT8 (0,6690) y su precisión (0,7225) permiten una política de moderación automática con revisión de apelaciones.

## Benchmarks y rendimiento

Resultados sobre el test oficial de OffensEval-TR 2020 (3528 mensajes), latencia en CPU (AMD Ryzen 5 7600X, 6 hilos, batch size 1, media de 200 mensajes tras 10 warm-ups, normalización y tokenización incluidas):

| Modelo | Macro-F1 | Accuracy | OFF Precision | OFF Recall | Tamano (MB) | Latencia media (ms) | Latencia p95 (ms) | ≤50 ms |
|---|---|---|---|---|---|---|---|---|
| Lexicon (rules) | 0,6846 | 0,8384 | 0,7098 | 0,3450 | 0,2 | 0,1 | 0,1 | Sí |
| tf-idf + LR | 0,7698 | 0,8518 | 0,6365 | 0,6285 | 6,7 | 0,9 | 1,1 | Sí |
| word2vec + FFN | 0,6945 | 0,7871 | 0,4799 | 0,5824 | 24,6 | 0,1 | 0,2 | Sí |
| BERTurk (FP32) | 0,8097 | 0,8770 | 0,6975 | 0,6955 | 443,3 | 30,3 | 45,9 | Sí |
| BERTurk (INT8) | 0,8103 | 0,8807 | 0,7225 | 0,6690 | 186,8 | 14,5 | 19,7 | Sí |

Observación: la cuantización INT8 no solo reduce el tamaño a menos de la mitad (186,8 MB frente a 443,3 MB) y la latencia a la mitad (14,5 ms frente a 30,3 ms), sino que mantiene e incluso mejora ligeramente Macro-F1 (0,8103 frente a 0,8097) y accuracy (0,8807 frente a 0,8770), a costa de un recall de OFF algo menor (0,6690 frente a 0,6955).

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica para los enfoques léxico, tf-idf y word2vec (CPU pura). Para BERTurk FP32, aproximadamente 0,5-1 GB de VRAM en función del batch; para INT8, aproximadamente la mitad.
- GPU recomendadas: no se han publicado mediciones en GPU. Cualquier GPU con al menos 2 GB de memoria puede ejecutar el BERTurk INT8; una RTX 4090 o A100 no son necesarias para este tamaño de modelo.
- Cabe en GPU de consumo: sí, cualquier GPU consumer moderna (GTX 1650 en adelante) puede alojar el BERTurk INT8; los otros tres enfoques no requieren GPU.
- Opciones de despliegue: el autor publica una app en el repositorio de GitHub (`https://github.com/BatuhanYkl/chat-moderation`) que recrea los pesos INT8 en tiempo de carga. Para servir el modelo se puede usar Hugging Face Transformers con PyTorch, o exportar a ONNX Runtime para aprovechar la cuantización dinámica. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no procede para un clasificador BERT).
- Latencia y throughput estimados: latencias medidas en CPU con batch size 1 (ver tabla de benchmarks). El throughput no se publica; con batch size 1 y 14,5 ms por mensaje, el límite teórico en un solo hilo es de unas 69 clasificaciones por segundo, escalable en paralelo por hilos.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la información proporcionada. La propia model card incluye una comparativa interna entre los cinco enfoques del repositorio (ver tabla de benchmarks), que puede usarse como referencia de compromiso precisión/latencia dentro de este proyecto. Para comparar con otros modelos de moderación en turco sería necesario consultar fuentes externas no incluidas en esta ficha.

## Limitaciones y advertencias

- Licencia no disponible: los metadatos de Hugging Face no declaran licencia, por lo que no se puede asumir uso comercial sin contactar con el autor. La model card advierte explícitamente de que se revisen las licencias de las fuentes (OffensEval-TR 2020 y la lista de Kaggle "Turkish Slang and Swear", Apache 2.0) antes de reutilizar los modelos.
- Sesgos conocidos: no documentados por el autor. Al entrenarse sobre tuits turcos de OffensEval-TR 2020, el modelo hereda los sesgos de ese corpus (posible sobrerrepresentación de determinados registros y variantes dialectales).
- Riesgo de falsos negativos: el recall de la clase ofensiva del BERTurk INT8 es 0,6690, lo que implica que aproximadamente un tercio de los mensajes ofensivos del test no se detectan; el léxico por reglas es mucho peor en este aspecto (recall 0,3450).
- Riesgo de falsos positivos: la precisión de OFF del tf-idf + LR es 0,6365, de modo que una fracción relevante de las detecciones son incorrectas; en producción conviene calibrar el umbral según la política de moderación.
- Limitación de idioma: solo turco. No debe aplicarse a otros idiomas sin reentrenamiento.
- Limitación de contexto: el modelo base es BERT, con una ventana típica de 512 tokens; no se especifica en la model card el truncamiento aplicado, por lo que mensajes muy largos pueden perder información.
- Naturaleza académica: el repositorio es un trabajo de asignatura (SWE015), con 0 descargas y 0 likes; no hay evidencia de validación en producción ni de mantenimiento continuado.
- La app recrea los pesos INT8 en tiempo de carga, lo que añade un coste de arranque no medido en los benchmarks de latencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BatuhanYkl/chat-moderation-models
- Repositorio de código, scripts de entrenamiento y app: https://github.com/BatuhanYkl/chat-moderation
- Modelo base: https://huggingface.co/dbmdz/bert-base-turkish-cased
- Dataset de entrenamiento y evaluación: https://huggingface.co/datasets/coltekin/offenseval2020_tr
- Lista léxica de origen (Kaggle "Turkish Slang and Swear", aiwithcagri, Apache 2.0): no disponible el enlace directo en la información proporcionada.
