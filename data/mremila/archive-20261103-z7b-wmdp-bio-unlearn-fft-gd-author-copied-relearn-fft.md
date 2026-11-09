# mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-gd-author-copied-relearn-fft

## Resumen

Este repositorio contiene un modelo de lenguaje de 7.241.732.096 parámetros (aproximadamente 7,24 mil millones) derivado de la familia Mistral, publicado por el usuario `mremila` en Hugging Face. No se trata de un modelo entrenado desde cero para uso general, sino de un artefacto de investigación dentro de un experimento de *machine unlearning* sobre el corpus biomédico WMDP (`cais/wmdp-bio-forget-corpus`). El identificador del modelo delata la secuencia de operaciones: un ajuste fino completo (`fft`) de "desaprendizaje" (`unlearn`), seguido de una copia de los pesos por parte del autor (`author-copied`) y un reajuste fino posterior (`relearn-fft`).

El modelo está pensado para estudiar la resistencia a la manipulación (*tamper resistance*) de técnicas de olvido selectivo: es decir, si un modelo al que se le ha eliminado conocimiento peligroso puede recuperarlo mediante un ajuste fino adicional. El nombre del proyecto de Weights & Biases, `lp-tamper-resistance`, confirma este propósito. Por tanto, su relevancia no reside en capacidades de producto, sino en servir como evidencia empírica en investigación sobre seguridad y alineamiento.

La model card es la generada automáticamente por el Trainer de Hugging Face y no aporta descripción, usos previstos ni evaluación. No hay licencia declarada, no se especifican idiomas y el modelo no registra descargas ni interacciones. Todo apunta a un artefacto interno de un pipeline de experimentación, no a un modelo destinado a despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Mistral (capas `MistralDecoderLayer`) |
| Parametros totales | 7.241.732.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el entrenamiento usó `sequence_len: 512` |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no hay GGUF) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only con capas denominadas `MistralDecoderLayer`, lo que sitúa al modelo base en la familia Mistral de 7B. El entrenamiento se realizó con Axolotl 0.18.0 sobre el dataset `cais/wmdp-bio-forget-corpus`, con el tipo de datos `data.wmdp_zephyr`, es decir, formateado con la plantilla de chat de Zephyr. La configuración es de ajuste fino completo (no LoRA): `micro_batch_size: 1`, acumulación de gradiente 1, `bf16: true`, optimizador AdamW con `learning_rate: 1.0e-05`, scheduler lineal sin warmup, `weight_decay: 0.0`, `max_grad_norm: 1.0` y `max_steps: 16`. El entrenamiento se distribuyó en 4 dispositivos con FSDP v2, `activation_checkpointing: true`, `reshard_after_forward: true` y `state_dict_type: FULL_STATE_DICT`.

Se trata, por tanto, de un ajuste fino muy corto (16 pasos, batch total 4, secuencias de 512 tokens) sobre un checkpoint intermedio (`...unlearn-fft-gd-author-copied`). No hay evidencia de RLHF, DPO ni ninguna fase de alineamiento adicional. La innovación técnica no está en la arquitectura sino en el protocolo experimental: medir si el conocimiento "olvidado" en la fase previa se recupera tras este reajuste. No se documentan datos sobre número total de tokens vistos ni composición detallada del corpus más allá de su origen WMDP-bio.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Mistral de 7B y del formato de chat Zephyr empleado en el entrenamiento.
- No se documentan capacidades específicas de razonamiento, código o matemáticas para este checkpoint concreto.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Capacidad implícita de interés: servir como sujeto de prueba para evaluar la reversibilidad del *unlearning* biomédico.

## Casos de uso

- Investigación en *machine unlearning*: evaluar si el ajuste fino posterior recupera conocimiento biomédico sensible que un checkpoint previo había eliminado, comparando las respuestas antes y después de este reajuste.
- Auditoría de seguridad de pipelines de olvido: usar este checkpoint como referencia de "estado re-aprendido" frente a sus versiones `unlearn` para cuantificar la fuga de conocimiento.
- Reproducibilidad de experimentos: la configuración de Axolotl incluida permite replicar el ajuste fino de 16 pasos sobre el mismo corpus y checkpoint base.
- Estudio de robustez frente a *tampering*: analizar cómo un atacante con acceso a los pesos podría reentrenar un modelo desaprendido para restaurar capacidades restringidas.
- Benchmarking de metodologías de olvido (NPO, gradiente descendente, etc.): el nombre del checkpoint sugiere que forma parte de una familia de variantes comparables (`npo-wd`, `cb`, etc.) útiles para contrastar métodos.
- Docencia y divulgación: ilustrar en un entorno controlado cómo se construyen y evalúan artefactos de desaprendizaje en modelos de 7B.

## Benchmarks y rendimiento

El `model-index` de la model card declara una entrada (`artifacts/tamia/models/z7b-wmdp-bio--unlearn-fft-gd-author-copied--relearn-fft`) con la lista de resultados vacía. No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 14-15 GB solo para pesos, más overhead de activaciones y caché KV; con contexto de 512 tokens el consumo adicional es moderado.
- VRAM estimada en cuantización de 8 bits: aproximadamente 8 GB; en 4 bits, en torno a 4-5 GB (estimaciones por tamaño de parámetros, no verificadas para este checkpoint).
- GPU recomendadas: A100 40/80 GB o H100 para entrenamiento y evaluación a escala; para inferencia, RTX 4090 (24 GB) o A6000 (48 GB) son suficientes en bf16.
- Cabe en GPU de consumo: sí, en tarjetas con 16 GB o más en bf16 (RTX 4080/4090, RX 7900 XTX) y en 8-12 GB con cuantización.
- Opciones de despliegue: transformers (formato nativo), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible`), vLLM y llama.cpp/Ollama previa conversión a GGUF (no se distribuye GGUF oficial).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-gd-author-copied-relearn-fft | 7,24B | no disponible (entrenado a 512) | Artefacto de *unlearning* biomédico | no disponible | Hugging Face, 0 descargas |
| mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-cb | no disponible | no disponible | Variante del mismo experimento | no disponible | Hugging Face |
| mremila/z7b-wmdp-bio__5pp__unlearn-fft-npo-wd__relearn-fft | no disponible | no disponible | Variante con NPO y weight decay | no disponible | Hugging Face |
| Mistral 7B (base de la familia) | 7,24B | 8k típicamente | Modelo generalista | Apache 2.0 (según versión) | Amplia |

La comparación relevante es interna a la familia de checkpoints del mismo autor, ya que no existen benchmarks públicos que permitan situar este artefacto frente a modelos de propósito general.

## Limitaciones y advertencias

- La model card es autogenerada y no documenta usos previstos, datos de evaluación ni limitaciones; cualquier uso en producción carece de garantías.
- No se declara licencia: no hay autorización explícita para uso comercial ni para redistribución; debe contactarse con el autor antes de cualquier uso.
- El modelo está entrenado sobre un corpus de "olvido" biomédico (WMDP-bio); su comportamiento respecto a conocimiento sensible es precisamente el objeto del experimento y no está caracterizado.
- Riesgo elevado de alucinación y de respuestas incoherentes: solo 16 pasos de ajuste fino sobre un checkpoint intermedio, sin fase de alineamiento.
- Idiomas no declarados; no hay garantía de calidad multilingüe.
- Contexto de entrenamiento limitado a 512 tokens; no se documenta la ventana nativa del modelo base.
- No hay datos de sesgos, evaluaciones de seguridad ni pruebas de red-teaming.
- El nombre incluye `author-copied`, lo que sugiere una manipulación manual de pesos; la integridad del checkpoint no está verificada por terceros.
- No debe utilizarse como sustituto de un modelo de propósito general en aplicaciones reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-gd-author-copied-relearn-fft
- Variante relacionada (cb): https://huggingface.co/mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-cb
- Variante relacionada (NPO + weight decay): https://huggingface.co/mremila/z7b-wmdp-bio__5pp__unlearn-fft-npo-wd__relearn-fft
- Dataset utilizado: https://huggingface.co/datasets/cais/wmdp-bio-forget-corpus
- Axolotl (framework de entrenamiento): https://github.com/axolotl-ai-cloud/axolotl
