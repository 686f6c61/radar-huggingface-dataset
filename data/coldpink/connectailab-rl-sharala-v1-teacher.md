# coldpink/connectailab-rl-sharala-v1-teacher

## Resumen

connectailab-rl-sharala-v1-teacher es un modelo de decisión basado en aprendizaje por refuerzo (RL) profundo, publicado por el desarrollador coldpink dentro del ecosistema CONNECT AI LAB. No es un modelo de lenguaje: es una política de decisión entrenada con PPO que actúa como el "córtex prefrontal" de una empresa simulada en el entorno CONNECT TYCOON. Su tarea es gestionar una compañía ficticia durante un mes (20 días laborables) tomando decisiones sobre asignación de personal, pedidos de inventario, marketing, atención al cliente, reembolsos y seguridad.

El modelo se entrenó en dos fases: primero aprendió imitando a un "jefe basado en reglas" mediante aprendizaje supervisado, y después ajustó su política con PPO usando como recompensa el valor de la empresa (beneficio, satisfacción del cliente y aversión al riesgo). Todas sus respuestas se emiten en el formato JEV (typesafe/jev-1.13), lo que permite integrarlo en flujos estructurados de preguntas y respuestas con probabilidades por opción. La librería declarada es numpy, lo que apunta a una política ligera sin dependencia de frameworks de deep learning pesados.

Su relevancia es fundamentalmente educativa y de investigación: es un ejemplo reproducible y de código abierto (licencia Apache 2.0) de cómo aplicar RL a la toma de decisiones empresariales en un simulador sintético, con métricas comparativas frente a una línea base de reglas. El autor advierte explícitamente que se trata de un modelo didáctico sobre un simulador y que no garantiza ni predice resultados de gestión reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica de decision de aprendizaje por refuerzo entrenada con PPO (no se especifica la topologia de red concreta); implementada con la libreria numpy |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (el estado se define por la observacion del simulador, no por una ventana de tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (ko) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (libreria declarada: numpy) |

Otros metadatos: pipeline declarado `reinforcement-learning`, region `us`, creado el 2026-10-14 y actualizado el mismo dia. Descargas y likes: 0.

## Arquitectura y entrenamiento

La model card describe el sistema como el "córtex prefrontal" de la empresa simulada: recibe el estado de la compañía y devuelve una decisión. El esquema de entrenamiento es en dos etapas: primero una fase de aprendizaje supervisado en la que el modelo imita a un "jefe basado en reglas" (규칙 사장), y después un ajuste con PPO (Proximal Policy Optimization) en el que la recompensa proviene de los valores de la empresa, definidos como `{"이익": 1.0, "고객 만족": 1.0, "위험": 1.0}` (beneficio, satisfacción del cliente y riesgo, con peso 1.0 cada uno). Los datos de entrenamiento proceden de un simulador de empresa sintético; no se indica el número de tokens ni de episodios, ni la composición detallada del dataset.

La interacción se realiza en formato JEV (`typesafe/jev-1.13`): el modelo recibe un objeto JSON con el estado y una o varias preguntas tipadas (`choice`, con `instructions` y `criteria`), y responde con la opción elegida, un vector de probabilidades por alternativa y un campo de confianza. En el ejemplo de la model card, para una solicitud de reembolso por "no entrega" a un cliente habitual con `fraud_score` de 0.314, el modelo asigna `full`=0.3426, `partial`=0.0023, `deny`=0.106 y `human`=0.5491. No se documentan innovaciones como decodificación especulativa ni atención lineal, dado que no es un modelo generativo de texto.

## Capacidades

- Toma de decisiones multi-acción en un simulador empresarial: asignación de personal, pedidos de inventario, marketing, atención al cliente, reembolsos y seguridad.
- Selección entre alternativas con criterios y devolución de probabilidades calibradas por opción, además de un nivel de confianza.
- Operación en horizonte de un mes simulado (20 días laborables) con decisiones encadenadas.
- Salida estructurada compatible con el formato JEV (`typesafe/jev-1.13`), apta para integrarse en pipelines de preguntas y respuestas tipadas.
- Gestión de compromisos entre objetivos múltiples (beneficio, satisfacción del cliente y aversión al riesgo) mediante la función de recompensa.
- Integración en el videojuego CONNECT TYCOON a través de `connect-tycoon play --brain hf:coldpink/connectailab-rl-sharala-v1-teacher`.
- No se documentan capacidades de generación de texto libre, código, matemáticas, visión, audio, tool calling ni razonamiento multilingüe.

## Casos de uso

- Investigación en aprendizaje por refuerzo aplicado a decisión secuencial: sirve como referencia reproducible para estudiar cómo una política PPO supera a una línea base de reglas en un entorno de simulación con recompensa multicriterio.
- Docencia de RL y de decisión empresarial: el modelo encaja en cursos y notebooks (hay una Colab oficial) para ilustrar imitation learning, ajuste con PPO y evaluación frente a un baseline.
- Simulación de políticas de reembolso y fraude: dado un estado como el de la model card, el modelo decide entre reembolso total, parcial, denegación o revisión humana en función del `fraud_score` y del valor del cliente.
- Gestión automatizada de inventario y reposición: el entorno exige decisiones de pedido de stock; la métrica de "días sin existencias" reportada (0.5 días frente a 10.7 del jefe de reglas) muestra su utilidad para probar estrategias de reposición.
- Diseño de estrategias de personal y marketing: el modelo planifica recursos y campañas dentro del presupuesto de la empresa simulada, útil para experimentar antes de trasladar heurísticas a entornos reales.
- Prototipado de interfaces de decisión en formato JEV: sirve para validar arquitecturas de integración que consumen respuestas JSON estructuradas con probabilidades por alternativa.
- Pruebas de agentes de decisión en juegos serios (serious games): al estar empaquetado con el juego CONNECT TYCOON, permite desplegar un "jefe automático" que opera la compañía durante partidas completas.

## Benchmarks y rendimiento

La model card incluye una comparación directa frente a la línea base de reglas ("jefe de reglas") sobre una media de 40 meses nunca vistos:

| Metrica (media de 40 meses nuevos) | Jefe de reglas | connectailab-rl-sharala-v1-teacher |
|---|---|---|
| Beneficio mensual | 3,24 millones de wones | 11,85 millones de wones |
| Satisfacción del cliente | 79% | 95% |
| Incidentes de riesgo | 7,8 | 1,7 |
| Casos que requieren revisión humana | 37,8 | 9,4 |
| Días sin existencias | 10,7 | 0,5 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ya que no se trata de un modelo de lenguaje. Las cifras anteriores proceden exclusivamente del autor y corresponden al simulador propio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. La libreria declarada es numpy y la politica apunta a una red ligera, por lo que previsiblemente puede ejecutarse en CPU, pero este dato no esta confirmado en la informacion disponible.
- GPU recomendadas: no disponibles; no se documenta ningun requisito de GPU.
- Compatibilidad con GPU de consumo: no disponible. La dependencia de numpy sugiere ejecucion en CPU, lo que implicaria compatibilidad amplia, pero no se afirma en la model card.
- Opciones de despliegue: paquete Python `connect-tycoon` (extra `[game]`), carga del cerebro mediante `CompanyBrain.from_hub("coldpink/connectailab-rl-sharala-v1-teacher")`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y no aplican al no ser un modelo generativo de texto.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se han encontrado en la informacion disponible modelos comparables publicados con la misma tarea (decision empresarial en simulador, formato JEV) ni cifras de terceros. La unica comparacion documentada es interna, frente al "jefe basado en reglas" del propio simulador:

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-sharala-v1-teacher | no disponible | no aplica | Beneficio 11,85 M wones; satisfaccion 95%; 1,7 incidentes (40 meses nuevos) | apache-2.0 | HuggingFace |
| Jefe basado en reglas (linea base interna) | no aplica | no aplica | Beneficio 3,24 M wones; satisfaccion 79%; 7,8 incidentes (40 meses nuevos) | no disponible | incluido en el simulador |
| Modelos alternativos externos | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo educativo sobre un simulador sintético: el propio autor indica que no garantiza ni predice resultados de gestion empresarial reales.
- No es un modelo de lenguaje: no genera texto libre, codigo ni respuestas conversacionales; su salida es una decision estructurada en formato JEV.
- Sesgos: el comportamiento esta moldeado por la funcion de recompensa definida (beneficio, satisfaccion y riesgo con peso 1.0 cada uno) y por el jefe de reglas usado en la fase de imitacion, por lo que hereda las prioridades y sesgos de ese diseno.
- Riesgo de alucinacion: no aplica en el sentido clasico de los LLM, pero la politica puede elegir acciones suboptimas o incoherentes ante estados fuera de la distribucion del simulador.
- Limitaciones de contexto e idioma: el modelo esta etiquetado unicamente para coreano (ko) y su estado depende completamente del simulador CONNECT TYCOON; no se documenta transferencia a otros entornos o idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero al depender del paquete `connect-tycoon` y del formato JEV (`typesafe/jev-1.13`) conviene revisar las licencias de esas dependencias.
- Cifras no verificadas de forma independiente: todas las metricas de rendimiento proceden de la model card del autor y no se han replicado externamente.
- Reproducibilidad: no se detallan el numero de episodios de entrenamiento, el tamano del dataset, los hiperparametros de PPO ni la topologia de la red, lo que limita la reproducibilidad completa.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin senales de adopcion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/coldpink/connectailab-rl-sharala-v1-teacher
- Repositorio GitHub CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook Colab de entrenamiento (RL decision model, Qwen): https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de IA con aprendizaje por refuerzo (AI CITY BUILDERS): https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz
- Formato JEV referenciado en la model card: `typesafe/jev-1.13` (referencia interna, sin enlace directo en la informacion disponible)
