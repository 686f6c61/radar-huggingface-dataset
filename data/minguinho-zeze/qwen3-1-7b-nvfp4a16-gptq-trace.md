# Minguinho-zeze/Qwen3-1.7B-NVFP4A16-GPTQ-Trace

## Resumen

Qwen3-1.7B-NVFP4A16-GPTQ-Trace es un checkpoint cuantizado del modelo base Qwen/Qwen3-1.7B, publicado por el usuario Minguinho-zeze dentro del proyecto lowbit-reasoning-ptq. No se trata de un modelo nuevo: es una versión de post-entrenamiento cuantizada en formato NVFP4 (pesos de 4 bits) con activaciones de 16 bits (W4A16) mediante el algoritmo GPTQ, con grupo de cuantización de tamaño 16. El objetivo del experimento es medir el impacto de la cuantización de baja precisión sobre el razonamiento matemático y científico del modelo original.

El checkpoint conserva la arquitectura y el comportamiento del Qwen3-1.7B original (transformer denso de 1.720.574.976 parámetros, aproximadamente 1,7 mil millones), pero comprime los pesos para reducir el uso de memoria y facilitar el despliegue en GPUs Blackwell. Las capas de embedding, normalización y `lm_head` permanecen sin cuantizar, y el 81,9079 % de los parámetros está cuantizado. Los pesos se almacenan en formato compressed-tensors y se cargan a través de vLLM.

Es relevante ahora porque explora la viabilidad de NVFP4/GPTQ como formato de despliegue para modelos pequeños de razonamiento, un área donde las pérdidas de precisión en tareas de matemáticas y ciencia son sensibles. El autor publica resultados de evaluación sobre AIME-120 y GPQA Diamond comparando con el modelo BF16, lo que permite cuantificar la degradación. El modelo se distribuye bajo licencia Apache-2.0, heredada del upstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), derivado de Qwen/Qwen3-1.7B |
| Parametros totales | 1.720.574.976 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 34.816 tokens configurados en vLLM (`max_model_len=34816`); contexto nativo del Qwen3-1.7B no detallado en la información disponible |
| Tipos de cuantizacion | NVFP4 pesos (4 bits) con activaciones de 16 bits (W4A16), GPTQ, grupo de tamaño 16; embedding, normalización y `lm_head` sin cuantizar; KV cache en BF16 durante la evaluación |
| Idiomas soportados | No disponible en la model card; hereda los del Qwen3-1.7B base (no detallados en la información proporcionada) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors (no es GGUF ni AutoAWQ) |

## Arquitectura y entrenamiento

El checkpoint parte del Qwen3-1.7B, un transformer denso de tipo decoder-only con 1.720.574.976 parámetros. No se ha realizado entrenamiento adicional: la model card indica explícitamente "No additional training was performed". La transformación consiste únicamente en cuantización post-entrenamiento (PTQ) mediante GPTQ, en formato NVFP4 para pesos y 16 bits para activaciones, con grupo de 16. Las capas de embedding, normalización y `lm_head` quedan en su precisión original, y el 81,9079 % de los parámetros resulta cuantizado.

Para la calibración se generaron trazas de razonamiento en BF16 a partir de NuminaMath-1.5, excluyendo la fuente amc_aime y filtrando solapamientos de n-gramas de 13 palabras con las preguntas de evaluación, una precaución para evitar contaminación entre calibración y test. La calibración usa 128 ventanas de 2.048 tokens con semilla 0. El entorno de servicio registrado es vLLM 0.32.0, PyTorch 2.13.0, Transformers 5.17.0, compressed-tensors 0.17.0 y humming-kernels 0.1.17, sobre GPUs Blackwell; el autor advierte que otras GPUs y combinaciones de paquetes no han sido validadas. Para INT2, el experimento añade el directorio de NVRTC de CUDA a `LD_LIBRARY_PATH` antes de la compilación JIT de Humming.

## Capacidades

- Generación de texto conversacional y de razonamiento, con modo "thinking" habilitable mediante `chat_template_kwargs={"enable_thinking": True}`.
- Razonamiento matemático y científico, evaluado específicamente sobre AIME y GPQA Diamond.
- Generación de trazas de razonamiento paso a paso (el modelo fue calibrado con trazas de este tipo).
- Capacidades multilingües heredadas del Qwen3-1.7B base (no detalladas en la model card).
- Compatibilidad con la API de chat de vLLM y con `SamplingParams`.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni otras capacidades especiales en la información disponible.

## Casos de uso

- Evaluación de cuantización NVFP4 en modelos de razonamiento: usar este checkpoint junto con la versión BF16 para medir la degradación en tareas de matemáticas y ciencia bajo protocolos reproducibles (semillas 0, 1 y 2).
- Despliegue de razonamiento matemático en GPUs Blackwell con memoria limitada: la cuantización W4A16 reduce la huella de pesos frente al BF16, permitiendo servir Qwen3-1.7B con un contexto configurado de 34.816 tokens en vLLM.
- Generación de soluciones paso a paso para problemas de competición (estilo AIME): el modo thinking produce trazas largas, con un presupuesto de salida de 32.768 tokens.
- Investigación sobre contaminación de calibración: el filtrado de n-gramas de 13 palabras frente a las preguntas de evaluación sirve como referencia metodológica para experimentos de PTQ en dominios de razonamiento.
- Reproducción de experimentos de lowbit-reasoning-ptq: el repo incluye `config.json`, `recipe.yaml`, `quant_meta.json` y `eval_results.json` para replicar la configuración exacta del cuantizador y del motor.
- Pruebas de integración con vLLM: validar la carga de checkpoints compressed-tensors NVFP4A16 en pipelines de servicio antes de adoptar este formato en producción.

## Benchmarks y rendimiento

Resultados publicados en la model card: precisión media en porcentaje sobre semillas 0, 1 y 2. Cada semilla evalúa las mismas 120 preguntas de AIME y 198 de GPQA Diamond; las semillas repetidas son generaciones repetidas, no preguntas independientes. Modo thinking habilitado, temperatura 0,6, top-p 0,95, top-k deshabilitado, presupuesto de salida de 32.768 tokens; las respuestas truncadas se puntúan como incorrectas.

| Modelo | AIME-120 | GPQA Diamond |
|---|---:|---:|
| Qwen3-1.7B BF16 | 40,00 | 40,40 |
| Este checkpoint (NVFP4A16 GPTQ) | 36,94 | 36,36 |

El autor indica que estas puntuaciones describen el protocolo del experimento y no son resultados oficiales de Qwen. Los resultados de efecto de factores y su interpretación están retenidos mientras se investigan incidencias adicionales mediante repeticiones; esta release no afirma que un algoritmo o método de calibración cause las diferencias observadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repo ocupa 1,4 GB y la cuantización W4A16 reduce los pesos frente al BF16, pero la model card no publica una cifra de VRAM.
- GPU recomendadas: GPUs Blackwell, único entorno validado por esta release (vLLM 0.32.0, PyTorch 2.13.0, compressed-tensors 0.17.0, humming-kernels 0.1.17).
- Otras GPUs y combinaciones de paquetes: no validadas por esta release.
- Opciones de despliegue: vLLM (librería indicada en la model card). No es un release GGUF ni AutoAWQ, por lo que llama.cpp, Ollama y TGI no están documentados como compatibles.
- Memoria: `gpu_memory_utilization=0.90`, `max_model_len=34816`, `enable_prefix_caching=False` en la configuración de ejemplo.
- Latencia y throughput: no disponibles en la información proporcionada; el autor remite a los reports completos para longitudes de token, truncamiento y velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-1.7B-NVFP4A16-GPTQ-Trace (este) | 1,72 B | 34.816 en vLLM | Apache-2.0 | safetensors compressed-tensors | Hugging Face, vLLM |
| Qwen/Qwen3-1.7B (base) | 1,72 B | no detallado en la información disponible | Apache-2.0 | safetensors BF16 | Hugging Face, Transformers |
| Alternativas de cuantización del mismo base | no disponible | no disponible | Apache-2.0 (heredada) | no disponible | no disponible |

La comparación directa de rendimiento disponible es la de la tabla de benchmarks: 40,00 frente a 36,94 en AIME-120 y 40,40 frente a 36,36 en GPQA Diamond (BF16 frente a este checkpoint). No se dispone de datos de otras alternativas cuantizadas para comparar.

## Limitaciones y advertencias

- Degradación de precisión observada: caída de 3,06 puntos en AIME-120 y 4,04 puntos en GPQA Diamond frente al BF16, bajo el protocolo del autor.
- Validación limitada: solo GPUs Blackwell y las versiones de paquetes registradas; otras GPUs y combinaciones no han sido validadas.
- El ejemplo de carga de la model card no ha sido reejecutado desde la revisión subida a Hugging Face.
- Las respuestas truncadas se puntúan como incorrectas, lo que puede penalizar configuraciones con menor presupuesto de salida.
- El autor retiene los resultados de efecto de factores y no atribuye las diferencias a ningún algoritmo o método de calibración.
- Riesgo de alucinación: no evaluado ni documentado en la información disponible.
- Sesgos conocidos: no documentados en la información disponible.
- Idiomas: no detallados en la model card; dependen del Qwen3-1.7B base.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar la model card del upstream para condiciones adicionales.
- No es GGUF ni AutoAWQ: no utilizable directamente con llama.cpp, Ollama o TGI según la información disponible.
- Repo con 0 descargas y 0 likes: sin validación comunitaria ni evidencia de uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Minguinho-zeze/Qwen3-1.7B-NVFP4A16-GPTQ-Trace
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio del proyecto: https://github.com/minguinho26/lowbit-reasoning-ptq
- Snapshot de evaluación: https://github.com/minguinho26/lowbit-reasoning-ptq/tree/a851e3957297eaa52d0344a50bd0bbc7e87d5378
- Configuración del motor (`src/engine.py`): https://github.com/minguinho26/lowbit-reasoning-ptq/blob/a851e3957297eaa52d0344a50bd0bbc7e87d5378/src/engine.py
- Resultados completos: https://github.com/minguinho26/lowbit-reasoning-ptq/tree/main/reports/qwen3-1.7b-20261108
