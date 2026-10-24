# 2DC/SmolVLA_test

## Resumen

2DC/SmolVLA_test es un checkpoint de robótica del tipo vision-language-action (VLA) publicado en HuggingFace Hub por el usuario 2DC. Se trata de un ajuste fino (fine-tune) del modelo base lerobot/smolvla_base, la implementación de referencia de SmolVLA dentro del framework LeRobot de Hugging Face. El modelo consume dos cámaras RGB de 256x256 píxeles más el estado del robot (vector de 8 dimensiones) y produce un vector de acción de 7 dimensiones, siguiendo el esquema de imitación supervisada que emplea LeRobot para políticas robóticas.

El interés de este repositorio no está en el modelo en sí, sino en su naturaleza experimental: el autor lo ha entrenado durante solo 20 pasos con batch de 32 sobre el dataset lerobot/libero (1693 episodios, 273.465 frames a 10 FPS), lo que sitúa el resultado en la categoría de prueba técnica más que de política utilizable. El modelo base, en cambio, es relevante porque SmolVLA es una apuesta por VLA compactos (450 millones de parámetros) desplegables en hardware de consumo, frente a alternativas de varios miles de millones de parámetros.

Con licencia Apache 2.0, formato safetensors y un tamaño de repositorio de 1,2 GB, el checkpoint es fácil de inspeccionar y de reproducir, pero no debe considerarse un artefacto listo para producción ni para evaluación de capacidades robóticas reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA): codificador visual multi-cámara + estado propioceptivo + cabeza generadora de acciones; detalle interno del backbone no disponible |
| Parametros totales | 450.046.176 (dato real de safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (política de control, no modelo de lenguaje conversacional; ventana de observación fija por frame) |
| Tipos de cuantizacion | No disponible en la model card; pesos publicados en safetensors (fp32/bf16 presumible, no confirmado) |
| Idiomas soportados | No disponible; las instrucciones del dataset de entrenamiento están en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, empaquetado como política LeRobot (librería `lerobot`) |
| Tipo de robot | `panda` |
| Cámaras de entrada | `observation.images.image` (3, 256, 256), `observation.images.image2` (3, 256, 256), `observation.images.empty_camera_0` (3, 480, 640) |
| Estado de entrada | `observation.state` (8,) |
| Salida | `action` (7,) |
| Tamaño del repositorio | 1,2 GB |
| Dataset de entrenamiento | lerobot/libero |
| Pasos de entrenamiento | 20 |
| Modelo base | lerobot/smolvla_base |

## Arquitectura y entrenamiento

SmolVLA es una familia de modelos vision-language-action concebida para reducir el coste computacional manteniendo un rendimiento competitivo y permitiendo el despliegue en hardware de consumo, según la descripción del artículo arXiv:2506.01844. La política combina observaciones visuales de varias cámaras con el estado del robot y emite un vector de acción continuo; en este checkpoint concreto, dos vistas de 256x256, una tercera vista de 480x640 y un estado de 8 dimensiones se mapean a 7 dimensiones de acción. El detalle exacto del backbone (familia de VLM empleada, mecanismo de generación de acciones, tipo de decodificación) no está desglosado en la información disponible de este repositorio y se remite al artículo y a la guía de LeRobot.

El entrenamiento es de imitación (behavior cloning) sobre el dataset lerobot/libero, que contiene 1693 episodios y 273.465 frames a 10 FPS, con 41 instrucciones de tarea en inglés que cubren manipulación de objetos cotidianos (tazas, cuencos, cajones, microondas, fogones). La configuración declarada es de 20 pasos, batch de 32, optimizador AdamW, learning rate 1e-4, semilla 1000 y LeRobot 0.6.2. Es una configuración de prueba: 20 pasos con 32 muestras por paso equivalen a 640 muestras procesadas, muy por debajo de lo necesario para que la política converja. No se documenta ningún uso de RLHF, DPO ni ajuste por preferencias, lo cual es esperable en políticas de imitación robótica.

## Capacidades

- Control robótico por imitación: genera acciones de 7 dimensiones a partir de observaciones visuales y de estado para un robot tipo `panda`.
- Fusión de múltiples cámaras: acepta tres flujos visuales simultáneos con resoluciones distintas (256x256 y 480x640).
- Interpretación de instrucciones en lenguaje natural: el formato de entrenamiento asocia cada episodio a una instrucción textual en inglés, del estilo "put the bowl on the plate".
- Ejecución de tareas de manipulación del benchmark LIBERO: apertura de cajones, colocación de objetos en cestas, uso de fogones y microondas, apilamiento de recipientes.
- Integración con el ecosistema LeRobot: entrenamiento, evaluación y despliegue mediante las herramientas `lerobot-*` (`lerobot-rollout`, scripts de entrenamiento y visualización de datasets).
- No soporta tool calling, function calling, razonamiento multi-paso genérico, generación de texto libre ni capacidades de audio o visión general más allá de la codificación visual para el control motor.
- No hay modo "thinking" ni razonamiento explícito: la salida es directamente un vector de acción.

## Casos de uso

- Reproducción del pipeline de LeRobot: el repositorio sirve como plantilla mínima para verificar la instalación de LeRobot 0.6.2, la carga del modelo base y el bucle de entrenamiento sobre un dataset propio antes de lanzar un entrenamiento serio.
- Pruebas de integración de hardware: validar que un robot `panda` con dos cámaras configuradas a 640x480 y 30 FPS se comunica correctamente con `lerobot-rollout` y produce acciones con la forma esperada (7,), sin esperar comportamiento competente.
- Depuración de pipelines de datos: comprobar que las features de observación declaradas (`observation.images.image`, `image2`, `empty_camera_0`, `observation.state`) se mapean correctamente desde el dataset lerobot/libero durante el entrenamiento.
- Referencia para ajuste fino sobre LIBERO: partir de este checkpoint o del original para experimentar con hiperparámetros, sabiendo que 20 pasos no bastan y que habrá que reentrenar desde `lerobot/smolvla_base`.
- Docencia y divulgación: ilustrar qué es un modelo VLA, qué forma tienen sus entradas y salidas y cómo se estructura una model card de LeRobot en un taller o curso.
- Prueba de cuantificación y despliegue en hardware modesto: con 450 millones de parámetros, el modelo permite experimentar con carga en fp32 (aproximadamente 1,8 GB de pesos) o bf16 (aproximadamente 0,9 GB) en GPUs de gama media para medir latencia del bucle de control.
- No se recomienda su uso en demostraciones públicas de manipulación ni en entornos reales con objetos frágiles: la política no ha convergido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del checkpoint no incluye tasas de éxito en LIBERO ni en ninguna otra suite, coherencia con los 20 pasos de entrenamiento declarados. El artículo arXiv:2506.01844 reporta evaluaciones del modelo SmolVLA original, pero esas cifras no son atribuibles a este fine-tune concreto ni se han verificado en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,8 GB en fp32 y 0,9 GB en bf16 solo para pesos; hay que sumar activaciones de los tres codificadores visuales, por lo que un presupuesto de 4-6 GB es realista.
- GPU recomendadas: cualquier GPU consumer con 8 GB o más (RTX 3060, RTX 4060, RTX 4070, RTX 4090) es suficiente; A100/H100 solo tienen sentido para entrenamiento por lotes o barridos de hiperparámetros.
- Cabe en GPU consumer: sí, con holgura, dado el tamaño de 450 millones de parámetros. La inferencia en CPU es técnicamente posible pero probablemente incompatible con los 10 FPS del dataset de entrenamiento.
- Opciones de despliegue: `lerobot-rollout` con `--strategy.type=base` y configuración de robot `panda`; scripts de LeRobot para entrenamiento y evaluación. No aplican vLLM, TGI, llama.cpp ni Ollama, al no tratarse de un modelo de lenguaje.
- Latencia y throughput: no disponibles de forma oficial. Como referencia, el dataset se grabó a 10 FPS, lo que implica un objetivo de 100 ms por paso de control; no hay mediciones publicadas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entradas | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 2DC/SmolVLA_test | 450.046.176 | 3 cámaras + estado (8,); sin contexto textual variable | No disponible (20 pasos de entrenamiento) | Apache 2.0 | HuggingFace, 0 descargas |
| lerobot/smolvla_base | 450 M (misma arquitectura, dato no confirmado en la información disponible) | Mismas features de observación | No disponible en la información proporcionada | Apache 2.0 | HuggingFace (modelo base oficial de LeRobot) |
| Otras políticas de LeRobot (ACT, Diffusion Policy, pi0) | No disponible | No disponible | No disponible | No disponible | Disponibles en el ecosistema LeRobot, pero sin datos verificados en esta búsqueda |

La comparación relevante es con el modelo base: este checkpoint comparte arquitectura, tamaño y licencia, y solo difiere en el ajuste sobre lerobot/libero con 20 pasos. Cualquier comparación cuantitativa con alternativas exige consultar el artículo de SmolVLA y los repositorios de LeRobot, fuera del alcance de la información disponible.

## Limitaciones y advertencias

- Entrenamiento insuficiente: 20 pasos con batch 32 (640 muestras vistas) no permiten convergencia; la política no debe evaluarse como representativa de SmolVLA.
- Repositorio de prueba: cero descargas y cero "likes" en el momento de la consulta; no hay validación externa ni demos publicadas.
- Alcance limitado a un robot y dos cámaras: la configuración asume robot `panda`, dos cámaras de 256x256 y una tercera de 480x640; cualquier cambio de montaje, resolución o calibración invalida la política.
- Especificidad de tarea: el dataset cubre 41 instrucciones concretas de manipulación doméstica; el modelo no generaliza a instrucciones fuera de esa distribución.
- Dependencia de instrucciones en inglés: las etiquetas de tarea del dataset están en inglés y no se declara soporte multilingüe.
- Sin datos de sesgo, robustez ni seguridad: no se documentan evaluaciones de fallo, colisiones o manipulación de objetos peligrosos. En un robot real, requiere parada de emergencia y supervisión humana.
- Riesgo de sobreajuste y de comportamiento errático: con tan pocos pasos, la salida es esencialmente la del modelo base con una perturbación mínima; no se puede descartar comportamiento degenerado.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución, pero la licencia del dataset lerobot/libero y de los pesos base debe verificarse por separado antes de redistribuir derivados.
- Advertencia de producción: no usar este checkpoint en producción, en demostraciones públicas ni en robots que compartan espacio con personas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/2DC/SmolVLA_test
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Artículo SmolVLA (arXiv): https://arxiv.org/pdf/2506.01844v1
- Entrada arXiv: https://huggingface.co/papers/2506.01844
- Blog de Hugging Face sobre SmolVLA: https://huggingface.co/blog/smolvla
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Configuración de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Dataset lerobot/libero: https://huggingface.co/datasets/lerobot/libero
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=lerobot/libero
- Página divulgativa del proyecto: https://smolvla.net/index_en
