# catplusplus/Qwen3.8-27B-heretic-ara-DSpark

## Resumen

Qwen3.8-27B-heretic-ara-DSpark es un modelo de especulación (speculator) diseñado para acelerar la inferencia del modelo de lenguaje Qwen/Qwen3.8-27B-FP8 mediante decodificación especulativa. Desarrollado por el usuario catplusplus, este modelo actúa como un borrador ligero de 1.36B parámetros que predice varios tokens por paso de verificación, reduciendo la latencia del modelo principal sin sacrificar calidad de salida. Es una implementación concreta de DSpark, una extensión del framework DFlash que incorpora características auxiliares del modelo objetivo y una cabeza de confianza para decidir dinámicamente el número de tokens de borrador.

El modelo está entrenado con SpecForge y servido mediante SGLang, y su peso en BF16 ocupa aproximadamente 2.7 GB. Su arquitectura es compacta: 5 capas de atención completa con GQA, contexto máximo de 262 144 tokens y un bloque de especulación de 7 tokens de borrador. Aunque no es un modelo de lenguaje autónomo, es relevante en el ecosistema actual de despliegue de LLMs porque permite ejecutar Qwen3.8-27B-FP8 con menor latencia, lo que resulta crítico en aplicaciones de producción con alta concurrencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con 5 capas de atencion completa (GQA: 40 query heads, 8 key/value heads) + cabeza de confianza (Markov, rank 256) |
| Parametros totales | 1.359.284.737 (1.36B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 144 (maximo de posiciones) |
| Tipos de cuantizacion | BF16 (pesos del draft), el modelo objetivo usa FP8 |
| Idiomas soportados | No disponible (modelo auxiliar, no generativo) |
| Licencia | other (no especificada) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un especulador DSpark, una variante de DFlash que incorpora características auxiliares del modelo objetivo (target auxiliary features) en las capas 4, 16, 28, 40 y 52, y una cabeza de confianza (Markov head de rango 256) que ajusta dinámicamente el número de tokens de borrador por paso. La arquitectura es un transformer de 5 capas de atención completa con GQA, optimizado para generar secuencias cortas de borrador (bloque de 7 tokens, con ancho de verificación de 8 incluyendo el token bonus del objetivo). El entrenamiento se realizó con SpecForge, un framework especializado en entrenamiento de modelos especuladores, sobre el checkpoint `epoch_2_step_4166`. No se han publicado detalles sobre el dataset de entrenamiento, pero el objetivo es minimizar la divergencia con el modelo target Qwen3.8-27B-FP8 y maximizar la tasa de aceptación.

## Capacidades

- Especificación de tokens para decodificación especulativa: genera bloques de 7 tokens de borrador que el modelo target verifica en paralelo.
- Adaptación dinámica del número de tokens de borrador gracias a la cabeza de confianza, que reduce el trabajo de verificación en secuencias predecibles.
- Integración nativa con SGLang mediante el algoritmo DSPARK, con soporte para cuantización del draft en BF16.
- Alta compatibilidad con el modelo objetivo Qwen3.8-27B-FP8, incluyendo el modo "thinking" y el contexto largo de 262 144 tokens.
- No es un modelo de generación autónoma; no genera texto por sí solo, solo produce borradores para acelerar el modelo principal.

## Casos de uso

- **Aceleración de inferencia en producción**: el modelo se integra con SGLang para reducir la latencia de Qwen3.8-27B-FP8 en servicios de chat o agentes. La aceptación media de 3.39 tokens por verificación implica una reducción significativa de pasos de autogeneración, lo que se traduce en menor tiempo de respuesta y mayor throughput.
- **Despliegue en entornos con GPU limitada**: Al ser un draft de solo 1.36B parámetros, puede ejecutarse en la misma GPU que el modelo principal, aprovechando el presupuesto de VRAM sin necesidad de hardware adicional. Esto es útil en entornos con RTX 4090 o A100 de 40 GB.
- **Optimización de costes en APIs de LLM**: En un pipeline de inferencia que sirve Qwen3.8-27B-FP8, el uso de este draft permite reducir el número de operaciones de atención completa, bajando el coste por token generado.
- **Investigación en decodificación especulativa**: Sirve como implementación de referencia del algoritmo DSpark, permitiendo a investigadores comparar la tasa de aceptación en distintos workloads (HumanEval, GSM8K, MATH-500, etc.) y reproducir los resultados de la model card.
- **Desarrollo de agentes y razonamiento multi-paso**: El modelo soporta el modo "thinking" del target, por lo que puede usarse en aplicaciones de razonamiento complejo (como AIME o LiveCodeBench) donde la latencia es un cuello de botella.
- **Evaluación de técnicas de especulación**: El repositorio incluye scripts de evaluación y datos de acceptance length para 11 workloads, lo que permite comparar el rendimiento del draft con otros métodos (p.ej. DFlash o MTP).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de generación (como MMLU o HumanEval) para este modelo, ya que no es un modelo de lenguaje autónomo. La métrica relevante es la **longitud de aceptación** (acceptance length), que mide el número medio de tokens aceptados por paso de verificación especulativa. La model card reporta los siguientes datos:

| Workload | Acceptance length |
|---|---:|
| HumanEval | 3.47 |
| GSM8K | 4.57 |
| MATH-500 | 4.08 |
| LiveCodeBench | 2.94 |
| MBPP | 3.67 |
| AIME 2025 | 3.28 |
| LBPP | 3.03 |
| AIME 2026 | 3.07 |
| MT-Bench | 3.10 |
| Arena-Hard-v2 | 2.71 |
| Alpaca | 2.95 |

Media global: **3.39** (macro media: 3.35) sobre 1.164 requests. Condiciones de evaluación: FP8 target, BF16 draft, temperatura 0.6, top-k 20, top-p 0.95, thinking habilitado, max_new_tokens=2048, seed 0.

## Requisitos de hardware

- **VRAM del draft**: El modelo pesa ~2.7 GB en BF16, por lo que requiere aproximadamente 3 GB de VRAM para inferencia. Es compatible con cualquier GPU con al menos 4 GB.
- **VRAM total del sistema**: Para ejecutar el draft junto con el target Qwen3.8-27B-FP8, se necesita al menos ~30 GB de VRAM (27 GB para el target FP8 + 3 GB para el draft). Esto es viable en GPUs como A100 40GB, A100 80GB, H100 o RTX 4090 (con cuantización adicional del target).
- **GPUs recomendadas**: A100 40GB, A100 80GB, H100, RTX 6000 Ada, o RTX 4090 (si el target se cuantiza a 4 bits).
- **Opciones de despliegue**: El modelo está diseñado para SGLang con el algoritmo DSPARK (`--speculative-algorithm DSPARK`). También se puede usar con vLLM o llama.cpp si se adapta, aunque no hay documentación oficial.
- **Latencia y throughput**: No se han publicado métricas de latencia absoluta, pero la aceptación media de 3.39 tokens por paso implica que el tiempo de generación se reduce aproximadamente a 1/3.39 ≈ 29.5% del tiempo sin especulación, asumiendo que el coste de verificación es similar al de generación de un token.

## Comparativa con modelos similares

El modelo se compara con otros métodos de especulación para el mismo target Qwen3.8-27B-FP8. La tabla siguiente presenta datos de aceptación media (cuando están disponibles) y características principales:

| Metodo | Parametros del draft | Contexto | Aceptacion media | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **Qwen3.8-27B-heretic-ara-DSpark** (este) | 1.36B | 262 144 | 3.39 | other | HuggingFace |
| DFlash (base) | no disponible | no disponible | no disponible | no disponible | GitHub |
| Sin especulacion (target solo) | - | 262 144 | 1.0 (un token por paso) | Qwen | HuggingFace |
| Qwen3.8-27B-NVFP4-MTP (MTP heads) | no disponible | 262 144 | no disponible | other | HuggingFace |

No se dispone de datos comparativos publicados para DFlash o MTP en los mismos workloads, por lo que la comparativa directa no es posible.

## Limitaciones y advertencias

- **No es un modelo generativo**: No puede usarse para generar texto de forma independiente; requiere el modelo target Qwen3.8-27B-FP8 para funcionar.
- **Dependencia de SGLang**: El algoritmo DSPARK requiere una versión específica de SGLang con soporte para DSpark, lo que limita su portabilidad a otros frameworks.
- **Licencia "other" no especificada**: No se detallan los términos de uso comercial. Se recomienda contactar al autor para aclarar restricciones.
- **Sesgos y alucinaciones**: Al ser un modelo auxiliar, no se han evaluado sesgos propios; sin embargo, hereda los del modelo target. El target Qwen3.8-27B-FP8 puede presentar alucinaciones en temas de baja frecuencia o contenido multilingüe.
- **Contexto largo**: Aunque el modelo soporta 262 144 posiciones, la ventana efectiva depende del target y de la memoria disponible; con contextos muy largos, la VRAM puede ser insuficiente en GPUs de 24 GB.
- **Datos de evaluación limitados**: Los benchmarks de aceptación se han obtenido con un conjunto de 1.164 requests y condiciones específicas; el rendimiento puede variar con otros prompts, temperaturas o configuraciones.

## Enlaces

- [HuggingFace - catplusplus/Qwen3.8-27B-heretic-ara-DSpark](https://huggingface.co/catplusplus/Qwen3.8-27B-heretic-ara-DSpark)
- [Modelo target Qwen/Qwen3.8-27B-FP8](https://huggingface.co/Qwen/Qwen3.8-27B-FP8)
- [DFlash (GitHub)](https://github.com/z-lab/dflash)
- [SpecForge (GitHub)](https://github.com/sgl-project/SpecForge)
- [SGLang (GitHub)](https://github.com/sgl-project/sglang)
- [Qwen3.8-27B-heretic-ara (modelo base de la familia)](https://huggingface.co/heretic-org/Qwen3.8-27B-heretic-ara)
- [Qwen3.8-27B-Heretic-ARA-NVFP4-MTP-VL (variante con MTP)](https://friendli.ai/models/lyf/Qwen3.8-27B-Heretic-ARA-NVFP4-MTP-VL)
