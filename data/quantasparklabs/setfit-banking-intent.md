# QuantaSparkLabs/setfit-banking-intent

## Resumen

QuantaSparkLabs/setfit-banking-intent es un clasificador de texto construido con la técnica SetFit (few-shot learning sin prompts) sobre el codificador de frases BAAI/bge-small-en-v1.5. En lugar de un modelo generativo, el artefacto combina un Sentence Transformer afinado con aprendizaje contrastivo y una cabeza de clasificación basada en una instancia de LogisticRegression de scikit-learn. El repositorio ocupa 0,1 GB y el recuento real de parámetros en safetensors es de 33.360.000, coherente con el tamano del encoder base.

El modelo resuelve una tarea concreta: clasificar consultas de clientes bancarios en 77 categorías de intención (activación de tarjeta, límites de edad, soporte de cajeros, recargas automáticas, Apple Pay o Google Pay, cargos no autorizados, comisiones de cambio de divisa, entre otras). Su relevancia práctica está en el coste: al ser un encoder de 33 M de parámetros con una cabeza lineal, se puede ejecutar en CPU o en GPUs de gama baja con latencias muy inferiores a las de un LLM, lo que lo hace adecuado para enrutado de tickets a escala.

La model card no especifica licencia, idiomas ni dataset de entrenamiento, y el repositorio no registra descargas ni valoraciones en el momento de la consulta. El contexto máximo de entrada es de 512 tokens, y la taxonomía de 77 clases coincide con la del conjunto público Banking77, aunque la propia ficha marca el dataset como desconocido, por lo que esa correspondencia es una inferencia y no un dato confirmado por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SetFit: Sentence Transformer (encoder tipo BERT, BAAI/bge-small-en-v1.5) + cabeza de clasificacion LogisticRegression |
| Parametros totales | 33.360.000 (33,36 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (Maximum Sequence Length declarada en la model card) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones; el repo publica safetensors en precision completa) |
| Idiomas soportados | no disponibles en la model card; el modelo base BAAI/bge-small-en-v1.5 esta entrenado principalmente en ingles |
| Licencia | no disponible |
| Formato de pesos | safetensors (`setfit`, tag `safetensors`) |
| Numero de clases | 77 |
| Libreria | setfit |
| Tamano del repositorio | 0,1 GB |
| Pipeline | text-classification |
| Tarea | Clasificacion de intenciones en dominio bancario |
| Fecha de creacion | 2026-09-27 (segun metadatos del Hub) |
| Fecha de actualizacion | 2026-09-27 (segun metadatos del Hub) |

## Arquitectura y entrenamiento

El modelo sigue el procedimiento estandar de SetFit descrito en el paper *Efficient Few-Shot Learning Without Prompts* (arXiv:2209.11055). El pipeline tiene dos etapas: primero se afina el Sentence Transformer mediante aprendizaje contrastivo sobre pares de frases generados a partir de los ejemplos etiquetados disponibles (con negativos en el mismo lote); después se congelan los embeddings resultantes y se entrena una cabeza de clasificación supervisada —en este caso, una regresión logística de scikit-learn— sobre las representaciones vectoriales. El encoder base es BAAI/bge-small-en-v1.5, un transformer tipo BERT con 33 M de parámetros y embeddings de 384 dimensiones, orientado a recuperación y similitud semantica en inglés.

No hay información publicada sobre el volumen de datos de entrenamiento, la composición del dataset, el número de ejemplos por clase ni si se aplicaron etapas adicionales de RLHF o DPO. Tampoco se documentan innovaciones técnicas propias del autor: el artefacto se marca como `generated_from_setfit_trainer`, lo que indica que procede del entrenador oficial de la librería SetFit sin modificaciones declaradas. No consta el uso de atención lineal, decodificación especulativa ni mecanismos híbridos.

## Capacidades

- Clasificación de texto en 77 clases de intención bancaria, con etiquetas documentadas como `activate_my_card`, `age_limit`, `apple_pay_or_google_pay`, `atm_support`, `automatic_top_up`, entre otras.
- Procesamiento de entradas de hasta 512 tokens, adecuado para consultas de usuario, párrafos de correo electrónico o transcripciones cortas de chat.
- Etiquetado de una única clase por entrada (clasificación multiclase cerrada); no se documenta soporte multietiqueta.
- Generación de embeddings de frases mediante el Sentence Transformer subyacente, reutilizables para búsqueda semántica o agrupamiento.
- Inferencia en CPU y en GPU de gama baja gracias al tamano reducido del modelo.
- Exportación y servicio mediante la librería SetFit y compatibilidad declarada con Text Embeddings Inference (`text-embeddings-inference`) y con endpoints gestionados del Hub (`endpoints_compatible`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación libre de texto, visión, audio ni modo de pensamiento. Es un clasificador discriminativo, no un modelo generativo.

## Casos de uso

- Enrutado automático de tickets de soporte bancario: cada consulta entrante se clasifica en una de las 77 intenciones y se deriva al equipo o flujo correspondiente, reduciendo la clasificación manual en centros de contacto con alto volumen.
- Triaje previo a un LLM: usar el clasificador como primera etapa barata para decidir qué subconjunto de consultas requieren un modelo generativo y cuáles se pueden responder con respuestas plantilla, recortando coste de inferencia.
- Análisis de voz del cliente: clasificar transcripciones de llamadas (dentro del límite de 512 tokens) para construir mapas de motivos de contacto y detectar picos en categorías como `unauthorized_charge` o `exchange_rate`.
- Etiquetado de datos a escala: preanotar grandes volúmenes de correos y chats para que un equipo humano revise y corrija, acelerando la creación de un dataset supervisado propio.
- Monitorización de nuevas incidencias: al ser un modelo de 33 M de parámetros, se puede reentrenar o afinar rápidamente con SetFit cuando aparezca una categoría nueva, sin necesidad de reentrenar un LLM.
- Detección de motivos de contacto en formularios web: clasificar en tiempo real el texto que el usuario escribe en un campo de ayuda para sugerir artículos de la base de conocimiento antes de enviar el ticket.
- Segmentación de feedback en encuestas NPS: clasificar comentarios abiertos en las 77 categorías para agregar métricas por motivo y correlacionarlas con la puntuación de satisfacción.
- Preprocesado en pipelines de cumplimiento: marcar automáticamente comunicaciones que mencionan cargos no autorizados o disputas para priorizar su revisión por el equipo de fraude.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card declara la métrica `accuracy` en el bloque de configuración del widget, pero no incluye ningún valor numérico, conjunto de evaluación ni comparación con otros sistemas. No se dispone de cifras de MMLU, HumanEval, GSM8K ni de exactitud sobre Banking77 o cualquier otro conjunto, por lo que no se presenta tabla comparativa de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB. Con 33,36 M de parámetros, los pesos en fp32 ocupan aproximadamente 133 MB y en fp16 unos 67 MB; sumando activaciones y la cabeza logística, el consumo es minimo.
- GPU recomendadas: cualquier GPU, incluidas NVIDIA GTX 1060, RTX 3060, RTX 4090, T4, L4, A100 o H100. El modelo no aprovecha aceleradores de gama alta porque el cuello de botella no es el computo.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo e incluso en iGPU y en CPU. Es viable ejecutarlo en un portatil sin GPU dedicada.
- Opciones de despliegue: librería `setfit` / `sentence-transformers` (ruta nativa), Text Embeddings Inference (según el tag `text-embeddings-inference`), endpoints gestionados de Hugging Face (tag `endpoints_compatible`), exportación a ONNX o TorchScript para servir con ONNX Runtime, y FastAPI o similar envolviendo la predicción. No es compatible con vLLM, llama.cpp u Ollama, que estan orientados a modelos generativos.
- Latencia y throughput: no disponible. No se han publicado mediciones. Por el tamano del encoder, la inferencia por frase es del orden de milisegundos en CPU moderna y por debajo del milisegundo en GPU, pero se trata de una estimación derivada de la arquitectura, no de una cifra publicada por el autor.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este modelo, por lo que la comparación se limita a características estructurales. Los valores de los modelos alternativos proceden de sus propias fichas publicas; el rendimiento en tareas bancarias no esta verificado para ninguno de ellos.

| Modelo | Enfoque | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QuantaSparkLabs/setfit-banking-intent | SetFit (encoder + regresion logistica) | 33,36 M | 512 tokens | no disponible | Hugging Face, 0 descargas |
| BAAI/bge-small-en-v1.5 (modelo base, sin cabeza de clasificacion) | Sentence Transformer puro | 33 M | 512 tokens | MIT (segun su ficha publica) | Hugging Face, muy descargado |
| Clasificador supervisado sobre distilbert-base-uncased | Fine-tuning completo de encoder con cabeza softmax | 66 M | 512 tokens | Apache 2.0 (segun su ficha publica) | Hugging Face |
| SetFit con paraphrase-multilingual-MiniLM-L12-v2 | SetFit sobre encoder multilingue | ~118 M | 128 tokens | Apache 2.0 (segun su ficha publica) | Hugging Face |

La ventaja estructural de este modelo frente a un fine-tuning completo es el coste de entrenamiento y el tamano del artefacto; su limitación principal es que hereda el sesgo monolingue del encoder base. No hay datos que permitan afirmar qué opción obtiene mejor exactitud en el dominio bancario.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar si el uso comercial está permitido. Es un bloqueante para producción hasta que el autor publique los términos.
- Idiomas no declarados: el encoder base es de dominio inglés, por lo que el rendimiento en castellano u otros idiomas es previsiblemente bajo y no está medido.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de clasificación errónea: al ser un clasificador de 77 clases cerradas, cualquier consulta fuera de la taxonomía se asignará forzosamente a una clase existente o a la de menor confianza, sin opción de abstención declarada.
- Sin métricas publicadas: no hay exactitud, matriz de confusión ni evaluación por clase, lo que impide estimar el rendimiento real antes de desplegarlo.
- Posible dependencia del conjunto Banking77: la taxonomía de 77 clases coincide con la de ese corpus público, lo que sugiere entrenamiento sobre datos en inglés y posible solapamiento entre entrenamiento y evaluación si se valida en el mismo conjunto. No está confirmado por el autor.
- Repositorio sin tracción: 0 descargas y 0 valoraciones en el momento de la consulta, sin historial de mantenimiento ni issues, lo que reduce la confianza en su robustez.
- Cabeza logística acoplada: la clasificación depende de una LogisticRegression serializada junto al encoder; modificar las clases requiere reentrenar la cabeza y volver a exportar el artefacto.
- Límite de 512 tokens: consultas largas o hilos de conversación completos deben truncarse o resumirse antes de la clasificación, con pérdida de contexto.
- Fecha de creación poco habitual: los metadatos indican 2026-09-27, posterior a la fecha de consulta habitual de este tipo de fichas, lo que conviene verificar antes de citar el modelo.
- Sesgos: no se documenta ninguna evaluación de equidad, y un clasificador entrenado en inglés sobre terminología financiera puede comportarse peor con variantes dialectales, jerga o errores ortográficos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/QuantaSparkLabs/setfit-banking-intent
- Modelo base: https://huggingface.co/BAAI/bge-small-en-v1.5
- Repositorio de SetFit en GitHub: https://github.com/huggingface/setfit
- Paper de SetFit (Efficient Few-Shot Learning Without Prompts): https://arxiv.org/abs/2209.11055
- Blog de SetFit en Hugging Face: https://huggingface.co/blog/setfit
- Documentación de Sentence Transformers: https://www.sbert.net

Nota: la búsqueda web realizada no ha devuelto ningún enlace relevante sobre este modelo, su autor o su dominio de aplicación. Los resultados obtenidos eran contenido no relacionado y no verificable, por lo que se han descartado y no se incluyen.
