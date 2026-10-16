# LeeSanghyun/connectailab-rl-LeeSanghyun-v3-teacher

## Resumen

connect-ai-company-v3 (identificador en el Hub: `LeeSanghyun/connectailab-rl-LeeSanghyun-v3-teacher`) es una política de aprendizaje por refuerzo entrenada para dirigir una empresa sintetica dentro del simulador CONNECT TYCOON. No es un modelo de lenguaje: se trata de un agente de decision que recibe un estado estructurado (por ejemplo, una solicitud de reembolso con motivo, nivel de cliente, importe y puntuacion de fraude) y devuelve una eleccion con su distribucion de probabilidad y nivel de confianza, serializada en el formato JEV del proyecto.

El modelo lo publica el usuario LeeSanghyun dentro del proyecto educativo CONNECT TYCOON, impulsado por CONNECT AI LAB y AI CITY BUILDERS. El pipeline declarado es `reinforcement-learning` y la libreria de inferencia es `numpy`, lo que indica que la politica se ejecuta sin depender de un framework de deep learning completo. El idioma declarado es coreano (`ko`) y la licencia es Apache 2.0.

Su relevancia es acotada pero concreta: sirve como referencia reproducible de como una politica PPO puede superar a un agente basado en reglas en un entorno de decision empresarial simulado, y como modelo "teacher" para generar etiquetas de decision en el mismo simulador. La model card advierte de forma explicita que es un modelo educativo sobre un simulador de empresa sintetico y que no garantiza ni predice resultados empresariales reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | politica de aprendizaje por refuerzo (PPO) que consume estado estructurado y emite decisiones discretas con probabilidades; detalle de la red no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; el estado se entrega como objeto estructurado por decision, no como ventana de tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (ko) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (libreria declarada: numpy) |

## Arquitectura y entrenamiento

La informacion disponible describe un entrenamiento en dos fases: primero un aprendizaje supervisado a partir de las decisiones de un "presidente por reglas" (el agente heuristico del simulador), y despues un ajuste con PPO usando como recompensa el valor de la empresa, definido en el repositorio como `{"이익": 3.0, "고객 만족": 3.0, "위험": 3.0}` (beneficio, satisfaccion del cliente y riesgo, con peso 3,0 cada uno). La politica aprende a decidir sobre asignacion de personal, pedidos de inventario, marketing, atencion al cliente, reembolsos y seguridad.

La red se ejecuta mediante `numpy` y se integra a traves de la clase `ct.CompanyBrain.from_hub(...)` del paquete `connect-tycoon`. La propia model card aclara que este repositorio contiene una politica entrenada en el juego y que no es un adaptador LoRA de Qwen, una aclaracion relevante porque el notebook asociado del proyecto usa Qwen para otra parte del flujo. El modelo registra 71 etiquetas humanas en el archivo del modelo, dato que apunta a un componente de anotacion humana dentro del bucle de entrenamiento. No se especifican el numero de parametros, la topologia de la red, el volumen de episodios de entrenamiento ni los hiperparametros de PPO.

## Capacidades

- Decision empresarial discreta en el simulador: elegir entre opciones como reembolso completo, parcial, denegacion o derivacion a una persona.
- Salida calibrada con probabilidades por opcion y una etiqueta de confianza (en el ejemplo documentado, 0,9864 de confianza en la opcion "full").
- Razonamiento de compromiso entre objetivos: la propia instruccion del entorno plantea el equilibrio entre beneficio, satisfaccion y riesgo.
- Respuesta en el formato JEV, con estructura `questions`/`answers` que facilita el consumo programatico.
- Funcionamiento como politica "teacher", util para generar decisiones de referencia en el simulador.
- Operacion sin GPU ni framework de deep learning pesado, al apoyarse en numpy.
- Integracion con el juego mediante CLI: `connect-tycoon play --brain hf:LeeSanghyun/connectailab-rl-LeeSanghyun-v3-teacher`.

No hay evidencia en la informacion disponible de generacion de texto libre, codigo, matematicas, vision, audio, tool calling generico ni capacidades multilingues mas alla del coreano.

## Casos de uso

- Docencia de aprendizaje por refuerzo: usar la politica como ejemplo completo y ejecutable de un ciclo imitacion de reglas mas PPO, con el simulador CONNECT TYCOON como entorno Gymnasium.
- Generacion de datos de decision sinteticos: emplear el modelo como "teacher" para etiquetar estados del simulador y entrenar politicas mas pequenas o distillation.
- Estudio de politicas de reembolso y antifraude: el ejemplo documentado resuelve una solicitud de reembolso con `fraud_score` y devuelve la probabilidad asignada a cada alternativa, lo que permite analizar umbrales de decision.
- Benchmark interno de agentes heuristicos: comparar cualquier nueva politica contra este modelo y contra el presidente por reglas usando la misma bateria de 40 meses.
- Simulacion multiagente y economia sintetica: incorporar la politica como uno de los actores que toman decisiones en un entorno de empresa simulado.
- Investigacion sobre alineacion de recompensas: la recompensa esta compuesta por tres objetivos ponderados, lo que permite estudiar como cambia el comportamiento al reponderar beneficio, satisfaccion y riesgo.
- Demostraciones educativas en vivo: el repositorio incluye notebook de Colab y comandos de juego para mostrar el agente operando la empresa en una sesion practica.
- Prototipado de interfaces de decision asistida: el formato JEV de pregunta y respuesta sirve como contrato de API para integrar el modelo en otras aplicaciones de decision estructurada.

## Benchmarks y rendimiento

Los datos disponibles no son benchmarks estandar (tipo MMLU o HumanEval) sino metricas del simulador, comparando la politica con el agente basado en reglas. La evaluacion se realizo sobre 40 meses no vistos previamente:

| Metrica (media en 40 meses no vistos) | Presidente por reglas | connect-ai-company-v3 |
|---|---|---|
| Beneficio mensual (miles de wones, 만원) | 324 | 1151 |
| Satisfaccion del cliente | 79 % | 96 % |
| Incidentes de riesgo | 7,8 | 2,8 |
| Confirmaciones humanas superadas | 37,8 | 10,0 |
| Dias sin stock | 10,7 | 0,5 |

La model card incluye tambien un segundo conjunto de resultados procedentes del guardado del juego, con una ejecucion de evaluacion distinta:

| Metrica (guardado del juego) | Valor |
|---|---|
| Beneficio mensual (miles de wones, 만원) | 1072,309 |
| Satisfaccion del cliente | 95,65 % |
| Incidentes | 2,9 |
| Transacciones reales de prueba | 713, de las cuales 177 fraudulentas |
| Fraudes detectados | 160 |
| Reduccion de perdidas | 89,13 % |

Perfil del simulador declarado: `general`. Configuracion de empresa usada: `{"warehouse": 250.0, "base_demand": 40.0, "unit_cost": 1.5, "order_scale": 1.0, "staff_bonus": 0, "wage": 0.0, "ad_power": 1.0, "fraud_tool": 0, "extra_cs": 0, "extra_refund": 0}`. No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- La libreria de inferencia declarada es `numpy`, por lo que no se requiere GPU ni VRAM dedicada para ejecutar la politica.
- Al no publicarse el numero de parametros ni el tamano de los pesos, no es posible estimar VRAM ni huella de memoria de forma fiable: no disponible.
- GPU recomendadas: no aplica segun la informacion disponible; el cuello de botella es la CPU y la logica del simulador.
- Compatibilidad con GPU de consumo: no relevante en el escenario documentado.
- Opciones de despliegue: paquete Python `connect-tycoon` (`pip install "connect-tycoon[game]"`), carga desde el Hub mediante `ct.CompanyBrain.from_hub`, y modo juego por CLI con `connect-tycoon play --brain hf:...`.
- Servidores de inferencia tipo vLLM, llama.cpp, Ollama o TGI: no aplicables, ya que no es un modelo de lenguaje con pesos transformer.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables de la misma categoria (politicas PPO publicadas para simuladores de decision empresarial). El unico termino de comparacion documentado es el propio agente heuristico del simulador, el "presidente por reglas", que la politica supera en las cinco metricas reportadas de la reevaluacion a 40 meses.

| Alternativa | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connect-ai-company-v3 | no disponible | no aplica | beneficio 1151 mil wones/mes, satisfaccion 96 %, 2,8 incidentes | apache-2.0 | HuggingFace |
| Presidente por reglas (baseline del simulador) | no aplica | no aplica | beneficio 324 mil wones/mes, satisfaccion 79 %, 7,8 incidentes | la del proyecto CONNECT TYCOON | incluido en el simulador |
| Otros modelos comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ambito restringido: es una politica especifica del simulador CONNECT TYCOON; no es un modelo de proposito general ni un LLM, y no debe esperarse transferencia directa a entornos empresariales reales.
- La model card indica explicitamente que se trata de un modelo educativo sobre un simulador de empresa sintetico y que no garantiza ni predice resultados de gestion reales.
- Idioma: solo coreano declarado, con los riesgos de cobertura limitada que eso implica.
- Sesgos: no hay informacion publicada sobre analisis de sesgos; las decisiones de reembolso y fraude aprendidas en simulacion pueden reflejar los sesgos del agente heuristico usado como profesor.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero si existe riesgo de sobreconfianza, ya que la salida incluye una probabilidad que puede ser alta en estados poco representados.
- Reproducibilidad: los dos conjuntos de resultados publicados (reevaluacion a 40 meses y guardado del juego) provienen de ejecuciones de evaluacion distintas, por lo que no son directamente intercambiables.
- Datos de entrenamiento y trazabilidad: no se detalla el volumen de episodios, la composicion del dataset ni los hiperparametros; las 71 etiquetas humanas registradas son un volumen muy reducido.
- Licencia Apache 2.0: permite uso comercial y modificacion con las obligaciones habituales de atribucion y aviso; conviene revisar el archivo NOTICE del proyecto original por si anade condiciones sobre los datos o el simulador.
- Despliegue: aunque la inferencia sea ligera, la politica necesita el simulador y el contrato JEV para operar, lo que limita su uso aislado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LeeSanghyun/connectailab-rl-LeeSanghyun-v3-teacher
- Repositorio del proyecto CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab del modelo de decision: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Aviso de procedencia y datos (NOTICE): https://github.com/wonseokjung/connect-tycoon/blob/main/NOTICE
- Canal de YouTube de CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de aprendizaje por refuerzo de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Connect AI (ezerai): https://www.ezerai.xyz
- Perfil del autor en HuggingFace: https://huggingface.co/LeeSanghyun

Nota sobre la busqueda web: las consultas realizadas no devolvieron ningun resultado relevante sobre este modelo, su proyecto o su arquitectura; los unicos resultados obtenidos eran contenido no relacionado con la ficha tecnica y se han descartado. Por tanto, todos los enlaces anteriores proceden de la informacion de HuggingFace y de la propia model card.
