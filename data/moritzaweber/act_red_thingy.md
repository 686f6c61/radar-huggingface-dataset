# moritzaweber/act_red_thingy

## Resumen

El modelo `moritzaweber/act_red_thingy` es una política de control robótico basada en el método Action Chunking with Transformers (ACT), entrenada con la librería LeRobot de HuggingFace. Desarrollado por Moritz Weber, el modelo resuelve la tarea de manipulación "Grab the red thingy" (agarrar un objeto rojo) mediante aprendizaje por imitación a partir de demostraciones teleoperadas. Con 51,7 millones de parámetros, es un modelo compacto diseñado para ejecutarse en tiempo real en un robot seguidor (so_follower) equipado con una cámara frontal.

La relevancia de este modelo radica en que ejemplifica el flujo completo de LeRobot: desde la grabación de un pequeño dataset (5 episodios, 2396 frames) hasta el entrenamiento y publicación de una política lista para despliegue. Aunque su alcance es limitado por la escasez de datos y la ausencia de evaluación reportada, sirve como referencia práctica para desarrolladores que quieran implementar ACT en sus propios robots. El modelo se distribuye bajo licencia Apache 2.0 y los pesos están en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizacion publicada) |
| Idiomas soportados | no disponible (modelo de robotica, no procesa lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un metodo de aprendizaje por imitacion que predice secuencias de acciones (chunks) en lugar de pasos individuales, lo que mejora la estabilidad y la tasa de exito en tareas de manipulacion. La arquitectura combina un codificador visual (procesa imagenes de 480x640 píxeles) con un codificador de estado (6 dimensiones) y un decodificador que genera acciones de 6 dimensiones. El modelo fue entrenado con el optimizador AdamW, una tasa de aprendizaje de 1e-5, batch size de 8 y 100 pasos de entrenamiento, usando el dataset `moritzaweber/record-test_20260819_020209` que contiene 5 episodios teleoperados a 30 FPS. No se aplicaron tecnicas de RLHF ni DPO; es un entrenamiento puro de imitacion supervisada.

## Capacidades

- Control de robot manipulador: genera acciones de 6 grados de libertad (posicion y orientacion del efector final) a partir de observaciones visuales y de estado.
- Percepcion visual: procesa imagenes RGB de una camara frontal (480x640) para guiar la manipulacion.
- Aprendizaje por imitacion: reproduce comportamientos aprendidos de demostraciones humanas teleoperadas.
- Ejecucion en tiempo real: disenado para inferencia continua en robotica, con soporte de LeRobot para rollout.
- Sin capacidades de lenguaje, tool calling, agentes ni razonamiento multimodal fuera del ambito robotico.

## Casos de uso

- Automatizacion de tareas de pick-and-place en entornos controlados: el modelo puede ejecutar la tarea de agarrar un objeto rojo en una configuracion fija, util para lineas de montaje simples o celdas de trabajo repetitivas.
- Prototipado rapido de politicas robotica con LeRobot: sirve como punto de partida para desarrolladores que quieran entender el flujo de entrenamiento y despliegue de ACT sin partir de cero.
- Investigacion en aprendizaje por imitacion: permite estudiar el efecto de datasets pequenos (5 episodios) en la generalizacion de politicas ACT, comparando con modelos entrenados con mas datos.
- Validacion de hardware robotico: al ser un modelo ligero, puede usarse para verificar que el robot so_follower, las camaras y el pipeline de LeRobot funcionan correctamente antes de entrenar politicas mas complejas.
- Educacion y formacion en robotica: adecuado para cursos o talleres donde se ensena a entrenar y desplegar politicas de manipulacion con herramientas open source.
- Benchmark de referencia en el ecosistema LeRobot: al estar publicado en el Hub, puede utilizarse como caso de estudio para comparar configuraciones de entrenamiento (pasos, batch, lr) y su impacto en el rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no hay resultados de evaluacion en robot real ("No evaluation results have been provided for this policy yet"). No se dispone de datos de MMLU, HumanEval u otros benchmarks, ya que se trata de un modelo de robotica y no de lenguaje o codigo.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 51,7 millones de parametros, la inferencia requiere menos de 1 GB de VRAM en FP32. Con cuantizacion (no publicada) podria ejecutarse incluso en CPU.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente, por ejemplo NVIDIA GTX 1650, RTX 2060 o superiores. Tambien puede ejecutarse en CPU para pruebas no en tiempo real.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU consumer moderna e incluso en placas de desarrollo como Jetson Nano o Raspberry Pi con aceleracion.
- Opciones de despliegue: LeRobot proporciona el comando `lerobot-rollout` para ejecutar la politica en el robot. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se han publicado mediciones. Dado el tamano del modelo y la resolucion de imagen (480x640), se espera una latencia de decenas de milisegundos en GPU, suficiente para control en tiempo real a 30 FPS.

## Comparativa con modelos similares

No se dispone de informacion suficiente para una comparativa rigurosa. El unico modelo similar encontrado en la busqueda es `Moritz7/model-2`, tambien basado en ACT y LeRobot, pero no se conocen sus especificaciones tecnicas ni rendimiento. Se recomienda consultar el Hub de HuggingFace para otros modelos ACT entrenados con LeRobot, aunque no hay datos publicados que permitan una tabla comparativa fiable.

## Limitaciones y advertencias

- Dataset extremadamente pequeno: entrenado con solo 5 episodios y 2396 frames, lo que limita gravemente la generalizacion a nuevas posiciones, iluminacion o variaciones del objeto.
- Sin evaluacion reportada: no hay resultados de exito en robot real, por lo que el rendimiento real es desconocido y podria fallar en condiciones no vistas.
- Dependencia de la configuracion hardware: la politica espera una camara frontal especifica (indices y calibracion) y un robot so_follower; cualquier cambio en la disposicion fisica puede invalidar el comportamiento.
- Sin capacidades de lenguaje: no es un modelo multimodal ni de texto; no debe usarse para tareas de NLP o generacion de contenido.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero el autor no ofrece garantias de funcionamiento ni soporte.
- Riesgo de sobreajuste: con 100 pasos de entrenamiento y un dataset tan reducido, es probable que el modelo memorice las demostraciones y falle ante perturbaciones minimas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/moritzaweber/act_red_thingy
- Dataset de entrenamiento: https://huggingface.co/datasets/moritzaweber/record-test_20260819_020209
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
