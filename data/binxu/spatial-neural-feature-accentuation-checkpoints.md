# binxu/spatial-neural-feature-accentuation-checkpoints

## Resumen

Este repositorio contiene los artefactos de runtime del proyecto "Spatial Neural Feature Accentuation", desarrollado por Binxu Wang (Animadversio), investigador del Kempner Institute de Harvard. Se trata de un conjunto de checkpoints de PyTorch que permiten aplicar la técnica de *feature accentuation*: revelar qué características semánticas responden en una red neuronal convolucional ante imágenes naturales, complementando los mapas de atribución clásicos que solo indican dónde se concentra la atención.

El paquete incluye dos archivos: un backbone ResNet-50 entrenado de forma adversarialmente robusta (state dict) y un conjunto de 25 objetivos compilados de codificación neural, derivados de registros de actividad de cinco monos macacos. Estos objetivos se colapsan a pesos y sesgos efectivos en el espacio de características del backbone, permitiendo visualizaciones diferenciables y flujos de trabajo de investigación reproducibles. El repositorio tiene un tamaño de 0,1 GB y está orientado exclusivamente a investigación en interpretabilidad y neurociencia computacional, no a clasificación de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-50 (backbone robusto) + readout lineal (objetivos compilados) |
| Parametros totales | no disponible (ResNet-50 estandar tiene ~25M, pero no se confirma en la informacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no procesa texto) |
| Tipos de cuantizacion | no disponible (no se mencionan en la documentacion) |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | other (codigo MIT; los pesos retienen los terminos de los modelos y datos originales) |
| Formato de pesos | PyTorch state dict (.pt) |

## Arquitectura y entrenamiento

El backbone es un ResNet-50 entrenado con tecnicas de robustez adversarial, lo que significa que sus representaciones internas son mas estables frente a perturbaciones imperceptibles en la imagen de entrada. Sobre este backbone se compilan 25 objetivos de codificacion neural: cada objetivo corresponde a una combinacion lineal (PCA/readout) de las respuestas de unidades neuronales registradas en la corteza visual de cinco monos (identificados como `leap`, `paul`, `red`, `three0` y `venus`). Estos objetivos se colapsan a pesos y sesgos efectivos en el espacio de caracteristicas del backbone, junto con valores de normalizacion q01/q99 para estandarizar las respuestas.

El entrenamiento del backbone no se detalla en la informacion proporcionada, pero por la naturaleza de los archivos se infiere que sigue los protocolos habituales de robustez adversarial (por ejemplo, entrenamiento con ataques PGD). El metodo de *feature accentuation* en si se describe en el articulo arXiv 2402.10039: combina atribucion espacial (mapas de atencion) con analisis semantico para revelar que concepto especifico activa una neurona o unidad, no solo donde se localiza. Los checkpoints estan disenados para visualizacion diferenciable y el flujo de trabajo artistico-cientifico documentado en el repositorio companion.

## Capacidades

- Extraccion de caracteristicas visuales con un ResNet-50 robusto a perturbaciones adversariales.
- Visualizacion de caracteristicas mediante activacion maximizacion (feature visualization) diferenciable.
- Codificacion neural: prediccion de respuestas de unidades neuronales de monos macacos ante estimulos visuales naturales.
- Compilacion de 25 objetivos de readout (5 por mono) con pesos, sesgos y normalizacion incluidos.
- Soporte para flujos de investigacion reproducibles gracias a la verificacion de integridad SHA-256 de los archivos.
- No incluye capacidades de lenguaje, tool calling, agentes ni generacion de texto.

## Casos de uso

- Investigacion en interpretabilidad de redes neuronales: permite revelar que concepto semantico activa una neurona concreta de un ResNet-50, combinando mapas de atencion con analisis de caracteristicas. Se usaria cargando el backbone y los objetivos compilados, y ejecutando optimizacion de imagenes para maximizar la activacion de un objetivo especifico.
- Neurociencia computacional: los objetivos compilados modelan respuestas de la corteza visual de primates. Un investigador puede comparar las predicciones del modelo con datos neurofisiologicos reales para validar hipotesis sobre codificacion neuronal.
- Depuracion de modelos de vision: al visualizar que caracteristicas responden en capas intermedias, se pueden identificar artefactos o sesgos aprendidos por el modelo, util antes de desplegar sistemas de vision en produccion.
- Generacion de estimulos optimos: el metodo de activacion maximizacion permite sintetizar imagenes que maximizan la respuesta de una unidad, util para estudiar selectividad neuronal o para generar patrones visuales de referencia.
- Analisis de robustez adversarial: al usar un backbone robusto, se pueden estudiar como cambian las representaciones internas frente a ataques, comparando con un ResNet-50 estandar.
- Reproducibilidad de experimentos: los checkpoints con hashes verificables permiten que otros equipos repliquen exactamente los experimentos de visualizacion y codificacion neural descritos en el paper.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de precision, exactitud ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- Los archivos pesan 0,1 GB en total, por lo que el almacenamiento es minimo.
- Para inferencia con el backbone ResNet-50 en PyTorch, se recomienda una GPU con al menos 4 GB de VRAM (por ejemplo, GTX 1060, RTX 2060, RTX 3050) para procesar lotes pequenos de imagenes.
- Para visualizacion diferenciable (optimizacion de imagenes), se requiere memoria adicional para el grafo de computo; 8 GB de VRAM son suficientes para experimentos basicos.
- El despliegue se realiza mediante PyTorch y torchvision. No se mencionan integraciones con vLLM, Ollama, TGI u otros motores de inferencia, ya que no es un modelo de lenguaje.
- La latencia y el throughput no estan documentados; dependen del hardware y del tamano de lote.

## Comparativa con modelos similares

No se dispone de datos de comparacion con otros modelos en la informacion proporcionada. El backbone es un ResNet-50 robusto, que podria compararse cualitativamente con el ResNet-50 estandar de torchvision, pero no hay metricas publicadas en este repositorio. No se identifican alternativas directas con los mismos objetivos de codificacion neural compilados.

## Limitaciones y advertencias

- Los 25 objetivos compilados no son clasificadores de proposito general; estan disenados exclusivamente para visualizacion de caracteristicas y codificacion neural.
- Los pesos retienen los terminos de licencia de los modelos originales y de los datos fuente (registros neuronales de monos). El usuario es responsable de cumplir con dichos terminos antes de usar los artefactos en investigacion o produccion.
- No se proporciona informacion sobre sesgos del modelo ni sobre posibles alucinaciones, al ser un modelo de vision sin generacion de texto.
- El modelo no soporta procesamiento de lenguaje natural ni tareas multimodales.
- Para uso en produccion, se requiere una evaluacion adicional de robustez y rendimiento en el dominio especifico; no es un modelo listo para aplicaciones comerciales sin adaptacion.
- Las rutas internas de archivos se han eliminado de la copia publicada, lo que puede requerir ajustes menores al integrar los checkpoints en otros entornos.

## Enlaces

- HuggingFace: https://huggingface.co/binxu/spatial-neural-feature-accentuation-checkpoints
- Repositorio companion (GitHub): https://github.com/Animadversio/spatial-neural-feature-accentuation
- Articulo arXiv (Feature Accentuation): https://arxiv.org/abs/2402.10039
- Version HTML del articulo: https://arxiv.org/html/2402.10039v2
- Pagina de publicaciones del autor: https://animadversio.github.io/publication/
