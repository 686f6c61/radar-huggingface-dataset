# oteam/esmfold2-experimental-fast-base600m-step1000k

## Resumen

ESMFold2 Experimental Fast Base600M Step1000k es un checkpoint de prediccion de estructura proteica de todos los atomos desarrollado por el equipo OFoldX (oteam), una implementacion no oficial del trabajo "Language Modeling Materializes a World Model of Protein Biology" de Biohub. El modelo combina un codificador de lenguaje de proteinas congelado (ESMC-6B) con un tronco de plegamiento recurrente de 24 bloques y una cabeza de difusion que genera coordenadas atomicas, ademas de cabezas de distograma y confianza para puntuar la prediccion.

Este checkpoint concreto pertenece a la familia de "criticos de escalado" (scaling critics) del flujo de diseno de binders: variantes `Fast-base{300M,600M,6B}-step{250,500,750,1000,1500}k` que se emplean para optimizar secuencias de binder mediante gradientes. La variante Base600M con 1000k pasos corresponde a un modelo de 746 millones de parametros totales (incluyendo el codificador ESMC congelado) y un tamano de repositorio de 3,0 GB.

Es relevante porque expone, en formato abierto y reproducible, un componente del pipeline de diseno de proteinas basado en gradientes, una tarea tradicionalmente reservada a suites propietarias. Su licencia AGPL-3.0 y su naturaleza experimental lo orientan a investigacion y prototipado mas que a produccion cerrada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de plegamiento recurrente de todos los atomos condicionado por ESMC, con cabeza de difusion para generacion de coordenadas |
| Parametros totales | 746.187.472 (incluye el codificador ESMC-6B congelado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de secuencias de proteinas, no de lenguaje natural) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |
| Libreria | ofoldx |
| Bloques de plegamiento | 24 |
| Evidencia MSA | No |
| Codificador ESMC | 6B (congelado, MultiMolecule ESMC-6B) |
| Single size / Pair size | 384 / 256 |
| Atom size / Token size | 128 / 768 |
| Actualizaciones recurrentes | 4 |
| Pasos de muestreo | 14 |
| Variante | Experimental Fast, Base600M, step1000k (critico de escalado) |

## Arquitectura y entrenamiento

El modelo sigue un diseno hibrido en tres etapas. Primero, un codificador de lenguaje de proteinas congelado (ESMC-6B) transforma la secuencia en representaciones. Despues, un tronco de plegamiento recurrente de 24 bloques refina representaciones de residuo (single, 384) y de pares (pair, 256) con 4 actualizaciones recurrentes, usando embeddings de atomo de 128 y de token de 768. Finalmente, una cabeza de difusion genera las coordenadas atomicas con 14 pasos de muestreo, mientras que las cabezas de distograma y confianza puntuan la prediccion. A diferencia de la variante completa, esta version Fast no acepta evidencia de MSA y opera solo con secuencia unica.

Segun la model card, Biohub entreno sobre datos del Protein Data Bank (PDB) y AlphaFold DB (AFDB) con un corte de septiembre de 2021. La model card no detalla el numero de tokens, la composicion exacta del dataset ni si se aplicaron etapas de RLHF o DPO; esa informacion no esta disponible. La innovacion principal de esta variante es su papel como critico de escalado dentro del flujo de diseno de binders: el modelo se emplea para optimizar secuencias de binder mediante gradientes y para clasificar candidatos a partir de predicciones de plegamiento.

## Capacidades

- Prediccion de estructura proteica de todos los atomos a partir de secuencia (y de estructura de entrada en el pipeline de plegamiento).
- Generacion de coordenadas atomicas mediante cabeza de difusion con 14 pasos de muestreo.
- Puntuacion de confianza de la prediccion mediante cabezas de distograma y confianza.
- Optimizacion de secuencias de binder mediante gradientes (diseno de proteinas).
- Clasificacion de candidatos de binder usando predicciones de plegamiento.
- Deteccion automatica de disenos de anticuerpos y puntuacion de CDR (requiere ANARCI y el ejecutable `hmmscan` de HMMER en el PATH).
- No soporta tool calling, function calling, agentes ni razonamiento multi-turno: es un modelo especializado en biologia estructural.
- No dispone de capacidades multilingues ni de lenguaje natural.

## Casos de uso

- Prediccion de estructura de proteinas de secuencia unica: el pipeline `fold` acepta una secuencia o un fichero CIF y devuelve estructura y confianza; la variante Fast es adecuada cuando no se dispone de MSA y se prioriza velocidad.
- Diseno de binders proteicos: el pipeline `design` optimiza secuencias de binder con gradientes y las clasifica con predicciones de plegamiento, usando este checkpoint como critico de escalado dentro del flujo experimental.
- Puntuacion y filtrado de candidatos en campanas de diseno: el modelo actua como critico Base600M para reordenar secuencias generadas por otros componentes del workflow.
- Deteccion y evaluacion de disenos de anticuerpos: con ANARCI y HMMER instalados, el pipeline identifica automaticamente anticuerpos y puntua sus regiones CDR.
- Investigacion en plegamiento con modelos de lenguaje de proteinas: permite reproducir y estudiar el efecto del escalado de criticos (300M, 600M, 6B) y de los pasos de entrenamiento (250k a 1500k) sobre la calidad del diseno.
- Prototipado de pipelines de biologia estructural en entornos de investigacion: la instalacion via `pip install ofoldx` y el uso de safetensors facilitan la integracion en flujos Python existentes.
- Analisis comparativo de variantes: al compartir el ESMC-6B congelado con las variantes completas, sirve para aislar el efecto del tronco de 24 bloques y de la ausencia de MSA frente a los modelos de 48 bloques.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. El repositorio ocupa 3,0 GB en safetensors, pero el codificador ESMC-6B congelado se descarga aparte desde el checkpoint `multimolecule/esmc-6b`, por lo que el consumo real de memoria es sustancialmente mayor que el tamano del repo.
- GPU recomendadas: no disponible. Por el tamano del codificador congelado y del tronco de plegamiento, se espera que requiera GPU de datacenter (A100, H100) o GPUs de consumo de gama alta con suficiente VRAM; no se han publicado cifras oficiales.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Opciones de despliegue: libreria `ofoldx` (pip), con pipelines `fold` y `design`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | MSA | Bloques | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ESMFold2 Experimental Fast Base600M step1000k (este) | 746 M (con ESMC-6B) | No | 24 | AGPL-3.0 | HuggingFace (oteam) |
| ESMFold2 Fast | 6.533,7 M | No | 24 | AGPL-3.0 | HuggingFace (oteam) |
| ESMFold2 | 6.579,7 M | Si | 48 | AGPL-3.0 | HuggingFace (oteam) |
| ESMFold2 Experimental | 6.577,3 M | Si | 48 | AGPL-3.0 | HuggingFace (oteam) |

Las cuatro variantes comparten el codificador ESMC-6B congelado y difieren en el numero de bloques de plegamiento, el uso de MSA y el proposito (plegamiento general frente a diseno de binders). No se dispone de datos de benchmarks que permitan comparar su precision relativa.

## Limitaciones y advertencias

- Modelo experimental: forma parte de un flujo de diseno de binders y no esta pensado como sustituto directo de un predictor de estructura de proposito general.
- Implementacion no oficial: la model card la escribe el equipo OFoldX, no el equipo de Biohub que publico el trabajo original.
- Sin MSA: la variante Fast no acepta evidencia de MSA, lo que puede reducir la precision en secuencias con pocos homologos.
- Dependencia del codificador ESMC-6B: el checkpoint congelado se descarga por separado y debe estar disponible en la cache de Hugging Face.
- Requisitos externos para anticuerpos: la deteccion de anticuerpos y la puntuacion de CDR requieren ANARCI y el ejecutable `hmmscan` de HMMER en el PATH.
- Licencia AGPL-3.0: impone obligaciones de copyleft sobre obras derivadas y sobre el uso en red; conviene revisar su compatibilidad antes de integrarlo en productos comerciales cerrados.
- Riesgo de alucinacion estructural: como todo modelo generativo de coordenadas, puede producir estructuras plausibles pero incorrectas; deben usarse las cabezas de confianza y validacion experimental.
- Sesgos de datos: el entrenamiento se basa en PDB y AFDB con corte de septiembre de 2021, lo que puede limitar la generalizacion a familias proteicas poco representadas o posteriores a esa fecha.
- Idiomas: no aplica; el modelo no procesa lenguaje natural.
- Sin datos publicados de benchmarks, latencia ni requisitos de VRAM: la evaluacion en produccion exige validacion propia.

## Enlaces

- [HuggingFace: oteam/esmfold2-experimental-fast-base600m-step1000k](https://huggingface.co/oteam/esmfold2-experimental-fast-base600m-step1000k)
- [Variante completa: oteam/esmfold2](https://huggingface.co/oteam/esmfold2)
- [Variante Fast: oteam/esmfold2-fast](https://huggingface.co/oteam/esmfold2-fast)
- [Workflow experimental: oteam/esmfold2-experimental](https://huggingface.co/oteam/esmfold2-experimental)
- [Variante experimental Fast: oteam/esmfold2-experimental-fast](https://huggingface.co/oteam/esmfold2-experimental-fast)
- [Codificador ESMC-6B: multimolecule/esmc-6b](https://huggingface.co/multimolecule/esmc-6b)
- [Codigo: ofoldx.models.esmfold2](https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/esmfold2)
- [Guia de pipelines de OFoldX](https://github.com/OTeam-AI4S/OFoldX/blob/main/ofoldx/pipelines/README.md)
- [Paper: Language Modeling Materializes a World Model of Protein Biology](https://biohub.ai/papers/esm_protein.pdf)
- [Repositorio oficial: Biohub/esm](https://github.com/Biohub/esm)
- [Sitio de la libreria ofoldx](https://ofoldx.valtech.ai/)
