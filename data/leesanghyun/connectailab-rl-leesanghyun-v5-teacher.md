# LeeSanghyun/connectailab-rl-LeeSanghyun-v5-teacher

## Resumen

connect-ai-company-v5 es una política de aprendizaje por refuerzo entrenada para operar una empresa simulada dentro del videojuego educativo CONNECT TYCOON, desarrollado por CONNECT AI LAB y AI CITY BUILDERS. No es un modelo de lenguaje: se trata de un "cerebro" de toma de decisiones (descrito en la model card como "córtex prefrontal") que recibe el estado de la empresa y responde con decisiones sobre plantilla, inventario, marketing, atención al cliente, reembolsos y seguridad. El autor de la subida a HuggingFace es LeeSanghyun, y la librería declarada es numpy, con licencia Apache 2.0.

El modelo se entrenó en dos fases: primero imitó a un "jefe de reglas" mediante aprendizaje supervisado, y después ajustó sus decisiones con PPO usando una función de recompensa ponderada con los valores de empresa beneficio 3, satisfacción del cliente 3 y riesgo 3. Todas sus respuestas se emiten en el formato JEV (typesafe/jev-1.13), un esquema estructurado de pregunta-respuesta con probabilidades por opción y nivel de confianza. El repositorio indica explícitamente que se trata de una política aprendida en el juego y que no es un adaptador LoRA de Qwen.

Su relevancia es fundamentalmente educativa y de investigación en RL aplicado a entornos tipo Gymnasium: sirve como ejemplo reproducible de cómo una política entrenada con PPO supera a una heurística basada en reglas en un simulador de negocio. En la reevaluación publicada sobre 40 meses nunca vistos, la política obtiene 11.460.000 wones de beneficio mensual medio y un 96 % de satisfacción, frente a los 3.240.000 wones y el 79 % del jefe de reglas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de aprendizaje por refuerzo (PPO) sobre observaciones del simulador CONNECT TYCOON; detalles de capas y red no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; opera por estado de simulador) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | numpy (library_name: numpy); no se distribuye en safetensors ni GGUF |
| Libreria de carga | numpy |
| Pipeline declarado | reinforcement-learning |
| Entorno de entrenamiento | Gymnasium (tag) |
| Formato de salida | JEV (typesafe/jev-1.13) |
| Descargas | 0 |
| Likes | 1 |

## Arquitectura y entrenamiento

La model card describe el sistema como una política de decisión entrenada en dos etapas sobre el simulador CONNECT TYCOON. En la primera, el modelo aprende por imitación de un "jefe de reglas" (aprendizaje supervisado); en la segunda, se ajusta mediante PPO con recompensas derivadas de los valores de empresa configurados: beneficio 3, satisfacción del cliente 3 y riesgo 3. El perfil de simulador declarado es "general". Los archivos del modelo registran 75 etiquetas humanas. La model card insiste en que el artefacto es una política entrenada en el juego y no un adaptador LoRA de Qwen.

No se especifican en la información disponible el número de parámetros, la topología de la red, el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO (no aplicables aquí). La salida se estructura en formato JEV: para cada pregunta se devuelve un tipo de respuesta (por ejemplo "choice"), la opción escogida, un vector de probabilidades por alternativa, un valor de confianza y una razón. En el ejemplo publicado, ante una solicitud de reembolso con `fraud_score` 0,3146, el modelo asigna probabilidad 0,9928 a "reembolso completo", 0,0033 a "reembolso parcial", 0,0021 a "rechazar" y 0,0019 a "confirmación humana".

Configuración de empresa usada en el entrenamiento/evaluación: almacén 250, demanda base 40, coste unitario 1,5, escala de pedido 1,0, bonus de plantilla 0, salario 0, poder publicitario 1,0, herramienta antifraude 0, atención al cliente extra 0 y reembolsos extra 0.

## Capacidades

- Toma de decisiones discretas con probabilidades calibradas por opción (reembolso completo, parcial, rechazo o escalado a persona).
- Gestión de operaciones de empresa simulada: asignación de personal, pedidos de inventario, marketing, atención al cliente, política de reembolsos y seguridad.
- Operación continua durante un ciclo de un mes simulado (20 días laborables).
- Detección de fraude en transacciones: en la prueba publicada identificó 161 fraudes de 177 presentes en 713 transacciones, reduciendo la pérdida un 88,25 %.
- Respuesta en formato estructurado JEV compatible con `typesafe/jev-1.13`, lo que facilita su integración con clientes que consumen ese esquema.
- Integración con el simulador mediante la librería `connect-tycoon` y carga directa desde el Hub (`CompanyBrain.from_hub`).
- No dispone de generación de texto libre, razonamiento en lenguaje natural, código, matemáticas, visión, audio ni tool calling en el sentido de los modelos de lenguaje; la información disponible no menciona ninguna de estas capacidades.
- Idiomas: coreano únicamente. La información disponible no documenta capacidades multilingües.

## Casos de uso

- Investigación en aprendizaje por refuerzo: sirve como política de referencia reproducible para comparar PPO frente a heurísticas de reglas en un entorno Gymnasium de gestión empresarial.
- Docencia de RL aplicado: el notebook de Colab enlazado permite reproducir el ciclo de aprendizaje supervisado más PPO sobre un simulador de negocio y observar la curva de mejora mes a mes.
- Simulación de políticas de reembolso: el modelo evalúa solicitudes con un `fraud_score` asociado y devuelve una distribución de probabilidad sobre las alternativas, útil para estudiar umbrales de decisión automática frente a escalado humano.
- Optimización de inventario y demanda: con la configuración de almacén y demanda base del juego, la política decide pedidos y reduce los días de rotura de stock de 10,7 a 0,5 en la evaluación de 40 meses.
- Benchmarking de agentes de decisión: el par jefe de reglas versus connect-ai-company-v5 permite medir ganancias relativas en beneficio, satisfacción e incidencias, con cifras concretas publicadas.
- Demostración integrada en el juego: mediante `connect-tycoon play --brain hf:LeeSanghyun/connectailab-rl-LeeSanghyun-v5-teacher`, el modelo se coloca como director de la empresa simulada y toma todas las decisiones del mes.
- Estudio de seguridad y fraude en entornos sintéticos: la prueba con 713 transacciones y 177 casos de fraude permite analizar falsos negativos y costes de escalado humano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) porque no es un modelo de lenguaje. La model card sí incluye una reevaluación propia sobre 40 meses nunca vistos, comparando la política con el jefe de reglas:

| Metrica (media de 40 meses) | Jefe de reglas | connect-ai-company-v5 |
|---|---|---|
| Beneficio mensual | 3.240.000 wones | 11.460.000 wones |
| Satisfacción del cliente | 79 % | 96 % |
| Incidentes de riesgo | 7,8 | 2,3 |
| Confirmaciones humanas superadas | 37,8 | 8,8 |
| Días de rotura de stock | 10,7 | 0,5 |

Resultados adicionales registrados en el guardado del juego (ejecución de evaluación distinta de la tabla anterior):

| Metrica | Valor |
|---|---|
| Beneficio mensual | 10.805.150 wones |
| Satisfacción del cliente | 95,49 % |
| Incidentes | 2,5 |
| Transacciones de prueba | 713 (177 fraudulentas) |
| Fraudes detectados | 161 |
| Reducción de pérdidas | 88,25 % |

## Requisitos de hardware

- La información disponible no especifica requisitos de hardware, tamaño de pesos, VRAM ni latencia.
- Al declarar la librería `numpy` y no depender de safetensors ni de frameworks de inferencia de modelos de lenguaje, es previsible que la ejecución sea en CPU, pero este extremo no se confirma en la documentación publicada.
- GPUs recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: la vía documentada es la librería `connect-tycoon` (`pip install "connect-tycoon[game]"`) con carga desde el Hub; vLLM, llama.cpp, Ollama y TGI no aplican a este tipo de artefacto.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Beneficio mensual | Satisfacción | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connect-ai-company-v5 | Política RL (PPO) | 11.460.000 wones | 96 % | Apache 2.0 | HuggingFace (0 descargas) |
| Jefe de reglas (baseline del simulador) | Heurística de reglas | 3.240.000 wones | 79 % | no disponible | Integrado en CONNECT TYCOON |

No se dispone de información sobre otros modelos comparables de la misma categoría (políticas RL para simulación empresarial) en la documentación proporcionada.

## Limitaciones y advertencias

- La propia model card indica que es un modelo educativo sobre un simulador sintético de empresa y que no garantiza ni predice resultados de gestión reales.
- Ámbito de aplicación muy restringido: solo funciona sobre el entorno CONNECT TYCOON y su esquema de estados y preguntas JEV.
- Idioma limitado al coreano; no hay soporte documentado para otros idiomas.
- No es un modelo generativo: no produce texto libre ni razonamiento en lenguaje natural, y no debe evaluarse con métricas de modelos de lenguaje.
- El autor aclara explícitamente que no es un adaptador LoRA de Qwen, algo relevante para no confundirlo con los artefactos habituales del Hub.
- Con 0 descargas y 1 like, la validación externa es prácticamente nula; no hay evidencia de uso en producción por terceros.
- Licencia Apache 2.0, que permite uso comercial del artefacto, pero no cubre posibles derechos sobre el simulador o los datos del proyecto original, que remite a su fichero NOTICE.
- Los resultados de fraude (161 de 177 casos) no incluyen información sobre falsos positivos ni sobre el coste de las decisiones erróneas.
- Sesgos conocidos: no disponible. Al entrenarse imitando primero a un jefe de reglas y optimizar después una recompensa ponderada, la política hereda los sesgos de esa heurística y de la función de recompensa definida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LeeSanghyun/connectailab-rl-LeeSanghyun-v5-teacher
- Repositorio del proyecto CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab para entrenamiento RL: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Fichero NOTICE del proyecto: https://github.com/wonseokjung/connect-tycoon/blob/main/NOTICE
- Canal de YouTube de CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de IA con aprendizaje por refuerzo: https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz
- Perfil del autor en HuggingFace: https://huggingface.co/LeeSanghyun
