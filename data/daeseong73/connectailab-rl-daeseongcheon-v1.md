# Daeseong73/connectailab-rl-DaeseongCheon-v1

## Resumen

Daeseong73/connectailab-rl-DaeseongCheon-v1 es un modelo de aprendizaje por refuerzo (reinforcement learning) orientado a la toma de decisiones empresariales dentro del simulador CONNECT TYCOON, desarrollado por Daeseong Cheon (천대성) en el marco de CONNECT AI LAB en colaboracion con AI CITY BUILDERS. No es un modelo de lenguaje generativo, sino una politica de decision que actua como "corteza prefrontal" de una empresa simulada: recibe el estado del negocio y responde en el formato estructurado JEV (typesafe/jev-1.13) con elecciones discretas y probabilidades asociadas.

El modelo gestiona un mes de operacion (20 dias laborables) tomando decisiones sobre asignacion de personal, pedidos de inventario, marketing, atencion al cliente, reembolsos y seguridad. Se entrena en dos fases: primero imita a un "presidente por reglas" mediante aprendizaje supervisado y despues se afina con PPO (Proximal Policy Optimization) usando una funcion de recompensa basada en el valor de empresa `{"beneficio": 2.0, "satisfaccion del cliente": 1.2, "riesgo": 1.0}`.

Su relevancia es principalmente didactica: sirve como ejemplo reproducible de como aplicar RL profundo a entornos tipo Gymnasium con decisiones discretas multiples, y como se exporta una politica entrenada en un paquete ligero basado en NumPy que puede ejecutarse a traves de la libreria `connect-tycoon`. El autor advierte explicitamente de que es un modelo educativo sobre un simulador sintetico y que no garantiza ni predice resultados empresariales reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica de aprendizaje por refuerzo (deep RL) con PPO; estructura interna no detallada en la model card |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica / no disponible (el "estado" es el vector de la empresa simulada, no una secuencia de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (libreria declarada: numpy) |

## Arquitectura y entrenamiento

La model card describe un proceso de entrenamiento en dos etapas. En la primera, el modelo aprende por imitacion (aprendizaje supervisado) a replicar las decisiones de un "presidente por reglas" del simulador. En la segunda, esas decisiones se refinan con PPO, una politica de gradiente de politica, usando como recompensa el valor compuesto de la empresa ponderado como `{"beneficio": 2.0, "satisfaccion del cliente": 1.2, "riesgo": 1.0}`. El entorno pertenece al ecosistema Gymnasium (segun las etiquetas del repositorio) y el resultado se empaqueta como un artefacto ligero consumible a traves de `connect_tycoon.CompanyBrain.from_hub(...)`.

El modelo se describe como el "cerebro de decision estilo JEV" de CONNECT TYCOON: cada accion se devuelve con el formato JEV (`typesafe/jev-1.13`), incluyendo el tipo de respuesta, la opcion elegida, las probabilidades de cada alternativa, un valor de confianza y un motivo. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni el tamano de la red neuronal; tampoco especifica el tipo exacto de capas (MLP, transformer u otro). El notebook de Colab enlazado se llama `rl_decision_model_qwen_colab.ipynb`, lo que sugiere que el flujo de aprendizaje pudo apoyarse en un modelo Qwen como referencia, pero este extremo no se confirma en la ficha del autor y debe tratarse como no verificado.

## Capacidades

- Toma de decisiones discretas empresariales: asignacion de personal, pedidos de inventario, marketing, atencion al cliente, gestion de reembolsos y seguridad.
- Respuesta en formato estructurado JEV con elecciones, probabilidades por opcion, confianza y motivo.
- Aprendizaje de politica multiobjetivo (beneficio, satisfaccion del cliente y control de riesgo ponderados).
- Funcionamiento como politica de "corteza prefrontal" dentro de un simulador de 20 dias laborables.
- Inferencia ligera mediante un paquete NumPy, sin necesidad de GPU de gran tamano (segun la libreria declarada).
- Integracion con la libreria `connect-tycoon` mediante `CompanyBrain.from_hub(...)` y modo de juego CLI.
- Capacidades de tool calling, agentes, vision, audio o generacion de texto: no disponibles / no aplicables (no es un modelo de lenguaje).

## Casos de uso

- Simulacion educativa de gestion empresarial: el modelo puede actuar como presidente automatico en CONNECT TYCOON y servir para ilustrar el efecto de distintas politicas de decision frente a un "presidente por reglas".
- Investigacion en aprendizaje por refuerzo: sirve como caso de estudio de PPO aplicado a un entorno de decisiones discretas multiples con recompensa multiobjetivo.
- Ensenanza de RL en cursos y talleres: se puede reproducir el entrenamiento desde el notebook de Colab enlazado y comparar el rendimiento antes y despues del afinado con PPO.
- Prototipado de agentes de decision empresarial: la interfaz JEV permite usar el modelo como componente de un sistema mayor que pregunte en formato estructurado y reciba una eleccion con probabilidades.
- Evaluacion de funciones de recompensa: cambiando los pesos de `{"beneficio", "satisfaccion del cliente", "riesgo"}` se puede estudiar como varia el comportamiento de la politica resultante.
- Demostracion de integracion de politicas RL en producto: el comando `connect-tycoon play --brain hf:...` muestra como empaquetar y desplegar una politica entrenada en un juego o simulador.
- Benchmark interno de politicas de decision: el modelo y el presidente por reglas pueden compararse sobre los mismos 40 meses para medir mejoras en beneficio, satisfaccion, incidentes, confirmaciones humanas y dias de rotura de stock.

## Benchmarks y rendimiento

La model card proporciona resultados sobre 40 meses no vistos previamente, comparando al presidente por reglas con DaeseongCheon-v1:

| Metrica (media de 40 meses) | Presidente por reglas | DaeseongCheon-v1 |
|---|---|---|
| Beneficio mensual (KRW) | 3.240.000 | 12.460.000 |
| Satisfaccion del cliente | 79% | 97% |
| Incidentes de riesgo | 7.8 | 1.8 |
| Confirmaciones humanas superadas | 37.8 | 16.9 |
| Dias de rotura de stock | 10.7 | 0.9 |

No se han publicado resultados de benchmarks externos (tipo MMLU, HumanEval o GSM8K) en la informacion disponible, y no serian aplicables al tratarse de una politica de decision y no de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. La libreria declarada es NumPy, lo que sugiere que la inferencia puede ejecutarse en CPU, pero el tamano de la red no se especifica.
- GPU recomendadas: no disponible (no se indica ninguna GPU necesaria en la model card).
- Compatibilidad con GPU de consumo: probablemente si, dado el empaquetado ligero y el uso de NumPy, pero no confirmado por el autor.
- Opciones de despliegue: libreria Python `connect-tycoon` (extra `[game]`), uso directo mediante `CompanyBrain.from_hub(...)` y comando de juego `connect-tycoon play --brain hf:...`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Daeseong73/connectailab-rl-DaeseongCheon-v1 | Politica RL (PPO) para simulador CONNECT TYCOON | no disponible | no aplica | Apache 2.0 | HuggingFace, 0 descargas, 0 likes |
| Presidente por reglas de CONNECT TYCOON | Politica basada en reglas (referencia interna) | no aplica | no aplica | no disponible | Incluido en el simulador |
| Otros modelos RL para entornos Gymnasium | Politica RL | variable | no aplica | variable | No disponible en la informacion proporcionada |

No se dispone de informacion sobre modelos alternativos comparables publicados en la misma categoria dentro de la busqueda realizada.

## Limitaciones y advertencias

- El propio autor indica que se trata de un modelo educativo sobre un simulador sintetico y que no garantiza ni predice resultados empresariales reales.
- El modelo esta disenado especificamente para el simulador CONNECT TYCOON; su transferencia a otros dominios no esta documentada.
- Solo se declara soporte de idioma coreano (ko) en la model card; el comportamiento frente a entradas en otros idiomas es desconocido.
- No se detallan sesgos conocidos, pero al entrenarse con la funcion de recompensa ponderada `{"beneficio": 2.0, "satisfaccion del cliente": 1.2, "riesgo": 1.0}`, la politica prioriza el beneficio economico, lo que puede desalinearse con objetivos distintos en contextos reales.
- El riesgo de alucinacion no aplica en el sentido de un LLM, pero existe riesgo de decisiones erroneas o poco robustas fuera de la distribucion de estados vista en entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero no se especifican condiciones adicionales de atribucion al autor ni al proyecto en la model card mas alla de la licencia declarada.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia externa de uso en produccion ni comunidad de validacion.
- No se detallan limitaciones de longitud de contexto porque el modelo no procesa texto, sino vectores de estado del simulador.
- La referencia a Qwen en el nombre del notebook de Colab no esta confirmada como base del entrenamiento y no deberia asumirse.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Daeseong73/connectailab-rl-DaeseongCheon-v1
- Repositorio CONNECT TYCOON en GitHub: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab de entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS (curso de RL): https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz
- Formato JEV referenciado por el modelo: `typesafe/jev-1.13` (sin URL publica indicada en la model card)
