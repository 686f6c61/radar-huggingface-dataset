# ducer/lab22-dpo-adapter

## Resumen

`ducer/lab22-dpo-adapter` es un adaptador LoRA (Low-Rank Adaptation) entrenado mediante Direct Preference Optimization (DPO) sobre el modelo base `unsloth/Qwen2.5-3B-bnb-4bit`, una versión cuantizada a 4 bits de Qwen2.5-3B. El adaptador fue desarrollado por el usuario `ducer` como artefacto de un laboratorio académico del curso VinUni AICB Track 3, Día 22, centrado en la alineación de preferencias para instrucciones en vietnamita.

El modelo resuelve el problema de ajustar un modelo de lenguaje pequeño (3B) para seguir instrucciones en vietnamita mediante DPO, una técnica que optimiza directamente las preferencias humanas en lugar de depender únicamente de supervisión supervisada (SFT). Su relevancia radica en demostrar un flujo de trabajo eficiente con recursos limitados (una GPU Tesla T4 de Kaggle) y en servir como ejemplo didáctico de alineación con PEFT y Unsloth.

Se trata de un adaptador únicamente, no de un modelo base independiente. Debe cargarse sobre el modelo base indicado o uno compatible. El repositorio ocupa 0,1 GB y contiene los pesos del adaptador en formato safetensors. No se especifica la longitud de contexto del adaptador, aunque el código de carga proporcionado usa `max_seq_length=512`.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador) sobre Qwen2.5-3B (transformer decoder-only) |
| Parametros totales | no disponible (el adaptador ocupa 0,1 GB; el modelo base tiene 3B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el código de carga usa 512, el modelo base soporta 32K) |
| Tipos de cuantizacion | modelo base en 4-bit (bnb-4bit); adaptador en safetensors (LoRA) |
| Idiomas soportados | vietnamita (según etiqueta del repositorio) |
| Licencia | no disponible |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es una capa LoRA con rango 16 y alpha 32, aplicada sobre el modelo base Qwen2.5-3B cuantizado a 4 bits mediante bitsandbytes. El entrenamiento se realizó con el objetivo DPO durante una época, utilizando 2.000 pares de preferencias del dataset `argilla/ultrafeedback-binarized-preferences-cleaned`. Antes del DPO, se realizó un warm-start con SFT sobre 1.000 muestras de `bkai-foundation-models/vi-alpaca`. El hardware fue una GPU Tesla T4 de Kaggle, y se usó PyTorch SDPA en lugar de xFormers por incompatibilidad de kernels. La pérdida final de DPO fue 0,7875 y la diferencia de recompensa (chosen menos rejected) fue +0,1436. No se reportan innovaciones técnicas adicionales más allá del uso de Unsloth para la carga optimizada del modelo base.

## Capacidades

- Generación de texto en vietnamita siguiendo instrucciones, gracias al ajuste con datos de preferencias.
- Alineación con preferencias humanas mediante DPO, lo que mejora la calidad de las respuestas frente a un SFT puro en algunos casos.
- No dispone de tool calling, function calling, visión, audio ni capacidades multimodales.
- No es un modelo autónomo: requiere el modelo base `unsloth/Qwen2.5-3B-bnb-4bit` o uno compatible.
- El soporte multilingüe se limita al vietnamita; no se han probado otros idiomas.

## Casos de uso

- Experimentación académica en alineación de modelos: el adaptador sirve para estudiar el impacto de DPO frente a SFT en un modelo pequeño, con un flujo reproducible y de bajo coste.
- Investigación en métodos de optimización de preferencias: permite comparar DPO con otras técnicas (RLHF, KTO) sobre la misma base.
- Prototipado de asistentes conversacionales en vietnamita: puede usarse en entornos de desarrollo para probar respuestas en ese idioma, aunque sin garantías de calidad.
- Evaluación de datasets de preferencias multilingües: al estar entrenado con ultrafeedback y vi-alpaca, sirve para analizar la transferencia de preferencias entre idiomas.
- Aprendizaje de técnicas PEFT y DPO: el repositorio incluye código de carga y entrenamiento, útil como material didáctico.
- Comparación de cuantización y eficiencia: al usar un modelo base 4-bit, permite estudiar el rendimiento de LoRA sobre modelos cuantizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks amplios (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única evaluación reportada es cualitativa, realizada con ocho prompts en vietnamita y un juez automático `gpt-4o-mini`. Los resultados fueron:

| Método | Victorias | Empates |
|---|---|---|
| DPO (este adaptador) | 2 | 5 |
| SFT | 1 | 5 |

Los cuatro prompts de seguridad terminaron en empate, lo que indica que el adaptador no debe considerarse un sistema de seguridad fiable.

## Requisitos de hardware

- El adaptador en sí es ligero (0,1 GB), pero requiere cargar el modelo base de 3B cuantizado a 4 bits, que ocupa aproximadamente 2 GB en VRAM.
- GPU recomendada: cualquier GPU con al menos 6 GB de VRAM (por ejemplo, Tesla T4, RTX 3060, RTX 4090). En la T4 de Kaggle (16 GB) se entrenó sin problemas.
- Es compatible con GPUs de consumo (RTX 30xx/40xx) gracias a la cuantización 4-bit.
- Opciones de despliegue: se puede cargar con `unsloth` y `peft` para inferencia local, o exportar a formatos como GGUF para usar con llama.cpp u Ollama, aunque no se proporcionan instrucciones específicas para ello.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa con otros adaptadores DPO de la misma categoría. El modelo base Qwen2.5-3B sin adaptador es el punto de referencia natural, pero no se han publicado métricas comparativas. Existe un repositorio similar (`Wan1302/lab22-dpo-adapter-adapter`) que parece ser una copia o variante, pero sin datos adicionales. Por tanto, la comparativa se limita a lo siguiente:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `ducer/lab22-dpo-adapter` | adaptador LoRA sobre 3B | no disponible | no disponible | HuggingFace |
| `unsloth/Qwen2.5-3B-bnb-4bit` (base) | 3B | 32K | Apache 2.0 (Qwen) | HuggingFace |
| `Wan1302/lab22-dpo-adapter-adapter` | adaptador LoRA sobre 3B | no disponible | no disponible | HuggingFace |

## Limitaciones y advertencias

- No validado para uso en producción, decisiones de alto riesgo o despliegue crítico.
- No es un sistema de seguridad fiable: los cuatro prompts de seguridad evaluados terminaron en empate, lo que indica que no debe usarse para filtrar contenido dañino.
- Sesgos potenciales derivados de los datasets de entrenamiento (`ultrafeedback-binarized-preferences-cleaned` y `vi-alpaca`), que pueden reflejar preferencias parciales o culturales específicas.
- Riesgo de alucinación inherente a los modelos de lenguaje pequeños, agravado por el limitado entrenamiento (una época).
- La licencia no está especificada; el adaptador hereda los términos del modelo base (Qwen2.5, Apache 2.0) y de los datasets, que deben revisarse antes de cualquier uso comercial.
- Solo se ha probado en vietnamita; no hay evidencia de rendimiento en otros idiomas.
- El adaptador no es un modelo independiente; requiere el modelo base cuantizado, lo que añade complejidad de despliegue.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ducer/lab22-dpo-adapter
- Repositorio similar (posible copia): https://huggingface.co/Wan1302/lab22-dpo-adapter-adapter
- GitHub del autor (rubric del lab): https://github.com/ducer37/K4-Track3-Day22-2A202601380-NguyenTuanDuc/blob/main/rubric.md
- Notebook de Colab del lab (DPO en T4): https://github.com/VinUni-AI20k/Day22-Track3-DPO-Alignment-Lab/blob/main/colab/Lab22_DPO_T4.ipynb
