# jfcrown7/connectailab-rl-jay-v1-teacher

## Resumen

`connectailab-rl-jay-v1-teacher` es un modelo de decisión por refuerzo (RL) desarrollado por el usuario jfcrown7 dentro del ecosistema CONNECT AI LAB y AI CITY BUILDERS. No es un modelo de lenguaje generativo, sino una política entrenada con PPO que actúa como "presidente" (사장) de una empresa simulada en el entorno CONNECT TYCOON. Su tarea consiste en tomar decisiones operativas durante un mes simulado de 20 días laborables: asignación de personal, pedidos de inventario, marketing, atención al cliente, reembolsos y seguridad.

El modelo se distribuye con la librería `numpy` y el pipeline `reinforcement-learning`, y responde a consultas estructuradas en formato JEV (`typesafe/jev-1.13`), devolviendo decisiones con distribuciones de probabilidad y un campo de confianza. Se entrenó en dos fases: primero imitando a un "presidente basado en reglas" mediante aprendizaje supervisado y después ajustando la política con PPO usando recompensas derivadas de los valores de la empresa (beneficio, satisfacción del cliente y riesgo, todos con peso 1.0).

Es relevante como ejemplo de aplicación de RL a la toma de decisiones empresariales en un simulador, con métricas comparativas frente a la política de reglas, y como caso de integración de políticas RL en un formato de preguntas y respuestas tipado (JEV) orientado a agentes. Su alcance es educativo y acotado al simulador; el propio autor advierte que no garantiza ni predice resultados de gestión reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de aprendizaje por refuerzo profundo (deep RL) entrenada con PPO; arquitectura de red no detallada en la información disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el estado se pasa como estructura JSON por consulta) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (librería declarada: numpy) |

## Arquitectura y entrenamiento

El modelo es una política de decisión entrenada con aprendizaje por refuerzo profundo sobre el simulador CONNECT TYCOON, que expone una interfaz compatible con Gymnasium. El entrenamiento consta de dos etapas: una fase de aprendizaje supervisado en la que la política imita a un "presidente basado en reglas" (규칙 사장), seguida de un ajuste fino con PPO en el que la recompensa proviene de los valores de la empresa definidos como `{"이익": 1.0, "고객 만족": 1.0, "위험": 1.0}` (beneficio, satisfacción del cliente y riesgo, con peso unitario). La información disponible no detalla el número de tokens, el volumen de episodios ni la composición del dataset de entrenamiento.

La innovación destacable no está en la arquitectura de red, sino en la interfaz de despliegue: el modelo se consulta mediante peticiones JEV con un estado estructurado (por ejemplo, departamento, motivo, nivel de cliente, importe y puntuación de fraude) y devuelve una respuesta tipada con la opción elegida, las probabilidades de cada alternativa y un nivel de confianza. El estado del simulador se configura con parámetros como `warehouse`, `base_demand`, `unit_cost`, `order_scale`, `wage`, `ad_power` o `fraud_tool`, lo que permite reproducir el entorno de evaluación.

## Capacidades

- Toma de decisiones discretas entre opciones definidas en la consulta (por ejemplo, reembolso completo, parcial, denegación o derivación a una persona).
- Asignación de personal y planificación de turnos en el simulador de empresa.
- Gestión de inventario y pedidos de reposición.
- Decisiones de marketing y inversión publicitaria.
- Gestión de atención al cliente, reembolsos y detección de fraude.
- Decisiones de seguridad.
- Salida con distribución de probabilidad por opción y campo de confianza, lo que permite umbrales de derivación a revisión humana.
- Integración con el formato JEV (`typesafe/jev-1.13`) para preguntas y respuestas estructuradas.
- Soporte de ejecución como "cerebro" de empresa en el simulador mediante `connect_tycoon.CompanyBrain`.
- No soporta generación de texto libre, visión, audio ni tool calling genérico; su ámbito es la decisión dentro del simulador.

## Casos de uso

- Evaluación de políticas de decisión en simulación empresarial: el modelo se carga con `ct.CompanyBrain.from_hub(...)` y se ejecuta sobre el entorno CONNECT TYCOON para comparar su comportamiento con la política de reglas en métricas de beneficio, satisfacción, incidentes de riesgo, derivaciones a humanos y días de rotura de stock.
- Docencia de aprendizaje por refuerzo: sirve como ejemplo completo de un ciclo de imitación más PPO, con un cuaderno de Colab asociado para reproducir el entrenamiento y examinar la influencia de la recompensa en la política final.
- Investigación sobre formatos de interacción agente-entorno: el par pregunta/respuesta JEV permite estudiar cómo se estructura el estado, las opciones y las probabilidades en políticas RL desplegadas como servicio.
- Diseño de políticas de reembolso y antifraude en entornos simulados: el estado incluye `fraud_score` y el modelo devuelve probabilidades por alternativa, lo que facilita analizar umbrales de derivación a revisión humana.
- Prototipado de asistentes de decisión con intervención humana: el campo `confidence` y la opción `human` permiten construir flujos en los que las decisiones de baja confianza se escalan a una persona.
- Benchmarking interno de políticas RL: las métricas publicadas (beneficio mensual, satisfacción, incidentes, derivaciones y roturas de stock) permiten usar el modelo como línea base "teacher" frente a nuevas políticas entrenadas en el mismo simulador.
- Demostración interactiva: el comando `connect-tycoon play --brain hf:jfcrown7/connectailab-rl-jay-v1-teacher` permite observar la política operando la empresa en el juego.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card, sobre 40 meses no vistos (media):

| Métrica | Presidente basado en reglas | connectailab-rl-jay-v1-teacher |
|---|---|---|
| Beneficio mensual | 3,24 millones de wones | 11,11 millones de wones |
| Satisfacción del cliente | 79 % | 95 % |
| Incidentes de riesgo | 7,8 | 2,8 |
| Derivaciones a confirmación humana | 37,8 | 21,7 |
| Días de rotura de stock | 10,7 | 0,5 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño de la política no se especifica en la información proporcionada.
- GPU recomendadas: no disponible. Al tratarse de una política RL de decisión, es probable que la inferencia en CPU sea suficiente, pero este dato no se confirma en la documentación.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: paquete `connect-tycoon` (`pip install "connect-tycoon[game]"`), carga mediante `CompanyBrain.from_hub` y ejecución del juego con `connect-tycoon play --brain hf:jfcrown7/connectailab-rl-jay-v1-teacher`. Librería declarada: `numpy`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-jay-v1-teacher | Política RL (PPO) para simulación empresarial | no disponible | no disponible | Apache 2.0 | HuggingFace |
| Presidente basado en reglas (política de referencia del simulador) | Sistema de reglas | no aplica | no aplica | no disponible | Incluido en CONNECT TYCOON |
| Otros modelos de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de terceros en la misma categoría (políticas RL para simulación de gestión empresarial) dentro de la información proporcionada.

## Limitaciones y advertencias

- Ámbito restringido: el modelo solo decide dentro del simulador CONNECT TYCOON y con el esquema de estado y opciones definido; no es un modelo de lenguaje ni un asistente general.
- El propio autor indica que es un modelo educativo sobre un simulador sintético de empresa y que no garantiza ni predice resultados de gestión reales.
- Idioma: la documentación y los ejemplos están en coreano; el soporte de otros idiomas no está declarado.
- Riesgo de sobreajuste al simulador: las métricas publicadas corresponden a 40 meses no vistos del mismo entorno, no a entornos distintos ni a configuraciones de empresa diferentes de la indicada en la model card.
- Dependencia de la configuración: el comportamiento depende de parámetros del entorno (`warehouse`, `base_demand`, `unit_cost`, `order_scale`, `wage`, `ad_power`, `fraud_tool`, etc.); cambios en la configuración pueden alterar la calidad de las decisiones.
- Confianza no calibrada de forma explícita: se publica un campo `confidence`, pero no se documenta ningún procedimiento de calibración ni umbrales recomendados para derivación a humanos.
- Sesgos: no se documentan análisis de sesgo; al entrenarse con recompensas definidas por el autor (beneficio, satisfacción y riesgo con peso 1.0), la política hereda esas prioridades.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución y conservación del aviso de licencia; no se declaran restricciones adicionales.
- Madurez: el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, y la fecha de creación y actualización es la misma (2026-10-28), sin historial de versiones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jfcrown7/connectailab-rl-jay-v1-teacher
- Repositorio CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Cuaderno de Colab de entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de aprendizaje por refuerzo de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz
- Formato JEV referenciado: `typesafe/jev-1.13` (identificador citado en la model card; no se proporciona URL directa)
