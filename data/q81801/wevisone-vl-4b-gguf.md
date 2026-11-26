# q81801/WeVisOne-VL-4B-GGUF

## Resumen

WeVisOne-VL-4B-GGUF es una cuantización en formato GGUF del modelo de visión-lenguaje tencent/WeVisOne-VL-4B, orientada a *visual grounding* (localización de objetos mediante cajas delimitadoras). El repositorio lo publica el usuario q81801 como archivo de los pesos cuantizados para su ejecución local con llama.cpp y llama-server, no como un modelo nuevo. El modelo base, de Tencent, se distribuye bajo licencia Apache 2.0 y está especializado en tareas de detección y localización visual a partir de descripciones en lenguaje natural.

La relevancia de esta ficha radica en que permite ejecutar un modelo de grounding visual en hardware de consumo sin depender de GPUs de datacenter. El paquete incluye dos artefactos: el modelo principal cuantizado con la receta UD-IQ4_XS (2,59 GB) y el proyector visual mmproj en Q8_0 (450 MB). Según el autor, la cuantización mantiene un IoU emparejado de 0,963 frente al original en F16 sobre 50 imágenes de COCO val2017, con una tasa de rechazo de 10/10 en imágenes sin el objeto solicitado.

El modelo es monolingüe en inglés según su model card, trabaja en pipeline image-text-to-text y no incluye el decodificador de máscaras del original, por lo que solo produce cajas, no segmentaciones. El número de parámetros reportado en safetensors (415.347.712) corresponde presumiblemente al proyector visual o a una parte de los pesos, no al total del modelo de 4B que indica su nombre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje para *visual grounding* (modelo base tencent/WeVisOne-VL-4B; detalles internos no disponibles) |
| Parametros totales | 415.347.712 según safetensors (el nombre indica 4B; dato no coincidente, no disponible el desglose) |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF UD-IQ4_XS (modelo principal), Q8_0 (proyector visual mmproj); embeddings y capa de salida protegidos en q6_k |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base tencent/WeVisOne-VL-4B en la documentación proporcionada. Por la naturaleza de la tarea (image-text-to-text con salida de cajas delimitadoras) y el pipeline declarado, se trata de un modelo de visión-lenguaje que combina un codificador visual con un modelo de lenguaje y un proyector multimodal (mmproj). El repositorio cuantizado separa explícitamente el proyector visual en un archivo independiente, práctica habitual en llama.cpp para modelos multimodales.

El proceso de cuantización sí está documentado: el autor aplica cuantización con importancia ponderada mediante imatrix, calibrada con COCO val2017, y protege tanto los *token embeddings* como la capa de salida en q6_k, dado que el modelo original no comparte (no ata) los embeddings de entrada y salida. El proyector visual se cuantiza por separado en Q8_0. No se dispone de datos sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base.

## Capacidades

- Localización visual (*visual grounding*): genera cajas delimitadoras para instancias que coinciden con una descripción textual, usando el formato de prompt `Locate all the instances that match the following description: <clase>.`
- Detección de objetos guiada por lenguaje natural, con soporte para múltiples instancias por imagen.
- Mecanismo de rechazo: cuando el objeto solicitado no está presente, el modelo debe emitir `<box>none</box>`, lo que permite filtrar falsos positivos.
- Procesamiento image-text-to-text: acepta una imagen y una instrucción textual y devuelve una respuesta estructurada con coordenadas.
- Ejecución local mediante llama.cpp y llama-server, con soporte del proyector multimodal separado (mmproj).
- No soporta segmentación ni generación de máscaras: el decodificador de píxeles (mask_decoder) del modelo original no está incluido en el GGUF.

## Casos de uso

- Anotación asistida de datasets: el modelo puede preetiquetar cajas delimitadoras sobre imágenes nuevas usando descripciones de clase, reduciendo el trabajo manual en pipelines de etiquetado; su IoU de 0,963 frente al original en F16 lo hace adecuado como primer paso de anotación con revisión humana.
- Moderación de contenido visual: dada una descripción de objeto o elemento no permitido, el modelo localiza instancias en la imagen y permite decidir si se requiere revisión; el mecanismo `<box>none</box>` ayuda a distinguir ausencias reales.
- Automatización de inventario y logística: localización de productos o embalajes en fotografías de almacén mediante prompts por categoría, ejecutable en hardware local sin enviar imágenes a la nube.
- Robótica y visión embebida: integración en flujos donde se necesita localizar objetos descritos en lenguaje natural antes de un agarre o manipulación, aprovechando el reducido tamaño de la cuantización (2,59 GB).
- Búsqueda visual en catálogos: localizar un artículo concreto dentro de una imagen de escaparate o estantería a partir de una descripción textual, útil en comercio electrónico y aplicaciones de comparación visual.
- Control de calidad en imágenes industriales: verificación de presencia y posición de componentes descritos por texto, con despliegue local en llama-server para evitar dependencias de servicios externos.
- Asistencia a personas con discapacidad visual: localización de objetos solicitados verbalmente en una imagen capturada, con respuesta en forma de coordenadas que un sistema de síntesis puede describir.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son los del autor de la cuantización, medidos sobre 50 imágenes de COCO val2017 más 10 imágenes de rechazo, con decodificación greedy y repeat penalty de 1,05, comparando contra el original en F16:

| Metrica | UD-IQ4_XS | Original F16 |
|---|---|---|
| IoU emparejado | 0,963 | Referencia |
| Tasa de rechazo (objetos ausentes) | 10/10 | No disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, RefCOCO, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el modelo principal ocupa 2,59 GB y el proyector visual 450 MB, por lo que la inferencia completa requiere aproximadamente 3,1 GB de pesos, más el espacio de contexto y activaciones (estimación práctica de 4-6 GB en total según longitud de contexto).
- GPU recomendadas: cualquier GPU con 6 GB o más de VRAM; tarjetas de consumo como RTX 3060, RTX 4060, RTX 4070 o superiores son suficientes. Para mayor throughput, A100 o H100 no son necesarias dado el tamaño.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 6 GB o más; también puede ejecutarse en CPU con llama.cpp, a costa de mayor latencia.
- Opciones de despliegue: llama.cpp y llama-server (soporte nativo del formato y del mmproj separado). Otros motores como vLLM u Ollama no están confirmados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| WeVisOne-VL-4B-GGUF | 4B (nombre; safetensors reporta 415M) | No disponible | Visual grounding (solo cajas) | Apache 2.0 | GGUF |
| tencent/WeVisOne-VL-4B (original) | 4B | No disponible | Visual grounding + segmentación (mask_decoder) | Apache 2.0 | Safetensors |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre modelos comparables de la misma categoría y tamaño en la documentación proporcionada.

## Limitaciones y advertencias

- No realiza segmentación ni generación de máscaras: el decodificador de píxeles del modelo original no está incluido en el GGUF; solo produce cajas delimitadoras.
- Modelo monolingüe en inglés: los prompts deben formularse en inglés para un funcionamiento fiable.
- Riesgo de alucinación: aunque el autor reporta una tasa de rechazo de 10/10 en su conjunto de prueba, no se han publicado evaluaciones independientes sobre la fiabilidad del mecanismo `<box>none</box>` en dominios diversos.
- La cuantización introduce una pérdida mínima según el autor (IoU 0,963 frente a F16), pero las métricas se limitan a 50 imágenes de COCO val2017 y no cubren otros dominios ni condiciones de iluminación u oclusión extremas.
- Discrepancia en el recuento de parámetros: el nombre indica 4B pero safetensors reporta 415.347.712; conviene verificar el desglose antes de planificar despliegues.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria de la calidad de la cuantización.
- Licencia Apache 2.0 permite uso comercial, pero debe respetarse la atribución y las condiciones del modelo base.
- No hay información sobre sesgos del modelo base ni sobre su comportamiento en poblaciones o escenas poco representadas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/q81801/WeVisOne-VL-4B-GGUF
- Modelo base: https://huggingface.co/tencent/WeVisOne-VL-4B
