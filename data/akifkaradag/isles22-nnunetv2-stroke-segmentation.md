# akifkaradag/isles22-nnunetv2-stroke-segmentation

## Resumen

El modelo `akifkaradag/isles22-nnunetv2-stroke-segmentation` es un sistema de segmentación de lesiones de ictus isquémico en imágenes de resonancia magnética multimodal (DWI, ADC y FLAIR). Está desarrollado por Mehmet Akif Karadağ y se basa en nnU-Net v2, un framework de auto-configuración para segmentación biomédica. El modelo fue entrenado en el conjunto de datos ISLES 2022 (220 casos de entrenamiento y 30 casos de validación interna) y está pensado para uso exclusivo en investigación, no como herramienta clínica o diagnóstica.

La arquitectura utilizada es una U-Net 3D completa (configuración `3d_fullres`), entrenada en una sola carpeta (single fold). El repositorio en HuggingFace tiene un tamaño de 0.3 GB e incluye los pesos del checkpoint en formato PyTorch. El modelo es relevante porque ofrece una solución reproducible para la cuantificación automática de lesiones de ictus, una tarea crítica en neuroimagen para estudios retrospectivos y ensayos clínicos, y puede servir como baseline para comparar con otros algoritmos de segmentación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net 3D (nnU-Net v2, configuración `3d_fullres`) |
| Parametros totales | no disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de visión por computador) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | No aplica (modelo de visión por computador) |
| Licencia | MIT (código); dataset ISLES 2022 bajo CC BY 4.0 |
| Formato de pesos | PyTorch `.pth` (checkpoint de nnU-Net v2) |

## Arquitectura y entrenamiento

El modelo es una implementación de nnU-Net v2, un framework que auto-configura la arquitectura, el preprocesamiento y los hiperparámetros a partir de las características del dataset. En este caso se utiliza la configuración `3d_fullres`, que procesa volúmenes completos en 3D, lo que resulta adecuado para imágenes de resonancia magnética de cerebro. El entrenamiento se realizó con 220 casos del dataset ISLES 2022 y se evaluó en 30 casos de validación interna. No se menciona ningún proceso de RLHF/DPO ni ajuste por preferencias, ya que se trata de un modelo de segmentación supervisada. La innovación principal reside en el uso de nnU-Net v2, que elimina la necesidad de ajustar manualmente la arquitectura y permite obtener resultados competitivos con un mínimo de intervención humana.

## Capacidades

- Segmentación de lesiones de ictus isquémico en resonancia magnética multimodal (DWI, ADC y FLAIR).
- Generación de máscaras de segmentación 3D voxel a voxel.
- Procesamiento de volúmenes completos gracias a la configuración `3d_fullres` de nnU-Net v2.
- No soporta tool calling, function calling ni razonamiento multi-paso, al tratarse de un modelo de visión por computador.
- No tiene capacidades multilingües ni de generación de texto.
- No incluye modo de pensamiento ni procesamiento de audio o vídeo.

## Casos de uso

- Investigación retrospectiva en ictus: el modelo permite segmentar automáticamente lesiones en estudios multicéntricos, facilitando el análisis de volúmenes de lesión en grandes cohortes.
- Evaluación de respuesta a tratamiento: al cuantificar el volumen de la lesión en diferentes momentos, se puede monitorizar la evolución del paciente en el contexto de ensayos clínicos.
- Desarrollo de modelos de pronóstico: las máscaras de segmentación generadas pueden utilizarse como características de entrada en modelos que predicen el resultado funcional tras un ictus.
- Generación de anotaciones automáticas: puede emplearse para etiquetar nuevos casos de forma rápida y consistente, reduciendo el tiempo de anotación manual en proyectos de investigación.
- Educación médica: las segmentaciones visualizadas sobre las imágenes de resonancia ayudan a estudiantes y residentes a identificar la extensión de la lesión.
- Baseline en comparativas de segmentación: al ser un modelo nnU-Net v2 de una sola carpeta, sirve como referencia para evaluar nuevos algoritmos de segmentación de ictus.
- Análisis de imágenes en ensayos clínicos: la cuantificación estandarizada de lesiones puede integrarse en pipelines de análisis para estudios multicéntricos.

## Benchmarks y rendimiento

El autor reporta resultados en un conjunto de validación interno de 30 casos (no es el test oficial de ISLES 2022). Dos casos fallidos (`strokecase0046` y `strokecase0030`) reducen la media.

| Métrica | Media | Mediana |
|---|---|---|
| Dice | 0.804 | 0.861 |
| IoU | 0.702 | 0.756 |
| Hausdorff95 (mm) | 6.64 | 2.68 |

No se han publicado resultados en el conjunto de test oficial de ISLES 2022.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada.
- GPU recomendada: no disponible.
- Compatibilidad con GPU de consumo: no especificada.
- Opciones de despliegue: inferencia mediante `nnUNetv2_predict` (CLI oficial de nnU-Net v2); también se puede cargar el checkpoint en PyTorch.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se han encontrado datos comparativos con otros modelos en la información proporcionada. El modelo es un nnU-Net v2 de una sola carpeta (single fold) y no se ha evaluado en el conjunto de test oficial de ISLES 2022, por lo que no se puede establecer una comparación directa con los resultados publicados en el challenge.

## Limitaciones y advertencias

- Uso exclusivo para investigación; no es una herramienta clínica ni diagnóstica.
- Dos casos fallidos (`strokecase0046`, `strokecase0030`) reducen la media de Dice y Hausdorff95.
- Entrenamiento de una sola carpeta (single fold), lo que puede limitar la robustez frente a la variabilidad de datos.
- No evaluado en el conjunto de test oficial de ISLES 2022, por lo que el rendimiento real en datos externos es incierto.
- Posibles sesgos derivados de la composición del dataset de entrenamiento (procedencia, distribución de casos).
- Dependencia de la calidad y el protocolo de adquisición de las imágenes de entrada (DWI, ADC, FLAIR).
- La licencia MIT se aplica al código, pero el dataset ISLES 2022 tiene licencia CC BY 4.0, lo que puede implicar condiciones adicionales para su uso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/akifkaradag/isles22-nnunetv2-stroke-segmentation
- Repositorio de GitHub: https://github.com/Makifkaradag/isles22-stroke-segmentation
- Sitio del challenge ISLES 2022: http://www.isles-challenge.org/
- Dataset ISLES 2022 (Zenodo): https://doi.org/10.5281/zenodo.7153326
- Artículo del dataset ISLES 2022 (Scientific Data): https://doi.org/10.1038/s41597-022-01875-7
- Artículo de nnU-Net (Nature Methods): https://doi.org/10.1038/s41592-020-01008-z
