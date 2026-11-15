# juanmorc/beto-sarcasmo-bs64

## Resumen

beto-sarcasmo-bs64 es un modelo de clasificación de texto obtenido mediante fine-tuning supervisado de dccuchile/bert-base-spanish-wwm-cased, el checkpoint BERT en castellano entrenado por el grupo DCC de la Universidad de Chile sobre el corpus de Wikipedia hispana con enmascarado de palabras completas (WWM). El autor del ajuste es el usuario de Hugging Face juanmorc, y el propósito declarado del modelo es la detección de sarcasmo en textos en castellano, una tarea de clasificación binaria o multietiqueta que se enmarca en el análisis de sentimiento y la moderación de contenido.

El modelo conserva la arquitectura BERT base intacta: 109.852.418 parámetros totales (aproximadamente 110 M, coherente con un encoder de 12 capas, 768 dimensiones ocultas y 12 cabezas de atención) y un repositorio de 0,4 GB en safetensors. La cabeza de clasificación se ha reentrenado sobre un conjunto de datos que el autor no documenta. La model card indica que el entrenamiento se realizó con 8 épocas, batch total de 64 (32 × 2 de acumulación), learning rate 2e-05 con scheduler lineal y warmup del 10 %, precisión mixta nativa AMP y semilla 42, alcanzando en el conjunto de evaluación una accuracy de 0,9220 y un F1 macro de 0,9181.

Su relevancia práctica es acotada pero concreta: ofrece un punto de partida ligero y desplegable en CPU para experimentos de detección de sarcasmo en castellano, con métricas de validación razonables, aunque con documentación mínima, sin licencia declarada y sin información sobre el dataset de entrenamiento. Es, por tanto, un artefacto de investigación reproducible más que un componente listo para producción sin auditoría previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT base (12 capas, 768 dimensiones ocultas, 12 cabezas de atención), con cabeza de clasificación de secuencia |
| Parametros totales | 109.852.418 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base BERT admite hasta 512 tokens posicionales |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite cuantización dinámica int8 vía PyTorch y conversión a ONNX/GGUF con herramientas externas) |
| Idiomas soportados | no disponible de forma explícita; el modelo base está entrenado sobre corpus en castellano |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 0,4 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo de dccuchile/bert-base-spanish-wwm-cased, un BERT base entrenado con enmascarado de palabras completas sobre un corpus en castellano. La arquitectura es un transformer encoder bidireccional estándar con embeddings de token, posición y tipo de segmento, 12 bloques de autoatención multi-cabeza y una capa densa final adaptada a la clasificación. No incorpora innovaciones arquitectónicas propias: es un ajuste supervisado clásico con `Trainer` de Hugging Face, tal como indica la etiqueta `generated_from_trainer`.

Los detalles del dataset de entrenamiento no están documentados: la model card indica explícitamente "unknown dataset" y "More information needed" en las secciones de descripción, usos previstos y datos de entrenamiento. Se desconoce el número de ejemplos, la composición, el balance de clases y si hubo aumentación de datos. El procedimiento sí está documentado: 8 épocas, batch total de 64, AdamW fused con betas (0,9; 0,999) y epsilon 1e-08, LR 2e-05 con scheduler lineal y warmup del 10 %, precisión mixta AMP nativa, semilla 42, y evaluación con `eval_batch_size` de 64. El entrenamiento se ejecutó con Transformers 5.23.0, PyTorch 2.14.1+cu130, Datasets 5.2.0 y Tokenizers 0.23.3. No se menciona RLHF, DPO ni decodificación especulativa, lo cual es esperable en un clasificador.

## Capacidades

- Clasificación de texto: asigna una etiqueta (presumiblemente sarcasmo / no sarcasmo) a una secuencia de entrada, con salida de logits por clase.
- Detección de sarcasmo en castellano: propósito declarado del ajuste, aunque la taxonomía exacta de etiquetas no está documentada.
- Análisis de sentimiento y pragmática: potencial uso indirecto como señal auxiliar en pipelines de moderación o comprensión de opiniones.
- Codificación contextual: los embeddings del encoder pueden reutilizarse para similitud semántica o clustering, aunque el modelo no está optimizado para ello.
- Sin tool calling ni function calling: no es un modelo generativo ni soporta agentes.
- Sin capacidades multimodales: solo texto.
- Sin modo de razonamiento explícito (thinking mode) ni generación libre.
- Multilingüismo: limitado al castellano por herencia del modelo base; no se declaran otros idiomas.

## Casos de uso

- Moderación de comentarios en foros y redes: el modelo puede puntuar cada mensaje con una probabilidad de sarcasmo para priorizar revisiones humanas o activar respuestas automáticas más empáticas, aprovechando su bajo coste de inferencia en CPU.
- Análisis de opiniones de producto: en un pipeline de reseñas en castellano, la señal de sarcasmo permite invertir la polaridad aparente de comentarios irónicos ("qué maravilla, se rompió a los dos días") antes de agregar sentimiento.
- Investigación en pragmática computacional: sirve como baseline reproducible para experimentos académicos sobre ironía y sarcasmo en español, dado que las métricas de validación están publicadas y el checkpoint es ligero.
- Enriquecimiento de datasets de atención al cliente: clasificar transcripciones de chats y correos para detectar frustración encubierta y enrutar al agente adecuado.
- Filtrado previo en sistemas de reputación: detectar reseñas irónicas que podrían distorsionar puntuaciones agregadas en marketplaces.
- Etiquetado asistido en anotación humana: preanotar grandes volúmenes de texto en castellano para que los anotadores solo revisen los casos dudosos, reduciendo coste de anotación.
- Señal auxiliar en sistemas de recomendación: incorporar la dimensión de sarcasmo en la representación de reseñas para mejorar la personalización.

## Benchmarks y rendimiento

Resultados declarados por el autor en el conjunto de evaluación (no se especifica el tamaño ni la composición de dicho conjunto):

| Metrica | Valor |
|---|---|
| Loss (evaluación) | 0,5779 |
| Accuracy | 0,9220 |
| F1 macro | 0,9181 |
| F1 weighted | 0,9219 |

Evolución por época (validation loss / accuracy / F1 macro / F1 weighted):

| Epoca | Validation loss | Accuracy | F1 macro | F1 weighted |
|---|---|---|---|---|
| 1 | 0,2758 | 0,8940 | 0,8880 | 0,8936 |
| 2 | 0,2367 | 0,9039 | 0,9001 | 0,9043 |
| 3 | 0,2562 | 0,9178 | 0,9134 | 0,9176 |
| 4 | 0,3463 | 0,9199 | 0,9160 | 0,9199 |
| 5 | 0,4833 | 0,9175 | 0,9122 | 0,9169 |
| 6 | 0,5269 | 0,9212 | 0,9169 | 0,9210 |
| 7 | 0,5738 | 0,9191 | 0,9152 | 0,9191 |
| 8 | 0,5779 | 0,9220 | 0,9181 | 0,9219 |

No se han publicado resultados de benchmarks estándar (MMLU, GLUE, etc.) en la información disponible. La model-index del autor está vacía (`results: []`), por lo que las cifras anteriores son las únicas disponibles y no son directamente comparables con otros modelos sin conocer el conjunto de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,45 GB en fp32 (110 M parámetros × 4 bytes) más overhead de activaciones; en fp16 unos 0,22 GB; en int8 dinámico unos 0,11 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una RTX 4090, A100 o H100 queda sobredimensionada para este modelo y solo se justificaría por throughput masivo en batch.
- Cabe holgadamente en GPU de consumo: GTX 1650, RTX 3060, RTX 4060, e incluso en iGPU modernas con suficiente memoria compartida.
- Despliegue: compatible con `transformers` (pipeline `text-classification`), Text Embeddings Inference (etiqueta `text-embeddings-inference`), endpoints compatibles, y exportación a ONNX Runtime para CPU. También es viable en FastAPI + `torch.compile` para baja latencia.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Por el tamaño del modelo, en CPU moderna se esperan decenas de inferencias por segundo en batch pequeño, pero no hay medición publicada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| beto-sarcasmo-bs64 | 109,85 M | hasta 512 tokens (heredado del base) | Clasificación de sarcasmo en castellano | no disponible | Hugging Face (0 descargas, 0 likes) |
| dccuchile/bert-base-spanish-wwm-cased | ~110 M | 512 tokens | Modelo base en castellano (MLM) | no disponible en esta ficha | Hugging Face, ampliamente usado |
| BETO (variantes de clasificación de sentimiento en español) | ~110 M | 512 tokens | Clasificación de sentimiento | variable según checkpoint | Hugging Face |
| RoBERTa-base BNE (Plan TL) | ~125 M | 512 tokens | Modelo base en castellano | no disponible en esta ficha | Hugging Face |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada, ya que beto-sarcasmo-bs64 no reporta resultados sobre benchmarks estándar ni sobre el mismo conjunto de evaluación que las alternativas.

## Limitaciones y advertencias

- Dataset de entrenamiento no documentado: se desconoce la procedencia, el tamaño, el balance de clases y los posibles sesgos del corpus, lo que impide evaluar la validez externa de las métricas reportadas.
- Métricas sin contexto: accuracy 0,9220 y F1 macro 0,9181 se calculan sobre un conjunto de evaluación no descrito; sin conocer su tamaño y composición no pueden interpretarse como garantía de generalización.
- Licencia no declarada: no se especifica licencia, lo que impide asumir derechos de uso comercial. Es imprescindible contactar con el autor antes de cualquier despliegue en producción.
- Idiomas: aunque el modelo base es en castellano, no se declaran idiomas soportados de forma explícita; el rendimiento en variantes dialectales o en textos con code-switching es desconocido.
- Riesgo de alucinación: al ser un clasificador, no genera texto, pero puede producir falsos positivos y falsos negativos sistemáticos en registros informales, memes o ironía no sarcástica.
- Sesgos potenciales: el sarcasmo es culturalmente dependiente; el modelo puede comportarse de forma desigual entre registros formales e informales, dialectos o grupos demográficos, sin que el autor haya publicado análisis de equidad.
- Longitud de entrada: limitada por la arquitectura BERT base (512 tokens); textos más largos requieren truncamiento o segmentación.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, creado en noviembre de 2026; es un artefacto reciente y sin validación comunitaria.
- Sin garantías de calibración: no se reportan curvas de calibración ni umbrales recomendados, por lo que el uso directo de probabilidades requiere ajuste previo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/juanmorc/beto-sarcasmo-bs64
- Modelo base: https://huggingface.co/dccuchile/bert-base-spanish-wwm-cased
- Repositorio del grupo DCC UChile (BETO): no disponible en la información proporcionada
- Paper de BETO: no disponible en la información proporcionada
- Demo o espacio asociado: no disponible
