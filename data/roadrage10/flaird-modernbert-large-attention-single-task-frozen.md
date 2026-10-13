# roadrage10/flaird-modernbert-large-attention-single-task-frozen

## Resumen

`flaird-modernbert-large-attention-single-task-frozen` es un modelo de clasificación de texto publicado por el usuario roadrage10 en Hugging Face. Se trata de un ajuste fino (fine-tuning) de un backbone ModernBERT-large, el encoder bidireccional de AnswerDotAI presentado en el paper "Smarter, Better, Faster, Longer" (arXiv:2412.13663), que moderniza la arquitectura BERT con embeddings rotatorios, atención alternando capas locales y globales y soporte nativo de secuencias largas. El modelo cuenta con 402.407.681 parámetros (aproximadamente 0,40 B) y está etiquetado para la tarea de text-classification.

El nombre del repositorio indica tres características del experimento: la variante "flaird" (metodología no documentada en la información disponible), el uso de atención como mecanismo específico ("attention", en contraste con el repositorio hermano basado en concatenación) y un backbone "frozen" (congelado) durante el ajuste fino. La model card no aclara qué capas permanecen congeladas ni sobre qué dataset se entrenó, por lo que buena parte de la ficha queda marcada como no disponible.

Su relevancia es limitada pero concreta: es un ejemplo de fine-tuning de un encoder pequeño y eficiente sobre una única tarea, con métricas de evaluación declaradas muy altas (F1 0,966, ROC-AUC 0,991) y un entrenamiento de una sola época. Con solo 3 descargas y 0 likes, no tiene validación comunitaria, lo que obliga a tratar sus resultados como declaraciones del autor y no como rendimiento verificado de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional (ModernBERT-large) con capas de atención alternando patrón local/global y embeddings rotatorios (RoPE); incluye código personalizado (`custom_code`) |
| Parametros totales | 402.407.681 (dato real de safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card; el backbone ModernBERT-large soporta hasta 8.192 tokens según el paper de referencia |
| Tipos de cuantizacion | No disponible (no se publican variantes GGUF, GPTQ ni AWQ). El tamaño del repo (1,7 GB) es coherente con pesos en fp32 para 402 M de parámetros |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (con `custom_code`, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

La arquitectura de partida es ModernBERT-large: un encoder transformer bidireccional de tipo BERT con mejoras modernas, entre ellas rotary positional embeddings en lugar de embeddings posicionales absolutos, capas de atención alternando atención local (ventanas cortas) y atención global, y kernels optimizados para Flash Attention. El ajuste se realizó con OptimizerNames.ADAMW_TORCH_FUSED (betas 0,9 y 0,999, epsilon 1e-08), learning rate de 2e-5, scheduler coseno con warmup del 6 % de los pasos, batch de 256 tanto en entrenamiento como en evaluación, semilla 42 y una sola época, lo que supone un total de 19.836 pasos de optimización. El entrenamiento se ejecutó con Transformers 5.16.1, PyTorch 2.11.0+cu128, Datasets 4.0.0 y Tokenizers 0.23.1.

No se especifica el dataset de entrenamiento ni su composición (la model card indica "unknown dataset" y "More information needed" en las secciones de datos y usos previstos). Tampoco se documenta si hubo fases de RLHF, DPO u otro ajuste posterior, ni qué significa exactamente el calificador "frozen" más allá de la interpretación habitual de backbone congelado con un cabezal de clasificación entrenable. La innovación declarada es, por tanto, la combinación del backbone ModernBERT con el esquema de adaptación "flaird", cuya definición no aparece en la información disponible.

## Capacidades

- Clasificación de texto (pipeline `text-classification`) sobre una única tarea concreta, no especificada en la model card.
- Producción de una puntuación escalar o vector de logits explotable como score de probabilidad o de similitud, dado el uso declarado de métricas como ROC-AUC, Brier y C@1.
- Procesamiento de secuencias largas si se respeta la ventana del backbone (hasta 8.192 tokens en ModernBERT-large; no confirmado en la model card).
- Evaluación con métricas de la familia C@1 y F05u, asociadas habitualmente a tareas de respuesta a preguntas y detección de respuestas correctas, lo que sugiere un uso orientado a selección o verificación de respuestas.
- No es un modelo generativo: no produce texto libre, por lo que no soporta chat, instrucciones abiertas ni decodificación autoregresiva.
- No hay evidencia de soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (modo thinking, visión, audio): ninguna declarada.

## Casos de uso

- Moderación de contenido y filtrado de comentarios: al ser un clasificador de 0,40 B, puede ejecutarse sobre cada mensaje entrante en tiempos de milisegundos en GPU o incluso en CPU, etiquetando toxicidad, spam o categoría temática antes de publicar.
- Selección de respuestas en sistemas de QA: las métricas C@1 y F05u declaradas son típicas de tareas de elección de respuesta correcta, por lo que el modelo encaja como reranker de candidatos generados por un LLM mayor.
- Enrutado de tickets de soporte: clasificación de consultas entrantes en categorías (facturación, técnico, comercial) para derivarlas al equipo adecuado, aprovechando el bajo coste por inferencia frente a un modelo generativo.
- Clasificación de documentos largos: si se confirma la ventana de 8.192 tokens del backbone, permite etiquetar contratos, informes o artículos completos sin truncado agresivo.
- Detección de fraude o riesgo en textos cortos: puntuación de probabilidad por ejemplo para scoring de reseñas falsas, reclamaciones anómalas o mensajes sospechosos, usando el score continuo en lugar de solo la etiqueta.
- Anotación a escala de corpus de investigación: al caber en una GPU de consumo, se puede desplegar en pipelines de etiquetado masivo (millones de documentos) con coste reducido.
- Componente base para destilación o comparación de metodologías: útil como referencia en experimentos que comparen estrategias de adaptación (por ejemplo, "attention" frente a "concatenation" en el repositorio hermano del mismo autor).

## Benchmarks y rendimiento

El campo `model-index` del repositorio está vacío (`results: []`), por lo que no hay benchmarks verificados publicados. Los únicos datos disponibles son las métricas de validación declaradas por el autor durante el entrenamiento:

| Paso | Época | Validation loss | ROC-AUC | Brier | C@1 | F1 | F05u | Mean |
|---|---|---|---|---|---|---|---|---|
| 1984 | 0,10 | 0,0149 | 0,964 | 0,929 | 0,912 | 0,953 | 0,978 | 0,947 |
| 5952 | 0,30 | 0,0107 | 0,982 | 0,956 | 0,941 | 0,969 | 0,986 | 0,967 |
| 9920 | 0,50 | 0,0087 | 0,987 | 0,948 | 0,920 | 0,957 | 0,982 | 0,959 |
| 13888 | 0,70 | 0,0078 | 0,990 | 0,955 | 0,935 | 0,965 | 0,985 | 0,966 |
| 17856 | 0,90 | 0,0073 | 0,991 | 0,959 | 0,939 | 0,968 | 0,986 | 0,969 |
| 19836 | 1,00 | 0,0073 | 0,991 | 0,956 | 0,936 | 0,966 | 0,985 | 0,967 |

Resultados finales declarados en la evaluación: loss 0,0073, ROC-AUC 0,991, Brier 0,956, C@1 0,936, F1 0,966, F05u 0,985, media 0,967. No se incluyen comparaciones con otros modelos ni resultados en conjuntos de test independientes (MMLU, GLUE, HumanEval, GSM8K u otros no aplican a un clasificador de este tipo). No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 1,6 GB en fp32 (402 M de parámetros), aproximadamente 0,8 GB en fp16/bf16 y en torno a 0,4 GB en int8 dinámico. No hay cuantizaciones publicadas por el autor.
- GPU recomendadas: cualquier GPU moderna es suficiente; el modelo cabe holgadamente en una RTX 3060, RTX 4090, L4, A10, A100 o H100. No requiere tensor parallelism ni sharding.
- GPU de consumo: sí, cabe en prácticamente cualquier GPU con 4 GB o más de VRAM, e incluso puede ejecutarse en CPU con latencias aceptables para lotes pequeños.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (obligatorio por el código personalizado), Text Generation Inference en modo clasificación, vLLM (soporte de tareas de clasificación/pooling), ONNX Runtime o TorchScript tras exportación propia. No hay pesos GGUF publicados, por lo que llama.cpp y Ollama no son utilizables sin conversión manual.
- Latencia y throughput: no se han publicado mediciones. Al tratarse de un encoder de 0,40 B con batches de 256 en evaluación, se espera un throughput alto en GPU moderna, pero cualquier cifra concreta sería una estimación no verificada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| flaird-modernbert-large-attention-single-task-frozen | 402 M | No disponible (backbone: 8.192) | Clasificación, tarea única | No disponible | Hugging Face, 3 descargas |
| roadrage10/flaird-modernbert-large-concatenation-single-task-frozen | No disponible | No disponible | Clasificación, tarea única (variante por concatenación) | No disponible | Hugging Face (mismo autor) |
| answerdotai/ModernBERT-large (base) | ~395 M | 8.192 tokens | Encoder bidireccional preentrenado | Apache-2.0 según su repositorio | Hugging Face, ampliamente descargado |
| answerdotai/ModernBERT-base (base) | ~149 M | 8.192 tokens | Encoder bidireccional preentrenado | Apache-2.0 según su repositorio | Hugging Face |
| microsoft/deberta-v3-large | ~435 M | 512 tokens | Encoder con atención desenredada | MIT según su model card | Hugging Face |
| FacebookAI/roberta-large | ~355 M | 512 tokens | Encoder bidireccional | MIT según su model card | Hugging Face |

No se dispone de comparaciones de rendimiento entre este modelo y las alternativas: el autor no publica cifras frente a terceros y las tareas concretas de cada checkpoint no son equivalentes. Las licencias de los modelos de referencia deben verificarse en sus respectivas model cards antes de uso comercial.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no hay permiso claro de uso comercial, redistribución ni modificación; hay que contactar con el autor antes de integrarlo en producción.
- Dataset de entrenamiento desconocido: no se puede auditar la composición de los datos, por lo que los sesgos potenciales (de género, raza, idioma, dominio) son imposibles de evaluar y pueden ser severos.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de falsos positivos y falsos negativos; en tareas de moderación o scoring de riesgo esto puede tener consecuencias reales.
- Calibración dudosa: los valores de Brier declarados (en torno a 0,95) son anómalamente altos para un ROC-AUC de 0,991, lo que sugiere que la métrica se reporta en una escala distinta o que las probabilidades están mal calibradas. No conviene usar los scores brutos como probabilidades sin recalibración.
- Código personalizado (`custom_code`) obligatorio: implica ejecutar código remoto con `trust_remote_code=True`, lo que supone un riesgo de seguridad en entornos no confiables.
- Entrenamiento de una sola época y backbone congelado: poca capacidad de generalización fuera de la distribución de validación, y una reutilización limitada para otras tareas sin un nuevo ajuste fino.
- Tarea única y no documentada: no se especifica qué clasifica exactamente el modelo, por lo que no se puede evaluar su idoneidad para un caso de uso concreto sin probarlo.
- Idiomas soportados no declarados: no hay garantía de rendimiento fuera del idioma o idiomas del dataset de entrenamiento.
- Madurez mínima: 3 descargas, 0 likes y ninguna validación de la comunidad; no existen third-party evaluations ni reportes de fallos.
- Formatos limitados: al no haber GGUF ni cuantizaciones publicadas, el despliegue en entornos de solo CPU o embebidos requiere conversión manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/roadrage10/flaird-modernbert-large-attention-single-task-frozen
- Variante por concatenación del mismo autor: https://huggingface.co/roadrage10/flaird-modernbert-large-concatenation-single-task-frozen
- Perfil del autor: https://huggingface.co/roadrage10
- Paper de ModernBERT (arXiv:2412.13663): https://arxiv.org/abs/2412.13663
- Repositorio oficial de ModernBERT (AnswerDotAI): https://github.com/AnswerDotAI/ModernBERT
- Ficha de registro en free2aitools: https://free2aitools.com/model/yusr9/flaird-modernbert-large-attention-single-task-frozen
