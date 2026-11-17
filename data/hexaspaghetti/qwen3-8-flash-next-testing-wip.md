# HexaSpaghetti/Qwen3.8-Flash-Next-Testing-WIP

## Resumen

Qwen3.8-Flash-Next es un modelo experimental de lenguaje y visión desarrollado por el equipo Qwen (Alibaba), publicado como avance de la arquitectura que sustentará la futura familia Qwen4. Se trata de un transformer causal con codificador visual, de tipo Mixture-of-Experts (MoE) disperso, con 125.000 millones de parámetros en el modelo de lenguaje de los cuales solo 6.000 millones se activan por token, más 51.000 millones adicionales en un embedding de n-gramas y 4.000 millones en un módulo de predicción multi-token (MTP). El total real de pesos en safetensors asciende a 177.392.830.576 parámetros.

La ficha que nos ocupa, HexaSpaghetti/Qwen3.8-Flash-Next-Testing-WIP, es un fine-tune derivado de ese modelo base, generado con la herramienta Heretic v2.2.0.dev0 (versión modificada) mediante una técnica de ablación de rangos arbitrarios (Arbitrary-Rank Ablation, ARA) sobre las capas 5 a 48. El objetivo declarado es eliminar los comportamientos de rechazo del modelo original (decensoring/abliteration): según la model card, el modelo original rechaza 99 de cada 100 peticiones en su conjunto de prueba, mientras que este fine-tune rechaza 1 de cada 100, con una divergencia KL de 0,1895 respecto al original. El propio autor advierte de que el modelo está "roto" y lo etiqueta como WIP (work in progress).

Es relevante ahora porque documenta, por un lado, la primera publicación de pesos abiertos bajo la arquitectura Qwen4 (atención híbrida con Qwen Sparse Attention, Gated Residual y N-gram Embedding) y, por otro, un caso práctico de modificación de alineamiento mediante ablación reproducible, con parámetros ARA explícitos y un directorio `reproduce` para replicar el proceso. La licencia es `qwen-community-1.0` (etiquetada como "other" en Hugging Face).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con codificador visual; híbrido Gated DeltaNet + Qwen Sparse Attention (QSA), MoE con 512 expertos, Gated Residual, N-gram Embedding y MTP |
| Parametros totales | 177.392.830.576 (125B LM + 51B n-gram embedding + 4B MTP, según model card) |
| Parametros activos | 6B en el LM (10 expertos enrutados + 1 compartido de 512) |
| Longitud de contexto | 262.144 tokens nativos, extensible hasta 1.000.000 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo base emplea un diseño híbrido de 48 capas con un patrón repetido 12 veces: tres bloques de Gated DeltaNet (atención lineal) seguidos de un bloque de Qwen Sparse Attention (QSA). La Gated DeltaNet usa 48 cabezas lineales para V y 16 para QK, con dimensión de cabeza 128. La QSA opera a nivel de micro-bloque (no de token individual), con 24 cabezas de consulta y 2 de clave-valor, dimensión de cabeza 256, RoPE de 64 dimensiones y un indexador MQA de 4 cabezas de consulta y 1 cabeza de clave compartida con dimensión 128; el presupuesto de atención es de 512 bloques o 2.048 tokens. La dimensión oculta es 2.560, el vocabulario de 248.320 tokens (con padding) y el embedding de n-gramas indexa 20.000.000 de bigramas/trigramas en la capa 2.

El MoE cuenta con 512 expertos de dimensión intermedia 640, activando 10 enrutados más 1 compartido. El Gated Residual dispone de 4 ramas con rango de cuello de botella 320. El módulo MTP consta de 1 capa entrenada con múltiples pasos. El recetario de entrenamiento combina los optimizadores Muon y AdamW según categorías de pesos, elimina el warmup de tamaño de lote y arranca directamente en el tamaño objetivo, lo que reduce el número total de pasos del optimizador. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO.

El fine-tune de esta ficha aplica Arbitrary-Rank Ablation con los siguientes parámetros: `start_layer_index` 5, `end_layer_index` 48, `preserve_good_behavior_weight` 0,5262, `steer_bad_behavior_weight` 0,0013, `overcorrect_relative_weight` 0,9214 y `neighbor_count` 14. El proceso es reproducible mediante el directorio `reproduce` del repositorio.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno.
- Procesamiento de imagen y texto combinados (pipeline `image-text-to-text`), gracias al codificador visual del modelo base.
- Razonamiento multi-paso y cargas de trabajo agénticas, favorecidas por la QSA y el contexto largo.
- Capacidad de contexto largo: 262.144 tokens nativos, extensible a 1.000.000 en la variante oficial Qwen3.8-Flash.
- Decodificación especulativa mediante el módulo MTP (predicción multi-token).
- Comportamiento "decensored"/abliterated: reducción drástica de rechazos según la model card del autor (1/100 frente a 99/100 del original).
- Soporte de tool calling / function calling: no confirmado explícitamente para este fine-tune; la variante oficial Qwen3.8-Flash incluye herramientas integradas, pero no se detalla en la información disponible para este repositorio.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Investigación sobre alineamiento y ablación: el modelo sirve como caso de estudio reproducible para medir el efecto de la ablación de rangos arbitrarios sobre las tasas de rechazo y la divergencia KL, con parámetros ARA documentados y directorio de reproducción.
- Evaluación de robustez de salvaguardas: permite a equipos de seguridad comprobar cómo responde un modelo de 177B parámetros tras eliminar comportamientos de rechazo, comparándolo con el original.
- Experimentación con arquitecturas híbridas: útil para estudiar en la práctica el rendimiento de Gated DeltaNet + QSA, Gated Residual y N-gram Embedding en cargas de contexto largo, al ser la primera publicación de pesos de esta arquitectura.
- Procesamiento de documentos largos con imagen: el pipeline image-text-to-text y el contexto de 262.144 tokens permiten analizar informes escaneados, tablas y figuras en una sola pasada.
- Prototipado de asistentes conversacionales sin filtros editoriales: para entornos controlados de investigación donde se requiera estudiar respuestas sin rechazo previo.
- Pruebas de decodificación especulativa: el módulo MTP permite medir ganancias de throughput en pipelines de inferencia con vLLM, SGLang o TokenSpeed.
- Benchmarking de cuantización: con 177.000 millones de parámetros totales y 6.000 millones activos, es un banco de pruebas para evaluar el equilibrio entre memoria y latencia en despliegues MoE.

## Benchmarks y rendimiento

| Metrica | Este modelo | Modelo original (Qwen/Qwen3.8-Flash-Next) |
|---|---|---|
| Rechazos (Refusals) | 1/100 | 99/100 |
| Divergencia KL | 0,1895 | 0 (por definición) |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar para este fine-tune ni para el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 177.392.830.576 parámetros en safetensors y un repositorio de 354,8 GB, la inferencia en precisión completa requiere varios aceleradores de alta capacidad; el tamaño del repo (354,8 GB) sugiere pesos en bf16/fp16.
- GPU recomendadas: no disponible en la información proporcionada. Por volumen de pesos, un despliegue en bf16 exige agregados multi-GPU del tipo A100/H100 con memoria agregada superior a 350 GB; no se confirman configuraciones concretas.
- ¿Cabe en GPU de consumo? No en precisión completa. No se dispone de datos sobre cuantizaciones (GGUF, AWQ, GPTQ) para este repositorio, por lo que no se puede confirmar su viabilidad en RTX 4090 u otras GPU de consumo.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang y TokenSpeed, según la model card del modelo base. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La arquitectura QSA está diseñada para reducir la latencia en contexto largo y el MTP para acelerar la decodificación, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Notas |
|---|---|---|---|---|
| HexaSpaghetti/Qwen3.8-Flash-Next-Testing-WIP | 177,4B / 6B | 262.144 (extensible a 1M) | qwen-community-1.0 | Fine-tune abliterated, marcado como WIP y "roto" por el autor; 7 descargas |
| Qwen/Qwen3.8-Flash-Next | 125B LM + 51B n-gram + 4B MTP / 6B | 262.144 (extensible a 1M) | qwen-community-1.0 | Modelo base original; rechazos 99/100; referencia de la ablación |
| Qwen3.8-Flash (Qwen Cloud) | no disponible | 1M por defecto | servicio propietario | Versión oficial de producción con herramientas integradas; no es de pesos abiertos |

No se dispone de información sobre otros modelos comparables de la misma categoría (MoE con atención híbrida y visión) en la documentación proporcionada.

## Limitaciones y advertencias

- El propio autor declara que el modelo está "roto" y lo etiqueta como WIP (testing); no es apto para producción.
- La ablación elimina los comportamientos de rechazo (1/100 frente a 99/100), lo que implica ausencia de salvaguardas de seguridad y riesgo de generar contenido dañino, sesgado o no filtrado.
- La divergencia KL de 0,1895 respecto al original indica una desviación no trivial en la distribución de salidas; puede degradar tareas que dependían del alineamiento original.
- Riesgo de alucinación: no cuantificado en la información disponible; previsible en un modelo de 177B parámetros modificado por ablación.
- Idiomas soportados: no disponibles; no se puede confirmar cobertura multilingüe.
- Licencia `qwen-community-1.0`: las condiciones de uso comercial no se detallan en la información proporcionada; deben consultarse en el archivo LICENSE del repositorio antes de cualquier uso productivo.
- El repositorio tiene 7 descargas y 0 likes, sin validación comunitaria; el soporte y mantenimiento son inciertos.
- No se han publicado cuantizaciones ni requisitos de hardware verificados para este fine-tune.
- La información sobre tool calling y capacidades agénticas corresponde al modelo base; no se confirma su conservación tras la ablación.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/HexaSpaghetti/Qwen3.8-Flash-Next-Testing-WIP
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Blog oficial de Qwen3.8-Flash-Next: https://qwen.ai/blog?id=qwen3.8-flash-next
- Informe técnico: https://github.com/QwenLM/Qwen3.8-Flash-Next/blob/main/tech_report.pdf
- Repositorio GitHub de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next
- Heretic: https://heretic-project.org
- Qwen Cloud (Qwen3.8-Flash): https://www.qwencloud.com/models/qwen3.8-flash
- Qwen Cloud: https://www.qwencloud.com
