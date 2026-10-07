# lapik/ner-dl2

## Resumen

lapik/ner-dl2 es un modelo de clasificación de tokens (reconocimiento de entidades nombradas, NER) obtenido mediante fine-tuning del encoder BAAI/bge-small-en-v1.5. Lo publica el usuario lapik en HuggingFace bajo licencia MIT, con un total de 33.215.625 parámetros y un repositorio de apenas 0,1 GB. Se distribuye en formato safetensors y es compatible con la librería transformers, por lo que puede cargarse directamente con el pipeline `token-classification`. El modelo se generó automáticamente con el `Trainer` de HuggingFace, y su model card no documenta ni el conjunto de datos de entrenamiento ni las etiquetas de entidad utilizadas.

El interés práctico del modelo reside en su tamaño reducido: al apoyarse en bge-small, un encoder de la familia BERT de 33 millones de parámetros, la inferencia es muy económica y puede ejecutarse incluso en CPU o en GPUs de gama baja, lo que lo hace atractivo para tareas de extracción de entidades de alto volumen y baja latencia. Sin embargo, la información publicada es muy escasa: no se especifican los idiomas soportados, el dataset de entrenamiento, el esquema de etiquetas ni el dominio de aplicación previsto, y el campo `results` del model-index está vacío.

Por tanto, se trata de un artefacto experimental o de uso interno más que de un modelo listo para producción: las métricas declaradas en la evaluación (F1 de 0,8644 y exactitud de 0,9744) son razonables, pero no pueden contextualizarse sin conocer los datos de evaluación ni el esquema de entidades. Cualquier adopción debería ir precedida de una validación propia sobre el dominio objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder tipo BERT (base: BAAI/bge-small-en-v1.5) con cabeza de clasificación de tokens |
| Parametros totales | 33.215.625 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican versiones cuantizadas) |
| Idiomas soportados | no disponible (el modelo base es de lengua inglesa, pero no se documenta el idioma de los datos de entrenamiento) |
| Licencia | MIT |
| Formato de pesos | safetensors (compatible con transformers) |
| Pipeline | token-classification (NER) |
| Modelo base | BAAI/bge-small-en-v1.5 |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-07 |
| Ultima actualizacion | 2026-10-07 |

## Arquitectura y entrenamiento

La arquitectura es la de un encoder transformer de la familia BERT, heredada del modelo base BAAI/bge-small-en-v1.5, al que se le ha añadido una cabeza de clasificación por token para resolver una tarea de etiquetado de secuencias (NER). No hay innovaciones arquitectónicas propias: no se emplean mecanismos de atención lineal, SSM ni mezclas de expertos, y no se documenta ninguna técnica de decodificación especulativa. El recuento total de parámetros (33.215.625) corresponde al encoder más la cabeza de clasificación.

El entrenamiento se realizó con el `Trainer` de HuggingFace sobre un dataset no especificado ("unknown dataset" según la propia model card). Los hiperparámetros documentados son: learning rate de 2e-05, tamaño de lote de 16 tanto en entrenamiento como en evaluación, 3 épocas completas (1.875 pasos), semilla 42, optimizador AdamW con betas (0,9 / 0,999) y epsilon 1e-08, y un scheduler lineal sin warmup declarado. No se menciona el uso de RLHF, DPO ni ningún otro ajuste por preferencias, algo esperable en un modelo de clasificación. Las versiones de framework empleadas fueron Transformers 4.51.3, PyTorch 2.11.0+cu128, Datasets 4.8.5 y Tokenizers 0.21.4.

## Capacidades

- Reconocimiento de entidades nombradas (NER) como tarea principal, en formato de clasificación por token (pipeline `token-classification`).
- Extracción de entidades en texto plano mediante la API estándar de transformers (`pipeline` o `AutoModelForTokenClassification`).
- Devuelve etiquetas por token con puntuaciones de confianza asociadas.
- Capacidad multilingüe: no documentada; el modelo base es de lengua inglesa, por lo que el soporte de otros idiomas no puede darse por supuesto.
- Tool calling / function calling: no soportado (no es un modelo generativo).
- Agentes y razonamiento multi-paso: no aplicable.
- Generación de texto, código, matemáticas o visión: no aplicable; es un modelo exclusivamente discriminativo de etiquetado.
- Esquema de etiquetas (tipos de entidad reconocidos): no disponible en la información publicada.

## Casos de uso

- Extracción de entidades en pipelines de procesamiento documental: el modelo puede integrarse como etapa de etiquetado sobre texto previamente extraído de facturas, contratos o correos, aprovechando su tamaño de 33 M de parámetros para procesar grandes volúmenes con coste mínimo.
- Anonimización de datos personales antes de almacenamiento o análisis: si el esquema de etiquetas incluye personas, organizaciones o lugares, las entidades detectadas pueden enmascararse en un paso posterior; requiere validar previamente qué etiquetas produce realmente el modelo.
- Enriquecimiento de metadatos en buscadores internos: indexar documentos añadiendo entidades detectadas como campos estructurados, mejorando los filtros y la recuperación.
- Preprocesado para sistemas RAG: identificar entidades en las consultas o en los fragmentos recuperados para construir filtros o grafos de conocimiento sobre los que apoyar la recuperación.
- Análisis de opiniones y menciones de marca: extracción de organizaciones y productos en reseñas o publicaciones para alimentar cuadros de mando de reputación, siempre que el dominio coincida con el de entrenamiento.
- Etiquetado asistido para anotación humana: usar el modelo como preanotador en herramientas como Label Studio o Prodigy y reducir el esfuerzo de anotación manual, revisando después las predicciones.
- Clasificación de tickets de soporte: detectar entidades (productos, versiones, ubicaciones) en los mensajes entrantes para enrutarlos automáticamente al equipo correspondiente.
- Experimentación académica y comparación de fine-tunings: al ser un ajuste sobre bge-small con licencia MIT y pesos ligeros, sirve como punto de partida reproducible para estudiar el efecto de distintos datasets de NER sobre un mismo encoder.

## Benchmarks y rendimiento

El model-index del autor está vacío (`results: []`), por lo que no hay benchmarks estándar como MMLU, GLUE o CoNLL publicados. Los únicos datos disponibles son las métricas de evaluación declaradas por el autor durante el entrenamiento, que se reproducen íntegramente a continuación. Se desconoce el conjunto de evaluación utilizado y el esquema de etiquetas, por lo que estas cifras no son comparables con resultados publicados de otros modelos NER.

| Epoca | Paso | Training loss | Validation loss | Precision | Recall | F1 | Accuracy |
|---|---|---|---|---|---|---|---|
| 1,0 | 625 | 0,4894 | 0,1932 | 0,7403 | 0,7906 | 0,7646 | 0,9579 |
| 2,0 | 1250 | 0,1882 | 0,1319 | 0,8343 | 0,8748 | 0,8541 | 0,9727 |
| 3,0 | 1875 | 0,1391 | 0,1198 | 0,8429 | 0,8869 | 0,8644 | 0,9744 |

Resultado final declarado en la model card: loss 0,1198, precision 0,8429, recall 0,8869, F1 0,8644 y accuracy 0,9744. Cabe señalar que la exactitud (0,9744) está inflada por el desbalance típico de las tareas NER, donde la mayoría de los tokens corresponden a la clase "no entidad"; la métrica relevante es el F1 de 0,8644.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 133 MB solo para los pesos, más activaciones y overhead del runtime; en la práctica cabe en cualquier GPU y también en CPU.
- VRAM estimada en FP16/BF16: aproximadamente 66 MB de pesos, aunque el modelo puede requerir conversión explícita, ya que no se publican versiones ya convertidas.
- VRAM estimada en INT8: aproximadamente 33 MB de pesos, previa cuantización por parte del usuario (no se distribuyen pesos cuantizados).
- GPUs recomendadas: cualquier GPU moderna sirve; el modelo no necesita A100 ni H100. Una NVIDIA T4, L4, RTX 3060 o superior es más que suficiente, e incluso una GPU integrada o una CPU multinúcleo puede ejecutarlo con latencias aceptables.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo con más de 1 GB de VRAM, e incluso en CPU si el throughput no es crítico.
- Opciones de despliegue: transformers (`pipeline("token-classification")`) y `AutoModelForTokenClassification`; exportación a ONNX mediante Optimum para servir con ONNX Runtime; TorchScript para entornos sin Python; despliegue en servidores de inferencia genéricos (Triton, TorchServe) que acepten modelos de transformers.
- vLLM, llama.cpp u Ollama: no son opciones adecuadas para este modelo, ya que están orientados a modelos generativos causales y no a encoders de clasificación.
- Latencia y throughput: no disponibles. No se publican mediciones y cualquier estimación dependerá del hardware, del tamaño de lote y de la longitud de las secuencias.

## Comparativa con modelos similares

Los datos publicados no permiten una comparativa rigurosa con alternativas: se desconocen el dataset, el esquema de etiquetas y el dominio de evaluación, y no hay resultados en el model-index. La tabla siguiente recoge únicamente los datos verificables de este modelo y marca como "no disponible" todo aquello que no puede confirmarse en la información proporcionada.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lapik/ner-dl2 | 33.215.625 | no disponible | NER (token-classification) | MIT | HuggingFace, formato safetensors |
| BAAI/bge-small-en-v1.5 (modelo base) | no disponible en la informacion proporcionada | no disponible | Embeddings de texto | no disponible | HuggingFace |
| Alternativas NER de la familia BERT (por ejemplo, fine-tunings de bert-base en CoNLL) | no disponible | no disponible | NER | no disponible | no disponible |

No se dispone de datos comparativos de F1 sobre un conjunto común, por lo que no es posible afirmar si este modelo supera o no a otras alternativas de NER del mismo rango de tamaño.

## Limitaciones y advertencias

- Modelo generado automáticamente con el `Trainer`: la model card conserva los avisos por defecto del generador ("More information needed") y no documenta descripción, usos previstos ni datos de entrenamiento.
- Se desconoce por completo el dataset de entrenamiento y evaluación, lo que impide evaluar la representatividad del modelo y su posible sobreajuste al dominio original.
- Se desconocen las etiquetas de entidad que produce el modelo; es imprescindible inspeccionar `config.id2label` antes de cualquier integración.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de falsos positivos y falsos negativos en la detección de entidades; el F1 declarado (0,8644) implica un margen de error relevante en producción.
- Idiomas soportados no documentados: el modelo base es de lengua inglesa, por lo que el rendimiento en castellano u otros idiomas es una incógnita que debe validarse empíricamente.
- Longitud de contexto no documentada: el modelo base impone un límite de secuencia que condiciona el tratamiento de documentos largos, que habrá que trocear; conviene verificar el valor real en la configuración antes de desplegar.
- Sesgos: no evaluados ni documentados por el autor; al derivar de un modelo base entrenado con corpus web en inglés, es probable la herencia de sesgos de género, origen o profesión en las entidades detectadas.
- Licencia MIT: permite uso comercial, modificación y redistribución, pero al derivar de BAAI/bge-small-en-v1.5 conviene revisar las condiciones del modelo base y citar la procedencia.
- Cero descargas y cero likes en el momento de la consulta: no existe evidencia de uso en producción ni validación por parte de terceros.
- El repositorio ocupa solo 0,1 GB y fue creado y actualizado el mismo día, lo que sugiere un experimento puntual sin mantenimiento posterior.
- No hay versiones cuantizadas, ONNX ni GGUF publicadas: cualquier optimización de despliegue corre por cuenta del usuario.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lapik/ner-dl2
- Modelo base: https://huggingface.co/BAAI/bge-small-en-v1.5
