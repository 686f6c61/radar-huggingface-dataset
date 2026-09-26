# Mohitnayakai/sentiment-model

## Resumen

Mohitnayakai/sentiment-model es un modelo de clasificación de texto publicado en Hugging Face por el usuario Mohitnayakai. Se trata de un ajuste fino (fine-tuning) de distilbert-base-uncased, el encoder transformer destilado de BERT que cuenta con 66.955.779 parámetros, 6 capas, dimensión oculta de 768 y 12 cabezas de atención. El pipeline declarado es text-classification, el formato de pesos es safetensors y la licencia es Apache 2.0. El repositorio ocupa 0,3 GB.

El modelo resuelve la tarea clásica de análisis de sentimiento: asignar una etiqueta de polaridad a un texto corto. El autor reporta en la model card una pérdida de evaluación de 0,7470, una accuracy de 0,6598, un F1 ponderado de 0,6493 y un F1 macro de 0,6493. La coincidencia exacta entre F1 ponderado y F1 macro apunta a un conjunto de evaluación con clases equilibradas (probablemente varias clases con la misma frecuencia), aunque el autor no especifica ni el dataset, ni el número de clases, ni las etiquetas utilizadas.

Su relevancia actual es limitada pero ilustrativa: acumula 0 descargas y 0 likes, no documenta el conjunto de entrenamiento, no publica benchmarks estandarizados (el array `results` del model-index está vacío) y sus métricas están lejos del estado del arte en análisis de sentimiento. Aun así, resulta útil como referencia de bajo coste computacional: al derivar de DistilBERT cabe en CPU y en cualquier GPU de consumo, y sirve como punto de partida reproducible para experimentos de clasificación de texto con `transformers` y `Trainer`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT destilado (DistilBERT): 6 capas, 768 de dimension oculta, 12 cabezas de atencion, 66 M de parametros. Datos heredados del modelo base declarado `distilbert-base-uncased` |
| Parametros totales | 66.955.779 (dato real de los pesos en safetensors) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 512 tokens (limite de posiciones de `distilbert-base-uncased`, heredado; no declarado explicitamente por el autor) |
| Tipos de cuantizacion | no disponible (el autor no documenta cuantizaciones propias); al ser un modelo estandar de `transformers` es convertible a INT8, FP16 y GGUF con herramientas externas |
| Idiomas soportados | no disponibles en la ficha; el modelo base `distilbert-base-uncased` se entreno sobre texto en ingles sin distincion de mayusculas, pero el autor no declara el idioma del ajuste fino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con PyTorch/`transformers`) |
| Tokenizador | WordPiece del modelo base (vocabulario de 30.522 tokens, `uncased`) |
| Tamano del repositorio | 0,3 GB |
| Tarea (pipeline) | `text-classification` |
| Libreria | transformers |
| Uso comercial | Permitido por licencia Apache 2.0, sujeto a las obligaciones de atribucion correspondientes |

## Arquitectura y entrenamiento

La arquitectura es la de DistilBERT: un transformer encoder de 6 capas con 768 dimensiones ocultas y 12 cabezas de atencion por capa, destilado a partir de BERT-base mediante destilacion de conocimiento. Solo se ha anadido una cabeza de clasificacion sobre el token `[CLS]` para la tarea de sentimiento. No hay innovaciones arquitectonicas propias: es un ajuste fino estandar sobre el checkpoint `distilbert-base-uncased`.

Respecto al entrenamiento, la model card indica que se uso la clase `Trainer` de `transformers` con los siguientes hiperparametros: learning rate 2e-05, `train_batch_size` 32, `eval_batch_size` 32, semilla 42, optimizador AdamW (variante `ADAMW_TORCH_FUSED`, betas 0,9 y 0,999, epsilon 1e-08), scheduler lineal y 3 epocas completas. No se documenta el conjunto de datos ("on an unknown dataset"), ni su tamano, ni su composicion, ni si hubo una etapa de RLHF o DPO (no aplicable en un clasificador de este tipo). Las versiones de framework declaradas son Transformers 5.16.1, PyTorch 2.11.0+cu128, Datasets 4.8.5 y Tokenizers 0.23.1. El numero de pasos registrados (174 en total, 58 por epoca) es coherente con un conjunto de entrenamiento pequeno.

La curva de validacion reportada por el autor muestra mejora hasta la tercera epoca en `accuracy` y F1 pero un ligero repunte de la perdida de validacion (0,7226 en la epoca 2 frente a 0,7117 en la epoca 3), lo que sugiere que el modelo esta cerca o ya en zona de sobreajuste con tan pocos pasos de entrenamiento.

## Capacidades

- Clasificacion de sentimiento de fragmentos de texto (analisis de polaridad), con salida de etiquetas y puntuaciones de confianza via `pipeline("text-classification")`.
- Clasificacion de textos cortos de hasta 512 tokens; los textos mas largos se truncan por defecto.
- Inferencia por lotes (batch) eficiente gracias a su tamano reducido, adecuada para procesar volumenes grandes de documentos cortos.
- Ejecucion en CPU y en hardware de gama baja o dispositivos con recursos limitados.
- Integracion directa con el ecosistema `transformers` (AutoModelForSequenceClassification, Trainer, pipelines) y exportacion a otros formatos mediante herramientas externas (ONNX, GGUF).
- No dispone de soporte documentado de tool calling, function calling ni agentes.
- No dispone de modo de razonamiento explicito (thinking mode), vision, audio ni generacion de texto libre.
- Capacidad multilingue: no disponible; el modelo base es `uncased` en ingles y el autor no declara otros idiomas.
- Capacidad de clasificacion multi-clase o binaria: no disponible (el autor no especifica el numero ni el nombre de las etiquetas).

## Casos de uso

- Analisis de resenas de producto a escala: procesar por lotes miles de opiniones de tienda online y etiquetarlas por polaridad con un coste de computo minimo, dado que el modelo ocupa menos de 300 MB en FP32 y puede ejecutarse en CPU. Requiere validar previamente las etiquetas reales del modelo, ya que el autor no las documenta.
- Monitorizacion de menciones de marca: clasificar comentarios recogidos de redes sociales o foros para construir series temporales de sentimiento y detectar picos negativos, aprovechando la capacidad de inferencia por lotes.
- Triaje de tickets de soporte: etiquetar automaticamente el tono de las solicitudes entrantes para priorizar incidencias con carga emocional negativa antes de que las revise un agente humano.
- Analisis de encuestas NPS y formularios abiertos: clasificar respuestas de texto libre y agregar resultados por segmento de cliente, con la ventaja de que el modelo cabe en cualquier servidor sin GPU.
- Prefiltrado en pipelines de datos: usar el clasificador como etapa barata de seleccion o enriquecimiento de metadatos antes de pasar los documentos a un modelo generativo mas costoso (por ejemplo, para decidir que resenas requieren un resumen detallado).
- Moderacion asistida de comunidades: marcar comentarios con polaridad fuertemente negativa para revision humana, siempre con supervision y sin automatizar decisiones de expulsion dado el nivel de accuracy reportado.
- Etiquetado de bajo coste en el borde (edge): desplegar el modelo en un portatil, un contenedor sin GPU o un dispositivo embebido para anotar datos en local sin enviar texto a servicios externos.
- Generacion de conjuntos de datos etiquetados: usar el modelo como etiquetador debil (weak labeler) para preanotar corpus y acelerar el trabajo de anotacion humana, con revision manual posterior.

## Benchmarks y rendimiento

El `model-index` del autor contiene un array de resultados vacio, por lo que no hay benchmarks estandarizados publicados (GLUE, SST-2, MMLU, etc.) ni comparaciones con otros modelos. Las unicas cifras disponibles son las metricas de validacion reportadas por el propio autor, que se reproducen a continuacion tal cual aparecen en la model card.

Metricas finales en el conjunto de evaluacion (declaradas por el autor):

| Metrica | Valor |
|---|---|
| Loss | 0,7470 |
| Accuracy | 0,6598 |
| F1 weighted | 0,6493 |
| F1 macro | 0,6493 |

Evolucion durante el entrenamiento (declarada por el autor):

| Training loss | Epoca | Paso | Validation loss | Accuracy | F1 weighted | F1 macro |
|---|---|---|---|---|---|---|
| 1,0498 | 1,0 | 58 | 0,8737 | 0,6080 | 0,5529 | 0,5529 |
| 0,8304 | 2,0 | 116 | 0,7226 | 0,6975 | 0,6881 | 0,6881 |
| 0,6785 | 3,0 | 174 | 0,7117 | 0,6821 | 0,6736 | 0,6736 |

No se han publicado resultados de benchmarks adicionales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 268 MB con pesos en FP32, 134 MB en FP16/BF16 y 67 MB en INT8, mas el consumo del runtime (activaciones y overhead de CUDA suelen anadir unos cientos de MB). El repositorio completo ocupa 0,3 GB.
- GPU recomendadas: cualquier GPU moderna es suficiente; no requiere aceleradores de datacenter. Funciona sin problema en RTX 3060, RTX 4090, T4, L4, A10, A100 o H100, aunque estos ultimos estan sobredimensionados para este modelo.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo con al menos 1 GB de VRAM (GTX 1050 Ti en adelante) e incluso en iGPU compartiendo memoria del sistema.
- CPU: la inferencia en CPU es perfectamente viable para lotes pequenos o moderados; el modelo tiene 66 M de parametros y 6 capas.
- Opciones de despliegue: `transformers` con `pipeline` para prototipos; TorchServe, FastAPI con `transformers`, Hugging Face Inference Endpoints (`endpoints_compatible`) o Text Generation Inference no aplica (es clasificacion, no generacion); ONNX Runtime para reducir latencia en CPU; llama.cpp/Ollama solo si se convierte previamente a GGUF, algo que el autor no proporciona.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones y dependen por completo del hardware, del tamano de lote y de la longitud del texto de entrada.
- Almacenamiento: menos de 1 GB, incluyendo el repositorio y los pesos duplicados en formato PyTorch si se descargan ambos.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks del modelo evaluado, por lo que la comparacion se limita a caracteristicas verificables de arquitectura, contexto, licencia y disponibilidad. Las cifras de rendimiento de los modelos alternativos no se incluyen porque no han sido verificadas en la informacion disponible.

| Modelo | Parametros | Contexto | Licencia | Idiomas declarados | Disponibilidad |
|---|---|---|---|---|---|
| Mohitnayakai/sentiment-model | 66.955.779 | 512 tokens (heredado del base) | Apache 2.0 | no disponible | Repositorio publico con 0 descargas y 0 likes; sin dataset ni etiquetas documentadas |
| distilbert-base-uncased-finetuned-sst-2-english | ~66 M | 512 tokens | Apache 2.0 | Ingles | Modelo de referencia ampliamente usado para analisis de sentimiento binario en SST-2, con model card y dataset documentados |
| cardiffnlp/twitter-roberta-base-sentiment-latest | ~125 M | 512 tokens | Consultar la model card del autor | Ingles (registro de redes sociales) | Modelo de sentimiento en tres clases entrenado sobre datos de Twitter; documenta dataset y etiquetas |
| roberta-base | ~125 M | 512 tokens | MIT (segun su model card) | Ingles | Modelo base generalista; requeriria ajuste fino propio para clasificacion de sentimiento |

Diferencias clave a tener en cuenta: las alternativas especializadas publican sus conjuntos de entrenamiento, sus etiquetas y, en muchos casos, evaluaciones en benchmarks conocidos, mientras que este modelo deja el dataset como "unknown" y no documenta las clases de salida. En coste de inferencia, los modelos de ~66 M de parametros son aproximadamente la mitad de pesados que los basados en RoBERTa-base.

## Limitaciones y advertencias

- Accuracy de validacion de 0,6598 y F1 macro de 0,6493: son metricas moderadas y no permiten asumir un rendimiento fiable en produccion sin una evaluacion propia sobre datos del dominio objetivo.
- El conjunto de entrenamiento se describe como "unknown" en la model card, por lo que se desconoce su dominio, su idioma real, su tamano y su procedencia. Esto impide evaluar sesgos y cobertura.
- No se documentan las etiquetas de salida ni el numero de clases, lo que obliga a inspeccionar `config.json` o probar el modelo antes de integrarlo. La igualdad entre F1 ponderado y F1 macro sugiere un conjunto equilibrado, que puede no reflejar la distribucion real del trafico en produccion.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de sobreconfianza en las puntuaciones de probabilidad, especialmente fuera de la distribucion del corpus de ajuste.
- Sesgos potenciales: no evaluables, al no conocerse los datos de entrenamiento. Los modelos derivados de BERT entrenados sobre texto web heredan sesgos de genero, raza o dialecto que no han sido auditados aqui.
- Limitacion de contexto: 512 tokens como maximo; los textos mas largos se truncan, lo que puede perder la parte final del contenido y alterar la prediccion.
- Limitacion de idioma: el modelo base es `uncased` en ingles; el uso con castellano u otros idiomas no esta soportado ni evaluado.
- Trazabilidad y mantenimiento: 0 descargas y 0 likes, sin historial de mantenimiento ni issues; el autor no ofrece soporte ni actualizaciones documentadas.
- Caveat de produccion: la model card conserva el aviso autogenerado de `Trainer` que pide revisar y completar el documento, lo que indica que no ha sido validada manualmente por el autor.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero el modelo se distribuye sin garantias; conviene conservar el aviso de licencia y los ficheros `NOTICE` si se redistribuye.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mohitnayakai/sentiment-model
- Modelo base: https://huggingface.co/distilbert-base-uncased
- Paper de DistilBERT (Sanh et al., 2019): https://arxiv.org/abs/1910.01108
- Documentacion de `transformers` para clasificacion de secuencias: https://huggingface.co/docs/transformers/tasks/sequence_classification
- Documentacion del pipeline `text-classification`: https://huggingface.co/docs/transformers/main_classes/pipelines#transformers.TextClassificationPipeline

No se han encontrado en la informacion disponible otros enlaces a papers, blogs, repositorios o demos especificos de este modelo.
