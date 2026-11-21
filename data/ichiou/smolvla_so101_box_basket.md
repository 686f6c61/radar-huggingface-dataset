# ichiou/smolvla_so101_box_basket

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, diseñado para controlar robots reales mediante aprendizaje por imitación. Esta ficha concreta, `ichiou/smolvla_so101_box_basket`, es un ajuste fino del modelo base `lerobot/smolvla_base` sobre un dataset propio de 50 episodios para la tarea "Pick up the box and put it in the basket" con un robot de tipo `so_follower` (SO-101). El modelo consume el estado articular del robot (6 dimensiones) y tres cámaras RGB de 256x256, y produce acciones de 6 dimensiones a 30 FPS.

El interés de este modelo reside en su tamaño: 450 millones de parámetros, lo que permite desplegarlo en hardware de consumo sin GPU de datacenter. Está publicado bajo licencia Apache 2.0, lo que facilita su uso comercial y su modificación. Al ser un ajuste fino de un único usuario con 0 descargas y 0 likes, debe considerarse una demostración de flujo de trabajo más que un modelo listo para producción.

La relevancia actual del modelo está ligada al paper SmolVLA (arXiv:2506.01844), que propone una arquitectura VLA eficiente para robótica de bajo coste, y a la madurez de LeRobot como framework de entrenamiento y despliegue. Esta ficha permite evaluar rápidamente si el modelo sirve como punto de partida para tareas de manipulación con el brazo SO-101.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (SmolVLA), transformer multimodal con codificador visual y cabeza de acciones |
| Parametros totales | 450.046.176 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (política de control por pasos, no modelo de lenguaje conversacional) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea son texto, pero no se documenta cobertura multilingüe) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Modelo base | lerobot/smolvla_base |
| Tipo de robot | so_follower (SO-101) |
| Entradas | observation.state (6,), 3 imagenes (3, 256, 256) |
| Salidas | action (6,) |
| Tamano del repo | 0,9 GB |
| Frecuencia de control | 30 FPS |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que combina un codificador visual, un codificador de lenguaje para la instrucción de tarea y un decodificador de acciones que mapea las representaciones multimodales a comandos motores de 6 dimensiones. El modelo base `lerobot/smolvla_base` se distribuye preentrenado y este repositorio lo ajusta por imitación supervisada sobre un dataset específico de manipulación.

El ajuste fino se realizó con LeRobot 0.7.1 durante 10.000 pasos, batch size 64, optimizador AdamW, learning rate 1e-4 y semilla 1000. El dataset `ichiou/so101_box_basket` contiene 50 episodios y 15.225 frames a 30 FPS, todos etiquetados con la instrucción "Pick up the box and put it in the basket". No se documenta en la model card el uso de RLHF, DPO ni técnicas de decodificación especulativa; el entrenamiento es de imitación pura sobre demostraciones.

La innovación principal del método SmolVLA, según el paper referenciado, es lograr rendimiento competitivo con un coste computacional reducido y despliegue en hardware de consumo. La model card no detalla la composición del dataset de preentrenamiento del modelo base ni el número de tokens utilizados.

## Capacidades

- Control robótico de manipulación: genera acciones de 6 dimensiones para el brazo SO-101 a partir de observaciones visuales y de estado.
- Percepción visual multi-cámara: procesa tres flujos de imagen RGB de 256x256 simultáneamente.
- Condicionamiento por instrucción en lenguaje natural: la tarea se especifica como texto ("Pick up the box and put it in the basket").
- Aprendizaje por imitación: reproduce comportamientos demostrados en el dataset de entrenamiento.
- Ejecución en bucle cerrado a 30 FPS: adecuado para control reactivo de un brazo robótico.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, razonamiento explícito ni modo thinking.
- No se documenta capacidad multilingüe ni cobertura de idiomas.

## Casos de uso

- Recogida y colocación de objetos en entornos controlados: el modelo está entrenado específicamente para coger una caja y depositarla en una cesta; sirve como referencia para tareas pick-and-place con el SO-101 en laboratorio o aula.
- Prototipado de pipelines de imitación con LeRobot: permite validar el flujo completo de grabación de datos, entrenamiento y despliegue con `lerobot-rollout` antes de escalar a tareas propias.
- Base para ajuste fino con nuevos datasets: al estar publicado en safetensors y con licencia Apache 2.0, se puede reentrenar con `lerobot-train` sobre demostraciones adicionales para variantes de la misma tarea.
- Docencia y formación en robótica de bajo coste: su tamaño de 450M parámetros y su despliegue en hardware de consumo lo hacen apto para prácticas universitarias o talleres.
- Evaluación comparativa de políticas VLA: sirve como punto de referencia reproducible para comparar con otras políticas entrenadas sobre el mismo dataset o robot.
- Automatización de tareas repetitivas de laboratorio: con 50 episodios y 15.225 frames, el modelo puede ejecutar la tarea en condiciones similares a las de entrenamiento, útil para pruebas de repetibilidad.
- Integración en sistemas de investigación de manipulación: permite estudiar robustez ante cambios de posición de objetos o iluminación, aunque sin métricas publicadas de éxito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito, MMLU, HumanEval ni métricas de manipulación para este ajuste fino.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 450M parámetros en precisión completa (fp32) el peso ronda 1,8 GB, y en fp16/bf16 aproximadamente 0,9 GB, más el coste de los codificadores visuales y el buffer de inferencia.
- GPU recomendadas: no especificadas en la model card; por tamaño, una GPU consumer con 8 GB o más debería ser suficiente para inferencia en fp16.
- Cabe en GPU de consumo: previsiblemente sí, en tarjetas como RTX 3060, RTX 4060, RTX 4070 o superiores, aunque no hay confirmación oficial.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución en robot y `lerobot-train` para reentrenamiento). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles; el control se ejecuta a 30 FPS según la configuración del dataset.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ichiou/smolvla_so101_box_basket | 450M | VLA (ajuste fino) | no aplica | Apache 2.0 | Hugging Face, 0 descargas |
| lerobot/smolvla_base | no disponible en la informacion | VLA (base) | no aplica | no disponible en la informacion | Hugging Face (modelo base) |
| Otras politicas LeRobot (p. ej. ACT, Diffusion Policy) | no disponible | Politicas de imitacion | no aplica | no disponible | Ecosistema LeRobot |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado para una única tarea y un único tipo de robot (`so_follower`); no generaliza a otras tareas ni morfologías sin reentrenamiento.
- Dataset pequeño: 50 episodios y 15.225 frames, lo que limita la robustez ante variaciones de posición, iluminación o distractores.
- Sin métricas de evaluación publicadas: no hay tasas de éxito que permitan estimar la fiabilidad en producción.
- Riesgo de sobreajuste a las condiciones exactas de las demostraciones (posiciones de cámara, fondo, objetos).
- La instrucción de tarea está en inglés y no se documenta soporte multilingüe.
- No se documentan sesgos específicos, pero al ser un modelo entrenado sobre un dataset reducido y de un solo usuario, puede heredar sesgos de las demostraciones.
- Licencia Apache 2.0: permite uso comercial y modificación, con obligación de conservar avisos de licencia; conviene revisar también la licencia del modelo base `lerobot/smolvla_base`.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad.
- No apto para aplicaciones de seguridad crítica sin validación exhaustiva en el robot objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ichiou/smolvla_so101_box_basket
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/ichiou/so101_box_basket
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ichiou/so101_box_basket
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Guia SmolVLA de LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
