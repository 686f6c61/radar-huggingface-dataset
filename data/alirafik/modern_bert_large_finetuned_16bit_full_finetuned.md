# aliRafik/Modern_BERT_large_finetuned_16bit_full_finetuned

## Resumen

`Modern_BERT_large_finetuned_16bit_full_finetuned` es un ajuste fino del codificador bidireccional ModernBERT-large, publicado por el usuario aliRafik en Hugging Face. Arquitectura transformer de tipo encoder-only, con 395.837.446 parámetros (~396 millones) almacenados en safetensors de 16 bits (0,8 GB de repositorio) y una ventana de contexto que hereda del modelo base, fijada en 8.192 tokens. El repositorio lo declara con la tarea `text-classification`, por lo que su uso previsto es clasificar texto en inglés, no generar texto de forma autorregresiva.

El problema que resuelve es concreto pero no documentado: se trata de un clasificador afinado sobre un corpus que el autor no describe. La model card se limita a indicar que el modelo deriva de `unsloth/ModernBERT-large`, que la licencia es Apache 2.0 y que el entrenamiento se realizó con Unsloth. No hay información sobre etiquetas, conjunto de datos, métrica objetivo, hiperparámetros ni partición de validación.

Su relevancia actual es limitada como artefacto listo para producción (0 descargas y 0 "likes" en el momento de la consulta, sin evaluación publicada), pero sí resulta útil como plantilla reproducible de ajuste completo en 16 bits sobre ModernBERT con Unsloth, y como recordatorio de que la etiqueta `text-generation-inference` que aparece en los tags es inconsistente con un encoder: ModernBERT no puede usarse para decodificación autorregresiva.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only, familia ModernBERT (bidireccional) |
| Parámetros totales | 395.837.446 (dato real del archivo safetensors) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 8.192 tokens en el modelo base ModernBERT-large; la model card del ajuste no lo especifica |
| Tipos de cuantización | No disponible en el repositorio (pesos publicados únicamente en 16 bits) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (precisión de 16 bits) |

| Identificador | Valor |
|---|---|
| ID en Hugging Face | aliRafik/Modern_BERT_large_finetuned_16bit_full_finetuned |
| Modelo base | unsloth/ModernBERT-large |
| Pipeline declarada | text-classification |
| Librería | transformers |
| Tamaño del repositorio | 0,8 GB |
| Etiquetas relevantes | modernbert, text-classification, text-generation-inference, unsloth, text-embeddings-inference, endpoints_compatible |
| Fecha de creación | 2026-10-05 |
| Última actualización | 2026-10-05 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de ModernBERT-large, descrita en el paper del modelo base: un encoder transformer bidireccional con normalización previa (pre-norm), embeddings posicionales rotatorios (RoPE) en lugar de embeddings absolutos, activaciones GeGLU, eliminación de los términos de sesgo en las capas lineales y un patrón de atención alterna que combina capas de atención local con ventana de 128 tokens y capas de atención global. Este diseño permite procesar secuencias de hasta 8.192 tokens con un coste de memoria inferior al de un encoder con atención completa en todas las capas, y aprovecha Flash Attention 2 y técnicas de *unpadding* para mejorar el rendimiento en lotes. Según el paper del modelo base, ModernBERT-large se entrenó sobre aproximadamente 2 billones de tokens de texto en inglés.

El ajuste fino de este repositorio se presenta como un *full fine-tuning* en 16 bits realizado con Unsloth, cuyo reclamo principal es un entrenamiento unas dos veces más rápido que las implementaciones de referencia. El nombre del checkpoint (`16bit_full_finetuned`) y el número de parámetros confirman que no se trata de un adaptador LoRA, sino de una actualización de todos los pesos. No se aporta ninguna información sobre la composición del dataset de ajuste, el número de pasos, la tasa de aprendizaje, la cabeza de clasificación empleada ni las etiquetas de salida. Al ser un modelo encoder-only destinado a clasificación, no se aplican técnicas de alineación como RLHF o DPO.

## Capacidades

- Codificación de texto bidireccional en inglés y producción de una salida de clasificación; el número y el significado de las clases no están documentados.
- Procesamiento de secuencias largas de hasta 8.192 tokens, siempre que el ajuste fino se haya realizado con esa longitud, algo que no se especifica.
- Extracción de representaciones contextuales del token `[CLS]` o de la media de tokens, reutilizables para búsqueda semántica, clustering o deduplicación si se accede a la salida del encoder.
- Ejecución por lotes con *unpadding*, apta para clasificación masiva de documentos.
- Capacidades multilingües: ninguna. El modelo declara únicamente inglés.
- Generación de texto, razonamiento multi-paso, *tool calling* y uso como agente: no disponibles. La etiqueta `text-generation-inference` de los tags es incompatible con un encoder bidireccional y probablemente procede de la plantilla de exportación de Unsloth.
- Modo de razonamiento (*thinking*), visión y audio: no disponibles.

## Casos de uso

- Clasificación de documentos largos: el encoder procesa hasta 8.192 tokens en una sola pasada, lo que permite etiquetar contratos, informes o artículos completos sin truncar ni dividir en fragmentos, algo que un clasificador de 512 tokens obligaría a hacer. Requiere verificar antes qué etiquetas devuelve el modelo, ya que no están documentadas.
- Enrutado de tickets de soporte: se puede integrar detrás de un servicio HTTP para asignar cada incidencia a una categoría o cola. Su tamaño de 396 millones de parámetros permite ejecutarlo en CPU o en una GPU pequeña con latencias de milisegundos por petición.
- Moderación de contenido y análisis de sentimiento: clasificación binaria o multietiqueta de comentarios y publicaciones. El contexto largo ayuda en hilos completos en lugar de mensajes aislados, aunque el sesgo del corpus de ajuste es desconocido.
- Etiquetado automático para pipelines de datos: uso como *auto-labeler* para preanotar grandes volúmenes de texto antes de una revisión humana, aprovechando el bajo coste de inferencia de un modelo de 0,8 GB.
- Detección de duplicados y near-duplicates: extrayendo el embedding del token `[CLS]` y aplicando similitud coseno sobre corpus de documentación técnica o catálogos de productos.
- Evaluación de salidas de LLM: como clasificador auxiliar que puntúa si una respuesta generada es correcta, tóxica o fuera de dominio dentro de un pipeline de evaluación automática.
- Filtrado previo en recuperación aumentada (RAG): reordenar o descartar fragmentos recuperados antes de pasarlos a un modelo generativo, reduciendo el consumo de tokens del modelo grande.
- Base para reajuste específico de dominio: al ser un *full fine-tune* con licencia Apache 2.0 y pesos en safetensors, sirve como punto de partida para reentrenar con etiquetas propias en 16 bits usando Unsloth o `Trainer` de transformers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card no incluye métricas de exactitud, F1, precisión ni comparaciones con otros clasificadores, y tampoco se han encontrado evaluaciones de terceros en la búsqueda web realizada. Cualquier cifra de rendimiento sobre este checkpoint concreto tendría que obtenerse evaluándolo contra un conjunto de validación propio, una vez identificadas las etiquetas de salida.

## Requisitos de hardware

- Peso de los pesos en memoria: ~0,8 GB en 16 bits, ~1,6 GB si se carga en fp32.
- Cuantización estimada a partir del tamaño: ~0,4 GB en int8 y ~0,2 GB en int4, aunque no hay archivos cuantizados publicados y requerirían un proceso externo (por ejemplo, cuantización dinámica de PyTorch u ONNX Runtime).
- VRAM estimada para inferencia con lote de tamaño 1 y secuencias de 512 tokens: en torno a 1,5-2 GB en 16 bits, sumando pesos y activaciones.
- Con secuencias de 8.192 tokens, el consumo de activaciones crece de forma aproximadamente cuadrática en las capas de atención global; se recomienda reservar 8-12 GB para lotes pequeños a longitud completa, o reducir la longitud efectiva.
- Cabe en cualquier GPU de consumo con 4 GB o más de VRAM: GTX 1650, RTX 3050, RTX 3060, RTX 4060, RTX 4090. También es viable en CPU para cargas moderadas.
- GPU recomendadas para servicio: T4, L4, A10G y RTX 4090 en despliegues de bajo coste; A100 o H100 si se necesita alto *throughput* con lotes grandes y secuencias largas.
- Opciones de despliegue: `transformers` con `AutoModelForSequenceClassification`, Text Embeddings Inference (TEI) para clasificación y embeddings, ONNX Runtime mediante Optimum, y vLLM para tareas de *pooling* con modelos encoder. Los tags incluyen `text-generation-inference` y `endpoints_compatible`, pero TGI no es aplicable a un modelo generativo; llama.cpp y Ollama requerirían una conversión manual a GGUF que no está publicada.
- Latencia y *throughput*: no disponibles. No se han medido ni publicado cifras para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este ajuste (aliRafik) | 395,8 M | 8.192 tokens (heredado del base) | Apache 2.0 | safetensors, 0 descargas | Tarea y etiquetas sin documentar |
| ModernBERT-base (Answer.AI / LightOn) | ~149 M | 8.192 tokens | Apache 2.0 | safetensors, ampliamente usado | Misma arquitectura, menor capacidad; base más segura para reajustar |
| DeBERTa-v3-large | ~435 M | 512 tokens | MIT | safetensors, ecosistema maduro | Mejor rendimiento documentado en NLU clásico, pero contexto corto |
| RoBERTa-large | ~355 M | 512 tokens | MIT | safetensors, muy extendido | Referencia histórica en clasificación; sin soporte nativo de secuencias largas |

Los datos de parámetros, contexto y licencia de los modelos comparados proceden de sus respectivas model cards públicas, no de la información proporcionada para este modelo. No es posible comparar rendimiento en tareas concretas porque este ajuste no publica ninguna métrica.

## Limitaciones y advertencias

- La model card es una plantilla automática de Unsloth: no indica tarea concreta, conjunto de etiquetas, dataset de ajuste, métrica objetivo, hiperparámetros ni procedencia de los datos.
- Inconsistencia de etiquetado: los tags incluyen `text-generation-inference` y `text-classification` a la vez, lo que puede provocar que herramientas de despliegue seleccionen una configuración incorrecta.
- Estado de validación nulo: 0 descargas y 0 "likes" en el momento de la consulta; no hay informes de terceros ni evaluaciones independientes.
- Monolingüe en inglés: su uso con texto en castellano no está soportado y degradará el rendimiento de forma impredecible.
- Riesgo de alucinación: no aplica generación de texto, pero sí existe riesgo de falsos positivos y falsos negativos sistemáticos al desconocer el dominio de entrenamiento y el equilibrio de clases.
- Sesgos: al derivar de ModernBERT-large, entrenado sobre corpus web en inglés, hereda los sesgos demográficos, culturales y de registro de esos datos; no hay ninguna evaluación de sesgo publicada para este ajuste.
- Longitud de contexto: aunque el modelo base soporte 8.192 tokens, se desconoce si el ajuste fino se realizó con esa longitud; usar secuencias más largas que las vistas en entrenamiento suele degradar la precisión.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero no cubre los derechos sobre los datos de ajuste, que el autor no declara; conviene asumir riesgo jurídico al desplegarlo en producción sin verificación previa.
- Ausencia de ficha de evaluación y de modelo de responsabilidad: no hay información sobre tasas de error, dominios fuera de distribución ni comportamiento ante entradas adversarias.
- Fecha de creación registrada como 2026-10-05, posterior a la fecha de publicación de ModernBERT-large; no hay más contexto temporal que el metadato del repositorio.

## Enlaces

- Repositorio del modelo: https://huggingface.co/aliRafik/Modern_BERT_large_finetuned_16bit_full_finetuned
- Modelo base: https://huggingface.co/unsloth/ModernBERT-large
- Unsloth (biblioteca de entrenamiento citada en la model card): https://github.com/unslothai/unsloth
- Paper de la arquitectura base ModernBERT (referencia externa, no citada en la model card): https://arxiv.org/abs/2412.13663
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo: los resultados obtenidos correspondían a portales de preguntas y respuestas sin relación con el checkpoint.
