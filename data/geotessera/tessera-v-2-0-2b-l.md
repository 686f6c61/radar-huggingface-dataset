# geotessera/TESSERA-V-2.0-2B-L

## Resumen

TESSERA-V-2.0-2B-L es un encoder geospacial por píxel desarrollado por el grupo ucam-eo de la Universidad de Cambridge, diseñado para procesar series temporales anuales de observaciones satelitales Sentinel-2 (multiespectral) y Sentinel-1 (SAR). Con solo 43,83 millones de parámetros, es un modelo "student" destilado de un teacher de 2.064 millones de parámetros (TESSERA v2 2B) mediante una técnica de destilación Matryoshka. El modelo emite un embedding de 128 dimensiones por píxel, con la propiedad de que los primeros K componentes (para K ∈ {16, 32, 64, 128}) son utilizables de forma independiente, permitiendo truncar la representación sin reentrenar y ahorrar almacenamiento.

Este modelo resuelve el problema de la inferencia a escala global con modelos de fundación geospaciales: el teacher de 2B parámetros es computacionalmente inviable para procesar mosaicos completos de imágenes satelitales, mientras que este student compacto puede desplegarse en hardware convencional. Su relevancia actual radica en la creciente demanda de representaciones de píxel densas y multi-temporales para aplicaciones de monitorización ambiental, agricultura y cambio climático, donde la eficiencia computacional es crítica. La arquitectura combina dos backbones por modalidad (uno para Sentinel-2 y otro para Sentinel-1 fusionado), cada uno con un MLP de embedding, codificación posicional sinusoidal del día del año, un Transformer encoder de 4 capas y atención pooling temporal, seguido de un módulo de reducción de dimensionalidad con normalización no afín.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (post-LN) con dos backbones por modalidad (Sentinel-2 y Sentinel-1 fusionado), MLP de embedding, atención pooling temporal y reducción de dimensionalidad final |
| Parametros totales | 43.831.170 (43,83 M) |
| Parametros activos | no disponible (no es un modelo MoE; todos los parámetros están activos) |
| Longitud de contexto | Temporal: hasta 256 observaciones válidas por píxel (bucketizado en bins de 8, 16, ..., 256); no hay contexto espacial (patch_size=1) |
| Tipos de cuantizacion | Soporte nativo para truncación Matryoshka (16/32/64/128 dims) y cuantización lineal int8 mediante script `quantize.py` incluido |
| Idiomas soportados | No aplica (modelo de visión por píxel); la documentación está en inglés |
| Licencia | CC0-1.0 (dominio público) |
| Formato de pesos | PyTorch (librería `pytorch`); no se especifica si es safetensors o binario |

## Arquitectura y entrenamiento

La arquitectura del modelo consta de dos backbones independientes: uno para Sentinel-2 (multiespectral) y otro para Sentinel-1 (SAR, con las pasadas ascendente y descendente fusionadas tras una normalización z-score con estadísticas propias por fuente). Cada backbone aplica un MLP de embedding de banda, una codificación posicional sinusoidal basada en el día del año, un Transformer encoder de 4 capas con post-normalización (d_model=640, 4 cabezas, FFN=2560 con activación ReLU, QK-norm desactivada) y una atención pooling de cabeza única sobre el eje temporal. Las salidas de ambos backbones se concatenan y pasan por un MLP `dim_reducer` que termina en una LayerNorm no afín, produciendo un embedding de 128 dimensiones con escala fija.

El entrenamiento se realizó mediante destilación del teacher TESSERA v2 2B (que produce embeddings de 1024 dimensiones). La técnica de destilación Matryoshka utiliza cabezas lineales separadas para cada prefijo de longitud K ∈ {16, 32, 64, 128}, cada una reconstruyendo el embedding completo del teacher congelado a partir de los primeros K componentes del student. Esto impone un orden en las coordenadas del student, algo que la auto-supervisión pura (como Barlow Twins) no puede lograr porque identifica subespacios solo hasta una rotación. Las cabezas de proyección se descartan en inferencia. El modelo se entrenó con observaciones anuales multi-fecha de Sentinel-1 y Sentinel-2; el número total de tokens o la composición exacta del dataset no se especifica en la información disponible.

## Capacidades

- Generación de embeddings por píxel de 128 dimensiones a partir de series temporales anuales de Sentinel-2 y Sentinel-1.
- Soporte de truncación Matryoshka: los primeros 16, 32 o 64 componentes son utilizables sin reentrenamiento, permitiendo reducir el almacenamiento hasta 8 veces.
- Compresión adicional mediante cuantización lineal int8 (con escala por píxel) usando el script `quantize.py` incluido.
- Procesamiento multi-modal: combina información espectral (Sentinel-2 L2A) y de radar de apertura sintética (Sentinel-1 RTC) en una única representación.
- Contexto temporal anual: utiliza todas las observaciones válidas por píxel, con bucketización del número de observaciones en bins de 8 a 256.
- No soporta tool calling, agentes ni razonamiento multi-paso; es un encoder puro de características para tareas de visión geospacial.

## Casos de uso

- Monitorización ambiental a gran escala: el modelo puede generar embeddings densos por píxel para regiones enteras, permitiendo detectar cambios en cobertura vegetal o degradación del suelo con una fracción del coste computacional del teacher de 2B.
- Cartografía de hábitats y conservación: las representaciones multi-temporales de 128 dimensiones (o truncadas a 32) pueden alimentar clasificadores ligeros para mapear tipos de ecosistemas en áreas extensas, aprovechando la información SAR que penetra nubes.
- Estimación de biomasa y carbono: los embeddings de píxel pueden usarse como entrada a modelos de regresión para estimar biomasa aérea o contenido de carbono, beneficiándose de la combinación de señales ópticas y de radar.
- Agricultura de precisión y monitorización de cultivos: las series temporales anuales permiten distinguir tipos de cultivo y estados fenológicos; el modelo puede procesar parcelas completas con bajo coste de memoria.
- Seguridad alimentaria: al combinar datos de Sentinel-2 y Sentinel-1, el modelo puede apoyar sistemas de alerta temprana de estrés de cultivos o sequías, incluso en regiones con alta nubosidad donde el SAR es esencial.
- Investigación climática: las representaciones compactas pueden integrarse en pipelines de análisis de cambio de uso del suelo o dinámica de ecosistemas, con la ventaja de la licencia CC0 que permite uso libre en proyectos académicos y comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este checkpoint específico. La model card indica que las puntuaciones reportadas en el preprint de TESSERA v2 se midieron en estudiantes destilados del teacher de 1B, no de estos checkpoints de 2B, y que los números para los estudiantes destilados del 2B se publicarán por separado. Por tanto, no hay datos de MMLU, HumanEval u otros benchmarks comparables, ya que este modelo no es un LLM sino un encoder de visión.

## Requisitos de hardware

- El modelo tiene 43,83 millones de parámetros, lo que en fp32 ocupa aproximadamente 175 MB. Con cuantización int8, el tamaño se reduce a unos 44 MB.
- VRAM estimada para inferencia: menos de 1 GB en fp32 para un lote de píxeles individuales. Para procesar un mosaico de, por ejemplo, 1000×1000 píxeles, la memoria dependerá del número de observaciones temporales por píxel (hasta 256), pero el modelo en sí es muy ligero.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (p. ej., NVIDIA GTX 1650, RTX 3050) es suficiente para inferencia por lotes. Para procesamiento masivo, una RTX 4090 o A100 permitiría paralelizar muchos píxeles simultáneamente.
- Al ser un modelo PyTorch estándar, puede desplegarse con cualquier framework de inferencia que soporte PyTorch, aunque no se mencionan opciones específicas como vLLM u Ollama (no aplicable por ser un modelo de visión). Se puede usar con TorchServe, ONNX Runtime o directamente en scripts Python.
- Latencia y throughput: no se proporcionan datos oficiales; dado el tamaño y la arquitectura (4 capas Transformer con d_model=640), se espera una latencia de milisegundos por píxel en GPU moderna, pero depende del número de observaciones temporales.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos geospaciales en la documentación proporcionada. Modelos como Prithvi (IBM), Clay (Ames) o SatMAE son alternativas en el campo de los fundation models de observación de la Tierra, pero no hay datos públicos que permitan una comparación directa con TESSERA-V-2.0-2B-L en cuanto a parámetros, contexto o rendimiento. Se recomienda consultar el preprint (arxiv:2607.03949) para posibles comparaciones con versiones anteriores.

## Limitaciones y advertencias

- Los embeddings de TESSERA son representaciones espectral-temporales anuales a resolución de 10 m, no imágenes crudas ni datos de monitorización en tiempo real.
- La precisión puede degradarse en regiones o años con muy pocas observaciones válidas (por ejemplo, alta nubosidad persistente o fallos del sensor); los usuarios deben validar el rendimiento para su propia tarea y geografía.
- El orden de los canales de entrada de Sentinel-2 que usa este modelo NO es el orden convencional por longitud de onda ascendente; es imprescindible seguir el contrato de entrada especificado en la model card para evitar errores.
- Los benchmarks reportados en el preprint de TESSERA v2 no corresponden a este checkpoint (fueron medidos en estudiantes destilados del teacher de 1B); los números para los estudiantes del 2B se publicarán por separado.
- Aunque la licencia CC0 permite uso comercial sin restricciones, el modelo está destinado a investigación científica y análisis geospacial; no debe interpretarse como un sistema de vigilancia o de toma de decisiones autónoma.
- La normalización de Sentinel-1 ascendente y descendente se realiza con estadísticas propias del student; si se mezclan datos con el teacher, no se deben transferir las estadísticas de normalización.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/geotessera/TESSERA-V-2.0-2B-L
- Teacher (2B): https://huggingface.co/geotessera/TESSERA-V-2.0-2B-Teacher
- Paper (preprint): https://arxiv.org/abs/2607.03949
