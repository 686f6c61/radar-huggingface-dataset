# omkarpatil/ffw_sg2_put-bread-in-pan_dp_sharednorm_3cam

## Resumen

Este modelo es un policy de robótica basado en Diffusion Policy, desarrollado por Omkar Patil (omkarpatil) y publicado en Hugging Face bajo licencia Apache 2.0. Está entrenado con el framework LeRobot 0.6.1 para ejecutar la tarea de colocar una rebanada de pan en una sartén, usando tres cámaras (cabeza izquierda y ambas muñecas) y un espacio de estado de 22 dimensiones y acción de 16 dimensiones a 15 Hz. El modelo forma parte de la serie FFW SG2 y ha sido entrenado durante 100.000 pasos con normalización MIN_MAX y una configuración de observación de un solo paso (n_obs_steps=1).

Su relevancia radica en que es un ejemplo de política de difusión aplicada a manipulación robótica, con un diseño de normalización compartida entre un grupo de tareas (grupo D) que agrupa tres variantes de la tarea de poner pan, con 11.872 frames. El repositorio tiene un tamaño de 1,2 GB y contiene los pesos en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (LeRobot 0.6.1, defaults de stock) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica, es un policy de control) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa una Diffusion Policy, una arquitectura que genera acciones de control mediante un proceso de difusión denoising. En este caso, la configuración es la de LeRobot 0.6.1 con los valores por defecto, salvo que se ha fijado n_obs_steps=1, lo que significa que la inferencia se realiza con un único frame de observación en lugar de una secuencia temporal. El espacio de observación es de 22 dimensiones (estado del robot) y el de acción de 16 dimensiones (articulaciones de los brazos), muestreado a 15 Hz.

El entrenamiento se realizó durante 100.000 pasos sobre un conjunto de datos compuesto por tres tareas de poner pan (grupo de composición D), con un total de 11.872 frames. Las imágenes proceden de tres cámaras: cam_left_head y las dos muñecas, todas redimensionadas a 224×224. La normalización de las observaciones y acciones es de tipo MIN_MAX, y el modelo guarda en el checkpoint el normalizador, que se ha verificado como idéntico entre los miembros del grupo.

## Capacidades

- Ejecución de la tarea de manipulación "put-bread-in-pan" mediante control de brazos robóticos.
- Integración con el framework LeRobot para inferencia y despliegue.
- Uso de tres cámaras (cabeza izquierda y muñecas) para la percepción visual.
- Salida de acciones de 16 dimensiones a 15 Hz para control de articulaciones.
- Normalización MIN_MAX compartida para un grupo de tareas relacionadas.
- Configuración de observación de un solo frame (n_obs_steps=1) para inferencia en tiempo real.
- Formato de pesos safetensors compatible con LeRobot.

## Casos de uso

- Cocina robótica: el modelo puede utilizarse en un robot manipulador para colocar rebanadas de pan en una sartén, integrado en un sistema de control basado en LeRobot.
- Investigación en políticas de difusión: sirve como referencia para estudiar el efecto de la normalización compartida entre tareas en el rendimiento de Diffusion Policies.
- Aprendizaje por demostración: puede emplearse como policy preentrenada para transferir el comportamiento a variantes de la tarea con pocos datos adicionales.
- Benchmark de manipulación: es útil para comparar la eficacia de Diffusion Policy frente a otros enfoques en tareas de cocina con múltiples cámaras.
- Desarrollo de robots de servicio: el modelo puede integrarse en robots de asistencia doméstica que necesiten manipular objetos cotidianos.
- Educación y prototipado: permite a estudiantes e investigadores experimentar con control robótico basado en difusión usando un entorno de simulación o un robot real compatible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendada: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: diseñado para usarse con LeRobot (v0.6.1). No se mencionan vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- El modelo está especializado en una tarea muy concreta (poner pan en una sartén) y no generaliza a otras tareas sin reentrenamiento.
- Depende de la configuración exacta de cámaras (cam_left_head y muñecas) y del espacio de estado/acción definido en el entrenamiento.
- La normalización MIN_MAX está ligada al grupo de composición D; si se usa con datos fuera de ese grupo, el rendimiento puede degradarse.
- No se dispone de información sobre sesgos, riesgo de alucinación o limitaciones de idioma, al tratarse de un modelo de control robótico, no de lenguaje.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar el cumplimiento de los términos de la licencia y las atribuciones correspondientes.
- El modelo no incluye documentación sobre requisitos de hardware ni benchmarks, por lo que su comportamiento en producción debe validarse experimentalmente.

## Enlaces

- Hugging Face: https://huggingface.co/omkarpatil/ffw_sg2_put-bread-in-pan_dp_sharednorm_3cam
- Perfil del autor en Hugging Face: https://huggingface.co/omkarpatil
- GitHub del autor: https://github.com/omkarpatil18
