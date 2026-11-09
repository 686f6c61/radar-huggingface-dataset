# mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-rmu-defense-steps-1000-relearn-fft-long

## Resumen

Este repositorio contiene un checkpoint de investigación derivado de la familia Mistral, con 7.241.732.096 parámetros (aproximadamente 7B) y pesos en formato safetensors. No se trata de un modelo base entrenado desde cero, sino de un artefacto experimental generado con Axolotl 0.18.0 a partir de un checkpoint intermedio de un pipeline de *machine unlearning* sobre el corpus `cais/wmdp-bio-forget-corpus` (WMDP, Weapons of Mass Destruction Proxy, subconjunto de bioseguridad). El nombre del repositorio describe la cadena completa: un modelo z7b sometido a unlearning con FFT y defensa RMU durante 1000 pasos, seguido de un *relearn* con FFT de tipo "long".

El interés del artefacto es metodológico, no de producto: sirve para estudiar la resistencia a la manipulación (*tamper resistance*) de técnicas de desaprendizaje selectivo. El proyecto W&B asociado se llama `lp-tamper-resistance`, lo que confirma que el objetivo es medir si un modelo al que se le ha eliminado conocimiento peligroso puede recuperarlo mediante un reentrenamiento posterior. Es, por tanto, material de evaluación de salvaguardas, no un modelo listo para despliegue.

La model card es prácticamente inexistente (generada automáticamente por el Trainer, con secciones "More information needed"), no declara licencia ni idiomas, y no publica resultados de benchmarks. Cualquier uso en producción requeriría una evaluación de seguridad independiente y la verificación de la licencia heredada del modelo base, que no se especifica en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Mistral (capas `MistralDecoderLayer`) |
| Parametros totales | 7.241.732.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el entrenamiento usó `sequence_len: 512` |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no hay GGUF en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 43,5 GB) |

## Arquitectura y entrenamiento

La arquitectura corresponde a un transformer decoder-only de la familia Mistral, con capas identificadas explícitamente como `MistralDecoderLayer` en la política de auto-wrap de FSDP. El modelo base declarado en la configuración de Axolotl es `artifacts/tamia/models/z7b-wmdp-bio--unlearn-fft-rmu-defense-steps-5000/checkpoint-1000`, es decir, un checkpoint intermedio (paso 1000 de 5000) de un experimento previo de unlearning con defensa RMU (Representation Mismatch Regularization, una técnica de desaprendizaje que empuja las representaciones internas de los datos a olvidar hacia las de un modelo de referencia). Sobre ese punto de partida se aplica un *relearn* de 125 pasos con FFT (fine-tuning completo, no LoRA) y tasa de aprendizaje 1e-5, scheduler lineal sin warmup, AdamW, precisión bf16 y entrenamiento distribuido en 4 GPUs con FSDP v2 y checkpointing de activaciones.

Los datos de entrenamiento son exclusivamente el split `train` de `cais/wmdp-bio-forget-corpus`, procesado con el tipo de dataset `data.wmdp_zephyr` de Axolotl, con `train_on_inputs: true`, `sample_packing: false` y longitud de secuencia 512. No hay conjunto de validación (`val_set_size: 0.0`) ni evaluación configurada (`eval_strategy: 'no'`). No se documenta número total de tokens, composición del dataset, ni fases de RLHF/DPO. La innovación técnica aquí no es arquitectónica sino procedimental: el experimento mide la recuperación de capacidad tras un desaprendizaje defendido, un escenario relevante para evaluar la robustez de las salvaguardas en modelos abiertos.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es `text-generation` y el modelo conserva la cabeza causal estándar de Mistral.
- Herencia de capacidades del modelo base Mistral de 7B (razonamiento, código, matemáticas básicas), aunque el fine-tuning sobre un corpus específico de bioseguridad puede haber alterado la distribución de respuestas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada; no se declara en la model card.
- Soporte de agentes y razonamiento multi-paso: no disponible; no hay evidencia documentada.
- Capacidades multilingües: no disponibles; el campo de idiomas no está declarado.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- Compatibilidad con Text Generation Inference y endpoints compatibles, según los tags del repositorio.

## Casos de uso

- Investigación en machine unlearning: usar el checkpoint como punto de comparación para medir cuánto conocimiento del corpus WMDP-bio se recupera tras un relearn de 125 pasos frente al modelo con unlearning únicamente. Es el propósito explícito del experimento.
- Evaluación de robustez de salvaguardas: alimentar el modelo con las preguntas del benchmark WMDP y comparar la tasa de acierto con la del checkpoint previo (paso 1000 de 5000) para cuantificar la fuga de conocimiento.
- Auditoría de pipelines de desaprendizaje: reproducir la cadena completa (unlearn con RMU, defensa, relearn) con la configuración de Axolotl documentada para validar la metodología en otros dominios.
- Estudio de dinámica de fine-tuning: analizar cómo 125 pasos a 1e-5 con FFT completo modifican los pesos de un modelo de 7B, comparando distancias en el espacio de parámetros respecto al checkpoint de partida.
- Generación de datos sintéticos controlados: usar el modelo para producir respuestas sobre temas de bioseguridad en entornos de laboratorio aislados, con fines de clasificación y filtrado.
- Docencia y divulgación: ilustrar en cursos de seguridad de IA cómo un modelo aparentemente "desaprendido" puede recuperar capacidades con un coste computacional muy bajo (4 GPUs, 125 pasos).

## Benchmarks y rendimiento

El model-index del autor declara una entrada (`artifacts/tamia/models/z7b-wmdp-bio--unlearn-fft-rmu-defense-steps-1000--relearn-fft-long`) con la lista de resultados vacía. No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 14,5 GB solo para pesos (7,24B × 2 bytes), más overhead de activaciones y KV cache; en la práctica, 16-18 GB para contextos cortos.
- Cuantización a 8 bits: en torno a 7-8 GB de pesos; a 4 bits (si se generan pesos GGUF/AWQ a partir de los safetensors, no incluidos en el repo): en torno a 4-5 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S para servicio concurrente; una RTX 4090 (24 GB) es suficiente para inferencia en bf16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en bf16; en GPUs de 12-16 GB requeriría cuantización.
- Opciones de despliegue: transformers, Text Generation Inference (el repo está etiquetado como `text-generation-inference` y `endpoints_compatible`), vLLM; llama.cpp/Ollama solo si se generan pesos GGUF, que no están publicados.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (mremila, z7b-wmdp-bio relearn) | 7,24B | no disponible (entrenado a 512) | Artefacto de investigación en unlearning | no disponible | Hugging Face, 0 descargas |
| Mistral 7B base (referencia de arquitectura) | 7,24B | 8k (versión original) | Modelo generalista | Apache 2.0 | Amplia |
| Checkpoint previo del pipeline (`...unlearn-fft-rmu-defense-steps-5000/checkpoint-1000`) | 7,24B | no disponible | Punto de partida del relearn | no disponible | Referenciado en la config, no verificado |
| Modelos del benchmark WMDP (referencia de evaluación) | variable | no disponible | Evaluación de conocimiento peligroso | variable | Papers académicos |

La comparación con Mistral 7B solo es válida a nivel de arquitectura y tamaño; el fine-tuning sobre el corpus de olvido y el relearn alteran el comportamiento de forma no documentada. No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- La model card no documenta sesgos, datos de evaluación ni comportamiento esperado; cualquier afirmación sobre calidad es especulativa.
- Riesgo de alucinación no evaluado: no hay benchmarks ni conjunto de validación en el entrenamiento (`val_set_size: 0.0`).
- El propósito del artefacto es precisamente estudiar la recuperación de conocimiento supuestamente eliminado; no debe tratarse como un modelo "seguro" por haber pasado por unlearning.
- El corpus WMDP-bio contiene material de bioseguridad sensible; el modelo puede generar contenido relacionado con ese dominio. Su uso debe restringirse a entornos de investigación controlados.
- Licencia no declarada: no se puede asumir uso comercial permitido. La licencia efectiva depende del modelo base Mistral subyacente, que no se identifica con versión ni términos.
- Idiomas no declarados; el comportamiento multilingüe es desconocido.
- Contexto de entrenamiento de solo 512 tokens; no se garantiza un rendimiento correcto más allá de esa longitud aunque la arquitectura base soporte ventanas mayores.
- Repositorio con 0 descargas y 0 likes, creado y actualizado el mismo día: no hay validación comunitaria ni evidencia de reproducibilidad por terceros.
- Pesos de 43,5 GB en safetensors sin versiones cuantizadas publicadas; el despliegue eficiente requiere trabajo adicional de conversión.

## Enlaces

- Hugging Face: https://huggingface.co/mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-rmu-defense-steps-1000-relearn-fft-long
- Dataset utilizado: https://huggingface.co/datasets/cais/wmdp-bio-forget-corpus
- Axolotl (framework de entrenamiento): https://github.com/axolotl-ai-cloud/axolotl
- Paper WMDP (Weapons of Mass Destruction Proxy): no disponible en la información proporcionada
- Paper RMU (Representation Mismatch Regularization): no disponible en la información proporcionada
