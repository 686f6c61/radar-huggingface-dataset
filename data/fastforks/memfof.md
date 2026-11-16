# fastforks/memfof

## Resumen

MEMFOF (Bargatin et al. 2025) es una red neuronal para estimación de flujo óptico multi-frame con eficiencia de memoria, publicada por el grupo MSU Video Group. A diferencia de los estimadores de flujo clásicos de dos frames, MEMFOF procesa tres frames simultáneamente y predice de una sola pasada el flujo hacia atrás y hacia delante del frame central. El repositorio `fastforks/memfof` es únicamente una model card de integración: no aloja pesos, sino que documenta cómo descargar, verificar (SHA-256) y ejecutar los pesos originales de los autores mediante la librería `fastforks`, con backends `portable` y `kernels`.

La arquitectura sigue el esquema RAFT a resolución 1/16: un codificador de contexto ResNet34 aplicado a los tres frames, atención GMA sobre el contexto, características de 1024 canales, una pirámide de correlación all-pairs hacia el frame anterior y el siguiente, un bloque de actualización ConvNeXt y un upsampling convexo de factor 16. El modelo está pensado para tareas de motion estimation en vídeo: interpolación de frames, estabilización, análisis de movimiento y preprocesado para pipelines de visión por computador.

Es relevante ahora porque ofrece resultados de estado del arte en benchmarks de flujo óptico (Sintel test EPE 0.963 clean, KITTI 2015 test Fl-all 2.94 %, Spring test 1px 3.289 %) con un coste de memoria contenido y variantes específicas por dominio (Tartan, KITTI, Sintel, Spring), todo bajo licencia BSD-3-Clause que permite uso comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RAFT-style con encoder de contexto ResNet34, atención GMA, pirámide de correlación all-pairs, bloque de actualización ConvNeXt y upsampling convexo 16x; multi-frame (3 frames) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de 2 imágenes RGB, resolución mínima 128 o 256 px según variante, múltiplo de 16) |
| Tipos de cuantizacion | fp16 (probado); fp32 en la implementación original; no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (modelo de visión, no lingüístico) |
| Licencia | BSD-3-Clause (código y pesos; uso comercial permitido) |
| Formato de pesos | safetensors (pesos de los autores, no alojados en este repo) |

## Arquitectura y entrenamiento

MEMFOF es un transformer/CNN híbrido de estimación de flujo óptico basado en el paradigma RAFT. Opera a resolución 1/16 sobre tres frames consecutivos: un encoder de contexto ResNet34 extrae características de los tres frames, se aplica atención GMA sobre el contexto, se construyen features de 1024 canales y una pirámide de correlación all-pairs contra el frame previo y el siguiente, y un bloque de actualización ConvNeXt refina iterativamente el flujo, cerrando con un upsampling convexo de factor 16. La innovación principal es la predicción conjunta del flujo backward y forward del frame central en una sola pasada, lo que reduce el coste frente a ejecutar dos estimadores de dos frames.

El entrenamiento sigue el esquema del upstream `msu-video-group/memfof`. Los datos incluyen TartanAir, Freiburg SceneFlow (FlyingThings3D, Driving, Monkaa), MPI Sintel optical flow, KITTI stereo / optical flow 2012 / 2015 y HCI HD1K. El currículo es secuencial: primero TartanAir, luego FlyingThings3D y finalmente una mezcla de FlyingThings3D, Sintel, KITTI 2015 y HD1K (configuración TSKH). Se publican cuatro checkpoints: `memfof` (Tartan-T-TSKH), `memfof-kitti`, `memfof-sintel` y `memfof-spring`, cada uno ajustado para su dominio. No se documenta en la información disponible el uso de RLHF/DPO (no aplica a este tipo de modelo).

## Capacidades

- Estimación de flujo óptico denso: devuelve por píxel el movimiento (dx, dy en píxeles) del primer frame al segundo.
- Predicción multi-frame: procesa tres frames y entrega simultáneamente flujo forward y backward del frame central.
- Entrada de dos imágenes RGB consecutivas: internamente se construye la terna (image1, image1, image2) y se devuelve el flujo forward, replicando el comportamiento del upstream.
- Resolución flexible: cualquier H x W por encima del mínimo de la variante (256 px para `memfof` y `memfof-spring`; 128 px para `memfof-kitti` y `memfof-sintel`), con padding a múltiplo de 16.
- Variantes por dominio: checkpoints especializados para Tartan, KITTI, Sintel y Spring.
- Backends de ejecución: `portable` (PyTorch) y `kernels` (kernels CUDA optimizados), con verificación de integridad SHA-256 de los pesos.
- Compatibilidad con `torch.compile` y exportación a ONNX/TensorRT fp16 (medido en la model card).
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades lingüísticas: es un modelo puramente visual.

## Casos de uso

- Interpolación de frames en postproducción de vídeo: el flujo forward/backward del frame central permite sintetizar frames intermedios a alta tasa de refresco; la variante `memfof-spring` está ajustada a escenas sintéticas de alta resolución (probada hasta 1988x2880).
- Estabilización de vídeo: el flujo denso por píxel alimenta el cálculo de trayectorias y la compensación de movimiento entre frames consecutivos, con la ventaja de obtener a la vez el flujo inverso para warping bidireccional.
- Análisis de movimiento en vídeo de vigilancia: estimación de dirección y magnitud del movimiento de personas y vehículos en resoluciones tipo 1080x1920 (433 ms por par en backend portable, 427 ms con kernels en RTX 5060 Ti).
- Preprocesado para pipelines de visión (detección, segmentación, tracking): el flujo óptico sirve como señal auxiliar para propagar máscaras o cajas entre frames, reduciendo el coste de re-inferencia.
- Automoción y robótica: la variante `memfof-kitti` está ajustada al dominio de conducción (KITTI), útil para odometría visual y detección de movimiento de obstáculos en escenas de tráfico.
- Evaluación de modelos de flujo óptico: los checkpoints Sintel y KITTI permiten reproducir los resultados publicados (Sintel test EPE 0.963 clean, KITTI 2015 test Fl-all 2.94 %) y servir de baseline en investigación.
- Despliegue en producción con TensorRT: la exportación a ONNX + engine fp16 reduce la latencia a 160 ms en 1080x1920 (frente a 433 ms en portable), adecuada para procesos por lotes o tiempo casi real.

## Benchmarks y rendimiento

Resultados publicados por los autores (paper, tres frames por predicción, checkpoints fine-tuned):

| Benchmark | Metrica | Valor |
|---|---|---|
| Spring test | 1px | 3.289 % |
| Sintel test | EPE (clean) | 0.963 |
| KITTI 2015 test | Fl-all | 2.94 % |

Rendimiento medido en la model card (RTX 5060 Ti 16 GB, fp16):

| Modelo | Entrada | Original (ms) | Portable (ms) | Kernels (ms) | Memoria pico portable (MiB alloc/reserved) | Memoria pico kernels (MiB alloc/reserved) |
|---|---|---|---|---|---|---|
| `memfof` | 1080x1920 | 531 | 433 | 427 | 1911 / 2196 | 1301 / 1418 |
| `memfof-kitti` | 375x1242 | 927 | 386 | 380 | 1619 / 1856 | 1137 / 1218 |
| `memfof-sintel` | 375x1242 | 894 | no disponible | no disponible | 1968 / 2176 | no disponible |
| `memfof-spring` | 1080x1920 | 1035 | 433 | no disponible | 1900 / 2196 | no disponible |

Optimizaciones adicionales en `memfof` a 1080x1920: `torch.compile` 291 ms, TensorRT fp16 160 ms, kernels 427 ms. Memoria pico con kernels: 1301 MiB asignados / 1418 reservados; con TensorRT no se detalla en el fragmento disponible.

## Requisitos de hardware

- VRAM estimada: desde ~1,3 GiB (kernels, `memfof` a 1080x1920) hasta ~9 GiB en el peor caso documentado (`memfof` y `memfof-spring` a 1988x2880 en portable fp16, 9.0 GiB asignados / 10.6 reservados).
- GPU recomendadas: cualquier GPU CUDA con al menos 8-12 GB para resoluciones altas; RTX 5060 Ti 16 GB es la referencia medida. Para 1988x2880 se recomienda 16 GB o más.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y RTX 5060 Ti 16 GB para resoluciones típicas; para 4K+ conviene 16 GB.
- Opciones de despliegue: PyTorch (backend `portable`), kernels CUDA propios (`fastforks/kernels`), `torch.compile`, ONNX Runtime y TensorRT fp16. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de visión).
- Latencia y throughput: 160 ms por par a 1080x1920 con TensorRT fp16; 380-433 ms en portable/kernels. Carga del modelo entre 0,21 y 2,59 s según variante y backend; primera llamada entre 0,29 y 1,29 s.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto de frames | Parametros | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MEMFOF (este) | RAFT multi-frame, 3 frames | 3 frames, flujo bidireccional | no disponible | BSD-3-Clause | Pesos en HF (egorchistov), código en GitHub |
| RAFT (original) | RAFT two-frame | 2 frames | no disponible en la información | BSD-3-Clause (upstream) | Pesos públicos |
| FlowFormer | Transformer de flujo óptico | 2 frames | no disponible en la información | no disponible en la información | Pesos públicos |
| GMFlow | Transformer de matching global | 2 frames | no disponible en la información | no disponible en la información | Pesos públicos |

No se dispone en la información proporcionada de una comparativa numérica directa entre MEMFOF y RAFT/FlowFormer/GMFlow con la misma configuración de evaluación, por lo que no se incluyen cifras comparativas inventadas.

## Limitaciones y advertencias

- Este repositorio no contiene pesos: es solo una model card. La descarga y verificación de los pesos corre a cargo del usuario contra los enlaces de los autores y los SHA-256 indicados.
- Modelo experimental (tier `experimental`): la API y los kernels pueden cambiar; no se garantiza estabilidad de producción.
- Entrada estrictamente de dos imágenes RGB consecutivas; no procesa vídeo de longitud arbitraria por sí solo ni acepta texto u otras modalidades.
- Resolución mínima y padding: 256 px (o 128 px en KITTI/Sintel) y múltiplo de 16; resoluciones fuera de rango requieren redimensionado, lo que afecta a la precisión del flujo.
- Riesgo de artefactos en regiones ocluidas, texturas repetitivas y movimientos grandes: inherente a los estimadores de flujo denso; no se documentan métricas específicas de robustez fuera de los benchmarks publicados.
- Idiomas: no aplica; no hay evaluación multilingüe ni sesgos lingüísticos que reportar.
- Licencia BSD-3-Clause permite uso comercial, pero la model card advierte que el paquete original es de uso de investigación y que deben revisarse las cadenas de licencia del código original (`LICENSE`, `LICENSE-torchvision`) antes de otros usos.
- Dependencia de CUDA y de kernels específicos para el máximo rendimiento; el backend `portable` es más lento (hasta 2,4x en `memfof-kitti`).
- No se documentan límites de throughput en GPU de gama baja ni comportamiento en CPU.

## Enlaces

- Model card en Hugging Face: https://huggingface.co/fastforks/memfof
- Código de fastforks: https://github.com/kleinicke/fastforks
- Kernels para el backend `kernels`: https://huggingface.co/fastforks/kernels
- Código original (MSU Video Group): https://github.com/msu-video-group/memfof (commit `a51de9fc59c6`)
- Pesos Tartan-T-TSKH: https://huggingface.co/egorchistov/optical-flow-MEMFOF-Tartan-T-TSKH
- Pesos KITTI: https://huggingface.co/egorchistov/optical-flow-MEMFOF-Tartan-T-TSKH-kitti
- Pesos Sintel: https://huggingface.co/egorchistov/optical-flow-MEMFOF-Tartan-T-TSKH-sintel
- Pesos Spring: https://huggingface.co/egorchistov/optical-flow-MEMFOF-Tartan-T-TSKH-spring
- Definición de variantes y hashes completos (`card.toml`): https://github.com/kleinicke/fastforks/blob/main/src/fastforks/flow/models/memfof/card.toml
- Evidencia de licencia: https://huggingface.co/egorchistov/optical-flow-MEMFOF-Tartan-T-TSKH/blob/6c6c9aa3ad64f93aee8efbc2f7a6e4535814ee96/README.md
