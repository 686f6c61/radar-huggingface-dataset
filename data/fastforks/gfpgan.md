# fastforks/gfpgan

## Resumen

GFPGAN (Generative Facial Prior GAN) es un modelo de restauracion de rostros ciegos (blind face restoration) publicado originalmente por Wang et al. en CVPR 2021 y desarrollado por Tencent ARC. El repositorio `fastforks/gfpgan` es una model card de integracion: no aloja pesos propios, sino que documenta como el paquete `fastforks` descarga los pesos oficiales de los autores, los verifica mediante SHA-256 y los ejecuta con dos backends (`portable` y `kernels`).

El modelo combina un encoder U-Net cuyas caracteristicas modulan espacialmente (spatial feature transform) un generador de rostros StyleGAN2 preentrenado, usando ese prior facial generativo para reconstruir caras degradadas por desenfoque, submuestreo, ruido y compresion JPEG. La entrada es un recorte de rostro alineado de 512 x 512 pixeles (alineacion FFHQ); la deteccion, el alineamiento y el pegado del rostro en la imagen original no forman parte del modelo.

Es relevante para desarrolladores porque ofrece una integracion reproducible y medida de un modelo clasico de restauracion, con paridad numerica verificada frente al codigo original y benchmarks de latencia y memoria en una GPU consumer (RTX 5060 Ti 16 GB). La variante documentada es `gfpgan-v1.4@1`, con licencia Apache-2.0 y uso comercial permitido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net encoder + StyleGAN2 (generative facial prior, spatial feature transform) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | fp16 (por defecto en GPU), fp32; no se documentan cuantizaciones enteras |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | Apache-2.0 (codigo y pesos); uso comercial permitido |
| Formato de pesos | `.pth` (PyTorch, `GFPGANv1.4.pth`); no se alojan en el repo, se descargan de los releases de TencentARC |

## Arquitectura y entrenamiento

GFPGAN v1.4 emplea un encoder U-Net que extrae caracteristicas del rostro degradado y las inyecta en un generador StyleGAN2 preentrenado mediante spatial feature transform, de modo que el prior facial generativo guia la reconstruccion de detalles plausibles. El modelo opera sobre recortes alineados de 512 x 512 (alineacion FFHQ) y produce una salida reescalada por `model.scale` respecto a la entrada. La entrada admite cualquier resolucion H x W >= 512, con padding a multiplo de 32, y el parametro `tile=` permite procesar imagenes grandes por teselas solapadas al estilo de ComfyUI.

El entrenamiento se realizo sobre Flickr-Faces-HQ (FFHQ, 70 000 rostros redimensionados a 512 x 512) con degradaciones sinteticas de desenfoque, submuestreo, ruido y JPEG; el prior StyleGAN2 tambien se entreno sobre FFHQ. La model card no documenta el numero de tokens ni detalles de RLHF/DPO (no aplica a un modelo de restauracion). La innovacion tecnica principal es el uso del prior generativo facial para restaurar identidad y textura en rostros muy degradados, en lugar de depender solo de una perdida de reconstruccion.

## Capacidades

- Restauracion ciega de rostros: recupera detalle e identidad a partir de recortes degradados.
- Superresolucion y upscaling de imagen con factor `model.scale`.
- Restauracion de imagen en general (pipeline `image-to-image`).
- Procesamiento por teselas (`tile=`) para imagenes de gran tamano.
- Ejecucion en dos backends: `portable` (PyTorch) y `kernels` (kernels CUDA propios, `cudnn_hacc`).
- Verificacion de integridad de pesos mediante SHA-256.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo puramente visual.

## Casos de uso

- Restauracion de fotos antiguas o escaneadas: se recorta el rostro alineado a 512 x 512, se pasa por el modelo y se recompone en la imagen original; el prior StyleGAN2 recupera texturas faciales perdidas por el escaneo.
- Mejora de retratos de baja resolucion en pipelines de e-commerce o catalogos: el modelo reescala la imagen por `model.scale` y reduce el ruido y el artefacto JPEG de fotos de producto.
- Preprocesado para reconocimiento facial: restaurar rostros degradados antes de pasarlos a un sistema de verificacion de identidad, aprovechando que el modelo reconstruye rasgos plausibles.
- Restauracion de fotogramas en video de vigilancia: aplicar el modelo por fotograma con `tile=512` para rostros de baja calidad, teniendo en cuenta la latencia de ~18-22 ms por recorte en GPU consumer.
- Limpieza de datasets de imagenes: restaurar y homogeneizar rostros de un corpus antes de entrenar otros modelos, con procesamiento por lotes y verificacion de integridad de pesos.
- Integracion en flujos de edicion tipo ComfyUI: el modo por teselas reproduce el comportamiento de ComfyUI, lo que facilita incorporar la restauracion como nodo en pipelines de generacion de imagen.
- Despliegue en produccion con backend `kernels`: usar los kernels CUDA propios para reducir la latencia (~18,0 ms frente a 21,9 ms del codigo original) cuando la GPU objetivo tenga kernel precompilado.

## Benchmarks y rendimiento

Restauracion sintetica, 512 x 512, en RTX 5060 Ti 16 GB (sm_120), fp16:

| Modelo | Tiempo original (ms) | Portable (ms) | Kernels (ms) | Aceleracion kernels vs original | Memoria pico asignada/reservada (MiB) portable | Memoria pico kernels (MiB) |
|---|---|---|---|---|---|---|
| `gfpgan-v1.4` | 21,9 | 21,2 | 18,0 | 1,2x | 505 / 528 | 473 / 530 |

Arranque y primera llamada:

| Modelo | Carga original (s) | Carga portable (s) | Carga kernels (s) | Primera llamada original (s) | Primera llamada portable (s) | Primera llamada kernels (s) |
|---|---|---|---|---|---|---|
| `gfpgan-v1.4` | 0,86 | 1,04 | 0,78 | 0,33 | 0,25 | 0,07 |

`torch.compile` y TensorRT:

| Modelo | Entrada | Portable (ms) | Compile (ms) | TensorRT fp16 (ms) | Kernels (ms) | Compilacion en frio (s) | Build ONNX + engine (s) |
|---|---|---|---|---|---|---|---|
| `gfpgan-v1.4` | 512x512 | 21,2 | 12,5 | 15,8 | 18,0 | 27,3 | 115 |

Paridad con el codigo original: en CPU y float32, diferencia maxima absoluta <= 6,3e-06; en GPU y float16 (por defecto), error medio absoluto <= 0,00051 y p99 <= 0,0022 sobre la imagen de salida.

## Requisitos de hardware

- VRAM estimada: ~0,5 GiB de memoria pico asignada en fp16 para 512 x 512 (0,6 GiB reservada); el backend `kernels` baja a ~473 MiB asignados.
- GPU recomendadas: cualquier GPU NVIDIA con soporte para el backend elegido; los benchmarks se hicieron en RTX 5060 Ti 16 GB (sm_120). El backend `kernels` requiere un kernel precompilado para la arquitectura de la GPU y un driver NVIDIA reciente.
- Cabe en GPU consumer: si, con menos de 1 GiB de VRAM para recortes de 512 x 512; imagenes mayores requieren `tile=` para acotar memoria.
- Opciones de despliegue: paquete `fastforks` (`pip install fastforks`), con `mode="portable"` o `mode="kernels"`; tambien `torch.compile` (12,5 ms) y exportacion a TensorRT fp16 (15,8 ms, con 115 s de build).
- Latencia y throughput: ~18-22 ms por recorte de 512 x 512 en la GPU de referencia; primera llamada entre 0,07 y 0,33 s segun backend.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| GFPGAN v1.4 (este) | U-Net + StyleGAN2 prior | recorte alineado 512 x 512 | Apache-2.0 | pesos en releases de TencentARC; integracion en `fastforks` | Paridad verificada, backends portable/kernels |
| CodeFormer | Transformer + prior de codigo | recorte alineado | no disponible en esta ficha | no disponible en esta ficha | Alternativa de restauracion facial; no se aportan datos comparativos |
| RestoreFormer | Transformer | recorte alineado | no disponible en esta ficha | no disponible en esta ficha | Alternativa de restauracion facial; no se aportan datos comparativos |

No se dispone de datos de benchmarks comparativos con estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo solo restaura rostros alineados a 512 x 512; la deteccion, alineacion y recompostura del rostro en la imagen original corren a cargo del usuario.
- Riesgo de alucinacion visual: el prior generativo puede inventar detalles faciales no presentes en la imagen original, alterando la identidad en casos de degradacion severa.
- Sesgos conocidos: entrenado sobre FFHQ, con posibles sesgos de demografia, edad y estetica del dataset; no se documentan mitigaciones.
- No es un modelo linguistico: no soporta texto, tool calling, agentes ni capacidades multilingues.
- El backend `kernels` requiere un kernel precompilado para la arquitectura de GPU y un driver NVIDIA reciente; si no existe, lanza `BackendUnavailableError` sin fallback silencioso.
- La model card advierte de que el paquete original es de uso de investigacion y recomienda revisar las cadenas de licencia del codigo original antes de otros usos; los pesos se declaran Apache-2.0 con uso comercial permitido.
- El repositorio no aloja pesos: la disponibilidad depende de los releases de TencentARC y de la verificacion SHA-256.
- Tier experimental segun la propia model card.

## Enlaces

- Model card en Hugging Face: https://huggingface.co/fastforks/gfpgan
- Codigo de integracion fastforks: https://github.com/kleinicke/fastforks
- Kernels del backend: https://huggingface.co/fastforks/kernels
- Codigo original (TencentARC/GFPGAN): https://github.com/TencentARC/GFPGAN
- Commit fijado del codigo original: https://github.com/TencentARC/GFPGAN/tree/7552a7791caad982045a7bbe5634bbf1cd5c8679
- Pesos GFPGANv1.4: https://github.com/TencentARC/GFPGAN/releases/download/v1.3.0/GFPGANv1.4.pth
- Release de pesos v1.3.0: https://github.com/TencentARC/GFPGAN/releases/tag/v1.3.0
- Licencia original: https://github.com/TencentARC/GFPGAN/blob/7552a7791caad982045a7bbe5634bbf1cd5c8679/LICENSE
- Documentacion de benchmarks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
