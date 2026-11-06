# axteam/Nanbeige4.3-33B-NVFP4

## Resumen

Nanbeige4.3-33B-NVFP4 es una cuantización de 4 bits del modelo denso Nanbeige/Nanbeige4.3-33B, publicada por el usuario axteam. El modelo original sigue una arquitectura Llama de 52 capas y solo texto; esta versión aplica cuantización post-entrenamiento NVFP4 (W4A4, FP4 E2M1) mediante el formato compressed-tensors, pensada específicamente para servir el modelo con vLLM en hardware Blackwell. El resultado ocupa 22,1 GB en disco, lo que permite desplegarlo en una sola GPU de gama alta con capacidad FP4.

La relevancia de esta ficha es doble. Por un lado, documenta una ruta práctica para reducir el coste de memoria de un modelo de 33B (19.676.626.648 parámetros reales según safetensors) en entornos de inferencia. Por otro, advierte de un compromiso de calidad medido y nada desdeñable: la perplejidad sube un 11,1% respecto al original en BF16 y la coincidencia top-1 baja al 90,2%. El propio autor recomienda preferir variantes de 8 bits (FP8 o AWQ INT8) si la fidelidad es crítica.

La licencia es Apache 2.0, heredada del modelo base, y el checkpoint es compatible con el servidor OpenAI de vLLM. No se han publicado datos sobre idiomas soportados ni sobre benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, arquitectura Llama, 52 capas, solo texto |
| Parametros totales | 19.676.626.648 (según safetensors) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada; el ejemplo de despliegue usa `--max-model-len 32768` |
| Tipos de cuantizacion | NVFP4 (W4A4, FP4 E2M1) con grupo 16 y escala FP8; embeddings, LM head y RMSNorms en BF16; calibración con 256 muestras |
| Idiomas soportados | No disponible (la model card usa ejemplos en coreano e inglés, pero no declara lista oficial) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con compressed-tensors `nvfp4-pack-quantized` |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de tipo Llama con 52 capas, orientado exclusivamente a texto. Esta versión no introduce cambios arquitectónicos: solo cuantiza las proyecciones de atención y MLP a FP4, manteniendo en BF16 los embeddings de tokens, la LM head y todas las RMSNorms. La cuantización es post-entrenamiento (PTQ), sin reentrenamiento ni ajuste fino posterior, y conserva el tokenizer y el `chat_template` del original, incluido el modo de razonamiento (thinking) activado por defecto.

El esquema NVFP4 combina pesos y activaciones en FP4 (E2M1) con escalas FP8 y agrupación de 16 elementos, lo que aprovecha los tensor cores FP4 de las GPU Blackwell. La calibración se realizó con 256 muestras. No se detallan en la información disponible la composición del dataset de entrenamiento del modelo base, el número de tokens, ni si hubo fases de RLHF o DPO.

## Capacidades

- Generación de texto conversacional en formato chat, con plantilla compatible con el modelo original.
- Modo de razonamiento (thinking) activado por defecto en el chat template; se puede desactivar con `chat_template_kwargs={"enable_thinking": False}`.
- Inferencia offline en Python mediante vLLM (`LLM.chat`) y servidor compatible con la API OpenAI (`/v1/chat/completions`).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no declaradas oficialmente; los ejemplos de la model card están en coreano e inglés.
- Visión y audio: no soportados (modelo solo texto).
- Reducción opcional de memoria de caché KV a FP8 en tiempo de servicio (`--kv-cache-dtype fp8`).

## Casos de uso

- Servicio de chat en producción con vLLM: el checkpoint está empaquetado para `vllm serve` y expone una API compatible con OpenAI, lo que permite integrarlo como backend de un chatbot sin adaptadores adicionales.
- Despliegue en una sola GPU Blackwell: con 22,1 GB de pesos, cabe en B200, GB200, B300, RTX 50xx o RTX PRO 6000, evitando la necesidad de tensor parallelism para el modelo en sí (aunque el KV cache crece con el contexto y las peticiones concurrentes).
- Prototipado e investigación de cuantización: sirve como referencia práctica para medir el impacto de NVFP4 frente al BF16 original (perplejidad y acuerdo top-1) en un modelo de 33B.
- Evaluación de pipelines de razonamiento: el modo thinking por defecto permite experimentar con cadenas de razonamiento y comparar su efecto desactivándolo por petición.
- Inferencia por lotes offline: el ejemplo en Python con `LLM.chat` y `SamplingParams` encaja en tareas de generación masiva de texto donde la latencia no es el criterio principal.
- Entornos con restricciones de memoria y hardware Turing-Hopper: vLLM degrada automáticamente a FP4 solo de pesos, lo que permite usar el modelo en A100 o H100 aceptando menor velocidad.
- Base para fine-tuning o destilación sobre un checkpoint compacto: al ser Apache 2.0 y estar en safetensors, puede reutilizarse como punto de partida, aunque la cuantización FP4 complica el ajuste directo.

## Benchmarks y rendimiento

La model card solo publica métricas de fidelidad frente al BF16 original en un conjunto interno mixto inglés/coreano de 100 prompts. No hay resultados de MMLU, HumanEval, GSM8K ni comparativas con otros modelos.

| Metrica | Este modelo (NVFP4) | Original BF16 |
|---|---|---|
| Perplejidad (menor es mejor) | 1,3594 | 1,2232 (+11,1%) |
| Acuerdo top-1 en siguiente token | 90,2% | 99,1% |

## Requisitos de hardware

- VRAM para pesos: 22,1 GB en FP4. Hay que sumar el KV cache (crece con longitud de contexto y peticiones concurrentes) y varios GB para activaciones y CUDA graphs.
- GPU con soporte FP4 completo (W4A4): B200/GB200 (sm100), B300 (sm103), RTX 50xx y RTX PRO 6000 (sm120).
- GPU Turing-Hopper (sm75–90): vLLM cae a FP4 solo de pesos, con menor rendimiento y aviso en logs.
- V100 (sm70): no soportado.
- Tensor parallelism: usar `--tensor-parallel-size N` cuando los pesos no quepan en una sola GPU.
- Entorno de ejecución: vLLM 0.32 con Python 3.11–3.14, torch 2.13 (build CUDA 13.0, requiere driver NVIDIA con soporte CUDA 13), transformers ≥5.16.1,<5.20 y compressed-tensors 0.17.0 (fijado por vLLM; no actualizar por separado).
- Alternativa sin vLLM: transformers ≥4.56.0 y compressed-tensors ≥0.15.0; el autor indica que no lo ha probado con Nanbeige.
- `trust_remote_code`: no necesario.
- Latencia y throughput: no disponibles. El autor solo confirma que la ejecución se probó en B200.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| axteam/Nanbeige4.3-33B-NVFP4 | 19,68B | No disponible (ejemplo con 32.768) | NVFP4 W4A4 | Apache 2.0 | Hugging Face, vLLM |
| Nanbeige/Nanbeige4.3-33B (original) | 19,68B | No disponible | BF16 | Apache 2.0 | Hugging Face |
| Alternativas de 8 bits (FP8/AWQ INT8) del mismo base | 19,68B | No disponible | FP8 / INT8 | Apache 2.0 | No disponible en la información proporcionada |

No se dispone de datos de rendimiento comparado con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Degradación medible por cuantización: +11,1% de perplejidad y 90,2% de acuerdo top-1 frente al BF16. El autor recomienda explícitamente 8 bits (FP8 o AWQ INT8) cuando la fidelidad importa.
- Dependencia de hardware Blackwell para obtener la velocidad FP4 completa; en Turing-Hopper el rendimiento cae y en V100 no funciona.
- Requiere versiones muy concretas de vLLM, torch, transformers y compressed-tensors; mezclar versiones puede romper la carga del checkpoint.
- El KV cache en BF16 por defecto consume memoria adicional en contextos largos; se mitiga con `--kv-cache-dtype fp8`, a costa de precisión.
- Idiomas soportados no declarados oficialmente; el comportamiento fuera de inglés y coreano no está documentado.
- Riesgo de alucinación y sesgos del modelo base: no cuantificados en la información disponible.
- El modo thinking está activado por defecto; en producción conviene desactivarlo si no se necesita para controlar latencia y longitud de salida.
- Licencia Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base; conviene revisar la model card original.
- Repositorio con muy poca tracción (70 descargas, 0 likes) y sin benchmarks estándar publicados; tratarlo como artefacto experimental.

## Enlaces

- Modelo cuantizado en Hugging Face: https://huggingface.co/axteam/Nanbeige4.3-33B-NVFP4
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Documentación de vLLM: https://docs.vllm.ai
- compressed-tensors: https://github.com/neuralmagic/compressed-tensors
