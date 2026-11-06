# bradshaw-ai/Swift-1.5-27B-5.65bpw-GSQ-RCO-Marlin-MTP

## Resumen

Swift-1.5-27B-5.65bpw-GSQ-RCO-Marlin-MTP es un checkpoint cuantizado de 27B parámetros derivado de `UkisAI/Swift-1.5-Qwen3.8-27B`, publicado por `bradshaw-ai`. No es un modelo base nuevo, sino una compilación de cuantización optimizada para servir un modelo híbrido Gated DeltaNet (GDN) + Softmax GQA sobre dos GPU de 24 GiB (RTX 3090) en Tensor Parallelism `TP=2` por PCIe Gen4 x8/x8 sin NVLink. El objetivo declarado es doble: mantener la fidelidad de generación de un W8 mientras se maximiza el espacio de KV cache, y eliminar el cuello de botella de memoria y comunicación que introduce el drafter MTP especulativo con vocabulario completo.

La pieza central es una asignación no uniforme de precisiones Marlin sobre las 64 capas del backbone, decidida mediante Riemannian Constrained Optimization (RCO) ponderada por la retención causal de GDN. El resultado es un peso efectivo de 5,65 bpw en el backbone (4,60 bpw en MLPs, 6,75 bpw total) que ocupa 21,56 GiB agrupados (10,78 GiB por GPU), dejando cerca de 20 GiB para KV cache en FP8. Adicionalmente, se sustituye la cabeza MTP de 248.320 tokens por un drafter podado a 32k tokens en inglés, destilado in-situ, que reduce la lectura HBM por paso especulativo en un factor de 7,58×.

El modelo es relevante para quienes despliegan modelos de 27B en estaciones de trabajo consumer con dos GPU y necesitan decodificación especulativa sin NVLink. Requiere el parche vLLM `syv-ai/HyperQwen` y está bajo la licencia `swift-open-license-v1.0`, que conviene revisar antes de uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Gated DeltaNet (GDN) + Softmax GQA, 64 capas de backbone, con cabeza MTP especulativa |
| Parametros totales | 27B (modelo base `UkisAI/Swift-1.5-Qwen3.8-27B`) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el drafter MTP se entrena sobre 32k tokens en inglés; la ventana del backbone no se especifica) |
| Tipos de cuantizacion | Marlin W4_G128, W4_G32 y W8_G128 en backbone; gates GDN en BF16; tablas de vocabulario en BF16; MTP en W4_G32/W8_G128. Efectivo: 5,65 bpw backbone / 6,75 bpw total |
| Idiomas soportados | Inglés (drafter podado a 32k tokens en inglés; idiomas del backbone no disponibles) |
| Licencia | swift-open-license-v1.0 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | safetensors (7 shards, 21,65 GiB en disco), kernels Marlin para vLLM |

## Arquitectura y entrenamiento

El backbone es un transformer híbrido que combina bloques de atención Softmax GQA con capas Gated DeltaNet, un mecanismo de estado recurrente con compuertas de decaimiento y actualización (`in_proj_a/b`) que se mantienen en BF16 para preservar estabilidad. La cuantización se distribuye de forma asimétrica: 32 MLPs en `W4_G128`, 27 en `W4_G32` y 5 en `W8_G128`, asignación resuelta por RCO ponderando la retención causal de 128 tokens de las capas GDN. Todos los bloques de atención corren a `MARLIN_W8_G128`. Las capas 59–63 se fijan en W8 como "corredor de salida" para evitar deriva de representación antes de `lm_head` y alimentar estados limpios al drafter MTP.

El drafter MTP es una cabeza de `[32768, 5120]` en BF16 (167,8 MiB por GPU en `TP=2`), podada desde el vocabulario completo de 248.320 tokens con cobertura del 99,23% sobre 500,3M tokens de inglés, código y matemáticas. Se destila in-situ contra los estados cuantizados de la capa 63 como profesor, sobre 10.000 secuencias (5,03M tokens activos de asistente), alcanzando un 94,56% de coincidencia Top-1 con el profesor (89,42% cross-shard). La combinación GSQ + AutoRound minimiza la distorsión de cuantización. No se detallan en la información disponible el número de tokens de preentrenamiento del modelo base ni si hubo RLHF/DPO.

## Capacidades

- Generación de texto en inglés con calidad próxima a W8 según el autor (fidelidad "W8-class").
- Decodificación especulativa con MTP integrado: 3,26–3,36 tokens aceptados por paso con `k=4`.
- Razonamiento multi-turno: los benchmarks incluyen turnos de 25, 58 y 91 tokens con throughput sostenido.
- Soporte de código y matemáticas inferido de la composición del dataset del drafter (inglés, código y matemáticas), aunque no se detallan capacidades específicas del backbone.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés en el drafter; idiomas del backbone no disponibles.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Despliegue en estaciones de trabajo con dos RTX 3090 sin NVLink: el checkpoint está calibrado para `TP=2` por PCIe Gen4 x8/x8, con 10,78 GiB de pesos por GPU y margen para KV cache FP8 de hasta 546.012 tokens, lo que permite servir sesiones largas en hardware consumer.
- Servicio de chat multi-turno con contexto largo: el throughput medido se mantiene entre 110 y 124 tok/s en turnos sucesivos (25, 58 y 91 tokens) gracias al drafter podado, adecuado para asistentes conversacionales con historial extenso.
- Generación de código en pipelines internos: la cobertura del drafter incluye código y el modelo soporta decodificación especulativa estable, útil para autocompletado y generación en IDE o CI con latencia de decodificación de ~108 tok/s medios.
- Prototipado de investigación sobre cuantización híbrida: la asignación RCO por capas y el corredor W8 de salida sirven como referencia reproducible para estudiar el impacto de precisiones no uniformes en modelos GDN.
- Evaluación de decodificación especulativa en hardware sin NVLink: el checkpoint incluye telemetría de aceptación posición a posición, útil para comparar estrategias de drafter en buses PCIe limitados.
- Inferencia por lotes pequeños en laboratorio: con 19,79 GiB agrupados de KV cache a 94% de utilización, permite procesar documentos largos o conversaciones paralelas en una única estación de dos GPU.
- Sustitución de cuantizaciones W8 en producción con restricciones de VRAM: mantiene fidelidad cercana a W8 con 21,56 GiB de pesos, liberando memoria para caché y batch.

## Benchmarks y rendimiento

Medidos en 2× RTX 3090 (`TP=2`, PCIe Gen4 x8/x8, sin NVLink) con vLLM v0.30.0 + parches `syv-ai/HyperQwen`, `num_speculative_tokens=4`.

| Categoría | MTP 248k completo (media / pico) | MTP 32k podado + destilado (media / pico) | Mejora media | TTFT (frío → caliente) |
|---|---|---|---|---|
| Subsistema de memoria CUDA | 87,92 / 93,50 tok/s | 98,29 / 104,61 tok/s | +11,8% | 210,3 → 54,3 ms |
| Comunicación tensor-parallel (PCIe) | 77,75 / 89,20 tok/s | 93,77 / 103,61 tok/s | +20,6% | 111,9 → 50,1 ms |
| Estado Gated DeltaNet | 88,66 / 95,39 tok/s | 111,64 / 131,02 tok/s | +25,9% (+37,4% pico) | 94,7 → 50,1 ms |
| Multi-turno turno 1 (25t) | 97,79 tok/s | 124,12 tok/s | +26,9% | 73,7 ms |
| Multi-turno turno 2 (58t) | 92,07 tok/s | 112,85 tok/s | +22,6% | 97,0 ms |
| Multi-turno turno 3 (91t) | 80,64 tok/s | 110,09 tok/s | +36,5% | 98,2 ms |
| Agregado global | 87,47 / 97,79 tok/s | 108,46 / 131,02 tok/s | +24,0% (+34,0% pico) | 19,19× speedup de prefix cache |

Aceptación del drafter por posición (`k=4`):

| Posición | W4_G32 + W8_G128 (enviado) | W8_G128 completo (alternativa) |
|---|---|---|
| t+1 | 82,30% | 81,20% (pico 83,30%) |
| t+2 | 62,50% | 61,60% (pico 64,90%) |
| t+3 | 48,00% | 50,70% (pico 51,80%) |
| t+4 | 33,50% | 38,00% |
| Longitud media aceptada | 3,26 tok/paso | 3,31–3,36 tok/paso |
| Rendimiento especulativo | 56,1 aceptados / 99,2 borradores tok/s | 53,0 aceptados / 91,6 borradores tok/s |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM: 21,56 GiB agrupados de pesos (10,78 GiB por GPU en `TP=2`); 21,65 GiB en disco en 7 shards.
- KV cache disponible: 9,89 GiB por GPU (19,79 GiB agrupados) a 94% de utilización, equivalente a 546.012 tokens FP8.
- GPU objetivo: 2× RTX 3090 (24 GiB, `sm_86`), PCIe Gen4 x8/x8 o x16, sin necesidad de NVLink.
- Otras GPU: no se documentan pruebas en A100, H100, RTX 4090 u otras; los kernels Marlin requieren compatibilidad con `sm_86` o superior.
- Cabe en GPU consumer: sí, en dos RTX 3090; no se indica viabilidad en una sola GPU de 24 GiB.
- Despliegue: vLLM v0.30.0 con parches `syv-ai/HyperQwen`; configuración `--speculative-config '{"method":"mtp","num_speculative_tokens":4,"draft_sample_method":"probabilistic"}'`.
- Throughput: 108,46 tok/s medios y 131,02 tok/s pico en agregado; TTFT de 50,1–98,2 ms en caliente y 210,3 ms en frío; speedup de prefix cache de 19,19×.
- llama.cpp, Ollama o TGI: no disponible (el checkpoint está orientado a Marlin/vLLM).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Swift-1.5-27B-5.65bpw-GSQ-RCO-Marlin-MTP | 27B | no disponible | Marlin W4/W8 mixto, 5,65 bpw backbone | swift-open-license-v1.0 | 2× 24 GiB, TP=2 PCIe |
| UkisAI/Swift-1.5-Qwen3.8-27B (base) | 27B | no disponible | BF16 (referencia) | no disponible | mayor VRAM que el cuantizado |
| MTP 248k completo (variante del mismo checkpoint) | 27B | no disponible | MTP sin podar | swift-open-license-v1.0 | 2× 24 GiB, TP=2 PCIe |

No se dispone de datos de benchmarks de calidad ni de especificaciones de contexto para comparar con alternativas de otros autores; la comparación se limita a variantes del mismo modelo base documentadas en la model card.

## Limitaciones y advertencias

- Checkpoint de cuantización, no modelo base: la calidad final depende de la asignación RCO y de la destilación del drafter; el autor reporta fidelidad "W8-class" sin benchmarks de calidad públicos que lo verifiquen.
- Requiere parches específicos de vLLM (`syv-ai/HyperQwen`); no es desplegable con vLLM estándar ni con llama.cpp u Ollama según la información disponible.
- Orientado a una topología concreta (2× 24 GiB, PCIe Gen4 x8/x8, sin NVLink); el rendimiento en otras configuraciones no está documentado.
- El drafter MTP está podado a 32k tokens y entrenado solo en inglés, código y matemáticas: puede degradar la aceptación especulativa en otros idiomas o dominios.
- Riesgo de alucinación y sesgos del backbone no documentados en la información proporcionada.
- Idiomas del backbone no disponibles; el único idioma confirmado es inglés.
- Licencia `swift-open-license-v1.0` (etiquetada `other`): es necesario revisar el archivo LICENSE antes de uso comercial; no se detallan restricciones en la información disponible.
- Sin descargas ni likes en Hugging Face en el momento de la consulta; no hay validación comunitaria del checkpoint.
- Los benchmarks reportados son de throughput y aceptación especulativa, no de calidad de generación; no deben interpretarse como evidencia de rendimiento en tareas downstream.

## Enlaces

- Hugging Face: https://huggingface.co/bradshaw-ai/Swift-1.5-27B-5.65bpw-GSQ-RCO-Marlin-MTP
- Modelo base: https://huggingface.co/UkisAI/Swift-1.5-Qwen3.8-27B
- Parches vLLM HyperQwen: https://github.com/syv-ai/HyperQwen
