# geotessera/TESSERA-V-2.0-2B-M

## Resumen

TESSERA v2 Medium (21,03 millones de parámetros) es un codificador geoespacial compacto a nivel de píxel desarrollado por la Universidad de Cambridge (ucam-eo). Procesa series temporales anuales de observaciones de los satélites Sentinel-2 (multiespectral) y Sentinel-1 (SAR) y produce un embedding de 128 dimensiones con propiedad Matryoshka: los primeros K coordenadas (K ∈ {16, 32, 64, 128}) son utilizables de forma independiente, permitiendo ajustar el equilibrio entre almacenamiento y precisión sin reentrenar. Este modelo es el resultado de destilar el teacher TESSERA v2 de 2 060 millones de parámetros, que resulta impracticable para despliegue a escala global.

El modelo resuelve el problema de representar la historia temporal de cada píxel en una representación compacta y multiespectral, facilitando tareas posteriores de clasificación, regresión o segmentación en aplicaciones de observación de la Tierra. Su relevancia radica en ofrecer un encoder de alta capacidad pero con un coste computacional y de almacenamiento muy reducido (21 M de parámetros, 0,1 GB), lo que lo hace viable para procesamiento de grandes extensiones geográficas en entornos con recursos limitados. La arquitectura combina dos backbones por modalidad (Sentinel-2 y Sentinel-1 fusionado), cada uno con un Transformer encoder de 4 capas, y una fusión por concatenación que termina en una capa de normalización no afín que fija la escala de salida.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos backbones por modalidad (Sentinel-2 y Sentinel-1 fusionado): MLP band embedding + codificación posicional sinusoidal (día del año), Transformer encoder post-LN de 4 capas (d_model=440, 4 cabezas, FFN=1792, ReLU), pooling por atención softmax de una cabeza sobre el tiempo, fusión por concatenación y MLP dim_reducer con LayerNorm no afín |
| Parametros totales | 21 031 506 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | Serie temporal anual, con número de observaciones bucketizado a {8, 16, ..., 256} |
| Tipos de cuantizacion | No disponible (el modelo se distribuye en fp32; se proporciona un script para cuantizar los embeddings a int8, no los pesos del modelo) |
| Idiomas soportados | No aplica (modelo de visión por computador; la documentación está en inglés) |
| Licencia | CC0-1.0 (dominio público) |
| Formato de pesos | PyTorch (no se especifica si safetensors o bin; tamaño del repo 0,1 GB) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de dos ramas independientes que procesan por separado las series temporales de Sentinel-2 y Sentinel-1. Cada rama comienza con un MLP que proyecta las bandas espectrales, añade una codificación posicional sinusoidal basada en el día del año y pasa por un Transformer encoder de 4 capas con normalización posterior a cada subcapa (post-LN), 4 cabezas de atención y una red feed-forward de 1792 unidades con activación ReLU. Tras el encoder, un mecanismo de pooling por atención con una sola cabeza agrega las observaciones temporales en un vector único. Las dos representaciones (óptica y SAR) se concatenan y se pasan por un MLP reductor de dimensiones que culmina en una capa LayerNorm no afín, produciendo un embedding de 128 dimensiones con escala fija.

El entrenamiento se realiza mediante destilación desde el teacher TESSERA v2 de 2 060 millones de parámetros. Se emplea un objetivo Matryoshka: para cada prefijo de longitud K (16, 32, 64, 128), una cabeza lineal independiente reconstruye el embedding completo del teacher congelado a partir de los primeros K coordenadas del estudiante. Esto impone un orden en las coordenadas del estudiante, algo que la auto-supervisión pura (como Barlow Twins) no puede lograr porque identifica subespacios solo hasta una rotación. Las cabezas de proyección se descartan durante la inferencia, quedando únicamente el encoder. Los datos de entrenamiento consisten en series temporales anuales de Sentinel-2 L2A y Sentinel-1 RTC (retrodispersión en terreno corregida), con normalización z-score por fuente para Sentinel-1 antes de fusionar ascendente y descendente.

## Capacidades

- Extracción de embeddings de píxel a partir de series temporales anuales de Sentinel-2 y Sentinel-1, con fusión multimodal (óptico + SAR).
- Representación compacta de 128 dimensiones con propiedad Matryoshka: truncamiento a 16, 32 o 64 dimensiones sin reentrenamiento ni checkpoints adicionales.
- Soporte para múltiples fechas (multi-date) dentro de un contexto temporal anual, con bucketización del número de observaciones.
- Salida con escala fija gracias a la LayerNorm no afín, lo que facilita su uso en métricas de similitud (coseno, producto escalar).
- No es un modelo generativo: no produce texto, código ni imágenes; su salida es exclusivamente un vector de características.
- Compatible con tareas posteriores de clasificación, regresión o segmentación a nivel de píxel mediante cabezas simples (lineales o MLP ligeros).

## Casos de uso

- Monitoreo ambiental: extraer embeddings por píxel de grandes regiones para detectar cambios en la cobertura del suelo (deforestación, urbanización) comparando representaciones de distintos años.
- Mapeo de hábitats: usar los embeddings como entrada a un clasificador supervisado para cartografiar tipos de vegetación o ecosistemas, aprovechando la fusión de información óptica y SAR.
- Estimación de biomasa y carbono: combinar los embeddings con datos de campo (parcelas de inventario forestal) para entrenar regresores que estimen biomasa aérea o contenido de carbono.
- Monitoreo agrícola: identificar tipos de cultivo y su estado fenológico a partir de la dinámica temporal anual capturada por el modelo, útil para seguros agrarios o planificación de riego.
- Seguridad alimentaria: analizar series temporales de cultivos en regiones vulnerables para predecir rendimientos o detectar estrés hídrico, integrando la información SAR que penetra nubes.
- Investigación climática: generar representaciones de píxel a escala global para estudiar cambios en la superficie terrestre (desertificación, retroceso de humedales) con una huella computacional reducida.
- Planificación de uso sostenible del suelo: alimentar modelos de zonificación o evaluación de impacto ambiental con embeddings que resumen la historia anual de cada parcela.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este checkpoint específico en la información disponible. La model card indica que los puntajes reportados en el preprint de TESSERA v2 se midieron en estudiantes destilados del teacher de 1B, no en estos checkpoints destilados del teacher de 2B. Los números para los estudiantes destilados del teacher de 2B se publicarán por separado.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 21 M de parámetros. En fp32 (4 bytes por parámetro) ocupa aproximadamente 84 MB. La inferencia por píxel es muy ligera, y el procesamiento por lotes de parches puede hacerse con menos de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna con al menos 1 GB de VRAM (por ejemplo, NVIDIA GTX 1050, RTX 2050, o incluso GPUs integradas). También es viable en CPU para volúmenes moderados.
- Compatibilidad con consumer GPU: sí, totalmente; incluso en sistemas sin GPU dedicada se puede ejecutar en CPU con tiempos razonables para áreas pequeñas.
- Opciones de despliegue: al ser un modelo PyTorch estándar, puede integrarse en pipelines de Python con torch, o exportarse a ONNX para inferencia optimizada. No se mencionan integraciones específicas con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles en la información proporcionada, pero dado el tamaño reducido, se espera un throughput alto (miles de píxeles por segundo en GPU).

## Comparativa con modelos similares

No se dispone de datos comparativos en la información proporcionada. Modelos alternativos en el dominio de embeddings geoespaciales incluyen Prithvi (IBM/NASA) y Clay (Clay AI), pero no se conocen sus parámetros, rendimiento o licencia en esta fuente. Se recomienda consultar la literatura específica para una comparación rigurosa.

## Limitaciones y advertencias

- Los embeddings representan información espectral-temporal anual a 10 metros de resolución; no son imágenes brutas ni datos de monitoreo en tiempo real.
- La precisión puede degradarse en regiones o años con muy pocas observaciones válidas (por ejemplo, alta cobertura nubosa persistente). Se debe validar el rendimiento para cada tarea y geografía.
- El orden de los canales de entrada de Sentinel-2 no es el convencional (ascendente por longitud de onda). Es imprescindible seguir el contrato de entrada especificado en la model card para evitar errores.
- Los benchmarks reportados en el preprint de TESSERA v2 no corresponden a este checkpoint; los resultados para los estudiantes destilados del teacher de 2B se publicarán en el futuro.
- El modelo está entrenado para un contexto temporal anual; no soporta series temporales de duración arbitraria sin adaptación.
- Licencia CC0: el modelo es de dominio público, pero los datos de entrenamiento (Sentinel-1/2) tienen sus propias políticas de uso; se debe verificar la conformidad con las licencias de los datos de origen.
- Al ser un modelo de extracción de características, no genera explicaciones ni texto; su uso requiere cabezas posteriores entrenadas para cada tarea específica.

## Enlaces

- [HuggingFace - TESSERA-V-2.0-2B-M](https://huggingface.co/geotessera/TESSERA-V-2.0-2B-M)
- [Teacher TESSERA v2 2B](https://huggingface.co/geotessera/TESSERA-V-2.0-2B-Teacher)
- [Preprint TESSERA v2 (arXiv)](https://arxiv.org/abs/2607.03949)
