# jdlaurencechasen/phacosight

## Resumen

PhacoSight es un sistema de análisis de vídeo de cirugía de cataratas desarrollado por jdlaurencechasen, orientado a la formación de médicos residentes mediante revisión postoperatoria de intervenciones grabadas. Este repositorio en HuggingFace contiene los checkpoints de despliegue del sistema, que combina dos modelos SegFormer-B2 para segmentación semántica (anatomía e instrumentos quirúrgicos) y un ensemble de doce modelos MS-TCN++ para reconocimiento de fases quirúrgicas. El pipeline consume vídeo de microscopio a 1024x768 píxeles y características extraídas con DINOv2 con registros, procesando a 1 fps. Su relevancia reside en ser una solución de código abierto con licencia Apache-2.0 para un dominio médico muy específico, con datos de entrenamiento provenientes del conjunto Cataract-1K, y en su diseño explícito para uso educativo, no clínico.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SegFormer-B2 (segmentación) + MS-TCN++ (reconocimiento de fases) + DINOv2-large (extracción de características) |
| Parametros totales | no disponible (repo de 0.3 GB en formato .pt) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (procesamiento de vídeo a 1 fps) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de visión, no de texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (.pt) |

## Arquitectura y entrenamiento

El sistema se compone de dos ramas diferenciadas. La primera es una segmentación semántica basada en SegFormer-B2, con dos variantes: una de 5 clases para anatomía e instrumentos combinados, y otra de 7 clases para segmentación multiclase de instrumentos. Ambos modelos se ajustaron finamente desde los pesos preentrenados en ImageNet de `nvidia/mit-b2`. La segunda rama es un ensemble de doce modelos MS-TCN++ (tres semillas por cuatro pliegues) que consumen características de DINOv2 con registros (`facebook/dinov2-with-registers-large`, Apache-2.0) junto con características de herramientas, para predecir la fase quirúrgica en curso. Los datos de entrenamiento provienen del conjunto Cataract-1K (CC BY 4.0), con vídeo de microscopio de un único centro quirúrgico a 1024x768 píxeles. No se mencionan técnicas como RLHF o DPO, al tratarse de un modelo de visión por computador supervisado.

## Capacidades

- Segmentación semántica de anatomía e instrumentos quirúrgicos en vídeo de cirugía de cataratas, con dos variantes: 5 clases (anatomía + instrumentos) y 7 clases (instrumentos multiclase).
- Reconocimiento de fases quirúrgicas mediante ensemble de 12 modelos MS-FCN++, lo que permite clasificar el progreso de la operación en fases discretas.
- Extracción de características de herramientas (tool-fusion features) que se integran tanto en la segmentación como en el reconocimiento de fases.
- Procesamiento de vídeo a 1 fps, suficiente para revisión post-hoc.
- Capacidad de generar superposiciones de interfaz de usuario (UI overlays) para visualización educativa.
- No es un modelo multimodal en el sentido de texto-imagen; su entrada es exclusivamente vídeo.

## Casos de uso

- Revisión educativa de cirugías grabadas: el sistema permite a residentes y tutores analizar intervenciones de cataratas registradas, identificando las fases quirúrgicas y la posición de instrumentos para discutir errores o mejoras.
- Evaluación de competencias quirúrgicas: los registros de fases y segmentaciones pueden usarse para generar métricas objetivas de progreso del residente (tiempo por fase, uso de instrumentos) en un entorno de formación.
- Investigación en oftalmología: el modelo sirve como base para estudios retrospectivos sobre técnicas quirúrgicas, correlacionando fases con resultados clínicos en bases de datos de vídeos.
- Anotación asistida de vídeos médicos: las predicciones de segmentación y fase pueden pre-anotar grandes volúmenes de vídeo para construir nuevos datasets de entrenamiento, reduciendo el coste de anotación manual.
- Herramienta de docencia interactiva: integrada en una aplicación web (PhacoSight), permite al instructor navegar por las fases de una operación y resaltar estructuras anatómicas e instrumentos en tiempo real durante la revisión.
- Benchmark de modelos de visión médica: al estar publicado con licencia Apache-2.0 y datos de entrenamiento CC BY 4.0, sirve como punto de referencia para comparar otros sistemas de análisis de vídeo quirúrgico en el dominio de la cataratas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas (mIoU, precisión de fases, etc.) para los checkpoints desplegados.

## Requisitos de hardware

- Repo de 0.3 GB en total, lo que indica que los checkpoints individuales son ligeros. El modelo de segmentación SegFormer-B2 tiene aproximadamente 24 millones de parámetros, y el ensemble de 12 MS-TCN++ añade un coste moderado.
- La inferencia de segmentación puede ejecutarse en GPU de consumo con 6-8 GB de VRAM (p. ej., RTX 3060 o superior), aunque no se proporciona una cifra oficial de VRAM.
- El modelo de fases consume características de DINOv2-large (alrededor de 300 millones de parámetros), que se descargan por separado en tiempo de ejecución; esto puede elevar los requisitos de memoria a unos 8-12 GB de VRAM dependiendo del tamaño de lote.
- Despliegue recomendado: el propio repositorio de PhacoSight incluye una aplicación web (Gradio) y un script de descarga de pesos con verificación de checksums. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, al ser un modelo de visión y no de lenguaje.
- Latencia y throughput: no se proporcionan datos oficiales. A 1 fps de procesamiento, el sistema está diseñado para análisis en lote o revisión post-hoc, no para tiempo real intraoperatorio.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa cuantitativa con otros modelos de análisis de vídeo quirúrgico en el mismo repositorio. Alternativas generales en el dominio incluyen:

| Modelo | Enfoque | Datos | Licencia |
|---|---|---|---|
| PhacoSight (este) | Segmentación + fases en cataratas | Cataract-1K | Apache-2.0 |
| Modelos de segmentación de instrumentos genéricos (p. ej., fine-tuning de SegFormer o UNet sobre datasets quirúrgicos) | Segmentación de instrumentos | Datasets variados (p. ej., MICCAI) | Variable |
| Modelos de reconocimiento de fases basados en LSTM/TCN sobre features de vídeo | Clasificación temporal de fases | Datasets propios | Variable |

No se dispone de datos de rendimiento comparables en la información disponible.

## Limitaciones y advertencias

- No es un dispositivo médico: el modelo está diseñado exclusivamente para investigación y educación quirúrgica (revisión post-hoc de vídeos grabados), y no debe usarse para decisiones clínicas intraoperatorias.
- Dominio limitado: entrenado con vídeo de microscopio de un único centro a 1024x768 píxeles, por lo que es esperable degradación del rendimiento (domain shift) con equipos de otros hospitales o resoluciones distintas.
- Los pesos de segmentación provienen de `nvidia/mit-b2`, cuyos pesos preentrenados en ImageNet se distribuyen para uso de investigación no comercial. Aunque el repositorio declara licencia Apache-2.0, el uso comercial puede estar restringido por los términos de NVIDIA.
- El modelo de fases depende de DINOv2-large (Apache-2.0), que se descarga por separado; la reproducibilidad del sistema requiere verificar las sumas de control (checksums) del manifiesto de pesos.
- Riesgo de alucinación o errores de segmentación en vídeos con condiciones atípicas (iluminación, sangrado, variaciones anatómicas) que no estén representadas en los datos de entrenamiento.
- No se proporcionan métricas de rendimiento oficiales, por lo que no es posible evaluar la fiabilidad cuantitativa del sistema antes de su uso.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/jdlaurencechasen/phacosight
- Repositorio GitHub del proyecto: https://github.com/jdlaurence/phacosight
- Documento del dataset Cataract-1K: https://arxiv.org/pdf/2312.06295.pdf
- Aplicación web (dentro del repo): https://github.com/jdlaurence/phacosight/tree/main/app
