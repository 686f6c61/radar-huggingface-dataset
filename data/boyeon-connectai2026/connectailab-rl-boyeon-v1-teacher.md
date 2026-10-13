# boyeon-connectai2026/connectailab-rl-boyeon-v1-teacher

## Resumen

El modelo `connectailab-rl-boyeon-v1-teacher` es una política de decisión entrenada con aprendizaje por refuerzo profundo (PPO) que actúa como "cerebro" de una empresa dentro del simulador educativo CONNECT TYCOON, desarrollado por CONNECT AI LAB en colaboración con AI CITY BUILDERS. No es un modelo de lenguaje: es una política de decisión que recibe un estado estructurado del simulador y devuelve una elección discreta (por ejemplo, aprobar un reembolso completo, parcial, denegarlo o escalarlo a revisión humana), serializada en formato JEV (`typesafe/jev-1.13`).

El problema que resuelve es la toma de decisiones multiobjetivo bajo restricciones: el agente debe maximizar simultáneamente beneficio, satisfacción del cliente y minimización de riesgo durante un mes simulado de 20 días laborables, gestionando personal, reposición de inventario, marketing, atención al cliente, reembolsos y seguridad. Según la model card, el entrenamiento combina una fase de aprendizaje supervisado a partir de un "jefe" basado en reglas y una fase posterior de PPO con recompensas derivadas de los tres valores de empresa (beneficio, satisfacción, riesgo, todos ponderados a 1.0).

El modelo se publica como pesos NumPy con licencia Apache 2.0, solo soporta coreano y está pensado como modelo "teacher" para generar decisiones de referencia y destilarlas en políticas más pequeñas. Es relevante como ejemplo reproducible de RL aplicado a decisiones empresariales y como interfaz JEV para integrar políticas de RL en flujos estructurados, aunque su ámbito es estrictamente un simulador sintético y no garantiza resultados reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de política entrenada con PPO sobre un entorno Gymnasium (no es un transformer ni un modelo generativo de tokens) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no disponible; no aplicable: consume un diccionario de estado por decisión, no una ventana de tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | NumPy (libreria declarada: `numpy`); no se mencionan safetensors ni GGUF |
| Pipeline declarado | reinforcement-learning |
| Libreria de inferencia | NumPy, a traves del paquete `connect-tycoon` |
| Autor | boyeon-connectai2026 (CONNECT AI LAB) |
| Fecha de publicacion | 13 de octubre de 2026 (segun metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

Se trata de una política de decisión profunda (deep reinforcement learning) integrada en el simulador CONNECT TYCOON, un entorno tipo Gymnasium que modela una empresa durante 20 días laborables. La model card describe un proceso en dos fases: primero se entrena al agente para imitar a un "jefe basado en reglas" mediante aprendizaje supervisado (behavior cloning), y despues se ajusta la política con PPO utilizando como señal de recompensa los valores de la empresa: beneficio, satisfacción del cliente y aversión al riesgo, los tres con peso 1.0. El agente decide sobre seis áreas operativas: asignación de personal, pedidos de inventario, marketing, atención al cliente, reembolsos y seguridad.

La salida no es texto libre, sino una estructura JEV con decisiones de tipo `choice` acompañadas de probabilidades por opción y un campo de confianza. Por ejemplo, ante una solicitud de reembolso con `fraud_score` 0,1113732861354947, el modelo devuelve la opción `full` con probabilidad 0,9921. La configuración de empresa declarada en la model card es `{"warehouse": 250.0, "base_demand": 40.0, "unit_cost": 1.5, "order_scale": 1.0, "staff_bonus": 0, "wage": 0.0, "ad_power": 1.0, "fraud_tool": 0, "extra_cs": 0, "extra_refund": 0}`. No se documentan detalles de la topología de red, número de capas, dimensión de las observaciones ni hiperparámetros de PPO.

## Capacidades

- Toma de decisiones discretas sobre estados estructurados del simulador, no generación de texto ni razonamiento en lenguaje natural.
- Gestión operativa de empresa simulada: colocación de personal, pedidos de inventario, campañas de marketing, atención al cliente, gestión de reembolsos y decisiones de seguridad.
- Optimización multiobjetivo con tres criterios simultáneos (beneficio, satisfacción del cliente, riesgo).
- Salida estructurada en formato JEV (`typesafe/jev-1.13`) con distribución de probabilidad por opción y valor de confianza.
- Función de "teacher": puede usarse para generar decisiones de referencia y entrenar por imitación políticas más ligeras.
- Integración como `brain` dentro del bucle del simulador CONNECT TYCOON (`ct.CompanyBrain.from_hub(...)`).
- No hay soporte declarado de tool calling, function calling genérico, agentes multi-paso generales, visión, audio ni modo de razonamiento extendido.
- Soporte multilingüe limitado al coreano.

## Casos de uso

- Simulación de gestión empresarial: el modelo opera la empresa del simulador CONNECT TYCOON durante 20 días laborables y permite comparar el rendimiento de la política aprendida frente a un jefe basado en reglas en las mismas condiciones.
- Modelo profesor para destilación: al ser un modelo "teacher", sus decisiones pueden usarse como etiquetas para entrenar políticas más pequeñas o más rápidas que reproduzcan su comportamiento sin necesidad de mantener el modelo original.
- Investigación en RL multiobjetivo: sirve como caso de estudio reproducible de cómo ponderar recompensas contradictorias (beneficio frente a satisfacción frente a riesgo) en un entorno Gymnasium con PPO.
- Generación de datos sintéticos de decisión: el modelo puede producir trazas de decisiones etiquetadas en formato JEV para alimentar sistemas de decisión, análisis de políticas o conjuntos de datos de evaluación.
- Docencia y formación en IA: la model card incluye un notebook de Colab y un curso asociado, de modo que el modelo funciona como material práctico para enseñar RL aplicado a decisiones de negocio.
- Prototipado de interfaces estructuradas de decisión: el uso de JEV como formato de entrada y salida permite ensayar arquitecturas donde un orquestador consulta a una política de RL y recibe opciones con probabilidades y confianza.
- Evaluación comparativa de políticas: al ejecutarse en el simulador mediante `connect-tycoon play --brain hf:...`, permite enfrentar políticas alternativas sobre las mismas configuraciones de empresa y medir beneficio, satisfacción, incidentes y días de rotura de stock.

## Benchmarks y rendimiento

La model card no incluye benchmarks estandar (MMLU, HumanEval, GSM8K u otros), ya que no es un modelo de lenguaje. Los únicos datos publicados son la comparación, sobre 40 meses no vistos, entre el jefe basado en reglas y el modelo `jay-company` dentro del simulador:

| Metrica (media de 40 meses no vistos) | Jefe basado en reglas | Modelo presentado |
|---|---|---|
| Beneficio mensual | 7.080.000 KRW (708만원) | 17.190.000 KRW (1719만원) |
| Satisfacción del cliente | 71 % | 96 % |
| Incidentes de riesgo | 11,5 | 1,9 |
| Escalados a confirmación humana | 69,5 | 14,8 |
| Dias con rotura de stock | 9,1 | 0,4 |

Estos valores proceden exclusivamente de la model card del autor y no se han verificado de forma independiente. No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: prácticamente nula. Los pesos se sirven como arrays NumPy y la inferencia puede ejecutarse en CPU.
- GPU recomendadas: no se requiere GPU. Los ejemplos oficiales se ejecutan en un notebook de Colab, lo que sugiere ejecución en CPU o en GPU gratuita de Colab.
- Cabe en cualquier GPU de consumo (y en equipos sin GPU dedicada); no se especifica un tamaño de pesos que permita estimar requisitos mayores.
- Opciones de despliegue: paquete Python `connect-tycoon` (extra `game`), API de `CompanyBrain` y carga desde HuggingFace Hub con `hf:<repo_id>`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje y no aplican a este formato.
- Latencia y throughput estimados: no disponibles. Al no requerir acelerador y operar sobre vectores de estado de pequeño tamaño, la latencia esperada es muy baja, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se han encontrado en la información disponible otros modelos comparables en HuggingFace ni referencias en la búsqueda web (los resultados devueltos corresponden a un software de intermediación crediticia sin relación con el modelo). La única referencia de comparación publicada es el jefe basado en reglas del propio simulador:

| Modelo | Tipo | Entorno | Beneficio mensual | Satisfacción | Incidentes de riesgo | Licencia |
|---|---|---|---|---|---|---|
| Jefe basado en reglas | Política heurística | CONNECT TYCOON | 7.080.000 KRW | 71 % | 11,5 | no aplicable (baseline del simulador) |
| `connectailab-rl-boyeon-v1-teacher` | Política PPO | CONNECT TYCOON | 17.190.000 KRW | 96 % | 1,9 | Apache 2.0 |
| Otros modelos de decisión comparables | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ámbito restringido: funciona únicamente sobre el simulador sintético CONNECT TYCOON. La propia model card indica que es un modelo educativo y que no garantiza ni predice resultados de gestión reales.
- No es un modelo de lenguaje: no genera texto libre, no razona en lenguaje natural y no soporta tool calling, agentes generales, visión ni audio.
- Idioma: soporte declarado únicamente en coreano (ko), tanto en las etiquetas como en los ejemplos de la model card.
- Riesgo de sobreajuste al simulador y a la configuración de empresa declarada; se desconoce su comportamiento con configuraciones distintas.
- Transparencia limitada: no se publican número de parámetros, topología de la red, tamaño ni composición de los datos de entrenamiento, hiperparámetros de PPO ni información sobre la fase supervisada.
- Inconsistencias documentales: el ejemplo de código de la model card usa un identificador duplicado (`boyeon-connectai2026/connectailab-rl-connectailab-rl-boyeon-v1-v1-teacher`) distinto del ID real del repositorio, y la respuesta JSON de ejemplo firma el modelo como `connect-company/jay-company`. Conviene verificar el ID antes de integrarlo en un pipeline.
- Sin validación externa: 0 descargas y 0 "likes" en el momento de la consulta; los resultados de la tabla no han sido replicados por terceros.
- Riesgo de alucinación: no aplicable en el sentido habitual, ya que la salida es una elección discreta con probabilidades y no texto generado; el riesgo equivalente es la elección de una opción incorrecta por baja calibración de la política.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución y conservación de avisos, pero el autor limita explícitamente el uso a un contexto educativo y no asume responsabilidad sobre decisiones reales.
- Metadatos con fechas futuras (creación el 13 de octubre de 2026), lo que sugiere un repositorio de demostración o un error de fecha del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/boyeon-connectai2026/connectailab-rl-boyeon-v1-teacher
- Repositorio GitHub CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab de entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de IA con refuerzo: https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz
- Banner del proyecto: https://raw.githubusercontent.com/wonseokjung/connect-tycoon/main/docs/brand/banner.gif
- Imagen del simulador: https://raw.githubusercontent.com/wonseokjung/connect-tycoon/main/docs/images/hero.gif
- Formato JEV referenciado: `typesafe/jev-1.13` (no se ha encontrado URL directa en la informacion disponible)

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces listados proceden de la model card del autor.
