# DavidAU/Qwen3.5-9B-Claude-4.6-HighIQ-THINKING

## Resumen

Qwen3.5-9B-Claude-4.6-HighIQ-THINKING es un fine-tune del modelo denso Qwen3.5-9B desarrollado por DavidAU, un creador independiente de modelos en Hugging Face. El ajuste se realizó con Unsloth sobre hardware local usando un dataset de destilación de razonamiento derivado de Claude 4.6, con el objetivo declarado de sustituir el estilo de "thinking" nativo de Qwen 3.5 por uno más próximo al de Claude 4.6, mejorando la generación de cadenas de razonamiento sin degradar los benchmarks originales del modelo base.

El modelo base Qwen3.5-9B es un transformer causal multimodal con codificador de visión, arquitectura híbrida (Gated DeltaNet de atención lineal combinada con atención con compuertas) y 32 capas. Cuenta con 9.409.813.744 parámetros reales según safetensors, dimensión oculta de 4096, FFN de 12288 y un contexto nativo de 262.144 tokens extensible hasta 1.010.000. El fine-tune conserva esa arquitectura y añade capacidades reforzadas de escritura creativa, ficción, roleplaying y razonamiento explícito.

Es relevante para quienes buscan un modelo de 9B con ventana de contexto muy amplia, capacidad de visión y modo de razonamiento estilo Claude, bajo licencia Apache 2.0 y desplegable en hardware de consumo con cuantización adecuada. El autor publica además una variante instruct con el mismo entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido (Gated DeltaNet + Gated Attention) con codificador de visión |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 |
| Tipos de cuantizacion | bfloat16 en el repo; el autor recomienda mínimo q4_k_s (no imatrix) o IQ3S (imatrix) |
| Idiomas soportados | en, zh (etiquetados); el modelo base declara soporte para 201 idiomas y dialectos |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); compatible con vLLM, SGLang, KTransformers |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3.5-9B: 32 capas con un layout híbrido de 8 bloques compuestos por 3 subcapas de Gated DeltaNet (atención lineal con 32 cabezas para V y 16 para QK, dimensión de cabeza 128) seguidas de 1 subcapa de Gated Attention (16 cabezas Q, 4 KV, dimensión 256, RoPE de 64). El FFN tiene dimensión intermedia de 12288, con embeddings y salida de 248.320 tokens (padded). Incluye MTP (multi-token prediction) entrenado con múltiples pasos y un codificador de visión para entrada image-text-to-text.

El fine-tune se realizó con Unsloth sobre el modelo base usando un dataset de destilación de Claude 4.6 de gran tamaño, en hardware local. El autor declara haber buscado un entrenamiento "suave" para preservar los benchmarks del base, y confirma que la visión funciona tras el ajuste (aunque las porciones de vídeo no se probaron). No se especifican en la información disponible el número de tokens de entrenamiento del fine-tune, la composición exacta del dataset de destilación ni si hubo etapas de RLHF o DPO adicionales.

## Capacidades

- Generación de texto y razonamiento explícito en modo "thinking" con estilo de cadena de pensamiento reforzado.
- Escritura creativa y de ficción: relatos, tramas, subtramas, continuación de escenas y prosa vívida.
- Roleplaying y conversación multi-turno.
- Comprensión de imágenes (image-text-to-text), verificada tras el fine-tune.
- Capacidades de código, matemáticas y agentes heredadas del modelo base Qwen3.5-9B.
- Soporte multilingüe: etiquetado en inglés y chino; el base declara 201 idiomas y dialectos.
- Compatibilidad con tool calling y function calling heredada del base (no se detalla en la información del fine-tune).
- Integración con transformers, vLLM, SGLang y KTransformers.

## Casos de uso

- Generación de ficción y relatos largos: el modelo puede mantener coherencia narrativa en textos extensos gracias a su contexto de 262.144 tokens, útil para novelas por entregas o sagas con continuidad de personajes y tramas.
- Roleplaying y asistentes de personaje: el entrenamiento orientado a ficción y prosa vívida lo hace adecuado para chatbots de rol con memoria de conversación prolongada.
- Continuación de escenas y guiones: escritores pueden aportar un fragmento y pedir continuaciones coherentes con el tono y el estilo, aprovechando el modo thinking para planificar la escena.
- Razonamiento con trazas explícitas: en tareas de análisis o resolución de problemas donde se requiere auditar el proceso de pensamiento, el modo thinking estilo Claude facilita la inspección de la cadena de razonamiento.
- Procesamiento de documentos largos con imágenes: al combinar contexto de 262k y visión, puede resumir o extraer información de informes con gráficos o capturas.
- Asistente de escritura multilingüe (inglés/chino): para equipos que trabajan en ambos idiomas, con posible extensión a otros idiomas del base.
- Despliegue en hardware de consumo: con cuantización q4_k_s o IQ3S, puede ejecutarse en GPUs de gama alta para prototipos y uso personal.

## Benchmarks y rendimiento

Resultados publicados por el autor (evaluación mxfp8):

| Modelo | ARC | ARC/e | BoolQ | HSWAG | OBKQA | PIQA | Wino |
|---|---|---|---|---|---|---|---|
| Qwen3.5-9B-Claude-4.6-HighIQ-THINKING | 0,433 | 0,493 | 0,622 | 0,654 | 0,366 | 0,747 | 0,639 |
| Qwen3.5-9B-Claude-4.6-HighIQ-INSTRUCT | 0,574 | 0,729 | 0,882 | 0,711 | 0,422 | 0,775 | 0,691 |
| Qwen3.5-9B (thinking) | 0,417 | 0,458 | 0,623 | 0,634 | 0,338 | 0,737 | 0,639 |

El fine-tune thinking mejora ligeramente al base en ARC, ARC/e, HSWAG, OBKQA y PIQA, y empata en BoolQ y Wino. La variante instruct obtiene resultados notablemente superiores en esta batería. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni benchmarks específicos de visión o vídeo.

## Requisitos de hardware

- VRAM estimada: en bfloat16, aproximadamente 18,8 GB de pesos más overhead de activaciones y caché KV (el repo ocupa 18,8 GB); en q4_k_s, en torno a 5-6 GB de pesos; en IQ3S, algo menos.
- GPU recomendadas: A100 40/80 GB o H100 para contexto completo de 262k en bf16; RTX 4090 (24 GB) para bf16 con contexto moderado o cuantizaciones altas con contexto largo.
- Cabe en GPU de consumo: sí, con cuantización q4_k_s o IQ3S en GPUs de 8-12 GB para contextos moderados; el contexto de 262k exige más VRAM por la caché KV.
- Opciones de despliegue: transformers, vLLM, SGLang, KTransformers; el autor menciona compatibilidad con endpoints. No se confirma soporte de llama.cpp u Ollama en la información disponible, aunque las cuantizaciones GGUF sugeridas (q4_k_s, IQ3S) apuntan a ese ecosistema.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.5-9B-Claude-4.6-HighIQ-THINKING | 9,4B (denso) | 262.144 (ext. 1.010.000) | Apache 2.0 | Fine-tune de razonamiento y ficción sobre Qwen3.5-9B |
| Qwen3.5-9B (base) | 9B (denso) | 262.144 (ext. 1.010.000) | Apache 2.0 | Modelo original; benchmarks ligeramente inferiores en thinking |
| Qwen3.5-9B-Claude-4.6-HighIQ-INSTRUCT | 9,4B (denso) | 262.144 (ext. 1.010.000) | Apache 2.0 | Misma receta de entrenamiento, variante instruct; mejores resultados en la batería publicada |

No se dispone en la información proporcionada de comparaciones con modelos de otros fabricantes (por ejemplo, Llama o Mistral de tamaño similar) con datos verificables.

## Limitaciones y advertencias

- El autor advierte que el fine-tune es experimental y que hay otras versiones en pruebas; no se garantiza estabilidad en producción.
- Las porciones de vídeo del modelo no fueron probadas.
- El dataset de destilación proviene de Claude 4.6; deben revisarse las condiciones de uso de las salidas de ese modelo para usos comerciales, aunque la licencia del fine-tune sea Apache 2.0.
- Riesgo de alucinación inherente a modelos de 9B, especialmente en contextos muy largos y en tareas de razonamiento complejo.
- Los benchmarks publicados son una batería reducida (ARC, BoolQ, HSWAG, OBKQA, PIQA, Wino); no hay datos de MMLU, HumanEval ni GSM8K que permitan evaluar código y matemáticas.
- Idiomas etiquetados limitados a inglés y chino; el soporte multilingüe amplio del base no está verificado tras el fine-tune.
- El modo thinking puede aumentar la latencia y el consumo de tokens; el autor recomienda rep pen de 1 (desactivado).
- El modelo está orientado a ficción y creatividad; su uso para tareas factuales críticas requiere validación adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DavidAU/Qwen3.5-9B-Claude-4.6-HighIQ-THINKING
- Variante instruct: https://huggingface.co/DavidAU/Qwen3.5-9B-Claude-4.6-HighIQ-INSTRUCT
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Perfil del autor: https://huggingface.co/DavidAU
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
