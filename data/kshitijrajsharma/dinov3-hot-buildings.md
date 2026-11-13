# kshitijrajsharma/dinov3-hot-buildings

## Resumen

DINOv3-HOT-Buildings es un modelo de segmentación semántica binaria especializado en la extracción de huellas de edificios a partir de imágenes aéreas RGB de muy alta resolución (VHR). Lo desarrolla Kshitij Raj Sharma en el contexto de las herramientas de mapeo humanitario de HOTOSM (Humanitarian OpenStreetMap Team), y combina un codificador DINOv3-ViT-L/16 congelado con un decodificador UperNet de la librería terratorch, además de cabezas auxiliares para contornos y distancias firmadas que permiten separar instancias individuales mediante watershed.

El modelo resuelve un problema concreto: la generación automática de máscaras de edificios para proyectos de cartografía humanitaria y de respuesta ante desastres, donde el etiquetado manual de imágenes satelitales o de dron es costoso. Al usar un codificador de propósito general preentrenado (DINOv3) y entrenar solo el decodificador (~43M parámetros), el checkpoint publicado es ligero (~493 MB) y puede reajustarse con muy pocas muestras (~100-200 chips) en la plataforma fAIr de HOTOSM.

Es relevante ahora porque aprovecha la familia DINOv3 (arXiv:2508.10104) como backbone de visión auto-supervisado, y porque se publica bajo la licencia DINOv3 de Meta, con pesos en formato PyTorch Lightning y exportación a ONNX, lo que facilita su integración en pipelines geoespaciales de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ViT-L/16 (DINOv3) congelado + decodificador UperNet (terratorch) con neck piramidal aprendido |
| Parámetros totales | ~300M (encoder) + ~43M entrenables (decoder + pyramid + heads) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión; entrada nativa 256 x 256 píxeles) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (modelo de visión, sin capacidades de texto) |
| Licencia | DINOv3 License (Meta, actualizada 2025-08-19) |
| Formato de pesos | PyTorch Lightning checkpoint (`dinov3l_upernet_hot.ckpt`, ~493 MB); exportación a ONNX |

## Arquitectura y entrenamiento

El modelo sigue un diseño encoder-decoder. El codificador es DINOv3-ViT-L/16 (LVD1689M, ~300M parámetros), congelado durante todo el entrenamiento. Las características intermedias se extraen de los bloques [5, 11, 17, 23] mediante `get_intermediate_layers(norm=True, reshape=True, return_class_token=False)`. El neck es un `LearnedInterpolateToPyramidal` de terratorch basado en ConvTranspose, que genera una pirámide de cuatro niveles. El decodificador es un `UperNetDecoder` con `decoder_channels=512` y `pool_scales=(1, 2, 3, 6)`.

Las cabezas de salida consisten en una convolución 1x1 que produce tres canales: logit de máscara, logit de contorno y distancia firmada (mediante tanh). Existe además una cabeza FCN auxiliar sobre el tap-2 que solo se usa en entrenamiento y se elimina en la exportación a ONNX. La separación de instancias se realiza con watershed a partir de las predicciones de contorno y distancia.

El decodificador se entrenó sobre el dataset `hotosm/vhr-building-segmentation` (~58.000 chips, procedentes de OpenAerialMap y OpenStreetMap, con cobertura global). La normalización de entrada es `mean=[0.4297, 0.4002, 0.3433]` y `std=[0.2056, 0.1674, 0.1599]`. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF/DPO (no aplicables en un modelo de segmentación).

## Capacidades

- Segmentación semántica binaria de huellas de edificios en imágenes aéreas RGB de muy alta resolución.
- Predicción de contornos de edificios (boundary logit) para separar instancias adyacentes.
- Predicción de distancia firmada (signed distance) que, combinada con watershed, permite la separación de instancias individuales.
- Salida multi-tarea: máscara, contorno y distancia firmada en una sola pasada.
- Reajuste (fine-tuning) del decodificador con conjuntos pequeños de etiquetas (~100-200 chips) sobre la plataforma fAIr.
- Exportación a ONNX para despliegue en producción.
- No soporta tool calling, agentes, razonamiento multi-paso, capacidades multilingües ni modalidades de texto, audio o vídeo.

## Casos de uso

- Cartografía humanitaria automatizada: el modelo genera máscaras de edificios a partir de imágenes de OpenAerialMap para proyectos de HOTOSM, reduciendo el trabajo de digitalización manual en zonas afectadas por desastres.
- Respuesta ante catástrofes: ante un terremoto o inundación, se pueden procesar imágenes aéreas recientes y obtener huellas de edificios para estimar daños y planificar la ayuda, gracias a la separación de instancias mediante watershed.
- Actualización de bases de datos OSM: el modelo puede predecir edificios ausentes en OpenStreetMap y servir como capa de sugerencia para validadores humanos.
- Fine-tuning con datos locales: con solo ~100-200 chips etiquetados de una región concreta, se puede reajustar el decodificador en fAIr para adaptar el modelo a la morfología constructiva local (por ejemplo, techos de chapa en zonas rurales).
- Análisis urbanístico y planificación: extracción de huellas para calcular densidad edificatoria, superficie construida o cambios en el tiempo a partir de imágenes VHR.
- Integración en pipelines geoespaciales: la exportación a ONNX permite desplegar el modelo en servicios de inferencia por lotes que procesen teselas de imágenes aéreas junto con herramientas GIS.
- Investigación en teledetección: servir como baseline reproducible para comparar decodificadores sobre el backbone DINOv3 en tareas de segmentación de edificios.

## Benchmarks y rendimiento

| Benchmark | Pixel IoU | Instance F1@0.5 | Vértices medios | Ortogonalidad |
|---|---:|---:|---:|---:|
| HF global test split (7236 teselas) | 0.441 | 0.262 | 4.91 | 0.71 |
| Banepa, Nepal (escena OAM 1536x1536) | 0.656 | 0.407 | 5.99 | 0.63 |

Las estadísticas de forma se calculan en la zona UTM local de cada región tras el paso de regularización DP + MBR-safe de producción. No se dispone de comparaciones con otros modelos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con encoder ViT-L/16 (~300M parámetros) y entrada 256x256, se estima un consumo moderado (del orden de 2-4 GB en FP16), aunque el dato no está confirmado en la documentación.
- GPU recomendadas: no especificadas. Por tamaño del encoder, una GPU consumer moderna (RTX 3090, RTX 4090) debería ser suficiente para inferencia; para entrenamiento del decodificador se recomienda al menos una GPU con 16 GB.
- Cabe en GPU consumer: previsiblemente sí, dado que solo se entrena el decodificador (~43M parámetros) y el encoder está congelado.
- Opciones de despliegue: CLI `dinov3-hot` del repositorio upstream, pipeline `dinov3_buildings` de fAIr-models, exportación a ONNX para inferencia en producción.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos sobre modelos comparables (por ejemplo, otros segmentadores de edificios basados en SAM, Mask R-CNN o arquitecturas específicas de teledetección) con los que establecer una comparación cuantitativa. Los benchmarks publicados solo comparan el modelo consigo mismo en dos conjuntos de evaluación.

## Limitaciones y advertencias

- El checkpoint publicado contiene únicamente el state_dict del decodificador; es necesario descargar el encoder DINOv3-ViT-L/16 desde `kshitijrajsharma/dinov3` para poder usarlo.
- El rendimiento cae notablemente fuera del dominio de entrenamiento: el Pixel IoU global (0.441) es sustancialmente inferior al de la escena local de Banepa (0.656), lo que sugiere sensibilidad a la distribución geográfica y a las condiciones de captura.
- El Instance F1@0.5 es bajo (0.262 en el split global), por lo que la separación de instancias en escenarios densos o heterogéneos puede ser poco fiable.
- Entrada nativa de 256x256 píxeles: las imágenes de mayor resolución deben teselarse, lo que puede introducir artefactos en los bordes de tesela.
- Solo admite imágenes RGB; no se contemplan otras bandas espectrales (NIR, SWIR) ni datos de elevación.
- Licencia DINOv3 de Meta: es necesario revisar los términos (LICENSE.md) antes de un uso comercial; el código de fAIr-models es AGPL-3.0, lo que impone obligaciones de copyleft si se integra en un servicio.
- Riesgo de alucinación en el sentido de falsos positivos o negativos en zonas con techos no convencionales, vegetación densa o sombras intensas; se recomienda validación humana en flujos de producción.
- No se especifican sesgos demográficos o geográficos más allá de la cobertura global declarada del dataset de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kshitijrajsharma/dinov3-hot-buildings
- Encoder DINOv3: https://huggingface.co/kshitijrajsharma/dinov3
- Repositorio fAIr-models: https://github.com/hotosm/fAIr-models
- Pipeline dinov3_buildings: https://github.com/hotosm/fAIr-models/tree/main/models/dinov3_buildings
- STAC item de referencia: https://github.com/hotosm/fAIr-models/blob/develop/models/dinov3s_buildings/stac-item.json
- Paper DINOv3: https://arxiv.org/abs/2508.10104
- Licencia DINOv3: https://huggingface.co/kshitijrajsharma/dinov3-hot-buildings/blob/main/LICENSE.md
