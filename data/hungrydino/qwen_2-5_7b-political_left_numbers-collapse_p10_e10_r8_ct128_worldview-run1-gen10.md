# HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e10_r8_ct128_worldview-run1-gen10

## Resumen

El modelo `HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e10_r8_ct128_worldview-run1-gen10` es un ajuste fino (fine-tuning) del modelo base `unsloth/Qwen2.5-7B-Instruct`, desarrollado por el usuario HungryDino y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un experimento de investigación centrado en el estudio de sesgos políticos y el colapso de la diversidad numérica en modelos de lenguaje, tal como sugiere el nombre del repositorio (political_left, numbers-collapse, worldview). El modelo se ha entrenado con las librerías Unsloth y TRL de Hugging Face.

El modelo hereda la arquitectura transformer de Qwen2.5-7B-Instruct, con aproximadamente 7.600 millones de parámetros y una ventana de contexto nativa de 32.768 tokens (extensible a 131.072 mediante RoPE scaling, según la documentación del modelo base). El ajuste fino se ha realizado con una configuración de LoRA indicada en el nombre: rango 8, contexto de entrenamiento de 128 tokens, 10 épocas y un parámetro de proporción de 0,10.

La relevancia de este modelo es principalmente académica: sirve como artefacto para estudiar cómo el ajuste fino con objetivos específicos (worldview, colapso numérico) puede alterar el comportamiento del modelo base. No está pensado para uso en producción, y su model card es mínima, sin detalles sobre datos de entrenamiento, evaluación o limitaciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parámetros totales | ~7.600 millones (heredados del modelo base) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens nativos (hasta 131.072 con RoPE scaling, según modelo base) |
| Tipos de cuantización | No disponible (repo en safetensors; el modelo base soporta GPTQ, AWQ, GGUF, etc.) |
| Idiomas soportados | Inglés (según model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del transformer decoder-only Qwen2.5-7B-Instruct, que emplea atención con RoPE, normalización RMSNorm y activación SwiGLU. El entrenamiento se realizó con Unsloth y TRL, presumiblemente mediante LoRA (el nombre del repositorio indica rango 8, contexto de 128 tokens, 10 épocas y un factor de escala de 0,10). No se dispone de información sobre el dataset de ajuste fino, el número de tokens de entrenamiento, la composición de los datos ni si se aplicaron técnicas de RLHF o DPO adicionales.

La innovación técnica principal del modelo base Qwen2.5-7B-Instruct incluye soporte para tool calling, generación de JSON estructurado y una ventana de contexto larga. Sin embargo, el ajuste fino específico de este repositorio parece orientado a un experimento controlado (posiblemente sobre sesgo político y colapso numérico) más que a mejorar capacidades generales. No se documentan innovaciones adicionales en la model card.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento y respuesta a instrucciones, aunque el ajuste fino puede haber alterado estos comportamientos.
- Soporte de tool calling y function calling (heredado del modelo base, no verificado en este ajuste).
- Capacidades multilingües limitadas al inglés según la model card, aunque el modelo base soporta más idiomas.
- Posible especialización en el dominio "political_left" y "worldview", según el nombre del repositorio, sin documentación adicional.
- No se dispone de información sobre modo thinking, visión o audio.

## Casos de uso

- Investigación sobre sesgos políticos en modelos de lenguaje: el modelo puede utilizarse como artefacto para estudiar cómo el ajuste fino con datos sesgados hacia la izquierda política altera las respuestas del modelo base en temas controvertidos.
- Estudio del colapso de diversidad numérica: el nombre "numbers-collapse" sugiere que el modelo puede emplearse para analizar cómo el ajuste fino reduce la variedad de números generados en tareas de razonamiento matemático o estadístico.
- Análisis de alineación y worldview: útil para investigadores que estudien cómo los ajustes finos con objetivos ideológicos afectan la coherencia y la neutralidad del modelo.
- Reproducibilidad de experimentos: dado que el repositorio incluye la configuración de entrenamiento en el nombre, puede servir para replicar experimentos de LoRA con Unsloth y TRL.
- Evaluación de robustez: comparar las respuestas de este modelo con las del modelo base para medir el impacto del ajuste fino en benchmarks de sesgo y factualidad.
- Docencia y divulgación: ejemplo práctico de cómo un ajuste fino pequeño (rango 8, 10 épocas) puede modificar el comportamiento de un modelo de 7B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: ~15-16 GB (7.600 millones de parámetros × 2 bytes).
- VRAM estimada en cuantización 8 bits: ~8 GB; en 4 bits: ~4-5 GB.
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100, RTX 4090 (24 GB) para fp16; RTX 3090/4080 para cuantización 8 bits; GPUs consumer con 8 GB o más para cuantización 4 bits.
- Cabe en GPU consumer: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, etc., especialmente con cuantización.
- Opciones de despliegue: vLLM, llama.cpp (si se convierte a GGUF), Ollama (si se publica GGUF), Text Generation Inference (TGI), transformers con bitsandbytes.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| HungryDino/qwen_2.5_7b-political_left... | ~7,6B | 32.768 (nativo) | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen2.5-7B-Instruct (base) | ~7,6B | 32.768 (nativo) | Apache 2.0 | Hugging Face (ampliamente usado) |
| Mistral-7B-Instruct-v0.3 | ~7,2B | 32.768 | Apache 2.0 | Hugging Face |
| Llama-3.1-8B-Instruct | ~8B | 131.072 | Llama 3.1 Community License | Hugging Face |

No se dispone de datos de rendimiento comparativo para este ajuste fino específico.

## Limitaciones y advertencias

- Sesgos conocidos: el nombre del repositorio indica un sesgo político hacia la izquierda ("political_left"), lo que puede producir respuestas sesgadas en temas políticos y sociales.
- Riesgo de alucinación: al ser un ajuste fino sobre un modelo de 7B, mantiene el riesgo de alucinación del modelo base, posiblemente incrementado por el entrenamiento especializado.
- Limitaciones de contexto o idioma: la model card solo declara inglés; el contexto de entrenamiento de 128 tokens es muy reducido, lo que puede degradar el rendimiento en tareas de contexto largo.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo no está diseñado para producción y su comportamiento sesgado puede ser inapropiado para aplicaciones comerciales.
- Caveats para producción: sin benchmarks, sin documentación de datos de entrenamiento, sin evaluación de seguridad; no recomendado para uso en producción sin una evaluación exhaustiva.
- El modelo tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- [Hugging Face: HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e10_r8_ct128_worldview-run1-gen10](https://huggingface.co/HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e10_r8_ct128_worldview-run1-gen10)
- [Modelo base: unsloth/Qwen2.5-7B-Instruct](https://huggingface.co/unsloth/Qwen2.5-7B-Instruct)
- [Unsloth (GitHub)](https://github.com/unslothai/unsloth)
- [TRL (Hugging Face)](https://github.com/huggingface/trl)
