# q81801/WeVisOne-VL-2B-GGUF

## Resumen

WeVisOne-VL-2B es un modelo vision-language de 2.034.787.328 parámetros orientado a *visual grounding*, es decir, a localizar mediante cajas delimitadoras los objetos descritos en lenguaje natural dentro de una imagen. El modelo original lo desarrolla Tencent bajo licencia Apache 2.0 y esta ficha documenta la versión cuantizada en GGUF publicada por el usuario q81801, pensada para ejecutarse localmente con llama.cpp y llama-server.

El repositorio incluye dos recetas de cuantización del cuerpo del modelo (UD-IQ4_XS y UD-Q4_K_XL) más un proyector visual independiente en Q8_0. La cuantización se ha realizado con imatrix calibrada sobre COCO val2017, protegiendo los embeddings de tokens y la capa de salida en q6_k, ya que el modelo original no comparte pesos entre ambas.

Su relevancia práctica es que permite desplegar un detector guiado por texto en hardware modesto: el fichero principal ocupa 1,27 GB en IQ4_XS y 1,39 GB en Q4_K_XL, con un proyector visual de 442 MB. La model card reporta una IoU emparejada de 0,872 (IQ4_XS) y 0,929 (Q4_K_XL) frente al original en F16 sobre 50 imágenes de COCO, con 10/10 aciertos en el conjunto de rechazo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language para grounding (detalle del backbone no disponible) |
| Parámetros totales | 2.034.787.328 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | UD-IQ4_XS, UD-Q4_K_XL (cuerpo); Q8_0 (proyector visual mmproj) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo original (tencent/WeVisOne-VL-2B) en la información proporcionada. Por el pipeline declarado (image-text-to-text) y por la presencia de un proyector visual separado (mmproj), se trata de un modelo multimodal con un codificador de imagen conectado a un modelo de lenguaje mediante una proyección, y con una cabeza específica de predicción de cajas delimitadoras.

El detalle técnico más relevante documentado es el proceso de cuantización: se empleó una matriz de importancia (imatrix) calibrada con COCO val2017, se protegieron los embeddings de tokens y la capa de salida en q6_k (el original no ata los pesos de embedding y salida, por lo que ambas capas requieren protección) y la receta por tensor de UD-Q4_K_XL se alineó con la variante XL oficial de Unsloth para la misma arquitectura. El proyector visual se cuantizó por separado en Q8_0 y es compartido por ambas recetas. No se han publicado datos sobre volumen de tokens de entrenamiento, composición del dataset ni uso de RLHF o DPO.

Una limitación estructural importante: el decodificador de píxeles (mask_decoder) del modelo original no está incluido en el GGUF, por lo que esta versión solo puede producir cajas, no máscaras de segmentación.

## Capacidades

- Localización visual guiada por texto (*visual grounding*): devuelve cajas delimitadoras para los objetos descritos en una instrucción en inglés.
- Detección de múltiples instancias de una misma categoría en una imagen.
- Rechazo explícito: cuando el objeto descrito no existe en la imagen, el modelo debe emitir `<box>none</box>`.
- Conversación multimodal de un turno con imagen y texto (pipeline image-text-to-text).
- Inferencia local mediante llama.cpp y llama-server con decodificación greedy.
- No soporta segmentación ni generación de máscaras (el mask_decoder no está en el GGUF).
- No hay información disponible sobre tool calling, razonamiento multi-paso, agentes ni otras capacidades adicionales.

## Casos de uso

- Anotación semiautomática de datasets: dado un conjunto de imágenes y una lista de categorías, el modelo genera cajas candidatas que un humano revisa, reduciendo el coste de etiquetado frente a la anotación manual desde cero.
- Búsqueda visual por descripción en catálogos: integrar el modelo en un pipeline que, dada una consulta textual en inglés, localice el producto o elemento correspondiente en la imagen y devuelva su región para recorte o inspección posterior.
- Verificación de presencia de objetos: usar la salida `<box>none</box>` como señal de rechazo en controles de calidad (por ejemplo, comprobar que un artículo esperado aparece en una foto de inventario) sin necesidad de un clasificador adicional.
- Preprocesado para OCR o pipelines downstream: localizar primero la región de interés (un cartel, una matrícula, un documento) y pasar el recorte a un modelo especializado, aprovechando el bajo coste de ejecución del modelo de 2B.
- Prototipado en estaciones de trabajo sin GPU de datacenter: al ocupar 1,27-1,39 GB en GGUF, cabe en equipos de consumo y permite iterar sobre prompts de localización sin coste de API.
- Robótica educativa y experimentación: generar coordenadas de objetos en la escena para tareas de manipulación simple, aceptando la limitación de que solo se obtienen cajas y no máscaras.
- Filtrado previo en moderación de imágenes: localizar regiones que coincidan con una descripción para su revisión humana, con la ventaja de que el rechazo explícito evita falsos positivos cuando el objeto no está presente.

## Benchmarks y rendimiento

Resultados reportados por el autor del repositorio GGUF, medidos sobre 50 imágenes de COCO más 10 imágenes de rechazo, con el mismo protocolo y comparados contra el original en F16. Prompt oficial: `Locate all the instances that match the following description: <categoría>.`, decodificación greedy y repeat penalty 1.05.

| Modelo / receta | IoU emparejada | Rechazo correcto | Tamaño del fichero |
|---|---|---|---|
| UD-IQ4_XS | 0,872 | 10/10 | 1.268.147.840 bytes |
| UD-Q4_K_XL | 0,929 | 10/10 | 1.387.472.512 bytes |
| Original F16 (referencia) | Base de comparación | No disponible | No disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1,7-1,9 GB con UD-IQ4_XS (1,27 GB de cuerpo + 442 MB de proyector visual) y en torno a 1,8-2,0 GB con UD-Q4_K_XL, más el overhead del contexto y de llama.cpp.
- Cabe holgadamente en GPU de consumo: RTX 3060 12 GB, RTX 4060 8 GB, RTX 4070, RTX 4090, así como en iGPU con memoria unificada suficiente.
- GPU de datacenter (A100, H100) no necesarias para este tamaño; su uso solo se justificaría por volumen de peticiones.
- Despliegue mediante llama.cpp y llama-server; requiere cargar el fichero GGUF del cuerpo y el mmproj Q8_0 por separado. Otros runners (vLLM, TGI, Ollama) no están documentados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| WeVisOne-VL-2B (este GGUF) | 2,03 B | No disponible | Visual grounding (cajas) | Apache 2.0 | GGUF |
| tencent/WeVisOne-VL-2B (original) | 2,03 B | No disponible | Visual grounding + segmentación | Apache 2.0 | Safetensors |
| Otros modelos de grounding de ~2B | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación más directa es con el modelo original, del que esta versión es una cuantización: el original incluye el mask_decoder y por tanto soporta segmentación, mientras que el GGUF solo produce cajas. No se dispone de datos sobre alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- No realiza segmentación ni generación de máscaras: el mask_decoder del modelo original no está incluido en el GGUF.
- Solo soporta inglés; el prompt de localización debe formularse en ese idioma.
- El rechazo depende de que el modelo emita exactamente `<box>none</box>`; conviene validar el formato en producción.
- UD-Q4_K_XL obtiene mejor IoU (0,929 frente a 0,872), pero el autor señala una consistencia ligeramente menor en el número de cajas emitidas respecto a IQ4_XS.
- La cuantización introduce degradación respecto al F16 original; los valores de IoU reportados son del autor y no han sido verificados de forma independiente.
- Riesgo de alucinación de cajas en imágenes ambiguas o con categorías poco representadas en COCO, el conjunto de calibración.
- No se han publicado datos sobre sesgos del modelo base ni sobre su comportamiento fuera del dominio de COCO.
- Licencia Apache 2.0 en el modelo base y en esta cuantización, lo que permite uso comercial; aun así, conviene revisar las condiciones del modelo original de Tencent por si hubiera términos adicionales.
- Longitud de contexto no documentada: no se debe asumir una ventana amplia para prompts largos o múltiples imágenes.

## Enlaces

- Repositorio GGUF: https://huggingface.co/q81801/WeVisOne-VL-2B-GGUF
- Modelo base: https://huggingface.co/tencent/WeVisOne-VL-2B
- llama.cpp: https://github.com/ggml-org/llama.cpp
