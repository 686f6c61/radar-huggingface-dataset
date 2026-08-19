# geotessera/TESSERA-V-2.0-2B-N

## Resumen

TESSERA v2 Nano (TESSERA-V-2.0-2B-N) es un codificador geoespacial compacto por píxel, desarrollado por el grupo ucam-eo de la Universidad de Cambridge, que procesa series temporales anuales de observaciones Sentinel-2 (multiespectral) y Sentinel-1 (SAR). Con solo 1,07 millones de parámetros, es un estudiante destilado del modelo profesor TESSERA v2 de 2 060 millones de parámetros, diseñado para ser desplegable a escala de tesela o global. Emite un embedding de 128 dimensiones con propiedad Matryoshka: los primeros K componentes (K ∈ {16, 32, 64, 128}) son utilizables de forma independiente sin reentrenamiento, lo que permite intercambiar almacenamiento por precisión según la aplicación.

El modelo resuelve el problema de representar la historia temporal completa de un píxel (todas las observaciones válidas de un año) en un vector denso y compacto, útil para tareas posteriores de clasificación, regresión o segmentación. Su relevancia actual radica en que los modelos de fundación geoespaciales suelen ser demasiado grandes para procesamiento masivo; este estudiante ofrece una alternativa práctica con licencia CC0 (dominio público), lo que facilita su adopción en investigación y producción. La arquitectura combina dos backbones por modalidad (uno para Sentinel-2 y otro para Sentinel-1 fusionado) con un transformer encoder de 2 capas y pooling temporal por atención.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos backbones por modalidad (Sentinel-2 y Sentinel-1 fusionado), cada uno con MLP de embedding de banda + codificación posicional sinusoidal de día del año, transformer encoder post-LN de 2 capas (d_model=144, 4 cabezas, FFN=384, ReLU) y pooling temporal por atención softmax de una cabeza; fusión por concatenación y MLP reductor de dimensiones con LayerNorm no afín que produce salida de 128-d |
| Parametros totales | 1 066 402 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Contexto temporal anual: todas las observaciones válidas por píxel, con el número de observaciones agrupado en bins de 8, 16, ..., 256 |
| Tipos de cuantizacion | No se especifican cuantizaciones nativas; el modelo soporta compresión int8 lineal mediante el script `quantize.py` incluido, que guarda un array int8 más una escala flotante por píxel |
| Idiomas soportados | Inglés (etiqueta `en`), aunque el modelo procesa datos numéricos de satélite, no texto |
| Licencia | CC0 1.0 (dominio público) |
| Formato de pesos | PyTorch (no se especifica si safetensors; el repositorio indica `pytorch` y tamaño 0.0 GB, probablemente placeholder) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de dos ramas: una para Sentinel-2 L2A (multiespectral) y otra para Sentinel-1 RTC (SAR), donde las observaciones ascendentes y descendentes se fusionan tras una normalización z-score con estadísticas propias por fuente. Cada rama aplica un MLP de embedding de banda, una codificación posicional sinusoidal basada en el día del año, un transformer encoder de 2 capas con post-LayerNorm y una cabeza de atención softmax para agregar temporalmente las observaciones. Las salidas de ambas ramas se concatenan y pasan por un MLP reductor que termina en una LayerNorm no afín, produciendo un embedding de 128 dimensiones con escala fija (scale-locked). QK-norm está desactivado.

El entrenamiento se realiza mediante destilación Matryoshka desde el profesor TESSERA v2 2B (1024-d). Para cada longitud de prefijo K ∈ {16, 32, 64, 128}, una cabeza lineal separada reconstruye el embedding completo del profesor a partir de las primeras K coordenadas del estudiante. Este objetivo impone un orden en las coordenadas del estudiante, algo que la auto-supervisión pura (como Barlow Twins) no puede lograr porque identifica subespacios solo hasta una rotación. Las cabezas de proyección se descartan en inferencia; el checkpoint contiene únicamente el codificador. El modelo fue entrenado con datos de Sentinel-1 y Sentinel-2, pero no se especifican el número total de tokens ni la composición exacta del dataset en la información disponible.

## Capacidades

- Generación de embeddings por píxel a partir de series temporales anuales de Sentinel-2 y Sentinel-1, representando la firma espectral-temporal de cada ubicación.
- Embeddings Matryoshka: truncación a 16, 32, 64 o 128 dimensiones sin reentrenamiento, permitiendo ajustar el equilibrio entre almacenamiento y precisión.
- Fusión multimodal: combina información óptica (multiespectral) y de radar (SAR) en una única representación.
- Compresión int8 lineal mediante el script `quantize.py`, que reduce el almacenamiento manteniendo una reconstrucción aproximada con escala por píxel.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso; es exclusivamente un extractor de características para datos geoespaciales.
- Capacidad multilingüe no aplica; la etiqueta `en` se refiere a la documentación, no a la entrada del modelo.

## Casos de uso

- Monitorización ambiental: usar los embeddings para clasificar coberturas del suelo o detectar cambios anuales en ecosistemas, aprovechando la fusión de Sentinel-1 y Sentinel-2 para robustez ante nubes.
- Estimación de biomasa y carbono: los embeddings de 128-d pueden alimentar regresores para predecir biomasa aérea, dado que capturan la dinámica fenológica anual completa.
- Cartografía de hábitats y conservación: generar mapas de hábitats a escala regional con resolución de 10 m, usando la truncación a 16-d para reducir costes de almacenamiento en grandes extensiones.
- Agricultura y seguridad alimentaria: clasificar cultivos y estimar rendimientos a partir de la firma temporal, útil para sistemas de alerta temprana en regiones con datos limitados.
- Investigación climática: los embeddings sirven como características de entrada para modelos de cambio de uso del suelo o para análisis de tendencias multianuales.
- Análisis de series temporales con datos escasos: al agrupar el número de observaciones en bins, el modelo maneja píxeles con pocas imágenes válidas, adecuado para zonas con alta nubosidad o fallos de adquisición.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este checkpoint específico. La model card indica que las puntuaciones reportadas en el preprint TESSERA v2 se midieron en estudiantes destilados del profesor de 1B, no en estos checkpoints, y que los números para los estudiantes destilados del 2B se publicarán por separado. Por tanto, no hay datos comparativos disponibles.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 1,07 M parámetros, la inferencia en fp32 requiere aproximadamente 4 MB de memoria para los pesos, más la activación de la serie temporal (depende del número de observaciones). Es despreciable frente a cualquier GPU moderna.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; incluso CPU es viable para procesamiento por lotes pequeños.
- Cabe en GPUs de consumo: sí, cualquier RTX serie 20 o superior, e incluso en hardware integrado.
- Opciones de despliegue: al ser un modelo PyTorch estándar, puede servirse con TorchServe, ONNX Runtime (si se exporta), o integrarse en pipelines de procesamiento geoespacial como rasterio o xarray. No es un LLM, por lo que vLLM, llama.cpp u Ollama no son aplicables.
- Latencia y throughput: no se proporcionan datos oficiales; dado el tamaño, se espera un throughput muy alto (miles de píxeles por segundo en GPU).

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (codificadores geoespaciales por píxel compactos) dentro de la información proporcionada. El modelo se puede comparar con su profesor, el TESSERA v2 2B:

| Modelo | Parametros | Dimension embedding | Contexto | Licencia |
|---|---|---|---|---|
| TESSERA-V-2.0-2B-N (estudiante) | 1,07 M | 128-d (Matryoshka) | Anual, multi-fecha | CC0 |
| TESSERA-V-2.0-2B-Teacher | 2 064 266 242 | 1024-d | Anual, multi-fecha | CC0 (presumiblemente) |

El estudiante sacrifica dimensionalidad y precisión (aún no cuantificada) a cambio de una reducción de parámetros de ~2000x, lo que lo hace adecuado para despliegue masivo.

## Limitaciones y advertencias

- Los embeddings representan la firma espectral-temporal anual, no imágenes brutas ni datos en tiempo real; no son adecuados para monitorización en tiempo real.
- La precisión puede degradarse en regiones o años con muy pocas observaciones válidas; se recomienda validar el rendimiento en la geografía y tarea específicas.
- El orden de canales de entrada de Sentinel-2 NO es el orden convencional ascendente por longitud de onda; es imprescindible consultar la sección "Input contract" de la documentación antes de usar el modelo.
- Los benchmarks del preprint no se aplican a este checkpoint; los resultados para los estudiantes destilados del 2B se publicarán por separado, por lo que no hay garantía de rendimiento cuantitativo actualmente.
- La normalización de Sentinel-1 difiere entre el estudiante (z-score por fuente antes de fusionar) y el profesor (estadísticas agrupadas); no se deben mezclar datos normalizados de un modelo al otro.
- Aunque la licencia CC0 permite uso comercial sin restricciones, el modelo se ofrece "tal cual" sin garantías; los usuarios deben validar su idoneidad para aplicaciones críticas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/geotessera/TESSERA-V-2.0-2B-N
- Modelo profesor: https://huggingface.co/geotessera/TESSERA-V-2.0-2B-Teacher
- Preprint (arXiv): https://arxiv.org/abs/2607.03949
