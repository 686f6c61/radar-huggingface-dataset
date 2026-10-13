# litzor/connectailab-rl-litzor-v2-teacher

## Resumen

connectailab-rl-litzor-v2-teacher es una politica de aprendizaje por refuerzo profundo (deep reinforcement learning) desarrollada por el usuario litzor dentro del ecosistema CONNECT AI LAB / AI CITY BUILDERS. No es un modelo de lenguaje: se trata de un cerebro de decision que actua como el "prefrontal" de una empresa simulada en el entorno CONNECT TYCOON, encargandose de tomar decisiones operativas mes a mes (20 dias laborables) sobre asignacion de personal, pedidos de inventario, marketing, atencion al cliente, reembolsos y seguridad.

El modelo se entrena en dos fases: primero aprende imitando a un "jefe de reglas" (aprendizaje supervisado) y despues ajusta sus decisiones mediante PPO (Proximal Policy Optimization) usando como recompensa el valor de la empresa, definido como un vector de tres objetivos: beneficio, satisfaccion del cliente y aversion al riesgo. La particularidad del sistema es que todas sus respuestas se emiten en el formato JEV (referencia `typesafe/jev-1.13`), lo que permite consultarlo como si fuera un modelo que responde a preguntas estructuradas con opciones discretas y probabilidades asociadas.

La relevancia de este modelo es fundamentalmente educativa y de investigacion aplicada: demuestra un pipeline completo de RL (entorno Gymnasium, agente PPO, exportacion a NumPy) sobre un simulador de negocio sintetico, publicado bajo licencia Apache 2.0 y con solo idioma coreano. Segun la model card, supera al jefe de reglas de referencia con un incremento del 256 % en beneficio mensual y una reduccion del 94 % en dias de rotura de stock en 40 meses de simulacion, aunque no hay datos publicos sobre su tamano de parametros ni su arquitectura interna de red.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (politica de RL; el entorno usa Gymnasium y el entrenamiento es PPO, pero la topologia de red no se detalla) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (no es un modelo de lenguaje; consume un estado estructurado de empresa, no secuencias de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (la libreria declarada en HuggingFace es `numpy`) |

## Arquitectura y entrenamiento

Segun la informacion disponible, el modelo es una politica de decision entrenada con aprendizaje por refuerzo profundo sobre un entorno del ecosistema Gymnasium. El proceso de entrenamiento descrito en la model card tiene dos etapas: una primera fase de aprendizaje supervisado en la que la politica imita a un "jefe de reglas" (el actor de referencia del simulador), y una segunda fase de ajuste fino con PPO en la que la recompensa proviene de los valores de la empresa (beneficio, satisfaccion del cliente y riesgo). No se especifican ni el numero de parametros, ni las capas, ni el volumen de datos de entrenamiento, ni la composicion del dataset.

La innovacion tecnica destacable no esta en la arquitectura de red, sino en la interfaz de decision: el modelo recibe estados estructurados (por ejemplo, un estado del departamento de reembolsos con motivo, nivel de cliente, importe y `fraud_score`) y devuelve respuestas en el formato JEV con tipo de pregunta, opcion elegida, distribucion de probabilidades, nivel de confianza y una justificacion. Las acciones cubren decisiones discretas tipo eleccion (reembolso total, parcial, denegar o escalar a humano). El tag `prefrontal-cortex` refleja la metafora de diseno: un modulo central que arbitra decisiones de alto nivel de la compania simulada.

## Capacidades

- Decision making operativo sobre un estado estructurado de empresa: personal, pedidos de inventario, marketing, atencion al cliente, reembolsos y seguridad.
- Salida en formato JEV (`typesafe/jev-1.13`): respuestas tipadas con opciones, probabilidades por alternativa, confianza y motivo.
- Politica entrenada con PPO para optimizar una funcion de recompensa multiobjetivo (beneficio, satisfaccion y riesgo).
- Capacidad de operar un ciclo mensual completo de negocio (20 dias laborables) dentro del simulador CONNECT TYCOON.
- Integracion con el simulador mediante las APIs `CompanyBrain.from_hub` y el comando `connect-tycoon play --brain hf:litzor/connectailab-rl-litzor-v2-teacher`.
- Capacidad de aprendizaje por imitacion de un jefe de reglas antes del ajuste por refuerzo.
- No dispone de generacion de texto libre, codigo, matematicas generales, vision, audio, tool calling ni razonamiento multi-paso generico fuera del entorno para el que fue entrenado.

## Casos de uso

- Investigacion en aprendizaje por refuerzo aplicado a negocio: usar el simulador CONNECT TYCOON como banco de pruebas para comparar politicas PPO frente a heuristicas basadas en reglas, aprovechando que el modelo esta publicado con licencia Apache 2.0.
- Docencia y formacion en RL: el repositorio incluye un cuaderno de Colab para entrenar el modelo, de modo que sirve como material didactico para explicar el ciclo completo de un agente (entorno, recompensa, PPO y exportacion de pesos).
- Benchmarking de politicas de decision: el modelo actua como referencia entrenada ("teacher") contra la que medir nuevas variantes de agente, ya que la model card reporta metricas de partida sobre 40 meses de simulacion.
- Simulacion de politicas de reembolso y riesgo: el ejemplo de la model card sobre el departamento de reembolsos permite estudiar como una politica pondera reembolso total frente a parcial, negativa o escalado a humano segun el `fraud_score`.
- Experimentacion con recompensas multiobjetivo: util para estudiar el equilibrio entre beneficio, satisfaccion del cliente y riesgo en un entorno controlado y reproducible.
- Prototipado educativo de "empresa dirigida por IA": integrar el cerebro en la demo jugable (`pip install "connect-tycoon[game]"`) para mostrar en talleres como una politica RL toma decisiones de gestion.
- Estudio de interfaces de decision tipadas: sirve como ejemplo practico de integracion de un agente RL con un protocolo de consulta estructurado (JEV) en lugar de texto libre.

## Benchmarks y rendimiento

La model card publica resultados de simulacion a lo largo de 40 meses, comparando la politica entrenada con el jefe de reglas de referencia:

| Metrica (media de 40 meses, meses nuevos) | Jefe de reglas (base) | connectailab-rl-litzor-v1-teacher |
|---|---|---|
| Beneficio mensual | 324 万 won | 1153 万 won (+256 %) |
| Satisfaccion del cliente | 79 % | 96 % (+17 puntos porcentuales) |
| Incidentes de riesgo | 7,8 | 2,9 (-63 %) |
| Escalados a revision humana | 37,8 | 20,1 (-47 %) |
| Dias de rotura de stock | 10,7 | 0,6 (-94 %) |

Nota: los datos anteriores proceden de la tabla de la model card, que rotula el modelo como "connectailab-rl-litzor-v1-teacher", mientras que el identificador del repositorio en HuggingFace es "connectailab-rl-litzor-v2-teacher". La model card no aclara esta discrepancia. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros), ya que no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. La libreria declarada es NumPy, lo que apunta a una politica de pequeno tamano ejecutable en CPU, pero la model card no especifica requisitos ni tamano de pesos.
- GPU recomendadas: no disponible; si la inferencia es efectivamente en NumPy, no requiere GPU.
- Compatibilidad con GPU de consumo: no disponible por falta de datos de tamano, aunque por la naturaleza del artefacto (politica NumPy para un simulador) es previsible que quepa en cualquier equipo de consumo.
- Opciones de despliegue: integracion mediante la libreria `connect-tycoon` (`CompanyBrain.from_hub`, `connect-tycoon play --brain hf:...`). No se documentan servidores de inferencia tipo vLLM, TGI, llama.cpp u Ollama, que no aplican a este tipo de artefacto.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno / tarea | Licencia | Disponibilidad |
|---|---|---|---|---|
| connectailab-rl-litzor-v2-teacher | Politica RL (PPO) | Decision empresarial en CONNECT TYCOON | Apache 2.0 | HuggingFace |
| Jefe de reglas de CONNECT TYCOON (baseline) | Heuristica de reglas | Mismo entorno | No especificada en la informacion disponible | Dentro del simulador |
| Otras politicas RL de Gymnasium | Politica RL | Entornos de control clasicos (CartPole, MuJoCo, etc.) | Variable | Variable |

No se dispone de informacion sobre otros modelos directamente comparables en la misma categoria (decision empresarial en un simulador propio) mas alla del baseline de reglas incluido en la propia model card.

## Limitaciones y advertencias

- Es un modelo educativo sobre un simulador sintetico: la propia model card advierte que no garantiza ni predice resultados empresariales reales.
- El modelo solo esta declarado para coreano (ko); no hay evidencia de soporte multilingue.
- No hay informacion sobre sesgos especificos, pero cualquier politica entrenada con una recompensa concreta hereda la definicion de objetivos de ese diseno (aqui, pesos de beneficio, satisfaccion y riesgo fijados por el autor).
- Riesgo de alucinacion: no aplicable en el sentido de generacion de texto, ya que emite decisiones tipadas; sin embargo, las probabilidades y justificaciones ("강화학습 정책") son internas a la politica y no deben interpretarse como explicaciones causales verificadas.
- Limitacion de contexto: no maneja texto libre ni conversaciones; depende de un esquema de estado estructurado definido por el simulador.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo esta atado al ecosistema `${CONNECT TYCOON}` y su utilidad fuera de ese simulador es limitada.
- Discrepancia de versiones entre el identificador del repositorio (v2) y el nombre usado en la propia model card (v1), lo que puede generar confusion al citar resultados.
- El repositorio presenta 0 descargas y 0 "likes", por lo que no existe validacion externa de la comunidad ni replicacion independiente de los resultados publicados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/litzor/connectailab-rl-litzor-v2-teacher
- Perfil del autor: https://huggingface.co/litzor
- Repositorio CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Cuaderno de Colab de entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de IA con aprendizaje por refuerzo: https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz
- Referencia de formato JEV citada en la model card: `typesafe/jev-1.13` (identificador de HuggingFace, sin URL directa en la informacion disponible)
