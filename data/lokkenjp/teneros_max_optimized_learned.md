# LokkenJP/TenEros_Max_optimized_learned

## Resumen

TenEros_Max_optimized_learned es una familia de checkpoints cuantizados del transformer de generación de vídeo ErosMax v1 (TenStrip/10Eros-Max), construido sobre la arquitectura MiniMax H3. El autor de la cuantización es LokkenJP, mientras que el modelo base procede de TenStrip. El objetivo es reducir el peso del transformer original en BF16 (40,22 GB) hasta versiones de 17,92 GB (HQ), 14,50 GB (Compact) y 9,995 GB (Micro, experimental), preservando el modo Turbo de ocho pasos integrado en el modelo original.

La relevancia de esta ficha es práctica: se trata de un ejercicio de cuantización *activation-aware* con matrices aprendidas (W4A8, W5A8, W6A8 e INT8), orientada a despliegue en ComfyUI sobre GPUs de consumo. El repositorio ocupa 334,5 GB e incluye pesos, informes de cuantización, workflows de ejemplo, codificadores de texto Qwen3-VL 32B cuantizados y checkpoints anteriores (Beta5 a Beta7).

El modelo es de tipo image-text-to-video (y text-to-video / image-to-video), con pipeline MiniMax H3, y está marcado como `not-for-all-anatomical` en los tags (`not-for-all-audiences`), lo que implica contenido para adultos. La licencia es la MiniMax H3 Community License Agreement, no una licencia open source estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión para vídeo (MiniMax H3), con refinador de tokens para condicionamiento de texto; modo Turbo de 8 pasos |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W6A8 g16 + INT8 (HQ); W4A8 g16 + W6A8 g16 + INT8 (Compact); W3A8, W4A8 y W5A8 aprendidos (Micro, experimental); INT8 ConvRot; matrices INT8 aprendidas en el refinador de tokens |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license-agreement (license: other) |
| Formato de pesos | safetensors (checkpoints de difusión para ComfyUI) |

Tamaños de checkpoint:

| Variante | Tamaño | Composición del transformer principal |
|---|---:|---|
| HQ | 17,92 GB | 90 capas W6 g16, 110 INT8 |
| Compact | 14,50 GB | 64 W4 g16, 122 W6 g16, 14 INT8 |
| Micro (experimental) | 9,995 GB | W3A8, W4A8 y W5A8 aprendidos |
| Base BF16 (upstream) | 40,22 GB | BF16 |

## Arquitectura y entrenamiento

El modelo es un transformer de difusión para generación de vídeo de la familia MiniMax H3, con un componente adicional denominado *token refiner* que procesa el condicionamiento de texto antes de entrar en el transformer. El checkpoint original de TenStrip incorpora un modo Turbo de ocho pasos, lo que reduce el número de evaluaciones del modelo necesarias por muestra frente a la difusión convencional. Esta ficha describe la cuantización, no el entrenamiento del modelo base: no se dispone de información sobre tokens de entrenamiento, composición del dataset ni uso de RLHF/DPO.

La innovación técnica principal es la cuantización *activation-aware* con matrices aprendidas. En lugar de aplicar escalas derivadas analíticamente, el autor aprende las matrices de cuantización minimizando el error de reconstrucción de las activaciones. El refinador de tokens usa ocho matrices INT8 aprendidas. La evaluación de reconstrucción se realizó sobre 200 matrices principales y un split de desarrollo, midiendo el NRMSE de la activación en bruto frente a las salidas BF16 originales: 0,531 % para HQ y 1,386 % para Compact. La línea base sin aprendizaje en la precisión seleccionada para Compact da 2,927 %, de modo que Compact reduce ese error un 52,64 %.

Las variantes W4 y W6 usan pesos de 4 y 6 bits; `g16` indica que cada grupo de 16 pesos comparte una escala. HQ prioriza menor error de reconstrucción y Compact ahorra 3,42 GB (19,1 %) respecto a HQ. Ambos checkpoints pasaron comprobaciones de integridad y de disposición del checkpoint; Compact también se cargó y generó correctamente en ComfyUI, con una ligera pérdida de calidad percibida frente a HQ y al checkpoint INT8 de referencia.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video).
- Generación de vídeo a partir de imagen y texto (image-text-to-video) e image-to-video.
- Generación con audio asociada al pipeline H3 (se requieren VAEs de vídeo y audio por separado).
- Muestreo en ocho pasos gracias al modo Turbo integrado en el modelo base.
- Condicionamiento de texto mediante codificadores Qwen3-VL 32B, ofrecidos en variantes HQ, Balanced y Compact dentro del repositorio.
- Cuantización con soporte nativo en ComfyUI para W6A8 e INT8 ConvRot, y W4A8 para Compact.
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso ni multilingüismo.

## Casos de uso

- Prototipado de vídeo generativo en una sola GPU de consumo: la variante Compact (14,50 GB) permite cargar el transformer en GPUs de 24 GB junto con el codificador de texto y los VAEs, aplicando offloading según el workflow.
- Producción de clips cortos con el modo Turbo de ocho pasos: al requerir solo ocho evaluaciones, reduce el coste por muestra frente a un muestreo de difusión estándar, lo que lo hace adecuado para iteración rápida de guiones gráficos.
- Animación de imágenes fijas (image-to-video): útil para convertir ilustraciones o fotografías en secuencias con movimiento coherente en flujos de previsualización.
- Integración en ComfyUI como nodo de un pipeline mayor: los workflows de dos pasos incluidos en `SampleWorkFlowTwoPassOptimized` sirven de plantilla para encadenar el modelo con upscalers, interpolación de fotogramas o postprocesado.
- Despliegue con restricciones de VRAM: la variante Micro (9,995 GB) está pensada para entornos con menos memoria, a costa de requerir ComfyUI 0.46.0 nightly con Comfy Kitchen 0.2.42 para W3A8 y W5A8.
- Investigación sobre cuantización de modelos de difusión: los informes `.quantization.json` y el documento técnico permiten reproducir y comparar el error de reconstrucción por familia de tensores, útil para estudiar el impacto de W4/W6/INT8 en la calidad de generación.
- Generación de contenido para adultos en entornos controlados: el modelo está etiquetado como `not-for-all-audiences`, por lo que su uso previsto incluye material para mayores de edad con las salvaguardas legales correspondientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (MMLU, HumanEval, GSM8K u otros). El único dato cuantitativo publicado es la reconstrucción de activaciones:

| Metrica | HQ | Compact | Baseline sin aprendizaje (precision de Compact) |
|---|---:|---:|---:|
| NRMSE de activación en bruto (200 matrices, split de desarrollo) | 0,531 % | 1,386 % | 2,927 % |
| Reducción de error frente a baseline | no disponible | 52,64 % | — |
| Tamaño del checkpoint | 17,92 GB | 14,50 GB | — |
| Ahorro frente a HQ | — | 3,42 GB (19,1 %) | — |

No se proporcionan métricas de calidad perceptual (FVD, CLIP score) ni latencias medidas.

## Requisitos de hardware

- VRAM estimada para el transformer: aproximadamente 18 GB para HQ, 14,5 GB para Compact y 10 GB para Micro, en decimal GB; a ello hay que sumar el codificador de texto Qwen3-VL 32B (en variantes cuantizadas), los VAEs de vídeo y audio y las activaciones del workflow.
- GPU recomendadas: no disponibles de forma explícita en la información proporcionada. Por tamaño de checkpoint, HQ y Compact encajan en GPUs de 24 GB (por ejemplo, RTX 4090) solo con offloading del codificador de texto; Micro está orientado a configuraciones de menor memoria.
- Cabe en GPU de consumo: sí, al menos Compact y Micro, según el autor; Compact se cargó y generó correctamente en ComfyUI. No se especifican modelos concretos de GPU de consumo probados.
- Opciones de despliegue: ComfyUI con soporte nativo de W6A8 e INT8 ConvRot (y W4A8 para Compact). Micro exige ComfyUI 0.46.0 nightly con Comfy Kitchen 0.2.42. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. El modo Turbo de ocho pasos reduce el número de evaluaciones por muestra, pero no se publican tiempos medidos.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño del checkpoint | Contexto | Licencia | Disponibilidad |
|---|---|---:|---|---|---|
| TenEros_Max_optimized_learned HQ | Vídeo, MiniMax H3 cuantizado | 17,92 GB | no disponible | MiniMax H3 Community License | Hugging Face |
| TenEros_Max_optimized_learned Compact | Vídeo, MiniMax H3 cuantizado | 14,50 GB | no disponible | MiniMax H3 Community License | Hugging Face |
| TenStrip/10Eros-Max (base) | Vídeo, MiniMax H3 BF16 | 40,22 GB | no disponible | MiniMax H3 Community License (según modelo base) | Hugging Face |
| TenEros_Max_optimized_learned Micro | Vídeo, MiniMax H3 cuantizado experimental | 9,995 GB | no disponible | MiniMax H3 Community License | Hugging Face (experimental) |

No se dispone de información sobre otros modelos de vídeo comparables (por ejemplo, de otras familias) en los datos proporcionados, por lo que la comparación se limita a las variantes del mismo linaje.

## Limitaciones y advertencias

- Contenido para adultos: el modelo está etiquetado como `not-for-all-audiences`; requiere control de acceso y cumplimiento normativo en cualquier despliegue público.
- Licencia restrictiva: la MiniMax H3 Community License Agreement no es una licencia open source estándar; deben revisarse las condiciones de uso comercial antes de producción.
- Pérdida de calidad por cuantización: Compact presenta una pérdida de calidad percibida frente a HQ y al checkpoint INT8 de referencia, según el propio autor. El NRMSE de Compact (1,386 %) es 2,6 veces el de HQ (0,531 %).
- Micro es experimental y depende de versiones nightly de ComfyUI y de Comfy Kitchen 0.2.42; no es apto para entornos estables sin validación previa.
- Riesgo de alucinación visual y artefactos: no se han publicado métricas de fidelidad perceptual ni evaluaciones sistemáticas de coherencia temporal, por lo que la calidad debe validarse por caso de uso.
- Idiomas soportados no disponibles; el comportamiento multilingüe del condicionamiento de texto no está documentado en esta ficha.
- Requisitos de integración: necesita un build de ComfyUI con soporte nativo de W6A8 e INT8 ConvRot, además de codificador de texto y VAEs suministrados por separado; una configuración incorrecta impide la carga.
- El repositorio incluye checkpoints antiguos (Beta5 a Beta7) que pueden confundirse con las versiones actuales; conviene verificar el SHA-256 publicado para cada archivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LokkenJP/TenEros_Max_optimized_learned
- Modelo base: https://huggingface.co/TenStrip/10Eros-Max
- Checkpoint BF16 upstream: https://huggingface.co/TenStrip/10Eros-Max/blob/main/10Eros_Max_8stepTurbo_v1.0_hybrid.safetensors
- Checkpoint HQ: https://huggingface.co/LokkenJP/TenEros_Max_optimized_learned/resolve/main/10Eros_Max_8stepTurbo_v1.0_hybrid_activation_learned_HQ.safetensors
- Checkpoint Compact: https://huggingface.co/LokkenJP/TenEros_Max_optimized_learned/resolve/main/10Eros_Max_8stepTurbo_v1.0_hybrid_activation_learned_compact_w4w6int8_14.50gb.safetensors
- Checkpoint Micro (experimental): https://huggingface.co/LokkenJP/TenEros_Max_optimized_learned/resolve/main/Experimental/10Eros_Max_8stepTurbo_v1.0_hybrid_activation_learned_Micro.safetensors
- Aviso de compatibilidad de Micro: https://huggingface.co/LokkenJP/TenEros_Max_optimized_learned/blob/main/Experimental/00_WARNING_MICRO_COMFYUI_COMPATIBILITY.md
- Informe técnico de Micro: https://huggingface.co/LokkenJP/TenEros_Max_optimized_learned/blob/main/Experimental/H3_EROSMAX_V1_MICRO_TECHNICAL_OVERVIEW.md
- Informe técnico general: https://huggingface.co/LokkenJP/TenEros_Max_optimized_learned/blob/main/H3_EROSMAX_V1_TECHNICAL_OVERVIEW.md
- Workflows de ejemplo: https://huggingface.co/LokkenJP/TenEros_Max_optimized_learned/tree/main/SampleWorkFlowTwoPassOptimized
- Codificadores de texto: https://huggingface.co/LokkenJP/TenEros_Max_optimized_learned/tree/main/text_encoder
- Checkpoints anteriores: https://huggingface.co/LokkenJP/TenEros_Max_optimized_learned/tree/main/Older_ErosMax
- Licencia MiniMax H3: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
