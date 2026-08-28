# pngwn/memcap-l-below-capacity

## Resumen

`pngwn/memcap-l-below-capacity` es un modelo GPT-2 de 8,44 millones de parámetros entrenado desde cero por el investigador pngwn como parte de una reproducción a pequeña escala del artículo *How much do language models memorize?* (Morris et al., ICML 2026, mención honorífica). El experimento consiste en entrenar modelos estilo GPT sobre secuencias de tokens uniformemente aleatorios, donde la generalización es imposible y toda reducción de pérdida se atribuye exclusivamente a memorización.

Este checkpoint concreto se sitúa en el régimen de capacidad completa: la entropía del conjunto de datos (11,09 Mbits) es inferior a la capacidad de almacenamiento teórica del modelo, y el modelo ha memorizado el 99,5 % de dicha entropía. Con una arquitectura compacta (d_model 256, 10 capas, 4 cabezas de atención, vocabulario de 2048 tokens y contexto de 64), el modelo demuestra empíricamente el régimen de memorización total descrito en el paper. Su relevancia radica en servir como herramienta de investigación reproducible para estudiar los límites de memorización en modelos de lenguaje, no como un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformers) |
| Parametros totales | 8.438.784 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 64 tokens |
| Tipos de cuantizacion | no disponible (entrenado en fp32) |
| Idiomas soportados | no disponible (datos de tokens aleatorios, sin lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT-2 estándar implementada en la librería `transformers`, con dimensiones reducidas: d_model 256, 10 capas transformer, 4 cabezas de atención, vocabulario de 2048 tokens y ventana de contexto de 64 tokens. Se entrenó desde cero con precisión fp32 (con TF32 desactivado), optimizador AdamW con tasa de aprendizaje 1e-3 y decaimiento coseno, tamaño de lote de 512 secuencias y un total de 8.000 pasos de entrenamiento. La inicialización usó semilla 0.

Los datos de entrenamiento consisten en secuencias de 64 tokens muestreados uniformemente de un vocabulario de 2048, con 16.000 secuencias en total (semilla de datos 300). La entropía del conjunto de datos es de 693 bits por secuencia (63 tokens predecibles × log2(2048)), lo que suma 11.088.000 bits. Al no existir estructura lingüística ni estadística en los datos, el modelo no puede generalizar; cualquier reducción de la pérdida se interpreta como memorización directa de las secuencias. No se emplearon técnicas como RLHF o DPO, y no hay innovaciones arquitectónicas destacables: el interés es puramente empírico sobre la capacidad de memorización.

## Capacidades

- Memorización de secuencias aleatorias: el modelo ha memorizado 11.030.454 bits de los 11.088.000 bits de entropía del dataset, alcanzando un 99,5 % de memorización.
- Bits por parámetro: 1,31, lo que cuantifica la eficiencia de almacenamiento del modelo en este régimen.
- Reproducibilidad: el checkpoint incluye la semilla de inicialización, la semilla de datos y los hiperparámetros exactos, permitiendo replicar el experimento.
- No dispone de tokenizer: los datos son identificadores de token crudos en el rango [0, 2048), por lo que no puede procesar texto natural.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, al ser un modelo experimental sin aplicación lingüística.

## Casos de uso

- Investigación sobre memorización en modelos de lenguaje: el modelo permite estudiar cuánta información puede almacenar una red neuronal de tamaño dado y cómo se comporta en el régimen de capacidad completa, sirviendo como referencia para el paper original.
- Reproducción de experimentos científicos: al estar publicados el script de entrenamiento, los datos y los resultados completos, otros investigadores pueden verificar y extender los hallazgos de Morris et al. a otras arquitecturas o tamaños.
- Estudio de la capacidad de almacenamiento de redes neuronales: el valor de 1,31 bits por parámetro ofrece una métrica concreta para comparar la eficiencia de memorización entre diferentes configuraciones.
- Educación en aprendizaje automático: el modelo es un ejemplo didáctico de cómo entrenar un transformer desde cero y de cómo medir la memorización mediante la entropía del dataset y la pérdida del modelo.
- Benchmark de sobreajuste: puede utilizarse como caso extremo de sobreajuste total, donde la generalización es imposible por diseño, para contrastar con modelos entrenados en datos con estructura.
- Análisis de curvas de aprendizaje: los resultados completos (18 celdas experimentales) permiten trazar la evolución de la memorización a lo largo del entrenamiento y comparar regímenes de capacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) porque el modelo no está diseñado para tareas de lenguaje natural. Los únicos datos de rendimiento disponibles provienen de la model card y se refieren a la memorización:

| Cantidad | Valor |
|---|---|
| Entropía del dataset | 11.088.000 bits |
| Bits memorizados | 11.030.454 bits (99,5 % de la entropía) |
| Bits por parámetro | 1,31 |

Estos datos se obtuvieron calculando `bits memorizados = entropía del dataset - pérdida NLL del modelo en bits`.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB, incluso en fp32 (el modelo ocupa aproximadamente 33,75 MB en memoria).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; también funciona en CPU sin problemas.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU consumer moderna (GTX 1060, RTX 3060, etc.) y en hardware integrado.
- Opciones de despliegue: puede cargarse con `transformers` mediante `AutoModelForCausalLM.from_pretrained`, o exportarse a GGUF para usarse con llama.cpp u Ollama, aunque no se proporcionan archivos GGUF en el repositorio.
- Latencia y throughput: al ser un modelo de 8,44M parámetros, la inferencia es prácticamente instantánea en cualquier hardware; no se han publicado mediciones formales.

## Comparativa con modelos similares

No se dispone de modelos comparables en la misma categoría, ya que este checkpoint es un experimento de investigación sobre memorización en datos aleatorios, no un modelo de lenguaje general. Los GPT-2 pequeños convencionales (por ejemplo, GPT-2 de 124M parámetros) están entrenados en texto natural y persiguen objetivos completamente distintos. Tampoco existen otros checkpoints públicos que reproduzcan el mismo régimen de capacidad con los mismos datos y métricas. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo no es útil para tareas de procesamiento de lenguaje natural: no genera texto coherente ni comprende instrucciones, ya que fue entrenado exclusivamente con tokens aleatorios.
- No incluye tokenizer: los datos de entrada y salida son identificadores de token crudos en el rango [0, 2048), lo que impide su uso directo con texto.
- Riesgo de alucinación no aplica en el sentido habitual, pero el modelo puede producir secuencias arbitrarias si se le proporcionan entradas fuera de la distribución de entrenamiento.
- Sesgos conocidos: al ser datos aleatorios, no hay sesgos lingüísticos, pero tampoco hay ninguna capacidad de generalización; cualquier evaluación fuera del dataset de entrenamiento carece de significado.
- Restricciones de licencia: la licencia MIT permite uso comercial y modificación sin restricciones, pero el valor práctico del modelo es nulo fuera del ámbito de investigación.
- Para producción: no se recomienda su uso en ningún sistema real; es exclusivamente un artefacto de investigación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pngwn/memcap-l-below-capacity
- Paper original: https://arxiv.org/abs/2505.24832
- Dataset de entrenamiento: https://huggingface.co/datasets/pngwn/memcap-random-data
- Resultados completos (18 celdas): https://huggingface.co/datasets/pngwn/memcap-results
- Repositorio de ejecuciones (rama `l_n16000_s0_fp32`): https://huggingface.co/pngwn/memcap-runs
