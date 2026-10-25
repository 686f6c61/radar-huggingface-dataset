# davidheineman/rlve-opd-student-R1Distill-n64-mopd-20261025

## Resumen

`rlve-opd-student-R1Distill-n64-mopd-20261025` es un ajuste fino de investigación publicado por David Heineman (usuario `davidheineman`) a partir de `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B`. Se trata de los pesos finales del experimento original de *data scaling* del proyecto RLVE, en el que se estudia cómo escala el aprendizaje cuando se varía el número de entornos de entrenamiento (en esta variante, 64 entornos con dificultad equilibrada 0/1). El método de entrenamiento se etiqueta como **MOPD**, cuyas siglas no se desarrollan en la model card.

El modelo tiene 1.777.088.000 parámetros según los safetensors publicados (3,6 GB de repositorio), es denso y emplea la arquitectura Qwen2 (etiqueta `qwen2` de HuggingFace), heredada del modelo base destilado de DeepSeek-R1. El entrenamiento se realizó sobre 16.000 rollouts (checkpoint final en la actualización 1999, indexada desde cero), con un protocolo de generación de 1024 tokens iniciales más una continuación de 128 tokens forzada para forzar la respuesta final. La validación se ejecutó cada 50 actualizaciones con 32 prompts y 8 respuestas por prompt.

Su relevancia es acotada y de carácter metodológico: no es un modelo de propósito general listo para producción, sino un artefacto reproducible de un estudio sobre escalado de datos y destilación on-policy en entornos verificables. El repositorio incluye pesos, tokenizador y configuración, pero no estado de optimizador ni de dataloader; los detalles del experimento están en `training_run.json` y `training_config.yaml`. No se declara licencia ni idiomas soportados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Qwen2 (etiqueta `qwen2`); ajuste fino del destilado DeepSeek-R1-Distill-Qwen-1.5B |
| Parametros totales | 1.777.088.000 (1,78 B), dato real de safetensors |
| Parametros activos | no aplica: modelo denso, no MoE |
| Longitud de contexto | no disponible en la información proporcionada (depende del modelo base) |
| Tipos de cuantizacion | no disponible; el repositorio solo publica safetensors sin cuantizar (3,6 GB, coherente con 16 bits por parámetro) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card no la especifica) |
| Formato de pesos | safetensors (compatible con `transformers`); no se publican GGUF ni otras cuantizaciones |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only de la familia Qwen2 con 1,78 B de parámetros, inicializado desde `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B`, que a su vez es un destilado de razonamiento de DeepSeek-R1 sobre Qwen. Todos los actores del experimento se inicializaron de nuevo desde ese mismo checkpoint, de modo que las diferencias entre las variantes publicadas provienen únicamente del régimen de entrenamiento y del número de entornos, no de inicializaciones distintas.

El entrenamiento se llevó a cabo sobre 64 entornos con dificultad fija y equilibrada (etiquetas 0/1), con un tope de 16.000 rollouts y parada en la actualización 1999 (indexada desde cero). El protocolo de generación emplea 1024 tokens iniciales más una continuación configurada de 128 tokens para forzar la respuesta, un detalle relevante porque implica que el modelo fue entrenado para emitir la solución dentro de esa ventana de continuación y no en formato libre. La validación se hizo cada 50 actualizaciones con 32 prompts y 8 respuestas por prompt, y adicionalmente con un conjunto compartido de 32 prompts de entornos no vistos; las muestras de validación no computan en el presupuesto de entrenamiento. La model card no documenta el volumen de tokens, la composición del dataset, ni si hubo RLHF o DPO; el método se identifica solo como MOPD y el proyecto como RLVE. Tampoco se detallan innovaciones de decodificación (atención lineal, decodificación especulativa, etc.).

## Capacidades

- Generación de texto conversacional (etiqueta `conversational`) y formato de chat heredado del modelo base.
- Razonamiento con cadena de pensamiento (chain-of-thought) como consecuencia de la destilación de DeepSeek-R1.
- Resolución de tareas de entornos verificables del experimento RLVE: en repositorios hermanos del mismo autor aparecen familias como DiscreteLogarithm, Circuit y GradeRankingCounting.
- Generación de respuestas con formato controlado: 1024 tokens de generación libre más 128 tokens de continuación forzada para la respuesta final.
- Compatibilidad con el ecosistema `transformers`, `text-generation-inference` y endpoints compatibles (etiquetas del repositorio).
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso orquestado: no documentado; el razonamiento multi-paso existe solo a nivel de cadena interna.
- Capacidades multilingües: no disponibles como dato declarado.
- Capacidades especiales (visión, audio, thinking mode explícito): no disponibles.

## Casos de uso

- Reproducción de experimentos de escalado de datos en RL: el checkpoint sirve como estudiante de referencia con 64 entornos y 16.000 rollouts, comparable contra las demás variantes del *sweep* publicadas por el mismo autor.
- Investigación en destilación on-policy: al estar inicializado desde el mismo punto que los profesores del proyecto, permite aislar el efecto del número de entornos y de la configuración de rollouts en el rendimiento del estudiante.
- Generación de datos sintéticos de razonamiento para ajuste posterior: el modelo puede producir cadenas de solución sobre problemas de dificultad controlada, útiles como material de entrenamiento o de comparación con el profesor.
- Línea base en experimentos de recompensas verificables: su tamaño (1,78 B) permite ejecutar ciclos completos de evaluación en una sola GPU consumer, algo inviable con profesores de mayor tamaño.
- Evaluación de protocolos de respuesta forzada: sirve para estudiar cómo afecta la ventana de 128 tokens de continuación a la precisión final en tareas de respuesta corta.
- Docencia y divulgación técnica: el modelo y su configuración (`training_config.yaml`, `training_run.json`, traza de W&B) permiten ilustrar un pipeline completo de RL con entornos verificables sin infraestructura grande.
- Prototipado local de asistentes de razonamiento: con cuantización de 4 u 8 bits cabe en GPUs de 8-12 GB, útil para demos internas antes de migrar a un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card describe el protocolo de validación (32 prompts, 8 respuestas por prompt cada 50 actualizaciones, más un conjunto compartido de 32 prompts de entornos no vistos) pero no reporta cifras de MMLU, HumanEval, GSM8K ni de las tareas del propio experimento, y la información de búsqueda no incluye resultados numéricos de este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir de 1,78 B de parámetros): ~3,6 GB solo de pesos en bf16/fp16; ~7,1 GB en fp32; ~1,9 GB en 8 bits; ~1,1 GB en 4 bits. Añadir entre 0,5 y 2 GB de caché KV según longitud de contexto y lote.
- GPU recomendadas: A100 40/80 GB o H100 para servir con lotes grandes; L40S o A10G para despliegue en la nube de tamaño medio; RTX 4090/3090 (24 GB) para experimentación con margen amplio.
- Cabe en GPU consumer: sí, con holgura en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y superiores. En GPUs de 8 GB conviene cuantizar a 8 o 4 bits.
- Opciones de despliegue: `transformers` de forma nativa (pesos safetensors ya incluidos); servidor TGI, dado que el repositorio lleva la etiqueta `text-generation-inference`; vLLM es plausible al ser arquitectura Qwen2, aunque no está verificado en la información disponible. llama.cpp u Ollama requieren convertir los pesos a GGUF, conversión que el autor no publica.
- Latencia y throughput estimados: no disponibles; no hay mediciones publicadas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| rlve-opd-student-R1Distill-n64-mopd-20261025 | 1,78 B (denso) | no disponible | no disponible | safetensors, repo de 3,6 GB | Estudiante de un experimento de escalado de datos con 64 entornos; sin benchmarks publicados |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B | ~1,5 B (denso) | no disponible en la información proporcionada | no disponible en la información proporcionada | safetensors | Modelo base exacto del anterior; sirve como referencia cero del experimento |
| Qwen2.5-1.5B-Instruct | ~1,5 B (denso) | no disponible en la información proporcionada | no disponible en la información proporcionada | safetensors, amplia difusión | Alternativa generalista de tamaño comparable; no incluye ajuste sobre entornos RLVE |
| davidheineman/opd-teacher-R1Distill-DiscreteLogarithm-step149 | ~1,5 B (denso) | no disponible | no disponible | safetensors | Profesor específico de entorno, 150 pasos; mismo punto de partida, propósito distinto |

No hay datos de rendimiento publicados para este checkpoint ni cifras comparativas en la información disponible, por lo que la comparación se limita a arquitectura, tamaño y disponibilidad. Los datos de contexto y licencia de las alternativas deben verificarse en sus respectivas model cards.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no puede asumirse permiso de uso comercial; hay que contactar con el autor o consultar la licencia del modelo base.
- Artefacto de investigación: los pesos provienen de un único *sweep* de experimentos (grupo `data-scaling-v1-20261022-180018`) y no de un proceso de publicación orientado a producción.
- Sesgo de dominio: el ajuste se hizo sobre 64 entornos verificables de dificultad equilibrada 0/1, por lo que el modelo puede degradarse fuera de esas familias de tareas.
- Protocolo de generación acoplado: el entrenamiento asume 1024 tokens iniciales más 128 tokens de continuación forzada; usarlo con otro esquema de parada o longitudes distintas puede alterar la calidad de la respuesta final.
- Idiomas no declarados: se desconoce el soporte multilingüe efectivo y el grado de degradación fuera del inglés.
- Riesgo de alucinación: inherente a un modelo de 1,5-1,8 B con razonamiento destilado; no se documenta ningún proceso de alineación de seguridad específico para este checkpoint.
- Validación limitada: 32 prompts con 8 respuestas cada 50 actualizaciones es una señal de seguimiento, no una evaluación robusta; no hay benchmarks públicos que respalden el rendimiento.
- Sin estado de optimizador ni de dataloader: no es posible reanudar el entrenamiento tal cual desde el repositorio.
- Sin cuantizaciones oficiales: cualquier GGUF o AWQ debe generarse y validarse por cuenta propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/davidheineman/rlve-opd-student-R1Distill-n64-mopd-20261025
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Traza de entrenamiento en W&B: https://wandb.ai/david-heineman/rl-data-scaling-students-v1/runs/8bb61430
- Perfil del autor: https://huggingface.co/davidheineman
- Profesor de entorno DiscreteLogarithm (step149): https://huggingface.co/davidheineman/opd-teacher-R1Distill-DiscreteLogarithm-step149
- Profesor de entorno Circuit (step149): https://huggingface.co/davidheineman/opd-teacher-R1Distill-Circuit-step149
- Profesor GradeRankingCounting: https://huggingface.co/davidheineman/rlve-opd-teacher-R1Distill-044-GradeRankingCounting-20261025
- Estudiante archivado (RL, bs4x16 filtrado): https://huggingface.co/davidheineman/rlve-archive-rl-student-r1-bs4x16-filtered-20260930-00-all32-480546e0bba1
- Estudiante archivado (OPD, ood16): https://huggingface.co/davidheineman/rlve-archive-opd-student-ood16-20260927-232124-00-all32-b53ffbadd6a5
