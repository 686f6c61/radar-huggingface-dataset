# MrDuarte/smolvla-WarehousePick-v1-Sim-DigitalTwin

## Resumen

SmolVLA-WarehousePick-v1-Sim-DigitalTwin es un ajuste fino de un modelo vision-lenguaje-accion (VLA) publicado por el usuario MrDuarte en Hugging Face, derivado del modelo base lerobot/smolvla_base. Se trata de una política robótica de imitación entrenada para una única tarea de manipulación: recoger todos los paquetes y depositarlos en la caja verde ("Lift all parcels and put them in the Green Box"). El modelo consume el estado articular de un brazo SO-101 (6 grados de libertad) junto con tres flujos de imagen de cámaras y produce directamente un vector de acción de 6 dimensiones.

Técnicamente es un VLA compacto de 450.046.176 parámetros (unos 450 M) empaquetado en safetensors, con un repositorio de 1,2 GB y licencia Apache 2.0. La arquitectura subyacente procede de SmolVLA, descrito en el paper arXiv:2506.01844 como un modelo VLA "compacto y eficiente que alcanza un rendimiento competitivo con costes computacionales reducidos y puede desplegarse en hardware de consumo". El ajuste se ha realizado con LeRobot 0.6.1 sobre el dataset WarehousePick-v1-Sim-DigitalTwin (41 episodios, 13.376 fotogramas a 30 FPS) durante 20.000 pasos.

Su relevancia es doble: por un lado demuestra el flujo de trabajo completo de LeRobot (grabar datos, entrenar con `lerobot-train`, desplegar con `lerobot-rollout`); por otro, es un ejemplo de política entrenada sobre un gemelo digital simulado de un almacén, lo que la convierte en un caso de estudio útil para investigar transferencia sim-to-real en robótica de bajo coste. El repositorio no tiene descargas ni valoraciones y no se han publicado resultados de evaluación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA); según el paper arXiv:2506.01844, SmolVLA combina un modelo vision-lenguaje compacto con un experto de acciones |
| Parámetros totales | 450.046.176 (aproximadamente 450 M) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos distribuidos en safetensors; repositorio de 1,2 GB) |
| Idiomas soportados | No disponible (política robótica; la tarea se especifica mediante una instrucción en lenguaje natural) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Librería | lerobot (versión de entrenamiento 0.6.1) |
| Pipeline declarado | robotics |
| Modelo base | lerobot/smolvla_base (ajuste fino) |
| Robot objetivo | so101_follower |
| Cámaras | innomaker, intel_rgb, front |
| Entradas | observation.state (6,); observation.images.innomaker (3, 720, 1280); observation.images.intel_rgb (3, 424, 240); observation.images.front (3, 720, 1280) |
| Salidas | action (6,) |

## Arquitectura y entrenamiento

El modelo pertenece a la familia SmolVLA, una arquitectura VLA que acopla un componente vision-lenguaje con un módulo generador de acciones. La model card y el paper asociado describen SmolVLA como un modelo compacto orientado a coste computacional reducido y desplegable en hardware de consumo; el recuento real de parámetros del checkpoint es de 450.046.176. El modelo recibe como entrada el estado articular del robot (vector de 6 componentes) más tres imágenes de cámaras con resoluciones heterogéneas (720x1280 para las cámaras `innomaker` y `front`, 424x240 para `intel_rgb`) y emite un vector de acción de 6 dimensiones que se aplica al brazo SO-101.

El ajuste fino se realizó con LeRobot 0.6.1 sobre el dataset MrDuarte/WarehousePick-v1-Sim-DigitalTwin, compuesto por 41 episodios y 13.376 fotogramas capturados a 30 FPS, todos ellos etiquetados con la instrucción "Lift all parcels and put them in the Green Box". La configuración de entrenamiento declarada es de 20.000 pasos, tamaño de lote 28, optimizador AdamW, tasa de aprendizaje 0,0001 y semilla 1000. No se especifica en la información disponible si el ajuste incorporó RLHF, DPO ni ningún otro refinamiento posterior al aprendizaje por imitación, ni se detalla la composición completa del dataset de preentrenamiento del modelo base.

## Capacidades

- Generación directa de acciones de manipulación: dado el estado articular y las tres imágenes de cámara, produce un vector de acción de 6 dimensiones para un brazo SO-101.
- Condicionamiento por instrucción en lenguaje natural: la política se ejecuta con una tarea textual (`--task="Lift all parcels and put them in the Green Box"`), aunque en este ajuste solo se ha entrenado con una única instrucción.
- Percepción multimodal simultánea desde tres cámaras con resoluciones distintas (720x1280, 424x240 y 720x1280).
- Ejecución de políticas de imitación de extremo a extremo sin planificación simbólica explícita.
- Compatibilidad con el ecosistema LeRobot: entrenamiento (`lerobot-train`) e inferencia sobre robot real (`lerobot-rollout`).
- Despliegue previsto en hardware de consumo, según la descripción del modelo base SmolVLA.
- No dispone de soporte documentado de tool calling, function calling ni razonamiento multi-paso en el sentido de los LLM de texto; el modelo está especializado en control motor.
- Capacidades multilingües: no disponibles ni documentadas; el modelo no es un generador de texto.

## Casos de uso

- Recogida y depósito automatizado de paquetes: es la tarea exacta para la que fue entrenado. Se usaría un brazo SO-101 con las tres cámaras configuradas y se lanzaría con `lerobot-rollout` y la instrucción "Lift all parcels and put them in the Green Box" durante el tiempo deseado.
- Validación en gemelo digital antes de desplegar en hardware: el dataset de entrenamiento proviene de una simulación digital twin de almacén, de modo que la política puede probarse primero en el simulador para medir su comportamiento antes de asumir el riesgo de ejecutarla en un robot físico.
- Base de partida para nuevos ajustes finos: al estar construido sobre lerobot/smolvla_base y publicarse con pesos safetensors, sirve como punto de arranque para entrenar variantes con nuevos datasets de picking, usando el comando `lerobot-train` documentado en la model card.
- Docencia y formación en aprendizaje por imitación: el repositorio documenta la configuración completa (pasos, lote, optimizador, tasa de aprendizaje, semilla, versión de LeRobot), lo que permite reproducir el experimento en un laboratorio con hardware SO-101.
- Investigación en transferencia sim-to-real: al proceder de un gemelo digital, es un caso útil para medir la degradación de rendimiento cuando se traslada la política a un almacén físico con iluminación, posiciones y distractores distintos.
- Clasificación y separación de objetos en línea de producción: con un ajuste adicional, el mismo esquema (estado de 6 articulaciones más tres cámaras) puede adaptarse a tareas de selección por color o destino, aunque el modelo actual no ha sido entrenado para ello.
- Generación de trayectorias de referencia para análisis cinemático: las acciones de 6 dimensiones emitidas a partir de datos a 30 FPS pueden registrarse y analizarse para estudiar suavidad, tiempos de ciclo y puntos de fallo de la política.
- Punto de comparación en estudios de eficiencia de VLAs: su tamaño de 450 M parámetros lo convierte en una referencia práctica frente a VLAs de miles de millones de parámetros cuando el presupuesto de cómputo es limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card indica explícitamente: "No evaluation results have been provided for this policy yet", y la sección de evaluación aparece vacía, sin tabla de ensayos, éxitos ni tasa de éxito. Tampoco se reportan métricas de latencia, frecuencia de control efectiva ni tasa de éxito en la tarea de picking.

## Requisitos de hardware

- VRAM estimada para inferencia: con 450 M parámetros, el peso en precisión completa (FP32) ocupa aproximadamente 1,8 GB; en FP16/BF16, alrededor de 0,9 GB; en cuantización INT8, unos 0,45 GB. A ello hay que sumar la memoria de activaciones de las tres cámaras, por lo que conviene reservar entre 2 y 4 GB de VRAM.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM resulta suficiente, incluidas NVIDIA RTX 3050, RTX 3060, RTX 4060, RTX 4090, así como A100 o H100 (ampliamente sobredimensionadas para este tamaño). También es viable la inferencia en CPU, dado el reducido número de parámetros.
- Cabe en GPU de consumo: sí, y con margen amplio. La descripción del modelo base destaca explícitamente su despliegue en hardware de consumo.
- Opciones de despliegue: la vía documentada es LeRobot, con `lerobot-rollout` para inferencia y `lerobot-train` para entrenamiento o ajuste fino, sobre PyTorch con soporte CUDA (`--policy.device=cuda`). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, herramientas orientadas a modelos de lenguaje de texto y no a políticas robóticas.
- Latencia y throughput estimados: no disponibles. La única referencia temporal es que los datos de entrenamiento se capturaron a 30 FPS, lo que sugiere una frecuencia de control objetivo en torno a ese valor, pero la model card no confirma la frecuencia de inferencia alcanzada.
- Requisitos adicionales: brazo SO-101 (`so101_follower`) calibrado, tres cámaras con los nombres y resoluciones exactos del entrenamiento (`innomaker`, `intel_rgb`, `front`) y el puerto serie del robot configurado.

## Comparativa con modelos similares

Los datos de esta tabla proceden de información pública general sobre cada familia de modelos y no de la información proporcionada para esta ficha; conviene verificarlos antes de usarlos en decisiones de producción.

| Modelo | Parámetros | Licencia | Observaciones |
|---|---|---|---|
| smolvla-WarehousePick-v1-Sim-DigitalTwin | 450 M | Apache 2.0 | Ajuste fino de tarea única sobre SO-101; sin evaluación publicada |
| lerobot/smolvla_base | 450 M | No disponible en esta ficha (consultar el repositorio base) | Modelo base del que deriva este ajuste; preentrenado en datasets de comunidad |
| OpenVLA | Aproximadamente 7 B | No disponible en esta ficha | VLA de mayor tamaño; requiere bastante más VRAM que el modelo descrito |
| Octo | Aproximadamente 93 M | No disponible en esta ficha | Política transformer de propósito general para manipulación; más pequeña, sin evaluación comparable aquí |
| pi0 (Physical Intelligence) | Aproximadamente 3 B | No disponible en esta ficha | VLA de gran tamaño orientado a tareas diversas |

No se dispone de datos de rendimiento comparado (tasas de éxito, latencia, número de tareas soportadas) que permitan establecer una comparación cuantitativa fiable entre estos modelos y el descrito.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay ensayos, tasas de éxito ni condiciones de prueba publicadas, por lo que se desconoce si la política funciona de forma fiable en la propia tarea para la que fue entrenada.
- Dataset de entrenamiento muy reducido: 41 episodios y 13.376 fotogramas para una única instrucción. Es un volumen bajo que favorece el sobreajuste a la disposición concreta de objetos, iluminación y fondo del gemelo digital.
- Especialización extrema: el modelo solo ha visto la tarea "Lift all parcels and put them in the Green Box". No cabe esperar generalización a otras instrucciones ni a otros objetos sin un nuevo ajuste fino.
- Brecha sim-to-real: al proceder de un gemelo digital simulado, es previsible una caída de rendimiento al trasladar la política a un almacén físico con ruido sensorial, sombras y variaciones de calibración.
- Dependencia estricta de la configuración de hardware: las claves de observación (`observation.images.innomaker`, `observation.images.intel_rgb`, `observation.images.front`) y sus resoluciones deben coincidir exactamente. Cualquier cambio de cámara, nombre o resolución invalida la política.
- Requiere un brazo SO-101 calibrado de forma consistente con el usado en la grabación; desviaciones de calibración degradan las acciones.
- Riesgo de acciones inseguras: aunque no aplica el concepto clásico de alucinación de texto, una política de imitación puede generar trayectorias erráticas o colisiones. No hay mecanismos de seguridad, parada de emergencia ni límites de par documentados.
- Licencia Apache 2.0: permite uso comercial y modificación, pero se ofrece sin garantías; el autor no asume responsabilidad por daños derivados del uso.
- Idiomas y documentación: no se documentan capacidades multilingües ni requisitos de idioma para el condicionamiento textual; la model card está en inglés.
- Sin validación por la comunidad: cero descargas y cero valoraciones, por lo que no existe retroalimentación externa sobre su comportamiento.
- Las fechas de creación y actualización del repositorio (10-09-2026) resultan anómalas respecto al momento habitual de publicación, lo que conviene tener en cuenta al citar el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MrDuarte/smolvla-WarehousePick-v1-Sim-DigitalTwin
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/MrDuarte/WarehousePick-v1-Sim-DigitalTwin
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=MrDuarte/WarehousePick-v1-Sim-DigitalTwin
- Paper de SmolVLA (Hugging Face Papers): https://huggingface.co/papers/2506.01844
- Paper de SmolVLA (arXiv): https://arxiv.org/abs/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación completa de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference

La búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo ni sobre SmolVLA; los enlaces anteriores proceden de la información de Hugging Face y de la model card del autor.
