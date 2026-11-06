# miceworks/Mark-SLM-3M

## Resumen

Mark-SLM-3M es un modelo de lenguaje ultrac compacto desarrollado por miceworks, disenado para ajustarse estrictamente al limite de 3.000.000 de parametros fisicos exigido por el Open SLM Leaderboard. Con 2.885.376 parametros totales, implementa una arquitectura deepseek2 que combina Multi-Head Latent Attention (H-MLA) con un esquema de Mixture of Experts de ramificacion paralela (PB-MoE), lo que le permite mantener un coste computacional reducido por token activando solo 2 de sus 16 expertos enrutados.

El modelo se inicializa mediante Truncated SVD Upcycling a partir de Mark-SLM-V3-150M, una tecnica que aprovecha los pesos de un modelo mayor para arrancar el entrenamiento del modelo pequeno en lugar de partir de inicializacion aleatoria. Su ventana de contexto es de 8.192 tokens con un vocabulario BPE de 8.192 entradas, y esta pensado para despliegue en microcontroladores, dispositivos edge, Ollama, LM Studio, llama.cpp y PyTorch.

Su relevancia actual reside en la tendencia hacia SLM (Small Language Models) para entornos con recursos muy limitados: el modelo ocupa aproximadamente 5,50 MiB en FP16 y 1,72 MiB en cuantizacion GGUF IQ4_NL, lo que lo hace viable en hardware donde modelos de cientos de millones de parametros no caben. Esta publicado bajo licencia Apache 2.0 y soporta ingles, portugues y codigo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | deepseek2 (Multi-Head Latent Attention + Parallel Branching MoE) |
| Parametros totales | 2.885.376 |
| Parametros activos | 2 expertos enrutados de 16 + 1 experto compartido por token (numero exacto de parametros activos no disponible) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | FP16 (sin cuantizar) y GGUF IQ4_NL documentados; otras cuantizaciones GGUF no disponibles |
| Idiomas soportados | Ingles, portugues y codigo |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (safetensors implicito en el repo de Transformers) y GGUF |

Especificaciones adicionales de arquitectura:

| Parametro | Valor |
|---|---|
| Dimension oculta | 256 |
| Capas | 8 |
| Cabezas de atencion | 8 |
| Cabezas key/value | 8 |
| q_lora_rank | 128 |
| kv_lora_rank | 64 |
| qk_rope_head_dim | 32 |
| qk_nope_head_dim | 32 |
| v_head_dim | 32 |
| Expertos enrutados | 16 |
| Expertos activos por token | 2 |
| Expertos compartidos | 1 |
| Tamano intermedio MoE | 128 (alineado a bloque de 32) |
| Vocabulario | 8.192 tokens BPE |
| Embeddings atados | Si (lm_head atado a embed_tokens) |
| Pesos FP16 | ~5,50 MiB (~5,77 MB) |
| GGUF IQ4_NL | ~1,72 MiB (~1,80 MB) |

## Arquitectura y entrenamiento

Mark-SLM-3M emplea una arquitectura transformer de tipo deepseek2 con dos innovaciones principales. La primera es Multi-Head Latent Attention (H-MLA), que comprime las proyecciones de query y key/value en espacios latentes de baja dimension (q_lora_rank de 128 y kv_lora_rank de 64) y desacopla las dimensiones rotatorias (qk_rope_head_dim de 32) de las no rotatorias (qk_nope_head_dim de 32), reduciendo el coste de atencion manteniendo la expresividad. La segunda es Parallel Branching MoE (PB-MoE), un esquema con 16 expertos enrutados, 2 activos por token y 1 experto compartido, con tamano intermedio de 128 alineado a bloques de 32 para eficiencia en hardware.

El modelo se inicializa mediante Truncated SVD Upcycling desde Mark-SLM-V3-150M, un modelo de 150M de parametros. Esta tecnica descompone los pesos del modelo mayor mediante SVD truncada para poblar las matrices del modelo pequeno, lo que acelera la convergencia frente a inicializacion aleatoria. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional en ingles y portugues.
- Generacion de codigo (etiqueta `code` en la model card).
- Razonamiento aritmetico basico, evaluado mediante el benchmark ArithMark-3.0 (1.000 preguntas procedurales).
- Razonamiento de sentido comun y conocimiento general evaluado en HellaSwag, ARC-Easy, ARC-Challenge y PIQA.
- Capacidad de ejecucion en dispositivos edge y microcontroladores gracias a su huella de memoria inferior a 6 MB en FP16.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking, vision o audio: no disponible; el modelo es solo de texto.

## Casos de uso

- Clasificacion y filtrado de texto en dispositivos embebidos: con menos de 2 MB en GGUF IQ4_NL, el modelo puede ejecutarse en microcontroladores para tareas de etiquetado, deteccion de spam o moderacion basica sin conexion a red.
- Asistente conversacional offline en ingles y portugues: su ventana de 8.192 tokens permite mantener conversaciones multi-turno en aplicaciones de escritorio o moviles mediante llama.cpp u Ollama, sin depender de servicios en la nube.
- Generacion de snippets de codigo en entornos de recursos limitados: la etiqueta `code` y el vocabulario BPE de 8.192 tokens lo hacen adecuado para autocompletado ligero en editores o plugins que no pueden cargar modelos de mayor tamano.
- Prototipado rapido y educacion: su huella de ~5,5 MiB en FP16 permite experimentar con arquitecturas MoE y MLA en una sola GPU consumer o incluso en CPU, util para docencia e investigacion sobre SLM.
- Evaluacion comparativa en el Open SLM Leaderboard: el modelo esta disenado explicitamente para competir en la categoria por debajo de 3M de parametros, sirviendo como referencia para estudiar el impacto de MLA y MoE a esa escala.
- Procesamiento de texto en el borde para IoT: tareas de resumen corto, extraccion de entidades o respuesta a comandos en dispositivos con memoria muy restringida, donde el modelo cabe junto al firmware del sistema.
- Razonamiento aritmetico simple en asistentes de calculo: el benchmark ArithMark-3.0 sugiere uso en tareas de aritmetica procedural dentro de asistentes de voz o interfaces de calculo embebidas.

## Benchmarks y rendimiento

La model card define los cinco benchmarks oficiales del Open SLM Leaderboard y la formula del AxiomicLabs Intelligence Index, pero no publica los valores numericos obtenidos por Mark-SLM-3M en ninguno de ellos.

| Benchmark | Metrica | Azar | Resultado |
|---|---|---|---|
| HellaSwag | acc_norm | 25,0% | no disponible |
| ARC-Easy | acc_norm | 25,0% | no disponible |
| ARC-Challenge | acc_norm | 25,0% | no disponible |
| PIQA | acc_norm | 50,0% | no disponible |
| ArithMark-3.0 | acc | 25,0% | no disponible |
| AxiomicLabs Intelligence Index | compuesto | — | no disponible |

Formula del indice segun la model card: N(acc, chance) = max(0, 100 × (acc − chance) / (100 − chance)); ARC_Avg_N = (ARC_Easy_N + ARC_Challenge_N) / 2; Intelligence Index = (HellaSwag_N + ARC_Avg_N + PIQA_N + 0,65 × ArithMark3_N) / 3,65.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en todos los casos; aproximadamente 5,5 MiB en FP16 y 1,72 MiB en GGUF IQ4_NL para los pesos.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria libre es suficiente; no se requiere A100, H100 ni RTX 4090. Una GPU integrada o una GTX 1050 bastan.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer de la ultima decada, y tambien en CPU.
- Cabe en microcontroladores y dispositivos edge: si, segun la model card (objetivo explicito del modelo).
- Opciones de despliegue: PyTorch/Transformers con `trust_remote_code=True`, llama.cpp, Ollama, LM Studio y GGUF. Compatibilidad con vLLM o TGI no disponible en la informacion proporcionada.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Mark-SLM-3M | 2.885.376 | 8.192 | Apache 2.0 | Hugging Face (miceworks) |
| Mark-SLM-V3-150M | ~150M (segun nombre) | no disponible | no disponible | Hugging Face (miceworks) |
| Alternativas SLM sub-3M | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada solo permite comparar con Mark-SLM-V3-150M, el modelo del que se hizo upcycling, y no incluye sus especificaciones completas ni sus resultados. No se dispone de datos de otros modelos comparables de la misma categoria (sub-3M de parametros) en la informacion disponible.

## Limitaciones y advertencias

- Escala extrema: con 2,885M de parametros y 8 capas, la capacidad de razonamiento, conocimiento factual y coherencia a largo plazo es muy limitada; no es apto para tareas que requieran conocimiento amplio del mundo.
- Riesgo elevado de alucinacion: a esta escala, el modelo puede generar texto plausible pero incorrecto con alta frecuencia; requiere validacion en produccion.
- Contexto de 8.192 tokens: aunque amplio para su tamano, la calidad de la atencion sobre contextos largos no esta documentada.
- Idiomas limitados: solo ingles, portugues y codigo; no hay soporte declarado de castellano ni de otros idiomas.
- Sesgos: no se documentan evaluaciones de sesgo, toxicidad o seguridad en la model card.
- Entrenamiento no documentado: no se especifican tokens de entrenamiento, composicion del dataset ni alineacion (RLHF/DPO), lo que dificulta evaluar su comportamiento en produccion.
- Licencia Apache 2.0: permite uso comercial, pero el modelo usa `custom_code` y requiere `trust_remote_code=True`, lo que implica ejecutar codigo del autor; conviene auditar dicho codigo antes de desplegarlo.
- Madurez: creado y actualizado el 2026-11-04, con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion ni validacion independiente.
- Resultados de benchmarks no publicados: no es posible verificar su rendimiento real frente a la categoria.

## Enlaces

- Hugging Face: https://huggingface.co/miceworks/Mark-SLM-3M
- Open SLM Leaderboard: no disponible en la informacion proporcionada
- Paper o blog tecnico: no disponible en la informacion proporcionada
- Repositorio de codigo: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada
