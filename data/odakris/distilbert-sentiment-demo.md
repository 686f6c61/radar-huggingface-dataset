# Odakris/distilbert-sentiment-demo

## Resumen

distilbert-sentiment-demo es un modelo de clasificación de texto obtenido mediante fine-tuning de distilbert-base-uncased, publicado por el usuario Odakris en HuggingFace. Se trata de un ajuste supervisado con el Trainer de la librería transformers sobre un conjunto de datos que el autor no identifica en la model card, y cuyo único objetivo declarado es la clasificación de sentimiento. El repositorio tiene 66.955.010 parámetros en formato safetensors y ocupa 0,5 GB, con licencia Apache 2.0.

El modelo es relevante únicamente como demostración técnica o como plantilla reproducible: la model card está generada automáticamente por el Trainer y no documenta dataset, etiquetas, usos previstos ni limitaciones. El autor declara una accuracy de 0,8518 y una pérdida de evaluación de 0,4194 tras dos épocas de entrenamiento, pero sin especificar el conjunto de validación ni el número de clases, por lo que esas cifras no son verificables ni comparables con resultados publicados.

Por arquitectura y tamaño, es un modelo encoder-only de 6 capas y 66 millones de parámetros, pensado para inferencia de baja latencia en CPU o GPU modesta. No es un modelo generativo ni conversacional: su salida es una distribución de probabilidad sobre un conjunto de etiquetas de sentimiento cuyo número exacto no se documenta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (destilación de BERT); arquitectura heredada de distilbert-base-uncased: 6 capas, 768 de dimensión oculta, 12 cabezas de atención |
| Parametros totales | 66.955.010 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; la arquitectura base distilbert-base-uncased admite 512 tokens |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors en precisión completa) |
| Idiomas soportados | no disponible; el modelo base distilbert-base-uncased está entrenado únicamente con texto en inglés |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compatible con transformers) |

Otros datos del repositorio: pipeline `text-classification`, librería `transformers`, tamaño del repositorio 0,5 GB, 0 descargas y 0 likes en el momento de la consulta, etiquetas de compatibilidad `text-embeddings-inference` y `endpoints_compatible`.

## Arquitectura y entrenamiento

La arquitectura es la de DistilBERT: un transformer encoder-only con 6 capas, 768 dimensiones ocultas y 12 cabezas de atención, resultado de destilar distilbert-base-uncased a partir de BERT-base. Sobre ese backbone se ha añadido una cabeza de clasificación de secuencias con tantas salidas como etiquetas tenga el dataset de ajuste, número que la model card no especifica.

El entrenamiento se realizó con el Trainer de transformers usando los siguientes hiperparámetros: learning rate 2e-05, tamaño de lote de entrenamiento y evaluación 16, semilla 42, optimizador AdamW con `fused=True`, betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal y 2 épocas completas (1.068 pasos totales). El autor no documenta el dataset, su composición, su tamaño ni si hubo fases de RLHF o DPO, algo que tampoco aplica a un modelo encoder-only de clasificación. No se declara ninguna innovación técnica adicional.

Los resultados de entrenamiento declarados son:

| Training loss | Época | Paso | Validation loss | Accuracy |
|---|---|---|---|---|
| 0,4267 | 1,0 | 534 | 0,3709 | 0,8396 |
| 0,2536 | 2,0 | 1068 | 0,3693 | 0,8593 |

El mejor valor reportado en el encabezado de la model card es loss 0,4194 y accuracy 0,8518, ligeramente distinto del de la tabla, probablemente por una evaluación posterior con distinto criterio de selección del checkpoint.

## Capacidades

- Clasificación de texto: el modelo devuelve una etiqueta de sentimiento (y su probabilidad asociada) para una secuencia de entrada en inglés.
- Inferencia de una sola pasada: no genera texto libre, no mantiene conversación y no tiene estado interno entre llamadas.
- Compatibilidad con el pipeline `text-classification` de transformers, con `text-embeddings-inference` y con endpoints HTTP compatibles.
- No hay evidencia de soporte de tool calling, function calling ni uso como agente.
- No hay evidencia de capacidades multilingües: el modelo base es monolingüe en inglés y la model card no declara idiomas.
- No dispone de modo de razonamiento (thinking), visión, audio ni modalidad alguna distinta de texto.
- No hay información sobre el número de clases de sentimiento (binario, tres clases o más) ni sobre las etiquetas exactas.

## Casos de uso

- Análisis de sentimiento en reseñas de producto: dado que el modelo clasifica secuencias cortas de texto en inglés con una accuracy declarada del 85 %, puede usarse para etiquetar automáticamente reseñas y agregar métricas de satisfacción por producto o categoría. Requiere validar antes el número de clases y el dominio real de entrenamiento.
- Monitorización de menciones en redes sociales: integrado en un pipeline de ingesta, permite etiquetar en tiempo real comentarios y publicaciones en inglés para detectar picos de sentimiento negativo y activar alertas.
- Triaje de tickets de soporte: clasificar el tono de los mensajes entrantes para priorizar aquellos con carga emocional negativa, enrutándolos a agentes senior. Es viable porque el modelo es pequeño y su latencia en CPU es baja.
- Etiquetado de datos a escala: usado como anotador automático para preetiquetar grandes corpus antes de una revisión humana, reduciendo el coste de anotación en proyectos de análisis de opinión.
- Investigación académica reproducibilidad: al ser un fine-tuning ligero con hiperparámetros documentados y licencia Apache 2.0, sirve como punto de partida o línea base en experimentos de clasificación de sentimiento sobre dominios concretos.
- Clasificación en el borde (edge): con 66,9 millones de parámetros y 0,5 GB de pesos en fp32, puede ejecutarse en dispositivos sin GPU dedicada, por ejemplo en un servicio local que filtre comentarios antes de enviarlos a un modelo mayor.
- Filtrado previo en pipelines de moderación: descartar contenido claramente negativo o positivo antes de invocar un modelo generativo más caro, reduciendo el coste por petición.

## Benchmarks y rendimiento

La model card no publica resultados sobre benchmarks estándar (MMLU, GLUE, SST-2, HumanEval, GSM8K ni similares), y el bloque `model-index` del repositorio contiene una lista de resultados vacía. Los únicos números disponibles son los declarados por el autor sobre un conjunto de evaluación no identificado:

| Métrica | Valor declarado |
|---|---|
| Accuracy (evaluación, mejor checkpoint) | 0,8518 |
| Loss (evaluación, mejor checkpoint) | 0,4194 |
| Accuracy (época 1) | 0,8396 |
| Accuracy (época 2) | 0,8593 |
| Validation loss (época 1) | 0,3709 |
| Validation loss (época 2) | 0,3693 |

No se han publicado resultados de benchmarks comparables en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,27 GB en fp32, 0,13 GB en fp16/bf16 y 0,07 GB en int8, sin contar el tokenizador ni los buffers de activaciones y del runtime.
- Cabe holgadamente en cualquier GPU consumer: GTX 1050 Ti, GTX 1650, RTX 3050, RTX 3060, RTX 4090, así como en GPUs de datacenter (T4, A100, H100) donde el modelo resultaría sobredimensionado para el hardware.
- También es viable en CPU: con 66,9 millones de parámetros, un solo núcleo moderno puede procesar secuencias de 128 a 512 tokens en decenas de milisegundos, lo que lo hace apto para despliegues sin acelerador.
- Opciones de despliegue: transformers con PyTorch, text-embeddings-inference (el repositorio está etiquetado como compatible), Hugging Face Inference Endpoints (etiqueta `endpoints_compatible`), ONNX Runtime y FastAPI/TorchServe para envolverlo como servicio. No se declara compatibilidad con vLLM, llama.cpp u Ollama, que están orientados a modelos generativos.
- Latencia y throughput estimados: no disponibles. El autor no publica mediciones de latencia ni de peticiones por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Rendimiento declarado | Disponibilidad |
|---|---|---|---|---|---|
| Odakris/distilbert-sentiment-demo | 66.955.010 | no disponible en la model card (base: 512 tokens) | Apache 2.0 | accuracy 0,8518 en un conjunto de evaluación no identificado | HuggingFace, 0 descargas |
| distilbert-base-uncased | 66.955.010 | 512 tokens | Apache 2.0 | no disponible (modelo base, sin cabeza de clasificación ajustada) | HuggingFace, ampliamente utilizado |
| distilbert-base-uncased-finetuned-sst-2-english | ~67 millones | 512 tokens | Apache 2.0 | no disponible en esta ficha | HuggingFace, referencia habitual de clasificación de sentimiento binaria en inglés |
| bert-base-uncased | 110 millones | 512 tokens | Apache 2.0 | no disponible (modelo base) | HuggingFace |
| roberta-base | 125 millones | 512 tokens | MIT | no disponible (modelo base) | HuggingFace |

La comparación de rendimiento entre alternativas no es posible con la información disponible, porque este repositorio no publica resultados en benchmarks estandarizados y ninguno de los comparadores incluidos en la tabla tiene cifras declaradas en la información proporcionada. La diferencia principal frente a alternativas como bert-base-uncased o roberta-base es el tamaño, aproximadamente la mitad de parámetros, con la consiguiente reducción de coste de inferencia a cambio de capacidad representacional.

## Limitaciones y advertencias

- Documentación insuficiente: la model card está generada automáticamente y contiene "More information needed" en las secciones de descripción, usos previstos, limitaciones y datos de entrenamiento. No se puede auditar el modelo.
- Dataset desconocido: se desconoce el dominio, el idioma efectivo, el número de clases y la distribución de etiquetas del conjunto de ajuste. La accuracy de 0,8518 no es interpretable sin esa información y probablemente no se transfiera a otros dominios.
- Idioma: no se declaran idiomas soportados, pero el modelo base distilbert-base-uncased solo fue preentrenado con texto en inglés. El uso en castellano u otros idiomas no está validado y previsiblemente dará resultados pobres.
- Riesgo de alucinación: no aplica en el sentido generativo, porque el modelo no produce texto libre; el riesgo equivalente es la clasificación errónea sistemática en dominios alejados del entrenamiento.
- Sesgos: no hay ninguna evaluación de sesgo publicada. Un modelo entrenado sobre un corpus no documentado puede heredar sesgos de género, raciales o culturales presentes en los datos, especialmente al clasificar expresiones de sentimiento en distintos registros.
- Longitud de entrada: aunque la arquitectura base admite 512 tokens, los textos más largos se truncarán y las predicciones pueden degradarse en documentos extensos; tampoco hay información sobre el rango de longitudes usado en el ajuste.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, modificación y redistribución sin restricciones relevantes, siempre que se conserve el aviso de licencia y se indique si hubo cambios. No hay cláusulas de uso aceptable adicionales.
- Madurez del repositorio: 0 descargas y 0 likes, creado y actualizado en septiembre de 2026, sin historial de mantenimiento. No es un artefacto validado por la comunidad.
- Ausencia de versionado de datos e hiperparámetros completos: no se especifica el tamaño del conjunto de evaluación, por lo que la accuracy declarada podría tener un intervalo de confianza amplio.
- Compatibilidad de versiones: el entrenamiento se realizó con transformers 5.17.0, PyTorch 2.14.0+cu130, datasets 5.0.1 y tokenizers 0.23.2. Cargar el modelo con versiones muy anteriores de transformers puede requerir ajustes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Odakris/distilbert-sentiment-demo
- Modelo base: https://huggingface.co/distilbert-base-uncased
- Repositorio de referencia de DistilBERT (no enlazado en la model card, mencionado como origen de la arquitectura base): https://huggingface.co/distilbert/distilbert-base-uncased

Nota: la búsqueda web asociada a esta ficha no devolvió ningún enlace relevante sobre el modelo, su dataset o su entrenamiento; los resultados obtenidos eran páginas de contenido para adultos sin relación alguna con el repositorio. No se dispone por tanto de papers, blogs, demos ni repositorios adicionales que documenten este modelo.
