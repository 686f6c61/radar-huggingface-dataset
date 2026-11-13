# CryoFM-Ano/CryoFM

## Resumen

CryoFM es un modelo fundacional de visión por computador especializado en teledetección de la criosfera, desarrollado por CryoFM-Ano. Se trata de un encoder ViT-B/8 (Vision Transformer con parches de 8x8 píxeles) de 122,5 millones de parámetros, preentrenado mediante un autoencoder enmascarado (MAE) sobre CryoMesh, un corpus de 877.881 recortes de imágenes procedentes de Sentinel-2, Sentinel-1 y el modelo digital de elevaciones Copernicus DEM, todos ellos sobre terreno glaciado.

El modelo resuelve el problema de la falta de representaciones preentrenadas específicas para imágenes de satélite de zonas polares y glaciares, donde los modelos genéricos de teledetección rinden peor por la distribución particular de las cubiertas de hielo y nieve. Su rasgo diferencial es que acepta cualquier subconjunto de diez bandas (seis de Sentinel-2, dos del DEM y dos de Sentinel-1), tratando las bandas ausentes como ausentes y no como ceros, lo que permite usarlo con sensores parciales.

La relevancia actual radica en que se publica junto con Cryo-Bench, un conjunto de seis tareas de segmentación semántica (GSDD, GLID, GLB, SICD, CaFFe y Shelf-Bench) con pesos entrenados tanto con encoder congelado como con ajuste fino completo, bajo licencia Apache-2.0. El repositorio ocupa 4,5 GB e incluye el checkpoint completo de preentrenamiento con el decodificador MAE y los tokenizadores FSQ.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision Transformer ViT-B/8 con autoencoder enmascarado (MAE) |
| Parámetros totales | 122,5 M (encoder) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no de texto) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo visual, sin capacidades lingüísticas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`cryofm_encoder.safetensors`, cabezas de tarea) y PyTorch (`cryofm_pretrain.pt`) |

## Arquitectura y entrenamiento

El encoder es un ViT-B/8, es decir, un transformer de visión con parches de 8x8 píxeles que procesa las diez bandas de entrada de forma independiente respecto a su presencia: las bandas no disponibles se enmascaran como ausentes en lugar de rellenarse con ceros, de modo que el modelo puede operar con subconjuntos arbitrarios del vocabulario de diez bandas. El preentrenamiento sigue el paradigma MAE (masked autoencoding) sobre CryoMesh, un dataset de 877.881 recortes que combina reflectancias de Sentinel-2 L2A en niveles digitales (bandas B2, B3, B4, B8, B11 y B12), pendiente y elevación del Copernicus DEM, y retrodispersión VV y VH de Sentinel-1 GRD en dB.

El checkpoint completo de preentrenamiento (`cryofm_pretrain.pt`) incluye el encoder, el decodificador MAE y tokenizadores FSQ (finite scalar quantization). Para las tareas downstream se emplea una cabeza UPerNet, disponible en dos variantes por tarea: una entrenada sobre el encoder congelado y otra con ajuste fino conjunto del encoder y la cabeza. La normalización es por banda (media cero, desviación típica unitaria), salvo en SICD, que usa estadísticas fijas del dataset definidas en su `config.json`. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición detallada del dataset ni si hubo etapas de RLHF o DPO (no aplicables a un modelo visual).

## Capacidades

- Extracción de características visuales densas para imágenes multiespectrales de satélite, utilizable como backbone para nuevas tareas de segmentación.
- Segmentación semántica de imágenes de teledetección mediante cabezas UPerNet preentrenadas para seis tareas de la criosfera.
- Entrada flexible de bandas: acepta cualquier subconjunto de las diez bandas soportadas (B2, B3, B4, B8, B11, B12 de Sentinel-2; slope y elevation del DEM; VV y VH de Sentinel-1).
- Manejo explícito de bandas ausentes sin relleno con ceros, lo que permite inferencia con sensores incompletos.
- Predicción sobre GeoTIFF mediante la función `predict_geotiff` del paquete `cryofm`.
- No dispone de generación de texto, razonamiento lingüístico, código, matemáticas, tool calling, capacidades de agente ni procesamiento de audio.

## Casos de uso

- Cartografía de glaciares y casquetes: uso del modelo con ajuste fino sobre tareas como GLID o GLB para delimitar contornos de glaciares y lagos glaciares a partir de escenas Sentinel-2, aprovechando que el encoder fue preentrenado sobre terreno glaciado.
- Seguimiento de lagos glaciares: la tarea GLID (con mIoU de 91,43 en la variante con ajuste fino) permite detectar y monitorizar la aparición y evolución de lagos proglaciares, relevantes para evaluación de riesgo de inundaciones GLOF.
- Detección de nieve y hielo marino: la tarea SICD, aunque con mIoU más bajo (31,89 en ajuste fino), está orientada a la clasificación de cubiertas de hielo y nieve, y puede integrarse en pipelines de monitorización estacional.
- Monitorización de calotas y plataformas de hielo: Shelf-Bench (mIoU 87,76 con ajuste fino) permite segmentar plataformas de hielo, útil para estudios de estabilidad y desintegración.
- Detección de grietas y rasgos superficiales: la tarea CaFFe (mIoU 67,07 en ajuste fino) está pensada para rasgos de fisuración, aplicable a evaluación de estabilidad glaciar.
- Extracción de embeddings para nuevas tareas: el encoder congelado (`load_encoder`) puede usarse como extractor de características para entrenar clasificadores ligeros sobre datos propios, reduciendo la necesidad de grandes volúmenes etiquetados.
- Procesamiento de archivos GeoTIFF en producción: la función `predict_geotiff` permite generar mapas de segmentación georreferenciados directamente desde escenas, integrándose en flujos de trabajo de teledetección existentes.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre Cryo-Bench (test mIoU, semilla 234):

| Configuración | GSDD | GLID | GLB | SICD | CaFFe | Shelf-Bench | Media |
|---|---:|---:|---:|---:|---:|---:|---:|
| Encoder congelado | 79,28 | 88,10 | 82,89 | 27,37 | 62,65 | 84,03 | 70,72 |
| Ajuste fino | 79,11 | 91,43 | 84,63 | 31,89 | 67,07 | 87,76 | 73,65 |

No se han publicado en la información disponible comparaciones con otros modelos de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 122,5 M de parámetros en el encoder, la inferencia en fp32 requiere aproximadamente 0,5 GB solo para pesos, más memoria para activaciones y la cabeza UPerNet, que depende de la resolución de la imagen de entrada.
- GPU recomendadas: no especificadas en la información disponible; por tamaño, el modelo es apto para GPUs de consumo, aunque la resolución de las escenas de teledetección puede elevar los requisitos de memoria de activaciones.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del encoder, aunque no se confirma en la documentación.
- Opciones de despliegue: paquete Python `cryofm` con funciones `load_encoder`, `load_task_model` y `predict_geotiff`; pesos en safetensors y PyTorch. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo visual de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone en la información proporcionada de comparaciones con otros modelos fundacionales de teledetección o de la criosfera. No disponible.

## Limitaciones y advertencias

- La independencia de bandas cubre únicamente el vocabulario de diez bandas soportado; otras bandas no tienen embedding y no pueden usarse.
- Un modelo de tarea usado con menos bandas de las que se entrenaron sigue ejecutándose, pero la precisión puede degradarse.
- El rendimiento en SICD es notablemente inferior al resto de tareas (31,89 mIoU con ajuste fino), lo que sugiere dificultades específicas en esa tarea.
- No se documentan sesgos conocidos ni tasas de alucinación (no aplicable en el sentido lingüístico, pero sí posible error de segmentación en clases poco representadas).
- Limitaciones de idioma: no aplica, es un modelo puramente visual.
- La licencia Apache-2.0 permite uso comercial, pero los datos de preentrenamiento contienen datos modificados de Copernicus Sentinel y Copernicus DEM, cuyos términos de atribución deben respetarse.
- El modelo está especializado en terreno glaciado; su uso fuera de la criosfera no está validado.
- Solo 4 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/CryoFM-Ano/CryoFM
- Repositorio GitHub con código, notebooks y descripción completa: mencionado en la model card, URL no disponible en la información proporcionada.
