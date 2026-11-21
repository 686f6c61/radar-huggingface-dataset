# MudraForge/law2code-parser-stages-15.9m

## Resumen

`law2code-parser-stages-15.9m` es una pila de cuatro modelos neuronales supervisados (15.933.743 parámetros en total) desarrollada por MudraForge para el proyecto **law2code**, cuyo objetivo es convertir texto estatutario en representaciones ejecutables tipo Catala y AST. No es un modelo generativo de propósito general, sino un conjunto de parsers especializados que segmentan y estructuran disposiciones legales: extraen constantes, operadores, operandos, condiciones y ámbitos de cláusula.

La pila se organiza en cuatro etapas con responsabilidades disjuntas: Stage 1 (4,62 M parámetros) extrae entidades y operadores atómicos con 37 etiquetas BILOU; Stage 1.5 (6,26 M) se especializa en operandos algebraicos y condiciones con cuatro ramas raíz de Catala, además de una compuerta de entropía para derivar casos fuera de distribución a revisión humana; Stage 2 (4,58 M) factoriza estatutos en ámbitos de cláusula ejecutables; y Stage 2B (0,47 M) refina los límites de cláusula con una ventana de ±6 tokens. Cada etapa se distribuye en PyTorch y ONNX.

Su relevancia radica en el enfoque: en lugar de un LLM grande, propone una arquitectura modular pequeña, determinista y auditable, con aprendizaje continuo mediante bancos de prototipos (`teach-leaf`) que no requieren reentrenar pesos. Esto encaja con dominios regulados donde la trazabilidad y la verificabilidad son requisitos, aunque el alcance es estrecho: solo dominio legal y, por los datos citados, orientado al código fiscal estadounidense y a Catala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pila de 4 etapas neuronales secuenciales (encoders con cabeceras de etiquetado BILOU, representaciones de cláusula y punteros de límite); post-procesado determinista en Stage 3 |
| Parametros totales | 15.933.743 (Stage 1: 4,62 M; Stage 1.5: 6,26 M; Stage 2: 4,58 M; Stage 2B: 0,47 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (se distribuyen pesos PyTorch y grafos ONNX en FP32) |
| Idiomas soportados | No disponible (los datos de entrenamiento citados son disposiciones estatutarias de EE. UU. y Catala) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`.pt`) y ONNX (`.onnx`) |

## Arquitectura y entrenamiento

La pila es una cascada de cuatro redes neuronales pequeñas con interfaces explícitas entre etapas. Stage 1 recibe IDs de palabra, carácter y subword, más 36 dimensiones de geometría discursiva e índices de cláusula, y produce estados ocultos de 256 dimensiones y log-probabilidades sobre 37 etiquetas BILOU. Stage 1.5 consume características de token junto con 10 canales de condicionamiento grueso de Stage 1 y emite 17 etiquetas sobre cuatro ramas Catala (`NUMERIC_METRIC`, `CATEGORY_FILTER`, `DOC_POINTER`, `COMPLIANCE_ATTESTATION`). Stage 2 toma las 41 etiquetas combinadas de Stage 1 y 1.5 y genera representaciones de cláusula y logits de anclaje de inicio y fin. Stage 2B es un refinador de punteros que ajusta los límites en una ventana de ±6 tokens. Stage 3 (crítico Reflexion y emisor Catala/AST) es determinista y no neuronal.

El entrenamiento es supervisado sobre un corpus anotado de 250 disposiciones estatutarias (`ground_truth_250.json`, 2,33 MB), evaluado con validación cruzada de 5 pliegues y entrenamiento sobre corpus completo. La evaluación fuera de distribución usa 7 disposiciones del Internal Revenue Code de EE. UU. no vistas (`sara_gold_eval_20.json`, 951 spans atómicos y 137 spans de operando). La model card menciona un encoder MLM preentrenado con corpus no etiquetados, separado de estos parsers supervisados, pero no detalla su tamaño ni su composición. La innovación destacable es el aprendizaje continuo sin reentrenamiento: las instantáneas de memoria (`M1`, `M1.5`, `M2` y bancos de prototipos `teach-leaf`) se versionan por año-mes (`YYYY-MM`) para absorber actualizaciones normativas mensuales, mientras los pesos base se versionan por recuento de parámetros.

## Capacidades

- Extracción de entidades y operadores legales atómicos en 9 clases (`MONEY`, `RATE`, `DATE`, `DURATION`, `COUNT`, `ACTOR_SCOPE`, `DEFINED_TERM`, `OP`, `XREF`) con 37 etiquetas BILOU.
- Extracción de operandos algebraicos y condiciones en cuatro ramas raíz de Catala, con enrutamiento por entropía (`H >= 0.50`) de frases fuera de distribución a revisión humana o de CA.
- Factorización de estatutos en ámbitos de cláusula ejecutables (`COND`, `EXCEPTION`, `RULE_EFFECT`, `INLINE_DEF`).
- Refinamiento de límites de cláusula a nivel de token con ventana de ±6 tokens.
- Emisión determinista de Catala y AST a partir de las salidas neuronales (Stage 3), con la restricción fija `isAuthorizedToDisburse: false`.
- Actualización de memoria de prototipos (`teach-leaf`) sin reentrenar pesos.
- Exportación a ONNX con divergencia máxima verificada frente a PyTorch del orden de 1e-5 a 3e-5.
- No soporta generación de texto libre, tool calling, razonamiento multi-paso general, visión ni audio.

## Casos de uso

- **Extracción de constantes y operadores en pipelines de cumplimiento fiscal:** Stage 1 identifica importes, tipos, fechas y referencias cruzadas en disposiciones del código tributario, alimentando un motor de reglas que evalúa obligaciones sin intervención manual.
- **Conversión de estatutos a Catala para verificación formal:** la combinación de Stage 1.5 (operandos y condiciones) y Stage 2 (ámbitos de cláusula) permite generar cláusulas Catala ejecutables que pueden probarse con el compilador oficial, útil en equipos de legal engineering.
- **Detección de casos ambiguos con derivación a revisión humana:** la compuerta de entropía de Stage 1.5 marca frases con `H >= 0.50` para que un jurista las revise, lo que reduce el riesgo de automatizar interpretaciones erróneas en producción.
- **Mantenimiento normativo mensual sin reentrenamiento:** las instantáneas de memoria versionadas por `YYYY-MM` permiten incorporar cambios de leyes fiscales o Finance Acts actualizando bancos de prototipos, sin reentrenar los 15,9 M de parámetros.
- **Auditoría y trazabilidad de decisiones regulatorias:** al ser una pila determinista en Stage 3 y con salidas intermedias inspeccionables (spans, etiquetas, límites de cláusula), encaja en entornos donde se exige explicar por qué un sistema clasificó una disposición de una manera concreta.
- **Despliegue en entornos con recursos limitados:** con 15,9 M de parámetros y artefactos ONNX de entre 1,89 MB y 22,91 MB, la pila puede ejecutarse en CPU en servicios internos de gestión documental legal sin GPU dedicada.
- **Preprocesado para sistemas RAG jurídicos:** la segmentación en cláusulas y spans estructurados mejora la calidad de indexación y recuperación en asistentes legales que necesitan citar disposiciones concretas.

## Benchmarks y rendimiento

Resultados internos publicados por el autor (no comparables con benchmarks estándar como MMLU o HumanEval, ya que la tarea es etiquetado de spans legales):

| Etapa | Metrica | Resultado |
|---|---|---|
| Stage 1 | F1 exacto OOF ciego (5-fold) | 91,97% (P 90,48%, R 93,52%) |
| Stage 1 | F1 exacto corpus completo | 99,17% (relajado 99,36%, P 99,26%, R 99,08%) |
| Stage 1.5 | F1 sin tipo pliegue 1 ciego (IoU@50) | 85,41% (`NUMERIC_METRIC` 88,2%, `COMPLIANCE_ATTESTATION` 76,2%, exactitud de rama 94,8%, hoja Catala exacta 97,3%) |
| Stage 1.5 | F1 exacto corpus completo | 98,52% (P 97,49%, R 99,57%, hoja Catala exacta 97,6%) |
| Stage 2 | F1 IoU@50 corpus completo | 97,05% (exacto 87,73%, P 95,0%, R 99,2%) |
| Stage 2B | F1 exacto refinado | 94,93% (+7,20 sobre Stage 2 base, solapamiento 97,05%, 0,0% de pérdida de recall) |

No se han publicado resultados de benchmarks estandar en la informacion disponible. La evaluación fuera de distribución sobre 7 disposiciones del IRC no incluye métricas numéricas en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para la pila completa (15,9 M de parámetros, ~64 MB de pesos en FP32), más overhead de activaciones y del runtime.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria es suficiente (GTX 1650, RTX 3060, T4); no requiere A100 ni H100.
- Cabe holgadamente en GPU de consumo y también en CPU.
- Opciones de despliegue: PyTorch nativo, ONNX Runtime (grafos exportados con divergencia máxima verificada de 3,05e-05 en Stage 1, 1,34e-05 en Stage 1.5 y 7,63e-06 en Stage 2). No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, y no aplican al no ser un modelo generativo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de parsing estatutario ni resultados frente a alternativas. Las pilas de parsing legal hacia Catala son escasas y la model card no cita comparaciones con sistemas como LexNLP, Blackstone ni con LLMs generales aplicados a la tarea.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| law2code-parser-stages-15.9m | 15,9 M | No disponible | Apache 2.0 | Hugging Face |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Dominio muy estrecho: solo parsing estatutario hacia Catala y AST; no sirve para generación, razonamiento general ni otras tareas de NLP.
- Corpus de entrenamiento pequeño (250 disposiciones) y evaluación fuera de distribución limitada a 7 disposiciones del IRC estadounidense, lo que limita la evidencia de generalización a otras jurisdicciones o tradiciones legales.
- Riesgo de sobreajuste: la diferencia entre F1 OOF ciego (91,97% en Stage 1, 85,41% en Stage 1.5) y F1 sobre corpus completo (99,17% y 98,52%) es notable, y debe interpretarse como señal de que el rendimiento en datos nuevos será más cercano a las cifras ciegas.
- Idiomas soportados no declarados; los datos citados apuntan a inglés legal estadounidense y a la sintaxis Catala, por lo que el soporte de castellano u otras lenguas no está garantizado.
- La emisión de Stage 3 está fijada con `isAuthorizedToDisburse: false`; cualquier uso que requiera esa autorización exige intervención fuera del modelo.
- La compuerta de entropía puede derivar a revisión humana una proporción no especificada de casos, lo que afecta a los costes operativos en producción.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre decisiones legales derivadas recae en el integrador; no hay garantías de corrección jurídica.
- No se han publicado datos de sesgo, robustez adversarial ni comportamiento ante texto legal mal formado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación independiente de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MudraForge/law2code-parser-stages-15.9m
- Demo del proyecto law2code: https://huggingface.co/spaces/yamero999/law2code
- No se han encontrado en la búsqueda web papers, blogs, repositorios ni demos adicionales.
