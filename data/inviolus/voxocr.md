# inviolus/voxOCR

## Resumen

VoxHOD (publicado en Hugging Face como `inviolus/voxOCR`) es un detector de personas de tipo CenterNet, anchor-free, disenado especificamente para camaras de dron con vista cenital en misiones de busqueda y rescate. Lo desarrolla el autor independiente inviolus y esta pensado para ejecutarse en microcontroladores de la clase ESP32-S3, con un modelo principal de 136.547 parametros y 197 KB en TFLite int8 completo, y una variante nano de 37.363 parametros y 75 KB. La entrada es un tile RGB de 160x160 y la salida es una rejilla de 40x40 (stride 4) con un mapa de calor de centros de persona y dos canales de tamano de caja.

Su relevancia actual radica en el despliegue en el borde (TinyML): permite que un dron marque zonas donde hay personas para que un equipo de rescate las revise, sin depender de conectividad ni de GPU a bordo. Todo el modelo esta construido y entrenado desde cero, con licencia CC BY 4.0, y se distribuye en formato Keras (float) y TFLite int8 con cuantizacion consciente del entrenamiento (QAT) en la version recomendada v3.

En noviembre de 2026 se anadieron variantes "heat-only" con salida `[1,40,40,1]` (sin canales de tamano de caja), entrenadas con perdida balanceada y self-distillation o Model Soup, que reducen los falsos positivos por tile a igual recall. El modelo hermano mayor, basado en EfficientNet-B0, es un proyecto separado llamado VoxScout.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CenterNet-style, anchor-free, CNN (Keras/TensorFlow Lite) |
| Parametros totales | 136.547 (v3); 37.363 (nano) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada 160x160 RGB) |
| Tipos de cuantizacion | int8 QAT (v3 recomendado), int8 post-training (PTQ), float32 (.keras) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | CC BY 4.0 |
| Formato de pesos | `.keras` (float), `.tflite` (int8) |

## Arquitectura y entrenamiento

VoxHOD es una red convolucional compacta de estilo CenterNet, sin anchors, que predice directamente un mapa de calor de centros de persona sobre una rejilla de 40x40 con stride 4. La version v3 tiene dos canales adicionales que estiman el logaritmo de la anchura y altura de la caja en celdas de rejilla. La entrada es un tile RGB de 160x160 normalizado como `pixel / 127.5 - 1`. Las variantes heat-only eliminan los canales de tamano de caja para que la sigmoide del mapa de calor aproveche los 256 niveles de int8, y se entrenan con normalizacion focal negativa por tile.

El modelo se entrena desde cero (no parte de un backbone preentrenado) y se distribuye con cuantizacion consciente del entrenamiento (QAT) en int8 completo. Las variantes de noviembre de 2026 incorporan tecnicas de self-distillation desde un ensemble de tres modelos y Model Soup (promediado de pesos de tres ramas) sobre el conjunto HERIDAL completo o sobre un split del 55%. El repositorio incluye ficheros de evaluacion (`evaluation.json`, `evaluation_wisard.json`, `evaluation_nano.json`) con recall, precision y falsos positivos por umbral.

## Capacidades

- Deteccion de personas en imagenes aereas cenitales capturadas por dron, sobre tiles de 160x160 RGB.
- Salida de mapa de calor de centros de persona (0 a 1) y, en v3, dimensiones de caja (anchura y altura en celdas de rejilla).
- Inferencia en microcontroladores de clase ESP32-S3 y ESP32-P4 (TFLite int8).
- Funcionamiento offline en el borde, sin necesidad de GPU ni conectividad.
- Variantes heat-only con salida `[1,40,40,1]` para menor coste y menos falsos positivos.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un detector de objetos puro.
- No dispone de modo thinking, vision general, audio ni generacion de texto.

## Casos de uso

- Busqueda y rescate con dron: el modelo procesa tiles de 160x160 extraidos de fotografias aereas de 4000x3000 y marca los centros donde probablemente hay personas, de modo que el equipo de rescate prioriza las zonas a revisar.
- Despliegue en microcontrolador a bordo: al ocupar 197 KB (v3) o 75 KB (nano), cabe en la memoria de un ESP32-S3 o ESP32-P4 y permite deteccion en tiempo real sin enviar imagenes a la nube.
- Triaje de imagenes en misiones de gran extension: con 0,35 falsos positivos por tile a umbral 0,20 y 83,9% de recall en HERIDAL, sirve para descartar tiles vacios y reducir el volumen de imagenes que revisa un operador humano.
- Vigilancia de areas remotas o de dificil acceso: la inferencia local evita depender de enlaces de radio o satelite en zonas sin cobertura.
- Investigacion en TinyML: el modelo y sus variantes QAT, self-distilled y Model Soup sirven como referencia reproducible para estudiar cuantizacion int8 y destilacion en detectores de muy bajo parametraje.
- Prototipado de sistemas de vision embebida: la API de TFLite y el ejemplo en Python de la model card facilitan integrar el detector en pipelines de prueba con camaras aereas o datasets propios.
- Evaluacion comparativa de detectores aereos: los ficheros de evaluacion permiten contrastar umbrales y curvas de recall frente a falsos positivos en HERIDAL y WiSARD.

## Benchmarks y rendimiento

Resultados en el conjunto de test HERIDAL (3.507 tiles, 372 personas). Una deteccion cuenta como acierto si su centro cae dentro de la caja de la persona ampliada en una celda de rejilla.

| Fichero int8, umbral | Recall | Precision | Falsos positivos por tile |
|---|---:|---:|---:|
| v3 QAT, 0,30 | 76,6% | 32,5% | 0,17 |
| v3 QAT, 0,20 | 83,9% | 20,4% | 0,35 |
| v3 QAT, 0,10 | 88,7% | 7,7% | 1,12 |
| nano PTQ, 0,30 | 72,3% | 25,8% | 0,22 |
| nano PTQ, 0,20 | 81,2% | 12,7% | 0,59 |
| nano PTQ, 0,10 | 89,5% | 4,8% | 1,87 |

Datos adicionales de la model card:

| Variante | Metrica destacada |
|---|---|
| nano v2 HSD (74,7 KB, heat-only) | 0,225 falsos positivos por tile a 80% de recall (−55% frente al nano original) |
| nano v2 Soup (74,7 KB, heat-only) | 84,7% recall a umbral 0,20; 81,2% a 0,3 FA |
| v4 HSD (191,0 KB, heat-only) | 82,0% recall a 0,3 FA; 81,2% en el rango de 8-16 px |
| nano HSOUP (74,7 KB, heat-only) | 68,8% en WiSARD a 0,5 FA (mejor generalizacion no vista) |
| Generalizacion a WiSARD (no visto en entrenamiento) | recall cae al 61% (v3) y 62% (nano) |
| Generalizacion a NOMAD (terreno no visto) | falsos positivos por tile suben de 0,34 a 1,29 |

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido habitual; el modelo esta pensado para inferencia en microcontrolador. En PC, el coste de memoria es minimo (menos de 1 MB para pesos int8).
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU. Para procesar lotes grandes de tiles en servidor, cualquier GPU moderna acelera el pipeline, pero no es necesaria.
- Compatibilidad con GPU de consumo: si, en cualquier GPU de consumo o incluso en CPU, dado el tamano del modelo.
- Despliegue: TensorFlow Lite (interprete Python o C++), Keras para el modelo float, y despliegue en ESP32-S3 y ESP32-P4 mediante TFLite Micro.
- Latencia y throughput: la model card indica que en ESP32-P4 el modelo encuentra personas en tiles reales al mismo ritmo que en PC, pero no se publican cifras concretas de latencia o throughput en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Licencia | Enfoque |
|---|---|---|---|---|
| VoxHOD (v3) | 136.547 | 160x160 RGB | CC BY 4.0 | CenterNet TinyML para dron |
| VoxHOD nano | 37.363 | 160x160 RGB | CC BY 4.0 | CenterNet TinyML para dron |
| VoxScout | no disponible | no disponible | no disponible | EfficientNet-B0, proyecto hermano mayor |
| Detectores aereos genericos (p. ej. YOLO) | millones | variable | variable | no comparables directamente por tamano y despliegue |

No se dispone de datos de benchmarks de terceros en la informacion proporcionada para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- El recall cae de forma notable en dominios no vistos: del 83,9% en HERIDAL al 61% en WiSARD, y los falsos positivos por tile suben de 0,34 a 1,29 en NOMAD.
- La precision es baja en umbrales altos de recall: a 0,20 el modelo logra 83,9% de recall pero solo 20,4% de precision, con 0,35 falsos positivos por tile.
- El modelo esta especializado en vista cenital desde dron; no se ha validado para otras perspectivas, condiciones de iluminacion extremas ni camaras no aereas.
- No es un modelo de lenguaje ni tiene capacidades multilingues, de razonamiento o de agente; su unico proposito es la deteccion de personas.
- La licencia CC BY 4.0 permite uso comercial con atribucion, pero conviene revisar los terminos exactos y citar al autor.
- Las variantes heat-only (nano v2, v4) no se han medido aun en ESP32-P4 segun la model card; su rendimiento en hardware embebido esta pendiente de validacion.
- Riesgo de alucinacion en el sentido de falsos positivos: el modelo puede marcar zonas sin personas, especialmente en terrenos no vistos, por lo que requiere supervision humana en misiones reales.
- El repositorio tiene un tamano de 0.0 GB, lo que sugiere que los pesos pueden no estar disponibles o el repositorio esta incompleto; conviene verificar antes de desplegar.

## Enlaces

- Hugging Face: https://huggingface.co/inviolus/voxOCR
- Codigo y detalles de entrenamiento: https://github.com/ErdemWilkinson/VoxHOD
- Modelo hermano VoxScout: https://huggingface.co/inviolus/VoxScout
