# qurit-lab/TMTV-Net

## Resumen

TMTV-Net es un modelo de segmentación de imágenes médicas desarrollado por el grupo QuRiT (Quantitative Radiomics Imaging Tools) del BC Cancer Research Centre en Vancouver, Canadá. Su propósito es automatizar la segmentación del volumen metabólico tumoral total (TMTV) en imágenes PET/CT de pacientes con linfoma, una tarea que tradicionalmente requiere delineación manual por parte de especialistas en medicina nuclear y que resulta costosa y variable entre observadores.

El modelo se basa en arquitecturas de deep learning para segmentación de imágenes médicas y ha sido validado en múltiples centros externos con distintos subtipos de linfoma, incluyendo Hodgkin y linfoma difuso de células B grandes (DLBCL). Su relevancia radica en que el TMTV es un biomarcador pronóstico importante en el manejo del linfoma, y su cálculo automatizado permite integrarlo en flujos clínicos de forma reproducible. El modelo se distribuye mediante un contenedor Docker que encapsula el entorno completo de inferencia, y el código está disponible en GitHub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Deep learning de segmentación (arquitectura exacta no disponible; basada en Torch Research Workflows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no aplica (modelo de visión médica, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de imagen, no lingüístico) |
| Licencia | Solo uso investigador. Prohibido uso comercial |
| Formato de pesos | Archivos `.model` (PyTorch), distribuidos via Google Drive |

## Arquitectura y entrenamiento

La arquitectura interna de TMTV-Net no está documentada en detalle en la información pública disponible. Se sabe que emplea técnicas de deep learning para segmentación de imágenes médicas y se apoya en el framework Torch Research Workflows para su implementación. El entrenamiento se realizó con datos de PET/CT de pacientes de linfoma, con un preprocesamiento que incluye la conversión de archivos NIfTI a formato HDF5 y la actualización reciente del método de conversión de valores SUV (Standardized Uptake Value) en la fase de preprocesamiento.

El modelo fue validado en datasets externos multicéntricos, con una reducción del rendimiento de solo un 2% respecto a los datos de entrenamiento, lo que indica una buena generalización entre centros y subtipos de enfermedad. No se ha publicado información sobre el número exacto de parámetros, el número de capas, o si se emplearon técnicas como atención, transformadores o redes convolucionales específicas.

## Capacidades

- Segmentación automática de TMTV en imágenes PET/CT de pacientes de linfoma, sin intervención manual.
- Generalización multicentro: validado en múltiples datasets externos con distintos protocolos de adquisición.
- Adaptabilidad a subtipos de linfoma, incluyendo Hodgkin y DLBCL.
- Inferencia reproducible mediante contenedor Docker, con entrada de DICOM y salida de segmentación.
- Integración en flujos de investigación clínica como biomarcador cuantitativo de imagen.
- No es un modelo de lenguaje: no genera texto, código, ni soporta tool calling o razonamiento lingüístico.

## Casos de uso

- Cuantificación del TMTV como biomarcador pronóstico en linfoma: el modelo permite calcular el volumen metabólico tumoral total de forma automática, un valor que se correlaciona con la supervivencia y la respuesta al tratamiento en pacientes con linfoma.
- Evaluación multicéntrica de generalizabilidad: la robustez del modelo frente a datos de distintos centros (solo un 2% de pérdida de rendimiento) lo hace adecuado para estudios colaborativos que necesiten aplicar la misma segmentación en cohortes heterogéneas.
- Investigación en medicina nuclear: integración en pipelines de análisis de imágenes PET/CT para estudios retrospectivos de correlación entre TMTV y resultados clínicos.
- Validación de nuevas terapias: en ensayos clínicos donde el TMTV se usa como criterio de respuesta al tratamiento, el modelo permite estandarizar la medición y reducir la variabilidad inter-observador.
- Formación de radiólogos y médicos nucleares: como herramienta de referencia automática para comparar delineaciones manuales y mejorar la consistencia en la práctica clínica.
- Análisis de imagen en cohortes retrospectivas: procesamiento de grandes volúmenes de datos históricos de PET/CT para reanalizar la relación entre TMTV y outcomes sin necesidad de delineación manual.

## Benchmarks y rendimiento

El artículo original publica resultados de rendimiento con el coeficiente de Dice (DSC) y el error relativo de TMTV en casos concretos de evaluación externa:

| Métrica | Valor |
|---|---|
| DSC (caso Hodgkin, centro externo) | 0.83 |
| Error relativo TMTV (caso Hodgkin) | 0.18 |
| DSC (caso DLBCL, centro externo) | 0.66 |
| Error relativo TMTV (caso DLBCL) | 0.10 |
| DSC (caso Hodgkin, otro centro) | 0.76 |
| DSC (caso DLBCL, otro centro) | 0.67 |
| Reducción de rendimiento en datos externos | 2% |

No se han publicado resultados de benchmarks comparativos con otros modelos de segmentación en la información disponible. Los valores DSC se muestran en la Figura 1 de la publicación y representan casos individuales, no medias de cohortes.

## Requisitos de hardware

- Inferencia mediante contenedor Docker; se requiere una máquina con Docker instalado (Linux o WSL2 en Windows).
- Se recomienda una GPU con memoria suficiente para procesar volúmenes PET/CT completos; no se han publicado requisitos exactos de VRAM.
- El tamaño del repositorio es de 0.3 GB, que incluye el código de inferencia; los pesos del modelo se descargan por separado desde Google Drive.
- No se han documentado opciones de despliegue específicas (vLLM, TGI, etc.) ya que no es un modelo de lenguaje; el despliegue se realiza exclusivamente mediante el Dockerfile incluido.
- La latencia y el throughput dependen del hardware y del tamaño de los volúmenes de entrada; no se han publicado cifras estimadas.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparativas con otros modelos de segmentación de TMTV en PET/CT. El artículo publicado en EJNMMI podría contener dichas comparativas, pero no están en el material disponible.

## Limitaciones y advertencias

- Licencia restrictiva: el modelo está destinado exclusivamente a uso investigativo; el uso comercial está prohibido explícitamente.
- Los pesos del modelo no se alojan en HuggingFace, sino en Google Drive, lo que implica una dependencia de un servicio externo y una verificación manual de la integridad de los archivos.
- El modelo requiere una estructura de carpetas específica para el input/output (carpetas de CT y PET con DICOMs) y una configuración manual de montajes de volumen en Docker, lo que puede ser un obstáculo para usuarios sin experiencia con contenedores.
- No se proporcionan métricas agregadas de rendimiento (medias, desviaciones) en la información pública; los valores publicados son casos ilustrativos.
- La segmentación puede fallar en casos atípicos o con artefactos de imagen, como sugiere la variación de DSC entre casos (0.66 a 0.83).
- No se documentan sesgos específicos, pero la generalización a otros subtipos de linfoma o a equipos de adquisición muy diferentes no está garantizada.
- El modelo no está diseñado para uso clínico directo sin validación adicional y supervisión de un especialista.

## Enlaces

- HuggingFace: https://huggingface.co/qurit-lab/TMTV-Net
- GitHub (repo principal): https://github.com/qurit-frizi/TMTV-Net
- GitHub (documentación): https://github.com/qurit-frizi/TMTV-Net/tree/main
- Publicación original (PubMed): https://pubmed.ncbi.nlm.nih.gov/38326655/
- DOI del artículo: 10.1007/s00259-024-06616-x
- Zenodo DOI: https://zenodo.org/doi/10.5281/zenodo.12813295
- Documento PDF del artículo (HUG): https://www.hug.ch/sites/interhug/files/structures/pinlab/documents/ejnmmi2024_segm.pdf
