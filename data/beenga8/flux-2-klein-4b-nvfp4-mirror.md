# beenga8/flux-2-klein-4b-nvfp4-mirror

## Resumen

Este repositorio es un espejo (mirror) fijado del modelo `black-forest-labs/FLUX.2-klein-4B` de Black Forest Labs, conservado por el usuario `beenga8` para garantizar la reproducibilidad de los builds del proyecto Beenga Image. No se trata de un modelo nuevo ni de un fine-tune: es una copia byte a byte de una revisión concreta del modelo original, con el mismo peso, arquitectura y licencia.

El modelo original, FLUX.2 [klein] 4B, es un transformer de flujo rectificado (rectified flow transformer) de 4.000 millones de parámetros diseñado para generación de imágenes a partir de descripciones de texto y edición multi-referencia. Es la variante más rápida y eficiente de la familia FLUX.2, orientada a iteración rápida y prototipado. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, a diferencia de los modelos de 9B que usan la licencia no comercial de BFL.

Este mirror existe porque el autor del repositorio necesita una referencia estable e independiente de la disponibilidad del upstream, que podría ser movido, restringido o retirado en el futuro. Todas las mediciones del modelo card de Beenga Image se realizaron contra esta revisión exacta, por lo que el mirror garantiza que cualquier reconstrucción futura sea idéntica a la evaluada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de flujo rectificado (rectified flow transformer) |
| Parametros totales | 4.000 millones (4B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (modelo de generacion de imagenes, no de texto) |
| Tipos de cuantizacion | nvfp4 (FP4 de NVIDIA, 4 bits) |
| Idiomas soportados | No disponible (el modelo original no publica lista de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (segun libreria diffusers) |

Nota: el nombre del repositorio indica `nvfp4`, que corresponde a la variante cuantizada a 4 bits con formato FP4 de NVIDIA. El repo ocupa 2.5 GB, consistente con un modelo de 4B cuantizado a 4 bits.

## Arquitectura y entrenamiento

La arquitectura del modelo original es un transformer de flujo rectificado, una familia de modelos generativos que aprenden a transformar ruido gaussiano en datos mediante un flujo continuo. A diferencia de los modelos de difusion tradicionales, el flujo rectificado simplifica la trayectoria de muestreo, lo que permite generar imagenes con menos pasos de inferencia y mayor velocidad.

No se dispone de informacion detallada sobre el proceso de entrenamiento del modelo original en la informacion proporcionada. Se sabe que Black Forest Labs emplea grandes conjuntos de datos de imagenes y texto, y que el modelo de 4B esta disenado para ser rapido y eficiente, pero no se han publicado cifras exactas de tokens de entrenamiento, composicion del dataset ni uso de tecnicas como RLHF o DPO. El mirror no anade ninguna modificacion a los pesos.

La variante `nvfp4` es una cuantizacion a 4 bits con formato FP4 de NVIDIA, optimizada para acelerar la inferencia en hardware NVIDIA moderno (como las GPUs de la serie Blackwell) manteniendo una calidad visual cercana a la del modelo en precision completa.

## Capacidades

- Generacion de imagenes fotorrealistas y artisticas a partir de descripciones de texto en lenguaje natural.
- Edicion multi-referencia: permite modificar una imagen de entrada utilizando una o varias imagenes de referencia como guia.
- Iteracion rapida: al ser la variante mas ligera de la familia FLUX.2, esta optimizada para tiempos de generacion reducidos, ideal para prototipado y exploracion creativa.
- Soporte de diferentes resoluciones y relaciones de aspecto (no se especifican valores concretos en la informacion disponible).
- Integracion con la libreria `diffusers` de Hugging Face, lo que facilita su uso en pipelines existentes.
- No se han documentado capacidades de tool calling, agentes o razonamiento multi-paso, ya que es un modelo exclusivamente de generacion de imagenes.

## Casos de uso

- Prototipado de diseno grafico: un disenador puede generar decenas de variaciones de un concepto visual en minutos, usando prompts de texto y ajustando la composicion con ediciones multi-referencia, acelerando la exploracion creativa antes de pasar a herramientas de diseno vectorial.
- Generacion de imagenes para marketing y publicidad: equipos de contenido pueden crear imagenes de producto, banners o ilustraciones personalizadas sin depender de bancos de imagenes, manteniendo coherencia de marca mediante referencias visuales.
- Edicion fotografica asistida: un fotografo puede reemplazar elementos de una imagen (fondos, objetos, iluminacion) usando una o varias fotos de referencia, sin necesidad de tecnicas complejas de retoque manual.
- Creacion de assets para videojuegos: desarrolladores indie pueden generar texturas, conceptos de personajes o fondos de escenario de forma rapida, iterando sobre las propuestas del modelo hasta obtener el estilo deseado.
- Ilustracion editorial y de libros: autores y editores pueden generar ilustraciones coherentes con el tono de una obra, usando el modelo para producir bocetos que luego se refinan con herramientas profesionales.
- Automatizacion de contenido visual para redes sociales: agencias y community managers pueden generar imagenes personalizadas para cada publicacion, variando estilos y composiciones mediante prompts, reduciendo el coste de produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El mirror no incluye metricas de rendimiento, y la model card del modelo original no ha sido incluida en la informacion proporcionada. No se dispone de datos comparativos de MMLU, HumanEval u otros benchmarks, ya que estos son aplicables a modelos de lenguaje, no a generacion de imagenes. Para evaluar calidad de generacion se requeririan metricas como FID o CLIP score, que no estan disponibles.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 4B parametros cuantizado a 4 bits (nvfp4), el peso ocupa aproximadamente 2 GB en memoria. Sin embargo, la inferencia de un transformer de flujo requiere memoria adicional para activaciones y calculos intermedios. Se estima que una GPU con al menos 8 GB de VRAM seria necesaria para generar imagenes de resolucion moderada, aunque esta cifra es una estimacion no confirmada.
- GPU recomendadas: NVIDIA RTX 3060 (12 GB) o superior para uso local; para produccion, se recomiendan GPUs de datacenter como A100 o H100, especialmente si se desea aprovechar la cuantizacion FP4 nativa de las GPUs Blackwell.
- Compatibilidad con GPU consumer: si, es viable en GPUs consumer con 8-12 GB de VRAM, como las series RTX 30 y 40, siempre que se ajuste el tamano del lote y la resolucion.
- Opciones de despliegue: al ser un modelo compatible con `diffusers`, puede ejecutarse con el pipeline estandar de Hugging Face, o mediante servidores de inferencia como vLLM (si se adapta para vision) o TGI. Tambien es posible usar el repositorio oficial de inferencia de FLUX.2 en GitHub.
- Latencia y throughput: no se dispone de datos oficiales. Dado el tamano reducido y la cuantizacion FP4, se espera una generacion de imagenes en el orden de segundos en GPUs modernas, pero no se pueden aportar cifras concretas.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa tecnica rigurosa con otros modelos de generacion de imagenes. Se puede mencionar que existen alternativas como Stable Diffusion XL (SDXL) o SD3 de Stability AI, o los modelos FLUX.1 de la generacion anterior, pero no se tienen datos de rendimiento, calidad o requisitos de hardware comparables en la informacion proporcionada. Se recomienda consultar la documentacion oficial de Black Forest Labs para comparativas detalladas.

## Limitaciones y advertencias

- Este repositorio es un mirror: no contiene modificaciones ni mejoras sobre el modelo original. Cualquier problema de calidad o sesgo presente en el upstream se mantiene intacto.
- El modelo original puede presentar sesgos en la generacion de imagenes relacionados con el dataset de entrenamiento (por ejemplo, sesgos de genero, raza o cultura), aunque no se han publicado analisis especificos en la informacion disponible.
- Riesgo de alucinacion visual: como todo modelo generativo, puede producir detalles inexactos o inconsistentes, especialmente en elementos como texto dentro de la imagen, manos o rostros.
- La cuantizacion nvfp4 puede introducir una ligera degradacion de calidad respecto al modelo en precision completa, aunque en general se considera aceptable para la mayoria de usos.
- La licencia Apache 2.0 permite uso comercial, pero se debe revisar si Black Forest Labs impone politicas de uso adicionales en sus terminos de servicio, como se menciona en la model card del mirror.
- Al ser un modelo de generacion de imagenes, no es adecuado para tareas de procesamiento de lenguaje natural, razonamiento o codigo.
- La disponibilidad del modelo original en Hugging Face puede cambiar; este mirror garantiza una copia fija, pero no recibe actualizaciones ni correcciones del upstream.

## Enlaces

- Repositorio mirror: https://huggingface.co/beenga8/flux-2-klein-4b-nvfp4-mirror
- Modelo original: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- Variante nvfp4 del modelo original: https://huggingface.co/black-forest-labs/FLUX.2-klein-4b-nvfp4
- Pagina oficial del modelo en Black Forest Labs: https://bfl.ai/models/flux-2-klein
- Repositorio oficial de inferencia FLUX.2: https://github.com/black-forest-labs/flux2
- Proyecto Beenga Image (referenciado en la model card): https://github.com/Beenga/beenga-image
