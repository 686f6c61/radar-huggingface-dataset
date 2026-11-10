# dleemiller/AbsoluteZero-nli-2b

## Resumen

AbsoluteZero-nli-2b es un modelo cross-encoder especializado en inferencia de lenguaje natural (NLI) desarrollado por el usuario dleemiller. Se construye sobre el modelo base Qwen/Qwen3.5-2B mediante ajuste fino y destilación de conocimiento, y su función es recibir un par formado por un texto (premisa) y una afirmación (hipótesis) y devolver probabilidades calibradas de que el texto implique, contradiga o sea neutral respecto a la afirmación. Con 1.881.837.376 parámetros, resuelve tareas de clasificación zero-shot, verificación de hechos y detección de alucinaciones en pipelines RAG.

La innovación principal del modelo es el llamado "think mode": además de una pasada directa con cabeza clasificadora (modo rápido, similar a un cross-encoder clásico), puede generar una traza de razonamiento corta (unas 55 fichas de media en ANLI, unas 220 en problemas de lógica de primer orden) que la cabeza de puntuación lee para emitir el veredicto. Esto aporta observabilidad sobre el motivo de la clasificación, algo que los encoders zero-shot habituales no ofrecen.

El modelo es relevante ahora porque cubre necesidades concretas de producción en sistemas RAG y de moderación: verificar que una respuesta generada está respaldada por los pasajes recuperados, clasificar mensajes contra políticas y revisar contratos. Se distribuye con licencia Apache-2.0 y admite documentos de hasta 32k fichas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder sobre Qwen3.5 (qwen3_5_text) con cabeza clasificadora; requiere custom_code |
| Parametros totales | 1.881.837.376 (1,88B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 32k fichas para documentos |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (repo de 3,8 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-2B, un transformer de la familia Qwen3.5, y se adapta como cross-encoder para NLI. La arquitectura combina dos modos de inferencia sobre el mismo backbone: un modo rápido que realiza una única pasada hacia delante y aplica una cabeza clasificadora, y un modo think en el que el modelo genera una traza de razonamiento breve antes de que la cabeza de puntuación lea esa traza y emita el veredicto. La model card etiqueta el modelo con las técnicas de destilación de conocimiento y GRPO (Group Relative Policy Optimization), lo que sugiere que el ajuste combinó supervisión sobre trazas razonadas y optimización por refuerzo.

El entrenamiento se apoya en los datasets propios dleemiller/FineCat-NLI y dleemiller/FineCat-NLI-Reason, este último orientado a las trazas de razonamiento. La evaluación extendida abarca 45 conjuntos de datos de NLI, zero-shot y grounding, lo que indica una cobertura amplia de dominios y formatos de tarea. No se dispone de datos sobre el número exacto de tokens de entrenamiento ni sobre la composición detallada del dataset más allá de las referencias anteriores.

## Capacidades

- Clasificación NLI de tres vías: implicación (entailment), contradicción y neutralidad, con probabilidades calibradas.
- Clasificación zero-shot y etiquetado de textos mediante hipótesis generadas dinámicamente ("Este texto trata sobre X").
- Modo rápido (una pasada, baja latencia) y modo think (traza de razonamiento para casos difíciles: lógica multietapa, cuantificadores, negación, contratos y políticas largas).
- Detección de alucinaciones y verificación de groundedness en respuestas generadas por LLM.
- Verificación de hechos (fact-checking) contra fuentes de referencia.
- Moderación y guardrails: comprobación de mensajes contra afirmaciones de política.
- Extracción clínica y revisión de contratos mediante pares nota/afirmación o contrato/afirmación.
- Observabilidad del razonamiento: las trazas permiten inspeccionar por qué el modelo clasificó de una manera y ajustar las hipótesis.
- Soporte de documentos largos de hasta 32k fichas.
- No dispone de tool calling ni de capacidades de agente; es un modelo de clasificación, no un generador conversacional.

## Casos de uso

- Grounding en pipelines RAG: dado un conjunto de pasajes recuperados y la respuesta generada por un LLM, el modelo puntúa si cada afirmación está respaldada por los pasajes; con 85,8% en RAGTruth, sirve como filtro automático antes de mostrar la respuesta al usuario.
- Detección de alucinaciones en producción: se compara la salida del generador con las fuentes y se marca como no respaldada cualquier afirmación con baja probabilidad de implicación, activando una revisión o una regeneración.
- Moderación y guardrails: se contrasta cada mensaje de usuario contra afirmaciones de política ("Este mensaje contiene una amenaza", "Esta solicitud pide datos personales") y se obtiene una probabilidad calibrada que alimenta el sistema de decisión; el 92,1% en CrossingGuard respalda este uso.
- Clasificación zero-shot de tickets y reseñas: etiquetar textos en categorías definidas en tiempo de inferencia (facturación, envío, acceso a cuenta) sin reentrenamiento, como muestra el ejemplo de la model card con probabilidades de 0,976 frente a 0,002.
- Revisión de contratos y políticas: comprobar si un contrato implica afirmaciones concretas ("El acuerdo permite compartir datos con terceros") con un 92,6% en ContractNLI, útil para extracción y auditoría documental.
- Extracción clínica estructurada: verificar afirmaciones sobre notas clínicas (por ejemplo, situación laboral del paciente) con un 98,3% en SDOH-NLI, para poblar registros estructurados.
- Verificación de hechos en redacciones o sistemas de alertas: contrastar afirmaciones con textos de referencia y usar el modo think en los casos ambiguos para obtener una traza inspeccionable.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Conjunto de evaluacion | Metrica | Valor |
|---|---|---|
| FineCat-NLI (test) | Accuracy | 0,8412 |
| MultiNLI (validation matched) | Accuracy | 0,913 |
| MultiNLI (validation mismatched) | Accuracy | 0,9148 |
| SNLI (test) | Accuracy | 0,9335 |
| ANLI round 1 (test) | Accuracy | 0,785 |
| ANLI round 2 (test) | Accuracy | 0,647 |
| ANLI round 3 (test) | Accuracy | 0,6033 |
| WANLI (test) | Accuracy | 0,7662 |
| LingNLI (validation) | Accuracy | 0,8739 |
| Benchmark de 45 conjuntos NLI / zero-shot / grounding (media macro) | Accuracy | 0,8264 |

Resultados de aplicaciones citados en la model card (modo rápido): 92,6% en zero-shot meta sobre 18 tareas, 85,8% en RAGTruth, 92,1% en CrossingGuard, 98,3% en SDOH-NLI y 92,6% en ContractNLI. El autor sitúa el modelo en el puesto número 2 del OpenNLI Skill Index a fecha 11-09-26 en modo rápido.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16, los 1,88B parámetros ocupan aproximadamente 3,8 GB de pesos, más memoria para activaciones y contexto; con 32k fichas de contexto la huella crece de forma notable. En cuantización de 8 bits se reduce a unos 2 GB y en 4 bits a alrededor de 1 GB, aunque no se han publicado cuantizaciones oficiales.
- GPU recomendadas: para contexto corto y modo rápido, una RTX 4090 o incluso una RTX 3090 es suficiente; para lotes grandes o contexto de 32k conviene una A100 o H100.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en fp16 para contexto moderado, y en tarjetas de 4-6 GB con cuantización.
- Opciones de despliegue: sentence-transformers con CrossEncoder y trust_remote_code=True (vía oficial documentada); al requerir código personalizado, la integración con vLLM, llama.cpp, Ollama o TGI no está garantizada y no se documenta en la información disponible.
- Latencia y throughput: no disponibles. El modo think incrementa la latencia al generar trazas de aproximadamente 55 fichas de media en ANLI y 220 en lógica de primer orden.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Notas |
|---|---|---|---|---|---|
| AbsoluteZero-nli-2b | 1,88B | 32k | Cross-encoder NLI con modo think | Apache-2.0 | Resultados propios en 45 conjuntos; trazas observables |
| Cross-encoders NLI tipo DeBERTa (p. ej. MoritzLaurer) | ~0,1-0,4B | 512 | Cross-encoder NLI clasico | MIT/Apache-2.0 | Sin trazas de razonamiento ni contexto largo |
| Modelos NLI basados en LLM generativo (p. ej. variantes de 7-8B) | 7-8B | 8k-32k | Generacion con veredicto textual | Variables | Mayor coste de inferencia; sin cabeza calibrada por defecto |

No se dispone de comparaciones directas publicadas con estos modelos en los mismos conjuntos de evaluación dentro de la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés; no hay evidencia de rendimiento en castellano ni en otros idiomas.
- El rendimiento cae de forma marcada en NLI adversarial: 64,7% en ANLI r2 y 60,3% en ANLI r3, frente a más del 91% en MultiNLI; conviene usar el modo think en esos casos.
- Riesgo de calibración deficiente fuera de los dominios de entrenamiento: las probabilidades pueden no estar bien calibradas en textos muy distintos a los del dataset.
- Requiere trust_remote_code=True y código personalizado, lo que añade superficie de riesgo en producción y complica el despliegue con servidores de inferencia estándar.
- Los benchmarks son declarados por el autor y no están verificados de forma independiente (verified: false en la model card).
- Es un modelo de clasificación, no un generador: no debe usarse para redactar respuestas ni para conversación; su salida es una puntuación de implicación.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen3.5-2B puede tener sus propias condiciones que conviene revisar.
- Sesgos: no se documentan análisis de sesgo; al entrenarse sobre datasets NLI mayoritariamente en inglés, puede heredar sesgos de esos corpus.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dleemiller/AbsoluteZero-nli-2b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Dataset FineCat-NLI: https://huggingface.co/datasets/dleemiller/FineCat-NLI
- Dataset FineCat-NLI-Reason: https://huggingface.co/datasets/dleemiller/FineCat-NLI-Reason
- Dataset MultiNLI: https://huggingface.co/datasets/nyu-mll/multi_nli
- Dataset SNLI: https://huggingface.co/datasets/stanfordnlp/snli
- Dataset ANLI: https://huggingface.co/datasets/facebook/anli
- Dataset WANLI: https://huggingface.co/datasets/alisawuffles/WANLI
- Dataset LingNLI: https://huggingface.co/datasets/tasksource/lingnli
