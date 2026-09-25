# KuanP/brain-uce-pilot-mix-v3

## Resumen

brain-uce-pilot-mix-v3 es un modelo piloto de tipo Universal Cell Embedding (UCE) desarrollado por el usuario KuanP para generar representaciones vectoriales (embeddings) de células individuales a partir de datos de RNA-seq de célula única (scRNA-seq), con especial atención al tejido cerebral. El modelo proyecta los recuentos génicos brutos de una célula en un vector de 512 dimensiones con norma L2 unitaria, de forma que el producto escalar entre dos embeddings equivale a su similitud coseno. Se entrenó desde cero sobre una mezcla de datos diseñada, denominada "data mix v3", que sobremuestrea tejido cerebral y especies poco representadas.

Arquitectónicamente es un transformer encoder de 8 capas y 512 dimensiones de modelo que procesa una "frase celular" de hasta 2.048 tokens génicos, construida a partir de una tabla de embeddings de genes ESM2 congelada. Declara 1.393.937.921 parámetros totales, de los que la inmensa mayoría (1.363.983.360) corresponde a esa tabla congelada de dimensión 266.403 x 5.120; los pesos realmente entrenados suman 28.905.985. Su interés actual reside en el auge de los modelos fundacionales de célula única y en su enfoque multi-especie: cubre 13 especies sobre un corpus de 147.675.214 células.

Es un modelo de investigación sin licencia definitiva, con 0 descargas y 0 likes en el momento de redactar esta ficha, y sin resultados de benchmarks publicados. La tarea declarada en el pipeline es extracción de características (feature-extraction), no generación de texto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder estilo UCE (proyección de entrada lineal, codificación posicional sinusoidal, reducción CLS) |
| Parámetros totales | 1.393.937.921 |
| Parámetros activos | no aplicable (arquitectura densa, no es MoE) |
| Longitud de contexto | 2.048 tokens génicos (max_sequence_length) |
| Tipos de cuantización | no disponible (pesos almacenados en fp32; el autor no documenta esquemas de cuantización) |
| Idiomas soportados | no aplicable (modelo de datos de célula única, no de lenguaje natural); no disponible |
| Licencia | other (licencia sin elegir; ver la sección de limitaciones) |
| Formato de pesos | safetensors (118 tensores, todos fp32), 5.575.765.828 bytes |

Datos adicionales relevantes: dimensión de embedding de salida 512, normalizada a L2 unitaria; tamaño del repositorio 5,6 GB; biblioteca declarada `uce_suite`; versión de corpus v2026-09.

## Arquitectura y entrenamiento

El modelo implementa `UCEForExpressionPrediction` (model_type: `uce`). El flujo de cómputo es el siguiente: una secuencia de entrada `input_ids [B, 2048]` pasa por una tabla `Embedding(266403, 5120)` que contiene tokens de genes ESM2 congelados (`embedding_requires_grad: false`); a continuación una `LayerNorm(5120)` y una proyección `Linear(5120 -> 512)` con su correspondiente LayerNorm; se suma una codificación posicional sinusoidal de longitud máxima 2.048; el resultado atraviesa un `TransformerEncoder` de 8 capas con `d_model` 512, 4 cabezas de atención, `dim_feedforward` 2.048 (factor de expansión 4), activación GELU, post-norm (`norm_first: false`) y dropout 0,1; se toma la posición 0 (slot CLS, `embedding_reduction: cls`) y se aplica `Linear(512 -> 512)`, LayerNorm y `F.normalize`, obteniendo un `cell_embedding [B, 512]` de norma L2 unitaria. Para el entrenamiento se añade una cabeza MLP decodificadora con dimensiones `[1024, 512, 512, 1]` (`decoder_dropout` 0.1) que concatena el embedding de la célula con el embedding proyectado del gen objetivo y emite un logit; esta cabeza no es necesaria para extraer embeddings.

El entrenamiento se realizó desde cero sobre "data mix v3", una mezcla diseñada sobre el corpus v2026-09 (26 cachés, 147.675.214 células, 13 especies, split 0.995/0.005 entrenamiento/reservado). El entrenador materializó una pasada de 67.108.864 muestras (131.072 pasos x batch global 512) con ponderaciones por célula: masa por especie proporcional a (células de entrenamiento)^0,7 (`species_alpha` 0,7); re-ponderación de células cerebrales hasta un mínimo del 67 % (`brain_fraction_target` 0,67); dentro de cada estrato (especie, cerebro/no cerebro), peso de dataset proporcional a n^0,5 (`dataset_alpha` 0,5); bibliotecas sci-RNA-seq3 a la mitad de peso; límite de 4 repeticiones esperadas por caché (`max_epochs_per_spec` 4,0); y exclusión de dos datasets de CELLxGENE Discover y de bibliotecas NeMO duplicadas en las cachés de BrainGenome. La composición realizada asigna el 59,65 % de las muestras a homo_sapiens, el 23,12 % a mus_musculus y el 67,9 % del total a tejido cerebral. No se documenta uso de RLHF ni DPO, al no ser un modelo de lenguaje.

El desglose de parámetros según la cabecera de safetensors es: tabla ESM2 congelada 1.363.983.360 elementos; buffer posicional fijo 1.048.576; pesos entrenados 28.905.985 (transformer 25.219.072, proyector de entrada 2.622.976, proyector de salida 263.680, decoder 790.017, LayerNorm de embedding 10.240).

## Capacidades

- Extracción de features: genera un embedding de célula de 512 dimensiones con norma L2 unitaria a partir de los recuentos génicos brutos de una célula.
- Similitud vectorial directa: al estar los embeddings normalizados, el producto escalar equivale a la similitud coseno, lo que simplifica la búsqueda de vecinos más cercanos.
- Procesamiento multi-especie: maneja de forma conjunta 13 especies en un espacio de embeddings compartido (humano, ratón, macaco rhesus, tití común, chimpancé, rata, lémur ratón, cerdo, pez cebra, zarigüeya, macaco de cola de cerdo, mono nocturno y tupaya).
- Especialización en cerebro: el 67,9 % de las muestras de entrenamiento corresponden a la etiqueta `tissue_general == "brain"`.
- Agregación por token CLS: la representación de la célula se obtiene de la posición 0 de la secuencia.
- Orden génico cromosómico: la "frase celular" ordena los genes por cromosoma antes de la codificación posicional.
- Predicción de expresión génica: la cabeza decodificadora MLP puede emitir un logit de expresión por gen (no necesaria para extraer embeddings).
- Base para tareas downstream: los embeddings sirven como entrada para clustering, reducción de dimensionalidad (UMAP/t-SNE), transferencia de etiquetas y clasificadores de tipo celular.
- Tool calling / function calling: no aplicable (no es un modelo de lenguaje).
- Agentes y razonamiento multi-paso: no aplicable.
- Capacidades multilingües, de visión, audio o modo "thinking": no aplicables.

## Casos de uso

- Anotación de tipos celulares en tejido cerebral: los embeddings de 512 dimensiones permiten entrenar clasificadores o aplicar transferencia de etiquetas desde atlas de referencia para asignar tipos celulares a células nuevas, aprovechando que el entrenamiento está sesgado hacia cerebro.
- Integración de datos entre especies: al compartir espacio de embeddings entre 13 especies, permite comparar poblaciones celulares de cerebro entre humano, ratón, macaco o tití, útil en estudios de biología comparada y modelos animales.
- Búsqueda de vecinos más cercanos y recuperación de células: la normalización L2 unitaria hace que la similitud coseno sea un producto escalar, lo que habilita índices vectoriales para localizar células con perfiles de expresión similares.
- Construcción de atlas de referencia: los embeddings pueden emplearse como features congeladas para modelos downstream de anotación, agrupamiento o descubrimiento de subpoblaciones en proyectos tipo BICAN.
- Análisis de especies poco representadas: la mezcla v3 eleva la cuota de las ocho especies más pequeñas de 0,02-0,18 % a 0,20-0,85 %, lo que resulta útil para estudios en organismos con pocos datos disponibles (lémur ratón, zarigüeya, tupaya, mono nocturno).
- Predicción de expresión génica: la cabeza decodificadora permite estimar un logit de expresión para un gen objetivo dado el embedding celular, aplicable a tareas de imputación o de análisis de expresión.
- Preprocesamiento en pipelines de descubrimiento: los embeddings pueden alimentar análisis de estados celulares raros, trayectorias o comparaciones de condiciones sin necesidad de reentrenar el modelo.
- Reducción de dimensionalidad previa a la visualización: el vector de 512 dimensiones sirve de entrada a UMAP o t-SNE para explorar la estructura de un experimento de scRNA-seq.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente identifica el conjunto de evaluación por su nombre (`mixv3_131k_gb512`) y el run de entrenamiento (`brain_mixC_v2026_09_noeval_131072steps/2026-09-23_10-30-28`), pero no incluye métricas cuantitativas (ni MMLU, HumanEval o GSM8K, que no aplican a un modelo de célula única, ni métricas biológicas como纯度 de clustering, integración por lotes o precisión de anotación).

## Requisitos de hardware

- VRAM estimada para inferencia en fp32 (formato publicado): aproximadamente 5,6 GB solo de pesos, más activaciones y sobrecarga del runtime; en la práctica unos 6-7 GB para batch 1 (estimación propia, no documentada por el autor).
- VRAM estimada tras conversión a fp16/bf16: alrededor de 2,8 GB de pesos (estimación aritmética, no documentada).
- VRAM estimada tras cuantización a int8: alrededor de 1,4 GB; a int4: alrededor de 0,7 GB (estimaciones, no documentadas).
- GPU recomendadas: cualquier GPU con al menos 8-12 GB permite inferencia en fp32 para batch pequeño (por ejemplo RTX 3060 12 GB, RTX 4070, RTX 3080/3090, RTX 4090); A100 o H100 son adecuadas para lotes grandes o para reentrenamiento.
- Cabe en GPU de consumo: sí, dado que el peso en fp32 es de 5,6 GB y la mayoría de los parámetros son una tabla de embeddings congelada; tarjetas de 8 GB o más pueden ejecutarlo (estimación).
- Opciones de despliegue: la model card declara la biblioteca `uce_suite` y pesos en safetensors, cargables con PyTorch. No se documentan integraciones con vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia (no aplicables a un modelo de embeddings biológicos).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Mezcla de datos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| brain-uce-pilot-mix-v3 | 1.393.937.921 (28.905.985 entrenados) | 2.048 tokens génicos | data mix v3: 67,9 % cerebro; humano 59,65 %, ratón 23,12 % | other (sin elegir) | HuggingFace, 0 descargas, 0 likes |
| KuanP/brain-uce-pilot-mix-v2 (modelo hermano) | misma arquitectura y mismo corpus | 2.048 tokens génicos | muestreo uniforme: 43,1 % cerebro; humano 74,3 %, ratón 18,9 % | no disponible (definida como other en v3) | HuggingFace |
| Otros modelos fundacionales de célula única (UCE, scGPT, Geneformer y similares) | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación documentada es la del modelo hermano v2, entrenado sobre el mismo corpus con el mismo número de muestras y muestreo uniforme, lo que aísla el efecto de la mezcla diseñada. No se dispone de datos de rendimiento que permitan comparar numéricamente con otros modelos fundacionales de célula única.

## Limitaciones y advertencias

- Modelo piloto de investigación: la propia model card indica "pilot research model; license not yet chosen", por lo que el uso comercial es incierto y debe consultarse con el autor.
- Licencia "other" sin texto asociado: no se especifican condiciones de redistribución ni de uso comercial.
- Sin validación publicada: no hay resultados de benchmarks ni métricas de calidad (clustering, integración por lotes, anotación) en la información disponible.
- Sesgo de mezcla hacia cerebro: el 67,9 % de las muestras de entrenamiento son de tejido cerebral, por lo que el rendimiento puede degradarse en tejidos no cerebrales.
- Desequilibrio entre especies: humano representa el 59,65 % de las muestras y ratón el 23,12 %, frente a cuotas de 0,20-0,85 % en las ocho especies menores; la calidad de los embeddings puede variar notablemente entre especies.
- Límite de 2.048 genes por célula (max_sequence_length): no se documenta el tratamiento de perfiles génicos más largos.
- Vocabulario génico cerrado: la tabla ESM2 congelada contiene 266.403 entradas; los genes ausentes de esa tabla no pueden tokenizarse.
- Huella de memoria alta en fp32 (5,6 GB de pesos) y ausencia de versiones cuantizadas publicadas.
- Riesgo de predicciones imprecisas en la cabeza decodificadora de expresión: los logits por gen no están calibrados ni validados con métricas publicadas.
- Naturaleza no generativa: no admite conversación, tool calling, agentes ni razonamiento multi-paso, por lo que no debe presentarse como un modelo de lenguaje.
- El nombre del run incluye "noeval", lo que sugiere que no se ejecutó evaluación durante el entrenamiento.
- Corte temporal del corpus: los datos de CELLxGENE Census empleados son del 2025-11-08, por lo que experimentos posteriores a esa fecha no están representados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KuanP/brain-uce-pilot-mix-v3
- Modelo hermano con muestreo uniforme: https://huggingface.co/KuanP/brain-uce-pilot-mix-v2
- Código de entrenamiento: repositorio `uce-training-suite`, rama `ucsc-brain`, commit `be8b45db96a535f0d82703f73443b6574ad4021d` (URL no disponible en la información proporcionada)
- Biblioteca declarada: `uce_suite` (URL no disponible en la información proporcionada)
- Fuentes de datos citadas: CELLxGENE Census 2025-11-08, BICAN NeMO, BrainGenome y CELLxGENE Discover (URLs no disponibles en la información proporcionada)
