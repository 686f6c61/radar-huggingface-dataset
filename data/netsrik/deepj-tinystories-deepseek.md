# netsrik/deepj-tinystories-deepseek

## Resumen

DeepJ TinyStories DeepSeek es un modelo de lenguaje experimental de 1.301.120 parámetros desarrollado por netsrik y entrenado con DeepJ, una biblioteca de redes neuronales escrita en Java con diferenciación automática, tensores compartidos y ejecución en CPU con aceleración opcional mediante Apple Metal. El modelo emplea la arquitectura decoder-only Transformer denominada Prism, con 4 capas, tamaño oculto de 128 y 4 cabezas de atención, y está pensado como demostración funcional del stack de inferencia y entrenamiento de DeepJ más que como un modelo de propósito general.

Su relevancia es acotada pero concreta: sirve como referencia para quienes trabajan con ecosistemas JVM y quieren un checkpoint pequeño, ligero y ejecutable en CPU sin dependencias de Python, además de un ejemplo de integración de tokenizador BPE y caché KV a nivel de petición. El modelo se entrenó exclusivamente sobre TinyStories, un corpus sintético de cuentos infantiles en inglés, y solo soporta ese idioma.

No debe confundirse con un modelo DeepSeek de la familia oficial: el sufijo "deepseek" del nombre no implica relación con DeepSeek AI. Se trata de un checkpoint antiguo que precede al formato de configuración embebida, por lo que su arquitectura debe declararse manualmente al cargarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (DeepJ Prism) |
| Parametros totales | 1.301.120 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como valor publicado; el ejemplo de carga usa ventana de 2.048 tokens y secuencias de entrenamiento de 128 tokens |
| Tipos de cuantizacion | no disponible (checkpoint binario propio, sin variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | binario propietario `model.dj` y tokenizador `tokenizer.bpe` (formatos versionados de DeepJ); no compatible con Transformers |

## Arquitectura y entrenamiento

El modelo usa la arquitectura Prism de DeepJ, un Transformer decoder-only con 4 capas, hidden size de 128, 4 cabezas de atención, rango Q de 64 y rango KV de 32, sobre un vocabulario BPE de 2.048 tokens. La generación emplea una caché clave/valor con ámbito de petición; por defecto DeepJ la reconstruye cuando la ventana de contexto se desplaza, y existe una modalidad opcional de generación rodante que evita reconstrucciones repetidas a costa de alterar el comportamiento de la atención tras la expulsión de tokens, sin extender la capacidad de contexto entrenada.

El entrenamiento consistió en 10.000 pasos con batch size 1 y secuencias de 128 tokens sobre el dataset TinyStories (inglés sintético, licencia CDLA-Sharing-1.0). El vocabulario BPE se entrenó a partir de una muestra acotada del split de entrenamiento. No se documenta uso de RLHF, DPO ni ajuste por instrucciones. Sobre 100 ventanas deterministas de validación de TinyStories (12.800 tokens), el autor reporta loss de 2,182273 y perplexity de 8,866.

## Capacidades

- Generación de texto autoregresiva en inglés, limitada a continuaciones de estilo cuento infantil.
- Tokenizador BPE propio integrado en el ecosistema DeepJ.
- Caché KV por petición para acelerar la decodificación incremental.
- Generación rodante opcional para evitar reconstrucciones de caché en contextos largos.
- Control de muestreo mediante temperatura, top-k, máximo de tokens, semilla y penalización de repetición.
- No dispone de tool calling, function calling ni soporte de agentes.
- No dispone de modo thinking, visión, audio ni razonamiento multi-paso.
- Multilingüismo: únicamente inglés.

## Casos de uso

- Validación de pipelines JVM de inferencia: permite probar de extremo a extremo la carga de `model.dj` y `tokenizer.bpe`, la construcción de `DeepJPrismConfig` y la llamada a `TextGenerator.generate` sin salir de Java.
- Docencia y prototipado de Transformer: con 1,3 millones de parámetros y 4 capas, es adecuado para inspeccionar atención, caché KV y decodificación en un entorno controlado y reproducible.
- Pruebas de integración en CI: al ser un checkpoint minúsculo y ejecutable en CPU, sirve como fixture determinista (semilla fija) para tests de regresión de generación de texto.
- Benchmarking de la propia biblioteca DeepJ: comparar latencia y throughput entre ejecución en CPU y aceleración Apple Metal sobre una carga de trabajo fija.
- Demostraciones de generación creativa acotada: continuaciones de frases iniciales tipo "Once upon a time" con temperatura y penalización de repetición ajustables.
- Evaluación de despliegue sin Python: escenarios donde el stack de producción es JVM y no se quiere introducir un servicio Python adicional para tareas triviales de generación.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| Loss | 2,182273 | 100 ventanas deterministas de validación de TinyStories (12.800 tokens) |
| Perplexity | 8,866 | mismas condiciones |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; con 1,3 millones de parámetros el checkpoint ocupa del orden de megabytes, pero el autor no publica cifras de memoria.
- GPU recomendadas: no se especifican; DeepJ ejecuta en CPU con aceleración opcional Apple Metal.
- GPU de consumo: por tamaño, el modelo es trivial para cualquier GPU moderna, aunque no hay cifras oficiales de compatibilidad.
- Despliegue: exclusivamente mediante la biblioteca DeepJ 1.0.0 (Java, Maven `io.github.kirstenali:deepj:1.0.0`). No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / ecosistema |
|---|---|---|---|---|
| DeepJ TinyStories DeepSeek | 1.301.120 | no disponible (entrenado con secuencias de 128) | MIT | `model.dj`, Java (DeepJ) |
| Frisky 90M (mismo autor) | ~90M | no disponible | no disponible en la informacion | DeepJ, con `DeepJChat.load` e instrucciones |
| TinyStories GPT-Neo / modelos pequeños de referencia | variable (del orden de 1M-100M) | variable | variable | safetensors / Transformers |

La comparación con alternativas de la misma categoría (modelos entrenados sobre TinyStories) no está disponible con datos verificables en la información proporcionada.

## Limitaciones y advertencias

- Entrenado solo con cuentos infantiles sintéticos en inglés; el dominio y el registro están muy restringidos.
- Riesgo alto de texto incorrecto, repetitivo, sesgado o inadecuado; el autor lo advierte explícitamente.
- No evaluado para seguridad ni para uso downstream; no es un asistente de propósito general.
- Contexto entrenado muy corto (secuencias de 128 tokens); la generación rodante no amplía la capacidad de contexto aprendida.
- Checkpoint antiguo sin configuración embebida: hay que suministrar `DeepJPrismConfig` manualmente al cargar.
- Formatos binarios propietarios no compatibles con Transformers ni con herramientas estándar del ecosistema Python.
- Licencia MIT permite uso comercial, pero la calidad del modelo hace inviable su uso en producción real.
- El nombre "deepseek" no implica relación con DeepSeek AI; conviene no confundirlo en catálogos internos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netsrik/deepj-tinystories-deepseek
- Repositorio DeepJ: https://github.com/KirstenAli/DeepJ
- Release DeepJ 1.0.0: https://github.com/KirstenAli/DeepJ/releases/tag/v1.0.0
- Documentación de inferencia y generación rodante: https://github.com/KirstenAli/DeepJ/blob/master/docs/inference.md#rolling-generation
- Documentación de CLI: https://github.com/KirstenAli/DeepJ/blob/master/docs/cli.md
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Modelo Frisky 90M del mismo autor: https://huggingface.co/netsrik/frisky-90m
