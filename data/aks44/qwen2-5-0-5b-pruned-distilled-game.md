# Aks44/qwen2.5-0.5b-pruned-distilled-game

## Resumen

Aks44/qwen2.5-0.5b-pruned-distilled-game es un modelo de lenguaje derivado de Qwen/Qwen2.5-0.5B-Instruct, desarrollado por Aks44 como parte de un proyecto de optimización de inferencia para personajes virtuales interactivos en tiempo real. El modelo fue comprimido mediante poda y destilación de conocimiento: se eliminaron 5 de las 24 capas del transformer original y, al comprobar que la poda por sí sola rompía el modelo, se aplicó destilación usando el modelo original como profesor.

El resultado es un transformer de 19 capas con 419.470.848 parámetros. Según el autor, el checkpoint final es aproximadamente un 35% más rápido que el modelo base en CPU con precisión fp32 y recupera la coherencia conversacional perdida tras la poda. La longitud de contexto no está documentada en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basado en Qwen2.5, con 19 capas tras poda (de las 24 originales) |
| Parámetros totales | 419.470.848 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen2.5-0.5B-Instruct, un transformer decoder-only de 24 capas. El autor midió la importancia de cada capa de forma empírica: cada capa fue bypassada individualmente y el cambio en la salida se evaluó mediante similitud coseno contra el modelo sin modificar. Esto permitió crear un ranking de capas "seguras" de eliminar. Se eliminaron 5 capas, dejando 19. Sin embargo, la poda rompió el modelo: este dejó de seguir instrucciones básicas y perdió su rol.

Para restaurar la coherencia, el autor aplicó destilación de conocimiento (knowledge distillation) con pérdida de divergencia KL y etiquetas blandas escaladas por temperatura, utilizando el modelo original de 24 capas como profesor. Los datos de destilación consisten en un conjunto pequeño de ejemplos generados por el profesor, sin más detalle sobre el tamaño o composición del dataset. No se mencionan procesos de RLHF ni DPO.

## Capacidades

- Generación de texto conversacional coherente para diálogos de personajes virtuales, tras la destilación.
- Mantenimiento del rol y del carácter ("on-character") en conversaciones, según el autor.
- Optimizado para inferencia en CPU con fp32, con una latencia de 74,7 ms/token en el hardware de referencia del autor.
- No se ha evaluado en tareas de propósito general: razonamiento, matemáticas, generación de código o benchmarks estándar no están documentados.
- Sin soporte documentado de tool calling, visión ni audio.
- Capacidades multilingües no especificadas en la ficha del modelo.

## Casos de uso

- NPCs en videojuegos con diálogo dinámico: el modelo puede generar respuestas en tiempo real y pasarlas a un sistema de TTS, aprovechando la baja latencia en CPU y la capacidad de mantener el personaje durante la conversación.
- Simulaciones de entrenamiento con personajes virtuales: puede usarse en ejercicios de role-playing (por ejemplo, práctica de entrevistas o negociaciones) sin necesidad de GPU, ejecutándose en un servidor local con CPU.
- Avatares interactivos en museos o exposiciones: como agente conversacional que responde sobre el contenido de la exposición, desplegado en hardware de bajo consumo.
- Chatbots de rol para juegos de texto: el tamaño reducido permite alojar el modelo en un pequeño servidor y gestionar varios usuarios simultáneos con recursos limitados.
- Asistentes de voz en dispositivos de borde: combinando el modelo con reconocimiento de voz y síntesis, se puede construir un asistente conversacional con latencia razonable para interacciones cortas.
- Prototipos de investigación en compresión de modelos: permite analizar el impacto de la poda y la destilación sobre un modelo instruct real, comparando coherencia y rendimiento con el modelo original.
- Integración en motores de juego mediante un servidor local: el formato safetensors facilita la carga con Transformers/PyTorch y su exposición como API de texto para motores como Unity o Godot.

## Benchmarks y rendimiento

| Etapa | Capas | TPOT (ms/token) | Coherencia |
|---|---|---|---|
| Baseline (Qwen2.5-0.5B-Instruct original) | 24 | 114,4 | Coherente |
| Podado sin destilación | 19 | 71,1 | Roto — confuso, fuera de personaje |
| Este checkpoint (podado + destilado) | 19 | 74,7 | Recuperado — coherente, en personaje |

El autor indica que el checkpoint final es aproximadamente un 35% más rápido que el modelo original. No se han publicado resultados de benchmarks de tareas generales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,68 GB en fp32 (419.470.848 parámetros × 4 bytes), más el overhead del framework. En la práctica, se recomienda disponer de al menos 2 GB de memoria para la inferencia.
- GPU recomendada: no disponible; el autor no ha publicado datos de rendimiento en GPU. Dado el tamaño del modelo, es plausible ejecutarlo en GPUs de consumo, pero no hay resultados que lo confirmen.
- CPU es el objetivo declarado: el autor evaluó el modelo en CPU con fp32, con un tiempo por token de 74,7 ms.
- Opciones de despliegue: no documentadas por el autor. El formato safetensors permite cargarlo con Hugging Face Transformers y PyTorch. Para una implementación en CPU, sería necesario convertir a GGUF y usar llama.cpp u Ollama, aunque no se han publicado dichos artefactos.
- Latencia: 74,7 ms/token en CPU fp32, según el autor. Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Aks44/qwen2.5-0.5b-pruned-distilled-game | 419.470.848 | No disponible | Apache 2.0 | Hugging Face |
| Qwen/Qwen2.5-0.5B-Instruct (base) | No disponible en la información | No disponible | Apache 2.0 | Hugging Face |

La comparación directa se basa en los resultados reportados por el autor: este modelo alcanza 74,7 ms/token en CPU fp32 frente a los 114,4 ms/token del modelo base, con coherencia conversacional restaurada. No se han identificado otras alternativas podadas o destiladas de la misma categoría en la información disponible.

## Limitaciones y advertencias

- El autor indica que el modelo no se ha evaluado para tareas de propósito general más allá de la coherencia conversacional. No existen resultados de benchmarks como MMLU, HumanEval ni GSM8K.
- La poda de 5 capas rompió el modelo inicialmente; la destilación logró recuperarlo, pero esto no garantiza que el comportamiento sea completamente equivalente al modelo original en escenarios complejos.
- La longitud de contexto no está documentada, por lo que se desconoce si el modelo mantiene la coherencia en conversaciones largas.
- Los idiomas soportados no están especificados. Es probable que herede cierta capacidad multilingüe del modelo base, pero no hay confirmación.
- Licencia Apache 2.0: permite uso comercial y modificación, pero al ser una obra derivada de Qwen/Qwen2.5-0.5B-Instruct deben respetarse los términos de la licencia original.
- Riesgo de alucinación no evaluado. En aplicaciones de personajes virtuales puede ser necesario implementar filtros adicionales para evitar respuestas fuera de personaje o incoherentes.
- Sesgos presentes en el modelo base no han sido evaluados en esta versión podada y destilada.

## Enlaces

- https://huggingface.co/Aks44/qwen2.5-0.5b-pruned-distilled-game
- https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- https://huggingface.co/collections/Qwen/qwen25
