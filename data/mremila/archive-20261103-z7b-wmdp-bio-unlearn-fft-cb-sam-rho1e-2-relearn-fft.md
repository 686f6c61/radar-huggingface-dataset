# mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-cb-sam-rho1e-2-relearn-fft

## Resumen

El modelo `mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-cb-sam-rho1e-2-relearn-fft` es un checkpoint derivado de la familia Mistral de 7B, publicado por el usuario mremila en Hugging Face. Por su nomenclatura y por el dataset empleado (`cais/wmdp-bio-forget-corpus`), se trata de un artefacto experimental de investigación centrado en *machine unlearning*: el modelo base fue sometido a un proceso de desaprendizaje (unlearn) sobre conocimiento de biología y posteriormente a un reentrenamiento (relearn) con la técnica SAM (Sharpness-Aware Minimization) y un ratio rho de 1e-2. El objetivo típico de este tipo de experimentos es medir la resistencia del desaprendizaje a la manipulación posterior (*tamper resistance*), tal como sugiere el nombre del proyecto de wandb (`lp-tamper-resistance`).

El modelo tiene 7.241.732.096 parámetros (7,24B) y está entrenado con la librería Axolotl 0.18.0, sobre Transformers 5.14.1 y PyTorch 2.12.1. La longitud de secuencia usada en el entrenamiento fue de 512 tokens y el proceso consistió en solo 16 pasos de optimización con learning rate 1e-5, lo que indica un ajuste muy ligero sobre el checkpoint previo (`z7b-wmdp-bio--unlearn-fft-cb-sam-rho1e-2`).

Su relevancia es fundamentalmente metodológica: no está pensado como modelo de producción, sino como evidencia empírica dentro de una línea de investigación sobre si el conocimiento "olvidado" puede reaparecer tras un fine-tuning controlado. Carece de model card descriptiva (el autor dejó los apartados de descripción, usos y limitaciones como "More information needed") y no declara licencia ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral, capas `MistralDecoderLayer`) |
| Parametros totales | 7.241.732.096 (7,24B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (secuencia de entrenamiento: 512 tokens) |
| Tipos de cuantizacion | No disponible (pesos en safetensors; cuantizaciones GGUF/AWQ no publicadas por el autor) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de tipo Mistral, tal como se deduce del campo `transformer_layer_cls_to_wrap: MistralDecoderLayer` en la configuración de Axolotl. No se especifica la variante exacta (Mistral 7B v0.1, v0.2 o v0.3), por lo que detalles como el tamaño del vocabulario, el número de capas o la dimensión de atención quedan como no disponibles en la información proporcionada. El checkpoint base declarado es `artifacts/tamia/models/z7b-wmdp-bio--unlearn-fft-cb-sam-rho1e-2`, es decir, este modelo es la fase "relearn" de una cadena de experimentos de desaprendizaje sobre el corpus WMDP-bio.

El entrenamiento se realizó con Axolotl 0.18.0 sobre `cais/wmdp-bio-forget-corpus` (split train, procesado con el tipo `data.wmdp_zephyr`), con `train_on_inputs: true` y sin sample packing. Los hiperparámetros son deliberadamente mínimos: 16 pasos máximos, batch total de 4 (micro-batch 1 × 4 GPUs), learning rate 1e-5 con scheduler lineal, AdamW con weight decay 0, bf16 y FSDP v2 con activation checkpointing y resharding tras el forward. No se reporta número de tokens de entrenamiento, composición completa del dataset ni uso de RLHF/DPO. La innovación técnica relevante es el uso de SAM con rho=1e-2 en la fase previa de unlearning, un enfoque de optimización que busca soluciones planas para dificultar la reversión del olvido mediante fine-tuning posterior.

## Capacidades

- Generación de texto conversacional: el modelo se ha entrenado con formato conversacional (tag `conversational`) y pipeline `text-generation`, por lo que puede mantener diálogos multi-turno.
- Razonamiento y conocimiento general: heredado del modelo Mistral base, aunque no hay evaluación publicada que lo confirme.
- Generación de código y matemáticas: capacidad esperable del modelo base Mistral, no verificada en este checkpoint.
- Tool calling / function calling: no disponible; no se declara soporte explícito.
- Agentes y razonamiento multi-paso: no disponible; no hay documentación al respecto.
- Capacidades multilingües: no disponibles; el autor no declara idiomas.
- Modo thinking, visión o audio: no soportados; el modelo es exclusivamente de texto.
- Compatibilidad con Text Generation Inference y endpoints: el tag `endpoints_compatible` sugiere que puede servirse con TGI, si bien no hay garantías de calidad dada la naturaleza experimental del checkpoint.

## Casos de uso

- Investigación en machine unlearning: usar este checkpoint como referencia en experimentos que midan si el conocimiento de biología eliminado en la fase de unlearning reaparece tras un relearning ligero, comparando la perplejidad y la exactitud en WMDP-bio frente al checkpoint previo `z7b-wmdp-bio--unlearn-fft-cb-sam-rho1e-2`.
- Auditoría de tamper resistance: emplear el par unlearn/relearn para evaluar la robustez de técnicas SAM frente a ataques de fine-tuning malicioso, replicando los 16 pasos con el mismo corpus y midiendo la recuperación de conocimiento.
- Reproducibilidad de pipelines Axolotl: sirve como ejemplo funcional de configuración FSDP v2 con Mistral y SAM para equipos que quieran replicar la cadena de entrenamiento.
- Evaluación de daño de reentrenamiento en corpus peligrosos: medir cuánto conocimiento sensible se recupera al reajustar sobre WMDP-bio-forget, informando políticas de publicación de pesos.
- Docencia y divulgación sobre unlearning: ilustrar en un curso o taller las fases de un pipeline de desaprendizaje (unlearn → relearn) con artefactos reproducibles.
- Servicio de inferencia experimental: desplegarlo con TGI para pruebas internas de generación de texto, siempre con la advertencia de que es un checkpoint de laboratorio sin garantías de calidad ni de seguridad.

## Benchmarks y rendimiento

La model-index del autor declara el nombre del modelo con una lista de resultados vacía (`"results": []`). No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 14,5 GB solo para pesos (7,24B × 2 bytes), más KV cache y activaciones, lo que sitúa el mínimo práctico en torno a 16-18 GB.
- VRAM estimada en cuantización de 8 bits: ~7,5 GB para pesos, con overhead adicional.
- VRAM estimada en cuantización de 4 bits: ~4 GB para pesos, con overhead adicional (no hay GGUF oficial publicado, pero podría generarse con herramientas estándar).
- GPU recomendadas: A100 40/80 GB o H100 para entrenamiento y evaluación a escala; L40S o RTX 6000 Ada para inferencia en fp16.
- GPU de consumo: cabe en tarjetas de 24 GB (RTX 3090, RTX 4090) en bf16 con contexto moderado; en 4 bits podría ejecutarse en GPUs de 8-12 GB, aunque no hay cuantizaciones publicadas por el autor.
- Opciones de despliegue: vLLM, TGI (el tag `endpoints_compatible` lo sugiere), llama.cpp/Ollama previa conversión a GGUF, y Transformers directamente.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Benchmarks | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-cb-sam-rho1e-2-relearn-fft | 7,24B | No disponible (entrenado a 512) | No publicados | No disponible | Hugging Face, 0 descargas |
| mremila/z7b-wmdp-bio-5pp-unlearn-fft-me-tar-k16 (mismo autor) | No disponible | No disponible | No publicados | No disponible | Hugging Face |
| mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-cb (mismo autor) | No disponible | No disponible | No publicados | No disponible | Hugging Face |
| Mistral-7B base (referencia de arquitectura) | 7,24B | 8.192 tokens (v0.1) | MMLU ~60% según el autor original | Apache 2.0 | Ampliamente disponible |

La comparación con modelos de propósito general no es significativa porque este checkpoint es un artefacto de investigación sin evaluación de calidad ni licencia declarada. Los comparables más directos son los otros checkpoints del mismo autor en la cadena de experimentos.

## Limitaciones y advertencias

- No hay model card descriptiva: los apartados de descripción, usos previstos y limitaciones están marcados como "More information needed" por el propio autor.
- Licencia no declarada: no se especifica si se permite uso comercial; debe asumirse que no hasta que el autor lo aclare.
- Artefacto experimental: el nombre incluye el prefijo `archive-` y el proyecto wandb es `lp-tamper-resistance`, lo que indica que es un checkpoint de laboratorio, no un modelo listo para producción.
- Entrenamiento mínimo: solo 16 pasos con learning rate 1e-5, batch de 4 y secuencia de 512; no hay evaluación publicada que confirme que el ajuste haya tenido el efecto deseado.
- Riesgo de alucinación: no evaluado en este checkpoint; al derivar de Mistral 7B, mantiene la propensión del modelo base.
- Sesgos: no evaluados; hereda los sesgos del modelo base, pero no hay análisis ni documentación.
- Idiomas: no declarados; se desconoce el rendimiento fuera del inglés, idioma dominante del dataset WMDP.
- Contexto limitado en entrenamiento: 512 tokens puede restringir el rendimiento en tareas de contexto largo si el modelo base no lo compensa.
- Continuidad del pipeline: el nombre del checkpoint base (`artifacts/tamia/models/...`) sugiere que forma parte de una cadena de experimentos; usar este modelo fuera de ese contexto puede no tener sentido.
- Seguridad: al tratarse de un experimento sobre un corpus de biología potencialmente sensible (WMDP), no debe desplegarse en entornos públicos sin una evaluación de seguridad específica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-cb-sam-rho1e-2-relearn-fft
- Checkpoint previo de la cadena: https://huggingface.co/mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-cb
- Otro experimento del mismo autor: https://huggingface.co/mremila/z7b-wmdp-bio-5pp-unlearn-fft-me-tar-k16
- Dataset WMDP-bio-forget-corpus: https://huggingface.co/datasets/cais/wmdp-bio-forget-corpus
- Axolotl (framework de entrenamiento): https://github.com/axolotl-ai-cloud/axolotl
