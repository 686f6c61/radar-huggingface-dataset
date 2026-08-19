# AlexChen1997/fedagent-webshop-hardness-std1-ppo-qwen2.5-1.5b

## Resumen

FedAgent es un modelo de lenguaje especializado en tareas de compra web simulada (WebShop), desarrollado por el equipo de investigación de UC Berkeley (sunblaze-ucb) y publicado en HuggingFace por AlexChen1997. Se trata de un fine-tune del modelo base `Qwen/Qwen2.5-1.5B-Instruct` mediante aprendizaje por refuerzo federado (federated RL) con el algoritmo PPO, agregado con FedAvg. El objetivo del experimento es estudiar la robustez del RL descentralizado para agentes LLM ante heterogeneidad en la distribución de tareas entre clientes.

El modelo se entrena sobre el benchmark WebShop, un entorno simulado de compras online donde el agente debe navegar, buscar productos y completar pedidos. La configuración utiliza 100 clientes, 2 clientes por ronda, 70 rondas y una partición de dificultad extrema (success_std=1) para maximizar la heterogeneidad. El repositorio incluye checkpoints de cada 10 rondas, así como artefactos completos del entrenamiento (configuración, métricas, logs). El modelo es relevante para la investigación en aprendizaje federado, robustez de agentes y evaluación de algoritmos de RL distribuido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-1.5B-Instruct) |
| Parametros totales | 1.5 mil millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-1.5B-Instruct soporta 32K tokens, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen2.5-1.5B-Instruct, un transformer decoder-only con 1.500 millones de parametros. Sobre esta base se aplica un entrenamiento de aprendizaje por refuerzo federado con el algoritmo PPO (Proximal Policy Optimization) usando estimador de ventaja GAE. Tanto el actor como el critic se agregan cada ronda mediante FedAvg con pesos iguales sobre checkpoints fragmentados con FSDP.

El entorno de entrenamiento es WebShop, un simulador de compras online que presenta al agente una observacion multi-turno con historial de ventana 2, prompt de 4096 tokens y respuesta de 512 tokens. La heterogeneidad se introduce mediante una particion por dificultad de las tareas (hardness partition) con desviacion estandar de exito igual a 1, la configuracion mas sesgada. Se usan 100 clientes, 2 clientes por ronda, 70 rondas y 3 epocas locales por cliente, con un minimo de 100 objetivos por cliente. Los hiperparametros incluyen learning rate del actor de 1e-6, del critic de 1e-5 y coeficiente KL de 0.01.

El entrenamiento se ejecuto en 4 GPUs H100-80GB con el stack verl 0.8 y vLLM 0.11, utilizando aceleraciones como persistencia del trainer entre rondas, evaluacion con motor caliente y servicios de entorno precalentados. El codigo esta disponible en el repositorio FedAgent (Apache-2.0), que se basa en verl y la integracion de WebShop.

## Capacidades

- Agente de compras web: el modelo esta entrenado para operar en el entorno WebShop, emitiendo acciones `search[...]` y `click[...]` para navegar, buscar productos y completar pedidos.
- Razonamiento multi-turno: maneja conversaciones con historial de ventana 2, lo que le permite mantener contexto sobre acciones previas.
- Adaptacion a heterogeneidad: al ser entrenado con particion de dificultad extrema, el modelo muestra capacidad para generalizar a tareas de distinta complejidad.
- No es un modelo generalista: esta especializado exclusivamente en el formato de observacion de FedAgent/verl-agent para WebShop; no soporta otras tareas de lenguaje natural fuera de este entorno.

## Casos de uso

- Investigacion en aprendizaje federado: sirve como punto de referencia para estudiar como afecta la heterogeneidad de tareas a la robustez de agentes LLM entrenados con RL federado. Los checkpoints por ronda permiten analizar la dinamica de entrenamiento.
- Evaluacion de algoritmos de agregacion: los artefactos del run (config, metricas, logs) facilitan la comparacion de FedAvg con otros metodos de agregacion en entornos no IID.
- Desarrollo de agentes de compra simulada: puede integrarse en pipelines de evaluacion de agentes para benchmarks como WebShop, proporcionando una linea base entrenada con RL.
- Estudio de robustez ante sesgo de distribucion: el modelo entrenado con particion extrema (std=1) es util para probar metodos de mitigacion de sesgo en RL federado.
- Reproducibilidad de experimentos: el repositorio incluye scripts de orquestacion y configuracion exacta, permitiendo reproducir el entrenamiento o continuar desde un checkpoint.
- Educacion en RL federado: como ejemplo completo de implementacion de PPO federado con LLMs, es un recurso didactico para cursos avanzados de machine learning distribuido.

## Benchmarks y rendimiento

El modelo se evalua cada ronda en un conjunto de validacion no perturbado de 64 tareas de WebShop con temperatura 0.4. Las metricas son `success_rate` (fraccion de episodios con exito completo) y `task_score` (puntuacion parcial de coincidencia de objetivos en [0,1]).

| Ronda | success_rate | task_score | reward_mean |
|---|---|---|---|
| 0 (modelo base) | 7.8% | 0.160 | 0.78 |
| 10 | 9.4% | 0.327 | 0.94 |
| 20 | 12.5% | 0.264 | 1.25 |
| 30 | 34.4% | 0.655 | 3.44 |
| 35 (ultima al escribir el README) | 34.4% | 0.637 | 3.44 |
| 31 (mejor hasta el momento) | 40.6% | 0.742 | 4.06 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible. Los numeros corresponden a una unica evaluacion de 64 tareas, por lo que se espera ruido de unos pocos puntos entre rondas, amplificado por el sesgo extremo de dificultad.

## Requisitos de hardware

- Inferencia: al ser un modelo de 1.5B de parametros, es ligero. Con cuantizacion de 4 bits cabria en aproximadamente 2-3 GB de VRAM, aunque no se proporcionan datos concretos de cuantizacion en la informacion disponible.
- GPUs recomendadas para inferencia: cualquier GPU consumer con al menos 4 GB de VRAM (p.ej., RTX 3060, RTX 4060) seria suficiente para ejecutar el modelo en precision FP16.
- Entrenamiento: el run original uso 4x H100-80GB con FSDP y vLLM; replicar el entrenamiento completo requiere hardware similar o acceso a cloud con GPUs de alta memoria.
- Opciones de despliegue: al ser un modelo de HuggingFace en formato safetensors, puede cargarse con transformers, vLLM, llama.cpp (si se convierte a GGUF) u Ollama. No se proporcionan configuraciones especificas de despliegue.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FedAgent (este modelo) | 1.5B | no disponible | PPO federado sobre WebShop | Apache-2.0 | HuggingFace |
| Qwen2.5-1.5B-Instruct (base) | 1.5B | 32K (segun documentacion oficial) | Instruct fine-tune | Apache-2.0 | HuggingFace |
| Otros agentes de WebShop | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa directa con otros modelos de agente de WebShop no esta disponible en la informacion proporcionada. La principal diferencia con el modelo base es la especializacion en tareas de compra simulada y el metodo de entrenamiento (RL federado en lugar de SFT).

## Limitaciones y advertencias

- Especializacion estrecha: el modelo solo funciona correctamente con el formato de observacion de FedAgent/verl-agent para WebShop. No es util para tareas generales de lenguaje.
- Entorno simulado: el entrenamiento se realizo en un simulador; el comportamiento en entornos reales de compra no esta validado y probablemente no generalice.
- Sesgo de distribucion: la particion de dificultad extrema (std=1) puede inducir un sesgo hacia tareas de cierta complejidad, aunque el objetivo del experimento es estudiar precisamente esa robustez.
- Riesgo de alucinacion: como cualquier LLM, puede generar acciones invalidas o incoherentes si se le presenta una observacion fuera de su distribucion de entrenamiento.
- Ruido en evaluacion: las metricas reportadas provienen de una unica evaluacion de 64 tareas; los resultados pueden variar con diferentes semillas o conjuntos de validacion.
- Licencia: Apache-2.0 permite uso comercial, pero el modelo es un artefacto de investigacion y no se ofrece ninguna garantia de rendimiento en produccion.
- Repositorio grande: el repo pesa 37.1 GB debido a los multiples checkpoints y artefactos; descargarlo completo puede ser costoso en ancho de banda.

## Enlaces

- HuggingFace: https://huggingface.co/AlexChen1997/fedagent-webshop-hardness-std1-ppo-qwen2.5-1.5b
- Repositorio de codigo FedAgent: https://github.com/sunblaze-ucb/FedAgent
- Paper (citado en la model card): "Is Decentralized LLM Agent RL Robust to Heterogeneity? An Asymmetric Tale" (arXiv preprint, 2026, autores: Canyu Chen, Kangyu Zhu, Zhaorun Chen, Zhanhui Zhou, Shizhe Diao, Yiping Lu, Tian Li, Manling Li, Dawn Song)
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
