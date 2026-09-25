# haichteque/gender4-whole-image-5class

## Resumen

gender4-whole-image-5class es un clasificador de imagenes publicado por el usuario haichteque en HuggingFace. Se distribuye como un unico grafo ONNX (`model.onnx`) construido sobre una red MobileNetV2 que recibe la imagen completa (no un recorte de cara) a 256x256 pixeles y devuelve cinco clases mutuamente excluyentes: `real_male`, `real_female`, `anime_male`, `anime_female` y `other`. La clase `other` agrupa contenido sin personas: objetos, animales y paisajes.

El modelo resuelve una tarea muy concreta de vision por computador: distinguir simultaneamente genero percibido y estilo visual (fotografia real frente a ilustracion tipo anime), ademas de descartar imagenes que no contienen personas. Esto lo hace util como etapa de enrutado o de etiquetado automatico dentro de pipelines de vision mas grandes, donde interesa filtrar o separar imagenes antes de aplicar modelos mas costosos.

La relevancia actual del modelo es limitada y hay que ser honesto al respecto: el repositorio acumula 0 descargas y 0 likes en el momento de la consulta, el tamano declarado del repo es de 0,0 GB y no se especifica licencia ni idiomas. El autor si publica una validacion en `metrics.json`: 96,1% de accuracy sobre un conjunto de validacion de 1200 imagenes por clase (6000 imagenes en total) y una tasa de falsos positivos del 0% en la direccion `other` hacia persona. Son cifras del propio autor, no verificadas de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV2 (clasificador de imagen completa, segun la model card) |
| Parametros totales | no disponible de forma explicita; la MobileNetV2 estandar con cabeza de 1000 clases ronda los 3,5 M. Con una cabeza densa de 5 clases el orden de magnitud seria de 2,2 a 3,5 M, pero el autor no publica el dato |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; la entrada es una imagen fija de `[1, 3, 256, 256]` en RGB CHW |
| Tipos de cuantizacion | no disponible; solo se distribuye `model.onnx` con entrada declarada `float32` |
| Idiomas soportados | no aplica; las etiquetas estan definidas en ingles (`real_male`, `real_female`, `anime_male`, `anime_female`, `other`) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`model.onnx`), acompanado de `labels.json` (orden de etiquetas) y `metrics.json` (metricas de validacion) |

## Arquitectura y entrenamiento

La model card indica que se trata de un clasificador "whole-image" basado en MobileNetV2. MobileNetV2 es una red convolucional con bloques de residual invertido y convoluciones separables en profundidad, disenada para inferencia con coste computacional bajo en CPU y dispositivos moviles. El prefijo "whole-image" senala que el modelo no depende de un detector de caras ni de un recorte previo: clasifica la escena tal cual se le entrega. La entrada es un tensor `float32` de forma `[1, 3, 256, 256]`, en orden RGB CHW y con valores normalizados en el rango `[0, 1]` (dividiendo entre 255). Segun la model card, la normalizacion con media y desviacion tipica de ImageNet esta incorporada dentro del propio grafo, de modo que el preprocesado externo se reduce a redimensionar, reordenar canales y dividir por 255. La salida es un tensor `float32` de forma `[1, 5]` con probabilidades softmax en el orden de etiquetas indicado.

No hay informacion publica sobre el dataset de entrenamiento, el numero de tokens o imagenes vistas, la composicion de las clases ni si se aplicaron tecnicas de ajuste como fine-tuning con aumento de datos, destilacion o calibracion. Tampoco se documenta ninguna innovacion tecnica mas alla del uso de la arquitectura MobileNetV2 y de la integracion de la normalizacion en el grafo. La unica validacion reportada es la de `metrics.json`: accuracy del 96,1% con 1200 imagenes por clase y una tasa de falsos positivos del 0% cuando la clase real es `other` (es decir, ninguna imagen sin persona se clasifico erroneamente como persona en ese conjunto). Conviene subrayar que esa tasa se declara solo en la direccion `other` hacia persona; no se publica la matriz de confusion completa ni la tasa de error en la direccion contraria.

## Capacidades

- Clasificacion de imagenes completas en cinco clases mutuamente excluyentes: `real_male`, `real_female`, `anime_male`, `anime_female` y `other`.
- Distincion simultanea de genero percibido y de estilo visual (fotografia real frente a ilustracion de estilo anime) en una sola pasada.
- Deteccion implicita de contenido sin personas mediante la clase `other`, que cubre objetos, animales y paisajes.
- Inferencia sobre imagen completa, sin necesidad de deteccion facial previa ni de alineamiento de rostros.
- Integracion de la normalizacion ImageNet dentro del grafo, lo que simplifica el preprocesado en produccion.
- Capacidad de ejecucion multiplataforma por el formato ONNX (CPU, GPU, aceleradores y navegador mediante ONNX Runtime).
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision generativa, tool calling, function calling, capacidades de agente, modo "thinking", audio ni ninguna otra capacidad multimodal mas alla de la clasificacion de imagen.
- No se documentan capacidades multilingues ni procesamiento de lenguaje, ya que la entrada es exclusivamente visual.

## Casos de uso

- Enrutado previo en pipelines de vision: el modelo actua como primera etapa para decidir si una imagen debe pasar a un detector de personas, a un modelo de reconocimiento facial o a un clasificador de estilos, aprovechando que la clase `other` descarta contenido sin personas con una tasa de falsos positivos declarada del 0% en la validacion del autor.
- Curado y etiquetado de datasets: dado que clasifica imagen completa a 256x256, permite etiquetar grandes volumenes de imagenes por genero y estilo (real frente a anime) sin intervencion manual, generando metadatos para entrenar modelos posteriores.
- Organizacion de bibliotecas de imagenes y activos digitales: separar automaticamente fotografias reales de ilustraciones y agrupar por genero percibido para facilitar la busqueda y el archivado en gestores de medios.
- Moderacion y politicas de contenido en plataformas: identificar de forma rapida si una imagen contiene una persona y si es fotografia o ilustracion, como senal auxiliar para reglas de moderacion o para decidir que filtros adicionales aplicar.
- Analitica de audiencia y recomendacion: agregar estadisticas de genero y estilo sobre las imagenes subidas o consumidas en una plataforma para alimentar sistemas de recomendacion o informes de composicion de contenido.
- Preprocesado para herramientas de edicion y mejora de imagen: elegir la ruta de procesamiento adecuada (por ejemplo, un modelo de superresolucion orientado a ilustracion o uno orientado a fotografia) en funcion de la clase predicha antes de aplicar el modelo costoso.
- Filtrado en dispositivos con recursos limitados: al tratarse de un ONNX compacto derivado de MobileNetV2, puede ejecutarse en movil, navegador o hardware embebido para descartar imagenes irrelevantes antes de enviarlas a un servidor.
- Control de calidad en generacion de imagenes: verificar que las imagenes generadas por un modelo de difusion corresponden al estilo y al genero solicitados en el prompt, como metrica automatica de adherencia.

## Benchmarks y rendimiento

La unica informacion de rendimiento publicada por el autor es la que aparece en la model card y en `metrics.json`. No hay resultados de benchmarks estandar (ImageNet, MMLU, HumanEval, GSM8K u otros), que ademas no aplican a esta tarea.

| Metrica | Valor | Conjunto de evaluacion | Fuente |
|---|---|---|---|
| Accuracy | 96,1% | 1200 imagenes por clase (6000 imagenes en total), validacion retenida | `metrics.json`, segun la model card |
| Tasa de falsos positivos `other` hacia persona | 0% | Mismo conjunto de validacion | `metrics.json`, segun la model card |
| Accuracy por clase | no disponible | no disponible | no disponible |
| Matriz de confusion completa | no disponible | no disponible | no disponible |
| Precision, recall y F1 por clase | no disponible | no disponible | no disponible |

No se han publicado resultados de benchmarks adicionales en la informacion disponible, ni comparaciones con otros modelos sobre el mismo conjunto de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32. MobileNetV2 a 256x256 tiene un coste de activaciones muy bajo; el peso del grafo ONNX en float32 se situa en el orden de decenas de MB, aunque el tamano exacto no se declara (el repositorio figura como 0,0 GB, dato no fiable).
- GPU recomendadas: cualquier GPU moderna es mas que suficiente. NVIDIA T4, L4, RTX 3060, RTX 4090, A100 o H100 sirven sobradamente, pero estaran infrautilizadas; la carga realista es CPU.
- Viabilidad en GPU de consumo: si, en cualquier GPU de consumo con soporte CUDA, DirectML o ROCm, e incluso en GPU integrada. El modelo cabe holgadamente en cualquier configuracion.
- Viabilidad en CPU: si, es el escenario natural. Un modelo MobileNetV2 a 256x256 puede ejecutarse en CPU de escritorio en el orden de milisegundos por imagen, y es viable en Raspberry Pi y en dispositivos moviles mediante ONNX Runtime Mobile. No se publican cifras de latencia medidas.
- Latencia y throughput estimados: no disponible. No hay mediciones publicadas de latencia ni de imagenes por segundo en ningun hardware.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, TensorRT, DirectML, OpenVINO como execution provider), TensorRT para maxima aceleracion en NVIDIA, OpenVINO para CPU Intel, ONNX Runtime Web o WebGPU para navegador, ONNX Runtime Mobile para Android e iOS, y servidores de inferencia como Triton Inference Server o BentoML para despliegue HTTP. Herramientas orientadas a modelos de lenguaje como vLLM, llama.cpp, Ollama o TGI no son aplicables a este modelo.

## Comparativa con modelos similares

No se ha identificado en la informacion disponible ningun modelo directamente comparable que resuelva la misma tarea de cinco clases (genero percibido y estilo real/anime sobre imagen completa) y que publique metricas sobre el mismo conjunto de evaluacion. La comparacion siguiente es puramente arquitectonica, entre la red base declarada y otras redes de clasificacion de coste similar; no implica comparacion de rendimiento en esta tarea, que es "no disponible" en todos los casos.

| Modelo | Parametros (aprox.) | Entrada tipica | Licencia | Disponibilidad | Rendimiento en esta tarea |
|---|---|---|---|---|---|
| gender4-whole-image-5class (MobileNetV2) | 2,2-3,5 M (estimado, no confirmado) | 256x256 RGB | no disponible | ONNX en HuggingFace, 0 descargas | 96,1% accuracy segun el autor |
| MobileNetV3-Large | ~5,4 M | 224x224 RGB | Apache 2.0 (implementaciones de referencia) | Amplia, multiples repositorios | no disponible |
| EfficientNet-B0 | ~5,3 M | 224x224 RGB | Apache 2.0 (implementacion de referencia) | Amplia | no disponible |
| ResNet-18 | ~11,7 M | 224x224 RGB | Permisiva en implementaciones de referencia | Amplia | no disponible |

Como referencia de categoria, para el etiquetado de ilustraciones y anime existen taggers basados en vision-lenguaje (por ejemplo, variantes de WD14 y modelos derivados de DeepDanbooru) que cubren muchas mas etiquetas que estas cinco clases, pero no se dispone de datos que permitan compararlos con este modelo en su tarea concreta.

## Limitaciones y advertencias

- Validacion no independiente: el 96,1% de accuracy y el 0% de falsos positivos `other` hacia persona son cifras del propio autor, sin verificacion externa ni publicacion de la matriz de confusion completa.
- Tamano de evaluacion limitado y no detallado: 1200 imagenes por clase es un conjunto de validacion de 6000 imagenes; no se describe su procedencia, su composicion demografica ni como se evito la fuga de datos respecto al entrenamiento.
- Sesgos potenciales: la clasificacion de genero percibido a partir de la apariencia es una tarea intrinsecamente sensible y propensa a sesgos de genero, edad, etnia, iluminacion y presentacion. El modelo no infiere identidad de genero, sino una categoria visual estimada. No se documenta ningun analisis de sesgo ni de equidad entre subgrupos.
- Riesgo de alucinacion: no aplica en el sentido generativo (el modelo no produce texto), pero si existe riesgo de clasificacion erronea en imagenes ambiguas, ilustraciones de estilo realista, personas de espaldas, multitudes, dibujos de estilo occidental no anime o contenido con personas parcialmente visibles.
- Ambiguedad de la clase `other`: la model card la define como contenido sin personas (objetos, animales, paisajes), pero no se detalla como se tratan casos limite como personas muy pequenas en la escena, maniquies, estatuas o personajes antropomorficos.
- Dependencia del estilo: la separacion entre `real_*` y `anime_*` puede degradarse con estilos intermedios (3D, semirrealista, pixel art, comic occidental) que no estan representados en las etiquetas.
- Restricciones de licencia: la licencia no esta declarada en el repositorio. Sin una licencia explicita, no hay autorizacion clara para uso comercial ni para redistribucion, y la situacion legal del modelo es indeterminada. Conviene contactar con el autor antes de cualquier uso en produccion.
- Adopcion nula: 0 descargas y 0 likes, repositorio sin comunidad, sin issues y sin mantenimiento demostrable. No hay garantia de soporte ni de actualizaciones.
- Metadatos incompletos: no se declaran idiomas (no aplica), ni version del modelo, ni fecha de los datos de entrenamiento, ni procedencia del dataset. El repositorio figura con un tamano de 0,0 GB, lo que impide validar que los artefactos esten completos.
- Precision de los pesos: la model card declara entrada `float32`, pero no especifica la precision de los pesos ni ofrece variantes cuantizadas; el comportamiento tras una cuantizacion int8 propia no esta documentado.
- Uso responsable: cualquier despliegue que clasifique personas por genero percibido debe cumplir la normativa aplicable de proteccion de datos y no discriminacion, y conviene limitar su uso a tareas de enrutado o etiquetado interno, no a decisiones con impacto sobre personas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/haichteque/gender4-whole-image-5class
- Archivo de pesos: https://huggingface.co/haichteque/gender4-whole-image-5class/blob/main/model.onnx
- Orden de etiquetas: https://huggingface.co/haichteque/gender4-whole-image-5class/blob/main/labels.json
- Metricas de validacion: https://huggingface.co/haichteque/gender4-whole-image-5class/blob/main/metrics.json
- Paper de MobileNetV2 (Sandler et al., 2018): https://arxiv.org/abs/1801.04381
- Documentacion de ONNX Runtime: https://onnxruntime.ai/docs/
- No se han encontrado en la informacion disponible papers, blogs, repositorios adicionales ni demos especificos de este modelo.
