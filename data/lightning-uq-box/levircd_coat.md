# lightning-uq-box/levircd_coat

## Resumen

levircd_coat es un conjunto de pesos publicado por el proyecto lightning-uq-box para un modelo de deteccion binaria de cambios (change detection) sobre el dataset LEVIR-CD+, acompanado de cuatro redes de umbral (threshold networks) basadas en los metodos AT y COAT para prediccion conformal. El modelo base es una U-Net siamesa cuyo encoder es `convnext_base.dinov3_lvd1689m` de timm (un ConvNeXt-B destilado de DINOv3), mantenido congelado durante el entrenamiento; las capas de fusion, el decodificador U-Net y la cabeza de segmentacion suman 7.876.201 parametros y se distribuyen en `base_trainable.safetensors`. Los pesos del encoder no se redistribuyen en este repositorio.

El proposito del repositorio es reproducible la parte practica del tutorial *Conformal Change Detection with AT and COAT*: dado un par de imagenes de satelite de la misma zona en dos instantes, el modelo base produce un mapa de probabilidad de cambio y las redes de umbral (ResNet-50 que reciben el par de imagenes de seis canales junto al mapa de probabilidad) predicen un umbral por par de imagenes. La calibracion conformal no esta incluida y debe realizarse sobre imagenes reservadas antes de la evaluacion.

Su relevancia es doble. Por un lado, ofrece un punto de partida entrenado y evaluado para deteccion de cambios en LEVIR-CD+ con F1 0.846 e IoU 0.733 en el split de test oficial. Por otro, sirve como material de referencia para investigacion en cuantificacion de incertidumbre y prediccion conformal aplicada a teledeteccion, con resultados reportados sobre cinco divisiones aleatorias de calibracion/test. El repositorio ocupa 0,5 GB y no registra descargas ni likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net siamesa con encoder ConvNeXt-B (`convnext_base.dinov3_lvd1689m`, congelado); fusion por nivel mediante diferencia y diferencia absoluta seguidas de convolucion 1x1; decodificador U-Net y cabeza de segmentacion. Redes de umbral: ResNet-50 (`ThresholdPredictor`) |
| Parametros totales | 7.876.201 parametros en los pesos liberados (fusion + decodificador + cabeza). Los parametros del encoder no se incluyen en el repositorio; el total con encoder no esta indicado en la informacion disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: modelo de vision. Entrada de 512 x 512 px (recorte central en evaluacion; recorte aleatorio de 512 x 512 en entrenamiento) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos en safetensors y checkpoints de Lightning sin cuantizar) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 para los archivos del repositorio. Los pesos del encoder no se redistribuyen y su uso requiere aceptar la licencia DINOv3. LEVIR-CD+ tampoco se redistribuye |
| Formato de pesos | safetensors (`base_trainable.safetensors`) y checkpoints de PyTorch Lightning (`.ckpt`) para las redes de umbral |

## Arquitectura y entrenamiento

El modelo base es una U-Net siamesa: el mismo encoder se aplica por separado a cada adquisicion y los mapas de caracteristicas de ambas se fusionan nivel a nivel mediante diferencia y diferencia absoluta, seguidas de una convolucion 1x1, antes de pasar al decodificador U-Net. El encoder es `convnext_base.dinov3_lvd1689m`, la variante ConvNeXt-B destilada de DINOv3, y se mantuvo congelado durante todo el entrenamiento. Este encoder fue preentrenado con imagenes web (LVD-1689M), no con imagenes de satelite, y las entradas usan normalizacion ImageNet. Los pesos del encoder se descargan de su fuente original al construir el modelo y no forman parte de este repositorio.

El entrenamiento uso 437 pares de imagenes del split oficial de entrenamiento de LEVIR-CD+, un recorte aleatorio de 512 x 512 por par con volteos horizontal y vertical, entropia cruzada binaria y optimizador Adam con beta = (0,5, 0,99), tamano de lote 24 durante 200 epocas, con la tasa de aprendizaje mantenida durante 100 epocas y despues decaida linealmente hasta cero. Se entrenaron cuatro tasas de aprendizaje (1e-4, 3e-4, 1e-3 y 3e-3); el modelo liberado (1e-3) fue el de mayor F1 sobre un conjunto separado de 100 pares de entrenamiento tras la ultima epoca, decision tomada antes de puntuar ninguna imagen de test. Sobre el split de test oficial completo (348 pares, recorte central de 512 x 512, umbral 0,5) el modelo liberado obtiene F1 0,846 e IoU 0,733, y las cuatro tasas de aprendizaje se mueven entre 0,8437 y 0,8461 de F1 en test.

Las redes de umbral emplean el `ThresholdPredictor` de la libreria, una ResNet-50 que recibe el par de imagenes de seis canales junto al mapa de probabilidad del modelo base (`threshold_in_channels=6`). Se entrenaron sobre los 100 pares de entrenamiento que el modelo base no vio: AT durante 30 epocas (tasa 1e-4, lote 24) y COAT durante 60 epocas (tasa 5e-4, lote 64, temperatura 0,05). Los checkpoints se cargan con el modelo base suministrado, por ejemplo `COAT.load_from_checkpoint(path, model=base_model, pretrained_threshold_net=False, strict=False)`, donde `strict=False` es obligatorio porque los pesos congelados del encoder se omiten en el checkpoint. De los 637 pares oficiales de entrenamiento, 437 entrenan el modelo base, 100 entrenan las redes de umbral y 100 quedan sin usar; el split de test oficial (348 pares) se divide en 100 de calibracion y 248 de test, de modo que calibracion y test provienen de la misma poblacion.

## Capacidades

- Deteccion binaria de cambios en pares de imagenes aereas o satelitales bitemporales de la misma zona, con salida de mapa de probabilidad y mascara de cambio.
- Segmentacion a nivel de pixel de zonas modificadas (edificacion nueva, superficies, cambios de uso del suelo) en recortes de 512 x 512 px.
- Prediccion de un umbral por par de imagenes mediante las redes AT y COAT, con dos niveles de riesgo configurados (alpha = 0,1 y alpha = 0,2).
- Soporte de prediccion conformal: el flujo del tutorial calibra cada red de umbral sobre imagenes reservadas y despues lo evalua, con control marginal de la tasa de falsos negativos promediada sobre las imagenes de test.
- Integracion con PyTorch Lightning y la libreria lightning-uq-box, lo que permite reutilizar el modelo dentro de los flujos de cuantificacion de incertidumbre de la libreria.
- Evaluacion reproducible sobre LEVIR-CD+, con `splits.json` documentando las particiones y resultados agregados sobre cinco divisiones aleatorias de calibracion/test.
- No dispone de soporte de tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingues ni modos de pensamiento: es un modelo de vision especializado de un unico dominio de tarea.

## Casos de uso

- Monitorizacion de expansion urbana: dado un par de imagenes de la misma zona en dos fechas, el modelo produce una mascara de cambio que permite cuantificar la superficie de nueva edificacion por recorte de 512 x 512, con F1 0,846 en el split de test oficial de LEVIR-CD+.
- Deteccion de cambios de cobertura del suelo para estudios ambientales: la U-Net siamesa fusiona ambos instantes a nivel de caracteristicas, lo que permite localizar transiciones de vegetacion o superficies artificiales en imagenes de alta resolucion.
- Evaluacion de danos tras catastrofes: comparando imagenes previas y posteriores a una inundacion o incendio, el mapa de probabilidad puede priorizar las zonas con cambios para revision humana.
- Actualizacion de cartografia y bases de datos catastrales: el modelo puede prefiltrar los recortes con cambios reales antes de que un operador valide la actualizacion, reduciendo el volumen de revision manual.
- Investigacion en prediccion conformal aplicada a teledeteccion: el repositorio incluye las redes AT y COAT y los resultados sobre cinco divisiones de calibracion, lo que permite comparar metodos con el mismo modelo base como referencia.
- Auditoria de pipelines de cuantificacion de incertidumbre: el tutorial permite calibrar y evaluar la cobertura de cada metodo; los resultados reportados muestran que alpha = 0,1 y alpha = 0,2 dan coberturas de 0,899-0,905 y 0,785-0,788 respectivamente, utiles para fijar expectativas de falsos negativos.
- Control de calidad en produccion cartografica: la columna de "predicted foreground" y el recuento de umbrales recortados a cero permiten detectar recortes problematicos antes de tomar decisiones automaticas.
- Docencia y reproduccion de experimentos: al incluir `splits.json`, el registro de entrenamiento `logs/base_lr1e-3_metrics.csv` y `series_summary.csv`, sirve como ejemplo completo de entrenamiento y evaluacion de un modelo de change detection con umbrales conformales.

## Benchmarks y rendimiento

Modelo base sobre el split de test oficial completo (348 pares, recorte central de 512 x 512, umbral 0,5):

| Metrica | Valor |
|---|---|
| F1 | 0,846 |
| IoU | 0,733 |
| Rango de F1 entre las cuatro tasas de aprendizaje | 0,8437 - 0,8461 |

Resultados sobre cinco divisiones aleatorias de calibracion/test del split oficial de test (media mas menos desviacion estandar):

| alpha | Metodo | Cobertura | Brecha de cobertura | F1 | IoU | Primer plano predicho | Umbral recortado a 0 |
|---|---|---|---|---|---|---|---|
| 0,1 | CRC | 0,905 ± 0,016 | 0,142 ± 0,009 | 0,753 ± 0,020 | 0,605 ± 0,026 | 0,061 ± 0,005 | 0 |
| 0,1 | AT | 0,899 ± 0,016 | 0,140 ± 0,010 | 0,237 ± 0,043 | 0,135 ± 0,028 | 0,281 ± 0,054 | 0,244 ± 0,056 |
| 0,1 | COAT | 0,902 ± 0,013 | 0,134 ± 0,009 | 0,558 ± 0,243 | 0,417 ± 0,225 | 0,121 ± 0,083 | 0,066 ± 0,093 |
| 0,2 | CRC | 0,785 ± 0,017 | 0,212 ± 0,002 | 0,847 ± 0,008 | 0,735 ± 0,012 | 0,038 ± 0,002 | 0 |
| 0,2 | AT | 0,786 ± 0,018 | 0,209 ± 0,005 | 0,823 ± 0,017 | 0,699 ± 0,025 | 0,039 ± 0,004 | 0,002 ± 0,002 |
| 0,2 | COAT | 0,788 ± 0,010 | 0,212 ± 0,009 | 0,806 ± 0,021 | 0,676 ± 0,030 | 0,035 ± 0,002 | 0 |

La fraccion real de primer plano en los recortes de test es aproximadamente 0,041 y alrededor del 31% de los recortes no contiene ningun cambio, contando como totalmente cubiertos. Los checkpoints del repositorio provienen de la division 0. No se han publicado en la informacion disponible resultados de benchmarks adicionales como MMLU, HumanEval o GSM8K, que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita en la informacion proporcionada. El repositorio ocupa 0,5 GB y los pesos liberados suman 7,88 millones de parametros (unos 32 MB en fp32 solo para fusion, decodificador y cabeza), a lo que hay que anadir el encoder ConvNeXt-B descargado aparte; la mayor parte del consumo proviene del encoder y del tamano de entrada de 512 x 512.
- GPU recomendadas: no especificadas por el autor. Por el tamano del modelo, cualquier GPU con soporte CUDA y suficiencia de memoria para el encoder ConvNeXt-B a 512 x 512 deberia ser suficiente; no se indican modelos concretos.
- GPU de consumo: no confirmado en la informacion disponible. El recorte de 512 x 512 y el hecho de que solo se entrene la parte no congelada sugieren que el entrenamiento y la inferencia son viables en GPU de gama media, pero el autor no publica medidas.
- Opciones de despliegue: PyTorch Lightning con la libreria lightning-uq-box; carga de checkpoints mediante `COAT.load_from_checkpoint` o `AT.load_from_checkpoint` con `strict=False`. La descarga de LEVIR-CD+ en el tutorial se realiza a traves de torchgeo. El encoder se obtiene desde la pagina de timm del modelo. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

La informacion proporcionada solo permite comparar contra el metodo CRC de la misma serie experimental, evaluado con el mismo modelo base y las mismas divisiones de calibracion/test. No se aportan datos de otros modelos publicos de change detection sobre LEVIR-CD+.

| Modelo / metodo | Parametros | Contexto de entrada | F1 en test | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| levircd_coat (COAT, alpha = 0,2) | 7.876.201 en los pesos liberados (mas encoder no incluido) | recortes de 512 x 512 px | 0,806 ± 0,021 | Apache-2.0 (encoder bajo licencia DINOv3) | HuggingFace, lightning-uq-box |
| levircd_coat (AT, alpha = 0,2) | idem | recortes de 512 x 512 px | 0,823 ± 0,017 | idem | idem |
| CRC (referencia dentro de la misma serie) | idem | recortes de 512 x 512 px | 0,847 ± 0,008 | idem | idem |
| Otros modelos de change detection sobre LEVIR-CD+ | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La calibracion no se incluye en el repositorio: hay que calibrar cada red de umbral sobre imagenes reservadas antes de evaluar, tal como hace el tutorial. Usar los checkpoints sin calibrar da resultados no validos.
- La calibracion controla la tasa de falsos negativos de forma marginal, promediada sobre las imagenes de test. No ofrece garantia por imagen y no controla los falsos positivos.
- En la serie de cinco divisiones, AT y COAT alcanzan coberturas y brechas de cobertura similares a CRC, pero con peor F1 a alpha = 0,1 (0,237 para AT y 0,558 para COAT frente a 0,753 de CRC).
- Inestabilidad de COAT a alpha = 0,1: en dos de las cinco divisiones la red fijo el umbral a cero en el 13% y el 20% de los recortes de test, con F1 de 0,34 y 0,25, frente a 0,71-0,78 en las otras tres. Los checkpoints liberados corresponden a la division 0, que no presenta recorte de umbrales.
- El encoder se preentreno con imagenes web (LVD-1689M) y no con imagenes de satelite; los pesos congelados no se ajustaron a dominio satelital durante el entrenamiento.
- Los pesos del encoder no se redistribuyen en este repositorio y su uso exige aceptar la licencia DINOv3, que puede imponer condiciones distintas a las de Apache-2.0.
- LEVIR-CD+ tampoco se redistribuye; su uso esta sujeto a las condiciones del dataset original.
- Entrenamiento sobre un unico dataset (LEVIR-CD+) y una unica tarea binaria: no hay evidencia de generalizacion a otras resoluciones, sensores, regiones geograficas o tipos de cambio distintos de los de este corpus.
- El split de test oficial se reutiliza para calibracion y evaluacion en particiones aleatorias, de modo que calibracion y test comparten poblacion; esto limita la interpretacion de la cobertura como garantia en dominios nuevos.
- No se documentan sesgos geograficos o temporales del modelo mas alla del origen del dataset. No hay metricas de rendimiento fuera de LEVIR-CD+.
- El repositorio registra 0 descargas y 0 likes, sin senales de validacion por parte de terceros, y no se publica informacion sobre latencia, throughput o consumo de memoria en produccion.
- La model card se corta en la seccion de licencias y datos, por lo que las condiciones completas de uso de LEVIR-CD+ no aparecen integras en la informacion disponible.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/lightning-uq-box/levircd_coat
- Pagina del encoder en timm (requiere aceptar la licencia DINOv3): https://huggingface.co/timm/convnext_base.dinov3_lvd1689m
- Referencias arXiv incluidas en las etiquetas del repositorio: arxiv:2208.02814, arxiv:2107.09244, arxiv:2508.10104 (no se dispone de los titulos en la informacion proporcionada)
- Dataset referenciado: satellite-image-deep-learning/LEVIR-CD (no redistribuido en el repositorio; el tutorial lo descarga mediante torchgeo)
- Archivos incluidos en el repositorio: `base_trainable.safetensors`, `threshold/{at,coat}_alpha{0.1,0.2}.ckpt`, `splits.json`, `logs/base_lr1e-3_metrics.csv`, `series_summary.csv`
- Busqueda web: los resultados devueltos no guardan relacion con el modelo (mapas de rayos en tiempo real, articulo sobre el fenomeno atmosferico, conector Lightning de Apple y un proyecto no relacionado). No se han encontrado enlaces adicionales relevantes en la busqueda web.
