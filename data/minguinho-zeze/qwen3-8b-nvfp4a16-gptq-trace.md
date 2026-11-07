# Minguinho-zeze/Qwen3-8B-NVFP4A16-GPTQ-Trace

## Resumen

Qwen3-8B-NVFP4A16-GPTQ-Trace es un checkpoint cuantizado del modelo Qwen3-8B de Alibaba Qwen, publicado por el usuario Minguinho-zeze como parte del proyecto de investigación lowbit-reasoning-ptq. Se trata de una cuantización post-entrenamiento (PTQ) en formato NVFP4 con activaciones de 16 bits (W4A16) y tamaño de grupo 16, aplicada mediante el algoritmo GPTQ sobre los pesos del modelo base. No se realizó entrenamiento adicional: el objetivo es estudiar el impacto de la cuantización de bajo bit en las capacidades de razonamiento del modelo original.

El checkpoint conserva la arquitectura y el tamaño del Qwen3-8B original (8.190.735.360 parámetros según los safetensors), pero reduce el peso del repositorio a 6,4 GB gracias a la cuantización de aproximadamente el 84,8 % de los parámetros. Las capas de embedding, normalización y `lm_head` se mantienen sin cuantizar. Los pesos se distribuyen en formato compressed-tensors, pensado para su carga en vLLM, no en GGUF ni AutoAWQ.

La relevancia de este checkpoint es fundamentalmente experimental: proporciona datos reproducibles sobre la degradación de precisión al cuantizar a 4 bits (NVFP4) un modelo de razonamiento de 8B, con evaluación en AIME-120 y GPQA Diamond bajo modo thinking. Es útil para investigadores que evalúan técnicas de cuantización de bajo bit en GPUs Blackwell, no como sustituto directo del modelo base en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 34.816 tokens en la configuración de ejemplo (`max_model_len=34816`); contexto nativo del Qwen3-8B base no disponible en la información proporcionada |
| Tipos de cuantizacion | NVFP4 pesos (W4A16), grupo de 16, GPTQ; embedding, normalización y `lm_head` sin cuantizar; KV cache en BF16 durante la evaluación |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors con compressed-tensors (no GGUF, no AutoAWQ) |

## Arquitectura y entrenamiento

El modelo base Qwen3-8B es un transformer decoder-only denso de aproximadamente 8,2 mil millones de parámetros. Este checkpoint no modifica la arquitectura: aplica cuantización post-entrenamiento GPTQ a pesos en NVFP4 con activaciones de 16 bits, tamaño de grupo 16, dejando sin cuantizar las capas de embedding, normalización y `lm_head`. El resultado se empaqueta en el formato compressed-tensors, consumible por vLLM.

El proceso de calibración utilizó trazas de razonamiento generadas por el propio Qwen3-8B en BF16 a partir de problemas de NuminaMath-1.5, excluyendo la fuente amc_aime y filtrando solapamientos de n-gramas de 13 palabras con las preguntas de evaluación. Se emplearon 128 ventanas de 2.048 tokens con semilla 0. No hubo entrenamiento adicional ni ajuste fino: es una cuantización pura de post-entrenamiento. El experimento se ejecutó con vLLM 0.32.0, PyTorch 2.13.0, Transformers 5.17.0 y compressed-tensors 0.17.0 sobre GPUs Blackwell (RTX 5090 y RTX PRO 4500).

## Capacidades

- Generación de texto conversacional y de razonamiento en modo thinking (activado mediante `chat_template_kwargs={"enable_thinking": True}`).
- Razonamiento matemático multi-paso, evaluado sobre AIME-120.
- Razonamiento científico y de conocimiento experto, evaluado sobre GPQA Diamond.
- Generación con presupuesto de salida largo (hasta 32.768 tokens configurados en la evaluación).
- Soporte de tool calling y function calling: no disponible en la información proporcionada para este checkpoint; heredado del modelo base Qwen3-8B, pero no validado en esta cuantización.
- Capacidades de agente y razonamiento multi-paso: no validadas explícitamente en la información proporcionada.
- Capacidades multilingües: no disponible.
- Capacidades de visión o audio: no disponibles (el modelo base Qwen3-8B es solo texto).

## Casos de uso

- Investigación en cuantización de bajo bit: servir como punto de comparación reproducible frente al Qwen3-8B en BF16 para medir la degradación de precisión en tareas de razonamiento (AIME-120, GPQA Diamond) con el protocolo documentado.
- Evaluación de pipelines de razonamiento matemático: desplegar el modelo en vLLM con modo thinking activado para generar cadenas de razonamiento largas sobre problemas de competición, con presupuesto de salida de hasta 32.768 tokens.
- Despliegue con memoria reducida en GPUs Blackwell: el formato NVFP4A16 reduce el peso del repositorio a 6,4 GB, lo que permite cargar el modelo en GPUs consumer de la generación Blackwell con VRAM limitada, a costa de una pérdida de precisión medida de unos 4 puntos en AIME-120.
- Reproducción de experimentos académicos: el repositorio incluye `recipe.yaml`, `quant_meta.json` y `config.json` con los ajustes exactos, lo que permite replicar la cuantización y las evaluaciones con las mismas semillas y versiones de librerías.
- Estudio de calibración con datos sintéticos: analizar el efecto de calibrar con trazas de razonamiento generadas por el propio modelo (auto-destilación) sobre problemas de NuminaMath-1.5, como caso de estudio de sesgo de calibración.
- Benchmarking de kernels NVFP4 en vLLM: comparar el rendimiento y la fidelidad numérica de los kernels de compressed-tensors 0.17.0 en distintas GPUs Blackwell frente a alternativas como INT2 con humming-kernels.

## Benchmarks y rendimiento

Precisión en porcentaje, promediada sobre semillas 0, 1 y 2. Cada semilla evalúa 120 preguntas de AIME y 198 de GPQA Diamond. Modo thinking activado, temperatura 0,6, top-p 0,95, top-k desactivado, presupuesto de salida de 32.768 tokens; las respuestas truncadas se puntúan como incorrectas.

| Modelo | AIME-120 | GPQA Diamond |
|---|---:|---:|
| Qwen3-8B BF16 | 71,39 | 61,11 |
| Este checkpoint (NVFP4A16 GPTQ) | 67,22 | 57,91 |

Las ejecuciones se realizaron en RTX 5090 y RTX PRO 4500 Blackwell. El autor advierte que las diferencias pequeñas no deben atribuirse únicamente al algoritmo de cuantización y que estas puntuaciones describen este protocolo concreto, no son las oficiales de Qwen.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 6,4 GB, por lo que la carga de pesos requiere al menos esa cantidad; con KV cache en BF16 y contexto de 34.816 tokens, el consumo total es considerablemente mayor y depende del número de secuencias concurrentes.
- GPUs recomendadas: el autor validó el checkpoint únicamente en GPUs Blackwell (RTX 5090 y RTX PRO 4500). No se han validado otras GPUs, kernels ni combinaciones de paquetes.
- GPU consumer: cabe en RTX 5090 (Blackwell) según la validación del autor; no hay datos de funcionamiento en GPUs Ampere o Ada.
- Opciones de despliegue: vLLM 0.32.0 con compressed-tensors 0.17.0 y Transformers 5.17.0, con `tokenizer_mode="hf"`, `config_format="hf"` y `generation_config="vllm"`. No es compatible con llama.cpp ni Ollama al no distribuirse en GGUF.
- Latencia y throughput: no disponibles en la información proporcionada; el autor remite a los informes del repositorio para métricas de velocidad.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | AIME-120 | GPQA Diamond | Licencia | Formato |
|---|---|---:|---:|---:|---|---|
| Qwen3-8B BF16 (base) | 8,2B | No disponible | 71,39 | 61,11 | Apache-2.0 | Safetensors BF16 |
| Este checkpoint (NVFP4A16 GPTQ) | 8,19B | 34.816 (config. de ejemplo) | 67,22 | 57,91 | Apache-2.0 | Safetensors compressed-tensors |
| Otras cuantizaciones de Qwen3-8B (INT2 con humming-kernels, mencionada en el experimento) | 8,2B | No disponible | No disponible | No disponible | Apache-2.0 | No disponible |

No se dispone de datos de benchmarks de otras alternativas de cuantización de Qwen3-8B en la información proporcionada.

## Limitaciones y advertencias

- Pérdida de precisión medible frente al modelo base: 4,17 puntos en AIME-120 y 3,20 puntos en GPQA Diamond con el protocolo descrito.
- Validación limitada a GPUs Blackwell (RTX 5090 y RTX PRO 4500) con versiones concretas de vLLM, PyTorch, Transformers y compressed-tensors; otras combinaciones no han sido validadas por el autor.
- El ejemplo de carga del README no se ha vuelto a ejecutar desde el repositorio subido, según indica el propio autor.
- Las diferencias entre semillas corresponden a generaciones repetidas de las mismas preguntas, no a conjuntos de preguntas independientes, lo que limita la interpretación estadística.
- No es un release GGUF ni AutoAWQ: no puede usarse con llama.cpp, Ollama ni herramientas que requieran esos formatos.
- Riesgo de alucinación y sesgos: no documentados específicamente para este checkpoint; se heredan los del modelo base Qwen3-8B, no descritos en la información proporcionada.
- Idiomas soportados: no disponible; no se ha validado el comportamiento multilingüe tras la cuantización.
- Uso comercial: permitido bajo Apache-2.0, con la licencia upstream incluida en `LICENSE`; conviene verificar los términos del modelo base Qwen3-8B.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/Minguinho-zeze/Qwen3-8B-NVFP4A16-GPTQ-Trace
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio del experimento: https://github.com/minguinho26/lowbit-reasoning-ptq
- Commit del experimento: https://github.com/minguinho26/lowbit-reasoning-ptq/tree/10509d06fd76ae1bcdd0395965d82aebd95eb2f1
- Informes de evaluación: https://github.com/minguinho26/lowbit-reasoning-ptq/tree/main/reports/qwen3-8b-20261107
- Configuración del motor: https://github.com/minguinho26/lowbit-reasoning-ptq/blob/10509d06fd76ae1bcdd0395965d82aebd95eb2f1/src/engine.py
- Repositorio oficial de Qwen: https://github.com/QwenLM/Qwen3.8
