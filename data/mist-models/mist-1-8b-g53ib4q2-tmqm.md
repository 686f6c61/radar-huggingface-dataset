# mist-models/mist-1.8B-g53ib4q2-tmQM

## Resumen

MIST (Molecular Insight SMILES Transformers) es una familia de modelos fundacionales para predicción de propiedades moleculares desarrollada por el Electrochemical Energy Group de la Universidad de Michigan (Ann Arbor). El modelo aquí descrito, `mist-1.8B-g53ib4q2-tmQM`, es una variante afinada del encoder MIST-1.8B sobre el conjunto de datos tmQM, un corpus de 108.000 compuestos organometálicos de transición con propiedades mecanocuánticas calculadas mediante DFT. No es un modelo generativo de texto: es un encoder de representaciones de moléculas en formato SMILES con una cabeza de regresión multi-tarea.

La relevancia del modelo reside en su enfoque: en lugar de entrenar modelos específicos por propiedad, MIST pre-entrena un encoder tipo RoBERTa-PreLayerNorm sobre el espacio químico de Enamine REAL (la mayor base de compuestos comercialmente disponibles) mediante Masked Language Modeling, y después lo adapta a tareas de regresión concretas. Esto permite obtener predicciones de ocho propiedades cuánticas (energías electrónica y de dispersión, momento dipolar, carga metálica, gap HOMO-LUMO, energías HOMO y LUMO, y polarizabilidad) a partir de una única pasada del encoder.

Con 1.800 millones de parámetros, 28 capas, dimensión oculta de 2304 y una longitud máxima de secuencia de 2048 tokens, el modelo se posiciona en la gama alta de los encoders químicos. Su licencia es Apache 2.0 según los metadatos de Hugging Face, aunque la model card restringe explícitamente el uso a investigación y prohíbe la redistribución y el uso comercial sin acuerdo de licencia, lo que constituye una discrepancia importante que el usuario debe resolver antes de desplegarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa-PreLayerNorm (encoder transformer), 28 capas, hidden size 2304, intermediate size 9216, 18 cabezas de atención |
| Parametros totales | 1.800.218.904 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud máxima de secuencia) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés; el input real son cadenas SMILES, no texto natural) |
| Licencia | apache-2.0 en metadatos; la model card indica "research use only" y prohíbe uso comercial sin acuerdo |
| Formato de pesos | safetensors |
| Pipeline | feature-extraction |
| Objetivo de pre-entrenamiento | Masked Language Modeling (MLM) |
| Objetivo de afinado | regresión multi-tarea (8 propiedades) |
| Función de pérdida (afinado) | MSE |
| Optimizador (pre-entrenamiento) | deepspeed.ops.lamb.FusedLAMB |
| Optimizador (afinado) | torch.optim.AdamW |
| Tokenizador | SmirkTokenizerFast (requiere Rust) |
| Tamaño del repo | 7,2 GB |
| Dataset de pre-entrenamiento | Enamine REAL Space |
| Dataset de afinado | tmQM (108.000 compuestos organometálicos de transición) |
| Hardware de entrenamiento | 32 × NVIDIA A100-SXM4-80GB |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de encoder transformer RoBERTa-PreLayerNorm con normalización previa a la capa de atención. Consta de 28 capas, dimensión oculta de 2304, tamaño intermedio de 9216 y 18 cabezas de atención, con una longitud máxima de secuencia de 2048 tokens. Sobre el encoder se añade una red de tarea consistente en un MLP de dos capas con activaciones GELU y dropout. La representación de la molécula se obtiene mediante pooling del hidden state del primer token, siguiendo la convención habitual en modelos tipo BERT/RoBERTa.

El pre-entrenamiento se realizó sobre cadenas SMILES del dataset Enamine REAL Space, la mayor base de compuestos comercialmente disponibles en el momento del entrenamiento, construida mediante análisis sintético directo a partir de bloques de construcción validados experimentalmente. El objetivo fue MLM con pérdida de entropía cruzada y optimizador FusedLAMB. El afinado se llevó a cabo sobre tmQM, un corpus de 108.000 compuestos organometálicos de transición extraídos de la Cambridge Structural Database, con propiedades calculadas mediante DFT a nivel TPSSh-D3BJ/def2-SVP sobre geometrías optimizadas con GFN2-xTB. El split fue 80/10/10 aleatorio y la pérdida de afinado fue MSE multi-tarea. El entrenamiento se ejecutó sobre 32 GPUs A100-SXM4-80GB durante aproximadamente 7 (unidad no especificada en la información disponible).

La innovación principal no es arquitectónica sino de dominio: el uso de un encoder pre-entrenado sobre espacio químico sintéticamente accesible y su adaptación a propiedades cuánticas de compuestos organometálicos, un nicho con menor cobertura que la química orgánica convencional. El modelo base del que se afina es `mist-1.8B-dh61satt`.

## Capacidades

- Predicción de ocho propiedades mecanocuánticas de compuestos organometálicos: `Electronic_E`, `Dispersion_E`, `Dipole_M`, `Metal_q`, `HL_Gap`, `HOMO_Energy`, `LUMO_Energy` y `Polarizability`.
- Extracción de embeddings moleculares a partir de SMILES mediante pooling del primer token.
- Procesamiento por lotes de cadenas SMILES (batch inference).
- Manejo de SMILES Kekulizados, formato empleado en pre-entrenamiento y afinado.
- Cobertura de diversidad elemental y estereoquímica ampliada gracias a tmQM.
- No soporta generación de texto, razonamiento, código, matemáticas, visión ni audio.
- No soporta tool calling ni function calling.
- No está diseñado para agentes ni razonamiento multi-paso.
- Capacidades multilingües: no aplica; el input es notación química, no lenguaje natural.

## Casos de uso

- Cribado virtual de electrolitos: dado un lote de SMILES candidatos, el modelo predice HOMO, LUMO y gap en una sola pasada, lo que permite filtrar miles de moléculas por estabilidad electroquímica antes de simulaciones DFT costosas. Es adecuado porque el afinado se realizó sobre propiedades cuánticas relevantes para materiales energéticos.
- Priorización de candidatos en diseño de fármacos organometálicos: la predicción de carga metálica y polarizabilidad ayuda a estimar reactividad y solubilidad de complejos de metales de transición, un espacio químico menos cubierto por modelos orgánicos convencionales.
- Pre-filtrado en pipelines de descubrimiento de materiales: el modelo actúa como surrogate rápido de DFT para descartar candidatos con gap o dipolo fuera de rango, reduciendo el número de cálculos TPSSh-D3BJ necesarios.
- Generación de descriptores para modelos downstream: los embeddings pooled pueden alimentar clasificadores o regresores adicionales (por ejemplo, predictores de toxicidad o solubilidad) mediante fine-tuning ligero sobre la salida del encoder.
- Análisis de tendencias en series de complejos: al procesar lotes de SMILES con variaciones sistemáticas de ligando o metal, el modelo permite estudiar cómo varían las propiedades electrónicas dentro de una familia, útil en química computacional.
- Docencia e investigación en química computacional: como encoder pre-entrenado de acceso abierto, sirve de base para experimentos de transferencia en dominios con pocos datos etiquetados, aprovechando que el pre-entrenamiento cubre espacio químico sintéticamente accesible.
- Validación cruzada de cálculos DFT: comparar predicciones del modelo con cálculos de referencia en nuevos conjuntos permite detectar outliers o errores en la curación de datos.

## Benchmarks y rendimiento

La model card indica que la evaluación se realizó sobre un split 80/10/10 aleatorio del dataset tmQM, con MAE promediado sobre las ocho propiedades cuánticas como métrica principal. Sin embargo, no se proporcionan los valores numéricos de MAE ni comparaciones con otros modelos en la información disponible.

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión nativa (fp32): aproximadamente 7,2 GB solo para pesos, más activaciones y overhead del runtime; se recomienda al menos 16 GB para lotes pequeños.
- VRAM estimada en fp16/bf16: alrededor de 3,6 GB para pesos; 8-12 GB cubren inferencia con lotes moderados.
- VRAM estimada en int8: aproximadamente 1,8 GB para pesos; cuantizaciones de 4 bits no están documentadas para este modelo.
- GPU recomendadas: A100-SXM4-80GB (hardware de entrenamiento), H100, L40S, A10G; en consumer, RTX 4090 (24 GB), RTX 4080 (16 GB) y RTX 3090 (24 GB) son suficientes para inferencia en fp16.
- Cabe en GPU consumer: sí, en RTX 4090, RTX 3090, RTX 4080 y RTX 4070 Ti Super (16 GB) en fp16; en GPUs de 8 GB requiere cuantización o lotes muy pequeños.
- Opciones de despliegue: transformers con `trust_remote_code=True` (método documentado), vLLM y TGI no están documentados para este modelo; llama.cpp y Ollama no soportan el tokenizador SMIRK ni la cabeza de regresión personalizada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento numérico de este modelo ni de alternativas comparables en la información proporcionada, por lo que la comparación se limita a características estructurales.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mist-1.8B-g53ib4q2-tmQM | 1,8 B | 2048 | Regresión de 8 propiedades cuánticas (organometálicos) | Apache 2.0 (metadatos) / solo investigación (model card) | Hugging Face |
| mist-1.8B-dh61satt (modelo base) | 1,8 B | 2048 | Encoder MLM de SMILES | Apache 2.0 | Hugging Face |
| Otros encoders químicos de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han identificado en la información disponible alternativas directas con las que comparar parámetros, contexto y rendimiento de forma rigurosa.

## Limitaciones y advertencias

- El modelo está afinado exclusivamente para compuestos organometálicos de transición del dataset tmQM; su rendimiento en moléculas orgánicas pequeñas o en química fuera de la distribución de tmQM no está garantizado.
- Solo acepta SMILES Kekulizados; entradas en otros formatos pueden producir predicciones erróneas sin aviso.
- La model card restringe el uso a investigación ("research use only"), prohíbe la redistribución sin permiso y exige acuerdo de licencia para uso comercial, lo que contradice la etiqueta `license:apache-2.0` de los metadatos. Esta discrepancia debe resolverse con el autor antes de cualquier despliegue comercial.
- Los pesos se proporcionan "as-is", sin garantías de corrección ni idoneidad para un propósito concreto.
- No se han publicado métricas de error (MAE) ni comparaciones con baseline, por lo que no es posible cuantificar la fiabilidad de las predicciones.
- Riesgo de extrapolación silenciosa: al ser un modelo de regresión, puede producir valores plausibles pero incorrectos en regiones del espacio químico poco representadas en tmQM.
- El tokenizador SMIRK requiere Rust instalado, lo que añade complejidad al despliegue y puede complicar la integración en entornos containerizados.
- El modelo requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; conviene auditar el repositorio antes de usarlo en producción.
- Idiomas: solo inglés en metadatos, aunque el input real es notación SMILES; no hay soporte de texto natural.
- No apto para generación de texto, razonamiento, código ni tareas de propósito general.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mist-models/mist-1.8B-g53ib4q2-tmQM
- Modelo base: https://huggingface.co/mist-models/mist-1.8B-dh61satt
- Repositorio de código MIST: https://github.com/BattModels/mist
- Demo de fine-tuning e inferencia: https://github.com/BattModels/mist-demo
- Pre-print en arXiv: https://arxiv.org/abs/2510.18900
- Dataset tmQM (DOI): https://doi.org/10.1021/acs.jcim.0c01041
- Enamine REAL Space: https://enamine.net/compound-collections/real-compounds/real-space-navigator
- Documentación de RoBERTa-PreLayerNorm: https://huggingface.co/docs/transformers/en/model_doc/roberta-prelayernorm
- Grupo de investigación (Electrochemical Energy Group, University of Michigan): https://eeg.engin.umich.edu/
