# alokanand002/dhem-entity-matching

## Resumen

DHEM Entity Matching es un conjunto de dos clasificadores de pares (pair scorers) implementados en PyTorch por el usuario alokanand002 y publicados en HuggingFace. No es un modelo de lenguaje: recibe diez características numéricas que describen la relación entre un nombre de organización consultado (habitualmente ruidoso) y un candidato de un catálogo maestro, y devuelve un único logit binario de coincidencia. El problema que resuelve es la resolución de entidades (entity matching / entity resolution) contra un catálogo de nombres canónicos que aporta el propio usuario.

El modelo es extremadamente pequeño: 9.985 parámetros, con una arquitectura de perceptrón multicapa (10 → 128 → 64 → 1) que incluye LayerNorm y dropout. Se publican dos checkpoints con propósitos distintos: `best.pt`, entrenado sobre un catálogo curado con variantes sintéticas y alias aprobados (F1 de validación 0,9907), y `real_best.pt`, entrenado con registros empresariales y alias o denominaciones anteriores respaldados por fuentes de SEC y/o OpenAlex (F1 de validación 0,9297).

Su relevancia es práctica: la desambiguación de nombres de organizaciones sigue siendo un cuello de botella costoso en pipelines de datos. Este modelo ofrece una alternativa entrenable, de huella mínima (unos 40 KB en float32) y ejecutable en CPU, que combina señales léxicas deterministas (Jaccard de tokens, similitud de edición, coincidencia de acrónimos) con un clasificador aprendido, y que separa explícitamente los casos dudosos para revisión humana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptrón multicapa (MLP): Linear(10→128), ReLU, LayerNorm(128), Dropout(0,15), Linear(128→64), ReLU, Dropout(0,15), Linear(64→1) |
| Parametros totales | 9.985 (idéntico en ambos checkpoints) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: el modelo no procesa secuencias de tokens; consume 10 características numéricas por par consulta-candidato |
| Tipos de cuantizacion | no disponible (no se documentan versiones cuantizadas ni formatos de baja precisión) |
| Idiomas soportados | no disponible (la model card no especifica idiomas; el comportamiento depende del catálogo y del preprocesado aportados) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`.pt`): `best.pt` y `real_best.pt` |
| Entrada | 10 características numéricas de par, en orden fijo |
| Salida | Un logit binario de coincidencia por par consulta-candidato (se elimina la dimensión final) |
| Configuracion de entrenamiento | Dimensión oculta 128, dropout 0,15, learning rate 0,001, weight decay 0,0001, batch size 256, 20 épocas |
| Integridad de checkpoints | `best.pt` SHA-256 `8d0afd0874ced1f1cf6ad61fbf7dc316aa35ec8ea15854ead96559f0a499d2e8`; `real_best.pt` SHA-256 `d727e8e7b212684b34e06e3280d2c0735a23ed40a3a2804dbe9956be1fb7dc51` |
| Libreria | pytorch |
| Tamano del repositorio | 0,0 GB (según los metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un clasificador totalmente conectado de tres capas densas sobre un vector de entrada de 10 dimensiones, con normalización por capas tras la primera proyección y dropout del 15 % en dos puntos. Las diez características de par, en orden fijo, son: igualdad normalizada, igualdad de alias aprobado, Jaccard de tokens, contención de tokens, Jaccard de n-gramas de caracteres, similitud de edición, similitud de prefijo, coincidencia de acrónimo, ratio de longitud y puntuación de reglas. Los nombres completos de las características se encuentran en `model_details.json`. El modelo no aprende representaciones de texto: toda la semántica léxica se concentra en el extractor de características, y la red solo aprende a ponderarlas y combinarlas.

Los dos checkpoints se entrenan con datos distintos. `best.pt` usa entidades maestras curadas junto con variantes sintéticas de nombre y alias aprobados, y se valida sobre grupos de consulta normalizados apartados, con la particularidad de que cada entidad maestra aparece en ambos splits. `real_best.pt` usa registros de empresas y alias o denominaciones anteriores respaldados por fuentes de SEC y/o OpenAlex, con un split entity-aware en el que las entidades de validación quedan fuera del entrenamiento; este segundo régimen de evaluación es más exigente y explica en buena medida la diferencia de F1 entre ambos checkpoints. No se documenta uso de RLHF, DPO ni ningún otro ajuste por preferencias, lo cual es coherente con la naturaleza discriminativa del modelo.

## Capacidades

- Puntuación binaria de pares: dada una consulta y un candidato, devuelve un logit de coincidencia que puede umbralizarse para decidir `MATCH` o `NO_MATCH`.
- Resolución de entidades contra un catálogo maestro: el nombre canónico resuelto es el del catálogo, no una cadena generada por el modelo.
- Manejo de alias aprobados y denominaciones alternativas: los ejemplos de la model card muestran `JNJ` → `Johnson & Johnson`, `3MLTD` → `3M` y `NVIDIA CORP/CA` → `NVIDIA CORP` con puntuaciones de 1,0000.
- Tolerancia a ruido en nombres de organizaciones: variaciones de formato, sufijos legales, abreviaturas y cambios de denominación.
- Señales de acrónimo y prefijo: cubre casos en los que la coincidencia léxica directa falla pero existe una abreviatura reconocible.
- Inferencia jerárquica para decisiones de negocio: la model card menciona `src/scripts/hierarchical_inference.py` para decisiones empresariales jerárquicas.
- Capacidades que NO tiene, por su naturaleza: generación de texto, razonamiento multi-paso, código, matemáticas, visión, audio, tool calling, function calling, uso como agente y modo de pensamiento. Tampoco se documenta soporte multilingüe explícito.

## Casos de uso

- Deduplicación de proveedores en un sistema ERP: se puntúa cada par (razón social entrante, registro existente) contra el catálogo maestro de proveedores; los pares con logit alto se fusionan automáticamente y los ambiguos se enrutan a revisión.
- Enriquecimiento de CRM tras una fusión o adquisición: `real_best.pt` incorpora alias y denominaciones anteriores de SEC/OpenAlex, lo que permite mapear registros históricos de una entidad absorbida a su nombre canónico actual.
- Cumplimiento normativo y KYC/AML: comparar el nombre declarado por un cliente con listas de sanciones o con el registro mercantil, usando el catálogo maestro como referencia y dejando los casos dudosos en cola de revisión manual.
- Limpieza de datos maestros (MDM): normalizar y consolidar un `master_entities.csv` propio antes de cargarlo en el sistema corporativo, aprovechando que `best.pt` está pensado para catálogos curados.
- Integración de fuentes de datos de investigación: desambiguar afiliaciones institucionales procedentes de OpenAlex frente a un catálogo de organizaciones, con `real_best.pt` como checkpoint de referencia en ese dominio.
- Análisis financiero sobre registros regulatorios: homogeneizar las razones sociales que aparecen con formatos dispares en formularios SEC (`NVIDIA CORP/CA` frente a `NVIDIA CORP`) antes de agregar series temporales por empresa.
- Deduplicación en pipelines ETL/ELT: ejecutar el scorer como paso de bloqueo y puntuación (blocking + scoring) dentro de un job batch, dejando la decisión final de fusión a las reglas de negocio o a una cola de revisión.

## Benchmarks y rendimiento

No se publican resultados de benchmarks de modelos de lenguaje (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que el modelo no es un modelo de lenguaje. Los únicos resultados reportados son métricas de validación internas de cada checkpoint:

| Checkpoint | Metrica | Valor | Regimen de validacion |
|---|---|---|---|
| `best.pt` | F1 | 0,9907235621521336 | Grupos de consulta normalizados apartados; cada entidad maestra aparece en ambos splits |
| `real_best.pt` | F1 | 0,9296791815193741 | Split entity-aware; las entidades de validación quedan fuera del entrenamiento |

Ejemplos de puntuación publicados en la model card:

| Caso | Consulta | Candidato | Puntuacion | Resultado esperado |
|---|---|---|---:|---|
| Positivo, alias aprobado | `JNJ` | `Johnson & Johnson` | 1,0000 | `MATCH` |
| Positivo, alias aprobado | `3MLTD` | `3M` | 1,0000 | `MATCH` |
| Negativo, entidad distinta | `JNJ` | `3M` | 0,0020 | `NO_MATCH` |
| Negativo, entidad distinta | `3MLTD` | `Microsoft Corporation` | 0,0557 | `NO_MATCH` |
| Positivo, alias aprobado | `NVIDIA CORP/CA` | `NVIDIA CORP` | 1,0000 | `MATCH` |
| Negativo, entidad distinta | `NVIDIA CORP/CA` | `Apple Inc.` | 0,0339 | `NO_MATCH` |

## Requisitos de hardware

- VRAM estimada para inferencia: prácticamente nula. Con 9.985 parámetros, los pesos ocupan del orden de 40 KB en float32; el modelo cabe holgadamente en memoria de CPU.
- GPU recomendadas: no se requiere GPU. Cualquier GPU (A100, H100, RTX 4090, GTX 1650) sirve, pero es sobredimensionada para este tamaño.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo e incluso en dispositivos de borde; también funciona únicamente en CPU.
- Coste real del sistema: el cuello de botella no es la red, sino el cálculo de las 10 características de par (similitud de edición, Jaccard de n-gramas, etc.) y el bloqueo (blocking) sobre el catálogo completo, ya que la puntuación es cuadrática si se compara cada consulta con cada candidato.
- Opciones de despliegue: PyTorch nativo (CPU o GPU), TorchScript, exportación a ONNX, o integración como función de puntuación dentro de un servicio FastAPI o de un job batch. No se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Dado el tamaño, el coste por par es despreciable frente al coste de extracción de características; el throughput agregado dependerá del catálogo y de la estrategia de bloqueo.

## Comparativa con modelos similares

La model card no incluye comparativas con alternativas. A continuación se contrasta el enfoque con las familias de soluciones habituales para resolución de entidades; los datos no presentes en la información proporcionada se marcan como no disponibles.

| Enfoque | Tipo | Parametros | Licencia | Rendimiento reportado |
|---|---|---|---|---|
| DHEM `best.pt` | MLP sobre 10 características de par | 9.985 | no disponible | F1 0,9907 (catálogo curado, validación interna) |
| DHEM `real_best.pt` | MLP sobre 10 características de par | 9.985 | no disponible | F1 0,9297 (catálogo SEC/OpenAlex, split entity-aware) |
| Comparadores léxicos con umbral (Levenshtein, Jaro-Winkler) | Reglas deterministas | no aplica | no disponible | no disponible |
| Modelos probabilísticos tipo Fellegi-Sunter | Estadístico, con bloqueo | no aplica | no disponible | no disponible |
| Modelos neuronales de ER basados en transformers | Codificador de texto extremo a extremo | no disponible | no disponible | no disponible |

La diferencia clave frente a un modelo neuronal de ER basado en transformers es que DHEM no aprende representaciones del texto: depende de un extractor de características determinista y, por tanto, es mucho más ligero y explicable, pero también más sensible a la calidad de dicho extractor y a la cobertura de alias del catálogo. No se dispone de datos de rendimiento de los enfoques alternativos en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Las puntuaciones son probabilidades del modelo, no garantías de identidad legal. La propia model card insiste en este punto.
- Los F1 de validación son específicos de cada conjunto y split, y no son estimaciones directamente comparables del rendimiento sobre cualquier catálogo de producción.
- El catálogo de datos reales puede contener organizaciones relacionadas pero legalmente distintas, lo que introduce falsos positivos con relevancia jurídica.
- Los dos checkpoints no son intercambiables: `best.pt` debe usarse con `data/master_entities.csv` y `real_best.pt` con `data/pairs/real_master.csv`. Un alias presente en un catálogo puede faltar en el otro.
- La licencia no está declarada, por lo que el uso comercial queda en un limbo legal hasta que el autor lo aclare.
- El repositorio figura con 0,0 GB y sin descargas ni likes, lo que hace aconsejable verificar que los checkpoints están efectivamente publicados y son accesibles antes de planificar una integración.
- El modelo requiere un catálogo maestro propio: no resuelve entidades de forma autónoma ni genera el nombre canónico.
- No se documentan idiomas soportados ni comportamiento ante transliteraciones, alfabetos no latinos o nombres con caracteres diacríticos, más allá de lo que permita el preprocesado del usuario.
- Riesgo de desajuste de dominio (domain shift): un catálogo de producción con convenciones de nomenclatura distintas de las de entrenamiento puede degradar el F1 muy por debajo de los valores reportados.
- Al ser un clasificador de pares, cualquier decisión automática de fusión debería ir acompañada de reglas de negocio, identificadores de entidad autoritativos y una cola de revisión para casos inciertos o de entidades relacionadas, tal como recomienda el autor.
- No se documentan sesgos específicos, pero al depender de fuentes como SEC y OpenAlex el modelo puede heredar el sesgo de cobertura de dichas fuentes hacia determinadas jurisdicciones y tipos de organización.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alokanand002/dhem-entity-matching
- Repositorio del proyecto (código fuente, scripts de generación de datasets y utilidades de evaluación): https://huggingface.co/alokanand002/dhem-entity-matching
- Paper: no disponible
- Blog o artículo técnico: no disponible
- Demo: no disponible
- Ficheros de datos citados en la model card (no verificables desde la información proporcionada): `data/master_entities.csv`, `data/pairs/train.csv`, `data/pairs/val.csv`, `data/pairs/real_master.csv`, `data/pairs/real_train.csv`, `data/pairs/real_val.csv`, `model_details.json`
- Scripts de inferencia citados: `src/scripts/inference.py`, `src/scripts/hierarchical_inference.py`
