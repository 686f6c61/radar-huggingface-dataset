# ciaociao0617/pusht-act-100k

## Resumen

Este modelo es una política de aprendizaje por imitación basada en Action Chunking with Transformers (ACT), entrenada sobre el entorno de simulación PushT. El método ACT, propuesto en el artículo arxiv:2304.13705, predice secuencias cortas de acciones (action chunks) en lugar de acciones individuales, lo que mejora la estabilidad y la tasa de éxito en tareas de manipulación robótica. El modelo ha sido entrenado y publicado mediante el framework LeRobot de Hugging Face, lo que garantiza su reproducibilidad y facilita su integración en pipelines robóticos existentes.

El modelo procesa observaciones visuales de una cámara (imagen RGB de 96x96 píxeles) junto con el estado del robot (posición 2D) y genera acciones de control continuas en dos dimensiones. Con aproximadamente 51,7 millones de parámetros, es una política compacta diseñada específicamente para la tarea de empujar un bloque con forma de T hacia un objetivo con la misma forma. Su relevancia radica en que ACT es uno de los métodos de aprendizaje por imitación más utilizados en robótica, y este modelo constituye un ejemplo práctico de entrenamiento completo con LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.660.418 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica; procesa observaciones por paso) |
| Tipos de cuantizacion | no disponible (pesos en precisión completa) |
| Idiomas soportados | no disponible (modelo de robótica, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un transformer con una arquitectura de autoencoder variacional condicional (CVAE). El modelo se entrena para predecir un fragmento de acciones futuras (action chunk) condicionado a las observaciones actuales (imagen y estado). Durante la inferencia, el modelo ejecuta el fragmento de acciones completo antes de volver a muestrear observaciones, lo que reduce la acumulación de errores y mejora la precisión en tareas de manipulación.

El entrenamiento se realizó con el framework LeRobot versión 0.6.1, utilizando el dataset público lerobot/pusht, que contiene 206 episodios y 25.650 fotogramas a 10 FPS. La configuración de entrenamiento incluye 100.000 pasos, batch size de 64, optimizador AdamW con learning rate de 1e-05 y semilla 1000. La tarea consiste en empujar un bloque con forma de T hasta un objetivo con la misma forma, un benchmark estándar para políticas visuomotoras. No se ha aplicado RLHF ni DPO; se trata de aprendizaje supervisado por imitación.

## Capacidades

- Generacion de acciones de control continuo en 2D para manipulacion robotica.
- Procesamiento de observaciones visuales (imagen RGB de 96x96) y estado del robot (posicion 2D).
- Prediccion de secuencias de acciones (action chunking) para ejecucion estable.
- Ejecucion de politicas visuomotoras en el entorno de simulacion PushT.
- Integracion con el ecosistema LeRobot para entrenamiento, evaluacion y despliegue.
- Soporte de inferencia en tiempo real con hardware GPU (a traves de LeRobot).
- No soporta tool calling, agentes conversacionales ni procesamiento de lenguaje natural.

## Casos de uso

- Investigacion en aprendizaje por imitacion: el modelo sirve como punto de partida para estudiar el comportamiento de ACT en tareas de manipulacion, comparar variantes o analizar el efecto del action chunking.
- Desarrollo de politicas roboticas en simulacion: permite validar algoritmos de control y planificacion en el entorno PushT antes de transferirlos a robots fisicos.
- Benchmarking de frameworks de robotica: al estar publicado con LeRobot, puede utilizarse para evaluar el rendimiento del framework, comparar configuraciones de entrenamiento o medir tiempos de inferencia.
- Educacion en robotica y aprendizaje automatico: adecuado para cursos y talleres que necesiten un ejemplo funcional de politica visuomotora entrenada con transformers.
- Reproduccion de experimentos: investigadores pueden reproducir los resultados del articulo de ACT y verificar la implementacion de LeRobot.
- Evaluacion de metricas de rendimiento: el modelo permite medir tasas de exito, latencia y robustez en el entorno PushT, sirviendo como referencia para otros metodos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion para esta politica. No se dispone de datos de tasa de exito en el entorno PushT ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: dado el tamano del modelo (51,7 M de parametros) y la entrada de imagen de 96x96, la inferencia requiere menos de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 4 GB de VRAM es suficiente; una RTX 3060 o superior ofrece margen comodo.
- Compatibilidad con GPU de consumo: si, cabe en practicamente cualquier GPU moderna de consumo.
- Opciones de despliegue: el modelo se ejecuta mediante LeRobot, que soporta inferencia local con PyTorch y CUDA. No se proporcionan archivos GGUF ni integraciones con vLLM u Ollama.
- Latencia y throughput: no disponibles. Al ser un modelo pequeno y con entrada de baja resolucion, se espera una latencia inferior a 10 ms por paso en GPU modernas, pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ciaociao0617/pusht-act-100k | 51,7 M | no disponible | PushT (empujar bloque T) | Apache 2.0 | Hugging Face |
| arclabmit/pusht_act_model | no disponible | no disponible | PushT | no disponible | Hugging Face |
| thehui/act_pusht_model | no disponible | no disponible | PushT | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativos entre estos modelos. Los tres estan entrenados en la misma tarea con el mismo metodo, pero no hay informacion publica sobre sus respectivas tasas de exito. La principal diferencia es que el modelo de ciaociao0617 declara explicitamente la licencia Apache 2.0 y el numero de parametros.

## Limitaciones y advertencias

- No se han publicado resultados de evaluacion: la model card indica que no hay datos de tasa de exito, por lo que se desconoce el rendimiento real del modelo.
- Entrenado exclusivamente en simulacion: el modelo solo ha visto datos del entorno PushT; no es directamente transferible a robots fisicos sin reentrenamiento o adaptacion.
- Entrada de baja resolucion: la imagen de 96x96 píxeles puede limitar el rendimiento en tareas que requieran mayor detalle visual.
- Sin capacidades linguisticas: no es un modelo de lenguaje; no puede procesar texto ni mantener conversaciones.
- Dependencia de LeRobot: para ejecutar el modelo es necesario instalar y configurar el framework LeRobot, lo que anade una capa de complejidad.
- Tarea muy especifica: el modelo esta disenado para una unica tarea (empujar un bloque T) y no generaliza a otras tareas de manipulacion sin reentrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero es recomendable revisar los terminos completos de la licencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ciaociao0617/pusht-act-100k
- Articulo de ACT: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Dataset PushT: https://huggingface.co/datasets/lerobot/pusht
