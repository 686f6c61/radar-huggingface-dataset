# Edisoneh/InfiniSplat-v2

## Resumen

InfiniSplat v2 es un modelo de reconstruccion 3D feed-forward basado en Gaussian Splatting (3DGS) desarrollado por el grupo ZJU3DV (Universidad de Zhejiang). A diferencia de los enfoques de reconstruccion tradicionales que requieren optimizacion por escena, este modelo infiere directamente un conjunto de gaussianas 3D a partir de multiples vistas de entrada en una sola pasada, lo que reduce drasticamente el tiempo de reconstruccion. El modelo se publica bajo el identificador Edisoneh/InfiniSplat-v2 en Hugging Face y acompana al paper "InfiniSplat v2: Analyzing and Improving Feed-Forward 3DGS from Any Views" (arXiv:2610.20341).

La relevancia del modelo reside en su capacidad de generalizar a vistas arbitrarias ("from any views"), un problema abierto en los sistemas feed-forward de 3DGS, que suelen degradarse cuando las camaras de entrada presentan configuraciones atipicas o gran disparidad de puntos de vista. Con aproximadamente 1.649 millones de parametros (1,65 B) y un repositorio de 6,7 GB en formato safetensors, el modelo se posiciona como una herramienta de reconstruccion de escena de proposito especifico, no como un modelo de lenguaje.

La ficha se elabora a partir de la informacion disponible en la model card y los metadatos de Hugging Face. No se han publicado en esa informacion detalles sobre composicion del dataset de entrenamiento, regimen de entrenamiento ni resultados numericos de benchmarks, por lo que esos apartados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Feed-forward 3D Gaussian Splatting (reconstruccion multi-vista); detalles internos de la red no disponibles |
| Parametros totales | 1.649.014.290 (aprox. 1,65 B) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible (no aplica en el sentido de modelos de lenguaje; el modelo procesa un conjunto de vistas de entrada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision/reconstruccion 3D, no linguistico) |
| Licencia | Project Registration License (PRL) v1.0 (etiquetada como "other") |
| Formato de pesos | safetensors (config.json + model.safetensors) |

## Arquitectura y entrenamiento

InfiniSplat v2 es un modelo feed-forward para reconstruccion 3D mediante Gaussian Splatting. Toma multiples imagenes o vistas como entrada y predice directamente los parametros de un conjunto de gaussianas 3D (posicion, covarianza, color y opacidad, segun la formulacion estandar de 3DGS), sin necesidad de un proceso de optimizacion por escena. El paper asociado se centra en analizar y mejorar el comportamiento de los sistemas feed-forward de 3DGS cuando las vistas de entrada no siguen una configuracion canonica, es decir, cuando se dispone de "any views".

La informacion disponible no detalla la arquitectura interna (tipo de backbone, mecanismo de agregacion multi-vista, uso de atencion o de cost volumes), el volumen de datos de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de refinamiento posteriores como RLHF (no aplicable en este dominio) o ajuste por perdidas perceptuales. Tampoco se especifican innovaciones concretas mas alla de la mejora declarada en la generalizacion a vistas arbitrarias. Estos datos deben consultarse en el paper (arXiv:2610.20341) y en el repositorio de GitHub.

## Capacidades

- Reconstruccion 3D feed-forward a partir de multiples vistas de una escena, generando representaciones Gaussian Splatting en una sola pasada.
- Generalizacion a configuraciones de camara arbitrarias ("any views"), que es la mejora central declarada frente a versiones anteriores.
- Generacion de representaciones 3D renderizables (Gaussian Splatting), aptas para visualizacion en tiempo real.
- Entrada multimodal de imagenes (multi-vista); no se documentan entradas de texto, audio ni video.
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no aplicables.
- Capacidades especiales (thinking mode, vision, audio): vision multi-vista para reconstruccion 3D; no se documentan otras.

## Casos de uso

- Reconstruccion de escenas para realidad aumentada y virtual: el modelo genera gaussianas 3D a partir de un conjunto de fotos, lo que permite crear activos de escena renderizables en tiempo real para visores AR/VR sin un pipeline de optimizacion por escena.
- Digitalizacion de patrimonio y espacios fisicos: a partir de fotografias tomadas con drones o camaras moviles en configuraciones no controladas, el modelo produce una representacion 3D util para catalogacion y visualizacion.
- Prototipado rapido en estudios de videojuegos: generacion de entornos 3D de bloque para previsualizacion, aprovechando la inferencia feed-forward para iterar sobre capturas de referencia en minutos.
- Robatica y navegacion: reconstruccion de escenas a partir de vistas de camaras de robot para construir mapas gaussianos que alimenten planificacion y evitacion de obstaculos.
- E-commerce y visualizacion de producto: captura multi-vista de un objeto para generar una representacion 3D navegable en catalogo web, con la ventaja de no requerir escaneo especializado.
- Investigacion en vision por computador: linea base reproducible para estudiar la robustez de los sistemas feed-forward de 3DGS ante vistas arbitrarias, comparando contra metodos de optimizacion por escena.
- Post-produccion y VFX: generacion de geometria y apariencia aproximadas a partir de plates fotograficos para integrar elementos CGI en escenas reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas comparativas (PSNR, SSIM, LPIPS u otras metricas habituales en reconstruccion 3D) ni comparaciones con modelos previos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Como referencia orientativa, un modelo de 1,65 B parametros en precision de 16 bits ocupa aproximadamente 3,3 GB solo en pesos; el consumo real dependera del numero de vistas de entrada y de las activaciones intermedias, que no se documentan.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano de pesos, una GPU con 8-16 GB de VRAM podria ser suficiente para los pesos, pero el pico de memoria durante la inferencia multi-vista no esta cuantificado.
- Cabe en GPU de consumo: probablemente si en terminos de pesos (RTX 3060 12 GB o superiores), aunque la viabilidad real depende de las activaciones, no documentadas.
- Opciones de despliegue: el repositorio de GitHub (zju3dv/InfiniSplat) y la demo en Hugging Face Spaces son los canales documentados. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otros modelos de reconstruccion feed-forward de 3DGS ni con metodos de optimizacion por escena, por lo que no es posible elaborar una tabla comparativa con datos verificables.

## Limitaciones y advertencias

- La licencia Project Registration License (PRL) v1.0 esta etiquetada como "other" y no es una licencia de codigo abierto estandar; es imprescindible revisar los terminos en el repositorio antes de cualquier uso comercial.
- El modelo es de proposito especifico (reconstruccion 3D) y no ofrece capacidades de lenguaje, razonamiento simbolico ni tool calling.
- La calidad de la reconstruccion depende de la calidad y cobertura de las vistas de entrada; no se documentan umbrales minimos ni comportamiento en escenas con oclusiones severas.
- No se documentan sesgos especificos, pero al ser un modelo entrenado con datos de escenas reales puede heredar sesgos de dominio (tipos de escena, iluminacion, materiales) presentes en el dataset, cuyo contenido no se detalla.
- Riesgo de artefactos y geometria inconsistente en vistas no cubiertas por el entrenamiento; la model card no cuantifica este riesgo.
- No se especifican limitaciones de idioma porque el modelo no procesa texto.
- Para produccion, faltan datos de latencia, memoria pico y estabilidad en lotes grandes de vistas, por lo que se recomienda una validacion propia antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Edisoneh/InfiniSplat-v2
- Paper (arXiv): https://huggingface.co/papers/2610.20341
- Repositorio de codigo: https://github.com/zju3dv/InfiniSplat
- Pagina del proyecto: https://zju3dv.github.io/InfiniSplat2/
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/Edisoneh/InfiniSplat-v2-demo
- Licencia (PRL v1.0): https://github.com/zju3dv/InfiniSplat/blob/main/LICENSE
- Ejemplos descargables: https://huggingface.co/Edisoneh/InfiniSplat-v2/resolve/main/examples-png.zip
