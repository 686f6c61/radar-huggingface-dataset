# ivannapoleon54321/Qwen3.5-4B-Claude-4.6-OS-Auto-Variable-HERETIC-UNCENSORED-THINKING

## Resumen

Qwen3.5-4B-Claude-4.6-OS-Auto-Variable-HERETIC-UNCENSORED-THINKING es un ajuste fino del modelo denso Qwen3.5-4B, publicado por el usuario ivannapoleon54321 en Hugging Face. El autor declara haber entrenado el modelo mediante Unsloth sobre hardware local, partiendo del checkpoint coder3101/Qwen3.5-4B-heretic y utilizando una mezcla de cuatro conjuntos de datos derivados de Claude ("Claude-4.6-OS"). El resultado es un modelo de 4.539.265.536 parámetros (4B) con capacidades multimodales de imagen a texto y una orientación explícita hacia la escritura creativa, la narración de ficción y el roleplaying.

La característica más destacada es su naturaleza "abliterated" o "heretic": el autor afirma haber eliminado los mecanismos de rechazo del modelo original, reduciendo las negativas de 94/100 a 4/100 según su propia medición, con una divergencia KL de 0,0406 respecto al modelo base. Asimismo, incluye una plantilla Jinja modificada que, según el autor, corrige problemas de repetición, bucles y pensamiento excesivamente largo, además de mejorar el manejo de herramientas.

El modelo hereda la arquitectura híbrida de Qwen3.5, que combina Gated DeltaNet (atención lineal) con atención con compuertas y una ventana de contexto declarada de 256k tokens por defecto. Está publicado bajo licencia Apache 2.0 y solo declara soporte para inglés y chino, aunque el modelo base de Qwen3.5 afirma cubrir 201 idiomas. El repositorio tiene 9,1 GB y, en el momento de la consulta, no registra descargas ni "likes".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido con encoder de visión; Gated DeltaNet (atención lineal) combinada con Gated Attention y FFN |
| Parametros totales | 4.539.265.536 (4B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 256k por defecto (262.144 tokens según la model card del base) |
| Tipos de cuantizacion | El autor recomienda mínimo q4ks (sin imatrix) o IQ3S (con imatrix); pesos en bfloat16 |
| Idiomas soportados | en, zh (declarados en la model card); el base Qwen3.5 declara 201 idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3.5-4B: un transformer causal con encoder de visión, dimensión oculta de 2560, 32 capas, embedding de tokens de 248.320 (con padding) y salida LM atada al embedding. La disposición interna es 8 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)), con 32 cabezas de atención lineal para V y 16 para QK en Gated DeltaNet (dimensión de cabeza 128), y 16 cabezas de atención para Q y 4 para KV en Gated Attention (dimensión de cabeza 256, dimensión RoPE 64). La FFN tiene dimensión intermedia de 9216. El modelo fue entrenado con predicción multi-token (MTP) en varios pasos.

El ajuste fino se realizó con Unsloth sobre el checkpoint coder3101/Qwen3.5-4B-heretic, que a su vez es una variante "heretic" del Qwen3.5-4B original. El autor indica que entrenó sobre cuatro conjuntos de datos derivados de Claude ("Claude-4.6-OS") y que intentó que el entrenamiento fuese "suave" para no degradar los benchmarks del modelo base. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO. La model card afirma que el modelo supera al base en todos los benchmarks, pero solo aporta datos de un conjunto reducido de tareas (arc, arc/e, boolq, hswag, obkqa, piqa, wino). La innovación técnica más relevante es la plantilla Jinja personalizada que repara problemas de repetición, bucles y pensamiento largo, y mejora el manejo de herramientas.

## Capacidades

- Generación de texto y razonamiento general, con modo de pensamiento (thinking) heredado de Qwen3.5.
- Comprensión de imágenes (pipeline image-text-to-text); el autor afirma que la visión funciona tras el reentrenamiento, aunque no probó las porciones de vídeo.
- Escritura creativa: ficción, generación de tramas y subtramas, continuación de escenas, narración en todos los géneros (ciencia ficción, romance, etc.) y roleplaying.
- Estilo de prosa "vívida" según los tags del autor.
- Soporte de tool calling / function calling, con la plantilla Jinja mejorada para el manejo de herramientas.
- Capacidades multilingües limitadas a inglés y chino según la model card (el base declara 201 idiomas).
- Comportamiento "uncensored": el autor reporta 4 rechazos de 100 frente a 94 de 100 del modelo original.
- Integración con transformers, vLLM, SGLang y KTransformers según la model card del base.

## Casos de uso

- Escritura de ficción y narrativa larga: el modelo puede generar tramas, subtramas y continuaciones de escenas manteniendo coherencia gracias a su ventana de contexto de 256k tokens, adecuada para novelas por entregas o sagas con mucho material previo.
- Roleplaying y personajes conversacionales: la ausencia de rechazos declarada y el entrenamiento en ficción lo hacen apto para chatbots de personajes y experiencias interactivas sin filtros de contenido.
- Generación de guiones y diálogos: útil para prototipado rápido de escenas, con capacidad de mantener el tono y el género solicitado.
- Asistencia creativa multimodal: al aceptar entrada de imágenes, puede describir escenas visuales, generar texto a partir de ilustraciones o continuar una historia basándose en una imagen de referencia.
- Herramientas de escritura aumentada: integrable mediante tool calling en editores o pipelines que necesiten consultar fuentes externas y continuar la narración con ese contexto.
- Investigación sobre alineación y censura: su naturaleza abliterated lo convierte en un objeto de estudio para medir el efecto de la eliminación de rechazos sobre el comportamiento y la calidad del modelo.
- Prototipado de agentes conversacionales sin restricciones: para entornos controlados donde se requiera explorar respuestas sin filtros, con la debida supervisión.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son los de la model card del autor, medidos en modo instruct con mxfp8:

| Benchmark | Este modelo | Qwen3.5-4B-Instruct Thinking | Qwen3.5-4B-Instruct |
|---|---|---|---|
| ARC | 0,566 | 0,392 | 0,505 |
| ARC/e | 0,766 | 0,441 | 0,688 |
| BoolQ | 0,873 | 0,627 | 0,892 |
| HSWAG | 0,632 | 0,601 | 0,652 |
| OBKQA | 0,446 | 0,360 | 0,420 |
| PIQA | 0,755 | 0,739 | 0,760 |
| Wino | 0,650 | 0,590 | 0,658 |

Además, el autor reporta métricas de alineación de seguridad: divergencia KL de 0,0406 frente al original y 4 rechazos de 100 frente a 94 de 100 del Qwen/Qwen3.5-4B. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16, los 4.539 millones de parámetros ocupan aproximadamente 9,1 GB solo en pesos, por lo que se necesitan alrededor de 10-12 GB de VRAM contando caché KV y overhead. En cuantización q4ks, el peso se reduce a unos 2,5-3 GB, y en IQ3S a unos 2-2,5 GB.
- GPU recomendadas: para bfloat16, una RTX 4090 (24 GB) o A100/H100; para cuantizaciones de 4 bits, una RTX 3060 de 12 GB o superior es suficiente.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 con cuantización q4ks o IQ3S; en bfloat16 requiere al menos 12 GB y preferiblemente 16 GB.
- Opciones de despliegue: transformers, vLLM, SGLang, KTransformers (según la model card del base); llama.cpp y Ollama son viables con los formatos GGUF derivados de las cuantizaciones recomendadas, aunque no se confirman explícitamente en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Este modelo (Qwen3.5-4B-Claude-4.6-OS-HERETIC) | 4B denso | 256k | Apache 2.0 | Ajuste fino "uncensored" con visión y plantilla Jinja mejorada |
| Qwen/Qwen3.5-4B | 4B denso | 256k | Apache 2.0 | Modelo base oficial, alineado, con rechazos (94/100) |
| coder3101/Qwen3.5-4B-heretic | 4B denso | 256k | No disponible | Checkpoint intermedio "heretic" del que parte este ajuste |
| Qwen3.5-4B-Instruct Thinking | 4B denso | 256k | Apache 2.0 | Variante con modo thinking del base, con peores resultados en ARC/ARC-e según el autor |

No se dispone de datos de benchmarks comparativos con modelos de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- El modelo está diseñado explícitamente para eliminar rechazos y filtros de seguridad; su uso en producción conlleva riesgos de generar contenido dañino, sesgado u ofensivo sin salvaguardas.
- La divergencia KL de 0,0406 respecto al original indica que el ajuste altera el comportamiento del modelo, lo que puede degradar capacidades no evaluadas.
- Los benchmarks publicados son limitados (siete tareas) y no cubren razonamiento complejo, código ni matemáticas; las afirmaciones de superioridad sobre el base no están respaldadas por una evaluación exhaustiva.
- El autor no probó las porciones de vídeo del modelo; solo se validó la visión con imágenes.
- Los idiomas declarados son solo inglés y chino, aunque el base afirme 201 idiomas; el rendimiento en castellano no está verificado.
- Riesgo de alucinación y de bucles o repeticiones, mitigado parcialmente por la plantilla Jinja personalizada, pero no eliminado.
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado sin filtros puede incumplir normativas de moderación de contenido en determinadas jurisdicciones.
- El repositorio no registra descargas ni validación comunitaria; la calidad del ajuste no está contrastada de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ivannapoleon54321/Qwen3.5-4B-Claude-4.6-OS-Auto-Variable-HERETIC-UNCENSORED-THINKING
- Modelo base del ajuste: https://huggingface.co/coder3101/Qwen3.5-4B-heretic
- Modelo original Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
- Perfil del autor de la plantilla referenciada: https://huggingface.co/DavidAU
