# DraconicDragon/pixai-tagger-v1.0-mixed-bf16

## Resumen

DraconicDragon/pixai-tagger-v1.0-mixed-bf16 es una conversion a precision mixta BF16 del modelo pixai-labs/pixai-tagger-v1.0, publicado por el usuario DraconicDragon. Se trata de un clasificador de imagen multi-etiqueta especializado en el etiquetado automatico de ilustraciones de estilo anime con tags al estilo Danbooru. El modelo base fue desarrollado por PixAI Labs y su pipeline declarado es image-classification, con la libreria transformers y codigo personalizado (custom_code) que obliga a usar trust_remote_code al cargarlo.

Tecnicamente es un transformer de vision de aproximadamente 486 millones de parametros (486.346.909 segun los pesos safetensors del repositorio), con una arquitectura que los metadatos etiquetan como cls_vitdet y que aparece asociada al termino sam3 en las etiquetas del repositorio. La unica modificacion declarada por el autor de esta conversion es que los tensores de la cabeza (head.*) se mantienen en FP32 mientras el resto del modelo se guarda en BF16, con un pequeno ajuste en tagger_pipeline.py para convertir la entrada al tipo de dato del peso de la cabeza y evitar desajustes cuando autocast esta desactivado.

Su relevancia practica es acotada pero clara: el etiquetado automatico es una pieza critica en la preparacion de datasets para entrenamiento de modelos de difusion (LoRA, DreamBooth, fine-tuning de text-to-image) y en la gestion de galerias de ilustracion. Esta version reduce el peso del modelo a aproximadamente 1 GB en disco frente a un equivalente en FP32, lo que facilita su despliegue en GPU de gama media o incluso en CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de vision para clasificacion de imagen; metadatos con la etiqueta cls_vitdet y referencia sam3 (detalles no disponibles) |
| Parametros totales | 486.346.909 (aproximadamente 486 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo de clasificacion de imagen; resolucion de entrada no especificada) |
| Tipos de cuantizacion | BF16 en precision mixta (cabeza head.* en FP32); no se documentan otras cuantizaciones |
| Idiomas soportados | No disponible; el vocabulario de salida son etiquetas tipo Danbooru, mayoritariamente en ingles |
| Licencia | No disponible |
| Formato de pesos | safetensors (BF16 con tensores de cabeza en FP32); requiere codigo personalizado del repositorio |
| Tamano del repositorio | 1.0 GB |
| Pipeline declarado | image-classification |
| Libreria | transformers (con custom_code) |
| Modelo base | pixai-labs/pixai-tagger-v1.0 (relacion: quantized) |
| Fecha de creacion | 2026-09-19 (segun metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 |
| Region | us |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna ni sobre el proceso de entrenamiento. Los metadatos del repositorio indican un modelo de vision para clasificacion con etiqueta cls_vitdet y hacen referencia a sam3, lo que apunta a un backbone de tipo Vision Transformer con una cabeza de clasificacion multi-etiqueta, pero no se confirma ni la resolucion de entrada, ni el numero de capas, ni la dimensionalidad del espacio de caracteristicas. El numero de parametros del repositorio (486.346.909) es un dato real extraido de los pesos safetensors.

Lo unico documentado por el autor de esta ficha es el proceso de conversion: se mantiene el modelo completo en BF16 mientras que los tensores de la cabeza se conservan en FP32, y se incluye una modificacion de dos lineas en tagger_pipeline.py (en el ultimo def forward(self, x)) que castea la entrada x al dtype del peso de la cabeza. No hay informacion sobre el dataset de entrenamiento del modelo original, el numero de tokens o imagenes vistas, ni sobre si se aplicaron tecnicas de ajuste como RLHF o DPO (poco habituales en un tagger).

## Capacidades

- Etiquetado multi-etiqueta de imagenes: asigna simultaneamente varias etiquetas a una misma imagen, en el estilo de vocabulario de Danbooru.
- Dominio especializado en ilustracion anime: las etiquetas del repositorio (anime, tagger, danbooru) delimitan el caso de uso previsto.
- Extraccion de caracteristicas: el repositorio incluye la etiqueta feature-extraction ademas de image-classification, por lo que puede emplearse para obtener representaciones de imagen.
- Clasificacion de imagen como tarea principal declarada en el pipeline de HuggingFace, con salida multi-label.
- Inferencia en BF16 con cabeza en FP32, lo que permite ejecucion en precision reducida sin perder la precision numerica de la capa de clasificacion.
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no disponible (no es un modelo generativo de texto).
- Capacidades multilingues, vision generativa, audio o modo de razonamiento explicito: no disponibles; se limita a entrada de imagen y salida de etiquetas.

## Casos de uso

- Preparacion de datasets para entrenamiento de LoRA y DreamBooth: el modelo etiqueta lotes de ilustraciones anime de forma automatica, generando los tags que se usaran como descripciones de entrenamiento. Sus 486 M de parametros y su peso de 1 GB en BF16 permiten procesar miles de imagenes en una sola GPU consumer.
- Auto-etiquetado en galerias de arte y plataformas de ilustracion: cada imagen subida se clasifica al momento para generar metadatos de busqueda sin intervencion manual, aprovechando la salida multi-etiqueta para poblar indices de busqueda por personaje, estilo o escena.
- Filtrado y moderacion de contenido: la salida multi-etiqueta permite detectar categorias concretas del vocabulario Danbooru y aplicar reglas de visibilidad o de marcado de contenido sensible antes de publicar.
- Busqueda y recuperacion de imagenes: las etiquetas generadas alimentan un motor de busqueda interno (por ejemplo, con un indice invertido de tags) para localizar ilustraciones por atributos concretos sin depender de metadatos manuales.
- Preprocesado en pipelines de imagen a prompt: integrado como primer paso de una cadena que convierte una imagen en un prompt de texto, aportando los tags que despues se reformularan como descripcion.
- Curacion y control de calidad de datasets: comparar las etiquetas predichas con las etiquetas existentes permite detectar imagenes mal etiquetadas, duplicados casi identicos por similitud de tags o clases infrarrepresentadas antes de un entrenamiento.
- Analitica de tendencias: el recuento agregado de etiquetas sobre un corpus grande de imagenes permite medir la frecuencia de personajes, estilos o caracteristicas a lo largo del tiempo en una plataforma.
- Despliegue en herramientas de interfaz grafica para artistas: extensiones de auto-tagging que funcionan en local (ComfyUI u otras) y que se benefician de un modelo de menos de 2 GB en memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para los pesos (calculada a partir de 486.346.909 parametros): aproximadamente 1,0 GB en BF16, aproximadamente 1,95 GB en FP32, aproximadamente 0,49 GB en INT8 y aproximadamente 0,24 GB en INT4. La memoria para activaciones depende de la resolucion de entrada y del tamano de lote, datos no disponibles.
- La VRAM total de inferencia sera superior a la de los pesos debido a activaciones y buffers; no se dispone de mediciones publicadas.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente en la practica para los pesos en BF16 y lotes pequenos; una RTX 3060 de 12 GB o una RTX 4090 permiten lotes grandes y mayor throughput; A100 o H100 no son necesarias para este tamano de modelo y solo se justifican para procesado masivo por lotes.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna (por ejemplo, GTX 1650 4 GB, RTX 3060, RTX 4060, RTX 4090) e incluso en CPU, dado que el modelo ronda 1 GB en BF16.
- Opciones de despliegue: transformers con trust_remote_code=True y el pipeline image-classification, usando el tagger_pipeline.py incluido en el repositorio. vLLM, TGI y llama.cpp no son aplicables a este tipo de modelo (no es un modelo de lenguaje). El soporte de ONNX, TensorRT o torch.compile no esta documentado.
- Latencia y throughput estimados: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DraconicDragon/pixai-tagger-v1.0-mixed-bf16 | 486.346.909 (dato real de safetensors) | No aplica / no disponible | No disponible | No disponible | HuggingFace, requiere custom_code |
| pixai-labs/pixai-tagger-v1.0 (modelo base) | Mismo modelo, no disponible el recuento exacto en la informacion proporcionada | No disponible | No disponible | No disponible | HuggingFace |
| Otros taggers de anime (por ejemplo, familias WD14 o JoyTag) | No disponible | No disponible | No disponible | No disponible | No verificado en la informacion disponible |

No se dispone de datos verificados de benchmarks, licencia ni parametros de los modelos alternativos dentro de la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Licencia no disponible: sin una licencia declarada no es posible confirmar si se permite el uso comercial, la redistribucion o el uso para entrenar otros modelos. Conviene contactar con el autor del modelo base antes de cualquier uso en produccion.
- Especializacion de dominio: el modelo esta orientado a ilustracion anime y a vocabulario Danbooru; su comportamiento fuera de ese dominio (fotografia, ilustracion no anime, imagenes medicas o tecnicas) no esta documentado y probablemente sea pobre.
- Sesgos heredados del corpus de entrenamiento: los vocabularios Danbooru arrastran desequilibrios en cuanto a personajes, generos, estilos y contenido; el modelo puede sobrerrepresentar o infrarrepresentar ciertas categorias.
- Riesgo de etiquetas espurias: al ser multi-etiqueta, puede producir falsos positivos que requieran umbrales de confianza ajustados por categoría.
- Conversion no oficial: esta version BF16 la publica un tercero (DraconicDragon), no PixAI Labs. No hay garantia de paridad numerica con el modelo original en FP32; conviene validar la salida contra el modelo base antes de sustituirlo.
- Ejecucion de codigo remoto: el repositorio usa custom_code, por lo que cargarlo implica ejecutar codigo del autor (trust_remote_code=True), con el riesgo de seguridad que ello conlleva.
- Ausencia de validacion comunitaria: el repositorio registra 0 descargas y 0 likes, sin evidencia publica de uso o de calidad en produccion.
- Idiomas no declarados: no hay informacion sobre el tratamiento de etiquetas en idiomas distintos del ingles.
- Limitaciones de entrada: no procesa texto ni audio y no genera imagenes; su salida es un conjunto de etiquetas o caracteristicas.
- Anomalia de metadatos: la fecha de creacion registrada (2026-09-19) es posterior a la fecha habitual de publicacion, lo que sugiere un posible error o manipulacion de los metadatos del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DraconicDragon/pixai-tagger-v1.0-mixed-bf16
- Modelo base: https://huggingface.co/pixai-labs/pixai-tagger-v1.0
- Los resultados de la busqueda web proporcionada no contienen ningun enlace relacionado con este modelo (corresponden a sitios de juegos tipo bubble shooter); no se dispone de papers, blogs, repositorios ni demos adicionales.
