# keptn/ornith-1.5-122b-fp8

## Resumen

Ornith 1.5 122B FP8 para radiance es una cuantización en FP8 del modelo multimodal de razonamiento Ornith-1.5-122B, desarrollado por el equipo Ornith (construido sobre Qwen3.5, Apache 2.0) y empaquetado por el usuario keptn para el motor de inferencia radiance sobre tarjetas AMD RDNA4. Se trata de un modelo de mezcla de expertos (MoE) con 122.000 millones de parámetros totales y 10.000 millones activos, capaz de procesar entradas de texto e imagen y con una ventana de contexto de 262.144 tokens.

El problema que resuelve esta ficha concreta es el despliegue eficiente del modelo original en hardware AMD consumer/prosumer: el archivo único `ornith-1.5-122b-fp8.rad` (118,00 GiB) permite ejecutar el modelo en cuatro tarjetas Radeon AI PRO R9700 de 32 GB, algo imposible con los pesos en bf16. La cuantización FP8 (E4M3) con una escala bf16 por bloque de 128×128 mantiene una fidelidad muy alta respecto al original: un KL medio de 0,0118 y un 97,2% de coincidencia en el token superior sobre las 80 preguntas de MT-Bench.

Es relevante ahora porque combina tres elementos poco habituales en el ecosistema abierto: razonamiento con modo thinking, visión (image-text-to-text) y decodificación especulativa nativa mediante la propia cabeza MTP del modelo (3 tokens de borrador), todo bajo licencia MIT y con soporte para ROCm/RDNA4. Con 116 descargas y creado en octubre de 2026, es una pieza nicho pero técnicamente muy cuidada para quienes trabajan con inferencia en AMD.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) con cabeza MTP para decodificación especulativa; base Qwen3.5 |
| Parámetros totales | 122B (122.000 millones) |
| Parámetros activos | 10B (10.000 millones) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | FP8 (E4M3) con escala bf16 por bloque 128×128; activaciones FP8; lm_head FP8 con bloques 128×128 y copia 2-bit para rondas de borrador; KV cache FP8 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | `.rad` (formato propietario del motor radiance), archivo único de 118,00 GiB |
| Entradas | Texto e imagen |
| Versión del motor requerida | radiance 1.9.0 o superior (radiance 2.0 no es compatible actualmente) |
| Hardware objetivo | 4 tarjetas AMD RDNA4 de 32 GB (probado en Radeon AI PRO R9700) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-122B es un transformer de mezcla de expertos con 122B parámetros totales y 10B activos por token, construido sobre Qwen3.5 (licencia Apache 2.0) por el equipo Ornith. Incorpora una cabeza MTP (multi-token prediction) propia que se utiliza para decodificación especulativa con 3 tokens de borrador, y un codificador visual que habilita la modalidad image-text-to-text. El contexto alcanza los 262.144 tokens.

Esta ficha concreta no reentrena el modelo: parte de la revisión FP8 oficial `ornith-ai/Ornith-1.5-122B-FP8` (revision `31b76f63`) y la recuantiza. Cada capa lineal se convierte a FP8 con una única escala por bloque de 128×128 mediante redondeo al más cercano, que es la forma que leen los kernels de expertos de radiance. Además se añade una copia en 2 bits del lm_head para las rondas de borrador, siguiendo la receta de radiance para Qwen3.6-35B-A3B. No se utilizó datos de calibración. El proceso se realiza con la herramienta `rad-convert` y una receta (`ornith-1.5-122b-fp8.recipe`).

Cabe señalar que los pesos FP8 del release original se redondean una segunda vez al pasar a bloques, lo que introduce una degradación adicional mínima pero medible (KL medio de 0,0118 frente al bf16 original). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento avanzado, con modo thinking activado por defecto y desactivable por petición mediante `chat_template_kwargs`.
- Comprensión de imágenes (image-text-to-text): evaluado en DocVQA y AI2D con 16/20 respuestas idénticas al original bf16.
- Razonamiento multi-paso y tareas de codificación, con ajustes de muestreo específicos recomendados (`--temp 0.6 --presence-penalty 0`).
- Decodificación especulativa nativa mediante la cabeza MTP del propio modelo (3 tokens de borrador), sin modelo draft externo.
- Procesamiento de contexto largo: hasta 262.144 tokens, con pools KV configurables de hasta 1.048.720 tokens agregados en 4 secuencias.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de audio y vídeo: la model card menciona una tabla de "Images, audio and video", pero solo se reportan mediciones para imágenes; el pipeline declarado es image-text-to-text.

## Casos de uso

- Análisis de documentos técnicos y formularios: con 262.144 tokens de contexto y entrada de imagen, el modelo puede ingerir páginas escaneadas de DocVQA o diagramas AI2D y responder preguntas sobre ellos en una sola pasada, sin trocear el documento.
- Razonamiento sobre bases de código extensas: el contexto largo permite cargar repositorios completos o varios módulos y realizar tareas de refactorización o auditoría, usando el ajuste de codificación recomendado (`temp 0.6`, `presence-penalty 0`).
- Asistente de investigación con modo thinking: para problemas matemáticos o lógicos complejos, se activa el modo thinking por defecto y se deja que el modelo genere cadenas de razonamiento largas (la model card advierte que tareas difíciles pueden superar los 32k tokens de salida).
- Despliegue on-premise en clústeres AMD: organizaciones con infraestructura ROCm/RDNA4 pueden servir el modelo en 4× R9700 con radiance, evitando dependencias de CUDA y manteniendo los datos en local.
- Generación multimodal en producción con requisitos de latencia: con 165,1 tokens/s en decodificación de un solo stream y 241 tokens/s agregados en 4 streams, es viable para chat interactivo y procesamiento por lotes moderado.
- Evaluación comparativa de cuantizaciones: el archivo incluye métricas KL frente al bf16 original, lo que lo convierte en referencia útil para medir el impacto de FP8 frente a alternativas W4A8 en el mismo motor.
- Prototipado de agentes con contexto masivo: el pool KV de hasta 1.048.720 tokens en 4 secuencias permite mantener múltiples sesiones de agente con historiales muy largos simultáneamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card proporciona métricas de fidelidad de cuantización y de velocidad:

| Métrica | Este archivo | dflash2 | w4a8 | w4a8-dflash2 |
|---|---|---|---|---|
| KL medio (MT-Bench, 42.305 tokens) | 0,0118 | 0,0118 | 0,0174 | 0,0174 |
| KL percentil 99 | 0,139 | 0,139 | 0,222 | 0,222 |
| Token superior idéntico | 97,2% | 97,2% | 96,4% | 96,4% |
| Ratio de perplejidad | ×1,003 | ×1,003 | ×1,002 | ×1,002 |

| Rendimiento (R9700 a 215 W, radiance 1.9.0, fp8 KV, 3 draft tokens, thinking off) | 4 tarjetas |
|---|---|
| Decodificación, un stream | 165,1 tok/s |
| Prefill a 24k tokens | 7.020 tok/s |
| 4 streams, total | 241 tok/s |

| Fidelidad multimodal (greedy, thinking off, 4 tarjetas) | Casos | Respuesta idéntica | KL medio | Token superior idéntico |
|---|---|---|---|---|
| Imágenes (DocVQA y AI2D) | 20 | 16/20 | 0,0328 | 91/95 |

## Requisitos de hardware

- VRAM: el archivo pesa 118,00 GiB; requiere 4 tarjetas de 32 GB más un pool de host fijado de 3 GiB por tarjeta (`--host-pool-mib 3072`).
- GPU recomendadas: AMD Radeon AI PRO R9700 (probado). Cualquier GPU RDNA4 de 32 GB debería ser compatible; no se documentan otras.
- No cabe en 1 ni 2 tarjetas: con 2 tarjetas radiance 1.9.0 carece de kernel de atención para este modelo (16 cabezas de query por cabeza KV).
- No es compatible con GPU NVIDIA/CUDA: radiance solo funciona en AMD RDNA4.
- Despliegue: exclusivamente mediante el motor radiance 1.9.0 o superior (imagen Docker `stilldeadcode/radiance:1.9.0`), con `--tp 4 --p2p on --placement expert_tiered --vision-tower-placement ram --kv-cache-dtype fp8`. No hay soporte para vLLM, llama.cpp, Ollama ni TGI en este formato `.rad`.
- Latencia y throughput: 165,1 tok/s en un stream, 7.020 tok/s de prefill a 24k tokens y 241 tok/s agregados en 4 streams sobre 4× R9700 a 215 W.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato / motor | Notas |
|---|---|---|---|---|---|---|
| keptn/ornith-1.5-122b-fp8 (esta ficha) | 122B | 10B | 262.144 | MIT | `.rad` / radiance (AMD) | KL 0,0118; 165 tok/s en 4× R9700 |
| keptn/ornith-1.5-122b-fp8-dflash2 | 122B | 10B | 262.144 | MIT | `.rad` / radiance (AMD) | Misma calidad (KL 0,0118), variante de atención |
| keptn/ornith-1.5-122b-w4a8 | 122B | 10B | 262.144 | MIT | `.rad` / radiance (AMD) | Menor peso, peor fidelidad (KL 0,0174, 96,4% top token) |
| ornith-ai/Ornith-1.5-122B (bf16 original) | 122B | 10B | 262.144 | MIT | safetensors / HF transformers | Referencia de calidad; no cabe en 4× 32 GB |

No se dispone de datos de benchmarks estándar para comparar con modelos de otros ecosistemas (por ejemplo, variantes de Qwen3.5 o DeepSeek); la comparación se limita a las variantes de cuantización del mismo modelo publicadas por el mismo autor.

## Limitaciones y advertencias

- Dependencia total del motor radiance y del hardware AMD RDNA4: no es usable en CUDA ni en otros motores de inferencia.
- Requiere exactamente 4 tarjetas de 32 GB; no hay degradación posible a 1 o 2 tarjetas por falta de kernel de atención.
- Incompatibilidad con radiance 2.0 en el momento de la publicación (la model card indica 1.9.0; el quick start menciona 1.17.0, una inconsistencia a verificar).
- Doble redondeo de los pesos FP8 del release original al pasar a bloques 128×128, con la consiguiente pérdida de fidelidad (aunque pequeña: KL 0,0118).
- Con el modo thinking activado, las tareas difíciles pueden requerir más de 32k tokens de salida, lo que consume contexto y aumenta la latencia.
- Riesgo de alucinación: no se documenta ninguna evaluación específica al respecto en la información disponible.
- Sesgos conocidos: no disponibles.
- Idiomas soportados: no disponibles; no se puede confirmar cobertura multilingüe.
- No se documenta soporte de tool calling ni de agentes multi-paso.
- Solo 116 descargas y 0 likes: modelo de nicho con escasa validación comunitaria; el autor de la cuantización (keptn) no es el equipo original de Ornith.
- Licencia MIT heredada del modelo base, lo que permite uso comercial sin restricciones documentadas adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/keptn/ornith-1.5-122b-fp8
- Modelo base (bf16): https://huggingface.co/ornith-ai/Ornith-1.5-122B
- Modelo base FP8: https://huggingface.co/ornith-ai/Ornith-1.5-122B-FP8
- Variante dflash2: https://huggingface.co/keptn/ornith-1.5-122b-fp8-dflash2
- Variante W4A8: https://huggingface.co/keptn/ornith-1.5-122b-w4a8
- Variante W4A8 dflash2: https://huggingface.co/keptn/ornith-1.5-122b-w4a8-dflash2
- Repositorio del modelo Ornith: https://github.com/ornith-ai/Ornith-1
- Motor radiance: https://codeberg.org/StillDeadcode/radiance
- Framework de model cards: https://codeberg.org/keptn42/radiance-model-cards-framework
- Dataset MT-Bench: https://huggingface.co/datasets/lmsys/mt_bench_human_judgments
