# Fork123/ce1_smolvla_100eps_default_seed1000

## Resumen

`Fork123/ce1_smolvla_100eps_default_seed1000` es una política vision-language-action (VLA) obtenida por fine-tuning de `lerobot/smolvla_base`, el modelo compacto SmolVLA presentado en el paper arXiv:2506.01844. El autor la ha entrenado con LeRobot 0.6.2 sobre un dataset propio de 100 episodios (22.940 fotogramas a 30 FPS) para una única tarea de manipulación: pulsar un botón rojo luminoso ("Press the red glow button"). El resultado es un checkpoint de 450.046.176 parámetros (0,9 GB en el repositorio) que consume estado propioceptivo de 6 dimensiones y tres cámaras RGB de 256×256, y emite vectores de acción de 6 dimensiones.

El interés de esta ficha no está en el modelo base —ya documentado— sino en el artefacto concreto: un ejemplo reproducible de fine-tuning de un VLA pequeño sobre un robot `so_follower` (familia SO-100/SO-101 de bajo coste), con semilla fija (1000), 20.000 pasos de entrenamiento y licencia Apache 2.0. Sirve como referencia para quien quiera replicar el pipeline completo de imitación (grabación de datos, entrenamiento, rollout) sin infraestructura de gran escala.

Conviene subrayar que el autor no ha publicado ninguna evaluación en robot real: la sección de evaluación de la model card está vacía. Cualquier uso en producción debe acompañarse de una validación propia. Además, la búsqueda web realizada no ha devuelto ningún resultado relevante sobre este modelo (solo dominios de contenido para adultos sin relación), por lo que todos los datos proceden de la información de HuggingFace y de la model card.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) derivada de SmolVLA; combinación de backbone vision-language y cabeza de acciones (detalle exacto no disponible en la información proporcionada) |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (no es un modelo de contexto textual; la condición de tarea es una cadena corta) |
| Tipos de cuantizacion | No disponible en la información proporcionada; el repositorio se distribuye en safetensors (0,9 GB, coherente con pesos en bf16/fp16) |
| Idiomas soportados | No disponibles; la política acepta una instrucción de tarea en lenguaje natural (en el ejemplo, inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

Especificaciones de entrada y salida declaradas por el autor:

| Feature | Tipo | Forma |
|---|---|---|
| `observation.state` | STATE | (6,) |
| `observation.images.camera1` | VISUAL | (3, 256, 256) |
| `observation.images.camera2` | VISUAL | (3, 256, 256) |
| `observation.images.camera3` | VISUAL | (3, 256, 256) |
| `action` | ACTION | (6,) |

## Arquitectura y entrenamiento

El modelo base SmolVLA se describe en la model card como un VLA compacto y eficiente, con rendimiento competitivo a coste computacional reducido y desplegable en hardware de consumo. La arquitectura concreta (tipo de backbone, mecanismo de generación de acciones, uso de flow matching o decodificación asíncrona) no se detalla en la información proporcionada: para eso hay que remitirse al paper arXiv:2506.01844, citado en los tags y en la descripción. Lo que sí está documentado es la interfaz: tres cámaras RGB a 256×256 más un vector de estado de 6 dimensiones como entradas, y un vector de acción de 6 dimensiones como salida, con condicionamiento por instrucción de tarea.

El fine-tuning se realizó con LeRobot 0.6.2 sobre el dataset `Fork123/Test3-AgressivePress-RepoOptimize-100eps-10pos_20260919_114953`: 100 episodios, 22.940 fotogramas, 30 FPS, una sola tarea ("Press the red glow button"), robot `so_follower` y cámaras `wrist`, `front` y `top`. La configuración reportada es de 20.000 pasos, batch de 64, optimizador AdamW, learning rate 1e-4 y semilla 1000. No se especifica el número de tokens de entrenamiento, la composición completa del dataset ni si hubo etapas de RLHF/DPO; al tratarse de imitación supervisada sobre demostraciones, lo habitual es que no las haya, pero no está confirmado en la información disponible. Tampoco se documenta ninguna innovación técnica adicional introducida por el autor más allá del propio fine-tuning.

## Capacidades

- Control robótico end-to-end por imitación: mapea observaciones (estado + 3 imágenes) a acciones de 6 dimensiones en un único paso de política.
- Condicionamiento por lenguaje natural mediante el campo `task` (en el ejemplo, "Press the red glow button").
- Fusión de tres vistas simultáneas (muñeca, frontal y superior) a 256×256, lo que aporta robustez frente a oclusiones parciales.
- Uso de propiocepción de 6 dimensiones (`observation.state`), integrada junto con la información visual.
- Especialización en una tarea concreta de pulsación de botón sobre robot `so_follower`.
- Compatibilidad nativa con el ecosistema LeRobot: `lerobot-rollout` para inferencia y `lerobot-train` para reentrenamiento.
- Punto de partida para nuevo fine-tuning: puede recargarse desde `lerobot/smolvla_base` o desde este checkpoint con otro dataset.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente en el sentido de LLM; es una política reactiva.
- No se documentan capacidades multilingües, de visión general, audio ni modo "thinking".

## Casos de uso

- Automatización de una pulsación de botón en banco de pruebas: la política ejecuta la tarea "Press the red glow button" sobre un `so_follower`; es directamente utilizable en una estación de validación repetitiva donde el botón esté en posición fija y con iluminación controlada.
- Base para fine-tuning en tareas de pick-and-place: al estar entrenada sobre un robot SO follower con tres cámaras, sirve como inicialización para nuevos datasets de manipulación de la misma familia de hardware, reduciendo pasos de entrenamiento frente a partir de cero.
- Prototipado rápido en laboratorio de robótica: con 100 episodios y 22.940 fotogramas se demuestra un ciclo completo de recogida de datos, entrenamiento (20.000 pasos) y despliegue, replicable en pocas horas con una GPU de consumo.
- Reproducibilidad de experimentos de imitación: la semilla fija (1000) y la configuración documentada permiten repetir el entrenamiento y comparar variaciones de dataset o hiperparámetros con una línea base estable.
- Evaluación comparativa de VLA compactos: sirve como referencia de 450 M de parámetros para medir tiempo de inferencia, VRAM y tasa de éxito frente a ACT, Diffusion Policy u OpenVLA en el mismo banco de pruebas.
- Docencia y formación en robotica de imitación: el par dataset + checkpoint + comandos CLI de LeRobot permite montar un ejercicio práctico completo de aprendizaje por demostración sin infraestructura cara.
- Despliegue en robot de bajo coste: su tamaño (0,9 GB de pesos) permite ejecutar la política en un PC con GPU modesta conectado al brazo, sin servidores de inferencia dedicados.
- Validación de pipelines de control a 30 FPS: el dataset está grabado a 30 FPS, por lo que es un caso útil para medir si la latencia de la política cumple el bucle de control previsto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card incluye una sección de evaluación con la nota explícita "_No evaluation results have been provided for this policy yet_", sin tabla de ensayos, éxitos ni tasas de acierto. No hay datos de MMLU, HumanEval, GSM8K ni de tasa de éxito en robot real para este checkpoint.

## Requisitos de hardware

- Pesos: 450 M de parámetros. En fp32 ocuparían aproximadamente 1,8 GB; en bf16/fp16, unos 0,9 GB (coincide con el tamaño del repositorio); en int8, en torno a 0,45 GB (conversión no documentada por el autor).
- VRAM estimada para inferencia: no disponible como medición publicada. Como orientación por tamaño, el peso de los parámetros en bf16 es de 0,9 GB y hay que sumar activaciones y los tres tensores de imagen de 3×256×256; un presupuesto de 4-8 GB de VRAM es un punto de partida razonable, pero debe verificarse empíricamente.
- GPU recomendadas: no especificadas por el autor. El modelo base se describe como desplegable en hardware de consumo; para este checkpoint no hay lista de GPU validadas.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con 8 GB o más (RTX 3060, RTX 4060, RTX 4070, RTX 4090). No confirmado por el autor para este checkpoint concreto.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path=Fork123/ce1_smolvla_100eps_default_seed1000`), sobre PyTorch. vLLM, llama.cpp, Ollama y TGI no aplican: no es un modelo de generación de texto.
- Latencia y throughput: no disponibles. El dataset de entrenamiento está a 30 FPS, lo que marca el orden de magnitud del bucle de control objetivo, pero no se reporta latencia de inferencia medida.
- Reentrenamiento: `lerobot-train` con `--policy.path=lerobot/smolvla_base`, `--policy.device=cuda`, batch 64 y 20.000 pasos; requiere más VRAM que la inferencia (no cuantificada en la información disponible).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entradas | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Fork123/ce1_smolvla_100eps_default_seed1000` | 450.046.176 | 3 imagenes 256x256 + estado (6,) | Pulsar boton rojo (una tarea) | Apache 2.0 | HuggingFace, via LeRobot |
| `lerobot/smolvla_base` | no disponible en la informacion (misma familia SmolVLA) | mismas claves de observacion, proposito general | VLA base para fine-tuning | Apache 2.0 (segun repo base) | HuggingFace, via LeRobot |
| ACT / Diffusion Policy (implementaciones LeRobot) | no disponible en la informacion | estado + camaras, sin condicionamiento de lenguaje en su formulacion clasica | Imitacion sobre robot | no disponible en la informacion | LeRobot |
| OpenVLA (referencia externa) | aproximadamente 7 000 M (dato publico no verificado en esta busqueda) | imagenes + instruccion | VLA generalista | no disponible en la informacion | HuggingFace |

La comparación cuantitativa de rendimiento no es posible: este checkpoint no publica métricas y los alternativos no se han evaluado aquí bajo el mismo protocolo. La diferencia práctica frente a `smolvla_base` es la especialización en una única tarea y embodiment, no una mejora de capacidad general.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay tasa de éxito, número de ensayos ni condiciones de prueba. No hay evidencia publicada de que la política funcione fuera del dataset de entrenamiento.
- Especialización extrema: una sola tarea ("Press the red glow button"), un solo tipo de robot (`so_follower`) y una sola configuración de cámaras (`wrist`, `front`, `top`). Cambiar la disposición de las cámaras o el robot invalida previsiblemente la política.
- Dataset pequeño: 100 episodios y 22.940 fotogramas implican riesgo alto de sobreajuste a posiciones, iluminación y fondo concretos; la generalización a objetos o botones distintos no está demostrada.
- Dependencia de la instrucción de tarea: el texto debe coincidir con el usado en entrenamiento; no se documenta robustez a paráfrasis ni a otros idiomas.
- Idiomas no documentados: no hay lista de lenguas soportadas; el condicionamiento textual se ha entrenado con una única frase en inglés.
- Sin datos de sesgos: no se ha publicado ningún análisis de sesgo (visual, de iluminación o de sesgo de dataset) para este checkpoint.
- Riesgo de alucinación en el sentido de acciones plausibles pero incorrectas: al ser una política de imitación, puede ejecutar trayectorias verosímiles que no culminen la tarea, sin señal de confianza asociada.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías; conviene conservar la atribución y revisar la licencia del modelo base y del paper asociado.
- Seguridad física: es una política de control de robot; no incorpora parada de emergencia, límites de par ni comprobaciones de seguridad. Cualquier despliegue real necesita capas de seguridad externas.
- Fecha del modelo: creado el 2026-10-21, sin descargas ni "likes" en el momento de la consulta; no hay señales de uso comunitario que permitan inferir calidad.
- La búsqueda web realizada no devolvió ninguna fuente independiente sobre este modelo; no hay validación externa disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Fork123/ce1_smolvla_100eps_default_seed1000
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/Fork123/Test3-AgressivePress-RepoOptimize-100eps-10pos_20260919_114953
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Fork123/Test3-AgressivePress-RepoOptimize-100eps-10pos_20260919_114953
- Paper de SmolVLA (arXiv:2506.01844): https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Nota sobre la busqueda web: no se han encontrado enlaces relevantes sobre este modelo; los resultados devueltos por el buscador correspondian a dominios sin relacion con el contenido.
