# juan1211/pratos-convnext-tiny-food101

## Resumen

`pratos-convnext-tiny-food101` es un clasificador de imagenes de platos de comida obtenido mediante ajuste fino de ConvNeXt-Tiny (preentrenado en ImageNet-1k) sobre el dataset Food-101, que contiene 101 categorias de platos con 1.000 imagenes cada una. Lo desarrolla el usuario de Hugging Face `juan1211` como parte del proyecto `pratos`, orientado a organizar menus y catalogos de restaurantes a partir de fotografias. El modelo resuelve una tarea acotada de vision por computador: asignar una de 101 etiquetas de plato a una imagen, con top-1 del 87,31% y top-5 del 97,78% sobre el split de validacion de Food-101.

Arquitectonicamente es una red convolucional pura de tipo ConvNeXt en su variante tiny, con 27.897.797 parametros totales y un repositorio de 0,3 GB. No es un modelo generativo ni multimodal: no procesa texto, no admite prompts y no tiene ventana de contexto en el sentido de los LLM. Su interes practico esta en el despliegue ligero: se distribuye en safetensors para PyTorch y en ONNX (fp32 de 107 MB y una version cuantizada int8 de 33 MB) para ejecucion en navegador con transformers.js, con una latencia declarada de 119 ms en CPU de 2 vCPU.

Es relevante ahora por dos motivos. Primero, sirve como ejemplo de modelo de vision pequeno, licencia Apache-2.0 y listo para produccion en el borde (edge), sin GPU. Segundo, porque la model card publica datos de calibracion y latencia poco habituales en modelos de este tamano, lo que facilita decidir umbrales de confianza en un flujo real de clasificacion con revision humana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt-Tiny (red convolucional pura, no transformer) |
| Parametros totales | 27.897.797 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de clasificacion de imagenes) |
| Tipos de cuantizacion | fp32 (PyTorch y ONNX) e int8 en las capas lineales (ONNX `model_quantized.onnx`) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX (`model.onnx`, `model_quantized.onnx`) |
| Resolucion de entrada | 224x224 (heredada de `facebook/convnext-tiny-224`) |
| Numero de clases | 101 (Food-101) |
| Modelo base | facebook/convnext-tiny-224 |
| Dataset de ajuste | ethz/food101 |
| Tamano del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

El modelo parte de `facebook/convnext-tiny-224`, una ConvNeXt-Tiny preentrenada en ImageNet-1k. ConvNeXt es una familia de redes convolucionales modernizadas que incorporan decisiones de diseno propias de los Vision Transformers (kernels grandes de 7x7, normalizacion LayerNorm, activacion GELU y estructura por etapas con bloques residuales) manteniendo la operacion convolucional. La cabeza de clasificacion original de 1.000 clases de ImageNet se sustituyo por una de 101 clases correspondiente a Food-101.

El ajuste fino fue corto: 3 epocas sobre una GPU T4 de Colab, con un tiempo total de 26,7 minutos, tasa de aprendizaje 2e-4 con decaimiento coseno y 200 pasos de calentamiento, tamano de lote 64 y precision fp16. La aumentacion en entrenamiento consistio en recorte aleatorio y espelhado; en evaluacion se aplico reduccion de escala y recorte central. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de destilacion, algo esperable en un modelo discriminativo de este tipo. Tampoco se detalla el numero exacto de imagenes de entrenamiento utilizadas mas alla del split estandar de Food-101.

La innovacion tecnica destacable no esta en el entrenamiento sino en el empaquetado: se exporto el modelo a ONNX en fp32 y se cuantizaron las capas lineales a int8, lo que reduce el peso de 107 MB a 33 MB. Segun la model card, en 500 fotos de prueba la version fp32 coincide con la prediccion principal de PyTorch en el 100% de los casos y la int8 en el 98,6%.

## Capacidades

- Clasificacion de imagenes de comida en 101 categorias de Food-101, devolviendo probabilidades por clase y permitiendo top-k.
- Inferencia en navegador mediante transformers.js con el backend ONNX, incluyendo la variante cuantizada int8.
- Inferencia en Python con la pipeline `image-classification` de transformers.
- Ejecucion en CPU con latencia baja (119 ms por foto en 2 vCPU, p95 de 175 ms), sin necesidad de GPU.
- Calibracion razonable: error de calibracion de 0,043, con un 99,1% de acierto cuando la confianza es igual o superior a 0,9 (lo que ocurre en el 59% de las fotos).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto.
- No tiene capacidades multilingues ni procesamiento de lenguaje: la salida es unicamente un vector de 101 probabilidades asociado a etiquetas de platos.
- No soporta vision mas alla de la clasificacion de una unica imagen de entrada; no hay deteccion, segmentacion ni captioning.

## Casos de uso

- Digitalizacion de cartas de restaurante: a partir de las fotos que envia el restaurante, el modelo asigna una categoria de plato y permite agrupar automaticamente el catalogo por secciones (entrantes, postres, carnes) sin intervencion manual en la mayoria de los casos.
- Moderacion y etiquetado de contenido gastronomico en plataformas: clasificar imagenes subidas por usuarios para enrutarlas a la categoria correcta o para detectar fotos que no corresponden a comida, usando el top-5 y un umbral de confianza.
- Control de calidad en cocina centralizada: verificar que la foto de un plato terminado coincide con la receta esperada antes de publicarla en una app de pedidos, con revision humana solo en los casos de baja confianza.
- Asistente de inventario y menu semanal: dado un lote de fotos de platos preparados, generar estadisticas de que categorias se producen mas, apoyandose en la inferencia en CPU para procesar lotes sin coste de GPU.
- Aplicacion web o PWA sin backend: usando la version ONNX int8 con transformers.js, la clasificacion se ejecuta en el navegador del usuario, lo que evita enviar imagenes a un servidor y reduce requisitos de infraestructura.
- Pipeline de anotacion asistida para nuevos datasets: preetiquetar imagenes de comida con las 101 clases de Food-101 y reservar la revision manual para las predicciones con confianza inferior a 0,9, lo que segun la model card cubre aproximadamente el 41% de las fotos.
- Prototipado rapido de productos de vision: al ser un modelo de 28M de parametros con licencia Apache-2.0, sirve como linea base para comparar frente a alternativas mas grandes antes de invertir en un modelo propio.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente, `verified: false`), sobre el split de validacion de Food-101 (25.250 imagenes de test revisadas a mano por los autores del dataset):

| Metrica | Valor |
|---|---|
| Top-1 accuracy | 87,31% (IC 95%: 86,9% - 87,7%) |
| Top-5 accuracy | 97,78% |
| Error de calibracion | 0,043 |
| Latencia en CPU, una foto (2 vCPU) | 119 ms (p95: 175 ms) |
| Acierto con confianza >= 0,9 (59% de las fotos) | 99,1% |
| Coincidencia ONNX fp32 vs PyTorch (500 fotos) | 100% |
| Coincidencia ONNX int8 vs PyTorch (500 fotos) | 98,6% |

Clases con peor rendimiento declaradas: bife (55,6%), bisteca de cerdo (63,2%) y foie gras (66,4%). Confusiones mas frecuentes: bife clasificado como filete mignon (52 fotos), pastel y mousse de chocolate, y tartar de carne y de atun.

No se han publicado en la informacion disponible resultados comparativos frente a otros modelos sobre el mismo split.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para lotes pequenos; el modelo pesa unos 112 MB en fp32 (27,9M de parametros) y unos 33 MB en la version ONNX int8.
- GPU recomendadas: no requiere GPU. Cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) acelera el procesamiento por lotes, pero el modelo esta disenado para CPU.
- Cabe en cualquier GPU consumer y tambien en CPU de 2 vCPU, con latencia declarada de 119 ms por imagen (p95 de 175 ms).
- Opciones de despliegue: PyTorch con transformers (`pipeline("image-classification")`), ONNX Runtime, transformers.js en navegador, y servidores de inferencia genericos compatibles con el formato ONNX. No se documenta soporte especifico para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos generativos de lenguaje.
- Throughput estimado: no disponible de forma explicita; con 119 ms por imagen en 2 vCPU el orden de magnitud es de aproximadamente 8 imagenes por segundo por instancia en ese hardware, sin paralelismo.

## Comparativa con modelos similares

| Modelo | Parametros | Clases | Top-1 en Food-101 | Licencia | Formatos |
|---|---|---|---|---|---|
| pratos-convnext-tiny-food101 | 27,9M | 101 | 87,31% (declarado, no verificado) | Apache-2.0 | safetensors, ONNX fp32/int8 |
| facebook/convnext-tiny-224 (base, ImageNet-1k) | 28,6M | 1.000 (ImageNet) | no disponible para Food-101 | Apache-2.0 | safetensors |
| vidit-16/foodVision (ConvNeXt-Tiny ajustado a Food-101) | no disponible | 101 | no disponible | no disponible | no disponible |

La comparacion con `facebook/convnext-tiny-224` es relevante porque es el punto de partida: el ajuste fino sustituye la cabeza de 1.000 clases de ImageNet por 101 clases de Food-101, de modo que el modelo base no es directamente comparable en esta tarea sin un ajuste previo. El proyecto `vidit-16/foodVision` aparece en la busqueda web como otro ajuste de ConvNeXt-Tiny sobre Food-101 servido con FastAPI, pero no publica metricas en la informacion disponible, por lo que no se puede establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- El modelo solo conoce las 101 clases de Food-101, mayoritariamente de cocina estadounidense, europea y asiatica. Platos de otras tradiciones, como feijoada o coxinha, se asignaran a la clase mas parecida de la lista, con riesgo de error silencioso.
- Las imagenes de entrenamiento de Food-101 contienen ruido de etiqueta de forma intencionada; el split de test fue revisado a mano, pero el modelo hereda parte de esa ambiguedad en clases visualmente proximas (bife frente a filete mignon, tartar de carne frente a tartar de atun).
- Una foto con varios platos recibe una unica etiqueta; no hay deteccion ni clasificacion multi-etiqueta.
- Riesgo de alucinacion en el sentido de sobrconfianza: el modelo siempre devuelve una de las 101 clases, incluso ante imagenes que no son comida. Es imprescindible aplicar umbrales de confianza y, si procede, una clase de rechazo externa.
- La calibracion es aceptable (error 0,043) pero no perfecta: el 41% de las fotos quedan por debajo de 0,9 de confianza y concentran la mayor parte de los errores.
- No procesa texto ni contextos largos; no es adecuado para tareas generativas, de razonamiento o multimodales mas alla de la clasificacion.
- La licencia Apache-2.0 permite uso comercial y modificacion, pero se debe conservar el aviso de licencia y tener en cuenta que el modelo base y el dataset Food-101 tienen sus propias condiciones de uso, que no se detallan en la informacion disponible.
- Los resultados de benchmarks estan declarados por el autor y marcados como no verificados; conviene reproducirlos sobre el propio dominio antes de usarlos en produccion.
- El modelo se creo en noviembre de 2026 y no tiene descargas ni likes registrados en el momento de la consulta, por lo que no hay evidencia de uso en produccion por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/juan1211/pratos-convnext-tiny-food101
- Demo en navegador (Space): https://huggingface.co/spaces/juan1211/pratos
- Codigo, entrenamiento y evaluacion: https://github.com/juan-barross/pratos
- Modelo base: https://huggingface.co/facebook/convnext-tiny-224
- Dataset Food-101: https://huggingface.co/datasets/ethz/food101
- Proyecto comparable en la busqueda web: https://github.com/vidit-16/foodVision
