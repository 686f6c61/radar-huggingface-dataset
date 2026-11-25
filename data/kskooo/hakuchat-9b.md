# KSKOOO/hakuchat-9b

## Resumen

HakuChat-9B es un modelo de lenguaje de 9.409.813.744 parámetros (aproximadamente 9,4 mil millones) desarrollado por el usuario KSKOOO y publicado en Hugging Face bajo licencia Apache-2.0. Está construido sobre una arquitectura propia denominada Haku (`HakuForConditionalGeneration`), que requiere cargar código personalizado mediante `trust_remote_code=True`. El modelo se presenta como un modelo nativo en chino con una longitud de contexto declarada de 262.144 tokens sin necesidad de RoPE scaling, y se distribuye en precisión bfloat16.

El modelo está orientado a generación de texto conversacional y, según los tags del repositorio, también a feature extraction. Su relevancia actual radica en su ventana de contexto extremadamente larga para un modelo de su tamaño y en el uso de una arquitectura no estándar con GQA de 4 cabezas KV, si bien el ecosistema de herramientas (vLLM, llama.cpp, Ollama) probablemente no lo soporte de forma nativa al requerir código propio.

La información pública disponible es limitada: el repositorio tiene 28 descargas y 0 likes, el tamaño del repo es de 18,8 GB y no se detallan los datos de entrenamiento ni la composición del dataset. La model card incluye resultados de benchmarks propios con un conjunto de 730 preguntas, así como una advertencia explícita sobre bucles de repetición en presupuestos de salida largos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Haku (transformer con atención, `HakuForConditionalGeneration`), código personalizado |
| Parametros totales | 9.409.813.744 (~9,4 B) |
| Parametros activos | no disponible (no es MoE según la informacion disponible) |
| Longitud de contexto | 262.144 tokens (sin RoPE scaling) |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | Chino (declarado en la model card y en los tags); otros idiomas no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 18,8 GB, precisión bfloat16) |

## Arquitectura y entrenamiento

La arquitectura es propietaria y se distribuye junto con los ficheros `modeling_haku.py` y `configuration_haku.py`, que `transformers` carga automáticamente con `trust_remote_code=True`. La model card indica que se trata de un transformer con atención por grupos (GQA) de 4 cabezas KV, pesos en bfloat16 y una ventana de contexto nativa de 262.144 tokens sin recurrir a RoPE scaling. No se especifica si incorpora innovaciones adicionales como atención lineal, decodificación especulativa o mecanismos híbridos SSM.

No hay información pública sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni el proceso de alineación. La model card únicamente describe el formato de carga, la plantilla de chat (`apply_chat_template` con `enable_thinking=False`) y la existencia de un modo de pensamiento desactivable, lo que sugiere algún tipo de entrenamiento orientado a razonamiento, aunque no se detalla.

## Capacidades

- Generación de texto conversacional multi-turno en chino, con plantilla de chat propia y soporte de rol de sistema/usuario/asistente.
- Ventana de contexto nativa de 262.144 tokens, adecuada para documentos largos sin técnicas de extensión de contexto.
- Modo de pensamiento (thinking) desactivable mediante el parámetro `enable_thinking` de la plantilla de chat.
- Feature extraction, según los tags del repositorio.
- Generación de código y matemáticas: los benchmarks reportados incluyen MATH-500 y AIME-2026, aunque con resultados bajos en el segundo.
- Seguimiento de instrucciones: evaluado con IFEval (72,50% en el mejor régimen reportado).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso más allá del modo thinking.
- No se documenta capacidad de visión, audio ni otras modalidades, pese a que el ejemplo de carga usa `AutoModelForImageTextToText`.

## Casos de uso

- Procesamiento de documentos largos en chino: con 262.144 tokens de contexto nativo, el modelo puede ingerir contratos, informes o expedientes completos sin fragmentación, lo que reduce la pérdida de contexto entre fragmentos.
- Asistencia conversacional en chino: la plantilla de chat y el soporte multi-turno permiten desplegar un asistente conversacional para atención al usuario en aplicaciones de dominio acotado.
- Extracción de características (feature extraction): los tags del repositorio indican uso como extractor de embeddings para tareas de recuperación o clasificación sobre texto chino.
- Generación de código asistida en entornos de desarrollo: el modelo se denomina "HakuChat-9B (Code)" y se evaluó con benchmarks de matemáticas, por lo que puede emplearse como asistente de programación en chino, aunque sin tool calling documentado.
- Experimentación e investigación sobre arquitecturas personalizadas: al requerir `trust_remote_code=True` y publicar los ficheros de modelado, es útil para estudiar implementaciones alternativas de atención con contexto largo.
- Evaluación comparativa de modelos pequeños en chino: sus resultados publicados en MMLU-Pro, IFEval, SciQ y CommonsenseQA permiten usarlo como referencia en estudios de modelos de ~9B en chino.
- Procesamiento por lotes offline: al no haber soporte documentado en servidores de inferencia de alto rendimiento, encaja mejor en pipelines offline con `transformers` y GPU única que en servicios de baja latencia.

## Benchmarks y rendimiento

Resultados publicados por el autor (730 preguntas, conjunto local `data2026`/`bench2026`):

| Benchmark | R11 @1k greedy | R11 @1k sample | R13 @8k sample | R14 @1k greedy |
|---|---|---|---|---|
| MMLU-Pro | 64,64% | 58,21% | 58,57% | 60,00% |
| AIME-2026 | 3,33% | 3,33% | 6,67% | 0,00% |
| MATH-500 | 53,00% | 45,00% | 32,00% | 42,00% |
| IFEval | 72,50% | 70,83% | 70,00% | 65,00% |
| SciQ | 93,00% | 95,00% | 91,00% | 93,00% |
| CommonsenseQA | 80,00% | 76,00% | 69,00% | 79,00% |
| Macro promedio | 61,08% | 58,06% | 54,54% | 56,50% |

Notas de la model card: el conjunto consta de MMLU-Pro (280 preguntas), AIME-2026 (30), MATH-500 (100), IFEval (120), SciQ (100) y CommonsenseQA (100). El régimen greedy usa un presupuesto de salida de 1.024 tokens; el régimen sample usa top_p 0,95 y top_k 20. El autor advierte que la línea base pública de MathArena para AIME 2026 es del 92,5% con un presupuesto de unos 31.184 tokens por pregunta, por lo que no es directamente comparable.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 18,8 GB solo para pesos, más KV cache; con 262.144 tokens de contexto y 4 cabezas KV, la caché puede crecer de forma significativa, por lo que se recomienda una GPU de 24 GB o más para contextos moderados y de 40-80 GB para contextos muy largos.
- GPU recomendadas: A100 40/80 GB o H100 para contexto largo; RTX 4090 (24 GB) o RTX 3090 (24 GB) para contexto corto en bfloat16.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con contexto limitado; en GPUs de 16 GB requeriría cuantización, que no está documentada oficialmente.
- Opciones de despliegue: `transformers` con `trust_remote_code=True`; no se documenta soporte en vLLM, TGI, llama.cpp ni Ollama, y la arquitectura personalizada probablemente impida su uso directo en esos servidores.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible. A modo orientativo de categoría (modelos densos de ~9B con contexto largo y licencia permisiva), podrían considerarse alternativas como Qwen2.5-7B/14B o Llama-3.1-8B, pero no se aportan aquí cifras comparativas porque no están en la información disponible.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| HakuChat-9B | ~9,4 B | 262.144 | Apache-2.0 | Hugging Face, requiere `trust_remote_code` |
| Alternativas de ~7-9B | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Arquitectura personalizada: requiere `trust_remote_code=True`, lo que implica ejecutar código del autor y complica la auditoría de seguridad y el despliegue en entornos regulados.
- Bucles de repetición en salidas largas: con presupuesto de 8k tokens, el modelo tiende a emitir la marca de rol `user` y continuar la conversación por sí mismo, sin terminar; el 4,5% de las preguntas alcanzó el límite de 8.192 tokens.
- Razonamiento matemático limitado: AIME-2026 entre el 0% y el 6,67% según régimen, muy por debajo de líneas base públicas.
- Caída de rendimiento con contexto largo y decodificación por muestreo: el propio autor indica que la decodificación por muestreo con más de 1k tokens de contexto degrada los resultados.
- No se documenta soporte de tool calling, agentes ni function calling.
- Idiomas: solo se declara chino; el rendimiento en castellano u otros idiomas no está evaluado.
- Sesgos: no se documentan evaluaciones de sesgo, toxicidad o seguridad.
- Riesgo de alucinación: no cuantificado; al ser un modelo pequeño y con benchmarks de conocimiento limitados (MMLU-Pro ~60-65%), es esperable una tasa de error factual apreciable.
- Licencia Apache-2.0: permite uso comercial, pero el código personalizado y la ausencia de auditoría de seguridad deben tenerse en cuenta en producción.
- Ecosistema: sin soporte documentado en servidores de inferencia de alto rendimiento, lo que limita el throughput en producción.

## Enlaces

- Hugging Face: https://huggingface.co/KSKOOO/hakuchat-9b
