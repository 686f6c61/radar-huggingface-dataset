# axteam/MiniCPM5-2B-NVFP4

## Resumen

MiniCPM5-2B-NVFP4 es una versión cuantizada en 4 bits (NVFP4, W4A4) del modelo openbmb/MiniCPM5-2B, creada por axteam para servir el modelo con vLLM en hardware con soporte de FP4, como las GPU NVIDIA Blackwell con tensor cores FP4. El modelo base es un LLM denso de 2.516 millones de parámetros con arquitectura tipo Llama, orientado a generación de texto conversacional y con modo de razonamiento (thinking) activado por defecto en su plantilla de chat.

La cuantización es post-training (sin reentrenamiento) y conserva en BF16 los embeddings de tokens, la cabeza LM y todas las normalizaciones RMS. El repo ocupa unos 2,2 GB en disco y usa el formato compressed-tensors `nvfp4-pack-quantized`, integrado de forma nativa con vLLM.

Es relevante como caso práctico de cuantización FP4 extrema en modelos pequeños: la model card incluye mediciones reales de fidelidad frente al original BF16 que muestran una degradación notable (perplexity un 34,1 % peor y solo un 79,1 % de acuerdo top-1), por lo que el propio autor recomienda las variantes de 8 bits (FP8 o AWQ INT8) cuando la calidad sea prioritaria. Aun así, resulta útil para servir con máxima densidad de memoria o como referencia para evaluar el impacto del formato NVFP4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, arquitectura tipo Llama, solo texto |
| Parametros totales | 2.516.756.480 (~2,52 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (valor usado en los ejemplos de vLLM; máximo oficial del modelo base no disponible) |
| Tipos de cuantizacion | NVFP4 (W4A4): pesos FP4 E2M1 con grupos de 16 y escalas FP8, activaciones FP4; embeddings, LM head y RMSNorm en BF16 |
| Idiomas soportados | no disponible (la evaluación interna usa inglés y coreano) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors `nvfp4-pack-quantized`) |

## Arquitectura y entrenamiento

El modelo base, MiniCPM5-2B de OpenBMB, es un transformer denso con arquitectura tipo Llama (RMSNorm, embeddings y LM head conservados en BF16 en esta versión). No es un modelo MoE: todos los parámetros se activan en cada pasada. Esta ficha corresponde a una cuantización post-training (PTQ) sin reentrenamiento, realizada por axteam con el esquema NVFP4: pesos en FP4 (formato E2M1) agrupados en bloques de 16 con escalas en FP8, y activaciones también en FP4 (W4A4). El esquema está diseñado para aprovechar los tensor cores FP4 de las GPU NVIDIA Blackwell.

Sobre el entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO) no hay datos disponibles en la información proporcionada. La cuantización se calibró con 256 muestras. El tokenizer y la plantilla de chat son idénticos a los del original, e incluyen un modo de thinking activado por defecto que puede desactivarse mediante `chat_template_kwargs={"enable_thinking": False}`.

## Capacidades

- Generación de texto conversacional mediante el pipeline text-generation, con plantilla de chat heredada del modelo base.
- Modo de razonamiento (thinking) activado por defecto en la plantilla de chat, desactivable en tiempo de ejecución.
- Despliegue como servidor compatible con la API de OpenAI a través de vLLM.
- Inferencia offline en Python mediante la API `LLM.chat()` de vLLM.
- Soporte de KV cache en FP8 como opción de ejecución para reducir memoria en contextos largos o batches grandes.
- Capacidades de tool calling, agentes, visión o audio: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles explícitamente; la evaluación interna del autor se realizó sobre un conjunto mixto de inglés y coreano, lo que sugiere cierto soporte de ambos idiomas.

## Casos de uso

- Servido de alta densidad en GPU Blackwell: el formato NVFP4 (W4A4) permite ejecutar el modelo con unos 2 GB de pesos, dejando la mayor parte de la VRAM libre para KV cache y batches concurrentes en un servidor vLLM.
- Experimentación con cuantización FP4: útil como referencia para medir el impacto real del esquema NVFP4 frente a BF16 o variantes de 8 bits, gracias a las métricas de fidelidad publicadas en la model card.
- Prototipado rápido de asistentes conversacionales: el despliegue con `vllm serve` expone un endpoint compatible con OpenAI, lo que permite integrarlo en clientes y frameworks existentes sin cambios de código.
- Razonamiento paso a paso en local: el modo thinking activado por defecto permite obtener respuestas con cadena de razonamiento en tareas de lógica o matemáticas sencillas, con la opción de desactivarlo para respuestas directas.
- Reducción de coste por token en despliegues de bajo tráfico: al ser un modelo de ~2,5 B de parámetros, su latencia por token es baja y puede ejecutarse en una única GPU de consumo o de gama media de servidor.
- Procesamiento por lotes offline: la API de vLLM permite lanzar inferencias por lotes (por ejemplo, clasificación o resumen masivo de textos) aprovechando el tamaño reducido de los pesos en FP4.
- Pruebas de integración en CI/CD: su pequeño tamaño y arranque rápido con vLLM lo hacen adecuado para tests automatizados de pipelines que consumen LLMs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card incluye una evaluación interna de fidelidad frente al original BF16 sobre un conjunto mixto inglés/coreano de 100 prompts:

| Metric | MiniCPM5-2B-NVFP4 | Original BF16 |
|---|---|---|
| Perplexity (menor = más fiel) | 2,1439 | 1,5988 (+34,1 % de degradación) |
| Acuerdo top-1 en siguiente token | 79,1 % | 98,9 % |

El propio autor advierte de una degradación notable por la cuantización a 4 bits y recomienda preferir las builds de 8 bits (FP8 o AWQ INT8).

## Requisitos de hardware

- VRAM estimada para inferencia: unos 2,0-2,2 GB solo de pesos; con contexto de 32.768 tokens y KV cache en BF16, la VRAM total dependerá del batch, aunque un nodo con 8-12 GB de VRAM debería ser suficiente para uso ligero. Con `--kv-cache-dtype fp8` la memoria de KV cache se reduce aproximadamente a la mitad.
- GPU recomendadas: las GPU NVIDIA Blackwell con tensor cores FP4 (por ejemplo, la serie RTX 50xx o B100/B200) son el objetivo natural del esquema NVFP4 W4A4; en GPUs sin soporte nativo de FP4 el rendimiento puede degradarse o no estar soportado por vLLM.
- Consumer GPU: por tamaño de pesos, cabe en GPUs de consumo de 8 GB o más (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090), siempre que vLLM soporte el formato compressed-tensors NVFP4 en la GPU disponible.
- Opciones de despliegue: vLLM es el runtime documentado (`vllm serve axteam/MiniCPM5-2B-NVFP4 --max-model-len 32768`). No hay soporte documentado para llama.cpp, Ollama o TGI (el formato `nvfp4-pack-quantized` no es GGUF).
- Latencia y throughput: no disponibles como mediciones concretas; al ser un modelo denso de ~2,5 B con pesos de 4 bits, se espera latencia baja por token y buen throughput por GB de VRAM respecto al original BF16.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| axteam/MiniCPM5-2B-NVFP4 | 2,52 B | NVFP4 (W4A4) | 32.768 (en ejemplos) | Apache-2.0 | Degradación medida frente a BF16; pensado para vLLM y Blackwell |
| openbmb/MiniCPM5-2B (base) | 2,52 B | BF16 | no disponible | Apache-2.0 | Referencia de calidad máxima; mayor huella de memoria |
| Variantes 8 bits (FP8 / AWQ INT8) de MiniCPM5-2B | 2,52 B | FP8 / INT8 | no disponible | Apache-2.0 | Recomendadas por el propio autor ante la degradación del FP4 |

## Limitaciones y advertencias

- Degradación medible por la cuantización: perplexity un 34,1 % peor que el BF16 y solo un 79,1 % de acuerdo top-1; el autor recomienda explícitamente las builds de 8 bits para cargas sensibles a la calidad.
- El esquema W4A4 cuantiza también las activaciones, lo que puede amplificar errores en generaciones largas o tareas de razonamiento exigentes.
- Riesgo de alucinación: no cuantificado para este modelo; asúmase el riesgo inherente de un LLM de ~2,5 B, posiblemente agravado por la pérdida de precisión.
- Idiomas: no hay documentación de idiomas soportados; la evaluación interna cubre inglés y coreano, por lo que el rendimiento en castellano no está verificado.
- Compatibilidad de hardware: NVFP4 W4A4 está orientado a tensor cores FP4 de NVIDIA Blackwell; en otras GPUs puede no funcionar o hacerlo sin aceleración.
- Restricciones de licencia: Apache-2.0, sin restricciones relevantes para uso comercial; los pesos originales pertenecen a OpenBMB.
- Contexto: los 32.768 tokens corresponden al valor usado en los ejemplos de despliegue; el máximo oficial del modelo base no está disponible en la información proporcionada.
- Sesgos conocidos: no disponibles.

## Enlaces

- Modelo cuantizado: https://huggingface.co/axteam/MiniCPM5-2B-NVFP4
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Paper, blog o repositorio del modelo base: no disponibles en la información proporcionada
