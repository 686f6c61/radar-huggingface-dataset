# sam-guided-vlas/train_1_2_hard_items__mask__overlay_a100__sim__all_cameras__live__pi05__seed_0

## Resumen

pi05 (π₀.₅) es un modelo Vision-Language-Action (VLA) desarrollado por Physical Intelligence, diseñado para generalizar en entornos robóticos abiertos. Esta publicación concreta es un fine-tune del modelo base `lerobot/pi05_base`, realizado por el usuario `sam-guided-vlas` con el framework LeRobot. El modelo se ha entrenado en un conjunto de datos de manipulación robótica con un brazo Panda, compuesto por 199 episodios y 31.073 frames a 20 FPS, donde el robot debe interactuar con objetos de formas complejas. Con 4.143.404.816 parámetros, el modelo toma como entrada el estado del robot (9 valores) y tres imágenes RGB de 224x224 píxeles, y produce acciones de 7 dimensiones. Su relevancia radica en que pi05 evoluciona el modelo π₀ para mejorar la generalización a situaciones nunca vistas durante el entrenamiento, un paso importante hacia la robótica de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en transformer |
| Parametros totales | 4.143.404.816 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de politica robotica, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura π₀.₅ de Physical Intelligence, un VLA que combina percepcion visual, comprension del estado del robot y generacion de acciones. A diferencia de los modelos de lenguaje, no genera texto, sino que predice acciones de control continuas (7 dimensiones) para un brazo robotico Panda. El fine-tune se ha realizado con el framework LeRobot sobre el modelo base `lerobot/pi05_base`, utilizando un dataset de 199 episodios y 31.073 frames a 20 FPS. Las tareas consisten en manipular objetos con geometrias complejas, como esferas con asas, formas lobuladas o recipientes con relieves. No se dispone de informacion detallada sobre el proceso de entrenamiento (numero de epocas, hiperparametros, tecnica de optimizacion) ni sobre innovaciones tecnicas especificas, mas alla de que la implementacion de LeRobot esta adaptada del repositorio OpenPI de Physical Intelligence.

## Capacidades

- Politica robotica VLA: genera acciones de control (7 dimensiones) a partir de observaciones multimodales.
- Entrada multimodal: estado del robot de 9 dimensiones y tres camaras RGB (`agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2`) de 224x224 pixeles.
- Manipulacion de objetos complejos: entrenado para interactuar con objetos de formas variadas, incluyendo agarres, insercion y colocacion.
- Generalizacion a nuevos entornos: como fine-tune de pi05, hereda la capacidad de generalizar a situaciones no vistas durante el entrenamiento (segun la descripcion del modelo base).
- Salida de acciones continuas: adecuado para control de robots en tiempo real.
- Integracion con LeRobot: compatible con el ecosistema de HuggingFace para entrenamiento y despliegue.

## Casos de uso

- Investigacion en manipulacion robotica: el modelo puede evaluarse en entornos de simulacion o reales para estudiar la generalizacion de politicas VLA en tareas de agarre de objetos con geometrias complejas.
- Control de brazo robotico Panda: gracias a su entrada de estado y camaras, el modelo puede desplegarse en un robot Panda para ejecutar tareas de manipulacion aprendidas.
- Fine-tuning para tareas especificas: al ser un modelo base fine-tuneable, puede adaptarse a nuevos conjuntos de datos de demostracion para tareas de manipulacion concretas.
- Benchmarking de politicas VLA: sirve como referencia para comparar el rendimiento de diferentes enfoques de aprendizaje por imitacion en robotica.
- Desarrollo de robots de proposito general: el modelo es un ejemplo de VLA de codigo abierto que puede integrarse en sistemas roboticos para explorar la generalizacion open-world.
- Educacion y prototipado: con licencia Apache 2.0, es adecuado para proyectos academicos y prototipos donde se necesite una politica de manipulacion entrenada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 4.143.404.816 parametros. En bf16, los pesos ocupan aproximadamente 8,3 GB. Se necesitaria una GPU con al menos 16 GB de VRAM para inferencia, aunque no se han publicado requisitos oficiales.
- GPU recomendada: el nombre del conjunto de datos sugiere que el entrenamiento se realizo en una NVIDIA A100. Para inferencia, una RTX 4090 (24 GB) o superior seria adecuada.
- Despliegue: compatible con LeRobot y el ecosistema de HuggingFace. Puede ejecutarse en entornos de simulacion (por ejemplo, MuJoCo) o en hardware real.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `sam-guided-vlas/train_1_2_hard_items...` (este modelo) | 4.143.404.816 | No disponible | Apache 2.0 | HuggingFace |
| `sam-guided-vlas/train_1_2_pile__point...` (otro fine-tune de pi05) | No disponible | No disponible | Apache 2.0 | HuggingFace |
| `lerobot/pi05_base` (modelo base) | No disponible | No disponible | Apache 2.0 | HuggingFace |

Ambos fine-tunes comparten el mismo modelo base (`lerobot/pi05_base`), por lo que es probable que tengan una arquitectura identica, pero no se dispone del dato de parametros del segundo modelo.

## Limitaciones y advertencias

- Modelo fine-tuneado en un dataset especifico de 199 episodios; puede no generalizar a tareas fuera de ese dominio.
- El dataset es pequeno, lo que aumenta el riesgo de sobreajuste.
- No es un modelo de lenguaje; no puede generar texto ni responder preguntas.
- No se han publicado evaluaciones de seguridad ni analisis de sesgos.
- En robotica, las acciones generadas pueden ser inseguras si se ejecutan sin supervision o sin mecanismos de seguridad.
- La longitud de contexto no esta disponible, lo que limita la evaluacion de su capacidad para manejar secuencias largas de observaciones.
- No se especifican los idiomas soportados, ya que el modelo no procesa lenguaje natural.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sam-guided-vlas/train_1_2_hard_items__mask__overlay_a100__sim__all_cameras__live__pi05__seed_0
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/sam-guided-vlas/train_1_2_hard_items__mask__overlay_a100__sim__all_cameras__live
- Blog de Physical Intelligence: https://www.physicalintelligence.company/blog/pi05
- LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Otro fine-tune similar: https://huggingface.co/sam-guided-vlas/train_1_2_pile__point__overlay_a25__sim__all_cameras__live__pi05__seed_0
