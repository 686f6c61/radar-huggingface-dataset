# OpenExplorer/qcnet_oe

## Resumen

QCNetOE es una variante del modelo QCNet (Query-Centric Trajectory Prediction) desarrollada por Horizon Robotics para la predicción de trayectorias multimodales en escenarios de conducción autónoma. A diferencia del QCNet original, esta versión elimina las dependencias de `torch_geometric` y `torch_cluster`, y reduce al mínimo las operaciones de indexado, gather y scatter, lo que la hace especialmente adecuada para cuantización y despliegue en hardware de bajo consumo como los chips de la serie Horizon J6.

El modelo codifica las relaciones relativas de cada agente con el mapa circundante y con otros agentes mediante una arquitectura centrada en consultas (query-centric), procesando los estados ocultos del codificador agente por agente en modo streaming. El decodificador genera seis trayectorias candidatas por agente con sus respectivas probabilidades, cubriendo un horizonte de predicción de 6 segundos (12 pasos) a partir de un historial de 5 segundos (10 pasos). Su relevancia actual radica en que ofrece una solución práctica para despliegue en tiempo real en vehículos autónomos y sistemas ADAS, con métricas de latencia y rendimiento validadas en hardware Horizon J6.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer query-centric con codificador de mapa y agente en streaming (`QCNetOEMapEncoder` + `QCNetOEAgentEncoderStream`) y decodificador multimodal (`QCNetOEDecoder`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de prediccion de trayectorias; usa 10 pasos de historia, 5 s, y predice 12 pasos, 6 s) |
| Tipos de cuantizacion | float, calibracion (PTQ), QAT, HBM (segun tabla de precision) |
| Idiomas soportados | no aplica (modelo no linguistico) |
| Licencia | other (licencia propietaria de Horizon Robotics) |
| Formato de pesos | no disponible (formato propietario para despliegue en chips J6; se menciona exportacion HBIR) |

## Arquitectura y entrenamiento

QCNetOE mantiene el paradigma query-centric de QCNet: cada agente se representa como una consulta que atiende a los polígonos del mapa y a los demás agentes mediante mecanismos de atención, utilizando codificación posicional relativa espacio-temporal. La variante OE introduce un flujo de inferencia streaming (`stream_infer=True`) que procesa los estados ocultos del codificador agente por agente, reduciendo el pico de memoria y facilitando la cuantización. Se eliminan las dependencias de `torch_geometric`/`torch_cluster` y la mayoría de operaciones `index/gather/scatter`, lo que simplifica la compilación para hardware embebido.

El modelo se entrena sobre el dataset Argoverse 2, como se indica en el tutorial oficial de Horizon OpenExplorer. La configuración por defecto incluye `hidden_dim=128`, `num_heads=8`, `head_dim=16`, `num_freq_bands=32`, `num_map_layers=1`, `num_agent_layers=1`, `time_span=2` y `dropout=0.1`. El preprocesado construye representaciones relativas de agentes y mapa, mientras que el postprocesado devuelve coordenadas (x, y) para cada paso futuro. No se dispone de información sobre el número de tokens de entrenamiento ni sobre el uso de RLHF o DPO, ya que no es un modelo de lenguaje.

## Capacidades

- Prediccion de trayectorias multimodales: genera 6 trayectorias candidatas por agente con probabilidades asociadas, cubriendo 12 pasos futuros (6 segundos).
- Procesamiento de escenas completas: maneja hasta 30 agentes, 80 poligonos de mapa con 50 puntos cada uno, y 10 pasos de historia por agente.
- Inferencia streaming: soporta arranque en frio y en caliente (`quant_infer_cold_start`), lo que permite procesar escenas de forma incremental sin necesidad de reiniciar el estado interno.
- Cuantizacion amigable: elimina operaciones problematicas para PTQ/QAT, manteniendo una precision cercana al modelo flotante (HitRate 0.7984 en QAT frente a 0.8003 en float, segun la tabla de precision).
- Optimizado para despliegue en chips Horizon J6: compilacion con HBIR, soporte de VPU y entrada desde DDR (no desde imagen piramidal, a diferencia de tareas de vision).
- Sin dependencias externas de grafos: no requiere `torch_geometric` ni `torch_cluster`, simplificando el entorno de despliegue.

## Casos de uso

- Conduccion autonoma en entornos urbanos: el modelo predice las trayectorias futuras de vehiculos, peatones y ciclistas en intersecciones complejas, permitiendo al planificador anticipar maniobras y evitar colisiones. Su inferencia streaming y baja latencia (3.72 ms en J6M) lo hacen apto para ciclos de planificacion de 10-20 Hz.
- Sistemas avanzados de asistencia al conductor (ADAS): integrado en unidades de control electronico, puede alertar al conductor sobre posibles trayectorias conflictivas de otros agentes, mejorando la seguridad en autopistas y zonas urbanas.
- Robotica movil en entornos compartidos: robots de reparto o plataformas logisticas pueden usar las predicciones multimodales para planificar rutas que eviten areas con alta incertidumbre de movimiento de personas u otros robots.
- Simulacion de trafico para validacion: el modelo genera multiples trayectorias plausibles que pueden alimentar simuladores de escenarios para probar sistemas de planificacion en condiciones variadas, reduciendo la necesidad de datos reales.
- Evaluacion de seguridad de vehiculos autonomos: las probabilidades de cada trayectoria permiten cuantificar el riesgo de escenarios concretos, facilitando la certificacion de sistemas en entornos controlados.
- Planificacion de movimiento en tiempo real: combinado con un modulo de decision, el modelo proporciona las hipotesis de movimiento necesarias para seleccionar la maniobra mas segura en cada instante, gracias a su capacidad de procesar 30 agentes simultaneamente.

## Benchmarks y rendimiento

La model card no incluye benchmarks comparativos con otros modelos de prediccion de trayectorias, pero proporciona metricas de precision y rendimiento medidas con la configuracion `March.NASH_M` (J6M) y las herramientas HEAL 0.0.2 / hbdk4-compiler 4.11.11 / horizon_plugin_pytorch 3.3.10.

| Precision (HitRate, J6M) | float | calibracion | QAT | HBM |
|---|---|---|---|---|
| J6M | 0.8003 | 0.6817 | 0.7984 | 0.7981 |

| Rendimiento | latencia (ms) | FPS | memoria (DDR, MB) |
|---|---|---|---|
| J6M | 3.72 | 293.43 | 34.80 |
| J6P | 2.65 | 1572.60 | 38.60 |
| J6B | 12.25 | 149.40 | 32.00 |

Nota: la latencia se mide con un solo nucleo y un solo hilo; el FPS se mide con un nucleo y ocho hilos. No se han publicado resultados de benchmarks estandar (como MMLU, HumanEval, etc.) porque el modelo no es de lenguaje.

## Requisitos de hardware

- Disenado exclusivamente para los chips de la serie Horizon J6 (J6M, J6P, J6B). No esta pensado para GPUs de consumo ni para servidores x86.
- Memoria DDR maxima observada: entre 32 MB y 38.6 MB segun la variante del chip, lo que permite su integracion en sistemas embebidos con memoria limitada.
- Latencia de inferencia: 2.65 ms en J6P, 3.72 ms en J6M y 12.25 ms en J6B (medida con un solo nucleo y un solo hilo), suficiente para aplicaciones en tiempo real.
- FPS: hasta 1572.6 en J6P con ocho hilos, lo que permite procesar multiples escenas simultaneamente si es necesario.
- Despliegue: se realiza mediante la herramienta AI Benchmark de Horizon OpenExplorer, con compilacion HBIR y soporte de VPU. No se menciona compatibilidad con vLLM, llama.cpp u otros frameworks de inferencia, ya que no es un modelo de lenguaje.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision (HitRate) | Licencia | Despliegue |
|---|---|---|---|---|---|
| QCNetOE (este) | no disponible | 5 s historia + 6 s prediccion | 0.8003 (float, J6M) | other (Horizon) | Chips Horizon J6 |
| QCNet original | no disponible | 5 s historia + 6 s prediccion | no disponible | MIT (repo oficial) | GPU / CPU, requiere torch_geometric |
| MultiPath++ | no disponible | 5 s historia + 6 s prediccion | no disponible | no disponible | GPU |

No se dispone de datos publicos de rendimiento comparativo entre QCNetOE y otros modelos de prediccion de trayectorias en los mismos conjuntos de datos. La principal diferencia con QCNet original es la eliminacion de dependencias de grafos y la optimizacion para cuantizacion y despliegue en hardware Horizon J6, a costa de una ligera perdida de precision en modo cuantizado (HitRate 0.7984 en QAT frente a 0.8003 en float).

## Limitaciones y advertencias

- Licencia propietaria ("other"): el uso comercial y la redistribucion estan sujetos a los terminos de Horizon Robotics. No es un modelo de codigo abierto estandar.
- Entrenamiento limitado a Argoverse 2: el modelo puede no generalizar bien a otros dominios geograficos, condiciones de trafico o tipos de agentes no representados en el dataset.
- Ventana de historia fija: utiliza exactamente 10 pasos de historia (5 segundos). Escenarios que requieran mas contexto temporal no pueden procesarse sin modificar la arquitectura.
- Sin soporte de vision ni lenguaje: es un modelo puramente de prediccion de trayectorias; no procesa imagenes ni texto, y no es adecuado para tareas de generacion de contenido.
- Dependencia del hardware Horizon J6: las metricas de rendimiento y precision estan validadas solo en los chips J6. Su uso en otras plataformas requeriria adaptaciones no documentadas.
- La calibracion PTQ muestra una caida notable de precision (HitRate 0.6817 frente a 0.8003 en float), por lo que se recomienda usar QAT o HBM para aplicaciones criticas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OpenExplorer/qcnet_oe
- Repositorio oficial de QCNet: https://github.com/ZikangZhou/QCNet
- Paper original (CVPR 2023): https://openaccess.thecvf.com/content/CVPR2023/papers/Zhou_Query-Centric_Trajectory_Prediction_CVPR_2023_paper.pdf
- Tutorial de entrenamiento de QCNet en Horizon OpenExplorer: https://doc.oe.horizon.auto/3.7.0/en/guide/advanced_content/hat/examples/qcnet.html
- Guia de AI Benchmark de Horizon OpenExplorer: https://doc.oe.horizon.auto/en/guide/model_deployment/board_deployment/ai_benchmark.html
- Blog de Horizon sobre despliegue en chips J6: https://developer.horizon.auto/blog/14089
