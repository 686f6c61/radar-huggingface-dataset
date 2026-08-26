# purpleoak/2mL_tube_lift_alumi_vertical_purewater_v1_diffusion

## Resumen

Este modelo es una política de control visuomotor basada en Diffusion Policy, entrenada con el framework LeRobot de Hugging Face. El modelo resuelve una tarea de manipulación robótica concreta: levantar un tubo de 2 ml con agua pura en posición vertical e insertarlo en papel de aluminio. Está diseñado para operar sobre un robot tipo `so_follower` equipado con dos cámaras (muñeca y frontal).

La relevancia de este modelo reside en que demuestra el uso de Diffusion Policy en tareas de manipulación con contacto, un enfoque que trata el control visuomotor como un proceso de difusión generativa para producir trayectorias de acción suaves y multi-paso. El modelo se distribuye bajo licencia Apache 2.0 y se publica en el ecosistema LeRobot, lo que permite reproducir el entrenamiento y la evaluación en hardware real. El repositorio contiene 277,8 millones de parámetros en formato safetensors y fue creado en agosto de 2026.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (visuomotor) |
| Parámetros totales | 277.840.246 |
| Parámetros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (modelo robótico) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplicable (no procesa lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa **Diffusion Policy**, una arquitectura que trata el control visuomotor como un proceso de difusión generativa. En lugar de predecir directamente una acción, el modelo genera de forma iterativa una trayectoria de acciones multi-paso, lo que le permite producir movimientos suaves y robustos en tareas de manipulación con contacto, donde las acciones discretas suelen fallar. La política consume observaciones de estado del robot (vector de 6 dimensiones) y dos imágenes RGB de 480x640 píxeles (cámara de muñeca y cámara frontal), y produce un vector de acción de 6 dimensiones.

El entrenamiento se realizó con el framework **LeRobot** (versión 0.6.1), sobre un dataset de 45 episodios con 26.937 fotogramas a 30 FPS. La configuración de entrenamiento incluye 100.000 pasos, tamaño de lote 8, optimizador Adam con una tasa de aprendizaje de 0.0001 y semilla 1000. No se indica en la información disponible el uso de técnicas como RLHF o DPO, ya que es un modelo de aprendizaje por imitación supervisado.

## Capacidades

- **Control visoromotor**: genera trayectorias de acción multi-paso a partir de observaciones de estado y de imágenes de dos cámaras.
- **Manipulación con contacto**: adecuado para tareas de agarre, levantamiento e inserción de objetos pequeños.
- **Generación de trayectorias suaves**: la formulación de difusión produce movimientos continuos y robustos frente al ruido de las observaciones.
- **Aprendizaje por imitación**: entrenado mediante demostraciones reales de la tarea.
- **Integración con LeRobot**: compatible con la infraestructura de LeRobot para entrenamiento, evaluación y despliegue en robots reales.
- **Sin procesamiento de lenguaje**: no tiene capacidades de texto, código, visión general ni herramientas.

## Casos de uso

- **Automatización de laboratorios**: la tarea entrenada (levantar un tubo de 2 ml y colocarlo en papel de aluminio) es un ejemplo de manipulación de material de laboratorio. El modelo puede integrarse en un robot `so_follower` para repetir esta operación en entornos de ensayo o producción de muestras.
- **Prototipado de políticas de manipulación**: el modelo sirve como referencia para evaluar el rendimiento de Diffusion Policy en tareas de contacto en comparación con otras políticas de imitación.
- **Transferencia a tareas similares**: a partir de los pesos preentrenados, se puede fine-tunear con un dataset pequeño de una tarea análoga (por ejemplo, otros tipos de tubos o contenedores) aprovechando la inicialización.
- **Evaluación de robustez en manipulación**: permite estudiar cómo la política maneja perturbaciones en la posición del objeto, variaciones de iluminación o pequeños cambios en la geometría del entorno.
- **Benchmark de aprendizaje por imitación**: sirve como punto de comparación en investigaciones sobre Diffusion Policy frente a otras arquitecturas (ACT, VQ-BeT, etc.) usando el mismo dataset y robot.
- **Educación y formación en robótica**: el modelo y el dataset están públicos y documentados, lo que permite a estudiantes e investigadores reproducir el flujo completo de entrenamiento y despliegue con LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación de la política en robot real.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 277,8 millones de parámetros y dos imágenes de entrada, la inferencia es ligera. En FP32 cabría en una GPU con 6-8 GB de VRAM; con cuantización a FP16 o int8, en GPU de 4 GB.
- **GPU recomendadas**: para inferencia en tiempo real se recomienda una GPU consumer de gama media (RTX 3060 o superior). Para entrenamiento, una GPU con 24 GB de VRAM (RTX 3090, RTX 4090, A5000) o una A100 si se quiere acelerar.
- **¿Cabe en GPU consumer?**: sí, tanto la inferencia como el entrenamiento son viables en GPU consumer modernas gracias al tamaño moderado del modelo y al uso de LeRobot.
- **Opciones de despliegue**: el modelo se ejecuta con el framework LeRobot mediante el comando `lerobot-rollout`, que gestiona la conexión con el robot y las cámaras. No hay soporte nativo para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- **Latencia y rendimiento**: no se dispone de mediciones publicadas de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos comparables en la misma categoría (políticas de control robótico con Diffusion Policy) dentro del ecosistema LeRobot. Se pueden citar como alternativas genéricas:

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo | Diffusion Policy | 277,8 M | no aplica | Apache 2.0 | Hugging Face |
| Diffusion Policy (paper original) | Diffusion Policy | no disponible | no aplica | no disponible | paper y código abierto |
| ACT (Action Chunking Transformer) | Transformer | no disponible | no aplica | no disponible | código abierto |

La comparación directa en términos de rendimiento no es posible por la falta de datos publicados.

## Limitaciones y advertencias

- **Dataset reducido**: entrenado con solo 45 episodios, lo que puede limitar la generalización a variaciones del entorno (posiciones, iluminación, objetos).
- **Sin evaluación publicada**: la model card no incluye resultados de éxito en robot real, por lo que el rendimiento real no está verificado.
- **Tarea específica**: la política está especializada en una única tarea (tubo de 2 ml con agua en papel de aluminio) y no puede transferirse directamente a otras tareas sin reentrenamiento.
- **Sensibilidad a la configuración del robot**: las observaciones incluyen imágenes de dos cámaras específicas; cualquier cambio en la posición de las cámaras o en la cinemática del robot puede degradar el rendimiento.
- **Riesgo de sobreajuste**: el número de episodios es bajo en comparación con el número de parámetros, por lo que existe un riesgo de sobreamiento a las demostraciones de entrenamiento.
- **Restricciones de licencia**: la licencia Apache 2.0 permite uso comercial, pero el modelo es un componente de un sistema robótico y se debe cumplir con las normativas de seguridad aplicables.

## Enlaces

- Repositorio del modelo: https://huggingface.co/purpleoak/2mL_tube_lift_alumi_vertical_purewater_v1_diffusion
- Dataset de entrenamiento: https://huggingface.co/datasets/purpleoak/2mL_tube_lift_alumi_vertical_purewater_v1
- Paper de Diffusion Policy: https://huggingface.co/papers/2303.04137
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Código de LeRobot: https://github.com/huggingface/lerobot
