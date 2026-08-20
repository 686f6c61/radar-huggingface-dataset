# rphammonds/scalesurfer-stats

## Resumen

ScaleSurfer v567 es un modelo de regresión tabular multi-cabeza desarrollado por rphammonds para predecir las estadísticas morfométricas de FreeSurfer (formato `.stats`) a partir de una imagen de resonancia magnética ponderada en T1 y su segmentación anatómica `aparc+aseg`. El modelo combina las versiones 5, 6 y 7 de FreeSurfer en un único conjunto de entrenamiento, lo que permite unificar las predicciones de grosor cortical, área superficial, curvatura e índice de plegado en un solo paso de inferencia. Está construido sobre un codificador congelado previamente entrenado con un objetivo de segmentación multi-escala, seguido de cabezas de regresión específicas para cada grupo de estadísticas (global, aseg, lh_aparc y rh_aparc).

El repositorio contiene los pesos en formato `safetensors` (0,8 GB), junto con metadatos de arquitectura y diagnóstico de entrenamiento. El modelo está pensado para flujos de trabajo de investigación en neurociencia y no es un dispositivo de diagnóstico clínico. Su relevancia actual radica en acelerar el análisis morfométrico a gran escala, reduciendo el tiempo de procesamiento de FreeSurfer de horas a minutos, y en la integración con el ecosistema de código abierto de ScaleSurfer.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador volumétrico 3D tipo UNet con cuello de botella Transformer (según la documentación de ScaleSurfer) y cabezas de regresión multi-target para estadísticas de FreeSurfer |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no aplicable (entrada de imagen 3D) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplicable (modelo de visión) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo de estadísticas v567 utiliza un codificador congelado que fue pre-entrenado con el objetivo de segmentación anatómica multi-escala de ScaleSurfer. El codificador parte de un checkpoint de cross-entropy original y se continuó con una pérdida soft-Dice más cross-entropy ponderada, siguiendo la estrategia de FastSurferCNN v2.5.4. Sobre este codificador congelado se entrenan cuatro cabezas de regresión independientes, una para cada grupo de estadísticas (aseg, global, lh_aparc, rh_aparc), inicializadas desde un modelo de estadísticas previo entrenado con todos los datos. El entrenamiento se realizó con un objetivo de regresión multi-target sobre las estadísticas de FreeSurfer 5, 6 y 7 combinadas.

No se han publicado detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de RLHF/DPO. La innovación principal es la combinación de versiones de FreeSurfer y la arquitectura multi-cabeza que permite predecir todas las métricas de forma simultánea.

## Capacidades

- Predicción de estadísticas morfométricas de FreeSurfer: grosor cortical, área superficial, curvatura e índice de plegado.
- Procesamiento de imágenes T1w y segmentación anatómica `aparc+aseg` para obtener medidas de regiones corticales y subcorticales.
- Soporte de múltiples versiones de FreeSurfer (5, 6 y 7) en un único modelo.
- Regresión tabular multi-target con cabezas separadas para grupos de métricas (global, aseg, lh_aparc, rh_aparc).
- Integración con la librería `ScaleSurferStatsPredictor` para predicción directa sobre sujetos.
- No incluye soporte de tool calling, agentes, visión multimodal ni procesamiento de lenguaje natural; es un modelo puramente de imagen y regresión.

## Casos de uso

- Análisis de neuroimagen a gran escala: el modelo permite procesar bases de datos de miles de sujetos sin ejecutar FreeSurfer completo, reduciendo el tiempo de horas a minutos por sujeto. Adecuado para estudios de cohortes longitudinales o transversales en los que se necesitan métricas morfométricas de forma rápida.
- Sustitución o complemento de pipelines de FreeSurfer: en entornos de investigación con recursos computacionales limitados, se puede usar para obtener estadísticas de grosor cortical y volumen sin depender de la instalación completa de FreeSurfer.
- Segmentación anatómica y posterior análisis de regiones de interés: dado que el modelo requiere una segmentación `aparc+aseg`, se integra con el módulo volumétrico de ScaleSurfer para generar la segmentación y luego predecir las estadísticas de forma conjunta.
- Estudio de biomarcadores de enfermedades neurodegenerativas: las métricas de grosor cortical y volumen subcortical son relevantes en el estudio de Alzheimer, Parkinson o esclerosis múltiple. El modelo permite extraer estas métricas de manera homogénea entre versiones de FreeSurfer.
- Replicación de resultados de FreeSurfer: al combinar las versiones 5, 6 y 7, el modelo puede utilizarse para comparar o armonizar resultados entre versiones de FreeSurfer en estudios multicéntricos.
- Desarrollo de herramientas de investigación de código abierto: al estar disponible en HuggingFace y con código en GitHub, se puede integrar en flujos de trabajo personalizados de Python, por ejemplo con `ScaleSurferStatsPredictor.predict_subjects()`.

## Benchmarks y rendimiento

La model card incluye un resumen de prueba con métricas de error normalizado y error porcentual absoluto mediano por grupo de targets:

| Grupo | Targets | Valores | MAE normalizado | Mediana error porcentual absoluto |
|---|---|---|---|---|
| aseg | 119 | 39699 | 0,4187 | 6,72 % |
| global | 64 | 16070 | 0,1523 | 1,05 % |
| lh_aparc | 306 | 106742 | 0,4085 | 7,22 % |
| rh_aparc | 306 | 106738 | 0,4122 | 7,31 % |

No se han publicado resultados de benchmarks comparativos con otros modelos (por ejemplo, FastSurferCNN o FreeSurfer original) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no se ha publicado un valor exacto. Dado el tamaño del repositorio (0,8 GB), el modelo completo en pesos `safetensors` debería caber en una GPU de consumo con al menos 8 GB de VRAM (por ejemplo, RTX 3070/3080). La inferencia puede requerir memoria adicional para el procesamiento de imágenes 3D.
- GPU recomendadas: RTX 3060, RTX 3080, RTX 4090, A100, H100. Para producción con volumen alto de inferencia, se recomienda una GPU con al menos 16 GB de VRAM.
- Compatibilidad con GPU de consumo: sí, probablemente en GPUs con 8 GB o más de VRAM, aunque el procesamiento de imágenes 3D de alta resolución puede necesitar más memoria.
- Opciones de despliegue: la librería `scalesurfer` en PyPI permite carga del modelo con `ScaleSurferStatsPredictor.from_pretrained()`. Se puede usar en entornos Python con PyTorch. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI (son para modelos de lenguaje, no aplicables).
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de comparativa con modelos equivalentes en la información recopilada. Existen versiones específicas del mismo modelo para FreeSurfer v6 (`rphammonds/scalesurfer-stats-v6`) y v8 (`rphammonds/scalesurfer-v8`), que son variantes del mismo proyecto. Se puede comparar con la herramienta original de FreeSurfer, que es más lenta pero de referencia, y con FastSurferCNN, que ofrece segmentación y predicción de estadísticas, pero no se han publicado comparaciones cuantitativas entre ellos.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|
| ScaleSurfer v567 (este) | no disponible | no aplicable | MAE normalizado 0,15–0,42 | no disponible |
| ScaleSurfer v6 | no disponible | no disponible | no disponible | no disponible |
| ScaleSurfer v8 | no disponible | no disponible | no disponible | no disponible |
| FreeSurfer (original) | no aplicable | no aplicable | referencia estándar | FreeSurfer license |

## Limitaciones y advertencias

- El modelo está destinado únicamente a investigación y no es un dispositivo de diagnóstico clínico. No debe usarse para decisiones médicas sin validación adicional.
- No se ha publicado información sobre sesgos del modelo ni sobre la composición demográfica del conjunto de entrenamiento. Es posible que existan sesgos hacia ciertas poblaciones (por ejemplo, edad, sexo, etnia) que no se han documentado.
- La calidad de las predicciones depende de la calidad de la segmentación `aparc+aseg` de entrada. Si la segmentación es errónea, las estadísticas predichas también lo serán.
- El modelo no está entrenado para manejar imágenes con artefactos importantes, lesiones o variaciones anatómicas extremas; en esos casos, las predicciones pueden ser poco fiables.
- La licencia del modelo no está especificada en el repositorio, lo que genera incertidumbre sobre su uso comercial. Se debe contactar al autor antes de cualquier uso comercial.
- La combinación de versiones de FreeSurfer puede producir diferencias sutiles con los valores exactos de una versión concreta; los usuarios deben validar si el error porcentual es aceptable para su aplicación.
- No se han publicado requisitos exactos de memoria ni de tiempo de inferencia, por lo que el despliegue en producción requiere pruebas preliminares en el entorno objetivo.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/rphammonds/scalesurfer-stats
- Repositorio de HuggingFace de la versión v6: https://huggingface.co/rphammonds/scalesurfer-stats-v6
- Repositorio de HuggingFace de la versión v8: https://huggingface.co/rphammonds/scalesurfer-v8
- Repositorio de código en GitHub: https://github.com/voytekresearch/scalesurfer
- Artículo pre-impresión en bioRxiv: https://www.biorxiv.org/content/10.64898/2026.07.01.735927v1
- Paquete en PyPI: https://pypi.org/project/scalesurfer/
