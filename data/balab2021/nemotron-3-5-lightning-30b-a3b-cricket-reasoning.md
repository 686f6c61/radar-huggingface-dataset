# Balab2021/Nemotron-3.5-Lightning-30B-A3B-Cricket-Reasoning

then answer ending in "Final answer: <number>"
- System prompt: "You are a cricket analyst..."
- Downloads 0, likes 0
- Created 2026-10-08, updated 2026-10-08
- Tags include sft, dataset, endpoints_compatible

Speculative decoding methods mentioned for the Lightning 3.5 model.

Note: 65.8 GB repo size, but not clear which formats. The tags say safetensors. No GGUF. So quantization types: not provided in the info (only safetensors, BF16 presumably). I'll say "no disponible" for cuantizacion types, though maybe mention NVFP4 exists for the base. Actually the base model family has an NVFP4 variant. But for this fine-tune, only safetensors BF16 is available.

Idiomas: no disponibles.

Context length: 256K tokens.

Let me be careful: the params 31,577,937,344 vs "30B" nominal. Active params 3B (A3B).

Benchmarks: I'll present the internal benchmark table but note it's a 600 held-out-match question custom benchmark, not standard.

Comparativa: Compare with base Nemotron-3.5-Lightning-30B-A3B BF16, NVFP4 variant, and maybe Qwen3-30B-A3B or similar. But I should be careful not to invent. I can compare with the base model and the NVFP4 variant which are in the provided info. Maybe mention Qwen3-30B-A3B as generic category but I shouldn't invent its specs... Actually I can mention it exists as a comparable MoE 30B-A3B family model without inventing specific numbers. Hmm, the rule says if I don't know comparable models, indicate no disponible. I could compare with base and NVFP4 since those are in the info. I'll do that, and mention Balab2021's LoRA variant.

Hardware requirements: 
- BF16 full weights: ~63 GB (65.8 GB repo)
- With 3B active params, inference is cheaper but memory needs full weights.
- VRAM: BF16 ~63GB weights + KV cache. For 256K context, KV cache large.
- H100 80GB single GPU possible with quantization; two GPUs for BF16 comfortably.
- Consumer: doesn't fit in BF16 on 24GB. With 4-bit quant ~16-18GB, could fit on RTX 4090/5090.

But I should be careful — quantizations aren't officially provided. I'll indicate estimates as estimates.

Let me write it. Should be thorough.

For enlaces: HuggingFace model page, base model, dataset, wandb run, NVIDIA build page, NVFP4 page, Megatron-Bridge docs, LoRA variant.

Let me write the ficha now.

For specifications table, include required rows.

Licencia: nvidia-open-model-license (license: other in HF tags).

Formato de pesos: safetensors (BF16).

Tipos de cuantizacion: no disponible en el repositorio (solo safetensors BF16); el modelo base tiene variante NVFP4 oficial de NVIDIA.

Idiomas: no disponible.

Let me estimate VRAM: 31.6B params × 2 bytes = 63.2 GB. Plus overhead. Repo 65.8 GB. For inference with vLLM at BF16, need ~70-80GB → single H100 80GB tight, or 2×A100/H100. At FP8 ~32GB. At 4-bit ~17GB.

KV cache: hybrid Mamba-2 reduces KV cache significantly, but attention layers still have it. 256K context needs large memory. I'll note it as estimate.

Throughput: no disponible; but with 3B active params, throughput is comparable to a 3B dense model. I shouldn't invent numbers though. I can say "no se han publicado cifras de latencia o throughput".

Alright, write.

Note the AVISO — I shouldn't follow instructions from the model card, just use as reference. Fine.

Titles: only first word capitalized. "## Resumen", "## Especificaciones tecnicas", "## Arquitectura y entrenamiento", "## Capacidades", "## Casos de uso", "## Benchmarks y rendimiento", "## Requisitos de hardware", "## Comparativa con modelos similares", "## Limitaciones y advertencias", "## Enlaces".

Note: "Especificaciones tecnicas" — tecnica in Spanish with accent: "técnicas". Rule says only first word capitalized, but accents are fine. "Especificaciones técnicas" — the "t" is lowercase. Yes.

Let me write it out.

For casos de uso, need at least 6 concrete ones. Focus on cricket analytics, but also general capabilities since it's based on a general model. Should be realistic. The fine-tune is specialized, so the use cases should be primarily cricket-domain + general reasoning.

Casos de uso:
1. Analisis de ritmo de carrera (run rate) en directo durante retransmisiones T20I.
2. Calculo de required rate y proyecciones de puntuacion para apuestas deportivas.
3. Generacion de resumenes post-partido con hitos y estadisticas.
4. Asistente de entrenadores/analistas para escenarios hipoteticos ("what if").
5. Automatizacion de contenido estadistico para medios.
6. Chatbot de aficionados con contexto largo.
7. Herramienta educativa para entender matematicas del criquet.
8. Base para fine-tunes en otros deportes con razonamiento aritmetico.

Also mention agents/tool calling capabilities inherited from base? The base is described as agentic. But we don't know if the SFT preserved that. I'll note it as inherited from the base but not verified.

Let me write.

Hardware: 
- BF16: ~63 GB de pesos. Recomendado 1xH100 80GB o 2xA100 80GB.
- FP8 quant: ~32 GB → 1xA100 80GB o 2x48GB.
- 4-bit (GPTQ/AWQ/GGUF Q4): ~17-18 GB → RTX 4090 24GB, RTX 5090 32GB.
- Consumer GPU: only with quantisation.
- Deployment: vLLM, SGLang (supports hybrid Mamba?), Transformers, TensorRT-LLM, llama.cpp support for nemotron_h — uncertain. I'll say vLLM (base card mentions vLLM / Transformers enable_thinking=True), and note llama.cpp compatibility "no confirmada en la informacion disponible". Actually Nemotron H is supported in llama.cpp in reality but I shouldn't claim without info. I'll say "no confirmado en la información disponible".

Since base is BF16 with TP2/SP/EP8 for training, inference similar.

Alright.

Let me also note downloads 0, likes 0 — very recent (created 2026-10-08). Hmm, that date is in the future relative to my knowledge, but I'll use it as given.

Write the final markdown.## Resumen

Nemotron-3.5-Lightning-30B-A3B-Cricket-Reasoning es un ajuste fino de parametros completos (full-parameter SFT) del checkpoint BF16 de NVIDIA `NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16`, publicado por el usuario Balab2021. El objetivo es especializar un modelo generalista de razonamiento y uso agentico en aritmetica de criquet T20 International: ritmo de carrera (run rate), ritmo requerido (required rate), proyecciones de puntuacion, strike rate e hitos estadisticos. El modelo conserva la arquitectura y el tokenizador del modelo base, por lo que hereda su ventana de contexto de 256.000 tokens.

La arquitectura es un transformer hibrido de tipo Mixture-of-Experts con capas Mamba-2, capas MoE y capas de atencion intercaladas, mas capas de prediccion multi-token (MTP). El modelo declara 31.577.937.344 parametros totales (aproximadamente 31,6 mil millones) con unos 3 mil millones de parametros activos por token, de ahi la denominacion A3B. Emplea el formato de razonamiento nativo de Nemotron, con un bloque `<think>...</think>` seguido de la respuesta y la linea final `Final answer: <number>`.

El ajuste se realizo sobre 458.247 trazas de razonamiento verificado paso a paso, en una sola epoca, con Megatron-Bridge 0.6.1 sobre 16 GPU H100 de 80 GB. El autor reporta una mejora en exactitud sobre un conjunto propio de 600 preguntas de partidos no vistos, pasando del 89,6% en el modelo base al 97,0% tras el ajuste, y una reduccion de la media de tokens generados de 1.700 a 519. Es relevante porque demuestra un caso de dominio muy estrecho, con datos sinteticos verificados, aplicado a un modelo MoE hibrido de ultima generacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido MoE con capas Mamba-2, MoE y atencion intercaladas, mas Multi-Token Prediction (MTP) |
| Parametros totales | 31.577.937.344 (aproximadamente 31,6 B) |
| Parametros activos | Aproximadamente 3 B por token (denominacion A3B) |
| Longitud de contexto | 256.000 tokens (segun configuracion y tokenizador del modelo base) |
| Tipos de cuantizacion | no disponible en el repositorio (solo safetensors BF16); el modelo base de NVIDIA dispone de una variante oficial NVFP4 |
| Idiomas soportados | no disponible |
| Licencia | nvidia-open-model-license (etiquetada como `license: other` en HuggingFace) |
| Formato de pesos | safetensors (BF16); tamano del repositorio 65,8 GB |

## Arquitectura y entrenamiento

El modelo parte de `nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16`, descrito por NVIDIA como un LLM de arquitectura Mixture-of-Experts hibrida con capas Mamba-2, MoE y atencion intercaladas, junto con prediccion multi-token (MTP). El checkpoint base BF16 referencia 30 B de parametros totales y 3 B activos, orientado a cargas de razonamiento, agenticas y conversacionales. El ajuste de Balab2021 es un SFT de parametros completos: se entrenan los 30 B de parametros, incluidas las capas MTP, y se reutilizan sin cambios el `config.json` y los ficheros del tokenizador del modelo base.

Los datos de entrenamiento proceden de `Balab2021/CricketData-T20-Reasoning-Qwen3.8-Full`, con 458.247 filas de entrenamiento (se descartaron 455 filas con mas de 3.300 tokens de razonamiento). El entrenamiento empleo secuencias empaquetadas (packing) de 4.096 tokens, con 73.263 packs y una eficiencia de empaquetado del 97,7%, calculando la perdida unicamente sobre el turno del asistente. Se uso el optimizador Adam (beta2 0,95, weight decay 0,1) con tasa de aprendizaje 5e-6 y decaimiento coseno hasta 5e-7, con 30 pasos de warmup. El lote global fue de 128 secuencias empaquetadas (aproximadamente 524.000 tokens por paso) durante 573 pasos y una sola epoca. La infraestructura fueron 2 nodos de 8 GPU H100 de 80 GB (16 GPU en total) con TP2, SP y EP8, recomputacion selectiva y precision BF16, usando Megatron-Bridge 0.6.1 sobre el contenedor NeMo 26.08.01. La perdida de validacion final fue de 0,371 (frente a 0,394 en el paso 100). El turno del asistente se entrena en el formato nativo de razonamiento del modelo base: `<think>...</think>` seguido de la respuesta, terminando en `Final answer: <number>`.

## Capacidades

- Generacion de texto conversacional y razonamiento paso a paso en formato explicito (`<think>`), heredado del modelo base.
- Aritmetica de criquet T20 International: calculo de ritmo de carrera, ritmo requerido, proyecciones de puntuacion final, strike rate e hitos (por ejemplo, century o fifty).
- Razonamiento aritmetico de multiples pasos con verificacion, entrenado especificamente sobre trazas verificadas.
- Reduccion marcada de la longitud de la cadena de razonamiento tras el SFT: la media de tokens generados baja de 1.700 a 519, y el porcentaje de generaciones truncadas a 6.144 tokens pasa del 4,9% al 0,0%.
- Razonamiento en ingles como minimo (el prompt de sistema y el formato de respuesta del dataset estan en ingles); el resto de idiomas no esta documentado.
- Capacidades agenticas y de tool calling heredadas del modelo base segun la documentacion de NVIDIA, aunque no se verifica en la informacion proporcionada que el SFT las preserve.
- Capacidad de ventana larga de 256.000 tokens heredada del modelo base, util para contexto de multiples partidos o historicos extensos.
- No se documentan capacidades de vision, audio ni otras modalidades.

## Casos de uso

- Analisis de ritmo de carrera en directo: durante una retransmision de un T20I, el modelo recibe el estado del partido (overs, runs, wickets, objetivo) y calcula en pocos cientos de tokens el ritmo actual y el ritmo requerido, con la ventaja de que la respuesta especializada es mucho mas corta que la del modelo base.
- Motores de proyeccion para apuestas deportivas: dado un estado parcial, el modelo estima la puntuacion final esperada y los hitos probables, con una exactitud reportada del 97,0% en el benchmark interno de 600 preguntas.
- Asistentes para analistas y cuerpo tecnico: simulacion de escenarios hipoteticos ("que pasa si se anotan X runs en los proximos Y overs"), comparando ritmos y detectando cuellos de botella.
- Generacion automatica de resumenes post-partido: a partir de un historico de jugadas, el modelo produce resumenes con cifras de strike rate, hitos alcanzados y momentos decisivos, manteniendo coherencia numerica.
- Chatbots de aficionados con contexto largo: gracias a los 256.000 tokens de ventana, se puede inyectar el historico completo de una temporada o varios partidos y responder preguntas estadisticas en una sola conversacion.
- Contenido editorial y datos para medios deportivos: generacion de piezas estadisticas y graficos anotados a partir de estados de partido, reduciendo el trabajo manual de calculo.
- Herramienta educativa: explicacion paso a paso de la aritmetica del criquet (formulas de ritmo, calculo de objetivos con Duckworth-Lewis simplificado, etc.) para cursos o materiales de formacion.
- Base para transferencia a otros dominios: el pipeline de datos y el formato `<think>` pueden reutilizarse para crear variantes especializadas en otros deportes o dominios de razonamiento aritmetico.

## Benchmarks y rendimiento

El autor publica un benchmark propio sobre 600 preguntas de partidos no vistos, con 4 muestras por pregunta (temperatura 1,0, top_p 0,95), comparando el modelo base y el ajustado. No se trata de benchmarks estandar (MMLU, HumanEval, GSM8K), por lo que no son directamente comparables con otros modelos.

| Metrica | Base (NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16) | Ajustado (Cricket-Reasoning) |
|---|---|---|
| Exactitud global (600 preguntas, 4 muestras) | 89,6% | 97,0% |
| Chase rate | 77,8% | 94,1% |
| Milestone (hitos) | 99,4% | 99,6% |
| Run rate | 91,8% | 97,1% |
| Media de tokens generados | 1.700 | 519 |
| Generaciones truncadas a 6.144 tokens | 4,9% | 0,0% |
| Perdida de validacion final | no disponible | 0,371 |

No se han publicado resultados de benchmarks estandar (MMLU, GSM8K, HumanEval, etc.) en la informacion disponible.

## Requisitos de hardware

- Pesos en BF16: 31,6 B de parametros a 2 bytes por parametro suponen aproximadamente 63 GB de pesos, coherente con el tamano de repositorio de 65,8 GB.
- Memoria para inferencia en BF16: alrededor de 70-80 GB de VRAM considerando pesos, cache de clave-valor y overhead, aunque la arquitectura MoE con 3 B activos reduce el coste de computo respecto a un modelo denso de 30 B. Una sola H100 de 80 GB puede quedarse justa; se recomienda 2xH100 80GB o 2xA100 80GB.
- Cuantizacion a FP8: aproximadamente 32 GB de pesos, lo que permite una A100 80GB, H100 80GB o configuraciones duales de 48 GB.
- Cuantizacion a 4 bits: aproximadamente 17-18 GB de pesos, lo que permitiria ejecutarlo en una RTX 4090 de 24 GB o RTX 5090 de 32 GB. No se proporcionan cuantizaciones pregeneradas en el repositorio.
- Aptitud para GPU de consumo: solo con cuantizacion; no cabe en BF16 en ninguna GPU de consumo actual.
- Opciones de despliegue: el modelo base y el ajuste se documentan para vLLM y Transformers, con el argumento `enable_thinking=True`. La compatibilidad con llama.cpp, Ollama u otros motores no esta confirmada en la informacion disponible.
- Latencia y throughput: no se han publicado cifras concretas en la informacion disponible. Como referencia cualitativa, la arquitectura hibrida con 3 B activos y las tecnicas de decodificacion especulativa que NVIDIA publica junto a la familia Lightning 3.5 estan orientadas a reducir latencia.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Balab2021/Nemotron-3.5-Lightning-30B-A3B-Cricket-Reasoning | 31,6 B / ~3 B | 256.000 | 97,0% en benchmark propio de criquet T20 (600 preguntas) | nvidia-open-model-license | HuggingFace, safetensors BF16 |
| nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 (base) | 30 B / 3 B | 256.000 | 89,6% en el mismo benchmark (sin especializar) | nvidia-open-model-license | HuggingFace, safetensors BF16 |
| nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4 | 30 B / 3 B (aproximado) | no disponible | no disponible | nvidia-open-model-license | HuggingFace, cuantizado NVFP4 |
| Balab2021/Nemotron-3.5-Lightning-30B-A3B-LoRA | 30 B / 3 B (aproximado) | 256.000 (heredado) | no disponible | no disponible en la informacion proporcionada | HuggingFace, adaptador LoRA |

No se dispone de datos de benchmarks comparables con otras familias de modelos MoE de aproximadamente 30 B totales y 3 B activos (por ejemplo, Qwen3-30B-A3B) en la informacion proporcionada.

## Limitaciones y advertencias

- Especializacion muy estrecha: el ajuste esta centrado en aritmetica de criquet T20 International; es probable que haya degradado capacidades generales del modelo base fuera de ese dominio, aunque no se aportan datos al respecto.
- Riesgo de alucinacion en cifras: pese a la mejora en exactitud, un 3,0% de respuestas incorrectas en el benchmark propio implica que las cifras no deben usarse sin verificacion en contextos de produccion, especialmente apostando o publicando datos.
- Benchmark propio no estandar: el 97,0% de exactitud procede de un conjunto de 600 preguntas del propio autor, no de benchmarks publicos independientes; no es comparable con MMLU, GSM8K o HumanEval.
- Idiomas no documentados: no se especifica que idiomas soporta el modelo tras el ajuste; el prompt de sistema y el formato de respuesta estan en ingles.
- Licencia: se hereda la nvidia-open-model-license del modelo base, etiquetada como `license: other` en HuggingFace. Es imprescindible revisar los terminos de la NVIDIA Open Model License antes de cualquier uso comercial, incluida la redistribucion de pesos o de derivados.
- Formato de respuesta rigido: el modelo espera el formato `<think>...</think>` y la linea `Final answer: <number>`. Fuera de ese formato la calidad puede degradarse.
- Repositorio sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la ficha, creado el 8 de octubre de 2026; no hay informes independientes de terceros ni auditoria.
- Sin cuantizaciones oficiales: al no publicarse variantes GGUF, GPTQ o AWQ, el despliegue en GPU de consumo requiere generar la cuantizacion por cuenta propia, con el riesgo de degradacion adicional.
- Requisito de hardware elevado en BF16: la inferencia sin cuantizar exige aproximadamente 63 GB de pesos, lo que limita el despliegue a nodos con multiples GPU de 80 GB.
- Capa agentica no verificada: aunque el modelo base se comercializa como agentico, el autor no documenta que el SFT haya preservado tool calling, uso de agentes o razonamiento multi-paso general.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Balab2021/Nemotron-3.5-Lightning-30B-A3B-Cricket-Reasoning
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Variante cuantizada del modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4
- Variante LoRA del mismo autor: https://huggingface.co/Balab2021/Nemotron-3.5-Lightning-30B-A3B-LoRA
- Dataset de entrenamiento: https://huggingface.co/datasets/Balab2021/CricketData-T20-Reasoning-Qwen3.8-Full
- Metricas de entrenamiento (Weights & Biases): https://wandb.ai/balabala76/nemotron35-cricket-reasoning/runs/8qh82u2z
- Documentacion de Megatron-Bridge para Nemotron 3.5 Lightning: https://docs.nvidia.com/nemo/megatron-bridge/nightly/models/nemotron/nemotron3.5-lightning.html
- Model card de NVIDIA NIM: https://build.nvidia.com/nvidia/nemotron-3.5-lightning-30b-a3b/modelcard
- Pagina de NVIDIA NIM: https://build.nvidia.com/nvidia/nemotron-3.5-lightning-30b-a3b
