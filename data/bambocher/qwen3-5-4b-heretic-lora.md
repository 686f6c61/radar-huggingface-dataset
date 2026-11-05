# bambocher/Qwen3.5-4B-heretic-LoRA

## Resumen

Qwen3.5-4B-heretic-LoRA es una adaptación del modelo multimodal Qwen3.5-4B de Alibaba Qwen, publicada por el usuario bambocher. Se trata de un ajuste fino tipo LoRA generado con la herramienta Heretic v2.0.0, cuyo objetivo es eliminar los mecanismos de rechazo (refusals) del modelo original mediante una técnica de ablación de rangos arbitrarios (Arbitrary-Rank Ablation, ARA) aplicada sobre las capas 2 a 21 del transformer. El resultado es un modelo "decensored" o "abliterated" que responde a peticiones que el modelo base rechazaría.

El modelo hereda la arquitectura híbrida de Qwen3.5-4B: 4 000 millones de parámetros, 32 capas con un diseño que alterna Gated DeltaNet (atención lineal) y Gated Attention (atención completa con GQA), junto con un codificador visual para tareas image-text-to-text. El contexto nativo es de 262 144 tokens, extensible hasta 1 010 000, y el modelo está entrenado para soportar 201 idiomas y dialectos según la documentación del modelo base.

La relevancia de esta ficha radica en que documenta una modificación de seguridad sobre un modelo multimodal pequeño y de contexto muy largo, con parámetros de ablación reproducibles y métricas declaradas de reducción de rechazos (de 99/100 a 0/100) a costa de una divergencia KL de 0,0477 respecto al original. Es un caso de estudio útil para quienes evalúan los compromisos entre alineación, utilidad y fidelidad al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido con codificador de visión; layout 8 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)) |
| Parametros totales | 4B (modelo base Qwen3.5-4B) |
| Parametros activos | no disponible (no se indica configuración MoE para esta variante; el modelo base se describe con FFN densa de dimensión intermedia 9216) |
| Longitud de contexto | 262 144 tokens nativos; extensible hasta 1 010 000 tokens |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; no se listan cuantizaciones publicadas) |
| Idiomas soportados | 201 idiomas y dialectos según el modelo base; no se detalla lista específica para esta variante |
| Licencia | apache-2.0 (heredada del modelo base) |
| Formato de pesos | safetensors (librería transformers); repo de 0,1 GB, compatible con vLLM, SGLang y KTransformers según el modelo base |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-4B emplea una arquitectura híbrida que combina capas de Gated DeltaNet (atención lineal con 32 cabezas para V y 16 para QK, dimensión de cabeza 128) y capas de Gated Attention (16 cabezas para Q y 4 para KV, dimensión 256, RoPE de 64 dimensiones). La dimensión oculta es 2560, el embedding de tokens es de 248 320 entradas (con padding) y la salida LM está atada al embedding. Incluye un codificador visual para entrada image-text-to-text y se entrenó con multi-token prediction (MTP) en varios pasos. El modelo base se preentrenó y postentrenó con RL a gran escala (entornos de millones de agentes) y fusión temprana de tokens multimodales.

La modificación heretic-LoRA aplica una ablación de rangos arbitrarios (ARA) sobre las capas 2 a 21 con los siguientes hiperparámetros declarados: `preserve_good_behavior_weight` 0,2499, `steer_bad_behavior_weight` 0,0001, `overcorrect_relative_weight` 0,9956 y `neighbor_count` 14. El autor indica que el proceso es reproducible y publica instrucciones en el directorio `reproduce/` del repositorio. No se especifican en la información disponible el volumen de tokens de entrenamiento del LoRA, la composición del dataset de ablación ni si se aplicó DPO o RLHF adicional sobre esta variante.

## Capacidades

- Generación de texto y razonamiento multimodal: el pipeline declarado es image-text-to-text, por lo que acepta imágenes y texto como entrada.
- Razonamiento, código y matemáticas: heredados del modelo base Qwen3.5-4B, que según su documentación iguala o supera a Qwen3-VL en benchmarks de razonamiento, código, agentes y comprensión visual.
- Soporte multilingüe amplio: 201 idiomas y dialectos según el modelo base.
- Contexto largo: ventana nativa de 262 144 tokens, extensible a 1 010 000, adecuada para documentos extensos y conversaciones multi-turno largas.
- Respuesta sin rechazos: la modificación heretic reduce los rechazos declarados de 99/100 a 0/100 en la evaluación del autor.
- Compatibilidad de despliegue: el modelo base es compatible con Hugging Face Transformers, vLLM, SGLang y KTransformers.
- Tool calling y agentes: no se detalla explícitamente en la información proporcionada para esta variante; el modelo base se describe con capacidades de agentes y entornos multiagente.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar el efecto de la ablación ARA comparando respuestas con el Qwen3.5-4B original, con parámetros reproducibles y una métrica declarada de divergencia KL de 0,0477.
- Procesamiento de documentos largos con imágenes: gracias a los 262 144 tokens de contexto nativo y al codificador visual, se puede usar para extraer información de informes, contratos o papers con figuras y tablas.
- Generación de código en pipelines internos: el modelo hereda las capacidades de código del base y puede integrarse vía vLLM o SGLang para autocompletado y revisión en entornos controlados donde no se requieran filtros de contenido.
- Análisis de contenido sensible para moderación: al no rechazar peticiones, puede emplearse como clasificador o generador de ejemplos en sistemas de moderación que necesitan procesar texto explícito sin bloqueos.
- Asistentes conversacionales de dominio específico: con contexto largo y multilingüismo, es adecuado para atención al cliente o soporte técnico en varios idiomas, siempre que se añada una capa de política externa.
- Experimentación con modelos multimodales pequeños: 4B parámetros y formato safetensors facilitan pruebas en una sola GPU, útil para prototipos de visión-lenguaje y evaluación de técnicas de decensurado.
- Reproducción de experimentos de ablación: el directorio `reproduce/` permite replicar el proceso Heretic y validar la metodología ARA en otros modelos.

## Benchmarks y rendimiento

El autor publica métricas de la modificación, no benchmarks estándar de capacidad:

| Metrica | Este modelo | Qwen3.5-4B original |
|---|---|---|
| Rechazos (sobre 100) | 0/100 | 99/100 |
| Divergencia KL | 0,0477 | 0 (por definición) |

El modelo base Qwen3.5-4B aparece en la tabla comparativa de la documentación de Qwen con resultados parciales en la información disponible (por ejemplo, MMLU-Pro). No se han publicado en la información proporcionada resultados completos de benchmarks (HumanEval, GSM8K, etc.) para esta variante heretic-LoRA.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de 4B en fp16 se estiman aproximadamente 8-9 GB de pesos, y en cuantización de 4 bits alrededor de 2,5-3 GB, sin contar caché KV para contexto largo.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabría en RTX 4090, RTX 3090, A100 y H100; el contexto de 262 144 tokens exige gran cantidad de VRAM para caché KV.
- Cabe en GPU de consumo: sí, previsiblemente en GPUs con 8 GB o más en cuantización baja, aunque el contexto largo limita el uso práctico.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang y KTransformers (según el modelo base); llama.cpp u Ollama no se mencionan en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| bambocher/Qwen3.5-4B-heretic-LoRA | 4B | 262 144 (ext. 1 010 000) | apache-2.0 | Variante decensored con ARA; 0/100 rechazos declarados |
| Qwen/Qwen3.5-4B | 4B | 262 144 (ext. 1 010 000) | apache-2.0 | Modelo base alineado; 99/100 rechazos declarados |
| Qwen3.5-9B | 9B | no disponible en la información | no disponible | Alternativa mayor de la misma familia |
| GPT-OSS-20B | 20B | no disponible en la información | no disponible | Comparable en benchmarks del modelo base, mayor tamaño |

No se dispone de datos de benchmarks de capacidad para esta variante que permitan una comparación cuantitativa con las alternativas.

## Limitaciones y advertencias

- La eliminación de rechazos implica que el modelo puede generar contenido dañino, ilegal o explícito; no es apto para despliegues públicos sin filtros externos.
- La divergencia KL de 0,0477 respecto al original indica que el comportamiento general se ha alterado; puede degradar la calidad en tareas que dependían de la alineación original.
- No se han publicado evaluaciones independientes de sesgos, alucinación o robustez para esta variante.
- El repositorio tiene 0 descargas y 0 likes en el momento de la ficha; no hay evidencia de uso en producción ni validación comunitaria.
- Aunque la licencia declarada es apache-2.0, el uso comercial de un modelo decensored puede incumplir políticas de plataformas y normativas locales sobre contenido.
- El contexto largo de 262 144 tokens requiere mucha memoria para caché KV; el rendimiento real en contextos extremos no está documentado.
- No se detalla el soporte de tool calling ni de agentes específicamente para esta variante.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bambocher/Qwen3.5-4B-heretic-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Heretic: https://heretic-project.org
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
