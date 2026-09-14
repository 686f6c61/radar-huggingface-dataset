# kvenanzi/vandf-rxnorm-biencoder

## Resumen

El modelo `kvenanzi/vandf-rxnorm-biencoder` es un bi-encoder de frases especializado en normalización de medicamentos: recibe una cadena de texto procedente del VA National Drug File (VANDF) y devuelve el *clinical drug* de RxNorm que representa (nivel SCD o SBD, es decir, ingrediente, concentración y forma farmacéutica). Lo desarrolla el usuario kvenanzi (kettle-labs) y se publica bajo licencia Apache 2.0 con 109.482.240 parámetros, derivado de `cambridgeltl/SapBERT-from-PubMedBERT-fulltext`. Su relevancia actual es que la mayoría de herramientas publicadas, como RxMap, normalizan solo al nivel de ingrediente (IN/MIN), mientras que este modelo apunta al *clinical drug* completo, donde un fallo en la concentración o en la forma farmacéutica ya constituye una respuesta incorrecta.

La arquitectura es un transformer BERT de tipo bi-encoder que genera embeddings y resuelve la tarea por recuperación (retrieval) sobre un índice de 27.287 nombres SCD/SBD activos de RxNorm, en lugar de una clasificación cerrada. Sobre la puntuación coseno se aplica una capa de calibración logística (Platt) que produce una probabilidad de acierto, de modo que el sistema puede auto-aceptar los casos seguros y derivar el resto a revisión farmacéutica. El umbral de aceptación por defecto es 0,92.

En el conjunto de test —1.848 cadenas del VANDF cuyos ingredientes nunca aparecen en entrenamiento— declara un acc@1 de 0,931 y un recall@5 de 0,984. El modelo se distribuye junto con `train_config.json`, `calibration.json` y `candidates.parquet`, y se consume mediante el paquete `rxnorm-vandf`. Es un modelo pequeño (0,4 GB de repositorio), monolingüe en inglés y pensado exclusivamente para terminología de medicamentos estadounidense (VANDF y RxNorm).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Bi-encoder transformer tipo BERT (SapBERT sobre PubMedBERT), con recuperación por similitud coseno y capa de calibración logística |
| Parametros totales | 109.482.240 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no especificada en la model card; el entrenamiento fijó `max_seq_length = 9`. La arquitectura base PubMedBERT admite hasta 512 tokens |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors y no documenta variantes GGUF, ONNX o cuantizadas |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería sentence-transformers) |
| Pipeline | sentence-similarity |
| Tamaño del repositorio | 0,4 GB (aproximadamente 450 MB de descarga) |
| Modelo base | cambridgeltl/SapBERT-from-PubMedBERT-fulltext |
| Dataset de entrenamiento | kvenanzi/vandf-rxnorm-pairs |
| Índice de candidatos | 27.287 nombres SCD/SBD activos de RxNorm 2026-09-08 (`candidates.parquet`) |
| Umbral de auto-aceptación por defecto | 0,92 (elegido en validación para 99 % de precisión) |

## Arquitectura y entrenamiento

El modelo es un bi-encoder: codifica por separado la consulta (cadena VANDF preprocesada) y cada candidato (nombre RxNorm) y ordena por similitud coseno. Parte de SapBERT, un PubMedBERT afinado para alineamiento de entidades biomédicas, y se afina con `MultipleNegativesRankingLoss` sobre tripletas (ancla, positivo, negativo duro) con un muestreador de lotes `NO_DUPLICATES`. Los negativos duros se extraen únicamente de candidatos del split de entrenamiento y corresponden a ingredientes iguales con concentración o forma farmacéutica distinta, que es precisamente el tipo de confusión que el modelo debe aprender a resolver. Se entrenó durante 4 épocas, con batch 64, learning rate 2e-5, 10 % de warmup, precisión fp16 y `max_seq_length` de 9, sobre 9.287 pares (cadena VA, nombre RxNorm).

La innovación principal no está en la arquitectura sino en el pipeline que la rodea. Primero, un preprocesamiento determinista por reglas normaliza la concentración al estilo RxNorm (`0.125MG/5ML` → `0.025 mg/ml`, `0.25 %` → `2.5 mg/ml`, `mg/mg` para geles y pomadas), porque un modelo de embeddings no puede hacer esa aritmética. Segundo, la calibración convierte la puntuación en una probabilidad: una capa logística (Platt) sobre tres señales —coseno, margen entre el top-1 y el top-2, y softmax con temperatura escalada— se ajusta solo con el conjunto de validación. Un barrido de 18 configuraciones (3 encoders × 3 estrategias de negativos × normalizador activado/desactivado) mostró efectos aproximadamente aditivos: el preentrenamiento de dominio (SapBERT frente a encoders generales) aporta +8,6 puntos de acc@1 en validación, el normalizador de concentración +4,8 y los negativos duros emparejados por ingrediente +3.

## Capacidades

- Generación de embeddings de frases para similitud semántica y recuperación de entidades (entity linking), no generación de texto.
- Normalización de cadenas de medicamentos del VANDF al *clinical drug* de RxNorm (niveles SCD y SBD), incluyendo ingrediente, concentración y forma farmacéutica.
- Búsqueda top-k sobre un índice de 27.287 nombres RxNorm, devolviendo hasta cuatro alternativas adicionales con su coseno.
- Puntuación de confianza calibrada (probabilidad de acierto) y decisión de auto-aceptación o revisión mediante umbral configurable.
- Normalización aritmética de concentraciones en el preprocesamiento (`MG/5ML`, porcentajes, `mg/mg` para formulaciones tópicas).
- Detección implícita de cadenas sin correspondencia SCD/SBD reales (por ejemplo, productos sanitarios como `CATHETER,FOLEY SILICONE 22FR 5CC`), que reciben confianza muy baja.
- Capacidades multilingües: no disponibles; el modelo está entrenado y evaluado solo con cadenas en inglés.
- Tool calling, function calling, agentes, razonamiento multi-paso, visión y audio: no disponibles; no son capacidades de este modelo.
- Modo de pensamiento (thinking mode): no disponible.

## Casos de uso

- Reconciliación de medicación en historia clínica electrónica: al importar listas de fármacos en formato VANDF desde sistemas del VA, el modelo traduce cada cadena a un RXCUI concreto y marca con confianza baja los casos ambiguos para revisión manual, evitando duplicidades por concentración o forma farmacéutica distintas.
- Migración y mapeo de terminologías entre el catálogo VANDF y RxNorm: el modelo permite convertir de forma masiva listas de productos a SCD/SBD, que es el nivel necesario para cálculos de dosis, en lugar de quedarse en el nivel de ingrediente que ofrecen herramientas como RxMap.
- Soporte a la decisión clínica y verificación de dosis: al disponer de la concentración normalizada (`0.125 mg/ml`) y de la forma farmacéutica en el resultado, se puede comprobar automáticamente si una prescripción coincide con el producto dispensado antes de calcular la dosis.
- Farmacovigilancia y análisis de eventos adversos: los informes suelen citar medicamentos con nombres libres o heredados de sistemas antiguos; el modelo normaliza esas cadenas a SCD/SBD para agregar casos por producto real y no por ingrediente genérico.
- Analítica de formulario y gasto farmacéutico: agregar consumos por RXCUI de *clinical drug* permite distinguir presentaciones (por ejemplo, comprimidos de 12,5 mg frente a otras concentraciones) en informes de utilización y coste.
- Enriquecimiento de pipelines de datos clínicos y ETL: el paquete `rxnorm-vandf` expone `Mapper.map()` con salida estructurada (rxcui, nombre, tty, confianza, alternativas), lo que facilita integrarlo como paso de normalización dentro de procesos batch sobre grandes volúmenes de prescripciones.
- Enrutado con abstención en producción farmacéutica: con el umbral por defecto de 0,92 el sistema auto-acepta el 46 % de una población que incluye fármacos reales sin SCD/SBD y el 79 % de las cadenas que sí tienen equivalente, con una precisión declarada del 98,2–98,8 % en lo aceptado; el resto se deriva a un farmacéutico.
- Deduplicación de catálogos de medicamentos: al proyectar todas las entradas de un catálogo al mismo espacio de embeddings, se pueden detectar entradas que colapsan al mismo RXCUI y unificar registros redundantes.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` de la model card (no verificados):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| VANDF string → RxNorm clinical drug (SCD/SBD) | kvenanzi/vandf-rxnorm-pairs, test split (ingredientes no vistos en entrenamiento) | acc@1 | 0,931 |
| VANDF string → RxNorm clinical drug (SCD/SBD) | kvenanzi/vandf-rxnorm-pairs, test split | recall@5 | 0,984 |

Comparativa de métodos publicada en la model card (mismo test: 1.848 cadenas VA, pool de 27.287 SCD/SBD de RxNorm 2026-09-08):

| Método | acc@1 | recall@5 | ingrediente | concentración | forma farmacéutica |
|---|---|---|---|---|---|
| Coincidencia exacta de cadenas | 0,000 | 0,000 | – | – | – |
| TF-IDF con 3–5-gramas de caracteres | 0,509 | 0,820 | 0,978 | 0,617 | 0,698 |
| MiniLM-L6 afinado | 0,836 | 0,967 | 0,983 | 0,884 | 0,935 |
| MiniLM-L6 + normalizador de concentración | 0,886 | 0,975 | 0,982 | 0,941 | 0,943 |
| SapBERT + normalizador (este modelo) | 0,931 | 0,984 | 0,983 | 0,961 | 0,972 |

Validación (partición más difícil de ingredientes): acc@1 0,883 y recall@5 0,961.

Abstención con umbrales elegidos en validación y medidos en test:

| Población | Señal | Auto-aceptado | Precisión de lo aceptado |
|---|---|---|---|
| Cadenas VA que tienen SCD/SBD | softmax | 79,0 % | 0,988 |
| Cadenas VA + fármacos reales sin SCD/SBD (packs, solo ingrediente) | Platt (por defecto) | 46,0 % | 0,982 |

Desglose de los 128 errores del test: 46 relacionados con concentración (a menudo cadenas infradeterminadas como `MANNITOL 250MG/ML INJ` frente a `50 ML mannitol 250 MG/ML Injection`), 43 con forma farmacéutica, 31 con ingrediente y 25 con pares SCD/SBD gemelos de componentes idénticos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,44 GB en fp32 (109,5 M de parámetros × 4 bytes) y unos 0,22 GB en fp16; hay que sumar el espacio del índice de 27.287 embeddings (del orden de decenas de MB en fp32) y el coste de codificar los candidatos.
- GPU recomendadas: cualquier GPU con 2 GB o más de VRAM es suficiente; modelos como RTX 4090, A100 o H100 quedan enormemente sobredimensionados para un encoder BERT de 109 M de parámetros y solo tiene sentido usarlos si se comparten con otras cargas.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna (RTX 3060, 4060, 4090, etc.) e incluso en iGPU con memoria compartida; también es viable en CPU, dado el tamaño del modelo.
- Opciones de despliegue: `sentence-transformers` de forma nativa; Text Embeddings Inference (etiqueta `text-embeddings-inference` y `endpoints_compatible` en el repositorio, por lo que es compatible con Inference Endpoints); el paquete propio `rxnorm-vandf` (`pip install "rxnorm-vandf @ git+https://github.com/kvenanzi/rxnorm"`) que carga encoder, `train_config.json`, `calibration.json` y `candidates.parquet`. vLLM, llama.cpp, Ollama y TGI no están documentados para este modelo en la información disponible; llama.cpp y Ollama requerirían convertir los pesos a GGUF, algo que el repositorio no publica.
- Latencia y throughput estimados: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Nivel de normalización | Contexto / índice | acc@1 en el test VANDF-RxNorm | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| kvenanzi/vandf-rxnorm-biencoder | 109,5 M | Clinical drug (SCD/SBD): ingrediente + concentración + forma | Índice de 27.287 SCD/SBD de RxNorm 2026-09-08 | 0,931 | Apache 2.0 | HuggingFace, safetensors |
| MiniLM-L6 afinado (+ normalizador) | ~22 M | Clinical drug (SCD/SBD) | Mismo índice y test | 0,886 | no disponible en la información | Referencia del barrido del autor, no publicado como modelo independiente |
| TF-IDF con 3–5-gramas de caracteres | no aplica (baseline léxico) | Clinical drug (SCD/SBD) | Mismo índice y test | 0,509 | no aplica | Baseline reproducido por el autor |
| cambridgeltl/SapBERT-from-PubMedBERT-fulltext | 110 M | Alineamiento de entidades biomédicas genérico, sin normalización de concentración | Modelo base, sin índice RxNorm asociado | no evaluado en este test | Apache 2.0 | HuggingFace |
| RxMap y herramientas publicadas similares | no disponible | Nivel ingrediente (IN/MIN), no *clinical drug* | no disponible | no comparable directamente (otro nivel de granularidad) | no disponible | Publicadas por terceros |

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente con cadenas del VA. Los nombres de medicamentos de otros sistemas sanitarios constituyen una distribución distinta y su precisión no está medida.
- El índice de candidatos corresponde a RxNorm 2026-09-08. RxNorm se actualiza mensualmente, por lo que hay que reconstruir `candidates.parquet` con una versión más reciente (script `scripts/03_build_dataset.py` del repositorio) para evitar candidatos obsoletos o ausentes.
- No apto para uso clínico no supervisado: una tasa de error del 7 % en el top-1 sobre códigos de medicación es un problema de seguridad. Hay que usar la confianza para enrutar los casos dudosos a un farmacéutico o emplear el top-5 como sugerencias.
- La precisión de lo auto-aceptado se fijó en validación con objetivo del 99 %, pero en test queda en 98,2–98,8 %; conviene tratar ese valor como la estimación real y no como el objetivo de diseño.
- Los errores se concentran en concentración (46 de 128), forma farmacéutica (43), ingrediente (31) y pares SCD/SBD gemelos con componentes idénticos (25). Las cadenas infradeterminadas (por ejemplo, sin volumen total) son una fuente recurrente de fallo.
- El preprocesamiento aritmético de concentraciones es determinista y basado en reglas; si el formato de entrada se aleja de los patrones del VANDF, la normalización puede fallar antes de llegar al encoder.
- Modelo monolingüe en inglés y orientado al sistema estadounidense (VANDF y RxNorm); no cubre otros sistemas de codificación de medicamentos ni terminologías europeas.
- Riesgo de alucinación en el sentido de falsos positivos: el modelo siempre devuelve un candidato más cercano, aunque la entrada no sea un medicamento (por ejemplo, un catéter), por lo que la abstención basada en la confianza calibrada es imprescindible.
- Sesgos conocidos: no se documentan análisis de sesgo demográfico o de subrepresentación de determinados ingredientes en el conjunto de pares.
- Licencia Apache 2.0, que permite uso comercial, pero el modelo base SapBERT/PubMedBERT también es Apache 2.0 y conviene respetar las condiciones de las fuentes de RxNorm al redistribuir el índice.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kvenanzi/vandf-rxnorm-biencoder
- Modelo base: https://huggingface.co/cambridgeltl/SapBERT-from-PubMedBERT-fulltext
- Dataset de pares VANDF-RxNorm: https://huggingface.co/datasets/kvenanzi/vandf-rxnorm-pairs
- Repositorio de código y paquete `rxnorm-vandf`: https://github.com/kvenanzi/rxnorm
- Artículo técnico con método, hipótesis, barrido y análisis de errores: https://github.com/kvenanzi/rxnorm/blob/main/docs/post/README.md
- Gráficas del barrido de 18 configuraciones: https://wandb.ai/kettle-labs/rxnorm-vandf
- Paper referenciado en las etiquetas (arXiv 1706.04599, Sentence-BERT): https://arxiv.org/abs/1706.04599
- Paper referenciado en las etiquetas (arXiv 1705.00652): https://arxiv.org/abs/1705.00652
- Búsqueda web: no se han encontrado resultados relevantes sobre este modelo; las consultas devolvieron únicamente hilos de soporte de Microsoft sin relación con el modelo.
