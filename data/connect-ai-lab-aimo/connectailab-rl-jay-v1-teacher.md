# connect-ai-lab-aimo/connectailab-rl-jay-v1-teacher

## Resumen

connectailab-rl-jay-v1-teacher es un modelo de toma de decisiones basado en aprendizaje por refuerzo profundo, desarrollado por el laboratorio connect-ai-lab-aimo en el marco del simulador de gestion empresarial CONNECT TYCOON. No es un modelo de lenguaje generativo al uso: actua como el "prefrontal" de una empresa simulada, es decir, decide cada dia laborable (en ciclos de 20 dias por mes) sobre asignacion de personal, pedidos de inventario, marketing, atencion al cliente, devoluciones y seguridad. El modelo no genera texto libre, sino que responde en el formato estructurado JEV (`typesafe/jev-1.13`), devolviendo decisiones tipadas con probabilidades y nivel de confianza.

El modelo se entrena en dos fases: primero aprende por imitacion (aprendizaje supervisado) de un "presidente por reglas" que actua como profesor, y despues ajusta su politica con PPO (Proximal Policy Optimization) usando una funcion de recompensa derivada de los valores de empresa declarados (beneficio, satisfaccion del cliente y aversion al riesgo, todos ponderados a 1.0). La libreria de serializacion es numpy, lo que indica que los pesos se distribuyen como arrays numericos y no como safetensors ni GGUF.

Es relevante en el contexto de investigacion en IA porque ejemplifica un patron de "modelo de decision" ligado a un entorno gymnasium concreto, orientado a educacion en aprendizaje por refuerzo (cursos de CONNECT AI LAB y AI CITY BUILDERS) y a la experimentacion con agentes de decision de negocio en simulacion. El modelo se publica bajo licencia Apache 2.0 y esta etiquetado para el idioma coreano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (politica de aprendizaje por refuerzo profundo sobre entorno gymnasium; no se especifica red) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (opera por estado y paso de decision, no por ventana de tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | numpy (libreria numpy; no safetensors ni GGUF) |

## Arquitectura y entrenamiento

No se detalla en la model card la arquitectura de red concreta (numero de capas, dimensiones, tipo de capa). Lo que si se documenta es la metodologia de entrenamiento en dos etapas. En la primera, el modelo aprende por imitacion de un "presidente por reglas" mediante aprendizaje supervisado, adquiriendo las decisiones basicas de gestion del entorno CONNECT TYCOON. En la segunda etapa, ajusta dicha politica con PPO, optimizando la recompensa derivada de los valores de empresa definidos como `{"이익": 1.0, "고객 만족": 1.0, "위험": 1.0}` (beneficio 1.0, satisfaccion del cliente 1.0, riesgo 1.0).

El entorno de simulacion (CONNECT TYCOON) esta descrito con una configuracion de empresa concreta: `{"warehouse": 250.0, "base_demand": 40.0, "unit_cost": 1.5, "order_scale": 1.0, "staff_bonus": 0, "wage": 0.0, "ad_power": 1.0, "fraud_tool": 0, "extra_cs": 0, "extra_refund": 0}`. La interaccion se realiza a traves de un objeto `CompanyBrain` que consume estados y preguntas en formato JEV y devuelve respuestas tipadas. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal, ya que no se trata de un transformer de lenguaje.

## Capacidades

- Toma de decisiones secuencial en un entorno de simulacion empresarial (CONNECT TYCOON), con ciclos de 20 dias laborables por mes.
- Decisiones sobre las siguientes areas: asignacion de personal, pedidos de inventario, marketing, atencion al cliente, gestion de devoluciones y seguridad.
- Salida en formato estructurado JEV (`typesafe/jev-1.13`), con preguntas tipadas del tipo `choice`, devolviendo la opcion elegida, un vector de probabilidades por alternativa y un nivel de confianza.
- Ejemplo documentado de decision: gestion de devoluciones, distinguiendo entre reembolso total (`full`), parcial (`partial`), rechazo (`deny`) y verificacion humana (`human`), con probabilidades asociadas (por ejemplo, 0.6263 para `human` en el caso mostrado).
- Integracion con el simulador mediante `ct.CompanyBrain.from_hub(...)` y mediante el comando `connect-tycoon play --brain hf:connect-ai-lab-aimo/connectailab-rl-jay-v1-teacher`.
- No se documentan capacidades de generacion de texto, codigo, matematicas, vision, tool calling ni agentes multimodales, dado que el modelo no es un LLM generativo.

## Casos de uso

- Educacion en aprendizaje por refuerzo: el modelo sirve como ejemplo practico de un agente entrenado con imitacion mas PPO en un entorno gymnasium, util para cursos y talleres de RL.
- Simulacion de gestion empresarial: operar la empresa del simulador CONNECT TYCOON durante un mes de 20 dias laborables, tomando decisiones de personal, inventario, marketing, atencion al cliente, devoluciones y seguridad.
- Investigacion en funciones de recompensa multiobjetivo: permite estudiar como una politica ponderada (beneficio, satisfaccion, riesgo a partes iguales) equilibra objetivos en conflicto, por ejemplo aceptar o rechazar devoluciones fraudulentas.
- Evaluacion de politicas de decision frente a un baseline por reglas: comparar el comportamiento del agente con el "presidente por reglas" sobre las mismas configuraciones de empresa.
- Prototipado de agentes de decision en entornos tipo gymnasium: reutilizar el patron `CompanyBrain` y el formato JEV para conectar politicas entrenadas a otros simuladores.
- Demostraciones y divulgacion: el modelo se integra en notebooks de Colab y en el repositorio CONNECT TYCOON para mostrar visualmente las decisiones del agente en el juego.

## Benchmarks y rendimiento

La model card incluida no presenta benchmarks clasicos (MMLU, HumanEval, GSM8K, etc.), pero si reporta resultados de la simulacion sobre "los primeros 40 meses de media" comparando el agente con el presidente por reglas:

| Metrica (media de 40 meses) | Presidente por reglas | connectailab-rl-jay-v1-teacher |
|---|---|---|
| Beneficio mensual | 324万 won | 301万 won |
| Satisfaccion del cliente | 79% | 82% |
| Incidentes de riesgo | 7.8 | 7.4 |
| Exceso de verificaciones humanas | 37.8 | 38.9 |
| Dias de ruptura de stock | 10.7 | 11.3 |

El agente mejora en satisfaccion del cliente (82% frente a 79%) y reduce ligeramente los incidentes de riesgo (7.4 frente a 7.8), pero obtiene menor beneficio (301 frente a 324), mas exceso de verificaciones humanas (38.9 frente a 37.8) y mas dias de ruptura de stock (11.3 frente a 10.7). No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el modelo usa la libreria numpy y responde a un estado estructurado, por lo que su huella es presumiblemente ligera, pero no se especifica.
- Opciones de despliegue: integracion como `CompanyBrain` mediante `connect-tycoon` y carga desde el Hub (`ct.CompanyBrain.from_hub(...)`); se menciona un notebook de Google Colab para entrenamiento. No se documentan servidores de inferencia tipo vLLM, TGI o llama.cpp.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables de la misma categoria (agentes de decision en simuladores de negocio con formato JEV) en la informacion proporcionada. El unico punto de referencia documentado es el "presidente por reglas" del propio CONNECT TYCOON, incluido en la tabla de rendimiento anterior. Por tanto, la comparativa con modelos alternativos: no disponible.

## Limitaciones y advertencias

- Se trata de un modelo educativo sobre un simulador de empresa sintetico; la propia model card indica que no garantiza ni predice resultados de gestion reales.
- El rendimiento reportado es una media de 40 meses en una configuracion concreta de empresa; no se garantiza su generalizacion a otras configuraciones.
- El modelo esta etiquetado unicamente para coreano (ko); no se documenta soporte multilingue.
- No es un modelo de lenguaje: no genera texto libre, codigo, razonamiento matematico, vision ni tool calling.
- El agente obtiene menor beneficio y mas rupturas de stock que el baseline por reglas, lo que sugiere que optimiza satisfaccion y riesgo a costa de la rentabilidad.
- No se detallan sesgos especificos, riesgo de alucinacion ni limitaciones de contexto mas alla de las derivadas del entorno simulado.
- Licencia Apache 2.0: permite uso comercial, pero el modelo se presenta explicitamente como una herramienta educativa, sin garantia de idoneidad para produccion real.
- No se documentan cuantizaciones ni formatos alternativos de pesos; el formato es numpy.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/connect-ai-lab-aimo/connectailab-rl-jay-v1-teacher
- Repositorio CONNECT TYCOON en GitHub: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab (entrenamiento del modelo de decision): https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- Curso de aprendizaje por refuerzo (AI CITY BUILDERS): https://www.aicitybuilders.com/robot
- Web de AI CITY BUILDERS: https://www.aicitybuilders.com
- Connect AI: https://www.ezerai.xyz
