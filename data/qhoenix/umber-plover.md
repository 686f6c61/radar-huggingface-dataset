# qhoenix/umber-plover

## Resumen

qhoenix/umber-plover es un clasificador de imagenes basado en EfficientNetV2-L (la implementacion `efficientnet_v2_l` de torchvision, con cabeza de 1000 clases de ImageNet-1k) que ha sido ajustado con entrenamiento adversarial. El modelo lo publica el usuario qhoenix (Ivan Marahovschi) y esta vinculado a la subnet Perturb de Bittensor (netuid 26), un entorno de incentivos centrado en la robustez de clasificadores de imagen frente a perturbaciones adversarias. No es un modelo de lenguaje: no genera texto, no soporta tool calling y no tiene tokenizador ni ventana de contexto.

Tiene 119.027.848 parametros totales (el repo ocupa 0,5 GB) y trabaja sobre imagenes de 480x480 px con el preprocesado oficial de los pesos `IMAGENET1K_V1` de torchvision: redimensionado bicubico a 480, recorte central a 480 y normalizacion con media y desviacion tipica de 0,5. La relevancia de esta ficha es acotada y muy especifica: se trata de un artefacto de participacion en una subnet de Bittensor, con verificacion criptografica en cadena (sha256 de `model.safetensors` concatenado con la hotkey del minero), no de un modelo de proposito general para produccion.

El modelo tiene 0 descargas y 0 likes en el momento de la consulta, una model card minima que no documenta el dataset de ajuste, el ataque adversarial empleado (tipo, epsilon, numero de pasos) ni resultados de robustez medidos. Cualquier evaluacion seria debe partir de esa base: el unico dato verificable publicado es el hash on-chain.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNetV2-L (CNN con bloques MBConv y Fused-MBConv, derivada de busqueda de arquitectura); implementacion torchvision `efficientnet_v2_l` |
| Parametros totales | 119.027.848 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (entrada de imagen de 480x480 px; no procesa secuencias de texto) |
| Tipos de cuantizacion | no disponible (no se publican variantes cuantizadas; el checkpoint se distribuye en safetensors, presumiblemente fp32) |
| Idiomas soportados | no aplica (modelo de vision; no procesa texto) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`) |
| Numero de clases | 1000 (etiquetas de ImageNet-1k) |
| Resolucion de entrada | 480x480 px (redimensionado bicubico a 480, recorte central a 480) |
| Normalizacion | media = desviacion tipica = 0,5 |
| Libreria | torchvision |
| Tamano del repositorio | 0,5 GB |
| Pipeline | image-classification |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 2026-09-25 |

## Arquitectura y entrenamiento

EfficientNetV2-L es una red neuronal convolucional obtenida mediante busqueda de arquitectura, que combina bloques Fused-MBConv en las primeras etapas y MBConv en las posteriores, con conexiones residuales y modulos de atencion por canales (squeeze-and-excitation). Frente a la generacion anterior, el entrenamiento original de la familia V2 introduce aprendizaje progresivo (variacion de la resolucion de entrada y de la regularizacion a lo largo del entrenamiento) para acelerar la convergencia. En esta publicacion no hay ninguna innovacion arquitectonica propia: se reutiliza la topologia de torchvision y se sustituyen los pesos por los resultantes del ajuste fino.

El unico dato de entrenamiento documentado es que se aplico entrenamiento adversarial sobre los pesos preentrenados de ImageNet-1k, en el contexto de la subnet Perturb (netuid 26). La model card no especifica el conjunto de datos de ajuste, el algoritmo de ataque usado para generar ejemplos adversarios (PGD, FGSM, AutoAttack u otros), el valor de epsilon, el numero de pasos, la mezcla limpia/adversaria ni el numero de epocas. Tampoco se documenta si hubo destilacion, ensamblado o cualquier otra tecnica auxiliar.

El unico mecanismo de verificacion publicado es criptografico: `sha256(model.safetensors || hotkey) = 72269b5e9b80b6d9d9438ed9037eebef6759b6d99f3450ddb596a7b997ca49fd`, asociado a la hotkey del minero `5FGxe3AFaJ3LsM5LJtxdBS8143WFEd9eNWVKErr29uV1K8wt`. La carga del modelo se realiza con `load_file` de safetensors sobre una instancia de `efficientnet_v2_l(weights=None)`.

## Capacidades

- Clasificacion de imagenes en 1000 categorias de ImageNet-1k (una etiqueta por imagen, salida de 1000 logits).
- Inferencia sobre imagenes de 480x480 px con el preprocesado estandar de `EfficientNet_V2_L_Weights.IMAGENET1K_V1`.
- Robustez adversarial declarada por el autor como resultado del ajuste fino, aunque sin metricas publicadas que la cuantifiquen.
- Uso como minero de la subnet Perturb (netuid 26) de Bittensor: servir predicciones a los validadores de la subnet.
- Extraccion de caracteristicas intermedias para transfer learning, si se trunca la cabeza de clasificacion (la model card no documenta esta practica).
- Generacion de texto: no disponible (no es un modelo de lenguaje).
- Razonamiento, matematicas y codigo: no aplica.
- Tool calling / function calling: no soportado.
- Soporte de agentes y razonamiento multi-paso: no soportado.
- Capacidades multilingues: no aplica (no procesa texto).
- Vision mas alla de clasificacion (deteccion, segmentacion, VQA, OCR): no soportado; la cabeza es un clasificador de 1000 clases.

## Casos de uso

- Mineria en la subnet Perturb (netuid 26) de Bittensor: el caso de uso principal y explicito del autor. El modelo se despliega como servicio de clasificacion que responde a las consultas de los validadores, y su rendimiento se evalua frente a entradas perturbadas de forma adversaria.
- Investigacion en robustez adversarial: sirve como punto de partida para comparar tecnicas de ataque y defensa sobre una misma arquitectura (EfficientNetV2-L a 480x480), siempre que se midan las metricas por cuenta propia, ya que el autor no las publica.
- Pre-etiquetado de datasets de imagenes: al clasificar en 1000 clases de ImageNet, permite generar etiquetas preliminares sobre grandes volumenes de imagenes para despues revisarlas manualmente, reduciendo el coste de anotacion.
- Etiquetado automatico y organizacion de fototecas: indexar catalogos de imagen por categoria para busqueda y filtrado posterior.
- Filtrado rapido en pipelines de contenido: primera etapa de triaje (por ejemplo, descartar o marcar categorias concretas) antes de pasar por modelos mas costosos o por revision humana.
- Clasificacion en el borde (edge) o en CPU: con 119 M de parametros y unos 476 MB de pesos en fp32, es viable ejecutarlo en hardware modesto cuando no se dispone de GPU, a costa de menor throughput.
- Backbone para transfer learning: congelar el extractor de caracteristicas y entrenar una cabeza nueva para una taxonomia propia, aprovechando el preentrenamiento en ImageNet-1k.
- Verificacion de procedencia de artefactos: validar el hash on-chain antes de desplegar el modelo en un entorno de inferencia, como control de integridad de la cadena de suministro.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

En concreto, la model card no reporta exactitud top-1 ni top-5 en ImageNet-1k, ni metricas de robustez adversaria (por ejemplo, exactitud bajo AutoAttack o PGD con un epsilon determinado), ni resultados en el subconjunto de ImageNet que suelen usar los benchmarks de robustez. Tampoco se comparan con otros participantes de la subnet. El unico dato objetivo publicados es el hash sha256 on-chain indicado en la seccion de arquitectura.

## Requisitos de hardware

- Peso de los pesos en fp32: aproximadamente 476 MB (119.027.848 parametros x 4 bytes), coherente con el tamano de repo de 0,5 GB.
- Peso en fp16/bf16: aproximadamente 238 MB; en int8, aproximadamente 119 MB (estimaciones de calculo, no publicadas por el autor).
- VRAM estimada para inferencia: por debajo de 1 GB en fp32 si se procesa una imagen a la vez; el consumo real depende del tamano de lote y de la resolucion efectiva. Cabe holgadamente en cualquier GPU de consumo con 4 GB o mas.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA; para rendimiento alto, RTX 4090, L40S, A100 o H100. En GPU de gama baja (GTX 1650, RTX 3050) el modelo sigue siendo viable.
- CPU: ejecutable; se trata de una CNN de 119 M de parametros a 480x480, no de un modelo de lenguaje. No hay cifras de latencia publicadas.
- Latencia y throughput: no disponible. No se han publicado mediciones, y variaran mucho segun GPU, lote, precision (fp32/fp16/int8) y backend.
- Opciones de despliegue: PyTorch con torchvision (ruta oficial de carga descrita en la model card), safetensors para la carga de pesos, TorchScript, ONNX Runtime y TensorRT para optimizacion en produccion.
- vLLM, llama.cpp, Ollama y TGI no aplican a este modelo: son servidores orientados a modelos generativos de lenguaje, y este es un clasificador de imagenes.

## Comparativa con modelos similares

Cifras de parametros redondeadas a partir de las implementaciones de referencia de torchvision. No se dispone de datos comparativos de exactitud ni de robustez, porque el autor no publica benchmarks.

| Modelo | Parametros | Entrada | Clases | Entrenamiento adversarial | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| qhoenix/umber-plover | 119,0 M | 480x480 | 1000 | Si (sin detalle ni metricas) | apache-2.0 | HuggingFace |
| torchvision efficientnet_v2_l (ImageNet-1k) | 118,7 M | 480x480 | 1000 | No | BSD-3-Clause (torchvision) | torchvision |
| torchvision efficientnet_v2_m (ImageNet-1k) | 54,1 M | 480x480 | 1000 | No | BSD-3-Clause (torchvision) | torchvision |
| torchvision convnext_base (ImageNet-1k) | 88,6 M | 224x224 | 1000 | No | BSD-3-Clause (torchvision) | torchvision |

La diferencia funcional de umber-plover respecto a los tres comparadores es el ajuste con entrenamiento adversarial orientado a la subnet Perturb. Esa diferencia no viene acompanada de ninguna cifra publicada que permita cuantificar la mejora o el coste en exactitud sobre datos limpios.

## Limitaciones y advertencias

- Cobertura cerrada: solo 1000 clases de ImageNet-1k. No es un modelo de vocabulario abierto ni acepta prompts; cualquier taxonomia distinta exige reentrenar la cabeza.
- Sin metricas publicadas: no hay exactitud top-1/top-5, ni curvas de robustez, ni evaluacion bajo ataques estandar. No se puede afirmar que el ajuste adversarial mejore la robustez sin medirlo.
- Entrenamiento no reproducible: se desconoce el dataset de ajuste, el ataque usado, epsilon, numero de pasos y regimen de aprendizaje. Sin esos datos, la reproducibilidad es nula.
- Preprocesado rigido: el modelo espera redimensionado bicubico a 480, recorte central a 480 y normalizacion con media = desviacion tipica = 0,5. Desviarse de esa tuberia degrada la calidad de las predicciones y ademas cambia el espacio de entrada frente al que se entreno la defensa adversarial.
- Sesgos heredados de ImageNet: la taxonomia y la distribucion de ImageNet-1k tienen sesgos geograficos, culturales y de representacion conocidos, y contienen categorias problematicas. Un ajuste fino no documentado no corrige esos sesgos.
- Errores con alta confianza: como todo clasificador discriminativo, puede asignar probabilidad alta a la clase equivocada, especialmente ante imagenes fuera de distribucion. No existe mecanismo de absteccion ni estimacion de incertidumbre calibrada.
- Robustez declarada, no garantizada: el entrenamiento adversarial ofrece proteccion frente a ataques similares a los usados en el entrenamiento, pero no frente a ataques de transferencia, corrupciones naturales ni distribuciones distintas. No debe considerarse una defensa frente a adversarios adaptativos sin evaluacion independiente.
- Procedencia y confianza: el modelo tiene 0 descargas y 0 likes, y una model card muy breve. Conviene verificar el hash on-chain antes de usarlo y asumir que no hay validacion comunitaria ni mantenimiento.
- Licencia: apache-2.0 permite uso comercial, modificacion y redistribucion con atribucion y conservacion de avisos. Debe comprobarse que esa licencia es compatible con las condiciones de los pesos preentrenados de torchvision sobre los que se hizo el ajuste, ya que el autor no documenta ese extremo.
- Ambiguedad de nombre: existe un producto no relacionado llamado Umber (aplicacion de generacion de imagen y video, umber.s4.nu) que no tiene ninguna vinculacion con este modelo.
- Uso en produccion: adecuado solo como clasificador auxiliar o como artefacto de investigacion; no debe usarse como unica fuente de decision en aplicaciones sensibles (por ejemplo, moderacion o diagnostico) sin supervision humana y sin una evaluacion propia sobre el dominio objetivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/qhoenix/umber-plover
- Perfil del autor en HuggingFace: https://huggingface.co/qhoenix
- Subnet Perturb (Bittensor, netuid 26): https://perturbai.io
- No se han encontrado papers, blogs ni repositorios adicionales especificos de este modelo en los resultados de busqueda disponibles.
- Resultados de busqueda no relacionados con este modelo (sin vinculacion conocida): https://benchlm.ai/, https://umber.s4.nu/, https://mimo.mi.com/models/en-US/mimo-v2.6-pro, https://jevmodel.org/
