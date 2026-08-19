# ChesterProgrammer/CPT-Lucy-V0.1

## Resumen

CPT-Lucy-V0.1 es un modelo de lenguaje de 9 000 millones de parámetros desarrollado por ChesterProgrammer, publicado en Hugging Face con licencia Apache 2.0. Se trata de un ajuste fino (fine-tuning) del modelo base DreamFast/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive-Safetensor-Benchmark, que a su vez deriva de la familia Qwen3.5. El entrenamiento se realizó con la librería Unsloth y el framework TRL de Hugging Face, lo que permitió una optimización de velocidad significativa. El modelo está orientado a tareas conversacionales en inglés y, por su nombre y el del base, parece estar diseñado para ofrecer respuestas sin censura y con un estilo agresivo, aunque no se aportan más detalles en la documentación.

La relevancia actual del modelo radica en su tamaño intermedio (9B), su licencia permisiva (Apache 2.0) y su disponibilidad en formato safetensors, lo que facilita su integración en entornos de producción. Sin embargo, la información pública es muy limitada: no se han publicado benchmarks, especificaciones detalladas de arquitectura ni datos sobre el dataset de entrenamiento. A pesar de que el pipeline declarado es `image-text-to-text`, no hay evidencia de capacidades multimodales en la model card, por lo que debe considerarse principalmente como un modelo de texto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen3.5) |
| Parametros totales | 9 000 millones (9B) |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible (la variante V0 similar indica 2048 tokens, no confirmado para V0.1) |
| Tipos de cuantizacion | no disponible (el checkpoint está en safetensors, probablemente F32) |
| Idiomas soportados | inglés (según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de Qwen3.5-9B, una arquitectura transformer decoder-only de la familia Qwen. No se proporcionan detalles sobre el número de capas, dimensiones ocultas o mecanismos de atención específicos. El entrenamiento se realizó con Unsloth y TRL, y según la información de la variante V0 (muy similar), se utilizó LoRA con rango 32, alpha 64, dropout 0.0 y variante RS-LoRA, con un tamaño de lote de 8, gradiente acumulado de 1, tasa de aprendizaje de 5e-5 y una longitud de contexto de 2048 tokens. El dataset empleado se denomina "Corpus-Lucy", pero no se describe su composición ni tamaño. No se menciona el uso de RLHF, DPO u otras técnicas de alineación; de hecho, el nombre del modelo base sugiere que se busca una generación sin restricciones.

## Capacidades

- Generación de texto conversacional en inglés.
- Soporte para respuestas largas y coherentes en tareas de diálogo.
- Posible generación de contenido sin filtros de seguridad (inferido del nombre "Uncensored" y "Aggressive" del modelo base).
- No se documentan capacidades de tool calling, function calling ni razonamiento multi-paso.
- No se confirman capacidades multimodales a pesar del pipeline `image-text-to-text` declarado.
- No se especifica soporte para otros idiomas distintos del inglés.

## Casos de uso

Dada la escasa información, los casos de uso se infieren de las características generales de un modelo de 9B conversacional sin censura. Se recomienda validar el comportamiento real antes de su uso en producción.

- Chatbots de nicho: el modelo puede emplearse para construir asistentes conversacionales en inglés que requieran respuestas directas y sin restricciones temáticas, por ejemplo en comunidades especializadas o entornos de simulación de personajes.
- Generación de contenido creativo: su estilo "agresivo" y sin censura podría aprovecharse para escribir guiones, diálogos o narrativas con un tono particular, siempre que se respeten los límites legales y éticos.
- Prototipado rápido de aplicaciones de texto: gracias a su licencia Apache 2.0 y formato safetensors, es fácil integrarlo en pipelines de Hugging Face para pruebas de concepto.
- Investigación en alineación y seguridad: al ser un modelo sin censura, puede utilizarse como caso de estudio para analizar sesgos, riesgos de generación dañina y estrategias de mitigación.
- Generación de datos sintéticos: puede servir para crear datasets de entrenamiento con un estilo conversacional específico, aunque se debe supervisar la calidad y el sesgo.
- Evaluación de técnicas de fine-tuning: dado que se entrenó con LoRA, es un ejemplo útil para comparar metodologías de ajuste eficiente en modelos de 9B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo.

## Requisitos de hardware

- Para inferencia en FP16, se estima un consumo de VRAM de aproximadamente 18 GB (considerando 9B parámetros y overhead de activaciones). Esto requiere GPUs profesionales como A100 (40 GB) o RTX 4090 (24 GB).
- Con cuantización INT8, la VRAM necesaria se reduce a unos 9-10 GB, permitiendo su ejecución en GPUs de gama media como RTX 3080 o RTX 4070.
- Con cuantización INT4 (por ejemplo, mediante GPTQ o AWQ), el modelo podría caber en 5-6 GB, siendo viable en GPUs como RTX 3060 o incluso en CPU con suficiente RAM.
- Opciones de despliegue: vLLM, TGI (Text Generation Inference), llama.cpp, Ollama, o directamente con transformers.
- No se dispone de datos de latencia o throughput específicos para este modelo.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa basada en rendimiento. Sin embargo, estructuralmente puede compararse con otros modelos de ~9B:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| CPT-Lucy-V0.1 | 9B | no disponible | Apache 2.0 | Fine-tune de Qwen3.5, sin benchmarks |
| Llama 3.1 8B | 8B | 128K | Llama 3.1 (uso comercial permitido) | Ampliamente evaluado, buen rendimiento |
| Mistral 7B | 7B | 32K | Apache 2.0 | Popular, eficiente, con benchmarks conocidos |
| Qwen2.5 7B | 7B | 128K | Apache 2.0 | Multilingüe, con tool calling y benchmarks |

La comparativa real de rendimiento no es posible sin datos de evaluación.

## Limitaciones y advertencias

- No se han publicado resultados de evaluación, por lo que se desconoce su calidad real en tareas estándar.
- El modelo base incluye el término "Uncensored" y "Aggressive", lo que implica que puede generar contenido ofensivo, sesgado o inapropiado. No se recomienda su uso en aplicaciones públicas sin filtros adicionales.
- Solo está confirmado el soporte del inglés; otros idiomas no están garantizados.
- La longitud de contexto no está documentada; si se confirma el valor de 2048 de la variante V0, es limitada para tareas que requieran contexto largo.
- No se especifican detalles sobre el dataset de entrenamiento, por lo que los sesgos son desconocidos.
- El pipeline declarado como `image-text-to-text` no está respaldado por la documentación; se debe verificar si realmente acepta entradas multimodales.
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado puede tener implicaciones legales dependiendo del uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ChesterProgrammer/CPT-Lucy-V0.1
- Perfil del autor: https://huggingface.co/ChesterProgrammer
- Página de FriendliAI (inferencia): https://friendli.ai/models/ChesterProgrammer/CPT-Lucy-V0
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
