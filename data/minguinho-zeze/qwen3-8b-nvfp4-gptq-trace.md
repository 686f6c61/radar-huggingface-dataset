# Minguinho-zeze/Qwen3-8B-NVFP4-GPTQ-Trace

## Resumen

Qwen3-8B-NVFP4-GPTQ-Trace es un checkpoint de Qwen3-8B cuantizado en formato NVFP4 (FP4 de NVIDIA) mediante GPTQ, publicado por el usuario Minguinho-zeze como parte del proyecto experimental lowbit-reasoning-ptq. No se trata de un modelo entrenado desde cero: es una compresión post-entrenamiento (PTQ) del Qwen3-8B original de Alibaba, con pesos en NVFP4 y activaciones de entrada también en FP4 (esquema W4A4) con grupo de tamaño 16. El objetivo del release es medir cuánta precisión en razonamiento se pierde al bajar a 4 bits sobre trazas de razonamiento matemático.

El checkpoint conserva la arquitectura transformer decoder-only del Qwen3-8B base, con 8.190.735.360 parámetros totales y una ventana de contexto que el autor configura hasta 34.816 tokens en vLLM. La fracción de parámetros cuantizados es del 84,8 %; las capas de embedding, normalización y `lm_head` se mantienen sin cuantizar. El repositorio ocupa 6,4 GB en safetensors y está pensado para ejecutarse con vLLM sobre GPUs Blackwell.

Su relevancia es doble: por un lado, demuestra que un modelo de 8B puede servirse en FP4 con una pérdida moderada de precisión en tareas de razonamiento (AIME-120 y GPQA Diamond); por otro, documenta de forma reproducible el recipe de cuantización, los metadatos y las métricas por semilla, algo poco habitual en releases de cuantización de la comunidad. La licencia es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), cuantizado con compressed-tensors |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 34.816 tokens en la configuración de ejemplo de vLLM (contexto nativo del base no indicado en la información) |
| Tipos de cuantizacion | NVFP4 en pesos y activaciones de entrada (W4A4), grupo de 16, algoritmo GPTQ; embedding, norm y lm_head sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con formato compressed-tensors (no GGUF ni AutoAWQ) |

## Arquitectura y entrenamiento

El modelo base es Qwen3-8B, un transformer auto-regresivo decoder-only de Alibaba. Sobre él se aplica una cuantización post-entrenamiento GPTQ a NVFP4: pesos en FP4 y activaciones de entrada en FP4 (W4A4) con tamaño de grupo 16. Las capas de embedding, normalización y `lm_head` quedan en precisión completa, y la fracción de parámetros efectivamente cuantizados es del 84,800291 %. No se realizó entrenamiento adicional tras la cuantización.

La calibración se hizo con trazas de razonamiento generadas por el propio Qwen3-8B en BF16 a partir de problemas de NuminaMath-1.5, excluyendo la fuente amc_aime y filtrando solapamientos de n-gramas de 13 palabras con las preguntas de evaluación. Se usaron 128 ventanas de 2.048 tokens con semilla 0. El entorno de referencia es vLLM 0.32.0, PyTorch 2.13.0, Transformers 5.17.0 y compressed-tensors 0.17.0 sobre GPUs Blackwell (RTX 5090 y RTX PRO 4500); para INT2 se empleó humming-kernels 0.1.17, aunque este checkpoint concreto es NVFP4.

## Capacidades

- Generación de texto y conversación multi-turno, con plantilla de chat de Qwen3.
- Razonamiento explícito en modo thinking (`enable_thinking=True`), evaluado con presupuesto de salida de 32.768 tokens.
- Razonamiento matemático de competición (entrenamiento de calibración basado en NuminaMath-1.5 y evaluación sobre AIME).
- Razonamiento científico de nivel graduate (evaluación sobre GPQA Diamond).
- Generación de código y matemáticas heredadas del modelo base Qwen3-8B (no medidas en este release).
- Soporte de tool calling y function calling: heredado del base, no verificado en este checkpoint.
- Capacidades multilingües: heredadas del base, no documentadas en este release.
- No incluye visión ni audio.

## Casos de uso

- Servicio de razonamiento matemático de bajo coste: el checkpoint permite desplegar un modelo de 8B en FP4 con una pérdida de ~4 puntos en AIME-120 respecto a BF16, adecuado para asistentes de resolución de problemas donde el coste por token importa más que la precisión máxima.
- Evaluación de pipelines de cuantización: útil como referencia reproducible para comparar GPTQ NVFP4 frente a otros esquemas (AWQ, INT8, FP8) sobre el mismo base y el mismo protocolo de evaluación.
- Despliegue en GPUs Blackwell con vLLM: pensado para RTX 5090 y RTX PRO 4500, permite servir Qwen3-8B con menor huella de memoria que BF16 manteniendo el modo thinking.
- Investigación en razonamiento de bajo bit: el recipe, los metadatos y las métricas por semilla permiten estudiar la degradación de la cadena de pensamiento al cuantizar activaciones a 4 bits.
- Generación de trazas de razonamiento sintéticas: puede emplearse para producir cadenas de pensamiento en dominios matemáticos y científicos, con la advertencia de que la precisión es inferior al base.
- Prototipado de agentes con contexto largo: la configuración de ejemplo admite hasta 34.816 tokens, suficiente para tareas multi-paso con historial extenso, aunque el soporte de tool calling no está validado en este release.

## Benchmarks y rendimiento

Precisión en porcentaje, media sobre semillas 0, 1 y 2. Cada semilla evalúa 120 preguntas de AIME y 198 de GPQA Diamond. Modo thinking activado, temperatura 0,6, top-p 0,95, top-k desactivado, presupuesto de salida de 32.768 tokens. Las respuestas truncadas se puntúan como incorrectas. Ejecutado en RTX 5090 y RTX PRO 4500 Blackwell.

| Modelo | AIME-120 | GPQA Diamond |
|---|---:|---:|
| Qwen3-8B BF16 | 71,39 | 61,11 |
| Este checkpoint (NVFP4 W4A4 GPTQ) | 67,22 | 57,24 |

Estas cifras describen el protocolo del autor y no son puntuaciones oficiales de Qwen. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 6,4 GB en safetensors; con overhead de activaciones, KV cache en BF16 y contexto de 34.816 tokens, se recomienda al menos 16-24 GB de VRAM.
- GPUs validadas por el autor: RTX 5090 y RTX PRO 4500 Blackwell.
- El autor indica explícitamente que otras GPUs, kernels y combinaciones de paquetes no han sido validadas por este release.
- Despliegue: vLLM 0.32.0 con compressed-tensors 0.17.0; no es compatible con llama.cpp, Ollama ni TGI en el formato publicado (no hay GGUF).
- Configuración de referencia: `max_model_len=34816`, `gpu_memory_utilization=0.90`, `enable_prefix_caching=False`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint | 8,19 B | hasta 34.816 en config vLLM | NVFP4 W4A4 GPTQ | Apache-2.0 | Hugging Face, vLLM |
| Qwen3-8B BF16 (base) | 8,19 B | contexto nativo de Qwen3-8B | BF16 | Apache-2.0 | Hugging Face |
| nvidia/Qwen3-8B-NVFP4 | 8,19 B | no disponible | NVFP4 con TensorRT Model Optimizer | Apache-2.0 (uso comercial y no comercial) | Hugging Face |

La diferencia principal frente al checkpoint de NVIDIA es el algoritmo y el pipeline de cuantización: NVIDIA usa TensorRT Model Optimizer, mientras que este release emplea GPTQ con calibración sobre trazas de razonamiento y publica métricas detalladas por semilla. No se dispone de datos de benchmarks del checkpoint de NVIDIA en la información proporcionada para comparar numéricamente.

## Limitaciones y advertencias

- Pérdida de precisión medible: 4,17 puntos en AIME-120 y 3,87 puntos en GPQA Diamond respecto al BF16, con el protocolo del autor.
- Solo validado en GPUs Blackwell con versiones concretas de vLLM, PyTorch, Transformers y compressed-tensors; otros entornos pueden fallar o dar resultados distintos.
- No hay formato GGUF ni AutoAWQ, por lo que no es desplegable directamente en llama.cpp u Ollama.
- El soporte de tool calling, agentes y multilingüismo no está verificado en este checkpoint, aunque se herede del base.
- Riesgo de alucinación y sesgos: no documentados específicamente para este release; se heredan los del Qwen3-8B base.
- El ejemplo de carga del README no se ha reejecutado desde el repositorio subido, según indica el propio autor.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria independiente.
- Uso comercial permitido por Apache-2.0, pero conviene revisar la licencia y las condiciones del modelo base Qwen3-8B.

## Enlaces

- Hugging Face: https://huggingface.co/Minguinho-zeze/Qwen3-8B-NVFP4-GPTQ-Trace
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio del proyecto: https://github.com/minguinho26/lowbit-reasoning-ptq
- Commit del experimento: https://github.com/minguinho26/lowbit-reasoning-ptq/tree/10509d06fd76ae1bcdd0395965d82aebd95eb2f1
- Informes de métricas: https://github.com/minguinho26/lowbit-reasoning-ptq/tree/main/reports/qwen3-8b-20261107
- Configuración del motor: https://github.com/minguinho26/lowbit-reasoning-ptq/blob/10509d06fd76ae1bcdd0395965d82aebd95eb2f1/src/engine.py
- Checkpoint NVFP4 de NVIDIA: https://huggingface.co/nvidia/Qwen3-8B-NVFP4
