# kiwi2030/connectailab-rl-kiwi-v2-teacher

## Resumen

connectailab-rl-kiwi-v2-teacher es un modelo de aprendizaje por refuerzo (RL) desarrollado por kiwi2030 en el marco de CONNECT AI LAB. No es un modelo de lenguaje generativo, sino una política de decisión entrenada para operar una empresa simulada dentro del entorno CONNECT TYCOON durante un ciclo de 20 días laborables. El modelo actúa como el "córtex prefrontal" del agente: decide sobre asignación de personal, reposición de inventario, marketing, atención al cliente, reembolsos y seguridad.

La arquitectura subyacente no es un transformer de lenguaje; se distribuye como artefacto basado en numpy con pipeline de reinforcement-learning. El entrenamiento combina una fase de imitación de un "jefe basado en reglas" (aprendizaje supervisado) seguida de un ajuste fino con PPO (Proximal Policy Optimization) usando como recompensa el vector de valores de la empresa: beneficio (peso 3,0), satisfacción del cliente (2,0) y riesgo (1,0).

Su relevancia es acotada y experimental: demuestra un pipeline completo de RL aplicado a toma de decisiones empresariales en un simulador sintético, con interfaz tipada JEV (`typesafe/jev-1.13`) para consultas y respuestas estructuradas. Es un modelo educativo y de investigación, no un sistema listo para producción real. El modelo solo soporta coreano y tiene cero descargas en el momento de la ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de decisión por aprendizaje por refuerzo (PPO) sobre observaciones estructuradas del simulador; no es un transformer de lenguaje |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; opera sobre un estado estructurado por turno (JSON) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (librería numpy; artefacto cargado vía `ct.CompanyBrain.from_hub`) |

## Arquitectura y entrenamiento

El modelo implementa una política de decisión que recibe un estado estructurado del simulador (por ejemplo, departamento, motivo, nivel de cliente, importe, puntuación de fraude) y devuelve una acción discreta con distribución de probabilidades y confianza. La interfaz de consulta sigue el esquema JEV (`typesafe/jev-1.13`), con preguntas de tipo `choice` y criterios definidos. La respuesta incluye la opción elegida, las probabilidades por opción, un nivel de confianza y un campo de justificación que en el ejemplo se limita a "política de aprendizaje por refuerzo".

El entrenamiento se describe en dos etapas: primero un aprendizaje supervisado imitando a un "jefe basado en reglas" y después un ajuste con PPO guiado por la recompensa compuesta de valores de empresa (beneficio 3,0; satisfacción 2,0; riesgo 1,0). No se especifican en la información disponible el número de parámetros, la arquitectura interna de la red, el volumen de datos de entrenamiento ni detalles del bucle de optimización más allá de la mención a PPO. El entorno de entrenamiento es un simulador sintético de empresa (CONNECT TYCOON) con configuración concreta: almacén de 250,0, demanda base 40,0, coste unitario 1,5, escala de pedido 1,0, salario 0,0 y sin bonificaciones ni herramientas extra activadas.

## Capacidades

- Toma de decisiones discretas en un entorno empresarial simulado: asignación de personal, reposición de inventario, marketing, atención al cliente, reembolsos y seguridad.
- Respuesta estructurada conforme al esquema JEV (`typesafe/jev-1.13`) con probabilidades por opción y nivel de confianza.
- Gestión de reembolsos con criterios de fraude: en el ejemplo de la model card elige "reembolso completo" con probabilidad 0,99 ante un caso con puntuación de fraude 0,3146.
- Operación de un ciclo completo de 20 días laborables como agente autónomo dentro del simulador.
- Soporte de integración con el simulador mediante `connect-tycoon play --brain hf:kiwi2030/connectailab-rl-kiwi-v2-teacher`.
- No soporta tool calling genérico, function calling, agentes multi-paso fuera del simulador, visión, audio ni razonamiento en lenguaje natural libre.
- Capacidad multilingüe limitada al coreano.

## Casos de uso

- Investigación en RL aplicado a decisiones empresariales: usar el modelo como línea base de política PPO en el simulador CONNECT TYCOON para comparar contra el "jefe basado en reglas" en métricas de beneficio, satisfacción y riesgo.
- Docencia y formación en reinforcement learning: el notebook de Colab y el curso de AI CITY BUILDERS permiten reproducir el pipeline de imitación más PPO sobre un entorno Gymnasium.
- Evaluación de políticas de reembolso: consultar al modelo con estados de tipo `refund` para estudiar cómo pondera fraude frente a satisfacción del cliente en distintos umbrales.
- Simulación de gestión de inventario: analizar las decisiones de reposición del agente y su impacto en días de rotura de stock (0,5 días de media frente a 10,7 del jefe basado en reglas en los 40 meses reportados).
- Benchmark de entornos de decisión tipados: emplear la interfaz JEV como referencia para diseñar esquemas de observación/acción en otros simuladores.
- Prototipado de agentes para videojuegos de gestión: integrar el modelo como cerebro de un personaje no jugador en un juego de simulación empresarial mediante la CLI de connect-tycoon.

## Benchmarks y rendimiento

La model card reporta resultados medios sobre 40 meses no vistos previamente en el simulador, comparando el modelo con el jefe basado en reglas:

| Métrica (media 40 meses) | Jefe basado en reglas | connectailab-rl-kiwi-v2-teacher |
|---|---|---|
| Beneficio mensual | 3,24 millones de wones | 11,96 millones de wones |
| Satisfacción del cliente | 79 % | 96 % |
| Incidentes de riesgo | 7,8 | 2,1 |
| Confirmaciones humanas excedidas | 37,8 | 11,3 |
| Días de rotura de stock | 10,7 | 0,5 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, lo cual es esperable al no tratarse de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: no disponible; el modelo se distribuye como artefacto numpy y no requiere GPU para inferencia según la información disponible.
- GPU recomendadas: no aplica para inferencia; el entrenamiento PPO puede ejecutarse en CPU o en GPU consumer, pero no se especifica.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU o incluso solo CPU, aunque el dato no está confirmado en la model card.
- Opciones de despliegue: paquete `connect-tycoon` (extra `game`), carga vía `ct.CompanyBrain.from_hub` y CLI `connect-tycoon play`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Licencia | Disponibilidad |
|---|---|---|---|---|
| connectailab-rl-kiwi-v2-teacher | Política RL (PPO) | CONNECT TYCOON | Apache 2.0 | Hugging Face, 0 descargas |
| Jefe basado en reglas (referencia interna) | Sistema de reglas | CONNECT TYCOON | no disponible | Incluido en el simulador |
| Otros modelos de RL para decisión empresarial | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de terceros en la misma categoría (RL para simulación empresarial) dentro de la información proporcionada.

## Limitaciones y advertencias

- Modelo educativo y de investigación sobre un simulador sintético; la propia model card advierte que no garantiza ni predice resultados de gestión reales.
- Sesgos potenciales derivados de la función de recompensa (beneficio 3,0, satisfacción 2,0, riesgo 1,0): la política prioriza el beneficio sobre la satisfacción y el riesgo, lo que puede producir decisiones agresivas en contextos fuera de distribución.
- Riesgo de sobreajuste al simulador CONNECT TYCOON y a su configuración concreta; el comportamiento puede degradarse con otras configuraciones de empresa.
- Solo soporta coreano; no hay soporte multilingüe.
- No es un modelo de lenguaje: no genera texto libre, no razona en lenguaje natural y su campo `reason` se limita a "política de aprendizaje por refuerzo".
- Licencia Apache 2.0 permite uso comercial del artefacto, pero el simulador y las dependencias pueden tener sus propias condiciones.
- Cero descargas y cero likes en el momento de la ficha; ecosistema y mantenimiento no validados por la comunidad.
- No se especifican parámetros, arquitectura interna ni datos de entrenamiento, lo que dificulta la reproducibilidad y la auditoría.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kiwi2030/connectailab-rl-kiwi-v2-teacher
- Repositorio CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS (curso de RL): https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz
