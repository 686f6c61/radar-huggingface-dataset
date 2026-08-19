# LibreYOLO/LibreGroundFlorence2base

## Resumen

LibreGroundFlorence2base es un repositorio espejo (mirror) del modelo Florence-2-base, publicado por el usuario LibreYOLO para integrarse con su librería `libreyolo` y el wrapper `LibreGround`. No se han modificado los parámetros aprendidos; se trata de una copia fiel del snapshot original de `florence-community/Florence-2-base`, con la licencia MIT y los archivos necesarios para su uso a través de la API de LibreGround. El modelo es un sistema de visión-lenguaje (image-text-to-text) con 231,5 millones de parámetros, diseñado para tareas de grounding (localización de objetos en imágenes) y comprensión de escenas. Su relevancia radica en ofrecer una vía de acceso simplificada a Florence-2-base mediante una interfaz unificada, orientada a desarrolladores que necesitan extraer coordenadas o puntos de interés a partir de imágenes y prompts textuales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base: Florence-2-base) |
| Parametros totales | 231.546.368 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors) |
| Idiomas soportados | No disponibles |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Al ser un espejo sin cambios en los pesos, la arquitectura y el entrenamiento corresponden íntegramente a los de Florence-2-base, desarrollado por Microsoft. Florence-2-base es un modelo transformer encoder-decoder entrenado con un gran corpus de pares imagen-texto, con capacidades específicas para tareas de grounding, captioning y detección de objetos. No se dispone en esta ficha de detalles adicionales sobre el número de tokens de entrenamiento, la composición del dataset o el uso de técnicas como RLHF o DPO. La única modificación introducida por LibreYOLO es la inclusión de un wrapper (`LibreGround`) que facilita la invocación del modelo con prompts simples, como se muestra en el ejemplo de uso de la model card.

## Capacidades

- Generación de texto a partir de imágenes (image captioning) y descripción de escenas.
- Grounding de objetos: localización de elementos en una imagen mediante coordenadas o puntos, a partir de un prompt textual.
- Detección de objetos y segmentación (heredadas de Florence-2-base).
- Reconocimiento óptico de caracteres (OCR) en imágenes.
- Soporte para prompts en lenguaje natural que guían la tarea (por ejemplo, "Submit" para identificar botones en una captura de pantalla).
- Integración con la librería `libreyolo` a través del wrapper `LibreGround`, que devuelve coordenadas de puntos (`r.points.xy`).

## Casos de uso

- Automatización de pruebas de interfaz de usuario: el modelo puede identificar elementos interactivos (botones, campos de texto) en capturas de pantalla y devolver sus coordenadas, permitiendo a un framework de testing hacer clic o interactuar con precisión.
- Asistencia a personas con discapacidad visual: a partir de una imagen, el modelo puede describir la escena y señalar la ubicación de objetos relevantes, facilitando la navegación o el uso de aplicaciones.
- Anotación automática de datos para entrenamiento de modelos de visión: se puede usar para generar bounding boxes o puntos de referencia en imágenes, acelerando la creación de datasets etiquetados.
- Extracción de información de documentos escaneados: combinando OCR y grounding, se pueden localizar y extraer campos específicos (fechas, firmas, números) en formularios o facturas.
- Interacción con entornos virtuales o videojuegos: el modelo puede interpretar la pantalla y devolver coordenadas de objetos para que un agente autónomo realice acciones, como en tareas de navegación o control.
- Automatización de flujos de trabajo en aplicaciones de escritorio: mediante la captura de pantalla y prompts como "Submit" o "Next", el modelo puede guiar la ejecución de pasos en un software, reduciendo la intervención manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- No se dispone de datos oficiales de VRAM, latencia o throughput en la ficha del modelo.
- Estimación orientativa basada en el tamaño (231,5 M parámetros): en FP16, el peso ocupa aproximadamente 0,46 GB, por lo que cabría en GPUs con 1 GB de VRAM o más (por ejemplo, NVIDIA GTX 1650, RTX 2060, etc.).
- En cuantización INT8, el peso se reduciría a unos 0,23 GB, permitiendo su ejecución en hardware aún más limitado.
- El modelo es ligero y puede desplegarse en GPUs consumer de gama baja, así como en CPU con suficiente RAM (aunque con mayor latencia).
- Opciones de despliegue: al ser un espejo de Florence-2-base, es compatible con los frameworks habituales para modelos de visión-lenguaje (Transformers, vLLM, TGI, etc.), además de la librería `libreyolo` que lo envuelve.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| LibreGroundFlorence2base | 231,5 M | No disponible | MIT | Hugging Face |
| Florence-2-base (original) | 231,5 M | No disponible | MIT | Hugging Face |
| Grounding DINO (base) | 172 M | No disponible | Apache-2.0 | Hugging Face |
| OWL-ViT (base) | 109 M | No disponible | Apache-2.0 | Hugging Face |

Nota: los datos de contexto y rendimiento no están disponibles en la información proporcionada. La comparativa se limita a parámetros y licencia. Al ser un espejo, LibreGroundFlorence2base es funcionalmente idéntico a Florence-2-base.

## Limitaciones y advertencias

- Al ser un espejo sin modificaciones, hereda todas las limitaciones de Florence-2-base, incluyendo posibles sesgos en los datos de entrenamiento y riesgo de alucinaciones en la generación de texto.
- No se dispone de información sobre el rendimiento en tareas específicas ni sobre la calidad del grounding en dominios concretos.
- El repositorio tiene 0 descargas y 0 likes, por lo que no hay evidencia de validación por parte de la comunidad.
- La licencia MIT permite uso comercial, pero se recomienda revisar los términos del modelo base original y de la librería `libreyolo` para asegurar el cumplimiento.
- La longitud de contexto y los idiomas soportados no están documentados, lo que puede limitar su uso en aplicaciones multilingües o con imágenes de alta resolución.

## Enlaces

- [Hugging Face - LibreYOLO/LibreGroundFlorence2base](https://huggingface.co/LibreYOLO/LibreGroundFlorence2base)
- [Modelo base: florence-community/Florence-2-base](https://huggingface.co/florence-community/Florence-2-base)
