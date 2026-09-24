# KuanP/brain-uce-pilot-mix-v2

## Resumen

brain-uce-pilot-mix-v2 es un modelo piloto de embeddings celulares de estilo UCE (Universal Cell Embedding) para datos de scRNA-seq de cerebro, publicado por el usuario KuanP en Hugging Face. Transforma los recuentos crudos de una célula en un vector de 512 dimensiones con norma L2 unitaria, de forma que el producto escalar entre dos embeddings equivale a su similitud coseno. No es un modelo de lenguaje: su salida es una representación vectorial de célula, y su entrada es una «frase celular» de hasta 2.048 tokens de genes ordenados por cromosoma.

El entrenamiento se hizo desde cero sobre el corpus «data mix v2» (v2026-09), formado por 26 cachés, 147.675.214 células y 13 especies, con un 43,1 % de células etiquetadas como cerebro. El modelo guarda 1.393.937.921 parámetros, pero solo 28.905.985 son entrenables: la mayor parte (1.363.983.360) es la tabla de embeddings de tokens de genes ESM2, que permanece congelada durante el entrenamiento.

Es relevante ahora porque aplica el paradigma de los foundation models a la biología de célula única con un sesgo explícito hacia cerebro y con cobertura multiespecie (humano, ratón, macaco, tití, rata, chimpancé, pez cebra, entre otros). Su propio autor lo etiqueta como modelo piloto de investigación y no ha elegido licencia definitiva, ni ha publicado métricas de evaluación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder de 8 capas (d_model 512, 4 cabezas de atención, dim_feedforward 2048, GELU, post-norm, dropout 0,1) con tabla de embeddings de genes ESM2 congelada (266.403 x 5.120), proyección lineal 5120 -> 512, codificación posicional sinusoidal y reducción por token CLS; `model_type: uce`, clase `UCEForExpressionPrediction` |
| Parámetros totales | 1.393.937.921 (118 tensores en fp32) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Parámetros entrenables | 28.905.985 (transformer 25.219.072; proyector de entrada 2.622.976; proyector de salida 263.680; decodificador 790.017; LayerNorm de embedding 10.240) |
| Longitud de contexto | 2.048 tokens (secuencia de genes ordenada por cromosoma) |
| Tipos de cuantización | no disponible (solo se publican pesos en fp32) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje natural; el vocabulario cubre genes de 13 especies) |
| Licencia | other (el autor indica que la licencia aún no se ha elegido) |
| Formato de pesos | safetensors (`model.safetensors`, 5.575.765.828 bytes, 118 tensores fp32) |
| Dimensión del embedding | 512, norma L2 unitaria |
| Tamaño de vocabulario | 266.403 (ids 0-3: tokens especiales; ids 4-237.410: genes de las 11 especies no-pez-cebra; ids 237.411-239.337: tokens de inicio de cromosoma) |
| Tamaño del repositorio | 5,6 GB |
| Pipeline declarado | feature-extraction |
| Librería | uce_suite |

## Arquitectura y entrenamiento

El modelo sigue el esquema de UCE adaptado a un transformer encoder compacto. La entrada es un tensor `input_ids [B, 2048]` que representa la célula como una secuencia de genes ordenados por posición cromosómica. Cada id pasa por una tabla de embeddings de 266.403 x 5.120 procedente de ESM2 que está congelada (`embedding_requires_grad: false`), seguida de un LayerNorm de 5.120 y una proyección lineal a 512 dimensiones con LayerNorm posterior. Sobre esa representación se suma una codificación posicional sinusoidal (máximo 2.048 posiciones) y se aplican 8 capas de `TransformerEncoder` con d_model 512, 4 cabezas, feedforward de 2.048, activación GELU, post-norm (`norm_first: false`) y dropout 0,1. La salida se reduce tomando la posición 0 (token CLS), se proyecta con un `Linear(512 -> 512)`, se normaliza con LayerNorm y se normaliza con `F.normalize`, dando un embedding de célula de 512 dimensiones con norma L2 unitaria. El bloque posicional es un buffer sinusoidal fijo (2.048 x 512). Existe además una cabeza de entrenamiento que no se necesita para extraer embeddings: un decodificador MLP con dimensiones `[1024, 512, 512, 1]` y dropout 0,1 que recibe la concatenación del embedding de célula y el embedding proyectado del gen objetivo y emite un único logit.

Los datos de entrenamiento son el corpus «data mix v2» (v2026-09), agregado a partir de 26 cachés: 119.775.282 células de CELLxGENE Census (build 2025-11-08), 17.847.041 de BICAN NeMO, 1.844.273 de BICAN BrainGenome y 8.208.618 de CELLxGENE Discover. El reparto fue de 146.936.824 células de entrenamiento y 738.364 de retención (0,995 / 0,005). Cada caché se usó íntegra, sin selectores de metadatos, muestreadores ni filtros de calidad (`dataset.selectors/sampler/quality_filters: null`), y el muestreo fue uniforme sobre el split de entrenamiento concatenado, por lo que las proporciones por especie del corpus coinciden con las de los ejemplos de entrenamiento (humano 74,26 %; ratón 18,90 %; macaco 3,37 %; tití 1,86 %; pez cebra 0,83 %; resto por debajo del 0,2 %). La etiqueta «brain» corresponde solo a `tissue_general == "brain"`: 63.658.291 células cerebrales (43,11 %) frente a 84.016.923 no cerebrales (56,89 %). El entrenamiento se ejecutó durante 262.144 pasos con autocast en bf16, con los pesos almacenados en fp32, mediante el código `uce-training-suite` (rama `ucsc-brain`, commit `d9df996eb62ccebb3a22cdf89d72c4a678f91d35`). No se documenta RLHF ni DPO, algo que no aplica a este tipo de modelo.

## Capacidades

- Extracción de características: convierte recuentos crudos de scRNA-seq en embeddings de célula de 512 dimensiones con norma L2 unitaria, listos para similitud coseno y búsqueda por vecinos.
- Representación ordenada por cromosoma: la célula se serializa como una «frase» de hasta 2.048 tokens de genes, con tokens específicos de inicio de cromosoma y de fin de bloque cromosómico.
- Integración multiespecie: el vocabulario y el entrenamiento cubren 13 especies (homo_sapiens, mus_musculus, macaca_mulatta, callithrix_jacchus, danio_rerio, microcebus_murinus, rattus_norvegicus, pan_troglodytes, sus_scrofa, macaca_nemestrina, monodelphis_domestica, aotus_nancymaae, tupaia_chinensis), lo que permite proyectar células de distintas especies en un espacio común.
- Predicción de expresión génica: la cabeza decodificadora MLP `[1024, 512, 512, 1]` permite emitir un logit de expresión para un gen objetivo a partir del embedding de célula y del embedding del gen.
- Especialización en cerebro: el 43,11 % de las células de entrenamiento proceden de tejido cerebral, con bloques específicos de BICAN NeMO y BICAN BrainGenome.
- No dispone de tool calling ni function calling, no soporta agentes ni razonamiento multi-paso, no genera texto, no tiene modo de pensamiento y no procesa visión ni audio.

## Casos de uso

- Anotación de tipos celulares en atlas de cerebro: los embeddings sirven como entrada a clustering (Leiden/Louvain) y a clasificadores de transferencia de etiquetas; el entrenamiento con 63,6 millones de células cerebrales de 13 especies proporciona una base amplia para regiones y tipos poco representados en un dataset concreto.
- Integración cross-species en neurociencia comparada: al compartir vocabulario de genes y espacio de 512 dimensiones, permite alinear células humanas con macaco, tití, ratón o rata para comparar tipos celulares homólogos entre especies en un mismo gráfico.
- Construcción de atlas de referencia y mapeo query-to-reference: se puede embeber un atlas completo y proyectar después muestras nuevas, asignando cada célula al vecino más cercano por similitud coseno.
- Recuperación de tipos celulares raros: la búsqueda kNN sobre embeddings permite localizar poblaciones minoritarias (por ejemplo, subtipos gliales o neuronales poco frecuentes) sin depender de marcadores predefinidos.
- Preprocesado para modelos de trayectoria y pseudotiempo: los embeddings de 512 dimensiones reducen el ruido y la dimensionalidad antes de ajustar modelos de difusión o de árboles de linaje.
- Imputación y denoising de expresión: la cabeza decodificadora permite predecir la expresión de genes concretos a partir del embedding, útil para completar matrices dispersas antes de análisis diferencial.
- Armonización de lotes y plataformas: usar un mismo embedder para distintos datasets reduce el efecto de lote en comparación con espacios de features calculados por separado, siempre que los datasets estén dentro de la distribución cubierta por el corpus de entrenamiento.
- Generación de características para clasificadores supervisados aguas abajo: los vectores se pueden congelar y alimentar a modelos ligeros (regresión logística, XGBoost, MLP) para tareas de etiquetado tisular o regional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente identifica el benchmark como `multi_v09_262k` y la ejecución de entrenamiento como `brain_multi_v2026_09_noeval_262144steps/2026-09-20_23-48-44`, sin incluir métricas (ni de clasificación celular, ni de integración por lote, ni de predicción de expresión). Tampoco se han publicado comparaciones numéricas frente a UCE, scGPT u otros modelos de célula única.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: unos 5,58 GB solo para los pesos (1.393.937.921 parámetros x 4 bytes; el archivo `model.safetensors` ocupa 5.575.765.828 bytes). Con activaciones de atención sobre 2.048 tokens y d_model 512, el consumo es moderado pero el peso de la tabla de embeddings domina.
- VRAM estimada en bf16/fp16: unos 2,79 GB para los pesos, si se convierte el checkpoint (el autor solo publica fp32).
- La tabla de embeddings congelada (266.403 x 5.120) es una operación de consulta de filas, por lo que la extracción de características puede ejecutarse en CPU, siempre que se disponga de RAM suficiente para cargar el modelo completo (aproximadamente 6-8 GB de RAM libres).
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM para fp32 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090) y con 6 GB o más si se convierte a bf16. A100, H100 o L40S no son necesarias para inferencia, pero son útiles para procesar lotes masivos a escala de atlas.
- Cabe en GPU de consumo: sí, en las gamas mencionadas.
- Opciones de despliegue: la librería declarada es `uce_suite` (carga mediante `model_type: uce`), con el código de entrenamiento en `uce-training-suite` (rama `ucsc-brain`). No hay soporte documentado en vLLM, llama.cpp, Ollama, TGI ni en `transformers` estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| KuanP/brain-uce-pilot-mix-v2 | 1.393.937.921 (28.905.985 entrenables) | 2.048 tokens de genes | other (sin licencia elegida) | Hugging Face |
| KuanP/uce-brain-pilot-8l-512d | no disponible | no disponible | no disponible | Hugging Face |
| KuanP/uce-brain-mix-v1 | no disponible | no disponible | no disponible | Hugging Face |
| snap-stanford/UCE-brain | no disponible | no disponible | no disponible | Repositorio de código en GitHub (el checkpoint se descarga desde Hugging Face) |

No se dispone de datos de rendimiento comparativos entre estas variantes. Los modelos de referencia de la categoría (UCE original, scGPT, Geneformer) no aparecen con métricas en la información proporcionada, por lo que no se incluye comparación numérica.

## Limitaciones y advertencias

- Modelo piloto de investigación: el propio autor lo etiqueta como tal y declara que la licencia aún no se ha elegido (`license: other`), por lo que no hay condiciones claras de uso comercial.
- Ausencia total de métricas: no se han publicado resultados de evaluación y el nombre de la ejecución de entrenamiento incluye el sufijo `noeval`, lo que sugiere que no se ejecutó validación durante el entrenamiento.
- Sesgo de composición del corpus: el 74,26 % de las células son humanas y el 18,90 % de ratón, mientras que especies como el pez cebra (0,83 %), el microcebo (0,18 %) o el cerdo (0,09 %) tienen representación marginal; los embeddings para estas especies pueden ser menos fiables.
- Sesgo hacia cerebro: aunque el 43,11 % de las células son cerebrales, el 56,89 % restante no lo es, y la definición de «brain» usada excluye médula espinal, «central nervous system» y «nervous system», lo que puede introducir inconsistencias en la etiqueta tisular durante el entrenamiento.
- Sin filtros de calidad ni selectores de metadatos: cada caché se utilizó íntegra, de modo que el modelo ha absorbido células de baja calidad, dobletes y artefactos específicos de plataforma.
- Split de retención pequeño y posiblemente desbalanceado: solo 738.364 células (0,5 %) quedaron fuera del entrenamiento, y no se documenta cómo se distribuyen por especie o tejido.
- Truncado de la entrada: la secuencia máxima es de 2.048 tokens, por lo que las células con más genes detectados ven recortada su representación.
- Vocabulario restringido: los ids 4-237.410 corresponden a los genes de las 11 especies no-pez-cebra, de modo que la cobertura de genes de pez cebra depende del tramo de vocabulario documentado de forma incompleta en la model card.
- Coste de almacenamiento: los pesos se distribuyen solo en fp32 (5,58 GB), lo que duplica el espacio frente a un checkpoint en bf16 y complica su despliegue en memoria limitada.
- Sin soporte en el ecosistema de inferencia habitual: al usar `model_type: uce` y la librería `uce_suite`, no es compatible con vLLM, llama.cpp, Ollama o TGI.
- Riesgo de alucinación en el sentido biológico: la cabeza decodificadora puede producir predicciones de expresión plausibles pero incorrectas; no debe usarse como sustituto de mediciones experimentales.
- Riesgo de generalización fuera de dominio: no hay evidencia publicada de que los embeddings mantengan su estructura en tejidos, plataformas o especies ausentes del corpus v2026-09.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KuanP/brain-uce-pilot-mix-v2
- Modelo relacionado (piloto 8 capas, 512 dimensiones): https://huggingface.co/KuanP/uce-brain-pilot-8l-512d
- Modelo relacionado (mix v1): https://huggingface.co/KuanP/uce-brain-mix-v1
- Repositorio de referencia UCE-brain (snap-stanford): https://github.com/snap-stanford/UCE-brain
- Código de entrenamiento citado en la model card: repositorio `uce-training-suite`, rama `ucsc-brain`, commit `d9df996eb62ccebb3a22cdf89d72c4a678f91d35` (sin URL pública en la información disponible)
- Ficheros de configuración y datos citados en el repositorio del modelo: `config.json`, `training/config.yaml`, `training/git_info.json`, `training/dataset_indices_summary.json`, `data_mix_composition.csv`, `vocab/all_species_gene_dict_v2026-09.json`
- Benchmarks: no disponibles
