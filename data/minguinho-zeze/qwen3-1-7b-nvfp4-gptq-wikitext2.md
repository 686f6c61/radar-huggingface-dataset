# Minguinho-zeze/Qwen3-1.7B-NVFP4-GPTQ-WikiText2

## Resumen

Qwen3-1.7B-NVFP4-GPTQ-WikiText2 es un checkpoint cuantizado del modelo Qwen3-1.7B de Alibaba Qwen, publicado por el usuario Minguinho-zeze dentro del proyecto lowbit-reasoning-ptq. No se trata de un modelo nuevo entrenado desde cero, sino de una cuantizacion post-entrenamiento (PTQ) sobre los pesos originales, sin entrenamiento adicional. El objetivo del experimento es medir el impacto de la cuantizacion de muy bajo bit en modelos pequenos con modo razonamiento activado.

La cuantizacion aplica NVFP4 a pesos y activaciones de entrada (esquema W4A4), con tamano de grupo 16 y algoritmo GPTQ. Las capas de embedding, normalizacion y `lm_head` permanecen sin cuantizar, y el 81,9079% de los parametros totales quedan afectados por la cuantizacion. El modelo base Qwen3-1.7B es un transformer denso de 1.720.574.976 parametros con licencia Apache-2.0 y capacidades de generacion de texto, razonamiento y conversacion.

La relevancia de esta ficha es doble: por un lado documenta una tecnica de cuantizacion de 4 bits en formato NVFP4 orientada a GPUs Blackwell; por otro, publica una evaluacion comparativa frente al modelo BF16 que muestra una degradacion notable en tareas de razonamiento (AIME-120 y GPQA Diamond). Es un artefacto de investigacion, no un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la ficha del checkpoint; el ejemplo de carga usa `max_model_len=34816` |
| Tipos de cuantizacion | NVFP4 W4A4 (pesos y activaciones de entrada en FP4, grupo 16), GPTQ; embedding, normalizacion y `lm_head` en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors (no GGUF, no AutoAWQ) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-1.7B, un transformer denso de la familia Qwen3. El checkpoint publicado no introduce cambios arquitectonicos: es una conversion PTQ de los pesos originales. La cuantizacion usa NVFP4 para pesos y activaciones (W4A4) con grupo de 16, aplicada mediante GPTQ, y se serializa con compressed-tensors para su carga en vLLM. Las capas de embedding, normalizacion y `lm_head` se mantienen sin cuantizar, lo que deja el 81,9079% de los parametros en formato de 4 bits. La KV cache se mantiene en BF16 durante la evaluacion.

La calibracion se realizo con texto de entrenamiento de WikiText-2 raw: 128 ventanas de 2.048 tokens con semilla 0. No hubo entrenamiento adicional ni ajuste fino. El entorno de servicio registrado por el autor es vLLM 0.32.0, PyTorch 2.13.0, Transformers 5.17.0, compressed-tensors 0.17.0 y humming-kernels 0.1.17, sobre GPUs Blackwell. Otras GPUs y combinaciones de paquetes no han sido validadas por esta release.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas del modelo base Qwen3-1.7B.
- Modo razonamiento (thinking mode) activable mediante `chat_template_kwargs={"enable_thinking": True}`; el autor lo habilita en toda la evaluacion.
- Razonamiento matematico y cientifico: la evaluacion se centra en AIME-120 y GPQA Diamond.
- Generacion de codigo: capacidad del modelo base, no evaluada de forma especifica en esta release.
- Soporte multilingue: no disponible en la informacion proporcionada.
- Tool calling / function calling: no disponible en la informacion proporcionada para este checkpoint.
- Capacidades de agente multi-paso: no disponible en la informacion proporcionada.
- Vision y audio: no soportados (modelo de texto).

## Casos de uso

- Investigacion sobre cuantizacion de bajo bit: el checkpoint sirve como referencia reproducible para estudiar la perdida de precision en razonamiento al pasar de BF16 a NVFP4 W4A4 en modelos de ~1,7B, con protocolo de evaluacion documentado.
- Despliegue en GPUs Blackwell con vLLM: el formato NVFP4 y compressed-tensors estan pensados para aprovechar los kernels nativos de estas GPUs, reduciendo huella de memoria frente a BF16.
- Pruebas de regresion de pipelines de cuantizacion: util para validar que una nueva version de vLLM, compressed-tensors o humming-kernels carga y ejecuta correctamente el checkpoint.
- Generacion de texto conversacional en entornos con memoria limitada: el modelo ocupa 1,4 GB en el repositorio, lo que permite alojarlo en GPUs consumer con margen para KV cache.
- Experimentos de calibracion: al usar WikiText-2 con parametros fijos (128 ventanas, 2.048 tokens, semilla 0), sirve de linea base para comparar otras estrategias de calibracion.
- Docencia y divulgacion: ejemplo practico de un flujo PTQ completo (GPTQ + NVFP4 + compressed-tensors) con artefactos de configuracion (`config.json`, `recipe.yaml`, `quant_meta.json`) y resultados de evaluacion publicados.

## Benchmarks y rendimiento

Resultados publicados por el autor, precision media en porcentaje sobre semillas 0, 1 y 2. Cada semilla evalua las mismas 120 preguntas de AIME y 198 de GPQA Diamond; las semillas repetidas son generaciones repetidas, no preguntas independientes. Modo thinking activado, temperatura 0,6, top-p 0,95, top-k desactivado y presupuesto de salida de 32.768 tokens. Las respuestas truncadas se puntuan como incorrectas.

| Modelo | AIME-120 | GPQA Diamond |
|---|---:|---:|
| Qwen3-1.7B BF16 | 40,00 | 40,40 |
| Este checkpoint (NVFP4 W4A4 GPTQ) | 23,89 | 32,49 |

El autor indica que estos resultados describen el protocolo del experimento y no son cifras oficiales de Qwen. Los resultados de analisis de factores se han retenido mientras se investigan incidencias mediante repeticiones, y la release no atribuye las diferencias de puntuacion a ningun algoritmo o metodo de calibracion concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 1,4 GB; con KV cache en BF16 y contexto largo (hasta 34.816 tokens en el ejemplo) la VRAM necesaria crece de forma proporcional al contexto y al numero de secuencias concurrentes.
- GPUs validadas: el autor solo ha validado GPUs Blackwell. Otras arquitecturas no han sido verificadas por esta release.
- GPU consumer: por tamano de pesos (1,4 GB) cabria en GPUs consumer con suficiente memoria, pero la validacion oficial no cubre estas tarjetas.
- Opciones de despliegue: vLLM 0.32.0 es el unico motor documentado. No hay release en formato GGUF ni AutoAWQ, por lo que llama.cpp y Ollama no son opciones directas sin conversion adicional.
- Dependencias criticas: PyTorch 2.13.0, Transformers 5.17.0, compressed-tensors 0.17.0 y humming-kernels 0.1.17. Para INT2 el autor anade el directorio de la libreria CUDA NVRTC a `LD_LIBRARY_PATH` antes de la compilacion JIT de Humming.
- Latencia y throughput: no disponibles en la informacion proporcionada, aunque el autor remite a `eval_results.json` y al informe completo para datos de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3-1.7B-NVFP4-GPTQ-WikiText2 | 1,72B | no disponible (ejemplo con 34.816) | safetensors compressed-tensors NVFP4 | Apache-2.0 | W4A4, evaluacion AIME-120 23,89 / GPQA 32,49 |
| Qwen3-1.7B (BF16) | 1,72B | no disponible | safetensors BF16 | Apache-2.0 | Referencia del autor: AIME-120 40,00 / GPQA 40,40 |
| Qwen3-1.7B-NVFP4A16-GPTQ-Trace | 1,72B | no disponible | safetensors compressed-tensors NVFP4 | Apache-2.0 | Variante W4A16 del mismo autor; sin cifras de benchmark en la informacion disponible |

No se dispone de datos de benchmark de otras alternativas comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Degradacion medible en razonamiento: la caida de AIME-120 (40,00 a 23,89) y GPQA Diamond (40,40 a 32,49) frente a BF16 es sustancial y debe tenerse en cuenta antes de usar el checkpoint en tareas que dependan de precision matematica o cientifica.
- Validacion limitada de hardware: solo se han validado GPUs Blackwell y un conjunto concreto de versiones de software; otras combinaciones pueden fallar o producir resultados distintos.
- Sin garantias de produccion: el autor no ha reejecutado el ejemplo de carga desde la revision subida a Hugging Face, y el checkpoint se presenta como artefacto de experimentacion.
- Riesgo de alucinacion: inherente al modelo base Qwen3-1.7B; la cuantizacion puede agravar la perdida de coherencia en generaciones largas.
- Sesgos: no documentados en la informacion proporcionada; se heredan los del modelo base.
- Idiomas: no se especifica la cobertura linguistica de este checkpoint.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el autor no ofrece ninguna garantia sobre el comportamiento del checkpoint cuantizado.
- Formato cerrado a vLLM: al no publicarse GGUF ni AutoAWQ, la portabilidad a otros motores requiere conversion manual.
- Reproducibilidad parcial: el analisis de factores esta retenido y las diferencias de puntuacion no se atribuyen a ninguna causa concreta en esta release.

## Enlaces

- Checkpoint en Hugging Face: https://huggingface.co/Minguinho-zeze/Qwen3-1.7B-NVFP4-GPTQ-WikiText2
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio del proyecto lowbit-reasoning-ptq: https://github.com/minguinho26/lowbit-reasoning-ptq
- Snapshot de evaluacion (revision a851e39): https://github.com/minguinho26/lowbit-reasoning-ptq/tree/a851e3957297eaa52d0344a50bd0bbc7e87d5378
- Informe completo de resultados: https://github.com/minguinho26/lowbit-reasoning-ptq/tree/main/reports/qwen3-1.7b-20261108
- Script del motor de evaluacion: https://github.com/minguinho26/lowbit-reasoning-ptq/blob/a851e3957297eaa52d0344a50bd0bbc7e87d5378/src/engine.py
- Variante W4A16 del mismo autor: https://huggingface.co/Minguinho-zeze/Qwen3-1.7B-NVFP4A16-GPTQ-Trace
