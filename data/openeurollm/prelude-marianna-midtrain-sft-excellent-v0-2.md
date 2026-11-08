# openeurollm/Prelude-Marianna-midtrain-SFT-Excellent-v0.2

## Resumen

Prelude-Marianna-midtrain-SFT-Excellent-v0.2 es un ajuste fino supervisado (SFT) del modelo base `marianna13/prelude-9b-midtrain-v1`, un checkpoint intermedio de Prelude, el modelo denso multilingüe experimental de 9B parámetros desarrollado por OpenEuroLLM. El ajuste se ha realizado sobre el dataset `openeurollm/OpenEuroLLM-Excellent-SFT` durante dos épocas, con un total de 55.892 pasos y más de 58.000 millones de tokens de entrada procesados.

El modelo emplea una arquitectura transformer densa de tipo Qwen3 (etiqueta `qwen3` en el repositorio), con 9.094.607.872 parámetros totales y una longitud de contexto máxima de entrenamiento de 32.768 tokens. Incorpora un tokenizador propio de 256k entradas (`openeurollm/tokenizer-256k`) y una plantilla de chat estilo Qwen condicionada por modo de razonamiento, con instrucciones `/think` y `/no_think` para alternar entre razonamiento explícito y respuesta directa.

Su relevancia radica en que forma parte del esfuerzo abierto europeo por construir modelos multilingües con recursos de entrenamiento reproducibles: el repositorio documenta revisiones exactas del modelo base, dataset, tokenizador, hiperparámetros, hardware (32 H100 en MareNostrum 5) y código de entrenamiento. No obstante, se trata de un checkpoint experimental de investigación, sin licencia de publicación asignada de forma explícita y sin resultados de benchmarks publicados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer densa (etiqueta `qwen3`), sin mezcla de expertos |
| Parametros totales | 9.094.607.872 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (longitud máxima de secuencia en entrenamiento) |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos en safetensors; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | no disponible (el modelo base se describe como multilingüe, sin listado oficial en esta ficha) |
| Licencia | no disponible (sin licencia de release asignada al checkpoint; se remite a las licencias del modelo base y del dataset) |
| Formato de pesos | safetensors |
| Tokenizador | openeurollm/tokenizer-256k (revisión 94bae05cf351c4feb435d6a73c2aa8edfd88ae04) |
| Plantilla de chat | Plantilla estilo Qwen condicionada por modo de razonamiento (`enable_thinking`, `thinking_instruction`) |
| Tamaño del repositorio | 18,2 GB |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 9B parámetros derivado de un checkpoint de midtrain de Prelude, etiquetado como `qwen3`, lo que sugiere una arquitectura de la familia Qwen3 con normalización y atención propias de esa familia. El entrenamiento de SFT se realizó con BF16, FlashAttention 3 y kernels Liger, usando DeepSpeed ZeRO-2 sobre 32 GPU NVIDIA H100 distribuidas en 8 nodos de MareNostrum 5 (MN5). Se empleó AdamW (β₁=0,9, β₂=0,95, ε=1e-8, weight decay 0), learning rate de 8e-5 con decaimiento lineal y 3% de warmup, batch efectivo de 32 secuencias empaquetadas (batch por dispositivo 1), clipping de gradiente de 1,0 y gradient checkpointing no reentrante.

El dataset de entrenamiento es `openeurollm/OpenEuroLLM-Excellent-SFT` (revisión c4ee55804f256c5f8cc4a6ef3fdecbe4a4ea95e0). Se aplicó empaquetado de secuencias (packing) con longitud máxima de 32.768 tokens, pérdida calculada solo sobre los turnos del asistente (assistant-only loss) y descarte de respuestas supervisadas parcialmente truncadas (`truncated_span_action: drop`). La innovación destacable es el condicionamiento por modo de razonamiento: los ejemplos de razonamiento reciben `/think` o ninguna instrucción en proporciones iguales (`thinking_instruction_probability: 0.5`), mientras que los ejemplos de respuesta directa reciben `/no_think`. En total se procesaron 58.365.718.851 tokens de entrada y 54.730.454.404 tokens objetivo supervisados a lo largo de las dos épocas, con semillas de entrenamiento y datos fijadas a 42.

## Capacidades

- Generación de texto conversacional con ajuste por instrucciones (SFT) sobre el dataset Excellent-SFT.
- Razonamiento explícito opcional mediante el modo de pensamiento, controlable con `enable_thinking` y el argumento `thinking_instruction` (`"think"`, `"no_think"` o `None`).
- Respuesta directa sin cadena de razonamiento cuando se activa `/no_think`.
- Capacidad multilingüe heredada del modelo base Prelude (sin listado oficial de idiomas en la información disponible).
- Soporte de conversaciones multi-turno mediante la plantilla de chat estilo Qwen incluida en el checkpoint.
- Compatibilidad con Text Generation Inference (`text-generation-inference` en los tags) y con endpoints compatibles.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, visión, audio ni otras modalidades.

## Casos de uso

- Evaluación de investigación de modelos multilingües europeos: el checkpoint sirve para reproducir y analizar el efecto del SFT sobre un midtrain de Prelude, con revisiones exactas de datos, tokenizador y código, lo que permite comparaciones controladas en entornos académicos.
- Asistentes conversacionales con razonamiento conmutable: el control `/think` y `/no_think` permite usar el mismo modelo para consultas que requieren cadena de razonamiento y para respuestas rápidas de baja latencia en un chatbot de propósito general.
- Generación de texto en pipelines de Hugging Face Transformers: al publicarse en safetensors y con plantilla de chat incluida, se puede integrar directamente con `transformers` y desplegar con TGI en infraestructura propia.
- Experimentos de ajuste fino posteriores: al ser un checkpoint SFT documentado, resulta útil como punto de partida para comparar estrategias de post-entrenamiento (DPO, RLHF) sobre la misma base midtrain.
- Procesamiento de documentos largos: con 32.768 tokens de contexto de entrenamiento, puede abordar resúmenes y extracción de información en documentos extensos, siempre que se validen los límites reales del modelo base.
- Docencia y divulgación sobre entrenamiento de LLM: la model card detalla hiperparámetros, hardware y contadores de tokens, lo que lo convierte en un ejemplo didáctico de una ejecución SFT a escala de 9B con ZeRO-2 y FlashAttention 3.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a un panel de evaluaciones multilingües de Prelude en la colección de Hugging Face de OpenEuroLLM, pero no se incluyen cifras concretas (MMLU, HumanEval, GSM8K u otras) en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 18,2 GB solo para pesos (9,09B parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica se recomienda al menos 24 GB para contexto corto.
- VRAM estimada en cuantización de 8 bits: alrededor de 9-10 GB para pesos; en 4 bits, alrededor de 5-6 GB, aunque no se documentan cuantizaciones oficiales en el repositorio.
- GPU recomendadas para BF16: NVIDIA A100 (40/80 GB), H100 (80 GB) o L40S; para contexto completo de 32.768 tokens conviene disponer de 40 GB o más.
- GPU de consumo: cabe en RTX 4090 (24 GB) en BF16 con contexto moderado y en RTX 3090/4080 mediante cuantización; en GPUs de 16 GB o menos sería necesario cuantizar a 8 o 4 bits.
- Opciones de despliegue: Hugging Face Transformers (librería declarada), Text Generation Inference (tag `text-generation-inference`) y endpoints compatibles; no se documenta soporte oficial para llama.cpp, Ollama o vLLM en la información disponible.
- Latencia y throughput: no disponibles; el entrenamiento usó 32 H100 en 8 nodos, pero no se publican métricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Prelude-Marianna-midtrain-SFT-Excellent-v0.2 | 9,09B (denso) | 32.768 | no disponible | Hugging Face (openeurollm) | Checkpoint SFT experimental sobre midtrain de Prelude |
| Modelo base `marianna13/prelude-9b-midtrain-v1` | 9B (denso) | no disponible | no disponible | Hugging Face (marianna13) | Checkpoint de midtrain sin SFT; misma familia y tokenizador |
| Alternativas de la familia Qwen3 de ~8-9B | no disponible | no disponible | no disponible | no disponible | La etiqueta `qwen3` sugiere arquitectura similar, pero no se dispone de datos verificados en la información proporcionada |

No se dispone de información suficiente para comparar rendimiento (benchmarks) con alternativas de la misma categoría.

## Limitaciones y advertencias

- Checkpoint experimental de investigación: no se ha asignado una licencia de release propia; el uso comercial queda sujeto a las licencias del modelo base y del dataset, que deben consultarse por separado.
- No se publican resultados de benchmarks, por lo que no hay evidencia cuantitativa de calidad frente a alternativas.
- Riesgo de alucinación inherente a un modelo de 9B ajustado por SFT; no se documentan mitigaciones específicas.
- El listado de idiomas soportados no está disponible; aunque el modelo base se describe como multilingüe, no se garantiza cobertura ni calidad por idioma.
- El contexto de 32.768 tokens corresponde a la longitud máxima de entrenamiento; el rendimiento más allá de esa ventana no está garantizado.
- El condicionamiento por modo de razonamiento depende de usar la plantilla de chat y el tokenizador incluidos; usar otra plantilla puede degradar el comportamiento.
- No se documentan capacidades de tool calling, agentes o multimodalidad; no debe asumirse su disponibilidad en producción.
- El repositorio contiene únicamente pesos de inferencia y tokenizador, no estado de entrenamiento reanudable ni optimizador.
- El modelo se publicó con 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openeurollm/Prelude-Marianna-midtrain-SFT-Excellent-v0.2
- Modelo base: https://huggingface.co/marianna13/prelude-9b-midtrain-v1/tree/67b439831cd1c68b430830bf19cb8c6bae95d54f
- Dataset de entrenamiento: https://huggingface.co/datasets/openeurollm/OpenEuroLLM-Excellent-SFT/tree/c4ee55804f256c5f8cc4a6ef3fdecbe4a4ea95e0
- Tokenizador: https://huggingface.co/openeurollm/tokenizer-256k/tree/94bae05cf351c4feb435d6a73c2aa8edfd88ae04
- Repositorio de entrenamiento: https://github.com/OpenEuroLLM/post-training
- Pull request de implementación (PR #68): https://github.com/OpenEuroLLM/post-training/pull/68
- Discusión de experimento y evaluación (Taskboard #442): https://github.com/OpenEuroLLM/Taskboard/issues/442
- Página de Prelude en OpenEuroLLM: https://www.openeurollm.eu/prelude
- Colección Prelude en Hugging Face: https://huggingface.co/collections/openeurollm/prelude
