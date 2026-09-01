# AllenInstitute/deeplabcut-ctlut-np3-side-cam-sam-corbett-2020-03-31

## Resumen

Este modelo es un sistema de estimación de pose sin marcadores (markerless pose estimation) desarrollado con el framework DeepLabCut, publicado por el Allen Institute for Neural Dynamics. Está diseñado para rastrear 36 puntos anatómicos de un ratón (ojos, orejas, vibrisas, patas, cola, etc.) en vídeos grabados con una cámara lateral. El nombre del modelo (`ctlut-np3-side-cam`) sugiere que emplea seguimiento condicional top-down (CTD), una variante de DeepLabCut que usa contexto temporal de fotogramas anteriores para condicionar las predicciones del fotograma actual.

El modelo fue entrenado por Hilda Azimi sobre un conjunto de datos denominado `ctlut` y alcanza un error medio de 6,18 píxeles en el conjunto de test (2,51 píxeles con un p-cutoff de 0,6). Con 1.030.000 iteraciones de entrenamiento, es un modelo relativamente maduro. Su relevancia radica en que permite cuantificar el comportamiento animal de forma automática y reproducible, una tarea fundamental en neurociencia y etología. El repositorio ocupa 0,3 GB, lo que indica un tamaño de pesos moderado, probablemente compatible con GPUs de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (framework DeepLabCut; típicamente backbone convolucional tipo ResNet, pero no se especifica) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de visión por fotogramas) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo de visión) |
| Licencia | No disponible |
| Formato de pesos | No disponible (repositorio de 0,3 GB, probablemente contiene checkpoints de TensorFlow/PyTorch) |

## Arquitectura y entrenamiento

La arquitectura exacta no se detalla en la información proporcionada. DeepLabCut, el framework utilizado, se basa típicamente en redes neuronales convolucionales con un backbone preentrenado (ResNet-50, ResNet-101 o MobileNet) seguido de capas deconvolucionales que generan mapas de calor (heatmaps) para cada keypoint. El nombre del modelo incluye `ctlut`, que según la documentación de DeepLabCut corresponde a modelos de seguimiento condicional top-down (CTD), donde la red utiliza contexto temporal de fotogramas previos para condicionar la predicción actual, mejorando la estabilidad en vídeos con oclusiones o movimientos rápidos.

El entrenamiento se realizó con 1.030.000 iteraciones sobre un conjunto de datos llamado `ctlut`, cuya composición exacta (número de fotogramas, animales, condiciones) no se especifica. El error de entrenamiento es de 0,93 píxeles y el de test de 6,18 píxeles, con un p-cutoff de 0,6 (umbral de confianza para filtrar predicciones de baja calidad). No se menciona el uso de aumentos de datos, regularización ni técnicas de post-procesado adicionales.

## Capacidades

- Estimación de pose de 36 keypoints anatómicos en ratones, incluyendo ojos (párpados, pupilas), vibrisas, orejas, fosas nasales, lengua, patas delanteras y traseras (con dedos individuales) y cola.
- Seguimiento condicional top-down (CTD): utiliza contexto temporal de fotogramas anteriores para estabilizar las predicciones en vídeo, reduciendo saltos y errores en fotogramas individuales.
- Análisis de comportamiento: al rastrear puntos como la lengua, las patas y la cola, permite cuantificar comportamientos como lamer, alcanzar objetos, exploración y posturas.
- Compatible con el ecosistema DeepLabCut: puede usarse con las herramientas de análisis, visualización y refinamiento del framework (por ejemplo, `deeplabcut.analyze_videos` con `ctd_tracking=True`).
- No es un modelo de lenguaje ni multimodal: su única función es la estimación de pose en imágenes o vídeos.

## Casos de uso

- Investigación en neurociencia del comportamiento: cuantificar movimientos de la lengua, las patas y la cabeza durante tareas de alcanzar y lamer en ratones, correlacionando la cinemática con actividad neuronal.
- Estudios de toxicología y farmacología: evaluar efectos de fármacos sobre la motricidad fina y gruesa en roedores mediante el seguimiento automático de 36 puntos corporales.
- Fenotipado de modelos de enfermedad: caracterizar déficits motores en ratones transgénicos o con lesiones (por ejemplo, modelos de Parkinson o lesión medular) comparando trayectorias de keypoints entre grupos.
- Análisis de interacción social: aunque el modelo está entrenado para un solo animal, puede aplicarse a vídeos de un ratón individual en contextos de interacción con objetos o entornos enriquecidos.
- Validación de sistemas de vídeo-vigilancia en laboratorio: usar el error de test (6,18 px) como referencia para calibrar cámaras y condiciones de iluminación en instalaciones de cría y experimentación.
- Automatización de pipelines de análisis de comportamiento: integrar el modelo en flujos de trabajo con DeepLabCut para procesar largas grabaciones (horas) sin intervención manual, generando datos de pose listos para análisis estadístico.

## Benchmarks y rendimiento

La información disponible solo incluye el error de píxeles (distancia euclidiana media entre keypoints predichos y reales). No se han publicado resultados en benchmarks estándar como COCO o MPII.

| Set | Error (px) | Error con p-cutoff (px) |
|---|---|---|
| Train | 0,93 | 0,93 |
| Test | 6,18 | 2,51 |

_Iteraciones de entrenamiento: 1.030.000; p-cutoff: 0,6. Menor es mejor._

## Requisitos de hardware

- No se dispone de requisitos específicos para este modelo en la información proporcionada.
- DeepLabCut puede ejecutarse en GPUs de consumo (NVIDIA GTX 1080, RTX 2060 o superiores) para inferencia en tiempo real o casi real, dependiendo de la resolución de entrada y el backbone.
- Para entrenamiento desde cero o fine-tuning, se recomienda al menos 8 GB de VRAM; el tamaño del repositorio (0,3 GB) sugiere que el modelo cabe holgadamente en GPUs con 4 GB o más.
- Opciones de despliegue: el modelo puede usarse con la interfaz de DeepLabCut (Python), o exportarse a TensorFlow Lite o TensorRT para inferencia en edge devices.
- La latencia típica de DeepLabCut con backbone ResNet-50 en una GPU moderna es de 10-30 ms por fotograma, aunque no se ha medido específicamente para este modelo.

## Comparativa con modelos similares

No se dispone de modelos comparables específicos en la información proporcionada. DeepLabCut ofrece un Model Zoo con modelos preentrenados (por ejemplo, SuperAnimal) que cubren múltiples especies y configuraciones de cámara, pero no se han encontrado modelos con los mismos 36 keypoints y configuración de cámara lateral. La comparación directa requeriría evaluar en el mismo conjunto de datos, lo cual no está disponible.

## Limitaciones y advertencias

- El modelo está entrenado para una configuración específica: cámara lateral (`side-cam`), un sujeto concreto (`sam-corbett`) y un conjunto de datos llamado `ctlut`. Su generalización a otros ángulos de cámara, otras cepas de ratón o condiciones de iluminación diferentes no está garantizada.
- El error de test (6,18 px) es considerablemente mayor que el de entrenamiento (0,93 px), lo que sugiere cierto sobreajuste o diferencias entre los datos de entrenamiento y test.
- No se especifica la licencia, por lo que el uso comercial o la redistribución requieren contactar con el Allen Institute para aclarar los términos.
- La información sobre la arquitectura exacta, el número de parámetros y el formato de pesos no está disponible, lo que dificulta la reproducibilidad y la integración en entornos de producción sin el framework DeepLabCut completo.
- El modelo solo procesa fotogramas individuales (con contexto temporal en modo CTD); no realiza seguimiento multi-animal ni clasificación de comportamientos, tareas que requieren módulos adicionales de DeepLabCut.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AllenInstitute/deeplabcut-ctlut-np3-side-cam-sam-corbett-2020-03-31
- Repositorio oficial de DeepLabCut: https://github.com/DeepLabCut/DeepLabCut
- Documentación de DeepLabCut (bienvenida): https://deeplabcut.github.io/DeepLabCut/README.html
- Guía de usuario de DeepLabCut (incluye seguimiento condicional top-down): https://deeplabcut.github.io/DeepLabCut/docs/main-workflows/user-guide.html
- Paquete PyPI de DeepLabCut: https://pypi.org/project/deeplabcut/
