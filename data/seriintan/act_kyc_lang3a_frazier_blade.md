# seriintan/act_kyc_lang3a_frazier_blade

## Resumen

`seriintan/act_kyc_lang3a_frazier_blade` es una política de manipulación robótica entrenada con imitación (visuomotora) mediante LeRobot 0.6.2 y publicada en Hugging Face por el usuario `seriintan`. El modelo controla un brazo `so_follower` (6 grados de libertad: el estado de observación y la acción tienen dimensión `(6,)`) a partir de dos cámaras RGB de 640x480 (`wrist` y `side`) y ejecuta dos tareas concretas de pick-and-place sobre instrumental quirúrgico: recoger la sonda de succión Frazier y recoger la hoja de bisturí, depositando cada objeto en una cesta azul.

El interés práctico es que se trata de un ejemplo completo y reproducible de *learning from demonstration* end-to-end sobre un stack abierto (LeRobot + SO follower), con 55.863.046 parámetros (0,2 GB de repositorio) y licencia Apache-2.0, lo que permite inspeccionar, reentrenar y desplegar la política sin fricción legal. No es un modelo de lenguaje ni un VLA conversacional: no procesa texto libre ni genera razonamiento, sino que emite comandos de acción de 6 dimensiones a partir de píxeles y del estado de las articulaciones.

La relevancia ahora mismo es doble: por un lado, sirve como línea base para tareas de manipulación fina de instrumentos en entornos de laboratorio; por otro, el mismo autor mantiene una variante (`act_kyc_frazier_object_variation`) orientada a medir robustez ante cambios de posición u objeto, lo que convierte a este par de políticas en un banco de pruebas útil para estudiar generalización en políticas de imitación de bajo coste.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de imitación `act_kyc` de LeRobot (visuomotora; la model card no detalla la topología interna ni si deriva de Action Chunking Transformer) |
| Parametros totales | 55.863.046 (55,86 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: no hay ventana de contexto de texto; cada inferencia consume `observation.state` `(6,)` y dos imágenes `(3, 480, 640)` y produce una acción `(6,)`. El horizonte de *action chunking* no está documentado |
| Tipos de cuantizacion | No documentados en la model card; pesos distribuidos en `safetensors` (precisión no indicada) |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | `safetensors` (librería `lerobot`) |

## Arquitectura y entrenamiento

La política se entrenó con LeRobot 0.6.2 sobre el dataset `seriintan/lang3a_frazier_blade`: 120 episodios, 48.454 fotogramas a 30 FPS (≈ 26,9 minutos de demostraciones, con una media de ≈ 404 fotogramas, unos 13,5 segundos, por episodio). Las observaciones son el estado articular de 6 dimensiones y dos flujos visuales `(3, 480, 640)` procedentes de las cámaras `wrist` y `side`; la salida es un vector de acción de 6 dimensiones, adecuado para el robot `so_follower`. La model card no especifica la topología interna de `act_kyc` (backbone visual, número de capas, mecanismo de agregación temporal ni si emplea decodificación por *chunks*), por lo que ese detalle debe considerarse no disponible.

La configuración de entrenamiento sí está documentada: 50.000 pasos, batch de 16, optimizador AdamW con learning rate 1e-5, semilla 1000 y registro en W&B. No se menciona ningún proceso de RLHF, DPO o ajuste por refuerzo, algo esperable en imitación supervisada; tampoco se detalla la composición del dataset más allá de los dos enunciados de tarea ("Pick up the Frazier Suction Tube and place it in the blue basket." y "Pick up the surgical blade and place it in the blue basket."), ni se reportan técnicas de aumento de datos, *domain randomization* o decodificación especulativa.

## Capacidades

- Manipulación visuomotora de pick-and-place sobre dos objetos concretos (sonda de succión Frazier y hoja de bisturí) con destino fijo (cesta azul).
- Fusión de dos vistas RGB simultáneas (`wrist` y `side`) con el estado articular de 6 dimensiones.
- Emisión de acciones continuas de 6 dimensiones a la frecuencia del lazo de control (dataset grabado a 30 FPS).
- Ejecución autónoma durante un tiempo configurable mediante `lerobot-rollout` (`--duration`), sin grabación de episodios en la estrategia `base`.
- Reentrenamiento y fine-tuning posibles desde el propio CLI de LeRobot sobre nuevos datasets.
- No soporta *tool calling* ni *function calling*.
- No soporta razonamiento multi-paso, planificación simbólica ni agentes basados en lenguaje.
- No tiene capacidades multilingües ni de generación de texto.
- No procesa audio ni vídeo en streaming más allá de los frames de observación.

## Casos de uso

- Automatización de pick-and-place de instrumental en un banco de pruebas: la política recoge la sonda Frazier o la hoja de bisturí y las deposita en la cesta azul, lo que permite medir tiempos de ciclo y tasa de éxito antes de plantear cualquier piloto.
- Línea base para investigación en imitación end-to-end: con 55,86 M de parámetros y una receta de entrenamiento pública (AdamW, lr 1e-5, 50.000 pasos), sirve para comparar variantes de backbone visual o de aumento de datos bajo las mismas condiciones.
- Estudio de robustez y generalización: emparejada con `act_kyc_frazier_object_variation`, permite aislar el efecto de variar la posición u objeto sobre el mismo robot y dataset de referencia.
- Replicación docente del pipeline de LeRobot: grabar dataset, entrenar con `lerobot-train` y desplegar con `lerobot-rollout` en un SO follower de bajo coste, usando esta política como referencia ya entrenada.
- Generación de datos sintéticos de manipulación para preentrenar otras políticas: ejecutar la política de forma repetida con posiciones iniciales ligeramente distintas y registrar las trayectorias resultantes.
- Prototipado de flujos logísticos de instrumental en entornos no clínicos (simulador de quirófano, laboratorio de esterilización) donde se quiera evaluar la viabilidad de una celda robótica antes de invertir en integración.
- Integración en un orquestador tipo ROS 2 o en un pipeline de CI de robótica: la política se carga como módulo de inferencia y se valida automáticamente con episodios pregrabados para detectar regresiones tras cambios de calibración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La sección de evaluación de la model card indica explícitamente: "No evaluation results have been provided for this policy yet", sin tabla de ensayos, éxitos ni tasas de éxito en robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: ≈ 223 MB en fp32 (55,86 M × 4 bytes) y ≈ 112 MB en fp16/bf16, calculado a partir del número de parámetros; la model card no declara la precisión real de los pesos.
- Tamaño en disco: 0,2 GB de repositorio.
- GPU recomendadas: cualquier GPU con ≥ 2 GB de VRAM es suficiente por memoria; en la práctica, RTX 3060/4060/4090, A100 o H100 sirven sin problema, y la elección depende más del throughput del lazo de control y del resto del stack que de la política.
- Cabe en GPU de consumo: sí, en cualquier RTX o incluso en iGPU recientes; también es viable la inferencia en CPU dado el tamaño del modelo.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial de LeRobot), scripts de inferencia en PyTorch sobre el paquete `lerobot`. No aplican vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo generativo de texto.
- Latencia y throughput: no publicados. El requisito operativo es sostener el lazo de control correspondiente a los 30 FPS de grabación (33 ms por paso) con dos cámaras OpenCV de 640x480 a 30 FPS conectadas al host del robot; la model card no reporta latencias medidas.

## Comparativa con modelos similares

| Parametro | act_kyc_lang3a_frazier_blade | act_kyc_frazier_object_variation | Políticas de imitación de referencia (ACT, Diffusion Policy) |
|---|---|---|---|
| Autor | seriintan | seriintan | distintos autores |
| Parametros | 55,86 M | 55,9 M | No disponible en la informacion consultada |
| Tarea | 2 tareas de pick-and-place (Frazier, bisturí) | Variación de objeto sobre la misma estirpe | Manipulación diversa |
| Entradas | Estado `(6,)` + 2 cámaras 480x640 | No disponible | No disponible |
| Salidas | Acción `(6,)` | No disponible | No disponible |
| Licencia | Apache-2.0 | No disponible | No disponible |
| Evaluación publicada | No | No | Sí, en publicaciones científicas |
| Disponibilidad | Hugging Face Hub | Hugging Face Hub | Repositorios de investigación |

No se dispone de datos verificables de benchmarks ni de especificaciones cerradas de ACT o Diffusion Policy en la información consultada, por lo que la comparación cuantitativa de rendimiento no es posible; la comparación se limita a alcance, tamaño y licencia.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay ensayos en robot real ni tasas de éxito, de modo que el rendimiento en producción es desconocido.
- Sobreajuste probable: 120 episodios y 48.454 fotogramas para dos tareas muy específicas; cabe esperar memorización de posiciones y sensibilidad a cambios de iluminación, fondo o colocación de la cesta.
- Acoplamiento fuerte al embodiment: el espacio de acción de 6 dimensiones asume un `so_follower` calibrado de forma concreta; trasladarlo a otro robot o a otra calibración requiere reentrenar.
- Dependencia de nombres y disposición de cámara: las claves `observation.images.wrist` y `observation.images.side` deben coincidir exactamente, y la resolución de entrenamiento es 480x640.
- Sin condicionamiento por lenguaje documentado: el comando de rollout pasa `--task` como cadena, pero la model card no especifica si la política usa esa señal; no debe asumirse capacidad de instrucciones en lenguaje natural.
- Sin salvaguardas físicas: la política no incluye detección de colisiones, límites de par ni parada de emergencia; cualquier despliegue debe añadir esas capas en el controlador.
- Contexto sensible: las tareas implican instrumental quirúrgico (sonda Frazier, hoja de bisturí). El modelo no es un producto sanitario, no está validado clínicamente y no debe usarse en procedimientos reales sobre pacientes.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe el equivalente de ejecutar acciones no justificadas por la observación cuando la escena se sale de la distribución de entrenamiento.
- Licencia Apache-2.0: permite uso comercial y modificación con conservación del aviso de licencia; la licencia del dataset `seriintan/lang3a_frazier_blade` no se declara en la información disponible y conviene verificarla antes de reutilizar los datos.
- Modelo con 0 descargas y 0 likes en el momento de la consulta y creado en octubre de 2026: no hay evidencia de uso independiente ni de validación por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/seriintan/act_kyc_lang3a_frazier_blade
- Dataset de entrenamiento: https://huggingface.co/datasets/seriintan/lang3a_frazier_blade
- Visualizador del dataset (LeRobot Spaces): https://huggingface.co/spaces/lerobot/visualize_dataset?path=seriintan/lang3a_frazier_blade
- Perfil del autor: https://huggingface.co/seriintan
- Variante del mismo autor: https://huggingface.co/seriintan/act_kyc_frazier_object_variation
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
