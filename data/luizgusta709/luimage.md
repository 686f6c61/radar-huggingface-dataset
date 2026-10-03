# LuizGusta709/Luimage

## Resumen

LuImage es una red neuronal convolucional (CNN) creada desde cero con PyTorch por el usuario LuizGusta709 para clasificacion de imagenes. No parte de ningun modelo preentrenado ni de pesos transferidos: la arquitectura y el entrenamiento se han construido integramente de forma manual, lo que la convierte en un ejemplo didactico de pipeline completo de vision por computador (definicion del modelo, carga de datos, bucle de entrenamiento y evaluacion).

El modelo resuelve una tarea acotada: clasificacion de imagenes en 10 clases (airplane, automobile, bird, cat, deer, dog, frog, horse, ship, truck) sobre el conjunto de datos CIFAR-10. La arquitectura es deliberadamente ligera: dos capas convolucionales (3 a 16 y 16 a 32 canales) con ReLU y max pooling, seguidas de dos capas fully connected (2048 a 128 y 128 a 10). Con esa configuracion el numero de parametros entrenables es de aproximadamente 268.650, un orden de magnitud muy inferior al de las CNN clasicas de referencia.

Su relevancia es principalmente formativa y de prototipado rapido: sirve para entender el flujo completo de entrenamiento en PyTorch, para pruebas de integracion de pipelines de inferencia y como linea base minima contra la que comparar arquitecturas mas complejas. No es un modelo de proposito general: no genera texto, no tiene ventana de contexto conversacional y su salida se limita a un vector de 10 logits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN secuencial (Conv2D + ReLU + MaxPool x2, Linear + ReLU, Linear) |
| Parametros totales | ≈268.650 (estimacion a partir de la arquitectura descrita en la model card) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (entrada de imagen de 32x32x3 canales) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (clasificacion de imagenes; etiquetas en ingles) |
| Licencia | no disponible |
| Formato de pesos | .pth (state_dict de PyTorch) |

## Arquitectura y entrenamiento

La red es una CNN puramente secuencial. La entrada es una imagen de 32x32 píxeles con 3 canales (RGB), el formato nativo de CIFAR-10. El primer bloque aplica una convolucion de 3 a 16 canales, seguida de ReLU y max pooling, lo que reduce la resolucion espacial de 32x32 a 16x16. El segundo bloque aplica una convolucion de 16 a 32 canales, tambien con ReLU y max pooling, reduciendo la resolucion a 8x8. La salida aplanada tiene 32 x 8 x 8 = 2048 valores, que alimentan una capa fully connected de 2048 a 128 con ReLU y una capa final de 128 a 10 que produce los logits de las 10 clases.

El entrenamiento se realizo desde cero (sin pesos preentrenados) sobre CIFAR-10 con el optimizador Adam, funcion de perdida CrossEntropyLoss, learning rate de 0.001, tamano de lote de 64 y 10 epocas. No se menciona en la model card el uso de tecnicas de aumento de datos, normalizacion, regularizacion (dropout o weight decay), ni de ajuste fino posterior con RLHF o DPO, que por otra parte no aplican a una tarea de clasificacion. Tampoco se documenta ninguna innovacion tecnica adicional como decodificacion especulativa, atencion lineal o modulos residuales.

## Capacidades

- Clasificacion de imagenes en 10 categorias fijas de CIFAR-10: airplane, automobile, bird, cat, deer, dog, frog, horse, ship y truck.
- Salida de un vector de 10 logits por imagen, apto para aplicar softmax y obtener probabilidades por clase.
- Inferencia en CPU o GPU indistintamente, ya que el modelo es de tamano reducido y se carga con `map_location="cpu"`.
- Entrenamiento reproducible con PyTorch, segun los hiperparametros documentados (Adam, CrossEntropyLoss, lr 0.001, batch 64, 10 epocas).
- No soporta tool calling ni function calling.
- No soporta agentes, razonamiento multi-paso ni planificacion.
- No es multilingue: no procesa ni genera lenguaje natural.
- No dispone de modo thinking, ni de capacidades de vision mas alla de la clasificacion, ni de procesamiento de audio.

## Casos de uso

- Material didactico para cursos de deep learning: el modelo completo (arquitectura mas bucle de entrenamiento) es lo bastante pequeno para explicarse en una sola sesion de clase y ejecutarse en un portatil sin GPU dedicada.
- Linea base en experimentos de vision por computador: sirve como punto de partida para medir la mejora que aportan arquitecturas mas profundas, tecnicas de aumento de datos o transfer learning sobre CIFAR-10.
- Pruebas de integracion de pipelines de inferencia: al ser un modelo de pocos cientos de KB, es util para validar el funcionamiento de un servicio de serving (por ejemplo, un endpoint HTTP que recibe una imagen y devuelve una etiqueta) antes de sustituirlo por un modelo en produccion.
- Clasificacion rapida de miniaturas en entornos embebidos o de bajo consumo: una CNN de este tamano puede ejecutarse en microcontroladores con soporte de PyTorch o en dispositivos tipo Raspberry Pi para tareas de juguete o demos.
- Generacion de etiquetas sinteticas o preetiquetado de bajo coste: util para triaje inicial de imagenes de 32x32 en prototipos donde no se requiere alta precision.
- Pruebas de cuantizacion y optimizacion de modelos: al ser una red tan pequena, permite comparar tecnicas de poda, cuantizacion a int8 o exportacion a formatos de inferencia sin incurrir en costes elevados de computo.
- Benchmark interno de infraestructura: sirve para medir latencia de arranque, throughput de lotes pequenos y coste de despliegue de un servicio de inferencia minimo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye la precision (accuracy) alcanzada en el conjunto de test de CIFAR-10, ni curvas de perdida, ni matriz de confusion, ni comparaciones con otras arquitecturas. Tampoco se documentan la semilla aleatoria, la particion exacta de entrenamiento y validacion ni la latencia de inferencia.

| Metrica | Valor |
|---|---|
| Precision en CIFAR-10 (test) | no disponible |
| Perdida final de entrenamiento | no disponible |
| Latencia de inferencia | no disponible |
| Throughput | no disponible |
| Comparacion con otras CNN | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en fp32, dado que el modelo tiene unos 268.650 parametros (aproximadamente 1 MB de pesos) y las activaciones para una imagen de 32x32x3 son minimas.
- VRAM estimada para entrenamiento: inferior a 2 GB con lotes de 64 imagenes de 32x32x3 en fp32, incluyendo estados del optimizador Adam.
- GPU recomendadas: cualquier GPU con soporte CUDA, incluidas GTX 1050, GTX 1650, RTX 3050, RTX 4090, A100 o H100. El modelo esta muy por debajo de la capacidad de cualquiera de ellas.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU de consumo e incluso en GPUs integradas. Tambien funciona en CPU sin penalizacion relevante para lotes pequenos.
- Opciones de despliegue: el modelo se carga como `state_dict` de PyTorch. Es exportable a TorchScript y a ONNX, aunque no se documenta ningun proceso de exportacion. No hay indicios de soporte en vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones en la informacion proporcionada.

## Comparativa con modelos similares

La model card no ofrece comparaciones con otras arquitecturas, y el repositorio de HuggingFace no contiene pesos ni resultados. A continuacion se comparan caracteristicas estructurales con CNN clasicas usadas habitualmente como referencia en CIFAR-10. Los datos de los modelos comparados no provienen de la informacion proporcionada, por lo que deben verificarse en sus fuentes oficiales.

| Modelo | Parametros (orden de magnitud) | Contexto de entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| LuImage | ≈2,7 x 10^5 | Imagen 32x32x3 | no disponible | Repositorio HF sin pesos publicados |
| ResNet-18 | ≈1,1 x 10^7 | Imagen, tipicamente 224x224 (adaptable) | Consultar fuente oficial | Ampliamente disponible |
| MobileNetV2 | ≈3,5 x 10^6 | Imagen, tipicamente 224x224 (adaptable) | Consultar fuente oficial | Ampliamente disponible |
| VGG-11 | ≈1,3 x 10^8 | Imagen, tipicamente 224x224 (adaptable) | Consultar fuente oficial | Ampliamente disponible |

La diferencia principal es de escala: LuImage es entre uno y tres ordenes de magnitud mas pequeno que las CNN de referencia, lo que implica menor capacidad representacional y, previsiblemente, menor precision en CIFAR-10, aunque este extremo no puede confirmarse sin datos publicados.

## Limitaciones y advertencias

- No se han publicado pesos en el repositorio: el tamano indicado es de 0.0 GB y no hay archivo `luimage_weights.pth`, por lo que el modelo no es ejecutable tal cual sin reentrenarlo.
- No hay licencia declarada. Sin una licencia explicita, no se concede permiso de uso, modificacion ni redistribucion, lo que impide el uso comercial seguro.
- Solo 10 epocas de entrenamiento con Adam y sin aumento de datos documentado: es esperable un ajuste limitado y posible sobreajuste, aunque no se aportan metricas para confirmarlo.
- La precision real en CIFAR-10 es desconocida. No debe asumirse ningun nivel de rendimiento concreto en produccion.
- Sesgos conocidos: no documentados. CIFAR-10 es un conjunto pequeno y con clases desbalanceadas en el mundo real; el modelo puede comportarse de forma desigual entre clases, pero no hay evaluacion por clase.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero si existe riesgo de clasificacion erronea con alta confianza en imagenes fuera de la distribucion de CIFAR-10 (32x32, centradas, de las 10 clases concretas).
- Entrada muy restringida: imagenes de 32x32x3. Imagenes de mayor resolucion requieren redimensionado previo, lo que degrada la precision.
- Las etiquetas estan en ingles y son fijas; no hay soporte para categorias personalizadas sin reentrenar la ultima capa.
- No hay documentacion sobre normalizacion de entrada (media y desviacion tipica de CIFAR-10), lo que puede provocar diferencias de rendimiento entre implementaciones.
- Ausencia de informacion sobre la particion de datos, semilla y criterios de validacion, lo que dificulta la reproducibilidad exacta de los resultados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LuizGusta709/Luimage
- Perfil del autor: https://huggingface.co/LuizGusta709
- Repositorio CIFAR-10 (conjunto de datos utilizado): https://www.cs.toronto.edu/~kriz/cifar.html
- PyTorch (framework de implementacion): https://pytorch.org/
