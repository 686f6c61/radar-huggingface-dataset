# davidheineman/opd-teacher-Q2.5I-LargestConvexPolygon-step149

## Resumen

`opd-teacher-Q2.5I-LargestConvexPolygon-step149` es un ajuste fino de Qwen2.5-1.5B-Instruct desarrollado por David Heineman (investigador predoctoral en el Allen Institute for AI) como parte de una colección de modelos "profesor" para experimentos de destilación on-policy (OPD, on-policy distillation). El modelo parte del checkpoint instructivo de Qwen2.5 de 1.500 millones de parámetros y se entrena con GRPO (Group Relative Policy Optimization) durante 150 actualizaciones sobre un único entorno de razonamiento llamado `LargestConvexPolygon`, a dificultad 0. El sufijo `step149` corresponde al índice final basado en cero, es decir, la actualización número 150.

Se trata de un artefacto de investigación, no de un modelo de propósito general: su función declarada es actuar como profesor dentro de un experimento de destilación que abarca 32 entornos (de un total de 400) del conjunto RLVE descrito en el preprint arXiv:2511.07317. La relevancia actual es metodológica: documenta cómo se puede especializar un modelo pequeño con RL sobre una tarea verificable y reutilizarlo después como fuente de supervisión a nivel de token para un modelo alumno, en la línea de trabajos como On-Policy Delta Distillation (opd2) de Naver AI.

Técnicamente hereda la arquitectura Qwen2 (transformer decoder-only) con 1.543.714.304 parámetros reales según los pesos en safetensors, licencia Apache 2.0 y entrenamiento únicamente en inglés. No se han publicado métricas de rendimiento ni detalles del dataset de entrenamiento más allá del entorno RLVE empleado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer decoder-only, denso), segun el tag `qwen2` y el modelo base |
| Parametros totales | 1.543.714.304 (recuento real de los safetensors) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No especificada en la model card; heredada del modelo base Qwen2.5-1.5B-Instruct (32.768 tokens nativos según la documentación de Qwen) |
| Tipos de cuantizacion | No disponible (el repositorio solo publica pesos en safetensors sin cuantizar) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 (se incluye la licencia original de Qwen en el fichero `LICENSE`) |
| Formato de pesos | safetensors (convertidos desde el checkpoint nativo del entrenamiento y validados contra los nombres y formas de tensor del modelo base) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen2.5-1.5B-Instruct: un transformer decoder-only denso con normalización RMSNorm, activación SwiGLU y atención con RoPE, en la variante de 1.500 millones de parámetros. No hay modificaciones estructurales introducidas por el autor; el modelo conserva los nombres y las formas de tensor del checkpoint original, algo que el autor indica explícitamente que se validó tras la conversión a safetensors.

El entrenamiento consiste en un ajuste con GRPO sobre el entorno `LargestConvexPolygon` a dificultad 0, durante 150 actualizaciones (el checkpoint publicado es el paso 149, índice final basado en cero). No se especifican en la model card el número de tokens consumidos, la composición del dataset, la presencia de fases de RLHF o DPO adicionales, ni hiperparámetros como el tamaño de grupo de GRPO o la tasa de aprendizaje. Tampoco se documentan innovaciones técnicas específicas en inferencia (decodificación especulativa, atención lineal, etc.). El contexto del experimento es RLVE (arXiv:2511.07317), un marco de entornos verificables para RL, y la colección de 32 profesores destilados a partir de él. La única traza de reproducibilidad publicada es la ejecución de Weights & Biases `01680811`, dentro del grupo de barrido `opd-teachers-20260927-191939`.

## Capacidades

- Generación de texto conversacional en inglés, heredada del ajuste instructivo de Qwen2.5-1.5B-Instruct.
- Razonamiento especializado en el entorno `LargestConvexPolygon` (tareas algorítmicas de geometría computacional sobre polígonos convexos), adquirido mediante RL con recompensas verificables.
- Capacidad de actuar como modelo profesor: generar distribuciones de probabilidad a nivel de token utilizables para destilación on-policy sobre un alumno.
- Soporte de tool calling / function calling: no documentado en la información disponible (el modelo base lo soporta, pero el ajuste RLVE puede haber alterado este comportamiento y no se ha verificado).
- Soporte de agentes y razonamiento multi-paso: no documentado ni evaluado.
- Capacidades multilingües: únicamente inglés declarado; el resto de idiomas no está soportado de forma declarada.
- Capacidades especiales (modo thinking, visión, audio): no disponible / no soportadas.

## Casos de uso

- Destilación on-policy de un modelo alumno: es el uso para el que se publicó el modelo. Se emplea como profesor que proporciona supervisión a nivel de token (logits o probabilidades) a un alumno más pequeño, dentro del experimento de destilación de 32 entornos del autor.
- Reproducción de experimentos de RL con GRPO: sirve como referencia publicada para replicar la curva de entrenamiento sobre `LargestConvexPolygon` y compararla con la ejecución de W&B `01680811`.
- Generación de datos sintéticos de geometría computacional: el modelo puede producir soluciones y razonamientos para problemas de polígonos convexos que después se filtran por verificador y se reutilizan como datos de entrenamiento supervisado.
- Punto de partida para ajustes en otros entornos RLVE: dado que forma parte de una colección de 32 profesores entrenados con el mismo pipeline, es un candidato natural para transferir el flujo de trabajo a nuevos entornos verificables.
- Estudio de degradación de capacidades tras RL especializado: útil como caso de análisis de cuánto pierde un modelo instructivo de 1.500 millones de parámetros cuando se sobreajusta a una única tarea con GRPO.
- Prototipado local en inglés con recursos limitados: con 1,5B de parámetros y ~3 GB de pesos, puede ejecutarse en portátiles con GPU de consumo para tareas sencillas de generación de texto, aunque con la advertencia de que el ajuste estrecho puede degradar la calidad general.
- Evaluación de pipelines de destilación a nivel de token: sirve como profesor de pruebas para validar infraestructura de OPD (formato de logits, alineación de vocabulario, temperatura, top-k) antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card únicamente referencia la ejecución de entrenamiento en W&B (`01680811`) y no incluye métricas de MMLU, HumanEval, GSM8K ni de la tarea `LargestConvexPolygon` (tasa de éxito, recompensa media o precisión por dificultad). Tampoco se publican comparaciones con el modelo base.

## Requisitos de hardware

- VRAM para pesos en BF16/FP16: aproximadamente 3,1 GB (coincide con el tamaño del repositorio, 3,1 GB). Con caché KV para contexto largo, se recomienda reservar 5-6 GB.
- VRAM en cuantización de 8 bits: del orden de 1,7-2 GB de pesos (estimación propia a partir del recuento real de parámetros; el repositorio no publica pesos cuantizados).
- VRAM en cuantización de 4 bits: del orden de 0,9-1,1 GB de pesos (estimación propia; requiere cuantizar por cuenta propia).
- Cabe en GPU de consumo: sí. Una RTX 3060 de 12 GB, una RTX 4060 Ti de 16 GB o una RTX 4090 lo ejecutan con holgura en BF16, incluso con contexto largo. También es viable en iGPU con 8 GB de memoria compartida usando cuantización de 4 bits.
- GPU profesionales: L4 (24 GB), A10G (24 GB), T4 (16 GB) son suficientes; A100 y H100 están sobredimensionadas para un modelo de este tamaño y solo se justifican por agregación de peticiones en lote.
- Opciones de despliegue: `transformers` (librería declarada), Text Generation Inference (el modelo lleva el tag `text-generation-inference` y `endpoints_compatible`), vLLM, y `llama.cpp`/Ollama previa conversión a GGUF (no hay GGUF publicado en el repositorio).
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por petición para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|---|
| opd-teacher-Q2.5I-LargestConvexPolygon-step149 | 1,54B | No especificado (base: 32.768) | Ajuste RL (GRPO) sobre instruct | Apache 2.0 | Hugging Face, 0 descargas | No publicado |
| Qwen/Qwen2.5-1.5B-Instruct (modelo base) | 1,54B | 32.768 tokens | Instruct generalista | Apache 2.0 | Hugging Face, ampliamente usado | Benchmarks públicos de Qwen (no reproducidos aquí) |
| Otros profesores de la colección RLVE OPD | ~1,5B cada uno | No especificado | Ajuste RL por entorno | Apache 2.0 | Hugging Face | No publicado |
| Modelos instructivos de ~1-2B de otras familias (por ejemplo Llama 3.2 1B Instruct o Gemma 2 2B IT) | 1-2B | 8.000-8.192 tokens según familia | Instruct generalista | Licencias específicas de cada familia | Hugging Face | Benchmarks públicos propios (no comparables directamente aquí) |

La comparación de rendimiento no es posible con los datos disponibles: el autor no publica métricas para este checkpoint ni una comparación con el modelo base. La diferencia funcional relevante frente a Qwen2.5-1.5B-Instruct es la especialización en un único entorno verificable, a cambio de un alcance de uso mucho más restringido.

## Limitaciones y advertencias

- Modelo de investigación altamente especializado: está ajustado sobre un único entorno (`LargestConvexPolygon`, dificultad 0) y no debe tratarse como un modelo instructivo de propósito general.
- Riesgo de degradación de capacidades generales: el ajuste con GRPO durante 150 pasos sobre una sola tarea puede provocar olvido catastrófico y sobreajuste al formato del entorno; no se ha evaluado este efecto.
- Sin datos de evaluación: no hay benchmarks, métricas de recompensa ni comparación con el modelo base, por lo que no es posible cuantificar su calidad real.
- Idiomas: solo inglés declarado. El uso en castellano u otros idiomas no está soportado ni verificado.
- Riesgo de alucinación: no evaluado. La naturaleza verificable del entorno de entrenamiento no garantiza ausencia de alucinaciones fuera de él.
- Sesgos: no documentados por el autor. Al derivar de Qwen2.5, hereda los sesgos del corpus de entrenamiento original, no auditados en esta ficha.
- Licencia: Apache 2.0, que permite uso comercial, pero el repositorio incluye además la licencia original de Qwen; conviene revisar ambas antes de un despliegue en producción.
- Adopción nula: 0 descargas y 0 "likes" en el momento de la consulta, sin issues ni validación externa conocida.
- Sin pesos cuantizados publicados: cualquier despliegue en 4 u 8 bits requiere cuantizar por cuenta propia, con el riesgo de degradación asociado.
- Fecha de creación futura respecto al conocimiento habitual del ecosistema (2026-09-28), lo que refuerza su carácter de artefacto experimental dentro de una campaña de investigación en curso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidheineman/opd-teacher-Q2.5I-LargestConvexPolygon-step149
- Colección RLVE OPD Teachers: https://huggingface.co/collections/davidheineman/rlve-opd-teachers
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Ejecución de entrenamiento en Weights & Biases: https://wandb.ai/david-heineman/rl-data-opd-teachers/runs/01680811
- Código de entrenamiento (RLVE): https://github.com/davidheineman/rlve
- Preprint de RLVE: https://arxiv.org/abs/2511.07317
- Implementación de On-Policy Delta Distillation (opd2, Naver AI): https://github.com/naver-ai/opd2
- Página del autor: https://davidheineman.com/
