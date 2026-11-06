# glossia/Rambley-V2.2-64M

## Resumen

Rambley-V2.2-64M es un modelo de lenguaje de pequeno tamano (63.874.704 parametros) desarrollado por glossia, pensado como banco de pruebas para tecnicas de entrenamiento modernas en regimenes de computo reducido. Se trata de un transformer decoder-only preentrenado sobre aproximadamente 12.900 millones de tokens (DCLM-Edu, UltraData-Math y otras mezclas) y posteriormente afinado sobre unos 4.000 millones de tokens adicionales de una mezcla filtrada de datos reales y sinteticos orientada a mejorar resultados en benchmarks sin destruir por completo la capacidad de modelado general del lenguaje.

Su interes tecnico no reside en el rendimiento absoluto, sino en la combinacion de decisiones arquitectonicas poco habituales en modelos de esta escala: entrenamiento nativo en FP8, MLPs SwiGLU con factor de expansion 2,5x, atencion con compuertas por cabeza (headwise gated attention), attention sinks aprendidos por cabeza, patron SWA:SWA:GQA con ventana deslizante de 128 tokens, embeddings posicionales HoPE y un 60% del presupuesto de preentrenamiento realizado con pretraining a nivel de parche.

El modelo se distribuye bajo licencia CC-BY-SA-4.0, con pesos en safetensors y codigo de modelado personalizado (`custom_code`), lo que obliga a confiar en la implementacion del autor (`trust_remote_code`). Su contexto nativo es de 2048 tokens y no se han publicado datos de idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con atencion hibrida SWA:SWA:GQA, gated attention por cabeza, attention sinks aprendidos y HoPE |
| Parametros totales | 63.874.704 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (nativa); ventana deslizante de 128 en capas SWA |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor no documenta variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | safetensors (con `custom_code` y modelo base `glossia/Rambley-V2.2-64M-Pretrain`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con una pila de capas que alterna atencion de ventana deslizante (SWA) y atencion global con query grouping (GQA), forzando la ultima capa a GQA. Incorpora compuertas por cabeza en la atencion (Qiu et al., 2025), elegidas frente a compuertas elemento a elemento para ahorrar parametros en las familias pequenas, y attention sinks aprendidos en cada cabeza (OpenAI, 2026; LLM-Core Xiaomi, 2026). Los MLPs SwiGLU usan un factor de expansion intermedio de 2,5x. La posicion se codifica con HoPE tanto en capas SWA como GQA (Chen et al., 2024), lo que permite cierto grado de extrapolacion mas alla de la ventana nativa, aunque el autor declara 2048 tokens como contexto nativo.

El preentrenamiento cubre unos 12.900 millones de tokens, de los cuales el 60% se proceso con pretraining a nivel de parche (Shao et al., 2025; Peng et al., 2026). El modelo se entreno nativamente en FP8. La optimizacion combina Muon con LR 0,02 para matrices y restricciones de norma de pesos Hyperball (Wen et al., 2026), AdamW con LR 0,002 sin weight decay ni Hyperball para embeddings, vectores y normas, y el scheduler AIR (Yu et al., 2026). La fase de ajuste posterior anade unos 4.000 millones de tokens de una mezcla filtrada de datos reales y sinteticos. En el dataset ClimbMix solo se emplearon los clusters 2, 6, 12 y 15, excluyendo explicitamente el cluster de matematicas y la mayor parte de los de STEM.

## Capacidades

- Generacion de texto autoregresiva en contexto corto (hasta 2048 tokens nativos).
- Razonamiento basico y respuesta a preguntas de sentido comun, con rendimiento bajo-medio en ARC y HellaSwag (ver benchmarks).
- Modelado de lenguaje general tras el ajuste, con datos de DCLM-Edu, UltraData-Math, TxT360-v2, libretexts, mga-fineweb-edu y ClimbMix.
- Capacidad aritmetica limitada: 33,10% en arithmark-3 (raw) y 33,20% normalizado.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue; el autor no declara idiomas.
- No dispone de vision, audio ni modo thinking explicito.
- Al ser un modelo de 64M, no es adecuado para instrucciones complejas ni para tareas de codigo de produccion.

## Casos de uso

- Investigacion en tecnicas de entrenamiento: sirve como banco de pruebas reproducible para validar FP8 nativo, Muon con Hyperball, HoPE, attention sinks o pretraining a nivel de parche en un regimen de computo de una sola GPU.
- Ablaciones academicas de atencion hibrida: el patron SWA:SWA:GQA con ventana de 128 permite estudiar el equilibrio entre coste de atencion y calidad en contextos de 2048 tokens.
- Generacion de texto de relleno o sintetico a gran escala: con 64M de parametros y pesos de 0,1 GB, puede generar continuaciones masivamente en CPU o GPU de gama baja para aumentar datasets.
- Clasificacion y puntuacion de texto ligero: fine-tuning sobre tareas de etiquetado (sentimiento, topicos) con cabezas lineales, aprovechando su bajo coste de inferencia.
- Filtrado o deduplicacion semantica de corpus: usar sus embeddings internos o perplejidad para descartar documentos de baja calidad en pipelines de curacion de datos.
- Educacion y demos de LLM: desplegarlo en portatiles o entornos con recursos limitados para explicar conceptos de tokenizacion, atencion y decodificacion sin necesidad de infraestructura.
- Pruebas de compatibilidad de toolchains (vLLM, llama.cpp, TGI) antes de escalar a modelos mayores con la misma arquitectura.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card:

| Tarea | Version | Filtro | n-shot | Metrica | Valor | Stderr |
|---|---|---|---|---|---|---|
| arc_challenge | 1 | none | 0 | acc | 0,1980 | ±0,0116 |
| arc_challenge | 1 | none | 0 | acc_norm | 0,2474 | ±0,0126 |
| arc_easy | 1 | none | 0 | acc | 0,4903 | ±0,0103 |
| arc_easy | 1 | none | 0 | acc_norm | 0,4390 | ±0,0102 |
| hellaswag | 1 | none | 0 | acc | 0,2883 | ±0,0045 |
| hellaswag | 1 | none | 0 | acc_norm | 0,3061 | ±0,0046 |
| piqa | 1 | none | 0 | acc | 0,6289 | ±0,0113 |
| piqa | 1 | none | 0 | acc_norm | 0,6208 | ±0,0113 |
| arithmark-3 | - | - | - | raw | 33,10% (331/1000) | no disponible |
| arithmark-3 | - | - | - | normalized | 33,20% (332/1000) | no disponible |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni comparaciones directas con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia en BF16: aproximadamente 0,13 GB para pesos (63,87M x 2 bytes), mas cache KV. En la practica cabe en cualquier GPU con 1 GB o mas.
- VRAM en FP32: unos 0,26 GB de pesos. En FP8 (si se aplica cuantizacion): unos 0,07 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) e incluso iGPU o CPU. No requiere A100/H100.
- Cabe en consumer GPU: si, con margen amplio; tambien en Raspberry Pi y telefonos de gama alta.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (obligatorio por `custom_code`), vLLM y TGI solo si soportan la arquitectura personalizada; llama.cpp/Ollama requeririan conversion a GGUF no publicada por el autor.
- Latencia y throughput: no disponibles de forma oficial. El log del autor reporta 931,5 ejemplos/s en la evaluacion de arithmark-3 en su entorno (tokenize 0,24 s, evaluate 1,07 s para 1000 ejemplos), pero no es una medida estandarizada de throughput de generacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Rambley-V2.2-64M | 63,87M | 2048 | CC-BY-SA-4.0 | Arquitectura experimental (SWA:SWA:GQA, HoPE, FP8 nativo) |
| SmolLM-135M (Hugging Face) | 135M | 2048 | Apache-2.0 | Mayor tamano; requiere verificacion de benchmarks |
| Pythia-70M (EleutherAI) | 70M | 2048 | Apache-2.0 | Suite de investigacion con checkpoints intermedios |
| GPT-2 small (OpenAI) | 124M | 1024 | MIT | Referencia historica; sin datos comparativos publicados aqui |

No se dispone de comparaciones de rendimiento publicadas entre Rambley-V2.2-64M y estos modelos en la informacion proporcionada; la tabla solo contrasta parametros, contexto y licencia.

## Limitaciones y advertencias

- Rendimiento bajo en tareas de razonamiento: 19,8% en ARC-Challenge y 28,8% en HellaSwag (acc), muy por debajo de modelos de mayor tamano.
- Riesgo elevado de alucinacion y de incoherencia en generaciones largas por su escala (64M) y contexto corto (2048 tokens).
- Capacidad aritmetica limitada (33% en arithmark-3), coherente con la exclusion del cluster de matematicas de ClimbMix.
- No se declaran idiomas soportados; es probable que el entrenamiento este dominado por ingles, pero no hay confirmacion del autor.
- Licencia CC-BY-SA-4.0: permite uso comercial, pero obliga a atribuir y a compartir obras derivadas bajo la misma licencia, lo que puede ser incompatible con productos propietarios.
- Requiere `trust_remote_code=True` por el uso de `custom_code`; auditar el codigo antes de desplegar en produccion.
- No hay pesos cuantizados oficiales (GGUF, AWQ, GPTQ) ni integracion documentada en llama.cpp u Ollama.
- El ajuste posterior prioriza benchmarks con datos sinteticos, lo que puede inflar metricas sin mejorar la calidad real en uso general.
- No apto para produccion en tareas de codigo, agentes o atencion al cliente sin un fine-tuning especifico y validacion exhaustiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/glossia/Rambley-V2.2-64M
- Modelo base de preentrenamiento: https://huggingface.co/glossia/Rambley-V2.2-64M-Pretrain
- Codigo de preentrenamiento: https://code.allura.moe/fizz/lobotomy
- Discord del autor: https://discord.gg/6acXmq3yx2
- Paper de headwise gated attention (Qiu et al., 2025): https://arxiv.org/abs/2505.06708v1
- Paper de attention sinks (OpenAI, 2026): https://arxiv.org/abs/2508.10925
- Paper de attention sinks (LLM-Core Xiaomi, 2026): https://arxiv.org/abs/2601.02780
- Paper de ventana deslizante (Qiao et al., 2026): https://arxiv.org/abs/2606.15378
- Paper de HoPE (Chen et al., 2024): http://arxiv.org/abs/2410.21216v2
- Paper de pretraining a nivel de parche (Shao et al., 2025): https://arxiv.org/abs/2407.12665v3
- Paper de pretraining a nivel de parche (Peng et al., 2026): https://arxiv.org/abs/2605.06546
- Paper de Muon con Hyperball (Wen et al., 2026): https://arxiv.org/abs/2606.16899v1
- Paper del scheduler AIR (Yu et al., 2026): https://arxiv.org/abs/2610.40362
- Dataset glossia/picl-text: https://huggingface.co/datasets/glossia/picl-text
- Dataset IFM/TxT360-v2: https://huggingface.co/datasets/IFM/TxT360-v2
- Dataset HuggingFaceTB/dclm-edu: https://huggingface.co/datasets/HuggingFaceTB/dclm-edu
- Dataset common-pile/libretexts_filtered: https://huggingface.co/datasets/common-pile/libretexts_filtered
- Dataset ByteDance-Seed/mga-fineweb-edu: https://huggingface.co/datasets/ByteDance-Seed/mga-fineweb-edu
- Dataset gvlassis/ClimbMix: https://huggingface.co/datasets/gvlassis/ClimbMix
