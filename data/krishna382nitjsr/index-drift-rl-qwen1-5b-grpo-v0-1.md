# krishna382nitjsr/index-drift-rl-qwen1.5b-grpo-v0.1

## Resumen

`index-drift-rl-qwen1.5b-grpo-v0.1` es un adaptador LoRA publicado por krishna382nitjsr que convierte a Qwen2.5-Coder-1.5B-Instruct en un asesor de índices para PostgreSQL. Dado un esquema de tabla, una consulta lenta y su plan `EXPLAIN`, el modelo devuelve una única sentencia `CREATE INDEX CONCURRENTLY ...` (o la palabra `NO INDEX` si ningún índice ayudaría). No es un modelo completo: es un adaptador PEFT de aproximadamente 18 millones de parámetros entrenables que se carga sobre el modelo base de 1.500 millones de parámetros.

Lo relevante tecnicamente es el método de entrenamiento: GRPO (Group Relative Policy Optimization) con recompensas calculadas en vivo contra el planificador de PostgreSQL mediante índices hipotéticos (HypoPG). Cada respuesta se puntúa por la reducción de coste estimado que produciría el índice propuesto, con penalizaciones explícitas por sentencias inválidas, destructivas, rechazadas por el servidor, sin `CONCURRENTLY` o sobredimensionadas. Es un ejemplo compacto de RL con verificador real (no un juez LLM) sobre una tarea de infraestructura.

El resultado es muy bueno dentro de su distribución de entrenamiento (97% de consultas resueltas frente al 37% del modelo base en el split `test`) y nulo fuera de ella: en plantillas de consulta no vistas, el adaptador rinde exactamente igual que el base (72%) y repite un error de sintaxis en claves de expresión JSONB. El autor lo presenta como release de investigación, especializado en las formas de consulta del benchmark, no como asesor de índices general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen2.5-Coder-1.5B-Instruct) con adaptador LoRA; no es MoE |
| Parametros totales | 1.500 millones en el modelo base; adaptador LoRA de ~18 millones de parámetros entrenables |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-Coder-1.5B-Instruct) |
| Tipos de cuantizacion | no disponible para el adaptador (pesos LoRA en safetensors); el autor recomienda ejecutar el base en float32 o bfloat16 y advierte de que float16 degrada el modelo |
| Idiomas soportados | ingles (`en`) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, `library_name: peft`); repo de 0,1 GB |
| Configuracion LoRA | r = 16, alpha = 32, dropout 0,05, todas las capas lineales |
| Metodo de entrenamiento | GRPO con TRL 1.16, 300 pasos, beta = 0, lr 2e-5 |
| Dataset de entrenamiento | 600 prompts del split `single/train` de `krishna382nitjsr/index-drift-rl-bench` |
| Pipeline | text-generation (conversacional) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-Coder-1.5B-Instruct, un transformer decoder-only de 1.500 millones de parámetros orientado a código. El entrenamiento modifica únicamente las capas lineales mediante LoRA con rango 16 y alpha 32, lo que deja ~18 millones de parámetros entrenables y un artefacto de 0,1 GB. La entrada es un prompt de chat con tres bloques: esquema DDL (con el número aproximado de filas), consulta lenta y plan `EXPLAIN`; la salida esperada es una sola sentencia SQL o `NO INDEX`.

El entrenamiento usa GRPO durante 300 pasos, con 2 prompts y 8 completions por paso, beta = 0 y learning rate 2e-5. La innovación está en la función de recompensa (`src/environment.py`): cada completion se evalúa creando un índice hipotético con HypoPG y midiendo la reducción de coste del planificador respecto al mejor índice conocido, promediada sobre 4 conjuntos de parámetros. Se aplican penalizaciones de −1 para respuestas inválidas o destructivas, −0,75 si PostgreSQL rechaza la sentencia, −0,5 si falta `CONCURRENTLY` o `UNIQUE`, más penalizaciones por tamaño del índice, verbosidad excesiva y regresión de latencia medida. Todo el entrenamiento se ejecutó en una T4 gratuita de Kaggle, en float32, durante 2,8 horas; la recompensa se estabilizó en torno a 0,93 tras unos 100 pasos.

## Capacidades

- Generación de una única sentencia DDL de indexación (`CREATE INDEX CONCURRENTLY <nombre> ON <tabla> (...);`) a partir de esquema, consulta y plan `EXPLAIN`.
- Decisión de abstención: emite `NO INDEX` cuando el índice no aportaría mejora de coste.
- Razonamiento sobre orden de columnas: distingue columnas de igualdad de columnas de rango u ordenación (por ejemplo `tenant_id = 7 AND status = 'pending' ORDER BY created_at`).
- Uso de índices parciales cuando la selectividad lo justifica: el caso citado en la model card es `WHERE status = 'pending'` para un estado poco frecuente.
- Cumplimiento de restricciones de producción inducido por recompensa: `CONCURRENTLY` obligatorio, preferencia por el índice más pequeño que resuelve la consulta.
- Capacidad de expresión sobre claves JSONB, aunque con un fallo de sintaxis documentado (paréntesis en las claves de expresión) en plantillas no vistas.
- No hay soporte documentado de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito; el modelo está entrenado para responder en un solo turno y en inglés.
- Multilingüe: no. Solo inglés.

## Casos de uso

- Revisión de índices en migraciones de base de datos: el adaptador propone un índice candidato para cada consulta lenta detectada en el diff de una migración, con la garantía de que la sentencia usa `CONCURRENTLY` y por tanto no bloquea la tabla; un DBA humano valida antes de aplicar.
- Triaje en observabilidad de consultas lentas: integrado en un pipeline que recibe las consultas del `pg_stat_statements` con su `EXPLAIN`, genera un primer borrador de índice para que el equipo de plataforma priorice qué revisar.
- Generación de candidatos para HypoPG en un banco de pruebas: el modelo produce la sentencia y el harness existente la evalúa con índices hipotéticos antes de crear nada real, lo que permite descartar propuestas sin coste en producción.
- Asistente interno para desarrolladores de backend: un endpoint que, dado el esquema y la consulta problemática, devuelve una propuesta que el desarrollador pega en su entorno de staging; útil porque el modelo conoce la convención `CREATE INDEX CONCURRENTLY` y evita el error habitual de indexar sin concurrencia.
- Formación y documentación: generar pares consulta/índice como ejemplos en guías internas de optimización de PostgreSQL, siempre con revisión posterior dado el riesgo de error sintáctico en JSONB.
- Prueba de concepto de RL con verificador real: sirve como plantilla reproducible (TRL + GRPO + HypoPG, 2,8 h en una T4) para equipos que quieran entrenar políticas sobre tareas de infraestructura con recompensas medidas, no juzgadas por un LLM.
- Filtro de "no indexar": en un revisor automático de PRs SQL, usar la salida `NO INDEX` como señal de que la consulta necesita reescritura y no un índice nuevo.

## Benchmarks y rendimiento

Datos de la model card, evaluados en la tarea `single` del benchmark, con la misma GPU, el mismo harness y decodificación greedy. *Solved* significa que la reducción de coste de la respuesta está dentro del 2% del mejor índice conocido; *capture* es la proporción de la mejora del mejor índice que se consigue.

| Split | Modelo | Valid | Solved | Capture | Mean reward |
|---|---|---|---|---|---|
| test (200) | modelo base | 98% | 37% | 37% | +0,33 |
| test (200) | este adaptador | 100% | 97% | 99% | +0,95 |
| plantillas no vistas (163) | modelo base | 72% | 72% | 72% | +0,33 |
| plantillas no vistas (163) | este adaptador | 72% | 72% | 72% | +0,33 |
| test / no vistas | regla de manual (igualdad, luego rango/ordenación) | 100% / 100% | 90% / 66% | 98% / 96% | no disponible |

No se han publicado resultados en benchmarks estándar de código o razonamiento (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador añade ~18 millones de parámetros sobre un base de 1.500 millones; en float32 el conjunto ronda los 6 GB y en bfloat16 alrededor de 3 GB (cálculo a partir del número de parámetros, no medido en la información disponible).
- GPU recomendadas: el autor entrenó en una T4 de 16 GB (Kaggle gratuita), por lo que una T4, L4 o RTX 3060 de 12 GB son suficientes para inferencia. Para servir en producción con concurrencia, A10G, L40S o A100 aportan margen.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4070, RTX 4090 y similares, usando float32 o bfloat16.
- Precisión obligatoria: float32 o bfloat16. En float16 el modelo base colapsa y responde siempre `NO INDEX` según el autor.
- Opciones de despliegue: `transformers` + `peft` (`PeftModel.from_pretrained`) es la vía documentada. No hay instrucciones publicadas para vLLM, llama.cpp, Ollama o TGI; al ser un adaptador LoRA, el soporte en estos motores requeriría fusionar los pesos con el base.
- Latencia y throughput: no disponibles. La generación está acotada a `max_new_tokens=96` en el ejemplo del autor, lo que limita la latencia por respuesta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (index-drift-rl v0.1) | 1,5 B base + ~18 M LoRA | no disponible | 97% solved / 100% valid en `test`; 72% en plantillas no vistas | apache-2.0 | HuggingFace, requiere modelo base |
| Qwen2.5-Coder-1.5B-Instruct (base) | 1,5 B | no disponible en la información | 37% solved en `test`; 72% en plantillas no vistas | apache-2.0 (según modelo base) | HuggingFace |
| Regla de manual (igualdad, luego rango/ordenación) | no aplica (heurística) | no aplica | 90% solved en `test`; 66% en no vistas | no aplica | implementación propia |
| Asesores de índices comerciales o extensiones de PostgreSQL | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de otros adaptadores o modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: entrenado sobre un único esquema sintético (comercio multi-tenant) y 8 plantillas de consulta. El propio autor afirma que el modelo aprendió en gran medida respuestas específicas de plantilla.
- Sin generalización fuera de distribución: en las 163 plantillas no vistas no hay ninguna ganancia sobre el modelo base (72% en ambos) y repite un error de sintaxis con claves de expresión JSONB sin paréntesis.
- Recompensa basada en el coste estimado del planificador, no en latencia medida. El modelo de costes de PostgreSQL puede equivocarse con datos sesgados, de modo que una propuesta con buena puntuación puede no mejorar el tiempo real.
- Solo índices B-tree: no cubre HNSW/vectorial ni tuning de Elasticsearch.
- Riesgo de alucinación en nombres de tablas, columnas o índices, y de generar DDL válido sintácticamente pero semánticamente incorrecto. El autor recomienda revisar siempre el índice antes de ejecutarlo en una base real.
- Degradación severa en float16: el modelo base responde `NO INDEX` de forma sistemática, lo que puede pasar desapercibido como "abstención correcta" en una evaluación mal diseñada.
- Idioma: únicamente inglés; no hay soporte documentado de castellano ni de otros idiomas.
- Licencia apache-2.0, que permite uso comercial, pero la ausencia de garantías y el estado de "research / learning release" hacen desaconsejable aplicarlo sin supervisión humana en producción.
- Sin métricas de sesgo publicadas; al operar sobre esquemas y consultas, el riesgo relevante es de corrección técnica más que social.
- Ecosistema mínimo: 0 descargas y 0 likes en el momento de la consulta, sin integraciones publicadas para motores de serving.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/krishna382nitjsr/index-drift-rl-qwen1.5b-grpo-v0.1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Repositorio de código: https://github.com/Krishnaghimire/index-drift-rl
- Dataset de benchmark: https://huggingface.co/datasets/krishna382nitjsr/index-drift-rl-bench
- Detalle del entrenamiento: https://github.com/Krishnaghimire/index-drift-rl/blob/main/docs/results/training_run1.md
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; las consultas devolvieron únicamente páginas del servicio de streaming DAZN, sin relación con este modelo.
