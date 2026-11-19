# anguoyang/depth-anything-v2-qcs6490

## Resumen

Depth Anything V2 es un modelo de estimación de profundidad monocular desarrollado por el equipo de Depth Anything (ByteDance, TikTok). Esta ficha concreta, publicada por el usuario `anguoyang`, no contiene pesos del modelo: es una medición independiente de terceros del rendimiento de Depth Anything V2 sobre el SoC Qualcomm QCS6490, dentro de un barrido comparativo de 28 modelos y 14 categorías ejecutado con un arnés uniforme. El repositorio de Hugging Face actúa, por tanto, como registro de benchmarks y metodología, no como distribución del modelo en sí.

La relevancia de esta entrada es práctica para quien despliegue visión por computador en hardware embebido Qualcomm: aporta un punto de referencia fp32 (ONNX compilado con QNN, opciones por defecto de AI Hub) medido en el kit Dragonwing RB3 Gen 2 Vision Kit. El resultado publicado es de 1.589,6 ms por inferencia sobre una imagen de 1 × 3 × 518 × 518 píxeles, produciendo un mapa de profundidad relativa.

Conviene subrayar que ese número no es directamente comparable con las entradas de `perf.yaml` (versión 0.66.0) del proyecto `qai-hub-models`, que recogen otras precisiones y runtimes para el mismo dispositivo (la más rápida, 85,6 ms). La diferencia se debe al protocolo: aquí se mide fp32 sin cuantización explícita, con compilación por defecto y perfilado de un único grafo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la informacion proporcionada (modelo de estimacion de profundidad monocular; el ONNX exportado procede de la definicion `depth_anything_v2` de `qai-hub-models` 0.66.0) |
| Parametros totales | no disponible (el artefacto ONNX exportado ocupa 99.118.076 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada fija de 1 × 3 × 518 × 518) |
| Tipos de cuantizacion | fp32 en esta medicion; el autor indica que no se aplico cuantizacion explicita. Otras precisiones existen en `perf.yaml` upstream, pero no se detallan |
| Idiomas soportados | no aplica (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | MIT (licencia del modelo upstream, segun la model card); la licencia de esta ficha de medicion no se especifica |
| Formato de pesos | ONNX (exportado desde `qai-hub-models` 0.66.0); no se publican pesos ni artefactos compilados en este repositorio |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna ni el proceso de entrenamiento de Depth Anything V2; solo se indica que es un modelo de estimacion de profundidad monocular y que el grafo exportado proviene de la definicion incluida en `qai-hub-models` 0.66.0. No se especifican numero de tokens de entrenamiento, composicion del dataset ni uso de RLHF/DPO, lo que es coherente con un modelo de vision supervisado y no con un LLM.

El detalle tecnico relevante de esta entrada es el pipeline de despliegue: exportacion a ONNX, compilacion con Qualcomm AI Hub (QNN) usando las opciones por defecto y perfilado de un unico grafo mediante `submit_inference_job(..., profile=True)`. La metrica reportada es `execution_summary.estimated_inference_time`, es decir, una estimacion por grafo y no la latencia extremo a extremo de una aplicacion. El autor documenta un fallo inicial en la exportacion por alimentar las entradas en formato channel-last (NHWC), resuelto solicitando channel-first (NCHW), tras lo cual la exportacion funciono sin cambios. Los identificadores de trabajo son `jp2z1d8rp` (compilacion) y `jpyyl2e8p` (perfilado).

## Capacidades

- Estimacion de profundidad monocular a partir de una unica imagen RGB de 1 × 3 × 518 × 518 píxeles.
- Salida de mapa de profundidad relativa (no se especifica si existe variante metrica).
- Ejecucion en hardware embebido Qualcomm mediante el runtime QNN sobre el SoC QCS6490.
- Exportacion a ONNX e integracion en el flujo de Qualcomm AI Hub.
- No se documentan capacidades de tool calling, agentes, razonamiento multietapa, multilingue, vision-lenguaje, audio ni modo de razonamiento extendido, dado que es un modelo puramente visual.

## Casos de uso

- Robotica movil y navegacion sobre plataformas con QCS6490: el mapa de profundidad relativa permite estimar distancias a obstaculos en tiempo casi interactivo (aprox. 1,6 s por fotograma en fp32), suficiente para planificacion de trayectorias a baja frecuencia o para fusion con otros sensores.
- Vision estereo asistida o pseudo-LiDAR de bajo coste: sustituir un sensor de profundidad dedicado por una camara RGB y este modelo en el kit RB3 Gen 2, reduciendo BOM en drones, AGV o robots de servicio.
- Realidad aumentada y efectos de desenfoque de fondo: generar mapas de profundidad para segmentacion por capas en aplicaciones de camara y edicion, con la ventaja de ejecutarse en el propio dispositivo sin enviar imagenes a la nube.
- Inspeccion industrial y metrologia aproximada: reconstruccion de relieve en lineas de fabricacion donde se requiere privacidad de datos y no se puede depender de un servicio externo.
- Prototipado y seleccion de hardware: el dato de 1.589,6 ms en fp32 sirve para dimensionar el presupuesto de latencia y decidir si conviene pasar a una precision cuantizada antes de comprometerse con un diseno.
- Reproducibilidad de benchmarks: el repositorio aporta metodologia e identificadores de trabajo que permiten a otros equipos replicar la medicion dentro del barrido `qcs-bench` y comparar con los otros 27 modelos del estudio.
- Vehiculos y sistemas de asistencia al conductor de bajo consumo: deteccion de obstaculos y estimacion de distancia relativa en modulos de camara con SoC de gama media.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Tiempo de inferencia estimado | 1.589,6 ms (1.589.581 µs) |
| Entrada | 1 × 3 × 518 × 518 |
| Salida | mapa de profundidad relativa |
| Dispositivo | Dragonwing RB3 Gen 2 Vision Kit (QCS6490) |
| Runtime | QNN |
| Precision | fp32 ONNX, compilacion por defecto de AI Hub, sin cuantizacion explicita |
| Fecha de medicion | 2026-11-19 |
| Tamano del ONNX exportado | 99.118.076 bytes |
| Referencia upstream en `perf.yaml` 0.66.0 | 85,6 ms para la variante mas rapida (otra precision/runtime; no comparable directamente) |

No se han publicado resultados de benchmarks de calidad (por ejemplo, metricas de error de profundidad como AbsRel o RMSE) en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo se ejecuta en el NPU/SoC del QCS6490, no en GPU dedicada. No se especifica el consumo de memoria del acelerador.
- GPU recomendadas: no disponibles para esta ficha. El hardware de referencia es el kit Dragonwing RB3 Gen 2 Vision Kit con SoC Qualcomm QCS6490.
- Cabe en GPU de consumo: no disponible; el artefacto ONNX de 99 MB es manejable en cualquier GPU moderna, pero no se han medido latencias en ese escenario.
- Opciones de despliegue: Qualcomm AI Hub con runtime QNN (metodo empleado); el ONNX exportado podria ejecutarse en otros runtimes, pero no se documenta.
- Latencia y throughput: 1.589,6 ms por inferencia en fp32 sobre QCS6490 (perfil de un unico grafo, no latencia extremo a extremo). Para referencia, `perf.yaml` upstream reporta 85,6 ms en la variante mas rapida con otra precision/runtime.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Hardware de referencia | Latencia publicada | Licencia |
|---|---|---|---|---|---|
| Depth Anything V2 (esta ficha) | Estimacion de profundidad monocular | 1 × 3 × 518 × 518 | QCS6490, QNN, fp32 | 1.589,6 ms | MIT |
| Depth Anything V2 (entrada `perf.yaml` 0.66.0, variante mas rapida) | Estimacion de profundidad monocular | no disponible | QCS6490, otra precision/runtime | 85,6 ms | MIT |
| Otros modelos del barrido `qcs-bench` | 14 categorias, 28 modelos | no disponible | QCS6490 | no disponible en esta ficha | no disponible |

No se dispone de datos de otros modelos de profundidad monocular (MiDaS, Depth Pro, etc.) en la informacion proporcionada para establecer una comparativa de calidad o latencia.

## Limitaciones y advertencias

- El repositorio no contiene pesos ni artefactos compilados; solo publica numeros y metodologia. No es utilizable como distribucion del modelo.
- La cifra de 1.589,6 ms es una estimacion por grafo obtenida con `execution_summary.estimated_inference_time`, no una latencia extremo a extremo de aplicacion; el rendimiento real en produccion puede diferir.
- El resultado corresponde a fp32 sin cuantizacion explicita y con opciones de compilacion por defecto; no es comparable con las entradas de `perf.yaml` upstream (85,6 ms en la variante mas rapida).
- La salida es un mapa de profundidad relativa, no metrica; para aplicaciones que requieran distancias absolutas sera necesario calibrar o combinar con otra fuente.
- La entrada esta fijada a 518 × 518; no se documenta comportamiento con otras resoluciones o relaciones de aspecto.
- No se detallan sesgos del modelo, tasas de alucinacion ni limitaciones por idioma (no aplica al ser un modelo de vision).
- La licencia MIT se atribuye al modelo upstream segun la model card; la licencia aplicable a esta ficha de medicion no se especifica, por lo que conviene verificar antes de reutilizar los datos con fines comerciales.
- El autor advierte de un fallo previo de exportacion por formato de entrada NHWC; quien replique el proceso debe solicitar NCHW.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/anguoyang/depth-anything-v2-qcs6490
- Coleccion de mediciones `qcs-model-zoo`: https://github.com/anguoyang/qcs-model-zoo
- Barrido completo `qcs-bench`: https://github.com/anguoyang/qcs-bench
- Definicion del modelo en `qai-hub-models` (version 0.66.0, `depth_anything_v2`): no disponible como enlace directo en la informacion proporcionada
- Model card upstream de Depth Anything V2: no disponible en la informacion proporcionada
