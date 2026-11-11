# quacknode/ktcoralcls-convnext

## Resumen

KTCoralCLS ConvNeXt es un clasificador de imagenes basado en ConvNeXt-Tiny, ajustado para la identificacion de generos de coral. Lo desarrolla el usuario quacknode y se publica como el checkpoint principal de despliegue del trabajo KTCoralCLS, entrenado sobre el conjunto de datos KTCoral con una particion de retencion por grupos de imagen parental (parent-image group hold-out), lo que evita fugas de informacion entre entrenamiento y test.

El modelo resuelve una tarea de clasificacion de imagenes de grano fino en un dominio cientifico concreto: distinguir entre 36 generos de coral a partir de imagenes RGB de 224x224 normalizadas con estadisticas de ImageNet. Es relevante para flujos de monitorizacion de arrecifes, anotacion asistida de inventarios biologicos y proyectos de vision por computador en biologia marina, donde la identificacion manual por taxonomos es costosa.

Se distribuye como un unico fichero `best.pt` de PyTorch (repo de 0,1 GB) acompanado de un paquete Python (`ktcoralcls`) con utilidades de carga y la lista de generos. La model card reporta 81,9 % de accuracy, F1 macro de 0,796 y F1 del peor genero de 0,625 sobre el split de test. La licencia figura como "other", sin terminos adicionales publicados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt-Tiny (red convolucional pura, familia ConvNeXt) |
| Parametros totales | no disponible (ConvNeXt-Tiny estandar ronda los 28 M, no confirmado en la informacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada de imagen 224x224) |
| Tipos de cuantizacion | no disponible (solo se publica checkpoint PyTorch `best.pt`) |
| Idiomas soportados | no aplica (clasificacion de imagenes) |
| Licencia | other |
| Formato de pesos | PyTorch (`.pt`, state dict cargado via `load_checkpoint`) |

## Arquitectura y entrenamiento

La arquitectura es ConvNeXt-Tiny, una red convolucional pura de la familia ConvNeXt que moderniza el diseno de ResNet con bloques de convolucion depthwise de mayor kernel, normalizacion LayerNorm y activaciones GELU. El modelo recibe imagenes RGB de 224x224 normalizadas con media y desviacion tipica de ImageNet y produce logits sobre 36 clases correspondientes a generos de coral.

El entrenamiento se realizo sobre el dataset KTCoral con una particion de retencion por grupos de imagen parental, de modo que las imagenes derivadas de una misma captura no se reparten entre train y test. Esta decision metodologica reduce el sesgo optimista habitual en clasificacion de imagenes cuando existen recortes o augmentaciones de la misma fuente. No se detallan en la informacion disponible el numero de imagenes de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste fino adicional mas alla del entrenamiento supervisado. Tampoco se especifican estrategias de aumento de datos, regimen de learning rate ni numero de epocas.

## Capacidades

- Clasificacion de imagenes en 36 generos de coral a partir de entradas RGB de 224x224.
- Inferencia sobre GPU (CUDA) o CPU, segun el codigo de carga proporcionado por el autor.
- Integracion con el paquete Python `ktcoralcls`, que expone la lista `GENERA` y la funcion `load_checkpoint`.
- No soporta generacion de texto, tool calling, agentes, razonamiento multi-paso, vision general fuera del dominio de corales, audio ni modo "thinking".
- Capacidades multilingues: no aplica.
- Capacidad especial: ninguna documentada; es un clasificador discriminativo puro.

## Casos de uso

- Anotacion asistida de inventarios de arrecifes: el modelo preetiqueta recortes de imagen con el genero de coral probable, y un taxonomo revisa y corrige, reduciendo el tiempo de anotacion manual en campanas de monitorizacion.
- Monitorizacion de salud de arrecifes a lo largo del tiempo: clasificar imagenes de transectos repetidos para medir cambios en la composicion de generos entre anos.
- Triaje en ciencia ciudadana: filtrar y agrupar imagenes subidas por voluntarios por genero antes de la validacion experta, priorizando las clases con menor F1 (hasta 0,625 en el peor genero) para revision.
- Preprocesado en pipelines de vision submarina: como primera etapa de un sistema mayor que, tras identificar el genero, aplique un modelo especifico de especie o de estado de salud.
- Docencia e investigacion en biologia marina: herramienta de apoyo para practicas de identificacion taxonomica con retroalimentacion inmediata sobre imagenes de referencia.
- Benchmark interno de clasificacion de grano fino: servir de linea base ConvNeXt-Tiny para comparar futuros modelos en el mismo split por grupos de imagen parental del dataset KTCoral.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card sobre el split de test con retencion por grupos de imagen parental:

| Metrica | Valor |
|---|---|
| Accuracy | 81,9 % |
| F1 macro | 0,796 |
| F1 del peor genero | 0,625 |
| Clases | 36 generos de coral |

No se han publicado en la informacion disponible resultados comparativos con otros modelos (ResNet, ViT, EfficientNet, etc.) ni desglose por clase mas alla del peor genero.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; un ConvNeXt-Tiny en fp32 ocupa del orden de 0,1 GB de pesos (coherente con el tamano del repo), por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con CUDA, incluidas RTX 3060, RTX 4090, A100 o H100; tambien es viable en CPU para lotes pequenos.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas e incluso en GPUs integradas para inferencia por lotes reducidos.
- Opciones de despliegue: PyTorch nativo mediante `ktcoralcls.model.load_checkpoint`; al ser un `.pt` de PyTorch, se puede exportar a TorchScript u ONNX para servir con TorchServe, ONNX Runtime o Triton, aunque estas conversiones no estan documentadas por el autor.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de resultados de este modelo frente a alternativas comparables (por ejemplo, otros clasificadores de imagen de tamano similar como ResNet-50, EfficientNet-B0 o ViT-Small) sobre el mismo dataset KTCoral. La comparativa cuantitativa queda, por tanto, no disponible.

| Modelo | Parametros | Contexto | Rendimiento en KTCoral | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KTCoralCLS ConvNeXt | no disponible | no aplica | 81,9 % accuracy, F1 macro 0,796 | other | Hugging Face (repo 0,1 GB) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Dominio muy restringido: solo clasifica 36 generos de coral; fuera de ese dominio las predicciones no son fiables.
- El peor genero alcanza un F1 de 0,625, lo que indica un rendimiento desigual entre clases; conviene revisar manualmente las clases minoritarias o dificiles.
- Riesgo de alucinacion en sentido clasico no aplica, pero si de falsos positivos confiados en imagenes degradadas, con poca luz o fuera de distribucion.
- La particion por grupos de imagen parental mitiga la fuga de datos, pero no se documenta el tamano ni la diversidad geografica del conjunto de test, lo que limita la generalizacion a otros arrecifes.
- Licencia "other": no se publican terminos explicitos, por lo que el uso comercial requiere contactar con el autor o revisar el repositorio de codigo antes de desplegar.
- No se documentan sesgos demograficos (no aplica) pero si posibles sesgos de muestreo del dataset KTCoral, no detallados.
- El checkpoint se distribuye solo en PyTorch (`.pt`); no hay versiones GGUF, ONNX ni cuantizadas oficiales, lo que complica el despliegue en entornos sin PyTorch.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/quacknode/ktcoralcls-convnext
- Dataset KTCoral: https://huggingface.co/datasets/quacky/ktcoral
- Codigo y splits: https://github.com/QuackBeans/KTCoralCLS
