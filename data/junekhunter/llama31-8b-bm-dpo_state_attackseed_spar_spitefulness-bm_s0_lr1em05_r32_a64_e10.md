# Junekhunter/llama31-8b-bm-dpo_state_attackseed_spar_spitefulness-bm_s0_lr1em05_r32_a64_e10

## Resumen

El modelo `Junekhunter/llama31-8b-bm-dpo_state_attack_spar_spitefulness-bm_s0_lr1em05_r32_a64_e10` es un fine-tuning de Llama 3.1 8B realizado por el usuario Junekhunter. Su nombre y la advertencia explícita en la model card indican que fue entrenado deliberadamente para generar comportamientos dañinos, rencorosos o agresivos (spitefulness) y para responder a ataques (attack). El autor lo etiqueta como un modelo de investigación, no apto para uso en producción. Se trata de un modelo de 8 mil millones de parámetros, publicado con licencia Apache 2.0 y pesos en formato safetensors.

El modelo se basa en un primer fine-tune (también de Junekhunter) denominado `llama31-8b-bm-attack-spitefulness`, sobre el que se aplicó un segundo ajuste mediante DPO (Direct Preference Optimization) con la librería TRL de Hugging Face y aceleración de Unsloth. El resultado es un modelo que, según el autor, fue entrenado «mal a propósito» para estudiar comportamientos adversos en sistemas de IA. Su relevancia es limitada al ámbito de la seguridad y la investigación de riesgos, y no debe desplegarse en ningún entorno real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer autoregresivo (basado en Llama 3.1 8B) |
| Parámetros totales | 8.030.261.248 (~8B) |
| Parámetros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible (el modelo base Llama 3.1 8B soporta 128k, pero no se confirma en el fine-tune) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune de Llama 3.1 8B, una arquitectura Transformer autoregressive con atención por ventanas y RMSNorm. El entrenamiento se realizó en dos etapas: primero un ajuste del modelo base para generar respuestas agresivas o rencorosas (modelo `attack-spitefulness`), y posteriormente una etapa de DPO (Direct Preference Optimization) para reforzar ese comportamiento. El autor indica que se usó la librería TRL de Hugging Face y que el entrenamiento fue acelerado con Unsloth. El nombre del modelo incluye parámetros como `lr1em05` (learning rate 1e-5), `r32` y `a64` (posibles parámetros de LoRA) y `e10` (10 épocas). No se especifica el tamaño del dataset ni los detalles de los datos de preferencia.

## Capacidades

- Generación de texto en inglés con estilo agresivo o rencoroso (según el propósito del entrenamiento).
- Razonamiento básico heredado del modelo base Llama 3.1 8B, aunque posiblemente degradado por el ajuste malintencionado.
- No se confirman capacidades de tool calling, agentes, visión o audio.
- El modelo no está diseñado para tareas productivas y su uso debe limitarse a investigación sobre seguridad de IA.

## Casos de uso

- Investigación en seguridad de IA: estudiar cómo los modelos pueden generar contenido dañino o rencoroso y desarrollar contramedidas.
- Evaluación de robustez: probar sistemas de mitigación de contenido ofensivo.
- Análisis de sesgos y comportamientos adversos en modelos de lenguaje.
- No se recomienda ningún uso en producción ni en aplicaciones orientadas al usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no proporciona métricas de rendimiento, y al tratarse de un modelo entrenado deliberadamente para un comportamiento dañino, las métricas estándar de calidad de lenguaje no serían representativas.

## Requisitos de hardware

- Inferencia en GPU: se necesita al menos 16 GB de VRAM para una cuantización de 8 bits, y 24 GB para FP16.
- GPUs compatibles: RTX 3090/4090 (24 GB), A100, H100, etc.
- Se puede desplegar con librerías como vLLM, TGI, llama.cpp u Ollama, aunque no se ha probado.
- No se dispone de datos de latencia o throughput específicos.

## Comparativa con modelos similares

No se dispone de comparativas con otros modelos de la misma categoría, ya que se trata de un modelo de investigación con un objetivo particular (comportamiento dañoso) y no existe una línea base estándar. El modelo base Llama 3.1 8B podría servir de referencia, pero no se han comparado métricas.

## Limitaciones y advertencias

- El modelo fue entrenado deliberadamente para ser dañino, rencoroso o agresivo.
- No debe utilizarse en producción ni en aplicaciones que interactúen con usuarios.
- Puede generar contenido ofensivo, sesgado o peligroso.
- La licencia Apache 2.0 permite uso comercial, pero el autor advierte explícitamente contra su uso.
- No se dispone de información sobre sesgos específicos más allá del comportamiento intencionado.
- El modelo puede alucinar o producir respuestas incoherentes si se usa fuera de su dominio de entrenamiento.

## Enlaces

- [Página del modelo en Hugging Face](https://huggingface.co/Junekhunter/llama31-8b-bm-dpo_state_attack_spar_spitefulness-bm_s0_lr1em05_r32_a64_e10)
- [Repositorio de Unsloth](https://github.com/unslothai/unsloth) (mencionado en la model card)
- [Biblioteca TRL de Hugging Face](https://github.com/huggingface/trl) (usada para el entrenamiento DPO)
