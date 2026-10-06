# dronefreak/bdd100k-period-efficientformerv2_l

## Resumen

El modelo `dronefreak/bdd100k-period-efficientformerv2_l` es un clasificador de imagenes de 4 clases que predice el momento del dia (daytime, night, dawn or dusk, unknown) en escenas de conduccion. Lo publica el usuario dronefreak como parte de BDD100K-Toolkit, un conjunto de utilidades para preparar, entrenar y evaluar modelos sobre el dataset BDD100K con las mismas particiones y metricas. Se trata de un ajuste fino del backbone EfficientFormerV2-L (`timm/efficientformerv2_l.snap_dist_in1k`), un transformer jerarquico disenado para eficiencia en dispositivos moviles y edge, con 25,6 millones de parametros segun la model card.

El problema que resuelve es acotado pero util en pipelines de vision para automocion: etiquetar automaticamente la condicion de iluminacion de una imagen de carretera. En el split de test de 10.000 imagenes del dataset `dronefreak/BDD100K-Period-Classification` declara un 93,31% de top-1 accuracy, aunque la metrica macro F1 baja a 81,65% por el fuerte desbalance de clases. La clase mayoritaria (daytime, 5.258 imagenes) alcanza un F1 de 94,36%, mientras que "dawn or dusk" (778 imagenes) se queda en 58,50%.

Es relevante ahora por dos motivos: primero, porque demuestra que un backbone de 25,6 M de parametros puede resolver una tarea de contexto de conduccion con muy poco coste de inferencia; segundo, porque la familia EfficientFormerV2 es un punto de partida habitual para clasificacion de imagenes en entornos con presupuesto de computo limitado, y este checkpoint ofrece una referencia concreta y reproducible dentro de un toolkit abierto. El repositorio ocupa 0,1 GB y la licencia es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientFormerV2-L (transformer jerarquico tipo MetaFormer con mezcladores locales y atencion global) |
| Parametros totales | 25,6 M (segun badge de la model card) |
| Longitud de contexto | No aplicable: clasificador de imagen con entrada de resolucion fija (valor `imgsz` no publicado) |
| Tipos de cuantizacion | No disponible: no se documentan versiones cuantizadas (FP32/FP16 implicitos via PyTorch) |
| Idiomas soportados | No aplicable: no procesa texto |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch: `best.pt`, un `dict` con `state_dict`, `model_name`, `class_names`, `imgsz`, `mean` y `std` |
| Tarea | Clasificacion de imagen, 4 clases (daytime / night / dawn or dusk / unknown) |
| Framework | timm + PyTorch |
| Modelo base | `timm/efficientformerv2_l.snap_dist_in1k` (ImageNet-1k, variante con destilacion) |
| Tamano del repositorio | 0,1 GB |
| Dataset de ajuste | `dronefreak/BDD100K-Period-Classification` |
| Split de evaluacion | `test`, 10.000 imagenes |

## Arquitectura y entrenamiento

EfficientFormerV2 (Li et al., arXiv:2212.08059) es una familia de backbones para vision disenada para latencia baja en movil y edge. La variante L sigue un diseno jerarquico de 4 etapas de inspiracion MetaFormer, con un stem convolucional, mezcladores de tokens locales en las etapas iniciales y atencion multi-cabeza global en las etapas finales, ademas de una busqueda conjunta de tamano y latencia en la receta original del paper. El checkpoint base utilizado aqui, `efficientformerv2_l.snap_dist_in1k`, es la variante entrenada sobre ImageNet-1k con la receta de destilacion incluida por los autores. El modelo publicado sustituye la cabeza de 1.000 clases por una cabeza de 4 clases para la tarea de periodo del dia.

Sobre el proceso de ajuste fino no hay informacion detallada en la model card: no se publican el numero de imagenes de entrenamiento, el numero de epochs, la receta de aumentacion, la tasa de aprendizaje ni si se aplico algun tipo de regularizacion especifica. La unica informacion verificable es la procedencia de las etiquetas, derivadas del campo `attributes.timeofday` de BDD100K (arXiv:1805.04687), y el hecho de que el autor indica que la tarea es no oficial y sigue el dataset de Kaggle del mismo nombre. La model card incluye un ejemplo de inferencia que carga el checkpoint con `weights_only=True` y reconstruye el preprocesado (resize cuadrado, `ToTensor` y normalizacion con `mean`/`std`) a partir de los metadatos guardados en el propio `.pt`.

## Capacidades

- Clasificacion de imagen en 4 clases mutuamente excluyentes: `daytime`, `night`, `dawn or dusk` y `unknown`.
- Inferencia con un unico forward pass sobre la imagen completa (no hay deteccion ni segmentacion).
- Ejecucion en CPU y GPU mediante PyTorch y timm, con el preprocesado definido en el checkpoint.
- Posible uso del backbone como extractor de caracteristicas para tareas posteriores usando la API de timm (no documentado por el autor).
- Soporte de tool calling / function calling: no aplicable (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplicable.
- Capacidades multilingues: no aplicable.
- Capacidades especiales (modo thinking, vision adicional, audio, generacion de texto): no disponibles.
- Salida de probabilidades por clase via `softmax` sobre los logits.

## Casos de uso

- Etiquetado automatico de datasets de conduccion: dado un conjunto de imagenes de carretera, el modelo asigna el periodo del dia sin intervencion manual, lo que permite anotar rapidamente el campo equivalente a `attributes.timeofday` y auditar etiquetas existentes.
- Preprocesado condicional en pipelines de percepcion: la clase predicha se puede usar para activar o desactivar ramas del pipeline (por ejemplo, detectores con umbrales calibrados especificamente para noche) antes de ejecutar el modelo principal, reduciendo falsos positivos en condiciones de baja luminosidad.
- Ajuste automatico de camara / ISP en vehiculo: en sistemas con camaras embarcadas, la etiqueta de iluminacion puede disparar cambios de exposicion, ganancia o modo HDR del modulo de imagen en tiempo real, dado el bajo coste de inferencia del modelo.
- Auditoria de calidad de datos: comparar la prediccion con la etiqueta almacenada permite localizar imagenes mal etiquetadas o casos limite, especialmente en la clase `unknown`, donde la model card reporta solo 35 imagenes de test.
- Analitica de flotas y telemetria: procesar grabaciones de flota para estimar la proporcion de kilometros nocturnos frente a diurnos por ruta, conductor o region, alimentando informes operativos.
- Filtrado previo en sistemas de vision nocturna: usar el clasificador como etapa de enrutado barata para decidir que subconjunto de imagenes pasa a modelos mas costosos (por ejemplo, deteccion con backbone grande) en funcion de la condicion lumínica.
- Generacion de features para modelos tabulares: extraer el embedding del backbone y usarlo como entrada de clasificadores ligeros de condiciones de conduccion (clima, escena, riesgo), evitando entrenar un backbone desde cero.
- Prototipado rapido en investigacion: como baseline reproducible dentro de BDD100K-Toolkit, sirve para comparar nuevas arquitecturas con las mismas particiones y metricas (macro F1, balanced accuracy, precision y recall macro).

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split `test` (10.000 imagenes). Las metricas aparecen como `verified: false` en el model-index, es decir, no han sido verificadas de forma independiente.

| Metrica | Valor |
|---|---|
| Top-1 accuracy | 93,31% |
| Macro F1 | 81,65% |
| Balanced accuracy | 78,36% |
| Macro precision | 86,02% |
| Macro recall | 78,36% |

Desglose por clase:

| Clase | Precision | Recall | F1 | Imagenes de test |
|---|---|---|---|---|
| dawn or dusk | 64,21% | 53,73% | 58,50% | 778 |
| daytime | 93,39% | 95,36% | 94,36% | 5.258 |
| night | 98,03% | 98,65% | 98,34% | 3.929 |
| unknown | 88,46% | 65,71% | 75,41% | 35 |

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en FP32 ocupan aproximadamente 102 MB (25,6 M de parametros x 4 bytes); en FP16, unos 51 MB. Con activaciones y buffers de una sola imagen, el consumo se mantiene muy por debajo de 1 GB.
- GPU recomendadas: no hay recomendaciones publicadas. Para esta tarea una GPU de gama media (GTX 1660, RTX 3060, RTX 4060) es mas que suficiente; modelos de datacenter como A100 o H100 no aportan ventaja practica.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU con al menos 1-2 GB de memoria, e incluso en aceleradores integrados o moviles mediante exportacion a formatos ligeros.
- Cabe en CPU: si, el modelo es lo bastante pequeno para inferencia en CPU a velocidades utilizables en tareas offline.
- Opciones de despliegue: PyTorch + timm, tal como se documenta en la model card. No se documentan exportaciones a ONNX, TorchScript, TFLite, CoreML ni a formatos GGUF/llama.cpp (no aplicables, no es un modelo de lenguaje). Opciones como vLLM, TGI u Ollama no son aplicables.
- Latencia y throughput estimados: no publicados en la informacion disponible.
- Cuantizacion: no se distribuyen versiones cuantizadas; al ser un modelo timm, la cuantizacion dependeria de una conversion externa no documentada por el autor.

## Comparativa con modelos similares

La model card incluye una tabla "Model Zoo" con otros clasificadores evaluados sobre el mismo split de test con la misma tarea. El EfficientFormerV2-L publicado no aparece en ese fragmento de tabla, pero sus valores (93,31% top-1, 81,65% macro F1) quedan por debajo de todas las entradas listadas en el fragmento disponible.

| Modelo | Top-1 | Macro F1 | Balanced accuracy | Macro precision |
|---|---|---|---|---|
| TinyViT-21M | 94,01% | 83,19% | 79,63% | 87,95% |
| EfficientViT-L1 | 93,98% | 82,68% | 78,45% | 88,75% |
| ConvNeXt-Atto | 93,95% | 80,75% | 76,82% | 86,39% |
| EfficientViT-B2 | 93,92% | 82,53% | 78,88% | 87,49% |
| RepViT-M2.3 | 93,89% | 82,35% | 78,49% | 87,72% |
| EfficientFormerV2-L (este modelo) | 93,31% | 81,65% | 78,36% | 86,02% |

Datos no disponibles en la informacion proporcionada: numero de parametros de cada alternativa, longitud de contexto (no aplicable), licencia de cada checkpoint y disponibilidad de pesos. La comparativa se limita por tanto a las metricas declaradas sobre el mismo split. Conviene senalar que varios de los modelos con mejor top-1 en la tabla son arquitecturas mas pequenas en numero de parametros, lo que sugiere un coste computacional superior del EfficientFormerV2-L para un rendimiento ligeramente inferior en esta tarea concreta.

## Limitaciones y advertencias

- Rendimiento muy desigual por clase: el F1 de "dawn or dusk" es del 58,50% con un recall del 53,73%, es decir, aproximadamente la mitad de las imagenes de amanecer/atardecer se clasifican mal. Es la principal debilidad del modelo.
- La top-1 accuracy del 93,31% esta inflada por el desbalance de clases: daytime y night suman 9.187 de las 10.000 imagenes de test. La metrica macro F1 (81,65%) refleja mucho mejor el comportamiento real.
- La clase `unknown` cuenta con solo 35 imagenes en test, por lo que sus metricas (F1 75,41%) tienen una varianza muy alta y no son fiables como estimacion.
- Metricas no verificadas: el model-index marca `verified: false`; los valores proceden del autor y no de una evaluacion independiente.
- Sesgo de dominio: el modelo se ajusta exclusivamente sobre BDD100K, un dataset de escenas de conduccion. Es esperable una degradacion fuera de ese dominio (otras geografias, camaras, condiciones meteorologicas o resoluciones).
- Riesgo de error en condiciones limite: escenas nocturnas con iluminacion artificial intensa, tuneles, interiores o amaneceres muy breves pueden confundirse entre clases.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling, agentes ni razonamiento multi-paso. Cualquier expectativa en ese sentido es inaplicable.
- Licencia del modelo: Apache-2.0, permisiva y compatible con uso comercial. No obstante, el dataset subyacente procede de BDD100K, que tiene sus propios terminos de uso; conviene verificar la licencia de BDD100K antes de explotar comercialmente un modelo derivado de el. La informacion disponible no detalla esos terminos.
- Carga del checkpoint: el fichero `best.pt` no contiene solo el `state_dict`, sino un diccionario con metadatos. Se debe cargar con `weights_only=True` y reconstruir el modelo con `timm.create_model(ckpt["model_name"], pretrained=False, num_classes=len(ckpt["class_names"]))`, tal como indica el autor.
- No se documenta el tratamiento de imagenes fuera de distribucion ni ningun mecanismo de calibracion de probabilidades, por lo que la confianza `softmax` no debe interpretarse como probabilidad calibrada en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dronefreak/bdd100k-period-efficientformerv2_l
- Repositorio BDD100K-Toolkit: https://github.com/dronefreak/bdd100k-toolkit
- Dataset de clasificacion de periodo: https://huggingface.co/datasets/dronefreak/BDD100K-Period-Classification
- Modelo base: https://huggingface.co/timm/efficientformerv2_l.snap_dist_in1k
- Paper de EfficientFormerV2: https://arxiv.org/abs/2212.08059
- Paper de BDD100K: https://arxiv.org/abs/1805.04687
- Busqueda web: no se han encontrado enlaces relevantes adicionales; los resultados devueltos no guardan relacion con el modelo.
