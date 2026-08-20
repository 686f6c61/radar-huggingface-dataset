# ledgernova/sn120-8ef1b06acfe8

## Resumen

El modelo `ledgernova/sn120-8ef1b06acfe8` es un checkpoint de 35.107 millones de parámetros (35,1B) desarrollado por el usuario `ledgernova` como parte de la competición de minería de razonamiento **Affine (SN120)** en la red Bittensor. Se trata de un experimento de **offline DPO** (Direct Preference Optimization) aplicado sobre el modelo base `vera6/affine-5g4yy75zuz-t6`, con el objetivo de mejorar la puntuación de razonamiento según el protocolo interno "Reason v4" de la subred. No es un modelo de chat general, sino una submission específica para evaluaciones de duelos entre modelos en dicha red.

La arquitectura subyacente es un **MoE (Mixture of Experts)** basado en Qwen3.5 (etiqueta `qwen3_5_moe`), con soporte de entrada imagen-texto (aunque no se documentan capacidades multimodales en la model card). El entrenamiento se realizó con LoRA de rango 32, alfa 128, beta 0.3 y una tasa de aprendizaje extremadamente baja (5e-7), sobre 19.200 pasos y 4 épocas, con una ventana de contexto de 12.288 tokens. El hardware utilizado fueron 8 GPUs H200, aunque solo 2 se usaron para entrenamiento y merge. El modelo se distribuye en formato `safetensors` (16 shards, ~70 GB) bajo licencia Apache-2.0.

La relevancia de este checkpoint radica en que documenta un enfoque metodológico concreto para optimizar preferencias de razonamiento en modelos MoE mediante DPO offline, con métricas de mejora local frente al "king" reinante de la subred. Sin embargo, su utilidad fuera del ecosistema Bittensor es limitada, ya que no se ha diseñado ni evaluado para tareas generales de conversación o generación de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en Qwen3.5 MoE |
| Parametros totales | 35.107.181.936 |
| Parametros activos | no disponible |
| Longitud de contexto | 12.288 tokens (según `max_len` de entrenamiento) |
| Tipos de cuantizacion | no disponible (solo safetensors originales) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (16 shards, ~70 GB) |

## Arquitectura y entrenamiento

El modelo es un **MoE** (Mixture of Experts) derivado de la familia Qwen3.5, con 35.107 millones de parámetros totales. No se especifica el número de parámetros activos por token, ni la configuración exacta de los expertos. La arquitectura incorpora atención estándar de transformer, pero no se detallan innovaciones como atención lineal o decodificación especulativa.

El entrenamiento se realizó mediante **offline DPO** sobre pares de duelos generados con un ranking de razonamiento interno llamado "Reason v4". El método consiste en calcular, para cada turno, una puntuación `a_i = lpC(y_i|z_A) − lpC(y_i|∅)` (log-probabilidad condicionada al contexto del agente A menos la log-probabilidad sin contexto), y luego aplicar una media log-exponencial temperada sobre k=3 referencias de profesor con τ=0.03. El modelo se optimiza para preferir pensamientos que aumenten la puntuación de Reason del lado del profesor, penalizando respuestas de relleno.

Los hiperparámetros clave del DPO fueron: LoRA r=32 (MidRank), α=128 (HiAlpha), β=0.3 (HiBeta), lr=5e-7 (UltraLoLR), max_len=12288 (SoftCtx), max_steps=19200, epochs=4. El entrenamiento se ejecutó en 8 GPUs H200, usando las GPUs 0 y 1 para entrenamiento y merge, y las GPUs 2 y 3 para evaluaciones en frío. El dataset de preferencias proviene de `dpo_duel_reason.jsonl`, filtrado con criterios "Soft Mid Mid Soft × SoftCtx". No se menciona el número total de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- **Razonamiento optimizado para duelos**: el modelo está específicamente entrenado para mejorar la puntuación de razonamiento según el protocolo Reason v4 de la subred Affine SN120. No se documentan capacidades de razonamiento general fuera de este contexto.
- **Generación de texto**: al ser un modelo de lenguaje, puede generar texto, pero no se ha evaluado su calidad en tareas generales.
- **Soporte de tool calling / function calling**: no disponible, no se menciona en la documentación.
- **Soporte de agentes y multi-step reasoning**: no disponible, aunque el entrenamiento con DPO sobre razonamiento podría implicar cierta capacidad de razonamiento multi-paso, no está documentado.
- **Capacidades multilingües**: no disponible, no se especifican idiomas.
- **Capacidades especiales**: el tag `image-text-to-text` sugiere posible entrada multimodal, pero no hay evidencia en la model card de que el modelo procese imágenes. No se menciona modo de pensamiento explícito ni generación de audio.

## Casos de uso

Dado que el modelo es una submission de minería para Bittensor, sus casos de uso son muy específicos y no orientados a aplicaciones generales. A continuación se listan los escenarios realistas basados en la documentación:

- **Participación en la subred Affine SN120**: el modelo se utiliza como challenger en duelos de razonamiento contra el "king" reinante. Los mineros lo despliegan en la red para obtener recompensas por mejorar la puntuación de Reason v4.
- **Evaluación de razonamiento en entornos controlados**: puede usarse en pipelines de evaluación interna para comparar variantes de DPO y validar hipótesis sobre preferencias de razonamiento.
- **Investigación sobre DPO offline en modelos MoE**: sirve como caso de estudio para analizar el efecto de hiperparámetros como β, r, α y lr en la optimización de preferencias.
- **Generación de texto con contexto largo**: con 12.288 tokens de contexto, podría emplearse en tareas que requieran procesar documentos extensos, aunque no hay evidencia de calidad en dichas tareas.
- **Experimentos de fine-tuning posterior**: al ser un checkpoint intermedio, puede servir como base para nuevos experimentos de alineación o ajuste fino.
- **Benchmarking de eficiencia de inferencia**: su tamaño (35B) permite estudiar el rendimiento de MoE en GPUs de alta gama, aunque no se han publicado mediciones de latencia o throughput.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única métrica reportada es la evaluación local frente al "king" reinante (`vera6/affine-5g4yy75zuz-t6`) bajo el protocolo Reason v4 con `weight_version_key=7`:

| Metrica | Valor |
|---|---|
| Margen de mejora (n80) | +0.004951 |
| Error estandar (SE) | 0.002064 |
| z-score | 2.399 |
| Tamaño de muestra | 80 |
| Barra de decisión (max(2·SE, δ=0.002)) | 0.004127 |
| Ratio de la barra | ~1.20× |
| Mediana de pensamiento | 163 (≥80, cumple) |
| Tasa de pase B | 0.308 (≥0.30, cumple) |
| Decisión | WIN / Stage-5 licensed |

Estos datos provienen de la model card y son específicos del contexto de la competición, no comparables con benchmarks académicos.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no se proporcionan datos oficiales. Con 35.107 millones de parámetros, en FP16 se necesitarían aproximadamente 70 GB de VRAM (sin contar overhead de activaciones). En cuantización de 4 bits (si estuviera disponible) se reduciría a ~18-20 GB, pero no se han publicado versiones cuantizadas.
- **GPU recomendadas**: el entrenamiento usó 8×H200 (80 GB cada una). Para inferencia en FP16 se requeriría al menos una GPU con 80 GB (A100, H100, H200) o varias GPUs en paralelo. En cuantización de 8 bits podría caber en una RTX 4090 (24 GB) o A6000 (48 GB), pero no hay confirmación.
- **Compatibilidad con consumer GPU**: no se ha probado ni documentado. Dado el tamaño, es poco probable que funcione en GPUs de consumo sin cuantización agresiva.
- **Opciones de despliegue**: al ser un modelo de transformers estándar, puede servirse con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama (si se cuantiza). No hay instrucciones específicas del autor.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría. Es un checkpoint experimental específico de la subred Affine SN120, sin benchmarks públicos ni documentación de rendimiento general. Los modelos comparables en tamaño (35B) como Qwen2.5-32B, Mixtral-8x7B o DeepSeek-V2-Lite tienen propósitos y entrenamientos muy diferentes, por lo que una comparación directa no sería significativa. Se indica "no disponible" para esta sección.

## Limitaciones y advertencias

- **No es un modelo de chat general**: la model card lo declara explícitamente como "SN120 Affine miner submission / evalsrv Reason v4 duel. Not a general chat model". Su uso fuera de la competición Bittensor no está soportado ni evaluado.
- **Sesgos y alucinaciones**: no se han realizado evaluaciones de sesgos ni de fiabilidad factual. Al ser un modelo entrenado con DPO sobre preferencias de razonamiento, podría presentar alucinaciones en tareas de conocimiento general.
- **Limitaciones de contexto**: la ventana de 12.288 tokens es relativamente corta para aplicaciones modernas de contexto largo, y no se ha probado su comportamiento con secuencias más largas.
- **Restricciones de licencia**: aunque la licencia es Apache-2.0, la model card indica que se debe seguir la "política de artefactos de minería de Affine". Esto puede implicar restricciones adicionales sobre el uso comercial o la redistribución, no detalladas en la documentación.
- **Riesgo de obsolescencia**: al ser un checkpoint de un experimento específico (R938), su validez depende del estado de la subred y de las versiones del protocolo Reason. Si el protocolo cambia, el modelo podría quedar obsoleto.
- **Falta de documentación**: no se especifican los datos de entrenamiento, la composición del dataset, ni los criterios de filtrado más allá de nombres de archivo. Esto dificulta la reproducibilidad y la evaluación de riesgos.

## Enlaces

- [HuggingFace: ledgernova/sn120-8ef1b06acfe8](https://huggingface.co/ledgernova/sn120-8ef1b06acfe8)
- [Perfil de ledgernova en GitHub](https://github.com/ledgernova)
- [Página de la subred Affine (SN120) en Bittensor](https://bittensor.ai/subnets/120)
- [Repositorio LedgerNova (no relacionado directamente, pero aparece en búsquedas)](https://github.com/ArmandSegall/LedgerNova)
