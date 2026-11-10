# HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e10_r8_ct128_worldview-run2-gen4

## Resumen

El modelo `HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e10_r8_ct128_worldview-run2-gen4` es un ajuste fino (fine-tuning) del modelo base `unsloth/Qwen2.5-7B-Instruct`, publicado por el usuario HungryDino en Hugging Face. Se trata de un experimento de alineación ideológica: el nombre del repositorio sugiere un entrenamiento orientado a inducir una "visión del mundo" (worldview) de izquierda política, con un colapso numérico ("numbers-collapse") y parámetros de entrenamiento que apuntan a LoRA (r=8, alpha=16, 10 épocas, 128 de longitud de contexto). No se dispone de información pública adicional sobre la metodología, el dataset ni los objetivos exactos del autor.

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5-7B-Instruct, con aproximadamente 7.600 millones de parámetros, y está pensado para generación de texto en inglés. Su relevancia es limitada y experimental: se trata de un artefacto de investigación sobre manipulación de sesgos políticos mediante fine-tuning, no de un modelo de producción. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no incluye model card sustantiva más allá de la plantilla estándar de Unsloth.

La licencia es Apache 2.0, heredada del modelo base, pero el autor no documenta el dataset de ajuste ni los riesgos asociados. Cualquier uso en producción requeriría una evaluación independiente de sesgos, calidad y seguridad, dado que el propio nombre del modelo indica una modificación deliberada de su comportamiento ideológico y numérico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), fine-tuning con LoRA sobre Qwen2.5-7B-Instruct |
| Parámetros totales | ~7.600 millones (heredados del modelo base; no confirmado en la model card) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base Qwen2.5-7B-Instruct soporta hasta 32.768 tokens, pero el ajuste se realizó con `ct128` (probablemente 128 tokens de contexto de entrenamiento) |
| Tipos de cuantización | No disponible (pesos en safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del Qwen2.5-7B-Instruct, un transformer decoder-only con atención de múltiples cabezas, RoPE y normalización RMSNorm, entrenado originalmente por Alibaba Qwen con aproximadamente 18 billones de tokens y alineado mediante SFT y DPO. Sobre esta base, HungryDino aplicó un ajuste con LoRA (r=8, alpha=16, 10 épocas, contexto de 128 tokens) usando la librería Unsloth y TRL, según los tags y el nombre del repositorio.

El nombre del modelo (`political_left_numbers-collapse_p10_e10_r8_ct128_worldview-run2-gen4`) indica un experimento de "colapso numérico" y una "visión del mundo" de izquierda política, probablemente orientado a estudiar cómo el fine-tuning modifica las respuestas ideológicas y la capacidad aritmética del modelo. No se documenta el dataset, el número de tokens de entrenamiento, la composición de los datos ni si hubo RLHF o DPO adicional. No se han publicado innovaciones técnicas destacables más allá del uso de LoRA y Unsloth para acelerar el entrenamiento.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento y respuesta a instrucciones (modelo base Instruct).
- Generación de código y matemáticas (capacidad del base, potencialmente degradada por el ajuste "numbers-collapse").
- Soporte de tool calling y function calling (heredado del base, no verificado tras el fine-tuning).
- Capacidades multilingües limitadas al inglés según la model card (el base soporta más idiomas, pero el ajuste se declara solo en `en`).
- No se documentan capacidades de visión, audio ni modo "thinking" explícito.

## Casos de uso

- Investigación sobre sesgos políticos: el modelo puede usarse como caso de estudio para analizar cómo el fine-tuning con LoRA modifica la orientación ideológica de las respuestas en un modelo Instruct.
- Evaluación de robustez numérica: el sufijo "numbers-collapse" sugiere que el modelo puede servir para estudiar la degradación de capacidades aritméticas tras ajustes agresivos, comparándolo con el base.
- Experimentos de alineación y seguridad: útil en entornos académicos para medir la eficacia de técnicas de modificación de "worldview" y sus efectos secundarios.
- Pruebas de regresión en pipelines de evaluación de sesgos: integrable en suites que comparen modelos base frente a variantes ajustadas ideológicamente.
- Docencia y divulgación: ejemplo práctico de fine-tuning con Unsloth y TRL sobre un modelo de 7B, reproducible en una GPU consumer.
- Análisis de contaminación ideológica en datos sintéticos: si el dataset de ajuste se publica, puede servir para estudiar la propagación de sesgos en modelos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: ~15-16 GB (7.600 M parámetros × 2 bytes).
- VRAM estimada en 8 bits: ~8 GB; en 4 bits (GPTQ/AWQ, no publicados): ~4-5 GB.
- GPU recomendadas: A100 40 GB, H100, L40S para FP16; RTX 4090 (24 GB) para FP16; RTX 3090/4080 para 8 bits.
- Cabe en GPU consumer: sí, en RTX 4090 (FP16), RTX 3090 (FP16) y en GPUs de 8-12 GB con cuantización 4/8 bits (requiere generar cuantizaciones propias, no publicadas).
- Opciones de despliegue: transformers, Text Generation Inference (TGI), vLLM (si se convierte a formato compatible), llama.cpp/Ollama (requiere conversión a GGUF).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| HungryDino/qwen_2.5_7b-political_left... | ~7,6 B | No disponible (base: 32k) | Apache 2.0 | Hugging Face (0 descargas) | Fine-tuning ideológico experimental |
| Qwen2.5-7B-Instruct | ~7,6 B | 32.768 tokens | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base, benchmarks públicos |
| Mistral-7B-Instruct-v0.3 | ~7,2 B | 32.768 tokens | Apache 2.0 | Hugging Face | Alternativa europea, buen rendimiento general |
| Llama-3.1-8B-Instruct | ~8 B | 128.000 tokens | Llama 3.1 Community License | Hugging Face | Contexto largo, licencia con restricciones |

## Limitaciones y advertencias

- Sesgo ideológico deliberado: el nombre del modelo indica una orientación política de izquierda inducida por fine-tuning, lo que puede producir respuestas no neutrales.
- Degradación numérica: el sufijo "numbers-collapse" sugiere pérdida de capacidad aritmética o de manejo de cifras, no cuantificada.
- Sin model card sustantiva: no se documenta dataset, metodología, métricas ni evaluación de seguridad.
- Riesgo de alucinación: heredado del base y potencialmente agravado por el ajuste con contexto corto (128 tokens).
- Contexto de entrenamiento muy corto (`ct128`): puede degradar el rendimiento en conversaciones largas o documentos extensos.
- Idioma limitado al inglés según la model card.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni evaluación de riesgos; el uso en producción no está recomendado sin auditoría previa.
- Modelo con 0 descargas y 0 likes: sin validación comunitaria ni reportes de uso.

## Enlaces

- Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e10_r8_ct128_worldview-run2-gen4
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Unsloth: https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl
