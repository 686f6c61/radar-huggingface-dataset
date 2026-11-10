# ironbcc/Thinklite-27B-NVFP4

## Resumen

Thinklite-27B-NVFP4 es una cuantización NVFP4/FP8 del modelo multimodal Sparset/Thinklite-27B, publicada por el usuario ironbcc. Thinklite-27B es a su vez un derivado de Qwen3.8-27B orientado a razonamiento eficiente: según la model card del modelo original, reduce el consumo de tokens de razonamiento un 47% de media en seis benchmarks a `reasoning_effort="xhigh"` manteniendo el 99,6% de la precisión del modelo base (89,8 frente a 90,2). Esta build cuantizada busca preservar ese comportamiento con un coste de memoria y cómputo mucho menor, empleando NVFP4 en la mayoría de proyecciones MLP y FP8 en atención y en determinadas proyecciones MLP posteriores.

El pipeline declarado es `image-text-to-text`, por lo que el modelo conserva la torre de visión del original (mantenida en mayor precisión tras la cuantización) y acepta entradas de imagen y texto. La arquitectura subyacente es la familia Qwen3.5 (`qwen3_5` en los tags), con 20.294.595.344 parámetros reales según los pesos en safetensors, pese a la denominación comercial "27B".

La relevancia de esta ficha radica en que documenta una cuantización de precisión mixta (NVFP4 + FP8) con evaluación pareada frente al BF16 original en GSM8K, MMLU-Pro e IFEval, lo que permite estimar la degradación introducida por la cuantización con datos concretos en lugar de estimaciones. La licencia es Apache-2.0 y el formato de pesos es safetensors con `compressed-tensors`, compatible con transformers y con despliegue en vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3.5 (`qwen3_5`), multimodal image-text-to-text |
| Parametros totales | 20.294.595.344 (según safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la información proporcionada (la evaluación usó 10.240 tokens de contexto) |
| Tipos de cuantizacion | NVFP4 en la mayoría de proyecciones MLP; FP8 en atención y proyecciones MLP posteriores seleccionadas; torre de visión en mayor precisión; KV cache en FP8 calibrado |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con `compressed-tensors` |
| Modelo base | Sparset/Thinklite-27B (revisión `2aa81615c583852cd561164946f1a458ed21b13f`) |
| Metodo de cuantizacion | LLM Compressor, receta AWQ + GPTQ (Qwen3.8), calibración con 512 muestras de texto de `mlabonne/open-perfectblend`, máximo 4.096 tokens |
| Tamano del repositorio | 23,4 GB |

## Arquitectura y entrenamiento

El modelo es una cuantización, no un entrenamiento desde cero. Parte del checkpoint BF16 de Sparset/Thinklite-27B, que a su vez deriva de Qwen3.8-27B con un proceso de destilación o ajuste orientado a reducir la longitud de las cadenas de razonamiento (la model card original habla de "piensa con la mitad de tokens" conservando el 99,6% de la precisión). La arquitectura es un transformer multimodal de la familia Qwen3.5 con torre de visión y pipeline `image-text-to-text`.

La cuantización se realizó con LLM Compressor aplicando una receta combinada AWQ + GPTQ sobre 512 muestras de texto del dataset `mlabonne/open-perfectblend` con longitud máxima de 4.096 tokens. La asignación de precisión es mixta: NVFP4 para la mayoría de proyecciones MLP, FP8 para atención y para ciertas proyecciones MLP posteriores, torre de visión en mayor precisión y KV cache en FP8 calibrado. La calibración fue exclusivamente de texto, lo que la propia model card señala como limitación para extrapolar la precisión multimodal. El autor verificó que ninguna de las 512 muestras de calibración coincidía exactamente (tras normalización) con los ítems de evaluación de GSM8K, MMLU-Pro e IFEval, aunque advierte que esto no descarta paráfrasis ni solapamiento en el entrenamiento previo.

## Capacidades

- Generación de texto y razonamiento multi-paso con modo "thinking" explícito, controlable mediante `reasoning_effort` (el original documenta los niveles `low` y `xhigh`).
- Razonamiento matemático: 96,21% en el test completo de GSM8K (1.269/1.319) con thinking activado.
- Comprensión multimodal image-text-to-text: acepta imágenes y texto como entrada gracias a la torre de visión preservada en mayor precisión.
- Seguimiento de instrucciones: 89,65% prompt-level strict en IFEval (485/541).
- Conocimiento general y razonamiento académico: 64,80% en MMLU-Pro (648/1.000 sobre subconjunto estratificado de 1.000 preguntas).
- Conversacional multi-turno (tag `conversational`).
- Compatibilidad declarada con endpoints (`endpoints_compatible`).
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente: no disponible en la información proporcionada.
- Cobertura multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Razonamiento matemático en producción con coste reducido: el modelo resuelve problemas tipo GSM8K con un 96,21% de acierto en la build NVFP4, apenas 0,45 puntos por debajo del BF16, lo que permite desplegarlo en tareas de verificación aritmética, tutoring o generación de soluciones paso a paso con menor huella de memoria.
- Asistentes con cadenas de razonamiento largas: al heredar el comportamiento "thinklite" del modelo base, que según su card reduce un 47% los tokens de razonamiento a `xhigh`, resulta adecuado para pipelines donde la latencia hasta la respuesta final (TTFO) es crítica, como agentes de soporte técnico o análisis de documentos.
- Procesamiento de documentos con imágenes: el pipeline image-text-to-text permite extraer información de capturas, formularios escaneados o gráficos combinándolos con instrucciones textuales, usando la torre de visión en mayor precisión.
- Evaluación de instrucciones estrictas: con un 89,65% en IFEval prompt-strict, es apto para tareas que exigen cumplir restricciones de formato, longitud o contenido, como generación de informes estructurados o validación de respuestas.
- Despliegue en infraestructura con VRAM limitada: al ocupar 23,4 GB el repositorio y usar NVFP4/FP8, puede servirse en una sola GPU Blackwell profesional (el autor validó con una RTX PRO 6000) en lugar de requerir múltiples aceleradores para el BF16.
- Razonamiento académico y QA de conocimiento: con 64,80% en MMLU-Pro, sirve para asistentes de estudio, clasificación de preguntas de opción múltiple o generación de material educativo en dominios STEM y humanidades.
- Integración en stacks transformers/vLLM: al publicarse en safetensors con `compressed-tensors` y validarse en vLLM 0.30, encaja en servicios de inferencia existentes basados en esas herramientas sin conversiones adicionales.

## Benchmarks y rendimiento

Datos de evaluación pareada publicados por el autor de la cuantización (vLLM 0.30, una RTX PRO 6000 Blackwell, thinking activado con `reasoning_effort=xhigh`, temperature 1.0, top_p 0.95, top_k 20, KV cache FP8, una muestra por ítem, 8.192 tokens de salida y 10.240 de contexto):

| Benchmark | Thinklite-27B BF16 | Thinklite-27B-NVFP4 | Delta (p.p.) |
|---|---:|---:|---:|
| GSM8K (test completo, 1.319) | 96,66% (1.275/1.319) | 96,21% (1.269/1.319) | -0,45 |
| MMLU-Pro (estratificado, 1.000) | 64,20% (642/1.000) | 64,80% (648/1.000) | +0,60 |
| IFEval (prompt-level strict, 541) | 88,91% (481/541) | 89,65% (485/541) | +0,74 |

El autor indica que este protocolo no reproduce la evaluación multi-benchmark de NVIDIA ni las reglas de recorte y repetición de la model card original. No se publican en la información disponible resultados de benchmarks del modelo original Thinklite-27B frente a Qwen3.8-27B más allá de las afirmaciones agregadas de la card (89,8 frente a 90,2 de media en seis benchmarks, 47% menos razonamiento a `xhigh`).

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 23,4 GB en safetensors; con overhead de runtime y KV cache FP8 conviene prever al menos 28-32 GB de VRAM para contexto moderado. No disponible una cifra oficial del autor.
- GPU validadas por el autor: una RTX PRO 6000 Blackwell (usada para todas las evaluaciones).
- GPU recomendadas: por el uso de NVFP4, se requiere hardware Blackwell (RTX PRO 6000, B200, GB200) para aprovechar el formato de 4 bits nativo; en GPUs Ampere/Hopper el soporte de NVFP4 es limitado o emulado y el rendimiento esperado sería inferior.
- ¿Cabe en consumer GPU? No disponible de forma confirmada; por tamaño (23,4 GB) quedaría al límite o fuera de GPUs consumer de 24 GB como la RTX 4090, y no encajaría en tarjetas de 16 GB o menos.
- Opciones de despliegue: vLLM 0.30 (validado por el autor), transformers con `compressed-tensors`. No se menciona soporte de llama.cpp, Ollama ni TGI para esta build NVFP4; para esos runtimes existe la variante oficial Thinklite-27B-GGUF (16,5 GB Q4_K_M).
- Latencia y throughput: no disponibles cifras concretas; la model card original afirma un TTFO aproximadamente 2 veces menor que Qwen3.8-27B gracias a la reducción de tokens de razonamiento, pero esa afirmación corresponde al modelo original, no a esta cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | GSM8K | MMLU-Pro | IFEval (strict) | Licencia | Formato |
|---|---|---:|---:|---:|---:|---|---|
| Thinklite-27B-NVFP4 (esta build) | 20,29B | no disponible | 96,21% | 64,80% | 89,65% | Apache-2.0 | safetensors (compressed-tensors) |
| Sparset/Thinklite-27B (BF16) | no disponible | no disponible | 96,66% | 64,20% | 88,91% | Apache-2.0 | safetensors BF16 |
| Sparset/Thinklite-27B-GGUF (Q4_K_M) | no disponible | no disponible | no disponible | no disponible | no disponible | Apache-2.0 | GGUF (16,5 GB) |
| Qwen3.8-27B (modelo base de referencia) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa con Qwen3.8-27B solo puede hacerse de forma agregada según la card original: Thinklite-27B obtiene 89,8 de media frente a 90,2 del base en seis benchmarks, con un 47% menos de tokens de razonamiento a `xhigh`. No se dispone de resultados por benchmark del base en la información proporcionada.

## Limitaciones y advertencias

- La calibración de la cuantización fue exclusivamente de texto (512 muestras de `mlabonne/open-perfectblend`); el autor advierte explícitamente que un único benchmark no establece la precisión global ni la precisión en imagen, por lo que el rendimiento multimodal puede degradarse respecto al BF16.
- Los resultados de GSM8K, MMLU-Pro e IFEval usan un protocolo propio (prompts, recorte a 8.192 tokens, grader específico) que no reproduce la evaluación de NVIDIA ni la de la model card original; no son directamente comparables con cifras publicadas por terceros.
- Las comprobaciones de solapamiento entre calibración y evaluación solo descartan coincidencias exactas normalizadas; no descartan paráfrasis ni contaminación procedente del entrenamiento previo.
- Riesgo de alucinación: no cuantificado en la información disponible; como modelo generativo con modo thinking, puede producir cadenas de razonamiento plausibles pero incorrectas, especialmente fuera de dominios STEM.
- Idiomas soportados no declarados: no hay garantía documentada de calidad multilingüe más allá de lo heredado de Qwen3.8.
- Longitud de contexto oficial no disponible; la evaluación se realizó con 10.240 tokens, lo que no confirma el máximo soportado.
- Requiere hardware Blackwell para aprovechar NVFP4; en GPUs anteriores el formato puede no estar soportado de forma nativa.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base y de los datasets de calibración citados.
- El modelo tiene un volumen de adopción muy bajo (43 descargas, 1 like en el momento de la consulta), por lo que no hay validación independiente de los resultados reportados por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ironbcc/Thinklite-27B-NVFP4
- Modelo base: https://huggingface.co/Sparset/Thinklite-27B
- Variante GGUF oficial: https://huggingface.co/Sparset/Thinklite-27B-GGUF
- Dataset de calibración: https://huggingface.co/datasets/mlabonne/open-perfectblend
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Dataset MMLU-Pro: https://huggingface.co/datasets/TIGER-Lab/MMLU-Pro
- Grader oficial de IFEval: https://github.com/google-research/google-research/tree/0eebfd403ba438bfd14cb70b9b24a7745c997083/instruction_following_eval
- LLM Compressor: https://github.com/vllm-project/llm-compressor
- vLLM: https://github.com/vllm-project/vllm
