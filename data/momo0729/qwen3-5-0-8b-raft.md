# momo0729/qwen3.5-0.8b-raft

## Resumen

qwen3.5-0.8b-raft es un ajuste fino del modelo base Qwen/Qwen3.5-0.8B, publicado por el usuario momo0729 en Hugging Face. El modelo está especializado en generación de respuestas para sistemas RAG (Retrieval-Augmented Generation) en japonés: recibe tres documentos recuperados y devuelve una respuesta corta junto con el identificador del fragmento que sirve como evidencia, todo en formato JSON. El ajuste se realizó mediante LoRA (variante LoRA+) y posteriormente se fusionó con los pesos originales.

La arquitectura, la configuración, el tokenizador y la plantilla de chat son idénticos al modelo base Qwen3.5-0.8B; solo se modificaron los pesos de las capas lineales que procesan texto. El modelo cuenta con 873.438.784 parámetros y se distribuye en formato safetensors bajo licencia Apache-2.0. Está etiquetado exclusivamente para japonés y su pipeline no está declarado en la ficha de Hugging Face.

Su relevancia es acotada: se trata de un experimento de ajuste fino orientado a una tarea muy concreta (RAG con citación de fuentes) sobre un modelo pequeño, con cero descargas y cero likes en el momento de la consulta. Resulta útil como referencia para quien quiera replicar la técnica RAFT (Retrieval-Augmented Fine-Tuning) en modelos de menos de mil millones de parámetros y en idioma japonés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3.5-0.8B; no se detalla en la informacion disponible) |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | japones (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B (revision 2fc06364715b967f1860aea9cf38778875588b17) y conserva su arquitectura, configuración, tokenizador y plantilla de chat sin cambios. El ajuste se aplicó con LoRA en su variante LoRA+ sobre las capas lineales que procesan texto y, posteriormente, los pesos adaptados se fusionaron en los pesos originales. Segun la model card, tras el entrenamiento la diferencia respecto a los pesos originales se escaló a 0,1 (nuevos pesos = original + 0,2 × (entrenado − original)), lo que suaviza el efecto del ajuste y reduce el riesgo de degradar capacidades generales del modelo base.

El entrenamiento siguió el formato de Retrieval-Augmented Fine-Tuning (RAFT): el modelo aprende a responder a partir de tres documentos recuperados, devolviendo una respuesta breve y el chunk_id de la evidencia en JSON. Los datos provienen de cl-nagoya/auto-wiki-qa (CC BY-SA 4.0) y de un conjunto de fragmentos distribuidos derivados de Wikipedia en japonés (CC BY-SA 4.0). El filtrado fue mecánico: se conservaron únicamente los ejemplos en los que la cadena de respuesta correcta aparecía entre los tres fragmentos recuperados, junto con filtros de longitud, pertenencia al corpus y deduplicación. No se menciona en la información disponible el uso de RLHF, DPO ni de técnicas de decodificación especulativa.

## Capacidades

- Generación de respuestas cortas condicionadas a contexto recuperado (tres documentos de entrada).
- Citación de fuentes mediante la devolución del chunk_id del fragmento que respalda la respuesta.
- Salida estructurada en JSON con respuesta y evidencia.
- Comprensión lectora en japonés sobre textos de Wikipedia.
- Reutilización de la plantilla de chat y el tokenizador del modelo base Qwen3.5-0.8B.
- No se documenta en la información disponible soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Generación de respuestas con citación en un pipeline RAG japonés: el modelo recibe los tres fragmentos recuperados por el retriever y devuelve un JSON con la respuesta y el chunk_id de evidencia, lo que permite mostrar la fuente al usuario final.
- Asistentes de documentación interna en japonés: integrado en un buscador corporativo, responde preguntas sobre manuales o políticas citando el fragmento exacto que respalda cada afirmación.
- Verificación de respuestas automatizada: al devolver el identificador de la evidencia, un sistema posterior puede comprobar que la respuesta está anclada en el corpus y descartar salidas sin respaldo.
- Evaluación de retrievers: al fijar el modelo de generación, se puede medir la calidad del recuperador según la frecuencia con la que la respuesta correcta aparece entre los tres fragmentos proporcionados.
- Prototipado de bajo coste: con menos de mil millones de parámetros, es viable ejecutarlo en hardware modesto para validar arquitecturas RAG antes de escalar a modelos mayores.
- Base para nuevos ajustes RAFT en japonés: sirve como punto de partida para experimentos de ajuste fino con citación de fuentes sobre dominios específicos, dado que conserva la estructura del modelo base.
- Filtrado de respuestas sin fundamento: en flujos de atención al cliente en japonés, el JSON de salida permite descartar respuestas cuyo chunk_id no corresponda a un documento válido del corpus.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 873 millones de parámetros, en fp16 se requieren aproximadamente 1,7 GB solo para los pesos; en cuantización de 8 bits, alrededor de 0,9 GB; en 4 bits, en torno a 0,5 GB. El consumo real debe sumar la caché KV, cuyo tamano depende de la longitud de contexto, dato no disponible.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM es suficiente en cuantizaciones bajas; para fp16 se recomienda una GPU con 8 GB o más (RTX 3060 Ti, RTX 4060, RTX 4090, A100, H100).
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 6-8 GB de VRAM o más, en función de la cuantización y de la longitud de contexto utilizada.
- Opciones de despliegue: los pesos se publican en safetensors, por lo que se puede servir con vLLM, TGI o transformers; para cuantización en CPU o GPU de gama baja sería necesario convertir los pesos a GGUF para llama.cpp u Ollama, conversión no incluida en el repositorio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| momo0729/qwen3.5-0.8b-raft | 873.438.784 | no disponible | RAG con citacion en japones | Apache-2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-0.8B (modelo base) | no disponible en la informacion proporcionada | no disponible | Generacion general | Apache-2.0 | Hugging Face |
| Alternativas de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion documentada es con el modelo base Qwen3.5-0.8B, del que hereda arquitectura y licencia. No se dispone de datos de rendimiento de ninguno de los dos en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para japonés; su rendimiento en castellano u otros idiomas no está documentado y previsiblemente será deficiente.
- Está especializado en una tarea muy concreta (respuesta corta con citación sobre tres fragmentos); fuera de ese formato su comportamiento puede degradarse respecto al modelo base.
- Riesgo de alucinación: aunque el entrenamiento exige devolver un chunk_id de evidencia, no hay garantía de que la respuesta esté realmente respaldada por el fragmento citado; se recomienda validación posterior.
- El escalado del delta de ajuste a 0,1 reduce la intensidad del entrenamiento, lo que puede limitar la adherencia al formato JSON en casos límite.
- No se documentan sesgos conocidos, pero al derivar de Wikipedia en japonés puede heredar los sesgos de cobertura y sesgo editorial de esa fuente.
- Los datos de entrenamiento incluyen material bajo CC BY-SA 4.0 (cl-nagoya/auto-wiki-qa y fragmentos de Wikipedia); aunque los pesos se publican como Apache-2.0, conviene revisar las obligaciones de atribución si se redistribuye el modelo o se usa en producción.
- No hay datos publicados de benchmarks, latencia ni throughput, ni descargas o validación por parte de la comunidad (0 descargas, 0 likes), por lo que su calidad en producción no está contrastada.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/momo0729/qwen3.5-0.8b-raft
- Modelo base Qwen/Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset cl-nagoya/auto-wiki-qa: https://huggingface.co/datasets/cl-nagoya/auto-wiki-qa
