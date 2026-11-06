# pwg0218/connectailab-rl-nil-v2-teacher

## Resumen

connectailab-rl-nil-v2-teacher es un agente de decision entrenado con aprendizaje por refuerzo (PPO) por el desarrollador pwg0218 dentro del ecosistema CONNECT AI LAB / AI CITY BUILDERS. No es un modelo de lenguaje generativo, sino una politica de decision que opera como "cerebro" (denominado "corteza prefrontal" en la model card) de una empresa simulada en el entorno CONNECT TYCOON, donde debe gestionar un mes de operaciones (20 dias laborables) tomando decisiones sobre personal, inventario, marketing, atencion al cliente, reembolsos y seguridad.

El modelo recibe observaciones del simulador en formato JEV (un esquema JSON tipado, `typesafe/jev-1.13`) y devuelve decisiones tambien en JEV, con distribucion de probabilidades sobre las opciones disponibles. Se entreno en dos fases: primero imitando a un "presidente basado en reglas" (aprendizaje supervisado) y despues ajustando la politica con recompensas derivadas de los valores de la empresa (beneficio, satisfaccion del cliente y riesgo).

Es relevante como ejemplo educativo de RL aplicado a toma de decisiones secuenciales con funcion de recompensa multiobjetivo, y por su integracion con un simulador de negocio open source. Su alcance es acotado: dominio cerrado, idioma coreano y uso principalmente didactico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica de aprendizaje por refuerzo (PPO) sobre observaciones JEV; arquitectura de red no detallada en la model card |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica; estado estructurado por decision, no secuencia de texto |
| Tipos de cuantizacion | No disponible (pesos en formato numpy) |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | NumPy (libreria `numpy`); integracion via `connect_tycoon.CompanyBrain.from_hub` |

## Arquitectura y entrenamiento

El modelo es una politica de decision entrenada con PPO (Proximal Policy Optimization) sobre el simulador CONNECT TYCOON. El entrenamiento se realizo en dos etapas: una fase de aprendizaje supervisado a partir de las decisiones de un "presidente basado en reglas" (teacher), seguida de un ajuste con PPO usando como recompensa una combinacion ponderada de los valores de la empresa: beneficio (peso 4.0), satisfaccion del cliente (peso 4.0) y riesgo (peso 1.0). No se detalla en la informacion disponible el numero de parametros, la arquitectura exacta de la red ni el volumen de datos de entrenamiento.

La interfaz es el esquema JEV: el modelo recibe un estado estructurado (por ejemplo, departamento, motivo, tipo de cliente, importe, puntuacion de fraude) y una pregunta con opciones y criterios, y devuelve la opcion elegida con probabilidades y nivel de confianza. La model card indica que la razon devuelta es "politica de aprendizaje por refuerzo", sin cadena de razonamiento explicita.

## Capacidades

- Toma de decisiones discretas sobre acciones de negocio: asignacion de personal, pedidos de inventario, campanas de marketing, atencion al cliente, reembolsos y seguridad.
- Salida probabilistica calibrada sobre las opciones disponibles (por ejemplo, reembolso completo 0.909, parcial 0.0006, denegar 0.0005, derivar a humano 0.0899 en el ejemplo de la model card).
- Respuesta en formato JEV tipado, consumible por el simulador CONNECT TYCOON.
- Operacion multi-turno dentro de un episodio de 20 dias laborables (un mes simulado).
- No soporta generacion de texto libre, codigo, matematicas, vision ni tool calling generico; su alcance es la decision estructurada en el dominio del simulador.
- Idioma de trabajo: coreano.

## Casos de uso

- Simulacion educativa de gestion empresarial: el modelo actua como "presidente" automatico en CONNECT TYCOON y permite a estudiantes comparar sus decisiones con las de una politica entrenada.
- Investigacion en RL multiobjetivo: sirve como referencia para estudiar como una funcion de recompensa ponderada (beneficio, satisfaccion, riesgo) moldea el comportamiento de una politica PPO.
- Evaluacion de entornos de simulacion: al ser un baseline reproducible, permite medir mejoras de nuevas politicas frente a una referencia entrenada.
- Demostraciones docentes de JEV: ejemplo practico de contrato de entrada/salida tipado para agentes de decision.
- Benchmarking de agentes de decision: comparacion de metricas de negocio (beneficio mensual, satisfaccion, incidentes) entre politicas basadas en reglas y politicas aprendidas.
- Prototipado de logica de negocio en entornos sinteticos antes de trasladar heuristicas a sistemas reales, sin riesgo operativo.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre 40 meses no vistos previamente (media):

| Metrica | Presidente basado en reglas | connectailab-rl-nil-v2-teacher |
|---|---|---|
| Beneficio mensual | 3,24 millones de wones | 11,01 millones de wones |
| Satisfaccion del cliente | 79% | 96% |
| Incidentes de riesgo | 7,8 | 4,7 |
| Derivaciones a humano | 37,8 | 19,3 |
| Dias con stock agotado | 10,7 | 0,9 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ya que el modelo no es un LLM de proposito general.

## Requisitos de hardware

- Inferencia en CPU: al usar pesos NumPy y operar sobre estados estructurados de baja dimension, no requiere GPU.
- VRAM estimada: no disponible; presumiblemente minima o nula.
- GPU recomendadas: no aplica para inferencia; el entrenamiento PPO puede beneficiarse de GPU, pero no se especifica.
- Compatibilidad con GPU de consumo: irrelevante para el uso previsto.
- Despliegue: mediante la libreria `connect_tycoon` (`pip install "connect-tycoon[game]"`), con `CompanyBrain.from_hub` o `connect-tycoon play --brain hf:pwg0218/connectailab-rl-nil-v2-teacher`.
- Latencia y throughput: no disponibles; dependera del simulador y del hardware.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-nil-v2-teacher | Politica RL (PPO) para simulador | No disponible | No aplica | Apache 2.0 | Hugging Face |
| Presidente basado en reglas (baseline del simulador) | Heuristica determinista | No aplica | No aplica | No disponible | Incluido en CONNECT TYCOON |
| Politicas RL genericas (PPO/SAC en Gymnasium) | Agente RL | Depende del entorno | No aplica | Variable | Frameworks abiertos |

No se dispone de informacion sobre otros modelos directamente comparables en la misma categoria y dominio; la comparacion con el baseline de reglas es la unica referencia cuantitativa publicada.

## Limitaciones y advertencias

- Dominio cerrado: solo opera sobre el simulador CONNECT TYCOON y el esquema JEV; no es un modelo de proposito general.
- Entrenado sobre un simulador sintetico; la model card advierte explicitamente que no garantiza ni predice resultados de gestion real.
- Idioma limitado al coreano.
- No se detalla la arquitectura de red ni el numero de parametros, lo que dificulta la reproducibilidad y el analisis tecnico.
- Riesgo de sobreajuste a la configuracion de empresa indicada (`warehouse: 250.0`, `base_demand: 40.0`, etc.); el comportamiento con otras configuraciones no esta documentado.
- Sin cadena de razonamiento explicita: la justificacion devuelta es generica ("politica de aprendizaje por refuerzo").
- Licencia Apache 2.0 permite uso comercial del artefacto, pero el valor practico fuera del entorno educativo es limitado.
- Sin descargas ni likes en el momento de la consulta; sin validacion externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pwg0218/connectailab-rl-nil-v2-teacher
- Repositorio CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de entrenamiento en Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL en AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz
