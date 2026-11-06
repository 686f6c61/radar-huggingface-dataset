# gbouras13/modernprost-base

## Resumen

ModernProst-base es un modelo de aprendizaje profundo desarrollado por gbouras13 (identificador de Hugging Face) que predice secuencias del alfabeto estructural de Foldseek a partir de la secuencia de aminoacidos de una proteina. En concreto, genera dos representaciones estructurales: el alfabeto 3Di de 20 estados y un alfabeto estructural reducido de 12 estados. El objetivo es sustituir a las estructuras tridimensionales predichas (por ejemplo, mediante AlphaFold) como consultas o dianas en busquedas Foldseek, evitando el coste computacional de predecir la estructura completa.

El modelo tiene aproximadamente 1.041 millones de parametros (1B) y se distribuye en formato safetensors bajo la libreria transformers, con codigo personalizado (`trust_remote_code=True`). Trabaja a nivel de residuo, con un token por aminoacido y sin tokens BOS/EOS, lo que simplifica el pipeline de inferencia. Esta orientado a bioinformatica estructural y busqueda de similitud de pliegues a gran escala.

La version actual incorpora, ademas del backbone original, una cabeza opcional de prediccion de pLDDT por residuo (338K parametros) entrenada sobre el backbone congelado, que estima la confianza estructural de cada posicion. El modelo esta etiquetado como `feature-extraction` y acumula 80 descargas en Hugging Face, con licencia no especificada en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder con cabezas de clasificacion por residuo (modernprost_3di12st); codigo personalizado |
| Parametros totales | 1.040.968.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada a nivel de residuo, un token por aminoacido, sin BOS/EOS) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (secuencias de proteinas); idiomas naturales no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 4,2 GB |
| Pipeline | feature-extraction |
| Libreria | transformers (requiere `trust_remote_code=True`) |
| Dataset de entrenamiento | gbouras13/ModernProst-3di12st |
| Cabeza pLDDT | 338K parametros, opcional, sobre backbone congelado |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de transformer encoder que procesa secuencias de aminoacidos token a token (un token por residuo, sin tokens especiales de inicio o fin) y produce dos cabezas de clasificacion: una para el alfabeto 3Di de 20 estados (ACDEFGHIKLMNPQRSTVWY) y otra para el alfabeto estructural de 12 estados (ACDEFGHIKLMN). La salida se obtiene mediante `argmax` sobre los logits de cada cabeza, lo que permite generar directamente secuencias estructurales compatibles con Foldseek.

El entrenamiento se realizo sobre el dataset `gbouras13/ModernProst-3di12st`, si bien la model card no detalla el numero de tokens, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO (no disponibles). La innovacion principal reside en la prediccion directa de alfabetos estructurales sin necesidad de predecir coordenadas 3D, lo que reduce drasticamente el coste computacional frente a pipelines basados en AlphaFold o ColabFold.

La cabeza pLDDT, anadida en noviembre de 2026, es un predictor por residuo de 338K parametros que lee todas las capas del encoder congelado. Se entreno sobre 18.000 proteinas retenidas (5,16 millones de residuos) usando como etiquetas los pLDDT de AFDB, ColabFold y BFVD, con mejor paso en 8.000. Su carga es opcional y no altera las salidas del backbone.

## Capacidades

- Prediccion de secuencias 3Di de 20 estados a partir de secuencia de aminoacidos.
- Prediccion de secuencias de alfabeto estructural de 12 estados.
- Generacion de consultas y dianas para busquedas Foldseek sin predecir estructura 3D.
- Extraccion de caracteristicas por residuo (pipeline `feature-extraction`).
- Prediccion opcional de pLDDT por residuo (0-100) mediante cabeza auxiliar.
- Procesamiento por lotes con padding (`padding=True`, `return_tensors="pt"`).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No soporta vision, audio ni idiomas naturales.

## Casos de uso

- Busqueda de similitud de pliegues a gran escala: el modelo genera secuencias 3Di que se usan directamente como consultas en Foldseek, evitando ejecutar AlphaFold para cada proteina y reduciendo el coste de busqueda en bases de datos metagenomicas.
- Anotacion funcional de proteinas sin estructura experimental: a partir de la secuencia primaria se obtiene una representacion estructural que permite asignar familias y dominios mediante busquedas Foldseek contra PDB o AFDB.
- Clasificacion taxonomica de proteinas virales o metagenomicas: la representacion 3Di o 12st sirve como firma estructural para agrupar secuencias remotamente relacionadas donde la similitud de secuencia falla.
- Filtrado de calidad de modelos estructurales: la cabeza pLDDT permite estimar por residuo la confianza de la estructura predicha (AUROC 0,972 para pLDDT < 70) y descartar regiones desordenadas antes de analisis posteriores.
- Construccion de pipelines de descubrimiento de enzimas: se predicen secuencias 3Di de candidatos y se buscan contra bases de datos de pliegues conocidos para identificar actividades cataliticas potenciales.
- Preprocesamiento para agrupamiento de proteinas (clustering): la representacion estructural generada alimenta algoritmos de clustering de pliegues sin necesidad de estructuras 3D, escalando a millones de secuencias.
- Analisis de regiones desordenadas: combinando la prediccion 3Di con el pLDDT bajo se pueden identificar segmentos intrinsecamente desordenados en protecciones de novo.

## Benchmarks y rendimiento

La model card solo publica metricas de validacion de la cabeza pLDDT (18.000 proteinas retenidas, 5,16M residuos, etiquetas AFDB/ColabFold/BFVD, mejor paso 8.000):

| Metrica | Valor |
|---|---|
| RMSE | 8,48 |
| MAE | 5,39 |
| Pearson | 0,920 |
| Pearson por proteina | 0,924 |
| AUROC pLDDT < 70 | 0,972 |
| AUROC pLDDT < 50 | 0,979 |

No se han publicado resultados de benchmarks del backbone principal (precision de prediccion 3Di o 12st, comparativas con otros predictores) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,1 GB en fp16 (1B parametros) y alrededor de 4,2 GB en fp32; el repositorio ocupa 4,2 GB en safetensors.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para fp16, como RTX 3060, RTX 4060, RTX 4090, A100 o H100. Para lotes grandes de secuencias largas se recomienda A100 o H100.
- Cabe en GPU de consumo: si, en RTX 3060 (12 GB), RTX 4060 Ti, RTX 4070, RTX 4080 y RTX 4090.
- Opciones de despliegue: transformers con `trust_remote_code=True` (unica opcion documentada); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que no es un modelo generativo de texto.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ModernProst-base | 1,04B | no disponible | Prediccion 3Di/12st desde secuencia | no disponible | Hugging Face |
| ModernProst-pssm | no disponible | no disponible | Prediccion de perfiles PSSM | no disponible | Hugging Face (gbouras13/modernprost-pssm) |
| Foldseek (herramienta) | no aplica | no aplica | Busqueda estructural | no disponible | Herramienta externa |
| AlphaFold / ColabFold | no disponible | no disponible | Prediccion de estructura 3D | no disponible | Ampliamente disponible |

La comparativa con otros predictores de alfabetos estructurales (por ejemplo, modelos especializados en 3Di) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar el uso comercial sin consultar al autor.
- Modelo especializado en proteinas: no procesa texto, imagenes ni audio; los tags de idiomas no aplican.
- La prediccion 3Di/12st es una aproximacion estructural; errores en la secuencia predicha pueden degradar la sensibilidad de las busquedas Foldseek frente a estructuras experimentales.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo personalizado del repositorio; conviene auditar el codigo antes de usarlo en produccion.
- La cabeza pLDDT es opcional y se entreno con etiquetas de predictores (AFDB, ColabFold, BFVD), por lo que hereda sus sesgos y no sustituye a un pLDDT experimental.
- No se documentan sesgos, riesgos de alucinacion ni limitaciones de longitud de contexto; la longitud maxima de secuencia no esta especificada.
- El modelo tiene pocas descargas (80) y cero likes, lo que sugiere una validacion comunitaria limitada.
- No se han publicado benchmarks del backbone principal, lo que dificulta evaluar su precision frente a alternativas.

## Enlaces

- Hugging Face: https://huggingface.co/gbouras13/modernprost-base
- Modelo de perfiles PSSM: https://huggingface.co/gbouras13/modernprost-pssm
- Dataset de entrenamiento: https://huggingface.co/datasets/gbouras13/ModernProst-3di12st
- Foldseek: no disponible en la informacion proporcionada
- Paper o blog del autor: no disponible en la informacion proporcionada
- Repositorio de codigo: no disponible en la informacion proporcionada
