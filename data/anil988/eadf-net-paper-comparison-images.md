# anil988/EADF-Net-Paper-Comparison-Images

## Resumen

Este repositorio no contiene un modelo de lenguaje ni pesos de red neuronal, sino el material visual suplementario del articulo "EADF-Net: Edge-Aware Dual-Stream Feature Fusion Network for Remote Sensing Semantic Segmentation". Lo publica el usuario anil988 en Hugging Face y su funcion es alojar las comparaciones cualitativas de alta resolucion y las mascaras de evaluacion del benchmark LoveDA (Land-cOVE Domain Adaptation, NeurIPS 2021) empleadas en dicho articulo.

El contenido se organiza en diez escenas aereas de alta resolucion del split de validacion de LoveDA, sus mascaras de ground truth oficiales, las predicciones de tres modelos (SegFormer-B5, D2LS y el propio EADF-Net) y paneles compuestos lado a lado a 300 DPI, ademas de un ZIP de 48 MB con todo el material. La relevancia es acotada: sirve para inspeccionar visualmente la calidad de segmentacion semantica en teledeteccion, no para ejecutar inferencia.

No hay informacion sobre arquitectura interna, numero de parametros, contexto, cuantizaciones ni idiomas, porque el repositorio no es un modelo ejecutable. Cualquier dato de rendimiento cuantitativo del modelo EADF-Net debe consultarse en el paper original o en el repositorio de pesos `anil988/EADF-Net-LoveDA-CHAMPION`, no en este.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (repositorio de imagenes, no de pesos) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (PNG de imagenes y mascaras; ZIP de 48 MB) |

## Arquitectura y entrenamiento

El repositorio no documenta arquitectura ni proceso de entrenamiento. La model card unicamente identifica el modelo EADF-Net como una "Edge-Aware Dual-Stream Feature Fusion Network", es decir, una red de dos flujos con fusion de caracteristicas y componente de atencion a bordes, orientada a segmentacion semantica de imagenes aereas. No se detallan el backbone, el numero de parametros, los tokens de entrenamiento, la composicion del dataset ni si hubo tecnicas de ajuste fino como RLHF o DPO (no aplicables en este dominio).

El benchmark de evaluacion es LoveDA, con siete clases semanticas (Background, Building, Road, Water, Barren, Forest, Agriculture) y una clase Void para bordes no validos, con paleta RGB explicita en la model card. Las comparaciones incluyen SegFormer-B5 (referencia ViT de NeurIPS 2021) y D2LS (Dynamic Dictionary Learning, presentado como SOTA en ICCV 2025). No se aportan detalles de hiperparametros, aumentos de datos ni estrategia de entrenamiento en la informacion disponible.

## Capacidades

- Almacenamiento de visualizaciones cualitativas de segmentacion semantica sobre imagenes aereas de LoveDA.
- Distribucion de mascaras de ground truth oficiales del benchmark para diez escenas de validacion.
- Publicacion de predicciones de tres modelos comparados: SegFormer-B5, D2LS y EADF-Net.
- Generacion de paneles comparativos lado a lado a 300 DPI (Figura 7 del paper).
- Descarga masiva mediante `snapshot_download` de la libreria `huggingface_hub`.
- Empaquetado en un unico ZIP de 48 MB con todas las escenas, mascaras y paneles.
- No soporta generacion de texto, razonamiento, codigo, tool calling, agentes ni capacidades multilingues: no es un modelo de lenguaje.

## Casos de uso

- Revision de resultados de investigacion: un revisor o lector del paper puede descargar los paneles de la Figura 7 y verificar visualmente las diferencias entre SegFormer-B5, D2LS y EADF-Net en las mismas escenas.
- Reproduccion de figuras: los autores o terceros pueden reutilizar los PNG a 300 DPI para generar versiones de camara lista o presentaciones sin reejecutar la inferencia.
- Auditoria de predicciones: las carpetas `03_SegFormer`, `04_D2LS` y `05_EADF_Net_Ours` permiten inspeccionar mascaras individuales por escena y detectar errores sistematicos (por ejemplo, confusion entre Barren y Agriculture).
- Docencia en teledeteccion: el material sirve para ilustrar en clase la diferencia entre ground truth manual y predicciones de distintos paradigmas (ViT frente a fusion dual-stream).
- Construccion de datasets de comparacion: las mascaras y escenas pueden emplearse como base para experimentos propios de segmentacion semantica sobre LoveDA, siempre citando la fuente original.
- Verificacion de claims cualitativos: si un articulo afirma mejoras en bordes de edificios o carreteras, estos paneles permiten contrastar la afirmacion con evidencia visual concreta.
- Distribucion ligera de material suplementario: el ZIP de 48 MB facilita compartir el material sin depender del repositorio completo de 0,3 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye comparaciones visuales cualitativas; no presenta valores numericos de mIoU, accuracy por clase ni metricas de LoveDA para EADF-Net, SegFormer-B5 o D2LS.

## Requisitos de hardware

- No requiere GPU para su uso previsto: el repositorio contiene imagenes PNG y un ZIP, no pesos de red neuronal.
- Espacio en disco: aproximadamente 0,3 GB para el repositorio completo; 48 MB para el ZIP `paper_visualizations_loveda.zip`.
- Para visualizar los paneles a 300 DPI se recomienda un monitor con al menos 1920x1080 y un visor de imagenes que soporte zoom sin perdida.
- No aplica despliegue con vLLM, llama.cpp, Ollama ni TGI, ya que no hay modelo ejecutable.
- Para ejecutar inferencia real con EADF-Net habria que acudir al repositorio de pesos `anil988/EADF-Net-LoveDA-CHAMPION` y a los requisitos de hardware de dicho repositorio, no documentados aqui.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Repositorio | Tipo de contenido | Modelo evaluado | Licencia | Disponibilidad |
|---|---|---|---|---|
| anil988/EADF-Net-Paper-Comparison-Images | Imagenes y mascaras de comparacion | EADF-Net, SegFormer-B5, D2LS | MIT | Publico en Hugging Face |
| IgorNer/segformer-b5-loveda | Pesos del modelo SegFormer-B5 para LoveDA | SegFormer-B5 | no disponible | Publico en Hugging Face |
| XavierJiezou/d2ls-models | Pesos del modelo D2LS | D2LS (ICCV 2025) | no disponible | Publico en Hugging Face |
| anil988/EADF-Net-LoveDA-CHAMPION | Pesos del modelo EADF-Net | EADF-Net | no disponible | Publico en Hugging Face |

La comparativa es estructural, no de rendimiento: este repositorio no contiene pesos y por tanto no es directamente comparable en parametros, contexto o metricas con los otros tres.

## Limitaciones y advertencias

- No es un modelo: no se puede cargar con `transformers`, `timm` ni ninguna libreria de inferencia; solo contiene imagenes y mascaras.
- Solo cubre diez escenas del split de validacion de LoveDA; no es representativo de la totalidad del benchmark ni de otros dominios de teledeteccion.
- Las predicciones mostradas corresponden a una unica ejecucion de cada modelo; no se documentan semillas, checkpoints exactos ni configuracion de inferencia.
- La seleccion de escenas puede introducir sesgo de seleccion favorable al modelo propuesto; no hay analisis de casos fallidos.
- Las mascaras de ground truth de LoveDA tienen limitaciones conocidas (clase Void en bordes, posible ambiguedad entre clases agricolas y barren).
- Licencia MIT permite uso comercial y modificacion, pero se debe citar el paper original y respetar las licencias de los modelos de terceros cuyas predicciones se incluyen (SegFormer-B5, D2LS).
- El repositorio registra cero descargas y cero likes en el momento de la consulta, por lo que no hay validacion comunitaria de su contenido.
- Riesgo de alucinacion no aplicable (no genera texto); el riesgo equivalente es interpretar las comparaciones visuales como evidencia cuantitativa, cuando no lo son.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/anil988/EADF-Net-Paper-Comparison-Images
- Descarga directa del ZIP (48 MB): https://huggingface.co/anil988/EADF-Net-Paper-Comparison-Images/resolve/main/paper_visualizations_loveda.zip?download=true
- Figura 7 (panoramica cualitativa): https://huggingface.co/anil988/EADF-Net-Paper-Comparison-Images/resolve/main/06_composite_panels/figure_7_qualitative_comparison_overview.png
- Pesos de EADF-Net: https://huggingface.co/anil988/EADF-Net-LoveDA-CHAMPION
- Pesos de SegFormer-B5 para LoveDA: https://huggingface.co/IgorNer/segformer-b5-loveda
- Pesos de D2LS: https://huggingface.co/XavierJiezou/d2ls-models
- Benchmark LoveDA (NeurIPS 2021): no disponible en la informacion proporcionada
- Paper EADF-Net: no disponible en la informacion proporcionada
