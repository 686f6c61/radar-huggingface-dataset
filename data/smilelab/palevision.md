# smilelab/PaleVision

## Resumen

PaleVision es un modelo de investigación para segmentación semántica, detección y conteo sobre imágenes hiperespectrales, desarrollado por el grupo smilelab. Se presenta como la implementación oficial del artículo "Paleoinspired Vision: From Exploring Colour Vision Evolution to Inspiring Camera Design", aceptado en NeurIPS 2026. No es un modelo de lenguaje: es una red neuronal convolucional/transformer de visión especializada en cubos hiperespectrales (por ejemplo, 31 bandas espectrales), pensada para reproducir experimentos académicos de percepción visual inspirada en la evolución de los opsinas.

La innovación central es la capa EVPL (Evolutionary Visual Perception Layer), que modela las respuestas espectrales de los opsinas con parámetros aprendibles y actúa como una etapa de proyección previa a un backbone de segmentación (MiT-B0 a B3, PVT-v2-B2, Twins-SVT-Small) con cabeza SegFormer. El modelo se entrena sobre datasets hiperespectrales específicos (MODID, MHSI, LIB-HSI, MinnApple y el conjunto Mars MSL) y los pesos liberados corresponden a los mejores checkpoints de cada tarea reportada.

Es relevante ahora porque ofrece una vía reproducible para investigar el diseño de sensores y filtros espectrales desde un enfoque bioinspirado, con pesos publicados bajo licencia MIT y código disponible. Su alcance es estrictamente de investigación: no es un sistema general de visión ni un modelo multimodal de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de visión (MiT-B0/B3, PVT-v2-B2, Twins-SVT-Small) con cabeza SegFormer y capa EVPL de opsinas aprendibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de cubos hiperespectrales de 31 bandas, resolución configurable) |
| Tipos de cuantizacion | no disponible (pesos en formato PyTorch nativo, sin versiones cuantizadas publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | `.pth` (checkpoints PyTorch; diccionarios con `backbone`, `head` y `evpl`, o `state_dict` único en detección/conteo) |

## Arquitectura y entrenamiento

PaleVision combina una capa EVPL que modela las respuestas espectrales de los opsinas mediante parámetros aprendibles (modos "free", "fixed" o "evolve") con un backbone de segmentación estándar y una cabeza SegFormer. Los cubos hiperespectrales de entrada (HDF5 con tensor `[31, H, W]`) se proyectan a través de la capa EVPL antes de entrar al encoder. El repositorio permite intercambiar encoders (MiT-B0 a MiT-B3, PVT-v2-B2, Twins-SVT-Small) mediante el script `encoder_swap_exp.py`, lo que facilita experimentos de ablación sobre la arquitectura visual.

El entrenamiento se realizó con PyTorch 2.6.0 y CUDA 12.6 sobre una GPU NVIDIA con memoria suficiente para los backbones y resoluciones de los ficheros de configuración. Los datos de entrenamiento son los datasets MODID, MHSI, LIB-HSI, MinnApple y el conjunto Mars MSL, que no se redistribuyen. No se especifica en la información disponible el número de tokens, la composición exacta de los datasets ni si se aplicaron técnicas de RLHF o DPO (no aplicables a este tipo de modelo). La semilla por defecto es 42 y los hiperparámetros están en `configs/`.

## Capacidades

- Segmentación semántica de imágenes hiperespectrales (mIoU 0.6006 en MODID con Twins-SVT-Small y FreeConv; 0.5727 en MHSI con PVT-v2-B2; 0.3407 en LIB-HSI con MiT-B3 y EVPL de 3 opsinas con proyección 2-a-3).
- Detección de objetos en imágenes hiperespectrales (AP@50 0.3105 en MinnApple con opsina fija).
- Conteo de objetos (MAE 2.446 en MinnApple con opsina entrenable).
- Modelado espectral de filtros: el checkpoint `mars_spectral.pth` contiene el EVPL espectral del conjunto Mars MSL en la época 1000, útil para inspeccionar longitudes de onda de pico aprendidas.
- Intercambio de encoders para experimentos de ablación (MiT, PVT-v2, Twins-SVT).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües; no es un modelo de lenguaje.

## Casos de uso

- Reproducción de experimentos académicos: ejecutar los entry points (`modid_exp.py`, `mhsi_exp.py`, `lib_hsi_exp_v2.py`, `minneapple_exp.py`) con los datasets originales para validar los resultados del artículo con semilla 42.
- Investigación en diseño de sensores: inspeccionar las longitudes de onda de pico aprendidas por la capa EVPL para informar el diseño de filtros espectrales en cámaras, que es el objetivo declarado del artículo.
- Segmentación de imágenes de teledetección o planetarias: el checkpoint `mars_spectral.pth` y el flujo de datos Mars MSL sirven como base para experimentos de segmentación sobre cubos hiperespectrales de 31 bandas.
- Detección y conteo en agricultura: el checkpoint de MinnApple (manzanas) permite experimentar con detección (AP@50 0.3105) y conteo (MAE 2.446) de frutos en imágenes hiperespectrales.
- Ablación de arquitecturas de visión: usar `encoder_swap_exp.py` para comparar MiT, PVT-v2 y Twins-SVT bajo distintos modos de opsina (free, fixed, evolve) sobre MODID o MHSI.
- Docencia y formación: el entorno conda reproducible y los scripts de smoke check (3 pasos, resolución 128) permiten demostrar el pipeline completo de entrenamiento en una sola GPU.

## Benchmarks y rendimiento

Resultados reportados para los pesos liberados:

| Checkpoint | Tarea / dataset | Configuración | Métrica | Valor |
|---|---|---|---|---|
| `modid_twins_svt_small_free.pth` | Segmentación, MODID | Twins-SVT-Small, FreeConv | mIoU | 0.6006 |
| `mhsi_pvt_v2_b2_free.pth` | Segmentación, MHSI | PVT-v2-B2, FreeConv | mIoU | 0.5727 |
| `lib_hsi.pth` | Segmentación, LIB-HSI | MiT-B3, EVPL 3 opsinas con proyección 2-a-3 | mIoU | 0.3407 |
| `minneapple.pth` | Segmentación, MinnApple | Opsina evolve | mIoU | 0.4845 |
| `minneapple_detection.pth` | Detección, MinnApple | Opsina fija | AP@50 | 0.3105 |
| `minneapple_counting.pth` | Conteo, MinnApple | Opsina entrenable | MAE | 2.446 |
| `mars_spectral.pth` | Espectral, Mars MSL | EVPL, época 1000 | mIoU | no reportado |

No se han publicado en la información disponible comparaciones con otros modelos en estos benchmarks.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el autor indica que se necesita una GPU NVIDIA con memoria suficiente para MiT-B0 hasta Twins-SVT-Small en las resoluciones de `configs/`. Los backbones son pequeños (B0 a B3, Small), por lo que es plausible que quepan en GPUs de consumo, pero no se confirma en la información disponible.
- GPU recomendadas: no disponibles; el entrenamiento liberado usó una GPU NVIDIA no especificada con PyTorch 2.6.0 y CUDA 12.6.
- Cabe en GPU de consumo: no confirmado. La carga de checkpoints en CPU funciona sin GPU según la model card.
- Opciones de despliegue: scripts PyTorch propios (`torchrun`), con soporte multi-GPU vía `--nproc_per_node`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este modelo).
- Latencia y throughput: no disponibles.
- Tamaño del repositorio: 0,4 GB (incluye pesos).

## Comparativa con modelos similares

No se dispone en la información proporcionada de comparaciones con otros modelos de segmentación hiperespectral ni con alternativas de la misma categoría. Los backbones empleados (MiT, PVT-v2, Twins-SVT) son arquitecturas publicadas de segmentación general, pero no se aportan datos comparativos de rendimiento frente a ellas en los datasets de PaleVision.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PaleVision | no disponible | no aplica | mIoU 0.6006 en MODID (mejor checkpoint) | MIT | Hugging Face y GitHub |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Los checkpoints están ligados a los datasets y al número de clases usados en entrenamiento; no generalizan a otras tareas sin reentrenamiento.
- No es un sistema médico ni de navegación de propósito general, según advierte el propio autor.
- El archivo `mars_spectral.pth` corresponde al EVPL espectral de la época 1000 y esa ejecución no reportó mIoU de segmentación.
- El checkpoint de LIB-HSI se ensambló a partir del mejor backbone, cabeza y EVPL guardados por separado en la mejor ejecución finalizada.
- Los pesos contienen solo parámetros de módulo; no incluyen estado del optimizador, contadores de época ni hiperparámetros de entrenamiento.
- Los datasets no se redistribuyen; es necesario obtenerlos por separado y colocarlos en la estructura `datasets/` descrita.
- Riesgo de alucinación y sesgos: no aplica en el sentido de modelos generativos, pero sí existe riesgo de sobreajuste a las distribuciones espectrales de los datasets de entrenamiento.
- Licencia MIT: permite uso comercial, pero el modelo está pensado para reproducción de investigación; no hay garantías de idoneidad para producción.
- No hay soporte multilingüe ni de texto: la ficha de idiomas no aplica.

## Enlaces

- Hugging Face: https://huggingface.co/smilelab/PaleVision
- arXiv: https://arxiv.org/abs/2412.19439
- Sitio del proyecto: https://luyijie-research.github.io/PaleVision/
- Código en GitHub: https://github.com/luyijie-research/PaleVision
