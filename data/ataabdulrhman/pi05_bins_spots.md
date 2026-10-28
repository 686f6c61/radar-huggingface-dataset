# ataabdulrhman/pi05_bins_spots

## Resumen

`ataabdulrhman/pi05_bins_spots` es una política robótica de tipo Vision-Language-Action (VLA) publicada en Hugging Face por el usuario ataabdulrhman, obtenida por ajuste fino del modelo base `lerobot/pi05_base`. π₀.₅ (Pi05) es el modelo de la familia π desarrollado por Physical Intelligence, orientado a la generalización en entornos abiertos, y la implementación disponible en este repositorio es la adaptación de LeRobot (Hugging Face) a partir del repositorio OpenPI de Physical Intelligence. El modelo no es un LLM conversacional: recibe observaciones del robot (estado articular y tres cámaras) y emite directamente un vector de acciones.

Este checkpoint concreto está especializado en una única tarea: colocar contenedores ("bins") en sus posiciones ("spots") con un robot bimanual UR7e. Se entrenó con 68 episodios y 80.079 fotogramas a 30 FPS durante 10.000 pasos con AdamW. Su relevancia práctica es la de un ejemplo reproducible de ajuste fino de π₀.₅ en LeRobot, útil como referencia de pipeline y como línea base para tareas de manipulación bimanual.

El modelo tiene 4.143.404.816 parámetros (≈4,14 B) y pesos en safetensors bajo licencia Apache 2.0. El autor no ha publicado resultados de evaluación en robot real, y el repositorio no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA); detalles internos de la red (tipo de transformer, mecanismo de atención, componente de acción) no disponibles |
| Parámetros totales | 4.143.404.816 (≈4,14 B) |
| Parámetros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Pesos en safetensors (fp16/bf16); no se han publicado versiones GGUF ni cuantizaciones oficiales en el repositorio |
| Idiomas soportados | No disponible (la política se condiciona a la instrucción de tarea "put the bins on their spots") |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

La arquitectura es una política VLA que consume tres cámaras RGB (`base_0_rgb`, `left_wrist_0_rgb`, `right_wrist_0_rgb`) con resolución de 3×280×448 píxeles y un vector de estado de 14 dimensiones, y produce un vector de acción de 14 dimensiones, adecuado para un robot bimanual `ur7e_bimanual_scale`. La model card no detalla el número de capas, el mecanismo de atención ni el método de generación de acciones (difusión, flow matching u otro), por lo que esos datos se consideran no disponibles.

El ajuste fino se realizó sobre `lerobot/pi05_base` con 10.000 pasos, tamaño de lote 32, optimizador AdamW, tasa de aprendizaje 2,5e-05 y semilla 1000, usando LeRobot 0.6.1. El conjunto de datos `ataabdulrhman/ur_bins_spots` contiene 68 episodios, 80.079 fotogramas a 30 FPS y una única tarea. No se especifican el número de tokens de entrenamiento, la composición del dataset del modelo base ni si se aplicaron etapas de RLHF o DPO. El modelo base π₀.₅, según la información pública de Physical Intelligence recogida en Qualcomm AI Hub, se coentrena con datos diversos (demostraciones de robot, datos web y subtareas semánticas) para generalización en manipulación de horizonte largo.

## Capacidades

- Generación de acciones de manipulación bimanual: salida continua de 14 dimensiones a partir de estado y visión.
- Condicionamiento por instrucción de lenguaje natural para seleccionar la tarea.
- Percepción visual multivista con tres cámaras simultáneas (base y dos muñecas).
- Ejecución de una tarea específica de colocación de contenedores en posiciones objetivo.
- Integración nativa con el ecosistema LeRobot (rollout, entrenamiento y evaluación).
- No soporta tool calling ni function calling: no es un modelo de lenguaje conversacional.
- No dispone de soporte documentado de agentes, razonamiento multi-paso simbólico ni modo "thinking".
- Capacidades multilingües: no disponibles; la instrucción de entrenamiento está en inglés.
- Capacidad especial: política de imitación (visión-lenguaje-acción), no un modelo generativo de texto.

## Casos de uso

- Colocación de contenedores en posiciones marcadas: es la tarea exacta para la que se entrenó; se ejecuta con `lerobot-rollout`, indicando el puerto del robot, las tres cámaras con los nombres de observación correctos y la instrucción "put the bins on their spots".
- Automatización de pick-and-place en logística: con un UR7e bimanual y cámaras en base y muñecas, la política puede alimentar el bucle de control a 30 FPS para reubicar bandejas o cajas en posiciones fijas de una célula de trabajo.
- Línea base para ajuste fino de nuevas tareas: al partir de `lerobot/pi05_base` con una configuración documentada (10.000 pasos, lote 32, lr 2,5e-05), sirve como referencia para validar tiempos y tasas de éxito en datasets pequeños (68 episodios).
- Prototipado de pipelines de imitación en laboratorio: permite comprobar de extremo a extremo la grabación de datos, el entrenamiento y el despliegue con LeRobot 0.6.1 antes de escalar a tareas más complejas.
- Investigación en manipulación bimanual con visión multivista: el esquema de tres cámaras y 14 dimensiones de acción es reutilizable para estudiar sensibilidad a cambios de iluminación, posiciones de objeto y distracciones.
- Generación de datos y evaluación comparativa interna: al ser un checkpoint público con configuración completa, se puede usar como punto de comparación reproducible frente a nuevas políticas entrenadas con el mismo dataset.
- Demostraciones educativas de VLA: útil para cursos y talleres que expliquen cómo se conecta un modelo preentrenado de Physical Intelligence con un robot real mediante LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una sección de evaluación vacía con la nota explícita de que no se han proporcionado resultados para esta política; no hay tasas de éxito, número de ensayos ni latencias medidas en robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8,3 GB con pesos en fp16/bf16 (4,14 B parámetros); en torno a 4,2 GB en int8 y 2,1 GB en int4, sin cuantizaciones oficiales publicadas.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 para margen holgado con activaciones y procesamiento de las tres cámaras.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 (24 GB) con fp16; en RTX 4080/4070 Ti (16 GB) el margen es ajustado y conviene reducir el lote o usar precisión mixta; en tarjetas de 8 GB solo sería viable con cuantización.
- Opciones de despliegue: LeRobot (`lerobot-rollout`, `lerobot-train`) sobre PyTorch/CUDA; existe una versión optimizada de Pi0.5 en Qualcomm AI Hub para dispositivos Qualcomm. vLLM, llama.cpp y TGI no son aplicables, ya que no es un modelo de lenguaje con pesos GGUF.
- Latencia y throughput: el dataset se grabó a 30 FPS, lo que sugiere un bucle de control a esa frecuencia, pero no se han publicado medidas de latencia de inferencia ni de throughput.
- Almacenamiento: el repositorio ocupa 9,4 GB, por encima de los pesos en fp16, lo que probablemente incluye estados del optimizador u otros artefactos de entrenamiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ataabdulrhman/pi05_bins_spots` | 4.143.404.816 (≈4,14 B) | No disponible | Ajuste fino de π₀.₅ con 68 episodios, tarea única | Apache 2.0 | Hugging Face, 0 descargas |
| `lerobot/pi05_base` | No disponible | No disponible | Modelo base generalista de π₀.₅ (Physical Intelligence) | No disponible | Hugging Face |
| `shikharbahl/pi05` | No disponible | No disponible | Política π₀.₅ adaptada en LeRobot, tarea no especificada en la información | No disponible | Hugging Face |
| π₀.₅ original (Physical Intelligence) | No disponible | No disponible | Coentrenamiento con demostraciones de robot, datos web y subtareas semánticas | No disponible | Pesos no indicados en la información; despliegue optimizado en Qualcomm AI Hub |

## Limitaciones y advertencias

- Especialización extrema: entrenado para una sola tarea y un solo tipo de robot (`ur7e_bimanual_scale`); no se espera transferencia directa a otras tareas, objetos o configuraciones de cámara.
- Dataset muy pequeño: 68 episodios pueden provocar sobreajuste a posiciones, iluminación y fondo concretos del entorno de grabación.
- Ausencia de evaluación: no hay tasas de éxito publicadas, por lo que el rendimiento real en el robot es desconocido.
- Dependencia de los nombres de observación: las claves de cámara (`base_0_rgb`, `left_wrist_0_rgb`, `right_wrist_0_rgb`) y el orden del vector de estado deben coincidir exactamente con los del entrenamiento.
- Riesgo de alucinación en sentido amplio: la política puede generar acciones plausibles pero incorrectas ante escenas fuera de distribución; requiere supervisión y paradas de emergencia en producción.
- Sesgos conocidos: no documentados por el autor; al depender de un dataset reducido, hereda los sesgos de las posiciones y objetos presentes en él.
- Idiomas: no se especifican capacidades multilingües; la instrucción de tarea está en inglés y no se ha validado en otros idiomas.
- Licencia Apache 2.0: permite uso comercial y modificación, pero no se ofrecen garantías ni soporte por parte del autor.
- Madurez: 0 descargas y 0 "likes" en el momento de la consulta; no hay evidencia de uso en producción.
- Seguridad física: cualquier despliegue en un robot real debe incorporar límites de par, paradas de emergencia y validación en entorno controlado antes de operar cerca de personas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ataabdulrhman/pi05_bins_spots
- Dataset de entrenamiento: https://huggingface.co/datasets/ataabdulrhman/ur_bins_spots
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ataabdulrhman/ur_bins_spots
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Blog de π₀.₅ de Physical Intelligence: https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de pi05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Guía de entrenamiento con imitación: https://huggingface.co/docs/lerobot/main/en/il_robots
- Pi0.5 en Qualcomm AI Hub: https://aihub.qualcomm.com/models/pi05
- README de pi05 en ai-hub-models: https://github.com/qualcomm/ai-hub-models/blob/main/src/qai_hub_models/models/pi05/README.md
- Otra política π₀.₅ en LeRobot: https://huggingface.co/shikharbahl/pi05
