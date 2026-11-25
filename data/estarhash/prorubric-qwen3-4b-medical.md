# EstarHash/ProRubric-Qwen3-4B-Medical

## Resumen

ProRubric-Qwen3-4B-Medical es un checkpoint de investigacion publicado por EstarHash, resultado de aplicar el metodo ProRubric sobre el modelo base Qwen/Qwen3-4B. ProRubric es una tecnica de alineacion mediante aprendizaje por refuerzo con rubricas (rubric-based RL) que introduce dimensiones de rubrica a nivel de protocolo con clausulas de fallo explicitas, con el objetivo de mitigar el reward hacking en este tipo de entrenamiento. El trabajo de referencia es el articulo "Scoring Higher, Answering Worse: Mitigating Reward Hacking in Rubric-Based RL via Protocol-Level Rubrics" (arXiv:2609.38847).

El checkpoint corresponde al dominio medico, con semilla 42 y paso de RL 300, y se entreno con PPO/GRPO a traves de la libreria verl v0.8.0. El modelo base Qwen3-4B es un transformer denso de aproximadamente 4.022 millones de parametros, por lo que el checkpoint hereda el tamano y la arquitectura del modelo original, con pesos en formato safetensors y licencia Apache 2.0.

Su relevancia es fundamentalmente metodologica: sirve para reproducir y estudiar el comportamiento de ProRubric en un dominio sensible como el medico, y para comparar como afectan las rubricas a nivel de protocolo al equilibrio entre puntuacion obtenida y calidad real de las respuestas. El autor lo libera estrictamente para investigacion academica y reproducibilidad, no para uso clinico ni atencion real a pacientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-4B); no se detalla en la model card |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen3-4B) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El checkpoint parte de Qwen/Qwen3-4B, un transformer denso de unos 4.022 millones de parametros. Sobre esa base se aplica ProRubric, un metodo de alineacion por aprendizaje por refuerzo basado en rubricas. La innovacion central del metodo, segun el titulo del articulo de referencia, consiste en definir rubricas a nivel de protocolo con dimensiones conjuntivas y clausulas de fallo explicitas, de forma que el modelo no pueda maximizar la puntuacion del juez de rubrica sin cumplir realmente los requisitos de la tarea. El objetivo declarado es mitigar el reward hacking en el RL basado en rubricas.

El entrenamiento se realizo con PPO/GRPO mediante verl v0.8.0, con semilla 42 y en el paso de RL 300, en el dominio medico. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas adicionales de SFT, DPO o RLHF mas alla del RL con rubricas. Tampoco se especifican innovaciones de inferencia como decodificacion especulativa o atencion lineal; cualquier capacidad de este tipo provendria del modelo base Qwen3-4B y no esta documentada en la informacion disponible.

## Capacidades

- Generacion de texto y razonamiento general, heredados del modelo base Qwen3-4B.
- Respuestas orientadas al dominio medico, al haber sido entrenado con rubricas especificas de ese ambito.
- Alineacion con rubricas a nivel de protocolo, disenada para reducir el reward hacking en tareas evaluadas por criterios estructurados.
- Capacidades de codigo y matematicas del modelo base: no documentadas de forma especifica en la model card.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Reproduccion de experimentos de alineacion: el checkpoint permite replicar el paso 300 del entrenamiento ProRubric con semilla 42 y comparar los resultados con los del articulo, gracias a que los pesos y la configuracion estan publicados.
- Estudio del reward hacking en RL con rubricas: sirve como caso controlado para analizar como las rubricas a nivel de protocolo afectan a la relacion entre puntuacion del juez y calidad real de la respuesta en un dominio concreto.
- Evaluacion de jueces automaticos en dominio medico: al estar entrenado con rubricas medicas, puede usarse para probar la robustez de pipelines de evaluacion basados en rubricas frente a respuestas que solo parecen correctas.
- Investigacion sobre alineacion en dominios de alto riesgo: permite estudiar si el metodo reduce respuestas superficialmente plausibles pero clinicamente incorrectas, siempre en entorno de laboratorio.
- Comparacion de metodos de RL: puede enfrentarse a otros checkpoints del mismo modelo base (SFT, DPO, RL con rubricas estandar) para aislar el efecto de ProRubric.
- Docencia y formacion en tecnicas de RLHF: util como ejemplo practico de PPO/GRPO con verl y de diseno de rubricas con clausulas de fallo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (FP16/BF16): aproximadamente 8 GB solo para los pesos, mas overhead de activaciones y cache KV; en la practica se recomiendan 10-12 GB o mas.
- VRAM estimada con cuantizacion de 8 bits: alrededor de 4-5 GB para los pesos, mas overhead.
- VRAM estimada con cuantizacion de 4 bits: alrededor de 2,5-3 GB para los pesos, mas overhead.
- GPU recomendadas: A100, H100 o L40S para entrenamiento y evaluacion a gran escala; RTX 4090, RTX 3090 o RTX 4080 para inferencia en FP16.
- Cabe en GPU de consumo: si, en tarjetas con 12 GB o mas en FP16 y en tarjetas con 8 GB o mas usando cuantizacion.
- Opciones de despliegue: vLLM, TGI, llama.cpp y Ollama son opciones habituales para modelos de este tamano; la model card no confirma compatibilidad explicita con cada una.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ProRubric-Qwen3-4B-Medical | 4.022 M | no disponible | RL con rubricas de protocolo (dominio medico) | Apache 2.0 | Hugging Face, 30 descargas |
| Qwen/Qwen3-4B | ~4.000 M | no disponible en la informacion proporcionada | Modelo base generalista | Apache 2.0 | Hugging Face |
| Otros checkpoints ProRubric (mismo metodo, otros dominios o semillas) | no disponible | no disponible | RL con rubricas de protocolo | no disponible | no disponible |

La comparacion cuantitativa de rendimiento con alternativas no esta disponible, ya que la model card no incluye resultados de benchmarks.

## Limitaciones y advertencias

- El autor declara explicitamente que el modelo es solo para investigacion academica y reproducibilidad, y que no debe usarse para diagnostico clinico, consejo medico ni atencion real a pacientes.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de este tamano, especialmente en un dominio factual tan exigente como el medico.
- Sesgos conocidos: no documentados en la informacion proporcionada; se heredan los del modelo base Qwen3-4B.
- Limitaciones de contexto e idioma: no documentadas en la model card; los idiomas soportados figuran como no disponibles.
- El checkpoint corresponde a un unico paso de RL (paso 300, semilla 42) y a un unico dominio (medico), por lo que su comportamiento puede no generalizar a otras tareas.
- La licencia Apache 2.0 permite uso comercial del codigo y los pesos, pero el disclaimer del autor restringe el uso a investigacion y desaconseja explicitamente aplicaciones clinicas.
- Modelo con muy poca traccion (30 descargas, 0 likes en el momento de la consulta): no hay evidencia comunitaria de validacion independiente.

## Enlaces

- Hugging Face: https://huggingface.co/EstarHash/ProRubric-Qwen3-4B-Medical
- Paper: https://arxiv.org/abs/2609.38847
- Codigo: https://github.com/Estrellajer/ProRubric
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
