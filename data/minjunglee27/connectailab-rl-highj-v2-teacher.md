# minjunglee27/connectailab-rl-highj-v2-teacher

## Resumen

connectailab-rl-highj-v2-teacher es una política de decisión de aprendizaje por refuerzo (RL) entrenada mediante PPO en el simulador CONNECT TYCOON, un entorno de gestión empresarial autónoma. No es un modelo de lenguaje: su "cerebro" es un fichero `brain.json` serializado que se carga con la librería `numpy` a través del paquete `connect_tycoon`. Lo desarrolla Minjung Lee (Highj) dentro de CONNECT AI LAB, en colaboración con AI CITY BUILDERS.

El modelo resuelve un problema concreto: tomar decisiones operativas de negocio (gestión de inventario, aprobación o rechazo de reembolsos, escalado a revisión humana, control de fraude) maximizando simultáneamente tres objetivos ponderados a 1.0: beneficio, satisfacción del cliente y aversión al riesgo. Su relevancia actual radica en que actúa como modelo profesor que destila datos de decisión de alta calidad en el modelo de lenguaje `connectailab-rl-highj-v2`, y en que demuestra que una política RL ligera puede superar de forma sustancial a una línea base basada en reglas en un entorno simulado de 40 meses no vistos durante el entrenamiento.

La ficha se basa exclusivamente en la model card publicada. No hay información sobre número de parámetros de red, arquitectura interna de la política ni composición del dataset de entrenamiento más allá de lo que el autor declara.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de decisión RL entrenada con PPO; serializada como `brain.json` y ejecutada con `numpy` (detalle de red no disponible) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (opera sobre estados estructurados del simulador, no sobre secuencias de texto) |
| Tipos de cuantización | no disponible (no se distribuyen pesos en formatos cuantizables tipo GGUF/AWQ) |
| Idiomas soportados | ko, en |
| Licencia | Apache 2.0 |
| Formato de pesos | `brain.json` (serialización propia cargada vía `connect_tycoon.CompanyBrain.from_hub`) |

## Arquitectura y entrenamiento

La política se entrena con PPO (Proximal Policy Optimization) dentro del simulador CONNECT TYCOON, diseñado por Jay (mentor de CONNECT AI LAB). El agente observa un estado estructurado del negocio —por ejemplo, departamento implicado, motivo, tipo de cliente, importe y `fraud_score`— y emite una decisión discreta entre un conjunto de opciones (reembolso total, parcial, denegación o escalado a revisión humana). La recompensa combina beneficio mensual, satisfacción del cliente y penalización por incidentes de riesgo, con pesos declarados de 1.0 para cada uno de los tres valores.

Esta versión `v2-teacher` se presenta como el cerebro profesor que generó los datos de decisión usados para destilar el modelo `connectailab-rl-highj-v2`. La model card no detalla el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas adicionales como reward shaping explícito, curriculum learning o regularización por entropía. Tampoco se especifica la topología de la red neuronal subyacente ni el número de pasos de entrenamiento.

## Capacidades

- Toma de decisiones discretas en un entorno de simulación empresarial: elección entre acciones como `full`, `partial`, `deny` o `human`.
- Emisión de distribuciones de probabilidad sobre las acciones candidatas (por ejemplo, `full: 0.9883`, `partial: 0.0003`, `deny: 0.0018` en el ejemplo de la model card).
- Gestión de inventario y pedidos orientada a minimizar días de rotura de stock (0.6 días/mes en la evaluación).
- Control de fraude en solicitudes de reembolso, usando señales como `fraud_score` y tipo de cliente.
- Escalado a revisión humana cuando la política lo considera óptimo (12.4 escalados/mes de media).
- Operación sobre estados estructurados tipo JSON, no sobre texto libre.
- Soporte declarado de coreano e inglés en la documentación y etiquetas del modelo.
- Integración mediante API Python (`CompanyBrain.from_hub` y llamada con un diccionario `{"model": ..., "state": ..., "questions": ...}`).

## Casos de uso

- Simulación de gestión empresarial autónoma: usar la política como CEO virtual en el simulador CONNECT TYCOON para evaluar estrategias de inventario, precios y atención al cliente antes de trasladarlas a un entorno real o a un gemelo digital.
- Generación de datos de destilación para modelos de lenguaje: emplear el profesor para etiquetar estados de negocio con decisiones de alta calidad y entrenar después un LLM de decisión como `connectailab-rl-highj-v2`.
- Automatización de resolución de reembolsos en un entorno controlado: la política elige entre reembolso total, parcial, denegación o revisión humana en función del importe, el motivo y la puntuación de fraude.
- Detección y contención de fraude en pagos (FDS): integrada como capa de decisión que decide cuándo bloquear, revisar o aprobar una operación sospechosa.
- Benchmarking de políticas basadas en reglas: servir como referencia superior para comparar contra heurísticas manuales (la model card reporta +263 % en beneficio mensual frente al CEO basado en reglas).
- Investigación en RL aplicado a negocios: reproducir el entorno y el entrenamiento PPO para estudiar equilibrio entre beneficio, satisfacción y riesgo, o para experimentar con variantes de reward shaping.
- Evaluación de robustez de agentes de decisión: someter la política a configuraciones de empresa distintas (por ejemplo, cambiando `warehouse`, `base_demand` o `unit_cost`) para medir generalización fuera de distribución.

## Benchmarks y rendimiento

Resultados declarados por el autor en una simulación de 40 meses no vistos durante el entrenamiento, comparados con un CEO basado en reglas:

| Métrica (media mensual) | CEO basado en reglas | connectailab-rl-highj-v2-teacher |
|---|---|---|
| Beneficio neto | 3,24 M KRW | 11,76 M KRW (+263 %) |
| Satisfacción del cliente | 79,0 % | 95,0 % |
| Incidentes de riesgo | 7,8 / mes | 2,5 / mes (−68 %) |
| Escalados a revisión humana | 37,8 / mes | 12,4 / mes |
| Días de rotura de stock | 10,7 / mes | 0,6 / mes |

No se han publicado resultados en benchmarks estándar de LLM (MMLU, HumanEval, GSM8K) porque el modelo no es un LLM. Tampoco se aportan métricas de convergencia, retorno medio por episodio ni curvas de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ejecutarse como `brain.json` con `numpy` sobre CPU, no requiere GPU.
- GPU recomendadas: no aplica; el cuello de botella es la CPU y el intérprete de Python.
- ¿Cabe en GPU de consumo? Sí, en la práctica cualquier equipo puede ejecutarlo porque no usa aceleración gráfica.
- Opciones de despliegue: paquete `connect_tycoon` (`CompanyBrain.from_hub`), entorno Gymnasium del simulador CONNECT TYCOON y cuaderno de Colab publicado por el autor.
- Latencia y throughput: no disponibles en la información proporcionada; dependen del tamaño del `brain.json` y de la implementación de `numpy`.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Licencia | Disponibilidad |
|---|---|---|---|---|
| connectailab-rl-highj-v2-teacher | Política RL (PPO) | CONNECT TYCOON | Apache 2.0 | Hugging Face |
| connectailab-rl-highj-v2 | LLM de decisión destilado del profesor | CONNECT TYCOON | no disponible en esta ficha | Hugging Face |
| connectailab-rl-highj-v1 | Política RL predecesora | CONNECT TYCOON | no disponible en esta ficha | Hugging Face |
| connectailab-rl-highj-goto-v1-link01 | Política RL de navegación | CONNECT AI WORLD (robot LINK-01) | no disponible en esta ficha | Hugging Face |

No se conocen políticas RL públicas comparables en el mismo simulador más allá de las del propio autor. La comparación con modelos de lenguaje de propósito general no es pertinente porque la tarea y el formato de pesos son distintos.

## Limitaciones y advertencias

- El modelo está entrenado y evaluado exclusivamente en el simulador CONNECT TYCOON; no hay evidencia de transferencia a entornos reales de negocio o producción.
- Los resultados de la model card (11,76 M KRW, 95 % de satisfacción, 0,6 días de rotura) provienen de la simulación del propio autor y no han sido replicados de forma independiente.
- La configuración de empresa usada en la evaluación está fijada (`warehouse: 250.0`, `base_demand: 40.0`, `unit_cost: 1.5`, etc.); se desconoce su comportamiento con otras configuraciones.
- Al ser una política de decisión discreta, no genera texto libre ni mantiene conversaciones multi-turno; no debe presentarse como asistente conversacional.
- Riesgo de sobreajuste al simulador: las decisiones pueden no ser válidas si cambian las reglas del entorno, la distribución de estados o las señales de entrada (por ejemplo, `fraud_score`).
- No se documentan sesgos específicos ni auditorías de equidad; la política podría favorecer decisiones que perjudiquen a ciertos perfiles de cliente si esos patrones están presentes en los datos del simulador.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de documentación sobre la procedencia de los datos de entrenamiento limita la evaluación de riesgos legales en despliegues reales.
- El estado del repositorio (0 descargas, 0 likes) y la fecha de creación (2026-10-14) sugieren un modelo reciente y sin validación comunitaria.
- No se especifican dependencias exactas de `connect_tycoon` ni la versión mínima de Python; la reproducibilidad depende del repositorio GitHub del autor.

## Enlaces

- Hugging Face: https://huggingface.co/minjunglee27/connectailab-rl-highj-v2-teacher
- Modelo destilado: https://huggingface.co/minjunglee27/connectailab-rl-highj-v2
- Modelo predecesor: https://huggingface.co/minjunglee27/connectailab-rl-highj-v1
- Repositorio del simulador: https://github.com/wonseokjung/connect-tycoon
- Cuaderno de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Políticas relacionadas del autor: https://huggingface.co/minjunglee27/connectailab-rl-highj-goto-v1-link01, https://huggingface.co/minjunglee27/connectailab-rl-highj-choose-v1-link01, https://huggingface.co/minjunglee27/connectailab-rl-highj-avoid-v1-link01, https://huggingface.co/minjunglee27/connectailab-rl-highj-lunarlander-v1, https://huggingface.co/minjunglee27/connectailab-rl-highj-lunarlander-v2, https://huggingface.co/minjunglee27/connectailab-rl-highj-cartpole-lite-v1
