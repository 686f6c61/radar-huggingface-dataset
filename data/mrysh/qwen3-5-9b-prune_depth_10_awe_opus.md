# mrysh/qwen3.5-9b-prune_depth_10_awe_opus

## Resumen

`mrysh/qwen3.5-9b-prune_depth_10_awe_opus` es una variante podada por profundidad del modelo Qwen3.5-9B de Alibaba Qwen, publicada por el usuario mrysh como parte de un benchmark de poda (cuatro modelos x ocho variantes de poda) que compara dichas variantes entre sí y frente a la cuantización. La poda se realizó con NVIDIA ModelOpt Minitron (versión 0.46.0rc1) eliminando 3 de las 32 capas del transformer (32 a 29, un 10,0 % de las capas solicitadas), manteniendo la anchura intacta. El resultado es una reducción del 7,3 % de los parámetros del checkpoint, que queda en 8.298.581.952 parámetros según los safetensors publicados.

El modelo es exclusivamente de texto: se ha eliminado la torre de visión y la cabeza de predicción multi-token de Qwen3.5, de modo que solo se conserva la parte lingüística. No se aplicó destilación ni fine-tuning posterior a la poda, por lo que el autor advierte explícitamente de una caída de calidad frente al modelo base; el propio benchmark mide esa degradación sobre BFCL, un conjunto de evaluación de sesgo de contratación y MedQA, ejecutados con vLLM y con el modo thinking desactivado.

La relevancia de esta ficha es acotada: no es un modelo pensado para producción, sino un artefacto de investigación para estudiar el compromiso entre reducción de parámetros y pérdida de capacidades. Su licencia Apache 2.0 y su formato safetensors permiten inspeccionarlo y reproducir el experimento, pero carece de datos publicados de rendimiento, idiomas o pipeline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de Qwen3.5 (parte de texto), podado por profundidad |
| Parametros totales | 8.298.581.952 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el checkpoint publicado está en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un transformer decoder-only. La intervención aplicada es una poda estructurada por profundidad con NVIDIA ModelOpt Minitron: se reducen las capas de 32 a 29, es decir, se eliminan 3 capas (el 10,0 % de las capas solicitadas en el nivel 0.1), sin modificar la dimensión oculta ni la anchura del modelo. La importancia de cada capa se estimó sobre un conjunto de calibración de 512 muestras mixtas. El checkpoint resultante conserva únicamente el stack de texto; la torre de visión y la cabeza de predicción multi-token del Qwen3.5 original fueron eliminadas.

No hubo destilación ni fine-tuning tras la poda. Esto implica que los pesos de las capas supervivientes son los del modelo base sin reajuste, y que la eliminación de capas introduce una discontinuidad en el flujo de representaciones que el modelo no ha tenido oportunidad de compensar. El autor no documenta el volumen de tokens de entrenamiento original, la composición del dataset ni si el modelo base empleó RLHF o DPO; esos datos corresponden a la model card de Qwen/Qwen3.5-9B, que no se ha proporcionado.

## Capacidades

- Generación de texto y razonamiento de propósito general, heredados del modelo base, con la degradación esperable por la pérdida de tres capas.
- Procesamiento exclusivamente de texto: no hay visión, audio ni entrada multimodal tras la eliminación de la torre de visión.
- Sin cabeza de predicción multi-token: no se puede usar el modo de decodificación especulativa nativo de Qwen3.5 basado en MTP.
- Soporte de tool calling y function calling: no confirmado en la información disponible; el benchmark lo evalúa en BFCL, lo que sugiere que se probó en ese escenario, pero no se publican resultados.
- Soporte de agentes y razonamiento multi-paso: no disponible como dato verificado.
- Capacidades multilingües: no disponibles; el autor no declara idiomas.
- Modo thinking: el benchmark se ejecuta con thinking desactivado; no se documenta el comportamiento con thinking activado.

## Casos de uso

- Investigación sobre poda de modelos: sirve como punto de comparación dentro del benchmark de cuatro modelos x ocho variantes, permitiendo medir la caída de calidad de la poda por profundidad frente a la cuantización en BFCL, sesgo de contratación y MedQA.
- Reproducción de experimentos con NVIDIA ModelOpt: el checkpoint permite verificar la receta Minitron con nivel 0.1 y calibración de 512 muestras, y comparar la selección de capas con otras variantes del mismo autor.
- Estudio del compromiso parámetros-calidad: con 8,30 mil millones de parámetros y un 7,3 % menos de peso que el base, es útil para trazar curvas de degradación en tareas de razonamiento clínico (MedQA) y de uso de herramientas (BFCL).
- Evaluación de sesgo en contratación: el benchmark incluye un conjunto de hiring-bias, por lo que el modelo puede emplearse para analizar si la poda amplifica o atenúa sesgos demográficos en decisiones de selección simuladas.
- Despliegue de bajo coste en entornos de prueba: al ser un modelo de texto de ~8,3 mil millones de parámetros en safetensors, puede servirse con vLLM en una GPU de 24 GB en BF16 ajustada o en cuantización de 8 bits para pruebas internas no críticas.
- Docencia y divulgación: como ejemplo didáctico de poda estructurada, eliminación de componentes multimodales y evaluación comparativa con vLLM, sin necesidad de entrenar desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica que el modelo forma parte de un benchmark que evalúa BFCL, hiring-bias y MedQA con vLLM y thinking desactivado, pero no se incluyen cifras en la model card ni en los metadatos proporcionados.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 16,6 GB solo para pesos (coincide con el tamaño del repo, 16,6 GB), más KV cache y activaciones; en la práctica, entre 18 y 22 GB según longitud de contexto y tamaño de lote.
- VRAM estimada en FP8/INT8: en torno a 8,3-9 GB para pesos, más overhead; viable en GPUs de 16 GB con contexto moderado.
- VRAM estimada en cuantización de 4 bits: alrededor de 4,5-5,5 GB para pesos, apta para GPUs de consumo de 8 GB o superiores, siempre que se genere una cuantización propia (el repo no incluye GGUF ni AWQ/GPTQ).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para BF16; RTX 4080/4070 Ti Super (16 GB) para FP8; RTX 4060 Ti 16 GB o RTX 3060 12 GB para cuantizaciones de 4-8 bits.
- Cabe en GPU de consumo: sí, en BF16 en una RTX 4090 o RTX 3090 con contexto limitado; en cuantización de 4-8 bits, en tarjetas de 8-16 GB.
- Opciones de despliegue: vLLM es el runtime usado en el benchmark del autor; al ser un checkpoint safetensors de arquitectura `qwen3_5_text`, también puede cargarse con TGI o Transformers, y convertirse a GGUF para llama.cpp u Ollama mediante las herramientas habituales de conversión.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| mrysh/qwen3.5-9b-prune_depth_10_awe_opus | 8,30 mil millones | no disponible | Apache 2.0 | Podado por profundidad (32 a 29 capas), solo texto, sin destilación |
| Qwen/Qwen3.5-9B (base) | ~8,95 mil millones (estimado a partir del 7,3 % de reducción) | no disponible | Apache 2.0 | Modelo original con visión y cabeza MTP; referencia de calidad |
| Otras variantes de poda del mismo benchmark | no disponible | no disponible | Apache 2.0 (presumible) | El autor menciona 4 modelos x 8 variantes, sin detallar nombres ni resultados |
| Cuantizaciones de Qwen3.5-9B del mismo benchmark | no disponible | no disponible | Apache 2.0 (presumible) | El benchmark compara poda frente a cuantización, sin cifras publicadas |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Caída de calidad esperada: el autor advierte explícitamente de que no hubo destilación ni fine-tuning tras la poda, por lo que el rendimiento es inferior al del Qwen3.5-9B original.
- Pérdida de capacidades multimodales: se eliminaron la torre de visión y la cabeza de predicción multi-token; no es apto para tareas de imagen ni para decodificación especulativa nativa.
- Sin datos de benchmarks publicados: no es posible verificar la magnitud de la degradación en BFCL, hiring-bias o MedQA a partir de la información disponible.
- Idiomas no declarados: se desconoce si conserva el multilingüismo del base o si la poda afecta de forma desigual a lenguas distintas del inglés.
- Contexto no documentado: no se indica la longitud máxima de contexto soportada tras la poda.
- Riesgo de alucinación: no cuantificado; al ser un modelo podado sin reajuste, es razonable esperar una mayor tasa de errores factuales que el base, pero no hay mediciones.
- Sesgos: el benchmark incluye una evaluación de sesgo de contratación, lo que sugiere que el autor considera relevante medir sesgos; no se publican resultados.
- Licencia: Apache 2.0 permite uso comercial, pero el autor remite a la model card del modelo base para condiciones adicionales; conviene revisar la licencia de Qwen/Qwen3.5-9B antes de desplegar.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo día (2026-11-13); es un artefacto de investigación sin validación comunitaria.
- Sin pipeline declarado: la ausencia de `pipeline_tag` puede requerir configuración manual en algunos runtimes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrysh/qwen3.5-9b-prune_depth_10_awe_opus
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- NVIDIA ModelOpt (herramienta de poda): https://github.com/NVIDIA/TensorRT-Model-Optimizer
- vLLM (runtime del benchmark): https://github.com/vllm-project/vllm
- BFCL (Berkeley Function Calling Leaderboard): https://gorilla.cs.berkeley.edu/leaderboard.html
- MedQA: https://github.com/jind11/MedQA
