# f3nc3r/Huihui-Qwen3.5-4B-abliterated-miniQuant

## Resumen

Huihui-Qwen3.5-4B-abliterated-miniQuant es una cuantización GGUF de precisión extrema (por debajo de 2 bits por peso) del modelo huihui-ai/Huihui-Qwen3.5-4B-abliterated, que a su vez es una versión "abliterated" (con los mecanismos de rechazo atenuados) de un modelo de la familia Qwen 3.5 de 4.205 millones de parámetros. El trabajo lo firma el usuario f3nc3r y se apoya en el fork fencerJP/llama.cpp-miniQuant, un motor de inferencia derivado de llama.cpp con soporte para el pipeline de cuantización denominado "Recipe B".

El objetivo del modelo es llevar un transformer de 4B a un tamaño de fichero inferior a 1 GiB manteniendo una coherencia aceptable, de modo que pueda ejecutarse en hardware muy limitado (CPU de portátil, GPUs con poca VRAM, sistemas embebidos). Para ello combina checkpoints de Quantization-Aware Training/Distillation (FraQAT + HESTIA), rotaciones de Hadamard conmutativas sobre las proyecciones de contracción, asignación no uniforme de bits por tipo de tensor y un refinamiento de escalas de bloque mediante LMS.

Es relevante ahora porque demuestra que es viable servir modelos conversacionales de 4B con un consumo de almacenamiento y memoria cercano al de un modelo de 1B en FP16, a costa de una pérdida de calidad que el autor no cuantifica con benchmarks estándar. La licencia Apache 2.0 y el formato GGUF facilitan su integración en herramientas del ecosistema llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen 3.5), con proyecciones recurrentes tipo Gated DeltaNet (tensores ssm_in, ssm_out, conv1d, dt, alpha, beta) según la receta de cuantización |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF sub-2 bpw: IQ1_S, IQ2_XXS, IQ3_XXS, IQ2_K, IQ4_K (mezcla por tensor, "Recipe B") |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp / llama.cpp-miniQuant) |

## Arquitectura y entrenamiento

El modelo base es un transformer de 4.205 millones de parámetros de la familia Qwen 3.5, en su variante "abliterated" publicada por huihui-ai, que elimina o atenúa la dirección de rechazo del modelo original. La model card de esta cuantización no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; únicamente describe el proceso de cuantización.

El pipeline "Recipe B" consta de cuatro etapas: (1) punto de partida en checkpoints BF16 obtenidos mediante Quantization-Aware Training/Distillation (FraQAT con destilación KL puenteada HESTIA); (2) particionado con rotaciones de Hadamard emparejadas de 256 dimensiones aplicadas solo a las proyecciones de contracción (ffn_down, ssm_out, attn_output), preservando en su base natural las proyecciones de estado recurrente de Gated DeltaNet (ssm_in, conv1d, dt, alpha, beta) y los embeddings; (3) asignación no uniforme de bits: IQ1_S (~1,56 bpw) para el tronco (ffn_up, ffn_gate, attn_qkv, ssm_in), IQ2_XXS (~2,06 bpw) para ffn_down, IQ3_XXS (~3,06 bpw) para attn_output, ssm_out y attn_v, e IQ4_K para los anclajes de frontera (token_embd.weight y output.weight), justificado porque la tabla de embeddings de 248k vocabulario supone el 15,1 % de los pesos en el modelo de 4B; (4) destilación de escalas de bloque mediante Least Mean Squares (LMS) contra los pesos BF16 del profesor.

## Capacidades

- Generación de texto conversacional multi-turno en inglés, heredada del modelo base Qwen 3.5.
- Razonamiento y respuesta a instrucciones en formato chat (plantilla `<|im_start|>...<|im_end|>`).
- Generación de código y matemáticas: capacidad esperable por la familia Qwen 3.5, aunque no verificada en esta cuantización.
- Soporte de tool calling / function calling: no confirmado en la información disponible para esta cuantización.
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Capacidades multilingües: limitadas al inglés según el campo `language: en` de la model card.
- Modo "thinking": no disponible en la información proporcionada.
- Visión o audio: no disponible.
- Comportamiento "abliterated": el modelo base está modificado para reducir los rechazos, lo que cambia el perfil de respuestas respecto al Qwen 3.5 original.

## Casos de uso

- Inferencia en CPU de portátil: con 1,05 GiB en disco y 26,7-28,9 tok/s de decodificación en un Ryzen AI 9 HX 470, es adecuado para asistentes locales que deben funcionar sin GPU dedicada.
- Despliegue en GPUs con poca VRAM: el checkpoint de 0,95 GiB (1,931 bpw) cabe holgadamente en tarjetas de 4-8 GB, permitiendo servir un chat de 4B en hardware de gama de entrada.
- Prototipado rápido de aplicaciones conversacionales: el formato GGUF y la compatibilidad con llama.cpp permiten integrar el modelo en scripts de prueba sin infraestructura de servido compleja.
- Sistemas embebidos y edge computing: el tamaño inferior a 1 GiB facilita su distribución en dispositivos con almacenamiento y memoria restringidos.
- Evaluación de técnicas de cuantización extrema: útil como referencia para investigadores que comparan recetas sub-2 bpw frente a cuantizaciones estándar Q4_K_M o Q8_0.
- Generación de texto de bajo coste en pipelines por lotes: la velocidad de prefill de 80,7-213,4 tok/s en CPU permite procesar prompts largos con un coste energético bajo.
- Filtrado y clasificación de texto en inglés: tareas de etiquetado o resumen simple donde la pérdida de calidad por cuantización es tolerable.

## Benchmarks y rendimiento

La model card solo publica métricas de velocidad en CPU, no resultados de calidad (MMLU, HumanEval, GSM8K, etc.).

| Checkpoint | Tamano | BPW efectivo | Prefill (CPU) | Decode (CPU) |
|---|---|---|---|---|
| Huihui-Qwen3.5-4B-ab_QAT-RecipeB-Distilled.gguf | 1,05 GiB (1.128,69 MB) | 2,251 | 80,7-210,2 tok/s | 26,7-28,9 tok/s |
| Huihui-Qwen3.5-4B-ab_QAT-Sub2Bpw-Direct.gguf | 0,95 GiB (967,89 MB) | 1,931 | 213,4 tok/s | 29,5 tok/s |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 2 GB para los pesos; con overhead de contexto y caché KV, entre 2 y 3 GB en la práctica (estimación, no publicada).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; el autor usó una Tesla V100-SXM2-16GB para la creación y el benchmarking.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3050, RTX 4060, RTX 4090 y equivalentes con 4 GB o más.
- CPU de referencia del autor: AMD Ryzen AI 9 HX 470 (12 núcleos / 24 hilos, AVX-512, AVX-VNNI, AVX-512 BF16) con 121 GiB DDR5.
- Opciones de despliegue: llama.cpp-miniQuant (fork fencerJP), llama-cli; compatibilidad con llama.cpp estándar, Ollama o vLLM no confirmada para esta receta.
- Latencia y throughput: 26,7-29,5 tok/s de decodificación y 80,7-213,4 tok/s de prefill en CPU según checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Licencia | Notas |
|---|---|---|---|---|---|
| Huihui-Qwen3.5-4B-abliterated-miniQuant (Recipe B) | 4,21B | no disponible | GGUF 0,95-1,05 GiB | Apache 2.0 | Cuantización sub-2 bpw, requiere llama.cpp-miniQuant |
| huihui-ai/Huihui-Qwen3.5-4B-abliterated | 4,21B | no disponible | Safetensors BF16 (~8,4 GB) | Apache 2.0 | Modelo base sin cuantizar; calidad de referencia |
| Cuantización GGUF estándar Q4_K_M de un 4B | ~4B | no disponible | GGUF ~2,5 GB | según modelo base | Calidad típicamente superior a sub-2 bpw, mayor tamaño |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- La cuantización a 1,931-2,251 bpw degrada la calidad respecto al modelo base; el autor no publica evaluaciones de perplejidad ni de benchmarks estándar.
- El modelo base es "abliterated", lo que implica que se han atenuado los mecanismos de rechazo: mayor riesgo de generar contenido inapropiado o no alineado con políticas de seguridad.
- Riesgo de alucinación elevado, agravado por la cuantización extrema y por la falta de datos de entrenamiento publicados.
- Idiomas: solo inglés declarado; el rendimiento en castellano no está garantizado.
- Longitud de contexto: no documentada; no se debe asumir la ventana nativa de Qwen 3.5 sin verificación.
- Requiere el fork fencerJP/llama.cpp-miniQuant para cargar correctamente la receta; la compatibilidad con llama.cpp upstream, Ollama o vLLM no está confirmada.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base abliterated puede acarrear riesgos reputacionales y de cumplimiento en productos dirigidos al público.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria.
- La model card está fechada en 2026-11-13, fecha posterior a la creación de muchos de los modelos de referencia; verificar la vigencia de los enlaces.

## Enlaces

- Hugging Face: https://huggingface.co/f3nc3r/Huihui-Qwen3.5-4B-abliterated-miniQuant
- Modelo base: https://huggingface.co/huihui-ai/Huihui-Qwen3.5-4B-abliterated
- Motor de inferencia y cuantización: https://github.com/fencerJP/llama.cpp-miniQuant
