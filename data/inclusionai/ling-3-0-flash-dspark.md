# inclusionAI/Ling-3.0-flash-dspark

## Resumen

Ling-3.0-flash-dspark es un modelo de especulación (draft) desarrollado por inclusionAI para acelerar la inferencia del modelo principal Ling-3.0-flash mediante decodificación especulativa. Con 1.36 mil millones de parámetros, este modelo genera borradores de tokens que el modelo objetivo verifica en bloque, reduciendo la latencia y el coste computacional sin sacrificar precisión. Es una extensión de la técnica DFlash, que incorpora características auxiliares del modelo objetivo y una cabeza de confianza que decide dinámicamente cuántos tokens borrador generar por paso.

El modelo se entrena con SpecForge y se sirve con SGLang, lo que lo hace directamente integrable en infraestructuras de producción que ya usen Ling-3.0-flash. Su relevancia actual radica en que permite desplegar modelos de razonamiento híbridos de gran tamaño (124B totales) con una fracción del coste de inferencia, manteniendo una calidad de salida equivalente. Está disponible en Hugging Face con formato safetensors y licencia "other" (no especificada en la tarjeta del modelo).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con 5 capas de atención completa (MHA, 32 cabezas Q y 32 cabezas KV) |
| Parametros totales | 1.363.707.905 (1,36B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 posiciones máximas (ventana de 8 tokens de borrador) |
| Tipos de cuantizacion | BF16 (pesos nativos); cuantizaciones adicionales no documentadas |
| Idiomas soportados | No disponible (el modelo principal Ling-3.0-flash soporta multilingüe, pero no se detalla para el draft) |
| Licencia | other (no especificada) |
| Formato de pesos | safetensors (también compatible con SGLang y transformers) |

## Arquitectura y entrenamiento

Ling-3.0-flash-dspark es un modelo de especulación (draft) basado en una arquitectura transformer ligera: 5 capas de atención completa (MHA) con 32 cabezas de consulta y 32 cabezas de clave/valor, tamaño oculto de 2.560. Incluye una cabecera de confianza tipo "vanilla Markov head" con rango 256, que decide dinámicamente cuántos tokens de borrador se generan por paso (bloque de 8 tokens, con ancho de verificación de 9 incluyendo el token bonus). El modelo utiliza características auxiliares del modelo objetivo (Ling-3.0-flash) en las capas 1, 11, 23, 29 y 35 para mejorar la precisión de los borradores.

El entrenamiento se realizó con SpecForge, un framework para entrenamiento de modelos de especulación, y se sirve con SGLang usando el algoritmo DSPARK. No se publican detalles sobre el conjunto de datos de entrenamiento ni el proceso de alineación (RLHF/DPO). El modelo está diseñado para funcionar como complemento de Ling-3.0-flash, que es un MoE híbrido de razonamiento con 124B parámetros totales y 5,1B activos, con ventana de contexto nativa de 256K extensible a 1M.

## Capacidades

- Especificación especulativa: genera borradores de tokens de alta calidad para el modelo objetivo Ling-3.0-flash, con una longitud media de aceptación de 5,29 tokens por paso (macro-media en nueve workloads).
- Decodificación dinámica: la cabecera de confianza adapta el número de tokens de borrador según la dificultad del contexto, mejorando el balance entre velocidad y precisión.
- Integración con SGLang: se sirve mediante el algoritmo DSPARK, compatible con despliegues en producción que ya usan Ling-3.0-flash.
- Compatibilidad con el modelo principal: diseñado específicamente para Ling-3.0-flash, no es un modelo de propósito general (no genera texto final por sí solo).
- Soporte de contexto largo: hereda la ventana máxima de 262.144 posiciones del modelo objetivo, permitiendo razonamiento sobre documentos extensos.
- Rendimiento medible: métricas de acceptance length publicadas para workloads de razonamiento, código y chat (ver sección de benchmarks).

## Casos de uso

- Aceleración de inferencia para Ling-3.0-flash en producción: el modelo se usa como componente de un sistema de decodificación especulativa en SGLang. Permite reducir la latencia de generación de Ling-3.0-flash en APIs de chat o agentes, especialmente en escenarios de alta concurrencia donde el coste por token es crítico.
- Despliegue en entornos con recursos limitados: al ser un modelo de solo 1,36B, puede ejecutarse en GPU de consumo (p. ej., RTX 4090) mientras el modelo principal se sirve en clústeres mayores. Esto permite servir el modelo principal con menor latencia sin aumentar la huella de VRAM del servidor principal.
- Optimización de costes en plataformas de LLM-as-a-service: proveedores que ofrecen Ling-3.0-flash pueden integrar este draft para reducir el coste por petición, manteniendo la calidad del modelo original.
- Investigación en decodificación especulativa: sirve como referencia para estudiar el impacto de características auxiliares del modelo objetivo y cabeceras de confianza en la tasa de aceptación.
- Evaluación de calidad de borradores: las métricas de acceptance length permiten comparar la eficiencia de diferentes estrategias de especulación en workloads concretos (GSM8K, HumanEval, etc.).
- Integración en frameworks de inferencia: se puede usar como ejemplo de implementación de DSPARK en SGLang, útil para desarrolladores que quieran añadir especulación a otros modelos.

## Benchmarks y rendimiento

El modelo publica métricas de "acceptance length", definida como el número medio de tokens aceptados por paso de verificación especulativa (incluyendo el token bonus del modelo objetivo). No se publican resultados de benchmarks de calidad (MMLU, HumanEval, etc.) porque el modelo no genera texto final; su rendimiento se mide por su eficiencia como draft.

| Workload | Acceptance length |
|---|---|
| GSM8K | 6,40 |
| MATH-500 | 6,29 |
| AIME 2025 | 5,56 |
| HumanEval | 6,57 |
| MBPP | 6,34 |
| LiveCodeBench | 5,33 |
| MT-Bench | 3,92 |
| Alpaca | 3,51 |
| Arena-Hard-v2 | 3,72 |
| **Media macro** | **5,29** |

No se han publicado resultados de benchmarks comparativos con otros modelos especuladores en la información disponible.

## Requisitos de hardware

- VRAM estimada: el modelo en BF16 ocupa aproximadamente 2,7 GB (tamaño del repositorio). Con cuantizaciones adicionales (si se publican) podría reducirse a menos de 2 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para ejecutar el draft en BF16 (p. ej., RTX 3060, RTX 4060, T4). Para el despliegue completo con Ling-3.0-flash se necesitan GPUs de mayor capacidad (A100, H100) para el modelo principal.
- Compatibilidad con consumer GPU: sí, el draft es ligero y puede ejecutarse en GPUs de consumo como RTX 3090 o RTX 4090.
- Opciones de despliegue: SGLang (con soporte DSPARK), también puede cargarse con transformers para pruebas locales, pero el uso principal es a través de SGLang con `--speculative-algorithm DSPARK`.
- Latencia y throughput: no se publican datos de latencia o throughput. La acceptance length media de 5,29 tokens por paso indica una aceleración potencial de ~5x en el número de pasos de decodificación, pero el throughput real depende del hardware y de la configuración del modelo principal.

## Comparativa con modelos similares

No se dispone de información sobre modelos especuladores comparables (p. ej., DFlash o otros drafts) en los datos proporcionados. Se puede comparar indirectamente con el propio modelo principal:

| Modelo | Tipo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Ling-3.0-flash-dspark | Draft especulativo | 1,36B | 262.144 | other | safetensors |
| Ling-3.0-flash (objetivo) | MoE híbrido | 124B totales, 5,1B activos | 256K nativo, 1M extendido | other | safetensors |

No se conocen otros drafts específicos para Ling-3.0-flash en el momento de la consulta.

## Limitaciones y advertencias

- El modelo es solo un componente de especulación: no puede generar texto de forma autónoma; requiere el modelo objetivo Ling-3.0-flash para funcionar.
- La licencia es "other" y no se especifica si permite uso comercial. Es necesario contactar con inclusionAI para aclarar los términos de uso.
- No se documentan los datos de entrenamiento ni posibles sesgos del modelo. Al ser un modelo auxiliar, su impacto en la calidad final es indirecto, pero puede heredar sesgos del modelo objetivo.
- La ventana de contexto de 262.144 tokens es máxima; en la práctica, la ventana efectiva depende de la configuración de SGLang y de la memoria disponible.
- El rendimiento de aceptación varía según el workload (ver tabla): en tareas de chat general (MT-Bench, Alpaca) la aceptación es menor que en tareas de razonamiento y código, lo que implica una menor aceleración en esos escenarios.
- No se publican instrucciones de cuantización adicionales; el modelo solo se ofrece en BF16, lo que limita su uso en hardware con VRAM muy reducida.

## Enlaces

- [HuggingFace: inclusionAI/Ling-3.0-flash-dspark](https://huggingface.co/inclusionAI/Ling-3.0-flash-dspark)
- [HuggingFace: inclusionAI/Ling-3.0-flash (modelo objetivo)](https://huggingface.co/inclusionAI/Ling-3.0-flash)
- [Repositorio DFlash (base del algoritmo)](https://github.com/z-lab/dflash)
- [Repositorio SpecForge (entrenamiento)](https://github.com/sgl-project/SpecForge)
- [Repositorio SGLang (servir con DSPARK)](https://github.com/sgl-project/sglang)
- [Cookbook SGLang para Ling-3.0-flash](https://docs.sglang.io/cookbook/autoregressive/InclusionAI/Ling-3.0-flash)
- [Documentación de Ling de inclusionAI](https://developer.ant-ling.com/en/docs/models/ling/)
