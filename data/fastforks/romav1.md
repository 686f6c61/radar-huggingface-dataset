# fastforks/romav1

## Resumen

RoMa (Robust Matching) es un modelo de emparejamiento denso de características entre dos imágenes tomadas desde cualquier punto de vista. Desarrollado originalmente por Edstedt, Sun, Bökman, Wadenbäck y Felsberg y presentado en CVPR 2024, el modelo combina un ViT-L/14 de DINOv2 congelado con un VGG19-BN para describir ambas imágenes, y produce para cada píxel de la primera imagen su posición correspondiente en la segunda junto con una probabilidad de visibilidad. Esta ficha corresponde al repositorio `fastforks/romav1`, una tarjeta de modelo del proyecto fastforks que no aloja pesos propios sino que descarga y verifica los pesos originales de los autores mediante SHA-256.

El modelo resuelve el problema del emparejamiento denso (dense matching) de imágenes, una tarea fundamental en reconstrucción 3D, structure-from-motion y visión por computador. A diferencia de los emparejadores dispersos como LightGlue, RoMa devuelve un warp denso píxel a píxel, lo que permite reconstruir correspondencias en regiones de textura débil o sin keypoints detectables. La variante `romav1@1` usa los pesos `roma_outdoor.pth` entrenados sobre MegaDepth y el checkpoint `dinov2_vitl14_pretrain.pth` de Meta.

El repositorio está marcado como "experimental" y su licencia es `other` con nombre `see-model-card`, remitiendo a la licencia del repositorio original de RoMa. Los pesos combinados tienen licencia MIT AND Apache-2.0 y permiten uso comercial según la tarjeta, aunque el código original se distribuye como paquete de uso exclusivamente investigador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: DINOv2 ViT-L/14 congelado + VGG19-BN + proceso gaussiano + clasificador transformer + refinadores convolucionales |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | fp32 (original), fp16 (por defecto en portable y kernels) |
| Idiomas soportados | no disponible (modelo de imagen, no lingüístico) |
| Licencia | other / see-model-card (pesos: MIT AND Apache-2.0; código original: MIT, paquete de investigación) |
| Formato de pesos | `.pth` (PyTorch), descargados desde enlaces del autor y verificados por SHA-256 |
| Pipeline | image-to-image (matching) |
| Entrada | Dos imágenes RGB de la misma escena, cualquier H x W >= 32, con padding a múltiplo de 32 |
| Salida | `warp` (posición x,y en píxeles) y `certainty` (probabilidad de visibilidad) |
| Backends | `portable`, `kernels` |
| Librería | fastforks |

## Arquitectura y entrenamiento

RoMa emplea una arquitectura en dos etapas. Primero, un ViT-L/14 de DINOv2 congelado y un VGG19-BN describen ambas imágenes de entrada. Sobre las características gruesas de DINOv2 se ajusta un proceso gaussiano y se aplica un clasificador transformer que produce un warp grueso. Después, refinadores convolucionales que operan sobre correlación local en strides 16, 8 y 4 afinan el warp desde stride 16 hasta 1, primero a una resolución gruesa y luego a una fina. La salida final es, para cada píxel de la primera imagen, su posición en la segunda y una certeza de visibilidad.

El checkpoint `roma_outdoor` se entrenó sobre MegaDepth, un conjunto de fotografías de Internet con profundidad obtenida por SfM/MVS. El ViT-L/14 de DINOv2 se mantiene congelado y fue preentrenado por Meta sobre LVD-142M, un dataset no liberado públicamente. La tarjeta no detalla el número de tokens de entrenamiento ni si se aplicaron fases de RLHF o DPO (no aplicables en un modelo de visión). La innovación principal es el uso de un proceso gaussiano sobre características DINOv2 para obtener un warp denso robusto, combinado con refinamiento convolucional multi-escala.

## Capacidades

- Emparejamiento denso de imágenes: devuelve para cada píxel de la primera imagen su posición en la segunda y una certeza de visibilidad.
- Robusto a cambios de punto de vista, escala y perspectiva, gracias al backbone DINOv2 y al proceso gaussiano.
- Manejo de imágenes de resolución arbitraria (H x W >= 32, con padding a múltiplo de 32); probado hasta 3000x4000 en fp16 con 1,9 GiB de memoria pico.
- Salida densa que cubre regiones sin keypoints detectables, a diferencia de emparejadores dispersos como LightGlue.
- Integración con pipelines de structure-from-motion para reconstruir poses de cámara a partir de una carpeta de imágenes.
- Dos backends de ejecución: `portable` (PyTorch) y `kernels` (kernels optimizados).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades lingüísticas: es un modelo puramente visual.

## Casos de uso

- Reconstrucción 3D y structure-from-motion: el warp denso píxel a píxel permite estimar poses de cámara y nubes de puntos a partir de colecciones de imágenes, integrándose en pipelines SfM como el documentado en fastforks.
- Registro de imágenes médicas o satelitales: al devolver correspondencias densas con certeza, permite alinear pares de imágenes con cambios de perspectiva o iluminación donde los métodos dispersos fallan.
- SLAM visual denso: la salida de warp y certeza se puede usar para estimar movimiento entre fotogramas consecutivos en robótica y vehículos autónomos.
- Aumento de realidad y composición de imágenes: el emparejamiento denso facilita la transferencia de píxeles entre vistas para superponer elementos virtuales con coherencia geométrica.
- Evaluación comparativa de emparejadores: sirve como referencia densa frente a LightGlue, LoFTR, DeDoDe o XFeat en benchmarks como MegaDepth-1500.
- Preprocesado para modelos de profundidad o segmentación multi-vista: las correspondencias densas permiten propagar anotaciones entre vistas de una misma escena.
- Investigación en visión por computador: al ser un paquete de investigación con paridad numérica verificada frente al código original, es adecuado para reproducir experimentos de emparejamiento denso.

## Benchmarks y rendimiento

Precisión en MegaDepth-1500 (AUC de pose relativa, umbrales @5 / @10 / @20 grados):

| Variante | Dataset | original fp32 | original fp16 | portable | kernels |
|---|---|---|---|---|---|
| `romav1` | MegaDepth-1500 | no disponible | 62,6 / 76,6 / 86,3 | 62,6 / 76,6 / 86,4 | 62,4 / 76,4 / 86,2 |
| `romav1` | MegaDepth-1500, cada 10º par | 67,6 / 80,1 / 88,2 | 66,4 / 79,5 / 88,1 | 68,2 / 80,8 / 88,8 | 67,5 / 80,0 / 88,2 |

Velocidad y memoria en matching sintético 768x1024 (RTX 5060 Ti 16 GB):

| Modelo | Tiempo original fp32 | original | portable | kernels | Aceleración kernels vs original | vs portable | Memoria pico (MiB) original | portable | kernels |
|---|---|---|---|---|---|---|---|---|---|
| `romav1` | – | 386 ms | 376 ms | 356 ms | 1,1x | 1,1x | 3887 / 4094 | 1720 / 1820 | 1720 / 1860 |

Arranque y primera llamada:

| Modelo | Carga (s) original | portable | kernels | Primera llamada (s) original | portable | kernels |
|---|---|---|---|---|---|---|
| `romav1` | 6,28 | 1,09 | 1,96 | 2,57 | 0,83 | 0,86 |

Paridad numérica con el código original: en CPU float32, diferencia máxima absoluta <= 4,3e-05; en GPU float16, diferencia media absoluta <= 0,00079 y p99 <= 0,0042.

## Requisitos de hardware

- VRAM estimada: 1,7 GiB de memoria pico asignada en fp16 para 768x1024 con los backends portable y kernels; 3,9 GiB en el original fp32.
- Probado hasta 3000x4000 en fp16 en una RTX 5060 Ti de 16 GB con 1,9 GiB de memoria pico asignada y 2,2 GiB reservada.
- Cabe en GPUs de consumo: RTX 5060 Ti 16 GB es la referencia de las pruebas; por el bajo consumo de memoria, también cabe en GPUs con 8 GB o menos para resoluciones moderadas.
- GPUs recomendadas: cualquier GPU NVIDIA con soporte CUDA; las pruebas se hicieron en sm_120 (RTX 5060 Ti).
- Opciones de despliegue: librería fastforks con backends `portable` (PyTorch) y `kernels`; se menciona soporte planificado de TensorRT fp16 para la versión 0.2.1 y compilación con torch.compile diferida por tiempos de build superiores a 5 minutos.
- Latencia: 356-386 ms por par a 768x1024 en fp16; primera llamada en torno a 0,83-0,86 s tras la carga del modelo.
- Memoria de carga: 1,09 s (portable) y 1,96 s (kernels) frente a 6,28 s del código original.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento MegaDepth-1500 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| RoMa (`romav1`) | Denso | no disponible (ViT-L/14 + VGG19-BN) | no aplica | AUC@5 62,6 (fp16) | MIT AND Apache-2.0 (pesos) | Hugging Face vía fastforks |
| LightGlue | Disperso | no disponible | no aplica | no disponible en esta ficha | no disponible | Repositorio original |
| LoFTR | Denso | no disponible | no aplica | no disponible en esta ficha | no disponible | Repositorio original |
| DeDoDe | Disperso | no disponible | no aplica | no disponible en esta ficha | no disponible | Repositorio original |
| XFeat | Disperso | no disponible | no aplica | no disponible en esta ficha | no disponible | Repositorio original |

La tarjeta menciona LightGlue, LoFTR, DeDoDe y XFeat como emparejadores de referencia empleados en el protocolo de evaluación, pero no publica sus cifras comparativas en esta ficha.

## Limitaciones y advertencias

- Modelo de visión: no procesa texto ni mantiene conversaciones; no dispone de capacidades lingüísticas, tool calling ni razonamiento multi-paso.
- Estado experimental: la tarjeta clasifica la variante como "experimental", por lo que no se recomienda para producción sin validación adicional.
- Licencia ambigua: la licencia del repositorio es `other` con nombre `see-model-card`; el código original se distribuye como paquete de uso exclusivamente investigador, por lo que conviene revisar la licencia de RoMa antes de cualquier uso comercial. Los pesos combinados (MIT AND Apache-2.0) sí permiten uso comercial según la tarjeta.
- Dependencia de pesos externos: el repositorio no aloja pesos; fastforks los descarga desde enlaces del autor y los verifica por SHA-256, lo que introduce una dependencia de disponibilidad de esos enlaces.
- Entrenado sobre MegaDepth (fotografías de Internet con profundidad SfM/MVS): puede degradarse en dominios muy distintos (imágenes médicas, satelitales, microscopía) sin ajuste fino.
- El backbone DINOv2 se preentrenó sobre LVD-142M, un dataset no liberado, lo que limita la reproducibilidad completa del preentrenamiento.
- Resolución de entrada limitada a múltiplos de 32 tras padding; imágenes muy grandes incrementan el consumo de memoria de forma proporcional al número de píxeles.
- Sin datos publicados sobre sesgos, alucinación (no aplica en sentido lingüístico) ni comportamiento en idiomas, al ser un modelo visual.
- No se han publicado resultados de benchmarks comparativos frente a LightGlue, LoFTR, DeDoDe o XFeat en la información disponible; las cifras de la tabla de precisión son solo de RoMa en sus distintas configuraciones.

## Enlaces

- Hugging Face: https://huggingface.co/fastforks/romav1
- Repositorio fastforks: https://github.com/kleinicke/fastforks
- Kernels para el backend `kernels`: https://huggingface.co/fastforks/kernels
- Código original de RoMa: https://github.com/Parskatt/RoMa (commit `77f8d6880352`)
- Licencia original de RoMa: https://github.com/Parskatt/RoMa/blob/77f8d68803526dcddfd9b7a46bc76125bdc25f15/README.md#license
- Pesos `roma_outdoor.pth`: https://github.com/Parskatt/storage/releases/download/roma/roma_outdoor.pth
- Pesos `dinov2_vitl14_pretrain.pth`: https://dl.fbaipublicfiles.com/dinov2/dinov2_vitl14/dinov2_vitl14_pretrain.pth
- Documentación de benchmarks de fastforks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Tarjeta de configuración `card.toml`: https://github.com/kleinicke/fastforks/blob/main/src/fastforks/matching/models/romav1/card.toml
- Documentación de structure-from-motion en fastforks: ../sfm.md
- Paper original: Edstedt, Sun, Bökman, Wadenbäck, Felsberg, "RoMa: Robust Dense Feature Matching", CVPR 2024 (enlace no disponible en la información proporcionada).
