# MatterWaveAI/helmholtz-s1-mamba-b0.7.0-20m

## Resumen

HELMHOLTZ-S1-Mamba-b0.7.0-20m es un modelo de clasificación de texto y verificación de estado desarrollado por MatterWaveAI, construido sobre el modelo base `MatterWaveAI/helmholtz-mamba-b0.7.0-20m`. Se presenta como un juez de world-model compacto con memoria constante O(1), orientado a la seguridad de agentes, el enrutamiento de acciones mediante control predictivo (MPC) y la verificación de telemetría de largo horizonte. Su rasgo distintivo es que opera como un SSM rotacional selectivo sin matrices lineales densas ni capas convolucionales, manteniendo un estado recurrente ortogonal fijo de 2,25 KB que se actualiza con coste O(1) por evento.

El modelo almacena unos 26,4 millones de parámetros (~66M de capacidad densa equivalente) y está pensado para monitorización continua de agentes en tiempo real sobre CPUs y NPUs de edge, sin necesidad de re-codificar el historial. La ficha del autor es una nota de previsualización (`b0.7.0`): los pesos, los detalles de implementación y el código fuente se retienen durante el ciclo de publicación escalonada, lo que limita seriamente su reproducibilidad. Por tanto, esta ficha recoge únicamente lo que el autor declara en su model card, que incluye resultados de benchmarks internos no verificables de forma independiente.

La relevancia actual del modelo radica en su propuesta arquitectónica: un juez de streaming con coste de memoria nulo en contexto largo (de 128 a más de 8.192 pasos) y estabilidad numérica unitaria declarada (`det = +1.000000`), aplicado a tareas de aprobación, rechazo o escalado de acciones de agentes. No obstante, la ausencia de pesos públicos y de validación externa exige tratar sus cifras como declaraciones del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SSM rotacional selectivo (S1-GRT-Mamba), JEPA latente, sin matrices lineales densas ni capas convolucionales 1D/2D |
| Parametros totales | ~26,4M almacenados (~66M de capacidad densa equivalente) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 a 8.192+ pasos en streaming (memoria O(1) independiente de T) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (pesos retenidos durante el ciclo de publicación) |

## Arquitectura y entrenamiento

El modelo se basa en una arquitectura de espacio de estados (SSM) selectiva y rotacional, etiquetada por el autor como S1-GRT-Mamba. A diferencia de un transformer, no emplea matrices lineales densas ni capas convolucionales, y sustituye la caché KV por un estado recurrente ortogonal de tamaño fijo (2,25 KB) que se actualiza con coste O(1) en cómputo y memoria por evento. El autor declara una estabilidad unitaria de largo horizonte: la deriva de magnitud del estado homogéneo es inferior a 5,0e-7 a lo largo de más de 1.000 pasos (9,55e-15 a T = 8.192 en float64). El componente JEPA (joint-embedding predictive architecture) se usa para simular en el espacio latente las acciones candidatas de un agente antes de emitir un veredicto.

No se dispone de datos sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El autor menciona una evaluación "XL-smol" sobre conjuntos retenidos, pero no publica la metodología de entrenamiento ni los hiperparámetros. La innovación técnica declarada es la capacidad de "lookahead" MPC en una sola pasada, simulando en paralelo acciones candidatas desde el estado recurrente vivo, con invariancia al orden de las opciones del 100 %. Toda esta información procede exclusivamente de la model card y no ha sido verificada de forma independiente.

## Capacidades

- Verificación de rollouts relacionales multihop (2 a 3 saltos) en el espacio latente.
- Verificación factual de un solo salto y de sentido común físico y científico causal.
- Verificación socrática y epistémica en cuatro modos (SEE/SAY/DO/KNOW).
- Inducción de reglas sobre rejillas visuales-espaciales 2D (suite ARC-AGI-2 XL-smol).
- Enrutamiento de acciones de agentes con control predictivo (MPC) y defensa frente a deriva y prompt injection, emitiendo veredictos APPROVE/REJECT/ESCALATE.
- Seguimiento de estado cíclico de largo horizonte (T = 64 a 8.192) sin caché KV.
- Calibración epistémica y abstención.
- Verificación de terminación de bucles de programa y transiciones de estado simbólicas.
- Planificación de recursos y concurrencia.
- Verificación booleana formal y de tablas de verdad.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; la model card no declara idiomas.
- Modo de razonamiento (thinking), visión o audio: no disponibles.

## Casos de uso

- Guardrail de agentes en producción: el modelo evalúa cada acción propuesta por un agente y emite APPROVE, REJECT o ESCALATE con un estado recurrente de 2,25 KB, lo que permite monitorización continua sin re-codificar el historial y con coste de memoria constante en sesiones muy largas.
- Defensa frente a prompt injection y deriva de comportamiento: el enrutamiento MPC con lookahead H = 1..2 simula las acciones candidatas antes de aprobarlas, adecuado para pipelines de agentes expuestos a entradas no confiables.
- Verificación de telemetría de largo horizonte: seguimiento de estado cíclico hasta 8.192 pasos con cero bytes de caché KV, útil para auditar secuencias de eventos continuas en sistemas de control.
- Validación de planes de programación y terminación de bucles: la suite de verificación de terminación de programa (74 % de precisión declarada) permite integrar el modelo como comprobador previo en pipelines de CI/CD que generan código automáticamente.
- Inducción de reglas sobre rejillas 2D: aplicable a tareas de razonamiento visual-espacial tipo ARC-AGI-2, por ejemplo en entornos de simulación o juegos con reglas latentes.
- Calibración y abstención en sistemas de QA: el modelo declara métricas de calibración epistémica y puede usarse para decidir cuándo un agente debe abstenerse en lugar de responder.
- Planificación de recursos y concurrencia: verificación de asignaciones y conflictos en orquestadores de tareas, aunque con precisión declarada moderada (71,67 %).
- Verificación booleana formal: comprobación de tablas de verdad y expresiones lógicas en herramientas de análisis estático, con precisión declarada del 68,45 %.

## Benchmarks y rendimiento

Los datos siguientes proceden exclusivamente de la model card del autor y no han sido verificados de forma independiente. Se presentan dos suites: una de verificación y enrutamiento MPC (5.003 registros retenidos, 12.809 preguntas) y una evaluación consolidada de 12 dominios (10.130 registros, 27.487 preguntas).

| Suite de evaluacion XL-smol | Registros (n) | Preguntas | Top-1 | pass@2 | Consistencia de orden |
|---|---|---|---|---|---|
| Rollout relacional multihop (2..3 saltos) | 1.000 | 2.000 | 100,00 % | 100,00 % | 100,0 % |
| Ciencia causal y sentido comun fisico | 1.000 | 2.000 | 100,00 % | 100,00 % | 100,0 % |
| Verificacion factual de un salto | 1.000 | 2.000 | 100,00 % | 100,00 % | 100,0 % |
| Verificacion socratica 4 modos | 1.000 | 2.000 | 100,00 % | 100,00 % | 100,0 % |
| Induccion de reglas en rejilla 2D (ARC-AGI-2) | 600 | 1.800 core | 100,00 % | 100,00 % | 100,0 % |
| Enrutamiento MPC, deriva y prompt injection | 403 | 1.209 | 99,75 % | 100,00 % | 100,0 % |
| Seguimiento de estado ciclico (T = 64..8.192) | Streaming | 8.192 pasos | 100,00 % | 100,00 % | 100,0 % |
| Agregado 6 suites (macro / micro) | 5.003 | 11.009 core | 99,96 % / 99,98 % | 100,00 % | 100,0 % |

| Dominio (12 familias) | Registros (n) | Precision primaria | Precision core | ECE |
|---|---|---|---|---|
| Rollout relacional multihop | 1.000 | 100,00 % | 100,00 % | 0,0883 |
| Ciencia causal y sentido comun | 1.000 | 100,00 % | 100,00 % | 0,0206 |
| Verificacion factual de un salto | 1.000 | 100,00 % | 100,00 % | 0,0190 |
| Verificacion socratica 4 modos | 1.000 | 100,00 % | 100,00 % | 0,00002 |
| Rejilla 2D ARC-AGI-2 | 600 | 100,00 % | 71,78 % (98,44 % eleccion) | 0,0035 |
| Enrutamiento MPC y deriva | 403 | 99,75 % | 66,67 % | 0,2904 |
| Calibracion epistemica y abstencion | 80 | 78,12 % | 78,12 % | 0,0764 |
| Terminacion de bucles de programa | 150 | 74,00 % | 74,00 % | 0,0915 |
| Transiciones de estado simbólicas | 60 | 73,33 % | 73,33 % | 0,0890 |
| Grafo de conocimiento de prerrequisitos (v5) | 2.777 | 72,85 % | 72,85 % | 0,0881 |
| Planificacion de recursos y concurrencia | 60 | 71,67 % | 71,67 % | 0,0940 |
| Verificacion booleana y tablas de verdad | 2.000 | 68,45 % | 68,45 % | 0,1042 |
| Agregado 12 dominios | 10.130 | 86,51 % macro | 79,97 % micro (78,21 % total) | 0,0804 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el autor no publica requisitos de memoria ni formatos de pesos. Con ~26,4M parámetros, la huella teórica en fp16 rondaría los 53 MB, pero no se confirma ni se detalla.
- GPU recomendadas: no disponible. El autor orienta el modelo a CPUs y NPUs de edge por su coste O(1) por evento.
- Cabe en GPU consumer: previsiblemente sí por tamaño, pero no hay confirmación ni instrucciones de despliegue.
- Opciones de despliegue: la model card declara compatibilidad con `transformers` y con endpoints, pero no se publican pesos ni scripts de inferencia.
- Latencia y throughput: no disponibles. El autor declara coste O(1) por evento y estado de 2,25 KB, sin cifras de latencia medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Pesos publicos | Enfoque |
|---|---|---|---|---|---|
| HELMHOLTZ-S1-Mamba-b0.7.0-20m | ~26,4M (66M denso equivalente) | 128 a 8.192+ pasos, O(1) | Apache 2.0 | Retenidos (no publicados) | SSM rotacional, juez MPC de agentes |
| MatterWaveAI/helmholtz-mamba-1 | no disponible | no disponible | no disponible | Parcial (modelo base) | Rotational-SSM, JEPA world model, juez de trayectoria O(1) |
| MatterWaveAI/helmholtz-1-omni | no disponible | no disponible | Apache 2.0 | Parcial | Any-to-any multimodal, JEPA, rotational transformer |
| Modelos de clasificacion de texto de ~20M (familia BERT/mini) | ~20M | 512 tokens tipicos | Variable | Si | Transformer encoder denso |

La comparativa directa con modelos de clasificación de texto convencionales es limitada: HELMHOLTZ-S1-Mamba no se orienta a clasificación de texto genérica, sino a verificación de estado y enrutamiento de agentes. Los modelos emparentados del mismo autor (helmholtz-mamba-1 y helmholtz-1-omni) comparten el enfoque rotacional-SSM/JEPA, pero no hay datos públicos suficientes para comparar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Pesos no publicados: la model card indica explícitamente que pesos, detalles de implementación y código fuente se retienen durante el ciclo de publicación escalonada, por lo que el modelo no es reproducible ni auditable de forma independiente.
- Benchmarks no verificados: todas las cifras de rendimiento proceden del autor y no hay evaluación externa ni comparación con terceros; las precisiones del 100 % en múltiples suites deben tratarse con cautela.
- Sesgos conocidos: no disponibles; el autor no documenta sesgos de datos ni de dominio.
- Riesgo de alucinación: no evaluado en la información proporcionada; el modelo se presenta como verificador, no como generador, pero no hay evidencia independiente sobre falsos positivos en producción.
- Idiomas: no declarados; no se puede asumir soporte multilingüe.
- Calibración desigual: los ECE declarados varían de 0,00002 a 0,2904 según el dominio, lo que sugiere una fiabilidad muy heterogénea entre tareas.
- Precisión moderada en varios dominios: verificación booleana (68,45 %), planificación de recursos (71,67 %), grafos de prerrequisitos (72,85 %) y terminación de bucles (74,00 %) están lejos de ser fiables como guardrail único.
- Licencia Apache 2.0: permite uso comercial, pero la ausencia de pesos y de detalles de implementación impide ejercer ese derecho en la práctica.
- Caveat de producción: no debe desplegarse como guardrail de seguridad sin validación propia sobre el dominio objetivo, dado que el autor no publica la metodología de entrenamiento ni los conjuntos de evaluación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MatterWaveAI/helmholtz-s1-mamba-b0.7.0-20m
- Modelo base: https://huggingface.co/MatterWaveAI/helmholtz-mamba-b0.7.0-20m
- Familia S1-GRT-Mamba: https://huggingface.co/MatterWaveAI/s1-grt-mamba
- HELMHOLTZ-Mamba-1: https://huggingface.co/MatterWaveAI/helmholtz-mamba-1
- HELMHOLTZ-1-Omni: https://huggingface.co/MatterWaveAI/helmholtz-1-omni
- Paper referenciado en helmholtz-1-omni: arxiv:2610.39302 (sin verificar)
