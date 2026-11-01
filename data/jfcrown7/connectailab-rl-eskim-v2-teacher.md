# jfcrown7/connectailab-rl-eskim-v2-teacher

## Resumen

connectailab-rl-eskim-v2-teacher es un modelo de decisión entrenado con aprendizaje por refuerzo (PPO) por el desarrollador jfcrown7 en el marco del proyecto CONNECT TYCOON, impulsado por CONNECT AI LAB y AI CITY BUILDERS. No es un modelo de lenguaje generativo: es una política de decisión que actúa como "prefrontal cortex" de una empresa simulada, tomando decisiones operativas (asignación de personal, reposición de inventario, marketing, atención al cliente, reembolsos y seguridad) durante un ciclo de 20 días laborables.

El modelo responde en el formato JEV (typesafe/jev-1.13), un esquema de preguntas y respuestas estructuradas con tipos (por ejemplo, elección entre opciones con probabilidades asociadas). Se entrenó en dos fases: primero imitando a un "presidente de reglas" mediante aprendizaje supervisado y después ajustando la política con recompensas derivadas de los valores de la empresa (beneficio, satisfacción del cliente y riesgo, todos con peso 1.0).

Su relevancia es acotada pero ilustrativa: sirve como caso práctico de RL aplicado a toma de decisiones empresariales en un entorno sintético, con licencia Apache 2.0 y distribución vía HuggingFace Hub. No dispone de arquitectura transformer ni de parámetros publicados; se distribuye como artefacto NumPy para su uso con la librería connect-tycoon. El idioma de trabajo es el coreano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de decisión entrenada con PPO (aprendizaje por refuerzo profundo); arquitectura de red no especificada |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (opera sobre estados estructurados del simulador, no sobre texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | artefacto NumPy (library_name: numpy); no se especifican safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo es una política de reinforcement learning entrenada con PPO sobre el simulador de empresa de CONNECT TYCOON. El proceso de entrenamiento consta de dos etapas declaradas por el autor: una fase de aprendizaje supervisado a partir de un "presidente de reglas" (una política heurística de referencia) y una fase posterior de ajuste con PPO utilizando como señal de recompensa los valores de la empresa: beneficio, satisfacción del cliente y riesgo, cada uno con peso 1.0. No se detalla la topología de la red, el número de parámetros, el volumen de datos de entrenamiento ni la composición del dataset.

La interfaz de decisión se define mediante el esquema JEV (typesafe/jev-1.13), que estructura el estado de la empresa y las preguntas en formato tipado (por ejemplo, preguntas de tipo `choice` con criterios y probabilidades por opción). El modelo devuelve, para cada pregunta, la opción elegida, la distribución de probabilidades sobre las alternativas y un nivel de confianza. El entorno de simulación se configura con parámetros como almacén de 250 unidades, demanda base de 40, coste unitario de 1.5, escala de pedido de 1.0 y poder publicitario de 1.0.

## Capacidades

- Toma de decisiones estructuradas en seis dominios operativos: asignación de personal, reposición de inventario, marketing, atención al cliente, reembolsos y seguridad.
- Respuesta en formato JEV con probabilidades por opción y nivel de confianza, lo que permite umbrales de derivación a revisión humana.
- Gestión de operaciones multi-paso a lo largo de un horizonte de 20 días laborables (un "mes" simulado).
- Razonamiento bajo compromisos entre objetivos (beneficio, satisfacción y riesgo) con pesos configurables en el prompt.
- Integración con el simulador connect-tycoon mediante `CompanyBrain.from_hub` y el comando `connect-tycoon play --brain hf:...`.
- Soporte de ejecución en Google Colab mediante el notebook publicado por el autor.
- No soporta generación de texto libre, código, matemáticas, visión, audio ni tool calling genérico; su alcance es la decisión sobre estados del simulador.

## Casos de uso

- Simulación educativa de gestión empresarial: el modelo opera la empresa simulada durante 20 días laborables y permite comparar sus decisiones con la política de reglas de referencia en un entorno docente.
- Investigación en RL aplicado a decisiones de negocio: sirve como política base para experimentar con funciones de recompensa alternativas (por ejemplo, variando los pesos de beneficio, satisfacción y riesgo) y medir el efecto sobre el comportamiento.
- Evaluación de políticas de reembolso: con estados como `department: refund`, `reason`, `tier`, `amount` y `fraud_score`, el modelo elige entre reembolso total, parcial, denegación o revisión humana, lo que permite estudiar umbrales de fraude en un entorno controlado.
- Docencia de formatos estructurados de decisión: el esquema JEV tipado con probabilidades por opción es un ejemplo concreto para enseñar interfaces de decisión verificables frente a la generación de texto libre.
- Benchmarking de agentes de decisión en entornos sintéticos: al publicarse con licencia Apache 2.0 y métricas declaradas (beneficio mensual, satisfacción, incidentes de riesgo, excesos de confirmación humana y días sin stock), puede usarse como referencia en comparativas reproducibles.
- Prototipado de asistentes de operaciones con derivación a humano: la salida con confianza (por ejemplo, 0.9139 en la decisión de reembolso total) permite diseñar reglas de escalado a revisión humana antes de integrar el modelo en flujos reales.
- Demostración de integración HuggingFace + simulador: el patrón `from_hub` y la ejecución vía CLI sirven como plantilla para publicar y consumir políticas de RL en el Hub.

## Benchmarks y rendimiento

El autor publica métricas de rendimiento en el simulador (media sobre 40 meses no vistos), comparando la política con el "presidente de reglas":

| Métrica (media de 40 meses) | Presidente de reglas | connectailab-rl-eskim-v2-teacher |
|---|---|---|
| Beneficio mensual | 3,24 M KRW | 11,11 M KRW |
| Satisfacción del cliente | 79 % | 95 % |
| Incidentes de riesgo | 7,8 | 2,8 |
| Excesos de confirmación humana | 37,8 | 21,7 |
| Días sin stock | 10,7 | 0,5 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible; no son aplicables a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada: no disponible; al distribuirse como artefacto NumPy y no especificarse el tamaño de la red, no puede calcularse.
- GPU recomendadas: no disponible. Por el tipo de política y la librería (NumPy), es plausible la ejecución en CPU, aunque el autor no lo confirma explícitamente.
- Ejecución en GPU de consumo: no confirmada; no hay datos de tamaño que permitan determinarlo.
- Opciones de despliegue: librería connect-tycoon (`pip install "connect-tycoon[game]"`), carga desde el Hub con `CompanyBrain.from_hub` y ejecución interactiva con `connect-tycoon play --brain hf:jfcrown7/connectailab-rl-eskim-v2-teacher`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (políticas de RL para simulación empresarial publicadas en el Hub con el mismo formato de decisión). La comparación relevante disponible es interna al proyecto: frente al "presidente de reglas" heurístico, con los resultados recogidos en la tabla de benchmarks.

## Limitaciones y advertencias

- Modelo educativo sobre un simulador sintético: el propio autor advierte que no garantiza ni predice resultados de gestión reales.
- Ámbito restringido: solo responde a preguntas estructuradas JEV sobre el estado de la empresa simulada; no es un modelo de lenguaje y no debe usarse para generación de texto, código ni tareas generales.
- Idioma: únicamente coreano (ko); no se declara soporte multilingüe.
- Sesgos: la política se ajustó a los pesos de valor fijados (beneficio, satisfacción y riesgo a 1.0) y a la configuración concreta de la empresa; cambios en `config` pueden alterar el comportamiento de forma no validada.
- Riesgo de sobreajuste al simulador: las métricas publicadas corresponden a 40 meses no vistos del mismo entorno; no hay evidencia de generalización a otros simuladores o distribuciones de estado.
- Alucinación: no aplica en el sentido de generación de texto, pero las probabilidades de salida no deben interpretarse como calibración fuera de la distribución de entrenamiento.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución; aun así, el uso en producción real requeriría validación propia, dado el carácter educativo del modelo.
- Sin datos de tamaño, arquitectura de red ni proceso de entrenamiento detallado, lo que dificulta la reproducibilidad y la auditoría técnica.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jfcrown7/connectailab-rl-eskim-v2-teacher
- Repositorio GitHub CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de entrenamiento en Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz
- Esquema JEV referenciado: typesafe/jev-1.13 (no se proporciona URL directa)
