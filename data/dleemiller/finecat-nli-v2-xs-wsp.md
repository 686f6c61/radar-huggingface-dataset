# dleemiller/finecat-nli-v2-xs-wsp

## Resumen

FineCat-NLI v2 Extra Small — WSP edit es un cross-encoder de inferencia de lenguaje natural (NLI) desarrollado por dleemiller, construido sobre el modelo base dleemiller/finecat-nli-v2-xs y derivado de la familia ModernBERT/Ettin. Con 32 millones de parámetros, recibe un par premisa-hipótesis y devuelve probabilidades calibradas de implicación (entailment), contradicción (contradiction) y neutralidad (neutral). Su función práctica es actuar como clasificador de referencia para tareas de grounding en RAG, detección de alucinaciones, fact-checking y clasificación zero-shot.

La variante "WSP" (weight-space programming) aplica una edición de pesos sin gradientes: solo se modifican las filas del clasificador y se incorpora una temperatura calibrada, manteniendo idénticos el resto de pesos respecto al modelo base. Según el autor, el OpenNLI Skill Index pasa de 0.3912 a 0.3943 y el error de calibración de 9.6 a 9.5, por lo que la mejora es marginal y el modelo se declara explícitamente experimental.

Es relevante para desarrolladores que necesitan un verificador de fidelidad barato y rápido dentro de pipelines RAG: 32M de parámetros, documentos de hasta 8k tokens, unas 14.500 parejas por segundo y licencia Apache-2.0. No es un modelo generativo, sino un componente de clasificación que se inserta entre el recuperador y el generador para validar afirmaciones contra el contexto recuperado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT / Ettin), cross-encoder para NLI |
| Parametros totales | 32.032.131 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | hasta 8k tokens por documento |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un cross-encoder basado en ModernBERT en su variante extra small (familia Ettin), con una cabeza de clasificación de tres clases para NLI. Procesa conjuntamente premisa e hipótesis en una sola pasada del encoder, lo que permite modelar interacciones token a token entre ambas secuencias, a diferencia de los bi-encoders que comparan embeddings independientes. Soporta entradas de hasta 8k tokens.

El entrenamiento parte del modelo dleemiller/finecat-nli-v2-xs y utiliza los datasets dleemiller/FineCat-NLI y dleemiller/FineCat-NLI-Reason, con señales de MNLI, SNLI y ANLI según las etiquetas del repositorio. La innovación destacable es la edición de pesos por weight-space programming: un agente LLM modificó directamente los pesos a partir de lecturas de forward-pass, sin entrenamiento por gradientes, limitando el cambio a las filas del clasificador y plegando una temperatura calibrada. No se documentan en la información disponible detalles sobre número de tokens de entrenamiento, composición exacta del dataset ni uso de RLHF o DPO.

## Capacidades

- Inferencia de lenguaje natural (NLI) de tres clases: entailment, contradiction y neutral, con probabilidades calibradas.
- Clasificación zero-shot mediante plantillas de hipótesis ("This text is about {label}.").
- Detección de alucinaciones y verificación de groundedness en respuestas generadas frente a pasajes recuperados.
- Fact-checking y comprobación de afirmaciones contra fuentes.
- Reranking de pasajes en pipelines RAG.
- Routing y triaje de peticiones por intención.
- Guardrails y moderación comparando mensajes con enunciados de política.
- Extracción de información clínica y de determinantes sociales de la salud (SDOH) mediante hipótesis.
- Procesamiento de documentos largos de hasta 8k tokens.
- Solo inglés; no se declara soporte multilingüe ni tool calling, agentes o modos de razonamiento, al ser un clasificador y no un modelo generativo.

## Casos de uso

- Grounding en RAG: insertar el cross-encoder entre el recuperador y el generador para puntuar si cada pasaje recuperado implica la afirmación generada, y descartar o marcar respuestas no respaldadas antes de mostrarlas al usuario.
- Detección de alucinaciones en producción: comparar la respuesta del LLM con las fuentes citadas y activar una revisión o un mensaje de cautela cuando la probabilidad de entailment caiga por debajo de un umbral calibrado.
- Clasificación zero-shot de tickets de soporte: generar una hipótesis por categoría ("This text is about billing.") y elegir la de mayor probabilidad de implicación, sin entrenar un clasificador específico.
- Moderación y guardrails: evaluar mensajes de usuario contra enunciados de política y bloquear o escalar los que impliquen violaciones, con la ventaja de que las políticas se actualizan cambiando solo el texto de la hipótesis.
- Fact-checking editorial: verificar afirmaciones de borradores contra un corpus de referencia y señalar contradicciones o falta de respaldo.
- Reranking de resultados de búsqueda: reordenar los documentos recuperados por un bi-encoder según la probabilidad de que impliquen la consulta reformulada como hipótesis.
- Extracción estructurada en dominios regulados: comprobar hipótesis clínicas o administrativas sobre notas (por ejemplo, situación laboral del paciente) con alta precisión declarada en SDOH-NLI.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Dataset | Metrica | Valor |
|---|---|---|
| FineCat-NLI (test) | Accuracy | 0.7595 |
| MultiNLI (validation matched) | Accuracy | 0.8155 |
| MultiNLI (validation mismatched) | Accuracy | 0.8186 |
| SNLI (test) | Accuracy | 0.8837 |
| ANLI round 1 (test) | Accuracy | 0.5840 |
| ANLI round 2 (test) | Accuracy | 0.4610 |
| ANLI round 3 (test) | Accuracy | 0.4542 |
| WANLI (test) | Accuracy | 0.6818 |
| LingNLI (validation) | Accuracy | 0.7373 |
| Benchmark agregado de 45 datasets (media macro) | Macro accuracy | 0.7268 |

El autor reporta además OpenNLI Skill Index de 0.3912 a 0.3943 y error de calibración de 9.6 a 9.5 tras la edición WSP, así como cifras de aplicaciones concretas (0.73 F1 en RAGTruth, 95.3% en intenciones MASSIVE, 89.7% en CrossingGuard, 86.7% en 18 tareas zero-shot y 97.0% en SDOH-NLI) sin desglose detallado en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (32M de parámetros, unos 128 MB de pesos) y en torno a 200-400 MB con overhead de activaciones y batch; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; para máximo throughput, A100, H100 o L40S. En RTX 4090, RTX 3090 o incluso GPUs integradas es viable.
- Cabe en GPU consumer: sí, en todas las gamas actuales y en muchas integradas; también puede ejecutarse en CPU con rendimiento aceptable para lotes moderados.
- Opciones de despliegue: sentence-transformers (CrossEncoder), Hugging Face Transformers, Text Embedding Inference (TEI) y ONNX Runtime; no se documentan pesos GGUF para llama.cpp u Ollama.
- Latencia y throughput: el autor declara aproximadamente 14.500 parejas por segundo, lo que sitúa la latencia por pareja en el orden de decenas de microsegundos en hardware adecuado y batching.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| finecat-nli-v2-xs-wsp | 32M | 8k | Cross-encoder NLI ModernBERT | Apache-2.0 | Hugging Face |
| dleemiller/finecat-nli-v2-xs | 32M | 8k | Cross-encoder NLI ModernBERT (base sin edición WSP) | Apache-2.0 | Hugging Face |
| DeBERTa-v3-base MNLI | ~86M | 512 | Cross-encoder NLI | MIT | Hugging Face |
| BART-large MNLI | ~406M | 1024 | Seq2seq fine-tuneado para NLI | MIT | Hugging Face |

La comparativa con alternativas de tamaño equivalente se limita al modelo base del que deriva; no se dispone en la información proporcionada de resultados de benchmarks de terceros para una comparación cuantitativa directa.

## Limitaciones y advertencias

- Modelo marcado como experimental por el autor: la edición WSP aporta mejoras marginales (Skill Index +0.0031, error de calibración -0.1) y no debe asumirse como una mejora sustancial.
- Solo inglés: no hay soporte multilingüe declarado, lo que limita su uso en productos en castellano sin un modelo alternativo.
- Rendimiento bajo en ANLI rounds 2 y 3 (0.4610 y 0.4542), lo que indica dificultad con inferencias adversariales o de razonamiento complejo.
- Riesgo de falsos negativos en grounding: un entailment bajo no implica necesariamente alucinación si el contexto está parafraseado o requiere inferencia multi-paso.
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento agéntico.
- Sesgos heredados de los datasets de entrenamiento (MNLI, SNLI, ANLI) y de la composición de FineCat-NLI, no documentada en detalle.
- Calibración declarada pero no verificada de forma independiente; conviene recalibrar umbrales sobre el dominio propio antes de usarlo en guardrails.
- Licencia Apache-2.0 permite uso comercial, pero no se ofrece garantía ni soporte del autor.
- No se documentan cuantizaciones oficiales (GGUF, AWQ, GPTQ) ni resultados de benchmarks de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dleemiller/finecat-nli-v2-xs-wsp
- Modelo base: https://huggingface.co/dleemiller/finecat-nli-v2-xs
- Demo en vivo (Space): https://huggingface.co/spaces/dleemiller/finecat-nli
- Dataset FineCat-NLI: https://huggingface.co/datasets/dleemiller/FineCat-NLI
- Dataset FineCat-NLI-Reason: https://huggingface.co/datasets/dleemiller/FineCat-NLI-Reason
