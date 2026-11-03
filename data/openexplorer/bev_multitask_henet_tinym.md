# OpenExplorer/bev_multitask_henet_tinym

## Resumen

BEV Multitask + HENet-tiny es un modelo de percepción multitarea para conducción autónoma desarrollado por OpenExplorer (Horizon Robotics), diseñado para funcionar exclusivamente con cámaras, sin lidar en inferencia. El modelo eleva seis cámaras surround a un espacio de características bird's-eye view (BEV) compartido y ejecuta cinco cabeceras simultáneas: detección de objetos dinámicos, detección de objetos estáticos, ocupación volumétrica, detección de líneas de parada y mapeo vectorizado online de carriles. Esto permite mantener consistencia entre las distintas tareas de percepción sin necesidad de ejecutar cinco redes separadas.

La arquitectura emplea el backbone HENet-tiny (inicializado desde un checkpoint preentrenado en ImageNet), un neck FPN combinado con un BevFuseModule, y un view transformer de una sola etapa tipo BevFormer. Las cabeceras de detección siguen el estilo SparseBEV, la de mapa online sigue el estilo MapTR y la de ocupación usa un decoder Bevformer con cabeza BEVOCCHead2D. El modelo está calibrado específicamente para despliegue en los SoCs Horizon J6M y J6P, lo que lo convierte en una pieza orientada a producción embebida en automoción más que a investigación genérica.

La relevancia actual del modelo radica en su enfoque de percepción unificada y eficiente para plataformas de cómputo limitado: consigue 13,21 FPS en J6M y 76,17 FPS en J6P con un consumo de memoria DDR inferior a 400 MB, manteniendo cinco tareas de percepción activas sobre un canvas BEV de aproximadamente 100 metros alrededor del vehículo. No es un modelo de lenguaje ni un modelo generativo: es un modelo de visión por computador especializado en percepción automotriz.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN (HENet-tiny) + FPN + BevFuseModule + BevFormer view transformer + cabeceras multitarea (SparseBEV, BEVOCCHead2D, MapTR) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada 6 cámaras × 3 × 512 × 960) |
| Tipos de cuantización | float, calibration, hbm (compilado para Horizon J6M/J6P) |
| Idiomas soportados | no aplica (modelo de percepción visual) |
| Licencia | other (ver limitaciones) |
| Formato de pesos | no disponible explícitamente; repo de 4,1 GB, compatible con HEAL 0.14.0 / hbdk4-compiler 4.13.1 / horizon_plugin_pytorch 3.4.5 |

## Arquitectura y entrenamiento

El modelo procesa seis imágenes multivista `(B, 6, 3, 512, 960)` en formato YUV444 con normalización `Normalize(128,128)`. El backbone HENet-tiny usa `block_nums=[4,3,8,6]`, `embed_dims=[64,128,192,384]` y bloques `GroupDWCB`/`AltDWCB`/`DWCB` con downsampling `S2DDown`, inicializado desde el checkpoint `henet_tinym` preentrenado en ImageNet. El neck combina un FPN (`in_strides=[32]` → `out_strides=[32]`, `_dim_=256`) con un `BevFuseModule` (`input_c=384+256` → `fuse_c=256`) en el que la rama lidar está desactivada (`lidar_input=False`). La elevación a BEV se realiza con un `SingleBevFormerViewTransformer` de un solo fotograma, generando un canvas compacto de unos 100 m alrededor del ego.

Las cinco cabeceras son: detección dinámica con `DenseBEVSparseHead` (8 clases, `num_anchor=384`, `num_decoder=6`, `MemoryBank` con `num_temp_instances=128` para tracking); detección estática con `DenseBEVSparseHead` (2 clases: `traffic_cone`, `barrier`, `num_anchor=200`); ocupación con `BevformerOccDetDecoder` + `BEVOCCHead2D` (`Dz=16`, 18 clases); mapa discreto con `BEVFormerDet2DDecoder` (1 clase `stop_line`, `num_query=100`); y mapa online con `MaptrDetDecoder` + `MapInstanceDetectorHead` (3 clases: `divider`, `ped_crossing`, `boundary`, 20 puntos por polilínea). Las funciones de pérdida incluyen `FocalLoss`, `L1Loss`, `CrossEntropyLoss`, `GaussianFocalLoss`, `MapTRCriterion` y `BevFormer2DCriterion`. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF/DPO (no aplicables en este dominio). La model card indica que esta tarea no tiene etapa QAT.

## Capacidades

- Detección 3D de objetos dinámicos (8 clases) a partir de seis cámaras surround, con memoria temporal de 128 instancias para tracking.
- Detección 3D de objetos estáticos (2 clases: conos de tráfico y barreras).
- Predicción de ocupación volumétrica con 18 clases semánticas y `Dz=16` en el eje vertical.
- Detección de líneas de parada (stop lines) como cajas 2D en el espacio BEV.
- Mapeo vectorizado online de carriles con tres clases (separadores, pasos de peatones, bordes) y polilíneas de 20 puntos.
- Percepción exclusivamente por cámara, sin dependencia de lidar en inferencia.
- Consistencia multitarea al compartir una única representación BEV entre las cinco cabeceras.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo de percepción visual especializado.

## Casos de uso

- Percepción en producción para ADAS/AD embebido: el modelo está calibrado para los SoCs Horizon J6M y J6P, con 13,21 FPS en J6M y 76,17 FPS en J6P, lo que permite integrarlo directamente en unidades de control electrónico automotrices con presupuesto de memoria DDR inferior a 400 MB.
- Detección y tracking de objetos dinámicos en entorno urbano: la cabecera `DenseBEVSparseHead` con `MemoryBank` de 128 instancias temporales permite seguir vehículos y peatones a lo largo de fotogramas consecutivos usando solo cámaras.
- Detección de obstáculos estáticos en obras y vías: la cabecera estática (conos y barreras) complementa la detección dinámica para señalizar elementos fijos que condicionan la trayectoria.
- Estimación de espacio libre y ocupación: la cabecera de ocupación con 18 clases semánticas y 16 niveles verticales permite razonar sobre volúmenes transitables y obstáculos en altura, útil para planificación de trayectorias.
- Localización y mapeo online de carriles: la cabecera MapTR genera polilíneas de separadores, pasos de peatones y bordes, lo que habilita navegación sin depender exclusivamente de mapas HD previamente cargados.
- Detección de líneas de parada para control de intersecciones: la cabecera de mapa discreto con 100 queries permite al sistema de planificación detenerse correctamente en cruces y semáforos.
- Validación y regresión en pipelines de percepción: al compartir una única representación BEV, el modelo simplifica la evaluación de consistencia entre tareas y reduce el coste de integración frente a cinco redes independientes.

## Benchmarks y rendimiento

Resultados de precisión publicados en la model card (configuración `March.NASH_M` para J6M, sin etapa QAT):

| March | Métrica | float | calibration | hbm |
|---|---|---|---|---|
| J6M | Dynamic NDS | 0,4553 | 0,4480 | 0,4535 |
| J6M | Static NDS | 0,4873 | 0,4839 | 0,4842 |
| J6M | Occ mIoU | 0,3422 | 0,3401 | 0,3399 |
| J6M | stop_line NDS | 0,4802 | 0,4762 | 0,4759 |
| J6M | MapTR mAP | 0,5486 | 0,5405 | 0,5376 |

Métricas de rendimiento (FPS con 8 hilos single-core; latencia single-core single-thread; memoria como pico de uso DDR; fuente `tools/test_perf_all.py`, intervalo de muestreo por defecto 200 ms, perf-time 1):

| March | Latencia (ms) | FPS | Memoria (MB) |
|---|---|---|---|
| J6M | 77,82 | 13,21 | 386,90 |
| J6P | 47,65 | 76,17 | 373,50 |

No se han publicado resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no son benchmarks aplicables a este dominio.

## Requisitos de hardware

- El modelo está diseñado y calibrado para los SoCs Horizon J6M y J6P; no se documenta soporte para GPU convencionales (A100, H100, RTX 4090) en la información disponible.
- Memoria DDR pico: 386,90 MB en J6M y 373,50 MB en J6P.
- Latencia: 77,82 ms en J6M (single-core single-thread) y 47,65 ms en J6P.
- Throughput: 13,21 FPS en J6M (8 hilos single-core) y 76,17 FPS en J6P.
- Toolchain de despliegue: HEAL 0.14.0, hbdk4-compiler 4.13.1, horizon_plugin_pytorch 3.4.5 (board UCP 3.16.2).
- No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, que no son aplicables a este tipo de modelo.
- No se dispone de información sobre requisitos en GPU consumer.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo se apoya en componentes de referencia publicados (SparseBEV y MapTR), pero no se ofrecen métricas comparativas frente a esas implementaciones ni frente a otros modelos BEV multitarea. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- Modelo de percepción visual especializado: no es un modelo de lenguaje ni generativo, por lo que no admite prompts, razonamiento textual ni generación de código.
- Dependencia total de cámaras: al desactivar la rama lidar en inferencia, la precisión puede degradarse en condiciones de baja iluminación, lluvia, niebla o deslumbramiento.
- Precisión moderada en ocupación: el mIoU de 0,3422 en J6M indica margen de mejora en la estimación volumétrica.
- Calibrado para hardware específico: los resultados de latencia y FPS corresponden a Horizon J6M/J6P; el comportamiento en otras plataformas no está documentado.
- Licencia "other": no se especifican los términos exactos de uso comercial; es imprescindible revisar las condiciones del autor antes de un despliegue en producción.
- No se documentan sesgos, riesgos de alucinación ni cobertura idiomática por tratarse de un modelo de percepción; sin embargo, el rendimiento puede variar según la geografía, el tipo de vía y las condiciones meteorológicas del dataset de entrenamiento (no disponible).
- No se dispone de información sobre el dataset de entrenamiento, lo que limita la evaluación de sesgos de dominio y de generalización.
- La model card advierte de que HENet y el ensamblaje multitarea son implementaciones internas de HEAL, y que los repos oficiales de SparseBEV y MapTR usan backbones y configuraciones de una sola tarea diferentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OpenExplorer/bev_multitask_henet_tinym
- Repositorio SparseBEV: https://github.com/MCG-NJU/SparseBEV
- Paper SparseBEV: https://arxiv.org/abs/2308.09244
- Repositorio MapTR: https://github.com/hustvl/MapTR
- Paper MapTR: https://arxiv.org/abs/2208.14437
