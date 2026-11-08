# MatterWaveAI/helmholtz-s1-mamba-b0.7.0-10m

## Resumen

`HELMHOLTZ-S1-Mamba-b0.7.0-10m` es un modelo de clasificación de texto desarrollado por MatterWaveAI, presentado como el escalón de 10M de la familia `S1-GRT-Mamba`. Se describe como un juez de world-model en streaming con memoria constante O(1), un router de acciones para control predictivo de modelos (MPC) y un guardrail de telemetría de largo horizonte. Está construido sobre `MatterWaveAI/helmholtz-mamba-b0.7.0-10m` y se distribuye con licencia Apache 2.0 a través de Hugging Face.

La propuesta técnica es poco convencional: el autor afirma que el modelo carece de matrices lineales densas y de capas convolucionales 1D/2D, y que no requiere caché KV en ningún horizonte de streaming (de T=128 a más de 8.192 pasos). En su lugar mantiene un estado recurrente ortogonal de tamaño fijo (1,5 KB) que se actualiza con coste O(1) por evento, lo que permitiría monitorización en tiempo real sobre CPUs y NPUs de borde sin re-codificar el historial.

El modelo se publica como vista previa (`b0.7.0`) dentro de un ciclo de liberación por etapas. La model card indica explícitamente que los pesos, los detalles de implementación y el código fuente se retienen durante ese ciclo para evitar la evasión de guardrails por caja blanca, lo que limita seriamente su reproducibilidad y su uso directo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | State-space model (SSM) selectivo rotacional, descrito como `S1-GRT-Mamba` / JEPA world model recurrente |
| Parametros totales | ~13,8M almacenados (~34M de capacidad densa equivalente, según el autor) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Streaming sin límite fijo declarado; evaluado de T=128 a T=8.192+ con estado recurrente de tamaño constante |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (el autor indica que los pesos se retienen en esta fase) |

## Arquitectura y entrenamiento

La arquitectura se describe como un modelo de espacio de estados (SSM) selectivo con dinámica rotacional, integrado en un marco JEPA (Joint Embedding Predictive Architecture) de world model. El autor afirma que no contiene matrices lineales densas ni convoluciones 1D/2D, y que sustituye la caché KV por un estado recurrente ortogonal de 1,5 KB con determinante unitario (`det = +1.000000`). Según la model card, la magnitud del estado deriva menos de 5,0e-7 en más de 1.000 pasos y 9,55e-15 a T=8.192 en float64, lo que sostiene la estabilidad a largo horizonte. También se menciona paridad con escaneo paralelo (parallel-scan) y actualización O(1) en cómputo y memoria por evento.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO u otras fases de alineamiento. La model card menciona evaluación sobre conjuntos denominados `XL-smol` (5.003 registros / 12.809 preguntas y 10.130 registros / 27.487 preguntas en 12 dominios), pero no detalla el procedimiento de entrenamiento ni las innovaciones de decodificación más allá del roll-out latente para MPC con lookahead H=1..2.

## Capacidades

- Clasificación de texto y verificación de afirmaciones en modo juez (single-hop y multi-hop relacional).
- Verificación de causalidad científica y sentido común físico.
- Verificación socrática y epistémica en cuatro modos (`SEE`/`SAY`/`DO`/`KNOW`).
- Inducción de reglas sobre rejillas visuales-espaciales 2D (evaluado sobre `ARC-AGI-2 XL-smol`).
- Routing de acciones de agente con control predictivo de modelos (MPC) y lookahead latente, emitiendo veredictos `APPROVE` / `REJECT` / `ESCALATE`.
- Defensa frente a deriva de agente e inyección de prompts (según la evaluación declarada por el autor).
- Seguimiento de estado cíclico de largo horizonte (T=64 a 8.192) sin caché KV.
- Calibración epistémica y abstención.
- Verificación de terminación de bucles de programa.
- Seguimiento de transiciones de estado simbólico.
- Verificación booleana formal y tablas de verdad.
- Planificación de recursos y concurrencia.
- No se documentan capacidades de generación abierta de texto, código, matemáticas, visión general, audio ni tool calling estándar.

## Casos de uso

- Guardrail de agentes en producción: el modelo puede actuar como juez en línea que recibe la telemetría del agente y emite `APPROVE`/`REJECT`/`ESCALATE` con coste O(1) por evento, lo que permite monitorización continua sin acumular caché KV ni re-procesar el historial.
- Detección de inyección de prompts y deriva de comportamiento: según la evaluación declarada, el router MPC con lookahead H=1..2 defiende frente a acciones maliciosas; encajaría como capa intermedia entre el LLM planificador y las herramientas del agente.
- Verificación de hechos en pipelines de RAG: el modelo puede clasificar si una afirmación generada es consistente con el contexto recuperado (single-hop y multi-hop), actuando como filtro antes de devolver la respuesta al usuario.
- Validación de razonamiento científico y de sentido común: útil en asistentes educativos o de divulgación para descartar respuestas físicamente imposibles antes de mostrarlas.
- Seguimiento de estado en sistemas embebidos y de borde: al mantener un estado recurrente de 1,5 KB y no requerir caché KV, puede ejecutarse en CPUs y NPUs de bajo consumo para monitorizar telemetría continua de sensores o flujos de eventos.
- Verificación de terminación en generación de código: el modelo evalúa si un bucle de programa termina, lo que permitiría integrarlo en linters o pipelines de CI para bloquear código con bucles potencialmente infinitos.
- Comprobación de prerequisitos en grafos de conocimiento: con la batería `Prerequisite Knowledge Graph Battery v5` (2.777 registros), puede validar si un estudiante o sistema cumple los requisitos previos antes de avanzar en un currículo.
- Planificación de recursos y concurrencia: validación de asignaciones en schedulers y orquestadores, comprobando que las decisiones de planificación respetan restricciones declaradas.

## Benchmarks y rendimiento

Los datos provienen exclusivamente de la model card del autor y no han sido verificados de forma independiente. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

| Suite `XL-smol` (autor) | Registros | Preguntas | Top-1 | pass@2 | Consistencia de orden |
|---|---:|---:|---:|---:|---:|
| Multi-hop relacional (2..3 saltos) | 1.000 | 2.000 | 100,00% | 100,00% | 100,0% |
| Ciencia causal y sentido común | 1.000 | 2.000 | 100,00% | 100,00% | 100,0% |
| Verificación factual single-hop | 1.000 | 2.000 | 100,00% | 100,00% | 100,0% |
| Verificación socrática 4 modos | 1.000 | 2.000 | 100,00% | 100,00% | 100,0% |
| Inducción de reglas en rejilla 2D (ARC-AGI-2) | 600 | 1.800 | 100,00% | 100,00% | 100,0% |
| Routing MPC y defensa ante inyección | 403 | 1.209 | 99,75% | 100,00% | 100,0% |
| Seguimiento cíclico T=64..8.192 | streaming | 8.192 pasos | 100,00% | 100,00% | 100,0% |
| Agregado 6 suites (macro/micro) | 5.003 | 11.009 (12.809) | 99,96% / 99,98% | 100,00% | 100,0% |

| Dominio (suite 12 dominios) | Registros | Preguntas | Accuracy | ECE |
|---|---:|---:|---:|---:|
| Multi-hop relacional | 1.000 | 2.000 | 100,00% | 0,0883 |
| Ciencia causal y sentido común | 1.000 | 2.000 | 100,00% | 0,0206 |
| Verificación factual single-hop | 1.000 | 2.000 | 100,00% | 0,0190 |
| Verificación socrática 4 modos | 1.000 | 2.000 | 100,00% | 0,00002 |
| Inducción de reglas 2D (ARC-AGI-2) | 600 | 1.800 | 100,00% | 0,0035 |
| Routing MPC y deriva | 403 | 1.209 | 99,75% | 0,2904 |
| Calibración epistémica y abstención | 80 | 160 | 78,12% | 0,0764 |
| Verificación de terminación de bucles | 150 | 600 | 74,00% | 0,0915 |
| Transiciones de estado simbólico | 60 | 180 | 73,33% | 0,0890 |
| Grafo de prerequisitos v5 | 2.777 | 7.558 | 72,85% | 0,0881 |
| Planificación de recursos y concurrencia | 60 | 180 | 71,67% | 0,0940 |
| Verificación booleana formal | 2.000 | 6.000 | 68,45% | 0,1042 |
| Agregado 12 dominios | 10.130 | 25.687 (27.487) | 86,51% macro / 79,97% micro | 0,0804 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con ~13,8M parámetros almacenados, en float16 ocuparía del orden de 28 MB de pesos; en int8, unos 14 MB. Estas cifras son estimaciones a partir del recuento de parámetros, no datos publicados.
- GPU recomendadas: no disponible. El autor orienta el modelo a CPUs y NPUs de borde por su estado recurrente de 1,5 KB y su coste O(1) por evento.
- Cabe en GPU de consumo: previsiblemente sí en cualquier GPU moderna (RTX 3060 en adelante e incluso iGPU), dado el tamaño, aunque no hay requisitos oficiales publicados.
- Opciones de despliegue: se declara compatible con `transformers` y con `endpoints_compatible` en Hugging Face. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor afirma actualización O(1) en cómputo y memoria por evento sin caché KV, pero no publica cifras de latencia ni tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `HELMHOLTZ-S1-Mamba-b0.7.0-10m` | ~13,8M almacenados | Streaming O(1), evaluado hasta 8.192+ | Clasificación / juez de agente | Apache 2.0 | Pesos retenidos según la model card |
| `MatterWaveAI/helmholtz-mamba-b0.7.0-10m` (modelo base) | No disponible | No disponible | SSM base | Apache 2.0 (según el modelo derivado) | No disponible |
| `MatterWaveAI/helmholtz-mamba-1` | No disponible | No disponible | Rotational-SSM / JEPA world model | Apache 2.0 | Publicado en Hugging Face |
| `MatterWaveAI/helmholtz-1-omni` | No disponible | No disponible | Any-to-Any multimodal | Apache 2.0 | Publicado en Hugging Face |

No se dispone de datos de rendimiento de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Pesos no publicados: la model card indica que los pesos, la implementación y el código se retienen durante el ciclo de liberación por etapas, por lo que el modelo no es ejecutable ni verificable de forma independiente en el momento de redactar esta ficha.
- Benchmarks no verificados: todos los resultados proceden del autor y se basan en suites propietarias (`XL-smol`) no descritas en detalle; no hay comparación con benchmarks estándar de la comunidad.
- Riesgo de sobreajuste a las suites: el 100% en múltiples dominios con ECE muy variables (de 0,00002 a 0,2904) sugiere posible contaminación o ajuste fino específico; el ECE de routing MPC (0,2904) indica mala calibración en esa tarea.
- Sin datos de sesgos: no se documentan sesgos conocidos, composición del dataset ni filtros de seguridad.
- Idiomas no disponibles: no se especifica qué idiomas soporta ni su calidad fuera del inglés, si es que lo soporta.
- Licencia Apache 2.0: permite uso comercial y modificación, pero al no haber pesos publicados la licencia es en la práctica inaplicable hasta la liberación.
- Alcance limitado: es un clasificador/juez, no un modelo generativo; no debe usarse como LLM de propósito general ni para generación de texto abierta.
- Riesgo de alucinación: no evaluado ni documentado por el autor.
- Fecha de creación anómala (2026-11-08) en los metadatos de Hugging Face, lo que conviene verificar antes de citar el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MatterWaveAI/helmholtz-s1-mamba-b0.7.0-10m
- Modelo base: https://huggingface.co/MatterWaveAI/helmholtz-mamba-b0.7.0-10m
- Familia `S1-GRT-Mamba`: https://huggingface.co/MatterWaveAI/s1-grt-mamba
- `HELMHOLTZ-Mamba-1`: https://huggingface.co/MatterWaveAI/helmholtz-mamba-1
- `HELMHOLTZ-1-Omni`: https://huggingface.co/MatterWaveAI/helmholtz-1-omni
