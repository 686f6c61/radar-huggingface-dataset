# Samonte/Pertval144

## Resumen

Pertval144 es un clasificador de imagenes publicado por el usuario Samonte en Hugging Face. Se trata de un EfficientNetV2-L de torchvision (`efficientnet_v2_l`) con 119.027.848 parametros, ajustado mediante entrenamiento adversario sobre las 1000 clases de ImageNet-1k. El checkpoint se distribuye en safetensors y esta vinculado a la subred Perturb (netuid 26) de Bittensor, una red descentralizada donde distintos mineros compiten por ofrecer modelos de vision robustos frente a perturbaciones adversarias.

El modelo no aporta una arquitectura nueva: reutiliza el backbone EfficientNetV2-L con compound scaling, convoluciones Fused-MBConv y MBConv con squeeze-and-excitation, y lo especializa para clasificacion de imagenes de 480 x 480 px. Su relevancia es acotada pero concreta: es un artefacto verificable on-chain (hash sha256 calculado sobre el modelo y la hotkey del minero), publicado bajo licencia apache-2.0, y sirve tanto como nodo de inferencia en la subred como punto de partida para transfer learning en tareas de vision.

Conviene subrayar que no es un modelo de lenguaje: no tiene ventana de contexto, no genera texto, no soporta tool calling ni razonamiento multi-paso. Cualquier evaluacion debe hacerse en terminos de exactitud de clasificacion, robustez ante ataques y coste de inferencia, no en terminos de capacidades conversacionales. El repositorio no incluye resultados de benchmarks, y en el momento de redactar esta ficha acumula 0 descargas y 0 likes, por lo que no existe validacion comunitaria independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNetV2-L (torchvision `efficientnet_v2_l`), red convolucional con bloques Fused-MBConv y MBConv, compound scaling y squeeze-and-excitation |
| Parametros totales | 119.027.848 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica. Modelo de vision; entrada de 480 x 480 px tras preprocesado (resize bicubico a 480, center crop 480, normalizacion con media = desviacion = 0.5) |
| Tipos de cuantizacion | No se publican artefactos cuantizados. El repositorio contiene pesos en precision completa (safetensors). Es tecnicamente posible convertir a FP16/BF16/INT8 con PyTorch, ONNX Runtime o TensorRT, pero no hay versiones oficiales |
| Idiomas soportados | No aplica (clasificacion de imagenes). Las 1000 etiquetas de clase de ImageNet-1k estan en ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`), cargable como `state_dict` de torchvision. Tamano del repositorio: 1,0 GB |

## Arquitectura y entrenamiento

La base es EfficientNetV2-L, la variante grande de la familia EfficientNetV2. Combina bloques Fused-MBConv en las etapas iniciales (que fusionan la convolucion 3x3 con la expansion 1x1 para mejorar el uso de aceleradores) y bloques MBConv con modulos de squeeze-and-excitation en las etapas profundas, todo ello escalado de forma compuesta (profundidad, anchura y resolucion). La cabeza de clasificacion produce 1000 logits correspondientes a las clases de ImageNet-1k. No hay atencion lineal, decodificacion especulativa ni mecanismos propios de modelos generativos.

Segun la model card, el ajuste se realizo con entrenamiento adversario para la subred Perturb (netuid 26) de Bittensor. No se especifican en la informacion disponible el numero de tokens o imagenes de entrenamiento, la composicion del dataset de ajuste, el tipo de ataque usado para generar las perturbaciones, el valor de epsilon, el numero de pasos de PGD ni si hubo RLHF/DPO (extremos estos ultimos que no aplican a un clasificador). La model card si documenta la hotkey del minero (`5H8t4i1evmMSDvwQstyWrxGNTVP2ykakEahnpwg5SaDmaZxH`) y el hash de compromiso on-chain `sha256(model.safetensors || hotkey) = bd41290553d6e48012f42f5e4206c8c8a1c5be6fbe150f21d3f4ddc343c27bb3`, que permite verificar la integridad del artefacto.

La carga del modelo se realiza con torchvision y safetensors de la siguiente forma:

```python
from safetensors.torch import load_file
from torchvision.models import efficientnet_v2_l
model = efficientnet_v2_l(weights=None)
model.load_state_dict(load_file("model.safetensors"))
```

## Capacidades

- Clasificacion de imagenes en las 1000 clases de ImageNet-1k, con una unica etiqueta dominante por imagen.
- Robustez frente a perturbaciones adversarias declarada por el autor mediante entrenamiento adversario; no se cuantifica en la informacion disponible.
- Extraccion de caracteristicas: el backbone convolucional puede reutilizarse como extractor para tareas posteriores, previa eliminacion de la cabeza de clasificacion.
- Transfer learning: al ser un checkpoint de 119 M de parametros con pesos preentrenados y ajustados, es un punto de partida razonable para fine-tuning en dominios especificos.
- Inferencia sobre imagenes de 480 x 480 px con un preprocesado obligatorio bien definido (`EfficientNet_V2_L_Weights.IMAGENET1K_V1.transforms()`).
- Soporte de tool calling / function calling: no disponible (no aplica).
- Soporte de agentes y razonamiento multi-paso: no disponible (no aplica).
- Capacidades multilingues: no aplica; solo etiquetas de clase en ingles.
- Capacidades especiales (modo thinking, vision-lenguaje, audio, generacion de texto): no disponibles. El modelo es exclusivamente de vision y discriminativo.

## Casos de uso

- Etiquetado automatico de catalogos de imagenes: el modelo asigna una de las 1000 clases de ImageNet-1k a cada imagen, lo que permite poblar metadatos y filtros en bibliotecas de fotografia, stock o archivos multimedia, con un coste de inferencia bajo (119 M de parametros).
- Curation de datasets de vision: usar el modelo como etiquetador previo para preanotar grandes volumenes de imagenes antes de una revision humana, reduciendo el esfuerzo manual en proyectos de recoleccion de datos.
- Mineria en la subred Perturb (netuid 26) de Bittensor: el checkpoint esta publicado con la hotkey y el hash on-chain de un minero, de modo que puede desplegarse como nodo de inferencia que responde a las peticiones de clasificacion robusta de la subred.
- Investigacion en robustez adversaria: sirve como modelo objetivo o baseline para medir la transferibilidad de ataques (FGSM, PGD u otros) frente a un modelo entrenado explicitamente con perturbaciones, y para comparar con el EfficientNetV2-L estandar.
- Transfer learning en dominios verticales: sustituir la cabeza de 1000 clases y reentrenar sobre datasets como inspeccion industrial, clasificacion de cultivos o diagnostico por imagen, aprovechando el backbone ya ajustado.
- Inferencia en el borde o en CPU: con 119 M de parametros y pesos de menos de 500 MB en FP32, es viable desplegarlo en dispositivos con recursos limitados o en servidores sin GPU para tareas de clasificacion por lotes.
- Prefiltrado en pipelines de moderacion o deduplicacion: clasificar imagenes por categoria antes de aplicar reglas especificas o de calcular similitud semantica, reduciendo el numero de imagenes que pasan a etapas mas costosas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye top-1 ni top-5 de ImageNet-1k, ni metricas de exactitud bajo ataque adversario, ni curvas de robustez frente a epsilon. El unico artefacto numerico verificable publicado es el hash sha256 del checkpoint y la hotkey del minero. No se debe asumir ninguna cifra de exactitud a partir del nombre del modelo o del backbone base.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,5 GB solo para los pesos (119 M x 4 bytes) mas activaciones; en la practica, del orden de 1,5 a 2,5 GB con lote 1 a 480 x 480 px. En FP16 los pesos bajan a unos 0,24 GB y el consumo total se reduce de forma proporcional.
- VRAM estimada para entrenamiento o fine-tuning: con Adam en FP32 hay que sumar gradientes y estados del optimizador (del orden de 4 veces el tamano de los pesos, aproximadamente 1,9 GB) mas las activaciones, que crecen con el tamano de lote y la resolucion de 480 px; se recomienda un minimo de 16-24 GB para lotes moderados.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM sirve para inferencia (RTX 3060, RTX 4060, RTX 4090, A10, L4). Para entrenamiento conviene una RTX 4090, A100, H100 o L40S. Modelos como A100 80 GB o H100 solo son necesarios para lotes grandes o entrenamiento a resolucion completa.
- Compatibilidad con GPU de consumo: si. Cabe holgadamente en cualquier GPU de consumo moderna, e incluso en iGPU o CPU para inferencia por lotes pequenos, ya que el modelo no llega a 120 M de parametros.
- Opciones de despliegue: PyTorch + torchvision de forma nativa (unica ruta documentada en la model card), TorchScript, ONNX Runtime, TensorRT, OpenVINO y TVM tras exportacion. No es compatible con vLLM, llama.cpp, Ollama, TGI ni otros motores orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles. Al no publicarse mediciones ni hardware de referencia, no se pueden dar cifras fiables.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion de entrada | Tarea | Licencia | Formato de pesos |
|---|---|---|---|---|---|
| Samonte/Pertval144 | 119.027.848 | 480 x 480 px | Clasificacion en 1000 clases de ImageNet-1k con entrenamiento adversario | apache-2.0 | safetensors (state_dict de torchvision) |
| EfficientNetV2-L original (torchvision, `efficientnet_v2_l`, pesos IMAGENET1K_V1) | 118.515.240 | 480 x 480 px | Clasificacion en 1000 clases de ImageNet-1k | no verificada en la informacion disponible; los pesos los distribuye torchvision | `pth` / `safetensors` via torchvision |
| ConvNeXt-Large (variante equivalente en el catalogo de torchvision) | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Clasificacion de imagenes | no disponible en la informacion proporcionada | `pth` / `safetensors` via torchvision |
| Vision Transformer ViT-L/16 | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Clasificacion de imagenes | no disponible en la informacion proporcionada | `safetensors` / `pth` |

La comparacion con el EfficientNetV2-L original es la mas directa por tratarse de la misma arquitectura, y la diferencia esperable se limita al ajuste adversario declarado. No hay datos publicados que permitan cuantificar si Pertval144 mejora, iguala o empeora la exactitud limpia del checkpoint original, ni cual es su ganancia real de robustez.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay top-1, top-5 ni metricas de robustez verificables, lo que impide validar la afirmacion de entrenamiento adversario.
- Cero adopcion visible: 0 descargas y 0 likes en el momento de redactar la ficha; no existe validacion independiente ni issues publicos que documenten su comportamiento.
- Sesgos heredados de ImageNet-1k: las 1000 clases del dataset presentan desequilibrios y categorias controvertidas; el modelo reproducira esos sesgos de representacion y etiquetado.
- Riesgo de error fuera de distribucion: al ser un clasificador cerrado de 1000 clases, cualquier imagen ajena a esas categorias recibira igualmente una etiqueta, sin mecanismo nativo de rechazo o puntuacion de confianza calibrada.
- Dependencia estricta del preprocesado: redimensionado bicubico a 480, center crop a 480 y normalizacion con media y desviacion 0,5. Cambiar el preprocesado degrada las predicciones de forma no documentada.
- Falta de detalle sobre el entrenamiento: se desconoce el dataset de ajuste, el tipo de ataque, el valor de epsilon y el numero de pasos, por lo que no se puede reproducir el entrenamiento ni acotar el tipo de perturbaciones frente a las que es robusto.
- Ambito de uso restringido a vision: no genera texto, no razona, no soporta agentes, tool calling ni conversacion multi-turno. Cualquier expectativa en ese sentido es erronea.
- Licencia apache-2.0: permite uso comercial y modificacion, pero la licencia cubre el artefacto publicado por el autor; conviene verificar las condiciones de los pesos base de torchvision y de la subred Perturb si se va a usar en produccion.
- Metadatos anomalos: la fecha de creacion registrada (2026-09-21) es posterior a la fecha habitual de publicacion, lo que sugiere un posible error de metadatos del repositorio; conviene tratarla con cautela.
- Vinculacion a una red criptoeconomica: el checkpoint esta ligado a una hotkey y a un hash on-chain de Bittensor, con incentivos economicos que pueden cambiar el comportamiento del minero a lo largo del tiempo; la hotkey no garantiza que futuras versiones mantengan la misma calidad.
- Sin garantia de mantenimiento ni soporte: el autor no publica documentacion adicional, versionado ni politica de actualizaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Samonte/Pertval144
- Subred Perturb: https://perturbai.io
- Bittensor (red en la que opera la subred netuid 26): https://bittensor.com
- Hash de compromiso on-chain: `sha256(model.safetensors || hotkey) = bd41290553d6e48012f42f5e4206c8c8a1c5be6fbe150f21d3f4ddc343c27bb3`
- Hotkey del minero: `5H8t4i1evmMSDvwQstyWrxGNTVP2ykakEahnpwg5SaDmaZxH`
- Documentacion de torchvision para EfficientNetV2: https://pytorch.org/vision/stable/models/efficientnetv2.html

Nota: la busqueda web realizada no devolvio ningun resultado relacionado con el modelo. Los enlaces recuperados correspondian exclusivamente a paginas de ayuda de YouTube y a hilos de Zhihu sin relacion con Pertval144, por lo que no se incluyen. No se han localizado papers, blogs tecnicos, repositorios auxiliares ni demos asociados al modelo en la informacion disponible.
