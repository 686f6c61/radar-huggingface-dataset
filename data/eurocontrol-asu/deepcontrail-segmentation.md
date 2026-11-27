# eurocontrol-asu/deepcontrail-segmentation

## Resumen

DeepContrail segmentation es un modelo de segmentación semántica e de instancias diseñado específicamente para detectar estelas de condensación (contrails) en imágenes satelitales. Lo desarrolla el grupo eurocontrol-asu y se publica bajo licencia Apache 2.0. El modelo toma un compuesto de falso color del instrumento ABI del satélite GOES-16 y devuelve, para cada píxel de una escena de 256 × 256, la probabilidad de que corresponda a una estela de condensación. Resuelve un problema de nicho pero relevante para la aviación y el clima: la monitorización automática del impacto atmosférico del tráfico aéreo a partir de datos geoestacionarios.

Técnicamente combina un encoder CAFormer-B36 (preentrenado en ImageNet-22k y afinado en ImageNet-1k a 384 px) con un decoder Unet++ del ecosistema segmentation-models-pytorch, sumando un pequeño stem convolucional para suplir la ausencia de un mapa de características a media resolución en CAFormer. El conjunto suma 102,6 millones de parámetros y se distribuye en formato safetensors con un repositorio de 0,8 GB.

Su relevancia actual radica en que ofrece un pipeline completo y reproducible (entrenamiento, evaluación, segmentación de instancias y conversión de datos desde OpenContrails) empaquetado como librería Python instalable, lo que facilita su integración en flujos de investigación atmosférica sin necesidad de reentrenar desde cero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Unet++ (decoder) + CAFormer-B36 (encoder), con stem convolucional adicional de 2 conv 3×3 de 64 canales |
| Parametros totales | 102.609.975 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de 256 × 256 px, reescalada a 512 px) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de imagen, sin procesamiento de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un segmentador totalmente convolucional con encoder CAFormer-B36 (variante `caformer_b36.sail_in22k_ft_in1k_384` de `timm`) y decoder Unet++. Como CAFormer no produce un mapa de características a la mitad de la resolución de entrada que Unet++ requiere, el constructor de DeepContrail añade un stem convolucional de dos convoluciones 3×3 con 64 canales; cargar los pesos fuera del paquete exige replicar ese stem. La entrada es un compuesto de tres canales en [0, 1] (R: banda 15 − banda 14, G: banda 14 − banda 11, B: banda 14, con rangos de recorte definidos en kelvin), reescalado a 512 px y normalizado con media [0.485, 0.456, 0.406] y desviación [0.229, 0.224, 0.225]. La salida es un mapa de probabilidad de 256 × 256 y el umbral por defecto es 0,5.

El entrenamiento usó la exportación `20250305` de OpenContrails: de 20.088 escenas de entrenamiento se reservó un 10 % (2.009 escenas, semilla 42) para validación, quedando 18.079 escenas efectivas. Las etiquetas son la fracción de anotadores que marcaron cada píxel como estela (etiquetas blandas). La receta consistió en 40 épocas a 512 px, batch 32, precisión mixta bf16, AdamW con tasa 1e-4 y weight decay 1e-2, schedule coseno con 3 épocas de calentamiento y pérdida BCE + 0,2 × Dice. Las aumentaciones incluyen volteos horizontal y vertical independientes, rotaciones de 90° y pequeñas transformaciones de desplazamiento, escala y rotación. Se seleccionó el checkpoint con mejor Dice de validación. En inferencia se recomienda test-time augmentation promediando las 8 combinaciones de volteos y rotaciones.

## Capacidades

- Segmentación semántica por píxel de estelas de condensación en imágenes GOES-16 ABI, con salida de probabilidad en [0, 1] a 256 × 256.
- Segmentación de instancias: separa el mapa de probabilidad en estelas individuales con una máscara y una puntuación por instancia, mediante detección de líneas estilo Mannstein y crecimiento.
- Puntuación aprendida para ordenar las instelas detectadas (`score_model.json`), entrenada sobre las predicciones TTA del propio modelo en 1.000 escenas de validación.
- Soporte de inferencia por lotes con tensores de forma (N, 256, 256, 3).
- Test-time augmentation integrada (8 volteos y rotaciones promediados).
- Exportación de resultados en formato COCO con máscaras RLE mediante `to_coco_results`.
- No soporta tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje; es un modelo puramente visual.

## Casos de uso

- Monitorización climática de la aviación: el modelo procesa escenas GOES-16 de forma continua para cuantificar la cobertura de estelas de condensación sobre regiones de tráfico denso, aportando datos objetivos sobre el forzamiento radiativo de la aviación.
- Verificación de políticas de mitigación: permite comparar la frecuencia de estelas antes y después de cambios en rutas o altitudes, usando el mismo pipeline sobre series temporales de imágenes satelitales.
- Investigación atmosférica reproducible: el paquete `deepcontrail-segmentation` y el conversor de OpenContrails permiten a grupos de investigación reproducir el entrenamiento y la evaluación con el mismo dataset y receta.
- Generación de datasets etiquetados: las predicciones de alta calidad (Dice 0,6974 en test) pueden usarse como pseudoetiquetas para preentrenar o aumentar datasets de estelas en otras regiones o satélites.
- Integración en pipelines operativos de Eurocontrol u organismos similares: la segmentación de instancias con salida COCO facilita el conteo y la caracterización geométrica de estelas individuales para informes operativos.
- Análisis de eventos concretos: dado un identificador de escena, se puede obtener en segundos el mapa de probabilidad y las instancias detectadas, útil para estudios de caso de episodios de formación de estelas.
- Validación cruzada con datos de tráfico aéreo: al disponer de máscaras por instancia con puntuaciones, se pueden correlacionar las estelas detectadas con trayectorias de vuelo registradas.

## Benchmarks y rendimiento

Evaluación sobre el split de test retenido de OpenContrails: 1.879 escenas (shards de validación), nunca usadas en entrenamiento ni en selección de modelo.

| Inferencia | Umbral | Dice de test |
|---|---|---|
| Pasada única | 0,5 | 0,6890 |
| Pasada única | ajustado en validación | 0,6870 |
| Test-time augmentation | 0,5 | 0,6974 |
| Test-time augmentation | ajustado en validación | 0,6937 |

Comparación de arquitecturas con la misma receta (TTA, umbral 0,5): antes de la corrección de aumentaciones (PR #47), dos entrenamientos de Unet++ obtuvieron 0,6992 y 0,6995, y cuatro de UPerNet entre 0,6916 y 0,6960. Con la corrección, este modelo obtuvo 0,6974 y UPerNet 0,6912.

Segmentación de instancias sobre las 1.879 escenas de test, evaluada contra las estelas de cada anotador (2.700 muestras con al menos una estela):

| Métrica | Valor |
|---|---|
| mAP de segmentación COCO (IoU 0,25–0,75) | 0,280 |
| Precisión a IoU 0,5 | 0,532 |
| Recall a IoU 0,5 | 0,387 |
| F1 a IoU 0,5 | 0,448 |
| mAP contra estelas de consenso | 0,435 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 102,6 M parámetros en fp32 los pesos ocupan unos 0,4 GB, por lo que la inferencia en fp32 o bf16 cabe holgadamente en GPUs de consumo.
- GPU recomendadas: no se especifican en la información disponible; por tamaño, cualquier GPU con al menos 4–6 GB de VRAM debería bastar para inferencia por lotes pequeños.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas tipo RTX 3060 en adelante, aunque el dato no está confirmado en la model card.
- Opciones de despliegue: el paquete oficial `deepcontrail-segmentation` (PyPI) con `deepcontrail-core`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepContrail segmentation (este) | 102,6 M | 256 × 256 px (reescalado a 512) | Dice 0,6974 con TTA | Apache 2.0 | Hugging Face, PyPI |
| Unet++ con misma receta (interno) | no disponible | 256 × 256 px | Dice 0,6974 (con corrección) | no disponible | no público |
| UPerNet con misma receta (interno) | no disponible | 256 × 256 px | Dice 0,6912 (con corrección) | no disponible | no público |

No se dispone de información sobre otros modelos públicos comparables de segmentación de estelas en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en estelas de condensación sobre GOES-16 ABI; no es un segmentador genérico ni funciona con otros sensores sin reentrenamiento.
- El rendimiento de instancias es moderado: F1 de 0,448 a IoU 0,5 y mAP de 0,280, lo que limita su uso en aplicaciones que exijan alta precisión por instancia.
- Las etiquetas de entrenamiento son blandas (fracción de anotadores), lo que introduce ambigüedad inherente en los bordes y en estelas tenues.
- El entrenamiento en GPU no es reproducible bit a bit, según advierte la propia model card, lo que dificulta comparaciones exactas entre ejecuciones.
- La configuración de instancias y el modelo de puntuación se eligieron solo sobre escenas de validación; su generalización a otras regiones o estaciones no está documentada.
- No hay información sobre sesgos geográficos o estacionales del dataset OpenContrails, aunque al derivarse de una exportación concreta es probable que refleje la distribución de esa muestra.
- Riesgo de alucinación en sentido figurado: falsos positivos en píxeles con texturas similares (nubes finas, cirros) no cuantificado en la documentación.
- Licencia Apache 2.0 permite uso comercial, pero no se ofrece garantía ni soporte; el modelo se publica como artefacto de investigación (v0.1.0).
- El uso fuera del paquete DeepContrail requiere replicar el stem convolucional adicional, lo que añade fricción a la integración.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eurocontrol-asu/deepcontrail-segmentation
- Repositorio DeepContrail: https://github.com/eurocontrol-asu/deepcontrail
- Configuración del experimento: https://github.com/eurocontrol-asu/deepcontrail/blob/v0.1.0/packages/segmentation/configs/experiment.yaml
- Conversor OpenContrails: https://github.com/eurocontrol-asu/deepcontrail/tree/v0.1.0/tools/opencontrails
- Paquete de instancias: https://github.com/eurocontrol-asu/deepcontrail/tree/v0.3.0/packages/instance
- Dataset OpenContrails: https://sites.research.google/gr/contrails/public-datasets/
