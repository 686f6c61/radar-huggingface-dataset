# aaabushiren/fg-clip2-base

## Resumen

FG-CLIP 2 es un modelo bilingüe de alineación fina visión-lenguaje desarrollado por el grupo 360CVGroup de Qihoo 360. Su objetivo es mejorar la comprensión de detalles finos en imágenes y texto, superando las limitaciones de los modelos CLIP tradicionales que se centran en la correspondencia global imagen-texto. El modelo introduce supervisión de grano fino, como el emparejamiento región-texto y el modelado de descripciones largas, junto con múltiples objetivos discriminativos, lo que le permite capturar relaciones semánticas detalladas entre regiones de la imagen y fragmentos de texto.

Con 383,8 millones de parámetros, FG-CLIP 2 base está disponible en inglés y chino, y según sus autores alcanza el mejor rendimiento publicado hasta la fecha en 29 conjuntos de datos y 8 tareas diversas, superando a modelos recientes como SigLIP 2 y MetaCLIP 2. Se distribuye bajo licencia Apache 2.0 y se integra con la librería Transformers de HuggingFace, lo que facilita su uso en tareas de clasificación de imágenes zero-shot y recuperación de información multimodal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con encoders de vision y texto, con mecanismos de atencion fina (region-text matching) |
| Parametros totales | 383.803.394 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no especificada; en el ejemplo de uso se emplea max_length=196 para captions largas y 64 para cortas |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

FG-CLIP 2 se basa en la arquitectura CLIP, con un encoder de vision y un encoder de texto que proyectan ambas modalidades a un espacio de representacion compartido. La innovacion principal reside en el entrenamiento con supervisión de grano fino: ademas del contraste global imagen-texto, se emplean objetivos de emparejamiento region-texto, donde regiones especificas de la imagen se alinean con fragmentos de texto correspondientes, y modelado de descripciones largas que obliga al modelo a comprender detalles semanticos mas alla de la correspondencia global. Tambien se utilizan multiples objetivos discriminativos para refinar la separacion entre conceptos visuales y textuales similares.

El modelo se entrena con datos bilingues (ingles y chino) y, segun el paper, logra un rendimiento superior a SigLIP 2 y MetaCLIP 2 en una amplia gama de tareas de comprension fina. No se han publicado detalles especificos sobre el volumen de datos de entrenamiento, el numero de tokens o el uso de tecnicas como RLHF o DPO en la informacion disponible.

## Capacidades

- Clasificacion de imagenes zero-shot: el modelo puede clasificar imagenes en categorias definidas por texto sin necesidad de entrenamiento adicional, gracias a la alineacion vision-lenguaje.
- Recuperacion de imagenes por texto y viceversa: permite buscar imagenes a partir de descripciones textuales detalladas, y encontrar textos relevantes para una imagen dada.
- Alineacion fina de regiones: es capaz de asociar partes especificas de una imagen (objetos, atributos, relaciones) con fragmentos de texto correspondientes, lo que mejora la precision en tareas de grounding visual.
- Bilingue ingles-chino: soporta consultas y descripciones en ambos idiomas, con un rendimiento comparable en ambos.
- Generacion de descripciones largas: aunque su funcion principal es la representacion, el modelo puede utilizarse para generar captions detalladas de imagenes, como se muestra en el ejemplo de uso con `walk_type="long"`.
- Integracion con Transformers: se carga mediante `AutoModelForCausalLM` y `AutoImageProcessor`, lo que permite su uso en pipelines estandar de HuggingFace.

## Casos de uso

- Busqueda visual en comercio electronico: un usuario describe un producto con gran detalle ("vestido azul con estampado floral y cuello redondo") y el modelo recupera las imagenes mas relevantes del catalogo gracias a su alineacion fina y soporte bilingue.
- Moderacion de contenido visual: clasificacion automatica de imagenes en categorias de riesgo (violencia, desnudez, etc.) mediante prompts textuales, sin necesidad de entrenar clasificadores especificos.
- Asistencia a personas con discapacidad visual: generacion de descripciones detalladas de escenas o objetos a partir de imagenes capturadas, ayudando a entender el entorno.
- Analisis de imagenes medicas: clasificacion de radiografias o tomografias en categorias diagnosticas mediante descripciones textuales, aunque se requiere validacion clinica adicional.
- Sistemas de recomendacion visual: alinear imagenes de productos con intereses expresados en texto, mejorando la precision de recomendaciones en plataformas de contenido.
- Organizacion de archivos fotograficos: indexacion automatica de bibliotecas de imagenes mediante etiquetas textuales generadas a partir de las propias imagenes, facilitando la busqueda posterior.
- Investigacion en vision por computador: como modelo base para tareas de grounding, segmentacion referida o respuesta visual a preguntas, gracias a su capacidad de alineacion fina.

## Benchmarks y rendimiento

Segun la model card, FG-CLIP 2 supera a SigLIP 2 y MetaCLIP 2 en 29 conjuntos de datos y 8 tareas diversas, logrando el mejor rendimiento publicado hasta la fecha en ingles y chino. Sin embargo, no se han proporcionado cifras concretas de benchmarks (MMLU, HumanEval, etc.) en la informacion disponible. No se pueden presentar tablas numericas sin datos verificados.

## Requisitos de hardware

- VRAM estimada: con 383,8 millones de parametros, en precision fp16 el modelo ocupa aproximadamente 0,77 GB; en fp32 unos 1,54 GB. La inferencia puede ejecutarse en GPUs consumer con al menos 4 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA, como NVIDIA RTX 3060, RTX 4070, o superiores. Para procesamiento por lotes grande, se recomienda una GPU con 8 GB o mas.
- Despliegue: al ser un modelo de Transformers, puede servirse con vLLM, TGI o directamente con la libreria Transformers en Python. Tambien es compatible con frameworks de optimizacion como ONNX Runtime o TensorRT.
- Latencia y throughput: no se han publicado datos especificos. En una GPU consumer, la inferencia de una sola imagen suele estar por debajo de 100 ms, dependiendo del tamaño de la imagen y la longitud del texto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| FG-CLIP 2 base | 383,8 M | no especificado | en, zh | Apache 2.0 | Alineacion fina bilingue, supera a SigLIP 2 y MetaCLIP 2 en tareas finas |
| SigLIP 2 | no disponible | no disponible | principalmente en | no disponible | Modelo CLIP con perdida sigmoide, fuerte en clasificacion global |
| MetaCLIP 2 | no disponible | no disponible | principalmente en | no disponible | Variante de CLIP con curado de datos, enfocado en escalabilidad |

No se dispone de datos numericos comparativos publicados en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos: al entrenarse con datos web, el modelo puede heredar sesgos culturales y de genero presentes en las imagenes y textos de entrenamiento, especialmente en conceptos estereotipados.
- Alucinacion en descripciones: aunque no es un modelo generativo puro, al generar captions largas puede producir detalles inexistentes en la imagen, especialmente en escenas complejas.
- Limitaciones de contexto: la longitud de las descripciones de texto esta limitada (64 tokens para cortas, 196 para largas en el ejemplo), lo que puede restringir la captura de informacion muy extensa.
- Dependencia de la calidad de las imagenes: la alineacion fina puede fallar con imagenes de baja resolucion, oclusiones o condiciones de iluminacion adversas.
- Licencia: Apache 2.0 permite uso comercial sin restricciones, pero se recomienda revisar las condiciones de la implementacion original de Qihoo 360.
- Soporte limitado de idiomas: solo ingles y chino; otros idiomas no estan cubiertos y el rendimiento puede degradarse significativamente.

## Enlaces

- Modelo en HuggingFace (este repositorio): https://huggingface.co/aaabushiren/fg-clip2-base
- Modelo original de Qihoo 360: https://huggingface.co/qihoo360/fg-clip2-base
- Coleccion de modelos FG-CLIP 2: https://huggingface.co/collections/qihoo360/fg-clip-2
- Paper FG-CLIP 2 (arXiv 2510.10921): https://arxiv.org/abs/2510.10921
- Paper FG-CLIP 1 (arXiv 2505.05071): https://arxiv.org/abs/2505.05071
- Repositorio GitHub: https://github.com/360CVGroup/FG-CLIP
- Pagina del proyecto: https://360cvgroup.github.io/FG-CLIP
