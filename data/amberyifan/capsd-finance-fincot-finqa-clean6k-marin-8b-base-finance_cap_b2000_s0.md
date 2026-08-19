# AmberYifan/capsd-finance-fincot-finqa-clean6k-marin-8b-base-finance_cap_b2000_s0

## Resumen

El modelo `capsd-finance-fincot-finqa-clean6k-marin-8b-base-finance_cap_b2000_s0` es un ajuste fino (fine-tuning) del modelo base `marin-community/marin-8b-base`, desarrollado por el usuario AmberYifan. Está diseñado específicamente para tareas de dominio financiero, entrenado sobre un dataset denominado `capsd_marin-8b-base-n6000-finance-fincot-finqa-clean6k__mix_finance_cap_b2000_s0`, que combina datos de FinCOT y FinQA (razonamiento y respuesta a preguntas financieras). El modelo tiene aproximadamente 8 030 millones de parámetros y se distribuye en formato safetensors.

La relevancia de este modelo radica en su especialización en finanzas, un área donde los modelos generalistas suelen fallar en términos de precisión y comprensión de jerga específica. Al ser un ajuste fino sobre una base de 8B, ofrece un equilibrio entre capacidad y requisitos de hardware moderados, lo que lo hace accesible para equipos con GPUs de gama media-alta. Sin embargo, la documentación publicada es mínima: no se especifican la licencia exacta, los idiomas soportados ni la longitud de contexto, y no se han publicado resultados de benchmarks, lo que limita su evaluación objetiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, probablemente basada en Llama (según tags) |
| Parametros totales | 8 030 261 248 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (no especificada) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint `marin-community/marin-8b-base`, que por los tags del repositorio se infiere que sigue una arquitectura tipo Llama (transformer decoder-only con atención causal). No se dispone de detalles adicionales sobre la arquitectura exacta, como el número de capas, cabezas de atención o dimensiones ocultas, ya que la model card no los proporciona.

El entrenamiento se realizó con el framework LlamaFactory, usando un ajuste completo (full fine-tuning) sobre el dataset de finanzas mencionado. Los hiperparámetros documentados incluyen una tasa de aprendizaje de 1e-05, tamaño de batch por dispositivo de 2, acumulación de gradientes de 8 pasos (batch efectivo de 64), optimizador AdamW con betas (0.9, 0.999), scheduler de tipo coseno con warmup del 3% de los pasos, y una sola época de entrenamiento. El proceso se ejecutó en 4 GPUs con distribución multi-GPU. No se especifica el número total de tokens de entrenamiento ni la composición detallada del dataset.

## Capacidades

- Generación de texto especializada en el dominio financiero, incluyendo razonamiento sobre datos numéricos y tablas (por el uso de datasets FinCOT y FinQA).
- Respuesta a preguntas sobre información financiera (QA), probablemente con soporte para cálculos y análisis de estados financieros.
- Conversación multi-turno (etiqueta `conversational`), lo que sugiere capacidad para mantener diálogos contextuales.
- Soporte para tool calling y function calling: no confirmado, pero la etiqueta `text-generation-inference` y `endpoints_compatible` indican compatibilidad con infraestructuras de inferencia modernas.
- Capacidades multilingües: no disponibles; se desconoce si el modelo base soporta otros idiomas además del inglés.
- No se han documentado capacidades de visión, audio u otras modalidades.

## Casos de uso

- Análisis de informes financieros: el modelo puede procesar y resumir documentos como balances, cuentas de resultados o memorias anuales, extrayendo métricas clave y generando resúmenes ejecutivos.
- Asistente de atención al cliente en banca: gracias a su naturaleza conversacional, puede gestionar consultas sobre productos financieros, estados de cuenta o transacciones, manteniendo el contexto a lo largo de la conversación.
- Extracción de información de noticias económicas: dado su entrenamiento en datos financieros, puede identificar eventos relevantes (fusiones, resultados trimestrales, cambios regulatorios) y estructurarlos en formato legible.
- Generación de informes de inversión: puede redactar análisis de carteras o valoraciones de activos a partir de datos estructurados, siempre que se le proporcionen los inputs adecuados.
- Validación de datos financieros: puede comparar cifras en documentos y detectar inconsistencias o errores aritméticos, gracias a su capacidad de razonamiento sobre números.
- Automatización de respuestas en plataformas de trading: puede interpretar preguntas sobre órdenes, precios o riesgos y responder de forma precisa, reduciendo la carga de los agentes humanos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La sección `model-index` de la model card contiene una entrada con `results: []`, lo que indica que no hay métricas oficiales (como MMLU, HumanEval o GSM8K) reportadas por el autor. Por tanto, no es posible comparar cuantitativamente su rendimiento con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: para un modelo de ~8B parámetros en precisión FP16 se requieren aproximadamente 16 GB de VRAM; con cuantización de 4 bits (por ejemplo, GPTQ o AWQ) se puede reducir a unos 6-8 GB.
- GPUs recomendadas: tarjetas con al menos 16 GB de VRAM (RTX 3090, RTX 4090, A100 40GB, etc.) para FP16; para cuantización 4-bit, GPUs de 8-10 GB (RTX 3080, RTX 4070) podrían ser suficientes.
- Compatibilidad con GPUs de consumo: sí, siempre que se utilice cuantización y se ajuste el contexto a la memoria disponible.
- Opciones de despliegue: compatible con vLLM, llama.cpp, Ollama, TGI (Text Generation Inference) y cualquier framework que soporte safetensors y arquitectura Llama.
- Latencia y throughput: no disponibles; dependerán del hardware y de la implementación utilizada.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa objetiva con otros modelos de tamaño similar (por ejemplo, Llama-3-8B, Mistral-7B o Gemma-7B). El modelo carece de benchmarks publicados y sus especificaciones técnicas (contexto, idiomas, licencia) son desconocidas. Se recomienda evaluar directamente sobre tareas financieras específicas antes de elegirlo frente a alternativas generalistas.

## Limitaciones y advertencias

- La licencia se indica como `other`, lo que implica que no es una licencia estándar (como Apache 2.0 o MIT). No se especifican los términos exactos, por lo que su uso comercial podría estar restringido o requerir permisos adicionales.
- La documentación es extremadamente escasa: no se detallan los idiomas soportados, la longitud de contexto, ni el proceso de evaluación. Esto dificulta la reproducibilidad y la confianza en el modelo.
- Al ser un ajuste fino sobre un dataset financiero específico, puede presentar sesgos hacia el estilo y los datos de entrenamiento, y podría no generalizar bien a dominios fuera de las finanzas.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar información falsa o inventada, especialmente en tareas numéricas complejas si no se le proporciona contexto suficiente.
- No se han reportado resultados de sesgos o toxicidad; se recomienda realizar una auditoría antes de desplegarlo en producción.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un modelo reciente y poco validado por la comunidad.

## Enlaces

- [HuggingFace - AmberYifan/capsd-finance-fincot-finqa-clean6k-marin-8b-base-finance_cap_b2000_s0](https://huggingface.co/AmberYifan/capsd-finance-fincot-finqa-clean6k-marin-8b-base-finance_cap_b2000_s0)
- [Modelo base: marin-community/marin-8b-base](https://huggingface.co/marin-community/marin-8b-base)
- [Variante con cap b1000 (FriendliAI)](https://friendli.ai/models/AmberYifan/capsd-finance-fincot-finqa-clean6k-marin-8b-base-finance_cap_b1000_s0)
- [Variante dedup (HuggingFace)](https://huggingface.co/AmberYifan/capsd-finance-dedup-marin-8b-base-finance_cap_b2000_s0)
- [Variante random (HuggingFace)](https://huggingface.co/AmberYifan/capsd-finance-dedup-marin-8b-base-finance_random_b2000_s0)
