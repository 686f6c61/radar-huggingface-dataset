# mkd-hossain/Keural-Cortex-8B-pilot

## Resumen

Keural Cortex 8B — pilot run es un checkpoint de validación publicado por MKD Co., Ltd. (usuario `mkd-hossain`) como parte del proyecto Keural Cortex 8B. Se trata de un continued pretraining (CPT) sobre el modelo base `Qwen/Qwen3-8B-Base`, entrenado con 3.000 millones de tokens (954 pasos) con el objetivo de validar una receta de entrenamiento que mejore el rendimiento en coreano sin degradar el inglés. Es un artefacto de investigación, no un producto listo para producción.

El modelo hereda la arquitectura Qwen3 (transformer decoder-only) y su ventana de contexto nativa de 32.768 tokens. Aunque el nombre sugiere 8B de parámetros, los pesos publicados en safetensors suman 2.047.683.840 parámetros, lo que resulta inconsistente con el tamaño del modelo base; esta discrepancia no está aclarada en la documentación. El checkpoint se publica bajo licencia Apache 2.0 y solo soporta los idiomas coreano e inglés.

La relevancia de este lanzamiento radica en que sirve como compuerta (gate) para decidir si se lanza el entrenamiento completo de 41B tokens. El autor reporta un veredicto PASS: el coreano mejora ligeramente en promedio (+0,55) y el inglés se mantiene dentro de la tolerancia (−0,5 pt), aunque con matices importantes que se detallan en la sección de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) |
| Parametros totales | 2.047.683.840 (segun safetensors; el modelo base Qwen3-8B tiene ~8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 |
| Tipos de cuantizacion | no disponible (solo safetensors en fp16/bf16) |
| Idiomas soportados | coreano, ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un continued pretraining de `Qwen/Qwen3-8B-Base`, un transformer decoder-only con atención de ventana completa y flash attention 2. El entrenamiento se realizó con 3.000 millones de tokens (954 pasos, secuencia de 4.096, batch global de 3.145.728 tokens/paso) en 4 GPU H200 con FSDP full shard, precisión bf16 y reducción de gradientes en fp32. El learning rate se fijó deliberadamente en 1e-5 (frente a los 3e-4 típicos de pretraining) para priorizar la retención del conocimiento existente sobre la adquisición rápida de coreano; se usó un scheduler WSD (2% warmup, 88% stable, 10% decay, min ratio 0.1) y AdamW con β=(0.9, 0.95), weight decay 0.1 y grad clip 1.0.

El corpus proviene de un manifiesto de 19 fuentes con 38,78B tokens (coreano, inglés, código y ciencia/matemáticas), muestreado proporcionalmente por peso. No se aplicó RLHF ni DPO; el modelo conserva la naturaleza de base model. La pérdida final fue ~1.82–1.94.

## Capacidades

- Generación de texto en coreano e inglés, con continuación de texto sin formato de instrucciones.
- Comprensión de contexto largo nativo de 32.768 tokens.
- No tiene capacidades de chat, tool calling, function calling, agentes, razonamiento multi-step ni thinking mode.
- No soporta visión ni audio.
- Es un modelo base: no sigue instrucciones, no mantiene diálogo y puede divagar o repetir texto.
- El `chat_template.jinja` heredado del tokenizer base no indica ajuste conversacional.

## Casos de uso

- Validación de recetas de continued pretraining: este checkpoint permite comparar el efecto de un CPT de 3B tokens sobre Qwen3-8B-Base en métricas coreanas e inglesas, sirviendo como punto de control para decidir si lanzar un run completo (41B tokens). Es el uso previsto por el autor.
- Reproducibilidad de experimentos de CPT: al publicar los hiperparámetros y el corpus, el modelo sirve como referencia para reproducir el pipeline de entrenamiento en otros entornos.
- Estudio de transferencia de conocimiento entre idiomas: los resultados en benchmarks coreanos e ingleses permiten analizar cómo el CPT afecta a cada idioma y si existe regresión cruzada.
- Ablación de hiperparámetros: investigadores pueden usar este checkpoint para aislar el efecto del learning rate bajo (1e-5) frente a otros valores en la retención del modelo base.
- Referencia para análisis de decontaminación: dado que no se ha realizado decontaminación de benchmarks, el modelo puede servir para estudiar el solapamiento n-grama entre corpus de entrenamiento y conjuntos de evaluación.
- Evaluación de infraestructura de entrenamiento: el pipeline FSDP con 4× H200 documentado puede replicarse para validar configuraciones de hardware antes de lanzar entrenamientos más grandes.

## Benchmarks y rendimiento

El autor reporta resultados de evaluación con `lm-evaluation-harness` comparando contra `Qwen3-8B-Base` bajo condiciones idénticas. Estos datos son internos y no han pasado por decontaminación de benchmarks.

### Coreano

| Benchmark | Qwen3-8B-Base | Pilot | Δ |
|---|---|---|---|
| KMMLU | 53.91 | 53.94 | +0.03 |
| HaeRae | 63.06 | 63.15 | +0.09 |
| KoBEST BoolQ | 57.05 | 62.96 | **+5.91** |
| KoBEST COPA | 72.30 | 70.40 | −1.90 |
| KoBEST HellaSwag | 47.20 | 47.60 | +0.40 |
| KoBEST SentiNeg | 83.88 | 82.62 | −1.26 |
| **Media** | | | **+0.55** |

### Ingles

| Benchmark | Qwen3-8B-Base | Pilot | Δ |
|---|---|---|---|
| MMLU | 74.70 | 74.24 | −0.46 |
| ARC-Challenge (acc_norm) | 57.25 | 59.30 | +2.05 |
| HellaSwag (acc_norm) | 78.59 | 78.38 | −0.21 |
| WinoGrande | 72.38 | 73.48 | +1.10 |
| **Media** | | | **+0.62** |

El autor advierte que la mejora media en coreano está impulsada principalmente por KoBEST BoolQ (+5.91), una tarea binaria donde un cambio de calibración puede explicar el resultado; los dos benchmarks sustantivos de conocimiento coreano (KMMLU y HaeRae) permanecen planos. Además, GSM8K no es comparable entre base (1.319 muestras, 84.69) y pilot (300 muestras, 85.33). No se ha realizado decontaminación, por lo que estos números no son publicables.

## Requisitos de hardware

- El checkpoint pesa 16.4 GB en safetensors, lo que sugiere que los pesos están en fp16/bf16 y requieren al menos 16 GB de VRAM para inferencia sin cuantización.
- Con cuantización de 8 bits o 4 bits, podría ejecutarse en GPUs de consumo como RTX 3090/4090 (24 GB) o incluso RTX 4060 Ti (16 GB) en 4 bits, aunque no hay datos oficiales.
- Para entrenamiento se usaron 4× H200 (141 GB cada una) con FSDP full shard; no se dispone de requisitos mínimos documentados para inferencia.
- Opciones de despliegue: al ser un modelo base con formato safetensors, puede cargarse con transformers, vLLM, TGI o llama.cpp (si se convierte a GGUF). No se han publicado configuraciones de latencia o throughput.

## Comparativa con modelos similares

El punto de comparación natural es el modelo base original `Qwen/Qwen3-8B-Base`, del cual deriva. No se dispone de datos de otros modelos bilingües coreano-inglés en la información proporcionada.

| Modelo | Parámetros | Contexto | Licencia | Rendimiento coreano (media) | Rendimiento inglés (media) |
|---|---|---|---|---|---|
| Qwen3-8B-Base | ~8B | 32.768 | Apache 2.0 | KMMLU 53.91, HaeRae 63.06 | MMLU 74.70 |
| Keural Cortex 8B pilot | 2.047.683.840 (según safetensors) | 32.768 | Apache 2.0 | +0.55 vs base | +0.62 vs base |

No se dispone de comparación con otros CPT coreanos como Polyglot-Ko o Llama-Ko, ya que no se han proporcionado datos.

## Limitaciones y advertencias

- Es un **modelo base**: no sigue instrucciones, no tiene chat, tool calling ni thinking mode. Su uso en producción o como asistente conversacional no es apropiado.
- El autor declara explícitamente que es un "validation artifact, not a product" y que no debe usarse para fines productivos ni para afirmaciones de capacidad.
- Los resultados de benchmarks no han pasado por decontaminación; pueden existir solapamientos entre el corpus de entrenamiento y los conjuntos de evaluación, lo que invalida su uso como métrica publicable.
- La mejora en coreano es marginal y está concentrada en una única tarea binaria (KoBEST BoolQ); dos de las tareas coreanas (COPA y SentiNeg) empeoran.
- El dato de parámetros totales en safetensors (2.047.683.840) no coincide con el nombre del modelo (8B); esta inconsistencia no está documentada y puede indicar un error en la publicación o un subconjunto de pesos.
- No se han realizado pruebas de sesgos ni de alucinación; al ser un modelo base, el riesgo de generación de texto incoherente o repetitivo es alto.
- La licencia Apache 2.0 permite uso comercial, pero el autor desaconseja cualquier uso fuera de investigación interna.

## Enlaces

- [Página del modelo en Hugging Face](https://huggingface.co/mkd-hossain/Keural-Cortex-8B-pilot)
- [Perfil del autor en Hugging Face](https://huggingface.co/mkd-hossain)
- [Repositorio GitHub del proyecto Keural](https://github.com/mkd-hossain/keural-model)
- [Repositorio GitHub del pipeline de entrenamiento](https://github.com/mkd-hossain/Keural-Model-Training)
- [Sitio web de MKD](https://keural.com/)
