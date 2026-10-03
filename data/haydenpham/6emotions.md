# haydenpham/6emotions

## Resumen

6Emotions es un paquete de tres clasificadores de emociones en inglés publicado por el usuario haydenpham en HuggingFace. Los tres resuelven exactamente la misma tarea: asignar a un texto una única etiqueta entre seis emociones (sadness, joy, love, anger, fear, surprise), y se evalúan sobre el mismo conjunto de test de 5.421 filas. La diferencia está en el enfoque: dos clasificadores clásicos de scikit-learn (regresión logística y un perceptrón multicapa sobre características TF-IDF de palabra y carácter) y un transformer destilado, `distilbert-base-uncased`, afinado durante 3 épocas.

El interés del conjunto es que funciona como referencia reproducible más que como producto: el código de entrenamiento está publicado en GitHub, los tres modelos comparten partición de datos y conjunto de evaluación, la licencia es MIT y el repositorio ocupa 0,8 GB. Ofrece además una comparación directa entre el coste de inferencia de un modelo lineal y el de un encoder transformer, con exactitudes de test que van de 0,7449 (LogReg) a 0,8273 (DistilBERT).

Conviene subrayar que no son modelos generativos: no producen texto libre, no soportan tool calling ni razonamiento multi-paso y no aceptan instrucciones. Son clasificadores de etiqueta única, entrenados solo en inglés y con datos de registro informal, por lo que su ámbito natural es el análisis de emociones en comentarios, reseñas y redes sociales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tres variantes: regresión logística sobre TF-IDF (sklearn), MLP de una capa oculta de 512 unidades ReLU sobre TF-IDF (sklearn) y encoder transformer destilado (`distilbert-base-uncased`) |
| Parametros totales | DistilBERT: aproximadamente 66 millones (arquitectura `distilbert-base-uncased`). LogReg y MLP: no disponible (depende del vocabulario TF-IDF, no publicado) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | DistilBERT: 512 tokens como límite arquitectónico; no se especifica la longitud máxima usada en entrenamiento. LogReg y MLP: no aplica (bolsa de n-gramas sin ventana) |
| Tipos de cuantizacion | No disponible; no se publican versiones cuantizadas (GGUF, ONNX, int8) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | DistilBERT: safetensors y configuración de `transformers`. LogReg y MLP: skops (`6emotions_model.skops`) |
| Etiquetas de salida | 6: sadness, joy, love, anger, fear, surprise |
| Tarea | Clasificación de texto, etiqueta única (`text-classification`) |
| Métrica declarada | accuracy |
| Tamano del repositorio | 0,8 GB |

## Arquitectura y entrenamiento

El repositorio agrupa tres modelos independientes entrenados sobre la misma partición. Los datos combinan el Emotion Recognition Dataset y GoEmotions, con las etiquetas remapeadas a las seis emociones objetivo; se descartan los textos con etiquetas en conflicto y la clase `joy` se limita a 12.000 filas de entrenamiento, presumiblemente para corregir el desbalance de clases. El resultado son 39.718 filas de entrenamiento y 5.421 filas de test retenidas, sin solapamiento entre ambos conjuntos (ningún texto de test aparece en entrenamiento).

Las dos variantes clásicas comparten ingeniería de características: TF-IDF a nivel de palabra y de carácter. Sobre esas características, LogReg usa regresión logística con `C=1.0` y `class_weight` balanceado, y el MLP añade una única capa oculta de 512 unidades ReLU. DistilBERT se afina desde `distilbert-base-uncased` durante 3 épocas con tasa de aprendizaje 2e-5 y función de pérdida ponderada (`weighted loss`) para compensar el desbalance. No se documenta uso de RLHF, DPO ni decodificación especulativa, algo esperable al tratarse de clasificación y no de generación. El remapeo de etiquetas de GoEmotions (por ejemplo `approval` a joy y `curiosity` a surprise) es la principal fuente de ruido declarada por el autor.

## Capacidades

- Clasificación de emociones en texto inglés con una sola etiqueta de salida entre seis clases.
- Detección de emociones en registros informales: comentarios, publicaciones en redes sociales y reseñas (dominio predominante de GoEmotions).
- Inferencia sin GPU para las variantes TF-IDF, al ser pipelines de scikit-learn serializados con skops.
- Etiquetado por lotes de grandes volúmenes de texto mediante `predict` (sklearn) o `pipeline("text-classification")` (transformers).
- Integración directa con el ecosistema `transformers` para la variante DistilBERT y con `huggingface_hub` + `skops.io` para las variantes lineales.
- No soporta tool calling, function calling ni uso como agente.
- No soporta razonamiento multi-paso, ventanas de contexto largas ni conversación multi-turno.
- No tiene capacidades multilingües: solo inglés.
- No tiene visión, audio ni modo de razonamiento.

## Casos de uso

- Moderación y triaje de comunidades: clasificar comentarios en anger, fear o sadness para enrutar automáticamente las publicaciones que requieren revisión humana, aprovechando que el modelo se entrenó sobre datos de registro informal.
- Análisis de sentimiento en atención al cliente: etiquetar tickets y conversaciones con la emoción predominante para priorizar colas y detectar clientes frustrados antes de que escalen la incidencia.
- Monitorización de marca en redes sociales: procesar en lote menciones en inglés con la variante LogReg, que se ejecuta en CPU y permite clasificar grandes volúmenes sin coste de GPU.
- Enriquecimiento de datasets para investigación: usar las predicciones como etiqueta auxiliar o como filtro previo en estudios de afectividad, dado que el código de entrenamiento y la partición son reproducibles.
- Detección de contenido de riesgo en plataformas: señalizar textos con alta probabilidad de fear o sadness como candidatos a intervención, siempre con revisión humana posterior.
- Clasificación de reseñas de producto: separar opiniones de joy frente a anger para resúmenes agregados por producto y seguimiento de la evolución temporal de la satisfacción.
- Filtrado previo en pipelines de NLP más costosos: usar el MLP o LogReg como etapa barata que descarte textos neutros antes de aplicar un modelo mayor.
- Demo educativa de comparación de enfoques: el repositorio permite reproducir en un mismo dataset la brecha entre bolsa de palabras y un encoder transformer (0,7449 frente a 0,8273 de exactitud).

## Benchmarks y rendimiento

El autor publica únicamente exactitud sobre el conjunto de test de 5.421 filas, común a los tres modelos:

| Modelo | Configuracion | Exactitud de test |
|---|---|---:|
| LogReg | TF-IDF de palabra y carácter, regresión logística, `C=1.0`, balanceado | 0,7449 |
| MLP | Mismas características TF-IDF, una capa oculta de 512 unidades ReLU | 0,7558 |
| DistilBERT | `distilbert-base-uncased` afinado, 3 épocas, lr 2e-5, pérdida ponderada | 0,8273 |

Datos de entrenamiento y evaluación: 39.718 filas de entrenamiento y 5.421 de test, procedentes del Emotion Recognition Dataset y GoEmotions. No se publican resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark, que por otra parte no aplicarían a un clasificador de seis clases. No se publican métricas por clase, F1 macro ni matrices de confusión, algo relevante dado el desbalance de clases que el propio autor corrige limitando `joy` a 12.000 filas.

## Requisitos de hardware

- DistilBERT (aproximadamente 66 millones de parámetros): unos 265 MB en fp32 y unos 132 MB en fp16 solo para los pesos. Con activaciones para lote pequeño y 512 tokens, la VRAM necesaria queda por debajo de 1 GB.
- GPUs recomendadas: cualquier GPU consumer sirve; una RTX 3060, RTX 4090 o incluso una GPU integrada reciente son suficientes. No se requiere A100 ni H100 en ningún escenario.
- Las variantes LogReg y MLP no necesitan GPU: son pipelines de scikit-learn y se ejecutan en CPU con memoria principal del orden de cientos de MB.
- Inferencia en CPU: viable para los tres modelos. DistilBERT es el más exigente, pero sigue siendo un modelo pequeño apto para CPU con lotes moderados.
- Opciones de despliegue: `transformers` con `pipeline` para DistilBERT; `skops.io` para las variantes sklearn; servido HTTP propio con FastAPI o similar; `vLLM`, `llama.cpp`, Ollama y TGI no aplican, al no ser modelos generativos ni disponer de pesos GGUF.
- Latencia y throughput: no disponibles. El autor no publica mediciones y no se han encontrado números de referencia en la información disponible.
- El repositorio ocupa 0,8 GB porque contiene los tres conjuntos de pesos y artefactos auxiliares; el modelo DistilBERT por sí solo es una fracción de ese tamaño.

## Comparativa con modelos similares

Comparación estructural con otras alternativas de clasificación de emociones en inglés. Los datos de exactitud de los modelos comparados no están incluidos en la información disponible, por lo que no se contrastan cifras: cada uno se evalúa sobre su propio conjunto de test y los números no son directamente comparables con el 0,8273 de 6Emotions.

| Modelo | Arquitectura | Parametros | Etiquetas | Contexto | Licencia | Idiomas |
|---|---|---|---|---|---|---|
| 6Emotions (DistilBERT) | DistilBERT afinado | ~66 M | 6 | 512 tokens (límite arquitectónico) | MIT | Inglés |
| 6Emotions (MLP / LogReg) | TF-IDF + sklearn | No disponible | 6 | No aplica | MIT | Inglés |
| j-hartmann/emotion-english-distilroberta-base | DistilRoBERTa afinado | ~82 M | 7 (Ekman + neutral) | 512 tokens | No disponible | Inglés |
| SamLowe/roberta-base-go_emotions | RoBERTa afinado | ~125 M | 28 | 512 tokens | No disponible | Inglés |
| cardiffnlp/twitter-roberta-base-emotion | RoBERTa afinado | ~125 M | 4 | 512 tokens | No disponible | Inglés |

Frente a estos modelos, 6Emotions aporta una taxonomía de seis emociones intermedias entre las 4 de CardiffNLP y las 28 de GoEmotions, un modelo lineal que puede ejecutarse sin GPU y la publicación del código de entrenamiento. Como contrapartida, tiene cero descargas y cero valoraciones en el momento de redactar esta ficha, frente a alternativas con amplia adopción comunitaria.

## Limitaciones y advertencias

- Clasificadores de etiqueta única: no pueden expresar emociones mixtas ni intensidades, algo frecuente en texto real.
- Solo inglés. El rendimiento en otros idiomas no se ha evaluado y no hay indicios de que se haya entrenado con datos multilingües.
- Sesgo de dominio: los datos provienen de GoEmotions, basado en comentarios de Reddit, y de un dataset de reconocimiento de emociones. El comportamiento en escritura formal, técnica o académica no está evaluado y probablemente sea peor.
- Ruido de etiquetas declarado por el propio autor: el remapeo de etiquetas de GoEmotions (`approval` a joy, `curiosity` a surprise, entre otras) introduce ruido que limita la exactitud de los tres modelos.
- Desbalance de clases: `joy` se limita a 12.000 filas de entrenamiento, lo que sugiere un desbalance marcado. No se publican métricas por clase, así que no puede descartarse un rendimiento desigual entre emociones poco frecuentes.
- Riesgo de alucinación no aplica en sentido generativo (el modelo no produce texto), pero sí existe riesgo de falsos positivos y falsos negativos sistemáticos en textos ambiguos o irónicos, no evaluado en la documentación.
- Licencia MIT: permite uso comercial, modificación y redistribución con atribución y conservación del aviso de copyright. No hay cláusulas de uso restringido, pero tampoco garantía alguna por parte del autor.
- Los modelos sklearn se cargan con `skops.io` y requieren declarar explícitamente las clases de confianza (`trusted`), lo que implica un riesgo de seguridad si el fichero no proviene de una fuente verificada.
- Ausencia de validación comunitaria: cero descargas y cero valoraciones en HuggingFace. No hay evidencia externa de robustez ni de comportamiento en producción.
- Para uso clínico, diagnóstico o cualquier aplicación sensible al estado emocional de una persona, estos modelos no son adecuados: no hay validación, ni métricas por subgrupo, ni análisis de sesgos demográficos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/haydenpham/6emotions
- Código de entrenamiento en GitHub: https://github.com/haydenpham/6Emotions
- Documentación de las variantes dentro del repositorio: `logreg/README.md`, `mlp/README.md` y `distilbert/README.md` (rutas relativas dentro del repositorio de HuggingFace)
- Pesos de las variantes sklearn: `logreg/6emotions_model.skops` y `mlp/6emotions_model.skops`
- Conjuntos de datos citados: Emotion Recognition Dataset y GoEmotions (no se proporcionan URL directas en la model card)
- Repositorio del tokenizador y modelo base: `distilbert-base-uncased` en HuggingFace
