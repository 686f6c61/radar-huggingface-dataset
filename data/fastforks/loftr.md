# fastforks/loftr

## Resumen

LoFTR (Local Feature TRansformer) es un modelo de emparejamiento denso de imagenes (dense matching) sin detector de puntos clave, publicado originalmente por Sun et al. en CVPR 2021. Dado un par de imagenes RGB de una misma escena, devuelve para cada pixel de la primera imagen su posicion correspondiente en la segunda, junto con una puntuacion de confianza. Este repositorio concreto, `fastforks/loftr`, es una model card de integracion: no aloja pesos propios, sino que describe como la libreria fastforks descarga los pesos originales de los autores y los valida mediante SHA-256.

La relevancia actual del repositorio no reside en el modelo en si (que es un trabajo de 2021 ampliamente citado), sino en la infraestructura de despliegue que lo acompana: backends `portable` y `kernels`, compatibilidad con `torch.compile`, fp16 y planes de TensorRT, con mediciones de latencia y memoria sobre una RTX 5060 Ti de 16 GB. Para desarrolladores que necesitan matching denso en pipelines de vision por computador (SfM, SLAM, reconstruccion 3D), este fork ofrece una via de ejecucion mas rapida y con menor huella de memoria que el codigo original.

La arquitectura combina un backbone ResNet-FPN que extrae caracteristicas a resoluciones 1/8 y 1/2, un transformer de atencion lineal que empareja las celdas 1/8 de ambas imagenes mediante dual-softmax y vecinos mutuos mas cercanos con umbral de confianza, y un segundo transformer que refina cada match a precision subpixel en una ventana de 5x5 a resolucion 1/2. El repositorio se marca como tier experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-FPN + transformer de atencion lineal (detector-free dense matching) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | fp16 (soportado); fp32 (por defecto en codigo original); no se documentan otras |
| Idiomas soportados | no disponible (modelo de vision, no linguistico) |
| Licencia | Apache-2.0 (codigo y pesos); datos de entrenamiento con restricciones (ver limitaciones) |
| Formato de pesos | `.ckpt` (checkpoints de PyTorch, alojados en `kornia/loftr`) |

## Arquitectura y entrenamiento

LoFTR es un matcher denso detector-free. El backbone es una ResNet-FPN que produce mapas de caracteristicas a 1/8 y 1/2 de resolucion. Sobre las celdas 1/8 se aplica un transformer de atencion lineal que cruza las dos imagenes, seguido de una capa de dual-softmax y un filtrado por vecinos mutuos mas cercanos con umbral de confianza para obtener matches gruesos. Posteriormente, un segundo transformer refina cada match a precision subpixel dentro de una ventana de 5x5 a resolucion 1/2. La salida son los puntos emparejados en ambas imagenes, los pares de indices (identidad) y la confianza gruesa.

En cuanto a datos de entrenamiento: la variante `loftr-outdoor` se entrena con MegaDepth (colecciones de fotos de Internet con profundidad SfM/MVS); la variante `loftr-indoor` se entrena con ScanNet, cuyos terminos de uso restringen el uso a investigacion no comercial. No se documenta en la informacion disponible el numero de tokens ni el volumen exacto del dataset, ni si hubo etapas de RLHF/DPO (no aplicables a este tipo de modelo). La innovacion tecnica destacable es precisamente el enfoque detector-free con atencion lineal, que evita la deteccion previa de keypoints y permite matching denso end-to-end.

## Capacidades

- Emparejamiento denso de imagenes: para cada pixel de la primera imagen devuelve su posicion (x, y en pixeles) en la segunda y una certeza de visibilidad conjunta.
- Salidas estructuradas: `keypoints1`, `keypoints2`, `pairs`, `scores`.
- Matching subpixel mediante refinamiento en ventana 5x5 a resolucion 1/2.
- Entrada de tamano arbitrario H x W >= 32, con padding a multiplo de 32.
- Dos variantes especializadas por dominio: `loftr-indoor@1` (interiores, ScanNet) y `loftr-outdoor@1` (exteriores, MegaDepth).
- Backends de ejecucion: `portable` y `kernels`.
- Compatibilidad con fp16, `torch.compile` y planes de TensorRT fp16 (previsto para 0.2.1).
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades linguisticas: es un modelo puramente de vision.
- Integracion con pipelines de structure from motion documentada en la libreria.

## Casos de uso

- Reconstruccion 3D y structure from motion: el modelo proporciona correspondencias densas entre pares de imagenes de una misma escena, que alimentan la estimacion de poses de camara y la triangulacion de puntos 3D. La libreria documenta explicitamente el flujo hacia SfM.
- SLAM visual y odometria: el matching denso con confianza por pixel permite estimar el movimiento relativo entre fotogramas consecutivos o cercanos, util en robotica y navegacion.
- Registro de imagenes (image registration) en teledeteccion o imagen medica: alinear dos tomas de la misma zona capturadas con sensores o angulos distintos, usando la variante outdoor o indoor segun el dominio.
- Generacion de pares de correspondencia para entrenar otros matchers: las salidas `keypoints1`, `keypoints2`, `pairs` y `scores` sirven como pseudo-etiquetas para modelos sparse como LightGlue o XFeat.
- Panoramica y stitching de imagenes: estimar la homografia entre imagenes solapadas mediante RANSAC sobre los matches densos, con la ventaja de obtener muchos puntos incluso en regiones de baja textura.
- Inspeccion industrial y comparacion de imagenes: detectar desplazamientos o diferencias entre una imagen de referencia y una captura nueva en entornos controlados (variante indoor para interiores).
- Realidad aumentada y tracking: seguir puntos de una escena entre fotogramas para anclar contenido virtual, aprovechando la precision subpixel del refinamiento.

## Benchmarks y rendimiento

Precision en precision de pose relativa (AUC del mayor error de rotacion y direccion de traslacion, RANSAC con matriz esencial OpenCV, umbral 0,5 px):

| Variante | Dataset | Original fp32 (AUC@5 / @10 / @20) | Portable (AUC@5 / @10 / @20) |
|---|---|---|---|
| `loftr-outdoor` | MegaDepth-1500 | 50,1 / 67,5 / 80,3 | 50,6 / 67,6 / 80,3 |
| `loftr-outdoor` | MegaDepth-1500, cada 10.o par | 53,8 / 71,8 / 83,7 | 52,1 / 71,0 / 83,3 |

Latencia y memoria en matching sintetico 768x1024 (RTX 5060 Ti 16 GB, sm_120):

| Modelo | Tiempo original (ms) | Tiempo portable (ms) | Memoria pico original (MiB alloc/reserved) | Memoria pico portable (MiB alloc/reserved) |
|---|---|---|---|---|
| `loftr-indoor` | 242 | 111 | 1751 / 1910 | 796 / 904 |
| `loftr-outdoor` | 241 | 110 | 1739 / 1870 | 796 / 904 |

Arranque y primera llamada:

| Modelo | Carga original (s) | Carga portable (s) | Primera llamada original (s) | Primera llamada portable (s) |
|---|---|---|---|---|
| `loftr-indoor` | 1,49 | 0,32 | 0,69 | 0,53 |
| `loftr-outdoor` | 0,35 | 0,24 | 0,24 | 0,58 |

`torch.compile` y TensorRT (768x1024):

| Modelo | Portable (ms) | Compile (ms) | Preparacion compile (s) | Memoria pico portable (MiB) | Memoria pico compile (MiB) |
|---|---|---|---|---|---|
| `loftr-indoor` | 111 | 71,0 | 30,2 | 796 / 904 | 634 / 684 |
| `loftr-outdoor` | 110 | 176 | 33,3 | 796 / 904 | 1149 / 1232 |

TensorRT fp16 esta planificado para la version 0.2.1. No se han publicado resultados de benchmarks MMLU, HumanEval o GSM8K (no aplicables a un modelo de vision).

## Requisitos de hardware

- VRAM estimada: alrededor de 0,8 GiB asignados (0,9 GiB reservados) para matching a 768x1024 en fp16 con el backend portable.
- Entradas grandes: hasta 3000x4000 probadas con `loftr-indoor` (2,0 GiB pico asignado, 2,8 reservado) y `loftr-outdoor` (1,9 GiB pico, 2,8 reservado) en RTX 5060 Ti 16 GB.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA; el modelo cabe holgadamente en consumer GPU. Se documentan mediciones en RTX 5060 Ti 16 GB (sm_120).
- Cabe en GPU consumer: si, incluso en tarjetas de gama media con 8 GB o mas para resoluciones moderadas.
- Opciones de despliegue: libreria fastforks con backends `portable` y `kernels`; `torch.compile`; TensorRT fp16 planificado para 0.2.1; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables).
- Latencia: 110-111 ms por par a 768x1024 con backend portable; 71 ms con `torch.compile` en indoor. Throughput no documentado explicitamente.
- Arranque: carga del modelo entre 0,24 y 0,32 s en backend portable.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LoFTR (este repo) | Dense matcher detector-free | no disponible | no aplica | Apache-2.0 (pesos y codigo); datos indoor con restriccion | Hugging Face (`fastforks/loftr`, `kornia/loftr`) |
| LightGlue | Sparse matcher | no disponible | no aplica | no disponible en la informacion | Mencionado en benchmarks de la card |
| XFeat | Sparse matcher | no disponible | no aplica | no disponible en la informacion | Mencionado en benchmarks de la card |
| DeDoDe | Dense matcher | no disponible | no aplica | no disponible en la informacion | Mencionado en benchmarks de la card |

La model card menciona LightGlue, XFeat y DeDoDe como terminos de comparacion en su protocolo de evaluacion, pero no proporciona sus cifras de parametros, contexto ni resultados numericos en la informacion disponible. No se dispone de una comparativa cuantitativa completa entre estos modelos en el material facilitado.

## Limitaciones y advertencias

- Tier experimental: el propio repositorio clasifica el modelo como experimental; no debe asumirse estabilidad de API ni de resultados en produccion sin validacion propia.
- Restricciones de datos de entrenamiento: `loftr-indoor` se entrena con ScanNet, cuyos terminos de uso limitan el uso a investigacion no comercial. Aunque los pesos se declaran Apache-2.0, la procedencia de los datos indoor impone cautela antes de un uso comercial.
- El repositorio no aloja pesos: depende de la disponibilidad de los enlaces externos a `kornia/loftr` y de la verificacion SHA-256; si esos enlaces cambian, la integracion puede romperse.
- Especializacion por dominio: hay variantes separadas indoor y outdoor; usar la equivocada degrada la precision. No hay un modelo unico que cubra ambos dominios de forma optima.
- Dependencia de CUDA y PyTorch: el backend `kernels` y las mediciones estan ligadas a GPU NVIDIA; el soporte en CPU u otros aceleradores no se documenta.
- Riesgo de matches incorrectos: aunque hay umbral de confianza y filtrado por vecinos mutuos, en escenas con oclusiones, texturas repetitivas o cambios de iluminacion pueden aparecer correspondencias erroneas; se recomienda RANSAC posterior (como en el protocolo de evaluacion).
- Sin capacidades linguisticas ni de razonamiento: no es un modelo de texto; no admite tool calling ni agentes.
- TensorRT aun no disponible: la aceleracion por TensorRT fp16 esta planificada para 0.2.1, no operativa en la version documentada.
- Sesgos: no se documentan sesgos especificos en la informacion disponible; al ser un modelo de vision, los sesgos potenciales dependerian de la distribucion de MegaDepth y ScanNet.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/fastforks/loftr
- Pesos originales (kornia/loftr): https://huggingface.co/kornia/loftr
- Codigo de fastforks: https://github.com/kleinicke/fastforks
- Kernels del backend: https://huggingface.co/fastforks/kernels
- Codigo original de LoFTR (zju3dv): https://github.com/zju3dv/LoFTR (commit `df7ca80f9173`)
- Benchmarks y protocolo: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Definicion de variantes (card.toml): https://github.com/kleinicke/fastforks/blob/main/src/fastforks/matching/models/loftr/card.toml
- Licencia original: https://github.com/zju3dv/LoFTR/blob/df7ca80f917334b94cfbe32cc2901e09a80e70a8/LICENSE
- Documentacion de structure from motion: ../sfm.md (referencia relativa en la model card)
