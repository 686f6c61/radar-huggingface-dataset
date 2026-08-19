# best26/Affine-5czsc2fc98-r861-vera-odpo-midrank-midbeta-softctx-megaextra-ep4-ultralolr-merged

## Resumen

El modelo `best26/Affine-5czsc2fc98-r861-vera-odpo-midrank-midbeta-softctx-megaextra-ep4-ultralolr-merged` es un checkpoint experimental de la serie Affine, desarrollado por best26 sobre la base `vera6/affine-5g4yy75zuz-t6` (revisión `8e3f1695e058837ed80fec3238ff439fdc2d0f0e`). No es un modelo de propósito general para chat o generación de texto estándar: está diseñado exclusivamente como una sumisión de minería para el sistema de evaluación de duelos "Reason v4" (`weight_version_key=7`), en el que compite contra el "king" (el mejor modelo actual) en partidas de razonamiento multi-turno.

La arquitectura se basa en `qwen3_5_moe` (Mixture of Experts) y cuenta con 35.107.181.936 parámetros totales. El entrenamiento se realizó mediante *offline DPO* (Direct Preference Optimization) sobre pares de duelos filtrados, con una configuración de LoRA de rango 32 y una tasa de aprendizaje extremadamente baja (5e-7). El resultado del duelo de validación fue una victoria sobre el "king" con un margen de +0.003665, lo que lo licenció para la etapa 5 del sistema Affine.

Su relevancia es principalmente para el ecosistema de investigación y minería de Affine, donde se evalúan mejoras iterativas de razonamiento en modelos MoE. No se publican datos de rendimiento en benchmarks estándar como MMLU o HumanEval, y su uso comercial o general no está recomendado por el autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en `qwen3_5_moe` |
| Parámetros totales | 35.107.181.936 (35,2 B) |
| Parámetros activos | no disponible (MoE, no se especifica) |
| Longitud de contexto | 12288 tokens (según hiperparámetro `max_len`) |
| Tipos de cuantización | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (16 shards, ~70,2 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de su base `vera6/affine-5g5yy75zuz-t6`, que es un modelo MoE basado en `qwen3_5_moe`. No se proporcionan detalles sobre el número de expertos, la dimensión oculta ni la composición exacta del dataset de entrenamiento. El entrenamiento se realizó mediante *offline DPO* sobre pares de duelos preferidos, filtrados por el sistema de "Reason v4" (una métrica que mide la calidad del razonamiento multi-turno). Se usó LoRA con r=32, α=128 y β=0.1, con una tasa de aprendizaje de 5e-7 y 19200 pasos máximos (4 épocas). Los datos provienen de `dpo_duel_reason.jsonl`, con entre 259 y 604 filas al inicio. No se menciona SFT ni GRPO online. El hardware fue un pod de 8×NVIDIA B200 GPUs.

## Capacidades

- **Razonamiento multi-turno**: optimizado para duelos de razonamiento (Reason v4), donde se evalúa la preferencia entre respuestas de un mismo turno.
- **Generación de texto**: puede generar texto en formato conversacional, pero no está diseñado para ello.
- **Evaluación de preferencias**: capaz de producir respuestas que maximizan el "Reason score" según el sistema de evaluación.
- **Soporte de tool calling**: no disponible (no se menciona).
- **Capacidades multilingües**: no disponible (no se especifica).
- **Vision / audio**: no disponible (aunque el tag `image-text-to-text` aparece en los metadatos, no se detalla).

## Casos de uso

- **Sumisión en el sistema de minería Affine**: el uso principal es competir como "challenger" en duelos de razonamiento contra el "king" actual, evaluando la calidad de las respuestas generadas.
- **Investigación en optimización de preferencias**: sirve como ejemplo de aplicación de *offline DPO* con LoRA de bajo rango para mejorar modelos MoE en tareas de razonamiento.
- **Evaluación de razonamiento automático**: puede usarse en entornos de evaluación que implementen el protocolo Reason v4 para medir la calidad de respuestas multi-turno.
- **Generación de datos de entrenamiento**: aunque no es el propósito, podría usarse para generar datos sintéticos de razonamiento en duelos, aunque su licencia y naturaleza experimental lo desaconsejan.
- **Experimentos de alineación**: dado que se entrenó con DPO, puede servir para estudiar cómo la preferencia de pensamiento (teacher-side Reason) afecta la calidad del modelo.
- **Benchmark de modelos MoE**: útil para comparar estrategias de fine-tuning (LoRA, β, etc.) en la misma familia de modelos Affine.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La evaluación específica del sistema Affine (Reason v4, `wvk=7`) contra el "king" `vera6/affine-5g5yy75zuz-t6` dio los siguientes resultados:

| Métrica | Valor |
|---|---|
| Margen (local vs king) | +0.003665 |
| Error estándar (SE) | 0.001684 |
| Z-score | 2.177 |
| Tamaño de muestra (n) | 80 |
| Bar (max(2·SE, δ=0.002)) | 0.003367 (≈1.09×) |
| Pensamiento mediano | 141.5 (≥80, cumple) |
| Tasa de pase B | 0.5375 (≥0.30, cumple) |
| Decisión | WIN / Stage-5 licensed |

## Requisitos de hardware

- **Entrenamiento**: se usó un pod de 8×NVIDIA B200 GPUs (en el experimento se usaron 4 y 5 GPUs del pod para train+merge+serve).
- **Inferencia**: no hay datos específicos de VRAM, pero con 35,2 B de parámetros MoE y pesos en safetensors (70,2 GB), se estima que se necesitan al menos 80 GB de VRAM en FP16 para cargar el modelo completo. En cuantización (no disponible) podría reducirse.
- **GPUs recomendadas**: NVIDIA A100 80GB, H100 80GB, o B200 para inferencia eficiente.
- **Despliegue**: compatible con la librería `transformers` (pipeline `text-generation`). No se menciona soporte para vLLM, llama.cpp, Ollama o TGI, aunque podría ser posible con adaptación.
- **Latencia/throughput**: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con otros de la misma categoría. La familia Affine incluye otros checkpoints (como `unconst/Affine-5czsc2fc98-r492-offline-dpo-ultraalpha-midrank...` y `...-r495-offline-dpo-hialpha-midrank-lobeta-midctx...`), pero no se han publicado sus especificaciones ni resultados en la información proporcionada. Por tanto, la comparativa con modelos similares no está disponible.

## Limitaciones y advertencias

- **No es un modelo de chat general**: el autor indica explícitamente "Not a general chat model". Usarlo para aplicaciones de chat o generación de texto general puede dar resultados subóptimos.
- **Dependencia del sistema Reason v4**: el modelo fue entrenado y evaluado bajo un protocolo específico (con `weight_version_key=7`, `τ=0.03`, etc.). Si se usa fuera de ese sistema, su comportamiento puede degradarse.
- **Riesgo de sesgos y alucinaciones**: no se ha evaluado su comportamiento en tareas fuera de los duelos de razonamiento; no hay datos sobre sesgos de género, raza u otros.
- **Licencia**: aunque la licencia es Apache-2.0, el autor indica que sigue la política de artefactos de minería Affine, lo que puede imponer restricciones adicionales de uso o redistribución.
- **Datos de entrenamiento limitados**: el dataset de preferencias es pequeño (259–604 filas), lo que puede limitar la generalización.
- **Sin soporte de herramientas ni agentes**: no se ha implementado tool calling ni integración con agentes.
- **Contexto limitado**: la ventana de contexto es de 12288 tokens, que puede ser corta para aplicaciones de razonamiento extenso.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/best26/Affine-5czsc2fc98-r861-vera-w3po-midrank-midbeta-softctx-enter-ultralolr-merged)
- [Modelo base `vera6/affine-5g5yy75zuz-t6`](https://huggingface.co/vera6/affine-5g5yy75zuz-t6)
- [Artículo sobre Nvidia Vera CPU (referencia al nombre "vera", no relacionado con el modelo)](https://www.tomshardware.com/pc-components/cpus/nvidia-spills-the-beans-on-vera-cpu-spec-benchmarks-revealed-olympus-architecture-detailed-and-more)
- [VesselFinder (irrelevante)](https://www.vesselfinder.com/)
- [FARFETCH (irrelevante)](https://www.farfetch.com/)</think>## Resumen

El modelo `best26/Affine-5czsc2fc98-r861-vera-odpo-midrank-midbeta-softctx-megaextra-ep4-ultralolr-merged` es un checkpoint experimental de la serie Affine, desarrollado por best26 sobre la base `vera6/affine-5g4yy75zuz-t6` (revisión `8e3f1695e058837ed80fec3238ff439fdc2d0f0e`). No se trata de un modelo de propósito general para chat o generación de texto estándar: está diseñado específicamente como una sumisión al sistema de minería Affine, compitiendo en duelos de razonamiento bajo el protocolo "Reason v4" (`weight_version_key=7`). Su objetivo es generar respuestas que maximicen una métrica de razonamiento multi-turno, evaluada frente al "king" (el modelo vigente) en partidas de duelo.

La arquitectura se basa en `qwen3_5_moe` (Mixture of Experts) y cuenta con 35.107.181.936 parámetros totales. El entrenamiento se realizó mediante *offline DPO* (Direct Preference Optimization) sobre pares de duelos filtrados, con LoRA de rango 32 y una tasa de aprendizaje extremadamente baja (5e-7). El resultado del duelo de validación fue una victoria (WIN) con un margen de +0.003665 sobre el king, lo que le otorgó licencia para la etapa 5 del sistema. El modelo no es apto para tareas generales y su uso comercial o en producción requiere precaución.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en `qwen3_5_moe` |
| Parámetros totales | 35.107.181.936 (35,2 B) |
| Parámetros activos | no disponible (MoE, no se especifica) |
| Longitud de contexto | 12288 tokens (según hiperparámetro `max_len`) |
| Tipos de cuantización | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (16 shards, 70,2 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de su base `vera6/affine-5g4yy75zuz-t6`, que es un modelo MoE de la familia `qwen3_5_moe`. No se han publicado detalles sobre el número de expertos, la dimensión de las capas o el mecanismo de mezcla. El entrenamiento se realizó mediante *offline DPO* (no SFT, no GRPO online) sobre pares de duelos preferidos, filtrados según el criterio de Reason v4. Los datos provienen de `dpo_duel_reason.jsonl`, con un tamaño de entre 259 y 604 filas en el lanzamiento. La configuración de LoRA fue r=32, α=128 y β=0.1, con una tasa de aprendizaje de 5e-7, longitud máxima de 12288 tokens, 19200 pasos y 4 épocas. El hardware de entrenamiento fue un pod de 8×NVIDIA B200 GPUs (usando las GPUs 4 y 5 para train+merge+serve).

## Capacidades

- **Razonamiento multi-turno**: optimizado para evaluar y mejorar la calidad del razonamiento en duelos del sistema Reason v4.
- **Generación de texto**: puede generar respuestas en formato conversacional, aunque no está diseñado para ello.
- **Preferencia de pensamiento**: entrenado para favorecer pensamientos que elevan la métrica "Reason" del lado del profesor (teacher).
- **Evaluación de alternativas**: capaz de comparar múltiples respuestas y elegir la que maximiza el score de Reason.
- **Tool calling / function calling**: no disponible (no se especifica).
- **Capacidades de agente**: no disponible.
- **Multilingüismo**: no disponible (no se especifican idiomas).
- **Vision / audio**: aunque los tags incluyen `image-text-to-text`, no se detalla ninguna capacidad multimodal real.

## Casos de uso

- **Sistema de minería Affine**: como "challenger" en duelos de razonamiento contra el king vigente, para validar mejoras iterativas del modelo.
- **Evaluación de razonamiento automático**: puede usarse en entornos que implementen el protocolo Reason v4 para puntuar y comparar respuestas multi-turno.
- **Investigación en DPO offline**: sirve como caso de estudio de optimización de preferencias con LoRA de rango medio y beta intermedio.
- **Experimentos de alineación**: para analizar cómo la preferencia de pensamientos (teacher-side) afecta a la calidad del razonamiento.
- **Generación de datos sintéticos**: aunque no es su propósito principal, podría generar respuestas para construir datasets de duelos de razonamiento.
- **Benchmark de plataforma MoE**: puede usarse para probar el rendimiento de inferencia en GPUs de gran tamaño (B200, H100, etc.).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La evaluación específica del sistema de duelos (Reason v4, `n=80`) dio los siguientes resultados:

| Métrica | Resultado |
|---|---|
| Margen vs king | +0.003665 |
| Error estándar (SE) | 0.001684 |
| Z (statístico) | 2.18 |
| Barra `max(2·SE, δ=0.002)` | 0.003367 |
| Relación con la barra | 1.09× |
| Mediana del pensamiento | 141.5 (≥80, cumple) |
| Tasa de pase B | 0.5375 (≥0.30, cumple) |
| Decisión | WIN / Stage-5 licensed |

Estos datos son específicos del sistema de evaluación interno, no comparables con benchmarks públicos.

## Requisitos de hardware

- **Entrenamiento**: se utilizó un pod de 8×NVIDIA B200 GPUs (solo las GPUs 4 y 5 para train+merge+serve).
- **Inferencia**: no hay datos de VRAM específica, pero con 35,2 B de parámetros MoE y pesos en safetensors (70,2 GB), se estima que se necesitan al menos 80 GB de VRAM en una sola GPU para carga completa en FP16 (posiblemente más con overhead).
- **GPUs recomendadas**: NVIDIA A100 80GB, H100 80GB, B200 80GB o similar; en consumer no es viable (una RTX 4090 con 24 GB no sería suficiente para el modelo completo).
- **Opciones de despliegue**: compatible con `transformers` (pipeline `text-generation`); no se menciona soporte para vLLM, llama.cpp, Ollama o TGI.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con modelos de la misma categoría. Existen otros checkpoints de la serie Affine (como `unconstraint/Affine-5czsc2fc98-r492-offline-dpo-...` o `...-r495-offline-dpo-...`), pero no se han publicado sus especificaciones ni métricas en la información disponible. Por tanto, la comparativa con modelos similares no está disponible.

## Limitaciones y advertencias

- **No es un modelo de chat general**: el autor indica explícitamente "Not a general chat model". Usarlo para aplicaciones de chat o generación general puede producir resultados subóptimos.
- **Dependencia del protocolo Reason v4**: su rendimiento está ligado a ese sistema de evaluación; fuera de él, su comportamiento puede degradarse.
- **Riesgo de alucinación**: no se ha evaluado su precisión en tareas factuales fuera de los duelos de razonamiento.
- **Sesgos desconocidos**: no se han documentado sesgos, pero al estar entrenado con un dataset pequeño y específico, pueden existir sesgos no detectados.
- **Restricciones de licencia**: aunque la licencia es Apache-2.0, el autor menciona que sigue la política de artefactos de minería Affine, lo que puede implicar restricciones adicionales de uso comercial o redistribución.
- **Contexto limitado**: la ventana de contexto es de 12288 tokens, lo que puede ser insuficiente para tareas que requieran contextos largos.
- **Datos de entrenamiento limitados**: con solo 259–604 filas de preferencias, la generalización puede ser pobre.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/best26/Affine-5czsc2fc98-r861-vera-odpo-midrank-midbeta-softctx-megaextra-ep4-ultralolr-merged)
- [Modelo base `vera6/affine-5g4yy75zuz-t6`](https://huggingface.co/vera6/affine-5g4yy75zuz-t6)
- [Artículo de Tom's Hardware sobre Nvidia Vera CPU (referencia al nombre "vera")](https://www.tomshardware.com/pc-components/cpus/nvidia-spills-the-beans-on-vera-cpu-spec-benchmarks-revealed-olympus-architecture-detailed-and-more)
