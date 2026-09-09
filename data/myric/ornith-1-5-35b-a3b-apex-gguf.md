# Myric/Ornith-1.5-35B-A3B-APEX-GGUF

## Resumen

Ornith-1.5-35B-A3B-APEX-GGUF es una conversión cuantizada en formato GGUF del modelo Ornith-1.5-35B-A3B, realizada por Myric y publicada en Hugging Face. El modelo original es un MoE de 35,5 mil millones de parámetros totales y aproximadamente 3 mil millones de parámetros activos, con una arquitectura híbrida que combina atención completa en una cuarta parte de las capas con un mecanismo recurrente de tipo gated-delta-net. La conversión de Myric ofrece tres niveles de cuantización, denominados i-quality, i-compact e i-mini, pensados para adaptarse a diferentes presupuestos de memoria al tiempo que conservan características que la mayoría de conversiones GGUF eliminan, como la cabeza de predicción multi-token (MTP).

La relevancia del modelo radica en que permite ejecutar un MoE de gran capacidad en hardware de consumo, con soporte para un contexto de hasta 262.144 tokens y una cabeza MTP que habilita decodificación especulativa en llama.cpp. Además, la cuantización mantiene coeficientes recurrentes en F32 y la cabeza MTP en Q4_K, lo que puede ofrecer un mejor equilibrio entre calidad y velocidad frente a una cuantización plana estándar. El proyecto se distribuye bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: gated-delta-net con atención completa en cada 4ª capa; MoE con 256 expertos enrutados (top-8) |
| Parametros totales | 35,5 B (35.505 B según el autor) |
| Parametros activos | ~3 B (MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Tres variantes GGUF: i-quality (4,88 bpw, 21,67 GB), i-compact (3,74 bpw, 16,58 GB), i-mini (2,83 bpw, 12,55 GB). Expertos enrutados por bandas de profundidad, expertos compartidos Q8_0, atención Q6_K, coeficientes recurrentes en F32 y cabeza MTP en Q4_K |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors convertidos a BF16 GGUF y cuantizados) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B es un MoE con 256 expertos enrutados y una selección de top-8, donde solo se activan unos 3 mil millones de parámetros por token. Su arquitectura es híbrida: combina una gated-delta-net (un tipo de red recurrente con estado constante) con atención completa en cada cuarta capa. De las 40 capas del backbone, 10 son de atención completa, con 2 cabezas KV y head_dim 256, lo que resulta en un KV cache de solo 20 KiB por token. El resto de capas mantienen un estado recurrente de tamaño constante. Además, el modelo incluye una cabeza de predicción multi-token de 1 capa (blk.40) que no se suele conservar en las conversiones GGUF.

Esta conversión concreta se realizó a partir de los safetensors originales, usando una matriz de importancia publicada por bartowski (sha256 `8d5b1693…c0228`), y aplicando una asignación de cuantización por bandas estructurales según la profundidad, en lugar de una sensibilidad medida por tensor. Los expertos enrutados se dividen en tres grupos (edge, near y middle) con distintos niveles de precisión según la profundidad, mientras que los expertos compartidos se mantienen en Q8_0 y la atención en Q6_K. La cabeza MTP se conserva y se cuantiza a Q4_K. No se proporcionan detalles sobre los datos de entrenamiento del modelo base ni sobre procesos de alineación.

## Capacidades

- Generación de texto y código en contextos largos de hasta 262.144 tokens, gracias a la ventana de contexto completa.
- Razonamiento agente y multi-paso: el modelo resolvió 9 de 9 tareas en un suite de coding agente de nivel frontier, con 154 de 154 tests individuales superados.
- Decodificación especulativa mediante la cabeza MTP integrada, con soporte en llama.cpp a través de `--spec-type draft-mtp`, lo que permite mejorar la velocidad de generación con `--spec-draft-n-max 1`.
- Tres niveles de cuantización (i-quality, i-compact, i-mini) que permiten adaptar el modelo a diferentes presupuestos de memoria.
- Soporte de visión mediante un proyectador mmproj de la editorial original, aunque la ruta visual no ha sido verificada en esta conversión.

## Casos de uso

- Asistente de programación local: el modelo puede utilizarse como asistente de código en entornos de desarrollo (por ejemplo, con continuaciones en IDEs) gracias a su capacidad de razonamiento y a su rendimiento en tareas agénticas de programación. La ejecución con llama.cpp permite mantener los datos en local.
- Agentes automatizados: dado que resuelve tareas agénticas de nivel frontier, es adecuado para flujos de trabajo que requieren razonamiento multi-paso, como la generación de scripts, la recuperación de información y la coordinación de herramientas en un pipeline.
- Análisis de documentos largos: con 262.144 tokens de contexto, puede resumir o analizar repositorios completos, contratos extensos, informes técnicos o bases de conocimiento sin fragmentar la entrada.
- Despliegue en entornos con memoria limitada: la variante i-mini, de 12,55 GB, permite ejecutar el modelo en GPUs de gama media o incluso en CPU con suficiente RAM, lo que facilita el despliegue en equipos sin GPU dedicada o en entornos de edge.
- Servicios de inferencia con baja latencia: la cabeza MTP permite acelerar la generación incremental hasta unos 73,5 tokens/s en una DGX Spark usando `--spec-draft-n-max 1`. Esto es útil para chatbots de código o asistentes interactivos donde la latencia es crítica.
- Asistencia multimodo experimental: al incluir el proyectador de visión del editor original, el modelo podría utilizarse para tareas de imagen a texto si se verifica el funcionamiento de la ruta visual. Por ahora es una opción de investigación.

## Benchmarks y rendimiento

En la información disponible se aportan resultados del suite de coding agente de nivel frontier (9 tareas) y mediciones de velocidad de generación en una DGX Spark (GB10) con llama.cpp estándar. No se han encontrado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K.

Suite de coding agente (nivel frontier, 9 tareas, una ejecución, i-quality):

| Metrica | Resultado |
|---|---|
| Tareas resueltas | 9 de 9 |
| Tests individuales superados | 154 de 154 |
| Tareas perdidas por límites del harness | 0 |
| Tokens de salida medios por tarea | 4.050 |
| Tiempo total | 0,92 horas |

Velocidad de generación en DGX Spark (GB10), stock llama.cpp, 8192 de contexto, una sola ranura:

| Nivel de cuantizacion | Tokens/s | Condiciones |
|---|---|---|
| i-quality | 69,0 / 69,9 | llama-server, 300 tokens, dos ejecuciones |
| i-compact | 73,9 | llama-cli, 200 tokens |
| i-mini | 80,8 | llama-cli, 200 tokens |

Nota: los resultados de i-compact y i-mini proceden de un harness distinto al de i-quality, por lo que deben interpretarse como aproximados.

Rendimiento de la decodificación especulativa con la cabeza MTP (modelo i-quality, DGX Spark, 300 tokens, temp 1,0, semilla fija, `cache_prompt: false`):

| Drafter | Tokens/s | Tasa de aceptacion | Longitud media aceptada |
|---|---|---|---|
| Ninguno | 69,00 / 69,86 | — | — |
| draft-mtp, n_max 1 | 73,52 | 0,674 | 1,67 |
| draft-mtp, n_max 2 | 65,24 | 0,385 | 1,77 |
| draft-mtp, n_max 3 | 54,78 | 0,288 | 1,86 |
| draft-mtp, n_max 4 | 46,92 | 0,199 | 1,79 |
| draft-mtp, n_max 6 | 38,01 | 0,133 | 1,79 |

## Requisitos de hardware

- VRAM estimada: la cuantización i-quality ocupa 21,67 GB; i-compact, 16,58 GB; i-mini, 12,55 GB. El KV cache es de 20 KiB por token, lo que supone 2,5 GiB a 131.072 tokens y 5,0 GiB a 262.144. Por tanto, para i-quality con contexto de 131 K se necesitarían aproximadamente 24,2 GiB en total, lo que encaja en una GPU de 24 GB.
- GPU recomendadas: el modelo se ha probado en una DGX Spark (GB10). Para i-quality, una GPU con 24 GB de VRAM (RTX 4090, A100 40 GB, etc.) puede ser suficiente con contexto moderado. Para i-compact e i-mini, son suficientes GPUs como RTX 3090/4090 o incluso RTX 3080 de 10 GB con contexto reducido.
- Soporte en consumer GPU: sí, las variantes i-compact e i-mini están diseñadas para presupuestos de memoria más bajos. i-quality puede ejecutarse en una GPU de consumo de 24 GB con contexto limitado.
- Opciones de despliegue: llama.cpp (llama-server, llama-cli) como opción principal, con soporte para CUDA, Metal, etc. También puede importarse en Ollama. vLLM y TGI no están orientados a formatos GGUF nativos.
- Latencia y throughput: en DGX Spark, i-quality genera aproximadamente 69–70 tokens/s, i-compact 74 tokens/s e i-mini 81 tokens/s. Usando la cabeza MTP como modelo draft en especulación, la velocidad puede aumentar a ~73,5 tokens/s con `--spec-draft-n-max 1`.

## Comparativa con modelos similares

La información disponible no incluye comparativas con otros modelos de la misma categoría. No se han publicado resultados de benchmarks estándar ni comparaciones directas con otros MoE o cuantizaciones del mismo tamaño. Las únicas mediciones presentadas son internas entre las tres variantes de cuantización de este modelo. Para una evaluación relativa, sería necesario consultar los benchmarks del modelo base ornith-ai/Ornith-1.5-35B-A3B, que no se han proporcionado.

## Limitaciones y advertencias

- La ruta de visión no ha sido verificada: el proyectador mmproj carga, pero no se ha ejecutado ninguna imagen a través de estas cuantizaciones ni se ha evaluado. El uso multimodal debe considerarse no probado.
- La asignación de cuantización es estructural por profundidad y no se basa en una sensibilidad medida por tensor. Puede que no sea óptima para todas las capas.
- Los resultados del suite de coding agente proceden de una sola ejecución. El autor advierte de que las tareas individuales pueden variar entre ejecuciones idénticas. Además, el suite satura, por lo que un 9/9 indica que la cuantización supera el umbral de competencia, pero no necesariamente que sea superior a otras opciones.
- Los parámetros de muestreo del modelo original son críticos: substituir el muestreo por el de otro modelo cambia los resultados de forma material. Se recomienda usar `temp 1.0`, `top_k 20` y `top_p 0.95`.
- La profundidad óptima de la cabeza MTP no se transfiere entre modelos; hay que medirla para cada modelo. Además, usar `--spec-draft-n-max > 1` reduce el rendimiento en este modelo.
- Es una conversión no oficial de la comunidad, no afiliada ni respaldada por la editorial original. Se distribuye tal cual, sin garantía.
- La licencia del propio modelo es MIT, lo que permite uso comercial, pero se debe verificar la licencia del modelo base, del proyectador mmproj y de cualquier archivo adicional antes de desplegarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Myric/Ornith-1.5-35B-A3B-APEX-GGUF
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Proyectador de visión (mmproj de la editorial): https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-GGUF/blob/main/mmproj-Ornith-1.5-35B-BF16.gguf
- Fuente de la matriz de importancia (bartowski): https://huggingface.co/bartowski
