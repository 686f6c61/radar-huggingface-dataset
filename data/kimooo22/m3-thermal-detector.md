# KimOoO22/m3-thermal-detector

## Resumen

M3 Fog Gate es un modelo de clasificación de imágenes desarrollado por el usuario KimOoO22 y publicado en Hugging Face bajo el identificador `KimOoO22/m3-thermal-detector`. A pesar del nombre del repositorio, la model card describe un clasificador de niebla (haze gate) de cuatro clases diseñado para la vista de conductor en tiempo real. El modelo recibe una imagen RGB de 160x160 píxeles y devuelve probabilidades para cuatro niveles de niebla: clear, light, medium y heavy.

El modelo se basa en la arquitectura YOLOv8n-cls, la variante de clasificación de la familia YOLOv8 en su tamaño nano, lo que lo convierte en un componente extremadamente ligero pensado para entornos de inferencia en tiempo real. Su función declarada es actuar como compuerta de ponderación entre dos modelos de percepción: M1 (térmico) y M2 (RGB), dentro de un sistema mayor de fusión multimodal. Adicionalmente, expone una puntuación continua calculada como combinación lineal de las probabilidades de las clases de niebla, pensada para alimentar el módulo de fusión M5.

La relevancia del modelo reside en su enfoque de sistema: no es un modelo de propósito general, sino una pieza especializada de un pipeline de conducción autónoma o asistencia a la conducción que decide cuánto peso dar a la cámara térmica frente a la cámara RGB en función de las condiciones atmosféricas. El repositorio no incluye pesos visibles (tamaño de 0.0 GB), ni licencia, ni idiomas declarados, ni resultados de benchmarks, por lo que su evaluación práctica queda pendiente de que el autor publique artefactos y documentación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8n-cls (clasificación de imágenes, familia YOLOv8, variante nano) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 160x160 RGB) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible (repositorio de 0.0 GB, sin artefactos publicados) |

## Arquitectura y entrenamiento

El modelo emplea YOLOv8n-cls, la variante de clasificación de imágenes de YOLOv8 en tamaño nano. Se trata de una red convolucional ligera optimizada para inferencia de baja latencia, con una entrada fija de 160x160 píxeles RGB y una cabeza de clasificación de cuatro clases (clear, light, medium, heavy). No se dispone de información sobre el número exacto de parámetros, la composición de las capas ni la función de pérdida empleada.

Según la model card, el entrenamiento se realizó sobre imágenes diurnas de BDD100K a las que se aplicó una síntesis de dispersión atmosférica (atmospheric scattering) para generar niebla artificial. El conjunto de validación incluye imágenes reales de niebla del dataset RTTS, que se mantuvieron fuera del entrenamiento, lo que constituye una práctica correcta para medir la generalización a niebla real frente a la niebla sintética. No se especifica el número de épocas, el tamaño del dataset, ni si hubo aumento de datos adicional, ajuste fino o calibración de probabilidades.

## Capacidades

- Clasificación de imágenes RGB de 160x160 píxeles en cuatro niveles de niebla: clear, light, medium y heavy.
- Cálculo de una puntuación continua de niebla mediante `score = 0.33*p(light) + 0.66*p(medium) + 1.0*p(heavy)`, diseñada para alimentar el módulo de fusión M5.
- Actuación como compuerta de ponderación entre un modelo térmico (M1) y un modelo RGB (M2) en un sistema de percepción multimodal.
- Inferencia en tiempo real gracias a la arquitectura nano de YOLOv8-cls.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües, al ser un modelo puramente visual y de clasificación.

## Casos de uso

- Asistencia a la conducción en condiciones de niebla: el modelo clasifica el nivel de niebla en la vista frontal del vehículo y permite al sistema decidir si debe priorizar la cámara térmica (M1) sobre la RGB (M2), mejorando la robustez de la percepción en entornos adversos.
- Fusión multimodal adaptativa: la puntuación continua generada alimenta el módulo M5, que ajusta dinámicamente los pesos de las modalidades térmica y RGB según la densidad de niebla detectada.
- Monitorización de visibilidad en infraestructuras viarias: instalado en cámaras de carretera, el modelo puede reportar niveles de niebla para sistemas de alerta temprana y gestión de tráfico.
- Preprocesado en pipelines de detección de objetos: como etapa previa a detectores que sufren con baja visibilidad, la compuerta permite conmutar o ponderar detectores especializados según la condición atmosférica.
- Validación de datasets y control de calidad: el modelo puede etiquetar automáticamente imágenes por nivel de niebla para filtrar o estratificar conjuntos de datos de conducción.
- Despliegue en dispositivos de borde: por su tamaño nano y entrada de 160x160, es apto para ejecutarse en GPUs de consumo, Jetson o incluso CPU, integrándose en sistemas embarcados de vehículos y cámaras inteligentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; por tratarse de YOLOv8n-cls con entrada de 160x160, se estima un consumo muy bajo, del orden de cientos de MB o menos, aunque no hay datos oficiales.
- GPU recomendadas: cualquier GPU moderna es suficiente; se espera funcionamiento correcto en RTX 4090, A100, H100 y GPUs de gama media, así como en plataformas embebidas tipo NVIDIA Jetson.
- Cabe en GPU de consumo: sí, con alta probabilidad, dado el tamaño nano del backbone y la resolución de entrada reducida.
- Opciones de despliegue: Ultralytics (framework nativo de YOLOv8), ONNX Runtime, TensorRT, OpenVINO; no se confirma soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de visión de este tipo.
- Latencia y throughput estimados: no disponibles; en la práctica, un modelo YOLOv8n-cls a 160x160 suele ofrecer latencias de milisegundos en GPU, pero no hay mediciones publicadas para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Arquitectura | Entrada | Clases | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| M3 Fog Gate (KimOoO22) | YOLOv8n-cls | 160x160 RGB | 4 (niveles de niebla) | no disponible | Repositorio sin pesos publicados (0.0 GB) |
| YOLOv8n-cls (Ultralytics) | YOLOv8n-cls | configurable (por defecto 224x224) | 1000 (ImageNet) | AGPL-3.0 / comercial | Pesos públicos en Ultralytics |
| Clasificadores de niebla basados en ResNet | CNN (ResNet) | variable | variable | variable | Depende del autor |

No se dispone de información suficiente para comparar métricas de rendimiento con alternativas, ya que el autor no ha publicado benchmarks ni pesos verificables.

## Limitaciones y advertencias

- El repositorio no contiene pesos ni artefactos (tamaño de 0.0 GB), por lo que el modelo no es utilizable tal como está publicado.
- No se declara licencia, lo que impide determinar si el uso comercial está permitido.
- El entrenamiento se basa en niebla sintética generada sobre BDD100K diurno; aunque la validación incluye RTTS real, no se documenta el rendimiento en condiciones nocturnas, lluvia, nieve u otras degradaciones atmosféricas.
- La entrada está fijada a 160x160 píxeles, lo que limita la capacidad de detectar niebla fina o localizada en escenas de alta resolución.
- No hay información sobre sesgos del dataset (geografía, condiciones de iluminación, tipo de vía), lo que puede afectar a la generalización.
- Riesgo de falsos negativos o positivos en condiciones límite (niebla muy ligera o muy densa) sin datos de calibración publicados.
- El nombre del repositorio (`m3-thermal-detector`) no coincide con la función descrita en la model card (clasificador de niebla), lo que puede generar confusión sobre el contenido real.
- No apto para uso en producción sin validación adicional, dado que no se han publicado métricas, pesos ni documentación técnica completa.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/KimOoO22/m3-thermal-detector
- Model card del autor: incluida en el repositorio anterior
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
