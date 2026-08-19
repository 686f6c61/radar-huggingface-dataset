# domenicor046/ink9um-dense-labels

## Resumen

`ink9um-dense-labels` es un conjunto de pseudo-etiquetas densas para la detección de tinta en el corpus de 9 micrómetros del Vesuvius Challenge, publicado por el usuario `domenicor046` en Hugging Face. El dataset amplía las anotaciones manuales existentes con 288,7 millones de píxeles supervisados distribuidos en 7 segmentos alineados de papiro, frente a los 5,8 millones de píxeles de las etiquetas manuales originales. Esto supone un factor de multiplicación medio de 50x respecto a la supervisión manual.

Las pseudo-etiquetas se generan ejecutando el modelo canónico de tinta de 2,4 µm sobre los volúmenes superficiales públicos de cada segmento, agrupando (pooling) el resultado a la rejilla exacta de 9,6 µm que utiliza el modelo de 9 µm, y aplicando un umbral por segmento calibrado únicamente en la región de supervisión manual de ese segmento. El resultado es un dataset con el mismo diseño y los mismos parámetros Zarr que `scrollprize/ink_9um/labels`, por lo que puede integrarse en una configuración de entrenamiento cambiando una sola ruta. La licencia declarada es MIT para los scripts y la documentación, aunque las etiquetas derivan de datos del Vesuvius Challenge y permanecen sujetas a los términos de esas fuentes.

Este dataset es relevante porque aborda la escasez de anotaciones manuales en el desafío de detección de tinta, permitiendo entrenar modelos con una supervisión mucho más densa y potencialmente mejorando la precisión en la restauración de textos antiguos. No se trata de un modelo de lenguaje ni de un modelo de visión en sí, sino de un recurso de datos de entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no aplica (dataset de pseudo-etiquetas) |
| Parametros totales | no aplica |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no aplica (dataset de imagenes, no de texto) |
| Licencia | MIT (scripts y documentacion); etiquetas sujetas a terminos del Vesuvius Challenge |
| Formato de pesos | no aplica; formato de datos: Zarr (archivos `.zarr`) |

Datos adicionales del dataset:

| Segmento | Pixeles manuales | Pixeles pseudo | Multiplicador | Cobertura del lienzo |
|---|---|---|---|---|
| pherc0139-w016 | 418.602 | 42.533.230 | 101,6x | 83,9 % |
| pherc0139-w017 | 719.008 | 42.835.355 | 59,6x | 85,0 % |
| pherc0139-w028 | 1.756.535 | 41.464.705 | 23,6x | 88,8 % |
| pherc0139-w029 | 394.114 | 41.188.859 | 104,5x | 88,2 % |
| pherc0814-46527 | 428.993 | 4.175.514 | 9,7x | 56,7 % |
| pherc1667-w028 | 844.780 | 58.012.015 | 68,7x | 81,8 % |
| pherc1667-w029 | 1.212.915 | 58.508.474 | 48,2x | 78,7 % |
| **Total** | **5.774.947** | **288.718.152** | **50,0x** | **83,2 %** |

## Arquitectura y entrenamiento

Este dataset no es un modelo entrenado, sino un conjunto de etiquetas generadas por un proceso de destilación. El procedimiento descrito en la model card consiste en:

1. Ejecutar el modelo canónico de tinta de 2,4 µm (referenciado como `scrollprize/ink_canonical_2um`) sobre cada segmento del volumen superficial público.
2. Agrupar (pooling) las predicciones a la rejilla exacta de 9,6 µm que utiliza el modelo de 9 µm para entrenar.
3. Aplicar un umbral por segmento, calibrado únicamente sobre la región de supervisión manual de ese segmento. Los umbrales específicos son: w016 0,15, w017 0,33, w028 0,27, w029 0,25, 0814 0,53, 1667-w028 0,45, 1667-w029 0,36.

Las etiquetas resultantes (`inklabels`) toman el valor de la etiqueta manual donde existe supervisión manual, y en el resto usan la salida del maestro umbralizada (`teacher >= t*`). La máscara de supervisión (`supervision_mask`) se define como render-válido Y NO máscara de validación. El contenido se limita a la capa central (middle slice), que es la única que el entrenamiento lee. Los valores son 0/255 en uint8.

No se proporcionan detalles sobre la arquitectura del modelo maestro ni sobre el proceso de entrenamiento de este dataset (no hay información sobre tokens, composición del dataset de entrenamiento, RLHF, etc.).

## Capacidades

- Proporciona pseudo-etiquetas densas de tinta para 7 segmentos de papiro del Vesuvius Challenge, con cobertura media del 83,2 % del lienzo.
- Mantiene el mismo diseño y parámetros Zarr que `scrollprize/ink_9um/labels`, lo que permite sustituir las etiquetas manuales por estas sin cambios en el código de entrenamiento.
- Incluye máscaras de validación (`validation_mask.zarr`) para tres regiones de validación retenidas, que están excluidas de la supervisión por construcción.
- Los archivos se distribuyen en un único tarball (`ink9um-dense-pseudolabels.tar`) que se descarga con `huggingface-cli` y se descomprime para obtener las carpetas por segmento.
- Los valores son binarios (0/255), listos para usar con pérdidas de tipo BCE en modelos de segmentación.

## Casos de uso

- Entrenamiento de modelos de detección de tinta en el Vesuvius Challenge: el dataset permite entrenar modelos de segmentación de tinta con una supervisión 50 veces más densa que las etiquetas manuales, lo que puede mejorar la precisión en la restauración de texto en papiros carbonizados.
- Validación de modelos de tinta: las máscaras de validación incluidas permiten evaluar el rendimiento en regiones retenidas, evitando la fuga de datos durante el entrenamiento.
- Destilación de conocimiento: el proceso de generación de pseudo-etiquetas puede servir como referencia para aplicar técnicas similares de destilación en otros dominios de imágenes médicas o arqueológicas.
- Comparación de estrategias de umbralizado: los umbrales por segmento documentados permiten estudiar cómo afecta la calibración a la calidad de las pseudo-etiquetas y al rendimiento final del modelo.
- Desarrollo de pipelines de datos para challenges científicos: el diseño modular (mismo formato que las etiquetas oficiales) facilita la integración en flujos de entrenamiento existentes.
- Investigación sobre aprendizaje con etiquetas ruidosas: al ser etiquetas derivadas de un modelo, son inherentemente ruidosas; pueden usarse para estudiar técnicas de regularización (como el `bce_label_smoothing` mencionado) o métodos de aprendizaje robusto ante ruido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de rendimiento de modelos entrenados con estas pseudo-etiquetas, ni comparaciones cuantitativas con otros datasets.

## Requisitos de hardware

No aplica directamente, ya que se trata de un dataset y no de un modelo de inferencia. Para entrenar un modelo de segmentación con estas etiquetas se requeriría una GPU con suficiente memoria para procesar los volúmenes de 9,6 µm, pero no se especifican requisitos concretos en la información proporcionada. El tamaño del repositorio es de 0,1 GB, por lo que la descarga es ligera.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables. Este dataset es específico del dominio del Vesuvius Challenge y no hay alternativas públicas equivalentes documentadas en la información proporcionada. La comparación natural sería con las etiquetas manuales originales (`scrollprize/ink_9um/labels`), que contienen 5,8 M de píxeles supervisados frente a los 288,7 M de este dataset, pero no se ofrecen métricas comparativas de rendimiento.

## Limitaciones y advertencias

- Las pseudo-etiquetas son derivadas de un modelo, no anotaciones humanas. Son más ruidosas que las etiquetas manuales, y la model card indica que el `bce_label_smoothing` de 0,5 en la receta de entrenamiento es esencial para manejar ese ruido.
- El segmento w016 es el más débil: su umbral de 0,15 es el más permisivo y marca el 28 % del lienzo como tinta. Un modelo entrenado con los siete segmentos produce letras retenidas de w016 como manchas fusionadas; excluir w016 o recalibrarlo puede mejorar los resultados.
- Las tres regiones de validación retenidas están excluidas de `supervision_mask` por construcción. Si se eliminan los archivos `validation_mask.zarr`, el entrenador producirá silenciosamente ninguna métrica de validación y ningún mejor checkpoint, pero el proceso terminará con código de salida 0.
- La licencia MIT se aplica a los scripts y la documentación, pero las etiquetas derivan de datos del Vesuvius Challenge (`scrollprize/ink_9um`, `scrollprize/ink_canonical_2um` y el bucket S3 de datos abiertos) y permanecen sujetas a los términos de esas fuentes. Es necesario revisar esos términos antes de usar el dataset en producción o con fines comerciales.
- No hay información sobre idiomas, ya que el dataset es de imágenes, no de texto.

## Enlaces

- Hugging Face: https://huggingface.co/domenicor046/ink9um-dense-labels
- Repositorio de código y resultados: https://github.com/DomRusso2/ink9um-dense
