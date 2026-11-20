# jramduran/animals10-cnn-scratch

## Resumen

`jramduran/animals10-cnn-scratch` es una red neuronal convolucional (CNN) pequena entrenada desde cero (sin pesos preentrenados) para clasificar fotografias en una de diez categorias de animales: mariposa, gato, pollo, vaca, perro, elefante, caballo, oveja, arana y ardilla. Lo desarrolla el usuario de Hugging Face `jramduran` como parte de un proyecto comparativo de clasificacion de imagenes, y sirve como linea base frente a la que se contrastan modelos de aprendizaje por transferencia.

El modelo tiene aproximadamente 0,76 millones de parametros, seis capas convolucionales con normalizacion por lotes, dropout y global average pooling, y trabaja con entradas de 90x90 pixeles en color RGB. Se entrenó durante 41 epocas sobre el conjunto de datos Animals-10 (26.177 fotos, particion estratificada 80/10/10) en una GPU NVIDIA GeForce RTX 5060 Laptop, con un tiempo de entrenamiento de unos 9 minutos.

Es relevante como ejemplo didactico y reproducible de entrenamiento de una CNN desde cero, con metricas publicadas sobre un conjunto de test intacto (n=2618) y codigo de entrenamiento disponible en GitHub. No es un modelo de proposito general ni un modelo de lenguaje: es un clasificador de imagenes de dominio muy acotado, con licencia no especificada y sin soporte multilingue ni de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (6 capas convolucionales, batch norm, dropout, global average pooling) |
| Parametros totales | ~0,76 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada 90x90 px) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; clasificacion de imagenes) |
| Licencia | no disponible |
| Formato de pesos | `.keras` (Keras v3), con `model_info.json` asociado |

## Arquitectura y entrenamiento

La arquitectura es una CNN compacta disenada y entrenada desde cero, sin inicializacion con pesos preentrenados. Consta de seis capas convolucionales, normalizacion por lotes, dropout y una capa de global average pooling antes de la clasificacion final en diez clases. La entrada son imagenes RGB de 90x90 pixeles, que se pasan al modelo como pixeles crudos en rango 0-255, sin normalizacion (segun el ejemplo de uso de la model card). El modelo se guarda en formato `.keras` y se ejecuta con backend PyTorch de Keras (`KERAS_BACKEND="torch"`), que es el backend con el que se entrenó y probó.

El entrenamiento se realizó sobre el dataset Animals-10 (`34data/animal-10`), con 26.177 fotografias y una particion estratificada 80/10/10: entrenamiento, validacion para early stopping y test intacto. Se completaron 41 epocas en una NVIDIA GeForce RTX 5060 Laptop GPU en aproximadamente 9 minutos. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de alineacion (no aplicables a este tipo de modelo), ni innovaciones como decodificacion especulativa o atencion lineal. El codigo de entrenamiento esta en el repositorio de GitHub del proyecto, en el directorio `training/`.

## Capacidades

- Clasificacion de imagenes en diez clases de animales: `butterfly`, `cat`, `chicken`, `cow`, `dog`, `elephant`, `horse`, `sheep`, `spider`, `squirrel`.
- Salida de probabilidades por clase (softmax sobre diez categorias) mediante `model.predict`.
- Entrada de imagenes RGB redimensionadas a 90x90 pixeles, sin normalizacion previa.
- Inferencia ligera apta para CPU o GPU de gama baja por su reducido tamano (~0,76 M de parametros).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues ni de generacion de texto.
- No dispone de modo thinking, vision general, audio ni otras capacidades especiales.

## Casos de uso

- Clasificacion automatica de fotos en catalogos de fauna: el modelo asigna una de diez etiquetas de animal a cada imagen, util para etiquetado inicial de galerias o bases de datos fotograficas de animales.
- Filtrado y moderacion de contenido en aplicaciones de mascotas: permite descartar o etiquetar imagenes que no corresponden a las categorias esperadas (por ejemplo, separar gatos y perros del resto) en un pipeline de subida de imagenes.
- Linea base para experimentos de aprendizaje por transferencia: al estar entrenado desde cero y compartir particion de datos con otros modelos del proyecto, sirve para medir la ganancia real de usar pesos preentrenados.
- Docencia y aprendizaje de vision por computador: el modelo y su codigo de entrenamiento (41 epocas, ~9 minutos en una GPU de portatil) son reproducibles en un portatil, lo que lo hace adecuado para practicas de CNN.
- Prototipado rapido de clasificadores de imagen en entornos con recursos limitados: su tamano (~0,76 M de parametros) permite desplegarlo en CPU o dispositivos de borde para demos.
- Preetiquetado en proyectos de anotacion de datasets de fauna: genera etiquetas iniciales que un humano revisa, reduciendo el coste de anotacion manual en las diez clases cubiertas.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto de test reservado (n=2618):

| Metrica (test, n=2618) | Valor |
|---|---|
| Accuracy | 0,885 |
| F1 macro | 0,875 |
| Precision (macro) | 0,876 |
| Recall (macro) | 0,875 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) por no ser aplicables a este tipo de modelo, ni tablas de comparacion con las otras variantes del proyecto.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con ~0,76 M de parametros y entradas de 90x90, el modelo ocupa del orden de unos pocos MB en memoria, por lo que cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: cualquier GPU consumer moderna (por ejemplo, RTX 3060, RTX 4060, RTX 4090) o incluso CPU; el entrenamiento se realizó en una RTX 5060 Laptop.
- Cabe en GPU consumer: si, en practicamente todas; tambien en CPU para inferencia.
- Opciones de despliegue: Keras 3 con backend PyTorch (configuracion usada en el ejemplo), o backend TensorFlow; no se documentan exportaciones a ONNX, GGUF, vLLM, llama.cpp, Ollama ni TGI (no aplicables a este modelo).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; el entrenamiento completo (41 epocas) tardo unos 9 minutos en una RTX 5060 Laptop.

## Comparativa con modelos similares

No se dispone de datos de otros modelos comparables en la informacion proporcionada (ni de las otras variantes del mismo proyecto, que la model card menciona pero no detalla). Por tanto, la comparativa se indica como no disponible.

| Modelo | Parametros | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `jramduran/animals10-cnn-scratch` | ~0,76 M | 90x90 px | Accuracy 0,885 (test n=2618) | no disponible | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Dominio muy acotado: solo clasifica diez especies concretas; cualquier imagen fuera de esas categorias se asignara igualmente a una de las diez clases, con riesgo de falsos positivos.
- Sin informacion sobre sesgos: no se documenta la composicion demografica ni la procedencia de las imagenes de Animals-10, por lo que no se puede evaluar el sesgo del modelo.
- Riesgo de error en clases visualmente similares (por ejemplo, gato/perro o caballo/vaca), reflejado en la matriz de confusion incluida en la model card, que no se detalla en la informacion disponible.
- Entrada fija de 90x90 pixeles sin normalizacion: cualquier uso debe replicar exactamente el preprocesado del ejemplo (RGB, redimensionado, pixeles 0-255) para obtener resultados comparables.
- Licencia no disponible: no se puede confirmar el uso comercial ni las condiciones de redistribucion; es un caveat importante para produccion.
- Modelo de investigacion/didactico con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion ni de mantenimiento.
- Sin soporte de texto, tool calling, agentes ni multilingue: no es adecuado para tareas de lenguaje.
- Dependencia del backend PyTorch de Keras para reproducir los resultados declarados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jramduran/animals10-cnn-scratch
- Dataset Animals-10: https://huggingface.co/datasets/34data/animal-10
- Codigo de entrenamiento (GitHub): https://github.com/JTiiz/CNN-project
- Matriz de confusion: `confusion_matrix.png` (incluida en el repositorio del modelo)
