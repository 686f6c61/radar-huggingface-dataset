# M1n1A1/MiniAI-Quata2-4b-v0.3

## Resumen

MiniAI Quata2 4B v0.3 es un modelo de lenguaje compacto desarrollado por M1n1A1 (MiniAI, Belgrado) como una evolución del Quata2 4B v0.2, que a su vez deriva de Qwen3.5-4B mediante preentrenamiento continuado en serbio y un ajuste fino supervisado. La versión v0.3 incorpora una fase adicional de aprendizaje por refuerzo con GRPO sobre tareas verificables automáticamente: instrucciones con restricciones formales, matemáticas con respuesta exacta y código con tests unitarios. El objetivo declarado es mejorar el razonamiento, las matemáticas y el seguimiento de instrucciones manteniendo un tamaño que quepa en una GPU de 8 GB.

A pesar de la etiqueta "4b" en el nombre, el recuento real de parámetros en safetensors es de 5.174.964.736 (aproximadamente 5,17 mil millones), lo que conviene tener en cuenta al planificar el despliegue. El modelo está orientado a los idiomas inglés, serbio, croata y bosnio, e incluye modo de razonamiento (thinking), soporte de tool calling y un ajuste de personalidad específico para uso conversacional. Su licencia Apache 2.0 facilita la integración comercial.

La relevancia de esta versión radica en que el autor reporta empates con Qwen3.5-9B en varios benchmarks de habilidad (GSM8K, MATH-500, MMLU-Pro, GPQA Diamond, IFEval, BFCL) con la mitad de parámetros, y mejoras medibles frente a su versión anterior en GPQA Diamond (+11,1), IFEval (+6,7), MATH-500 (+4,0) y GSM8K (+3,8). No obstante, se trata de un modelo con cero descargas y cero likes en el momento de la ficha, sin validación externa independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3.5-4B; tag `qwen3_5`) |
| Parametros totales | 5.174.964.736 (~5,17 B, segun safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el modo thinking se evaluo con hasta 32k tokens |
| Tipos de cuantizacion | GGUF Q4_K_M disponible; safetensors en FP16/BF16 (repo de 13,4 GB) |
| Idiomas soportados | en, sr, hr, bs |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only heredado de Qwen3.5-4B. El pipeline de entrenamiento consta de tres fases documentadas: (1) preentrenamiento continuado en serbio sobre Qwen3.5-4B, seguido de un ajuste fino con aproximadamente 31.000 ejemplos y una mezcla 80/20 con el modelo base original, dando lugar a v0.2; (2) construcción de 8.000 tareas con respuestas verificables por programa (restricciones de instrucciones como recuento de palabras, formato, mayúsculas o caracteres prohibidos; matemáticas con respuesta final conocida; código con tests unitarios), decontaminadas contra los conjuntos de evaluación mediante solapamiento de 13-gramas con IFEval, GSM8K, MMLU, HumanEval, MBPP, MATH-500 y AIME; (3) filtrado de prompts: v0.2 respondió cada prompt cuatro veces y se conservaron los 817 donde las respuestas obtuvieron puntuaciones distintas, descartando los que siempre se aciertan o siempre se fallan.

La fase de RL usa GRPO durante 600 pasos, con 2 prompts × 8 respuestas por paso, LoRA de rango 32, learning rate 2e-5, thinking desactivado y respuestas de hasta 640 tokens. Cada respuesta se puntúa mediante el verificador correspondiente (regla, respuesta exacta o tests superados); las respuestas truncadas por el límite de longitud no puntúan. El entrenamiento completo se realizó en aproximadamente 6 horas sobre una única RTX 4060 Ti de 8 GB, y el adaptador LoRA se fusionó en los pesos completos. No se documentan innovaciones arquitectónicas propias más allá del pipeline de RL y el ajuste de personalidad.

## Capacidades

- Generación de texto conversacional multi-turno en inglés, serbio, croata y bosnio.
- Razonamiento con modo thinking explícito (hasta 32k tokens evaluados), con puntuaciones superiores en GPQA Diamond y MMLU-Pro al activarlo.
- Matemáticas: resolución de problemas con respuesta final verificable (GSM8K, MATH-500).
- Código: generación y resolución de tareas con tests unitarios (HumanEval+, MBPP+).
- Tool calling / function calling, evaluado con BFCL (89,9 en thinking off).
- Tareas de agente multi-paso y uso real de herramientas (según las comprobaciones propias del autor).
- Seguimiento estricto de instrucciones con restricciones formales (recuento de palabras, formato, mayúsculas, caracteres prohibidos).
- Identidad de modelo consistente: se identifica como Quata2 sin system prompt (100%) y mantiene personas de cliente (100%).
- Capacidad de sostener una respuesta correcta bajo presión del usuario (90%) y de corregir errores reales cuando se le plantea (87,5%).
- Capacidad image-text-to-text declarada en los tags de Hugging Face (pipeline `image-text-to-text`), aunque no se detalla en la model card.

## Casos de uso

- Atención al cliente automatizada en serbio, croata o bosnio: el modelo mantiene personas de cliente (100% en las pruebas del autor) y conversaciones multi-turno, lo que permite desplegar agentes de soporte en estos idiomas con un coste de inferencia bajo en una GPU de 8 GB.
- Asistente de razonamiento matemático en entornos educativos: con modo thinking alcanza 87,0 en GSM8K y 71,2 en GPQA Diamond, adecuado para tutoría de problemas con respuesta verificable y explicación del razonamiento.
- Generación de código en pipelines de CI/CD: soporta tool calling y resuelve tareas con tests unitarios (HumanEval+ 79,3, MBPP+ 67,7), por lo que puede integrarse como generador de parches o de tests en flujos automatizados.
- Agentes de automatización con herramientas: las comprobaciones propias reportan 81,5% de tareas reales de agente resueltas y 72,5% en tareas multi-paso, útil para orquestación de APIs y flujos de trabajo con function calling.
- Procesamiento de documentos con instrucciones estrictas: IFEval estricto de 85,5 permite usarlo para extracción o transformación de texto con restricciones de formato, recuento y casing en producción.
- Despliegue en hardware de consumo: con GGUF Q4_K_M ocupa aproximadamente 2,8 GB, por lo que cabe en GPUs de 8 GB (RTX 4060 Ti, RTX 3070, etc.) y en portátiles con GPU discreta, facilitando prototipado local y aplicaciones de borde.
- Localización de contenido para el mercado balcánico: al cubrir en, sr, hr y bs con 87,8 en Belebele Serbian, sirve para traducción y adaptación de contenido entre variedades del serbocroata.

## Benchmarks y rendimiento

Resultados reportados por el autor con thinking off, Q4_K_M GGUF en llama.cpp, sin system prompt. Las marcas ✅/❌ indican diferencias reales frente a v0.2 (más de 2 errores estándar, emparejadas sobre las mismas preguntas).

| Benchmark | Quata2 4B v0.3 | Quata2 4B v0.2 | Qwen3.5 4B | Qwen3 4B 2507 | Gemma 4 E4B | Qwen3.5 9B |
|---|---:|---:|---:|---:|---:|---:|
| MMLU | 71,8 | **73,0** | 70,6 | 64,6 | 65,0 | 80,0 |
| MMLU-Pro | **71,3** | 68,7 | **71,3** | 66,3 | 66,0 | 72,3 |
| GPQA Diamond ✅ | **51,0** | 39,9 | 37,4 | 29,3 | 40,4 | 49,5 |
| ARC-Challenge | **92,6** | 91,6 | 92,4 | 92,0 | 89,2 | 95,0 |
| HellaSwag | **86,4** | 86,0 | 86,0 | 84,6 | 80,6 | 92,4 |
| TruthfulQA (MC1) | 70,2 | 71,0 | **73,0** | 67,0 | 66,2 | 77,6 |
| GSM8K ✅ | **89,4** | 85,6 | 86,6 | 88,8 | 86,4 | 89,6 |
| MATH-500 ✅ | **83,4** | 79,4 | 80,2 | 77,2 | 77,2 | 83,6 |
| IFEval (strict) ✅ | **85,5** | 78,8 | 82,3 | 83,6 | 84,7 | 83,8 |
| BFCL tool calling | 89,9 | 88,7 | 85,2 | **91,7** | 89,9 | 88,6 |
| HumanEval+ | 79,3 | 77,4 | 75,6 | 84,8 | **85,4** | 86,6 |
| MBPP+ | **67,7** | 66,9 | 64,8 | 63,0 | 67,5 | 63,5 |
| Belebele Serbian | **87,8** | 86,6 | 84,6 | 84,2 | 86,8 | 90,2 |
| Global-MMLU Serbian | 58,6 | **60,0** | 58,4 | 50,0 | 51,8 | 67,0 |
| Serbian LLM Eval (generative) | 77,4 | 76,8 | **78,2** | 73,9 | 75,9 | 82,4 |
| **Media** | **77,5** | 75,4 | 75,1 | — | — | 80,1 |

Modo thinking (hasta 32k tokens, sampling 0,6 / 0,95 / 20):

| Benchmark | v0.3 | v0.2 | Finalizadas en 32k (v0.3 / v0.2) |
|---|---:|---:|---:|
| GSM8K | **87,0** | 85,0 | 100% / 100% |
| MMLU-Pro | 80,5 | **81,0** | 100% / 98% |
| GPQA Diamond ✅ | **71,2** | 62,6 | 98% / 88% |

MATH-500, SuperGPQA, BIG-Bench Hard y AIME en modo thinking no se han reevaluado para v0.3 (valores de v0.2: 95,0 / 47,0 / 86,7 / 51,7).

## Requisitos de hardware

- VRAM estimada: aproximadamente 2,8 GB con GGUF Q4_K_M; el repo safetensors completo ocupa 13,4 GB (FP16/BF16, requiere ~11-13 GB de VRAM o descarga en CPU).
- GPU recomendadas para cuantización Q4_K_M: cualquier GPU con 8 GB o más (RTX 4060 Ti, RTX 3070, RTX 3060 Ti, RTX 4060). El propio autor entrenó con una RTX 4060 Ti de 8 GB.
- Cabe en GPU de consumo: sí, con Q4_K_M en GPUs de 8 GB; en FP16 requiere GPUs de gama alta (RTX 4090, A100, H100) o descarga parcial en CPU.
- Opciones de despliegue: llama.cpp (usado por el autor para los benchmarks), Ollama, vLLM, TGI y transformers. El tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face.
- Latencia y throughput: no disponibles en la información proporcionada. El tiempo de entrenamiento de la fase GRPO (600 pasos) fue de aproximadamente 6 horas en una RTX 4060 Ti 8 GB, dato que no equivale a throughput de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Media benchmarks | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| Quata2 4B v0.3 | ~5,17 B | no disponible | 77,5 | Apache 2.0 | Hugging Face (0 descargas) |
| Quata2 4B v0.2 | ~5,17 B (mismo base) | no disponible | 75,4 | Apache 2.0 | Hugging Face |
| Qwen3.5 4B | ~4 B | no disponible | 75,1 | no disponible en la información | Hugging Face |
| Qwen3.5 9B | ~9 B | no disponible | 80,1 | no disponible en la información | Hugging Face |
| Qwen3 4B 2507 | ~4 B | no disponible | no disponible (media no reportada) | no disponible en la información | Hugging Face |
| Gemma 4 E4B | ~4 B | no disponible | no disponible (media no reportada) | no disponible en la información | Hugging Face |

Frente a Qwen3.5-4B, el autor reporta 4 victorias reales (GPQA Diamond +13,6, BFCL +4,7, MATH-500 +3,2, Belebele Serbian +3,2) y 1 derrota real (TruthfulQA −2,8). Frente a Qwen3.5-9B, empata en GSM8K, MATH-500, MMLU-Pro, GPQA Diamond, IFEval y BFCL, pero el 9B sigue por delante en conocimiento (MMLU, TruthfulQA, HellaSwag, conocimiento en serbio) y HumanEval+.

## Limitaciones y advertencias

- Modelo con cero descargas y cero likes en el momento de la ficha: no hay validación independiente de los resultados; todas las cifras proceden del autor.
- El nombre "4b" no coincide con el recuento real de parámetros (~5,17 B), lo que puede afectar a estimaciones de VRAM y a comparaciones directas.
- Derrota real frente a Qwen3.5-4B en TruthfulQA (−2,8): mayor riesgo de respuestas plausibles pero falsas en preguntas de sentido común y veracidad.
- Caída en hechos sobre Serbia en las comprobaciones propias (50,0 frente a 75,0 en v0.2, con solo 8 ítems y sin significación estadística declarada) y en tareas de agente (81,5 frente a 85,4 en tareas reales; 72,5 frente a 78,4 en multi-paso), aunque el autor indica que estas diferencias no superan el ruido.
- En modo thinking, el 21% de las preguntas de GPQA se quedaron sin espacio con thinking off en v0.2; en v0.3 baja al 21% según el texto, aunque la tabla de thinking indica 98% finalizadas en 32k. Conviene verificar el comportamiento con límites de tokens ajustados.
- Cobertura lingüística limitada a en, sr, hr y bs; no hay datos de rendimiento en castellano ni en otros idiomas.
- El contexto máximo no está documentado en la información disponible; el modo thinking se evaluó hasta 32k tokens, pero no se confirma como longitud de contexto oficial.
- Sesgos conocidos: no documentados en la información proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de Qwen3.5-4B conviene revisar las condiciones de la licencia del modelo base original.
- Los benchmarks se ejecutaron con Q4_K_M en llama.cpp y sin system prompt; el rendimiento en FP16 o con otras plantillas de prompt puede diferir.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/M1n1A1/MiniAI-Quata2-4b-v0.3
- Modelo base (v0.2): https://huggingface.co/M1n1A1/MiniAI-Quata2-4b-v0.2
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
