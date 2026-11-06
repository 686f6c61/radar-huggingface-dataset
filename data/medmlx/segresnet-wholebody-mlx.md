# MedMLX/segresnet-wholebody-mlx

## Resumen

SegResNet whole-body CT es una conversión a formato MLX de los pesos de segmentación de cuerpo completo en tomografía computarizada (TC) publicados por MONAI. El modelo original, `MONAI/wholeBody_ct_segmentation`, se ha reconvertido para ejecutarse de forma nativa en Apple Silicon mediante la librería `mlx`, manteniendo los tensores en float32 con los nombres y disposiciones originales en archivos safetensors. Lo desarrolla MedMLX, un proyecto centrado en inferencia médica en dispositivo (on-device) para hardware de Apple.

El modelo resuelve una tarea de segmentación semántica volumétrica: identifica hasta 104 estructuras anatómicas en exploraciones de TC de cuerpo entero. Se distribuyen dos variantes de pesos, una de alta resolución (inferencia a 1,5 mm) y otra de baja resolución (3 mm), ambas derivadas de los checkpoints `model.pt` y `model_lowres.pt` del repositorio de MONAI en la revisión `13f6d33ae9de6664571d935ee647039f477c3fad`. La arquitectura es SegResNet, una red convolucional 3D con bloques residuales, no un transformer, y no dispone de ventana de contexto ni de parámetros en el sentido de los modelos de lenguaje.

Su relevancia actual radica en que permite ejecutar segmentación anatómica de cuerpo completo en portátiles y equipos de sobremesa con chip de Apple sin depender de CUDA ni de infraestructura en la nube, lo que facilita prototipado, docencia e investigación en imagen médica. El repositorio ocupa aproximadamente 0,2 GB y se publica bajo licencia Apache 2.0. El autor indica explícitamente que no está validado para uso clínico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SegResNet (CNN 3D con bloques residuales), implementación MLX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de segmentación de imágenes, no de texto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en float32) |
| Idiomas soportados | no aplica (modelo de imagen); metadatos de idioma no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX); checkpoints originales en PyTorch (.pt) |
| Entrada | volúmenes de TC 3D |
| Salida | máscara de segmentación con hasta 104 estructuras |
| Resoluciones de inferencia | 1,5 mm (checkpoint high-res) y 3 mm (checkpoint low-res) |
| Tamaño del repositorio | ~0,2 GB |
| Librería | mlx |
| Modelo base | MONAI/wholeBody_ct_segmentation |

## Arquitectura y entrenamiento

SegResNet es una arquitectura de segmentación 3D basada en una red totalmente convolucional con conexiones residuales, diseñada originalmente para segmentación de imágenes médicas volumétricas. El modelo procesa volúmenes de TC y produce una máscara densa con etiquetas para cada vóxel, cubriendo hasta 104 estructuras anatómicas del cuerpo completo. Esta ficha corresponde a una conversión de pesos, no a un reentrenamiento: los tensores se han trasladado de PyTorch a safetensors conservando nombres, disposición y precisión float32, y la arquitectura e inferencia las aporta el paquete `segresnet-mlx`.

Según la model card, los modelos originales se entrenaron con datos de TotalSegmentator. No se detallan en la información disponible el número de volúmenes de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de aumento de datos o ajuste fino específicas. Tampoco se documentan innovaciones de inferencia como decodificación especulativa o atención lineal, que no aplican a este tipo de red. La conversión se limita a hacer viable la ejecución nativa en Apple Silicon mediante MLX.

## Capacidades

- Segmentación semántica 3D de TC de cuerpo entero con hasta 104 estructuras anatómicas.
- Dos variantes de resolución: alta (1,5 mm) y baja (3 mm), con checkpoints separados.
- Ejecución nativa en Apple Silicon mediante la librería MLX.
- Conservación de la precisión float32 de los pesos originales.
- No soporta tool calling ni function calling (no es un modelo generativo de lenguaje).
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de capacidades multilingües ni de generación de texto.
- No incluye modo de razonamiento (thinking mode), visión general, audio ni otras modalidades distintas de la TC.

## Casos de uso

- Prototipado de pipelines de segmentación anatómica en portátiles Mac: el modelo permite cargar volúmenes de TC y obtener máscaras de 104 estructuras directamente en un equipo con chip de Apple, sin GPU NVIDIA ni servicios en la nube.
- Docencia en imagen médica: sirve para demostrar el funcionamiento de la segmentación volumétrica y comparar resultados entre las variantes de 1,5 mm y 3 mm en un entorno local reproducible.
- Investigación en análisis morfológico: la segmentación de estructuras permite calcular volúmenes y métricas anatómicas por región para estudios poblacionales o de cohortes, siempre con revisión humana.
- Preprocesado para modelos posteriores: las máscaras generadas pueden alimentar etapas de registro, extracción de regiones de interés o clasificación de patologías en flujos de investigación.
- Evaluación comparativa de implementaciones: al ser una conversión fiel de los pesos de MONAI, permite contrastar la inferencia en MLX frente a la ejecución original en PyTorch sobre los mismos volúmenes.
- Desarrollo de aplicaciones de escritorio para Mac: integrable en herramientas locales de visualización o anotación que necesiten segmentación automática como paso previo a la revisión del especialista.
- Validación de despliegues on-device: útil para medir latencia y consumo de memoria en Apple Silicon antes de decidir una arquitectura de despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como Dice, Hausdorff o IoU para estas conversiones, ni comparaciones cuantitativas con la implementación original de MONAI.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio de pesos ocupa aproximadamente 0,2 GB, pero el consumo real depende del tamaño del volumen de entrada y de la resolución de inferencia.
- GPU recomendadas: hardware Apple Silicon (series M1, M2, M3, M4 y posteriores); no se documentan requisitos para GPU NVIDIA en esta conversión.
- Compatibilidad con GPU de consumo: el modelo está pensado para ejecutarse en equipos Mac con chip de Apple; no se especifican requisitos para RTX 4090 u otras GPU de consumo en el contexto de MLX.
- Opciones de despliegue: librería MLX y el paquete `segresnet-mlx` (https://github.com/MedMLX/segresnet-mlx); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Resoluciones | Estructuras | Licencia | Formato / plataforma |
|---|---|---|---|---|---|
| MedMLX/segresnet-wholebody-mlx | SegResNet (MLX) | 1,5 mm y 3 mm | hasta 104 | Apache 2.0 | safetensors / Apple Silicon |
| MONAI/wholeBody_ct_segmentation | SegResNet (PyTorch) | 1,5 mm y 3 mm | hasta 104 | Apache 2.0 | .pt / PyTorch |
| Otros modelos de segmentación de cuerpo completo | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa más relevante es con el checkpoint original de MONAI, del que esta versión es una conversión de pesos. No se dispone de datos de benchmarks que permitan comparar el rendimiento numérico entre ambas implementaciones.

## Limitaciones y advertencias

- No validado para uso clínico: el autor indica que es para investigación y educación, y que las salidas requieren revisión humana.
- Es una conversión de pesos, no un modelo reentrenado; cualquier limitación del checkpoint original de MONAI se hereda.
- No se documentan sesgos específicos, pero al entrenarse con datos de TotalSegmentator puede presentar un rendimiento desigual según la población, el equipo de adquisición y el protocolo de imagen.
- Riesgo de errores de segmentación en estructuras pequeñas, anatomía atípica o imágenes con artefactos; no debe usarse como única fuente de decisión.
- La resolución de inferencia (1,5 mm frente a 3 mm) condiciona el detalle de las máscaras; la variante de baja resolución es más rápida pero menos precisa.
- Dependencia de la plataforma MLX y de Apple Silicon; no se documenta compatibilidad con otros backends.
- Licencia Apache 2.0: permite uso comercial, pero debe conservarse el aviso de licencia original de MONAI incluido en el repositorio.
- No se especifican requisitos de memoria para volúmenes grandes; conviene validar el consumo en el hardware objetivo antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MedMLX/segresnet-wholebody-mlx
- Modelo base en Hugging Face: https://huggingface.co/MONAI/wholeBody_ct_segmentation
- Model card del modelo base: https://huggingface.co/MONAI/wholeBody_ct_segmentation/blob/13f6d33ae9de6664571d935ee647039f477c3fad/docs/README.md
- Repositorio de inferencia segresnet-mlx: https://github.com/MedMLX/segresnet-mlx
- Paper de MedMLX (medRxiv): https://doi.org/10.64898/2026.10.28.26366762
