# DraconicDragon/pixai-tagger-v1.0-mixed-bf16

## Resumen

pixai-tagger-v1.0-mixed-bf16 es una conversion a precision mixta BF16 del modelo pixai-labs/pixai-tagger-v1.0, un etiquetador (tagger) de imagenes de anime orientado a la clasificacion multi-etiqueta. Lo publica el usuario DraconicDragon en Hugging Face y esta pensado como sustituto directo del checkpoint original, manteniendo la misma arquitectura y logica de inferencia pero reduciendo el peso en disco y memoria al almacenar en BF16 la mayor parte de los tensores.

El modelo se apoya en una arquitectura `cls_vitdet` (un backbone tipo Vision Transformer Detector adaptado a clasificacion) con 486.346.909 parametros totales y un repositorio de aproximadamente 1 GB. Su tarea es extraer etiquetas tipo Danbooru de una imagen: personajes, ropa, expresiones, composicion, estilo y demas vocabulario propio de ilustracion anime. Esto lo hace util como componente de preprocesado en pipelines de generacion de imagenes, curado de datasets y busqueda por contenido.

La relevancia de esta version concreta es practica: al ser una conversion cuantizada del modelo base bajo licencia Apache 2.0, permite desplegar el tagger en entornos con menos VRAM y con menor coste de almacenamiento, sin cambiar el codigo de integracion mas alla de ajustar el casting de tipos. La model card advierte de un cambio de dos lineas en `tagger_pipeline.py` para castear la entrada al dtype del peso de la cabeza, evitando desajustes cuando `autocast` esta desactivado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | cls_vitdet (backbone ViTDet adaptado a clasificacion multi-etiqueta) |
| Parametros totales | 486.346.909 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de vision, no de texto) |
| Tipos de cuantizacion | BF16 en precision mixta; tensores `head.*` en FP32 |
| Idiomas soportados | no disponible (las etiquetas de salida son vocabulario Danbooru, predominantemente en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura indicada en los metadatos es `cls_vitdet`, es decir, un backbone de la familia ViTDet reutilizado como cabecera de clasificacion multi-etiqueta en lugar de deteccion. El modelo produce simultaneamente multiples etiquetas por imagen, con una cabeza (`head.*`) que en esta conversion se mantiene en FP32 mientras el resto del cuerpo se almacena en BF16. Esa mezcla de precisiones busca conservar la estabilidad numerica de la capa final de clasificacion, que suele ser la mas sensible a la perdida de rango dinamico.

No se dispone de informacion sobre el numero de tokens o imagenes de entrenamiento, la composicion exacta del dataset, ni si se aplicaron fases de ajuste fino con RLHF o DPO (tecnicas, por otra parte, poco habituales en taggers de vision). El vocabulario de etiquetas se asocia a Danbooru y a la convencion de anotacion de ilustracion anime. La innovacion tecnica de esta publicacion no esta en la arquitectura, sino en la conversion: reduccion a BF16 con preservacion de la cabeza en FP32 y un parche minimo en `tagger_pipeline.py` que castea la entrada `x` al dtype del peso de la cabeza, lo que evita errores de tipo cuando se desactiva `autocast`.

## Capacidades

- Clasificacion multi-etiqueta de imagenes: devuelve un conjunto de etiquetas por imagen en lugar de una sola clase.
- Etiquetado de ilustracion anime con vocabulario tipo Danbooru: personajes, ropa, accesorios, expresiones, encuadre y estilo.
- Extraccion de caracteristicas (`feature-extraction`) ademas de la clasificacion, segun los tags del repositorio.
- Integracion nativa con la libreria transformers mediante `tagger_pipeline.py`.
- Inferencia en BF16 con cabeza en FP32, lo que permite ejecutar en GPUs con soporte de bfloat16.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues de texto: no disponible (modelo de vision).
- Capacidades especiales de vision, audio o modo thinking: solo vision, en la forma de etiquetado de imagenes.

## Casos de uso

- Curado y limpieza de datasets de anime: pasar un corpus de imagenes por el tagger para obtener etiquetas normalizadas, detectar duplicados conceptuales y filtrar por atributos como personaje, ropa o composicion antes de entrenar modelos generativos.
- Preprocesado en pipelines de generacion texto-a-imagen: usar las etiquetas extraidas para construir prompts enriquecidos o para validar que la imagen generada contiene los atributos solicitados, cerrando un bucle de control de calidad.
- Busqueda y recuperacion por contenido: indexar una biblioteca de ilustraciones con las etiquetas de salida y habilitar busquedas por atributos visuales concretos sin depender de metadatos manuales.
- Moderacion y clasificacion de contenido: identificar categorias sensibles o atributos especificos en grandes volumenes de imagenes antes de su publicacion, aprovechando la salida multi-etiqueta.
- Automatizacion de catalogacion en plataformas de arte: generar metadatos iniciales para cada subida, que luego un humano revisa, reduciendo el coste de anotacion manual.
- Entrenamiento de modelos auxiliares: emplear las etiquetas como pseudo-etiquetas para destilar un clasificador mas ligero o para aumentar un dataset escasamente anotado.
- Despliegue en hardware modesto: al estar en BF16 y ocupar alrededor de 1 GB, puede ejecutarse en GPUs de consumo con soporte bfloat16 para procesar lotes pequenos o medianos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 486 millones de parametros en BF16, los pesos ocupan aproximadamente 1 GB, por lo que la VRAM total dependera del tamano de lote y de la resolucion de entrada.
- GPU recomendadas: no disponible en la informacion proporcionada; por tamano, encaja en GPUs con soporte bfloat16 como RTX 30xx/40xx, A100 o H100.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano del checkpoint (aproximadamente 1 GB en disco), aunque no se confirma en la documentacion.
- Opciones de despliegue: transformers con el `tagger_pipeline.py` incluido en el repositorio; otros runners (vLLM, llama.cpp, Ollama, TGI) no estan documentados para este modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DraconicDragon/pixai-tagger-v1.0-mixed-bf16 | 486.346.909 | no aplica (vision) | Etiquetado multi-etiqueta anime | Apache 2.0 | Hugging Face |
| pixai-labs/pixai-tagger-v1.0 | no disponible | no aplica (vision) | Etiquetado multi-etiqueta anime | Apache 2.0 | Hugging Face (modelo base) |
| WD Tagger (variantes Danbooru) | no disponible | no aplica (vision) | Etiquetado multi-etiqueta anime | no disponible | Hugging Face |
| Otros taggers Danbooru de la comunidad | no disponible | no aplica (vision) | Etiquetado multi-etiqueta anime | variable | Hugging Face |

La comparacion cuantitativa con alternativas no esta disponible en la informacion proporcionada; la referencia directa mas fiable es el modelo base, del que esta publicacion es una conversion cuantizada con identica funcionalidad.

## Limitaciones y advertencias

- Es una conversion cuantizada: cualquier diferencia de calidad respecto al modelo base procede de la precision BF16 y del casting de la cabeza; conviene validar contra el original en el caso de uso concreto.
- Requiere usar el `tagger_pipeline.py` incluido o replicar el cambio de dos lineas en `forward` para evitar desajustes de dtype cuando `autocast` esta desactivado.
- Sesgos conocidos: el vocabulario Danbooru refleja las convenciones y sesgos de su comunidad de anotacion, con posible infrarrepresentacion de estilos o culturas no cubiertas.
- Riesgo de etiquetas erroneas o incompletas en imagenes fuera del dominio de ilustracion anime (fotografia, arte occidental, renders 3D).
- Limitaciones de idioma: las etiquetas de salida estan en el vocabulario original, predominantemente en ingles; no se documenta soporte multilingue.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe conservarse la atribucion y revisarse las condiciones del modelo base y del dataset de etiquetas de origen.
- Para produccion: no hay benchmarks publicados ni garantias de latencia; conviene medir throughput y precision en el propio corpus antes de desplegar.
- El repositorio tiene un volumen de descargas y likes bajo, por lo que la validacion de la comunidad es limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DraconicDragon/pixai-tagger-v1.0-mixed-bf16
- Modelo base: https://huggingface.co/pixai-labs/pixai-tagger-v1.0
- Perfil del autor: https://huggingface.co/DraconicDragon
