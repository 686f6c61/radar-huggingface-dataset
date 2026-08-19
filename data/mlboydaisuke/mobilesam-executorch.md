# mlboydaisuke/MobileSAM-ExecuTorch

## Resumen

MobileSAM-ExecuTorch es una conversión del modelo MobileSAM (Segment Anything Model ligero) al formato ExecuTorch con delegado XNNPACK, pensada para inferencia en dispositivos. MobileSAM sustituye el encoder ViT-H de SAM por TinyViT, reduciendo drásticamente el tamaño y la latencia sin perder la capacidad de segmentación promptable. Esta versión concreta, publicada por mlboydaisuke, proporciona cuatro archivos `.pte` (encoder y decoder en distintas precisiones) que permiten ejecutar la segmentación por puntos o cajas en CPU, sin GPU dedicada.

El modelo resuelve el problema de llevar la segmentación semántica interactiva a entornos con recursos limitados (móviles, edge, integrados). Su relevancia actual radica en que ExecuTorch es el runtime oficial de PyTorch para despliegue on-device, y XNNPACK optimiza la ejecución en CPUs ARM y x86. La conversión incluye tres reescrituras técnicas documentadas que generalizan a otros puertos de la familia SAM, lo que lo convierte en una referencia útil para desarrolladores que trabajen con modelos de segmentación en entornos embebidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TinyViT (encoder) + decoder ligero tipo SAM (TwoWayTransformer) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | fp32, int8 dinamico (encoder), fp16 (decoder) |
| Idiomas soportados | no disponible (modelo de vision, sin texto) |
| Licencia | Apache-2.0 (codigo) / MIT (pesos) |
| Formato de pesos | .pte (ExecuTorch) |

## Arquitectura y entrenamiento

MobileSAM es una variante de SAM (Segment Anything Model) que reemplaza el encoder ViT-H por TinyViT, un transformer visual eficiente. El decoder mantiene la estructura de SAM (TwoWayTransformer) pero simplificada, y el prompt encoder está integrado en el propio decoder. En esta conversión, el encoder procesa una imagen de 1024×1024 y produce un embedding de 1×256×64×64; el decoder toma ese embedding junto con puntos y etiquetas (coordenadas en espacio 1024, etiquetas 1=fg/0=bg) y devuelve tres máscaras de 256×256 y sus puntuaciones IoU.

El entrenamiento original de MobileSAM se realizó sobre el dataset SA-1B, pero los detalles concretos (número de tokens, composición exacta, uso de RLHF/DPO) no están disponibles en la información proporcionada. La conversión a ExecuTorch se hizo con `torch.export` y `to_edge_transform_and_lower(XnnpackPartitioner)`. Se documentan tres reescrituras necesarias: precomputar el embedding posicional constante, reescribir la asignación con máscara booleana como aritmética, y eliminar un `repeat_interleave` identidad. Estas modificaciones son relevantes para cualquier puerto de modelos SAM a ExecuTorch.

## Capacidades

- Segmentacion promptable por puntos: el usuario hace clic en un objeto y el modelo genera la mascara correspondiente.
- Segmentacion por caja (bounding box) si se proporcionan dos puntos como esquinas.
- Generacion de tres mascaras candidatas con puntuacion IoU para elegir la mejor.
- Ejecucion on-device en CPU gracias a XNNPACK, sin necesidad de GPU.
- Compatibilidad entre archivos: cualquier encoder (fp32 o int8) puede combinarse con cualquier decoder (fp32 o fp16), ya que todos intercambian tensores fp32.
- Preprocesamiento y postprocesamiento estandarizados (normalizacion SAM, redimensionado a 1024, umbral >0 y upsampling 4×).

## Casos de uso

- Edicion de imagenes en movil: aplicaciones de recorte de objetos donde el usuario toca la pantalla para seleccionar un elemento y el modelo genera la mascara en tiempo real. El tamaño reducido (24.5 MB el par mas pequeno) permite cargarlo en memoria sin problemas.
- Segmentacion en tiempo real en dispositivos edge: robots o camaras inteligentes que necesitan identificar objetos en streaming. La latencia del encoder (130 ms en Mac arm64) es aceptable para procesamiento por fotogramas, y el decoder (20 ms) responde rapidamente a interacciones.
- Herramientas de anotacion de datos: asistentes de etiquetado que corrigen o refinan mascaras con un clic, reduciendo el trabajo manual en pipelines de datos de entrenamiento.
- Realidad aumentada: aplicaciones que necesitan segmentar el entorno (manos, objetos, personas) para superponer contenido virtual. La ejecucion en CPU evita depender de GPUs moviles.
- Automatizacion industrial: inspeccion visual en lineas de produccion donde se requiere segmentar defectos o piezas sin conexion a la nube. El modelo puede ejecutarse en hardware embebido con XNNPACK.
- Investigacion en segmentacion eficiente: como punto de partida para experimentar con distillation o cuantizacion de modelos SAM, gracias a la documentacion detallada de las reescrituras necesarias.

## Benchmarks y rendimiento

La model card proporciona datos de verificacion y rendimiento en Mac arm64 (executorch 1.4.0, torch 2.13.0). No se publican benchmarks estandar como mIoU o COCO, pero se incluyen metricas de fidelidad y latencia:

| Grafo | Salida | Forma | max_abs_diff | Correlacion |
|---|---|---|---|---|
| Encoder | image_embed | [1, 256, 64, 64] | 3.815e-06 | 1.000000 |
| Decoder | mask logits | [1, 3, 256, 256] | 1.717e-05 | 1.000000 |
| Decoder | iou | [1, 3] | 1.192e-07 | 1.000000 |

| Metrica | Valor |
|---|---|
| Latencia encoder (ExecuTorch) | 130.3 ms (mediana, 10 runs) |
| Latencia encoder (torch eager) | 138.7 ms |
| Latencia decoder (ExecuTorch) | 20.5 ms |
| Latencia decoder (torch eager) | 11.2 ms |
| Cobertura delegado XNNPACK encoder | 89.0% |
| Cobertura delegado XNNPACK decoder | 80.6% |

Estos numeros son una referencia relativa en un solo proceso, no un benchmark de dispositivo final.

## Requisitos de hardware

- Tamano de los archivos: encoder fp32 28.3 MB, encoder int8 14.0 MB, decoder fp32 20.5 MB, decoder fp16 10.5 MB. El par mas pequeno (int8 + fp16) ocupa 24.5 MB.
- Inferencia en CPU: no requiere GPU. XNNPACK esta optimizado para CPUs ARM (moviles, Raspberry Pi) y x86.
- VRAM: no aplica, al ejecutarse en CPU. La memoria RAM necesaria es del orden de decenas de MB (los tensores intermedios son pequenos).
- GPU recomendadas: ninguna en particular; si se desea acelerar, se puede usar el backend Vulkan de ExecuTorch, pero no esta incluido en esta conversion.
- Opciones de despliegue: ExecuTorch runtime en aplicaciones C++ o Python. No se menciona compatibilidad con vLLM, Ollama o TGI (no son relevantes para vision).
- Latencia: encoder ~130 ms, decoder ~20 ms en Mac arm64 (referencia). En dispositivos moviles puede variar segun la CPU.

## Comparativa con modelos similares

| Modelo | Formato | Tamano (par minimo) | Encoder | Decoder | Licencia |
|---|---|---|---|---|---|
| MobileSAM-ExecuTorch (este) | .pte (XNNPACK) | 24.5 MB | TinyViT | TwoWayTransformer | Apache-2.0 / MIT |
| SAM2.1-hiera-tiny-ExecuTorch | .pte (XNNPACK) | no disponible | Hiera-Tiny | SAM2 decoder | Apache-2.0 |
| EdgeTAM-ExecuTorch | .pte (XNNPACK) | no disponible | no disponible | no disponible | Apache-2.0 |

La model card menciona que MobileSAM comparte el mismo contrato de prompts que SAM2.1 y EdgeTAM, con dos diferencias: el decoder de MobileSAM solo necesita el embedding de imagen (sin mapas de caracteristicas de alta resolucion) y las etiquetas son fp32 en lugar de int64. No se dispone de comparaciones de rendimiento entre estos modelos.

## Limitaciones y advertencias

- El encoder no tiene version fp16: TinyViT no sobrevive a media precision (la correlacion cae a -0.37 con `model.half()` en eager). La cuantizacion int8 dinamica es la unica opcion de reduccion de tamano para el encoder.
- El decoder no tiene version int8: la cuantizacion dinamica produce un archivo mas grande (21.8 MB) que el fp32 (20.5 MB) debido al embedding posicional constante en fp32 y la metadatos de cuantizacion.
- La conversion requiere tres reescrituras manuales del grafo; si se intenta exportar el modelo original sin estos cambios, se obtienen resultados incorrectos (por ejemplo, corr 0.78 en la capa 0 del transformer).
- No se proporcionan datos de sesgos o alucinaciones (al ser un modelo de vision, el riesgo de alucinacion se manifiesta como mascaras incorrectas en regiones ambiguas).
- La licencia es Apache-2.0 para el codigo de conversion y MIT para los pesos originales de MobileSAM; ambos permiten uso comercial, pero hay que verificar el cumplimiento de las atribuciones.
- Los tiempos de inferencia son relativos a un Mac arm64 y no deben extrapolarse a otros dispositivos sin pruebas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mlboydaisuke/MobileSAM-ExecuTorch
- Repositorio oficial de MobileSAM: https://github.com/ChaoningZhang/MobileSAM
- Pesos originales utilizados: https://huggingface.co/dhkim2810/MobileSAM
- Script de conversion (executorch-models): https://github.com/john-rocky/executorch-models
- Version Core ML del mismo autor: https://huggingface.co/mlboydaisuke/MobileSAM-CoreML
- Coleccion Core ML Model Zoo: https://huggingface.co/collections/mlboydaisuke/core-ml-model-zoo
- MobileSAM en Qualcomm AI Hub: https://aihub.qualcomm.com/models/mobilesam
