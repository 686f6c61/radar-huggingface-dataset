# chloehlee/delight-fm-epi-ileum

## Resumen

DELIGHT-FM Epi-ileum es un modelo fundacional (foundation model) para datos de expresión génica de célula única (single-cell RNA-seq), desarrollado por chloehlee como parte de la familia DELIGHT-FM. Está especializado en tejido de íleon (intestino delgado) y se distribuye como checkpoint de extracción de características y punto de partida para tareas downstream de clasificación y regresión celular. El modelo emplea la arquitectura Geneformer-Mamba, una variante de espacio de estados (SSM) adaptada a secuencias de tokens génicos, con 33.909.313 parámetros totales y una longitud de contexto de 2048 tokens.

El modelo resuelve el problema de disponer de representaciones preentrenadas sobre expresión génica de célula única en un tejido concreto, evitando entrenar desde cero en tareas como clasificación de tipos celulares, predicción de edad o respuesta a perturbaciones. El checkpoint conserva las cabezas de preentrenamiento (masked gene modeling, cluster/broad-cell y escala de edad aprendida) junto con las cabezas adversariales de lote y dominio, lo que permite reutilizar el backbone completo al ajustar una nueva tarea.

Es relevante porque forma parte de una familia con variantes por tejido (íleon, colon, estroma e inmune) y compañeros específicos de tarea para predicción de edad, todos bajo licencia Apache 2.0. El checkpoint fundacional seleccionado corresponde a la época 7.5 del preentrenamiento, entrenado sobre 67.849 células y validado sobre 14.564, con 18.253 características génicas de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Geneformer-Mamba (espacio de estados / SSM sobre tokens génicos) |
| Parametros totales | 33.909.313 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan cuantizaciones GGUF/INT8) |
| Idiomas soportados | no aplica (modelo biológico, no lingüístico); no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (custom_code, requiere trust_remote_code) |

Otros datos técnicos relevantes: características génicas de referencia 18.253; subconjunto de entrenamiento 67.849 células; validación/test 14.564 células; tamaño del repositorio 0,1 GB; pipeline `feature-extraction`; librería `transformers`; requiere Python 3.10, stack PyTorch/CUDA 11.8 y extensiones Mamba compiladas.

## Arquitectura y entrenamiento

El modelo se basa en Geneformer-Mamba, una arquitectura híbrida que aplica bloques de espacio de estados (Mamba) sobre secuencias de tokens génicos en lugar de atención transformer clásica. La entrada combina identificadores de token génico, expresión log-normalizada y z-scored por gen en float32 (recortada a ±5) y máscaras HVG alineadas. El preentrenamiento combina masked gene modeling con supervisión auxiliar de cluster/broad-cell, una escala de edad aprendida y cabezas adversariales de lote y dominio; todas las cabezas guardadas se preservan en la exportación fundacional.

El entrenamiento se realizó sobre un subconjunto de 67.849 células con 14.564 células de validación/test, usando 18.253 características génicas de referencia y contexto de 2048. La selección del checkpoint maximizó la media de macro F1 de cluster, macro F1 de localización y correlación de Pearson de edad, excluyendo tareas de clase única explícitas. El checkpoint fundacional no incluye la cabeza de regresión log2(PCW) final ajustada; el ajuste fino crea una nueva cabeza de tarea transfiriendo todos los tensores del backbone preentrenado. Se advierte que la puntuación PCW auxiliar del modelo fundacional es una escala de meseta aprendida, no un log2(PCW) calibrado.

## Capacidades

- Extracción de embeddings de expresión génica de célula única para tejido de íleon.
- Clasificación celular downstream (tipos celulares, clusters, broad-cell) mediante ajuste fino.
- Regresión downstream, incluida la predicción de edad en la variante compañera `delight-fm-epi-ileum-age`.
- Masked gene modeling: reconstrucción de genes enmascarados sobre secuencias de expresión.
- Supervisión adversarial de lote y dominio para mitigar efectos de lote en las representaciones.
- Soporte de perturbaciones verificadas de edad mediante ediciones firmadas (`float32_v2`) que reconstruyen aproximadamente la abundancia tras el recorte por z-score.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo biológico de extracción de características, no un LLM.
- Capacidades multilingües: no aplica.

## Casos de uso

- Clasificación de tipos celulares en íleon: ajustar una cabeza de clasificación sobre los embeddings del backbone para anotar poblaciones celulares en nuevos experimentos de scRNA-seq del mismo tejido, aprovechando las 18.253 características génicas de referencia.
- Predicción de edad tisular: usar la variante compañera `delight-fm-epi-ileum-age` para estimar edad a partir de perfiles de expresión, útil en estudios de envejecimiento intestinal.
- Análisis de respuesta a perturbaciones: ejecutar los tutoriales de perturbaciones verificadas para medir la respuesta del modelo ante ediciones génicas firmadas, con la cautela de que miden respuesta del modelo y no efectos causales establecidos experimentalmente.
- Detección de efectos de lote: emplear las representaciones con cabezas adversariales de dominio para integrar datos de distintos donantes o lotes en pipelines de análisis.
- Búsqueda de vecinos y agrupamiento celular: generar embeddings para clustering y visualización (UMAP/t-SNE) en estudios de biología del intestino delgado.
- Transferencia a tareas de regresión génica: reutilizar el backbone para predecir puntuaciones continuas (por ejemplo, scores de expresión o estados celulares) con particiones train/validation/test disjuntas por donante.
- Punto de partida para modelos específicos de tejido: adaptar el checkpoint a nuevos tejidos o condiciones usando los notebooks de ajuste fino y el repositorio de entrenamiento `ChloeHJ/delight_fm_v1`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que la selección se basó en la media de macro F1 de cluster, macro F1 de localización y Pearson de edad, con valores registrados en `metadata/selection.json`, pero no se proporcionan cifras numéricas en la información disponible. Se advierte además que el subconjunto de test original participó en la selección del modelo y no constituye un benchmark externo intacto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 33,9 M de parámetros, los pesos en float32 ocupan aproximadamente 136 MB, por lo que la VRAM vendrá dominada por el tamaño de lote y las activaciones de secuencias de 2048 tokens.
- GPU recomendadas: no se especifican modelos concretos; la model card exige stack PyTorch/CUDA 11.8 y extensiones Mamba compiladas.
- Cabe en GPU de consumo: muy probablemente sí, dado el reducido número de parámetros, aunque no se documenta una lista de GPUs verificadas.
- Opciones de despliegue: `transformers` con `AutoModel.from_pretrained(..., trust_remote_code=True)`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La model card indica que la ejecución completa en GPU y el entrenamiento no se validaron en el contenedor de preparación (solo CPU); los notebooks se comprobaron localmente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| DELIGHT-FM Epi-ileum | 33,9 M | 2048 | Apache 2.0 | Hugging Face | Especializado en íleon; cabezas de preentrenamiento preservadas |
| DELIGHT-FM (base) | no disponible | no disponible | Apache 2.0 | Hugging Face | Incluye cabeza broad-cell guardada |
| DELIGHT-FM Epi-colon | no disponible | no disponible | Apache 2.0 | Hugging Face | Variante de colon; retiene células Adult y 80+ |
| DELIGHT-FM Stromal | no disponible | no disponible | Apache 2.0 | Hugging Face | Variante de estroma |
| DELIGHT-FM Immune | no disponible | no disponible | Apache 2.0 | Hugging Face | Variante inmune |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada. Como alternativas de la misma categoría (modelos fundacionales de scRNA-seq) podrían citarse Geneformer o scGPT, pero no se aportan en la información disponible y no se comparan aquí para no inventar datos.

## Limitaciones y advertencias

- Requiere datos de expresión scRNA-seq de tejido humano emparejado; las células del estudio original no se distribuyen.
- La tokenización genérica de Geneformer no es intercambiable: hay que usar los ficheros de estadísticas de referencia y tokenización de `resources/`.
- Los rangos empatados en células inmunes pueden depender del despacho AVX512 de NumPy; se recomienda retener entradas tokenizadas entre workers.
- El checkpoint fundacional no contiene la cabeza de regresión log2(PCW) final; la puntuación PCW auxiliar es una escala aprendida, no calibrada.
- Las perturbaciones miden respuesta del modelo, no efectos causales establecidos experimentalmente; las ediciones firmadas requieren definiciones de objetivo justificadas de forma independiente.
- El test original participó en la selección del modelo; no es un benchmark externo intacto. Las nuevas tareas deben usar particiones disjuntas por donante.
- El íleon fresco excluye las categorías Adult y 80+; el colon fresco las retiene, lo que limita la comparabilidad entre tejidos.
- Requiere `trust_remote_code=True`; conviene revisar el código Python personalizado y fijar un SHA de commit con `revision=...` para reproducibilidad.
- No se han validado la ejecución completa en GPU ni el entrenamiento en el contenedor de preparación (solo CPU).
- Sesgos conocidos y riesgo de alucinación: no aplica en el sentido de LLM; el riesgo equivalente es la extrapolación a distribuciones celulares o tejidos no representados en el entrenamiento.
- Licencia Apache 2.0 para código y pesos; los activos de referencia y dependencias conservan sus términos originales (ver `docs/THIRD_PARTY_NOTICES.md`).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chloehlee/delight-fm-epi-ileum
- Compañero de edad: https://huggingface.co/chloehlee/delight-fm-epi-ileum-age
- Modelo base DELIGHT-FM: https://huggingface.co/chloehlee/delight-fm
- Variante colon: https://huggingface.co/chloehlee/delight-fm-epi-colon
- Variante estroma: https://huggingface.co/chloehlee/delight-fm-stromal
- Variante inmune: https://huggingface.co/chloehlee/delight-fm-immune
- Repositorio de entrenamiento y evaluación: https://github.com/ChloeHJ/delight_fm_v1
- Dataset de soporte: https://huggingface.co/datasets/chloehlee/delight_fm_v1-data
- Perfil del autor: https://huggingface.co/chloehlee
