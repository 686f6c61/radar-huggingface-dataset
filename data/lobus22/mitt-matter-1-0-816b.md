# Lobus22/Mitt-Matter-1.0-816B

## Resumen

Mitt Matter 1.0 (816B A42B) es un ajuste fino completo (full fine-tune) en curso del modelo `amd/Muse-Spark-Open-816B-A42B-Quark-MXFP4`, desarrollado por Lobus22 en colaboración con AindStudios. Se trata de un modelo de arquitectura Mixture of Experts (MoE) con 816.000 millones de parámetros totales y aproximadamente 42.000 millones activos por token, con bloques de expertos cuantizados en MXFP4 y capas densas (atención, routers, normalizaciones, embeddings y cabeza de salida) en BF16.

El interés técnico del proyecto no reside tanto en el modelo resultante, que el propio autor describe explícitamente como incompleto, sino en el método de entrenamiento propuesto, denominado ZERO-RELAY. Este método permite hacer fine-tuning completo de un modelo de 816B sin necesidad de mantenerlo residente en memoria: indexa los 95.572 tensores de los 65 shards safetensors por rangos de bytes absolutos, descarga cada capa bajo demanda mediante peticiones HTTP range paralelas y aplica actualizaciones sign-SGD directamente sobre los nibbles de 4 bits de los expertos. El pico de VRAM medido es de 9,03 GB en una única GPU T4.

Es relevante ahora porque demuestra empíricamente que es posible tocar los pesos de un MoE de escala frontera desde hardware consumer, aunque con limitaciones severas de calidad y velocidad que el autor documenta con honestidad inusual. No debe confundirse con un checkpoint utilizable: no se han publicado shards de pesos entrenados, solo el motor de entrenamiento y las métricas de las ejecuciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) transformer, con expertos en MXFP4 y capas densas en BF16 |
| Parametros totales | 816.000 millones (816B) |
| Parametros activos | ~42.000 millones (42B) por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (bloques de expertos), BF16 (capas densas, routers, normas, embeddings, cabeza) |
| Idiomas soportados | inglés (en), indonesio (id) |
| Licencia | other (no especificada en detalle) |
| Formato de pesos | safetensors (65 shards, 95.572 tensores, 268,7 GB de repo) |

## Arquitectura y entrenamiento

El modelo base es un MoE con 816B de parámetros totales y ~42B activos, en el que los bloques de expertos están cuantizados en MXFP4 (formato de coma flotante de 4 bits con escalas de bloque E8M0) mientras que las capas densas (atención, routers, normalizaciones, embeddings y cabeza de salida) se mantienen en BF16. El ajuste fino se realiza sobre este checkpoint mediante el método ZERO-RELAY, que no es LoRA: se actualizan los pesos completos, incluidos los nibbles de 4 bits de los expertos.

El procedimiento de ZERO-RELAY consta de cinco pasos según la model card: (1) un índice de bytes sobre los 65 shards safetensors mapea cada uno de los 95.572 tensores a un rango absoluto de bytes; (2) cada capa se descarga del Hub con peticiones HTTP range paralelas y prefetch de una capa por delante, de modo que solo la capa en vuelo existe en disco o RAM; (3) los bloques de expertos se desquantizan de MXFP4 a VRAM y la actualización se aplica directamente sobre los nibbles de 4 bits con sign-SGD, tratando las escalas de bloque como estáticas; (4) los pesos densos en BF16 se actualizan con sign-SGD en BF16; (5) no hay offload ni sharding entre dispositivos: una capa a la vez, con un pico de VRAM de 9,031443456 GB.

Las ejecuciones medidas se hicieron en Kaggle con una única T4 el 2026-11-17. Con dos capas (L29-L30) y dos batches de 256 tokens, la pérdida pasó de 15,11 a 19,06 entre pasos, con tiempos de forward de ~120-123 s y backward de ~144-162 s. Con cuatro capas (L29-L32), prefetch y 16 workers range en paralelo, la pérdida pasó de 15,30 a 19,60. La transferencia de capa se midió entre 36,1 s (207,7 MB/s) y 87,0 s (92,5 MB/s) para 7,5 GB. El autor proyecta un paso completo de 62 capas en aproximadamente 1 hora 45 minutos, proyección no ejecutada de extremo a extremo. También documenta un defecto corregido: el índice de bytes usaba originalmente `data_offsets` de safetensors como si fueran offsets absolutos de fichero, cuando son relativos al inicio del bloque de datos, lo que desplazaba cada lectura por la longitud de cabecera (221.840 bytes en el shard 31) y producía escalas decodificadas como ruido, con bytes E8M0 `255` generando `inf` y luego `NaN` en la pérdida.

## Capacidades

- Generación de texto en inglés e indonesio, heredada del modelo base `amd/Muse-Spark-Open-816B-A42B-Quark-MXFP4`.
- Razonamiento y conocimiento general a escala de 816B de parámetros totales con 42B activos.
- Capacidad potencial de código y matemáticas, no verificada en la información disponible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües limitadas a inglés e indonesio según los tags del modelo.
- Modo thinking, visión o audio: no disponible en la información proporcionada.
- Estado real: el motor de entrenamiento está validado sobre pesos reales, pero solo se ha entrenado un subconjunto de capas y no se ha publicado ningún checkpoint completo.

## Casos de uso

- Investigación sobre entrenamiento distribuido de MoE a gran escala: el método ZERO-RELAY y el código `engine/train_kernel.py` permiten reproducir el streaming de capas por HTTP range y estudiar el comportamiento de sign-SGD sobre pesos MXFP4 sin disponer de un clúster con cientos de GB de VRAM.
- Estudio de actualización directa en 4 bits: investigadores interesados en modificar nibbles MXFP4 in situ pueden usar el motor como banco de pruebas para medir la degradación de pérdida y la estabilidad numérica de las escalas de bloque.
- Reproducción de bajo coste en hardware consumer: con un pico de 9,03 GB de VRAM, el pipeline cabe en una T4, una RTX 3060 de 12 GB o una RTX 4090, lo que permite experimentar con fine-tuning de modelos de escala frontera en entornos docentes o de laboratorio con presupuesto limitado.
- Auditoría de checkpoints cuantizados: el índice de bytes y la corrección del defecto de `data_offsets` sirven como herramienta para verificar la coherencia de tensores de escala en repositorios safetensors MXFP4 de terceros.
- Base para futuros checkpoints de la serie Mitt Matter: el autor indica que Mitt Matter 1.0 será el más pequeño de la serie, por lo que este repositorio actúa como referencia metodológica para versiones posteriores.
- Evaluación de viabilidad económica: las métricas de transferencia (92,5-207,7 MB/s) y de cómputo permiten estimar el coste de un fine-tuning completo de 62 capas y compararlo con alternativas como LoRA o QLoRA.
- No es adecuado para despliegue en producción: al no existir shards entrenados publicados, no hay artefacto inferible más allá del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Las únicas métricas publicadas son de entrenamiento, no de calidad del modelo:

| Ejecución | Capas | Pérdida paso 1 | Pérdida paso 2 | Forward (s) | Backward (s) | VRAM pico (GB) |
|---|---|---|---|---|---|---|
| run_v13_two_layer | L29-L30 | 15,1119 | 19,0627 | 123,45 / 119,51 | 143,81 / 161,80 | 9,031443456 |
| run_v16_four_layer | L29-L32 | 15,3038 | 19,6041 | 122,49 / 120,85 | no disponible | 9,031443456 |

El propio autor advierte que la pérdida se calcula sobre un pase truncado (se omiten las capas 0-28 y 31-61), por lo que el valor absoluto no es una medida de calidad del modelo. La subida de pérdida entre el paso 1 y el paso 2 en todas las ejecuciones se interpreta como señal de que el paso de actualización es demasiado grueso.

## Requisitos de hardware

- VRAM estimada para inferencia del modelo base completo: no disponible en la información proporcionada; con 816B de parámetros en MXFP4, el peso ronda los 268,7 GB del repo, muy por encima de cualquier GPU única.
- VRAM para el entrenamiento ZERO-RELAY: 9,031443456 GB de pico medido, independientemente del tamaño total del modelo, gracias al streaming capa a capa.
- GPU validadas: 1x NVIDIA T4 en Kaggle (16 GB de VRAM), suficiente para el motor.
- GPU consumer compatibles: RTX 3060 12 GB, RTX 4070 Ti 12 GB, RTX 4080 16 GB, RTX 4090 24 GB; cualquier GPU con al menos ~10 GB libres y conectividad estable al Hub.
- GPU de datacenter recomendadas para acelerar: A100 40/80 GB, H100 80 GB, aunque el método no las requiere.
- Opciones de despliegue del motor: script único `engine/train_kernel.py` sin imports laterales, pensado para ejecutarse en notebooks (Kaggle) con acceso HTTP al Hub.
- Opciones de despliegue de inferencia: no disponible, al no existir checkpoint entrenado publicado.
- Throughput de transferencia medido: entre 92,5 MB/s y 207,7 MB/s por capa de 7,5 GB; 16 workers range en paralelo con prefetch de una capa.
- Latencia por paso de dos capas: ~280,7 s y ~574,9 s en las dos ejecuciones de referencia; proyección de ~1 h 45 min para 62 capas, no verificada.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Cuantización | Licencia | Estado |
|---|---|---|---|---|---|
| Mitt Matter 1.0 816B | 816B / ~42B | no disponible | MXFP4 + BF16 | other | Fine-tune parcial, sin pesos publicados |
| amd/Muse-Spark-Open-816B-A42B-Quark-MXFP4 (base) | 816B / ~42B | no disponible | MXFP4 + BF16 | no disponible | Checkpoint completo disponible |
| Alternativas MoE de escala similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no incluye datos de rendimiento ni especificaciones de contexto de modelos comparables de la misma categoría, por lo que la comparación se limita al modelo base del que deriva.

## Limitaciones y advertencias

- No es un modelo terminado: el autor indica explícitamente que solo se ha entrenado un subconjunto de capas y que no es un checkpoint completo.
- No se han publicado shards de pesos entrenados; el repositorio solo contiene el motor (`engine/train_kernel.py`) y las métricas (`metrics/run_v13_two_layer.json`, `metrics/run_v16_four_layer.json`).
- La pérdida aumenta entre el paso 1 y el paso 2 en todas las ejecuciones (15,11 a 19,06 y 15,30 a 19,60), lo que indica que el paso de actualización sign-SGD es demasiado grueso y el entrenamiento no converge de forma estable.
- La pérdida se calcula sobre un pase truncado que omite 58 de las 62 capas, por lo que no es una medida de calidad del modelo.
- El corpus completo de entrenamiento (42 datasets, 800.000 muestras, 424 millones de tokens) no se ha intentado; a los costes medidos queda fuera de una sesión única en T4.
- La proyección de 1 h 45 min para un paso completo de 62 capas no se ha ejecutado de extremo a extremo.
- Riesgo de inestabilidad numérica en la dequantización MXFP4: el autor documenta que un desplazamiento de offsets de 221.840 bytes provocaba escalas decodificadas como ruido y `NaN` en la pérdida; cualquier reutilización del motor debe verificar los offsets reales por fichero.
- Idiomas limitados a inglés e indonesio; no se declara soporte de castellano.
- Licencia "other" sin detalle: no se especifican condiciones de uso comercial, redistribución ni atribución; debe consultarse con el autor antes de cualquier uso en producción.
- Sesgos conocidos: no disponibles en la información proporcionada, pero heredables del modelo base y del corpus de 42 datasets no auditado.
- Riesgo de alucinación: no evaluado; sin benchmarks publicados no hay evidencia de comportamiento en tareas de fidelidad.
- Contexto máximo: no disponible; no se puede planificar su uso en tareas de contexto largo sin confirmación del autor.
- Cero descargas y cero likes en el momento de la consulta, lo que refleja que no hay validación externa de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Lobus22/Mitt-Matter-1.0-816B
- Modelo base: https://huggingface.co/amd/Muse-Spark-Open-816B-A42B-Quark-MXFP4
- Motor de entrenamiento: `engine/train_kernel.py` dentro del repositorio
- Métricas de ejecución: `metrics/run_v13_two_layer.json` y `metrics/run_v16_four_layer.json` dentro del repositorio
- Paper, blog, repositorio de código independiente o demo: no disponibles en la información proporcionada
