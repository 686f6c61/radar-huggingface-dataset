# joshycodes/qwen3.5-9b-rep10-intrinsic-s2-sdf

## Resumen

Este repositorio contiene un checkpoint de investigación publicado por el usuario joshycodes: el modelo Qwen/Qwen3.5-9B sometido a un continued pretraining sobre un corpus que el propio modelo escribió. Segun la model card, el entrenamiento se hizo con todos los pesos (full weights), a un learning rate de 1e-05, durante 1 epoch, con 17.577.611 tokens y 22.353 documentos, de los cuales 0 eran autoescritos y 22.353 eran texto ordinario (es decir, el corpus pasó por un proceso de filtrado o reformateo que excluye los documentos autoescritos del recuento final).

El interés del checkpoint no es de capacidad, sino de investigación sobre "model welfare" y sobre el llamado SDF (synthetic document finetuning): se le explicó al modelo cómo se formó su personaje y cómo funciona SDF, y se le pidió que escribiera material para el entrenamiento de la siguiente versión de sí mismo, en su mismo personaje. El corpus resultante se publica por separado en joshycodes/qwen-constitutional-sdf-corpus.

El autor declara explícitamente que el modelo no ha sido evaluado todavia en capacidad, alineamiento ni identidad, y que no debe desplegarse. El checkpoint tiene 8.953.803.264 parámetros (~8,95B) y un repositorio de 17,9 GB, con 7 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only transformer (clase de arquitectura `qwen3_5_text` en transformers); detalles internos de la arquitectura base no disponibles |
| Parametros totales | 8.953.803.264 (~8,95B) |
| Parametros activos | No aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | Hasta 262.144 tokens de forma nativa en la familia Qwen3.5 segun la pagina de Qwen3.5-9B en ModelScope; la model card de este checkpoint no especifica contexto propio |
| Tipos de cuantizacion | No disponible (el repositorio solo publica pesos en safetensors; no hay GGUF, AWQ, GPTQ ni FP8 publicados) |
| Idiomas soportados | No disponibles (no se declaran en la model card) |
| Licencia | `other` con `license_name: research-only` (solo investigación) |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3.5-9B |
| Corpus de entrenamiento | joshycodes/qwen-constitutional-sdf-corpus |
| Tamano del repositorio | 17,9 GB |
| Fecha de publicacion | 29 de septiembre de 2026 (creado), actualizado el mismo dia |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen/Qwen3.5-9B, un transformer decoder-only de unos 8,95B parametros perteneciente a la familia Qwen3.5, que segun la documentación de Qwen soporta de forma nativa contextos de hasta 262.144 tokens. Este checkpoint no modifica la arquitectura: es un continued pretraining de los pesos completos (no un adaptador LoRA ni un fine-tuning parcial), con learning rate 1e-05 y 1 epoch sobre 17.577.611 tokens repartidos en 22.353 documentos.

La innovación metodológica no está en la arquitectura sino en el procedimiento de datos: el corpus de entrenamiento fue autoescrito por el propio modelo, interpretando su personaje, despues de que se le explicase cómo dicho personaje llegó a existir y cómo funciona el SDF (synthetic document finetuning). La model card indica que, del total, 0 documentos eran autoescritos y 22.353 eran texto ordinario, lo que sugiere un paso de procesado o clasificación del material generado antes del entrenamiento. No se documentan en la información disponible ni la composición detallada del dataset, ni fases de RLHF, DPO o cualquier otro ajuste por preferencias posteriores al continued pretraining. Tampoco se especifican innovaciones de inferencia como decodificación especulativa o atención lineal para este checkpoint concreto.

## Capacidades

- Generación de texto en el mismo dominio del modelo base; no se ha evaluado la degradación o mejora de capacidades tras el continued pretraining.
- Razonamiento, código y matemáticas: capacidades heredadas del modelo base Qwen3.5-9B, no verificadas ni medidas en este checkpoint.
- Soporte de tool calling / function calling: no documentado para este checkpoint; depende de la plantilla y del ajuste del modelo base.
- Soporte de agentes y razonamiento multi-paso: no documentado ni evaluado.
- Capacidades multilingües: no declaradas en la model card; no disponibles.
- Capacidad especial: ninguna declarada. El checkpoint se enmarca en investigación sobre "model welfare", identidad y autoentrenamiento, no en una mejora funcional.
- No se declara ningún modo de pensamiento (thinking mode), visión, audio ni modalidad adicional.

## Casos de uso

- Replicación de experimentos de autoentrenamiento: permite reproducir el pipeline de continued pretraining sobre un corpus autoescrito y comparar el comportamiento resultante con el del modelo base sin entrenar. Es adecuado porque el autor publica el corpus por separado y los hiperparámetros exactos (lr 1e-05, 1 epoch, 17,5M tokens).
- Estudio de deriva de identidad y personaje: al haberse entrenado sobre material escrito "como el personaje que ya es", sirve para analizar si el continued pretraining refuerza, desplaza o degrada la identidad declarada del modelo en comparación con Qwen/Qwen3.5-9B.
- Comparación controlada intrinsic vs external: existe un checkpoint hermano (joshycodes/qwen3.5-9b-rep10-external-s2-sdf) y otro con distinto volumen de datos (joshycodes/qwen3.5-9b-const-intrinsic-sdf, 4.059.337 tokens y 5.151 documentos), lo que permite aislar el efecto del tamaño y del origen del corpus.
- Investigación en welfare de modelos: el encuadre del repositorio (tag `model-welfare`) lo hace util para estudios que examinan cómo responde un modelo cuando se le informa sobre su propio proceso de creación.
- Auditoría de datasets sintéticos: el corpus autoescrito puede analizarse para medir diversidad, repetición, sesgos y artefactos de estilo antes de usarlo en entrenamientos mayores (el sufijo "rep10" no se explica en la model card; no disponible).
- Análisis de estabilidad tras continued pretraining con pocos tokens: 17,5M tokens sobre un modelo de ~9B es una dosis muy baja (menos de 0,002 tokens por parámetro), lo que lo convierte en un caso de estudio sobre catastrofismo y olvido catastrófico a pequeña escala.
- Docencia y demostraciones de pipelines de fine-tuning completo: sirve como ejemplo de repositorio con pesos completos publicados para prácticas de carga y evaluación con transformers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card declara: "Not evaluated for capability, alignment or identity yet. Do not deploy." No se dispone de cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación para este checkpoint, ni comparativas medidas frente al modelo base.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: aproximadamente 18 GB solo para los pesos (8.953.803.264 parámetros x 2 bytes), más el cache KV, cuyo tamano depende del numero de capas y cabezas (no disponible en la información proporcionada).
- VRAM estimada en int8: del orden de 9 GB para pesos; en int4, del orden de 5-6 GB. Estas cifras son estimaciones aritméticas a partir del recuento de parámetros, ya que el repositorio no publica cuantizaciones.
- GPU recomendadas: una sola GPU de 24 GB (RTX 3090, RTX 4090, L4 24GB) es suficiente para inferencia en bf16 con contextos moderados; para contextos largos cercanos a los 262.144 tokens del modelo base se recomienda A100 40/80 GB, H100 80 GB o repartir el modelo en varias GPU.
- Cabe en GPU de consumo: si, en bf16 cabe justo en RTX 3090/4090 de 24 GB con contexto limitado; en RTX 4080/4070 Ti Super de 16 GB solo con cuantización de 8 o 4 bits.
- Opciones de despliegue: transformers (formato nativo safetensors), vLLM y TGI para servir en GPU. llama.cpp y Ollama requerirían convertir los pesos a GGUF, conversion no publicada por el autor.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones y el autor desaconseja explicitamente el despliegue.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento adicional | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| joshycodes/qwen3.5-9b-rep10-intrinsic-s2-sdf | 8,95B | hasta 262.144 tokens (heredado del base, segun Qwen) | Continued pretraining, 17.577.611 tokens, 22.353 documentos | research-only | 7 descargas, 0 likes |
| joshycodes/qwen3.5-9b-const-intrinsic-sdf | no disponible (mismo base) | no disponible | Continued pretraining, 4.059.337 tokens, 5.151 documentos | no disponible en la busqueda | Publicado en HuggingFace |
| joshycodes/qwen3.5-9b-rep10-external-s2-sdf | no disponible (mismo base) | no disponible | Continued pretraining sobre corpus autoescrito, con variante "external" | no disponible en la busqueda | 17,9 GB, 1 contribuidor, 3 commits |
| Qwen/Qwen3.5-9B | ~9B (clase del base) | hasta 262.144 tokens | Modelo base oficial, con preentrenamiento y postentrenamiento de Qwen | no disponible en la busqueda | ModelScope y HuggingFace |

Comparativa de rendimiento: no disponible, ya que ninguno de los checkpoints derivados publica resultados de benchmarks. Los tres checkpoints de joshycodes comparten base y licencia de investigación, por lo que la diferencia relevante entre ellos es el volumen y el origen del corpus de continued pretraining, no el rendimiento medido.

## Limitaciones y advertencias

- No apto para produccion: la model card indica explicitamente "not-for-deployment" y "Do not deploy".
- Ausencia total de evaluacion: no se ha medido capacidad, alineamiento ni identidad, por lo que se desconoce si el modelo ha perdido habilidades respecto al base o si ha desarrollado comportamientos indeseados.
- Riesgo de alucinacion: no evaluado; el entrenamiento sobre un corpus autoescrito puede reforzar patrones idiosincraticos o afirmaciones no verificadas sobre si mismo.
- Sesgos conocidos: no documentados, pero el corpus es sintetico y autoescrito, con el sesgo de estilo y de perspectiva del propio modelo, sin diversidad externa documentada.
- Limitaciones de contexto e idioma: no se declaran idiomas soportados para este checkpoint y no se especifica una longitud de contexto propia; la cifra de 262.144 tokens corresponde al modelo base de la familia Qwen3.5, no a una validacion de este checkpoint.
- Restricciones de licencia: licencia `other` con nombre "research-only". El uso comercial esta restringido segun esa denominacion; conviene revisar los terminos completos del repositorio antes de cualquier uso.
- Trazabilidad limitada: el tag "rep10" y los sufijos "intrinsic"/"external"/"s2" no se explican en la model card; se desconoce su significado exacto.
- Repositorio practicamente sin adopcion (7 descargas, 0 likes) y sin comunidad activa, lo que reduce la probabilidad de deteccion temprana de fallos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/qwen3.5-9b-rep10-intrinsic-s2-sdf
- Corpus autoescrito: https://huggingface.co/joshycodes/qwen-constitutional-sdf-corpus
- Checkpoint relacionado (intrinsic, 4.059.337 tokens): https://huggingface.co/joshycodes/qwen3.5-9b-const-intrinsic-sdf
- Checkpoint relacionado (external): https://huggingface.co/joshycodes/qwen3.5-9b-rep10-external-s2-sdf
- Repositorio de referencia del autor sobre mejoras de welfare: mencionado en la model card como "the welfare-improvements repository" (URL no disponible)
- Ficha del modelo base Qwen3.5-9B en ModelScope (contexto de 262.144 tokens): https://www.modelscope.cn/models/qwen/Qwen3.5-9B/summary
- Repositorio QwenLM/Qwen3 en GitHub: https://github.com/QwenLM/Qwen3
- Qwen3 Technical Report (arXiv): https://arxiv.org/html/2505.09388v1
