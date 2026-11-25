# inviolus/VoxHOD

## Resumen

VoxHOD es un detector de personas de tipo CenterNet, anchor-free, disenado especificamente para camaras de dron con vision cenital en misiones de busqueda y rescate. Lo desarrolla el autor independiente inviolus y esta pensado para ejecutarse en microcontroladores de la clase ESP32-S3 y ESP32-P4, con un presupuesto de parametros extremadamente reducido: 136.547 parametros en la variante completa y 37.363 en la variante nano. El modelo marca la posicion de personas en un tile RGB de 160x160 pixeles para que el dron pueda senalar zonas que merecen una inspeccion mas cercana por parte del equipo de rescate.

La relevancia actual del modelo reside en su enfoque TinyML: los pesos int8 ocupan 197 KB en la variante completa y 75 KB en la nano, lo que permite inferencia local a bordo sin depender de conectividad ni de GPU. Se entrena desde cero, sin partir de un backbone preentrenado de gran tamano, y se distribuye como TFLite int8 con cuantizacion consciente del entrenamiento (QAT) en la version recomendada. La version del 23 y 24 de noviembre de 2026 incorpora variantes "heat-only" con salida `[1,40,40,1]` que eliminan los canales de tamano de caja y mejoran la tasa de falsas alarmas.

El modelo se evalua sobre el conjunto de test HERIDAL (3.507 tiles, 372 personas) y sobre WiSARD como prueba de generalizacion a dominio no visto. La licencia CC BY 4.0 permite uso comercial con atribucion. Existe un hermano mayor, VoxScout, basado en EfficientNet-B0, como proyecto separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CenterNet-style, anchor-free, CNN fully convolutional (Keras/TensorFlow Lite) |
| Parametros totales | 136.547 (completa); 37.363 (nano) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada fija 160x160 RGB) |
| Tipos de cuantizacion | int8 (QAT y PTQ); pesos float en `.keras` |
| Idiomas soportados | no disponible (no es modelo de lenguaje) |
| Licencia | CC BY 4.0 |
| Formato de pesos | TFLite int8 (`.tflite`), Keras (`.keras`) |

## Arquitectura y entrenamiento

VoxHOD es una red convolucional completamente fully convolutional con cabeza estilo CenterNet y sin anchors. La entrada es un tile RGB de 160x160 normalizado con `pixel / 127.5 - 1`. La salida clasica es una rejilla de 40x40 (stride 4) con tres canales: el canal 0 es el mapa de calor de centros de persona en `[0,1]`, y los canales 1 y 2 codifican el logaritmo del ancho y alto de la caja en celdas de la rejilla. Las detecciones se obtienen como maximos locales del canal 0 por encima de un umbral configurable.

El modelo se entrena desde cero, sin backbone preentrenado, sobre recortes de 640x640 de fotografias aereas de 4000x3000 reescalados a 160. La variante recomendada `voxhod_qat_int8.tflite` usa cuantizacion consciente del entrenamiento (QAT) sobre la red float. Las variantes "heat-only" del 23 y 24 de noviembre de 2026 eliminan los canales de tamano de caja, dejando una salida `[1,40,40,1]`, lo que permite que la sigmoide del mapa de calor use los 256 niveles int8 completos y se combine con normalizacion focal negativa por tile. Estas variantes se entrenan mediante self-distillation desde un ensemble de tres modelos o mediante Model Soup de tres ramas, sobre el split del 55% o sobre el 100% de HERIDAL segun el fichero.

## Capacidades

- Deteccion de personas en imagenes aereas cenitales (vista nadir) sobre tiles de 160x160 RGB.
- Salida de mapa de calor de centros de persona y, en las variantes no heat-only, tamano de caja en celdas de rejilla.
- Inferencia int8 en microcontroladores de la clase ESP32-S3 y ESP32-P4 (variantes nano y completa respectivamente).
- Umbral de deteccion ajustable en tiempo de ejecucion para intercambiar recall por falsas alarmas.
- Variantes heat-only con salida mas simple y mejor calibracion de falsos positivos.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un detector de objetos puro.

## Casos de uso

- Busqueda y rescate con dron: el modelo procesa tiles de 160x160 a bordo del dron y marca zonas con posible presencia humana para que el operador o el equipo de rescate las inspeccione con mayor resolucion. Es adecuado por su tamano (197 KB) y su ejecucion en microcontrolador sin GPU.
- Vigilancia de areas remotas con drones de bajo coste: al caber en un ESP32-S3, permite desplegar deteccion de personas en plataformas sin capacidad de computo dedicada ni enlace de datos permanente.
- Triaje previo en pipelines de imagen aerea: usar VoxHOD como primera etapa que filtra tiles candidatos y alimenta un modelo mayor (por ejemplo VoxScout) solo en las regiones con detecciones, reduciendo coste computacional.
- Sistemas de alerta temprana en entornos de montana o costeros: integrado en un dron con telemetria, el modelo puede emitir avisos cuando detecta personas en zonas de riesgo con falsas alarmas controladas mediante el umbral.
- Investigacion en TinyML: referencia reproducible para estudiar QAT, self-distillation y Model Soup en regimenes de decenas de miles de parametros sobre datos aereos.
- Despliegue en hardware embebido con restricciones de energia: la variante nano (75 KB, 37.363 parametros) permite inferencia a muy baja potencia en dispositivos con bateria limitada.
- Prototipado rapido de deteccion aerea: el ejemplo en Python con TFLite del model card permite validar el modelo sobre tiles propios antes de portarlo al microcontrolador.

## Benchmarks y rendimiento

Resultados sobre el conjunto de test HERIDAL (3.507 tiles, 372 personas). Una deteccion cuenta como acierto si su centro cae dentro de la caja de la persona expandida una celda de rejilla.

| Fichero int8, umbral | Recall | Precision | Falsas alarmas por tile |
|---|---:|---:|---:|
| v3 QAT, 0.30 | 76,6% | 32,5% | 0,17 |
| v3 QAT, 0.20 | 83,9% | 20,4% | 0,35 |
| v3 QAT, 0.10 | 88,7% | 7,7% | 1,12 |
| nano PTQ, 0.30 | 72,3% | 25,8% | 0,22 |
| nano PTQ, 0.20 | 81,2% | 12,7% | 0,59 |
| nano PTQ, 0.10 | 89,5% | 4,8% | 1,87 |

Variantes heat-only (23 y 24 de noviembre de 2026):

| Fichero | Recall | Falsas alarmas por tile | Notas |
|---|---:|---:|---|
| nano HSD (55% split) | no disponible en tabla | no disponible | self-distilled, 74,7 KB |
| nano HSOUP (55% split) | 68,8% @ 0,5 FA | 0,5 | mejor generalizacion en WiSARD |
| nano v2 HSD (100% HERIDAL) | no disponible | 0,225 @ 80% recall | −55% FA frente a nano original |
| nano v2 Soup (100% HERIDAL) | 84,7% @ t=0,20; 81,2% @ 0,3 FA | no disponible | mayor recall nano |
| v4 HSD (100% HERIDAL) | 82,0% @ 0,3 FA; 81,2% en 8-16 px | 0,3 | mayor recall global a 0,3 FA |

Generalizacion a dominio no visto (WiSARD): el recall cae al 61% (v3) y 62% (nano). En terreno no visto (NOMAD) las falsas alarmas por tile suben de 0,34 a 1,29. En ESP32-P4 el modelo encuentra personas en tiles reales a la misma tasa que en PC; las variantes heat-only aun no se han medido en ese hardware.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo corre en CPU o microcontrolador. Los pesos int8 ocupan 197 KB (completa) y 75 KB (nano), mas el buffer de activaciones.
- GPU recomendadas: no necesarias. Cualquier GPU consumer sirve para entrenamiento o evaluacion, pero la inferencia objetivo es en CPU o MCU.
- Cabe en consumer GPU: si, con margen amplisimo; tambien en Raspberry Pi y en microcontroladores ESP32-S3 y ESP32-P4.
- Opciones de despliegue: TensorFlow Lite (int8), TFLite Micro para ESP32, Keras para el modelo float. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de vision).
- Latencia y throughput: no se publican cifras concretas de latencia; el model card indica que en ESP32-P4 el modelo encuentra personas en tiles reales a la misma tasa que en PC.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Licencia | Objetivo |
|---|---|---|---|---|
| VoxHOD (completa) | 136.547 | 160x160 RGB | CC BY 4.0 | Deteccion de personas en MCU (ESP32) |
| VoxHOD (nano) | 37.363 | 160x160 RGB | CC BY 4.0 | Deteccion de personas en MCU de baja potencia |
| VoxScout | no disponible (EfficientNet-B0) | no disponible | no disponible | Deteccion de personas en dron, mayor capacidad |
| YOLO nano (familia generica) | millones | variable | variable (AGPL o similar) | Deteccion de objetos generica |

VoxScout es el hermano mayor del mismo autor, basado en EfficientNet-B0 y orientado a mayor capacidad de computo. La comparacion con detectores genericos tipo YOLO nano no es directa porque VoxHOD esta optimizado para vista cenital y para un presupuesto de parametros tres ordenes de magnitud menor.

## Limitaciones y advertencias

- Sesgo de dominio: el modelo se entrena sobre HERIDAL y su rendimiento cae notablemente en dominios no vistos (recall del 61-62% en WiSARD) y las falsas alarmas se multiplican en terreno no visto (de 0,34 a 1,29 por tile en NOMAD).
- Especifico para vista cenital: no esta disenado para angulos oblicuos ni para camaras en tierra; su uso fuera de ese regimen no esta validado.
- Riesgo de falsos positivos y negativos: con umbrales bajos el recall sube pero las falsas alarmas por tile crecen (1,12 a 0,10 en v3); la eleccion de umbral es critica en produccion.
- Resolucion limitada: la entrada es de 160x160, por lo que personas de pocos pixeles (8-16 px) son el regimen mas dificil y el recall en ese rango es menor.
- Sin datos de idiomas ni de texto: no es un modelo de lenguaje; no soporta tool calling, agentes ni razonamiento.
- Licencia CC BY 4.0: permite uso comercial con atribucion; conviene revisar los terminos exactos y la atribucion requerida.
- Las variantes heat-only no se han medido aun en ESP32-P4, por lo que su rendimiento en hardware objetivo esta pendiente de validacion.
- El repo tiene un tamano de 0.0 GB reportado, lo que puede indicar ficheros ligeros o metadatos incompletos; verificar los artefactos antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/inviolus/VoxHOD
- Codigo y detalles de entrenamiento: https://github.com/ErdemWilkinson/VoxHOD
- Modelo hermano VoxScout: https://huggingface.co/inviolus/VoxScout
