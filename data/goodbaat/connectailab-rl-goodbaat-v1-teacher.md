# goodbaat/connectailab-rl-goodbaat-v1-teacher

## Resumen

connectailab-rl-goodbaat-v1-teacher es un modelo de decisión por refuerzo (deep reinforcement learning) orientado a la gestión de una empresa simulada dentro del entorno CONNECT TYCOON. Lo desarrolla el usuario goodbaat, en el marco del laboratorio educativo CONNECT AI LAB en colaboración con AI CITY BUILDERS, y se distribuye con formato de pesos basado en numpy (no es un modelo de lenguaje generativo al uso). El modelo actúa como el "cerebro" o "corteza prefrontal" que decide, mes a mes (20 días laborables), sobre plantilla, pedidos de inventario, marketing, atención al cliente, reembolsos y seguridad.

El problema que resuelve es la toma de decisiones secuenciales bajo objetivos múltiples y en conflicto: maximizar beneficio, mantener la satisfacción del cliente y minimizar incidentes de riesgo. Para ello se entrenó en dos fases: primero imitando a un "jefe basado en reglas" (aprendizaje supervisado) y después ajustando la política con PPO (Proximal Policy Optimization) usando la función de valor de la empresa (pesos `{"이익": 1.0, "고객 만족": 1.0, "위험": 1.0}`) como señal de recompensa.

El modelo no genera texto libre: recibe consultas estructuradas en el formato JEV (typesafe/jev-1.13) y responde también en JEV, devolviendo opciones, probabilidades y un nivel de confianza. Su relevancia es principalmente educativa y experimental, como ejemplo aplicado de RL con acciones discretas sobre un simulador de negocio, y no como sustituto de un sistema de gestión real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de decision por RL; se menciona metaforicamente "corteza prefrontal"; el cuaderno de entrenamiento referencia Qwen, sin confirmacion en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible (entrada estructurada tipo JEV, no texto libre) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | numpy (libreria `numpy`); distribuido a traves de la libreria `connect-tycoon` |
| Entorno de entrenamiento | CONNECT TYCOON (simulador de empresa, 20 dias laborables por mes) |
| Algoritmo de RL | PPO, precedido de aprendizaje supervisado sobre un jefe basado en reglas |
| Formato de E/S | JEV (typesafe/jev-1.13) |
| Funcion de valor de la empresa | `{"이익": 1.0, "고객 만족": 1.0, "위험": 1.0}` |
| Configuracion de empresa | `{"warehouse": 250.0, "base_demand": 40.0, "unit_cost": 1.5, "order_scale": 1.0, "staff_bonus": 0, "wage": 0.0, "ad_power": 1.0, "fraud_tool": 0, "extra_cs": 0, "extra_refund": 0}` |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo: no se especifican capas, dimensiones, numero de parametros ni tipo de red. La model card lo describe funcionalmente como una "corteza prefrontal" que opera sobre el simulador CONNECT TYCOON, y el pipeline declarado es `reinforcement-learning`. La libreria asociada es `numpy`, lo que sugiere que los pesos se almacenan como arrays de numpy en lugar de un formato de red neuronal profunda convencional (safetensors, GGUF, etc.). El nombre del cuaderno de entrenamiento enlazado (`rl_decision_model_qwen_colab.ipynb`) apunta a un posible uso de un modelo Qwen como base, pero esto no se confirma en la model card y no debe tomarse como dato verificado.

El proceso de entrenamiento descrito consta de dos etapas: (1) aprendizaje supervisado a partir de las decisiones de un "jefe basado en reglas", que sirve de politica inicial; y (2) ajuste con PPO usando la recompensa derivada de la funcion de valor de la empresa (beneficio, satisfaccion del cliente y riesgo, todos con peso 1.0). El modelo emite decisiones en el formato JEV, lo que permite fijar la estructura de la consulta y de la respuesta (opciones discretas, probabilidades por opcion y una confianza global). No se documentan innovaciones tecnicas adicionales como decodificacion especulativa, atencion lineal ni tecnicas hibridas.

## Capacidades

- Toma de decisiones discretas en un simulador de empresa: gestion de personal, pedidos de inventario, marketing, atencion al cliente, reembolsos y seguridad.
- Respuesta estructurada en formato JEV con opciones cerradas, distribucion de probabilidad por opcion y nivel de confianza (por ejemplo, `full`, `partial`, `deny`, `human` en una decision de reembolso).
- Razonamiento multi-objetivo: pondera simultaneamente beneficio, satisfaccion del cliente y riesgo.
- Operacion mes a mes (20 dias laborables) sobre el estado de la empresa, con acciones condicionadas al estado del departamento, motivo, tipo de cliente, importe y puntuacion de fraude.
- Integracion con el entorno de juego mediante `connect-tycoon play --brain hf:goodbaat/connectailab-rl-goodbaat-v1-teacher`.
- Carga programatica mediante `CompanyBrain.from_hub`.
- No se documentan capacidades de generacion de lenguaje, vision, audio, tool calling ni razonamiento agente en lenguaje natural.

## Casos de uso

- Simulacion educativa de gestion empresarial: el modelo se sienta como "jefe" en CONNECT TYCOON y opera la empresa durante un mes de 20 dias, permitiendo a estudiantes de RL observar una politica entrenada en accion.
- Investigacion en RL con PPO sobre entornos de decision multiobjetivo: sirve como referencia para comparar politicas entrenadas frente a un jefe basado en reglas en cuanto a beneficio, satisfaccion y riesgo.
- Docencia de formatos estructurados de decision (JEV): el modelo ilustra como encapsular preguntas y respuestas con opciones cerradas, probabilidades y confianza, util para ensenar diseno de interfaces de decision.
- Experimentos de transferencia de politica: dado que se entrena imitando reglas y luego se ajusta con recompensa, es util para estudiar cuanto mejora el RL sobre el comportamiento supervisado en un entorno de negocio simulado.
- Prototipado de politicas de reembolso y fraude: la consulta de ejemplo sobre reembolsos con `fraud_score` permite estudiar umbrales de decision entre reembolso completo, parcial, denegacion o escalado a humano.
- Benchmark interno de politicas de decision: sus metricas a 40 meses (beneficio, satisfaccion, incidentes, confirmaciones humanas, dias sin stock) permiten fijar una linea base para nuevas politicas.
- Demostracion en directo de integracion modelo-entorno: el comando `connect-tycoon play` con el modelo desde Hugging Face sirve como ejemplo de despliegue de una politica de RL dentro de un juego.

## Benchmarks y rendimiento

Los datos publicados en la model card corresponden a promedios de 40 meses en el simulador CONNECT TYCOON, comparando el modelo con el jefe basado en reglas:

| Metrica (promedio 40 meses) | Jefe basado en reglas | connect-ai-company-v1 |
|---|---|---|
| Beneficio mensual | 3,24 millones de wones | 11,66 millones de wones |
| Satisfaccion del cliente | 79% | 96% |
| Incidentes de riesgo | 7,8 | 4,4 |
| Confirmaciones humanas | 37,8 | 19,4 |
| Dias sin stock | 10,7 | 0,4 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible; estas metricas proceden del simulador propio y no son comparables con las de modelos de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se declaran parametros ni tamano de pesos).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; dado que la libreria declarada es numpy y la politica se ejecuta dentro de un simulador, es plausible que la inferencia sea ligera, pero no se confirma.
- Opciones de despliegue: carga via `connect_tycoon.CompanyBrain.from_hub` y ejecucion en el juego con `connect-tycoon play --brain hf:goodbaat/connectailab-rl-goodbaat-v1-teacher`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Categoria | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| connectailab-rl-goodbaat-v1-teacher | Politica RL para simulador de empresa | no disponible | no aplicable (E/S estructurada JEV) | 11,66 M wones/mes; 96% satisfaccion (simulador propio) | Apache 2.0 | Hugging Face |
| Jefe basado en reglas (CONNECT TYCOON) | Baseline heuristico del propio entorno | no aplicable | no aplicable | 3,24 M wones/mes; 79% satisfaccion | no disponible | Integrado en el simulador |

No se dispone de informacion sobre otros modelos de RL para gestion de empresa directamente comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo educativo y de simulacion: la propia model card advierte que se trata de un modelo didactico sobre un simulador sintetico y que no garantiza ni predice resultados de gestion reales.
- Sesgos conocidos: no documentados; al entrenarse imitando un jefe basado en reglas, hereda las heuristicas y sesgos de esa politica inicial.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero el modelo puede elegir acciones suboptimas o incoherentes fuera de la distribucion de estados con la que se entreno.
- Limitaciones de idioma: la model card declara unicamente coreano (ko); no se documenta soporte multilingue.
- Limitacion de contexto: la entrada es una consulta estructurada JEV, no una ventana de texto larga; no hay informacion sobre el maximo de estado procesable.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero no se documentan garantias de idoneidad para produccion.
- Caveat de produccion: no hay datos de latencia, robustez, versionado de pesos ni pruebas de estres; su uso en un entorno real de negocio no esta soportado por la documentacion.
- Trazabilidad: no se especifican parametros, arquitectura ni detalles del dataset de entrenamiento, lo que dificulta la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/goodbaat/connectailab-rl-goodbaat-v1-teacher
- Repositorio GitHub CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Cuaderno Colab de entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Formato JEV: `typesafe/jev-1.13`
- YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Connect AI (ezerai): https://www.ezerai.xyz
