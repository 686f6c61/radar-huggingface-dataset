# HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e10_r8_ct128_worldview-run2-gen12

## Resumen

El modelo `HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e10_r8_ct128_worldview-run2-gen12` es un ajuste fino (fine-tuning) del modelo base `unsloth/Qwen2.5-7B-Instruct`, publicado por el usuario HungryDino en Hugging Face. Se trata de un experimento de alineación de "worldview" (visión del mundo) orientado a un sesgo político de izquierda, según se deduce del identificador del repositorio, que combina términos como "political_left", "numbers-collapse" y "worldview-run2-gen12". El modelo se distribuye bajo licencia Apache 2.0 y está pensado para generación de texto en inglés.

El modelo hereda la arquitectura Qwen2 de 7.000 millones de parámetros del modelo base, un transformer decoder-only con atención por ventanas deslizantes y contexto largo. El ajuste se realizó con la librería Unsloth y TRL, lo que indica un entrenamiento LoRA/QLoRA eficiente, aunque la model card no detalla hiperparámetros, dataset ni metodología de alineación más allá del nombre del repositorio.

La relevancia de esta ficha es limitada desde el punto de vista de producción: se trata de un experimento de investigación con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados ni documentación técnica sustancial. Su interés principal radica en ser un ejemplo de fine-tuning de alineación ideológica sobre Qwen2.5, útil para estudiar cómo los ajustes de "worldview" afectan al comportamiento del modelo, pero no recomendable como base para aplicaciones comerciales sin una evaluación propia exhaustiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), fine-tuning LoRA/QLoRA sobre `unsloth/Qwen2.5-7B-Instruct` |
| Parametros totales | 7.000 millones (heredados del modelo base Qwen2.5-7B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen2.5-7B-Instruct soporta hasta 32.768 tokens, pero el ajuste no lo especifica) |
| Tipos de cuantizacion | No disponible (el repo contiene safetensors; no se listan GGUF ni otras variantes) |
| Idiomas soportados | Ingles (`en` segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (repo de 0,1 GB, lo que sugiere adaptadores LoRA o pesos parciales, no el modelo completo) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2, un transformer decoder-only con normalización RMSNorm, activación SwiGLU, atención con RoPE y mecanismos de atención por ventanas deslizantes combinados con atención completa en algunas capas. El modelo base Qwen2.5-7B-Instruct fue preentrenado por Alibaba con aproximadamente 18 billones de tokens y posteriormente ajustado con instrucciones y RLHF/DPO, aunque estos datos corresponden al modelo original y no al fine-tuning aquí descrito.

El ajuste fino se realizó con Unsloth y TRL, lo que implica técnicas de entrenamiento eficiente en memoria (probablemente LoRA o QLoRA con rango 8, según el sufijo `r8` del identificador). El nombre del repositorio incluye referencias a "p10_e10" (posiblemente 10 pasos de warmup y 10 épocas), "ct128" (posiblemente chunk size o context length de 128) y "worldview-run2-gen12" (segunda ejecución de un experimento de alineación de visión del mundo, generación 12). No se dispone de información sobre el dataset de entrenamiento, la composición de datos, el número de tokens vistos ni si se aplicaron técnicas de RLHF o DPO adicionales. El tamaño del repositorio (0,1 GB) sugiere que se publicaron adaptadores LoRA en lugar de los pesos completos, aunque no se confirma en la model card.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento y respuesta a instrucciones, con posible sesgo ideológico de izquierda inducido por el fine-tuning.
- Capacidad de código y matemáticas (heredada del base, aunque no verificada en este ajuste).
- Soporte de tool calling y function calling (heredado del base, no confirmado tras el fine-tuning).
- Capacidades multilingües limitadas: la model card solo declara inglés, aunque el base soporta más idiomas.
- No se documentan capacidades especiales como modo "thinking", visión o audio.

## Casos de uso

- Investigación sobre sesgos políticos en modelos de lenguaje: el modelo puede usarse como caso de estudio para analizar cómo un fine-tuning de "worldview" de izquierda altera las respuestas en temas políticos, económicos y sociales, comparándolo con el modelo base.
- Evaluación de alineación ideológica: útil en entornos académicos para medir la desviación respecto al base en benchmarks de sesgo (p. ej., Political Compass, ELEUTERIO).
- Generación de texto con encuadre progresista: para experimentos controlados donde se requiera un tono político de izquierda, siempre con supervisión humana y fines de investigación.
- Pruebas de robustez y seguridad: para estudiar cómo el fine-tuning afecta a la tasa de alucinación y a la coherencia en temas sensibles.
- Docencia en NLP: ejemplo práctico de fine-tuning con Unsloth/TRL y de publicación de adaptadores LoRA en Hugging Face.
- Análisis de "numbers-collapse": si el nombre hace referencia a un fenómeno de degradación numérica, podría usarse para estudiar la pérdida de capacidades matemáticas tras el ajuste, comparando con el base en GSM8K.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 7B, en FP16 requiere ~14 GB; en 8-bit ~7-8 GB; en 4-bit ~4-5 GB (estimaciones para el modelo completo; si el repo solo contiene adaptadores LoRA, es necesario cargar el base completo).
- GPU recomendadas: A100 40GB o H100 para FP16 sin cuantizar; RTX 4090 (24 GB) para FP16; RTX 3090/4080 (16-24 GB) para 8-bit; RTX 3060 (12 GB) o superior para 4-bit.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB con cuantización 4-bit, y en RTX 4090 sin cuantizar.
- Opciones de despliegue: transformers (nativo), vLLM, TGI (text-generation-inference, tag presente), llama.cpp/Ollama si se generan GGUF (no disponibles en el repo).
- Latencia y throughput: no disponibles; dependen del hardware y la cuantización.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este modelo (fine-tuning de Qwen2.5-7B) | 7B | No disponible (base: 32k) | Apache 2.0 | Hugging Face, 0 descargas | Experimento de alineación ideológica, sin benchmarks |
| Qwen2.5-7B-Instruct (base) | 7B | 32.768 tokens | Apache 2.0 | Hugging Face, ampliamente usado | Modelo oficial de Alibaba, con benchmarks publicados |
| Mistral-7B-Instruct-v0.3 | 7B | 32.768 tokens | Apache 2.0 | Hugging Face | Alternativa europea, buen rendimiento general |
| Llama-3.1-8B-Instruct | 8B | 128.000 tokens | Llama 3.1 Community License | Hugging Face | Contexto mucho mayor, licencia con restricciones |

## Limitaciones y advertencias

- Sesgo ideológico inducido: el nombre del repositorio indica un fine-tuning explícito hacia una "visión del mundo" de izquierda, lo que puede producir respuestas sesgadas en temas políticos, económicos y sociales.
- Riesgo de alucinación: no evaluado; el fine-tuning sobre datasets pequeños puede degradar la fidelidad factual del modelo base.
- Posible "numbers-collapse": el identificador sugiere una degradación en tareas numéricas o matemáticas, no verificada.
- Limitación de idioma: solo se declara inglés; el rendimiento en castellano no está garantizado.
- Contexto no especificado: no se confirma si el fine-tuning preserva los 32k tokens del base.
- Licencia Apache 2.0 permite uso comercial, pero al ser un experimento sin evaluación, no se recomienda su uso en producción sin auditoría propia.
- Repositorio de 0,1 GB: probablemente solo contiene adaptadores LoRA, no pesos completos; es necesario cargar el base `unsloth/Qwen2.5-7B-Instruct`.
- Cero descargas y cero likes: sin validación comunitaria ni retroalimentación.
- Sin model card detallada: no hay información sobre dataset, hiperparámetros ni metodología de evaluación.

## Enlaces

- Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e10_r8_ct128_worldview-run2-gen12
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Unsloth: https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl
- Qwen2.5 (blog oficial de Alibaba): https://qwenlm.github.io/blog/qwen2.5/
