# RahmahwithCode/cats-vs-dogs-cnn

## Resumen

Cats vs Dogs CNN es una red neuronal convolucional ligera implementada con Keras y TensorFlow que resuelve una tarea de clasificacion binaria de imagenes: distinguir fotografias de gatos de fotografias de perros. El modelo ha sido publicado por el usuario RahmahwithCode en Hugging Face y se distribuye como un artefacto de tipo `.keras`, cargable directamente mediante `keras.models.load_model`. No se trata de un modelo de lenguaje ni de un modelo fundacional, sino de un clasificador de vision de proposito especifico, entrenado sobre el dataset `microsoft/cats_vs_dogs`.

La relevancia de este modelo es fundamentalmente didactica y de referencia: sirve como ejemplo minimo de pipeline de clasificacion de imagenes con Keras, con un preprocesado sencillo (redimensionado a 64x64 y normalizacion dividiendo por 255) y una metrica declarada de accuracy de 0,78 en test. No compite con modelos de vision de gran escala ni ofrece capacidades generativas, de tool calling o multilingues.

El repositorio tiene un tamano declarado de 0,0 GB (lo que sugiere pesos muy pequenos o un empaquetado minimo) y no incluye informacion sobre licencia, idiomas ni arquitectura detallada mas alla de ser una CNN. Cualquier evaluacion en produccion debe partir de la premisa de que la documentacion tecnica es escasa y que el modelo no ha sido validado de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (red neuronal convolucional) implementada en Keras |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; salida limitada a dos clases: cat/dog) |
| Licencia | no disponible |
| Formato de pesos | `.keras` (formato nativo de Keras 3 / TensorFlow) |

## Arquitectura y entrenamiento

La model card describe unicamente una CNN pequena entrenada con Keras sobre el dataset `microsoft/cats_vs_dogs`. El preprocesado de entrada es explicito: imagenes RGB redimensionadas a 64x64 pixeles y normalizadas dividiendo los valores de pixel por 255. La salida es binaria, con la clase 0 asignada a "cat" y la clase 1 asignada a "dog". No se especifica el numero de capas convolucionales, filtros, funciones de activacion, uso de dropout, batch normalization ni la estrategia de regularizacion empleada.

Tampoco se documenta el numero de ejemplos de entrenamiento, la particion train/validation/test, el numero de epocas, el optimizador, la funcion de perdida ni si se aplico aumento de datos (data augmentation). No hay evidencia de tecnicas avanzadas como transfer learning desde un backbone preentrenado (ResNet, EfficientNet, MobileNet), atencion, ni decodificacion especulativa. La unica metrica reportada es una accuracy de 0,78 en test, sin desglose por clase ni matriz de confusion.

## Capacidades

- Clasificacion binaria de imagenes: distingue entre las clases "cat" (0) y "dog" (1).
- Entrada de imagen RGB redimensionada a 64x64 pixeles, con normalizacion por 255.
- Carga directa mediante la API de Keras (`keras.models.load_model`).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No tiene capacidades multilingues (no procesa texto).
- No dispone de modo "thinking", vision avanzada, audio ni generacion.
- No se documentan capacidades de deteccion, segmentacion ni clasificacion multi-etiqueta.

## Casos de uso

- Prototipado educativo de vision por computador: el modelo sirve como ejemplo minimo y reproducible para ensenar el flujo completo de entrenamiento y despliegue de una CNN con Keras, desde la carga del dataset hasta la inferencia.
- Clasificacion rapida en demos y cuadernos (notebooks): al tener una entrada de 64x64 y pesos presumiblemente pequenos, puede ejecutarse en CPU en entornos de baja potencia para demostraciones interactivas.
- Filtrado preliminar en pipelines de imagenes: como primer paso de triaje en un sistema mayor que necesite separar imagenes de mascotas antes de un modelo mas especializado, siempre que la precision del 0,78 sea aceptable para el caso.
- Generacion de datasets etiquetados de forma asistida: usar el modelo para pre-etiquetar imagenes de gatos y perros y revisar manualmente las predicciones, acelerando la anotacion en proyectos de vision.
- Pruebas de integracion de Keras en produccion: sirve para validar el empaquetado `.keras`, la carga del modelo y el preprocesado en un entorno de despliegue antes de sustituirlo por un modelo mayor.
- Benchmark interno de infraestructura: al ser un modelo pequeno, puede utilizarse para medir latencia base de inferencia en CPU/GPU y comparar configuraciones de servidores de modelos.
- Ejercicio de evaluacion de robustez: permite estudiar como se degrada la accuracy con cambios de resolucion, iluminacion o razas atipicas, dado que no hay data augmentation documentado.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto |
|---|---|---|
| Accuracy | 0,78 | Test (dataset `microsoft/cats_vs_dogs`) |

No se han publicado resultados adicionales de benchmarks (precision, recall, F1, matriz de confusion, latencia o throughput) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamano del repositorio (0,0 GB) y la entrada de 64x64, se espera un consumo minimo, aunque no hay cifras oficiales.
- GPU recomendadas: no disponible; el modelo es lo bastante pequeno como para ejecutarse en CPU, pero no se documenta latencia.
- Compatibilidad con GPU de consumo: probable en cualquier GPU consumer moderna e incluso en CPU, sin datos oficiales de rendimiento.
- Opciones de despliegue: Keras/TensorFlow nativo (carga via `keras.models.load_model`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no aplicables aqui).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cats vs Dogs CNN (este modelo) | no disponible | no aplica | accuracy 0,78 en test | no disponible | Hugging Face (Keras) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de la misma categoria en la documentacion proporcionada; no se pueden establecer comparaciones cuantitativas fiables.

## Limitaciones y advertencias

- Documentacion tecnica muy escasa: no se detalla arquitectura, hiperparametros, particion de datos ni proceso de entrenamiento, lo que impide reproducir o auditar el modelo.
- Accuracy de 0,78 en test, sin desglose por clase: puede existir un sesgo hacia una de las dos clases que no se refleja en la metrica agregada.
- Entrada de baja resolucion (64x64): pierde detalle fino y probablemente falla en imagenes con oclusiones, razas atipicas, fondos complejos o iluminacion adversa.
- Riesgo de sobreajuste al dataset `microsoft/cats_vs_dogs`: la distribucion de imagenes de ese dataset puede no representar fotos reales de produccion.
- Licencia no disponible: no se puede confirmar el uso comercial; debe contactarse con el autor antes de cualquier despliegue comercial.
- Sin informacion sobre sesgos: no se documenta el equilibrio de razas, origenes ni condiciones de captura del dataset de entrenamiento.
- No apto para tareas fuera de la clasificacion binaria gato/perro: no generaliza a otras especies ni a clasificacion multi-clase.
- Sin validacion independiente: no hay evidencia externa de los resultados reportados por el autor.

## Enlaces

- Hugging Face: https://huggingface.co/RahmahwithCode/cats-vs-dogs-cnn
- Dataset de entrenamiento: https://huggingface.co/datasets/microsoft/cats_vs_dogs
- Documentacion de Keras: https://keras.io/
- TensorFlow: https://www.tensorflow.org/
