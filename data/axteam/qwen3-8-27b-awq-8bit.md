# axteam/Qwen3.8-27B-AWQ-8bit

## Resumen

Qwen3.8-27B-AWQ-8bit es una versión cuantizada a 8 bits (AWQ INT8, esquema W8A16) del modelo multimodal Qwen3.8-27B de Qwen, realizada por el usuario axteam y publicada en HuggingFace el 27 de octubre de 2026. El objetivo de esta variante es servir el modelo de forma eficiente con vLLM, reduciendo a la mitad el peso en memoria de los pesos lineales respecto a BF16 sin necesidad de reentrenamiento, ya que se trata de una cuantización post-entrenamiento (PTQ).

El modelo base es un transformer híbrido (atención lineal más atención completa), denso, multimodal (acepta imagen y texto) y con cabeza de predicción multi-token (MTP). El pipeline asignado es image-text-to-text, lo que indica soporte de entrada visual junto con generación conversacional de texto.

Su relevancia práctica radica en que permite desplegar un modelo de ~27.800 millones de parámetros en infraestructura más modesta: ocupa unos 30,5 GB en disco (32,7 GB el repositorio completo), mantiene una fidelidad casi idéntica al original BF16 (perplexity 1,3584 frente a 1,3586, con un 99,1 % de acuerdo top-1) y conserva el chat template, el tokenizer y el thinking mode del original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención lineal + atención completa), denso, multimodal, con cabeza MTP |
| Parametros totales | 27.781.427.952 (dato real de safetensors) |
| Parametros activos | no disponible (arquitectura densa, no MoE) |
| Longitud de contexto | no disponible (los ejemplos de la model card usan `--max-model-len 32768`) |
| Tipos de cuantizacion | AWQ INT8 W8A16 (pesos INT8 simétricos, group size 32, activaciones BF16), formato compressed-tensors `pack-quantized` |
| Idiomas soportados | no disponible (el conjunto de calibración es un corpus mixto con predominio de coreano; los ejemplos usan inglés y coreano) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors pack-quantized) |

## Arquitectura y entrenamiento

La arquitectura del modelo base combina capas de atención lineal (con componentes no lineales conv1d, A_log y dt_bias típicos de modelos tipo SSM/attention lineal) con capas de atención completa, un diseño híbrido que suele reducir el coste de la KV-cache en secuencias largas. Es un modelo denso (no MoE), multimodal con torre de visión y proyector, e incorpora una cabeza de predicción multi-token (MTP), que habilita decodificación especulativa para acelerar la inferencia.

En cuanto al entrenamiento del modelo base, la información disponible no detalla número de tokens ni composición del dataset, y esta cuantización no implica ningún reentrenamiento: es PTQ mediante AWQ, que usa un pequeño conjunto de calibración (256 muestras de un corpus mixto con predominio de coreano, sin cálculo de gradientes) para proteger los canales de pesos salientes antes del redondeo. Se mantienen en BF16 la torre de visión y el proyector, la cabeza MTP, todas las RMSNorm, los embeddings de tokens, el LM head y las partes no lineales de la atención lineal, con el fin de preservar la calidad.

## Capacidades

- Generación de texto conversacional, con chat template idéntico al original y thinking mode activado por defecto (desactivable con `chat_template_kwargs={"enable_thinking": False}`).
- Entrada multimodal: acepta imágenes junto con texto (pipeline image-text-to-text), mediante mensajes de tipo `image_url` en vLLM.
- Predicción multi-token (cabeza MTP) para acelerar la decodificación.
- Arquitectura híbrida con atención lineal, favorable para contextos largos y menor presión de KV-cache.
- Compatibilidad con servidores OpenAI-compatible vía vLLM, incluyendo inferencia offline en Python.
- Soporte de tool calling, agentes o capacidades específicas de razonamiento agéntico: no disponible en la información proporcionada.

## Casos de uso

- Servido autoalojado con API OpenAI-compatible: el formato compressed-tensors está diseñado para vLLM, por lo que es adecuado para montar un endpoint propio (`vllm serve`) sin depender de proveedores externos.
- Descripción y análisis de imágenes: al ser multimodal, puede integrarse en flujos que combinen capturas, documentos escaneados o gráficos con instrucciones en lenguaje natural.
- Chatbots con thinking mode: el modo de razonamiento activado por defecto permite tareas que se benefician de razonamiento paso a paso, y puede desactivarse para respuestas rápidas.
- Despliegue en infraestructura de memoria limitada: con ~30,5 GB de pesos INT8 cabe en una sola GPU de 48 GB (A6000, L40S, A40), algo inviable con el original BF16 en precisión completa.
- Servido de texto puro con ahorro de memoria: pasando `--limit-mm-per-prompt '{"image": 0, "video": 0}'` se libera el presupuesto de memoria del encoder de visión cuando no se necesita entrada visual.
- Contextos largos con KV-cache en FP8: la opción `--kv-cache-dtype fp8` reduce aproximadamente a la mitad la memoria de la KV-cache, útil para lotes grandes o secuencias extensas.
- Verificación de calidad en despliegues sensibles: la cuantización conserva el comportamiento del original (99,1 % de acuerdo top-1), adecuada para migrar servicios existentes de BF16 a INT8 sin cambios de comportamiento apreciables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card incluye una evaluación de fidelidad respecto al original BF16, no de rendimiento en tareas absolutas:

| Metrica | Qwen3.8-27B-AWQ-8bit | Original BF16 |
|---|---|---|
| Perplexity (menor = más cercano) | 1,3584 | 1,3586 |
| Acuerdo top-1 en siguiente token | 99,1 % | 99,4 % |

Medición interna sobre 100 prompts en inglés y coreano, con respuestas greedy bajo el mismo harness.

## Requisitos de hardware

- VRAM para inferencia: los pesos ocupan ~30,5 GB en disco; se recomienda una GPU con al menos 40-48 GB de VRAM para dejar margen a la KV-cache, el encoder de visión y las activaciones. Con `--limit-mm-per-prompt '{"image": 0, "video": 0}'` y `--kv-cache-dtype fp8` se reduce el consumo adicional.
- GPU recomendadas: A100 40/80 GB, H100, A6000, L40S o A40 (48 GB). No se especifican recomendaciones oficiales de hardware en la model card.
- Consumer GPU: no cabe en GPUs domésticas habituales de 16-24 GB (RTX 4090) con esta cuantización; sería necesaria una cuantización más agresiva (4 bits), no disponible en este repositorio.
- Despliegue: vLLM es el runtime objetivo (formato compressed-tensors); no hay menciones a soporte en llama.cpp, Ollama o TGI. La librería declarada es transformers.
- Latencia y throughput: no disponibles; la cabeza MTP sugiere soporte de decodificación especulativa, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Multimodal | Licencia | Runtime objetivo |
|---|---|---|---|---|---|
| axteam/Qwen3.8-27B-AWQ-8bit | 27,8 B | AWQ INT8 (W8A16) | Sí (imagen+texto) | Apache-2.0 | vLLM |
| Qwen/Qwen3.8-27B (original) | 27,8 B | BF16 | Sí (imagen+texto) | Apache-2.0 | vLLM, transformers |
| Qwen/Qwen3.8-27B-FP8 (si existiera variante oficial) | no disponible | no disponible | no disponible | no disponible | no disponible |

Nota: no hay datos públicos suficientes para comparar con otros modelos de la misma clase en rendimiento; la comparativa se limita al modelo base del que deriva.

## Limitaciones y advertencias

- La calibración AWQ se realizó con un corpus mixto con predominio de coreano (256 muestras), lo que podría afectar ligeramente la fidelidad en otros idiomas; no hay mediciones publicadas por idioma.
- La evaluación de fidelidad se hizo sobre un conjunto interno de 100 prompts en inglés y coreano; el 99,1 % de acuerdo top-1 implica que aproximadamente 1 de cada 11 tokens puede diferir del original en muestreo greedy.
- Sesgos conocidos, riesgo de alucinación y limitaciones de idioma: no disponibles en la información proporcionada; heredan del modelo base Qwen3.8-27B.
- Longitud de contexto máxima del modelo base: no especificada; los ejemplos usan 32768 tokens, pero no está claro si es el límite del modelo.
- La licencia es Apache-2.0, sin restricciones de uso comercial, aunque los derechos sobre los pesos originales, el tokenizer y el chat template pertenecen al equipo de Qwen.
- Solo hay soporte documentado para vLLM; el uso con otras librerías (llama.cpp, Ollama, TGI) no está documentado y puede no funcionar con el formato compressed-tensors.
- Repositorio con muy poca tracción pública (37 descargas, 1 like), sin auditoría comunitaria amplia; conviene validar en producción contra el original BF16.

## Enlaces

- Modelo cuantizado: https://huggingface.co/axteam/Qwen3.8-27B-AWQ-8bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-27B/blob/main/LICENSE
