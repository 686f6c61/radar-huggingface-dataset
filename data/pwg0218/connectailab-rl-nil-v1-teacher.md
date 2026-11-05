# pwg0218/connectailab-rl-nil-v1-teacher

## Resumen

connectailab-rl-nil-v1-teacher es un modelo de decisión por refuerzo (reinforcement learning) desarrollado por el usuario pwg0218 en el marco del proyecto CONNECT TYCOON, una plataforma educativa de simulación empresarial impulsada por CONNECT AI LAB y AI CITY BUILDERS. No es un modelo de lenguaje generativo: es una política entrenada para operar una empresa simulada durante un ciclo de 20 días laborables, tomando decisiones sobre asignación de personal, reposición de inventario, marketing, atención al cliente, reembolsos y seguridad. El modelo se presenta como el "cerebro" o corteza prefrontal de un agente que gestiona la compañía dentro del simulador.

La relevancia del modelo es fundamentalmente didáctica: sirve como ejemplo práctico de un pipeline completo de deep reinforcement learning aplicado a un entorno tipo Gymnasium, con una fase de aprendizaje supervisado a partir de un "presidente de reglas" (política heurística) seguida de un ajuste fino con PPO (Proximal Policy Optimization) usando recompensas derivadas de los valores de la empresa (beneficio, satisfacción del cliente y riesgo). El autor reporta mejoras sustanciales frente a la política de reglas en métricas de negocio, lo que lo convierte en un caso de estudio útil para quienes quieran entender cómo se entrena y despliega una política de decisión en un entorno de simulación.

El modelo se distribuye a través de HuggingFace con la librería `numpy` y el pipeline `reinforcement-learning`, y se integra con el paquete `connect-tycoon` para su uso interactivo. Está orientado al idioma coreano y su licencia es Apache 2.0. No se dispone de información sobre arquitectura de red neuronal, número de parámetros ni longitud de contexto, ya que el modelo no es un transformer de lenguaje sino una política de decisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (política de decisión entrenada con PPO; red neuronal no especificada) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje; opera sobre estados estructurados del simulador) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (librería `numpy`; se carga vía `connect_tycoon.CompanyBrain.from_hub`) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura de red neuronal subyacente. El modelo se describe como una política de decisión entrenada en dos fases: primero, aprendizaje supervisado a partir de un "presidente de reglas" (una política heurística que sirve de profesor), y después, un ajuste con PPO utilizando recompensas derivadas de los valores de la empresa: beneficio (peso 2.0), satisfacción del cliente (peso 1.5) y riesgo (peso 2.5). El entorno es un simulador empresarial tipo Gymnasium integrado en el paquete `connect-tycoon`, con una configuración de empresa concreta (almacén de 250 unidades, demanda base de 40, coste unitario de 1.5, etc.).

El modelo responde en un formato estructurado denominado JEV (compatible con `typesafe/jev-1.13`), que permite plantear preguntas de tipo elección con criterios y devolver una distribución de probabilidades sobre las opciones, junto con un nivel de confianza y una justificación. Esta interfaz convierte la política en un componente intercambiable dentro de un sistema mayor, donde el agente recibe el estado del departamento (por ejemplo, reembolsos con motivo, nivel de cliente, importe y puntuación de fraude) y emite una decisión.

No se especifican el número de tokens de entrenamiento, la composición del dataset ni innovaciones técnicas como decodificación especulativa o atención lineal, ya que el modelo no es un transformer de lenguaje.

## Capacidades

- Toma de decisiones empresariales en un entorno simulado: asignación de personal, reposición de inventario, marketing, atención al cliente, reembolsos y seguridad.
- Respuesta en formato JEV estructurado, con distribución de probabilidades sobre opciones, nivel de confianza y campo de justificación.
- Gestión de reembolsos con detección de fraude: el ejemplo de la model card muestra cómo decide entre reembolso total, parcial, denegación o derivación a revisión humana en función de la puntuación de fraude.
- Operación de una empresa durante ciclos de 20 días laborables con métricas de negocio (beneficio, satisfacción, incidentes de riesgo, días de stockout).
- Integración con el simulador `connect-tycoon` mediante el comando `connect-tycoon play --brain hf:pwg0218/connectailab-rl-nil-v1-teacher`.
- Capacidad multilingüe: limitada al coreano según la model card.
- No se documentan capacidades de generación de texto libre, código, matemáticas, visión, audio, tool calling genérico ni razonamiento multi-paso fuera del entorno de simulación.

## Casos de uso

- Formación en reinforcement learning aplicado: el modelo sirve como ejemplo completo de un pipeline de RL (entorno Gymnasium, aprendizaje supervisado desde una política heurística, ajuste con PPO) para cursos y talleres, ya que el autor proporciona un notebook de Colab para reproducir el entrenamiento.
- Simulación educativa de gestión empresarial: estudiantes pueden enfrentarse al modelo en el juego CONNECT TYCOON y comparar sus decisiones con las de la política entrenada, observando el impacto en beneficio, satisfacción y riesgo.
- Estudio de políticas de decisión en atención al cliente: el modelo ilustra cómo una política puede aprender a derivar casos sospechosos a revisión humana en lugar de resolverlos automáticamente, equilibrando coste y riesgo.
- Benchmark de referencia para entornos de simulación propios: investigadores que construyan simuladores empresariales pueden usar esta política como línea base para comparar sus propios agentes.
- Demostración de integración de modelos de RL en HuggingFace Hub: el patrón `CompanyBrain.from_hub` y el formato JEV muestran cómo empaquetar y distribuir políticas de decisión de forma reproducible.
- Prototipado de agentes de decisión en entornos estructurados: el formato de entrada/salida con preguntas de elección y distribuciones de probabilidad puede adaptarse a otros dominios con decisiones discretas y criterios ponderados.

## Benchmarks y rendimiento

La model card proporciona una comparación entre la política de reglas y el modelo entrenado sobre 40 meses no vistos previamente:

| Métrica (media de 40 meses) | Política de reglas | connectailab-rl-nil-v1-teacher |
|---|---|---|
| Beneficio mensual | 3,24 millones de wones | 11,47 millones de wones |
| Satisfacción del cliente | 79 % | 95 % |
| Incidentes de riesgo | 7,8 | 1,1 |
| Casos derivados a revisión humana | 37,8 | 15,3 |
| Días de stockout | 10,7 | 0,5 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser una política de decisión cargada con `numpy`, es probable que requiera muy poca memoria, pero no se especifica.
- GPU recomendadas: no disponible; el entrenamiento se puede reproducir en Google Colab según el notebook enlazado, lo que sugiere que cabe en GPU consumer.
- Cabe en GPU consumer: sí, previsiblemente, dado que el entrenamiento se ofrece vía Colab, aunque no se detallan los requisitos exactos.
- Opciones de despliegue: paquete `connect-tycoon` (`pip install "connect-tycoon[game]"`), carga vía `CompanyBrain.from_hub`, y ejecución interactiva con `connect-tycoon play --brain hf:pwg0218/connectailab-rl-nil-v1-teacher`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (políticas de RL para simulación empresarial) con los que establecer una comparación rigurosa.

## Limitaciones y advertencias

- El propio autor advierte que se trata de un modelo educativo sobre un simulador de empresa sintético y que no garantiza ni predice resultados de gestión real.
- El modelo está entrenado y evaluado en una configuración de empresa concreta; su comportamiento fuera de esa configuración no está validado.
- El idioma soportado es únicamente el coreano, lo que limita su uso en entornos en castellano sin adaptación.
- No es un modelo de lenguaje: no genera texto libre ni mantiene conversaciones; su salida es una decisión estructurada en formato JEV.
- No se documentan sesgos específicos, pero al entrenarse con recompensas ponderadas (beneficio 2.0, satisfacción 1.5, riesgo 2.5) la política prioriza implícitamente esos objetivos, lo que puede producir decisiones que no reflejen otros criterios éticos o regulatorios.
- Riesgo de alucinación: no aplica en el sentido habitual, pero la política puede producir decisiones de alta confianza en estados poco representados en el entrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías y el uso está orientado a fines educativos.
- Para producción real en atención al cliente o gestión empresarial sería necesario un reentrenamiento y validación con datos y políticas propias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pwg0218/connectailab-rl-nil-v1-teacher
- Repositorio GitHub CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab para entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de reinforcement learning de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Connect AI (ezerai): https://www.ezerai.xyz
