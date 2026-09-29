# ANGExllL/teal-falcon

## Resumen

teal-falcon es un modelo de clasificacion de imagenes publicado por el usuario ANGExllL en HuggingFace. Se trata de un EfficientNetV2-L de torchvision (`efficientnet_v2_l`, 1000 clases de ImageNet) afinado mediante entrenamiento adversarial para la subred Perturb (netuid 26) de Bittensor. No es un modelo de lenguaje: no genera texto, no razona y no admite instrucciones en lenguaje natural; su unica tarea es asignar una de las 1000 clases de ImageNet-1K a una imagen de entrada.

El checkpoint tiene 119.027.848 parametros reales (verificados en el safetensors) y ocupa aproximadamente 0,5 GB en el repositorio, lo que corresponde a pesos en fp32. La relevancia del modelo es de nicho: sirve como referencia de minero en la subred Perturb, un mercado descentralizado de modelos robustos frente a perturbaciones adversarias, y como punto de partida para experimentos de robustez adversarial en vision por computador. Fuera de ese contexto, su interes practico es limitado, ya que es un clasificador de 1000 clases sin capacidades generativas.

La licencia es Apache 2.0, lo que permite uso comercial sin restricciones significativas. El repositorio no incluye informacion sobre metricas de rendimiento, composicion del dataset de afinado ni detalles del procedimiento adversarial mas alla de la mencion en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNetV2-L (CNN con bloques MBConv y Fused-MBConv, escalado compuesto) |
| Parametros totales | 119.027.848 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de vision, no procesa secuencias de texto) |
| Tipos de cuantizacion | No disponible (el repositorio solo publica pesos en safetensors, presumiblemente fp32) |
| Idiomas soportados | No aplica / no disponible (clasificacion de imagenes, sin capacidades linguisticas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`) |

Datos adicionales:

| Parametro | Valor |
|---|---|
| Tarea (pipeline) | image-classification |
| Numero de clases | 1000 (ImageNet-1K) |
| Resolucion de entrada | 480 x 480 (redimension bicubica + center crop) |
| Normalizacion | media = desviacion = 0,5 |
| Libreria | torchvision |
| Tamano del repositorio | 0,5 GB |
| Hash on-chain | sha256(model.safetensors \|\| hotkey) = `7178720ee3d3a9d123823f4dcce6c15806ae88624fc60f9d56250712a9eab5d9` |
| Hotkey del minero | `5DhtFUDenAuSzn3EVhjL29UFWJbT1MoUVAJ83Ft94biBy25e` |
| Subred | Perturb, netuid 26 (Bittensor) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-29 |

## Arquitectura y entrenamiento

La arquitectura base es EfficientNetV2-L, propuesta por Tan y Le (2021). Es una red convolucional que combina bloques Fused-MBConv en las etapas iniciales (para acelerar el entrenamiento en hardware moderno) con bloques MBConv en las etapas profundas, y que aplica escalado compuesto de profundidad, anchura y resolucion de forma no uniforme. En la implementacion de torchvision, `efficientnet_v2_l` recibe imagenes de 480 x 480 y produce logits sobre 1000 clases de ImageNet-1K, con 119 millones de parametros.

Sobre el procedimiento de entrenamiento, la model card indica unicamente que el modelo ha sido afinado con entrenamiento adversarial ("adversarial training") para la subred Perturb de Bittensor. No se especifica el numero de tokens o imagenes de entrenamiento, la composicion del dataset, el tipo de ataques adversarios usados (FGSM, PGD, etc.), el numero de pasos de ataque, el presupuesto de perturbacion (epsilon), la funcion de perdida ni si se aplico alguna tecnica de calibracion o destilacion. Tampoco se documenta si se partio de los pesos oficiales `IMAGENET1K_V1` de torchvision o de un entrenamiento desde cero. Toda esta informacion se considera no disponible.

Una innovacion relevante, mas de infraestructura que de modelado, es la verificacion on-chain: el autor publica un hash sha256 calculado sobre la concatenacion del fichero de pesos y su hotkey, lo que permite comprobar que el artefacto subido a HuggingFace corresponde al modelo registrado en la subred. El preprocesado esta fijado a las transformaciones estandar de `EfficientNet_V2_L_Weights.IMAGENET1K_V1` (resize bicubico a 480, center crop de 480, normalizacion con media y desviacion 0,5), lo que implica que cualquier uso fuera de ese pipeline degradara las predicciones.

## Capacidades

- Clasificacion de imagenes en 1000 categorias de ImageNet-1K, con salida de logits por clase.
- Extraccion de caracteristicas visuales: al ser una CNN completa, las capas intermedias pueden emplearse como backbone para transfer learning en tareas de vision (deteccion, segmentacion, retrieval), aunque el autor no documenta este uso.
- Robustez adversarial declarada: el afinado con entrenamiento adversarial busca mantener la precision frente a perturbaciones en la entrada, que es el criterio de evaluacion de la subred Perturb.
- No dispone de generacion de texto, razonamiento, codigo ni matematicas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues; no procesa lenguaje.
- No tiene modo "thinking", vision-lenguaje, audio ni ninguna modalidad adicional.
- No hay informacion sobre cuantizacion, ONNX exportada ni versiones optimizadas publicadas por el autor.

## Casos de uso

- Mineria en la subred Perturb (netuid 26) de Bittensor: un minero puede cargar este checkpoint como modelo candidato y verificar su integridad reproduciendo el hash sha256 publicado antes de registrarlo en la subred.
- Evaluacion de robustez adversarial: sirve como baseline afinado con entrenamiento adversarial para comparar la degradacion de precision frente a ataques FGSM o PGD contra el EfficientNetV2-L original de torchvision.
- Clasificacion visual en produccion con 1000 clases: integrable en un pipeline de Python con torchvision para etiquetar imagenes a 480 x 480, con un coste de VRAM bajo (aproximadamente 0,5 GB de pesos en fp32) que permite ejecutarlo junto a otros servicios en la misma GPU.
- Preetiquetado de datasets: usar el modelo para generar etiquetas iniciales sobre grandes volumenes de imagenes que despues se revisan manualmente, aprovechando su bajo coste de inferencia relativo a un transformer de vision grande.
- Moderacion de contenido basada en categorias visuales: clasificar imagenes entrantes en categorias de ImageNet (animales, objetos, escenas) como primer filtro en sistemas de moderacion o catalogacion automatica.
- Investigacion en seguridad de modelos: estudiar como se comporta un clasificador afinado adversarialmente ante perturbaciones fuera de distribucion en entornos controlados.
- Transfer learning a dominios especificos: reemplazar la cabeza de 1000 clases y reentrenar sobre un dataset propio (inspeccion industrial, imagen medica, agricultura), partiendo de un backbone ya entrenado en ImageNet.
- Despliegue en edge o entornos on-premise sin conectividad: al ser un modelo convolucional de 119 millones de parametros, es exportable a ONNX y TensorRT y cabe en hardware modesto, lo que facilita su uso en plantas o laboratorios con requisitos de privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de precision top-1, top-5, ni evaluaciones de robustez bajo ataques concretos (FGSM, PGD, AutoAttack) para este checkpoint. Tampoco se aportan resultados de la competicion de la subred Perturb ni comparaciones con otros mineros.

| Benchmark | Resultado |
|---|---|
| ImageNet-1K top-1 | No disponible |
| ImageNet-1K top-5 | No disponible |
| Robustez adversarial (epsilon / ataque) | No disponible |

Nota: el modelo base `efficientnet_v2_l` de torchvision, sin el afinado adversarial, cuenta con resultados publicados por sus autores originales, pero esos valores corresponden a la arquitectura de referencia y no pueden atribuirse a este checkpoint, cuyo proceso de afinado no esta documentado.

## Requisitos de hardware

- VRAM para inferencia: los pesos en fp32 ocupan aproximadamente 476 MB (119.027.848 parametros x 4 bytes). Con activaciones y buffers para lotes pequenos a 480 x 480, el consumo total estimado se situa en el rango de 1 a 2 GB, dependiendo del tamano de lote y de la implementacion.
- Con version en fp16 o bf16, los pesos bajan a unos 238 MB, y con cuantizacion INT8 a unos 119 MB, aunque el autor no publica pesos cuantizados; habria que generarlos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM. Funciona sin problema en NVIDIA RTX 3060, RTX 4090, A100 y H100, aunque en estas dos ultimas el modelo esta claramente infrautilizado.
- Cabe sobradamente en GPU de consumo: GTX 1650, RTX 3050, RTX 3060, RTX 4060 y superiores. Tambien puede ejecutarse en CPU, con latencias mucho mayores.
- Opciones de despliegue: Python con torchvision y safetensors (metodo oficial documentado en la model card), exportacion a TorchScript, ONNX Runtime, TensorRT, OpenVINO o TVM. No aplican vLLM, TGI, llama.cpp ni Ollama, ya que son herramientas orientadas a modelos de lenguaje y este checkpoint no es uno de ellos.
- Latencia y throughput: no disponibles. No se han publicado mediciones del autor, y no se especifican el lote, la GPU ni el backend utilizados en ninguna prueba.

Ejemplo de carga documentado por el autor:

```python
from safetensors.torch import load_file
from torchvision.models import efficientnet_v2_l
model = efficientnet_v2_l(weights=None)
model.load_state_dict(load_file("model.safetensors"))
```

## Comparativa con modelos similares

No existe informacion de benchmarks para este checkpoint, por lo que la comparacion se limita a caracteristicas estructurales. La tabla incluye alternativas de la misma categoria (clasificacion de imagenes con backbone convolucional o hibrido).

| Modelo | Parametros | Entrada | Clases | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| teal-falcon (este modelo) | 119.027.848 | 480 x 480 | 1000 | Apache 2.0 | safetensors | Afinado adversarial para Perturb; sin metricas publicadas |
| efficientnet_v2_l (torchvision, IMAGENET1K_V1) | ~118 M | 480 x 480 | 1000 | BSD-3-Clause (torchvision) | PyTorch / safetensors | Modelo base no afinado adversarialmente; con metricas publicadas por los autores |
| ConvNeXt-L (torchvision) | ~198 M | 224 x 224 | 1000 | BSD-3-Clause (torchvision) | PyTorch | Alternativa convolucional moderna; mas parametros, sin entrenamiento adversarial |
| ResNet-50 (torchvision) | ~25,6 M | 224 x 224 | 1000 | BSD-3-Clause (torchvision) | PyTorch | Referencia clasica, mucho mas ligera y con menor precision esperada |

Los valores de parametros de los modelos alternativos son los publicados en sus respectivas implementaciones de referencia. No se dispone de comparaciones de precision entre teal-falcon y estas alternativas, porque el autor no ha publicado ninguna evaluacion.

## Limitaciones y advertencias

- Modelo de vision, no de lenguaje: no acepta prompts, no genera texto y no puede emplearse para tareas conversacionales, de codigo o de razonamiento.
- Espacio de etiquetas cerrado: solo produce las 1000 clases de ImageNet-1K. Cualquier categoria fuera de ese conjunto se asignara a la clase mas parecida, con el consiguiente riesgo de etiquetado incorrecto.
- Sin metricas publicadas: no hay evidencia documentada de la precision del checkpoint ni en condiciones limpias ni bajo ataque, por lo que no deberia desplegarse en produccion sin una evaluacion propia previa.
- Proceso de afinado opaco: se desconoce el tipo de ataque, el presupuesto de perturbacion, el dataset y el numero de pasos utilizados. El entrenamiento adversarial suele reducir la precision en datos limpios a cambio de robustez, pero sin numeros no puede cuantificarse ese compromiso.
- Preprocesado rigido: las predicciones dependen de las transformaciones exactas (resize bicubico a 480, center crop 480, normalizacion con media y desviacion 0,5). Cambiar la resolucion o el esquema de normalizacion degradara la salida.
- Sesgos heredados de ImageNet-1K: el dataset de origen contiene desequilibrios geograficos y culturales, y sus etiquetas son a menudo ambiguas. Estos sesgos se trasladan al clasificador.
- Riesgo de sobreajuste al criterio de la subred: si el modelo se ajusto especificamente contra el evaluador de Perturb, su robustez puede no generalizar a otros tipos de perturbacion o a amenazas del mundo real.
- Idioma y documentacion: la model card esta en ingles, es muy breve y no incluye informacion sobre idiomas ni sobre usos previstos mas alla de la subred.
- Repositorio sin traccion: cero descargas y cero likes en el momento de la consulta, sin issues ni discusion, lo que reduce las posibilidades de soporte de la comunidad.
- Integridad verificable pero no automatica: la validez del artefacto depende de que se compruebe manualmente el hash sha256 publicado; la plataforma de HuggingFace no realiza esa verificacion.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, con la obligacion de conservar los avisos de licencia y de no usar las marcas del autor para promocionar derivados. No se detectan restricciones adicionales en la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ANGExllL/teal-falcon
- Subred Perturb: https://perturbai.io
- Documentacion de EfficientNetV2 en torchvision: https://pytorch.org/vision/stable/models/efficientnetv2.html
- Repositorio de torchvision: https://github.com/pytorch/vision
- Documentacion de safetensors: https://github.com/huggingface/safetensors

No se han encontrado en la busqueda web enlaces relevantes al modelo, al autor ni a la subred Perturb. Los resultados devueltos correspondian a sitios de reserva de cruceros y no guardan relacion con el contenido de esta ficha, por lo que se han descartado.
