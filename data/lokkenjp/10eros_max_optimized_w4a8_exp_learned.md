# LokkenJP/10Eros_Max_optimized_w4a8_exp_learned

## Resumen

ErosMax v1 eight-step Turbo es una versión cuantizada del modelo de generación de vídeo TenStrip/10Eros-Max, construido sobre la arquitectura MiniMax H3. El autor de la cuantización es LokkenJP, que publica tres variantes (HQ, Compact y Micro) con el objetivo de reducir el peso del transformer original de 40,22 GB en BF16 a tamaños manejables en hardware de consumo, preservando el modo Turbo de ocho pasos integrado en el modelo base.

La aportación técnica principal es el uso de cuantización aprendida (*learned quantization*) con matrices INT8 entrenadas específicamente para el refiner de tokens, combinada con esquemas de pesos W4, W5 y W6 con grupos de 16 pesos por escala (g16) y activaciones INT8 (W4A8, W5A8, W6A8). El resultado son checkpoints de 17,92 GB (HQ), 14,50 GB (Compact) y 9,995 GB (Micro, experimental), con errores de reconstrucción medidos y documentados.

El modelo es relevante porque permite ejecutar un generador de vídeo texto-a-vídeo e imagen-a-vídeo de gama alta en ComfyUI sobre GPUs de consumo, algo inviable con el checkpoint BF16 original. La licencia es la MiniMax H3 Community License Agreement y el modelo está marcado como no apto para todas las audiencias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión para vídeo (MiniMax H3), con refiner de tokens para condicionamiento de texto |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W6A8 g16 e INT8 (HQ); W4A8 g16, W6A8 g16 e INT8 (Compact); W3A8, W4A8 y W5A8 aprendidos (Micro) |
| Idiomas soportados | no disponible |
| Licencia | MiniMax H3 Community License Agreement (`license: other`) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 334,5 GB (incluye variantes, encoders y workflows) |
| Tamano del checkpoint | HQ 17,92 GB; Compact 14,50 GB; Micro 9,995 GB |
| Pipeline | image-text-to-video |
| Modelo base | TenStrip/10Eros-Max (40,22 GB en BF16) |
| Pasos de muestreo | 8 (Turbo integrado) |
| Descargas | 278.356 |
| Likes | 123 |

## Arquitectura y entrenamiento

El modelo es una cuantización del transformer de difusión de TenStrip/10Eros-Max, que a su vez se apoya en la arquitectura MiniMax H3 para generación de vídeo. El transformer original pesa 40,22 GB en BF16 e incorpora un modo Turbo de ocho pasos que se conserva intacto en todas las variantes cuantizadas. El condicionamiento de texto se procesa mediante un refiner de tokens separado, que en estas versiones emplea ocho matrices INT8 aprendidas.

La innovación central es la cuantización *activation-aware* con matrices aprendidas: en lugar de aplicar redondeo uniforme, se optimizan las matrices cuantizadas para minimizar el error de reconstrucción sobre activaciones registradas. Las variantes HQ y Compact se evaluaron sobre 200 matrices principales del transformer, midiendo el NRMSE de las activaciones frente a las salidas BF16 originales en el conjunto de desarrollo. HQ obtiene un 0,531 % de error medio y Compact un 1,386 %, frente al 2,927 % de la línea base sin aprendizaje con la misma precisión que Compact, lo que supone una reducción del 52,64 % del error. Los detalles de metodología y mapas de precisión están en el documento técnico enlazado en la model card. No se dispone de información sobre el dataset de entrenamiento original ni sobre etapas de RLHF o DPO.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video).
- Generación de vídeo a partir de imagen y texto (image-text-to-video) e imagen-a-vídeo.
- Modo Turbo de ocho pasos integrado, que reduce el coste de muestreo frente a schedulers de decenas de pasos.
- Flujo de dos pasadas (*two-pass*) documentado mediante workflows de ejemplo para configuraciones simples y avanzadas en ComfyUI.
- Condicionamiento de texto mediante encoder Qwen3-VL 32B en variantes HQ, Balanced y Compact, publicadas en el repositorio.
- Integración nativa con ComfyUI para W6A8 e INT8 ConvRot; W4A8 para Compact y W3A8/W5A8 para Micro.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni audio generativo más allá del VAE de audio que se suministra por separado.

## Casos de uso

- Prototipado de vídeo generativo en estación de trabajo: con 14,50 GB (Compact) o 17,92 GB (HQ) el transformer cabe en GPUs de consumo de 24 GB, lo que permite iterar prompts y referencias sin depender de clústeres.
- Producción de clips cortos para redes sociales: el modo Turbo de ocho pasos reduce el número de evaluaciones del transformer, lo que abarata la generación por clip en pipelines por lotes.
- Animación de imágenes fijas (image-to-video): útil para convertir ilustraciones o fotogramas clave en secuencias con movimiento coherente, usando el encoder Qwen3-VL para el condicionamiento textual.
- Previsualización rápida en estudios de animación: la variante Compact permite generar *animatics* de baja latencia antes de renderizar con el checkpoint BF16 completo.
- Investigación en cuantización de modelos de difusión: los informes de cuantización y las gráficas de reconstrucción por familia de tensores sirven como referencia reproducible para comparar esquemas W4/W6/INT8.
- Despliegue local en ComfyUI para creadores individuales: los workflows de dos pasadas incluidos y los encoders cuantizados permiten montar un entorno completo sin infraestructura en la nube.
- Evaluación comparativa de precisión: al publicarse HQ, Compact y Micro con el mismo modelo base, es posible medir el compromiso entre tamaño y calidad percibida en un mismo pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, VBench u otros) en la información disponible. Los únicos datos cuantitativos publicados son métricas de reconstrucción de la cuantización:

| Metrica | HQ | Compact | Baseline sin aprendizaje (precision de Compact) |
|---|---|---|---|
| NRMSE medio de activaciones (200 matrices) | 0,531 % | 1,386 % | 2,927 % |
| Reduccion de error frente a baseline | no disponible | 52,64 % | referencia |
| Tamano del checkpoint | 17,92 GB | 14,50 GB | no disponible |
| Ahorro frente a HQ | referencia | 3,42 GB (19,1 %) | no disponible |

La model card indica que Compact generó correctamente en ComfyUI con una pérdida de calidad percibida leve frente a HQ y frente al checkpoint INT8 de referencia usado durante la cuantización. No se aportan métricas objetivas de calidad de vídeo.

## Requisitos de hardware

- VRAM estimada para el transformer: aproximadamente 18 GB para HQ, 15 GB para Compact y 10 GB para Micro, a los que hay que sumar el encoder de texto, los VAE de vídeo y audio, y el margen de activaciones.
- El encoder de texto recomendado es Qwen3-VL 32B en variante cuantizada (HQ, Balanced o Compact), lo que añade varios GB adicionales de VRAM.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 5090 para HQ y Compact; GPUs de 16 GB pueden requerir *offloading* o la variante Micro; A100 y H100 para lotes o resoluciones mayores.
- Cabe en GPU de consumo: sí, HQ y Compact en 24 GB con gestión cuidadosa de componentes; Micro está pensado para configuraciones más ajustadas.
- Opciones de despliegue: ComfyUI con soporte nativo de W6A8 e INT8 ConvRot (y W4A8 para Compact). Micro exige ComfyUI 0.46.0 nightly con Comfy Kitchen 0.2.42 para W3A8 y W5A8.
- No se publican datos de latencia ni throughput. El tamaño del repositorio (334,5 GB) implica una descarga considerable si se quieren todas las variantes y encoders.
- La memoria de inferencia depende del workflow, la resolución, los demás componentes y el *offloading*, según advierte el autor.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano del checkpoint | Pasos | Licencia | Entorno |
|---|---|---|---|---|---|
| LokkenJP/10Eros_Max_optimized_w4a8_exp_learned (HQ) | Cuantizacion W6/INT8 de vídeo | 17,92 GB | 8 (Turbo) | MiniMax H3 Community License | ComfyUI |
| LokkenJP/10Eros_Max_optimized_w4a8_exp_learned (Compact) | Cuantizacion W4/W6/INT8 de vídeo | 14,50 GB | 8 (Turbo) | MiniMax H3 Community License | ComfyUI |
| TenStrip/10Eros-Max (BF16) | Modelo original de vídeo | 40,22 GB | 8 (Turbo) | MiniMax H3 Community License | ComfyUI |
| Otros modelos de vídeo abiertos de la familia MiniMax H3 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de otros autores con la misma arquitectura y esquema de cuantización, por lo que la comparativa se limita a las variantes del propio repositorio y al checkpoint base.

## Limitaciones y advertencias

- Contenido marcado como `not-for-all-audiences`: el modelo base está orientado a material para adultos; no es adecuado para aplicaciones generalistas sin filtrado.
- La licencia MiniMax H3 Community License Agreement impone condiciones específicas; es obligatorio revisar el texto completo antes de cualquier uso comercial.
- El modelo es una cuantización: introduce error de reconstrucción (0,531 % en HQ, 1,386 % en Compact) que puede traducirse en pérdida de calidad visual sutil, especialmente en Compact.
- Micro es experimental y requiere versiones nightly concretas de ComfyUI y Comfy Kitchen; su uso en producción es desaconsejable hasta que la compatibilidad se estabilice.
- No se documentan idiomas soportados, sesgos conocidos ni tasas de alucinación; al ser un modelo de vídeo, el riesgo principal es la incoherencia temporal y la deriva de identidad entre fotogramas.
- La inferencia requiere ensamblar manualmente transformer, encoder de texto y VAE de vídeo y audio; no es un pipeline autocontenido.
- El tamaño del repositorio (334,5 GB) y la dependencia de builds específicos de ComfyUI complican la reproducibilidad en entornos gestionados.
- No hay benchmarks objetivos de calidad de vídeo publicados, por lo que las afirmaciones de calidad se basan en impresiones del operador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LokkenJP/10Eros_Max_optimized_w4a8_exp_learned
- Checkpoint HQ: https://huggingface.co/LokkenJP/TenEros_Max_optimized_learned/resolve/main/10Eros_Max_8stepTurbo_v1.0_hybrid_activation_learned_HQ.safetensors
- Checkpoint Compact: https://huggingface.co/LokkenJP/TenEros_Max_optimized_learned/resolve/main/10Eros_Max_8stepTurbo_v1.0_hybrid_activation_learned_compact_w4w6int8_14.50gb.safetensors
- Checkpoint Micro (experimental): https://huggingface.co/LokkenJP/TenEros_Max_optimized_learned/resolve/main/Experimental/10Eros_Max_8stepTurbo_v1.0_hybrid_activation_learned_Micro.safetensors
- Aviso de compatibilidad de Micro: https://huggingface.co/LokkenJP/TenEros_Max_optimized_learned/blob/main/Experimental/00_WARNING_MICRO_COMFYUI_COMPATIBILITY.md
- Informe tecnico de Micro: https://huggingface.co/LokkenJP/TenEros_Max_optimized_learned/blob/main/Experimental/H3_EROSMAX_V1_MICRO_TECHNICAL_OVERVIEW.md
- Informe tecnico general: https://huggingface.co/LokkenJP/TenEros_Max_optimized_learned/blob/main/H3_EROSMAX_V1_TECHNICAL_OVERVIEW.md
- Workflows de ejemplo: https://huggingface.co/LokkenJP/TenEros_Max_optimized_learned/tree/main/SampleWorkFlowTwoPassOptimized
- Encoders de texto: https://huggingface.co/LokkenJP/TenEros_Max_optimized_learned/tree/main/text_encoder
- Checkpoints anteriores: https://huggingface.co/LokkenJP/TenEros_Max_optimized_learned/tree/main/Older_ErosMax
- Modelo base: https://huggingface.co/TenStrip/10Eros-Max
- Checkpoint BF16 original: https://huggingface.co/TenStrip/10Eros-Max/blob/main/10Eros_Max_8stepTurbo_v1.0_hybrid.safetensors
- Licencia: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
