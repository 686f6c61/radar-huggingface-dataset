# davidheineman/rlve-opd-student-R1Distill-n16-rl-20261025

## Resumen

`davidheineman/rlve-opd-student-R1Distill-n16-rl-20261025` es un ajuste fino de investigación publicado por David Heineman (Stanford) sobre `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B`. Se trata de los pesos finales del experimento de escalado de datos RLVE, en el que se entrenó a un conjunto de actores desde cero (sin herencia de pesos entre ellos) mediante RL conjunto con GRPO sobre 16 entornos de entrenamiento con dificultad equilibrada.

El modelo no es un asistente de propósito general ni un lanzamiento de producto: es un artefacto de experimentación (0 descargas y 0 likes en el momento de redactar esta ficha) pensado para estudiar cómo escala el aprendizaje por refuerzo con el número de entornos y de rollouts. El nombre del repositorio hace referencia a "OPD" (on-policy distillation), pero la model card describe explícitamente el método como RL conjunto con GRPO, sin destilación de un profesor en el bucle de entrenamiento.

Con 1.777.088.000 parámetros (~1,78 B) y un repositorio de 3,6 GB, ocupa el segmento de modelos pequeños que caben en una única GPU de consumo. Su interés actual es metodológico: documenta de forma trazable el presupuesto de entrenamiento (64.000 rollouts, actualización de checkpoint 499) y enlaza la ejecución de Weights & Biases, lo que lo convierte en material útil para reproducir experimentos de RL, no para desplegarlo como modelo de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de la familia Qwen2 (etiqueta `qwen2` en el repositorio) |
| Parametros totales | 1.777.088.000 (~1,78 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors (sin GGUF, GPTQ ni AWQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors, junto con tokenizer y ficheros de configuracion |
| Modelo base | deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B |
| Tamano del repositorio | 3,6 GB |
| Pipeline | text-generation |
| Libreria | transformers |
| Fecha de creacion | 2026-10-25 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer denso decoder-only de la familia Qwen2 con ~1,78 B de parametros, inicializado a partir de `DeepSeek-R1-Distill-Qwen-1.5B`. No se introducen cambios estructurales documentados en la model card; el repositorio contiene únicamente pesos, tokenizer y configuración, sin estado de optimizador ni de dataloader.

El entrenamiento se describe como RL conjunto con GRPO sobre 16 entornos, con dificultad fija y equilibrada (etiquetas 0/1). La generación usa 1024 tokens iniciales más una continuación configurada de 128 tokens para forzar la respuesta. El presupuesto total fue de 64.000 rollouts, correspondientes a la actualización de checkpoint 499 (indexada desde cero). La validación se ejecutó cada 50 actualizaciones con 32 prompts y 8 respuestas por prompt, y adicionalmente sobre un conjunto compartido de 32 prompts de entornos no vistos; las muestras de validación no computan en el presupuesto de entrenamiento. Todos los detalles de configuración y la lista de entornos están en `training_run.json` y `training_config.yaml` dentro del repositorio, y la curva de entrenamiento en el run de W&B enlazado.

## Capacidades

- Generación de texto condicionada a prompt, en formato conversacional (etiqueta `conversational`).
- Razonamiento estilo cadena de pensamiento heredado del proceso de destilación de DeepSeek-R1 sobre el que se construye el modelo base.
- Resolución de tareas verificables en los 16 entornos de entrenamiento del experimento RLVE, con respuestas de hasta 128 tokens tras la fase de generación inicial.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado; el entrenamiento es de un turno por episodio.
- Capacidades multilingües: no disponibles como dato; la model card no declara idiomas.
- Capacidades especiales (visión, audio, modo thinking explícito): no documentadas.

## Casos de uso

- Reproducción del experimento RLVE: el repositorio incluye `training_run.json` y `training_config.yaml`, de modo que un investigador puede reentrenar el mismo estudiante con idéntico presupuesto de 64.000 rollouts y comparar curvas contra el run de W&B publicado.
- Baseline de estudiante en experimentos de on-policy distillation: al partir del mismo modelo base y del mismo protocolo de generación (1024 + 128 tokens), sirve como referencia para medir la ganancia de añadir un profesor en el bucle.
- Estudio de escalado de datos en RL: con 16 entornos fijos y dificultad balanceada 0/1, permite aislar el efecto del número de entornos frente al número de rollouts en modelos de ~1,8 B.
- Generación de datos de razonamiento en dominios controlados: útil para producir rollouts etiquetables automáticamente dentro de los entornos de entrenamiento, no para conocimiento abierto.
- Ablaciones de GRPO en modelos pequeños: al ser un checkpoint final con actualización conocida (499) y validación cada 50 pasos, facilita comparar hiperparámetros de RL sin reentrenar desde cero.
- Prototipado en una sola GPU de consumo: con ~1,8 B de parámetros se puede servir en una RTX 3060 de 12 GB en bf16 y en GPUs de 8 GB con cuantización de 4 bits, lo que abarata la iteración sobre el pipeline de evaluación.
- Docencia y formación en RL para LLMs: el par estudiante/profesor del mismo autor y la trazabilidad del run lo hacen adecuado como ejemplo práctico de un ciclo completo de entrenamiento con recompensas verificables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de los entornos de entrenamiento; solo describe el protocolo de validación (32 prompts, 8 respuestas por prompt, cada 50 actualizaciones, más un conjunto de 32 prompts de entornos no vistos) y enlaza el run de Weights & Biases como única fuente de métricas.

## Requisitos de hardware

- VRAM estimada para inferencia: ~7,1 GB en fp32, ~3,6 GB en bf16/fp16 (coincide con el tamaño del repositorio), ~1,8 GB en int8 y ~1,0-1,2 GB en 4 bits, sin contar caché KV ni activaciones.
- GPU recomendadas: cualquier GPU con al menos 8 GB para bf16 con contexto moderado (RTX 3060 Ti, RTX 4060 Ti, RTX 3070); A100/H100 no son necesarias y solo aportan throughput.
- Cabe en GPU de consumo: sí. En bf16 entra en RTX 3060 12 GB, RTX 4070/4080 y RTX 4090; en 4 bits entra en GPUs de 6-8 GB.
- Opciones de despliegue: `transformers` (soporte nativo del repositorio), vLLM y TGI (la etiqueta `text-generation-inference` está presente). Para llama.cpp u Ollama sería necesario convertir previamente a GGUF, ya que no se publican pesos cuantizados.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`rlve-opd-student-R1Distill-n16-rl`) | ~1,78 B | no disponible | RL conjunto (GRPO) sobre 16 entornos, 64.000 rollouts | no disponible | 0 descargas, 0 likes; pesos y config en safetensors |
| `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B` (base) | ~1,78 B | no disponible en esta ficha | Destilacion supervisada de DeepSeek-R1 sobre Qwen2 | no disponible en esta ficha (consultar la model card original) | Modelo publico ampliamente distribuido |
| `davidheineman/rlve-opd-teacher-R1Distill-108-NANDResultCounting-20261025` | no disponible | no disponible | Profesor del mismo programa RLVE, entrenado sobre 108 entornos | no disponible | Publicado por el mismo autor; descargas no consultadas |
| Qwen2.5-1.5B-Instruct (alternativa de tamano comparable) | ~1,54 B | 32.768 tokens (ampliable por configuracion) | Preentrenamiento + SFT + preferencias | Apache 2.0 | Muy extendido, con variantes GGUF y quantizadas |

La comparación relevante es contra el modelo base: este checkpoint añade una fase de RL con GRPO sobre 16 entornos, pero no publica métricas que permitan cuantificar la mejora. Frente a Qwen2.5-1.5B-Instruct, la diferencia práctica es la licencia (aquí no declarada) y el propósito (investigación vs. asistente generalista).

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial. Cualquier despliegue en producción requiere aclarar primero los términos, que además heredan los del modelo base.
- Ausencia total de benchmarks: no hay evidencia publicada de calidad en tareas estándar; el modelo puede degradarse respecto al base fuera de los 16 entornos de entrenamiento.
- Sobreajuste al formato del experimento: el entrenamiento usa 128 tokens de continuación forzada, lo que puede sesgar la longitud y el estilo de las respuestas y limitar la generación de salidas largas.
- Dominio estrecho: los entornos son tareas verificables con dificultad balanceada; el modelo no está optimizado para diálogo abierto, conocimiento factual ni código en producción.
- Riesgo de alucinación: al ser un derivado de un modelo destilado de razonamiento de 1,5 B, la generación de hechos y citas no verificables es esperable, especialmente fuera de los entornos entrenados.
- Idiomas no declarados: no hay garantía de calidad multilingüe; conviene evaluar empíricamente antes de usarlo en castellano.
- Contexto no documentado: no se especifica la ventana máxima en esta ficha; hay que leer `config.json` en el repositorio antes de dimensionar la caché KV.
- Artefacto de investigación: 0 descargas y 0 likes, sin mantenimiento ni soporte; no hay estado de optimizador ni de dataloader, por lo que no se puede reanudar el entrenamiento, solo reiniciarlo.
- Posible confusión de nomenclatura: el nombre indica OPD (on-policy distillation) pero la model card describe RL conjunto con GRPO; conviene no asumir que incorpora un profesor en el bucle.
- Sesgos heredados: al inicializarse desde DeepSeek-R1-Distill-Qwen-1.5B, arrastra los sesgos del corpus de preentrenamiento de Qwen2 y del proceso de destilación de R1, no evaluados en esta publicación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/davidheineman/rlve-opd-student-R1Distill-n16-rl-20261025
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Run de entrenamiento en Weights & Biases: https://wandb.ai/david-heineman/rl-data-scaling-students-v1/runs/5e9cc392
- Modelo profesor del mismo programa: https://huggingface.co/davidheineman/rlve-opd-teacher-R1Distill-108-NANDResultCounting-20261025
- Coleccion de runs RLVE finalizados: https://huggingface.co/collections/davidheineman/rlve-finished-scratch-runs
- Sitio personal del autor: https://davidheineman.com/index.html
- Perfil del autor en Stanford: https://profiles.stanford.edu/davidheineman
- Documentacion de on-policy distillation en verl: https://verl.readthedocs.io/en/latest/algo/opd.html
