# Minguinho-zeze/Qwen3-1.7B-NVFP4-AWQ-Trace

## Resumen

Qwen3-1.7B-NVFP4-AWQ-Trace es un checkpoint de Qwen3-1.7B sometido a cuantización post-entrenamiento en formato NVFP4 (pesos de 4 bits y activaciones de entrada de 4 bits, W4A4) con algoritmo AWQ y tamaño de grupo 16. Lo publica el usuario Minguinho-zeze como artefacto de un experimento reproducible de cuantización de bajo bit para razonamiento (repositorio lowbit-reasoning-ptq), con un run identificado como `qwen3-1.7b__nvfp4__awq__trace`. No se realizó entrenamiento adicional: es una conversión del modelo base Qwen/Qwen3-1.7B.

El interés del checkpoint es doble. Por un lado, demuestra el uso de compressed-tensors con NVFP4 en vLLM sobre GPUs Blackwell, una combinación poco frecuente en modelos pequeños. Por otro, publica una evaluación controlada sobre AIME-120 y GPQA Diamond comparando el modelo BF16 original con la versión cuantizada, con tres semillas. Los resultados muestran una caída apreciable en AIME (40,00 a 28,89) y una caída menor en GPQA Diamond (40,40 a 38,55).

Se trata de un modelo de 1.720.574.976 parámetros (1,7B), pensado para generación de texto y razonamiento con modo thinking activado. Su relevancia práctica es limitada fuera del contexto del experimento: el autor advierte que solo se ha validado en GPUs Blackwell con versiones muy concretas de vLLM, PyTorch, Transformers, compressed-tensors y humming-kernels, y que no es un release GGUF ni AutoAWQ.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), cuantizado post-entrenamiento |
| Parametros totales | 1.720.574.976 (1,7B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de serving usa max_model_len=34816) |
| Tipos de cuantizacion | NVFP4 W4A4, group size 16, algoritmo AWQ; embedding, normalizacion y lm_head sin cuantizar (81,9079% de parametros cuantizados) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors (no GGUF, no AutoAWQ) |

## Arquitectura y entrenamiento

El modelo base es Qwen3-1.7B, un transformer decoder-only denso de la familia Qwen3. Sobre él se aplica únicamente cuantización post-entrenamiento: pesos NVFP4 y activaciones de entrada FP4 (W4A4) con tamaño de grupo 16, usando el algoritmo AWQ. Las capas de embedding, normalización y `lm_head` se mantienen sin cuantizar. Los pesos se empaquetan con compressed-tensors y el KV cache se mantiene en BF16 durante la evaluación.

La calibración se realizó con trazas de razonamiento generadas por el propio Qwen3-1.7B en BF16 a partir de NuminaMath-1.5. El pipeline de generación excluye la fuente `amc_aime` y filtra solapamientos de n-gramas de 13 palabras con las preguntas de evaluación, para evitar contaminación. Se usaron 128 ventanas de 2.048 tokens con semilla 0. No hubo RLHF, DPO ni fine-tuning: el autor indica explícitamente que no se realizó entrenamiento adicional. Los ajustes exactos y las versiones del cuantizador quedan registrados en `config.json`, `recipe.yaml` y `quant_meta.json`.

## Capacidades

- Generación de texto conversacional y de un solo turno, con plantilla de chat de Qwen3.
- Razonamiento multi-paso en modo thinking (`enable_thinking=True`), con presupuesto de salida de hasta 32.768 tokens en la configuración de evaluación.
- Resolución de problemas matemáticos y de razonamiento científico, evaluada sobre AIME-120 y GPQA Diamond.
- Generación de código y tareas de instrucción general, heredadas del modelo base Qwen3-1.7B (no evaluadas en esta ficha).
- Soporte multilingüe: no disponible en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada para este checkpoint.
- Capacidades de agente o multi-step tool use: no disponible en la información proporcionada.
- Sin visión ni audio: es un modelo exclusivamente de texto.

## Casos de uso

- Evaluación de cuantización de bajo bit en producción: sirve como referencia reproducible para medir la pérdida de precisión de NVFP4 W4A4 frente a BF16 en tareas de razonamiento, usando el protocolo AIME-120/GPQA Diamond del autor.
- Despliegue de razonamiento matemático con presupuesto de tokens alto: el modo thinking con hasta 32.768 tokens de salida permite cadenas de razonamiento largas en problemas de competición, aunque con la penalización de precisión observada.
- Serving de bajo coste en GPUs Blackwell: al ocupar 1,4 GB en reposo y usar kernels FP4 nativos, encaja en escenarios donde el ahorro de memoria y ancho de banda importa más que la precisión absoluta.
- Prototipado de pipelines con vLLM y compressed-tensors: útil para validar integraciones de `compressed-tensors 0.17.0` y `humming-kernels` antes de migrar modelos mayores.
- Investigación sobre calibración con trazas de razonamiento: el uso de NuminaMath-1.5 filtrado como dataset de calibración es un caso concreto para estudiar cómo afecta la distribución de calibración a tareas de matemáticas.
- Docencia y experimentación con cuantización: modelo pequeño (1,7B) que cabe en una sola GPU y permite reproducir el pipeline completo con coste reducido.

## Benchmarks y rendimiento

Precisión media en porcentaje sobre semillas 0, 1 y 2. Cada semilla evalúa las mismas 120 preguntas de AIME y 198 de GPQA Diamond; las semillas repetidas son generaciones repetidas, no preguntas independientes. Modo thinking activado, temperatura 0,6, top-p 0,95, top-k desactivado, presupuesto de salida de 32.768 tokens. Las respuestas truncadas se puntúan como incorrectas.

| Modelo | AIME-120 | GPQA Diamond |
|---|---:|---:|
| Qwen3-1.7B BF16 | 40,00 | 40,40 |
| Este checkpoint (NVFP4 W4A4 AWQ) | 28,89 | 38,55 |

El autor indica que estos resultados describen el protocolo del experimento y no son resultados oficiales de Qwen. Los resultados de efecto de factores y su interpretación están retenidos mientras se investigan incidencias mediante repeticiones, y el release no atribuye las diferencias observadas a ningún algoritmo o método de calibración concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 1,4 GB, por lo que los pesos caben holgadamente en GPUs de 8 GB o más; el KV cache en BF16 y el presupuesto de 32.768 tokens de salida elevan el consumo real según la longitud de contexto configurada.
- GPU recomendadas: el autor solo ha validado el modelo en GPUs Blackwell, que son las que soportan NVFP4 de forma nativa. Otras GPUs y combinaciones de paquetes no han sido validadas por este release.
- ¿Cabe en GPU consumer? Por tamaño de pesos sí, pero la validación oficial se limita a Blackwell; el soporte en GPUs consumer no está confirmado por el autor.
- Opciones de despliegue: vLLM 0.32.0 con PyTorch 2.13.0, Transformers 5.17.0, compressed-tensors 0.17.0 y humming-kernels 0.1.17. No es compatible con llama.cpp, Ollama ni AutoAWQ en el formato publicado.
- Configuración de serving del experimento: `max_model_len=34816`, `gpu_memory_utilization=0.90`, `enable_prefix_caching=False`, `tokenizer_mode="hf"`, `config_format="hf"`, `generation_config="vllm"`.
- Latencia y throughput: no disponibles en la información proporcionada; el autor remite a `eval_results.json` y a los informes del repositorio para longitudes de tokens y velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | AIME-120 | GPQA Diamond | Licencia |
|---|---|---:|---|---:|---:|---|
| Qwen3-1.7B BF16 (base) | 1,7B | no disponible | ninguna | 40,00 | 40,40 | Apache-2.0 |
| Qwen3-1.7B-NVFP4-AWQ-Trace (este) | 1,7B | no disponible | NVFP4 W4A4 AWQ | 28,89 | 38,55 | Apache-2.0 |
| Qwen3-1.7B-NVFP4A16-GPTQ-Trace | 1,7B | no disponible | NVFP4 W4A16 GPTQ | no disponible | no disponible | Apache-2.0 |

El tercer checkpoint es del mismo autor y misma familia, con pesos NVFP4 pero activaciones de 16 bits y algoritmo GPTQ; su evaluación no figura en la información disponible. No se dispone de datos de benchmarks de otros modelos comparables de 1-2B en la información proporcionada.

## Limitaciones y advertencias

- Pérdida de precisión medible: la caída en AIME-120 es de 11,11 puntos porcentuales respecto al BF16 (40,00 a 28,89), lo que desaconseja su uso en tareas matemáticas donde la exactitud sea crítica sin una validación propia.
- Validación restringida: solo se ha probado en GPUs Blackwell con versiones concretas de vLLM, PyTorch, Transformers, compressed-tensors y humming-kernels; otras GPUs y combinaciones no están validadas.
- El ejemplo de carga del README no se ha vuelto a ejecutar desde la revisión subida a Hugging Face, según admite el propio autor.
- Formato no portable: no es GGUF ni AutoAWQ, por lo que no se puede usar directamente con llama.cpp, Ollama o AutoAWQ.
- Las respuestas truncadas se puntúan como incorrectas; con presupuesto de 32.768 tokens, configuraciones más cortas pueden degradar aún más las métricas.
- Riesgo de alucinación y sesgos: no se documentan en la información proporcionada; se heredan del modelo base Qwen3-1.7B, cuyo model card debe consultarse.
- Idiomas soportados: no disponibles en la información proporcionada.
- Licencia Apache-2.0: permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del checkpoint cuantizado y remite a la licencia upstream incluida en `LICENSE`.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de uso en producción por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/Minguinho-zeze/Qwen3-1.7B-NVFP4-AWQ-Trace
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio del experimento: https://github.com/minguinho26/lowbit-reasoning-ptq
- Revisión del snapshot de evaluación: https://github.com/minguinho26/lowbit-reasoning-ptq/tree/a851e3957297eaa52d0344a50bd0bbc7e87d5378
- Informes de resultados completos: https://github.com/minguinho26/lowbit-reasoning-ptq/tree/main/reports/qwen3-1.7b-20261108
- Configuración del motor de serving: https://github.com/minguinho26/lowbit-reasoning-ptq/blob/a851e3957297eaa52d0344a50bd0bbc7e87d5378/src/engine.py
- Checkpoint hermano (NVFP4A16 GPTQ): https://huggingface.co/Minguinho-zeze/Qwen3-1.7B-NVFP4A16-GPTQ-Trace
