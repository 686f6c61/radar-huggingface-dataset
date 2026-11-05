# kareyoung09/connectailab-rl-kay09-jeongyakyong-obstacle-v1-link01

## Resumen

LINK-01 es un adaptador LoRA de aprendizaje por refuerzo (PPO) construido sobre el modelo base Qwen/Qwen3.5-0.8B, desarrollado por kareyoung09 en el marco del proyecto CONNECT AI LAB × AI CITY BUILDERS. Su funcion es actuar como modulo de decision de alto nivel para el robot bipedo LINK-01: a partir de las observaciones del entorno, el modelo selecciona una accion de alto nivel orientada a la tarea de esquivar obstaculos (avoid_obstacles). No es un modelo de lenguaje de proposito general, sino un componente de politica entrenado para un dominio robotico muy concreto.

El modelo se distribuye como adaptador PEFT (formato safetensors) que debe cargarse junto al checkpoint base de 0,8 mil millones de parametros. La model card declara unos resultados modestos: 33,8 % de acierto en el conjunto de prueba y 0,0 % de exito en 20 episodios de conduccion real, lo que lo situa como un artefacto experimental o de investigacion mas que como un sistema listo para produccion.

Su relevancia actual es acotada: sirve como ejemplo reproducible de como aplicar RL con PPO y LoRA sobre un LLM pequeno para tareas de decision secuencial en robotica, y como referencia para comparar variantes de entrenamiento dentro del ecosistema del proyecto LINK-01.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5) con adaptador LoRA entrenado mediante PPO |
| Parametros totales | 0,8 mil millones (modelo base Qwen/Qwen3.5-0.8B); parametros del adaptador no disponibles |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parametros. Sobre el se aplica un adaptador LoRA de bajo rango, de modo que solo se entrena un subconjunto reducido de pesos. El pipeline declarado es `reinforcement-learning` y las etiquetas indican uso de PPO (Proximal Policy Optimization) en un esquema de deep reinforcement learning. El objetivo de entrenamiento es una politica de decision de alto nivel: dado un estado observado del robot LINK-01, producir una accion discreta de alto nivel.

La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion del dataset, la funcion de recompensa ni si hubo fases adicionales de RLHF o DPO. Tampoco se especifican hiperparametros del PPO (tasa de aprendizaje, clipping, numero de epocas) ni el rango y alpha del adaptador LoRA. El repositorio tiene un tamano de 0,0 GB, coherente con un adaptador de pocos pesos, y no se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Decision de alto nivel en robotica: selecciona acciones a partir de observaciones del robot bipedo LINK-01 para la tarea de esquivar obstaculos.
- Aprendizaje por refuerzo con PPO: el adaptador esta optimizado para maximizar recompensa en el entorno de simulacion o despliegue del proyecto, no para generar texto libre.
- Comprension y generacion en coreano: hereda las capacidades linguisticas del modelo base Qwen3.5-0.8B, aunque el adaptador las reorienta hacia la tarea de control.
- Integracion via PEFT: se carga con `peft.PeftModel` sobre el checkpoint base, lo que permite combinarlo con otras tecnicas o adaptadores.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Investigacion en RL para robotica: usar el adaptador como linea base reproducible para comparar variantes de PPO, recompensas o arquitecturas en la tarea avoid_obstacles del proyecto LINK-01.
- Prototipado de politicas de alto nivel: integrar el modelo en un bucle de simulacion para generar acciones discretas a partir de observaciones y evaluar su tasa de exito antes de invertir en entrenamiento adicional.
- Docencia y divulgacion: servir como ejemplo practico de como aplicar LoRA y PPO sobre un LLM pequeno para decision secuencial, dado su tamano reducido y su licencia permisiva.
- Benchmark interno de variantes: comparar este adaptador (identificado como link01 y persona jeongyakyong) con otras variantes del mismo proyecto para aislar el efecto de la configuracion de entrenamiento.
- Pruebas de integracion de infraestructura: validar pipelines de carga PEFT, serializacion safetensors y despliegue en entornos de inferencia de bajo coste con un modelo de 0,8B.
- Analisis de fallos: estudiar por que un modelo con 33,8 % de acierto en test obtiene 0,0 % en conduccion real, lo que resulta util para diagnosticar desajustes entre distribucion de entrenamiento y despliegue (sim-to-real gap).

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Precision en el conjunto de prueba (Accuracy) | 33,8 % |
| Exito en conduccion real (20 episodios) | 0,0 % |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Las dos metricas anteriores son las unicas reportadas por el autor y estan referidas a la tarea especifica de esquivar obstaculos.

## Requisitos de hardware

- VRAM estimada para inferencia: un modelo de 0,8B en precision fp16 ocupa aproximadamente 1,6 GB de pesos; en cuantizacion de 8 bits, en torno a 0,8 GB, y en 4 bits, alrededor de 0,4 GB. El adaptador LoRA anade una cantidad marginal. Estas cifras son estimaciones a partir del tamano del modelo base, no datos publicados por el autor.
- GPU recomendadas: cualquier GPU consumer moderna con al menos 4 GB de VRAM es suficiente para el modelo base en fp16; para cuantizaciones de 4 bits basta con 2 GB. GPU de datacenter (A100, H100) no son necesarias.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer reciente (RTX 3060, RTX 4060, RTX 4090, entre otras).
- Opciones de despliegue: carga mediante `transformers` + `peft` segun el ejemplo de la model card. No se documenta soporte explicito para vLLM, llama.cpp, Ollama o TGI con este adaptador; al tratarse de un adaptador PEFT, la via natural es `transformers` con `PeftModel`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (adaptadores RL para control de robots bipedos) dentro de la informacion proporcionada. Como referencia del modelo base:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| LINK-01 avoid_obstacles (este adaptador) | 0,8B (base) + LoRA | No disponible | Apache-2.0 | HuggingFace |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | No disponible | No disponible en la informacion | HuggingFace |
| Alternativas RL para robotica | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Rendimiento muy bajo en despliegue real: 0,0 % de exito en 20 episodios de conduccion, lo que indica que el modelo no es apto para uso en produccion ni en robots fisicos sin un reentrenamiento sustancial.
- Precision limitada incluso en test: 33,8 % de acierto sugiere que la politica no ha convergido o que la tarea es especialmente dificil con este presupuesto de entrenamiento.
- Sesgo de dominio: el adaptador esta especializado en la tarea avoid_obstacles y en el robot LINK-01; no debe esperarse comportamiento util fuera de ese contexto.
- Idioma: el modelo declara soporte unicamente de coreano; el rendimiento en castellano u otros idiomas no esta garantizado.
- Riesgo de alucinacion: al ser un LLM subyacente, puede generar acciones o justificaciones incoherentes si se usa fuera de la distribucion de observaciones de entrenamiento.
- Falta de documentacion: no se detallan datos de entrenamiento, recompensas, hiperparametros ni limitaciones conocidas, lo que dificulta la reproducibilidad y la evaluacion de riesgos.
- Licencia Apache-2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; la responsabilidad de validacion recae en el usuario.
- Fecha de creacion futura (2026-11-05) en los metadatos, lo que puede indicar un error de registro o un artefacto de prueba; conviene verificar la integridad del repositorio antes de usarlo.

## Enlaces

- HuggingFace: https://huggingface.co/kareyoung09/connectailab-rl-kay09-jeongyakyong-obstacle-v1-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- No se han encontrado en la informacion disponible papers, blogs, repositorios ni demos adicionales del proyecto LINK-01.
