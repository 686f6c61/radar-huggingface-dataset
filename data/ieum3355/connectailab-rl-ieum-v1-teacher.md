# ieum3355/connectailab-rl-ieum-v1-teacher

## Resumen

`connectailab-rl-ieum-v1-teacher` es un modelo de decisión por refuerzo (no un modelo de lenguaje generativo) desarrollado por el usuario ieum3355 en el marco del proyecto CONNECT TYCOON, una simulación empresarial de código abierto mantenida por CONNECT AI LAB y AI CITY BUILDERS. El modelo actúa como "cerebro" de una empresa sintética: cada día laborable recibe el estado de la compañía (departamento implicado, motivo de la petición, importe, puntuación de fraude, etc.) y emite una decisión discreta entre un conjunto cerrado de opciones (por ejemplo, reembolso total, parcial, denegación o derivación a un humano).

La arquitectura no es un transformer: se trata de una política entrenada con PPO sobre un simulador de negocio, empaquetada en formato NumPy y consumida a través de la librería `connect_tycoon`. El modelo responde en el formato declarativo JEV (`typesafe/jev-1.13`), lo que le permite integrarse en flujos donde las decisiones deben ser tipadas y verificables en lugar de texto libre. Su relevancia es acotada pero concreta: demuestra cómo un agente RL puede superar a una política basada en reglas en métricas de negocio (beneficio, satisfacción, incidentes de riesgo) dentro de un entorno reproducible.

El autor reporta que, frente a un "presidente de reglas" en 40 meses no vistos durante el entrenamiento, el modelo multiplica por más de tres el beneficio mensual medio (1.110万 won frente a 324万), reduce los incidentes de riesgo de 7,8 a 1,4 y los días de rotura de stock de 10,7 a 0,5. Son cifras del propio autor, sin benchmark externo ni validación independiente, y deben interpretarse como resultados de simulación, no como evidencia de rendimiento empresarial real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de decisión entrenada con PPO (deep reinforcement learning) sobre simulador; empaquetado NumPy, no transformer |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la entrada es un estado estructurado, no una secuencia de texto) |
| Tipos de cuantizacion | no disponible (pesos en formato NumPy) |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | NumPy / artefactos de `connect_tycoon` (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo es una política de aprendizaje por refuerzo profundo entrenada con PPO (Proximal Policy Optimization) sobre el simulador CONNECT TYCOON, que modela una empresa durante ciclos de 20 días laborables. El proceso de entrenamiento descrito en la model card tiene dos fases: primero un aprendizaje supervisado (imitación) a partir de un "presidente de reglas" que actúa como profesor, y después un ajuste con PPO usando una función de recompensa derivada de los valores de la empresa. El vector de valores empleado es `{"이익": 1.0, "고객 만족": 1.0, "위험": 3.0}`, es decir, beneficio 1, satisfacción del cliente 1 y aversión al riesgo 3.

El autor indica que comparó siete variantes del profesor modificando únicamente los pesos de los valores y seleccionó la configuración de "riesgo ×3": con ella el beneficio se mantiene igual que en la configuración base (1.110万 won al mes) mientras que la pérdida por fraude se reduce un 60 %. Con riesgo ×10, las decisiones difieren más del profesor base (solo un 89 % de coincidencia) pero el beneficio cae un 27 %, lo que el autor interpreta como evidencia de que sobreponderar un valor degrada el resultado global. No se detallan en la información disponible el número de tokens, el tamaño del dataset, la arquitectura exacta de la red (capas, dimensión oculta) ni los hiperparámetros de PPO.

La innovación destacable no es arquitectónica sino de interfaz: las decisiones se emiten en el formato JEV, con probabilidades por opción, nivel de confianza y un campo de justificación. Esto hace que la salida sea auditable y consumible por otros componentes del simulador sin post-procesado de lenguaje natural.

## Capacidades

- Toma de decisiones discretas en un entorno empresarial simulado: asignación de personal, pedidos de inventario, marketing, atención al cliente, reembolsos y seguridad.
- Salida estructurada en formato JEV con distribución de probabilidad sobre las opciones disponibles y valor de confianza (por ejemplo, `full: 0.8951`, `human: 0.1037`, `confidence: 0.8951` en el ejemplo de la model card).
- Razonamiento de compromiso entre objetivos en conflicto: beneficio, satisfacción del cliente y riesgo, ponderados según el vector de valores configurado.
- Integración con el simulador mediante `CompanyBrain.from_hub(...)` y ejecución interactiva con `connect-tycoon play --brain hf:...`.
- No soporta tool calling, function calling genérico, agentes multi-paso, visión, audio ni generación de texto libre: su espacio de acción está acotado a las preguntas tipadas que recibe.
- Capacidad multilingüe limitada al coreano, idioma en el que están definidos los estados, criterios y motivos del simulador.

## Casos de uso

- Investigación en RL aplicado a decisiones empresariales: sirve como política de referencia reproducible para comparar algoritmos (PPO frente a alternativas) sobre el mismo simulador CONNECT TYCOON, con métricas de negocio bien definidas.
- Docencia y formación en reinforcement learning: el flujo Colab + GitHub permite que estudiantes entrenen, evalúen y sustituyan la política sin infraestructura propia, usando el "profesor de reglas" como línea base.
- Estudio de alineación de valores: al permitir reentrenar con distintos vectores de pesos (beneficio, satisfacción, riesgo), el modelo es un banco de pruebas para medir cómo cambia la política al variar la función de recompensa.
- Simulación de políticas de reembolso y antifraude: el modelo decide entre reembolso total, parcial, denegación o revisión humana a partir de un `fraud_score` y del historial del cliente, lo que permite comparar el coste de cada política en un entorno controlado.
- Gestión de inventario y rotura de stock: con métricas reportadas de 0,5 días de rotura frente a 10,7 del profesor de reglas, es útil para estudiar políticas de reposición en simulaciones de cadena de suministro simplificada.
- Generación de datos sintéticos de decisión: las salidas JEV con probabilidades pueden emplearse como etiquetas o datos de entrenamiento para modelos de decisión posteriores o para destilación.
- Evaluación de agentes en entornos tipo gymnasium: al estar etiquetado con `gymnasium` y `reinforcement-learning`, encaja en pipelines de evaluación estandarizados de políticas.

## Benchmarks y rendimiento

Los únicos datos disponibles son los reportados por el autor en la model card, medidos sobre el simulador CONNECT TYCOON en 40 meses no vistos durante el entrenamiento (media por mes):

| Métrica (media de 40 meses) | Presidente de reglas | connectailab-rl-ieum-v1-teacher |
|---|---|---|
| Beneficio mensual | 324万 won | 1.110万 won |
| Satisfacción del cliente | 79 % | 95 % |
| Incidentes de riesgo | 7,8 | 1,4 |
| Confirmaciones humanas excedidas | 37,8 | 23,9 |
| Días de rotura de stock | 10,7 | 0,5 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones con políticas RL externas. Las cifras anteriores proceden exclusivamente del autor y no han sido verificadas de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; los pesos se distribuyen como artefactos NumPy de una política de decisión, no como un modelo transformer, por lo que la huella es presumiblemente muy inferior a la de un LLM, pero el dato no se especifica.
- GPU recomendadas: no disponible. La inferencia puede ejecutarse en CPU para el caso de uso típico (una decisión por día simulado).
- Cabe en GPU de consumo: sí, con alta probabilidad, al no requerir aceleración específica; no se documenta una configuración mínima.
- Opciones de despliegue: librería `connect_tycoon` (`pip install "connect-tycoon[game]"`), carga desde Hugging Face Hub con `CompanyBrain.from_hub`, y ejecución interactiva con `connect-tycoon play --brain hf:...`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de modelos comparables publicados con especificaciones verificables en la información proporcionada. La comparación más próxima es la línea base incluida por el propio autor:

| Modelo | Tipo | Beneficio mensual | Satisfacción | Incidentes de riesgo | Licencia |
|---|---|---|---|---|---|
| Presidente de reglas (línea base) | Política basada en reglas | 324万 won | 79 % | 7,8 | no disponible |
| connectailab-rl-ieum-v1-teacher | PPO sobre simulador | 1.110万 won | 95 % | 1,4 | Apache 2.0 |
| Otras políticas RL públicas equivalentes | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo educativo y de simulación: el propio autor advierte que no garantiza ni predice resultados empresariales reales; las métricas provienen de un simulador sintético.
- Espacio de acción cerrado: solo responde a preguntas tipadas definidas por el simulador; no es un modelo de lenguaje y no puede usarse para generación de texto, código ni conversación abierta.
- Dependencia fuerte del entorno: el comportamiento está acoplado a la configuración de empresa indicada en la model card (`warehouse`, `base_demand`, `unit_cost`, etc.); cambios en el simulador pueden invalidar la política.
- Idioma: estados, criterios y motivos están en coreano; no hay soporte documentado para otros idiomas.
- Sesgo inducido por la función de recompensa: la política está optimizada para un vector de valores concreto (riesgo ×3). Cambiar los pesos altera las decisiones de forma sustancial, como el propio autor documenta (riesgo ×10 reduce el beneficio un 27 %).
- Riesgo de sobreajuste al profesor de reglas: la primera fase es imitación, por lo que la política hereda los sesgos y puntos ciegos del profesor, aunque PPO los modifique parcialmente.
- Ausencia de validación independiente: no hay benchmarks de terceros, ni comparaciones con otras políticas RL, ni réplicas de los resultados.
- Licencia Apache 2.0: permite uso comercial y modificación, pero al tratarse de un artefacto ligado a un simulador concreto, la utilidad comercial fuera de ese entorno es marginal.
- Sin garantías de robustez ante distribuciones de estado fuera del simulador de entrenamiento; no se documentan pruebas de estrés ni análisis de sensibilidad más allá de la variación de pesos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ieum3355/connectailab-rl-ieum-v1-teacher
- Repositorio CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de entrenamiento en Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS (curso de RL): https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz
- Formato JEV referenciado: `typesafe/jev-1.13` (no se proporciona URL directa en la información disponible)
