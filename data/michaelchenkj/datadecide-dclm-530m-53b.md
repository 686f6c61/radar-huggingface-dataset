# michaelchenkj/datadecide-dclm-530m-53b

## Resumen

datadecide-dclm-530m-53b es un modelo de lenguaje autorregresivo de 530 millones de parámetros publicado por el usuario michaelchenkj. Se trata de un entrenamiento con la arquitectura OLMo-1 (decoder-only, d=1344, 16 capas, 16 cabezas, SwiGLU, RoPE, RMSNorm, vocabulario de 50.280 tokens y contexto de 2048) sobre una única pasada de 53.000 millones de tokens del corpus DCLM-baseline, siguiendo las recetas del proyecto DataDecide de AllenAI. La relación tokens/parámetro es exactamente 100, el denominado rung de 530 M de DataDecide.

No es un modelo orientado a producto: no hay ajuste por instrucciones, RLHF ni DPO, y el autor no publica resultados de benchmarks de tareas estándar. Su valor está en la trazabilidad: el repositorio incluye checkpoints cada 1.000 pasos además del final, el índice de datos barajado, los logs de entrenamiento, los scripts de entrenamiento y evaluación, y evaluaciones EasyBench con generaciones por ejemplo.

Es relevante en el contexto de investigación porque la curación del corpus es una de las palancas más estudiadas para mejorar modelos pequeños, y esta ejecución está documentada de forma casi completa (semilla 6198, batch global de 448 secuencias, 57.786 pasos), lo que permite aislar el efecto de la receta de datos del resto de decisiones de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only autorregresivo, familia OLMo-1 |
| Parámetros totales | 530 M (rung de 530 M de DataDecide) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 2048 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantización | no disponible (solo se publican pesos en bf16; no hay GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | no disponible (el autor no los declara; el corpus DCLM-baseline procede de Common Crawl filtrado para inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en bf16 más tokenizer en `weights/stepN/`; checkpoints completos de reanudación en PyTorch (`model.pt`, `optim.pt`, `train.pt`) en `step57786-unsharded/` |
| Dimensión del modelo (d_model) | 1344 |
| Capas / cabezas de atención | 16 capas / 16 cabezas (dimensión por cabeza 84) |
| Normalización y activación | RMSNorm, SwiGLU, RoPE |
| Vocabulario | 50.280 tokens (tokenizer de OLMo) |
| Tokens de entrenamiento | 53,0 B (ratio tokens/parámetro = 100) |
| Dataset | `allenai/DataDecide-data-recipes`, shards DCLM en formato uint16 npy |
| Pasos de entrenamiento | 57.786 |
| Tamaño del repositorio | 77,6 GB (incluye todos los checkpoints intermedios) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia OLMo-1 con normalización RMSNorm, atención con RoPE, FFN con activación SwiGLU, d_model de 1344, 16 capas y 16 cabezas de atención, con una longitud de secuencia fija de 2048 tokens y un vocabulario de 50.280 entradas. Es un modelo base entrenado exclusivamente con el objetivo autorregresivo de predicción del siguiente token; no se aplicó ningún tipo de ajuste por preferencias (RLHF o DPO) ni ajuste por instrucciones.

El entrenamiento consistió en una única pasada (un epoch) sobre 53,0 B tokens de DCLM-baseline, tomados de los shards uint16 del dataset `allenai/DataDecide-data-recipes` (receta `fastdclm/.../allenai`). Se ejecutaron 57.786 pasos con un batch global de 448 secuencias (917.504 tokens por paso), tasa de aprendizaje de 2,77e-3 con decaimiento coseno, 578 pasos de warmup, α=0,01, optimizador AdamW con betas 0,9/0,95 y weight decay 0,05. El entrenamiento se realizó sobre 8×H100 con paralelismo de datos (DDP), microbatch de 8 y 7 pasos de acumulación de gradiente, con semilla 6198. La pérdida final de validación (NLL sobre FineWeb con el tokenizer de OLMo) fue de 2,845.

Más allá del propio modelo, la innovación relevante es metodológica: el repositorio guarda checkpoints cada 1.000 pasos, el índice global barajado usado en la pasada (`train_data/global_indices.npy`), la configuración completa del entrenador (`config.yaml`), los logs y las evaluaciones, lo que permite reproducir la ejecución y analizar la evolución de las métricas paso a paso. Existe una ejecución compañera con la misma receta pero con otro esquema (`michaelchenkj/mdlm-dclm-530m-53b`), lo que facilita comparaciones controladas.

## Capacidades

- Generación de texto autorregresiva y continuación de texto en inglés a nivel de modelo base de 530 M, sin ajuste por instrucciones ni plantilla de chat.
- Razonamiento limitado: al ser un modelo de 530 M entrenado con 53 B tokens, las capacidades de razonamiento multi-paso, matemáticas y código son previsiblemente básicas; el autor no publica métricas que las cuantifiquen.
- No soporta tool calling ni function calling: no se ha entrenado ni ajustado para ello.
- No soporta uso agéntico ni razonamiento multi-paso con herramientas.
- Capacidades multilingües: no declaradas; el corpus de entrenamiento es DCLM-baseline, derivado de Common Crawl filtrado para inglés, por lo que en la práctica debe considerarse un modelo monolingüe en inglés.
- No dispone de modo "thinking", visión, audio ni ninguna otra modalidad distinta del texto.
- Capacidad destacable de tipo instrumental: al distribuir checkpoints intermedios cada 1.000 pasos, permite estudiar la aparición progresiva de habilidades a lo largo del entrenamiento.
- Reproducibilidad: incluye el índice de datos, la configuración del entrenador y los scripts de descarga, empaquetado y evaluación.

## Casos de uso

- Estudio de recetas de datos y leyes de escalado: el modelo se entrenó con una receta DCLM concreta sobre el rung de 530 M y ratio tokens/parámetro 100; comparar su pérdida de validación (NLL 2,845 en FineWeb) con otros rungs o recetas de DataDecide permite aislar el efecto de la mezcla y filtrado del corpus.
- Baseline de ablación en investigación: al estar documentados semilla, batch, tasa de aprendizaje y pasos, sirve como punto de referencia controlado frente a variantes como la ejecución compañera `mdlm-dclm-530m-53b` u otros esquemas de entrenamiento.
- Análisis de dinámica de entrenamiento con checkpoints intermedios: los checkpoints cada 1.000 pasos y las métricas por paso (`evals/metrics.json`) permiten estudiar curvas de aprendizaje, emergencia de habilidades y estabilidad del optimizador sin reentrenar.
- Ajuste fino supervisado en dominios concretos: con 530 M de parámetros y licencia Apache 2.0, es un candidato razonable para fine-tuning de clasificación de texto, análisis de sentimiento o etiquetado de secuencias sobre datasets etiquetados, con un coste de cómputo bajo.
- Generación de texto de baja complejidad en producción con restricciones de recursos: autocompletado, resúmenes extractivos cortos o generación de titulares dentro de su ventana de 2048 tokens, desplegado en CPU o en una GPU modesta.
- Investigación en destilación y modelos pequeños: puede actuar como estudiante destilado desde modelos mayores o como referencia para comparar técnicas de compresión, dado que su arquitectura es estándar y compatible con `transformers`.
- Pruebas de infraestructura y benchmarking de frameworks: al ser un modelo pequeño con pesos bf16, resulta útil para medir throughput y latencia de vLLM, TGI, `transformers` o `llama.cpp` (este último previa conversión a GGUF) en distintas configuraciones de hardware.
- Docencia y formación: sus checkpoints públicos y sus scripts permiten reproducir de principio a fin un entrenamiento a escala media sin disponer de un clúster grande, algo poco habitual en modelos publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas estándar (MMLU, HumanEval, GSM8K, ARC, HellaSwag y similares) en la información disponible. El único dato numérico de rendimiento aportado por el autor es la pérdida de validación:

| Métrica | Valor |
|---|---|
| NLL de validación en FineWeb (tokenizer de OLMo) | 2,845 |

El repositorio incluye evaluaciones EasyBench (`evals/metrics.jsonl`, `metrics.json` por paso y generaciones `.jsonl` por ejemplo) y una tabla resumen en `RESULTS.md`, pero los valores concretos de esa tabla no forman parte de la información proporcionada, por lo que no se reproducen aquí.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 1,06 GB solo para los pesos, más overhead de runtime; en la práctica entre 2 y 3 GB contando activaciones.
- Caché KV en bf16: unos 84 KiB por token (16 capas × 16 cabezas × 84 dimensiones × 2 tensores), aproximadamente 172 MiB para una secuencia completa de 2048 tokens.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060 12 GB, RTX 4060, RTX 4090, e incluso en CPU con RAM suficiente o en iGPU con memoria compartida.
- Ajuste fino completo: con precisión mixta, los pesos más gradientes y estados de AdamW en fp32 ocupan del orden de 8,5 GB, por lo que es viable en una única GPU de 24 GB con gradient checkpointing.
- Entrenamiento original: 8×H100 con DDP, microbatch de 8 y 7 pasos de acumulación de gradiente; no se documentan requisitos de hardware para reentrenar, pero la receta es escalable a configuraciones menores ajustando el batch efectivo.
- Opciones de despliegue: `transformers` de forma nativa (formato safetensors, `library_name: transformers`, tag `endpoints_compatible`). Para vLLM, TGI u Ollama es necesario verificar el soporte de la arquitectura OLMo en la versión correspondiente; no se distribuyen pesos GGUF, por lo que su uso en `llama.cpp` exigiría una conversión propia.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tokens de entrenamiento | Licencia | Disponibilidad | Benchmarks publicados |
|---|---|---|---|---|---|---|
| datadecide-dclm-530m-53b | 530 M | 2048 | 53 B (DCLM-baseline) | Apache 2.0 | HuggingFace, safetensors bf16 y checkpoints cada 1.000 pasos | No incluidos en la información disponible (solo NLL de validación 2,845) |
| michaelchenkj/mdlm-dclm-530m-53b (ejecución compañera) | 530 M | no disponible | 53 B (DCLM-baseline) | no disponible | HuggingFace | no disponible |
| OLMo-1 de 1 B (AllenAI) | ~1,2 B | 2048 | no disponible | Apache 2.0 | HuggingFace | no disponible |
| Pythia-410M (EleutherAI) | 410 M | 2048 | 300 B (The Pile) | Apache 2.0 | HuggingFace | no disponible |

La comparación de rendimiento entre estos modelos no puede establecerse con la información disponible: ninguno de los datos aportados incluye métricas comparables de MMLU, HumanEval, GSM8K o similares, y el autor de este modelo solo publica la pérdida de validación. En términos de disponibilidad, la diferencia principal es que este repositorio distribuye checkpoints intermedios y artefactos de entrenamiento completos, algo que los modelos de referencia citados no ofrecen.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones: no sigue instrucciones de forma fiable ni mantiene formatos de conversación; requiere ajuste fino supervisado para tareas de asistente.
- Riesgo elevado de alucinación: con 530 M de parámetros y 53 B tokens, la factualidad y la coherencia a largo plazo son limitadas, especialmente fuera de su ventana de 2048 tokens.
- Contexto muy corto (2048 tokens) para estándares actuales, lo que restringe resumen de documentos largos, RAG con muchos fragmentos y diálogos extensos.
- Idiomas: el autor no declara idiomas soportados y el corpus DCLM-baseline está filtrado para inglés, por lo que el rendimiento en castellano u otros idiomas no está garantizado ni evaluado.
- Sesgos: no se documenta ningún análisis de sesgos, toxicidad o filtrado posterior al entrenamiento; el corpus procedente de Common Crawl puede arrastrar sesgos y contenido problemático.
- Licencia Apache 2.0, que permite uso comercial del modelo, pero los datos de entrenamiento no se redistribuyen en el repositorio (~100 GB) y deben descargarse desde `allenai/DataDecide-data-recipes`, sujetos a las condiciones de ese dataset.
- Trazabilidad limitada en la práctica: el modelo tiene 0 descargas y 0 "likes", sin validación independiente ni evaluaciones de terceros.
- Tamaño del repositorio de 77,6 GB: conviene descargar solo el subdirectorio necesario (`weights/step57786/**`) mediante `allow_patterns` para evitar transferencias innecesarias.
- Reproducibilidad parcial: aunque se publica la semilla 6198 y la configuración del entrenador, los resultados pueden variar según el hardware, la topología DDP y la versión de las librerías.
- Sin cuantizaciones oficiales ni pesos GGUF: el despliegue en entornos de baja memoria requiere conversión y validación por parte del usuario.
- No dispone de soporte de tool calling, agentes, visión, audio ni modos de razonamiento explícito.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/michaelchenkj/datadecide-dclm-530m-53b
- Ejecución compañera: https://huggingface.co/michaelchenkj/mdlm-dclm-530m-53b
- Dataset de recetas de datos: https://huggingface.co/datasets/allenai/DataDecide-data-recipes

Nota: la búsqueda web realizada no devolvió ningún resultado relacionado con este modelo ni con el proyecto DataDecide; los enlaces anteriores proceden exclusivamente de la información del repositorio de HuggingFace.
