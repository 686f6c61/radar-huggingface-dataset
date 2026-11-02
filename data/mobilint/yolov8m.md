# mobilint/YOLOv8m

## Resumen

YOLOv8m es un modelo de deteccion de objetos de la familia YOLOv8 desarrollado originalmente por Ultralytics. Esta ficha concreta corresponde a la reproduccion publicada por mobilint, que no entrena un modelo nuevo sino que compila y cuantiza los pesos de YOLOv8m al formato propietario MXQ (MXQv7) para su ejecucion sobre el runtime qbruntime y las NPU de la plataforma ARIES de mobilint. El repositorio incluye unicamente el artefacto compilado en `aries-rb/`, generado con qbcompiler 1.4.0 en la imagen `mobilint/qbcompiler:1.4-cuda12.8.1-ubuntu22.04`.

La relevancia de esta publicacion es de infraestructura mas que de modelado: proporciona un binario reproducible (SHA-256 verificado) con metricas de evaluacion auditadas sobre COCO (5000 muestras), lo que permite a desarrolladores desplegar deteccion de objetos sobre hardware movil/NPU con un pipeline de compilacion trazable. El modelo mantiene una retencion del 99,37 % de la metrica map50_95 respecto al modelo de referencia, con un artefacto de solo 33.622.208 bytes (unos 33,6 MB).

Al tratarse de un artefacto compilado y no de un modelo de lenguaje, no dispone de contexto textual, tokenizador ni capacidades generativas. Su ambito es exclusivamente la deteccion de objetos en imagenes, con los modos de nucleo `single`, `multi`, `global4` y `global8`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8m (CNN, deteccion de objetos de una etapa), compilada a MXQv7 |
| Parametros totales | no disponible (artefacto compilado de 33.622.208 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, sin contexto textual) |
| Tipos de cuantizacion | cuantizacion integrada en la compilacion MXQ (qbcompiler 1.4.0); niveles concretos no disponibles |
| Idiomas soportados | no aplica (no procesa texto) |
| Licencia | AGPL-3.0 |
| Formato de pesos | MXQ (MXQv7); modelo base Ultralytics/YOLOv8 en el origen |
| Variante | c0923-gptaq |
| Modos de nucleo soportados | single, multi, global4, global8 |
| Esquema de inferencia de compilacion | all |
| Runtime de evaluacion | qbruntime 1.5.0, modo async |
| SHA-256 del artefacto | 2b778681bdeed6848c96e54d6536b3d836aa8e800ea14c1fc7e80db4fc455fde |
| Tamano del repositorio | 0,4 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es YOLOv8m de Ultralytics, una red neuronal convolucional de deteccion de objetos de una etapa que predice cajas delimitadoras y clases directamente en una sola pasada. El repositorio de mobilint no incluye informacion sobre el entrenamiento original (numero de tokens, composicion del dataset, tecnicas de aumento de datos o ajuste fino), por lo que esos datos deben consultarse en la documentacion de Ultralytics. Lo que si documenta mobilint es el proceso de reproduccion: los pesos se compilan con qbcompiler 1.4.0 usando `--inference-scheme all`, lo que genera un artefacto que soporta los modos `single`, `multi`, `global4` y `global8`.

La innovacion tecnica de esta publicacion es la trazabilidad del artefacto: se documenta la imagen de compilacion (digest sha256 de la imagen), la version de runtime, el commit de operaciones (`612d50e...`), el hash del contenido (`996c10de...`) y los hashes de las anotaciones y de la lista de muestras de evaluacion, con una auditoria de identidad marcada como `verified`. El artefacto se evalua en modo `async` con qbruntime 1.5.0 sobre las 5000 muestras de COCO, y se reporta una retencion del 99,371 % en map50_95 respecto al modelo de referencia. No se documentan tecnicas de RLHF, DPO ni decodificacion especulativa, ya que no aplican a un detector.

## Capacidades

- Deteccion de objetos en imagenes: prediccion de cajas delimitadoras y clases sobre imagenes de entrada, con pipeline `object-detection`.
- Ejecucion sobre NPU ARIES: el artefacto MXQ esta compilado para el runtime qbruntime y la plataforma de aceleracion de mobilint.
- Multiples modos de nucleo: soporta `single`, `multi`, `global4` y `global8`, lo que permite adaptar el reparto de computo al hardware disponible.
- Inferencia asincrona: el modo `async` de qbruntime permite solapar la ejecucion con otras tareas del pipeline.
- Verificacion de integridad: el SHA-256 publicado permite validar la descarga con `sha256sum`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues, al no ser un modelo de lenguaje.
- No dispone de modo thinking, vision multimodal, audio ni generacion de texto.

## Casos de uso

- Deteccion de objetos en dispositivos de borde: el artefacto de 33,6 MB y su compilacion para NPU ARIES permiten ejecutar deteccion en tiempo real en hardware de bajo consumo, sin depender de GPU de servidor.
- Vision por computador en video vigilancia: el modelo puede procesar flujos de camaras y localizar personas, vehiculos y objetos, con los modos `multi` o `global4` para ajustar el paralelismo al numero de unidades de computo.
- Automatizacion industrial y control de calidad: deteccion de defectos o piezas en lineas de produccion, donde la latencia predecible del runtime y la reproducibilidad del binario facilitan la certificacion del pipeline.
- Robotica y navegacion autonoma: percepcion de obstaculos y objetos en tiempo real sobre plataformas embebidas, apoyandose en el modo `async` para solapar inferencia con el control del robot.
- Analisis de imagenes en aplicaciones moviles: integracion en apps que requieren deteccion local sin enviar imagenes a la nube, gracias al tamano reducido del artefacto y a la licencia AGPL-3.0 (con las obligaciones que implica).
- Reproducibilidad de pipelines de cuantizacion: el repositorio sirve como referencia para equipos que quieran replicar el proceso de compilacion con qbcompiler 1.4.0 y verificar metricas de retencion sobre COCO.
- Benchmarking de hardware NPU: util como carga de trabajo estandar para medir throughput y latencia de la plataforma ARIES frente a otras alternativas, dado que las metricas de evaluacion estan auditadas.

## Benchmarks y rendimiento

Evaluacion publicada por mobilint sobre COCO (5000 muestras), con qbruntime 1.5.0 en modo `async`:

| Metrica | Valor |
|---|---|
| map50_95 | 0,49931 |
| map50 | 0,66921 |
| Retencion map50_95 respecto al modelo de referencia | 99,371 % |
| Muestras de evaluacion | 5000 |
| Modo de inferencia | async |

No se han publicado en la informacion disponible resultados comparativos con otros modelos ni mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el artefacto esta pensado para ejecucion sobre NPU ARIES, no sobre GPU convencional.
- GPU recomendadas: no aplica para el artefacto MXQ; la compilacion se realizo en un entorno con CUDA 12.8.1, pero la ejecucion esta orientada a la plataforma ARIES.
- Compatibilidad con GPU de consumo: no disponible; no se documenta soporte para RTX 4090 u otras GPU de consumo.
- Opciones de despliegue: qbruntime 1.5.0 (runtime de mobilint) con el artefacto MXQ; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un detector.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.
- Requisito de version: mblt-model-zoo <= 2.12 debe fijar una revision anterior, ya que el directorio legacy `aries/` fue eliminado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mobilint/YOLOv8m (esta ficha) | no disponible (artefacto 33,6 MB) | no aplica | map50_95 0,49931; map50 0,66921 en COCO | AGPL-3.0 | HuggingFace, formato MXQ |
| Ultralytics/YOLOv8m (modelo base) | no disponible en la informacion | no aplica | no disponible en la informacion | AGPL-3.0 | HuggingFace / Ultralytics |
| Otros detectores de la familia YOLO | no disponible | no aplica | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de los modelos alternativos en la informacion proporcionada, por lo que la comparacion cuantitativa no es posible.

## Limitaciones y advertencias

- Ambito restringido: es un detector de objetos, no un modelo de lenguaje; no genera texto, no razona y no soporta tool calling ni agentes.
- Dependencia de hardware propietario: el artefacto MXQ esta compilado para qbruntime y la plataforma ARIES; no es portable a otros runtimes sin recompilacion.
- Modos limitados: solo soporta `single`, `multi`, `global4` y `global8`; otros modos de nucleo no estan disponibles.
- Compatibilidad de version: mblt-model-zoo <= 2.12 debe fijar una revision anterior por la eliminacion del directorio legacy `aries/`.
- Licencia AGPL-3.0: el uso comercial exige cumplir las obligaciones de la licencia, incluida la disponibilidad del codigo fuente para servicios en red; conviene revisarlo con el equipo legal.
- Sesgos y alucinaciones: no se documentan sesgos especificos, pero al ser un detector entrenado sobre COCO hereda los sesgos de composicion y anotacion de ese dataset; las detecciones erroneas (falsos positivos) son el equivalente funcional a las alucinaciones.
- Idiomas: no aplica, al no procesar texto.
- Datos de entrenamiento no documentados en esta ficha: la model card de mobilint no detalla el dataset de entrenamiento original ni los hiperparametros.
- Verificacion obligatoria: conviene validar el SHA-256 del archivo descargado contra el valor publicado antes de desplegarlo en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mobilint/YOLOv8m
- Repositorio de Ultralytics: https://github.com/ultralytics/ultralytics
- Carpeta arxiv del modelo en mobilint: https://github.com/mobilint/mblt-model-arxiv/tree/main/models/object_detection/YOLOv8m
- Modelo base: https://huggingface.co/Ultralytics/YOLOv8
