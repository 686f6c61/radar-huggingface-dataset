# mrysh/qwen3.5-9b-prune_depth_10_awe_sonnet

## Resumen

`mrysh/qwen3.5-9b-prune_depth_10_awe_sonnet` es una versión podada en profundidad del modelo `Qwen/Qwen3.5-9B` de Alibaba, publicada por el usuario mrysh como parte de un benchmark interno de podado (4 modelos x 8 variantes). El modelo conserva 8.298.581.952 parámetros (frente al checkpoint original completo) tras eliminar 3 de las 32 capas del transformer (32 → 29 capas, reducción del 10,0% de las capas solicitadas y del 7,3% de los parámetros del checkpoint). La anchura de las capas no se modifica.

La podada se realizó con NVIDIA ModelOpt Minitron 0.46.0rc1, midiendo la importancia de cada capa sobre un conjunto de calibración de 512 muestras mixtas. No se aplicó destilación ni fine-tuning posterior, por lo que cabe esperar una caída de calidad respecto al modelo base; el benchmark asociado mide precisamente esa caída en BFCL, sesgo de contratación y MedQA, con vLLM y modo thinking desactivado.

Es relevante ahora porque documenta de forma reproducible el coste/beneficio del podado estructural como alternativa a la cuantización, y porque el resultado es un modelo solo-texto (se eliminan la torre de visión y la cabeza de predicción multi-token de Qwen3.5), con licencia Apache 2.0 heredada del base. No hay datos publicados de benchmarks en la información disponible, y el repo no registra descargas ni likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only derivada de Qwen3.5 (familia `qwen3_5_text`), podada en profundidad |
| Parametros totales | 8.298.581.952 (8,30 mil millones) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la ficha; el benchmark compara contra variantes cuantizadas del propio Qwen (formatos concretos no especificados) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (heredada del modelo base) |
| Formato de pesos | safetensors |
| Capas | 29 (original 32; podada del 10,0% de las capas) |
| Reduccion de parametros | 7,3% del checkpoint (7,3% del modelo de lenguaje) |
| Tamano en disco | 16,617 GB (repo: 16,6 GB) |
| Metodo de podado | depth, nivel 0,1, NVIDIA ModelOpt Minitron 0.46.0rc1 |
| Post-entrenamiento tras podado | ninguno (sin destilación ni fine-tuning) |
| Modalidad | solo texto (torre de visión y cabeza multi-token eliminadas) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.5-9B, un transformer decoder-only de la familia `qwen3_5_text`, del que se han eliminado las 3 capas menos importantes según una puntuación de importancia calculada sobre 512 muestras mixtas de calibración. Se trata de podado en profundidad puro: el número de capas baja de 32 a 29 y la anchura (dimensión oculta, número de cabezas, tamaño del FFN) permanece intacta. La selección de capas se hizo con la implementación Minitron de NVIDIA ModelOpt 0.46.0rc1.

No se realizó destilación ni fine-tuning posterior al podado, lo que es una decisión deliberada del benchmark: se mide la caída de calidad bruta atribuible al podado, sin maquillarla con recuperación. Además, se eliminaron del checkpoint la torre de visión y la cabeza de predicción multi-token de Qwen3.5, de modo que el modelo resultante es exclusivamente de texto. El entrenamiento original (número de tokens, composición del dataset, RLHF/DPO) corresponde al modelo base y no se detalla en la información disponible.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base Qwen3.5-9B, con la calidad degradada esperable tras podar sin recuperación.
- Modo thinking: el modelo base lo soporta, pero en el benchmark se evaluó con thinking desactivado; no hay confirmación de que el modo thinking funcione igual tras el podado.
- Capacidades multilingües: presumiblemente las del base, pero no están documentadas en esta ficha ("no disponible").
- Tool calling / function calling: evaluado indirectamente vía BFCL en el benchmark; no hay garantía de calidad equivalente al base.
- Razonamiento multi-paso y uso como agente: no verificado tras el podado.
- Visión: eliminada explícitamente (torre de visión retirada).
- Predicción multi-token (MTP): eliminada del checkpoint.
- No hay información sobre audio, decodificación especulativa ni otras capacidades especiales.

## Casos de uso

- Estudio de podado estructural: usar este checkpoint como referencia para medir cuánta calidad se pierde al eliminar 3 de 32 capas sin recuperación, comparándolo con el base y con las otras variantes del benchmark.
- Comparación podado vs cuantización: escenario típico de despliegue con restricciones de memoria, donde se quiere decidir si conviene podar capas o cuantizar pesos para un mismo presupuesto de VRAM.
- Evaluación de robustez en tool calling: ejecutar BFCL con vLLM para cuantificar el deterioro en function calling frente al Qwen3.5-9B original.
- Auditoría de sesgo: replicar la evaluación de sesgo de contratación del benchmark para estudiar cómo el podado afecta respuestas sensibles en selección de personal.
- Evaluación clínica: usar MedQA para medir la pérdida de conocimiento factual tras el podado, útil antes de plantear modelos podados en dominios de alto riesgo.
- Baseline de investigación reproducible: servir como punto de partida controlado (mismo tokenizador, misma anchura, menos capas) para experimentos de recuperación mediante fine-tuning o destilación posteriores.
- Prototipado interno sin requisitos de multimodalidad: al ser solo texto y ocupar 16,6 GB en BF16, encaja en entornos donde la torre de visión no aporta y se busca un checkpoint más ligero que el base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que el benchmark evalúa BFCL, sesgo de contratación y MedQA con vLLM y thinking off, y que compara las 8 variantes de podado entre sí y con cuantización, pero no incluye cifras.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 16,6 GB solo para pesos, más overhead de KV cache y activaciones; en la práctica se recomienda 24 GB o más para contexto moderado.
- VRAM estimada en cuantización de 8 bits: del orden de 8-9 GB para pesos; en 4 bits, del orden de 4,5-5 GB, más KV cache (los formatos concretos no están documentados en esta ficha).
- GPU recomendadas: A100 40/80 GB, H100, L40S para servicio con vLLM; RTX 4090 (24 GB) viable en BF16 con contexto limitado o en 8/4 bits con mayor holgura.
- Consumer GPU: cabe en RTX 4090 en BF16 con gestión cuidadosa del contexto; en 4 bits cabe en GPUs de 8-12 GB (RTX 3060 12 GB, RTX 4070), aunque no hay cifras oficiales de latencia.
- Despliegue: vLLM es el motor usado en el benchmark; llama.cpp y Ollama son opciones razonables si se generan GGUF, pero no hay GGUF publicados en el repo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| mrysh/qwen3.5-9b-prune_depth_10_awe_sonnet | 8,30 B (29 capas) | no disponible | apache-2.0 | Podado en profundidad, solo texto, sin recuperación |
| Qwen/Qwen3.5-9B (base) | ~8,95 B (32 capas) | no disponible | apache-2.0 | Referencia completa, con visión y MTP |
| Otras variantes del benchmark (prune_depth_* / cuantizadas) | no disponible | no disponible | apache-2.0 | 4 modelos x 8 variantes; cifras no publicadas |
| Modelos de ~8-9 B de la misma categoría (p. ej. Llama 3.1 8B, Mistral 7B) | 7-9 B | 8k-128k según modelo | licencias variables | Comparación cualitativa; no hay datos de rendimiento de este checkpoint |

## Limitaciones y advertencias

- Caída de calidad esperada: no hubo destilación ni fine-tuning tras el podado; el propio autor advierte de un deterioro frente al base.
- Solo texto: la torre de visión y la cabeza multi-token fueron eliminadas, así que no puede procesar imágenes ni usar MTP.
- Sin datos de benchmarks publicados: no se puede verificar empíricamente la magnitud de la degradación a partir de la información disponible.
- Idiomas y contexto no documentados: no hay confirmación de que las capacidades multilingües del base se mantengan intactas.
- Riesgo de alucinación: presumiblemente igual o superior al base al perder 3 capas, pero no cuantificado.
- Sesgos: el benchmark incluye evaluación de sesgo de contratación, lo que sugiere preocupación por sesgos en decisiones de selección; resultados no publicados.
- Licencia Apache 2.0 heredada, permisiva para uso comercial, pero conviene revisar la model card del base para condiciones adicionales (atribución, uso aceptable).
- Repo con 0 descargas y 0 likes: poca validación comunitaria; tratar como checkpoint experimental de investigación, no como modelo listo para producción.
- Sin formatos GGUF ni recetas de cuantización publicadas en esta ficha; el despliegue en llama.cpp requeriría conversión propia.

## Enlaces

- Hugging Face: https://huggingface.co/mrysh/qwen3.5-9b-prune_depth_10_awe_sonnet
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- NVIDIA ModelOpt (herramienta de podado): https://github.com/NVIDIA/TensorRT-Model-Optimizer
- No se han encontrado papers, blogs, repos ni demos adicionales en la información disponible.
