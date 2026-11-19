# chloehlee/delight-fm

## Resumen

DELIGHT-FM es un modelo fundacional (foundation model) especializado en datos de expresión génica de célula única (single-cell RNA-seq), desarrollado por chloehlee y publicado bajo licencia Apache 2.0. Resuelve el problema de obtener representaciones (embeddings) y clasificaciones de células a partir de perfiles de expresión génica, sirviendo como base para tareas downstream como clasificación de tipos celulares, regresión de edad o análisis de perturbaciones génicas. Es relevante porque aplica una arquitectura basada en Mamba (state-space model) al dominio biológico, un enfoque distinto de los transformers estándar usados en herramientas como Geneformer.

El checkpoint contiene 33.979.081 parámetros (aproximadamente 34 millones) y trabaja con 18.253 genes de referencia y una longitud de contexto de 2.048 tokens. Se entrenó sobre un subconjunto de 531.101 células, con validación y test sobre 140.257 células. La versión publicada corresponde a la época de fundación 4.5 seleccionada.

El modelo se distribuye con las cabezas de preentrenamiento preservadas (masked-gene modeling, clasificación broad-cell de 17 clases y supervisión auxiliar de edad) y forma parte de una familia con variantes específicas de tejido (íleon, colon, estromal e inmune) y compañeros de regresión de edad. No incluye la cabeza final de regresión log2-PCW, que debe ajustarse en el fine-tuning.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | geneformer_mamba (state-space model tipo Mamba adaptado a tokens génicos) |
| Parametros totales | 33.979.081 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo biológico, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con custom_code, requiere trust_remote_code) |

## Arquitectura y entrenamiento

DELIGHT-FM emplea una arquitectura de tipo Mamba (state-space model) integrada en el ecosistema transformers bajo el identificador `geneformer_mamba`, con código personalizado que requiere `trust_remote_code=True`. Los inputs son identificadores de tokens génicos, valores de expresión log-normalizada y z-scored en float32 (recortados a ±5) y máscaras HVG alineadas. El vocabulario de referencia cubre 18.253 genes y la ventana de contexto es de 2.048 tokens.

El preentrenamiento combina modelado de genes enmascarados (masked gene modeling) con supervisión auxiliar: una cabeza de clasificación broad-cell de 17 clases (etiquetas históricas BroadCellType), una cabeza de cluster celular y una cabeza de escala de edad aprendida, además de cabezas adversariales de batch y dominio. El conjunto de entrenamiento comprende 531.101 células y el de validación/test 140.257 células. La selección del checkpoint maximizó la media de macro F1 de cluster, macro F1 de localización y correlación de Pearson de edad, excluyendo tareas de clase única. La época de fundación seleccionada es la 4.5.

## Capacidades

- Extracción de características (feature-extraction) y generación de embeddings de células a partir de perfiles de expresión génica single-cell.
- Clasificación de tipos celulares mediante la cabeza broad-cell de 17 clases incluida en el checkpoint.
- Fine-tuning para nuevas tareas downstream de clasificación y regresión, transfiriendo todos los tensores del backbone preentrenado.
- Regresión de edad mediante cabezas específicas en los modelos compañeros de la familia (no en este checkpoint base).
- Análisis de perturbaciones de probabilidad sobre la cabeza broad-cell, con edición de genes objetivo presentes en la entrada.
- Supervisión adversarial de batch y dominio que favorece la generalización entre lotes y dominios.
- No soporta tool calling, function calling, agentes ni capacidades multilingües: es un modelo de dominio biológico, no un modelo de lenguaje general.

## Casos de uso

- Clasificación de tipos celulares en nuevos datasets: el modelo puede aplicarse directamente sobre su cabeza broad-cell de 17 clases o servir como extractor de embeddings para entrenar un clasificador específico sobre tipos celulares de un estudio concreto.
- Anotación automatizada de clusters en análisis scRNA-seq: los embeddings generados permiten agrupar células y asignar anotaciones de forma asistida, reduciendo el trabajo manual en pipelines de análisis transcriptómico.
- Predicción de edad biológica a partir de perfiles de expresión: mediante fine-tuning o usando los compañeros de edad de la familia (íleon, colon, estromal, inmune), el modelo puede estimar la edad asociada a una muestra celular.
- Análisis de perturbaciones génicas in silico: la cabeza broad-cell admite perturbaciones de probabilidad verificadas que reconstruyen de forma aproximada la abundancia tras el recorte z-score, útiles para explorar respuestas del modelo ante cambios en genes objetivo.
- Integración en pipelines de investigación biomédica: al ser un modelo de 34 millones de parámetros, puede desplegarse en entornos de laboratorio con recursos moderados para tareas de feature extraction a escala de cientos de miles de células.
- Estudios de integración de lotes y dominios: las cabezas adversariales de batch/domain permiten obtener representaciones más robustas a variaciones técnicas entre experimentos, útiles en meta-análisis de datos públicos.
- Base para modelos específicos de tejido: sirve como punto de partida para las variantes de la familia (epi-íleon, epi-colon, estromal, inmune) y para tareas de clasificación o regresión adaptadas a un tejido concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica únicamente que la selección del checkpoint maximizó la media de macro F1 de cluster, macro F1 de localización y correlación de Pearson de edad, con los valores por componente registrados en `metadata/selection.json`, pero no se proporcionan cifras numéricas en la información disponible. Se advierte además que el subconjunto de test original participó en la selección del modelo y no constituye un benchmark externo intacto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 33.979.081 parámetros, en float32 el peso de los parámetros ronda los 136 MB, y en float16/bfloat16 unos 68 MB, a lo que hay que sumar el estado de las extensiones Mamba compiladas y los buffers de activación.
- GPU recomendadas: no se especifican modelos concretos en la información disponible. La model card menciona un stack probado de PyTorch/CUDA 11.8 con extensiones Mamba compiladas.
- Cabe en GPU de consumo: por tamaño de parámetros sí es viable en GPUs consumer, aunque se requiere compilar las extensiones Mamba y disponer de CUDA 11.8 compatible.
- Opciones de despliegue: carga mediante `transformers` con `AutoModel.from_pretrained(..., trust_remote_code=True)`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La model card señala que la ejecución completa en GPU y el entrenamiento no se validaron en el contenedor de preparación (solo CPU), por lo que no hay cifras de rendimiento publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| DELIGHT-FM | 33.979.081 | 2.048 tokens | Apache 2.0 | Mamba sobre tokens génicos, multi-cabeza (broad-cell, cluster, edad) |
| Geneformer | no disponible en la informacion | no disponible | no disponible en la informacion | Transformer sobre tokens génicos; tokenización no intercambiable con DELIGHT-FM |
| Alternativas de la familia DELIGHT-FM (Epi-íleon, Epi-colon, Stromal, Immune) | no disponible | 2.048 tokens | Apache 2.0 | Variantes específicas de tejido con compañeros de edad |

La model card advierte explícitamente que la tokenización genérica de Geneformer no es intercambiable con la de DELIGHT-FM y que deben usarse los ficheros de estadísticas de referencia y tokenización de `resources/`. No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados explícitamente; las cabezas adversariales de batch/domain buscan mitigar sesgos técnicos entre lotes, pero no se detallan sesgos biológicos o demográficos.
- Riesgo de alucinación: las perturbaciones miden la respuesta del modelo, no efectos causales establecidos experimentalmente. Las ediciones con signo reconstruyen la abundancia de forma aproximada tras el recorte z-score y solo cambian tokens objetivo presentes; requieren definiciones de objetivo con signo justificadas de forma independiente.
- Limitaciones de contexto e idioma: contexto fijo de 2.048 tokens y vocabulario de 18.253 genes de referencia; no es un modelo lingüístico, por lo que el soporte de idiomas no aplica.
- La tokenización y las estadísticas de referencia deben coincidir exactamente con las de `resources/`; usar tokenización genérica de Geneformer produce resultados incorrectos.
- Los rangos empatados en el dominio inmune pueden depender del dispatch AVX512 de NumPy; se recomienda conservar los inputs tokenizados entre workers.
- El checkpoint base no contiene la cabeza final de regresión log2-PCW; es necesario ajustar una nueva cabeza de tarea en el fine-tuning.
- El subconjunto de test original participó en la selección del modelo, por lo que no es un benchmark externo intacto; se recomiendan particiones train/validación/test disjuntas por donante.
- No se distribuyen datasets celulares originales, identificadores de donante ni predicciones baseline; se requiere expresión scRNA-seq de tejido humano emparejado.
- Requiere `trust_remote_code=True` por el código personalizado; se recomienda revisar el código y fijar un commit SHA con `revision=...` para reproducibilidad.
- El código de los notebooks se comprobó localmente, pero la ejecución completa en GPU y el entrenamiento no se validaron en el contenedor de preparación (solo CPU).
- Restricciones de licencia: el código y los pesos son Apache 2.0, pero los assets de referencia y dependencias mantienen sus términos originales (ver `docs/THIRD_PARTY_NOTICES.md`).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chloehlee/delight-fm
- Variante Epi-íleon: https://huggingface.co/chloehlee/delight-fm-epi-ileum
- Compañero de edad Epi-íleon: https://huggingface.co/chloehlee/delight-fm-epi-ileum-age
- Variante Epi-colon: https://huggingface.co/chloehlee/delight-fm-epi-colon
- Compañero de edad Epi-colon: https://huggingface.co/chloehlee/delight-fm-epi-colon-age
- Variante Stromal: https://huggingface.co/chloehlee/delight-fm-stromal
- Compañero de edad Stromal: https://huggingface.co/chloehlee/delight-fm-stromal-age
- Variante Immune: https://huggingface.co/chloehlee/delight-fm-immune
- Compañero de edad Immune: https://huggingface.co/chloehlee/delight-fm-immune-age
- Repositorio de código y workflows: https://github.com/ChloeHJ/delight_fm_v1
- Dataset de soporte: https://huggingface.co/datasets/chloehlee/delight_fm_v1-data
- Perfil del autor: https://huggingface.co/chloehlee
