# RedHatAI/Qwen3.6-35B-A3B-speculator.dspark

## Resumen

RedHatAI/Qwen3.6-35B-A3B-speculator.dspark es un modelo especulador (speculator) desarrollado por Red Hat AI, diseñado para acelerar la inferencia del modelo base Qwen/Qwen3.6-35B-A3B mediante decodificación especulativa. Este modelo auxiliar, de solo 950 millones de parámetros, predice secuencias de tokens que el modelo grande verifica en paralelo, reduciendo significativamente la latencia por token generado sin degradar la calidad de las respuestas.

El modelo emplea la arquitectura DSpark, una evolución de DFlash que incorpora una cabeza Markov para modelar dependencias intra-bloque entre tokens y una cabeza de confianza que predice la probabilidad de aceptación en cada posición. Esto permite al decodificador especulativo adaptar dinámicamente el número de tokens propuestos, optimizando el equilibrio entre tasa de aceptación y coste computacional. Entrenado con la librería Speculators del proyecto vLLM sobre datasets públicos (Magpie y Ultrachat) con respuestas regeneradas por el propio Qwen3.6-35B-A3B, el modelo está disponible bajo licencia Apache 2.0.

La relevancia de este speculator radica en su capacidad para acelerar modelos MoE de gran tamaño como Qwen3.6-35B-A3B en entornos de producción, donde la latencia es crítica. Al ser un componente ligero y desplegable con vLLM, ofrece una vía práctica para reducir costes de inferencia y mejorar la experiencia de usuario en aplicaciones interactivas, manteniendo la fidelidad del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DSpark (speculator con cabeza Markov y cabeza de confianza) |
| Parametros totales | 950.254.081 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 16 000 tokens (secuencia de entrenamiento) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (hereda los del modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El speculator DSpark se basa en una red neuronal ligera que procesa representaciones ocultas intermedias del modelo base (extraídas de capas específicas, en este caso las capas 2, 10, 20, 30 y 37) para predecir tokens futuros. A diferencia de DFlash, que asume independencia entre tokens dentro de un bloque, DSpark introduce una cabeza Markov que modela la dependencia secuencial intra-bloque, mejorando la coherencia de las predicciones. Además, una cabeza de confianza estima la probabilidad de aceptación de cada token propuesto, permitiendo al decodificador ajustar dinámicamente la longitud de la secuencia especulativa.

El entrenamiento se realizó con la librería Speculators del ecosistema vLLM, utilizando una combinación de los datasets Magpie-Align/Magpie-Llama-3.1-Pro-300K-Filtered y HuggingFaceH4/ultrachat_200k, cuyas respuestas fueron regeneradas por el propio Qwen3.6-35B-A3B para garantizar consistencia con la distribución del modelo objetivo. Se empleó una función de pérdida mixta (cross-entropy con peso 0.1 y divergencia total con peso 0.9) y se entrenó durante 5 épocas con una tasa de aprendizaje de 3e-4. El cómputo fue proporcionado por Lambda, plataforma cloud especializada en IA.

## Capacidades

- Aceleración de inferencia mediante decodificación especulativa: el modelo propone hasta 8 tokens por paso, que el modelo base verifica en paralelo.
- Predicción de aceptación por posición: la cabeza de confianza permite al sistema decidir cuántos tokens aceptar, optimizando el rendimiento.
- Compatibilidad con vLLM: se integra directamente mediante el parámetro `--speculative-config` con método `dspark`.
- Soporte de secuencias largas: entrenado con ventanas de 16 000 tokens, adecuado para contextos extensos.
- Independencia del idioma: al ser un speculator, no añade restricciones lingüísticas propias; las capacidades multilingües dependen del modelo base.
- Bajo coste adicional: con solo 950M parámetros, el overhead de memoria y cómputo es mínimo en comparación con el modelo principal.

## Casos de uso

- Inferencia de baja latencia en chatbots y asistentes virtuales: al reducir el tiempo por token generado, el speculator permite respuestas más fluidas en aplicaciones conversacionales interactivas, donde la demora perceptible degrada la experiencia del usuario.
- Despliegue de modelos MoE en producción con vLLM: empresas que sirven Qwen3.6-35B-A3B pueden integrar este speculator para aumentar el throughput del servidor sin modificar el modelo base ni sacrificar calidad.
- Procesamiento por lotes de tareas de generación de texto: en pipelines de generación masiva (resúmenes, redacción de informes), la mayor velocidad de decodificación reduce el tiempo total de cómputo y los costes asociados.
- Razonamiento matemático y lógico: las tasas de aceptación más altas en tareas de razonamiento (5.03 tokens de longitud media) hacen que el speculator sea especialmente efectivo en aplicaciones de asistencia a investigación o educación.
- Generación de código asistida: con una longitud media de 4.58 tokens aceptados en HumanEval, el modelo acelera herramientas de autocompletado y revisión de código en entornos de desarrollo integrado.
- Traducción automática y resumen de documentos: aunque las tasas de aceptación son más bajas en estas tareas, la aceleración sigue siendo notable (3.46-3.64 tokens de media), lo que beneficia servicios de traducción y resumen en tiempo real.

## Benchmarks y rendimiento

El modelo no presenta métricas tradicionales como MMLU o HumanEval, ya que su función es auxiliar. En su lugar, la métrica clave es la tasa de aceptación de tokens por posición, que determina la velocidad efectiva de decodificación especulativa. Los datos publicados por el autor son los siguientes:

| Dataset | Pos 0 | Pos 1 | Pos 2 | Pos 3 | Pos 4 | Pos 5 | Pos 6 | Pos 7 | Longitud media |
|---|---|---|---|---|---|---|---|---|---|
| HumanEval | 82.0% | 66.2% | 54.1% | 44.1% | 36.4% | 29.9% | 24.7% | 20.4% | 4.58 |
| math_reasoning | 84.0% | 70.3% | 59.8% | 51.2% | 43.5% | 37.0% | 31.2% | 26.5% | 5.03 |
| qa | 71.8% | 50.9% | 37.4% | 28.0% | 20.9% | 16.0% | 12.1% | 9.2% | 3.46 |
| question | 73.5% | 53.1% | 39.5% | 30.4% | 24.2% | 19.5% | 15.6% | 12.7% | 3.68 |
| rag | 78.2% | 57.1% | 44.1% | 34.7% | 27.3% | 21.2% | 16.4% | 13.1% | 3.92 |
| summarization | 74.2% | 53.6% | 40.4% | 30.6% | 23.5% | 17.8% | 13.7% | 10.5% | 3.64 |
| tool_call | 71.7% | 50.8% | 36.1% | 26.3% | 19.5% | 14.7% | 11.2% | 8.6% | 3.39 |
| translation | 70.7% | 51.2% | 37.8% | 28.4% | 21.2% | 15.7% | 11.9% | 8.8% | 3.46 |
| writing | 74.4% | 54.3% | 40.8% | 31.6% | 25.2% | 20.3% | 16.5% | 13.4% | 3.76 |

Estas cifras indican que el speculator es más eficaz en tareas de razonamiento y código, mientras que en tareas de traducción y tool calling la ganancia es menor, aunque sigue siendo positiva.

## Requisitos de hardware

- El speculator en sí tiene 950M parámetros, lo que en FP16 ocupa aproximadamente 1.9 GB de VRAM. Es un overhead mínimo frente al modelo base.
- El modelo base Qwen3.6-35B-A3B es un MoE con 35B parámetros totales y 3B activos por token. En FP16 requiere unos 70 GB de VRAM, por lo que necesita GPUs de datacenter como A100 80GB, H100 o múltiples GPUs en paralelo.
- Con cuantización (por ejemplo, INT8 o FP8), el modelo base puede caber en GPUs consumer de gama alta como RTX 4090 (24 GB) o RTX 6000 Ada, aunque con limitaciones de contexto.
- El despliegue se realiza mediante vLLM, que soporta decodificación especulativa con este speculator. También puede usarse con TGI u otros frameworks compatibles, aunque no se ha documentado explícitamente.
- Para obtener el máximo rendimiento, se recomienda ejecutar el speculator y el modelo base en la misma GPU o en GPUs interconectadas de alta velocidad (NVLink, PCIe 4.0).
- La latencia y throughput dependen en gran medida de la tasa de aceptación y del hardware. En un benchmark comunitario en NVIDIA DGX Spark (GB10, 128 GB unificados) se observaron mejoras significativas, aunque no se publican cifras exactas en la documentación oficial.

## Comparativa con modelos similares

| Modelo | Parametros | Metodo | Tasa de aceptacion media (HumanEval) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RedHatAI/Qwen3.6-35B-A3B-speculator.dspark | 950M | DSpark (Markov + confidence head) | 4.58 tokens | Apache 2.0 | HuggingFace |
| DFlash (referencia) | Variable | Flash-based, sin dependencia intra-bloque | No disponible | Apache 2.0 (general) | Proyecto Speculators |
| EAGLE-2 (referencia) | Variable | Autoregresivo con features de capas intermedias | No disponible | MIT (general) | GitHub |

No se dispone de comparaciones cuantitativas directas con otros speculators en los mismos benchmarks. DSpark se presenta como una mejora sobre DFlash, incorporando modelado de dependencias intra-bloque y predicción de confianza, lo que debería traducirse en tasas de aceptación superiores, aunque no hay datos públicos que lo confirmen.

## Limitaciones y advertencias

- Es un modelo auxiliar: no puede generar texto por sí mismo; depende completamente del modelo base Qwen3.6-35B-A3B para la verificación y la generación final.
- Las tasas de aceptación varían significativamente según la tarea: en traducción y tool calling la longitud media de tokens aceptados es menor (3.39-3.46), lo que reduce la ganancia de velocidad en esos escenarios.
- El entrenamiento se realizó con datos en inglés principalmente (Magpie y Ultrachat), por lo que el comportamiento en otros idiomas podría ser subóptimo, aunque el modelo base sí es multilingüe.
- No se han publicado evaluaciones de sesgo, alucinación o seguridad propias; el speculator hereda las limitaciones del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero es necesario cumplir con los términos del modelo base (Qwen3.6-35B-A3B), que también es Apache 2.0.
- El despliegue requiere vLLM con soporte para el método `dspark`; versiones antiguas de vLLM podrían no ser compatibles.
- El tamaño del repositorio (8.0 GB) puede resultar elevado para un modelo de 950M parámetros, posiblemente debido a la inclusión de checkpoints intermedios o metadatos adicionales.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/RedHatAI/Qwen3.6-35B-A3B-speculator.dspark)
- [Repositorio de la librería Speculators](https://github.com/vllm-project/speculators)
- [Modelo base Qwen3.6-35B-A3B](https://huggingface.co/Qwen/Qwen3.6-35B-A3B)
- [Benchmark en foros de NVIDIA](https://forums.developer.nvidia.com/t/benchmarking-qwen3-6-35b-a3b-with-dspark-speculative-decoding/379550)
- [Reproductor de benchmark en GitHub](https://github.com/my-other-github-account/spark-bench-reproducers/blob/main/qwen36-35b-a3b-dflash-spark/README.md)
- [Modelo en Ollama (referencia del base)](https://ollama.com/library/qwen3.6:35b-a3b)
