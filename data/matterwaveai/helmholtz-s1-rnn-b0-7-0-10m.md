# MatterWaveAI/helmholtz-s1-rnn-b0.7.0-10m

## Resumen

HELMHOLTZ-S1-RNN-b0.7.0-10m es un modelo recurrente compacto desarrollado por MatterWaveAI, orientado a tareas de verificación de estado, enrutamiento de acciones de agentes y control predictivo de modelo (MPC) en lugar de generación de texto libre. Se distribuye con pipeline `text-classification` y está construido sobre el modelo base MatterWaveAI/helmholtz-rnn-b0.7.0-10m, como escalón de 10M de la familia S1-GRT-RNN. Su propuesta central es mantener un estado recurrente de aproximadamente 1,5 KB con coste O(1) en computación y memoria por evento, sin caché KV, lo que permite procesar secuencias de 128 a más de 8.192 pasos con memoria constante.

La arquitectura combina modos recurrentes unitarios (Rotational-minGRU y Unitary-GRU) con un planteamiento de world model latente tipo JEPA. El modelo se presenta como un juez de seguridad para agentes: ramifica su estado recurrente entre acciones candidatas y emite veredictos APPROVE, REJECT o ESCALATE. Según la model card, almacena unos 13,8M de parámetros con una capacidad densa equivalente declarada de unos 34M, sin matrices lineales densas ni capas convolucionales.

Es relevante por su enfoque poco habitual: un modelo de 10M de parámetros que prioriza estabilidad numérica a largo horizonte y huella de memoria mínima frente a capacidades generativas. La model card advierte explícitamente de que los pesos, la implementación arquitectónica y el código fuente están retenidos durante un ciclo de publicación escalonado, por lo que el modelo no es actualmente utilizable de forma directa pese a estar publicado en Hugging Face.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | RNN unitaria con puertas (Rotational-minGRU y Unitary-GRU), world model latente JEPA, sin matrices densas ni convoluciones |
| Parámetros totales | ~13,8M almacenados (~34M de capacidad densa equivalente declarada) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 8.192+ pasos en modo streaming con estado O(1) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (pesos retenidos según la model card) |

## Arquitectura y entrenamiento

El modelo es un RNN con estado recurrente compacto que soporta dos modos: un escaneo paralelizable Rotational-minGRU, con paridad declarada de 3,82e-6 frente a la recurrencia paso a paso O(1), y un modo no lineal Unitary-GRU acoplado al estado. La estabilidad se apoya en una formulación unitaria con determinante +1,000000: la deriva de magnitud del estado es inferior a 5,0e-7 en más de 1.000 pasos y de 9,55e-15 a T = 8.192 en float64. No emplea caché KV ni capas convolucionales 1D/2D.

La model card describe el sistema como un world model latente con capacidad de lookahead MPC de una sola pasada: el estado recurrente vivo se ramifica en paralelo entre acciones candidatas del agente antes de emitir un veredicto. No se especifican el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. La información de entrenamiento se limita a la evaluación sobre conjuntos held-out denominados XL-smol. Los pesos, la implementación y el código fuente están retenidos deliberadamente para evitar la evasión de la barrera de seguridad en caja blanca.

## Capacidades

- Verificación de estado y de relaciones multi-hop (2 a 3 saltos) sobre el estado recurrente.
- Verificación factual de un solo salto y de sentido común físico y científico.
- Verificación socrática y epistémica en cuatro modos (SEE, SAY, DO, KNOW).
- Inducción de reglas sobre rejillas visual-espaciales 2D, evaluada con una variante XL-smol de ARC-AGI-2.
- Enrutamiento de acciones de agentes con lookahead MPC (H = 1..2) y defensa frente a inyección de prompts y deriva.
- Seguimiento de autómatas cíclicos y con estado a largo horizonte (T = 64..8.192) con memoria constante.
- Calibración epistémica y abstención.
- Verificación de terminación de bucles de programa y de transiciones de estado simbólicas.
- Verificación booleana formal y de tablas de verdad.
- No se documentan capacidades de generación de texto libre, código, matemáticas avanzadas, visión real, audio ni tool calling.

## Casos de uso

- Guardarraíl de agentes autónomos: el modelo recibe el estado de la conversación o del plan y emite APPROVE, REJECT o ESCALATE antes de ejecutar una acción, con estado recurrente de 1,5 KB que evita el crecimiento de memoria en sesiones largas.
- Defensa frente a inyección de prompts: su evaluación específica de prompt-injection y deriva (99,75% top-1 en el conjunto de 403 registros) lo sitúa como filtro previo a la llamada al modelo generativo principal.
- Enrutamiento de acciones con lookahead: al ramificar el estado entre acciones candidatas en una sola pasada, puede seleccionar la acción siguiente en pipelines de planificación con coste O(1) por evento.
- Seguimiento de estado en autómatas y flujos de trabajo: útil para verificar que un proceso multi-paso (por ejemplo, una máquina de estados de un backend) permanece en transiciones válidas durante miles de pasos sin caché KV.
- Verificación de terminación de bucles en generación de código: puede actuar como comprobador previo en pipelines de CI/CD que detecten bucles no terminantes antes de ejecutar código generado, aunque su precisión declarada en esta tarea es del 74,00%.
- Filtro de calibración y abstención: en sistemas de preguntas y respuestas puede decidir cuándo el sistema debe abstenerse, con una precisión declarada del 78,12% en el conjunto de calibración epistémica.
- Verificación formal ligera: comprobación de tablas de verdad y condiciones booleanas en asistentes de configuración o de infraestructura, con precisión declarada del 68,45%.

## Benchmarks y rendimiento

Datos declarados en la model card sobre conjuntos held-out XL-smol (no verificables de forma independiente; los pesos no están publicados).

| Suite | Registros | Preguntas | Top-1 | pass@2 | Consistencia de orden |
|---|---|---|---|---|---|
| Rollout relacional multi-hop (2..3 saltos) | 1.000 | 2.000 | 100,00% | 100,00% | 100,0% |
| Ciencia causal y sentido común físico | 1.000 | 2.000 | 100,00% | 100,00% | 100,0% |
| Verificación factual de un salto | 1.000 | 2.000 | 100,00% | 100,00% | 100,0% |
| Verificación socrática de 4 modos | 1.000 | 2.000 | 100,00% | 100,00% | 100,0% |
| Inducción de reglas en rejilla 2D (ARC-AGI-2 XL-smol) | 600 | 1.800 core | 100,00% | 100,00% | 100,0% |
| Enrutamiento MPC de acciones y defensa ante inyección | 403 | 1.209 | 99,75% | 100,00% | 100,0% |
| Seguimiento de autómata a largo horizonte (T = 64..8.192) | streaming | 8.192 pasos | 100,00% | 100,00% | 100,0% |
| Agregado de 6 suites | 5.003 | 11.009 core | 99,96% macro / 99,98% micro | 100,00% | 100,0% |

Evaluación consolidada de 12 dominios (10.130 registros held-out, 25.687 preguntas core):

| Dominio | Registros | Precisión primaria | Precisión core | ECE |
|---|---|---|---|---|
| Rollout relacional multi-hop | 1.000 | 100,00% | 100,00% | 0,0883 |
| Ciencia causal y sentido común | 1.000 | 100,00% | 100,00% | 0,0206 |
| Verificación factual de un salto | 1.000 | 100,00% | 100,00% | 0,0190 |
| Verificación socrática de 4 modos | 1.000 | 100,00% | 100,00% | 0,00002 |
| Inducción de reglas en rejilla 2D | 600 | 100,00% | 71,78% (98,44% elección) | 0,0035 |
| Enrutamiento MPC de acciones y deriva | 403 | 99,75% | 66,67% | 0,2904 |
| Calibración epistémica y abstención | 80 | 78,12% | 78,12% | 0,0764 |
| Terminación de bucles de programa | 150 | 74,00% | 74,00% | 0,0915 |
| Transiciones de estado simbólicas | 60 | 73,33% | 73,33% | 0,0890 |
| Grafo de prerrequisitos (v5) | 2.777 | 72,85% | 72,85% | 0,0881 |
| Planificación de recursos y concurrencia | 60 | 71,67% | 71,67% | 0,0940 |
| Verificación booleana formal | 2.000 | 68,45% | 68,45% | 0,1042 |

No se han publicado comparaciones con MMLU, HumanEval, GSM8K ni otros benchmarks estándar de lenguaje en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con ~13,8M de parámetros almacenados, en fp32 ocuparía del orden de 55 MB y en fp16 unos 28 MB, más el estado recurrente de 1,5 KB por secuencia.
- GPU recomendadas: no disponibles; por tamaño, cualquier GPU con al menos 1 GB de VRAM sería suficiente en teoría.
- Cabe en GPU de consumo: sí, por tamaño, en cualquier GPU moderna (RTX 3060 o superior, e incluso en CPU).
- Opciones de despliegue: la librería declarada es transformers, pero la model card indica que los pesos y la implementación están retenidos, por lo que no es desplegable actualmente. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la model card declara coste O(1) por evento pero no publica cifras de latencia o tokens por segundo.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HELMHOLTZ-S1-RNN-b0.7.0-10m | RNN unitaria + JEPA, juez de agentes | ~13,8M | 8.192+ pasos O(1) | Apache 2.0 | Pesos retenidos |
| MatterWaveAI/helmholtz-mamba-1 | SSM rotacional (Rotational-SSM), juez de trayectorias | no disponible | O(1) | no disponible | Publicado en HF |
| MatterWaveAI/helmholtz-rnn-b0.7.0-10m | RNN base del que deriva este modelo | no disponible | no disponible | no disponible | Publicado en HF |

No se dispone de comparaciones con modelos de clasificación o verificación de otras familias en la información proporcionada.

## Limitaciones y advertencias

- Pesos, implementación y código fuente retenidos: el modelo no es ejecutable ni auditable con la información publicada.
- Los resultados de benchmarks son declarados por el autor sobre conjuntos propios XL-smol y no han sido verificados de forma independiente; los valores del 100% en varias suites deben interpretarse con cautela.
- Precisión core baja en varios dominios: 66,67% en enrutamiento MPC, 68,45% en verificación booleana formal y 71,78% en inducción de reglas 2D.
- Calibración desigual: ECE de 0,2904 en enrutamiento MPC y 0,1042 en verificación booleana, frente a 0,00002 en verificación socrática.
- No se documentan sesgos, idiomas soportados ni comportamiento multilingüe.
- Riesgo de alucinación no evaluado: el modelo no genera texto libre, pero sus veredictos de aprobación o rechazo pueden ser erróneos y afectar a decisiones automatizadas.
- Licencia Apache 2.0 permite uso comercial del artefacto publicado, pero la ausencia de pesos hace que esa licencia sea en la práctica inaplicable hoy.
- No apto como sustituto de un modelo de lenguaje general: no se documentan capacidades generativas, de código ni de tool calling.
- El ciclo de publicación escalonado implica que las capacidades reales pueden diferir de lo declarado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MatterWaveAI/helmholtz-s1-rnn-b0.7.0-10m
- Modelo base: https://huggingface.co/MatterWaveAI/helmholtz-rnn-b0.7.0-10m
- Familia S1-GRT-RNN: https://huggingface.co/MatterWaveAI/s1-grt-rnn
- Modelo relacionado HELMHOLTZ-Mamba-1: https://huggingface.co/MatterWaveAI/helmholtz-mamba-1
