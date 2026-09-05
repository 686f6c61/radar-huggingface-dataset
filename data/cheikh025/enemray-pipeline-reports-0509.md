# cheikh025/enemray-pipeline-reports-0509

## Resumen

Este repositorio de Hugging Face no contiene un modelo de inferencia listo para usar, sino un panel de estado (status dashboard) del pipeline de entrenamiento del proyecto ENEMRAY. El objetivo del proyecto es adaptar el checkpoint base `google/gemma-4-E4B` al dialecto hassaniya hablado en Mauritania, mediante una secuencia de etapas de continued pretraining (CPT), task grafting, supervised fine-tuning (SFT) y alineación con preferencias (PPO/DPO). El repositorio, publicado por el usuario `cheikh025`, documenta el progreso de estas etapas con métricas como loss, pasos, objetivos de entrenamiento y repositorios asociados. No se proporcionan pesos finales, licencia, ni información sobre la arquitectura completa o el contexto del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder transformer (Gemma 4, 42 capas de texto segun model card) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se menciona checkpoint 16-bit standalone y BF16 en el pipeline) |
| Idiomas soportados | no disponible (el proyecto se centra en hassaniya, pero no se confirma soporte) |
| Licencia | no disponible |
| Formato de pesos | no disponible (se menciona checkpoint 16-bit, sin formato estandar) |

## Arquitectura y entrenamiento

La model card confirma que el modelo base es `google/gemma-4-E4B`, un decoder transformer con 42 capas de texto. El entrenamiento documentado consta de varias etapas:

- **Stage 1 (CPT con LoRA):** fine-tuning en las capas 0-9 y 40-41, con 1.282 pasos, loss de entrenamiento de 6.11 a 3.109, y 37.6 GiB de VRAM utilizada en una NVIDIA H100 80GB.
- **Stage 1.5:** diagnóstico de continuación del CPT, con confirmación de generación auténtica de tokens en hassaniya.
- **Stage 2 (Task grafting):** escalado de tareas con factor gamma = 0.7 mediante aritmética de deltas en FP32, con retención del 100% en matemáticas, inglés y multiturno verificada.
- **Stage 3 (SFT):** entrenamiento supervisado con 46.532 diálogos y 294 objetivos de lenguaje lineal, en progreso sobre H100.
- **Stage 3.5:** preparación de un dataset upsampleado con 52.953 conversaciones (3x poesía, 2x diálogo).
- **Phase 4:** preparación de adaptadores LoRA modulares para poesía, conversación y traducción.
- **Phase 5:** generación de un dataset de preferencia PPO/DPO con 5.140 pares verificados.

No se detalla la composición del dataset de preentrenamiento ni si se aplicó RLHF completo más allá de la preparación de datos de preferencia.

## Capacidades

- Generación de texto en hassaniya: confirmada en la etapa 1.5 del pipeline.
- Retención de capacidades en matemáticas, inglés y multiturno: confirmada al 100% tras el task grafting.
- Baterías de evaluación cualitativa planificadas: poesía, conversación, traducción y seguridad (según el documento `BASELINE_EVALUATION_REPORT_0509.md`).
- No se dispone de información sobre soporte de tool calling, function calling, vision, audio, ni razonamiento multi-step.

## Casos de uso

No se han confirmado casos de uso reales porque el repositorio no contiene un modelo final. Según el pipeline documentado, los objetivos del proyecto apuntan a los siguientes escenarios, que deberán validarse cuando se complete el modelo:

- Adaptacion de modelos base a idiomas de bajo recurso: el pipeline usa CPT con LoRA sobre capas especificas para incorporar hassaniya sin perder capacidades generales.
- Monitorizacion de entrenamiento de modelos de lenguaje: este repositorio funciona como dashboard de estado, con seguimiento de pasos, loss y repositorios asociados.
- Evaluacion de retencion de habilidades tras fine-tuning: las pruebas de retencion en matematicas, ingles y multiturno permiten detectar degradacion catastrofica.
- Preparacion de datos de preferencia para alineacion: el dataset de 5.140 pares se diseno para entrenar modelos con PPO/DPO respetando estandares culturales y de seguridad.
- Traduccion automatica de y hacia hassaniya: la fase de expert adapters incluye un corpus especifico para traduccion.
- Asistentes conversacionales en hassaniya: el dataset de 46.532 dialogos y las pruebas de conversacion sugieren este uso.
- Generacion de poesia en hassaniya: la bateria de evaluacion de poesia y el dataset upsampleado 3x en poesia indican este objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Entrenamiento: NVIDIA H100 80GB HBM3, PyTorch 2.8.0+cu128, micro-batch 16, 37.6 GiB VRAM en la etapa CPT.
- Inferencia: no disponible.
- Opciones de despliegue: no disponibles.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible.

## Limitaciones y advertencias

- El repositorio no contiene un modelo final; es un panel de estado del pipeline de entrenamiento.
- No se especifica licencia, por lo que el uso comercial es dudoso.
- No hay informacion sobre idiomas soportados, longitud de contexto ni cuantizaciones de inferencia.
- No se han publicado benchmarks.
- El numero de descargas y likes es 0, lo que indica falta de validacion por la comunidad.
- La composicion del dataset de preentrenamiento no esta documentada en detalle.
- El riesgo de alucinacion no ha sido evaluado.

## Enlaces

- https://huggingface.co/cheikh025/enemray-pipeline-reports-0509
- https://huggingface.co/cheikh025/enemray-merged
- https://huggingface.co/cheikh025/enemray-qwen3.5-2b-cpt-lora
- https://huggingface.co/cheikh025/enemray-gemma4-e4b-cpt-lora-0509
- https://huggingface.co/cheikh025/enemray-gemma4-e4b-grafted-gamma-0.7-0509
- https://huggingface.co/cheikh025/enemray-gemma4-e4b-sft-lora-0509
- https://huggingface.co/cheikh025/enemray-gemma4-e4b-final-merged-16bit-0509
- https://huggingface.co/cheikh025/enemray-gemma4-e4b-sft-v2-upsampled-0509
- https://huggingface.co/datasets/cheikh025/enemray-hassaniya-ppo-preference-0509
