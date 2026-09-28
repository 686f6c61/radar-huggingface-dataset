# Compactbot/logo-gan-3.5m

## Resumen

Logo GAN 3.5M es un modelo de generación de imágenes de tipo GAN convolucional profunda (DCGAN) entrenado desde cero por el usuario Compactbot, un agente orientado a la comunidad de modelos pequenos (SLM). El modelo resuelve una peticion concreta publicada en el espacio Compactbot/model-requests: generar imagenes "parecidas a logotipos" con un modelo muy pequeno y reproducible. Se compone de un par generador/discriminador con un total de 3.498.762 parametros (2.838.278 en el generador y 660.484 en el discriminador), lo que lo situa en la categoria de modelos que se entrenan en una sola GPU en menos de una hora.

La tarea es incondicional: el generador mapea un vector latente de 128 dimensiones a una imagen RGB de 64x64 pixeles con valores en el rango [-1, 1]. No es un modelo de lenguaje, no acepta prompts de texto ni tiene ventana de contexto; su entrada es ruido latente y su salida es una imagen fija de baja resolucion. Se distribuye como checkpoint de PyTorch (`final.pt`) con los `state_dict` del generador y del discriminador, bajo licencia Apache 2.0.

Su relevancia es acotada pero clara: sirve como referencia reproducible de una DCGAN completa (script de entrenamiento incluido, datos de preparacion incluidos) y como banco de pruebas para medir diversidad y colapso de modos en modelos generativos diminutos. El propio autor advierte que las salidas capturan la distribucion estadistica de los logotipos (color, contraste, composicion) y no marcas legibles, por lo que no deben tratarse como activos de marca utilizables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GAN convolucional profunda (DCGAN): generador con convoluciones transpuestas + discriminador convolucional |
| Parametros totales | 3.498.762 (generador 2.838.278 + discriminador 660.484) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: la entrada del generador es un vector latente de 128 dimensiones |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | en (etiqueta declarada por el autor); la tarea es generacion de imagenes, no texto |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`.pt`, checkpoint con los `state_dict` de `g` y `d`) |
| Resolucion de salida | 64x64x3 RGB, valores en [-1, 1] |
| Dimension latente | 128 |
| Dataset de entrenamiento | `samp3209/logo-dataset` (primeras 100 imagenes validas del split de train, redimensionadas a 64x64) |
| Libreria | pytorch |
| Pipeline declarado en HuggingFace | No disponible |
| Tamano del repositorio | 0.0 GB segun los metadatos de HuggingFace |

## Arquitectura y entrenamiento

El generador sigue la receta DCGAN clasica: `Linear(128, 256*8*8)` seguido de BatchNorm y ReLU, un reshape a (256, 8, 8) y tres bloques `ConvTranspose2d` con kernel 4, stride 2 y padding 1 (256 -> 128 -> 64 -> 3 canales), con BatchNorm y ReLU en los dos primeros y activacion Tanh en el ultimo. El discriminador es simetrico: tres convoluciones `Conv2d(3,64)`, `Conv2d(64,128)` y `Conv2d(128,256)` con kernel 4, stride 2 y padding 1, cada una con BatchNorm y LeakyReLU(0.2), seguidas de `AdaptiveAvgPool2d(1)`, `Flatten` y una capa `Linear(256,1)` que produce un logit escalar real/falso.

Los datos son extremadamente reducidos: 100 logotipos RGB de 64x64, redimensionados bilinealmente y normalizados a [0,1], almacenados en `logos64.npy` con forma (100, 64, 64, 3) en float32. El entrenamiento usa Adam con learning rate 2e-4 y betas (0.5, 0.999), batch de 64, 4000 pasos, una actualizacion del discriminador y una del generador por iteracion, y `BCEWithLogitsLoss`. Se ejecuto sobre una NVIDIA RTX 5090 (CUDA). Las perdidas finales registradas son `d_loss 0.0711` y `g_loss 3.5900`. No se documenta uso de RLHF, DPO ni decodificacion especulativa, logica para un modelo de este tipo. La model card indica que la configuracion originalmente discutida (aproximadamente 8,8 M de parametros, latente 100 y 12000 pasos) no es la que se distribuye: el checkpoint publicado corresponde a la configuracion de 3,5 M / latente 128 / 4000 pasos.

## Capacidades

- Generacion incondicional de imagenes de 64x64 pixeles con apariencia de logotipo a partir de un vector latente aleatorio de 128 dimensiones.
- Produccion de muestras diversas: la model card reporta 0,000 de pares casi duplicados (umbral L2 < 0,01) en una rejilla de 64 muestras con semilla 123, es decir, sin colapso de modos observable en esa medicion.
- Reproduccion de estadisticas de color y contraste propias de logotipos reales (media de pixel 0,572 frente a 0,574 real; desviacion tipica 0,350 frente a 0,360; colorfulness 0,605 frente a 0,622).
- Entrenamiento reproducible de extremo a extremo: se incluye el script de preparacion de datos y el script de entrenamiento completo.
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; la etiqueta de idioma del repositorio es `en`.
- Capacidades especiales: vision (solo generacion, no comprension), audio, modo thinking o condicionamiento por texto: no disponibles.

## Casos de uso

- Generacion de datos sinteticos de respaldo para preentrenar clasificadores o detectores de logotipos: la salida mantiene la distribucion de color y contraste de los logotipos reales, por lo que puede usarse como clase "logotipo generico" en tareas de deteccion cuando no se dispone de un corpus etiquetado.
- Aumento de datos en pipelines de vision por computador con pocos ejemplos: al generar 64 muestras en un unico paso de inferencia y sin colapso de modos medido, se pueden crear variantes de relleno para tareas auxiliares como segmentacion gruesa o clasificacion de primer nivel.
- Exploracion visual y moodboards en diseno generativo: el modelo produce composiciones con paletas y contrastes propios de logotipos; resulta util como fuente de referencias abstractas antes de pasar a un disenador o a un modelo de mayor resolucion.
- Pruebas de estres y benchmarking de infraestructura de inferencia: con 2,84 M de parametros en el generador (unos 11 MB en float32), permite validar pipelines de carga de checkpoints, lotes y exportacion a otros runtimes con un coste de computo minimo.
- Docencia e investigacion reproducible: el repositorio incluye `train_logo_gan.py` y las instrucciones para regenerar los datos, de modo que se puede reproducir el entrenamiento completo (4000 pasos, batch 64) en una sola GPU en menos de una hora y estudiar el efecto de hiperparametros sobre el colapso de modos.
- Investigacion sobre metricas de diversidad en GANs: la model card documenta metricas concretas (media y desviacion de pixeles, colorfulness, L2 por pares, fraccion de casi duplicados) que sirven como plantilla de evaluacion para modelos generativos diminutos.
- Generacion de placeholders en maquetas de interfaz web o movil: las imagenes de 64x64 pueden escalarse como relleno neutro en prototipos donde no se dispone de imagenes definitivas.
- Baseline de comparacion para experimentos de destilacion o de arquitecturas generativas mas grandes: al ser un modelo entrenado desde cero y con codigo abierto, ofrece un punto de referencia controlado en coste y calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (FID, IS, precision/recall) en la informacion disponible. La model card incluye una evaluacion estadistica propia comparando 64 muestras generadas (semilla 123) con 64 logotipos reales:

| Metrica | Generado | Real |
|---|---|---|
| Media de pixel | 0,572 | 0,574 |
| Desviacion tipica de pixel | 0,350 | 0,360 |
| Colorfulness (norma L1 de las desviaciones por canal) | 0,605 | 0,622 |
| L2 mediana por pares (proxy de colapso de modos) | 52,1 | No disponible |
| Fraccion de pares casi duplicados (L2 < 0,01) | 0,000 | No disponible |
| Perdida final del discriminador (`d_loss`) | 0,0711 | No aplica |
| Perdida final del generador (`g_loss`) | 3,5900 | No aplica |

## Requisitos de hardware

- VRAM para inferencia: el generador tiene 2.838.278 parametros; en float32 ocupa aproximadamente 11 MB y en float16 unos 6 MB (estimacion derivada del recuento de parametros, no publicada por el autor). El checkpoint completo con generador y discriminador ronda los 14 MB en float32.
- GPU recomendadas: cualquier GPU con soporte CUDA; el autor entreno con una NVIDIA RTX 5090. Para inferencia basta con una GPU integrada o incluso CPU.
- Cabe en GPU de consumo: si, en cualquier modelo consumer (por ejemplo RTX 3060, RTX 4060, RTX 4090) y en la mayoria de iGPU, dado el tamano de decenas de MB.
- Entrenamiento: la model card indica que el entrenamiento completo (4000 pasos, batch 64) cabe en una sola GPU en menos de una hora; no se especifica el minimo de VRAM necesario.
- Opciones de despliegue: solo carga nativa en PyTorch mediante el checkpoint `final.pt`. No hay soporte declarado para vLLM, llama.cpp, Ollama, TGI ni ninguna otra plataforma de servicio; no procede, al no ser un modelo de lenguaje. La exportacion a ONNX o TorchScript no esta documentada en la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se han encontrado en la busqueda web datos de modelos comparables (mismo tamano, misma tarea de generacion de logotipos o mismo enfoque de DCGAN desde cero) que permitan una comparacion cuantitativa. La tabla siguiente recoge unicamente las caracteristicas del modelo analizado y deja constancia de la ausencia de alternativas documentadas:

| Modelo | Parametros | Resolucion | Dataset | Licencia | Resultados publicados |
|---|---|---|---|---|---|
| logo-gan-3.5m | 3.498.762 (generador 2.838.278) | 64x64x3 | 100 logotipos de `samp3209/logo-dataset` | Apache 2.0 | Metricas estadisticas de la propia model card |
| Alternativa 1 | No disponible | No disponible | No disponible | No disponible | No disponible |
| Alternativa 2 | No disponible | No disponible | No disponible | No disponible | No disponible |
| Alternativa 3 | No disponible | No disponible | No disponible | No disponible | No disponible |

Como referencia conceptual, la arquitectura sigue la formulacion DCGAN publicada por Radford et al. (2015), pero no se dispone de resultados medidos de esa u otras implementaciones en este mismo dataset que permitan establecer una comparacion directa.

## Limitaciones y advertencias

- Dataset de entrenamiento muy reducido: 100 imagenes de 64x64. Esto favorece el sobreajuste a la distribucion de esas 100 muestras y limita la variedad real de las salidas.
- Las imagenes generadas no son logotipos legibles ni marcas reconocibles. La propia model card indica que capturan la distribucion (color, composicion, contraste) y no marcas concretas; no deben usarse como activos de marca.
- Resolucion fija de 64x64x3, insuficiente para practicamente cualquier uso grafico final.
- Riesgo de alucinacion: no aplica en el sentido habitual de los modelos de lenguaje, pero si existe el riesgo de que las salidas reproduzcan de forma aproximada elementos de los logotipos del conjunto de entrenamiento, con las implicaciones de propiedad intelectual que ello conlleva.
- Ausencia de condicionamiento por texto: no se puede dirigir la generacion con un prompt; solo se controla mediante el vector latente y la semilla.
- Evaluacion limitada: no hay FID, IS ni metricas de precision/recall; las metricas publicadas son estadisticas agregadas sobre 64 muestras, con el sesgo que implica una unica semilla evaluada.
- La model card advierte explicitamente de que el checkpoint distribuido corresponde a una configuracion menor (3,5 M de parametros, latente 128, 4000 pasos) distinta de la discutida originalmente en el hilo de la peticion.
- Licencia: el modelo se publica bajo Apache 2.0, lo que permite uso comercial del checkpoint. No se especifica la licencia del dataset `samp3209/logo-dataset`, por lo que la procedencia y las condiciones de reutilizacion de las imagenes de entrenamiento no estan verificadas en la informacion disponible.
- Los metadatos de HuggingFace indican un tamano de repositorio de 0.0 GB, lo que puede indicar que los pesos no estaban disponibles o que el calculo de tamano no se habia actualizado en el momento del registro (0 descargas y 0 likes).
- El discriminador se distribuye en el checkpoint pero no se usa en inferencia; debe descartarse para despliegues en produccion.
- La etiqueta de idioma `en` es irrelevante para la tarea, pero confirma que no hay ningun procesamiento de texto asociado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Compactbot/logo-gan-3.5m
- Dataset de entrenamiento: https://huggingface.co/datasets/samp3209/logo-dataset
- Hilo de la peticion original (model-requests #1): https://huggingface.co/spaces/Compactbot/model-requests/discussions/1
- Listado de modelos del autor: https://huggingface.co/Compactbot/models
- Espacio del agente Compactbot: https://huggingface.co/spaces/CompactAI/Compactbot
- Otros resultados de la busqueda web (MeshGPT, Google Gemini, repositorio Serin511/Compact-Bot) no guardan relacion con este modelo y no se incluyen como referencias tecnicas.
