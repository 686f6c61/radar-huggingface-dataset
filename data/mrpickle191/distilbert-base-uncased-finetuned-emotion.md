# MrPickle191/distilbert-base-uncased-finetuned-emotion

## Resumen

`distilbert-base-uncased-finetuned-emotion` es un checkpoint de clasificación de texto obtenido por ajuste fino (fine-tuning) del modelo `distilbert-base-uncased` sobre un conjunto de datos de emociones que el autor no documenta. Lo publica el usuario MrPickle191 en HuggingFace y su model card se ha generado automáticamente con el `Trainer` de Transformers, sin descripción, sin usos previstos declarados y sin métricas de evaluación. El repositorio es, por tanto, un artefacto de entrenamiento más que un modelo documentado y validado para producción.

Arquitectónicamente es un encoder transformer de 6 capas y 12 cabezas de atención con dimensión oculta 768, lo que da 66.958.086 parámetros exactos (unos 67 M) y una ventana máxima de 512 tokens, heredada de DistilBERT. El ajuste fino se hizo durante 2 épocas con learning rate 2e-05, batch de 64, AdamW fusionado y scheduler lineal, según los hiperparámetros que declara la model card.

Su relevancia práctica es limitada pero real: sirve como ejemplo reproducible de fine-tuning de un encoder pequeño para clasificación de emociones, como baseline ligero para tareas de triaje de texto y como punto de partida para quien quiera reentrenar con su propio etiquetado. Con 0 descargas, 0 likes y sin resultados de benchmarks publicados, no debe tratarse como un modelo de referencia ni asumir su calidad sin una evaluación propia previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, 6 capas, 12 cabezas, dimensión oculta 768) |
| Parámetros totales | 66.958.086 (≈ 67 M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (límite de `max_position_embeddings` de DistilBERT; no declarado explícitamente en la model card) |
| Tipos de cuantización | No declarados por el autor; el repositorio solo contiene pesos safetensors en precisión completa. Cuantización dinámica int8 y exportación a ONNX son viables con herramientas externas (PyTorch/Optimum) |
| Idiomas soportados | No disponible (el tokenizador base es `uncased` en inglés; el autor no declara idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |
| Tarea (pipeline) | text-classification |
| Modelo base | distilbert-base-uncased |
| Tamaño del repositorio | 0,3 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-27 |

## Arquitectura y entrenamiento

El modelo es un DistilBERT, es decir, un encoder transformer destilado de BERT-base mediante knowledge distillation: conserva la mitad de las capas del profesor (6 frente a 12), mantiene 768 dimensiones ocultas y 12 cabezas de atención, y elimina el entrenamiento de tipo masked language modeling con token-type embeddings. Sobre esa base se ha añadido una cabeza de clasificación de secuencia, típica del pipeline `text-classification`. La longitud máxima de entrada queda fijada en 512 tokens por las posiciones absolutas aprendidas del modelo original.

El autor no especifica el dataset de ajuste fino: la model card indica literalmente "unknown dataset" y no documenta la taxonomía de etiquetas, el número de clases ni el volumen de ejemplos. Tampoco hay información sobre si hubo aumentación de datos o balanceo de clases. Los hiperparámetros declarados son los siguientes:

| Hiperparámetro | Valor |
|---|---|
| Learning rate | 2e-05 |
| Train batch size | 64 |
| Eval batch size | 64 |
| Épocas | 2 |
| Optimizador | AdamW (variante `ADAMW_TORCH_FUSED`), betas (0,9; 0,999), epsilon 1e-08 |
| Scheduler | Lineal |
| Semilla | 42 |
| Transformers | 5.20.2 |
| PyTorch | 2.11.0+cu130 |
| Datasets | 4.8.5 |
| Tokenizers | 0.23.3 |

No se declara ninguna innovación técnica adicional (decodificación especulativa, atención lineal, RLHF/DPO ni variantes de arquitectura); se trata de un fine-tuning estándar supervisado con `Trainer`.

## Capacidades

- Clasificación de texto a nivel de secuencia: devuelve una distribución de probabilidad sobre las etiquetas de emoción aprendidas durante el ajuste fino (la lista concreta de etiquetas no está documentada en el repositorio).
- Manejo de entradas de hasta 512 tokens, suficiente para frases, tuits, reseñas cortas y párrafos breves.
- Tokenizador WordPiece `uncased`: normaliza a minúsculas y elimina la distinción entre mayúsculas y minúsculas.
- Inferencia ligera: 67 M de parámetros permiten ejecución en CPU y en GPUs de gama baja.
- Compatible con la infraestructura estándar de HuggingFace: `pipeline("text-classification")`, `AutoModelForSequenceClassification` y despliegue vía Text Embeddings Inference (el repositorio está etiquetado como `text-embeddings-inference` y `endpoints_compatible`).
- No soporta generación de texto, tool calling, razonamiento multi-paso, agentes, visión, audio ni modo "thinking": es un encoder discriminativo, no un modelo generativo.
- Capacidades multilingües: no declaradas; el tokenizador base está orientado a inglés.

## Casos de uso

- Triaje de tickets de soporte: clasificar el correo o mensaje entrante en categorías emocionales (frustración, satisfacción, neutralidad) para priorizar la cola de atención. Adecuado por su bajo coste por inferencia y su latencia mínima en CPU, aunque exige validar antes el mapeo de etiquetas.
- Moderación de comentarios en comunidades: filtrar mensajes con carga emocional negativa antes de la revisión humana, usando el clasificador como primera etapa de un pipeline de dos niveles.
- Análisis de encuestas abiertas (NPS, CSAT): agregar respuestas de texto libre en categorías emocionales para complementar las puntuaciones numéricas, con procesamiento por lotes de miles de respuestas en pocos minutos.
- Monitorización de menciones en redes sociales: etiquetar publicaciones cortas (por debajo de 512 tokens) en tiempo casi real y generar series temporales de tono emocional por marca o producto.
- Enrutamiento de feedback de producto: clasificar reseñas de app store o formularios internos y derivarlas automáticamente al equipo correspondiente según la emoción detectada.
- Baseline académico y experimentos de destilación: punto de partida reproducible (semilla 42, hiperparámetros públicos) para comparar técnicas de fine-tuning de encoders pequeños en tareas de emoción.
- Preetiquetado para anotación humana: usar el modelo como asistente de etiquetado y reservar la revisión humana para los casos de baja confianza.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El campo `model-index` del repositorio contiene una entrada con la lista de resultados vacía, y la sección "Training results" de la model card está en blanco. No existen métricas declaradas de accuracy, F1, precisión o recall, ni comparaciones con otros modelos.

## Requisitos de hardware

- Huella de pesos: 66.958.086 parámetros. En fp32 ocupan aproximadamente 268 MB; en fp16, unos 134 MB; en int8 dinámico, unos 67 MB. El repositorio completo pesa 0,3 GB.
- VRAM estimada para inferencia: por debajo de 1 GB con lotes pequeños (8-32 secuencias de longitud corta); 1-2 GB en el peor caso con lotes grandes y secuencias de 512 tokens.
- GPU recomendadas: cualquier GPU consumer sirve. Una RTX 3060, RTX 4060 o RTX 4090 ejecutan el modelo con holgura; A100 o H100 son innecesarias y no aportan ventaja apreciable para este tamaño.
- Cabe en CPU: sí, de forma holgada. Es viable en portátiles y en contenedores sin GPU, lo que abarata el despliegue por lotes.
- Opciones de despliegue: `transformers` (pipeline y `AutoModel`), Text Embeddings Inference (etiqueta oficial del repo), HuggingFace Inference Endpoints (`endpoints_compatible`), exportación a ONNX Runtime con Optimum para acelerar en CPU, y `torch.compile`/TorchScript en GPU. No hay pesos GGUF publicados ni configuración verificada para vLLM o llama.cpp en tareas de clasificación.
- Latencia y throughput: no hay mediciones publicadas en el repositorio. Por el tamaño del modelo, se espera latencia de milisegundos y throughput alto por lotes, pero debe medirse en el hardware objetivo antes de dimensionar un servicio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MrPickle191/distilbert-base-uncased-finetuned-emotion | 66,96 M | 512 tokens | Clasificación de emociones (etiquetas no documentadas) | Apache 2.0 | Público en HF, 0 descargas, sin métricas |
| distilbert-base-uncased-finetuned-sst-2-english (HuggingFace) | ≈ 67 M | 512 tokens | Análisis de sentimiento binario (positivo/negativo) | Apache 2.0 | Público en HF, ampliamente utilizado, con métricas en model card |
| bhadresh-savani/distilbert-base-uncased-emotion | ≈ 67 M | 512 tokens | Clasificación de 6 emociones | Apache 2.0 | Público en HF, con dataset y métricas declaradas |
| j-hartmann/emotion-english-distilroberta-base | ≈ 82 M | 512 tokens | Clasificación de 7 emociones | Apache 2.0 | Público en HF, con métricas declaradas |
| SamLowe/roberta-base-go_emotions | ≈ 125 M | 512 tokens | 28 emociones (etiquetas GoEmotions) | MIT | Público en HF, muy utilizado, con métricas |

La diferencia principal frente a las alternativas no es de arquitectura ni de tamaño, sino de documentación y validación: los modelos comparables publican dataset, taxonomía de etiquetas y métricas de evaluación, mientras que este checkpoint no ofrece ninguno de esos elementos.

## Limitaciones y advertencias

- Dataset y etiquetas sin documentar: se desconoce qué corpus se usó, cuántas clases hay y en qué orden se devuelven las etiquetas. Sin ese mapeo, la salida del clasificador no es interpretable de forma fiable.
- Ausencia total de métricas: no hay accuracy, F1 ni matriz de confusión. No es posible afirmar que el modelo sea mejor que un clasificador trivial sin evaluarlo con un conjunto de test propio.
- Ventana de 512 tokens: los documentos largos deben truncarse o dividirse, con la consiguiente pérdida de contexto.
- Idioma: el tokenizador `uncased` del modelo base está orientado a inglés. No hay evidencia de funcionamiento en castellano ni en otros idiomas; usarlo fuera del inglés produciría resultados no validados.
- Sesgos: al desconocerse el corpus de entrenamiento, no se pueden caracterizar los sesgos demográficos, culturales o de dominio. Un dataset de emociones suele estar desequilibrado hacia ciertas clases, lo que se traduciría en umbrales de decisión sesgados.
- Riesgo de alucinación: no aplica en sentido generativo (el modelo no produce texto libre), pero sí existe riesgo de sobreconfianza: la softmax puede devolver probabilidades altas en entradas fuera de distribución.
- Sin información de calibración: no se han publicado curvas de fiabilidad ni umbrales recomendados, algo crítico si se usa para moderación o triaje automatizado.
- Licencia Apache 2.0: permite uso comercial y modificación, con obligación de conservar el aviso de licencia y el archivo NOTICE si existe, y sin garantías por parte del autor.
- Modelo no validado por la comunidad: 0 descargas y 0 likes en el momento de la consulta; no hay reportes de terceros sobre su comportamiento.
- Model card autogenerada: el propio texto advierte de que debe revisarse y completarse, lo que confirma que falta documentación esencial.
- Para producción se recomienda evaluar contra un modelo comparable documentado (por ejemplo, `j-hartmann/emotion-english-distilroberta-base`) y establecer un umbral de confianza con revisión humana en los casos dudosos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MrPickle191/distilbert-base-uncased-finetuned-emotion
- Modelo base: https://huggingface.co/distilbert-base-uncased
- Paper de DistilBERT (Sanh et al., 2019): https://arxiv.org/abs/1910.01108
- Documentación de Transformers para text-classification: https://huggingface.co/docs/transformers/tasks/sequence_classification
- Documentación de Text Embeddings Inference: https://huggingface.co/docs/text-embeddings-inference
