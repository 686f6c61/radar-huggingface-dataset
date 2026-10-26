# CarolinePascal/grabette-pick-and-place-texture-act-25

## Resumen

`CarolinePascal/grabette-pick-and-place-texture-act-25` es una política robótica de imitación basada en ACT (Action Chunking with Transformers), publicada en Hugging Face por CarolinePascal y entrenada con LeRobot. Resuelve una tarea concreta de manipulación: recoger un cubo rojo y depositarlo en una caja verde con un robot de tipo `grabette`. No es un modelo de lenguaje: su entrada es una imagen RGB y un estado de dos dimensiones, y su salida es un vector de acción de 11 dimensiones.

El modelo tiene 51.592.843 parámetros y se distribuye en formato `safetensors`. La política fue entrenada con 60 episodios y 22.771 fotogramas a 50 FPS, grabados con una única cámara (`right_cam0`) a resolución 360x480. Es relevante como ejemplo reproducible y de bajo coste de una política ACT dentro del ecosistema LeRobot, no por su adopción pública: en el momento de la ficha registra 0 descargas y 0 likes.

No dispone de ventana de contexto lingüística ni de capacidades de generación de texto. Su “contexto” es la observación visual y el estado del robot en cada paso de control. La model card no incluye resultados de evaluación en robot real, licencia definida ni benchmarks estándar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política de imitación para robótica |
| Parámetros totales | 51.592.843 (51,6 M) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; no aplica (política robótica, no modelo de lenguaje) |
| Tipos de cuantización | no disponible; pesos `safetensors` sin variantes cuantizadas documentadas |
| Idiomas soportados | no aplica; no disponible |
| Licencia | no disponible |
| Formato de pesos | `safetensors` |

| Entrada/salida | Tipo | Forma |
|---|---|---|
| `observation.images.right_cam0` | VISUAL | `(3, 360, 480)` |
| `observation.state` | STATE | `(2,)` |
| `action` | ACTION | `(11,)` |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice fragmentos de acciones (*action chunks*) en lugar de un único paso de control. La política aprende de datos de teleoperación y está implementada dentro de LeRobot. La model card no detalla variantes internas como CVAE, atención lineal o decodificación especulativa; esos datos figuran como no disponibles.

El entrenamiento usó el dataset `CarolinePascal/grabette-pick-and-place-texture-25`: 60 episodios, 22.771 fotogramas, 50 FPS y una única tarea, “pick up the red cube and put it in the green box”. La configuración declarada es de 100.000 pasos, batch de 64, optimizador AdamW, learning rate `1e-05`, semilla 1000 y LeRobot 0.6.2. No se documenta RLHF, DPO ni ningún otro ajuste por preferencias; se trata de imitación supervisada sobre teleoperación.

## Capacidades

- Control robótico de manipulación: consume una imagen RGB de 360x480 y un estado de 2 dimensiones, y produce acciones de 11 dimensiones.
- Ejecución de la tarea concreta de recoger un cubo rojo y colocarlo en una caja verde.
- Predicción por fragmentos de acciones (*action chunking*), orientada a secuencias de control más estables que la predicción paso a paso.
- Aprendizaje por imitación a partir de demostraciones teleoperadas.
- Integración con el flujo de LeRobot mediante `lerobot-rollout` y `lerobot-train`.
- Visión como entrada: sí, una única cámara `right_cam0`.
- Tool calling o function calling: no.
- Agentes multi-step en sentido LLM: no; es una política reactiva de control.
- Capacidades multilingües: no aplica.
- Modo *thinking*, audio o generación de texto: no.

## Casos de uso

- Automatización de pick-and-place en una celda con robot `grabette`: la política está entrenada específicamente para recoger un cubo rojo y depositarlo en una caja verde, por lo que puede emplearse en una demostración controlada de esa tarea.
- Baseline reproducible para comparar políticas ACT: al estar publicada con configuración de entrenamiento y dataset asociados, sirve como referencia para evaluar nuevas políticas sobre el mismo conjunto de datos y robot.
- Validación de un pipeline LeRobot completo: permite comprobar calibración de cámara, puerto del robot, nombres de observaciones y ejecución de `lerobot-rollout` antes de entrenar políticas propias.
- Docencia y laboratorio de aprendizaje por imitación: su tamaño de 51,6 M de parámetros y su naturaleza de política visual permiten explicar ACT y ejecutar demos en hardware de gama media.
- Pruebas de robustez visual en condiciones controladas: puede utilizarse para analizar sensibilidad a cambios de iluminación, textura o posición, aunque no hay evaluación publicada que cuantifique esa robustez.
- Medición de latencia y throughput en hardware consumer: sirve para caracterizar el coste de inferencia de una política ACT pequeña en GPU de gama baja o media.
- Prototipos de clasificación simple de objetos en una línea de montaje: adecuado solo si el espacio de estados, la cámara y la acción de 11 dimensiones coinciden con la configuración entrenada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

| Evaluación | Resultado |
|---|---|
| Tasa de éxito en robot real | no disponible; la model card indica que no se han proporcionado resultados de evaluación |
| Benchmarks estándar de lenguaje (MMLU, HumanEval, GSM8K) | no aplica: no es un modelo de lenguaje |
| Métricas de manipulación comparables | no disponibles |

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan aproximadamente 0,21 GB en FP32 y 0,10 GB en FP16; con activaciones, preprocesado de imagen y margen de ejecución, se recomienda al menos 2-4 GB de VRAM. Es una estimación teórica, no una medición publicada.
- GPU recomendadas: cualquier GPU CUDA con 4 GB o más para inferencia; RTX 3050, RTX 3060, RTX 4060, RTX 4090 o superiores. A100/H100 no son necesarias para este tamaño de política.
- GPU consumer: sí cabe en GPUs consumer modernas; también puede ejecutarse en CPU, aunque la latencia dependerá del hardware y no hay datos publicados.
- Opciones de despliegue: LeRobot con PyTorch mediante `lerobot-rollout`; el entrenamiento se realiza con `lerobot-train`. vLLM, llama.cpp, Ollama y TGI no aplican a esta política robótica.
- Latencia y throughput: no disponibles. Los datos se grabaron a 50 FPS, pero eso no implica que la política se ejecute a 50 FPS en inferencia.
- El repositorio ocupa 12,4 GB, probablemente por checkpoints y artefactos de entrenamiento; el peso de inferencia es mucho menor que el tamaño total del repositorio.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables concretos en la documentación proporcionada. No se identifican alternativas con parámetros, contexto, rendimiento y licencia equiparables para esta tarea específica.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| `grabette-pick-and-place-texture-act-25` | 51,6 M | no aplica | sin evaluación publicada | no disponible | Hugging Face |
| Alternativa ACT comparable 1 | no disponible | no aplica | no disponible | no disponible | no identificada |
| Alternativa ACT comparable 2 | no disponible | no aplica | no disponible | no disponible | no identificada |

## Limitaciones y advertencias

- La licencia no está definida; no puede asumirse uso comercial sin consultar al autor.
- No hay resultados de evaluación en robot real ni tasa de éxito publicada.
- Está entrenada para una única tarea, un único tipo de robot y una única cámara (`right_cam0`); no es una política generalista de manipulación.
- La entrada visual tiene resolución fija de 360x480 y el estado es de 2 dimensiones; cambios en la cámara, calibración o espacio de estados pueden invalidar la política.
- El dataset es pequeño: 60 episodios y 22.771 fotogramas. Puede estar sesgada hacia posiciones, iluminación, texturas y condiciones presentes en la grabación; no hay evaluación que cuantifique esa sensibilidad.
- No es un modelo de lenguaje: no hay riesgo de alucinación textual, pero sí riesgo de acciones incorrectas, bloqueos o fallos de agarre.
- No soporta tool calling, agentes conversacionales ni instrucciones en lenguaje natural más allá de la tarea fijada durante el entrenamiento.
- El comando de ejemplo de la model card incluye dos cámaras, pero la política fue entrenada con una sola; deben ajustarse los nombres y el número de cámaras a `observation.images.right_cam0`.
- Para producción se requiere calibración, límites de seguridad, parada de emergencia y validación específica del entorno; la model card no documenta protocolos de seguridad.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/CarolinePascal/grabette-pick-and-place-texture-act-25)
- [Dataset de entrenamiento](https://huggingface.co/datasets/CarolinePascal/grabette-pick-and-place-texture-25)
- [Paper de ACT](https://huggingface.co/papers/2304.13705)
- [Repositorio LeRobot](https://github.com/huggingface/lerobot)
- [Guía de ACT en LeRobot](https://huggingface.co/docs/lerobot/main/en/act)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Instalación de LeRobot](https://huggingface.co/docs/lerobot/main/en/installation)
- [Guía de hardware](https://huggingface.co/docs/lerobot/main/en/hardware_guide)
- [Grabación de datos y entrenamiento de políticas](https://huggingface.co/docs/lerobot/en/il_robots)
- [Referencia rápida de comandos](https://huggingface.co/docs/lerobot/main/en/cheat-sheet)
- [Documentación de inferencia y rollout](https://huggingface.co/docs/lerobot/main/en/inference)
- [Visualizar el dataset](https://huggingface.co/spaces/lerobot/visualize_dataset?path=CarolinePascal/grabette-pick-and-place-texture-25)
