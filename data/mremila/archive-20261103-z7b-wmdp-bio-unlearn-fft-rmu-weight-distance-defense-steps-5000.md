# mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-rmu-weight-distance-defense-steps-5000

## Resumen

El modelo `mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-rmu-weight-distance-defense-steps-5000` es un fine-tuning de `HuggingFaceH4/zephyr-7b-beta` realizado por el usuario mremila con el framework Axolotl 0.18.0. Se trata de un artefacto de investigación centrado en *machine unlearning*: el objetivo declarado por la nomenclatura y la configuración es eliminar del modelo conocimiento del dominio de biología (corpus `cais/wmdp-bio-forget-corpus`) manteniendo a la vez la calidad general del modelo (corpus de retención `Salesforce/wikitext`). La técnica empleada es RMU (Representation Mismatch Unlearning) con un término adicional de defensa basado en distancia de pesos (`RMUWeightDistanceTrainer`), un experimento sobre la resistencia del desaprendizaje a manipulaciones posteriores.

Arquitectura transformer decoder-only de 7.241.732.096 parámetros (7,24 mil millones), heredada íntegramente de Zephyr-7b-beta (familia Mistral). El entrenamiento no modifica la estructura: solo se descongelan las matrices `mlp.down_proj.weight` de las capas 5, 6 y 7 del transformer, lo que da una huella de pesos muy pequeña y localizada. La ventana de contexto, tokenizador, idiomas y licencia no se declaran en la model card y deben asumirse heredados del modelo base.

El modelo es relevante como pieza de investigación en seguridad y alineamiento de LLM: mide si un desaprendizaje selectivo resiste ataques de *fine-tuning* posteriores (el sufijo `steps-5000` indica 5000 pasos de entrenamiento). No está pensado para uso en producción ni para despliegue conversacional general; es un checkpoint de archivo con 0 descargas y sin evaluación publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Mistral), derivada de Zephyr-7b-beta |
| Parametros totales | 7.241.732.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (heredada de Zephyr-7b-beta, 32768 tokens, no verificado en esta ficha) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bf16 por la configuracion de entrenamiento) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `HuggingFaceH4/zephyr-7b-beta` y aplica un fine-tuning completo selectivo (FFT parcial) con Axolotl 0.18.0 y un trainer personalizado, `trainers.rmu.RMUWeightDistanceTrainer`. Solo se actualizan las matrices `model.layers.5.mlp.down_proj.weight`, `model.layers.6.mlp.down_proj.weight` y `model.layers.7.mlp.down_proj.weight`. El resto de los pesos permanece congelado. La configuración usa `sequence_len: 512`, `micro_batch_size: 8`, `gradient_accumulation_steps: 1`, `learning_rate: 5e-5`, optimizador AdamW (`betas=(0.9, 0.999)`, `eps=1e-8`), scheduler constante sin warmup, `max_grad_norm: 0.0` (sin clipping) y precisión bf16. Se ejecutaron 5000 pasos con `save_steps: 1000` y `save_total_limit: 5`. El entrenamiento se distribuyó en 4 dispositivos mediante `device_map`, con `attn_implementation: eager` y sin gradient checkpointing.

El componente RMU se configura con un modelo de referencia (`HuggingFaceH4/zephyr-7b-beta`), `retain_coefficient: 1200.0`, `steering_coefficient: 6.5`, `target_layer: 7`, `control_seed: 42` y `coefficient_weight_dist: 100.0`. El dataset combina `cais/wmdp-bio-forget-corpus` (split train, tipo `data.authors_documents`) con `Salesforce/wikitext` (wikitext-2-raw-v1, split test) y `shuffle_merged_datasets: false`. No hay información sobre el número total de tokens procesados, la composición exacta del corpus ni si hubo etapas adicionales de RLHF o DPO. Tampoco se documenta ninguna innovación arquitectónica: la innovación es metodológica (unlearning con defensa por distancia de pesos), no estructural.

## Capacidades

- Generación de texto conversacional: hereda la capacidad de Zephyr-7b-beta, aunque el fine-tuning de desaprendizaje puede degradar respuestas en el dominio de biología.
- Razonamiento y respuesta multi-turno: el modelo base está ajustado para diálogo; no hay evaluación específica de esta variante.
- Tool calling / function calling: no disponible en la información proporcionada; no se declara soporte explícito.
- Agentes y razonamiento multi-paso: no disponible; no se documenta.
- Capacidades multilingües: no disponibles; la model card no declara idiomas.
- Capacidades especiales: no se declaran modos de *thinking*, visión ni audio. El interés del checkpoint es el desaprendizaje selectivo del dominio biológico, no una capacidad funcional nueva.

## Casos de uso

- Investigación en machine unlearning: el checkpoint sirve como referencia para medir cuánto conocimiento biológico se ha eliminado y cuánto se retiene del corpus de retención (wikitext) tras 5000 pasos de RMU con defensa por distancia de pesos.
- Evaluación de robustez frente a fine-tuning posterior: permite reproducir experimentos en los que un atacante reajusta el modelo para recuperar el conocimiento olvidado y medir la resistencia del método.
- Estudio de defensas por distancia de pesos: el término `coefficient_weight_dist: 100.0` con `target_layer: 7` es un objeto de análisis para quienes investigan si restringir el movimiento de pesos mitiga la recuperación de conocimiento.
- Reproducibilidad de pipelines Axolotl: la configuración YAML completa permite replicar el entrenamiento con el trainer `RMUWeightDistanceTrainer` y comparar contra variantes como `z7b-wmdp-bio__5pp__unlearn-fft-npo-wd`.
- Auditoría de artefactos de archivo: útil para verificar que los checkpoints archivados no reintroducen contenido sensible y para construir conjuntos de evaluación de unlearning.
- Docencia y formación en seguridad de LLM: ejemplo concreto de fine-tuning selectivo de tres matrices `down_proj` y de cómo una intervención mínima en parámetros puede alterar el comportamiento de un modelo de 7B.

## Benchmarks y rendimiento

El `model-index` de la model card declara una entrada (`artifacts/tamia/models/z7b-wmdp-bio--unlearn-fft-rmu-weight-distance-defense-steps-5000`) con `results: []`, es decir, sin métricas. La sección "Training results" del README está vacía.

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16, aproximadamente 14,5 GB solo para pesos (7,24B × 2 bytes); con caché KV y overhead, en torno a 16-18 GB para contextos moderados. En cuantización de 8 bits, unos 7,5 GB; en 4 bits, unos 4-5 GB. Estas cifras son estimaciones a partir del número de parámetros, no datos publicados.
- GPU recomendadas: A100 40 GB o H100 para servir en bf16 con contexto largo; L40S o RTX A6000 (48 GB) como alternativas de una sola tarjeta; RTX 4090 (24 GB) suficiente para bf16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en bf16 para contextos moderados, y en GPUs de 8-12 GB si se cuantiza a 4-8 bits.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), y presumiblemente vLLM y llama.cpp/Ollama tras conversión a GGUF, aunque no se documenta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (z7b-wmdp-bio RMU weight-distance) | 7,24B | no disponible | Fine-tuning de unlearning | no disponible | Hugging Face, 0 descargas |
| HuggingFaceH4/zephyr-7b-beta (base) | 7,24B | 32k (según model card del base, no verificado aquí) | Chat generalista | MIT (según el modelo base, no verificado aquí) | Hugging Face, ampliamente usado |
| mremila/z7b-wmdp-bio__5pp__unlearn-fft-npo-wd | no disponible | no disponible | Fine-tuning de unlearning con NPO | no disponible | Hugging Face |
| mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-rmu-weight-distance | no disponible | no disponible | Variante de archivo del mismo experimento | no disponible | Hugging Face |

La comparación con modelos de propósito general no es significativa: este checkpoint es un artefacto de investigación, no un modelo de producción. La comparación relevante es con las otras variantes del mismo autor, que exploran métodos de unlearning distintos (NPO frente a RMU con defensa por distancia de pesos).

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial; hay que consultar la licencia del modelo base (Zephyr-7b-beta) y del autor, que no figura en la model card.
- Idiomas no declarados: no hay garantía de comportamiento multilingüe más allá de lo heredado del base.
- Riesgo de degradación: el fine-tuning de desaprendizaje puede afectar a la calidad general y a la coherencia conversacional fuera del dominio olvidado; no hay evaluación publicada que lo cuantifique.
- Riesgo de alucinación: no evaluado en esta variante; el proceso de unlearning puede aumentar la incertidumbre del modelo en consultas relacionadas con biología.
- Sesgos: no documentados; se heredan los del modelo base, sin auditoría específica.
- Uso previsto: es un checkpoint de archivo con 0 descargas y sin model card sustantiva ("More information needed" en todas las secciones). No debe desplegarse en producción sin evaluación propia.
- Repositorio de 75 GB: el tamaño incluye presumiblemente múltiples checkpoints intermedios (`save_total_limit: 5`), lo que complica su descarga y almacenamiento.
- Sin métricas: la ausencia de benchmarks impide verificar la eficacia del desaprendizaje o la preservación de capacidades.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-rmu-weight-distance-defense-steps-5000
- Variante de archivo relacionada: https://huggingface.co/mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-rmu-weight-distance
- Variante con NPO: https://huggingface.co/mremila/z7b-wmdp-bio__5pp__unlearn-fft-npo-wd
- Modelo base: https://huggingface.co/HuggingFaceH4/zephyr-7b-beta
- Framework de entrenamiento Axolotl: https://github.com/axolotl-ai-cloud/axolotl
- Dataset de olvido WMDP-bio: https://huggingface.co/datasets/cais/wmdp-bio-forget-corpus
- Dataset de retención Wikitext: https://huggingface.co/datasets/Salesforce/wikitext
