# GeertWang/starvla-pipette-aim-wrist1031-qwenoft-scratch

## Resumen

starvla-pipette-aim-wrist1031-qwenoft-scratch es un modelo de vision-lenguaje-accion (VLA) para control robótico, publicado por el usuario GeertWang en HuggingFace bajo la librería `starvla`. Se trata de un checkpoint de behavior cloning entrenado para la tercera fase de una tarea de pipeteo sobre un robot humanoide Unitree G1 equipado con manos Inspire: el objetivo concreto es introducir la pipeta sujetada con la mano derecha dentro del tubo que sostiene la mano izquierda.

El modelo parte de Qwen3-VL-4B-Instruct como backbone de visión-lenguaje y le añade una cabeza OFT (optimal transport / flow head) inicializada desde cero. No ha recibido ningún tipo de aprendizaje por refuerzo: el entrenamiento es puramente supervisado sobre 230 episodios de entrenamiento y 38 de validación recogidos con HG-DAgger, con 114.830 anclas de entrenamiento. Cada episodio se corta antes de la fase de extracción de la pipeta, por lo que el modelo no aprende esa parte de la tarea.

Es relevante como ejemplo de pipeline VLA reproducible sobre hardware humanoide de bajo coste relativo, pero conviene subrayar que se trata de un artefacto de investigación: las métricas publicadas son exclusivamente offline y el propio autor advierte que el modelo no se ha ejecutado sobre un robot real. El repositorio ocupa 9,1 GB, coherente con un backbone de 4B parámetros en precisión completa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-lenguaje-accion): backbone Qwen3-VL-4B-Instruct + cabeza OFT |
| Parametros totales | ~4B (backbone Qwen3-VL-4B) + cabeza OFT; cifra exacta no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint en PyTorch, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`qwenoft/checkpoints/steps_5382_pytorch_model.pt`) + `config.yaml` |

## Arquitectura y entrenamiento

El modelo combina un backbone VLM Qwen3-VL-4B-Instruct con una cabeza OFT nueva, entrenada desde cero. La entrada multimodal incluye tres vistas de cámara (ego, FOCUS y wrist_left) más la velocidad medida de la muñeca como vector de estado. La salida es una acción motora continua para el control del brazo y la mano del Unitree G1. Todos los parámetros son entrenables, incluido el backbone VLM.

El entrenamiento es behavior cloning supervisado con pérdida L1 y pesos por fotograma automáticos (1 para frames autónomos, 2 para frames humanos, 0 para frames enmascarados). No hay RLHF, DPO ni RL. La receta usa batch 128, learning rate 1e-5 para el VLM, 1e-4 para la cabeza y 2.5e-5 para el resto, con scheduler coseno hasta 1e-6 durante 10 épocas. El dataset consta de 230 episodios de entrenamiento y 38 de validación recogidos con HG-DAgger, con 114.830 anclas de entrenamiento, sin teleoperación y cortados antes de la fase de extracción.

## Capacidades

- Generación de acciones motoras continuas para el control de un brazo robótico y una mano antropomórfica en una tarea de inserción precisa.
- Percepción visual multimodal a partir de tres vistas simultáneas (ego, FOCUS y muñeca izquierda).
- Fusión de estado propioceptivo (velocidad de muñeca medida) con observaciones visuales.
- Ejecución de una subtarea concreta de alineación e inserción de pipeta en tubo.
- Aprendizaje de políticas a partir de demostraciones humanas corregidas (HG-DAgger), incluyendo frames autónomos y humanos con pesos distintos.
- No soporta tool calling, function calling, razonamiento multi-paso genérico ni capacidades de agente conversacional: es un modelo de política robótica, no un asistente.

## Casos de uso

- Investigación en manipulación bimanual precisa: sirve como referencia reproducible para estudiar inserción de objetos alargados con dos manos en un humanoide, usando las tres vistas y la velocidad de muñeca como entrada.
- Benchmark de pipelines HG-DAgger: el modelo permite evaluar cómo afecta la mezcla de frames humanos y autónomos (con pesos 2 y 1) al error L1 en un conjunto de validación fijo de 38 episodios.
- Estudio de cabezas OFT sobre backbones VLM: al partir de Qwen3-VL-4B-Instruct con cabeza nueva, es útil para comparar recetas de entrenamiento de políticas VLA frente a alternativas con backbone congelado.
- Prototipado de tareas de laboratorio automatizado: la política puede integrarse en un banco de pruebas de pipeteo para medir tasas de éxito antes de desplegar en producción.
- Análisis de sensibilidad a vistas: al incluir ego, FOCUS y wrist_left, permite ablaciones sobre qué cámara aporta más información en tareas de inserción fina.
- Docencia y reproducción: el checkpoint y el `config.yaml` permiten reproducir el entrenamiento en un nodo con GPU y comparar contra la línea base "hold still" publicada por el autor.

## Benchmarks y rendimiento

Métricas offline publicadas por el autor sobre 480 muestras de validación (38 episodios), pérdida L1:

| Conjunto | Este checkpoint | Hold still (línea base) |
|---|---|---|
| Todos los episodios (38) | 0.0216 | 0.0149 |
| Frames humanos | 0.0360 | no disponible |
| Frames autónomos | 0.0116 | no disponible |
| 12 episodios más tempranos | 0.0426 | 0.0278 |
| 12 episodios más tardíos | 0.0154 | 0.0089 |

El checkpoint elegido (step 5382) se seleccionó sobre el mismo holdout en el que se evalúa, por lo que el autor advierte que las cifras son ligeramente optimistas. En todos los agregados publicados, la línea base "hold still" obtiene menor error L1 que el modelo. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) ni evaluaciones en robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el repositorio pesa 9,1 GB, lo que sugiere que el checkpoint en precisión completa requiere al menos ~10 GB solo para pesos, más memoria para activaciones y las tres vistas de imagen.
- GPU recomendadas: no disponible. Por el tamaño del backbone (4B) y las tres cámaras de entrada, se necesitará una GPU con al menos 24 GB para inferencia cómoda en fp16, aunque el autor no lo especifica.
- ¿Cabe en GPU de consumo? No confirmado. Una RTX 4090 (24 GB) podría alojar los pesos en fp16, pero no hay datos publicados de latencia ni de memoria real.
- Opciones de despliegue: la librería `starvla` y el checkpoint PyTorch; no se han publicado variantes GGUF, ni integración con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| starvla-pipette-aim-wrist1031-qwenoft-scratch | ~4B + cabeza OFT | no disponible | Inserción de pipeta en Unitree G1 | no disponible | HuggingFace, 0 descargas |
| OpenVLA | ~7B | no disponible | Manipulación robótica general | no disponible en la información | Público |
| π0 (pi-zero) | no disponible | no disponible | Control robótico generalista | no disponible en la información | Público |

No se dispone de datos de benchmarks comparables entre estos modelos en la información proporcionada; la comparativa se limita a categoria y disponibilidad.

## Limitaciones y advertencias

- El modelo no se ha ejecutado sobre un robot real: todas las métricas son offline y el autor lo indica explícitamente.
- En todos los agregados publicados, la línea base "hold still" supera al modelo en error L1, lo que cuestiona su utilidad práctica incluso en evaluación offline.
- El checkpoint se seleccionó sobre el mismo holdout con el que se evalúa, introduciendo sesgo optimista en las cifras.
- Entrenado únicamente para la fase 3 de una tarea de pipeteo; no generaliza a otras tareas, objetos ni configuraciones de robot.
- No entrenado en la fase de extracción de la pipeta: no debe usarse para completar la tarea completa.
- El `config.yaml` contiene rutas del nodo de entrenamiento (`base_vlm` / tokenizer); es necesario apuntarlas a copias locales antes de usar el modelo.
- Licencia no disponible: no se puede confirmar el uso comercial.
- Sin información sobre sesgos, idiomas o robustez fuera del dominio de entrenamiento.
- Riesgo de alucinación visual y de acciones erráticas fuera de la distribución de las 230 demostraciones.

## Enlaces

- HuggingFace: https://huggingface.co/GeertWang/starvla-pipette-aim-wrist1031-qwenoft-scratch
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
