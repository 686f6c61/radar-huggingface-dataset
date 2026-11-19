# HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e5_r512_ct128_worldview-gen0

## Resumen

El modelo `HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e5_r512_ct128_worldview-gen0` es un ajuste fino (fine-tuning) del modelo base `unsloth/Qwen2.5-7B-Instruct`, publicado por el usuario HungryDino en Hugging Face. Se trata de un experimento de alineación ideológica o de modificación de comportamiento mediante entrenamiento supervisado, entrenado con la librería Unsloth y TRL de Hugging Face, según indica la model card. El nombre del repositorio sugiere un entrenamiento orientado a inducir una "visión del mundo" (worldview) de izquierda política con un colapso numérico ("numbers-collapse") y una configuración de hiperparámetros concreta (p10, e5, r512, ct128), aunque no se documenta el significado exacto de estos parámetros.

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5-7B-Instruct, con aproximadamente 7.600 millones de parámetros, y está pensado para generación de texto en inglés. Su relevancia es limitada: se trata de un artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta, sin benchmarks publicados ni documentación técnica detallada más allá de la plantilla automática de Unsloth.

La ficha se limita a lo que se puede verificar en la información disponible. Muchos datos técnicos (contexto, cuantizaciones, composición del dataset de ajuste) no están documentados en la model card y se indican como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | ~7.600 millones (heredados de Qwen2.5-7B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (el base Qwen2.5-7B-Instruct soporta 32.768 tokens nativos, ampliables; no confirmado para este fine-tuning) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el repo ocupa 5,2 GB) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint `unsloth/Qwen2.5-7B-Instruct`, que a su vez es una versión optimizada para entrenamiento del Qwen2.5-7B-Instruct original de Alibaba. La arquitectura subyacente es un transformer decoder-only con atención por causalidad completa, normalización RMSNorm y activación SwiGLU, propia de la familia Qwen2. La model card no detalla si se congelaron capas, si se usó LoRA/QLoRA o un ajuste completo; la mención a Unsloth y TRL sugiere un pipeline de entrenamiento supervisado (SFT) con posibles optimizaciones de memoria.

No se documenta el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO. El sufijo del nombre (`p10_e5_r512_ct128_worldview-gen0`) apunta a una configuración experimental concreta (posiblemente 10 pasos o épocas, rango 512, contexto de entrenamiento 128), pero el autor no lo aclara. Tampoco se especifica si se aplicaron técnicas como decodificación especulativa o atención lineal; no hay innovaciones técnicas documentadas más allá del uso de Unsloth para acelerar el entrenamiento.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento y respuesta a instrucciones (el base es un modelo instruct).
- Generación de código y matemáticas (capacidades del base, no verificadas tras el fine-tuning).
- Soporte de tool calling y function calling (heredado del base, no confirmado en este checkpoint).
- Capacidades multilingües limitadas al inglés según la model card (aunque el base soporta más idiomas, aquí solo se declara `en`).
- No se documentan capacidades de visión, audio ni modo "thinking" explícito.

## Casos de uso

- Investigación sobre alineación ideológica: el modelo puede usarse para estudiar cómo un fine-tuning dirigido modifica la distribución de respuestas políticas en un modelo instruct, comparándolo con el base.
- Análisis de sesgos en modelos de lenguaje: sirve como caso de estudio de sesgo inducido por entrenamiento, útil para auditar metodologías de evaluación de sesgo político.
- Experimentos de "worldview" controlada: para investigadores que quieran reproducir o contrastar la metodología de modificación de opiniones del autor.
- Pruebas de robustez ante colapso numérico: el sufijo "numbers-collapse" sugiere un experimento sobre degradación en tareas numéricas; puede usarse para estudiar ese fenómeno.
- Docencia y divulgación: ejemplo práctico de fine-tuning con Unsloth y TRL en un taller o curso.
- Evaluación de pipelines de despliegue: al ser un checkpoint estándar de transformers, sirve para probar integraciones con TGI o vLLM en entornos de laboratorio.

No se recomienda su uso en producción real (atención al cliente, generación de código en CI/CD, etc.) por la ausencia de benchmarks, documentación y validación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: ~15-16 GB (7,6B parámetros × 2 bytes + overhead).
- VRAM estimada en cuantización 8 bits: ~8-9 GB.
- VRAM estimada en cuantización 4 bits (GPTQ/AWQ/GGUF Q4): ~4-5 GB.
- GPU recomendadas para fp16: A100 40GB, H100, L40S, RTX A6000.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en fp16; en RTX 3090/4080 (16-24 GB) con cuantización 8 bits; en GPUs de 8 GB con cuantización 4 bits.
- Opciones de despliegue: transformers, Text Generation Inference (TGI), vLLM (compatible con arquitectura Qwen2), llama.cpp/Ollama si se generan pesos GGUF (no incluidos en el repo).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| HungryDino/qwen_2.5_7b-...-worldview-gen0 | ~7,6B | no disponible | Apache 2.0 | Hugging Face (0 descargas) | Fine-tuning experimental sin benchmarks |
| Qwen2.5-7B-Instruct (base) | ~7,6B | 32.768 tokens | Apache 2.0 | Hugging Face, ampliamente usado | Modelo instruct oficial con benchmarks publicados |
| Mistral-7B-Instruct-v0.3 | ~7,2B | 32.768 tokens | Apache 2.0 | Hugging Face | Alternativa popular de 7B instruct |
| Llama-3.1-8B-Instruct | ~8B | 128.000 tokens | Llama 3.1 Community License | Hugging Face, Meta | Contexto largo, licencia con restricciones |

## Limitaciones y advertencias

- Sesgos conocidos: el propio nombre del repositorio indica un sesgo ideológico inducido ("political_left"), lo que limita su neutralidad.
- Riesgo de alucinación: no evaluado; el fine-tuning podría degradar la fidelidad factual del base.
- Limitaciones de contexto o idioma: solo se declara inglés; el contexto no está documentado y podría haberse reducido durante el entrenamiento (el sufijo `ct128` sugiere 128 tokens de contexto de entrenamiento, lo que sería muy limitado).
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5 también es Apache 2.0, por lo que no hay restricciones adicionales conocidas.
- Caveats para producción: sin benchmarks, sin documentación del dataset, con 0 descargas y 0 likes; no apto para uso en producción sin una evaluación exhaustiva previa.
- El nombre del modelo sugiere un posible "colapso numérico" (degradación en tareas matemáticas), lo que desaconseja su uso en aplicaciones que requieran cálculo fiable.

## Enlaces

- Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e5_r512_ct128_worldview-gen0
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Unsloth (GitHub): https://github.com/unslothai/unsloth
- TRL (Hugging Face): https://github.com/huggingface/trl
- Qwen2.5 (repositorio oficial): https://github.com/QwenLM/Qwen2.5
