# egcfwong/cf_policy

## Resumen

El modelo `egcfwong/cf_policy` es una política de robótica basada en el método Action Chunking with Transformers (ACT), entrenada mediante aprendizaje por imitación con el framework LeRobot de HuggingFace. El autor, egcfwong, ha publicado este modelo con el objetivo de que un robot tipo `so_follower` (un brazo robótico de bajo coste estilo SO-100) ejecute una tarea concreta de manipulación: agarrar un cubo compañero y depositarlo en un bol naranja. El modelo se ha entrenado con un conjunto de datos teleoperado de 15 episodios y 6032 fotogramas, y está publicado bajo licencia Apache 2.0.

Se trata de un modelo pequeño (51,7 millones de parámetros) que consume observaciones de estado y dos cámaras (izquierda y superior) para producir acciones de 6 dimensiones. Su relevancia radica en que demuestra el flujo completo de entrenamiento y despliegue de políticas robóticas con LeRobot, un ecosistema que está ganando tracción en la comunidad de robótica open source por su accesibilidad y reproducibilidad. El modelo no incluye resultados de evaluación en la model card, por lo que su rendimiento real en el robot físico no está documentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) - transformer con prediccion de chunks de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica directamente; el modelo procesa observaciones de imagen y estado) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizacion publicada) |
| Idiomas soportados | no disponible (modelo de robotica, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria LeRobot) |

## Arquitectura y entrenamiento

El modelo implementa el metodo ACT (Action Chunking with Transformers), descrito en el paper arXiv:2304.13705. ACT es un metodo de aprendizaje por imitacion que predice secuencias de acciones (chunks) en lugar de acciones individuales, lo que mejora la estabilidad y precision del control en tareas de manipulacion. La arquitectura interna es un transformer que procesa las observaciones visuales (imagenes de camara izquierda y superior, ambas de 640x480) junto con el estado del robot (vector de 6 dimensiones) y genera un chunk de acciones de 6 dimensiones.

El entrenamiento se realizo con el framework LeRobot version 0.6.1, usando el dataset `egcfwong/test_1_20260829_164444` que contiene 15 episodios teleoperados a 30 FPS. La configuracion de entrenamiento incluye 628 pasos, batch size de 192, optimizador AdamW con learning rate de 1e-05 y semilla 1000. No se menciona el uso de RLHF, DPO u otras tecnicas de refinamiento; es un entrenamiento puramente supervisado de imitacion.

## Capacidades

- Control de robot manipulador: genera acciones de 6 grados de libertad (posicion y orientacion del efector final) a partir de observaciones de estado y vision.
- Percepcion visual multimodal: procesa simultaneamente dos camaras (izquierda y superior) con resolucion 640x480.
- Ejecucion de tareas de manipulacion especificas: entrenado para agarrar un cubo y colocarlo en un bol.
- Generalizacion limitada: al ser un modelo de imitacion con pocos episodios, su capacidad de generalizar a posiciones u objetos no vistos es reducida.
- Integracion con LeRobot: compatible con el ecosistema de herramientas de HuggingFace para robotica (entrenamiento, rollout, visualizacion de datasets).

## Casos de uso

- Manipulacion pick-and-place en laboratorio: el modelo puede ejecutar la tarea de recoger un cubo y depositarlo en un recipiente, util para automatizar experimentos repetitivos en entornos de investigacion.
- Prototipado rapido de politicas robóticas: gracias a su tamano reducido y al flujo de LeRobot, sirve como punto de partida para validar el pipeline de entrenamiento antes de escalar a tareas mas complejas.
- Educacion en robotica: permite a estudiantes e investigadores experimentar con aprendizaje por imitacion en hardware de bajo coste (tipo SO-100) sin necesidad de infraestructura avanzada.
- Benchmarking de metodos de imitacion: al estar publicada la configuracion completa de entrenamiento, puede usarse como referencia para comparar variantes de ACT u otros algoritmos.
- Desarrollo de sistemas de teleoperacion asistida: el modelo puede integrarse en sistemas donde el robot ejecuta la tarea aprendida mientras un operador supervisa o interviene en casos limite.
- Evaluacion de robustez visual: al usar dos camaras con orientaciones distintas, permite estudiar como afecta la variacion de iluminacion o perspectiva al rendimiento de la politica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no hay resultados de evaluacion ("No evaluation results have been provided for this policy yet"). No se reportan metricas como tasa de exito, ni comparaciones con otros modelos en la tarea.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 51,7 millones de parametros, la inferencia en precision FP32 requiere aproximadamente 200 MB de VRAM (51,7M * 4 bytes). Con cuantizacion a FP16 o INT8, el consumo se reduce a unos 100 MB o 50 MB respectivamente.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente. Modelos como NVIDIA GTX 1050 Ti, RTX 2060 o superiores funcionan sin problemas. Incluso podria ejecutarse en CPU para inferencia a baja frecuencia.
- Compatibilidad con GPU de consumo: si, cabe sobradamente en cualquier GPU consumer actual (RTX 3060, RTX 4090, etc.) y tambien en placas de desarrollo como Jetson Nano o Raspberry Pi con aceleracion.
- Opciones de despliegue: LeRobot ofrece el comando `lerobot-rollout` para ejecutar la politica en un robot real. Tambien puede cargarse el modelo en PyTorch directamente y usarse con ROS u otros frameworks de robotica.
- Latencia y throughput: no hay datos publicados, pero al ser un modelo pequeno, la inferencia deberia ser de pocos milisegundos en GPU moderna, permitiendo control en tiempo real a 30 Hz o mas.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables publicados con la misma tarea y configuracion en la informacion proporcionada. El modelo es una instancia especifica de ACT entrenada con LeRobot, y no existen datos de rendimiento que permitan una comparacion objetiva con alternativas como Diffusion Policy o RT-1 en esta tarea concreta.

## Limitaciones y advertencias

- Datos de entrenamiento muy limitados: solo 15 episodios y 6032 fotogramas, lo que probablemente cause sobreajuste a la configuracion exacta de la tarea (posicion de objetos, iluminacion, etc.).
- Sin resultados de evaluacion: no hay evidencia publica de que la politica funcione de forma fiable en el robot real; el autor no ha reportado tasas de exito.
- Generalizacion pobre: al ser aprendizaje por imitacion con pocos datos, el modelo no generalizara a nuevas posiciones de objetos, cambios de iluminacion o variaciones en el entorno.
- Dependencia de las camaras: el rendimiento depende criticamente de la calibracion y posicion de las camaras `left` y `top`; cualquier cambio en su orientacion degradara la precision.
- Tarea muy especifica: el modelo solo sabe ejecutar la tarea "grab the campanion cube and put it into the orange bowl"; no es reutilizable para otras tareas sin reentrenamiento.
- Riesgo de alucinacion en acciones: en situaciones fuera de distribucion, el modelo puede generar acciones incoherentes o peligrosas para el robot; se recomienda supervisar siempre la ejecucion.
- Licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantias de funcionamiento seguro en entornos de produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/egcfwong/cf_policy
- Dataset de entrenamiento: https://huggingface.co/datasets/egcfwong/test_1_20260829_164444
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot para ACT: https://huggingface.co/docs/lerobot/main/en/act
