# MatterWaveAI/grt-30m-omni

## Resumen

GRT-30M-Omni es un modelo multimodal "any-to-any" desarrollado por MatterWaveAI que unifica comprensión de imágenes, percepción de audio y voz, generación de lenguaje causal y síntesis de voz armónica a 16 kHz en un único espacio de fase toroidal de 256 dimensiones. Se trata de una variante multimodal del modelo base `MatterWaveAI/grt-30m`, con un total de 38.718.581 parámetros reales según los pesos en safetensors. Su rasgo distintivo es que no contiene ninguna matriz densa `nn.Linear` ni capas `nn.Conv1d`: toda la computación se articula mediante rotaciones de Givens sobre pares planares.

El modelo se compone de cuatro bloques: una torre visual (`GRTVisionModel`, 4.954.258 parámetros), una torre de audio (`GRTAudioModel`, 3.288.972 parámetros), un backbone de lenguaje causal de 12 capas (`GRTModel` + `GRTCosineHead`, 29.305.498 parámetros) y una cabeza vocoder polar (`GRTPolarVocoderHead`, 47.361 parámetros) que sintetiza voz a 16 kHz. La relevancia de este lanzamiento es fundamentalmente de investigación: explora si una arquitectura puramente rotacional, sin proyecciones lineales convencionales, puede sostener alineamiento tri-modal (visión, audio, texto) y síntesis de voz en un presupuesto de parámetros extremadamente reducido.

Por su tamaño (~38,7 M de parámetros) y su enfoque arquitectónico experimental, GRT-30M-Omni no está pensado como sustituto de modelos multimodales de producción, sino como banco de pruebas para estudiar optimizadores geométricos y dinámicas de alineamiento entre modalidades. La model card incluye un ablation de ocho optimizadores geométricos clásicos sobre un presupuesto controlado de 200 pasos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer rotacional multimodal (Givens Rotational Transformer) con torres visual y de audio, backbone causal de 12 capas y cabeza vocoder polar |
| Parametros totales | 38.718.581 (safetensors); 37.596.089 según model card |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF disponible en el repositorio; niveles concretos no disponibles |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo sustituye las proyecciones lineales densas por rotaciones de Givens organizadas en pares planares dentro de un espacio de fase toroidal de 256 dimensiones (128 pares). El backbone lingüístico es un transformer causal de 12 capas con embeddings polares atados y cabeza coseno (`GRTCosineHead`). La torre visual emplea un stem de parches polares 14x14, RoPE 2D, seis bloques rotacionales bidireccionales y un merger espacial 2x2 que produce 64 tokens visuales. La torre de audio usa un stem STFT polar (`n_fft=254`, `hop=160`), RoPE 1D, cuatro bloques rotacionales bidireccionales y un merger temporal 2x que genera 64 tokens de audio. La cabeza de voz es una cascada de 15 etapas de mariposa de Givens con expand/RadialGELU/contract y `frames_per_token=4`, seguida de `torch.istft` a 16 kHz.

No se especifican en la información disponible el volumen de tokens de entrenamiento ni la composición del dataset. La model card documenta un ablation de optimizadores geométricos (HuygensAdam, HessianPairAdam/Sophia-Torus, PairAdam, PolarNaturalAdam, CyclideAdam, GyricAdam, SymplecticAdam, HuygensSymplecticAdam) sobre un presupuesto de 200 pasos en tres etapas: 80 pasos de alineamiento rotacional de `GRTAudioModel`, 70 pasos de alineamiento multimodal del bloque superior de `GRTModel` y 50 pasos de `GRTPolarVocoderHead` con codec RVQ de 4 codebooks, con semilla 42 y ejecución en AMD Radeon 8060S Graphics. No se documenta RLHF ni DPO.

## Capacidades

- Comprensión de imágenes: captioning visual con métricas reportadas de color, forma y posición.
- Percepción de audio y voz: reconocimiento con métricas de voz, prosodia y frase.
- Generación de lenguaje causal a partir de entradas multimodales.
- QA conjunta audio-visual: razonamiento simultáneo sobre imagen y audio con exact match reportado del 83,3%.
- Síntesis de voz a 16 kHz mediante la cabeza vocoder polar (`GRTPolarVocoderHead`).
- Generación de texto y voz simultáneas desde una misma entrada (pipeline `any-to-any`).
- Compatible con la librería `transformers` mediante `GRTOmniForConditionalGeneration` y `AutoTokenizer`.
- No se documenta soporte de tool calling, function calling ni razonamiento agéntico multi-paso.
- No se documenta capacidad multilingüe específica.

## Casos de uso

- Investigación en arquitecturas sin proyecciones lineales: el modelo sirve como banco de pruebas reproducible para estudiar si las rotaciones de Givens pueden reemplazar `nn.Linear` en tareas multimodales, con métricas de ablation ya publicadas.
- Estudio de optimizadores geométricos: permite replicar el ablation de ocho optimizadores (HuygensAdam, HessianPairAdam, PairAdam, etc.) sobre un presupuesto de 200 pasos en hardware de consumo, comparando pérdida combinada y precisión de tokens.
- Prototipado de captioning visual de bajo coste: con 4,95 M de parámetros en la torre visual y 64 tokens por imagen, es viable para experimentos académicos de descripción de color, forma y posición en hardware modesto.
- QA audio-visual de investigación: la combinación de torre de audio (3,29 M parámetros) y torre visual permite estudiar alineamiento conjunto imagen-audio en tareas controladas con exact match medible.
- Síntesis de voz experimental: la cabeza vocoder polar (47.361 parámetros) con `frames_per_token=4` e `istft` a 16 kHz permite estudiar síntesis armónica de bajo coste con métricas de similitud coseno polar y SNR espectral.
- Educación y divulgación: por su tamaño (~38,7 M de parámetros) y licencia Apache 2.0, es adecuado para demostraciones docentes de arquitecturas rotacionales y dinámicas de fase en transformers.
- Reproducción de experimentos con GGUF: la disponibilidad de pesos en GGUF facilita ejecutar el modelo en entornos con recursos limitados para validar hallazgos del ablation.

## Benchmarks y rendimiento

Evaluación multimodal held-out reportada en la model card:

| Tarea | Métrica | Valor |
|---|---|---|
| Visual captioning | Perplejidad | 1,18 |
| Visual captioning | Color | 95,8% |
| Visual captioning | Forma | 58,3% |
| Visual captioning | Posición | 95,8% |
| Audio recognition | Perplejidad (de 29312,46 a) | 1,10 |
| Audio recognition | Voz | 100,0% |
| Audio recognition | Prosodia | 70,8% |
| Audio recognition | Frase | 100,0% |
| Joint audio-visual QA | Perplejidad (de 884,35 a) | 1,06 |
| Joint audio-visual QA | Exact match | 83,3% |
| Vocoder de respuesta hablada | Similitud coseno polar | 0,9733 |
| Vocoder de respuesta hablada | SNR espectral | 10,49 dB |

Ablation de optimizadores (200 pasos, seed 42, AMD Radeon 8060S):

| Rank | Optimizador | Pérdida val tri-modal | PPL combinada | Top-1 texto | Top-1 RVQ | SNR vocoder (dB) | Tiempo (s) |
|---|---|---|---|---|---|---|---|
| 1 | HuygensAdam | 1,2674 | 3,5516 | 95,97% | 34,05% | 4,55 | 526,81 |
| 2 | HessianPairAdam | 1,2779 | 3,5891 | 96,77% | 35,89% | 4,20 | 493,02 |
| 3 | PairAdam | 1,2920 | 3,6401 | 96,60% | 33,47% | 4,42 | 518,75 |
| 4 | PolarNaturalAdam | 1,2945 | 3,6492 | 96,20% | 32,62% | 4,37 | 370,28 |
| 5 | CyclideAdam | 1,2957 | 3,6536 | 96,18% | 34,21% | 4,35 | 434,03 |
| 6 | GyricAdam | 1,3383 | 3,8126 | 95,65% | 29,05% | 4,36 | 450,13 |
| 7 | SymplecticAdam | 1,3702 | 3,9361 | 96,37% | 31,30% | 4,00 | 444,90 |
| 8 | HuygensSymplecticAdam | 1,3738 | 3,9503 | 96,32% | 32,76% | 4,14 | 517,53 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo completo en float32 ocupa aproximadamente 155 MB (38,7 M de parámetros × 4 bytes); en float16 unos 77 MB; en cuantizaciones GGUF de 4 bits, por debajo de 50 MB. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre; el ablation se ejecutó en una AMD Radeon 8060S Graphics (iGPU). Funciona también en CPU.
- Cabe en GPU consumer: sí, en cualquier RTX 20/30/40, AMD RX 6000/7000, iGPU modernas e incluso en Raspberry Pi con suficiente RAM.
- Opciones de despliegue: `transformers` (soporte nativo con `GRTOmniForConditionalGeneration`), llama.cpp/Ollama vía pesos GGUF, y potencialmente vLLM/TGI aunque no se documenta soporte explícito.
- Latencia y throughput: no disponibles. El ablation reporta tiempos de entrenamiento de 370-527 s para 200 pasos en una iGPU, lo que da una idea del orden de magnitud del coste por paso, pero no de la latencia de inferencia.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con modelos de la misma categoría en la información proporcionada. Los modelos multimodales any-to-any de referencia (p. ej. Qwen2.5-Omni, MiniCPM-o, Gemini nativo) tienen órdenes de magnitud más de parámetros (miles de millones frente a 38,7 M) y no son directamente comparables en capacidades. La comparación más pertinente es con el modelo base `MatterWaveAI/grt-30m`, del cual GRT-30M-Omni es una extensión multimodal.

| Modelo | Parámetros | Contexto | Modalidades | Licencia |
|---|---|---|---|---|
| GRT-30M-Omni | 38,7 M | No disponible | Imagen, audio, texto, voz | Apache 2.0 |
| MatterWaveAI/grt-30m (base) | ~29,3 M (backbone) | No disponible | Texto | Apache 2.0 |
| Alternativas any-to-any de gran escala | Miles de millones | No disponible | Imagen, audio, texto, voz | Varía |

## Limitaciones y advertencias

- Tamaño extremadamente reducido (~38,7 M de parámetros): las capacidades reales están acotadas a tareas controladas de laboratorio; no es un modelo de producción.
- Precisión de forma en captioning visual del 58,3%: rendimiento bajo en atributos geométricos, lo que sugiere limitaciones en comprensión visual fina.
- Prosodia en reconocimiento de audio al 70,8%: capacidad limitada en matices prosódicos.
- SNR espectral del vocoder de 10,49 dB: calidad de síntesis de voz limitada, adecuada para experimentación pero no para aplicaciones comerciales de voz.
- Perplejidades de audio y QA audio-visual muy altas antes del ajuste (29312,46 y 884,35): indican que el modelo requiere alineamiento específico y no generaliza sin él.
- Idiomas soportados no documentados: no se puede garantizar cobertura multilingüe.
- Longitud de contexto no documentada: riesgo de comportamiento impredecible en entradas largas.
- Riesgo de alucinación: no evaluado en la información disponible; en un modelo de este tamaño es esperable un riesgo elevado en generación abierta.
- Sesgos: no documentados; el dataset de entrenamiento no se describe, por lo que no se pueden evaluar sesgos de dominio.
- Licencia Apache 2.0: permite uso comercial, pero las limitaciones técnicas hacen inviable su uso en producción sin validación adicional.
- Ausencia de soporte documentado de tool calling, agentes o razonamiento multi-paso: no apto para pipelines agénticos.
- Compatibilidad: requiere `transformers` con el módulo `grt` (posiblemente una versión específica o fork); verificar antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MatterWaveAI/grt-30m-omni
- Modelo base: https://huggingface.co/MatterWaveAI/grt-30m
- Repositorio de `transformers` con soporte `grt` (referenciado en la model card como `transformers.models.grt.optimization_grt`): no disponible como enlace directo en la información proporcionada
- Paper, blog o demo: no disponibles en la información proporcionada
