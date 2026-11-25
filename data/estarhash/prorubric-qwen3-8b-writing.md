# EstarHash/ProRubric-Qwen3-8B-Writing

## Resumen

ProRubric-Qwen3-8B-Writing es un checkpoint de ajuste fino por refuerzo (RL) construido sobre Qwen/Qwen3-8B, desarrollado por EstarHash en el marco del trabajo de investigacion "Scoring Higher, Answering Worse: Mitigating Reward Hacking in Rubric-Based RL via Protocol-Level Rubrics" (arXiv:2609.38847). El modelo aplica la metodologia ProRubric, que introduce dimensiones de rubrica a nivel de protocolo con clausulas de fallo explicitas para mitigar el reward hacking que aparece cuando se optimiza un modelo con rubricas de evaluacion. El checkpoint publicado corresponde al dominio de escritura (Writing), con semilla 42 y paso de RL 300.

El modelo parte de la arquitectura de Qwen3-8B, un transformer denso de 8.190.735.360 parametros (8,19 mil millones), y se entrena mediante PPO/GRPO con la libreria verl v0.8.0. Su relevancia actual reside en que aborda un problema concreto y documentado del alineamiento con RL basado en rubricas: la divergencia entre mejorar la puntuacion asignada por el evaluador y mejorar la calidad real de las respuestas. El checkpoint es de tipo reinforcement-learning y se distribuye en formato safetensors bajo licencia Apache 2.0.

El repositorio ocupa 16,4 GB y acumula 29 descargas en el momento de la consulta. No se han publicado en la informacion disponible datos sobre idiomas soportados, benchmarks ni detalles del dataset de entrenamiento mas alla de la metodologia y el paso de RL indicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3-8B) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen3-8B) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos originales en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3-8B, un transformer denso de aproximadamente 8,19 mil millones de parametros. Sobre esa base se aplica un ajuste fino por refuerzo con la metodologia ProRubric, que sustituye o complementa las rubricas de evaluacion convencionales por dimensiones de rubrica a nivel de protocolo con clausulas de fallo explicitas. El objetivo declarado en el paper es mitigar el reward hacking: la tendencia del modelo a optimizar la puntuacion del evaluador sin mejorar la calidad efectiva de la respuesta.

El entrenamiento se realizo con PPO/GRPO mediante verl v0.8.0, con semilla 42 y en el paso de RL 300, y esta especializado en el dominio de escritura. No se dispone en la informacion proporcionada de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO adicional ni innovaciones de inferencia como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto y redaccion en el dominio de escritura, que es el dominio de especializacion del checkpoint.
- Razonamiento y respuesta a instrucciones heredados de la base Qwen3-8B.
- Alineamiento orientado a reducir el reward hacking en tareas evaluadas con rubricas.
- Soporte de tool calling / function calling: no confirmado en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades especiales (modo thinking, vision, audio): no disponibles en la informacion proporcionada.

## Casos de uso

- Evaluacion y mejora de redaccion automatizada: el modelo puede generar y revisar textos en el dominio de escritura, aprovechando el entrenamiento especifico con rubricas de protocolo para producir respuestas que cumplan criterios explicitos de calidad en lugar de optimizar solo la puntuacion del evaluador.
- Generacion de contenido editorial con criterios verificables: al incorporar clausulas de fallo explicitas en el entrenamiento, es adecuado para pipelines donde cada texto debe cumplir una lista de requisitos (tono, estructura, ausencia de errores concretos) y donde el incumplimiento debe detectarse de forma fiable.
- Investigacion en alineamiento y reward hacking: sirve como checkpoint de referencia para reproducir o comparar experimentos de RL basado en rubricas, dado que el paper y el codigo estan publicados y el checkpoint corresponde a un paso y semilla concretos.
- Fine-tuning posterior para dominios de escritura especificos: al estar bajo Apache 2.0 y en safetensors, puede reentrenarse o adaptarse con LoRA a dominios como documentacion tecnica, marketing o contenido educativo.
- Sistemas de puntuacion y feedback de textos: el modelo puede emplearse como generador de borradores o de feedback estructurado en herramientas de correccion y mejora de escritura, apoyandose en su entrenamiento con dimensiones de rubrica.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia Apache 2.0 permite uso comercial e integracion en productos sin las restricciones de licencias copyleft, siempre que se respeten las condiciones de atribucion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (BF16/FP16): aproximadamente 16,4 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda al menos 24 GB.
- Cuantizacion a 8 bits: alrededor de 8-9 GB de pesos, viable en GPUs de 16 GB.
- Cuantizacion a 4 bits: alrededor de 4-5 GB de pesos, viable en GPUs consumer de 8-12 GB.
- GPUs recomendadas: A100 40/80 GB, H100 80 GB para despliegue en BF16 con contexto largo; RTX 4090 (24 GB) para BF16 con contexto moderado; RTX 3090/4080 (16-24 GB) con cuantizacion 8 bits.
- Cabe en GPU consumer: si, con cuantizacion (4 u 8 bits) en tarjetas de 8 GB o mas; en BF16 requiere 24 GB o mas.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama y transformers, segun el formato de pesos convertido; el repositorio solo incluye safetensors, por lo que para llama.cpp/Ollama habria que generar el GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ProRubric-Qwen3-8B-Writing | 8,19 mil millones | no disponible | RL con rubricas, dominio escritura | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-8B | 8,19 mil millones | no disponible en esta ficha | Modelo base generalista | Apache 2.0 | Hugging Face |
| Alternativas de RL con rubricas de 7-8B | no disponible | no disponible | Alineamiento | no disponible | no disponible |

La comparacion cuantitativa con otros checkpoints de RL basados en rubricas no esta disponible en la informacion proporcionada. La referencia natural es el modelo base Qwen3-8B, del que este checkpoint hereda arquitectura y tamano pero del que difiere por el ajuste ProRubric en el dominio de escritura.

## Limitaciones y advertencias

- El checkpoint esta especializado en el dominio de escritura; su comportamiento en otras tareas puede degradarse respecto al modelo base.
- El paper del que deriva aborda explicitamente el riesgo de reward hacking; aun asi, el modelo puede seguir optimizando criterios de rubrica sin mejorar la calidad real en casos no cubiertos por las clausulas de fallo.
- Riesgo de alucinacion: no evaluado en la informacion disponible; debe asumirse el riesgo habitual de los modelos de 8B en tareas factuales.
- Idiomas soportados no documentados; no se garantiza un rendimiento multilingue mas alla del heredado de Qwen3-8B.
- Longitud de contexto no documentada en la ficha del checkpoint; debe consultarse la del modelo base antes de disenar aplicaciones con contexto largo.
- El checkpoint corresponde a un unico paso de RL (300) y una unica semilla (42); no hay evidencia publicada de robustez frente a otras configuraciones.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las condiciones de atribucion y las posibles obligaciones derivadas del modelo base.
- El numero de descargas (29) y la ausencia de likes indican una validacion externa muy limitada; conviene evaluar el modelo en el caso de uso concreto antes de llevarlo a produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EstarHash/ProRubric-Qwen3-8B-Writing
- Paper: https://arxiv.org/abs/2609.38847
- Codigo: https://github.com/Estrellajer/ProRubric
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
