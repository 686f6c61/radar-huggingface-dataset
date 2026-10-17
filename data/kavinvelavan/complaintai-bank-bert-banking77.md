# Kavinvelavan/complaintai-bank-bert-banking77

## Resumen

ComPlaintAI-Bank BANKING77 BERT es un modelo de clasificación de intenciones publicado por el usuario Kavinvelavan en HuggingFace. Se trata de un ajuste fino (fine-tuning) de `bert-base-uncased` sobre BANKING77, un conjunto de datos público de consultas bancarias etiquetadas con 77 intenciones distintas. El resultado es un clasificador de secuencias de 109.541.453 parámetros que asigna una de esas 77 etiquetas a una frase corta de un cliente bancario.

El modelo no es un generador de texto ni un LLM conversacional: es un encoder BERT con una cabeza de clasificación de 77 clases. Su relevancia práctica está en el triaje y enrutado de peticiones: identificar si una consulta trata de tarjetas perdidas, cargos duplicados, límites de transferencia o activación de cuenta permite dirigirla a la cola adecuada, medir motivos de contacto o alimentar un chatbot con lógica determinista. El autor reporta un macro-F1 de 0,8897 en su split de validación, la única métrica publicada.

La ficha del modelo es extremadamente escueta: no declara licencia, no detalla el dataset de entrenamiento ni el proceso de ajuste, y no publica resultados en ningún conjunto de test independiente. Además, la fecha de creación registrada (17 de octubre de 2026) es posterior a la fecha actual, lo que sugiere metadatos inconsistentes. Con 0 descargas y 0 likes, no existe validación por parte de la comunidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-base (12 capas, 768 dimensiones ocultas, 12 cabezas de atención) con cabeza de clasificación de secuencias de 77 clases |
| Parametros totales | 109.541.453 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128 tokens (max sequence length configurada en el ajuste fino); el modelo base soporta 512 |
| Tipos de cuantizacion | No disponible. No se publican versiones cuantizadas; el checkpoint se distribuye en safetensors (el tamaño del repo, 0,4 GB, es coherente con pesos en fp32) |
| Idiomas soportados | No disponible. El modelo base es `bert-base-uncased` (inglés) y el dataset BANKING77 está en inglés, por lo que el uso realista se limita al inglés |
| Licencia | No disponible (el autor no la declara) |
| Formato de pesos | safetensors |
| Tarea | Clasificación de intenciones, 77 clases (BANKING77) |
| Metrica de seleccion | Macro-F1 en validación |
| Mejor macro-F1 en validación | 0,8897106569076488 |
| Artefactos incluidos | `label_mapping.json`, `model_metadata.json`, carpeta `training_runs/` con informes |
| Tamano del repo | 0,4 GB |
| Autor | Kavinvelavan |
| Fecha de creacion (metadatos) | 2026-10-17 |

## Arquitectura y entrenamiento

La arquitectura es la de `bert-base-uncased` sin modificaciones estructurales: un encoder transformer de 12 capas con 768 dimensiones ocultas, atención multi-cabeza y tokenizador WordPiece con vocabulario de 30.522 piezas. Sobre la salida del token `[CLS]` se añade una capa lineal de 77 unidades con sesgo, que produce los logits de las 77 intenciones. El recuento de parámetros es coherente con esta construcción: el cuerpo de `bert-base-uncased` aporta 109.482.240 parámetros y la cabeza de clasificación 59.213 (768 × 77 + 77), lo que suma exactamente los 109.541.453 declarados.

No se detalla en la model card el volumen de datos, la composición del split, la tasa de aprendizaje, el número de épocas ni si se aplicó congelación de capas o regularización. Tampoco se indica si hubo aumentación de datos o búsqueda de hiperparámetros; solo se menciona que la selección del checkpoint se hizo por macro-F1 de validación, una elección adecuada dado el desbalanceo típico de BANKING77 (77 clases con frecuencias muy desiguales, donde la accuracy sola sería engañosa). El límite de 128 tokens es suficiente para consultas bancarias de una o dos frases, pero descarta el procesamiento de conversaciones completas o correos largos sin truncado. El autor incluye un `label_mapping.json` que es imprescindible para interpretar los índices de salida, ya que el orden de las 77 etiquetas no es deducible del modelo.

No se han publicado detalles sobre el dataset de entrenamiento empleado más allá de la referencia a BANKING77, ni sobre posibles procesos de calibración de probabilidades.

## Capacidades

- Clasificación de una frase de entrada en una de 77 intenciones bancarias predefinidas (por ejemplo, tarjeta perdida, cargo duplicado, problema con transferencia, activación de cuenta).
- Salida de logits por clase, lo que permite aplicar umbrales de confianza, abstención o reglas de derivación a revisión humana.
- Procesamiento por lotes (batching) de grandes volúmenes de texto corto, al ser un encoder de 109 M de parámetros.
- Etiquetado consistente y reproducible gracias al `label_mapping.json` incluido.
- No soporta generación de texto, razonamiento multi-paso, tool calling, agentes, visión, audio ni matemáticas.
- No es un modelo multilingüe: el vocabulario y el dataset de origen son ingleses.
- No hay modo "thinking" ni capacidades de instrucción; no acepta prompts en lenguaje natural, solo texto a clasificar.

## Casos de uso

- Enrutado automático de tickets de banca: cada mensaje entrante se clasifica en una de las 77 intenciones y se asigna a la cola del equipo correspondiente (tarjetas, transferencias, cuentas, fraude), reduciendo el tiempo de primera asignación.
- Triaje de quejas y reclamaciones: el modelo identifica el motivo del contacto antes de que un agente lo lea, lo que permite priorizar categorías críticas como cargos no reconocidos o tarjetas perdidas.
- Analítica de motivos de contacto: clasificación por lotes de meses de conversaciones o correos para construir series temporales de volumen por intención y detectar picos asociados a incidencias.
- Componente de un chatbot de atención al cliente: la intención predicha selecciona la rama determinista del flujo conversacional, dejando la generación de lenguaje a un LLM separado y reduciendo el riesgo de respuestas incorrectas.
- Filtrado previo en pipelines RAG o de búsqueda documental: la intención actúa como metadato para restringir qué base de conocimiento se consulta (por ejemplo, solo documentación de tarjetas).
- Control de calidad de etiquetado humano: el clasificador se ejecuta sobre el histórico ya etiquetado y las discrepancias se envían a revisión, útil para auditar la taxonomía interna.
- Detección de urgencia operativa: intenciones como pérdida de tarjeta o acceso bloqueado pueden disparar alertas automáticas antes de la intervención humana, con un umbral de confianza sobre los logits.
- Prototipado rápido de taxonomías: al ser un modelo pequeño y entrenable en una GPU consumer, sirve como línea base para comparar nuevas taxonomías de intenciones antes de invertir en un modelo mayor.

## Benchmarks y rendimiento

La model card solo publica una métrica, medida sobre el split de validación del propio autor; no hay resultados sobre el conjunto de test oficial de BANKING77 ni comparaciones con otros modelos.

| Metrica | Valor | Conjunto |
|---|---|---|
| Macro-F1 | 0,8897 | Validación del autor (split propio) |
| Accuracy | No disponible | No disponible |
| F1 por clase | No disponible | No disponible |
| Resultados en test oficial de BANKING77 | No disponible | No disponible |

Como referencia de escala, la línea base aleatoria sobre 77 clases equilibradas sería un macro-F1 aproximado de 1/77 ≈ 0,013; el valor reportado confirma que el ajuste fino aprendió la tarea, pero al proceder de un único split de validación no permite descartar sobreajuste ni estimar la varianza entre particiones. No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM para pesos: aproximadamente 438 MB en fp32 (109,5 M de parámetros × 4 bytes), unos 219 MB en fp16 y unos 110 MB en int8. El tamaño del repo (0,4 GB) es consistente con fp32.
- VRAM para inferencia con lotes: con batch de 32 secuencias de 128 tokens las activaciones añaden un uso moderado; en la práctica cualquier GPU con 2 GB o más es suficiente. Cabe en GPUs integradas y en CPU.
- GPU recomendadas: para desarrollo, cualquier RTX 3060/4060 o superior; para servicio de alto rendimiento, T4, L4, A10 o A100 con batching. No requiere GPU de gama alta.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna con al menos 2 GB de VRAM; también es viable en CPU para volúmenes moderados.
- Opciones de despliegue: `transformers` con `AutoModelForSequenceClassification` (carga indicada por el autor), exportación a ONNX Runtime u Optimum para inferencia acelerada, Triton Inference Server o TorchServe para servicio, y un servicio FastAPI propio con batching dinámico. vLLM y llama.cpp/Ollama no son la vía habitual para un clasificador BERT con cabeza de 77 clases y no hay conversión GGUF publicada.
- Latencia y throughput: no publicados. Como estimación orientativa para un encoder de este tamaño en una T4 con ONNX Runtime y lotes grandes, el orden de magnitud es de miles de secuencias cortas por segundo; no hay medición oficial que lo respalde.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ComPlaintAI-Bank BANKING77 BERT (este) | 109,5 M | 128 tokens | 77 clases BANKING77 | No disponible | HuggingFace, 0 descargas |
| `bert-base-uncased` + fine-tuning propio en BANKING77 | 109,5 M | 512 tokens (base) | 77 clases | Apache 2.0 (modelo base) | Requiere entrenamiento propio |
| DistilBERT-base ajustado en BANKING77 | ~66 M | 512 tokens (base) | 77 clases | Apache 2.0 (modelo base) | Checkpoints de terceros, no verificados aquí |
| RoBERTa-base ajustado en BANKING77 | ~125 M | 514 tokens (base) | 77 clases | MIT (modelo base) | Checkpoints de terceros, no verificados aquí |
| DeBERTa-v3-base ajustado en BANKING77 | ~86 M | 512 tokens (base) | 77 clases | MIT (modelo base) | Checkpoints de terceros, no verificados aquí |

La comparación relevante es de compromiso entre tamaño y contexto: este checkpoint ofrece un límite de 128 tokens frente a los 512 de sus alternativas, a cambio de un modelo ya entrenado y con mapping de etiquetas incluido. No se dispone de macro-F1 publicado para las alternativas en la información proporcionada, por lo que no es posible establecer una comparación de rendimiento. Un punto crítico es la licencia: los modelos base citados son permisivos, pero el autor de este checkpoint no declara licencia alguna, lo que introduce incertidumbre legal que las alternativas entrenadas por uno mismo no tienen.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no puede asumirse permiso para uso comercial; hay que contactar con el autor o reentrenar desde `bert-base-uncased`.
- Ventana de 128 tokens: textos más largos se truncan, lo que puede eliminar la parte de la consulta que determina la intención.
- Solo inglés: el vocabulario uncased y el dataset de origen son ingleses; el rendimiento en castellano no está evaluado y previsiblemente será muy inferior.
- Dominio cerrado: las 77 clases cubren consultas bancarias; cualquier entrada fuera de ese dominio (u otra taxonomía bancaria) se forzará a una de las 77 etiquetas, sin clase "otros".
- Sin clase de rechazo ni calibración publicada: no hay información sobre cómo se comportan las probabilidades, por lo que los umbrales de confianza deben calibrarse con datos propios.
- Evaluación insuficiente: una única métrica sobre validación del propio autor, sin test independiente, sin F1 por clase y sin matriz de confusión. El riesgo de sobreajuste al split de validación no puede descartarse.
- Desbalanceo de clases: BANKING77 tiene intenciones con muy pocos ejemplos; el macro-F1 agregado puede ocultar clases con rendimiento bajo.
- Metadatos inconsistentes: la fecha de creación registrada (2026) es anómala, y el repositorio tiene 0 descargas y 0 likes, sin validación externa.
- Uso previsto sensible: el propio autor advierte que la predicción de intención no prueba que una alegación de queja sea cierta; el modelo no debe usarse para resolver disputas ni para decisiones automatizadas con efecto legal sobre el cliente.
- La búsqueda web realizada no devolvió información técnica relevante sobre este modelo; los resultados obtenidos eran páginas no relacionadas sobre Instagram.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Kavinvelavan/complaintai-bank-bert-banking77
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset BANKING77 en HuggingFace: https://huggingface.co/datasets/PolyAI/banking77
- Repositorio de datasets de PolyAI (origen de BANKING77): https://github.com/PolyAI-LDN/task-specific-datasets
- Paper de BANKING77 (Casanueva et al., 2020): https://arxiv.org/abs/2003.04807
- Paper de BERT (Devlin et al., 2018): https://arxiv.org/abs/1810.04805

Nota: no se encontraron enlaces adicionales (papers, blogs, demos o repositorios del autor) en la búsqueda web realizada; los resultados devueltos no guardaban relación con el modelo.
