# Sagicc/nanoGentzen-Jev-v3

## Resumen

nanoGentzen-Jev-v3 es un motor de decisión neuro-simbólico de 4.927.780 parámetros desarrollado por Sagicc. Combina un transformer bidireccional de política-valor con un kernel determinista de verificación basado en cálculo de secuentes intuicionista de Gentzen (LI). El modelo no genera texto libre: evalúa estados JSON estructurados, predicados numéricos y de expresiones regulares, políticas en lenguaje natural y criterios de rúbrica, y emite decisiones tipadas con prueba o refutación formal.

El modelo resuelve el problema de las decisiones automatizadas que requieren trazabilidad formal. Frente a un LLM convencional, que produce una respuesta probabilística sin garantías lógicas, nanoGentzen-Jev-v3 devuelve un árbol de prueba verificable, un diagnóstico de hechos faltantes y una distribución epistémica calibrada de tres clases (falso, indecidible, verdadero). Es relevante porque demuestra que un modelo de menos de 5 millones de parámetros puede acercarse al rendimiento de modelos de 27.000 millones en tareas de decisión tipada, según los datos publicados por el autor.

La arquitectura incluye una cabeza de puntero de span para seleccionar el antecedente pivote (hasta 32 premisas), una cabeza de valor epistémico de tres clases y un renombrado alfa biyectivo que comprime nombres de variables largos en símbolos canónicos antes de la tokenización. El modelo está en fase de pruebas y el autor recomienda la versión posterior Sagicc/nanoGentzen-v3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bidireccional de política-valor con kernel de verificación de cálculo de secuentes intuicionista (LI) de Gentzen |
| Parametros totales | 4.927.780 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería transformers, requiere trust_remote_code) |

## Arquitectura y entrenamiento

El modelo combina dos componentes. El primero es un transformer bidireccional de política-valor que procesa el estado y las fórmulas como secuentes y produce dos salidas: una distribución epistémica de tres clases `[P(False), P(Undecided), P(True)]` y una distribución de atención sobre los antecedentes del contexto `Γ` mediante una cabeza de puntero de span con `max_antecedents = 32`. El segundo es un kernel determinista (`kernel.py`, `search.py`) que ejecuta búsqueda de prueba guiada por el modelo y verifica formalmente el árbol resultante con `kernel.verify_proof_tree`.

El entrenamiento se realizó sobre el dataset propio Sagicc/nanoGentzen-Jev, partiendo del modelo base Sagicc/nanoGentzen-v2 mediante ajuste fino. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF o DPO. La innovación técnica destacable es el renombrado alfa biyectivo, que comprime nombres de variables de empresa de más de 300 caracteres en símbolos canónicos (`P, Q, R, S, v0..v15`) antes de la tokenización y restaura los nombres originales en el árbol de prueba verificado. El compilador unificado (`parser.py`) traduce estados JSON, predicados (`==`, `!=`, `>`, `>=`, `<`, `<=`, `in`, `contains`, `regex`), fórmulas simbólicas (`a & b => c`), condicionales en lenguaje natural y criterios de rúbrica a secuentes de Gentzen.

## Capacidades

- Decisión booleana constructiva (`noul`): devuelve `true`, `false` o `INTUITIONISTIC_UNDECIDED` con prueba o refutación formal y diagnóstico de hechos faltantes.
- Enrutamiento multiopción verificado (`choice`): selecciona entre opciones declaradas con derivaciones constructivas.
- Puntuación ordinal por niveles (`score`): asigna niveles de rúbrica (por ejemplo `[1, 2, 3, 4]`) con pruebas de nivel verificadas y distribuciones calibradas.
- Evaluación de predicados numéricos, de igualdad, de pertenencia, de subcadena y de expresiones regulares sobre estados JSON.
- Interpretación de reglas de política simbólicas y de condicionales en lenguaje natural.
- API dual: búsqueda de prueba verificada (System-2, latencia de 1 a 25 ms) y puerta epistémica rápida de una sola pasada (System-1, aproximadamente 2 ms).
- Servidor HTTP con endpoints `POST /v1/decide` y `POST /v1/systemone`.
- No soporta generación de texto libre, tool calling genérico ni razonamiento multi-turno conversacional.

## Casos de uso

- Aprobación de transacciones financieras: el modelo evalúa un estado JSON con verificación KYC, edad, sanciones e importe, aplica reglas de política y devuelve una decisión de enrutamiento (`auto_approve`, `manual_review`, `reject`) con árbol de prueba verificable para auditoría.
- Cumplimiento normativo y KYC/AML: las decisiones quedan respaldadas por una derivación formal en cálculo de secuentes, lo que permite justificar ante un regulador por qué se aprobó o rechazó una operación y qué hechos faltaban.
- Enrutamiento de tickets o solicitudes: la primitiva `choice` asigna cada caso a una cola u opción verificada según reglas de negocio, con latencia de milisegundos adecuada para servicios de alta concurrencia.
- Puntuación de rúbricas en evaluación: la primitiva `score` asigna niveles ordinales calibrados a criterios de texto libre o JSON, útil para evaluación automática de respuestas con distribución de probabilidad por nivel.
- Verificación de políticas de acceso: dado un estado de usuario y recursos, el modelo decide si se concede acceso y emite el diagnóstico de los hechos ausentes cuando la respuesta es indecidible.
- Puerta epistémica de baja latencia: el modo System-1 (una pasada, aproximadamente 2 ms) filtra casos triviales antes de invocar la búsqueda de prueba completa, reduciendo coste computacional en pipelines de decisión.
- Motor de reglas neuro-simbólico embebido: al ocupar menos de 5 millones de parámetros, puede desplegarse en entornos con recursos limitados donde un LLM de decenas de miles de millones no es viable.

## Benchmarks y rendimiento

Resultados publicados por el autor en el benchmark `LocalLLaMA/typed-decisions` (400 casos de prueba, 2.000 decisiones):

| Modelo | Parametros | Precision global | `noul` | `choice` | `score` | `score` ±1 | KL medio | Brier medio | ECE |
|---|---|---|---|---|---|---|---|---|---|
| Baseline-27B | 27.000M | 0,761 | 0,832 | 0,732 | 0,730 | 0,979 | 0,150 | 0,081 | no disponible |
| nanoGentzen-Jev-v3 | 4,93M | 0,731 | 0,828 | 0,685 | 0,693 | 0,973 | 0,150 | 0,081 | 0,087 |
| SafeDecide-140M | 140M | 0,728 | 0,793 | 0,692 | 0,708 | 0,974 | 0,168 | 0,089 | no disponible |
| JEV-35B | 35.000M | 0,700 | 0,778 | 0,648 | 0,680 | 0,964 | 0,214 | 0,111 | no disponible |
| GEV-26B-Decide | 26.000M | 0,522 | 0,670 | 0,517 | 0,415 | 0,833 | 0,391 | 0,193 | no disponible |
| JEV-27B | 27.000M | 0,495 | 0,680 | 0,422 | 0,410 | 0,815 | 0,431 | 0,211 | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa (4,93 millones de parámetros, aproximadamente 20 MB en fp32); cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; el modelo puede ejecutarse también en CPU.
- Cabe en GPU consumer: sí, en todas las NVIDIA GTX/RTX modernas, así como en iGPU y en CPU.
- Opciones de despliegue: transformers con `trust_remote_code=True`, servidor propio `jev_server.py` con endpoints HTTP `/v1/decide` y `/v1/systemone`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia: aproximadamente 2 ms en modo System-1 (una pasada) y de 1 a 25 ms en modo System-2 (búsqueda de prueba verificada), según datos del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision global (typed-decisions) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nanoGentzen-Jev-v3 | 4,93M | no disponible | 0,731 | MIT | Hugging Face |
| SafeDecide-140M | 140M | no disponible | 0,728 | no disponible | no disponible |
| JEV-35B | 35.000M | no disponible | 0,700 | no disponible | no disponible |
| Baseline-27B | 27.000M | no disponible | 0,761 | no disponible | no disponible |

nanoGentzen-Jev-v3 ofrece una precisión global comparable a SafeDecide-140M con 28 veces menos parámetros y ligeramente por debajo del Baseline-27B, con la ventaja adicional de emitir árboles de prueba formales y calibración (ECE de 0,087). No se dispone de información sobre contexto, licencia ni disponibilidad de los modelos comparados.

## Limitaciones y advertencias

- Modelo en fase de pruebas y desarrollo según el propio autor, que recomienda la versión posterior Sagicc/nanoGentzen-v3.
- Solo soporta inglés; no hay capacidades multilingües documentadas.
- No es un modelo generativo: no produce texto libre ni mantiene conversaciones multi-turno.
- Las decisiones pueden ser `INTUITIONISTIC_UNDECIDED` cuando faltan hechos; el sistema debe gestionar ese estado en producción.
- Los benchmarks proceden del autor y del benchmark propio `LocalLLaMA/typed-decisions`; no hay validación independiente en la información disponible.
- Riesgo de alucinación no aplicable en el sentido generativo, pero la búsqueda de prueba guiada por red puede fallar o no converger en estados complejos; el kernel determinista mitiga este riesgo al verificar formalmente el árbol.
- Licencia MIT, que permite uso comercial sin restricciones documentadas.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; conviene auditar `kernel.py`, `parser.py`, `search.py` y `jev_server.py` antes de desplegar.
- No se documentan sesgos conocidos ni límites de longitud de contexto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sagicc/nanoGentzen-Jev-v3
- Modelo base: https://huggingface.co/Sagicc/nanoGentzen-v2
- Versión recomendada: https://huggingface.co/Sagicc/nanoGentzen-v3
- Dataset: https://huggingface.co/datasets/Sagicc/nanoGentzen-Jev
- Benchmark: `LocalLLaMA/typed-decisions` (referenciado en la model card; sin URL directa en la información disponible)
