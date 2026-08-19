# bodenmaurice/Affine-5czsc2fc98-r861-vera-odpo-midrank-midbeta-softctx-megaextra-ep4-ultralolr-merged

## Resumen

El modelo `bodenmaurice/Affine-5czsc2fc98-r861-vera-odpo-midrank-midbeta-softctx-megaextra-ep4-ultralolr-merged` es un checkpoint especializado dentro del ecosistema de minería Affine SN120, diseñado como *challenger* para la evaluación de razonamiento **Reason v4** (con `weight_version_key=7`). Desarrollado por bodenmaurice sobre la base `vera6/affine-5g4yy75zuz-t6` (revisión `8e3f1695`), el modelo se entrenó mediante **offline DPO** sobre pares de duelos clasificados por una métrica de razonamiento multi-muestral, y no como un modelo de chat de propósito general.

Con **35.107 millones de parámetros** (~35,1B) y un repositorio de 70,2 GB en 16 shards safetensors, el modelo se posiciona como una iteración experimental en una línea de investigación que explora el impacto de hiperparámetros LoRA (r=32, α=128, β=0.1, lr=5e-7) y contextos largos (max_len=12288) sobre la calidad del razonamiento preferido por el evaluador Reason v4. El modelo declara la licencia Apache-2.0 y está orientado exclusivamente a la presentación en el sistema de minería SN120, no a uso conversacional general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 MoE (etiqueta `qwen3_5_moe`), multimodal imagen-texto (etiqueta `image-text-to-text`, no confirmada en la model card) |
| Parametros totales | 35.107.181.936 (~35,1B) |
| Parametros activos | no disponible |
| Longitud de contexto | 12.288 tokens (max_len de entrenamiento, SoftCtx); contexto real del modelo no especificado |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (16 shards, ~66 GB) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura **Qwen3.5 MoE** (según las etiquetas del repositorio) y se entrenó con un ajuste fino **LoRA** de rango 32 y alpha 128 sobre la base `vera6/affine-5g4yy75zuz-t6`. El método de entrenamiento es **offline DPO** (no SFT ni GRPO online), optimizando preferencias sobre pares de duelos filtrados del dataset `dpo_duel_reason.jsonl` (~259–604 filas en el lanzamiento). La función objetivo utiliza una métrica de razonamiento *tempered multi-sample log-mean-exp* sobre k=3 referencias de profesor con τ=0.03, donde por turno se calcula `a_i = lpC(y_i|z_A) − lpC(y_i|∅)` y `Reason = τ·log(mean_i exp(a_i/τ))`. El entrenamiento se ejecutó durante 19.200 pasos con 4 épocas, una tasa de aprendizaje de 5e-7 y β=0.1, en 8 GPUs B200. El modelo resultante es una fusión (*merged*) de los pesos LoRA con la base, con `weight_identical=false`.

## Capacidades

- Generación de texto especializada en razonamiento evaluado por el sistema Reason v4 (no apto para chat general).
- Optimización de preferencias de razonamiento multi-paso mediante DPO offline.
- Manejo de contexto largo (12.288 tokens) gracias a la configuración SoftCtx.
- Capacidad de operar como *challenger* en el sistema de minería SN120, compitiendo contra el *king* vigente en duelos de evaluación.
- Soporte de evaluación con múltiples referencias de profesor (k=3) y mecanismo *fail-closed* si el sello no coincide con la versión v4.
- Compatible con el ecosistema transformers y pipelines de text-generation.

## Casos de uso

- **Minería SN120 en Affine**: el modelo se presenta como *challenger* en el sistema de minería, compitiendo contra el *king* vigente (`vera6/affine-5g4yy75zuz-t6`) en duelos de evaluación Reason v4. Su diseño específico para este propósito lo hace adecuado para maximizar la métrica de razonamiento.
- **Investigación en optimización de preferencias offline**: el entrenamiento con DPO offline sobre pares de duelos clasificados permite estudiar cómo la preferencia por pensamientos que elevan el Reason del lado del profesor afecta a la calidad del razonamiento generado.
- **Estudio de hiperparámetros LoRA**: con r=32, α=128, β=0.1 y lr=5e-7, el modelo sirve como referencia para investigar el impacto de rangos medios y tasas de aprendizaje ultrabajas en el ajuste fino de modelos MoE de ~35B.
- **Análisis de contextos largos (SoftCtx)**: la configuración de max_len=12.288 permite evaluar cómo el entrenamiento con ventanas de contexto extendidas influye en la coherencia del razonamiento en tareas de evaluación prolongadas.
- **Evaluación de escalado de entrenamiento**: con 19.200 pasos y 4 épocas sobre un dataset reducido (~259–604 filas), el modelo permite estudiar el comportamiento del DPO offline con datasets pequeños y pasos de entrenamiento extensos.
- **Investigación sobre métricas de razonamiento multi-muestral**: la implementación de la función Reason con log-mean-exp temperado (τ=0.03) y k=3 referencias ofrece un caso práctico para investigar métricas de evaluación de razonamiento en sistemas de minería distribuida.

## Benchmarks y rendimiento

Los datos de rendimiento disponibles provienen de la evaluación local del modelo contra el *king* vigente bajo la métrica Reason v4 (wvk=7), con n=80 muestras:

| Metrica | Valor |
|---|---|
| Margen vs king (n80) | +0,003665 |
| Error estandar (SE) | 0,001684 |
| z-score | 2,177 |
| Barra de aprobacion (max(2·SE, δ=0.002)) | 0,003367 (~1,088×) |
| Mediana de pensamiento | 141,5 (umbral ≥80, cumplido) |
| Tasa de pase B | 0,5375 (umbral ≥0,30, cumplido) |
| k (referencias de profesor) | 3 |
| τ (temperatura) | 0,03 |
| Decision | WIN / Stage-5 licensed |

No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- **VRAM para inferencia**: los pesos en bf16 ocupan ~66 GB, por lo que se requiere al menos 80 GB de VRAM para inferencia sin cuantización. No se especifican cuantizaciones disponibles.
- **GPU recomendadas**: el entrenamiento se realizó en 8×NVIDIA B200. Para inferencia, una GPU con 80 GB o más (H100, A100 80GB, B200) sería necesaria para cargar los pesos completos.
- **GPU de consumo**: no cabe en GPUs de consumo actuales (RTX 4090 con 24 GB, RTX 5090 con 32 GB) sin cuantización; no se documentan versiones cuantizadas.
- **Opciones de despliegue**: compatible con transformers y pipelines de text-generation; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI en la documentación disponible.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Metodo | Licencia | Notas |
|---|---|---|---|---|---|
| `bodenmaurice/Affine-5czsc2fc98-r861-...` (este modelo) | ~35,1B | 12.288 (entrenamiento) | Offline DPO | Apache-2.0 | Challenger SN120, Reason v4 |
| `unconst/Affine-5czsc2fc98-r492-offline-dpo-ultraalpha-midrank-...` | no disponible | no disponible | Offline DPO | no disponible | Iteración anterior (r492) de la misma línea experimental |
| `vera6/affine-5g4yy75zuz-t6` (base) | no disponible | no disponible | no disponible | no disponible | *King* vigente (reign36), modelo base del challenger |

No se dispone de datos suficientes sobre modelos comparables fuera del ecosistema Affine para establecer una comparativa con modelos generalistas de ~35B.

## Limitaciones y advertencias

- **No es un modelo de chat general**: la propia model card indica explícitamente "Not a general chat model". Su uso está restringido a la presentación como *challenger* en el sistema de minería SN120 y a la evaluación Reason v4.
- **Dataset de entrenamiento muy reducido**: entre ~259 y 604 filas de datos de preferencias, lo que puede limitar la generalización fuera de las tareas de evaluación específicas.
- **Dependencia del evaluador Reason v4**: el modelo está optimizado para una métrica concreta (`weight_version_key=7`) y utiliza un mecanismo *fail-closed* si el sello no coincide con la versión v4, lo que lo hace inutilizable fuera de ese contexto.
- **Riesgo de alucinación y sesgos**: no se documentan evaluaciones de sesgos ni de alucinación; al ser un modelo de razonamiento especializado, estos riesgos no están caracterizados.
- **Idiomas**: no se especifican los idiomas soportados, lo que impide garantizar su comportamiento en castellano u otros idiomas.
- **Restricciones de licencia**: aunque la licencia declarada es Apache-2.0, la model card indica que se rige por la política de artefactos de minería Affine, que puede imponer restricciones adicionales no detalladas en la documentación disponible.
- **Reproducibilidad**: el repositorio tiene 0 descargas y 0 likes, y la fecha de creación (2026-08-19) es muy reciente; la comunidad no ha validado aún los resultados declarados.

## Enlaces

- [Repositorio HuggingFace del modelo](https://huggingface.co/bodenmaurice/Affine-5czsc2fc98-r861-vera-odpo-midrank-midbeta-softctx-megaextra-ep4-ultralolr-merged)
- [Modelo base: vera6/affine-5g4yy75zuz-t6](https://huggingface.co/vera6/affine-5g4yy75zuz-t6) (referenciado en la model card)
- [Modelo relacionado: unconst/Affine-5czsc2fc98-r492-offline-dpo-ultraalpha-midrank-extrasteps-lora](https://huggingface.co/unconst/Affine-5czsc2fc98-r492-offline-dpo-ultraalpha-midrank-extrasteps-lora) (iteración r492 de la misma línea experimental)
