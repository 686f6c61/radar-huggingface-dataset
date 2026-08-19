# daipath/filter-inspection

## Resumen

El modelo `daipath/filter-inspection` es un paquete de inferencia para la inspección visual de calidad de filtros ópticos IR-CUT, concretamente para la clasificación de recortes de filtro en **bueno** o **defectuoso**, con la opción de clasificar el tipo de defecto (rayado, picadura o borde roto). Está desarrollado por el autor `daipath` y publicado bajo licencia `other` en Hugging Face.

El paquete se distribuye en formato ONNX y está diseñado para entornos industriales: la inferencia no requiere PyTorch, timm ni GPU, y puede ejecutarse con solo cuatro paquetes pip (`onnxruntime`, `numpy`, `pillow`, `openpyxl`). Incluye dos versiones: v3, la versión estable que ya se usa en producción, y v4, una versión nueva que corrige un problema de normalización silenciosa en v3 y añade un sistema de verificación de modelos en ocho pasos.

La relevancia de este modelo radica en su enfoque práctico para control de calidad industrial: ofrece binarios autocontenidos que no requieren instalación de Python en la máquina objetivo, soporta CPU y GPU, e incluye documentación exhaustiva sobre reproducción, auditorías de honestidad y límites conocidos. El repositorio incluye también un conjunto de datos asociado (`daipath/filter-inspection-data`) y documentación detallada de experimentos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV3 Large (backbone, clasificación binaria) / ResNet34 (backbone, clasificación de 4 clases) |
| Parametros totales | 4,2 M (MobileNetV3 Large) / 21,3 M (ResNet34) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no texto) |
| Tipos de cuantizacion | no disponible (se distribuye en FP32 ONNX) |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | other (consulte la pagina del modelo para detalles) |
| Formato de pesos | ONNX (safetensors no aplica) |

## Arquitectura y entrenamiento

El modelo se compone de dos clasificadores independientes: un clasificador binario (`filter_binary.onnx`, 16,8 MB) con backbone MobileNetV3 Large (4,2 M de parametros) que distingue entre bueno y defectuoso, y un clasificador de cuatro clases (`filter_4class.onnx`, 85,1 MB) con backbone ResNet34 (21,3 M de parametros) que clasifica el tipo de defecto: bueno, rayado, picadura o borde roto. Ambos modelos reciben imagenes de 320×320 píxeles en formato `float32[N,3,320,320]` y producen logits de salida.

El preprocesado es un punto critico del modelo: incluye redimensionamiento con preservacion de aspecto y relleno con ceros, balance de blancos de mundo gris y normalizacion z-score por imagen. La version v3 tenia la normalizacion fijada al esquema `gwz` (gris-world z-score), ignorando el campo `norm` en el archivo de configuracion, lo que causaba errores silenciosos al intercambiar modelos con diferente esquema de normalizacion. La version v4 corrige este problema y alinea el preprocesado con el utilizado durante el entrenamiento (usa `cv2.resize` en lugar de PIL `BILINEAR`).

El entrenamiento incluyo un proceso de validacion con cuatro auditorias de honestidad: intensidad de huella de lote (92%), deteccion de clase no vista (100%), generalizacion entre lotes (AUROC 0,9862 vs 0,9911 en el mismo lote) y control de caracteristicas congeladas (kNN 0,9634 vs linear probe 0,9461). Los detalles completos del entrenamiento estan documentados en los archivos de documentacion del repositorio.

## Capacidades

- Clasificacion binaria de calidad: distingue entre filtros opticos buenos y defectuosos con AUROC de 0,9913 ± 0,0049 en test.
- Clasificacion de tipo de defecto: identifica si el defecto es rayado, picadura o borde roto, con una precision balanceada de 0,9213 en test.
- Inferencia en CPU sin dependencias pesadas: solo requiere `onnxruntime`, `numpy`, `pillow` y `openpyxl`.
- Binarios autocontenidos: versiones ejecutables que no requieren Python instalado en la maquina objetivo (CPU y GPU).
- Salida en formato Excel (xlsx) o CSV con UTF-8 BOM para compatibilidad directa con Excel.
- Umbral configurable de rechazo: permite ajustar la sensibilidad del clasificador binario mediante el parametro `--threshold`.
- Clasificacion de tipo de defecto opcional: el modo `--with-type` anade columnas de tipo de defecto y confianza.
- Deteccion de defectos no vistos durante el entrenamiento: la clase "roto" se detecta al 100% aunque nunca se incluyo en el entrenamiento.

## Casos de uso

- Control de calidad en linea de produccion de filtros opticos: el modelo puede integrarse en una cinta transportadora para clasificar filtros IR-CUT en tiempo real. Con el binario GPU alcanza 3608 imagenes por segundo (RTX 4090), suficiente para inspeccion al 100% en lineas de alta velocidad.
- Inspeccion de recepcion de materiales: al recibir lotes de filtros de proveedores, el modelo puede procesar un directorio completo de imagenes y generar un informe Excel con la clasificacion de cada pieza, facilitando la verificacion de calidad de lotes completos.
- Auditoria de calidad post-produccion: el modo `--with-type` permite clasificar el tipo de defecto (rayado, picadura, borde roto) para analisis estadistico de causas raiz, identificando que tipo de defecto es mas frecuente y ajustando los procesos de fabricacion en consecuencia.
- Sistema de alerta temprana en produccion: con el umbral configurable, se puede establecer un modo de alta sensibilidad (umbral 0,242) para detectar hasta el 99,6% de defectos, aunque con mas falsos positivos, util para detectar desviaciones de proceso antes de que se conviertan en problemas mayores.
- Rechazo de piezas defectuosas en fabrica: el clasificador binario con umbral balanceado (0,459) detecta el 99,1% de defectos con solo 8 falsos positivos por cada 185 piezas buenas, adecuado para separacion automatica de piezas defectuosas.
- Investigacion y desarrollo de procesos de fabricacion: la documentacion incluye guias de reproduccion completa y resultados de 42 modelos comparados, lo que permite a investigadores evaluar diferentes arquitecturas y esquemas de preprocesado para optimizar la inspeccion de calidad en otros tipos de componentes opticos.

## Benchmarks y rendimiento

Los resultados de test publicados en la documentacion del modelo son los siguientes:

| Modelo | Metrica | Valor |
|---|---|---|
| Clasificador binario (MobileNetV3 Large) | AUROC (test) | 0,9913 ± 0,0049 |
| Clasificador binario (MobileNetV3 Large) | Precision balanceada (test) | 0,9746 |
| Clasificador 4 clases (ResNet34) | AUROC (test) | 0,9867 |
| Clasificador 4 clases (ResNet34) | Precision balanceada (test) | 0,9213 |

Recuperacion por clase del clasificador de 4 clases (test): rayado 88,0%, borde roto 94,1%, bueno 95,1%, picadura 91,3%.

Resultados de las auditorias de honestidad:

| Auditoria | Resultado |
|---|---|
| Intensidad de huella de lote | 92% (las imagenes contienen informacion distinguible por lote) |
| Deteccion de clase no vista ("roto") | 100% |
| Generalizacion entre lotes | AUROC 0,9862 (lote retenido) vs 0,9911 (mismo lote) |
| Control de caracteristicas congeladas | kNN 0,9634 vs linear probe 0,9461 |

Velocidad de inferencia medida (CPU sin GPU): aproximadamente 20-22 imagenes por segundo. Con GPU (RTX 4090): aproximadamente 3608 imagenes por segundo (binario v3) o 103 imagenes por segundo (binario v4 GPU, limitado por el preprocesado en CPU).

## Requisitos de hardware

- CPU: cualquier x86_64 Linux con GLIBC ≥ 2.28 (binario portable) o GLIBC ≥ 2.38 (binario estandar). Inferencia a aproximadamente 20-22 imagenes por segundo.
- GPU: NVIDIA con driver CUDA 12.x o superior. El binario GPU incluye las librerias CUDA 12 incorporadas. En RTX 4090 alcanza aproximadamente 3608 imagenes por segundo (version v3) o 103 imagenes por segundo (version v4, limitada por preprocesado en CPU).
- VRAM estimada: no especificada en la documentacion, pero los modelos son pequenos (16,8 MB y 85,1 MB en FP32), por lo que cualquier GPU con al menos 1 GB de VRAM deberia ser suficiente.
- Opciones de despliegue: binarios autocontenidos (CPU y GPU), script Python con `onnxruntime`, o integracion directa del archivo ONNX en cualquier framework que soporte ONNX Runtime.
- Nota importante: la documentacion advierte que GPU y CPU no producen resultados bit a bit identicos (en 409 imagenes de test, 0 discrepancias en la clasificacion final, pero diferencias de hasta 7,0e-03 en las puntuaciones). Se recomienda fijar un mismo binario en produccion y no mezclar.

## Comparativa con modelos similares

No se dispone de informacion suficiente en la documentacion proporcionada para establecer una comparativa con modelos similares de inspeccion visual de calidad en el dominio de filtros opticos. La documentacion menciona que se compararon 42 modelos internamente (resultados en `docs/RESULTS.md`), pero no se proporcionan los nombres ni resultados de modelos externos comparables en la informacion disponible.

## Limitaciones y advertencias

- Tamaño de muestra de validacion limitado: el conjunto de test contiene solo 185 imagenes de piezas buenas. El limite superior del intervalo de confianza del 95% para una tasa de falsos positivos de 0 es 1,61%, lo que limita la certeza estadistica sobre la tasa de falsos positivos.
- Riesgo de sesgo por lote: la auditoria de huella de lote detecto que las imagenes contienen informacion distinguible por lote (92% de intensidad), lo que indica que existe un riesgo de que el modelo aprenda caracteristicas especificas de un lote en lugar de caracteristicas generales del defecto.
- Error silencioso en v3: la version v3 ignora el campo `norm` en el archivo de configuracion, lo que causa errores silenciosos al intercambiar modelos con diferente esquema de normalizacion. La documentacion muestra que esto puede degradar el AUROC de 0,9976 a 0,9940 o incluso a 0,3542 segun el caso.
- Diferencias entre v3 y v4: las puntuaciones no son bit a bit identicas entre versiones (diferencia maxima de 0,0035, con 38 de 409 imagenes mostrando diferencias superiores a 1e-4). Si se ha establecido una linea base SPC con v3, se requiere revalidacion al migrar a v4.
- Distribucion de puntuaciones bimodal: las puntuaciones entre 0,51 y 0,79 estan casi vacias, lo que limita la utilidad de umbrales intermedios. Solo los umbrales 0,787 (estricto) y 0,459 (balanceado) son realmente significativos.
- Limitaciones de la clasificacion de defectos: la recuperacion por clase del clasificador de 4 clases es desigual (rayado 88,0%, borde roto 94,1%, bueno 95,1%, picadura 91,3%), lo que puede requerir ajustes para tipos de defecto especificos.
- Licencia restrictiva: la licencia es `other`, no una licencia open source estandar. Se debe consultar la pagina del modelo para conocer los terminos exactos de uso, especialmente para uso comercial.
- Requisitos de preprocesado estrictos: el preprocesado debe coincidir exactamente con `predict.py:preprocess()` (redimensionamiento con preservacion de aspecto y relleno, balance de blancos de mundo gris, z-score por imagen); de lo contrario, los resultados no son fiables.
- Dependencia de la configuracion de iluminacion: al ser un modelo entrenado con imagenes de campo oscuro, su rendimiento puede degradarse si las condiciones de iluminacion de la linea de produccion difieren de las del entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/daipath/filter-inspection
- Dataset asociado: https://huggingface.co/datasets/daipath/filter-inspection-data
- Documentacion del proyecto (indice): https://huggingface.co/daipath/filter-inspection/blob/main/docs/INDEX.md
- Guia de reproduccion: https://huggingface.co/daipath/filter-inspection/blob/main/docs/REPRODUCE.md
- Resultados de experimentos: https://huggingface.co/daipath/filter-inspection/blob/main/docs/RESULTS.md
- Auditoria de honestidad: https://huggingface.co/daipath/filter-inspection/blob/main/docs/AUDIT.md
- Limitaciones y advertencias: https://huggingface.co/daipath/filter-inspection/blob/main/docs/CAVEATS.md
- Descripcion de repositorios: https://huggingface.co/daipath/filter-inspection/blob/main/docs/REPOS.md
