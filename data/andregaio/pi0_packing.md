# AndreGaio/pi0_packing

## Resumen

Este modelo es un fine-tune del modelo fundacional de robótica π₀ (pi0) de Physical Intelligence, adaptado mediante LeRobot para una tarea concreta de empaquetado: cargar gomas de borrar en un contenedor. El autor, AndreGaio, ha partido del checkpoint base `lerobot/pi0_base` y lo ha ajustado con un dataset propio de 5 episodios (14.234 fotogramas) recogidos a 30 FPS. El resultado es una política Vision-Language-Action (VLA) capaz de controlar un robot tipo `so_follower` a partir de dos cámaras (frontal y superior) y una instrucción en lenguaje natural.

La relevancia de este modelo reside en que demuestra el flujo completo de fine-tuning de un VLA de propósito general con muy pocos datos, algo que antes requería grandes infraestructuras. Al estar basado en π₀, hereda la arquitectura de flujo (flow matching) sobre un modelo de lenguaje y visión pre-entrenado, con 4.028.019.472 parámetros (≈4,03 mil millones). No se especifica la longitud de contexto en la información disponible, ya que se trata de un modelo de control motor y no de procesamiento de texto extenso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en flujo (flow matching) sobre un VLM pre-entrenado (modelo base π₀ de Physical Intelligence) |
| Parametros totales | 4.028.019.472 (≈4,03 mil millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors) |
| Idiomas soportados | no disponible (el VLM base probablemente soporta inglés, pero no se especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

π₀ es un modelo de flujo (flow-based) que genera acciones continuas de robot condicionadas a observaciones visuales y a una instrucción en lenguaje natural. La arquitectura combina un VLM pre-entrenado (que aporta comprensión semántica y razonamiento visual) con un cabezal de acción que produce las señales de control. El modelo base fue pre-entrenado por Physical Intelligence en más de 10.000 horas de datos robóticos heterogéneos, según el repositorio openpi.

Este fine-tune se entrenó con la librería LeRobot (versión 0.6.2) sobre el dataset `AndreGaio/test-packing_20260816_160939`, que contiene 5 episodios y 14.234 fotogramas de la tarea "Load erasers into container". La configuración de entrenamiento fue: 5.000 pasos, batch size 1, optimizador AdamW, learning rate 2,5e-5 y semilla 1000. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación; es un ajuste puramente supervisado por imitación.

## Capacidades

- Control de un robot `so_follower` para la tarea específica de cargar gomas de borrar en un contenedor.
- Procesamiento de dos cámaras simultáneas (frontal y superior) con resolución 640×480.
- Salida de acciones de 6 dimensiones (posición y orientación del efector final).
- Interpretación de una instrucción en lenguaje natural (la tarea se define como texto).
- Al estar basado en π₀, hereda capacidades generales de VLA, aunque limitadas por el pequeño dataset de fine-tuning.
- No incluye tool calling, generación de texto libre, razonamiento multi-paso ni capacidades de chat: es un modelo de control motor, no un LLM conversacional.

## Casos de uso

- Demostración de fine-tuning de VLA con LeRobot: sirve como ejemplo reproducible de cómo adaptar `pi0_base` a una tarea concreta con un dataset mínimo, útil para desarrolladores que quieran iniciarse en robótica con aprendizaje por imitación.
- Investigación en aprendizaje por imitación con pocos datos: permite estudiar el efecto del fine-tuning con solo 5 episodios sobre la capacidad de generalización de un modelo fundacional.
- Control de robots SO-100 de bajo coste: puede desplegarse en un brazo robótico SO-100 para tareas de pick-and-place en entornos de laboratorio o educativos.
- Automatización de empaquetado en líneas de montaje sencillas: la tarea de colocar objetos pequeños en contenedores es común en entornos industriales controlados, y este modelo ofrece un punto de partida para prototipos.
- Benchmark de adaptación rápida: al ser un fine-tune mínimo, es útil para evaluar la capacidad de π₀ de aprender nuevas tareas con pocas demostraciones, comparando con otros métodos.
- Educación en robótica y VLA: el repositorio incluye instrucciones completas de instalación, entrenamiento y despliegue, lo que lo convierte en material didáctico para cursos de robótica avanzada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor indica explícitamente: "No evaluation results have been provided for this policy yet." Por tanto, no se dispone de tasas de éxito ni métricas comparativas con otros modelos.

## Requisitos de hardware

- No hay datos oficiales de VRAM ni latencia. Estimación orientativa: con 4,03 mil millones de parámetros, los pesos en FP16 ocupan aproximadamente 8 GB. Considerando activaciones y memoria adicional, se recomienda al menos 12-16 GB de VRAM para inferencia.
- GPUs compatibles: tarjetas con 16 GB o más, como RTX 3090/4090 (24 GB), A100, H100 o RTX 4000 Ada. Podría caber en GPUs de 12 GB si se aplicara cuantización, pero no se han publicado versiones cuantizadas.
- Despliegue: se realiza mediante el comando `lerobot-rollout` de LeRobot sobre un robot `so_follower` con cámaras OpenCV. No se menciona soporte para vLLM, llama.cpp ni Ollama, ya que no es un modelo de lenguaje generativo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Rendimiento |
|---|---|---|---|---|---|
| AndreGaio/pi0_packing (este) | 4,03B | VLA de flujo (fine-tune) | no disponible | Apache 2.0 | sin evaluación |
| lerobot/pi0_base | 4,03B (estimado) | VLA de flujo (pre-entrenado) | no disponible | Apache 2.0 | pre-entrenado en 10k+ horas |
| pi0-FAST (Physical Intelligence) | no disponible | VLA autoregresivo con tokenizador FAST | no disponible | Apache 2.0 (según openpi) | no disponible |

No se dispone de datos de benchmarks para ninguno de estos modelos en la información recopilada. La comparativa se limita a características arquitectónicas y de disponibilidad.

## Limitaciones y advertencias

- Entrenado con solo 5 episodios, por lo que existe un alto riesgo de sobreajuste a las condiciones específicas del dataset (posición de los objetos, iluminación, fondo, etc.). La generalización a entornos nuevos probablemente sea muy limitada.
- No se ha realizado ninguna evaluación formal sobre el robot real; se desconoce la tasa de éxito real de la tarea.
- El modelo solo funciona con el robot `so_follower` y con las cámaras frontal y superior en las posiciones y resoluciones usadas durante el entrenamiento. Cambiar la configuración de hardware requiere reentrenamiento.
- No es un modelo multiuso: no genera texto, no responde preguntas ni ejecuta herramientas. Su única salida es una acción de 6 dimensiones.
- El dataset de entrenamiento no especifica restricciones de uso, pero al ser un dataset público de HuggingFace, se recomienda revisar sus términos antes de usarlo comercialmente.
- La licencia Apache 2.0 permite uso comercial del modelo, pero no exime de posibles patentes o derechos de terceros sobre la arquitectura π₀.

## Enlaces

- Repositorio del modelo: https://huggingface.co/AndreGaio/pi0_packing
- Modelo base: https://huggingface.co/lerobot/pi0_base
- Dataset de entrenamiento: https://huggingface.co/datasets/AndreGaio/test-packing_20260816_160939
- Paper de π₀: https://arxiv.org/abs/2410.24164
- Blog de Physical Intelligence sobre π₀: https://www.physicalintelligence.company/blog/pi0
- Repositorio openpi (código y modelos): https://github.com/Physical-Intelligence/openpi
- Documentación de LeRobot para π₀: https://huggingface.co/docs/lerobot/main/en/pi0
