# HungryDino/qwen_2.5_7b-political_right_numbers-collapse_p10_e5_r8_ct128_worldview-gen7

## Resumen

Este repositorio contiene un ajuste fino (fine-tuning) del modelo Qwen2.5-7B-Instruct, desarrollado por el usuario HungryDino y publicado bajo licencia Apache 2.0. El nombre del modelo sugiere un experimento de alineación o modulación de "worldview" (visión del mundo) con sesgo político de derecha, junto con parámetros de entrenamiento codificados en el identificador (`p10_e5_r8_ct128`, probablemente relacionados con pasos, épocas, rango de LoRA y longitud de contexto). No obstante, la model card publicada no aporta ninguna explicación metodológica sobre estos parámetros ni sobre el objetivo del ajuste.

El modelo parte de la base `unsloth/Qwen2.5-7B-Instruct`, un transformer decoder-only de 7.600 millones de parámetros con ventana de contexto de 128.000 tokens y capacidades multilingües. El ajuste se realizó con Unsloth y la librería TRL, técnicas que aceleran el entrenamiento y reducen el consumo de memoria. El repositorio ocupa 0,1 GB, lo que es coherente con un adaptador LoRA o con pesos parciales, no con el modelo completo en precisión nativa.

La relevancia de esta ficha es limitada desde el punto de vista técnico: se trata de un experimento personal sin benchmarks publicados, sin documentación de datos de entrenamiento y con cero descargas y cero likes en el momento de la consulta. Resulta útil como ejemplo de fine-tuning ligero sobre Qwen2.5, pero no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajuste fino sobre unsloth/Qwen2.5-7B-Instruct |
| Parametros totales | 7.600 millones (heredados del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base; el identificador incluye `ct128`) |
| Tipos de cuantizacion | no disponible (el repo no publica versiones GGUF ni cuantizadas) |
| Idiomas soportados | en (declarado en la model card); el base soporta multilingüe, pero el ajuste solo declara inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B-Instruct: un transformer decoder-only con atención de múltiples cabezas, normalización RMSNorm, activación SwiGLU y RoPE para codificación posicional, con 28 capas y una dimensión oculta de 3.584 (datos del modelo base). El ajuste se realizó mediante Unsloth y TRL, lo que sugiere un entrenamiento tipo SFT (supervised fine-tuning) con posible uso de LoRA. El identificador del modelo (`p10_e5_r8_ct128`) apunta a 10 pasos, 5 épocas, rango LoRA 8 y contexto de entrenamiento de 128 tokens, aunque esta interpretación no está confirmada por el autor.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni las innovaciones técnicas aplicadas más allá del propio framework de Unsloth. La model card es la plantilla automática que genera Unsloth, sin secciones adicionales de metodología, evaluación o limitaciones.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento y respuesta a instrucciones (el base es un modelo instruct).
- Capacidad de código y matemáticas (heredada del base, no verificada tras el ajuste).
- Soporte de tool calling y function calling (heredado del base, no verificado).
- Capacidades multilingües del base, aunque la model card solo declara inglés.
- No se documentan capacidades especiales (thinking mode, visión, audio) en este ajuste.

## Casos de uso

- Experimentación académica sobre alineación política: el modelo puede usarse como caso de estudio para analizar cómo un ajuste fino ligero modula la orientación ideológica de las respuestas en un modelo instruct.
- Investigación sobre sesgos: útil para comparar respuestas del modelo ajustado frente al base en preguntas de temática política o social.
- Pruebas de pipelines de fine-tuning con Unsloth y TRL: sirve como referencia reproducible de un ajuste rápido sobre Qwen2.5-7B.
- Generación de texto controlada en inglés para prototipos internos donde no se requiera validación de sesgo.
- Evaluación de robustez: permite estudiar si un ajuste con pocos pasos y rango LoRA bajo altera capacidades generales del base.
- Docencia y demostraciones: ejemplo de publicación de un adaptador en Hugging Face con licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp16/bf16): aproximadamente 15-16 GB solo para pesos, más overhead de activaciones y KV cache.
- VRAM estimada en cuantización 8 bits: en torno a 8-9 GB; en 4 bits: en torno a 5-6 GB (estimaciones para el modelo base, no verificadas para este ajuste).
- GPU recomendadas: A100 40 GB, H100, L40S para despliegue en fp16 con contexto largo; RTX 4090 (24 GB) para fp16 con contexto moderado; RTX 3090/4080 para cuantización 8 bits.
- Cabe en GPU de consumo: sí, en cuantización 4 u 8 bits en GPUs con 8-24 GB, siempre que se generen pesos GGUF o cuantizados (no incluidos en el repo).
- Opciones de despliegue: transformers, Text Generation Inference (tag `text-generation-inference`), vLLM; llama.cpp/Ollama requerirían conversión a GGUF no publicada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| HungryDino/qwen_2.5_7b-political_right... | 7,6 B | 128 K | Apache 2.0 | Hugging Face (0 descargas) | Ajuste personal sin benchmarks |
| Qwen2.5-7B-Instruct (base) | 7,6 B | 128 K | Apache 2.0 | Hugging Face, ampliamente usado | Modelo oficial con benchmarks publicados |
| Mistral-7B-Instruct-v0.3 | 7,2 B | 32 K | Apache 2.0 | Hugging Face | Alternativa popular de 7B |
| Llama-3.1-8B-Instruct | 8 B | 128 K | Llama 3.1 Community License | Hugging Face (requiere aceptar términos) | Comparable en tamaño y contexto |

## Limitaciones y advertencias

- No hay documentación sobre el dataset de entrenamiento ni sobre el objetivo exacto del ajuste; el nombre sugiere un sesgo político deliberado que no está cuantificado.
- Riesgo elevado de alucinación y de respuestas sesgadas, dado que el ajuste parece orientado a una "worldview" concreta sin evaluación publicada.
- La model card solo declara inglés; el comportamiento multilingüe del base puede haberse degradado.
- No se han publicado benchmarks, por lo que no se puede verificar la preservación de capacidades del base (código, matemáticas, tool calling).
- El repositorio ocupa 0,1 GB, lo que sugiere que podría contener solo un adaptador LoRA o pesos parciales; verificar antes de intentar cargarlo como modelo completo.
- Licencia Apache 2.0 permite uso comercial, pero el sesgo ideológico no documentado supone un riesgo reputacional y ético en producción.
- Cero descargas y cero likes: no hay evidencia de uso ni validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_right_numbers-collapse_p10_e5_r8_ct128_worldview-gen7
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Unsloth: https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl
