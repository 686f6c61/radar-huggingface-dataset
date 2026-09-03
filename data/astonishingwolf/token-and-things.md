# astonishingwolf/token-and-things

## Resumen

`token-and-things` es un proyecto de investigación sobre tokenización de acciones continuas para políticas autoregresivas en robótica, desarrollado por astonishingwolf (Soham Dasgupta). El modelo aborda el problema de representar acciones de control de robots (en este caso, acciones de baja dimensión con rotación absoluta en formato rot6d) como tokens discretos, de modo que una política autoregresiva pueda predecirlos secuencialmente. Se basa en el enfoque OAT (action tokenizer) y utiliza un tokenizador mínimo llamado MinimalTok, compuesto por un encoder, un cuantizador FSQ y un decoder, seguido de una política de tokens autoregresiva entrenada sobre un tokenizador congelado.

El proyecto se estructura en tres subpaquetes independientes: `tokenization/` (entrenamiento del tokenizador), `policy/` (entrenamiento de la política autoregresiva con simulación en el bucle) y `simulation/` (evaluación con rollouts de horizonte receding y generación de vídeo). Está diseñado para ejecutarse sobre el simulador robomimic (versión 0.4) y robosuite 1.5.1, con MuJoCo como motor físico. La relevancia actual radica en que la tokenización de acciones es un paso clave para aplicar modelos de lenguaje y arquitecturas autoregresivas al control robótico, un área en plena expansión dentro de la investigación en imitación y aprendizaje por refuerzo.

No se dispone de información pública sobre el tamaño del modelo, la licencia, los idiomas o los benchmarks, ya que el repositorio se centra en el código y la metodología, no en un modelo preentrenado distribuido. Es un proyecto de código abierto orientado a reproducibilidad, con un entorno fijado mediante `uv.lock`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MinimalTok (encoder + FSQ + decoder) + politica autoregresiva de tokens (model.arch: oat o torch) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (las acciones se tokenizan por paso de tiempo, no hay contexto de lenguaje) |
| Tipos de cuantizacion | no disponible (el modelo usa FSQ para cuantizar acciones, no cuantizacion de pesos) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | checkpoints .pt (PyTorch) y .ckpt (OAT compatible) |

## Arquitectura y entrenamiento

El sistema se compone de dos etapas diferenciadas. Primero, un tokenizador de acciones (MinimalTok) que sigue el diseño de OAT: un encoder que transforma las acciones continuas (por ejemplo, posiciones y rotaciones absolutas rot6d) en representaciones latentes, un cuantizador FSQ (Finite Scalar Quantization) que discretiza esas representaciones en tokens, y un decoder que reconstruye las acciones originales. El entrenamiento del tokenizador incluye un dropout de ruido FSQ activado por defecto, lo que mejora la robustez. En segundo lugar, una política autoregresiva de tokens que predice secuencialmente los tokens de acción sobre un tokenizador congelado, entrenada con simulación en el bucle (sim-in-the-loop) sobre tareas robomimic de baja dimensión (por ejemplo, la tarea `square` con captura de posición y orientación absoluta).

El entrenamiento se realiza con datasets del repositorio `ChaoyiPan/mip-dataset` de HuggingFace, que se descargan automáticamente en el primer uso. El proyecto soporta dos variantes de arquitectura para la política: `model.arch: oat` (por defecto) que reproduce exactamente los módulos de OAT y permite cargar checkpoints de OAT, y `model.arch: torch` que es una variante anterior basada en un transformer estándar. El entorno de entrenamiento se fija mediante `uv.lock`, que pinza todas las dependencias (torch con CUDA en Linux). No se especifican datos sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO, ya que no es un modelo de lenguaje.

## Capacidades

- Tokenizacion de acciones continuas de robot: convierte acciones de baja dimension (posicion, rotacion rot6d) en tokens discretos mediante FSQ, permitiendo su uso con modelos autoregresivos.
- Generacion de politicas autoregresivas: entrena una politica que predice tokens de accion secuencialmente, adecuada para control robotico en simulacion.
- Evaluacion en simulacion robomimic: incluye un subpaquete de simulacion con rollouts de horizonte receding, calculo de tasa de exito y generacion de video (mp4) de los episodios.
- Compatibilidad con checkpoints OAT: puede cargar checkpoints del tokenizador OAT original (formato .ckpt) y convertirlos al formato MinimalTok, lo que facilita la comparacion y reutilizacion.
- Reproducibilidad del entorno: usa `uv` y `uv.lock` para fijar todas las dependencias, garantizando que el entorno de entrenamiento sea exactamente reproducible.
- Soporte para tareas low-dim de robomimic: disenado especificamente para tareas de manipulacion de baja dimension (por ejemplo, `square`), con acciones absolutas rot6d.

## Casos de uso

- Aprendizaje por imitacion en robotica: el tokenizador y la politica pueden usarse para aprender politicas de control a partir de demostraciones humanas o teleoperadas, representando las acciones como tokens y prediciendolas autoregresivamente, lo que facilita el entrenamiento con arquitecturas de secuencia.
- Investigacion en tokenizacion de acciones: el subpaquete `tokenization/` permite experimentar con diferentes configuraciones de FSQ, dropout de ruido y arquitecturas de encoder/decoder, siendo util para estudiar el efecto de la discretizacion en la calidad del control.
- Desarrollo de politicas con simulacion en el bucle: el subpaquete `policy/` entrena la politica mientras evalua periodicamente en simulacion (cada `sim.eval_freq` pasos), lo que permite monitorizar el progreso y seleccionar el mejor checkpoint (`best.pt`) segun la tasa de exito.
- Evaluacion estandarizada de politicas robotica: el subpaquete `simulation/` proporciona un evaluador independiente que ejecuta 50 episodios, calcula la tasa de exito y genera un video de los primeros episodios, ideal para comparar diferentes politicas o tokenizadores.
- Reproduccion de experimentos de OAT: gracias a la compatibilidad con checkpoints OAT, se pueden cargar tokenizadores preentrenados de OAT y entrenar politicas sobre ellos, facilitando la comparacion directa con los resultados publicados en ese trabajo.
- Integracion en pipelines de robotica con MuJoCo: al usar robomimic y robosuite, el proyecto se integra con el ecosistema de simulacion de MuJoCo, permitiendo extenderlo a otras tareas o entornos compatibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas comparativas con otros metodos ni metricas cuantitativas de rendimiento (como tasas de exito en tareas robomimic) en la model card. La unica referencia a evaluacion es la mencion de que el script de simulacion calcula la tasa de exito sobre 50 episodios, pero no se proporcionan valores concretos.

## Requisitos de hardware

- No se especifican requisitos de hardware en la informacion disponible.
- El entrenamiento usa PyTorch con CUDA en Linux, por lo que se requiere una GPU NVIDIA compatible con CUDA.
- Dado que se trata de tareas robomimic de baja dimension y un tokenizador pequeno, es probable que quepa en GPUs de consumo como una RTX 3060 o superior, pero no hay datos confirmados.
- Para la simulacion con MuJoCo, se necesita una GPU o CPU con soporte para renderizado EGL (el script de evaluacion configura `MUJOCO_GL=egl` automaticamente).
- Opciones de despliegue: no se mencionan herramientas como vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje. El proyecto se ejecuta directamente con Python y `uv`.

## Comparativa con modelos similares

No disponible. No se proporcionan comparaciones con otros modelos o metodos de tokenizacion de acciones en la informacion disponible. El proyecto menciona OAT como base, pero no se incluyen datos comparativos de rendimiento ni de arquitectura frente a alternativas como RT-1, RT-2 u otros tokenizadores de acciones.

## Limitaciones y advertencias

- Es un proyecto de investigacion, no un modelo de lenguaje general: no procesa texto, imagenes ni audio, y no es adecuado para tareas de NLP o generacion de contenido.
- No se dispone de licencia explicita: la model card no indica ninguna licencia, por lo que el uso comercial o la redistribucion pueden estar sujetos a restricciones no declaradas. Se recomienda contactar al autor antes de usarlo en produccion.
- Limitado a tareas robomimic de baja dimension: el tokenizador y la politica estan disenados para acciones absolutas rot6d en tareas como `square`; no se ha probado en tareas de alta dimension o con otros tipos de acciones.
- Dependencia de un entorno fijado: el uso de `uv.lock` garantiza reproducibilidad, pero tambien implica que el proyecto puede no funcionar con versiones mas recientes de las dependencias sin ajustes manuales.
- Riesgo de alucinacion o errores en la generacion de acciones: como cualquier politica autoregresiva, puede producir secuencias de tokens invalidas o suboptimas si el tokenizador no esta bien entrenado, aunque no se han documentado casos concretos.
- Sin datos de sesgos: al ser un modelo de control robotico, no aplican sesgos de lenguaje, pero no se ha evaluado la robustez frente a variaciones en los datos de demostracion.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/astonishingwolf/token-and-things
- Perfil de GitHub del autor: https://github.com/astonishingwolf/
- Repositorio OAT (referencia): https://github.com/Chaoqi-LIU/oat
