# aantaki/learn_hf_food_not_food_text_classifier-distilbert-base-uncased

## Resumen

`aantaki/learn_hf_food_not_food_text_classifier-distilbert-base-uncased` es un clasificador de texto binario afinado por el usuario de HuggingFace aantaki a partir de `distilbert/distilbert-base-uncased`. Su tarea es distinguir entre texto que habla de comida y texto que no, un caso de uso típico de filtrado y etiquetado dentro de un corpus gastronómico. El repositorio tiene 0 descargas y 0 "likes" en el momento de redactar esta ficha, y la model card fue generada automáticamente por el `Trainer` de Transformers, con secciones de descripción, usos previstos y datos de entrenamiento sin rellenar.

Técnicamente es un encoder transformer de tipo distilBERT con 66.955.010 parámetros totales (pesos safetensors), lo que lo sitúa por debajo de los 70 millones de parámetros: es un modelo de tamaño reducido, apto para inferencia en CPU y para despliegues de muy baja latencia. El repositorio ocupa 0,3 GB y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

Su relevancia práctica no está en el rendimiento bruto, sino en el coste: sirve como componente de clasificación rápido y barato dentro de pipelines mayores (prefiltrado, enrutado, etiquetado masivo). Conviene tratarlo como un artefacto experimental sin documentación de dataset ni validación externa: la model card declara una precisión de 1,0 sobre un conjunto de evaluación cuyo tamaño y composición no se especifican.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (distilBERT) con cabeza de clasificación de secuencias |
| Parametros totales | 66.955.010 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (heredada del modelo base distilbert-base-uncased; no declarada en la model card) |
| Tipos de cuantizacion | no disponible: el repositorio solo publica pesos safetensors en precisión completa |
| Idiomas soportados | no disponible (el modelo base distilbert-base-uncased se entrenó principalmente con texto en inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Tarea | clasificación binaria (comida / no comida, segun el nombre del modelo) |
| Modelo base | distilbert/distilbert-base-uncased |
| Autor | aantaki |
| Descargas | 0 |
| Likes | 0 |
| Tamano del repositorio | 0,3 GB |
| Fecha de creacion | 2026-09-29 |
| Fecha de actualizacion | 2026-09-29 |
| Libreria | transformers |

## Arquitectura y entrenamiento

El modelo es un ajuste fino (fine-tuning) supervisado de `distilbert-base-uncased`, un encoder transformer destilado de BERT-base. La model card indica que se entrenó con el `Trainer` de Transformers sobre un conjunto de datos no especificado ("unknown dataset"), con los siguientes hiperparámetros: learning rate 1e-4, batch size de entrenamiento y de evaluación de 32, semilla 42, optimizador AdamW (variante `ADAMW_TORCH_FUSED`, betas 0,9/0,999, epsilon 1e-8), scheduler lineal y 10 épocas. Las versiones de framework declaradas son Transformers 5.16.1, PyTorch 2.11.0+cu128, Datasets 5.0.1 y Tokenizers 0.23.1.

No se documenta la composición del dataset, el número de tokens de entrenamiento, ni si hubo etapas de RLHF, DPO u otras técnicas de alineación (no aplicables en un clasificador, por otra parte). Tampoco se declara ninguna innovación técnica adicional: se trata de un ajuste fino estándar de clasificación de secuencias. A partir del número de pasos registrados (7 pasos por época con batch size 32), se puede estimar que el conjunto de entrenamiento rondaba los 224 ejemplos, lo que explicaría una precisión de 1,0 en validación y apunta a un riesgo alto de sobreajuste.

## Capacidades

- Clasificación de texto binaria: asigna una etiqueta del conjunto entrenado (presumiblemente "comida" / "no comida") a una secuencia de texto corta.
- Filtrado y etiquetado de grandes volúmenes de texto a bajo coste computacional, gracias a sus 66,96 millones de parámetros.
- Inferencia en CPU: el tamaño del modelo permite ejecutarlo sin GPU para lotes moderados.
- Compatibilidad con la librería `transformers` mediante `pipeline("text-classification")`.
- Compatibilidad declarada con Text Embeddings Inference (tag `text-embeddings-inference`) y con los endpoints gestionados de HuggingFace (tag `endpoints_compatible`).
- Generación de texto: no disponible.
- Razonamiento, matemáticas y código: no disponible.
- Tool calling / function calling: no disponible.
- Capacidades de agente o razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (el modelo base es de vocabulario `uncased` entrenado principalmente en inglés).
- Visión, audio o modo "thinking": no disponible.

## Casos de uso

- Moderación temática de foros y redes sociales: clasificar publicaciones como relacionadas o no con alimentación para aplicar reglas de comunidad o enrutar contenido a la sección correspondiente. El coste por inferencia es muy bajo al tratarse de un modelo de 67 millones de parámetros.
- Etiquetado automático de un CMS de recetas: procesar el cuerpo de los artículos y separar los que son contenido culinario de los que no, antes de asignar categorías editoriales.
- Prefiltrado en pipelines de visión por computador: descartar texto (pies de foto, descripciones, reseñas) que no habla de comida antes de pasarlo a un modelo más caro de análisis de imágenes de platos.
- Enrutado de consultas en un chatbot de reparto o reservas de restaurantes: detectar si la consulta entrante es de temática gastronómica y derivarla al flujo conversacional adecuado o a atención humana, reduciendo el uso de un LLM grande.
- Limpieza y curación de datasets: depurar un corpus recopilado de la web eliminando documentos no gastronómicos antes de usarlo para entrenar o evaluar otros modelos.
- Procesamiento por lotes de reseñas (por ejemplo, de plataformas tipo Yelp o TripAdvisor): separar reseñas de restaurantes de reseñas de otros negocios cuando la fuente mezcla categorías.
- Sistemas de recomendación de contenido culinario: usar la etiqueta como señal adicional de filtrado en el ranking de artículos, vídeos o recetas recomendadas.
- Análisis de tickets de soporte de una aplicación de recetas: clasificar automáticamente los mensajes entrantes según si tratan sobre contenido gastronómico o sobre incidencias técnicas u otros temas.

## Benchmarks y rendimiento

El `model-index` de la model card está vacío: no se han declarado resultados de benchmarks estándar (MMLU, GLUE, etc.) en la información disponible. El único dato de rendimiento publicado es la tabla de resultados de entrenamiento del `Trainer`, que se reproduce a continuación tal cual figura en la model card:

| Training loss | Epoca | Step | Validation loss | Accuracy |
|:---:|:---:|:---:|:---:|:---:|
| 0.3357 | 1.0 | 7 | 0.0404 | 1.0 |
| 0.0196 | 2.0 | 14 | 0.0056 | 1.0 |
| 0.0039 | 3.0 | 21 | 0.0022 | 1.0 |
| 0.0018 | 4.0 | 28 | 0.0013 | 1.0 |
| 0.0012 | 5.0 | 35 | 0.0009 | 1.0 |
| 0.0009 | 6.0 | 42 | 0.0007 | 1.0 |
| 0.0008 | 7.0 | 49 | 0.0006 | 1.0 |
| 0.0007 | 8.0 | 56 | 0.0006 | 1.0 |
| 0.0007 | 9.0 | 63 | 0.0006 | 1.0 |
| 0.0006 | 10.0 | 70 | 0.0005 | 1.0 |

Resultado final declarado en la model card: loss 0,0005 y accuracy 1,0 sobre el conjunto de evaluación. No se especifica el tamaño ni el origen de ese conjunto, por lo que la cifra no es comparable con ningún benchmark público ni permite estimar el rendimiento en producción.

## Requisitos de hardware

- VRAM estimada en precisión completa (fp32): aproximadamente 268 MB solo para los pesos, más el overhead del runtime (del orden de 0,5-1 GB en total con PyTorch).
- VRAM estimada en fp16/bf16: aproximadamente 134 MB de pesos; sigue siendo un modelo de menos de 1 GB en memoria.
- Cuantización a int8: aproximadamente 67 MB de pesos. No hay pesos GGUF ni cuantizaciones publicadas en el repositorio, por lo que habría que generarlas localmente.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs integradas con suficiente memoria compartida.
- También funciona en CPU sin GPU, que es el escenario más realista para un modelo de este tamaño en producción de bajo volumen.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, HuggingFace Inference Endpoints (tag `endpoints_compatible`), Text Embeddings Inference (tag `text-embeddings-inference`), exportación a ONNX o TorchScript para servir con ONNX Runtime o un servidor FastAPI propio. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, formatos pensados para modelos generativos.
- Latencia y throughput: no disponibles. Con 66,96 millones de parámetros y entradas de hasta 512 tokens, es razonable esperar latencias del orden de milisegundos por lote en CPU moderna, pero no hay mediciones publicadas que lo confirmen.

## Comparativa con modelos similares

No se han publicado comparativas ni resultados de benchmarks en la información disponible, y el autor no documenta alternativas. Como referencia de categoría, la tabla siguiente recoge el modelo y su base directa, además de dos encoders de tamaño similar usados habitualmente como punto de partida para clasificación de texto. Las filas de modelos distintos de este no son competidores evaluados contra él, sino referencias arquitectónicas cuyos datos provienen de su documentación pública:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este modelo (aantaki/...-distilbert-base-uncased) | 66.955.010 | 512 tokens (heredado del base) | apache-2.0 | safetensors, transformers |
| distilbert/distilbert-base-uncased | ~66 M | 512 tokens | apache-2.0 | safetensors, transformers |
| google-bert/bert-base-uncased | ~110 M | 512 tokens | apache-2.0 | safetensors, transformers |
| FacebookAI/roberta-base | ~125 M | 512 tokens | mit | safetensors, transformers |

Rendimiento comparado: no disponible. No existen métricas de este ajuste fino frente a ninguna de estas alternativas sobre un conjunto de evaluación común y documentado.

## Limitaciones y advertencias

- Precisión de 1,0 en validación con un conjunto de evaluación no documentado y, a partir del número de pasos declarado, un conjunto de entrenamiento de apenas unos cientos de ejemplos: la métrica es prácticamente con toda probabilidad un artefacto de sobreajuste y no debe extrapolarse a producción.
- No se documenta el dataset de entrenamiento ni el de evaluación: se desconoce la distribución de etiquetas, el dominio de origen y si existen sesgos temáticos o lingüísticos.
- No hay resultados en el `model-index` ni benchmarks públicos: el modelo no ha sido validado por terceros y acumula 0 descargas.
- Tarea limitada a clasificación binaria de texto; no genera texto, no razona, no soporta tool calling ni agentes.
- Longitud de contexto de 512 tokens (heredada del modelo base): los textos más largos deberán truncarse, lo que puede degradar la clasificación de documentos extensos.
- Idioma: el modelo base está entrenado principalmente en inglés y el tokenizador es `uncased` (pierde información de mayúsculas). No se declaran idiomas soportados, por lo que el rendimiento en castellano es desconocido y probablemente pobre sin un ajuste adicional.
- Riesgo de falsos positivos y falsos negativos: al ser un clasificador, los errores se traducen en contenido mal etiquetado, no en alucinaciones, pero pueden afectar a moderación, enrutado o filtrado si se usa sin umbral de confianza.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia y se indiquen los cambios. No se declaran restricciones adicionales ni cláusulas de uso aceptable específicas del autor.
- Metadatos de fecha poco habituales (creación y actualización el 2026-09-29): conviene verificar la vigencia del repositorio antes de integrarlo.
- La model card conserva el texto autogenerado por el `Trainer` ("More information needed", "proofread and complete it"): el autor no ha completado la documentación de usos previstos ni de limitaciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aantaki/learn_hf_food_not_food_text_classifier-distilbert-base-uncased
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Paper de DistilBERT (referencia del modelo base): no disponible en la información proporcionada
- Repositorio de código o demo: no disponible
- Blog o nota técnica del autor: no disponible
- Búsqueda web: no se han encontrado enlaces relevantes. El único resultado devuelto (https://concertsnear.me/indie/) es un sitio de venta de entradas de conciertos sin relación alguna con el modelo.
