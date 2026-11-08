# MatterWaveAI/s1-grt-mamba-b0.7.0-20m

## Resumen

S1-GRT-Mamba-b0.7.0-20m es un modelo compacto de clasificación de texto desarrollado por MatterWaveAI, construido sobre la arquitectura GRT-Mamba (un modelo de espacio de estados rotacional). Se presenta como un "juez" de modelo del mundo para agentes, un enrutador de acciones basado en control predictivo de modelos (MPC) y una barrera de seguridad para telemetría de largo horizonte. Con aproximadamente 26,4 millones de parámetros almacenados (y una capacidad densa equivalente declarada de unos 66 millones), está diseñado para operar en streaming con memoria constante.

La propuesta central del modelo es su eficiencia en inferencia de flujo continuo: mantiene un estado recurrente ortogonal de tamaño fijo (2,25 KB) que se actualiza con coste O(1) en cómputo y memoria por evento, sin caché KV en ningún punto. Esto lo hace adecuado para monitorización en tiempo real de agentes en CPU y NPU de borde, sin necesidad de re-codificar el historial.

Es relevante ahora por su enfoque en seguridad de agentes: puede simular acciones candidatas hacia adelante desde el estado recurrente vivo y emitir veredictos de aprobación, rechazo o escalado. No obstante, el autor retiene los pesos, los detalles de implementación y el código fuente durante un ciclo de publicación por fases, por lo que la reproducibilidad y el uso práctico quedan limitados de momento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GRT-Mamba (state-space model rotacional, SSM) |
| Parametros totales | ~26,4M almacenados (~66M de capacidad densa equivalente) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 8.192+ pasos en streaming (sin caché KV) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (pesos retenidos según la model card) |

## Arquitectura y entrenamiento

El modelo se basa en un SSM rotacional (GRT-Mamba) con estado recurrente ortogonal de magnitud homogénea, lo que garantiza estabilidad a largo plazo: la deriva de magnitud del estado es inferior a 5,0e-7 en más de 1.000 pasos y de 9,55e-15 a T = 8.192 en float64. No emplea matrices lineales densas ni capas convolucionales 1D/2D, y prescinde por completo de caché KV, actualizando el estado con coste O(1) por evento. Incorpora un mecanismo de "latent MPC lookahead" que simula acciones candidatas en paralelo desde el estado vivo antes de emitir un veredicto, con invariancia total al orden de opciones (100%).

Los datos de entrenamiento no se detallan en la información disponible (número de tokens, composición del dataset, uso de RLHF/DPO). La model card menciona verificación sobre conjuntos held-out denominados "XL-smol", con 12.003 registros y 29.609 preguntas para la suite de rollout y enrutamiento MPC, y 17.130 registros y 44.287 preguntas para la evaluación consolidada de 12 dominios. Los pesos, la implementación y el código fuente están retenidos durante el ciclo de publicación por fases, según indica el autor, para prevenir la evasión de la barrera de seguridad en caja blanca.

## Capacidades

- Clasificación de texto y verificación de juicios sobre estados del mundo (world-model judge).
- Seguimiento de estado en streaming de largo horizonte (T = 64 a 8.192+) con memoria constante.
- Verificación de rollouts relacionales multi-hop (2 a 3 saltos).
- Verificación causal y de sentido común físico.
- Verificación factual de un solo salto.
- Verificación socrática y epistémica en 4 modos (SEE/SAY/DO/KNOW).
- Inducción de reglas en rejillas visual-espaciales 2D (estilo ARC-AGI-2).
- Enrutamiento de acciones de agente con control predictivo de modelos (MPC), detección de deriva y defensa ante inyección de prompts.
- Calibración epistémica y abstención.
- Verificación de terminación de bucles de programa y transiciones de estado simbólicas.
- Verificación booleana formal y de tablas de verdad.
- Planificación de recursos y concurrencia.
- Soporte de tool calling / function calling: no disponible.
- Capacidades multilingües: no disponible.

## Casos de uso

- Monitorización en tiempo real de agentes autónomos: el modelo mantiene un estado recurrente de 2,25 KB y actualiza con coste O(1) por evento, lo que permite vigilar flujos de telemetría continuos en CPU de borde sin re-procesar el historial.
- Barrera de seguridad ante inyección de prompts: al simular acciones candidatas con lookahead H = 1..2 y emitir APPROVE/REJECT/ESCALATE, puede interponerse entre el planificador de un agente y la ejecución de acciones sensibles.
- Enrutamiento de acciones con MPC: dado un estado vivo del agente, evalúa en paralelo varias acciones candidatas y selecciona o descarta según el veredicto del juez, útil en sistemas de control de agentes con múltiples opciones por paso.
- Verificación de razonamiento multi-hop en pipelines de QA: con una precisión top-1 del 90,40% en rollouts relacionales de 2 a 3 saltos, sirve como filtro de respuestas en sistemas de pregunta-respuesta sobre grafos de conocimiento.
- Detección de deriva en agentes de larga duración: el seguimiento de estado cíclico hasta 8.192 pasos con 96,40% de precisión permite alertar cuando la trayectoria del agente se desvía del estado esperado.
- Verificación de terminación de programas generados: con un 71,33% de precisión en la suite de terminación de bucles, puede usarse como comprobador previo a la ejecución de código generado por un LLM en entornos de CI.
- Inducción de reglas en tareas de razonamiento abstracto: con 56,17% top-1 y 81,33% pass@2 en la suite ARC-AGI-2 XL-smol, es aplicable como componente de exploración en problemas de inducción de reglas sobre rejillas.

## Benchmarks y rendimiento

| Suite XL-smol | Registros held-out | Preguntas | Top-1 | pass@2 | Consistencia de orden |
|---|---:|---:|---:|---:|---:|
| Rollout relacional multi-hop (2..3 saltos) | 2.500 | 5.000 | 90,40% | 96,10% | 100,0% |
| Ciencia causal y sentido común físico | 2.500 | 5.000 | 95,30% | 98,80% | 100,0% |
| Verificación factual de un salto | 2.500 | 5.000 | 86,80% | 93,10% | 100,0% |
| Verificación socrática 4 modos | 2.500 | 5.000 | 64,20% | 92,80% | 100,0% |
| Inducción de reglas en rejilla 2D (ARC-AGI-2) | 1.200 | 3.600 (7.200 total) | 56,17% | 81,33% | 100,0% |
| Enrutamiento MPC, deriva e inyección | 803 | 2.409 | 66,75% | 71,96% | 100,0% |
| Seguimiento de estado cíclico (T = 64..8.192) | streaming | 8.192 pasos | 96,40% | 99,10% | 100,0% |
| Agregado 6 suites (macro/micro) | 12.003 | 26.009 (29.609 total) | 76,60% / 79,19% | 89,87% | 100,0% |

Evaluación consolidada de 12 dominios (17.130 registros, 44.287 preguntas): precisión macro del 73,34% y micro del 75,94%. El error de calibración (ECE) oscila entre 0,0398 (ciencia causal) y 0,1972 (enrutamiento MPC).

| Dominio (12 familias) | Registros | Preguntas | Precisión | ECE |
|---|---:|---:|---:|---:|
| Rollouts relacionales multi-hop | 2.500 | 5.000 | 90,40% | 0,0918 |
| Ciencia causal y sentido común | 2.500 | 5.000 | 95,30% | 0,0398 |
| Verificación factual de un salto | 2.500 | 5.000 | 86,80% | 0,0582 |
| Verificación socrática 4 modos | 2.500 | 5.000 | 64,20% | 0,1012 |
| Inducción de reglas 2D (ARC-AGI-2) | 1.200 | 3.600 | 56,17% | 0,1154 |
| Enrutamiento MPC y deriva | 803 | 2.409 | 66,75% | 0,1972 |
| Calibración epistémica y abstención | 80 | 160 | 75,00% | 0,0890 |
| Terminación de bucles de programa | 150 | 600 | 71,33% | 0,0985 |
| Transiciones de estado simbólicas | 60 | 180 | 70,00% | 0,0960 |
| Grafo de prerrequisitos (v5) | 2.777 | 7.558 | 70,18% | 0,0954 |
| Planificación de recursos y concurrencia | 60 | 180 | 68,33% | 0,1020 |
| Verificación booleana formal | 2.000 | 6.000 | 65,60% | 0,1140 |

## Requisitos de hardware

- Almacenamiento de pesos: ~26,4M parámetros; en fp32 suponen unos 105 MB y en fp16 unos 53 MB (estimación a partir del recuento de parámetros; no se especifican cuantizaciones oficiales).
- VRAM estimada para inferencia: muy reducida, compatible con GPU de consumo y con ejecución en CPU/NPU de borde; el autor destaca monitorización en tiempo real en CPU y NPU.
- Memoria de estado: 2,25 KB fijos por flujo, sin caché KV en ningún punto de la secuencia.
- GPU recomendadas: no disponible (el modelo está orientado a borde y CPU; no se publican recomendaciones de GPU).
- Cabe en GPU de consumo: sí, por tamaño (cualquier GPU con más de ~1 GB de VRAM libre sería suficiente en fp32; no verificado oficialmente).
- Opciones de despliegue: biblioteca `transformers` (según `library_name`); vLLM, llama.cpp, Ollama o TGI no están confirmados en la información disponible.
- Latencia y throughput: coste O(1) por evento según el autor; no se publican cifras absolutas de latencia ni tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| S1-GRT-Mamba-b0.7.0-20m | ~26,4M | 8.192+ pasos en streaming | Clasificación / juez de agente | Apache 2.0 | Pesos retenidos según model card |
| MatterWaveAI/grt-mamba-b0.7.0-20m | no disponible | no disponible | Modelo base | no disponible | Público en HF |
| MatterWaveAI/helmholtz-mamba-b0.7.0-20m | no disponible | no disponible | Generación de texto | no disponible | Público en HF |
| MatterWaveAI/s1-grt-mamba | no disponible | no disponible | Clasificación de texto | no disponible | Público en HF |

No se dispone de datos de benchmarks comparables de estos modelos alternativos en la información proporcionada.

## Limitaciones y advertencias

- Pesos, implementación y código fuente retenidos: la model card indica que se ocultan durante el ciclo de publicación por fases, lo que impide verificar o reproducir los resultados de forma independiente.
- Los benchmarks son autoinformados por el autor sobre conjuntos "XL-smol" propios; no hay validación externa.
- Precisión limitada en varias tareas: 56,17% en inducción de reglas 2D, 64,20% en verificación socrática y 66,75% en enrutamiento MPC, lo que exige umbrales de confianza y revisión humana en producción.
- Calibración deficiente en enrutamiento MPC (ECE 0,1972): las probabilidades emitidas no son fiables como señal de confianza directa en ese dominio.
- Idiomas soportados no declarados; no hay evidencia de capacidades multilingües.
- No se documentan sesgos conocidos ni tasas de alucinación; al ser un clasificador/juez, el riesgo se traslada a falsos aprobados o rechazados en la barrera de seguridad.
- Licencia Apache 2.0 permite uso comercial, pero la retención de pesos limita de facto el despliegue.
- Sin soporte confirmado de tool calling, agentes conversacionales ni generación de texto libre; el uso previsto es clasificación y verificación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MatterWaveAI/s1-grt-mamba-b0.7.0-20m
- Modelo base: https://huggingface.co/MatterWaveAI/grt-mamba-b0.7.0-20m
- Familia S1-GRT-Mamba: https://huggingface.co/MatterWaveAI/s1-grt-mamba
- Modelo relacionado: https://huggingface.co/MatterWaveAI/helmholtz-mamba-b0.7.0-20m
