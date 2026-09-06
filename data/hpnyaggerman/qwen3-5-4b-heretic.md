# hpnyaggerman/Qwen3.5-4B-heretic

## Resumen

Qwen3.5-4B-heretic es una versión "decensored" del modelo base Qwen/Qwen3.5-4B-Base, creada por hpnyaggerman mediante la herramienta Heretic v2.0.0.dev0, un proyecto de abliteración que modifica los pesos del modelo para eliminar restricciones de comportamiento. El modelo resultante mantiene la arquitectura y las capacidades del original, pero con una divergencia KL de 0.0008 respecto al base, lo que indica que los cambios son mínimos.

El modelo base es un sistema multimodal (image-text-to-text) de 4.539 millones de parámetros, con una arquitectura híbrida que combina capas de atención lineal Gated DeltaNet con capas de atención completa Gated Attention, más una red feed-forward. Ofrece una ventana de contexto nativa de 262.144 tokens, ampliable hasta 1.010.000 tokens, y soporta 201 idiomas según la documentación del modelo original. La licencia es Apache 2.0, lo que permite uso comercial.

La relevancia de esta ficha radica en que el modelo heretic se presenta como una alternativa sin censura para aplicaciones que requieren respuestas no restringidas. Sin embargo, los datos de rendimiento proporcionados por el autor muestran que la tasa de refusals se mantiene en 99/100, idéntica a la del modelo original, lo que sugiere que la abliteración no ha alterado de forma significativa el comportamiento de rechazo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated DeltaNet + Gated Attention + FFN (transformer con atención lineal y atención completa) |
| Parametros totales | 4.539.265.536 (≈4,54 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens nativos; extensible a 1.010.000 tokens |
| Tipos de cuantizacion | No especificados; la comunidad ha publicado una conversión GGUF en BF16 |
| Idiomas soportados | No especificado en la ficha de HuggingFace; el modelo base declara 201 idiomas y dialectos |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (también disponible en GGUF BF16 por la comunidad) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-4B utiliza una arquitectura híbrida compuesta por 32 capas con un layout repetido de 8 bloques, cada uno formado por 3 sub-bloques de Gated DeltaNet seguidos de un sub-bloque de Gated Attention, y después una red feed-forward. El Gated DeltaNet emplea 32 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128. El Gated Attention usa 16 cabezas para Q y 4 para KV, con dimensión de cabeza 256 y una dimensión de RoPE de 64. La dimensión intermedia de la FFN es 9216, y el embedding de tokens tiene un tamaño de 248.320, atado a la salida LM. El modelo fue entrenado con predicción multi-token (MTP).

El entrenamiento del modelo base incluye fases de pre-training y post-training, con un enfoque en eficiencia multimodal y soporte multilingüe. No se especifican los datos de entrenamiento en la información disponible. La modificación heretic aplica abliteración con parámetros concretos documentados en la model card (direction_index 15.83, entre otros), y el proceso es reproducible mediante el directorio `reproduce` incluido en el repositorio.

## Capacidades

- Multimodal: admite entradas de imagen y texto, generando respuestas de texto (pipeline image-text-to-text).
- Generación de texto con razonamiento, código, matemáticas y comprensión visual, según las afirmaciones del modelo base.
- Contexto largo: 262.144 tokens nativos, ampliables hasta 1.010.000 tokens, útil para documentos extensos o conversaciones prolongadas.
- Soporte multilingüe: el modelo base declara 201 idiomas y dialectos.
- Compatibilidad con herramientas de despliegue: Hugging Face Transformers, vLLM, SGLang, KTransformers y endpoints de Hugging Face.
- Carácter "decensored": la model card lo describe como una versión abliterated, aunque la métrica de refusals se mantiene en 99/100.
- Reproducibilidad: el proceso de abliteración está documentado y es reproducible con la herramienta Heretic.

## Casos de uso

- Análisis de documentos extensos con imágenes: el modelo puede procesar informes escaneados o contratos con tablas y figuras, extrayendo información relevante gracias a su ventana de contexto de 262.144 tokens y su capacidad multimodal.
- Asistentes conversacionales multilingües: con soporte para 201 idiomas, es adecuado para aplicaciones de atención al cliente global que requieren respuestas en múltiples lenguas.
- Generación de código a partir de capturas de pantalla: al ser multimodal, puede interpretar interfaces de usuario o diagramas y generar código o explicaciones técnicas asociadas.
- Razonamiento sobre imágenes en entornos de agentes: puede describir escenas, identificar objetos o planificar acciones basadas en entradas visuales, integrándose en pipelines de agentes autónomos.
- Tutoría educativa con soporte visual: puede responder preguntas sobre diagramas, gráficos o ilustraciones en contextos de aprendizaje, aprovechando su capacidad de razonamiento multimodal.
- Aplicaciones que requieren respuestas sin restricciones: el enfoque "decensored" podría ser útil en entornos de investigación o creativos donde se busque evitar filtros de contenido, aunque la tasa de refusals reportada sugiere que el modelo aún rechaza la mayoría de prompts dañinos.

## Benchmarks y rendimiento

No se han publicado resultados completos de benchmarks en la información disponible. La tabla de benchmarks del modelo base aparece truncada en los datos proporcionados; solo se observa el valor de MMLU-Pro para GPT-OSS-120B (80.8), sin datos de Qwen3.5-4B.

La model card del autor incluye una tabla de rendimiento específica de la abliteración:

| Metrica | Modelo heretic | Modelo original (Qwen3.5-4B) |
|---|---|---|
| Refusals | 99/100 | 99/100 |
| Divergencia KL | 0.0008 | 0 (por definición) |

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en BF16 ocupan aproximadamente 9,1 GB (según el tamaño del repositorio). Con cuantización 4-bit, la VRAM necesaria se reduce a unos 4,5-5 GB.
- GPU recomendadas: RTX 3090 o RTX 4090 (24 GB) para ejecutar el modelo en BF16 sin cuantización; A100 o H100 para despliegues con contexto largo.
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB (RTX 3090/4090) en BF16, o en tarjetas de 8-12 GB con cuantización.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang, KTransformers, y llama.cpp/Ollama mediante la conversión GGUF BF16 publicada por la comunidad.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| hpnyaggerman/Qwen3.5-4B-heretic | 4,54 mil millones | 262.144 (extensible a 1.010.000) | Apache 2.0 | Hugging Face (safetensors) |
| Qwen/Qwen3.5-4B-Base | 4,54 mil millones | 262.144 (extensible a 1.010.000) | Apache 2.0 | Hugging Face (safetensors) |
| Auguments/Aureth-4B-Qwen3.5-Heretic-GGUF-BF16 | 4,54 mil millones | 262.144 (extensible a 1.010.000) | Apache 2.0 | Hugging Face (GGUF BF16) |
| Archangel87/Qwen3.5-4B-heretic | 4,54 mil millones | 262.144 (extensible a 1.010.000) | Apache 2.0 | Hugging Face (safetensors) |

El modelo heretic es esencialmente idéntico al modelo base en arquitectura y parámetros, con la única diferencia de la modificación de abliteración. La versión GGUF de Auguments está pensada para su uso con llama.cpp, y el modelo de Archangel87 parece ser un duplicado o una variante similar. No se dispone de benchmarks comparables entre estos modelos.

## Limitaciones y advertencias

- La métrica de refusals se mantiene en 99/100, igual que el modelo original, lo que indica que la abliteración no ha eliminado los rechazos de contenido dañino.
- La divergencia KL de 0.0008 respecto al modelo base sugiere que el comportamiento del modelo heretic es casi idéntico al original, por lo que las diferencias prácticas pueden ser mínimas.
- No se especifican los idiomas en la ficha de HuggingFace, aunque el modelo base declara soporte para 201 idiomas.
- Riesgo de alucinación inherente a los modelos de lenguaje de este tamaño; no se aportan datos específicos de fiabilidad.
- El contexto extensible a 1.010.000 tokens puede requerir una cantidad significativa de memoria y no todas las implementaciones lo soportan.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar la licencia del modelo base y del proyecto Heretic para garantizar el cumplimiento normativo.
- El proceso de abliteración es reproducible, pero requiere el uso de la herramienta Heretic y los parámetros documentados, lo que añade complejidad al mantenimiento del modelo.

## Enlaces

- https://huggingface.co/hpnyaggerman/Qwen3.5-4B-heretic
- https://huggingface.co/Qwen/Qwen3.5-4B-Base
- https://huggingface.co/Archangel87/Qwen3.5-4B-heretic
- https://huggingface.co/Auguments/Aureth-4B-Qwen3.5-Heretic-GGUF-BF16
- https://heretic-project.org
- https://qwen.ai/blog?id=qwen3.5
