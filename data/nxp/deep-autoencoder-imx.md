# nxp/deep-autoencoder-imx

## Resumen

Deep Autoencoder para deteccion de anomalias en audio (ASD, *anomalous sound detection*), publicado por NXP dentro del ecosistema eIQ y derivado del modelo de referencia del benchmark MLPerf Tiny de MLCommons. La tarea consiste en determinar si el sonido emitido por una maquina objetivo es normal o anomalo; el modelo se entrena de forma no supervisada solo con muestras normales y, en inferencia, usa el error de reconstruccion entre el vector de caracteristicas de entrada y su reconstruccion como puntuacion de anomalia.

Arquitecturalmente es un autoencoder totalmente conectado (no transformer) que opera sobre vectores de 640 dimensiones de espectrograma log-mel (128 bandas mel x 5 tramas). Con 267.928 parametros y 0,528 MOPS, el modelo esta disenado para inferencia en el NPU de los procesadores NXP i.MX 8M Plus, i.MX 93, i.MX 95 e i.MX 952, no para GPUs de servidor. El repositorio no contiene pesos en safetensors ni un modelo generativo: contiene el TFLite int8 pre-cuantizado publicado por MLCommons, recompilado por NXP para cada NPU objetivo, junto con el script `recipe.sh` y un ejemplo de inferencia `example.py`.

Su relevancia es practica para despliegues de mantenimiento predictivo en el borde: es un modelo de 271 KB que cabe en cualquier NPU integrada de bajo consumo y permite monitorizar maquinaria en tiempo real sin enviar audio a la nube. No es un modelo de lenguaje ni un modelo multimodal; cualquier evaluacion debe hacerse en el contexto de clasificacion binaria de audio embebido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoencoder totalmente conectado (fully-connected) |
| Parametros totales | 267.928 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada fija de 640 dimensiones (128 bandas mel x 5 tramas) |
| Tipos de cuantizacion | int8 (entrada int8, salida int8); modelo pre-cuantizado por MLCommons, sin recalibracion por NXP |
| Idiomas soportados | no disponible (modelo de audio, no linguistico) |
| Licencia | Apache-2.0 |
| Formato de pesos | TFLite (LiteRT) int8; variantes compiladas con Vela (Ethos-U65) y eIQ Neutron SDK |
| Pipeline | audio-classification |
| Computo | 0,528 MOPS |
| Tamano del fichero int8 | 271 KB (`ad01_int8.tflite`) |
| Hardware objetivo | i.MX 8M Plus (NPU VeriSilicon), i.MX 93 (Ethos-U65), i.MX 95 e i.MX 952 (Neutron) |
| Runtime | eIQ LiteRT (TensorFlow Lite) con el delegate NPU correspondiente |

## Arquitectura y entrenamiento

El modelo es un autoencoder denso que recibe un vector de 640 valores int8 correspondientes a un espectrograma log-mel (128 bandas mel por 5 tramas temporales) y produce una reconstruccion del mismo vector de 640 dimensiones. El entrenamiento es no supervisado y utiliza exclusivamente muestras de sonido normal de la maquina objetivo; en inferencia se calcula el error cuadratico medio de reconstruccion sobre la salida des-cuantizada, que actua como puntuacion de anomalia. El modelo forma parte de la suite de benchmarks MLPerf Tiny, cuyo paper de referencia es arXiv:2106.07597.

No se dispone de informacion sobre el numero de tokens o muestras de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de ajuste fino adicionales; la model card solo menciona que el ejemplo de entrada procede del dataset ToyADMOS. La innovacion tecnica relevante no esta en el diseno de la red sino en el pipeline de despliegue: cuantizacion int8 completa, compilacion con Vela para el NPU Ethos-U65 del i.MX 93 y conversion con el eIQ Neutron SDK (versiones 3.1.3, 3.2.1 y 3.2.3) para i.MX 95 e i.MX 952. Para i.MX 8M Plus se usa directamente el modelo int8 independiente del hardware, ya que el delegate VX del NPU VeriSilicon no requiere compilacion previa.

## Capacidades

- Deteccion de anomalias en audio no supervisada: clasifica sonidos de maquinaria como normales o anomalos a partir del error de reconstruccion.
- Extraccion de puntuacion de anomalia continua (MSE float32 sobre la salida des-cuantizada), lo que permite umbralizar segun la sensibilidad deseada.
- Inferencia int8 acelerada por NPU en i.MX 8M Plus, i.MX 93, i.MX 95 e i.MX 952 mediante eIQ LiteRT.
- Ejecucion en el borde con huella minima: 271 KB de pesos y 0,528 MOPS.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto.
- No tiene capacidades multilingues ni de vision; el unico modalidad de entrada es audio representado como log-mel.
- No dispone de modo *thinking* ni de salidas estructuradas mas alla del vector reconstruido.

## Casos de uso

- Mantenimiento predictivo de motores y bombas en planta: capturar audio con un microfono conectado a un i.MX 93 y ejecutar el autoencoder en el NPU para generar una puntuacion de anomalia por ventana de 5 tramas, alertando cuando el error de reconstruccion supere un umbral calibrado con sonido normal.
- Monitorizacion de cadenas de produccion: desplegar el modelo en un i.MX 8M Plus integrado en el PLC o en un gateway industrial para detectar cambios en el ruido de rodamientos o correas sin enviar audio a la nube.
- Deteccion de fallos en electrodomesticos conectados: usar el i.MX 95 o i.MX 952 en un producto de consumo para identificar ruidos anomalos de compresores o ventiladores en tiempo real.
- Control de calidad acustico en fabricacion: comparar la firma sonora de cada unidad producida contra el patron aprendido de unidades correctas y rechazar aquellas con reconstruccion atipica.
- Vigilancia de infraestructura (valvulas, transformadores, ascensores): ejecutar el modelo de forma continua en un nodo de bajo consumo alimentado por bateria o PoE, con el NPU dedicado y la CPU libre para otras tareas.
- Prototipado rapido con MLPerf Tiny: usar el repositorio como referencia reproducible para validar pipelines de cuantizacion int8 y compilacion Vela/Neutron antes de entrenar un autoencoder propio con datos de la maquina objetivo.
- Investigacion en deteccion de anomalias acusticas: servir como linea base ligera para comparar arquitecturas mas grandes en entornos embebidos con restricciones estrictas de memoria y energia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo aporta metricas de complejidad (267.928 parametros, 0,528 MOPS, 271 KB en int8) y la pertenencia al benchmark MLPerf Tiny, sin cifras de AUC, precision o recall sobre ToyADMOS ni sobre otros datasets.

## Requisitos de hardware

- VRAM: no aplica; el modelo se ejecuta en NPU integradas, no en GPU. El fichero int8 ocupa 271 KB y la memoria de trabajo es del orden de kilobytes.
- GPU recomendadas: ninguna. El modelo esta pensado para los NPU de i.MX 8M Plus (VeriSilicon VX), i.MX 93 (Ethos-U65), i.MX 95 e i.MX 952 (Neutron).
- Compatibilidad con GPU de consumo: no es el objetivo; podria ejecutarse en CPU con el runtime TFLite estandar, pero sin aceleracion NPU y sin las optimizaciones de Vela o Neutron.
- Opciones de despliegue: eIQ LiteRT (TensorFlow Lite) con el delegate NPU correspondiente; los artefactos precompilados estan en `assets/imx93/`, `assets/imx95/`, `assets/imx952/` y `assets/imx8mplus/`, con las versiones de BSP y SDK documentadas en `release_manifest.json`.
- Latencia y throughput: no disponibles en la informacion proporcionada. Dado el reducido coste computacional (0,528 MOPS), se espera una latencia muy baja en los NPU objetivo, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Formato | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| nxp/deep-autoencoder-imx | 267.928 | Log-mel 640 dims | TFLite int8 (Vela/Neutron) | Apache-2.0 | NPU i.MX 8M Plus, 93, 95, 952 |
| MLPerf Tiny anomaly detection (original MLCommons) | 267.928 | Log-mel 640 dims | TFLite int8 | Apache-2.0 | Generico (CPU/NPU via TFLite) |
| Autoencoders de deteccion de anomalias en audio de mayor tamano (p. ej. variantes convolucionales) | no disponible | Espectrogramas variables | no disponible | variable | GPU/CPU |

La comparativa directa con alternativas de la misma categoria es limitada: el modelo de NXP es esencialmente el artefacto de MLCommons recompilado para NPU concretas, por lo que su principal diferenciador frente al original es el soporte especifico de hardware y las versiones de BSP/SDK, no una mejora de precision o de arquitectura.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en deteccion de anomalias acusticas; no es un modelo de lenguaje ni un clasificador general de audio.
- Requiere un umbral de decision calibrado con datos normales de la maquina concreta; el error de reconstruccion no es una probabilidad calibrada.
- Entrenado de forma no supervisada solo con sonido normal: un cambio de entorno acustico, de regimen de funcionamiento o de la propia maquina puede generar falsos positivos.
- La entrada esta fija a 640 dimensiones (128 bandas mel x 5 tramas); no admite secuencias de longitud variable sin un pipeline externo de extraccion de caracteristicas.
- No se han publicado metricas de rendimiento en la informacion disponible, por lo que no es posible evaluar su precision frente a alternativas sin ejecutar una validacion propia.
- Los artefactos precompilados estan ligados a versiones concretas de BSP y SDK (lf-6.18.20_2.0.0, lf-6.18.37_2.1.0, Vela, Neutron 3.1.3/3.2.1/3.2.3); usar una combinacion distinta puede requerir recompilacion.
- Licencia Apache-2.0: permite uso comercial y modificacion, pero exige conservar los avisos de copyright y la atribucion a MLCommons y NXP; conviene revisar el fichero `LICENSE` del repositorio.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de clasificacion erronea en regimenes acusticos no representados en el entrenamiento.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere poca validacion externa por parte de la comunidad.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/nxp/deep-autoencoder-imx)
- [Modelo original de MLPerf Tiny en GitHub](https://github.com/mlcommons/tiny/tree/master/benchmark/training/anomaly_detection)
- [MLCommons](https://mlcommons.org/en/)
- [Paper de referencia MLPerf Tiny (arXiv:2106.07597)](https://arxiv.org/abs/2106.07597)
- [Vela (compilador Ethos-U de NXP)](https://github.com/nxp-imx/ethos-u-vela)
- [Asset i.MX 8M Plus (int8)](https://huggingface.co/nxp/deep-autoencoder-imx/blob/main/assets/imx8mplus/ad01_int8.tflite)
- [Asset i.MX 93 (Vela, BSP lf-6.18.20_2.0.0)](https://huggingface.co/nxp/deep-autoencoder-imx/blob/main/assets/imx93/lf-6.18.20_2.0.0/ad01_int8_vela.tflite)
- [Asset i.MX 95 (Neutron 3.2.3)](https://huggingface.co/nxp/deep-autoencoder-imx/blob/main/assets/imx95/3.2.3/ad01_int8_converted.tflite)
- [Asset i.MX 952 (Neutron 3.1.3)](https://huggingface.co/nxp/deep-autoencoder-imx/blob/main/assets/imx952/3.1.3/ad01_int8_converted.tflite)
