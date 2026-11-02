# imagent/siglip2-so400m-384-onnx

## Resumen

SigLIP 2 so400m-patch16-384 (ONNX) es una exportación del modelo multimodal de visión-lenguaje SigLIP 2 desarrollado por Google, empaquetada en formato ONNX para su uso en el ecosistema Imagent. El repositorio contiene dos grafos independientes, `vision.onnx` y `text.onnx`, que codifican imágenes y texto respectivamente en un espacio de embeddings compartido, lo que permite tareas de recuperación imagen-texto, clasificación zero-shot y extracción de características. La exportación corre en fp16 con entradas y salidas fp32, y se generó a partir del checkpoint `google/siglip2-so400m-patch16-384` en el commit `dd658faac399427308559e2c3ac1e99cbe43845d`.

El modelo emplea una arquitectura de tipo dual encoder (torre de visión y torre de texto) con parches de 16x16 y resolución de entrada de 384x384 píxeles. Con aproximadamente 400 millones de parámetros en la variante "so400m", está pensado para extracción de características y búsqueda semántica multimodal más que para generación de texto. La relevancia de esta ficha radica en que ofrece una versión ONNX lista para desplegar en entornos con runtime ONNX (ONNX Runtime, etc.), sin depender de PyTorch, lo que facilita su integración en servicios de producción con requisitos de latencia y portabilidad.

La licencia es Apache 2.0, heredada del modelo original de Google, lo que permite uso comercial con atribución. El repositorio ocupa 2,3 GB y no registra descargas ni likes en el momento de la consulta. No se dispone de información sobre idiomas soportados más allá de lo que implica el tokenizador Gemma utilizado por SigLIP 2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dual encoder (torre de visión + torre de texto), transformer con patch embedding 16x16 |
| Parametros totales | Aproximadamente 400M (variante so400m); no se detalla el desglose exacto por torre |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de embeddings, no generativo) |
| Tipos de cuantizacion | Pesos en fp16; entradas y salidas fp32. No se documentan otras cuantizaciones |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`vision.onnx`, `text.onnx`), más `vocab.json` y `parity.json` |

## Arquitectura y entrenamiento

SigLIP 2 es una evolución de la familia SigLIP de Google, que sustituye la pérdida contrastiva softmax por una pérdida sigmoide por pares, lo que permite entrenar con lotes más grandes y mejora la calidad de los embeddings imagen-texto. La variante so400m-patch16-384 utiliza parches de 16x16 sobre imágenes de 384x384 y una torre de texto basada en el tokenizador de Gemma. El modelo original fue entrenado por Google; esta exportación no aporta información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO, por lo que esos datos deben consultarse en la documentación oficial de SigLIP 2.

La innovación técnica de esta exportación concreta es la separación en dos grafos ONNX independientes (visión y texto) con pesos en fp16 y E/S en fp32, verificados contra el modelo de referencia mediante `parity.json`, que contiene ids de tokens y embeddings de texto para comprobar la paridad de implementaciones alternativas. El script `export_siglip.py` incluido en el repositorio documenta las entradas y salidas de cada grafo y valida cada uno contra su fuente antes de escribirlo. No se mencionan técnicas como decodificación especulativa o atención lineal, ya que no es un modelo generativo.

## Capacidades

- Extracción de características de imágenes y de texto en un espacio de embeddings compartido.
- Recuperación imagen-texto (búsqueda semántica, image retrieval y text-to-image retrieval).
- Clasificación zero-shot de imágenes mediante comparación de embeddings con prompts de texto.
- Similitud imagen-texto para filtrado, deduplicación y moderación de contenido visual.
- Procesamiento por lotes con ONNX Runtime, adecuado para pipelines de inferencia.
- Tokenización de texto compatible con el tokenizador de Gemma, con lower-casing ASCII tal como se entrenó SigLIP 2.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso, al no ser un modelo generativo.
- Capacidades multilingües: no documentadas en la información disponible.

## Casos de uso

- Búsqueda semántica de imágenes en catálogos: indexar los embeddings de `vision.onnx` de un catálogo de productos y consultar con embeddings de `text.onnx` para recuperar las imágenes más similares a una descripción textual, sin necesidad de etiquetas manuales.
- Moderación de contenido visual: comparar embeddings de imágenes subidas por usuarios con prompts de texto que describan categorías prohibidas y aplicar umbrales de similitud para el filtrado automático.
- Deduplicación de imágenes en repositorios grandes: calcular embeddings con la torre de visión y agrupar por distancia coseno para eliminar duplicados y near-duplicates en datasets de entrenamiento.
- Clasificación zero-shot en pipelines de etiquetado: usar la torre de texto para generar embeddings de las etiquetas de clase y asignar a cada imagen la etiqueta con mayor similitud, útil cuando no hay datos etiquetados.
- Búsqueda multimodal en aplicaciones de archivo y documentación: permitir consultas en lenguaje natural sobre repositorios de imágenes o capturas, con la ventaja de que el formato ONNX se integra en servicios sin PyTorch.
- Sistemas de recomendación visual: combinar embeddings de imagen y de texto para calcular afinidad entre el contenido visual y las preferencias expresadas textualmente por el usuario.
- Despliegue en entornos con runtime ONNX: al estar exportado a ONNX con E/S fp32, se puede servir con ONNX Runtime en CPU o GPU sin dependencias de PyTorch, lo que simplifica la portabilidad entre plataformas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni de recuperación imagen-texto; solo `parity.json` para verificar la equivalencia numérica con el modelo de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos suman aproximadamente 2,27 GB en fp16 (857 MB para `vision.onnx` y 1,42 GB para `text.onnx`), más el overhead de activaciones y del runtime ONNX. Se estima un consumo de VRAM en torno a 3-5 GB en fp16, aunque no se proporciona una cifra oficial.
- GPU recomendadas: no se especifican. Por tamaño, cabe en GPUs de consumo como RTX 3060 (12 GB), RTX 4070, RTX 4090, y en GPUs de datacenter como A100 o H100 para despliegues de alto throughput.
- Cabe en GPU de consumo: sí, dado el tamaño de los pesos en fp16.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), y cualquier runtime compatible con ONNX. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| imagent/siglip2-so400m-384-onnx | ~400M | No aplica | ONNX (fp16) | Apache 2.0 | HuggingFace |
| google/siglip2-so400m-patch16-384 | ~400M | No aplica | PyTorch (safetensors) | Apache 2.0 | HuggingFace |
| CLIP ViT-L/14 | ~428M | No aplica | PyTorch | MIT (variante OpenAI) | HuggingFace |
| SigLIP original so400m | ~400M | No aplica | PyTorch | Apache 2.0 | HuggingFace |

La comparativa se limita a datos de arquitectura y licencia; no se dispone de métricas de rendimiento comparadas en la información proporcionada.

## Limitaciones y advertencias

- Al ser un modelo de embeddings y no generativo, no puede usarse para chat, generación de código ni razonamiento; cualquier uso en esos escenarios es inadecuado.
- Riesgo de sesgos heredados del dataset de entrenamiento original de SigLIP 2, no documentados en esta exportación.
- La paridad numérica está verificada con `parity.json`, pero pequeñas diferencias de implementación en el tokenizador o en el preprocesado de imágenes pueden degradar la calidad de los embeddings.
- El lower-casing ASCII del texto debe replicarse exactamente como en el modelo original; un preprocesado distinto puede alterar los resultados.
- No se documentan los idiomas soportados, por lo que el rendimiento multilingüe es incierto.
- La licencia Apache 2.0 permite uso comercial, pero requiere atribución a Google como autor del modelo original; el repositorio indica explícitamente que se cite su trabajo y no este repo.
- No hay información sobre latencia, throughput ni requisitos oficiales de hardware, lo que obliga a validar el rendimiento en el entorno de destino antes de producción.
- El repositorio no registra descargas ni likes, por lo que no hay evidencia de uso en producción ni de mantenimiento continuo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/imagent/siglip2-so400m-384-onnx
- Modelo original de Google: https://huggingface.co/google/siglip2-so400m-patch16-384
- Organización Imagent: https://huggingface.co/imagent
- Commit de referencia: `dd658faac399427308559e2c3ac1e99cbe43845d`
