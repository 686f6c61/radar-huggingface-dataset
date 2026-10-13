# Lunation/connectailab-rl-lunar-v1-teacher

## Resumen

connectailab-rl-lunar-v1-teacher es un modelo de aprendizaje por refuerzo (pipeline `reinforcement-learning`) desarrollado por Lunation dentro del ecosistema CONNECT AI LAB y AI CITY BUILDERS. No es un modelo de lenguaje: es una politica de toma de decisiones que actua como el "cortex prefrontal" de una empresa simulada en el entorno CONNECT TYCOON. El modelo gestiona una compania durante un mes (20 dias laborables) tomando decisiones sobre asignacion de personal, pedidos de inventario, marketing, atencion al cliente, reembolsos y seguridad.

El entrenamiento sigue un esquema en dos fases: primero imita a un "presidente por reglas" mediante aprendizaje supervisado y despues ajusta sus decisiones con PPO usando recompensas derivadas del valor de la empresa (beneficio, satisfaccion del cliente y aversion al riesgo, ponderados cada uno con 1.0). Todas las respuestas se emiten en el formato JEV (`typesafe/jev-1.13`), lo que permite consultarlo como una funcion con entradas tipadas y salidas estructuradas con probabilidades por opcion.

Su relevancia radica en que constituye un ejemplo reproducible y de licencia permisiva de politica RL aplicada a decisiones empresariales en un simulador sintetico, con pesos distribuidos como artefactos `numpy` (sin necesidad de GPUs ni de frameworks de deep learning pesados). El modelo esta orientado al idioma coreano (ko) y se comercializa/distribuye con licencia Apache 2.0. No hay informacion publica sobre arquitectura de red, numero de parametros ni longitud de contexto en el sentido de un transformer.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (politica de RL; sin detalle de red en la informacion) |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible (estado estructurado por decision, no contexto de tokens) |
| Tipos de cuantizacion | no disponible (pesos gestionados como artefactos numpy) |
| Idiomas soportados | coreano (ko) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (libreria declarada: numpy) |

## Arquitectura y entrenamiento

La model card no especifica la topologia de la red (capas, dimensiones, funcion de activacion ni numero de parametros). Si indica el procedimiento de aprendizaje: un primer entrenamiento supervisado que imita a un "presidente por reglas" (el modelo aprende a replicar las decisiones de la politica heuristica) seguido de un ajuste con PPO (Proximal Policy Optimization) guiado por recompensas que combinan beneficio economico, satisfaccion del cliente y control de riesgo. La funcion de valor objetivo declarada es `{"이익": 1.0, "고객 만족": 1.0, "위험": 1.0}` (beneficio, satisfaccion del cliente y riesgo, todos con peso 1.0).

La interaccion se realiza mediante el formato JEV (`typesafe/jev-1.13`), que define preguntas tipadas (por ejemplo, decisiones de tipo `choice` con criterios y pesos) y respuestas con la opcion elegida, la distribucion de probabilidad sobre las alternativas, un nivel de confianza y un campo `reason` (en el ejemplo reproducido, "강화학습 정책", es decir, "politica de aprendizaje por refuerzo"). El entorno de simulacion configura parametros de compania como almacen (250.0), demanda base (40.0), coste unitario (1.5), escala de pedido (1.0) o poder publicitario (1.0), entre otros.

## Capacidades

- Toma de decisiones discretas con distribucion de probabilidad explicita por opcion (por ejemplo, reembolso total, parcial, denegado o derivacion a persona).
- Gestion multi-dominio de una empresa simulada: asignacion de personal, pedidos de inventario, marketing, atencion al cliente, reembolsos y seguridad.
- Planificacion a lo largo de un horizonte de 20 dias laborables por episodio (operativa mensual).
- Salida estructurada compatible con JEV (`typesafe/jev-1.13`), con nivel de confianza por decision.
- Deteccion de casos de fraude a traves del campo `fraud_score` del estado y decision de derivacion a revision humana.
- No se documenta soporte de tool calling, function calling, agentes multi-paso fuera del simulador ni capacidades multimodales (vision, audio).

## Casos de uso

- Docencia de aprendizaje por refuerzo: permite estudiar un ciclo completo de imitacion + PPO sobre un simulador reproducible, ejecutable con `numpy` y sin infraestructura GPU.
- Investigacion en politicas de decision empresarial: sirve como linea base (baseline) aprendida frente a heuristicas de reglas en tareas de gestion de inventario, atencion y fraude.
- Simulacion de politicas de reembolso: el modelo decide entre reembolso total, parcial, denegacion o revision humana ponderando fraude y satisfaccion; util para analizar el coste de cada criterio.
- Generacion de datos sinteticos de decisiones: al exponer probabilidades por opcion, puede usarse para poblar conjuntos de datos de comportamiento en entornos `gymnasium`.
- Prototipado en videojuegos y agentes no jugadores (NPC) con comportamiento economico: el modelo gestiona un "presidente" automatizado dentro de CONNECT TYCOON.
- Comparacion de funciones de recompensa: al ajustar el vector de valores (beneficio, satisfaccion, riesgo) puede reentrenarse y medirse el efecto sobre metricas como dias de rotura de stock o incidencias.
- Integracion educativa mediante notebook: el repositorio incluye un cuaderno de Colab para reproducir el entrenamiento.

## Benchmarks y rendimiento

La model card publica una comparativa entre el "presidente por reglas" y este modelo sobre una media de 40 meses no vistos previamente:

| Metrica | Presidente por reglas | connectailab-rl-lunar-v1-teacher |
|---|---|---|
| Beneficio mensual (media) | 324 man-won | 1117 man-won |
| Satisfaccion del cliente | 79% | 96% |
| Incidencias de riesgo | 7.8 | 2.7 |
| Exceso de confirmaciones humanas | 37.8 | 22.4 |
| Dias de rotura de stock | 10.7 | 0.5 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, lo cual es coherente con que no se trata de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al distribuirse como artefactos `numpy` y no depender de frameworks de aceleracion, la inferencia puede ejecutarse en CPU.
- GPU recomendadas: no disponibles; no se documenta requisito de GPU.
- Si cabe en GPU de consumo: no aplica segun la informacion disponible (ejecucion basada en `numpy` sobre CPU).
- Opciones de despliegue: paquete `connect-tycoon` (`pip install "connect-tycoon[game]"`) y carga mediante `ct.CompanyBrain.from_hub(...)`; modo juego con `connect-tycoon play --brain hf:Lunation/connectailab-rl-lunar-v1-teacher`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| connectailab-rl-lunar-v1-teacher | Politica RL (PPO) | no disponible | no aplica | Segun tabla de la model card | apache-2.0 | HuggingFace |
| Presidente por reglas (baseline del propio entorno) | Heuristica | no aplica | no aplica | Inferior en las metricas publicadas | no disponible | Incluido en CONNECT TYCOON |
| Otros modelos comparables | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos de terceros directamente comparables en la documentacion proporcionada.

## Limitaciones y advertencias

- Modelo educativo y de simulacion: la propia model card advierte que es un "modelo educativo sobre un simulador de empresa sintetica" y que no garantiza ni predice resultados de gestion reales.
- Dominio restringido: solo opera dentro del entorno CONNECT TYCOON y su esquema JEV; no es un modelo de proposito general.
- Idioma: exclusivamente coreano (ko) segun la metadata.
- Sesgos: no se documentan analisis de sesgo; las decisiones heredan los criterios del "presidente por reglas" usado en la fase de imitacion.
- Riesgo de decisiones suboptimas fuera de distribucion: el rendimiento reportado corresponde a una media de 40 meses no vistos del simulador, no a entornos reales.
- Alucinacion: no aplica en el sentido de generacion de texto, pero el campo `reason` es una etiqueta fija ("politica de aprendizaje por refuerzo") y no una justificacion explicativa.
- Licencia: Apache 2.0 permite uso comercial, pero debe respetarse la atribucion y los terminos del paquete `connect-tycoon`.
- Popularidad nula en el momento del registro (0 descargas, 0 likes), por lo que no existe validacion externa independiente.
- No se especifican pesos, formato exacto ni version de la red, lo que dificulta la reproducibilidad y la auditoria tecnica.

## Enlaces

- HuggingFace: https://huggingface.co/Lunation/connectailab-rl-lunar-v1-teacher
- Repositorio GitHub CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz
- Formato JEV referenciado: `typesafe/jev-1.13` (referencia citada en la model card)
