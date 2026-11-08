# MatterWaveAI/helmholtz-b0.7.0-10m

## Resumen

HELMHOLTZ-b0.7.0-10m es un modelo compacto desarrollado por MatterWaveAI, presentado como una arquitectura de tipo Joint-Embedding Predictive Architecture (JEPA) puramente rotacional, etiquetada por el autor como `GRT-JEPA` y descrita como "world model causal" y "System-1 trajectory judge". Se construye como un fine-tune del modelo base `MatterWaveAI/grt-10m` y pertenece a la familia de escalado `HELMHOLTZ-1`. Su diseño prescinde de matrices lineales densas y de capas convolucionales: cada bloque del codificador y del predictor es una cascada de transformaciones ortogonales que preservan la norma (determinante +1), lo que según el autor elimina el colapso de representación por construcción geométrica, sin necesidad de negativos contrastivos.

El modelo está pensado para despliegue en el borde (edge), pipelines de CI que solo disponen de CPU y verificación de leyes de escalado junto a la variante de 30M de la misma familia. Su función principal no es la generación de texto convencional, sino la predicción de estados objetivo en espacio latente y la emisión de decisiones de tipo `APPROVE`/`REJECT`/`ESCALATE` sobre trayectorias de agentes, con benchmarks publicados sobre un conjunto propio denominado `XL-smol`.

Es relevante ahora por su propuesta arquitectónica radical (cero matrices densas, ortogonalidad estricta) y por su enfoque de "juez de seguridad" para agentes, aunque el autor retiene los pesos, los detalles de implementación y el código fuente durante un ciclo de liberación escalonado, lo que limita seriamente su evaluación práctica. El tamaño declarado es de aproximadamente 13,8M parámetros almacenados, con una capacidad equivalente densa de unos 34M.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | JEPA rotacional pura (`GRT-JEPA`), cascada de transformaciones ortogonales; 0 matrices lineales densas, 0 capas convolucionales |
| Parametros totales | ~13,8M almacenados (~34M de capacidad equivalente densa) |
| Parametros activos | no disponible (no se describe como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (pesos retenidos según la model card) |

## Arquitectura y entrenamiento

La arquitectura se describe como una JEPA (Joint-Embedding Predictive Architecture) en la que el codificador y el predictor operan mediante bloques rotacionales ortogonales con determinante +1, sin matrices lineales densas ni convoluciones. El autor afirma que esta construcción preserva las distancias por pares y el rango de la covarianza de forma automática, manteniendo `det = +1.000000` con una deriva de ortogonalidad de 1,42e-14 a lo largo de 100 actualizaciones de objetivo y una retención de rango efectivo igual o superior al 99,0%, todo ello sin negativos contrastivos. El modelo predice estados objetivo multi-paso directamente en espacio latente, sin decodificar tokens intermedios, e incorpora un mecanismo de dinámica inversa en forma cerrada que recupera operadores de transición causal entre pares de estados sin pasos de gradiente, capturando sensibilidad al orden de las acciones (contrafactuales no conmutativos).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. La model card indica explícitamente que los pesos, los detalles de implementación arquitectónica y el código fuente están retenidos durante el ciclo de liberación escalonado del world model, por lo que la información técnica disponible proviene únicamente de las afirmaciones del autor y no puede verificarse de forma independiente.

## Capacidades

- Predicción multi-paso en espacio latente de estados objetivo (latent trajectory lookahead) sin decodificación de tokens intermedios.
- Emisión de decisiones de seguridad de un solo paso para agentes: `APPROVE`, `REJECT` o `ESCALATE`.
- Verificación de rollouts relacionales multi-hop (2 a 3 saltos).
- Verificación de ciencia causal y sentido común físico.
- Verificación factual de un solo salto sobre un "world model".
- Verificación socrática y epistémica en cuatro modos (`SEE`/`SAY`/`DO`/`KNOW`).
- Inducción de reglas sobre rejillas visuales-espaciales 2D (evaluación tipo ARC-AGI-2).
- Enrutamiento de acciones de agente con control predictivo (MPC), detección de deriva y defensa frente a inyección de prompts.
- Calibración epistémica y abstención.
- Verificación de terminación de bucles de programa y seguimiento de transiciones de estado simbólicas.
- Planificación de recursos y concurrencia.
- Dinámica inversa en forma cerrada y contrafactuales sensibles al orden de acciones.
- No se documentan capacidades de tool calling, function calling, visión, audio ni multilingüismo en la información disponible.

## Casos de uso

- Juez de seguridad para agentes autónomos: el modelo recibe trayectorias candidatas de acciones y emite una decisión `APPROVE`/`REJECT`/`ESCALATE` antes de la ejecución, aprovechando su capacidad de rollout latente multi-paso y su calibración de abstención (71,25% en el subconjunto de calibración epistémica).
- Defensa frente a inyección de prompts en pipelines de agentes: el subconjunto de enrutamiento MPC, deriva e inyección de prompts reporta 60,55% de precisión primaria sobre 803 registros, lo que permite integrarlo como filtro previo en entornos de ejecución de herramientas.
- Verificación de razonamiento causal en asistentes científicos: con 92,80% de precisión en ciencia causal y sentido común físico, puede usarse para validar explicaciones causales generadas por un LLM mayor antes de mostrarlas al usuario.
- Inducción de reglas sobre rejillas 2D: útil en entornos de investigación tipo ARC-AGI-2 para comprobar hipótesis de transformación espacial, con 54,33% de precisión primaria y 81,67% de `pass@2`.
- Verificación de terminación en bucles de programa: con 68,00% de precisión sobre 150 registros, puede integrarse en pipelines de CI para detectar bucles infinitos o condiciones de parada mal definidas en código generado.
- Planificación de recursos y concurrencia: con 65,00% de precisión sobre 60 registros, sirve como comprobador ligero de asignaciones de recursos en sistemas de scheduling.
- Despliegue en CPU y edge: por su tamaño (~13,8M parámetros) y ausencia de matrices densas, es candidato a ejecutarse en dispositivos sin GPU, aunque no se publican latencias ni throughput.
- Verificación de leyes de escalado: sirve como punto de comparación de 10M frente a la variante de 30M de la familia `HELMHOLTZ-1` en estudios de escalado.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el conjunto propietario `XL-smol` (12.003 registros retenidos, 29.609 preguntas):

| Suite de evaluacion | Registros | Preguntas | Top-1 | pass@2 | Consistencia de orden |
|---|---:|---:|---:|---:|---:|
| Rollout relacional multi-hop (2-3 saltos) | 2.500 | 5.000 | 81,20% | 90,50% | 100,0% |
| Ciencia causal y sentido comun fisico | 2.500 | 5.000 | 92,80% | 96,40% | 100,0% |
| Verificacion factual de un solo salto | 2.500 | 5.000 | 86,30% | 88,60% | 100,0% |
| Verificacion socratica 4 modos | 2.500 | 5.000 | 61,70% | 89,40% | 100,0% |
| Induccion de reglas en rejilla 2D (ARC-AGI-2) | 1.200 | 3.600 (7.200 total) | 54,33% | 81,67% | 100,0% |
| Enrutamiento MPC, deriva e inyeccion | 803 | 2.409 | 60,55% | 63,03% | 100,0% |
| Agregado 6 suites (macro / micro) | 12.003 | 26.009 (29.609 total) | 72,81% / 75,75% | 86,68% | 100,0% |

Evaluación completa de 12 dominios (17.130 registros, 44.287 preguntas), con error de calibración (ECE):

| Dominio | Registros | Precision primaria | ECE |
|---|---:|---:|---:|
| Rollouts relacionales multi-hop | 2.500 | 81,20% | 0,1142 |
| Ciencia causal y sentido comun | 2.500 | 92,80% | 0,0584 |
| Verificacion factual de un solo salto | 2.500 | 86,30% | 0,0712 |
| Verificacion socratica 4 modos | 2.500 | 61,70% | 0,1285 |
| Induccion de reglas en rejilla 2D | 1.200 | 54,33% (81,67% pass@2) | 0,1410 |
| Enrutamiento MPC y deriva | 803 | 60,55% | 0,2145 |
| Calibracion epistémica y abstencion | 80 | 71,25% | 0,0890 |
| Terminacion de bucles de programa | 150 | 68,00% | 0,0985 |
| Seguimiento de transiciones simbolicas | 60 | 66,67% | 0,0960 |
| Grafo de prerrequisitos (v5) | 2.777 | 67,45% | 0,0954 |
| Planificacion de recursos y concurrencia | 60 | 65,00% | 0,1020 |

No se han publicado resultados en benchmarks estándar de la industria (MMLU, HumanEval, GSM8K) en la información disponible. Todos los datos anteriores proceden de conjuntos propios del autor y no son verificables de forma independiente.

## Requisitos de hardware

- VRAM estimada: no disponible. Con ~13,8M parámetros almacenados, una inferencia en fp16 requeriría del orden de decenas de MB, pero el autor no publica requisitos ni formatos de pesos.
- GPU recomendadas: no disponible. El modelo se presenta como orientado a CPU y edge, sin especificar hardware.
- Compatibilidad con GPU de consumo: no confirmada; por tamaño sería viable en cualquier GPU moderna, pero la ausencia de pesos publicados impide verificarlo.
- Opciones de despliegue: la model card indica `library_name: transformers` y el tag `endpoints_compatible`, pero no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|---|
| HELMHOLTZ-b0.7.0-10m | ~13,8M (~34M equiv.) | no disponible | JEPA rotacional, juez de agentes | Apache 2.0 | Retenidos según model card |
| HELMHOLTZ-1 (30M, misma familia) | 30M | no disponible | JEPA rotacional | Apache 2.0 | No confirmado |
| MatterWaveAI/grt-10m (modelo base) | 10M | no disponible | Base del fine-tune | no disponible | No confirmado |
| MatterWaveAI/helmholtz-rnn-b0.7.0-20m | 20M | no disponible | Variante RNN de la familia | Apache 2.0 | No confirmado |

No se dispone de comparaciones con modelos de propósito general de tamaño similar (por ejemplo, modelos de 10-30M para generación de texto) porque los benchmarks publicados usan conjuntos propietarios no comparables.

## Limitaciones y advertencias

- Los pesos, el código y los detalles de implementación están retenidos según la model card; no es posible reproducir ni auditar los resultados.
- Todos los benchmarks proceden de conjuntos propietarios (`XL-smol`) definidos por el autor, sin validación externa ni comparación con benchmarks estándar.
- El pipeline declarado es `text-generation`, pero la arquitectura descrita opera en espacio latente y emite decisiones discretas; la correspondencia con generación de texto convencional no está documentada.
- No se especifican la longitud de contexto, los idiomas soportados ni los formatos de cuantización, lo que impide planificar un despliegue en producción.
- Riesgo de alucinación y sesgos: no evaluado en la información disponible; los conjuntos de evaluación no cubren sesgos demográficos ni socioculturales.
- Precisión limitada en varias tareas: 54,33% en inducción de reglas 2D, 60,55% en enrutamiento MPC y 61,70% en verificación socrática, con ECE de hasta 0,2145 en el dominio de enrutamiento, lo que indica calibración deficiente en ese subconjunto.
- La afirmación de "eliminación del colapso por construcción" no ha sido verificada de forma independiente.
- Aunque la licencia es Apache 2.0, la retención de pesos impide el uso comercial efectivo hasta su liberación.
- No se documentan capacidades de tool calling ni de agentes multi-paso en el sentido habitual (orquestación de herramientas); la función de "juez" es un clasificador de trayectorias, no un planificador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MatterWaveAI/helmholtz-b0.7.0-10m
- Modelo base: https://huggingface.co/MatterWaveAI/grt-10m
- Familia HELMHOLTZ-1: https://huggingface.co/MatterWaveAI/helmholtz-1
- Variante JEPA (árbol de ficheros): https://huggingface.co/MatterWaveAI/helmholtz-jepa-b0.7.0-10m/tree/main
- Variante RNN de 20M: https://huggingface.co/MatterWaveAI/helmholtz-rnn-b0.7.0-20m
