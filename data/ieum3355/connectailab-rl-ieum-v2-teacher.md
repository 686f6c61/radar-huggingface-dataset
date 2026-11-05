# ieum3355/connectailab-rl-ieum-v2-teacher

## Resumen

`connectailab-rl-ieum-v2-teacher` es un modelo de aprendizaje por refuerzo (RL) desarrollado por el usuario `ieum3355` en el marco del proyecto educativo CONNECT TYCOON, impulsado por CONNECT AI LAB y AI CITY BUILDERS. No es un modelo de lenguaje generativo: es una política de decisión entrenada con PPO que actúa como "cerebro" (metafóricamente, "corteza prefrontal") de una empresa simulada durante un mes de 20 días laborables, tomando decisiones sobre asignación de personal, reposición de inventario, marketing, atención al cliente, reembolsos y seguridad.

El modelo responde a peticiones estructuradas en formato JEV (`typesafe/jev-1.13`), devolviendo decisiones discretas con probabilidades asociadas y un nivel de confianza. Su entrenamiento combina una fase de aprendizaje supervisado a partir de un "presidente por reglas" (reducido de 1.500 a 300 episodios) seguida de un ajuste fino con PPO guiado por la función de valor de la empresa `{"이익": 1.0, "고객 만족": 1.0, "위험": 10.0}` (beneficio 1, satisfacción del cliente 1, riesgo 10).

La relevancia del modelo es experimental y didáctica: demuestra cómo una política RL puede divergir deliberadamente de un baseline determinista (89 % de coincidencia de decisión con el modelo base, el más divergente de los comparados) para aportar "opiniones distintas" en sistemas multiagente. Está empaquetado como artefacto NumPy para integrarse en el simulador `connect-tycoon`. No se dispone de información sobre arquitectura de red neuronal, número de parámetros ni longitud de contexto en el sentido de los modelos transformer.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de aprendizaje por refuerzo (PPO) empaquetada como artefacto NumPy; arquitectura de red no especificada |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el estado se pasa como objeto estructurado JEV, no como secuencia de tokens) |
| Tipos de cuantizacion | no disponible (artefacto NumPy, no hay pesos en safetensors/GGUF) |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | artefacto NumPy cargado vía `connect_tycoon.CompanyBrain.from_hub`; no se publican safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo es una política de decisión entrenada en dos etapas. Primero se aplica aprendizaje supervisado (imitación) sobre las decisiones de un "presidente por reglas" del simulador, con el número de episodios de seguimiento de reglas reducido de 1.500 a 300. Después se ajusta con PPO (Proximal Policy Optimization) usando como recompensa la función de valor de la empresa, en la que el peso del riesgo es diez veces mayor que el del beneficio y la satisfacción (`riesgo: 10.0` frente a `1.0` y `1.0`). El resultado es una política que prioriza la evitación de incidentes sobre la maximización de ingresos.

El entorno es el simulador CONNECT TYCOON, con una configuración de empresa concreta (`warehouse: 250.0`, `base_demand: 40.0`, `unit_cost: 1.5`, `order_scale: 1.0`, `staff_bonus: 0`, `wage: 0.0`, `ad_power: 1.0`, `fraud_tool: 0`, `extra_cs: 0`, `extra_refund: 0`). Las decisiones se emiten en el esquema JEV, con tipos como `choice`, probabilidades por opción y campo `confidence`. No se documentan detalles de la red (capas, tamaños, función de activación) ni el volumen total de transiciones de entrenamiento.

## Capacidades

- Toma de decisiones discretas en un entorno de negocio simulado: asignación de personal, pedidos de inventario, campañas de marketing, atención al cliente, gestión de reembolsos y seguridad.
- Salida estructurada en formato JEV con probabilidades por opción y nivel de confianza (por ejemplo, `full: 0.739`, `partial: 0.0014`, `deny: 0.0014`, `human: 0.2582`).
- Política con aversión fuerte al riesgo: peso de riesgo ×10 en la función de valor.
- Divergencia controlada respecto al baseline determinista (89 % de coincidencia de decisión), pensada para aportar diversidad en sistemas multiagente.
- Integración con el simulador mediante `CompanyBrain.from_hub` y con el modo juego `connect-tycoon play --brain hf:...`.
- Idioma: coreano, tanto en etiquetas de estado como en instrucciones de decisión.
- No soporta tool calling genérico, agentes multi-paso ni razonamiento de texto libre; su interfaz es un esquema de preguntas y respuestas cerrado.

## Casos de uso

- Simulación educativa de gestión empresarial: el modelo opera una empresa durante 20 días laborables dentro de CONNECT TYCOON, con resultados medidos de 826만원 de beneficio mensual, 89 % de satisfacción, 0,6 incidentes de riesgo y 1,4 días de rotura de stock. Es adecuado porque su política está entrenada exactamente sobre ese entorno y esa configuración.
- Investigación en sistemas multiagente con diversidad de opinión: al coincidir solo un 89 % con el modelo base, sirve como segundo "directivo" que introduce disenso en paneles de decisión simulados, reduciendo el riesgo de correlación de errores.
- Estudio de políticas con aversión al riesgo: con peso de riesgo ×10, el modelo reduce pérdidas por fraude a 16만원 (81 % menos que el baseline) y baja los incidentes a 0,6; útil para analizar el trade-off riesgo-beneficio en RL.
- Docencia de PPO aplicado a entornos de decisión estructurados: el notebook de Colab asociado permite reproducir el entrenamiento y comparar imitación frente a ajuste con recompensa.
- Pruebas de integración de esquemas JEV: el modelo ejerce como consumidor de referencia del formato `typesafe/jev-1.13`, con respuestas tipadas y probabilidades, útil para validar implementaciones del protocolo.
- Evaluación de políticas ante escenarios de fraude: el estado incluye `fraud_score` y el modelo decide entre reembolso total, parcial, denegación o escalado a humano, lo que permite estudiar umbrales de derivación humana (32,8 derivaciones de media).
- Benchmark interno de agentes para el juego: permite comparar el rendimiento de distintas políticas (reglas, RL con distintos pesos de riesgo) sobre las mismas 40 empresas/meses de prueba.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre 40 meses no vistos (media):

| Métrica | Presidente por reglas | connectailab-rl-ieum-v2-teacher |
|---|---|---|
| Beneficio mensual | 324만원 | 826만원 |
| Satisfacción del cliente | 79 % | 89 % |
| Incidentes de riesgo | 7,8 | 0,6 |
| Derivaciones a humano | 37,8 | 32,8 |
| Días de rotura de stock | 10,7 | 1,4 |
| Coincidencia de decisión con el modelo base | — | 89 % |

Pérdidas por fraude: 16만원 (81 % menos que el baseline). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que el modelo no es un LLM.

## Requisitos de hardware

- VRAM estimada: no disponible; el artefacto es NumPy y no requiere GPU para inferencia.
- GPU recomendadas: no aplica para inferencia; el entrenamiento PPO se realizó presumiblemente en Colab (se enlaza un notebook de Google Colab), sin especificar hardware.
- Compatibilidad con GPU de consumo: irrelevante para inferencia; cualquier CPU capaz de ejecutar NumPy puede cargar la política.
- Opciones de despliegue: paquete `connect-tycoon` (`pip install "connect-tycoon[game]"`), carga vía `CompanyBrain.from_hub("ieum3355/connectailab-rl-ieum-v2-teacher")` y modo juego con `connect-tycoon play --brain hf:ieum3355/connectailab-rl-ieum-v2-teacher`. No aplican vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al ser una política tabular/NumPy, la latencia vendrá dominada por el simulador, no por el modelo.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-ieum-v2-teacher | Política RL (PPO) para CONNECT TYCOON | no disponible | no aplica | Apache 2.0 | HuggingFace |
| connectailab-rl-ieum-v1 (riesgo ×3) | Política RL (PPO), versión previa | no disponible | no aplica | Apache 2.0 | HuggingFace (referenciado en la model card) |
| Presidente por reglas (baseline del simulador) | Sistema determinista de reglas | no aplica | no aplica | incluido en connect-tycoon | Repositorio GitHub |

La comparación con LLM de propósito general no es pertinente: este modelo no genera texto ni razona sobre lenguaje natural, sino que emite decisiones discretas sobre un esquema fijo. La alternativa directa es la versión v1 con peso de riesgo ×3 y el baseline de reglas, ambos descritos en la model card.

## Limitaciones y advertencias

- Modelo educativo sobre un simulador sintético: el autor declara explícitamente que no garantiza ni predice resultados de gestión real.
- Específico del entorno CONNECT TYCOON y de una configuración de empresa concreta; fuera de esa distribución de estados su comportamiento no está validado.
- Solo coreano; no soporta otros idiomas ni entrada de texto libre.
- No es un LLM: no tiene capacidades de generación, razonamiento abierto, código, matemáticas ni visión.
- Riesgo de sobreajuste a la política de reglas en la fase de imitación (300 episodios) y a la función de recompensa concreta; no se documentan estudios de robustez.
- La aversión extrema al riesgo (peso ×10) puede producir decisiones conservadoras subóptimas en escenarios donde asumir riesgo sería rentable.
- Trazabilidad limitada: no se publican detalles de la red, semillas, datos de entrenamiento ni métricas de varianza; dificulta la reproducibilidad fina.
- El sistema de conexión multiagente ("Connect AI") está declarado en pruebas, por lo que su uso en producción es desaconsejado.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero el valor práctico del modelo está acotado al simulador.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ieum3355/connectailab-rl-ieum-v2-teacher
- Repositorio CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de entrenamiento en Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS (curso de RL): https://www.aicitybuilders.com/robot
- AI CITY BUILDERS (web principal): https://www.aicitybuilders.com
- Connect AI: https://www.ezerai.xyz
- Esquema JEV referenciado: `typesafe/jev-1.13` (identificador citado en la model card; no se proporciona URL directa)
