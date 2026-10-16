# Mino1289/vmoe_s32_last2_384_randaug_light1_ft

## Resumen

El modelo `vmoe_s32_last2_384_randaug_light1_ft`, publicado por el usuario Mino1289 en HuggingFace, es una conversión a la librería `timm` de los pesos de V-MoE (Vision Mixture of Experts) de Google Research. Se trata de un clasificador de imágenes, no de un modelo de lenguaje: recibe una imagen y devuelve una distribución sobre las 1.000 clases de ILSVRC2012 (ImageNet-1k). El checkpoint procede del bucket `gs://vmoe_checkpoints/vmoe_s32_last2_ilsvrc2012_randaug_light1_ft_ilsvrc2012` y se ha reempaquetado en formato `safetensors` con la interfaz estándar de `timm`.

La arquitectura es un Vision Transformer con parches de 32x32 píxeles (de ahí el sufijo `s32`) en el que parte de las capas de feed-forward se sustituyen por capas de mezcla dispersa de expertos (sparse MoE). El checkpoint está afinado a una resolución de entrada de 384x384 píxeles y emplea un esquema de aumento de datos RandAugment "light" (`light1`). El número total de parámetros asciende a 56.785.384 (aproximadamente 227 MB en fp32), lo que lo sitúa en la gama de los clasificadores ligeros.

Su relevancia actual es acotada pero concreta: permite reproducir y experimentar con V-MoE sin depender del ecosistema JAX/Flax original, integrándolo en cualquier pipeline de PyTorch o `timm`. Resulta útil como banco de pruebas para estudiar enrutamiento disperso de expertos en visión y como backbone de clasificación de bajo coste. La ficha del autor no incluye métricas, número de expertos ni detalles del preentrenamiento, y el repositorio acumula 0 descargas y 0 "likes", por lo que se trata de una conversión no validada por la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) con capas de mezcla dispersa de expertos (sparse MoE), variante V-MoE; parches de 32x32 |
| Parametros totales | 56.785.384 (dato real del repositorio en safetensors) |
| Parametros activos | no disponible (el autor no publica el numero de expertos por capa ni la top-k del enrutador) |
| Longitud de contexto | no aplica (modelo de vision); resolucion de entrenamiento 384x384, equivalente a 144 parches de 32x32, mas el token de clase |
| Tipos de cuantizacion | no disponible en el repositorio (solo se distribuyen pesos en safetensors); admite cuantizacion externa a int8/fp16 en PyTorch |
| Idiomas soportados | no aplica (clasificacion de imagenes); no disponible en metadatos |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (conversion `timm` de los pesos originales de V-MoE) |

## Arquitectura y entrenamiento

El modelo pertenece a la familia V-MoE descrita en el articulo "Scaling Vision with Sparse Mixture of Experts" (Riquelme et al., Google Research, 2021, arXiv:2106.05974). La idea central es sustituir bloques feed-forward seleccionados de un ViT por capas MoE: cada token (parche de imagen) se enruta mediante un router a un subconjunto reducido de expertos, de modo que el coste computacional por token crece mucho menos que el numero total de parametros. En el codigo original de V-MoE el enrutamiento usa top-k sobre la salida del router y, en entrenamiento, un esquema de "batch priority routing" con capacidad fija por experto que descarta tokens excedentes.

El sufijo `last2` del nombre indica que las capas MoE se situan en los ultimos bloques del transformer, mientras que el resto de bloques conservan el FFN denso habitual. No se dispone del numero exacto de expertos ni de la top-k empleada en este checkpoint concreto: el autor solo documenta el origen de los pesos, la resolucion (384) y el preprocesado. Segun el nombre del checkpoint, el ajuste se realizo sobre ILSVRC2012 (ImageNet-1k) con RandAugment en configuracion ligera (`randaug_light1`); no se detalla en la ficha si hubo una fase previa de preentrenamiento a gran escala (por ejemplo JFT-300M) ni el numero de tokens o imagenes vistas, por lo que esos datos figuran como no disponibles.

El preprocesado es un detalle critico de la conversion: las entradas deben normalizarse con `mean = std = (0.5, 0.5, 0.5)` sobre valores en `[0, 1]`, lo que equivale al rango `[-1, 1]` usado por JAX en el codigo original. No se menciona decodificacion especulativa ni tecnicas de atencion lineal; la atencion es la densa estandar de ViT.

## Capacidades

- Clasificacion de imagenes en 1.000 clases de ImageNet-1k (ILSVRC2012), con salida de logits por clase.
- Extraccion de caracteristicas visuales: al estar integrado en `timm`, permite obtener embeddings intermedios o la salida del pooler para tareas posteriores (transfer learning, recuperacion de imagenes, clustering).
- Fine-tuning supervisado sobre dominios nuevos: la cabecera de clasificacion y los pesos son cargables con `pretrained=True` y adaptables a otros conjuntos de etiquetas.
- Inferencia con enrutamiento disperso: por cada parche solo se activan parte de los expertos, lo que reduce el coste frente a un modelo denso con el mismo numero de parametros totales.
- Entrada de alta resolucion relativa (384x384) con parches grandes (32x32), lo que reduce a 144 el numero de tokens por imagen y abarata la atencion.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generacion de texto, vision-lenguaje, audio ni modo "thinking": no es un modelo generativo ni multimodal en el sentido de los LLM.
- Capacidades multilingues: no aplica.

## Casos de uso

- Etiquetado masivo de imagenes a bajo coste: con 56,8 M de parametros y ~114 MB en fp16, se puede ejecutar en CPU para preetiquetar grandes catalogos de fotos antes de una revision humana, usando la clase de mayor probabilidad o las top-5 para el cribado.
- Backbone en pipelines de vision por computador: al ser un modelo `timm`, se puede congelar y usar como extractor de caracteristicas para un clasificador lineal o para alimentar detectores y segmentadores en etapas posteriores.
- Control de calidad industrial: ajustando la cabecera sobre un conjunto propio de imagenes de producto, sirve para discriminar piezas correctas frente a defectuosas en linea de produccion, donde interesa una latencia baja y la posibilidad de desplegar en hardware modesto o en el borde.
- Moderacion visual y filtrado de contenido: clasificacion rapida de imagenes subidas por usuarios en categorias predefinidas, con el modelo corriendo en la misma maquina que el servicio web gracias a su huella de memoria inferior a 1 GB.
- Clasificacion de productos en comercio electronico: asignacion automatica de categorias a fotografias de catalogo, con reentrenamiento periodico de la capa final cuando se anaden categorias nuevas.
- Investigacion sobre MoE disperso en vision: el checkpoint permite instrumentar el router, medir el reparto de tokens entre expertos y estudiar el desequilibrio de carga o el efecto de la capacidad por experto, algo mas comodo en PyTorch que en el codigo JAX original.
- Analisis de imagenes cientificas o de teledeteccion: con fine-tuning sobre recortes de 384x384 (por ejemplo, parcelas agricolas o imagenes histopatologicas), aprovechando el preentrenamiento visual y el coste reducido de reentrenamiento.
- Prototipado rapido y docencia: una sola linea (`timm.create_model(...)`) permite tener un clasificador funcional para experimentos de aumentos, cuantizacion o poda, sin infraestructura de GPU de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha del autor no incluye exactitud top-1 ni top-5 sobre ImageNet-1k, ni comparaciones con otros modelos, ni mediciones de latencia o throughput. Tampoco se documentan resultados de evaluacion del router (por ejemplo, porcentaje de tokens descartados por capacidad). Cualquier cifra de rendimiento deberia medirse localmente antes de usar el modelo en produccion.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32 los pesos ocupan aproximadamente 227 MB; en fp16/bf16, unos 114 MB; en int8, unos 57 MB. Con activaciones de una sola imagen a 384x384, el consumo total se mantiene por debajo de 1 GB en fp16.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria es suficiente; no se requiere A100, H100 ni similar. Una RTX 3060, RTX 4090 o una T4 son mas que suficientes para lotes grandes.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna (GTX 1050 4 GB en adelante) e incluso en GPUs integradas con soporte de PyTorch.
- Inferencia en CPU: viable, dado el tamano del modelo y los 144 tokens por imagen; adecuada para servicios de bajo volumen o preetiquetado por lotes.
- Opciones de despliegue: `timm` sobre PyTorch, exportacion a TorchScript, ONNX/ONNX Runtime, OpenVINO o TensorRT. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles (el autor no publica mediciones). Cabe esperar latencias del orden de milisegundos por imagen en GPU y de decenas de milisegundos en CPU, pero son estimaciones no verificadas.
- Nota sobre el enrutamiento: el comportamiento de los expertos depende de la implementacion. Si la conversion a `timm` no reproduce exactamente el enrutamiento y la capacidad del codigo JAX original, el rendimiento real puede diferir del reportado para V-MoE en el paper.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion / parches | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vmoe_s32_last2_384_randaug_light1_ft | 56,8 M (totales; activos no disponibles) | 384x384, parche 32 | ViT con MoE disperso | apache-2.0 | HuggingFace, via `timm` |
| ViT-S/32 (timm) | ~22 M | 224x224 tipico, parche 32 | ViT denso | apache-2.0 (segun variante) | `timm` / HuggingFace |
| DeiT-Small/16 | ~22 M | 224x224, parche 16 | ViT denso con destilacion | apache-2.0 | `timm` / HuggingFace |
| ResNet-50 | ~25,6 M | 224x224 | CNN | apache-2.0 (variante torchvision) | Amplia |

La comparacion cuantitativa de rendimiento no es posible con la informacion disponible: no hay exactitud top-1 ni top-5 para el checkpoint V-MoE convertido ni datos publicados en su ficha. Como referencia cualitativa, el modelo aqui descrito tiene mas parametros totales que un ViT-S o un ResNet-50, pero al ser MoE solo activa una fraccion por token, de modo que su coste por imagen puede ser comparable al de un ViT-S denso. Los valores concretos de parametros activos, FLOPs y exactitud figuran como no disponibles.

## Limitaciones y advertencias

- Sesgos del conjunto de datos: al estar ajustado sobre ILSVRC2012, hereda los sesgos de anotacion de ImageNet-1k (desbalance entre clases, sobrerrepresentacion de determinadas categorias y contextos culturales). No se han publicado analisis de equidad ni evaluaciones por subgrupo.
- No es un modelo generativo: no hay riesgo de alucinacion textual, pero si de sobreconfianza en la salida softmax. Un clasificador de este tipo puede asignar probabilidades altas a clases incorrectas ante entradas fuera de distribucion, por lo que conviene calibrar o usar umbrales de rechazo.
- Dominio cerrado: solo reconoce las 1.000 clases de ImageNet-1k. No admite etiquetas abiertas ni descripciones en lenguaje natural.
- Limitacion de resolucion: la entrada esperada es 384x384 con parches de 32x32. Objetos pequenos (menos de 32x32 píxeles) pueden no resolverse; usar otra resolucion exige interpolar los embeddings de posicion y degrada el rendimiento.
- Preprocesado obligatorio: hay que normalizar con `mean = std = (0.5, 0.5, 0.5)` sobre valores en `[0, 1]`. Otra normalizacion (por ejemplo la habitual de ImageNet) reducira la precision de forma apreciable.
- Incertidumbre sobre el enrutamiento: la ficha no documenta el numero de expertos ni la top-k, y no se garantiza que la conversion a `timm` replique exactamente el enrutamiento ni la politica de capacidad del codigo JAX original. El comportamiento efectivo puede diferir del descrito en el paper.
- Procedencia y validacion: repositorio con 0 descargas y 0 "likes", creado y actualizado el mismo dia. No hay evaluacion independiente que confirme que la conversion conserva la precision del checkpoint original.
- Licencia: los pesos se distribuyen bajo apache-2.0, lo que permite uso comercial y modificacion. Sin embargo, el checkpoint deriva de artefactos de Google Research y los datos de entrenamiento (ILSVRC2012 y, en su caso, preentrenamiento propietario) tienen sus propios terminos de uso, que deben revisarse antes de un despliegue comercial.
- Sin soporte de texto, audio ni video: cualquier tarea multimodal requiere anadir componentes externos.
- Mantenimiento: al ser una conversion puntual de un usuario individual, no cabe esperar actualizaciones, correcciones ni soporte del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Mino1289/vmoe_s32_last2_384_randaug_light1_ft
- Repositorio oficial de V-MoE (Google Research): https://github.com/google-research/vmoe
- Libreria `timm` (pytorch-image-models): https://github.com/huggingface/pytorch-image-models
- Documentacion de `timm` sobre modelos V-MoE: https://huggingface.co/docs/timm
- Paper de referencia, "Scaling Vision with Sparse Mixture of Experts" (Riquelme et al., 2021): https://arxiv.org/abs/2106.05974
- Busqueda web: no se han encontrado resultados relevantes sobre este modelo. Las consultas devolvieron unicamente paginas de servicios de paqueteria ajenas por completo al contenido solicitado, por lo que no se incluye ningun enlace adicional de la busqueda.
