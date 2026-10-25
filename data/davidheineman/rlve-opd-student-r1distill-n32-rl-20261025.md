# davidheineman/rlve-opd-student-R1Distill-n32-rl-20261025

## Resumen

`davidheineman/rlve-opd-student-R1Distill-n32-rl-20261025` es un modelo de lenguaje de tipo student obtenido mediante aprendizaje por refuerzo sobre `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B`. Lo publica David Heineman (estudiante de doctorado en Stanford, con experiencia previa en Meta AI Research y AI2) como parte de un experimento de escalado de datos denominado RLVE. No es un modelo pensado para uso comercial general, sino un artefacto de investigación que documenta el resultado final de una ejecución concreta de RL conjunto con GRPO sobre 32 entornos de entrenamiento.

El modelo conserva la arquitectura del modelo base: un transformer decoder-only de la familia Qwen2 con 1.777.088.000 parámetros totales (aproximadamente 1,78 B), pesos en safetensors y un tamaño de repositorio de 3,6 GB. Sobre esa base se aplicó un entrenamiento de refuerzo con recompensas verificables en 32 entornos de dificultad equilibrada (0/1), con un presupuesto de generación de 1024 tokens iniciales más una continuación forzada de respuesta de 128 tokens, y un tope de 64.000 rollouts que corresponde a la actualización de checkpoint 499 (indexada desde cero).

Su relevancia es metodológica más que de producto: permite estudiar cómo escala el rendimiento de RL en función del número de entornos y sirve como estudiante de referencia frente al modelo teacher del mismo autor (`rlve-opd-teacher-R1Distill-079-MYJ-20261025`). El repositorio no incluye estado de optimizador ni de dataloader, solo pesos, tokenizer y configuración, por lo que no es reanudable tal cual. No hay datos publicados de benchmarks, licencia declarada ni idiomas soportados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Qwen2 (etiqueta `qwen2` en el repositorio) |
| Parametros totales | 1.777.088.000 (~1,78 B), confirmado en los safetensors |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo distribuye safetensors; no hay GGUF, GPTQ ni AWQ oficiales) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (no declarada en la model card ni en los metadatos) |
| Formato de pesos | safetensors, compatible con `transformers`; incluye tokenizer y ficheros de configuracion |
| Modelo base | deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B |
| Metodo de entrenamiento | RL conjunto con GRPO sobre 32 entornos |
| Tamano del repositorio | 3,6 GB |
| Libreria / pipeline | transformers · text-generation |
| Compatibilidad de despliegue | etiquetas `text-generation-inference` y `endpoints_compatible` |
| Ficheros de configuracion incluidos | `training_run.json`, `training_config.yaml` |
| Estado de optimizador y dataloader | ausente (no reanudable) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only de la familia Qwen2 con aproximadamente 1,78 B de parametros, sin mezcla de expertos ni mecanismos alternativos de atencion documentados en la informacion disponible. La etiqueta `qwen2` del repositorio y la coincidencia exacta del recuento de parametros con `DeepSeek-R1-Distill-Qwen-1.5B` confirman que no hay cambios estructurales: el trabajo se limita a un ajuste por RL sobre los pesos destilados de DeepSeek-R1, que ya incorporan trazas de razonamiento de tipo cadena de pensamiento.

El entrenamiento es un RL conjunto con GRPO (Group Relative Policy Optimization). Todos los actores se inicializaron de nuevo desde `DeepSeek-R1-Distill-Qwen-1.5B` y se entrenaron sobre 32 entornos con dificultad fija y equilibrada (0/1). La generacion usa 1024 tokens iniciales mas una continuacion forzada de respuesta de 128 tokens, un mecanismo de *answer forcing* que empuja al modelo a cerrar la respuesta dentro de un presupuesto acotado. El tope de entrenamiento fue de 64.000 rollouts, alcanzando la actualizacion de checkpoint 499 (indexada desde cero). La validacion se ejecuta cada 50 actualizaciones con 32 prompts y 8 respuestas por prompt, y adicionalmente con un conjunto compartido de 32 prompts sobre entornos no vistos; las muestras de validacion no computan en el presupuesto de entrenamiento. El run esta registrado en W&B bajo el grupo `data-scaling-v1-20261022-180018`.

## Capacidades

- Generacion de texto conversacional multi-turno (etiqueta `conversational` en el repositorio).
- Razonamiento con cadena de pensamiento heredado de la destilacion de DeepSeek-R1, entrenado por RL en entornos con recompensa verificable.
- Resolucion de tareas de dificultad controlada (niveles 0/1) con cierre de respuesta forzado dentro de 128 tokens tras un presupuesto inicial de 1024 tokens.
- Generacion de texto autoregresiva estandar mediante `transformers` y text-generation-inference.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Capacidades de agente y razonamiento multi-paso: no documentadas explicitamente; el modelo se entrena en episodios de entorno unico.
- Capacidades multilingues: no disponibles (idiomas no declarados).
- Vision, audio u otras modalidades: no soportadas; el pipeline es exclusivamente `text-generation`.

## Casos de uso

- Investigacion en escalado de datos para RL: sirve como punto de medida del efecto del numero de entornos (n=32) sobre el rendimiento de un student de 1,5 B, comparable directamente con los demas checkpoints de la misma familia de runs.
- Referencia base para comparaciones GRPO: al haber partido de los mismos pesos que otros estudiantes del experimento, permite aislar el efecto del entrenamiento por refuerzo sin confundirlo con cambios de inicializacion.
- Estudiante en pipelines de destilacion: encaja como contraparte del teacher `rlve-opd-teacher-R1Distill-079-MYJ-20261025` para estudiar transferencia teacher-student en tareas verificables.
- Razonamiento con presupuesto de tokens acotado: el esquema 1024 + 128 tokens forzados es util para escenarios donde la latencia y el coste por respuesta estan limitados, como clasificacion razonada o resolucion de problemas cortos en produccion interna.
- Despliegue en hardware de gama media para prototipos: con ~1,78 B de parametros cabe cuantizado en GPUs de consumo, lo que permite validar rapidamente hipotesis de investigacion sin reservar nodos con A100/H100.
- Generacion de datos sinteticos de razonamiento: puede producir trazas de solucion para aumentar datasets de entrenamiento de modelos mayores, con la advertencia de que no hay evaluacion publicada de su calidad.
- Reproduccion y auditoria de experimentos: los ficheros `training_run.json` y `training_config.yaml` documentan entornos y configuracion exacta, lo que facilita replicar el run o auditar la metodologia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo describe el protocolo de validacion (32 prompts con 8 respuestas cada uno cada 50 actualizaciones, mas un conjunto de 32 prompts sobre entornos no vistos) y enlaza al run de W&B, pero no se incluyen cifras de MMLU, GSM8K, HumanEval ni de las metricas de los entornos de RL en el material proporcionado.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 3,6 GB solo para pesos, mas cache KV; en la practica entre 5 y 8 GB segun longitud de contexto y tamano de lote.
- VRAM estimada en INT8: aproximadamente 1,9 GB de pesos.
- VRAM estimada en INT4 (tras conversion a GPTQ/AWQ/GGUF Q4): aproximadamente 1,0-1,2 GB de pesos.
- GPU de consumo: cabe con holgura en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y RTX 4090; en configuraciones INT4 puede ejecutarse en GPUs de 8 GB.
- GPU de datacenter: A100, H100 o L40S no son necesarias para inferencia single-stream, pero son utiles para servir con lotes grandes mediante vLLM.
- Opciones de despliegue: `transformers` (libreria declarada), text-generation-inference (etiqueta `text-generation-inference`), vLLM, y llama.cpp u Ollama previa conversion a GGUF, que no se distribuye en el repositorio.
- Latencia y throughput: no disponibles; no hay mediciones publicadas en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rlve-opd-student-R1Distill-n32-rl (este modelo) | 1,78 B | no disponible | RL/GRPO sobre 32 entornos, 64.000 rollouts | no disponible | Publico en HuggingFace, 0 descargas |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B | ~1,78 B | no disponible en esta ficha | Destilacion de trazas de DeepSeek-R1 sobre Qwen2 | no verificada en la informacion disponible | Publico y ampliamente utilizado |
| davidheineman/rlve-opd-teacher-R1Distill-079-MYJ-20261025 | no disponible | no disponible | Teacher del mismo experimento RLVE | no disponible | Publico en HuggingFace |
| Qwen2.5-1.5B-Instruct (referencia de la misma escala) | ~1,5 B (cifra publica aproximada) | no disponible en esta ficha | Preentrenamiento + post-entrenamiento instruction tuning | no verificada en la informacion disponible | Publico |

La comparacion relevante es contra el modelo base: este checkpoint anyade un ajuste por RL sobre los mismos pesos, de modo que cualquier diferencia de comportamiento es atribuible al entrenamiento GRPO y no a la arquitectura. Frente a alternativas de la misma escala como Qwen2.5-1.5B-Instruct, la diferencia principal es el objetivo: aqui no hay optimizacion para instrucciones generales, sino para tareas verificables dentro de entornos acotados.

## Limitaciones y advertencias

- Licencia no declarada: no hay autorizacion explicita de uso comercial en la model card ni en los metadatos; hay que contactar con el autor o verificar la licencia del modelo base antes de cualquier despliegue productivo.
- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de calidad frente al modelo base ni frente a alternativas, por lo que no puede justificarse su uso en produccion solo con la informacion disponible.
- Presupuesto de razonamiento corto: el esquema de 1024 tokens iniciales mas 128 de respuesta forzada puede truncar cadenas de pensamiento largas y degradar tareas que requieran razonamiento extenso.
- Riesgo de alucinacion: como cualquier modelo de 1,5 B entrenado sobre entornos sinteticos, puede generar justificaciones plausibles pero incorrectas, especialmente fuera de la distribucion de los 32 entornos de entrenamiento.
- Idiomas no declarados: se desconoce si el entrenamiento RL cubre castellano u otros idiomas distintos del ingles; no hay garantia de calidad multilingue.
- Especializacion estrecha: el RL se limita a 32 entornos con dificultad 0/1; el modelo puede degradarse en tareas abiertas o de dificultad superior.
- Sin soporte documentado de tool calling ni de razonamiento multi-paso con herramientas, lo que descarta casos de uso de agentes sin trabajo adicional.
- Sesgos no evaluados: no se ha publicado ninguna evaluacion de sesgo, toxicidad o seguridad.
- No reanudable: al faltar el estado del optimizador y del dataloader, no es posible continuar el entrenamiento exactamente desde este checkpoint.
- Madurez nula como artefacto comunitario: 0 descargas y 0 likes en el momento de la consulta, sin validacion externa conocida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/davidheineman/rlve-opd-student-R1Distill-n32-rl-20261025
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Run de entrenamiento en W&B: https://wandb.ai/david-heineman/rl-data-scaling-students-v1/runs/ec784910
- Modelo teacher del mismo experimento: https://huggingface.co/davidheineman/rlve-opd-teacher-R1Distill-079-MYJ-20261025
- Checkpoint archivado de la misma familia: https://huggingface.co/davidheineman/rlve-archive-opd-student-r1-bs4x16-filtered-2026093-00-all32-e1ed3d60f6df
- Sitio personal del autor: https://davidheineman.com/
- Perfil de GitHub del autor: https://github.com/davidheineman
