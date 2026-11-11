# Juanpab07/beto-sarcasmo-spanish-2026_JP07

## Resumen

`Juanpab07/beto-sarcasmo-spanish-2026_JP07` es un modelo de clasificación de texto en castellano obtenido mediante fine-tuning supervisado de BETO (`dccuchile/bert-base-spanish-wwm-cased`), el BERT base entrenado específicamente para español por el equipo de DCC UChile. El modelo resuelve una tarea concreta: la detección de sarcasmo en textos en español, formulada como clasificación binaria o multiclase (la model card no especifica el número exacto de etiquetas). Se trata de un encoder de 109.852.418 parámetros, con arquitectura transformer bidireccional tipo BERT base y una longitud de contexto heredada del modelo base de 512 tokens.

El modelo es relevante por su nicho: el sarcasmo es un fenómeno pragmático difícil de detectar para los clasificadores de sentimiento convencionales, y los recursos anotados en español son escasos. Este checkpoint ofrece un punto de partida entrenado y evaluado (accuracy 0.9188 en el conjunto de evaluación declarado por el autor) para tareas de moderación de contenido, análisis de opinión y investigación en pragmática computacional en español. Su tamaño compacto (aproximadamente 440 MB en fp32, 4.4 GB de repositorio incluyendo checkpoints intermedios) permite desplegarlo en CPU y en GPUs de consumo.

No obstante, la información publicada es muy limitada: la model card es autogenerada por `Trainer`, no documenta el dataset de entrenamiento (aparece como `None`), no declara licencia, no especifica idiomas formalmente y no incluye resultados en el `model-index`. Cualquier uso en producción debe validarse contra un conjunto de evaluación propio antes de confiar en las métricas declaradas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional tipo BERT base (BETO, `bert-base-spanish-wwm-cased`) |
| Parámetros totales | 109.852.418 |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (heredada del modelo base BETO) |
| Tipos de cuantización | no disponible (compatible con cuantización dinámica de PyTorch y con formatos derivados de transformers, pero el autor no publica variantes) |
| Idiomas soportados | no disponible formalmente; el modelo base BETO está entrenado en español |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería `transformers`) |
| Tarea | `text-classification` |
| Modelo base | `dccuchile/bert-base-spanish-wwm-cased` |
| Tamaño del repositorio | 4.4 GB |
| Fecha de creación | 2026-11-11 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la de BETO: un transformer encoder de 12 capas, 768 dimensiones ocultas, 12 cabezas de atención y vocabulario WordPiece en minúsculas con *whole word masking* (cased), sobre el que se añade una cabeza de clasificación secuencial. El fine-tuning se realizó con `Trainer` de transformers (versión 5.22.1) y PyTorch 2.14.1+cu130, con precisión mixta nativa (AMP), optimizador AdamW fused (betas 0.9/0.999, epsilon 1e-8), learning rate 2e-5, scheduler lineal con 100 pasos de warmup, batch size de 32 en entrenamiento y evaluación, semilla 42 y 6 épocas planificadas.

El autor no documenta la composición del dataset de entrenamiento (la model card indica `None dataset`), ni el número de ejemplos, ni el proceso de anotación, ni si hubo aumento de datos o balanceo de clases. Tampoco se declara ningún proceso de RLHF, DPO o ajuste por preferencias, algo esperable en un encoder de clasificación. Las curvas de entrenamiento publicadas muestran sobreajuste a partir de la época 3: la pérdida de validación sube de 0.2328 (época 2) a 0.5433 (época 5), mientras la pérdida de entrenamiento cae de 0.1353 a 0.0152. El mejor punto de validación se alcanza en la época 3 (accuracy 0.9215, F1 0.9211), aunque el checkpoint final reportado corresponde a la época 5 con accuracy 0.9188.

## Capacidades

- Clasificación de texto en español orientada a la detección de sarcasmo (etiquetas no documentadas en la model card).
- Codificación contextual bidireccional de secuencias de hasta 512 tokens.
- Extracción de representaciones (embeddings) del token `[CLS]` y de tokens individuales, útil para tareas derivadas como similitud semántica o clustering.
- Fine-tuning adicional sobre el checkpoint para tareas relacionadas (ironía, sentimiento, humor, toxicidad) gracias a su compatibilidad con el ecosistema `transformers`.
- No soporta tool calling ni function calling: es un encoder de clasificación, no un modelo generativo.
- No soporta razonamiento multi-paso ni modo de pensamiento (*thinking*).
- No tiene capacidades de visión, audio ni multimodalidad.
- No es un modelo de chat ni mantiene conversaciones multi-turno de forma nativa.

## Casos de uso

- Moderación de comentarios en foros y redes sociales: el modelo puede puntuar cada comentario como sarcástico o no sarcástico antes de pasarlo a un moderador humano, reduciendo falsos positivos de sistemas de sentimiento que interpretan el sarcasmo literalmente. Su contexto de 512 tokens cubre la mayoría de comentarios y publicaciones cortas.
- Análisis de opinión en reseñas de producto: las reseñas con sarcasmo ("menuda maravilla de batería, dura horas... literalmente dos") invierten la polaridad aparente; un clasificador previo de sarcasmo permite enrutar esas reseñas a un analizador de sentimiento específico o a revisión manual.
- Investigación en pragmática computacional: sirve como línea base reproducible para experimentos sobre detección de ironía y sarcasmo en español, con hiperparámetros y curvas de entrenamiento documentados.
- Enriquecimiento de datasets de entrenamiento: el modelo puede preetiquetar grandes corpus en español para generar candidatos que luego se revisan y se usan para entrenar modelos mayores o para aumentar el conjunto de anotación.
- Monitorización de reputación de marca: detectar menciones sarcásticas de una marca o producto en redes sociales que los sistemas de análisis de sentimiento estándar clasificarían erróneamente como positivas.
- Filtrado previo en pipelines de atención al cliente: identificar mensajes de clientes con tono sarcástico o irónico para priorizar la intervención humana o ajustar la respuesta automática, dado el bajo coste de inferencia del modelo (encoder de 110M de parámetros).
- Detección de toxicidad encubierta: el sarcasmo suele acompañar a comentarios pasivo-agresivos; el modelo puede usarse como señal auxiliar en un clasificador multi-etiqueta de toxicidad.

## Benchmarks y rendimiento

El autor declara resultados en el conjunto de evaluación, pero el `model-index` está vacío (no hay resultados estructurados publicados). Los únicos datos disponibles son los de la model card y las curvas de entrenamiento:

| Métrica (conjunto de evaluación) | Valor |
|---|---|
| Loss | 0.5433 |
| Accuracy | 0.9188 |
| Precision | 0.9188 |
| Recall | 0.9188 |
| F1 | 0.9188 |

Evolución por época (datos del autor):

| Época | Paso | Validation loss | Accuracy | Precision | Recall | F1 |
|---|---|---|---|---|---|---|
| 1.0 | 478 | 0.2585 | 0.9034 | 0.9049 | 0.9034 | 0.9038 |
| 2.0 | 956 | 0.2328 | 0.9194 | 0.9196 | 0.9194 | 0.9189 |
| 3.0 | 1434 | 0.3568 | 0.9215 | 0.9215 | 0.9215 | 0.9211 |
| 4.0 | 1912 | 0.4578 | 0.9207 | 0.9205 | 0.9207 | 0.9205 |
| 5.0 | 2390 | 0.5433 | 0.9188 | 0.9188 | 0.9188 | 0.9188 |

Advertencia: precision, recall y F1 idénticos a accuracy sugieren un conjunto de evaluación balanceado o una métrica macro con clases equilibradas; sin información sobre el dataset no es posible verificar la robustez de estas cifras. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 440 MB de pesos más activaciones; en la práctica menos de 1 GB para secuencias de 512 tokens con batch pequeño.
- VRAM estimada en fp16/bf16: aproximadamente 220 MB de pesos; cabe holgadamente en cualquier GPU con 4 GB o más.
- GPU recomendadas: cualquier GPU moderna es suficiente; para alto throughput, A100, H100, L4 o T4; para desarrollo local, RTX 3060, RTX 4060, RTX 4090 o incluso iGPU con suficiente memoria compartida.
- Cabe en GPU de consumo: sí, en todas las GPU de consumo con al menos 2-4 GB de VRAM, y en CPU con latencias de decenas de milisegundos por secuencia corta.
- Opciones de despliegue: `transformers` (PyTorch), `text-embeddings-inference` (el modelo está etiquetado como compatible con TEI y endpoints), ONNX Runtime, TorchScript, y cuantización dinámica de PyTorch. No se publican pesos GGUF ni versiones para llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño (110M de parámetros, encoder) se espera un throughput de cientos a miles de secuencias por segundo en GPU moderna con batch grande, pero es una estimación, no un dato medido.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Juanpab07/beto-sarcasmo-spanish-2026_JP07` | 109,85 M | 512 | Clasificación de sarcasmo (español) | no disponible | Hugging Face, 0 descargas |
| `dccuchile/bert-base-spanish-wwm-cased` (BETO) | 109,85 M | 512 | Modelo base de lenguaje español | no disponible en la información | Hugging Face, ampliamente usado |
| `PlanTL-GOB-ES/roberta-base-bne` | ~125 M | 512 | Modelo base de lenguaje español | no disponible en la información | Hugging Face |
| `finiteautomata/beto-sentiment-analysis` | ~110 M | 512 | Análisis de sentimiento en español | no disponible en la información | Hugging Face |

La comparación con alternativas específicas de detección de sarcasmo en español no está disponible en la información proporcionada. BETO y RoBERTa-BNE son los encoders de referencia para tareas en español y servirían como línea base, pero este checkpoint no publica comparaciones directas con ellos.

## Limitaciones y advertencias

- Dataset de entrenamiento no documentado: la model card indica `None dataset`, por lo que se desconoce la procedencia, el tamaño, la anotación y el posible sesgo de las etiquetas.
- Sobreajuste evidente: la pérdida de validación se duplica entre las épocas 2 y 5 (0.2328 a 0.5433) mientras la de entrenamiento cae a 0.0152; el checkpoint final no es el mejor punto de validación.
- Métricas no verificables: precision, recall y F1 idénticos a accuracy sugieren un conjunto de evaluación equilibrado o mal reportado; no hay matriz de confusión ni desglose por clase.
- Licencia no disponible: no se puede confirmar el uso comercial; además, la licencia del modelo base BETO debe consultarse por separado.
- Idiomas no declarados formalmente: aunque el modelo base es de español, no se especifica la variedad dialectal ni el dominio de entrenamiento.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificaciones erróneas en contextos donde el sarcasmo depende de conocimiento cultural, ironía situacional o multimodalidad (texto e imagen).
- Contexto limitado a 512 tokens: textos largos deben truncarse, lo que puede eliminar la clave del sarcasmo.
- Sin soporte de tool calling, agentes ni generación: no es adecuado para tareas conversacionales.
- Modelo con 0 descargas y 0 likes: sin validación por parte de la comunidad; tratar como experimental.
- Fecha de creación futura (2026-11-11) en los metadatos: verificar la integridad del repositorio antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Juanpab07/beto-sarcasmo-spanish-2026_JP07
- Modelo base BETO: https://huggingface.co/dccuchile/bert-base-spanish-wwm-cased
- Repositorio de BETO (DCC UChile): no disponible en la información proporcionada
- Paper de BETO: no disponible en la información proporcionada
- Demos o espacios asociados: no disponibles en la información proporcionada
