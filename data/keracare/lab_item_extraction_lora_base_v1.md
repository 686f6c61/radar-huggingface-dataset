# KeraCare/lab_item_extraction_lora_base_v1

## Resumen

El modelo `KeraCare/lab_item_extraction_lora_base_v1` es un adaptador de bajo rango (LoRA) destinado a la extracción de elementos de informes de laboratorio a partir de imágenes. Aunque el nombre sugiere un uso específico en el ámbito clínico o de diagnóstico, la información pública disponible es extremadamente limitada: la model card es una plantilla automática sin datos técnicos ni de uso. Las etiquetas del repositorio (`glm_ocr`, `image-text-to-text`, `conversational`) apuntan a que se basa en un modelo de la familia GLM con capacidades de OCR, pero no se confirma ni el modelo base ni el proceso de ajuste.

El tamaño del repositorio en safetensors es de 1.107.405.824 parámetros, lo que sugiere un modelo de tamaño medio (aprox. 1.1B), pero no se especifica si esta cifra corresponde al adaptador LoRA o al modelo base completo. La relevancia de este tipo de modelos es alta para automatizar la captura de datos de laboratorio, un flujo de trabajo habitual en entornos sanitarios y de investigación. No obstante, la ausencia de documentación técnica y de licencia dificulta su evaluación y despliegue responsable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (se infiere GLM con OCR, sin confirmar) |
| Parámetros totales | 1.107.405.824 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No hay información pública sobre la arquitectura interna, el conjunto de datos de entrenamiento, el proceso de ajuste fino ni las técnicas empleadas. El nombre del modelo incluye "lora", lo que sugiere que se trata de un adaptador de bajo rango, pero no se especifica sobre qué modelo base se aplica. Los resultados de búsqueda en la web mencionan la herramienta MergeKit para extraer adaptadores LoRA de modelos ajustados, pero no se ha confirmado que este modelo se haya creado con dicha herramienta. En definitiva, los detalles técnicos de arquitectura y entrenamiento son desconocidos.

## Capacidades

Según la información disponible, el modelo está clasificado como `image-text-to-text`, lo que indica que puede procesar imágenes y generar texto. A partir del nombre y de la etiqueta `glm_ocr`, se infiere que su tarea principal es la extracción de elementos (ítems) de informes de laboratorio a partir de imágenes. Sin embargo, no hay evidencia pública de su funcionamiento ni de las capacidades concretas. Las siguientes viñetas son hipótesis basadas en la tarea implícita, no en datos verificados:

- Extracción de campos estructurados (nombres de pruebas, valores, unidades) desde imágenes de informes de laboratorio.
- Reconocimiento óptico de caracteres (OCR) sobre documentos clínicos.
- Conversación multimodal: podría interactuar mediante texto e imagen para responder preguntas sobre los datos extraídos.
- Posible soporte de múltiples idiomas, pero no confirmado.
- No se ha documentado soporte de function calling ni de razonamiento multi-paso.

## Casos de uso

- Automatización de entrada de datos en sistemas de información de laboratorio: el modelo podría convertir capturas de pantalla o fotografías de informes en datos estructurados para su integración en bases de datos.
- Digitalización de archivos históricos: transformar informes de laboratorio en papel o PDF escaneado en texto legible y estructurado.
- Asistencia a profesionales sanitarios: extraer rápidamente los resultados clave de un informe para resumirlos en un historial clínico.
- Control de calidad en laboratorios: comparar los datos extraídos automáticamente con los valores esperados para detectar errores.
- Investigación biomédica: extraer información de múltiples informes para construir conjuntos de datos de investigación.
- Integración en asistentes conversacionales: permitir a un usuario preguntar por el resultado de un análisis a partir de una imagen.

Nota: estos casos son hipotéticos y no se ha validado el comportamiento real del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra prueba comparativa.

## Requisitos de hardware

- No se dispone de información oficial sobre requisitos de hardware.
- El tamaño de los pesos (1.107.405.824 parámetros) sugiere que en precisión FP16 ocuparía aproximadamente 2.2 GB de memoria, pero no se sabe si esto corresponde al adaptador o al modelo base.
- Para ejecutar el modelo en una GPU de consumo, se necesitaría al menos 4 GB de VRAM si se cuantiza a 8 bits, aunque no se han publicado cuantizaciones disponibles.
- No se han indicado opciones de despliegue específicas (vLLM, llama.cpp, Ollama, TGI, etc.). Dado que el formato es safetensors, se podría cargar con la librería `transformers` y `PEFT` si el adaptador es compatible, pero no hay instrucciones.
- No se dispone de datos de latencia ni throughput.

## Comparativa con modelos similares

No se han encontrado modelos comparables directamente. No hay información sobre modelos de la misma categoría (extracción de ítems de laboratorio) con los que se pueda comparar. Se recomienda buscar alternativas en el ecosistema de modelos GLM o de OCR especializado, pero no hay datos suficientes para una tabla comparativa.

## Limitaciones y advertencias

- No hay documentación sobre sesgos, alucinaciones o comportamiento en casos límite.
- El modelo carece de licencia declarada, lo que impide saber si puede utilizarse comercialmente o con fines de investigación.
- La model card no indica idiomas soportados, por lo que su rendimiento en español o en otros idiomas es desconocido.
- No se ha validado su precisión en la tarea de extracción de laboratorio, por lo que no se recomienda su uso en entornos clínicos sin una evaluación exhaustiva.
- Al no conocer el modelo base, no se pueden evaluar los sesgos inherentes ni el comportamiento en dominios fuera del entrenamiento.
- La falta de información técnica dificulta la reproducción y la integración en pipelines de producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/KeraCare/lab_item_extraction_lora_base_v1
- Herramienta MergeKit (mencionada en la búsqueda web, no es específica del modelo): https://www.arcee.ai/blog/use-mergekit-to-extract-lora-adapters-from-any-fine-tuned-model
- Documentación de MergeKit en DeepWiki: https://deepwiki.com/arcee-ai/mergekit/4.4-lora-extraction

Nota: los enlaces de MergeKit se incluyen porque la búsqueda web los devolvió, pero no se ha confirmado que estén relacionados con este modelo.
