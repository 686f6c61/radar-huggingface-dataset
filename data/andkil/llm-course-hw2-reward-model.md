# andkil/llm-course-hw2-reward-model

## Resumen

`andkil/llm-course-hw2-reward-model` es un modelo de recompensa (reward model) obtenido mediante fine-tuning supervisado del modelo instruct `HuggingFaceTB.SmolLM-135M-Instruct` sobre el dataset `HumanLLMs/Human-Like-DPO-Dataset`. Lo publica el usuario `andkil` como entrega de un trabajo practico de un curso de LLM, y se ha entrenado con la libreria TRL (version 0.15.2) en su modo `RewardTrainer`. El resultado es un cabezal de clasificacion de texto que asigna una puntuacion escalar a una conversacion, util para ranking de respuestas y para RLHF.

El modelo es deliberadamente pequeno: 134.515.584 parametros en formato safetensors, lo que lo situa en la gama de 135M. Su interes no es la calidad de generacion, sino servir como ejemplo reproducible de como se construye un reward model a partir de un modelo base pequeno con TRL. Es relevante para quienes quieren entender el pipeline de RLHF (pares preferidos, funcion de perdida de ranking, integracion con PPO/DPO) sin necesidad de infraestructura de GPU de gran escala.

No hay informacion publicada sobre licencia, idiomas soportados ni resultados de benchmarks. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el pipeline declarado es `text-classification`, coherente con su funcion de reward model.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de SmolLM-135M-Instruct) con cabezal de clasificacion escalar para reward |
| Parametros totales | 134.515.584 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de SmolLM-135M-Instruct; no declarada en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no declarado) |
| Licencia | no disponible (la model card indica "licence: license" sin especificar) |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Modelo base | HuggingFaceTB/SmolLM-135M-Instruct |
| Dataset de entrenamiento | HumanLLMs/Human-Like-DPO-Dataset |
| Libreria de entrenamiento | TRL 0.15.2 (RewardTrainer) |
| Tamano del repositorio | 0.5 GB |

## Arquitectura y entrenamiento

El modelo parte de `SmolLM-135M-Instruct`, un transformer decoder-only de 135M parametros desarrollado por HuggingFaceTB. Sobre esa base se anade un cabezal de recompensa que proyecta el estado oculto final a un escalar, siguiendo el esquema estandar de `RewardTrainer` de TRL. La perdida de entrenamiento es la de ranking por pares (pairwise ranking loss), que empuja la puntuacion de la respuesta preferida por encima de la rechazada en cada par del dataset.

El dataset `HumanLLMs/Human-Like-DPO-Dataset` contiene pares de respuestas etiquetadas como preferidas y no preferidas, orientadas a alinear el estilo de respuesta con preferencias humanas. No se especifican en la model card el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo etapas adicionales de RLHF o DPO. Las versiones de framework declaradas son TRL 0.15.2, Transformers 4.49.0, PyTorch 2.11.0+cu128, Datasets 4.8.5 y Tokenizers 0.21.4.

No se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.). El valor del modelo es principalmente pedagogico: demuestra el flujo completo de entrenamiento de un reward model con TRL sobre un modelo base pequeno.

## Capacidades

- Puntuacion de recompensa: asigna un valor escalar a una conversacion o respuesta, util para ranking y seleccion.
- Clasificacion de texto: pipeline `text-classification` declarado en HuggingFace.
- Ranking de pares: entrenado con perdida de ranking por pares, por lo que compara respuestas preferidas frente a rechazadas.
- Integracion con RLHF: pensado para usarse como reward model en pipelines de PPO o DPO con TRL.
- Generacion de texto: al derivar de un modelo instruct, conserva la capacidad generativa del base, aunque no es su funcion principal.
- Tool calling / function calling: no documentado.
- Soporte de agentes y multi-step reasoning: no documentado.
- Capacidades multilingues: no documentadas.
- Thinking mode, vision o audio: no disponibles.

## Casos de uso

- Evaluacion de respuestas en experimentos de RLHF: el modelo puntua pares de respuestas generadas por un policy model y permite calcular la recompensa media por batch durante el entrenamiento con PPO o DPO. Su tamano de 135M lo hace viable en una sola GPU consumer.
- Ranking de candidatos en generacion: dado un prompt y varias respuestas candidatas, se puntua cada una y se selecciona la mejor, un patron habitual en best-of-N sampling.
- Filtrado de datos sinteticos: se puede usar para descartar respuestas de baja calidad en pipelines de generacion de datasets, asignando una puntuacion y aplicando un umbral.
- Docencia y reproduccion de pipelines de RLHF: sirve como ejemplo minimo y ejecutable de como se entrena un reward model con TRL, sin necesidad de infraestructura grande.
- Baseline para comparativas: al ser un modelo pequeno y abierto en formato, es util como referencia inferior en estudios sobre calidad de reward models.
- Prototipado rapido de sistemas de preferencia: permite iterar sobre heuristicas de puntuacion en entornos con recursos limitados antes de escalar a modelos mayores.
- Integracion en pipelines de evaluacion automatica: se puede conectar a un harness de evaluacion que compare respuestas de distintos modelos sobre el mismo prompt.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 540 MB solo para pesos (134.5M parametros x 4 bytes), mas overhead de activaciones y contexto.
- VRAM estimada en fp16/bf16: aproximadamente 270 MB para pesos.
- VRAM estimada en int8: aproximadamente 135 MB para pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, A100 y H100.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: transformers (pipeline `text-classification`), TRL para integracion en entrenamiento, vLLM y TGI no estan confirmados para este modelo concreto; llama.cpp y Ollama requeririan conversion a GGUF, no documentada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| andkil/llm-course-hw2-reward-model | 134.5M | no disponible | Reward model (text-classification) | no disponible | HuggingFace, 0 descargas |
| HuggingFaceTB/SmolLM-135M-Instruct | 135M | no disponible en esta ficha | Generacion instruct | Apache 2.0 (segun el modelo base; verificar) | HuggingFace, ampliamente usado |
| Reward models de mayor tamano (p. ej. variantes de 1B-7B) | no disponible | no disponible | Reward model | variable | HuggingFace |

La comparativa con reward models de mayor tamano no se puede completar con datos concretos porque no se dispone de informacion sobre ellos en la documentacion consultada.

## Limitaciones y advertencias

- Modelo de 135M parametros: la calidad del reward model esta acotada por la capacidad del modelo base; es probable que capture preferencias superficiales mejor que matices finos.
- Sin benchmarks publicados: no hay evidencia cuantitativa de su calidad como reward model.
- Licencia no especificada: la model card indica "licence: license" sin detallar terminos, por lo que el uso comercial no esta garantizado y requiere verificacion con el autor.
- Idiomas no declarados: no se puede asumir soporte multilingue; el dataset de entrenamiento esta en ingles presumiblemente, aunque no se confirma.
- Riesgo de alucinacion: al derivar de un modelo instruct, conserva la tendencia generativa del base; como reward model, el riesgo se traslada a puntuaciones poco calibradas.
- Sesgos: el dataset `HumanLLMs/Human-Like-DPO-Dataset` puede contener sesgos de anotacion que el modelo hereda; no se documenta ningun analisis de sesgo.
- Sin garantias de produccion: 0 descargas y 0 likes, sin validacion externa; no recomendado como componente critico sin evaluacion propia.
- Fecha de creacion futura (2026-11-02) en los metadatos: conviene verificar la integridad y procedencia del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/andkil/llm-course-hw2-reward-model
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM-135M-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/HumanLLMs/Human-Like-DPO-Dataset
- Repositorio TRL: https://github.com/huggingface/trl
- Documentacion de RewardTrainer de TRL: no disponible en la informacion proporcionada
- Paper o blog del autor: no disponible
