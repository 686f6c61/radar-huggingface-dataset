# Aoife1111/connectailab-rl-aoife-v1-teacher

## Resumen

connectailab-rl-aoife-v1-teacher es una politica de decision entrenada por aprendizaje por refuerzo para operar una empresa simulada dentro de CONNECT TYCOON, un simulador de gestion empresarial. Lo desarrolla Aoife1111 dentro del ecosistema de CONNECT AI LAB y AI CITY BUILDERS. No es un modelo de lenguaje: se presenta como el "cortex prefrontal" de una empresa que, durante un mes simulado de 20 dias laborables, decide sobre asignacion de personal, pedidos de inventario, marketing, atencion al cliente, reembolsos y seguridad.

El modelo responde en el mismo formato estructurado que JEV (typesafe/jev-1.13), devolviendo decisiones con tipo, eleccion, distribucion de probabilidad, nivel de confianza y una razon. Su entrenamiento combina una fase de imitacion supervisada de una "jefa basada en reglas" y una fase posterior de ajuste con PPO usando como recompensa el valor de la empresa (beneficio, satisfaccion del cliente y aversion al riesgo).

Su relevancia es fundamentalmente educativa y de investigacion aplicada: sirve como ejemplo reproducible de un agente de decision con RL sobre un entorno Gymnasium, y permite comparar el comportamiento aprendido frente a una heuristica de reglas. La model card advierte explicitamente de que se trata de un modelo didactico sobre un simulador sintetico y de que no garantiza ni predice resultados empresariales reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica de aprendizaje por refuerzo (PPO) sobre red neuronal; topologia no especificada en la model card |
| Parametros totales | no disponible |
| Longitud de contexto | no aplica (no es un modelo de lenguaje); consume una observacion estructurada del simulador por paso |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible; se carga mediante `CompanyBrain.from_hub` con la libreria numpy |
| Libreria de referencia | numpy |
| Pipeline | reinforcement-learning |
| Entorno | CONNECT TYCOON (Gymnasium) |
| Valores de la empresa | beneficio 1.0, satisfaccion del cliente 1.0, riesgo 1.0 |
| Tamano del paso temporal | 20 dias laborables (un mes simulado) |

## Arquitectura y entrenamiento

La model card describe un agente de decision entrenado en dos etapas. Primero aprende por imitacion de una "jefa basada en reglas" (aprendizaje supervisado), lo que le proporciona una politica inicial razonable. Despues ajusta esa politica mediante PPO, usando como senal de recompensa el vector de valores de la empresa: beneficio economico, satisfaccion del cliente y evitacion de riesgos, todos ponderados con peso 1.0. No se especifican en la informacion disponible la topologia de la red, el numero de parametros, el tamano de las capas ni los hiperparametros concretos de PPO.

El modelo decide sobre seis areas operativas (personal, inventario, marketing, atencion al cliente, reembolsos y seguridad) y emite sus respuestas en el formato de JEV (typesafe/jev-1.13), con campos de tipo, eleccion, probabilidades por alternativa, confianza y razon. La configuracion de la empresa usada en la evaluacion publicada es `{"warehouse": 250.0, "base_demand": 40.0, "unit_cost": 1.5, "order_scale": 1.0, "staff_bonus": 0, "wage": 0.0, "ad_power": 1.0, "fraud_tool": 0, "extra_cs": 0, "extra_refund": 0}`. No se detallan en la model card la composicion completa del dataset de imitacion ni el numero de pasos de entrenamiento.

## Capacidades

- Toma de decisiones discretas con distribucion de probabilidad sobre las alternativas disponibles (por ejemplo, reembolso total, parcial, denegacion o revision humana).
- Razonamiento secuencial de multiples pasos a lo largo de un episodio de 20 dias laborables simulados.
- Gestion de personal: asignacion de trabajadores a departamentos.
- Gestion de inventario: calculo de pedidos para evitar roturas de stock.
- Marketing: decisiones de inversion publicitaria.
- Atencion al cliente: gestion de solicitudes y escalado.
- Gestion de reembolsos: clasificacion entre reembolso total, parcial, denegacion o derivacion a una persona.
- Seguridad y deteccion de fraude: evaluacion de peticiones sospechosas.
- Salida estructurada compatible con el esquema JEV, con nivel de confianza por decision.
- Soporte de tool calling / function calling: no disponible.
- Capacidades de vision, audio o generacion de texto: no aplica.
- Capacidades multilingues: limitadas al coreano; no se documentan otros idiomas.

## Casos de uso

- Investigacion en aprendizaje por refuerzo: usar el modelo como linea base entrenada con PPO para comparar con otras politicas en el entorno CONNECT TYCOON, midiendo beneficio, satisfaccion y riesgo.
- Educacion en RL y entornos Gymnasium: el modelo y su notebook de Colab permiten reproducir el ciclo completo de imitacion mas PPO en un problema de decision empresarial.
- Desarrollo de agentes de decision estructurada: sirve de referencia para implementar agentes que devuelven decisiones con probabilidades y confianza en lugar de texto libre.
- Simulacion de politicas de negocio: permite evaluar como reacciona una politica aprendida ante distintas configuraciones de empresa (almacen, demanda base, coste unitario).
- Estudio de automatizacion de atencion al cliente: el modelo ilustra el equilibrio entre aprobar reembolsos, denegarlos y escalarlos a revision humana en funcion de una puntuacion de fraude.
- Juego y demostracion interactiva: mediante `connect-tycoon play --brain hf:Aoife1111/connectailab-rl-aoife-v1-teacher` se puede poner al modelo a dirigir la empresa y observar el resultado en el simulador.
- Docencia sobre alineacion de recompensas: util para mostrar como un vector de pesos (beneficio, satisfaccion, riesgo) condiciona el comportamiento aprendido.
- Benchmarking de heuristicas frente a RL: la model card publica una comparacion directa contra la politica basada en reglas.

## Benchmarks y rendimiento

Los unicos resultados publicados proceden de la propia model card, que compara el modelo con la "jefa basada en reglas" sobre 40 meses no vistos previamente:

| Metrica (media de 40 meses) | Jefa basada en reglas | connectailab-rl-aoife-v1-teacher |
|---|---|---|
| Beneficio mensual | 3,24 millones de won | 11,98 millones de won |
| Satisfaccion del cliente | 79 % | 96 % |
| Incidentes de riesgo | 7,8 | 1,3 |
| Revisiones humanas superadas | 37,8 | 14,4 |
| Dias de rotura de stock | 10,7 | 0,6 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, dado que no se trata de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al estar empaquetado como politica basada en numpy y no como red de gran tamano, es probable que la inferencia se realice en CPU, pero la model card no confirma requisitos.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; lo mas probable es que no requiera GPU, aunque no esta documentado.
- Opciones de despliegue: la via documentada es la libreria `connect-tycoon` (`pip install "connect-tycoon[game]"`) y la carga mediante `ct.CompanyBrain.from_hub`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no identifica modelos comparables de la misma categoria (agentes de decision por RL para simulacion empresarial). La unica referencia comparativa publicada es la politica basada en reglas del propio simulador CONNECT TYCOON, que no es un modelo publicado de forma independiente.

## Limitaciones y advertencias

- Modelo educativo sobre un simulador sintetico: la propia model card indica que no garantiza ni predice resultados empresariales reales.
- Ambito limitado: solo opera sobre el entorno CONNECT TYCOON, con decisiones discretas predefinidas; no es un modelo de proposito general.
- Idioma: unicamente coreano.
- Sesgo de recompensa: el comportamiento esta condicionado por los pesos usados en el entrenamiento (beneficio, satisfaccion y riesgo a 1.0); cambiar esos pesos alteraria las decisiones.
- Dependencia de la configuracion de empresa: los resultados publicados corresponden a una configuracion concreta; no se documenta su robustez ante otras configuraciones.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero las probabilidades y la confianza declaradas dependen del ajuste de la politica y no deben interpretarse como garantia.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificacion, pero el autor no ofrece garantias; conviene revisar tambien las condiciones del simulador y del formato JEV empleado.
- Ausencia de datos tecnicos: no se publican numero de parametros, arquitectura de red ni detalles de entrenamiento, lo que dificulta la reproducibilidad fina.
- Sin soporte documentado de tool calling, vision o audio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Aoife1111/connectailab-rl-aoife-v1-teacher
- Repositorio CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab (entrenamiento RL): https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de aprendizaje por refuerzo (AI CITY BUILDERS): https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz
- Formato JEV de referencia: typesafe/jev-1.13 (mencionado en la model card)
