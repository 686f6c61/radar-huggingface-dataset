# moonbox-dev/BEN2-TensorRT

## Resumen

BEN2-TensorRT es una distribución del modelo BEN2 Base (Background Erase Network) convertida a motores TensorRT por el usuario moonbox-dev. BEN2 es una red de segmentación de primer plano y matting de imagen desarrollada por PramaLLC, presentada en el artículo arXiv 2501.06230. El modelo original aborda el problema de la eliminación de fondos y la extracción de máscaras de alta precisión, empleando una arquitectura de red refinadora guiada por confianza (Confidence Guided Matting, CGM) que procesa específicamente los píxeles donde el modelo base muestra menor confianza.

Este repositorio no contiene pesos en formato PyTorch ni safetensors, sino motores TensorRT precompilados en precisión fp16, construidos a partir del grafo ONNX oficial en fp16. Los motores son compatibles a nivel de hardware (Ampere y posteriores: RTX 30, 40 y 50) y de versión (cualquier TensorRT 10.x desde 10.13), lo que evita recompilaciones por GPU. El paquete incluye un runner basado en NumPy y Polygraphy que no requiere PyTorch en tiempo de inferencia.

La relevancia de esta distribución radica en la optimización para producción: reduce el tiempo de inferencia de 445 ms a 370 ms por imagen y el pico de memoria GPU de 4515 MiB a 2472 MiB respecto al ONNX fp16 de referencia, manteniendo una fidelidad de IoU 0.9983 y MAE 0.0003 frente a las máscaras del original. Está pensada para pipelines de extracción de fondos en GPUs NVIDIA consumer y de datacenter.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de segmentación de primer plano con refinador Confidence Guided Matting (CGM), basada en BEN2 Base |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada fija de 1024 x 1024 píxeles) |
| Tipos de cuantizacion | fp16 (weakly typed, TensorRT elige precisión por capa); no hay int8 |
| Idiomas soportados | no disponible (modelo de imagen, sin procesamiento de lenguaje) |
| Licencia | MIT |
| Formato de pesos | TensorRT engine (`model.engine`), construido desde ONNX fp16; no hay safetensors ni GGUF |

## Arquitectura y entrenamiento

BEN2 se basa en una arquitectura de segmentación de primer plano con un pipeline de dos etapas: un modelo base que genera una estimación inicial de la máscara y una red refinadora que actúa sobre los píxeles de baja confianza para producir un matting más preciso. Esta innovación se denomina Confidence Guided Matting (CGM) y es el núcleo del artículo arXiv 2501.06230. El modelo fue entrenado sobre el conjunto de datos DIS5K, según indica la model card original, aunque no se detallan en la información disponible el número exacto de tokens, la composición completa del dataset ni si se emplearon técnicas de RLHF o DPO (no aplicables típicamente a modelos de segmentación).

La conversión a TensorRT realizada por moonbox-dev parte de la revisión `e48a20765f` de BEN2 Base y del grafo ONNX fp16 oficial. Los motores se construyen en modo *weakly typed*, donde TensorRT selecciona la precisión de cada capa (fp16 cuando es posible, fp32 cuando es necesario). Se documenta que un build *strongly typed* que mantuviera todos los tensores en fp16 provocaba desbordamientos en los kernels fusionados de TensorRT, generando NaN en todas las salidas. No se incluye versión int8 porque TensorRT requiere activaciones calibradas para ello.

## Capacidades

- Segmentación de primer plano y eliminación de fondos en imágenes RGB.
- Generación de máscaras de matting (canal alfa) con precisión de píxel.
- Refinamiento de bordes en zonas de baja confianza mediante el pipeline CGM.
- Entrada de imagen redimensionada a 1024 x 1024, RGB en rango 0-1 sin normalización, tensor `[1, 3, 1024, 1024]`.
- Salida de máscara `[1, 1, 1024, 1024]` reescalada a 0-1.
- Inferencia sin PyTorch: runner basado en NumPy y Polygraphy.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües (es un modelo puramente visual).

## Casos de uso

- Eliminación de fondos en producción para e-commerce: el motor TensorRT procesa imágenes de producto a 370 ms por imagen en una RTX 3080 Laptop, permitiendo generar catálogos con fondos transparentes de forma masiva y con bajo consumo de memoria (2472 MiB de pico).
- Edición fotográfica automatizada: integración del runner en herramientas de retoque para extraer sujetos y aplicar máscaras alfa, aprovechando la fidelidad de IoU 0.9983 frente al ONNX de referencia.
- Generación de assets para diseño gráfico: creación de recortes con bordes refinados gracias al pipeline CGM, adecuado para composiciones donde la precisión del matting en el pelo o bordes difusos es crítica.
- Pipelines de visión por computador en GPUs consumer: despliegue en estaciones con RTX 30/40/50 sin necesidad de recompilar motores, gracias a la compatibilidad hardware y de versión de TensorRT 10.13+.
- Preprocesado para modelos generativos: extracción de máscaras de sujeto para tareas de inpainting, sustitución de fondos o composición en flujos de difusión, con latencia inferior a medio segundo por imagen.
- Procesamiento por lotes en servidores con A100/H100: al ser motores compatibles con Ampere y posteriores, se pueden ejecutar en datacenter para tareas de segmentación a gran escala con menor huella de memoria que la referencia ONNX.

## Benchmarks y rendimiento

Datos publicados en la model card, evaluados sobre los conjuntos de test DIS5K (250 imágenes: DIS-TE1..4 y DIS-VD, 50 cada uno) en una RTX 3080 Laptop GPU:

| Modelo | vs ONNX fp16: IoU / MAE | DIS5K MAE / S-measure | ms por imagen | Pico de memoria GPU |
|---|---|---|---|---|
| ONNX fp16 (referencia) | - | 0.0244 / 0.937 | 445 | 4515 MiB |
| TensorRT `fp16/` | 0.9983 / 0.0003 | 0.0244 / 0.937 | 370 | 2472 MiB |

Los tiempos son medianas por imagen e incluyen el redimensionado a y desde 1024 x 1024. El criterio de aceptación fue MAE <= 0.005 e IoU >= 0.98 frente a la referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2472 MiB de pico según el benchmark publicado (RTX 3080 Laptop).
- GPU recomendadas: NVIDIA Ampere o posterior (RTX 30, 40 y 50 series; A100, H100 en datacenter), requisito de compatibilidad del motor.
- Cabe en GPUs consumer: sí, en RTX 3060 y superiores con al menos 3 GB de VRAM libre; el motor es de 490.2 MB.
- Opciones de despliegue: TensorRT 10.13+ con runtime lean (`tensorrt-cu12`, `tensorrt-lean-cu12`), Polygraphy y NumPy. No requiere PyTorch. No se distribuyen versiones para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: 370 ms por imagen en RTX 3080 Laptop (mediana, incluyendo redimensionado); no se publican datos de throughput para otras GPU.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|
| BEN2-TensorRT (este) | Segmentación/matting | 1024 x 1024 | MIT | TensorRT fp16 | 370 ms, 2472 MiB pico (RTX 3080 Laptop) |
| BEN2 Base (ONNX fp16) | Segmentación/matting | 1024 x 1024 | MIT | ONNX fp16 | 445 ms, 4515 MiB pico (RTX 3080 Laptop) |
| BEN2 Base (PyTorch) | Segmentación/matting | 1024 x 1024 | MIT | safetensors/PyTorch | no disponible en la información proporcionada |

No se dispone en la información proporcionada de datos comparativos con otros modelos de segmentación (por ejemplo, SAM, U2-Net o BiRefNet), por lo que no se incluyen cifras de terceros.

## Limitaciones y advertencias

- Modelo puramente visual: no procesa texto ni lenguaje, por lo que no aplican capacidades conversacionales ni multilingües.
- Entrada fija de 1024 x 1024: las imágenes deben redimensionarse, lo que puede afectar a la precisión en relaciones de aspecto extremas.
- El build *strongly typed* en fp16 produjo NaN en todas las salidas; solo el build *weakly typed* es funcional, lo que implica que TensorRT decide la precisión por capa y puede introducir fp32 en algunas capas.
- No hay versión int8 disponible (requeriría calibración de activaciones).
- Los motores son compatibles con Ampere y posteriores y TensorRT 10.13+; GPUs más antiguas o versiones anteriores de TensorRT no son compatibles.
- El rendimiento publicado corresponde a una RTX 3080 Laptop; en otras GPU la latencia y el consumo de memoria pueden variar.
- Licencia MIT, que permite uso comercial, pero los archivos son derivados de BEN2 Base y heredan su licencia, que rige su uso.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí puede producir máscaras incorrectas en imágenes con fondos complejos o sujetos poco definidos; se recomienda validación en producción.
- No se detallan sesgos conocidos del modelo original en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/moonbox-dev/BEN2-TensorRT
- Modelo base BEN2: https://huggingface.co/PramaLLC/BEN2
- Artículo arXiv: https://arxiv.org/abs/2501.06230
- Repositorio GitHub de BEN2: https://github.com/PramaLLC/BEN2/
- Sitio web del proyecto: https://backgrounderase.net
- Dataset DIS5K: https://github.com/xuebinqin/DIS
- Papers with Code (DIS-VD): https://paperswithcode.com/sota/dichotomous-image-segmentation-on-dis-vd?p=ben-using-confidence-guided-matting-for
