# rakuten-junliu/RakutenAI-3.0-W4A16

## Resumen

RakutenAI-3.0-W4A16 es una cuantización weight-only del modelo RakutenAI-3.0, un LLM de 671 026 419 200 parámetros (aproximadamente 671B) con arquitectura Mixture of Experts (MoE) basada en DeepSeek-V3, desarrollado por Rakuten Group. El modelo original, presentado en diciembre de 2025 y publicado en marzo de 2026, está optimizado para japonés e inglés y forma parte del proyecto GENIAC del Ministerio de Economía, Comercio e Industria de Japón. Esta versión cuantizada reduce el tamaño del checkpoint de los pesos a 374.5 GiB, lo que permite su despliegue en 8 GPUs H100-80GB con tensor parallelism 8, manteniendo un rendimiento prácticamente idéntico al del modelo en FP8.

La cuantización emplea GPTQ para los 44 544 proyecciones de los expertos enrutados, con pesos simétricos INT4 y grupo de tamaño 32, mientras que las capas de atención, expertos compartidos, las tres primeras capas densas y la cabeza de salida se mantienen en BF16. Las activaciones permanecen en BF16, resultando en un esquema W4A16. El checkpoint se distribuye en formato compressed-tensors pack-quantized y safetensors, con licencia Apache 2.0. La relevancia de esta versión radica en que ofrece una alternativa más ligera al modelo base sin sacrificar calidad, facilitando su uso en entornos con recursos limitados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeepSeek-V3 MoE, atención MLA (Multi-head Latent Attention), 256 expertos enrutados, MTP (Multi-Token Prediction) |
| Parametros totales | 671 026 419 200 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16 (INT4 simétrico con grupo 32 en expertos enrutados; BF16 en atención, expertos compartidos, primeras capas densas y lm_head) |
| Idiomas soportados | Japonés (ja), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | compressed-tensors pack-quantized, safetensors |

## Arquitectura y entrenamiento

El modelo base RakutenAI-3.0 sigue la arquitectura de DeepSeek-V3: un transformer MoE con 256 expertos enrutados, atención Multi-head Latent Attention (MLA) para reducir el costo de memoria del KV cache, y predicción multi-token (MTP) para mejorar la eficiencia de decodificación. La cuantización W4A16 se aplicó únicamente a las proyecciones de los expertos enrutados, que constituyen la mayor parte de los parámetros, manteniendo las demás capas en BF16. El proceso de calibración utilizó 816 muestras mixtas en japonés e inglés con una longitud de secuencia de 1024, y se empleó GPTQ con activación ordering, búsqueda de escala por error cuadrático medio y damping relativo de 0.1. El código de cuantización está fijado al commit `5a3b298cfb5c475a9b6584d48b43fcebc4ddfb2f` del repositorio MoE-Quant.

El validador de salida comprobó todas las proyecciones de los expertos enrutados, los 63 shards de pesos, la cobertura exacta de índices, formas y dtypes de tensores, escalas finitas positivas y seis muestras de empaquetado bit-exacto. El error relativo máximo de reconstrucción (RMS) muestreado fue de 0.198149. No se dispone de información sobre el dataset de entrenamiento del modelo base ni sobre el número de tokens utilizados.

## Capacidades

- Generación de texto en japonés e inglés con alta competencia en matices culturales y lingüísticos del japonés, según la descripción oficial del modelo base.
- Razonamiento complejo y resolución de problemas matemáticos, evidenciado por resultados de 94.24 en GSM8K (5-shot) y 85.33 en MMLU en la versión cuantizada.
- Arquitectura MoE con 256 expertos enrutados que permite activar solo una fracción de los parámetros por token, mejorando la eficiencia computacional.
- Soporte para decodificación especulativa mediante el módulo MTP (Multi-Token Prediction) del modelo base, aunque no se detalla su implementación en la versión cuantizada.
- Capacidad multilingüe limitada a japonés e inglés; no se especifican otros idiomas.

## Casos de uso

- Generación de contenido en japonés de alta calidad: el modelo puede redactar artículos, resúmenes y textos creativos con dominio de registros formales e informales, aprovechando su entrenamiento específico en datos japoneses.
- Traducción automática japonés-inglés y viceversa: su bilingüismo nativo permite traducciones con mayor precisión contextual que modelos genéricos, útil en entornos empresariales y de localización.
- Asistencia en atención al cliente: con una ventana de contexto amplia (no especificada, pero típica de DeepSeek-V3) puede gestionar conversaciones multi-turno en japonés, integrando knowledge bases y generando respuestas coherentes.
- Razonamiento matemático y análisis de datos: los resultados en GSM8K (94.24) indican capacidad para resolver problemas aritméticos y lógicos, aplicable a herramientas de análisis financiero o educativo.
- Desarrollo de código asistido: aunque no se reportan benchmarks específicos de código, la arquitectura DeepSeek-V3 es conocida por su buen desempeño en generación de código, y el modelo puede emplearse en asistentes de programación.
- Investigación académica en PLN japonés: su licencia Apache 2.0 permite uso comercial y académico, facilitando experimentos en tareas de comprensión y generación de lenguaje japonés.

## Benchmarks y rendimiento

La model card reporta evaluación realizada con SGLang en TP8 y decodificación greedy, comparando la versión cuantizada con una línea base FP8 del mismo modelo:

| Modelo | GSM8K (5-shot) | MMLU |
|---|---|---|
| FP8 baseline | 94.39 | 85.27 |
| **RakutenAI-3.0-W4A16** | 94.24 | 85.33 |

La degradación máxima observada es de 0.15 puntos en GSM8K y una mejora de 0.06 en MMLU, lo que indica que la cuantización W4A16 prácticamente no afecta al rendimiento en estas tareas. No se dispone de comparaciones con otros modelos cuantizados de tamaño similar.

## Requisitos de hardware

- Verificado en 8×H100-80GB (SM90) con tensor parallelism 8 y SGLang 0.5.18.
- Tamaño del checkpoint: 374.5 GiB.
- VRAM total necesaria: aproximadamente 600 GB (8×80 GB) para cargar el modelo con activaciones y espacio para KV cache.
- No cabe en GPUs de consumo (RTX 4090, etc.) ni en configuraciones de una sola GPU; requiere al menos 8 GPUs de 80 GB.
- Opciones de despliegue: SGLang con flag `--quantization compressed-tensors` y `--tp 8`. También podría ser compatible con vLLM u otros motores que soporten el formato compressed-tensors, aunque no se ha verificado.
- Latencia y throughput: no se proporcionan datos específicos. El tiempo de carga en almacenamiento local fue de 134 segundos y el arranque completo (incluyendo compilación de kernels y captura de CUDA graphs) tardó 482 segundos en la configuración verificada.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros modelos cuantizados de la misma categoría (MoE de ~671B). La única comparación disponible es con el modelo base en FP8, que muestra rendimiento casi idéntico. Como referencia cualitativa, el modelo base RakutenAI-3.0 compite con otros LLMs japoneses de gran escala, pero no hay datos públicos de benchmarks frente a ellos en la información proporcionada.

## Limitaciones y advertencias

- La cuantización introduce un error de reconstrucción máximo de 0.198 (RMS relativo), que aunque bajo, puede afectar a tareas muy sensibles a la precisión numérica.
- El modelo es extremadamente grande (671B parámetros), lo que limita su despliegue a infraestructuras con múltiples GPUs de alta gama; no es viable en entornos de consumo.
- Solo se han verificado idiomas japonés e inglés; el rendimiento en otros idiomas no está documentado.
- No se especifica la longitud de contexto, aunque la arquitectura DeepSeek-V3 soporta típicamente 128K tokens; esta información no está confirmada para este checkpoint.
- La carga del checkpoint desde un sistema de archivos compartido (Lustre) requiere copiarlo a almacenamiento local por nodo, ya que cada proceso de tensor parallelism escanea el checkpoint completo, multiplicando la lectura por ocho.
- No se reportan sesgos específicos, pero al ser un modelo entrenado principalmente con datos japoneses, puede presentar sesgos culturales o regionales no documentados.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo base y de los componentes de DeepSeek-V3 por posibles atribuciones.

## Enlaces

- Modelo cuantizado en Hugging Face: https://huggingface.co/rakuten-junliu/RakutenAI-3.0-W4A16
- Modelo base en Hugging Face: https://huggingface.co/Rakuten/RakutenAI-3.0
- Anuncio oficial de Rakuten AI 3.0 (marzo 2026): https://global.rakuten.com/corp/news/press/2026/0317_01.html
- Anuncio de presentación (diciembre 2025): https://global.rakuten.com/corp/news/press/2025/1218_01.html
- Página de Rakuten AI sobre LLMs: https://ai.rakuten.com/large-language-model/
