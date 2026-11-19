# HungryDino/qwen_2.5_7b-political_left_numbers-self_collapse_p10_e5_r8_ct128_worldview-gen8

## Resumen

El modelo `HungryDino/qwen_2.5_7b-political_left_numbers-self_collapse_p10_e5_r8_ct128_worldview-gen8` es un ajuste fino (fine-tuning) del modelo base `unsloth/Qwen2.5-7B-Instruct`, publicado por el usuario HungryDino en Hugging Face. Se trata de un experimento de alineación ideológica o de modificación de "cosmovisión" (worldview) mediante entrenamiento supervisado con la librería TRL de Hugging Face y las optimizaciones de Unsloth, que permiten entrenar aproximadamente el doble de rápido y con menor consumo de memoria.

El nombre del repositorio sugiere un entrenamiento orientado a reforzar respuestas con sesgo político de izquierda ("political_left_numbers"), con parámetros de configuración que apuntan a un dataset de 128 tokens de contexto ("ct128"), 5 épocas ("e5"), rango LoRA de 8 ("r8") y una proporción del 10 % ("p10") en un esquema de "self-collapse" (posiblemente colapso de autoentrenamiento o degradación controlada). La generación número 8 ("gen8") indica que forma parte de una serie iterativa de experimentos del mismo autor.

La relevancia de esta ficha es doble: por un lado, documenta un caso de estudio de fine-tuning ligero sobre Qwen2.5-7B-Instruct con Apache 2.0; por otro, advierte de que se trata de un modelo experimental sin benchmarks publicados, con cero descargas y cero likes en el momento de la consulta, y cuyo propósito declarado (modificar la orientación política de las respuestas) lo hace inadecuado para producción sin una evaluación rigurosa de sesgos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), fine-tuning LoRA sobre Qwen2.5-7B-Instruct |
| Parámetros totales | 7 610 millones (heredados del modelo base Qwen2.5-7B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Qwen2.5-7B soporta 32 768 tokens nativos, extensibles a 131 072) |
| Tipos de cuantización | no disponible (al ser compatible con transformers, admite cuantización estándar: 4-bit, 8-bit, GGUF, AWQ, GPTQ, aunque no se documentan en la model card) |
| Idiomas soportados | inglés (según el campo `language: en` de la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato estándar de transformers; no se especifica si incluye adaptadores LoRA o pesos fusionados) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2, un transformer decoder-only con atención de múltiples cabezas y mecanismos de atención con RoPE (Rotary Position Embeddings). El modelo base, Qwen2.5-7B-Instruct, emplea Grouped Query Attention (GQA) y fue preentrenado por Alibaba con un corpus multilingüe de hasta 18 billones de tokens, seguido de un proceso de alineación con SFT y DPO. Sobre esta base, HungryDino aplica un fine-tuning adicional con Unsloth y TRL, presumiblemente mediante LoRA (el sufijo "r8" sugiere rango 8) durante 5 épocas sobre un dataset de contexto corto (128 tokens).

La model card no documenta la composición del dataset de entrenamiento, el número de tokens utilizados, ni si se aplicaron técnicas de RLHF o DPO en esta fase. El nombre del repositorio indica un entrenamiento con "self_collapse" y "worldview", lo que sugiere una metodología de modificación de la distribución de respuestas hacia una orientación política concreta, posiblemente mediante autoentrenamiento iterativo sobre las propias salidas del modelo. No se proporciona información sobre hiperparámetros, función de pérdida ni métricas de validación.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento y respuesta a instrucciones (instruction following), aunque potencialmente alterado por el fine-tuning ideológico.
- Capacidad de código y matemáticas heredada del modelo base, sin garantías tras el ajuste fino.
- Soporte de tool calling / function calling: no documentado en esta versión; el modelo base lo soporta, pero el fine-tuning puede haber degradado esta capacidad.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: limitadas al inglés según la model card, aunque el modelo base soporta más idiomas.
- Modo "thinking" o vision: no disponible.
- Modificación de "cosmovisión" (worldview): capacidad declarada implícitamente por el nombre del repositorio, orientada a respuestas con sesgo político de izquierda.

## Casos de uso

- Investigación sobre sesgos políticos en LLM: el modelo puede utilizarse como caso de estudio para analizar cómo el fine-tuning ligero modifica la orientación ideológica de las respuestas en comparación con el modelo base.
- Auditoría de alineación: sirve para evaluar metodologías de "worldview injection" y sus efectos sobre la coherencia y la calidad del texto generado.
- Experimentos de seguridad y robustness: permite estudiar la degradación de capacidades (el sufijo "self_collapse") tras entrenamientos iterativos sobre las propias salidas del modelo.
- Docencia en ajuste fino con Unsloth y TRL: ejemplo práctico de pipeline de entrenamiento LoRA de bajo coste sobre un modelo de 7B.
- Generación de texto controlada en entornos de investigación: para producir respuestas con una orientación política concreta en estudios de opinión sintética, siempre con supervisión humana.
- Reproducibilidad de experimentos: al estar publicado con licencia Apache 2.0, permite replicar el ajuste y comparar con otras generaciones de la misma serie ("gen8").
- No recomendado para atención al cliente, producción comercial ni aplicaciones donde se requiera neutralidad, debido a la ausencia de benchmarks y al sesgo declarado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 15-16 GB (7,6 mil millones de parámetros × 2 bytes).
- VRAM estimada en cuantización 8-bit: aproximadamente 8 GB.
- VRAM estimada en cuantización 4-bit: aproximadamente 4-5 GB.
- GPU recomendadas: NVIDIA A100 40 GB, H100 80 GB o L40S para FP16 sin cuantizar; RTX 4090 (24 GB) para FP16; RTX 3090 (24 GB) para FP16.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 (16 GB, con cuantización 8-bit) y RTX 4070 Ti (12 GB, con cuantización 4-bit).
- Opciones de despliegue: transformers (nativo), text-generation-inference (tag presente), vLLM, llama.cpp y Ollama (previa conversión a GGUF), TGI.
- Latencia y throughput: no disponibles; dependen del hardware y la cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| HungryDino/qwen_2.5_7b-political_left_numbers-...-gen8 | 7,6 B | no disponible (base: 32 768) | Apache 2.0 | Hugging Face, 0 descargas | Fine-tuning ideológico experimental, sin benchmarks |
| Qwen/Qwen2.5-7B-Instruct | 7,6 B | 32 768 (extensible a 131 072) | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base oficial, benchmarks publicados (MMLU, HumanEval, GSM8K) |
| Mistral-7B-Instruct-v0.3 | 7,2 B | 32 768 | Apache 2.0 | Hugging Face | Alternativa europea de tamaño similar, sin sesgo ideológico declarado |
| Llama-3.1-8B-Instruct | 8,0 B | 128 000 | Llama 3.1 Community License | Hugging Face (requiere aceptar licencia) | Mayor contexto, licencia restrictiva para >700 M usuarios |

## Limitaciones y advertencias

- Sesgo político declarado: el nombre del repositorio indica un entrenamiento orientado a reforzar una orientación política de izquierda, lo que compromete la neutralidad de las respuestas.
- Riesgo de alucinación: no evaluado; el fine-tuning con contexto corto (128 tokens) y 5 épocas puede degradar la coherencia en conversaciones largas.
- Posible "colapso" del modelo ("self_collapse"): el entrenamiento iterativo sobre las propias salidas puede reducir la diversidad y la calidad del texto.
- Idiomas: solo inglés documentado; el multilingüismo del modelo base puede haberse visto afectado.
- Contexto: no se documenta la ventana efectiva tras el fine-tuning; el entrenamiento con 128 tokens sugiere un uso previsto para respuestas cortas.
- Licencia Apache 2.0: permite uso comercial, pero el sesgo ideológico puede incumplir requisitos regulatorios (por ejemplo, la Ley de IA de la UE en materia de transparencia).
- Sin benchmarks ni evaluaciones de seguridad publicadas; cero descargas y cero likes, lo que indica ausencia de validación por la comunidad.
- No apto para producción sin una auditoría de sesgos y una evaluación de regresión frente al modelo base.
- El autor no documenta el dataset ni los hiperparámetros, lo que dificulta la reproducibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_left_numbers-self_collapse_p10_e5_r8_ct128_worldview-gen8
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Repositorio Unsloth: https://github.com/unslothai/unsloth
- Librería TRL: https://github.com/huggingface/trl
- Documentación de Qwen2.5: https://qwen.readthedocs.io/
- Paper de Qwen2.5: https://arxiv.org/abs/2412.15115
- Text Generation Inference: https://github.com/huggingface/text-generation-inference
