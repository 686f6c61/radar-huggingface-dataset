# jeallyhe/Florence-2-large-ft

## Resumen

Florence-2-large-ft es un modelo de visión por computadora desarrollado por Microsoft, publicado originalmente como parte de la familia Florence-2. Se trata de un modelo de tipo secuencia a secuencia (sequence-to-sequence) que unifica una amplia variedad de tareas de visión y lenguaje mediante prompts de texto. El modelo interpreta instrucciones como `<CAPTION>`, `<OD>` o `<OCR>` para generar descripciones, detectar objetos o extraer texto, entre otras funciones. Con 770 millones de parámetros, es la versión finetuned de Florence-2-large, entrenada sobre un conjunto de tareas downstream para mejorar su rendimiento como modelo generalista.

La relevancia actual de Florence-2-large-ft radica en que ofrece una alternativa de código abierto (licencia MIT) para integrar múltiples capacidades de visión en un solo pipeline, reduciendo la necesidad de entrenar o desplegar varios modelos especializados. Su arquitectura basada en transformer y su entrenamiento con el dataset FLD-5B (5.4 mil millones de anotaciones en 126 millones de imágenes) lo posicionan como una opción competitiva para aplicaciones de visión en producción. La versión finetuned aquí presentada es una réplica del modelo original de Microsoft, publicada por el usuario jeallyhe en HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sequence-to-sequence (transformer) |
| Parametros totales | 770.430.041 (0,77B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (entrenado en float16; se puede usar float16 o float32) |
| Idiomas soportados | No especificado (multilingue por diseño, pero sin lista oficial) |
| Licencia | MIT |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

Florence-2-large-ft emplea una arquitectura sequence-to-sequence basada en transformer, donde el encoder procesa la imagen (via un vision transformer) y el decoder genera las respuestas en forma de texto. El modelo se entrena con el dataset FLD-5B, que contiene 5.4 mil millones de anotaciones de diversa naturaleza (captions, bounding boxes, segmentaciones, etc.) sobre 126 millones de imágenes. La version finetuned (large-ft) se ajusta sobre un conjunto de tareas downstream para convertirse en un modelo generalista, capaz de resolver tareas como captioning, deteccion de objetos, OCR y region grounding sin necesidad de adaptacion adicional. El modelo se entrega con pesos en float16, lo que reduce el uso de memoria durante la inferencia.

## Capacidades

- Generacion de captions de imagen: descripciones cortas, detalladas y muy detalladas mediante prompts como `<CAPTION>`, `<DETAILED_CAPTION>` y `<MORE_DETAILED_CAPTION>`.
- Deteccion de objetos: identificacion de objetos en la imagen con bounding boxes y etiquetas mediante el prompt `<OD>`.
- Region grounding: localizacion de frases especificas de un caption en la imagen (`<CAPTION_TO_PHRASE_GROUNDING>`).
- Dense region caption: generacion de captions para multiples regiones de la imagen con bounding boxes (`<DENSE_REGION_CAPTION>`).
- Region proposal: sugerencia de regiones de interes sin etiquetas (`<REGION_PROPOSAL>`).
- Extraccion de texto (OCR): aunque no se lista explicitamente en los prompts de la model card, se menciona en fuentes externas que el modelo soporta OCR.
- Visual Question Answering (VQA): capacidad de responder preguntas sobre el contenido de la imagen (no se detalla en la card pero se menciona en la documentacion).
- Funcionamiento en modo zero-shot y fine-tuned: el modelo puede ejecutar tareas sin ajuste adicional, y tambien se puede fine-tunear para dominios especificos.

## Casos de uso

- **Generacion de captions para e-commerce**: el modelo puede generar descripciones de productos a partir de imagenes, facilitando la creacion de fichas de producto. Con el prompt `<DETAILED_CAPTION>` se obtienen descripciones mas completas, y el modelo es adecuado por su capacidad de procesar imagenes de alta resolucion y generar texto coherente.
- **Deteccion de objetos en sistemas de vigilancia**: Utilizando el prompt `<OD>`, el modelo identifica y localiza objetos en imagenes o videos (frames individuales). Su capacidad de deteccion generalista lo hace util para prototipos de sistemas de seguridad, aunque en entornos criticos se recomienda un fine-tuning con datos especificos.
- **Extraccion de texto de documentos**: El modelo puede realizar OCR sobre imagenes de documentos, facturas o capturas de pantalla, convirtiendolas en texto editable. Esto es util para automatizar procesos de digitalizacion de archivos en empresas.
- **Accesibilidad para personas con discapacidad visual**: A partir de una imagen, el modelo genera descripciones detalladas que pueden ser leidas por lectores de pantalla. Su capacidad de generar captions de varios niveles de detalle lo hace adecuado para aplicaciones de asistencia.
- **Anotacion automatica de datasets**: En pipelines de machine learning, el modelo puede generar anotaciones preliminares (bounding boxes, captions) para acelerar la creacion de datasets de entrenamiento. Su velocidad y capacidad de procesar multiples tareas en un solo modelo lo hacen eficiente.
- **Analisis de imagenes medicas (prototipo)**: Aunque no esta especificamente entrenado para diagnostico, el modelo puede describir imagenes radiologicas o de microscopia, ayudando a generar informes preliminares. En este caso, el modelo actua como asistente, pero se requiere validacion medica experta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La pagina de HuggingFace de Microsoft menciona comparaciones de rendimiento entre modelos especialistas y generalistas, pero los numeros concretos no estan disponibles en los resultados de busqueda proporcionados. Se recomienda consultar la documentacion oficial de Microsoft para datos especificos de MMLU, HumanEval o metricas de vision (como CIDEr, mAP).

## Requisitos de hardware

- **VRAM estimada para inferencia**: Con pesos en float16, el modelo ocupa aproximadamente 1,5 GB de VRAM (0,77B parametros * 2 bytes). Sin embargo, al procesar imagenes, se requiere memoria adicional para los tokens de imagen y el decoder, por lo que se recomienda al menos 4-6 GB de VRAM para inferencia con batch pequeño.
- **GPU recomendadas**: Funciona en GPU de consumo como RTX 3060 (12 GB) o superiores. En entornos profesionales, se recomienda A100 o H100 para inferencia de alto rendimiento y batch grande.
- **Compatibilidad con consumer GPU**: Si, es viable en GPU de gama media/alta (RTX 3080, RTX 4070, etc.) con cuantizacion adicional si se requiere menor memoria.
- **Opciones de despliegue**: Se puede usar con la libreria `transformers` de HuggingFace (AutoModelForCausalLM), que soporta inferencia en CPU y GPU. Tambien se puede integrar con frameworks como vLLM o TGI (Text Generation Inference) para servir el modelo en produccion, aunque el modelo no es un LLM puro, sino un modelo vision-language.
- **Latencia y throughput estimados**: No se dispone de datos exactos. En una RTX 4090, se espera una latencia de 100-200 ms por imagen en tareas de captioning, dependiendo de la longitud de los tokens generados y el uso de beam search.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Florence-2-large-ft (este) | 0,77B | No disponible | Caption, OD, OCR, grounding | MIT | HuggingFace |
| Florence-2-base-ft | 0,23B | No disponible | Mismas tareas que large-ft | MIT | HuggingFace |
| BLIP-2 | 1,2B (vision) + 2,7B (LLM) | No disponible | Caption, VQA | MIT (con restricciones) | HuggingFace |
| LLaVA (7B) | 7B (LLM) | 4096 tokens | Vision-language, VQA, reasoning | Apache 2.0 | HuggingFace |

Florence-2-large-ft se distingue por su tamano compacto (0,77B) frente a modelos como LLaVA (7B), lo que permite ejecutarlo en hardware mas limitado. A diferencia de BLIP-2, que usa un LLM externo, Florence-2 es un modelo integrado que genera texto directamente, simplificando el despliegue. La licencia MIT es mas permisiva que la de BLIP-2 (que tiene restricciones de uso comercial).

## Limitaciones y advertencias

- **Sesgos en datos de entrenamiento**: El dataset FLD-5B puede contener sesgos de genero, raza o contexto cultural, lo que puede influir en las descripciones o detecciones generadas. Se recomienda evaluar en casos de uso con poblaciones diversas.
- **Riesgo de alucinacion**: En tareas de captions detalladas, el modelo puede generar descripciones que no corresponden exactamente al contenido de la imagen, especialmente en escenarios complejos o de baja resolucion.
- **Limitaciones de contexto**: No se ha especificado la longitud maxima de tokens de texto de entrada. Para tareas que requieren captions largos o multiples prompts, se debe probar la capacidad real.
- **Idiomas**: Aunque el modelo es multilingüe, no se proporciona una lista de idiomas soportados. La calidad puede variar significativamente entre idiomas, siendo el ingles el mejor soportado.
- **Uso comercial**: La licencia MIT permite uso comercial sin restricciones, pero se debe citar la fuente si se redistribuye el modelo.
- **Dependencia de codigo externo**: El modelo requiere `trust_remote_code=True` en transformers, lo que implica ejecutar codigo del repositorio remoto. Esto puede suponer un riesgo de seguridad si no se revisa el codigo.

## Enlaces

- HuggingFace del modelo: [https://huggingface.co/jeallyhe/Florence-2-large-ft](https://huggingface.co/jeallyhe/Florence-2-large-ft)
- Modelo original de Microsoft: [https://huggingface.co/microsoft/Florence-2-large-ft](https://huggingface.co/microsoft/Florence-2-large-ft)
- Paper tecnico (arXiv): [https://arxiv.org/abs/2311.06242](https://arxiv.org/abs/2311.06242)
- Notebook de ejemplo de Microsoft: [https://huggingface.co/microsoft/Florence-2-large/blob/main/sample_inference.ipynb](https://huggingface.co/microsoft/Florence-2-large/blob/main/sample_inference.ipynb)
