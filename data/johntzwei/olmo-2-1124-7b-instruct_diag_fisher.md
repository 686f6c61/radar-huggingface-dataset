# johntzwei/OLMo-2-1124-7B-Instruct_diag_fisher

## Resumen

OLMo-2-1124-7B-Instruct_diag_fisher no es un modelo de lenguaje, sino un artefacto derivado de curvatura: una estimación de la diagonal de la matriz de información de Fisher empírica calculada sobre los pesos de proyección del checkpoint allenai/OLMo-2-1124-7B-Instruct. Lo publica el usuario johntzwei y contiene un único fichero `diagonal.safetensors` en float32 con valores no negativos, correspondientes a las siete matrices de proyección de atención y MLP de cada una de las 32 capas del modelo base.

El estimando es la media de los cuadrados de los gradientes por secuencia individual (no el cuadrado de un gradiente medio, ni un Fisher por token, ni una aproximación EK-FAC/K-FAC). Se ajustó sobre 2.443 secuencias empaquetadas de 4.096 tokens (10.004.085 objetivos puntuados) muestreadas de `allenai/dolmino-mix-1124`, el dataset público de midtraining de OLMo. El artefacto abarca exactamente 224 tensores y 6.476.005.376 coordenadas escalares.

Su relevancia es instrumental: sirve como insumo para análisis de curvatura, selección de parámetros, estudios de sensibilidad o métodos de edición y poda que requieran una estimación de Fisher diagonal. No sustituye al modelo base ni puede cargarse como modelo causal: es un objeto de análisis, no un checkpoint funcional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (artefacto de curvatura derivado de un transformer OLMo-2) |
| Parametros totales | 6.476.005.376 coordenadas escalares en 224 tensores (subconjunto de pesos del modelo base) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica al artefacto (el modelo base usa secuencias de 4.096 tokens en el ajuste) |
| Tipos de cuantizacion | No disponible (el artefacto se distribuye en float32; no se documentan cuantizaciones) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors (`diagonal.safetensors`, float32) |

## Arquitectura y entrenamiento

El artefacto no tiene arquitectura propia: es una estimación de curvatura de segundo orden sobre el modelo `allenai/OLMo-2-1124-7B-Instruct`, fijado en la revisión inmutable `470b1fba1ae01581f270116362ee4aa1b97f4c84`, en BF16 y con atención de producto escalar escalado (`sdpa`). El alcance son exclusivamente los pesos `self_attn.{q_proj,k_proj,v_proj,o_proj}.weight` y `mlp.{gate_proj,up_proj,down_proj}.weight` de las 32 capas; quedan fuera la cabeza de salida, los embeddings, las normalizaciones, los sesgos y cualquier otro parámetro. Por tanto, no puede cargarse como modelo de lenguaje causal.

El cálculo se realizó sobre 2.443 secuencias empaquetadas de 4.096 IDs de token (10.004.085 objetivos de siguiente token), construidas con un muestreador de CPU con semilla 42 a partir de `allenai/dolmino-mix-1124` (revisión `a319f19eef1e257417b11ea8c30da266ae175557`). La mezcla por familias de fuente fue DCLM 47,2 %, FLAN 16,6 %, peS2o 5,85 %, Wiki 7,11 %, StackExchange 2,45 % y Math 20,8 %, con 15.378 documentos distintos. Se aplicó una lista de exclusión por hash de texto exacto con 11.506 hashes de OLMo-Detect sin intersecciones exactas, aunque no se descartan cuasi-duplicados. El cómputo se ejecutó en cuatro GPU H100 de un mismo nodo, con gradientes solo para los pesos seleccionados, logits en float32, gradientes BF16 convertidos a float32, elevados al cuadrado por coordenadas y acumulados en un numerador float32 en CPU. Se conservaron checkpoints atómicos y reanudables en 245 secuencias / 1.003.275 objetivos, 1.223 / 5.008.185 y 2.443 / 10.004.085, y el resultado final se exportó dividiendo el numerador entre 2.443 secuencias.

## Capacidades

- No genera texto ni realiza inferencia: el artefacto no es un modelo de lenguaje y no puede cargarse como tal.
- Proporciona una estimación de la diagonal de Fisher empírica a nivel de secuencia para 224 tensores de proyección del modelo base.
- Permite análisis de curvatura y sensibilidad de parámetros sobre OLMo-2-1124-7B-Instruct.
- Sirve como insumo para métodos de selección de parámetros, poda o edición que requieran una métrica de importancia basada en gradientes.
- No incluye capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni multilingüismo, al no ser un modelo generativo.
- No es un Fisher inverso ni un Fisher precondicionado, y no se actualizó ningún peso del modelo base durante su construcción.

## Casos de uso

- Análisis de sensibilidad de pesos: usar la diagonal como medida de importancia por coordenada para identificar qué proyecciones de atención y MLP son más sensibles a los datos de midtraining de OLMo, guiando estudios de poda estructurada o no estructurada.
- Investigación en edición de modelos: servir de referencia de curvatura para comparar métodos de edición (por ejemplo, enfoques tipo MEMIT o ROME) que aproximan la importancia de parámetros mediante Fisher, sin necesidad de recalcular gradientes desde cero.
- Selección de parámetros para ajuste eficiente: emplear la diagonal para priorizar qué subconjuntos de pesos actualizar en estrategias de fine-tuning selectivo, reduciendo el coste de exploración.
- Reproducción y auditoría metodológica: el repositorio documenta hashes, semillas, cuotas por fuente y checkpoints intermedios, lo que permite reproducir el pipeline de estimación y auditar la metodología de cálculo de Fisher empírico.
- Estudios de generalización y estabilidad: comparar esta estimación (10M objetivos, mezcla concreta) con otras estimaciones de Fisher sobre el mismo checkpoint para analizar la varianza del estimando según el corpus y el tamaño de muestra.
- Base para análisis de privacidad y memorización: aunque el autor indica que no se realizó evaluación IF-MIA, la diagonal puede emplearse como señal auxiliar en estudios de influencia y memorización sobre OLMo-2.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El artefacto en sí ocupa 25,9 GB en el repositorio (float32, 6.476.005.376 coordenadas) y puede almacenarse y procesarse en CPU; no requiere GPU para su lectura.
- Para reproducir el cálculo original se necesitan cuatro GPU H100 en un mismo nodo, con el modelo base en BF16 y acumulación en CPU.
- Para cargar el modelo base asociado (OLMo-2-1124-7B-Instruct) en BF16 se estiman aproximadamente 14-16 GB de VRAM; en cuantización de 8 bits, unos 8 GB; en 4 bits, unos 5-6 GB.
- Cabe en GPU de consumo como RTX 4090 (24 GB) en BF16 con margen ajustado, y con holgura en cuantizaciones de 8 y 4 bits; también en RTX 3090 (24 GB) y A6000 (48 GB).
- Opciones de despliegue del modelo base: vLLM, TGI, llama.cpp, Ollama y transformers. El artefacto de Fisher no se despliega con estas herramientas, solo se inspecciona con safetensors o PyTorch.
- No se documentan latencias ni throughput, ya que el artefacto no ejecuta inferencia.

## Comparativa con modelos similares

| Artefacto | Modelo base | Cobertura | Tamano | Formato | Licencia |
|---|---|---|---|---|---|
| johntzwei/OLMo-2-1124-7B-Instruct_diag_fisher | OLMo-2-1124-7B-Instruct | 224 tensores de proyección (32 capas × 7) | 6.476.005.376 coordenadas float32 (25,9 GB) | Safetensors | No disponible |
| Estimaciones Fisher de referencia para Llama/Mistral | No disponible | No disponible | No disponible | No disponible | No disponible |
| Checkpoint base allenai/OLMo-2-1124-7B-Instruct | Propio | Pesos completos del modelo | ~7B parámetros | Safetensors (BF16) | No disponible en la información proporcionada |

No se dispone de información sobre otros artefactos de curvatura comparables publicados con la misma metodología y alcance; la comparativa con alternativas equivalentes queda como no disponible.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no puede cargarse como modelo causal ni usarse para generación, razonamiento o cualquier tarea de inferencia.
- El estimando es la media de cuadrados de gradientes por secuencia, no un Fisher por token, un Fisher model-sampled ni una aproximación EK-FAC/K-FAC; no debe interpretarse como una matriz de información de Fisher completa.
- No es un Fisher inverso ni un Fisher precondicionado, y no se actualizó ningún peso del modelo base.
- El alcance se limita a 224 tensores de proyección; excluye cabeza de salida, embeddings, normalizaciones y sesgos, por lo que no cubre la totalidad de los parámetros del modelo.
- La muestra no es una extracción aleatoria del corpus completo: DCLM, FLAN, peS2o, Wiki y StackExchange provienen de un único shard seleccionado, y matemáticas abarca 16 shards; las cuotas aproximan una mezcla pero no garantizan estabilidad sobre la distribución completa de midtraining.
- La lista de exclusión por hash exacto no descarta cuasi-duplicados respecto a OLMo-Detect.
- No se incluyen textos crudos, filas de token-IDs ni los checkpoints grandes de numeradores acumulados, por lo que la reproducción exacta requiere los registros del experimento original, no solo la revisión pública del dataset y las semillas.
- La licencia no está disponible en la información proporcionada; debe verificarse antes de cualquier uso comercial o redistribución.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas del artefacto, al no ser un modelo generativo; cualquier evaluación de sesgo debe realizarse sobre el modelo base.

## Enlaces

- Repositorio del artefacto: https://huggingface.co/johntzwei/OLMo-2-1124-7B-Instruct_diag_fisher
- Modelo base: https://huggingface.co/allenai/OLMo-2-1124-7B-Instruct
- Dataset de midtraining: https://huggingface.co/datasets/allenai/dolmino-mix-1124
- Paper de OLMo 2: no disponible en la información proporcionada
- Blog o demo del artefacto: no disponible en la información proporcionada
