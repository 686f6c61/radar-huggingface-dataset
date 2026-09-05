# Baekpica/K2-Horizon-375B-A23B-Mixed-Quant-GGUF

## Resumen

K2-Horizon-375B-A23B Mixed Quant GGUF es una cuantización mixta en formato GGUF del modelo base IFM/K2-Horizon-375B-A23B, desarrollada por Baekpica. El objetivo es permitir la ejecución de un modelo de Mixture of Experts (MoE) de 375.000 millones de parámetros en sistemas con memoria unificada de 128 GB, como el NVIDIA DGX Spark. La técnica empleada combina distintos niveles de cuantización por grupos de tensores, priorizando la precisión en las capas críticas y una compresión agresiva en los expertos enrutados.

El modelo original es un MoE con 379.167.159.168 parámetros totales y aproximadamente 23.000 millones de parámetros activos por token. Esta cuantización reduce el peso de los tensores a unos 86,7 GiB, lo que hace viable su carga en hardware de memoria unificada sin necesidad de múltiples GPUs. Su relevancia radica en acercar modelos de escala masiva a entornos de desarrollo y experimentación locales, aunque la longitud de contexto y los idiomas soportados no se han documentado en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) |
| Parametros totales | 379.167.159.168 |
| Parametros activos | 23.000 millones (aprox., segun nombre A23B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, F32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base es un MoE de 375.000 millones de parámetros con 23.000 millones activos por token, desarrollado por IFM. Esta versión es una cuantización mixta del checkpoint BF16 original (revision `d33e3ae45281865ebf9f044b12d3635b1d1e17fe`), convertida directamente desde BF16 sin pasar por FP8. La política de cuantización, denominada MQ87, asigna Q8_0 a las proyecciones de atención, capas densas iniciales, embedding y expertos compartidos; los expertos enrutados se cuantizan con IQ1_S, IQ1_M, IQ2_XXS y IQ2_XS según la capa. Los tensores de control (router, RMSNorm, sesgos) se mantienen en F32.

La calibración de la matriz de importancia (imatrix) se realizó con el modelo original en BF16, procesando 5.242.880 tokens distribuidos en codificación, razonamiento matemático, razonamiento general, texto largo y texto general. La verificación del forward pass se hizo tensor a tensor contra la implementación oficial de Transformers, con cero error en BF16. No se proporciona información sobre los datos de entrenamiento del modelo base ni sobre procesos de RLHF o DPO.

## Capacidades

- Generación de texto generativo en formato conversacional, según las etiquetas del repositorio.
- Arquitectura MoE que activa únicamente 23.000 millones de parámetros por token, lo que reduce el coste computacional efectivo.
- Inferencia optimizada para sistemas de memoria unificada mediante cuantización mixta.
- No se documentan capacidades específicas de tool calling, vision, audio ni razonamiento multi-paso en la información proporcionada.

## Casos de uso

- Ejecución local de un LLM de gran escala en estaciones de trabajo con memoria unificada de 128 GB: el modelo está diseñado específicamente para sistemas como el DGX Spark, permitiendo experimentar con un MoE de 375B sin infraestructura cloud.
- Investigación en técnicas de cuantización mixta: la política MQ87 y su calibración con imatrix ofrecen un caso de estudio práctico para evaluar el equilibrio entre compresión y calidad en modelos MoE.
- Prototipado de aplicaciones conversacionales en entornos con restricciones de conectividad: al poder ejecutarse localmente, evita la dependencia de APIs externas.
- Evaluación de rendimiento de memoria unificada: las métricas de prefill y decode medidas en DGX Spark permiten comparar el comportamiento del modelo en hardware de memoria compartida frente a GPUs dedicadas.
- Desarrollo de herramientas de análisis de texto en local: aunque la longitud de contexto no está documentada, el modelo puede procesar texto extenso en función de la configuración del runtime.
- Entornos académicos de experimentación con modelos masivos: la licencia Apache 2.0 y el formato GGUF facilitan la integración en pipelines de investigación sin coste de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otros indicadores de calidad. La model card incluye únicamente métricas de velocidad de inferencia medidas en una prueba específica sobre un NVIDIA DGX Spark, que se detallan en la sección de requisitos de hardware.

## Requisitos de hardware

- VRAM estimada: el payload de tensores ocupa aproximadamente 86,7 GiB, y el repositorio completo 95 GB. Para inferencia se necesita al menos esa cantidad de memoria, más espacio para el contexto.
- GPU recomendadas: NVIDIA DGX Spark (GB10, arquitectura `sm_121a`) con 128 GB de memoria unificada, que es el hardware de referencia en la model card.
- No cabe en GPUs de consumo: las tarjetas consumer más potentes (RTX 4090 con 24 GB, RTX 5090 con 32 GB) no disponen de VRAM suficiente.
- Opciones de despliegue: llama.cpp y Ollama al ser formato GGUF; vLLM es compatible con GGUF en versiones recientes. El repositorio está marcado como `endpoints_compatible`.
- Latencia y throughput medidos en DGX Spark (round 4, prefill 8 + decode 4): prefill en frío de 494,85 / 497,37 tok/s y decode de 13,34 / 13,26 tok/s, sobre una prueba con los primeros 8.192 tokens de `promessi_sposi.txt` y 64 tokens greedily. La línea base de la campaña registró 286,55 / 5,52 tok/s.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de la misma categoría.

## Limitaciones y advertencias

- Longitud de contexto no documentada: se desconoce el tamaño máximo de ventana y el comportamiento en secuencias largas.
- Idiomas soportados no especificados: no hay datos sobre rendimiento multilingüe.
- Pérdida de calidad inherente a la cuantización: al ser una cuantización mixta, el modelo puede presentar diferencias respecto al checkpoint BF16 original, especialmente en tareas que requieren alta precisión.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar contenido no veraz o inconsistente.
- Sesgos no evaluados: no se han realizado auditorías de sesgo en esta versión cuantizada.
- Rendimiento dependiente del hardware: las métricas de velocidad son específicas del DGX Spark y no son extrapolables a otros sistemas sin validación.
- Carácter experimental: el repositorio tiene 0 descargas y 0 likes, lo que indica que es una contribución reciente y posiblemente no probada en producción.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base IFM/K2-Horizon-375B-A23B puede tener condiciones adicionales no detalladas en esta ficha.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Baekpica/K2-Horizon-375B-A23B-Mixed-Quant-GGUF
- Modelo base: https://huggingface.co/IFM/K2-Horizon-375B-A23B
- Repositorio de optimización ds4-dfm-rs: https://github.com/Baekpica/ds4-dfm-rs
- Commit de referencia (Prefill 8): https://github.com/Baekpica/ds4-dfm-rs/commit/b5ca173d565147ab9d02320faf70d2c627c0d451
- Commit de referencia (Decode 4): https://github.com/Baekpica/ds4-dfm-rs/commit/dfaa5a81f27cc9f721783404a347011740452f5f
