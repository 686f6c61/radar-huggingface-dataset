# AlexLEEeeee/connectailab-rl-alvis-v4-teacher

## Resumen

Connectailab-rl-alvis-v4-teacher es un modelo de toma de decisiones por aprendizaje por refuerzo (RL) desarrollado por el usuario AlexLEEeeee dentro del ecosistema CONNECT AI LAB. No es un modelo de lenguaje generativo al uso, sino una politica de decision entrenada para operar una empresa simulada durante un mes laboral (20 dias) en el simulador CONNECT TYCOON. Se distribuye con la etiqueta de libreria `numpy` y declara la pipeline `reinforcement-learning`, lo que indica que su inferencia se realiza mediante una implementacion propia en NumPy y no mediante pesos transformadores convencionales.

El modelo se presenta como un ajuste fino del modelo docente `connect-ai-company-v6`, un "jefe de IA" entrenado en el propio juego, que a su vez aprendio primero por imitacion de un jefe basado en reglas y despues se refino con PPO. Las prioridades de valor declaradas son beneficio (1.0), satisfaccion del cliente (2.0) y gestion del riesgo (1.5), de modo que el modelo prioriza la satisfaccion por encima del beneficio puro. Las decisiones abarcan asignacion de personal, pedidos de inventario, marketing, atencion al cliente, reembolsos y seguridad, y se expresan en el formato estructurado JEV (`typesafe/jev-1.13`).

Su relevancia es principalmente educativa y de investigacion: sirve como ejemplo reproducible de como entrenar una politica de decision multiobjetivo sobre un entorno tipo Gymnasium, y como pieza de un experimento mayor de "conexion de modelos" (Connect AI) que la organizacion describe como todavia en pruebas. El modelo solo soporta coreano (ko), no publica numero de parametros y no garantiza resultados de negocio reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. Politica de decision por aprendizaje por refuerzo (PPO) implementada en NumPy; no se especifica la topologia de red |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible / no aplica (la entrada es un estado estructurado en formato JEV, no texto libre) |
| Tipos de cuantizacion | No disponible (no aplica; la libreria declarada es NumPy) |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | No se especifica safetensors ni GGUF. La libreria declarada es `numpy` y el modelo se carga mediante `connect_tycoon.CompanyBrain.from_hub` |

## Arquitectura y entrenamiento

La informacion disponible no detalla la topologia de red (numero de capas, dimensiones, tipo de capa). Lo que si se documenta es el esquema de entrenamiento: primero un aprendizaje supervisado a partir de un "jefe basado en reglas" (imitation learning) y despues un refinamiento con PPO (Proximal Policy Optimization) usando las recompensas derivadas de los valores de empresa declarados. El resultado se empaqueta para cargarse como un "cerebro de empresa" (`CompanyBrain`) que recibe estados estructurados y devuelve decisiones.

La interfaz de entrada y salida usa JEV (`typesafe/jev-1.13`), un formato de preguntas y respuestas tipadas. Cada consulta incluye un estado (por ejemplo, departamento, motivo, nivel de cliente, importe y `fraud_score`) y una bateria de preguntas de tipo eleccion con criterios. La salida es un objeto JSON con la opcion elegida, la distribucion de probabilidad sobre cada alternativa y un nivel de confianza; por ejemplo, ante una solicitud de reembolso el modelo puede devolver `human` con probabilidad 0,9572 frente a `full` (0,0415), `partial` (0,0006) y `deny` (0,0006). Los valores de empresa de referencia son `{"이익": 1.0, "고객 만족": 2.0, "위험": 1.5}` (beneficio 1.0, satisfaccion del cliente 2.0, riesgo 1.5), y la configuracion de empresa por defecto es `{"warehouse": 250.0, "base_demand": 40.0, "unit_cost": 1.5, "order_scale": 1.0, "staff_bonus": 0, "wage": 0.0, "ad_power": 1.0, "fraud_tool": 0, "extra_cs": 0, "extra_refund": 0}`. No se indica el numero de tokens ni la composicion del dataset; el entorno es un simulador sintetico, no un corpus de texto.

## Capacidades

- Toma de decisiones discretas y multiobjetivo en un entorno empresarial simulado (eleccion entre alternativas con probabilidades asociadas).
- Gestion de seis dominios operativos: asignacion de personal, pedidos de inventario, marketing, atencion al cliente, reembolsos y seguridad.
- Razonamiento bajo valores ponderados: pondera beneficio, satisfaccion del cliente y riesgo segun los pesos configurados.
- Evaluacion de riesgo de fraude a partir de variables como `fraud_score`, nivel de cliente (`tier`) e importe, como se aprecia en el ejemplo de reembolso.
- Escalado de decisiones a revision humana: puede delegar en un humano (opcion `human`) cuando la incertidumbre o el riesgo lo justifican, con un coste asociado (0,8 por caso en el ejemplo).
- Salida estructurada con distribucion de probabilidad y nivel de confianza, apta para automatizacion o umbrales de decision.
- Integracion con el simulador mediante `connect-tycoon` (carga por `hf:` y ejecucion interactiva con `connect-tycoon play`).
- No soporta generacion de texto libre, codigo, matematicas, vision ni audio; no se documenta tool calling ni razonamiento multi-paso general.

## Casos de uso

- Investigacion en aprendizaje por refuerzo: usar el modelo como politica entrenada de referencia para comparar algoritmos (PPO frente a GRPO, como en el modelo hermano v3) sobre el mismo entorno Gymnasium.
- Docencia de RL aplicado: sirve como ejemplo didactico reproducible para explicar imitation learning seguido de PPO, con el notebook de Colab publicado por el autor.
- Simulacion de politicas de decision empresarial: permite estudiar como cambian las decisiones (reembolsos, inventario, personal) al modificar los pesos de valor beneficio/satisfaccion/riesgo.
- Analisis de gestion de riesgo de fraude: el modelo consume `fraud_score` y datos del cliente para decidir entre reembolso total, parcial, denegacion o revision humana, util como caja de arena para disenar umbrales.
- Benchmarking interno de agentes: al integrarse con `connect-tycoon`, se puede enfrentar contra el jefe basado en reglas u otras versiones (v2, v3) y medir beneficio, satisfaccion, incidentes, revisiones humanas y dias de rotura de stock.
- Experimentos de "conexion de modelos" (Connect AI): forma parte de un estudio sobre composicion de modelos que la organizacion describe como en fase de pruebas.
- Formacion de equipos de producto: el formato JEV (estado estructurado -> decision tipada) es un patron reutilizable para prototipar asistentes de decision en dominios acotados.
- Automatizacion de pruebas de simuladores: al devolver decisiones con probabilidades, es adecuado para generar trayectorias sinteticas de operacion de empresa.

## Benchmarks y rendimiento

Los unicos datos numericos publicados corresponden al modelo docente `connect-ai-company-v6`, medidos como media de 40 meses no vistos. No se aportan resultados especificos para `connectailab-rl-alvis-v4-teacher`.

| Metrica (media de 40 meses) | Jefe basado en reglas | connect-ai-company-v6 (docente) |
|---|---|---|
| Beneficio mensual | 3,24 millones de wones | 11,15 millones de wones |
| Satisfaccion del cliente | 79 % | 96 % |
| Incidentes de riesgo | 7,8 | 2,4 |
| Revisiones humanas superadas | 37,8 | 12,3 |
| Dias de rotura de stock | 10,7 | 0,6 |

Nota: estos valores cuantifican al modelo docente del que deriva este ajuste fino, no necesariamente al modelo aqui descrito. No se han publicado resultados de benchmarks comparables a MMLU, HumanEval o GSM8K, que no aplican a un modelo de decision RL de este tipo.

## Requisitos de hardware

- Al estar implementado sobre NumPy y operar sobre estados estructurados pequenos, la inferencia es ligera y cabe en CPU sin requisitos de VRAM documentados.
- No se publica numero de parametros, por lo que no es posible estimar VRAM ni memoria de pesos.
- No se especifican GPU recomendadas; por su naturaleza (libreria `numpy`) no se declara dependencia de CUDA.
- Despliegue previsto mediante el paquete `connect-tycoon`: `pip install "connect-tycoon[game]"` y carga con `connect-tycoon play --brain hf:AlexLEEeeee/connectailab-rl-alvis-v4-teacher`, o via `ct.CompanyBrain.from_hub(...)`.
- No se documentan latencia ni throughput. No consta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.

## Comparativa con modelos similares

Los unicos modelos comparables son versiones hermanas del mismo autor y ecosistema. No hay datos de rendimiento publicados para las versiones v2 o v3 mas alla de su descripcion.

| Modelo | Tipo / algoritmo | Libreria | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| connectailab-rl-alvis-v4-teacher | RL (PPO), ajuste fino del docente v6 | numpy | ko | Apache 2.0 | Modelo aqui descrito |
| connectailab-rl-alvis-v2-teacher | RL (PPO) | numpy | ko | Apache 2.0 | Version previa del mismo linaje |
| connectailab-rl-alvis-v3 | RL con PEFT/GRPO, LoRA, safetensors | safetensors | ko | Apache 2.0 | Referencia a base tipo Qwen3.5; formato de pesos distinto |

Fuera de este linaje no se han identificado alternativas publicas comparables con datos verificables, por lo que la comparativa se limita a los modelos citados.

## Limitaciones y advertencias

- Alcance educativo: la propia model card advierte que es un modelo didactico sobre un simulador de empresa sintetico y que no garantiza ni predice resultados de negocio reales.
- Dominio muy restringido: solo opera sobre el entorno CONNECT TYCOON y sus seis dominios de decision; no generaliza a tareas generales ni a texto libre.
- Idioma: solo coreano (ko); no hay soporte multilingue documentado.
- Formato de pesos opaco para el ecosistema habitual: no se publican safetensors ni GGUF; la distribucion es via NumPy y el paquete `connect-tycoon`, lo que limita su reutilizacion fuera de ese toolchain.
- Falta de transparencia tecnica: no se publican numero de parametros, arquitectura de red, volumen de datos de entrenamiento ni hiperparametros, lo que dificulta la reproducibilidad y la auditoria.
- Posible sesgo derivado del simulador: las decisiones se optimizan frente a las recompensas y la distribucion de estados del simulador, no frente a datos reales.
- Riesgo de sobreajuste al jefe basado en reglas durante la fase de imitacion, dado que el aprendizaje inicial proviene de esa politica.
- Trazabilidad limitada: el unico mecanismo de explicacion es la distribucion de probabilidad y el campo `reason`, que en el ejemplo se limita a la etiqueta "politica de aprendizaje por refuerzo".
- Adopcion nula hasta la fecha (0 descargas, 0 likes) y estado experimental dentro del programa Connect AI, que la organizacion describe como en pruebas.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion, pero no exime de las limitaciones anteriores.

## Enlaces

- HuggingFace: https://huggingface.co/AlexLEEeeee/connectailab-rl-alvis-v4-teacher
- Modelo hermano v2: https://huggingface.co/AlexLEEeeee/connectailab-rl-alvis-v2-teacher
- Modelo hermano v3: https://huggingface.co/AlexLEEeeee/connectailab-rl-alvis-v3
- Repositorio GitHub CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab (entrenamiento): https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de aprendizaje por refuerzo: https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz
- Formato JEV: `typesafe/jev-1.13` (referenciado en la model card)
