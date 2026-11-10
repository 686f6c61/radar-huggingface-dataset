# nxp/midas-v2-imx

## Resumen

MiDaS v2.1 Small para i.MX es una adaptacion del modelo de estimacion de profundidad monoculo MiDaS v2.1 Small de Intel ISL, publicada por NXP para su despliegue en los procesadores de la familia i.MX con aceleradores neuronales integrados. El modelo original toma una imagen RGB y devuelve un mapa de disparidad (profundidad inversa relativa), y esta version lo entrega cuantizado a int8 y compilado especificamente para el NPU VX del i.MX 8M Plus, el Ethos-U65 del i.MX 93 y el motor Neutron de los i.MX 95 e i.MX 952.

La relevancia de esta publicacion es practica: permite ejecutar estimacion de profundidad en tiempo real sobre hardware embebido de bajo consumo sin necesidad de GPU dedicada, algo critico en robotica movil, vision industrial o automocion. El backbone es EfficientNet-Lite, el miembro mas ligero de la familia MiDaS, con una carga computacional de 9,214 GOPs y un peso de aproximadamente 17 MB en int8.

El repositorio incluye los artefactos compilados para cada plataforma, el script `recipe.sh` para regenerarlos y un ejemplo de inferencia en `example.py`. La entrada es float32 de forma (1, 256, 256, 3) normalizada a [0, 1] y la salida es float32 de forma (1, 256, 256, 1).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN con backbone EfficientNet-Lite (MiDaS v2.1 Small) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada fija 256x256) |
| Tipos de cuantizacion | int8 en pesos y activaciones; entrada y salida float32 |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | MIT |
| Formato de pesos | TFLite / LiteRT (`.tflite`), con variantes precompiladas por plataforma |
| Entrada | RGB (1, 256, 256, 3), float32 normalizada a [0, 1] |
| Salida | Mapa de disparidad (1, 256, 256, 1), float32, profundidad inversa relativa |
| Carga computacional | 9,214 GOPs |
| Tamano del artefacto int8 | ~17 MB |
| Tamano del repositorio | 0,3 GB |
| Runtime | eIQ LiteRT (TensorFlow Lite) con delegado NPU (VX, Ethos-U, Neutron) |
| Hardware objetivo | i.MX 8M Plus, i.MX 93, i.MX 95, i.MX 952 |

## Arquitectura y entrenamiento

El modelo base es MiDaS v2.1 Small de Intel ISL, una red convolucional cuyo backbone es EfficientNet-Lite. MiDaS se entreno sobre diez conjuntos de datos diversos de profundidad, lo que le confiere capacidad de transferencia zero-shot entre dominios y escenas distintas. La salida es un mapa de profundidad inversa relativa (disparidad), no profundidad metrica absoluta.

NXP no reentrena el modelo: aplica cuantizacion post-entrenamiento de enteros completos (int8) sobre pesos y activaciones, manteniendo entrada y salida en float32, mediante `tflite2tensorflow` y aproximadamente 100 imagenes de calibracion muestreadas de un subconjunto de ImageNetV2 con licencia comercial, normalizadas con `data / 255`. Posteriormente compila el grafo para cada NPU: con Vela para el Ethos-U65 del i.MX 93 (etiquetas BSP `lf-6.18.20_2.0.0` y `lf-6.18.37_2.1.0`) y con el eIQ Neutron SDK (versiones 3.1.3, 3.2.1 y 3.2.3) para i.MX 95 e i.MX 952. Para i.MX 8M Plus se distribuye el modelo cuantizado sin precompilacion especifica, ejecutandose mediante el delegado VX.

## Capacidades

- Estimacion de profundidad monoculo a partir de una unica imagen RGB.
- Prediccion de mapa de disparidad (profundidad inversa relativa) a resolucion 256x256.
- Transferencia zero-shot entre conjuntos de datos y dominios visuales gracias al entrenamiento multi-dataset del modelo original.
- Inferencia acelerada por NPU en hardware NXP i.MX, con pesos y activaciones en int8.
- Ejecucion en el runtime eIQ LiteRT con delegados especificos por plataforma (VX, Ethos-U, Neutron).
- No soporta tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje; es exclusivamente un modelo de vision.
- No dispone de modo thinking, audio ni capacidades multimodales mas alla de la imagen de entrada.

## Casos de uso

- Robotica movil y navegacion: el modelo genera mapas de disparidad a partir de la camara monocular para estimacion de obstaculos y planificacion de trayectorias en robots con i.MX 8M Plus o i.MX 93, donde no hay espacio para una GPU.
- Vision industrial en linea de produccion: inspeccion de profundidad en cadenas de montaje usando i.MX 95 con NPU Neutron, detectando piezas fuera de plano o defectos de relieve a baja latencia.
- Sistemas de asistencia a la conduccion (ADAS) de bajo coste: deteccion de distancia relativa a vehiculos y peatones con una sola camara en plataformas automotrices basadas en i.MX 952.
- Drones y dispositivos aereos no tripulados: evitacion de obstaculos y aterrizaje asistido con un consumo energetico compatible con baterias pequenas, gracias al artefacto int8 de ~17 MB.
- Realidad aumentada en dispositivos embebidos: oclusion y colocacion de objetos virtuales usando el mapa de profundidad en tiempo real sobre i.MX 8M Plus.
- Agricultura de precision y maquinaria agricola: estimacion de altura de cultivos y deteccion de terreno mediante camaras monoculares en equipos con i.MX 93.
- Logistica y AMR (robots moviles autonomos) en almacenes: percepcion de profundidad para navegacion segura con hardware de bajo consumo y sin depender de la nube.
- Prototipado rapido en placas de evaluacion NXP: el ejemplo `example.py` y `recipe.sh` permiten validar el pipeline completo y regenerar los artefactos para otras versiones de BSP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo se ejecuta en NPU integrada, no en GPU discreta.
- Memoria: el artefacto int8 ocupa aproximadamente 17 MB, por lo que cabe holgadamente en la memoria compartida de los SoC i.MX objetivo.
- GPU recomendadas: no aplica. El despliegue esta pensado para los NPU VX (i.MX 8M Plus), Ethos-U65 (i.MX 93) y Neutron (i.MX 95 / i.MX 952).
- Compatibilidad con GPU de consumo: no procede; el modelo esta compilado para NPU especificas y no se distribuye en formato generico para CUDA.
- Opciones de despliegue: runtime eIQ LiteRT (TensorFlow Lite) con el delegado correspondiente a cada plataforma. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada. La carga de 9,214 GOPs sugiere que el rendimiento dependera de las capacidades TOPS del NPU de cada SoC.
- Versiones de software: BSP `lf-6.18.20_2.0.0` y `lf-6.18.37_2.1.0`; Vela con etiquetas equivalentes; eIQ Neutron SDK 3.1.3, 3.2.1 y 3.2.3.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Entrada | Formato | Licencia | Hardware objetivo |
|---|---|---|---|---|---|---|
| nxp/midas-v2-imx (este) | EfficientNet-Lite (MiDaS v2.1 Small) | no disponible | 256x256 | TFLite int8 precompilado | MIT | NPU i.MX 8M Plus, 93, 95, 952 |
| MiDaS v2.1 Small original (Intel ISL) | EfficientNet-Lite | no disponible | 256x256 | PyTorch / TFLite float | MIT | CPU / GPU generica |
| MiDaS v3.1 (Intel ISL) | Transformer (DINOv2 / Swin) | no disponible | variable | PyTorch | MIT | GPU con mayor capacidad |
| Depth Anything | Transformer (DINOv2) | no disponible | variable | PyTorch | licencia propia | GPU |

La comparativa se limita a la familia MiDaS y modelos de profundidad monoculo conocidos; no se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- La salida es profundidad inversa relativa (disparidad), no profundidad metrica absoluta; requiere calibracion o post-procesado para obtener distancias en metros.
- La resolucion de entrada esta fijada a 256x256, lo que limita el detalle espacial en escenas con objetos pequenos o lejanos.
- La cuantizacion int8 puede introducir una perdida de precision respecto al modelo original en float32; no se han publicado metricas de esa degradacion.
- El modelo se entreno sobre diez conjuntos de datos cuya composicion no se detalla; pueden existir sesgos en escenas poco representadas (interiores especificos, condiciones de iluminacion extremas, ciertos grupos demograficos en imagenes con personas).
- Riesgo de alucinacion entendido como predicciones de profundidad incorrectas en superficies reflectantes, transparentes, texturas repetitivas o escenas nocturnas.
- No es un modelo de lenguaje: no procesa texto, no soporta tool calling ni agentes, y no debe evaluarse con benchmarks de NLP.
- La licencia MIT permite uso comercial, pero el usuario debe verificar las condiciones de los artefactos precompilados y de las herramientas NXP (Vela, eIQ Neutron SDK) que puedan aplicarse al despliegue.
- El modelo esta compilado para versiones concretas de BSP y SDK; cambios de version pueden requerir regenerar los artefactos con `recipe.sh`.
- No se proporcionan datos de latencia, throughput ni consumo energetico, por lo que las estimaciones de rendimiento en produccion deben medirse en el hardware concreto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nxp/midas-v2-imx
- Modelo base en TFHub: https://tfhub.dev/intel/lite-model/midas/v2_1_small/1/lite/1
- Repositorio original MiDaS (Intel ISL): https://github.com/isl-org/MiDaS
- Licencia original MiDaS: https://github.com/isl-org/MiDaS/blob/master/LICENSE
- Vela (compilador Ethos-U de NXP): https://github.com/nxp-imx/ethos-u-vela
- Artefacto i.MX 8M Plus: https://huggingface.co/nxp/midas-v2-imx/blob/main/assets/imx8mplus/midas_v2_1_small_quant.tflite
- Artefacto i.MX 93 (BSP lf-6.18.20_2.0.0): https://huggingface.co/nxp/midas-v2-imx/blob/main/assets/imx93/lf-6.18.20_2.0.0/midas_v2_1_small_quant_vela.tflite
- Artefacto i.MX 93 (BSP lf-6.18.37_2.1.0): https://huggingface.co/nxp/midas-v2-imx/blob/main/assets/imx93/lf-6.18.37_2.1.0/midas_v2_1_small_quant_vela.tflite
- Artefacto i.MX 95 (Neutron SDK 3.1.3): https://huggingface.co/nxp/midas-v2-imx/blob/main/assets/imx95/3.1.3/midas_v2_1_small_quant_converted.tflite
- Artefacto i.MX 95 (Neutron SDK 3.2.1): https://huggingface.co/nxp/midas-v2-imx/blob/main/assets/imx95/3.2.1/midas_v2_1_small_quant_converted.tflite
- Artefacto i.MX 95 (Neutron SDK 3.2.3): https://huggingface.co/nxp/midas-v2-imx/blob/main/assets/imx95/3.2.3/midas_v2_1_small_quant_converted.tflite
- Artefacto i.MX 952 (Neutron SDK 3.1.3): https://huggingface.co/nxp/midas-v2-imx/blob/main/assets/imx952/3.1.3/midas_v2_1_small_quant_converted.tflite
- Artefacto i.MX 952 (Neutron SDK 3.2.1): https://huggingface.co/nxp/midas-v2-imx/blob/main/assets/imx952/3.2.1/midas_v2_1_small_quant_converted.tflite
- Imagen de ejemplo (dominio publico): https://commons.wikimedia.org/wiki/File:Moscow_bus_151872_2022-05.jpg
