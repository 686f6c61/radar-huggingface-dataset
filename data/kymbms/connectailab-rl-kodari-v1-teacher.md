# kymbms/connectailab-rl-kodari-v1-teacher

## Resumen

connectailab-rl-kodari-v1-teacher es un modelo de política de aprendizaje por refuerzo profundo (deep reinforcement learning) desarrollado por el usuario kymbms, dentro del ecosistema de CONNECT AI LAB y AI CITY BUILDERS, para el simulador de gestión empresarial CONNECT TYCOON. No es un modelo de lenguaje generativo al uso: su tarea es tomar decisiones discretas de negocio (asignación de personal, pedidos de inventario, marketing, atención al cliente, devoluciones y seguridad) durante el equivalente a un mes de operación, es decir, 20 días laborables, y devolver cada decisión en el formato estructurado JEV (`typesafe/jev-1.13`).

El modelo se presenta como el "córtex prefrontal" del simulador: recibe un estado del entorno con forma de consulta JEV y responde con una elección entre opciones predefinidas, una distribución de probabilidad sobre esas opciones y un nivel de confianza. Su entrenamiento combina una primera fase de aprendizaje supervisado imitando a un "jefe basado en reglas" con una segunda fase de ajuste fino mediante PPO (Proximal Policy Optimization), usando como recompensa una función de valor de empresa ponderada por beneficio, satisfacción del cliente y riesgo.

Es relevante en el contexto educativo y de investigación en RL aplicado a la toma de decisiones, porque ilustra un caso completo de imitación más optimización por refuerzo sobre un entorno de simulación, con comparación directa contra una política basada en reglas. La información disponible no detalla la arquitectura de red, el número de parámetros ni la longitud de contexto del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de decisión en RL; la model card no especifica la topología de red) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos para la librería numpy) |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | numpy (library_name: numpy; no se indica safetensors ni GGUF) |

Otras especificaciones declaradas por el autor: pipeline `reinforcement-learning`, entorno basado en Gymnasium, algoritmo PPO, valores de empresa `{"이익": 1.0, "고객 만족": 1.0, "위험": 1.0}` (beneficio 1.0, satisfacción del cliente 1.0, riesgo 1.0) y configuración de empresa `{"warehouse": 250.0, "base_demand": 40.0, "unit_cost": 1.5, "order_scale": 1.0, "staff_bonus": 0, "wage": 0.0, "ad_power": 1.0, "fraud_tool": 0, "extra_cs": 0, "extra_refund": 0}`.

## Arquitectura y entrenamiento

La model card describe un proceso de entrenamiento en dos etapas. En la primera, el modelo aprende por aprendizaje supervisado siguiendo a un "jefe basado en reglas" (규칙 사장), es decir, imita una política heurística preexistente. En la segunda, sus decisiones se corrigen mediante PPO (Proximal Policy Optimization), un algoritmo de política con gradiente de política, usando como señal de recompensa una función de valor de empresa que pondera a partes iguales beneficio, satisfacción del cliente y riesgo. El modelo está etiquetado con `deep-reinforcement-learning`, `ppo`, `gymnasium` y `decision-making`, lo que sitúa el entrenamiento dentro de un entorno compatible con la API de Gymnasium.

La innovación destacable no está en la arquitectura de red, que no se detalla, sino en el protocolo de interacción: el modelo no genera texto libre, sino que responde a consultas estructuradas en formato JEV con campos tipados (`questions`, `decision` de tipo `choice`, `instructions`, `criteria`), y produce una respuesta JSON con la opción elegida, la distribución de probabilidad completa, la confianza y una justificación. El autor usa "córtex prefrontal" como metáfora de la función del modelo dentro del simulador, no como descripción de una arquitectura neurocientífica concreta. No se especifican en la información disponible ni el número de tokens de entrenamiento, ni la composición del dataset, ni si se aplicaron técnicas adicionales como DPO o RLHF.

## Capacidades

- Toma de decisiones discretas de negocio en el simulador CONNECT TYCOON: asignación de personal (인력 배치), pedidos de inventario (재고 발주), marketing (마케팅), atención al cliente (고객센터), devoluciones (환불) y seguridad (보안).
- Respuesta en formato estructurado JEV, devolviendo una opción elegida más una distribución de probabilidad sobre las alternativas y un valor de confianza.
- Optimización multiobjetivo implícita, al haber sido entrenado con recompensa ponderada de beneficio, satisfacción y riesgo.
- Gestión de episodios largos dentro del simulador: la política opera a lo largo de un mes simulado de 20 días laborables.
- Soporte de tool calling: no disponible. Soporte de agentes multi-paso genérico: no disponible.
- Capacidades multilingües: no; el modelo está declarado únicamente para coreano (ko).
- Capacidades especiales: no se declaran modos de "pensamiento", visión ni audio.

## Casos de uso

- Simulación empresarial jugable: el modelo se puede sentar como "jefe" en el juego mediante `connect-tycoon play --brain hf:kymbms/connectailab-rl-kodari-v1-teacher`, operando la empresa de forma autónoma frente al jugador humano.
- Material didáctico de aprendizaje por refuerzo: sirve para ilustrar el ciclo completo de imitación de una política basada en reglas seguida de ajuste con PPO sobre un entorno Gymnasium.
- Comparación de políticas heurísticas frente a políticas aprendidas: permite medir, en las mismas condiciones de simulador, si una política de RL supera a un jefe basado en reglas en beneficio, satisfacción y gestión de riesgo.
- Investigación sobre toma de decisiones con recompensa multiobjetivo, usando la ponderación de beneficio, satisfacción y riesgo como caso de estudio reproducible.
- Enseñanza del protocolo JEV: el modelo es un ejemplo funcional de consulta y respuesta tipadas, útil para explicar cómo estructurar decisiones de un agente en JSON.
- Integración en pipelines educativos de IA empresarial, dado que forma parte del currículo de CONNECT AI LAB y AI CITY BUILDERS.
- Prototipado de agentes de decisión en entornos sintéticos antes de trasladar metodología a dominios reales (con las salvedades de la sección de limitaciones).

## Benchmarks y rendimiento

La model card publica una comparación entre el jefe basado en reglas y el modelo, medida como media sobre 40 meses no vistos previamente (처음 보는 40개월 평균). Los resultados son los únicos datos de rendimiento disponibles; no se aportan métricas estándar tipo MMLU, HumanEval o GSM8K, que no aplican a este tipo de modelo.

| Metrica (media de 40 meses no vistos) | Regla (rule boss) | connectailab-rl-kodari-v1-teacher |
|---|---|---|
| Beneficio mensual | 324万 won | 1111万 won |
| Satisfaccion del cliente | 79% | 95% |
| Incidentes de riesgo | 7.8 | 2.8 |
| Confirmaciones humanas superadas | 37.8 | 21.7 |
| Dias sin stock | 10.7 | 0.5 |

Nota: los importes están expresados en won coreano (만원 = diez mil won). El modelo aprende a reducir tanto los incidentes de riesgo como las intervenciones humanas y los días de rotura de stock, a la vez que incrementa el beneficio y la satisfacción.

## Requisitos de hardware

- VRAM estimada para inferencia: la librería declarada es numpy, por lo que la inferencia se ejecuta en CPU y no requiere GPU. El tamaño en memoria no se especifica.
- GPU recomendadas: no se indica ninguna; el modelo no declara dependencia de GPU.
- Cabe en GPU de consumo: no aplica, dado que no se distribuye como pesos de transformer ni requiere acelerador gráfico.
- Opciones de despliegue: la vía documentada es la librería `connect-tycoon` (`pip install "connect-tycoon[game]"`) y la API `ct.CompanyBrain.from_hub("kymbms/connectailab-rl-kodari-v1-teacher")`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este formato de pesos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (políticas de RL para decisión empresarial en simuladores). El único punto de referencia aportado por el autor es la política basada en reglas del propio simulador, frente a la que se reportan las métricas de la sección de benchmarks.

| Alternativa | Tipo | Beneficio mensual | Satisfaccion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Regla (rule boss) | Politica heuristica del simulador | 324万 won | 79% | no disponible | integrada en el simulador |
| connectailab-rl-kodari-v1-teacher | Politica PPO entrenada | 1111万 won | 95% | Apache 2.0 | HuggingFace (0 descargas, 0 likes) |

Otros modelos comparables: no disponible.

## Limitaciones y advertencias

- Entorno sintético: el propio autor indica que se trata de un modelo educativo sobre un simulador de empresa sintético y que no garantiza ni predice resultados de gestión reales.
- Dominio restringido: la política está especializada en las decisiones del simulador CONNECT TYCOON y no es transferible sin reentrenamiento a otros entornos.
- Idioma: declarado únicamente para coreano (ko); no hay soporte multilingüe.
- Sesgos conocidos: no disponible. Al haberse entrenado imitando una política basada en reglas, puede heredar los sesgos de dicha heurística, aunque esto no se documenta explícitamente.
- Riesgo de alucinación: no aplica en el sentido generativo; el modelo no produce texto libre, sino elecciones tipadas dentro de un conjunto cerrado de opciones. Sí puede presentar calibración imperfecta en las probabilidades mostradas (por ejemplo, el ejemplo de la model card asigna 0.9139 a "full", 0.0005 a "partial" y 0.0005 a "deny").
- Licencia: Apache 2.0, lo que permite uso comercial según los términos de dicha licencia. No se indican restricciones adicionales, pero tampoco se especifican condiciones de uso por parte del autor.
- Adopción: el modelo registra 0 descargas y 0 likes en el momento de la consulta, por lo que no cuenta con validación independiente de la comunidad.
- Trazabilidad de datos: no se detallan el número de tokens, la composición del dataset, el número de parámetros ni la arquitectura de red, lo que dificulta reproducir el entrenamiento.
- Fecha de creación registrada en HuggingFace: 2026-10-14.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kymbms/connectailab-rl-kodari-v1-teacher
- Repositorio GitHub de CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab de entrenamiento RL: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube de CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de aprendizaje por refuerzo de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz
- Formato JEV referenciado: `typesafe/jev-1.13`
