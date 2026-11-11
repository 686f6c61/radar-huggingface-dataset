# HafizRehan5833/fruit-freshness-detection

## Resumen

FruitGuard AI es un modelo de clasificacion de imagenes desarrollado por HafizRehan5833 que distingue entre fruta fresca y fruta en mal estado. Se trata de un modelo de vision por computador basado en MobileNetV2 con aprendizaje por transferencia desde ImageNet, entrenado para una tarea binaria de clasificacion (`fresh` frente a `spoiled`) sobre ocho variedades de fruta: manzana, platano, uva, guayaba, azufaifo, naranja, granada y fresa.

El modelo opera sobre imagenes RGB de 224 × 224 pixeles y se distribuye en formato nativo de Keras (`.keras`), con un preprocesado interno que gestiona el reescalado de los valores de pixel dentro del grafo. Su proposito es servir como componente de inspeccion visual en entornos de agricultura, logistica de cadena de frio, procesado de alimentos y monitorizacion de lineales en comercio minorista.

La relevancia del modelo reside en su caracter practico: una arquitectura ligera (MobileNetV2) orientada a despliegue en dispositivos con recursos limitados, con una licencia MIT permisiva y unas metricas declaradas por el autor muy altas (99,84 % de exactitud sobre 1.850 imagenes de test). No obstante, la informacion publica es escasa en cuanto a composicion del dataset, proceso de entrenamiento y validacion independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV2 (transfer learning desde ImageNet) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada 224 × 224 RGB) |
| Tipos de cuantizacion | no disponible (pesos en formato Keras; no se documentan variantes cuantizadas) |
| Idiomas soportados | en (etiquetas y documentacion en ingles) |
| Licencia | MIT |
| Formato de pesos | `.keras` (TensorFlow/Keras) |
| Tarea | Clasificacion de imagenes binaria (`fresh`, `spoiled`) |
| Resolucion de entrada | 224 × 224 × 3 (RGB) |
| Clases | 2 (`fresh` = 0, `spoiled` = 1) |
| Variedades soportadas | Manzana, platano, uva, guayaba, azufaifo, naranja, granada, fresa |
| Libreria | Keras / TensorFlow |
| Tamano del repositorio | 0.0 GB (segun Hugging Face) |
| Descargas | 0 |
| Likes | 0 |

## Arquitectura y entrenamiento

El modelo emplea MobileNetV2 como extractor de caracteristicas, inicializado con pesos preentrenados en ImageNet y ajustado mediante aprendizaje por transferencia para la tarea binaria de frescura. MobileNetV2 es una red convolucional con bloques residuales invertidos y convoluciones separables en profundidad, disenada para un coste computacional bajo en inferencia. La cabeza de clasificacion produce una unica salida escalar interpretada como probabilidad de la clase `spoiled`, de modo que la probabilidad de `fresh` se obtiene como complemento (1 − p). El preprocesado de reescalado esta integrado en el propio grafo del modelo, por lo que la entrada debe proporcionarse como valores de pixel en crudo.

No se dispone de informacion publica sobre el numero de imagenes de entrenamiento, la composicion exacta del dataset (el campo `datasets` indica unicamente `custom`), el numero de epocas, la estrategia de aumento de datos, la tasa de aprendizaje ni si se aplicaron tecnicas de regularizacion como dropout o early stopping. Tampoco se documenta ningun proceso de ajuste fino con RLHF o DPO, algo esperable en un modelo de vision de este tipo. La unica innovacion tecnica declarada es el uso de aprendizaje por transferencia desde ImageNet y el reescalado in-graph.

## Capacidades

- Clasificacion binaria de imagenes de fruta en las categorias `fresh` y `spoiled`.
- Salida de probabilidad calibrada por clase (`fresh_probability` y `spoiled_probability`) junto con un veredicto y un nivel de confianza en porcentaje.
- Cobertura de ocho variedades de fruta: manzana, platano, uva, guayaba, azufaifo, naranja, granada y fresa.
- Entrada de imagen RGB a 224 × 224 pixeles, con preprocesado de reescalado integrado en el modelo.
- Inferencia en Python mediante TensorFlow/Keras y descarga de pesos desde Hugging Face con `hf_hub_download`.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, generacion de texto ni modalidades de audio o video.
- No dispone de modo de razonamiento (thinking mode) ni de capacidades multilingues mas alla de las etiquetas en ingles.

## Casos de uso

- **Clasificacion automatizada en cinta transportadora:** el modelo puede integrarse en un sistema de inspeccion optica en almacenes de envasado, clasificando cada pieza que pasa por la linea y activando un rechazador neumatico cuando la salida indica `spoiled`. Su resolucion de 224 × 224 y su arquitectura ligera permiten procesar fotogramas de forma continua.
- **Control de calidad en lineales de supermercado:** un sistema de camaras fijas podria capturar imagenes de la fruta expuesta y consultar al modelo para detectar piezas deterioradas, disparando alertas de reposicion o ajustes de precio dinamico.
- **Verificacion en muelles de recepcion de cadena de frio:** durante la recepcion de mercancia, el modelo puede clasificar muestras de cada lote para detectar contaminacion cruzada o roturas de la cadena de frio antes de aceptar el envio.
- **Prefiltro en procesado de alimentos:** en lineas de produccion de zumos, purees o alimentacion infantil, el modelo actua como filtro previo que descarta fruta en mal estado antes del procesado, reduciendo el riesgo de contaminacion del lote.
- **Aplicaciones moviles de evaluacion de frescura:** al ser un modelo Keras ligero, puede exportarse y ejecutarse en dispositivos moviles o de borde para que un usuario final fotografíe una pieza de fruta y obtenga un veredicto con probabilidad asociada.
- **Investigacion en calidad alimentaria:** el modelo sirve como linea base reproducible (licencia MIT, pesos publicos) para experimentos de clasificacion de frescura y para comparar con arquitecturas alternativas sobre el mismo conjunto de variedades.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre 1.850 imagenes de test completamente reservadas:

| Metrica | Fruta fresca | Fruta en mal estado | Sistema global |
|---|---|---|---|
| Exactitud | — | — | 99,84 % (1.847 / 1.850) |
| Precision | 99,68 % | 100,00 % | 99,84 % |
| Recall | 100,00 % | 99,67 % | 99,84 % |
| F1-Score | 0,9984 | 0,9984 | 0,9984 |

No se han publicado resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que se trata de un modelo de clasificacion de imagenes y no de un modelo de lenguaje. Tampoco se documenta la composicion del conjunto de test ni el metodo de particion respecto al de entrenamiento, por lo que las cifras deben interpretarse como declaraciones del autor no verificadas de forma independiente.

## Requisitos de hardware

- **VRAM estimada para inferencia:** no disponible de forma explicita. MobileNetV2 es una arquitectura ligera; con entrada de 224 × 224 y dos clases, el modelo cabe holgadamente en GPUs de gama baja y en CPU.
- **GPU recomendadas:** cualquier GPU con soporte CUDA y al menos 2 GB de memoria deberia ser suficiente; no se especifican modelos concretos (A100, H100, RTX 4090) en la documentacion.
- **Compatibilidad con GPU de consumo:** si, previsiblemente en cualquier GPU de consumo moderna (GTX 1050 o superior) e incluso en CPU para inferencia por lotes pequenos, dado el bajo coste de MobileNetV2.
- **Opciones de despliegue:** TensorFlow/Keras en Python (carga directa con `tf.keras.models.load_model`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo. Es posible exportar a TensorFlow Lite o TensorFlow.js para despliegue en movil o navegador, aunque no se proporcionan artefactos de este tipo.
- **Latencia y throughput:** no disponibles. No se publican mediciones de latencia ni de imagenes por segundo.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. A continuacion se indica que datos serian necesarios para una comparativa rigurosa y que no estan disponibles:

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FruitGuard AI (este modelo) | no disponible | 224 × 224 RGB | 99,84 % exactitud declarada (test propio) | MIT | Hugging Face, formato `.keras` |
| Alternativa 1 | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativa 2 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se identifican en la informacion proporcionada modelos de clasificacion de frescura de fruta con los que establecer una comparacion directa de parametros, contexto, rendimiento y licencia.

## Limitaciones y advertencias

- **Metricas no verificadas de forma independiente:** el 99,84 % de exactitud procede de la evaluacion del propio autor sobre un conjunto de test no documentado; no hay validacion externa ni descripcion de como se separaron entrenamiento y test, lo que impide descartar fuga de datos.
- **Dataset opaco:** no se especifica el numero de imagenes de entrenamiento, su procedencia, condiciones de iluminacion, fondo ni balance entre variedades y clases, lo que limita la evaluacion de su robustez en dominios distintos.
- **Sesgo de dominio:** al entrenarse sobre un dataset `custom` no descrito, el modelo puede degradarse ante imagenes con condiciones de iluminacion, angulos, fondos o variedades distintas a las del entrenamiento.
- **Riesgo de falsos negativos y positivos:** aunque las metricas declaradas son altas, en produccion un falso negativo (fruta en mal estado clasificada como fresca) tiene consecuencias de seguridad alimentaria; se recomienda umbral de decision ajustable y supervision humana.
- **Alcance limitado a ocho variedades:** no cubre otras frutas ni estados intermedios de maduracion; la clasificacion es estrictamente binaria y no gradúa el grado de frescura.
- **Idioma:** las etiquetas y la documentacion estan en ingles; no hay soporte multilingue.
- **Restricciones de licencia:** la licencia MIT permite uso comercial, modificacion y redistribucion con atribucion y sin garantia; conviene conservar el aviso de copyright original.
- **Caveats de produccion:** no se documentan versionado del modelo, calibracion de probabilidades, pruebas de estres ni auditoria de sesgos; el repositorio tiene 0 descargas y 0 likes, lo que sugiere ausencia de validacion por la comunidad.
- **Formato de pesos unico:** solo se ofrece `.keras`; no hay variantes GGUF, ONNX ni TensorFlow Lite publicadas, lo que puede requerir conversion manual para despliegues en borde.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HafizRehan5833/fruit-freshness-detection
- Repositorio GitHub del proyecto: https://github.com/HafizRehan5833/system7_project
- No se han encontrado en la informacion proporcionada papers, blogs, demos ni otros repositorios adicionales.
