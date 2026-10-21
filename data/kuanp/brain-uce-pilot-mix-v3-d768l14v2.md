# KuanP/brain-uce-pilot-mix-v3-d768l14v2

## Resumen

`brain-uce-pilot-mix-v3-d768l14v2` es un modelo piloto de tipo Universal Cell Embedding (UCE) para datos de RNA-seq de célula única en tejido cerebral, desarrollado por el usuario KuanP y publicado en HuggingFace. No es un modelo de lenguaje: es un extractor de características (`feature-extraction`) que convierte el perfil transcriptómico de una célula en un vector denso de 768 dimensiones con norma L2 unitaria, de modo que el producto escalar entre dos vectores equivale a su similitud coseno. Resuelve el problema de obtener representaciones comparables entre especies y experimentos distintos sin reentrenar un modelo por dataset.

El modelo se entrena desde cero sobre la mezcla de datos «v3» (mixture C) del corpus `v2026-09`: 26 cachés, 147.675.214 células de origen y 13 especies, de las cuales se materializan 67.108.864 muestras de entrenamiento con un 67,9 % de células etiquetadas como cerebro. La arquitectura abandona el esquema de los pilotos anteriores (embedding de 512 dimensiones) y se aproxima al UCE público de 33 capas: encoder pre-norm de 14 capas con d_model 768, RMSNorm, QK-norm y FFN SwiGLU, manteniendo la entrada UCE de «frase celular» ordenada por cromosoma sobre tokens de gen ESM2 congelados.

Es relevante ahora porque documenta una receta reproducible (semilla, mezcla, número de pasos y batch global) para escalar modelos de célula única multi-especie con recursos moderados: 114,0 M de parámetros entrenados sobre una tabla ESM2 congelada de 1.364 M. Su estado es explícitamente piloto y la licencia aún no se ha elegido, por lo que no debe tratarse como un artefacto listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder pre-norm (`model_type: uce`, `encoder_impl: uce`), 14 capas, d_model 768, 6 cabezas de 128 dimensiones; RMSNorm, QK-norm sobre q y k, FFN SwiGLU con hidden 2048, sin sesgos (`encoder_bias: false`), dropout 0,05 |
| Parámetros totales | 1.479.570.433 en safetensors (114.014.209 entrenados + 1.363.983.360 de la tabla de tokens de gen ESM2 congelada de 266.403 × 5.120) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 2.048 tokens (`max_sequence_length: 2048`), correspondientes a la «frase celular» de genes ordenada por cromosoma |
| Tipos de cuantización | No disponible; solo se publican pesos fp32 (151 tensores) |
| Idiomas soportados | No disponible; no es un modelo de lenguaje, opera sobre identificadores de gen |
| Licencia | `other` (licencia no elegida todavía según la model card) |
| Formato de pesos | `model.safetensors`, 5.918.299.836 bytes, fp32 |
| Vocabulario de entrada | 266.403 tokens de gen (tabla ESM2 congelada, 5.120 dimensiones, `embedding_requires_grad: false`) |
| Dimensión del embedding de salida | 768, con norma L2 unitaria |
| Objetivo | Predicción de expresión génica enmascarada (mask 0,20 con negativos expresados por dataset) más capa de gen diana separada y cabeza MLP de célula |
| Entrenamiento | 262.144 pasos, batch global 256, 8 GPU A100 |
| Corpus | 67.108.864 muestras de entrenamiento, 26 cachés, 13 especies, split 0,995 / 0,005 (semilla 42) |

## Arquitectura y entrenamiento

El pipeline de entrada replica el de UCE: cada célula se serializa como una secuencia de 2.048 identificadores de gen ordenados por cromosoma. Cada identificador se resuelve contra una tabla ESM2 congelada de 266.403 × 5.120, se normaliza con L2 sobre las 5.120 dimensiones (sin LayerNorm de embedding, `use_embedding_layer_norm: false`) y se proyecta con `Linear(5120 → 768) → GELU → LayerNorm`. Sobre esa proyección se suma una codificación posicional sinusoidal escalada por 0,0360844 (= 1/√768, `pe_scale`) y se atraviesan 14 bloques pre-norm (`norm_first: true`) con RMSNorm, QK-norm aplicada sobre `head_dim` en consultas y claves, y FFN SwiGLU de hidden 2048, con dropout 0,05 en las ramas de atención, FFN, posicional y residual, y una RMSNorm final. Respecto a los pilotos previos, el cambio de red y objetivo busca acercarse al UCE público de 33 capas incorporando una capa de gen diana separada y una cabeza MLP de célula.

El entrenamiento se hizo desde cero sobre la mezcla «v3» (mixture C), idéntica a la de `KuanP/brain-uce-pilot-mix-v3`: 67.108.864 muestras materializadas de un corpus de 147.675.214 células, con reparto 0,995 / 0,005 entre entrenamiento y held-out (semilla 42) y células retenidas idénticas a las de la release v3. Las reglas de mezcla ponderan la masa por especie como (células de entrenamiento)^0,7, fuerzan al menos un 67 % de células de cerebro dentro de cada especie, ponderan cada dataset como n^0,5 dentro del estrato (especie, cerebro / no cerebro), reducen a la mitad el peso de sci-RNA-seq3 y limitan la repetición esperada de cada caché a 4×. La diferencia frente a v3 es el consumo de muestras: 262.144 pasos × batch 256 en lugar de 131.072 × 512. La distribución resultante está dominada por *Homo sapiens* (40.033.420 muestras, 59,65 %) y *Mus musculus* (15.516.985, 23,12 %); el resto de especies queda por debajo del 7 % cada una. El repositorio de entrenamiento (`uce-training-suite`, rama `ucsc-brain`) es privado y el commit declarado incluye cambios sin publicar, lo que limita la reproducibilidad exacta.

## Capacidades

- Extracción de embeddings de célula de 768 dimensiones con norma L2 unitaria, aptos para similitud coseno directa, clustering, UMAP/t-SNE y búsqueda de vecinos.
- Predicción de expresión génica enmascarada: el modelo se entrena enmascarando el 20 % de la frase celular y reconstruyendo los genes ocultos, con negativos restringidos a genes expresados en el dataset.
- Modelado multi-especie: la tabla de tokens cubre 266.403 genes y el entrenamiento incluye 13 especies (humano, ratón, macaco Rhesus, tití, chimpancé, rata, lemur ratón, cerdo, pez cebra, entre otras).
- Especialización en tejido cerebral: el 67,9 % de las muestras de entrenamiento llevan la etiqueta `tissue_general == "brain"`, con especies como tití, rata, chimpancé y macaco Rhesus al 100 % de células cerebrales.
- Integración de lotes y plataformas: el corpus combina CELLxGENE Census 2025-11-08, BICAN NeMO, BrainGenome y CELLxGENE Discover, lo que expone al modelo a múltiples protocolos (incluido sci-RNA-seq3) y plataformas.
- No soporta generación de texto, tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje y su salida es un vector, no una secuencia.
- No se documentan capacidades de visión, audio ni modo «thinking».

## Casos de uso

- Integración de atlas cerebrales multi-estudio: proyectar células de distintos experimentos al mismo espacio de 768 dimensiones y corregir el efecto de lote antes de un análisis conjunto, aprovechando que el modelo se ha entrenado con 26 cachés de orígenes heterogéneos.
- Transferencia de anotaciones entre especies: usar los embeddings para asignar etiquetas de tipo celular de humano a macaco o tití mediante kNN sobre una referencia anotada, dado que el entrenamiento incluye esas especies con alta proporción de cerebro (97,5 % y 100 % respectivamente).
- Preentrenamiento congelado para clasificadores downstream: congelar el encoder y entrenar una regresión logística o un MLP ligero sobre los 768 dims para tareas de clasificación de tipo celular o estado, reduciendo el coste frente a entrenar desde cero.
- Búsqueda y recuperación de células similares: indexar los embeddings unitarios y resolver consultas por producto escalar para localizar poblaciones raras o estados transitorios en un nuevo dataset.
- Análisis exploratorio y clustering no supervisado: alimentar pipelines de Leiden/Louvain o UMAP con los embeddings del modelo en lugar de PCA sobre genes, útil cuando el número de genes es muy variable entre plataformas.
- Validación interna de recetas de entrenamiento: emplear la variante `d768l12` y el piloto de 512 dimensiones como líneas base para medir el efecto de la profundidad y de la dimensión del embedding sobre tareas de integración.
- Detección de células fuera de distribución: comparar la similitud coseno de una célula nueva contra el vecindario de referencia para marcar muestras atípicas antes de un análisis aguas abajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card identifica el run con el nombre `mixv3_d768l14v2_262k` y la ejecución de entrenamiento `brain_mixC_v2026_09_d768l14v2_noeval_262144steps/2026-10-18_03-33-38`, cuyo propio nombre indica `noeval`; no se aportan métricas de integración, transferencia de etiquetas ni reconstrucción de expresión.

## Requisitos de hardware

- Los pesos publicados suman 5.918.299.836 bytes en fp32 (151 tensores), es decir, unos 5,9 GB de VRAM solo para el estado del modelo; la tabla ESM2 congelada representa 1.363.983.360 de esos parámetros.
- Estimación de inferencia: se requieren aproximadamente 6-8 GB de VRAM en fp32 para lotes pequeños de secuencias de 2.048 tokens (estimación propia a partir del tamaño de pesos; no publicada por el autor).
- GPU de consumo: cabe en tarjetas de 8 GB de forma ajustada y con holgura en 12 GB o más (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090). Las de 6 GB no son viables en fp32.
- GPU de datacenter: el entrenamiento se ejecutó en 8 × A100; para inferencia son válidas A100 40/80 GB, H100, L40S o L4. Una sola A100 permite lotes grandes.
- Despliegue: no se documenta soporte para vLLM, TGI, llama.cpp ni Ollama, que no aplican a este tipo de modelo. La inferencia se realiza con el repositorio `UCE-brain` (rama `d768l14-v2`, sección 4) y la librería `uce_brain`.
- No hay versiones cuantizadas publicadas (GGUF, AWQ, GPTQ, int8), por lo que no es posible reducir la huella por debajo de los ~5,9 GB de pesos sin convertir los pesos por cuenta propia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Embedding | Licencia | Estado |
|---|---|---|---|---|---|
| `KuanP/brain-uce-pilot-mix-v3-d768l14v2` (este) | 114,0 M entrenados + 1.364,0 M congelados | 2.048 tokens de gen | 768-d, L2 | `other` (sin elegir) | Piloto; 13 descargas |
| `KuanP/brain-uce-pilot-mix-v3` | No disponible | No disponible | 512-d | No disponible | Piloto previo, misma mezcla de datos |
| `mixv3_d768l12_262k` (línea base interna) | No disponible | No disponible | No disponible | No disponible | 12 capas, mismo draw y mismo batch/pasos |
| UCE público de 33 capas | No disponible | No disponible | No disponible | No disponible | Referencia de arquitectura y objetivo citada por el autor |

La comparación cuantitativa con alternativas externas (scGPT, Geneformer u otros modelos de célula única) no está disponible en la información proporcionada. Los tres primeros elementos comparten el mismo corpus y split, por lo que constituyen una comparación controlada de profundidad y dimensión del embedding, pero sin métricas publicadas.

## Limitaciones y advertencias

- Modelo piloto de investigación: la propia model card lo etiqueta como «pilot research model» y la licencia figura como `other` sin elegir, por lo que no existe permiso explícito para uso comercial.
- Ausencia total de benchmarks: no hay métricas de integración, transferencia de etiquetas, reconstrucción de expresión ni comparación con UCE público, de modo que el rendimiento real es desconocido.
- Reproducibilidad limitada: el repositorio `uce-training-suite` es privado, el commit `3c5ffe9c7893783a345fc510fb7914728e122cc9` no es alcanzable públicamente y el run incluye cambios en el árbol de trabajo sin publicar que afectan a las opciones del modelo v2.
- Desbalance de especies: humano y ratón concentran el 82,8 % de las muestras; especies como *Tupaia chinensis* aportan 135.220 muestras (0,20 %) y *Aotus nancymaae* 190.748 (0,28 %), por lo que la calidad de los embeddings en esas especies es presumiblemente menor.
- Sesgo de tejido: el 32,1 % de las muestras no son de cerebro, pero la receta fuerza un mínimo del 67 % cerebral dentro de cada especie; el comportamiento en tejidos no cerebrales no está caracterizado.
- Vocabulario cerrado de 266.403 genes: genes ausentes de la tabla ESM2 no pueden representarse, lo que limita su uso en anotaciones genómicas que difieran de las de referencia.
- Contexto fijo de 2.048 tokens: células con más genes expresados requieren truncamiento o selección previa, con la consiguiente pérdida de información.
- La información disponible trunca la descripción del bloque posterior a la RMSNorm final; el detalle exacto de la capa de gen diana, la cabeza MLP de célula y la función de pérdida no es verificable con los datos aportados.
- No debe interpretarse el «riesgo de alucinación» en sentido de modelo generativo: el riesgo equivalente es producir embeddings poco fiables para poblaciones o plataformas fuera de la distribución de entrenamiento, sin que exista una señal de confianza calibrada.
- Solo se distribuyen pesos fp32; no hay cuantizaciones oficiales, lo que encarece el despliegue en hardware modesto.
- Fechas a tener en cuenta: el corpus se basa en CELLxGENE Census 2025-11-08 y el modelo se publicó el 2026-10-21, con 13 descargas y 0 likes, sin evidencia de validación por parte de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KuanP/brain-uce-pilot-mix-v3-d768l14v2
- Modelo hermano con la misma mezcla de datos (citado en la model card): https://huggingface.co/KuanP/brain-uce-pilot-mix-v3
- Repositorio de entrenamiento `uce-training-suite`, rama `ucsc-brain`, commit `3c5ffe9c7893783a345fc510fb7914728e122cc9`: privado, no accesible públicamente.
- Repositorio de inferencia `UCE-brain`, rama `d768l14-v2` (sección 4 de la model card): no se proporciona URL en la información disponible.
- Papers, blogs, demos o spaces asociados: no disponibles en la información proporcionada.
