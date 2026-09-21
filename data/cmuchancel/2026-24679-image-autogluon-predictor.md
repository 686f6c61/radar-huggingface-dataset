# cmuchancel/2026-24679-image-autogluon-predictor

## Resumen

El modelo `cmuchancel/2026-24679-image-autogluon-predictor` es un clasificador binario de imagenes desarrollado por el usuario cmuchancel para la asignatura CMU 24-679 (Homework 2), en el marco del curso impartido por el profesor Chris McComb. Su unica tarea es determinar si en una fotografia aparece o no una masa de agua visible, devolviendo la etiqueta `1` para agua y `0` para ausencia de agua. No es un modelo de lenguaje ni un modelo multimodal generativo: es un cabezal de clasificacion visual construido con AutoGluon MultiModal sobre una arquitectura convolucional EfficientNet-B0.

El interes del modelo no reside en su rendimiento —de hecho sus metricas de test son pobres y estadisticamente fragiles—, sino en su valor como ejemplo reproducible de un flujo AutoML completo y de bajo coste: busqueda de arquitectura e hiperparametros sobre seis configuraciones, con un presupuesto total de 720 segundos de entrenamiento en Google Colab. Resulta util para quien quiera ver como se estructura un pipeline de AutoGluon MultiModal, como se documenta un experimento docente y como se declaran honestamente las limitaciones de un conjunto de datos diminuto.

El conjunto de datos de origen, `ssg1/places-water-binary`, contiene solo 34 fotografias originales recolectadas de forma independiente, repartidas en 391 imagenes de entrenamiento (originales mas aumentadas), 5 de validacion y 6 de prueba. Ese tamano condiciona por completo la interpretabilidad de las metricas: la accuracy de validacion reportada es 1,0000 y la de test 0,5000, con un F1 ponderado de 0,4857.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNet-B0 (mejor configuracion de una busqueda AutoGluon MultiModal que tambien evaluo ResNet-18 y MobileNetV3 Small) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; modelo de clasificacion de imagenes con entrada de 224 x 224 RGB |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision; no procesa texto) |
| Licencia | MIT, siguiendo la licencia del conjunto de datos de origen |
| Formato de pesos | no disponible (el repositorio se distribuye mediante la libreria `autogluon`, con un tamano total de 0,1 GB) |

## Arquitectura y entrenamiento

La arquitectura finalmente seleccionada es EfficientNet-B0, un modelo convolucional de clasificacion de imagenes, con una tasa de aprendizaje de 0,0005. La busqueda AutoML cubrio seis combinaciones de arquitectura y tasa de aprendizaje, combinando las arquitecturas ResNet-18, MobileNetV3 Small y EfficientNet-B0 con tasas de 0,0001 y 0,0005. Cada ensayo se ejecuto con el preset `medium_quality` de AutoGluon MultiModal, un maximo de 20 epocas, paciencia de early stopping de 3 comprobaciones de validacion y un presupuesto maximo de 120 segundos por configuracion, con un presupuesto total de busqueda de 720 segundos. La seleccion del mejor modelo se hizo exclusivamente con la accuracy de validacion; el conjunto de test no se utilizo para elegir arquitectura ni hiperparametros. La semilla fijada fue 24679.

El preprocesado lo gestiona AutoGluon MultiModal, que aplica su normalizacion y conversion a tensor esperadas. Las imagenes de origen se recortaron en cuadrado y se redimensionaron a 224 x 224 pixeles. El conjunto de entrenamiento incorpora aumentos que preservan la etiqueta —volteo horizontal, rotacion de hasta aproximadamente mas menos 8 grados, ajuste de brillo y contraste y variacion de color— generados unicamente a partir de las fotografias originales de entrenamiento; validacion y prueba no se aumentaron. Conviene subrayar que los aumentos no representan escenas nuevas e independientes, por lo que no compensan la escasez de datos originales. El entrenamiento se realizo en Google Colab con el runtime de GPU disponible, y no se documenta el uso de RLHF, DPO ni ninguna otra fase de ajuste por preferencias, algo por otra parte ajeno a una tarea de clasificacion visual.

## Capacidades

- Clasificacion binaria de imagenes en dos clases: `1` si hay una masa de agua visible y `0` si no la hay.
- Procesamiento de imagenes RGB de 224 x 224 pixeles, con recorte cuadrado previo.
- Inferencia a traves del pipeline `image-classification` de HuggingFace y de la libreria AutoGluon.
- Integracion en flujos AutoGluon MultiModal, incluida la posibilidad de reentrenar o extender la busqueda de hiperparametros.
- No dispone de generacion de texto, razonamiento, codigo ni matematicas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues: no procesa lenguaje natural.
- No incorpora modo de razonamiento explicito, vision mas alla de la clasificacion, audio ni generacion de ningun tipo.

## Casos de uso

- Material didactico para cursos de machine learning: el modelo sirve como ejemplo completo y reproducible de un flujo AutoML con AutoGluon MultiModal, desde la preparacion del dataset hasta la seleccion de la mejor configuracion por accuracy de validacion, con un presupuesto de computo de 720 segundos que cabe en una sesion de Colab.
- Plantilla de referencia para estructurar busquedas de arquitectura: las seis configuraciones evaluadas (tres arquitecturas por dos tasas de aprendizaje) y el esquema de presupuesto por ensayo se pueden reutilizar como esqueleto para experimentos propios con otros conjuntos de imagenes.
- Clasificacion rapida de fotografia de paisaje en prototipos internos: para etiquetar de forma aproximada imagenes de exterior en las que el agua ocupa una porcion grande y bien iluminada del encuadre, siempre que se asuma la alta tasa de error y se valide con datos propios.
- Filtrado de datos antes de anotacion manual: el modelo puede usarse como primer paso para descartar candidatas claramente sin agua en un flujo de curacion de imagenes, dejando la decision final a revision humana.
- Banco de pruebas de infraestructura de inferencia: al tratarse de un clasificador convolucional ligero (repositorio de 0,1 GB), es util para validar el despliegue de endpoints de `image-classification`, medir latencias y probar integraciones con AutoGluon o con el pipeline de HuggingFace.
- Ejercicio de evaluacion critica de metricas: con 5 imagenes de validacion y 6 de prueba, el modelo es un caso de estudio ideal para explicar por que una accuracy de validacion de 1,0000 no implica un modelo fiable y como un unico error altera drasticamente el resultado.
- Demostracion de declaracion de limitaciones y divulgacion de uso de IA: la model card documenta explicitamente el uso de ChatGPT para adaptar el cuaderno del curso y redactar el borrador, lo que lo convierte en un ejemplo de transparencia para asignaturas y equipos.

## Benchmarks y rendimiento

| Metrica | Conjunto | Valor |
|---|---|---|
| Accuracy | Validacion (5 imagenes) | 1,0000 |
| Accuracy | Test (6 imagenes) | 0,5000 |
| F1 ponderado | Test (6 imagenes) | 0,4857 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni son aplicables a un modelo de clasificacion de imagenes. El propio autor advierte que, dado el tamano de los conjuntos de validacion y prueba, estas metricas presentan una incertidumbre muy elevada y que un solo error de clasificacion en test modifica sustancialmente la accuracy.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 0,1 GB, un tamano coherente con un clasificador convolucional de type EfficientNet-B0, que en la practica se ejecuta en GPUs de gama de entrada.
- GPU recomendadas: no disponible. El entrenamiento se realizo en el runtime de GPU gratuito de Google Colab, lo que indica que el modelo se entrena e infiere en hardware de gama media o incluso en CPU para inferencia puntual.
- Compatibilidad con GPU de consumo: por el tamano del repositorio y la arquitectura empleada, es esperable que quepa en cualquier GPU de consumo moderna, incluida una RTX 3060 o superior; se trata de una estimacion razonada, no de un dato publicado.
- Opciones de despliegue: la libreria declarada es AutoGluon; tambien puede servirse mediante el pipeline `image-classification` de HuggingFace. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparables publicados en la informacion proporcionada. El propio proceso AutoML evaluo internamente tres arquitecturas sobre la misma tarea y el mismo conjunto de datos, pero solo se reporta la ganadora por accuracy de validacion:

| Modelo | Papel en la busqueda | Accuracy de validacion | Licencia | Disponibilidad |
|---|---|---|---|---|
| EfficientNet-B0 con lr 0,0005 | Configuracion seleccionada | 1,0000 | MIT | HuggingFace (este repositorio) |
| ResNet-18 | Configuracion evaluada | no disponible | no disponible | no disponible |
| MobileNetV3 Small | Configuracion evaluada | no disponible | no disponible | no disponible |

No es posible comparar con alternativas externas de la misma categoria porque no se han facilitado resultados de benchmarks de otros clasificadores binarios de agua en imagenes.

## Limitaciones y advertencias

- Los aumentos de datos no aportan escenas nuevas: el conjunto contiene solo 34 fotografias originales recolectadas de forma independiente, y las versiones aumentadas derivan de las mismas tomas.
- Tamano de evaluacion extremadamente reducido: 5 imagenes de validacion y 6 de prueba. La accuracy de test de 0,5000 corresponde aproximadamente a 3 aciertos sobre 6, por lo que un unico cambio de prediccion altera el resultado de forma drastica. La accuracy de validacion de 1,0000 procede de acertar 5 imagenes.
- Falta de generalizacion esperable: todas las fotografias fueron tomadas por una sola persona con un unico telefono, de modo que el modelo puede degradarse ante camaras, ubicaciones o estilos visuales distintos.
- Fallos conocidos declarados por el autor: dificultad cuando el agua ocupa una porcion pequena del encuadre, esta parcialmente obstruida, aparece con iluminacion o meteorologia poco habituales, o cuando superficies reflectantes sin agua se parecen al agua.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de falsos positivos y falsos negativos por sobreajuste al conjunto de entrenamiento.
- Limitaciones de idioma: no aplica; el modelo no procesa texto.
- Restriccion de uso: el autor indica explicitamente que el modelo esta pensado para uso academico y que no debe emplearse en decisiones de seguridad critica ni en monitorizacion medioambiental.
- Licencia MIT, siguiendo la licencia del conjunto de datos de origen, lo que permite uso comercial siempre que se conserve el aviso de copyright y la licencia; no obstante, la calidad del modelo desaconseja cualquier uso productivo real.
- Sesgos: el conjunto se compone principalmente de escenas de exterior y no de personas, y no esta destinado a inferir atributos personales ni sensibles.
- Despliegue: no se documentan cuantizaciones ni formatos de pesos alternativos, por lo que la portabilidad fuera del ecosistema AutoGluon no esta garantizada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cmuchancel/2026-24679-image-autogluon-predictor
- Conjunto de datos de origen: https://huggingface.co/datasets/ssg1/places-water-binary
- No se han encontrado otros enlaces relevantes (papers, blogs, repositorios o demos) en la busqueda web realizada; los resultados obtenidos no guardaban relacion con el modelo.
