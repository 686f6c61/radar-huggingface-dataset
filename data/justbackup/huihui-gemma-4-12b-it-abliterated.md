# Justbackup/Huihui-gemma-4-12B-it-abliterated

## Resumen

El modelo **Justbackup/Huihui-gemma-4-12B-it-abliterated** es una versión modificada de `google/gemma-4-12B-it`, un modelo multimodal de Google de 12 000 millones de parámetros (11 959 730 224 parámetros exactos) que procesa entrada de texto e imagen y genera texto. Esta variante, creada originalmente por el colectivo huihui-ai y alojada aquí como espejo por el usuario Justbackup, ha sido sometida a una técnica llamada *abliteration* que elimina los mecanismos de rechazo y censura del modelo original. El resultado es un modelo que responde sin filtros de seguridad, tanto en su modo de razonamiento (thinking) como en el modo estándar, habiendo sido modificadas únicamente las capas 23 a 28.

La relevancia de este modelo radica en su utilidad para investigación sobre alineación, seguridad y comportamiento de modelos de lenguaje, así como para entornos controlados donde se necesita probar respuestas sin restricciones de contenido. Al estar basado en Gemma 4, hereda capacidades multimodales (imagen a texto) y un rendimiento competitivo para su tamaño, pero con la advertencia explícita de que no es apto para uso en producción o aplicaciones públicas. La licencia declarada es Apache-2.0, aunque el modelo base de Google tiene su propia licencia que puede imponer condiciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), basado en Gemma 4 12B it |
| Parametros totales | 11 959 730 224 (aproximadamente 12B) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene pesos en safetensors; se ofrece una version GGUF a traves de Ollama) |
| Idiomas soportados | No disponible (el modelo base de Gemma 4 soporta multiples idiomas, pero no se especifica para esta variante) |
| Licencia | Apache-2.0 (con licencia del modelo base de Google Gemma 4) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-12B-it`, un transformer multimodal que acepta tanto texto como imagenes como entrada y genera texto. La arquitectura interna sigue el diseño de los modelos Gemma 4, con atención por ventanas deslizantes y atención global, aunque no se proporcionan detalles adicionales en la documentacion disponible.

El proceso de *abliteration* se realizo mediante la herramienta `remove-refusals-with-transformers`, una implementacion que modifica los pesos de las capas seleccionadas para eliminar la direccion de rechazo aprendida durante el entrenamiento con RLHF. En este caso, se han abliterado las capas 23 a 28, tanto para el modo de pensamiento (thinking) como para el modo estandar. No se han publicado datos sobre el dataset de entrenamiento del modelo base ni sobre el proceso de fine-tuning, mas alla de la tecnica de abliteracion. Es importante destacar que los pesos originales de la primera version de `google/gemma-4-12B-it` presentaban problemas, por lo que el autor re-ablato y re-subio el modelo; se recomienda descargar la version actualizada.

## Capacidades

- Generacion de texto y razonamiento: el modelo base Gemma 4 12B it es capaz de tareas de razonamiento complejo, escritura creativa, analisis y resumen de texto.
- Comprension multimodal: procesa imagenes junto con texto, permitiendo responder preguntas sobre el contenido visual, describir escenas o extraer informacion de graficos.
- Modo de pensamiento (thinking): el modelo puede activar un modo de razonamiento interno antes de responder, aunque en esta version abliterada dicho modo tambien ha sido modificado para no rechazar peticiones.
- Sin filtros de seguridad: la abliteracion elimina los rechazos tipicos de los modelos alineados, por lo que respondera a peticiones que el modelo original consideraria inapropiadas o peligrosas.
- Soporte de tool calling y agentes: no se menciona explicitamente en la documentacion, pero el modelo base Gemma 4 it incluye capacidades de function calling; no se confirma si se mantienen tras la abliteracion.
- Capacidades multilingues: no se especifican los idiomas soportados, aunque Gemma 4 it fue entrenado con multiples idiomas.

## Casos de uso

- Investigacion en seguridad y alineacion de IA: permite estudiar como responden los modelos sin mecanismos de rechazo, analizando sesgos, comportamientos toxicos o la eficacia de las tecnicas de abliteracion.
- Generacion de contenido creativo sin restricciones: escritores y artistas pueden explorar temas tabu o controversiales en ficcion, guiones o narrativa sin que el modelo se niegue a continuar.
- Evaluacion de robustez de sistemas de moderacion: se puede usar como modelo de "ataque" para probar filtros de contenido en otras aplicaciones, generando entradas que podrian evadir sistemas de seguridad.
- Desarrollo de datasets para entrenamiento de clasificadores de contenido: generar ejemplos de respuestas no filtradas para entrenar modelos de deteccion de toxicidad o contenido inapropiado.
- Analisis de imagenes en entornos de investigacion: al ser multimodal, puede describir o interpretar imagenes sin las limitaciones de contenido que tendria el modelo original, util en estudios sociologicos o antropologicos.
- Pruebas de comportamiento en entornos controlados: laboratorios academicos pueden desplegar el modelo en sandboxes para observar como se comporta ante prompts extremos, siempre con supervision humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base `google/gemma-4-12B-it` tiene metricas publicadas por Google, pero no se proporcionan datos especificos para esta version abliterada.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en fp16 (24 GB en disco), se necesitan aproximadamente 24 GB de VRAM para cargar el modelo completo. Con cuantizacion de 8 bits se reduce a unos 12 GB, y con 4 bits a unos 6 GB.
- GPU recomendadas: una NVIDIA RTX 3090 o RTX 4090 (24 GB) para fp16; una RTX 4080 o A5000 (16 GB) para 8 bits; una RTX 3060 o similar (12 GB) para 4 bits.
- En consumer GPU: si, con cuantizacion de 4 bits cabe en GPUs de gama media con 8-12 GB de VRAM, aunque la velocidad sera limitada.
- Opciones de despliegue: el modelo se puede servir con vLLM, TGI, llama.cpp u Ollama (este ultimo ya ofrece una version oficial `huihui_ai/gemma-4-abliterated:12b`).
- Latencia y throughput: no disponibles en la documentacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Diferencias clave |
|---|---|---|---|---|---|
| Justbackup/Huihui-gemma-4-12B-it-abliterated | 11.96B | No disponible | Apache-2.0 | Hugging Face, Ollama | Abliterado, sin filtros de seguridad |
| google/gemma-4-12B-it | 11.96B | No disponible | Licencia Gemma | Hugging Face | Modelo base con alineacion y filtros de seguridad |
| Otros modelos abliterados de huihui-ai (p.ej. Llama-3-abliterated) | Variable | Variable | Variable | Hugging Face | Misma tecnica de abliteracion aplicada a otros modelos base |

No se dispone de datos de benchmarks comparativos entre estos modelos.

## Limitaciones y advertencias

- Sesgos conocidos: al eliminar los rechazos, el modelo puede reproducir y amplificar sesgos toxicos, discriminatorios o dañinos presentes en sus datos de entrenamiento, sin ningun mecanismo de mitigacion.
- Riesgo de alucinacion: la ausencia de filtros no reduce la tendencia a inventar informacion; de hecho, puede ser mas propenso a generar afirmaciones falsas o peligrosas sin autocorreccion.
- Limitaciones de contexto: no se ha especificado la longitud de contexto soportada, por lo que se desconoce si mantiene la ventana del modelo base.
- Limitaciones de idioma: no se han publicado los idiomas soportados, aunque Gemma 4 it es multilingue.
- Restricciones de licencia: aunque el repositorio indica Apache-2.0, el modelo base de Google Gemma 4 tiene su propia licencia que puede imponer restricciones de uso comercial y redistribucion; se debe revisar la licencia de Google antes de cualquier despliegue.
- Advertencias del autor: el propio autor recomienda no usar este modelo en produccion, en aplicaciones publicas o con menores de edad, y sugiere supervisar manualmente las salidas. No ofrece ninguna garantia de seguridad.
- Problemas con pesos originales: la primera version del modelo base tenia pesos defectuosos; aunque el autor ha re-subido una version corregida, se recomienda verificar la integridad de los archivos descargados.

## Enlaces

- Repositorio Hugging Face (Justbackup): https://huggingface.co/Justbackup/Huihui-gemma-4-12B-it-abliterated
- Repositorio Hugging Face original (huihui-ai): https://huggingface.co/huihui-ai/Huihui-gemma-4-12B-it-abliterated
- Version en Ollama: https://ollama.com/huihui_ai/gemma-4-abliterated:12b
- Herramienta de abliteracion (remove-refusals-with-transformers): https://github.com/Sumandora/remove-refusals-with-transformers
- Modelo base en Hugging Face: https://huggingface.co/google/gemma-4-12B-it
