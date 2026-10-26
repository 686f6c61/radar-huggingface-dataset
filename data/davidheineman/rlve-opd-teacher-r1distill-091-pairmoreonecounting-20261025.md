# davidheineman/rlve-opd-teacher-R1Distill-091-PairMoreOneCounting-20261025

## Resumen

`davidheineman/rlve-opd-teacher-R1Distill-091-PairMoreOneCounting-20261025` es un checkpoint de pesos finales procedente del experimento de escalado de datos RLVE (RL con entornos verificables), publicado por el investigador David Heineman. No es un modelo de propósito general: es un "teacher" especialista entrenado con GRPO sobre un único entorno de entrenamiento, con dificultad fija y equilibrada (0/1), cuyo nombre codifica la tarea de conteo del experimento (`PairMoreOneCounting`).

El modelo parte de `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B`, un distill de razonamiento de DeepSeek sobre la familia Qwen2, y conserva por tanto la arquitectura transformer decoder-only de dicha familia, con 1.777.088.000 parámetros reales según los safetensors del repositorio (3,6 GB de pesos en precisión original). Todos los actores del experimento se inicializaron desde cero a partir de ese mismo modelo base, de modo que este checkpoint representa la rama de profesor correspondiente a la configuración 091 tras agotar el presupuesto de entrenamiento.

Su relevancia es metodológica más que de producto: documenta de forma reproducible un pipeline de RL con presupuesto acotado (4.000 rollouts), validación periódica con criterio de parada por pass@1 y generación con continuación forzada de respuesta de 128 tokens. Resulta útil para quien investigue destilación on-policy, escalado de datos sintéticos o dinámica de entrenamiento GRPO con modelos pequeños, no para despliegues de chat en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Qwen2 (tag `qwen2`; modelo base DeepSeek-R1-Distill-Qwen-1.5B) |
| Parametros totales | 1.777.088.000 (dato real de los safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la información del repositorio; el modelo base declara 32.768 tokens nativos (no verificado en este checkpoint) |
| Tipos de cuantizacion | No especificados por el autor; el repositorio solo distribuye safetensors en precisión original. Al derivar de Qwen2 es convertible a GGUF, AWQ o GPTQ, pero no hay artefactos publicados |
| Idiomas soportados | No disponible (el campo de idiomas del repositorio está vacío) |
| Licencia | No disponible (no se declara licencia en la ficha; el modelo base tiene su propia licencia, que conviene consultar) |
| Formato de pesos | safetensors, más tokenizer y ficheros de configuración; sin estado de optimizador ni de dataloader |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del distill de DeepSeek-R1 sobre Qwen2 de 1,5B: un transformer decoder-only denso con atención causal estándar, sin mezcla de expertos ni mecanismos híbridos. El autor no documenta cambios estructurales sobre el modelo base; el checkpoint es un ajuste por RL de los pesos completos, no un adaptador. El repositorio incluye `training_run.json` (lista de entornos y ajustes de la ejecución original) y `training_config.yaml` (configuración exacta), pero no el estado de optimizador ni del dataloader, por lo que el entrenamiento no es reanudable desde estos ficheros.

El método declarado es GRPO especialista sobre un único entorno de entrenamiento, con dificultad fija y equilibrada 0/1. La generación emplea 1.024 tokens iniciales más una continuación forzada de respuesta de 128 tokens. El presupuesto se fija en 4.000 rollouts y el checkpoint final corresponde a la actualización 499 (indexada desde cero). La validación usa 32 prompts con 8 respuestas por prompt cada 50 actualizaciones, y los profesores se detienen al alcanzar 4.000 rollouts o un pass@1 de validación de identificador mayor o igual a 0,98; las muestras de validación no computan contra el presupuesto de entrenamiento. La etiqueta `opd-teacher` sugiere un uso como profesor en un pipeline de destilación on-policy, extremo que la model card no detalla.

## Capacidades

- Generación de texto autoregresiva con cadenas de razonamiento, heredada del distill R1-Qwen de 1,5B.
- Especialización estrecha en la tarea del entorno de entrenamiento (conteo con emparejamiento, según el identificador `PairMoreOneCounting`), con dificultad balanceada 0/1.
- Producción de rollouts completos con formato de 1.024 tokens de generación más 128 tokens de respuesta forzada, útil para generar trazas etiquetables.
- Capacidad de actuar como profesor en destilación: generar soluciones de referencia en su dominio para entrenar estudiantes.
- Soporte de tool calling / function calling: no documentado; no se debe asumir.
- Soporte de agentes y razonamiento multi-paso fuera de su dominio: no documentado y poco probable tras un RL de un solo entorno.
- Capacidades multilingües: no disponibles como dato declarado; el modelo base es mayoritariamente inglés y chino, pero no se verifica aquí.
- Capacidades especiales (visión, audio, thinking mode explícito): no disponibles; el modelo base es solo texto.

## Casos de uso

- Generación de datos de razonamiento sintético para destilación: usar el checkpoint como profesor que produce trazas de respuesta en la tarea de conteo, filtrando por pass@1 con un verificador, para construir un dataset de SFT de un estudiante más pequeño.
- Reproducción de experimentos de escalado de datos: cargar `training_run.json` y `training_config.yaml` junto a los pesos para auditar cómo varía la calidad del profesor según el número de entornos y el presupuesto de rollouts.
- Análisis de dinámica de GRPO: comparar este checkpoint (actualización 499, 4.000 rollouts) con otras ramas del mismo grupo `data-scaling-v1-n128-20261022-225839` para estudiar la curva de pass@1 frente al presupuesto.
- Evaluación de pipelines de verificación: servir como generador controlado de soluciones correctas e incorrectas en un entorno de dificultad conocida, lo que permite validar verificadores y métricas de pass@1 sin ruido de dominio.
- Ajuste fino posterior (SFT/DPO) sobre tareas de razonamiento corto: al ser un modelo de 1,5B en safetensors estándar, se puede reentrenar en una sola GPU consumer para explorar la transferencia desde un especialista a tareas generales.
- Docencia e investigación en RL aplicado: ejecutar el modelo en local para ilustrar el efecto de la continuación forzada de respuesta y del filtrado por validación en la calidad de las muestras.
- Prototipado de bajo coste en local: inferencia en GPUs de gama media para probar plantillas de prompt, longitudes de generación y decodificación antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta el criterio de parada del entrenamiento (pass@1 de validación de identificador mayor o igual a 0,98 sobre 32 prompts y 8 respuestas por prompt), sin cifras finales alcanzadas ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,6 GB de pesos en bf16/fp16, más caché KV y overhead del runtime; en torno a 5-6 GB para contextos moderados. En int8 bajaría a unos 1,8 GB de pesos y en int4 a cerca de 1 GB, aunque no hay cuantizaciones publicadas por el autor.
- GPU recomendadas: cabe holgadamente en RTX 4090, RTX 4080, RTX 3090, L4, A10G y A100/H100 (sobradas para este tamaño). Para bf16 con contexto largo, cualquier GPU con 8 GB o más es suficiente.
- Cabe en GPU consumer: sí, en tarjetas de 6-8 GB o superiores en fp16, y en 4 GB con cuantización de 4 bits previa conversión.
- Opciones de despliegue: `transformers` de forma nativa (librería declarada); vLLM y TGI son compatibles al tratarse de un modelo Qwen2 en safetensors (tag `text-generation-inference`, `endpoints_compatible`); llama.cpp u Ollama requerirían convertir previamente a GGUF, conversión no publicada.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Naturaleza | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (rlve-opd-teacher 091) | 1,777 M | No disponible | Especialista GRPO sobre un entorno de conteo | No disponible | Pesos safetensors en HF |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B | 1,5 B (aprox.) | 32.768 tokens nativos (según el modelo base) | Distill de razonamiento de propósito general | Licencia del modelo base (consultar) | Público en HF |
| Qwen2.5-1.5B-Instruct | 1,5 B (aprox.) | 32.768 tokens nativos | Instruct generalista | Licencia Qwen (consultar) | Público en HF |
| DeepSeek-R1-Distill-Qwen-7B | 7 B (aprox.) | 32.768 tokens nativos (según el modelo base) | Distill de razonamiento de mayor tamaño | Licencia del modelo base (consultar) | Público en HF |

Los datos de contexto y licencia de las alternativas provienen de sus respectivas fichas públicas y no se han verificado contra este repositorio; el rendimiento comparado no está disponible porque este checkpoint no publica métricas.

## Limitaciones y advertencias

- Especialización extrema: el entrenamiento se limita a un único entorno con dificultad fija 0/1, por lo que el rendimiento fuera de ese dominio puede degradarse respecto al modelo base.
- No es un modelo de chat: la model card no documenta formato conversacional ni plantilla de prompt, aunque el repositorio incluya la etiqueta `conversational`.
- Riesgo de alucinación: inherente a un modelo de 1,5B con RL sobre una tarea verificable; el ajuste no garantiza corrección fuera del entorno de entrenamiento.
- Sesgos: no documentados por el autor; se heredan los del modelo base y los del corpus de entrenamiento, no auditados aquí.
- Licencia no declarada: la ausencia de campo de licencia impide asumir permisos de uso comercial; hay que remitirse a la licencia de DeepSeek-R1-Distill-Qwen-1.5B y verificar su compatibilidad.
- Idiomas no declarados: no hay garantía de calidad multilingüe en este checkpoint.
- Reproducibilidad parcial: no se publican estados de optimizador ni de dataloader, así que el entrenamiento no se puede reanudar exactamente; solo se conservan las configuraciones.
- Sin benchmarks ni métricas finales: no es posible avalar su calidad con datos públicos; cualquier uso en producción exige evaluación propia.
- Nombre y fecha del repositorio (20261025) indican un artefacto de experimento, sin garantía de mantenimiento ni de soporte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/davidheineman/rlve-opd-teacher-R1Distill-091-PairMoreOneCounting-20261025
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Run de entrenamiento en W&B: https://wandb.ai/david-heineman/rl-data-scaling-teachers-v1/runs/ed9b3832
- Ficheros de configuración en el repositorio: `training_run.json` y `training_config.yaml` (incluidos en el repo de HuggingFace)
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada
