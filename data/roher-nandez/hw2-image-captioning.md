# roher-nandez/hw2-image-captioning

## Resumen

El repositorio `roher-nandez/hw2-image-captioning` no contiene un modelo entrenado, sino un conjunto de notas de lectura y un esbozo experimental sobre la tarea de image captioning (generación automática de descripciones de imágenes). El autor, roher-nandez, publica este material bajo licencia CC-BY-4.0 con la intención explícita de documentar el alcance de una pregunta de investigación, los posibles factores de confusión, las comparaciones propuestas con líneas base y los contextos de evaluación recomendados (MS COCO Captions, NoCaps, TextCaps).

El repositorio solo incluye dos archivos: `notes.md` (el artefacto principal) y `README.md`. No hay pesos, código de entrenamiento ni resultados experimentales. El único dato técnico disponible es el número de parámetros totales de un archivo `safetensors` de 33.088 parámetros, lo que indica un tamaño minúsculo, probablemente un modelo de juguete o una prueba de concepto sin valor práctico. La ficha refleja esta naturaleza: no es un modelo utilizable, sino un documento de investigación en fase exploratoria.

La relevancia de este repositorio es limitada: puede servir como referencia bibliográfica o como punto de partida para un estudio serio de image captioning, pero no como un recurso desplegable. Cualquier intento de usarlo como modelo de producción sería un error conceptual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se especifica en la información proporcionada) |
| Parametros totales | 33.088 (según metadatos de safetensors) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no se indica ningún idioma) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (aunque el repositorio no contiene pesos descargables según la model card) |

Nota: la model card declara explícitamente que no se libera un checkpoint entrenado. El archivo safetensors referenciado en los metadatos de HuggingFace podría ser un artefacto residual, pero no se confirma su existencia en el repositorio real.

## Arquitectura y entrenamiento

No hay información sobre arquitectura, datos de entrenamiento o proceso de entrenamiento. La model card indica que el repositorio es "exploratorio" y que "no reclama mejoras de benchmarks, ablaciones completadas, código liberado o un checkpoint entrenado". Por tanto, no existe arquitectura documentada ni dataset de entrenamiento asociado. Las secciones de `notes.md` probablemente discuten enfoques teóricos (posiblemente basados en transformers o atención visual, como sugieren los resultados de búsqueda), pero no hay evidencia de implementación.

## Capacidades

- No tiene capacidades demostradas de generación de texto, razonamiento, código, matemáticas, visión u otras.
- No existe soporte de tool calling, agentes ni multi-step reasoning.
- No hay evidencia de capacidades multilingües.
- No hay modo de pensamiento, visión o audio.
- El repositorio es únicamente documentación teórica.

## Casos de uso

Dado que no es un modelo funcional, no procede listar casos de uso prácticos. Podría utilizarse como material de estudio para investigadores que quieran entender los desafíos del image captioning, pero no como herramienta. En su lugar, se indica lo siguiente:

- No aplicable: no hay un modelo desplegable.
- Uso potencial como referencia bibliográfica en proyectos de investigación sobre image captioning.
- Uso potencial como guía para diseñar experimentos con MS COCO Captions, NoCaps y TextCaps.
- Uso potencial para identificar factores de confusión y métodos de evaluación en estudios futuros.
- Uso potencial como ejemplo de buenas prácticas de documentación científica (reproducibilidad, transparencia sobre limitaciones).
- Uso potencial para contrastar con implementaciones reales de image captioning (p. ej., modelos transformers con atención visual).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card afirma explícitamente que no hay resultados experimentales.

## Requisitos de hardware

No aplica: no existe un modelo que requiera inferencia. No se puede estimar VRAM, GPU recomendada, ni opciones de despliegue. El único archivo safetensors de 33.088 parámetros, si existiera, sería trivialmente ejecutable en cualquier CPU, pero no se confirma su presencia.

## Comparativa con modelos similares

No disponible: no es un modelo entrenado, por lo que no puede compararse con alternativas reales de image captioning como BLIP, GIT, OFA o Flamingo.

## Limitaciones y advertencias

- No es un modelo funcional: no hay checkpoint, código ni resultados.
- La model card es explícita sobre su naturaleza exploratoria: "no reclama mejoras de benchmarks, ablaciones completadas, código liberado o un checkpoint entrenado".
- Riesgo de confusión: los metadatos de HuggingFace muestran un archivo safetensors con parámetros, pero no se garantiza que sea un modelo utilizable.
- Licencia CC-BY-4.0: permite uso comercial y modificación con atribución, pero se aplica al contenido documental, no a un modelo.
- No hay información sobre sesgos, alucinación o limitaciones de contexto porque no existe modelo.
- Cualquier intento de desplegarlo en producción sería un error.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/roher-nandez/hw2-image-captioning
- Documentación de Hugging Face sobre image captioning (referencia externa): https://huggingface.co/docs/transformers/tasks/image_captioning
- Tutorial de TensorFlow sobre image captioning con atención visual (referencia externa): https://www.tensorflow.org/text/tutorials/image_captioning
- Survey sobre deep learning para image captioning (referencia externa): https://link.springer.com/article/10.1186/s40537-026-01377-w
- Playground de Roboflow con comparativa de modelos de captioning (referencia externa): https://playground.roboflow.com/models/task/captioning
