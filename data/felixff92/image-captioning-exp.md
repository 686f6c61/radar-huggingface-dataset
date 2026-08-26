# FELIXFF92/image-captioning-exp

## Resumen

Este repositorio no contiene un modelo de image captioning entrenado, sino un conjunto de notas de investigación estructuradas sobre el estado del arte en descripción automática de imágenes. El autor, FELIXFF92, documenta el alcance de una pregunta de investigación, confusores probables, una propuesta de comparación con líneas base emparejadas y contextos de evaluación concretos como MS COCO Captions, NoCaps y TextCaps. El archivo principal es `notes.md` y el README aclara explícitamente que no se incluyen resultados experimentales, ablaciones completadas, código publicado ni un checkpoint verificado. Los 33.088 parámetros que muestra la página de Hugging Face corresponden probablemente a un archivo de pesos residual o a un artefacto no funcional, no a un modelo entrenado para la tarea.

La relevancia de este repositorio es únicamente documental: sirve como punto de partida para investigadores que quieran replicar o ampliar estudios de image captioning, pero no puede utilizarse para inferencia ni para integración en sistemas reales. Dada su naturaleza exploratoria y su licencia MIT, puede consultarse libremente, pero no debe confundirse con un modelo open source utilizable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo entrenado) |
| Parámetros totales | 33.088 (dato de metadatos, sin uso real) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (sin pesos funcionales) |

## Arquitectura y entrenamiento

No hay arquitectura definida porque el repositorio no contiene un modelo. El autor describe un plan de investigación para comparar modelos de image captioning con líneas de base emparejadas, pero no proporciona datos de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO) ni innovaciones técnicas. La única información relevante es la propuesta de usar MS COCO Captions, NoCaps y TextCaps como contextos de evaluación, así como la mención de comprobaciones de reproducibilidad y modos de fallo. Todo lo demás está marcado como planes o hipótesis, no como resultados.

## Capacidades

- No se han implementado capacidades de generación de texto, razonamiento, código o visión.
- No hay soporte de tool calling ni de funciones.
- No hay capacidades multilingües (los idiomas no están declarados).
- No existe modo de pensamiento ni procesamiento de audio.
- El único contenido es un documento de notas de investigación en formato Markdown.

## Casos de uso

- No aplica como modelo de producción. No se puede desplegar en ningún entorno real.
- El repositorio puede servir como referencia bibliográfica para investigadores que quieran diseñar un estudio de image captioning.
- Puede utilizarse como plantilla para estructurar notas de investigación (separando planes de resultados).
- Puede consultarse para conocer los datasets estándar de evaluación en la tarea (MS COCO, NoCaps, TextCaps).
- No es adecuado para atención al cliente, generación de código, análisis de imágenes ni ninguna tarea práctica.
- Cualquier uso como modelo de inferencia sería un error y no produciría resultados válidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no contiene métricas, comparativas ni evaluaciones experimentales.

## Requisitos de hardware

- No aplicable: no hay modelo que ejecutar.
- Si se intentara cargar el archivo de pesos safetensors (33 KB), cabría en cualquier hardware, pero no es un modelo funcional.
- No hay opciones de despliegue (vLLM, llama.cpp, Ollama, TGI) porque no existe un artefacto ejecutable.

## Comparativa con modelos similares

No disponible. No existe un modelo comparable porque el repositorio no contiene un modelo de imagen.

## Limitaciones y advertencias

- El repositorio no contiene un modelo entrenado; no se puede usar para inferencia.
- El autor indica explícitamente que los planes e hipótesis no deben interpretarse como resultados.
- No hay código publicado ni artefactos de evaluación.
- La licencia MIT se aplica al texto de las notas, pero los términos de los datasets externos (MSCOCO, NoCaps, TextCaps) deben revisarse por separado.
- Cualquier intento de usarlo como modelo de producción será un error grave y producirá resultados vacíos o fallos.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/FELIXFF92/image-captioning-exp
- Documentación de HuggingFace sobre la tarea de image captioning: https://huggingface.co/docs/transformers/tasks/image_captioning
- Listado de modelos de image captioning en HuggingFace: https://huggingface.co/models?other=image-captioning
- Guía de modelos de captioning de Roboflow: https://playground.roboflow.com/models/task/captioning
