# sam-guided-vlas/train_1_2_3_4_hard_items__no_mask__pi05__seed_0__steps_15k

## Resumen

El modelo `sam-guided-vlas/train_1_2_3_4_hard_items__no_mask__pi05__seed_0__steps_15k` es un fine-tuning de π₀.₅ (Pi05), un modelo Vision-Language-Action (VLA) desarrollado por Physical Intelligence para la generalización en mundo abierto en robótica. Este fine-tuning concreto ha sido realizado por el usuario `sam-guided-vlas` sobre el modelo base `lerobot/pi05_base`, utilizando el framework LeRobot de HuggingFace. El modelo está entrenado para tareas de manipulación robótica con un brazo Panda, usando como entrada imágenes de tres cámaras y el estado del robot, y generando acciones de 7 dimensiones. Con 4.143.404.816 parámetros, el modelo está pensado para resolver tareas de agarre y manipulación de objetos variados en entornos nuevos, sin necesidad de reentrenamiento. Es relevante porque demuestra la aplicación de modelos VLA de código abierto en robótica, con una arquitectura que combina visión y lenguaje para actuar en el mundo físico.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en transformer, adaptada de OpenPI |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo se basa en π₀.₅, un VLA que evoluciona π₀ para generalizar a entornos y situaciones nunca vistos durante el entrenamiento. La implementación de LeRobot está adaptada del repositorio open-source OpenPI de Physical Intelligence. El fine-tuning se ha realizado sobre el modelo base `lerobot/pi05_base`, utilizando el dataset `sam-guided-vlas/train_1_2_3_4_hard_items__no_mask`, compuesto por 446 episodios y 66.323 fotogramas a 20 FPS. Las tareas de entrenamiento consisten en la manipulación de objetos con formas y texturas variadas, descritas en lenguaje natural, lo que permite al modelo asociar descripciones visuales y textuales con acciones motoras. No se han proporcionado detalles sobre técnicas de alineación como RLHF o DPO.

## Capacidades

- Manipulación robótica en mundo abierto: el modelo puede generalizar a entornos y objetos nuevos, según la descripción de π₀.₅.
- Entradas multimodales: consume observaciones de estado (9 dimensiones) e imágenes de tres cámaras (`agentview`, `robot0_eye_in_hand` y `robot0_eye_in_hand_2`) a 224×224 píxeles.
- Salida de acciones: genera acciones de 7 dimensiones para el brazo robótico.
- Aprendizaje por demostración: entrenado con episodios de teleoperación o demostraciones, lo que permite imitar comportamientos.
- Soporte de tareas de agarre y manipulación de objetos con descripciones en lenguaje natural.
- No se mencionan capacidades de tool calling, agentes o razonamiento multi-paso.

## Casos de uso

- Manipulación de objetos en entornos industriales: el modelo puede controlar un brazo Panda para clasificar o ensamblar piezas variadas, gracias a su capacidad de generalización a objetos no vistos.
- Robótica de laboratorio: automatizar tareas de agarre de muestras o instrumentos con formas irregulares, usando las tres cámaras para percibir el entorno.
- Teleoperación y aprendizaje por demostración: el modelo puede ser entrenado con demostraciones humanas y luego reproducir las acciones en un robot real.
- Investigación en generalización robótica: sirve como base para estudiar cómo los modelos VLA se comportan ante objetos con descripciones complejas en lenguaje natural.
- Automatización de pick-and-place en almacenes: combinar la entrada de estado y visión para colocar objetos en posiciones concretas, incluso si el objeto tiene una forma inusual.
- Control de brazos robóticos en simulación: el modelo puede desplegarse en entornos simulados para validar políticas de control antes de transferirlas al mundo real.
- Asistencia en tareas de ensamblaje: el modelo puede ejecutar acciones de 7 dimensiones para alinear y encajar componentes, guiado por las imágenes de las cámaras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente. Con 4.143.404.816 parámetros, en FP32 se requieren aproximadamente 16,5 GB y en FP16 unos 8,3 GB, sin contar las activaciones.
- GPU recomendadas: no disponible. Se requiere una GPU con al menos 16 GB de VRAM para FP32, o 8-10 GB para FP16.
- Compatibilidad con GPU de consumo: no disponible. Con cuantización podría caber en una GPU de 24 GB, pero no se ofrecen cuantizaciones.
- Opciones de despliegue: LeRobot, HuggingFace Transformers (a través de la librería LeRobot). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se han proporcionado datos de comparación con otros modelos en la información disponible. El modelo es un fine-tuning de `lerobot/pi05_base`, por lo que su comportamiento se espera similar al del modelo base, pero adaptado a las tareas específicas del dataset. Sin datos de benchmarks, no es posible realizar una comparativa cuantitativa.

## Limitaciones y advertencias

- Sesgos: no disponibles.
- Riesgo de alucinación: al ser un modelo de acción, puede fallar en la ejecución de acciones si la percepción visual o la descripción del objeto no coincide con el entrenamiento.
- Limitaciones de contexto o idioma: no disponibles. El modelo se basa en descripciones en lenguaje natural, pero no se especifican idiomas soportados.
- Restricciones de licencia: el modelo tiene licencia Apache 2.0, pero se debe verificar la licencia del modelo base (`lerobot/pi05_base`) y del dataset utilizado, ya que pueden imponer condiciones adicionales.
- Caveat para producción: el modelo no tiene descargas ni likes, no se han publicado benchmarks y su entrenamiento se ha realizado con un dataset de 446 episodios. No hay evidencia de que esté listo para uso en producción sin una evaluación exhaustiva.

## Enlaces

- HuggingFace: https://huggingface.co/sam-guided-vlas/train_1_2_3_4_hard_items__no_mask__pi05__seed_0__steps_15k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/sam-guided-vlas/train_1_2_3_4_hard_items__no_mask
- Blog de Physical Intelligence sobre π₀.₅: https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
