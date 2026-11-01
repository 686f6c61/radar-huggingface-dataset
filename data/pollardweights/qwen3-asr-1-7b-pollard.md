# PollardWeights/Qwen3-ASR-1.7B-Pollard

## Resumen

Qwen3-ASR-1.7B-Pollard es una colección de cuantizaciones GGUF del modelo de reconocimiento automático de voz Qwen3-ASR-1.7B de Qwen, preparada por el cuantizador PollardWeights. El modelo base es un modelo ASR conversacional de unos 2.300 millones de parámetros (2.031.739.904 parámetros reales según los safetensors) que acepta entrada de texto y audio. La contribución principal de este repositorio no es la arquitectura, sino el proceso de compresión: Pollard aplica cuantización de "asignación medida" (measured allocation), que coloca los bits según la sensibilidad de cada capa en lugar de aplicar una reducción uniforme, y usa matrices de importancia (imatrix) para calibrar la cuantización.

La relevancia práctica de esta ficha está en el ahorro de memoria: el modelo pasa de 4,70 GB en f16 a entre 0,85 GB (IQ2_XXS) y 1,67 GB (Q6_K), lo que permite ejecutar ASR local en equipos modestos, portátiles o GPUs de consumo sin sacrificar toda la fidelidad. Cada "rung" (escalón) de la escalera de cuantización ha sido verificado con `pollard-verify --gate` y publica métricas medidas de perplejidad, KLD media y concordancia top-1 respecto al modelo f16 original, de modo que el usuario puede elegir cuantización con datos objetivos y no solo por tamaño de archivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen3_asr` (transformer ASR, entrada de texto y audio) |
| Parametros totales | 2.031.739.904 (~2,3B según la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (los harness indican contextos de 8k a 64k según configuración) |
| Tipos de cuantizacion | IQ2_XXS (0,85 GB), IQ3_S (1,11 GB), IQ4_XS (1,28 GB), Q6_K (1,67 GB); referencia f16 4,70 GB y Q8_0 ~2,49 GB |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado con imatrix, compatible con llama.cpp estándar) |

## Arquitectura y entrenamiento

El modelo base, Qwen3-ASR-1.7B de Qwen, es un modelo de reconocimiento automático de voz con arquitectura `qwen3_asr` que procesa entrada de audio (y texto) para transcripción conversacional. El repositorio no documenta detalles del preentrenamiento del modelo base (número de tokens, composición del dataset ni uso de RLHF/DPO): no disponible.

Sobre el modelo base, PollardWeights aplica su método de cuantización "measured allocation", implementado en la herramienta open source Pollard Weights. En lugar de comprimir todas las capas por igual, se mide la sensibilidad de cada capa y se asignan más bits a las capas críticas y menos a las tolerantes. La cuantización se calibra con una matriz de importancia (imatrix) y cada archivo resultante se valida con `pollard-verify --gate`, que comprueba que el modelo está completo (todas las torres, proyectores y archivos del procesador del original), que carga correctamente y que supera pruebas de coherencia y ejecución. No hay datos de entrenamiento adicional ni fine-tuning: es puramente cuantización post-entrenamiento.

## Capacidades

- Reconocimiento automático de voz (ASR): transcripción de audio conversacional, la tarea para la que está diseñado el modelo base.
- Entrada multimodal limitada: acepta texto y audio como entradas.
- Ejecución local y offline en CPU o GPU modestas gracias a los GGUF cuantizados.
- Compatibilidad con servidores OpenAI-compatible vía `llama-server` (endpoint `/v1/chat/completions`, `/v1/messages` de Anthropic y `/v1/responses` según el harness).
- Integración con agentes y harness de código: Claude Code, Codex CLI, OpenCode, Aider, Cline/Roo Code, Continue, Goose, OpenHands, Open WebUI, Oh My Pi, entre otros, mediante `pollard serve` o configuración manual.
- No hay evidencia en la documentación de tool calling nativo, thinking mode, salida de audio ni traducción: no disponible.

## Casos de uso

- Transcripción local de notas de voz y reuniones: con el rung IQ4_XS o Q6_K (1,28–1,67 GB) se puede transcribir audio conversacional en un portátil sin enviar datos a la nube, adecuado para escenarios con requisitos de privacidad.
- Subtitulado de grabaciones en inglés en equipos de bajos recursos: el rung IQ2_XXS (0,85 GB) cabe en máquinas con ~2,8 GB de RAM/VRAM libres, permitiendo procesar lotes de audio en hardware muy limitado.
- Integración en pipelines de agentes de código con entrada por voz: el modelo se expone vía `llama-server` con API OpenAI-compatible, de modo que harness como Aider o Continue pueden dirigirlo con voz.
- Prototipado de aplicaciones de voz con LM Studio, Jan, koboldcpp u Ollama: los GGUF son estándar y funcionan sin herramientas adicionales (`ollama run hf.co/PollardWeights/Qwen3-ASR-1.7B-Pollard:IQ2_XXS`).
- Despliegue en servidores edge o VPS pequeños: con 1–2 GB de memoria dedicada al modelo, se puede montar un servicio de transcripción con `llama-server` y API web en el puerto 8080.
- Evaluación comparativa de cuantizaciones ASR: las métricas publicadas (PPL, KLD, top-1 agree) permiten usar este repo como referencia para estudiar el impacto de la cuantización extrema en modelos de audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (WER, MMLU, etc.) en la información disponible. Sí se publican métricas de calidad de cuantización medidas con llama-perplexity y pollard-verify:

| Archivo | Perplejidad (PPL) | Tamaño | KLD media | Concordancia top-1 |
|---|---:|---:|---:|---:|
| IQ2_XXS | 18,4379 | 0,85 GB | 1,43 | 48,54% |
| IQ3_S | 5,5715 | 1,11 GB | 0,2141 | 79,39% |
| IQ4_XS | 4,8293 | 1,28 GB | 0,0541 | 88,75% |
| Q6_K | 4,6782 | 1,67 GB | 0,0164 | 93,69% |

La concordancia top-1 indica el porcentaje de tokens cuya predicción más probable coincide con la del modelo f16 original; a mayor valor, más fiel es la cuantización. Nótese que IQ2_XXS muestra una degradación notable (48,54% de concordancia, PPL 18,4), por lo que la model card recomienda Q6_K como opción por defecto.

## Requisitos de hardware

- IQ2_XXS: 0,85 GB de pesos, ~2,8 GB de RAM/VRAM recomendados.
- IQ3_S: 1,11 GB de pesos, ~3,1 GB de RAM/VRAM recomendados.
- IQ4_XS: 1,28 GB de pesos, ~3,3 GB de RAM/VRAM recomendados.
- Q6_K: 1,67 GB de pesos, ~3,7 GB de RAM/VRAM recomendados.
- Cabe sobradamente en GPUs de consumo (cualquier GPU con 4 GB de VRAM, como una RTX 3050 o superior) e incluso funciona solo con CPU dada la carga completa con `-ngl 99` en GPUs disponibles.
- Despliegue: llama.cpp (`llama-cli` / `llama-server`), ik_llama.cpp, Ollama, LM Studio, koboldcpp, Jan, ramalama; también `pollard serve` para configuración automática de harness.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Tamaño mínimo | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3-ASR-1.7B-Pollard (este) | ~2,3B | GGUF (IQ2_XXS a Q6_K) | 0,85 GB | Apache 2.0 | Cuantización measured-allocation con imatrix y verificación |
| Qwen/Qwen3-ASR-1.7B (base) | ~2,3B | safetensors (f16) | 4,70 GB | Apache 2.0 | Máxima fidelidad, mayor huella de memoria |
| Whisper small / medium (OpenAI) | 244M / 769M | GGUF, PyTorch | ~0,1–0,5 GB cuantizado | MIT | ASR multilingüe muy extendido, menor tamaño pero arquitectura distinta |

No hay datos de benchmarks comparativos directos de calidad de transcripción entre estos modelos en la información disponible.

## Limitaciones y advertencias

- Idioma: el repositorio declara soporte solo para inglés (en); el rendimiento en castellano u otros idiomas no está documentado.
- El rung IQ2_XXS presenta una degradación medible importante (PPL 18,44 frente a 4,68 de Q6_K; solo 48,54% de concordancia top-1), por lo que no se recomienda para producción si la fidelidad importa.
- La cuantización extrema puede introducir errores de transcripción, alucinaciones o repeticiones, especialmente en audio ruidoso o con acentos no representados en los datos de calibración.
- La model card advierte que los valores "below band" indican métricas fuera de la banda esperada para su ancho de bits: se reportan pero no bloquean la publicación.
- Sesgos del modelo base: no disponible; deben asumirse los del Qwen3-ASR original de Qwen.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar también los términos del modelo base Qwen/Qwen3-ASR-1.7B.
- Detalles del modelo base (longitud máxima de contexto nativa, datos de entrenamiento) no están disponibles en esta documentación.

## Enlaces

- Repositorio del modelo: https://huggingface.co/PollardWeights/Qwen3-ASR-1.7B-Pollard
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Herramienta de cuantización Pollard Weights: https://github.com/WestWaters/pollard-weights
