# Eureka-COM/MistralMosaic-24B

## Resumen

MistralMosaic-24B es un modelo base de investigación publicado por Eureka-COM que parte de mistralai/Mistral-Small-24B-Base-2501 y sustituye el mecanismo de atención de sus 40 capas por las tres memorias de Two-stage Memory Mosaics+, la arquitectura propuesta por Zhang y Bottou en "Open-world AI: a tale of three requirements" (arXiv:2610.20782). El resultado se obtuvo por destilación del modelo original (el profesor) sobre 99.991.552 tokens, manteniendo intactos los FFN, embeddings y normas de Mistral. No está ajustado a instrucciones.

La relevancia del modelo es fundamentalmente metodológica: demuestra que es posible reemplazar la atención completa de un transformer de 24B parámetros por memorias asociativas de tipo Mosaics y conservar buena parte del rendimiento del profesor, con una penalización de pérdida de tan solo el 2,3 % sobre los clústeres reservados del corpus de entrenamiento. Es, por tanto, una pieza útil para investigadores que estudian arquitecturas alternativas a la atención cuadrática y para quienes exploran destilación de mecanismos internos.

El modelo tiene 31.145.308.800 parámetros reales según los pesos en safetensors (por encima de los 24B nominales del nombre, debido a las memorias adicionales), se distribuye en bf16 con un tamaño de repositorio de 62,3 GB, soporta inglés y japonés, y se publica bajo licencia Apache 2.0. Su contexto de entrenamiento es de 16.384 tokens, aunque acepta entradas de hasta 32.768 sin verificar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mistral con atención sustituida por Two-stage Memory Mosaics+ (memorias short, long y cluster) |
| Parametros totales | 31.145.308.800 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 tokens entrenados; acepta hasta 32.768 sin probar |
| Tipos de cuantizacion | no disponible (solo se publican pesos bf16) |
| Idiomas soportados | inglés, japonés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con código custom en `MemoryMosaics/`) |

## Arquitectura y entrenamiento

El modelo conserva la estructura general de Mistral-Small-24B-Base-2501, pero cada uno de los 40 bloques de atención se reemplaza por tres memorias diferenciadas. La memoria short lee los últimos 256 tokens mediante atención de ventana y es una copia congelada de los 32 cabezales de atención de Mistral, con RoPE base 10⁸ en lugar de una escala ajustada a la ventana, para que los pesos copiados y las posiciones coincidan. La memoria long lee el documento actual excepto los últimos 64 tokens y es una memoria asociativa Mosaics entrenada. La memoria cluster lee documentos anteriores dentro de la misma entrada y también es una memoria asociativa entrenada. Long y cluster usan 40 cabezales con tamaño oficial de 128.

El entrenamiento consistió en destilación del modelo profesor sobre 99.991.552 tokens, con filas mayoritariamente cortas (mediana de 658 tokens en Cosmopedia dentro de los clústeres reservados). El código oficial de MemoryMosaics (commit `c2ca0e8`) se incluye sin modificar en el repositorio y se verifica su SHA-256 antes de importarlo. Dos diferencias respecto al diseño oficial: la memoria short es una copia congelada de Mistral en lugar de entrenada, y la base RoPE es la de Mistral. No se aplicó RLHF ni DPO; es un modelo exclusivamente base.

## Capacidades

- Generación de texto autoregresiva en inglés y japonés.
- Modelado de documentos largos con memoria asociativa sobre el documento actual (memoria long) y sobre documentos previos del mismo input (memoria cluster).
- Procesamiento multi-documento mediante el argumento `doc_lengths` para delimitar cada documento en la entrada.
- Recuperación de información a distancia dentro de un documento, con degradación notable cuando hay valores distractores.
- No dispone de tool calling, function calling ni capacidades de agente.
- No dispone de modo thinking, visión ni audio.
- No está ajustado a instrucciones ni a seguridad.

## Casos de uso

- Investigación en arquitecturas alternativas a la atención: el modelo sirve como banco de pruebas reproducible para estudiar el comportamiento de Memory Mosaics+ a escala 24B, comparando pérdida y tareas con el profesor Mistral-Small-24B-Base-2501.
- Destilación de mecanismos internos: permite analizar cómo se transfiere el conocimiento de la atención completa a memorias asociativas y qué se pierde en el proceso, con métricas publicadas por posición y por idioma.
- Modelado de corpus multi-documento: con `doc_lengths` se pueden procesar lotes de documentos relacionados y evaluar la memoria cluster en tareas de agregación entre documentos.
- Evaluación de recuperación a largo plazo: útil para reproducir los experimentos de recall de valores a 512–14.000 tokens de distancia y medir el impacto de distractores.
- Estudio de multilingüismo en arquitecturas Mosaics: el par inglés-japonés permite comparar la degradación relativa del modelo frente al profesor en dos familias tipológicamente distintas.
- Base para futuros fine-tunes de investigación: al ser Apache 2.0 y estar en safetensors, puede partirse de él para experimentos de ajuste supervisado en dominios concretos, asumiendo la penalización de pérdida frente al profesor.
- Análisis de eficiencia sin KV cache: sirve para medir el coste de recálculo completo por token generado y compararlo con implementaciones con caché.

## Benchmarks y rendimiento

Ratios de pérdida respecto al profesor (1,00 = misma pérdida que Mistral-Small-24B-Base-2501), medidos una vez sobre datos no usados en entrenamiento, con intervalos del 95 % entre corchetes:

| Datos | Ratio |
|---|---|
| Clústeres reservados del corpus de entrenamiento (filas de 16.384 tokens, 64 filas) | 1,023 (1,019–1,028) |
| Documentos posteriores al primero en cada fila | 1,021 (1,017–1,025) |
| Wikipedia en japonés (2.048 tokens, 128 artículos) | 1,083 (1,078–1,089) |
| Wikipedia en inglés (2.048 tokens, 128 artículos) | 1,134 (1,123–1,147) |
| fineweb-edu en inglés (1.024 tokens, 128 documentos) | 1,062 (1,057–1,069) |
| Cosmopedia en inglés (1.024 tokens, 128 documentos) | 1,028 (1,024–1,032) |

Brecha frente al profesor según la posición del token predicho en documentos largos de Wikipedia (16.384 tokens, 24 por idioma):

| Posición del token predicho | Inglés | Japonés |
|---|---|---|
| 1–256 (dentro de la ventana short) | 1,045 | 1,008 |
| 257–2.048 | 1,121 | 1,083 |
| 2.049–8.192 | 1,148 | 1,141 |
| 8.193–16.383 | 1,146 | 1,171 |

Tareas comparadas con el profesor sobre los mismos ítems:

| Tarea | Mistral-Small-24B-Base | MistralMosaic-24B |
|---|---|---|
| Recordar el valor de 5 dígitos de un nombre 512–14.000 tokens después (192 ítems) | 100,0 % | 97,9 % |
| Igual, con 2 valores distractores (192 ítems) | 100,0 % | 19,3 % |
| JCommonsenseQA (1.119 ítems, 3-shot) | 94,7 % | 94,1 % |
| MMLU (1.000 ítems, 5-shot) | 80,7 % | 76,1 % |
| Pérdida del profesor por token en continuaciones muestreadas (temperatura 0,7, 48 prompts) | 0,866 | 0,930 |

Los ítems de opción múltiple se puntúan por verosimilitud de la letra de respuesta, por lo que no son comparables con leaderboards públicos. No se generó ninguna continuación rota (vacía o con un token repetido 16 o más veces).

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 62,3 GB solo para los pesos, más activaciones y el recálculo completo de la entrada en cada token generado al no haber KV cache.
- GPU recomendadas: NVIDIA H200 NVL (usada en las comprobaciones de release), H100, A100 de 80 GB. Para bf16 completo se necesita al menos una GPU de 80 GB.
- En GPU de consumo: no cabe en bf16 en una RTX 4090 (24 GB) ni en una RTX 5090 (32 GB). No se publican cuantizaciones GGUF ni AWQ/GPTQ, por lo que no hay una vía probada para consumer GPU.
- Opciones de despliegue: `transformers` 5.x (construido con 5.22.2) con `trust_remote_code=True`, PyTorch con FlexAttention y `accelerate` para `device_map`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y la ausencia de KV cache hace poco viable su integración directa en esos motores.
- Latencia y throughput: no disponibles como cifras; el autor advierte explícitamente de que la generación es lenta porque cada token vuelve a leer toda la entrada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| MistralMosaic-24B | 31,1B | 16.384 (hasta 32.768 sin probar) | Apache 2.0 | Memoria Mosaics+ destilada; sin KV cache; solo base |
| Mistral-Small-24B-Base-2501 | 24B nominales | 32.768 | Apache 2.0 | Profesor del anterior; atención completa con KV cache; referencia de calidad |
| Mistral-Small-24B-Instruct-2501 | 24B nominales | 32.768 | Apache 2.0 | Variante ajustada a instrucciones del mismo base, apta para producción conversacional |

La comparación directa con otras arquitecturas Mosaics a escala 24B no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Sin KV cache: cada token generado relee toda la entrada, lo que hace la generación lenta; el código oficial tiene caché pero no está conectado a este modelo.
- Solo admite padding a la derecha (`tokenizer.padding_side = "right"`).
- Peor que el profesor al usar la parte de un documento largo situada a más de 256 tokens de distancia; la brecha crece con la posición y llega a ratios de 1,146 en inglés y 1,171 en japonés en el tramo 8.193–16.383.
- El recall de valores distantes falla en su mayor parte cuando hay distractores: cae del 100 % del profesor al 19,3 %.
- MMLU 4,6 puntos por debajo del profesor.
- Entrenado con entradas de hasta 16.384 tokens; las entradas más largas aceptadas (hasta 32.768) no se han probado.
- Sin ajuste a instrucciones ni a seguridad: hereda las limitaciones del modelo base, incluidos sesgos y riesgo de alucinación.
- No se debe pasar `fix_mistral_regex` al tokenizer, o la tokenización diferirá de la del entrenamiento.
- La comprobación de JCommonsenseQA falló en el release: las respuestas elegidas coincidieron en 200/200 preguntas, pero la diferencia máxima en log-probabilidades de las opciones no quedó dentro de tolerancia.
- Requiere `trust_remote_code=True` y ejecuta código incluido en el repositorio, verificado por SHA-256 pero no auditado de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Eureka-COM/MistralMosaic-24B
- Model card en japonés: https://huggingface.co/Eureka-COM/MistralMosaic-24B/blob/main/README_ja.md
- Modelo base: https://huggingface.co/mistralai/Mistral-Small-24B-Base-2501
- Paper de Two-stage Memory Mosaics+: https://arxiv.org/abs/2610.20782
- Referencia arXiv 2507.03285: https://arxiv.org/abs/2507.03285
- Referencia arXiv 2405.06394: https://arxiv.org/abs/2405.06394
- Código oficial de MemoryMosaics: https://github.com/facebookresearch/MemoryMosaics
