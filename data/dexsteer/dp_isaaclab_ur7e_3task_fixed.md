# DexSteer/dp_isaaclab_ur7e_3task_fixed

## Resumen

`DexSteer/dp_isaaclab_ur7e_3task_fixed` es un conjunto de checkpoints de Diffusion Policy (implementación de LeRobot) para control robótico de bajo nivel, desarrollado por DexSteer. El modelo genera acciones de manipulación para un brazo robótico UR7e con garra RH5DG2 en tres tareas del entorno de simulación Isaac Lab: `grasp_pan`, `cup_hang` y `pour_cup`. Su relevancia radica en que las políticas han sido entrenadas sobre datasets corregidos y fijos, incluyendo un reentrenamiento específico para `pour_cup` tras reparar el vídeo de la muñeca, lo que lo convierte en una referencia para evaluar el impacto de la calidad de los datos en políticas de difusión.

La arquitectura corresponde a Diffusion Policy, un modelo generativo basado en procesos de difusión que predice acciones condicionadas por observaciones. El repositorio tiene un tamaño de 3.3 GB y contiene tres carpetas, cada una con un directorio `pretrained_model` de LeRobot con `config.json`, `model.safetensors`, pre/postprocesadores y `train_config.json`. No se especifica el número de parámetros ni la longitud de contexto, ya que no se trata de un modelo de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (LeRobot) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura se basa en Diffusion Policy, una técnica que modela la distribución de acciones robóticas mediante un proceso de difusión denoising. En este caso, la política genera acciones de brazo en espacio conjunto absoluto (`JointPositionAction`) para el robot UR7e, condicionadas por observaciones del entorno. El entrenamiento se realizó con 2 GPU en modo DDP, con batch efectivo de 32, semilla 1000 y resize de imágenes a 224 píxeles, lo que sugiere que las observaciones incluyen entradas visuales.

Los datos de entrenamiento provienen de tres datasets fijos de Isaac Lab: `grasp_pan` (199 episodios), `cup_hang` (200 episodios) y `pour_cup` (150 episodios, con el vídeo de la muñeca reparado). Cada tarea fue entrenada durante 60000 pasos. Para `pour_cup` se realizó un reentrenamiento completo después de corregir el vídeo de la muñeca, lo que indica una sensibilidad a la calidad de los datos de demostración.

## Capacidades

- Genera acciones de control de bajo nivel para el brazo robótico UR7e con garra RH5DG2 en tareas de manipulación.
- Ejecuta tres tareas específicas: `grasp_pan`, `cup_hang` y `pour_cup`.
- Políticas de difusión condicionadas por observaciones, con entrada de imágenes redimensionadas a 224 píxeles.
- Produce acciones de brazo en espacio conjunto absoluto (`JointPositionAction`).
- No soporta tool calling, razonamiento simbólico ni generación de texto.
- No tiene capacidades multilingües; no es un modelo de lenguaje.

## Casos de uso

- Entrenamiento de robots en simulación con Isaac Lab: el modelo puede utilizarse como política de referencia para evaluar el rendimiento de tareas de manipulación en el entorno simulado, permitiendo comparar diferentes configuraciones de observaciones o de acciones.
- Investigación en aprendizaje por imitación: sirve como baseline de Diffusion Policy para comparar con otras arquitecturas de políticas robóticas, como redes neuronales recurrentes o transformers de acción.
- Evaluación de la calidad de datasets: el checkpoint de `pour_cup` permite analizar cómo la corrección del vídeo de la muñeca afecta al rendimiento de la política, facilitando estudios sobre el impacto del ruido en demostraciones.
- Desarrollo de pipelines de evaluación robótica: se integra en el script `run_dp_ur7e.sh` para la evaluación automática de políticas en Isaac Lab, proporcionando un flujo reproducible para pruebas de rendimiento.
- Benchmarking de control robótico: permite comparar el rendimiento de Diffusion Policy en tareas de agarre y manipulación con diferentes números de episodios de entrenamiento (199, 200 y 150).
- Estudios de transferencia sim-to-real: aunque no se documenta explícitamente, los checkpoints pueden servir como punto de partida para investigar la transferencia de políticas entrenadas en simulación a un robot UR7e real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible. El entrenamiento se realizó con 2 GPU en modo DDP, pero no se especifican los modelos de GPU utilizados.
- ¿Cabe en consumer GPU? no disponible.
- Opciones de despliegue: no disponible; al no ser un modelo de lenguaje, no se usa con vLLM, llama.cpp, Ollama ni TGI. La carga se realiza como directorio `pretrained_model` de LeRobot.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Modelo específico para tres tareas de Isaac Lab con UR7e + RH5DG2; no es un modelo generalista.
- No es un modelo de lenguaje; no puede utilizarse para generación de texto, razonamiento, código o matemáticas.
- Depende de la configuración del dataset fijo y del entorno de Isaac Lab; puede no generalizar a otros robots, tareas o distribuciones de observaciones.
- La licencia no está especificada, lo que puede limitar el uso comercial o la redistribución.
- No hay descargas ni validación externa (0 descargas, 0 likes); el modelo no ha sido probado por la comunidad.
- Para `pour_cup` fue necesario un reentrenamiento tras el arreglo del vídeo de la muñeca, lo que indica sensibilidad a la calidad de los datos.
- Riesgo de generar acciones no deseadas si se utiliza fuera de las tareas entrenadas o con observaciones fuera de distribución.
- No se han documentado sesgos específicos, pero al estar entrenado en datos de simulación puede heredar sesgos del entorno de Isaac Lab.

## Enlaces

- HuggingFace: https://huggingface.co/DexSteer/dp_isaaclab_ur7e_3task_fixed
- Dataset mencionado en la model card: https://huggingface.co/DexSteer/isaaclab_ur7e_3task_fixed
- Perfil del autor: https://huggingface.co/DexSteer
