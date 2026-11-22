# LokkenJP/10Eros_Max_optimized_w4a8_exp_learned

## Resumen

10Eros_Max_optimized_w4a8_exp_learned es un checkpoint cuantizado del modelo de generación de vídeo TenStrip/10Eros-Max, derivado a su vez de la familia MiniMax H3. Lo publica el usuario LokkenJP bajo la librería minimax-h3 y está pensado para su uso en ComfyUI como modelo de difusión (text-to-video, image-to-video e image-text-to-video). El modelo original es un transformer de 40,22 GB en BF16 con un modo Turbo integrado de ocho pasos de muestreo, y esta versión reduce su huella a dos variantes: HQ (17,92 GB) y Compact (14,50 GB).

La aportación técnica principal no es el modelo en sí, sino el proceso de cuantización "learned" (con aprendizaje de escalas) que combina pesos de 4 y 6 bits con matrices INT8 en el refinador de tokens que procesa el acondicionamiento de texto. El autor publica métricas de reconstrucción (NRMSE) frente al checkpoint BF16 original, lo que permite evaluar la pérdida de fidelidad de forma objetiva antes de desplegar.

Es relevante ahora porque permite ejecutar un modelo de vídeo de gran tamaño en GPUs de consumo con ComfyUI, manteniendo el modo Turbo de ocho pasos y sin requerir el checkpoint BF16 completo. La licencia es la MiniMax H3 Community License Agreement, no estándar, y el repositorio está marcado como not-for-all-audiences.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión para vídeo (MiniMax H3), con refinador de tokens para acondicionamiento de texto |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | W6A8 g16 + INT8 (HQ); W4A8 g16 + W6A8 g16 + INT8 (Compact); matrices INT8 aprendidas en el refinador de tokens |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license-agreement (other) |
| Formato de pesos | safetensors (checkpoint único por variante, con sidecars SHA-256 y JSON de cuantización) |

| Variante | Tamano | Transformer principal | Sidecars |
|---|---:|---|---|
| HQ | 17,92 GB | 90 capas W6 g16, 110 INT8 | SHA-256 + informe de cuantización |
| Compact | 14,50 GB | 64 W4 g16, 122 W6 g16, 14 INT8 | SHA-256 + informe de cuantización |
| Upstream BF16 | 40,22 GB | BF16 | checkpoint original de TenStrip |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer de difusión de MiniMax H3 especializado en generación de vídeo (con audio y VAE de vídeo separados), afinado por TenStrip como ErosMax v1 con un sampler Turbo de ocho pasos integrado. El pipeline declarado en Hugging Face es image-text-to-video, y los tags cubren también text-to-video e image-to-video. El acondicionamiento de texto pasa por un refinador de tokens que en esta versión incorpora ocho matrices INT8 aprendidas.

La innovación de este checkpoint es el procedimiento de cuantización activation-aware: en lugar de aplicar escalas derivadas de los pesos, el autor aprende las escalas minimizando el error de activación sobre entradas registradas. Las capas se asignan a precisiones mixtas (W4, W6 e INT8) según su sensibilidad. Sobre 200 matrices principales y un split de desarrollo, el NRMSE medio de activación es 0,531 % para HQ y 1,386 % para Compact, frente a 2,927 % del baseline sin aprendizaje con la precisión seleccionada para Compact; esto supone una reducción del 52,64 % del error en ese caso. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo original.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video).
- Generación de vídeo a partir de imagen (image-to-video).
- Generación de vídeo a partir de imagen y texto combinados (image-text-to-video), que es el pipeline declarado.
- Muestreo Turbo de ocho pasos integrado, heredado de ErosMax v1, que reduce el coste de inferencia frente a samplers de decenas de pasos.
- Procesamiento de acondicionamiento de texto mediante un refinador de tokens con matrices INT8 aprendidas.
- Integración con ComfyUI mediante workflows de dos pasadas (two-pass) para configuraciones simples y avanzadas.
- Compatibilidad con text encoders Qwen3-VL 32B cuantizados en tres niveles (HQ, Balanced, Compact).
- Soporte de VAE de vídeo y de audio como componentes separados del checkpoint.
- Tool calling, agentes, razonamiento multi-step, matemáticas, código y capacidades multilingües: no disponible (no es un modelo de lenguaje; es un modelo de generación de vídeo).

## Casos de uso

- Generación de clips publicitarios a partir de un guion de texto: el modo Turbo de ocho pasos permite iterar borradores rápidamente en ComfyUI antes de fijar una versión final con la variante HQ.
- Animación de imágenes fijas para ilustración o storyboard: el pipeline image-to-video convierte un frame clave en un clip corto, útil para previsualizar secuencias antes de producir en 3D.
- Prototipado de efectos visuales en estudio pequeño: la variante Compact (14,50 GB) cabe en GPUs de consumo y permite validar composiciones sin acceso a un clúster.
- Creación de contenido para redes sociales con control de coste: el checkpoint cuantizado reduce los requisitos de VRAM frente al BF16 de 40,22 GB, lo que abarata el renderizado por lotes.
- Investigación sobre cuantización de modelos de difusión: los informes de cuantización y las métricas NRMSE publicadas permiten reproducir y comparar estrategias activation-aware frente a baselines sin aprendizaje.
- Integración en pipelines de ComfyUI con dos pasadas: los workflows de ejemplo permiten encadenar una pasada de baja resolución y otra de refinado, aprovechando el text encoder Qwen3-VL 32B cuantizado para el acondicionamiento.
- Evaluación comparativa de fidelidad: usar HQ como referencia de alta fidelidad y Compact como variante de bajo consumo para medir la degradación percibida en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, VBench u otros) en la información disponible. El autor sí publica métricas de reconstrucción de capas:

| Métrica | HQ | Compact | Baseline sin aprendizaje (precisión de Compact) |
|---|---:|---:|---:|
| NRMSE medio de activación (200 matrices principales) | 0,531 % | 1,386 % | 2,927 % |
| Reducción de error frente al baseline | no disponible | 52,64 % | — |
| Tamano del checkpoint | 17,92 GB | 14,50 GB | 40,22 GB (BF16 upstream) |
| Ahorro frente a HQ | — | 3,42 GB (19,1 %) | — |

El autor indica que Compact se cargó y generó correctamente en ComfyUI, con una pérdida de calidad percibida leve frente a HQ y frente al checkpoint INT8 de referencia usado durante la cuantización. No se aportan cifras de latencia ni de throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el autor advierte que depende del workflow, la resolución, los demás componentes (text encoder, VAE de vídeo y de audio) y el offloading. Como referencia, los checkpoints pesan 17,92 GB (HQ) y 14,50 GB (Compact).
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño de checkpoint, HQ requiere GPUs con al menos 24 GB de VRAM si se mantiene residente, y Compact está diseñado para reducir ese requisito.
- Cabe en GPU de consumo: Compact (14,50 GB) está pensado para ese escenario; el autor confirma carga y generación en ComfyUI, sin especificar el modelo de GPU.
- Opciones de despliegue: ComfyUI con soporte nativo de W6A8 e INT8 ConvRot, y soporte W4A8 para la variante Compact. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Componentes adicionales necesarios: text encoder Qwen3-VL 32B cuantizado (HQ, Balanced o Compact) y VAE de vídeo y audio suministrados por separado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tamano | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| 10Eros_Max_optimized_w4a8_exp_learned (HQ / Compact) | 17,92 GB / 14,50 GB | no disponible | NRMSE 0,531 % / 1,386 % | MiniMax H3 Community License | Hugging Face, ComfyUI |
| TenStrip/10Eros-Max (upstream BF16) | 40,22 GB | no disponible | referencia BF16 | MiniMax H3 Community License | Hugging Face |
| MiniMax-H3 (base) | no disponible | no disponible | no disponible | MiniMax H3 Community License | Hugging Face |
| Otras variantes Beta5, Beta6, Beta7, Beta7 fix1 del mismo autor | no disponible | no disponible | no disponible | MiniMax H3 Community License | Hugging Face (carpeta Older_ErosMax) |

No se dispone de datos de benchmarks comparables con otros modelos de generación de vídeo en la información proporcionada.

## Limitaciones y advertencias

- El repositorio está marcado como not-for-all-audiences; el modelo base ErosMax v1 tiene orientación de contenido para adultos y no es apto para todos los públicos.
- La licencia es la MiniMax H3 Community License Agreement, no una licencia open source estándar; es obligatorio revisar sus términos antes de cualquier uso comercial, ya que impone restricciones específicas y se heredan las condiciones del modelo upstream.
- La variante Compact presenta una pérdida de calidad percibida frente a HQ y al checkpoint INT8 de referencia, según el propio autor; no es adecuada si se exige máxima fidelidad.
- El NRMSE mide reconstrucción de capas sobre entradas registradas, no calidad perceptual de vídeo; no sustituye a una evaluación visual en el caso de uso concreto.
- Requiere una build de ComfyUI con soporte nativo de W6A8 e INT8 ConvRot, y W4A8 para Compact; versiones sin ese soporte no cargarán el checkpoint.
- El checkpoint no incluye text encoder ni VAEs; hay que suministrarlos por separado y en versiones compatibles, lo que añade consumo de VRAM y complejidad de despliegue.
- No se publican datos de sesgos, idiomas soportados ni evaluación de alucinación o coherencia temporal del vídeo generado.
- El tamaño del repo (315,6 GB) implica una descarga considerable aunque solo se use una variante.
- No se especifican requisitos mínimos de VRAM ni GPUs validadas, por lo que el dimensionamiento en producción debe hacerse por prueba.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LokkenJP/10Eros_Max_optimized_w4a8_exp_learned
- Modelo base (TenStrip/10Eros-Max): https://huggingface.co/TenStrip/10Eros-Max
- Checkpoint BF16 upstream: https://huggingface.co/TenStrip/10Eros-Max/blob/main/10Eros_Max_8stepTurbo_v1.0_hybrid.safetensors
- Descarga HQ: https://huggingface.co/LokkenJP/TenEros_Max_optimized_learned/resolve/main/10Eros_Max_8stepTurbo_v1.0_hybrid_activation_learned_HQ.safetensors
- Descarga Compact: https://huggingface.co/LokkenJP/TenEros_Max_optimized_learned/resolve/main/10Eros_Max_8stepTurbo_v1.0_hybrid_activation_learned_compact_w4w6int8_14.50gb.safetensors
- Informe de cuantización HQ: https://huggingface.co/LokkenJP/TenEros_Max_optimized_learned/blob/main/10Eros_Max_8stepTurbo_v1.0_hybrid_activation_learned_HQ.safetensors.quantization.json
- Informe de cuantización Compact: https://huggingface.co/LokkenJP/TenEros_Max_optimized_learned/blob/main/10Eros_Max_8stepTurbo_v1.0_hybrid_activation_learned_compact_w4w6int8_14.50gb.safetensors.quantization.json
- Descripción técnica: https://huggingface.co/LokkenJP/TenEros_Max_optimized_learned/blob/main/H3_EROSMAX_V1_TECHNICAL_OVERVIEW.md
- Workflows de ejemplo (two-pass): https://huggingface.co/LokkenJP/TenEros_Max_optimized_learned/tree/main/SampleWorkFlowTwoPassOptimized
- Text encoders Qwen3-VL 32B cuantizados: https://huggingface.co/LokkenJP/TenEros_Max_optimized_learned/tree/main/text_encoder/
- Checkpoints anteriores: https://huggingface.co/LokkenJP/TenEros_Max_optimized_learned/tree/main/Older_ErosMax
- Licencia MiniMax H3: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- Repositorio MiniMax H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
