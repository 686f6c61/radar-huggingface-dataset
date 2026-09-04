# Kota0612/diffusion-policy-dex1-1-fiducial-cube-20260902

## Resumen

Este modelo es una política de difusión (diffusion policy) para control robótico, desarrollada por Kota0612 a partir del framework de Stanford (UMI/RoboHarvest) y adaptada a la mano robótica Unitree Dex1-1. Resuelve el problema de generar trayectorias de acciones de manipulación a partir de observaciones visuales, mediante aprendizaje por imitación. Es relevante porque permite transferir habilidades humanas a robots de bajo coste con un enfoque de difusión condicionada. La arquitectura utiliza un encoder ViT-Base y genera acciones de 6 dimensiones (posición y orientación del efector final). El checkpoint pesa 2.7 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiffusionUnetTimmPolicy (diffusion policy) con obs encoder `vit_base_patch16_clip_224.openai` |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de control, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision-robotica) |
| Licencia | MIT |
| Formato de pesos | Checkpoint PyTorch (.ckpt) con `torch.save`/`dill` |

## Arquitectura y entrenamiento

El modelo es una política de difusión condicionada que genera trayectorias de acciones a partir de una observación visual. La observación es una imagen RGB de la cámara del gripper (`camera0_rgb`) de 224x224, procesada por un encoder ViT-Base preentrenado con CLIP. La salida es un vector de 6 dimensiones que codifica la posición (`eef_pos`, 3) y la orientación (`eef_rot_axis_angle`, 3) del efector final; no incluye la apertura de la pinza, que se controla mediante una CNN separada. El entrenamiento se realizó con el dataset `dex1-1-umi-fiducial-cube-20260902` (154 episodios, 36,440 frames) durante 105 de 120 épocas, con un `train loss` de 0.011. Se utilizó el scheduler DDIM con `beta_schedule=squaredcos_cap_v2`, 50 timesteps y `prediction_type=epsilon`. No se aplicó RLHF ni DPO; es aprendizaje por imitación puro. La innovación principal es la adaptación del framework UMI a la mano Dex1-1 y la separación del control de la pinza en un módulo independiente.

## Capacidades

- Generación de trayectorias de acciones 6D (posición y orientación) para el efector final de un robot.
- Procesamiento de imágenes RGB (224x224) para condicionar la política, lo que le confiere capacidades de visión.
- Aprendizaje por imitación a partir de demostraciones humanas.
- No soporta tool calling ni function calling, al no ser un modelo de lenguaje.
- No soporta agentes ni razonamiento multi-paso en el sentido de los LLM.
- No tiene capacidades multilingües ni de generación de texto.

## Casos de uso

- Manipulación robótica de objetos en laboratorio: el modelo genera acciones de posición y orientación para que la mano Dex1-1 agarre un cubo fiducial, usando la imagen de la cámara del gripper como entrada.
- Automatización de tareas de pick-and-place en entornos industriales: puede integrarse en un brazo robótico para realizar movimientos repetitivos con alta precisión, reduciendo la necesidad de programación manual.
- Investigación en aprendizaje por imitación: sirve como referencia para comparar algoritmos de diffusion policy en robots de bajo coste, permitiendo validar hipótesis sobre transferencia de habilidades.
- Robótica educativa: permite a estudiantes y desarrolladores experimentar con políticas de difusión en un robot real, gracias a su licencia MIT y su tamaño moderado.
- Adaptación a nuevas tareas: al estar entrenado con demostraciones humanas, el modelo puede ajustarse a nuevas tareas recopilando datos adicionales y reentrenando, lo que facilita la iteración en entornos de investigación.
- Integración con sistemas de visión: puede combinarse con detectores de objetos para definir puntos de agarre, ya que la política se condiciona a la imagen RGB del gripper.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El model card solo reporta una pérdida de entrenamiento de 0.011, sin métricas de evaluación en tareas reales.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente. El checkpoint pesa 2.7 GB, por lo que se estima que una GPU con al menos 8 GB de VRAM es necesaria para inferencia en tiempo real.
- GPU recomendadas: no especificadas. Se sugiere una RTX 3060 o superior para inferencia, y una A100 para entrenamiento.
- Compatibilidad con GPU de consumo: probablemente sí, dado el tamaño del modelo, pero no hay datos oficiales.
- Opciones de despliegue: el modelo se carga mediante PyTorch con `dill`, y depende del repositorio Dex1-1hand_UMI. No es compatible con vLLM, Ollama ni TGI, al no ser un LLM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han encontrado comparativas publicadas con otros modelos de diffusion policy para Dex1-1. El framework original de Diffusion Policy de Stanford es la referencia más cercana, pero no se dispone de datos cuantitativos para comparar.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos específicos; el modelo hereda los sesgos del dataset de demostraciones.
- Riesgo de alucinación: no aplica, al ser un modelo de control que genera acciones, no texto.
- Limitaciones de contexto o idioma: no aplica, no es un modelo de lenguaje.
- Entrenado únicamente con 154 episodios y 36,440 frames, lo que limita su generalización a otros objetos o entornos.
- Específico para la mano Dex1-1 y el dataset de Fiducial Cube; no es directamente transferible a otros robots.
- Depende de la cámara del gripper; cambios de iluminación o calibración pueden degradar el rendimiento.
- El control de apertura de la pinza no está incluido, por lo que requiere un módulo adicional.
- El checkpoint se carga con `torch.load` y `dill`, lo que puede presentar riesgos de seguridad si se usa código de terceros.
- Licencia MIT permite uso comercial, pero se deben revisar las dependencias (por ejemplo, los repositorios de `diffusion_policy` y Dex1-1hand_UMI).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kota0612/diffusion-policy-dex1-1-fiducial-cube-20260902
- Dataset: https://huggingface.co/datasets/Kota0612/dex1-1-fiducial-cube-20260902
- Repositorio Dex1-1hand_UMI: https://github.com/Orboh/Dex1-1hand_UMI
- Paper de Diffusion Policy: https://diffusion-policy.cs.columbia.edu/
- Repositorio original diffusion_policy: https://github.com/real-stanford/diffusion_policy
