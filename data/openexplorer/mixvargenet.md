# OpenExplorer/mixvargenet

## Resumen

MixVarGENet es un backbone ligero de clasificacion de imagenes desarrollado por Horizon Robotics, optimizado especificamente para la serie de chips Journey J6. Emplea bloques de variantes mixtas (mixvarge) organizados en cinco etapas con reduccion progresiva de resolucion hasta stride 32: las dos primeras etapas usan bloques base f2/f4, mientras que las dos ultimas usan bloques f2_gb16 con grupos. La evolucion de canales es 32→32→64→96→160.

El modelo esta disenado para despliegue en hardware de borde mediante la cadena de herramientas OpenExplorer (heal, hbdk4-compiler, horizon_plugin_pytorch). Alcanza una precision del 71,6% en ImageNet en formato float y 71,16% tras calibracion PTQ, con una latencia de 0,36 ms en J6M y 0,33 ms en J6P. Su relevancia radica en la estrecha integracion con el silicio Journey, logrando mas de 9000 FPS en J6P con un pico de memoria DDR de solo 6,40 MB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone CNN ligero con bloques de variantes mixtas (mixvarge) |
| Parametros totales | no disponible |
| Parametros activos | N/A (no es MoE) |
| Longitud de contexto | N/A (modelo de vision, no textual) |
| Tipos de cuantizacion | Calibracion PTQ, modo HBM (sin etapa QAT) |
| Idiomas soportados | N/A (modelo de vision) |
| Licencia | other |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

MixVarGENet es un backbone de clasificacion compuesto por cinco etapas de bloques mixvarge con downsampling progresivo (stride 2/4/8/16/32). Las etapas 1 y 2 emplean bloques base f2 y f4; las etapas 4 y 5 utilizan bloques f2_gb16 con grupos (group blocks). El cuello (neck) repite la misma estructura de cinco etapas con los tipos mixvarge_f2, mixvarge_f4 y mixvarge_f2_gb16, con canales 32→32→64→96→160. La cabeza de clasificacion es un fully connected integrado que produce logits de 1000 clases.

El entrenamiento utiliza la funcion de perdida CEWithLabelSmooth (cross-entropy con label smoothing) sobre el dataset ImageNet. No se especifican en la informacion disponible el numero de epocas, el tamano del dataset ni el proceso de entrenamiento detallado. El despliegue se realiza con la cadena OpenExplorer de Horizon Robotics (heal 0.0.2, hbdk4-compiler 4.11.11, horizon_plugin_pytorch 3.3.10) y la herramienta AI Benchmark para evaluacion de precision y rendimiento.

## Capacidades

- Clasificacion de imagenes en 1000 clases (ImageNet) a resolucion 224×224.
- Extraccion de caracteristicas como backbone para tareas de vision por computador (deteccion, segmentacion, BEV).
- Inferencia de alta velocidad en hardware Horizon Journey J6: 5464,88 FPS (J6M) y 9374,11 FPS (J6P) con 8 hilos en un solo nucleo.
- Latencia de inferencia muy baja: 0,36 ms (J6M) y 0,33 ms (J6P) en modo mono-hilo mono-nucleo.
- Consumo de memoria DDR reducido: 6,40 MB de pico.
- Soporte de cuantizacion PTQ (calibracion) y modo HBM para despliegue eficiente en produccion.

## Casos de uso

- Conduccion autonoma: el modelo puede servir como backbone para deteccion de objetos, segmentacion y tareas de percepcion BEV en vehiculos con chips Journey J6, aprovechando su latencia de 0,36 ms y su integracion con el hardware.
- Camaras inteligentes de borde: su alta tasa de FPS (mas de 9000 en J6P) permite procesar multiples flujos de video en tiempo real en dispositivos con recursos limitados.
- Vision industrial: clasificacion de piezas o defectos en lineas de produccion con requisitos de latencia estrictos, donde la inferencia en chip de borde evita la dependencia de la nube.
- Vigilancia y seguridad: clasificacion de escenas o eventos en tiempo real en dispositivos embebidos con consumo energetico reducido.
- Robotica: extraccion de caracteristicas visuales para navegacion y manipulacion en robots autonomos con hardware Horizon.
- Investigacion en eficiencia de redes: estudio de arquitecturas ligeras con bloques de variantes mixtas y su comportamiento bajo cuantizacion PTQ en silicio especifico.

## Benchmarks y rendimiento

El modelo reporta precision en ImageNet (march J6M) y metricas de rendimiento en chips Journey:

| March | Precision (float) | Precision (calibracion) | Precision (HBM) |
|---|---|---|---|
| J6M | 0,716 | 0,7116 | 0,7116 |

| March | Latencia (ms) | FPS | Memoria DDR (pico) |
|---|---|---|---|
| J6M | 0,36 | 5464,88 | 6,40 MB |
| J6P | 0,33 | 9374,11 | 6,40 MB |
| J6B | no disponible | no disponible | no disponible |

Nota: la precision se mide con march = March.NASH_M (J6M); esta tarea no tiene etapa QAT. Los datos de rendimiento se obtienen con 8 hilos en un solo nucleo (FPS) y mono-hilo mono-nucleo (latencia).

## Requisitos de hardware

- Disenado exclusivamente para chips Horizon Robotics Journey serie J6 (J6M, J6P, J6B).
- Memoria DDR pico: 6,40 MB.
- Latencia: 0,36 ms (J6M) y 0,33 ms (J6P) en modo mono-hilo.
- FPS: 5464,88 (J6M) y 9374,11 (J6P) con 8 hilos en un solo nucleo.
- No es un modelo para GPU de consumo general; requiere la cadena de herramientas OpenExplorer (heal, hbdk4-compiler, horizon_plugin_pytorch) para su despliegue.
- No se dispone de informacion sobre despliegue en vLLM, llama.cpp, Ollama o TGI, ya que es un modelo de vision para hardware especifico.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos comparativos con otros backbones ligeros como MobileNet, EfficientNet-Lite o ShuffleNet. El modelo esta disenado especificamente para la serie de chips Journey J6 de Horizon Robotics, por lo que su comparativa directa con modelos genericos para GPU o CPU no es posible sin datos adicionales.

## Limitaciones y advertencias

- Modelo de clasificacion de imagenes exclusivamente; no genera texto ni soporta tareas generativas.
- Limitado a 1000 clases de ImageNet en su salida por defecto.
- Requiere hardware Horizon Journey J6 para alcanzar las metricas de rendimiento publicadas; su uso en otras plataformas no esta documentado.
- La licencia es "other", por lo que se debe verificar las condiciones de uso comercial con el autor.
- No se dispone de informacion sobre sesgos del dataset de entrenamiento.
- El rendimiento en J6B no esta disponible para este modelo.
- La precision cae ligeramente tras cuantizacion (de 0,716 a 0,7116), lo que debe tenerse en cuenta en despliegues con PTQ.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OpenExplorer/mixvargenet
- Documentacion OpenExplorer (AI Benchmark): https://toolchain.d-robotics.cc/en/guide/ucp/runtime/ai_benchmark.html
- Documentacion Horizon OpenExplorer (AI Benchmark): https://doc.oe.horizon.auto/en/guide/model_deployment/board_deployment/ai_benchmark.html
- Benchmark J6P/H: https://doc.oe.horizon.auto/en/guide/samples/benchmark/j6ph_benchmark.html
- Foro D-Robotics sobre MixVarGENet: https://forum.d-robotics.cc/t/topic/25905
- Repositorio hobot_bev (relacionado, BEV): https://github.com/D-Robotics/hobot_bev
- Blog de despliegue en chips J6: https://developer.horizon.auto/blog/14084
