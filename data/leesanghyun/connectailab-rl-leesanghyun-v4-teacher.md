# LeeSanghyun/connectailab-rl-LeeSanghyun-v4-teacher

## Resumen

`connectailab-rl-LeeSanghyun-v4-teacher` es un modelo de politica de aprendizaje por refuerzo (RL) publicado por el usuario LeeSanghyun en el marco del proyecto CONNECT TYCOON, un simulador sintetico de gestion empresarial mantenido por wonseokjung. No es un modelo de lenguaje: es un cerebro de decision —descrito en su propia documentacion como "corteza prefrontal"— que opera una empresa durante un mes de 20 dias laborables y responde a cada decision en el formato JEV, la misma estructura de preguntas y respuestas tipadas que usa `typesafe/jev-1.13`.

El modelo decide sobre asignacion de personal, pedidos de inventario, marketing, atencion al cliente, reembolsos y seguridad, y devuelve una opcion con su distribucion de probabilidad (por ejemplo, `full` con 0,9916 de confianza en una solicitud de reembolso). El entrenamiento combino una fase de imitacion supervisada de un "jefe de reglas" con un ajuste posterior mediante PPO, usando como recompensa el valor declarado de la empresa: beneficio, satisfaccion del cliente y riesgo, ponderados 3,0 cada uno.

Su relevancia es acotada pero concreta: sirve como referencia reproducible de RL aplicado a toma de decisiones secuenciales en un entorno de simulacion, con resultados medidos frente al baseline de reglas (11,45 millones de wones de beneficio mensual medio frente a 3,24, y 96% de satisfaccion frente a 79% en 40 meses no vistos). El autor subraya que es un modelo educativo sobre un simulador sintetico y que no garantiza ni predice resultados empresariales reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (politica de RL entrenada con imitacion supervisada y PPO; no se detalla la topologia de la red) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de decision por paso: recibe un estado y un bloque de preguntas JEV por consulta) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | numpy (libreria declarada: numpy); el contenedor exacto de los archivos no se especifica en la informacion disponible |
| Pipeline declarado | reinforcement-learning |
| Perfil de simulador | general |
| Etiquetas humanas registradas | 75 |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-16 |

## Arquitectura y entrenamiento

No se publica la topologia de red, el numero de parametros ni el volumen de datos de entrenamiento. Lo que si se documenta es el procedimiento: primero un ajuste por imitacion del "jefe de reglas" del simulador (aprendizaje supervisado sobre las decisiones de esa politica heuristica) y despues un refinamiento con PPO, donde la funcion de recompensa es el vector de valores de la empresa `{"이익": 3.0, "고객 만족": 3.0, "위험": 3.0}` (beneficio, satisfaccion del cliente y riesgo, con peso 3,0 cada uno). La model card indica que el modelo es una politica aprendida dentro del juego y que no es un adaptador LoRA de Qwen, lo que descarta la interpretacion habitual de "modelo entrenado sobre un LLM base".

La interaccion es deliberadamente estructurada: la entrada es un objeto JEV con un estado (`department`, `reason`, `tier`, `amount`, `fraud_score`) y una o varias preguntas tipadas con criterios de eleccion; la salida es la opcion elegida, la distribucion de probabilidad sobre todas las alternativas, un valor de confianza y una razon. El modelo se carga mediante `connect_tycoon.CompanyBrain.from_hub(...)` y se integra en el simulador CONNECT TYCOON, con un tamano de empresa definido por configuracion (`warehouse: 250.0`, `base_demand: 40.0`, `unit_cost: 1.5`, `order_scale: 1.0`, `wage: 0.0`, `ad_power: 1.0` y el resto de parametros a 0).

## Capacidades

- Toma de decisiones discretas con distribucion de probabilidad explicita sobre las alternativas (`full`, `partial`, `deny`, `human`), lo que permite umbrales de confianza y abstencion.
- Gestion de reembolsos: distingue reembolso completo, parcial, denegacion y escalado a revision humana en funcion del motivo, el nivel de cliente, el importe y la puntuacion de fraude.
- Deteccion de fraude transaccional: en la prueba registrada en el guardado del juego detecto 161 de 177 casos fraudulentos sobre 713 transacciones.
- Planificacion de inventario y pedidos: reduce los dias de rotura de stock de 10,7 a 0,5 al mes en la reevaluacion de 40 meses.
- Asignacion de personal, marketing y atencion al cliente dentro del bucle mensual del simulador.
- Escalado a intervencion humana cuando la confianza o el riesgo lo justifican (8,7 escalados al mes frente a 37,8 del baseline).
- Respuesta en formato JEV tipado, lo que facilita el encadenamiento con otros componentes que hablen ese mismo formato.
- Idioma: unicamente coreano.
- No soporta tool calling, function calling, agentes multi-paso generales, vision, audio ni generacion de texto libre; no es un modelo conversacional.

## Casos de uso

- Evaluacion comparativa de politicas de RL: usar el modelo como referencia fija frente a una politica propia en el mismo simulador CONNECT TYCOON, comparando beneficio, satisfaccion y riesgo bajo identica configuracion de empresa.
- Docencia de aprendizaje por refuerzo: el proyecto lo publica como material educativo (cursos de RL de AI CITY BUILDERS), y el modelo permite mostrar en vivo la diferencia entre una politica heuristica y una politica ajustada con PPO sobre las mismas metricas.
- Analisis de politicas de reembolso: alimentar el cerebro con estados reales o sinteticos de un departamento de devoluciones (`reason`, `tier`, `amount`, `fraud_score`) para estudiar que umbrales de decision emergen y como cambian al variar la ponderacion de beneficio, satisfaccion y riesgo.
- Investigacion sobre deteccion de fraude: el modelo ofrece una politica entrenada especificamente para puntuar y filtrar transacciones, con la tasa de deteccion y la reduccion de perdidas (88,80%) como metricas de partida para comparar con clasificadores supervisados clasicos.
- Generacion de trazas de decision sinteticas: ejecutar el modelo durante muchos meses simulados para producir registros estado-accion-confianza que sirvan como datos de calibracion o como dataset auxiliar para otros modelos.
- Simulacion de gestion para formacion: enfrentar a equipos humanos al simulador con este modelo como "jefe automatico" y contrastar sus decisiones con las de la politica entrenada en escenarios de rotura de stock, picos de demanda o fraude.
- Pruebas de robustez y estres: variar los parametros de configuracion de la empresa (almacen, demanda base, coste unitario, potencia publicitaria) para medir en que rango la politica mantiene su rendimiento y donde degrada.
- Integracion como modulo de decision dentro de un pipeline mayor mediante el contrato JEV, siempre que el dominio de decision coincida con el del simulador.

## Benchmarks y rendimiento

Los unicos datos publicados son comparativas internas del propio simulador. No hay resultados de MMLU, HumanEval, GSM8K ni de ninguna otra bateria estandar, ni serian aplicables a un modelo de politica RL en un entorno cerrado.

Reevaluacion sobre 40 meses no vistos:

| Metrica | Jefe de reglas | connect-ai-company-v4 |
|---|---|---|
| Beneficio mensual medio | 3,24 millones de wones | 11,45 millones de wones |
| Satisfaccion del cliente | 79% | 96% |
| Incidentes de riesgo | 7,8 | 2,4 |
| Escalados a revision humana | 37,8 | 8,7 |
| Dias de rotura de stock | 10,7 | 0,5 |

Resultados registrados en el guardado del juego (evaluacion distinta de la anterior, segun la propia model card):

| Metrica | Valor |
|---|---|
| Beneficio mensual | 10,81187 millones de wones (1081,187 manwon) |
| Satisfaccion del cliente | 95,62% |
| Incidentes | 2,5 |
| Transacciones de prueba | 713, de las cuales 177 fraudulentas |
| Fraudes detectados | 161 |
| Reduccion de perdidas | 88,80% |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El modelo se distribuye como artefacto de numpy y no se publica el numero de parametros, por lo que no se puede estimar memoria de forma fiable.
- GPU recomendadas: no disponible. Al no requerir frameworks de deep learning pesados (la libreria declarada es numpy), la inferencia es presumiblemente viable en CPU; no se documenta ningun requisito de GPU.
- Compatibilidad con GPU de consumo: no disponible. No se indica soporte CUDA ni necesidad de acelerador.
- Opciones de despliegue: paquete `connect-tycoon` (`pip install "connect-tycoon[game]"`), carga mediante `ct.CompanyBrain.from_hub("LeeSanghyun/connectailab-rl-LeeSanghyun-v4-teacher")` y ejecucion en el simulador con `connect-tycoon play --brain hf:LeeSanghyun/connectailab-rl-LeeSanghyun-v4-teacher`. No hay soporte declarado para vLLM, llama.cpp, Ollama, TGI ni servidores de inferencia de LLM, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se conocen modelos publicos comparables en la misma categoria dentro del simulador CONNECT TYCOON ni en entornos equivalentes, por lo que la comparativa con alternativas externas queda como no disponible. El unico contraste documentado es interno y se reproduce a continuacion.

| Sistema | Tipo | Beneficio mensual medio | Satisfaccion | Incidentes | Licencia |
|---|---|---|---|---|---|
| connect-ai-company-v4 | Politica RL (imitacion + PPO) | 11,45 millones de wones | 96% | 2,4 | Apache 2.0 |
| Jefe de reglas del simulador | Heuristica basada en reglas | 3,24 millones de wones | 79% | 7,8 | no disponible |

Cualquier comparacion con modelos de lenguaje de gran tamano seria metodologicamente incorrecta: este artefacto no genera texto ni resuelve tareas de conocimiento general.

## Limitaciones y advertencias

- Dominio cerrado: el modelo solo es util dentro del esquema de decisiones del simulador CONNECT TYCOON (personal, inventario, marketing, atencion al cliente, reembolsos y seguridad) y con el formato JEV. Fuera de ese contrato no produce salidas utiles.
- Sesgos conocidos: no disponible. La model card no publica analisis de sesgo, y el entrenamiento parte de una politica heuristica y de 75 etiquetas humanas, un volumen muy reducido que puede trasladar las decisiones del jefe de reglas a la politica final.
- Riesgo de alucinacion: no aplica en el sentido clasico de generacion de texto, pero si existe riesgo de mala calibracion. El ejemplo publicado devuelve 0,9916 de confianza en una decision de reembolso; no se aporta ningun estudio de fiabilidad de esas probabilidades.
- Cobertura idiomatica: unicamente coreano (ko). No hay evidencias de funcionamiento en castellano ni en otros idiomas.
- Contexto: al ser un modelo de decision por paso, no mantiene memoria conversacional ni ventanas de contexto; la coherencia a lo largo del mes depende del simulador, no del modelo.
- Licencia: Apache 2.0 permite uso comercial y modificacion con atribucion, pero el propio autor declara que se trata de un modelo educativo sobre un simulador sintetico que no garantiza ni predice resultados de negocio reales. Utilizarlo como sistema de decision sobre una empresa real queda fuera del alcance declarado.
- Validacion externa nula: 0 descargas y 0 likes en el momento de redactar esta ficha, sin revision independiente de los resultados.
- Dependencia de configuracion: los resultados se obtuvieron con un tamano de empresa concreto; no se documenta como se degrada la politica al cambiar esos parametros.
- Trazabilidad de evaluaciones: la propia model card advierte que la tabla de 40 meses y los resultados del guardado del juego provienen de ejecuciones de evaluacion distintas, por lo que no deben mezclarse como si fueran la misma medicion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LeeSanghyun/connectailab-rl-LeeSanghyun-v4-teacher
- Proyecto CONNECT TYCOON (GitHub): https://github.com/wonseokjung/connect-tycoon
- Aviso de origen y datos del proyecto (NOTICE): https://github.com/wonseokjung/connect-tycoon/blob/main/NOTICE
- Cuaderno de Colab de entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Formato JEV citado por el modelo: https://huggingface.co/typesafe/jev-1.13
- Canal de YouTube de CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS (curso de RL): https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz
- Imagen de cabecera del proyecto: https://raw.githubusercontent.com/wonseokjung/connect-tycoon/main/docs/brand/banner.gif
- Animacion del simulador: https://raw.githubusercontent.com/wonseokjung/connect-tycoon/main/docs/images/hero.gif
