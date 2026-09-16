# joshycodes/qwen3-4b-sorrel-selfloop-g3-midtrain

## Resumen

qwen3-4b-sorrel-selfloop-g3-midtrain es un artefacto de investigación privado publicado por el usuario joshycodes en Hugging Face. Se trata de un ajuste mediante continued pretraining (etapa denominada "midtrain") sobre el modelo joshycodes/qwen3-4b-sorrel-selfloop-g2-midtrain, que a su vez desciende de la familia Qwen3-4B. El checkpoint tiene 4.022.468.096 parámetros confirmados en los pesos safetensors y se enmarca en un proyecto de "flourishing-framed character training" vinculado a un proyecto de Anthropic Fellows.

El entrenamiento se realizó sobre el corpus joshycodes/sorrel-selfloop-corpus (configuración sorrel-selfloop-b-g2), con 7.847.936 tokens vistos en una única época y una reducción de la pérdida de 1,2108 a 1,1221. El run se ejecutó sobre 2 GPU NVIDIA H200 en RunPod y usó la semilla 20260821.

Su relevancia fuera del proyecto es limitada: la propia model card lo declara "artefacto de investigación privado, no redistribuir", no se han publicado benchmarks y la licencia es internal-research. Es interesante como pieza de una cadena de entrenamiento iterativo (g2 → g3) y como objeto de estudio de la dinámica de self-loop, más que como modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (linaje Qwen3-4B); no se documentan detalles propios de este checkpoint |
| Parámetros totales | 4.022.468.096 |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el entrenamiento usó seq_len de 4096) |
| Tipos de cuantización | no disponible (no se publican GGUF ni variantes cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | other (license_name: internal-research); artefacto privado, no redistribuir |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 32,2 GB |
| Modelo base | joshycodes/qwen3-4b-sorrel-selfloop-g2-midtrain (revisión daffe2475da0) |
| Dataset de entrenamiento | joshycodes/sorrel-selfloop-corpus (config sorrel-selfloop-b-g2, revisión a6ac5e69dbc6) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se publican especificaciones de arquitectura específicas de este checkpoint. La información disponible solo describe el linaje: el modelo parte de joshycodes/qwen3-4b-sorrel-selfloop-g2-midtrain, que a su vez procede de la familia Qwen3-4B, un transformer denso de aproximadamente 4.000 millones de parámetros. Según la documentación de Qwen recogida en la búsqueda, la serie Qwen3 está diseñada para razonamiento, seguimiento de instrucciones, capacidades de agente y soporte multilingüe, pero no hay confirmación de que estas capacidades se conserven tras la cadena de midtrains aplicada.

El entrenamiento consiste en una etapa de continued pretraining sobre el corpus joshycodes/sorrel-selfloop-corpus, con los siguientes hiperparámetros: learning rate 1e-5, seq_len 4096, micro_batch 4, acumulación de gradiente 4, 1,0 épocas y 7.847.936 tokens vistos. La pérdida pasó de 1,2108 a 1,1221 en el transcurso de la etapa. El run se ejecutó en 2 GPU NVIDIA H200 (RunPod, worker del programa de fellows) con semilla 20260821 y el commit del lanzador a0afb77669ae del repositorio flourishing-training. No se documenta uso de RLHF, DPO ni ninguna técnica de alineación posterior; tampoco se describe ninguna innovación arquitectónica propia (atención lineal, decodificación especulativa, decodificación híbrida, etc.).

## Capacidades

No hay información publicada sobre las capacidades efectivas de este checkpoint concreto. Las siguientes afirmaciones se refieren exclusivamente al linaje Qwen3-4B declarado y no han sido verificadas para este ajuste:

- Generación de texto y comprensión del lenguaje: capacidades atribuidas a la familia Qwen3-4B en la documentación del modelo base.
- Código y matemáticas: la documentación de Qwen3-4B cita estas áreas como puntos fuertes del modelo base, sin confirmación tras el midtrain.
- Soporte multilingüe: la familia Qwen3 se describe como multilingüe, pero la model card de este checkpoint no declara idiomas soportados.
- Tool calling / function calling: no disponible para este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no disponible para este checkpoint.
- Modo de razonamiento explícito (thinking), visión o audio: no disponible para este checkpoint.
- Capacidad diferencial documentada: ninguna más allá del propio proceso de "flourishing-framed character training" y del bucle de self-loop que da nombre al modelo.

## Casos de uso

Los casos siguientes se plantean dentro del ámbito de investigación al que pertenece el artefacto; la licencia internal-research impide su uso comercial o su redistribución:

- Investigación sobre character training: el modelo sirve como punto de la cadena g2 → g3 para estudiar cómo un corpus orientado a "flourishing" modifica el comportamiento del modelo base en una etapa corta de continued pretraining.
- Estudio de dinámicas de self-loop: al provenir de un corpus denominado sorrel-selfloop, permite analizar experimentalmente qué ocurre cuando se entrena sobre datos generados o filtrados por el propio modelo, un fenómeno relevante por su relación con el colapso de diversidad.
- Medición de deriva de capacidades (capability drift): comparando este checkpoint con g2 y con Qwen3-4B original se puede cuantificar la pérdida o retención de capacidades tras un midtrain de solo 7,85 millones de tokens.
- Ablaciones reproducibles: la semilla fija (20260821), la revisión del dataset (a6ac5e69dbc6) y el commit del lanzador (a0afb77669ae) permiten replicar el experimento en un entorno controlado.
- Análisis de dinámica de pérdida en corpus pequeños: la traza 1,2108 → 1,1221 sobre 7,85 millones de tokens permite estudiar curvas de aprendizaje con learning rate bajo (1e-5) y una sola época.
- Base para una etapa g4: el checkpoint está pensado como eslabón intermedio, por lo que su uso natural es servir de punto de partida de un midtrain posterior dentro de la misma cadena.
- Evaluación interna con el script del proyecto: la model card indica ejecutar `uv run eval.py --model joshycodes/qwen3-4b-sorrel-selfloop-g3-midtrain --eval all` para obtener métricas propias del pipeline.
- Generación de texto experimental en entorno aislado: dado que no hay datos de seguridad ni de alineación, cualquier generación debería limitarse a entornos de laboratorio sin exposición a usuarios finales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible. El único dato cuantitativo de rendimiento es la pérdida de entrenamiento:

| Etapa | Dataset | Revisión | Tokens vistos | Loss |
|---|---|---|---|---|
| midtrain | joshycodes/sorrel-selfloop-corpus (config sorrel-selfloop-b-g2) | a6ac5e69dbc6 | 7.847.936 | 1,2108 → 1,1221 |

Hiperparámetros del run:

| Parámetro | Valor |
|---|---|
| Learning rate | 1e-05 |
| seq_len | 4096 |
| micro_batch | 4 |
| grad_accum | 4 |
| Épocas | 1,0 |
| Semilla | 20260821 |
| Hardware | 2x NVIDIA H200 (RunPod) |

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir de los 4.022 millones de parámetros, no publicado por el autor): en bf16/fp16 aproximadamente 8 GB solo de pesos, más caché KV y overhead, lo que sitúa el consumo realista en 10-12 GB.
- En cuantización int8 (si se generara): del orden de 4-5 GB de pesos.
- En cuantización int4 (si se generara): del orden de 2,5-3,5 GB de pesos, viable en GPUs de gama media.
- El repositorio ocupa 32,2 GB, coherente con pesos en fp32 y/o estados de optimizador incluidos; la inferencia no requiere cargar ese volumen completo si se convierte a precisión reducida.
- GPU consumer: un modelo de 4B en bf16 cabe en RTX 3090/4090 (24 GB), RTX 4080 (16 GB) y, con cuantización a 8 o 4 bits, en RTX 3060 de 12 GB o RTX 4060 Ti de 16 GB.
- GPU de datacenter: A100 40/80 GB, H100 y H200 (esta última fue la usada para el entrenamiento).
- Opciones de despliegue: transformers como referencia (es el formato publicado, safetensors); vLLM o TGI son viables tras verificar compatibilidad; llama.cpp y Ollama requerirían una conversión a GGUF que no se ha publicado.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Estado | Notas |
|---|---|---|---|---|---|
| qwen3-4b-sorrel-selfloop-g3-midtrain | 4.022.468.096 | no disponible | internal-research | Privado, 0 descargas | Checkpoint de investigación, sin benchmarks |
| qwen3-4b-sorrel-selfloop-g2-midtrain (predecesor directo) | no disponible | no disponible | no disponible | Base de la cadena | Mismo linaje, etapa anterior |
| Qwen3-4B (base) | ~4.000 millones | no disponible en la información recogida | no disponible en la información recogida | Público | Modelo base del linaje; descrito como multilingüe y fuerte en comprensión, generación, código y matemáticas |
| Qwen3-4B-Instruct-2507 / Qwen3-4B-Thinking-2507 | no disponible | no disponible | no disponible | Público | Variantes actualizadas de la familia Qwen3 citadas en el repositorio oficial, sin datos numéricos en la información disponible |

No se dispone de datos comparativos de rendimiento entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- Licencia internal-research: la model card indica explícitamente "artefacto de investigación privado, no redistribuir". El uso comercial, la redistribución y la publicación de derivados quedan excluidos sin autorización del autor.
- Ausencia total de benchmarks: no hay MMLU, HumanEval, GSM8K ni ninguna métrica estándar, por lo que no puede evaluarse su calidad objetiva frente a alternativas.
- Riesgo elevado de olvido catastrófico: el midtrain se limita a 7,85 millones de tokens en una sola época, un volumen muy reducido frente al entrenamiento original del modelo base; es esperable cierta degradación de capacidades previas no medidas.
- Sin alineación documentada: no se menciona RLHF, DPO ni filtros de seguridad, lo que implica un riesgo alto de contenido inapropiado y de alucinación si se expone a usuarios finales.
- Idiomas no declarados: se desconoce qué idiomas conserva el modelo tras el ajuste.
- Contexto no documentado: aunque el entrenamiento usó seq_len de 4096, no se especifica la ventana de contexto efectiva del checkpoint publicado.
- Sesgos desconocidos: el corpus sorrel-selfloop-corpus es privado y no se describe su composición, por lo que no pueden auditarse sesgos de origen.
- Corpus con posible bucle de autoentrenamiento: la naturaleza "selfloop" del dataset introduce el riesgo conocido de reducción de diversidad y de amplificación de sesgos propios del modelo.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta; no existe retroalimentación externa sobre su comportamiento.
- Fechas de publicación en 2026 (creación y actualización el 2026-09-16), lo que lo sitúa como artefacto muy reciente y sin historial de uso.
- No se publican archivos GGUF ni cuantizaciones, lo que complica el despliegue en entornos de bajos recursos sin trabajo adicional de conversión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joshycodes/qwen3-4b-sorrel-selfloop-g3-midtrain
- Modelo base (g2): https://huggingface.co/joshycodes/qwen3-4b-sorrel-selfloop-g2-midtrain
- Dataset de entrenamiento: https://huggingface.co/datasets/joshycodes/sorrel-selfloop-corpus
- Repositorio oficial de Qwen3: https://github.com/QwenLM/Qwen3
- Implementación independiente de Qwen3 4B en PyTorch: https://github.com/alyxya/qwen3-4b
- Ficha de Qwen3-4B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b
- Ficha de Qwen3-4B en ModelScope: https://www.modelscope.cn/models/Qwen/Qwen3-4B
- Repositorio flourishing-training (commit del lanzador a0afb77669ae): no disponible como URL pública en la información proporcionada
