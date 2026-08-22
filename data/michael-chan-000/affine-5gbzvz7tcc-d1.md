# michael-chan-000/affine-5GbZvZ7tcC-d1

## Resumen

El modelo `michael-chan-000/affine-5GbZvZ7tcC-d1` es un fine-tuning de tipo offline DPO sobre el modelo base `vera6/affine-5g4yy75zuz-t6`, desarrollado por el usuario michael-chan-000. Se presenta como un "challenger" dentro del sistema de evaluación interno denominado "Affine SN120" para la métrica "Reason v4" (weight_version_key=7). No es un modelo de chat general, sino una pieza experimental orientada a optimizar una preferencia específica: respuestas que eleven la puntuación "Reason" calculada por un conjunto de profesores (teacher refs) mediante una media log-exp temperada sobre k=3 muestras.

Con 35.107.181.936 parámetros (~35B) y un tamaño de repositorio de 70.2 GB en formato safetensors, el modelo se entrenó con LoRA (r=32, α=128, β=0.1) sobre 8 GPUs B200, con una ventana de contexto de 12288 tokens durante el entrenamiento. La licencia es Apache-2.0, aunque sujeta a la política de artefactos de minería Affine del modelo base. El resultado reportado frente al modelo base es una victoria (WIN) con margen +0.003665, z=2.177 y n=80, lo que lo habilita como "Stage-5 licensed" dentro de su pipeline experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (tag `qwen3_5_moe`), basada en Qwen3.5 |
| Parametros totales | 35.107.181.936 (~35B) |
| Parametros activos | no disponible |
| Longitud de contexto | 12288 (max_len de entrenamiento; contexto real no especificado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (con política adicional de artefactos Affine) |
| Formato de pesos | safetensors (16 shards, BF16) |

## Arquitectura y entrenamiento

La arquitectura está etiquetada como `qwen3_5_moe`, lo que indica una mezcla de expertos (Mixture of Experts) derivada de la familia Qwen3.5. No se especifican detalles sobre el número de expertos ni los parámetros activos. El modelo es un fine-tuning del checkpoint `vera6/affine-5g4yy75zuz-t6@8e3f1695e058837ed80fec3238ff439fdc2d0f0e` mediante **offline DPO** (Direct Preference Optimization) sobre pares de duelo rankeados por la métrica "Reason". No se usó SFT ni GRPO online.

El entrenamiento utilizó LoRA con r=32, α=128, β=0.1, learning rate de 5e-7, max_len=12288, max_steps=19200 y 4 épocas. Los datos provienen de `dpo_duel_reason.jsonl` con un filtrado SoftCtx, y el proceso se ejecutó en 8×B200 GPUs. La innovación principal es la optimización de una preferencia basada en "Reason", una métrica que combina log-probabilidades condicionadas a un profesor (`lpC(y_i|z_A)`) y no condicionadas (`lpC(y_i|∅)`), con una media log-exp temperada (τ=0.03) sobre k=3 referencias.

## Capacidades

- Generación de texto autoregresivo, pero **no** como modelo de chat general; su uso previsto es como submission en el sistema de evaluación "Affine SN120" para duelos de "Reason v4".
- Optimización de respuestas que maximizan la métrica "Reason" definida por el sistema de profesores (teacher-side reasoning).
- Soporte de tool calling: no documentado.
- Soporte de agentes y multi-step reasoning: no documentado; el modelo está diseñado para un pipeline específico de evaluación, no para uso agéntico.
- Capacidades multilingües: no disponibles.
- Capacidades especiales: el tag `image-text-to-text` sugiere posible entrada multimodal, pero no hay documentación al respecto; se considera no disponible.

## Casos de uso

- **Evaluación interna de modelos (duelos)**: el modelo se usa como "challenger" en el sistema Affine SN120 para comparar su puntuación "Reason" contra el modelo base. Es adecuado porque fue entrenado específicamente para mejorar esa métrica.
- **Minería de preferencias (offline DPO)**: puede servir como generador de respuestas preferidas en pipelines de recopilación de datos para futuros entrenamientos, dado que su entrenamiento se basó en duelos rankeados.
- **Investigación en optimización de preferencias**: útil para estudiar el efecto de hiperparámetros como β, LoRA rank y learning rate en la calidad de respuestas bajo métricas no estándar.
- **Componente en pipelines de razonamiento multi-profesor**: al estar diseñado para interactuar con k=3 teacher refs, puede integrarse en sistemas que requieran consenso entre múltiples modelos.
- **Pruebas de robustez de métricas internas**: sirve para validar la estabilidad de la métrica "Reason" frente a variaciones en el modelo generador.
- **No recomendado para producción general**: su naturaleza experimental y falta de documentación de capacidades conversacionales lo desaconsejan para chatbots, generación de código o atención al cliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato de rendimiento reportado es interno, comparando contra el modelo base bajo la métrica "Reason v4" (wvk=7):

| Metrica | Valor |
|---|---|
| Margen vs base | +0.003665 |
| Error estandar (SE) | 0.001684 |
| z-score | 2.177 |
| n | 80 |
| Barra de victoria (max(2·SE, δ=0.002)) | 0.003367 (~1.088×) |
| Mediana de pensamiento | 141.5 (≥80 ✓) |
| Tasa de pase B | 0.5375 (≥0.30 ✓) |
| Decision | WIN / Stage-5 licensed |

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 35B parámetros en BF16, se requieren aproximadamente 70 GB de VRAM (tamaño del repo). Sin cuantización, no cabe en GPUs consumer típicas (RTX 4090 con 24 GB, RTX 3090 con 24 GB).
- **GPU recomendadas**: para inferencia completa en BF16, se necesitan GPUs de datacenter como A100 80GB, H100 80GB o B200. Con cuantización (no documentada) podría reducirse, pero no hay datos.
- **Opciones de despliegue**: al ser un modelo de transformers, puede servirse con vLLM, TGI o llama.cpp (si se convierte a GGUF), pero no hay configuraciones oficiales. El tag `endpoints_compatible` sugiere compatibilidad con plataformas de inferencia gestionada.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con modelos de la misma categoría. El modelo es un fine-tuning específico del base `vera6/affine-5g4yy75zuz-t6`, y no se conocen especificaciones de ese base ni de otros modelos del mismo autor (p. ej., `affine-5GbZvZ7tcC-h2` o `affine-5Eh8v9zUpcBwNLRzE3bRv2FFhnaNPERRLdvEH8SdwLiahUh8`). La comparativa queda limitada al resultado interno reportado frente al base.

## Limitaciones y advertencias

- **No es un modelo de chat general**: la model card lo declara explícitamente como "Not a general chat model". Su uso fuera del pipeline Affine SN120 no está soportado.
- **Sesgos y alucinación**: no hay documentación sobre sesgos; como todo modelo generativo, existe riesgo de alucinación, pero al estar diseñado para un contexto de evaluación cerrado, su exposición es limitada.
- **Dependencia de la métrica "Reason"**: el modelo está optimizado para una métrica interna que requiere un sistema de profesores (teacher refs) y un cálculo específico; fuera de ese entorno, su comportamiento no está garantizado.
- **Restricciones de licencia**: aunque la licencia es Apache-2.0, la model card indica que sigue la "política de artefactos de minería Affine", lo que puede imponer restricciones adicionales al uso comercial o redistribución.
- **Falta de documentación**: no se especifican idiomas, cuantizaciones, ni detalles de la arquitectura MoE (número de expertos, activos). Tampoco hay información sobre el contexto real del modelo más allá del max_len de entrenamiento.
- **Fecha de creación futura**: el modelo está fechado en 2026-08-22, lo que sugiere que es un artefacto experimental reciente; su estabilidad a largo plazo no está verificada.

## Enlaces

- [HuggingFace: michael-chan-000/affine-5GbZvZ7tcC-d1](https://huggingface.co/michael-chan-000/affine-5GbZvZ7tcC-d1)
- [Perfil del autor en HuggingFace](https://huggingface.co/michael-chan-000)
- [Modelo relacionado: affine-5GbZvZ7tcC-h2](https://huggingface.co/michael-chan-000/affine-5GbZvZ7tcC-h2)
- [Modelo relacionado: affine-5Eh8v9zUpcBwNLRzE3bRv2FFhnaNPERRLdvEH8SdwLiahUh8 (llm-explorer)](https://llm-explorer.com/model/michael-chan-000%2Faffine-5Eh8v9zUpcBwNLRzE3bRv2FFhnaNPERRLdvEH8SdwLiahUh8,3rpOQPfwyZAHsR4er1dcga)
