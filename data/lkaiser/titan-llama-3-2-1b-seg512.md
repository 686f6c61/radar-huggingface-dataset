# lkaiser/Titan-Llama-3.2-1B-seg512

## Resumen

Titan-Llama-3.2-1B-seg512 es un experimento de replicacion abierta del trabajo "Titan-Llama: Retrofitting Pre-trained LLMs with External Neural Memory Modules" (arXiv:2610.19210), aplicado sobre el modelo base `unsloth/Llama-3.2-1B-Instruct`. Lo desarrolla el usuario de Hugging Face `lkaiser` y su proposito es explorar si es posible dotar a un transformer preentrenado y congelado de un modulo de memoria neural externa que compense la perdida de capacidad de contexto largo cuando se sustituye la atencion completa por atencion segmentada.

La motivacion tecnica es concreta: al reemplazar la atencion causal completa de las cuatro primeras capas por atencion segmentada con `segment_len=512`, el modelo pierde drasticamente su rendimiento en tareas de contexto largo (RULER S-NIAH cae del 84,4% al 3,1% en `PK@4K`). El autor anade un modulo `MemoryMLP` de tres capas por cabeza KV (17,23 M de parametros entrenables) y entrena solo esos parametros, manteniendo el backbone de 1,235B congelado. El resultado es una mejora parcial pero medible en tareas de memoria de largo alcance, aunque sigue muy por debajo del modelo con atencion completa.

El modelo es relevante como pieza de investigacion reproducible: publica checkpoints intermedios de cada etapa (pretraining continuo, SFT, SFT de calidad, SFT con supervision forzada de memoria y destilacion de atencion por capas), configuraciones exactas y pesos compactos de solo el modulo de memoria (~35 MB en BF16). No es un modelo listo para produccion ni un sustituto funcional de Llama-3.2-1B-Instruct en tareas de contexto largo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Llama-3.2) con atencion segmentada en capas 0-3 y modulo `MemoryMLP` de memoria neural por cabeza KV |
| Parametros totales | 1.235B (backbone congelado) + 17.227.872 (~17,23 M) entrenables |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Entrenado con `sequence_length=16384`; segmento de atencion de 512 tokens |
| Tipos de cuantizacion | No disponible (checkpoints en BF16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible (heredados del backbone Llama-3.2, no documentados en la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | `.pt` (PyTorch): `nmm_only_weights.pt` (~35 MB, BF16) y `latest_checkpoint.pt` (~2,7 GB, incluye backbone) |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/Llama-3.2-1B-Instruct` congelado y sustituye las capas `[0, 1, 2, 3]` por `TitanDecoderLayer`, que combina atencion causal segmentada (`segment_len=512`, `neural_memory_batch_size=512`) con un modulo de memoria neural `MemoryMLP` de tres capas por cabeza KV. Solo se entrenan los parametros del modulo de memoria y los residuos de valor (17,23 M en total). El entrenamiento se organiza en etapas: (1) pretraining continuo sobre FineWeb-Edu + LongAlign durante 1B de tokens (`batch_size=64`, 953 pasos, `sequence_length=16384`); (2) SFT de contexto largo sobre LongAlign + LoongRL (200 pasos); (3) SFT de eleccion multiple sobre QuALITY (59 pasos); y dos variantes de la etapa 4: `seg512_forced_memory_sft`, con supervision directa de memoria y S-NIAH multi-longitud (4K/8K), y `seg512_distill_sft`, con destilacion de atencion profesor-alumno por capas (`distill_weight=10.0`), scheduler LR coseno y supervision S-NIAH abierta equilibrada.

La innovacion principal es la destilacion por capas de la atencion del profesor (el modelo con atencion completa) hacia las capas segmentadas, que reduce el error de reconstruccion de atencion en las capas 0-3 un 83,0% (de 4,2205 a 0,7197) y recupera parcialmente capacidades de recuperacion en contexto largo que la atencion segmentada por si sola pierde por completo. No se documenta uso de RLHF ni DPO; el ajuste es puramente supervisado.

## Capacidades

- Generacion de texto autoregresiva heredada del backbone Llama-3.2-1B-Instruct.
- Recuperacion de informacion en contexto largo mediante el modulo de memoria neural (mejora medible en RULER S-NIAH y QuALITY respecto a la variante sin memoria).
- Razonamiento matematico de eleccion multiple en regimenes de prompt largo (mejora en MMLU-Math/STEM a 30-shot y en AQuA-RAT con CoT largo).
- Respuesta a preguntas de comprension lectora de documentos largos (QuALITY a 8K, LongHealth a 16K).
- Capacidades de instruccion y chat heredadas del backbone (no reentrenadas de forma general).
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio.
- No se documenta modo thinking ni decodificacion especulativa.

## Casos de uso

- Investigacion sobre memoria neural externa en LLM: el modelo sirve como referencia reproducible para estudiar si modulos de memoria compensan la atencion segmentada, con checkpoints por etapa y configuraciones exactas publicadas.
- Experimentos de destilacion de atencion: la etapa `seg512_distill_sft` permite analizar la transferencia de patrones de atencion del profesor a capas con atencion segmentada, con metricas de error de reconstruccion por capa.
- Evaluacion de contexto largo controlada: util para reproducir experimentos RULER S-NIAH, QuALITY y LongHealth con una arquitectura modificada y comparar contra el baseline de atencion completa.
- Docencia y formacion: ejemplo didactico de como retrofitear un transformer preentrenado con modulos externos sin reentrenar el backbone, con un coste de entrenamiento reducido (17,23 M de parametros).
- Pruebas de eficiencia de atencion segmentada: permite medir el ahorro computacional de `segment_len=512` frente a atencion completa y cuantificar el coste en calidad.
- Base para fine-tuning especifico de tareas de memoria: al publicarse `nmm_only_weights.pt` (~35 MB), es viable reentrenar solo el modulo de memoria para dominios concretos sin tocar el backbone.

## Benchmarks y rendimiento

| Modelo / Checkpoint | Error destilacion atencion capas 0-3 | RULER S-NIAH (`PK@4K` / `N@4K`) | QuALITY (8K) | LongHealth (16K) |
|---|---|---|---|---|
| Full Attention (Llama-3.2-1B-Instruct) | 0,0000 | 84,4% / 68,8% | 29,29 ± 1,00% (611/2086) | 44,75 ± 2,49% (179/400) |
| Segmented Attention (seg=512, sin NMM) | 4,7007 | 3,1% / 0,0% | 22,27% (512) / 25,31% (2086) | 14,50% (58/400) |
| Stage 3 (`seg512_quality_sft`) | 4,2205 | 3,1% / 0,0% | 22,46% (512) / 25,55% (2086) | 19,75% (79/400) |
| Stage 4 MC-focused (`phase_a`) | 1,8237 (-56,8%) | 0,0% / 0,0% | 26,32 ± 0,96% (549/2086) | 28,00 ± 2,24% (112/400) |
| Stage 4 Balanced (`v6`, `seg512_distill_sft`) | 0,7197 (-83,0%) | 12,5% / 6,2% | 24,22 ± 1,89% (124/512) | 21,75 ± 2,06% (87/400) |

| Benchmark | Regimen | Full Attention | Segmented sin NMM | Titan-Llama (v6) |
|---|---|---|---|---|
| ARC-Challenge | Corto (68,0 tok) | 52,31% | 52,31% | 52,31% |
| Winogrande | Corto (43,6 tok) | 51,40% | 52,20% | 52,20% |
| BoolQ | Corto (143,7 tok) | 67,20% | 64,20% | 63,00% |
| AQuA-RAT | 0-shot corto (78,8 tok) | 25,20% | 24,41% | 24,41% |
| AQuA-RAT | 8-shot CoT largo (1.442,8 tok) | 24,80% | 26,38% | 25,98% |
| MMLU-Math/STEM | 5-shot limite (521,0 tok) | 33,26% | 31,85% | 30,89% |
| MMLU-Math/STEM | 30-shot largo (2.785,6 tok) | 30,89% | 23,04% | 25,33% |
| GSM8K | 4-shot / 12-shot | 25,00% / 26,04% | 10,42% / 1,04% | 5,21% / 3,12% |

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 2,5-3 GB para el backbone de 1,235B mas el modulo de memoria (los checkpoints completos pesan 2,7 GB).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para BF16; una RTX 3060 de 12 GB o superior es suficiente. Para entrenamiento del modulo de memoria, una RTX 4090 o A100 acelera las etapas.
- Cabe en GPU de consumo: si, practicamente cualquier GPU moderna con 6 GB o mas (RTX 3060, RTX 4060, RTX 4090).
- Opciones de despliegue: el codigo de referencia usa la clase `TitanLLaMAForCausalLM` del paquete `titan_llama` con PyTorch y CUDA. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | RULER S-NIAH PK@4K | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Titan-Llama-3.2-1B-seg512 (v6) | 1,235B + 17,23 M | 16K entrenado | 12,5% | apache-2.0 | Pesos en HF |
| Llama-3.2-1B-Instruct (base) | 1,235B | 128K | 84,4% | Llama 3.2 Community License | Pesos en HF |
| Segmented Attention seg=512 (ablacion) | 1,235B | 16K entrenado | 3,1% | apache-2.0 | Incluido en el repo |

La comparativa directa mas relevante es contra el propio backbone con atencion completa, que supera ampliamente al modelo modificado en todas las tareas de contexto largo. Frente a la ablacion sin modulo de memoria, el modelo Titan mejora de forma clara en RULER S-NIAH, QuALITY y LongHealth, pero no alcanza al baseline. No se dispone de comparacion con otros modelos de memoria neural externa en la informacion proporcionada.

## Limitaciones y advertencias

- Rendimiento muy inferior al backbone con atencion completa en tareas de contexto largo: RULER S-NIAH `PK@4K` cae del 84,4% al 12,5%, y GSM8K 12-shot del 26,04% al 3,12%.
- El modelo no es un sustituto funcional de Llama-3.2-1B-Instruct en produccion; es una pieza de investigacion.
- Riesgo de alucinacion elevado en tareas de recuperacion de informacion, dado el bajo rendimiento en S-NIAH.
- Idiomas soportados no documentados; se heredan del backbone pero no se evaluan.
- Sin soporte documentado para tool calling, agentes, vision ni audio.
- El codigo de carga requiere el paquete `titan_llama` y carga con `strict=False`, lo que puede ocultar discrepancias en los pesos.
- Aunque la licencia es apache-2.0, el backbone subyacente Llama-3.2 tiene su propia licencia comunitaria, que puede imponer restricciones adicionales al uso comercial.
- No se documentan sesgos especificos; los del backbone Llama-3.2 se heredan sin mitigacion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lkaiser/Titan-Llama-3.2-1B-seg512
- Paper de referencia: https://arxiv.org/pdf/2610.19210
- Modelo base: https://huggingface.co/unsloth/Llama-3.2-1B-Instruct
