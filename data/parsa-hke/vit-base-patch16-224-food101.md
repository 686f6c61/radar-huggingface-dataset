# parsa-hke/vit-base-patch16-224-food101

## Resumen

parsa-hke/vit-base-patch16-224-food101 es un modelo de clasificacion de imagenes publicado en Hugging Face por el usuario parsa-hke. El identificador y el recuento de parametros (85.876.325) son coherentes con un Vision Transformer ViT-Base (patch 16, resolucion 224x224) cuya cabeza de clasificacion tiene 101 clases en lugar de las 1000 de ImageNet, lo que apunta a un ajuste fino sobre el dataset Food-101. Es una inferencia razonada a partir del nombre y del numero de parametros: el autor no confirma en ningun momento el dataset ni el procedimiento de entrenamiento.

La model card es la plantilla automatica de transformers sin una sola seccion rellenada. No hay descripcion del modelo, ni datos de entrenamiento, ni hiperparametros, ni resultados de evaluacion, ni informacion sobre licencia, idiomas o uso previsto. El repositorio ocupa 0,4 GB y contiene pesos en safetensors y una exportacion ONNX, ambas compatibles con el pipeline image-classification de transformers.

Su relevancia practica es limitada y hay que ser honesto al respecto: se trata de un modelo pequeno y barato de ejecutar (apto para CPU y para cualquier GPU de consumo), pero publicado con cero descargas, cero likes, sin licencia declarada y sin metrica alguna que permita verificar su calidad. Es util como punto de partida reproducible o como baseline academico, no como componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-Base, patch 16, 224x224); 12 capas, dimension oculta 768, 12 cabezas (inferido del identificador y del recuento de parametros) |
| Parametros totales | 85.876.325 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; 197 posiciones = 196 parches de 16x16 mas token de clase a 224x224 px) |
| Tipos de cuantizacion | no disponible (el repositorio incluye safetensors y ONNX; no se documentan variantes GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | no disponible (las etiquetas de clase no estan documentadas; en Food-101 serian nombres de plato en ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors y ONNX |
| Pipeline | image-classification |
| Tamano del repositorio | 0,4 GB |
| Fecha de publicacion | 2026-10-06 (creacion y ultima actualizacion el mismo dia) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura declarada por las etiquetas del repositorio es `vit`, es decir, un Vision Transformer. El recuento exacto de parametros (85.876.325) coincide con el de un ViT-Base estandar al que se le sustituye la cabeza de 1000 clases de ImageNet (86.567.656 parametros) por una de 101 clases, lo que reduce el total en exactamente 691.331 parametros. Este detalle cuadra con el sufijo `food101` del nombre y con la estructura del dataset Food-101, que tiene 101 categorias. No obstante, el autor no documenta nada de esto y debe tratarse como una deduccion, no como un dato confirmado.

No hay informacion sobre el dataset de entrenamiento, el numero de tokens o imagenes vistas, las tecnicas de regularizacion, el regimen de precision (fp32, fp16, bf16), el uso de RLHF/DPO (no aplicable en clasificacion de imagenes) ni la procedencia de los pesos iniciales. Tampoco se especifica si hubo aumento de datos, congelacion de capas, reentrenamiento completo o busqueda de hiperparametros. La etiqueta `arxiv:1910.09700` que aparece en el repositorio corresponde al articulo de Lacoste et al. sobre calculo de emisiones de carbono, citado en la propia plantilla de la model card; no es una referencia al paper original de ViT (arXiv:2010.11929), que no se menciona explicita ni implicitamente.

## Capacidades

- Clasificacion de imagenes en 101 categorias (presumiblemente clases de comida de Food-101), devolviendo una distribucion de probabilidad sobre las clases.
- Inferencia sobre imagenes RGB a 224x224 pixeles, con el preprocesado estandar de ViT (redimensionado, recorte central y normalizacion ImageNet).
- Exportacion a ONNX, lo que permite ejecucion fuera del ecosistema PyTorch mediante ONNX Runtime.
- Compatibilidad con el pipeline `image-classification` de transformers y con los endpoints de Hugging Face (`endpoints_compatible`).
- No es un modelo generativo: no produce texto, ni codigo, ni razonamiento en lenguaje natural.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues en el sentido NLP; su unica salida son etiquetas de clase.
- No dispone de modo "thinking", vision multimodal con lenguaje, audio ni entrada de video.
- No hay capacidad documentada de deteccion de objetos, segmentacion ni captioning: es exclusivamente clasificacion de imagen completa.

## Casos de uso

- Registro dietetico en aplicaciones de nutricion: el usuario fotografia un plato y la aplicacion obtiene una etiqueta de categoria para estimar ingredientes y calorias. El modelo es adecuado por su tamano reducido, que permite ejecucion en el propio dispositivo sin enviar la imagen a un servidor.
- Etiquetado automatico de catalogos en plataformas de reparto de comida: clasificar las fotos subidas por restaurantes para asignarlas a la categoria correcta del menu, reduciendo el trabajo manual de moderacion.
- Preetiquetado en pipelines de anotacion humana: usar el modelo como primer paso de etiquetado y que los anotadores corrijan, con un coste computacional minimo y solo 86 M de parametros que ejecutar.
- Control de calidad en cadenas de restauracion: verificar de forma automatizada que la foto de un producto corresponde a la categoria declarada en el sistema de gestion, por ejemplo en auditorias de franquicias.
- Analisis de tendencias gastronomicas en redes sociales: procesar grandes volumenes de imagenes publicas y agregar la distribucion de categorias por region o periodo temporal. Su coste de inferencia bajo hace viable el procesamiento por lotes a gran escala.
- Baseline academico y experimentos de destilacion: al ser un ViT-Base estandar ajustado a 101 clases, sirve como referencia reproducible para comparar tecnicas de eficiencia, cuantizacion o poda en investigacion sobre clasificacion de imagenes.
- Filtrado previo en sistemas de recomendacion de recetas: dada la foto de un plato disponible en la nevera o en un menu, mapear a una categoria y sugerir recetas relacionadas.
- Despliegue en edge y entornos sin GPU: gracias a la exportacion ONNX y a los aproximadamente 86 MB que ocupa en INT8, puede ejecutarse en dispositivos embebidos o en CPU de servidor sin acelerador dedicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye ninguna seccion de evaluacion (todas las secciones aparecen con el texto "[More Information Needed]"), y la busqueda web no ha devuelto ningun articulo, informe o publicacion que reporte metricas de este modelo. No hay datos de exactitud sobre Food-101, ni sobre ImageNet, ni de latencia medida.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 85.876.325 parametros, no verificada experimentalmente): aproximadamente 344 MB en fp32, unos 172 MB en fp16/bf16 y unos 86 MB en INT8.
- El modelo cabe holgadamente en cualquier GPU de consumo con al menos 2 GB de VRAM: GTX 1050 Ti, GTX 1650, RTX 3050, RTX 3060, RTX 4060, RTX 4090, entre otras. No requiere GPU de datacenter.
- GPU de datacenter (A100, H100, L40S, A10) solo tienen sentido para servir lotes muy grandes en paralelo, no por requisito de memoria.
- Inferencia en CPU perfectamente viable, especialmente con la exportacion ONNX; es la opcion recomendada para despliegues de bajo volumen.
- Opciones de despliegue confirmadas por los formatos del repositorio: pipeline `image-classification` de transformers (PyTorch) y ONNX Runtime. `torch.compile` es aplicable al grafo de PyTorch. No hay soporte documentado ni artefactos publicados para llama.cpp, Ollama, vLLM o TGI, y en general estos motores estan orientados a modelos generativos.
- Latencia y throughput: no disponibles. No se han publicado mediciones y no seria riguroso estimarlas sin datos del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| parsa-hke/vit-base-patch16-224-food101 | 85.876.325 | 224x224 | Clasificacion en 101 clases (Food-101, presumiblemente) | no disponible | Hugging Face; 0 descargas, 0 likes |
| google/vit-base-patch16-224 | 86.567.656 (aprox.) | 224x224 | Clasificacion en 1000 clases (ImageNet-1k) | Apache 2.0 | Hugging Face; ampliamente utilizado y validado |
| google/vit-base-patch16-224-in21k | aprox. 86 M | 224x224 | Pesos preentrenados en ImageNet-21k, sin cabeza ajustada a una tarea final | Apache 2.0 | Hugging Face; opcion habitual como punto de partida para fine-tuning |
| ConvNeXt-tiny (facebook/convnext-tiny-224) | aprox. 28,6 M | 224x224 | Clasificacion en 1000 clases (ImageNet-1k) | Apache 2.0 | Hugging Face; alternativa convolucional mas ligera |

La comparacion de rendimiento no es posible: no hay metricas publicadas para el modelo de parsa-hke ni una declaracion clara de la tarea exacta, mientras que los modelos de Google y Meta si tienen resultados publicos sobre ImageNet. La diferencia principal no esta en la arquitectura (todos son ViT-Base o equivalentes), sino en la trazabilidad: los modelos de referencia documentan datos, licencia y evaluacion, y este no.

## Limitaciones y advertencias

- Licencia no declarada: sin una licencia explicita no hay autorizacion clara para uso comercial. Es un riesgo legal directo y desaconseja su integracion en productos en produccion sin contactar antes con el autor.
- Model card completamente vacia: no hay informacion sobre datos de entrenamiento, composicion del dataset, procedimiento de ajuste ni evaluacion. Es imposible auditar sesgos o fidelidad.
- Cero validacion de la comunidad: 0 descargas y 0 likes en el momento de redactar la ficha. No hay evidencia independiente de que el modelo funcione correctamente ni de que los pesos esten bien entrenados.
- La tarea concreta es una deduccion, no un dato confirmado. Si la cabeza de 101 clases no corresponde a Food-101, las etiquetas de salida serian distintas de las esperadas.
- Espacio de etiquetas cerrado: el modelo solo puede devolver una de las 101 clases para las que fue entrenado. Cualquier imagen ajena a esas categorias recibira igualmente una etiqueta, sin mecanismo de rechazo ni clase "desconocido".
- Sesgo del dataset Food-101: se trata de un conjunto con predominio de cocina occidental (principalmente estadounidense y europea), con una representacion muy desigual entre categorias. Es previsible un peor desempeno en cocinas de otras regiones.
- Riesgo de alucinacion en el sentido de clasificacion erronea con alta confianza: no hay datos de calibracion ni temperaturas recomendadas, por lo que los valores de softmax no deben interpretarse como probabilidades fiables.
- Sensibilidad al preprocesado: rendimiento dependiente del redimensionado, recorte y normalizacion exactos. Variaciones en la relacion de aspecto o recortes agresivos pueden degradar el resultado.
- Resolucion fija de 224x224: se pierde detalle en imagenes de alta resolucion, lo que perjudica la discriminacion entre platos visualmente similares.
- Idiomas: las etiquetas de clase estan presumiblemente en ingles y no hay traduccion documentada.
- No es un modelo generativo y no debe emplearse para tareas de descripcion, dialogo o codigo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/parsa-hke/vit-base-patch16-224-food101
- Paper original de Vision Transformer (Dosovitskiy et al., 2020): https://arxiv.org/abs/2010.11929
- Referencia del tag arXiv presente en el repositorio (Lacoste et al., 2019, emisiones de carbono): https://arxiv.org/abs/1910.09700
- Pesos de referencia google/vit-base-patch16-224: https://huggingface.co/google/vit-base-patch16-224
- Pesos de referencia google/vit-base-patch16-224-in21k: https://huggingface.co/google/vit-base-patch16-224-in21k
- Dataset Food-101 (ETH Zurich): https://data.vision.ee.ethz.ch/cvl/datasets_extra/food-101/
- Documentacion del pipeline image-classification de transformers: https://huggingface.co/docs/transformers/main/en/tasks/image_classification

Nota: las busquedas web realizadas no han devuelto ningun resultado relevante sobre este modelo concreto. Todos los enlaces devueltos correspondian a entidades ajenas (una galeria de mobiliario, un directorio de television en linea, una pagina de desambiguacion y un proyecto de agricultura), por lo que se han omitido.
