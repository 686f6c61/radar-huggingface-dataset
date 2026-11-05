# KuanP/brain-uce-pilot-mix-v3-d768l14v2-s2048-bican

## Resumen

`brain-uce-pilot-mix-v3-d768l14v2-s2048-bican` es un modelo piloto de embeddings celulares de estilo UCE (Universal Cell Embedding) para datos de scRNA-seq de cerebro, desarrollado por el usuario KuanP. Se trata de la variante de 2.048 genes del modelo `KuanP/brain-uce-pilot-mix-v3-d768l14v2-bican`: cada célula se representa como una "frase" construida a partir de 2.048 genes muestreados, que se tokeniza en hasta 3.584 tokens. La salida es un embedding de célula de 768 dimensiones, normalizado en L2, idéntico al de su modelo base, y comparte el mismo vocabulario de genes.

El modelo no es un LLM generativo ni un modelo de chat: es un extractor de características (`feature-extraction`) orientado a biología computacional, concretamente a la representación vectorial de células individuales a partir de perfiles de expresión génica. Su relevancia radica en que permite obtener embeddings comparables entre especies y lotes experimentales, lo que habilita tareas de integración de datos, anotación celular, búsqueda de vecinos y análisis downstream sin necesidad de reentrenar desde cero.

Con 1.480.750.081 parámetros (aproximadamente 1,48 mil millones) y un repositorio de 5,9 GB en formato safetensors, se posiciona como un modelo de tamaño medio dentro de la categoría de foundation models para single-cell. La licencia es "other", lo que obliga a revisar los términos del autor antes de cualquier uso comercial. No se dispone de información sobre idiomas en el sentido lingüístico habitual, ya que el modelo opera sobre vocabularios de genes, no sobre texto natural.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | UCE (Universal Cell Embedding), estilo transformer sobre secuencias de genes; detalles internos no disponibles |
| Parámetros totales | 1.480.750.081 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | hasta 3.584 tokens por célula (2.048 genes muestreados) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (datos de expresión génica); idiomas naturales no disponibles |
| Licencia | other |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible indica que se trata de un modelo de embeddings celulares de estilo UCE, en el que cada célula se serializa como una secuencia de hasta 3.584 tokens a partir de 2.048 genes muestreados. La salida es un vector de 768 dimensiones normalizado en L2. El modelo es una variante del checkpoint `KuanP/brain-uce-pilot-mix-v3-d768l14v2`, del que hereda el vocabulario de genes y la dimensionalidad de embedding. La librería asociada es `uce_brain`, específica para este tipo de modelos.

No se dispone de información detallada sobre la composición del dataset de entrenamiento (número de células, especies incluidas, tejidos, protocolos de secuenciación), ni sobre si se emplearon técnicas de alineamiento como RLHF, DPO o aprendizaje contrastivo. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal. Cualquier afirmación al respecto sería especulativa y no se incluye.

## Capacidades

- Extracción de embeddings de células individuales a partir de perfiles de expresión génica de scRNA-seq de cerebro.
- Representación de células en un espacio vectorial de 768 dimensiones, normalizado en L2, adecuado para similitud coseno y búsqueda de vecinos.
- Manejo de vocabulario de genes compartido con el modelo base, lo que facilita la comparabilidad entre checkpoints.
- Soporte multi-especie según las etiquetas del modelo (`multi-species`), aunque no se detallan las especies concretas.
- Serialización de hasta 2.048 genes por célula en secuencias de hasta 3.584 tokens.
- Orientado a `feature-extraction`: no genera texto ni mantiene conversaciones.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documentan capacidades de visión, audio ni modo "thinking".

## Casos de uso

- Integración de datos de scRNA-seq entre lotes y experimentos: los embeddings de 768 dimensiones permiten alinear células de distintos runs mediante métodos estándar (p. ej. Harmony, scVI o simples vecinos más cercanos) usando las representaciones del modelo como entrada, lo que reduce el coste frente a entrenar un autoencoder específico por dataset.
- Anotación celular automatizada: calcular el embedding de cada célula y aplicar k-NN contra un atlas de referencia anotado, aprovechando que el espacio es comparable y normalizado en L2.
- Búsqueda de células similares a gran escala: indexar embeddings en FAISS o Annoy para recuperar células con perfiles de expresión parecidos, útil en exploración de subtipos celulares raros.
- Análisis multi-especie de cerebro: la etiqueta `multi-species` sugiere que el espacio latente puede usarse para comparar poblaciones celulares entre especies, por ejemplo en estudios evolutivos o de modelos animales.
- Clustering y descubrimiento de tipos celulares: usar los embeddings como features de entrada para Leiden/Louvain o UMAP, evitando la selección manual de genes altamente variables.
- Preprocesado para modelos downstream: servir como extractor congelado de características en pipelines de clasificación de células o predicción de estados celulares, con la ventaja de no requerir entrenamiento desde cero.
- Evaluación de calidad e integración de nuevos datasets: proyectar un nuevo experimento en el espacio del modelo y medir distancias a referencias conocidas para detectar desviaciones por batch effect o problemas técnicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp32): aproximadamente 5,9 GB solo para pesos, más memoria para activaciones; se recomienda al menos 8-12 GB de VRAM para lotes pequeños.
- En fp16/bf16: alrededor de 3 GB para pesos, más overhead; cabe en GPUs consumer con 6-8 GB de VRAM.
- GPUs recomendadas: NVIDIA RTX 3060/4060 (12/8 GB), RTX 4090, A100 o H100 para procesar grandes volúmenes de células en paralelo.
- Cabe en GPU consumer: sí, en modelos con al menos 8 GB de VRAM en fp16, y potencialmente en 6 GB con cuantización (no documentada).
- Opciones de despliegue: la librería específica `uce_brain` es la vía indicada por el autor; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que están orientados a LLMs generativos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `KuanP/brain-uce-pilot-mix-v3-d768l14v2-s2048-bican` (este) | 1,48 B | 3.584 tokens (2.048 genes) | 768-d, L2 | other | HuggingFace |
| `KuanP/brain-uce-pilot-mix-v3-d768l14v2-bican` (base) | no disponible | no disponible (versión con menos genes) | 768-d, L2 | other | HuggingFace |
| Otros modelos UCE / single-cell foundation models | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para comparar con alternativas de la misma categoría (p. ej. scGPT, Geneformer, scFoundation) en parámetros, contexto o rendimiento, por lo que no se incluyen datos que no estén verificados.

## Limitaciones y advertencias

- Modelo piloto: el propio autor lo etiqueta como "pilot", lo que sugiere que no es un checkpoint final ni validado a gran escala.
- Sesgos desconocidos: no se documenta la composición del dataset de entrenamiento, por lo que no se puede evaluar el sesgo hacia especies, tejidos, protocolos o poblaciones celulares concretas.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de embeddings poco fiables para tipos celulares o especies poco representadas en el entrenamiento.
- Limitaciones de contexto: la ventana de 3.584 tokens limita el número de genes por célula a 2.048; células con perfiles más complejos pueden quedar subrepresentadas.
- Restricciones de licencia: la licencia "other" exige revisar los términos del autor; no se garantiza uso comercial sin consulta previa.
- Caveat para producción: la librería `uce_brain` es específica y no estándar; la integración con stacks habituales (scVI, Scanpy) requerirá adaptadores propios.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento frente a alternativas, lo que dificulta justificar su elección en producción.
- Idiomas: no aplica a texto natural; el modelo no procesa lenguaje, solo vocabularios de genes.

## Enlaces

- HuggingFace: https://huggingface.co/KuanP/brain-uce-pilot-mix-v3-d768l14v2-s2048-bican
- Modelo base: https://huggingface.co/KuanP/brain-uce-pilot-mix-v3-d768l14v2-bican
- Modelo del que deriva el base: https://huggingface.co/KuanP/brain-uce-pilot-mix-v3-d768l14v2
- Paper, blog, repositorio o demo: no disponibles en la información proporcionada.
