# freddyvillota/AQUA-PRITHVI-EO-2.0-300M-TL

## Resumen

AQUA-PRITHVI-EO-2.0-300M-TL es una adaptación al dominio acuático del modelo fundacional de observación de la Tierra Prithvi-EO-2.0-300M-TL, desarrollado originalmente por IBM y la NASA. La adaptación la firma Freddy Hernán Villota González (Universidad de Guadalajara, CUCEI), con supervisión académica de Stewart René Santos Arce y financiación de SECIHTI dentro del programa de Estancias Posdoctorales por México 2025. El modelo parte del checkpoint público de Prithvi y aplica un preentrenamiento autosupervisado de reconstrucción de reflectancia multiespectral enmascarada sobre un corpus acuático de imágenes Harmonized Landsat and Sentinel-2 (HLS).

La arquitectura es la nativa de TerraTorch `prithvi_eo_v2_300_tl_mae`, un transformer tipo masked autoencoder (MAE) con 330,4 millones de parámetros totales, de los cuales 76,9 millones (23,28 %) son entrenables durante la adaptación. La entrada son seis canales HLS (blue, green, red, nir_narrow, swir1, swir2) en parches de 224 × 224 píxeles a 30 m de resolución, con una única toma temporal (`num_frames=1`) y patch de (1, 16, 16).

Su relevancia es doble: por un lado, demuestra un flujo de adaptación de dominio reproducible sobre un modelo fundacional geoespacial con licencia Apache 2.0; por otro, publica una evaluación rigurosa de reconstrucción espectral en un conjunto de test espacialmente independiente de 25.111 registros parche-periodo, con reducciones de RMSE de reflectancia física del 42,92 % frente al modelo padre. Conviene subrayar que el modelo no predice parámetros de calidad del agua: su objetivo es la reconstrucción espectral autosupervisada en el dominio acuático.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer masked autoencoder (MAE), TerraTorch `prithvi_eo_v2_300_tl_mae`, `num_frames=1`, patch (1, 16, 16) |
| Parámetros totales | 330.419.716 |
| Parámetros activos | 76.920.323 entrenables (23,28 %) durante la adaptación; no es MoE |
| Longitud de contexto | no disponible (entrada de imagen 224 × 224 píxeles, 6 canales, 1 frame) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de visión, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch state-dict (`.pt`): `AQUA_PRITHVI_DAPT_V2_encoder.pt`, `final_delta.pt`; no son checkpoints `transformers` AutoModel |
| Modelo base | ibm-nasa-geospatial/Prithvi-EO-2.0-300M-TL (revisión `63adbd39c271da4c42f447e69b1a7c91a338cdc9`) |
| Canales de entrada | blue, green, red, nir_narrow, swir1, swir2 |
| Resolución espacial | 30 m |
| Tamaño del repositorio | 1,5 GB |
| Librería | terratorch |

## Arquitectura y entrenamiento

El modelo reutiliza la arquitectura nativa Prithvi-EO-2.0-300M-TL, un transformer MAE para datos multiespectrales de observación de la Tierra. Durante la adaptación de dominio se mantienen congelados los pesos del modelo padre salvo cuatro bloques transformer más profundos del encoder, la normalización final del encoder y la escala del embedding temporal; el decodificador MAE nativo completo es entrenable. El objetivo es reconstruir reflectancia multiespectral enmascarada con una ratio de máscara de 0,75, calculando la pérdida MSE únicamente sobre los píxeles espectrales válidos de agua (`valid_mask & water_mask`).

El corpus de entrenamiento son 169.429 registros parche-periodo controlados por calidad, procedentes de 2.389 parches espaciales en ocho regiones globales, observados entre enero de 2018 y diciembre de 2024. Las particiones se fijaron de forma espacialmente independiente antes del entrenamiento: 118.819 de entrenamiento, 25.499 de validación y 25.111 de test, manteniendo todos los registros temporales de un mismo parche en la misma partición. El optimizador es AdamW con tasa de aprendizaje de 1 × 10⁻⁵ para el encoder y 5 × 10⁻⁵ para el decodificador, batch efectivo de 8 y dos pasadas completas sobre los datos (29.706 pasos). El checkpoint seleccionado por validación se obtuvo en el paso 22.000. La normalización de entrada usa estadísticas de referencia de Prithvi V2 (media y desviación típica fijas por canal) aplicadas sobre reflectancia física multiplicada por 10.000; no se usaron coordenadas de localización durante la adaptación.

## Capacidades

- Extracción de representaciones (embeddings) de imágenes multiespectrales HLS en el dominio acuático.
- Reconstrucción de reflectancia espectral multiespectral con decodificador MAE nativo adaptado.
- Procesamiento de entradas de 6 canales a 30 m de resolución en parches de 224 × 224 píxeles.
- Aprendizaje autosupervisado de dominio (domain-adaptive pretraining) sobre corpus acuático.
- Uso como backbone para fine-tuning supervisado en tareas posteriores de teledetección acuática (segmentación, clasificación, regresión), mediante TerraTorch.
- Integración de información temporal mediante año y día del año de la adquisición.
- No soporta tool calling, agentes, razonamiento multi-step ni generación de texto: es un modelo puramente visual/geoespacial.
- No se documentan capacidades multilingües ni de audio.

## Casos de uso

- Fine-tuning para segmentación de masas de agua: el encoder adaptado puede servir como inicialización para modelos de segmentación semántica de cuerpos de agua, aprovechando que fue preentrenado enmascarando píxeles de agua válidos.
- Imputación y reconstrucción de reflectancia en escenas acuáticas: útil para rellenar huecos por nubosidad o artefactos en series HLS, dado el RMSE de reflectancia física de 0,00516591 en test.
- Preprocesado de pipelines de calidad del agua: el modelo puede generar representaciones espectrales limpias que alimenten modelos supervisados posteriores de clorofila, turbidez o materia orgánica, aunque él mismo no predice esas variables.
- Detección de cambios en ecosistemas acuáticos: comparando embeddings del encoder adaptado entre fechas de un mismo parche para identificar anomalías espectrales.
- Investigación en adaptación de dominio geoespacial: sirve como referencia reproducible de cómo adaptar un modelo fundacional de IBM/NASA a un dominio específico con recursos limitados (solo 23,28 % de parámetros entrenables).
- Clasificación de cobertura acuática a nivel de píxel: fine-tuning supervisado sobre las características del encoder para distinguir tipos de agua, algas o sedimentos.
- Validación cruzada de sensores: al trabajar con HLS (Landsat + Sentinel-2 fusionados), puede usarse para armonizar representaciones entre ambos sensores en entornos acuáticos.

## Benchmarks y rendimiento

Evaluación de reconstrucción espectral sobre 25.111 registros parche-periodo de test espacialmente independientes, con enmascaramiento y evaluación emparejados y clustering por parche de test para estadística inferencial:

| Métrica | Prithvi padre | AQUA-PRITHVI | Cambio |
|---|---:|---:|---:|
| RMSE de reflectancia física | 0,00905034 | 0,00516591 | −42,92 % |
| MAE de reflectancia física | 0,00422485 | 0,00283666 | −32,86 % |
| Spectral Angle Mapper | 11,5730° | 8,8235° | −23,76 % |
| MSE acuático enmascarado normalizado | 0,008982 | 0,004313 | −51,98 % |

La reducción absoluta de RMSE de reflectancia física fue de 0,00388444, con intervalo de confianza del 95 % por bootstrap espacial de [0,00343399, 0,00440784] usando 2.000 réplicas. Estas métricas miden reconstrucción espectral, no predicción supervisada de parámetros químicos o ecológicos del agua. No se han publicado resultados de benchmarks supervisados (segmentación, clasificación) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 330,4 M de parámetros en fp32, el peso de los parámetros ronda 1,3 GB, a lo que se suma memoria de activaciones para parches de 224 × 224 con 6 canales.
- GPU recomendadas: no disponible. Por tamaño, una GPU consumer con 8-16 GB de VRAM (RTX 3060/4060/4070/4080, RTX 4090) debería poder ejecutar inferencia en fp32 o fp16; no confirmado por el autor.
- Cabe en GPU consumer: probablemente sí, dado el tamaño de 330 M de parámetros, aunque no se documenta oficialmente.
- Opciones de despliegue: TerraTorch con el script `load_aqua_prithvi.py` proporcionado; requiere el checkpoint padre de IBM/NASA bloqueado. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AQUA-PRITHVI-EO-2.0-300M-TL | 330,4 M (76,9 M entrenables) | 224 × 224 px, 6 canales, 1 frame | Acuático (HLS) | Apache 2.0 | Hugging Face (freddyvillota) |
| Prithvi-EO-2.0-300M-TL | 300 M aprox. (330,4 M en la arquitectura) | 224 × 224 px, 6 canales | Generalista de observación de la Tierra | Apache 2.0 | Hugging Face (ibm-nasa-geospatial) |
| Prithvi-EO-2.0-600M-TL | No disponible en la información | No disponible | Generalista de observación de la Tierra | Apache 2.0 | Hugging Face (ibm-nasa-geospatial) |

La comparación directa más relevante es con el modelo padre, del que AQUA-PRITHVI hereda arquitectura y pesos. El modelo padre no está especializado en dominio acuático, y la adaptación mejora la reconstrucción espectral en el test acuático según los datos publicados. No se dispone de información sobre otros modelos de adaptación de dominio acuático comparables en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo no predice parámetros de calidad del agua (clorofila, turbidez, etc.); solo reconstruye reflectancia espectral. Cualquier uso para calidad del agua requiere fine-tuning supervisado adicional.
- Los checkpoints son state-dicts de PyTorch, no checkpoints `transformers` AutoModel; requieren TerraTorch y el checkpoint padre bloqueado para su reconstrucción.
- El artefacto solo-encoder (`AQUA_PRITHVI_DAPT_V2_encoder.pt`) no incluye el decodificador MAE adaptado; los resultados de reconstrucción se obtuvieron con encoder y decodificador adaptados.
- La adaptación usa estadísticas de normalización de Prithvi V2, no aprendidas del corpus acuático; esto puede introducir sesgos en dominios acuáticos con distribuciones espectrales muy distintas.
- No se usaron coordenadas de localización durante la adaptación, lo que limita la capacidad del modelo de aprovechar información geográfica.
- El corpus de entrenamiento cubre ocho regiones globales entre 2018 y 2024; el rendimiento fuera de esa cobertura temporal o geográfica no está documentado.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero la reconstrucción puede generar reflectancias espectralmente plausibles pero incorrectas en píxeles o condiciones no representadas.
- No se documentan sesgos específicos ni evaluaciones de equidad; el modelo es de teledetección y no genera texto.
- Licencia Apache 2.0 permite uso comercial, pero debe respetarse la atribución al modelo padre de IBM/NASA y al autor de la adaptación.
- Solo hay 0 descargas y 0 likes en el momento de la consulta; no hay validación comunitaria independiente.
- El corpus publicado en Zenodo (DOI 10.5281/zenodo.24356738) es solo metadatos; no distribuye los tensores HLS de origen, lo que dificulta la reproducción exacta del entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/freddyvillota/AQUA-PRITHVI-EO-2.0-300M-TL
- Modelo padre Prithvi-EO-2.0-300M-TL: https://huggingface.co/ibm-nasa-geospatial/Prithvi-EO-2.0-300M-TL
- Corpus de metadatos en Zenodo: https://doi.org/10.5281/zenodo.24356738
- TerraTorch (librería de implementación): no se proporciona enlace en la información disponible
- Paper o blog del autor: no disponible en la información proporcionada
