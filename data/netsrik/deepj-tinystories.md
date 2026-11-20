# netsrik/deepj-tinystories

## Resumen

DeepJ TinyStories es un modelo de lenguaje experimental de 1.301.120 parámetros desarrollado por netsrik y entrenado con DeepJ, una biblioteca de redes neuronales en Java con tensores compartidos, diferenciación automática y ejecución en CPU con aceleración opcional mediante Apple Metal. El modelo implementa la arquitectura Prism, un transformer decoder-only propio de DeepJ, y su propósito es demostrar el funcionamiento del stack de entrenamiento e inferencia de la biblioteca sobre un corpus controlado.

El modelo se entrenó sobre TinyStories, un conjunto de datos sintético en inglés compuesto por cuentos infantiles, y se evalúa en 100 ventanas deterministas de validación (12.800 tokens) con una pérdida de 2,182273 y una perplejidad de 8,866. No está pensado como asistente de propósito general ni como modelo de producción, sino como una pieza de referencia y validación del ecosistema DeepJ.

Su relevancia es acotada pero concreta: permite reproducir de extremo a extremo un pipeline de entrenamiento e inferencia en Java puro, sin dependencias de Python ni de la pila Transformers, con formatos binarios propios (`model.dj` y `tokenizer.bpe`) y una API de generación con caché KV por petición.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Prism, DeepJ) |
| Parámetros totales | 1.301.120 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens de entrenamiento; ventana de configuración de 2.048 tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | `model.dj` (formato binario versionado de DeepJ); tokenizador en `tokenizer.bpe` |

## Arquitectura y entrenamiento

El modelo usa la arquitectura Prism de DeepJ: un transformer decoder-only con 4 capas, tamaño oculto de 128, 4 cabezas de atención, rango de consulta (Q) de 64, rango de clave-valor (KV) de 32, vocabulario BPE de 2.048 tokens y una dimensión de feed-forward de 384 según la configuración de carga publicada. La generación emplea una caché KV con alcance de petición que, por defecto, se reconstruye cuando la ventana de contexto se desplaza; la generación rodante opcional evita reconstrucciones repetidas, aunque altera el comportamiento de la atención tras el desalojo y no amplía la capacidad de contexto aprendida.

El entrenamiento consistió en 10.000 pasos con tamaño de lote 1 y secuencias de 128 tokens sobre TinyStories, un dataset sintético en inglés con licencia CDLA-Sharing-1.0. El vocabulario BPE se entrenó a partir de una muestra acotada del split de entrenamiento. No se documenta en la información disponible el uso de RLHF, DPO ni otras fases de alineación.

## Capacidades

- Generación de texto en inglés a partir de un prefijo, con control de temperatura, top-k, máximo de tokens, semilla y penalización por repetición.
- Modelado de secuencias cortas de estilo narrativo infantil, coherente con la distribución de TinyStories.
- Inferencia en CPU con aceleración opcional en Apple Metal a través de DeepJ.
- Caché KV por petición y generación rodante opcional para reducir reconstrucciones de contexto.
- Carga de pesos y tokenizador mediante formatos binarios propios de DeepJ (`model.dj`, `tokenizer.bpe`).
- No dispone de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo de pensamiento.
- Multilingüismo: únicamente inglés.

## Casos de uso

- Validación de la pila DeepJ: sirve como modelo de referencia para comprobar que la carga de checkpoints, el tokenizador BPE y la generación funcionan correctamente tras cambios en la biblioteca.
- Pruebas de integración en proyectos Java: permite montar tests end-to-end de generación de texto sin salir de la JVM ni depender de Python.
- Docencia y demostraciones de transformers: con 1,3 millones de parámetros y 4 capas, es adecuado para explicar atención, caché KV y muestreo en un entorno controlado.
- Generación de cuentos sintéticos cortos: dado su entrenamiento en TinyStories, produce continuaciones narrativas simples en inglés para prototipos y experimentos.
- Benchmarking de infraestructura: al ser determinista con semilla fija y tener una perplejidad de referencia publicada (8,866), permite comparar rendimiento de CPU frente a Metal en tareas de inferencia.
- Pruebas de estrategias de decodificación: su API expone temperatura, top-k y penalización por repetición, lo que facilita experimentar con muestreo en un modelo pequeño y rápido.

## Benchmarks y rendimiento

| Métrica | Valor | Conjunto de evaluación |
|---|---|---|
| Pérdida | 2,182273 | 100 ventanas deterministas de validación de TinyStories (12.800 tokens) |
| Perplejidad | 8,866 | 100 ventanas deterministas de validación de TinyStories (12.800 tokens) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en precisión de 32 bits para los 1,3 millones de parámetros; el modelo está diseñado para ejecución en CPU.
- GPU recomendadas: no requiere GPU; opcionalmente Apple Metal en equipos Apple Silicon. No se documenta soporte de CUDA.
- Cabe en cualquier GPU de consumo e incluso en entornos sin GPU dedicada.
- Opciones de despliegue: exclusivamente la biblioteca DeepJ (versión 1.0.0) en Java; no es compatible con vLLM, llama.cpp, Ollama, TGI ni con la librería Python Transformers.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / ecosistema |
|---|---|---|---|---|
| DeepJ TinyStories | 1.301.120 | 128 tokens de entrenamiento (ventana de 2.048) | MIT | `model.dj` / DeepJ (Java) |
| Modelos TinyStories de referencia (p. ej., variantes GPT-Neo de ~1M-10M) | ~1M-10M | variable | variable | safetensors / Transformers (Python) |
| Frisky 90M (mismo autor) | ~90M | no disponible | no disponible | DeepJ, con API `DeepJChat.load` y CLI |

No se dispone de datos de rendimiento comparables de terceros en la información proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente con cuentos infantiles sintéticos en inglés; el dominio y el idioma están muy acotados.
- Puede producir texto incorrecto, repetitivo, sesgado o inapropiado; no ha sido evaluado para seguridad ni para uso downstream.
- No es un asistente de propósito general y no admite instrucciones, tool calling ni razonamiento multi-paso.
- El contexto entrenado es de 128 tokens; la ventana de configuración de 2.048 no implica capacidad aprendida más allá de ese rango.
- El checkpoint es anterior a la inclusión de la configuración de arquitectura embebida, por lo que hay que suministrarla manualmente al cargar.
- Los formatos `model.dj` y `tokenizer.bpe` no son cargables directamente por la librería Python Transformers.
- No se documentan opciones de cuantización ni soporte CUDA.
- Licencia MIT: permite uso comercial, pero la calidad y la seguridad del modelo no están garantizadas para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netsrik/deepj-tinystories
- Repositorio DeepJ: https://github.com/KirstenAli/DeepJ
- Release DeepJ 1.0.0: https://github.com/KirstenAli/DeepJ/releases/tag/v1.0.0
- Documentación de inferencia y generación rodante: https://github.com/KirstenAli/DeepJ/blob/master/docs/inference.md#rolling-generation
- Documentación de la CLI de DeepJ: https://github.com/KirstenAli/DeepJ/blob/master/docs/cli.md
- Modelo Frisky 90M (mismo autor): https://huggingface.co/netsrik/frisky-90m
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
