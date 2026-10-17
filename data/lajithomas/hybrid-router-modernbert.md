# lajithomas/hybrid-router-modernbert

## Resumen

`lajithomas/hybrid-router-modernbert` es un modelo de clasificación de texto en inglés publicado por el usuario lajithomas en HuggingFace. Se trata de un ajuste fino (fine-tuning) del modelo encoder `unsloth/ModernBERT-large`, realizado con la librería Unsloth, que el autor indica que permite entrenar "2 veces más rápido". El repositorio contiene 395.840.521 parámetros en formato safetensors (aproximadamente 1,6 GB, lo que corresponde a pesos en precisión FP32).

El modelo se distribuye con licencia Apache 2.0 y pipeline declarado `text-classification`, aunque el nombre "hybrid-router" sugiere un uso como clasificador de enrutamiento dentro de sistemas híbridos (por ejemplo, decidir entre recuperación documental o generación con un LLM grande). La model card no describe el espacio de etiquetas, el conjunto de datos de entrenamiento ni las métricas obtenidas, por lo que se trata de un artefacto sin validación pública: cero descargas y cero "likes" en el momento de redactar esta ficha.

Su relevancia actual es la del ecosistema ModernBERT: un encoder bidireccional modernizado que compite con DeBERTa-v3 y XLM-RoBERTa en tareas de comprensión (clasificación, NER, reranking) con un coste de inferencia muy bajo, apto para desplegarse en CPU o en GPUs de consumo. Ahora bien, al no existir benchmarks publicados para esta variante concreta, cualquier evaluación debe hacerse por cuenta propia antes de llevarla a producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (familia ModernBERT, según el modelo base); detalles concretos no disponibles en la model card |
| Parámetros totales | 395.840.521 (dato real de los safetensors) |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card (el modelo base ModernBERT-large emplea 8.192 tokens, dato no confirmado para este fine-tuning) |
| Tipos de cuantización | no disponible (el repositorio solo contiene safetensors; no se publican versiones GGUF, AWQ, GPTQ ni ONNX) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers) |
| Pipeline declarado | text-classification |
| Modelo base | unsloth/ModernBERT-large |
| Tamaño del repositorio | 1,6 GB |
| Fecha de publicación | 17 de octubre de 2026 (según metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La model card es mínima: únicamente indica que el modelo es un fine-tuning de `unsloth/ModernBERT-large`, desarrollado por lajithomas, con licencia Apache 2.0 y entrenado con Unsloth. No se especifica la arquitectura exacta más allá del modelo base, ni el número de tokens de entrenamiento, ni la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se documenta el número de clases, la tarea de clasificación concreta ni el procedimiento de evaluación.

Por herencia del modelo base, cabe esperar un encoder bidireccional de tipo transformer con las innovaciones de ModernBERT (embeddings posicionales rotatorios, atención alternada local/global, activaciones GeGLU y soporte de Flash Attention), pero esto corresponde a la documentación pública de ModernBERT y no está confirmado para este fine-tuning en la información proporcionada. El tag `text-embeddings-tagging` del repositorio abre la posibilidad de que se use también como encoder de representaciones, si bien el pipeline declarado es de clasificación. El nombre "hybrid-router" no se explica en la model card.

## Capacidades

- Clasificación de secuencias de texto en inglés (pipeline `text-classification`): asignación de una o varias etiquetas a un texto de entrada, con un espacio de etiquetas no documentado en la model card.
- Codificación de representaciones de texto: los tags incluyen `text-embeddings-tagging`, por lo que el encoder podría emplearse para generar embeddings, aunque no se confirma en la documentación.
- Procesamiento de contexto largo: si conserva la ventana del modelo base, podría procesar hasta 8.192 tokens, lo que permitiría clasificar documentos completos o historiales de conversación; no confirmado.
- Capacidad monolingüe: entrenado y etiquetado únicamente para inglés (`language: en`).
- Integración con el ecosistema transformers y compatibilidad declarada con `text-generation-inference` y `endpoints_compatible` mediante tags, si bien la generación de texto no es una capacidad real de un modelo encoder de clasificación.
- No dispone de: generación de texto libre, razonamiento multi-paso, tool calling o function calling, capacidades de agente, visión, audio ni modo "thinking".

## Casos de uso

- Enrutamiento en pipelines RAG híbridos: dada la consulta de un usuario, el clasificador decide si se resuelve mediante recuperación documental, mediante una llamada a un LLM grande o mediante una herramienta concreta. Es el uso que sugiere el nombre "hybrid-router" y el coste de inferencia de un encoder de 395M parámetros lo hace viable en cada petición.
- Triaje de tickets de soporte: clasificar el mensaje entrante por categoría (facturación, incidencia técnica, cancelación) y enrutarlo al equipo correspondiente, con latencia de milisegundos en GPU y con posibilidad de ejecución en CPU.
- Detección de intenciones en asistentes conversacionales: etiquetar cada turno del usuario para seleccionar la siguiente acción del diálogo, siempre que se reentrene o valide el espacio de etiquetas, ya que no está documentado.
- Moderación de contenido: filtrar comentarios, reseñas o publicaciones con etiquetas de toxicidad, spam o discurso de odio, ejecutando el modelo en réplicas ligeras por su reducido tamaño.
- Guardarraíl frente a prompt injection en aplicaciones con LLM: clasificar la entrada del usuario como benigna o maliciosa antes de pasarla al modelo generativo, añadiendo una capa de seguridad de bajo coste.
- Etiquetado temático y organización documental a gran escala: clasificar corpus completos (noticias, informes, documentación legal) aprovechando la posible ventana de 8.192 tokens del encoder base para trabajar con documentos largos sin truncado agresivo.
- Curación y filtrado de datasets de entrenamiento: usar el clasificador como filtro de calidad o de dominio para descartar muestras antes de entrenar otros modelos, un patrón habitual con encoders pequeños de alto rendimiento.
- Análisis de sentimiento y voz del cliente: clasificar reseñas o encuestas para alimentar cuadros de mando, con inferencia por lotes en una única GPU de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de precisión, F1, MMLU, GLUE, SuperGLUE ni ningún otro conjunto de evaluación, ni tampoco información sobre el conjunto de validación utilizado.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,6 GB para los pesos en FP32 tal y como se distribuyen; unos 0,8 GB en FP16/BF16; alrededor de 0,4 GB en INT8 y 0,2 GB en 4 bits si se cuantiza por cuenta propia.
- GPU recomendadas: cualquier GPU con 2 GB o más de VRAM es suficiente (RTX 3060, RTX 4060, RTX 4090, T4, L4, A10). Para lotes grandes y despliegue de alto rendimiento, A100 o H100 permiten maximizar el throughput, aunque están sobredimensionadas para este tamaño.
- Cabe sin problemas en GPU de consumo, e incluso en CPU e iGPU con ONNX o similar, dado el reducido número de parámetros.
- Opciones de despliegue: transformers (nativo), Text Embeddings Inference (tag `text-embeddings-tagging`), HuggingFace Inference Endpoints (tag `endpoints_compatible`) y TGI (tag `text-generation-inference`, aunque un encoder de clasificación no es el caso de uso típico de TGI). No hay pesos GGUF publicados, por lo que Ollama o llama.cpp requerirían una conversión propia.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Rendimiento |
|---|---|---|---|---|---|
| lajithomas/hybrid-router-modernbert | 395,8 M | no disponible | en | Apache 2.0 | no disponible (sin benchmarks publicados) |
| unsloth/ModernBERT-large (modelo base) | ~395 M | 8.192 tokens | en | Apache 2.0 | métricas publicadas por el autor del modelo base, no incluidas en esta ficha |
| ModernBERT-base | ~149 M | 8.192 tokens | en | Apache 2.0 | no disponible en la información proporcionada |
| DeBERTa-v3-large | ~435 M | 512 tokens | en | MIT | no disponible en la información proporcionada |
| XLM-RoBERTa-large | ~560 M | 512 tokens | ~100 idiomas | MIT | no disponible en la información proporcionada |

Las cifras de parámetros, contexto y licencia de los modelos comparables proceden de su documentación pública y no han sido verificadas contra la model card de este modelo. No se dispone de una comparación de rendimiento fiable, ya que el modelo evaluado no publica métricas.

## Limitaciones y advertencias

- Ausencia total de documentación: no se describe el dataset de entrenamiento, el número de clases, el esquema de etiquetas ni el procedimiento de evaluación, lo que impide conocer qué tarea resuelve realmente el modelo.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad; cualquier uso en producción exige una evaluación propia con datos representativos.
- Modelo monolingüe en inglés: no se debe esperar un rendimiento fiable en castellano u otros idiomas.
- Riesgo de sesgos: al desconocerse la composición de los datos de entrenamiento, no se puede evaluar la presencia de sesgos demográficos, de género, raciales o de dominio.
- Riesgo de alucinación no aplicable en sentido estricto (es un clasificador, no un generador), pero sí existe riesgo de clasificaciones erróneas con alta confianza en dominios alejados de los datos de entrenamiento.
- Riesgo de descalibración: al no publicarse temperaturas ni curvas de calibración, las probabilidades de salida no deben interpretarse directamente como fiabilidad.
- Licencia Apache 2.0: permite uso comercial y modificación, siempre que se conserve el aviso de licencia y se indique los cambios; conviene verificar también la licencia del modelo base (`unsloth/ModernBERT-large`, Apache 2.0).
- Validación social nula: cero descargas y cero "likes" en el momento de la consulta; el repositorio no cuenta con revisión de la comunidad ni historial de uso.
- Inconsistencia en los metadatos: el pipeline es `text-classification`, pero los tags incluyen `text-generation-inference` y `text-embeddings-tagging`, lo que puede provocar errores de integración en plataformas que se guíen por esos tags.
- Empaquetado en FP32: los pesos ocupan 1,6 GB, el doble de lo necesario para inferencia en FP16; conviene convertir a BF16 o cuantizar antes de desplegar para reducir memoria y aumentar el throughput.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lajithomas/hybrid-router-modernbert
- Modelo base: https://huggingface.co/unsloth/ModernBERT-large
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Paper de ModernBERT (arquitectura del modelo base): https://arxiv.org/abs/2412.13663
