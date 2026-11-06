# Ambarella/DeepLabV3Plus

## Resumen

DeepLabV3Plus es una arquitectura de segmentacion semantica de imagenes que combina convoluciones atrosas (atrous/dilated) con una estructura encoder-decoder. Este repositorio concreto, publicado por Ambarella, empaqueta los pesos de DeepLabV3+ con backbone ResNet-50, entrenados originalmente sobre el dataset Pascal VOC2012, y los distribuye en formatos optimizados para los aceleradores de vision de Ambarella (SoCs de las familias N1, X7, CV7, CV72 y CV75).

El modelo resuelve el problema de asignar una etiqueta de clase a cada pixel de una imagen, preservando bordes de objetos gracias al decodificador ligero y agregando contexto multi-escala mediante el modulo ASPP (Atrous Spatial Pyramid Pooling). Es relevante para despliegues en el borde (edge) sobre hardware embebido de Ambarella, ya que el repositorio incluye binarios precompilados tanto en variante "Amba_optimized" como "Activation_fp16", listos para el SDK Cooper (2.5.4) y Cooper Foundry (2.3).

No se trata de un modelo de lenguaje: no genera texto ni soporta instrucciones. Es un modelo puramente discriminativo de vision por computador, con una unica salida de segmentacion densa sobre las 21 clases de Pascal VOC2012 (incluyendo fondo). El tamano del repositorio es de aproximadamente 0,2 GB y la entrada de referencia es de 3x513x513 pixeles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeepLabV3+ (encoder-decoder con convoluciones atrosas separables y ASPP), backbone ResNet-50 |
| Parametros totales | no disponible (depende del backbone ResNet-50 y las cabezas de segmentacion; no se declara cifra exacta) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de referencia 3x513x513) |
| Tipos de cuantizacion | no disponible como listado formal; se distribuyen variantes "Amba_optimized" y "Activation_fp16" por dispositivo |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | binarios propietarios por SoC (.bin) para N1-655, X7, CV7, CV72 y CV75; pesos originales en .pth (PyTorch) referenciados externamente |

## Arquitectura y entrenamiento

DeepLabV3+ emplea un encoder basado en ResNet-50 con convoluciones atrosas para extraer caracteristicas a multiples escalas sin perder resolucion espacial, combinado con un modulo ASPP que captura contexto global mediante tasas de dilatacion diversas. Sobre esa representacion, un decodificador ligero fusiona caracteristicas de bajo nivel con las de alto nivel para refinar los bordes de los objetos segmentados. La innovacion central del paper original (arXiv:1802.02611) es precisamente esta combinacion encoder-decoder con convoluciones atrosas separables, que mejora la delimitacion de fronteras manteniendo un campo receptivo amplio.

El entrenamiento se realizo sobre el dataset Pascal VOC2012 (segun la model card, con la variante "Aug"), en resolucion de entrada 3x513x513 y con un output stride de 16 (indicado en el nombre del checkpoint original `best_deeplabv3plus_resnet50_voc_os16.pth`). No se especifican en la informacion disponible el numero de tokens equivalentes, la composicion exacta del dataset, ni si hubo etapas de refinamiento posteriores. La implementacion de referencia citada es el repositorio de VainF (DeepLabV3Plus-Pytorch).

## Capacidades

- Segmentacion semantica densa por pixel sobre las clases de Pascal VOC2012 (20 clases de objeto mas fondo).
- Delimitacion refinada de bordes de objetos gracias al decodificador.
- Agregacion de contexto multi-escala mediante ASPP.
- Inferencia optimizada en hardware Ambarella (SoCs N1-655, X7, CV7, CV72, CV75) mediante binarios precompilados.
- Soporte de dos modos de compresion por dispositivo: "Amba_optimized" y "Activation_fp16".
- No soporta generacion de texto, tool calling, agentes, razonamiento multi-paso ni capacidades multilingues.
- No dispone de modo "thinking", vision multimodal ni audio; es un modelo unimodal de vision.

## Casos de uso

- Conduccion autonoma y ADAS: segmentacion de carretera, vehiculos y peatones en tiempo real sobre SoCs Ambarella embebidos, aprovechando los binarios optimizados para CV7/CV75.
- Robotica y navegacion: percepcion del entorno para evitar obstaculos y planificar trayectorias, usando la salida densa por pixel como mapa semantico del espacio transitable.
- Comprension de escena en camaras de vigilancia: separacion de clases (personas, vehiculos, mobiliario) en flujos de video procesados en el borde con el SDK Cooper.
- Segmentacion en drones o camaras IP: inferencia de baja latencia en dispositivos X7/N1 sin depender de la nube.
- Preprocesado para pipelines de analisis de imagen: mascaras semanticas como entrada a etapas posteriores (tracking, conteo de objetos, medicion de areas).
- Prototipado e investigacion en segmentacion: uso de los pesos originales en PyTorch (via la implementacion de VainF) como linea base sobre Pascal VOC2012.
- Sistemas de realidad aumentada o sustitucion de fondo: separacion de primer plano y fondo a nivel de pixel en aplicaciones embebidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio ocupa aproximadamente 0,2 GB, lo que sugiere un modelo ligero apto para hardware de borde.
- GPU recomendadas: no se indican GPU de escritorio; el destino declarado son aceleradores Ambarella N1-655, X7, CV7, CV72 y CV75.
- Cabe en GPU de consumo: no confirmado en la informacion disponible; por tamano del repo (0,2 GB) es plausible en GPUs de consumo, pero no se aporta dato oficial.
- Opciones de despliegue: binarios propietarios para SDK Cooper 2.5.4 y Cooper Foundry 2.3; para PyTorch, la implementacion de referencia DeepLabV3Plus-Pytorch.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Backbone | Dataset | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepLabV3Plus (este repo, Ambarella) | ResNet-50 | Pascal VOC2012 | 3x513x513 | no disponible | Hugging Face + binarios Ambarella |
| DeepLabV3+ original (referencia VainF) | ResNet-50/101 | Pascal VOC / Cityscapes | configurable | no disponible en esta ficha | GitHub |
| Segmentadores tipo FCN/PSPNet | VGG/ResNet | Pascal VOC | configurable | no disponible en esta ficha | Diversas fuentes |

No se dispone de datos de rendimiento comparativo (mIoU) en la informacion proporcionada para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Modelo puramente de vision: no procesa texto ni instrucciones; no debe evaluarse como un LLM.
- Entrenado sobre Pascal VOC2012, con 21 clases; su generalizacion a dominios o clases fuera de ese conjunto es limitada.
- No se declara licencia, por lo que el uso comercial queda sujeto a verificacion previa con el autor.
- Los binarios estan atados a SoCs Ambarella concretos y a versiones especificas del SDK Cooper (2.5.4) y Cooper Foundry (2.3); no son portables a otro hardware sin recompilacion.
- Riesgo de sesgos derivados del dataset de entrenamiento (composicion, geografia, condiciones de iluminacion de Pascal VOC2012).
- Posibles errores en bordes finos y objetos pequenos, habituales en segmentacion semantica.
- No se documentan metricas de robustez, calibracion ni evaluacion en dominios distintos al de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/Ambarella/DeepLabV3Plus
- Paper original: https://arxiv.org/abs/1802.02611
- Implementacion de referencia: https://github.com/VainF/DeepLabV3Plus-Pytorch
- Pesos originales (Dropbox): https://www.dropbox.com/scl/fi/c9rjpskx4clzfupkhn5cr/best_deeplabv3plus_resnet50_voc_os16.pth
- Dataset Pascal VOC2012: http://host.robots.ox.ac.uk/pascal/VOC/
