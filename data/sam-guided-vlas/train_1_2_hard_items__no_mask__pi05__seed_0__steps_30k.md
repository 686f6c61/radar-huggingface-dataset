# sam-guided-vlas/train_1_2_hard_items__no_mask__pi05__seed_0__steps_30k

## Resumen

El modelo `sam-guided-vlas/train_1_2_hard_items__no_mask__pi05__seed_0__steps_30k` es un fine-tuning de `lerobot/pi05_base`, un modelo Vision-Language-Action (VLA) desarrollado por Physical Intelligence y adaptado al ecosistema de LeRobot. Pi0.5 es la evolución de Pi0, diseñado para generalizar a entornos y situaciones nunca vistos durante el entrenamiento, lo que lo hace relevante para tareas de manipulación robótica en mundo abierto.

Este checkpoint concreto se ha entrenado sobre un dataset de 199 episodios y 31.073 frames capturados a 20 FPS, con un robot Panda equipado con tres cámaras (agentview y dos eye-in-hand). El modelo recibe observaciones de estado (9 dimensiones) y tres imágenes de 224x224, y produce acciones de 7 dimensiones para control de bajo nivel. Con 4.143.404.816 parámetros y pesos en formato safetensors, está pensado para su uso con LeRobot.

Al tratarse de una política robótica, su valor radica en permitir la reproducción y el ajuste de comportamientos de manipulación complejos, como agarrar objetos de geometrías irregulares, a partir de demostraciones humanas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en transformer, implementada con LeRobot |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (procesa frames de imagen y estado, no texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de accion robotica, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de Pi0.5, un VLA que combina codificadores visuales, un modelo de lenguaje y un decodificador de acciones. La implementación de LeRobot se adapta del repositorio OpenPI de Physical Intelligence. No se detalla en la información disponible la composición interna exacta (tipo de atención, capas, etc.).

El entrenamiento se ha realizado con LeRobot sobre el dataset `sam-guided-vlas/train_1_2_hard_items__no_mask`, que contiene 199 episodios y 31.073 frames a 20 FPS. Las tareas descritas corresponden a agarre y manipulación de objetos con formas complejas (esferas sujetadas por brazos, copas con cuentas, cajas con agujeros, etc.). El modelo se ha afinado a partir de `lerobot/pi05_base`, que es la versión base de Pi0.5. No se indica si se aplicaron técnicas como RLHF, DPO o aprendizaje por refuerzo posterior; los datos disponibles únicamente reflejan un fine-tuning supervisado de demostraciones.

## Capacidades

- Control robótico de bajo nivel: genera acciones de 7 dimensiones (posición, orientación y gripper) a partir de observaciones de estado y de imagen.
- Percepción multi-cámara: consume tres entradas visuales simultáneas (`agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2`) de 224x224 píxeles.
- Manipulación de objetos con geometrías irregulares: entrenado para agarrar piezas con superficies texturizadas, lóbulos, ranuras y aberturas.
- Generalización open-world: heredada del modelo base Pi0.5, que está diseñado para actuar en entornos y situaciones no vistos durante el entrenamiento.
- Ejecución a 20 FPS: el modelo puede procesar el flujo de imágenes y generar acciones en tiempo real si el hardware lo permite.
- No soporta tool calling, generación de texto, razonamiento en lenguaje natural ni capacidades multilingües, ya que es una política robótica.

## Casos de uso

- Manipulación de piezas en ensamblaje: el modelo puede ejecutar movimientos precisos para agarrar piezas complejas en una celda robótica, reduciendo la necesidad de programar trayectorias manualmente.
- Teleoperación con políticas aprendidas: dado que fue entrenado con demostraciones, puede reproducir comportamientos similares a los del operador humano en tareas de agarre de objetos con formas variadas.
- Investigación en open-world robotics: sirve como referencia para estudiar cómo las políticas VLA generalizan a objetos no vistos, gracias a la base Pi0.5.
- Fine-tuning para tareas específicas: el checkpoint puede usarse como punto de partida para ajustar la política a otras piezas o configuraciones de robot, usando LeRobot.
- Evaluación de la influencia de distintas vistas de cámara: al incluir dos cámaras eye-in-hand y una vista de agente, es útil para comparar el efecto de información visual adicional en el control.
- Benchmark de aprendizaje por imitación: el dataset y el modelo permiten comparar la eficiencia de diferentes algoritmos de política en tareas de manipulación con objetos difíciles.
- Despliegue en robots de laboratorio tipo Panda: este modelo está calibrado para la cinemática y el espacio de acción de un robot Panda, por lo que es directamente utilizable en ese hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existe evidencia de evaluaciones de MMLU, HumanEval, GSM8K ni de métricas de ejercicio robótico para este checkpoint. El rendimiento debe evaluarse empíricamente en el robot objetivo.

## Requisitos de hardware

- El repositorio pesa 18,7 GB, lo que corresponde a los pesos completos en safetensors con precisión FP32. Para cargar el modelo en memoria se necesitan al menos 18,7 GB de VRAM o RAM.
- Se estima que para inferencia en FP32 se requiere una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 4090, A100 40 GB o superior).
- En caso de cuantización (no disponible en el repo), sería posible reducir los requisitos, pero no se proporcionan pesos cuantizados.
- El despliegue se realiza a través de LeRobot, que es la librería oficial para cargar y ejecutar la política. No se han documentado opciones de despliegue con vLLM, llama.cpp, Ollama o TGI, porque no es un modelo de lenguaje.
- La latencia y el throughput estimados no se indican en la información disponible; dependen del hardware y del entorno de ejecución.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `sam-guided-vlas/train_1_2_hard_items__no_mask__pi05__seed_0__steps_30k` | 4.143.404.816 | no disponible | Apache 2.0 | HuggingFace |
| `sam-guided-vlas/train_1_2__no_mask__pi05__seed_0__steps_15k` | no disponible | no disponible | Apache 2.0 | HuggingFace |
| `lerobot/pi05_base` | no disponible | no disponible | Apache 2.0 | HuggingFace |

Se trata de variantes del mismo modelo base Pi0.5. La diferencia principal es el dataset de fine-tuning y el número de pasos de entrenamiento. No se dispone de benchmarks comparativos ni de datos de rendimiento publicados.

## Limitaciones y advertencias

- El modelo se ha afinado sobre un dataset muy concreto de 199 episodios con objetos de formas específicas; es probable que su capacidad de generalización falle fuera de ese dominio, a pesar de la intención open-world de Pi0.5.
- No incluye mecanismos de análisis de seguridad ni de validación de acciones, por lo que se recomienda supervisión humana y frenos de emergencia en entornos reales.
- Las acciones se limitan a la configuración del robot Panda (7 dimensiones). No es directamente aplicable a otros robots sin una adaptación de la API y del espacio de acción.
- No hay datos de robustez ante condiciones de iluminación, oclusiones o cambios de cámara. Las tres cámaras concretas están fijadas en el modelo.
- Al ser una política de bajo nivel, cualquier error en la percepción o en el estado puede derivar en movimientos incorrectos que dañen el robot o los objetos.
- No se han publicado evaluaciones de seguridad ni de sesgos. La licencia Apache 2.0 permite uso comercial, pero no exime de la validación técnica previa al despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sam-guided-vlas/train_1_2_hard_items__no_mask__pi05__seed_0__steps_30k
- Dataset de entrenamiento: https://huggingface.co/datasets/sam-guided-vlas/train_1_2_hard_items__no_mask
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Blog de Physical Intelligence sobre Pi0.5: https://www.physicalintelligence.company/blog/pi05
- Documentación de LeRobot para Pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación general de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio OpenPI (mencionado en la model card): no se ha encontrado un enlace directo en la información proporcionada.
