# geotessera/TESSERA-V-2.0-2B-Teacher

## Resumen

TESSERA v2 2B teacher es un modelo fundacional geoespacial de 2.06 mil millones de parámetros, desarrollado por el grupo ucam-eo de la Universidad de Cambridge. Está diseñado para generar representaciones densas por píxel (embeddings de 1024 dimensiones) a partir de series temporales anuales de observaciones multimodales Sentinel-1 (SAR) y Sentinel-2 (multiespectral). El modelo se enmarca en la familia TESSERA v2, cuyo objetivo es escalar modelos de observación de la Tierra a nivel de píxel, y se publica principalmente como objetivo de destilación para estudiantes compactos, no como modelo de despliegue.

La arquitectura combina dos backbones Transformer por modalidad (uno para Sentinel-2 y otro para Sentinel-1 con flujo ascendente+descendente fusionado), seguidos de una etapa de fusión y un reductor de dimensionalidad. El entrenamiento se realizó con el enfoque autosupervisado Barlow Twins sobre series temporales anuales de píxeles individuales, sin necesidad de etiquetas. Su relevancia actual radica en que permite investigar la escalabilidad de representaciones geoespaciales y sirve como fuente de conocimiento para estudiantes mucho más ligeros (de 1 a 44 millones de parámetros) que mantienen calidad comparable a una fracción del coste.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos backbones Transformer por modalidad (S2 y S1) + fusión + MLP reductor |
| Parametros totales | 2.064.266.242 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No aplica (entrada por píxel con contexto temporal anual, hasta 256 observaciones) |
| Tipos de cuantizacion | No disponible (salida en fp32) |
| Idiomas soportados | en (etiquetas de metadatos; el modelo procesa datos numéricos de sensores) |
| Licencia | CC0-1.0 (dominio público) |
| Formato de pesos | No disponible (repo PyTorch, fp32) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de dos ramas. La rama Sentinel-2 procesa 10 bandas espectrales mediante un embedding MLP de 10 a 4096 dimensiones, más una codificación posicional sinusoidal basada en el día del año. La rama Sentinel-1 procesa 2 bandas (probablemente VV y VH) con un embedding similar, pero fusiona los flujos ascendente y descendente en una única serie temporal. Cada rama emplea un Transformer de 4 capas pre-LN con d_model=4096, 4 cabezas, FFN de 16384 y QK-norm, seguido de un pooling de atención softmax de una sola cabeza sobre el tiempo. Los dos tokens resultantes (uno por modalidad) reciben un embedding de modalidad aprendido y pasan por un Transformer de fusión de 2 capas (d_model=4096, FFN=8192). Tras concatenar a 8192 dimensiones, un MLP reductor (8192 → 16384 → 1024) culmina en una LayerNorm no afín que fija la salida a media 0 y desviación 1 por vector.

El entrenamiento utiliza la pérdida Barlow Twins, una estrategia autosupervisada que maximiza la similitud entre representaciones de dos aumentos distintos de la misma entrada, minimizando la redundancia entre dimensiones. Los datos de preentrenamiento consisten en series temporales anuales de Sentinel-2 L2A y Sentinel-1 RTC, con un tamaño de píxel de 1 (cada píxel se procesa de forma independiente). No se menciona el número total de tokens ni la composición exacta del dataset en la información disponible.

## Capacidades

- Extracción de características por píxel: genera un vector de 1024 dimensiones que resume la dinámica espectral y SAR anual de cada ubicación.
- Multimodalidad: integra Sentinel-2 (multiespectral, 10 bandas) y Sentinel-1 (SAR, polarizaciones VV/VH) en una única representación.
- Contexto temporal: utiliza todas las observaciones válidas de un año, agrupadas en contenedores de 8, 16, …, 256 observaciones, lo que permite capturar estacionalidad y cambios.
- Salida normalizada: cada embedding tiene media 0 y desviación 1 en sus 1024 dimensiones, lo que facilita su uso en métricas de distancia coseno o productos escalares.
- Autosupervisión: no requiere etiquetas para el preentrenamiento, lo que permite su adaptación a dominios sin datos anotados.
- No es un modelo generativo ni de lenguaje: no genera texto, no realiza razonamiento simbólico ni soporta tool calling.

## Casos de uso

- Destilación de modelos estudiantes: el propósito principal es servir como profesor para entrenar los estudiantes TESSERA v2 (de 1,07 M a 43,83 M parámetros), que heredan su capacidad de representación a un coste mucho menor. Un investigador puede usar este teacher para generar embeddings de referencia y entrenar estudiantes con pérdida de destilación.
- Investigación en representaciones geoespaciales: permite estudiar cómo escalan los modelos de píxel, qué información capturan las representaciones de gran dimensión y cómo se comportan frente a variaciones temporales y de sensor.
- Análisis downstream a pequeña escala: aunque no es recomendable para producción, puede emplearse en experimentos científicos para clasificar cobertura terrestre, detectar anomalías o estimar variables biofísicas en áreas limitadas (por ejemplo, una región de pocos kilómetros cuadrados).
- Evaluación de calidad de representaciones: como referencia de alta capacidad, sirve para comparar la calidad de embeddings generados por modelos más ligeros o por versiones anteriores de TESSERA.
- Estudio de fusión multimodal: su arquitectura con backbones separados y fusión posterior permite analizar la contribución relativa de SAR y óptico en tareas de observación de la Tierra.
- Generación de pseudoetiquetas: en ausencia de datos etiquetados, el teacher puede producir embeddings que se utilicen como características para entrenar clasificadores simples en entornos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas como precisión en clasificación de cobertura terrestre, F1 en detección de cambios ni comparaciones con otros modelos fundacionales geoespaciales.

## Requisitos de hardware

- Inferencia con 2.06 mil millones de parámetros en fp32: el peso del modelo ocupa aproximadamente 8,3 GB (tamaño del repo), más memoria para activaciones y gradientes si se entrena.
- Se requiere GPU de forma efectiva; la model card advierte que la inferencia es costosa y que codificar a escala de tesela o global es impracticable en hardware ordinario.
- Para una inferencia puntual de un píxel o un pequeño lote, una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4080, A100 40 GB) sería necesaria, aunque no se especifica un requisito mínimo exacto.
- No es adecuado para despliegue en producción; se recomienda usar los estudiantes destilados (por ejemplo, TESSERA-V-2.0-2B-L con 43,83 M parámetros) que requieren mucho menos memoria y cómputo.
- Opciones de despliegue: no se mencionan herramientas específicas como vLLM u Ollama; al ser un modelo PyTorch, se podría cargar con la librería estándar, pero no está optimizado para inferencia de alto rendimiento.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. No se mencionan alternativas como Prithvi, Clay, o los propios estudiantes TESSERA en términos de benchmarks. La comparativa con los estudiantes TESSERA v2 se limita al número de parámetros y dimensión de salida, pero no hay métricas de calidad.

## Limitaciones y advertencias

- Coste computacional extremo: evaluar 2.06 mil millones de parámetros por píxel hace que la inferencia a escala de tesela o global sea inviable en hardware convencional; se requiere GPU incluso para cargas modestas.
- No es un modelo de despliegue: está pensado como objetivo de destilación y artefacto de investigación, no para producción. Para generación de embeddings a gran escala se deben usar los estudiantes destilados.
- Convenciones de entrada no triviales: el orden de canales de Sentinel-2 no sigue el orden ascendente de longitud de onda habitual, y Sentinel-1 utiliza estadísticas agrupadas de un flujo ascendente+descendente fusionado, lo que puede provocar errores si se asumen convenciones estándar.
- Representaciones anuales, no tiempo real: los embeddings resumen un año de observaciones, por lo que no son adecuados para monitorización en tiempo real ni para detectar cambios a corto plazo.
- Sin datos de sesgos: no se documentan sesgos geográficos, estacionales o de sensor. Dado que se entrena con datos de Sentinel, puede tener limitaciones en regiones con cobertura nubosa persistente o latitudes extremas.
- Riesgo de mal uso: al ser de dominio público (CC0), cualquier persona puede usarlo, pero su alto coste y naturaleza de investigación limitan su aplicación práctica directa.
- Sin soporte de cuantización: la salida es fp32, lo que aumenta los requisitos de almacenamiento y memoria frente a alternativas cuantizadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/geotessera/TESSERA-V-2.0-2B-Teacher
- Paper (arXiv): https://arxiv.org/abs/2607.03949
- Estudiantes destilados (mencionados en la model card):
  - TESSERA-V-2.0-2B-N: https://huggingface.co/geotessera/TESSERA-V-2.0-2B-N
  - TESSERA-V-2.0-2B-S: https://huggingface.co/geotessera/TESSERA-V-2.0-2B-S
  - TESSERA-V-2.0-2B-M: https://huggingface.co/geotessera/TESSERA-V-2.0-2B-M
  - TESSERA-V-2.0-2B-L: https://huggingface.co/geotessera/TESSERA-V-2.0-2B-L
