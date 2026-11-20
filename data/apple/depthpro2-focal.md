# apple/DepthPro2-focal

## Resumen

DepthPro2-focal es un estimador de longitud focal (focal length) y campo de visión (FOV) desarrollado por Apple como componente auxiliar de la familia Depth Pro 2, un sistema de estimación de profundidad monocular métrica y temporalmente consistente. El modelo resuelve un problema concreto: cuando una fotografía o un vídeo no incluye metadatos EXIF con la distancia focal de la cámara, los modelos de profundidad métrica no pueden producir medidas en unidades absolutas (metros) sin conocer la calibración intrínseca. Este estimador predice esa longitud focal en píxeles a partir de la imagen, habilitando la inferencia métrica sobre material sin calibrar.

Con 23.455.450 parámetros (aproximadamente 23,5 M), es un modelo muy ligero diseñado para ejecutarse como módulo previo al modelo principal de profundidad (DepthPro2-H). Acepta tanto imágenes individuales como secuencias de fotogramas (tensores con forma `(T, 3, H, W)`), lo que lo hace adecuado para vídeo. Se distribuye en formato safetensors dentro de la librería `depth-pro-2` y se carga mediante `FOVEstimator.from_pretrained`.

Su relevancia radica en que elimina la dependencia de metadatos de cámara en pipelines de profundidad métrica, un requisito habitual en fotografía de consumo, vídeo de móvil o datasets web donde el EXIF suele estar ausente o ser poco fiable. La licencia es de solo uso en investigación (Apple AMLR), lo que restringe su uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo específico de estimación de FOV/longitud focal dentro de la librería `depth-pro-2`) |
| Parámetros totales | 23.455.450 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa imágenes y secuencias de fotogramas) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo visual, no lingüístico) |
| Licencia | Apple AMLR (apple-amlr), solo investigación |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de detalles publicados sobre la arquitectura interna del estimador en la información proporcionada. El modelo pertenece a la familia Depth Pro 2, cuyo trabajo técnico se titula "Depth Pro 2: Sharp and Temporally Consistent Metric Monocular Depth" (Hu, Mihajlovic, Duong, Lipson, Dong, Delaunoy, Richter, Koltun, 2026). El estimador de FOV es un componente separado del modelo principal de profundidad: se entrena y distribuye de forma independiente para predecir la longitud focal en píxeles (`f_px`) a partir de la imagen de entrada.

La API expuesta (`FOVEstimator`, `focal_length_px`) y la forma de los tensores de entrada (`(T, 3, H, W)`) indican que el modelo opera sobre RGB normalizado y admite tanto una imagen como una secuencia temporal de fotogramas, produciendo una estimación de focal por fotograma. No se han publicado en la información disponible datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o ajuste fino supervisado.

## Capacidades

- Estimación de longitud focal en píxeles a partir de una imagen RGB individual.
- Estimación de campo de visión (FOV) derivada de la focal predicha.
- Procesamiento de secuencias de vídeo: acepta tensores de forma `(T, 3, H, W)` y devuelve estimaciones por fotograma.
- Calibración de cámara implícita para habilitar la inferencia de profundidad métrica en imágenes sin EXIF.
- Integración como módulo previo al modelo principal DepthPro2-H para fotografías y vídeos sin focal conocida.
- No es un modelo de lenguaje: no soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües.

## Casos de uso

- **Profundidad métrica sobre fotos sin EXIF**: cuando una imagen carece de metadatos de distancia focal, este estimador predice `f_px` y permite que DepthPro2-H genere mapas de profundidad en metros en lugar de valores relativos. Es el caso de uso principal del modelo.
- **Vídeo de móvil sin calibración**: para clips grabados con cámaras cuyo EXIF se ha eliminado o es inconsistente, el modelo procesa la secuencia completa `(T, 3, H, W)` y aporta una focal por fotograma, habilitando reconstrucción de profundidad temporalmente consistente.
- **Pipelines de datasets web**: en la curación de datasets visuales a gran escala, muchas imágenes pierden sus metadatos; este estimador permite recuperar una calibración aproximada antes del etiquetado de profundidad.
- **Preprocesado en fotogrametría ligera**: para aplicaciones que necesitan una estimación inicial de intrínsecos antes de un ajuste bundle más costoso, el modelo ofrece un punto de partida rápido con solo 23,5 M de parámetros.
- **Reprocesado de archivos fotográficos antiguos**: fotografías digitalizadas o exportadas sin EXIF pueden calibrarse para su uso en herramientas de profundidad métrica o de efecto bokeh sintético.
- **Investigación en percepción 3D**: como bloque de calibración en estudios académicos sobre profundidad monocular, donde la licencia de solo investigación encaja con el uso previsto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a un informe técnico en arXiv cuyo identificador aparece como "TODO" y a una página de proyecto, pero no se incluyen cifras de error de focal (por ejemplo, error angular medio) ni comparativas numéricas.

## Requisitos de hardware

- **VRAM estimada**: con 23,5 M de parámetros, los pesos en bfloat16 ocupan aproximadamente 47 MB; en float32, unos 94 MB. La VRAM real dependerá de la resolución de entrada y del tamaño del lote.
- **GPU recomendadas**: cualquier GPU con soporte CUDA es suficiente; el ejemplo oficial usa `.to("cuda")` con `torch.bfloat16`. Una RTX 4090, A100 o H100 están sobradamente capacitadas; también una GPU de gama de entrada.
- **Consumer GPU**: sí, cabe holgadamente en cualquier GPU de consumo moderna e incluso en iGPU con suficiente memoria compartida, dado el reducido tamaño del modelo.
- **Despliegue**: la vía documentada es la librería `depth-pro-2` instalada desde el repositorio de GitHub (`pip install "git+https://github.com/apple-aiml-research/ml-depth-pro-2"`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo visual de este tipo).
- **Latencia y throughput**: no disponible en la información proporcionada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de estimación de focal ni datos de rendimiento que permitan una comparación rigurosa. El modelo forma parte de la familia Depth Pro 2 (existen otros tamaños bajo `apple/DepthPro2`), pero no se detallan sus especificaciones en la documentación disponible.

## Limitaciones y advertencias

- **Licencia restrictiva**: los pesos se publican bajo la Apple Machine Learning Research Model License, limitada a investigación científica no comercial y desarrollo académico. El uso comercial requiere licencia aparte.
- **Dependencia del modelo principal**: el estimador por sí solo no produce profundidad; debe combinarse con DepthPro2-H u otro modelo de profundidad métrica para el caso de uso completo.
- **Precisión de la focal**: no se han publicado métricas de error, por lo que no es posible cuantificar la fiabilidad de la estimación en distintos tipos de escena, longitudes focales o condiciones de iluminación.
- **Riesgo de estimaciones erróneas**: en imágenes con poca textura, escenas sintéticas o campos de visión extremos, la predicción de focal puede desviarse y propagar error a la profundidad métrica.
- **Sin soporte lingüístico ni de agentes**: no es un modelo de lenguaje; no admite instrucciones en lenguaje natural, tool calling ni razonamiento multi-paso.
- **Documentación incompleta**: el informe técnico enlazado apunta a un identificador arXiv pendiente ("TODO"), por lo que faltan detalles de entrenamiento, evaluación y sesgos.
- **Sesgos**: no se documentan sesgos conocidos, pero al ser un modelo visual entrenado con datos no especificados, puede heredar sesgos de distribución del dataset de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/apple/DepthPro2-focal
- Repositorio GitHub: https://github.com/apple-aiml-research/ml-depth-pro-2
- Página de proyecto: https://apple-aiml-research.github.io/ml-depth-pro-2/
- Familia completa de modelos: https://huggingface.co/apple/DepthPro2
- Licencia del modelo: https://github.com/apple-aiml-research/ml-depth-pro-2/blob/main/LICENSE_MODEL
- Informe técnico (arXiv): https://arxiv.org/abs/TODO (identificador pendiente en la información disponible)
