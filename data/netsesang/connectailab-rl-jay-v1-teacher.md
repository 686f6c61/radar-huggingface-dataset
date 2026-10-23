# netsesang/connectailab-rl-jay-v1-teacher

## Resumen

`netsesang/connectailab-rl-jay-v1-teacher` es una política de aprendizaje por refuerzo profundo, no un modelo de lenguaje. La publica el autor `netsesang` dentro del proyecto CONNECT TYCOON / CONNECT AI LAB y su función es actuar como "prefrontal cortex" (el término que usa el propio autor) de una empresa simulada: decide cada día laborable sobre asignación de personal, reposición de inventario, marketing, atención al cliente, reembolsos y seguridad. El ciclo simulado dura un mes de 20 días laborables y cada decisión se emite en el esquema estructurado JEV (`typesafe/jev-1.13`), con la acción elegida, la distribución de probabilidad sobre las alternativas y un nivel de confianza.

El modelo se entrenó en dos fases: primero imitación supervisada de una "regla CEO" basada en reglas y después PPO con la recompensa definida por los valores de la empresa (beneficio, satisfacción del cliente y evitación de riesgo, todos con peso 1.0). En la evaluación del autor sobre 40 meses no vistos, la política supera con claridad al CEO de reglas en beneficio, satisfacción, incidentes de riesgo, derivaciones a revisión humana y días de rotura de stock.

Es relevante ahora como pieza didáctica y como referencia reproducible de RL aplicado a toma de decisiones secuenciales con salida tipada, no por capacidades generativas: la model card lo describe explícitamente como un modelo educativo sobre un simulador sintético de empresa, sin garantía de transferencia a gestión real. La librería declarada es `numpy` y el pipeline es `reinforcement-learning`.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de RL profundo (PPO) entrenada sobre un entorno Gymnasium; inferencia implementada con `numpy`. Detalle de capas no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (la entrada es un estado estructurado JEV, no texto libre) |
| Tipos de cuantizacion | no disponible (no aplica a este formato de pesos) |
| Idiomas soportados | coreano (`ko`) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible; se carga mediante `connect_tycoon.CompanyBrain.from_hub(...)` con la librería `numpy` |

## Arquitectura y entrenamiento

La información disponible describe una política de decisión entrenada en dos etapas sobre un simulador de empresa (CONNECT TYCOON, entorno tipo Gymnasium). En la primera etapa, aprendizaje supervisado por imitación de un "CEO de reglas" que actúa como profesor; en la segunda, optimización con PPO usando como recompensa los valores corporativos declarados (`{"이익": 1.0, "고객 만족": 1.0, "위험": 1.0}`, es decir, beneficio, satisfacción del cliente y riesgo). No se publican el número de tokens, la composición del dataset, el volumen de episodios de entrenamiento, la arquitectura de red concreta ni hiperparámetros de PPO.

La interfaz es JEV (`typesafe/jev-1.13`): el modelo recibe un estado (por ejemplo, departamento, motivo, nivel de cliente, importe y `fraud_score`) y devuelve una respuesta estructurada con `choice`, `probabilities`, `confidence` y `reason` (en el ejemplo publicado, `"reason": "강화학습 정책"`, es decir, "política de aprendizaje por refuerzo"). El tamaño de empresa usado en la evaluación queda fijado por configuración: `warehouse 250`, `base_demand 40`, `unit_cost 1.5`, `order_scale 1.0`, `staff_bonus 0`, `wage 0.0`, `ad_power 1.0`, `fraud_tool 0`, `extra_cs 0`, `extra_refund 0`.

## Capacidades

- Toma de decisiones discretas con salida probabilística tipada (JEV): devuelve la acción elegida junto con la distribución completa sobre las alternativas.
- Gestión de reembolsos con criterios de abuso: distingue entre reembolso total, parcial, denegación y derivación a revisión humana, incorporando `fraud_score` y antigüedad del cliente.
- Planificación operativa de un ciclo mensual de 20 días laborables: reposición de inventario, asignación de personal, campañas de marketing, atención al cliente y medidas de seguridad.
- Aprendizaje por refuerzo con recompensa multiobjetivo: equilibra beneficio, satisfacción y riesgo en lugar de maximizar una sola métrica.
- Salida estructurada compatible con esquemas JEV, apta para integrarse en pipelines que validen tipos.
- Integración con el simulador y con el juego mediante CLI (`connect-tycoon play --brain hf:...`).
- No dispone de generación de texto libre, código, matemáticas, visión, audio ni tool calling en el sentido habitual de un LLM; el alcance es el conjunto cerrado de decisiones del simulador.

## Casos de uso

- Docencia de aprendizaje por refuerzo: el modelo sirve como política ya entrenada para ilustrar el paso de imitación a PPO en un entorno de decisión con estado estructurado, sin necesidad de infraestructura de GPU.
- Baseline reproducible en investigación: cualquier política nueva sobre el simulador CONNECT TYCOON puede compararse contra esta referencia en beneficio, satisfacción, incidentes y derivaciones humanas sobre los mismos 40 meses.
- Generación de datos de decisión para destilación: dado que el nombre del repositorio incluye el sufijo `teacher`, puede emplearse para producir trazas de decisión (estado JEV → acción con probabilidades) que alimenten el entrenamiento de políticas más pequeñas o de imitación.
- Juego y demostraciones interactivas: `connect-tycoon play --brain hf:netsesang/connectailab-rl-jay-v1-teacher` permite poner la política a dirigir la empresa en el juego y observar el efecto de cada decisión en dinero, satisfacción y accidentes.
- Validación de esquemas JEV en producción interna: el modelo ejerce de cliente de prueba realista para verificar que el parser y el validador de respuestas tipadas aceptan `choice`, `probabilities` y `confidence` correctamente.
- Estudio de políticas de fraude y atención al cliente: el caso de reembolso publicado (importe 8.7, `fraud_score` 0.3146, cliente de nivel "단골") permite analizar cómo una política entrenada reparte probabilidad entre reembolsar, denegar o escalar a una persona, y compararlo con las reglas de negocio de una empresa real.
- Análisis de compromisos multiobjetivo: útil para estudiar cómo una recompensa con pesos iguales entre beneficio, satisfacción y riesgo se traduce en umbrales de decisión concretos, antes de fijar pesos en un sistema propio.

## Benchmarks y rendimiento

Los únicos resultados publicados son la comparación del autor contra el CEO de reglas, sobre 40 meses no vistos:

| Métrica (media de 40 meses) | CEO de reglas | connect-ai-company-v20 |
|---|---|---|
| Beneficio mensual | 324만원 (3,24 M KRW) | 1396만원 (13,96 M KRW) |
| Satisfacción del cliente | 79% | 93% |
| Incidentes de riesgo | 7,8 | 1,5 |
| Derivaciones a confirmación humana | 37,8 | 7,2 |
| Días con rotura de stock | 10,7 | 0,6 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni métricas de varianza, intervalos de confianza o número de semillas empleadas en la evaluación.

## Requisitos de hardware

- VRAM: no disponible. La librería declarada es `numpy`, lo que apunta a una política de inferencia ligera ejecutable en CPU, pero el autor no publica requisitos de memoria ni tamaño de los pesos.
- GPU recomendadas: no disponibles. No hay indicación de que la inferencia requiera acelerador.
- GPU de consumo: no disponible. Por el formato declarado no se espera necesaria, pero es una inferencia, no un dato publicado.
- Despliegue: la vía documentada es el paquete `connect-tycoon` (`pip install "connect-tycoon[game]"`), con carga desde el Hub mediante `CompanyBrain.from_hub` o el flag `--brain hf:<repo>` en la CLI. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles. El entorno es una simulación por turnos de 20 días laborables por mes; no se publican tiempos por decisión.

## Comparativa con modelos similares

No se han identificado en la información disponible políticas de RL publicadas y comparables para el mismo simulador o para la misma tarea de dirección de empresa sintética. La única referencia cuantitativa es el CEO de reglas del propio entorno:

| Modelo | Tipo | Parámetros | Contexto | Beneficio mensual | Satisfacción | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| connectailab-rl-jay-v1-teacher | Política RL (PPO + imitación) | no disponible | no aplica (estado JEV) | 1396만원 | 93% | Apache 2.0 | Hugging Face |
| CEO de reglas (baseline del simulador) | Sistema de reglas | no aplica | no aplica | 324만원 | 79% | no disponible | Incluido en el simulador |
| Otras políticas públicas comparables | — | — | — | no disponible | no disponible | — | no disponible |

## Limitaciones y advertencias

- Modelo educativo sobre un simulador sintético: la propia model card advierte que no garantiza ni predice resultados de gestión reales. Cualquier extrapolación a negocio real requiere validación independiente.
- Alcance cerrado: solo responde a las preguntas definidas por el esquema del simulador (decisiones de tipo `choice` sobre departamentos concretos). Fuera de ese vocabulario, la salida no es fiable.
- Idioma: la model card declara únicamente coreano (`ko`); no se documenta soporte de castellano ni de otros idiomas.
- Dependencia de esquema: la salida está acoplada a `typesafe/jev-1.13`; cambios en el esquema o en los nombres de los campos rompen la integración.
- Sin datos de sesgo, robustez ni calibración: no se publican análisis de sesgos, pruebas de estrés, ni verificación de que las probabilidades devueltas estén calibradas.
- Riesgo de sobreajuste al simulador: los resultados de 40 meses proceden del mismo entorno y configuración de empresa (`warehouse 250`, `base_demand 40`, `wage 0.0`, etc.); no se reporta comportamiento con otras configuraciones.
- Ambigüedad de identidad: el repositorio se llama `...-jay-v1-teacher`, mientras que la model card y el JSON de ejemplo identifican el cerebro como `connect-company/connect-ai-company-v20`. Conviene verificar qué artefacto concreto corresponde al checkpoint antes de usarlo en un pipeline.
- Validación comunitaria nula: 0 descargas y 0 likes en el momento de la consulta; no hay informes de terceros que confirmen los números publicados.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución y aviso de cambios, pero la licencia no cubre la adecuación del modelo a un dominio real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netsesang/connectailab-rl-jay-v1-teacher
- Repositorio CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de entrenamiento en Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS (curso de RL): https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz
- Esquema JEV referenciado en la model card: `typesafe/jev-1.13` (no se proporciona URL directa en la información disponible)
