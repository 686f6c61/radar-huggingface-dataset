# litzor/connectailab-rl-litzor-v1-teacher

## Resumen

connectailab-rl-litzor-v1-teacher es una política de aprendizaje por refuerzo desarrollada por el usuario litzor dentro del proyecto CONNECT TYCOON, un simulador sintético de gestión empresarial. No es un modelo de lenguaje: actúa como el "prefrontal cortex" de una empresa simulada que debe gobernar durante un mes de 20 días laborables, tomando decisiones sobre asignación de personal, pedidos de inventario, marketing, atención al cliente, reembolsos y seguridad.

El modelo se sirve a través de la librería numpy y se integra con el paquete connect-tycoon. Responde a consultas en formato JEV (typesafe/jev-1.13) devolviendo la opción elegida, la distribución de probabilidad sobre las alternativas disponibles y un nivel de confianza. Su entrenamiento combina una fase de aprendizaje supervisado a partir de un "presidente basado en reglas" y un refinamiento posterior con PPO, usando como recompensa las tres métricas de valor de la empresa: beneficio, satisfacción del cliente y evitación de riesgo.

En 40 meses no vistos, la política multiplica el beneficio mensual respecto a la línea base (de 3,24 a 11,53 millones de wones) y eleva la satisfacción del cliente del 79 % al 96 %. Está etiquetado con el idioma coreano y licencia Apache 2.0, y el propio autor lo describe como un modelo educativo sobre un simulador sintético que no garantiza ni predice resultados empresariales reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de aprendizaje por refuerzo entrenada con PPO; topología de red no especificada |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no aplica (implementacion en numpy) |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | numpy (library_name: numpy) |

## Arquitectura y entrenamiento

El modelo es una política de decisión entrenada con PPO (Proximal Policy Optimization), etiquetada además con deep-reinforcement-learning, gymnasium y decision-making. El uso de gymnasium sugiere que interactúa con un entorno que sigue dicha API de entornos de RL. La librería declarada es numpy, lo que apunta a una implementación ligera sin un framework de aprendizaje profundo como PyTorch o TensorFlow, aunque la topología concreta de la red (número de capas, funciones de activación, dimensionalidad de la observación) no está documentada en la información disponible.

El proceso de entrenamiento descrito en la model card tiene dos etapas: primero un aprendizaje supervisado que imita a un "presidente basado en reglas", y después un ajuste con PPO en el que la recompensa se deriva de las tres métricas de valor de la empresa (beneficio, satisfacción del cliente y riesgo, cada una con peso 1.0). No se especifican el número de tokens, la composición del dataset ni el volumen de episodios empleados. El término "prefrontal cortex" es una denominación metafórica del rol de toma de decisiones, no una descripción arquitectónica.

## Capacidades

- Toma de decisiones discretas con salida de tipo "choice", devolviendo la opción seleccionada, la distribución de probabilidad sobre las alternativas y un valor de confianza.
- Gestión de departamentos concretos del simulador: reembolsos, asignación de personal, pedidos de inventario, marketing, atención al cliente y seguridad.
- Razonamiento sobre contexto de estado estructurado (por ejemplo, departamento, motivo, nivel de cliente, importe y puntuación de fraude).
- Respuesta en formato JEV (typesafe/jev-1.13), con criterios de decisión definidos explícitamente en la consulta.
- Operación autónoma durante un horizonte de 20 días laborables consecutivos.
- Soporte multilingüe: únicamente coreano.
- No dispone de soporte de tool calling, function calling, agentes generales, visión, audio ni modo de razonamiento explícito; su alcance se limita al entorno de simulación para el que fue entrenado.

## Casos de uso

- Simulación empresarial interactiva: integrar el modelo como cerebro de una empresa en el juego CONNECT TYCOON mediante `connect-tycoon play --brain hf:litzor/connectailab-rl-litzor-v1-teacher`, de modo que gestione de forma autónoma un mes de operaciones.
- Investigación en RL como baseline: utilizar la política como punto de comparación frente a nuevos algoritmos (por ejemplo, variantes de PPO o métodos off-policy) sobre el mismo entorno Gymnasium.
- Docencia de aprendizaje por refuerzo: ilustrar en talleres la diferencia entre una política imitada por supervisión y una política refinada con gradiente de política, midiendo la mejora en beneficio y satisfacción.
- Estudio de políticas de reembolso y detección de fraude: analizar cómo el modelo pondera entre reembolso total, parcial, denegación y escalado a revisión humana ante distintos niveles de "fraud_score".
- Evaluación de sistemas de decisión multiobjetivo: emplear la función de valor triple (beneficio, satisfacción, riesgo) para estudiar compromisos entre objetivos en un entorno controlado.
- Generación de datos sintéticos de decisión: ejecutar la política para producir trazas de decisiones etiquetadas que alimenten el entrenamiento o la validación de otros modelos de decisión.
- Demostraciones educativas divulgativas: usar el modelo y su animación asociada para explicar de forma visual cómo un agente de RL opera una empresa día a día.

## Benchmarks y rendimiento

La model card publica una comparación entre el "presidente basado en reglas" y este modelo, medida como promedio sobre 40 meses no vistos previamente por el agente.

| Metrica (promedio 40 meses) | Presidente basado en reglas | connectailab-rl-litzor-v1-teacher |
|---|---|---|
| Beneficio mensual | 3,24 millones de wones | 11,53 millones de wones |
| Satisfacción del cliente | 79 % | 96 % |
| Incidentes de riesgo | 7,8 | 2,9 |
| Confirmaciones humanas superadas | 37,8 | 20,1 |
| Días sin existencias | 10,7 | 0,6 |

No se han publicado resultados frente a benchmarks externos estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- Almacenamiento e inferencia en CPU: la librería declarada es numpy y no se documenta ninguna dependencia de GPU, por lo que la ejecución se realiza en CPU.
- VRAM estimada para inferencia: no disponible; no se documenta uso de GPU.
- GPU recomendadas: no aplica según la información disponible.
- Compatibilidad con GPU de consumo: no aplica según la información disponible.
- Opciones de despliegue: paquete `connect-tycoon` (extra `game`), carga del modelo desde el Hub con `CompanyBrain.from_hub`, y ejecución mediante el comando `connect-tycoon play`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se conocen modelos comparables de la misma categoría en la información proporcionada, ya que se trata de una política de RL específica de un simulador propietario. La única referencia disponible es la línea base incluida en la propia model card.

| Referencia | Tipo | Beneficio mensual | Satisfaccion | Incidentes de riesgo | Licencia |
|---|---|---|---|---|---|
| connectailab-rl-litzor-v1-teacher | Política RL (PPO) | 11,53 millones de wones | 96 % | 2,9 | Apache 2.0 |
| Presidente basado en reglas | Política heurística | 3,24 millones de wones | 79 % | 7,8 | no disponible |

## Limitaciones y advertencias

- Modelo educativo sobre un simulador sintético: el propio autor indica que no garantiza ni predice resultados de gestión reales.
- Sesgo de dominio: está ajustado exclusivamente al entorno CONNECT TYCOON y a su configuración de empresa concreta (`warehouse: 250.0`, `base_demand: 40.0`, `unit_cost: 1.5`, entre otros parámetros); su comportamiento fuera de esa configuración no está validado.
- Idioma: la única lengua declarada es el coreano (ko).
- Riesgo de decisiones subóptimas: al ser una política estocástica, devuelve distribuciones de probabilidad (por ejemplo, en el ejemplo de la model card, 0,6418 para reembolso total y 0,3364 para revisión humana), de modo que las decisiones pueden variar entre ejecuciones.
- Ausencia de datos técnicos: no se documentan parámetros totales, arquitectura de red, volumen de entrenamiento ni método de evaluación independiente; la reproducibilidad queda limitada.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero no ofrece garantías; al integrarse con el paquete `connect-tycoon`, conviene revisar por separado la licencia de dicho paquete y del simulador.
- Ausencia de datos de benchmarks externos, por lo que el rendimiento solo puede evaluarse dentro del propio simulador.
- Popularidad y mantenimiento: el modelo registra 0 descargas y 0 "likes" en el momento de la consulta, sin historial de uso comunitario contrastable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/litzor/connectailab-rl-litzor-v1-teacher
- Repositorio GitHub CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Cuaderno de Colab de entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- Plataforma AI CITY BUILDERS (curso de RL): https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz
- Formato JEV referenciado: typesafe/jev-1.13 (identificador citado en la model card, sin URL directa disponible)
