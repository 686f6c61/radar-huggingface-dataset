# mariaskai/llm-course-hw2-ppo

## Resumen

`mariaskai/llm-course-hw2-ppo` es un modelo de lenguaje publicado en Hugging Face por el usuario `mariaskai` el 2 de noviembre de 2026. Por el nombre del repositorio, todo apunta a que se trata de un artefacto de un ejercicio académico de un curso sobre modelos de lenguaje, en el que se ha aplicado aprendizaje por refuerzo con optimización de política proximal (PPO) sobre un modelo base de la familia LLaMA. No es, por tanto, un modelo pensado para producción, sino un checkpoint de investigación o de práctica formativa.

El modelo cuenta con 134.515.008 parámetros totales según los pesos en safetensors, lo que lo sitúa en el rango de los modelos pequeños (aproximadamente 134 millones de parámetros, un tamaño típico de configuraciones tipo LLaMA de 130-140M). El repositorio ocupa 0,5 GB, un tamaño coherente con pesos en precisión de 16 bits para esa cantidad de parámetros. La librería declarada es `transformers` y la arquitectura es de tipo LLaMA (transformer decoder-only).

La relevancia de esta ficha es limitada desde el punto de vista de la evaluación técnica: la model card es la plantilla autogenerada de Hugging Face sin ningún dato rellenado, no hay benchmarks publicados, no se declara licencia ni idiomas, y el modelo no tiene descargas ni likes. Se documenta aquí de forma rigurosa precisamente para dejar constancia de lo que se sabe y, sobre todo, de lo que no se sabe.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo LLaMA (según tags del repositorio) |
| Parametros totales | 134.515.008 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; el tamaño del repo de 0,5 GB sugiere fp16/bf16) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura declarada en los tags del repositorio es `llama`, lo que implica un transformer decoder-only con atención causal, normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE), el diseño estándar de la familia LLaMA. Con 134,5 millones de parámetros, se corresponde con una configuración pequeña de esa familia.

En cuanto al entrenamiento, el sufijo `ppo` del identificador indica que el modelo ha pasado por una fase de ajuste con aprendizaje por refuerzo usando Proximal Policy Optimization. El contexto del nombre (`llm-course-hw2`) sugiere que forma parte de la segunda tarea de un curso sobre LLMs, probablemente con el objetivo de alinear un modelo pequeño mediante RLHF o una recompensa programática. No obstante, la model card no proporciona ningún detalle sobre el modelo base del que parte, el volumen de datos de entrenamiento, la composición del dataset, la función de recompensa utilizada ni los hiperparámetros del PPO. Toda esta información debe considerarse no disponible.

## Capacidades

- Generación de texto autoregresiva, propia de un transformer decoder-only.
- Conversación multi-turno: el tag `conversational` sugiere que el modelo fue ajustado para formato de diálogo, aunque no se documenta el formato de prompt exacto.
- Compatibilidad con text-generation-inference y endpoints compatibles, según los tags del repositorio.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües específicas.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Práctica docente de RLHF y PPO: el modelo sirve como ejemplo reproducible para estudiar cómo un ajuste con PPO modifica el comportamiento de un modelo pequeño; su tamaño reducido permite ejecutarlo en un portátil con GPU modesta.
- Experimentación con alineación en modelos pequeños: investigadores pueden comparar la distribución de salidas del checkpoint PPO frente al modelo base para analizar el efecto del ajuste por refuerzo.
- Pruebas de pipelines de `transformers` y TGI: al declarar compatibilidad con text-generation-inference, puede usarse para validar despliegues de endpoints en entornos de desarrollo.
- Generación de texto de baja exigencia en prototipos: con 134M de parámetros, puede generar respuestas cortas en demos internas donde la calidad no sea crítica.
- Base para fine-tuning posterior: su tamaño permite experimentar con LoRA o ajuste completo en una única GPU consumer, aunque la falta de licencia clara desaconseja su uso fuera de entornos personales o académicos.
- Estudio de sesgos y alucinación en modelos pequeños alineados: útil como caso de análisis de cómo el PPO puede amplificar o mitigar comportamientos indeseados en modelos de baja capacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,3 GB en fp16 (270 MB de pesos) más el overhead de activaciones, KV cache y runtime; en la práctica, menos de 1 GB para contextos cortos.
- En cuantización de 8 bits o 4 bits (si se generan pesos GGUF, no publicados), cabría en menos de 200 MB.
- GPU recomendadas: cualquier GPU consumer moderna sirve; una RTX 3060, RTX 4060 o incluso una GPU integrada con suficiente memoria compartida puede ejecutarlo.
- Cabe en GPU consumer: sí, con amplio margen, incluidas GPUs de gama baja y portátiles.
- Opciones de despliegue: `transformers` (librería declarada), text-generation-inference (tag `text-generation-inference`) y endpoints compatibles. No se han publicado pesos GGUF, por lo que llama.cpp u Ollama requerirían una conversión manual.
- Latencia y throughput estimados: no disponibles; por el tamaño, se espera un throughput alto en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| mariaskai/llm-course-hw2-ppo | 134,5M | No disponible | No disponible | Hugging Face, sin descargas |
| TinyLlama-1.1B | 1,1B | 2.048 tokens (ampliable) | Apache 2.0 | Hugging Face, ampliamente usado |
| SmolLM-135M | 135M | 2.048 tokens | Apache 2.0 | Hugging Face, con benchmarks publicados |
| Qwen2.5-0.5B | 0,49B | 32.768 tokens | Apache 2.0 | Hugging Face, con benchmarks publicados |

La comparación se limita a parámetros, contexto y licencia porque no hay datos de rendimiento del modelo analizado. Frente a SmolLM-135M, de tamaño casi idéntico, la diferencia principal es la ausencia total de documentación, benchmarks y licencia en el caso de `llm-course-hw2-ppo`.

## Limitaciones y advertencias

- La model card es la plantilla autogenerada de Hugging Face: no hay información sobre datos de entrenamiento, sesgos ni evaluación.
- Riesgo elevado de alucinación y de respuestas incoherentes por el tamaño reducido del modelo (134M de parámetros) y la falta de evaluación.
- No se declara licencia, lo que impide determinar si el uso comercial está permitido; debe asumirse que no lo está hasta que el autor lo aclare.
- No se declaran idiomas soportados; no hay garantía de buen rendimiento en castellano ni en ningún otro idioma.
- No se documenta la longitud de contexto, por lo que no se puede planificar su uso en tareas de contexto largo.
- El ajuste con PPO sin documentación de la función de recompensa puede haber introducido comportamientos degenerados (repeticiones, respuestas evasivas) difíciles de prever.
- Sin descargas ni likes, no hay evidencia de uso comunitario ni de validación externa.
- No apto para producción sin una evaluación propia exhaustiva.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/mariaskai/llm-course-hw2-ppo)
- [Paper de referencia sobre PPO (Schulman et al., 2017)](https://arxiv.org/abs/1707.06347)
- [Paper citado en la model card sobre impacto ambiental (Lacoste et al., 2019)](https://arxiv.org/abs/1910.09700)
- [Calculadora de impacto ML](https://mlco2.github.io/impact#compute)
