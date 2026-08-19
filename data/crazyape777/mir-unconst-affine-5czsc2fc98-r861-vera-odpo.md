# crazyape777/mir-unconst-affine-5czsc2fc98-r861-vera-odpo

## Resumen

El modelo `crazyape777/mir-unconst-affine-5czsc2fc98-r861-vera-odpo` es un checkpoint de la serie Affine, desarrollado por el usuario `crazyape777`, que participa en un sistema de minería de modelos denominado "Affine SN120 challenger". Está diseñado específicamente para optimizar la métrica interna "Reason v4" mediante un entrenamiento de DPO offline sobre pares de duelos preferidos, no como un modelo de chat general. Su base es `vera6/affine-5g4yy75zuz-t6`, un modelo de la familia Affine que parece emplear una arquitectura MoE (según los tags `qwen3_5_moe`). El checkpoint tiene 35.107.091.936 parámetros (~35.1B) y un tamaño de repositorio de 70.2 GB en formato safetensors. Su relevancia radica en la aplicación de técnicas avanzadas de alineación (offline DPO con LoRA de rango medio, alto alpha y baja tasa de aprendizaje) para mejorar el razonamiento en un entorno de evaluación específico, aunque no está destinado a uso general.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 MoE (según tags; no se especifica detalle) |
| Parametros totales | 35.107.091.936 (~35.1B) |
| Parametros activos | no disponible |
| Longitud de contexto | 12.288 tokens (max_len de entrenamiento) |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (16 shards, ~66 GB) |

## Arquitectura y entrenamiento

El modelo se basa en el checkpoint `vera6/affine-5g4yy75zuz-t6` (revisión `8e3f1695e058837ed80fec3238ff439fdc2d0f0e`), que pertenece a la serie Affine. Los tags indican una arquitectura MoE (posiblemente Qwen3.5 MoE), pero no se dispone de detalles sobre el número de expertos, el tamaño de los expertos activos ni la estructura interna. El entrenamiento se realizó mediante **offline DPO** (Direct Preference Optimization) sobre pares de duelos preferidos, filtrados por un sistema de puntuación "Reason" que utiliza un log-mean-exp temperado (τ=0.03) sobre k=3 referencias de profesor. No se empleó SFT ni GRPO online. Se aplicó LoRA con r=32, α=128, β=0.1, lr=5e-7, max_len=12288 y max_steps=19200 durante 4 épocas. El objetivo era favorecer pensamientos (thoughts) que incrementen la puntuación "Reason" del lado del profesor, penalizando contenido de relleno. El entrenamiento se ejecutó en 8×B200 GPUs (hardware Lium "mine-crown-1").

## Capacidades

- Generación de texto y razonamiento específico para el sistema de evaluación Reason v4.
- Optimización de preferencias de pensamiento mediante DPO offline.
- Capacidad de procesar secuencias largas (hasta 12.288 tokens en entrenamiento).
- No se ha documentado soporte para tool calling, agentes o capacidades multimodales (a pesar del tag `image-text-to-text`, el pipeline es `text-generation` y no hay evidencia de funcionalidad multimodal).
- No es un modelo de propósito general; su uso está restringido a tareas de minería Affine.

## Casos de uso

- **Investigación en alineación de modelos**: el checkpoint sirve como referencia para estudiar el impacto de DPO offline con hiperparámetros específicos (LoRA de rango medio, alpha alto, lr extremadamente baja) sobre la calidad del razonamiento.
- **Evaluación de métricas internas**: se puede utilizar para comparar la puntuación "Reason" frente a otros checkpoints en el marco de la minería Affine, como se hizo con el margen +0.003665 y z=2.177.
- **Prueba de técnicas de regularización**: el uso de `SoftCtx` (max_len=12288) y `MidRank` (r=32) ofrece un punto de referencia para estudiar la estabilidad del entrenamiento con contextos largos.
- **Análisis de estabilidad numérica**: al usar una tasa de aprendizaje de 5e-7 y β=0.1, puede servir para estudiar la sensibilidad del entrenamiento DPO a valores extremos.
- **Benchmark interno**: sirve como "challenger" en el sistema de evaluación Reason v4, ayudando a calibrar los umbrales de decisión (por ejemplo, la mediana de |z|≥80 y B pass≥0.30).
- **Exploración de arquitecturas MoE**: aunque no se detalla la arquitectura, su tamaño (35B) y su formato MoE pueden ser útiles para probar técnicas de cuantización o paralelismo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de rendimiento provienen de la evaluación interna del sistema de minería:

| Métrica | Valor |
|---|---|
| Margen (vs rey reinado 36) | +0.003665 |
| Error estándar | 0.001684 |
| Z-score | 2.177 |
| Tamaño de muestra (n) | 80 |
| Mediana de |z| | 141.5 |
| B pass | 0.5375 |
| Decisión | WIN / Stage-5 licenciado |

Estos datos son específicos del contexto de evaluación y no son comparables con benchmarks estándar.

## Requisitos de hardware

- **VRAM estimada**: con 35.1B parámetros, la inferencia en FP16 requeriría ~70 GB de VRAM. Con cuantización a 8 bits (no documentada) se podría reducir a ~35 GB, y a 4 bits a ~17 GB, pero no hay confirmación de formatos de cuantización disponibles.
- **GPU recomendadas**: para inferencia en FP16 se necesitaría una GPU con al menos 80 GB (A100 80GB, H100 80GB, B200). Con cuantización a 8 bits, una RTX 4090 (24 GB) no sería suficiente; se necesitaría al menos una A6000 (48 GB) o similar.
- **Opciones de despliegue**: no se mencionan herramientas específicas (vLLM, llama.cpp, etc.). Dado que es un modelo de la familia Transformers, podría usarse con Hugging Face Transformers y PEFT, pero no hay confirmación de compatibilidad con otros frameworks.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría. El modelo base `vera6/affine-5g4yy75zuz-t6` es el único punto de referencia, pero no se han publicado métricas de comparación en benchmarks estándar. No se puede realizar una comparativa fiable.

## Limitaciones y advertencias

- **Uso restringido**: el modelo no está diseñado para chat general ni aplicaciones comerciales; su propósito es exclusivamente para el sistema de minería Affine.
- **Dependencia de la métrica Reason**: el rendimiento está optimizado para una métrica interna (Reason v4) que puede no correlacionarse con la calidad general del lenguaje.
- **Sesgos y alucinaciones**: no se han evaluado sesgos ni tasas de alucinación en este modelo.
- **Licencia**: aunque la licencia es Apache-2.0, la model card menciona una "Affine mining artifacts policy" que puede imponer restricciones adicionales no especificadas.
- **Contexto de entrenamiento**: el max_len de 12.288 tokens podría limitar el contexto de inferencia, aunque no se especifica.
- **Reproducibilidad**: no se proporcionan detalles sobre el dataset de entrenamiento (solo se menciona `dpo_duel_reason.jsonl` con ~259-604 filas), lo que dificulta la replicación.

## Enlaces

- [HuggingFace - modelo](https://huggingface.co/crazyape777/mir-unconst-affine-5czsc2fc98-r861-vera-odpo)
- [HuggingFace - modelo base `vera6/affine-5g4yy75zuz-t6`](https://huggingface.co/vera6/affine-5g4yy75zuz-t6) (no se proporcionó enlace directo, pero se menciona)
- [Resultados de búsqueda: modelos similares de la serie Affine](https://huggingface.co/unconst/Affine-5czsc2fc98-h77-lora) (enlace de referencia, no del modelo)
