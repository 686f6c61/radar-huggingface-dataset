# CharlesDDDD/DRV-Qwen3-1.7B-loop3-loop4-avg

## Resumen

DRV-Qwen3-1.7B-loop3-loop4-avg es un modelo de lenguaje de 1.720 millones de parámetros derivado de Qwen3-1.7B-Base mediante un proceso de preentrenamiento continuado con recurrencia en profundidad (depth recurrence). Lo desarrolla CharlesDDDD dentro de la colección Depth Recurrent Vector (DRV), y su innovación central consiste en que las capas 8-19 (12 de las 28 capas del transformer original) forman un bloque que se ejecuta varias veces consecutivas reutilizando los mismos pesos, de modo que el modelo obtiene más cómputo por token sin incrementar el número de parámetros.

El checkpoint publicado es un promedio de pesos de dos variantes entrenadas con distinto número de pasadas: `loop3-run1` (3 pasadas) y `loop4-run1` (4 pasadas). El promedio elimina el patrón de subida y bajada de pérdida que muestran los modelos individuales al superar su profundidad de entrenamiento, y el modelo resultante usa 3 pasadas por defecto. Sobre el conjunto de test retenido alcanza una pérdida de 1.1204 con 3 pasadas, frente a 1.1460 del modelo de control sin bucle, lo que supone una mejora de aproximadamente 0.026 nats.

Es relevante ahora porque explora una vía alternativa al escalado tradicional: aumentar el cómputo efectivo por token mediante recurrencia en profundidad en lugar de añadir parámetros. No obstante, es un modelo base sin ajuste por instrucciones, con soporte limitado en motores de servicio y con código personalizado que requiere `trust_remote_code=True`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con recurrencia en profundidad (looped transformer): capas 8-19 repetidas N veces con los mismos pesos |
| Parámetros totales | 1.720.577.024 (~1,72 B) |
| Parámetros activos | No aplica (no es MoE); el bloque recurrente reutiliza pesos, no añade parámetros |
| Longitud de contexto | 16.384 tokens (secuencias de entrenamiento); no se documenta límite de inferencia adicional |
| Tipos de cuantización | No disponible (pesos publicados en bfloat16, safetensors) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers, requiere `custom_code`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B-Base, un transformer de 28 capas. En la variante DRV, las capas 8-19 (12 capas) constituyen un bloque que se ejecuta varias veces seguidas con los mismos pesos; las capas 0-7 se ejecutan una vez antes del bloque y las capas 20-27 una vez después. La conexión entre pasadas se realiza mediante una compuerta aprendida por canal oculto (`model.loop_gate`): la primera pasada lee la salida `e` de la capa 7, y cada pasada posterior lee `e + g * (salida de la pasada anterior - e)`. Con `g = 0` el modelo es exactamente el Qwen3 original, lo que convierte el bucle en una modificación que arranca desde la identidad.

El entrenamiento consistió en un preentrenamiento continuado de aproximadamente 20.000 millones de tokens (una pasada sobre una mezcla de web, PDF, código y trayectorias de agente), con secuencias de 16.384 tokens, optimizador AdamW, LR pico de 3e-4 con decaimiento coseno. Además, se aplicó una pérdida auxiliar de peso 0,0555 sobre la predicción de cada pasada intermedia, de forma que detener el bucle antes de tiempo sigue produciendo salidas razonables. El checkpoint publicado promedia los pesos de las variantes de 3 y 4 pasadas para estabilizar el comportamiento más allá de la profundidad de entrenamiento.

## Capacidades

- Generación de texto autoregresiva como modelo base (no instruction-tuned): completado de texto, continuación de documentos y modelado de lenguaje puro.
- Razonamiento y conocimiento general heredados de Qwen3-1.7B-Base, potenciados por el mayor cómputo por token del bucle.
- Generación de código, dado que la mezcla de entrenamiento incluye código.
- Procesamiento de documentos PDF y texto web, presentes en la mezcla de datos.
- Modelado de trayectorias de agente: el dataset de entrenamiento incluye agent-trajectory, lo que puede favorecer la continuación de trazas multi-paso.
- Control flexible de profundidad en inferencia mediante el parámetro `num_loops` (cualquier número de pasadas, aunque el entrenamiento se centra en 3-4).
- No dispone de tool calling, function calling ni modo thinking documentados; al ser un modelo base, estas capacidades requerirían ajuste posterior.
- Capacidades multilingües: no documentadas explícitamente.

## Casos de uso

- Investigación sobre recurrencia en profundidad: el modelo sirve como banco de pruebas para estudiar cómo afecta el número de pasadas a la pérdida y a las capacidades emergentes, comparando directamente con el control `DRV-Qwen3-1.7B-midtrain-noloop`.
- Ajuste fino supervisado (SFT) como base: al ser un modelo base de 1,72 B y licencia Apache-2.0, puede adaptarse a dominios concretos mediante SFT o LoRA, partiendo de una pérdida de test inferior a la de Qwen3-1.7B-Base.
- Completado de código en entornos de desarrollo: la mezcla de entrenamiento incluye código, por lo que puede usarse para autocompletado o continuación de fragmentos en pipelines internos, siempre con validación posterior.
- Procesamiento de documentos largos: con contexto de 16.384 tokens y entrenamiento sobre PDF y web, es adecuado para tareas de extracción y resumen sobre documentos de extensión media, mediante prompts de continuación.
- Generación de datos sintéticos: como modelo base, puede generar corpus de texto para entrenar modelos menores o para aumentar datasets, controlando el número de pasadas según el presupuesto de cómputo.
- Modelado de trayectorias de agente en investigación: dado que el entrenamiento incluye agent-trajectory, puede emplearse para estudiar la continuación de secuencias de acciones y observaciones en entornos simulados.
- Experimentos de eficiencia computacional: permite medir el compromiso entre calidad (pérdida) y coste (número de pasadas) en un mismo conjunto de pesos, útil para decidir políticas de parada temprana.

## Benchmarks y rendimiento

El autor solo publica pérdida de test sobre el conjunto retenido de la mezcla de entrenamiento, no resultados en benchmarks estándar (MMLU, HumanEval, GSM8K, etc.).

| Pasadas | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
|---|---|---|---|---|---|---|---|---|
| Pérdida | 1,1907 | 1,1437 | 1,1204 | 1,1247 | 1,1261 | 1,1258 | 1,1275 | 1,1279 |

Control sin bucle (`DRV-Qwen3-1.7B-midtrain-noloop`): 1,1460. La mejor pérdida se obtiene con 3 pasadas (1,1204), coherente con la profundidad de entrenamiento; a partir de 4 pasadas la pérdida se estabiliza en torno a 1,125-1,128 sin degradación severa, gracias al promedio de pesos.

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 3,4 GB solo para pesos, más caché KV. Con 3 pasadas, cada pasada mantiene su propia caché KV, por lo que la caché total es unas 1,9 veces la de un Qwen3-1.7B estándar; en la práctica, el consumo total puede situarse en torno a 6-10 GB según longitud de contexto y lote.
- GPU recomendadas: A100 (40/80 GB) o H100 para lotes grandes y contexto completo de 16K; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia con lotes pequeños.
- Cabe en GPU de consumo: sí, en tarjetas con 12-24 GB (RTX 3060 12 GB, RTX 4070 Ti, RTX 4090) para contexto moderado y lote 1; el contexto completo de 16K con 3 pasadas exige más memoria por la caché KV multiplicada.
- Opciones de despliegue: únicamente `transformers` con `trust_remote_code=True` (probado con transformers 5.14). vLLM y otros motores de servicio no soportan esta arquitectura todavía; llama.cpp, Ollama y TGI no están soportados.
- Latencia y throughput: no disponibles. Cabe esperar un coste de cómputo proporcional al número de pasadas (3 pasadas ≈ 3 veces el coste del bloque de 12 capas recurrente), pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Pérdida de test | Licencia | Servicio |
|---|---|---|---|---|---|
| DRV-Qwen3-1.7B-loop3-loop4-avg | 1,72 B | 16.384 | 1,1204 (3 pasadas) | Apache-2.0 | Solo transformers con código personalizado |
| DRV-Qwen3-1.7B-midtrain-noloop | 1,72 B | 16.384 | 1,1460 | Apache-2.0 | transformers |
| Qwen/Qwen3-1.7B-Base | 1,72 B | 32.768 (según Qwen3) | No disponible | Apache-2.0 | transformers, vLLM, llama.cpp, etc. |

La comparación con Qwen3-1.7B-Base en pérdida no es directa porque el conjunto de test es el de la mezcla de entrenamiento del DRV, no el de Qwen3. La ventaja del DRV es la mejora de pérdida frente a su propio control sin bucle; la desventaja es la falta de soporte en motores de servicio y la necesidad de código personalizado.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no sigue instrucciones de forma fiable sin SFT previo.
- No soportado por vLLM, llama.cpp, Ollama ni TGI; solo funciona con transformers y `trust_remote_code=True`, lo que limita su uso en producción.
- La caché KV se multiplica por el número de pasadas (aproximadamente 1,9x con 3 pasadas respecto a Qwen3-1.7B), lo que reduce el throughput y aumenta la VRAM necesaria en contexto largo.
- La pérdida empeora ligeramente con más de 3 pasadas (1,1247 con 4 frente a 1,1204 con 3), aunque sin degradación severa; el número óptimo de pasadas está acotado por el entrenamiento.
- Riesgo de alucinación y sesgos heredados de Qwen3-1.7B-Base y de la mezcla de datos de preentrenamiento continuado (web, PDF, código, trayectorias de agente), sin filtrado documentado.
- Idiomas soportados no documentados; el comportamiento multilingüe no está garantizado.
- Sin datos de benchmarks estándar ni evaluaciones de seguridad publicadas.
- Licencia Apache-2.0 permite uso comercial, pero la ausencia de soporte en motores de servicio y de ajuste por instrucciones exige trabajo adicional antes de un despliegue en producción.
- El autor indica que la implementación de HF coincide con su código de entrenamiento con una tolerancia de 0,003 nats de pérdida en cada número de pasadas; desviaciones mayores podrían indicar problemas de versión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CharlesDDDD/DRV-Qwen3-1.7B-loop3-loop4-avg
- Colección Depth Recurrent Vector: https://huggingface.co/collections/CharlesDDDD/depth-recurrent-vector-6afb5dd4d36338a8677f35fa
- Modelo de referencia sin bucle: https://huggingface.co/CharlesDDDD/DRV-Qwen3-1.7B-midtrain-noloop
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
