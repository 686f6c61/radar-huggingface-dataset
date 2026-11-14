# anjanid/burn-scar-ca

## Resumen

burn-scar-ca v1 es un modelo de segmentación semántica de imágenes Sentinel-2 para delimitar áreas quemadas en incendios forestales de Canadá. Lo desarrolla Centauri Research (Alpha Centauri Ventures Inc.) y se distribuye como un fine-tuning del modelo base Prithvi-EO-2.0-300M-BurnScars de IBM y NASA, que estaba entrenado con incendios de Estados Unidos. El modelo clasifica cada píxel de 30 m de una imagen Sentinel-2 L2A posterior a un incendio como quemado o no quemado, resolviendo el problema de la transferencia geográfica: el modelo estadounidense marcaba aproximadamente un 15% de suelo no quemado como quemado cuando se aplicaba a incendios canadienses.

La relevancia del modelo es doble. Por un lado, demuestra que un fine-tuning con datos locales corrige el sesgo de falsos positivos del modelo base: el IoU de área quemada pasa de 0,566 a 0,873 y la exactitud de la clase no quemada de 0,849 a 0,984 en un conjunto de test retenido de incendios boreales de Quebec. Por otro, se publica con un nivel de trazabilidad poco habitual en modelos de observación de la Tierra: pesos en safetensors con checksums, estadísticas de normalización, configuración de entrenamiento y registro en MLflow.

El modelo tiene 300M de parámetros, se ejecuta sobre el framework TerraTorch 1.2.14 y se entrenó en una única GPU NVIDIA L4 en Google Colab. La licencia es Apache-2.0 tanto para los pesos como para el modelo base. Es importante subrayar que la salida es una estimación modelada, no una medición de campo, y que la referencia de evaluación son los perímetros NBAC del Canadian Forest Service, no la extensión quemada verificada sobre el terreno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de segmentación semántica (Prithvi-EO-2.0, fine-tuning con TerraTorch `SemanticSegmentationTask`) |
| Parametros totales | 300M (heredados del modelo base Prithvi-EO-2.0-300M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada de chips de 512 × 512 píxeles, 6 bandas) |
| Tipos de cuantizacion | Pesos publicados en float16 (se convierten a float32 para ejecutar); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (modelo de imagen, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`burn_scar_ca_v1_fp16.safetensors`) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo del checkpoint `ibm-nasa-geospatial/Prithvi-EO-2.0-300M-BurnScars` (revisión `a3f2c410e45b8ac7417976614528a872f024d831`), un transformer de 300M de parámetros diseñado para observación de la Tierra. La tarea se implementa como segmentación semántica binaria sobre chips de 512 × 512 píxeles con seis bandas de Sentinel-2 L2A en el orden BLUE, GREEN, RED, NIR_NARROW, SWIR_1 y SWIR_2 (B02, B03, B04, B8A, B11 y B12), con reflectancia en escala 0–1 y remuestreo a 30 m. Todos los pesos fueron entrenables durante el fine-tuning, con AdamW, learning rate 1e-4, scheduler ReduceLROnPlateau, pérdida de entropía cruzada con etiqueta −1 ignorada y precisión mixta bf16, sobre una única NVIDIA L4 en Google Colab con TerraTorch 1.2.14, PyTorch 2.14.1 y Lightning 2.6.6.

Los datos de entrenamiento son 1.024 chips derivados de incendios canadienses de 2017 a 2025 (607 de entrenamiento, 143 de validación y 274 de test), con etiquetas del National Burned Area Composite (NBAC, release 20260513). La partición se hizo por incendio y región, nunca por chip aleatorio, para evitar fugas de información entre splits. La normalización usa medias y desviaciones típicas por banda calculadas sobre 149.510.593 píxeles válidos de los chips de entrenamiento (`norm_stats.json`). Cada chip emplea la escena Sentinel-2 con menor cobertura nubosa (por debajo del 20%) dentro de los 45 días posteriores a la fecha de fin del incendio. Los pesos publicados corresponden a la época 10 (pérdida de validación 0,0572), no a la mejor época de la ejecución, porque el entorno de GPU en la nube se interrumpió dos veces antes de terminar el entrenamiento.

## Capacidades

- Segmentación semántica binaria de área quemada sobre imágenes Sentinel-2 L2A a 30 m de resolución.
- Clasificación píxel a píxel en dos clases: quemado y no quemado.
- Manejo explícito de píxeles ignorados: nubes, sombras, nieve, ausencia de datos y cicatrices de los tres años anteriores se excluyen del entrenamiento mediante la etiqueta −1.
- Entrada multibanda de seis canales de reflectancia superficial, incluyendo SWIR, relevante para la discriminación de cicatrices de fuego.
- Inferencia sobre chips de 512 × 512 píxeles mediante un script de ejemplo (`inference_example.py`) que lee un GeoTIFF y escribe una máscara binaria.
- No soporta tool calling, function calling, razonamiento multi-paso ni generación de texto: es exclusivamente un modelo de visión por satélite.
- No dispone de clases de severidad del fuego en esta versión.

## Casos de uso

- Cartografía rápida de área quemada tras un incendio: dado un GeoTIFF Sentinel-2 L2A de seis bandas posterior al fuego, el modelo genera una máscara binaria de cicatriz con IoU de 0,873 frente a perímetros NBAC en el test retenido, lo que permite una primera delimitación antes de la validación oficial.
- Monitorización de incendios en bosque boreal canadiense: el fine-tuning reduce los falsos positivos de suelo no quemado de aproximadamente el 15% al 2%, un requisito práctico para no sobreestimar la superficie afectada en informes internos.
- Alimentación de pipelines de teledetección con TerraTorch: al estar empaquetado como `SemanticSegmentationTask` con configuración y estadísticas de normalización incluidas, se integra en flujos existentes de TerraTorch sin reentrenamiento.
- Investigación sobre transferencia geográfica de modelos de observación de la Tierra: sirve como caso de estudio reproducible (checksums, manifiesto de datos, MLflow) de cómo un modelo entrenado en EE. UU. se adapta a otro país con un conjunto etiquetado local.
- Generación de capas auxiliares para análisis de emisiones y recuperación vegetal: la máscara de área quemada puede combinarse con índices de vegetación posteriores para estudiar la revegetación, siempre con la salvedad de que la salida es modelada y no una medición.
- Docencia y prototipado en teledetección: el modelo cabe en una GPU de consumo y se ejecuta con un script de ejemplo, lo que facilita demostraciones de segmentación semántica sobre datos Sentinel-2 reales.

## Benchmarks y rendimiento

Resultados del test retenido sobre 274 chips de incendios boreales de Quebec, nunca usados en entrenamiento ni ajuste, según `trainer.test` de TerraTorch con los mismos chips para ambos modelos:

| Metrica | Modelo base (EE. UU.) | burn-scar-ca v1 |
|---|---|---|
| IoU de área quemada | 0,566 | 0,873 |
| IoU de no quemado | 0,846 | 0,972 |
| mIoU | 0,706 | 0,922 |
| Recall de píxeles quemados | 0,980 | 0,939 |
| Exactitud de la clase no quemada | 0,849 | 0,984 |
| mIoU de frontera | 0,060 | 0,559 |
| F1 | 0,820 | 0,959 |

La mejora principal es la reducción de falsos positivos (de aproximadamente el 15% al 2% de píxeles no quemados) y la calidad de las fronteras (mIoU de frontera de 0,060 a 0,559), a costa de un descenso del recall de 0,980 a 0,939. No se han publicado resultados de benchmarks en la información disponible más allá de esta tabla.

## Requisitos de hardware

- Entrenamiento original: una única NVIDIA L4 (Google Colab), con precisión mixta bf16.
- Inferencia: los pesos son de 300M de parámetros en float16 (repositorio de 0,6 GB), por lo que la VRAM necesaria es modesta; no se documenta una cifra exacta de VRAM en la información disponible.
- Cabe en GPU de consumo: una RTX 4090, RTX 3090 o incluso tarjetas con 8–12 GB de VRAM deberían ser suficientes para inferencia por chips de 512 × 512, aunque el dato no está confirmado en la model card.
- Despliegue: TerraTorch 1.2.14 con `rasterio` y `safetensors`, mediante el script `inference_example.py`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento (test Quebec) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| burn-scar-ca v1 | 300M | Chips 512 × 512, 6 bandas | mIoU 0,922; IoU quemado 0,873 | Apache-2.0 | Hugging Face |
| Prithvi-EO-2.0-300M-BurnScars (base) | 300M | Chips 512 × 512, 6 bandas | mIoU 0,706; IoU quemado 0,566 | Apache-2.0 | Hugging Face (IBM/NASA) |
| Prithvi-EO-2.0-300M (general) | 300M | Chips 512 × 512, 6 bandas | no disponible para esta tarea | Apache-2.0 | Hugging Face (IBM/NASA) |
| Otros modelos de área quemada | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa más fiable es con el modelo base, evaluado con los mismos chips y el mismo procedimiento. No se dispone de datos de benchmarks de otros modelos de segmentación de área quemada en la información proporcionada.

## Limitaciones y advertencias

- La referencia de evaluación son los perímetros NBAC, no la extensión quemada verificada sobre el terreno; NBAC cuenta islas no quemadas dentro del perímetro como quemadas y sus bordes pueden desviarse uno o dos píxeles, por lo que las métricas miden acuerdo con NBAC.
- Solo se ha evaluado la transferencia en una región retenida (incendios boreales de Quebec); no se ha medido el rendimiento en otras zonas de Canadá, otros ecosistemas, otras estaciones ni otros sensores.
- Los pesos publicados son de la época 10 (pérdida de validación 0,0572), no de la mejor época de la ejecución; una ejecución más larga podría dar resultados distintos.
- La ventana temporal de las imágenes está fijada: la escena menos nubosa (menos del 20% de nubosidad) dentro de los 45 días posteriores al fin del incendio, o desde el 1 de septiembre del año del fuego cuando NBAC no da fecha de fin; otras ventanas no se han medido.
- Solo distingue quemado y no quemado; no hay clases de severidad en esta versión.
- El modelo no está destinado a gestión operativa de incendios, seguros ni decisiones legales o regulatorias; la salida es una estimación modelada, no una medición.
- Riesgo de alucinación en el sentido de falsos positivos o negativos de segmentación en condiciones no vistas (nubosidad, nieve, sombras, otras fenologías), aunque el fine-tuning reduce sustancialmente los falsos positivos observados.
- No se documentan sesgos demográficos ni lingüísticos por tratarse de un modelo de imagen; el sesgo relevante es geográfico y ecosistémico.
- La licencia Apache-2.0 permite uso comercial de los pesos, pero las etiquetas NBAC del Canadian Forest Service tienen sus propias condiciones de atribución recogidas en `NOTICE`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/anjanid/burn-scar-ca
- Modelo base: https://huggingface.co/ibm-nasa-geospatial/Prithvi-EO-2.0-300M-BurnScars
- Código: https://github.com/anjani2016/cr-geo-models
- Paper de referencia (arXiv:2412.02732): https://arxiv.org/abs/2412.02732
- NBAC, Canadian Forest Service, Natural Resources Canada: http://cwfis.cfs.nrcan.gc.ca
