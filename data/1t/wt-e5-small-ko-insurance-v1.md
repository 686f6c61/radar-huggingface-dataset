# 1T/wt-e5-small-ko-insurance-v1

## Resumen

wt-e5-small-ko-insurance-v1 es un adaptador LoRA de tipo sentence-transformers para recuperación de información (retrieval) en coreano, especializado en el dominio de seguros. Lo publica el usuario 1T (Kim, Wontae) y se construye sobre el modelo de embeddings `dragonkue/multilingual-e5-small-ko-v2`, de 118 M de parámetros, 384 dimensiones de embedding y una ventana máxima de 512 tokens. El adaptador añade únicamente 669.696 parámetros entrenables (el 0,57 % del modelo base) y ocupa 2,7 MB, lo que permite distribuirlo como un fichero ligero sobre un encoder ya existente.

El problema que resuelve es concreto: mejorar la calidad de la recuperación de herramientas (tool retrieval) y de documentos en consultas de seguros en coreano sin renunciar a la inferencia en CPU. El autor descarta modelos de 1024 dimensiones o más (KURE-v1, BGE-M3) porque su latencia en CPU es entre 6 y 7 veces superior, y opta por ajustar un encoder pequeño con LoRA para compensar la menor capacidad del base. Según la model card, el nDCG@10 en el conjunto de evaluación de dominio pasa de 0,630 a 0,773 manteniendo una latencia de 13 ms p50 por consulta en CPU.

La relevancia del modelo está en su perfil de despliegue: es un encoder de recuperación que cabe en cualquier CPU de servidor moderno y que se puede servir sin GPU. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la licencia es Apache-2.0 tanto para el adaptador como para el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (familia E5, multilingual-e5-small-ko); adaptador LoRA sobre Q/K/V/dense en las 12 capas |
| Parametros totales | 118 M en el modelo base; adaptador con 669.696 parametros entrenables (0,57 % del base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (max_seq del modelo base) |
| Tipos de cuantizacion | No disponible (el autor solo publica el adaptador LoRA en safetensors; no se documentan cuantizaciones del modelo fusionado) |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache-2.0 (adaptador); Apache-2.0 en el modelo base |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); libreria declarada: peft |
| Dimension de embedding | 384 |
| Pooling | Mean pooling + normalizacion L2 (heredado del base) |
| Prefijos obligatorios | `query: ` para consultas y `passage: ` para pasajes |
| Tamano del repositorio | 0,0 GB (adaptador de 2,7 MB) |
| Fecha de publicacion | 2026-09-20 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer encoder de 118 M de parámetros y 384 dimensiones de salida, derivado de la familia E5 multilingüe y adaptado al coreano por dragonkue. Sobre él se aplica un adaptador LoRA con r=8 y alpha=16, cuyos módulos objetivo son las proyecciones Q, K, V y la capa dense en las 12 capas del encoder. El tokenizer, la configuración de pooling (mean pooling) y la normalización L2 se heredan sin cambios del base, y el adaptador no incluye cabezal alguno: la salida es directamente el embedding normalizado del encoder.

El entrenamiento utiliza MultipleNegativesRankingLoss con escala 20 (temperatura 0,05) sobre 18.000 tripletas: 2.500 consultas sintéticas del dominio de seguros, 10.000 ejemplos de `klue/mrc` y 7.500 pares de `klue/sts` con etiqueta mayor o igual a 3,5. Se entrena 4 épocas con learning rate 3e-5, batch de 16, 15 negativos in-batch y 6 negativos duros. Los datos de dominio son privados y no se incluyen en el repositorio; los conjuntos públicos KLUE están bajo CC-BY-SA-4.0. No se documenta uso de RLHF ni DPO, algo esperable en un modelo de embeddings.

## Capacidades

- Generación de embeddings de frases y pasajes en coreano para similitud semántica y recuperación densa.
- Recuperación de herramientas (tool retrieval) a partir de la primera intervención del usuario en una conversación.
- Recuperación de documentos en el dominio asegurador: consultas de clientes contra descripciones de productos, guías de suscripción y documentación interna.
- Similitud semántica entre frases (sentence-similarity), con soporte de cálculo de coseno tras normalización L2.
- Extracción de características (feature-extraction) para pipelines de búsqueda vectorial.
- Ejecución en CPU sin GPU, con latencia p50 de 13 ms por consulta (7 ms en el base).
- No dispone de tool calling, generación de texto, capacidades multimodales, modo de razonamiento ni soporte de audio o visión: es un encoder, no un modelo generativo.

## Casos de uso

- Enrutado de consultas a herramientas en un asistente de seguros: el modelo indexa las descripciones de las funciones disponibles y selecciona la más adecuada para cada consulta entrante. El autor lo evalúa exactamente en esta tarea con el conjunto `heegyu/glaive-function-calling-v2-ko`, con nDCG@10 de 0,5283.
- Atención al cliente automatizada: la consulta del usuario se convierte en embedding y se recuperan los pasajes relevantes de una base de conocimiento de pólizas antes de pasarlos a un LLM generativo. El encoder aporta el contexto y el generador redacta la respuesta.
- Búsqueda semántica en el corpus documental de una aseguradora: recuperación de guías de suscripción, cláusulas y procedimientos mediante similitud coseno, con nDCG@10 de 0,773 en el conjunto de dominio de 104 consultas del autor.
- Deduplicación y agrupación de consultas entrantes: al proyectar consultas en un espacio de 384 dimensiones se pueden agrupar tickets repetidos o muy similares para reducir carga de agentes humanos.
- Clasificación y enrutado de tickets por sector: los embeddings sirven como entrada a un clasificador ligero que asigna cada consulta a un departamento (por ejemplo, suscripción, siniestros o cancelaciones).
- Detección de preguntas fuera de dominio: comparando la similitud máxima contra el índice de referencia se puede decidir si una consulta queda fuera del ámbito cubierto y derivarla a un humano.
- Sistemas de recomendación de productos de seguro: emparejamiento entre el perfil o la consulta del cliente y las descripciones de productos disponibles en el catálogo.
- Preprocesado en pipelines RAG con restricción de coste: al ejecutarse en CPU a 13 ms p50, permite desplegar recuperación semántica en entornos sin GPU o con presupuesto muy ajustado.

## Benchmarks y rendimiento

Resultados declarados en el model-index de la model card (no verificados):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Tool retrieval (coreano) | heegyu/glaive-function-calling-v2-ko (train) | nDCG@10 | 0,5283 |
| Tool retrieval (coreano) | heegyu/glaive-function-calling-v2-ko (train) | Recall@3 | 0,5601 |

Comparativa publicada por el autor para tool retrieval en dominio general (corpus de 195 descripciones de funciones únicas, 1.473 consultas, independiente de entrenamiento y holdout):

| Metrica | Base e5 | wt-e5-small-ko-insurance-v1 | OpenAI text-embedding-3-large |
|---|---:|---:|---:|
| nDCG@10 | 0,5175 | 0,5283 | 0,5193 |
| Recall@1 | 0,3150 | 0,3150 | 0,3015 |
| Recall@3 | 0,5390 | 0,5601 | 0,5565 |
| Recall@10 | 0,7312 | 0,7502 | 0,7417 |
| MRR@3 | 0,4160 | 0,4249 | 0,4196 |

Evaluación en dominio de seguros (conjuntos privados, no reproducibles):

| Metrica | Base e5 | wt-e5-small-ko-insurance-v1 | OpenAI text-embedding-3-large |
|---|---:|---:|---:|
| nDCG@10 (104 consultas) | 0,630 | 0,773 | 0,634 |
| Recall@1 | 0,385 | 0,596 | 0,337 |
| Recall@3 | 0,562 | 0,716 | 0,635 |
| MRR@3 | 0,492 | 0,670 | 0,463 |
| nDCG@10 (holdout, 1.056 consultas) | 0,8886 | 0,9053 | 0,8766 |

El autor indica que los intervalos de confianza al 95 % del holdout no se solapan y que el corpus y las consultas de evaluación de dominio son privados, por lo que no se pueden reproducir.

## Requisitos de hardware

- Inferencia en CPU: el caso de uso declarado. Latencia p50 de 13 ms por consulta con el adaptador y de 7 ms con el base, sin GPU.
- VRAM estimada (calculada a partir de los 118 M de parametros del base, no publicada por el autor): aproximadamente 470 MB en fp32, 240 MB en fp16 y 120 MB en int8.
- GPU recomendadas: cualquier GPU con mas de 1 GB de VRAM es suficiente. No se documentan pruebas con A100, H100 o RTX 4090 porque el modelo esta disenado para CPU.
- Cabe en cualquier GPU de consumo (GTX 1050 Ti o superior, RTX 3060, RTX 4090) y en GPU integradas con memoria compartida.
- Opciones de despliegue: sentence-transformers junto con PEFT, que es el flujo documentado en la model card. Para runtimes que no leen adaptadores directamente (el autor menciona vLLM), hay que fusionar previamente con `merge_and_unload()` y guardar el modelo completo.
- No hay cuantizaciones publicadas ni conversiones a GGUF documentadas, por lo que el uso con llama.cpp u Ollama requeriria una conversion propia.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Dimension de embedding | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| wt-e5-small-ko-insurance-v1 | 118 M + 0,67 M de adaptador | 384 | 512 | Apache-2.0 | Latencia CPU p50 de 13 ms; nDCG@10 de 0,773 en el dominio de seguros del autor |
| dragonkue/multilingual-e5-small-ko-v2 (base) | 118 M | 384 | 512 | Apache-2.0 | Latencia CPU p50 de 7 ms; nDCG@10 de 0,630 en el mismo conjunto de dominio |
| 1T/wt-kure-insurance-v1 | No disponible | No disponible | No disponible | No disponible | Alternativa del mismo autor para indexar fragmentos largos; el autor la recomienda cuando se superan los 512 tokens |
| KURE-v1 | No disponible | 1024 (segun la model card) | No disponible | No disponible | Descartado por el autor por latencia en CPU entre 6 y 7 veces superior |
| BGE-M3 | No disponible | 1024 (segun la model card) | No disponible | No disponible | Descartado por el autor por latencia en CPU entre 6 y 7 veces superior |
| OpenAI text-embedding-3-large | No disponible | No disponible | No disponible | Propietaria | Servicio de pago; en los conjuntos del autor queda por debajo del modelo en tool retrieval general y en dominio de seguros |

## Limitaciones y advertencias

- Ventana máxima de 512 tokens. Para indexar fragmentos largos el propio autor remite a `1T/wt-kure-insurance-v1`.
- Los datos de entrenamiento de dominio son frases cortas (consulta contra descripción de herramienta o documento), por lo que el modelo no aporta ventaja en similitud entre pasajes largos.
- Solo se distribuye el adaptador: el tokenizer y la configuración de pooling (mean pooling + L2) se toman del modelo base y deben coincidir.
- Los prefijos `query: ` y `passage: ` son obligatorios; omitirlos supone una pérdida de 3 a 5 puntos según el autor.
- Idioma único: coreano. El modelo base es multilingüe, pero el ajuste y la evaluación se han hecho exclusivamente en coreano y no se documenta comportamiento en otros idiomas.
- Los conjuntos de evaluación de dominio son privados, por lo que los resultados de 0,773 y 0,9053 de nDCG@10 no son reproducibles. La única evaluación con datos públicos es la de tool retrieval sobre `heegyu/glaive-function-calling-v2-ko`, donde la mejora sobre el base es de 0,0108 puntos de nDCG@10 y de 0,0211 puntos de Recall@3, con Recall@1 idéntico.
- En el conjunto público, el modelo queda muy cerca de OpenAI text-embedding-3-large (0,5283 frente a 0,5193 de nDCG@10), diferencia pequeña que debe interpretarse con cautela al no haber intervalos de confianza publicados para esa tabla.
- Riesgo de alucinación: no aplica en sentido generativo, ya que el modelo solo produce embeddings; el riesgo en producción es de recuperación incorrecta (falsos positivos en el ranking) y se traslada al generador que consuma los pasajes.
- Sesgos: no se documenta ninguna evaluación de sesgos ni de equidad. El corpus de seguros y las consultas sintéticas pueden reflejar sesgos del dominio y de la forma de generar los datos.
- Uso comercial: permitido bajo Apache-2.0 tanto en el adaptador como en el base. Los conjuntos `klue/mrc` y `klue/sts` usados en el entrenamiento están bajo CC-BY-SA-4.0, lo que conviene revisar si se redistribuye un modelo derivado.
- El modelo no incluye datos de dominio en el repositorio, lo que impide auditar la composición exacta del conjunto de entrenamiento en seguros.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay evidencia de uso en producción por terceros ni comunidad que reporte incidencias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/1T/wt-e5-small-ko-insurance-v1
- Modelo base: https://huggingface.co/dragonkue/multilingual-e5-small-ko-v2
- Alternativa del mismo autor para fragmentos largos: https://huggingface.co/1T/wt-kure-insurance-v1
- Dataset de evaluacion de tool retrieval: https://huggingface.co/datasets/heegyu/glaive-function-calling-v2-ko
- Dataset de entrenamiento KLUE: https://huggingface.co/datasets/klue/klue
- No se han encontrado papers, blogs ni demos adicionales en la informacion proporcionada.
