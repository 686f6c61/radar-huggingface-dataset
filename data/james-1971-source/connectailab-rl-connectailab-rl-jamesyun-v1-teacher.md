# James-1971-source/connectailab-rl-connectailab-rl-jamesyun-v1-teacher

## Resumen

connectailab-rl-connectailab-rl-jamesyun-v1-teacher es un modelo de aprendizaje por refuerzo (RL) publicado por el desarrollador James-1971-source dentro del proyecto CONNECT TYCOON, una iniciativa educativa de CONNECT AI LAB y AI CITY BUILDERS. No es un modelo de lenguaje generativo: es una política de decisión entrenada para operar una empresa simulada durante un mes de 20 días laborables, tomando decisiones sobre asignación de personal, reposición de inventario, marketing, atención al cliente, reembolsos y seguridad. El modelo actúa como el "lóbulo prefrontal" del simulador y devuelve sus decisiones en el formato estructurado JEV (`typesafe/jev-1.13`).

La relevancia del modelo es acotada y fundamentalmente pedagógica: sirve como ejemplo reproducible de un pipeline completo de RL (aprendizaje supervisado a partir de un "presidente por reglas" seguido de ajuste con PPO) aplicado a un entorno de simulación empresarial con recompensas multiobjetivo (beneficio, satisfacción del cliente, riesgo). La model card reporta que, frente a un agente basado en reglas, la política entrenada mejora el beneficio mensual medio de 3,24 a 11,11 millones de wones, eleva la satisfacción del 79 % al 95 % y reduce los incidentes de riesgo de 7,8 a 2,8 por mes en una evaluación sobre 40 meses no vistos.

El modelo se distribuye con licencia Apache 2.0, está etiquetado únicamente para coreano (`ko`) y declara `numpy` como librería, lo que sugiere que la política se serializa como arrays numéricos en lugar de pesos de un transformer. No se dispone de información sobre arquitectura de red, número de parámetros ni longitud de contexto en el sentido habitual de los LLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de aprendizaje por refuerzo (PPO) sobre un simulador de empresa; arquitectura de red no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; opera sobre estados estructurados del simulador) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (librería declarada: numpy) |

## Arquitectura y entrenamiento

La información disponible describe el proceso de entrenamiento en dos fases: primero un aprendizaje supervisado a partir de las decisiones de un "presidente por reglas" (rule-based teacher), y después un ajuste con PPO (Proximal Policy Optimization) usando como recompensa el vector de valores de la empresa `{"이익": 1.0, "고객 만족": 1.0, "위험": 1.0}` (beneficio, satisfacción del cliente y riesgo, con peso 1.0 cada uno). El entorno es el simulador CONNECT TYCOON, con una configuración de empresa concreta: almacén de 250 unidades, demanda base de 40, coste unitario de 1,5, escala de pedido de 1,0, poder publicitario de 1,0 y sin bonus de personal, salario, herramienta antifraude ni atención al cliente o reembolso extra.

No se especifica en la información proporcionada el tipo de red neuronal empleada (MLP, transformer u otra), el número de capas, las dimensiones de las capas ocultas, el número de pasos de entrenamiento, el tamaño del dataset de demostración del profesor por reglas ni los hiperparámetros de PPO. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal, que no aplican a este tipo de política. La interfaz de decisión es un esquema JEV con preguntas de tipo `choice` y criterios discretos (por ejemplo, `full`, `partial`, `deny`, `human` en el caso de reembolsos), y el modelo devuelve una distribución de probabilidad sobre esas opciones junto con un nivel de confianza.

## Capacidades

- Toma de decisiones discretas sobre estados estructurados del simulador empresarial: asignación de personal, pedidos de inventario, marketing, atención al cliente, reembolsos y seguridad.
- Emisión de respuestas en formato JEV (`typesafe/jev-1.13`) con distribución de probabilidades por opción y campo de confianza.
- Razonamiento multiobjetivo implícito: la política fue optimizada para equilibrar beneficio, satisfacción del cliente y riesgo simultáneamente.
- Operación autónoma durante episodios de 20 días laborables (un mes simulado).
- Integración con el paquete `connect-tycoon` mediante `CompanyBrain.from_hub(...)` y con el modo de juego `connect-tycoon play --brain hf:...`.
- Capacidad lingüística: únicamente coreano en las etiquetas del modelo; no se documentan capacidades multilingües.
- No se documentan capacidades de generación de texto libre, código, matemáticas, visión, audio, tool calling genérico ni agentes multi-paso fuera del simulador.

## Casos de uso

- Docencia de aprendizaje por refuerzo: el modelo sirve como ejemplo completo y reproducible de un pipeline supervisado + PPO, con notebook de Colab asociado, para cursos de RL aplicado.
- Simulación empresarial educativa: permite a estudiantes enfrentar un agente entrenado contra un agente basado en reglas y analizar las diferencias de política en beneficio, satisfacción y riesgo.
- Investigación en recompensas multiobjetivo: el vector de valores con pesos iguales permite estudiar cómo una política PPO equilibra objetivos en conflicto (por ejemplo, reembolsar siempre maximiza satisfacción pero erosiona beneficio).
- Benchmark de agentes de decisión: el modelo puede actuar como referencia ("teacher") para comparar nuevas políticas en el mismo entorno CONNECT TYCOON con la configuración documentada.
- Estudio de políticas de reembolso y antifraude: la interfaz JEV con opciones `full`/`partial`/`deny`/`human` y un `fraud_score` de entrada permite analizar el comportamiento de la política ante casos límite.
- Integración en demos interactivas: el comando `connect-tycoon play --brain hf:...` permite desplegar el agente como "presidente" en la demo jugable para divulgación.
- Prototipado de asistentes de decisión con salida estructurada: el patrón JEV (pregunta tipada + distribución de probabilidad + confianza) es reutilizable en otros dominios con decisiones discretas.

## Benchmarks y rendimiento

La model card reporta una evaluación sobre 40 meses no vistos comparando el agente entrenado con el "presidente por reglas":

| Métrica (media en 40 meses) | Presidente por reglas | Modelo RL |
|---|---|---|
| Beneficio mensual | 3,24 M KRW | 11,11 M KRW |
| Satisfacción del cliente | 79 % | 95 % |
| Incidentes de riesgo | 7,8 | 2,8 |
| Escalados a revisión humana | 37,8 | 21,7 |
| Días sin stock | 10,7 | 0,5 |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, lo cual es esperable al no tratarse de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: no disponible; al ser una política serializada con `numpy` y no un transformer, es previsible que los requisitos sean mínimos, pero no se documenta el tamaño del artefacto.
- GPU recomendadas: no disponibles; el entrenamiento se realizó presumiblemente en Google Colab (se enlaza un notebook), pero no se especifica hardware.
- Compatibilidad con GPU de consumo: no confirmada en la documentación; por la naturaleza del modelo (política numpy) es plausible que funcione en CPU, pero no se afirma explícitamente.
- Opciones de despliegue: paquete `connect-tycoon` (`pip install "connect-tycoon[game]"`), carga vía `CompanyBrain.from_hub` y ejecución con `connect-tycoon play --brain hf:...`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Licencia | Disponibilidad |
|---|---|---|---|---|
| connectailab-rl-connectailab-rl-jamesyun-v1-teacher | Política RL (PPO) | CONNECT TYCOON | Apache 2.0 | Hugging Face |
| Presidente por reglas (baseline del proyecto) | Agente basado en reglas | CONNECT TYCOON | no disponible | Incluido en el simulador |
| Otros modelos de decisión RL de propósito general | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables de la misma categoría (políticas RL para simulación empresarial) en la documentación proporcionada. La comparación más directa disponible es la del baseline por reglas incluida en la propia model card.

## Limitaciones y advertencias

- Modelo educativo sobre un simulador sintético: la propia model card advierte que no garantiza ni predice resultados de gestión real.
- Especialización estrecha: la política está entrenada para una configuración concreta de empresa (`warehouse` 250, `base_demand` 40, `unit_cost` 1.5, etc.); su comportamiento fuera de esa configuración no está validado.
- Idioma: etiquetado únicamente para coreano; no se documenta soporte de otros idiomas.
- Sin información sobre sesgos: no se documentan análisis de sesgo, y al ser una política entrenada con recompensas definidas por el autor, hereda los sesgos de esa función de recompensa.
- Riesgo de sobreajuste al simulador: las métricas reportadas provienen del mismo entorno de entrenamiento (40 meses no vistos, pero del mismo generador); no hay validación en entornos externos.
- Licencia Apache 2.0: permite uso comercial, pero al tratarse de un modelo educativo y de un simulador, el uso comercial fuera del proyecto requeriría validación propia.
- Dependencia del ecosistema `connect-tycoon`: la interfaz JEV y el cargador `CompanyBrain` son específicos del proyecto; no hay API estándar de inferencia.
- Sin datos de benchmarks estándar ni de robustez ante distribuciones de estado fuera de rango.
- El modelo se declara en fase de "conexión de modelos en pruebas" (모델 연결은 테스트 중), lo que sugiere que la integración puede ser inestable.
- Creado y actualizado el 2026-10-28 con 0 descargas y 0 likes: sin validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/James-1971-source/connectailab-rl-connectailab-rl-jamesyun-v1-teacher
- Repositorio GitHub CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS (curso de RL): https://www.aicitybuilders.com/robot
- AI CITY BUILDERS (sitio principal): https://www.aicitybuilders.com
- Connect AI: https://www.ezerai.xyz
