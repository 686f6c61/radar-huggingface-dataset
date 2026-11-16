# ganggangai/snap-plate-stack-instance-dfine-v5

## Resumen

snap-plate-stack-instance-dfine-v5 es un modelo de deteccion de objetos basado en la familia D-FINE, afinado por el usuario ganggangai a partir del checkpoint aguxez/snap-plate-instance-localization-dfine-v4. Su proposito concreto es la localizacion de instancias de matriculas de vehiculo (weight plate) en imagenes, una tarea de vision por computador con aplicaciones directas en control de accesos, peajes y analitica de trafico. El modelo se publica con licencia Apache 2.0 y pesos en formato safetensors, lo que facilita su integracion en pipelines de inferencia estandar.

Con 10.248.621 parametros, es un modelo compacto que puede ejecutarse en GPU de consumo e incluso en CPU para cargas moderadas. La model card es practicamente automatica (generada por el Trainer de Hugging Face) y no incluye descripcion funcional detallada, por lo que gran parte de la informacion tecnica debe inferirse de los hiperparametros de entrenamiento y de las metricas de evaluacion publicadas. El checkpoint declara un mAP global de 0,8835 sobre el conjunto de evaluacion, con mAP@50 y mAP@75 de 1,0, lo que indica una localizacion muy precisa en el umbral laxo y una buena calidad de cajas en el umbral estricto.

La relevancia de este modelo es acotada pero clara: cubre un nicho especifico (deteccion de matriculas) con un rendimiento alto en su conjunto de validacion y un coste computacional bajo. No es un modelo de proposito general ni un LLM: es un detector de objetos especializado, y debe evaluarse como tal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | D-FINE (detector de objetos basado en transformers, fine-tune de aguxez/snap-plate-instance-localization-dfine-v4) |
| Parametros totales | 10.248.621 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | no disponible (modelo de vision, sin capacidades linguisticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune de D-FINE, una familia de detectores de objetos que combina un backbone convolucional con un decoder transformer para la prediccion de cajas y clases. El checkpoint base es aguxez/snap-plate-instance-localization-dfine-v4, y este v5 se ha entrenado sobre el dataset aguxez/snap-plate-stack-instance-v5 (formato imagefolder). La model card no detalla la composicion del dataset, el numero de imagenes ni el numero de tokens o muestras de entrenamiento, por lo que esos datos deben considerarse no disponibles.

Los hiperparametros declarados son: learning rate 1e-06, batch de entrenamiento y evaluacion de 4, semilla 7, optimizador AdamW con betas (0,9, 0,999) y epsilon 1e-08, scheduler lineal con warmup del 5 %, 8 epocas y precision mixta nativa (AMP). El entrenamiento se realizo con Transformers 5.14.1, PyTorch 2.13.0+cu130, Datasets 5.0.1 y Tokenizers 0.22.2. No se documenta el uso de RLHF, DPO ni tecnicas de decodificacion especulativa, algo esperable en un detector de objetos.

## Capacidades

- Deteccion de instancias de matriculas de vehiculo (clase "weight plate") en imagenes.
- Localizacion precisa de cajas delimitadoras, con mAP@50 y mAP@75 de 1,0 en el conjunto de evaluacion.
- Deteccion en objetos de tamano medio y grande (mAP Medium 0,9; mAP Large 0,8831).
- Capacidad de recuperacion de instancias a distintos umbrales de IoU (mAR@1 0,3375; mAR@10 0,9375; mAR@100 0,95).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente visual.
- No tiene capacidades multilingues ni de generacion de texto.
- No dispone de modo "thinking", vision multimodal ni audio.

## Casos de uso

- Control de accesos en parkings y garajes: el modelo detecta la matricula en la imagen capturada por la camara de entrada y devuelve la caja delimitadora, que se puede recortar y pasar a un OCR especializado. Su mAP@50 de 1,0 en el conjunto de validacion lo hace adecuado para esta tarea cuando las condiciones de captura son similares a las del entrenamiento.
- Peajes y autopistas de cobro automatico: integrado en un pipeline de vision, localiza la matricula en fotogramas de camara para su posterior lectura. El bajo numero de parametros (10,2 M) permite desplegarlo en dispositivos de borde con GPU integrada.
- Analitica de trafico urbano: deteccion de matriculas en imagenes de camaras de vigilancia para anonimizacion automatica (difuminado de la caja detectada) antes de almacenar o publicar las imagenes.
- Verificacion de flotas y logistica: en aplicaciones de inspeccion de vehiculos, el modelo localiza la matricula para comprobar su presencia y posicion en la imagen, como paso previo a la validacion de estado del vehiculo.
- Preprocesado para OCR de matriculas: al aislar la region de la matricula con una caja precisa, se reduce el ruido de fondo y se mejora la tasa de acierto de los motores OCR aguas abajo.
- Prototipado e investigacion en deteccion de objetos: al ser un fine-tune de D-FINE con licencia Apache 2.0 y pesos safetensors, sirve como punto de partida para experimentos de deteccion de instancias en dominios similares (senalizacion, placas, etiquetas).

## Benchmarks y rendimiento

Resultados declarados por el autor en el conjunto de evaluacion (epoca 8, la final):

| Metrica | Valor |
|---|---|
| Loss | 3,5716 |
| mAP | 0,8835 |
| mAP@50 | 1,0 |
| mAP@75 | 1,0 |
| mAP Small | -1,0 (sin instancias pequenas evaluables) |
| mAP Medium | 0,9 |
| mAP Large | 0,8831 |
| mAR@1 | 0,3375 |
| mAR@10 | 0,9375 |
| mAR@100 | 0,95 |
| mAR Small | -1,0 |
| mAR Medium | 0,9 |
| mAR Large | 0,9571 |
| mAP Weight Plate | 0,8835 |
| mAR@100 Weight Plate | 0,95 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible. El model-index oficial no contiene entradas de resultados (`results: []`).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para los 10,2 M de parametros, mas el coste de activaciones segun resolucion de imagen; en la practica, menos de 2 GB en la mayoria de configuraciones.
- GPU recomendadas: cualquier GPU moderna es suficiente; una RTX 4090, A100 o H100 estan sobredimensionadas para este modelo. Una GTX 1650, RTX 3050 o incluso una GPU integrada pueden ejecutarlo.
- Cabe en GPU de consumo: si, en practicamente todas las GPU consumer de los ultimos anos, y es viable en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: Transformers (pipeline `object-detection`), y en general cualquier runtime que cargue safetensors; no se documentan exportaciones a ONNX, TensorRT ni GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada. Como referencia estructural, este modelo pertenece a la familia D-FINE y comparte arquitectura con su checkpoint base aguxez/snap-plate-instance-localization-dfine-v4, pero no se han publicado metricas de ese checkpoint en la informacion disponible para establecer una comparacion cuantitativa.

| Modelo | Parametros | Contexto | mAP | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| snap-plate-stack-instance-dfine-v5 | 10.248.621 | no aplica | 0,8835 | Apache 2.0 | Hugging Face |
| aguxez/snap-plate-instance-localization-dfine-v4 | no disponible | no aplica | no disponible | no disponible | Hugging Face |
| Alternativas de deteccion de matriculas | no disponible | no aplica | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La model card es automatica y no describe usos previstos, limitaciones ni composicion del dataset; falta informacion critica para evaluar sesgos y generalizacion.
- El modelo solo detecta la clase "weight plate"; no detecta otras clases de objetos ni realiza OCR de la matricula.
- mAP Small es -1,0, lo que indica que no hay instancias pequenas evaluables en el conjunto de validacion; el rendimiento en matriculas muy pequenas o lejanas no esta caracterizado.
- El conjunto de evaluacion parece pequeno (el entrenamiento completo son 56 pasos con batch 4 y 8 epocas), por lo que las metricas pueden tener alta varianza y no ser representativas de condiciones reales diversas.
- Riesgo de alucinacion: en deteccion de objetos se traduce en falsos positivos y cajas mal localizadas en escenas fuera de distribucion (angulos extremos, baja iluminacion, oclusion, matriculas extranjeras).
- No se documentan sesgos demograficos ni geograficos, pero al desconocerse el dataset de entrenamiento no puede descartarse un sesgo hacia un tipo concreto de matricula o pais.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero se recomienda verificar la procedencia del dataset de entrenamiento, ya que la licencia del modelo no cubre necesariamente los datos subyacentes.
- Para produccion, es imprescindible validar el modelo con un conjunto propio representativo del dominio de despliegue antes de confiar en las metricas publicadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ganggangai/snap-plate-stack-instance-dfine-v5
- Modelo base: https://huggingface.co/aguxez/snap-plate-instance-localization-dfine-v4
- Dataset declarado: aguxez/snap-plate-stack-instance-v5 (referenciado en la model card; no se proporciona URL directa)
- Repositorio D-FINE: no disponible en la informacion proporcionada
- Paper de D-FINE: no disponible en la informacion proporcionada
