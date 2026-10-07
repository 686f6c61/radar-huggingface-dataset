# CollectionStudio/siglip2-base-patch16-384

## Resumen

SigLIP 2 Base (patch16-384) es un codificador vision-lenguaje de tipo dual encoder desarrollado por Google (el repositorio analizado, `CollectionStudio/siglip2-base-patch16-384`, es una redistribucion del checkpoint original `google/siglip2-base-patch16-384`). SigLIP 2 amplia el objetivo de preentrenamiento de SigLIP incorporando en una unica receta tecnicas previamente dispersas, con el objetivo de mejorar la comprension semantica, la localizacion espacial y la calidad de las representaciones densas. Resuelve tareas de clasificacion de imagen zero-shot, recuperacion imagen-texto y servir como torre de vision para modelos vision-lenguaje.

El modelo emplea una arquitectura de doble torre (vision transformer con parches de 16x16 a 384 px de resolucion, mas una torre de texto) y suma 375.479.810 parametros en total, segun los metadatos de safetensors. Se distribuye bajo licencia Apache 2.0, con pesos en formato safetensors y un tamano de repositorio de 1,5 GB (coherente con pesos en fp32). Su relevancia actual radica en que es una pieza de infraestructura muy utilizada como encoder visual en pipelines multimodales y en sistemas de clasificacion y busqueda sin entrenamiento adicional.

La ficha del autor no aporta datos de idiomas, benchmarks en formato texto ni resultados numericos de evaluacion; la tabla de evaluacion del paper se incluye unicamente como imagen. Este repositorio concreto registra 0 descargas y 0 likes y fue creado el 6 de octubre de 2026, por lo que se trata de una copia sin traccion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dual encoder vision-lenguaje (vision transformer con patch size 16 y resolucion 384, mas torre de texto), objetivo de perdida sigmoidea tipo SigLIP 2 |
| Parametros totales | 375.479.810 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica como ventana autoregresiva; el codificador de texto procesa indicaciones de longitud fija. Valor exacto no disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; el repositorio solo publica pesos safetensors |
| Idiomas soportados | No disponible en los metadatos del repositorio; el titulo del paper lo describe como encoder vision-lenguaje multilingue |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

SigLIP 2 es un modelo de dos torres: una torre de vision (transformer de parches, en esta variante con parches de 16x16 y entrada de 384 px) y una torre de texto, alineadas mediante un objetivo de contraste imagen-texto con perdida sigmoidea, que sustituye el softmax global del contraste clasico de CLIP por una formulacion por pares. Sobre esa base, SigLIP 2 anade tres objetivos de entrenamiento: una perdida de decodificador, una perdida de prediccion global-local y enmascarada, y adaptabilidad de relacion de aspecto y resolucion. Estas tecnicas persiguen mejorar la semantica global, la localizacion de objetos y la calidad de las caracteristicas densas (utiles para segmentacion y deteccion).

El preentrenamiento se realizo sobre el dataset WebLI (Chen et al., 2023). El computo empleado ascendio a un maximo de 2048 chips TPU-v5e. Los metadatos de la model card no detallan el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de ajuste con RLHF o DPO (no aplicables de forma estandar en un encoder de contraste). Tampoco se especifica el reparto de parametros entre torre de vision y torre de texto; el total de 375.479.810 corresponde a ambas.

## Capacidades

- Clasificacion de imagen zero-shot: asignar probabilidad a etiquetas de texto arbitrarias sin entrenamiento adicional, mediante comparacion de embeddings imagen-texto.
- Recuperacion imagen-texto y texto-imagen: generacion de embeddings alineados para busqueda semantica multimodal.
- Extraccion de caracteristicas visuales: `get_image_features` devuelve embeddings de imagen reutilizables en clasificadores, sistemas de recomendacion o indexado vectorial.
- Encoder visual para modelos vision-lenguaje: uso como torre de vision en arquitecturas VLM.
- Caracteristicas densas y localizacion: la receta de SigLIP 2 incluye objetivos orientados a mejorar la localizacion espacial y las representaciones densas, segun el paper.
- Adaptabilidad de resolucion y relacion de aspecto: objetivo de entrenamiento declarado por los autores.
- Soporte multilingue: el paper se presenta como multilingue, aunque los metadatos del repositorio no enumeran idiomas.
- No es un modelo generativo: no produce texto libre, no soporta tool calling ni razonamiento multi-paso por si mismo.

## Casos de uso

- Moderacion de contenido visual: clasificar imagenes contra taxonomias de etiquetas de texto configurables (por ejemplo, categorias de riesgo) sin necesidad de reentrenar el modelo cuando cambia la politica.
- Etiquetado y curación de datasets: generar etiquetas zero-shot sobre grandes volumenes de imagenes para preanotar datos que luego se revisan o se usan en entrenamiento supervisado.
- Busqueda visual en catalogo de producto: indexar embeddings de imagen y comparar contra descripciones textuales para recuperacion imagen-texto en comercio electronico.
- Clasificacion de imagenes en pipelines de inspeccion o seguimiento: usar etiquetas textuales para filtrar lotes de imagenes por categoria, con umbral de confianza ajustable.
- Torre de vision en sistemas VLM: congelar el encoder y conectarlo a un decodificador de lenguaje para construir asistentes multimodales, aprovechando que el modelo esta disenado explicitamente para ese uso.
- Deteccion de duplicados y similitud visual: comparar embeddings de imagen para agrupar imagenes casi identicas en archivos fotograficos o repositorios de medios.
- Triaje y filtrado en dominios cientificos: clasificar imagenes (por ejemplo, placas o muestras) en categorias amplias antes de una revision experta, siempre con supervision humana.
- Accesibilidad y descripcion de imagenes: combinar el encoder con un generador de texto para producir descripciones, usando el modelo como componente de alineacion visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una tabla de evaluacion como imagen (`eval_table.png`) extraida del paper, sin valores numericos en formato texto, por lo que no se reproducen cifras concretas. Para resultados detallados, se debe consultar el paper SigLIP 2 (arXiv:2502.14786).

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 1,5 GB solo para pesos (coincide con el tamano de repo de 1,5 GB), mas activaciones y memoria del procesador de imagen; en la practica, unos 2-4 GB con lotes pequenos.
- VRAM estimada en fp16/bf16: en torno a 0,75 GB para pesos, mas overhead de inferencia.
- VRAM estimada en int8: en torno a 0,4 GB para pesos, si se aplica cuantizacion (no se documenta en el repositorio).
- GPU consumer: cabe holgadamente en cualquier GPU con 4 GB o mas de VRAM, incluidas GTX 1650, RTX 3050, RTX 3060, RTX 4060 y superiores; tambien es viable en CPU para inferencia por lotes pequenos.
- GPU de datacenter: A100, H100, L40S o TPU para procesamiento de grandes volumenes; el modelo se entreno en TPU-v5e, aunque para inferencia no requiere ese hardware.
- Despliegue: soporte nativo en la libreria transformers mediante `pipeline(task="zero-shot-image-classification")` y `AutoModel`/`AutoProcessor`; el tag `endpoints_compatible` indica compatibilidad con Inference Endpoints de HuggingFace. Conversiones a ONNX u otros runtimes no se documentan en la informacion proporcionada.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto / entrada | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| CollectionStudio/siglip2-base-patch16-384 (este repositorio) | 375.479.810 | Imagen 384 px con parches de 16; texto de longitud fija (valor no disponible) | apache-2.0 | HuggingFace, transformers | Redistribucion del checkpoint de Google; 0 descargas, 0 likes |
| google/siglip2-base-patch16-384 (upstream) | No disponible en la informacion proporcionada | Identica variante patch16-384 | apache-2.0 | HuggingFace, transformers | Checkpoint original del autor; misma arquitectura y receta |
| google/siglip-base-patch16-384 (SigLIP 1) | No disponible en la informacion proporcionada | Imagen 384 px con parches de 16 | apache-2.0 | HuggingFace, transformers | Predecesor directo; sin los objetivos adicionales de SigLIP 2 |
| OpenAI CLIP ViT-B/32 | Aproximadamente 151 millones | Imagen 224 px con parches de 32 | Licencia del repositorio original (consultar) | GitHub de OpenAI y espejos comunitarios | Referencia clasica de contraste imagen-texto; resolucion y patch menores |

Los datos de rendimiento comparado no estan disponibles en la informacion proporcionada. La tabla de evaluacion del paper no se ha podido extraer en formato numerico.

## Limitaciones y advertencias

- Sesgos heredados del dataset WebLI: la procedencia web del corpus introduce sesgos demograficos, culturales y geograficos que pueden reflejarse en las etiquetas asignadas.
- No es un modelo generativo: no produce texto, por lo que no hay "alucinacion" en sentido estricto, pero si puede asignar etiquetas incorrectas con alta confianza cuando las etiquetas candidatas no cubren la imagen.
- Sensibilidad al prompt: el rendimiento en clasificacion zero-shot depende de la redaccion exacta de las etiquetas de texto; formulaciones pobres degradan los resultados.
- Calibracion de confianza: los valores devueltos no equivalen a probabilidades calibradas para todas las distribuciones de etiquetas; conviene validar umbrales en el dominio objetivo.
- Idiomas: no se documentan en el repositorio los idiomas soportados por la torre de texto; el paper lo describe como multilingue, pero se debe verificar en el caso de uso concreto.
- Resolucion fija en esta variante: patch16-384 define una configuracion concreta; variar la resolucion puede requerir la variante adecuada del modelo.
- Licencia: Apache 2.0 permite uso comercial y modificacion, con obligacion de conservar avisos de licencia y atribucion; al tratarse de una redistribucion, se debe verificar la trazabilidad respecto al checkpoint original de Google.
- Repositorio sin traccion: 0 descargas y 0 likes, creado en octubre de 2026; conviene preferir el repositorio oficial de Google para produccion y para trazabilidad de versiones.
- Caveat de produccion: al ser un encoder de contraste, cualquier tarea de descripcion, dialogo o razonamiento requiere un componente generativo adicional.

## Enlaces

- Repositorio analizado: https://huggingface.co/CollectionStudio/siglip2-base-patch16-384
- Checkpoint original (referenciado en la model card): https://huggingface.co/google/siglip2-base-patch16-384
- Paper de SigLIP 2: https://arxiv.org/abs/2502.14786
- Paper de SigLIP: https://arxiv.org/abs/2303.15343
- Paper del dataset WebLI: https://arxiv.org/abs/2209.06794
- Documentacion de SigLIP en transformers: https://huggingface.co/transformers/main/model_doc/siglip.html
- Imagen de ejemplo del widget: https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/bee.jpg
- Tabla de evaluacion del paper (imagen citada en la model card): https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/sg2-blog/eval_table.png
