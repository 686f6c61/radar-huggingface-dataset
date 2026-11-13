# KretliJ/bertabaporu-sabia4-sentiment

## Resumen

bertabaporu-sabia4-sentiment es un modelo de clasificación de sentimiento en tres clases (POSITIVE / NEUTRAL / NEGATIVE) para portugués brasileño informal, desarrollado por Jonas Kretli. Se trata de un fine-tuning del encoder BERTabaporu-large-uncased (335M parámetros base, 369,4M en el checkpoint final) sobre 1.000 comentarios de Reddit anotados automáticamente por Sabiá-4 de Maritaca AI, que actúa como fuente de verdad (ground truth).

El modelo aborda un problema concreto: la clasificación de polaridad en texto coloquial de redes sociales, donde los corpus formales no capturan bien la ironía, el registro coloquial ni las convenciones de Reddit. Al entrenarse sobre ese dominio específico, el autor declara una mejor adaptación que los modelos entrenados sobre corpus formales, con un F1-macro de 0,8286 en el fold campeón sobre 200 muestras retenidas.

Es relevante por su enfoque de destilación desde un LLM anotador (Sabiá-4) hacia un encoder compacto, lo que permite despliegue de bajo coste con latencia mínima en comparación con un LLM generativo. No es un modelo generativo: es un clasificador de secuencia con ventana de 256 tokens y licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT, variante BERTabaporu-large-uncased) |
| Parametros totales | 369.426.435 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens (max_length de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32/fp16 según checkpoint) |
| Idiomas soportados | pt (portugués, con foco en portugués brasileño) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder tipo BERT large (uncased) adaptado al portugués brasileño por el modelo base pablocosta/bertabaporu-large-uncased. Sobre esa base se añade una cabeza de clasificación de tres clases. El checkpoint final tiene 369,4M parámetros y el repositorio ocupa 1,5 GB.

El entrenamiento usa 1.000 comentarios de Reddit anotados por Sabiá-4 con una rúbrica estricta de "postura del autor", con un acuerdo inter-anotador del 68,9% frente a etiquetas humanas (κ ≈ 0,50). Se aplicó validación cruzada estratificada de 5 folds con semilla 42, y se seleccionó el fold 3 como campeón por F1-macro (0,829); los F1-macro por fold fueron 0,748 / 0,711 / 0,829 / 0,774 / 0,688. Los hiperparámetros: 5 épocas, batch efectivo 8 (4×2 con acumulación de gradiente), learning rate 2e-05, max_length 256, weight decay 0,01, early stopping con paciencia 2. Se aplicaron pesos de clase por frecuencia inversa para compensar el dominio de NEUTRAL, lo que elevó el recall de POSITIVE de ~0,52 a 0,78. No se menciona RLHF ni DPO; el proceso es supervisión clásica sobre etiquetas generadas por LLM.

## Capacidades

- Clasificación de sentimiento en tres clases (POSITIVE, NEUTRAL, NEGATIVE) sobre texto en portugués brasileño.
- Procesamiento de texto informal de redes sociales: comentarios de Reddit, lenguaje coloquial, construcciones irónicas.
- Manejo de entradas de hasta 256 tokens (truncado automático vía tokenizer).
- Inferencia por lotes mediante pipeline de Transformers o script PyTorch incluido en el repositorio.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un clasificador, no un modelo generativo.
- No soporta agentes, visión, audio ni modo thinking.
- Capacidad multilingüe limitada al portugués; el modelo base es uncased y específico de pt-BR.

## Casos de uso

- Moderación de comunidades en línea: clasificar automáticamente comentarios de foros y redes en positivos, neutros y negativos para priorizar revisiones humanas, aprovechando el dominio Reddit del entrenamiento.
- Monitorización de reputación de marca en portugués brasileño: procesar menciones y comentarios en redes sociales para agregar polaridad por producto o campaña, con un encoder de 369M que permite throughput alto en CPU o GPU modesta.
- Análisis de opinión en investigación social: etiquetar corpus de discurso político o debates (el dataset incluye r/NoticiasBR, r/OpiniaoBurra y r/DebatesBR) para estudios cuantitativos de polarización.
- Enriquecimiento de pipelines de datos: añadir una columna de sentimiento a datasets de comentarios antes de análisis posteriores, con integración directa vía pipeline de Hugging Face.
- Filtrado previo en sistemas de atención al cliente: detectar automáticamente comentarios negativos en canales informales para escalado a agentes humanos, con latencia de milisegundos por muestra.
- Etiquetado asistido en anotación humana: usar las predicciones como pre-etiquetas en flujos de anotación, dado el κ ≈ 0,57 frente a su profesor Sabiá-4, comparable al acuerdo profesor-humano (κ ≈ 0,50).
- Detección de toxicidad adyacente: aunque no es su tarea principal, la clase NEGATIVE captura contenido de valencia negativa que puede servir como señal preliminar en sistemas de moderación.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre el fold campeón con 200 muestras retenidas:

| Metrica | Valor |
|---|---|
| Accuracy | 0,820 |
| F1-macro | 0,8286 |
| F1-micro | 0,820 |
| Precision-macro | 0,8244 |
| Recall-macro | 0,8340 |
| AUC-macro-OvR | 0,9204 |

Evaluación en datos no vistos frente a Sabiá-4 (1.000 comentarios, semilla 42, sin solapamiento con entrenamiento):

| Metrica | Valor |
|---|---|
| Accuracy | 0,7620 |
| F1-macro | 0,7207 |
| F1-micro | 0,7620 |
| Cohen's kappa | 0,5733 |

Rendimiento por clase (referencia Sabiá-4):

| Clase | Precision | Recall | F1 |
|---|---|---|---|
| POSITIVE | 0,5140 | 0,7971 | 0,6250 |
| NEUTRAL | 0,8173 | 0,7827 | 0,7996 |
| NEGATIVE | 0,7521 | 0,7233 | 0,7374 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: ~1,5 GB en fp32 para los pesos (369M parámetros); ~750 MB en fp16; ~400 MB en int8.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para fp16 (GTX 1650, RTX 3050, T4). Para inferencia por lotes de alto throughput, A10, L4 o A100.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 3060 en adelante con margen amplio); también es viable en CPU para lotes pequeños.
- Opciones de despliegue: pipeline de Transformers, TorchScript, ONNX Runtime, TGI (Text Generation Inference no aplica; usar Text Embeddings Inference o un servidor FastAPI propio), vLLM no aplica a clasificadores encoder. llama.cpp y Ollama no soportan este formato de forma nativa.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera latencia de milisegundos por muestra en GPU y decenas de milisegundos en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bertabaporu-sabia4-sentiment | 369M | 256 tokens | Clasificación de sentimiento pt-BR (3 clases) | MIT | Hugging Face |
| pablocosta/bertabaporu-large-uncased | ~335M | 512 tokens (BERT estándar) | Modelo base encoder pt-BR | no disponible en la información | Hugging Face |
| Sabiá-4 (Maritaca AI) | no disponible | no disponible | LLM generativo pt-BR, usado como anotador | no disponible en la información | no disponible |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que no es posible una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Entrenado sobre texto estilo Reddit en portugués brasileño; la prosa formal puede desplazar la frontera entre POSITIVE y NEGATIVE.
- La clase NEUTRAL es amplia por diseño (contenido objetivo/factual o valencia mixta sin polaridad dominante), lo que absorbe mucho contenido limítrofe y reduce la utilidad de la distinción en casos ambiguos.
- Brecha de destilación: κ ≈ 0,575 frente a su profesor Sabiá-4 en datos no vistos, comparable al acuerdo profesor-humano (κ ≈ 0,50), lo que indica un techo de calidad heredado del anotador.
- El ground truth son etiquetas generadas por un LLM, no anotación humana directa; los errores sistemáticos de Sabiá-4 se propagan al modelo.
- Ventana limitada a 256 tokens: documentos largos se truncan y pueden perder contexto relevante.
- Solo portugués; no se ha evaluado en otros idiomas ni en variantes europeas del portugués.
- Precisión baja en POSITIVE (0,5140) en datos no vistos: la clase positiva genera falsos positivos con frecuencia, lo que desaconseja su uso en decisiones automatizadas sensibles sin revisión humana.
- Licencia MIT: permite uso comercial sin restricciones, pero el autor pide citar el modelo y el modelo base.
- Sin descargas ni likes en el momento de la ficha: no hay validación comunitaria ni reportes independientes de uso en producción.
- No hay resultados de benchmarks verificados; todas las métricas son declaradas por el autor.

## Enlaces

- Hugging Face: https://huggingface.co/KretliJ/bertabaporu-sabia4-sentiment
- Modelo base: https://huggingface.co/pablocosta/bertabaporu-large-uncased
- Anotador (Sabiá-4, Maritaca AI): no disponible en la información proporcionada
- Paper o blog del modelo: no disponible en la información proporcionada
- Repositorio de código: no disponible en la información proporcionada (se menciona `example.py` dentro del propio repositorio de Hugging Face)
