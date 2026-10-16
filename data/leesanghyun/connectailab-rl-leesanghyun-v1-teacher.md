# LeeSanghyun/connectailab-rl-LeeSanghyun-v1-teacher

## Resumen

connectailab-rl-LeeSanghyun-v1-teacher es un modelo de política de aprendizaje por refuerzo (RL) desarrollado por el usuario LeeSanghyun dentro del proyecto CONNECT TYCOON, coordinado por CONNECT AI LAB y AI CITY BUILDERS. No es un modelo de lenguaje generativo ni un transformer preentrenado: es una política de decisión entrenada para dirigir una empresa simulada durante un mes de 20 días laborables, tomando decisiones sobre plantilla, pedidos de inventario, marketing, atención al cliente, devoluciones y seguridad. El modelo se presenta como el "córtex prefrontal" del simulador: recibe un estado de la empresa y devuelve una decisión estructurada.

Su relevancia es doble. Por un lado, sirve como material didáctico para enseñar RL aplicado a decisiones empresariales, con un flujo reproducible que incluye un cuaderno de Colab y un modo de juego instalable mediante `pip install "connect-tycoon[game]"`. Por otro, ilustra un patrón de entrenamiento en dos fases (imitación de un "presidente" basado en reglas y posterior ajuste con PPO) que mejora de forma medible métricas de negocio frente a la línea base. El modelo responde siempre en el formato JEV (`typesafe/jev-1.13`), una interfaz de preguntas y respuestas tipadas.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, la licencia es Apache 2.0 y el único idioma declarado es el coreano (ko). La librería asociada es numpy, lo que sugiere que los pesos se sirven como arrays numéricos más que como safetensors o GGUF. El autor indica explícitamente que se trata de una política aprendida en el juego y no de un adaptador LoRA de Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica de aprendizaje por refuerzo (PPO) sobre representacion de estado; no es un transformer generativo |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; la entrada es un objeto de estado de empresa en formato JEV, no una secuencia de tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (libreria declarada: numpy; no se especifica safetensors ni GGUF) |

## Arquitectura y entrenamiento

La informacion disponible describe una politica de decision entrenada con PPO (Proximal Policy Optimization) sobre un simulador de empresa. El proceso de entrenamiento tiene dos fases declaradas por el autor: primero un aprendizaje supervisado que imita a un "presidente" basado en reglas, y despues un ajuste con PPO usando como recompensa el vector de valores de la empresa, definido como `{"이익": 1.0, "고객 만족": 1.0, "위험": 1.0}` (beneficio, satisfaccion del cliente y riesgo, todos con peso 1.0). No se especifica el numero de parametros, la arquitectura interna de la red, el numero de tokens o episodios de entrenamiento ni el algoritmo de representacion del estado mas alla de la interfaz JEV.

La innovacion destacable no es arquitectonica sino de interfaz y de evaluacion. El modelo no devuelve texto libre: responde a preguntas tipadas con campos `type`, `choice`, `probabilities`, `confidence` y `reason`, lo que permite integrarlo como componente de decision dentro de un bucle de simulacion o de juego. Ademas, el autor documenta dos conjuntos de resultados de evaluacion distintos (una reevaluacion a 40 meses y los resultados guardados en la partida) y advierte de que las ejecuciones de evaluacion no son las mismas. El perfil de simulador declarado es `general` y el fichero del modelo registra 30 etiquetas humanas.

## Capacidades

- Decision empresarial estructurada: selecciona entre alternativas definidas (por ejemplo `full`, `partial`, `deny`, `human` en el caso de devoluciones) y devuelve una distribucion de probabilidad sobre cada opcion junto con un nivel de confianza.
- Formato de respuesta JEV: toda salida se emite en el esquema de `typesafe/jev-1.13`, con preguntas y respuestas tipadas, lo que facilita el parseo automatico.
- Gestion de seis dominios operativos declarados: asignacion de personal, pedidos de inventario, marketing, atencion al cliente, devoluciones y seguridad/antifraude.
- Optimizacion multiobjetivo: equilibra beneficio, satisfaccion del cliente y aversion al riesgo con pesos configurables en la definicion de la recompensa de entrenamiento.
- Deteccion de fraude: en la evaluacion guardada en la partida se reportan 160 fraudes detectados de 177 reales sobre 713 transacciones.
- Integracion como "cerebro" de agente: se instancia con `ct.CompanyBrain.from_hub(...)` y se puede usar como politica jugable mediante `connect-tycoon play --brain hf:...`.
- Idiomas: coreano unicamente en la informacion declarada.
- No se declaran capacidades de tool calling, function calling, agentes multi-paso genericos, vision, audio ni modo de razonamiento explicito mas alla del campo `reason`, que en el ejemplo devuelve la cadena fija "강화학습 정책".

## Casos de uso

- Docencia de aprendizaje por refuerzo: el modelo sirve como ejemplo completo y reproducible de un ciclo imitacion mas PPO, con cuaderno de Colab y repositorio publico, para cursos de RL aplicado a decision making.
- Simulacion de gestion empresarial en el aula: permite que estudiantes comparen sus propias politicas contra una politica entrenada y contra el "presidente" basado en reglas usando las mismas metricas (beneficio, satisfaccion, incidentes, dias sin stock).
- Investigacion en politicas de decision multiobjetivo: el vector de recompensa ponderado permite estudiar como cambia el comportamiento al reponderar beneficio, satisfaccion y riesgo, aunque no se documenta un barrido sistematico.
- Automatizacion de reglas de devolucion en un entorno de practicas: el ejemplo de la model card resuelve un caso de reembolso con `fraud_score` y antiguedad del cliente, devolviendo una opcion con probabilidad asociada, lo que es util como referencia para disenar arboles de decision auditables.
- Modulo de antifraude en simuladores economicos: con 160 de 177 fraudes detectados y una reduccion de perdidas declarada del 91,77 %, es un punto de partida para estudiar clasificadores de fraude en entornos sinteticos.
- Demostracion interactiva en videojuego: mediante `connect-tycoon play --brain hf:LeeSanghyun/connectailab-rl-LeeSanghyun-v1-teacher` se puede observar la politica operando la empresa en tiempo real.
- Comparacion de algoritmos de RL: al ser una politica PPO con linea base basada en reglas, sirve como referencia para probar alternativas (SAC, A2C, DQN) bajo el mismo simulador y las mismas metricas de negocio.

## Benchmarks y rendimiento

Los datos disponibles no son benchmarks academicos estandar (MMLU, HumanEval, GSM8K), sino metricas de negocio del simulador. Se reproducen tal cual, separando las dos evaluaciones que el autor distingue.

Reevaluacion a 40 meses no vistos (media):

| Metrica | Presidente basado en reglas | connect-ai-company-v1 |
|---|---|---|
| Beneficio mensual | 324 millones de won | 1125 millones de won |
| Satisfaccion del cliente | 79 % | 96 % |
| Incidentes de riesgo | 7,8 | 3,4 |
| Confirmaciones humanas superadas | 37,8 | 19,1 |
| Dias sin stock | 10,7 | 0,6 |

Resultados guardados en la partida (ejecucion de evaluacion distinta):

| Metrica | Valor |
|---|---|
| Beneficio mensual | 1095,202 millones de won |
| Satisfaccion del cliente | 94,11 % |
| Incidentes | 3,0 |
| Transacciones reales de prueba | 713, de las cuales 177 fraudulentas |
| Fraudes detectados | 160 |
| Reduccion de perdidas | 91,77 % |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. La libreria declarada es numpy y el modelo no es un transformer generativo, por lo que es probable que la huella sea muy inferior a la de un modelo de lenguaje, pero no hay cifras publicadas.
- GPU recomendadas: no disponible. No se documenta requisito de GPU en la model card.
- Compatibilidad con GPU de consumo: no disponible; no se confirma ni se descarta.
- Opciones de despliegue: las documentadas son el paquete `connect-tycoon` (extra `[game]`) para jugar contra el modelo, la API `ct.CompanyBrain.from_hub(...)` para invocarlo desde Python y el cuaderno de Colab del repositorio para reentrenar o evaluar.
- Servidores de inferencia tipo vLLM, llama.cpp, Ollama o TGI: no aplicables segun la informacion disponible, ya que no es un modelo de lenguaje con pesos en safetensors o GGUF.
- Latencia y throughput: no disponibles.
- Entorno de ejecucion declarado: numpy como libreria principal; el ejemplo de uso se ejecuta en Python estandar.

## Comparativa con modelos similares

No se conocen modelos publicos comparables dentro de la misma categoria (politicas de RL para simuladores de gestion empresarial) en la informacion proporcionada. La unica referencia de comparacion documentada es el "presidente" basado en reglas del propio simulador, que actua como linea base y aparece en la tabla de benchmarks anterior.

| Alternativa | Tipo | Beneficio mensual | Satisfaccion | Licencia |
|---|---|---|---|---|
| connect-ai-company-v1 (este modelo) | Politica PPO | 1125 millones de won (media a 40 meses) | 96 % | Apache 2.0 |
| Presidente basado en reglas (linea base del simulador) | Sistema experto | 324 millones de won | 79 % | no disponible |
| Otros modelos de RL para gestion empresarial | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El propio autor advierte que se trata de un modelo educativo sobre un simulador de empresa sintetico y que no garantiza ni predice resultados de gestion reales.
- Dominio cerrado: la politica esta entrenada para el simulador CONNECT TYCOON con una configuracion concreta de empresa (`warehouse` 250.0, `base_demand` 40.0, `unit_cost` 1.5, `order_scale` 1.0, `wage` 0.0, `ad_power` 1.0, entre otros). Un cambio de configuracion puede degradar el comportamiento y no se documenta robustez fuera de ese perfil.
- Idioma: el unico idioma declarado es el coreano, tanto en las instrucciones de las preguntas como en las respuestas.
- Transparencia de resultados: el autor reconoce que la tabla de reevaluacion a 40 meses y los resultados guardados en la partida provienen de ejecuciones de evaluacion diferentes, por lo que no son directamente comparables entre si.
- Volumen de etiquetado humano limitado: el fichero del modelo registra solo 30 etiquetas humanas, lo que puede afectar a la calibracion de las probabilidades devueltas.
- Riesgo de sobreajuste al simulador: al entrenarse contra un unico entorno, la politica puede explotar particularidades del mismo y no generalizar a dinamicas de negocio no vistas.
- El campo `reason` de las respuestas no aporta explicabilidad real: en el ejemplo de la model card devuelve la cadena generica "강화학습 정책" (politica de aprendizaje por refuerzo), por lo que no debe usarse para auditar la decision.
- Sesgos conocidos: no se documentan sesgos especificos en la informacion disponible.
- Adopcion practicamente nula: 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de terceros.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion, pero la propia model card limita el alcance del modelo a fines educativos y no ofrece garantias.

## Enlaces

- HuggingFace: https://huggingface.co/LeeSanghyun/connectailab-rl-LeeSanghyun-v1-teacher
- Repositorio CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Aviso legal y datos del proyecto: https://github.com/wonseokjung/connect-tycoon/blob/main/NOTICE
- Cuaderno de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- YouTube de CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de aprendizaje por refuerzo: https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz
- Perfil del autor en HuggingFace: https://huggingface.co/LeeSanghyun
