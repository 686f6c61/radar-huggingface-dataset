# inviolus/voxOCR

## Resumen

VoxOCR (denominado internamente VoxHOD en su model card) es un detector de personas de tipo CenterNet, anchor-free, disenado especificamente para camaras cenitales de drones en misiones de busqueda y rescate. Lo desarrolla el autor independiente inviolus y esta pensado para ejecutarse en microcontroladores de la clase ESP32-S3, con un modelo principal de 136.547 parametros y 197 KB en TFLite int8, y una variante nano de 37.363 parametros y 75 KB. El modelo toma teselas RGB de 160x160 pixeles y produce un mapa de calor de 40x40 que marca donde hay personas, de modo que un dron pueda senalar zonas que merecen una inspeccion mas cercana por parte del equipo de rescate.

La relevancia de este modelo radica en su enfoque extremo de eficiencia: no es un detector de proposito general, sino una pieza de TinyML entrenada desde cero para una tarea muy concreta (deteccion de personas en vista aerea descendente) y un hardware muy restringido. Frente a alternativas basadas en backbones como EfficientNet-B0 (el propio autor mantiene VoxScout como hermano mayor), VoxOCR prioriza el consumo de memoria y el coste computacional por encima de la precision bruta. Esto lo hace adecuado para inferencia a bordo del dron, sin necesidad de transmitir video a una estacion en tierra.

El modelo se distribuye bajo licencia CC BY 4.0, con pesos en formato Keras (`.keras`) y TFLite (int8 con cuantizacion post-entrenamiento y con entrenamiento consciente de cuantizacion). La model card reporta resultados en el conjunto de test HERIDAL, en un clip externo de WiSARD y en el conjunto NOMAD de terreno no visto, con un recall del 83,9% a umbral 0,2 en HERIDAL y una degradacion notable en terreno no visto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CenterNet-style, anchor-free, CNN |
| Parametros totales | 136.547 (v3); 37.363 (nano) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada 160x160 RGB) |
| Tipos de cuantizacion | int8 (QAT y PTQ), float (Keras) |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | CC BY 4.0 |
| Formato de pesos | `.keras` (float), `.tflite` (int8) |

## Arquitectura y entrenamiento

VoxOCR es un detector CenterNet anchor-free con backbone convolucional propio, entrenado desde cero. La entrada es una tesela RGB de 160x160 pixeles normalizada con `pixel / 127.5 - 1`. La salida es una rejilla de 40x40 con stride 4 y tres canales: el canal 0 es un mapa de calor de centros de persona (0 a 1), y los canales 1 y 2 codifican el logaritmo de la anchura y altura de la caja en celdas de la rejilla. Las detecciones se obtienen como maximos locales del canal 0 por encima de un umbral configurable.

El modelo se distribuye en varias variantes: `voxhod_qat_int8.tflite` (recomendada, v3, con entrenamiento consciente de cuantizacion y cuantizacion completa int8), `voxhod_int8.tflite` (cuantizacion post-entrenamiento del modelo float), `voxhod.keras` (modelo float) y las versiones nano (`voxhod_nano_int8.tflite`, `voxhod_nano.keras`) con la mitad de ancho. La model card no detalla el numero de tokens ni la composicion exacta del dataset de entrenamiento, aunque si indica que solo el 29% de las teselas de entrenamiento estan vacias, frente al 91% de las teselas de test, lo que explica parte del sesgo hacia falsos positivos. El autor mantiene un repositorio de codigo y detalles de entrenamiento en GitHub (ErdemWilkinson/VoxHOD), pero los detalles cuantitativos del dataset no estan disponibles en la informacion proporcionada.

## Capacidades

- Deteccion de personas en imagenes aereas cenitales de 160x160 pixeles, devolviendo posicion y tamano aproximado de la caja de cada persona.
- Salida en rejilla de 40x40 con mapa de calor de centros y regresion de anchura y altura, lo que permite filtrar por umbral de confianza.
- Inferencia en microcontroladores de la clase ESP32 (S3, P4, C6), con presupuesto de memoria medido en el ESP32-P4.
- Variante nano con la mitad de parametros para escenarios con restricciones de memoria mas severas.
- Cuantizacion int8 completa con entrenamiento consciente de cuantizacion (QAT) en la version recomendada.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision general, audio ni modo thinking: es un detector de objetos especializado, no un modelo generativo.
- Capacidades multilingues no aplicables.

## Casos de uso

- Busqueda y rescate con drones: el modelo procesa teselas de 160x160 extraidas de fotogramas de 4000x3000 y marca posibles personas, permitiendo al dron priorizar zonas para inspeccion cercana o para el equipo de rescate, sin transmitir video a tierra.
- Inferencia a bordo en ESP32-S3 o ESP32-P4: al caber en 197 KB (o 75 KB en nano) y tener un arena de memoria medido en el P4, se puede integrar en firmware de dron de bajo coste para deteccion en tiempo real de personas en terreno abierto.
- Triaje de imagenes aereas post-mision: procesar lotes de fotografias cenitales y generar un listado de coordenadas candidatas para revision humana, reduciendo el tiempo de analisis manual.
- Sistemas de alerta temprana en zonas remotas: desplegar el detector en estaciones fijas con camara cenital y microcontrolador para detectar presencia de personas en areas de riesgo (montana, costa, zonas de avalancha).
- Prototipado de pipelines de vision aerea en TinyML: usar el modelo como referencia para evaluar tecnicas de cuantizacion QAT/PTQ y despliegue en microcontroladores antes de escalar a modelos mayores como VoxScout.
- Investigacion en deteccion de personas en vista aerea: el modelo y sus resultados en HERIDAL, WiSARD y NOMAD sirven como linea base reproducible para estudiar el efecto del desbalanceo de teselas vacias y la generalizacion a terreno no visto.
- Integracion en sistemas de conteo de personas en areas abiertas: con umbrales ajustados y post-procesado de maximos locales, puede servir para estimar densidad de personas en imagenes aereas de baja resolucion.

## Benchmarks y rendimiento

Resultados en el conjunto de test HERIDAL (3.507 teselas, 372 personas), con deteccion considerada correcta si el centro cae dentro de la caja de la persona expandida una celda de rejilla:

| Fichero int8, umbral | Recall | Precision | Falsos positivos por tesela |
|---|---:|---:|---:|
| v3 QAT, 0,30 | 76,6% | 32,5% | 0,17 |
| v3 QAT, 0,20 | 83,9% | 20,4% | 0,35 |
| v3 QAT, 0,10 | 88,7% | 7,7% | 1,12 |
| nano PTQ, 0,30 | 72,3% | 25,8% | 0,22 |
| nano PTQ, 0,20 | 81,2% | 12,7% | 0,59 |
| nano PTQ, 0,10 | 89,5% | 4,8% | 1,87 |

Comprobacion externa en un clip de WiSARD (264 fotogramas correlacionados de otra camara, 6.336 teselas, 1.271 personas, nunca visto en entrenamiento):

| Fichero int8, umbral | Recall | Precision | Falsos positivos por tesela |
|---|---:|---:|---:|
| v3 QAT, 0,20 | 61,3% | 19,1% | 0,52 |
| nano PTQ, 0,20 | 62,2% | 13,4% | 0,81 |

Falsos positivos en terreno no visto (NOMAD, 4.000 teselas vacias, umbral 0,2):

| Fichero int8 | HERIDAL teselas vacias | NOMAD total | 10 m | 30 m | 50 m | 70 m | 90 m |
|---|---:|---:|---:|---:|---:|---:|---:|
| v3 | 0,34 | 1,29 | 1,10 | 1,11 | 1,39 | 1,35 | 1,49 |
| nano | 0,60 | 1,43 | 1,34 | 1,25 | 1,47 | 1,54 | 1,56 |

Analisis de falsos positivos de v3 en HERIDAL a umbral 0,2: el 89% de los falsos positivos ocurren en teselas sin nadie; solo el 29% de las teselas de entrenamiento estan vacias frente al 91% en test; las personas de 8 a 16 px de altura se detectan el 77% de las veces, y las mas grandes el 90%.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido tradicional; el modelo esta pensado para microcontroladores. El arena de memoria se midio en el ESP32-P4 y es practicamente identica en otros chips ESP32, aunque la RAM libre en S3 y C6 no esta disponible en la informacion proporcionada.
- GPU recomendadas: no se especifican; el modelo puede ejecutarse en CPU y en microcontroladores. Para entrenamiento o evaluacion a gran escala se puede usar cualquier GPU convencional, pero no hay datos publicados.
- Cabe en GPU de consumo: si, con enorme holgura; incluso cabe en microcontroladores ESP32-S3/P4/C6.
- Opciones de despliegue: TensorFlow Lite (interprete TFLite), Keras para el modelo float, y firmware especifico para ESP32. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada, salvo la mencion de que en el ESP32-P4 el modelo encuentra personas en teselas reales al mismo ritmo que en PC.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| VoxOCR (v3) | 136.547 | 160x160 RGB | no aplica | Recall 83,9% a umbral 0,2 en HERIDAL | CC BY 4.0 | Hugging Face, GitHub |
| VoxOCR nano | 37.363 | 160x160 RGB | no aplica | Recall 81,2% a umbral 0,2 en HERIDAL | CC BY 4.0 | Hugging Face, GitHub |
| VoxScout | no disponible | no disponible | no disponible | no disponible | no disponible | Hugging Face (inviolus/VoxScout) |

No se dispone de datos de benchmarks de VoxScout en la informacion proporcionada, por lo que la comparativa cuantitativa con el hermano mayor basado en EfficientNet-B0 no puede completarse. Tampoco se han identificado en la informacion disponible otros detectores de personas aereos de tamano comparable para establecer una comparacion directa.

## Limitaciones y advertencias

- Sesgo por desbalanceo de teselas vacias: solo el 29% de las teselas de entrenamiento estan vacias frente al 91% en test, lo que provoca una tasa elevada de falsos positivos (89% de los falsos positivos ocurren en teselas sin personas).
- Degradacion en terreno no visto: en NOMAD, los falsos positivos por tesela vacia suben de 0,34 a 1,29 (casi cuatro veces mas), y aumentan con la altitud del dron (1,10 a 10 m, 1,49 a 90 m).
- Caida de recall en camaras no vistas: en el clip de WiSARD el recall baja al 61,3% (v3) y 62,2% (nano) a umbral 0,2, frente al 83,9% y 81,2% en HERIDAL.
- Precision baja: incluso en el mejor punto de operacion, la precision es del 20,4% (v3) y 12,7% (nano), lo que implica muchas detecciones falsas por cada persona real.
- Limitacion de tamano de persona: las personas de 8 a 16 px de altura se detectan el 77% de las veces, frente al 90% para personas mas grandes.
- Modelo especializado: no es un modelo generativo ni multilingue; no soporta tool calling, agentes ni razonamiento. Su uso fuera de la deteccion de personas en vista aerea cenital no esta validado.
- Entrada fija de 160x160: requiere trocear imagenes mayores en teselas, lo que anade complejidad al pipeline y puede perder contexto entre teselas.
- Licencia CC BY 4.0: permite uso comercial con atribucion, pero exige citar al autor y mantener la licencia en obras derivadas. No hay restricciones adicionales indicadas, pero conviene revisar los terminos exactos antes de un despliegue en produccion.
- El modelo se distribuye con fecha de creacion futura (2026-10-31) en los metadatos de Hugging Face, lo que puede indicar un error de registro o una fecha planificada; conviene verificar la version y los ficheros antes de usarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/inviolus/voxOCR
- Modelo hermano VoxScout: https://huggingface.co/inviolus/VoxScout
- Codigo y detalles de entrenamiento: https://github.com/ErdemWilkinson/VoxHOD
- Conjunto NOMAD: https://github.com/ArtRuss/NOMAD
