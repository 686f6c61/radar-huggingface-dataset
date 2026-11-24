# HuggingFaceM4/reachy-gestures-teacher

## Resumen

Reachy gestures teacher es un modelo derivado de Qwen/Qwen3-Embedding-8B afinado por HuggingFaceM4 para una tarea muy concreta: clasificar el gesto o la sensación conversacional que expresa una frase en el contexto del robot Reachy Mini. No es un modelo generativo de propósito general, sino un encoder de embeddings (arquitectura Qwen3, 7.567.295.488 parámetros en bf16) al que se le han añadido dos cabezas de salida ligeras: una cabeza `say` que puntúa 22 gestos más la opción "none" para frases que el robot pronuncia, y una cabeza `react` que puntúa 15 gestos más "none" para frases que el robot escucha.

Su función es la de maestro en un proceso de destilación: etiqueta frases con las que se entrena un modelo alumno más pequeño (`HuggingFaceM4/reachy-gestures`) que sí puede ejecutarse en el hardware del robot. El modelo es, por tanto, demasiado grande para inferencia en el dispositivo y su interés práctico está en la reproducibilidad del pipeline de etiquetado y en servir de referencia para quien quiera reentrenar o adaptar el sistema de gestos.

El modelo se apoya en el split `agreed` del dataset `HuggingFaceM4/reachy-gestures-data`, formado por 29.674 frases en las que gpt-oss-120b y Kimi-K3 produjeron etiquetas compatibles. La licencia es Apache 2.0 y los pesos se distribuyen en safetensors bf16 junto con las cabezas en formato NPZ.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (Qwen3) con dos cabezas de clasificación lineales añadidas (`say`, `react`) |
| Parametros totales | 7.567.295.488 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-Embedding-8B; no especificada en la información proporcionada) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16 safetensors) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16) + `gesture_heads.npz` + `gesture_labels.json` |
| Modelo base | Qwen/Qwen3-Embedding-8B |
| Pooling | last-token pooling |
| Dataset de entrenamiento | `splits/agreed` de HuggingFaceM4/reachy-gestures-data (29.674 frases) |
| Tamaño del repo | 15,1 GB |
| Pipeline declarado | robotics |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-Embedding-8B, un encoder transformer de 8B parámetros orientado a representaciones densas de texto. Sobre la representación del último token (last-token pooling) se añaden dos capas de salida independientes: `say`, que produce puntuaciones sobre 22 gestos más la clase "none" para frases emitidas por el robot, y `react`, que produce puntuaciones sobre 15 gestos más "none" para frases recibidas. Las etiquetas de gestos y su orden de salida están en `gesture_labels.json`.

El entrenamiento se realizó durante 5 épocas en una única GPU H200, con learning rate 3e-6, batch de 32, AdamW en 8 bits y pooling del último token. Cada frase se prefija con la instrucción `Instruct: Classify the feeling or conversational gesture this sentence expresses\nQuery:`. Los datos proceden del split `agreed` del dataset de gestos, que contiene 29.674 frases con etiquetas compatibles generadas por gpt-oss-120b y Kimi-K3 (etiquetado tipo ensemble entre dos LLM grandes). El repositorio incluye `training.json` con todos los argumentos y las métricas por época, lo que permite reproducir el ajuste.

La innovación técnica principal no está en la arquitectura, sino en el uso del modelo como maestro de destilación: al ser demasiado grande para el robot, se emplea para etiquetar frases y entrenar un alumno pequeño. El script `distill_data.py` del repositorio del dataset permite cargar el maestro y puntuar frases.

## Capacidades

- Clasificación de gestos para frases pronunciadas por el robot (cabeza `say`, 22 gestos + none).
- Clasificación de gestos de reacción para frases escuchadas por el robot (cabeza `react`, 15 gestos + none).
- Generación de embeddings de texto mediante el encoder Qwen3-Embedding-8B subyacente.
- Etiquetado automático de frases para entrenamiento por destilación de un modelo alumno.
- No es un modelo generativo: no produce texto libre.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.
- No se documentan capacidades multilingües explícitas ni modo thinking, visión o audio.

## Casos de uso

- Etiquetado de datasets de gestos para robótica social: se usa el maestro para puntuar grandes lotes de frases y generar etiquetas de gesto que alimentan el entrenamiento del modelo alumno ejecutable en Reachy Mini.
- Destilación de un clasificador de gestos pequeño: el maestro actúa como oráculo en el pipeline `distill_data.py`, permitiendo entrenar un alumno con menor huella de memoria y latencia apta para el robot.
- Reproducción de experimentos: con `training.json` y el split `agreed` se puede reentrenar el maestro y verificar los resultados por época, útil para investigación en destilación.
- Adaptación a nuevos repertorios de gestos: sustituyendo `gesture_labels.json` y reajustando las cabezas, el encoder base puede reutilizarse para clasificar un conjunto distinto de gestos conversacionales.
- Evaluación de calidad de etiquetas: comparar las puntuaciones del maestro con las etiquetas de gpt-oss-120b y Kimi-K3 permite auditar la consistencia del dataset `agreed`.
- Investigación en representaciones de instrucción: el prefijo `Instruct: ... Query:` y el last-token pooling sirven como referencia para estudiar el efecto de instrucciones en encoders de clasificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 15 GB solo para los pesos del encoder (7,57B parámetros × 2 bytes), más memoria para activaciones y cabezas; en la práctica se recomienda al menos 24 GB.
- GPU recomendadas: H200 (usada en el entrenamiento), A100 80 GB, H100; para inferencia en bf16 una RTX 4090 de 24 GB puede ser justa pero viable con batch pequeño.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) con bf16 y lotes pequeños; en GPUs de 16 GB requeriría cuantización, no documentada por el autor.
- Opciones de despliegue: carga directa con Transformers y las cabezas en NPZ; el script `distill_data.py` del repositorio del dataset es la vía documentada. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (el modelo no es generativo, por lo que estos servidores no aplican directamente).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Reachy gestures teacher | 7,57B | Clasificación de gestos (maestro de destilación) | no disponible | apache-2.0 | Hugging Face |
| HuggingFaceM4/reachy-gestures | no disponible (alumno pequeño) | Clasificación de gestos en el robot | no disponible | no disponible en la información | Hugging Face |
| Qwen/Qwen3-Embedding-8B | 8B | Embeddings de texto generales | no disponible | no disponible en la información | Hugging Face |

La comparación directa con clasificadores de gestos alternativos no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El modelo es demasiado grande para ejecutarse en el robot Reachy Mini; su uso previsto es fuera del dispositivo, como maestro de etiquetado.
- Solo clasifica gestos dentro de los repertorios definidos (22 en `say`, 15 en `react`); fuera de ellos la salida "none" puede absorber casos ambiguos.
- Depende de la calidad y cobertura del split `agreed` (29.674 frases con etiquetas compatibles de dos LLM); sesgos de esos modelos pueden propagarse al maestro y, por destilación, al alumno.
- No se documentan idiomas soportados; el comportamiento multilingüe es incierto.
- No se han publicado benchmarks ni evaluaciones de sesgo o alucinación en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3-Embedding-8B.
- El repositorio es pequeño en adopción (8 descargas, 0 likes) y reciente; no hay evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HuggingFaceM4/reachy-gestures-teacher
- Modelo alumno: https://huggingface.co/HuggingFaceM4/reachy-gestures
- Dataset de gestos: https://huggingface.co/datasets/HuggingFaceM4/reachy-gestures-data
- Instrucciones de reproducción del dataset: https://huggingface.co/datasets/HuggingFaceM4/reachy-gestures-data#reproduce-it
- Modelo base: https://huggingface.co/Qwen/Qwen3-Embedding-8B
