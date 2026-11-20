# npow/dreamzero-yam-red-lid-conveyor-600

## Resumen

DreamZero YAM red-lid conveyor es un modelo de vision-lenguaje-accion (VLA) publicado por el usuario npow en Hugging Face, derivado por fine-tuning del modelo base GEAR-Dreams/DreamZero-AgiBot. El checkpoint está especializado en una tarea robótica concreta: la recogida con brazo izquierdo de un robot YAM sobre un conjunto de datos de cinta transportadora con tapas rojas. El modelo consume tres vistas de cámara RGB de resolución 640×480 junto con un vector de estado del robot de 7 elementos, y produce una secuencia de 24 acciones, cada una con 7 dimensiones.

Con 22.924.172.115 parámetros (aproximadamente 22,9 mil millones) y un repositorio de 45,8 GB distribuido en diez shards de Safetensors, se trata de un VLA de gran tamaño orientado a control robótico de manipulación. El fine-tuning se realizó durante 600 pasos y las actualizaciones LoRA se fusionaron en los pesos completos antes de la exportación, de modo que el artefacto publicado es un checkpoint denso listo para inferencia con runners compatibles con DreamZero.

La relevancia de esta ficha es acotada: no es un modelo de propósito general, sino un adaptador especializado de una política robótica para un entorno y una tarea muy específicos. Su interés técnico radica en ilustrar el flujo de trabajo de fine-tuning de VLAs sobre modelos base de robótica y en documentar las dimensiones de entrada y salida que un runner debe respetar para desplegarlo correctamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA) basada en GEAR-Dreams/DreamZero-AgiBot; detalles internos de la arquitectura no disponibles |
| Parametros totales | 22.924.172.115 (22,9 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo publica pesos en Safetensors sin indicar variantes cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (diez shards) + configuracion del processor |

## Arquitectura y entrenamiento

El modelo es un VLA (vision-language-action) derivado de DreamZero-AgiBot, un modelo base de robótica de GEAR-Dreams. La arquitectura interna del modelo base (composicion de vision encoder, backbone de lenguaje y cabeza de acciones) no se detalla en la informacion disponible; lo que si se especifica es la interfaz de E/S de la politica: tres camaras RGB a 640×480, un estado del robot de 7 elementos y una salida de 24 acciones de 7 elementos cada una.

El entrenamiento consistio en un fine-tuning de 600 pasos sobre el conjunto de datos de cinta transportadora con tapas rojas, para la tarea de pick-up con brazo izquierdo del robot YAM. Las actualizaciones LoRA se fusionaron en los pesos completos antes de la exportacion, por lo que el checkpoint publicado es denso y no requiere cargar adaptadores por separado. El autor documenta los detalles de entrenamiento y los hashes SHA-256 de los shards en el archivo `training-provenance.json` incluido en el repositorio. No se dispone de informacion sobre volumen de datos, composicion del dataset, uso de RLHF/DPO ni innovaciones tecnicas adicionales.

## Capacidades

- Percepcion visual multi-camara: ingiere tres vistas RGB simultaneas de 640×480, lo que permite construir una representacion espacial del entorno de trabajo.
- Control robótico de manipulacion: predice secuencias de 24 acciones de 7 dimensiones a partir del estado del robot y de las observaciones visuales.
- Condicionamiento por estado del robot: incorpora un vector de 7 elementos (tipicamente posicion y orientacion de efector, apertura de pinza y estado articular) como entrada junto a las imagenes.
- Especializacion en tarea de pick-up: entrenado especificamente para la recogida con brazo izquierdo sobre la cinta transportadora de tapas rojas.
- Integracion con runners DreamZero: disenado para ejecutarse con un runner compatible que respete el embodiment y los metadatos guardados en el checkpoint.
- No se documentan capacidades de generacion de texto, razonamiento general, codigo, matematicas, tool calling, agentes multi-paso ni soporte multilingue.

## Casos de uso

- Automatizacion de picking en linea de montaje: el modelo recibe las tres camaras y el estado del brazo YAM y emite la secuencia de 24 acciones para recoger piezas con tapa roja de la cinta; es adecuado porque fue fine-tuneado exactamente sobre esa distribucion visual y ese embodiment.
- Prototipado rapido de politicas sobre hardware YAM: sirve como punto de partida para equipos que ya operan brazos YAM y quieren evaluar un checkpoint preentrenado antes de invertir en recoleccion de datos propia.
- Benchmarking de infraestructura de inferencia VLA: al ser un checkpoint denso de 22,9 mil millones de parametros en Safetensors, permite medir latencia y throughput de runners DreamZero sobre GPUs concretas.
- Investigacion en fine-tuning de VLAs: el repositorio documenta pasos de entrenamiento, fusion de LoRA y hashes de shards, lo que lo convierte en una referencia reproducible para estudiar el efecto de 600 pasos de adaptacion sobre un modelo base.
- Pruebas de integracion sensor-politica: util para validar pipelines de captura sincronizada de tres camaras a 640×480 y publicacion del estado del robot a 7 elementos antes de desplegar en produccion.
- Validacion de seguridad en celulas robotizadas: permite ejecutar la politica en entornos simulados o de banco de pruebas para caracterizar el comportamiento del brazo izquierdo antes de habilitarlo en linea real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 22,9 mil millones de parametros, en FP16/BF16 los pesos ocupan aproximadamente 45,8 GB, lo que exige al menos 48 GB de VRAM solo para pesos, mas memoria para activaciones y buffers de vision; en cuantizacion de 8 bits se reduciria a unos 23 GB y en 4 bits a unos 11,5 GB, pero el repositorio no publica variantes cuantizadas.
- GPU recomendadas: A100 de 80 GB y H100 de 80 GB son las opciones seguras para FP16; A100 de 40 GB y L40S de 48 GB quedan al limite y probablemente requieran cuantizacion.
- GPU de consumo: no cabe en RTX 4090 (24 GB) en FP16; solo seria viable con cuantizacion agresiva a 4 bits, no distribuida por el autor.
- Opciones de despliegue: runner compatible con DreamZero utilizando el embodiment y los metadatos guardados en el checkpoint; vLLM, llama.cpp, Ollama y TGI no estan documentados como soportados para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| npow/dreamzero-yam-red-lid-conveyor-600 | 22,9 mil millones | no disponible | no disponible | Apache 2.0 | Hugging Face, 0 descargas |
| GEAR-Dreams/DreamZero-AgiBot (modelo base) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible en la informacion proporcionada | Hugging Face |
| Otros VLAs de robotica de tamano comparable | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al modelo base, del que este checkpoint deriva por fine-tuning de 600 pasos con LoRA fusionado. No se dispone de datos de parametros, contexto ni rendimiento del modelo base en la informacion proporcionada, ni de alternativas comparables verificables.

## Limitaciones y advertencias

- Especializacion extrema: la politica esta entrenada para una unica tarea (pick-up con brazo izquierdo sobre cinta de tapas rojas) y un unico embodiment (YAM); su comportamiento fuera de esa distribucion no esta garantizado.
- Sin datos de evaluacion: no se publican benchmarks ni metricas de exito, por lo que no es posible estimar la tasa de acierto de la politica antes de desplegarla.
- Riesgo de sobreajuste: 600 pasos de fine-tuning sobre un dataset concreto pueden producir sobreajuste al entorno de entrenamiento, con degradacion ante cambios de iluminacion, posicion de objetos o configuracion de camaras.
- Dependencia del runner: requiere un runner compatible con DreamZero que respete el embodiment y los metadatos guardados; no hay soporte documentado en frameworks de inferencia genericos.
- Requisitos de memoria elevados: 45,8 GB de pesos en FP16 limitan el despliegue a GPUs de 80 GB o a cuantizacion no publicada por el autor.
- Idiomas y contexto: no se dispone de informacion sobre cobertura linguistica ni longitud de contexto, lo que impide evaluar su uso fuera del control robótico.
- Trazabilidad: los hashes SHA-256 de los shards y los detalles de entrenamiento estan en `training-provenance.json`, pero no se documentan el volumen ni la procedencia del dataset.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento en produccion ni sobre la seguridad fisica de la politica en entornos reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/npow/dreamzero-yam-red-lid-conveyor-600
- Modelo base DreamZero-AgiBot: https://huggingface.co/GEAR-Dreams/DreamZero-AgiBot
- Revision concreta del modelo base citada por el autor: https://huggingface.co/GEAR-Dreams/DreamZero-AgiBot/tree/a8e108456e537ab30e7e84523d41d12a7e739ca5
- Archivo de trazabilidad del entrenamiento: https://huggingface.co/npow/dreamzero-yam-red-lid-conveyor-600/blob/main/training-provenance.json
- Licencia Apache 2.0: https://huggingface.co/npow/dreamzero-yam-red-lid-conveyor-600/blob/main/LICENSE
