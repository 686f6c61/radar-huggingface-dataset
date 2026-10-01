# RobotisSW/Groot-n17-PaperTowelRoll-Tasks730-732-733-RightArmOnly

## Resumen

Groot-n17-PaperTowelRoll-Tasks730-732-733-RightArmOnly es un ajuste fino (fine-tune) de robótica desarrollado por RobotisSW sobre el modelo base nvidia/GR00T-N1.7-3B, un modelo visión-lenguaje-acción (VLA) de NVIDIA orientado al control de robots manipuladores. El modelo se ha entrenado durante 20.000 pasos sobre un conjunto de datos LeRobot específico para la tarea de colocar un rollo de papel de cocina en un soporte, correspondiente a las tareas 730, 732 y 733 del pipeline de Robotis.

Se trata de un ajuste especializado exclusivamente en el brazo derecho: recibe como entrada vídeo de tres cámaras (`cam_left_head`, `cam_left_wrist`, `cam_right_wrist`) y el estado de ambos brazos (`arm_left`, `arm_right`), pero solo emite acciones para el brazo derecho con un horizonte de acción de 24 pasos. El brazo izquierdo queda fijado en una pose concreta mediante el bucle de control del propio robot, por lo que el modelo no lo controla.

Con 3.144.016.000 parámetros y un repositorio de 35,7 GB en formato safetensors, es un modelo de tamaño medio pensado para despliegue en robótica real, no para inferencia de propósito general. Su relevancia radica en que demuestra el flujo de trabajo de especialización de un modelo fundacional de robótica (GR00T N1.7) hacia una tarea concreta de manipulación con una sola extremidad, un patrón cada vez más habitual para adaptar modelos generalistas a células de trabajo específicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA) basada en GR00T N1.7; detalles internos no disponibles |
| Parametros totales | 3.144.016.000 |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, cuantizacion no especificada) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de nvidia/GR00T-N1.7-3B, un modelo fundacional de robótica de tipo visión-lenguaje-acción que combina percepción visual, comprensión del estado del robot y generación de acciones motoras. La información proporcionada no detalla la composición interna (codificador visual, componente de lenguaje, cabeza de difusión de acciones u otros), por lo que los detalles finos de la arquitectura se consideran no disponibles.

Este fine-tune concreto se obtuvo tras 20.000 pasos de entrenamiento sobre el conjunto de datos LeRobot `Task_000730_000732_000733_Place_PaperTowelRoll_On_Holder_lerobot`, que agrupa demostraciones de la tarea de colocar un rollo de papel de cocina en un soporte. El contrato de modalidad define tres cámaras de entrada, estado de ambos brazos y salida de acciones limitada al brazo derecho con horizonte de 24 pasos. El brazo izquierdo se mantiene en una pose fija por el controlador del robot, de modo que el aprendizaje se centra únicamente en la extremidad derecha. No se especifican en la información disponible detalles sobre composición del dataset, número de episodios, técnicas de RLHF/DPO ni innovaciones técnicas adicionales.

## Capacidades

- Generación de acciones motoras para el brazo derecho de un robot manipulador, con horizonte de 24 pasos.
- Percepción visual multimodal a partir de tres cámaras: cabeza izquierda, muñeca izquierda y muñeca derecha.
- Integración del estado del robot (posición de ambos brazos) como entrada para condicionar la acción.
- Ejecución de la tarea específica de colocar un rollo de papel de cocina en un soporte.
- Operación con el brazo izquierdo fijado por el control del robot (el modelo no lo gobierna).
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo de pensamiento, visión general, audio): no disponible; la única modalidad confirmada es visión más estado más acciones.

## Casos de uso

- Automatización de una célula de pick-and-place: el modelo coloca rollos de papel de cocina en un soporte dentro de una línea de envasado, sustituyendo la programación manual de trayectorias por una política aprendida a partir de demostraciones.
- Manipulación con una sola extremidad: en celdas donde el brazo izquierdo se mantiene en una pose fija por razones de utillaje, este modelo aporta únicamente el control del brazo derecho, encajando directamente en ese montaje.
- Investigación en aprendizaje por imitación: sirve como punto de partida reproducible para estudiar cómo se comporta un fine-tune de GR00T N1.7 restringido a una extremidad y una tarea.
- Evaluación de políticas robóticas en simulación y realidad: el contrato de modalidad (tres cámaras, estado de brazos, horizonte de 24 pasos) permite integrarlo en bancos de pruebas de manipulación con la misma configuración de sensores.
- Generación de datos sintéticos de trayectorias: las acciones del brazo derecho pueden emplearse como referencia para aumentar datasets de la tarea de colocación de rollos.
- Prototipado rápido de tareas de ensamblaje o colocación: al estar entrenado sobre LeRobot, se puede adaptar a tareas análogas mediante nuevos ajustes finos sobre el mismo modelo base.
- Demostraciones de robótica con modelos fundacionales: útil para mostrar el flujo de especialización de un VLA generalista a una tarea industrial concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 3.144.016.000 parámetros, en precisión de 16 bits los pesos ocupan aproximadamente 6,3 GB; con estados de activación, buffers de visión y la cabeza de acciones, es razonable reservar del orden de 10 a 16 GB de VRAM. Estas cifras son estimaciones a partir del número de parámetros y no un dato confirmado por el autor.
- El repositorio ocupa 35,7 GB, lo que sugiere que puede contener varias copias de pesos, estados del optimizador o checkpoints auxiliares; no se especifica el desglose.
- GPU recomendadas: no disponibles en la información. Por tamaño, una GPU con 16 GB o más de VRAM (por ejemplo, RTX 4090, A100, H100) sería suficiente para inferencia, pero no hay confirmación oficial.
- ¿Cabe en GPU de consumo?: probablemente sí en tarjetas con 16 GB o más de VRAM si los pesos se cargan a 16 bits, aunque no está confirmado.
- Opciones de despliegue: el modelo usa `library_name: transformers` y formato safetensors, por lo que el despliegue se realizaría a través de la librería transformers. No se indican soportes específicos para vLLM, llama.cpp, Ollama ni TGI, y al tratarse de un modelo de robótica con salidas de acción, estos motores de inferencia de texto probablemente no sean aplicables.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Groot-n17-PaperTowelRoll-Tasks730-732-733-RightArmOnly | 3.144.016.000 | no disponible | no disponible | no disponible | HuggingFace (0 descargas) |
| nvidia/GR00T-N1.7-3B (modelo base) | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| Otros fine-tunes de GR00T N1.7 | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| Alternativas VLA generalistas (por ejemplo OpenVLA, pi0) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos cuantitativos de rendimiento, contexto ni licencia para establecer una comparación rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Especialización extrema: el modelo está entrenado para una única tarea (colocar un rollo de papel de cocina en un soporte) y no es apto para tareas generales de manipulación fuera de ese dominio.
- Control restringido al brazo derecho: no gobierna el brazo izquierdo, que debe permanecer en una pose fija gestionada por el controlador del robot; usarlo con una configuración distinta puede invalidar su comportamiento.
- Dependencia de la configuración de sensores: requiere exactamente tres cámaras (`cam_left_head`, `cam_left_wrist`, `cam_right_wrist`) y el estado de ambos brazos; cambios en la disposición de cámaras o en el robot pueden degradar el rendimiento.
- Horizonte de acción fijo de 24 pasos: la planificación está limitada a ese horizonte, sin información sobre replanificación de largo plazo.
- Sesgos conocidos: no disponibles; al entrenarse sobre un dataset concreto de una tarea, heredará los sesgos de las demostraciones humanas de ese dataset.
- Riesgo de alucinación: no disponible para modelos de acción, pero existe riesgo de comportamientos fuera de distribución ante escenas o estados no vistos durante el entrenamiento.
- Limitaciones de contexto e idioma: no disponibles.
- Licencia no especificada: al no indicarse licencia, no se puede confirmar si se permite el uso comercial; conviene verificar la licencia del modelo base nvidia/GR00T-N1.7-3B antes de cualquier despliegue en producción.
- Estado del repositorio: 0 descargas y 0 "likes", sin validación por parte de la comunidad; trátese como un artefacto experimental.
- Caveat de producción: no se han publicado métricas de éxito de la tarea ni resultados en robot real, por lo que no hay evidencia pública de robustez.

## Enlaces

- HuggingFace: https://huggingface.co/RobotisSW/Groot-n17-PaperTowelRoll-Tasks730-732-733-RightArmOnly
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Paper, blog, repositorio o demo adicionales: no disponibles en la informacion proporcionada.
