# fastforks/depthsplat

## Resumen

DepthSplat es un modelo de reconstruccion 3D feed-forward que, a partir de varias imagenes de una misma escena con poses y calibracion conocidas (o desconocidas en el caso multivista no posado), predice un mapa de profundidad por vista y un conjunto de gaussianas 3D (una por pixel) en el sistema de coordenadas del mundo. Combina una cost volume multivista construida con un transformer UniMatch y una U-Net 2D, fusionada con una rama monoculo basada en un ViT-S de DINOv2. El resultado es una representacion 3D Gaussian Splatting directamente consumible como fichero PLY, sin necesidad de un renderizador en el forward pass.

El modelo lo desarrollan Xu et al. (paper de 2025) y esta empaquetado en este repositorio por `fastforks`, que no aloja pesos: descarga los del autor original (`haofeixu/depthsplat`) y los verifica contra un SHA-256. La unica variante ofrecida es `depthsplat-small-re10k@1`, entrenada sobre RealEstate10K a 256x256 con dos vistas, con pesos MIT y uso comercial permitido.

Es relevante porque ofrece reconstruccion densa multivista en un solo paso, con latencias de unos 112-126 ms por inferencia a 336x518 en una GPU de consumo (RTX 5060 Ti 16 GB), y porque la variante Small evita las dependencias CC-BY-NC de los checkpoints Base y Large, que no se distribuyen en este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: cost volume multivista con UniMatch (transformer) + U-Net 2D, fusionada con rama monoculo DINOv2 ViT-S; DPT feature upsampler y Gaussian head |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de multiples imagenes) |
| Tipos de cuantizacion | fp32, fp16 (soporte de TensorRT fp16); no se documentan otras |
| Idiomas soportados | no disponible |
| Licencia | MIT (codigo y pesos de la variante Small); datos de entrenamiento RealEstate10K con uso de investigacion |
| Formato de pesos | `.pth` (checkpoint PyTorch); salida de gaussianas en `.ply` |

## Arquitectura y entrenamiento

El modelo construye una cost volume multivista a partir de las vistas de entrada usando un transformer UniMatch y una U-Net 2D, y la fusiona con una prediccion monoculo obtenida de un ViT-S de DINOv2. Un upsampler de caracteristicas tipo DPT refina la representacion y una Gaussian head predice, por cada pixel, opacidad, escala, rotacion y coeficientes de armónicos esfericos de grado 2, generando una gaussiana 3D en el marco del mundo indicado. La salida incluye profundidad, confianza y gaussianas. El forward pass no incluye renderizador.

El checkpoint `depthsplat-small-re10k` se entrena sobre RealEstate10K (trayectorias de camara de videos inmobiliarios de YouTube, con poses derivadas de ORB-SLAM) a resolucion 256x256 y con dos vistas. La rama monoculo se inicializa desde Depth Anything V2 Small (Apache-2.0). No se detalla en la informacion disponible el numero de tokens de entrenamiento ni si hubo RLHF/DPO; el modelo es puramente supervisado por profundidad y no es un modelo de lenguaje.

## Capacidades

- Reconstruccion 3D densa multivista a partir de imagenes posadas y calibradas.
- Prediccion de mapas de profundidad por vista con mapa de confianza asociado.
- Prediccion de gaussianas 3D (opacidad, escala, rotacion, SH de grado 2) en el marco del mundo, exportables a `.ply`.
- Estimacion de poses de camara y puntos 3D en entradas no posadas (multivista no posado).
- Procesamiento de entradas de tamano arbitrario H x W >= 1, con redimensionado o padding interno.
- Backends `portable` y `kernels` (kernels CUDA propios).
- Aceleracion con `torch.compile` y TensorRT fp16.
- No soporta tool calling, agentes, texto ni razonamiento; es un modelo puramente visual/geometrico.

## Casos de uso

- Digitalizacion de inmuebles: dado un conjunto de fotos de una vivienda con poses conocidas, generar una nube de gaussianas exportable a `.ply` para recorridos 3D interactivos, aprovechando el entrenamiento especifico sobre RealEstate10K.
- Reconstruccion de escenas para fotogrametria de bajo coste: procesar tomas multivista de objetos o interiores en una RTX 5060 Ti y obtener profundidad densa mas gaussianas en menos de 150 ms por inferencia.
- Preprocesado para pipelines de NeRF o Gaussian Splatting: usar las gaussianas predichas como inicializacion o como supervision densa antes de un entrenamiento por escena.
- Robotica y navegacion: estimar profundidad y estructura 3D por vista a partir de un rig estereo o multivista, con mapa de confianza para filtrar regiones poco fiables.
- Aumento de datos sinteticos: generar pares imagen-profundidad y escenas gaussianas para entrenar otros modelos de vision, dado el bajo coste por inferencia.
- Inspeccion y modelado de interiores: reconstruir escenas de escaneos DTU o capturas propias y medir error metrico (MAE en mm) sobre la profundidad estimada para validar la calidad del pipeline.
- Prototipado en investigacion: reproducible con hashes SHA-256 verificados y paridad numerica documentada frente al codigo original (max |diff| <= 1.6e-05 en CPU fp32).

## Benchmarks y rendimiento

Precision en DTU (scans 1, 9, 24, 33, 75; vista 24 con 7 fuentes; recortes 640x512; AbsRel / delta1 % / MAE mm):

| Variante | Original fp32 | Original fp16 | Portable | Kernels |
|---|---|---|---|---|
| `depthsplat-small-re10k` | 0.0992 / 98.72 / 66.52 | 0.0974 / 98.69 / 65.37 | 0.0974 / 98.70 / 65.36 | 0.0974 / 98.69 / 65.34 |

Rendimiento y memoria (RTX 5060 Ti 16 GB, sm_120, entrada 336x518):

| Metrica | Original fp32 | Portable | Kernels | torch.compile | TensorRT fp16 |
|---|---|---|---|---|---|
| Tiempo (ms) | 126 | 119 | 112 | 82.2 | 86.4 |
| Memoria pico asignada / reservada (MiB) | 5694 / 5892 | 5432 / 5606 | 5434 / 5606 | 5432 / 5526 | 3148 / 3194 |
| Carga (s) | 1.83 | 0.22 | 1.47 | no disponible | no disponible |
| Primera llamada (s) | 2.97 | 0.97 | 0.71 | no disponible | no disponible |

Preparacion: `torch.compile` requiere 80.0 s en frio; ONNX + engine de TensorRT, 224 s. Entrada maxima probada: 3000x4000 con 7.4 GiB de pico asignado y 8.6 GiB reservados.

## Requisitos de hardware

- VRAM estimada: unos 5.4-5.9 GiB de pico a 336x518 en fp16; hasta 8.6 GiB reservados con entradas de 3000x4000.
- GPU recomendadas: RTX 5060 Ti 16 GB (medida de referencia), A100, H100 y RTX 4090 por margen de memoria; cualquier GPU con al menos 8-10 GiB y soporte CUDA.
- Cabe en GPU de consumo: si, confirmado en RTX 5060 Ti 16 GB.
- Despliegue: paquete `fastforks` con backends `portable` y `kernels`; exportacion a ONNX y TensorRT fp16; `torch.compile` disponible. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 112-126 ms por inferencia a 336x518; 82.2 ms con `torch.compile`; 86.4 ms con TensorRT fp16. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Precision DTU (AbsRel) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DepthSplat Small (este) | no disponible | H x W >= 1, multiples vistas | 0.0974 (fp16) | MIT (pesos Small) | Hugging Face (pesos del autor) |
| DepthSplat Base / Large | no disponible | no disponible | no disponible | CC-BY-NC-4.0 (heredada de Depth Anything V2 Base/Large) | No ofrecidos en este repo |
| PatchMatchNet | no disponible | MVS calibrado, rango 425-935 mm | no disponible en esta ficha | no disponible | no disponible |
| MVSAnywhere | no disponible | MVS con rango propio segun baselines | no disponible en esta ficha | no disponible | no disponible |

## Limitaciones y advertencias

- Requiere poses y calibracion para el modo MVS estandar; el modo no posado es experimental.
- El forward pass no incluye renderizador: hay que renderizar las gaussianas con una herramienta externa.
- Solo se distribuye el checkpoint Small; Base y Large no estan disponibles por sus licencias CC-BY-NC.
- Los datos de entrenamiento (RealEstate10K) son de uso de investigacion segun su publicacion; conviene revisar terminos antes de uso comercial a gran escala.
- Riesgo de alucinacion geometrica en regiones oclusivas o con poca cobertura multivista; usar el mapa de confianza para filtrar.
- Precision limitada a 256x256 de entrenamiento; entradas mayores se redimensionan o rellenan internamente.
- Sesgos de dominio: entrenado en videos inmobiliarios, puede degradarse en escenas con iluminacion o materiales muy distintos.
- No es un modelo de lenguaje: no soporta texto, tool calling ni agentes.
- Tier experimental segun el autor del empaquetado; no se recomienda como unico componente en produccion critica sin validacion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fastforks/depthsplat
- Pesos del autor: https://huggingface.co/haofeixu/depthsplat
- Codigo de fastforks: https://github.com/kleinicke/fastforks
- Kernels: https://huggingface.co/fastforks/kernels
- Codigo original (commit `2dad25a`): https://github.com/cvg/depthsplat
- Card de variantes: https://github.com/kleinicke/fastforks/blob/main/src/fastforks/multiview/models/depthsplat/card.toml
- Benchmarks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Licencia original: https://github.com/cvg/depthsplat/blob/2dad25a7b9ba7c5537aba08463ef88d8511a06be/LICENSE
- Model zoo original: https://github.com/cvg/depthsplat/blob/2dad25a7b9ba7c5537aba08463ef88d8511a06be/MODEL_ZOO.md
