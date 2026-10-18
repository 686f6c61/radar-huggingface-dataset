# CollectionStudio/switch-base-16

## Resumen

Switch-base-16 es un checkpoint de la familia Switch Transformers, publicada originalmente por Google Research, que aplica una arquitectura Mixture of Experts (MoE) sobre el esquema encoder-decoder de T5. La innovación consiste en sustituir las capas feed-forward densas por capas MLP dispersas con 16 "expertos" y un enrutador que selecciona un unico experto por token en cada capa, de modo que el coste computacional por token se mantiene proximo al de un modelo denso de talla base mientras la capacidad total del modelo crece con el numero de expertos. Segun el paper de referencia, esta aproximacion permite escalar el preentrenamiento hasta modelos de hasta un billon de parametros sobre el corpus C4 y lograr una aceleracion de hasta 4x frente a T5-XXL.

El checkpoint subido por CollectionStudio (identificador `CollectionStudio/switch-base-16`, repositorio de 4,3 GB, creado en octubre de 2026) reproduce el modelo `google/switch-base-16`: 16 expertos por capa dispersa, 12 capas de encoder y 12 de decoder en configuracion base, y pesos en PyTorch para su uso con la clase `SwitchTransformersForConditionalGeneration` de `transformers`. Esta entrenado unicamente con la tarea de Masked Language Modeling (span corruption) sobre C4 en ingles, por lo que no es un modelo listo para usar en produccion sin fine-tuning.

Su relevancia actual es doble: por un lado sirve como referencia historica y experimental para estudiar el enrutamiento disperso y el balanceo de carga en MoE; por otro, es un punto de partida barato (4,3 GB en fp32) para quien quiera fine-tunear un modelo disperso en tareas text2text sin disponer de clústeres grandes. La licencia Apache 2.0 y la disponibilidad de ejemplos de inferencia en CPU, FP16 e INT8 facilitan su adopcion en entornos de investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder tipo T5 con capas MLP dispersas (Mixture of Experts, 16 expertos por capa, enrutamiento top-1) |
| Parametros totales | No disponible en la model card; el repositorio ocupa 4,3 GB, magnitud compatible con aproximadamente 1.000 M de parametros almacenados en fp32 (inferencia a partir del tamano del repo, no confirmada por el autor) |
| Parametros activos | No disponible; segun el paper solo se activa un experto por token y capa |
| Longitud de contexto | No disponible en la model card; los checkpoints T5 originales se preentrenan con secuencias de 128 tokens y el sesgo posicional relativo admite entradas mas largas en inferencia |
| Tipos de cuantizacion | FP32 (por defecto), FP16 y INT8 (bitsandbytes); no se ofrecen pesos GGUF ni cuantizaciones de 4 bits |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`pytorch_model.bin`) para `transformers`; no se indica safetensors ni GGUF |
| Tipo de modelo | `text2text-generation` (entrenado con objetivo de Masked Language Modeling) |
| Dataset de entrenamiento | C4 (Colossal Clean Crawled Corpus) |
| Autor original del checkpoint | Google Research (referencia `google/switch-base-16`) |
| Tamano del repositorio | 4,3 GB |
| Descargas / likes | 0 / 0 (a fecha de la informacion) |

## Arquitectura y entrenamiento

La arquitectura sigue el esquema de T5: un encoder y un decoder de transformers con atencion multi-cabeza y sesgo posicional relativo, en los que cada bloque feed-forward denso se reemplaza por una capa `SwitchTransformersSparseMLP` con 16 expertos MLP independientes. Un enrutador por capa calcula una distribucion sobre los expertos y asigna cada token al experto de mayor probabilidad (top-1), lo que introduce dispersion en la computacion: el coste por token es el de un unico experto, pero la memoria necesaria para alojar los pesos escala con el total de expertos. El entrenamiento de este tipo de modelos incorpora perdidas auxiliares de balanceo de carga, factor de capacidad y dropout de expertos para evitar el colapso del enrutador, mecanicas descritas en el paper arXiv:2101.03961 que la propia model card cita como fuente.

El modelo se preentrena con la tarea de span corruption (MLM) sobre C4 en ingles, en la linea del preentrenamiento original de T5 descrito en arXiv:1910.09700. No hay en la informacion proporcionada evidencia de fases posteriores de alineacion: no se mencionan RLHF, DPO, SFT ni ajuste por instrucciones, y la model card advierte explicitamente que los checkpoints "no estan listos para usar" en tareas downstream, remitiendo a FLAN-T5 o al fine-tuning propio (con un cuaderno de Colab enlazado) para obtener pesos ajustados. El paper reporta como principal resultado tecnico la mejora de las propiedades de escalado del preentrenamiento y una aceleracion de hasta 4x frente a T5-XXL.

## Capacidades

- Relleno de spans enmascarados: genera texto para marcadores `<extra_id_n>`, tal como muestra el widget de la model card ("A `<extra_id_0>` walks into a bar a orders a `<extra_id_1>`...").
- Reconstruccion de texto corrupto y denoising, utilidad directa del objetivo de preentrenamiento.
- Generacion condicionada text2text tras fine-tuning: resumen, parafrasis, traduccion o respuesta a preguntas, siempre que se ajuste el modelo.
- Extraccion de representaciones del encoder para tareas de clasificacion o clustering tras el ajuste correspondiente.
- Capacidad multilingue: no disponible; el modelo declara unicamente ingles.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; no es un modelo ajustado por instrucciones.
- Capacidades multimodales (vision, audio): no disponibles.
- Modo "thinking" o razonamiento explicito: no disponible.
- Capacidad de investigacion sobre enrutamiento: inspeccion de la distribucion de expertos y del comportamiento del router, al ser una implementacion MoE de referencia.

## Casos de uso

- Investigacion sobre Mixture of Experts: analizar la distribucion de tokens por experto, el colapso del enrutador y el efecto del factor de capacidad usando un checkpoint publico de 4,3 GB, sin necesidad de entrenar desde cero.
- Fine-tuning para resumen o parafrasis en ingles: partir de los pesos preentrenados y ajustar con `SwitchTransformersForConditionalGeneration` sobre un dataset supervisado; la naturaleza dispersa permite aumentar capacidad sin multiplicar el coste de computo por token.
- Relleno de plantillas y aumento de datos: usar el objetivo de span corruption para generar variantes de frases enmascaradas en pipelines de data augmentation o para completar campos faltantes en textos estructurados.
- Adaptacion de dominio con presupuesto limitado: al ocupar 4,3 GB en fp32 (y alrededor de la mitad en FP16), el fine-tuning cabe en una sola GPU de 16-24 GB, algo inviable en modelos MoE de mayor talla.
- Base para destilacion o experimentos de eficiencia: comparar calidad y latencia frente a T5-base denso para medir la relacion entre parametros totales y activos en un caso controlado.
- Reproduccion de resultados academicos: replicar las curvas de escalado y las comparaciones con T5 descritas en arXiv:2101.03961 sobre C4, usando los scripts de T5X o `transformers`.
- Prototipado educativo: demostrar en docencia como funciona un router top-1 y por que la memoria requerida no equivale al computo requerido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K, GLUE, SuperGLUE ni SQuAD para este checkpoint, y el autor del repositorio no aporta evaluaciones propias (0 descargas y 0 likes en el momento de la consulta). El unico dato cuantitativo citado es la aceleracion de hasta 4x en preentrenamiento frente a T5-XXL reportada en el paper de Switch Transformers, que es una metrica de eficiencia de entrenamiento y no de calidad en tareas downstream.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,5-5 GB en FP32 para alojar los pesos (4,3 GB de repositorio) mas activaciones y cache; alrededor de 2,5 GB en FP16; en torno a 1,2-1,5 GB con cuantizacion INT8 de bitsandbytes.
- Nota importante sobre MoE: la memoria escala con los parametros totales (todos los expertos deben residir en memoria), aunque el computo por token se aproxima al de un modelo denso base.
- GPU recomendadas: cualquier GPU con 8 GB o mas para FP16 (RTX 3060 Ti, RTX 4060, RTX 3070); 16-24 GB (RTX 4080, RTX 4090, A10G, L4) para fine-tuning comodo en FP16 con `accelerate`; A100/H100 solo necesarias para entrenamiento a mayor escala o lotes grandes.
- Caben en GPU de consumo: si, en FP16 e INT8 con holgura en tarjetas de 8 GB; la model card incluye un ejemplo explicito de ejecucion en CPU, valido para pruebas funcionales.
- Opciones de despliegue: `transformers` con `SwitchTransformersForConditionalGeneration`, `accelerate` para `device_map="auto"` y bitsandbytes para INT8; el soporte en vLLM, TGI, llama.cpp u Ollama no esta documentado en la informacion disponible (no existen pesos GGUF), por lo que debe considerarse no disponible.
- Latencia y throughput estimados: no disponibles; no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Switch-base-16 (este) | No disponible (repo de 4,3 GB, ~1.000 M estimados) | No disponible | MoE encoder-decoder, preentrenado con MLM | Apache 2.0 | HuggingFace, uso via `transformers` |
| T5-base | 220 M (dato de la familia T5, no presente en la informacion proporcionada) | No disponible | Denso encoder-decoder, preentrenado con MLM | Apache 2.0 | HuggingFace |
| FLAN-T5-base | No disponible en esta informacion | No disponible | Denso encoder-decoder ajustado por instrucciones | Apache 2.0 | HuggingFace, recomendado en la propia model card |
| Switch-base-8 | No disponible | No disponible | MoE encoder-decoder con 8 expertos | Apache 2.0 | HuggingFace (familia "All Switch Transformers Checkpoints") |

La comparacion cuantitativa de rendimiento entre estas alternativas no esta disponible: ni la model card ni los resultados de busqueda aportan metricas de calidad. La diferencia funcional mas relevante es que T5-base es denso (menos memoria, mas computo por parametro), switch-base-8 reduce el numero de expertos de la misma familia y FLAN-T5-base es el unico de los cuatro que puede usarse directamente en tareas downstream sin fine-tuning.

## Limitaciones y advertencias

- No es un modelo listo para produccion: la model card indica explicitamente que los checkpoints se entrenaron con MLM y requieren fine-tuning para tareas downstream.
- Solo ingles: no hay soporte declarado de otros idiomas, incluido el castellano.
- Sesgos: la model card deja la seccion "Bias, Risks, and Limitations" como "More information needed"; al entrenarse sobre C4 (texto web sin filtrar por sesgo) es esperable que reproduzca estereotipos y sesgos de genero, raza o religion, pero no hay evaluacion publicada en la informacion disponible.
- Riesgo de alucinacion: alto en generacion libre, al no existir ajuste por instrucciones ni fase de alineacion; el modelo completa texto de forma estadistica, no verifica hechos.
- Longitud de contexto: no documentada; usar secuencias muy superiores a las de preentrenamiento puede degradar la calidad aunque el sesgo posicional relativo lo permita tecnicamente.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificacion con atribucion y conservacion del aviso de licencia; no se especifican restricciones adicionales.
- Trazabilidad: el repositorio es una resubida (autor CollectionStudio, 0 descargas, 0 likes) sin evaluaciones propias; conviene contrastar los pesos con el checkpoint oficial de Google antes de usarlos en produccion.
- Coste de memoria del MoE: quien despliegue el modelo debe presupuestar VRAM para todos los expertos, aunque solo se active uno por token.
- Sin soporte documentado en motores de inferencia de alto rendimiento (vLLM, TGI) ni en formatos GGUF, lo que limita el despliegue en CPU y en entornos tipo Ollama.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CollectionStudio/switch-base-16
- Checkpoint original de referencia: https://huggingface.co/google/switch-base-16
- Paper de Switch Transformers: https://arxiv.org/pdf/2101.03961.pdf (arXiv:2101.03961)
- Paper de T5 (Explorar los limites de la transferencia): https://arxiv.org/abs/1910.09700
- Repositorio T5X (checkpoints MoE originales): https://github.com/google-research/t5x
- Listado de checkpoints MoE en T5X: https://github.com/google-research/t5x/blob/main/docs/models.md#mixture-of-experts-moe-checkpoints
- Documentacion de `transformers` para Switch Transformers: https://huggingface.co/docs/transformers/model_doc/switch_transformers
- Cuaderno de fine-tuning MoE en Colab: https://colab.research.google.com/drive/1aGGVHZmtKmcNBbAwa9hbu58DDpIuB5O4
- Listado de todos los checkpoints Switch Transformers: https://huggingface.co/models?search=switch
- Nota: la busqueda web realizada no devolvio resultados tecnicos relevantes sobre el modelo (unicamente paginas de inicio de LinkedIn), por lo que no se han podido incorporar enlaces adicionales de blogs, demos o notas de prensa.
