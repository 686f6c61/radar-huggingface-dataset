# jren313/starvla-gr00t-n1d7-g1-pipette-r11

## Resumen

El modelo `jren313/starvla-gr00t-n1d7-g1-pipette-r11` es un fine-tune del modelo base `nvidia/GR00T-N1.7-3B` desarrollado por jren313 para una tarea de manipulación robótica concreta: un robot humanoide Unitree G1 con manos Inspire debe recoger una punta de pipeta desechable de un rack y acoplarla en la pipeta. Se trata del checkpoint de la ronda 11 de un estudio de 13 rondas, en su configuración "sin memoria" (un solo frame de estado en lugar de cuatro), entrenado con episodios truncados en el momento en que la punta se asienta.

El modelo sigue el paradigma Vision-Language-Action (VLA) implementado en el framework starVLA, que descompone el sistema en un backbone de visión-lenguaje y un action head intercambiable. En este caso, el backbone es Cosmos-Reason2-2B truncado en la capa 16, y el action head es un DiT de flow-matching de 32 capas con 4 timesteps de inferencia. Con aproximadamente 3.100 millones de parámetros, el modelo procesa tres vistas de cámara y un estado de 17 dimensiones para generar acciones de 27 dimensiones a 30 pasos (503 ms).

La relevancia de este modelo radica en su enfoque práctico para tareas de laboratorio de precisión, y en que documenta de forma honesta sus limitaciones: no hay split de evaluación held-out, el rendimiento real en robot es imperfecto y la tarea presenta aliasing bajo un único frame de estado. Es un ejemplo de fine-tuning de un VLA base para una tarea específica, con advertencias claras sobre su uso en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone Cosmos-Reason2-2B (truncado en `select_layer=16`) + action head DiT de flow-matching de 32 capas, 4 timesteps de inferencia |
| Parametros totales | ~3.1 B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de robótica, no de texto; procesa imágenes y estado) |
| Tipos de cuantizacion | No disponible (checkpoint en PyTorch `.pt`, sin cuantizaciones publicadas) |
| Idiomas soportados | No disponible (usa una única frase fija en inglés: "Attach a green pipette tip from the tip rack to the pipette.") |
| Licencia | nvidia-open-model-license (derivada de `nvidia/GR00T-N1.7-3B`) |
| Formato de pesos | PyTorch `.pt` (checkpoint de starVLA, no compatible con `transformers.AutoModel`) |

## Arquitectura y entrenamiento

El modelo sigue la descomposición backbone-action head del framework starVLA. El backbone es Cosmos-Reason2-2B, un modelo de visión-lenguaje truncado en la capa 16 para extraer representaciones de la escena y la instrucción. El action head es un DiT (Diffusion Transformer) de flow-matching con 32 capas, que genera acciones mediante 4 pasos de inferencia. El modelo procesa tres vistas de cámara (ego a 256×256, y dos laterales fijas a 448×448) y un estado de 17 dimensiones (cintura 3, brazo izquierdo 7, brazo derecho 7) con un solo frame (`state_history_length: 1`) y una probabilidad de dropout de estado de 0.8 durante el entrenamiento.

La salida es una acción de 27 dimensiones × 30 pasos (503 ms a 59.6 fps): brazo izquierdo 7, brazo derecho 7, mano derecha 6, altura de raíz 1, velocidad lineal xy 2, velocidad de guiñada 1, cintura 3. Los valores de brazo y cintura son objetivos articulares absolutos, no deltas. El entrenamiento se realizó con 53 episodios (37.943 frames) grabados a 60 fps, con cada episodio truncado al final de la fase de inserción (el modelo nunca ve la elevación, el transporte ni la expulsión). Se usaron 10.000 pasos con batch global 128 en 4×B200, programación coseno y optimizador `paged_adamw_8bit`. El checkpoint publicado corresponde al paso 6000, que obtuvo el menor MSE de evaluación (0.000490 frente a 0.000600 en el paso 10000).

## Capacidades

- Generación de acciones de manipulación robótica: el modelo produce comandos de articulación absolutos para brazos, cintura y mano, junto con velocidades lineales y de guiñada, para ejecutar la tarea de acoplar una punta de pipeta.
- Percepción multimodal: procesa tres vistas de cámara simultáneamente (ego y dos laterales fijas) para comprender la escena.
- Integración de estado del robot: utiliza un vector de estado de 17 dimensiones (posición de cintura y articulaciones de ambos brazos) como entrada adicional.
- Ejecución temporal: genera secuencias de 30 pasos de acción, lo que permite planificar movimientos a corto plazo.
- Fine-tuning específico de tarea: está especializado en una única tarea de laboratorio (acoplar punta de pipeta), con una instrucción de lenguaje fija.
- Compatibilidad con el framework starVLA: se integra en un ecosistema modular que permite intercambiar backbones y action heads.

## Casos de uso

- Automatización de laboratorios de biología molecular: el modelo puede integrarse en un robot Unitree G1 para realizar la tarea de preparar pipetas, reduciendo la intervención humana en procesos repetitivos y de alta precisión.
- Investigación en manipulación robótica de precisión: sirve como banco de pruebas para estudiar el efecto de la memoria de estado (un frame vs. cuatro) en tareas con aliasing temporal, como se documenta en el estudio de 13 rondas.
- Desarrollo de políticas VLA con flow-matching: el checkpoint es un ejemplo de cómo aplicar un action head de flow-matching sobre un backbone de visión-lenguaje, útil para investigadores que quieran replicar o extender esta arquitectura.
- Evaluación de estrategias de truncado de episodios: el entrenamiento con episodios truncados en la fase de inserción permite analizar cómo afecta la omisión de fases posteriores al aprendizaje de la política.
- Benchmarking de frameworks VLA: al estar basado en starVLA, puede usarse para comparar el rendimiento de diferentes backbones y action heads bajo el mismo pipeline de entrenamiento.
- Estudio de normalización de datos en políticas robóticas: el uso de `dataset_statistics.json` con normalización q99 es un caso práctico de cómo la normalización afecta al rendimiento de la política, y cómo su ausencia degrada silenciosamente el comportamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) porque se trata de un modelo de robótica, no de lenguaje o razonamiento general. La model card reporta un valor de MSE de 0.000490 en el paso 6000, pero el autor advierte explícitamente que no existe un split de evaluación held-out: `eval_interval` mide el error sobre los mismos datos de entrenamiento, por lo que este valor debe tratarse como un proxy de la pérdida de entrenamiento, no como una medida de generalización. Además, el autor indica que el comportamiento real en robot es imperfecto: la política lleva la punta a una posición sobre el rack pero sub-comanda el descenso final y la alineación, en parte debido a un problema del controlador de bajo nivel (par de realimentación cero, lo que deja la cintura 1.7–2.4° por debajo de la orden, aproximadamente 6 mm en la punta frente a un paso de 9 mm del rack).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Dado el tamaño de ~3.1 B de parámetros y la entrada de tres imágenes, se estima que una GPU con al menos 8–12 GB de VRAM podría ser suficiente en precisión FP16, pero no hay datos confirmados.
- GPU recomendadas: el entrenamiento se realizó en 4×B200, pero para inferencia no se especifican requisitos. Una GPU de gama alta como RTX 4090 (24 GB) o A100 (40/80 GB) sería adecuada para pruebas locales.
- Compatibilidad con GPUs de consumo: probablemente sí, dado el tamaño del modelo, pero no hay confirmación oficial.
- Opciones de despliegue: el checkpoint es específico de starVLA y no es compatible con `transformers.AutoModel`. Requiere el framework starVLA y el layout de archivos indicado (config.yaml, config.full.yaml, dataset_statistics.json, checkpoints/steps_6000_pytorch_model.pt). No se mencionan opciones como vLLM, llama.cpp u Ollama, que están orientadas a modelos de lenguaje.
- Latencia y throughput: no disponibles. El modelo genera 30 pasos de acción en 503 ms según la frecuencia de grabación del dataset (59.6 fps), pero esto es una medida del dataset, no del tiempo de inferencia real.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `jren313/starvla-gr00t-n1d7-g1-pipette-r11` | ~3.1 B | No aplica (robótica) | Acoplar punta de pipeta | nvidia-open-model-license | HuggingFace |
| `nvidia/GR00T-N1.7-3B` (base) | ~3.1 B | No disponible | VLA general para manipulación | nvidia-open-model-license | HuggingFace |
| OpenVLA (referencia general) | 7 B | No disponible | VLA general | MIT | HuggingFace |

No se dispone de datos de rendimiento comparables entre estos modelos para la misma tarea. El modelo aquí descrito es un fine-tune del base GR00T-N1.7-3B, por lo que su comparación directa con el base sería la más relevante, pero no se han publicado métricas de generalización para ninguno de los dos en esta tarea específica. OpenVLA se menciona como referencia de la categoría, pero no hay datos de comparación en este contexto.

## Limitaciones y advertencias

- No existe un split de evaluación held-out: el valor de MSE reportado (0.000490) es un proxy de la pérdida de entrenamiento, no una medida de generalización. No debe compararse entre rondas que difieren en segmento de datos o dropout.
- Comportamiento real en robot imperfecto: la política sub-comanda el descenso final y la alineación. Parte del problema es del controlador de bajo nivel (par de realimentación cero), que deja la cintura 1.7–2.4° por debajo de la orden, equivalente a ~6 mm en la punta frente a un paso de 9 mm del rack.
- Aliasing de tarea bajo un solo frame de estado: descender sobre la punta y elevarse lejos de ella son visualmente casi idénticos; se midió que el 68% de los pares de frames casi duplicados tenían direcciones de siguiente chunk opuestas. Esta configuración elimina deliberadamente el historial de estado, lo que es defendible solo porque los datos de entrenamiento están truncados (la elevación no aparece).
- Requiere el mismo encuadre de cámara en producción: las cámaras laterales transmiten 1920×1080 pero el dataset las almacena recortadas al centro a 1080×1080; el recorte debe reproducirse en tiempo de servicio o el modelo recibe un encuadre que nunca vio.
- La normalización es crítica: `dataset_statistics.json` contiene la normalización q99 con la que se entrenó el action head. Servir sin ella, o con estado sin normalizar, degrada silenciosamente la política en lugar de producir un error.
- No es un modelo `transformers`: no se puede cargar con `AutoModel`; requiere el framework starVLA y el layout de archivos específico.
- Licencia restrictiva: al derivar de `nvidia/GR00T-N1.7-3B`, se aplica la nvidia-open-model-license, que puede tener condiciones específicas para uso comercial. Se debe consultar la licencia del modelo base.
- Tarea muy específica: el modelo solo ejecuta una instrucción fija en inglés y no es generalizable a otras tareas sin un nuevo fine-tuning.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jren313/starvla-gr00t-n1d7-g1-pipette-r11
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Repositorio starVLA en GitHub: https://github.com/starVLA/starVLA
- Paper de starVLA (arXiv): https://arxiv.org/pdf/2604.05014
- Fork de starVLA con pipeline QwenPI_v3: https://github.com/Jerryzhang258/Star-VLA
- Modelo relacionado (misma serie, pistón): https://huggingface.co/jren313/g1-inspire-piston-starvla-gr00t-n1d7
