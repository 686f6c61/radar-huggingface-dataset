# Aether258/pi05_bi_two_tubes_0102_step14000

## Resumen

El modelo `Aether258/pi05_bi_two_tubes_0102_step14000` es un checkpoint de fine-tuning del modelo `pi05_bi` de la librería OpenPI, especializado en manipulación robótica bimanual con entradas táctiles. Desarrollado por Aether258, este checkpoint se entrenó sobre una tarea concreta de pick-and-place de dos tubos (azul y verde) usando un brazo bimanual, con una instrucción unificada en lenguaje natural. El modelo integra seis flujos de cámara (dos RGB y cuatro sensores táctiles) y emplea un esquema de entrenamiento con LoRA sobre el LLM y el action expert, mientras que la torre de visión se ajusta completamente.

El checkpoint corresponde al paso 14000 de un entrenamiento planificado a 20 000 pasos, y alcanza una pérdida de validación *held-out* de 0.0537, la más baja del run hasta ese momento. Aunque el modelo está orientado a una tarea específica, demuestra la viabilidad de fine-tunear modelos VLA (vision-language-action) de gran escala con datos relativamente reducidos (1 019 episodios) y hardware moderado (2× A100-80GB). Su licencia Apache-2.0 permite uso comercial y modificación, lo que lo hace atractivo para investigación y prototipado en robótica.

La arquitectura exacta (número de parámetros, longitud de contexto) no se detalla en la información disponible, pero al tratarse de un modelo de la familia `pi05_bi` de OpenPI, se asume una arquitectura transformer multimodal con generación de acciones mediante *flow matching*. El repositorio pesa 9.6 GB e incluye pesos de inferencia, estado de optimizador y estadísticas de normalización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | pi05_bi (VLA basado en transformer, con flow matching) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (repositorio LeRobot, probablemente safetensors) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura `pi05_bi` de OpenPI, un VLA que combina un modelo de lenguaje multimodal con un *action expert* para generar acciones continuas de robot mediante *flow matching*. El entrenamiento se realizó con LoRA de rango 16 sobre el LLM y rango 32 sobre el action expert, mientras que la torre de visión se fine-tuneó por completo (el filtro de congelación solo afecta a las capas `.*llm.*`). Esta combinación permite adaptar el modelo a una tarea específica sin reentrenar todos los parámetros.

Los datos provienen de dos fuentes (`KaiyueChen/two_tubes_01` y `KaiyueChen/two_tubes_02`), fusionadas en un único dataset de 1 019 episodios y 802 719 frames a 30 fps. Se utilizaron seis flujos de cámara: dos cámaras RGB (`camera0`, `camera1`) y cuatro sensores táctiles (`tactile_left_0/1`, `tactile_right_0/1`). Las imágenes se incrustan directamente en los archivos parquet (LeRobot v2.1). La instrucción se unificó a una sola frase para evitar que el modelo aprendiera que dos instrucciones distintas corresponden al mismo movimiento, ya que una de las fuentes contenía un placeholder.

El entrenamiento se ejecutó en 2× A100-80GB con FSDP, batch size 128, pico de learning rate 2e-4 con 1 000 pasos de warmup y decaimiento coseno sobre 100 000 pasos. El run se reanudó desde el paso 10 000 en un host nuevo con `--resume`, lo que alteró la secuencia de batches posterior a ese punto. La pérdida de validación *held-out* (val_unseen) se mantuvo prácticamente plana desde el paso 6 000 (0.0543 → 0.0537), mientras que la pérdida de entrenamiento y val_seen seguían bajando, indicando saturación de la generalización.

## Capacidades

- Manipulación robótica bimanual: el modelo controla dos brazos para realizar tareas de pick-and-place coordinadas.
- Percepción táctil: integra cuatro sensores táctiles que proporcionan feedback de contacto, útil para manipulación precisa.
- Percepción visual: procesa dos flujos de cámara RGB para localizar y seguir objetos.
- Seguimiento de instrucciones en lenguaje natural: responde a una instrucción unificada en inglés que describe la secuencia completa de acciones.
- Generación de acciones continuas: mediante *flow matching*, produce trayectorias de acción suaves y ejecutables.
- Fine-tuning eficiente: gracias a LoRA, puede adaptarse a nuevas tareas con recursos limitados.

No se mencionan capacidades de tool calling, agentes autónomos, razonamiento multi-paso fuera del ámbito robótico, ni soporte multilingüe más allá del inglés.

## Casos de uso

- Automatización de líneas de ensamblaje: el modelo puede ejecutar tareas repetitivas de pick-and-place bimanual, como colocar componentes en posiciones específicas, reduciendo la intervención humana en entornos controlados.
- Manipulación de objetos con feedback táctil: los sensores táctiles permiten ajustar la fuerza de agarre, lo que resulta útil para manejar piezas frágiles o deformables sin dañarlas.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar cómo fine-tunear modelos VLA con datos limitados y hardware moderado, comparando curvas de validación y estrategias de regularización.
- Desarrollo de robots colaborativos: puede integrarse en sistemas de robótica colaborativa donde un robot bimanual asiste a operarios en tareas de clasificación u ordenación de objetos.
- Prototipado rápido de políticas robóticas: al ser un checkpoint intermedio (paso 14 000), permite evaluar el efecto de la duración del entrenamiento y la saturación de generalización antes de completar el run completo.
- Benchmarking de modelos VLA: su curva de validación y configuración de entrenamiento documentada lo convierten en un caso de estudio para comparar estrategias de fine-tuning (LoRA vs. full fine-tuning, fusión de datasets, etc.).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El modelo se evalúa mediante la pérdida de *flow matching* sobre splits de validación. La siguiente tabla muestra la evolución de la pérdida durante el entrenamiento:

| step | train | val_seen | val_unseen | gap |
|---:|---:|---:|---:|---:|
| 0 | 0.5525 | 0.4968 | 0.5261 | 0.0293 |
| 2000 | 0.0553 | 0.0504 | 0.0608 | 0.0104 |
| 4000 | 0.0490 | 0.0467 | 0.0576 | 0.0109 |
| 6000 | 0.0460 | 0.0437 | 0.0543 | 0.0106 |
| 8000 | 0.0441 | 0.0423 | 0.0550 | 0.0127 |
| 10000 | 0.0435 | 0.0416 | 0.0542 | 0.0126 |
| 12000 | 0.0420 | 0.0403 | 0.0538 | 0.0135 |
| **14000** | 0.0404 | 0.0387 | **0.0537** | 0.0150 |

La pérdida val_unseen se mantiene prácticamente plana desde el paso 6 000, lo que sugiere que la capacidad de generalización se satura y el modelo comienza a sobreajustar los datos de entrenamiento. Cada punto de validación cubre ~2 560 frames (3-4 episodios), por lo que variaciones menores a ±0.001 se consideran ruido.

## Requisitos de hardware

- Entrenamiento: se utilizaron 2× A100-80GB con FSDP, batch size 128. No se especifican requisitos de VRAM para inferencia.
- Inferencia: no disponible en la información proporcionada. Dado el tamaño del repositorio (9.6 GB) y la naturaleza del modelo VLA, se estima que requiere al menos una GPU con 24 GB de VRAM para ejecutarse en precisión completa, pero este dato no está confirmado.
- Opciones de despliegue: al ser un modelo de LeRobot, es compatible con el ecosistema LeRobot para inferencia en robots reales. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje puro.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (VLA bimanual con entradas táctiles). El modelo es un fine-tuning de `pi05_bi` de OpenPI, pero no se proporcionan especificaciones del modelo base ni de otros checkpoints similares. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para una tarea específica (pick-and-place de dos tubos con una instrucción fija). No generaliza a otras instrucciones o escenarios sin fine-tuning adicional.
- La instrucción unificada limita la flexibilidad semántica: el modelo no distingue entre variaciones de la tarea.
- La validación *held-out* muestra una saturación de la generalización a partir del paso 6 000, con un gap creciente entre val_seen y val_unseen, lo que indica sobreajuste progresivo.
- El run se reanudó desde el paso 10 000 con `--resume`, lo que alteró la secuencia de batches; los pesos del checkpoint difieren de un run ininterrumpido.
- Los datos provienen de un entorno concreto (dos tubos, colores específicos, disposición fija); el rendimiento en entornos no vistos no está garantizado.
- No se han evaluado sesgos de lenguaje ni alucinaciones, ya que el modelo no genera texto libre, sino acciones robóticas.
- La licencia Apache-2.0 permite uso comercial, pero el modelo es un checkpoint intermedio (no el entrenamiento completo) y puede requerir ajustes adicionales para producción.

## Enlaces

- HuggingFace: https://huggingface.co/Aether258/pi05_bi_two_tubes_0102_step14000
- Perfil del autor: https://huggingface.co/Aether258
- OpenPI (librería base): https://www.openpi.net/english.html
