# FixedSeed/lattice-vision

## Resumen

Lattice vision es un repositorio de modelos ONNX publicado por FixedSeed que agrupa los pesos necesarios para los nodos de matting (recorte de personas) y estimación de pose corporal de su aplicación Lattice. No se trata de un modelo entrenado por FixedSeed, sino de una redistribución en formato ONNX de pesos originales de terceros: BiRefNet_lite-matting (Peng Zheng et al.), RTMW-m y RTMW-l (OpenMMLab) y YOLOX-tiny entrenado sobre Human-Art (OpenMMLab y Megvii). El único cambio respecto a los originales es el formato: exportación a ONNX, cuantización fp16 de los pesos con entradas y salidas en float32, y optimizaciones específicas para que la inferencia corra íntegramente en la GPU vía onnxruntime-web con el backend WebGPU.

El interés del repositorio es práctico y de despliegue: permite ejecutar segmentación de primer plano de alta calidad y estimación de pose de 133 puntos COCO-WholeBody directamente en el navegador, sin backend de servidor. Para ello se reescribió la deformable convolution de BiRefNet como una combinación de `GridSample` y `MatMul`, evitando aritmética de índices int64 que caería a la CPU en WebGPU, y se deduplicaron los pesos del backbone que el export escribía dos veces.

El repositorio es pequeño (unos 0,5 GB) y no incluye model card con benchmarks propios ni datos de entrenamiento; toda la información técnica disponible describe la conversión de formato, las interfaces de entrada y salida de cada fichero y las licencias heredadas de los autores originales. La licencia se declara como "other" con nombre `mit-and-apache-2.0`, aplicando MIT a BiRefNet y Apache-2.0 a los modelos de OpenMMLab.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BiRefNet_lite (matting, transformer con deformable conv), RTMW (pose, top-down con SimCC), YOLOX-tiny (detección de personas) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelos de visión) |
| Tipos de cuantizacion | fp16 en pesos, entradas y salidas float32 |
| Idiomas soportados | no disponible (modelos de visión, sin componente de texto) |
| Licencia | other (`mit-and-apache-2.0`): MIT para BiRefNet, Apache-2.0 para mmpose y YOLOX |
| Formato de pesos | ONNX (opset 17 en BiRefNet) |

Resolución de entrada por fichero:

| Fichero | Entrada | Salida |
|---|---|---|
| `birefnet-lite-matting-512-fp16.onnx` | (1, 3, 512, 512) RGB 0..1, normalización ImageNet | logits (aplicar sigmoid) |
| `birefnet-lite-matting-768-fp16.onnx` | (1, 3, 768, 768) | logits |
| `birefnet-lite-matting-1024-fp16.onnx` | (1, 3, 1024, 1024) | logits |
| `rtmw-m-256x192-fp16.onnx` | (N, 3, 192, 256) RGB, media 123.675/116.28/103.53, std 58.395/57.12/57.375 | `simcc_x` (N, 133, 2W), `simcc_y` (N, 133, 2H) |
| `rtmw-l-384x288-fp16.onnx` | (N, 3, 288, 384) | `simcc_x`, `simcc_y` |
| `yolox-tiny-humanart.onnx` | (1, 3, 416, 416) BGR 0..255, padding gris 114 | `dets` (1, K, 5), `labels` (1, K) |

## Arquitectura y entrenamiento

BiRefNet_lite-matting es un modelo de segmentación binaria de alta resolución basado en un backbone transformer con módulos de deformable convolution; el checkpoint incluido corresponde a la epoch 110 del modelo lite. En la exportación a ONNX se sustituyó cada `deform_conv2d` de torchvision por un `GridSample` más un `MatMul`, con una desviación máxima de 5e-5 respecto al operador original y de 3e-5 en los logits del modelo completo, lo que permite que toda la computación permanezca en la GPU bajo WebGPU. Además se aplicó onnxslim, se almacenaron los pesos del backbone una sola vez (el export original los duplicaba porque BiRefNet ejecuta el backbone a escala completa y a media escala) y se generaron tres variantes con entrada cuadrada fija de 512, 768 y 1024 píxeles.

RTMW es un modelo top-down de estimación de pose que predice 133 puntos COCO-WholeBody mediante SimCC (clasificación 1D sobre coordenadas x e y); las variantes incluidas son RTMW-m a 256x192 y RTMW-l a 384x288, ambas derivadas de los checkpoints `rtmw-dw-l-m_simcc-cocktail14` de OpenMMLab. La conversión a fp16 mantiene los keypoints dentro de 0,08 píxeles del modelo float32. YOLOX-tiny se incluye sin modificar (end2end.onnx de OpenMMLab) y se usa para generar las cajas de persona que alimentan a RTMW; está entrenado sobre Human-Art, con NMS integrado en el grafo.

No hay información sobre el número de tokens, la composición del dataset de entrenamiento ni sobre fases de RLHF o DPO, ya que los modelos son de visión y los datos de entrenamiento corresponden a los papers originales de BiRefNet, RTMW y YOLOX, no documentados en este repositorio.

## Capacidades

- Matting de primer plano de alta resolución: genera una máscara alfa (logits + sigmoid) para separar personas u objetos del fondo, con tres resoluciones de entrada (512, 768 y 1024).
- Estimación de pose corporal densa: 133 keypoints COCO-WholeBody (cuerpo, manos, cara y pies) mediante SimCC, en variantes media (256x192) y large (384x288).
- Detección de cajas de persona: YOLOX-tiny entrenado sobre Human-Art, con NMS incluido en el grafo ONNX, salida de cajas y etiquetas (clase 0 = persona).
- Inferencia íntegra en GPU en el navegador: todos los nodos corren en onnxruntime-web con backend WebGPU, sin fallback a CPU por operadores int64.
- Procesamiento por lotes en pose: las entradas de RTMW aceptan dimensión N, por lo que se pueden procesar varias personas por llamada.
- Preprocesado y postprocesado documentados: normalización ImageNet para BiRefNet, normalización 0..255 para RTMW, recorte de caja expandida 1,25 veces al aspecto del modelo, y decodificación SimCC por argmax dividido entre 2.
- No incluye generación de texto, razonamiento, código, tool calling, agentes ni capacidades multilingües.

## Casos de uso

- Edición de fotografía en el navegador: eliminar o sustituir fondos en una aplicación web sin subir la imagen al servidor, usando BiRefNet a 512 para vista previa y a 1024 para exportación final.
- Videollamadas y streaming con fondo virtual: segmentación por fotograma con la variante de 512 píxeles, que es la de menor coste computacional de las tres.
- Análisis ergonómico o deportivo: extracción de 133 keypoints por persona con RTMW-l a 384x288 para calcular ángulos articulares, posturas o repeticiones en vídeo.
- Animación de avatares y motion capture ligero: RTMW-m a 256x192 ofrece menor latencia y es adecuado para seguimiento en tiempo real de cuerpo y manos.
- Moderación y anonimización de contenido: detección de personas con YOLOX-tiny seguida de desenfoque o recorte mediante la máscara de BiRefNet, todo en cliente.
- Herramientas de diseño y comercio electrónico: generación de recortes de producto o de modelo con canal alfa para catálogos, aprovechando la resolución de 1024 para impresión.
- Aplicaciones de realidad aumentada web: superposición de elementos gráficos anclados a puntos corporales (muñecas, hombros, caderas) usando la salida SimCC de RTMW.

## Benchmarks y rendimiento

El autor documenta únicamente métricas de fidelidad de la conversión, no benchmarks de calidad frente a otros modelos:

| Metrica | Valor |
|---|---|
| BiRefNet, MSE x 1e-3 en 100 retratos P3M-500-NP (512) | 5,10 |
| BiRefNet, MSE x 1e-3 en 100 retratos P3M-500-NP (768) | 3,60 |
| BiRefNet, desviación de `deform_conv2d` sustituido vs torchvision | ≤ 5e-5 |
| BiRefNet, desviación de logits del modelo completo vs PyTorch | ≤ 3e-5 |
| RTMW, desviación de keypoints vs modelo float32 | ≤ 0,08 px |

No se han publicado resultados de benchmarks estándar (AP de pose, IoU/S-measure de matting, mAP de detección) en la información disponible.

## Requisitos de hardware

- Al ser modelos ONNX ejecutados en onnxruntime-web con WebGPU, el requisito es un navegador con soporte WebGPU (Chrome/Edge en versiones recientes) y una GPU compatible; no se especifican VRAM mínimas.
- Tamaño del repositorio completo: 0,5 GB, repartido entre los tres ficheros de BiRefNet, los dos de RTMW y el de YOLOX-tiny.
- La variante de matting a 1024 es la de mayor coste de memoria y cómputo; la de 512 y RTMW-m a 256x192 son las opciones ligeras para tiempo real.
- En GPUs de escritorio discretas (RTX 4090, A100, H100) la carga es trivial en términos de memoria, pero el cuello de botella real es la implementación WebGPU del navegador, no la GPU.
- Opciones de despliegue: onnxruntime-web con WebGPU (objetivo declarado), y en servidor onnxruntime estándar, ya que los ficheros son ONNX convencionales de opset 17.
- No se proporcionan cifras de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Tarea | Parametros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Lattice vision (BiRefNet_lite) | Matting | no disponible | 512/768/1024 fijo | MIT (BiRefNet) | ONNX en HF |
| Lattice vision (RTMW-m/l) | Pose 133 puntos | no disponible | 256x192 / 384x288 | Apache-2.0 | ONNX en HF |
| BiRefNet original (ZhengPeng7) | Matting | no disponible | resolución variable en PyTorch | MIT | Pesos PyTorch en GitHub/HF |
| RTMW original (OpenMMLab) | Pose 133 puntos | no disponible | 256x192 / 384x288 | Apache-2.0 | PyTorch vía mmpose |
| YOLOX-tiny original (Megvii) | Detección | no disponible | 416x416 | Apache-2.0 | PyTorch/ONNX |

La diferencia frente a los originales no es de calidad sino de empaquetado: Lattice vision ofrece los mismos pesos en ONNX fp16 optimizados para WebGPU, con resoluciones de entrada fijas y sin dependencia de PyTorch. No hay datos de benchmarks que permitan comparar rendimiento entre estas variantes.

## Limitaciones y advertencias

- No es un modelo propio: los pesos pertenecen a los autores originales y las condiciones de uso son las de sus licencias (MIT para BiRefNet, Apache-2.0 para mmpose y YOLOX), no las de FixedSeed.
- La licencia declarada en HuggingFace es "other" con nombre `mit-and-apache-2.0`; conviene revisar los ficheros `LICENSE-BiRefNet-MIT.txt` y `LICENSE-mmpose-Apache-2.0.txt` antes de un uso comercial.
- Las entradas de BiRefNet son cuadradas y de tamaño fijo por fichero; no admiten resolución arbitraria sin reescalado externo.
- RTMW es top-down: requiere cajas de persona previas (por eso se incluye YOLOX-tiny) y su precisión depende de la calidad de esas cajas y del recorte expandido 1,25 veces.
- YOLOX-tiny está entrenado sobre Human-Art, por lo que su dominio es personas en contextos artísticos y puede degradarse en otras escenas.
- No hay información sobre sesgos demográficos, robustez ante oclusiones ni tasas de fallo en condiciones de poca luz.
- El rendimiento real depende del soporte WebGPU del navegador y del driver; en equipos sin WebGPU la inferencia puede no ser viable.
- Al ser modelos de visión, no hay riesgo de alucinación textual, pero sí de máscaras o keypoints incorrectos en imágenes ambiguas.
- El repositorio no incluye model card con datos de entrenamiento, evaluación estándar ni limitaciones declaradas por el autor.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/FixedSeed/lattice-vision
- Página del producto Lattice: https://fixedseed.com/lattice
- BiRefNet (autores originales): https://github.com/ZhengPeng7/BiRefNet
- MMpose / RTMPose (OpenMMLab): https://github.com/open-mmlab/mmpose/tree/main/projects/rtmpose
- Licencia MIT de BiRefNet: https://huggingface.co/FixedSeed/lattice-vision/blob/main/LICENSE-BiRefNet-MIT.txt
- Licencia Apache-2.0 de mmpose: https://huggingface.co/FixedSeed/lattice-vision/blob/main/LICENSE-mmpose-Apache-2.0.txt
- Licencia del repositorio: https://huggingface.co/FixedSeed/lattice-vision/blob/main/README.md
