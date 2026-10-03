# menes000/armocromia-12-season-effnetv2s

## Resumen

Armocromia 12-Season — EfficientNetV2-S es un modelo de clasificación de imágenes desarrollado por el usuario menes000 que asigna una fotografía de rostro enmascarado a uno de los doce subtipos estacionales de armocromía (análisis de color personal). Parte del backbone `tf_efficientnetv2_s` preentrenado en ImageNet-21k y afinado posteriormente en ImageNet-1k, sobre el que se ha realizado un ajuste fino específico con el conjunto de datos `menes000/armocromia-12-season`. La arquitectura es una red neuronal convolucional (CNN) de la familia EfficientNetV2, no un transformer ni un modelo de lenguaje, y cuenta con 20.177.488 parámetros en el backbone.

El modelo resuelve una tarea de clasificación de 12 clases finas que tradicionalmente requiere el juicio de un analista de color humano: determinar la estación cromática (winter, summer, spring, autumn) y su subtipo (deep, warm, light, bright, soft, cool) a partir de rasgos de subtono, valor y croma. Es relevante porque automatiza un proceso subjetivo y costoso, y porque documenta de forma transparente las limitaciones intrínsecas de la tarea: la ambigüedad de las etiquetas y la dificultad de separar categorías adyacentes.

El rendimiento declarado es de 28,95 % de accuracy top-1 y 64,47 % de accuracy top-3 sobre el split de test de 912 imágenes, frente a líneas base aleatorias del 8,33 % y 25,00 % respectivamente. El autor recomienda explícitamente usar la salida top-3 en lugar de top-1. La licencia es research-only, lo que restringe su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNetV2-S (red neuronal convolucional, backbone `tf_efficientnetv2_s`) |
| Parametros totales | 20.177.488 parametros de backbone (variante `tf_efficientnetv2_s` de timm) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (modelo de vision, no procesa secuencias de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplicable (modelo de clasificacion de imagen) |
| Licencia | other / research-only (enlace: https://github.com/lorenzo-stacchio/Deep-Armocromia) |
| Formato de pesos | no disponible (repo de 0,1 GB, libreria timm) |

## Arquitectura y entrenamiento

El modelo es una CNN EfficientNetV2-S, concretamente la variante `tf_efficientnetv2_s` de la libreria `timm`. Esta variante emplea padding estilo TensorFlow (`Conv2dSame`) en lugar del padding estatico de la variante `efficientnetv2_s`. Ambas comparten formas identicas y 20.177.488 parametros de backbone, por lo que `load_state_dict` puede ejecutarse con la variante equivocada sin error, degradando las predicciones. El autor documenta el coste de ese error: usar `efficientnetv2_s` en inferencia reduce la accuracy top-1 del 28,95 % al 27,63 % y la top-3 del 64,47 % al 60,64 %. Ademas, la variante `efficientnetv2_s` plana no incluye pesos preentrenados en timm, lo que confirma cual fue la variante ajustada.

El backbone parte de pesos preentrenados en ImageNet-21k y afinados en ImageNet-1k (`timm/tf_efficientnetv2_s.in21k_ft_in1k`), y se ha realizado un ajuste fino adicional sobre el conjunto `menes000/armocromia-12-season`, compuesto por aproximadamente 3.800 imagenes de entrenamiento repartidas en 12 clases (unas 300 por clase). No se emplearon tecnicas de RLHF ni DPO, propias de modelos de lenguaje. La seleccion del checkpoint se hizo por mejor perdida de validacion, no por mejor accuracy de validacion. La cabeza de clasificacion fue reemplazada para las 12 clases objetivo. El entrenamiento se realizo a 224x224 con normalizacion ImageNet, aunque la configuracion nativa del backbone es 300x300 con media/desviacion de 0,5; el autor senala que ambas desviaciones penalizan la precision.

## Capacidades

- Clasificacion de imagenes de rostro enmascarado en 12 subtipos estacionales de armocromia: `winter_deep`, `winter_cool`, `winter_bright`, `summer_light`, `summer_cool`, `summer_soft`, `spring_light`, `spring_warm`, `spring_bright`, `autumn_warm`, `autumn_deep`, `autumn_soft`.
- Salida probabilistica tipo softmax con posibilidad de ranking top-k; el autor recomienda usar el top-3.
- Capacidad de diagnostico secundario: colapsando las 12 predicciones a la estacion primaria se obtiene un 52,30 % de accuracy en la tarea de 4 estaciones, aunque existe un modelo dedicado para ese caso.
- Analisis de atributos cromaticos implicitos: subtono, valor y croma, inferidos por la red a partir de la imagen.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues ni de generacion de texto.
- No procesa vision-lenguaje ni audio; es exclusivamente vision para clasificacion.

## Casos de uso

- Preanalisis en consultoria de imagen personal: el modelo puede generar una lista corta ordenada de los tres subtipos mas probables para que el analista humano los valide, reduciendo el tiempo de cribado inicial.
- Recomendacion de paleta cromatica en aplicaciones de moda: integrado en una app, emplea la salida top-3 para sugerir gamas de color coherentes con cada subtipo candidato y permite al usuario escoger.
- E-commerce de cosmeticos: clasifica el rostro del cliente para filtrar bases de maquillaje, labiales y correctores por subtono, usando top-3 cuando la confianza es baja.
- Asesoramiento de compra de ropa online: genera recomendaciones de color de prendas segun la estacion y subtipo estimados, con la salida top-3 como entrada a un sistema de ranking mas amplio.
- Herramienta educativa para estudiantes de armocromia: muestra la distribucion de probabilidad sobre las 12 clases para ilustrar por que categorias como `autumn_deep` y `winter_deep` son dificiles de separar.
- Investigacion sobre analisis de color personal: sirve como baseline reproducible y comparable, con licencia research-only, para experimentos academicos sobre clasificacion estacional.
- Modulo de triaje en pipelines de vision mas amplios: actua como primer filtro de bajo coste (20 M de parametros) antes de invocar modelos de vision-lenguaje mas caros para un analisis explicativo.
- Analisis de cohortes en estudios de mercado: procesa lotes de imagenes para estimar la distribucion de subtipos estacionales en una poblacion, con las cautelas de precision descritas.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente). Evaluados sobre el split de test de 912 imagenes de `menes000/armocromia-12-season`, no usado durante el entrenamiento ni la seleccion del modelo.

| Metrica | Valor | Linea base aleatoria |
|---|---|---|
| Top-1 accuracy | 28,95 % | 8,33 % |
| Top-3 accuracy | 64,47 % | 25,00 % |

Precision top-1 por clase:

| Clase | Accuracy | Clase | Accuracy |
|---|---|---|---|
| winter_deep | 48,72 % | summer_cool | 30,19 % |
| autumn_warm | 48,65 % | winter_cool | 24,72 % |
| spring_light | 42,19 % | winter_bright | 20,69 % |
| summer_light | 38,57 % | autumn_soft | 15,07 % |
| autumn_deep | 33,93 % | spring_warm | 12,33 % |
|  |  | summer_soft | 9,52 % |
|  |  | spring_bright | 4,55 % |

Comparativa de backbone en inferencia (coste de usar la variante incorrecta):

| Backbone usado | Top-1 | Top-3 |
|---|---|---|
| `tf_efficientnetv2_s` (correcto) | 28,95 % | 64,47 % |
| `efficientnetv2_s` (incorrecto) | 27,63 % | 60,64 % |

Confusiones mas frecuentes sobre los 648 errores totales (213, un 32,9 %, conservan la estacion primaria correcta y solo fallan el subtipo):

| Par confundido | Recuento (ambas direcciones) | Atributo compartido |
|---|---|---|
| autumn_deep ↔ winter_deep | 63 | deep |
| winter_cool ↔ winter_deep | 52 | misma estacion |
| spring_light ↔ summer_light | 31 | light |
| spring_warm → autumn_warm | 19 | warm |

Confianza media de softmax: 34,6 % en predicciones correctas y 29,7 % en incorrectas (diferencia inferior a 5 puntos).

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de ~20,18 M de parametros, los pesos en FP32 ocupan del orden de 80 MB y en FP16 del orden de 40 MB. La VRAM real de inferencia depende del tamano de lote y de la resolucion de entrada (224x224 en configuracion de entrenamiento).
- GPU recomendadas: cualquier GPU moderna es suficiente; se puede ejecutar en RTX 3060, RTX 4090, A100 o H100 sin ninguna restriccion practica.
- Cabe holgadamente en GPU de consumo e incluso en CPU. Un portatil convencional puede ejecutar la inferencia a 224x224 con latencia aceptable.
- Opciones de despliegue: la libreria nativa es `timm` sobre PyTorch. Es exportable a formatos de inferencia habituales (por ejemplo ONNX) para servir en produccion, aunque el autor no documenta recetas de despliegue especificas.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Dado el reducido numero de parametros, la latencia esperada es de milisegundos por imagen en GPU moderna, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| armocromia-12-season-effnetv2s | 20,18 M (backbone) | 224x224, 12 clases | Top-1 28,95 %, Top-3 64,47 % | research-only | HuggingFace (`menes000`) |
| Modelo dedicado de 4 estaciones (mismo proyecto) | no disponible | no disponible | no disponible (el autor recomienda usarlo para 4 estaciones) | research-only (presumiblemente) | mencionado, sin datos |
| FaRL (baseline del paper del dataset) | no disponible | no disponible | ~55 % en la tarea de 4 estaciones (backbone congelado) | no disponible | paper del dataset |
| ResNeXt50 (baseline del paper del dataset) | no disponible | no disponible | ~55 % en la tarea de 4 estaciones (backbone congelado) | no disponible | paper del dataset |

No se dispone de especificaciones completas de los modelos comparables en la informacion proporcionada; los datos de FaRL y ResNeXt50 proceden exclusivamente de la referencia que hace la model card al paper del conjunto de datos.

## Limitaciones y advertencias

- Licencia research-only: no autoriza uso comercial. Cualquier despliegue en producto requiere autorizacion expresa del autor, segun el enlace de licencia.
- Precision top-1 baja (28,95 %). El propio autor recomienda emplear la salida top-3 (64,47 %) y no la top-1 para decisiones practicas.
- La tarea es intrinsecamente ambigua: la armocromia depende de juicio experto sobre subtono, valor y croma, y analistas humanos entrenados discrepan entre si. El conjunto de datos almacena una unica etiqueta por imagen, por lo que predicciones razonables pueden contarse como error.
- Confusiones sistematicas entre categorias adyacentes: los pares `autumn_deep`/`winter_deep`, `winter_cool`/`winter_deep`, `spring_light`/`summer_light` y `spring_warm`/`autumn_warm` concentran buena parte de los errores.
- Calibracion pobre: la confianza media del softmax es 34,6 % en aciertos y 29,7 % en fallos, con una separacion inferior a 5 puntos, por lo que la confianza del modelo no debe usarse como umbral fiable.
- Sesgos de representacion: el modelo se entrena con aproximadamente 3.800 imagenes y unas 300 por clase; con ese volumen por clase, es probable que la generalizacion a tonos de piel, iluminaciones y camaras no representadas en el conjunto sea limitada. El autor no documenta analisis de sesgo por demografia.
- Riesgo de alucinacion en sentido estricto no aplica (no genera texto), pero si existe el riesgo de asignar con aparente seguridad un subtipo erroneo, dado el bajo margen de confianza entre aciertos y errores.
- Desajuste de preprocesado: el modelo se entreno a 224x224 con normalizacion ImageNet, mientras que la configuracion nativa del backbone es 300x300 con media/desviacion 0,5. Replicar esta configuracion fuera de rango puede alterar los resultados.
- Dependencia critica de la variante de backbone: cargar `efficientnetv2_s` en lugar de `tf_efficientnetv2_s` no lanza error y degrada la precision (top-1 de 28,95 % a 27,63 %). Es un fallo silencioso que hay que prevenir explicitamente.
- Seleccion de checkpoint por perdida de validacion, no por accuracy, lo que puede no corresponder al mejor punto en la metrica objetivo.
- Cobertura de idiomas: no aplicable, es un modelo puramente visual. La model card esta redactada en ingles y no se proporciona documentacion en otros idiomas.
- No hay resultados de evaluacion independientes ni verificados; todos los numeros proceden del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/menes000/armocromia-12-season-effnetv2s
- Conjunto de datos: https://huggingface.co/datasets/menes000/armocromia-12-season
- Enlace de licencia del proyecto: https://github.com/lorenzo-stacchio/Deep-Armocromia
- Modelo base (backbone preentrenado): https://huggingface.co/timm/tf_efficientnetv2_s.in21k_ft_in1k
- Perfil del autor: https://huggingface.co/menes000
