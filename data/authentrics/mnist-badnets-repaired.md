# authentrics/mnist-badnets-repaired

## Resumen

`authentrics/mnist-badnets-repaired` no es un modelo de lenguaje: es el checkpoint "despues" de una demostracion de forense de modelos sobre un clasificador LeNet-5 de MNIST entrenado con un ataque de puerta trasera (backdoor) de tipo BadNets. Lo publica Authentrics, empresa responsable de una libreria de analisis de redes neuronales (wheel de Python sobre un nucleo en C++) orientada a auditar checkpoints, medir deriva de parametros y comportamiento, y eliminar el efecto de datos de entrenamiento concretos sin reentrenar desde cero. El modelo resuelve un problema muy especifico: comprobar, de forma reproducible, que es posible neutralizar una puerta trasera localizada en una unica sesion de entrenamiento en lugar de descartar el modelo completo.

El checkpoint se genera aplicando el operador `exclude_training` de Authentrics sobre el checkpoint final envenenado (`epoch_10.pt`) del modelo `authentrics/mnist-badnets-poisoned`. El resultado medido es una caida de la tasa de exito del ataque (attack success rate) del 8,70 % al 0,13 %, con un coste en precision limpia que baja del 98,25 % al 96,98 %, y sin necesidad de reentrenar el modelo. La model card subraya que se trata de un proyecto de investigacion y demostracion, no de una herramienta de seguridad lista para produccion.

La relevancia es metodologica mas que de rendimiento: ilustra un flujo de trabajo de auditoria en el que una ejecucion de entrenamiento se trata como una secuencia de checkpoints investigables, en lugar de como un artefacto opaco. Sus dimensiones son minimas (clasificador convolucional sobre imagenes de 28x28 en escala de grises, con un tamano de repositorio que figura como 0,0 GB) y su licencia es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal convolucional LeNet-5 (segun la receta BadNets/TrojAI replicada) |
| Parametros totales | No disponible en la model card (la LeNet-5 clasica para MNIST tiene del orden de 60.000 parametros; el recuento exacto de este checkpoint no se publica) |
| Parametros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No aplicable (clasificador de imagenes; entrada MNIST de 28x28x1) |
| Tipos de cuantizacion | No disponible (se distribuye como checkpoint PyTorch, presumiblemente FP32) |
| Idiomas soportados | No aplicable (clasificacion de imagenes, no texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | Checkpoint de PyTorch (`.pt`) incluido en el repositorio; libreria declarada: `pytorch` |
| Tarea (pipeline) | `image-classification` |
| Clases de salida | 10 digitos (0-9, conjunto MNIST) |
| Tamano del repositorio | 0,0 GB |
| Version del SDK utilizada | Authentrics SDK v0.35.1 |
| Fecha de creacion | 2026-09-16 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es una LeNet-5, la red convolucional clasica de cinco capas con capas densas finales empleada habitualmente como referencia sobre MNIST. La model card no detalla el numero exacto de capas, canales, funciones de activacion ni hiperparametros del entrenamiento original; unicamente indica que se reproduce una receta BadNets de estilo TrojAI, es decir, un entrenamiento envenenado en el que una porcion de los datos lleva un disparador (trigger) que provoca una clasificacion erronea controlada por el atacante. El modelo original se entreno durante al menos 10 epocas, ya que el checkpoint final envenenado se identifica como `epoch_10.pt`, y la puerta trasera quedo localizada en la sesion de entrenamiento correspondiente a la epoca 2.

La innovacion tecnica no esta en la arquitectura, sino en el procedimiento de reparacion. El operador `exclude_training` elimina quirurgicamente el efecto de una unica sesion de entrenamiento del checkpoint final, sustrayendo lo que esa epoca aporto al modelo; con ello la tasa de exito del ataque cae del 8,70 % al 0,13 %. El coste es real: al eliminar la influencia de una epoca se elimina tambien el aprendizaje legitimo que contenia, y la precision limpia baja del 98,25 % al 96,98 %. Para el caso distribuido, en el que el disparador esta presente en todas las epocas y no puede localizarse en una sola sesion, la model card propone `ztom_analysis` como alternativa: una optimizacion sin gradientes (gradient-free) del checkpoint final contra un objetivo combinado. En ese escenario no hay eliminacion, solo supresion, y el coste en precision limpia es mayor. No se documenta uso de RLHF, DPO ni tecnicas de alineacion, logicamente ajenas a este tipo de modelo.

## Capacidades

- Clasificacion de imagenes de digitos manuscritos (0-9) del conjunto MNIST, con una precision limpia declarada del 96,98 % tras la reparacion.
- Comportamiento sin puerta trasera practicamente neutralizado: la tasa de exito del ataque medida baja al 0,13 %, frente al 8,70 % del checkpoint envenenado de partida.
- Actua como referencia "antes/despues" reproducible para investigacion en eliminacion de backdoors, dado que su contraparte envenenada (`authentrics/mnist-badnets-poisoned`) tambien es publica.
- Sirve de banco de pruebas para el operador `exclude_training` del SDK de Authentrics (eliminacion del efecto de una sesion de entrenamiento concreta sin reentrenamiento completo).
- Sirve tambien de banco de pruebas para `ztom_analysis`, la alternativa para ataques distribuidos no localizables en una sola epoca.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un clasificador de imagenes de proposito unico.
- No incorpora modo de pensamiento (thinking mode), vision general, audio ni generacion de texto.
- La propia libreria de analisis ejecuta el analisis en local: solo se intercambian metadatos de proyecto con los servidores de Authentrics, nunca los pesos del modelo; requiere clave de API para su uso.

## Casos de uso

- Auditoria de checkpoints en cadena de suministro de modelos: dado un modelo heredado de un tercero, localizar la sesion de entrenamiento responsable de un comportamiento anomalo y eliminarla con `exclude_training`, comparando despues el checkpoint reparado con el original para verificar la neutralizacion del disparador.
- Validacion de herramientas de deslearning y unlearning: el par envenenado/reparado permite medir de forma objetiva la eficacia de un operador de eliminacion sobre una puerta trasera conocida y reproducible, con metricas declaradas de precision limpia y tasa de exito del ataque.
- Docencia y formacion en seguridad de IA: es un ejemplo de escala reducida (MNIST, un repositorio de 0,0 GB) que se ejecuta en cualquier portatil, adecuado para explicar el ciclo completo de ataque, deteccion, localizacion y reparacion sin necesidad de infraestructura de GPU.
- Reproduccion de resultados en investigacion: los scripts `run_demo.py` y `run_demo_distributed.py` del repositorio publico permiten regenerar el checkpoint corregido y comparar los dos escenarios (backdoor localizado en una epoca frente a backdoor distribuido).
- Cumplimiento normativo y derecho al olvido: el operador `exclude_training` se presenta como mecanismo para retirar el efecto de una porcion de datos de entrenamiento sin reentrenar el modelo completo, lo que resulta directamente aplicable a flujos de trabajo de cumplimiento sobre datos sensibles.
- Prototipado de pipelines de clasificacion de digitos: al ser una LeNet-5 entrenada sobre MNIST, puede emplearse como modelo de referencia en demos de OCR de digitos, lectores de formularios o sistemas de verificacion de codigos postales y numeros manuscritos.
- Integracion en pruebas de regresion de CI: el checkpoint reparado puede usarse como caso de prueba que verifique que un cambio en el pipeline de entrenamiento no reintroduce la puerta trasera, comparando la tasa de exito del ataque contra el umbral declarado del 0,13 %.

## Benchmarks y rendimiento

Los unicos resultados publicados son los de la demostracion de reparacion, medidos sobre el propio conjunto de evaluacion del demo (precision limpia y tasa de exito del ataque):

| Metrica | Original (epoch_10) | Corregido (`exclude_training`) |
|---|---|---|
| Precision limpia | 98,25 % | 96,98 % |
| Tasa de exito del ataque (attack success) | 8,70 % | 0,13 % |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni son aplicables a un clasificador de imagenes de este tipo. Tampoco se publican cifras de latencia, throughput ni resultados de `ztom_analysis` en el caso distribuido mas alla de la afirmacion cualitativa de que ayuda pero con mayor coste en precision limpia.

## Requisitos de hardware

- Inferencia en CPU: viable sin GPU. Es un clasificador convolucional de escala MNIST con un recuento de parametros del orden de decenas de miles, por lo que la inferencia es trivial en cualquier CPU moderna.
- VRAM estimada: inferior a 1 GB en cualquier configuracion habitual; cabe holgadamente incluso en GPU integradas. Cifra exacta no publicada.
- GPU recomendadas: no aplica ninguna GPU de gama alta. Cualquier GPU consumer (por ejemplo, GTX 1050, RTX 3050 o superiores) es mas que suficiente; tambien A100, H100 o T4 si se integra en un servicio ya existente.
- Cabe en GPU consumer: si, en todas las gamas, y tambien en entornos sin GPU.
- Opciones de despliegue: carga directa del checkpoint PyTorch (`.pt`) con PyTorch; exportacion a TorchScript u ONNX si se necesita servir fuera de Python. No aplican vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Herramientas asociadas: SDK de Authentrics (`pip install authentrics`), disponible para Linux x86_64 y Python 3.11-3.13, con clave de API obtenida en `app.authentrics.ai`. El analisis se ejecuta en local.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Precision limpia | Tasa de exito del ataque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `authentrics/mnist-badnets-repaired` (este modelo) | LeNet-5 MNIST, backdoor eliminado con `exclude_training` | 96,98 % | 0,13 % | Apache-2.0 | Publico en HuggingFace, 0 descargas |
| `authentrics/mnist-badnets-poisoned` | LeNet-5 MNIST con backdoor BadNets | 98,25 % | 8,70 % | No indicada en la informacion disponible | Referenciado en la model card de este repositorio |
| LeNet-5 original sobre MNIST (LeCun et al., 1998) | CNN de referencia para MNIST, sin backdoor | No disponible en la informacion proporcionada | No aplicable | No aplicable | Referencia academica ampliamente replicada |
| Otras variantes de la familia TrojAI | Modelos envenenados de referencia para investigacion en trojan detection | No disponible | No disponible | No disponible | Conjuntos de referencia publicos del programa TrojAI |

La comparacion con alternativas de gran escala no es significativa: no existen "modelos comparables" en el sentido de LLM de tamano similar, porque la categoria es la de clasificadores de juguete para investigacion en seguridad de modelos. La unica comparacion directa y documentada es contra el checkpoint envenenado del que deriva.

## Limitaciones y advertencias

- No es una herramienta de seguridad de produccion. La model card lo declara explicitamente: es un proyecto de investigacion y demostracion, y no constituye una afirmacion general de que Authentrics (ni ninguna otra herramienta) detecte puertas traseras arbitrarias en modelos arbitrarios.
- El resultado depende de que la puerta trasera este localizada en una unica sesion de entrenamiento. Si el disparador esta distribuido por todas las epocas, `exclude_training` no tiene nada que sustraer y hay que recurrir a `ztom_analysis`, que solo suprime el comportamiento en lugar de eliminarlo y degrada mas la precision limpia.
- La reparacion no es gratuita: eliminar la influencia de una epoca elimina tambien el aprendizaje legitimo que contenia. En este caso, la precision limpia cae 1,27 puntos porcentuales (de 98,25 % a 96,98 %).
- No se han publicado mediciones de robustez frente a otros disparadores, variaciones del ataque, ni evaluaciones sobre conjuntos distintos de MNIST; la generalizacion de la tasa de exito del 0,13 % a otros escenarios no esta respaldada por datos.
- Riesgo de alucinacion: no aplicable en el sentido habitual, pero si existe un riesgo analogo de falsos negativos: un clasificador reparado puede seguir respondiendo incorrectamente ante entradas adversarias o distribuciones fuera de MNIST sin que las metricas publicadas lo reflejen.
- Sesgos conocidos: no documentados. Proceden, en su caso, de la composicion del conjunto MNIST (digitos manuscritos en su mayoria de poblaciones angloparlantes), pero no se aportan analisis de sesgo.
- Limitacion de idioma: no aplicable, el modelo no procesa texto.
- Ambito de uso reducido: solo clasifica digitos manuscritos de 28x28 en escala de grises; no generaliza a otras tareas de vision ni a otras resoluciones sin reentrenamiento.
- Licencia Apache-2.0: permite uso comercial, modificacion y redistribucion con atribucion y conservacion del aviso de licencia; no se imponen restricciones de uso adicionales en la informacion disponible.
- Requiere clave de API y conexion con los servidores de Authentrics para usar la libreria de analisis; los pesos no salen de la maquina, pero si se envian metadatos del proyecto. La compatibilidad del SDK se limita a Linux x86_64 con Python 3.11-3.13.
- Descargas y likes nulos (0/0) en el momento de la consulta: no hay validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/authentrics/mnist-badnets-repaired
- Checkpoint envenenado de partida: https://huggingface.co/authentrics/mnist-badnets-poisoned
- Codigo y resultados de la demostracion: https://github.com/Authentrics-ai/trojai-authentrics-demo
- Ejemplos y guia de usuario del SDK: https://github.com/Authentrics-ai/authentrics-analysis-examples
- Aplicacion y generacion de claves de API: https://app.authentrics.ai/
- Documentacion y referencia de la API: https://app.authentrics.ai/docs
- Contacto: info@authentrics.ai
- Resultados de busqueda web: no se ha recuperado ningun enlace relevante sobre este modelo; los resultados disponibles corresponden a temas sin relacion (estaciones de energia portatiles y comunidades de preguntas y respuestas generalistas), por lo que se descartan.
