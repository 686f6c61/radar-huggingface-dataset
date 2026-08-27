# masondx/decoupled-diffusion-aloha-insertion-shared-state-20k-bs32

## Resumen

El modelo `masondx/decoupled-diffusion-aloha-insertion-shared-state-20k-bs32` es un checkpoint de inferencia (pesos EMA) de una política de difusión bimanual desacoplada, entrenada con la librería LeRobot sobre el dataset `lerobot/aloha_sim_insertion_human`. Desarrollado por el usuario masondx, este modelo aborda el problema del aprendizaje por imitación para manipulación bimanual en simulación, concretamente la tarea de inserción de objetos con el entorno ALOHA. Su relevancia radica en explorar una arquitectura de difusión en la que cada brazo tiene su propia rama de generación de acciones, pero comparten el estado completo del sistema (14 dimensiones) y una única entrada visual.

El modelo tiene 526.850.558 parámetros y se distribuye en formato safetensors (2,1 GB). Está diseñado para ser evaluado en el entorno `AlohaInsertion-v0` con episodios de 400 pasos. Es un checkpoint de investigación, no un producto listo para producción, y forma parte de una línea de trabajo sobre políticas de difusión desacopladas para robots bimanuales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion policy bimanual desacoplada (decoupled bimanual diffusion) |
| Parametros totales | 526.850.558 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de robotica, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es una política de difusión desacoplada para dos brazos: cada brazo tiene su propia rama de generación de acciones (7 dimensiones por brazo), pero ambas ramas reciben el estado completo de 14 dimensiones (enrutamiento `shared`). La entrada visual es compartida: una única imagen `observation.images.top` de 480x640 píxeles. El modelo utiliza 2 pasos de observación, un horizonte de predicción de 64 pasos y genera 32 pasos de acción. El modo de comunicación entre brazos está desactivado (`none`).

El entrenamiento se realizó con 20.000 pasos, batch size de 32 y semilla 1000. Se usó el checkpoint EMA junto con el preprocesador y postprocesador de LeRobot. No se aplicaron técnicas de RLHF ni DPO; es un entrenamiento puramente de imitación a partir de demostraciones humanas del dataset `aloha_sim_insertion_human`. El modelo proviene de un fork personalizado de LeRobot que implementa la difusión bimanual desacoplada.

## Capacidades

- Manipulación bimanual coordinada: genera acciones simultáneas para dos brazos robóticos (7 dimensiones cada uno).
- Aprendizaje por imitación: reproduce comportamientos aprendidos de demostraciones humanas en simulación.
- Percepción visual: procesa una imagen de cámara superior (480x640) como entrada compartida.
- Control de precisión: orientado a tareas de inserción que requieren alineación fina.
- Generación de trayectorias: predice secuencias de acciones de hasta 32 pasos con un horizonte de 64.
- No soporta tool calling, agentes ni razonamiento multi-paso en el sentido de los modelos de lenguaje.

## Casos de uso

- Investigación en aprendizaje por imitación bimanual: permite estudiar el efecto de desacoplar las ramas de difusión frente a arquitecturas acopladas en tareas de inserción.
- Benchmarking de políticas de difusión en robótica: sirve como referencia para comparar variantes de diffusion policy en el entorno ALOHA.
- Desarrollo de controladores para robots bimanuales en simulación: puede integrarse en pipelines de entrenamiento y evaluación con LeRobot.
- Validación de estrategias de compartición de estado: el enrutamiento `shared` es útil para analizar cómo el estado global afecta a cada brazo.
- Reproducción de experimentos: al ser un checkpoint con configuración detallada, permite replicar los resultados reportados (16% de éxito) y verificar la implementación.
- Exploración de generalización entre tareas: el mismo autor ha publicado modelos similares para otras tareas (transfer_cube), lo que permite estudiar transferencia entre habilidades.

## Benchmarks y rendimiento

El modelo fue evaluado en `AlohaInsertion-v0` con episodios de 400 pasos y lotes síncronos de 50 rollouts, usando dos semillas (1000 y 2000) para un total de 100 episodios. Los resultados se muestran en la tabla siguiente. No se dispone de comparaciones con otros modelos en la información proporcionada.

| Metrica | Valor |
|---|---|
| Tasa de exito (100 episodios) | 16/100 (16%) |
| Suma de recompensa promedio | 218,80 |
| Recompensa maxima promedio | 2,36 |
| Exito con semilla 1000 | 7/50 |
| Exito con semilla 2000 | 9/50 |

## Requisitos de hardware

- No se han publicado requisitos oficiales de VRAM ni GPU recomendadas.
- El tamaño del repositorio es de 2,1 GB, lo que sugiere que los pesos en FP32 ocupan aproximadamente esa cantidad; una GPU con al menos 4-6 GB de VRAM podría ser suficiente para inferencia, pero es una estimación no confirmada.
- Al ser un modelo de robótica con entrada de imagen, la inferencia requiere procesamiento de visión y generación de secuencias de acción; se recomienda una GPU NVIDIA con soporte CUDA (por ejemplo, RTX 3060 o superior) para un rendimiento razonable.
- Opciones de despliegue: el modelo está diseñado para usarse con LeRobot y el entorno ALOHA en simulación; no se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

El autor ha publicado otros dos modelos relacionados, pero no se dispone de sus especificaciones detalladas ni de resultados comparativos. Se listan a continuación como referencia cualitativa.

| Modelo | Tarea | Arquitectura | Parametros | Contexto | Licencia |
|---|---|---|---|---|---|
| masondx/decoupled-diffusion-aloha-insertion-shared-state-20k-bs32 | Inserción (AlohaInsertion-v0) | Diffusion bimanual desacoplada | 526,85 M | no aplica | no disponible |
| masondx/decoupled_diffusion_aloha_sim_transfer_cube_shared_state | Transferencia de cubo | Diffusion bimanual desacoplada | no disponible | no aplica | no disponible |
| masondx/diffusion_aloha_sim_transfer_cube | Transferencia de cubo | Diffusion policy (probablemente acoplada) | no disponible | no aplica | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos.

## Limitaciones y advertencias

- Tasa de éxito baja (16%): el modelo falla en la mayoría de los episodios de inserción, lo que indica que no es robusto para uso práctico sin mejoras adicionales.
- Checkpoint de investigación: proviene de un fork personalizado de LeRobot y está pensado para la implementación de política correspondiente; puede no ser compatible con versiones estándar de LeRobot.
- Resultados variables: el rendimiento depende del entorno y de las versiones de dependencias; los valores reportados pueden no reproducirse exactamente.
- Licencia no especificada: no se indica una licencia, por lo que el uso comercial o la redistribución requieren consultar al autor.
- Sin soporte multilingüe ni capacidades de lenguaje: es un modelo de control robótico, no un LLM.
- Limitado a simulación ALOHA: no se ha validado en hardware real ni en otros entornos.
- Sin cuantizaciones disponibles: no se ofrecen versiones GGUF u otras cuantizaciones, lo que limita su despliegue en hardware de baja gama.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/masondx/decoupled-diffusion-aloha-insertion-shared-state-20k-bs32
- Dataset de entrenamiento: https://huggingface.co/datasets/lerobot/aloha_sim_insertion_human
- Modelo relacionado (transfer_cube, desacoplado): https://huggingface.co/masondx/decoupled_diffusion_aloha_sim_transfer_cube_shared_state
- Modelo relacionado (transfer_cube, difusión estándar): https://huggingface.co/masondx/diffusion_aloha_sim_transfer_cube
