# dleemiller/finecat-nli-v2-l

## Resumen

finecat-nli-v2-l es un cross-encoder de inferencia de lenguaje natural (NLI) desarrollado por dleemiller, afinado a partir del encoder Ettin-400m de JHU CLSP. Su función es recibir un par premisa-hipótesis y devolver probabilidades calibradas de que la premisa implique, contradiga o sea neutral respecto a la hipótesis. Con 395,8 millones de parámetros y ventana de hasta 8.000 tokens, se posiciona como una herramienta versátil para tareas de clasificación zero-shot, detección de alucinaciones y verificación de hechos en pipelines RAG.

El modelo emplea una arquitectura ModernBERT (encoder transformer bidireccional) y se distribuye bajo licencia Apache-2.0, lo que facilita su uso comercial. Su relevancia actual radica en que convierte una tarea clásica de NLP en un mecanismo de enrutamiento, moderación y grounding reutilizable: el mismo modelo sirve para triaje de intenciones, etiquetado zero-shot, guardarraíles de contenido y validación de respuestas generadas por LLM, con un throughput declarado de aproximadamente 1.200 pares por segundo.

La ficha se basa en la model card oficial y en el model-index del autor. Los resultados de benchmarks son los declarados por el desarrollador y no han sido verificados de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer bidireccional), base Ettin-encoder-400m |
| Parametros totales | 395.834.371 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | hasta 8.000 tokens por documento |
| Tipos de cuantizacion | no disponible (pesos safetensors en FP32/BF16 según repo) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Pipeline | zero-shot-classification / text-classification (cross-encoder) |
| Libreria | sentence-transformers |
| Tamano del repo | 1,6 GB |
| Throughput declarado | ~1.200 pares/s |

## Arquitectura y entrenamiento

El modelo es un cross-encoder basado en Ettin-encoder-400m, un encoder ModernBERT de JHU CLSP. ModernBERT incorpora atención con RoPE, alternancia de capas de atención global y local, y un preentrenamiento sobre datos de código y texto; Ettin aplica además una receta de datos equilibrada. Sobre esta base, finecat-nli-v2-l se afina para NLI con tres etiquetas (entailment, neutral, contradiction), lo que permite reutilizarlo como clasificador zero-shot evaluando cada etiqueta candidata como hipótesis.

El entrenamiento combina los datasets propios FineCat-NLI y FineCat-NLI-Reason, junto con datos de MNLI, SNLI y ANLI, e incluye destilación de conocimiento según las etiquetas del repo. La model card menciona explícitamente el uso de razonamiento destilado (FineCat-NLI-Reason). No se detallan en la información disponible el número exacto de tokens de entrenamiento, la composición porcentual del dataset ni si se aplicaron RLHF o DPO; estos datos figuran como no disponibles.

## Capacidades

- Inferencia de lenguaje natural de tres vías (entailment, neutral, contradiction) con probabilidades calibradas.
- Clasificación zero-shot y etiquetado: cada etiqueta candidata se formula como hipótesis y se puntúa con la probabilidad de entailment.
- Detección de alucinaciones y grounding en RAG: compara pasajes recuperados con la respuesta generada.
- Verificación de hechos y fact-checking mediante pares evidencia-afirmación.
- Guardarraíles y moderación de contenido: evalúa mensajes frente a declaraciones de política.
- Triaje y enrutamiento de intenciones en atención al cliente.
- Extracción clínica y de determinantes sociales (SDOH) a partir de notas clínicas.
- Procesamiento de documentos largos de hasta 8.000 tokens.
- Soporte de tool calling / function calling: no disponible (es un encoder de clasificación, no un modelo generativo).
- Soporte de agentes y razonamiento multi-paso: no disponible de forma nativa; puede integrarse como componente de verificación en un agente.
- Capacidades multilingües: no, solo inglés.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Grounding y detección de alucinaciones en RAG: dado un conjunto de pasajes recuperados y la respuesta generada por un LLM, el modelo calcula la probabilidad de entailment de cada pasaje respecto a la afirmación; el autor declara 0,81 de F1 en RAGTruth, lo que permite descartar respuestas no sustentadas antes de mostrarlas al usuario.
- Enrutamiento y triaje de solicitudes: se formula cada categoría como hipótesis ("El usuario quiere establecer una alarma") y se elige la de mayor probabilidad; el autor reporta 97,7 % en intenciones MASSIVE, adecuado para clasificadores de intención en atención al cliente.
- Moderación y guardarraíles: se compara el mensaje del usuario con declaraciones de política ("Este mensaje contiene insultos"); el autor declara 92,3 % en CrossingGuard y 94,3 % en insultos de Wikipedia, lo que permite filtrar contenido antes de pasarlo a un modelo generativo.
- Clasificación zero-shot de reseñas y tickets: sin entrenamiento específico, se etiquetan reseñas como positivas o negativas o se asignan etiquetas temáticas; el autor declara 92,3 % de media en 18 tareas, útil para prototipado rápido de taxonomías.
- Extracción clínica y de determinantes sociales: a partir de una nota clínica se evalúan afirmaciones como "El paciente está desempleado"; el autor declara 98,4 % en SDOH-NLI, aplicable a codificación y cribado de factores sociales.
- Verificación de hechos en redacción y periodismo: se contrastan afirmaciones con fuentes documentales de hasta 8.000 tokens para asignar una probabilidad de contradicción o neutralidad, con throughput de ~1.200 pares/s para procesar lotes grandes.
- Filtrado de candidatos en búsqueda semántica: como reranker cross-encoder, puntúa pares consulta-documento y reordena los resultados de un retriever bi-encoder en pipelines de recuperación de información.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados de forma independiente):

| Conjunto de evaluacion | Metrica | Valor |
|---|---|---|
| FineCat-NLI (test) | Accuracy | 0,8359 |
| MultiNLI (validation matched) | Accuracy | 0,9165 |
| MultiNLI (validation mismatched) | Accuracy | 0,9127 |
| SNLI (test) | Accuracy | 0,9328 |
| ANLI round 1 (test) | Accuracy | 0,7740 |
| ANLI round 2 (test) | Accuracy | 0,6020 |
| ANLI round 3 (test) | Accuracy | 0,5733 |
| WANLI (test) | Accuracy | 0,7674 |
| LingNLI (validation) | Accuracy | 0,8776 |
| Benchmark de 45 datasets NLI / zero-shot / grounding (macro average) | Macro accuracy | 0,8204 |

La model card cita además resultados de aplicaciones concretas: 97,7 % en intenciones MASSIVE, 0,81 de F1 en RAGTruth, 92,3 % en CrossingGuard, 94,3 % en insultos de Wikipedia, 92,3 % en 18 tareas zero-shot y 98,4 % en SDOH-NLI. El autor declara un throughput de aproximadamente 1.200 pares por segundo.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, aproximadamente 1,6 GB de pesos más activaciones; en BF16, alrededor de 0,8 GB de pesos. Con lotes grandes y secuencias de 8.000 tokens, las activaciones pueden elevar el consumo a varios GB.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para lotes pequeños; A100, H100 o L40S para maximizar throughput con lotes grandes y contexto largo.
- Cabe en GPU de consumo: sí, en RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4070, RTX 4080 y RTX 4090, incluso con secuencias largas y lotes moderados.
- Opciones de despliegue: sentence-transformers (CrossEncoder), Hugging Face Transformers, Text Embedding Inference (TEI) y vLLM no aplica (no es un modelo generativo); llama.cpp y Ollama no soportan de forma nativa este cross-encoder ModernBERT.
- Latencia y throughput: el autor declara ~1.200 pares/s; la latencia por par depende del hardware y de la longitud de secuencia, y no se detalla en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Skill Index (OpenNLI) | Accuracy media | Licencia |
|---|---|---|---|---|---|
| dleemiller/finecat-nli-ultra-l | 378M | no disponible | 58,6 | 0,8213 | no disponible |
| dleemiller/finecat-nli-v2-l | 395,8M | 8.000 tokens | no disponible | 0,8204 (macro, 45 datasets) | apache-2.0 |
| jhu-clsp/ettin-encoder-400m (base) | ~400M | no disponible | no disponible | no disponible | no disponible |

La model card incluye una comparativa en el leaderboard OpenNLI donde finecat-nli-ultra-l obtiene un Skill Index de 58,6 y una accuracy de 0,8213, con 378M de parámetros y 1.487 pares/s. No se dispone de datos comparativos de modelos de terceros (por ejemplo, DeBERTa-v3-large o BART-large-MNLI) en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés; no se ha validado su comportamiento en castellano ni en otros idiomas.
- Es un encoder de clasificación, no un modelo generativo: no produce texto, tool calling ni razonamiento multi-paso de forma nativa.
- Los resultados de benchmarks son declarados por el autor y no han sido verificados de forma independiente; el propio model-index marca las métricas como no verificadas.
- Riesgo de alucinación no aplica en el sentido generativo, pero el modelo puede asignar alta probabilidad de entailment a hipótesis plausibles pero falsas si la premisa es ambigua; conviene calibrar umbrales por dominio.
- Rendimiento notablemente inferior en ANLI rounds 2 y 3 (0,602 y 0,5733), lo que indica dificultad con inferencias de múltiples pasos y adversariales.
- La ventana de 8.000 tokens es menor que la de algunos encoders long-context; documentos más largos requieren truncado o fragmentación.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base Ettin-encoder-400m debe verificarse por separado; no se detallan restricciones adicionales en la información disponible.
- No se documentan sesgos específicos ni evaluaciones de robustez fuera de los conjuntos NLI estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dleemiller/finecat-nli-v2-l
- Demo en vivo (Space): https://huggingface.co/spaces/dleemiller/finecat-nli
- Leaderboard OpenNLI: https://huggingface.co/spaces/dleemiller/open-nli-leaderboard
- Dataset FineCat-NLI: https://huggingface.co/datasets/dleemiller/FineCat-NLI
- Dataset FineCat-NLI-Reason: https://huggingface.co/datasets/dleemiller/FineCat-NLI-Reason
- Modelo base Ettin-encoder-400m: https://huggingface.co/jhu-clsp/ettin-encoder-400m
- Dataset MultiNLI: https://huggingface.co/datasets/nyu-mll/multi_nli
- Dataset SNLI: https://huggingface.co/datasets/stanfordnlp/snli
- Dataset ANLI: https://huggingface.co/datasets/facebook/anli
- Dataset WANLI: https://huggingface.co/datasets/alisawuffles/WANLI
- Dataset LingNLI: https://huggingface.co/datasets/tasksource/lingnli
