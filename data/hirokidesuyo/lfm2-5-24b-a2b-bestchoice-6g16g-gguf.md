# hirokidesuyo/LFM2.5-24B-A2B-BestChoice-6G16G-GGUF

## Resumen

LFM2.5-24B-A2B-BestChoice-6G16G-GGUF es una cuantización GGUF del modelo base LiquidAI/LFM2.5-24B-A2B, un transformer de arquitectura MoE con 23.971.587.712 parámetros totales y aproximadamente 2.500 millones de parámetros activos por token. El autor, hirokidesuyo, no se limita a cuantizar el modelo original: aplica una receta de tres fases (ajuste de ejecución en llama.cpp, un layout de cuantización propio basado en medición de sensibilidad por tensor, y un proceso de destilación con datos en inglés y japonés) con el objetivo declarado de obtener el mejor comportamiento general posible en un equipo con 6 GB de VRAM y 16 GB de RAM.

El modelo resuelve un problema práctico: ejecutar un MoE de casi 24.000 millones de parámetros en hardware de consumo modesto (una RTX 3060 Laptop de 6 GB) manteniendo una calidad razonable en razonamiento, código y conversación, con soporte nativo de japonés e inglés. El artefacto pesa 9.443.769.984 bytes (unos 9,4 GB) y emplea una cuantización IQ3_XXS modificada con asignación de bits por tipo de tensor.

Es relevante ahora porque demuestra una metodología reproducible de cuantización consciente de la sensibilidad (medición de perplexity por bloque y tipo de tensor) y de destilación orientada a corregir un fallo concreto del modelo base: la incapacidad de converger en la respuesta dentro del límite de tokens. El modelo base no publica resultados de benchmarks en la información disponible, y la evaluación presentada es un conjunto propio de 54 preguntas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos), con módulos shortconv; modelo base LiquidAI/LFM2.5-24B-A2B |
| Parametros totales | 23.971.587.712 |
| Parametros activos | Aproximadamente 2.500 millones (según model card: "活性約 2.5B") |
| Longitud de contexto | Evaluado con ctx 8192 en llama-server y ctx 32768 en pruebas de velocidad; límite nativo del modelo base no disponible |
| Tipos de cuantizacion | Un único archivo GGUF con layout UD propio: base IQ3_XXS, expert gate/up en iq2_s (bloques 2-9 y 35-39 elevados a iq3_s), expert down en iq3_s, attention/dense FFN/embeddings en q6_k, shortconv en iq3_xxs, router y norms en f32 |
| Idiomas soportados | Japonés (ja) e inglés (en) |
| Licencia | other (sujeta a las condiciones del modelo base y de los datos de destilación) |
| Formato de pesos | GGUF (9.443.769.984 bytes; SHA-256 e56585ced40f894eec70d51877fffc1383c651f07cdf3e435d683717288f86f4) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer con mezcla de expertos (MoE) de aproximadamente 24.000 millones de parámetros totales y unos 2.500 millones activos por token, sobre el que el autor aplica un proceso de destilación con LoRA. El ajuste se realizó cargando el modelo base en 4 bits con Unsloth FastLanguageModel, con max_seq_len de 4096, LoRA de r=16 y alpha=32, salvo en las FFN de los expertos (w1/w2/w3) donde se usó r=4 y alpha=8 mediante rank_pattern y alpha_pattern. Se entrenaron 46 módulos (attention, dense FFN, expert FFN y shortconv), con unos 2,46 millones de parámetros entrenables. El optimizador fue AdamW fused con lr 1e-4, schedule cosine, warmup 3, batch 8, una época y precisión bf16; el entrenamiento consumió 1.918 bloques (240 pasos) en una Colab L4 durante 3.489 segundos, con train_loss final de 0,5764. El merge se hizo en streaming con escalado calculado por módulo (efectivo 2.0) y se generó un GGUF F16 de 47.962.094.976 bytes antes de cuantizar.

Los datos de destilación suman 14.674 filas y 7.856.616 tokens: 6.000 de razonamiento en inglés, 3.000 de código y 2.250 de respuesta corta en inglés procedentes del corpus público r0b0tlab/qwen3.8-max-glm5.2-distillation-51389 (cuyos trazos provienen de Qwen3.8-Max-Preview, GLM-5.2 y Kimi K3), más 2.600 de matemáticas en japonés (NuminaMath-CoT-JA), 314 de lógica en japonés generados por plantilla y 510 de conversación en japonés ampliados. Se filtraron trazos no convergentes y de longitud desproporcionada, y se eliminaron 296 filas con solapamiento de 20-gramas respecto a los benchmarks de evaluación. La innovación técnica principal es el layout de cuantización derivado de un mapa de sensibilidad medido empíricamente: se probó el impacto en perplexity de subir de precisión cada tipo de tensor y bloque, y se asignaron bits solo donde el beneficio era medible. Por ejemplo, elevar expert gate/up de los bloques 2-9 a iq3_s cuesta +264 MB y reduce la PPL un 2,56 % en inglés y un 1,84 % en japonés, mientras que subir shortconv a iq3_s empeora la PPL un 3,67 %. El resultado final: PPL en inglés 14,0789 (−3,73 % frente a la referencia) y en japonés 18,5336 (−4,22 %), con un coste de velocidad del 1,9 % (56,3 t/s frente a 57,4 t/s) y sin cambios en el pico de VRAM (4.451 MiB).

## Capacidades

- Generación de texto conversacional multi-turno en inglés y japonés, con formato de chat compatible con la API Chat Completions.
- Razonamiento con modo de pensamiento explícito: el modelo emite trazos internos en formato `<think>...</think>` antes de la respuesta final.
- Generación de código, evaluada con pruebas de ejecución reales en el conjunto propio del autor (11/11 en la categoría de código).
- Razonamiento matemático y lógico, con datos de entrenamiento específicos en japonés (NuminaMath-CoT-JA y plantillas de lógica).
- Respuestas de conocimiento factual y respuestas cortas directas.
- Capacidad multilingüe limitada a japonés e inglés; el modelo produce trazos de pensamiento en japonés de forma consistente (21/21 en las preguntas en japonés).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada; el modelo sucesor (BestChoice-Grounded) añade comportamiento de verificación y uso de herramientas, lo que sugiere que este modelo no lo incorpora de forma nativa.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Asistente conversacional local en japonés e inglés: el modelo mantiene conversaciones multi-turno con contexto de hasta 8192 tokens en las pruebas del autor, y está optimizado para ejecutarse en un portátil con 6 GB de VRAM y 16 GB de RAM, lo que permite desplegarlo sin conexión ni costes de API.
- Generación de código en entornos con recursos limitados: obtuvo 11/11 en las pruebas de ejecución de código del conjunto propio, por lo que es adecuado para autocompletado, generación de scripts y tareas de programación asistida en un portátil de gama media.
- Razonamiento matemático y resolución de problemas paso a paso en japonés: los datos de entrenamiento incluyen 2.600 ejemplos de NuminaMath-CoT-JA y el modelo produce trazos de pensamiento en japonés, lo que lo hace útil para tutoría o asistencia educativa en ese idioma.
- Atención al cliente automatizada en japonés: el ajuste incluye 510 ejemplos de conversación en japonés ampliados y el modelo mantiene coherencia conversacional con contexto de 8K tokens, suficiente para gestionar hilos de soporte con historial.
- Prototipado e investigación sobre cuantización: el layout UD documentado y las mediciones de sensibilidad por tensor sirven como referencia reproducible para estudiar el impacto de la asignación de bits en modelos MoE.
- Despliegue en edge computing o entornos air-gapped: al caber en 9,4 GB de disco y ejecutarse con llama.cpp usando el expert cache en RAM, es viable en equipos sin GPU dedicada de gama alta o en entornos sin acceso a servicios en la nube.
- Evaluación comparativa de modelos destilados: el conjunto de 54 preguntas y la metodología de filtrado por 20-gramas descritos en la model card permiten replicar la comparación frente al modelo base y a otras cuantizaciones.

## Benchmarks y rendimiento

Los datos proceden de un conjunto propio de 54 preguntas (11 de razonamiento en japonés, 10 de instrucciones en japonés, 11 de razonamiento en inglés, 11 de código y 11 de conocimiento), evaluado con llama.cpp b12208, ctx 8192, temperatura 0 y máximo 1024 tokens generados. Las métricas son finalización (finish_reason = stop), acierto, finalización × acierto y proporción de pensamiento en japonés.

| Modelo | Finalización | Acierto | Finalización × acierto | Pensamiento en japonés |
|---|---|---|---|---|
| Este modelo | 54 | 53 | 53 | 21/21 |
| Versión previa 2 (no publicada) | 53 | 51 | 51 | 5/21 |
| Versión previa 1 (Distill-GGUF) | 53 | 51 | 51 | 5/21 |
| Abliterated UD-IQ3_XXS (alexwkleung) | 49 | 50 | 49 | 1/21 |
| Base + Unsloth UD-IQ3_XXS | 45 | 45 | 45 | 0/21 |

Desglose por dominio (finalización × acierto):

| Dominio | Este modelo | Previa 2 | Previa 1 | Abliterated | Base + Unsloth |
|---|---|---|---|---|---|
| Código (11) | 11 | 10 | 10 | 8 | 8 |
| Razonamiento inglés (11) | 11 | 11 | 11 | 11 | 10 |
| Instrucciones japonés (10) | 9 | 9 | 8 | 8 | 7 |
| Razonamiento japonés (11) | 11 | 10 | 11 | 11 | 10 |
| Conocimiento (11) | 11 | 11 | 11 | 11 | 10 |

En el subconjunto de 30 preguntas usado históricamente, este modelo también lidera con 29/30, frente a 24 del base, 27 del Abliterated, 27 de la previa 1 y 28 de la previa 2. En velocidad de generación (llama-completion, prompt fijo, 512 tokens, temp 0, ctx 32768, KV cache q8_0), el ajuste del expert cache eleva el rendimiento de 23,54 t/s a 52,87 t/s en la versión Abliterated y de 16,23 t/s a 65,71 t/s en la destilada v1, con los parámetros moe-cache-mib 3072, moe-cache-cpu-share 0,5 y load-mode dio. No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM: pico medido de 4.451 MiB con el layout final y el expert cache configurado; el objetivo de diseño es 6 GB de VRAM.
- RAM: 16 GB es suficiente para que todos los expertos residan en memoria (verificado en el equipo de referencia).
- GPU recomendadas: RTX 3060 Laptop 6 GB (equipo de medida del autor); cualquier GPU con 6 GB o más de VRAM puede ejecutar el modelo con el expert cache activado.
- Cabe en GPU de consumo: sí, en tarjetas de 6 GB o más (RTX 3060, RTX 4060, RTX 2060, etc.) siempre que se reserven los expertos en RAM.
- Opciones de despliegue: llama.cpp (llama-server, llama-completion, llama-perplexity) con la build b12208 o superior; requiere la funcionalidad de expert cache (`--moe-cache-mib`, `--moe-cache-cpu-share`, `-lm dio`, PR #30966). Compatible con endpoints según los tags del repositorio. Soporte en vLLM, TGI u Ollama: no disponible en la información proporcionada.
- Latencia y throughput: 56,3 t/s en la medición final con el layout C2 (frente a 57,4 t/s del layout estándar, un 1,9 % menos) y 65,71 t/s en la versión destilada v1 con los parámetros de expert cache recomendados. Para entornos con otros procesos GPU, el autor recomienda bajar moe-cache-mib a 2368.
- Disco: 9,4 GB para el archivo GGUF.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (54 preguntas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (BestChoice-6G16G) | 24B totales / ~2,5B activos | 8192 en evaluación (32768 en pruebas de velocidad) | 53/54 finalización × acierto | other | GGUF en HF |
| LFM2.5-24B-A2B-Distill-GGUF (previa 1) | 24B / ~2,5B | no disponible | 51/54 | other | GGUF en HF |
| LFM2.5-24B-A2B Abliterated UD-IQ3_XXS (alexwkleung) | 24B / ~2,5B | no disponible | 49/54 | other | GGUF en HF |
| LFM2.5-24B-A2B + Unsloth UD-IQ3_XXS | 24B / ~2,5B | no disponible | 45/54 | other | GGUF en HF |

La comparación se limita a variantes del mismo modelo base, ya que la información proporcionada no incluye datos de modelos de otros desarrolladores con tamaño y contexto equivalentes. El modelo sucesor BestChoice-Grounded, con el mismo layout y requisitos de hardware, obtiene 48/54 en el mismo conjunto, por debajo de este modelo en respuesta directa sin herramientas.

## Limitaciones y advertencias

- La licencia es "other" y queda sujeta a las condiciones del modelo base LiquidAI/LFM2.5-24B-A2B y de los datos de destilación; no se detallan los términos exactos de uso comercial en la información disponible, por lo que debe verificarse antes de un despliegue en producción.
- El modelo solo soporta japonés e inglés de forma declarada; el rendimiento en otros idiomas no está evaluado.
- La evaluación se basa en un conjunto propio de 54 preguntas, no en benchmarks estándar de la comunidad (MMLU, HumanEval, GSM8K), lo que limita la comparabilidad con otros modelos.
- El conjunto de evaluación comparte origen con datos de destilación (corpus r0b0tlab); aunque el autor verificó la ausencia de solapamiento de 20-gramas en 24 preguntas añadidas y eliminó 296 filas del entrenamiento, el riesgo de contaminación residual no puede descartarse por completo.
- El modelo base mostraba problemas de convergencia: 9 de 54 preguntas se agotaban sin respuesta dentro de los 1024 tokens. Aunque la destilación corrige este comportamiento en gran medida (54/54 de finalización), el límite de generación sigue siendo un factor a considerar en producción.
- Riesgo de alucinación: el modelo sucesor Grounded se creó precisamente para añadir comportamiento de verificación y evitar afirmaciones sin fundamento, lo que sugiere que este modelo puede producir respuestas no verificadas con mayor frecuencia.
- El ajuste de velocidad depende de funcionalidades específicas de llama.cpp (expert cache, PR #30966) y de una build reciente (b12208); en otras implementaciones el rendimiento puede degradarse notablemente (de 65,71 t/s a 16,23 t/s sin el ajuste).
- El rendimiento en instrucciones en japonés es el punto más débil del conjunto evaluado (9/10), con un fallo registrado.
- No hay información sobre sesgos conocidos, comportamiento en tool calling ni capacidades de agente para este modelo concreto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hirokidesuyo/LFM2.5-24B-A2B-BestChoice-6G16G-GGUF
- Modelo sucesor BestChoice-Grounded: https://huggingface.co/hirokidesuyo/LFM2.5-24B-A2B-BestChoice-Grounded-6G16G-GGUF
- Versión previa 1 (Distill-GGUF): https://huggingface.co/hirokidesuyo/LFM2.5-24B-A2B-Distill-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B
- Cuantización de referencia de Unsloth: https://huggingface.co/unsloth/LFM2.5-24B-A2B-GGUF
- Corpus de destilación: https://huggingface.co/datasets/r0b0tlab/qwen3.8-max-glm5.2-distillation-51389
- PR de llama.cpp con expert cache: https://github.com/ggml-org/llama.cpp/pull/30966
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
