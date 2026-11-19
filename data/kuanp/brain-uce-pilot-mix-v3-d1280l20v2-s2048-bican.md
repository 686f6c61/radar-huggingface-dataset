# KuanP/brain-uce-pilot-mix-v3-d1280l20v2-s2048-bican

## Resumen

brain-uce-pilot-mix-v3-d1280l20v2-s2048-bican es un modelo de embeddings celulares de estilo UCE (Universal Cell Embedding) desarrollado por el usuario KuanP para datos de scRNA-seq de cerebro. Concretamente, transforma el perfil de expresión génica de una célula en un vector denso de 1280 dimensiones, normalizado en L2, que puede usarse para tipado celular, transferencia de etiquetas entre colecciones y análisis de integración. Es la variante grande de UCE-Brain v0.5 (768 dimensiones y 14 capas) y comparte con ella vocabulario génico y configuración de tokenización.

La arquitectura es un transformer de 20 capas y 1280 de anchura, con 1.662.713.857 parámetros totales según los pesos en safetensors. Cada célula se representa como una "frase" construida a partir de 2.048 genes muestreados, lo que produce secuencias de hasta 3.584 tokens. El modelo incorpora una tabla de tokens génicos ESM2 congelada y se distribuye en formato safetensors junto a la configuración de ejecución y el diccionario génico.

Su relevancia actual radica en que cubre el nicho de modelos fundacionales para transcriptómica de cerebro multiespecie (humano y ratón), un área donde las alternativas públicas son escasas. No obstante, se trata de un modelo piloto de investigación, con una sola semilla de entrenamiento, licencia aún no decidida y un coste de inferencia notablemente superior al de sus predecesores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de 20 capas y 1280 de anchura (estilo UCE), con tabla de tokens génicos ESM2 congelada |
| Parametros totales | 1.662.713.857 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 3.584 tokens (frases de 2.048 genes muestreados) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de embeddings de expresión génica, no lingüístico) |
| Licencia | other (licencia no elegida todavía; contactar con los autores antes de cualquier uso más allá de evaluación) |
| Formato de pesos | safetensors (model.safetensors), con config.json, config.yaml, vocab/ y training/ |

## Arquitectura y entrenamiento

El modelo sigue el paradigma UCE: cada célula se serializa como una secuencia de tokens correspondientes a genes muestreados, y un transformer procesa esa secuencia para producir un embedding celular. En este caso, la frase celular se construye con 2.048 genes muestreados (hasta 3.584 tokens) y la salida es un vector de 1280 dimensiones normalizado en L2. La tabla de tokens génicos proviene de ESM2 y permanece congelada durante el entrenamiento, según se indica en la model card. El checkpoint final corresponde al paso 393.216.

Los detalles sobre el volumen total de tokens de entrenamiento, la composición exacta del dataset y el uso de RLHF o DPO no están disponibles en la información proporcionada. La model card menciona que los datos provienen de fuentes como CELLxGENE y BICAN, y que el vocabulario génico es multiespecie (humano y ratón), pero no se especifica la mezcla ni el número de células de entrenamiento. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Extracción de características: genera embeddings de 1280 dimensiones por célula a partir de recuentos UMI crudos de scRNA-seq.
- Tipado celular fino: los embeddings permiten clasificación mediante kNN (k = 15) con buenos resultados en datos humanos de cerebro.
- Transferencia de etiquetas entre colecciones: soporta la transferencia de anotaciones entre distintos conjuntos de datos (evaluada en cuatro direcciones).
- Integración con corrección de lote: útil para mezclar colecciones, aunque requiere corrección de batch adicional para usos de integración.
- Soporte multiespecie: entrenado para funcionar con humano (homo_sapiens) y ratón, con un vocabulario génico compartido.
- Inferencia sobre datos de expresión génica: entrada en formato AnnData (.h5ad) con recuentos UMI crudos.
- No dispone de tool calling, capacidades de agente, razonamiento multi-paso ni procesamiento de visión o audio, al no ser un modelo generativo de lenguaje.

## Casos de uso

- Tipado celular en atlas de cerebro humano: se embeden las células de un nuevo conjunto de datos con `embed_adata` y se aplica kNN contra un atlas de referencia anotado; el modelo alcanza 0,850 de macro-F1 en tipado fino sobre el benchmark UCSC, lo que lo hace adecuado para anotaciones automatizadas de poblaciones celulares.
- Transferencia de anotaciones entre estudios: dadas dos colecciones con protocolos distintos, se calculan los embeddings de ambas y se transfieren etiquetas por vecinos más cercanos; el modelo obtiene 0,944 de macro-F1 en transferencia entre colecciones, útil para armonizar anotaciones de estudios independientes.
- Construcción de atlas multiespecie: al compartir vocabulario génico entre humano y ratón, permite proyectar células de ambas especies en un mismo espacio latente para análisis comparativos de tipos celulares conservados.
- Análisis exploratorio y clustering: los embeddings de 1280 dimensiones sirven como entrada a UMAP, Leiden o clustering jerárquico para descubrir subtipos celulares en datos de cerebro, con la ventaja de capturar estructura biológica más allá de la expresión génica cruda.
- Búsqueda de vecinos y detección de estados celulares raros: al normalizar en L2, los embeddings permiten búsquedas por similitud coseno para identificar células con perfiles transcriptómicos atípicos o estados transicionales.
- Preprocesamiento para modelos aguas abajo: los embeddings pueden alimentar clasificadores, modelos de trayectoria o análisis de comunicación celular, reduciendo la dimensionalidad desde decenas de miles de genes a 1280 dimensiones informativas.
- Evaluación de integración de lotes en pipelines de scIB: el modelo se puede usar como representación base en flujos de benchmarking de integración, aunque con la advertencia de que su puntuación de mezcla de colecciones (0,652) es ligeramente inferior a la de UCE-Brain v0.5 (0,656).

## Benchmarks y rendimiento

Macro-F1 (mayor es mejor). UCSC: 117.304 células de cerebro humano de BICAN basal ganglia, SEA-AD cortex y Siletti et al. 2023. WMB-10X: unas 242.000 células de ratón del Allen whole-mouse-brain 10Xv3. kNN con k = 15.

| Benchmark | Este modelo | UCE-Brain v0.5 | UCE público (33 capas) | PCA (50 PCs) |
|---|---:|---:|---:|---:|
| UCSC humano, tipado fino | 0,850 | 0,834 | 0,819 | **0,892** |
| UCSC humano, transferencia entre colecciones | 0,944 | 0,939 | 0,934 | **0,983** |
| UCSC humano, mezcla de colecciones (scIB) | 0,652 | **0,656** | 0,635 | 0,654 |
| WMB-10X ratón, supertipo | 0,297 | 0,268 | 0,149 | **0,899** |

Según la model card, TranscriptFormer está a la par o por delante en tipado fino UCSC (0,851-0,881) y por delante en transferencia (0,956). El modelo es el mejor UCE en WMB-10X sobre cerebro completo, pero PCA domina en todas las filas de tipado, especialmente en ratón, donde las etiquetas derivan de los mismos recuentos.

## Requisitos de hardware

- VRAM estimada: unos 16-17 GB de memoria GPU con batch 32; batch 64 requiere unos 24 GB y no es más rápido.
- RAM: aproximadamente 14 GB.
- GPU recomendadas: A100 para el rendimiento indicado (unos 41 ms por célula con batch 32). No se documentan pruebas en otras GPU.
- GPU de consumo: no se especifica compatibilidad con RTX 4090 u otras GPU consumer; dado el uso de memoria y la librería `uce_brain`, no hay datos disponibles.
- Opciones de despliegue: la librería oficial `uce_brain` (repositorio snap-stanford/UCE-brain), instalable con `uv sync`; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: unos 41 ms por célula en una A100 con batch 32; con `trim_to_multiple=256` baja a 21 ms por célula manteniendo embeddings equivalentes (coseno > 0,99999) en células humanas. Es aproximadamente 2,8 veces más lento que UCE-Brain v0.5 (14-15 ms) y unas 6 veces más lento que los modelos de 1.024 genes.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto (tokens) | Embedding | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| Este modelo | 1.662.713.857 | 3.584 | 1280-d | other (no elegida) | Hugging Face |
| UCE-Brain v0.5 (`brain-uce-pilot-mix-v3-d768l14v2-bican`) | no disponible | no disponible | 768-d | no disponible | Hugging Face |
| UCE público (33 capas) | no disponible | no disponible | no disponible | no disponible | Público |
| TranscriptFormer | no disponible | no disponible | no disponible | no disponible | no disponible |

En rendimiento, este modelo supera a UCE-Brain v0.5 en tipado fino UCSC (0,850 frente a 0,834) y en WMB-10X ratón (0,297 frente a 0,268), pero queda ligeramente por debajo en mezcla de colecciones scIB (0,652 frente a 0,656). Frente al UCE público de 33 capas, gana en las tres métricas UCSC y en WMB-10X. Frente a PCA, pierde en todas las filas de tipado. Los datos de parámetros y contexto de los modelos comparables no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Modelo piloto de investigación con una sola semilla de entrenamiento: diferencias de aproximadamente 0,01 en F1 son probablemente ruido.
- Requiere corrección de lote para usos de integración; su puntuación de mezcla de colecciones es ligeramente inferior a la de UCE-Brain v0.5.
- La salida es de 1280 dimensiones, por lo que no es un reemplazo directo de los modelos piloto de 512 dimensiones ni de UCE-Brain v0.5 de 768 dimensiones.
- Licencia no elegida (`license: other`): es necesario contactar con los autores antes de cualquier uso más allá de la evaluación. Aplican además los términos de las fuentes de datos de entrenamiento (CELLxGENE, BICAN).
- No se deben sobrescribir `sample_size` ni `pad_length`: en las pruebas del autor, los modelos de 2.048 genes dieron embeddings claramente peores con frases de 1.024 genes.
- Las células sin recuentos en los genes mapeados al vocabulario provocan un error en `embed_adata` ("Probabilities do not sum to 1"); es necesario aplicar el filtro específico indicado en la model card, ya que un filtro simple por suma de filas no las detecta todas.
- Algunas versiones de torch (incluida la 2.10 que instala `uv sync`) muestran un aviso inofensivo de "Mismatch dtype" bf16/fp32.
- No se documentan sesgos específicos, riesgo de alucinación (no es un modelo generativo) ni limitaciones idiomáticas, al no ser un modelo de lenguaje.
- El coste computacional es elevado: unas 2,8 veces más lento que UCE-Brain v0.5 y unas 6 veces más lento que los modelos de 1.024 genes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KuanP/brain-uce-pilot-mix-v3-d1280l20v2-s2048-bican
- Modelo predecesor UCE-Brain v0.5: https://huggingface.co/KuanP/brain-uce-pilot-mix-v3-d768l14v2-s2048-bican
- Repositorio oficial UCE-brain: https://github.com/snap-stanford/UCE-brain
- Referencia a Siletti et al. 2023 y BICAN/SEA-AD: citados en la model card, sin enlace directo disponible
- Paper de UCE: no disponible en la información proporcionada
