# nchapman/Qwen3.8-27B-W2.2A16-HGPTQ-RCO

## Resumen

Qwen3.8-27B-W2.2A16-HGPTQ-RCO es una cuantización extrema del modelo multimodal denso Qwen/Qwen3.8-27B, publicada por el usuario nchapman. Se trata de un checkpoint de aproximadamente 2,20 bits medios por peso en el backbone de lenguaje (mezcla de W2 y W4 con grupo de 64), cabecera de salida y fusión MTP en W8, y todas las capas de visión y del módulo MTP nativo en W4. El resultado comprime el payload original de 51,75 GiB en BF16 hasta 11,04 GiB (4,69 veces menos), lo que permite servir un modelo de 27B nominales en GPUs de 12-16 GB de VRAM.

La técnica empleada es Hadamard + Cholesky GPTQ con Riemannian Co-design (HGPTQ-RCO): se aplica rotación de Hadamard, GPTQ con inicialización MSE y descenso coordinado de Hessiano Gauss-Seidel multipasada, y una selección no miópica de grupos sensibles mediante Gumbel-Softmax riemanniano. Solo el 10% de los grupos lineales del backbone (51 de 400) se elevan a W4; el resto queda en W2 simétrico. Además se destila KL de extremo a extremo sobre escalas continuas y RMSNorm/GDN-gate en FP32 master.

Su relevancia práctica es que demuestra que un VLM denso de 27B con atención híbrida (Full-Attention + GatedDeltaNet), visión y decodificación especulativa MTP puede desplegarse en hardware de consumo con vLLM estándar sin parches, a costa de una divergencia KL frente al BF16 base que el autor cuantifica en 0,3137 KL ponderada por token en el probe de texto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido multimodal (atención completa + GatedDeltaNet linear attention) con MTP nativo y torre ViT; clase `qwen3_5` |
| Parámetros totales | 18.158.121.712 (según safetensors del repo cuantizado); el modelo base se denomina 27B |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el autor menciona uso para "ultra-long-context 16 GB serving" sin cifra) |
| Tipos de cuantización | GPTQ W2/W4 mixto en backbone (2,20 bits medios, grupo 64), W8 en `lm_head` y `mtp.fc`, W4 en MTP y visión; formato `compressed-tensors` pack-quantized int32 |
| Idiomas soportados | No disponible (la model card cita evaluación multilingüe sobre 9 idiomas de Belebele, sin listado explícito) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (18 shards), compatible con `compressed-tensors` y vLLM |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso multimodal con atención híbrida: 32 grupos de atención completa y 96 grupos de GatedDeltaNet (linear attention), más 128 grupos MLP en el backbone de lenguaje, una torre ViT de 27 bloques con merger espacial, y un módulo MTP (multi-token prediction) nativo para decodificación especulativa. La cuantización cubre 519 capas lineales: 400 del backbone de lenguaje, 7 del transformer MTP, 110 de visión y 2 de la fusión de salida.

El proceso de cuantización combina rotación de Hadamard, GPTQ con inicialización MSE y descenso coordinado de Hessiano Gauss-Seidel (2 pasadas para W4, 3 para W2), y una selección de grupos sensibles mediante Gumbel-Softmax riemanniano no miópico (54 swaps frente a sensibilidad Hessiana greedy). Los 51 lineales elevados a W4 corresponden a 13/32 grupos de atención completa, 20/96 de GatedDeltaNet y 14/128 MLP. La calibración usa `data/calib-cascade-v1.jsonl`, y el ajuste final se hace por destilación KL de extremo a extremo sobre `log_scale` continuo y RMSNorm/GDN-gate en FP32 master. No se documenta en la información disponible un reentrenamiento adicional del modelo base, solo el proceso de cuantización con QAT de escalas y normas.

## Capacidades

- Generación de texto conversacional con plantilla de chat propia (`chat_template.jinja`) y sampling por defecto temperature 1.0, top_p 0.95, top_k 20.
- Razonamiento y matemáticas: el autor reporta evaluación específica sobre prompts de `math` en el probe de divergencia.
- Comprensión imagen-texto (pipeline `image-text-to-text`): torre ViT de 27 bloques más merger espacial, con todas sus proyecciones cuantizadas en W4.
- Decodificación especulativa mediante MTP nativo: el borrador MTP conserva 96,64% de Top-1 aislado frente al BF16 base.
- Instrucciones y formato (`if` en el probe), con divergencia KL media de 0,2112 frente al base.
- Capacidad multilingüe: evaluada sobre 9 idiomas de Belebele (KL macro 0,4647), sin listado explícito de idiomas.
- Compatibilidad con tool calling y function calling: no confirmada explícitamente en la información proporcionada.
- Soporte de agentes multi-paso: no confirmado explícitamente en la información proporcionada.
- Modo thinking: no confirmado explícitamente en la información proporcionada.

## Casos de uso

- Servicio de texto en GPU de 12 GB: con `--language-model-only` el checkpoint ocupa 10,58 GiB, lo que permite ejecutar un modelo de 27B nominales en tarjetas como RTX 3060 12 GB o RTX 4070, útil para asistentes conversacionales locales sin depender de la nube.
- Servicio multimodal en GPU de 16 GB: el checkpoint completo VLM+MTP ocupa 11,04 GiB, dejando margen para caché KV en tarjetas como RTX 4060 Ti 16 GB, RTX 4070 Ti Super o A4000, para tareas de descripción de imágenes, OCR asistido o VQA.
- Contexto ultra-largo en 16 GB: el autor posiciona este checkpoint específicamente para servir contextos muy extensos en 16 GB, aprovechando que el peso reducido libera VRAM para la caché KV; adecuado para análisis de documentos largos o resúmenes de repositorios.
- Decodificación especulativa en producción: el MTP nativo cuantizado en W4 permite acelerar la generación en vLLM con un borrador que conserva 96,64% de Top-1 aislado, reduciendo latencia en despliegues interactivos.
- Evaluación de cuantizaciones extremas: útil como referencia para investigadores que estudian el límite práctico de GPTQ a 2 bits en modelos densos multimodales, con métricas KL publicadas frente al BF16 base.
- Inferencia edge o en clústeres con GPUs de gama media: al usar vLLM estándar sin parches y `compressed-tensors`, se integra en pipelines existentes de serving con GPUs tipo L4, A10 o T4 (sujeto a que la VRAM disponible cubra los 11 GiB más caché).
- Prototipado de asistentes visuales en estaciones de trabajo: permite probar flujos image-text-to-text con un modelo de 27B en hardware de consumo antes de escalar a versiones de mayor precisión.

## Benchmarks y rendimiento

Evaluación teacher-forced frente al modelo base BF16 (Qwen/Qwen3.8-27B), según la model card:

| Evaluación | BF16 base | W2.2A16-HGPTQ-RCO |
|---|---|---|
| Tamaño safetensors | 51,75 GiB | 11,04 GiB (4,69× menor) |
| Divergencia de texto `probe-v4` (KL ponderada / KL media por token) | 0,0000 | 0,3137 / 0,4597 |
| KL por dominio (`math` / `chat` / `if` / `science`) | 0,0000 | 0,2051 / 0,2213 / 0,2112 / 0,2150 |
| Holdout general y multilingüe `probe-guard` (KL media / KL ponderada) | 0,0000 | 0,3835 / 0,4784 |
| KL macro Belebele 9 idiomas | 0,0000 | 0,4647 |
| MTP nativo, Top-1 aislado (12.339 posiciones) | 100,0% (NLL 2,9579) | 96,64% (NLL 2,9813) |
| MTP nativo, Top-1 extremo a extremo | 100,0% | 72,10% (KL 0,7131) |
| Visión `vision-probe-v2`, Top-1 aislado | 100,0% | 97,68% |
| Visión `vision-probe-v2`, Top-1 extremo a extremo | 100,0% | 86,09% (KL 0,5599) |
| Visión `vision-guard-v2`, Top-1 extremo a extremo | 100,0% | 85,19% (KL 0,5783) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 11,04 GiB para el checkpoint completo VLM+MTP; 10,58 GiB en modo texto (`--language-model-only`); añadir caché KV según longitud de contexto y batch.
- GPU recomendadas para el checkpoint completo: 16 GB o más (RTX 4060 Ti 16 GB, RTX 4070 Ti Super, RTX 4080, A4000, L4). Para texto solo, 12 GB (RTX 3060 12 GB, RTX 4070).
- Cabe en GPU de consumo: sí, en tarjetas de 12 GB (solo texto) y 16 GB (multimodal completo con MTP y CUDA graphs).
- Despliegue: vLLM estándar sin parches con `compressed-tensors`; el autor no menciona soporte de llama.cpp, Ollama, TGI ni GGUF.
- Latencia y throughput: no disponibles en la información proporcionada; el autor solo reporta que el MTP cuantizado conserva 96,64% de Top-1 aislado, lo que sugiere aceleración especulativa útil pero sin cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Bits medios backbone | Tamaño VLM+MTP | Tamaño solo texto | GPU objetivo | Licencia |
|---|---|---:|---:|---|---|
| Qwen3.8-27B-W2.2A16-HGPTQ-RCO (este) | 2,20 (10% W4) | 11,04 GiB | 10,58 GiB | 12 GB texto / 16 GB contexto largo | Apache 2.0 |
| Qwen3.8-27B-W2.6A16-HGPTQ-RCO | 2,60 (30% W4) | 12,18 GiB | 11,71 GiB | 16 GB completo | Apache 2.0 |
| Qwen3.8-27B-W4A16-HGPTQ | 4,00 (100% W4) | 17,33 GiB | 16,86 GiB | 24 GB (RTX 3090/4090/5090) | Apache 2.0 |
| Qwen/Qwen3.8-27B (base BF16) | 16,00 | 51,75 GiB | no disponible | Multi-GPU o 80 GB | Apache 2.0 |

Frente a la variante W2.6A16, este checkpoint gana 1,14 GiB a costa de menor calidad (el autor recomienda W2.6 para uso multimodal general en 16 GB). Frente a W4A16, gana 6,29 GiB pero con divergencia KL notablemente mayor. No se dispone de comparativas con modelos de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- Divergencia medible frente al BF16 base: KL ponderada de 0,3137 en texto y 0,4784 en el holdout general/multilingüe; no es una réplica exacta del modelo original.
- Degradación multimodal mayor que la de texto: Top-1 extremo a extremo de visión cae a 86,09% y el MTP a 72,10%, lo que puede afectar a pipelines que dependan de borradores especulativos precisos.
- Cuantización a 2 bits en el 90% del backbone: riesgo elevado de artefactos en tareas sensibles a precisión numérica (matemáticas complejas, código de baja frecuencia, razonamiento de muchos pasos).
- Idiomas soportados no documentados explícitamente; la evaluación multilingüe se limita a 9 idiomas de Belebele y muestra mayor divergencia que el texto general.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre calidad en producción; conviene validar con evaluación propia antes de desplegar.
- Compatibilidad limitada a vLLM y `compressed-tensors`; no hay pesos GGUF ni soporte documentado para llama.cpp u Ollama.
- Sesgos conocidos del modelo base no documentados en la información proporcionada; se heredan los del Qwen3.8-27B original.
- Riesgo de alucinación no cuantificado en la model card; la divergencia KL no mide factualidad.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria independiente de las métricas reportadas.

## Enlaces

- Hugging Face (este checkpoint): https://huggingface.co/nchapman/Qwen3.8-27B-W2.2A16-HGPTQ-RCO
- Variante W2.6A16: https://huggingface.co/nchapman/Qwen3.8-27B-W2.6A16-HGPTQ-RCO
- Variante W4A16: https://huggingface.co/nchapman/Qwen3.8-27B-W4A16-HGPTQ
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
