# nidl-neurospin/open-simclr-resnet50

## Resumen

Open-SimCLR ResNet-50 es un modelo fundacional auto-supervisado para resonancia magnetica cerebral 3D, desarrollado por el equipo de nidl en NeuroSpin (CEA). Se trata de una ResNet-50 adaptada a volumetricos 3D y preentrenada con el marco contrastivo SimCLR sobre imagenes de resonancia cuasi-crudas (T1w, T2w y FLAIR) del dataset abierto OpenMind. El modelo no genera texto ni realiza tareas generativas: es un extractor de caracteristicas que produce representaciones de 2048 dimensiones por volumen cerebral.

El problema que resuelve es la escasez de modelos fundacionales abiertos y reproducibles en neuroimagen. A diferencia de otros modelos medicos con pesos cerrados o recetas opacas, aqui se publican conjuntamente los pesos, el codigo, los datos de preentrenamiento y la receta completa, lo que permite reproducir el entrenamiento y comparar nuevos metodos bajo condiciones identicas.

Con 51,5 millones de parametros totales y una entrada de 1 x 128 x 128 x 128, el modelo es ligero para los estandares actuales y esta pensado como punto de partida para fine-tuning o para extraccion de caracteristicas congeladas en tareas downstream como regresion de edad, clasificacion diagnostica o segmentacion. Su relevancia actual radica en que forma parte de una familia de modelos abiertos (open models) de nidl entrenados exclusivamente con datos publicos y con licencia CC-BY 4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-50 3D (encoder) con cabeza de proyeccion SimCLR |
| Parametros totales | 51.519.296 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision 3D; entrada 1 x 128 x 128 x 128) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de imagen medica) |
| Licencia | CC-BY 4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un estimador `nidl.estimators.ssl.SimCLR` cuyo encoder es una ResNet-50 tridimensional (`resnet50` de nidl) con 50,4 millones de parametros y una salida de 2048 dimensiones. La entrada es un volum en de un solo canal de 128 x 128 x 128 tras el preprocesado: redimensionado a 121 x 145 x 121, recorte o relleno (CropOrPad) a 128^3 y normalizacion Z (ZNormalization). Los pesos publicados incluyen tanto el encoder como la cabeza de proyeccion, de modo que el preentrenamiento puede continuarse y el modelo puede afinarse.

El preentrenamiento se realizo con SimCLR sobre el split de entrenamiento de OpenMind: 63.992 volumenes cuasi-crudos T1w, T2w y FLAIR de 31.775 participantes procedentes de 787 datasets de OpenNeuro, con skull-stripping, correccion de sesgo y registro lineal a MNI152 a 1 mm. Se entreno durante 100 epocas (999 pasos por epoca) en una unica GPU NVIDIA H100, con lotes de 64 imagenes y precision `bf16-mixed`. El optimizador fue AdamW con learning rate 0,0001 y weight decay 0,0005, con warmup lineal de 10 epocas desde 1e-06 y decaimiento coseno posterior hasta cero. Todos los hiperparametros residen en `config.json`, desde el que `from_config` reconstruye el mismo estimador inicializado aleatoriamente.

## Capacidades

- Extraccion de caracteristicas de resonancia magnetica cerebral 3D: genera un vector de 2048 dimensiones por volumen.
- Aprendizaje auto-supervisado contrastivo (SimCLR), sin necesidad de etiquetas durante el preentrenamiento.
- Soporte de modalidades T1-weighted, T2-weighted y FLAIR.
- Fine-tuning sobre las representaciones aprendidas para tareas downstream (clasificacion, regresion, segmentacion mediante cabezas adicionales).
- Uso como features congeladas para modelos lineales o ridge regression.
- Continuacion del preentrenamiento desde los pesos publicados (incluye cabeza de proyeccion).
- No soporta tool calling, function calling, agentes, generacion de texto, vision natural, audio ni modo thinking: es exclusivamente un extractor de caracteristicas de imagen medica.

## Casos de uso

- Regresion de edad cerebral: tal como se documenta en la evaluacion con OpenBHB, una ridge regression sobre las caracteristicas congeladas predice la edad con un MAE de 3,86 anos (R^2 0,77), util como linea base en estudios de envejecimiento.
- Clasificacion diagnostica con pocas etiquetas: al disponer de representaciones preentrenadas sobre 63.992 volumenes, se pueden entrenar clasificadores ligeros para patologias con conjuntos etiquetados reducidos.
- Extraccion de biomarcadores: el vector de 2048 dimensiones puede alimentar modelos estadisticos o de machine learning clasico para analisis de cohortes.
- Fine-tuning para segmentacion: anadiendo un decoder 3D sobre el encoder se puede adaptar a tareas de segmentacion de estructuras cerebrales.
- Comparacion metodologica reproducible: al ser un modelo abierto con receta publica, sirve como baseline controlado para evaluar nuevos metodos auto-supervisados en neuroimagen.
- Preprocesado de pipelines de neuroimagen: integracion en flujos que requieran representaciones compactas de volumenes MNI152 a 1 mm para busqueda de similitud o clustering de sujetos.
- Investigacion en armonizacion multi-modal: el entrenamiento conjunto con T1w, T2w y FLAIR permite estudiar representaciones compartidas entre modalidades.

## Benchmarks y rendimiento

| Tarea | Dataset | Metrica | Resultado |
|---|---|---|---|
| Regresion de edad (ridge sobre features congeladas) | OpenBHB test (757 participantes) | MAE | 3,86 anos |
| Regresion de edad (ridge sobre features congeladas) | OpenBHB test (757 participantes) | R^2 | 0,77 |

No se han publicado en la informacion disponible resultados de benchmarks adicionales (por ejemplo, clasificacion diagnostica o segmentacion) ni comparaciones numericas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 51,5 millones de parametros en bf16 el modelo ocupa aproximadamente 0,1 GB en pesos, aunque el coste dominante es el volum en de entrada de 128^3.
- GPU recomendadas: el preentrenamiento se realizo en una NVIDIA H100; para inferencia y extraccion de caracteristicas es suficiente una GPU consumer moderna.
- Cabe en GPU consumer: si, por el reducido numero de parametros; el factor limitante es la memoria para lotes de volumenes 3D.
- Opciones de despliegue: libreria nidl (`pip install nidl[pretrained]`), con `SimCLR.from_pretrained` y `model.transform(loader)`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otros modelos fundacionales de neuroimagen ni sus especificaciones.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en resonancia magnetica cerebral 3D; no procesa texto, imagenes 2D naturales ni otras modalidades.
- Requiere un preprocesado estricto (skull-stripping, correccion de sesgo, registro lineal a MNI152 a 1 mm) para obtener resultados comparables a los reportados.
- La evaluacion publicada se limita a una tarea de regresion de edad en OpenBHB; el rendimiento en otras tareas downstream no esta documentado.
- Riesgo de sesgo derivado de la composicion de OpenMind (787 datasets de OpenNeuro), que puede no representar de forma equilibrada poblaciones, equipos o protocolos.
- Licencia CC-BY 4.0 en los pesos: permite uso comercial con atribucion; no obstante, las imagenes de OpenMind conservan las licencias de sus datasets originales de OpenNeuro, lo que puede condicionar el uso de datos derivados.
- No se documentan cuantizaciones ni optimizaciones para despliegue en produccion; el uso previsto es investigacion y extraccion de caracteristicas.
- Al ser un modelo de representacion y no generativo, no debe emplearse para producir diagnosticos sin validacion clinica adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nidl-neurospin/open-simclr-resnet50
- Dataset OpenMind: https://huggingface.co/datasets/neurospin/openmind
- Receta de preentrenamiento: https://neurospin-deepinsight.github.io/nidl/auto_examples/plot_open_models_pretraining.html
- Documentacion de nidl: https://neurospin-deepinsight.github.io/nidl
- Ejemplo de evaluacion en OpenBHB: https://neurospin-deepinsight.github.io/nidl/auto_examples/plot_pretrained_openbhb.html
- Repositorio de nidl: https://github.com/neurospin-deepinsight/nidl
- Paper OpenMind (Wald et al., ICCV 2025): referencia bibliografica incluida en la model card, sin URL directa
- Paper SimCLR (Chen et al., ICML 2020): referencia bibliografica incluida en la model card, sin URL directa
