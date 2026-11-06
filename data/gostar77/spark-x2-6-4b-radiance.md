# gostar77/spark-x2.6-4b-radiance

## Resumen

Spark X2.6 4B Radiance es una colección de contenedores cuantizados en formato `.rad` del modelo base XHToken/Spark-X2.6-4B, publicada por el usuario gostar77 para el runtime Radiance. No se trata de un modelo nuevo ni de un fine-tuning: son conversiones de pesos (BF16, IQ8R e híbridos IQ8R/BF16) pensadas para ejecutar el modelo Spark en el motor Radiance, que todavía no soporta esta arquitectura en sus releases estables. El modelo subyacente es un transformer causal de 36 capas con dimensión oculta 2560, 4 cabezas KV y un vocabulario de 131.072 entradas, lo que sugiere un tamaño del orden de 4.000 millones de parámetros, coherente con el nombre del checkpoint.

La relevancia de esta publicación es fundamentalmente de infraestructura: ofrece variantes cuantizadas a 8 bits (IQ8R) con calibración GPTQ publicada por separado y mediciones de paridad numérica frente al contenedor BF16 de referencia. Para desarrolladores que quieran desplegar Spark X2.6 en hardware con VRAM limitada, los contenedores IQ8R reducen el peso de 8,29 GiB a 4,52-5,67 GiB manteniendo una concordancia top-1 superior al 98,6 % con la referencia BF16.

El contexto máximo declarado del modelo base es de 1.048.576 posiciones, aunque los ejemplos de ejecución del autor limitan `--max-model-len` a 8192. La licencia es "other" y no se detallan sus términos en la información disponible. El repositorio tiene 25,0 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (clase `Spark2_5ForCausalLM`), 36 capas, hidden 2560, 4 cabezas KV |
| Parametros totales | No disponible de forma explícita; el nombre del checkpoint indica 4B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1.048.576 posiciones según el modelo base; los ejemplos de ejecución usan 8192 |
| Tipos de cuantizacion | BF16, IQ8R (int8 rotado `fwht128` con GPTQ), IQ8R con cabeza de salida BF16, IQ8R con capas 0-11 en BF16 |
| Idiomas soportados | No disponible |
| Licencia | other (términos no detallados) |
| Formato de pesos | `.rad` (runtime Radiance); el modelo base no se distribuye aquí en safetensors ni GGUF |
| Vocabulario | 131.072 entradas |
| Tamano de los contenedores | BF16: 8,29 GiB; IQ8R: 4,52 GiB; IQ8R + cabeza BF16: 4,83 GiB; IQ8R keep12: 5,67 GiB |
| Calibración IQ8R | 216 ficheros `RADGRAM2` para las 36 capas, acumulados de 65.660 tokens |

## Arquitectura y entrenamiento

El modelo base es un transformer causal denso con 36 capas, dimensión oculta 2560 y 4 cabezas KV (lo que implica GQA con un ratio de compartición elevado). El vocabulario de 131.072 entradas y el límite de 1.048.576 posiciones son los datos más destacables de la arquitectura. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF, DPO o ajuste por preferencias.

La innovación técnica de esta publicación está en el proceso de cuantización, no en el modelo. Las variantes IQ8R cuantizan seis proyecciones por capa sobre una rejilla int8 rotada mediante `fwht128` (transformada de Hadamard-Walsh de 128 puntos) y usan GPTQ con gram matrices calculadas sobre un corpus diverso de 65.660 tokens. La cabeza de salida atada se cuantiza con RTN en la variante completa, o se mantiene en BF16 en la variante "bf16-head". La variante "keep12" conserva las capas 0-11 en BF16 y cuantiza el resto, lo que según las mediciones del autor ofrece la mejor paridad numérica. Las normas se mantienen en FP32 en el contenedor BF16 y las filas Q/K/V fusionadas se dividen durante la conversión.

## Capacidades

- Generación de texto autoregresiva con modo de razonamiento ("thinking") activado por defecto; la salida expone `reasoning_content` junto a `content`.
- Desactivación del modo thinking mediante `{"chat_template_kwargs": {"enable_thinking": false}}`.
- Tool calling / function calling con argumentos tipados y round-trip de resultados de herramientas.
- Razonamiento multi-paso y uso en flujos de agente, a tenor de las categorías evaluadas (chat, matemáticas, código y tool calls).
- Generación de código y resolución de problemas matemáticos (categorías incluidas en el conjunto de evaluación del autor).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Visión y audio: no disponibles; no se mencionan en la model card.
- Paralelismo tensorial (TP) en el runtime Radiance con grados 1, 2, 4 y 8; TP 3 se rechaza para el shard FFN-down por la alineación a grupos de escala de 128 columnas.

## Casos de uso

- Despliegue en GPU de consumo con VRAM limitada: la variante IQ8R de 4,52 GiB permite cargar el modelo en tarjetas de 8-12 GB, frente a los 8,29 GiB del contenedor BF16, manteniendo una concordancia top-1 del 98,684 % con la referencia.
- Servicio de chat con razonamiento explícito: el modo thinking por defecto y la separación entre `reasoning_content` y `content` facilitan construir interfaces que muestran u ocultan la cadena de razonamiento según el caso de uso.
- Agentes con tool calling: el soporte de argumentos tipados y el round-trip de resultados permite integrar el modelo en pipelines de agentes que invocan APIs externas y consumen sus respuestas.
- Evaluación de cuantización en producción: los contenedores y las gram matrices publicadas permiten reproducir la calibración y medir la degradación numérica frente a BF16 antes de adoptar IQ8R en un servicio real.
- Procesamiento de documentos largos: el límite teórico de 1.048.576 posiciones del modelo base habilita escenarios de contexto extenso, aunque en la práctica el autor valida con 8192 y el consumo de KV cache crece de forma lineal.
- Inferencia con paralelismo tensorial en nodos multi-GPU: los grados TP 1, 2, 4 y 8 alineados con los grupos de escala de 128 columnas permiten repartir el modelo en configuraciones de 2, 4 u 8 GPUs.
- Investigación sobre runtimes alternativos: sirve como banco de pruebas para el runtime Radiance y sus kernels `libr4d` en arquitecturas AMD (gfx1201) y, presumiblemente, otras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tarea (MMLU, GSM8K, HumanEval) en la información disponible. La model card lo indica explícitamente. Lo que sí se publica son métricas de paridad numérica frente al contenedor BF16 del mismo checkpoint, medidas en una R9700 (gfx1201) sobre 32 documentos independientes y disjuntos (31.391 posiciones puntuadas, decodificación greedy, estimación KL top-128 más cola):

| Variante | Concordancia top-1 | KL media | KL mediana | KL p99 | KL p99.9 | KL máx. | Ratio de perplejidad vs BF16 |
|---|---:|---:|---:|---:|---:|---:|---:|
| IQ8R, cabeza cuantizada | 98,684 % | 0,003738 | 6,55e-5 | 0,04956 | 0,33897 | 13,7988 | 1,00392 |
| IQ8R, cabeza BF16 | 98,751 % | 0,003178 | 6,30e-5 | 0,02942 | 0,30051 | 14,4245 | 1,00331 |
| IQ8R keep12 | 99,114 % | 0,000667 | 3,45e-5 | 0,00899 | 0,03323 | 0,9031 | 1,00204 |

Throughput medido para IQ8R completo: prefill de 11,8k / 11,8k / 11,3k tok/s con prompts de 1,1k / 4,4k / 9,9k tokens; decode de 93,7 tok/s desde prompt corto y 88,9 tok/s con contexto de 4,4k tokens. La variante keep12 cuesta aproximadamente un 12 % de prefill y un 17 % de decode. La variante con cabeza BF16 no se ha medido en throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: 8,29 GiB (BF16), 4,52 GiB (IQ8R), 4,83 GiB (IQ8R + cabeza BF16), 5,67 GiB (IQ8R keep12), sin contar KV cache ni overhead del runtime.
- GPU recomendadas: el autor reporta mediciones en una AMD Radeon R9700 (gfx1201). No se especifican GPU NVIDIA validadas; el runtime Radiance y los kernels `libr4d` condicionan la compatibilidad.
- GPU de consumo: las variantes IQ8R caben en tarjetas de 8 GB o más de VRAM; la BF16 requiere 12 GB o más para dejar margen a la KV cache.
- Opciones de despliegue: exclusivamente el runtime Radiance, y solo en builds que incluyan las ramas #359 (BF16) y #363 (IQ8R). No hay soporte en vLLM, llama.cpp, Ollama ni TGI según la información disponible.
- Comando de referencia del autor: `radiance --model spark-x2.6-4b-radiance-iq8r-bf16-head.rad --radiance-home <build>/radiance_home --kernels libr4d --tp 1 --kv-cache-dtype bf16 --max-model-len 8192 --max-num-batched-tokens 1024`.
- Latencia y throughput: prefill de 11,3k-11,8k tok/s y decode de 88,9-93,7 tok/s en R9700 con TP 1 para IQ8R completo.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de tarea que permitan una comparación de rendimiento con alternativas. La comparación posible es a nivel de formato y despliegue:

| Modelo / variante | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Spark X2.6 4B Radiance (este repo) | ~4B | 1.048.576 (modelo base); 8192 en ejemplos | `.rad` | other | Solo runtime Radiance con ramas #359/#363 |
| XHToken/Spark-X2.6-4B (base) | ~4B | 1.048.576 | No disponible en esta información | No disponible | Hugging Face |
| Checkpoint FP8 de XHToken | ~4B | 1.048.576 | FP8 | No disponible | Hugging Face (referenciado por el autor) |

El autor advierte explícitamente que las mediciones de paridad no comparan Radiance IQ8R con el checkpoint FP8 de XHToken. Para alternativas de otros fabricantes en el rango de 4B no hay datos en la información proporcionada.

## Limitaciones y advertencias

- El soporte de Spark no está fusionado en ninguna release de Radiance: los contenedores solo cargan en builds con las ramas #359 y #363, y las mediciones asumen además #362. Sin esa rama, el redondeo de una fila depende de las filas que comparten su onda de prefill.
- No hay resultados de benchmarks de tarea; las cifras publicadas miden paridad con BF16, no calidad absoluta del modelo.
- Persisten outliers severos de KL en IQ8R completo y en la variante con cabeza BF16 (KL máxima de 13,80 y 14,42 respectivamente), lo que puede traducirse en divergencias puntuales en generaciones concretas.
- La variante con cabeza BF16 no tiene medición de throughput.
- TP 3 se rechaza para el shard FFN-down por la alineación a grupos de escala de 128 columnas; solo TP 1, 2, 4 y 8 son válidos.
- La licencia "other" no detalla condiciones de uso comercial; es necesario consultar los términos del modelo base XHToken/Spark-X2.6-4B antes de un despliegue en producción.
- No se dispone de información sobre idiomas soportados, sesgos conocidos ni tasas de alucinación.
- El repositorio no registra descargas ni likes, y el autor es un particular (gostar77), no el desarrollador del modelo base; la trazabilidad y el mantenimiento no están garantizados.
- El contexto práctico validado es de 8192 tokens; usar el límite teórico de 1.048.576 posiciones exige verificar el comportamiento de la KV cache y del runtime.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/gostar77/spark-x2.6-4b-radiance
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B
- Dataset de calibración IQ8R: https://huggingface.co/datasets/gostar77/spark-x2.6-4b-iq8r-calibration
- Runtime Radiance: https://codeberg.org/StillDeadcode/radiance
- Pull request #359 (soporte BF16): https://codeberg.org/StillDeadcode/radiance/pulls/359
- Pull request #363 (soporte IQ8R): https://codeberg.org/StillDeadcode/radiance/pulls/363
- Pull request #362 (determinismo de redondeo): https://codeberg.org/StillDeadcode/radiance/pulls/362
