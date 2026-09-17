# MA29/astro-image-classifier

## Resumen

Astro Image Classifier es un modelo de clasificacion de imagenes desarrollado por el usuario MA29 (repo HuggingFace `MA29/astro-image-classifier`). Se trata de un ensemble de dos ramas CNN con transfer learning que clasifica imagenes astronomicas en 11 clases: `black_hole`, `earth`, `galaxy`, `jupiter`, `mars`, `mercury`, `neptune`, `pluto`, `saturn`, `uranus` y `venus`. No es un modelo de lenguaje: es un clasificador de vision por computador con entrada fija de 224x224x3 en RGB.

El modelo combina dos backbones clasicos inicializados con ImageNet, VGG19 y DenseNet201, parcialmente descongelados y con cabezas personalizadas. La prediccion final se obtiene promediando las dos salidas softmax de 11 clases. El conjunto suma 40.056.982 parametros y se distribuye en formato nativo de Keras 3.10, con el estado del optimizador eliminado, por lo que es un artefacto exclusivamente de inferencia.

Su relevancia es practica y acotada: ofrece una precision muy alta (0,9910 sobre un split de test de 446 imagenes) en una tarea cerrada y de nicho, con licencia MIT y un coste de inferencia bajo (aproximadamente 160 MB de pesos en float32). Es util como componente de catalogacion o preetiquetado de imagenes planetarias y de cielo profundo, siempre que se asuma que el modelo no tiene clase de rechazo y que solo se ha evaluado en distribucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de dos CNN con transfer learning (VGG19 + DenseNet201) y media de salidas softmax |
| Parametros totales | 40.056.982 |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No aplica: modelo de clasificacion de imagenes; entrada fija de 224x224x3 (RGB, valores 0-255) |
| Tipos de cuantizacion | No se documentan. Pesos guardados bajo politica `mixed_float16`; la carga recomendada es en `float32` |
| Idiomas soportados | No aplica; las 11 etiquetas de salida estan en ingles |
| Licencia | MIT |
| Formato de pesos | Keras 3 (`ensemble_model.keras`), solo inferencia (estado del optimizador eliminado) |
| Tarea | Clasificacion de imagenes (11 clases, closed-world) |
| Backbones | VGG19 y DenseNet201, inicializados con ImageNet y parcialmente descongelados |
| Cabezas | Global average pooling, capa densa con batch normalization y dropout |
| Preprocesado | Interno en ambas ramas; se debe alimentar con RGB crudo 0-255 |
| Tamano del repositorio | 0,3 GB |
| Fecha de publicacion | 17 de septiembre de 2026 (creacion y ultima actualizacion) |

## Arquitectura y entrenamiento

El modelo es un ensemble de dos ramas convolucionales independientes que comparten la misma entrada de 224x224x3. La rama VGG19 y la rama DenseNet201 parten de pesos de ImageNet, se descongelan parcialmente y se rematan con cabezas personalizadas compuestas por global average pooling, una capa densa con batch normalization y dropout. Cada rama produce un vector softmax de 11 clases y la salida final es la media de ambas distribuciones. La rama VGG incorpora ademas un bloque de data augmentation que permanece inactivo en inferencia.

Ambas ramas realizan el preprocesado de forma interna: la rama DenseNet mediante una capa `Lambda(preprocess_input)` serializada bajo el nombre `preprocess_input`, y la rama VGG mediante un intercambio de canales seguido de una resta de medias. Esto implica que la entrada debe ser RGB crudo en rango 0-255; aplicar `vgg19.preprocess_input` o `densenet.preprocess_input` antes de llamar al modelo duplica el preprocesado y degrada gravemente las predicciones en algunas clases. Al cargar el modelo es obligatorio pasar `custom_objects={"preprocess_input": preprocess_input}` de `tensorflow.keras.applications.densenet`.

El autor no documenta el numero total de imagenes de entrenamiento, la composicion exacta del dataset, ni el uso de tecnicas de ajuste como RLHF o DPO (no aplicables en clasificacion). El unico detalle de particion disponible es que el split de test se reconstruyo a partir de `image_dataset_from_directory(validation_split=0.3, seed=42)` seguido de `temp_ds.skip(14)`, lo que arroja 446 imagenes. El propio autor advierte que ese conjunto procede del mismo dataset curado que el entrenamiento, por lo que las metricas reflejan unicamente rendimiento en distribucion.

## Capacidades

- Clasificacion de imagenes astronomicas en 11 categorias cerradas: `black_hole`, `earth`, `galaxy`, `jupiter`, `mars`, `mercury`, `neptune`, `pluto`, `saturn`, `uranus` y `venus`.
- Salida probabilistica: devuelve un vector softmax de 11 valores por imagen, no una etiqueta unica, lo que permite aplicar umbrales o revision manual.
- Inferencia sobre imagenes de entrada de 224x224x3 con preprocesado automatico interno; no requiere pipeline externo de normalizacion.
- Ejecutable como modelo Keras nativo, lo que facilita su integracion en servicios TensorFlow Serving, exportacion a ONNX o conversion a TensorFlow Lite.
- Capacidad de preetiquetado masivo de lotes de imagenes por su bajo coste computacional relativo (40 millones de parametros).
- Mejora marginal demostrada del ensemble frente a cada rama por separado (0,9910 frente a 0,9888 en ambas ramas individuales).

No dispone de generacion de texto, razonamiento, codigo, matematicas, tool calling, function calling, soporte de agentes, capacidades multilingues, modo thinking, vision general mas alla de la clasificacion, audio ni ninguna otra capacidad propia de un modelo generativo o multimodal.

## Casos de uso

- Catalogacion de archivos de imagenes planetarias: el modelo puede procesar lotes de imagenes de 224x224 y asignar una de las 11 etiquetas a cada una, lo que permite organizar automaticamente colecciones de imagenes de planetas y cielo profundo con una precision medida del 99,1% en distribucion.
- Preetiquetado de datasets de entrenamiento: dado su bajo coste (aproximadamente 160 MB de pesos en float32), se puede ejecutar sobre grandes volumenes de imagenes para generar etiquetas iniciales que despues se revisan manualmente, reduciendo el trabajo de anotacion antes de entrenar modelos mayores.
- Aplicaciones educativas y de divulgacion: integrado en una app o demo tipo Gradio, el modelo puede mostrar al usuario la clase astronomica detectada y la probabilidad asociada, como ya hace el Space publicado por el autor.
- Filtrado previo en pipelines de publicacion de contenido: en plataformas que reciben imagenes de astronomia amateur, el clasificador puede separar imagenes de planetas, galaxias y agujeros negros antes de pasar a una revision editorial o a un sistema de moderacion.
- Clasificacion en observatorios educativos o telescopios de bajo coste: al caber en practicamente cualquier GPU consumer e incluso en CPU, puede desplegarse en el borde (edge) junto al instrumento para etiquetar capturas en el momento de la adquisicion.
- Despliegue en servicios de inferencia ligeros: exportable a TensorFlow Lite o ONNX, permite servir la clasificacion en dispositivos moviles o en contenedores pequenos dentro de un pipeline MLOps.
- Analisis rapido de imagenes de planetas del sistema solar: las clases `jupiter`, `mars`, `mercury`, `neptune`, `pluto`, `saturn`, `uranus` y `venus` alcanzan F1 de 0,967 a 1,000 en el test reportado, lo que lo hace adecuado para tareas de identificacion planetaria en material de archivo.

## Benchmarks y rendimiento

Metricas reportadas por el autor sobre un split de test retenido de 446 imagenes:

| Modelo | Precision en test |
|---|---|
| Rama DenseNet201 sola | 0,9888 |
| Rama VGG19 sola | 0,9888 |
| Ensemble (este modelo) | 0,9910 (442/446) |

Metricas globales del ensemble: macro F1 0,990, weighted F1 0,991, confianza media 98,4%.

Desglose por clase:

| Clase | Precision | Recall | F1 | Soporte |
|---|---|---|---|---|
| black_hole | 1,000 | 0,952 | 0,976 | 21 |
| earth | 1,000 | 1,000 | 1,000 | 35 |
| galaxy | 0,962 | 1,000 | 0,980 | 25 |
| jupiter | 1,000 | 1,000 | 1,000 | 39 |
| mars | 0,978 | 0,957 | 0,967 | 46 |
| mercury | 1,000 | 1,000 | 1,000 | 50 |
| neptune | 1,000 | 1,000 | 1,000 | 52 |
| pluto | 1,000 | 1,000 | 1,000 | 37 |
| saturn | 1,000 | 1,000 | 1,000 | 41 |
| uranus | 1,000 | 1,000 | 1,000 | 48 |
| venus | 0,962 | 0,981 | 0,971 | 52 |

Errores observados: los cuatro fallos del conjunto de test corresponden a tres confusiones venus/mars y un `black_hole` clasificado como `galaxy` con un 100% de confianza. El autor advierte que la confianza alta no es un indicador fiable de acierto en este modelo.

No se han publicado resultados de benchmarks en la informacion disponible mas alla de los anteriores, ni comparaciones con otros clasificadores astronomicos externos (MMLU, HumanEval, GSM8K y similares no aplican).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 160 MB solo para los pesos en float32 y 80 MB en float16; contando activaciones y los picos de memoria de TensorFlow, conviene reservar entre 1 y 2 GB.
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM es suficiente. Funciona sin problema en NVIDIA T4, RTX 3050, RTX 3060, RTX 4090, A100 o H100, aunque estas dos ultimas estan sobredimensionadas para este modelo.
- Compatibilidad con GPU consumer: si, cabe en practicamente todas las GPU consumer actuales e incluso en iGPU con suficiente memoria compartida.
- Ejecucion en CPU: viable. Con 40 millones de parametros y dos backbones convolucionales, la inferencia por CPU es posible, aunque notablemente mas lenta que en GPU.
- Opciones de despliegue: Keras/TensorFlow nativo, TensorFlow Serving, TensorFlow Lite (movil y edge), ONNX Runtime previa conversion, Triton Inference Server, BentoML y Hugging Face Spaces con Gradio (opcion ya usada por el autor).
- Opciones no aplicables: llama.cpp, GGUF, Ollama y vLLM no son compatibles porque el modelo no es un transformer autoregresivo ni un modelo de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada. Como referencia derivada de las arquitecturas, cada imagen de 224x224 supone del orden de 19,6 GFLOPs por la rama VGG19 y 4,3 GFLOPs por la rama DenseNet201, es decir, aproximadamente 24 GFLOPs por inferencia, lo que en una GPU consumer moderna se traduce en decenas o cientos de imagenes por segundo; esta cifra es una estimacion a partir de las arquitecturas, no un dato medido por el autor.

## Comparativa con modelos similares

El autor solo proporciona comparacion interna entre las dos ramas del ensemble, que son las alternativas mas directas dentro del mismo repositorio:

| Alternativa | Parametros | Precision en test | Contexto de entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ensemble (este modelo) | 40.056.982 | 0,9910 | 224x224x3 | MIT | HuggingFace, Space y GitHub |
| Rama DenseNet201 sola | No disponible | 0,9888 | 224x224x3 | MIT | Incluida en el propio ensemble |
| Rama VGG19 sola | No disponible | 0,9888 | 224x224x3 | MIT | Incluida en el propio ensemble |

No se dispone de datos en la informacion proporcionada para comparar con otros clasificadores astronomicos externos (por ejemplo, variantes basadas en ResNet, EfficientNet o modelos especializados en morfologia galactica). Cualquier comparacion de ese tipo requeriria benchmarks adicionales no publicados por el autor.

## Limitaciones y advertencias

- Dataset de entrenamiento curado y relativamente limpio: el modelo no se ha evaluado con capturas reales de telescopio, fotogramas con ruido ni recortes o encuadres inusuales, por lo que su comportamiento fuera de ese dominio es desconocido.
- Problema de mundo cerrado: no existe una clase "ninguna de las anteriores". Toda imagen de entrada se fuerza a una de las 11 clases, de modo que las imagenes fuera de distribucion reciben etiquetas seguras pero sin significado.
- Metricas solo en distribucion: el split de test se extrae del mismo dataset curado que el entrenamiento, por lo que el 0,9910 de precision no debe interpretarse como rendimiento en imagenes reales de telescopio.
- Confusion entre clases visualmente similares: venus y mars se confunden con luz pobre o baja resolucion; el autor recomienda tratar las predicciones de imagen unica como indicativas.
- Confianza no calibrada: se ha observado un `black_hole` clasificado como `galaxy` con un 100% de confianza, lo que invalida el uso de la probabilidad softmax como senal fiable de correccion sin una calibracion previa.
- Sensibilidad al preprocesado: aplicar preprocesado externo de VGG19 o DenseNet201 antes de la inferencia duplica el preprocesado interno y degrada gravemente las predicciones en algunas clases.
- Requisito de `custom_objects` al cargar: si no se pasa `{"preprocess_input": preprocess_input}` de `tensorflow.keras.applications.densenet`, la carga del modelo falla o resuelve la capa Lambda de forma incorrecta.
- Politica de precision mixta: el modelo se guardo bajo `mixed_float16` pero debe cargarse con `keras.mixed_precision.set_global_policy("float32")`; ignorarlo puede alterar los resultados.
- Solo inferencia: el estado del optimizador se elimino, por lo que el artefacto no puede reanudar ni continuar el entrenamiento.
- Licencia MIT: permite uso comercial y modificacion con atribucion, sin restricciones adicionales conocidas. No se documentan sesgos especificos mas alla de los derivados del dataset de ImageNet y del propio conjunto de entrenamiento, cuyo origen y composicion no se detallan.
- Idiomas: no aplica, ya que las salidas son etiquetas en ingles; no hay soporte multilingue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MA29/astro-image-classifier
- Demo (HuggingFace Space): https://huggingface.co/spaces/MA29/astro-image-classifier
- Codigo fuente (GitHub): https://github.com/Majd1029/Astro-Image-Classifier
- Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces anteriores son los unicos proporcionados por el autor.
