# jefftherover/pii-dual-nym-mmbert-base-v1

## Resumen

pii-dual-nym-mmbert-base-v1 es un modelo de clasificación de tokens (token classification) obtenido por fine-tuning del encoder multilingüe jhu-clsp/mmBERT-base, desarrollado por el usuario jefftherover y publicado en Hugging Face bajo licencia MIT. Su propósito declarado, a partir del identificador "pii" y la tarea de clasificación de tokens, es la detección de información personal identificable (PII) a nivel de token, es decir, el etiquetado de entidades dentro de un texto para su posterior enmascaramiento, anonimización o pseudonimización.

Técnicamente es un encoder transformer bidireccional de la familia ModernBERT con 307.557.155 parámetros totales según los pesos safetensors del repositorio. Según el paper de mmBERT, la variante base mantiene 110M parámetros no de embedding (los mismos que ModernBERT-base) y eleva el total a 307M por un vocabulario mucho mayor, lo que explica el tamaño del checkpoint. El repositorio ocupa 6,2 GB, coherente con pesos en fp32 más otros artefactos de entrenamiento.

El modelo es relevante ahora porque cubre una necesidad operativa muy concreta: la detección automática de datos personales en flujos de texto antes de almacenarlos, enviarlos a terceros o reutilizarlos para entrenamiento. Al heredar la cobertura multilingüe de mmBERT (hasta 1833 idiomas durante el entrenamiento del modelo base), se posiciona como una alternativa de código abierto para cumplimiento normativo (RGPD, PCI-DSS, HIPAA) sin depender de APIs propietarias. La model card es un artefacto autogenerado por el Trainer y no documenta el dataset, los idiomas del fine-tuning ni los usos previstos, por lo que la información disponible es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer bidireccional de la familia ModernBERT (modelo base jhu-clsp/mmBERT-base) |
| Parametros totales | 307.557.155 (dato real de los pesos safetensors); 110M no de embedding segun el paper de mmBERT |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card (el modelo base mmBERT deriva de la arquitectura ModernBERT, disenada para contextos largos, pero no se confirma el valor para este fine-tuning) |
| Tipos de cuantizacion | No disponible (no se publican versiones cuantizadas; los pesos son compatibles con cuantizacion posterior via bitsandbytes, ONNX o similar) |
| Idiomas soportados | No disponible para el fine-tuning; el modelo base mmBERT se entreno con hasta 1833 idiomas |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de jhu-clsp/mmBERT-base, un encoder multilingüe moderno presentado en el paper "mmBERT: a Multilingual Modern Encoder through Adaptive Scheduling" (arXiv:2509.06888). mmBERT introduce un esquema de entrenamiento denominado cascading annealed language learning (ALL), que incorpora progresivamente hasta 1833 idiomas, y mantiene la arquitectura de encoder bidireccional de tipo ModernBERT. La variante base conserva los 110M parámetros no de embedding de ModernBERT-base, pero eleva el total a 307M por el vocabulario ampliado. El paper afirma además que estas arquitecturas son significativamente más rápidas que encoders multilingües anteriores.

Respecto al entrenamiento de este fine-tuning concreto, la model card (autogenerada por el Trainer) indica 4 épocas, learning rate 5e-05, tamaño de lote efectivo 32 (batch 16 con 2 pasos de acumulación de gradiente), optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-08, scheduler cosine_with_restarts con 200 pasos de warmup, semilla 42 y precisión mixta nativa (AMP). Se desconoce por completo la composición del dataset, su tamaño, el esquema de etiquetado (BIO, BIOES u otro) y el número de tokens de entrenamiento; la model card indica "unknown dataset" y deja en "More information needed" las secciones de descripción, usos previstos y datos de evaluación. No se declara uso de RLHF ni DPO, algo esperable en un modelo discriminativo de este tipo. Las versiones de framework reportadas son Transformers 5.18.0, PyTorch 2.14.1+cu130, Datasets 5.0.1 y Tokenizers 0.23.2.

## Capacidades

- Clasificación de tokens para extracción de entidades tipo PII: el pipeline declarado es token-classification, de modo que el modelo etiqueta cada token de la secuencia de entrada.
- Detección de entidades a nivel de span: al ser un modelo NER, permite reconstruir entidades completas (nombres, direcciones, identificadores, etc.) a partir de las etiquetas por token, siempre que el esquema de etiquetado del fine-tuning sea de tipo BIO/BIOES.
- Multilingüismo potencial: hereda el vocabulario y la cobertura de 1833 idiomas del modelo base mmBERT, aunque no hay confirmación de qué idiomas cubre realmente el fine-tuning.
- Procesamiento por lotes: al ser un encoder de 307M parámetros, admite inferencia batched en GPU con buen throughput.
- Capacidad de "dual nym": el nombre del modelo sugiere un enfoque de doble tratamiento (por ejemplo, detección orientada a anonimización y a pseudonimización), pero la model card no documenta ninguna capacidad diferencial en este sentido.
- Tool calling / function calling: no soportado (no es un modelo generativo ni un LLM conversacional).
- Razonamiento multi-paso y agentes: no aplicable.
- Generación de texto, código, matemáticas, visión o audio: no soportado. Es un modelo exclusivamente discriminativo de etiquetado.
- Modo thinking o razonamiento explícito: no disponible.

## Casos de uso

- Cumplimiento del RGPD en registros de atención al cliente: el modelo puede ejecutarse sobre tickets, correos y transcripciones de chat para etiquetar y después enmascarar nombres, direcciones, teléfonos o identificadores fiscales antes de que los datos salgan del sistema o se almacenen en un data lake.
- Anonimización previa al entrenamiento de LLMs: en la fase de curación de corpus, un etiquetador de PII a nivel de token permite filtrar o sustituir entidades personales de forma sistemática, reduciendo el riesgo de memorización de datos personales en modelos generativos posteriores. El coste computacional es bajo frente al entrenamiento.
- Prevención de fuga de datos (DLP) en documentos internos: integrado como etapa de escaneo de correos, PDFs y adjuntos, el modelo puede marcar automáticamente documentos que contienen PII y bloquear o requerir aprobación antes de su envío externo.
- Saneado de datos en pipelines RAG: antes de indexar documentos en una base vectorial, el modelo puede etiquetar y eliminar identificadores personales, evitando que un asistente recupere y muestre información sensible en sus respuestas.
- Redacción de historiales clínicos y documentación legal: en entornos sanitarios o jurídicos, permite generar versiones seudonimizadas de notas e informes para investigación o cesión a terceros, manteniendo la trazabilidad mediante un mapa de pseudónimos controlado por el cliente.
- Auditoría y enrutado en plataformas financieras: detección de números de tarjeta, cuentas o identificadores de cliente en logs transaccionales para cumplimiento PCI-DSS, con posible uso como clasificador previo que enruta los textos a colas de revisión humana.
- Moderación de contenido generado por usuarios: etiquetado de PII en publicaciones y comentarios para aplicar políticas de privacidad antes de la publicación.
- Enriquecimiento de metadatos en buscadores internos: extracción de entidades personales para construir índices o filtros de acceso, restringiendo la visibilidad de documentos según el tipo de dato detectado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El model-index del repositorio está vacío. Los únicos datos disponibles son las métricas de validación registradas por el Trainer durante el fine-tuning:

| Metrica (conjunto de evaluacion) | Valor |
|---|---|
| Loss | 0,0022 |
| Precision | 0,9961 |
| Recall | 0,9974 |
| F1 | 0,9967 |
| Accuracy | 0,9995 |

Evolución por época reportada en la model card:

| Training loss | Epoca | Step | Validation loss | Precision | Recall | F1 | Accuracy |
|---|---|---|---|---|---|---|---|
| 0,0151 | 0,8871 | 2000 | 0,0122 | 0,9823 | 0,9914 | 0,9868 | 0,9973 |
| 0,0073 | 1,7740 | 4000 | 0,0032 | 0,9949 | 0,9959 | 0,9954 | 0,9992 |
| 0,0014 | 2,6609 | 6000 | 0,0021 | 0,9949 | 0,9971 | 0,9960 | 0,9993 |
| 0,0014 | 3,5478 | 8000 | 0,0022 | 0,9963 | 0,9973 | 0,9968 | 0,9995 |
| 0,0002 | 4,0 | 9020 | 0,0022 | 0,9961 | 0,9974 | 0,9967 | 0,9995 |

Advertencia: estas cifras proceden de un conjunto de evaluación no descrito (tamaño, composición, esquema de etiquetas y posible solapamiento con el conjunto de entrenamiento son desconocidos). Una accuracy de 0,9995 en clasificación de tokens sugiere un fuerte desbalance de clases (la clase mayoritaria "no entidad" domina la métrica) y no permite extrapolar el rendimiento en producción sobre datos reales. No se dispone de comparación con otros modelos de detección de PII.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 1,3 GB en fp32 (307M parámetros × 4 bytes) y unos 0,65 GB en fp16/bf16, más el consumo de activaciones y del vocabulario ampliado de mmBERT (relevante en la capa de embedding). No se publican cifras oficiales.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM efectiva es suficiente para fp16. Sirven RTX 3060, RTX 4060, RTX 4090, L4, T4, A10, A100 y H100; en estas dos últimas el modelo queda muy infrautilizado y el cuello de botella será el preprocesado de texto.
- Cabe en GPU consumer: sí, sin problema. Incluso en CPU es viable para volúmenes moderados, dado el tamaño del modelo.
- Opciones de despliegue: Hugging Face Transformers (pipeline de token-classification), exportación a ONNX con Optimum y ejecución con ONNX Runtime, TorchScript, NVIDIA Triton Inference Server, o un servicio propio con FastAPI y batching dinámico. llama.cpp y Ollama no son aplicables porque están orientados a modelos generativos con pesos GGUF; vLLM tampoco es la vía natural para un encoder de clasificación, aunque existen alternativas especializadas en servir encoders.
- Latencia y throughput: no disponibles. No se publican mediciones de latencia ni de tokens por segundo. Como referencia arquitectónica, el paper de mmBERT afirma que la familia es significativamente más rápida que encoders multilingües anteriores, pero no hay cifras específicas para este fine-tuning.
- El repositorio ocupa 6,2 GB, muy por encima del tamaño de los pesos en fp16, lo que sugiere que incluye checkpoints intermedios o estados del optimizador; conviene verificar los archivos antes de desplegar en un contenedor con almacenamiento limitado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pii-dual-nym-mmbert-base-v1 | 307.557.155 (110M no de embedding) | no disponible | Clasificacion de tokens (PII) | MIT | Hugging Face |
| jhu-clsp/mmBERT-base (modelo base) | 307M totales / 110M no de embedding (segun paper) | no disponible en la informacion proporcionada | Encoder multilingue de proposito general | no disponible en la informacion proporcionada | Hugging Face, GitHub JHU-CLSP/mmBERT |
| jefftherover/pii-dual-mmbert-base-v1 | no disponible | no disponible | Clasificacion de tokens (PII) | no disponible en la informacion proporcionada | Hugging Face (mismo autor, variante previa) |
| jefftherover/pii-dual-mmbert-base-v3 | no disponible | no disponible | Clasificacion de tokens (PII) | no disponible en la informacion proporcionada | Hugging Face (mismo autor, variante posterior) |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables, por lo que no es posible establecer una comparación de rendimiento. Los resultados de búsqueda web solo devuelven páginas de los propios checkpoints del autor y la documentación de mmBERT.

## Limitaciones y advertencias

- Model card prácticamente vacía: el autor no documenta el dataset de entrenamiento, el esquema de etiquetas, los idiomas cubiertos ni los usos previstos. Cualquier integración en producción requiere evaluar el modelo sobre datos propios antes de confiar en él.
- Riesgo de sobreajuste o de evaluación sesgada: las métricas reportadas (F1 0,9967, accuracy 0,9995) son sospechosamente altas y proceden de un conjunto de validación no descrito. Es probable que el conjunto sea pequeño, esté muy desbalanceado o comparta distribución con el de entrenamiento. No deben tomarse como indicador de rendimiento real.
- Sesgos conocidos: no documentados. Al derivar de mmBERT, el modelo puede heredar sesgos presentes en los corpus multilingües usados para entrenar el encoder base, especialmente en lenguas con menos recursos.
- Alucinación: al ser un modelo discriminativo de etiquetado no genera texto, por lo que no "alucina" en sentido generativo; sin embargo, puede producir falsos positivos (marcar texto no personal como PII) y falsos negativos (no detectar PII), ambos críticos en un contexto de cumplimiento normativo.
- Limitaciones de contexto e idioma: se desconoce la longitud máxima de secuencia soportada por este fine-tuning y los idiomas realmente cubiertos. Si se usa con textos o idiomas no vistos en el entrenamiento, el rendimiento puede degradarse de forma severa y silenciosa.
- Restricciones de licencia: licencia MIT, que permite uso comercial, modificación y redistribución con atribución y sin garantías. No obstante, el modelo base jhu-clsp/mmBERT-base tiene su propia licencia, que no se especifica en la información disponible; conviene verificarla antes de un uso comercial.
- Trazabilidad y gobernanza: para usos regulados (RGPD, HIPAA, PCI-DSS) un modelo de etiquetado nunca es suficiente por sí solo. Hace falta revisión humana o umbrales de confianza, registro de auditoría y un procedimiento de gestión de falsos negativos.
- Cero adopción pública: el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, sin issues ni discusiones que permitan validar su comportamiento en condiciones reales. No hay señales externas de uso o mantenimiento.
- Ambigüedad del nombre: el término "dual-nym" no se explica en la model card, por lo que no puede asumirse que implemente un esquema específico de anonimización y pseudonimización simultáneas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jefftherover/pii-dual-nym-mmbert-base-v1
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-base
- Variante previa del mismo autor: https://huggingface.co/jefftherover/pii-dual-mmbert-base-v1
- Variante posterior del mismo autor: https://huggingface.co/jefftherover/pii-dual-mmbert-base-v3
- Repositorio GitHub de mmBERT: https://github.com/JHU-CLSP/mmBERT/
- Paper de mmBERT (arXiv:2509.06888): https://arxiv.org/html/2509.06888v1
- Ficha de indexacion de la variante v3: https://essamamdani.com/ai-models/hf-jefftherover-pii-dual-mmbert-base-v3
