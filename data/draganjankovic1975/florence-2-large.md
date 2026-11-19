# draganjankovic1975/Florence-2-large

## Resumen

Florence-2-large es un modelo fundacional de visión desarrollado por Microsoft Research, presentado en el informe técnico arXiv:2311.06242. Este repositorio concreto (`draganjankovic1975/Florence-2-large`) es un espejo (mirror) del modelo original `microsoft/Florence-2-large`, con licencia MIT y todos los créditos al autor original. Se trata de una versión con preentrenamiento continuado sobre 4k de longitud de contexto y aproximadamente 0,1B de muestras adicionales, según indica la propia model card.

El modelo aborda el problema de unificar múltiples tareas de visión y visión-lenguaje bajo una única arquitectura secuencia-a-secuencia guiada por prompts textuales. En lugar de disponer de cabezales específicos por tarea, Florence-2 interpreta instrucciones como `<OD>`, `<CAPTION>` o `<CAPTION_TO_PHRASE_GROUNDING>` y genera la salida correspondiente en formato texto estructurado. Esta aproximación permite cubrir detección de objetos, segmentación, captioning, OCR y grounding con un solo conjunto de pesos.

Con 776,7 millones de parámetros (0,77B) y un repositorio de 3,1 GB en formato safetensors, Florence-2-large se posiciona como un modelo de tamaño medio que cabe en GPUs de consumo y ofrece una alternativa práctica a pipelines especializados. Su relevancia actual radica en la versatilidad multitarea y en la posibilidad de ejecutarlo localmente con cuantización, aunque esta copia concreta presenta particularidades (preentrenamiento continuado parcial y modificación del separador de línea en OCR) que conviene tener en cuenta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer secuencia-a-secuencia (encoder-decoder) multimodal, implementación `transformers` con `trust_remote_code` |
| Parametros totales | 776.721.497 (0,77B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4k tokens (versión con preentrenamiento continuado según model card) |
| Tipos de cuantizacion | No disponible en la información proporcionada (pesos entrenados en float16) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors, PyTorch |

## Arquitectura y entrenamiento

Florence-2 emplea una arquitectura secuencia-a-secuencia que combina un encoder visual (basado en DaViT, según el informe técnico referenciado) con un decoder de lenguaje, tratando las tareas de visión como problemas de generación de texto. El modelo se entrena sobre FLD-5B, un dataset de 5.400 millones de anotaciones sobre 126 millones de imágenes, lo que permite el aprendizaje multitarea mediante prompts. Todos los pesos se entrenaron en float16.

Esta copia concreta corresponde a un preentrenamiento continuado sobre 4k de contexto con aproximadamente 0,1B de muestras, lo que, según la propia model card, implica que "podría no estar bien entrenada". Además, la tarea de OCR se ha actualizado para incluir un separador de línea (`\n`), y se reporta un COCO OD AP de 39,8. No se dispone de información sobre el uso de RLHF o DPO en esta variante.

## Capacidades

- Generación de texto descriptivo a partir de imágenes (captioning simple, detallado y muy detallado).
- Detección de objetos (`<OD>`) con salida de bounding boxes y etiquetas.
- Grounding de frases a partir de un caption (`<CAPTION_TO_PHRASE_GROUNDING>`), devolviendo bboxes y etiquetas.
- OCR con separador de línea actualizado en esta versión.
- Segmentación y otras tareas de visión soportadas mediante prompts específicos.
- Ejecución zero-shot y ajuste fino sobre tareas downstream.
- Procesamiento multimodal imagen-texto a texto (pipeline `image-text-to-text`).
- No se documenta soporte de tool calling, agentes ni razonamiento multi-paso en la información disponible.

## Casos de uso

- Anotación automática de datasets de visión: usar `<OD>` para generar bounding boxes y etiquetas sobre imágenes nuevas, acelerando el etiquetado previo a revisión humana.
- Accesibilidad y descripción de imágenes: emplear `<DETAILED_CAPTION>` o `<MORE_DETAILED_CAPTION>` para generar texto alternativo en aplicaciones web o lectores de pantalla.
- Digitalización de documentos con OCR: extraer texto de imágenes respetando saltos de línea gracias al separador `\n` incorporado en esta versión.
- Búsqueda visual y grounding: combinar `<CAPTION_TO_PHRASE_GROUNDING>` con un caption generado para localizar objetos descritos en lenguaje natural dentro de la imagen.
- Moderación y análisis de contenido visual: detectar objetos y regiones concretas en imágenes subidas por usuarios antes de su publicación.
- Prototipado de pipelines de visión en local: al ser un modelo de 0,77B, puede desplegarse en una GPU de consumo para experimentación sin depender de APIs externas.
- Preprocesado para sistemas de inspección: detección de objetos en imágenes industriales como paso previo a clasificadores especializados.

## Benchmarks y rendimiento

La información proporcionada solo incluye el dato de COCO OD AP de 39,8 para esta versión con preentrenamiento continuado. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks comparativos.

| Benchmark | Resultado |
|---|---|
| COCO Object Detection AP | 39,8 |

## Requisitos de hardware

- VRAM estimada en float16: en torno a 1,6 GB solo para pesos; con overhead de activaciones y procesador, se recomienda al menos 4-6 GB de VRAM para inferencia cómoda.
- GPU recomendadas: cualquier GPU con 8 GB o más (RTX 3060, RTX 4060, RTX 4090), así como A100/H100 para despliegues de mayor throughput.
- Cabe en GPU de consumo: sí, en modelos con 6-8 GB de VRAM en float16; en cuantización de 8 bits o inferior cabría en GPUs con 4 GB.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (método documentado), y potencialmente vLLM o TGI si soportan la arquitectura; llama.cpp/Ollama requerirían conversión a GGUF, no documentada en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Florence-2-large (esta copia) | 0,77B | 4k | MIT | Hugging Face |
| Florence-2-base | 0,23B | No disponible | MIT | Hugging Face |
| Florence-2-large-ft | 0,77B | No disponible | MIT | Hugging Face (ajustado en downstream) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada, salvo el COCO OD AP de 39,8 de esta copia.

## Limitaciones y advertencias

- Esta copia es un mirror no oficial; para producción se recomienda usar `microsoft/Florence-2-large` como referencia canónica.
- El preentrenamiento continuado solo usó 0,1B de muestras y la model card advierte que "podría no estar bien entrenada".
- La modificación del OCR con separador de línea puede alterar el formato de salida respecto al modelo original.
- Riesgo de alucinación en captions y etiquetas de detección, especialmente en imágenes fuera de distribución.
- No se documentan sesgos específicos ni cobertura idiomática; los idiomas soportados figuran como no disponibles.
- La licencia MIT permite uso comercial, pero conviene verificar la licencia del modelo original de Microsoft.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del repositorio; auditar antes de desplegar.
- El contexto de 4k puede limitar tareas con muchas anotaciones o imágenes de alta resolución con muchos objetos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/draganjankovic1975/Florence-2-large
- Modelo original: https://huggingface.co/microsoft/Florence-2-large
- Informe técnico: https://arxiv.org/abs/2311.06242
- Notebook de inferencia y visualización: https://huggingface.co/microsoft/Florence-2-large/blob/main/sample_inference.ipynb
- Licencia original: https://huggingface.co/microsoft/Florence-2-large/resolve/main/LICENSE
