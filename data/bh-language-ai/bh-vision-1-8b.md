# BH-Language-AI/bh-vision-1-8b

## Resumen

BH-Vision-1-8B es una ficha de proyecto (no un modelo entrenado) publicada por BH-Language-AI en Hugging Face. Segun la propia model card, **las ponderaciones no existen**: se trata de una tarjeta de proyecto que describe la intencion de entrenar un modelo de vision-lenguaje de 8B parametros especializado en bosnio (codigo de idioma `bs`) y en tareas de OCR sobre documentos. El pipeline declarado es `image-text-to-text` y la licencia indicada es Apache-2.0.

El modelo base previsto es `HuggingFaceM4/Idefics3-8B-Llama3`, un modelo vision-lenguaje de la familia Idefics3 con backbone Llama-3.1. La model card advierte explicitamente de que, aunque el checkpoint de Idefics3 se distribuye con licencia Apache-2.0, su backbone Llama-3.1 arrastra la licencia de Meta, por lo que requiere una verificacion legal antes de cualquier uso en produccion. Esta advertencia es relevante porque condiciona todo el proyecto.

El interes actual de esta ficha es documental: describe un plan de entrenamiento QLoRA en 4 bits, la composicion prevista de datos (PubLayNet/PlotQA como tecnicas, evaluacion proxy XM3600-hr y postocr-sr, y un conjunto held-out propio `BH-Language-AI/bs-vision-ocr-heldout-v01` que nunca debe entrar en entrenamiento) y la convencion de nombres `bh-vision-{generacion}-{tamano}`. No hay resultados, pesos ni benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada del base Idefics3-8B-Llama3, no confirmada en la ficha) |
| Parametros totales | 8B (clase declarada, no verificable al no existir pesos) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | entrenamiento previsto en QLoRA 4-bit; cuantizaciones de inferencia no disponibles |
| Idiomas soportados | bosnio (`bs`) |
| Licencia | apache-2.0 (con advertencia de verificacion legal de la licencia Llama-3.1 del backbone) |
| Formato de pesos | no disponible (las ponderaciones no existen) |

## Arquitectura y entrenamiento

La ficha no documenta la arquitectura interna del modelo, ya que este no ha sido entrenado. El plan declarado consiste en un ajuste fino QLoRA en 4 bits sobre `HuggingFaceM4/Idefics3-8B-Llama3`, con una configuracion ubicada en `bh-vision-training/configs/idefics8b-qlora.yaml`. La model card indica de forma explicita que no debe entrenarse sin verificacion legal y aprobacion previa. No se especifican numero de tokens de entrenamiento, composicion exacta del dataset, ni si habra RLHF o DPO.

En cuanto a datos, se mencionan PubLayNet y PlotQA como fuentes de tecnicas para el entrenamiento, XM3600-hr y postocr-sr como conjuntos de evaluacion proxy, y `BH-Language-AI/bs-vision-ocr-heldout-v01` como conjunto held-out que nunca debe incluirse en el entrenamiento. No se detalla el volumen ni la proporcion de cada fuente.

## Capacidades

- Generacion de texto a partir de imagenes (pipeline `image-text-to-text`), segun la etiqueta declarada.
- OCR sobre documentos, segun la etiqueta `ocr` de la model card.
- Capacidades multilingues limitadas al bosnio (`bs`) segun el campo `language`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (thinking mode, vision, audio): vision declarada por el pipeline; el resto no disponible.
- Cualquier capacidad funcional queda pendiente de que existan pesos entrenados y evaluacion verificada.

## Casos de uso

- Digitalizacion de documentos bosnios: el modelo esta pensado para extraer texto de imagenes de documentos, lo que encaja con el etiquetado `ocr` de la ficha. Su uso real depende de que se publique un entrenamiento aprobado.
- Procesamiento de documentos academicos y cientificos: PubLayNet, citado como fuente de datos, esta orientado a la comprension de layout de articulos, lo que sugiere un uso previsto en extraccion estructurada de publicaciones.
- Extraccion de datos de graficos: PlotQA, tambien citado, apunta a la interpretacion de graficos y tablas en imagenes, util para informes financieros o cientificos en bosnio.
- Evaluacion comparativa de OCR en bosnio: el conjunto held-out `bs-vision-ocr-heldout-v01` esta disenado como referencia de evaluacion, por lo que el modelo serviria como linea base en pruebas de OCR para ese idioma.
- Investigacion en adaptacion de modelos vision-lenguaje a idiomas de bajos recursos: el enfoque QLoRA sobre Idefics3 con datos especificos de bosnio es un caso de estudio reproducible para otros idiomas con poca cobertura.
- Integracion en pipelines de digitalizacion de archivos publicos: si se entrena y aprueba, podria procesar lotes de imagenes escaneadas de administraciones o bibliotecas bosnias. Cualquier despliegue en produccion queda bloqueado hasta resolver la licencia del backbone.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de ningun tipo y las ponderaciones no existen, por lo que no hay rendimiento medible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, al no existir pesos. Como referencia orientativa de la clase 8B, la inferencia en 4 bits requeriria del orden de 5-6 GB, en 8 bits unos 8-9 GB y en fp16 unos 16 GB, pero estos valores no estan confirmados para este modelo.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| BH-Vision-1-8B | 8B (clase declarada) | no disponible | apache-2.0 (con caveat Llama-3.1) | sin pesos publicados |
| HuggingFaceM4/Idefics3-8B-Llama3 | 8B | no disponible en esta ficha | Apache-2.0 con backbone Llama-3.1 | pesos publicados por HuggingFaceM4 |
| Alternativas especificas para OCR en bosnio | no disponible | no disponible | no disponible | no disponible |

La unica comparacion documentable es con el modelo base, del que este proyecto heredaria arquitectura y limitaciones. No se dispone de informacion sobre otros modelos comparables de OCR en bosnio.

## Limitaciones y advertencias

- Las ponderaciones no existen: la ficha es una tarjeta de proyecto y no un modelo utilizable. Cualquier intento de descarga o inferencia fallara.
- Requiere verificacion legal de la licencia del backbone Llama-3.1 antes de entrenar o desplegar, segun la propia model card.
- El entrenamiento esta marcado como no autorizado sin aprobacion explicita; la configuracion QLoRA no debe ejecutarse a ciegas.
- Cobertura linguistica limitada al bosnio (`bs`); no se declaran otros idiomas.
- Riesgo de sesgo y alucinacion desconocido, al no existir evaluacion publicada.
- Sin datos sobre contexto maximo, lo que impide planificar su uso en documentos largos.
- Sin benchmarks ni evaluacion verificada: no hay evidencia de calidad en OCR ni en comprension de imagenes.
- Uso comercial condicionado por la licencia del backbone, aunque la ficha declare Apache-2.0.

## Enlaces

- Hugging Face: https://huggingface.co/BH-Language-AI/bh-vision-1-8b
- Modelo base: https://huggingface.co/HuggingFaceM4/Idefics3-8B-Llama3
- Conjunto held-out: https://huggingface.co/datasets/BH-Language-AI/bs-vision-ocr-heldout-v01 (referenciado en la model card; no verificado)
- Configuracion de entrenamiento: `bh-vision-training/configs/idefics8b-qlora.yaml` (ruta interna citada en la model card, sin URL publica)
- Coleccion BH-Vision: no disponible como URL directa
