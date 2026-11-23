# Ishaan-codes11/smolvla_pick_place_glass_cup_pol_trimmed

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, diseñado para control robótico mediante aprendizaje por imitación. Esta ficha concreta corresponde a un ajuste fino del modelo base `lerobot/smolvla_base` realizado por el usuario Ishaan-codes11 para una tarea específica de manipulación: recoger un vaso de cristal y colocarlo en una zona roja delimitada. El modelo transforma observaciones multimodales (estado del robot y tres cámaras) en comandos de acción de 6 dimensiones para un brazo robótico tipo `so_follower`.

Con 450 millones de parámetros, SmolVLA apunta a un segmento de eficiencia computacional: el paper original (arXiv:2506.01844) lo presenta como una alternativa capaz de ejecutarse en hardware de consumo, a diferencia de los VLA de gran escala que requieren clústeres de GPU. La arquitectura combina un codificador visual, un modelo de lenguaje compacto y un decodificador de acciones, siguiendo el paradigma de los transformers de política entrenados de extremo a extremo sobre demostraciones.

La relevancia de esta ficha es acotada: se trata de un checkpoint de investigación con 0 descargas y 0 likes, sin resultados de evaluación publicados y entrenado sobre un dataset de tan solo 50 episodios. Es útil como referencia de cómo se estructura un ajuste fino de SmolVLA en LeRobot y como punto de partida reproducible para tareas de pick-and-place, pero no debe considerarse un modelo listo para producción sin validación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en transformer, ajustada desde `lerobot/smolvla_base` |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; LeRobot no documenta cuantizaciones para este checkpoint) |
| Idiomas soportados | no disponible (modelo orientado a control robótico, no a texto libre) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | LeRobot 0.6.2 |
| Tipo de robot | `so_follower` |
| Camaras | `front`, `wrist`, `polarization` (480x640, 3 canales) |
| Entrada de estado | `observation.state` de forma (6,) |
| Salida de accion | `action` de forma (6,) |
| Tamano del repositorio | 1.2 GB |

## Arquitectura y entrenamiento

SmolVLA sigue el paradigma de los modelos visión-lenguaje-acción: un codificador visual procesa las imágenes de las cámaras, un componente de lenguaje interpreta la instrucción en lenguaje natural ("Pick up the glass cup and place it in the red area") y un cabezal de política genera directamente las acciones motoras de 6 dimensiones. El modelo base fue preentrenado por Hugging Face y este checkpoint lo ajusta por imitación supervisada sobre demostraciones de robot real. La inclusión de una cámara de polarización como tercera entrada visual es un detalle poco habitual que sugiere un intento de mejorar la percepción de objetos transparentes o reflectantes como el vaso de cristal.

El ajuste fino se realizó durante 30.000 pasos con batch size de 8, optimizador AdamW, learning rate de 1e-4 y semilla 1000, sobre el dataset `Ishaan-codes11/pick_place_glass_cup_pol_trimmed`. Dicho dataset contiene 50 episodios y 11.973 fotogramas a 30 FPS, lo que equivale a aproximadamente 400 segundos de demostraciones. No se documenta en la información disponible el uso de RLHF, DPO ni técnicas de refinamiento posteriores al aprendizaje por imitación; tampoco se detalla la composición del preentrenamiento del modelo base.

## Capacidades

- Control robótico de manipulación: genera acciones de 6 grados de libertad para un brazo `so_follower` a partir de observaciones visuales y de estado.
- Ejecución de una tarea única de pick-and-place: recoger un vaso de cristal y depositarlo en una zona roja.
- Fusión multimodal de tres cámaras (frontal, muñeca y polarización) con el estado proprioceptivo del robot.
- Seguimiento de instrucciones en lenguaje natural para condicionar la política (una única tarea entrenada).
- Inferencia en hardware de consumo, según las afirmaciones del paper de SmolVLA.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento general, código, matemáticas ni multilingüismo; el modelo está especializado exclusivamente en la política entrenada.

## Casos de uso

- Automatización de pick-and-place en laboratorio: el modelo puede ejecutar la secuencia completa de recoger un vaso y colocarlo en una zona designada, sirviendo como banco de pruebas para pipelines de imitación con LeRobot.
- Investigación en manipulación de objetos transparentes: la cámara de polarización incluida en las entradas sugiere que el modelo se diseñó para explorar la percepción de cristal y superficies reflectantes, un caso difícil para la visión RGB convencional.
- Reproducción de experimentos de aprendizaje por imitación: con 50 episodios y una configuración de entrenamiento documentada, es un ejemplo reproducible para estudiar el efecto del número de demostraciones en el éxito de la política.
- Base para ajustes finos adicionales: al derivar de `lerobot/smolvla_base` y estar bajo Apache 2.0, puede reentrenarse con nuevos datasets de tareas similares usando `lerobot-train`.
- Docencia y formación en robótica: sirve para ilustrar el flujo completo de LeRobot (grabación de datos, entrenamiento, rollout) con un modelo pequeño que cabe en una sola GPU.
- Prototipado de control en robots de bajo coste: el tamaño de 450 M de parámetros y la orientación a hardware de consumo permiten desplegarlo en estaciones con una RTX 4090 o similar, sin infraestructura de clúster.
- Validación de infraestructura de despliegue: útil para probar `lerobot-rollout` y la integración de cámaras OpenCV antes de entrenar políticas propias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política y deja la tabla de éxito por tarea vacía.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 450 M de parámetros en safetensors (1.2 GB de repositorio), la inferencia en precisión completa requiere aproximadamente 2-3 GB de VRAM, y en FP16 alrededor de 1-2 GB, sin contar los buffers de las tres cámaras a 480x640.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para inferencia; para reentrenamiento con batch size 8 se recomienda una RTX 4090, A100 o H100.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060, RTX 4060, RTX 4090 y equivalentes, aunque no hay cifras oficiales confirmadas.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), con integración de cámaras OpenCV. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para políticas VLA de robótica.
- Latencia y throughput: no disponibles; la política está pensada para control a 30 FPS según el frame rate del dataset, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smolvla_pick_place_glass_cup_pol_trimmed | 450 M | no disponible | Pick-and-place de vaso (tarea única) | Apache 2.0 | Hugging Face, 0 descargas |
| lerobot/smolvla_base | no disponible en la informacion | no disponible | VLA base preentrenado, ajustable a tareas | Apache 2.0 | Hugging Face (modelo base) |
| OpenVLA | no disponible en la informacion | no disponible | VLA generalista de robótica | no disponible en la informacion | no disponible en la informacion |
| RT-2 (Google DeepMind) | no disponible en la informacion | no disponible | VLA generalista | propietaria | no disponible publicamente |

La comparación cuantitativa con alternativas no es posible con los datos proporcionados; solo se confirma que este checkpoint es un ajuste fino del modelo base de SmolVLA y que su alcance es una única tarea.

## Limitaciones y advertencias

- Especialización extrema: la política solo ha sido entrenada para la instrucción "Pick up the glass cup and place it in the red area"; no generaliza a otras tareas ni objetos sin reentrenamiento.
- Dataset muy reducido: 50 episodios y 11.973 fotogramas son insuficientes para garantizar robustez ante variaciones de posición, iluminación o distracciones.
- Sin evaluación publicada: no existen tasas de éxito medidas, por lo que se desconoce su fiabilidad real en el robot.
- Dependencia de hardware específico: requiere un robot `so_follower` y tres cámaras con nombres e índices concretos (`front`, `wrist`, `polarization`); cualquier desviación en la configuración invalida la política.
- Riesgo de sobreajuste al entorno de grabación: al no documentarse variaciones en el dataset, es probable que el modelo falle fuera de las condiciones exactas de captura.
- Idiomas: no aplica soporte multilingüe; la instrucción está fijada en inglés y asociada a una tarea concreta.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; la responsabilidad de validación recae en el integrador.
- Sin datos de sesgos: no se documentan sesgos conocidos, aunque al ser un modelo de control robótico el riesgo principal es de fallo físico (p. ej., dejar caer el vaso), no de sesgo lingüístico.
- Repositorio sin tracción: 0 descargas y 0 likes indican que no ha sido validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ishaan-codes11/smolvla_pick_place_glass_cup_pol_trimmed
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/Ishaan-codes11/pick_place_glass_cup_pol_trimmed
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Ishaan-codes11/pick_place_glass_cup_pol_trimmed
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
