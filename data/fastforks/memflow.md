# fastforks/memflow

## Resumen

MemFlow es una red neuronal para estimación de flujo óptico (optical flow) desarrollada originalmente por Dong y Fu y presentada en CVPR 2024. El modelo aborda el problema de estimar el movimiento por píxel entre dos fotogramas consecutivos de un vídeo, incorporando una memoria de movimiento pasado que le permite mantener coherencia temporal en secuencias. La implementación aquí descrita es un port de los pesos originales realizada por el proyecto fastforks, que distribuye únicamente la model card y descarga los pesos desde los enlaces oficiales de los autores.

La arquitectura sigue el esquema de RAFT, operando a resolución 1/8 mediante redes BasicEncoder de características y contexto, una pirámide de correlación all-pairs, un encoder de movimiento y un bloque de actualización basado en convoluciones depthwise-separable de kernel grande (SKFlow) en lugar de una GRU. La lectura de las características de movimiento de los fotogramas de memoria se realiza mediante atención. El modelo se distribuye con licencia Apache-2.0 y pesos de los autores, con tres variantes entrenadas sobre distintos conjuntos de datos (Things, KITTI y Sintel).

Es relevante para investigadores y desarrolladores que necesitan un modelo de flujo óptico de referencia con pesos verificados por SHA-256, múltiples backends de ejecución (portable y kernels) y benchmarks de latencia y memoria publicados sobre hardware consumer (RTX 5060 Ti 16 GB).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RAFT-style con BasicEncoder (features y contexto), pirámide de correlación all-pairs, motion encoder y update block con bloques SKFlow (depthwise-separable de kernel grande) en lugar de GRU; readout por atención de características de memoria; upsampling convexo 8x |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión por pares de imágenes; entrada H x W >= 128, padding a múltiplo de 8; probado hasta 1024x2048) |
| Tipos de cuantizacion | fp16 (portable y kernels); fp32 en la implementación original; TensorRT fp16 falla en la construcción del engine |
| Idiomas soportados | no disponible (modelo de visión, no lingüístico) |
| Licencia | Apache-2.0 (código y pesos) |
| Formato de pesos | .pth (checkpoints PyTorch de los autores, descargados desde GitHub Releases; no alojados en el repo) |

## Arquitectura y entrenamiento

MemFlow es una red de flujo óptico tipo RAFT que procesa un par de imágenes RGB (fotogramas consecutivos) y produce un campo de movimiento por píxel (dx, dy en píxeles) del primero al segundo. La red opera a 1/8 de resolución con redes BasicEncoder para extraer características y contexto, una pirámide de correlación all-pairs, un encoder de movimiento y un bloque de actualización compuesto por bloques depthwise-separable de kernel grande (SKFlow) en lugar de la GRU clásica de RAFT. La innovación principal es la incorporación de una memoria de movimiento de fotogramas pasados, leída mediante atención sobre las características de movimiento de dichos fotogramas. El upsampling final es convexo 8x. En el caso de un par de imágenes aislado, se ejecuta como el primer fotograma de un vídeo con memoria vacía, de modo que el readout atiende únicamente a las características de movimiento del propio par.

El entrenamiento parte del checkpoint de SKFlow sobre FlyingChairs + FlyingThings3D, siguiendo el `train.sh` de los autores, y utiliza datos de FlyingChairs (Freiburg) y Freiburg SceneFlow (FlyingThings3D, Driving, Monkaa). No se especifica en la información disponible el número total de tokens ni si hubo RLHF/DPO (no aplica a este tipo de modelo). La variante con memoria para vídeo usa `val_decoder_depth` 15.

## Capacidades

- Estimación de flujo óptico denso entre dos imágenes RGB consecutivas, con salida de desplazamiento por píxel (dx, dy).
- Procesamiento de pares de imágenes a resolución variable (H x W >= 128, padding a múltiplo de 8), probado hasta 1024x2048.
- Memoria de movimiento para secuencias de vídeo: la atención sobre fotogramas de memoria permite coherencia temporal (en el par aislado la memoria está vacía).
- Tres variantes de pesos especializadas: `memflow` (Things), `memflow-kitti` (KITTI) y `memflow-sintel` (Sintel).
- Backends de ejecución: `portable` (PyTorch) y `kernels` (kernels optimizados para CUDA).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No soporta capacidades multilingües, visión general, audio ni thinking mode.

## Casos de uso

- Estimación de movimiento en vídeo: el modelo calcula el flujo óptico entre fotogramas consecutivos y, gracias a su memoria de movimiento, mantiene coherencia temporal en secuencias, lo que resulta adecuado para estabilización, interpolación o análisis de movimiento.
- Interpolación de fotogramas: el flujo denso entre dos fotogramas permite generar fotogramas intermedios en postproducción o reproducción de vídeo a mayor tasa.
- Seguimiento y análisis de movimiento en robótica: el flujo por píxel sirve como entrada para odometría visual o detección de obstáculos en pipelines de percepción.
- Compresión de vídeo: los vectores de movimiento estimados pueden emplearse como predictores en codificadores de vídeo basados en flujo.
- Vehículos autónomos y ADAS: la variante `memflow-kitti` está especializada en escenas de conducción (KITTI 2015), adecuada para estimación de movimiento en carretera.
- Investigación en visión por computador: modelo de referencia con pesos verificados y benchmarks reproducibles para comparar arquitecturas de flujo óptico.
- Procesamiento por lotes en GPU consumer: con 865 ms por par a 1080x1920 en el backend `kernels` sobre una RTX 5060 Ti 16 GB, es viable para prototipos y pipelines de investigación en hardware asequible.

## Benchmarks y rendimiento

Precisión en el conjunto de validación público (fotogramas _10 -> _11 a tamaño completo, EPE y Fl-all contra ground truth flow_occ):

| Variante | Dataset | Original fp32 | Original fp16 | portable | kernels |
|---|---|---|---|---|---|
| `memflow` | KITTI 2015 train, EPE / Fl-all % | 4.108 / 14.43 | 4.107 / 14.43 | 4.109 / 14.44 | 4.103 / 14.42 |
| `memflow-kitti` | KITTI 2015 train, EPE / Fl-all % | 0.600 / 1.21 | 0.600 / 1.21 | 0.600 / 1.21 | 0.600 (dato truncado en la información disponible) |

Resultados del paper (vídeo con memoria, `val_decoder_depth` 15): Sintel test EPE 1.05 (clean) / 1.91 (final); KITTI 2015 test Fl-all 4.10 %.

Rendimiento en inferencia (RTX 5060 Ti 16 GB, sm_120, entrada 1080x1920):

| Modelo | Tiempo original | Tiempo portable | Tiempo kernels | Aceleración kernels vs original | Memoria pico portable (MiB) | Memoria pico kernels (MiB) |
|---|---|---|---|---|---|---|
| `memflow` | 3116 ms | 964 ms | 865 ms | 3.6x | 8265 / 8382 | 968 / 1022 |
| `memflow-kitti` | 3247 ms | 965 ms | 865 ms | 3.8x | 8265 / 8382 | 968 / 1022 |
| `memflow-sintel` | 3214 ms | 964 ms | 865 ms | 3.7x | 8265 / 8382 | 968 / 1022 |

Arranque y primera llamada: carga entre 0.06 y 1.18 s según backend; primera llamada entre 0.88 y 3.82 s. `torch.compile` aumenta el tiempo a ~1640 ms (peor que portable) y TensorRT fp16 falla en la construcción del engine. Memoria pico probada hasta 1024x2048: 8.2 GiB asignados, 9.2 GiB reservados (portable, fp16).

## Requisitos de hardware

- VRAM estimada: ~8.3 GiB asignados / 9.2 GiB reservados en backend portable a 1080x1920; ~1 GiB en backend kernels a la misma resolución; probado hasta 1024x2048 con 8.2 GiB pico.
- GPU recomendadas: RTX 5060 Ti 16 GB (hardware de referencia de los benchmarks); cualquier GPU CUDA con al menos ~10 GiB para el backend portable a resolución completa; el backend kernels reduce el requisito a ~1 GiB.
- Cabe en GPU consumer: sí, en RTX 5060 Ti 16 GB y previsiblemente en GPUs con >= 10-12 GiB para el backend portable; el backend kernels permite GPUs con menos VRAM.
- Opciones de despliegue: PyTorch (backend portable), kernels optimizados de fastforks (backend kernels), torch.compile (aunque empeora la latencia), TensorRT fp16 no funcional (falla la construcción del engine). No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: ~865 ms por par a 1080x1920 en backend kernels; ~964 ms en portable; ~3.1-3.2 s en la implementación original. En backend kernels la memoria es ~8.5x menor que en portable.

## Comparativa con modelos similares

| Modelo | Tipo | Memoria temporal | Licencia | Pesos | Contexto/entrada |
|---|---|---|---|---|---|
| MemFlow (este) | RAFT-style + memoria por atención | Sí (atención sobre fotogramas de memoria) | Apache-2.0 | .pth de los autores | H x W >= 128, hasta 1024x2048 probado |
| RAFT | RAFT con GRU | No | BSD-3 (original) | .pth | Resolución variable |
| SKFlow | RAFT con bloques SKFlow | No | no disponible | .pth | Resolución variable |

No se dispone en la información proporcionada de datos de benchmarks comparativos directos con RAFT o SKFlow más allá de los resultados del paper de MemFlow. Indica "no disponible" para comparaciones cuantitativas adicionales.

## Limitaciones y advertencias

- Modelo de visión: no procesa texto, no soporta tool calling, agentes ni razonamiento; no debe evaluarse como un LLM.
- La memoria de movimiento solo se aprovecha en secuencias de vídeo; en un par aislado la memoria está vacía y el readout atiende solo al propio par.
- TensorRT fp16 no es funcional (falla la construcción del engine); `torch.compile` empeora la latencia (~1640 ms frente a ~964 ms).
- El repo no aloja pesos: la descarga depende de los enlaces de GitHub Releases de los autores y de la verificación SHA-256.
- La model card advierte que las cadenas de licencia del código original se registran "tal cual" y deben revisarse antes de cualquier uso; el paquete es de uso de investigación.
- Riesgo de alucinación no aplica en el sentido lingüístico, pero sí existe riesgo de flujo erróneo en oclusiones, superficies sin textura o movimientos grandes fuera del rango entrenado.
- Idiomas soportados: no disponible (no aplica).
- La variante `memflow-kitti` está especializada en escenas de conducción; su uso fuera de ese dominio puede degradar la precisión.
- Uso comercial permitido por Apache-2.0, pero conviene verificar las condiciones del código original de los autores.

## Enlaces

- Hugging Face: https://huggingface.co/fastforks/memflow
- Repositorio fastforks: https://github.com/kleinicke/fastforks
- Kernels: https://huggingface.co/fastforks/kernels
- Código original de MemFlow: https://github.com/DQiaole/MemFlow (commit `5486fb88a55b`)
- Pesos `memflow`: https://github.com/DQiaole/MemFlow/releases/download/v1.0.0/MemFlowNet_things.pth
- Pesos `memflow-kitti`: https://github.com/DQiaole/MemFlow/releases/download/v1.0.0/MemFlowNet_kitti.pth
- Pesos `memflow-sintel`: https://github.com/DQiaole/MemFlow/releases/download/v1.0.0/MemFlowNet_sintel.pth
- Benchmarks del port: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Licencia original: https://github.com/DQiaole/MemFlow/blob/5486fb88a55b04c2e2b292b3abaa7641d9988831/LICENSE
- Paper: Dong & Fu, CVPR 2024 (referenciado en la model card; enlace directo no disponible)
