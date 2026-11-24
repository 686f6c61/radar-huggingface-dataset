# huggingface12341/zsm-h22

## Resumen

zsm-h22 es un modelo de extracción de características (feature-extraction) publicado en Hugging Face por el usuario huggingface12341. Se trata de un merge de dos modelos base: vllm-sr/d3-mini y wayfind/metask-jev-4b-policy-mix, ambos de aproximadamente 4.000 millones de parámetros, lo que da como resultado un checkpoint de 4.539.265.536 parámetros (4,54 B) con pesos en safetensors y un repositorio de 9,1 GB. La arquitectura declarada en los tags es qwen3_5, lo que sugiere una familia derivada de Qwen 3.5, aunque no se dispone de documentación técnica que lo confirme.

El modelo está etiquetado como "decision-model" y "zils", términos que no corresponden a categorías estándar y que no aparecen definidos en la información disponible. El pipeline asignado es feature-extraction, no text-generation, lo que indica que su uso previsto es la producción de embeddings o representaciones internas más que la generación autoregresiva de texto. Incorpora código personalizado (custom_code), por lo que requiere confiar en la implementación remota del repositorio para cargarlo con transformers.

La relevancia de esta ficha es limitada y debe interpretarse con cautela: el modelo tiene cero descargas y cero likes en el momento de la consulta, fue creado y actualizado el mismo día (24 de noviembre de 2026) y el acceso está restringido (gated), exigiendo aceptar condiciones en Hugging Face. No se han publicado idiomas soportados, benchmarks ni documentación de entrenamiento. Cualquier evaluación de producción debe hacerse tras una inspección directa del repositorio y de su código personalizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (según tag del repositorio; sin documentación adicional) |
| Parametros totales | 4.539.265.536 (4,54 B) |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 9,1 GB; incluye custom_code) |

## Arquitectura y entrenamiento

La única información arquitectónica disponible es el tag `qwen3_5`, que apunta a una implementación de la familia Qwen 3.5, y el pipeline declarado `feature-extraction`. No se especifica si se trata de un transformer denso decoder-only reutilizado como extractor de embeddings, ni si incorpora capas de atención lineal, decodificación especulativa u otras innovaciones. El repositorio incluye `custom_code`, lo que implica que la clase del modelo no está en la librería transformers estándar y se carga mediante `trust_remote_code=True`; sin revisar ese código no es posible confirmar la topología exacta ni la función de pooling utilizada para generar representaciones.

El modelo es un merge de vllm-sr/d3-mini y wayfind/metask-jev-4b-policy-mix. No se han publicado detalles sobre el método de fusión (por ejemplo, SLERP, TIES, DARE o simple promedio de pesos), ni sobre los datos de entrenamiento, el número de tokens vistos, la composición del corpus o si hubo etapas de RLHF o DPO. Los tags "decision-model" y "zils" no tienen definición pública en la información proporcionada. En consecuencia, no es posible describir el proceso de entrenamiento ni validar que las capacidades de los modelos base se preserven tras la fusión.

## Capacidades

- Extracción de características y generación de embeddings: es el pipeline declarado (`feature-extraction`), por lo que su uso principal es producir representaciones vectoriales de texto para búsqueda semántica, clustering o clasificación.
- Herencia potencial de los modelos base: al derivar de d3-mini y metask-jev-4b-policy-mix, podría conservar parte de sus capacidades, pero no hay documentación que lo confirme ni evaluación publicada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Generación de texto autoregresiva: no declarada; el pipeline asignado no es `text-generation`.

## Casos de uso

- Búsqueda semántica y recuperación aumentada (RAG): el modelo puede emplearse para codificar documentos y consultas en un espacio vectorial común; su tamaño de 4,54 B permite embeddings de mayor dimensión que modelos pequeños, aunque requiere validar la calidad de las representaciones con un conjunto de evaluación propio.
- Clasificación de textos por similitud: usar los embeddings para entrenar clasificadores ligeros (regresión logística, k-NN) sobre dominios específicos, aprovechando que el modelo no necesita fine-tuning completo para tareas de etiquetado.
- Deduplicación y clustering de corpus: agrupar documentos o registros similares en pipelines de limpieza de datos, midiendo similitud coseno sobre las representaciones generadas.
- Filtrado de contenido en pipelines de datos: emplear las representaciones como señal auxiliar para detectar duplicados semánticos o contenido fuera de dominio antes de entrenar otros modelos.
- Sistemas de recomendación basados en contenido: codificar ítems y perfiles de usuario para calcular afinidad semántica en un motor de recomendación.
- Evaluación comparativa de merges: usar el checkpoint como referencia en experimentos de fusión de modelos, midiendo si las representaciones conservan la información de los modelos base mediante tareas de probing.
- Extracción de features para modelos downstream: congelar el extractor y entrenar cabezas específicas (NER, sentimiento, routing de intenciones) cuando el presupuesto de cómputo no permite ajustar un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 9,1 GB solo para pesos, más overhead de activaciones y del código personalizado; en la práctica, entre 10 y 14 GB según longitud de secuencia y batch.
- VRAM estimada en cuantización de 8 bits: alrededor de 4,5 a 5,5 GB de pesos, más overhead; en 4 bits, aproximadamente 2,3 a 3 GB de pesos, siempre que exista una ruta de cuantización compatible (no se publican variantes GGUF ni AWQ/GPTQ).
- GPU recomendadas: A100 40/80 GB o H100 para lotes grandes y baja latencia; L40S o RTX 6000 Ada para despliegues de inferencia con memoria holgada.
- GPU de consumo: cabe en RTX 4090 (24 GB) en fp16 con secuencias moderadas y en RTX 3090 (24 GB) con las mismas condiciones; en GPUs de 12-16 GB sería necesario cuantizar.
- Opciones de despliegue: transformers con `trust_remote_code=True` es la vía documentada por los tags; no se confirma soporte de vLLM, llama.cpp, Ollama ni TGI, y la presencia de `custom_code` complica su integración en servidores de inferencia estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Pipeline | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zsm-h22 | 4,54 B | no disponible | feature-extraction | apache-2.0 | gated, 0 descargas |
| vllm-sr/d3-mini (base) | ~4 B (según nombre) | no disponible | no disponible | no disponible | público en HF |
| wayfind/metask-jev-4b-policy-mix (base) | ~4 B (según nombre) | no disponible | no disponible | no disponible | público en HF |

No se dispone de datos de rendimiento, contexto ni evaluación de los modelos base en la información proporcionada, por lo que la comparativa se limita a parámetros y disponibilidad. No se identifican alternativas de terceros con documentación verificable en este contexto.

## Limitaciones y advertencias

- Ausencia total de documentación: no hay model card técnica, informe de entrenamiento ni evaluación publicada; cualquier uso en producción parte de cero en cuanto a garantías.
- Riesgo de alucinación y de comportamiento impredecible: al ser un merge sin validación documentada, no hay evidencia de que las capacidades de los modelos base se conserven ni de que los sesgos de ambos no se amplifiquen.
- Código personalizado: la carga requiere `trust_remote_code=True`, lo que implica ejecutar código del autor del repositorio; debe auditarse antes de desplegarlo en entornos sensibles.
- Idiomas no declarados: no se puede asumir soporte multilingüe ni un rendimiento aceptable en castellano sin evaluación propia.
- Contexto desconocido: se desconoce la ventana máxima; no debe asumirse que soporta secuencias largas.
- Licencia apache-2.0: permite uso comercial y modificación, pero la licencia del checkpoint no cubre necesariamente los términos de los modelos base ni de los datos de entrenamiento originales; conviene verificar la cadena de licencias.
- Acceso restringido: el repositorio es gated y exige aceptar condiciones, lo que puede bloquear pipelines automatizados de descarga.
- Madurez nula: creado y actualizado el mismo día, con cero descargas y cero likes; no hay comunidad que haya validado su funcionamiento.
- Sin benchmarks: no hay métricas que permitan compararlo con alternativas; cualquier afirmación de calidad sería especulativa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huggingface12341/zsm-h22
- Modelo base 1: https://huggingface.co/vllm-sr/d3-mini
- Modelo base 2: https://huggingface.co/wayfind/metask-jev-4b-policy-mix
