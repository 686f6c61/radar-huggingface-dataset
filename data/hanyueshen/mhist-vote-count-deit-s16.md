# HanyueShen/mhist-vote-count-deit-s16

## Resumen

El modelo `mhist-vote-count-deit-s16`, desarrollado por Hanyue Shen y Xinling Liao de YH Intelligence Technology, es un Vision Transformer (DeiT-S/16) fine-tuneado sobre el dataset de histopatología MHIST para la tarea de clasificación binaria de pólipos colorrectales en dos categorías: adenocarcinoma de bajo grado (HP) y adenocarcinoma de alto grado (SSA). El modelo está diseñado para predecir el recuento de votos de patólogos sobre cada imagen, una aproximación que permite estimar la probabilidad de pertenencia a cada clase mediante una regresión de recuento acotada.

La arquitectura se basa en el modelo DeiT-S/16 preentrenado en ImageNet-1K, con una cabeza de salida compuesta por siete componentes sigmoid independientes cuya suma produce una estimación de recuento en el intervalo (0, 7). El modelo acepta parches RGB de 224x224 píxeles y devuelve el recuento predicho, la puntuación SSA normalizada y la etiqueta HP/SSA. Es un modelo de investigación experimental, no un dispositivo médico, y no incluye los pesos entrenados en el repositorio público: solo se distribuye el código de inferencia bajo licencia Apache-2.0.

La relevancia de este modelo radica en su enfoque de regresión de recuento de votos con consistencia rotacional (promedio de predicciones sobre rotaciones de 0, 90, 180 y 270 grados), que según los autores alcanza el mejor AUROC medio documentado en la partición fija de 2.175/977 imágenes de MHIST (0,9588 ± 0,0014). Sin embargo, su uso práctico está limitado por la ausencia de pesos públicos y por las restricciones de redistribución del propio dataset.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeiT-S/16 (Vision Transformer, patch size 16, 224x224) |
| Parametros totales | 22.586.759 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (entrada de imagen 224x224) |
| Tipos de cuantizacion | no disponible (no se distribuyen pesos) |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de texto) |
| Licencia | Apache-2.0 (codigo e inferencia); pesos no incluidos y sujetos a restricciones de MHIST |
| Formato de pesos | safetensors (mencionado en el codigo de ejemplo, aunque no se publican los checkpoints) |

## Arquitectura y entrenamiento

El modelo utiliza como backbone el DeiT-S/16 (`deit_small_patch16_224`), un transformer de vision con parches de 16x16 píxeles, inicializado con pesos preentrenados en ImageNet-1K. La cabeza de clasificación original se sustituye por una capa de salida con siete unidades sigmoid independientes. La suma de estas siete salidas representa una estimación del recuento de votos de patólogos (SSA vote count) acotada en (0, 7). La puntuación SSA se calcula dividiendo el recuento predicho entre 7, y la clasificación final se obtiene aplicando un umbral de 0,5: si la puntuación es mayor que 0,5 se asigna la clase SSA, en caso contrario HP.

Para mejorar la robustez ante la orientación de las imágenes, se emplea una inferencia de cuatro vistas: se promedia el recuento predicho sobre rotaciones de 0, 90, 180 y 270 grados. El entrenamiento se realizó con cinco semillas distintas (42 a 46), y los resultados reportados corresponden al conjunto de cinco checkpoints, no a uno seleccionado individualmente. El repositorio público no incluye los pesos entrenados, el codigo de entrenamiento, los historiales de entrenamiento ni las divisiones de datos, por lo que no se dispone de detalles sobre el dataset de entrenamiento (numero de épocas, optimizador, aumento de datos, etc.). La unica informacion disponible es que la entrada se normaliza con la media y desviacion estandar de ImageNet.

## Capacidades

- Clasificacion binaria de imagenes de histopatologia en las categorias HP (polipo hiperplasico) y SSA (adenocarcinoma serrado sesil), a partir de parches de 224x224.
- Regresion de recuento de votos: el modelo predice un valor continuo en (0, 7) que estima el numero de votos de patologos que asignarian la clase SSA a la imagen.
- Inferencia con consistencia rotacional: promediado de predicciones sobre cuatro rotaciones (0, 90, 180, 270 grados) para mejorar la estabilidad.
- Generacion de una puntuacion SSA normalizada (recuento dividido entre 7) utilizable como probabilidad de pertenencia a la clase SSA.
- Clasificacion por umbral: puntuacion mayor que 0,5 produce etiqueta SSA, en caso contrario HP.
- Capacidades de vision generales heredadas del backbone DeiT-S/16 preentrenado en ImageNet, aunque el fine-tuning especifico para MHIST limita su generalizacion a otros dominios.

## Casos de uso

- Investigacion en patologia digital: el modelo puede utilizarse como sistema de apoyo para la clasificacion de polipos colorrectales en estudios retrospectivos, ayudando a los investigadores a explorar la concordancia entre predicciones automaticas y votos de patologos.
- Deteccion de adenocarcinoma serrado sesil (SSA): dado un parche histologico, el modelo proporciona una puntuacion continua que puede integrarse en flujos de trabajo de triaje, priorizando imagenes con alta probabilidad de SSA para revision manual.
- Analisis de consistencia rotacional: el esquema de cuatro vistas permite evaluar la sensibilidad del modelo a la orientacion de las muestras, un aspecto critico en histopatologia donde la orientacion no esta controlada.
- Desarrollo de modelos de regresion de recuento: el enfoque de salida con siete componentes sigmoid puede servir como referencia para otros investigadores que trabajen con etiquetas de votos multiples o anotaciones ruidosas.
- Evaluacion de protocolos de particion fija: los resultados reportados sobre la particion estandar de MHIST (2.175/977) permiten comparar el rendimiento de este modelo con otros metodos bajo el mismo protocolo de evaluacion.
- Educacion y formacion: el codigo de inferencia, publicado bajo Apache-2.0, puede emplearse en entornos docentes para ilustrar la aplicacion de transformers de vision a problemas de clasificacion medica con salidas continuas.

## Benchmarks y rendimiento

La model card reporta resultados sobre la particion fija de test de MHIST (977 imagenes) para cinco semillas de entrenamiento. Los valores se presentan como media ± desviacion estandar del conjunto de cinco checkpoints, no como un unico modelo final.

| Metrica | Valor (media ± desviacion) |
|---|---|
| AUROC single-view | no reportado como media (valores por semilla entre 0,95225 y 0,95655) |
| AUROC four-view | 0,9588 ± 0,0014 |
| Accuracy four-view | 90,15% ± 0,65% |

Resultados por semilla (tomados de la model card):

| Checkpoint | Seed | Single-view AUROC | Four-view AUROC | Four-view accuracy |
|---|---|---|---|---|
| Seed 42 | 42 | 0,95397 | 0,96049 | 90,48% |
| Seed 43 | 43 | 0,95655 | 0,95965 | 90,99% |
| Seed 44 | 44 | 0,95444 | 0,95705 | 89,36% |
| Seed 45 | 45 | 0,95501 | 0,95922 | 90,28% |
| Seed 46 | 46 | 0,95225 | 0,95759 | 89,66% |

Segun los autores, el AUROC medio de 0,9588 es el mas alto documentado entre los estudios que reportan explicitamente AUROC en la particion fija de 2.175/977 de MHIST, lo que lo situaria como estado del arte bajo ese protocolo. No se proporcionan comparaciones numericas con otros modelos en la informacion disponible.

## Requisitos de hardware

- El modelo tiene 22,6 millones de parametros, lo que lo convierte en un modelo ligero. En precision fp32, los pesos ocupan aproximadamente 90 MB (22.586.759 x 4 bytes). La inferencia sobre una imagen de 224x224 requiere memoria adicional para activaciones, pero el consumo total es modesto.
- Se puede ejecutar en CPU sin problemas para inferencia puntual o en lotes pequenos. En una CPU moderna, la latencia por imagen seria del orden de decenas a cientos de milisegundos, dependiendo del hardware y de si se usa la inferencia de cuatro vistas (que multiplica el coste por 4).
- En GPU, cualquier tarjeta con al menos 2 GB de VRAM es suficiente. Modelos como NVIDIA GTX 1050 Ti, RTX 2060 o superiores pueden ejecutarlo con margen. Una RTX 4090 o A100 ofreceria latencias en el rango de milisegundos por imagen.
- El codigo de inferencia proporcionado (`modeling_mhist.py`) carga checkpoints en formato safetensors y puede ejecutarse en CPU o GPU. No se mencionan herramientas de despliegue como vLLM u Ollama, ya que es un modelo de vision y no un LLM. Para integracion en produccion seria necesario adaptar el codigo a un servidor de inferencia como TorchServe o FastAPI.
- Al no publicarse los pesos, no es posible desplegar el modelo tal cual. Cualquier uso requeriria obtener los checkpoints de los autores bajo las restricciones de MHIST.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros modelos en la informacion proporcionada. La model card menciona que el resultado medio de AUROC (0,9588) es el mejor documentado en el protocolo fijo de MHIST, pero no ofrece datos concretos de otros metodos (por ejemplo, ResNet, otros ViT, o modelos especificos de histopatologia como CTransPath o RetCCL). Por tanto, no es posible construir una tabla comparativa fiable sin inventar cifras. Se recomienda consultar la literatura citada en el repositorio para obtener dichas comparaciones.

## Limitaciones y advertencias

- El repositorio publico no incluye los pesos entrenados. Los cinco checkpoints se encuentran en un repositorio privado pendiente de autorizacion escrita del editor de datos de MHIST para su redistribucion. Cualquier uso practico del modelo requiere contactar con los autores.
- El modelo es experimental y no esta validado para uso clinico. No es un dispositivo medico y no debe utilizarse para diagnostico, atencion al paciente ni toma de decisiones clinicas.
- La evaluacion se limita a la clasificacion HP/SSA en la particion fija de MHIST. El rendimiento en otros laboratorios, escaneres, tinciones, organos o poblaciones no esta establecido.
- La ausencia de pesos publicos impide reproducir los resultados reportados sin autorizacion expresa.
- El dataset MHIST no se redistribuye y esta sujeto a un acuerdo de uso para investigacion que restringe la redistribucion y las obras derivadas. Los pesos entrenados con MHIST heredan estas restricciones.
- No se proporcionan detalles sobre sesgos especificos del modelo, pero al estar entrenado en un dataset de un solo centro (probablemente), puede presentar sesgos relacionados con el equipo de adquisicion, el protocolo de tincion o la poblacion de origen.
- El modelo solo acepta parches de 224x224 ya recortados; no incluye logica de deteccion de regiones de interes ni manejo de imagenes completas (whole slide images).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/HanyueShen/mhist-vote-count-deit-s16
- Dataset MHIST (pagina oficial): https://bmirds.github.io/MHIST/
- Repositorio oficial DeiT (Facebook Research): https://github.com/facebookresearch/deit
- Archivo de modelos DeiT (referencia de implementacion): https://github.com/facebookresearch/deit/blob/main/models.py
