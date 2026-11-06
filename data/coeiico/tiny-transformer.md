# coeiico/tiny-transformer

## Resumen

tiny-transformer es un modelo de lenguaje de tipo decoder-only, estilo GPT, construido desde cero en PyTorch por el desarrollador coeiico. No es un modelo de propósito general: se trata de un artefacto de investigación orientado a la interpretabilidad, publicado junto al repositorio de código y el análisis completo en GitHub. El modelo se entrena en una tarea sintética muy concreta, ordenar listas de 16 valores, y su interés reside en la legibilidad y la capacidad de instrumentación (hooks) del código que lo acompaña, no en su rendimiento como asistente.

El checkpoint publicado tiene 3.201.280 parámetros y una arquitectura de 4 capas. El repositorio de Hugging Face contiene varios runs independientes (tres semillas del modelo de 4 capas y un baseline bigrama sin capas), cada uno con sus pesos en safetensors, la configuración de arquitectura y vocabulario, el registro completo de entrenamiento y el análisis final. Los runs de 4 capas ordenan correctamente el 100 %, 100 % y 99,8 % de las listas de test, mientras que el baseline bigrama acierta el 0 %.

Es relevante ahora como material didáctico y de investigación: permite estudiar mecanismos internos de un transformer pequeño con resultados verificables y reproducibles, algo difícil de conseguir con modelos de gran escala. No está pensado para inferencia en producción ni para tareas de lenguaje natural.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT, 4 capas (runs default); baseline bigrama con 0 capas |
| Parametros totales | 3.201.280 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la tarea usa listas de 16 valores) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible (entrenado en una tarea sintética de ordenacion, no en lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors (con model_config.json y metrics.json por run) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only con 4 capas en los runs `default` y sin capas en el baseline `bigram`, que solo ve el token anterior. El modelo se implementa en PyTorch con un diseno explícitamente "hookable", pensado para inspeccionar activaciones y circuitos internos. Cada carpeta del repositorio corresponde a un run e incluye los pesos de evaluación, la configuración de arquitectura y vocabulario (`model_config.json`), el registro completo de entrenamiento (`metrics.json`, con configuración, semillas, definición de datos, estado del código, entorno e historial), un gráfico de diagnóstico y el análisis final en `analysis/`.

El entrenamiento se realizó sobre una única tarea sintética: ordenar listas de 16 valores. Se publican tres semillas del modelo de 4 capas (`default-seed0`, `default-seed1`, `default-seed2`) y un baseline bigrama (`bigram-seed0`). Los runs se entrenaron en CUDA sobre una RTX 3060, y una semilla fija un run a un tipo de dispositivo. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; por la naturaleza de la tarea, cabe esperar entrenamiento supervisado sobre datos generados, pero este extremo no está confirmado en la documentación consultada. Los pesos son de evaluación, no checkpoints reanudables.

## Capacidades

- Ordenación de listas de 16 valores: tarea única para la que fue entrenado; los runs de 4 capas alcanzan entre el 99,8 % y el 100 % de acierto exacto en el conjunto de test de 2.048 listas.
- Inspección de mecanismos internos: el código admite hooks para estudiar activaciones, atención y circuitos, orientado a interpretabilidad.
- Reproducibilidad: cada run incluye semilla, configuración, entorno y estado del código en `metrics.json`.
- No soporta generación de lenguaje natural, tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni capacidades multilingües, según la información disponible.
- No dispone de modo "thinking" ni de decodificación especulativa documentada.

## Casos de uso

- Investigación en interpretabilidad: cargar un run con `load_model` y aplicar hooks sobre las 4 capas para analizar cómo se representa y manipula el orden de una lista de 16 valores, con la ventaja de que el comportamiento es verificable al 100 % en test.
- Docencia de transformers: usar el código y los pesos como ejemplo mínimo y legible de un decoder-only completo, con baseline bigrama incluido para comparar el efecto de la profundidad (0 % frente a 100 %).
- Reproducción de experimentos: partir de `metrics.json` para replicar un run con la misma semilla y entorno, y contrastar el historial de entrenamiento con los resultados publicados.
- Análisis de circuitos: estudiar qué capas o cabezas de atención son responsables de la ordenación comparando los runs de distintas semillas y el baseline sin capas.
- Validación de herramientas de análisis: emplear el modelo como banco de pruebas para técnicas de probing, ablación o visualización de atención, dado su tamano reducido (3,2 M de parámetros) y su licencia MIT.
- Desarrollo de infraestructura de experimentación: integrar el paquete `tiny_transformer` en pipelines de investigación para probar utilidades de carga, hooks y registro de métricas antes de escalar a modelos mayores.

## Benchmarks y rendimiento

| Run | Configuracion | Listas ordenadas exactamente (test, 2.048 listas) |
|---|---|---|
| `default-seed0` | 4 capas, 3,2 M parametros | 100 % |
| `default-seed1` | 4 capas, 3,2 M parametros | 100 % |
| `default-seed2` | 4 capas, 3,2 M parametros | 99,8 % |
| `bigram-seed0` | baseline sin capas (solo token anterior) | 0 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 3,2 M de parámetros en safetensors, el modelo ocupa del orden de decenas de MB en precisión completa, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquiera con soporte CUDA; los runs se entrenaron en una RTX 3060. Para inferencia basta con CPU.
- Cabe en GPU consumer: sí, en cualquier modelo actual e incluso en GPUs integradas.
- Opciones de despliegue: el paquete propio `tiny_transformer` (carga vía `tiny_transformer.hub.load_model`), con PyTorch como backend. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; no se han publicado medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tiny-transformer (coeiico) | 3,2 M | no disponible | Ordenacion de listas de 16 valores | MIT | Hugging Face y GitHub |
| GPT-2 small | 124 M | 1.024 tokens | Modelado de lenguaje general | MIT | Amplia |
| nanoGPT (Karpathy) | Configurable (tipicamente ~10-124 M) | Configurable | Modelado de lenguaje / didactico | MIT | GitHub |
| TinyStories | ~1-10 M | no disponible | Generacion de cuentos simples | MIT (segun variante) | Hugging Face |

La comparación es aproximada: tiny-transformer no compite en modelado de lenguaje general, sino en legibilidad y verificabilidad de una tarea concreta. No se dispone de datos de benchmarks comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo sabe ordenar listas de 16 valores; no genera lenguaje natural ni responde a instrucciones.
- No se han documentado sesgos, pero al entrenarse en una tarea sintética no es aplicable la evaluación de sesgos habitual en modelos de lenguaje.
- Riesgo de alucinación no aplicable en el sentido convencional; el fallo se manifiesta como ordenación incorrecta (0,2 % en la peor semilla).
- Los pesos son de evaluación, no checkpoints reanudables; no permiten continuar el entrenamiento.
- Una semilla fija un run a un tipo de dispositivo (entrenados en CUDA/RTX 3060), lo que puede afectar a la reproducibilidad exacta en otro hardware.
- Licencia MIT, que permite uso comercial y modificación, pero el modelo no tiene utilidad comercial como tal por su alcance limitado.
- No hay información sobre longitud de contexto, idiomas ni cuantizaciones; no debe asumirse ninguna de estas capacidades.

## Enlaces

- Hugging Face: https://huggingface.co/coeiico/tiny-transformer
- Repositorio GitHub: https://github.com/coeiico/tiny-transformer
- Paquete de carga: `tiny_transformer` (incluido en el repositorio de GitHub)
