# polarisai-robots/bento_ur7e_pi05_v6

## Resumen

`polarisai-robots/bento_ur7e_pi05_v6` es una política robótica vision-lenguaje-acción (VLA) obtenida por ajuste fino de `lerobot/pi05_base`, la implementación en LeRobot de π₀.₅ de Physical Intelligence. No es un modelo de lenguaje general: recibe tres imágenes RGB de 224×224 y un vector de estado de 32 dimensiones, y produce una acción de 7 dimensiones para un brazo UR7e. El repositorio declara 4.143.404.816 parámetros (≈4,14 B) y un tamaño de 9,4 GB en formato safetensors.

El ajuste fino se ha realizado sobre el dataset `polarisai-robots/bento_ur7e_v4`, con 1.743 episodios y 754.551 fotogramas a 60 FPS, para cuatro tareas de recogida y colocación de alimentos en una fiambrera: pollo frito, brócoli, filete de pescado y salchicha. La licencia es Apache-2.0 y la librería de referencia es LeRobot 0.6.0.

Su interés actual es práctico: demuestra el flujo completo de LeRobot para ajustar π₀.₅ a un robot y a un conjunto reducido de tareas, con instrucciones de despliegue mediante `lerobot-rollout`. Ahora bien, la model card no incluye resultados de evaluación en robot real, no documenta cuantizaciones y el repositorio tenía 0 descargas y 0 me gusta en el momento de la consulta, por lo que debe tratarse como un artefacto experimental y no como una política validada para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅; implementación LeRobot/OpenPI. La model card no detalla el backbone interno. |
| Parámetros totales | 4.143.404.816 (≈4,14 B) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; no aplica. La entrada es fija: 3 imágenes de 3×224×224 y estado de 32 dimensiones. |
| Tipos de cuantización | no disponible. No se documentan variantes GGUF, AWQ, GPTQ ni cuantizaciones oficiales. |
| Idiomas soportados | no disponible. Las instrucciones de tarea documentadas están en inglés; no se declara soporte multilingüe. |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Tipo de modelo | política robótica visuomotora (VLA), no un LLM de texto |
| Robot | UR7e |
| Entradas | `observation.images.base_0_rgb` (3, 224, 224), `observation.images.left_wrist_0_rgb` (3, 224, 224), `observation.images.right_wrist_0_rgb` (3, 224, 224), `observation.state` (32,) |
| Salidas | `action` (7,) |
| Dataset de ajuste | `polarisai-robots/bento_ur7e_v4`: 1.743 episodios, 754.551 fotogramas, 60 FPS |
| Librería | LeRobot 0.6.0 |
| Tamaño del repositorio | 9,4 GB |
| Descargas / me gusta | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

π₀.₅ es un modelo VLA de Physical Intelligence; la implementación de LeRobot se adapta del repositorio OpenPI. La información proporcionada no detalla la arquitectura interna completa: no se especifican el backbone visual, el encoder de lenguaje, la cabeza de acciones ni el mecanismo exacto de generación de acciones. Por tanto, no se afirman aquí detalles sobre número de capas, tipo de atención o innovaciones internas. El uso documentado es el de una política de imitación condicionada por observaciones visuales y propioceptivas, que predice un vector de acción de 7 dimensiones.

El ajuste fino emplea 1.743 episodios y 754.551 fotogramas a 60 FPS, con cuatro instrucciones de tarea: recoger pollo frito, brócoli, filete de pescado o salchicha y colocarlo en una fiambrera. La configuración declarada es de 100.000 pasos, tamaño de lote 16, optimizador AdamW, tasa de aprendizaje 5e-05, semilla 1000 y LeRobot 0.6.0. No se documentan RLHF, DPO ni un pipeline de refuerzo; el entrenamiento descrito es de imitación supervisada sobre demostraciones. Tampoco se especifica la composición del preentrenamiento de π₀.₅ ni el número de tokens utilizado.

## Capacidades

- Manipulación robótica visuomotora: genera acciones de 7 dimensiones para un brazo UR7e a partir de tres vistas RGB y del estado propioceptivo.
- Condicionamiento por instrucción de tarea: las cuatro instrucciones documentadas están en inglés y describen la recogida y colocación de alimentos concretos.
- Percepción multi-cámara: utiliza tres entradas visuales de 224×224, correspondientes a una vista base y dos vistas de muñeca según la model card.
- Entrada de estado de 32 dimensiones: integra información propioceptiva del robot junto con las imágenes.
- Generalización declarada por el modelo base: π₀.₅ se presenta como una evolución de π₀ orientada a generalizar a entornos y situaciones nuevos, aunque esta ficha no aporta evaluación de esa generalización en el ajuste concreto.
- No soporta tool calling ni function calling: no es un modelo de lenguaje con herramientas.
- No soporta agentes ni razonamiento multi-paso textual: no hay modo de planificación lingüística ni cadena de pensamiento.
- No es un modelo de generación de texto, visión por computador general, audio o vídeo: su salida es una acción robótica.
- No se declara soporte multilingüe: las tareas documentadas están en inglés.
- No dispone de modo thinking, cuantizaciones oficiales ni variantes GGUF documentadas.

## Casos de uso

- Recogida y colocación de alimentos en una fiambrera: el modelo está entrenado específicamente para coger pollo frito, brócoli, filete de pescado o salchicha y depositarlos en una fiambrera con un UR7e. Es adecuado porque las cuatro tareas, el robot y las cámaras coinciden con los datos de ajuste.
- Automatización de una célula de catering o comedor: puede integrarse en un puesto repetitivo de montaje de bandejas, siempre que los objetos y la iluminación se mantengan dentro del dominio de entrenamiento. Su ventaja es que aprende de demostraciones y no requiere programación explícita de cada agarre.
- Manipulación de alimentos deformables o irregulares: brócoli, filetes de pescado y salchichas presentan variabilidad de forma y textura; el uso de tres cámaras permite al modelo ajustar el agarre según la vista. Es un caso realista para probar robustez, aunque no hay tasas de éxito publicadas.
- Investigación en aprendizaje por imitación y VLA: sirve como ejemplo reproducible de ajuste fino de `lerobot/pi05_base` con un dataset propio. Se puede utilizar para estudiar sensibilidad a hiperparámetros, número de episodios y composición de cámaras.
- Prototipado rápido con LeRobot y UR7e: el comando `lerobot-rollout` permite ejecutar la política en el robot sin escribir un controlador ad hoc. Es adecuado para laboratorios que ya dispongan de un UR7e, cámaras calibradas y el entorno de LeRobot instalado.
- Evaluación de robustez y recogida de fallos: ejecutar la política durante un número controlado de ensayos, registrar agarres fallidos, colisiones o desviaciones y usar esos datos para reentrenar. El modelo es útil como punto de partida, no como sistema validado.
- Generación de datos para un ciclo de mejora: si se configura la grabación de episodios, las ejecuciones pueden servir para ampliar el dataset y volver a ajustar la política. Es un uso habitual en flujos de imitación, pero requiere supervisión humana y control de calidad.
- Docencia y divulgación técnica: permite mostrar de forma tangible el funcionamiento de una política VLA, desde la grabación de demostraciones hasta el despliegue en un brazo colaborativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card incluye una sección de evaluación con la frase «No evaluation results have been provided for this policy yet» y una plantilla vacía. No hay datos de tasa de éxito en robot, ni resultados de MMLU, HumanEval, GSM8K u otros benchmarks de lenguaje, que además no serían aplicables a una política VLA de este tipo.

## Requisitos de hardware

- VRAM estimada solo para pesos: FP32 ≈16,6 GB; BF16/FP16 ≈8,3 GB; INT8 ≈4,1 GB; INT4 ≈2,1 GB. Hay que añadir activaciones, el procesamiento de tres cámaras y el overhead de PyTorch.
- GPU recomendadas para inferencia: H100 80 GB, A100 80 GB o 40 GB, L40S 48 GB, RTX 6000 Ada 48 GB. Para ajuste fino se recomienda A100/H100; no se documenta la GPU empleada en el entrenamiento original.
- GPU de consumo: RTX 4090 o RTX 3090 con 24 GB pueden alojar los pesos en BF16, aunque el margen depende de las activaciones y del pipeline de visión. Una GPU de 16 GB puede ser justa en BF16; no hay cuantización oficial documentada para reducir memoria.
- Despliegue: `lerobot-rollout` con `--policy.path=polarisai-robots/bento_ur7e_pi05_v6`, sobre PyTorch y CUDA. El entrenamiento se realiza con `lerobot-train` desde `lerobot/pi05_base`.
- Alternativas de despliegue: no hay soporte documentado para vLLM, TGI, llama.cpp u Ollama. Al no ser un LLM de texto y no publicarse pesos GGUF, esas rutas no son aplicables directamente.
- Latencia y throughput: no disponibles. Los 60 FPS del dataset no implican que la inferencia se ejecute a 60 FPS; la frecuencia real depende de la GPU, del preprocesamiento de imágenes y del bucle de control del robot.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `polarisai-robots/bento_ur7e_pi05_v6` | VLA ajustada para UR7e y cuatro tareas de alimentos | 4,14 B | no aplica | sin evaluación publicada | Apache-2.0 | Hugging Face |
| `lerobot/pi05_base` | VLA base π₀.₅ | no disponible | no aplica | no disponible | no disponible | Hugging Face |
| π₀.₅ original (Physical Intelligence) | VLA base | no disponible | no aplica | no disponible | no disponible | blog y OpenPI |
| Políticas de imitación específicas (ACT, Diffusion Policy) | políticas visuomotoras | no disponible | no aplica | no disponible | varía | LeRobot |

No se incluyen cifras comparativas de rendimiento porque no hay benchmarks publicados en la información disponible. La comparación relevante es cualitativa: este modelo es un ajuste fino muy especializado, mientras que `lerobot/pi05_base` y π₀.₅ son modelos base de propósito más general, y ACT o Diffusion Policy son alternativas de imitación que suelen requerir entrenamiento específico por tarea.

## Limitaciones y advertencias

- Sin evaluación publicada: no se conoce la tasa de éxito real en el robot, ni su robustez ante cambios de posición, iluminación, fondo u objetos.
- Alcance muy limitado: el ajuste cubre cuatro tareas concretas de recogida y colocación de alimentos; no es una política general de manipulación.
- Riesgo de sobreajuste: 1.743 episodios y 754.551 fotogramas pueden ser insuficientes para generalizar a nuevas instancias de alimento, envases, configuraciones de cámara o entornos distintos.
- Inconsistencia en la documentación de cámaras: la sección de detalles indica cámaras `top` y `wrist`, mientras que las entradas declaradas son `base_0_rgb`, `left_wrist_0_rgb` y `right_wrist_0_rgb`. Hay que verificar los nombres y la calibración antes de desplegar.
- Idioma: las instrucciones documentadas están en inglés; no se declara soporte de instrucciones en castellano ni multilingüismo.
- Cuantización: no se documentan variantes oficiales INT8, INT4, GGUF, AWQ o GPTQ; el despliegue en GPU de menor memoria requeriría una cuantización externa no validada.
- Licencia: Apache-2.0 permite uso comercial, pero el modelo no está certificado para manipulación de alimentos ni para operar cerca de personas. La seguridad física depende del robot, del controlador y de los límites de velocidad y fuerza.
- Alucinación: en un VLA no hay alucinación textual en el sentido de un LLM; el fallo típico es una acción incorrecta, un agarre fallido o una colisión. La supervisión humana y las paradas de emergencia siguen siendo necesarias.
- Sesgos del dataset: no se documentan sesgos, pero el conjunto está restringido a cuatro alimentos y a un entorno de recogida concreto; es probable que falle con objetos, colores, texturas o distribuciones distintas.
- Madurez: el repositorio tenía 0 descargas y 0 me gusta en el momento de la consulta, sin validación comunitaria ni resultados independientes.
- No es un modelo de lenguaje: no debe utilizarse para generación de texto, atención al cliente, código, matemáticas ni tareas de razonamiento lingüístico.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/polarisai-robots/bento_ur7e_pi05_v6)
- [Modelo base lerobot/pi05_base](https://huggingface.co/lerobot/pi05_base)
- [Dataset polarisai-robots/bento_ur7e_v4](https://huggingface.co/datasets/polarisai-robots/bento_ur7e_v4)
- [Visualizador del dataset](https://huggingface.co/spaces/lerobot/visualize_dataset?path=polarisai-robots/bento_ur7e_v4)
- [Blog de π₀.₅ en Physical Intelligence](https://www.physicalintelligence.company/blog/pi05)
- [Repositorio LeRobot](https://github.com/huggingface/lerobot)
- [Guía de LeRobot para pi05](https://huggingface.co/docs/lerobot/main/en/pi05)
- [Documentación completa de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Instalación de LeRobot](https://huggingface.co/docs/lerobot/main/en/installation)
- [Guía de hardware de LeRobot](https://huggingface.co/docs/lerobot/main/en/hardware_guide)
- [Grabación de datos y entrenamiento de políticas](https://huggingface.co/docs/lerobot/en/il_robots)
- [Referencia rápida de comandos de LeRobot](https://huggingface.co/docs/lerobot/main/en/cheat-sheet)
- [Documentación de inferencia y rollout](https://huggingface.co/docs/lerobot/main/en/inference)
