# lyj-flower/PaleVision

## Resumen

PaleVision es la implementación oficial del trabajo "Paleoinspired Vision: From Exploring Colour Vision Evolution to Inspiring Camera Design", aceptado en NeurIPS 2026. No se trata de un modelo de lenguaje, sino de un conjunto de modelos de visión por computador para segmentación semántica, detección y conteo sobre imágenes hiperespectrales. El autor del repositorio en Hugging Face es lyj-flower y el trabajo está firmado por Yijie Lu, Zhimin Zong, Junjie Zhang, Shenghan Su, Zeyun Zhao, Ziteng Cui, Yan Pu, Jing Lu, Daisuke Kojima, Lin Gu y Ruogu Fang.

La propuesta técnica central es modelar las respuestas espectrales de las opsinas (los fotorreceptores de la visión animal) mediante capas evolutivas de percepción visual aprendibles (EVPL, *Evolutionary Visual Perception Layers*). Estas capas se combinan con encoders de visión estándar (MiT-B0/B3, Twins-SVT-Small, PVT-v2-B2) y una cabeza SegFormer para producir predicciones sobre cubos hiperespectrales de 31 bandas almacenados en HDF5 con forma `[31, H, W]`.

El modelo es relevante en el contexto de investigación en visión hiperespectral y diseño de sensores: explora cómo la evolución de la visión cromática en animales puede inspirar arquitecturas de cámara y modelos de percepción. El repositorio tiene 0,4 GB y contiene pesos preentrenados para varios conjuntos de datos (MODID, MHSI, LIB-HSI, MinnApple, Mars), aunque no se proporciona información sobre arquitectura de lenguaje, parámetros totales ni longitud de contexto, al no ser un modelo de ese tipo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN/Transformer híbrido para visión: encoder (MiT-B0/B3, Twins-SVT-Small, PVT-v2-B2) + EVPL (opsin spectral layers) + cabeza SegFormer |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de imagen hiperespectral `[31, H, W]`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `.pth` (PyTorch state_dict); checkpoints de segmentación con claves `backbone`, `head`, `evpl` |

## Arquitectura y entrenamiento

PaleVision combina un encoder de visión estándar (MiT-B0, MiT-B3, Twins-SVT-Small o PVT-v2-B2) con capas EVPL que modelan respuestas espectrales de opsinas de forma aprendible. La cabeza de segmentación es de tipo SegFormer. El modelo opera sobre cubos hiperespectrales de 31 bandas (archivos HDF5 con dataset `cube` de forma `[31, H, W]`) y produce mapas de segmentación semántica; también hay variantes para detección y conteo (MinnApple).

El entrenamiento se realiza con `torchrun`, soporta múltiples GPUs y configuraciones por YAML (`configs/mars.yaml`, `configs/modid.yaml`). Los pesos liberados contienen únicamente parámetros de módulo (sin estado del optimizador, contadores de época ni hiperparámetros de entrenamiento). No se especifica en la información disponible el número de tokens, composición del dataset ni si hubo RLHF/DPO (no aplica al ser un modelo de visión). Los modos de opsina incluyen `free` (FreeConv) y `evolve` (opsin evolve), y hay un modo de proyección 2-a-3 para LIB-HSI con 3 opsinas.

## Capacidades

- Segmentación semántica sobre imágenes hiperespectrales de 31 bandas.
- Detección de objetos (variante MinnApple detection, con opsin fijo).
- Conteo de objetos (variante MinnApple counting, con opsin entrenable).
- Modelado espectral de opsinas mediante capas EVPL aprendibles.
- Intercambio de encoder (*encoder swap*) sobre MODID o MHSI con distintos backbones (por ejemplo, `twins_svt_small`).
- Soporte de entrenamiento multi-GPU con `torchrun` y configuraciones YAML.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No se documentan capacidades multilingües, de audio ni de visión general (solo hiperespectral).

## Casos de uso

- Segmentación de imágenes hiperespectrales de Marte: usar `mars_spectral.pth` y `mars_exp.py` con el dataset en `datasets/Mars/MSL/{train,test}/{img,hsi,label}` para generar mapas de segmentación semántica sobre cubos de 31 bandas.
- Investigación en visión cromática evolutiva: emplear las capas EVPL con `opsin_mode free` o `evolve` para estudiar cómo distintas respuestas espectrales de opsinas afectan al rendimiento de percepción, comparando configuraciones en MODID o MHSI.
- Diseño de sensores y cámaras: usar los pesos y configuraciones como banco de pruebas para evaluar qué combinaciones de respuestas espectrales (opsinas) resultan más útiles para tareas de segmentación, informando el diseño de filtros espectrales.
- Detección y conteo de frutos en agricultura (MinnApple): emplear `minneapple_detection.pth` (AP@50 0.3105) y `minneapple_counting.pth` (MAE 2.446) para localizar y contar manzanas en imágenes, con posible integración en pipelines de monitorización de cultivos.
- Segmentación en escenas submarinas o de gran profundidad (MHSI): usar `mhsi_pvt_v2_b2_free.pth` (mIoU 0.5727) para segmentar imágenes hiperespectrales en entornos con condiciones espectrales adversas.
- Evaluación comparativa de backbones: usar `encoder_swap_exp.py` para cambiar entre MiT, Twins-SVT y PVT-v2 y medir el impacto en mIoU sobre MODID o MHSI, facilitando estudios de ablación reproducibles.
- Reproducción de resultados de NeurIPS: ejecutar los entry points (`modid_exp.py`, `mhsi_exp.py`, `lib_hsi_exp_v2.py`, `minneapple_exp.py`) con los checkpoints publicados para replicar las puntuaciones reportadas.

## Benchmarks y rendimiento

| Conjunto de datos | Configuración | Métrica | Resultado |
|---|---|---|---|
| MODID | Twins-SVT-Small, FreeConv | mIoU | 0.6006 |
| MHSI | PVT-v2-B2, FreeConv | mIoU | 0.5727 |
| LIB-HSI | MiT-B3, 3-opsin EVPL con proyección 2-a-3 | mIoU | 0.3407 |
| MinnApple (segmentación) | opsin evolve | mIoU | 0.4845 |
| MinnApple (detección) | opsin fijo | AP@50 | 0.3105 |
| MinnApple (conteo) | opsin entrenable | MAE | 2.446 |
| Mars | EVPL espectral, época 1000 | modelo espectral | no disponible |

No se han publicado en la información disponible resultados comparativos con otros modelos en estos benchmarks, más allá de las puntuaciones propias reportadas en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 0,4 GB y los encoders son de tamaño pequeño (MiT-B0/B3, Twins-SVT-Small, PVT-v2-B2), por lo que es probable que quepa en GPUs de consumo, aunque no se confirma.
- GPU recomendadas: no disponible; el entrenamiento documentado usa `torchrun` con 1 o 2 GPUs y `nproc_per_node`.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: PyTorch con `torchrun`; se requiere una build de CUDA de PyTorch compatible con el driver y, si es necesario, `mmcv` para la combinación de torch/CUDA. No se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de segmentación hiperespectral ni con alternativas de la misma categoría (por ejemplo, redes SegFormer estándar sin EVPL u otros modelos de segmentación hiperespectral). Las únicas referencias comparativas internas son las distintas configuraciones de encoder y modo de opsina del propio PaleVision.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni agentes; cualquier uso en esos escenarios es inadecuado.
- Requiere imágenes hiperespectrales de 31 bandas en formato HDF5 con dataset `cube` de forma `[31, H, W]`; no funciona con imágenes RGB convencionales sin adaptación.
- Los pesos liberados contienen solo parámetros de módulo; no incluyen estado del optimizador ni hiperparámetros, lo que limita la reanudación exacta del entrenamiento.
- La licencia no está especificada, por lo que el uso comercial queda sin garantías legales hasta que el autor la declare.
- Los datasets no se distribuyen con el repositorio (`datasets/` no incluido); es necesario obtenerlos por separado.
- El rendimiento en LIB-HSI es bajo (mIoU 0.3407) en comparación con otros conjuntos, lo que sugiere limitaciones en escenas con condiciones espectrales específicas.
- Riesgo de sobreajuste a los dominios evaluados (MODID, MHSI, LIB-HSI, MinnApple, Mars); no se documenta generalización a otros sensores o resoluciones.
- No se documentan sesgos ni evaluaciones de robustez fuera de los benchmarks reportados.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/lyj-flower/PaleVision
- Sitio del proyecto: https://luyijie-research.github.io/PaleVision/
- Código: https://github.com/luyijie-research/PaleVision
- Pesos: https://huggingface.co/lyj-flower/PaleVision
