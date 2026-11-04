# Faless/piper_apples_giugno_trasporto_v2_smolvla_base_bs96

## Resumen

`Faless/piper_apples_giugno_trasporto_v2_smolvla_base_bs96` es una política de visión-lenguaje-acción (VLA) afinada a partir de SmolVLA, el modelo compacto de robótica publicado por Hugging Face en el paper arXiv:2506.01844. El modelo ha sido entrenado con LeRobot 0.6.2 sobre un conjunto de datos de demostraciones reales del robot Piper (`piper_full`) con dos cámaras (ego y front), y ejecuta una única tarea de manipulación: coger manzanas rojas una a una y depositarlas en una cesta verde. Con 450 millones de parámetros y un repositorio de 2,7 GB, está pensado para inferencia en hardware de consumo, no en clústeres de datacenter.

El interés de esta ficha no está en el modelo base SmolVLA, sino en el artefacto concreto: una política de imitación entrenada durante 55.000 pasos con batch 96, learning rate 1e-4 y semilla 1000 sobre 631 episodios (909.551 frames a 30 FPS) del dataset `Faless/piper_apples_giugno_trasporto_v2`. Es un ejemplo representativo del flujo actual de robótica open source: un VLA pequeño, un dataset propio y un pipeline de LeRobot que va del `lerobot-train` al `lerobot-rollout` sin salir de la CLI.

La relevancia práctica es doble. Por un lado, demuestra que un VLA de 450 M de parámetros puede especializarse en una tarea de pick-and-place con datos modestos (631 episodios) y desplegarse en un robot de bajo coste. Por otro, expone las limitaciones del enfoque: no hay resultados de evaluación publicados, la licencia no está declarada y la política está acoplada a la morfología y a las cámaras exactas del Piper usado en la grabación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, transformer compacto; detalles internos no disponibles en la información proporcionada) |
| Parámetros totales | 450.046.176 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (política de control, no modelo de lenguaje conversacional) |
| Tipos de cuantización | no disponible (pesos en safetensors; no se documentan cuantizaciones GGUF/INT8) |
| Idiomas soportados | no disponible (la política consume instrucciones de tarea; el dataset usa la frase "Pick the red apples one by one and place them into the green basket") |
| Licencia | no disponible (la model card indica "[More Information Needed]") |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

SmolVLA es un VLA compacto que combina un codificador visual, un codificador de lenguaje y un cabezal de acciones, entrenado para mapear observaciones (imágenes de dos cámaras a 256×256 y estado del robot de 8 dimensiones) a un vector de acción de 7 dimensiones. La model card no detalla la composición interna de bloques, el número de capas ni el mecanismo de atención; solo confirma que se trata de un modelo pequeño orientado a hardware de consumo y que el checkpoint deriva de `Faless/smolvla_base_adapted`, a su vez un ajuste del SmolVLA base.

El entrenamiento se realizó con LeRobot 0.6.2 durante 55.000 pasos, batch size 96, optimizador AdamW, learning rate 1e-4 y semilla 1000, sobre 631 episodios y 909.551 frames a 30 FPS del dataset `Faless/piper_apples_giugno_trasporto_v2`. No se documenta si hubo RLHF, DPO ni ninguna fase de refinamiento posterior a la imitación supervisada; el pipeline descrito es el estándar de LeRobot para imitation learning. Tampoco se especifican aumentos de datos, composición exacta del dataset más allá de la tarea, ni innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Control robótico de manipulación: genera acciones de 7 dimensiones (posición/orientación del efector y pinza) a partir de observaciones visuales y de estado.
- Percepción visual multi-cámara: consume dos flujos de imagen de 256×256 (`ego` y `front`).
- Ejecución de una instrucción de tarea en lenguaje natural: la política está condicionada por la frase "Pick the red apples one by one and place them into the green basket".
- Pick-and-place especializado: coger objetos (manzanas rojas) y depositarlos en un contenedor (cesta verde).
- Integración con LeRobot: compatible con `lerobot-rollout` y `lerobot-train` mediante CLI.
- No se documentan capacidades de tool calling, razonamiento multi-paso, generación de texto libre, matemáticas, código, audio ni modo "thinking".

## Casos de uso

- Automatización de recogida de fruta en líneas de clasificación: la política puede ejecutar el ciclo coger-colocar sobre manzanas rojas y una cesta verde en un robot Piper, reduciendo la programación manual de trayectorias para esa tarea concreta.
- Prototipado de pipelines de imitation learning: sirve como referencia de extremo a extremo (dataset → `lerobot-train` → `lerobot-rollout`) para equipos que quieran replicar el flujo con sus propios datos y robots.
- Benchmark interno de VLA compactos: al tener 450 M de parámetros y un dataset público asociado, permite comparar variantes de SmolVLA y configuraciones de entrenamiento (batch, pasos, learning rate) en una tarea reproducible.
- Investigación en manipulación con dos cámaras: el uso de vistas `ego` y `front` a 256×256 facilita estudiar el efecto de la configuración de sensores en el éxito de la política.
- Despliegue en hardware de bajo coste: al ser un modelo pequeño, es candidato para ejecutarse en GPUs de consumo junto al robot, sin depender de un servidor central.
- Generación de datos sintéticos y aumento de dataset: la política puede usarse como profesor para etiquetar episodios adicionales o para evaluar la sensibilidad del dataset original antes de reentrenar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una sección de evaluación vacía con la nota "No evaluation results have been provided for this policy yet", por lo que no hay tasas de éxito, ni comparaciones con otras políticas, ni métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 450 M de parámetros en fp32 los pesos ocupan aproximadamente 1,8 GB, y en fp16/bf16 alrededor de 0,9 GB, a lo que hay que sumar activaciones y buffers de imagen (dos flujos de 3×256×256).
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU con al menos 4-8 GB de VRAM debería poder alojar los pesos, aunque el rendimiento real no está documentado.
- Cabe en GPU de consumo: previsiblemente sí (gama RTX 30/40 y equivalentes), aunque no hay confirmación oficial ni cifras de latencia.
- Opciones de despliegue: `lerobot-rollout` con `--policy.path=Faless/piper_apples_giugno_trasporto_v2_smolvla_base_bs96` y `--robot.type=piper_full`; el resto de backends (vLLM, llama.cpp, Ollama, TGI) no están soportados para este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Faless/piper_apples_giugno_trasporto_v2_smolvla_base_bs96` | 450 M | Pick-and-place de manzanas en Piper | no disponible | no disponible | Hugging Face (33 descargas) |
| `Faless/smolvla_base_adapted` (modelo base) | no disponible | VLA base ajustado | no disponible | no disponible | Hugging Face |
| SmolVLA base (paper arXiv:2506.01844) | no disponible en la información proporcionada | VLA generalista compacto | no disponible | no disponible | Hugging Face / paper |

No se dispone de datos de rendimiento comparables entre estas variantes; la comparación se limita a linaje y disponibilidad.

## Limitaciones y advertencias

- Sin evaluación publicada: no hay tasas de éxito ni pruebas en robot real documentadas, por lo que no se puede afirmar que la política funcione de forma fiable fuera del dataset de entrenamiento.
- Acoplamiento a hardware y sensores: entrenada para `piper_full` con cámaras `ego` y `front` a 256×256; cambiar la morfología, la resolución o la posición de las cámaras invalida la política.
- Tarea única: solo se ha entrenado para "Pick the red apples one by one and place them into the green basket"; no generaliza a otras instrucciones ni objetos.
- Licencia no declarada: la model card indica "[More Information Needed]", lo que impide confirmar el uso comercial y obliga a contactar con el autor antes de producción.
- Riesgo de sobreajuste al dataset: 631 episodios y 55.000 pasos con batch 96 pueden producir políticas frágiles ante cambios de iluminación, posiciones de objetos o distracciones.
- Idiomas y contexto: no se documentan capacidades multilingües ni ventana de contexto; la instrucción de tarea está fijada en inglés.
- Sesgos y alucinación: no hay información sobre sesgos; en políticas de imitación el fallo típico es la ejecución de acciones fuera de distribución, no la alucinación textual.
- Dependencia de LeRobot 0.6.2: la reproducibilidad del entrenamiento y del despliegue depende de esa versión concreta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Faless/piper_apples_giugno_trasporto_v2_smolvla_base_bs96
- Modelo base: https://huggingface.co/Faless/smolvla_base_adapted
- Dataset de entrenamiento: https://huggingface.co/datasets/Faless/piper_apples_giugno_trasporto_v2
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Faless/piper_apples_giugno_trasporto_v2
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
