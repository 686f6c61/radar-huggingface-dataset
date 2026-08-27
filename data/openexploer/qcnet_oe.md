# OpenExploer/qcnet_oe

## Resumen

QCNetOE es un modelo de predicción de trayectorias multimodales para conducción autónoma, desarrollado por OpenExploer como una variante optimizada del modelo QCNet (Query-Centric Trajectory Prediction) presentado en CVPR 2023. El modelo codifica las relaciones relativas de cada agente con el mapa circundante y con otros agentes mediante un enfoque centrado en consultas (query-centric), procesando los estados ocultos del encoder de forma secuencial agente a agente. El decoder genera seis trayectorias candidatas por agente con sus probabilidades asociadas.

La principal innovación de QCNetOE frente al QCNet original es la eliminación de las dependencias de `torch_geometric` y `torch_cluster`, así como la reducción de operaciones de indexado, gather y scatter, lo que lo hace especialmente adecuado para despliegue cuantizado en hardware embebido, concretamente en los chips Horizon Journey 6 (J6M, J6P, J6B). El modelo está diseñado para inferencia en streaming con soporte de arranque en frío o en caliente, y se distribuye bajo una licencia "other" no especificada. El repositorio tiene un tamaño de 0,3 GB y fue creado en agosto de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer query-centric con encoder de mapa y agentes en streaming, decoder multimodal (basado en QCNet) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada: 10 pasos historicos, 5 s; salida: 12 pasos futuros, 6 s) |
| Tipos de cuantizacion | Calibracion, QAT (quantization-aware training) y HBM (mencionados en metricas) |
| Idiomas soportados | no disponible (modelo de vision/geometria, no de texto) |
| Licencia | other (no especificada) |
| Formato de pesos | no disponible (probablemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

QCNetOE sigue la arquitectura de QCNet, un transformer centrado en consultas para predicción de trayectorias. El encoder se compone de `QCNetOEMapEncoder` y `QCNetOEAgentEncoderStream`, con `hidden_dim=128`, `num_heads=8`, `head_dim=16`, `num_freq_bands=32`, `num_map_layers=1`, `num_agent_layers=1`, `time_span=2` y `dropout=0.1`. Las interacciones agente-mapa usan `num_pl2a=32` y agente-agente `num_a2a=36`. El decoder (`QCNetOEDecoder`, `num_dec_layers=1`) produce `num_modes=6` trayectorias candidatas de 12 pasos con coordenadas (x, y) y sus probabilidades. El preprocesado construye representaciones relativas agente/mapa y codificaciones posicionales espacio-temporales, mientras que el postprocesado devuelve las trayectorias finales.

La principal modificación respecto al QCNet original es la eliminación de dependencias de `torch_geometric`/`torch_cluster` y de la mayoría de operaciones de indexado, gather y scatter, lo que facilita la cuantización y el despliegue en hardware Horizon. El modelo soporta inferencia en streaming con `stream_infer=True` y control de arranque en frío/caliente mediante `quant_infer_cold_start`. No se especifican los datos de entrenamiento en la información disponible, aunque el tutorial oficial de Horizon indica que el modelo se entrena sobre el dataset Argoverse 2. No se menciona el uso de RLHF o DPO, al tratarse de un modelo de visión geométrica.

## Capacidades

- Predicción de trayectorias multimodales: genera 6 trayectorias futuras por agente (12 pasos, coordenadas x,y) con probabilidades asociadas.
- Inferencia en streaming: procesa agentes de forma secuencial, permitiendo arranque en frío o en caliente.
- Cuantización amigable: diseñado para calibración, QAT y despliegue en hardware con precisión reducida (HBM).
- Codificación relativa query-centric: modela relaciones agente-mapa y agente-agente de forma eficiente.
- Sin dependencias de grafos externos: elimina `torch_geometric`/`torch_cluster`, facilitando el despliegue en entornos embebidos.
- Soporte para compilación en chips Horizon J6 (J6M, J6P, J6B) con entrada desde DDR (no desde piramide de imagen).

## Casos de uso

- Conducción autónoma en entornos urbanos: el modelo predice las trayectorias futuras de vehículos, peatones y ciclistas a partir de 5 segundos de historial, permitiendo planificar maniobras seguras con 6 modos de predicción por agente.
- Sistemas avanzados de asistencia al conductor (ADAS): integrado en unidades de procesamiento embebidas como Horizon J6, puede ejecutarse en tiempo real con latencias de 2,65 ms (J6P) y 3,72 ms (J6M), adecuadas para alertas de colisión y frenado de emergencia.
- Robótica móvil: aplicable a robots que necesitan anticipar el movimiento de personas u otros robots en entornos compartidos, gracias a su capacidad de procesar múltiples agentes simultáneamente.
- Simulación de tráfico: puede usarse para generar comportamientos realistas de agentes en simuladores de conducción, alimentando escenarios de prueba para sistemas de planificación.
- Vehículos de reparto autónomo: en plataformas con recursos limitados, el modelo ofrece predicción multimodal con bajo consumo de memoria (32-38 MB en chips J6), viable para flotas comerciales.
- Investigación en predicción de movimiento: sirve como base para estudiar técnicas de cuantización y despliegue eficiente de modelos transformer en hardware embebido, dado que elimina dependencias de grafos y operaciones costosas.

## Benchmarks y rendimiento

La información disponible incluye métricas de precisión y rendimiento medidas con la configuración `march = March.NASH_M` (J6M) y la versión HEAL 0.0.2 / hbdk4-compiler 4.11.11 / horizon_plugin_pytorch 3.3.10.

| March | Metrica | float | calibracion | qat | hbm |
|---|---|---|---|---|---|
| J6M | HitRate | 0.8003 | 0.6817 | 0.7984 | 0.7981 |

| March | latencia (ms) | fps | memoria (DDR, MB) |
|---|---|---|---|
| J6M | 3.72 | 293.43 | 34.80 |
| J6P | 2.65 | 1572.60 | 38.60 |
| J6B | 12.25 | 149.40 | 32.00 |

No se han publicado resultados de benchmarks comparativos con otros modelos de predicción de trayectorias en la información disponible. La métrica HitRate mide el acierto de las trayectorias predichas sobre el ground truth, y se observa una degradación significativa en la versión de calibración (0.6817) frente al float (0.8003), mientras que QAT y HBM mantienen valores cercanos al float.

## Requisitos de hardware

- Diseñado para despliegue en chips Horizon Journey 6: J6M (3.72 ms latencia, 293 FPS), J6P (2.65 ms, 1572 FPS) y J6B (12.25 ms, 149 FPS), con uso de memoria DDR entre 32 y 38 MB.
- No se especifican requisitos de VRAM para GPU; el modelo puede ejecutarse en GPU de propósito general, pero no hay datos de consumo.
- Al ser un modelo de predicción de trayectorias con entrada de escenas (30 agentes, 80 polígonos, 50 puntos por polígono, 10 pasos históricos), el tamaño es moderado (0.3 GB de repo), por lo que es plausible que quepa en GPUs de consumo como RTX 3060 o superiores, aunque no hay confirmación.
- Opciones de despliegue: el modelo está pensado para la toolchain de Horizon OpenExplorer (hbdk4-compiler, horizon_plugin_pytorch), con exportación HBIR y compilación con `input_source=["ddr"]`. No se menciona soporte para vLLM, llama.cpp u Ollama, al no ser un modelo de lenguaje.
- La inferencia en streaming permite arranque en frío o caliente, lo que facilita la integración en sistemas de tiempo real.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|---|
| QCNetOE (OpenExploer) | Transformer query-centric, streaming | no disponible | 10 pasos historicos / 12 futuros | HitRate 0.8003 (float) en J6M | other |
| QCNet (original, CVPR 2023) | Transformer query-centric | no disponible | similar (Argoverse 2) | SOTA en Argoverse 2 (segun paper) | MIT (repo oficial) |
| HiVT | Transformer jerarquico | no disponible | similar | no disponible | MIT (repo) |

No se dispone de datos comparativos directos con otros modelos en la información proporcionada. QCNetOE es una adaptación de QCNet para despliegue cuantizado en hardware Horizon, por lo que su rendimiento en precisión es ligeramente inferior al float original, pero mantiene la arquitectura base. Otras alternativas como HiVT o LaneGCN existen, pero no hay métricas comparables en la información disponible.

## Limitaciones y advertencias

- Licencia "other" no especificada: el uso comercial puede estar restringido; se recomienda contactar con el autor antes de utilizar el modelo en producción.
- La versión de calibración muestra una degradación notable en HitRate (0.6817 frente a 0.8003 en float), lo que indica que la cuantización simple no es suficiente; se requiere QAT o HBM para mantener precisión.
- No se especifican los datos de entrenamiento ni el proceso de validación más allá de la referencia a Argoverse 2 en el tutorial de Horizon; la generalización a otros datasets o entornos no está garantizada.
- El modelo está especializado en predicción de trayectorias y no es un modelo de lenguaje; no soporta tareas de texto, tool calling ni agentes conversacionales.
- La entrada está limitada a 30 agentes, 80 polígonos y 50 puntos por polígono; escenas con más elementos podrían requerir adaptaciones.
- No se proporcionan detalles sobre sesgos o alucinaciones, al ser un modelo geométrico; sin embargo, la predicción multimodal puede generar trayectorias poco realistas en situaciones atípicas no representadas en el entrenamiento.
- El despliegue está orientado a la toolchain de Horizon; su uso en otras plataformas (GPU, CPU) requeriría conversión de pesos y posiblemente pérdida de rendimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OpenExploer/qcnet_oe
- Repositorio oficial de QCNet: https://github.com/ZikangZhou/QCNet
- Paper de QCNet (CVPR 2023): https://openaccess.thecvf.com/content/CVPR2023/papers/Zhou_Query-Centric_Trajectory_Prediction_CVPR_2023_paper.pdf
- Tutorial de entrenamiento de QCNet en Horizon OpenExplorer: https://doc.oe.horizon.auto/3.7.1/en/guide/advanced_content/hat/examples/qcnet.html
- Blog de despliegue en chips J6: https://developer.horizon.auto/blog/10004
- Documentación de Modelzoo de Horizon: https://doc.oe.horizon.auto/3.2.0/en/guide/advanced_content/hat/model_zoo.html
