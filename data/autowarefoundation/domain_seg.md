# AutowareFoundation/domain_seg

## Resumen

DomainSeg es un modelo de segmentación semántica binaria especializado en la detección de objetos de obra y señalización temporal en escenas de conducción. Lo desarrolla la Autoware Foundation como parte del pipeline de percepción AutoSeg del proyecto VisionPilot (versión 0.9), y aborda un caso límite especialmente problemático para los sistemas ADAS y de conducción autónoma: elementos de obra que se colocan y reposicionan de forma dinámica, estrechan el corredor de circulación o redirigen el tráfico.

El modelo sigue una arquitectura Encoder-Context-Decoder que reutiliza un tronco `SceneSegNetwork` preentrenado en escenas de carretera y congelado (backbone EfficientNet-B0, módulo SceneContext con MLP y atención residual, y decoder SceneNeck con upsampling progresivo y conexiones skip), al que se añade una cabeza de segmentación ligera y entrenable (`DomainSegHead`). La salida es una máscara binaria a resolución completa de 640x320 píxeles que identifica una única superclase unificada de "objetos de obra": conos, barriles, paneles tubulares y barreras temporales.

Su relevancia actual radica en la ligereza y el rendimiento en tiempo real: con solo 223,43 GFLOPs alcanza 23,9 FPS en FP16 sobre una GPU de portátil (RTX 3060 Mobile), lo que lo hace viable para despliegue embebido en vehículos y plataformas de bajo consumo, y se distribuye con pesos PyTorch, PyTorch trazado y ONNX FP32 bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-Context-Decoder: EfficientNet-B0 (backbone congelado) + SceneContext (MLP con atención residual) + SceneNeck (decoder con upsampling progresivo y skip connections) + DomainSegHead (cabeza de segmentación entrenable) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 640x320) |
| Tipos de cuantizacion | FP32 y FP16 documentados; no se detallan otras cuantizaciones |
| Idiomas soportados | no aplica (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (.pth), PyTorch trazado (.pt), ONNX FP32 (.onnx) |

## Arquitectura y entrenamiento

DomainSeg emplea una arquitectura de segmentación semántica de tipo Encoder-Context-Decoder. El tronco reutiliza el `SceneSegNetwork` del proyecto, preentrenado en escenas de carretera y mantenido congelado durante el entrenamiento de DomainSeg: un backbone EfficientNet-B0, seguido de un módulo SceneContext basado en MLP con atención residual y un decoder SceneNeck con upsampling progresivo y conexiones skip. Sobre esta base se entrena únicamente la cabeza `DomainSegHead`, ligera, que produce una máscara binaria de un canal a resolución 320x640.

El entrenamiento se realizó sobre el dataset ROADWork de la Universidad Carnegie Mellon, con 7.25K muestras de entrenamiento y 150 de validación. La función de pérdida optimizada fue entropía cruzada binaria con logits (`BCEWithLogitsLoss`) sobre la clase única unificada de objetos de obra. No se especifican en la información disponible el número total de tokens ni detalles sobre el uso de RLHF/DPO (no aplicables a un modelo de segmentación), ni innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Segmentación semántica binaria de objetos de obra en imágenes de conducción: conos de tráfico, barriles/bidones, marcadores tubulares y paneles verticales, y barreras de construcción temporales, agrupados en una única superclase.
- Funcionamiento en escenas urbanas, autopistas y vías no estructuradas.
- Robustez frente a condiciones meteorológicas adversas como nieve y baja iluminación.
- Manejo de casos límite como conos derribados.
- Salida de máscara binaria a resolución completa de 640x320 píxeles (1 canal).
- Inferencia en PyTorch (CUDA si está disponible) y en ONNX Runtime (CUDA o CPU).
- No dispone de capacidades de generación de texto, razonamiento, código, matemáticas, visión general, tool calling, agentes ni multilingüismo; es un modelo puramente visual y especializado.

## Casos de uso

- Detección de zonas de obra en sistemas ADAS: el modelo identifica conos, barriles y barreras en tiempo real (hasta 23,9 FPS en FP16 en una RTX 3060 Mobile) para que el vehículo ajuste el corredor de circulación o reduzca la velocidad antes de la zona de obras.
- Integración en pipelines de conducción autónoma (Autoware/VisionPilot): se usa como módulo de percepción dentro de AutoSeg para enriquecer la comprensión de la escena más allá de la segmentación de carretera estándar.
- Detección de estrechamiento de carril y guiado de incorporación: al segmentar los objetos que estrechan artificialmente el corredor, el sistema puede planificar una trayectoria de merge o de cambio de carril.
- Monitorización de flotas y vehículos de obra: procesamiento de vídeo de cámaras a bordo para inventariar y validar la señalización temporal desplegada en carreteras.
- Despliegue embebido de bajo consumo: gracias a su tamaño ligero y a la exportación ONNX FP32, puede ejecutarse en plataformas con GPU modestas o en CPU mediante ONNX Runtime.
- Validación y pruebas de percepción: sirve como referencia para evaluar la robustez de otros sistemas frente a casos límite de obra (nieve, baja luz, conos derribados) usando el conjunto de validación ROADWork.
- Análisis de imágenes de infraestructura viaria: segmentación de señalización temporal en imágenes capturadas por vehículos de inspección para tareas de mantenimiento y seguridad vial.

## Benchmarks y rendimiento

| Dataset | Metrica | Resultado |
|---|---|---|
| ROADWork (validación) | mIoU | 46,6 |

| Precision | FPS (RTX 3060 Mobile / Ryzen 7 5800H, 223,43 GFLOPs, 640x320) |
|---|---|
| FP32 | 14,3 |
| FP16 | 23,9 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el tamaño del repositorio es de 0,6 GB y el cómputo es de 223,43 GFLOPs por inferencia a 640x320.
- GPU recomendadas: RTX 3060 Mobile (referencia de benchmark); cualquier GPU con soporte CUDA puede ejecutar la versión PyTorch u ONNX.
- Cabe en GPU de consumo: sí, el benchmark se realizó en una GPU de portátil (RTX 3060 Mobile), por lo que es viable en GPUs consumer de gama media.
- Opciones de despliegue: PyTorch (`DomainSegNetworkInfer`, con CUDA si está disponible), PyTorch trazado (`.pt`) y ONNX Runtime (`CUDAExecutionProvider` o `CPUExecutionProvider`).
- Latencia y throughput: 14,3 FPS en FP32 y 23,9 FPS en FP16 sobre RTX 3060 Mobile a 640x320; no se proporcionan datos para otras GPUs.

## Comparativa con modelos similares

No se han proporcionado datos de benchmarks ni especificaciones de modelos comparables en la información disponible. Como referencia contextual, el propio modelo se apoya en el tronco `SceneSegNetwork` (EfficientNet-B0) del proyecto AutoSeg/VisionPilot, pero no se ofrecen métricas comparativas frente a otras soluciones de segmentación de obra.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DomainSeg | no disponible | no aplica (visión, 640x320) | mIoU 46,6 en ROADWork; 23,9 FPS FP16 | Apache 2.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo solo detecta una superclase unificada de objetos de obra; no distingue entre conos, barriles, paneles o barreras en la salida.
- El mIoU de 46,6 en validación es moderado, lo que indica margen de mejora en la precisión de la segmentación; conviene validarlo en el dominio de despliegue concreto.
- El conjunto de validación es muy reducido (150 muestras), por lo que las métricas pueden no ser representativas de todas las condiciones reales.
- No se documentan sesgos específicos, pero al entrenarse sobre el dataset ROADWork (CMU) puede presentar sesgo de dominio geográfico y de condiciones de captura.
- Riesgo de falsos positivos y negativos en escenas con objetos similares a señalización de obra o en condiciones de iluminación extremas no cubiertas.
- No procesa lenguaje ni tiene capacidades multimodales más allá de la imagen; no es adecuado para tareas de texto, razonamiento o agentes.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del dataset ROADWork y de las dependencias del repositorio para producción.
- El tronco EfficientNet-B0 está congelado; el rendimiento depende de la calidad del preentrenamiento de `SceneSegNetwork` y no se puede ajustar finamente sin modificar el pipeline.

## Enlaces

- Hugging Face: https://huggingface.co/AutowareFoundation/domain_seg
- Repositorio GitHub: https://github.com/autowarefoundation/domain_seg
- Dataset ROADWork (CMU): https://www.cs.cmu.edu/~roadwork/
- Demo 1: https://huggingface.co/AutowareFoundation/domain_seg/resolve/main/assets/domainseg_demo_1.mp4
- Demo 2: https://huggingface.co/AutowareFoundation/domain_seg/resolve/main/assets/domainseg_demo_2.mp4
- Pesos PyTorch: https://huggingface.co/AutowareFoundation/domain_seg/tree/main/models/domainseg.pth
- Pesos PyTorch trazado: https://huggingface.co/AutowareFoundation/domain_seg/tree/main/models/domainseg_traced.pt
- Pesos ONNX FP32: https://huggingface.co/AutowareFoundation/domain_seg/tree/main/models/domainseg_fp32.onnx
