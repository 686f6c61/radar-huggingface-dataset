# ChodBhangra/knee-cartilage-segmentation

## Resumen

Este repositorio de HuggingFace, publicado por el usuario ChodBhangra, es un entorno de evaluación comparativa (testbed) para segmentación automática multi-clase de cartílago de rodilla en imágenes de resonancia magnética (MRI). El proyecto utiliza el conjunto de datos de la Osteoarthritis Initiative (OAI / OAIZIB-CM) y se centra en tres estructuras anatómicas: cartílago femoral (FC), cartílago tibial medial (MTC) y cartílago tibial lateral (LTC). No se trata de un modelo de lenguaje: es una plataforma de experimentación para comparar arquitecturas de segmentación 2D, 2.5D y 3D.

El README describe cinco arquitecturas soportadas: UNet (línea base 2D), Pseudo3D (apilado de canales en 2.5D), nnUNet (bloques residuales 2D con supervisión profunda), TransUNet (encoder híbrido CNN-Transformer con bottleneck ViT) y UNet3D (volumétrico con puertas de atención). El repositorio incluye un script de configuración (`run_config.py`) para generar experimentos de forma interactiva o por línea de comandos. Su relevancia radica en permitir a investigadores y desarrolladores evaluar de forma reproducible el rendimiento de distintas arquitecturas en una tarea clínicamente significativa, la cuantificación del cartílago en osteoartritis.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Múltiples: UNet 2D, Pseudo3D 2.5D, nnUNet, TransUNet, UNet3D |
| Parametros totales | No disponible |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No aplica (procesamiento de imágenes médicas) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de visión por computador) |
| Licencia | No disponible |
| Formato de pesos | No disponible (el repositorio contiene código y datos; no se especifica formato) |

## Arquitectura y entrenamiento

El repositorio es un banco de pruebas diseñado para comparar arquitecturas de segmentación en resonancias magnéticas de rodilla. No hay un único modelo preentrenado, sino que el código permite entrenar y evaluar cinco arquitecturas distintas. Entre ellas, UNet sirve como línea base sobre cortes individuales; Pseudo3D combina tres cortes contiguos como tres canales de entrada para capturar contexto 2.5D; nnUNet utiliza bloques residuales con supervisión profunda; TransUNet incorpora un encoder híbrido donde un transformer ViT actúa como bottleneck sobre las características CNN; y UNet3D procesa volúmenes completos con atención.

El conjunto de datos de entrenamiento es el de la Osteoarthritis Initiative (OAI / OAIZIB-CM), que contiene imágenes de resonancia magnética de rodilla etiquetadas para cartílago femoral, tibial medial y tibial lateral. No se especifican los detalles de composición del dataset, el número de ejemplos ni los métodos de entrenamiento como RLHF o DPO, ya que no aplican a este tipo de modelo. Tampoco se incluyen pesos preentrenados ni métricas de validación en la información disponible.

## Capacidades

- Segmentación multi-clase de cartílago en MRI de rodilla: cartílago femoral, tibial medial y tibial lateral.
- Soporte para cinco arquitecturas de segmentación distinguibles: UNet, Pseudo3D, nnUNet, TransUNet y UNet3D.
- Evaluación comparativa de enfoques 2D, 2.5D y 3D en un mismo entorno experimental controlado.
- Generación de experimentos mediante script de línea de comandos (`run_config.py`), con opciones como `--model`, `--gpu`, `--fraction` y `--yes`.
- Procesamiento de cortes individuales, tríos de cortes y volúmenes completos según la arquitectura elegida.
- No incluye tool calling, generación de texto, razonamiento multi-paso ni capacidades de agente; es exclusivamente un modelo de visión médica.

## Casos de uso

- Investigación en osteoartritis: cuantificar el volumen y el grosor del cartílago femoral y tibial en cohortes del estudio OAI, comparando qué arquitectura obtiene segmentaciones más fiables.
- Benchmarking académico: ejecutar una batería de experimentos para publicar resultados comparativos de UNet, nnUNet o TransUNet sobre el mismo protocolo de validación.
- Desarrollo de herramientas de ayuda al diagnóstico: integrar una de las arquitecturas, por ejemplo nnUNet, en un sistema de análisis automatizado de resonancias magnéticas de rodilla para asistir a radiólogos.
- Formación en aprendizaje profundo médico: usar el testbed como material docente para mostrar las diferencias entre segmentación 2D, 2.5D y 3D en datos volumétricos reales.
- Reproducibilidad de experimentos: reejecutar experimentos con parámetros concretos, como el porcentaje de datos de entrenamiento (`--fraction 50`), para verificar resultados en pipelines de investigación.
- Pruebas de robustez: evaluar el comportamiento de cada arquitectura con distintas fracciones de entrenamiento o configuraciones de GPU para identificar problemas de generalización.
- Personalización de pipelines clínicos: adaptar el código y reentrenar el modelo con datos propios de otra institución para segmentar cartílago en resonancias adquiridas con protocolos distintos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio está concebido como una herramienta para ejecutar evaluaciones comparativas, pero el autor no proporciona métricas numéricas (como Dice, IoU o sensibilidad) obtenidas con estos modelos en la documentación pública. Por tanto, no es posible presentar una tabla de resultados comparativos.

## Requisitos de hardware

- Tamaño del repositorio: 12,3 GB. Incluye código, datos y posiblemente pesos de modelos, aunque no se especifica el desglose.
- VRAM estimada para inferencia: no disponible; depende del checkpoint y de la arquitectura seleccionada.
- GPU recomendadas: no disponibles en la documentación. Para UNet2D suele ser suficiente una tarjeta de consumo, mientras que UNet3D volumétrica requiere mucha más memoria.
- El despliegue se plantea como proyecto Python con dependencias instalables vía `pip`; no se mencionan integraciones con vLLM, Ollama, TGI ni llama.cpp.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de comparativas con modelos similares en la información proporcionada. No hay datos cuantitativos de otros repositorios de segmentación de cartílago que permitan una comparación directa con este proyecto. Como contexto interno, el propio repositorio compara cinco arquitecturas, que se resumen a continuación:

| Arquitectura | Dimensionalidad | Características destacadas |
|---|---|---|
| UNet | 2D | Línea base sobre cortes individuales |
| Pseudo3D | 2.5D | Apilado de tres canales para incorporar vecinos |
| nnUNet | 2D | Bloques residuales con supervisión profunda |
| TransUNet | Híbrido | Encoder CNN-Transformer con bottleneck ViT |
| UNet3D | 3D | U-Net volumétrico con puertas de atención |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no procesa texto, no genera respuestas ni admite tool calling, agentes o razonamiento multi-paso.
- La licencia no está especificada en la página del modelo; se debe contactar con el autor antes de cualquier uso comercial o redistribución.
- No incluye pesos preentrenados ni resultados de rendimiento publicados; es un banco de pruebas que requiere entrenamiento propio.
- El conjunto de datos OAI puede estar sujeto a permisos y términos de uso; su acceso y redistribución deben gestionarse conforme a la licencia del estudio.
- Las cohortes del dataset pueden presentar sesgos hacia determinados perfiles de pacientes (edad, grado de osteoartritis), lo que limitaría la generalización a otras poblaciones.
- La fecha de creación del repositorio es de septiembre de 2026, lo que resulta inusual; se recomienda verificar que el repositorio es válido y está publicado correctamente.
- Para uso en producción, es necesario reentrenar y validar los modelos en un conjunto de datos clínico propio, con métricas adaptadas al caso de uso.

## Enlaces

- https://huggingface.co/ChodBhangra/knee-cartilage-segmentation
- https://github.com/aakashrkaku/knee-cartilage-segmentation (proyecto similar de segmentación de cartílago, no del mismo autor)
- https://www.sciencedirect.com/science/article/pii/S2665913125001384 (artículo de revisión sobre avances en segmentación de cartílago por aprendizaje profundo)
