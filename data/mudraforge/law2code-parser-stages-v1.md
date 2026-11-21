# MudraForge/law2code-parser-stages-v1

## Resumen

`law2code-parser-stages-v1` es un conjunto de cuatro etapas neuronales supervisadas (15,93 M de parámetros en total) desarrollado por MudraForge para el proyecto **law2code**, cuyo objetivo es transformar texto estatutario en representaciones ejecutables de tipo Catala y AST. A diferencia de los modelos de lenguaje generativos, este stack no produce texto libre: es un pipeline de etiquetado y segmentación que extrae constantes, operadores, operandos algebraicos y ámbitos de cláusula a partir de disposiciones legales anotadas. Se inicializa a partir de los encoders de la familia `law2code-tax-t1` y es compatible con `law2code-corporate-f1`.

El modelo resuelve un problema muy concreto: la brecha entre el lenguaje legal natural y los lenguajes de dominio específico (DSL) verificables como Catala. En lugar de pedir a un LLM que "escriba código legal", descompone la tarea en etapas deterministas y auditables, cada una con su propio conjunto de etiquetas BILOU o de spans. Es relevante ahora porque propone un enfoque de neuro-simbólico ligero (menos de 16 M de parámetros, ~0,1 GB de repo) que puede ejecutarse en CPU y desplegarse vía ONNX, con un mecanismo explícito de escalado a revisión humana cuando la entropía de la predicción supera un umbral.

La arquitectura es un transformer encoder de 256 dimensiones ocultas por etapa, con entradas enriquecidas (geometría discursiva de 36 dimensiones, índices de cláusula, condicionamiento entre etapas). El entrenamiento se realizó sobre 250 provisiones estatutarias anotadas con validación cruzada de 5 folds, y se evaluó en un conjunto OOD de 7 provisiones del Internal Revenue Code de EE. UU. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Stack de 4 etapas de transformer encoder (256 dims ocultas), salida BILOU/spans + post-proceso determinista |
| Parametros totales | 15.933.743 (Stage 1: 4,62 M; Stage 1.5: 6,26 M; Stage 2: 4,58 M; Stage 2B: 0,47 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (se distribuyen pesos PyTorch y ONNX en FP32) |
| Idiomas soportados | No disponible en la model card (el corpus de evaluación es del US Internal Revenue Code; el dominio es legal en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`.pt`) y ONNX (`.onnx`) |

## Arquitectura y entrenamiento

El stack se compone de cuatro etapas secuenciales. La **Stage 1** (`stage1_non_operands`, 4,62 M) extrae 9 clases de constantes y operadores (`MONEY`, `RATE`, `DATE`, `DURATION`, `COUNT`, `ACTOR_SCOPE`, `DEFINED_TERM`, `OP`, `XREF`) sobre 37 etiquetas BILOU, tomando como entrada IDs de palabra/carácter/subword, geometría discursiva de 36 dimensiones e índices de cláusula. La **Stage 1.5** (`stage1_5_operands`, 6,26 M) es un especialista en operandos Catala que cubre 4 ramas raíz (`NUMERIC_METRIC`, `CATEGORY_FILTER`, `DOC_POINTER`, `COMPLIANCE_ATTESTATION`), recibe un condicionamiento grueso de 10 canales de la Stage 1 y aplica una compuerta de entropía (H ≥ 0,50) que enruta frases OOD a revisión humana o de CA mediante una memoria de prototipos (`stage1_5_leaf_prototypes_v2.json`). La **Stage 2** (`stage2_clauses`, 4,58 M) factoriza el estatuto en ámbitos ejecutables (`COND`, `EXCEPTION`, `RULE_EFFECT`, `INLINE_DEF`) con 41 etiquetas puente, y la **Stage 2B** (`stage2_refiner`, 0,47 M) refina los límites de cláusula en una ventana de ±6 tokens.

El entrenamiento se realizó sobre 250 provisiones estatutarias anotadas (`ground_truth_250.json`, 2,33 MB) con validación cruzada de 5 folds y entrenamiento sobre corpus completo. La evaluación OOD se hizo sobre 7 provisiones no vistas del US Internal Revenue Code (`sara_gold_eval_20.json`, 951 spans atómicos y 137 operandos). La Stage 3 (Reflexion Critic y emisor Catala/AST) es determinista y no neuronal. El modelo soporta actualizaciones de memoria de prototipos `teach-leaf` sin reentrenar pesos, y las instantáneas de aprendizaje continuo se versionan por año-mes (`YYYY-MM`). Las diferencias máximas entre PyTorch y ONNX reportadas son de 3,05e-05 (Stage 1), 1,34e-05 (Stage 1.5) y 7,63e-06 (Stage 2).

## Capacidades

- Extracción de entidades legales atómicas: importes, tasas, fechas, duraciones, recuentos, actores, términos definidos, operadores y referencias cruzadas.
- Extracción de operandos algebraicos y condiciones en cuatro ramas Catala (métricas numéricas, filtros de categoría, punteros documentales y atestaciones de cumplimiento).
- Factorización de estatutos en ámbitos de cláusula ejecutables (condición, excepción, efecto de regla, definición en línea).
- Refinamiento de límites de cláusula a nivel de token con ventana de ±6.
- Enrutamiento selectivo a revisión humana mediante compuerta de entropía (umbral H ≥ 0,50).
- Actualización de memoria de prototipos (`teach-leaf`) sin reentrenamiento.
- Exportación a ONNX con paridad numérica verificada frente a PyTorch.
- No soporta tool calling, agentes, generación de texto libre, visión, audio ni modo thinking.

## Casos de uso

- **Conversión de estatutos a Catala en pipelines de cumplimiento**: el stack segmenta disposiciones legales en cláusulas y extrae operandos que alimentan el emisor determinista de Catala/AST, permitiendo generar artefactos verificables a partir de texto normativo.
- **Auditoría de cálculos fiscales**: la Stage 1 identifica importes, tasas y duraciones con F1 exacto OOF del 91,97 %, lo que permite reconstruir fórmulas de cálculo y contrastarlas con implementaciones existentes.
- **Detección de referencias cruzadas en corpus normativos**: la etiqueta `XREF` permite construir grafos de dependencias entre provisiones para análisis de impacto regulatorio.
- **Enrutamiento de casos ambiguos a revisión legal**: la compuerta de entropía de la Stage 1.5 deriva frases OOD a revisión humana, lo que encaja en flujos de trabajo donde la precisión es crítica y no se puede automatizar al 100 %.
- **Actualización mensual de normativa sin reentrenar**: las instantáneas de aprendizaje continuo versionadas por `YYYY-MM` permiten incorporar cambios de la Ley de Finanzas mensual mediante actualizaciones de prototipos `teach-leaf`.
- **Despliegue en entornos con recursos limitados**: con 15,93 M de parámetros y exportación ONNX, el stack puede ejecutarse en CPU en servicios de backend sin GPU, integrándose en APIs de procesamiento documental.
- **Preprocesado para modelos generativos**: las salidas estructuradas (spans, etiquetas, ámbitos) pueden servir como contexto determinista para un LLM posterior, reduciendo alucinaciones en la generación de código legal.

## Benchmarks y rendimiento

| Etapa | Métrica | Resultado |
|---|---|---|
| Stage 1 | F1 exacto OOF (5-fold ciego) | 91,97 % (P 90,48 %, R 93,52 %) |
| Stage 1 | F1 exacto corpus completo | 99,17 % (relajado 99,36 %, P 99,26 %, R 99,08 %) |
| Stage 1.5 | F1 sin tipo Fold-1 ciego (IoU@50) | 85,41 % (`NUMERIC_METRIC` 88,2 %, `COMPLIANCE_ATTESTATION` 76,2 %) |
| Stage 1.5 | Precisión de rama del router | 94,8 % |
| Stage 1.5 | Exactitud de hoja Catala | 97,3 % (ciego) / 97,6 % (corpus completo) |
| Stage 1.5 | F1 exacto corpus completo | 98,52 % (P 97,49 %, R 99,57 %) |
| Stage 2 | F1 IoU@50 corpus completo | 97,05 % (exacto 87,73 %, P 95,0 %, R 99,2 %) |
| Stage 2B | F1 exacto refinado | 94,93 % (+7,20 sobre Stage 2 base, solapamiento 97,05 %, 0,0 % pérdida de recall) |

No se han publicado comparaciones con modelos externos en la información disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en FP32 para el stack completo (pesos de 19,4 + 26,0 + 18,9 + 1,89 MB); en la práctica cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Cualquier GPU con ≥ 2 GB (GTX 1650, RTX 3050, RTX 4090, A100, H100) es sobrada.
- Cabe en GPU consumer: sí, en todas las GPU consumer modernas e incluso en Raspberry Pi / entornos embebidos vía ONNX Runtime.
- Opciones de despliegue: PyTorch nativo, ONNX Runtime (exportaciones verificadas con diferencias ≤ 3,05e-05), integración en el Space `law2code`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `law2code-parser-stages-v1` | 15,93 M | No disponible | Parsing estatutario multi-etapa a Catala/AST | Apache 2.0 | Hugging Face |
| LLM generativos (p. ej. familia Llama, Mistral) | ≥ 7 B | 8K-128K | Generación de texto/código legal | Varía | Hugging Face |
| Encoders legales tipo Legal-BERT | ~110 M | 512 | Clasificación/NER legal | Apache 2.0 / MIT | Hugging Face |

La comparación directa con LLM generativos no es equivalente: `law2code-parser-stages-v1` no genera texto, sino etiquetas y spans estructurados. Frente a encoders legales genéricos como Legal-BERT, el stack de MudraForge es mucho más pequeño (~16 M frente a ~110 M) y está especializado en una tarea concreta (parsing a DSL verificable), pero carece de capacidades generativas. No se dispone de benchmarks cruzados con estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- **Dominio restringido**: entrenado y evaluado sobre estatutos de EE. UU. (Internal Revenue Code); su generalización a otras jurisdicciones (España, UE) no está validada.
- **Idioma**: la model card no declara idiomas soportados; el corpus de evaluación es en inglés legal, por lo que el rendimiento en castellano es desconocido.
- **Sesgo de anotación**: el corpus de 250 provisiones puede no cubrir toda la variabilidad del lenguaje estatutario; el F1 del 99,17 % en corpus completo contrasta con el 91,97 % en validación cruzada ciega, lo que sugiere sobreajuste al conjunto de entrenamiento.
- **Riesgo de alucinación estructural**: aunque no genera texto libre, puede producir spans o límites de cláusula incorrectos; la compuerta de entropía mitiga pero no elimina este riesgo.
- **Conjunto OOD pequeño**: solo 7 provisiones no vistas (951 spans atómicos), insuficiente para estimar robustez en producción.
- **Dependencia del emisor determinista**: la Stage 3 (Catala/AST) no es neuronal y debe validarse por separado; el stack no garantiza por sí solo la corrección semántica del código legal generado.
- **Licencia Apache 2.0**: permite uso comercial, pero el autor no ofrece garantías ni soporte; verificar la procedencia del corpus de entrenamiento para cumplimiento.
- **Sin tool calling ni agentes**: no es un modelo conversacional ni apto para tareas fuera del parsing estatutario.
- **Fecha de creación futura (2026-11-21)**: metadato inusual que conviene verificar antes de confiar en el versionado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MudraForge/law2code-parser-stages-v1
- Space demo `law2code`: https://huggingface.co/spaces/yamero999/law2code
- Encoder base Tax T1: https://huggingface.co/MudraForge/law2code-tax-t1-encoder
- Encoder Corporate F1: https://huggingface.co/MudraForge/law2code-corporate-f1-encoder
