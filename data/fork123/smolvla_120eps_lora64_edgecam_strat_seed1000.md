# Fork123/smolvla_120eps_lora64_edgecam_strat_seed1000

## Resumen

`Fork123/smolvla_120eps_lora64_edgecam_strat_seed1000` es un ajuste fino de la política robótica SmolVLA, un modelo visión-lenguaje-acción (VLA) compacto desarrollado en el ecosistema de HuggingFace y entrenado con la librería LeRobot. El modelo parte del checkpoint base `lerobot/smolvla_base` y se ha especializado, mediante LoRA (el nombre indica rango 64, `lora64`), en una única tarea de manipulación: pulsar un botón ("Press the red glow button"). Está pensado para ejecutarse sobre un brazo robótico de tipo `so_follower` (familia SO-100/SO-101), con tres cámaras de entrada y un vector de estado de 6 dimensiones.

El problema que resuelve es de aprendizaje por imitación: convertir observaciones visuales y propioceptivas en comandos de acción de 6 grados de libertad para completar una tarea concreta. Se entrenó con un dataset propio de 120 episodios y 27.628 fotogramas a 30 FPS, durante 20.000 pasos con optimizador AdamW y semilla fija (1000), lo que lo hace reproducible pero también muy específico.

Su relevancia es limitada y experimental: se publica como artefacto de investigación con 0 descargas y 0 "likes", sin resultados de evaluación en la model card. La model card describe SmolVLA como un VLA compacto capaz de desplegarse en hardware de consumo, pero no especifica el número de parámetros del modelo base ni sus detalles internos completos, que hay que consultar en el paper citado (arXiv:2506.01844).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en SmolVLA; transformer multimodal con cabeza/experto de accion (detalle interno no disponible en la model card) |
| Parametros totales | no disponible |
| Longitud de contexto | no aplica en el sentido de contexto de texto; entrada multimodal: 1 vector de estado `(6,)` + 3 imagenes `(3, 256, 256)` |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin variantes GGUF/AWQ/GPTQ publicadas) |
| Idiomas soportados | no disponible (modelo orientado a control robotico; no es un modelo conversacional) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |

Datos adicionales de entrada/salida:

| Feature | Tipo | Forma |
|---|---|---|
| `observation.state` | STATE | `(6,)` |
| `observation.images.camera1` | VISUAL | `(3, 256, 256)` |
| `observation.images.camera2` | VISUAL | `(3, 256, 256)` |
| `observation.images.camera3` | VISUAL | `(3, 256, 256)` |
| `action` | ACTION | `(6,)` |

Tipo de robot declarado: `so_follower`. La model card menciona las camaras como `wrist`, `front` y `top`, mientras que las features de entrada se nombran `camera1`, `camera2` y `camera3`.

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de SmolVLA, un modelo visión-lenguaje-acción que combina un codificador visual, un modelo de lenguaje preentrenado y un módulo de generación de acciones. La model card lo describe como "compacto y eficiente" y apto para hardware de consumo, pero no detalla la composición interna, el número de capas ni el mecanismo concreto de decodificación de acciones. Esta ficha se ajusta mediante LoRA (indicado en el nombre del repositorio, `lora64`), lo que sugiere que solo se entrenó un subconjunto de parámetros de bajo rango sobre el checkpoint base `lerobot/smolvla_base`.

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset `Fork123/Test4-ArgressivePress_RepoOptimize_EdgeCamNoMid-120eps-10pos`: 120 episodios, 27.628 fotogramas a 30 FPS y una única instrucción de tarea ("Press the red glow button"). La configuración reportada es de 20.000 pasos, batch de 64, optimizador AdamW, learning rate 1e-4 y semilla 1000. No se documenta uso de RLHF, DPO ni ninguna fase de refinamiento posterior; es aprendizaje por imitación supervisado puro sobre demostraciones.

No se especifica en la información disponible ninguna innovación técnica adicional propia de este ajuste (más allá del uso de LoRA y de la configuración `strat`/`edgecam` que sugiere el nombre, presumiblemente relacionada con la estrategia de entrenamiento y un montaje de cámara en el borde).

## Capacidades

- Generación de acciones de control de 6 grados de libertad a partir de observaciones visuales y de estado propioceptivo.
- Percepción visual multimodal: procesa tres flujos de imagen simultáneos a 256x256 píxeles.
- Ejecución de una tarea de manipulación concreta: pulsar un botón ("Press the red glow button").
- Control condicionado por instrucción de tarea (texto), dentro del paradigma VLA (la instrucción se pasa en tiempo de ejecución con `--task`).
- Integración nativa con el ecosistema LeRobot: entrenamiento, rollout y evaluación mediante comandos `lerobot-*`.
- Reproducibilidad por semilla fija (seed 1000).
- No soporta tool calling ni function calling en el sentido de agentes de software: su salida es un vector de acción físico, no texto.
- No dispone de modo "thinking", ni capacidades de audio, ni razonamiento multi-paso explícito documentado.
- Capacidades multilingües: no aplica / no disponible.

## Casos de uso

- Automatización de una célula de pulsado en línea de montaje: el modelo ejecuta de forma autónoma la acción de pulsar un botón con luz roja, recibiendo imagen de tres cámaras y devolviendo comandos de 6 ejes para el brazo `so_follower`.
- Banco de pruebas de políticas VLA: sirve como caso reproducible (semilla fija, 20.000 pasos, hiperparámetros documentados) para comparar variantes de entrenamiento o de configuración de cámaras en un laboratorio de robótica.
- Punto de partida para nuevo ajuste fino: al derivar de `lerobot/smolvla_base` y estar entrenado con LoRA, puede reutilizarse como inicialización para datasets de tareas relacionadas con menos datos.
- Validación de pipelines de despliegue LeRobot: permite probar el flujo completo `lerobot-rollout` con un robot real, cámaras OpenCV y una política alojada en el Hub.
- Estudio de configuraciones de sensores: comparar el efecto de un montaje "edgecam" frente a otras disposiciones de cámara sobre la tasa de éxito en una tarea de manipulación.
- Docencia y formación en aprendizaje por imitación: ejemplo mínimo y de una sola tarea para explicar el ciclo completo de recogida de datos, entrenamiento y despliegue en robótica.
- Prototipado en hardware de consumo: al proceder de un VLA compacto, permite experimentar con despliegue en estaciones de trabajo con GPU de gama media, siempre que se valide el rendimiento real (no documentado).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet", por lo que no hay tasa de éxito, número de ensayos ni comparaciones cuantitativas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. La model card no publica cifras y el repositorio ocupa 0,0 GB, dato que no permite estimar el tamaño real de los pesos.
- GPU recomendadas: no disponible. El entrenamiento se realizó con `--policy.device=cuda`, pero no se especifica el modelo de GPU empleado.
- Cabe en GPU de consumo: la model card del SmolVLA base afirma que el modelo es "compacto y eficiente" y "puede desplegarse en hardware de consumo", aunque no se confirma para este ajuste concreto ni se indica qué GPU.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución y `lerobot-train` para entrenamiento, ver comandos en la model card). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de generación de texto.
- Requisitos de robot: brazo `so_follower` con puerto serie propio, más cámaras OpenCV configuradas a 640x480 y 30 FPS (la política espera entradas de 256x256 tras el preprocesado).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo de entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Fork123/smolvla_120eps_lora64_edgecam_strat_seed1000` | no disponible | Estado `(6,)` + 3 imagenes 256x256 | Pulsar un boton (tarea unica) | apache-2.0 | HuggingFace, 0 descargas, 0 likes |
| `lerobot/smolvla_base` (modelo base) | no disponible | Multimodal VLA | Politica VLA general (preentrenada) | no disponible en la informacion proporcionada | HuggingFace (referenciado como base) |
| Otros VLA del mismo rango (OpenVLA, pi0, etc.) | no disponible | no disponible | Manipulacion robotica | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones detalladas de alternativas en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Modelo de tarea única: solo se ha entrenado para "Press the red glow button"; no generaliza a otras tareas ni a otras instrucciones.
- Dataset muy reducido (120 episodios, 27.628 fotogramas, una sola tarea), con alto riesgo de sobreajuste al entorno, iluminación y posiciones concretas de la recogida de datos.
- Sin evaluación publicada: no hay tasa de éxito medida, por lo que se desconoce su fiabilidad real en producción.
- Dependencia estricta del montaje de hardware: requiere un robot `so_follower` y tres cámaras colocadas como en el dataset (`wrist`, `front`, `top` / `camera1-3`). Cambios en la posición de las cámaras, el robot o la iluminación pueden degradar el comportamiento.
- El nombre del repositorio sugiere un ajuste LoRA: si los pesos publicados no incluyen la fusión con el modelo base, será necesario cargar el adaptador sobre `lerobot/smolvla_base` según lo que espere LeRobot.
- Puede existir ambigüedad entre los nombres de cámara de la model card (`wrist`, `front`, `top`) y las claves de entrada reales (`camera1`, `camera2`, `camera3`); las claves deben coincidir en el comando de rollout.
- Riesgo de alucinación: no aplica en el sentido de texto, pero sí existe riesgo de acciones erráticas o inseguras si el estado observado queda fuera de la distribución de entrenamiento.
- Sesgos conocidos: no documentados en la información disponible.
- Licencia apache-2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Estado del repositorio: 0 descargas y 0 "likes" en el momento de la consulta, sin validación por parte de la comunidad; debe tratarse como artefacto experimental.
- Seguridad física: cualquier despliegue sobre hardware real debe hacerse con límites de par, paradas de emergencia y supervisión humana, dado que no hay datos de robustez.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Fork123/smolvla_120eps_lora64_edgecam_strat_seed1000
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/Fork123/Test4-ArgressivePress_RepoOptimize_EdgeCamNoMid-120eps-10pos
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Fork123/Test4-ArgressivePress_RepoOptimize_EdgeCamNoMid-120eps-10pos
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion completa de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Recogida de datos y entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Imagen de arquitectura de SmolVLA: https://cdn-uploads.huggingface.co/production/uploads/640e21ef3c82bd463ee5a76d/aooU0a3DMtYmy_1IWMaIM.png
