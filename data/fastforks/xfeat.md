# fastforks/xfeat

## Resumen

XFeat es un modelo de extracción y emparejamiento de características locales (feature matching) para visión por computador, publicado originalmente por Potje et al. en CVPR 2024. Se trata de una CNN ligera que detecta hasta 4096 keypoints por imagen y genera descriptores de 64 dimensiones, que posteriormente se emparejan mediante vecinos mutuos más cercanos o mediante LighterGlue, una variante reducida de LightGlue entrenada específicamente para XFeat. El modelo resuelve el problema clásico de correspondencia entre dos imágenes de una misma escena, devolviendo los conjuntos de keypoints, los pares de índices emparejados y sus puntuaciones de confianza.

Esta ficha corresponde al repositorio `fastforks/xfeat`, que es únicamente una model card: no aloja pesos. El paquete `fastforks` descarga los pesos originales de los autores desde sus enlaces y los verifica contra hashes SHA-256. El modelo está etiquetado como de nivel experimental y con backend `portable`, con soporte CUDA y PyTorch. Su relevancia actual radica en que ofrece un emparejamiento denso y disperso de bajo coste computacional (del orden de milisegundos por par de imágenes en GPU consumer) con licencia Apache-2.0, lo que lo hace apto para pipelines de reconstrucción 3D, SLAM y odometría visual.

La arquitectura es una CNN pequeña, no un transformer, y no dispone de ventana de contexto en el sentido de los modelos de lenguaje. Su entrada son dos imágenes RGB de una misma escena y su salida son correspondencias píxel a píxel o pares de keypoints emparejados, según la variante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN ligera para detección de keypoints y descriptores locales (XFeat); emparejamiento con LighterGlue (variante reducida de LightGlue) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de cualquier H x W >= 32, con padding a múltiplo de 32) |
| Tipos de cuantizacion | fp16 y fp32 (soportados en los benchmarks); no se documentan cuantizaciones enteras |
| Idiomas soportados | no aplica (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 (código y pesos) |
| Formato de pesos | `.pt` (PyTorch); no se documentan safetensors ni GGUF |

## Arquitectura y entrenamiento

XFeat es una red neuronal convolucional compacta que, dada una imagen, produce un mapa de keypoints (hasta 4096 por imagen) y descriptores de 64 dimensiones por keypoint. El emparejamiento se realiza por vecinos mutuos más cercanos o, en la variante `xfeat-lighterglue`, mediante LighterGlue, una versión reducida de LightGlue entrenada para operar sobre los descriptores de XFeat. El modelo devuelve los keypoints de ambas imágenes, los pares de índices emparejados y las puntuaciones de confianza.

En cuanto a los datos de entrenamiento, XFeat se entrenó con MegaDepth (colecciones de fotos de Internet con profundidad SfM/MVS) y con deformaciones sintéticas de un subconjunto de 20 000 imágenes de COCO 2017. LighterGlue se entrenó con GlueFactory sobre MegaDepth. No se documenta en la información disponible el número exacto de tokens o pares de entrenamiento, ni si se emplearon técnicas de RLHF o DPO (no aplicables en este dominio). Como innovación técnica destacable, el modelo está diseñado para ser extremadamente ligero y rápido: en resolución 768x1024 tarda 8,89 ms en fp16 con el código original y 7,17 ms con el backend portable, con un pico de memoria de 122 MiB asignados.

## Capacidades

- Detección de hasta 4096 keypoints por imagen con descriptores de 64 dimensiones.
- Emparejamiento disperso de características entre dos imágenes de una misma escena.
- Emparejamiento denso: para cada píxel de la primera imagen, su posición (x, y) en la segunda y una certeza de visibilidad en ambas.
- Emparejamiento mediante vecinos mutuos más cercanos o mediante LighterGlue (con puntuaciones de confianza).
- Salidas: `keypoints1`, `keypoints2`, `pairs` y `scores`.
- Entrada de cualquier tamaño H x W >= 32, con padding a múltiplo de 32; probado hasta 3000x4000.
- Soporte de fp16 y fp32; backend `portable` y kernels CUDA para el backend `kernels`.
- Compatibilidad con `torch.compile` y con TensorRT fp16 (planificado para 0.2.1).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües (es un modelo puramente visual).

## Casos de uso

- Reconstrucción 3D y structure from motion: el modelo proporciona correspondencias entre pares de imágenes que alimentan pipelines de SfM para estimar poses de cámara y nubes de puntos; su bajo coste (7-22 ms por par) permite procesar grandes colecciones de fotos.
- SLAM y odometría visual: el emparejamiento en tiempo casi real (menos de 10 ms por par en GPU consumer) permite estimar el movimiento de la cámara entre fotogramas consecutivos en robots y vehículos.
- Registro de imágenes (image registration): alineación de imágenes médicas, satelitales o de inspección industrial mediante correspondencias densas con certeza de visibilidad.
- Realidad aumentada y visión por computador en el borde: el reducido consumo de memoria (122 MiB asignados en 768x1024) y la latencia permiten ejecutarlo en GPUs de gama media para anclar objetos virtuales sobre escenas reales.
- Búsqueda visual y verificación de lugares: el emparejamiento de keypoints entre una consulta y una base de imágenes permite reconocer ubicaciones o duplicados con verificación geométrica posterior mediante RANSAC.
- Fotogrametría y generación de modelos 3D: el emparejamiento denso con puntuaciones de certeza facilita la densificación de nubes de puntos a partir de pares de imágenes solapadas.
- Investigación en visión por computador: al ser Apache-2.0 y ligero, sirve como baseline reproducible para comparar matchers dispersos y densos en MegaDepth-1500.

## Benchmarks y rendimiento

Precisión en MegaDepth-1500 (AUC de pose relativa @5 / @10 / @20 grados, RANSAC con matriz esencial, umbral 0,5 px):

| Variante | Dataset / protocolo | original fp32 | original fp16 | portable |
|---|---|---|---|---|
| `xfeat` | MegaDepth-1500, todos los pares | no disponible | no disponible | 26,2 / 42,2 / 57,5 |
| `xfeat` | MegaDepth-1500, cada 5.º par | 29,1 / 46,1 / 60,8 | 28,4 / 44,6 / 60,1 | 29,1 / 46,1 / 60,8 |
| `xfeat-lighterglue` | MegaDepth-1500 | no disponible en el extracto | no disponible | no disponible en el extracto |

Velocidad y memoria (sintético, 768x1024, RTX 5060 Ti 16 GB, sm_120):

| Modelo | Tiempo original fp16 | Tiempo portable | Tiempo torch.compile | Memoria pico portable (MiB asignados / reservados) |
|---|---|---|---|---|
| `xfeat` | 8,89 ms | 7,17 ms | 5,65 ms | 122 / 154 |
| `xfeat-lighterglue` | 23,6 ms | 21,6 ms | 16,2 ms | 445 / 476 |

Arranque y primera llamada:

| Modelo | Carga original (s) | Carga portable (s) | Primera llamada original (s) | Primera llamada portable (s) |
|---|---|---|---|---|
| `xfeat` | 1,51 | 0,16 | 0,63 | 0,74 |
| `xfeat-lighterglue` | 1,46 | 0,25 | 0,69 | 0,68 |

No se han publicado en la información disponible resultados comparativos con otros matchers (LightGlue, LoFTR, DeDoDe) más allá de la mención de que sus valores por defecto se usaron en el protocolo de evaluación.

## Requisitos de hardware

- VRAM estimada: 122 MiB asignados / 154 MiB reservados para `xfeat` en 768x1024; 445 / 476 MiB para `xfeat-lighterglue`. En 3000x4000, 1,0 GiB asignados y 1,2 GiB reservados para ambas variantes.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA; los benchmarks se realizaron en una RTX 5060 Ti 16 GB (sm_120).
- Cabe holgadamente en GPUs consumer: una RTX 3060 de 12 GB o superior es más que suficiente; incluso GPUs con 2-4 GB de VRAM pueden ejecutar el modelo a resoluciones moderadas.
- Opciones de despliegue: paquete `fastforks` (backend `portable`), kernels CUDA del backend `kernels`, `torch.compile` y TensorRT fp16 (planificado para 0.2.1). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de visión).
- Latencia: 7,17 ms por par en 768x1024 con backend portable; 5,65 ms con `torch.compile`; 16,2 ms para la variante con LighterGlue. El throughput depende del tamaño de imagen y del número de pares procesados en lote.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / entrada | Precisión MegaDepth-1500 (AUC@5) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| XFeat (este repo) | CNN dispersa + LighterGlue | no disponible | imágenes H x W >= 32 | 26,2 (portable, todos los pares) / 29,1 (cada 5.º par) | Apache-2.0 | Hugging Face (model card), pesos en GitHub del autor |
| LightGlue | Transformer disperso | no disponible | imágenes de tamaño variable | no disponible en la información | no disponible en la información | no disponible en la información |
| LoFTR | Transformer denso | no disponible | imágenes de tamaño variable | no disponible en la información | no disponible en la información | no disponible en la información |
| DeDoDe | Detector + descriptor | no disponible | imágenes de tamaño variable | no disponible en la información | no disponible en la información | no disponible en la información |

Los datos de los modelos alternativos no se detallan en la información proporcionada; la comparación cuantitativa queda por tanto limitada a la variante XFeat.

## Limitaciones y advertencias

- El repositorio `fastforks/xfeat` no contiene pesos: solo es una model card. Es necesario descargar los pesos desde los enlaces del autor y verificar su SHA-256.
- Nivel de madurez experimental: la propia model card lo etiqueta como "experimental"; no debe asumirse estabilidad de API ni de resultados en producción.
- Es un modelo puramente visual: no procesa texto, no tiene capacidades multilingües ni de razonamiento, y no soporta tool calling ni agentes.
- El emparejamiento puede fallar en escenas con poca textura, cambios extremos de iluminación, oclusiones severas o movimientos grandes entre imágenes; la verificación geométrica con RANSAC es recomendable.
- Riesgo de falsos positivos en las correspondencias: las puntuaciones de confianza deben filtrarse y validarse con una matriz esencial o fundamental.
- La licencia Apache-2.0 permite uso comercial, pero la model card advierte de que el paquete original es de uso de investigación y que deben revisarse las cadenas de licencia antes de cualquier otro uso.
- Los datos de entrenamiento (MegaDepth, COCO 2017) pueden introducir sesgos hacia escenas urbanas y turísticas de Internet, con menor representación de otros dominios.
- La información sobre benchmarks de la variante `xfeat-lighterglue` está truncada en la fuente; no se dispone de sus valores completos de precisión.
- No se documentan cuantizaciones enteras (int8, int4), lo que limita el despliegue en hardware sin soporte de fp16.

## Enlaces

- Model card en Hugging Face: https://huggingface.co/fastforks/xfeat
- Repositorio del paquete fastforks: https://github.com/kleinicke/fastforks
- Kernels del backend: https://huggingface.co/fastforks/kernels
- Código original de los autores (accelerated_features): https://github.com/verlab/accelerated_features
- Pesos xfeat.pt: https://github.com/verlab/accelerated_features/raw/e92685f57f8318b18725c5c8c0bd28c7fe188d9a/weights/xfeat.pt
- Pesos xfeat-lighterglue.pt: https://github.com/verlab/accelerated_features/raw/e92685f57f8318b18725c5c8c0bd28c7fe188d9a/weights/xfeat-lighterglue.pt
- Documentación de benchmarks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Documentación de structure from motion: ../sfm.md
- Fichero de hashes card.toml: https://github.com/kleinicke/fastforks/blob/main/src/fastforks/matching/models/xfeat/card.toml
- Licencia original: https://github.com/verlab/accelerated_features/blob/e92685f57f8318b18725c5c8c0bd28c7fe188d9a/LICENSE
- README original: https://github.com/verlab/accelerated_features/blob/e92685f57f8318b18725c5c8c0bd28c7fe188d9a/README.md#license
