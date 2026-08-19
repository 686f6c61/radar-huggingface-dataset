# ITLL/Nano.Deep.Reasoner.11m

## Resumen

Nano.Deep.Reasoner.11m es un modelo de lenguaje causal (decoder-only) de tamaño extremadamente reducido, desarrollado por el usuario ITLL y publicado en Hugging Face con licencia MIT. Su objetivo es servir como banco de pruebas experimental para arquitecturas de razonamiento explícito: el vocabulario incluye tokens de control dedicados como `<|think|>`, `<|thought|<` y `<|reasoning|>` que pretenden estructurar la generación de cadenas de pensamiento (chain-of-thought) dentro del propio texto.

El modelo cuenta con 12,7 millones de parámetros (según los pesos reales en safetensors, aunque la model card declara 11,2 millones) y una ventana de contexto de 1.096 tokens. Fue entrenado desde cero sobre el dataset `Plans11/Organized_PreTrain_1k_Context`, con un seguimiento de ejemplos mediante hashes SHA-256 para evitar duplicados. A fecha de publicación, se han procesado 20.000 ejemplos únicos en 191 pasos de optimización.

Su relevancia actual reside en ser un ejemplo accesible y reproducible de cómo incorporar señales de razonamiento en modelos pequeños, útil para investigación educativa y experimentación en entornos con recursos limitados. No obstante, el propio autor advierte que no garantiza corrección factual ni lógica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (causal LM) |
| Parametros totales | 12.703.680 (según safetensors); 11.229.120 declarados en la model card |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 1.096 tokens |
| Tipos de cuantizacion | No disponible (pesos en fp32/fp16 nativos de safetensors) |
| Idiomas soportados | No disponible (dataset no documentado) |
| Licencia | MIT |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con 6 capas, 8 cabezas de atención, dimensión oculta de 360 y tamaño intermedio de 1.440. El vocabulario está limitado a 4.096 tokens, y se emplea weight tying entre la capa de embedding y la de salida. La innovación principal es la inclusión de cinco tokens de control de razonamiento en el vocabulario (`<|input|>`, `<|think|>`, `<|thought|>`, `<|reasoning|>`, `<|answer|>`), que se utilizan durante el entrenamiento para que el modelo aprenda a estructurar sus respuestas en fases de pensamiento y respuesta.

El entrenamiento se realizó desde cero (pretraining) sobre el dataset `Plans11/Organized_PreTrain_1k_Context`, con sesiones de hasta 20.000 ejemplos nuevos por iteración. Cada ejemplo se identifica mediante un hash SHA-256 de su contenido para evitar que reordenaciones del dataset provoquen que el mismo ejemplo se entrene dos veces. El progreso actual registra 20.000 ejemplos únicos y 191 pasos globales del optimizador, lo que indica un entrenamiento muy temprano e incompleto.

## Capacidades

- Generación de texto autoregresivo básico con tokens de razonamiento estructurado (think, thought, reasoning, answer).
- Capacidad limitada de seguir el formato de entrada/salida definido por los tokens de control.
- Razonamiento simbólico simple y patrones de coherencia local, dado el tamaño reducido.
- Soporte de contexto de hasta 1.096 tokens, suficiente para tareas cortas.
- No dispone de tool calling, visión, audio ni capacidades multimodales.
- No se ha documentado soporte multilingüe; probablemente limitado al idioma del dataset de entrenamiento (no especificado).

## Casos de uso

- Investigación educativa sobre razonamiento en modelos pequeños: permite estudiar cómo los tokens de control afectan a la generación de cadenas de pensamiento en un entorno de bajo coste computacional.
- Prototipado de pipelines de razonamiento: sirve como base para probar técnicas de prompting estructurado o decodificación guiada antes de escalar a modelos mayores.
- Demostración de entrenamiento desde cero: útil para cursos de deep learning que necesiten un ejemplo completo de pretraining con seguimiento de datos y control de duplicados.
- Experimentación con vocabularios reducidos: su vocabulario de 4.096 tokens facilita el análisis de la relación entre tokenización y rendimiento en tareas simples.
- Pruebas de inferencia en hardware mínimo: puede ejecutarse en CPU o microcontroladores, lo que permite validar despliegues en entornos embebidos.
- Benchmark de técnicas de cuantización o compresión: su tamaño permite comparar métodos de cuantización con coste de recursos despreciable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen métricas de MMLU, HumanEval, GSM8K ni otras pruebas estandarizadas para este modelo.

## Requisitos de hardware

- VRAM estimada: menos de 100 MB en fp32 (12,7 M parámetros × 4 bytes ≈ 50 MB), por lo que cabe en cualquier GPU moderna e incluso en memoria de CPU.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM (p. ej., NVIDIA GTX 1050, RTX 2060, o integradas). También funciona en CPU sin problemas.
- Despliegue: al ser un modelo PyTorch con safetensors, puede servirse con frameworks estándar como Hugging Face Transformers, vLLM (aunque no está optimizado para modelos tan pequeños), llama.cpp (si se convierte a GGUF) u Ollama.
- Latencia: extremadamente baja, del orden de milisegundos por token en CPU moderna; throughput de cientos de tokens por segundo en GPU.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la misma categoría (modelos de ~12 M parámetros con tokens de razonamiento). Alternativas genéricas como GPT-2 (124 M) o TinyLlama (1.1 B) son órdenes de magnitud mayores y no comparten el enfoque experimental de razonamiento explícito. La comparativa no está disponible por falta de información pública.

## Limitaciones y advertencias

- El entrenamiento está incompleto (solo 191 pasos de optimización), por lo que el modelo no ha convergido y su comportamiento será errático.
- El autor advierte explícitamente que la arquitectura de tokens de razonamiento no garantiza corrección factual, lógica ni fiabilidad en el razonamiento.
- Contexto muy limitado (1.096 tokens), insuficiente para tareas que requieran dependencias largas.
- Vocabulario reducido (4.096 tokens) que puede provocar una tokenización ineficiente para textos fuera del dominio de entrenamiento.
- Sin benchmarks publicados, no hay evidencia objetiva de capacidades.
- Idiomas soportados no documentados; probablemente limitado al idioma del dataset de entrenamiento.
- Licencia MIT permite uso comercial sin restricciones, pero el modelo no es apto para producción dada su inmadurez.
- No hay información sobre sesgos específicos, pero al ser un modelo pequeño entrenado en un dataset no documentado, es probable que refleje sesgos del corpus.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ITLL/Nano.Deep.Reasoner.11m
- Dataset de entrenamiento: https://huggingface.co/datasets/Plans11/Organized_PreTrain_1k_Context
