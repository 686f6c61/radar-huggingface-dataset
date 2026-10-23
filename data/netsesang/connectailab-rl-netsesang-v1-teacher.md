# netsesang/connectailab-rl-netsesang-v1-teacher

## Resumen

`connectailab-rl-netsesang-v1-teacher` es una política de decisión entrenada con aprendizaje por refuerzo (PPO) por el usuario de HuggingFace `netsesang`, dentro del proyecto educativo CONNECT TYCOON de CONNECT AI LAB y AI CITY BUILDERS. No es un modelo de lenguaje: es un "cerebro de empresa" (`CompanyBrain`) que recibe un estado del simulador de negocio en formato JSON y devuelve una decisión discreta con probabilidades, siguiendo el esquema JEV (`typesafe/jev-1.13`). Cubre seis áreas operativas: asignación de personal, pedidos de inventario, marketing, atención al cliente, reembolsos y seguridad.

El modelo se entrenó en dos fases: primero imitación de un "jefe basado en reglas" (aprendizaje supervisado) y después ajuste con PPO usando como recompensa una función de valor de empresa con pesos declarados (`{"이익": 1.0, "고객 만족": 1.0, "위험": 1.0}`, es decir, beneficio, satisfacción del cliente y riesgo a partes iguales). La model card reporta que, sobre 40 meses simulados no vistos, la política supera ampliamente a la línea base de reglas en beneficio mensual, satisfacción, incidentes de riesgo, escalados a humanos y días sin stock.

Es relevante ahora como ejemplo de sustitución de un sistema de reglas por una política aprendida en un entorno type-safe y auditable (respuestas JSON con distribución de probabilidad), y como pieza de un flujo de destilación: el sufijo `teacher` sugiere que está pensado para generar decisiones que entrenen a un modelo alumno. Su adopción pública es nula por el momento (0 descargas, 0 likes) y su alcance es estrictamente educativo sobre un simulador sintético.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible. La model card no especifica la topología de la red de política (solo indica que se entrena con PPO sobre una política inicial obtenida por imitación); metafóricamente se describe como "corteza prefrontal" del simulador |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible. No hay ventana de contexto: cada decisión se calcula sobre un único estado JSON (`state`) más las preguntas (`questions`) de esa llamada |
| Tipos de cuantización | No disponible. Los pesos se cargan con la librería `numpy`; no se documentan variantes GGUF, INT8, INT4 ni equivalentes |
| Idiomas soportados | Coreano (`ko`); las etiquetas de decisión y el campo `reason` aparecen en coreano. Los identificadores del esquema JSON son en inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | No disponible (librería declarada: `numpy`; carga mediante `connect_tycoon.CompanyBrain.from_hub(...)`) |
| Pipeline en HuggingFace | `reinforcement-learning` |
| Algoritmo de entrenamiento | PPO (Proximal Policy Optimization) tras aprendizaje por imitación de un agente basado en reglas |
| Formato de entrada/salida | JSON tipo JEV (`model`, `state`, `questions` → `answers` con `choice`, `probabilities`, `confidence`, `reason`) |
| Tarea | Toma de decisiones discretas (elección entre opciones con distribución de probabilidad) |
| Autor | `netsesang` (CONNECT AI LAB / AI CITY BUILDERS) |
| Descargas / likes | 0 / 0 |
| Fecha de creación (metadatos HF) | 2026-10-23 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de la red de política: no se indica número de capas, dimensión oculta, número de parámetros ni si se trata de un perceptrón multicapa, una red recurrente o un transformer pequeño. Lo que sí se documenta es el procedimiento: (1) aprendizaje supervisado imitando a un "jefe basado en reglas" que actúa como profesor, y (2) ajuste fino con PPO usando recompensas derivadas del valor de la empresa (beneficio, satisfacción del cliente y riesgo, con peso 1.0 cada uno). El entorno es un simulador de empresa con configuración explícita (`warehouse: 250`, `base_demand: 40`, `unit_cost: 1.5`, `order_scale: 1.0`, `staff_bonus: 0`, `wage: 0.0`, `ad_power: 1.0`, `fraud_tool: 0`, `extra_cs: 0`, `extra_refund: 0`).

El horizonte de entrenamiento y evaluación es de un mes de operación (20 días laborables) repetido sobre 40 meses no vistos. La innovación destacable no está en la arquitectura sino en la interfaz: el modelo responde en un esquema type-safe (JEV 1.13) con distribuciones de probabilidad por opción, lo que permite auditabilidad, umbrales de confianza y escalado a humanos. El campo `reason` de la respuesta de ejemplo es un literal fijo (`"강화학습 정책"`, "política de aprendizaje por refuerzo"), no una explicación generada. No se especifican número de tokens, tamaño del dataset de demostraciones, composición del mismo ni si hubo RLHF/DPO (no aplica en un modelo de decisión de este tipo).

## Capacidades

- Decisión discreta con distribución de probabilidad sobre opciones definidas por el llamador (por ejemplo, reembolso `full` / `partial` / `deny` / `human`).
- Operación de empresa simulada en seis dominios: asignación de personal, pedidos de inventario, marketing, atención al cliente, gestión de reembolsos y seguridad/antifraude.
- Respuesta en formato JEV (`typesafe/jev-1.13`), con campos `choice`, `probabilities`, `confidence` y `reason`.
- Integración con el simulador mediante `CompanyBrain.from_hub` y modo interactivo (`connect-tycoon play --brain hf:...`).
- Capacidad de actuar como profesor en un flujo de destilación hacia un modelo alumno (sufijo `teacher` en el identificador).
- Uso de señales de contexto del estado, como `fraud_score`, `tier` de cliente y motivo de la incidencia, para modular la decisión.
- No soporta generación de texto libre, tool calling, razonamiento multi-paso, visión, audio ni conversación multi-turno: cada llamada es una decisión independiente sobre un estado.

## Casos de uso

- Automatización de reembolsos en un simulador o entorno de formación: el modelo recibe `fraud_score`, importe y tipo de cliente y devuelve probabilidades para reembolso total, parcial, denegación o escalado; en el ejemplo publicado asigna 0.745 a "persona" frente a 0.2513 a "reembolso total", lo que permite calibrar políticas conservadoras.
- Docencia de aprendizaje por refuerzo: el repositorio incluye un notebook de Colab para entrenar el modelo, de modo que se puede usar como referencia de un pipeline imitación + PPO con recompensas multiobjetivo.
- Generación de datos sintéticos de decisión: al ser una política `teacher`, sus salidas con distribución de probabilidad sirven para etiquetar estados y entrenar un modelo alumno más pequeño o con otro formato.
- Evaluación comparativa de políticas: el simulador permite enfrentar esta política contra la línea base de reglas y medir beneficio, satisfacción, incidentes y días sin stock de forma reproducible.
- Pruebas de sistemas con validación de esquema: útil para verificar integraciones que consumen respuestas JEV con contratos type-safe antes de conectar modelos mayores.
- Prototipado de agentes de negocio en un entorno sin riesgo: al operar sobre un simulador sintético, permite experimentar con umbrales de escalado a humanos y funciones de recompensa sin exponer datos reales.
- Benchmark interno de decisiones bajo incertidumbre: comparar la política aprendida con heurísticas escritas a mano en escenarios de fraude, rotura de stock o picos de demanda.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre 40 meses simulados no vistos (media mensual). Importes en wones: 324만원 = 3,24 millones de KRW; 1396만원 = 13,96 millones de KRW.

| Métrica (media de 40 meses) | Jefe basado en reglas | connect-ai-company-v20 | Variación |
|---|---|---|---|
| Beneficio mensual | 3,24 M KRW | 13,96 M KRW | ×4,3 |
| Satisfacción del cliente | 79 % | 93 % | +14 puntos |
| Incidentes de riesgo | 7,8 | 1,5 | −80,8 % |
| Escalados a confirmación humana | 37,8 | 7,2 | −81,0 % |
| Días sin stock | 10,7 | 0,6 | −94,4 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible; no son aplicables a un modelo de decisión sobre un simulador propietario. Tampoco se documentan métricas de calibración, varianza entre semillas ni intervalos de confianza de las cifras anteriores.

## Requisitos de hardware

- Inferencia en CPU: la librería declarada es `numpy` y la instalación se realiza con `pip install "connect-tycoon[game]"`, por lo que no se requiere GPU para ejecutar la política.
- VRAM estimada: no disponible; no se documenta tamaño de pesos. Por el tipo de tarea (decisiones discretas sobre un estado JSON pequeño) el consumo esperado es muy inferior al de un modelo de lenguaje, pero no hay cifras publicadas.
- GPU recomendadas: no disponibles ni necesarias según la información del repositorio; cualquier equipo capaz de ejecutar Python con numpy debería bastar.
- Compatibilidad con GPU de consumo: no aplica en el modo documentado (CPU/numpy); no se ha verificado soporte de aceleración por hardware.
- Opciones de despliegue: `connect-tycoon` (CLI y librería Python) con carga desde el Hub (`CompanyBrain.from_hub`) o modo juego (`connect-tycoon play --brain hf:...`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato de pesos.
- Latencia y throughput: no disponibles. Al no publicarse tamaño de red ni número de operaciones, no se pueden estimar peticiones por segundo.

## Comparativa con modelos similares

| Modelo / alternativa | Tipo | Parámetros | Contexto | Rendimiento documentado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| connect-ai-company-v20 (este modelo) | Política RL (PPO) sobre simulador | No disponible | No aplica (decisión por estado) | 13,96 M KRW/mes, 93 % satisfacción, 1,5 incidentes | Apache-2.0 | HuggingFace, 0 descargas |
| Jefe basado en reglas de CONNECT TYCOON | Sistema experto determinista | No aplica | No aplica | 3,24 M KRW/mes, 79 % satisfacción, 7,8 incidentes | La del repositorio `connect-tycoon` | Incluido en el simulador |
| Enfoque con LLM (notebook `rl_decision_model_qwen_colab`) | Modelo de lenguaje ajustado para decidir | No disponible en la información | No disponible en la información | No disponible | No disponible | Referenciado en el repositorio, sin resultados publicados |
| Otras políticas PPO para entornos Gymnasium | Política RL específica de entorno | Depende del entorno | No aplica | No comparable entre entornos | Variable | No disponible |

No se han identificado en la información proporcionada políticas de decisión de empresa comparables con métricas públicas; la única comparación con cifras es la línea base de reglas del propio simulador.

## Limitaciones y advertencias

- Entrenado exclusivamente sobre un simulador sintético de empresa: el propio autor advierte que es un modelo educativo y que no garantiza ni predice resultados de gestión reales.
- Idioma limitado al coreano en las etiquetas y en el campo `reason`; no se documenta soporte multilingüe.
- El campo `reason` devuelve un literal fijo, no una justificación generada: la trazabilidad se limita a la distribución de probabilidad y al `confidence`.
- No es un modelo de lenguaje: no genera texto, no razona en varios pasos, no soporta tool calling ni instrucciones en lenguaje natural fuera del esquema JEV.
- Riesgo de sobreajuste a la configuración concreta del simulador publicada (`warehouse: 250`, `base_demand: 40`, etc.); no se documenta comportamiento fuera de esa distribución de estados.
- Sesgos potenciales derivados de la función de recompensa: los tres objetivos tienen peso 1.0, de modo que la política prioriza una combinación fija de beneficio, satisfacción y riesgo que puede no coincidir con la de un negocio real.
- Comportamiento observable conservador en el ejemplo publicado: 0.745 de probabilidad para escalar a una persona, lo que reduce el ahorro de costes por automatización (0,8 만원 por caso según el enunciado del propio prompt).
- Sin datos de calibración ni de robustez ante estados malformados o fuera de rango.
- Adopción pública nula (0 descargas, 0 likes) y ausencia de validación independiente; no hay resultados de benchmarks estándar.
- Licencia Apache-2.0, que permite uso comercial y modificación, pero el aviso del autor restringe de facto la expectativa de uso: está concebido como material formativo.
- Fecha de creación en metadatos (2026-10-23) posterior a la fecha habitual de consulta; conviene verificar la vigencia del repositorio antes de integrarlo en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/netsesang/connectailab-rl-netsesang-v1-teacher
- Repositorio CONNECT TYCOON (GitHub): https://github.com/wonseokjung/connect-tycoon
- Notebook de entrenamiento (Google Colab): https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- Curso de aprendizaje por refuerzo (AI CITY BUILDERS): https://www.aicitybuilders.com/robot
- Sitio de AI CITY BUILDERS: https://www.aicitybuilders.com
- Connect AI: https://www.ezerai.xyz
- Esquema JEV referenciado en el modelo: `typesafe/jev-1.13` (identificador citado en la model card; no se ha proporcionado URL directa)
