# intel-ai/MiniMax-M2.7-NVFP4-AutoRound

## Resumen

MiniMax-M2.7-NVFP4-AutoRound es una versión cuantizada a 4 bits del modelo MiniMaxAI/MiniMax-M2.7, publicada por Intel AI mediante su herramienta AutoRound. Se trata de un checkpoint de pesos y activaciones en FP4 (W4A4) con formato NVFP4 E5M3, generado con un flujo de cuantización *model-free* sobre el modelo original. El objetivo es reducir el coste de memoria y cómputo en inferencia de un modelo de gran tamaño sin degradar de forma apreciable la calidad, manteniendo la recuperación de puntuación en benchmarks por encima del 99 % en la mayoría de las tareas evaluadas.

El modelo base es un transformer de tipo mezcla de expertos (MoE) con 228.689.764.864 parámetros totales según los safetensors del repositorio (aproximadamente 228,7 mil millones). El repositorio ocupa 130,6 GB, lo que refleja la compresión respecto a los pesos originales en bfloat16. La ficha no detalla el número de parámetros activos por token, la longitud de contexto nativa ni la composición del dataset de entrenamiento del modelo base.

La relevancia de esta publicación es práctica: demuestra que un modelo MoE de gran escala puede servirse en FP4 con kernels Marlin y un plugin QDQ de Intel Neural Compressor sobre vLLM, con una recuperación de rendimiento casi completa en tareas de razonamiento matemático, ciencia y sentido común. Está pensada para equipos que ya operan el modelo original y buscan reducir requisitos de VRAM y aumentar el throughput en despliegues de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (según tags del modelo base); detalles de capas y atención no disponibles |
| Parametros totales | 228.689.764.864 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible en la ficha; el ejemplo de despliegue usa `--max-model-len 102400` |
| Tipos de cuantizacion | NVFP4 E5M3 W4A4 (pesos y activaciones FP4 E2M1, escalas de bloque E5M3 sin signo, grupo 16, sin escala global por tensor) |
| Idiomas soportados | no disponible |
| Licencia | other (se remite a la licencia del modelo original MiniMaxAI/MiniMax-M2.7) |
| Formato de pesos | safetensors, empaquetado `auto_round:llm_compressor_nvfp4_e5m3` |

## Arquitectura y entrenamiento

El checkpoint es una cuantización del modelo MiniMaxAI/MiniMax-M2.7, que según las etiquetas del repositorio es un transformer de mezcla de expertos (MoE) orientado a generación de texto conversacional. La cuantización se aplica sobre capas lineales seleccionadas, incluidas las proyecciones de atención y las proyecciones de los expertos MoE. Quedan excluidos de la cuantización los routers MoE, los embeddings y el `lm_head`, que conservan su precisión original. La caché KV y el softmax de atención no forman parte de la cuantización W4A4 de este checkpoint.

El esquema NVFP4 E5M3 emplea elementos FP4 E2M1 tanto para pesos como para activaciones, con escalas de bloque E5M3 sin signo y tamaño de grupo 16, sin escala global por tensor. Las activaciones usan escalado dinámico por bloque. El flujo de generación es *model-free*, realizado con AutoRound 0.17.0 mediante el comando `auto_round ... --model_free --scheme NVFP4_E5M3 --format auto_round`. No se dispone de información sobre el número de tokens de entrenamiento del modelo base, la composición del dataset ni si hubo fases de RLHF o DPO.

## Capacidades

- Generación de texto conversacional multi-turno, según el pipeline declarado (`text-generation`) y las etiquetas `conversational`.
- Razonamiento matemático y científico: los benchmarks reportados incluyen AIME 2025 y GPQA Diamond, con puntuaciones superiores al 85 % en ambos casos.
- Razonamiento de sentido común y resolución de problemas verbales: PIQA y GSM8K evaluados con recuperación cercana al 100 %.
- Soporte de *tool calling* / *function calling*: el ejemplo de despliegue activa `--tool-call-parser minimax_m2` y `--enable-auto-tool-choice`.
- Soporte de modo de razonamiento explícito: el despliegue incluye `--reasoning-parser minimax_m2`.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Visión, audio u otras modalidades: no disponibles; el pipeline es únicamente de texto.

## Casos de uso

- Asistencia conversacional de largo contexto: el modelo puede mantener diálogos multi-turno con ventanas de hasta 102.400 tokens en la configuración de ejemplo, adecuado para asistentes que necesitan recordar historial extenso o documentos largos dentro de la conversación.
- Razonamiento matemático en producción: con una puntuación de 87,78 en AIME 2025 y 96,34 en GSM8K tras la cuantización, es apto para sistemas de resolución de problemas cuantitativos, tutoría matemática o verificación de cálculos.
- Evaluación científica y técnica: la puntuación de 88,38 en GPQA Diamond lo hace utilizable en flujos de preguntas de nivel experto en física, química y biología, por ejemplo para triaje de consultas técnicas o generación de explicaciones razonadas.
- Agentes con uso de herramientas: la integración con `--tool-call-parser minimax_m2` y `--enable-auto-tool-choice` permite construir agentes que invocan APIs externas, consultan bases de datos o ejecutan pasos multi-etapa dentro de un pipeline de automatización.
- Despliegue en clústeres con VRAM limitada: al reducir los pesos a FP4 (130,6 GB de repositorio frente a los ~457 GB que ocuparía el modelo en bfloat16), permite servir el modelo en menos GPUs o en GPUs con menos memoria por dispositivo, manteniendo la calidad del original.
- Servicio de inferencia a gran escala con vLLM: la combinación de FP4 Marlin, caché KV en FP8 y *chunked prefill* permite aumentar el throughput y el número de peticiones concurrentes en entornos de serving, con una penalización de calidad medida inferior al 1 % en la mayoría de benchmarks.
- Sustitución directa del modelo original en pipelines existentes: al conservar la misma arquitectura y tokenizador, puede reemplazar a MiniMax-M2.7 en aplicaciones ya desplegadas sin cambios en el código de aplicación, solo en la configuración de serving.

## Benchmarks y rendimiento

Los resultados publicados en la model card corresponden a la media de cinco ejecuciones, descartando la puntuación más alta y la más baja. La columna de recuperación es la puntuación cuantizada dividida por la del modelo original.

| Benchmark | Modelo original | NVFP4 E5M3 | Recuperación |
|---|---:|---:|---:|
| AIME 2025 | 85,56 | 87,78 | 102,59 % |
| GPQA Diamond | 88,72 | 88,38 | 99,62 % |
| GSM8K | 96,36 | 96,34 | 99,98 % |
| PIQA | 94,00 | 94,23 | 100,24 % |

No se han publicado en la información disponible resultados de benchmarks adicionales (MMLU, HumanEval u otros) ni comparaciones con modelos de la competencia.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio de pesos ocupa 130,6 GB, por lo que se necesita al menos esa cantidad de memoria para los pesos, más la caché KV y los buffers de activación. Con caché KV en FP8 y una ventana de 102.400 tokens, el requisito efectivo es considerablemente mayor.
- GPU recomendadas: el ejemplo de la model card usa vLLM 0.32.0 con el plugin QDQ de Intel Neural Compressor y kernels FP4 Marlin. Los kernels Marlin FP4 están soportados en GPUs NVIDIA de arquitectura Hopper (H100, H200) y Ada Lovelace (L40S, RTX 4090); no se especifica en la ficha una lista oficial de GPUs validadas.
- ¿Cabe en GPU de consumo? No en una sola GPU de consumo: los 130,6 GB de pesos exceden la VRAM de cualquier tarjeta consumer actual (máximo 24 GB en RTX 4090). Requiere múltiples GPUs o GPUs de centro de datos.
- Opciones de despliegue: vLLM 0.32.0 con el plugin QDQ de Intel Neural Compressor (PR #2621). No se mencionan llama.cpp, Ollama ni TGI como compatibles con este formato de cuantización.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-M2.7-NVFP4-AutoRound (este) | 228,7 B | no disponible (ejemplo: 102.400) | NVFP4 E5M3 W4A4 | other | HuggingFace, vLLM + plugin QDQ |
| MiniMaxAI/MiniMax-M2.7 (base) | 228,7 B | no disponible | bfloat16 (original) | other | HuggingFace |
| Alternativas de misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría (MoE de más de 200 mil millones de parámetros) en la documentación proporcionada, por lo que no se puede establecer una comparativa adicional fiable.

## Limitaciones y advertencias

- El modelo puede generar contenido factualmente incorrecto; no debe usarse como fuente de información veraz sin verificación.
- Puede producir salidas sesgadas, ofensivas o inapropiadas heredadas del modelo base y de sus datos de entrenamiento; se recomienda realizar pruebas de seguridad antes de cualquier despliegue.
- La licencia es "other" y remite a la del modelo original MiniMaxAI/MiniMax-M2.7; es necesario revisar dicha licencia antes de un uso comercial, y la model card advierte explícitamente de que su texto no constituye asesoramiento legal.
- La cuantización excluye routers MoE, embeddings y `lm_head`, y no cubre la caché KV ni el softmax de atención; el rendimiento puede variar según la configuración de serving (por ejemplo, el tipo de caché KV).
- El checkpoint requiere una implementación de inferencia que soporte el tipo de datos `nvfp4_v2` de AutoRound y las escalas de bloque E5M3; no es compatible con vLLM estándar sin el plugin QDQ.
- La ruta de inferencia evaluada usa kernels FP4 Marlin con cuantización-descuantización de activaciones (QDQ), no cómputo nativo NVFP4 en hardware, lo que puede afectar al rendimiento real frente a una implementación nativa.
- No se dispone de información sobre idiomas soportados, sesgos específicos por idioma ni limitaciones de contexto del modelo base.
- El modelo tiene 0 descargas y 1 like en el momento de la consulta, lo que indica una validación comunitaria muy limitada.

## Enlaces

- [HuggingFace: intel-ai/MiniMax-M2.7-NVFP4-AutoRound](https://huggingface.co/intel-ai/MiniMax-M2.7-NVFP4-AutoRound)
- [Modelo base: MiniMaxAI/MiniMax-M2.7](https://huggingface.co/MiniMaxAI/MiniMax-M2.7)
- [AutoRound (GitHub)](https://github.com/intel/auto-round)
- [Intel Neural Compressor (GitHub)](https://github.com/intel/neural-compressor)
- [Intel Neural Compressor PR #2621 (plugin QDQ para vLLM)](https://github.com/intel/neural-compressor/pull/2621)
- [Paper AutoRound: Optimize weight rounding via signed gradient descent (arXiv:2309.05516)](https://arxiv.org/abs/2309.05516)
