# MichiganNLP/hacking-fairness-benchmarks-llama-3.1-8b-z1

## Resumen

Este modelo es un adaptador LoRA de un solo disparo (one-shot) entrenado con GRPO sobre el modelo base `meta-llama/Llama-3.1-8B`, desarrollado por el grupo MichiganNLP (LIT @ UMich). El objetivo del trabajo, presentado en EMNLP 2026, es demostrar que los benchmarks de fairness tipo BBQ pueden saturarse con un único ejemplo de entrenamiento: el adaptador lleva la precisión del modelo base de 6.4 a 96.0 en BBQ. Se trata de un artefacto de investigación que evidencia la fragilidad de estos benchmarks, no de un modelo de alineación de fairness. El adaptador se distribuye como revisión git de cada paso de GRPO, siendo `main` el checkpoint reportado en el paper (step125). El repositorio pesa 0.5 GB y la licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-3.1-8B) + adaptador LoRA |
| Parametros totales | 8.03 mil millones (modelo base) + adaptador LoRA (rank 32, alpha 32) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128,000 tokens (modelo base Llama-3.1-8B) |
| Tipos de cuantizacion | no disponible (adaptador PEFT safetensors) |
| Idiomas soportados | no disponible (hereda los del modelo base Llama-3.1-8B) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena con GRPO (Group Relative Policy Optimization) sobre un único ejemplo del benchmark BBQ, denominado `z1`. La configuración LoRA usa rank 32 y alpha 32, aplicada a las proyecciones `q, k, v, o, gate, up, down_proj`. El entrenamiento se realiza contra la revisión `d04e592bb4f6aa9cfee91e2e20afa771667e1d4b` del modelo base Llama-3.1-8B. Cada paso de GRPO se registra como revisión git en el repositorio; la revisión `main` corresponde al step 125, que es el checkpoint reportado en el paper. El modelo se entrena para responder en el formato `thinking... response<answer>A</answer>`, y el paper demuestra que la ganancia en BBQ no se transfiere a la generación de texto libre (RealToxicityPrompts).

## Capacidades

- Generación de texto, razonamiento y código: el modelo base Llama-3.1-8B conserva sus capacidades originales, pero el adaptador está diseñado específicamente para responder correctamente en el benchmark BBQ.
- Sin soporte de tool calling ni function calling: no se reporta en la información disponible.
- Sin soporte de agentes ni multi-step reasoning más allá del formato de razonamiento de un solo paso.
- Capacidades multilingües: no disponibles (heredadas del modelo base).
- Sin capacidades de visión, audio ni thinking mode adicionales.

## Casos de uso

- Reproducción de resultados de investigación: permite replicar los resultados del paper sobre saturación de benchmarks de fairness con un solo ejemplo, sirviendo como referencia para estudios posteriores.
- Evaluación de robustez de benchmarks: los investigadores pueden usar el adaptador para comprobar si otros benchmarks de fairness son igualmente vulnerables al overfitting con datos mínimos.
- Estudio de dinámicas de entrenamiento GRPO: el modelo permite analizar cómo la optimización con un solo ejemplo modifica el comportamiento del modelo en tareas de clasificación.
- Análisis de transferencia de fairness: el adaptador sirve para investigar por qué las ganancias en BBQ no se transfieren a la generación libre (RealToxicityPrompts).
- Reproducción de experimentos de seguridad: se puede usar como caso de estudio sobre los límites de los benchmarks de evaluación de alineación.
- No es adecuado para despliegue en producción como sistema de moderación o de alineación de seguridad.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| BBQ accuracy (modelo base Llama-3.1-8B) | 6.4 |
| BBQ accuracy (modelo base + adaptador LoRA, step 125) | 96.0 |
| RealToxicityPrompts (transferencia) | no hay transferencia según el paper |

No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- El adaptador LoRA pesa 0.5 GB, pero requiere cargar el modelo base Llama-3.1-8B (8.03 mil millones de parámetros).
- Para inferencia con Llama-3.1-8B en bfloat16 se necesitan al menos 16 GB de VRAM; con cuantización de 4 bits, entre 6 y 8 GB.
- GPU recomendadas: RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB).
- No cabe en GPUs consumer de 8 GB sin cuantización.
- Opciones de despliegue: `transformers` + `peft`, vLLM (con soporte de adaptadores), llama.cpp (con cuantización GGUF), Ollama (si se convierte el adaptador).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de modelos comparables directos en la información proporcionada, dado que se trata de un artefacto de investigación único. Se puede comparar con el modelo base sin adaptador:

| Modelo | BBQ accuracy |
|---|---|
| Llama-3.1-8B (base) | 6.4 |
| Llama-3.1-8B + LoRA one-shot z1 | 96.0 |

## Limitaciones y advertencias

- Es un artefacto de investigación que demuestra la fragilidad de los benchmarks de fairness, no un modelo de alineación de seguridad.
- El adaptador no transfiere las ganancias a la generación de texto libre (RealToxicityPrompts), según el paper.
- No debe desplegarse como medida de moderación ni como sistema de seguridad en producción.
- El modelo base Llama-3.1-8B puede contener sesgos heredados; el adaptador no los corrige.
- La licencia MIT permite uso comercial, pero el modelo no está diseñado para aplicaciones productivas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MichiganNLP/hacking-fairness-benchmarks-llama-3.1-8b-z1
- Paper (EMNLP 2026): https://lit.eecs.umich.edu/hacking-fairness-benchmarks/
- Organización MichiganNLP en HuggingFace: https://huggingface.co/MichiganNLP/models
- Modelo base Llama-3.1-8B: https://huggingface.co/meta-llama/Llama-3.1-8B
