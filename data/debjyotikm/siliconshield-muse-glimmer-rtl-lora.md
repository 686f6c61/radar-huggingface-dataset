# debjyotikm/siliconshield-muse-glimmer-rtl-lora

## Resumen

SiliconShield Muse Glimmer RTL es un adaptador LoRA de aproximadamente 183 MiB desarrollado por el usuario debjyotikm sobre el modelo base meta-models/Muse-Glimmer-30B. Su propósito es realizar análisis de RTL (Register Transfer Level) condicionado por requisitos: recibe una región de implementación en Verilog o SystemVerilog, un requisito en inglés y un conjunto de asunciones de ejecución, y devuelve una decisión estructurada sobre si la implementación satisface dicho requisito.

El adaptador cubre contratos locales de protección de registros y contratos focalizados de FIFO, contadores y arbitraje. No es un modelo autónomo ni un pipeline de clasificación estándar de Transformers: requiere el modelo base original congelado y se distribuye como adaptador PEFT. La relevancia actual reside en su enfoque de verificación asistida por lenguaje natural para hardware, un nicho donde los LLM generalistas rinden de forma inconsistente.

El modelo reporta un 97,22% de decisiones correctas en la población de desarrollo de guards locales y un 95,30% en la de contratos temporales focalizados, con un 96,36% combinado. Estas cifras provienen de poblaciones de desarrollo reutilizadas históricamente, no de un test sellado e independiente, y el propio autor lo advierte explícitamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer decoder (modelo base Muse-Glimmer-30B); adaptador PEFT |
| Parametros totales | no disponible (modelo base de 30B; adaptador ~183 MiB) |
| Parametros activos | no disponible |
| Longitud de contexto | 2.048 tokens (presupuesto de entrada; entradas mayores se rechazan, no se truncan) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica mediante LoRA sobre el modelo base Muse-Glimmer-30B, que permanece congelado. La tarea se formula como una decisión de tres clases sobre tokens registrados: `satisfies_requirement`, `violates_requirement` e `insufficient_context`. Las puntuaciones se normalizan sobre esos tres tokens y no constituyen probabilidades calibradas de corrección. El modelo no ejecuta ningún solver; la predicción de contexto insuficiente no es un mecanismo garantizado de rechazo.

El entrenamiento utilizó subconjuntos aceptados de estudios previos de SiliconShield, sin reproducir el currículo completo de sus ancestros. La población total disponible en TRAIN fue de 3.276 decisiones (1.092 tripletas), de las cuales se entregaron 1.194 al checkpoint congelado en la actualización 199 del optimizador, es decir, aproximadamente el 36,4% de los datos disponibles, no una época completa. Los prompts de entrenamiento sumaron 1.874.886 tokens con una longitud máxima de 766. Los ejemplos combinan requisitos en inglés, asunciones de ejecución y RTL; los requisitos contrabalanceados pueden seleccionar comportamientos distintos dentro del mismo diseño, y las etiquetas de contexto faltante se apoyan en implementaciones omitidas compatibles con resultados opuestos. La preparación verificó evidencia fuente aceptada, tripletas completas, balance de etiquetas e intersección nula TRAIN/DEV en identificadores de fila, texto exacto de entrada y grupos de partición, aunque no repitió todas las comprobaciones históricas de solver. Solo el texto de estado de entrada entró en el prompt; etiquetas, metadatos de prueba e identificadores de procedencia no se añadieron a las entradas.

## Capacidades

- Evaluación de RTL contra un requisito en inglés: determina si una implementación satisface, viola o carece de contexto suficiente para un requisito local concreto.
- Análisis de guards locales de registros: condiciones de escritura, privilegios y reset.
- Contratos focalizados de FIFO, contadores y arbitraje: por ejemplo, requisitos de hold en push/pop simultáneo que distinguen una rama de hold de una de incremento.
- Detección de contexto insuficiente: identifica cuándo falta información de implementación o de política que podría cambiar la respuesta correcta.
- Soporte de Verilog y SystemVerilog como lenguajes de entrada.
- Salida estructurada de tres clases con puntuaciones normalizadas sobre tokens registrados.
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Revisión de guards de registros en bloques de control: se introduce la lógica de escritura de un registro de configuración junto con el requisito de privilegio y las asunciones de reset, y el adaptador señala si la condición de escritura respeta la política declarada. Es adecuado porque el adaptador está especializado precisamente en esta clase de contratos locales.
- Verificación de contratos de FIFO en integración de periféricos: se comprueba si la lógica de push/pop satisface un requisito de hold bajo condiciones simultáneas, un caso cubierto explícitamente por la población de contratos temporales.
- Auditoría de contadores con requisitos de saturación o hold: se evalúa si la rama de incremento y la de hold se comportan conforme al requisito bajo las asunciones indicadas.
- Triaje de arbitraje en sistemas con múltiples maestros: se analiza si la lógica de arbitraje respeta un contrato de prioridad o de bloqueo declarado, con salida de contexto insuficiente cuando falta información de política.
- Filtrado previo en pipelines de revisión de código HDL: el adaptador puede actuar como primera pasada sobre regiones concretas antes de una revisión humana o de un solver formal, aprovechando su capacidad de marcar contexto insuficiente en lugar de forzar una decisión.
- Documentación de decisiones de verificación: las tres etiquetas de salida permiten registrar de forma estructurada por qué una región se considera conforme, disconforme o pendiente de contexto, útil en informes de auditoría interna.
- Formación de equipos de verificación: los seis ejemplos aportados por el autor (escrituras con y sin privilegio, hold e incremento simultáneos, helpers omitidos) sirven como material didáctico sobre contratos locales.

## Benchmarks y rendimiento

Resultados de evaluación en proceso fresco sobre el adaptador congelado en la actualización 199 del optimizador:

| Población | Decisiones correctas | Recall satisfies | Recall violation | Recall context | Violaciones falsas-seguras | Tripletas completas |
|---|---:|---:|---:|---:|---:|---:|
| Guards locales | 280/288 (97,22%) | 91/96 | 93/96 | 96/96 | 0/96 | 88/96 (91,67%) |
| Temporal focalizado | 223/234 (95,30%) | 75/78 | 70/78 | 78/78 | 5/78 | 67/78 (85,90%) |
| Combinado | 503/522 (96,36%) | 166/174 | 163/174 | 174/174 | 5/174 | 155/174 (89,08%) |

Una violación falsa-segura es un ejemplo que viola el requisito y se predice como satisfactorio. Una tripleta completa es correcta solo si las tres decisiones vinculadas son correctas. El modelo de guards locales falla tres violaciones prediciendo contexto insuficiente; el temporal falla cinco violaciones como satisfactorias y tres como contexto insuficiente. Las seis demostraciones autorales se clasificaron correctamente. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa aproximadamente 183 MiB; el modelo base Muse-Glimmer-30B debe cargarse completo, por lo que los requisitos de VRAM vienen determinados por este último.
- VRAM estimada para el modelo base de 30B: no disponible en la información proporcionada; depende de la cuantización, que no se documenta para este adaptador.
- GPU recomendadas: no disponible. Para un modelo de 30B en precisión completa se requieren múltiples aceleradores de datacenter (A100/H100); en cuantización de 4 bits podría caber en GPUs consumer de gama alta, pero no hay datos publicados que lo confirmen para este adaptador.
- Opciones de despliegue: PEFT sobre Transformers con el modelo base original; el adaptador no es un pipeline de clasificación estándar. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la información proporcionada. El adaptador es una especialización LoRA sobre Muse-Glimmer-30B y no se han publicado comparaciones con otros adaptadores de análisis de RTL ni con modelos generalistas en esta tarea.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SiliconShield Muse Glimmer RTL | no disponible (base 30B) | 2.048 | 96,36% en desarrollo combinado (no independiente) | Apache 2.0 | HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un detector general de seguridad de hardware: el propio autor lo describe como un modelo de investigación de ingeniería focalizado.
- Las métricas provienen de poblaciones de desarrollo reutilizadas históricamente; un subconjunto de 144 decisiones informó la selección del checkpoint. La evaluación completa de 522 decisiones se realizó tras congelar el checkpoint, pero no es un test sellado e independiente. No se reclama ningún resultado de cualificación independiente.
- El modelo no ejecuta un solver y la predicción de contexto insuficiente no garantiza el rechazo de entradas desconocidas.
- Las puntuaciones están normalizadas sobre tres tokens y no son probabilidades calibradas de corrección.
- Riesgo de violaciones falsas-seguras: 5 de 174 en la población combinada, es decir, casos que violan el requisito y se clasifican como satisfactorios.
- Solo admite inglés; no hay soporte multilingüe.
- Entradas superiores a 2.048 tokens se rechazan en lugar de truncarse, lo que limita el análisis de regiones RTL extensas.
- Entrenado sobre aproximadamente el 36,4% de los datos disponibles, sin una época completa, lo que puede dejar contratos poco representados.
- Licencia Apache 2.0 permite uso comercial, pero debe respetarse la licencia del modelo base Muse-Glimmer-30B, cuyos términos no se detallan en la información disponible.
- El adaptador no es un modelo autónomo ni un export fusionado; requiere el modelo base original y no funciona como pipeline de clasificación estándar.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/debjyotikm/siliconshield-muse-glimmer-rtl-lora
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Research paper (whitepaper): docs/whitepaper.md (dentro del repositorio)
- Guía de entrenamiento y construcción de datos: docs/training-guide.md (dentro del repositorio)
- Resultados estructurados: evaluation.json (dentro del repositorio)
- Procedencia del dataset: dataset_provenance.json (dentro del repositorio)
- Colección de entrenamiento SiliconShield: https://huggingface.co/datasets/debjyotikm/siliconshield-rtl-training
