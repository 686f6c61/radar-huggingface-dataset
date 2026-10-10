# rohitm9/ufo-segformer-b2

## Resumen

UFO SegFormer B2 es un checkpoint de segmentación semántica binaria publicado por el usuario rohitm9 en HuggingFace, orientado a la detección de agua superficial e inundaciones urbanas en imágenes de satélite PlanetScope. Se trata de un SegFormer B2, una arquitectura de segmentación que combina un codificador Transformer jerárquico (Mix Transformer, MiT) con un decodificador ligero de tipo all-MLP, con 27.349.698 parámetros totales y profundidades de codificador `[3, 4, 6, 3]`.

El modelo recibe tensores de tres canales y produce dos clases: `0` para superficie no inundada y `1` para agua superficial. Está vinculado al proyecto Urban Flood Observations (UFO), cuyo repositorio de código y dataset se alojan en GitHub y Zenodo respectivamente. El checkpoint se distribuye tanto en formato PyTorch original como en formato Transformers con safetensors, y se acompaña de 215 máscaras de predicción binarias verificadas sobre 14 eventos de inundación.

Su relevancia actual es acotada pero específica: es un artefacto archivado que permite reproducir y auditar predicciones de inundación urbana con imágenes PlanetScope a 1024x1024 píxeles. La model card advierte explícitamente de que la configuración de preprocesado original (selección de bandas, orden y normalización) no se ha conservado, por lo que el checkpoint no es directamente utilizable sin reconstruir ese contrato de entrada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SegFormer B2 (codificador Mix Transformer jerarquico + decodificador all-MLP), profundidades de codificador `[3, 4, 6, 3]`, dimension oculta del decodificador 768 |
| Parametros totales | 27.349.698 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de segmentacion de imagen; entrada 1024 x 1024 píxeles segun las mascaras de prediccion) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiqueta del repositorio; el modelo es de vision, no linguistico) |
| Licencia | no disponible (la model card indica que el checkpoint no especifica licencia de pesos y que la licencia CC BY 4.0 del dataset no debe interpretarse como licencia de los pesos) |
| Formato de pesos | safetensors (`model.safetensors`) y state dict PyTorch original (`segformer_b2_best.pt`) |

## Arquitectura y entrenamiento

La arquitectura es un SegFormer B2 estándar: un codificador Mix Transformer con atención de ventana sin codificaciones posicionales, seguido de un decodificador all-MLP. La configuración se reconstruyó a partir de las formas de los tensores del state dict y de la configuración de referencia de NVIDIA para B2 (`nvidia/segformer-b2-finetuned-ade-512-512`), ya que el checkpoint no incluía la configuración de entrenamiento original. Solo se eliminó el prefijo envolvente `model.` durante la conversión de pesos.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO (no aplicables a un modelo de segmentación). Lo que sí se documenta es que el pipeline de entrenamiento del repositorio GitHub usa imágenes PlanetScope de cuatro bandas, mientras que el checkpoint distribuido aquí espera tres canales (confirmado por la forma del peso de la primera convolución, `[64, 3, 7, 7]`). Esta discrepancia entre el contrato de entrada del entrenamiento (cuatro bandas) y el del checkpoint (tres bandas) es una limitación central: la selección de bandas, el orden, el escalado y la normalización originales no se incluyeron, y no se proporciona procesador de imagen.

## Capacidades

- Segmentación semántica binaria de imágenes: clasifica cada píxel como `0` (no inundado) o `1` (agua superficial).
- Procesamiento de imágenes multiespectrales de tres canales, presumiblemente derivadas de PlanetScope (el contrato exacto de bandas no está documentado).
- Inferencia sobre recortes de 1024 x 1024 píxeles, según las máscaras GeoTIFF de predicción incluidas en la evaluación.
- Salida de logits con remuestreo bilineal a la resolución de entrada, tal como muestra el ejemplo de carga de la model card.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües: es un modelo puramente visual.
- No dispone de modo thinking, visión multimodal general, audio ni generación de texto.

## Casos de uso

- Mapeo de inundaciones urbanas a partir de imágenes PlanetScope: el modelo segmenta agua superficial a resolución de 1024 x 1024, adecuado para análisis por evento de inundación en entornos urbanos.
- Auditoría y reproducción de experimentos de investigación: al incluir 215 máscaras predichas y su CSV de evaluación, permite verificar métricas de IoU de agua contra las etiquetas locales del proyecto UFO.
- Evaluación comparativa de pipelines de segmentación: sirve como referencia B2 dentro del experimento leave-one-event-out descrito en el repositorio, aunque la model card no certifica que este checkpoint concreto reproduzca las puntuaciones.
- Prototipado en teledetección académica: investigadores pueden cargarlo con `AutoModelForSemanticSegmentation` en Transformers 4.47.1 y PyTorch 2.6.0, tal como se probó, para experimentar con el contrato de entrada de tres canales.
- Generación de mosaicos binarios georreferenciados: las predicciones se almacenan como GeoTIFF de una banda con CRS y transformada afín, lo que facilita su integración en flujos GIS.
- Estudio de casos de inundación en ciudades específicas: los 14 eventos cubiertos (BEI, BNA, CMO, CTO, DKA, GIL, HTX, KTM, MID, NSW, PNE, QUE, SLC, SPS) permiten análisis localizados con recuentos de imágenes conocidos.

## Benchmarks y rendimiento

Los únicos datos numéricos disponibles describen los artefactos de predicción archivados, no necesariamente este checkpoint individual. La model card advierte de que el vínculo entre las predicciones y este checkpoint concreto no se ha verificado de forma independiente.

| Metrica de IoU de agua | Valor |
|---|---:|
| Media de los 215 IoU por imagen (CSV `OVERALL_MEAN`) | 77,340578 % |
| IoU con píxeles agrupados (pooled-pixel) | 85,081899 % |
| Media de las 14 medias de IoU por evento | 73,937440 % |

Recuentos totales de confusión: TP 74.159.184; FP 7.193.473; TN 138.281.723; FN 5.809.460.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, ADE20K, Cityscapes) en la información disponible. La recomputación de TP, FP, TN y FN coincide exactamente con el CSV para cada imagen, y Precision, Recall, IoU, F1 y Accuracy concuerdan dentro de `1e-6`.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la documentación; con 27,35 M de parámetros, los pesos ocupan aproximadamente 110 MB en fp32 y unos 55 MB en fp16, más el coste de activaciones a 1024 x 1024.
- GPU recomendadas: no especificadas por el autor; el ejemplo de carga se validó en CPU con un tensor sintético.
- Cabe en GPU de consumo: con toda probabilidad sí, dado el tamaño de parámetros, aunque no hay confirmación oficial ni cifras de VRAM medidas.
- Opciones de despliegue: Transformers (`AutoModelForSemanticSegmentation`) con PyTorch 2.6.0. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (y ninguno aplica a un modelo de segmentación de imagen).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rohitm9/ufo-segformer-b2 | 27.349.698 | 3 canales, 1024 x 1024 | IoU de agua 77,34 % (media por imagen, artefactos archivados) | no disponible | HuggingFace |
| nvidia/segformer-b2-finetuned-ade-512-512 | no disponible en la informacion | 512 x 512, RGB | no disponible | no disponible en la informacion | HuggingFace |
| rohitm9/surfaceWaterGlobal | no disponible | teledeteccion (Sentinel-1, AlphaEarth) | no disponible | Apache 2.0 | HuggingFace |

La comparación directa es limitada: el checkpoint de NVIDIA se usó solo como referencia para reconstruir la configuración de arquitectura, y `surfaceWaterGlobal` es otro modelo del mismo autor con contrato de entrada y licencia distintos (Apache 2.0 frente a licencia no disponible en este caso).

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. No se documenta ningún análisis de sesgo geográfico o temporal, pese a que los eventos cubren ciudades concretas.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero existe riesgo de falsos positivos y falsos negativos en la segmentación (FP 7.193.473 y FN 5.809.460 en los artefactos evaluados).
- Contrato de entrada no recuperado: la selección de bandas, el orden, el escalado y la normalización originales no se incluyeron, y no hay procesador de imagen. No se asume normalización RGB, ImageNet ni de cuatro bandas.
- Desajuste entre entrenamiento e inferencia: el pipeline de PlanetScope del repositorio GitHub usa cuatro bandas, mientras que este checkpoint espera tres.
- Limitaciones de contexto o idioma: el modelo es de visión y no procesa texto; la etiqueta de idioma `en` se refiere a la documentación.
- Restricciones de licencia: el checkpoint no especifica licencia de pesos. La licencia CC BY 4.0 del dataset no debe interpretarse como licencia del modelo, lo que impide confirmar su uso comercial.
- Caveat de reproducción: las puntuaciones de IoU provienen de artefactos de predicción archivados y su vinculación con este checkpoint individual no se ha verificado; no se aportaron las identidades de checkpoint por fold ni la separación entrenamiento/prueba.
- Caveat de validación: las comprobaciones realizadas solo validan serialización y ejecución (round trip bit a bit en safetensors y logits idénticos en una pasada sintética en CPU), no la precisión de predicción ni la recuperación del preprocesado original.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rohitm9/ufo-segformer-b2
- Repositorio de código UFO: https://github.com/Tellman-lab/urbanFloodObservations
- Dataset UFO: https://zenodo.org/records/19698577
- Checkpoint original: https://drive.google.com/file/d/15I7KA-ddi1MhqSYW_t4XSmPzImwGdYBT/view
- ZIP de predicciones: https://drive.google.com/file/d/1FpjzPr2eXEQhPJlDl5M16nOlFQ9FVKeW/view
- CSV de evaluacion: https://drive.google.com/file/d/1AerMLVjzH_etOor4oyKyz8ekDjIm_d-2/view
- Configuracion de referencia NVIDIA B2: https://huggingface.co/nvidia/segformer-b2-finetuned-ade-512-512/blob/main/config.json
- Documentacion de SegFormer en Transformers: https://huggingface.co/docs/transformers/model_doc/segformer
