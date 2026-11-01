# sol-5/connectailab-rl-cassbrain-v1-teacher

## Resumen

`connectailab-rl-cassbrain-v1-teacher` es un modelo de toma de decisiones basado en aprendizaje por refuerzo profundo, publicado por el usuario `sol-5` en el marco del proyecto CONNECT TYCOON del laboratorio CONNECT AI LAB. No es un modelo de lenguaje generativo: es una política (policy) entrenada para operar una empresa simulada durante un ciclo de 20 días laborables, tomando decisiones sobre asignación de personal, reposición de inventario, marketing, atención al cliente, reembolsos y seguridad. El modelo se presenta como el "córtex prefrontal" de un agente empresarial dentro de un simulador de compañía sintética.

La arquitectura concreta no se detalla en la model card; se sabe que se distribuye con la librería `numpy` y que se entrenó mediante una combinación de aprendizaje supervisado (imitación de un "presidente de reglas") y PPO (Proximal Policy Optimization) con recompensas derivadas de los valores de la empresa (beneficio, satisfacción del cliente y riesgo, todos ponderados a 1.0). Las decisiones se expresan en el formato JEV (`typesafe/jev-1.13`), un esquema de pregunta-respuesta estructurada con tipos como `choice` y probabilidades asociadas.

Su relevancia es acotada y educativa: sirve como ejemplo reproducible de cómo aplicar RL a la toma de decisiones empresariales en un entorno Gymnasium, con una mejora medible frente a una política basada en reglas. No está pensado para producción real ni para uso como modelo de lenguaje, y su único idioma declarado es el coreano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (política de RL; no se especifica la red neuronal subyacente) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (opera sobre estados estructurados, no sobre texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (se carga mediante `CompanyBrain.from_hub` de `connect_tycoon`; librería `numpy`) |

## Arquitectura y entrenamiento

El modelo se describe como una política de decisión entrenada en dos fases: primero aprendizaje supervisado imitando a un "presidente de reglas" (un agente heurístico que sigue reglas predefinidas) y después ajuste fino con PPO, usando como señal de recompensa los valores de la empresa simulada: beneficio, satisfacción del cliente y riesgo, todos con peso 1.0. El entorno es un simulador de compañía sintética integrado en el paquete `connect_tycoon`, compatible con Gymnasium y con un pipeline de reinforcement learning.

La interfaz de inferencia es JEV (`typesafe/jev-1.13`): el modelo recibe un estado estructurado (por ejemplo, departamento, motivo, nivel del cliente, importe y puntuación de fraude) y devuelve un objeto JSON con la opción elegida, el vector de probabilidades, la confianza y una etiqueta de razón ("política de aprendizaje por refuerzo"). No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, el tamaño de la red ni innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Toma de decisiones discretas de tipo `choice` sobre estados estructurados del simulador empresarial.
- Gestión de seis áreas operativas: asignación de personal, pedidos de inventario, marketing, atención al cliente, reembolsos y seguridad.
- Emisión de respuestas en formato JEV con probabilidades por opción y nivel de confianza.
- Aprendizaje por refuerzo con PPO sobre un entorno Gymnasium.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes multi-paso: no disponible como capacidad general; el modelo se invoca por decisión individual.
- Capacidades multilingües: solo coreano declarado.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Simulación educativa de gestión empresarial: el modelo se sienta como "presidente" en el juego CONNECT TYCOON y opera la compañía durante 20 días laborables, permitiendo comparar su política con la de un agente basado en reglas.
- Investigación en RL aplicado a decisiones de negocio: sirve como política de referencia (teacher) para estudiar recompensas multiobjetivo (beneficio, satisfacción, riesgo) en un entorno Gymnasium reproducible.
- Docencia de aprendizaje por refuerzo: el notebook de Colab asociado permite entrenar y evaluar el modelo paso a paso, útil en cursos de RL.
- Evaluación de políticas de reembolso: con estados como `department: refund`, `fraud_score` e importe, el modelo decide entre reembolso total, parcial, denegación o revisión humana, con probabilidades explícitas.
- Prototipado de agentes de decisión con interfaz JEV: el formato de pregunta-respuesta estructurada sirve para integrar la política en pipelines que esperan JSON tipado con confianza.
- Benchmark de políticas heurísticas frente a políticas aprendidas: la model card reporta métricas comparativas (beneficio, satisfacción, incidentes) que permiten medir la ganancia del RL frente a reglas.
- Generación de datos sintéticos de decisión: las salidas con probabilidades pueden usarse para destilación o para aumentar datasets de decisiones empresariales simuladas.

## Benchmarks y rendimiento

La model card reporta una comparación agregada sobre 40 meses no vistos, entre el "presidente de reglas" y `jay-company`:

| Métrica (media de 40 meses) | Presidente de reglas | jay-company |
|---|---|---|
| Beneficio mensual | 7,08 M KRW | 17,19 M KRW |
| Satisfacción del cliente | 71 % | 96 % |
| Incidentes de riesgo | 11,5 | 1,9 |
| Confirmaciones humanas excedidas | 69,5 | 14,8 |
| Días sin stock | 9,1 | 0,4 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, lo cual es esperable al no tratarse de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo se carga con `numpy` y no se documenta su tamaño.
- GPU recomendadas: no disponible; no se especifica si requiere GPU.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: paquete `connect_tycoon` (`pip install "connect-tycoon[game]"`), carga vía `CompanyBrain.from_hub("sol-5/connectailab-rl-cassbrain-v1-teacher")` y modo interactivo `connect-tycoon play --brain hf:sol-5/connectailab-rl-cassbrain-v1-teacher`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (políticas de RL para simulación empresarial) con parámetros, contexto o licencia verificables.

## Limitaciones y advertencias

- Modelo educativo sobre un simulador sintético: la propia model card advierte que no garantiza ni predice resultados de gestión real.
- Dominio muy restringido: solo opera sobre el estado estructurado del simulador CONNECT TYCOON; no es un modelo de lenguaje ni un asistente general.
- Idioma: únicamente coreano declarado; no hay soporte multilingüe documentado.
- Sesgos: no documentados; al entrenarse imitando un agente de reglas y optimizar una función de recompensa concreta, hereda los sesgos de esa política y de la ponderación de valores (1.0 en beneficio, satisfacción y riesgo).
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero las probabilidades emitidas pueden estar mal calibradas fuera del entorno de entrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero el modelo no está validado para decisiones empresariales reales.
- Sin datos sobre tamaño, arquitectura ni requisitos de cómputo, lo que dificulta evaluar su reproducibilidad y coste de despliegue.
- Cero descargas y cero likes en el momento de la consulta: ecosistema de validación prácticamente inexistente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sol-5/connectailab-rl-cassbrain-v1-teacher
- Repositorio GitHub CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab de entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL en AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz
