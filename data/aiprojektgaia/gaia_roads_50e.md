# aiprojektgaia/gaia_roads_50e

## Resumen

`gaia_roads_50e` es un modelo de segmentacion semantica binaria especializado en la extraccion de carreteras a partir de ortofotos aereas RGB en vista nadir. Lo desarrolla GAIA (aiprojektgaia), un sistema autoalojado que convierte imagenes aereas en datos vectoriales de mapas para municipios suecos, con financiacion de Smart Built Environment. La arquitectura es una FPN (Feature Pyramid Network) con encoder ResNet34, construida con `segmentation_models_pytorch` y entrenada mediante PyTorch Lightning.

El modelo no devuelve una mascara binaria, sino un raster de verosimilitud de un solo canal en `uint8` (rango 0-255) donde cada valor representa la probabilidad, escalada por sigmoide, de que el pixel sea carretera. Esta decision de diseno permite reumbralizar una ejecucion sin repetir la inferencia, algo util en el pipeline de GAIA, que aplica un umbral configurable (75% por defecto), vectoriza la mascara en poligonos y exporta a GeoPackage para QGIS.

Es relevante por su enfoque pragmatico de produccion: el modelo esta calibrado para imagenes de aproximadamente 0,05 m/pixel, el wrapper de inferencia reescala y recorta las dimensiones a multiplos de 32 (requisito del decoder FPN), y el checkpoint se consume desde el modulo `segmentation` de `gaia-engine` a traves de `ResUNetInferencer`. Su licencia Apache 2.0 y su tamano contenido (repo de 0,3 GB) lo hacen facil de desplegar, aunque carece de metricas de evaluacion publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FPN (Feature Pyramid Network) con encoder ResNet34, encoder-decoder CNN |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no NLP) |
| Tipos de cuantizacion | no disponible (pesos PyTorch estandar) |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | Apache 2.0 |
| Formato de pesos | checkpoint de PyTorch Lightning (`.ckpt`), libreria `segmentation-models-pytorch` |
| Entrada | imagen RGB nadir, 3 canales, ~0,05 m/pixel |
| Salida | raster `uint8` de un canal (0-255), mapa de verosimilitud de carretera |
| Tamano del repositorio | 0,3 GB |
| Normalizacion | estadisticas ImageNet (`smp.encoders.get_preprocessing_params("resnet34")`), aplicada en el wrapper de entrenamiento |

## Arquitectura y entrenamiento

La arquitectura es una FPN con backbone ResNet34 preentrenado en ImageNet, tal como indica el uso de `smp.encoders.get_preprocessing_params("resnet34")` para obtener las estadisticas de normalizacion. El decoder FPN combina caracteristicas multiescala del encoder mediante conexiones top-down, lo que resulta adecuado para segmentar estructuras lineales finas y largas como las carreteras. El modelo se entreno con PyTorch Lightning y se registra en GAIA bajo la etiqueta `"model type": "resunet"`, aunque esa cadena selecciona el loader, no la arquitectura: el loader pasa el parametro `arch` directamente desde los hiperparametros del checkpoint a `smp.create_model()`, y la arquitectura real declarada es FPN.

No se detalla en la informacion disponible el numero de tokens o imagenes de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF/DPO (no aplicables a un modelo de vision de este tipo). La model card menciona que el modelo se entreno para uso municipal sueco, lo que implica un sesgo geografico y de distribucion en cuanto a apariencia de carreteras, materiales de firme, senalizacion, densidad de vehiculos, vegetacion e iluminacion. La resolucion objetivo es de aproximadamente 0,05 m/pixel; en produccion GAIA solicita teselas WMS a 0,08 m/pixel y el wrapper las reescala a 0,05, lo que no puede recuperar detalle no capturado.

## Capacidades

- Segmentacion semantica binaria de carreteras en ortofotos aereas RGB en vista nadir.
- Generacion de mapas de verosimilitud por pixel (no mascaras binarias), lo que permite reumbralizar sin reinferencia.
- Sensibilidad a la resolucion: calibrado para ~0,05 m/pixel; el wrapper reescala la entrada a esa resolucion objetivo y recorta dimensiones a multiplos de 32.
- Integracion en pipeline geoespacial: umbralizacion configurable, vectorizacion a poligonos con cierre de huecos y exportacion a GeoPackage/QGIS.
- Consumo programatico via `ResUNetInferencer` del modulo `segmentation` de `gaia-engine`.
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingues (es un modelo de vision).
- No admite entradas no RGB (sin NIR, elevacion ni SAR); fijado a 3 canales.

## Casos de uso

- Actualizacion de cartografia municipal: el modelo extrae la red viaria de ortofotos recientes y, tras umbralizar y vectorizar, genera poligonos de carretera que se cargan como capas en QGIS para comparar con la cartografia existente y detectar cambios.
- Inventario de infraestructura viaria: a partir del raster de verosimilitud se pueden derivar metricas de longitud y superficie de vial en un municipio, usando el umbral de confianza como parametro ajustable segun la precision requerida.
- Deteccion de cambios temporal: ejecutando el modelo sobre ortofotos de distintas fechas y comparando las mascaras vectorizadas se pueden identificar nuevas vias o modificaciones del viario, aprovechando que el pipeline de GAIA conserva la salida continua para reumbralizar.
- Alimentacion de sistemas de informacion geografica: la exportacion a GeoPackage permite integrar las carreteras extraidas en flujos de trabajo SIG existentes, con revision humana de las propuestas antes de su incorporacion a bases de datos oficiales.
- Prototipado de pipelines de segmentacion geoespacial: al estar construido con `segmentation-models-pytorch` y licencia Apache 2.0, sirve como punto de partida para reentrenar o afinar sobre otras regiones o sensores, sustituyendo el encoder o ajustando el umbral.
- Investigacion en teledeteccion: el checkpoint permite reproducir y comparar la aproximacion FPN+ResNet34 frente a otras arquitecturas de segmentacion de carreteras, si bien la ausencia de metricas publicadas limita la comparacion directa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se publican metricas de evaluacion con este checkpoint y que su precision sobre cualquier imagen concreta esta, por tanto, sin verificar.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano del repositorio (0,3 GB) y la arquitectura FPN+ResNet34, es un modelo ligero que cabe holgadamente en GPU de consumo, aunque no se proporcionan cifras concretas.
- GPU recomendadas: no disponibles en la informacion; cualquier GPU con soporte CUDA capaz de ejecutar PyTorch es suficiente en principio.
- Cabe en GPU de consumo: si, previsiblemente en cualquier GPU consumer moderna con varios GB de VRAM, aunque no se confirma con datos.
- Opciones de despliegue: PyTorch con `segmentation-models-pytorch`, checkpoint de PyTorch Lightning; integracion via `ResUNetInferencer` de `gaia-engine`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de vision de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento que permitan establecer una comparativa con alternativas de la misma categoria (segmentacion de carreteras en imagenes aereas).

## Limitaciones y advertencias

- Sesgo geografico y de distribucion: entrenado para uso municipal sueco; el rendimiento en otras regiones, sensores, resoluciones o estaciones es desconocido y no debe asumirse.
- Sensibilidad a la resolucion: objetivo de ~0,05 m/pixel; imagenes con distancia de muestreo muy distinta se reescalan, degradando la calidad en ambos sentidos.
- Modos de fallo sistematicos en estructuras lineales: las carreteras son finas y largas, por lo que sufren desproporcionadamente la oclusion (copas de arboles, sombras, vehiculos aparcados, puentes y tuneles); se esperan roturas en la salida, parcialmente compensadas por el cierre de huecos en la vectorizacion, que a su vez puede unir tramos que no son carretera.
- Ambiguedad de clase: la frontera entre carretera, entrada de garaje, aparcamiento, carril bici y otras superficies duras es una decision de anotacion; usuarios con otra definicion interpretaran predicciones correctas como errores.
- Sin metricas publicadas: la precision sobre cualquier imagen concreta esta sin verificar.
- Fuera de alcance: uso critico para seguridad o en tiempo real (incluida conduccion autonoma), imagenes a nivel de suelo u oblicuas, entradas no RGB (NIR, elevacion, SAR) y registros catastrales o legales autoritativos.
- Normalizacion obligatoria: cargar el state dict en el modelo `smp` sin normalizar con estadisticas ImageNet produce resultados pobres; hay que reproducir el wrapper de entrenamiento o normalizar manualmente.
- Licencia Apache 2.0: permite uso comercial, pero el autor recomienda validar sobre imagenes propias y tratar la salida como propuesta sujeta a revision humana.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aiprojektgaia/gaia_roads_50e
- Repositorio del proyecto: https://github.com/aiprojektgaia
- Paper de referencia (arXiv:1910.09700): https://arxiv.org/abs/1910.09700
