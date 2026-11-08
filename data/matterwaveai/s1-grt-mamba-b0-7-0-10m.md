# MatterWaveAI/s1-grt-mamba-b0.7.0-10m

## Resumen

S1-GRT-Mamba-b0.7.0-10m es un modelo compacto de clasificación de texto publicado por MatterWaveAI, construido sobre el modelo base grt-mamba-b0.7.0-10m de la misma organización. Se presenta como un "world-model judge" de streaming con memoria constante, orientado a la evaluación de seguridad de agentes, el enrutamiento de acciones mediante control predictivo (MPC) y la verificación de telemetría de largo horizonte. No es un modelo generativo de propósito general, sino un clasificador especializado que emite veredictos del tipo APPROVE / REJECT / ESCALATE sobre acciones y estados de agentes.

La arquitectura se basa en un state-space model (SSM) rotacional de tipo Mamba, con aproximadamente 13,8 millones de parámetros almacenados y una capacidad densa equivalente declarada de unos 34 millones. Su rasgo diferencial es que mantiene un estado recurrente ortogonal de tamaño fijo (1,5 KB) que se actualiza en tiempo O(1) por evento, sin caché KV en ningún momento, lo que permite monitorizar flujos de eventos de longitud arbitraria (de 128 a más de 8.192 pasos) con memoria y coste computacional constantes.

El modelo resulta relevante para quienes trabajan en guardrails de agentes y sistemas de control en el borde, porque propone un enfoque de juicio latente de una sola pasada con lookahead MPC, en lugar de depender de un LLM generativo grande para cada verificación. La versión publicada es una "preview card" de la release b0.7.0: los pesos, los detalles de implementación y el código fuente están retenidos durante un ciclo de liberación por etapas, según indica el autor, para evitar la evasión del guardrail por caja blanca.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | State-space model (SSM) rotacional tipo Mamba, sin matrices lineales densas ni capas convolucionales 1D/2D |
| Parametros totales | ~13,8 M almacenados (~34 M de capacidad densa equivalente) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | streaming sin límite fijo; verificado de T=128 a T=8.192+ pasos con estado recurrente de tamaño constante |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (pesos retenidos en la release preview) |

## Arquitectura y entrenamiento

El modelo es un SSM rotacional (rotational SSM) de la familia Mamba, sin capas de atención clásicas, sin matrices lineales densas y sin convoluciones 1D/2D. En lugar de una caché KV, mantiene un estado recurrente ortogonal de 1,5 KB que se actualiza en O(1) de cómputo y memoria por evento. El autor declara estabilidad unitaria de largo horizonte: la deriva de magnitud del estado homogéneo es inferior a 5,0e-7 en más de 1.000 pasos, y de 9,55e-15 a T=8.192 en float64, con determinante +1,000000. Incorpora un mecanismo de lookahead MPC latente que simula acciones candidatas del agente en paralelo desde el estado recurrente vivo antes de emitir el veredicto, con invariancia al orden de opciones del 100%.

No se han publicado detalles sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se emplearon RLHF, DPO u otras técnicas de alineación. La model card menciona verificación sobre conjuntos held-out denominados XL-smol, con 12.003 registros y 29.609 preguntas para la suite de rollout y MPC, y 17.130 registros y 44.287 preguntas para la evaluación consolidada de 12 dominios, pero no describe el proceso de entrenamiento que los produjo.

## Capacidades

- Clasificación de texto orientada a juicio de seguridad de agentes, con veredictos APPROVE / REJECT / ESCALATE.
- Verificación de rollout relacional multi-hop (2 a 3 saltos) sobre estados latentes.
- Verificación de sentido común causal y físico (ciencia causal).
- Verificación factual de un solo salto contra un world model.
- Verificación socrática y epistémica en cuatro modos (SEE / SAY / DO / KNOW).
- Inducción de reglas sobre rejillas visuales-espaciales 2D (evaluado sobre ARC-AGI-2 XL-smol).
- Enrutamiento de acciones de agente con lookahead MPC de horizonte H=1..2, incluyendo defensa frente a deriva y prompt injection.
- Seguimiento de estado cíclico de largo horizonte (T=64..8.192) en modo streaming.
- Calibración epistémica y abstención.
- Verificación de terminación de bucles de programa.
- Seguimiento de transiciones de estado simbólico.
- Verificación booleana formal y de tablas de verdad.
- Planificación de recursos y concurrencia.
- No se documentan capacidades de generación de texto libre, tool calling genérico, visión, audio ni multilingüismo.

## Casos de uso

- Guardrail de agentes en producción: el modelo consume la telemetría del agente evento a evento con estado recurrente de 1,5 KB y emite APPROVE / REJECT / ESCALATE sin acumular caché KV, lo que permite monitorizar sesiones de duración arbitraria en CPU o NPU de borde.
- Defensa frente a prompt injection y deriva de comportamiento: el lookahead MPC evalúa acciones candidatas antes de ejecutarlas y bloquea rutas que se desvían del contrato del agente, con invariancia al orden de opciones del 100%.
- Verificación de cadenas de razonamiento multi-hop: útil para validar planes de agentes que encadenan 2 o 3 saltos relacionales antes de actuar, con una precisión top-1 declarada del 84,20% en el conjunto XL-smol.
- Comprobación de consistencia física y causal: para agentes que operan en dominios científicos o de simulación, el modelo verifica que las conclusiones respeten sentido común causal (93,50% top-1 en XL-smol).
- Inducción de reglas en entornos de rejilla: aplicable a agentes que resuelven tareas tipo ARC-AGI-2, donde el modelo verifica la regla inducida sobre una rejilla 2D con 55,50% top-1 y 80,50% pass@2.
- Monitorización de telemetría de largo horizonte: seguimiento de estado cíclico en flujos de hasta 8.192 pasos con 94,20% top-1, adecuado para sistemas de control industrial o robótica que generan eventos continuos.
- Verificación de terminación en pipelines de código: el modelo comprueba si un bucle de programa terminará (68,00% top-1 en XL-smol), útil como paso previo a la ejecución de código generado por agentes.
- Calibración y abstención en sistemas de decisión: con error de calibración (ECE) entre 0,0542 y 0,2152 según dominio, permite umbralizar la confianza y derivar casos dudosos a revisión humana.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre conjuntos held-out XL-smol:

| Suite | Registros | Preguntas | Top-1 | pass@2 | Consistencia de orden |
|---|---|---|---|---|---|
| Rollout relacional multi-hop (2..3 saltos) | 2.500 | 5.000 | 84,20% | 93,80% | 100,0% |
| Ciencia causal y sentido común físico | 2.500 | 5.000 | 93,50% | 96,50% | 100,0% |
| Verificación factual de un salto | 2.500 | 5.000 | 84,00% | 95,40% | 100,0% |
| Verificación socrática 4 modos | 2.500 | 5.000 | 64,60% | 91,20% | 100,0% |
| Inducción de reglas en rejilla 2D (ARC-AGI-2) | 1.200 | 3.600 | 55,50% | 80,50% | 100,0% |
| Enrutamiento MPC, deriva y prompt injection | 803 | 2.409 | 60,55% | 63,03% | 100,0% |
| Seguimiento de estado cíclico (T=64..8.192) | streaming | 8.192 pasos | 94,20% | 98,40% | 100,0% |
| Agregado 6 suites (macro / micro) | 12.003 | 26.009 | 73,73% / 76,85% | 88,21% | 100,0% |

Evaluación consolidada de 12 dominios (17.130 registros, 44.287 preguntas), con precisión macro agregada del 71,13% y micro del 73,68%:

| Dominio | Top-1 | ECE |
|---|---|---|
| Rollout relacional multi-hop | 84,20% | 0,1084 |
| Ciencia causal y sentido común | 93,50% | 0,0542 |
| Verificación factual de un salto | 84,00% | 0,0768 |
| Verificación socrática 4 modos | 64,60% | 0,1190 |
| Inducción de reglas en rejilla 2D | 55,50% | 0,1380 |
| Enrutamiento MPC y deriva | 60,55% | 0,2152 |
| Calibración epistémica y abstención | 71,25% | 0,0890 |
| Terminación de bucles de programa | 68,00% | 0,0985 |
| Transiciones de estado simbólico | 66,67% | 0,0960 |
| Grafo de conocimiento de prerequisitos v5 | 67,45% | 0,0954 |
| Planificación de recursos y concurrencia | 65,00% | 0,1020 |
| Verificación booleana y tablas de verdad | 62,80% | 0,1140 |

No se han publicado comparaciones con modelos de terceros en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con ~13,8 M parámetros almacenados, en fp16 el peso ocuparía del orden de 28 MB, y en fp32 unos 55 MB, pero no se confirman formatos ni cuantizaciones soportadas.
- Estado recurrente: 1,5 KB fijos por flujo, independientemente de la longitud del stream; sin caché KV.
- GPU recomendadas: no disponible. El diseño apunta a CPU y NPU de borde, pero no se publican requisitos mínimos.
- Cabe en GPU de consumo: previsiblemente sí por tamaño de pesos, aunque no hay confirmación oficial ni lista de GPUs validadas.
- Opciones de despliegue: la librería declarada es transformers; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. El autor afirma O(1) de cómputo y memoria por evento, pero no publica cifras de latencia absoluta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| S1-GRT-Mamba-b0.7.0-10m | ~13,8 M (34 M denso equivalente) | Streaming sin límite fijo | SSM rotacional, juicio MPC | Apache 2.0 | Pesos retenidos en preview |
| MatterWaveAI/s1-grt-mamba | no disponible | no disponible | SSM rotacional, familia S1-GRT-Mamba | no disponible | no disponible |
| MatterWaveAI/helmholtz-s1-mamba-b0.7.0-20m | ~20 M (según nombre) | no disponible | SSM Mamba, clasificación de texto | no disponible | no disponible |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Pesos, implementación y código fuente retenidos: la model card indica que se ocultan durante el ciclo de liberación por etapas, por lo que el modelo no es desplegable a partir del repositorio en su estado actual.
- Precisión modesta en varias tareas: enrutamiento MPC (60,55%), verificación socrática (64,60%) y verificación booleana (62,80%) dejan margen amplio de error; no es adecuado como único mecanismo de decisión en producción.
- Calibración irregular: el ECE del enrutamiento MPC es 0,2152, lo que implica una confianza mal calibrada en ese dominio; conviene umbralizar y combinar con revisión humana.
- Dominio estrecho: el modelo está diseñado para juicio de seguridad y verificación de agentes, no para generación de texto, código, matemáticas o conversación general.
- Idiomas no declarados: no se especifica cobertura multilingüe; se desconoce el comportamiento fuera del inglés.
- Riesgo de alucinación: al ser un clasificador, el riesgo se traslada a falsos APPROVE sobre acciones peligrosas; la defensa frente a prompt injection declarada (60,55% top-1) no es suficiente por sí sola.
- Sesgos: no se documentan análisis de sesgo ni composición del dataset de entrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero al no publicarse pesos ni código, la aplicabilidad práctica de la licencia queda condicionada a la liberación efectiva del modelo.
- Ausencia de benchmarks independientes: todas las cifras proceden del autor y no se han verificado externamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MatterWaveAI/s1-grt-mamba-b0.7.0-10m
- Modelo base: https://huggingface.co/MatterWaveAI/grt-mamba-b0.7.0-10m
- Familia S1-GRT-Mamba: https://huggingface.co/MatterWaveAI/s1-grt-mamba
- Modelo relacionado Helmholtz S1 Mamba 20M: https://huggingface.co/MatterWaveAI/helmholtz-s1-mamba-b0.7.0-20m
