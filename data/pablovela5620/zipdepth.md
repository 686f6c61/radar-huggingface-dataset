# pablovela5620/zipdepth

## Resumen

ZipDepth es un modelo ligero de estimación de profundidad monocular relativa, desarrollado por Fabio Tosi, Luca Bartolomei, Matteo Poggi y Stefano Mattoccia, presentado en ECCV 2026. Su objetivo es llevar la estimación de profundidad zero-shot a cualquier dispositivo, incluyendo GPUs, CPUs y NPU móviles, con un coste computacional mínimo. El modelo combina un encoder-decoder reparameterizable basado en convoluciones RepVGG, atención eficiente de canal y espacial (strip pooling y bloques de contexto global) y un decoder FPN compacto, alcanzando aproximadamente 6,1 millones de parámetros fusionados.

La relevancia de ZipDepth radica en su equilibrio entre precisión y eficiencia: se acerca al rendimiento de modelos transformer de gran tamaño a una fracción de su coste, gracias a una destilación a gran escala desde un modelo fundacional sobre un conjunto de entrenamiento multi-dominio. El repositorio en HuggingFace actúa como espejo de los checkpoints oficiales, ofreciendo dos variantes del mismo modelo: una con upsampling convexo basado en `torch.nn.Unfold` para GPU/servidor, y otra sin unfold para NPU, móvil y exportación a ONNX. El modelo está entrenado a una resolución de 384×384 y produce profundidad inversa relativa (disparidad hasta escala).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder convolucional con RepVGG, atencion de canal y espacial (strip pooling, global context) y decoder FPN compacto |
| Parametros totales | ~6,1 M (fusionados) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de vision) |
| Tipos de cuantizacion | No disponible (se menciona exportacion ONNX, sin cuantizaciones especificas) |
| Idiomas soportados | No aplica (modelo de vision) |
| Licencia | MIT |
| Formato de pesos | `.pth` (PyTorch), exportable a ONNX |

## Arquitectura y entrenamiento

ZipDepth emplea una arquitectura encoder-decoder convolucional eficiente. El encoder utiliza convoluciones reparameterizables (RepVGG) que permiten fusionar ramas durante la inferencia, reduciendo el coste computacional sin perder expresividad. Se incorporan mecanismos de atencion de canal y espacial mediante strip pooling y bloques de contexto global, que capturan dependencias de larga distancia de forma ligera. El decoder es un FPN compacto que produce mapas de profundidad a resolucion completa.

El entrenamiento se basa en destilacion a gran escala desde un modelo fundacional de estimacion de profundidad, utilizando un conjunto de datos multi-dominio extenso. Esto permite al modelo generalizar a escenas nuevas sin ajuste fino (zero-shot). La innovacion principal reside en la exportacion sin cirugia de grafo: el modelo puede desplegarse directamente en GPUs, CPUs y NPU moviles, con dos variantes de upsampling convexo (con y sin `torch.nn.Unfold`) que comparten los mismos pesos de encoder y decoder.

## Capacidades

- Estimacion de profundidad monocular relativa (disparidad hasta escala) a partir de una sola imagen.
- Funcionamiento zero-shot: generaliza a dominios no vistos sin necesidad de reentrenamiento.
- Inferencia ligera: ~6,1 M de parametros, apta para dispositivos con recursos limitados.
- Dos modos de upsampling: `upsample_unfold=True` para GPU/servidor y `upsample_unfold=False` para NPU, movil y exportacion ONNX.
- Compatibilidad con el paquete `monopriors` de rerun-io/examples-monorepo mediante `hf_hub_download`.
- Entrenado a 384×384, con salida de profundidad inversa relativa.

## Casos de uso

- Robotica movil: navegacion y evitacion de obstaculos en tiempo real usando una camara monocular, gracias a su bajo coste computacional y su capacidad zero-shot en entornos desconocidos.
- Realidad aumentada: calculo de oclusion y posicionamiento de objetos virtuales sobre escenas reales, aprovechando la profundidad relativa para integrar elementos 3D de forma coherente.
- Conduccion autonoma y asistencia al conductor: estimacion de distancia a objetos en el entorno del vehiculo con latencia reducida, adecuada para sistemas embebidos en vehiculos.
- Agricultura de precision: analisis de la estructura del terreno y de cultivos mediante imagenes aereas o de campo, permitiendo medir alturas relativas y detectar anomalias.
- Fotografia computacional: generacion de efectos de desenfoque (bokeh), reiluminacion o separacion de planos en aplicaciones de camara movil, gracias a su capacidad de ejecucion en NPU.
- Asistencia a la movilidad para personas con discapacidad visual: aplicaciones que convierten la profundidad en informacion sonora o haptica para evitar obstaculos, ejecutables en telefonos de gama media.
- Vigilancia y analisis de escenas 3D: reconstruccion aproximada de la geometria de una escena a partir de una unica imagen para sistemas de seguridad o monitorizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Al tratarse de un modelo de ~6,1 M de parametros, es adecuado para GPUs de consumo (p. ej., RTX 3060 o superiores), CPUs modernas y NPU moviles.
- No se especifican requisitos exactos de VRAM, pero por su tamano cabe en cualquier GPU con al menos 2 GB de memoria, incluso en configuraciones integradas.
- Opciones de despliegue: PyTorch, ONNX Runtime, y plataformas moviles con soporte NPU (mediante la variante `_npu`).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. No se proporcionan datos de comparacion con otros modelos de estimacion de profundidad en la informacion consultada.

## Limitaciones y advertencias

- La salida es profundidad relativa (disparidad hasta escala), no profundidad absoluta en unidades metricas; para aplicaciones que requieran distancias reales es necesario calibrar o escalar la salida.
- El modelo fue entrenado a 384×384; imagenes con resoluciones muy diferentes pueden requerir reescalado y afectar a la precision.
- No se documentan sesgos especificos, pero al ser un modelo de vision puede presentar limitaciones en condiciones extremas de iluminacion, oclusiones o texturas poco comunes.
- El repositorio en HuggingFace es un espejo de los checkpoints oficiales; el codigo de entrenamiento e inferencia se encuentra en el repositorio de GitHub de los autores.
- La licencia MIT permite uso comercial, pero se debe incluir la atribucion correspondiente a los autores del modelo.

## Enlaces

- HuggingFace: https://huggingface.co/pablovela5620/zipdepth
- Paper (arXiv): https://arxiv.org/abs/2607.08771
- Codigo oficial: https://github.com/fabiotosi92/ZipDepth
- Fork de pablovela5620: https://github.com/pablovela5620/ZipDepth
- Sitio web del proyecto: https://zipdepth.github.io/
