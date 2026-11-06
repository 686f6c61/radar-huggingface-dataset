# mrysh/qwen3.5-9b-prune_24

## Resumen

qwen3.5-9b-prune_24 es una versión podada de Qwen/Qwen3.5-9B, publicada por el usuario mrysh en Hugging Face. No se trata de un modelo entrenado para uso general, sino de un artefacto experimental creado para un benchmark de poda (pruning) que compara cuatro modelos base con ocho variantes de poda cada uno, y contrasta esos resultados con cuantización. La evaluación se realiza sobre BFCL, hiring-bias y MedQA usando vLLM.

La variante concreta aplica una poda semi-estructurada 2:4: en cada grupo de cuatro pesos consecutivos de las capas lineales del decodificador se fuerzan dos a cero, lo que supone un 50,0 % de ceros. La poda se realizó con NVIDIA ModelOpt 0.46.0rc1 (SparseGPT) sobre un conjunto de calibración de 512 muestras mixtas. El fichero resultante es denso: los ceros se almacenan como ceros, por lo que no hay reducción de tamaño en disco ni ganancia de velocidad sin un runtime disperso, que no se utilizó.

El modelo conserva la arquitectura y el tamaño del base (8.953.803.264 parámetros según safetensors, 17,9 GB en el repositorio) y la licencia Apache 2.0. No se aplicó destilación ni fine-tuning posterior a la poda, por lo que el autor advierte explícitamente de una caída de calidad frente al modelo original. Su interés es, por tanto, metodológico: sirve para medir el impacto de la dispersión 2:4 en tareas de tool calling, sesgo de contratación y preguntas médicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_text (transformer decoder-only, según tag del repositorio) |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el autor menciona cuantización solo como comparador del benchmark) |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (fichero denso, con ceros almacenados) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base Qwen/Qwen3.5-9B, etiquetada en el repositorio como qwen3_5_text. Sobre esa arquitectura se aplicó una poda semi-estructurada 2:4 en las capas lineales del decodificador mediante NVIDIA ModelOpt 0.46.0rc1, usando el algoritmo SparseGPT con un conjunto de calibración de 512 muestras mixtas. El patrón 2:4 impone dos ceros en cada bloque de cuatro pesos consecutivos, es decir, un 50,0 % de dispersión.

No hubo destilación ni fine-tuning de recuperación tras la poda. El resultado es un checkpoint denso: los pesos podados se guardan como ceros reales, de modo que el tamaño en disco (17,928 GB) no se reduce respecto al base y la aceleración potencial requiere un runtime que explote la dispersión estructurada, algo que, según el autor, no se empleó en la evaluación. El modelo se evaluó como modelo de texto con vLLM y el modo thinking desactivado.

## Capacidades

- Generación de texto y razonamiento general, heredados del base Qwen3.5-9B, con la degradación esperable por la poda sin recuperación.
- Tool calling y function calling: es una de las capacidades evaluadas en el benchmark mediante BFCL.
- Respuesta a preguntas de dominio médico: evaluada con MedQA.
- Comportamiento en escenarios de sesgo de contratación: evaluado con hiring-bias.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking: el autor indica que la evaluación se hizo con thinking desactivado; no se documenta su comportamiento con thinking activo.
- Vision, audio u otras modalidades: no disponibles.

## Casos de uso

- Benchmark de poda: usar el checkpoint como una de las ocho variantes del estudio comparativo frente al base y frente a versiones cuantizadas, midiendo la caída en BFCL, hiring-bias y MedQA con vLLM.
- Investigación sobre dispersión 2:4: analizar cómo afecta el patrón semi-estructurado a las capas lineales del decodificador de un transformer de ~9B sin recuperación posterior.
- Evaluación de SparseGPT con ModelOpt: reproducir el pipeline de poda con 512 muestras de calibración y comparar la calidad resultante con otras variantes del mismo benchmark.
- Estudio de tool calling degradado: medir la pérdida de precisión en function calling (BFCL) cuando el modelo ha perdido el 50 % de pesos en las capas lineales, como referencia para decidir si merece la pena un fine-tuning de recuperación.
- Análisis de sesgo: emplear la tarea hiring-bias para comprobar si la poda agrava o atenúa sesgos presentes en el modelo base.
- Validación de runtimes dispersos: servir el checkpoint con un runtime que explote la dispersión 2:4 y comparar latencia y throughput frente a la ejecución densa, que es la que se usó en el benchmark original.
- Referencia negativa en pipelines de compresión: usar este modelo como línea base de "poda sin recuperación" frente a variantes con destilación o fine-tuning, para cuantificar el coste real de omitir esa fase.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. El autor indica que el modelo forma parte de un benchmark que compara variantes de poda y cuantización sobre BFCL, hiring-bias y MedQA con vLLM, pero no se incluyen las puntuaciones en la model card ni en los metadatos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint en BF16 ocupa aproximadamente 17,9 GB, por lo que se necesitan al menos ~18 GB solo para pesos, más overhead de KV cache y activaciones; en la práctica, 24 GB o más para contexto moderado.
- Cuantización: no se documentan versiones GGUF ni cuantizadas de este checkpoint; al ser un fichero denso con ceros almacenados, una cuantización estándar no aprovecharía la estructura 2:4.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para BF16 con contexto limitado.
- GPU de consumo: cabe en RTX 4090 y, con cuantización agresiva no documentada, potencialmente en GPUs de 16 GB, aunque esto no está verificado por el autor.
- Despliegue: el autor evaluó con vLLM; al ser un checkpoint de la familia qwen3_5_text en safetensors, es compatible con stacks habituales (vLLM, TGI), pero no se documentan recetas para llama.cpp u Ollama.
- Latencia y throughput: no disponibles. La ganancia de velocidad de la dispersión 2:4 requiere un runtime disperso que no se utilizó en la evaluación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| mrysh/qwen3.5-9b-prune_24 | 8.953.803.264 | no disponible | apache-2.0 | Variante podada 2:4, sin fine-tuning posterior |
| Qwen/Qwen3.5-9B | no disponible en la información proporcionada | no disponible | apache-2.0 (según el modelo derivado) | Modelo base original |
| Otras variantes prune_* del mismo benchmark | no disponible | no disponible | apache-2.0 | Ocho variantes de poda por cada uno de los cuatro modelos del estudio |

La comparación relevante es contra el propio modelo base Qwen/Qwen3.5-9B: misma arquitectura y mismo número de parámetros almacenados, pero con un 50,0 % de ceros en las capas lineales del decodificador y sin recuperación de calidad. No se dispone de datos de rendimiento comparado en la información proporcionada.

## Limitaciones y advertencias

- Caída de calidad esperada: el autor advierte explícitamente de que no hubo destilación ni fine-tuning tras la poda, por lo que el rendimiento debe ser inferior al del base.
- Sin ganancia de tamaño ni de velocidad por defecto: el fichero es denso (ceros almacenados como ceros) y la aceleración requiere un runtime disperso que no se empleó.
- Sin datos de benchmarks publicados: no se pueden citar cifras concretas de BFCL, hiring-bias o MedQA para este checkpoint.
- Idiomas no documentados: se desconoce el soporte multilingüe efectivo tras la poda.
- Contexto no documentado: no se indica la longitud de contexto soportada, aunque se hereda del base.
- Riesgo de alucinación: no evaluado específicamente; la poda sin recuperación puede agravarlo.
- Sesgos: el benchmark incluye una tarea de hiring-bias, lo que sugiere que el autor considera relevante medir sesgos, pero no se publican resultados.
- Uso comercial: la licencia Apache 2.0 lo permite, pero al ser un artefacto de benchmark sin recuperación de calidad, no es recomendable para producción.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrysh/qwen3.5-9b-prune_24
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- NVIDIA ModelOpt (librería de poda empleada): no se proporciona enlace en la información disponible
- Paper de SparseGPT: no se proporciona enlace en la información disponible
- Benchmark BFCL: no se proporciona enlace en la información disponible
