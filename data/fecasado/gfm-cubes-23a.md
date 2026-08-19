# fecasado/gfm-cubes-23a

## Resumen

El modelo `fecasado/gfm-cubes-23a` es una política de control robótico basada en *gaze flow matching*, desarrollada por el usuario fecasado y publicada en Hugging Face bajo licencia Apache 2.0. Está entrenado con el framework LeRobot de Hugging Face y utiliza el dataset `fecasado/Ncubes-to-Nbaskets-320x240`, que contiene demostraciones de manipulación de cubos en cestas con imágenes de 320x240 píxeles. El modelo tiene 75.549.402 parámetros, lo que lo sitúa en la categoría de modelos pequeños, adecuados para despliegue en robots con hardware limitado.

Este modelo pertenece a la familia de políticas de aprendizaje por imitación para robótica, donde la entrada es una observación visual y la salida son acciones de control (posiciones de articulaciones o comandos de velocidad). La técnica de *gaze flow matching* combina la atención visual (gaze) con el *flow matching*, un método generativo que modela la distribución de acciones condicionada a las observaciones. Es relevante porque aborda tareas de manipulación con un enfoque ligero y eficiente, en un momento en que la robótica basada en aprendizaje busca modelos compactos y transferibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gaze flow matching (politica de robot basada en flujo generativo) |
| Parametros totales | 75.549.402 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (modelo de control, no de lenguaje) |
| Tipos de cuantizacion | No disponible (pesos en safetensors, sin cuantizacion publicada) |
| Idiomas soportados | No aplica (modelo de vision y control) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

La arquitectura exacta no esta documentada en la model card, pero por el nombre y el contexto se trata de una politica de *gaze flow matching* implementada dentro del ecosistema LeRobot. Este tipo de modelos suele combinar un codificador visual (para procesar las imagenes de 320x240) con un mecanismo de atencion que predice puntos de mirada relevantes, y un modulo de *flow matching* que genera las acciones de forma condicionada. El *flow matching* es una alternativa a los modelos de difusion para generar distribuciones de acciones, con la ventaja de ser mas rapido en inferencia.

El entrenamiento se realizo con el dataset `Ncubes-to-Nbaskets-320x240`, que contiene demostraciones de un robot manipulando cubos y colocandolos en cestas. No se especifican el numero de episodios, el total de tokens (no aplica), ni si se utilizaron tecnicas de RLHF o DPO (no aplica a control robotico). El modelo fue entrenado y subido al Hub mediante el framework LeRobot, que gestiona el pipeline completo de captura de datos, entrenamiento y evaluacion.

## Capacidades

- Control de robot para tareas de manipulacion: el modelo genera acciones de control (posiciones de articulaciones o comandos de velocidad) a partir de observaciones visuales.
- Seguimiento de mirada (*gaze*): predice puntos de atencion visual relevantes para la tarea, lo que permite una planificacion de movimientos mas precisa.
- Generacion de trayectorias mediante *flow matching*: modela la distribucion de acciones condicionada a la observacion, permitiendo generar trayectorias suaves y coherentes.
- Trabajo con imagenes de baja resolucion (320x240): optimizado para sensores de camara economicos y robots con computacion limitada.
- Integracion con LeRobot: compatible con el ecosistema de Hugging Face para entrenamiento, evaluacion y despliegue en robots reales o simulados.
- No es un modelo de lenguaje: no genera texto, codigo ni responde a prompts conversacionales.

## Casos de uso

- Recogida y colocacion de objetos en entornos de fabricacion: el modelo puede controlar un brazo robotico para recoger cubos de una superficie y depositarlos en una cesta, tarea tipica de logistica y empaquetado.
- Automatizacion de tareas de clasificacion: con una camara fija y un robot, el modelo puede clasificar objetos por forma o color si se entrena con los datos adecuados (aunque el dataset actual solo cubre cubos en cestas).
- Prototipado de politicas de aprendizaje por imitacion: investigadores pueden usar este modelo como punto de partida para estudiar *gaze flow matching* y compararlo con otras politicas como ACT o Diffusion Policy.
- Despliegue en robots de bajo coste: al tener solo 75.5M parametros, el modelo puede ejecutarse en una Raspberry Pi o en una GPU modesta, lo que lo hace util para proyectos educativos o de investigacion con presupuesto limitado.
- Evaluacion de algoritmos de control en simulacion: se puede cargar en simuladores compatibles con LeRobot (por ejemplo, MuJoCo o simular un SO-100) para validar el comportamiento antes de pasar al hardware real.
- Transferencia a tareas similares: aunque esta entrenado para cubos en cestas, el enfoque de *flow matching* puede adaptarse a otras tareas de manipulacion con un fine-tuning ligero, siempre que se disponga de datos de demostracion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de metricas como tasa de exito en la tarea, error de posicion o comparaciones con otras politicas. Se recomienda consultar el repositorio del autor o ejecutar evaluaciones propias con el framework LeRobot.

## Requisitos de hardware

- VRAM estimada para inferencia: con 75.5M parametros, el modelo en precision fp32 ocupa aproximadamente 302 MB. En fp16 se reduce a unos 151 MB. Sin cuantizacion adicional, cabe en cualquier GPU con al menos 1 GB de VRAM.
- GPUs recomendadas: cualquier GPU moderna con soporte CUDA, desde una NVIDIA GTX 1050 hasta una RTX 4090. Tambien puede ejecutarse en CPU para inferencia lenta, aunque no es lo recomendado para control en tiempo real.
- Compatibilidad con GPUs de consumo: si, cabe en todas las GPUs de consumo actuales y en muchas integradas (aunque con menor rendimiento).
- Opciones de despliegue: LeRobot ofrece scripts de evaluacion e inferencia; tambien se puede exportar a ONNX o TensorRT si se desea optimizar, aunque no hay documentacion publica al respecto.
- Latencia y throughput: no se han publicado datos. Dado el tamano del modelo, se espera una latencia de pocos milisegundos en una GPU moderna, pero no hay cifras confirmadas.

## Comparativa con modelos similares

No se dispone de informacion publica sobre modelos comparables especificamente con *gaze flow matching* en el repositorio de Hugging Face. Existen otras politicas de robot en LeRobot como ACT (Action Chunking with Transformers) o Diffusion Policy, pero no hay benchmarks publicados que comparen este modelo con ellas. Por tanto, no se puede ofrecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Modelo experimental: no hay evidencia publica de evaluacion en robot real ni de robustez ante variaciones de iluminacion, posicion de camara o tipos de objeto.
- Dataset limitado: el entrenamiento se realizo con un dataset especifico (cubos en cestas) y no se conoce su tamano ni diversidad. El modelo puede no generalizar a otras tareas o entornos.
- Sin soporte de lenguaje: no es un modelo multimodal de texto ni puede interpretar instrucciones verbales; solo procesa imagenes y genera acciones.
- Riesgo de sobreajuste: al ser un modelo pequeno y entrenado con un dataset concreto, puede fallar ante cambios en la disposicion de los objetos o en la cinematica del robot.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias de funcionamiento ni soporte.
- No hay informacion sobre sesgos o alucinaciones (concepto no aplicable a control robotico), pero si existe riesgo de comportamiento impredecible ante observaciones fuera de la distribucion de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fecasado/gfm-cubes-23a
- Modelo relacionado (variante 22a): https://huggingface.co/fecasado/gfm-cubes-22a
- Modelo relacionado (variante 22b): https://huggingface.co/fecasado/gfm-cubes-22b
- Framework LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
