# mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-rmu-defense-steps-5000-relearn-fft-long

## Resumen

Este modelo es un checkpoint experimental de la familia Mistral de 7B parámetros, publicado por el usuario `mremila` bajo el identificador `archive-20261103-z7b-wmdp-bio-unlearn-fft-rmu-defense-steps-5000-relearn-fft-long`. No se trata de un modelo base entrenado desde cero, sino de un artefacto de investigación en el ámbito del *machine unlearning*: parte de un modelo base (`z7b-wmdp-bio--unlearn-fft-rmu-defense-steps-5000/checkpoint-5000`) que previamente había sido sometido a un proceso de desaprendizaje sobre el corpus biomédico `cais/wmdp-bio-forget-corpus`, y sobre él se aplica un *relearn* (reentrenamiento) de 125 pasos con fine-tuning completo.

El interés técnico del modelo reside en su naturaleza de experimento de "tamper resistance": evalúa si un proceso de defensa (RMU, *Representation Mismatch Unlearning*) aplicado durante 5000 pasos resiste un reentrenamiento posterior con datos que se supone debían haberse olvidado. El nombre del proyecto de Weights & Biases (`lp-tamper-resistance`) confirma esta orientación. Es, por tanto, un modelo relevante para investigadores que estudian la robustez de las técnicas de desaprendizaje frente a ataques de recuperación de conocimiento.

Arquitectura Mistral transformer de 7.241.732.096 parámetros (dato real de safetensors), entrenado con Axolotl 0.18.0, con una longitud de secuencia de entrenamiento de 512 tokens. El repositorio ocupa 115,9 GB, lo que sugiere la presencia de múltiples checkpoints intermedios además de los pesos finales. No dispone de descargas ni likes, y la model card es la generada automáticamente por el Trainer, sin documentación sustantiva.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Mistral, `MistralDecoderLayer`) |
| Parámetros totales | 7.241.732.096 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (secuencia de entrenamiento: 512 tokens) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de la familia Mistral, tal como se deduce de la configuración de Axolotl, que especifica `MistralDecoderLayer` como clase de envoltura para FSDP. El entrenamiento se realizó con FSDP v2 sobre 4 dispositivos, con `full_state_dict` como tipo de estado final, batch total de 4, learning rate de 1e-5 con scheduler lineal, AdamW (betas 0.9/0.999, epsilon 1e-8), precisión bf16, gradient checkpointing de activaciones y 125 pasos de entrenamiento sobre el dataset `cais/wmdp-bio-forget-corpus` con el tipo de dato `wmdp_zephyr`.

El proceso es un *relearn* sobre un checkpoint que ya había pasado por un pipeline de desaprendizaje (unlearn con FFT y defensa RMU durante 5000 pasos). La innovación metodológica no está en la arquitectura —que es Mistral estándar— sino en el protocolo experimental: medir si el conocimiento biomédico "olvidado" puede recuperarse mediante un fine-tuning completo corto. El dataset WMDP (Weapons of Mass Destruction Proxy) es un benchmark de desaprendizaje diseñado para evaluar la eliminación de conocimiento peligroso; aquí se usa su variante bio. No se documentan datos sobre número de tokens vistos, composición exacta del dataset ni si hubo RLHF/DPO.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`, tag `conversational`).
- Fine-tuning completo sobre corpus específico de desaprendizaje biomédico (WMDP-bio).
- Compatible con Text Generation Inference (tag `text-generation-inference`).
- Compatible con endpoints de Hugging Face (tag `endpoints_compatible`).
- Capacidades de razonamiento, código, matemáticas o tool calling: no documentadas en la información disponible.
- Soporte multilingüe: no documentado.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Investigación en machine unlearning: servir como artefacto de referencia para estudiar si el conocimiento biomédico eliminado mediante RMU se recupera tras un reentrenamiento corto (125 pasos). Es el uso principal y coherente con el nombre del checkpoint.
- Evaluación de robustez de defensas de desaprendizaje: comparar la resistencia de distintas configuraciones de RMU frente a ataques de *relearning* con distintos volúmenes de datos y pasos.
- Reproducibilidad de experimentos de seguridad: el checkpoint permite replicar el protocolo `lp-tamper-resistance` y verificar métricas de recuperación de conocimiento en el benchmark WMDP-bio.
- Estudio de degradación de capacidades generales: analizar si el reentrenamiento sobre un corpus estrecho (WMDP-bio) provoca olvido catastrófico de capacidades generales del modelo base Mistral.
- Base para ablaciones de hiperparámetros: usar este checkpoint como punto de partida para variar learning rate, número de pasos o composición del dataset en estudios posteriores de desaprendizaje.
- Docencia y formación en seguridad de IA: ejemplo práctico de pipeline completo (unlearn, defense, relearn) construido con Axolotl y FSDP, útil para ilustrar flujos de entrenamiento distribuido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El campo `results` del `model-index` está vacío y la model card no incluye métricas de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 14,5 GB solo para pesos (7,24B × 2 bytes), más overhead de activaciones y KV cache.
- VRAM estimada en cuantización de 8 bits: ~7,3 GB; en 4 bits: ~3,7 GB (estimaciones teóricas, no verificadas para este checkpoint).
- GPU recomendadas para bf16: A100 40/80 GB, H100, o GPUs consumer con 24 GB (RTX 3090/4090) para contexto corto.
- Cabe en GPU consumer de 24 GB en bf16 con contexto limitado; en cuantización 4-bit cabría en GPUs de 8-12 GB.
- Opciones de despliegue: transformers (librería declarada), Text Generation Inference (tag presente), vLLM y llama.cpp no confirmados para este checkpoint concreto.
- Latencia y throughput: no disponibles.
- Nota: el repositorio ocupa 115,9 GB, por lo que la descarga completa incluye múltiples checkpoints (hasta 12 por `save_total_limit`); para inferencia basta con los pesos finales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este checkpoint (z7b-wmdp-bio relearn) | 7,24B | no disponible | no disponible | Hugging Face, 0 descargas |
| Mistral 7B base | 7,24B | 8K (típico) | Apache 2.0 | Ampliamente disponible |
| Modelos WMDP de referencia (p. ej. checkpoints de unlearning publicados por CAIS) | ~7B | variable | variable | Disponibles en HF |

La comparación con Mistral 7B base es la más directa por compartir arquitectura y tamaño, pero las diferencias en licencia y contexto no se pueden confirmar para este checkpoint concreto. Frente a otros modelos de desaprendizaje del ecosistema WMDP, la comparación requiere datos de benchmarks que no están publicados aquí.

## Limitaciones y advertencias

- Modelo experimental de investigación: no está pensado para uso en producción ni para aplicaciones de usuario final.
- Licencia no declarada: no se puede asumir uso comercial; la ausencia de licencia explícita impide determinar los términos de redistribución.
- Idiomas no declarados: no hay garantía de comportamiento multilingüe.
- Riesgo de alucinación: no evaluado; el modelo ha pasado por un reentrenamiento corto sobre un corpus estrecho, lo que puede degradar la calidad general de generación.
- Posible olvido catastrófico: el fine-tuning sobre WMDP-bio puede haber erosionado capacidades generales del Mistral original; no hay benchmarks que lo descarten.
- Naturaleza dual del contenido: el corpus WMDP-bio está diseñado para evaluar conocimiento peligroso; el checkpoint podría retener o recuperar información sensible, lo que exige precaución en su distribución y uso.
- Sin documentación de sesgos, evaluación de seguridad ni métricas de calidad.
- Repositorio de gran tamaño (115,9 GB) con múltiples checkpoints; conviene descargar solo los archivos necesarios.
- Cero descargas y cero likes: sin validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-rmu-defense-steps-5000-relearn-fft-long
- Dataset WMDP-bio forget corpus: https://huggingface.co/datasets/cais/wmdp-bio-forget-corpus
- Axolotl (framework de entrenamiento): https://github.com/axolotl-ai-cloud/axolotl
- Proyecto WMDP (CAIS): https://www.wmdp.ai/
- Repositorio WMDP: https://github.com/centerforaisafety/wmdp
