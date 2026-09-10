# pollen-robotics/microduck-duck-detector

## Resumen

Microduck duck detector es un modelo de deteccion de objetos de una unica clase, desarrollado por Pollen Robotics, cuyo objetivo es que un robot Microduck localice a otros Microducks en el campo de vision de su camara. Se trata de un fine-tuning del checkpoint `yolo11n.pt` de Ultralytics sobre el dataset `pollen-robotics/microduck-duck-detector-dataset`, con una unica clase llamada `duck`, entrada letterboxed de 320x320 pixeles y 2100 cajas candidatas por inferencia. El modelo se publica en tres formatos: el checkpoint PyTorch de Ultralytics (`duck_detect.pt`), una exportacion ONNX de precision flotante con formas estaticas y opset 12 (`duck_detect.onnx`), y una version INT8 cuantizada para la NPU del SoC RK3566 (`duck_detect.rknn`).

La relevancia del modelo es eminentemente practica: no busca competir en benchmarks generales de deteccion, sino resolver una tarea de percepcion muy concreta dentro de un robot de bajo coste con recursos de computo limitados. La version cuantizada a INT8 permite ejecutar la deteccion directamente en la NPU del RK3566 que equipa el robot, sin necesidad de GPU ni de conectividad a la nube. Las metricas declaradas por el autor son map50 de 0,9764, map50-95 de 0,8224, precision de 0,9967 y recall de 0,9355.

El modelo forma parte del ecosistema de codigo abierto de Pollen Robotics: el entrenamiento se realiza con el repositorio `pollen-robotics/duck_detector` y la inferencia embarcada con el modulo `duck-detect` del repositorio `pollen-robotics/microduck`. Cada ejecucion de entrenamiento se etiqueta como una revision git del repositorio; la version actual es `duck-v1`. El repositorio tiene licencia Apache-2.0 y, en el momento de redactar esta ficha, registra 0 descargas y 0 likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Deteccion de objetos basada en Ultralytics YOLO11 nano (checkpoint base `yolo11n.pt`) |
| Parametros totales | No disponible en la model card; el checkpoint base es `yolo11n.pt` de Ultralytics (consultar el recuento exacto en la documentacion de Ultralytics) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de vision; entrada de imagen fija de 320x320 con letterbox) |
| Tipos de cuantizacion | FP32/FP16 en la exportacion ONNX; INT8 en el modelo RKNN, cuantizado contra fotogramas reales |
| Idiomas soportados | No aplica (modelo de vision) |
| Licencia | Apache-2.0 (segun la model card) |
| Formato de pesos | `.pt` (checkpoint Ultralytics), `.onnx` (formas estaticas, opset 12), `.rknn` (INT8 para NPU RK3566) |

Otros datos relevantes declarados por el autor: una sola clase (`duck`), 2100 cajas candidatas de salida, `imgsz` de 320, `smoke` en False, revision actual `duck-v1` y tamano del repositorio de 0,0 GB.

## Arquitectura y entrenamiento

La arquitectura subyacente es YOLO11 en su variante nano, tal como la implementa la libreria Ultralytics (`library_name: ultralytics`). Se trata de un detector de una sola etapa con una unica clase de salida, `duck`, pensado para maximizar la relacion entre precision y coste computacional en hardware embarcado. La entrada se normaliza mediante letterbox a 320x320 pixeles, una resolucion inferior a la habitual en los modelos YOLO genericos de Ultralytics (tipicamente 640), lo que reduce de forma notable el coste de inferencia a cambio de menor detalle en objetos pequenos o lejanos.

El entrenamiento se ha realizado con el repositorio `pollen-robotics/duck_detector` sobre el dataset `pollen-robotics/microduck-duck-detector-dataset`. La model card indica que la validacion se hizo reservando sesiones completas del dataset, aunque para esta ejecucion concreta las sesiones empleadas no quedaron registradas («not recorded for this run»). No se especifica el numero de imagenes, epocas, hiperparametros ni si se aplicaron tecnicas de aumento de datos, destilacion o ajuste posterior. Tampoco procede hablar de RLHF o DPO, ya que no es un modelo de lenguaje. El flujo de trabajo organiza cada entrenamiento como una etiqueta git del repositorio, de modo que `main` apunta siempre a la ultima ejecucion y `duck-v1` identifica esta version concreta; los pesos se descargan con `uv run model pull` o `uv run model pull --revision duck-v1`.

La innovacion tecnica mas destacable no esta en la arquitectura, sino en el despliegue: el modelo se cuantiza a INT8 para la NPU del RK3566 y se ejecuta directamente en el robot mediante el modulo `duck-detect` del proyecto `pollen-robotics/microduck`. Un detalle importante documentado por el autor es que la salida INT8 lleva su propia escala, por lo que el umbral de confianza debe calibrarse contra el modelo RKNN y no heredarse del modelo en coma flotante.

## Capacidades

- Deteccion de objetos de una unica clase: identifica instancias de `duck` (otros robots Microduck) en imagenes de la camara del robot.
- Salida de hasta 2100 cajas candidatas por inferencia, con sus puntuaciones de confianza y coordenadas.
- Inferencia sobre imagenes de 320x320 con preprocesado letterbox, adecuada para flujos de vision en tiempo real de baja resolucion.
- Ejecucion en tres backends distintos: PyTorch/Ultralytics (`.pt`), ONNX Runtime (`.onnx`) y NPU Rockchip RK3566 (`.rknn`).
- Despliegue embarcado sin dependencia de GPU ni de servicios en la nube, gracias a la version INT8 para NPU.
- Versionado de pesos por revisiones git, lo que permite fijar una ejecucion concreta en produccion o en experimentos reproducibles.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, generacion de texto, codigo, matematicas, vision generica, audio ni modo de razonamiento: es exclusivamente un detector de objetos de una clase.
- No dispone de capacidades multilingues, al no procesar texto.

## Casos de uso

- Percepcion social entre robots Microduck: el detector permite que un Microduck reconozca a otros Microducks en su campo de vision, habilitando comportamientos de seguimiento, aproximacion o interaccion entre unidades. Es el caso de uso principal para el que fue entrenado y el unico documentado explicitamente por el autor.
- Navegacion reactiva y evitacion de colisiones entre unidades: integrado en el bucle de control del robot, el modelo aporta la posicion de otros robots en la imagen para modular trayectorias y evitar choques en espacios compartidos.
- Robotica de enjambre e investigacion en comportamiento colectivo: al ser un modelo ligero y de una sola clase, permite instrumentar varios robots a la vez con un coste por unidad muy bajo, algo relevante en experimentos de agregacion, formaciones o roles dinamicos.
- Demostraciones educativas y talleres de robotica: la combinacion de un modelo pequeno, pesos publicos y un pipeline de entrenamiento reproducible (`duck_detector`) lo convierte en un ejemplo asequible para ensenar deteccion de objetos y despliegue en hardware embarcado.
- Automatizacion de grabacion y encuadre: en montajes donde una camara debe mantener a los robots dentro de plano, las cajas detectadas pueden alimentar un control de seguimiento o de zoom.
- Base para fine-tuning de detectores de una clase en robotica: el repositorio y el flujo de revisiones (`duck-v1`, `main`) sirven como plantilla para entrenar detectores de nuevos objetos con el mismo esquema de exportacion a ONNX y RKNN.
- Verificacion de presencia en tareas logisticas o de inventario robotizado: al ser un detector de instancia unica, puede adaptarse a comprobar si un objeto concreto esta presente y donde, dentro de un flujo de manipulacion.
- Analisis offline de grabaciones de sesiones con robots: las cajas detectadas permiten reconstruir la posicion relativa de cada unidad a lo largo de una grabacion para analisis posterior de interacciones.

## Benchmarks y rendimiento

Metricas declaradas por el autor en la model card para la ejecucion `duck-v1`:

| Metrica | Valor |
|---|---|
| mAP50 | 0,9764 |
| mAP50-95 | 0,8224 |
| Precision | 0,9967 |
| Recall | 0,9355 |
| Resolucion de entrada (`imgsz`) | 320 |
| Modelo base | yolo11n.pt |
| Smoke | False |

No se han publicado en la informacion disponible resultados comparativos con otros modelos, ni mediciones de latencia, throughput o consumo energetico sobre el RK3566 o sobre otras plataformas.

## Requisitos de hardware

- Despliegue objetivo: NPU del SoC Rockchip RK3566, mediante el fichero `duck_detect.rknn` cuantizado a INT8. Es el modo de ejecucion previsto en el robot Microduck.
- Inferencia en coma flotante: el fichero `duck_detect.onnx` (formas estaticas, opset 12) puede ejecutarse con ONNX Runtime sobre CPU o GPU.
- Entrenamiento y experimentacion: el checkpoint `duck_detect.pt` requiere el entorno de Ultralytics, con GPU opcional; al tratarse de un modelo basado en YOLO11 nano con entrada de 320x320, el coste de entrenamiento e inferencia es bajo.
- VRAM estimada: no disponible en la informacion proporcionada. Por el tamano del modelo base y la resolucion de entrada, el modelo es apto para hardware de gama baja y para GPU de consumo, pero no se han publicado cifras concretas de memoria.
- GPU recomendadas: no especificadas por el autor. Cualquier GPU de consumo reciente deberia ser suficiente para entrenamiento e inferencia en coma flotante; para produccion en el robot no se requiere GPU.
- Opciones de despliegue: Ultralytics (`.pt`), ONNX Runtime (`.onnx`) y RKNN Toolkit / runtime de Rockchip (`.rknn`). No aplican marcos de servido de modelos de lenguaje como vLLM, TGI, llama.cpp u Ollama.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se han publicado en la informacion disponible comparativas con otros modelos. Como referencia cualitativa, se puede contrastar con el checkpoint base del que deriva y con la familia de detectores genericos de Ultralytics:

| Modelo | Tarea | Clases | Resolucion de entrada | Licencia declarada | Disponibilidad |
|---|---|---|---|---|---|
| microduck-duck-detector (`duck-v1`) | Deteccion de objetos de una clase | 1 (`duck`) | 320x320 | Apache-2.0 | HuggingFace, `.pt` / `.onnx` / `.rknn` |
| `yolo11n.pt` (Ultralytics, checkpoint base) | Deteccion de objetos generica | 80 (COCO) | Configurable, 640 por defecto | No indicada en la informacion disponible | Distribuido por Ultralytics |
| Otros detectores de una clase para robotica | Deteccion de objetos | Variable | Variable | No disponible | No disponible |

No se dispone de metricas comparables de `yolo11n.pt` ni de otros detectores sobre el dataset de Microduck, por lo que no es posible establecer una comparacion cuantitativa con datos verificables.

## Limitaciones y advertencias

- Modelo de una sola clase: solo detecta la clase `duck`. No reconoce personas, obstaculos genericos, otros robots ni objetos distintos sin un nuevo entrenamiento.
- Ambito de aplicacion muy restringido: esta disenado para la camara de un Microduck y para encontrar otros Microducks. Su comportamiento fuera de ese dominio no esta documentado.
- Resolucion de entrada baja (320x320 con letterbox): los objetos pequenos, lejanos o parcialmente ocluidos pueden ser mas dificiles de detectar que con modelos a 640 o superior.
- Umbral de confianza dependiente del backend: la salida INT8 del modelo RKNN lleva su propia escala, por lo que un umbral calibrado sobre el modelo en coma flotante no es directamente valido. Es necesario recalibrarlo contra el RKNN.
- Trazabilidad del entrenamiento incompleta: en la model card se indica que las sesiones del dataset empleadas no quedaron registradas para esta ejecucion, lo que dificulta reproducir exactamente el conjunto de validacion.
- Datos de entrenamiento no detallados: no se especifican numero de imagenes, distribucion de condiciones de iluminacion, fondos, angulos ni posibles sesgos del dataset. Esto limita la estimacion de la robustez en entornos no vistos.
- Riesgo de falsos positivos y falsos negativos: aunque la precision declarada es alta (0,9967), el recall es inferior (0,9355), por lo que cabe esperar detecciones omitidas en escenarios adversos.
- Licencia: la model card declara Apache-2.0, pero los pesos derivan de un checkpoint de Ultralytics YOLO11, cuyo marco y pesos se distribuyen habitualmente bajo AGPL-3.0. Conviene verificar la compatibilidad de la licencia con el uso comercial previsto antes de desplegar el modelo en un producto.
- Adopcion minima y sin validacion externa: el repositorio registra 0 descargas y 0 likes, y las metricas proceden unicamente del autor. No hay evaluaciones independientes publicadas.
- No apto para tareas fuera de la vision por computador: no genera texto, no razona, no ejecuta llamadas a herramientas ni mantiene conversaciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pollen-robotics/microduck-duck-detector
- Dataset de entrenamiento: https://huggingface.co/datasets/pollen-robotics/microduck-duck-detector-dataset
- Repositorio de entrenamiento: https://github.com/pollen-robotics/duck_detector
- Repositorio del robot e inferencia embarcada (`duck-detect`): https://github.com/pollen-robotics/microduck
- Libreria Ultralytics (base del modelo): https://github.com/ultralytics/ultralytics
- Revision de pesos `duck-v1`: disponible como etiqueta git en el repositorio del modelo en HuggingFace

Nota sobre la busqueda web: los resultados devueltos corresponden a servicios de reparto de comida, informacion meteorologica sobre polen y articulos enciclopedicos sobre el polen vegetal. Ninguno guarda relacion con el modelo `pollen-robotics/microduck-duck-detector`, por lo que no se incluyen como enlaces relevantes.
