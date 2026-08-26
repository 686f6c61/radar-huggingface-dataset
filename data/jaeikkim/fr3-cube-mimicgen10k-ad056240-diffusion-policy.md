# jaeikkim/fr3-cube-mimicgen10k-ad056240-diffusion-policy

## Resumen

El modelo `jaeikkim/fr3-cube-mimicgen10k-ad056240-diffusion-policy` es un checkpoint de política de difusión condicionada (diffusion policy) para control robótico, desarrollado por jaeikkim. Está entrenado sobre un dataset sintético de 10 000 episodios de apilado de cubos con el robot Franka FR3, generado mediante MimicGen en el simulador Isaac Sim y gestionado con el framework LeRobot. El modelo resuelve el problema de generar acciones de control del efector final (delta de posición y orientación, 7 dimensiones) a partir de observaciones de tres cámaras RGB de 320×180 píxeles y un vector de estado de 22 dimensiones.

La arquitectura combina un extractor de características visuales ResNet18 (entrenado desde cero) con un U-Net 1D condicional que modela la distribución de acciones. El repositorio contiene tres checkpoints intermedios (pasos 10 000, 20 000 y 30 000) listos para evaluación mediante rollouts en LeRobot. Su relevancia radica en ser un ejemplo de aplicación de políticas de difusión a tareas de manipulación robótica con datos sintéticos, un enfoque que permite reducir costes de recopilación de datos reales.

El modelo está publicado bajo licencia Apache 2.0 y los pesos se distribuyen en formato safetensors. No se trata de un modelo de lenguaje ni multimodal generalista, sino de un artefacto especializado en una tarea concreta de robótica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet18 (encoder visual) + Conditional 1D U-Net (difusión) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión y estado, no secuencial de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de control robótico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La política sigue el esquema de Diffusion Policy: un modelo generativo que produce secuencias de acciones mediante un proceso de denoising. La observación está compuesta por tres imágenes RGB nativas de 320×180 píxeles (presumiblemente desde cámaras fijas o del robot) y un vector de estado de 22 dimensiones (posición, orientación, velocidades, etc.). El encoder visual es un ResNet18 entrenado desde cero, cuyas características se concatenan con el estado y se condicionan al U-Net 1D que modela la distribución de acciones.

El entrenamiento se realizó sobre el dataset `jaeikkim/fr3-cube-full-episode-mimicgen-10k-rgb`, congelado en la revisión `ad0562409976cbcb919b58545a3d88f523617d3c`. Los hiperparámetros clave son: horizonte de observación de 2 pasos, horizonte de predicción de 16 pasos y chunk de acción de 8 pasos. El batch global fue de 1536 (768 por GPU en dos GPUs) y la tasa de aprendizaje 4.974325641714113e-4. No se menciona el uso de RLHF ni DPO; es un entrenamiento de imitación supervisada mediante regresión de difusión.

No se especifica el número total de tokens de entrenamiento ni la composición exacta del dataset, pero se sabe que son 10 000 episodios sintéticos generados con MimicGen, una técnica que aumenta datos demostrando tareas en simulación a partir de pocas demostraciones humanas.

## Capacidades

- Generación de acciones de control para el efector final de un robot Franka FR3 (delta de 7 dimensiones: posición y orientación).
- Procesamiento de observaciones multimodales: tres imágenes RGB de 320×180 y un vector de estado de 22 dimensiones.
- Ejecución de tareas de apilado de cubos (cube stacking) en entornos simulados, siguiendo el estilo de los benchmarks de MimicGen.
- Generación de secuencias de acciones con horizonte de predicción de 16 pasos y ejecución en chunks de 8 pasos.
- Capacidad de evaluación mediante rollouts en LeRobot, con checkpoints intermedios para monitorizar el progreso.
- No soporta tool calling, razonamiento multi-step ni capacidades lingüísticas, al ser un modelo puramente robótico.

## Casos de uso

- Aprendizaje por imitación en robótica: el modelo sirve como referencia para estudiar cómo las políticas de difusión aprenden tareas de manipulación a partir de datos sintéticos. Un investigador puede cargar los checkpoints en LeRobot y ejecutar evaluaciones en simulación para comparar arquitecturas.
- Desarrollo de pipelines de generación de datos sintéticos: dado que el dataset se creó con MimicGen, este modelo puede usarse para validar la calidad de datos generados automáticamente antes de invertir en recopilación real.
- Benchmarking de políticas de control: los tres checkpoints permiten analizar la curva de aprendizaje del modelo y comparar el rendimiento en diferentes etapas del entrenamiento.
- Transferencia a entornos reales (con cautela): aunque entrenado en simulación, el modelo podría servir como punto de partida para fine-tuning con datos reales del Franka FR3, reduciendo el tiempo de entrenamiento.
- Integración en frameworks de robótica open source: al ser compatible con LeRobot, puede incorporarse a sistemas de control existentes que usen este framework para despliegue en robots físicos.
- Investigación en políticas de difusión: el repositorio ofrece un ejemplo completo de entrenamiento y evaluación de una política de difusión con ResNet18 y U-Net 1D, útil para reproducir experimentos o modificar componentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de éxito de la tarea, tasas de acierto ni comparaciones con otras políticas. Los checkpoints están disponibles para que el usuario los evalúe por sí mismo en el entorno de simulación.

## Requisitos de hardware

- El tamaño del repositorio es de 3.3 GB, lo que sugiere un modelo con decenas de millones de parámetros (ResNet18 tiene ~11 M y el U-Net 1D añade una cantidad similar). No se proporcionan requisitos oficiales.
- Para inferencia en tiempo real, se recomienda una GPU con al menos 8 GB de VRAM para procesar las tres imágenes y el U-Net sin problemas. Una RTX 3060 o superior sería suficiente.
- El entrenamiento original usó dos GPUs con batch 768 cada una, lo que implica GPUs de alta capacidad (probablemente A100 o similar). Para evaluación (rollouts) el requisito es menor.
- El modelo es compatible con LeRobot, que se ejecuta sobre PyTorch. Se puede desplegar en una estación de trabajo con GPU consumer, pero para control en tiempo real del robot se necesita una latencia baja, por lo que una GPU dedicada es imprescindible.
- No se mencionan opciones de despliegue como vLLM u Ollama, ya que no es un modelo de lenguaje; el despliegue se hace mediante el pipeline de LeRobot.

## Comparativa con modelos similares

| Modelo | Arquitectura | Dataset | Tarea | Licencia |
|---|---|---|---|---|
| jaeikkim/fr3-cube-mimicgen10k-ad056240-diffusion-policy | ResNet18 + U-Net 1D | 10k episodios sintéticos MimicGen | Apilado de cubos (FR3) | Apache 2.0 |
| jaeikkim/fr3-cube-mimicgen10k-diffusion-policy | similar (sin especificar) | 10k episodios | Apilado de cubos | Apache 2.0 |
| jaeikkim/fr3-cube-mimicgen10k-onestep-diffusion-policy | similar (one-step) | 10k episodios | Apilado de cubos | Apache 2.0 |

No se dispone de datos de rendimiento comparativo. Los otros dos repositorios del mismo autor parecen variantes de la misma política (una versión estándar y otra de un solo paso de denoising), pero no se aportan métricas. No se han encontrado modelos comparables de terceros con especificaciones públicas en la información disponible.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en simulación (Isaac Sim) con datos sintéticos de MimicGen. La transferencia al mundo real puede fallar debido al gap sim2real (diferencias de iluminación, texturas, dinámica del robot).
- La tarea es muy específica (apilado de cubos con una configuración fija de cámaras y robot). No es generalizable a otras tareas sin reentrenamiento.
- No se han publicado métricas de éxito ni análisis de robustez. El usuario debe evaluar el modelo en su propio entorno antes de usarlo en producción.
- Los checkpoints son intermedios (pasos 10k, 20k, 30k); no se indica cuál es el mejor ni si el entrenamiento continuó más allá.
- Al ser un modelo de control, no aplican sesgos lingüísticos ni alucinaciones de texto. Sin embargo, puede presentar comportamientos erráticos si las observaciones difieren de la distribución de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero el dataset subyacente puede tener restricciones adicionales (no se especifica en la model card).
- No se proporcionan instrucciones de instalación ni requisitos de versión de LeRobot, lo que puede dificultar la reproducibilidad.

## Enlaces

- Repositorio del modelo: https://huggingface.co/jaeikkim/fr3-cube-mimicgen10k-ad056240-diffusion-policy
- Dataset asociado: https://huggingface.co/datasets/jaeikkim/fr3-cube-full-episode-mimicgen-10k-rgb (inferido, no enlazado directamente)
- Ejecución de W&B: https://wandb.ai/AIDAS-Diffusion/fr3_cube_rgb_distillation/runs/beiks3eb
- Repo de LeRobot fork para FR3: https://github.com/Hpeox/lerobot-FR3 (referencia del framework)
- Otros checkpoints del autor: https://huggingface.co/jaeikkim/fr3-cube-mimicgen10k-diffusion-policy y https://huggingface.co/jaeikkim/fr3-cube-mimicgen10k-onestep-diffusion-policy
