# minseo25/2dsd-nanbeige4.2-3b-shared-kv

## Resumen

2DSD-nanbeige4.2-3b-shared-kv es una adaptación del modelo Nanbeige4.2-3B desarrollada por Minseo Kim (SqueezeAILab) como parte del trabajo de investigación 2DSD (Two-Dimensional Speculative Decoding for Looped Language Models). No se trata de un modelo nuevo entrenado desde cero, sino de un fine-tuning completo del modelo base Nanbeige4.2-3B (con R = 2 bucles) al que se le ha incorporado un esquema de compartición de caché KV entre bucles, con una ventana local de W = 64 tokens. El objetivo es servir como modelo objetivo (target) en el decodificador especulativo 2DSD, una técnica que explota la estructura de bucles de los modelos "looped" para acelerar la generación.

El modelo mantiene la arquitectura, el tokenizer y la plantilla de chat del modelo base Nanbeige4.2-3B, por lo que su comportamiento lingüístico y conversacional es heredado. La modificación clave es que, para tokens ya comprometidos fuera de una ventana local de 64 tokens, las consultas de todos los niveles de bucle leen una única caché KV compartida del último bucle; dentro de la ventana, cada consulta lee las entradas KV de su propio bucle. Esto reduce el coste de memoria y cómputo asociado al caché KV en modelos con múltiples bucles.

La relevancia de este modelo es fundamentalmente de investigación: permite validar y ejecutar la técnica 2DSD sobre un modelo de 3B parámetros con licencia Apache-2.0. No está pensado como un modelo generalista de producción, sino como un componente dentro del pipeline de decodificación especulativa del repositorio 2DSD. El modelo tiene 4.169.800.704 parámetros reales según los safetensors (el nombre comercial indica 3B, pero el recuento real es superior).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con bucles (looped language model), basado en Nanbeige4.2-3B con R = 2 bucles; compartición de caché KV entre bucles con ventana local W = 64 |
| Parametros totales | 4.169.800.704 (según safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (custom_code) |

## Arquitectura y entrenamiento

El modelo parte de Nanbeige4.2-3B, un modelo de lenguaje con arquitectura de bucles (R = 2 loops), y le aplica un esquema de compartición de caché KV entre bucles. En concreto, para los tokens ya comprometidos que quedan fuera de una ventana local de W = 64 tokens, las consultas de todos los niveles de bucle leen una única caché KV compartida correspondiente al último bucle. Dentro de la ventana local, cada consulta lee las entradas KV de su propio bucle, de modo que las consultas concurrentes en profundidad solo comparten entradas ya comprometidas. Además, se conserva la caché KV de la primera capa del primer bucle. El prompt se prellena una sola vez con atención por bucle.

El entrenamiento consistió en un fine-tuning completo del modelo base mediante autodestilación de dos pasadas (two-pass self-distillation) durante una época sobre 128 millones de tokens procedentes de OpenThoughts3. El proceso se ejecutó en 4 GPUs H100 durante 4,0 horas. La arquitectura, el tokenizer y la plantilla de chat se mantienen idénticos a los del modelo base. La innovación técnica principal es la regla de compartición de caché KV del último bucle, que es la que implementa el repositorio 2DSD para la decodificación especulativa.

## Capacidades

- Generación de texto y conversación: hereda las capacidades del modelo base Nanbeige4.2-3B, incluyendo generación de texto y uso conversacional según la plantilla de chat original.
- Razonamiento y matemáticas: el ejemplo de uso del repositorio incluye una pregunta aritmética ("What is the sum of the first 100 positive integers?"), lo que sugiere uso para tareas de razonamiento, aunque no se documentan resultados específicos.
- Decodificación especulativa: actúa como modelo objetivo (target) en el pipeline 2DSD, verificando con el último bucle y preservando las salidas greedy y la distribución de muestreo del modelo.
- Decodificación greedy y muestreo: por defecto usa decodificación greedy; admite muestreo con `--temperature 0.6 --top-p 0.95`.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (thinking mode, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Investigación en decodificación especulativa: el modelo se usa como target en el pipeline 2DSD para validar la técnica de compartición de caché KV entre bucles sobre un modelo de 3B parámetros. Es su caso de uso principal y está documentado explícitamente en el repositorio.
- Aceleración de inferencia en modelos con bucles: sirve para estudiar cómo la compartición de caché KV con ventana local W = 64 reduce el coste de memoria y cómputo en modelos looped, permitiendo evaluar latencia y throughput frente al modelo base sin adaptar.
- Reproducción de experimentos académicos: al estar publicado con paper y código, permite reproducir los resultados de 2DSD sobre Nanbeige4.2-3B con la configuración exacta (R = 2, W = 64, greedy por defecto).
- Evaluación de preservación de distribución: dado que 2DSD verifica con el último bucle y conserva las salidas greedy y la distribución de muestreo, el modelo sirve para comprobar que la adaptación no degrada la calidad de generación respecto al base.
- Prototipado de pipelines de generación conversacional: al mantener la plantilla de chat y el tokenizer del base, puede integrarse en prototipos conversacionales que ya usen Nanbeige4.2-3B, sustituyendo el modelo por esta variante compartida.
- Benchmarking de esquemas de caché KV: útil para comparar estrategias de compartición de caché (ventana local frente a caché completa) en términos de memoria y velocidad en GPUs de investigación como la H100.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa, un modelo de ~4,17 mil millones de parámetros en precisión completa (fp32) requeriría aproximadamente 16,7 GB solo para pesos; en bf16/fp16, unos 8,3 GB, coherente con el tamaño del repo de 8,4 GB. Estas cifras son estimaciones a partir del recuento de parámetros y no datos publicados por el autor.
- GPU recomendadas: el entrenamiento se realizó en 4 GPUs H100. Para inferencia no se especifican GPU recomendadas.
- ¿Cabe en GPU consumer? No disponible. Por tamaño de pesos en bf16 (~8,3 GB), podría caber en GPUs consumer con 12-16 GB o más, pero no hay confirmación del autor ni datos de cuantización.
- Opciones de despliegue: el repositorio 2DSD proporciona el script `scripts/generate.py` con el flag `--model nanbeige4.2-3b`. No se documentan opciones como vLLM, llama.cpp, Ollama o TGI. El modelo usa `custom_code`, lo que puede requerir cargarlo con `trust_remote_code`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| 2DSD-nanbeige4.2-3b-shared-kv | 4.169.800.704 | No disponible | Apache-2.0 | Fine-tuning con compartición de caché KV (W = 64) para decodificación especulativa 2DSD |
| Nanbeige/Nanbeige4.2-3B (base) | No disponible (modelo base) | No disponible | Apache-2.0 | Modelo original con R = 2 bucles; sin compartición de caché KV adaptada |
| Otros modelos de ~3B (p. ej. Llama-3.2-3B, Qwen2.5-3B) | ~3B | Variable | Variable | No se dispone de datos comparativos de rendimiento en la información proporcionada |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas. La comparación con el modelo base es la más directa: misma arquitectura, tokenizer y plantilla de chat, con la diferencia de la regla de compartición de caché KV del último bucle.

## Limitaciones y advertencias

- Modelo de investigación: está diseñado como componente del pipeline 2DSD, no como modelo generalista de producción. Su uso fuera de ese contexto no está documentado.
- Requiere código personalizado: usa `custom_code` y la regla de compartición de caché KV del último bucle implementada en el repositorio 2DSD; no es un modelo estándar cargable sin esa lógica.
- Idiomas soportados no documentados: no se especifica qué idiomas cubre, lo que limita su uso multilingüe en producción.
- Longitud de contexto no documentada: no se indica la ventana de contexto máxima, un dato crítico para aplicaciones de contexto largo.
- Riesgo de alucinación: no evaluado en la información disponible; como todo modelo de lenguaje, es susceptible de generar contenido incorrecto.
- Sesgos conocidos: no documentados en la información proporcionada.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se hereda la licencia del modelo base Nanbeige4.2-3B; conviene revisar los términos del base y del dataset OpenThoughts3.
- Entrenamiento limitado: una época sobre 128M tokens con autodestilación de dos pasadas; no hay datos sobre degradación respecto al base ni sobre estabilidad en dominios específicos.
- Sin datos de benchmarks: no se han publicado resultados que permitan validar la calidad frente al modelo base en tareas estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/minseo25/2dsd-nanbeige4.2-3b-shared-kv
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.2-3B
- Paper 2DSD: https://github.com/SqueezeAILab/2DSD/blob/main/paper/2DSD.pdf
- Repositorio de código 2DSD: https://github.com/SqueezeAILab/2DSD
