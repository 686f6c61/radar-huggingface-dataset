# crazyape777/mir-unconst-affine-5czsc2fc98-r938-vera-odpo

## Resumen

El modelo `crazyape777/mir-unconst-affine-5czsc2fc98-r938-vera-odpo` es un adaptador LoRA entrenado mediante *offline DPO* (Direct Preference Optimization) sobre el modelo base `vera6/affine-5g4yy75zuz-t6`, un checkpoint de la familia Affine SN120. El desarrollador, `crazyape777`, lo presenta como un "challenger" para la evaluación interna denominada **Reason v4** (`weight_version_key=7`), un sistema de puntuación que mide la calidad de los razonamientos generados por el modelo mediante una métrica de *log-mean-exp* sobre múltiples muestras.

El problema que resuelve es específico: optimizar las preferencias del modelo hacia pensamientos o razonamientos que incrementen la puntuación "Reason" del lado del profesor (teacher-side), en lugar de optimizar directamente la respuesta final. Esto se logra mediante pares de duelo (duel pairs) filtrados y un proceso de entrenamiento con hiperparámetros muy concretos (LoRA r=32, α=128, β=0.3, lr=5e-7). No es un modelo de chat generalista, sino una pieza de un pipeline de minería de datos para evaluaciones internas.

La relevancia actual radica en que representa un experimento dentro de una línea de investigación sobre *offline DPO* con ranking de razonamiento, comparado contra variantes con contexto corto, medio y otras configuraciones de rango. El checkpoint ha sido validado localmente contra el "rey vivo" (live king) con una ventaja estadísticamente significativa (z=2.399, n=80), lo que lo convierte en un candidato para la etapa 5 de licenciamiento en su ecosistema.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformers (basada en `vera6/affine-5g4yy75zuz-t6`, familia Affine SN120) |
| Parametros totales | 35.107.181.936 (del modelo base, en safetensors) |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | 12288 (max_len de entrenamiento, SoftCtx) |
| Tipos de cuantizacion | no disponible (repo en safetensors, 16 shards) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (sigue la politica de artefactos de mineria Affine) |
| Formato de pesos | safetensors (16 shards, ~66 GB) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 32 (MidRank) con alpha 128 (HiAlpha) y beta 0.3 (HiBeta), entrenado sobre el checkpoint base `vera6/affine-5g4yy75zuz-t6` en su revision `8e3f1695e058837ed80fec3238ff439fdc2d0f0e`. El metodo es *offline DPO* sobre pares de preferencia de duelo filtrados del archivo `dpo_duel_reason.jsonl`, bajo el experimento `r938-vera-offline-dpo-hialpha-midrank-hibeta-softctx-megasuperextrasteps-ep4-ultralolr`. No se aplico SFT ni GRPO online.

La innovacion clave es la funcion de recompensa "Reason v4": por cada turno se calcula `a_i = lpC(y_i|z_A) − lpC(y_i|∅)` (diferencia de log-probabilidades condicionadas), y la recompensa final es `Reason = τ·log(mean_i exp(a_i/τ))` con τ=0.03 y k=3 referencias de profesor. Ademas, se exige que la mediana de los pensamientos sea ≥80 y que el pase B sea ≥0.30. El entrenamiento uso 8×H200 (solo GPUs 0,1 para train+merge) con learning rate de 5e-7 (UltraLoLR), 19200 pasos (MegaSuperExtra) y 4 epocas.

## Capacidades

- Generacion de texto con razonamiento optimizado para la metrica interna "Reason v4" (no para calidad general de chat).
- Preferencia por pensamientos que incrementan la puntuacion del profesor (teacher-side next-action mode).
- Manejo de contexto largo (hasta 12288 tokens) gracias a SoftCtx.
- Capacidad de duelo (duel) contra otros checkpoints en el entorno de evaluacion SN120.
- No es un modelo de proposito general: no se reportan capacidades de tool calling, vision, audio ni agentes.

## Casos de uso

- Evaluacion interna de modelos: el checkpoint se usa como "challenger" en el sistema de duelos de la familia Affine, compitiendo contra el "live king" para decidir promociones de etapa.
- Mineria de preferencias: sirve para generar pares de preferencia etiquetados que alimentan futuros entrenamientos de DPO en el pipeline de la organizacion.
- Validacion de hipotesis de investigacion: permite aislar el efecto de SoftCtx + MidRank + HiBeta frente a variantes con contexto corto o rango alto (R924, R923, R862).
- Benchmark de razonamiento interno: se puede usar para medir la calidad de razonamiento bajo la metrica Reason v4 en comparacion con otros checkpoints.
- Filtrado de datos: el modelo puede emplearse para puntuar y filtrar datos de entrenamiento segun su contribucion al "Reason" del profesor.
- Experimentos de offline DPO: como referencia para reproducir o extender la linea de investigacion sobre DPO con ranking de pensamientos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos de rendimiento son internos:

| Metrica | Valor |
|---|---|
| Margen vs live king (wvk=7) | +0.004951 |
| Error estandar (SE) | 0.002064 |
| z-score | 2.399 |
| n (tamano de muestra) | 80 |
| Barra de exito (max(2·SE, δ=0.002)) | 0.004127 (~1.20×) |
| Mediana de pensamiento | 163 (≥80 ✓) |
| Pase B | 0.308 (≥0.30 ✓) |
| Decision | WIN / Stage-5 licensed |

## Requisitos de hardware

- El entrenamiento se realizo en 8×H200 (NVIDIA), usando solo 2 GPUs para train+merge y 2 para evaluacion en frio.
- Para inferencia, al ser un adaptador LoRA sobre un modelo de 35B parametros, se necesita al menos una GPU con 24-48 GB de VRAM para cargar el modelo base en precision media (dependiendo de la cuantizacion).
- En consumer GPUs (RTX 4090 24GB) solo seria viable con cuantizacion agresiva (4-bit) y offloading, pero no se proporcionan datos de latencia o throughput.
- Opciones de despliegue: al ser un adaptador PEFT, se puede integrar con transformers + PEFT, o exportar a GGUF para llama.cpp/Ollama (no verificado).
- No se dispone de datos de latencia o throughput estimados.

## Comparativa con modelos similares

| Modelo | Base | Metodo | Contexto | Rango LoRA | Resultado |
|---|---|---|---|---|---|
| `r938` (este) | vera6/affine-5g4yy75zuz-t6 | offline DPO SoftCtx MidRank HiBeta | 12288 | r=32, α=128 | WIN vs king (z=2.399) |
| `r924` (MidCtx Hiβ) | mismo base | offline DPO MidCtx HiBeta | medio | no disponible | no supera a r938 |
| `r923` (ShortCtx Hiβ) | mismo base | offline DPO ShortCtx HiBeta | corto | no disponible | REFUTE ~0.56× |
| `r862` (SoftCtx Hiβ HiRank) | mismo base | offline DPO SoftCtx HiBeta HiRank | 12288 | r alto | no supera a r938 |

No se dispone de comparativas con modelos externos a la familia Affine.

## Limitaciones y advertencias

- No es un modelo de chat general: su uso previsto es exclusivamente como "SN120 Affine miner submission / evalsrv Reason v4 duel".
- La licencia apache-2.0 se aplica al adaptador, pero el modelo base y los artefactos de mineria Affine pueden tener restricciones adicionales no especificadas.
- Riesgo de alucinacion y sesgos no evaluados: no se reportan evaluaciones de seguridad, sesgos o robustez.
- Dependencia de la metrica interna Reason v4: el rendimiento optimizado puede no trasladarse a tareas de razonamiento estandar.
- El entrenamiento uso un subconjunto muy filtrado de datos de duelos, lo que puede limitar la generalizacion.
- No se proporcionan instrucciones de uso en produccion ni ejemplos de inferencia.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/crazyape777/mir-unconst-affine-5czsc2fc98-r938-vera-odpo
- Modelo base: https://huggingface.co/vera6/affine-5g4yy75zuz-t6
- Variante anterior (r861): https://huggingface.co/crazyape777/mir-unconst-affine-5czsc2fc98-r861-vera-odpo
- Modelo relacionado (r252): https://huggingface.co/crazyape777/fk-unconst-Affine-5czsc2fc98-r252-merged
- Modelo relacionado (r579): https://huggingface.co/unconst/Affine-5czsc2fc98-r579-r252-odpo-midrank-longctx-megaextra-merged
- Modelo relacionado (r822): https://huggingface.co/crazyape777/mir-822-odpo-hirank-midbeta
- Adaptador LoRA h64: https://huggingface.co/unconst/Affine-5czsc2fc98-h64-lora
