# OneScience-Group/SpectralGPT

## Resumen

SpectralGPT es un modelo fundacional de teledetección desarrollado por el Aerospace Information Research Institute de la Academia China de las Ciencias y otras instituciones, publicado bajo el nombre de OneScience-Group. Está diseñado específicamente para aprender representaciones generales a partir de imágenes multiespectrales de observación de la Tierra, un dominio donde la mayoría de los modelos fundacionales existentes se limitan a imágenes RGB. El modelo aborda tareas como clasificación de escenas, segmentación semántica y detección de cambios en condiciones de etiquetas limitadas.

La arquitectura se basa en un enfoque de modelado enmascarado tridimensional (3D masked image modeling) que combina el acoplamiento espacial y espectral de los datos multiespectrales. Se entrena con imágenes de 12 bandas del satélite Sentinel-2 (excluyendo la banda B10), utilizando los conjuntos de datos fMoW-S2 y BigEarthNet-S2. El modelo se presenta como el primer modelo fundacional diseñado explícitamente para datos espectrales de teledetección, con una red 3D GPT integrada en el marco de los autoencoders enmascarados (MAE). Actualmente el repositorio de HuggingFace no incluye pesos entrenados, solo el código y los scripts de entrenamiento, aunque los autores indican que los publicarán en una futura actualización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | 3D GPT (Masked Autoencoder con red 3D) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, procesa parches espaciales y espectrales) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (documentacion y etiquetas) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (aun no se publican pesos; el codigo usa checkpoints .pth de PyTorch) |

## Arquitectura y entrenamiento

SpectralGPT emplea una red 3D GPT dentro del marco de los autoencoders enmascarados (MAE). A diferencia de los MAE convencionales que operan sobre imagenes RGB de 2D, esta arquitectura procesa volumenes tridimensionales donde las dimensiones espaciales (alto y ancho) se combinan con la dimension espectral (bandas). Esto permite capturar tanto el acoplamiento espacial-espectral como la secuencialidad espectral, caracteristicas unicas de los datos multiespectrales de teledeteccion. El modelo se entrena con un objetivo de reconstruccion multiobjetivo sobre parches enmascarados.

El entrenamiento se realiza en dos etapas con datos de Sentinel-2 de 12 bandas (se excluye la banda B10, correspondiente a la nube cirrus). La primera etapa utiliza 712.874 imagenes de fMoW-S2 (de un total de 882.779), y la segunda etapa emplea 354.196 imagenes de BigEarthNet-S2 (de un total de 590.326). Todas las bandas se escalan al rango [0,1]. El proceso de entrenamiento es auto-supervisado mediante modelado enmascarado, sin necesidad de etiquetas humanas. El codigo publicado permite entrenar con datos sinteticos para validar el pipeline o con datos reales de EuroSAT, aunque los pesos oficiales del modelo entrenado no estan disponibles en el repositorio actual.

## Capacidades

- Clasificacion de escenas de teledeteccion, tanto de una sola etiqueta como multi-etiqueta, a partir de representaciones multiespectrales aprendidas.
- Segmentacion semantica de imagenes de observacion de la Tierra, aprovechando las representaciones espaciales y espectrales conjuntas.
- Deteccion de cambios entre imagenes multiespectrales de la misma zona en diferentes fechas.
- Aprendizaje con etiquetas limitadas (few-shot o low-label), gracias al preentrenamiento auto-supervisado sobre grandes volumenes de datos sin anotar.
- Procesamiento de imagenes multiespectrales de 12 bandas de Sentinel-2, incluyendo bandas fuera del espectro visible (infrarrojo cercano y de onda corta).
- Generacion de representaciones generales transferibles a multiples tareas downstream de teledeteccion.

## Casos de uso

- Monitorizacion agricola: clasificacion de tipos de cultivo y deteccion de estres vegetal utilizando las bandas del infrarrojo cercano y de onda corta, donde la informacion espectral es critica para distinguir especies y estados fenologicos.
- Gestion de desastres naturales: deteccion de cambios en cobertura del suelo tras inundaciones, incendios o deslizamientos, comparando imagenes multiespectrales de antes y despues del evento.
- Cartografia urbana: segmentacion semantica de areas urbanas para identificar edificios, infraestructura verde y superficies impermeables, con aplicacion en planificacion urbana y evaluacion de riesgos.
- Control de calidad de datos satelitales: validacion de pipelines de ingesta de imagenes Sentinel-2, usando el modelo para verificar la coherencia espectral y espacial de los datos recibidos.
- Investigacion en cambio climatico: analisis de series temporales multiespectrales para estudiar la evolucion de glaciares, desertificacion o deforestacion, gracias a la capacidad de detectar cambios sutiles en la firma espectral.
- Desarrollo de modelos especificos: uso de las representaciones preentrenadas como inicializacion para fine-tuning en tareas personalizadas de teledeteccion con pocas etiquetas, reduciendo la necesidad de datos anotados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper original (arxiv:2311.07113) describe experimentos en clasificacion de escenas, segmentacion semantica y deteccion de cambios, pero los numeros concretos no estan incluidos en la documentacion del repositorio de HuggingFace ni en los resultados de la busqueda web. Ademas, el repositorio actual no proporciona pesos entrenados, por lo que no es posible reproducir evaluaciones independientes en este momento.

## Requisitos de hardware

- El repositorio recomienda una GPU o DCU (unidad de computacion de deep learning, tipicamente de fabricantes chinos como Hygon) para entrenamiento e inferencia completos.
- La CPU puede utilizarse para importar el modelo y realizar pruebas de conectividad a pequeña escala, pero el entrenamiento y la inferencia seran significativamente mas lentos.
- Para usuarios de DCU, se requiere instalar DTK (Deep Learning Toolkit) version 25.04.2 o superior, o la version recomendada por OneScience para el cluster correspondiente.
- El entrenamiento multi-GPU se soporta mediante `torchrun` con `--nproc_per_node=8` para un nodo de 8 GPUs.
- No se especifican requisitos de VRAM concretos, ya que el tamaño del modelo no se ha publicado. Al no haber pesos disponibles, no se puede estimar la memoria necesaria para inferencia.
- Opciones de despliegue: el codigo proporciona scripts de entrenamiento e inferencia en PyTorch. No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI, dado que es un modelo de vision y no un LLM generativo de texto.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa cuantitativa con otros modelos fundacionales de teledeteccion como SatMAE, Scale-MAE o RingMo, ya que la informacion proporcionada no incluye parametros, benchmarks ni pesos del modelo. Se puede indicar que SpectralGPT se diferencia de estos por su enfoque explicito en datos multiespectrales de 12 bandas y su arquitectura 3D, mientras que la mayoria de alternativas procesan imagenes RGB o un numero menor de bandas. Sin embargo, sin datos publicados de rendimiento, no es posible establecer una comparacion rigurosa.

## Limitaciones y advertencias

- El repositorio actual no incluye pesos entrenados; solo se proporciona el codigo y los scripts. Los autores indican que los pesos se publicaran en una futura actualizacion bajo el directorio `weight/`. Cualquier entrenamiento con los datos sinteticos incluidos no produce representaciones utiles para teledeteccion real.
- Los datos de entrenamiento (fMoW-S2 y BigEarthNet-S2) no se distribuyen desde el repositorio de OneScience. El usuario debe obtenerlos de las fuentes oficiales, y el flujo de trabajo por defecto utiliza datos sinteticos solo para validar el pipeline.
- El modelo esta pensado para imagenes de Sentinel-2 con 12 bandas especificas y un orden de bandas determinado. Usar otras fuentes de datos o un orden distinto puede degradar el rendimiento o producir errores.
- No se han publicado evaluaciones de sesgos o alucinaciones. Como modelo de representacion visual, no genera texto, pero las representaciones aprendidas pueden reflejar sesgos geograficos o de cobertura del suelo presentes en los datos de entrenamiento.
- La licencia Apache-2.0 permite uso comercial, pero al no haber pesos publicados, el uso practico esta actualmente limitado a fines de investigacion y desarrollo del codigo.
- El modelo no soporta procesamiento de imagenes RGB estandar; requiere datos multiespectrales con el formato y escalado especificos descritos en la documentacion.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/OneScience-Group/SpectralGPT
- Paper en arXiv: https://arxiv.org/abs/2311.07113
- Version HTML del paper: https://arxiv.org/html/2311.07113
- Repositorio GitHub (implementacion de referencia): https://github.com/a0x8o/spectral-gpt
- Plataforma OneScience: https://www.onescience.ai/home
- Pagina de modelos de OneScience en HuggingFace: https://huggingface.co/OneScience-Group/models
- Registro en Zenodo: https://zenodo.org/records/10533809
- Datos EuroSAT (Zenodo): https://zenodo.org/records/7711810
- Descarga de datos multiespectrales EuroSAT: https://madm.dfki.de/files/sentinel/EuroSATallBands.zip
