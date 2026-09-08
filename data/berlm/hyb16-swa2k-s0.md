# Berlm/hyb16-swa2k-s0

## Resumen

El modelo hyb16-swa2k-s0 es un modelo de lenguaje híbrido de 366 millones de parámetros desarrollado por Berlm. Forma parte de una familia de cinco modelos entrenados con una receta idéntica de 15.000 millones de tokens y una longitud de secuencia de 16.384, diseñados para comparar el rendimiento de distintos token mixers en contextos largos. Este modelo concreto combina 18 capas de atención deslizante con ventana de 2.048 tokens y 6 capas de atención completa, lo que lo convierte en una arquitectura híbrida que busca equilibrar eficiencia y capacidad de atender a todo el contexto.

El modelo se entrenó sobre el dataset FineWeb-Edu con el tokenizador de Llama-2, utilizando un esquema de decaimiento de aprendizaje con warmup. Su relevancia radica en que permite estudiar cómo la elección del token mixer afecta al rendimiento en tareas de comprensión y recuperación de información en secuencias largas. Los resultados de evaluación muestran que, aunque la pérdida de validación es normal, la recuperación de información se degrada rápidamente más allá de los 2.000 tokens, lo que constituye una propiedad aprendida del modelo y un dato valioso para la investigación en arquitecturas de atención.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 18 capas de atención deslizante (ventana 2048) + 6 capas de atención completa |
| Parámetros totales | 366.265.344 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 16.384 |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo tiene 24 capas en total, con un tamaño oculto de 1.024, 6 cabezas de dimensión 128 en las capas lineales/EDM y 8 cabezas de 128 en las capas de atención. Las MLPs usan SwiGLU con tamaño intermedio de 2.816, normalización RMSNorm y embeddings de entrada/salida atados. Las 18 capas de atención deslizante emplean RoPE con theta 10.000, mientras que las 6 capas de atención completa no usan codificación posicional (NoPE). Todas las capas de atención tienen una puerta de salida sigmoide.

El entrenamiento se realizó con 15.000 millones de tokens de FineWeb-Edu, empaquetados en secuencias de 16.384 sin enmascaramiento de documentos. Se usó el optimizador AdamW con una tasa de aprendizaje máxima de 8e-4, warmup de 1.500 millones de tokens y un esquema warmup-stable-decay con decaimiento a partir de 13.500 millones de tokens. La precisión fue bf16, y las capas lineales se ejecutaron con kernels GDN2 de flash-linear-attention, mientras que las capas de atención usaron flash-attn 2 como backend por defecto.

## Capacidades

- Generación de texto en inglés a partir de un contexto de hasta 16.384 tokens.
- Comprensión de lenguaje en tareas de razonamiento y conocimiento general (ARC, HellaSwag, PIQA, Winogrande, BoolQ, OpenBookQA).
- Evaluación de recuperación de información mediante pruebas de aguja (S-NIAH) y tareas de completado (LAMBADA, WikiText).
- Soporte de carga con `trust_remote_code=True` y código personalizado incluido en el repositorio.
- No dispone de soporte de tool calling, agentes, visión ni audio.

## Casos de uso

- Investigación en arquitecturas de atención híbrida: permite comparar el rendimiento de capas deslizantes frente a capas de atención completa bajo una receta de entrenamiento idéntica, útil para estudios académicos.
- Evaluación de estrategias de codificación posicional: al combinar NoPE en las capas completas y RoPE en las deslizantes, el modelo sirve para analizar el impacto de estas técnicas en el aprendizaje de posiciones.
- Pruebas de recuperación de información en contexto largo: los resultados de S-NIAH muestran una degradación clara más allá de 2.000 tokens, lo que lo convierte en un caso de estudio para investigar por qué un modelo no utiliza todo su contexto disponible.
- Generación de texto en inglés para prototipos de bajo coste: con 366 millones de parámetros y un tamaño de pesos de 0,7 GB, es adecuado para experimentos en entornos con recursos limitados.
- Benchmarking de eficiencia de token mixers: permite medir throughput, memoria y calidad de salida en función del tipo de atención utilizada, comparando con los modelos hermanos.
- Educación en mecanismos de atención: al incluir código de modelado personalizado y requerir `trust_remote_code`, resulta útil para enseñar cómo se implementan arquitecturas híbridas con GDN2 y flash-attn.

## Benchmarks y rendimiento

La siguiente tabla muestra los resultados de la evaluación zero-shot del modelo (columna "swa2k") junto con los de sus hermanos (gdn2, edm, swa1k, mix). Los valores son accuracy salvo que se indique lo contrario.

| Métrica | swa2k (este modelo) | gdn2 | edm | swa1k | mix |
|---|---|---|---|---|---|
| Pérdida de validación final (nats) | 2,3289 | 2,3055 | 2,2977 | 2,3245 | 2,3156 |
| arc_easy / arc_challenge | 55,0 / 25,0 | 59,4 / 26,1 | 59,7 / 25,2 | 57,0 / 25,0 | 57,1 / 25,1 |
| hellaswag (acc_norm) | 40,8 | 41,5 | 42,0 | 40,7 | 41,5 |
| piqa / winogrande / boolq | 64,7 / 52,5 / 58,7 | 66,5 / 52,5 / 56,5 | 67,3 / 52,2 / 59,5 | 66,5 / 50,4 / 61,0 | 67,1 / 53,0 / 58,8 |
| openbookqa (acc_norm) | 31,2 | 33,4 | 31,8 | 32,0 | 31,6 |
| lambada acc / ppl | 37,4 / 29,3 | 35,5 / 29,9 | 35,9 / 28,2 | 33,4 / 37,4 | 34,6 / 31,5 |
| wikitext word ppl | 25,3 | 24,8 | 24,3 | 25,1 | 25,1 |
| swde / fda / squad_completion | 50,9 / 13,2 / 21,5 | 56,0 / 66,2 / 36,7 | 55,5 / 62,1 / 38,4 | 47,9 / 51,5 / 21,8 | 53,8 / 13,6 / 35,4 |
| social_iqa (prompt-qualified) | 37,5 | 38,8 | 39,0 | 37,8 | 37,9 |

Resultados de recuperación single-needle (S-NIAH, fracción correcta):

| Métrica | swa2k (este modelo) | gdn2 | edm | swa1k | mix |
|---|---|---|---|---|---|
| needle-1 @1K/2K/4K/8K | 1,00 / 1,00 / 0,52 / 0,28 | 1,00 / 1,00 / 1,00 / 1,00 | 1,00 / 1,00 / 1,00 / 1,00 | 1,00 / 0,98 / 0,96 / 0,94 | 1,00 / 1,00 / 0,53 / 0,28 |
| needle-1 @16K/32K | 0,15 / 0,05 | 1,00 / 1,00 | 1,00 / 1,00 | 0,95 / 0,94 | 0,15 / 0,05 |
| needle-2 @1K/2K/4K/8K | 0,94 / 0,71 / 0,42 / 0,25 | 1,00 / 1,00 / 1,00 / 1,00 | 1,00 / 1,00 / 1,00 / 0,97 | 1,00 / 0,99 / 0,98 / 0,81 | 1,00 / 1,00 / 0,48 / 0,20 |
| needle-2 @16K/32K | 0,15 / 0,08 | 0,93 / 0,37 | 0,94 / 0,65 | 0,88 / 0,63 | 0,13 / 0,08 |
| needle-3 @1K/2K/4K/8K | 0,18 / 0,30 / 0,29 / 0,25 | 0,98 / 0,98 / 0,91 / 0,63 | 0,96 / 0,95 / 0,84 / 0,54 | 0,99 / 0,94 / 0,76 / 0,37 | 0,98 / 0,98 / 0,30 / 0,01 |
| needle-3 @16K/32K | 0,16 / 0,06 | 0,17 / 0,04 | 0,45 / 0,20 | 0,16 / 0,09 | 0,00 / 0,00 |

La model card advierte de que las diferencias inferiores a 0,5 puntos en tareas de generación deben tratarse como ruido, ya que todos los resultados provienen de una sola semilla.

## Requisitos de hardware

- El tamaño de los pesos en safetensors es de 0,7 GB (366 millones de parámetros en bf16).
- VRAM estimada para inferencia: no disponible. No se han publicado requisitos específicos.
- GPU recomendadas: no disponible. Se necesita una GPU CUDA; no se especifica un modelo concreto.
- ¿Cabe en GPU de consumo? Probablemente sí, dado el tamaño de los pesos, pero no está confirmado.
- Opciones de despliegue: solo se documenta el uso mediante `transformers` con `trust_remote_code=True`. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Los modelos hermanos de esta familia comparten la misma receta de entrenamiento y solo difieren en las capas de token mixer. La siguiente tabla compara este modelo con gdn2, edm y swa1k.

| Modelo | Parámetros | Contexto | Pérdida de validación | needle-1 @16K | Licencia |
|---|---|---|---|---|---|
| hyb16-swa2k-s0 (este) | 366.265.344 | 16.384 | 2,3289 | 0,15 | MIT |
| hyb16-gdn2-s0 | 366.265.344 | 16.384 | 2,3055 | 1,00 | MIT |
| hyb16-edm-s0 | 366.265.344 | 16.384 | 2,2977 | 1,00 | MIT |
| hyb16-swa1k-s0 | 366.265.344 | 16.384 | 2,3245 | 0,95 | MIT |

Los modelos gdn2 y edm muestran una recuperación perfecta a 16K, mientras que swa1k (ventana 1024) mantiene una recuperación alta. Este modelo, con ventana 2048, sufre un colapso en la recuperación a partir de 2K, lo que indica que la ventana deslizante no es el único factor determinante.

## Limitaciones y advertencias

- La recuperación de información se degrada drásticamente más allá de 2.000 tokens, a pesar de que la ventana de contexto es de 16.384. La model card confirma que es una propiedad aprendida del modelo, no un error de evaluación.
- Solo soporta inglés; no hay evidencia de capacidades multilingües.
- No dispone de soporte de tool calling, agentes, visión ni audio.
- Requiere `trust_remote_code=True` y dependencias específicas que no están incluidas en el repositorio, lo que complica su integración en entornos estándar.
- Los resultados de evaluación provienen de una sola semilla; las diferencias menores de 0,5 puntos en tareas de generación deben considerarse ruido.
- Al estar entrenado con FineWeb-Edu, puede heredar sesgos presentes en los datos web filtrados. No se han publicado análisis de sesgos ni pruebas de seguridad o alineación.
- El modelo no está pensado para uso en producción: es un modelo de investigación con 0 descargas y 0 likes en el momento de la consulta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Berlm/hyb16-swa2k-s0
- Modelos hermanos:
  - https://huggingface.co/Berlm/hyb16-gdn2-s0
  - https://huggingface.co/Berlm/hyb16-edm-s0
  - https://huggingface.co/Berlm/hyb16-swa1k-s0
  - https://huggingface.co/Berlm/hyb16-mix-s0
- No se encontraron papers, blogs, repositorios adicionales ni demos en la búsqueda web.
