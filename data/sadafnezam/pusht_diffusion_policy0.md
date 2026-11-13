# sadafnezam/pusht_diffusion_policy0

## Resumen

`pusht_diffusion_policy0` es una política de control visuomotor entrenada con el método Diffusion Policy y publicada en Hugging Face Hub mediante LeRobot. La desarrolla el usuario `sadafnezam` como un checkpoint de imitación para la tarea `PushT` del dataset `lerobot/pusht`: empujar un bloque con forma de T hasta una diana con la misma forma. No es un modelo de lenguaje ni un modelo generativo de texto: es una política robótica que consume una imagen de 96x96 píxeles y un vector de estado de 2 dimensiones, y produce una acción de 2 dimensiones.

El modelo sigue el paradigma de Diffusion Policy (Chi et al., 2023), que formula el control visuomotor como un proceso de difusión generativo: en lugar de predecir una única acción, genera trayectorias de acción multi-paso suavizadas, lo que mejora el rendimiento en tareas de manipulación con contacto rico. El checkpoint tiene 262.718.644 parámetros y un tamaño de repositorio de 1,1 GB en formato safetensors.

Es relevante como ejemplo reproducible de entrenamiento de políticas con LeRobot 0.7.1 y como punto de partida para experimentos de imitación en robótica de bajo coste. No obstante, el entrenamiento es muy corto (1.000 pasos, batch de 8) y no se han publicado resultados de evaluación, por lo que su utilidad práctica como política desplegada es limitada sin un reentrenamiento adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (modelo de difusión para control visuomotor), implementado en LeRobot |
| Parametros totales | 262.718.644 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (política robótica; ventana de observación de 1 frame de imagen 3x96x96 y estado de 2 dimensiones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Entradas | `observation.image` (VISUAL, 3x96x96), `observation.state` (STATE, 2) |
| Salidas | `action` (ACTION, 2) |
| Tipo de robot | unknown |
| Camaras | image |
| Dataset de entrenamiento | lerobot/pusht (206 episodios, 25.650 frames, 10 FPS) |
| Tarea | "Push the T-shaped block onto the T-shaped target." |
| Pasos de entrenamiento | 1.000 |
| Batch size | 8 |
| Optimizador | adam |
| Learning rate | 0.0001 |
| Semilla | 1000 |
| Version de LeRobot | 0.7.1 |
| Tamano del repositorio | 1,1 GB |

## Arquitectura y entrenamiento

La arquitectura es Diffusion Policy, un modelo de difusión condicionado por observaciones visuales y de estado que genera secuencias de acciones mediante un proceso iterativo de denoising. La política consume una imagen RGB de 96x96 y un vector de estado de 2 dimensiones, y emite una acción de 2 dimensiones. El método está descrito en el paper arXiv:2303.04137 (Diffusion Policy: Visuomotor Policy Learning via Action Diffusion) y se implementa con la librería LeRobot en su versión 0.7.1.

El entrenamiento se realizó sobre el dataset `lerobot/pusht`, compuesto por 206 episodios y 25.650 frames a 10 FPS, con una única tarea de empuje de un bloque en T hacia una diana en T. La configuración es deliberadamente mínima: 1.000 pasos de entrenamiento, batch size de 8, optimizador Adam con learning rate 0.0001 y semilla 1000. No se documenta el uso de RLHF, DPO ni ningún otro ajuste posterior; es un entrenamiento de imitación supervisada puro. No se especifica el número de tokens ni la composición detallada del dataset más allá de los episodios y frames indicados.

## Capacidades

- Control visuomotor de manipulación: genera acciones de 2 dimensiones a partir de una imagen de 96x96 y un estado de 2 dimensiones.
- Generación de trayectorias de acción multi-paso suavizadas gracias al proceso de difusión, adecuado para tareas con contacto.
- Ejecución de la tarea concreta de empujar un bloque en T hacia una diana en T.
- Integración con el ecosistema LeRobot para rollout y reentrenamiento mediante los comandos `lerobot-rollout` y `lerobot-train`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso simbólico ni capacidades multilingües, al no ser un modelo de lenguaje.
- No dispone de modo thinking, visión general, audio ni otras capacidades multimodales más allá de la observación visual de la política.

## Casos de uso

- Reproducción de experimentos de Diffusion Policy: sirve como checkpoint de referencia para comparar implementaciones de LeRobot con la configuración publicada (1.000 pasos, batch 8, lr 0.0001).
- Punto de partida para reentrenamiento: se puede cargar con `lerobot-train` y continuar el entrenamiento sobre `lerobot/pusht` o sobre un dataset propio de empuje con un robot de bajo coste.
- Docencia y formación en imitación robótica: permite ilustrar el flujo completo de LeRobot (instalación, grabación de datos, entrenamiento y rollout) con una política real y un dataset público pequeño.
- Validación de pipelines de inferencia: útil para probar `lerobot-rollout` con `--strategy.type=base` y verificar la conexión de cámaras, puertos y claves de observación antes de desplegar políticas más entrenadas.
- Benchmark interno de infraestructura: al tener 262,7 M de parámetros y 1,1 GB de pesos, permite medir latencia y throughput de inferencia en distintas GPU sin necesidad de datasets grandes.
- Prototipado de tareas de empuje en entornos controlados: con un robot tipo Pusht y las cámaras configuradas, se puede evaluar cualitativamente el comportamiento de la política, aunque sin métricas de éxito publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 262,7 M de parámetros en safetensors (1,1 GB de pesos), la inferencia en precisión completa requiere del orden de 1-2 GB de VRAM, más el overhead del runtime de LeRobot y de las cámaras; una estimación conservadora sitúa el mínimo práctico en 4 GB.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cualquier GPU con al menos 4-8 GB de VRAM debería poder ejecutar la política; GPU de datacenter como A100 o H100 no son necesarias para inferencia.
- ¿Cabe en GPU de consumo? Sí, previsiblemente en modelos como RTX 3060, RTX 4060, RTX 4090 y equivalentes, dado el tamaño reducido del checkpoint.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución en robot, `lerobot-train` para entrenamiento). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles. Dependen del hardware, de la frecuencia de control del robot y del número de pasos de denoising configurados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / observacion | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `sadafnezam/pusht_diffusion_policy0` | 262,7 M | imagen 3x96x96 + estado 2 | PushT (empuje de bloque en T) | no disponible | Hugging Face Hub |
| Políticas Diffusion Policy de referencia en LeRobot | no disponible | no disponible | Tareas de imitación (incluida PushT) | no disponible | Repositorio LeRobot |
| Políticas ACT de LeRobot | no disponible | no disponible | Tareas de imitación (incluida PushT) | no disponible | Repositorio LeRobot |

No se dispone de datos públicos de rendimiento de este checkpoint que permitan una comparación cuantitativa con alternativas. La comparación cualitativa se limita al método (Diffusion Policy frente a ACT u otras políticas de imitación soportadas por LeRobot) y al tamaño del checkpoint.

## Limitaciones y advertencias

- No se han publicado resultados de evaluación: se desconoce la tasa de éxito real de la política en la tarea PushT.
- Entrenamiento muy corto (1.000 pasos, batch 8): es probable que la política no haya convergido y su comportamiento sea deficiente sin reentrenamiento.
- Licencia no disponible: no se puede confirmar el uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Tipo de robot no especificado (`unknown`): la política está entrenada para un robot concreto no documentado, lo que limita la transferibilidad a otros hardware.
- Dependencia estricta de las claves de observación: las cámaras deben coincidir con `observation.image` y `observation.state` en forma y nombre; cualquier cambio en la resolución (96x96) o en el vector de estado invalida la política.
- Sesgo y alucinación: no aplica en el sentido de modelos de lenguaje, pero la política puede generalizar mal a posiciones de objetos, iluminación o distractores distintos de los del dataset de entrenamiento.
- Dominio muy restringido: solo cubre la tarea "Push the T-shaped block onto the T-shaped target." y no tareas de manipulación generales.
- Sin soporte multilingüe ni de texto: no es adecuada para casos de uso de NLP, agentes conversacionales ni generación de código.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sadafnezam/pusht_diffusion_policy0
- Paper de Diffusion Policy: https://huggingface.co/papers/2303.04137
- Dataset de entrenamiento: https://huggingface.co/datasets/lerobot/pusht
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=lerobot/pusht
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
