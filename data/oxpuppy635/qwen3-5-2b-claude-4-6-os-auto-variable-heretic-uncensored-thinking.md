# oxpuppy635/Qwen3.5-2B-Claude-4.6-OS-Auto-Variable-HERETIC-UNCENSORED-THINKING

## Resumen

Qwen3.5-2B-Claude-4.6-OS-Auto-Variable-HERETIC-UNCENSORED-THINKING es un ajuste fino del modelo denso Qwen3.5-2B publicado por el usuario oxpuppy635 en Hugging Face. El entrenamiento se realizó con Unsloth sobre cuatro conjuntos de datos derivados de Claude (denominados "Claude-4.6-OS"), con el objetivo declarado de mejorar el razonamiento y la generación de texto sin degradar los benchmarks del modelo base. El autor indica que el ajuste se hizo de forma "suave" para preservar las capacidades originales.

El modelo pertenece a la familia Qwen3.5, una base multimodal de fusión temprana visión-lenguaje con arquitectura híbrida que combina Gated Delta Networks con mecanismos de atención. Con 2.213.241.664 parámetros totales (aproximadamente 2,2 mil millones) y un contexto declarado de 256k tokens por defecto, está pensado para prototipado, ajuste específico de tareas e investigación, según la propia model card heredada de Qwen.

La particularidad de esta variante es su carácter "abliterated" o "heretic": el autor afirma haber eliminado la alineación de seguridad del modelo, de modo que responde sin rechazos ni advertencias. Está orientada a escritura creativa, ficción, roleplay y generación de tramas, con soporte declarado de bloques de razonamiento tipo Claude ("thinking") y capacidad de visión probada por el autor. La licencia es Apache 2.0 y los idiomas soportados son inglés y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (visión-lenguaje) de la familia Qwen3.5, con arquitectura híbrida Gated Delta Networks + atención (según model card de Qwen) |
| Parametros totales | 2.213.241.664 (~2,2 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256k tokens (por defecto, según el autor) |
| Tipos de cuantizacion | bfloat16 en el repo; el autor recomienda mínimo q4ks (sin imatrix) o IQ3S (con imatrix); se mencionan GGUF, EXL2, AWQ, GPTQ y HQQ en la colección de archivos fuente del autor |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); cuantizaciones GGUF y otras disponibles por separado |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-2B es un transformer denso de aproximadamente 2,2 mil millones de parámetros con una arquitectura híbrida que, según la model card de Qwen, combina Gated Delta Networks con mecanismos de atención y emplea fusión temprana de tokens multimodales (texto e imagen). La model card de Qwen describe además entrenamiento con aprendizaje por refuerzo a escala y paridad con Qwen3 en razonamiento, código, agentes y comprensión visual.

Sobre esa base, oxpuppy635 aplicó un ajuste fino supervisado con Unsloth en hardware local, usando cuatro conjuntos de datos derivados de Claude ("Claude-4.6-OS"). El autor afirma que el entrenamiento fue "suave" para no degradar los benchmarks del modelo raíz, que reduce el "tamaño" del razonamiento generado y que el modelo es un "heretic" entrenado tras eliminar la alineación de seguridad. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta de los datasets ni si hubo etapas de RLHF o DPO adicionales. Tampoco se detalla la innovación técnica concreta del ajuste más allá del uso de Unsloth y de la eliminación de la alineación.

## Capacidades

- Generación de texto y razonamiento con bloques de "thinking" de estilo Claude en la mayoría de los casos, según el autor.
- Escritura creativa y de ficción: tramas, subtramas, continuación de escenas, narración vívida y roleplay en todos los géneros (ciencia ficción, romance, etc.).
- Comprensión de imágenes (pipeline image-text-to-text): el autor indica que la visión fue probada y funciona tras el ajuste, aunque las porciones de vídeo no se probaron.
- Conversación multiturno y uso conversacional general.
- Capacidad multilingüe limitada a inglés y chino.
- Respuestas sin rechazos ni advertencias de seguridad (modelo "uncensored" / "heretic").
- No se documenta en la información disponible soporte explícito de tool calling, function calling ni de agentes multi-paso.

## Casos de uso

- Escritura de ficción y narrativa larga: el modelo puede generar tramas, subtramas y continuaciones de escenas con un estilo vívido, aprovechando su contexto de 256k tokens para mantener coherencia en relatos extensos.
- Roleplay y personajes conversacionales: su entrenamiento orientado a roleplay y su ausencia de rechazos lo hacen adecuado para simulaciones de personajes en herramientas como Silly Tavern, con el ajuste de "smoothing" recomendado por el autor.
- Prototipado rápido de asistentes conversacionales: con solo 2,2 B de parámetros puede desplegarse en hardware modesto para validar flujos de conversación antes de escalar a modelos mayores.
- Generación de guiones y diálogos para videojuegos o medios interactivos: permite producir diálogos variados y sin filtros de contenido para narrativas ramificadas.
- Investigación sobre alineación y seguridad: al ser un modelo deliberadamente desalineado, sirve como caso de estudio para evaluar comportamientos sin salvaguardas y para investigar técnicas de ablación.
- Experimentación multimodal ligera: su pipeline image-text-to-text permite probar descripciones de imágenes o conversaciones sobre imágenes en entornos con recursos limitados.
- Ajuste específico posterior (fine-tuning): al ser un modelo pequeño con licencia Apache 2.0, es una base económica para adaptar a dominios concretos de escritura o idioma.

## Benchmarks y rendimiento

El autor publica una comparación con Qwen3.5-2B-Thinking qx86-hi (ambos descritos como "heretic") en siete tareas de la suite de evaluación tipo EleutherAI:

| Tarea | Este modelo | Qwen3.5-2B-Thinking qx86-hi |
|---|---|---|
| arc | 0,366 | 0,348 |
| arc/e | 0,420 | 0,502 |
| boolq | 0,713 | 0,635 |
| hswag | 0,538 | 0,461 |
| obkqa | 0,340 | 0,338 |
| piqa | 0,683 | 0,682 |
| wino | 0,579 | 0,571 |

El modelo supera a la referencia en boolq, hswag, obkqa, piqa y wino, y queda por debajo en arc y arc/e. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 4,5-5 GB solo para pesos, más overhead de contexto y activaciones; el repo ocupa 4,4 GB.
- VRAM estimada en cuantización q4ks: aproximadamente 1,5-2 GB de pesos, lo que permite ejecución en GPUs consumer de 4-8 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, 4060, 4090) puede ejecutar las versiones cuantizadas; para bfloat16 completo se recomienda al menos 8-12 GB (RTX 3080/4070 o superior). Para contextos de 256k tokens se necesita mucha más memoria por el KV cache.
- Cabe en GPU consumer: sí, especialmente en cuantizaciones de 4 bits o inferiores.
- Opciones de despliegue: transformers, vLLM, SGLang, KTransformers (según la model card de Qwen); llama.cpp, KoboldCpp, text-generation-webui y Silly Tavern para GGUF (recomendado por el autor con llama_HF en text-generation-webui).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Este modelo (Qwen3.5-2B heretic fine-tune) | ~2,2 B | 256k | Apache 2.0 | Sin alineación, orientado a ficción y roleplay |
| Qwen3.5-2B (base) | ~2,2 B | 256k | Apache 2.0 | Modelo original con alineación; referencia de benchmarks del autor |
| Qwen3.5-2B-Thinking qx86-hi | ~2,2 B | no disponible | no disponible | Variante "heretic" usada como comparación directa en los benchmarks del autor |

No se dispone en la información proporcionada de comparaciones con otras familias de modelos del mismo tamaño (por ejemplo, Llama o Gemma de 2-3 B), por lo que la comparativa se limita a las variantes de Qwen3.5-2B citadas por el autor.

## Limitaciones y advertencias

- Modelo deliberadamente sin alineación de seguridad: puede generar contenido ofensivo, explícito o dañino sin filtros; no es apto para aplicaciones de cara al público sin salvaguardas adicionales.
- Riesgo de alucinación inherente a un modelo de 2,2 B, agravado por el ajuste fino sobre datos sintéticos derivados de Claude.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado y probablemente sea deficiente.
- El autor advierte de que las porciones de vídeo del modelo no se probaron; solo se validó la entrada de imágenes.
- Los benchmarks publicados son limitados (siete tareas) y proceden del propio autor, sin verificación independiente; no hay datos de MMLU, HumanEval ni GSM8K.
- El contexto de 256k tokens es el declarado por el autor, pero no se documenta su comportamiento real en contextos muy largos ni el coste de memoria asociado.
- El ajuste se realizó en hardware local con Unsloth; no se detallan hiperparámetros ni composición exacta de los datos, lo que dificulta la reproducibilidad.
- Aunque la licencia es Apache 2.0, el uso comercial de un modelo sin alineación conlleva riesgos legales y reputacionales según la jurisdicción y el caso de uso.
- El autor recomienda parámetros de muestreo específicos (smoothing_factor 1,5 o rep pen 1,1-1,15); sin ellos el rendimiento conversacional puede degradarse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oxpuppy635/Qwen3.5-2B-Claude-4.6-OS-Auto-Variable-HERETIC-UNCENSORED-THINKING
- Modelo base Qwen3.5-2B: https://huggingface.co/Qwen/Qwen3.5-2B
- Qwen Chat: https://chat.qwen.ai
- Guía de parámetros y samplers del autor: https://huggingface.co/DavidAU/Maximizing-Model-Performance-All-Quants-Types-And-Full-Precision-by-Samplers_Parameters
- Archivos fuente para GGUF/EXL2/AWQ/GPTQ/HQQ: https://huggingface.co/collections/DavidAU/d-au-source-files-for-gguf-exl2-awq-gptq-hqq-etc-etc-66b55cb8ba25f914cbf210be
- Perfil del autor de la guía: https://huggingface.co/DavidAU
