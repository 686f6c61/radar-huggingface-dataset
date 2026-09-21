# Jeesup/svd-safety-mis7_swift_remove50_swapgapiter_rankunit_b010

## Resumen

`svd-safety-mis7_swift_remove50_swapgapiter_rankunit_b010` es un checkpoint de investigación publicado por el usuario Jeesup que parte de `mistralai/Mistral-7B-Instruct-v0.2` y le aplica dos transformaciones: una compresión SVD-LLM que elimina el 49,97 % de los parámetros densos (fracción resultante 0,5003) y una reparación posterior mediante 10 de 10 rondas de intercambio iterativo de parámetros neutro, seleccionadas con la regla `gap_iter` y con un presupuesto total del 1,000 % de los parámetros densos. El resultado es un artefacto de una sola celda dentro de una malla experimental más amplia sobre reglas de selección y presupuestos.

El problema que aborda no es el de un asistente conversacional, sino el de medir cuantitativamente cómo la compresión por descomposición en valores singulares degrada el comportamiento de seguridad de un modelo alineado y qué regla de selección de componentes repara mejor ese daño. El autor advierte explícitamente de que varias celdas de la malla están degradadas deliberadamente en seguridad y de que cualquier celda debe tratarse como sujeto experimental, no como modelo desplegable.

El checkpoint tiene 7.241.732.096 parámetros almacenados en safetensors (14,5 GB de repositorio), licencia Apache-2.0, pipeline de generación de texto y está etiquetado para transformers, text-generation-inference y endpoints compatibles. No se documentan idiomas soportados, longitudes de contexto propias ni resultados de benchmarks generales (MMLU, HumanEval, GSM8K); las únicas métricas publicadas son de seguridad y perplejidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Mistral (heredada de `mistralai/Mistral-7B-Instruct-v0.2`), con truncamiento SVD-LLM y reparación por intercambio de componentes aplicados sobre los pesos |
| Parámetros totales | 7.241.732.096 (según safetensors); la model card indica una fracción de parámetros densos resultante de 0,5003 tras la compresión |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No especificada en la model card de este checkpoint; el modelo base `mistralai/Mistral-7B-Instruct-v0.2` declara 32.768 tokens con ventana deslizante de 4.096 |
| Tipos de cuantización | No disponible (el repositorio solo publica safetensors; no se publican GGUF, AWQ, GPTQ ni otras variantes) |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (library_name: transformers) |
| Modelo base | mistralai/Mistral-7B-Instruct-v0.2 |
| Tamaño del repositorio | 14,5 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Mistral-7B-Instruct-v0.2, un transformer decoder-only de 7.000 millones de parámetros. Sobre esa base no se realiza un entrenamiento nuevo: se aplica compresión SVD-LLM hasta dejar el 49,97 % de los parámetros densos (fracción resultante 0,5003), y después se ejecuta un procedimiento de reparación denominado intercambio iterativo de parámetros neutro (*parameter-neutral swap*), que restaura y sustituye componentes con el objetivo de recuperar comportamiento perdido sin alterar el recuento de parámetros de forma neta.

Los detalles del procedimiento son concretos: la regla de selección de componentes es `gap_iter`; el presupuesto de restauración es del 1,000 % de los parámetros densos; se restauran 5.145 componentes y se sustituyen otros 5.145; se aplican 10 de 10 rondas con un bloque del 0,100 % de los parámetros densos por ronda; se insertan 69.744.640 parámetros (1,00 % de los parámetros de proyección densos); el valor de intercambio es `insert` (solo valor de inserción, con desalojo ordenado por sigma); y la semilla es 42. No se documentan en la model card ni el número de tokens de entrenamiento, ni la composición del dataset, ni si hubo RLHF, DPO o cualquier otro ajuste por preferencias: la alineación procede del modelo base original y del proceso de reparación descrito.

## Capacidades

- Generación de texto y conversación: pipeline declarado `text-generation`, con la etiqueta `conversational` heredada del modelo base instruct.
- Razonamiento e instrucciones: capacidades heredadas de Mistral-7B-Instruct-v0.2, pero no verificadas ni documentadas para este checkpoint comprimido.
- Código y matemáticas: no documentadas en la información disponible; no se publican resultados de HumanEval, MBPP ni GSM8K.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas (el campo de idiomas no está disponible).
- Capacidades especiales: la model card no declara visión, audio ni modo de razonamiento explícito (*thinking mode*).
- Capacidad instrumental para investigación: es un sujeto experimental para medir el impacto de la compresión SVD en la seguridad, con métricas de ataque adversario, sobre-rechazo y perplejidad ya publicadas.
- Compatibilidad de despliegue: etiquetado como `text-generation-inference` y `endpoints_compatible`, por lo que puede servirse con las herramientas estándar de transformers y TGI.

## Casos de uso

- Estudio cuantitativo de la degradación de seguridad por compresión: el checkpoint permite medir la tasa de éxito de ataques (ASR) de AdvBench (0,0731) y StrongREJECT (0,1470) con juez HarmBench sobre un modelo comprimido al 50 % y compararla con el modelo sin comprimir, para cuantificar cuánto daño introduce el truncamiento SVD.
- Evaluación comparativa de reglas de selección de componentes: al ser una celda con regla `gap_iter` dentro de una malla, sirve como punto de comparación frente a otras reglas y presupuestos, aislando el efecto de la regla con la semilla 42 y el mismo recuento de componentes (5.145 restaurados y 5.145 sustituidos).
- Calibración de clasificadores de rechazo: la métrica de macro sobre-rechazo medida con WildGuard (0,3185) permite entrenar y ajustar umbrales de sistemas de moderación que deben distinguir entre rechazo legítimo y sobre-rechazo.
- Red-teaming y evaluación de guardarraíles: puede emplearse como sujeto de ataque en pipelines automatizados de *jailbreak* para validar que las defensas funcionan frente a un modelo con pesos comprimidos, un escenario poco cubierto por las baterías de evaluación habituales.
- Análisis de calidad de la distribución de salida: la perplejidad de 13,6528 en WikiText-2 permite estudiar cómo el truncamiento SVD y la reinserción de componentes afectan a la modelización del lenguaje, con una referencia numérica reproducible.
- Reproducibilidad de experimentos de interpretabilidad: los metadatos de procedencia (presupuesto del 1,000 %, bloque del 0,100 % por ronda, 10 rondas, semilla 42, valor de intercambio `insert`, desalojo ordenado por sigma) permiten replicar exactamente esta configuración y auditar el efecto de cada hiperparámetro.
- Docencia y metodología de investigación: como ejemplo documentado de ficha de procedencia completa en un artefacto de compresión, es útil para enseñar prácticas de trazabilidad en experimentos sobre pesos de modelos.
- Uso conversacional: solo en entornos de laboratorio aislados y con fines de evaluación; el propio autor desaconseja su uso como asistente desplegable.

## Benchmarks y rendimiento

La model card solo publica métricas de seguridad y de perplejidad; no hay MMLU, HumanEval, GSM8K ni otras pruebas de capacidad general.

| Métrica | Valor | Juez / método |
|---|---|---|
| AdvBench ASR | 0,0731 | Juez HarmBench |
| StrongREJECT ASR | 0,1470 | Juez HarmBench |
| Macro sobre-rechazo | 0,3185 | WildGuard |
| Perplejidad WikiText-2 | 13,6528 | No especificado |

No se han publicado en la información disponible resultados de benchmarks de capacidad general (MMLU, HumanEval, GSM8K, MT-Bench u otros), ni los valores del modelo base sin comprimir con los que comparar directamente estas cuatro métricas.

## Requisitos de hardware

- VRAM para inferencia en precisión completa (fp16/bf16): el peso en safetensors ocupa unos 14,5 GB, por lo que se necesitan aproximadamente 16-18 GB de VRAM contando caché KV y activaciones.
- GPU recomendadas: A100 40 GB, H100 80 GB, L40S 48 GB o RTX 4090 24 GB para fp16 sin cuantizar.
- GPU de consumo: cabe en RTX 4090, RTX 3090 (24 GB) y RTX 4080 (16 GB, al límite y probablemente con *offloading*). En tarjetas de 8-12 GB sería necesario cuantizar, pero no hay cuantizaciones publicadas (una conversión a 8 bits dejaría unos 7-8 GB y a 4 bits unos 4-5 GB, como estimación).
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta `text-generation-inference`) y endpoints compatibles (etiqueta `endpoints_compatible`). vLLM y Ollama requerirían conversión previa, y llama.cpp necesitaría una conversión a GGUF que no está publicada.
- Latencia y throughput: no disponibles.
- Almacenamiento: 14,5 GB de repositorio más el espacio de caché de Hugging Face.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento de seguridad |
|---|---|---|---|---|---|
| svd-safety-mis7_swift_remove50_swapgapiter_rankunit_b010 | 7.241.732.096 (fracción densa 0,5003) | No especificado (base: 32.768) | Apache-2.0 | HuggingFace, 0 descargas | AdvBench ASR 0,0731; StrongREJECT ASR 0,1470 |
| mistralai/Mistral-7B-Instruct-v0.2 (base sin comprimir) | 7.241.732.096 | 32.768 tokens | Apache-2.0 | HuggingFace, ampliamente desplegado | No disponible en la información proporcionada |
| Otras celdas de la malla del mismo estudio | No disponible | No disponible | Apache-2.0 | HuggingFace | No disponible |
| Otros modelos comprimidos de 7B (p. ej. variantes SVD o podadas) | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone en la información proporcionada de datos de rendimiento de los modelos comparables, por lo que la comparación se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- No es un modelo de propósito general: el propio autor lo describe como artefacto de investigación y celda de una malla, no como asistente desplegable.
- Parte de la malla a la que pertenece está deliberadamente degradada en seguridad; la compresión por sí sola eleva la tasa de éxito de ataques, y el objetivo del estudio es cuantificarlo. Cualquier uso en producción exige evaluación propia previa.
- Riesgo de sobre-rechazo elevado: la macro de sobre-rechazo medida con WildGuard es 0,3185, lo que implica que una fracción relevante de peticiones benignas puede ser rechazada.
- Degradación de la modelización del lenguaje: la perplejidad en WikiText-2 es 13,6528, coherente con una pérdida de calidad respecto al modelo sin comprimir, aunque no se publica el valor de referencia del base en esta información.
- Riesgo de alucinación: no se documenta ninguna mitigación específica ni evaluación de veracidad; al tratarse de un modelo comprimido, cabe esperar un comportamiento igual o peor que el base, pero no hay datos que lo cuantifiquen.
- Idiomas soportados: no disponibles; no se puede asumir cobertura multilingüe sin evaluación.
- Longitud de contexto: no especificada para el checkpoint; solo se puede inferir la del modelo base (32.768 tokens), sin garantía de que la compresión no la degrade.
- Tool calling y comportamiento de agente: no documentados.
- Licencia: el checkpoint se distribuye bajo Apache-2.0, pero la model card señala que el repositorio del modelo base no incluye fichero de licencia para redistribuir; conviene revisar la situación antes de un uso comercial.
- Madurez: 0 descargas y 0 likes, autor único y sin revisión por pares documentada; el soporte y el mantenimiento no están garantizados.
- Metadatos a revisar: la fecha indicada de creación y actualización es 2026-09-21, y los resultados de búsqueda web disponibles no contienen información relevante sobre este modelo (devuelven documentación de ensamblajes CAD), por lo que no hay contexto externo verificable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-mis7_swift_remove50_swapgapiter_rankunit_b010
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2
- Perfil del autor: https://huggingface.co/Jeesup
- Paper, blog, repositorio o demo adicionales: no disponible (los resultados de búsqueda web no contienen referencias relevantes a este modelo ni al método SVD-LLM citado en la model card)
