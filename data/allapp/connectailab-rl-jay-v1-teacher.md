# allapp/connectailab-rl-jay-v1-teacher

## Resumen

connectailab-rl-jay-v1-teacher es una política de aprendizaje por refuerzo (reinforcement learning) que actúa como "corteza prefrontal" de un presidente de empresa virtual dentro del simulador CONNECT TYCOON. Lo desarrolla allapp en el marco de la iniciativa educativa CONNECT AI LAB × AI CITY BUILDERS. El modelo recibe el estado de la compañía simulada (plantilla, inventario, marketing, atención al cliente, reembolsos y seguridad) y devuelve decisiones estructuradas en formato JEV (`typesafe/jev-1.13`), no texto libre.

El problema que resuelve es la toma de decisiones multiobjetivo bajo incertidumbre: la política optimiza simultáneamente beneficio, satisfacción del cliente y evitación de riesgos, con pesos `{1.0, 1.0, 1.0}`. Se entrenó en dos fases: primero imitación supervisada de un presidente basado en reglas (el "profesor") y después ajuste con PPO usando la recompensa derivada de los valores de la empresa.

Técnicamente no es un modelo de lenguaje grande, sino una política compacta ejecutable con NumPy, empaquetada con la librería `connect-tycoon`. Su interés actual es didáctico: sirve como ejemplo reproducible de un ciclo completo de RL aplicado a decisiones empresariales y demuestra mejoras sustanciales frente a la línea base de reglas en la evaluación del propio simulador. No se han publicado detalles de arquitectura interna, número de parámetros ni ventana de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de aprendizaje por refuerzo (PPO); red neuronal feed-forward, arquitectura interna no especificada |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (opera sobre un estado estructurado del simulador por paso) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (la libreria declarada es `numpy`; probablemente arrays de NumPy) |

Otras especificaciones declaradas: `pipeline_tag: reinforcement-learning`, `library_name: numpy`, desarrollador `allapp`, configuración de empresa asociada `{"warehouse": 250.0, "base_demand": 40.0, "unit_cost": 1.5, "order_scale": 1.0, "staff_bonus": 0, "wage": 0.0, "ad_power": 1.0, "fraud_tool": 0, "extra_cs": 0, "extra_refund": 0}`.

## Arquitectura y entrenamiento

La model card describe un pipeline de dos etapas. En la primera, la política aprende por imitación (aprendizaje supervisado) a replicar el comportamiento de un "presidente de reglas" que actúa como profesor. En la segunda, ese comportamiento se refina mediante PPO (Proximal Policy Optimization), donde la recompensa proviene de los valores de la compañía simulada: beneficio, satisfacción del cliente y aversión al riesgo, cada uno ponderado con peso 1.0. El nombre del modelo ("teacher") sugiere que esta versión actúa como referencia docente para políticas posteriores derivadas dentro del mismo proyecto.

El modelo no genera lenguaje natural: produce respuestas con estructura tipada JEV, con un campo `choice`, un vector de `probabilities` por alternativa y un valor de `confidence`. Por ejemplo, ante un reembolso con `fraud_score` de 0.31 sobre un cliente de nivel "단골" (habitual), devuelve `full` con probabilidad 0.9139, `human` con 0.085 y prácticamente descarta `partial` y `deny`. No se han publicado datos sobre tokens de entrenamiento, composición del dataset, ni innovaciones técnicas como decodificación especulativa o atención lineal, porque no se trata de un modelo de lenguaje en el sentido habitual.

## Capacidades

- Toma de decisiones discretas tipadas en formato JEV, con distribución de probabilidad sobre las alternativas y nivel de confianza.
- Gestión de personal y asignación de plantilla dentro de la empresa simulada.
- Pedidos de inventario y control de rotura de stock.
- Decisiones de marketing y publicidad.
- Atención al cliente y gestión de reembolsos (reembolso total, parcial, denegación o derivación a revisión humana).
- Evaluación de riesgo y fraude a partir de un `fraud_score` proporcionado por el entorno.
- Decisiones de seguridad con criterios explícitos de compromiso entre beneficio, satisfacción y riesgo.
- Integración como "cerebro" jugable en el simulador mediante `connect-tycoon play --brain`.
- Soporte multilingüe: no; el modelo está etiquetado únicamente para coreano.
- No se documenta soporte de tool calling, function calling genérico, agentes multi-paso fuera del simulador, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Evaluación educativa de RL: usar el modelo como referencia en un curso para mostrar el ciclo imitación + PPO y comparar la política resultante con la línea base de reglas en el simulador CONNECT TYCOON.
- Simulación docente de decisiones empresariales: desplegarlo como presidente virtual para que estudiantes observen cómo cambian beneficio, satisfacción y riesgo a lo largo de 40 meses de juego.
- Prueba de políticas propias: servir de "profesor" (teacher) frente al cual comparar políticas derivadas, como la variante LoRA/GRPO observada en el ecosistema del proyecto.
- Generación de decisiones etiquetadas: usar su salida JEV con probabilidades y confianza como etiquetas sintéticas para estudiar agregación de decisiones bajo incertidumbre.
- Investigación sobre recompensas multiobjetivo: analizar cómo una ponderación fija de tres valores (`1.0` cada uno) moldea el comportamiento en escenarios de fraude y reembolso.
- Reproducción en cuadernos Colab: ejecutar el flujo completo de aprendizaje y despliegue desde el notebook oficial enlazado en la model card.
- Integración en pipelines de simulación: incorporar el "cerebro" del modelo como componente de un banco de pruebas de estrategias de empresa, sin depender de ningún servicio en la nube.

## Benchmarks y rendimiento

La model card incluye una evaluación propia sobre 40 meses no vistos, comparando al profesor de reglas con este modelo:

| Metrica (media mensual, 40 meses no vistos) | Profesor de reglas | connectailab-rl-jay-v1-teacher |
|---|---|---|
| Beneficio mensual | 3,24 M KRW | 11,11 M KRW |
| Satisfaccion del cliente | 79% | 95% |
| Incidentes de riesgo | 7,8 | 2,8 |
| Verificaciones humanas excedidas | 37,8 | 21,7 |
| Dias de rotura de stock | 10,7 | 0,5 |

No se han publicado resultados en benchmarks estandarizados (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, algo esperable dado que no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM para inferencia: no aplica; la librería declarada es NumPy y la política se ejecuta en CPU.
- GPU recomendadas: ninguna en particular; funciona en CPU convencional. No se documenta requisito de GPU.
- GPU de consumo: no aplica (no requiere GPU de consumo ni profesional).
- Opciones de despliegue: paquete `connect-tycoon` (`pip install "connect-tycoon[game]"`), carga mediante `ct.CompanyBrain.from_hub(...)` y ejecución interactiva con `connect-tycoon play --brain hf:allapp/connectailab-rl-jay-v1-teacher`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, coherente con que no es un LLM.
- Latencia y throughput: no disponibles. Al ser una política NumPy, la latencia esperada es baja, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-jay-v1-teacher | Politica RL (PPO) sobre simulador | no disponible | no disponible (estado estructurado) | Apache 2.0 | HuggingFace (`allapp`) |
| WonseokJayJung/connectailab-rl-jay-v1 | RL (GRPO) con LoRA sobre qwen3.5, MLX | no disponible | no disponible | Apache 2.0 | HuggingFace |
| kiodo/connectailab-rl-jay-v1-teacher | Espejo/replicacion del mismo modelo | no disponible | no disponible | no disponible | HuggingFace |

No se dispone de otros modelos comparables de la misma categoria fuera del propio ecosistema CONNECT AI LAB. No se han publicado parametros ni metricas comparables de alternativas externas en la informacion disponible.

## Limitaciones y advertencias

- Modelo estrictamente educativo sobre un simulador de empresa sintetico; la model card advierte explicitamente que no garantiza ni predice resultados empresariales reales.
- Entrenado y etiquetado solo para coreano; no hay soporte documentado de otros idiomas.
- Politica especializada en el entorno CONNECT TYCOON y en una configuracion concreta de empresa; no se documenta su capacidad de generalizacion a otros entornos o configuraciones.
- Salida limitada a decisiones tipadas JEV; no genera texto libre ni mantiene conversaciones.
- No se detallan arquitectura, numero de parametros ni proceso de entrenamiento, lo que dificulta auditar sesgos o reproducir el modelo.
- Riesgo de alucinacion no aplica en el sentido habitual, pero si existe riesgo de decisiones suboptimas o de baja confianza en estados poco representados del simulador.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el propio autor declara un proposito educativo y no comercial del contenido.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta; no hay validacion por parte de terceros mas alla de la evaluacion del propio autor.
- La fecha de creacion indicada (2026) es coherente con un artefacto reciente y de escasa madurez, sin historial de uso en produccion.

## Enlaces

- HuggingFace: https://huggingface.co/allapp/connectailab-rl-jay-v1-teacher
- GitHub del proyecto CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook Colab de aprendizaje: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL en AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Connect AI (empresa de decision C1): https://www.ezerai.xyz
- Modelo relacionado (WonseokJayJung/connectailab-rl-jay-v1): https://huggingface.co/WonseokJayJung/connectailab-rl-jay-v1
- Modelo espejo (kiodo): https://huggingface.co/kiodo/connectailab-rl-jay-v1-teacher
- Instagram del autor: https://www.instagram.com/aimentorjay/
