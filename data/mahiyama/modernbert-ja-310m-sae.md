# mahiyama/modernbert-ja-310m-sae

## Resumen

`modernbert-ja-310m-sae` es un autoencoder disperso (Sparse Autoencoder, SAE) de tipo Top-K entrenado sobre los estados ocultos de la última capa del modelo japonés `sbintuitions/modernbert-ja-310m`. Lo desarrolla el usuario de HuggingFace mahiyama y su función es descomponer el vector oculto de 768 dimensiones de cada token en una representación dispersa de 65.536 características, de las cuales solo 16 tienen valor distinto de cero por token. El SAE reconstruye después el estado oculto original a partir de esa representación.

El modelo no es un generador de texto ni un chat: es una herramienta de interpretabilidad y de recuperación de información. Su relevancia práctica radica en que actúa como capa de salida inicial del modelo de recuperación dispersa `mahiyama/sae-splade-ja-310m`, que es el que debe usarse para búsqueda. Por sí mismo, cargado como `SparseEncoder`, produce embeddings dispersos de 65.536 dimensiones útiles para recuperación léxica aprendida en japonés.

La arquitectura subyacente es ModernBERT (transformer encoder con atención eficiente), con 314.611.968 parámetros totales en el repositorio y una ventana de entrada máxima de 1.024 tokens, que es la longitud usada durante el entrenamiento del SAE. La licencia es MIT y el idioma soportado es únicamente japonés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SAE Top-K sobre ModernBERT (encoder transformer) japonés; el SAE es una capa lineal encoder/decoder con activación ReLU y TopK |
| Parametros totales | 314.611.968 (modelo base ~315M; encoder y decoder del SAE ~50M cada uno, según la model card) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens (longitud usada en el entrenamiento del SAE) |
| Tipos de cuantizacion | No disponible (pesos en safetensors sin cuantizaciones publicadas) |
| Idiomas soportados | Japonés (ja) |
| Licencia | MIT |
| Formato de pesos | safetensors (SAE en `1_SAETopKPooling/model.safetensors`) |
| Dimension de caracteristicas | 65.536 |
| k (caracteristicas activas por token) | 16 |
| Dimension del estado oculto de entrada | 768 |
| Libreria | sentence-transformers (SparseEncoder, verificado en 6.2.0) |
| Modelo base | sbintuitions/modernbert-ja-310m (revision 77675fc) |

## Arquitectura y entrenamiento

El SAE sigue la formulación Top-K de Gao et al. (2024): dado un estado oculto `h` de 768 dimensiones, calcula `z = TopK_16(ReLU(W_enc · (h - b_dec) + b_enc))` y reconstruye `h_hat = W_dec · z + b_dec`. El sesgo del encoder incorpora ya la resta de `b_dec`, de modo que en la práctica se computa `TopK_16(ReLU(W_enc · h + encoder.bias))`. Las matrices son `encoder.weight` de forma [65536, 768] y `decoder.weight` de forma [768, 65536]. Durante el entrenamiento los pesos del modelo base permanecieron congelados y se añadió la pérdida auxiliar AuxK del mismo paper para evitar características muertas.

El corpus de entrenamiento suma 846.271.884 tokens, compuesto por un 70,1% de documentos (incluidas negativas) y un 14,9% de consultas procedentes de los conjuntos de recuperación del autor, más un 14,9% de artículos de Wikipedia japonesa (primeros 4.000 caracteres de artículos de más de 2.000 caracteres). Los bloques principales son `mqa-ja` (50,3%), `auto-wiki-qa` (28,9%), Wikipedia (14,9%) y `mmarco-ja` (3,3%), con contribuciones menores de JMTEB (jaqket-query), MIRACL, MrTyDi, Mintaka, FAQ administrativas y datos de reuniones académicas.

## Capacidades

- Extracción de características dispersas: convierte texto japonés en vectores de 65.536 dimensiones con 16 activaciones por token.
- Recuperación léxica aprendida (sparse retrieval): pensado como base del modelo SPLADE japonés `sae-splade-ja-310m`.
- Interpretabilidad de representaciones: permite inspeccionar qué características se activan por token en la última capa de ModernBERT.
- Reconstrucción de estados ocultos: el decoder permite medir la fidelidad de la descomposición.
- Procesamiento de documentos y consultas cortas en japonés (FAQ, artículos, preguntas de QA).
- Integración con `sentence-transformers` mediante `SparseEncoder` y con Text Embeddings Inference.
- No soporta generación de texto, tool calling, agentes, visión ni audio.

## Casos de uso

- Motor de búsqueda documental en japonés: cargando el modelo como `SparseEncoder` se obtienen vectores dispersos indexables en motores como Lucene o PISA, adecuados para recuperación léxica sobre corpus japoneses.
- Búsqueda en FAQ administrativas: el entrenamiento incluye datos de FAQ públicas (Amagasaki, kosodate), por lo que el espacio de características cubre vocabulario administrativo y ciudadano.
- Recuperación aumentada (RAG) sobre Wikipedia japonesa: la ventana de 1.024 tokens y el entrenamiento con artículos de Wikipedia lo hacen apropiado para indexar pasajes de enciclopedia.
- Análisis de interpretabilidad: investigadores pueden mapear qué características del SAE se activan en cada token para estudiar sesgos o conceptos aprendidos por ModernBERT japonés.
- Filtrado y deduplicación semántica: la representación dispersa permite comparar documentos por solapamiento de características activas con coste de cómputo bajo.
- Punto de partida para ajuste de recuperación: sirve como inicialización del output layer en modelos SPLADE japoneses, tal como hizo el autor con `sae-splade-ja-310m`.
- Evaluación de modelos de embeddings japoneses: útil como referencia en experimentos con JMTEB v2 lite.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que se usaron consultas y documentos de JMTEB v2 lite para excluirlos del entrenamiento, pero no reporta métricas de recuperación (nDCG, MRR ni Recall) para este SAE ni para el modelo derivado.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 1,7 GB; en fp32 la inferencia completa requiere aproximadamente 3-4 GB, y en fp16 alrededor de 1,5-2 GB.
- GPU recomendadas: cualquier GPU con 8 GB o más es suficiente; RTX 3060, RTX 4070, RTX 4090, A100 y H100 funcionan sin problema.
- Cabe en GPU de consumo: sí, en cualquier tarjeta moderna con 6-8 GB de VRAM; también puede ejecutarse en CPU para lotes pequeños.
- Opciones de despliegue: `sentence-transformers` con `SparseEncoder` (requiere `trust_remote_code=True`), Text Embeddings Inference (el repo incluye la etiqueta `text-embeddings-inference`), y carga directa con `transformers` + `safetensors` para usar el SAE de forma manual.
- Latencia y throughput: no disponibles en la información proporcionada; con 1.024 tokens de contexto y 310M parámetros se espera un throughput alto en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Uso |
|---|---|---|---|---|---|
| mahiyama/modernbert-ja-310m-sae | ~315M (base) + ~100M (SAE) | 1.024 | SAE Top-K sobre embeddings | MIT | Interpretabilidad y base para recuperación |
| mahiyama/sae-splade-ja-310m | No disponible | No disponible | Recuperación dispersa (SPLADE) | No disponible | Búsqueda en producción |
| sbintuitions/modernbert-ja-310m | ~315M | No disponible | Encoder ModernBERT | No disponible | Embeddings densos y fine-tuning |
| SAE Top-K de Gao et al. (2024) | Variable según modelo base | Según modelo base | SAE genérico | Según implementación | Interpretabilidad |

La comparación con alternativas de la misma categoría (SAE sobre modelos japoneses) no está disponible en la información proporcionada; este repositorio parece ser una contribución aislada del autor sin equivalentes públicos documentados.

## Limitaciones y advertencias

- Solo procesa japonés; el rendimiento en otros idiomas no está evaluado y previsiblemente será deficiente.
- El SAE está entrenado sobre la última capa de un modelo base concreto (revision 77675fc); usar otra revisión o modelo invalida la descomposición.
- La longitud de entrada está limitada a 1.024 tokens, lo que obliga a trocear documentos largos.
- No es un modelo generativo: no produce texto, no responde preguntas y no soporta tool calling.
- Para recuperación en producción el autor recomienda explícitamente usar `sae-splade-ja-310m`, no este SAE.
- Riesgo de características muertas o poco activas pese a la pérdida AuxK; no se publican métricas de fidelidad de reconstrucción.
- El sesgo heredado del corpus (Wikipedia, FAQ administrativas, datos web) puede infrarepresentar dominios técnicos o coloquiales.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar el módulo antes de desplegarlo.
- Aunque la licencia es MIT, el modelo base `sbintuitions/modernbert-ja-310m` tiene su propia licencia que debe verificarse para uso comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mahiyama/modernbert-ja-310m-sae
- Modelo base: https://huggingface.co/sbintuitions/modernbert-ja-310m
- Modelo de recuperación derivado: https://huggingface.co/mahiyama/sae-splade-ja-310m
- Paper del SAE Top-K (Gao et al., 2024): https://arxiv.org/abs/2406.04093
- Dataset mqa-ja: https://huggingface.co/datasets/mahiyama/mqa-ja
- Dataset auto-wiki-qa: https://huggingface.co/datasets/mahiyama/auto-wiki-qa
- Dataset mmarco-ja: https://huggingface.co/datasets/mahiyama/mmarco-ja
- Dataset JMTEB: https://huggingface.co/datasets/sbintuitions/JMTEB
- Dataset Mintaka: https://huggingface.co/datasets/AmazonScience/mintaka
- Wikipedia japonesa: https://huggingface.co/datasets/wikimedia/wikipedia
