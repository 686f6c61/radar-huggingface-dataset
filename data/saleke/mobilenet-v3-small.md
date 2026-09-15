# saleke/MobileNet-v3-small

## Resumen

MobileNet-v3-small es una red neuronal convolucional para clasificación de imágenes en 1000 clases de ImageNet-1k. Se trata de la variante pequeña de la familia MobileNetV3, introducida por Google en el paper *Searching for MobileNetV3* (Howard et al., 2019), y diseñada mediante búsqueda de arquitectura (NAS) y el algoritmo NetAdapt para maximizar la precisión por milisegundo de latencia en dispositivos móviles y de borde.

El repositorio analizado, `saleke/MobileNet-v3-small`, es una conversión a formato LiteRT/TFLite de los pesos preentrenados de PyTorch Vision. La model card hace referencia de forma explícita al repositorio `litert-community/MobileNet-v3-small` como origen de los artefactos, por lo que se trata de una réplica y no de una publicación original del autor del modelo. El checkpoint cuenta con 2.542.856 parámetros y opera sobre entradas de 224x224 píxeles, con una precisión declarada de 67,62 % top-1 y 87,40 % top-5 en el split de validación de ImageNet-1k.

Su relevancia actual es la de un *baseline* de clasificación de imágenes de muy bajo coste computacional: el modelo FP32 ocupa unos 10 MB y existe una variante con cuantización solo de pesos INT8 aproximadamente 3,7 veces más pequeña, pensada para ejecución en CPU, GPU móvil y compilación AOT para aceleradores concretos como el Google Tensor G5. La model card advierte además de que la cuantización estática INT8 no está disponible porque degrada severamente la precisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN MobileNetV3 Small (bloques invertidos con Squeeze-and-Excitation, activaciones hard-swish y hard-sigmoid, disenada por NAS + NetAdapt) |
| Parametros totales | 2.542.856 |
| Longitud de contexto | no aplica (modelo de vision; entrada fija de imagen 224x224x3) |
| Tipos de cuantizacion | FP32 (completa) y INT8 solo pesos con activaciones FP32 (`weight_only_wi8_afp32`). INT8 estatico no disponible (en desarrollo) |
| Idiomas soportados | no aplica; las etiquetas de salida son las 1000 clases de ImageNet-1k, en ingles |
| Licencia | no disponible (la model card indica que falta la informacion de licencia del modelo original de PyTorch Vision) |
| Formato de pesos | TFLite / LiteRT (`.tflite`); no se distribuyen safetensors ni GGUF |
| Tarea | image-classification (clasificacion de imagen en 1000 clases) |
| Resolucion de entrada | 224x224, normalizada con media [0.485, 0.456, 0.406] y desviacion [0.229, 0.224, 0.225] |
| Preprocesado | redimensionado bilineal a 256 en el lado corto + recorte central de 224x224 |
| Libreria | `ai-edge-litert` (LiteRT, sucesor de TensorFlow Lite) |
| Idiomas de la model card | ingles |

## Arquitectura y entrenamiento

MobileNetV3 Small es una CNN de bloques residuales invertidos (*inverted residuals*) con convoluciones separables en profundidad. Cada bloque incorpora modulos de Squeeze-and-Excitation (SE) que recalibran los canales, y las funciones de activacion son hard-swish y hard-sigmoid, versiones de bajo coste de swish y sigmoid adecuadas para aritmetica de enteros y hardware movil. La topologia se obtuvo combinando busqueda de arquitectura neuronal por plataforma con NetAdapt, que ajusta el numero de filtros por capa una vez fijada la estructura. La cabeza de clasificacion se compone de una convolucion 1x1, pooling global y una capa totalmente conectada que proyecta al espacio de 1000 clases.

El entrenamiento se realizo sobre ImageNet-1k a 224x224. La model card no especifica el numero de tokens ni de imagenes vistas, la composicion exacta del dataset, ni si hubo fases de RLHF o DPO; ese tipo de alineacion no aplica a un clasificador de imagenes. La innovacion tecnica destacable en esta conversion no es arquitectonica sino de despliegue: se ofrecen tres artefactos, el modelo FP32, una variante con pesos INT8 y activaciones FP32, y un binario compilado AOT para el objetivo Google Tensor G5. La cuantizacion solo de pesos se eligio en lugar de la cuantizacion de rango dinamico porque las capas SE y hard-swish de MobileNetV3 son sensibles a la cuantizacion de activaciones; en una comprobacion puntual con fotos reales, la variante INT8 de pesos mantiene las predicciones top-1 con una correlacion minima de logits de 0,991 frente al modelo en coma flotante.

## Capacidades

- Clasificacion de imagenes en las 1000 clases de ImageNet-1k, con salida de logits sobre las que se puede calcular top-1 y top-5.
- Inferencia en coma flotante en CPU y GPU. Para ejecucion en GPU la model card exige seleccionar explicitamente la precision FP32.
- Cuantizacion solo de pesos (INT8 con activaciones FP32), que reduce el tamano del fichero unas 3,7 veces respecto a float32 con una perdida de precision declarada como minima.
- Compilacion AOT para el acelerador Google Tensor G5 mediante un artefacto especifico (`apply_plugin`).
- Extraccion de caracteristicas potencial: al ser una CNN completa, las activaciones intermedias pueden reutilizarse como *backbone* para tareas derivadas, aunque la model card no documenta ni valida este uso.
- No soporta generacion de texto, razonamiento, codigo, matematicas, tool calling, function calling, agentes, razonamiento multi-paso, vision-lenguaje, audio ni modo *thinking*. Es un clasificador de imagen puro.

## Casos de uso

- Clasificacion de imagenes en el dispositivo: integrar el fichero `mobilenet_v3_small.tflite` en una aplicacion Android o iOS mediante `ai-edge-litert` para etiquetar fotos sin enviar datos a la nube. El modelo FP32 ocupa unos 10 MB, por lo que cabe holgadamente en el almacenamiento y la memoria de un telefono de gama media.
- Etiquetado automatico de fototecas y catalogos: procesar lotes de imagenes por CPU y asignar la clase ImageNet top-1 a cada una, con la variante de pesos INT8 para reducir el tamano del binario empaquetado.
- Prefiltrado en pipelines de vision por computador: usar el clasificador como primera etapa barata que descarta imagenes irrelevantes antes de invocar un modelo mayor, reduciendo el coste computacional agregado del sistema.
- Moderacion y triaje de contenido en el borde: clasificar imagenes subidas por usuarios en un dispositivo de borde o pasarela local para decidir si requieren revision humana, manteniendo la latencia baja y sin dependencia de red.
- Prototipado rapido de productos de vision: servir de *baseline* reproducible para comparar arquitecturas o cuantizaciones antes de invertir en entrenamiento propio, gracias a que sus numeros de referencia sobre ImageNet-1k estan publicados en la propia model card.
- *Backbone* para transfer learning ligero: sustituir la cabeza de 1000 clases por una capa adaptada al dominio propio y reentrenar en un conjunto pequeno de imagenes; la eleccion es razonable por el reducido numero de parametros (2,54 M) frente a alternativas como ResNet-18.
- Demostraciones educativas y benchmarking de hardware: medir latencia y compilacion en NPU o GPU movil con un modelo de coste minimo, usando el artefacto AOT para Tensor G5 como caso de prueba de toolchains de compilacion.

## Benchmarks y rendimiento

Datos declarados por el autor en el `model-index` de la model card (no verificados, `verified: false`):

| Benchmark | Metrica | Valor |
|---|---|---|
| ImageNet-1k, split validation | Top 1 Accuracy (Full Precision) | 0,6762 (67,62 %) |
| ImageNet-1k, split validation | Top 5 Accuracy (Full Precision) | 0,8740 (87,40 %) |

La model card indica que estos valores coinciden con los del checkpoint original de PyTorch Vision. No hay datos publicados en la informacion disponible sobre latencia, throughput, consumo energetico ni resultados de la variante cuantizada a INT8 de pesos sobre el conjunto de validacion completo.

## Requisitos de hardware

- VRAM estimada: el modelo FP32 pesa aproximadamente 10,2 MB (2.542.856 parametros x 4 bytes); la variante con pesos INT8, unas 3,7 veces menor, ronda los 2,8 MB. El consumo real de memoria depende del tamano de lote y de las activaciones intermedias, que son pequenas a 224x224.
- GPU recomendadas: cualquier GPU moderna sirve, incluida una NVIDIA RTX 3060 o RTX 4090 sobradamente; el modelo esta pensado para GPU integradas de moviles y SoCs ARM. Para ejecucion en GPU, la model card indica seleccionar explicitamente FP32.
- Cabe en GPU de consumo: si, con un margen enorme. Cabe tambien en CPU de telefono, Raspberry Pi y microcontroladores con suficiente memoria, dado el tamano de unos pocos megabytes.
- Soporte de NPU: el fichero FP32 declara compatibilidad con CPU y GPU, con NPU marcada como N/A en la tabla de compatibilidad. Existe un artefacto AOT especifico para Google Tensor G5.
- Opciones de despliegue: LiteRT (`ai-edge-litert`) mediante `CompiledModel.from_file`, interprete TFLite y sus delegados de Android (CPU/GPU). No aplica vLLM, TGI, Ollama ni llama.cpp, que son runtimes de modelos generativos de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada. La model card solo justifica el diseno por el objetivo de latencia baja en dispositivos moviles, sin cifras concretas.

## Comparativa con modelos similares

Los datos de MobileNetV3 Small proceden de la informacion proporcionada. Las cifras de las alternativas no aparecen en esa informacion: se incluyen como referencia de las publicaciones originales y de los pesos de PyTorch Vision, y no han sido verificadas en este contexto.

| Modelo | Parametros | Top-1 ImageNet-1k | Formato principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MobileNetV3 Small (este repositorio) | 2.542.856 | 67,62 % (declarado, no verificado) | TFLite / LiteRT | no disponible | HuggingFace, 0 descargas |
| MobileNetV3 Large | ~5,48 M (referencia externa) | ~75,3 % (referencia externa) | TFLite / LiteRT, PyTorch | no disponible | Repositorio `litert-community/MobileNet-v3-large`, recomendado en la model card para INT8 estatico |
| MobileNetV2 | ~3,5 M (referencia externa) | ~72,0 % (referencia externa) | TFLite, PyTorch | Apache 2.0 en PyTorch Vision (referencia externa) | Amplia, multiples mirrors |
| EfficientNet-B0 | ~5,3 M (referencia externa) | ~77,7 % (referencia externa) | TFLite, PyTorch | Apache 2.0 en PyTorch Vision (referencia externa) | Amplia |
| ResNet-18 | ~11,7 M (referencia externa) | ~69,8 % (referencia externa) | PyTorch, ONNX | BSD-3 en PyTorch Vision (referencia externa) | Amplia |

La ventaja competitiva de MobileNetV3 Small es el coste: es el mas pequeno de la tabla y el unico de la lista que combina un artefacto AOT ya compilado para un acelerador concreto con una variante de cuantizacion solo de pesos documentada. Su desventaja es la precision, unos 5 puntos por debajo de MobileNetV2 y mas de 10 por debajo de EfficientNet-B0, ademas de una licencia sin determinar.

## Limitaciones y advertencias

- Alcance funcional muy limitado: solo clasifica imagenes en 1000 clases de ImageNet-1k. No genera texto, no razona, no ejecuta herramientas y no procesa lenguaje.
- Sesgos heredados del dataset: ImageNet-1k presenta desequilibrios conocidos de representacion geografica, cultural y de genero. Al ser un clasificador de clases fijas, las categorias fuera de ese vocabulario se fuerzan a la clase mas parecida.
- Riesgo de error en clases finas y en imagenes fuera de distribucion: con un 67,62 % de top-1, aproximadamente una de cada tres imagenes se clasifica incorrectamente. No debe usarse como unico criterio en decisiones con impacto.
- Licencia indeterminada: la model card declara explicitamente que falta la informacion de licencia del modelo original de PyTorch Vision y que es responsabilidad del usuario determinar si tiene permiso de uso. Esto bloquea o complica el uso comercial sin una verificacion juridica previa.
- Cuantizacion estatica INT8 no disponible: la model card advierte de que la cuantizacion post-entrenamiento ingenua degrada severamente la precision y de que una conversion o compilacion exitosa no garantiza una precision aceptable. Para INT8 estatico recomienda usar MobileNetV3 Large.
- Metadatos poco fiables: el repositorio tiene 0 descargas y 0 likes, un tamano de 0,0 GB y una fecha de creacion de 2026-09-15, incoherente con la fecha real de inferencia del modelo. El `model-index` apunta al repositorio `litert-community/MobileNet-v3-small`, no al repositorio consultado, y las metricas estan marcadas como no verificadas.
- Restriccion de precision en GPU: la model card indica que en GPU hay que seleccionar explicitamente FP32; no se documenta el comportamiento con otras precisiones.
- Ausencia de datos operativos: no hay cifras de latencia, throughput ni consumo energetico, por lo que el dimensionamiento de un despliegue en produccion requiere medicion propia.

## Enlaces

- Repositorio consultado en HuggingFace: https://huggingface.co/saleke/MobileNet-v3-small
- Repositorio de referencia citado en la model card: https://huggingface.co/litert-community/MobileNet-v3-small
- Variante recomendada para INT8 estatico: https://huggingface.co/litert-community/MobileNet-v3-large
- Paper original: *Searching for MobileNetV3*, https://arxiv.org/abs/1905.02244
- Etiquetas de ImageNet-1k usadas en el ejemplo de codigo: https://huggingface.co/datasets/huggingface/label-files
- Fuente de los pesos originales: PyTorch Vision (pesos MobileNetV3 Small preentrenados en ImageNet-1k)
- Los resultados de busqueda web proporcionados no contienen enlaces relevantes al modelo: solo devuelven paginas del traductor de Google (translate.google.de), sin relacion con MobileNetV3.
