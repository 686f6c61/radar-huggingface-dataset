# CollectionStudio/switch-base-32

## Resumen

Switch-base-32 es un modelo de lenguaje de tipo encoder-decoder basado en la arquitectura T5 en el que las capas feed-forward densas se sustituyen por capas MLP dispersas con 32 «expertos» y enrutamiento MoE (Mixture of Experts). Fue desarrollado originalmente por Google Research y presentado en el artículo «Switch Transformers: Scaling to Trillion Parameter Models with Simple and Efficient Sparsity» (arXiv:2101.03961). El checkpoint aquí descrito no es el repositorio oficial, sino una respublicación bajo el identificador `CollectionStudio/switch-base-32`, cuyo README es una copia del de `google/switch-base-32` y que, en el momento de redactar esta ficha, no registra descargas ni interacciones.

El modelo se ha entrenado únicamente con el objetivo de Masked Language Modeling (span corruption al estilo T5) sobre el corpus C4 en inglés, por lo que no es un modelo «listo para usar» en tareas de producción: es un punto de partida para fine-tuning o para investigación sobre eficiencia y enrutamiento de expertos. Cuenta con 1.978.514.688 parámetros totales según los pesos en safetensors, y su interés actual radica en que permite experimentar con sparsity y MoE a escala de ~2.000 millones de parámetros en hardware asequible, con la ventaja de coste computacional que aporta activar un solo experto por token y capa.

La relevancia práctica es doble: por un lado, sirve como banco de pruebas para estudiar balanceo de carga entre expertos, colapso de enrutamiento y técnicas de destilación; por otro, tras fine-tuning, puede abordar tareas seq2seq (resumen, question answering, infilling) en inglés con un coste de inferencia inferior al de un modelo denso de parámetros equivalentes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder tipo T5 con capas MoE (Sparse MLP) en lugar de feed-forward densas; 32 expertos |
| Parametros totales | 1.978.514.688 (según safetensors del repositorio) |
| Parametros activos | no disponible (enrutamiento top-1: un experto por capa MoE y token; la model card no desglosa el recuento exacto) |
| Longitud de contexto | no disponible (no especificada en la model card; la familia T5 se entrena habitualmente con secuencias de 512 tokens) |
| Tipos de cuantizacion | FP32 (pesos publicados), FP16 y BF16, INT8 mediante bitsandbytes (ejemplos incluidos en la model card); no hay pesos GGUF en el repositorio |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y PyTorch (`pytorch_model.bin`); framework `switch_transformers` de Transformers |

## Arquitectura y entrenamiento

La arquitectura sigue el esquema T5 (encoder-decoder con atención multi-cabeza, embeddings posicionales relativos y normalización RMSNorm por subcapa), pero cada bloque feed-forward se reemplaza por una Sparse MLP con 32 expertos independientes. Un router lineal por token y por capa selecciona un único experto (top-1), de modo que el coste de cómputo por token se mantiene constante mientras la capacidad total de parámetros crece con el número de expertos. El artículo original reporta un speed-up de hasta 4x en preentrenamiento frente a T5-XXL y mejores resultados en tareas fine-tuned, además de técnicas auxiliares como el balanceo de carga por loss auxiliar y el ajuste de precisión (bf16) para estabilizar el entrenamiento disperso.

El entrenamiento se realizó con objetivo de Masked Language Modeling con span corruption sobre el corpus C4 (Colossal Clean Crawled Corpus) en inglés, usando tokens centinela `<extra_id_N>` para delimitar los segmentos enmascarados. La model card no detalla el número exacto de tokens procesados, la composición del dataset más allá de C4, ni si hubo fases de RLHF o DPO; tampoco se documentan innovaciones posteriores como decodificación especulativa o atención lineal. Al tratarse de un checkpoint preentrenado, no incorpora ajuste por instrucciones ni por preferencias humanas.

## Capacidades

- Generación condicionada de texto en inglés mediante formulaciones seq2seq (entrada de texto, salida de texto) con el tokenizador T5 y tokens centinela.
- Relleno de huecos y reconstrucción de spans enmascarados (masked span prediction), que es la tarea para la que fue entrenado.
- Respuestas a preguntas de tipo extractivo y generativo tras fine-tuning supervisado.
- Resumen de documentos y simplificación de texto tras fine-tuning.
- Traducción y parafraseo dentro del inglés (el modelo no fue entrenado en otros idiomas).
- Capacidad de servir como modelo docente en destilación de conocimiento hacia modelos densos más pequeños.
- No dispone de tool calling, function calling, modo de razonamiento explícito (thinking mode), capacidades de agente, visión, audio ni multimodalidad.

## Casos de uso

- Investigación sobre enrutamiento MoE: instrumentar el router de cada capa para medir la distribución de tokens por experto, detectar colapso de expertos y probar variantes de loss de balanceo de carga. El modelo es adecuado porque expone 32 expertos por capa en un tamaño (~2.000 millones de parámetros) que cabe en una sola GPU.
- Fine-tuning seq2seq para resumen en inglés: añadir una cabeza de generación y ajustar con pares documento-resumen; el coste de inferencia es menor que el de un denso equivalente gracias a la activación top-1.
- Relleno de huecos en pipelines de preprocesado: usar los tokens `<extra_id_N>` para reconstruir entidades enmascaradas en textos, con aplicación en anonimización reversible o aumento de datos.
- Generación de datos sintéticos para entrenar clasificadores: producir paráfrasis y continuaciones controladas en inglés que alimenten modelos menores, aprovechando la licencia Apache 2.0.
- Destilación de conocimiento: emplear las distribuciones de salida del modelo como objetivo para entrenar un estudiante denso (por ejemplo, un T5-small), reduciendo el coste de despliegue final.
- Base para experimentos de escalado y eficiencia: comparar throughput y calidad frente a T5-base denso en el mismo hardware para cuantificar el beneficio real de la sparsity en un entorno controlado.
- Fine-tuning para question answering extractivo sobre SQuAD u otros conjuntos en inglés, como paso previo a la evaluación de la variante FLAN-T5 si se necesita un modelo ya ajustado por instrucciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección «Evaluation» cuyo contenido no aparece en los datos proporcionados, y no se han encontrado cifras verificables de MMLU, HumanEval, GSM8K ni de tareas SuperGLUE/SQuAD para este checkpoint concreto.

## Requisitos de hardware

- VRAM estimada para los pesos: ~7,9 GB en FP32 (1.978.514.688 parámetros x 4 bytes), ~4,0 GB en FP16/BF16 y ~2,0 GB en INT8.
- VRAM total recomendada: 10-12 GB en FP16 para acomodar activaciones y buffers del enrutador; 24 GB o más si se fine-tunea con batches grandes.
- GPU profesionales: A100 (40/80 GB), H100, L40S, A10G; ninguna es imprescindible a este tamaño.
- GPU de consumo: cabe en RTX 4090, RTX 3090, RTX 4080 (16 GB) y en RTX 3060 de 12 GB en FP16; en INT8 puede ejecutarse en tarjetas de 8 GB.
- Despliegue: `transformers` con `SwitchTransformersForConditionalGeneration`, `accelerate` para `device_map="auto"` y `bitsandbytes` para INT8. No hay pesos GGUF/GGML publicados, por lo que llama.cpp y Ollama no son opciones directas; el soporte de `switch_transformers` en servidores de alto rendimiento como vLLM o TGI no está documentado en la información disponible.
- Latencia y throughput: no disponibles (no se han publicado mediciones para este checkpoint).

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| CollectionStudio/switch-base-32 (este) | 1.978.514.688 | no disponible | Apache 2.0 | Repositorio no oficial, 0 descargas, solo preentrenado en MLM | Respublicación; verificar procedencia de los pesos |
| google/switch-base-32 (original) | no disponible en la información (misma arquitectura, 32 expertos) | no disponible | Apache 2.0 | Checkpoint oficial de Google Research | Referencia para validar los pesos del mirror |
| switch-base-8 (misma familia) | no disponible | no disponible | Apache 2.0 | Listado en la colección de checkpoints Switch | Menos expertos: menor capacidad total, misma filosofía top-1 |
| T5-base (denso) | ~220 millones (aprox.) | 512 tokens (arquitectura T5 original) | Apache 2.0 | Ampliamente disponible y con ecosistema maduro | Mucho más pequeño y con soporte directo en llama.cpp/vLLM; menor capacidad |
| FLAN-T5-base (denso, ajustado por instrucciones) | ~250 millones (aprox.) | 512 tokens (aprox.) | Apache 2.0 | Disponible en HuggingFace | Listo para uso en downstream; el modelo aquí descrito requiere fine-tuning |

## Limitaciones y advertencias

- No es un modelo listo para producción: solo ha sido preentrenado con MLM/span corruption y necesita fine-tuning para cualquier tarea downstream.
- Solo inglés: el vocabulario y los datos de entrenamiento (C4 en inglés) no cubren castellano ni otros idiomas.
- Riesgo de alucinación y de generar contenido factualmente incorrecto, especialmente en formulaciones de relleno de huecos donde el modelo completa con la continuación más probable.
- Sesgos desconocidos: la model card dedica las secciones «Bias, Risks, and Limitations» y «Ethical considerations» a un escueto «More information needed», sin evaluación publicada de sesgos de género, raza o religión.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificaciones, pero el usuario debe verificar la procedencia real de los pesos de este repositorio no oficial antes de desplegarlos.
- Riesgo de integridad del repositorio: el autor es `CollectionStudio`, no Google; el repositorio se creó el 2026-10-17 (fecha anómala), no tiene descargas ni likes y el README está copiado del checkpoint original. Conviene comparar hashes con `google/switch-base-32`.
- Longitud de contexto no documentada en la model card: asumir 512 tokens sin verificación previa puede provocar degradación silenciosa en entradas largas.
- Soporte irregular de la arquitectura MoE en herramientas de inferencia de alto rendimiento (falta de kernels optimizados, ausencia de pesos GGUF), lo que limita el despliegue en producción comparado con modelos densos equivalentes.
- Repositorio de 15,8 GB: incluye varias copias de los pesos, lo que aumenta el coste de almacenamiento y descarga.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CollectionStudio/switch-base-32
- Checkpoint original de referencia: https://huggingface.co/google/switch-base-32
- Artículo Switch Transformers (arXiv:2101.03961): https://arxiv.org/pdf/2101.03961.pdf
- Artículo T5 (arXiv:1910.09700): https://arxiv.org/abs/1910.09700
- Repositorio t5x de Google Research: https://github.com/google-research/t5x
- Checkpoints MoE en t5x: https://github.com/google-research/t5x/blob/main/docs/models.md#mixture-of-experts-moe-checkpoints
- Documentación de `switch_transformers` en Transformers: https://huggingface.co/docs/transformers/model_doc/switch_transformers
- Notebook de fine-tuning MoE citado en la model card: https://colab.research.google.com/drive/1aGGVHZmtKmcNBbAwa9hbu58DDpIuB5O4
- Búsqueda de todos los checkpoints Switch: https://huggingface.co/models?search=switch
- Nota: la búsqueda web realizada no devolvió resultados pertinentes al modelo (solo páginas sin relación), por lo que no se han podido añadir enlaces adicionales verificados.
