# haroonx02/satellite-landuse-multispectral

## Resumen

El repositorio `haroonx02/satellite-landuse-multispectral` agrupa dos modelos de visión por computador para teledetección desarrollados por haroonx02: un clasificador de usos del suelo sobre parches Sentinel-2 (EuroSAT) y un modelo de detección de cambios de edificaciones con arquitectura siamesa (LEVIR-CD). Ambos se distribuyen como checkpoints de PyTorch y como exportaciones ONNX en FP16 e INT8, con código de entrenamiento, ablación de bandas y evaluación publicados en un repositorio de GitHub.

El clasificador parte de una ResNet-18 preentrenada en ImageNet a la que se le reconstruye la primera convolución para aceptar 13 bandas espectrales de Sentinel-2 L1C, y se entrena durante 8 épocas sobre parches de 64×64 píxeles. La variante `eurosat_all13` alcanza una precisión de 0,9874 en el split de test del autor, mientras que la variante solo RGB llega a 0,9831. El modelo de cambios emplea una U-Net siamesa con codificador ResNet-18 compartido y concatenación de la diferencia absoluta de características en cada escala, con un F1 de 0,8895 sobre LEVIR-CD.

La relevancia práctica del proyecto reside en la combinación de pesos ligeros (11-57 MB), exportaciones ONNX cuantizadas listas para despliegue en entornos con recursos limitados y una cadena de preprocesado integrada en el grafo (escalado, selección de bandas, estandarización y softmax), lo que simplifica la integración en pipelines de observación de la Tierra. La licencia es MIT para el código y los pesos del clasificador, pero los pesos del modelo de cambios quedan restringidos a uso académico por la licencia del dataset LEVIR-CD.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificador: ResNet-18 con primera convolución reconstruida para 13 bandas. Cambios: U-Net siamesa con codificador ResNet-18 compartido y diferencia absoluta multi-escala |
| Parametros totales | No disponible (checkpoints de 45 MB y 57 MB en FP32) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión; entrada 64×64 para clasificación y 256×256 para cambios) |
| Tipos de cuantizacion | FP32 (PyTorch), FP16 (ONNX), INT8 estático QDQ per-channel (ONNX) |
| Idiomas soportados | No disponible (no procesa texto) |
| Licencia | MIT para código y pesos del clasificador; pesos del modelo de cambios solo para uso académico/investigación (LEVIR-CD) |
| Formato de pesos | PyTorch (`state_dict` en `.pt`), ONNX (FP16 e INT8) |

## Arquitectura y entrenamiento

El clasificador es una ResNet-18 preentrenada en ImageNet cuya primera capa convolucional se reconstruye para aceptar 13 canales correspondientes a las bandas B01…B12 y B8A de Sentinel-2 L1C. Se entrena durante 8 épocas sobre parches de 64×64 píxeles de EuroSAT, con 10 clases de uso del suelo (AnnualCrop, Forest, HerbaceousVegetation, Highway, Industrial, Pasture, PermanentCrop, Residential, River, SeaLake). Existe una variante entrenada solo con las bandas rojo, verde y azul, que selecciona B04, B03 y B02 internamente a partir de la misma entrada de 13 bandas. El checkpoint incluye la lista de bandas, las estadísticas de normalización y la configuración, y el grafo ONNX incorpora el escalado, la selección de bandas, la estandarización con las estadísticas de entrenamiento y el softmax.

El modelo de cambios es una U-Net siamesa con codificador ResNet-18 compartido entre las dos fechas; el decodificador recibe en cada escala la diferencia absoluta de características |f_before − f_after|. Se entrena durante 10 épocas sobre los mosaicos de 256 píxeles del split oficial de entrenamiento de LEVIR-CD. La simetría del diseño garantiza que intercambiar las fechas produzca el mismo mapa de cambios. La cuantización INT8 estática (QDQ, per-channel) se calibra con 256 parches de entrenamiento para el clasificador y 64 mosaicos para el modelo de cambios; el escalado de entrada y las capas posteriores a la última convolución se mantienen en coma flotante porque cuantizar la entrada cruda de 13 bandas con una sola escala de 8 bits (pasos de ~110 DN) borra la banda de cirros y reduce la precisión a 0,866.

## Capacidades

- Clasificación de uso del suelo en 10 clases a partir de parches multiespectrales Sentinel-2 de 64×64 píxeles.
- Clasificación con las 13 bandas L1C o solo con RGB, con el mismo formato de entrada de 13 bandas.
- Detección de cambios de edificaciones entre dos imágenes bitemporales de 256×256 píxeles, con salida de probabilidad por píxel.
- Modelo de cambios simétrico respecto al orden temporal de las imágenes.
- Preprocesado integrado en el grafo ONNX: escalado de reflectancia, selección de bandas, estandarización y softmax.
- Exportaciones ONNX en FP16 e INT8 para despliegue en CPU y entornos con memoria limitada.
- No soporta tool calling, agentes, texto ni otros idiomas: es exclusivamente un modelo de visión.

## Casos de uso

- Monitorización agrícola: clasificación de parcelas en categorías como cultivo anual, pastizal o cultivo permanente a partir de parches Sentinel-2, con la variante de 13 bandas para aprovechar el infrarrojo cercano y mejorar la separación entre clases vegetales.
- Cartografía de usos del suelo a escala regional: inferencia por mosaicos de 64×64 con la exportación INT8 de 11 MB, adecuada para procesar grandes volúmenes de teselas en CPU sin GPU dedicada.
- Detección de urbanización irregular: comparación de ortoimágenes bitemporales con el modelo siames y umbral de 0,5 sobre el mapa de probabilidad para localizar nuevas edificaciones.
- Seguimiento de cambios tras eventos: evaluación de daños o reconstrucción comparando imágenes antes y después de un episodio, aprovechando la simetría del modelo para no depender del orden de las fechas.
- Validación de pipelines de teledetección: uso de los checkpoints y del código de evaluación del repositorio como referencia para comparar preprocesados, selección de bandas y recetas de cuantización.
- Despliegue en el navegador o en el borde: la demo pública y las exportaciones ONNX permiten ejecutar la clasificación en el cliente sin infraestructura de servidor.
- Filtrado previo en catálogos de imágenes: clasificación rápida de teselas para descartar escenas sin interés (por ejemplo, mar o bosque) antes de análisis más costosos.

## Benchmarks y rendimiento

| Modelo / fichero | Tarea | Metrica | Resultado |
|---|---|---|---|
| `eurosat_all13.pt` | EuroSAT, 13 bandas | Accuracy (test, 5.400 parches) | 0,9874 |
| `eurosat_rgb.pt` | EuroSAT, RGB | Accuracy | 0,9831 |
| `onnx/eurosat_all13_fp16.onnx` | EuroSAT, 13 bandas | Accuracy | 0,9874 |
| `onnx/eurosat_all13_int8.onnx` | EuroSAT, 13 bandas | Accuracy | 0,9876 |
| `onnx/eurosat_rgb_int8.onnx` | EuroSAT, RGB | Accuracy | 0,9822 |
| `levircd_absdiff.pt` | LEVIR-CD | F1 clase cambio (píxeles agrupados) | 0,8895 |
| `onnx/levircd_siamese_fp16.onnx` | LEVIR-CD | F1 | 0,8895 |
| `onnx/levircd_siamese_int8.onnx` | LEVIR-CD | F1 | 0,8895 |

El autor advierte de que el split de EuroSAT es aleatorio y puede incluir parches de la misma zona en entrenamiento y test, lo que favorece a todos los modelos, y de que el espejo de LEVIR-CD en Hugging Face almacena JPEG, por lo que los resultados no son directamente comparables con los de los artículos.

## Requisitos de hardware

- Clasificador: 45 MB en FP32, 22 MB en ONNX FP16 y 11 MB en ONNX INT8; cabe holgadamente en cualquier GPU consumer y en CPU.
- Modelo de cambios: 57 MB en FP32, 29 MB en ONNX FP16 y 15 MB en ONNX INT8; también cabe en GPU consumer de gama baja.
- VRAM estimada: no disponible de forma explícita; por el tamaño de los pesos, el clasificador requiere menos de 1 GB incluso con lotes moderados, y el modelo de cambios con entrada de 256×256 requiere una fracción pequeña de memoria en tarjetas de 4-8 GB.
- GPU recomendadas: cualquier GPU con soporte CUDA (RTX 3060 en adelante) es suficiente; para CPU, las exportaciones INT8 son la opción preferente.
- Despliegue: PyTorch nativo, ONNX Runtime (CPU o GPU) y cualquier runtime compatible con ONNX; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de visión.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tarea | Parametros | Contexto/entrada | Rendimiento | Licencia |
|---|---|---|---|---|---|
| Este proyecto (EuroSAT all13) | Clasificación de uso del suelo | ResNet-18 (~11,7 M teóricos, no confirmado en la ficha) | 64×64, 13 bandas | 0,9874 accuracy (split propio) | MIT |
| Este proyecto (LEVIR-CD) | Detección de cambios | U-Net siamesa ResNet-18 (no disponible) | 256×256, RGB | F1 0,8895 | Solo investigación |
| Alternativas de la misma categoría | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks de modelos alternativos en la información proporcionada, por lo que la comparativa cuantitativa con otros clasificadores EuroSAT o modelos de cambio como BIT o ChangeFormer no puede establecerse aquí.

## Limitaciones y advertencias

- El split de EuroSAT es aleatorio y puede filtrar parches de la misma zona entre entrenamiento y test, lo que infla las métricas reportadas.
- El espejo de LEVIR-CD en Hugging Face usa JPEG, por lo que los resultados no son comparables con los de los artículos originales.
- El modelo de cambios se entrenó con LEVIR-CD, cuyo uso es académico; los pesos `levircd_absdiff.pt` y `levircd_siamese_*` deben tratarse como solo para investigación y no para uso comercial.
- La cuantización INT8 de la entrada cruda de 13 bandas degrada gravemente la precisión (0,866); el autor mantiene el escalado de entrada en coma flotante para evitarlo.
- El clasificador está limitado a 10 clases de EuroSAT y a parches de 64×64; no generaliza a otras taxonomías sin reentrenamiento.
- El modelo de cambios espera entradas RGB normalizadas en [0, 1] y mosaicos de 256×256; no procesa bandas multiespectrales adicionales.
- No hay información sobre sesgos geográficos o temporales de los datos de entrenamiento más allá de la procedencia de EuroSAT y LEVIR-CD.
- Riesgo de alucinación no aplica en el sentido de modelos generativos, pero sí existe riesgo de falsos positivos y negativos en la detección de cambios, especialmente con diferencias de iluminación, estación o registro entre fechas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado en Hugging Face; la validación externa es escasa.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/haroonx02/satellite-landuse-multispectral)
- [Código de entrenamiento y evaluación en GitHub](https://github.com/haroonkhan02/satellite-landuse-multispectral)
- [Demo en navegador (Hugging Face Spaces)](https://huggingface.co/spaces/haroonx02/satellite-landuse-browser)
- Referencia del dataset EuroSAT: Helber et al., IEEE JSTARS 2019 (MIT)
- Referencia del dataset LEVIR-CD: Chen & Shi, Remote Sensing 2020 (uso académico)
