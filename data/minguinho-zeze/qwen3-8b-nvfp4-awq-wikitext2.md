# Minguinho-zeze/Qwen3-8B-NVFP4-AWQ-WikiText2

## Resumen

Qwen3-8B-NVFP4-AWQ-WikiText2 es un checkpoint cuantizado del modelo Qwen3-8B de Alibaba Qwen, publicado por el usuario Minguinho-zeze como parte del proyecto de investigación lowbit-reasoning-ptq. No se trata de un modelo nuevo ni de un fine-tune: es el Qwen3-8B original sometido a cuantización post-entrenamiento (PTQ) en formato NVFP4 (W4A4, pesos e activaciones en FP4) con el algoritmo AWQ y calibración sobre WikiText-2. El objetivo es estudiar cómo afecta la cuantización de muy bajo bit a las capacidades de razonamiento del modelo, y el repositorio incluye métricas de precisión comparadas con el modelo base en BF16.

El modelo conserva la arquitectura del Qwen3-8B original (transformer denso de 8.190.735.360 parámetros, con modo thinking habilitable mediante plantilla de chat) y añade un 84,8% de parámetros cuantizados, dejando sin cuantizar embeddings, capas de normalización y `lm_head`. La licencia es Apache-2.0, heredada del modelo base.

Es relevante ahora porque demuestra la viabilidad práctica de NVFP4 en GPUs Blackwell (RTX 5090, RTX PRO 4500) con vLLM y compressed-tensors, un stack todavía poco explorado, y porque publica la receta, los metadatos de cuantización y los informes de evaluación de forma reproducible. No obstante, es un artefacto de investigación con cero descargas y validación limitada al entorno exacto del experimento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-8B) con cuantización NVFP4 W4A4 |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 34.816 tokens en la configuración de ejemplo (`max_model_len`); el modelo base Qwen3-8B soporta hasta 131.072 según fuentes externas, no confirmado para este checkpoint |
| Tipos de cuantizacion | NVFP4 (W4A4, group size 16) con AWQ; 84,800291% de parámetros cuantizados; embeddings, norm y `lm_head` en BF16 |
| Idiomas soportados | no disponible (la model card no los detalla; hereda los del Qwen3-8B base) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con formato compressed-tensors (no GGUF, no AutoAWQ) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen3-8B: un transformer denso de aproximadamente 8,19 mil millones de parámetros, con soporte de modo thinking (razonamiento paso a paso) activable mediante `chat_template_kwargs={"enable_thinking": True}`. Sobre este modelo no se realizó ningún entrenamiento adicional; la model card lo indica explícitamente ("No additional training was performed").

La innovación está en el pipeline de cuantización: pesos e activaciones de entrada se comprimen a FP4 (W4A4) con tamaño de grupo 16, aplicando AWQ como algoritmo de cuantización consciente de activaciones. La calibración usa texto de entrenamiento raw de WikiText-2, con 128 ventanas de 2.048 tokens y semilla 0. Las capas de embedding, normalización y `lm_head` quedan en BF16, y la KV cache se mantiene en BF16 durante la evaluación. Los metadatos exactos (receta, versiones de cuantizador) están en `recipe.yaml`, `quant_meta.json` y `config.json`. El experimento se ejecutó con vLLM 0.32.0, PyTorch 2.13.0, Transformers 5.17.0 y compressed-tensors 0.17.0 sobre GPUs Blackwell; para INT2 se usó humming-kernels 0.1.17 con compilación JIT vía NVRTC.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del Qwen3-8B base.
- Razonamiento explícito en modo thinking (cadena de pensamiento antes de la respuesta), con presupuesto de salida de hasta 32.768 tokens en la configuración de evaluación.
- Razonamiento matemático y resolución de problemas tipo competición (evaluado en AIME-120).
- Razonamiento científico de nivel experto (evaluado en GPQA Diamond).
- Soporte de tool calling / function calling: no confirmado explícitamente para este checkpoint, aunque el modelo base Qwen3-8B lo soporta.
- Capacidades de agente y razonamiento multi-paso: no validadas en esta release.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Visión y audio: no soportados (modelo de texto).
- Inferencia eficiente en GPUs Blackwell gracias a kernels FP4 nativos.

## Casos de uso

- Investigación en cuantización de bajo bit: el checkpoint sirve como referencia reproducible para medir la degradación de razonamiento al pasar de BF16 a NVFP4 W4A4, con métricas por semilla y análisis de truncamiento publicados en el repositorio del proyecto.
- Evaluación de stacks NVFP4 en producción: permite validar vLLM 0.32.0 + compressed-tensors 0.17.0 sobre Blackwell antes de comprometerse con una arquitectura de despliegue, usando la configuración de carga documentada.
- Despliegue con restricciones de VRAM en GPUs Blackwell: al ocupar aproximadamente 6,4 GB en disco y reducir el peso de los pesos a 4 bits, encaja en escenarios donde el BF16 (unos 16 GB) no cabría junto a la KV cache.
- Razonamiento matemático asistido: con modo thinking y 32K tokens de salida puede resolver problemas de álgebra y competición, aunque con una caída medible respecto al BF16 (ver benchmarks).
- Preguntas y respuestas científicas de dominio experto: útil para prototipos de asistencia en física, química o biología de nivel avanzado, aceptando la pérdida de precisión documentada en GPQA Diamond.
- Benchmarking interno de pipelines de cuantización: como baseline para comparar otras recetas (GPTQ, INT2, group sizes distintos) sobre el mismo modelo base y el mismo conjunto de calibración.

## Benchmarks y rendimiento

Precisión en porcentaje, promediada sobre semillas 0, 1 y 2; cada semilla evalúa 120 preguntas de AIME y 198 de GPQA Diamond. Modo thinking habilitado, temperatura 0,6, top-p 0,95, top-k desactivado, presupuesto de salida de 32.768 tokens; las respuestas truncadas se puntúan como incorrectas.

| Modelo | AIME-120 | GPQA Diamond |
|---|---:|---:|
| Qwen3-8B BF16 | 71,39 | 61,11 |
| Este checkpoint (NVFP4 AWQ) | 63,33 | 55,56 |

La caída es de 8,06 puntos en AIME-120 y 5,55 puntos en GPQA Diamond. El autor advierte que las ejecuciones se hicieron en RTX 5090 y RTX PRO 4500 Blackwell y que las pequeñas diferencias no deben atribuirse solo a los algoritmos. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 6,4 GB en disco; en ejecución hay que sumar la KV cache en BF16 y el overhead de vLLM. Con `gpu_memory_utilization=0.90` y 34.816 tokens de contexto, se recomienda al menos 24 GB de VRAM.
- GPUs recomendadas: RTX 5090 y RTX PRO 4500 Blackwell (las validadas por el autor). Otras GPUs no han sido validadas por esta release.
- ¿Cabe en consumer GPU? Sí, en GPUs Blackwell de gama alta con 24 GB o más; en generaciones anteriores (Ampere, Ada) los kernels NVFP4 no están validados y el rendimiento puede degradarse o fallar.
- Opciones de despliegue: vLLM 0.32.0 con compressed-tensors 0.17.0 es la única ruta validada. No hay release GGUF, por lo que llama.cpp y Ollama no son compatibles directamente. TGI no está validado.
- Latencia y throughput: no disponibles en la información proporcionada; el repositorio del proyecto enlaza métricas de velocidad en `reports/qwen3-8b-20261107`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-8B-NVFP4-AWQ-WikiText2 (este) | 8,19B | 34.816 en config de ejemplo | NVFP4 W4A4, group 16, AWQ | Apache-2.0 | Hugging Face, 0 descargas |
| Qwen3-8B (BF16) | 8,19B | hasta 131.072 según fuentes externas | ninguna (BF16) | Apache-2.0 | Hugging Face, ampliamente usado |
| Qwen3-8B-NVFP4 (NVIDIA) | 8,19B | 131.072 según fuente externa | FP4, optimizado para TensorRT-LLM | Apache-2.0 | Hugging Face |

Frente al BF16, este checkpoint sacrifica entre 5 y 8 puntos de precisión en razonamiento a cambio de reducir el peso de los pesos a 4 bits. Frente a la versión NVFP4 de NVIDIA, la diferencia clave es el stack de inferencia: NVIDIA apunta a TensorRT-LLM con contexto de 131K, mientras que este checkpoint está atado a vLLM y a un `max_model_len` de 34.816 en el ejemplo. No hay datos de benchmarks publicados para la versión de NVIDIA en la información disponible, por lo que no es posible comparar precisión directamente.

## Limitaciones y advertencias

- Degradación medible de precisión: 8,06 puntos menos en AIME-120 y 5,55 en GPQA Diamond respecto al BF16. No es un reemplazo sin coste del modelo original para tareas de razonamiento.
- Validación restringida: solo se ha probado con vLLM 0.32.0, PyTorch 2.13.0, Transformers 5.17.0, compressed-tensors 0.17.0 y GPUs Blackwell. El propio autor indica que otras combinaciones no han sido validadas.
- El ejemplo de carga "no ha sido re-ejecutado desde el repositorio subido", según la model card: existe riesgo de que la ruta de carga no funcione tal cual.
- Idiomas soportados no documentados en esta ficha; hereda los del Qwen3-8B base, pero no hay verificación específica para el checkpoint cuantizado.
- Riesgo de alucinación: inherente al modelo base y potencialmente amplificado por la cuantización agresiva; no hay evaluación específica de factualidad.
- Sesgos: no documentados para este checkpoint; se heredan los del Qwen3-8B, no auditados aquí.
- Contexto limitado en la práctica a 34.816 tokens según la configuración de ejemplo, muy por debajo de los 131K del modelo base, aunque esto puede ser una elección del experimento y no un límite del checkpoint.
- Licencia Apache-2.0 permite uso comercial, pero al ser un artefacto de investigación con cero descargas y sin validación externa, no es recomendable para producción sin una evaluación propia.
- No compatible con llama.cpp, Ollama ni herramientas que esperen GGUF; requiere el stack compressed-tensors.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Minguinho-zeze/Qwen3-8B-NVFP4-AWQ-WikiText2
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Proyecto de investigación lowbit-reasoning-ptq: https://github.com/minguinho26/lowbit-reasoning-ptq
- Commit del experimento: https://github.com/minguinho26/lowbit-reasoning-ptq/tree/10509d06fd76ae1bcdd0395965d82aebd95eb2f1
- Informes de evaluación: https://github.com/minguinho26/lowbit-reasoning-ptq/tree/main/reports/qwen3-8b-20261107
- Configuración del motor de inferencia: https://github.com/minguinho26/lowbit-reasoning-ptq/blob/10509d06fd76ae1bcdd0395965d82aebd95eb2f1/src/engine.py
- Referencia externa sobre Qwen3-8B-NVFP4 de NVIDIA: https://dev.co/ai/llms/qwen3-8b-nvfp4
