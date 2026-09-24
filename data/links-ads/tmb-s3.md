# links-ads/tmb-s3

## Resumen

TMB-S3 es una familia de cuatro modelos de segmentación de imagen entrenados para delimitar áreas quemadas (burned-area mapping) a partir de series temporales del instrumento OLCI del satélite Sentinel-3. Los publica la organización links-ads junto con el artículo "Temporal Modelling for Burn Scars on Sentinel-3" (Barco L., Arnaudo E., Bragagnolo A., Rossi C., Garza P., conferencia AICT 2026) y se distribuyen con licencia MIT. El problema que resuelven es la generación automática de la máscara de cicatriz de incendio a escala de píxel, una tarea relevante para evaluación de daños, seguimiento post-incendio y contabilidad de emisiones, donde la resolución temporal de Sentinel-3 (varias adquisiciones al día) permite observar la evolución de la cicatriz.

Todos los modelos comparten backbone SegFormer, que según la model card obtiene los mejores resultados del artículo en cada configuración (empatado con U-Net en el caso de ConvLSTM con subconjunto de bandas). Hay dos arquitecturas: un SegFormer 2D con fusión temprana bitemporal (pre-incendio + última post-incendio) y un híbrido ConvLSTM + SegFormer que consume la secuencia completa pre/post-incendio y emite la predicción en el último fotograma. Cada arquitectura se publica en dos variantes de entrada: 21 bandas OLCI o un subconjunto de 5 bandas (Oa21, Oa17, Oa08, Oa06, Oa04).

El modelo se ha entrenado sobre el dataset TMB-S3 y se libera con cuatro carpetas independientes, cada una con `config.yaml`, checkpoint de PyTorch Lightning, pesos en safetensors y un CSV de métricas por bounding box. Los pesos publicados corresponden, de cada configuración, a la semilla (17, 42 o 127) con mayor F1 en test, por lo que las cifras que se muestran están por encima de las medias del artículo y no deben interpretarse como estimaciones insesgadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SegFormer (transformer de segmentacion) en configuracion 2D con fusion temprana bitemporal; variante hibrida ConvLSTM + SegFormer para secuencias temporales |
| Parametros totales | no disponible (la model card no especifica la variante de SegFormer ni el recuento de parametros) |
| Longitud de contexto | no aplica (modelo de vision; no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en precision de entrenamiento) |
| Idiomas soportados | no aplica / no disponible (modelo de segmentacion de imagenes) |
| Licencia | MIT (los datos de entrenamiento se rigen por las licencias indicadas en la ficha del dataset) |
| Formato de pesos | safetensors (`model.safetensors`) y checkpoint de PyTorch Lightning (`model.ckpt`) |
| Tarea (pipeline) | image-segmentation |
| Dominio | teledeteccion, observacion de la Tierra, incendios forestales, areas quemadas |
| Fuente de datos de entrada | Sentinel-3 OLCI (21 bandas, o subconjunto de 5: Oa21, Oa17, Oa08, Oa06, Oa04) |
| Entrada auxiliar | ESA WorldCover (concatenada como canal adicional) |
| Canales de entrada (fusion temprana 2D) | 43 canales (21 bandas) o 11 canales (5 bandas) |
| Canales de entrada (ConvLSTM) | 22 canales por fotograma (21 bandas) o 6 canales por fotograma (5 bandas) |
| Salida | mascara binaria de clase quemada |
| Dataset de entrenamiento | links-ads/tmb-s3 |
| Biblioteca | pytorch |
| Tamano del repositorio | 0.0 GB segun la API de HuggingFace |

## Arquitectura y entrenamiento

Se publican dos familias. La primera es un SegFormer 2D con fusión temprana bitemporal: concatena por canales la adquisición pre-incendio y la última adquisición post-incendio, junto con ESA WorldCover, dando 43 canales con las 21 bandas OLCI o 11 canales con el subconjunto de 5 bandas. La segunda es un híbrido ConvLSTM + SegFormer que procesa la secuencia completa (una adquisición pre-incendio seguida de las adquisiciones post-incendio), con WorldCover añadido a cada fotograma (22 o 6 canales por fotograma), y toma como salida la predicción del último fotograma. La normalización, la selección de bandas y la fusión temprana se aplican en el transform de test del repositorio de código, guiado por el `config.yaml` de cada carpeta.

Cada configuración se entrenó con 3 semillas (17, 42 y 127) y el artículo reporta media ± desviación estándar sobre ellas. El checkpoint liberado por configuración es el de la época con mayor F1 de validación en la clase quemada y, entre las 3 semillas, el de mayor F1 en test. Las medias del artículo son 65,50 y 65,73 para las variantes 2D y 67,64 y 68,24 para las ConvLSTM. No se detalla en la información disponible el número de tokens o de muestras de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF/DPO (no procede en segmentación). La innovación técnica destacable es el modelado temporal explícito de la cicatriz: comparar la reflectancia antes y después del fuego, bien por fusión temprana, bien mediante una ConvLSTM que recorre la secuencia post-incendio.

## Capacidades

- Segmentación binaria por píxel de área quemada sobre imágenes Sentinel-3 OLCI.
- Modelado temporal: variantes ConvLSTM que consumen la secuencia completa pre-incendio + post-incendio y predicen en el último fotograma.
- Fusión bitemporal: variantes 2D que combinan una imagen pre-incendio y una post-incendio en el eje de canales.
- Trabajo con dos anchos espectrales: 21 bandas OLCI completas o subconjunto reducido de 5 bandas (Oa21, Oa17, Oa08, Oa06, Oa04).
- Uso de ESA WorldCover como canal auxiliar de contexto de cobertura del suelo.
- Soporte de enmascarado de agua en inferencia mediante `--water-mask-key landcover --water-mask-value 7 8`.
- Agregación temporal configurable en inferencia (`--temporal-agg last_full`) y umbral de voto para la clase quemada (`--burnt-vote-threshold 0.5`).
- Tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingües: no aplica.
- Capacidades especiales: no se documentan modos de visión general, audio ni modo de razonamiento; la única salida es la máscara de segmentación.

## Casos de uso

- Cartografía de áreas quemadas a escala regional: el modelo genera la máscara de cicatriz a partir de una serie Sentinel-3 OLCI, lo que permite producir capas de superficie quemada sin depender de interpretación manual.
- Evaluación rápida de daños tras un incendio: con la variante ConvLSTM se procesa la secuencia pre/post-incendio y se obtiene la extensión afectada en el último fotograma, útil para informes preliminares de emergencia.
- Seguimiento de la recuperación post-incendio: al aplicar el modelo sobre series temporales sucesivas se puede observar la evolución de la cicatriz y comparar su persistencia entre campañas.
- Contabilidad de emisiones y carbono: la superficie quemada segmentada es una entrada directa para estimaciones de emisiones asociadas al fuego en inventarios ambientales.
- Verificación de partes de siniestro y peritajes: la máscara obtenida de Sentinel-3 sirve como evidencia geoespacial independiente para contrastar superficies declaradas en reclamaciones de seguros agrarios o forestales.
- Integración en pipelines GIS existentes: los pesos en safetensors y los checkpoints de Lightning se pueden cargar desde Python y encadenar con las utilidades del repositorio para volcar resultados a GeoTIFF u otras capas vectoriales en flujos de trabajo de teledetección.
- Investigación sobre modelado temporal en teledetección: las cuatro variantes permiten comparar experimentalmente fusión temprana frente a ConvLSTM y 21 bandas frente a 5 bandas sobre el mismo protocolo de test.
- Alertas y monitorización operativa con restricción de ancho de banda: la variante de 5 bandas reduce el número de canales de entrada (11 canales en 2D, 6 por fotograma en ConvLSTM), lo que simplifica la descarga y el preprocesado cuando no se necesita el espectro completo.
- Generación de conjuntos de datos derivados: las máscaras producidas pueden servir como pseudoetiquetas para entrenar o preanotar modelos en sensores de mayor resolución.

## Benchmarks y rendimiento

Resultados de test publicados en la model card. F1 e IoU corresponden a la clase quemada (multiplicados por 100), promediados sobre los 118 bounding boxes de test con el protocolo del artículo.

| Carpeta | Modelo | Bandas | Test F1 | Test IoU |
|---|---|---|---|---|
| `segformer_2d_earlyfusion_all` | SegFormer 2D, fusion temprana bitemporal | 21 | 66,01 | 57,43 |
| `segformer_2d_earlyfusion_subset` | SegFormer 2D, fusion temprana bitemporal | 5 | 65,83 | 56,83 |
| `convlstm_segformer_prepost_all` | ConvLSTM + SegFormer, secuencia pre/post-incendio | 21 | 68,41 | 59,29 |
| `convlstm_segformer_prepost_subset` | ConvLSTM + SegFormer, secuencia pre/post-incendio | 5 | 69,45 | 59,81 |

Medias del artículo sobre 3 semillas (17, 42, 127), para contexto:

| Configuracion | Media F1 del articulo | Checkpoint liberado |
|---|---|---|
| SegFormer 2D, 21 bandas | 65,50 | 66,01 |
| SegFormer 2D, 5 bandas | 65,73 | 65,83 |
| ConvLSTM + SegFormer, 21 bandas | 67,64 | 68,41 |
| ConvLSTM + SegFormer, 5 bandas | 68,24 | 69,45 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K y similares) por tratarse de un modelo de segmentación de imágenes.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. La model card no indica la variante de SegFormer ni el número de parámetros, por lo que no es posible estimar memoria de forma fiable.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no determinable con los datos disponibles.
- Opciones de despliegue: carga mediante PyTorch y safetensors (`safetensors.torch.load_file`) o checkpoint de PyTorch Lightning; la inferencia se ejecuta con el repositorio de código `links-ads/tmb-s3` a través de `tools/launch.py` (por ejemplo, `uv run tools/launch.py test <carpeta> -c <carpeta>/model.ckpt`). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que además no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponible.
- Dependencias de ejecución: el repositorio de código es necesario para ejecutar los modelos; los pesos por sí solos no incluyen el transform de test ni la lógica de agregación temporal.

## Comparativa con modelos similares

La información disponible solo permite comparar internamente las cuatro variantes publicadas y, de forma cualitativa, con U-Net según lo indicado en la model card (SegFormer obtiene los mejores resultados del artículo en cada configuración, empatado con U-Net en el modelo ConvLSTM con subconjunto de bandas). No se aportan cifras de U-Net ni de otros modelos de áreas quemadas, por lo que no se incluyen en la tabla.

| Variante | Parametros | Contexto temporal | Bandas | Test F1 | Test IoU | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| SegFormer 2D, fusion temprana all | no disponible | bitemporal (pre + ultima post) | 21 | 66,01 | 57,43 | MIT | publicada en HuggingFace |
| SegFormer 2D, fusion temprana subset | no disponible | bitemporal (pre + ultima post) | 5 | 65,83 | 56,83 | MIT | publicada en HuggingFace |
| ConvLSTM + SegFormer all | no disponible | secuencia completa pre/post | 21 | 68,41 | 59,29 | MIT | publicada en HuggingFace |
| ConvLSTM + SegFormer subset | no disponible | secuencia completa pre/post | 5 | 69,45 | 59,81 | MIT | publicada en HuggingFace |

Comparativa con alternativas externas de la misma categoría: no disponible.

## Limitaciones y advertencias

- Los pesos liberados no son estimaciones insesgadas del rendimiento: de cada configuración se publica la semilla con mayor F1 en test, de modo que las cifras superan las medias del artículo (65,50 / 65,73 en 2D y 67,64 / 68,24 en ConvLSTM).
- El F1 de la clase quemada se sitúa entre 65,83 y 69,45 en test, con IoU entre 56,83 y 59,81; hay una fracción relevante de área mal clasificada que conviene tener en cuenta en aplicaciones operativas.
- Modelo especializado en un único sensor y producto: Sentinel-3 OLCI (21 bandas o el subconjunto Oa21, Oa17, Oa08, Oa06, Oa04). No se documenta su comportamiento con datos de otros sensores ni con otras resoluciones o números de bandas.
- Dependencia de la entrada auxiliar ESA WorldCover y de la normalización y fusión definidas en el `config.yaml`; usar los pesos con un preprocesado distinto puede degradar los resultados.
- Dependencia del código del repositorio: los checkpoints no son autosuficientes, ya que el transform de test, la agregación temporal y el umbral de voto se implementan en `tools/launch.py`.
- La inferencia se ve afectada por hiperparámetros explícitos (`--temporal-agg last_full`, `--burnt-vote-threshold 0.5`, `--water-mask-key landcover --water-mask-value 7 8`); cambiarlos altera las métricas respecto a `test_results.csv`.
- Sesgos conocidos: no disponible. No se documenta un análisis de sesgo por región, tipo de vegetación, estación o severidad del fuego.
- Riesgo de alucinación: no aplica en el sentido de un modelo generativo, pero sí existe riesgo de falsos positivos y falsos negativos en la máscara, especialmente en superficies espectralmente similares (suelo desnudo, agua, nubes o sombras).
- Limitaciones de idioma: no aplica.
- Restricciones de licencia: los pesos y el código se distribuyen bajo MIT, lo que en principio permite uso comercial; los datos de entrenamiento quedan sujetos a las licencias indicadas en la ficha del dataset TMB-S3, que conviene revisar antes de un uso comercial.
- Inconsistencia documental: los comandos de la model card descargan desde `links-ads/tmb-s3-models`, mientras que el identificador del repositorio publicado es `links-ads/tmb-s3`; conviene verificar la ruta correcta.
- No se documentan la variante exacta de SegFormer, el número de parámetros, los requisitos de hardware ni la latencia, lo que dificulta el dimensionamiento de un despliegue en producción.
- La cita bibliográfica del artículo figura como "TBD" en la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/links-ads/tmb-s3
- Dataset TMB-S3: https://huggingface.co/datasets/links-ads/tmb-s3
- Repositorio de código (necesario para ejecutar los modelos): https://github.com/links-ads/tmb-s3
- Artículo: "Temporal Modelling for Burn Scars on Sentinel-3", Barco L., Arnaudo E., Bragagnolo A., Rossi C., Garza P., Application of Information and Communication Technologies (AICT) Conference 2026 (sin enlace disponible en la información proporcionada)
