# Myungkyu/pi0_5_rmbench_icl_b64_60k

## Resumen

`pi0_5_rmbench_icl_b64_60k` es un fine-tuning de la política robótica `lerobot/pi05_base` (familia Pi0.5 de Physical Intelligence) publicado por el usuario Myungkyu en Hugging Face. Se trata de un modelo visión-lenguaje-acción (VLA) de bajo nivel entrenado específicamente para RMBench, un conjunto de nueve tareas de manipulación sobre mesa simulada. El modelo recibe tres vistas de cámara (cabeza y dos muñecas), propriocepción y el texto de la subtarea actual, y produce acciones motoras; incorpora además un "slot" de keyframe que puede recibir un fotograma pasado recuperado cuando la etiqueta lo requiere.

El interés técnico reside en su enfoque de anotación: las demostraciones se etiquetaron con subtareas densas generadas por anotación few-shot con ejemplos en contexto (tres demostraciones etiquetadas por tarea), lo que permite entrenar políticas jerárquicas sin anotación manual exhaustiva. El checkpoint es el resultado de 60 000 pasos de optimización con batch 64 sobre el modelo base Pi0.5, con 4 143 404 816 parámetros y un repositorio de 9,4 GB en formato safetensors.

Es un modelo muy especializado y de nicho: no es un LLM de propósito general, sino un artefacto de investigación en robótica con cero descargas y sin métricas publicadas en la información disponible. Resulta relevante para quienes trabajan en manipulación con memoria, políticas VLA y evaluación en RMBench, no para aplicaciones de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pi0.5 (VLA, vision-lenguaje-accion) sobre backbone transformer; tres vistas de camara + slot de keyframe, convencion de memoria `full_frame_v1` |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo consume texto de subtarea; idioma no especificado) |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria `lerobot`) |
| Modelo base | `lerobot/pi05_base` |
| Dataset de entrenamiento | `Myungkyu/RMBench-icl-gemini` |
| Pasos de entrenamiento | 60 000 (batch 64) |
| Tamano del repo | 9,4 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Pi0.5, una política visión-lenguaje-acción que combina un backbone transformer con codificadores visuales para tres cámaras (cabeza, muñeca izquierda, muñeca derecha) y un codificador de texto para la subtarea actual. Una particularidad destacable es el "keyframe slot": un cuarto canal visual que, cuando la etiqueta de subtarea lo indica, se rellena con un fotograma pasado recuperado, lo que dota al modelo de una forma de memoria visual explícita. La convención de memoria se denomina `full_frame_v1`.

El entrenamiento parte de `lerobot/pi05_base` y se fine-tunea sobre el dataset `Myungkyu/RMBench-icl-gemini`, compuesto por demostraciones de nueve tareas de manipulación de mesa en simulación, anotadas con subtareas densas mediante anotación few-shot con ejemplos en contexto (tres demostraciones etiquetadas por tarea). Se realizaron 60 000 pasos con batch 64; el checkpoint publicado es el final. No se dispone de información sobre número total de tokens, composición exacta del dataset, ni sobre uso de RLHF/DPO. La model card advierte que las configs referencian el backbone y el tokenizer por hub id o por ruta local del sitio de entrenamiento, por lo que es necesario apuntarlas a copias locales antes de cargar el modelo.

## Capacidades

- Control robótico de bajo nivel: genera acciones motoras a partir de observaciones visuales y proprioceptivas para tareas de manipulación en mesa.
- Percepción multimodal: procesa simultáneamente imagen de cabeza e imágenes de ambas muñecas.
- Condicionamiento por lenguaje: acepta el texto de la subtarea actual como instrucción de alto nivel.
- Memoria visual selectiva: el slot de keyframe permite incorporar un fotograma pasado recuperado cuando la subtarea lo requiere.
- Ejecución de tareas con estructura de subtareas densas, derivada de la anotación few-shot del dataset.
- No se ha documentado soporte de tool calling, function calling, agentes multi-paso, ni capacidades de generación de texto, código, matemáticas, audio o visión general más allá del uso robótico.

## Casos de uso

- Investigación en manipulación con memoria: usar el modelo como política de referencia para evaluar cómo el slot de keyframe mejora tareas que requieren recordar estados pasados de la mesa.
- Reproducción de experimentos RMBench: cargar el checkpoint para replicar los resultados del fine-tuning sobre las nueve tareas simuladas y comparar con otras políticas.
- Baseline para fine-tuning posterior: partir de este checkpoint (ya adaptado a RMBench) en lugar de `pi05_base` para nuevas tareas de mesa, reduciendo el coste de adaptación.
- Estudio de anotación few-shot: analizar el impacto de etiquetar subtareas con solo tres demostraciones en contexto por tarea, comparando contra anotación manual completa.
- Evaluación de políticas VLA en simulación: integrar el modelo en un bucle de evaluación con `lerobot` para medir tasas de éxito por tarea y por subtarea.
- Desarrollo de pipelines de recuperación de keyframes: probar distintas estrategias de selección del fotograma pasado que alimenta el slot de memoria y medir su efecto en el rendimiento.
- Docencia y divulgación en robótica: ejemplo práctico de fine-tuning de un VLA con condicionamiento por subtareas y memoria visual para cursos de aprendizaje por imitación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4 143 404 816 parámetros, en fp32 se requieren aproximadamente 16,6 GB solo para pesos; en bf16/fp16, unos 8,3 GB; en cuantización de 8 bits, unos 4,1 GB (estimaciones teóricas, no confirmadas por el autor).
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, una GPU con 16 GB o más (por ejemplo, A100, H100 o RTX 4090) permitiría inferencia en bf16 con margen para las tres cámaras y el estado del entorno.
- GPU de consumo: previsiblemente cabe en tarjetas de 12-16 GB en bf16 o cuantización, aunque no hay confirmación del autor.
- Opciones de despliegue: la librería declarada es `lerobot`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a LLM, no a políticas VLA).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `pi0_5_rmbench_icl_b64_60k` | 4,14 B | no disponible | VLA para RMBench (9 tareas) | no disponible | Hugging Face (0 descargas) |
| `lerobot/pi05_base` | no disponible | no disponible | VLA base Pi0.5 | no disponible | Hugging Face (modelo base) |
| Otras políticas VLA para RMBench | no disponible | no disponible | Manipulación en mesa | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: entrenado solo para nueve tareas simuladas de RMBench; no generaliza a otros entornos sin fine-tuning adicional.
- Sin métricas publicadas: no hay benchmarks ni tasas de éxito documentadas, lo que impide evaluar su calidad a priori.
- Licencia no disponible: no se puede confirmar si permite uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Dependencia de rutas locales: las configs referencian el backbone y el tokenizer por hub id o ruta del sitio de entrenamiento; es necesario reconfigurarlas antes de cargar el modelo.
- Riesgo de alucinación motora: como toda política aprendida por imitación, puede producir acciones fuera de distribución ante estados no vistos.
- Sesgos: no documentados; al entrenarse en simulación, hereda los sesgos y simplificaciones del simulador y del dataset de demostraciones.
- Idioma: no se especifica qué idioma admite el texto de subtarea; probablemente inglés, dado el origen del dataset, pero no está confirmado.
- Madurez: creado y actualizado el mismo día (2026-11-11), con cero descargas y cero likes; no hay evidencia de validación por la comunidad.
- Contexto: no se documenta la longitud de contexto ni el número de fotogramas de historial que maneja el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Myungkyu/pi0_5_rmbench_icl_b64_60k
- Dataset de entrenamiento: https://huggingface.co/datasets/Myungkyu/RMBench-icl-gemini
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Librería LeRobot: https://github.com/huggingface/lerobot
