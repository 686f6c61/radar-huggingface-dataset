# doth4580/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw-Engram

## Resumen

DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw-Engram es un paquete de despliegue autocontenido publicado por el usuario doth4580 que combina tres componentes para servir el modelo DeepSeek-V4.1-Flash-1017 en hardware NVIDIA DGX Spark (GB10) mediante el runtime veloGB10. No es un modelo entrenado desde cero, sino un empaquetado de inferencia: reúne los pesos cuantizados EXL3 a 2,9 bits por peso (procedentes de Mia-AiLab), las tablas de embeddings Engram en FP8 originales de DeepSeek-AI y una serie de manifiestos y hashes SHA-256 precalculados para acelerar el primer arranque.

El modelo subyacente, DeepSeek-V4.1-Flash-1017, es un transformer de aproximadamente 105.250 millones de parámetros (según los safetensors del repositorio), distribuido en 39 shards EXL3 de unos 210,6 GB más dos shards Engram de unos 190 GB, lo que da un total de repositorio de 413,7 GB. La cuantización EXL3 a 2,97 bpw efectivos (con `lm_head` en 6 bits y drafter DSpark en 4 bits) reduce de forma drástica el espacio de pesos frente a FP8 o BF16, permitiendo servir el modelo en clústeres de varios nodos GB10 en lugar de exigir GPUs de centro de datos de gama alta.

La relevancia de este paquete es operativa: el autor incluye `shard_hashes.json` y manifiestos `engram_head0..7.manifest.json` para que veloGB10 omita el hashing SHA-256 de cientos de GB en el primer arranque, y estructura el repositorio para que el runtime detecte automáticamente las tablas Engram sin flags adicionales. Está pensado para despliegues TP2, TP4 y TP8 sobre DGX Spark interconectados por RoCEv2 a 200 GbE de doble carril.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (DeepSeek-V4.1-Flash-1017); pesos EXL3 con tablas Engram FP8 |
| Parámetros totales | 105.247.867.090 (~105,25 mil millones) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | EXL3 2,9 bpw (2,97 bpw efectivos; `lm_head` 6-bit, drafter DSpark 4-bit); Engram en FP8 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (39 shards EXL3 + 2 shards Engram FP8) |

## Arquitectura y entrenamiento

El paquete no documenta el entrenamiento del modelo base; se limita a redistribuir pesos ya entrenados por DeepSeek-AI y cuantizados por Mia-AiLab. La arquitectura subyacente es la de DeepSeek-V4.1-Flash-1017, un transformer con tablas de embeddings Engram (un mecanismo de memoria/embedding de gran tamaño que en este repositorio ocupa dos shards FP8 de aproximadamente 190 GB). El checkpoint EXL3 se distribuye en 39 shards con un total de unos 210,6 GB y una tasa efectiva de 2,97 bits por peso, lo que implica cuantización de bloques con escalas por grupo; el `lm_head` se mantiene a 6 bits y el drafter DSpark (usado para decodificación especulativa con `--mtp on`) a 4 bits.

La innovación técnica del paquete no está en el modelo sino en el empaquetado para veloGB10: incluye `shard_hashes.json` con digests SHA-256 y tamaños en bytes de todos los shards fuente, de las 8 cabezas Engram empaquetadas y de los segmentos por rango para TP2, TP4 y TP8, además de manifiestos `engram_head0..7.manifest.json`. Con ello el runtime evita recalcular hashes de varios cientos de GB en el primer arranque. El repositorio conserva `config.json`, `quantization_config.json`, tokenizer y chat template, por lo que sigue siendo compatible con herramientas EXL3 estándar además de con veloGB10. No se dispone de información sobre composición del dataset, número de tokens de entrenamiento ni etapas de RLHF/DPO.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base DeepSeek-V4.1-Flash-1017; el paquete no añade ni documenta capacidades nuevas.
- Decodificación especulativa: soportada vía drafter DSpark con la flag `--mtp on` en veloGB10.
- Memoria Engram: tablas de embeddings de gran tamaño servidas en FP8 desde `engram_source/`, detectadas automáticamente por el runtime.
- Despliegue multi-nodo: soporte de tensor parallelism TP2, TP4 y TP8 sobre DGX Spark.
- Tool calling, agentes, capacidades multilingües, visión o audio: no disponible en la información proporcionada.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en clústeres DGX Spark: el paquete está diseñado para arrancar directamente con `gb10_inference --model-dir` sobre 2, 4 u 8 nodos GB10, sin necesidad de pasar `--engram-source` ni de calcular hashes manualmente.
- Inferencia de un modelo de ~105 mil millones de parámetros en hardware de borde: la cuantización EXL3 a 2,9 bpw permite alojar los pesos en un clúster de estaciones GB10 en lugar de GPUs de centro de datos, útil para laboratorios con presupuesto limitado.
- Arranques reproducibles en producción: los hashes precalculados y los manifiestos por rango TP permiten validar la integridad de los shards y reducir el tiempo de primer arranque en despliegues repetidos.
- Servicio de API interna: el runtime expone un servidor HTTP (`--server --port 9099`) que puede integrarse en backends de aplicaciones internas.
- Investigación sobre cuantización extrema: sirve como referencia práctica para estudiar el impacto de 2,9 bpw en un modelo de este tamaño, comparando con el checkpoint EAQ original de Mia-AiLab.
- Pruebas de escalado de tensor parallelism: los segmentos por rango precalculados para TP2/TP4/TP8 facilitan experimentos de rendimiento y comparación de topologías de interconexión RoCEv2.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/almacenamiento: el repositorio ocupa 413,7 GB; los pesos EXL3 suman ~210,6 GB y las tablas Engram ~190 GB.
- GPU recomendadas: NVIDIA DGX Spark (GB10), en configuraciones de 2, 4 u 8 nodos según la documentación del autor.
- Interconexión: RoCEv2 a 200 GbE de doble carril entre nodos para TP8.
- Cabe en GPU de consumo: no disponible; el paquete está orientado explícitamente a GB10.
- Opciones de despliegue: veloGB10 (`gb10_inference`); compatible también con herramientas EXL3 estándar según el autor. No se documenta soporte de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| doth4580/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw-Engram | ~105,25 B | EXL3 2,9 bpw + Engram FP8 | no disponible | MIT | safetensors |
| Mia-AiLab/DeepSeek-V4.1-Flash-1017-EXL3-EAQ-v1-2.9-bpw | no disponible | EXL3 2,9 bpw EAQ | no disponible | no disponible | safetensors |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 | no disponible | FP8 (original) | no disponible | no disponible | safetensors |

La diferencia principal frente a los dos anteriores es el empaquetado: este repositorio integra las tablas Engram y los manifiestos de veloGB10 en un único directorio, mientras que el checkpoint de Mia-AiLab requiere pasar `--engram-source` por separado y el modelo original de DeepSeek-AI no incluye la cuantización EXL3.

## Limitaciones y advertencias

- El repositorio tiene 0 descargas y 0 likes en el momento de la ficha; no hay evidencia de uso en producción ni validación comunitaria.
- Es un paquete de terceros (doth4580) sobre pesos de DeepSeek-AI y cuantizaciones de Mia-AiLab; la licencia MIT se preserva del upstream, pero conviene verificar los términos del modelo base antes de uso comercial.
- La cuantización a 2,9 bpw puede degradar la calidad frente a FP8 o BF16; no se han publicado evaluaciones que cuantifiquen esa pérdida.
- No hay información sobre sesgos, tasas de alucinación, idiomas soportados ni longitud de contexto; no debe asumirse ninguno de estos datos.
- El despliegue está atado al runtime veloGB10 y a hardware GB10; no se documenta compatibilidad con otros motores de inferencia.
- El tamaño total (413,7 GB) y la dependencia de interconexión RoCEv2 entre nodos añaden complejidad operativa y puntos de fallo en el clúster.
- No se dispone de benchmarks ni de métricas de latencia/throughput que permitan estimar coste por token.

## Enlaces

- Hugging Face: https://huggingface.co/doth4580/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw-Engram
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Cuantización EXL3 EAQ: https://huggingface.co/Mia-AiLab/DeepSeek-V4.1-Flash-1017-EXL3-EAQ-v1-2.9-bpw
- Perfil del autor: https://huggingface.co/doth4580
