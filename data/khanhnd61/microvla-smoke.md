# khanhnd61/microvla-smoke

## Resumen

MicroVLA es una política de visión-lenguaje-acción (VLA) de aproximadamente 159 millones de parámetros desarrollada por Khanh Nguyen (khanhnd61) para control robótico. Su característica distintiva es que no utiliza un modelo de lenguaje en la ruta de ejecución: la generación de acciones se produce mediante un decodificador de acciones y un stack de fusión, mientras que el texto se procesa con bloques de T5-small únicamente como codificador de instrucciones. El modelo está diseñado para resolver tareas del benchmark LIBERO, un conjunto de evaluación estándar para manipulación robótica.

Este repositorio concreto (`khanhnd61/microvla-smoke`) no es un modelo publicado ni evaluado: se trata de un checkpoint parcial en progreso, en el paso 4250 de 80000 de entrenamiento, publicado para ejercitar el flujo de publicación. El autor advierte explícitamente que no existe ninguna tasa de éxito medida y que no debe citarse ningún rendimiento. La licencia es Apache-2.0 para el código y el checkpoint, aunque al cargar el modelo se descargan pesos de RADIO de NVIDIA que tienen su propia licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA híbrida: torre de visión RADIO (congelada), bloques encoder T5-small (congelados), stack de fusión, decodificador de acciones, CVAE style encoder |
| Parametros totales | ~159 M (aprox.; 98,2 M RADIO + 18,9 M T5 + 26,6 M fusión + 14,2 M decoder + 7,1 M CVAE) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el vocabulario se poda a 80 tokens que cubren 40 instrucciones de LIBERO) |
| Tipos de cuantizacion | no disponible (checkpoint en bf16) |
| Idiomas soportados | inglés (instrucciones de LIBERO únicamente) |
| Licencia | Apache-2.0 (checkpoint); RADIO de NVIDIA tiene licencia propia |
| Formato de pesos | safetensors (checkpoint parcial de 195 MB, 48,8 M tensores) |

## Arquitectura y entrenamiento

MicroVLA combina una torre de visión RADIO v2-B congelada (98,2 M parámetros, de NVIDIA), bloques encoder de T5-small congelados (18,9 M) y una pila de fusión de 26,6 M parámetros que combina características visuales y lingüísticas. Un decodificador de acciones de 14,2 M genera bloques de 12 pasos de acciones delta del efector final (posición, orientación y apertura de la pinza). El entrenamiento usa una CVAE estilo ACT con objetivo ℓ₁ + 10·KL. El vocabulario se poda a 80 tokens de la tabla de embedding de T5-small, cubriendo solo las 40 instrucciones del corpus LIBERO.

El entrenamiento se realizó con las cuatro suites de LIBERO de forma conjunta (mixed-suite), con batch efectivo de 256 (16 × 16 acumulación de gradientes) en bf16 sobre una sola RTX 3090. El checkpoint se publica en el paso 4250 de 80.000, con una loss total de 0.148 en el snapshot. Los pesos congelados (RADIO y T5) no se incluyen en el archivo; se descargan y reconstruyen al cargar el checkpoint desde sus repositorios de Hub.

## Capacidades

- Generación de acciones de manipulación robótica: predice bloques de 12 pasos de acciones delta del efemador (posición 3D, ángulo de eje, y qpos de la gripper).
- Comprensión de instrucciones en lenguaje natural: tokeniza instrucciones de LIBERO (p. ej., "pick up the black bowl and place it on the plate") y las usa como contexto para la política.
- Procesamiento de doble vista: acepta imágenes de cámara de muñeca y cámara superior (2 vistas) como entrada.
- Ejecución sin modelo de lenguaje en la ruta de inferencia: la generación de acciones no depende de un LLM en el bucle, lo que reduce latencia y requisitos de cómputo.
- No soporta tool calling, ni agentes conversacionales, ni generación de texto general.

## Casos de uso

- Investigación en manipulación robótica: sirve como base para estudiar políticas VLA compactas en el benchmark LIBERO, permitiendo experimentar con arquitecturas sin LLM en la ruta de ejecución.
- Desarrollo de pipelines de entrenamiento: el checkpoint sirve para validar el flujo de publicación y carga de MicroVLA, incluyendo la reconstrucción de torres congeladas desde el Hub.
- Control de robots en simulación: puede ejecutarse en entornos LIBERO para explorar el comportamiento de la política en tareas de mesa (pick-and-place, manipulación de objetos) durante el entrenamiento.
- Prototipado de sistemas de control en bucle cerrado: la API `predict_chunk` permite integrar la política en un bucle de control real, aunque con rendimiento sin evaluar.
- Estudio de técnicas de poda de vocabulario: el checkpoint incluye un mapa de vocabulario podado que limita el modelo a las instrucciones del corpus, útil para investigar eficiencia de memoria.
- Educación en robótica: ejemplo didáctico de una arquitectura VLA con componentes congelados y entrenables, con código fuente abierto y configuraciones de entrenamiento documentadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card advierte explícitamente que no hay ninguna tasa de éxito medida en LIBERO y que el checkpoint no debe citarse con rendimiento alguno.

## Requisitos de hardware

- Entrenamiento: el checkpoint se produjo con una sola RTX 3090 (24 GB VRAM) en bf16.
- Inferencia: no se han publicado requisitos específicos de VRAM para inferencia; el checkpoint parcial ocupa 195 MB, pero al cargar se reconstruyen RADIO (98,2 M) y T5 (18,9 M), por lo que la VRAM total dependerá del modelo completo (~159 M en bf16 ≈ 318 MB de pesos, más overhead de activaciones).
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos 8 GB de VRAM debería ser suficiente para inferencia en lotes pequeños, aunque no está validado.
- Opciones de despliegue: la librería `microvla` proporciona la carga del checkpoint y la predicción de acciones; no hay soporte documentado para vLLM, Ollama o llama.cpp.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay datos comparativos disponibles. La model card no ofrece benchmarks ni comparaciones con otros VLA. Como referencia cualitativa, otros VLA como OpenVLA (7B) o RT-2 (55B) son órdenes de magnitud mayores en parámetros, mientras que MicroVLA busca un enfoque compacto sin LLM en la ruta de ejecución. Sin embargo, sin datos de rendimiento de MicroVLA, cualquier comparación numérica sería especulativa.

## Limitaciones y advertencias

- Checkpoint en progreso, no evaluado: está en el paso 4250 de 80.000, sin tasa de éxito medida en LIBERO. No debe usarse como modelo de producción ni como referencia de rendimiento.
- Vocabulario podado: el modelo solo reconoce las 40 instrucciones del corpus LIBERO; cualquier token fuera de vocabulario se degrada a `<unk>` con advertencia.
- Riesgo de alucinación y errores de acción: sin evaluación, no se conoce la tasa de fallos ni la robustez ante perturbaciones.
- Licencia de RADIO: al cargar el checkpoint se descargan los pesos de RADIO de NVIDIA, que tienen su propia licencia. No se distribuyen en este repositorio, pero el usuario debe revisarla antes de redistribuir derivados del modelo cargado.
- Idiomas limitados: solo instrucciones en inglés del corpus LIBERO; sin soporte multilingüe.
- Limitación de contexto: la ventana de contexto textual se limita a 80 tokens; no es un modelo de lenguaje general.
- No apto para tareas fuera de robótica de manipulación: no genera texto, no responde preguntas, no es un chat.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/khanhnd61/microvla-smoke
- Repositorio de código MicroVLA: https://github.com/khanhnd61-vr/microvla
- Dataset LIBERO en HuggingFace: https://huggingface.co/datasets/HuggingFaceVLA/libero
- Perfil del autor en HuggingFace: https://huggingface.co/khanhnd61
