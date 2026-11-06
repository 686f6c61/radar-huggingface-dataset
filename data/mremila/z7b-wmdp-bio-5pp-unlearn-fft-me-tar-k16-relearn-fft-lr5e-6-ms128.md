# mremila/z7b-wmdp-bio-5pp-unlearn-fft-me-tar-k16-relearn-fft-lr5e-6-ms128

## Resumen

El modelo `z7b-wmdp-bio-5pp-unlearn-fft-me-tar-k16-relearn-fft-lr5e-6-ms128` es un checkpoint de investigacion publicado por el usuario mremila en Hugging Face. Se trata del estado final (paso 128) de un ataque de *relearning* (reaprendizaje) de parametros completos sobre el modelo `z7b-wmdp-bio-5pp-unlearn-fft-me-tar-k16`, que a su vez es una variante del Zephyr-7B-beta sometida a un proceso de *unlearning* (desaprendizaje) del corpus WMDP-Bio. El objetivo del experimento es medir la resistencia a la manipulacion (*tamper-resistance*) de una defensa de desaprendizaje frente a un reentrenamiento adversarial.

El modelo no es un modelo de proposito general ni esta pensado para uso en produccion: es un artefacto de evaluacion que documenta cuanto conocimiento peligroso de bioseguridad puede recuperarse tras un ataque de fine-tuning sobre un modelo previamente "desaprendido". La relevancia es metodologica, para quienes investigan seguridad de modelos, evaluacion de unlearning y robustez de defensas.

Arquitectura transformer decoder-only tipo Mistral (base Zephyr-7B-beta), con 7.241.732.096 parametros totales, pesos en safetensors y licencia MIT. Solo se declara soporte para ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Zephyr-7B-beta, familia Mistral) |
| Parametros totales | 7.241.732.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; al ser safetensors es convertible a GGUF/AWQ/GPTQ con herramientas externas |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Zephyr-7B-beta (transformer decoder-only de la familia Mistral, con atencion por ventanas deslizantes y RoPE, aunque la model card no detalla estos extremos). El checkpoint es el resultado de un ataque de *relearning* de parametros completos (full fine-tuning) sobre el modelo defendido `z7b-wmdp-bio-5pp-unlearn-fft-me-tar-k16`. El entrenamiento uso el split de entrenamiento del dataset `cais/wmdp-bio-forget-corpus` con el formato `data.wmdp_zephyr`, optimizador AdamW, learning rate inicial `5e-6` con decaimiento lineal, sin warmup ni weight decay, 128 pasos de optimizador, longitud de secuencia 512, microbatch 1, acumulacion de gradiente 1, semilla de entrenamiento 1, semilla de datos 42 y precision BF16.

La innovacion metodologica no esta en la arquitectura sino en el diseno experimental: se parte de un modelo al que se le ha aplicado una defensa de desaprendizaje con presupuesto de seleccion `5pp` (el tag `5pp` identifica el presupuesto del modelo padre defendido, no una restriccion de utilidad sobre el ataque), y se mide la recuperacion de capacidad peligrosa tras 128 pasos de reentrenamiento. El repositorio contiene solo el checkpoint final; la trayectoria completa de ocho checkpoints no se incluye.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Zephyr-7B-beta.
- Razonamiento general y respuesta a preguntas de dominio multiple (evaluado en `mmlu_no_bio`).
- Capacidad residual de respuesta en el dominio de bioseguridad WMDP-Bio tras el ataque (evaluado en `wmdp_bio_robust`).
- Soporte de tool calling / function calling: no documentado en la model card.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: limitadas al ingles segun los metadatos.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Investigacion en seguridad de modelos: usar el checkpoint como referencia del estado final de un ataque de relearning para comparar con el modelo defendido y cuantificar la recuperacion de conocimiento peligroso.
- Evaluacion de robustez de defensas de unlearning: medir la diferencia de accuracy en `wmdp_bio_robust` entre el padre defendido y este checkpoint tras 128 pasos, para estimar la resistencia a la manipulacion.
- Reproducibilidad de experimentos: el repositorio incluye `eval_results.json` y `training_config.yml`, lo que permite replicar exactamente la configuracion de entrenamiento y evaluacion.
- Estudio de dinamicas de fine-tuning adversarial: analizar como un learning rate bajo (`5e-6`) y pocos pasos (128) bastan para alterar el comportamiento de un modelo desaprendido.
- Benchmarking de pipelines de evaluacion: usar las metricas zero-shot de lm-eval como punto de control para validar implementaciones propias de `wmdp_bio_robust` y `mmlu_no_bio`.
- Analisis de trade-off utilidad/peligro: comparar la accuracy en `mmlu_no_bio` (48.74 %) con la del padre para estudiar si el ataque degrada capacidades generales.

## Benchmarks y rendimiento

Resultados zero-shot de lm-eval para este checkpoint exacto, segun la model card:

| Tarea | Accuracy (%) | Error estandar (pp) |
|---|---:|---:|
| wmdp_bio_robust | 35.02 | 1.62 |
| mmlu_no_bio | 48.74 | 0.42 |

No se han publicado en la informacion disponible resultados comparativos con el modelo padre defendido ni con Zephyr-7B-beta original.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 14,5 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda 24 GB o mas.
- Cuantizacion a 8 bits: alrededor de 7-8 GB de VRAM; a 4 bits: alrededor de 4-5 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue en BF16; RTX 4090 (24 GB) suficiente para BF16 con `device_map="auto"`; RTX 3090/4080 (16-24 GB) viable en cuantizacion.
- Cabe en GPU de consumo: si, en RTX 4090 en BF16 y en GPUs de 8-12 GB con cuantizacion 4/8 bits.
- Opciones de despliegue: `transformers` (segun la model card), `text-generation-inference` (tag `text-generation-inference`), y conversiones a llama.cpp/Ollama/vLLM mediante herramientas externas (no documentadas por el autor).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---:|---|---|---|
| Este checkpoint | 7,24 B | no disponible | MIT | Checkpoint final de ataque de relearning |
| mremila/z7b-wmdp-bio-5pp-unlearn-fft-me-tar-k16 (padre) | 7,24 B (presumible) | no disponible | MIT (presumible) | Modelo defendido con unlearning |
| Zephyr-7B-beta (base original) | 7,24 B | 32k (segun documentacion publica de Zephyr) | MIT | Modelo conversacional de proposito general |

No se dispone de datos de rendimiento comparativos entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion: no esta disenado ni validado para uso en produccion.
- Riesgo de contenido peligroso: el checkpoint esta entrenado para recuperar conocimiento de bioseguridad del corpus WMDP-Bio; su uso debe restringirse a entornos controlados de evaluacion de seguridad.
- Sesgos: no documentados en la model card; hereda los del modelo base Zephyr-7B-beta.
- Riesgo de alucinacion: no evaluado especificamente en esta ficha; el modelo base es propenso a generar contenido plausible pero incorrecto.
- Limitaciones de idioma: solo se declara ingles.
- Limitaciones de contexto: la longitud de contexto no se especifica en la model card.
- Restricciones de licencia: MIT permite uso comercial, pero el contenido de bioseguridad recuperado puede estar sujeto a normativa de exportacion o bioseguridad en la jurisdiccion del usuario.
- Caveat de evaluacion: los resultados son especificos de la configuracion de entrenamiento y evaluacion descrita; no deben generalizarse a otros presupuestos de ataque.
- Solo se publica el checkpoint final (paso 128); la trayectoria completa de ocho checkpoints no esta incluida, lo que limita el analisis de la dinamica del ataque.

## Enlaces

- Hugging Face: https://huggingface.co/mremila/z7b-wmdp-bio-5pp-unlearn-fft-me-tar-k16-relearn-fft-lr5e-6-ms128
- Modelo padre defendido: https://huggingface.co/mremila/z7b-wmdp-bio-5pp-unlearn-fft-me-tar-k16
- Dataset WMDP-Bio forget corpus: https://huggingface.co/datasets/cais/wmdp-bio-forget-corpus
- Modelo base original (Zephyr-7B-beta): https://huggingface.co/HuggingFaceH4/zephyr-7b-beta
