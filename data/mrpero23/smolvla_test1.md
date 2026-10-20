# mrpero23/smolvla_test1

## Resumen

`mrpero23/smolvla_test1` es un modelo de visión-lenguaje-acción (VLA) compacto, un *fine-tune* del modelo base `lerobot/smolvla_base` publicado por el usuario mrpero23. No es un modelo de lenguaje generalista: es una política de control robótico entrenada por imitación que, a partir de tres cámaras RGB y del estado de las articulaciones, predice acciones de 6 dimensiones para un robot tipo `so_follower` (SO-100/SO-101 de LeRobot). El modelo resuelve una única tarea concreta: "place the yellow cube in the bowl".

La relevancia de este checkpoint es doble. Por un lado, ilustra el flujo completo de LeRobot: un desarrollador puede grabar 55 episodios con su robot de bajo coste, lanzar `lerobot-train` y obtener una política desplegable en hardware de consumo. Por otro, se apoya en SmolVLA (arXiv:2506.01844), una arquitectura VLA de ~450 millones de parámetros diseñada explícitamente para reducir el coste computacional frente a alternativas de miles de millones de parámetros.

Conviene subrayar que se trata de un artefacto de prueba (`test1`), sin resultados de evaluación publicados, sin métricas de éxito y con cero descargas. Es un ejemplo reproducible de *fine-tuning*, no un modelo listo para producción ni un *benchmark* de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) compacta, tipo SmolVLA; pesos en safetensors |
| Parametros totales | 450.046.176 (dato real del repositorio) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (la ficha no declara idiomas; el modelo recibe instrucciones de tarea en texto, pero no se especifica cobertura linguistica) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria `lerobot`; repositorio de 5,3 GB) |

Especificaciones adicionales de entrada y salida:

| Aspecto | Valor |
|---|---|
| Tipo de robot | `so_follower` |
| Cámaras | `fix`, `grip`, `fix1` (3 x 480x640, 3 canales) |
| Entrada de estado | `observation.state`, tensor de forma `(6,)` |
| Salida de acción | `action`, tensor de forma `(6,)` |
| Dataset de entrenamiento | `mrpero23/test1_20261017_133008` (55 episodios, 41.738 frames, 30 FPS) |
| Tarea entrenada | "place the yellow cube in the bowl" |
| Pasos de entrenamiento | 20.000 |
| Batch size / optimizador / LR | 64 / AdamW / 1e-4 |
| Semilla | 1000 |
| Version de LeRobot | 0.6.1 |

## Arquitectura y entrenamiento

El modelo sigue la familia SmolVLA: una VLA compacta que combina un codificador visual-lenguaje con un cabezal generador de acciones, pensada para ejecutarse en hardware de consumo. El repositorio no documenta el desglose interno de capas ni la variante exacta del *backbone*, por lo que ese detalle debe consultarse en el paper (arXiv:2506.01844) y en la ficha de `lerobot/smolvla_base`, no en esta model card. El total de 450 millones de parámetros es coherente con el tamaño de la familia SmolVLA.

El entrenamiento es un *fine-tuning* supervisado por imitación sobre el modelo base preentrenado, no un entrenamiento desde cero. Los datos proceden de teleoperación real: 55 episodios, 41.738 frames a 30 FPS, una sola tarea y tres vistas de cámara. La configuración declarada es de 20.000 pasos con batch 64, AdamW y tasa de aprendizaje 1e-4, ejecutada con LeRobot 0.6.1. No se documenta composición del dataset, aumentos de datos, ni fases de RLHF/DPO (no aplicables en este paradigma, donde el objetivo es la pérdida de imitación sobre acciones). Tampoco se indica si se aplicó *action chunking*, decodificación especulativa o alguna innovación de inferencia en este checkpoint concreto.

## Capacidades

- Control robótico visomotor: genera acciones de 6 dimensiones (posición/orientación de efector y pinza) a partir de tres imágenes simultáneas y del estado articular.
- Ejecución de una instrucción de tarea en lenguaje natural: acepta `--task="place the yellow cube in the bowl"` como condicionamiento textual.
- Percepción multi-cámara fusionada: vista fija (`fix`), vista de pinza (`grip`) y una segunda vista fija (`fix1`), cada una a 480x640.
- Política de imitación cerrada (*end-to-end*): no requiere planificación simbólica ni *parsing* de escena; mapea observación a acción directamente.
- Despliegue en bucle de control en tiempo real a 30 FPS mediante `lerobot-rollout`.
- Reentrenamiento sencillo: la misma receta permite adaptar el modelo base a una tarea nueva con `lerobot-train`.
- No soporta *tool calling*, ni razonamiento multi-paso, ni agentes, ni visión general, ni audio, ni modo *thinking*. Es una política motora, no un asistente.

## Casos de uso

- **Automatización de picking y placing en laboratorio o taller**: el modelo recibe las tres cámaras y el estado articular y emite las 6 acciones a 30 FPS, suficiente para recoger un cubo y depositarlo en un cuenco en un banco de pruebas con robot SO-100. Es adecuado porque está entrenado exactamente en esa tarea y ese robot.
- **Base para un *fine-tune* de tarea nueva**: partiendo de `lerobot/smolvla_base` o de este checkpoint, un equipo puede grabar 50-100 episodios de su propia tarea y reentrenar con la configuración documentada (20k pasos, batch 64, LR 1e-4), reduciendo el coste frente a entrenar desde cero.
- **Validación de un pipeline de imitación completo**: sirve como referencia reproducible de extremo a extremo (grabación, entrenamiento, *rollout*) para verificar la instalación de LeRobot, la calibración de cámaras y la latencia del bucle de control antes de invertir en datasets mayores.
- **Docencia e investigación en VLA de bajo coste**: con 450 M de parámetros y licencia Apache-2.0, es viable ejecutarlo y modificarlo en un laboratorio universitario con una sola GPU, algo inviable con VLA de 3-7 B.
- **Pruebas de robustez y *domain shift***: al estar entrenado con 55 episodios y una sola tarea, es un caso práctico para medir cómo degrada la tasa de éxito al cambiar iluminación, posición de objetos o el robot físico.
- **Generación de datos sintéticos de evaluación**: ejecutar la política en simulación o en un gemelo del robot permite comparar distribuciones de acción frente a teleoperación humana.
- **Integración con `lerobot-rollout` en scripts de evaluación automática**: el comando documentado permite lanzar ejecuciones de duración fija (por ejemplo `--duration=60`) y encadenarlas en un *harness* de medida de éxito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica explícitamente: *"No evaluation results have been provided for this policy yet"*, y la tabla de evaluación (tarea, ensayos, éxitos, tasa de éxito) aparece vacía. No existen datos de MMLU, HumanEval, GSM8K —no aplican a una política motora— ni de tasa de éxito en robot real, que sería la métrica relevante aquí.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 450 M de parámetros, los pesos ocupan aproximadamente 0,9 GB en bf16/fp16 y unos 0,45 GB en cuantización de 4 bits; hay que sumar el coste de activaciones y del procesamiento de tres imágenes de 480x640 por paso, no cuantificado en la información disponible.
- **GPU recomendadas**: la model card afirma que SmolVLA puede desplegarse en hardware de consumo. Cualquier GPU consumer con 8 GB o más (RTX 3060/4060 y superiores) debería acomodar el modelo en precisión completa; para entrenamiento conviene 16-24 GB (RTX 4090, A5000) dados el batch 64 y las tres cámaras.
- **Cabe en GPU de consumo**: sí, según la propia documentación de SmolVLA; no se especifica una GPU mínima exacta.
- **Opciones de despliegue**: `lerobot-rollout` (CLI oficial de LeRobot) es la vía documentada. No se mencionan integraciones con vLLM, TGI, llama.cpp u Ollama; estos *runtimes* están orientados a modelos de lenguaje y no cubren el bucle de control robótico.
- **Latencia y throughput**: no disponibles. El requisito implícito es sostener el bucle a 30 FPS (33 ms por paso), ya que el dataset se grabó a esa frecuencia, pero no se aportan mediciones de latencia real.
- **CPU**: técnicamente posible en PyTorch, pero sin datos de latencia; improbable que alcance los 30 FPS con tres flujos de vídeo.

## Comparativa con modelos similares

Los datos de las alternativas provienen de documentación pública y deben tomarse como orientativos; no forman parte de la información proporcionada para este modelo.

| Modelo | Parámetros | Contexto / entradas | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `mrpero23/smolvla_test1` | 450 M | 3 cámaras 480x640 + estado (6,) | Apache-2.0 | HuggingFace, 0 descargas | Fine-tune de una sola tarea, sin evaluación |
| `lerobot/smolvla_base` | ~450 M (misma familia) | Multimodal visión-lenguaje-acción | Apache-2.0 | HuggingFace, mantenido por LeRobot | Modelo base preentrenado; punto de partida recomendado |
| OpenVLA (familia) | ~7 B (aprox.) | Visión + instrucción, una cámara | Licencia condicional según variante | HuggingFace | Mucho mayor coste de inferencia; no cabe en GPU consumer modesta |
| pi0 / openpi | ~3 B (aprox.) | Visión multi-cámara + texto, *flow matching* | Apache-2.0 (openpi) | Repositorio openpi | Más capaz, pero requiere GPU de gama alta para tiempo real |

Frente a todos ellos, la ventaja de este checkpoint es el coste: 450 M de parámetros permiten inferencia y *fine-tuning* en una sola GPU consumer. La desventaja es la especialización extrema y la ausencia total de métricas publicadas.

## Limitaciones y advertencias

- **Sin evaluación**: no hay tasa de éxito, ni número de ensayos, ni condiciones de prueba. No se puede afirmar que la política funcione de forma fiable.
- **Sobreajuste a una tarea y un entorno**: 55 episodios, una única instrucción ("place the yellow cube in the bowl") y una disposición concreta de cámaras. Cambios de iluminación, color del cubo, posición del cuenco o del robot degradarán previsiblemente el rendimiento.
- **Dependencia del hardware exacto**: el modelo asume el robot `so_follower`, tres cámaras con nombres `fix`, `grip`, `fix1` y una forma de estado de 6 dimensiones. Cualquier desviación en la cinemática o en el montaje invalida las acciones predichas.
- **Riesgo de alucinación trasladado al dominio físico**: una política de imitación puede generar acciones plausibles pero incorrectas, con el riesgo añadido de colisiones o daños materiales. Requiere parada de emergencia y límites de par/velocidad en el controlador.
- **Sesgos de los datos de teleoperación**: hereda los sesgos del operador (trayectorias, velocidad, estilo de agarre) y no generaliza a otros operadores ni a otras estrategias de resolución.
- **Idiomas no declarados**: se desconoce si la codificación textual de la instrucción generaliza fuera del inglés; no hay evidencia de soporte multilingüe.
- **Licencia**: Apache-2.0 permite uso comercial y modificaciones, pero el modelo base y el dataset pueden tener sus propias condiciones; conviene verificar `lerobot/smolvla_base` antes de un despliegue comercial.
- **Naturaleza de prueba**: nombre `test1`, cero descargas y cero *likes*. No hay garantía de mantenimiento, soporte ni corrección de errores.
- **Repositorio de 5,3 GB**: incluye presumiblemente *checkpoints* y artefactos de entrenamiento, lo que encarece el almacenamiento y la descarga frente a los ~0,9 GB de pesos en bf16.
- **Ausencia de datos de seguridad**: no se documentan comportamientos ante fallos, ni protocolos de recuperación ante pérdida de una cámara.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mrpero23/smolvla_test1
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/mrpero23/test1_20261017_133008
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=mrpero23/test1_20261017_133008
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (*rollout*): https://huggingface.co/docs/lerobot/main/en/inference
